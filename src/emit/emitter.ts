import type { ClassDecl, Expr, FuncDecl, Loc, Module, Pattern, Stmt, TypeRef } from "../lower/ir";
import { UnsupportedError } from "../runtime/errors";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

/**
 * IR → JS。
 *
 * v1 策略：**一律走动态路径 `ops.*`，不做单态快路径**。
 * 契约里 `fast.*` 已经定死，等这一版跑绿了再按 D2 加内联优化 —— 先要正确。
 */

/**
 * 顶层 extends 解析出的基类，由调用方（CLI / 项目层）决定：
 * - `host`  继承宿主的 `SceneTree`（语料入口脚本的默认）
 * - `none`  不继承任何基类（库类、或 `--no-host`）
 * - `import` 继承跨文件的用户基类，`from` 是它的 ESM 说明符
 */
export type BaseSpec =
  | { kind: "host" }
  | { kind: "none" }
  | { kind: "import"; name: string; from: string };

export interface EmitOptions {
  /** 运行时的 import 说明符。语料用相对路径；发布产物用 "gds2js/runtime" */
  runtimeImport?: string;
  /**
   * 宿主（SceneTree 基类 + print）的 import 说明符。
   * 语料用相对路径；发布产物用 "gds2js/host"。
   * 传 null 表示不引入宿主、发射成不继承任何基类的纯类。
   */
  hostImport?: string | null;
  /** 模块末尾是否自动 `await new Main().run()`。语料要，产物不要 */
  autoRun?: boolean;
  /** 顶层类名。默认 "Main"（语料沿用）；多文件由项目层传真实 class_name / 文件名派生 */
  className?: string;
  /**
   * 顶层 extends 的解析结果。省略时按向后兼容回落：有宿主 → host，无宿主 → none。
   */
  baseClass?: BaseSpec;
  /**
   * 跨文件引用的类：GDScript `class_name` → 提供该类的 ESM 说明符。
   * 项目层解出依赖边后传入，emitter 发射成 `import { name } from "from"`，
   * 并把这些名字纳入 `MODULE_CLASSES`，让 `Foo.new()` / `is Foo` 认得它们。
   */
  classRefs?: Array<{ name: string; from: string }>;
  /** 该产物自己的 res:// 路径；给了才发射 `rt.registerScript(resPath, 类)`，供 load() 解析。 */
  resPath?: string;
  /** `preload("字面量")` → 解析到的绑定名 + 提供它的 ESM 说明符。 */
  preloads?: Array<{ literal: string; name: string; from: string }>;
  /** `load("字面量")` → 规范化 res 路径（脚本注册表的键），保证运行时查得到。 */
  loadMap?: Array<{ literal: string; resPath: string }>;
  /** 只需触发注册、不绑定名字的副作用 import（动态 load 的目标脚本）。 */
  sideEffectImports?: string[];
  /**
   * extends 链上继承来的成员名（字段/方法/信号）。
   * 值位置引用继承字段要发成 `this.x`，否则裸标识符运行期 ReferenceError。
   */
  inheritedMembers?: string[];
  /** 生成行粒度 sourcemap（默认关，关掉时产出的字节与不生成时完全一致）。 */
  sourcemap?: boolean;
  /** sourcemap 的 sources 字段（通常是 .gd 源文件路径，相对 sourceRoot 或直接路径）。 */
  sourceFile?: string;
  /** 产物文件名（sourcemap 的 file 字段与 //# sourceMappingURL 用它，需与实际写盘名一致）。 */
  jsFile?: string;
}

const DEFAULT_RUNTIME_IMPORT = "../../../src/runtime/index";
const DEFAULT_HOST_IMPORT = "../../../tools/harness/scene-tree";

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
  Vector2: (a) => `rt.vector2(rt.num(${a[0]}), rt.num(${a[1]}))`,
};

/** 认得但还没实现的内置：宁可响，不能悄悄生成错代码 */
const BUILTIN_TODO = new Set(["Vector2i", "Vector3", "Color", "String", "load", "preload"]);

/**
 * 模块级名字。局部变量不在里面，所以发射成裸标识符；
 * 模块级的变量 / 信号 / 函数被发射成类字段或方法，引用时必须带 `this.`。
 *
 * 已知缺口：局部变量与模块级变量同名时会被误判成 `this.x`。
 * emitter 目前没有作用域信息，等 IR 带上符号解析结果再修。
 */
