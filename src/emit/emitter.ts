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
  /**
   * 跨文件编译时由项目层传入：工程内**任何模块**里作为属性访问名 / 裸标识符出现过、
   * 或被继承过的函数名。这些名字一律禁止裸 ABI（它们可能被 obj.f()/Callable 以装箱实参触达）。
   * 单文件编译时无需传——本模块扫描即为全集。
   */
  rawAbiExternal?: string[];
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
/** 正在发射 _init（constructor）体——只有此上下文允许 super(...) 构造调用。 */
let IN_CONSTRUCTOR = false;
/** 正在发射的模块里 named enum 的名字（`Suit.HEARTS` 点访问要特判成 rt.index） */
let ENUM_NAMES = new Set<string>();
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

  // enum → 模块作用域常量。named enum 发成 GDict（`Suit["X"]`/keys()/values()/size()/for-in 全走 Dictionary 路径），
  // `Suit.HEARTS` 点访问由 emitExpr 特判成 rt.index（GDScript 只允许 enum 点访问，不允许普通 dict 点访问）。
  // 匿名 enum 的成员是脚本级裸 int 常量。值是 Variant int，故 `Suit.X + 1` / print 都走正常路径。
  ENUM_NAMES = new Set<string>();
  for (const en of m.enums) {
    mark(out.length, en.loc);
    if (en.name) {
      ENUM_NAMES.add(en.name);
      const pairs = en.members.map((mm) => `[rt.V.str(${JSON.stringify(mm.name)}), rt.V.int(${mm.value})]`).join(", ");
      out.push(`const ${en.name} = rt.dictOf([${pairs}]);`);
    } else {
      for (const mm of en.members) out.push(`const ${mm.name} = rt.V.int(${mm.value});`);
    }
  }
  if (m.enums.length > 0) out.push("");

  // 参数/返回单态化（D2 第三轨）：逐模块算出裸 ABI 函数集，供 emitFunc/emitExprR/computeUnboxed 共享。
  RAW_ABIS = computeRawAbis(m, {
    hasBase: baseClass.kind === "import",
    inherited: new Set(opts.inheritedMembers ?? []),
    external: new Set(opts.rawAbiExternal ?? []),
  });

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
    const lines = emitFunc(f, base, baseClass.kind !== "none");
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
  RAW_ABIS = new Map();
  RAW_ARRAYS = new Map();
  CURRENT_RET = null;
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

function emitFunc(f: FuncDecl, base = 0, hasSuper = false): string[] {
  // _init → JS constructor（构造参数即 .new(args) 的实参）
  if (f.name === "_init") return emitConstructor(f, base, hasSuper);

  // 入口方法是 harness 约定的异步方法，必须保持 Promise 签名
  const isEntry = f.name === "_initialize" || f.name === "_process";
  const abi = RAW_ABIS.get(f.name);
  const async = f.coroutine || isEntry ? "async " : "";
  const params = f.params.map((p) => p.name).join(", ");
  const hasValue = hasValueReturn(f.body);

  let ret: string;
  if (abi) ret = abi.ret === "str" ? "string" : "number";
  else if (f.name === "_initialize") ret = "Promise<void>";
  else if (isEntry || f.coroutine) ret = "Promise<unknown>";
  else ret = hasValue ? "unknown" : "void";

  const lines = [`${async}${f.name}(${params}): ${ret} {`];
  mark(base, f.loc);
  const savedUnboxed = UNBOXED;
  const savedRet = CURRENT_RET;
  const savedArrays = RAW_ARRAYS;
  CURRENT_RET = abi ? abi.ret : null;
  const layout = analyzeFuncLayout(f);
  UNBOXED = layout.unboxed;
  RAW_ARRAYS = layout.arrays;
  try {
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, f.name === "_initialize")) lines.push(`  ${line}`);
    }
  } finally {
    UNBOXED = savedUnboxed;
    CURRENT_RET = savedRet;
    RAW_ARRAYS = savedArrays;
  }
  lines.push("}");
  lines.push("");
  return lines;
}

/**
 * `_init` → `constructor`。派生类必须在使用 this 前调 super()：
 * - 体首句是显式 `super(args)` → 原样发（emitCall 在 IN_CONSTRUCTOR 下放行）；
 * - 否则若类有基类 → 隐式补 `super()`（GDScript 隐式父构造也是无参）。
 * 无基类（内部类 / 无 extends）不发 super。
 * 字段初始化器是 JS class fields，由引擎在 super() 之后、构造体之前跑——正好对上 GDScript「先字段后 _init 体」。
 */
