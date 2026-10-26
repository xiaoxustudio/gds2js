import { parseGdDouble } from "@gds2js/runtime/shared/double";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GLOBAL_CALLABLES } from "@gds2js/runtime/runtime/global-names";
import type { CsNode as SyntaxNode, CsTree as Tree } from "../parse/cst";
import type {
  ClassDecl,
  EnumDecl,
  EnumMember,
  Expr,
  FuncDecl,
  Loc,
  MatchArm,
  Module,
  Param,
  Pattern,
  PropAccessor,
  PropGetter,
  PropSetter,
  SignalDecl,
  Stmt,
  TypeRef,
  VarDecl,
} from "./ir";

function loc(n: SyntaxNode): Loc {
  return { line: n.startPosition.row + 1, col: n.startPosition.column + 1 };
}

function field(n: SyntaxNode, name: string): SyntaxNode | null {
  for (const c of n.children) {
    if (c.fieldName === name) return c;
  }
  return null;
}

function need(n: SyntaxNode | null | undefined, what: string): SyntaxNode {
  if (!n) throw new UnsupportedError("missing-field", `缺少 ${what}`);
  return n;
}

function operatorOf(n: SyntaxNode): string {
  const op = n.children.find((c) => !c.isNamed);
  if (!op) throw new UnsupportedError("missing-operator", `${n.type} 找不到运算符`);
  return op.text;
}

const BRACKET_NODES = new Set(["parenthesized_expression", "array", "dictionary", "arguments", "subscript"]);

const CST_PARENTS = new WeakMap<SyntaxNode, SyntaxNode>();

function indexParents(n: SyntaxNode): void {
  for (const c of n.children) {
    CST_PARENTS.set(c, n);
    indexParents(c);
  }
}

function inBrackets(n: SyntaxNode | null | undefined): boolean {
  for (let p = n ? CST_PARENTS.get(n) : undefined; p; p = CST_PARENTS.get(p)) {
    if (BRACKET_NODES.has(p.type)) return true;
  }
  return false;
}

function tokenOf(n: SyntaxNode, text: string): SyntaxNode | null {
  return n.children.find((c) => !c.isNamed && c.text === text) ?? null;
}

function continuationErr(sentence: string, at?: SyntaxNode): never {
  const e = new UnsupportedError("line-continuation", sentence);
  const carry = e as LineCarrying;
  if (at !== undefined) carry.line = at.startPosition.row + 1;
  throw e;
}

function checkAfterToken(n: SyntaxNode, token: SyntaxNode | null, value: SyntaxNode | null, sentence: string): void {
  if (token && value && value.startPosition.row > token.startPosition.row) continuationErr(sentence, token);
}

const MATCH_PATTERN_COLON = 'Expected ":" or "when" after "match" patterns.';
const MATCH_GUARD_EMPTY = 'Expected expression for pattern guard after "when".';
const MATCH_SUBJECT_COLON = 'Expected ":" after "match" expression.';
const MATCH_EMPTY_BLOCK = 'Expected an indented block after "match" statement.';

function gluedArm(x: SyntaxNode): SyntaxNode | null {
  const kids = x.children;
  if (!kids.some((k) => k.type === "ERROR" && /^[A-Za-z_]/.test(k.text))) return null;
  return kids.find((k) => k.isNamed && k.type !== "ERROR" && k.type !== "arguments") ?? null;
}

/** `match` 那一族的畸形形整棵树只有一个落点可用：语法塌法按缩进与手臂位置分岔（顶层 ERROR / `body` 里的 ERROR / `match_body` 的直接 ERROR），
 *  所以只要树里带 ERROR 就按记号级证据扫一遍（尺 `tmp/probe710` 十三形，句与行都按引擎原文量的），取最靠前的那一处。
 *  三条判据都要求树上真有 `match` 记号，且各认各的形状：守卫把身体粘走、主题后面直接贴上下一条手臂、手臂后面没冒号。 */
function matchMalformedScan(root: SyntaxNode): { sentence: string; at: SyntaxNode } | null {
  const hits: Array<{ sentence: string; at: SyntaxNode; row: number }> = [];
  let sawMatch = false;
  const walk = (x: SyntaxNode): void => {
    if (x.type === "match") sawMatch = true;
    {
      const head = x.children.findIndex((k) => k.type === "match");
      const colon = x.children.findIndex((k, i) => i > head && !k.isNamed && k.text === ":");
      if (head >= 0 && colon > head && x.children.slice(head + 1, colon).filter((k) => k.isNamed).length >= 2) {
        const tok = x.children[head];
        if (tok !== undefined) hits.push({ sentence: MATCH_SUBJECT_COLON, at: tok, row: tok.startPosition.row });
      }
      if (head >= 0 && colon > head && !x.children.slice(colon + 1).some((k) => k.isNamed)) {
        const tok = x.children[head];
        if (tok !== undefined) hits.push({ sentence: MATCH_EMPTY_BLOCK, at: tok, row: tok.startPosition.row });
      }
    }
    if (x.type === "pattern_guard") {
      const cond = x.children.find((k) => k.isNamed);
      if (cond !== undefined && gluedArm(cond) !== null) hits.push({ sentence: MATCH_GUARD_EMPTY, at: x, row: x.startPosition.row });
    }
    if (x.type === "call") {
      const arm = gluedArm(x);
      if (arm !== null) hits.push({ sentence: MATCH_PATTERN_COLON, at: arm, row: arm.startPosition.row });
    }
    for (const k of x.children) walk(k);
  };
  walk(root);
  if (!sawMatch) return null;
  hits.sort((a, b) => a.row - b.row);
  const first = hits[0];
  return first === undefined ? null : { sentence: first.sentence, at: first.at };
}

function operatorToken(n: SyntaxNode): SyntaxNode | null {
  return n.children.find((c) => !c.isNamed) ?? null;
}

function lastRow(n: SyntaxNode): number {
  let row = n.startPosition.row;
  for (let i = 0; i < n.text.length; i++) if (n.text.charCodeAt(i) === 10) row++;
  return row;
}

function checkColonHere(n: SyntaxNode, sentence: string): void {
  const kids = n.children;
  const at = kids.findIndex((c) => !c.isNamed && c.text === ":");
  const colon = at < 1 ? undefined : kids[at];
  const prev = at < 1 ? undefined : kids[at - 1];
  if (colon && prev && colon.startPosition.row > lastRow(prev)) continuationErr(sentence, prev);
}

