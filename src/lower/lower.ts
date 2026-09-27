import { parseGdDouble } from "./double";
import { UnsupportedError } from "../runtime/errors";
import type { SyntaxNode, Tree } from "../parse/parser";
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
  SignalDecl,
  Stmt,
  TypeRef,
  VarDecl,
} from "./ir";

/** CST → IR。只做「去糖 + 显式化」，不做优化（见 docs/ROADMAP.md §2）。 */

function loc(n: SyntaxNode): Loc {
  return { line: n.startPosition.row + 1, col: n.startPosition.column + 1 };
}

function field(n: SyntaxNode, name: string): SyntaxNode | null {
  return n.childForFieldName(name);
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

// ---------------------------------------------------------------- 类型

function lowerType(n: SyntaxNode): TypeRef {
  if (n.type === "inferred_type") return { kind: "variant" };
  return { kind: "named", name: n.text };
}

// ---------------------------------------------------------------- 模块 / 类

export function lower(tree: Tree): Module {
  return lowerModule(tree.rootNode);
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
        m.extends = // extends_statement 里的 type 是位置子节点，不是具名字段（grammar 没给它 field 名）
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
    loc: loc(n),
  };
}

function lowerSignal(n: SyntaxNode): SignalDecl {
  const paramsNode = field(n, "parameters");
  return {
    name: need(field(n, "name"), "信号名").text,
    params: paramsNode ? named(paramsNode).map((p) => p.text) : [],
    loc: loc(n),
  };
}

/**
 * `enum Name { A, B = 5, C }` —— 成员值自增，显式 `= N` 重置游标。
 * name 为 null 即匿名 enum（成员成为脚本级裸常量）。
 */
