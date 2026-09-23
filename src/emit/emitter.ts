import type { Expr, FuncDecl, Module, Stmt } from "../lower/ir";
import { UnsupportedError } from "../runtime/errors";

/**
 * IR → JS。
 *
 * v1 策略：**一律走动态路径 `ops.*`，不做单态快路径**。
 * 契约里 `fast.*` 已经定死，等这一版跑绿了再按 D2 加内联优化 —— 先要正确。
 */

const RUNTIME_IMPORT = "../../../src/runtime/index";
const HARNESS_IMPORT = "../../../tools/harness/scene-tree";

const BINOP: Record<string, string> = {
  "+": "add",
  "-": "sub",
  "*": "mul",
  "/": "div",
  "%": "mod",
  "**": "pow",
  "==": "eq",
  "!=": "neq",
  "<": "lt",
  "<=": "lte",
  ">": "gt",
  ">=": "gte",
  "<<": "shl",
  ">>": "shr",
  "&": "band",
  "|": "bor",
  "^": "bxor",
};

/** 映射到运行时的内置函数 */
const BUILTIN: Record<string, (args: string[]) => string> = {
  // range() 返回裸 GArray，包一层变体才能跟 rt.iter / 下标这些统一入口对接
  range: (a) =>
    `rt.V.array(rt.range(${a[0] ? `rt.num(${a[0]})` : "0"}${a[1] ? `, rt.num(${a[1]})` : ""}))`,
  str: (a) => `rt.strOf(${a.join(", ")})`,
  float: (a) => `rt.toFloat(${a.join(", ")})`,
  int: (a) => `rt.toInt(${a.join(", ")})`,
  bool: (a) => `rt.toBool(${a.join(", ")})`,
  sqrt: (a) => `rt.sqrt(${a.join(", ")})`,
  abs: (a) => `rt.abs(${a.join(", ")})`,
  len: (a) => `rt.lengthOf(${a.join(", ")})`,
};

/** 认得但还没实现的内置：宁可响，不能悄悄生成错代码 */
const BUILTIN_TODO = new Set(["typeof", "Vector2", "Vector2i", "Vector3", "Color", "String", "load", "preload"]);

export function emitModule(m: Module): string {
  const out: string[] = [];
  out.push("// 由 gds2js 从 main.gd 编译生成 —— 不要手改。");
  out.push("");
  out.push(`import * as rt from "${RUNTIME_IMPORT}";`);
  out.push(`import { print, SceneTree } from "${HARNESS_IMPORT}";`);
  out.push("");
  out.push("export class Main extends SceneTree {");
  for (const v of m.vars) {
    out.push(`  ${v.name} = ${v.init ? emitExpr(v.init) : "rt.V.nil()"};`);
  }
  if (m.vars.length > 0) out.push("");
  for (const f of m.funcs) {
    for (const line of emitFunc(f)) out.push(`  ${line}`);
  }
  out.push("}");
  out.push("");
  out.push("await new Main().run();");
  return `${out.join("\n")}\n`;
}

function emitFunc(f: FuncDecl): string[] {
  // 入口方法是 harness 约定的异步方法，必须保持 Promise 签名
  const isEntry = f.name === "_initialize" || f.name === "_process";
  const async = f.coroutine || isEntry ? "async " : "";
  const params = f.params.map((p) => p.name).join(", ");
  const hasValue = hasValueReturn(f.body);

  let ret: string;
  if (f.name === "_initialize") ret = "Promise<void>";
  else if (isEntry || f.coroutine) ret = "Promise<unknown>";
  else ret = hasValue ? "unknown" : "void";

  const lines = [`${async}${f.name}(${params}): ${ret} {`];
  for (const s of f.body) {
    for (const line of emitStmt(s, f.name === "_initialize")) lines.push(`  ${line}`);
  }
  lines.push("}");
  lines.push("");
  return lines;
}