function accessorTokenErr(n: SyntaxNode, needVar = true): string | null {
  const toks: SyntaxNode[] = [];
  const collect = (x: SyntaxNode): void => {
    if (x.children.length === 0) toks.push(x);
    else for (const c of x.children) collect(c);
  };
  collect(n);
  let seenVar = !needVar;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!;
    if (t.isNamed) continue;
    if (t.text === "var") seenVar = true;
    if (!seenVar || (t.text !== "get" && t.text !== "set")) continue;
    const nxt = toks[i + 1];
    if (nxt === undefined || nxt.text === ":" || nxt.text === "(") continue;
    if (nxt.text === "=") {
      const after = toks[i + 2];
      const isName = after !== undefined && (after.type === "identifier" || after.type === "getter" || after.type === "setter");
      if (isName && after!.startPosition.row === t.startPosition.row) continue;
      return `Expected ${t.text === "get" ? "getter" : "setter"} function name after "=".`;
    }
    return t.text === "get" ? 'Expected ":" or "(" after "get".' : 'Expected "(" after "set".';
  }
  return null;
}

function named(n: SyntaxNode): SyntaxNode[] {
  return n.namedChildren;
}

function lowerType(n: SyntaxNode): TypeRef {
  if (n.type === "inferred_type") return { kind: "variant" };
  return { kind: "named", name: n.text };
}

let packCodecUse = false;

let scriptFuncNames = new Set<string>();

let scriptInstanceMethods = new Map<string, Set<string>>();

type LineCarrying = { line?: number };

function atNode<T>(n: SyntaxNode, f: () => T): T {
  try {
    return f();
  } catch (e) {
    if (e instanceof UnsupportedError) {
      const withLine = e as LineCarrying;
      if (withLine.line === undefined) withLine.line = n.startPosition.row + 1;
    }
    throw e;
  }
}

export function lower(tree: Tree): Module {
  packCodecUse = false;
  indexParents(tree.rootNode);
  markLiteralCalls(tree.rootNode);
  if (tree.rootNode.hasError) {
    const hit = matchMalformedScan(tree.rootNode);
    if (hit !== null) continuationErr(hit.sentence, hit.at);
  }
  try {
    const m = lowerModule(tree.rootNode);
    if (packCodecUse) m.usesPackCodec = true;
    return m;
  } finally {
    }
}

function lowerModule(n: SyntaxNode): Module {
  return atNode(n, () => lowerModuleInner(n));
}

function lowerModuleInner(root: SyntaxNode): Module {
  scriptFuncNames = new Set<string>(named(root).map((n) => (n.type === "function_definition" ? field(n, "name")?.text ?? "" : "")));
  scriptInstanceMethods = new Map<string, Set<string>>();
  for (const cls of named(root).filter((n) => n.type === "class_definition")) {
    const cname = named(cls)[0]?.text ?? "";
    const body = named(cls).find((n) => n.type === "class_body") ?? null;
    if (cname === "" || body === null) continue;
    const set = new Set<string>();
    for (const fn of named(body).filter((n) => n.type === "function_definition")) {
      if (fn.children.some((c) => c.type === "static_keyword")) continue;
      const fname = named(fn)[0]?.text ?? "";
      if (fname !== "") set.add(fname);
    }
    if (set.size > 0) scriptInstanceMethods.set(cname, set);
  }
  const m: Module = {
    className: null,
    extends: null,
    topStmts: [],
    vars: [],
    signals: [],
    enums: [],
    funcs: [],
    innerClasses: [],
  };

  for (const c of named(root)) {
    switch (c.type) {
      case "class_name_statement":
        m.className = need(field(c, "name"), "class_name").text;
        break;
      case "extends_statement":
        m.extends =
need(named(c)[0] ?? field(c, "type"), "extends").text;
        break;
      case "variable_statement":
        m.vars.push(lowerVar(c, false));
        break;
      case "const_statement":
        m.vars.push(lowerVar(c, true));
        break;
      case "signal_statement":
        m.signals.push(lowerSignal(c));
        break;
      case "enum_definition":
        m.enums.push(lowerEnum(c));
        break;
      case "function_definition":
        m.funcs.push(lowerFunc(c));
        break;
      case "constructor_definition":
        m.funcs.push(lowerConstructor(c));
        break;
      case "class_definition":
        m.innerClasses.push(lowerClass(c));
        break;
      case "annotation":
      case "comment":
        break;
      default: {
        const sentence = c.type === "ERROR" ? accessorTokenErr(c) : null;
        if (sentence !== null) throw new UnsupportedError("property-setget", sentence);
        throw new UnsupportedError("module-node", `顶层节点 ${c.type} 未支持`);
      }
    }
  }
  return m;
}

function lowerVar(n: SyntaxNode, isConst: boolean, inClass = false): VarDecl {
  const typeNode = field(n, "type");
  const valueNode = field(n, "value");
  if (inClass) {
    const sentence = accessorTokenErr(n, false);
    if (sentence !== null) throw new UnsupportedError("property-setget", sentence);
  }
  checkAfterToken(n, tokenOf(n, "="), valueNode, isConst ? 'Expected initializer expression for constant.' : 'Expected expression for variable initial value after "=".');
  checkAfterToken(n, tokenOf(n, ":"), typeNode, 'Expected type after ":"');
  return {
    name: need(field(n, "name"), "变量名").text,
    type: typeNode ? lowerType(typeNode) : null,
    init: valueNode ? lowerExpr(valueNode) : null,
    isConst,
    isStatic: n.children.some((c) => c.type === "static_keyword"),
    accessor: lowerAccessor(n.children.find((c) => c.type === "setget") ?? null),
    loc: loc(n),
  };
}

function lowerAccessor(n: SyntaxNode | null | undefined): PropAccessor | null {
  if (!n || n.type !== "setget") return null;
  let getter: PropGetter | null = null;
  let setter: PropSetter | null = null;
  const blockBody = (c: SyntaxNode): Stmt[] => {
    const body = c.children.find((k) => k.type === "body");
    return body ? lowerBody(body) : [];
  };
  for (const c of n.children) {
    if (c.type === "get_body") getter = { kind: "inline", body: blockBody(c) };
    else if (c.type === "set_body") {
      const params = c.children.find((k) => k.type === "parameters");
      const pname = params ? (named(params)[0]?.text ?? "") : "";
      if (pname === "") throw new UnsupportedError("property-setget", "set 访问器至少要一个参数名（实测形态是 set(value):）");
      setter = { kind: "inline", param: pname, body: blockBody(c) };
    } else if (c.type === "getter") getter = { kind: "method", method: c.text };
    else if (c.type === "setter") setter = { kind: "method", method: c.text };
    else if (c.type === "ERROR") {
      const sentence = accessorTokenErr(n, false);
      if (sentence !== null) throw new UnsupportedError("property-setget", sentence);
      if (/^(get|set)\s*=/.test(c.text)) throw new UnsupportedError("property-setget", "Expected end of indented block for property.");
      throw new UnsupportedError("property-setget", `属性访问器里没见过的形态：${c.type} ${JSON.stringify(c.text.slice(0, 24))}`);
    } else if (c.isNamed) {
      throw new UnsupportedError("property-setget", `属性访问器里没见过的形态：${c.type} ${JSON.stringify(c.text.slice(0, 24))}`);
    }
  }
  if (getter === null && setter === null) {
    throw new UnsupportedError("property-setget", `属性访问器既没有 get 也没有 set：${JSON.stringify(n.children.map((c) => c.type).join(","))}`);
  }
  return { getter, setter };
}

