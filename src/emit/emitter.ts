import type { Expr, FuncDecl, Module, Pattern, Stmt, TypeRef } from "../lower/ir";
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
  typeof: (a) => `rt.typeOf(${a.join(", ")})`,
};

/** 认得但还没实现的内置：宁可响，不能悄悄生成错代码 */
const BUILTIN_TODO = new Set([
  "Vector2",
  "Vector2i",
  "Vector3",
  "Color",
  "String",
  "load",
  "preload",
]);

/**
 * 模块级名字。局部变量不在里面，所以发射成裸标识符；
 * 模块级的变量 / 信号 / 函数被发射成类字段或方法，引用时必须带 `this.`。
 *
 * 已知缺口：局部变量与模块级变量同名时会被误判成 `this.x`。
 * emitter 目前没有作用域信息，等 IR 带上符号解析结果再修。
 */
let MODULE_VARS = new Set<string>();
let MODULE_FUNCS = new Set<string>();

export function emitModule(m: Module): string {
  MODULE_VARS = new Set([...m.vars.map((v) => v.name), ...m.signals.map((s) => s.name)]);
  MODULE_FUNCS = new Set(m.funcs.map((f) => f.name));

  const out: string[] = [];
  out.push("// 由 gds2js 从 main.gd 编译生成 —— 不要手改。");
  out.push("");
  out.push(`import * as rt from "${RUNTIME_IMPORT}";`);
  out.push(`import { print, SceneTree } from "${HARNESS_IMPORT}";`);
  out.push("");
  out.push("export class Main extends SceneTree {");
  for (const s of m.signals) out.push(`  ${s.name} = new rt.Signal();`);
  for (const v of m.vars) {
    out.push(`  ${v.name} = ${v.init ? emitExpr(v.init) : "rt.V.nil()"};`);
  }
  if (m.signals.length > 0 || m.vars.length > 0) out.push("");
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
    case "var": {
      // 直接发射 let —— 块作用域由 JS 自己保证，正好对应 S16
      const init = s.init ? emitExpr(s.init) : "rt.V.nil()";
      // 带类型标注的声明要做截断：`var i: int = 3.9` 在 Godot 里是 3，不是 3.9（S6）
      const cast = declaredCast(s.type);
      return [`let ${s.name} = ${cast ? `${cast}(${init})` : init};`];
    }

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

    case "match": {
      // do-while(false) + break：让第一个命中的 arm 接管，其余跳过。
      // 已知限制：arm 体内若要对**外层循环** break/continue，会被这里截住。
      const subject = emitExpr(s.subject);
      const lines: string[] = ["do {"];
      s.arms.forEach((arm, i) => {
        const m = `__m${i}`;
        const guard = arm.guard ? ` && rt.ops.truthy(${emitExpr(arm.guard)})` : "";
        lines.push(`  const ${m} = rt.matchPattern(${subject}, ${emitPattern(arm.pattern)});`);
        lines.push(`  if (${m} !== null${guard}) {`);
        patternNames(arm.pattern).forEach((name, idx) => {
          lines.push(`    const ${name} = ${m}[${idx}];`);
        });
        for (const st of arm.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`    ${line}`);
        }
        lines.push("    break;");
        lines.push("  }");
      });
      lines.push("} while (false);");
      return lines;
    }
  }
}

function emitAssign(target: Expr, value: string): string {
  if (target.kind === "ident") return `${emitExpr(target)} = ${value};`;
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
      // 必须 bind(this)：光传 this.f 出去会在调用时丢掉接收者
      if (MODULE_FUNCS.has(e.name)) return `rt.callableOf(this.${e.name}.bind(this))`;
      if (MODULE_VARS.has(e.name)) return `this.${e.name}`;
      return e.name;

    case "unary":
      if (e.op === "not") return `rt.V.bool(!rt.ops.truthy(${emitExpr(e.operand)}))`;
      if (e.op === "-") return `rt.ops.neg(${emitExpr(e.operand)})`;
      if (e.op === "~") return `rt.ops.bnot(${emitExpr(e.operand)})`;
      throw new UnsupportedError("emit-unary", `一元运算符 ${e.op} 还没实现`);

    case "await":
      // 统一走 rt.awaitValue：Signal 会真的挂起，非信号值原样返回（S22）
      return `(await rt.awaitValue(${emitExpr(e.operand)}))`;

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

    case "lambda": {
      const params = e.params.map((p) => p.name).join(", ");
      const body = e.body.flatMap((st) => emitStmt(st, false).map((l) => `      ${l}`));
      // 直接用 JS 箭头函数：闭包捕获天然是「每次迭代独立」的，正好对应 S17
      return `rt.callable((${params}) => {\n${body.join("\n")}\n    })`;
    }

    case "call":
      return emitCall(e);

    case "is":
      return `rt.isType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;

    case "as":
      return `rt.asType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;
  }
}

/** 带类型标注的声明需要显式转换（S6：float 赋给 int 向零截断） */
function declaredCast(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.toInt";
  if (base === "float") return "rt.toFloat";
  if (base === "bool") return "rt.toBool";
  if (base === "String") return "rt.strOf";
  return null;
}

function typeName(t: TypeRef): string {
  if (t.kind === "named") return t.name;
  if (t.kind === "array") return "Array";
  return "Variant";
}

function emitPattern(p: Pattern): string {
  switch (p.kind) {
    case "wildcard":
      return "rt.patWild()";
    case "bind":
      return "rt.patBind()";
    case "lit":
      return `rt.patLit(${emitLit(p.lit, p.value)})`;
    case "array":
      return `rt.patArray([${p.items.map(emitPattern).join(", ")}])`;
    case "dict":
      throw new UnsupportedError("emit-pattern-dict", "字典模式还没实现");
  }
}

function emitLit(lit: string, value: string | number | boolean | null): string {
  if (lit === "int") return `rt.V.int(${String(value)})`;
  if (lit === "float") return `rt.V.float(${String(value)})`;
  if (lit === "string") return `rt.V.str(${JSON.stringify(value)})`;
  if (lit === "bool") return `rt.V.bool(${String(value)})`;
  return "rt.V.nil()";
}

function patternNames(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternNames);
    default:
      return [];
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
