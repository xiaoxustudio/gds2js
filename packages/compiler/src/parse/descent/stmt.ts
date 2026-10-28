import { parseExpression, parseRhs, parseType } from "./expr";
import { GdSyntaxError, SENTENCES } from "./diag";
import type { Parser } from "./state";
import type { CsNode } from "../cst";
import {
  parseAnnotation,
  parseAnnotationRun,
  parseClassDefinition,
  parseClassName,
  parseConst,
  parseEnumDefinition,
  parseExtends,
  parseFunction,
  parseSignal,
  parseVariable,
} from "./decl";
import type { Pos } from "./builder";
import type { Tok } from "./tokens";

const AUG_OPS = ["+=", "-=", "*=", "/=", "**=", "%=", ">>=", "<<=", "&=", "^=", "|="];

const after = (t: Tok): Pos => ({ index: t.end, row: t.row, col: t.col + (t.end - t.start) });

/**
 * 冒号之后的块体。块体形与内联形的起点不同，这是 oracle 的硬事实：
 * 块体形的 `body` 起点在**冒号末尾**（隐藏的 `_indent` 是零宽记号，扫描从冒号后就开始），
 * 内联形的起点就是第一条语句的起点。实测 `func f():` 的 `body@1:9`（冒号在 1:8），
 * 而 `func(p): return p` 的 `body@12:18`（`return` 的位置）。
 */
export function parseBody(p: Parser, field: string, colon: Tok, nodeType = "body"): boolean {
  const b = p.b;
  const tail = p.flushExtrasOnRow(colon.row);
  const start = tail === null ? after(colon) : after(tail);
  if (!p.c.openBlock()) {
    // 内联体只在「身体与冒号同行」时成立。`if true:` 换行接同缩进的 `quit()` 时 oracle 给的是
    // **空** body（起点在冒号末尾，孩子 0 个），不是把下一行的语句当内联体吃进来。
    const sameLine = !p.atEof() && !p.atBodyEnd() && p.peek().row === colon.row;
    b.open(nodeType, sameLine ? null : after(colon));
    if (sameLine) {
      p.flush();
      parseStatementLine(p, nodeType === "class_body");
    }
    b.close(field);
    return false;
  }
  b.open(nodeType, start);
  for (;;) {
    if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
    p.flush();
    if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
    parseStatementLine(p, nodeType === "class_body");
    p.flush();
  }
  b.close(field);
  p.c.closeBlock();
  return true;
}

/** 一行上可以用 `;` 串多条简单语句；分号属于隐藏规则 `_simple_statements`，所以挂在块体上。 */
export function parseStatementLine(p: Parser, members: boolean): void {
  parseStatement(p, "", members);
  while (p.atPunct(";") && !p.atLineHead()) {
    p.b.anon(p.take(), "");
    if (p.atEof() || p.atLineHead()) return;
    parseStatement(p, "", members);
  }
}

const DECL_WORDS = new Set(["var", "const", "signal", "class_name", "class", "func", "static"]);

export function parseStatement(p: Parser, field: string, members = false): void {
  const b = p.b;
  const t = p.peek();

  if (t.kind === "region-start") {
    b.open("region_start");
    b.anon(p.take(), "");
    if (p.atKind("region-label")) b.leaf("region_label", p.take(), "");
    b.close(field);
    return;
  }
  if (t.kind === "region-end") {
    b.leaf("region_end", p.take(), field);
    return;
  }
  if (t.kind === "punct" && t.text === "@") {
    const anns = parseAnnotationRun(p);
    const n = p.peek();
    if (!p.atLineHead() && n.kind === "ident" && DECL_WORDS.has(n.text)) {
      parseDecl(p, field, anns, members);
      return;
    }
    for (const a of anns) b.attach(a, "");
    return;
  }
  if (t.kind === "ident") {
    switch (t.text) {
      case "if":
        parseIf(p, field);
        return;
      case "for":
        parseFor(p, field);
        return;
      case "while":
        parseWhile(p, field);
        return;
      case "match":
        parseMatch(p, field);
        return;
      case "enum":
        parseEnumDefinition(p, field);
        return;
      case "return":
        b.open("return_statement");
        b.anon(p.take(), "");
        if (p.atOperand()) parseRhs(p, "");
        b.close(field);
        return;
      case "pass":
      case "break":
      case "continue":
        b.open(`${t.text}_statement`);
        b.anon(p.take(), "");
        b.close(field);
        return;
      case "breakpoint":
        b.leaf("breakpoint_statement", p.take(), field);
        return;
      default:
        parseDecl(p, field, [], members);
        return;
    }
  }
  parseExpressionStatement(p, field);
}