function emitConstructor(f: FuncDecl, base: number, hasSuper: boolean): string[] {
  const params = f.params.map((p) => p.name).join(", ");
  const lines = [`constructor(${params}) {`];
  mark(base, f.loc);

  const first = f.body[0];
  const explicitSuper =
    !!first &&
    first.kind === "expr" &&
    first.expr.kind === "call" &&
    first.expr.callee.kind === "ident" &&
    first.expr.callee.name === "super";
  if (!explicitSuper && hasSuper) lines.push("  super();");

  IN_CONSTRUCTOR = true;
  const savedUnboxed = UNBOXED;
  UNBOXED = computeUnboxed(f);
  try {
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`  ${line}`);
    }
  } finally {
    IN_CONSTRUCTOR = false;
    UNBOXED = savedUnboxed;
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

/** 条件表达式：裸 bool 直接用；裸 int/float 用 `!== 0`，裸 str 用 `!== ""`（S12 空串假值）；否则 rt.ops.truthy。 */
function condExpr(e: Expr): string {
  const r = emitExprR(e);
  if (r.rep === "bool") return r.code;
  if (r.rep === "int" || r.rep === "float") return `${r.code} !== 0`;
  if (r.rep === "str") return `${r.code} !== ""`;
  return `rt.ops.truthy(${r.code})`;
}

function emitStmt(s: Stmt, voidReturn: boolean): string[] {
  switch (s.kind) {
    case "var": {
      // 特化裸数组局部：init 必为数字字面量数组（且逐元素与元素 Kind 相符，推断已校验）→ 发裸 number[]
      const ek = RAW_ARRAYS.get(s.name);
      if (ek && s.init && s.init.kind === "array") {
        const parts = s.init.items.map((it) => {
          const r = emitExprR(it);
          if (r.rep !== ek) {
            throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸数组元素期望 ${ek}，实得 ${r.rep}`);
          }
          return r.code;
        });
        return [`let ${s.name} = [${parts.join(", ")}];`];
      }
      // 解箱局部：init 必为同型数值表达式（推断保证），直接发裸 number
      if (s.init && UNBOXED.has(s.name)) {
        return [`let ${s.name} = ${emitExprR(s.init).code};`];
      }
      // 直接发射 let —— 块作用域由 JS 自己保证，正好对应 S16
      const init = s.init ? emitExpr(s.init) : "rt.V.nil()";
      // 带类型标注的声明要做截断：`var i: int = 3.9` 在 Godot 里是 3，不是 3.9（S6）
      const cast = declaredCast(s.type);
      return [`let ${s.name} = ${cast ? `${cast}(${init})` : init};`];
    }

    case "expr":
      return [`${emitExpr(s.expr)};`];

    case "assign": {
      // 赋值给解箱局部：值必为同型裸值（推断保证）；万一不是，按类型拆箱取裸值（.v）兜底
      if (s.target.kind === "ident") {
        const kind = UNBOXED.get(s.target.name);
        if (kind) {
          const vr = emitExprR(s.value);
          const fn = kind === "int" ? "toInt" : kind === "float" ? "toFloat" : "strOf";
          const raw = vr.rep === kind ? vr.code : `rt.${fn}(${boxR(vr)}).v`;
          return [`${s.target.name} = ${raw};`];
        }
      }
      return [emitAssign(s.target, emitExpr(s.value))];
    }

    case "return":
      if (!s.value) return ["return;"];
      // 裸 ABI 函数：返回值必须是声明的那一种裸类型（推断保证）；对不上就响，绝不静默发装箱值。
      if (CURRENT_RET) {
        const rr = emitExprR(s.value);
        if (rr.rep !== CURRENT_RET) {
          throw new UnsupportedError(
            "raw-abi-return",
            `内部不变量破坏：裸函数返回期望 ${CURRENT_RET}，实得 ${rr.rep}`,
          );
        }
        return [`return ${rr.code};`];
      }
      // _initialize 的返回类型被钉成 Promise<void>，有返回值时用 void 吃掉
      return voidReturn ? [`return void (${emitExpr(s.value)});`] : [`return ${emitExpr(s.value)};`];

    case "if": {
      const lines: string[] = [];
      s.branches.forEach((br, i) => {
        const prefix = i === 0 ? "" : "} ";
        const kw = i === 0 ? "if" : br.cond ? "else if" : "else";
        const cond = br.cond ? ` (${condExpr(br.cond)})` : "";
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
        `while (${condExpr(s.cond)}) {`,
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
    if (target.obj.kind === "ident" && RAW_ARRAYS.has(target.obj.name)) {
      throw new UnsupportedError("raw-array", "内部不变量破坏：裸数组不应出现下标赋值");
    }
    return `rt.setIndex(${emitExpr(target.obj)}, ${emitExpr(target.index)}, ${value});`;
  }
  throw new UnsupportedError("emit-assign", `赋值目标 ${target.kind} 还没实现`);
}

// ---------------------------------------------------------------- 表达式
//
// D2 单态化解箱（保守）：表达式带「表示」标签——
//   rep "int"  = 裸 JS number（仅安全 int 字面量 / 已解箱局部 / 二者的 + - *）
//   rep "bool" = 裸 JS boolean（仅两个 int 的比较）
//   rep "var"  = 装箱 Variant（其余一切）
// `emitExpr` = 永远返回装箱后的字符串（旧调用点全部不变，raw 子表达式自动装箱）；
// 只有 `+ - *`、比较、while/if 条件、解箱局部的声明/赋值这几处直接用 `emitExprR` 走 raw。
// 漏装箱不会静默：裸 number 进了 ops.* 会因不是 Variant 而响亮报错，golden 必抓到。

type Rep = "var" | "int" | "float" | "str" | "bool";
interface R {
  code: string;
  rep: Rep;
}

/** 当前函数里被解箱成裸 JS 值的局部：int/float → number，str → string。 */
let UNBOXED = new Map<string, "int" | "float" | "str">();

/** 单态化的三种裸表示。 */
type Kind = "int" | "float" | "str";
/** 纯返回值函数的裸 ABI：参数与返回统一为同一种 Kind（v1 只支持同型）。 */
interface RawAbi {
  params: Kind[];
  ret: Kind;
}
/** 当前模块内可走裸 ABI 的函数：名字 → 签名。由 computeRawAbis 逐模块算出。 */
let RAW_ABIS = new Map<string, RawAbi>();
/** 当前正在发射的函数若走裸 ABI，其返回裸类型；否则 null（返回值需装箱）。 */
let CURRENT_RET: Kind | null = null;

/** 容器元素单态化（D2 第四轨 v1）：函数局部 Array 的裸元素类型（仅 int/float，绝不存 Variant）。 */
type ElemKind = "int" | "float";
/** 当前函数里被特化成裸 number[] 的数组局部：名字 → 元素类型。由 analyzeFuncLayout 逐函数算出。 */
let RAW_ARRAYS = new Map<string, ElemKind>();
const NO_ARRAYS: Map<string, ElemKind> = new Map();

const CMP_RAW: Record<string, string> = { "<": "<", "<=": "<=", ">": ">", ">=": ">=", "==": "===", "!=": "!==" };
const ARITH_RAW: Record<string, string> = { "+": "iAddC", "-": "iSubC", "*": "iMulC", "/": "iDivC", "%": "iModC" };
// float 无 D1 范围陷阱（溢出→Infinity、除零→Infinity，与装箱 V.float(a op b) 逐位一致），故内联裸运算即可。
const FLOAT_ARITH_RAW: Record<string, string> = { "+": "+", "-": "-", "*": "*", "/": "/" };

/** 把带表示的表达式装箱成 Variant 字符串。 */
function boxR(r: R): string {
  if (r.rep === "int") return `rt.V.int(${r.code})`;
  if (r.rep === "float") return `rt.V.float(${r.code})`;
  if (r.rep === "str") return `rt.V.str(${r.code})`;
  if (r.rep === "bool") return `rt.V.bool(${r.code})`;
  return r.code;
}

function emitExpr(e: Expr): string {
  return boxR(emitExprR(e));
}

function emitExprR(e: Expr): R {
  if (e.kind === "lit" && e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) {
    return { code: String(e.value), rep: "int" };
  }
  if (e.kind === "lit" && e.lit === "float" && typeof e.value === "number") {
    return { code: String(e.value), rep: "float" };
  }
  if (e.kind === "lit" && e.lit === "string") {
    return { code: JSON.stringify(e.value), rep: "str" };
  }
  if (e.kind === "ident") {
    const k = UNBOXED.get(e.name);
    if (k) return { code: e.name, rep: k };
  }
  // 容器元素单态化：裸数组的下标读 / .append / .size/.length（分析期已判定这些是唯一合法用法）。
  if (e.kind === "index" && e.obj.kind === "ident") {
    const ek = RAW_ARRAYS.get(e.obj.name);
    if (ek) {
      const ir = emitExprR(e.index);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrGet(${e.obj.name}, ${ir.code})`, rep: ek };
    }
  }
  if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
    const ek = RAW_ARRAYS.get(e.callee.obj.name);
    const nm = e.callee.obj.name;
    if (ek && (e.callee.name === "size" || e.callee.name === "length") && e.args.length === 0) {
      return { code: `${nm}.length`, rep: "int" };
    }
    if (ek && e.callee.name === "append" && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 append 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `${nm}.push(${er.code})`, rep: "var" };
    }
  }
  if (e.kind === "call" && e.callee.kind === "ident") {
    // 裸 ABI：直接调用点传裸实参、结果按裸类型流（不再回 rvalue）。分析期已保证同型；
    // 万一表示与推断不符（漏改的对齐 bug），宁可响亮报错，绝不静默发错。
    const abi = RAW_ABIS.get(e.callee.name);
    if (abi) {
      if (e.args.length !== abi.params.length) {
        throw new UnsupportedError("raw-abi-arity", `内部不变量破坏：${e.callee.name} 期望 ${abi.params.length} 个实参`);
      }
      const raws = e.args.map(emitExprR);
      for (let i = 0; i < raws.length; i++) {
        const want = abi.params[i]!;
        const got = raws[i]!;
        if (got.rep !== want) {
          throw new UnsupportedError(
            "raw-abi-arg",
            `内部不变量破坏：${e.callee.name} 第 ${i + 1} 参数期望 ${want}，实得 ${got.rep}`,
          );
        }
      }
      return { code: `this.${e.callee.name}(${raws.map((r) => r.code).join(", ")})`, rep: abi.ret };
    }
  }
  if (e.kind === "binary") {
    const raw = tryRawBinary(e);
    if (raw) return raw;
  }
  return { code: emitExprVar(e), rep: "var" };
}

function tryRawBinary(e: Extract<Expr, { kind: "binary" }>): R | null {
  const L = emitExprR(e.left);
  const Rr = emitExprR(e.right);
  // 比较：两操作数同为裸 int 或同为裸 float → 裸 JS 比较，结果裸 bool
  if (CMP_RAW[e.op] && L.rep === Rr.rep && (L.rep === "int" || L.rep === "float")) {
    return { code: `(${L.code} ${CMP_RAW[e.op]!} ${Rr.code})`, rep: "bool" };
  }
  // int 算术 + - *：带 D1 检查的 checked 快路径
  if (L.rep === "int" && Rr.rep === "int" && ARITH_RAW[e.op]) {
    return { code: `rt.fast.${ARITH_RAW[e.op]}(${L.code}, ${Rr.code})`, rep: "int" };
  }
  // float 算术 + - * /：内联裸运算（无范围陷阱）
  if (L.rep === "float" && Rr.rep === "float" && FLOAT_ARITH_RAW[e.op]) {
    return { code: `(${L.code} ${FLOAT_ARITH_RAW[e.op]!} ${Rr.code})`, rep: "float" };
  }
  // string 拼接：仅 + ，两操作数皆裸 str（JS a+b 与装箱 V.str(a+b) 逐位一致）
  if (L.rep === "str" && Rr.rep === "str" && e.op === "+") {
    return { code: `(${L.code} + ${Rr.code})`, rep: "str" };
  }
  return null;
}

/**
 * 保守推断函数内可解箱成裸 number 的局部（int 或 float）：
 * `var x = <同型数值表达式>` 且 x 的每次赋值都是同型数值表达式
 * （int/float 字面量 / 已解箱同型局部 / 二者的 + - *，float 额外含 /）。
 * 排除：参数、for 变量、match 绑定、lambda 内声明或被赋值的名字。
 * 用「自身暂定」打破 `x += 1` 的循环依赖，每种类型各自迭代到不动点；init 字面量类型天然互斥，不会同属两类。
 */
function computeUnboxed(f: FuncDecl, arrays: Map<string, ElemKind> = NO_ARRAYS): Map<string, "int" | "float" | "str"> {
  const abi = RAW_ABIS.get(f.name);
  const paramKind = new Map<string, Kind>();
  if (abi) f.params.forEach((p, i) => paramKind.set(p.name, abi.params[i]!));
  const excluded = new Set<string>(f.params.map((p) => p.name));
  const decls: Array<{ name: string; init: Expr | null }> = [];
  const assigns: Array<{ name: string; value: Expr }> = [];

  const walkExpr = (e: Expr, inLambda: boolean): void => {
    switch (e.kind) {
      case "lambda":
        e.body.forEach((s) => walkStmt(s, true));
        break;
      case "binary":
        walkExpr(e.left, inLambda);
        walkExpr(e.right, inLambda);
        break;
      case "unary":
      case "await":
        walkExpr(e.operand, inLambda);
        break;
      case "call":
        walkExpr(e.callee, inLambda);
        e.args.forEach((a) => walkExpr(a, inLambda));
        break;
      case "attribute":
        walkExpr(e.obj, inLambda);
        break;
      case "index":
        walkExpr(e.obj, inLambda);
        walkExpr(e.index, inLambda);
        break;
      case "array":
        e.items.forEach((a) => walkExpr(a, inLambda));
        break;
      case "dict":
        e.entries.forEach((en) => {
          walkExpr(en.key, inLambda);
          walkExpr(en.value, inLambda);
        });
        break;
      case "is":
      case "as":
        walkExpr(e.operand, inLambda);
        break;
    }
  };
  const walkStmt = (s: Stmt, inLambda: boolean): void => {
    switch (s.kind) {
      case "var":
        if (inLambda) excluded.add(s.name);
        // 带显式类型标注的 var 不解箱：`: int` / `: float` 可能触发截断转换（S6），
        // 解箱会跳过 declaredCast 而静默算错（如 `var i: int = 3.9` 应为 3）。
        else if (!s.type) decls.push({ name: s.name, init: s.init });
        else excluded.add(s.name);
        if (s.init) walkExpr(s.init, inLambda);
        break;
      case "assign":
        if (s.target.kind === "ident") {
          if (inLambda) excluded.add(s.target.name);
          else assigns.push({ name: s.target.name, value: s.value });
        }
        walkExpr(s.target, inLambda);
        walkExpr(s.value, inLambda);
        break;
      case "expr":
        walkExpr(s.expr, inLambda);
        break;
      case "return":
        if (s.value) walkExpr(s.value, inLambda);
        break;
      case "if":
        for (const b of s.branches) {
          if (b.cond) walkExpr(b.cond, inLambda);
          b.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
      case "for":
        excluded.add(s.var);
        walkExpr(s.iter, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "while":
        walkExpr(s.cond, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "match":
        walkExpr(s.subject, inLambda);
        for (const a of s.arms) {
          if (a.guard) walkExpr(a.guard, inLambda);
          patternNames(a.pattern).forEach((n) => excluded.add(n));
          a.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
    }
  };
  f.body.forEach((s) => walkStmt(s, false));

  const result = new Map<string, "int" | "float" | "str">();
  // 裸 ABI 函数的参数直接是裸值：种进 result，使发射期 emitExprR(ident 参数) 解析出正确 rep。
  if (abi) f.params.forEach((p, i) => result.set(p.name, abi.params[i]!));
  for (const kind of ["int", "float", "str"] as const) {
    const isLit = (e: Expr): boolean =>
      e.kind === "lit" &&
      (kind === "int"
        ? e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)
        : kind === "float"
          ? e.lit === "float"
          : e.lit === "string");
    const U = new Set<string>();
    // 与发射期 tryRawBinary / 裸调用完全同一张算子表：用 kindOfExpr 判定表达式裸类型，
    // 保证「推断为 int ⟺ 发射为 int rep」，杜绝漏箱（静默错）。ident 经本函数已推断的裸映射解析。
    const identKind = (self: string) => (n: string): Kind | null =>
      paramKind.get(n) ?? result.get(n) ?? (n === self || U.has(n) ? kind : null);
    const isNum = (e: Expr, self: string): boolean => {
      if (e.kind === "call") return kindOfExpr(e, identKind(self), arrays) === kind;
      if (e.kind === "binary") return kindOfExpr(e, identKind(self), arrays) === kind;
      if (e.kind === "index") return kindOfExpr(e, identKind(self), arrays) === kind;
      if (e.kind === "lit") return isLit(e);
      if (e.kind === "ident") return e.name === self || U.has(e.name) || paramKind.get(e.name) === kind;
      return false;
    };
    let changed = true;
    while (changed) {
      changed = false;
      for (const d of decls) {
        if (U.has(d.name) || excluded.has(d.name) || result.has(d.name)) continue;
        if (!d.init || !isNum(d.init, d.name)) continue;
        if (!assigns.every((a) => a.name !== d.name || isNum(a.value, d.name))) continue;
        U.add(d.name);
        result.set(d.name, kind);
        changed = true;
      }
    }
  }
  return result;
}

// ------------------------------------------------ 参数/返回单态化（D2 第三轨）

const INT_ARITH = new Set(["+", "-", "*", "/", "%"]);
const FLOAT_ARITH = new Set(["+", "-", "*", "/"]);
const CMP_OPS = new Set(["<", "<=", ">", ">=", "==", "!="]);

/**
 * 结构化的表达式裸类型判定，算子表与 tryRawBinary 逐字一致：
 * 只有 lit / ident(经 identKind 解析) / binary(同型裸运算) / call(裸 ABI 目标) /
 * index(裸数组下标读) / call(裸数组 .size()/.length()) 能产出裸类型，
 * 其余（attribute/array/dict/lambda/await/is/as/unary、非 int 下标）一律返回 null（必须装箱）。
 * 返回 "bool" 表示裸比较结果（调用方要求 int/float/str 时自然落选）。
 */
function kindOfExpr(
  e: Expr,
  identKind: (n: string) => Kind | null,
  arrays: Map<string, ElemKind> = NO_ARRAYS,
): Kind | "bool" | null {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) return "int";
      if (e.lit === "float" && typeof e.value === "number") return "float";
      if (e.lit === "string") return "str";
      return null;
    case "ident":
      return identKind(e.name);
    case "binary": {
      const lk = kindOfExpr(e.left, identKind, arrays);
      const rk = kindOfExpr(e.right, identKind, arrays);
      if (lk === null || rk === null || lk === "bool" || rk === "bool" || lk !== rk) return null;
      if (lk === "int" && INT_ARITH.has(e.op)) return "int";
      if (lk === "float" && FLOAT_ARITH.has(e.op)) return "float";
      if (lk === "str" && e.op === "+") return "str";
      if ((lk === "int" || lk === "float") && CMP_OPS.has(e.op)) return "bool";
      return null;
    }
    case "index": {
      // 裸数组的 int 下标读 → 元素类型；下标非 int 保守回退装箱（越界语义与运行时一致）。
      if (e.obj.kind === "ident") {
        const ek = arrays.get(e.obj.name);
        if (ek && kindOfExpr(e.index, identKind, arrays) === "int") return ek;
      }
      return null;
    }
    case "call": {
      if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
        // 裸数组 .size() / .length() → 裸 int 长度。
        const ek = arrays.get(e.callee.obj.name);
        if (ek && (e.callee.name === "size" || e.callee.name === "length") && e.args.length === 0) return "int";
        return null;
      }
      if (e.callee.kind !== "ident") return null;
      const abi = RAW_ABIS.get(e.callee.name);
      if (!abi || e.args.length !== abi.params.length) return null;
      for (let i = 0; i < e.args.length; i++) {
        if (kindOfExpr(e.args[i]!, identKind, arrays) !== abi.params[i]!) return null;
      }
      return abi.ret;
    }
    default:
      return null;
  }
}

interface RawSite {
  args: Expr[];
  owner: FuncDecl;
}

/** 纯返回值形态：单条 `return <expr>`，无返回类型标注，参数无类型/默认值，非协程/静态/入口。 */
function isPureReturnForm(f: FuncDecl): boolean {
  if (f.coroutine || f.isStatic) return false;
  if (f.returnType) return false;
  if (f.body.length !== 1) return false;
  const st = f.body[0]!;
  if (st.kind !== "return" || !st.value) return false;
  for (const p of f.params) if (p.type || p.default) return false;
  return true;
}

/**
 * 全模块扫描：
 * - 顶层方法体内 `f(...)`（裸 ident 被调）→ 记为 f 的直接调用点（sites）。
 * - 其它任何对名字的引用（裸 ident 取值 / obj.name 成员访问 / super.name / 嵌套在 lambda、
 *   内部类、字段初始化、默认值、match 绑定作用域里的调用）→ 保守计入 escapes，取消该函数单态化资格。
 */
function scanRawUsage(m: Module, candNames: Set<string>): { escapes: Set<string>; sitesByF: Map<string, RawSite[]> } {
  const escapes = new Set<string>();
  const sitesByF = new Map<string, RawSite[]>();
  const escape = (n: string): void => {
    if (n !== "super") escapes.add(n);
  };

  const expr = (e: Expr, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (e.kind) {
      case "lit":
        // 字符串字面量可能正是 obj.call("m") / signal.connect("m") / has_method("m") 的目标方法名，
        // 单态化会让这些按名反射派发拿到装箱实参 → 静默算错。保守：任何字符串都按潜在方法名逃逸。
        if (e.lit === "string") escape(String(e.value));
        return;
      case "ident":
        escape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "ident") {
          const nm = e.callee.name;
          if (allowSite && owner && candNames.has(nm)) {
            if (!sitesByF.has(nm)) sitesByF.set(nm, []);
            sitesByF.get(nm)!.push({ args: e.args, owner });
          } else {
            escape(nm);
          }
        } else {
          expr(e.callee, owner, false);
        }
        for (const a of e.args) expr(a, owner, allowSite);
        return;
      }
      case "attribute":
        escape(e.name);
        expr(e.obj, owner, allowSite);
        return;
      case "index":
        expr(e.obj, owner, allowSite);
        expr(e.index, owner, allowSite);
        return;
      case "binary":
        expr(e.left, owner, allowSite);
        expr(e.right, owner, allowSite);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand, owner, allowSite);
        return;
      case "array":
        for (const it of e.items) expr(it, owner, allowSite);
        return;
      case "dict":
        for (const en of e.entries) {
          expr(en.key, owner, allowSite);
          expr(en.value, owner, allowSite);
        }
        return;
      case "lambda":
        for (const s of e.body) stmt(s, owner, false);
        return;
    }
  };
  const stmt = (s: Stmt, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) expr(s.init, owner, allowSite);
        return;
      case "assign":
        expr(s.target, owner, allowSite);
        expr(s.value, owner, allowSite);
        return;
      case "expr":
        expr(s.expr, owner, allowSite);
        return;
      case "return":
        if (s.value) expr(s.value, owner, allowSite);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) expr(b.cond, owner, allowSite);
          for (const x of b.body) stmt(x, owner, allowSite);
        }
        return;
      case "for":
        expr(s.iter, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "while":
        expr(s.cond, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "match":
        expr(s.subject, owner, allowSite);
        for (const a of s.arms) {
          if (a.guard) expr(a.guard, owner, allowSite);
          for (const x of a.body) stmt(x, owner, false);
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };

  for (const f of m.funcs) {
    for (const p of f.params) if (p.default) expr(p.default, f, false);
    for (const s of f.body) stmt(s, f, true);
  }
  for (const v of m.vars) if (v.init) expr(v.init, null, false);
  const walkClass = (c: ClassDecl): void => {
    for (const v of c.vars) if (v.init) expr(v.init, null, false);
    for (const f of c.funcs) {
      for (const s of f.body) stmt(s, f, false);
    }
    c.innerClasses.forEach(walkClass);
  };
  m.innerClasses.forEach(walkClass);

  return { escapes, sitesByF };
}

/** 签名候选：给定统一 Kind，体（参数视为该 Kind）与所有调用点实参都能裸化为该 Kind 才成立。 */
function sigValid(
  f: FuncDecl,
  K: Kind,
  sites: RawSite[],
  uOf: (fn: FuncDecl) => Map<string, "int" | "float" | "str">,
): boolean {
  const st = f.body[0]!;
  if (st.kind !== "return" || !st.value) return false;
  const pk = new Map<string, Kind>();
  for (const p of f.params) pk.set(p.name, K);
  if (kindOfExpr(st.value, (n) => pk.get(n) ?? null) !== K) return false;
  for (const s of sites) {
    if (s.args.length !== f.params.length) return false;
    const u = uOf(s.owner);
    for (const a of s.args) {
      if (kindOfExpr(a, (n) => u.get(n) ?? null) !== K) return false;
    }
  }
  return true;
}

function sameAbis(a: Map<string, RawAbi>, b: Map<string, RawAbi>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (!w || w.ret !== v.ret) return false;
  }
  return true;
}

