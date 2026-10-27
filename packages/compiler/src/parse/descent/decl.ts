import { parseRhs, parseString, parseType } from "./expr";
import type { CsNode } from "../cst";
import type { Parser } from "./state";
import { parseBody, parseParametersOf } from "./stmt";
import { GdSyntaxError, SENTENCES } from "./diag";
import type { Tok } from "./tokens";

const ACC = "property-setget";

/** `var` 没写型时，读写器那一段畸形报的是类型那一句（读数 `tmp/probe-inneracc/{m1.mts,compare32.txt}`）。 */
function relabel(e: unknown, sentence: string, reportRow: number, code: string): unknown {
  if (e instanceof GdSyntaxError) {
    e.issue.sentence = sentence;
    e.issue.reportRow = reportRow;
    e.issue.code = code;
  }
  return e;
}

const REMOTE = new Set(["remote", "master", "puppet", "remotesync", "mastersync", "puppetsync"]);

export function emitAnnotations(p: Parser, anns: CsNode[]): void {
  if (anns.length === 0) return;
  p.b.open("annotations");
  for (const a of anns) p.b.attach(a, "");
  p.b.close("");
}

export function parseAnnotation(p: Parser, field: string): void {
  const b = p.b;
  b.open("annotation");
  b.anon(p.expectPunct("@", "annotation"), "");
  if (!p.atKind("ident")) p.fail(["注解名"], "annotation");
  b.leaf("identifier", p.take(), "");
  if (p.atPunct("(")) parseArgumentsOf(p, "arguments");
  b.close(field);
}

/** 同一行上连着写的注解归成一串；跨行的各算一条独立语句（`_annotations` 是隐藏规则，不落包装节点）。 */
export function parseAnnotationRun(p: Parser): CsNode[] {
  const mark = p.b.mark();
  do {
    parseAnnotation(p, "");
  } while (p.atPunct("@") && !p.atLineHead());
  return p.b.spliceAll(mark);
}