function hasValueReturn(stmts: Stmt[]): boolean {
  for (const s of stmts) {
    if (s.kind === "return" && s.value) return true;
    if (s.kind === "if") {
      for (const br of s.branches) if (hasValueReturn(br.body)) return true;
    }
    if (s.kind === "for" || s.kind === "while") {
      if (hasValueReturn(s.body)) return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------- 语句

function emitStmt(s: Stmt, voidReturn: boolean): string[] {
  switch (s.kind) {
    case "var":
      // 直接发射 let —— 块作用域由 JS 自己保证，正好对应 S16
      return [`let ${s.name} = ${s.init ? emitExpr(s.init) : "rt.V.nil()"};`];

    case "expr":
      return [`${emitExpr(s.expr)};`];

    case "assign":
      return [emitAssign(s.target, emitExpr(s.value))];

    case "return":
      if (!s.value) return ["return;"];
      // _initialize 的返回类型被钉成 Promise<void>，有返回值时用 void 吃掉
      return voidReturn ? [`return void (${emitExpr(s.value)});`] : [`return ${emitExpr(s.value)};`];

    case "if": {
      const lines: string[] = [];
      s.branches.forEach((br, i) => {
        const prefix = i === 0 ? "" : "} ";
        const kw = i === 0 ? "if" : br.cond ? "else if" : "else";
        const cond = br.cond ? ` (rt.ops.truthy(${emitExpr(br.cond)}))` : "";
        lines.push(`${prefix}${kw}${cond} {`);
        for (const st of br.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`  ${line}`);
        }
      });
      lines.push("}");
      return lines;
    }

    case "for":
      return [
        `for (const ${s.var} of rt.iter(${emitExpr(s.iter)})) {`,
        ...s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`)),
        "}",
      ];

    case "while":
      return [
        `while (rt.ops.truthy(${emitExpr(s.cond)})) {`,
        ...s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`)),
        "}",
      ];

    case "break":
      return ["break;"];
    case "continue":
      return ["continue;"];
    case "pass":
      return ["/* pass */"];

    case "match":
      throw new UnsupportedError("emit-match", "match 还没实现");
  }
}

function emitAssign(target: Expr, value: string): string {
  if (target.kind === "ident") return `${target.name} = ${value};`;
  if (target.kind === "index") {
    return `rt.setIndex(${emitExpr(target.obj)}, ${emitExpr(target.index)}, ${value});`;
  }
  throw new UnsupportedError("emit-assign", `赋值目标 ${target.kind} 还没实现`);
}

// ---------------------------------------------------------------- 表达式

function emitExpr(e: Expr): string {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int") return `rt.V.int(${String(e.value)})`;
      if (e.lit === "float") return `rt.V.float(${String(e.value)})`;
      if (e.lit === "string") return `rt.V.str(${JSON.stringify(e.value)})`;
      if (e.lit === "bool") return `rt.V.bool(${String(e.value)})`;
      return "rt.V.nil()";

    case "ident":
      return e.name;

    case "unary":
      if (e.op === "not") return `rt.V.bool(!rt.ops.truthy(${emitExpr(e.operand)}))`;
      if (e.op === "-") return `rt.ops.neg(${emitExpr(e.operand)})`;
      if (e.op === "~") return `rt.ops.bnot(${emitExpr(e.operand)})`;
      throw new UnsupportedError("emit-unary", `一元运算符 ${e.op} 还没实现`);

    case "await":
      return `(await ${emitExpr(e.operand)})`;

    case "binary":
      return emitBinary(e);

    case "array":
      return `rt.V.array(rt.GArray.of([${e.items.map(emitExpr).join(", ")}]))`;

    case "dict": {
      const pairs = e.entries.map((en) => `[${emitExpr(en.key)}, ${emitExpr(en.value)}]`);
      return `rt.dictOf([${pairs.join(", ")}])`;
    }

    case "index":
      return `rt.index(${emitExpr(e.obj)}, ${emitExpr(e.index)})`;

    case "attribute":
      return `rt.attribute(${emitExpr(e.obj)}, ${JSON.stringify(e.name)})`;

    case "call":
      return emitCall(e);

    case "lambda":
      throw new UnsupportedError("emit-lambda", "lambda 还没实现");

    case "is":
    case "as":
      throw new UnsupportedError("emit-is-as", "is / as 还没实现");
  }
}

function emitBinary(e: Extract<Expr, { kind: "binary" }>): string {
  const l = emitExpr(e.left);
  const r = emitExpr(e.right);

  // `"%d" % [...]` 是格式化，不是取模
  if (e.op === "%" && e.left.kind === "lit" && e.left.lit === "string") {
    return `rt.formatOf(${l}, ${r})`;
  }
  if (e.op === "in") return `rt.ops.inOp(${l}, ${r})`;
  if (e.op === "and") return `rt.and(${l}, () => ${r})`;
  if (e.op === "or") return `rt.or(${l}, () => ${r})`;

  const fn = BINOP[e.op];
  if (!fn) throw new UnsupportedError("emit-binary", `二元运算符 ${e.op} 还没实现`);
  return `rt.ops.${fn}(${l}, ${r})`;
}

function emitCall(e: Extract<Expr, { kind: "call" }>): string {
  const args = e.args.map(emitExpr);

  if (e.callee.kind === "ident") {
    const name = e.callee.name;
    // print 是 GDScript 全局函数，参数要先 show 成字符串
    if (name === "print") return `print(${args.map((a) => `rt.show(${a})`).join(", ")})`;

    const builtin = BUILTIN[name];
    if (builtin) return builtin(args);
    if (BUILTIN_TODO.has(name)) {
      throw new UnsupportedError("emit-builtin", `内置函数 ${name}() 还没实现`);
    }
    // 其余一律当作继承来的方法 —— 与语义分析层的宽容策略一致
    // （create_timer / quit 这些是 SceneTree 上的，不是本脚本定义的）
    return `this.${name}(${args.join(", ")})`;
  }

  if (e.callee.kind === "attribute") {
    const obj = emitExpr(e.callee.obj);
    return `rt.method(${obj}, ${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
  }
  throw new UnsupportedError("emit-call", "不支持的调用形式");
}