/**
 * 求本模块可单态化的函数集合（D2 第三轨 v1）。
 * 安全边界（v1，全部满足才发裸 ABI）：
 * - 无内部类（内部类方法是兄弟类，`this.f` 会指错对象）；
 * - 无基类 / 不在继承成员里（基类或派生类可能以 virtual 方式调用，收到裸值会静默算错）；
 * - 名字不在工程其它模块声明（跨模块只能 obj.f() 属性调用，走装箱派发）；
 * - 函数是「纯单 return 表达式」且参数/返回类型无标注、非协程/静态/入口；
 * - 名字从不作为裸标识符（Callable）、成员访问 .f、super.f、lambda/内部类/字段初始化里的调用出现；
 * - 每个直接调用点参数个数与形参一致，且所有调用点参数与函数体在本模块不动点下都是同一种 int/float/str。
 * 不动点不收敛（跨候选 Kind 互相牵动的罕见情形）→ 直接放弃全部单态化，退回逐字节旧行为。
 */
function computeRawAbis(
  m: Module,
  ctx: { hasBase: boolean; inherited: Set<string>; external: Set<string> },
): Map<string, RawAbi> {
  const empty = new Map<string, RawAbi>();
  if (m.innerClasses.length > 0 || ctx.hasBase) return empty;

  const byName = new Map<string, FuncDecl>();
  for (const f of m.funcs) byName.set(f.name, f);

  const candNames = new Set<string>();
  for (const f of m.funcs) {
    if (!isPureReturnForm(f)) continue;
    if (f.name.startsWith("_")) continue; // 引擎虚函数 / 入口 / 构造
    if (ENUM_NAMES.has(f.name) || MODULE_VARS.has(f.name) || MODULE_CLASSES.has(f.name)) continue;
    // external：工程其它模块里作为属性/裸标识符出现过的名字，或被继承出现过的名字。
    // 跨模块只能 obj.f() / Callable 触达，那会喂裸方法装箱实参 → 静默算错，必须整名排除。
    if (ctx.inherited.has(f.name) || ctx.external.has(f.name)) continue;
    candNames.add(f.name);
  }
  if (candNames.size === 0) return empty;

  const { escapes, sitesByF } = scanRawUsage(m, candNames);
  for (const n of escapes) candNames.delete(n);

  // 需有 ≥1 合法方法体调用点（否则可能只在字段/lambda 里被调，或根本是引擎虚函数）。
  for (const n of [...candNames]) {
    if ((sitesByF.get(n) ?? []).length === 0) candNames.delete(n);
  }
  if (candNames.size === 0) return empty;

  const saved = RAW_ABIS;
  const dummyU: (fn: FuncDecl) => Map<string, "int" | "float" | "str"> = () => new Map();
  // 乐观播种：先只看函数体（参数视为该 K、暂不看调用点）给每个候选一个签名，
  // 打破 `s = add2(s, i)` 这类正反馈依赖（s 的裸推断依赖 add2 的返回类型）。随后不动点按调用点证据收敛/反驳。
  const seed = new Map<string, RawAbi>();
  for (const name of candNames) {
    const f = byName.get(name)!;
    for (const K of ["int", "float", "str"] as const) {
      if (sigValid(f, K, [], dummyU)) {
        seed.set(name, { params: f.params.map(() => K), ret: K });
        break;
      }
    }
  }
  let cur = seed;
  let stable = false;
  const cap = (candNames.size + 2) * 4;
  for (let it = 0; it < cap; it++) {
    RAW_ABIS = cur;
    const uCache = new Map<string, Map<string, "int" | "float" | "str">>();
    const uOf = (fn: FuncDecl): Map<string, "int" | "float" | "str"> => {
      let v = uCache.get(fn.name);
      if (!v) {
        v = computeUnboxed(fn);
        uCache.set(fn.name, v);
      }
      return v;
    };
    const next = new Map<string, RawAbi>();
    for (const name of candNames) {
      const f = byName.get(name)!;
      const sites = sitesByF.get(name) ?? [];
      for (const K of ["int", "float", "str"] as const) {
        if (sigValid(f, K, sites, uOf)) {
          next.set(name, { params: f.params.map(() => K), ret: K });
          break;
        }
      }
    }
    if (sameAbis(cur, next)) {
      cur = next;
      stable = true;
      break;
    }
    cur = next;
  }
  RAW_ABIS = saved;
  return stable ? cur : empty;
}