function parseDecl(p: Parser, field: string, anns: CsNode[], members: boolean): void {
  const t = p.peek();
  if (t.kind !== "ident") {
    parseExpressionStatement(p, field);
    return;
  }
  switch (t.text) {
    case "func":
      parseFunction(p, field, anns, null, members);
      return;
    case "static":
      if (p.atWord("func", 1)) {
        const kw = p.take();
        parseFunction(p, field, anns, kw, members);
        return;
      }
      parseVariable(p, field, anns, members);
      return;
    case "class":
      parseClassDefinition(p, field, anns);
      return;
    case "class_name":
      parseClassName(p, field, anns);
      return;
    case "extends":
      parseExtends(p, field, anns);
      return;
    case "signal":
      parseSignal(p, field, anns);
      return;
    case "const":
      parseConst(p, field, anns);
      return;
    case "var":
    case "onready":
    case "export":
      parseVariable(p, field, anns, members);
      return;
    default:
      if (members) p.fail(["类成员"], "class-node");
      parseExpressionStatement(p, field);
      return;
  }
}

function parseExpressionStatement(p: Parser, field: string): void {
  const b = p.b;
  const mark = b.mark();
  parseExpression(p, "");
  if (!p.atLineHead()) {
    if (p.atPunct("=")) {
      const left = b.spliceFrom(mark);
      b.open("assignment");
      b.attach(left, "left");
      b.anon(p.take(), "");
      parseRhs(p, "right");
      b.close("");
      wrap(p, field);
      return;
    }
    if (AUG_OPS.some((op) => p.atPunct(op))) {
      const left = b.spliceFrom(mark);
      b.open("augmented_assignment");
      b.attach(left, "left");
      b.anon(p.take(), "op");
      parseRhs(p, "right");
      b.close("");
      wrap(p, field);
      return;
    }
  }
  b.setLastField("");
  wrap(p, field);
}

function wrap(p: Parser, field: string): void {
  const b = p.b;
  const inner = b.liftLast();
  b.open("expression_statement");
  b.attach(inner, "");
  b.close(field);
}

function parseIf(p: Parser, field: string): void {
  const b = p.b;
  b.open("if_statement");
  b.anon(p.expectWord("if", "if"), "");
  parseExpression(p, "condition");
  const colon = p.expectPunct(":", "if");
  b.anon(colon, "");
  const block = parseBody(p, "body", colon);
  if (block) {
    for (;;) {
      if (p.atWord("elif") && p.atLineHead()) {
        b.open("elif_clause");
        b.anon(p.take(), "");
        parseExpression(p, "condition");
        const c2 = p.expectPunct(":", "elif");
        b.anon(c2, "");
        parseBody(p, "body", c2);
        b.close("alternative");
        continue;
      }
      if (p.atWord("else") && p.atLineHead()) {
        b.open("else_clause");
        b.anon(p.take(), "");
        const c2 = p.expectPunct(":", "else");
        b.anon(c2, "");
        parseBody(p, "body", c2);
        b.close("alternative");
      }
      break;
    }
  }
  b.close(field);
}

function parseFor(p: Parser, field: string): void {
  const b = p.b;
  b.open("for_statement");
  b.anon(p.expectWord("for", "for"), "");
  if (!p.atKind("ident")) p.fail(["循环变量"], "for");
  b.leaf("identifier", p.take(), "left");
  if (p.atPunct(":")) {
    b.anon(p.take(), "");
    parseType(p, "type");
  }
  b.anon(p.expectWord("in", "for"), "");
  parseExpression(p, "right");
  const colon = p.expectPunct(":", "for");
  b.anon(colon, "");
  parseBody(p, "body", colon);
  b.close(field);
}