function lowerSignal(n: SyntaxNode): SignalDecl {
  const paramsNode = field(n, "parameters");
  const ps = paramsNode ? named(paramsNode) : [];
  return {
    name: need(field(n, "name"), "信号名").text,
    params: ps.map((p) => p.text),
    hasDefaults: ps.some((p) => p.type.endsWith("default_parameter")),
    loc: loc(n),
  };
}

function lowerEnum(n: SyntaxNode): EnumDecl {
  const nameNode = field(n, "name");
  const list = field(n, "body");
  const members: EnumMember[] = [];
  let next = 0;
  for (const en of list ? named(list) : []) {
    const idNode = field(en, "left");
    const valNode = field(en, "right");
    const value = valNode ? Number(valNode.text) : next;
    members.push({ name: need(idNode, "枚举成员名").text, value });
    next = value + 1;
  }
  return { name: nameNode ? nameNode.text : null, members, loc: loc(n) };
}

function lowerClass(n: SyntaxNode): ClassDecl {
  return atNode(n, () => lowerClassInner(n));
}

function lowerClassInner(n: SyntaxNode): ClassDecl {
  checkColonHere(n, 'Expected ":" after class declaration.');
  const body = need(field(n, "body"), "类体");
  const decl: ClassDecl = {
    name: need(field(n, "name"), "类名").text,
    extends: null,
    vars: [],
    signals: [],
    funcs: [],
    innerClasses: [],
    loc: loc(n),
  };
  for (const c of named(n)) {
    if (c.type === "extends_statement") {
      decl.extends = need(named(c)[0] ?? field(c, "type"), "extends").text;
    }
  }
  for (const c of named(body)) {
    switch (c.type) {
      case "extends_statement":
        decl.extends =
need(named(c)[0] ?? field(c, "type"), "extends").text;
        break;
      case "variable_statement":
        decl.vars.push(lowerVar(c, false, true));
        break;
      case "const_statement":
        decl.vars.push(lowerVar(c, true));
        break;
      case "signal_statement":
        decl.signals.push(lowerSignal(c));
        break;
      case "function_definition":
        decl.funcs.push(lowerFunc(c));
        break;
      case "constructor_definition":
        decl.funcs.push(lowerConstructor(c));
        break;
      case "class_definition":
        decl.innerClasses.push(lowerClass(c));
        break;
      case "pass_statement":
        break;
      case "annotation":
        break;
      default: {
        const sentence = c.type === "ERROR" ? accessorTokenErr(c) : null;
        if (sentence !== null) throw new UnsupportedError("property-setget", sentence);
        throw new UnsupportedError("class-node", `类内节点 ${c.type} 未支持`);
      }
    }
  }
  return decl;
}

function lowerFunc(n: SyntaxNode): FuncDecl {
  const paramsNode = field(n, "parameters");
  const returnNode = field(n, "return_type");
  const bodyNode = field(n, "body");
  const isStatic = n.children.some((c) => c.type === "static_keyword");

  return {
    name: need(field(n, "name"), "函数名").text,
    params: paramsNode ? named(paramsNode).map(lowerParam) : [],
    returnType: returnNode ? lowerType(returnNode) : null,
    body: bodyNode ? lowerBody(bodyNode) : [],
    coroutine: hasAwait(n),
    isStatic,
    loc: loc(n),
  };
}

function lowerConstructor(n: SyntaxNode): FuncDecl {
  const paramsNode = field(n, "parameters");
  const bodyNode = field(n, "body");
  return {
    name: "_init",
    params: paramsNode ? named(paramsNode).map(lowerParam) : [],
    returnType: null,
    body: bodyNode ? lowerBody(bodyNode) : [],
    coroutine: false,
    isStatic: false,
    loc: loc(n),
  };
}

function hasAwait(n: SyntaxNode): boolean {
  if (n.type === "await_expression") return true;
  return n.namedChildren.some(hasAwait);
}

function lowerParam(n: SyntaxNode): Param {
  const id = named(n).find((c) => c.type === "identifier");
  const typeNode = field(n, "type");
  const valueNode = field(n, "value");
  return {
    name: id ? id.text : n.text,
    type: typeNode ? lowerType(typeNode) : null,
    default: valueNode ? lowerExpr(valueNode) : null,
  };
}

/** 整数字面量必须原样保住精度：先 `Number()` 会四舍五入、BigInt 那条路就拿不到正确值，所以 2^53 内用 number、超出用 bigint 字面量。顺带剥掉 GDScript 的 `1_000_000` 下划线。 */
function lowerIntLit(text: string): number | bigint {
  const t = text.replace(/_/g, "");
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : BigInt(t);
}

function lowerBody(n: SyntaxNode): Stmt[] {
  return named(n)
    .filter((c) => c.type !== "comment")
    .map(lowerStmt);
}

/** 逐格写出 `Stmt` 的 var 臂：展开 `VarDecl` 再 `as Stmt` 在静态编译目标上没有唯一的布局映射，所以不能用对象展开。`isStatic` / `accessor` 刻意不带 —— 它们只活在 `m.vars` 那份 `VarDecl` 上，语句这一支发射器只读 `name/type/init`。 */
function varStmt(v: VarDecl, c: Loc): Stmt {
  return { kind: "var", name: v.name, type: v.type, init: v.init, isConst: v.isConst, loc: c };
}

function lowerStmt(n: SyntaxNode): Stmt {
  return atNode(n, () => lowerStmtInner(n));
}