// ------------------------------------------- 容器元素单态化（D2 第四轨 v1：仅 Array、仅 int/float）

interface ArrayCand {
  init: Extract<Expr, { kind: "array" }>;
  writeElems: Expr[]; // a.append(e) 的 e
  readIdxs: Expr[]; // a[i] 读的 i
  escaped: boolean; // 出现任何非白名单用法 → 取消特化
}

/**
 * 静态扫一遍函数体，找出候选数组局部（`var a = []` / `var a = <数字字面量数组>`，无类型标注）
 * 并按「出现位置」判定是否逃逸。只有以下用法算合法：
 *   decl 自身、a.append(<单实参>) 的接收者、a.size()/a.length() 的接收者、a[<i>] 的读接收者。
 * 其它一切（别名 b=a、重赋值 a=…、下标写 a[i]=…、其它方法、作为实参/元素/返回/print/in/迭代/
 * lambda 捕获/match 主体等）→ escaped。
 */
function scanArrayCandidates(f: FuncDecl): Map<string, ArrayCand> {
  const cands = new Map<string, ArrayCand>();

  // 预扫：收集 `var <name> = [..]`（array 字面量、无类型标注）作为候选。
  const pre = (s: Stmt): void => {
    if (s.kind === "var") {
      if (!s.type && s.init && s.init.kind === "array") {
        cands.set(s.name, { init: s.init, writeElems: [], readIdxs: [], escaped: false });
      }
    } else if (s.kind === "if") for (const b of s.branches) b.body.forEach(pre);
    else if (s.kind === "for") {
      s.body.forEach(pre);
    } else if (s.kind === "while") s.body.forEach(pre);
    else if (s.kind === "match") for (const a of s.arms) a.body.forEach(pre);
  };
  f.body.forEach(pre);

  const markEscape = (n: string): void => {
    const c = cands.get(n);
    if (c) c.escaped = true;
  };
  const isCandObj = (e: Expr): string | null => e.kind === "ident" && cands.has(e.name) ? e.name : null;

  const visitExpr = (e: Expr, inL: boolean): void => {
    switch (e.kind) {
      case "ident":
        // 能走到这里说明该 ident 处「裸取值」角色（合法角色在 call/index 分支被就地消化、不再下钻）。
        if (cands.has(e.name)) markEscape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "attribute") {
          const objName = isCandObj(e.callee.obj);
          const N = e.callee.name;
          if (objName) {
            const c = cands.get(objName)!;
            if (inL) {
              c.escaped = true;
            } else if (N === "append" && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if ((N === "size" || N === "length") && e.args.length === 0) {
              /* 合法：仅把数组当长度来源，不下钻 obj */
            } else {
              c.escaped = true; // 其它数组方法（pop/insert/clear…）→ 逃逸
            }
            e.args.forEach((a) => visitExpr(a, inL));
            return;
          }
          visitExpr(e.callee, inL);
          e.args.forEach((a) => visitExpr(a, inL));
          return;
        }
        visitExpr(e.callee, inL);
        e.args.forEach((a) => visitExpr(a, inL));
        return;
      }
      case "index": {
        const objName = isCandObj(e.obj);
        if (objName) {
          const c = cands.get(objName)!;
          if (inL) c.escaped = true;
          else c.readIdxs.push(e.index);
          visitExpr(e.index, inL);
          return;
        }
        visitExpr(e.obj, inL);
        visitExpr(e.index, inL);
        return;
      }
      case "attribute":
        visitExpr(e.obj, inL); // obj 若是裸候选 ident → 走到 ident 分支逃逸（如 a.foo / 不带括号的 a.size）
        return;
      case "binary":
        visitExpr(e.left, inL);
        visitExpr(e.right, inL);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        visitExpr(e.operand, inL);
        return;
      case "array":
        e.items.forEach((it) => visitExpr(it, inL));
        return;
      case "dict":
        for (const en of e.entries) {
          visitExpr(en.key, inL);
          visitExpr(en.value, inL);
        }
        return;
      case "lambda":
        e.body.forEach((s) => visitStmt(s, true));
        return;
    }
  };
  const visitStmt = (s: Stmt, inL: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) visitExpr(s.init, inL);
        return;
      case "assign": {
        // 下标写 a[i]=.. 与 重赋值 a=.. 都让候选数组逃逸。
        const wt =
          s.target.kind === "index"
            ? isCandObj(s.target.obj)
            : s.target.kind === "ident" && cands.has(s.target.name)
              ? s.target.name
              : null;
        if (wt) markEscape(wt);
        visitExpr(s.target, inL);
        visitExpr(s.value, inL);
        return;
      }
      case "expr":
        visitExpr(s.expr, inL);
        return;
      case "return":
        if (s.value) visitExpr(s.value, inL);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) visitExpr(b.cond, inL);
          b.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "for":
        visitExpr(s.iter, inL); // for x in a → a 裸取值 → 逃逸
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "while":
        visitExpr(s.cond, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "match":
        visitExpr(s.subject, inL);
        for (const a of s.arms) {
          if (a.guard) visitExpr(a.guard, inL);
          a.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };
  f.body.forEach((s) => visitStmt(s, false));
  return cands;
}

