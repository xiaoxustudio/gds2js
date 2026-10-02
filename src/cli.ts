#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import type { Dirent } from "node:fs";
import { compileProject } from "./compile/project";
import { bundleModule, bundlingAvailable } from "./bundle";
import { runProduct } from "./exec";
import { runCli, type CliSpec } from "./argv";
import { FLAGS, withCommon } from "./commands";
import { selfFile, selfHome } from "./home";
import { emitModule, emitModuleWithMap } from "./emit/emitter";
import type { RawSourceMap } from "./emit/sourcemap";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { UnsupportedError } from "./runtime/errors";

/** 不用 `Date.prototype.toLocaleTimeString`：它在静态目标上没有 lowering（实测 SC2020），这里手搓同一个 `hh:mm:ss`。 */
function hhmmss(d: Date): string {
  const two = (n: number): string => (n < 10 ? "0" + String(n) : String(n));
  return two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds());
}

type CmdName = "check" | "build" | "check-project" | "build-project" | "run" | "run-project" | "export";
type RuntimeMode = "import" | "local" | "single";

/** 旁挂/内联用的自包含运行时文件名（local 模式复制到输出目录时用它）。 */
const STANDALONE_FILE = "gds2js-standalone.cjs";

function standalonePath(): string {
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

interface Ctx {
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

interface Diag {
  code: string;
  message: string;
  line: number;
  col: number;
  file: string;
}

/** commander 把 --no-host 解析成 false、--host X 解析成字符串、缺省给默认值。三态归一到 null|string。 */
/**
 * 自带家目录的 exe（原生 / SEA）里，产物那句 `import ... from "gds2js/runtime"` **没人能解析** ——
 * 裸说明符要的是 node_modules。所以这时候 `--runtime/--host` 的默认值直接给家目录里那份打平运行时的
 * file URL（就是 `export` 铺树时用的同一份 `dist/product.mjs`，`--runtime-mode import` 从此自足）。
 * npm 安装态家目录为 null，说明符照旧是裸的。
 */
function selfRuntimeSpec(): string | null {
  const p = selfFile(`dist/${PRODUCT_RUNTIME_FILE}`);
  return p === null ? null : pathToFileURL(p).href;
}

function runtimeOf(v: unknown): string {
  return strOf(v) ?? selfRuntimeSpec() ?? "gds2js/runtime";
}

/**
 * `opts` 来自 argv 解析器，形状是 `Record<string, unknown>` —— 旗标没给就是**没有**。
 * 静态目标上 `unknown as string` 是带运行期检查的断言（实测：值为 undefined 时抛
 * `expected string at $, got undefined`，S235），所以这里一律 typeof 收窄，不 `as`。
 */
function strOf(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function modeOf(v: unknown): RuntimeMode {
  if (v === "single") return "single";
  if (v === "local") return "local";
  return "import";
}

function hostOf(hostOpt: unknown): string | null {
  if (hostOpt === false) return null;
  if (typeof hostOpt === "string") return hostOpt;
  return selfRuntimeSpec() ?? "gds2js/host";
}

function packOf(v: unknown): Pack {
  if (v === undefined || v === "node") return "node";
  if (v === "scriptc") return "scriptc";
  console.error(`export --pack 只能是 node | scriptc（收到 ${JSON.stringify(v)}）`);
  process.exit(1);
}

/** 工程级命令：入口按 res:// 根展开、把根下的 .gd 递归全收进同一次编译。 */
function isProjectCmd(cmd: CmdName): boolean {
  return cmd === "check-project" || cmd === "build-project" || cmd === "run-project";
}

function findResRoot(entryAbs: string): { root: string; inferred: boolean } {
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

function findNestedProjects(root: string): string[] {
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

function refuseNestedProjects(input: string, root: string, nested: string[]): never {
  console.error(
    `${input}:  error  ${root} 本身不是 Godot 工程（向上没找到 project.godot），但它下面嵌着 ${nested.length} 个工程：\n    ` +
      nested.join("\n    "),
  );
  console.error(
    "  工程级命令（check-project / build-project / run-project，以及入口确实在某个工程里的 export）会把根目录下的 .gd **递归全收**进同一次编译，\n" +
      "  而那些子工程脚本里的 res:// 路径是按外层根解析的 —— 所以报出来的缺文件跟给的入口看着毫无关系。\n" +
      `  改指那个工程里的脚本（例如 ${join(nested[0] ?? root, "main.gd")}），或用 --res-root 明确根目录；\n` +
      "  只编译单个脚本请用 gds2js build / gds2js run（单文件路径不解析 res://）。",
  );
  process.exit(1);
}

interface Loaded {
  ir: ReturnType<typeof lower>;
  diags: Diag[];
}

async function tryLoadSingle(absPath: string): Promise<Loaded | { error: string }> {
  let src: string;
  try {
    src = readFileSync(absPath, "utf8");
  } catch (e) {
    return { error: `${absPath}: 读不到文件：${e instanceof Error ? e.message : String(e)}` };
  }
  try {
    const ir = lower(await parseSource(src));
    return { ir, diags: toDiags(absPath, ir) };
  } catch (e) {
    return { error: `${absPath}:1:1  error  ${e instanceof Error ? e.message : String(e)}` };
  }
}

function toDiags(absPath: string, ir: ReturnType<typeof lower>): Diag[] {
  return analyze(ir).map((d) => ({ code: d.code, message: d.message, line: d.loc.line, col: d.loc.col, file: absPath }));
}

function printDiags(diags: Diag[]): boolean {
  for (const d of diags) console.error(`${d.file}:${d.line}:${d.col}  error  ${d.code}: ${d.message}`);
  if (diags.length > 0) console.error(`\n${diags.length} 个错误。`);
  return diags.length === 0;
}

function errOf(e: unknown): string {
  return e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : String(e);
}

async function buildSingle(ctx: Ctx): Promise<boolean> {
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (!printDiags(loaded.diags)) return false;

  let code: string;
  let map: RawSourceMap | null = null;
  try {
    const emitOpts = emitOptsFor(ctx, ctx.outPath);
    const result = ctx.sourcemap
      ? emitModuleWithMap(loaded.ir, {
          ...emitOpts,
          sourcemap: true,
          sourceFile: ctx.input,
          jsFile: basename(ctx.outPath),
        })
      : { code: emitModule(loaded.ir, emitOpts), map: null };
    code = result.code;
    map = result.map;
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  }
  mkdirSync(dirname(ctx.outPath), { recursive: true });
  writeFileSync(ctx.outPath, code, "utf8");
  if (map) writeFileSync(`${ctx.outPath}.map`, JSON.stringify(map), "utf8");
  console.error(`${ctx.outPath}: 已生成 (${code.split("\n").length} 行)${map ? " + .map" : ""}`);
  return true;
}

/**
 * `emitModule` 那三个模式共用的选项。刻意是一张**声明过的记录**而不是 `Record<string, unknown>`：
 * 展开一张值类型为 `unknown` 的索引记录在静态目标上没有形状（SC1090，实测在原生 CLI 构建里定位到本行调用点）。
 */
type EmitOpts = {
  runtimeImport: string;
  hostImport: string | null;
  autoRun?: boolean;
  runtimeMode?: "single" | "local";
  standaloneInline?: string;
  standaloneRequirePath?: string;
};

function emitOptsFor(ctx: Ctx, outPath: string): EmitOpts {
  const base = { runtimeImport: ctx.runtimeImport, hostImport: ctx.hostImport, autoRun: ctx.run };
  if (ctx.runtimeMode === "single") {
    return { ...base, runtimeMode: "single", standaloneInline: readFileSync(standalonePath(), "utf8") };
  }
  if (ctx.runtimeMode === "local") {
    const dest = join(dirname(outPath), STANDALONE_FILE);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(standalonePath(), dest);
    const rel = "./" + relative(dirname(outPath), dest).split("\\").join("/");
    return { ...base, runtimeMode: "local", standaloneRequirePath: rel };
  }
  return base;
}

function runtimeFileUrls(): { rt: string; host: string } {
  const rt = selfFile("dist/runtime.mjs");
  const host = selfFile("dist/host.mjs");
  if (rt && host) return { rt: pathToFileURL(rt).href, host: pathToFileURL(host).href };
  try {
    const req = createRequire(import.meta.url);
    return {
      rt: pathToFileURL(req.resolve("gds2js/runtime")).href,
      host: pathToFileURL(req.resolve("gds2js/host")).href,
    };
  } catch (e) {
    throw new Error(
      `打包 single 需要先构建 dist（gds2js/runtime / gds2js/host）。跑 pnpm build。原因：${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
}

async function selfContainedBundle(ctx: Ctx): Promise<string | null> {
  const emit = mkdtempSync(join(tmpdir(), "gds2js-emit-"));
  try {
    const { rt, host } = runtimeFileUrls();
    const result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: emit,
      runtimeImport: rt,
      hostImport: ctx.hostImport === null ? null : host,
      autoRun: ctx.run ? undefined : false,
    });
    if (!printDiags(projectDiags(result, ctx.resRoot))) return null;
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const wantRes = "res://" + relative(ctx.resRoot, ctx.input).split("\\").join("/");
    const entry = result.modules.find((m) => m.resPath === wantRes) ?? result.modules[0];
    if (!entry) {
      console.error(`${ctx.input}: 无可打包模块`);
      return null;
    }
    await bundleModule(entry.jsPath, ctx.outDir);
    const bundlePath = join(ctx.outDir, basename(entry.jsPath).replace(/\.mts$/i, ".mjs"));
    console.error(`已编译并 bundle 成单文件 → ${bundlePath}`);
    return bundlePath;
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  } finally {
    rmSync(emit, { recursive: true, force: true });
  }
}

async function bundleProjectSingle(ctx: Ctx): Promise<boolean> {
  if (!(await bundlingAvailable())) {
    console.error(`${ctx.input}:  error  这个构建里没带可用的打包器（tsdown），--runtime-mode single 做不了。`);
    console.error("  自包含 exe 用 export 出货：--pack node 或 --pack scriptc 都不需要 single；");
    console.error("  要 single 请在装了 gds2js 的 node 环境里跑：gds2js build-project <entry> --runtime-mode single");
    return false;
  }
  return (await selfContainedBundle(ctx)) !== null;
}

/** `export` 铺出来的中间模块树：两支 pack、单文件与工程都归到这一个形状上。 */
type ExportTree = { entry: string; files: string[]; dirs: string[] };

/** 空的目录清单。刻意用**声明过的** `string[]` 常量，而不是裸 `[]` 字面量 ——
 *  静态目标上裸空数组推断成 `number[]`，塞进 `dirs: string[]` 那一格时运行期被联合检查拒：
 *  `a '{ dirs: number[]; entry: string; files: string[] }' value is not representable in the target union`（S235 实测）。 */
const NO_DIRS: string[] = [];

async function exportTree(ctx: Ctx): Promise<ExportTree | null> {
  if (!ctx.project) return exportSingleTree(ctx);
  const dir = ctx.outDir;
  const product = productRuntimePath();
  try {
    // 打平运行时只在**树根**放一份，每个模块的 import 按自己那一层的深度算（`runtimeRoot`）。
    // 以前是「每个模块目录各拷一份」，那些副本在 ESM/VFS 里是**不同的模块实例** ——
    // 于是同一个脚本类就有两张 runtime 图，跨目录调方法报 `对象上的 render() 未实现`（实测嵌套工程，S223）。
    mkdirSync(dir, { recursive: true });
    const result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: dir,
      runtimeRoot: dir,
      runtimeFile: PRODUCT_RUNTIME_FILE,
      hostFile: PRODUCT_RUNTIME_FILE,
      runtimeImport: "./" + PRODUCT_RUNTIME_FILE,
      hostImport: ctx.hostImport === null ? null : "./" + PRODUCT_RUNTIME_FILE,
      autoRun: ctx.run ? undefined : false,
    });
    if (!printDiags(projectDiags(result, ctx.resRoot))) return null;
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const wantRes = "res://" + relative(ctx.resRoot, ctx.input).split("\\").join("/");
    const entry = result.modules.find((m) => m.resPath === wantRes) ?? result.modules[0];
    if (!entry) {
      console.error(`${ctx.input}: 无可编译模块`);
      return null;
    }
    const dirs = [...new Set(result.modules.map((m) => dirname(m.jsPath)))];
    copyFileSync(product, join(dir, PRODUCT_RUNTIME_FILE));
    const files = walkMjs(dir);
    if (ctx.verbose) console.error(`已编译成 ${result.modules.length} 个模块 + 1 份打平运行时 → ${dir}`);
    return { entry: entry.jsPath, files, dirs: dirs.filter((d) => d !== dir) };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

async function exportSingleTree(ctx: Ctx): Promise<ExportTree | null> {
  const dir = ctx.outDir;
  const product = productRuntimePath();
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return null;
  }
  if (!printDiags(loaded.diags)) return null;
  const entry = join(dir, basename(ctx.input).replace(/\.gd$/i, "") + ".mts");
  try {
    const code = emitModule(loaded.ir, {
      runtimeImport: "./" + PRODUCT_RUNTIME_FILE,
      hostImport: ctx.hostImport === null ? null : "./" + PRODUCT_RUNTIME_FILE,
      autoRun: ctx.run,
    });
    mkdirSync(dir, { recursive: true });
    writeFileSync(entry, code, "utf8");
    copyFileSync(product, join(dir, PRODUCT_RUNTIME_FILE));
    const files = walkMjs(dir);
    if (ctx.verbose) console.error(`已编译成单文件 + 1 份打平运行时 → ${dir}`);
    return { entry, files, dirs: NO_DIRS };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

/**
 * `--pack scriptc` 的中间树：产物 + `runtime/` 与 `host.ts` 的 **TS 源码**。
 * 静态编的一直是**源码图**（实测把打平的 `product.mjs` 喂给 scriptc 会多出十几格假 `instanceof` 围栏），
 * 所以这里不拷 product.mjs，而是把 `src/runtime/**.ts` 与 `src/host.ts` 原样铺进产物目录。
 * 项目树也铺**一份**：`compileProject` 的 `runtimeRoot` 会把每个模块的 import 算成
 * 它自己那一层的相对路径，整棵树指回同一份源码 —— scriptc 于是只编出一张 runtime 图、一份类身份。
 * （照 node 那支旧行为「每层一份」静态编就会得到 N 份 `ClassDesc`，是静默错里最贵的一类。）
 */
async function exportTsTree(ctx: Ctx): Promise<ExportTree | null> {
  const rt = runtimeTsDir();
  if (rt === null) {
    console.error("找不到 runtime 的 TS 源码（scriptc 编的是源码图，不是打平的 product.mjs）。");
    console.error("  仓库里跑请用 tsx / pnpm dev；发布态请设 GDS2JS_RUNTIME_SRC 指向含 index.ts 的 runtime 目录。");
    exportVerdict("refused", "没有 runtime 的 TS 源码");
    return null;
  }
  // runtime 唯一在树外的依赖是 `../lower/double`（一个零 import 的叶子），宿主是 `../host.ts` ——
  // 两样都按原样的相对位置铺进产物目录，产物的 import 就不用改。
  const srcRoot = dirname(rt);
  const hostTs = join(srcRoot, "host.ts");
  const doubleTs = join(srcRoot, "lower", "double.ts");
  if (!existsSync(hostTs) || !existsSync(doubleTs)) {
    console.error(`runtime 源码的邻居缺一格：${existsSync(hostTs) ? doubleTs : hostTs}`);
    exportVerdict("refused", "runtime 源码的邻居不齐");
    return null;
  }
  const dir = ctx.outDir;
  try {
    mkdirSync(join(dir, "lower"), { recursive: true });
    copyTreeTs(rt, join(dir, "runtime"));
    copyFileSync(hostTs, join(dir, "host.ts"));
    copyFileSync(doubleTs, join(dir, "lower", "double.ts"));
  } catch (e) {
    console.error(`${ctx.input}:  error  铺 runtime 源码失败：${errOf(e)}`);
    return null;
  }
  if (ctx.project) {
    return exportTsProjectTree(ctx, dir);
  }
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return null;
  }
  if (!printDiags(loaded.diags)) return null;
  const entry = join(dir, basename(ctx.input).replace(/\.gd$/i, "") + ".mts");
  try {
    const code = emitModule(loaded.ir, { runtimeImport: "./runtime/index", hostImport: "./host", autoRun: ctx.run });
    writeFileSync(entry, code, "utf8");
    if (ctx.verbose) console.error(`已编译成单文件 + runtime TS 源码（${rt}）→ ${dir}`);
    return { entry, files: walkMjs(dir), dirs: NO_DIRS };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

/** 项目树的静态出货：N 个模块 + 同一份 runtime 源码（`runtimeRoot` 负责把 import 深度逐模块算对）。 */
async function exportTsProjectTree(
  ctx: Ctx,
  dir: string,
): Promise<ExportTree | null> {
  try {
    const result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: dir,
      runtimeRoot: dir,
      runtimeImport: "./runtime/index",
      hostImport: ctx.hostImport === null ? null : "./host",
      autoRun: ctx.run ? undefined : false,
    });
    if (!printDiags(projectDiags(result, ctx.resRoot))) return null;
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const wantRes = "res://" + relative(ctx.resRoot, ctx.input).split("\\").join("/");
    const entry = result.modules.find((m) => m.resPath === wantRes) ?? result.modules[0];
    if (!entry) {
      console.error(`${ctx.input}: 无可编译模块`);
      return null;
    }
    if (ctx.verbose) console.error(`已编译成 ${result.modules.length} 个模块 + 1 份 runtime 源码 → ${dir}`);
    return { entry: entry.jsPath, files: walkMjs(dir), dirs: NO_DIRS };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

/** export 用的自带运行时文件名（由 `tsdown.product.config.ts` 打成零 import 的单文件）。 */
const PRODUCT_RUNTIME_FILE = "product.mjs";
/** `--pack node` 放在模块树根上的 SEA main 转接文件（入口在子目录时靠它对回 VFS 的挂载根）。 */
const SEA_MAIN_FILE = "sea-main.mjs";
/** 两支 pack 共用的中间树目录名 —— 只有这个名字的目录才允许整棵收掉（清理时靠它兜底）。 */
const EXPORT_TREE_DIR = ".gds2js-export";

function productRuntimePath(): string {
  const p = selfFile(`dist/${PRODUCT_RUNTIME_FILE}`) ?? join(runtimeDistDir(), PRODUCT_RUNTIME_FILE);
  if (!existsSync(p)) throw new Error(`没有 dist/${PRODUCT_RUNTIME_FILE}（先 pnpm build）：找的是 ${p}`);
  return p;
}

function runtimeDistDir(): string {
  const fromHome = selfFile("dist/runtime.mjs");
  if (fromHome) return dirname(fromHome);
  return dirname(createRequire(import.meta.url).resolve("gds2js/runtime"));
}

function walkMjs(dir: string): string[] {
  const out: string[] = [];
  const stack = [""];
  while (stack.length > 0) {
    const rel = stack.pop() as string;
    for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
      const p = rel === "" ? e.name : `${rel}/${e.name}`;
      if (e.isDirectory()) stack.push(p);
      else if (/\.m(ts|js)$/.test(e.name)) out.push(p);
    }
  }
  return out.sort();
}

function diagText(r: { stdout?: string; stderr?: string; status?: number | null }): string {
  return ((r.stdout ?? "") + (r.stderr ?? "")).trim() || `退出码 ${r.status}`;
}

/** 宿主只驱动 SceneTree 的 `_initialize` / `_process`；产物里两个都没有，跑起来就是什么都不做。 */
function hasHostEntry(code: string): boolean {
  return /_(initialize|process)\s*\(/.test(code);
}

/** 只截前 n 行：外部编译器/LLVM 的报告动辄上百行，别把终端糊死。 */
function head(text: string, n: number): string {
  return text.split(/\r?\n/).slice(0, n).join("\n");
}

type Pack = "node" | "scriptc";

/**
 * `--build-sea` 的起点版本。实测 24.21 没这个 flag（且那边的 SEA 静默忽略 `mainFormat`），
 * 26.7.0 有、并且认 `mainFormat: "module"` —— 所以产物那句顶层 await 原样能跑，发射形状不用改。
 */
const SEA_MIN_NODE = "25.7.0";

function versionAtLeast(v: string, min: string): boolean {
  const a = v.replace(/^v/, "").split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

function nodeVersionOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  if (r.error || r.status !== 0) return null;
  const out = (r.stdout || "").trim();
  return /^\d+\.\d+\.\d+/.test(out) ? out : null;
}

function refuseOldSea(cmd: string, input: string, outPath: string, got: string | null, bin: string | null): void {
  const v = bin === null ? null : nodeVersionOf(bin);
  const hint = v !== null && versionAtLeast(v, SEA_MIN_NODE) ? bin : '"<Node >= 25.7>"';
  exportVerdict("refused", bin === null ? "找不到可用的 node" : `node SEA 版本不够（要 >= ${SEA_MIN_NODE}，实测 ${got ?? "不可用"}）`);
  if (bin === null) {
    console.error(`${input}:  error  ${cmd} 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），但这台机器上没找到 node。`);
    console.error(`  自包含 exe 里**不带 node**（用户决定：node 是外部打包器）。三条出路：`);
    console.error(`    ① 装个 Node >= ${SEA_MIN_NODE} 并让它出现在 PATH 上；`);
    console.error(`    ② --node <path> 或 GDS2JS_NODE_BIN=<path> 指过去；`);
    console.error(`    ③ 改用 --pack scriptc（静态编 runtime 源码图，产物里**不带 node**，也不要求够新的 node）。`);
    return;
  }
  console.error(`${input}:  error  ${cmd} 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），${bin} 是 ${got ?? "不可用"}。`);
  console.error(`  换够新的 node 重跑即可：\n    ${hint} ${process.argv[1] ?? "gds2js"} ${cmd} ${input} -o ${outPath}`);
}

function externalSeaNode(explicit: string | null): string | null {
  const wanted = explicit ?? process.env.GDS2JS_NODE_BIN;
  if (wanted) return wanted;
  if (!selfHome()) return process.execPath;
  for (const cand of ["node", "node.exe"]) {
    if (nodeVersionOf(cand) !== null) return cand;
  }
  return null;
}

/** scriptc 那一支：二进制名、失败分类，以及「静态产物要 TS 源码图」的铺法。 */
function scriptcBin(): string {
  const env = process.env.SCRIPTC_BIN?.trim();
  return env === undefined || env === "" ? "scriptc" : env;
}

function preflightScriptc(): { bin: string; version: string } | null {
  const bin = scriptcBin();
  const r = spawnSync(bin, ["--version"], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (r.error || r.status !== 0) {
    console.error(`${bin} --version 失败：${r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr })}`);
    console.error("  装 scriptc（npm i -g scriptc），或用 SCRIPTC_BIN 指到具体可执行文件。");
    exportVerdict("refused", "scriptc 二进制不可用");
    return null;
  }
  return { bin, version: (r.stdout || "").trim() };
}

/**
 * scriptc 的围栏分三类报（原文只截一行，分类结论走 exportVerdict，tools/export-check.ts 认那一行）：
 * - SC2011 / SC2012 / SC2020：标准库或语法**没有 lowering** → no-lib（要的是补形状，不是补类型）
 * - SC9001：编译器自己 ICE → crash
 * - 其余（SC1090 / SC1091 / SC1013 / SC0001…）：这一形静态编译目标上就是不收 → refused
 */
function scriptcWall(why: string): { v: ExportVerdict; advice: string } {
  const codes = [...why.matchAll(/error (SC\d+)/g)].map((m) => m[1] as string);
  const n = codes.length;
  const head = `scriptc 没能出货（${n === 0 ? "没有 SC 编号的失败" : `${n} 个错`}）`;
  if (codes.includes("SC9001")) return { v: "crash", advice: `  ${head}：scriptc 内部崩溃（SC9001），原文见上。` };
  if (codes.some((c) => c === "SC2011" || c === "SC2012" || c === "SC2020")) {
    return { v: "no-lib", advice: `  ${head}：有形没有 lowering（SC2011/2012/2020）。改发射形状或登记缺的那格，别指望 --dynamic。` };
  }
  if (codes.some((c) => c === "SC1090" || c === "SC1091" || c === "SC1013" || c === "SC1100" || c === "SC1101" || c === "SC2004")) {
    return { v: "refused", advice: `  ${head}：动态形状（按名取成员 / cast 成函数表 / namespace import）静态不收。见 docs/ROADMAP.md 的 scriptc 章节。` };
  }
  return { v: "failed", advice: `  ${head}（原因未归类，原文见上）` };
}

/** runtime 与宿主的 **TS 源码**位置：静态产物编的是源码图，不是打平的 product.mjs。 */
function runtimeTsDir(): string | null {
  const here = dirname(fileURLToPath(import.meta.url));
  const home = selfHome();
  const cands = [process.env.GDS2JS_RUNTIME_SRC, join(here, "runtime"), join(here, "..", "src", "runtime"), home === null ? null : join(home, "src", "runtime")];
  for (const c of cands) if (c !== undefined && c !== null && c !== "" && existsSync(join(c, "index.ts"))) return c;
  return null;
}

function copyTreeTs(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTreeTs(a, b);
    else if(/\.ts$/.test(e.name)) copyFileSync(a, b);
  }
}

type ExportVerdict = "refused" | "no-lib" | "crash" | "failed";
function exportVerdict(v: ExportVerdict, note: string): void {
  console.error(`gds2js-export[${v}] ${note}`);
}

async function exportExecutable(ctx: Ctx): Promise<boolean> {
  if (process.platform !== "win32") {
    console.error(`${ctx.input}:  error  export 只出 Windows 产物（当前平台 ${process.platform}）。Linux 未纳入。`);
    return false;
  }
  const pack = ctx.pack;
  let seaBin = "";
  if (pack === "node") {
    const picked = ctx.seaNode;
    const v = picked === null ? null : nodeVersionOf(picked);
    if (picked === null || v === null || !versionAtLeast(v, SEA_MIN_NODE)) {
      refuseOldSea("export --pack node", ctx.input, ctx.outPath, v, picked);
      return false;
    }
    seaBin = picked;
  }
  const sc = pack === "scriptc" ? preflightScriptc() : null;
  if (pack === "scriptc" && !sc) return false;

  const tree = pack === "scriptc" ? await exportTsTree(ctx) : await exportTree(ctx);
  if (!tree) return false;
  const exe = ctx.outPath;
  const cfg = join(ctx.outDir, "sea-config.json");
  const shim = join(ctx.outDir, SEA_MAIN_FILE);
  let made = false;
  let note = "";
  try {
    if (pack === "scriptc") {
      const args = ["build", tree.entry, "-o", exe, "--strip"];
      note = `scriptc ${sc?.version ?? ""}`;
      if (ctx.verbose) console.error(`  ${sc?.bin ?? "scriptc"} ${args.join(" ")}`);
      const r = spawnSync(sc?.bin ?? "scriptc", args, { encoding: "utf8", windowsHide: true, timeout: 1_500_000 });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr });
        console.error(`${ctx.input}:  error  scriptc 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        const wall = scriptcWall(why);
        exportVerdict(wall.v, "scriptc 没能出货");
        console.error(wall.advice);
      }
    } else if (pack === "node") {
      const entryRel = relative(ctx.outDir, tree.entry).split("\\").join("/");
      writeFileSync(shim, `await import("./${entryRel}");\n`, "utf8");
      const assets: Record<string, string> = { [SEA_MAIN_FILE]: shim };
      for (const rel of tree.files) assets[rel] = join(ctx.outDir, rel);
      writeFileSync(
        cfg,
        JSON.stringify({ main: shim, mainFormat: "module", output: exe, useVfs: true, assets, disableExperimentalSEAWarning: true }, null, 2),
        "utf8",
      );
      note = `node ${nodeVersionOf(seaBin)}`;      if (ctx.verbose) console.error(`  ${seaBin} --build-sea=${cfg}（${tree.files.length} 个模块走 VFS）`);
      const r = spawnSync(seaBin, [`--build-sea=${cfg}`], { encoding: "utf8", windowsHide: true, timeout: 600_000 });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr });
        console.error(`${ctx.input}:  error  --build-sea 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        exportVerdict("failed", "node SEA 没能出货（原因未归类，原文见上）");
      }
    }
    if (!made) console.error(`  中间件留在 ${ctx.outDir}（--keep-bundle 就不会清了），可直接拿它重试编译器。`);
    else {
      console.error(`已导出 ${exe}（${(statSync(exe).size / 1048576).toFixed(1)} MB，${note}）`);
      if (!hasHostEntry(readFileSync(tree.entry, "utf8"))) {
        console.error(`${ctx.input}:  warning  入口没有 _initialize / _process —— 这个 exe 跑起来什么都不执行`);
        console.error("  宿主只驱动 SceneTree 的这两个虚函数：加 `extends SceneTree` + `func _initialize():`（`_ready` 不在其中）");
      }
    }
    return made;
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  } finally {
    if (ctx.keepBundle) console.error(`中间件已保留（--keep-bundle）：${ctx.outDir}`);
    else if (made) {
      const ours = new Set<string>([cfg, shim]);
      for (const rel of tree.files) ours.add(join(ctx.outDir, rel));
      for (const p of ours) rmSync(p, { force: true });
      if (pack === "scriptc") {
        // 这一支的中间树里除了 .mts 还有整份 runtime 源码，外部编译器又会在旁边留 `.scriptc*` 缓存 ——
        // 逐格删删不干净，而这个目录名是工具自己的暂存（EXPORT_TREE_DIR），整棵收掉才不留渣。
        if (basename(ctx.outDir) === EXPORT_TREE_DIR) rmSync(ctx.outDir, { recursive: true, force: true });
      } else {
        for (const d of tree.dirs.sort((a, b) => b.length - a.length)) {
          try {
            rmdirSync(d);
          } catch {
          }
        }
        try {
          rmdirSync(ctx.outDir);
        } catch {
        }
      }
    }
  }
}

async function buildProject(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode === "single") return bundleProjectSingle(ctx);
  let result: CompileResult;
  try {
    // 刻意用**一张带可选格的记录**，不是「两种形状二选一」：联合记录展开没有 lowering（SC1090）。
    const modeOpts: { runtimeMode?: "import" | "local"; standaloneFile?: string } = { runtimeMode: "import" };
    if (ctx.runtimeMode === "local") {
      mkdirSync(ctx.outDir, { recursive: true });
      const dest = join(ctx.outDir, STANDALONE_FILE);
      copyFileSync(standalonePath(), dest);
      modeOpts.runtimeMode = "local";
      modeOpts.standaloneFile = dest;
    }
    result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: ctx.outDir,
      runtimeImport: ctx.runtimeImport,
      hostImport: ctx.hostImport,
      autoRun: ctx.run ? undefined : false,
      sourcemap: ctx.sourcemap,
      ...modeOpts,
    });
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  }
  if (!printDiags(projectDiags(result, ctx.resRoot))) return false;
  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
    if (m.map) writeFileSync(`${m.jsPath}.map`, JSON.stringify(m.map), "utf8");
  }
  console.error(`已编译 ${result.modules.length} 个模块 → ${ctx.outDir}`);
  return true;
}

async function checkSingle(ctx: Ctx): Promise<boolean> {
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (!printDiags(loaded.diags)) return false;
  console.error(`${ctx.input}: 静态检查通过`);
  return true;
}

async function checkProject(ctx: Ctx): Promise<boolean> {
  let result: CompileResult;
  try {
    result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: ctx.outDir,
      runtimeImport: ctx.runtimeImport,
      hostImport: ctx.hostImport,
      autoRun: false,
    });
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  }
  if (!printDiags(projectDiags(result, ctx.resRoot))) return false;
  console.error(`静态检查通过：${result.modules.length} 个文件`);
  return true;
}

/** `compileProject` 的返回。刻意声明出来：隐式 any 的局部变量在静态目标上是个**通配符槽**，
 *  值过槽要逐格校验（`dirs: []` 被当成 number[] 拒掉就是这么来的，S235）。 */
type CompileResult = Awaited<ReturnType<typeof compileProject>>;

function projectDiags(result: CompileResult, resRoot: string): Diag[] {
  return result.diags.map((d) => ({
    file: join(resRoot, d.resPath.replace(/^res:\/\//, "")),
    code: d.diagnostic.code,
    message: d.diagnostic.message,
    line: d.diagnostic.loc.line,
    col: d.diagnostic.loc.col,
  }));
}

/** 临时产物的名字前缀（跑完即删；留着是给 --keep 看生成代码用的）。 */
const RUN_TMP = ".gds2js-run-";

async function runSingle(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode === "local") {
    console.error(`${ctx.input}:  error  run 不支持 --runtime-mode local（会往源目录旁挂 standalone；要旁挂请先 build）`);
    return false;
  }
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (!printDiags(loaded.diags)) return false;

  const tmpPath = join(dirname(ctx.input), `${RUN_TMP}${process.pid}.mts`);
  try {
    writeFileSync(tmpPath, emitModule(loaded.ir, emitOptsFor({ ...ctx, run: true }, tmpPath)), "utf8");
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    rmSync(tmpPath, { force: true });
    return false;
  }
  try {
    await runProduct(tmpPath);
    return true;
  } catch (e) {
    console.error(`${ctx.input}:  runtime error  ${errOf(e)}`);
    return false;
  } finally {
    if (!ctx.keep) {
      rmSync(tmpPath, { force: true });
    } else {
      console.error(`${tmpPath}: 已生成并保留（--keep）`);
    }
  }
}

async function runProject(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode !== "import") {
    console.error(`${ctx.input}:  error  run-project 只支持 --runtime-mode import（local/single 请先 build-project 再 node 产物）`);
    return false;
  }
  const outDir = join(ctx.resRoot, `${RUN_TMP}${process.pid}`);
  let result: CompileResult;
  try {
    result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir,
      runtimeImport: ctx.runtimeImport,
      hostImport: ctx.hostImport,
      autoRun: undefined,
    });
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  if (!printDiags(projectDiags(result, ctx.resRoot))) {
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }
  const entryRes = "res://" + relative(ctx.resRoot, ctx.input).split(sep).join("/");
  const entry = result.modules.find((m) => m.resPath === entryRes) ?? result.modules[result.modules.length - 1];
  if (!entry) {
    console.error(`${ctx.input}: 工程里没有可执行的模块`);
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  try {
    await runProduct(entry.jsPath);
    return true;
  } catch (e) {
    console.error(`${ctx.input}:  runtime error  ${errOf(e)}`);
    return false;
  } finally {
    if (!ctx.keep) rmSync(outDir, { recursive: true, force: true });
    else console.error(`${outDir}: 产物已保留（--keep）`);
  }
}

const RUNNERS: Record<CmdName, (ctx: Ctx) => Promise<boolean>> = {
  check: checkSingle,
  build: buildSingle,
  "check-project": checkProject,
  "build-project": buildProject,
  run: runSingle,
  "run-project": runProject,
  export: exportExecutable,
};

async function dispatch(ctx: Ctx): Promise<void> {
  const ok = await RUNNERS[ctx.cmd](ctx);
  if (!ctx.watch) {
    process.exit(ok ? 0 : 1);
  }
  startWatch(ctx);
}

/**
 * `--watch`：改 .gd 就重跑。
 *
 * 用**轮询摘要**而不是 `fs.watch`：静态目标上那两格都没有 lowering —— `{ recursive: true }` 整格 SC2020，
 * 非递归的监听器也只收 `()` / `(eventType: string)`，拿不到 `filename`（实测 SC2020）。
 * 少了 filename 就分不清「用户改了 .gd」和「我们刚写出 .mts」，会自己触发自己。
 * 摘要 = 范围内每个 .gd 的「路径:修改时间:大小」，两边同一份实现，也不吃 watcher 句柄上限。
 */
const WATCH_POLL_MS = 250;

/** 工程模式下不往下走的目录名：里面的 .gd 不是用户正在写的代码。 */
const WATCH_SKIP = /^(\.git|\.godot|node_modules)$/;

function gdSignature(dir: string, deep: boolean): string {
  const parts: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const d = stack.pop() as string;
    let entries: Dirent[] = [];
    try {
      entries = readdirSync(d, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      const p = join(d, e.name);
      if (e.isDirectory()) {
        if (deep && !WATCH_SKIP.test(e.name)) stack.push(p);
      } else if (/\.gd$/i.test(e.name)) {
        try {
          const st = statSync(p);
          parts.push(p + ":" + String(Math.round(st.mtimeMs)) + ":" + String(st.size));
        } catch {
          parts.push(p + ":gone");
        }
      }
    }
  }
  return parts.sort().join("|");
}

function startWatch(ctx: Ctx): void {
  const isProject = ctx.cmd === "check-project" || ctx.cmd === "build-project";
  const watchDir = isProject ? ctx.resRoot : dirname(ctx.input);
  console.error(`\n👀 监听 ${watchDir}（改 .gd 自动重跑，Ctrl+C 退出）`);

  try {
    if (!statSync(watchDir).isDirectory()) {
      console.error(`监听失败：${watchDir} 不是目录。`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`监听失败：${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }

  let timer: NodeJS.Timeout | null = null;
  const onChange = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      console.error(`\n—— 重新运行 ${hhmmss(new Date())} ——`);
      void RUNNERS[ctx.cmd](ctx);
    }, 80);
  };

  let last = "";
  const poll = (): void => {
    const sig = gdSignature(watchDir, isProject);
    if (last !== "" && sig !== last) onChange();
    last = sig;
  };
  poll();
  setInterval(poll, WATCH_POLL_MS);
}

const resolveCtx = (
  cmd: CmdName,
  file: string,
  opts: Record<string, unknown>,
): Ctx => {
  const input = resolve(file);
  const givenRoot = typeof opts.resRoot === "string" ? resolve(opts.resRoot) : null;
  const projectCmd = isProjectCmd(cmd);
  const foundRoot = projectCmd || cmd === "export" ? findResRoot(input) : null;
  const exportProject = cmd === "export" && (givenRoot !== null || foundRoot?.inferred === false);
  const isProject = projectCmd || exportProject;
  let resRoot = "";
  if (givenRoot) {
    resRoot = givenRoot;
  } else if (projectCmd && foundRoot) {
    if (foundRoot.inferred) {
      const nested = findNestedProjects(foundRoot.root);
      if (nested.length > 0) refuseNestedProjects(input, foundRoot.root, nested);
    }
    resRoot = foundRoot.root;
  } else if (exportProject && foundRoot) {
    resRoot = foundRoot.root;
  } else if (cmd === "export") {
    resRoot = dirname(input);
  }
  const out = strOf(opts.out);
  return {
    cmd,
    input,
    outPath: resolve(
      out ??
        (cmd === "export"
          ? join(dirname(input), basename(input).replace(/\.gd$/i, "")) + (process.platform === "win32" ? ".exe" : "")
          : input.replace(/\.gd$/i, ".mts")),
    ),
    resRoot,
    project: isProject,
    outDir: isProject
      ? resolve(cmd === "export" ? join(resRoot, EXPORT_TREE_DIR) : (out ?? join(resRoot, ".gds2js")))
      : cmd === "export"
        ? resolve(join(dirname(input), EXPORT_TREE_DIR))
        : "",
    runtimeImport: runtimeOf(opts.runtime),
    hostImport: hostOf(opts.host),
    runtimeMode: modeOf(opts.runtimeMode),
    run: opts.run !== false,
    sourcemap: opts.sourcemap === true,
    watch: opts.watch === true,
    keep: opts.keep === true,
    pack: cmd === "export" ? packOf(opts.pack) : "node",
    seaNode: cmd === "export" ? externalSeaNode(strOf(opts.node)) : process.execPath,
    keepBundle: opts.keepBundle === true,
    verbose: opts.verbose === true,
  };
};

const CLI: CliSpec = {
  name: "gds2js",
  description: "GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）",
  commands: [
    {
      name: "check",
      args: ["file"],
      description: "静态检查（解析 / lowering / 语义分析）",
      flags: withCommon([]),
      run: (p, o) => dispatch(resolveCtx("check", p[0] as string, o)),
    },
    {
      name: "build",
      args: ["file"],
      description: "编译单个文件成 ESM 模块",
      flags: withCommon([FLAGS.out("输出文件（默认与源同名 .mts）"), FLAGS.runtimeMode, FLAGS.noRun, FLAGS.sourcemap]),
      run: (p, o) => dispatch(resolveCtx("build", p[0] as string, o)),
    },
    {
      name: "check-project",
      args: ["entry"],
      description: "跨文件静态检查（编译作用域内全部 .gd）",
      flags: withCommon([FLAGS.resRoot]),
      run: (p, o) => dispatch(resolveCtx("check-project", p[0] as string, o)),
    },
    {
      name: "build-project",
      args: ["entry"],
      description: "跨文件编译整个工程（class_name / extends / is / preload）",
      flags: withCommon([
        FLAGS.resRoot,
        FLAGS.out("输出目录（默认 <res-root>/.gds2js）"),
        FLAGS.runtimeMode,
        FLAGS.noRun,
        { key: "sourcemap", long: "--sourcemap", help: "为每个产物生成行粒度 .map" },
      ]),
      run: (p, o) => dispatch(resolveCtx("build-project", p[0] as string, o)),
    },
    {
      name: "run",
      args: ["file"],
      description: "编译并直接执行单个脚本：脚本的 print 就是本命令的输出（临时产物跑完即删）",
      flags: withCommon([
        {
          key: "runtimeMode",
          long: "--runtime-mode",
          metavar: "mode",
          help: "运行时打包模式：import(默认) | single(内联自包含)；local 会往源目录旁挂文件，run 不支持",
        },
        FLAGS.keep,
      ]),
      run: (p, o) => dispatch(resolveCtx("run", p[0] as string, o)),
    },
    {
      name: "run-project",
      args: ["entry"],
      description: "编译并直接执行整个工程（跑入口产物，临时目录用完即删；只支持 import 模式）",
      flags: withCommon([FLAGS.resRoot, FLAGS.keep]),
      run: (p, o) => dispatch(resolveCtx("run-project", p[0] as string, o)),
    },
    {
      name: "export",
      args: ["entry"],
      description: "把入口（整工程或单个脚本）编译成模块树，再用 node SEA / scriptc 打成 **Windows** 原生可执行文件",
      flags: [
        {
          key: "pack",
          long: "--pack",
          metavar: "name",
          defaultTo: "node",
          help: "打包器：node(默认，官方 SEA，要 Node>=25.7) | scriptc（外部原生编译器 SCRIPTC_BIN，静态编 runtime 源码图，产物里不带 node）",
        },
        {
          key: "node",
          long: "--node",
          metavar: "path",
          help: "--pack node 时用哪份**外部** node 做 --build-sea（需 ≥25.7）；默认取 GDS2JS_NODE_BIN 否则当前 node，exe 里则从 PATH 找",
        },
        FLAGS.resRoot,
        FLAGS.out("可执行文件输出路径（默认与入口同名，带 .exe）"),
        { key: "keepBundle", long: "--keep-bundle", help: "留下中间产物（排查用），默认删" },
        {
          key: "verbose",
          short: "-v",
          long: "--verbose",
          help: "打出过程细节：外部编译器完整命令行、工作目录、GC 模式的理由；默认只给结论一行",
        },
      ],
      run: (p, o) => dispatch(resolveCtx("export", p[0] as string, o)),
    },
  ],
};

// 一条 `if (argv 空) 印帮助` 的旧行为由 runCli 顶格承担（它返回 Stop 时这里退 0）。
const stop = runCli(CLI, process.argv.slice(2));
if (stop !== null) {
  process.stdout.write(stop.text + "\n");
  process.exit(0);
}