function lowerStmtInner(n: SyntaxNode): Stmt {
  const c = loc(n);
  switch (n.type) {
    case "variable_statement":
      return varStmt(lowerVar(n, false), c);
    case "const_statement":
      return varStmt(lowerVar(n, true), c);
    case "expression_statement": {
      const e = named(n)[0];
      if (!e) throw new UnsupportedError("empty-expr-stmt", "空表达式语句");
      if (e.type === "assignment" || e.type === "augmented_assignment") return lowerStmt(e);
      return { kind: "expr", expr: lowerExpr(e), loc: c };
    }
    case "assignment":
      checkAfterToken(n, tokenOf(n, "="), field(n, "right"), 'Expected an expression after "=".');
      return {
        kind: "assign",
        target: lowerExpr(need(field(n, "left"), "赋值左值")),
        value: lowerExpr(need(field(n, "right"), "赋值右值")),
        loc: c,
      };
    case "augmented_assignment": {
      const rightNode = field(n, "right");
      checkAfterToken(n, operatorToken(n), rightNode, 'Expected an expression after "=".');
      const op = operatorOf(n).replace(/=$/, "");
      const left = lowerExpr(need(field(n, "left"), "赋值左值"));
      return {
        kind: "assign",
        target: left,
        value: {
          kind: "binary",
          op,
          left,
          right: lowerExpr(need(field(n, "right"), "赋值右值")),
          loc: c,
        },
        loc: c,
      };
    }
    case "return_statement": {
      const v = named(n)[0];
      return { kind: "return", value: v ? lowerExpr(v) : null, loc: c };
    }
    case "pass_statement":
      return { kind: "pass", loc: c };
    case "break_statement":
      return { kind: "break", loc: c };
    case "continue_statement":
      return { kind: "continue", loc: c };
    case "if_statement":
      return lowerIf(n);
    case "for_statement": {
      const loopVar = field(n, "left");
      const iterable = field(n, "right");
      checkAfterToken(n, tokenOf(n, "for"), loopVar, 'Expected loop variable name after "for".');
      checkAfterToken(n, tokenOf(n, "in"), iterable, 'Expected iterable after "in".');
      checkColonHere(n, 'Expected ":" after "for" condition.');
      return {
        kind: "for",
        var: need(loopVar, "循环变量").text,
        iter: lowerExpr(need(iterable, "迭代对象")),
        body: lowerBody(need(field(n, "body"), "循环体")),
        loc: c,
      };
    }
    case "while_statement": {
      const condNode = field(n, "condition");
      checkAfterToken(n, tokenOf(n, "while"), condNode, 'Expected conditional expression after "while".');
      checkColonHere(n, 'Expected ":" after "while" condition.');
      return {
        kind: "while",
        cond: lowerExpr(need(condNode, "循环条件")),
        body: lowerBody(need(field(n, "body"), "循环体")),
        loc: c,
      };
    }
    case "match_statement":
      return lowerMatch(n);
    default:
      throw new UnsupportedError("stmt", `语句 ${n.type} 未支持`);
  }
}

function lowerIf(n: SyntaxNode): Stmt {
  const condNode = field(n, "condition");
  checkAfterToken(n, tokenOf(n, "if"), condNode, 'Expected conditional expression after "if".');
  checkColonHere(n, 'Expected ":" after "if" condition.');
  const branches: Extract<Stmt, { kind: "if" }>["branches"] = [
    {
      cond: lowerExpr(need(condNode, "if 条件")),
      body: lowerBody(need(field(n, "body"), "if 体")),
    },
  ];
  let alt = field(n, "alternative");
  while (alt) {
    if (alt.type === "elif_clause") {
      const elifCond = field(alt, "condition");
      checkAfterToken(alt, tokenOf(alt, "elif"), elifCond, 'Expected conditional expression after "elif".');
      checkColonHere(alt, 'Expected ":" after "elif" condition.');
      branches.push({
        cond: lowerExpr(need(elifCond, "elif 条件")),
        body: lowerBody(need(field(alt, "body"), "elif 体")),
      });
    } else if (alt.type === "else_clause") {
      checkColonHere(alt, 'Expected ":" after "else".');
      branches.push({ cond: null, body: lowerBody(need(field(alt, "body"), "else 体")) });
    } else {
      throw new UnsupportedError("if-alt", `if 分支 ${alt.type} 未支持`);
    }
    alt = field(alt, "alternative");
  }
  return { kind: "if", branches, loc: loc(n) };
}

function lowerMatch(n: SyntaxNode): Stmt {
  const subjectNode = field(n, "value");
  if (subjectNode !== null && subjectNode.text === "") continuationErr('Expected expression to test after "match".', tokenOf(n, "match") ?? undefined);
  checkAfterToken(n, tokenOf(n, "match"), subjectNode, 'Expected expression to test after "match".');
  checkColonHere(n, 'Expected ":" after "match" expression.');
  const subject = lowerExpr(need(subjectNode, "match 主题"));
  const body = need(field(n, "body"), "match 体");
  const arms: MatchArm[] = [];
  for (const section of named(body)) {
    if (section.type !== "pattern_section") {
      if (section.type === "ERROR") continuationErr(MATCH_PATTERN_COLON, section);
      throw new UnsupportedError("match-node", `match 内节点 ${section.type} 未支持`);
    }
    const sectionBody = lowerBody(need(field(section, "body"), "match 分支体"));
    const guardNode = named(section).find((x) => x.type === "pattern_guard");
    if (guardNode) {
      const condNode = field(guardNode, "condition") ?? named(guardNode)[0] ?? null;
      checkAfterToken(guardNode, tokenOf(guardNode, "when"), condNode, 'Expected expression for pattern guard after "when".');
      checkColonHere(section, 'Expected ":" after "match" pattern guard.');
    }
    const guard = guardNode ? lowerExpr(need(field(guardNode, "condition") ?? named(guardNode)[0], "when 条件")) : null;
    const patternNodes = named(section).filter((x) => x !== guardNode && x.type !== "body");
    for (const p of patternNodes) {
      arms.push({ pattern: lowerPattern(p), guard, body: sectionBody });
    }
  }
  return { kind: "match", subject, arms, loc: loc(n) };
}

function lowerPattern(n: SyntaxNode): Pattern {
  return atNode(n, () => lowerPatternInner(n));
}

