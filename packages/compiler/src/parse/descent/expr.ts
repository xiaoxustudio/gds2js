import type { Tok } from "./tokens";
import type { Parser } from "./state";
import { parseLambda } from "./stmt";

/**
 * grammar.js:1-24 的 PREC 阶梯，一处刻意偏离：`**` 从 `PREC.times` 抬到独立一层、仍在 times 之上。
 * tree-sitter 把 `**` 与 `*` `/` `%` 同层左结合，于是 `2 * 3 ** 2` 被解成 `(2*3)**2`，
 * 而 Godot 4.6.3 实测是 18（`corpus/cases/280-pow-precedence` p02），靠 `lower/lower.ts:763-803`
 * 的 MUL_LEVEL 重爬补偿。这里直接产出正确的树，那段补偿机器随之退化。
 * `**` 本身仍是**左**结合：Godot 实测 `2 ** 3 ** 2 == 64`（`004-power-associativity`、280 的 p10/p11/p24）。
 */
const BP = { or: 3, and: 4, in: 5, compare: 6, bitOr: 7, bitAnd: 8, xor: 9, shift: 10, plus: 11, times: 12, power: 13, unary: 14, is: 15, as: 16 };

const INFIX: Record<string, number> = {
  "||": BP.or,
  or: BP.or,
  "&&": BP.and,
  and: BP.and,
  in: BP.in,
  "<": BP.compare,
  "<=": BP.compare,
  "==": BP.compare,
  "!=": BP.compare,
  ">=": BP.compare,
  ">": BP.compare,
  "|": BP.bitOr,
  "&": BP.bitAnd,
  "^": BP.xor,
  "<<": BP.shift,
  ">>": BP.shift,
  "+": BP.plus,
  "-": BP.plus,
  "*": BP.times,
  "/": BP.times,
  "%": BP.times,
  "**": BP.power,
  is: BP.is,
  as: BP.as,
};

const PREFIX = new Set(["-", "+", "~", "!"]);

type Infix = { bp: number; toks: Tok[] };

function infixAt(p: Parser): Infix | null {
  const t = p.peek();
  if (t.kind !== "punct" && t.kind !== "ident") return null;
  if (t.text === "not" && p.peek(1).text === "in" && p.peek(1).kind === "ident") return { bp: BP.in, toks: [t, p.peek(1)] };
  if (t.text === "is" && p.peek(1).text === "not" && p.peek(1).kind === "ident") return { bp: BP.is, toks: [t, p.peek(1)] };
  const bp = INFIX[t.text];
  return bp === undefined ? null : { bp, toks: [t] };
}

/** `_expression`：二元爬升之外再套一层三元。三元是 `prec.right(-1)`，所以只在最外层结合，且右支递归。 */
export function parseExpression(p: Parser, field: string): void {
  const b = p.b;
  parseBinary(p, 0);
  if (!p.atWord("if") || p.atLineHead()) {
    b.setLastField(field);
    return;
  }
  const left = b.liftLast();
  b.open("conditional_expression");
  b.attach(left, "left");
  b.anon(p.take(), "");
  parseExpression(p, "condition");
  b.anon(p.expectWord("else", "ternary"), "");
  parseExpression(p, "right");
  b.close(field);
}

function parseBinary(p: Parser, minBp: number): void {
  const b = p.b;
  parseUnary(p);
  for (;;) {
    if (p.atLineHead()) return;
    const inf = infixAt(p);
    if (inf === null || inf.bp < minBp) return;
    const left = b.liftLast();
    b.open("binary_operator");
    b.attach(left, "left");
    for (const t of inf.toks) {
      p.take();
      b.anon(t, "op");
    }
    parseBinary(p, inf.bp + 1);
    b.setLastField("right");
    b.close("");
  }
}

function parseUnary(p: Parser): void {
  const b = p.b;
  const t = p.peek();
  const isPrefix = (t.kind === "punct" && PREFIX.has(t.text)) || (t.kind === "ident" && t.text === "not");
  if (!isPrefix) {
    parsePostfix(p);
    return;
  }
  b.open("unary_operator");
  b.anon(p.take(), "");
  parseBinary(p, BP.unary);
  b.close("");
}

function parsePostfix(p: Parser): void {
  const b = p.b;
  parseAtom(p);
  for (;;) {
    if (p.atLineHead()) return;
    if (p.atPunct(".")) {
      const base = b.liftLast();
      b.open("attribute");
      b.attach(base, "");
      do {
        b.anon(p.take(), "");
        parseAttributeMember(p);
      } while (p.atPunct(".") && !p.atLineHead());
      b.close("");
      continue;
    }
    if (p.atPunct("(")) {
      const callee = b.liftLast();
      b.open("call");
      b.attach(callee, "");
      parseArguments(p, "arguments");
      b.close("");
      continue;
    }
    if (p.atPunct("[")) {
      const target = b.liftLast();
      b.open("subscript");
      b.attach(target, "");
      parseSubscriptArguments(p, "arguments");
      b.close("");
      continue;
    }
    return;
  }
}

