import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { compileProject } from "@gds2js/compiler/compile/project";
import { selfFile } from "@gds2js/compiler/home";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { PRODUCT_RUNTIME_FILE } from "../paths";

/** 两支 `--pack` 的名字。 */
export type Pack = "node" | "scriptc";

/** 一条命令的实现签名：dispatch 与 watch 都按它调。 */
export type Runner = (ctx: Ctx) => Promise<boolean>;


/** 手搓 `hh:mm:ss`：`Date.prototype.toLocaleTimeString` 在静态目标上没有 lowering。 */
export function hhmmss(d: Date): string {
  const two = (n: number): string => (n < 10 ? "0" + String(n) : String(n));
  return two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds());
}

export type CmdName = "check" | "build" | "check-project" | "build-project" | "run" | "run-project" | "export";
export type RuntimeMode = "import" | "local" | "single";

/** 旁挂/内联用的自包含运行时文件名（local 模式复制到输出目录时用它）。 */
export const STANDALONE_FILE = "gds2js-standalone.cjs";

export function standalonePath(): string {
  const fromHome = selfFile("dist/standalone.cjs");
  if (fromHome) return fromHome;
  try {
    return createRequire(import.meta.url).resolve("gds2js/standalone");
  } catch (e) {
    throw new Error(
      `找不到 gds2js/standalone（dist/standalone.cjs）。先跑 pnpm build 生成，再试 local/single 模式。原因：${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
}

export interface Ctx {
  cmd: CmdName;
  input: string;
  outPath: string;
  resRoot: string;
  outDir: string;
  project: boolean;
  runtimeImport: string;
  hostImport: string | null;
  runtimeMode: RuntimeMode;
  run: boolean;
  sourcemap: boolean;
  watch: boolean;
  keep: boolean;
  pack: Pack;
  seaNode: string | null;
  keepBundle: boolean;
  verbose: boolean;
}

export interface Diag {
  code: string;
  message: string;
  line: number;
  col: number;
  file: string;
}

/** 自带家目录的 exe 里裸说明符没人能解析，`--runtime/--host` 的默认值于是直接给家目录里那份打平运行时的 file URL；npm 安装态家目录为 null，说明符照旧是裸的。 */
export function selfRuntimeSpec(): string | null {
  const p = selfFile(`dist/${PRODUCT_RUNTIME_FILE}`);
  return p === null ? null : pathToFileURL(p).href;
}

export function runtimeOf(v: unknown): string {
  return strOf(v) ?? selfRuntimeSpec() ?? "gds2js/runtime";
}

/** 旗标值一律 typeof 收窄，不 `as string`：静态目标上那是带运行期检查的断言。 */
export function strOf(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

export function modeOf(v: unknown): RuntimeMode {
  if (v === "single") return "single";
  if (v === "local") return "local";
  return "import";
}

/** `--no-host` 给 false、`--host X` 给字符串、缺省给默认值：三态归一到 `null | string`。 */
export function hostOf(hostOpt: unknown): string | null {
  if (hostOpt === false) return null;
  if (typeof hostOpt === "string") return hostOpt;
  return selfRuntimeSpec() ?? "gds2js/host";
}

export function packOf(v: unknown): Pack {
  if (v === undefined || v === "scriptc") return "scriptc";
  if (v === "node") return "node";
  console.error(`export --pack 只能是 node | scriptc（收到 ${JSON.stringify(v)}）`);
  process.exit(1);
}

/** 工程级命令：入口按 res:// 根展开、把根下的 .gd 递归全收进同一次编译。 */
export function isProjectCmd(cmd: CmdName): boolean {
  return cmd === "check-project" || cmd === "build-project" || cmd === "run-project";
}

export function findResRoot(entryAbs: string): { root: string; inferred: boolean } {
  let dir = dirname(entryAbs);
  while (true) {
    try {
      readFileSync(join(dir, "project.godot"), "utf8");
      return { root: dir, inferred: false };
    } catch {
      const parent = dirname(dir);
      if (parent === dir) return { root: dirname(entryAbs), inferred: true };
      dir = parent;
    }
  }
}

export function findNestedProjects(root: string): string[] {
  const out: string[] = [];
  const SKIP = new Set(["node_modules", ".godot", ".git", "dist", "build"]);
  const walk = (dir: string, depth: number): void => {
    if (depth > 6 || out.length >= 5) return;
    let entries: Dirent[] = [];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      if (!e.isDirectory() || e.name.startsWith(".") || SKIP.has(e.name)) continue;
      const p = join(dir, e.name);
      if (existsSync(join(p, "project.godot"))) out.push(p);
      else walk(p, depth + 1);
    }
  };
  walk(root, 0);
  return out;
}

export function refuseNestedProjects(input: string, root: string, nested: string[]): never {
  console.error(
    `${input}:  error  ${root} 本身不是 Godot 工程（向上没找到 project.godot），但它下面嵌着 ${nested.length} 个工程：\n    ` +
      nested.join("\n    "),
  );
  console.error(
    "  工程级命令（check-project / build-project / run-project，以及入口确实在某个工程里的 export）会把根目录下的 .gd **递归全收**进同一次编译，\n" +
      "  而那些子工程脚本里的 res:// 路径是按外层根解析的 —— 所以报出来的缺文件跟给的入口看着毫无关系。\n" +
      `  改指那个工程里的脚本（例如 ${join(nested[0] ?? root, "main.gd")}），或用 --res-root 明确根目录；\n` +
      "  只编译单个脚本请用 gds2js build / gds2js run（拿入口所在目录当 res 根，只收入口引用到的那几份脚本）。",
  );
  process.exit(1);
}

export interface Loaded {
  ir: ReturnType<typeof lower>;
  diags: Diag[];
  /** 入口自己引用了本地脚本（`extends "<路径>"` / `preload("sub.gd")`）—— 这一形要读依赖，走闭包管线。 */
  deps: boolean;
}

export async function tryLoadSingle(absPath: string): Promise<Loaded | { error: string }> {
  let src: string;
  try {
    src = readFileSync(absPath, "utf8");
  } catch (e) {
    return { error: `${absPath}: 读不到文件：${e instanceof Error ? e.message : String(e)}` };
  }
  try {
    const ir = lower(await parseSource(src));
    return { ir, diags: toDiags(absPath, ir), deps: needsClosure(ir) };
  } catch (e) {
    // 下降函数在抛出处挂的行号（S649 那层）这里用得上：引擎的解析期报错报的就是构造自己那一行，别再写死 1:1
    const line = (e as { line?: number }).line;
    return { error: `${absPath}:${String(line ?? 1)}:1  error  ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** `compileProject` 那条收集环认的两个名字 —— 判「要不要读依赖」必须跟它一格不差，否则 `load` 这一形会留在单文件支上撞 `[load-unknown-script]`。 */
const CLOSURE_LOADERS = new Set(["preload", "load"]);

/** `extends` 挂父脚本，或正文 `preload` / `load` 一个本地 `.gd` —— 两者都要把依赖读进来才判得出继承面。 */
function needsClosure(ir: ReturnType<typeof lower>): boolean {
  if (singleFileExtends(ir.extends) !== null) return true;
  let hit = false;
  const walk = (n: unknown): void => {
    if (hit || n === null || typeof n !== "object") return;
    if (Array.isArray(n)) {
      for (const x of n) walk(x);
      return;
    }
    const o = n as Record<string, unknown>;
    const callee = o.callee as Record<string, unknown> | undefined;
    const name = typeof callee?.name === "string" ? callee.name : "";
    if (o.kind === "call" && CLOSURE_LOADERS.has(name)) {
      const a = (o.args as unknown[] | undefined)?.[0] as Record<string, unknown> | undefined;
      if (a !== undefined && typeof a.value === "string" && /\.gd$/.test(a.value)) hit = true;
    }
    for (const k of Object.keys(o)) if (k !== "loc") walk(o[k]);
  };
  walk(ir);
  return hit;
}

/** `extends` 挂的是父脚本（路径 / uid / `.gd`）而不是标识符时给那串文本，否则 null。 */
function singleFileExtends(raw: string | null): string | null {
  if (raw === null) return null;
  const dq = String.fromCharCode(34);
  const sq = String.fromCharCode(39);
  const sl = String.fromCharCode(47);
  const bs = String.fromCharCode(92);
  let t = raw.trim();
  if (t.startsWith(dq) || t.startsWith(sq)) t = t.slice(1);
  if (t.endsWith(dq) || t.endsWith(sq)) t = t.slice(0, -1);
  if (t === "") return null;
  if (t.startsWith("res:" + sl) || t.startsWith("user:" + sl) || t.startsWith("uid:")) return t;
  if (t.includes(sl) || t.includes(bs)) return t;
  if (t.endsWith(".gd")) return t;
  return null;
}

export function toDiags(absPath: string, ir: ReturnType<typeof lower>): Diag[] {
  return analyze(ir, undefined, absPath).map((d) => ({ code: d.code, message: d.message, line: d.loc.line, col: d.loc.col, file: absPath }));
}

export function printDiags(diags: Diag[]): boolean {
  for (const d of diags) console.error(`${d.file}:${d.line}:${d.col}  error  ${d.code}: ${d.message}`);
  if (diags.length > 0) console.error(`\n${diags.length} 个错误。`);
  return diags.length === 0;
}

/** 报错行的正文：真源在 runtime，产物顶层的兜底与 CLI 报的是同一句。 */
export { errOf } from "@gds2js/runtime/runtime/errors";

/** tree-face 清单里的 `.ts` 名 → 发射器说明符/文件名要的裸基名。 */
export function baseName(file: string): string {
  return file.replace(/\.ts$/, "");
}

/** `compileProject` 的返回。刻意声明出来：隐式 any 的局部变量在静态目标上是个通配符槽，值过槽要逐格校验。 */
export type CompileResult = Awaited<ReturnType<typeof compileProject>>;

/** 单文件模式下的闭包编译：只种入口，依赖靠 `extends` / `preload` 拉进来；根取入口所在目录。
 *  继承来的方法 / 字段与宿主名从此判得出，与 `check-project` / `run-project` 共用同一套判定（S455）。 */
/** 闭包的 res 根：命令给了 `--res-root` 就用它（`export` 那一支有这一旗），否则取入口所在目录。 */
export function closureRoot(ctx: Ctx): string {
  return ctx.resRoot === "" ? dirname(ctx.input) : ctx.resRoot;
}

export async function compileClosure(
  ctx: Ctx,
  outDir: string,
  autoRun: boolean | undefined,
  /** 旁挂 standalone 那一形：`local` 只把旁挂文件放在树根，逐模块的 require 路径由 `compileProject` 按各自深度算。 */
  mode: { runtimeMode?: "import" | "local"; standaloneFile?: string } = {},
): Promise<CompileResult> {
  return compileProject({
    entries: [ctx.input],
    resRoot: closureRoot(ctx),
    outDir,
    runtimeImport: ctx.runtimeImport,
    hostImport: ctx.hostImport,
    autoRun,
    closureOnly: true,
    ...mode,
  });
}

/** 入口在闭包结果里的 `res://` 路径（按闭包根算，根可能是用户给的 `--res-root`）。 */
export function closureResPath(ctx: Ctx): string {
  return "res://" + relative(closureRoot(ctx), ctx.input).split(sep).join("/");
}

export function projectDiags(result: CompileResult, resRoot: string): Diag[] {
  return result.diags.map((d) => ({
    file: join(resRoot, d.resPath.replace(/^res:\/\//, "")),
    code: d.diagnostic.code,
    message: d.diagnostic.message,
    line: d.diagnostic.loc.line,
    col: d.diagnostic.loc.col,
  }));
}