function lowerPatternInner(n: SyntaxNode): Pattern {
  switch (n.type) {
    case "pattern_binding": {
      const id = named(n)[0];
      return { kind: "bind", name: id ? id.text : n.text };
    }
    case "identifier":
      if (n.text === "_") return { kind: "wildcard" };
      return { kind: "const", expr: lowerExpr(n) };
    case "attribute":
      if (armSelfBase(n)) throw new UnsupportedError("pattern-arm-runtime", ARM_PATTERN);
      {
        const aparts = named(n);
        const head = aparts[0];
        const tail = aparts[1];
        const mname = aparts.length === 2 && tail !== undefined && tail.type === "attribute_call" ? named(tail)[0]?.text ?? "" : "";
        if (mname !== "" && head !== undefined && head.type === "identifier" && scriptInstanceMethods.get(head.text)?.has(mname) === true) {
          throw new UnsupportedError("pattern-arm-instance-method", [
            `Cannot call non-static function "${mname}()" on the class "${head.text}" directly. Make an instance instead.`,
            ARM_PATTERN,
          ].join(String.fromCharCode(10)));
        }
      }
      return { kind: "const", expr: lowerExpr(n) };
    case "integer":
      return { kind: "lit", lit: "int", value: lowerIntLit(n.text) };
    case "float":
      return { kind: "lit", lit: "float", value: parseGdDouble(n.text) };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text) };
    case "string_name":
      return { kind: "lit", lit: "string_name", value: unquote(stripAmp(n.text)) };
    case "node_path":
      return { kind: "lit", lit: "node_path", value: unquote(stripCaret(n.text)) };
    case "call": {
      const np = nodePathArm(n);
      if (np !== null) return { kind: "lit", lit: "node_path", value: np };
      if (ctorArm(n)) return { kind: "const", expr: lowerExpr(n) };
      const gnameEarly = named(n)[0]?.text;
      if (gnameEarly !== undefined && ARM_FOLD_GLOBALS.has(gnameEarly) && armFoldArityFits(gnameEarly, callArgs(n)) && callArgs(n).every(armAllLiterals)) return { kind: "const", expr: lowerExpr(n) };
      const gnameSelf = named(n)[0]?.text;
      if (gnameSelf !== undefined && scriptFuncNames.has(gnameSelf)) throw new UnsupportedError("pattern-arm-runtime", ARM_PATTERN);
      const sig = armSignature(n);
      if (sig !== null) throw new UnsupportedError("pattern-arm-signature", [...sig, ARM_PATTERN].join(String.fromCharCode(10)));
      const gname = named(n)[0]?.text;
      if (gname !== undefined && ARM_FOLD_GLOBALS.has(gname) && armFoldArityFits(gname, callArgs(n)) && callArgs(n).every(armAllLiterals)) return { kind: "const", expr: lowerExpr(n) };
      if (gname !== undefined && GLOBAL_CALLABLES[gname] !== undefined) {
        const gb = GLOBAL_CALLABLES[gname].bounds;
        const given = callArgs(n).length;
        if (gb !== null && (given < gb[0] || given > gb[1])) {
          throw new UnsupportedError("pattern-arm-arity", [armAritySay(gb[0], gb[1], given, gname), ARM_PATTERN].join(String.fromCharCode(10)));
        }
        throw new UnsupportedError("pattern-arm-runtime", ARM_PATTERN);
      }
      if (armCalleeKnown(n)) throw new UnsupportedError("pattern-arm-runtime", ARM_PATTERN);
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
    }
    case "subscript":
      throw new UnsupportedError("pattern-arm-parse", `Expected ":" or "when" after "match" patterns.`);
    case "true":
      return { kind: "lit", lit: "bool", value: true };
    case "false":
      return { kind: "lit", lit: "bool", value: false };
    case "null":
      return { kind: "lit", lit: "null", value: null };
    case "array":
      return { kind: "array", items: named(n).map(lowerPattern) };
    case "dictionary":
      return {
        kind: "dict",
        entries: named(n).map((pair) => ({
          key: lowerExpr(need(field(pair, "left") ?? named(pair)[0] ?? null, "字典键")),
          pattern: lowerPattern(need(field(pair, "value") ?? named(pair)[1] ?? null, "字典值模式")),
        })),
      };
    case "binary_operator":
    case "unary_operator":
    case "parenthesized_expression":
    case "conditional_expression": {
      if (n.type === "parenthesized_expression" && armMissingParen(n)) {
        throw new UnsupportedError("pattern-arm-parse", `Expected closing ")" after grouping expression.`);
      }
      if (armAllLiterals(n)) return { kind: "const", expr: lowerExpr(n) };
      if (armHasAttributeLeaf(n)) throw new UnsupportedError("pattern-arm-runtime", ARM_PATTERN);
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
    }
    case "ERROR": {
      const first = n.children[0]?.text ?? "";
      if (first === ",") throw new UnsupportedError("pattern-arm-parse", `Expected expression for match pattern.`);
      if (first === "else") throw new UnsupportedError("pattern-arm-parse", `Expected ":" after "match" pattern guard.`);
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
    }
    default:
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
  }
}

function armMissingParen(n: SyntaxNode): boolean {
  return n.children.some((c) => c.type === ")" && (c.hasError || c.text === ""));
}

function armAllLiterals(n: SyntaxNode): boolean {
  if (n.type === "binary_operator" || n.type === "unary_operator" || n.type === "parenthesized_expression" || n.type === "conditional_expression") {
    const kids = named(n);
    return kids.length > 0 && kids.every(armAllLiterals);
  }
  return ARM_LITERAL_NODES.has(n.type);
}

function armSelfBase(n: SyntaxNode): boolean {
  const base = named(n)[0];
  return base !== undefined && base.type === "identifier" && base.text === "self";
}

function armHasAttributeLeaf(n: SyntaxNode): boolean {
  if (n.type === "attribute") return true;
  if (n.type === "binary_operator" || n.type === "unary_operator" || n.type === "parenthesized_expression" || n.type === "conditional_expression") {
    return named(n).some(armHasAttributeLeaf);
  }
  return false;
}

const ARM_LITERAL_NODES = new Set([
  "integer", "float", "string", "string_name", "node_path", "true", "false", "null",
]);

const ARM_FOLD_GLOBALS = new Set([
  "int", "len", "abs", "mini", "max", "sign", "sqrt", "deg_to_rad", "snapped",
  "absf", "lerpf", "posmod", "move_toward", "maxf", "minf", "clampi", "signi",
  "pow", "exp", "log", "sin", "cos", "tan", "sinh", "cosh", "tanh", "asin", "acos",
  "atan", "atan2", "rad_to_deg", "floor", "ceil", "round", "roundf", "fposmod",
  "lerp", "min", "maxi", "lerp_angle", "smoothstep", "snappedf", "snappedi",
  "wrap", "wrapi", "wrapf", "is_equal_approx", "is_finite", "is_nan",
  "inverse_lerp", "db_to_linear", "linear_to_db", "ease", "bezier_interpolate",
  "cubic_interpolate", "cubic_interpolate_angle", "float", "fmod", "ceilf", "floori", "ceili",
  "acosh", "asinh", "atanh", "remap", "floorf", "roundi", "absi", "signf", "is_inf",
  "is_zero_approx", "step_decimals", "cubic_interpolate_in_time", "cubic_interpolate_angle_in_time",
  "bezier_derivative", "angle_difference", "rotate_toward", "clamp", "clampf", "nearest_po2", "pingpong",
]);

