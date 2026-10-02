import { parseGdDouble } from "@gds2js/runtime/shared/double";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
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

/** 按 fieldName 在 children 里取字段节点（字段名挂在孩子自己那一格上）。 */
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

/** 取运算符：grammar 里运算符是匿名节点（+、-、is、as …） */
function operatorOf(n: SyntaxNode): string {
  const op = n.children.find((c) => !c.isNamed);
  if (!op) throw new UnsupportedError("missing-operator", `${n.type} 找不到运算符`);
  return op.text;
}

function named(n: SyntaxNode): SyntaxNode[] {
  return n.namedChildren;
}

function lowerType(n: SyntaxNode): TypeRef {
  if (n.type === "inferred_type") return { kind: "variant" };
  return { kind: "named", name: n.text };
}

/** `lower()` 一次调用内累计：这一份模块有没有 compress()/decompress() 调用。 */
let packCodecUse = false;

export function lower(tree: Tree): Module {
  packCodecUse = false;
  const m = lowerModule(tree.rootNode);
  if (packCodecUse) m.usesPackCodec = true;
  return m;
}

function lowerModule(root: SyntaxNode): Module {
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
      default:
        throw new UnsupportedError("module-node", `顶层节点 ${c.type} 未支持`);
    }
  }
  return m;
}

function lowerVar(n: SyntaxNode, isConst: boolean): VarDecl {
  const typeNode = field(n, "type");
  const valueNode = field(n, "value");
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

/** 属性访问器（文法里是 `setget` 子节点），两种写法行为一致都收：块式 `get:` / `set(value):` 走 inline，引用式 `get = _getp, set = _setp` 走 method。 */
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
    else if (c.isNamed) {
      throw new UnsupportedError("property-setget", `属性访问器里没见过的形态：${c.type} ${JSON.stringify(c.text.slice(0, 24))}`);
    }
  }
  if (getter === null) {
    throw new UnsupportedError("property-setget", "只带 set 不带 get 的属性访问器还没实测过，先拒绝");
  }
  return { getter, setter };
}

function lowerSignal(n: SyntaxNode): SignalDecl {
  const paramsNode = field(n, "parameters");
  return {
    name: need(field(n, "name"), "信号名").text,
    params: paramsNode ? named(paramsNode).map((p) => p.text) : [],
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
  // 内部类的 `class X extends Y:` 里 extends_statement 是 class_definition 的直接孩子（与 class_body 同级），只扫类体会把基类静默丢掉
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
        decl.vars.push(lowerVar(c, false));
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
      // `class X extends Y: pass` 合法，就是「没有自有成员」
      case "pass_statement":
        break;
      case "annotation":
        break;
      default:
        throw new UnsupportedError("class-node", `类内节点 ${c.type} 未支持`);
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
      return {
        kind: "assign",
        target: lowerExpr(need(field(n, "left"), "赋值左值")),
        value: lowerExpr(need(field(n, "right"), "赋值右值")),
        loc: c,
      };
    case "augmented_assignment": {
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
    case "for_statement":
      return {
        kind: "for",
        var: need(field(n, "left"), "循环变量").text,
        iter: lowerExpr(need(field(n, "right"), "迭代对象")),
        body: lowerBody(need(field(n, "body"), "循环体")),
        loc: c,
      };
    case "while_statement":
      return {
        kind: "while",
        cond: lowerExpr(need(field(n, "condition"), "循环条件")),
        body: lowerBody(need(field(n, "body"), "循环体")),
        loc: c,
      };
    case "match_statement":
      return lowerMatch(n);
    default:
      throw new UnsupportedError("stmt", `语句 ${n.type} 未支持`);
  }
}

function lowerIf(n: SyntaxNode): Stmt {
  const branches: Extract<Stmt, { kind: "if" }>["branches"] = [
    {
      cond: lowerExpr(need(field(n, "condition"), "if 条件")),
      body: lowerBody(need(field(n, "body"), "if 体")),
    },
  ];
  let alt = field(n, "alternative");
  while (alt) {
    if (alt.type === "elif_clause") {
      branches.push({
        cond: lowerExpr(need(field(alt, "condition"), "elif 条件")),
        body: lowerBody(need(field(alt, "body"), "elif 体")),
      });
    } else if (alt.type === "else_clause") {
      branches.push({ cond: null, body: lowerBody(need(field(alt, "body"), "else 体")) });
    } else {
      throw new UnsupportedError("if-alt", `if 分支 ${alt.type} 未支持`);
    }
    alt = field(alt, "alternative");
  }
  return { kind: "if", branches, loc: loc(n) };
}

function lowerMatch(n: SyntaxNode): Stmt {
  const subject = lowerExpr(need(field(n, "value"), "match 主题"));
  const body = need(field(n, "body"), "match 体");
  const arms: MatchArm[] = [];
  for (const section of named(body)) {
    if (section.type !== "pattern_section") {
      throw new UnsupportedError("match-node", `match 内节点 ${section.type} 未支持`);
    }
    const sectionBody = lowerBody(need(field(section, "body"), "match 分支体"));
    const guardNode = named(section).find((x) => x.type === "pattern_guard");
    const guard = guardNode ? lowerExpr(need(field(guardNode, "condition") ?? named(guardNode)[0], "when 条件")) : null;
    const patternNodes = named(section).filter((x) => x !== guardNode && x.type !== "body");
    for (const p of patternNodes) {
      arms.push({ pattern: lowerPattern(p), guard, body: sectionBody });
    }
  }
  return { kind: "match", subject, arms, loc: loc(n) };
}

function lowerPattern(n: SyntaxNode): Pattern {
  switch (n.type) {
    case "pattern_binding": {
      const id = named(n)[0];
      return { kind: "bind", name: id ? id.text : n.text };
    }
    case "identifier":
      if (n.text === "_") return { kind: "wildcard" };
      return { kind: "const", expr: lowerExpr(n) };
    case "attribute":
      return { kind: "const", expr: lowerExpr(n) };
    case "integer":
      return { kind: "lit", lit: "int", value: lowerIntLit(n.text) };
    case "float":
      return { kind: "lit", lit: "float", value: parseGdDouble(n.text) };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text) };
    case "string_name":
      return { kind: "lit", lit: "string_name", value: unquote(stripAmp(n.text)) };
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
    default:
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
  }
}