/** `.member` 之后紧跟 `(` 是 `attribute_call`、紧跟 `[` 是 `attribute_subscript`，否则就是个 `identifier`。 */
function parseAttributeMember(p: Parser): void {
  const b = p.b;
  const t = p.peek();
  if (t.kind !== "ident") p.fail(["成员名"], "attribute");
  if (p.atPunct("(", 1)) {
    b.open("attribute_call");
    b.leaf("identifier", p.take(), "");
    parseArguments(p, "arguments");
    b.close("");
    return;
  }
  if (p.atPunct("[", 1)) {
    b.open("attribute_subscript");
    b.leaf("identifier", p.take(), "");
    parseSubscriptArguments(p, "arguments");
    b.close("");
    return;
  }
  b.leaf("identifier", p.take(), "");
}

export function parseArguments(p: Parser, field: string): void {
  const b = p.b;
  b.open("arguments");
  b.anon(p.expectPunct("(", "arguments"), "");
  if (!p.atPunct(")")) {
    for (;;) {
      b.flush();
      parseRhs(p, "");
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (p.atPunct(")")) break;
    }
  }
  b.flush();
  b.anon(p.expectPunct(")", "arguments"), "");
  b.close(field);
}

export function parseSubscriptArguments(p: Parser, field: string): void {
  const b = p.b;
  b.open("subscript_arguments");
  b.anon(p.expectPunct("[", "subscript"), "");
  for (;;) {
    b.flush();
    parseRhs(p, "");
    if (!p.atPunct(",")) break;
    b.anon(p.take(), "");
  }
  b.flush();
  b.anon(p.expectPunct("]", "subscript"), "");
  b.close(field);
}

/** `_rhs_expression`：`_expression` 或 lambda。 */
export function parseRhs(p: Parser, field: string): void {
  if (p.atWord("func")) {
    parseLambda(p, field);
    return;
  }
  parseExpression(p, field);
}

function parseAtom(p: Parser): void {
  const b = p.b;
  const t = p.peek();

  if (t.kind === "int") {
    b.leaf("integer", p.take(), "");
    return;
  }
  if (t.kind === "float") {
    b.leaf("float", p.take(), "");
    return;
  }
  if (t.kind === "str-start") {
    parseString(p, "");
    return;
  }
  if (t.kind === "ident") {
    if (t.text === "true" || t.text === "false" || t.text === "null") {
      b.leaf(t.text, p.take(), "");
      return;
    }
    if (t.text === "await") {
      b.open("await_expression");
      b.anon(p.take(), "");
      parseExpression(p, "");
      b.close("");
      return;
    }
    if (t.text === "func") {
      parseLambda(p, "");
      return;
    }
    b.leaf("identifier", p.take(), "");
    return;
  }
  if (t.kind === "punct") {
    switch (t.text) {
      case "(":
        b.open("parenthesized_expression");
        b.anon(p.take(), "");
        b.flush();
        parseRhs(p, "");
        b.flush();
        b.anon(p.expectPunct(")", "paren"), "");
        b.close("");
        return;
      case "[":
        parseArray(p, "");
        return;
      case "{":
        parseDictionary(p, "");
        return;
      case ".":
        b.open("base_call");
        b.anon(p.take(), "");
        b.leaf("identifier", p.take(), "");
        parseArguments(p, "arguments");
        b.close("");
        return;
      case "$":
      case "%":
        parseGetNode(p, "");
        return;
      default:
        break;
    }
  }
  p.fail(["表达式"], "expr");
}

/** 字符串三族靠起始定界符的原文分流：`&"` 是 StringName、`^"` 与 `@"` 是 NodePath，其余是 String。
 *  纯内容在 CST 里不落节点（`_string_content` 是隐藏规则），只有 `escape_sequence` 落。
 *  定界符的节点**类型**是 grammar.js 别名后的固定值，与源码里写的是 `'` 还是 `"""` 无关；文本才是原文。 */
export function parseString(p: Parser, field: string): void {
  const b = p.b;
  const start = p.take();
  const head = start.text.startsWith("&") ? '&"' : start.text.startsWith("^") || start.text.startsWith("@") ? '^"' : '"';
  const type = head === '&"' ? "string_name" : head === '^"' ? "node_path" : "string";
  b.open(type);
  b.anonAs(head, start, "");
  while (p.atKind("escape")) b.leaf("escape_sequence", p.take(), "");
  b.anonAs('"', p.expectKind("str-end", "string"), "");
  b.close(field);
}