function lowerExpr(n: SyntaxNode): Expr {
  return atNode(n, () => lowerExprInner(n));
}

function lowerExprInner(n: SyntaxNode): Expr {
  const c = loc(n);
  switch (n.type) {
    case "integer":
      return { kind: "lit", lit: "int", value: lowerIntLit(n.text), loc: c };
    case "float":
      return { kind: "lit", lit: "float", value: parseGdDouble(n.text), loc: c };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text), loc: c };
    case "string_name":
      return { kind: "lit", lit: "string_name", value: unquote(stripAmp(n.text)), loc: c };
    case "node_path":
      return { kind: "lit", lit: "node_path", value: unquote(stripCaret(n.text)), loc: c };
    case "true":
      return { kind: "lit", lit: "bool", value: true, loc: c };
    case "false":
      return { kind: "lit", lit: "bool", value: false, loc: c };
    case "null":
      return { kind: "lit", lit: "null", value: null, loc: c };
    case "identifier":
      return { kind: "ident", name: n.text, loc: c };
    case "parenthesized_expression":
      return lowerExpr(need(named(n)[0], "括号表达式"));
    case "unary_operator": {
      if (!inBrackets(n)) {
        const operand = need(named(n)[0], "一元操作数");
        checkAfterToken(n, n.children.find((k) => !k.isNamed) ?? null, operand, `Expected expression after "${operatorOf(n)}" operator.`);
      }
      return { kind: "unary", op: operatorOf(n), operand: lowerExpr(need(named(n)[0], "一元操作数")), loc: c };
    }
    case "conditional_expression": {
      const kids = named(n);
      if (kids.length !== 3) throw new UnsupportedError("ternary", `三目的形状没量过（命名子节点 ${String(kids.length)} 片）`);
      return { kind: "ternary", cond: lowerExpr(need(kids[1], "三目条件")), thenE: lowerExpr(need(kids[0], "三目真值支")), elseE: lowerExpr(need(kids[2], "三目假值支")), loc: c };
    }
    case "await_expression":
      return { kind: "await", operand: lowerExpr(need(named(n)[0], "await 操作数")), loc: c };
    case "lambda": {
      const paramsNode = field(n, "parameters");
      return {
        kind: "lambda",
        params: paramsNode ? named(paramsNode).map(lowerParam) : [],
        body: lowerBody(need(field(n, "body"), "lambda 体")),
        loc: c,
      };
    }
    case "array":
      return { kind: "array", items: named(n).map(lowerExpr), loc: c };
    case "dictionary": {
      const entries = named(n).map((pair) => ({
        key: lowerExpr(need(field(pair, "left") ?? named(pair)[0], "字典键")),
        value: lowerExpr(need(field(pair, "value") ?? named(pair)[1], "字典值")),
      }));
      return { kind: "dict", entries, loc: c };
    }
    case "subscript": {
      const argsNode = field(n, "arguments");
      const idx = argsNode ? named(argsNode)[0] : undefined;
      return {
        kind: "index",
        obj: lowerExpr(need(named(n)[0], "下标对象")),
        index: lowerExpr(need(idx ?? null, "下标")),
        loc: c,
      };
    }
    case "attribute": {
      const kids = named(n);
      if (kids.length === 0) throw new UnsupportedError("attribute", "空的属性访问");
      let acc = lowerExpr(need(kids[0] ?? null, "属性对象"));
      for (const seg of kids.slice(1)) {
        if (seg.type === "attribute_call") {
          const name = need(named(seg)[0] ?? null, "方法名");
          if (name.text === "compress" || name.text === "decompress") packCodecUse = true;
          const argsNode = field(seg, "arguments");
          acc = {
            kind: "call",
            callee: { kind: "attribute", obj: acc, name: name.text, loc: loc(seg) },
            args: argsNode ? named(argsNode).map(lowerExpr) : [],
            loc: c,
          };
        } else if (seg.type === "attribute_subscript") {
          const parts = named(seg);
          const nm = need(parts[0] ?? null, "attribute_subscript 的属性名");
          const argsNode = field(seg, "arguments") ?? parts[1] ?? null;
          const idx = argsNode ? named(argsNode)[0] : undefined;
          acc = {
            kind: "index",
            obj: { kind: "attribute", obj: acc, name: nm.text, loc: c },
            index: lowerExpr(need(idx ?? null, "attribute_subscript 的下标")),
            loc: c,
          };
        } else {
          acc = { kind: "attribute", obj: acc, name: seg.text, loc: c };
        }
      }
      return acc;
    }
    case "call": {
      const kids = named(n);
      const callee = lowerExpr(need(kids[0] ?? null, "被调用者"));
      return { kind: "call", callee, args: callArgs(n).map(lowerExpr), loc: c };
    }
    case "binary_operator":
      return lowerBinary(n, c);
    case "ERROR": {
      const recovered = recoverLiteralCall(n);
      if (recovered !== null) return recovered;
      throw new UnsupportedError("expr", `表达式 ${n.type} 未支持`);
    }
    default:
      throw new UnsupportedError("expr", `表达式 ${n.type} 未支持`);
  }
}

const MUL_LEVEL: Record<string, number> = { "**": 2, "*": 1, "/": 1, "%": 1 };

function lowerBinary(n: SyntaxNode, c: Loc): Expr {
  const op = operatorOf(n);
  if (!inBrackets(n)) {
    const tok = n.children.find((k) => !k.isNamed) ?? null;
    checkAfterToken(n, tok, field(n, "right"), `Expected expression after "${op}" operator.`);
  }
  if (MUL_LEVEL[op] === undefined) {
    const left = lowerOperand(need(field(n, "left"), "左操作数"));
    const right = need(field(n, "right"), "右操作数");
    if (op === "is") return { kind: "is", operand: left, type: lowerType(right), loc: c };
    if (op === "as") return { kind: "as", operand: left, type: lowerType(right), loc: c };
    return { kind: "binary", op, left, right: lowerExpr(right), loc: c };
  }
  const operands: SyntaxNode[] = [];
  const ops: Array<{ op: string; node: SyntaxNode }> = [];
  collectMulChain(n, operands, ops);
  let at = 0;
  const climb = (min: number): Expr => {
    let left = lowerOperand(operands[at++]!);
    while (at - 1 < ops.length && MUL_LEVEL[ops[at - 1]!.op]! >= min) {
      const step = ops[at - 1]!;
      const right = climb(MUL_LEVEL[step.op]! + 1);
      left = { kind: "binary", op: step.op, left, right, loc: loc(step.node) };
    }
    return left;
  };
  return climb(1);
}