function parseWhile(p: Parser, field: string): void {
  const b = p.b;
  b.open("while_statement");
  b.anon(p.expectWord("while", "while"), "");
  parseExpression(p, "condition");
  const colon = p.expectPunct(":", "while");
  b.anon(colon, "");
  parseBody(p, "body", colon);
  b.close(field);
}

function parseMatch(p: Parser, field: string): void {
  const b = p.b;
  b.open("match_statement");
  const kw = p.expectWord("match", "match");
  b.anon(kw, "");
  // 表头族（主题缺表达式 / 主题后缺冒号 / 后面没有缩进块）引擎点名的都是 `match` 那一行。
  try {
    parseExpression(p, "value");
  } catch (e) {
    throw remark(e, SENTENCES.matchSubjectExpr, kw.row);
  }
  let colon: Tok;
  try {
    colon = p.expectPunct(":", "match");
  } catch (e) {
    throw remark(e, SENTENCES.matchSubjectColon, kw.row);
  }
  b.anon(colon, "");
  b.open("match_body", after(colon));
  if (!p.c.openBlock()) p.fail(["缩进的手臂"], "match", SENTENCES.matchEmptyBlock, kw.row);
  for (;;) {
    if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
    p.flush();
    if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
    while (p.atPunct("@")) parseAnnotation(p, "");
    parsePatternSection(p);
    p.flush();
  }
  b.close("body");
  p.c.closeBlock();
  b.close(field);
}

/**
 * 手臂族一律报**首个 pattern 那一行**，不是失败点那一行。十条语料用例逐条量过：
 * 434/435 的手臂在第 5 行、失败点在下一行的 `print`；436 的第二条手臂在第 7 行；
 * 437 的 `1 when` 在第 5 行、失败点却跑到第 7 行的 `quit`。四条都归到「首 pattern 行」这一个规则上。
 */
function parsePatternSection(p: Parser): void {
  const b = p.b;
  const armRow = p.peek().row;
  b.open("pattern_section");
  try {
    for (;;) {
      if (p.atWord("var")) {
        b.open("pattern_binding");
        b.anon(p.take(), "");
        if (!p.atKind("ident")) p.fail(["绑定名"], "pattern", SENTENCES.matchPatternExpr);
        b.leaf("identifier", p.take(), "");
        b.close("");
      } else {
        parsePatternExpr(p, SENTENCES.matchPatternExpr);
      }
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (!patternExprAhead(p)) p.fail(["表达式"], "pattern", SENTENCES.matchPatternExpr);
    }
    let guarded = false;
    if (p.atWord("when")) {
      guarded = true;
      b.open("pattern_guard");
      b.anon(p.take(), "");
      // `1 when` 后面换行接身体时，别让身体被当成守卫表达式粘走 —— 引擎那一句是
      // `Expected expression for pattern guard after "when".`（437-pattern-guard-empty 第 5 行）。
      if (!patternExprAhead(p)) p.fail(["表达式"], "pattern", SENTENCES.matchGuardExpr);
      parsePatternExpr(p, SENTENCES.matchGuardExpr);
      b.close("");
    }
    const want = guarded ? SENTENCES.matchGuardColon : SENTENCES.matchPatternsColon;
    if (!p.atPunct(":")) p.fail(['":"'], "match", want);
    const colon = p.take();
    b.anon(colon, "");
    parseBody(p, "body", colon);
  } catch (e) {
    throw retrack(e, armRow);
  }
  b.close("");
}

/** 逗号之后还跟不跟一个 pattern。428 的 `1,:` 就卡在这里，引擎那一句是 `Expected expression for match pattern.`。 */
function patternExprAhead(p: Parser): boolean {
  if (p.atEof()) return false;
  if (p.atLineHead() && p.deeperThanBlock()) return false;
  if (p.atPunct(":") || p.atPunct(",") || p.atPunct(")") || p.atPunct("]") || p.atPunct("}")) return false;
  return true;
}