function lowerExpr(n: SyntaxNode): Expr {
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
    case "unary_operator":
      return { kind: "unary", op: operatorOf(n), operand: lowerExpr(need(named(n)[0], "一元操作数")), loc: c };
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
      const argsNode = field(n, "arguments");
      return { kind: "call", callee, args: argsNode ? named(argsNode).map(lowerExpr) : [], loc: c };
    }
    case "binary_operator": {
      const op = operatorOf(n);
      const left = lowerExpr(need(field(n, "left"), "左操作数"));
      const right = need(field(n, "right"), "右操作数");
      if (op === "is") return { kind: "is", operand: left, type: lowerType(right), loc: c };
      if (op === "as") return { kind: "as", operand: left, type: lowerType(right), loc: c };
      return { kind: "binary", op, left, right: lowerExpr(right), loc: c };
    }
    default:
      throw new UnsupportedError("expr", `表达式 ${n.type} 未支持`);
  }
}

/** `&"abc"` 的 CST 文本连前导 `&` 一起给，剥掉后才能和 String 共用同一套转义解码。 */
function stripAmp(text: string): string {
  return text.startsWith("&") ? text.slice(1) : text;
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
      // 代理对必须**整对**推进去：拼半个代理会被换成 U+FFFD，而 `slice` 出来的整对是好的 —— 所以这里按码点切，不按码元切。
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
    if (p >= 0xd800 && p <= 0xdbff) {
      const q = parts[k + 1];
      if (typeof q === "number" && q >= 0xdc00 && q <= 0xdfff) {
        out += String.fromCodePoint(0x10000 + ((p - 0xd800) << 10) + (q - 0xdc00));
        k++;
        continue;
      }
      throw new UnsupportedError(
        "string-escape",
        `\\u${p.toString(16)} 是孤立的前置代理（Godot: Invalid UTF-16 sequence in string, unpaired lead surrogate）`,
      );
    }
    if (p >= 0xdc00 && p <= 0xdfff) {
      throw new UnsupportedError(
        "string-escape",
        `\\u${p.toString(16)} 是孤立的后续代理（Godot: Invalid UTF-16 sequence in string, unpaired trail surrogate）`,
      );
    }
    out += p === 0 || p > 0x10ffff ? "\uFFFD" : String.fromCodePoint(p);
  }
  return out;
}