/** 摊平只吃没有括号包着的同层二元节点：`parenthesized_expression` 是另一种节点，天然挡住合并。 */
function collectMulChain(n: SyntaxNode, operands: SyntaxNode[], ops: Array<{ op: string; node: SyntaxNode }>): void {
  if (n.type === "binary_operator" && MUL_LEVEL[operatorOf(n)] !== undefined) {
    collectMulChain(need(field(n, "left"), "左操作数"), operands, ops);
    ops.push({ op: operatorOf(n), node: n });
    collectMulChain(need(field(n, "right"), "右操作数"), operands, ops);
    return;
  }
  operands.push(n);
}

/** `&"abc"` 的 CST 文本连前导 `&` 一起给，剥掉后才能和 String 共用同一套转义解码。 */
function stripAmp(text: string): string {
  return text.startsWith("&") ? text.slice(1) : text;
}

function stripCaret(text: string): string {
  return text.startsWith("^") ? text.slice(1) : text;
}

const CTOR_ARMS: Record<string, string[][]> = {
  Vector2: [[], ["N", "N"], ["B", "B"], ["V2"]],
  Vector2i: [[], ["N", "N"], ["V2"]],
  Vector3: [[], ["N", "N", "N"]],
  Vector3i: [[], ["N", "N", "N"]],
  StringName: [[], ["S"]],
  NodePath: [[], ["S"]],
  Callable: [[]],
  Color: [[], ["N", "N", "N"], ["N", "N", "N", "N"], ["S"]],
  String: [[], ["S"]],
  Array: [],
  Dictionary: [],
};

function armArgKind(n: SyntaxNode): string | null {
  switch (n.type) {
    case "integer":
      return "int";
    case "float":
      return "float";
    case "string":
      return "String";
    case "string_name":
      return "StringName";
    case "node_path":
      return "NodePath";
    case "true":
    case "false":
      return "bool";
    case "unary_operator": {
      if (n.text[0] !== "-") return null;
      const inner = named(n);
      if (inner.length !== 1) return null;
      const k = armArgKind(inner[0]!);
      return k === "int" || k === "float" ? k : null;
    }
    case "call": {
      const callee = named(n)[0] ?? null;
      if (callee === null || callee.type !== "identifier") return null;
      const args = callArgs(n);
      if (!ctorAccepts(callee.text, args.map(armArgKind))) return null;
      return callee.text;
    }
    default:
      return null;
  }
}

/** `CsNode` 这一层不暴露 `nextNamedSibling`，兄弟关系从 `indexParents` 存的父节点上找。 */
function nextNamedSib(n: SyntaxNode): SyntaxNode | undefined {
  const parent = CST_PARENTS.get(n);
  if (parent === undefined) return undefined;
  const kids = named(parent);
  const i = kids.indexOf(n);
  return i < 0 ? undefined : kids[i + 1];
}

function markLiteralCalls(n: SyntaxNode): void {
  if (n.type === "ERROR") {
    const lit = named(n)[0];
    if (lit !== undefined && (lit.type === "string_name" || lit.type === "node_path")) {
      let sib = nextNamedSib(n);
      while (sib !== undefined && sib.type === "base_call") {
        CONSUMED.add(sib);
        sib = nextNamedSib(sib);
      }
      if (sib !== undefined && sib.type === "binary_operator") CONSUMED.add(sib);
    }
  }
  for (const c of n.children) markLiteralCalls(c);
}

const CONSUMED = new WeakSet<SyntaxNode>();

const LEFT_RECOVER = new WeakMap<SyntaxNode, Expr>();

function lowerOperand(n: SyntaxNode): Expr {
  return LEFT_RECOVER.get(n) ?? lowerExpr(n);
}

function callArgs(n: SyntaxNode): SyntaxNode[] {
  const argsNode = field(n, "arguments");
  return argsNode === null ? [] : named(argsNode).filter((c) => !CONSUMED.has(c));
}

function recoverLiteralCall(err: SyntaxNode): Expr | null {
  const lit = named(err)[0];
  if (lit === undefined || (lit.type !== "string_name" && lit.type !== "node_path")) return null;
  let sib = nextNamedSib(err);
  if (sib === undefined) return null;
  let out = lowerExpr(lit);
  if (sib.type === "binary_operator") {
    const leftNode = field(sib, "left");
    if (leftNode === null || leftNode.type !== "base_call") return null;
    const stepped = baseCallStep(out, named(leftNode), field(leftNode, "arguments"), leftNode);
    if (stepped === null) return null;
    LEFT_RECOVER.set(leftNode, stepped);
    CONSUMED.add(sib);
    return lowerOperand(sib);
  }
  if (sib.type !== "base_call") return null;
  while (sib !== undefined && sib.type === "base_call") {
    const kids = named(sib);
    const argsNode = field(sib, "arguments");
    const folded = baseCallStep(out, kids, argsNode, sib);
    if (folded === null) return null;
    CONSUMED.add(sib);
    out = folded;
    sib = nextNamedSib(sib);
  }
  if (sib !== undefined && sib.type === "binary_operator") {
    const leftNode = field(sib, "left");
    if (leftNode === null || leftNode.type !== "base_call") return null;
    LEFT_RECOVER.set(leftNode, out);
    CONSUMED.add(sib);
    return lowerOperand(sib);
  }
  return out;
}

function baseCallStep(obj: Expr, kids: SyntaxNode[], argsNode: SyntaxNode | null, at: SyntaxNode): Expr | null {
  const c = loc(at);
  const head = kids[0];
  if (head === undefined) return null;
  if (head.type === "identifier") {
    const name = head.text;
    if (argsNode === null) return { kind: "attribute", obj, name, loc: c };
    const args = named(argsNode).filter((x) => !CONSUMED.has(x)).map(lowerExpr);
    return { kind: "call", callee: { kind: "attribute", obj, name, loc: c }, args, loc: c };
  }
  return null;
}

function ctorAccepts(name: string, kinds: Array<string | null>): boolean {
  const rows = CTOR_ARMS[name];
  if (rows === undefined) return false;
  const args = kinds.length;
  if (args === 0) return rows.some((row) => row.length === 0);
  return rows.some((row) => row.length === args && row.every((slot, i) => slotForK(kinds[i] ?? null, slot)));
}

function slotForK(kind: string | null, slot: string): boolean {
  if (kind === null) return false;
  if (slot === "N") return kind === "int" || kind === "float";
  if (slot === "I") return kind === "int";
  if (slot === "B") return kind === "int" || kind === "float" || kind === "bool";
  if (slot === "S") return kind === "String";
  if (slot === "V2") return kind === "Vector2";
  if (slot === "V3") return kind === "Vector3";
  return kind === slot;
}