/** `$"路径"` / `$Child/Grand` / `%Unique`。grammar.js:167-191 里路径段用的是隐藏的 `$._identifier`，
 *  所以那些名字在树上**不落节点**，只有 `$`、`%` 与分隔用的 `/` 落。 */
function parseGetNode(p: Parser, field: string): void {
  const b = p.b;
  b.open("get_node");
  let last = p.take();
  b.anon(last, "");
  if (p.atKind("str-start")) {
    // grammar.js:174,185 的 `alias($.string, "value")`：实测产物是**匿名**节点、类型 `value`、
    // 没有字段名，但 string 自己的两个定界符孩子原样保留。
    parseString(p, "");
    const n = b.liftLast();
    n.type = "value";
    n.isNamed = false;
    b.attach(n, "");
    b.close(field);
    return;
  }
  if (p.atPunct("/")) {
    last = p.take();
    b.anon(last, "");
  }
  if (!p.atKind("ident")) p.fail(["节点名"], "get_node");
  last = p.take();
  while (p.atPunct("/")) {
    last = p.take();
    b.anon(last, "");
    if (!p.atKind("ident")) p.fail(["节点名"], "get_node");
    last = p.take();
  }
  b.setEnd(last);
  b.close(field);
}

export function parseArray(p: Parser, field: string): void {
  const b = p.b;
  b.open("array");
  b.anon(p.expectPunct("[", "array"), "");
  if (!p.atPunct("]")) {
    for (;;) {
      b.flush();
      if (p.atWord("var")) parsePatternBinding(p, "");
      else parseRhs(p, "");
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (p.atPunct("]")) break;
    }
  }
  b.flush();
  if (p.atPunct("..")) {
    b.leaf("pattern_open_ending", p.take(), "");
  }
  b.anon(p.expectPunct("]", "array"), "");
  b.close(field);
}

export function parseDictionary(p: Parser, field: string): void {
  const b = p.b;
  b.open("dictionary");
  b.anon(p.expectPunct("{", "dictionary"), "");
  if (!p.atPunct("}")) {
    for (;;) {
      b.flush();
      parseDictEntry(p);
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (p.atPunct("}")) break;
    }
  }
  b.flush();
  if (p.atPunct("..")) b.leaf("pattern_open_ending", p.take(), "");
  b.anon(p.expectPunct("}", "dictionary"), "");
  b.close(field);
}

function parseDictEntry(p: Parser): void {
  const b = p.b;
  const mark = b.mark();
  if (p.atWord("var")) {
    parsePatternBinding(p, "");
    return;
  }
  parseRhs(p, "");
  if (p.atPunct(":")) {
    const left = b.spliceFrom(mark);
    b.open("pair");
    b.attach(left, "left");
    b.anon(p.take(), "");
    parseDictValue(p);
    b.close("");
    return;
  }
  if (p.atPunct("=")) {
    const left = b.spliceFrom(mark);
    b.open("pair");
    b.attach(left, "left");
    b.anon(p.take(), "");
    parseDictValue(p);
    b.close("");
    return;
  }
  b.setLastField("");
}

function parseDictValue(p: Parser): void {
  if (p.atWord("var")) parsePatternBinding(p, "value");
  else parseRhs(p, "value");
}

export function parsePatternBinding(p: Parser, field: string): void {
  const b = p.b;
  b.open("pattern_binding");
  b.anon(p.expectWord("var", "pattern"), "");
  if (!p.atKind("ident")) p.fail(["绑定名"], "pattern");
  b.leaf("identifier", p.take(), "");
  b.close(field);
}

/** `type` 是 `prec(PREC.type)` 的一层包装，里面是 attribute / identifier / subscript 三者之一。
 *  抬到 20 级是为了不与 `for x in y` 的 `in` 抢（grammar.js:197-200 的注释）。 */
export function parseType(p: Parser, field: string): void {
  const b = p.b;
  b.open("type");
  parsePostfix(p);
  b.close(field);
}

/** `inferred_type` 是 `:=`，或者 `:` 与 `=` 两个记号。 */
export function parseInferredType(p: Parser, field: string): void {
  const b = p.b;
  b.open("inferred_type");
  if (p.atPunct(":=")) {
    b.anon(p.take(), "");
  } else {
    b.anon(p.expectPunct(":", "inferred_type"), "");
    b.anon(p.expectPunct("=", "inferred_type"), "");
  }
  b.close(field);
}