function parseArgumentsOf(p: Parser, field: string): void {
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

export function parseVariable(p: Parser, field: string, anns: CsNode[] = [], members = false): void {
  const b = p.b;
  b.open("variable_statement");
  emitAnnotations(p, anns);
  if (p.atKind("ident") && REMOTE.has(p.peek().text)) b.leaf("remote_keyword", p.take(), "");
  if (p.atWord("static")) b.leaf("static_keyword", p.take(), "static");
  if (p.atWord("onready")) b.anon(p.take(), "");
  if (p.atWord("export")) {
    b.anon(p.take(), "");
    if (p.atPunct("(")) parseArgumentsOf(p, "arguments");
    if (p.atWord("onready")) b.anon(p.take(), "");
    else if (p.atKind("ident") && REMOTE.has(p.peek().text)) b.leaf("remote_keyword", p.take(), "");
  }
  b.anon(p.expectWord("var", "var"), "");
  if (!p.atKind("ident")) p.fail(["变量名"], "var");
  b.leaf("name", p.take(), "name");
  const typed = parseVarTail(p);
  if (p.atPunct(":")) {
    const colonRow = p.peek().row;
    try {
      parseSetget(p);
    } catch (e) {
      if (typed || members) throw e;
      throw relabel(e, SENTENCES.varTypeAfterColon, colonRow, "line-continuation");
    }
  }
  b.close(field);
}

/** `: 类型` / `:= 值` / `: 类型 = 值` / `= 值` 四种尾巴，grammar.js:272-279。
 *  注意 `inferred_type` 自己就含了 `:=`（或 `:` 与 `=` 两个记号），后面**不再**另有一个 `=`。
 *  交回「有没有写型」：读写器那一段畸形时报哪一句要看它（见 `relabel`）。 */
function parseVarTail(p: Parser): boolean {
  const b = p.b;
  if (p.atPunct(":=") || (p.atPunct(":") && p.atPunct("=", 1))) {
    parseInferredOf(p);
    parseRhs(p, "value");
    return false;
  }
  if (p.atPunct(":") && !p.colonOpensBlock()) {
    b.anon(p.take(), "");
    parseType(p, "type");
    if (p.atPunct("=") && !p.atLineHead()) {
      b.anon(p.take(), "");
      parseRhs(p, "value");
    }
    return true;
  }
  if (p.atPunct("=") && !p.atLineHead()) {
    b.anon(p.take(), "");
    parseRhs(p, "value");
  }
  return false;
}

function parseInferredOf(p: Parser): void {
  const b = p.b;
  b.open("inferred_type");
  if (p.atPunct(":=")) b.anon(p.take(), "");
  else {
    b.anon(p.expectPunct(":", "inferred_type"), "");
    b.anon(p.expectPunct("=", "inferred_type"), "");
  }
  b.close("type");
}

/** `setget`：`:` 之后要么是同行的一串 `get = f, set = g`，要么是缩进块里的 `get:` / `set(v):` 身体。 */
function parseSetget(p: Parser): void {
  const b = p.b;
  b.open("setget");
  b.anon(p.expectPunct(":", "setget"), "");
  if (p.c.openBlock()) {
    for (;;) {
      if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
      p.flush();
      if (p.atEof() || p.atBodyEnd() || p.dedented()) break;
      let assigned: boolean;
      if (p.atWord("get") && !p.atPunct("=", 1)) {
        parseGetBody(p);
        assigned = false;
      } else if (p.atWord("set") && !p.atPunct("=", 1)) {
        parseSetBody(p);
        assigned = false;
      } else if (p.atWord("get") || p.atWord("set")) {
        parseSetgetAssign(p);
        assigned = true;
      } else p.fail(['"get"', '"set"'], "setget");
      p.flush();
      if (p.atEof() || p.dedented()) break;
      if (p.atPunct(",")) {
        b.anon(p.take(), "");
        continue;
      }
      if (!assigned && (p.atWord("get") || p.atWord("set"))) continue;
      p.fail(['","'], "setget", SENTENCES.accBlockEnd, -1, ACC);
    }
    p.c.closeBlock();
    b.close("setget");
    return;
  }
  if (p.atWord("setget")) {
    parseSetgetAssign(p);
    b.close("setget");
    return;
  }
  parseSetgetAssign(p);
  if (p.atPunct(",")) {
    b.anon(p.take(), "");
    parseSetgetAssign(p);
  }
  b.close("setget");
}

function parseSetgetAssign(p: Parser): void {
  const b = p.b;
  if (p.atWord("setget")) {
    b.anon(p.take(), "");
    if (p.atPunct(",")) {
      b.anon(p.take(), "");
      b.leaf("getter", p.expectKind("ident", "setget"), "get");
      return;
    }
    b.leaf("setter", p.expectKind("ident", "setget"), "");
    if (p.atPunct(",")) {
      b.anon(p.take(), "");
      b.leaf("getter", p.expectKind("ident", "setget"), "");
    }
    return;
  }
  const kw = p.take();
  b.anon(kw, "");
  b.anon(p.expectPunct("=", "setget"), "");
  const getter = kw.text === "get";
  if (!p.atKind("ident") || p.atLineHead()) p.fail(["访问器函数名"], "setget", getter ? SENTENCES.accGetterName : SENTENCES.accSetterName, kw.row, ACC);
  b.leaf(getter ? "getter" : "setter", p.take(), kw.text);
}

function parseGetBody(p: Parser): void {
  const b = p.b;
  b.open("get_body");
  const kw = p.expectWord("get", "setget");
  b.anon(kw, "");
  if (p.atPunct("(")) {
    b.openAnon("()");
    b.anon(p.take(), "");
    b.anon(p.expectPunct(")", "setget"), "");
    b.close("");
  }
  if (!p.atPunct(":")) p.fail(['":"', '"("'], "setget", SENTENCES.accGetColonOrParen, kw.row, ACC);
  const colon = p.take();
  b.anon(colon, "");
  parseBody(p, "body", colon);
  b.close("get");
}

function parseSetBody(p: Parser): void {
  const b = p.b;
  b.open("set_body");
  const kw = p.expectWord("set", "setget");
  b.anon(kw, "");
  if (!p.atPunct("(")) p.fail(['"("'], "setget", SENTENCES.accSetParen, kw.row, ACC);
  parseParametersOf(p);
  b.setLastField("");
  const colon = p.expectPunct(":", "setget");
  b.anon(colon, "");
  parseBody(p, "body", colon);
  b.close("set");
}

export function parseConst(p: Parser, field: string, anns: CsNode[] = []): void {
  const b = p.b;
  b.open("const_statement");
  emitAnnotations(p, anns);
  b.anon(p.expectWord("const", "const"), "");
  if (!p.atKind("ident")) p.fail(["常量名"], "const");
  b.leaf("name", p.take(), "name");
  if (p.atPunct(":=") || (p.atPunct(":") && p.atPunct("=", 1))) {
    parseInferredOf(p);
    parseRhs(p, "value");
  } else if (p.atPunct(":")) {
    b.anon(p.take(), "");
    parseType(p, "type");
    b.anon(p.expectPunct("=", "const"), "");
    parseRhs(p, "value");
  } else {
    b.anon(p.expectPunct("=", "const"), "");
    parseRhs(p, "value");
  }
  b.close(field);
}

export function parseSignal(p: Parser, field: string, anns: CsNode[] = []): void {
  const b = p.b;
  b.open("signal_statement");
  emitAnnotations(p, anns);
  b.anon(p.expectWord("signal", "signal"), "");
  if (!p.atKind("ident")) p.fail(["信号名"], "signal");
  b.leaf("name", p.take(), "name");
  if (p.atPunct("(")) parseParametersOf(p);
  b.close(field);
}

export function parseClassName(p: Parser, field: string, anns: CsNode[] = []): void {
  const b = p.b;
  b.open("class_name_statement");
  emitAnnotations(p, anns);
  b.anon(p.expectWord("class_name", "class_name"), "");
  if (!p.atKind("ident")) p.fail(["类名"], "class_name");
  b.leaf("name", p.take(), "name");
  if (p.atPunct(",")) {
    b.anon(p.take(), "");
    if (!p.atKind("str-start")) p.fail(["图标路径"], "class_name");
    parseString(p, "icon_path");
  }
  if (p.atWord("extends") && p.sameLine(-1)) parseExtends(p, "extends");
  b.close(field);
}

export function parseExtends(p: Parser, field: string, anns: CsNode[] = []): void {
  const b = p.b;
  b.open("extends_statement");
  emitAnnotations(p, anns);
  b.anon(p.expectWord("extends", "extends"), "");
  if (p.atKind("str-start")) parseString(p, "");
  else parseType(p, "");
  b.close(field);
}

export function parseClassDefinition(p: Parser, field: string, anns: CsNode[] = []): void {
  const b = p.b;
  b.open("class_definition");
  emitAnnotations(p, anns);
  b.anon(p.expectWord("class", "class"), "");
  if (!p.atKind("ident")) p.fail(["类名"], "class");
  b.leaf("name", p.take(), "name");
  if (p.atWord("extends") && p.sameLine(-1)) parseExtends(p, "extends");
  const colon = p.expectPunct(":", "class");
  b.anon(colon, "");
  parseBody(p, "body", colon, "class_body");
  b.close(field);
}

export function parseEnumDefinition(p: Parser, field: string): void {
  const b = p.b;
  b.open("enum_definition");
  b.anon(p.expectWord("enum", "enum"), "");
  if (p.atKind("ident")) b.leaf("name", p.take(), "name");
  b.open("enumerator_list");
  b.anon(p.expectPunct("{", "enum"), "");
  if (!p.atPunct("}")) {
    for (;;) {
      b.flush();
      parseEnumerator(p);
      if (!p.atPunct(",")) break;
      b.anon(p.take(), "");
      if (p.atPunct("}")) break;
    }
  }
  b.flush();
  b.anon(p.expectPunct("}", "enum"), "");
  b.close("body");
  b.close(field);
}

function parseEnumerator(p: Parser): void {
  const b = p.b;
  b.open("enumerator");
  if (!p.atKind("ident")) p.fail(["枚举成员名"], "enum");
  b.leaf("identifier", p.take(), "left");
  if (p.atPunct("=")) {
    b.anon(p.take(), "");
    parseRhs(p, "right");
  }
  b.close("");
}

/**
 * `func _init(...)` 只在**脚本顶层**走 `constructor_definition`（`_init` 是匿名记号）；
 * 类体里的 `_init` 走 `function_definition` 且 `_init` 是具名 `name` 节点 ——
 * grammar.js:503-504 的 `_compound_class_member` 只有 class_definition / enum_definition / function_definition，
 * 压根不含 constructor_definition。实证：038-init-constructor 的两个顶层 `_init` 是 ctor，
 * 148-init-construction-order 的 24 个内部类 `_init` 全是 function_definition。
 */
export function parseFunction(p: Parser, field: string, anns: CsNode[] = [], staticKw: Tok | null = null, members = false): void {
  const b = p.b;
  const ctor = !members && p.atWord("_init", 1);
  b.open(ctor ? "constructor_definition" : "function_definition");
  emitAnnotations(p, anns);
  if (staticKw !== null) b.leaf("static_keyword", staticKw, "");
  b.anon(p.expectWord("func", "func"), "");
  if (ctor) b.anon(p.take(), "");
  else if (p.atKind("ident")) b.leaf("name", p.take(), "name");
  parseParametersOf(p);
  if (ctor && p.atPunct(".")) {
    b.anon(p.take(), "");
    parseArgumentsOf(p, "arguments");
  }
  if (p.atPunct("->") && !p.atLineHead()) {
    b.anon(p.take(), "");
    parseType(p, "return_type");
  }
  if (p.atPunct(":") && !p.atLineHead()) {
    const colon = p.take();
    b.anon(colon, "");
    parseBody(p, "body", colon);
  } else if (p.atPunct(";")) {
    b.anon(p.take(), "");
  }
  b.close(field);
}