function elemKindFromInit(init: Extract<Expr, { kind: "array" }>): ElemKind | null {
  let seen: ElemKind | null = null;
  for (const it of init.items) {
    if (it.kind !== "lit" || (it.lit !== "int" && it.lit !== "float")) return null; // 非数字字面量初值 → 不做候选
    const k: ElemKind = it.lit === "float" ? "float" : "int";
    if (it.lit === "int" && !(typeof it.value === "number" && Number.isSafeInteger(it.value))) return null;
    if (seen && seen !== k) return null; // 初值里 int/float 混用 → 保守装箱
    seen = k;
  }
  return seen ?? "int"; // 空数组暂定 int，由后续写入定夺
}

function mapsEqual<T>(a: Map<string, T>, b: Map<string, T>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

/**
 * 联合不动点：数组元素 Kind 与标量解箱彼此依赖（`s += a[j]` 要靠 a 的元素类型才能解箱 s，
 * 而 a 的元素类型又要靠写入实参（可能是别的解箱局部/别的数组读）来定）。单调移除：从乐观种子出发，
 * 逐一剔除「写入/初值/下标与所设 Kind 不符」或「逃逸」的候选，直到数组集与解箱集同时稳定。
 * 最终 arrays 与 unboxed 互为不动点，发射期据此发裸数组并对 rep 断言兜底。
 */
function analyzeFuncLayout(f: FuncDecl): { unboxed: Map<string, "int" | "float" | "str">; arrays: Map<string, ElemKind> } {
  const cands = scanArrayCandidates(f);
  const arrays = new Map<string, ElemKind>();
  for (const [name, c] of cands) {
    if (c.escaped) continue;
    const k = elemKindFromInit(c.init);
    if (k) arrays.set(name, k);
  }
  let unboxed = computeUnboxed(f, arrays);
  const cap = cands.size + 8;
  for (let it = 0; it < cap; it++) {
    let changed = false;
    for (const [name, K] of [...arrays]) {
      const c = cands.get(name);
      if (!c || c.escaped || !verifyArray(c, K, unboxed, arrays)) {
        arrays.delete(name);
        changed = true;
      }
    }
    const un2 = computeUnboxed(f, arrays);
    const unChanged = !mapsEqual(un2, unboxed);
    unboxed = un2;
    if (!changed && !unChanged) break;
  }
  return { unboxed, arrays };
}

/** 校验候选数组在其所设 Kind 下：初值元素、写入元素皆为该 Kind，读下标皆为 int。 */
function verifyArray(
  c: ArrayCand,
  K: ElemKind,
  unboxed: Map<string, "int" | "float" | "str">,
  arrays: Map<string, ElemKind>,
): boolean {
  const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
  if (elemKindFromInit(c.init) !== K) return false;
  // 初值里的非字面量元素（如 var a=[x, y]）也要能裸化为 K
  for (const it of c.init.items) {
    if (it.kind === "lit") continue; // 字面量已由 elemKindFromInit 定 K
    if (kindOfExpr(it, identKind, arrays) !== K) return false;
  }
  for (const w of c.writeElems) if (kindOfExpr(w, identKind, arrays) !== K) return false;
  for (const r of c.readIdxs) if (kindOfExpr(r, identKind, arrays) !== "int") return false;
  return true;
}

function emitExprVar(e: Expr): string {
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
      // super.属性 在 JS 里走原型链、拿不到父类实例字段，语义不对——只支持 super.method()
      if (e.obj.kind === "ident" && e.obj.name === "super") {
        throw new UnsupportedError("emit-super-prop", "super.属性 访问还没实现（只支持 super.method()）");
      }
      // enum 点访问 `Suit.HEARTS` → 字典取值（GDScript 只允许 enum 这样点访问）
      if (e.obj.kind === "ident" && ENUM_NAMES.has(e.obj.name)) {
        return `rt.index(${e.obj.name}, rt.V.str(${JSON.stringify(e.name)}))`;
      }
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
    case "const":
      return `rt.patConst(${emitExpr(p.expr)})`;
    case "array":
      return `rt.patArray([${p.items.map(emitPattern).join(", ")}])`;
    case "dict":
      return `rt.patDict([${p.entries.map((en) => `[${emitExpr(en.key)}, ${emitPattern(en.pattern)}]`).join(", ")}])`;
  }
}

function patternNames(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternNames);
    case "dict":
      return p.entries.flatMap((en) => patternNames(en.pattern));
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
    // super(...) 构造调用：只在 _init(constructor) 上下文合法，发成 JS 原生 super(args)
    if (name === "super") {
      if (IN_CONSTRUCTOR) return `super(${args.join(", ")})`;
      throw new UnsupportedError("emit-super-ctor", "super(...) 只能出现在 _init 里");
    }
    if (BUILTIN_TODO.has(name)) {
      throw new UnsupportedError("emit-builtin", `内置函数 ${name}() 还没实现`);
    }
    // 其余一律当作继承来的方法 —— 与语义分析层的宽容策略一致
    // （create_timer / quit 这些是 SceneTree 上的，不是本脚本定义的）
    return `this.${name}(${args.join(", ")})`;
  }

  if (e.callee.kind === "attribute") {
    // super.method(...) → JS 原生 super 调用（我们的类用真 extends，语义正好对上）
    if (e.callee.obj.kind === "ident" && e.callee.obj.name === "super") {
      return `super.${e.callee.name}(${args.join(", ")})`;
    }
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