function lowerEnum(n: SyntaxNode): EnumDecl {
  const nameNode = field(n, "name");
  const list = field(n, "body"); // enumerator_list
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
  for (const c of named(body)) {
    switch (c.type) {
      case "extends_statement":
        decl.extends = // extends_statement 里的 type 是位置子节点，不是具名字段（grammar 没给它 field 名）
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
  const isStatic = n.children.some((c) => !c.isNamed && c.text === "static");

  return {
    name: need(field(n, "name"), "函数名").text,
    params: paramsNode ? named(paramsNode).map(lowerParam) : [],
    returnType: returnNode ? lowerType(returnNode) : null,
    body: bodyNode ? lowerBody(bodyNode) : [],
    // 协程性是静态可判定的：函数体里出现 await 就是协程（SEMANTICS S18）
    coroutine: hasAwait(n),
    isStatic,
    loc: loc(n),
  };
}

/**
 * `_init(...)` —— grammar 里是 constructor_definition，没有 name 字段（隐含 _init）。
 * 降级成名为 "_init" 的 FuncDecl，emitter 再把它发成 JS constructor。
 * _init 不能是协程（Godot 不允许 await），coroutine 恒 false。
 */
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

// ---------------------------------------------------------------- 语句

/**
 * 整数字面量必须**原样**保住精度：`Number("9223372036854775807")` 会先四舍五入成
 * ...808 才交给运行时，那样的 BigInt 路径永远拿不到正确值。2^53 内仍用 number
 * （让发射期保持裸数字），超出改用 bigint 字面量。顺带吃掉 GDScript 的 `1_000_000` 下划线。
 */
function lowerIntLit(text: string): number | bigint {
  const t = text.replace(/_/g, "");
  const n = Number(t);
  return Number.isSafeInteger(n) ? n : BigInt(t);
}

function lowerBody(n: SyntaxNode): Stmt[] {
  // 注释不参与语义，和顶层一样直接丢弃。tree-sitter 把 `#…` 挂成 block 的**具名**子节点，
  // 不先滤掉就会在 lowerStmt 的 default 分支炸成「语句 comment 未支持」。
  return named(n)
    .filter((c) => c.type !== "comment")
    .map(lowerStmt);
}

function lowerStmt(n: SyntaxNode): Stmt {
  const c = loc(n);
  switch (n.type) {
    case "variable_statement":
      return { kind: "var", ...lowerVar(n, false), loc: c } as Stmt;
    case "const_statement":
      return { kind: "var", ...lowerVar(n, true), loc: c } as Stmt;
    case "expression_statement": {
      const e = named(n)[0];
      if (!e) throw new UnsupportedError("empty-expr-stmt", "空表达式语句");
      // GDScript 的赋值语句是 (expression_statement (assignment ...))，
      // 不是独立的 assignment 语句节点 —— 不转发的话赋值永远走不到下面那个分支。
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
      // x += 1  →  x = x + 1（去糖）
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
    // `1, 2:` 这种多模式分支展开成多个共享同一体的 arm
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
      // `_` 是通配；其余裸标识符是**常量模式**（按值匹配 const / 脚本常量）。
      // 绑定要用 `var name`（grammar 出 pattern_binding），裸名不是绑定。
      if (n.text === "_") return { kind: "wildcard" };
      return { kind: "const", expr: lowerExpr(n) };
    case "attribute":
      // `Suit.HEARTS` / `Class.CONST` 这类限定常量 → 常量模式
      return { kind: "const", expr: lowerExpr(n) };
    case "integer":
      return { kind: "lit", lit: "int", value: lowerIntLit(n.text) };
    case "float":
      return { kind: "lit", lit: "float", value: parseGdDouble(n.text) };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text) };
    case "string_name":
      // &"abc" 的 CST 文本带前导 &，剥掉后与 string 走同一套转义解码
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
      // 字典模式：pair 的 left 是键表达式，value 是「值模式」（可嵌套数组/字典/字面/通配）
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

// ---------------------------------------------------------------- 表达式

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
      // grammar：attribute = 基础表达式 + 任意多段（identifier=属性 / attribute_call=方法）。
      // 必须逐段左折叠，否则 `a.b().c()` 只剩第一层，丢掉后面的段。
      let acc = lowerExpr(need(kids[0] ?? null, "属性对象"));
      for (const seg of kids.slice(1)) {
        if (seg.type === "attribute_call") {
          const name = need(named(seg)[0] ?? null, "方法名");
          const argsNode = field(seg, "arguments");
          acc = {
            kind: "call",
            callee: { kind: "attribute", obj: acc, name: name.text, loc: loc(seg) },
            args: argsNode ? named(argsNode).map(lowerExpr) : [],
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

/**
 * GDScript 字符串转义。**不能借用 JSON.parse**：JSON 的转义集比 GDScript 窄（没有 \a \v \'），
 * 而旧实现在 JSON.parse 抛错时 catch 后**原样返回带反斜杠的源码** —— 于是 "it\'s" 会静默变成
 * 字面 it\'s（Godot 实测 \' 就是 1 个撇号）。这正是"宁可响、不可静默错"要堵的口子。
 *
 * 下表逐条对 Godot 4.6.3 探针实测（9 个单转义探针文件，各只放一条 print，避免一个解析错拖垮整批）：
 *   \n \t \r \a \b \f \v \ \" \' 各 1 字符；"ab\ncd" 长 5；\u0041 → 65、\u00e9 → 233（取 4 位十六进制）。
 *   \x41 → Parse Error: Invalid escape in string（GDScript 没有 \x）。
 *   \u 吃**恰好 4 位**、\U 吃**恰好 6 位**十六进制，少一位都是 Parse Error:
 *     Invalid hexadecimal digit in unicode escape sequence（\U0041 / \U00041 / \U12 / \U00D800 之外的
 *     \U0001F600 这类"多出来的位"不是错，是按宽度吃掉后当普通字符：长度 3、码点 502/48/48）。
 *   \U110000 这种越界值不报错，串里那位变成 U+FFFD（Godot 另外往 stderr 打警告，我们不复现警告）。
 *   \U000000 → **不是** NUL：Godot 把串里的 NUL 也换成 U+FFFD（实测等于 String.chr(0xFFFD)），
 *     同样只伴随一条警告。
 *   **代理区**：`\uD800` / `\uDC00` 单独出现是 Parse Error「Invalid UTF-16 sequence in string,
 *     unpaired lead/trail surrogate」；但**相邻的 lead+trail 两个转义会配成一个码点** ——
 *     实测 `"\uD800\uDC00"`、`"\U00D800\U00DC00"`、`"\uD800\U00DC00x"` 长度分别是 1/1/2，
 *     且都等于 String.chr(0x10000)（跨 \u 与 \U 两种写法也能配）。所以配对要等整串切完才能判。
 * 认不出的转义一律响亮抛错，绝不退回原文。
 */
function unquote(raw: string): string {
  if (raw.length < 2 || !(raw.startsWith('"') || raw.startsWith("'"))) return raw;
  const inner = raw.slice(1, -1);
  // 先切成「字面片段 / 转义码点」的有序序列，配对与越界替换留到第二趟：
  // 代理对只可能出现在**相邻的两个转义**之间，中间隔了字面字符就不算。
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
        // \u = 4 位、\U = 6 位，且必须**恰好**这么多：少一位 Godot 就是 Parse Error，
        // 多出来的位不是错误，是留给后面的普通字符（实测 \U0001F600 → 0x1F6 + "00"）。
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
    // 越界（> U+10FFFF）与 **NUL** 都不是编译错：Godot 把那一位换成 U+FFFD，只在 stderr 警告一句
    // （实测 String.chr(0) == String.chr(0xFFFD) 为真、"a<U000000b" == "a"+chr(0xFFFD)+"b" 为真，
    // u0000 走同一条解码路、长度也是 3）。所以这里不能留真 NUL。
    out += p === 0 || p > 0x10ffff ? "\uFFFD" : String.fromCodePoint(p);
  }
  return out;
}
