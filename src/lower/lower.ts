import { UnsupportedError } from "../runtime/errors";
import type { SyntaxNode, Tree } from "../parse/parser";
import type {
  ClassDecl,
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

function lowerBody(n: SyntaxNode): Stmt[] {
  return named(n).map(lowerStmt);
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
      if (n.text === "_") return { kind: "wildcard" };
      throw new UnsupportedError("pattern-const", `常量模式 ${n.text} 未支持`);
    case "integer":
      return { kind: "lit", lit: "int", value: Number(n.text) };
    case "float":
      return { kind: "lit", lit: "float", value: Number(n.text) };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text) };
    case "true":
      return { kind: "lit", lit: "bool", value: true };
    case "false":
      return { kind: "lit", lit: "bool", value: false };
    case "null":
      return { kind: "lit", lit: "null", value: null };
    case "array":
      return { kind: "array", items: named(n).map(lowerPattern) };
    default:
      throw new UnsupportedError("pattern", `模式 ${n.type} 未支持`);
  }
}

// ---------------------------------------------------------------- 表达式

function lowerExpr(n: SyntaxNode): Expr {
  const c = loc(n);
  switch (n.type) {
    case "integer":
      return { kind: "lit", lit: "int", value: Number(n.text), loc: c };
    case "float":
      return { kind: "lit", lit: "float", value: Number(n.text), loc: c };
    case "string":
      return { kind: "lit", lit: "string", value: unquote(n.text), loc: c };
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

function unquote(raw: string): string {
  if (raw.length >= 2 && (raw.startsWith('"') || raw.startsWith("'"))) {
    const inner = raw.slice(1, -1);
    try {
      return JSON.parse(`"${inner}"`) as string;
    } catch {
      return inner;
    }
  }
  return raw;
}