let MODULE_VARS = new Set<string>();
let MODULE_FUNCS = new Set<string>();
let MODULE_CLASSES = new Set<string>();
/** preload("字面量") → 解析到的类绑定名 */
let PRELOADS = new Map<string, string>();
/** load("字面量") → 规范化 res 路径（脚本注册表的键） */
let LOADS = new Map<string, string>();
/** 当前正在发射的类的成员名（内部类方法里引用 `hp` 要变成 `this.hp`） */
let CURRENT_MEMBERS = new Set<string>();

// ---- sourcemap 采集（只在 emitModuleWithMap 且 opts.sourcemap 时启用）----
let MAP_ACTIVE = false;
let LINE_MAPPINGS: LineMapping[] = [];
/** 记录「生成第 genLine 行（0-based）」来自源 loc。只读不写，不影响输出字节。 */
function mark(genLine: number, loc: Loc | undefined): void {
  if (!MAP_ACTIVE || !loc) return;
  LINE_MAPPINGS.push({ genLine, srcLine: loc.line - 1, srcCol: loc.col - 1 });
}

export interface EmitResult {
  code: string;
  map: RawSourceMap | null;
}

export function emitModule(m: Module, opts: EmitOptions = {}): string {
  return emitModuleWithMap(m, opts).code;
}

export function emitModuleWithMap(m: Module, opts: EmitOptions = {}): EmitResult {
  MAP_ACTIVE = opts.sourcemap === true;
  LINE_MAPPINGS = [];
  const runtimeImport = opts.runtimeImport ?? DEFAULT_RUNTIME_IMPORT;
  const hostImport = opts.hostImport === undefined ? DEFAULT_HOST_IMPORT : opts.hostImport;
  const autoRun = opts.autoRun ?? true;
  const className = opts.className ?? "Main";
  const classRefs = opts.classRefs ?? [];
  const resPath = opts.resPath;
  const preloads = opts.preloads ?? [];
  const sideEffectImports = opts.sideEffectImports ?? [];
  // 向后兼容：省略 baseClass 时，有宿主就继承 SceneTree，无宿主则不继承。
  const baseClass: BaseSpec = opts.baseClass ?? (hostImport ? { kind: "host" } : { kind: "none" });

  MODULE_VARS = new Set([
    ...m.vars.map((v) => v.name),
    ...m.signals.map((s) => s.name),
    ...(opts.inheritedMembers ?? []),
  ]);
  MODULE_FUNCS = new Set(m.funcs.map((f) => f.name));
  MODULE_CLASSES = new Set([
    ...m.innerClasses.map((c) => c.name),
    ...(m.className ? [m.className] : []),
    ...classRefs.map((r) => r.name),
  ]);
  PRELOADS = new Map(preloads.map((p) => [p.literal, p.name]));
  LOADS = new Map((opts.loadMap ?? []).map((l) => [l.literal, l.resPath]));

  const out: string[] = [];
  out.push("// 由 gds2js 从 main.gd 编译生成 —— 不要手改。");
  out.push("");
  out.push(`import * as rt from "${runtimeImport}";`);
  // 宿主提供 print（全局函数）；只有基类解析到 host 时才顺带 import SceneTree。
  if (hostImport) {
    const hostNames = baseClass.kind === "host" ? ["print", "SceneTree"] : ["print"];
    out.push(`import { ${hostNames.join(", ")} } from "${hostImport}";`);
  }
  // 跨文件类引用 + preload 目标都要 import 才能触发定义方的 registerClass/registerScript。
  const imports = new Map<string, string>(); // 绑定名 → 说明符
  for (const ref of classRefs) imports.set(ref.name, ref.from);
  for (const p of preloads) imports.set(p.name, p.from);
  for (const [name, from] of imports) out.push(`import { ${name} } from "${from}";`);
  for (const spec of sideEffectImports ?? []) out.push(`import "${spec}";`);
  if (baseClass.kind === "import") out.push(`import { ${baseClass.name} } from "${baseClass.from}";`);
  out.push("");

  const heritage =
    baseClass.kind === "host" ? " extends SceneTree"
    : baseClass.kind === "import" ? ` extends ${baseClass.name}`
    : "";
  out.push(`export class ${className}${heritage} {`);
  for (const s of m.signals) {
    mark(out.length, s.loc);
    out.push(`  ${s.name} = new rt.Signal();`);
  }
  for (const v of m.vars) {
    mark(out.length, v.loc);
    out.push(`  ${v.name} = ${v.init ? emitExpr(v.init) : "rt.V.nil()"};`);
  }
  if (m.signals.length > 0 || m.vars.length > 0) out.push("");
  for (const f of m.funcs) {
    const base = out.length;
    const lines = emitFunc(f, base);
    for (const line of lines) out.push(`  ${line}`);
  }
  out.push("}");
  out.push("");

  // 有 class_name 的脚本注册进运行时全局表：跨文件的 `is Foo` / `as Foo` 靠它。
  if (m.className) out.push(`rt.registerClass(${JSON.stringify(m.className)}, ${className});`);
  // 按 res:// 路径注册：`load("res://…")` 与 `preload` 一致性都靠它。
  if (resPath) out.push(`rt.registerScript(${JSON.stringify(resPath)}, ${className});`);

  // 内部类是模块级声明，发射成兄弟类（GDScript 里它们对整个脚本可见）
  for (const c of m.innerClasses) {
    const base = out.length;
    for (const line of emitClassDecl(c, base)) out.push(line);
  }

  if (autoRun) out.push(`await new ${className}().run();`);

  let code = `${out.join("\n")}\n`;
  let map: RawSourceMap | null = null;
  if (MAP_ACTIVE) {
    const sourceFile = opts.sourceFile ?? `${className}.gd`;
    const jsFile = opts.jsFile ?? `${className}.mjs`;
    map = buildSourceMap({ file: jsFile, source: sourceFile, mappings: LINE_MAPPINGS });
    code += `//# sourceMappingURL=${jsFile}.map\n`;
  }
  MAP_ACTIVE = false;
  return { code, map };
}