function parsePatternExpr(p: Parser, sentence: string): void {
  try {
    parseExpression(p, "");
  } catch (e) {
    throw resentence(e, sentence);
  }
}

function retrack(e: unknown, reportRow: number): unknown {
  if (e instanceof GdSyntaxError) {
    e.issue.reportRow = reportRow;
    return e;
  }
  return e;
}

function remark(e: unknown, sentence: string, reportRow: number): unknown {
  if (e instanceof GdSyntaxError) {
    if (e.issue.sentence === "") e.issue.sentence = sentence;
    e.issue.reportRow = reportRow;
    return e;
  }
  return e;
}

function resentence(e: unknown, sentence: string): unknown {
  if (e instanceof GdSyntaxError) {
    if (e.issue.sentence === "") e.issue.sentence = sentence;
    return e;
  }
  return e;
}

/** lambda：`func` [名字] 参数 [`->` 类型] `:` 块体。grammar.js:894-902。 */
export function parseLambda(p: Parser, field: string): void {
  const b = p.b;
  b.open("lambda");
  b.anon(p.expectWord("func", "lambda"), "");
  if (p.atKind("ident") && p.atPunct("(", 1)) b.leaf("name", p.take(), "name");
  parseParametersOf(p);
  if (p.atPunct("->")) {
    b.anon(p.take(), "");
    parseType(p, "return_type");
  }
  const colon = p.expectPunct(":", "lambda");
  b.anon(colon, "");
  parseBody(p, "body", colon);
  b.close(field);
}

export function parseParametersOf(p: Parser): void {
  const b = p.b;
  b.open("parameters");
  b.anon(p.expectPunct("(", "parameters"), "");
  if (!p.atPunct(")")) {
    for (;;) {
      b.flush();
      parseParameter(p);
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (p.atPunct(")")) break;
    }
  }
  b.flush();
  b.anon(p.expectPunct(")", "parameters"), "");
  b.close("parameters");
}

function parseParameter(p: Parser): void {
  const b = p.b;
  if (p.atPunct("...")) {
    b.open("variadic_parameter");
    b.anon(p.take(), "");
    parseParameter(p);
    b.close("");
    return;
  }
  if (!p.atKind("ident")) p.fail(["形参名"], "parameters");
  const name = p.take();
  if (p.atPunct(":=") || (p.atPunct(":") && p.atPunct("=", 1))) {
    b.open("typed_default_parameter");
    b.leaf("identifier", name, "");
    b.open("inferred_type");
    if (p.atPunct(":=")) b.anon(p.take(), "");
    else {
      b.anon(p.take(), "");
      b.anon(p.expectPunct("=", "parameters"), "");
    }
    b.close("type");
    parseRhs(p, "value");
    b.close("");
    return;
  }
  if (p.atPunct(":")) {
    const defaulted = paramHasDefault(p);
    b.open(defaulted ? "typed_default_parameter" : "typed_parameter");
    b.leaf("identifier", name, "");
    b.anon(p.take(), "");
    parseType(p, "type");
    if (defaulted) {
      b.anon(p.expectPunct("=", "parameters"), "");
      parseRhs(p, "value");
    }
    b.close("");
    return;
  }
  if (p.atPunct("=")) {
    b.open("default_parameter");
    b.leaf("identifier", name, "");
    b.anon(p.take(), "");
    parseRhs(p, "value");
    b.close("");
    return;
  }
  b.leaf("identifier", name, "");
}

/** 类型里可以带 `Array[int]` 这种下标，所以要按括号深度扫到 `,` / `)` 为止再判断有没有默认值。 */
function paramHasDefault(p: Parser): boolean {
  let depth = 0;
  for (let k = 1; k < 64; k++) {
    const t = p.peek(k);
    if (t.kind === "eof") return false;
    if (t.kind !== "punct") continue;
    if (t.text === "(" || t.text === "[" || t.text === "{") {
      depth++;
      continue;
    }
    if (t.text === ")" || t.text === "]" || t.text === "}") {
      if (depth === 0) return false;
      depth--;
      continue;
    }
    if (depth > 0) continue;
    if (t.text === ",") return false;
    if (t.text === "=") return true;
  }
  return false;
}