const ARM_NO_CTOR: Record<string, boolean> = {
  Rect2: true, Rect2i: true, Transform2D: true, Plane: true, Quaternion: true, Basis: true, AABB: true, Signal: true,
};

function ctorArm(n: SyntaxNode): boolean {
  const callee = named(n)[0] ?? null;
  if (callee === null || callee.type !== "identifier") return false;
  return ctorAccepts(callee.text, callArgs(n).map(armArgKind));
}

/** 手臂里的全局调用越元数那一句（S679，尺 `tmp/probe689/armarity.mts` 十二格：七名越界两向 + 三名合式对照）。
 *  引擎在常量式那句**之前**先发元数那句，数取声明的全部数（与 `arityDiag` 同一模板）。 */
function armAritySay(min: number, max: number, given: number, name: string): string {
  return given < min
    ? `Too few arguments for "${name}()" call. Expected at least ${String(min)} but received ${String(given)}.`
    : `Too many arguments for "${name}()" call. Expected at most ${String(max)} but received ${String(given)}.`;
}

function armFoldArityFits(name: string, args: readonly unknown[]): boolean {
  const row = GLOBAL_CALLABLES[name];
  if (row === undefined || row.bounds === null) return true;
  return args.length >= row.bounds[0] && args.length <= row.bounds[1];
}

const ARM_PATTERN = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';

function armCalleeKnown(n: SyntaxNode): boolean {
  const callee = named(n)[0] ?? null;
  if (callee === null || callee.type !== "identifier") return false;
  return CTOR_ARMS[callee.text] !== undefined || ARM_NO_CTOR[callee.text] === true;
}

function armSignature(n: SyntaxNode): string[] | null {
  const callee = named(n)[0] ?? null;
  if (callee === null || callee.type !== "identifier") return null;
  const args = callArgs(n);
  const kinds: string[] = [];
  const inner: string[] = [];
  for (const a of args) {
    const k = armArgKind(a);
    if (k !== null) {
      kinds.push(k);
      continue;
    }
    const sub = a.type === "call" ? armSignature(a) : null;
    if (sub === null) return null;
    const nested = named(a)[0] ?? null;
    if (nested === null || nested.type !== "identifier") return null;
    inner.push(...sub);
    kinds.push(nested.text);
  }
  if (ctorAccepts(callee.text, kinds)) return null;
  if (args.length === 0) return null;
  if (CTOR_ARMS[callee.text] === undefined && ARM_NO_CTOR[callee.text] !== true) {
    return GLOBAL_CALLABLES[callee.text] === undefined ? [`Function "${callee.text}()" not found in base self.`] : null;
  }
  return [...inner, "No constructor of " + String.fromCharCode(34) + callee.text + String.fromCharCode(34) + " matches the signature " + String.fromCharCode(34) + callee.text + "(" + kinds.join(", ") + ")" + String.fromCharCode(34) + "."];
}

function nodePathArm(n: SyntaxNode): string | null {
  const callee = named(n)[0] ?? null;
  if (callee === null || callee.type !== "identifier" || callee.text !== "NodePath") return null;
  const argsNode = field(n, "arguments");
  if (argsNode === null) return null;
  const args = named(argsNode);
  if (args.length !== 1) return null;
  const only = args[0] ?? null;
  if (only === null || only.type !== "string") return null;
  return unquote(only.text);
}

function unquote(raw: string): string {
  if (raw.length < 2 || !(raw.startsWith('"') || raw.startsWith("'"))) return raw;
  const inner = raw.slice(1, -1);
  const parts: Array<string | number> = [];
  const pushLit = (ch: string) => {
    const last = parts[parts.length - 1];
    if (typeof last === "string") parts[parts.length - 1] = last + ch;
    else parts.push(ch);
  };
  const pushEsc = (cp: number) => parts.push(cp);

  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!;
    if (ch !== "\\") {
      const lead = inner.charCodeAt(i);
      if (lead >= 0xd800 && lead <= 0xdbff && i + 1 < inner.length) {
        const trail = inner.charCodeAt(i + 1);
        if (trail >= 0xdc00 && trail <= 0xdfff) {
          pushLit(inner.slice(i, i + 2));
          i++;
          continue;
        }
      }
      pushLit(ch);
      continue;
    }
    const e = inner[++i];
    if (e === undefined) {
      throw new UnsupportedError("string-escape", "字符串以孤立反斜杠结尾");
    }
    switch (e) {
      case "n": pushLit("\n"); break;
      case "t": pushLit("\t"); break;
      case "r": pushLit("\r"); break;
      case "a": pushEsc(0x07); break;
      case "b": pushEsc(0x08); break;
      case "f": pushEsc(0x0c); break;
      case "v": pushEsc(0x0b); break;
      case "\\": pushLit("\\"); break;
      case '"': pushLit('"'); break;
      case "'": pushLit("'"); break;
      case "u":
      case "U": {
        const width = e === "u" ? 4 : 6;
        const hex = inner.slice(i + 1, i + 1 + width);
        if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(hex)) {
          throw new UnsupportedError(
            "string-escape",
            `\\${e} 需要恰好 ${width} 位十六进制，收到 "${hex}"（Godot: Invalid hexadecimal digit in unicode escape sequence）`,
          );
        }
        pushEsc(parseInt(hex, 16));
        i += width;
        break;
      }
      default:
        throw new UnsupportedError(
          "string-escape",
          `不支持的字符串转义 \\${e}（GDScript 无 \\x；实测 Godot 对 \\x41 报 Parse Error: Invalid escape in string）`,
        );
    }
  }

  let out = "";
  for (let k = 0; k < parts.length; k++) {
    const p = parts[k]!;
    if (typeof p === "string") {
      out += p;
      continue;
    }
    const hi = p as number;
    if (hi >= 0xd800 && hi <= 0xdbff) {
      const q = parts[k + 1];
      if (typeof q === "number" && q >= 0xdc00 && q <= 0xdfff) {
        out += String.fromCodePoint(0x10000 + (hi - 0xd800) * 1024 + (q - 0xdc00));
        k++;
        continue;
      }
      throw new UnsupportedError(
        "string-escape",
        `\\u${hi.toString(16)} 是孤立的前置代理（Godot: Invalid UTF-16 sequence in string, unpaired lead surrogate）`,
      );
    }
    if (hi >= 0xdc00 && hi <= 0xdfff) {
      throw new UnsupportedError(
        "string-escape",
        `\\u${hi.toString(16)} 是孤立的后续代理（Godot: Invalid UTF-16 sequence in string, unpaired trail surrogate）`,
      );
    }
    out += hi === 0 || hi > 0x10ffff ? "\uFFFD" : String.fromCodePoint(hi);
  }
  return out;
}