function emitClassDecl(decl: ClassDecl, base = 0): string[] {
  if (decl.extends) {
    throw new UnsupportedError("class-extends", `类 ${decl.name} 的 extends 还没实现`);
  }
  const saved = CURRENT_MEMBERS;
  CURRENT_MEMBERS = new Set(decl.vars.map((v) => v.name));

  const lines = [`class ${decl.name} {`];
  mark(base, decl.loc);
  for (const v of decl.vars) {
    mark(base + lines.length, v.loc);
    lines.push(`  ${v.name} = ${v.init ? emitExpr(v.init) : "rt.V.nil()"};`);
  }
  if (decl.vars.length > 0) lines.push("");
  for (const f of decl.funcs) {
    const funcBase = base + lines.length;
    for (const line of emitFunc(f, funcBase)) lines.push(`  ${line}`);
  }
  lines.push("}");
  // 注册进运行时的类注册表，`is` 判定和 Base.new() 都靠它
  lines.push(`rt.registerClass(${JSON.stringify(decl.name)}, ${decl.name});`);
  lines.push("");

  CURRENT_MEMBERS = saved;
  return lines;
}

function emitFunc(f: FuncDecl, base = 0): string[] {
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
  mark(base, f.loc);
  for (const s of f.body) {
    mark(base + lines.length, s.loc);
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
      return emitLit(e.lit, e.value);

    case "ident":
      // 必须 bind(this)：光传 this.f 出去会在调用时丢掉接收者
      if (MODULE_FUNCS.has(e.name)) return `rt.callableOf(this.${e.name}.bind(this))`;
      // 类方法里引用自己的成员变量
      if (CURRENT_MEMBERS.has(e.name)) return `this.${e.name}`;
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

function emitLit(lit: string, value: string | number | boolean | null): string {
  if (lit === "int") return `rt.V.int(${String(value)})`;
  if (lit === "float") return `rt.V.float(${String(value)})`;
  if (lit === "string") return `rt.V.str(${JSON.stringify(value)})`;
  if (lit === "bool") return `rt.V.bool(${String(value)})`;
  return "rt.V.nil()";
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

    // preload(工程内脚本) → 编译期就解析成静态 import 进来的类绑定
    if (name === "preload") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const bound = lit !== null ? PRELOADS.get(lit) : undefined;
      if (bound) return `rt.scriptValue(${bound})`;
      throw new UnsupportedError(
        "emit-preload",
        `preload(${lit ?? "非字面量"}) 未解析到工程内的 .gd（跨文件编译需能定位该脚本）`,
      );
    }
    // load(路径) → 运行时按 res:// 查脚本注册表（目标已由项目层副作用 import 注册）
    if (name === "load") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const canonical = lit !== null ? LOADS.get(lit) : undefined;
      if (canonical) return `rt.loadScript(${JSON.stringify(canonical)})`;
      return `rt.loadScript(${args[0]})`;
    }

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
    // Base.new() → 构造一个用户类实例
    if (
      e.callee.name === "new" &&
      e.callee.obj.kind === "ident" &&
      MODULE_CLASSES.has(e.callee.obj.name)
    ) {
      return `rt.V.object(new ${e.callee.obj.name}(${args.join(", ")}))`;
    }
    const obj = emitExpr(e.callee.obj);
    return `rt.method(${obj}, ${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
  }
  throw new UnsupportedError("emit-call", "不支持的调用形式");
}
