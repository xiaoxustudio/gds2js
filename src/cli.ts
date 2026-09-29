#!/usr/bin/env node
/**
 * gds2js CLI —— GDScript 4.x → JavaScript AOT 编译器。
 *
 *   gds2js check <file.gd>                     静态检查（解析 / lowering / 语义分析）
 *   gds2js build <file.gd> [-o out]            编译单个文件成 ESM 模块
 *   gds2js check-project <entry.gd>            跨文件静态检查（编译作用域内全部 .gd）
 *   gds2js build-project <entry.gd> [-o dir]   跨文件编译整个工程（class_name / extends / is）
 *   gds2js run <file.gd>                       编译并**直接执行**，脚本的 print 就是命令输出
 *   gds2js run-project <entry.gd>              同上，整个工程编译到临时目录后跑入口
 *   gds2js export <entry.gd>                   打成 **Windows 独立可执行文件**（--pack node|perry）
 *
 * 产出的模块 export 一个脚本类，import "gds2js/runtime"（语言运行时）和
 * "gds2js/host"（宿主桩）。怎么驱动生命周期由使用方决定。
 *
 * 参数解析用 commander；下面的构建/检查动作被写成可重跑的纯函数，watch 模式复用同一套。
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, watch, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { Command } from "commander";
import { compileProject } from "./compile/project";
import { emitModule, emitModuleWithMap } from "./emit/emitter";
import type { RawSourceMap } from "./emit/sourcemap";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { UnsupportedError } from "./runtime/errors";

type CmdName = "check" | "build" | "check-project" | "build-project" | "run" | "run-project" | "export";
type RuntimeMode = "import" | "local" | "single";

/** 旁挂/内联用的自包含运行时文件名（local 模式复制到输出目录时用它）。 */
const STANDALONE_FILE = "gds2js-standalone.cjs";

/** 解析 gds2js/standalone（包自引用，源码态与安装态都能定位到 dist/standalone.cjs）。 */
function standalonePath(): string {
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
  /** build（单文件）的输出文件路径。 */
  outPath: string;
  /** 工程命令的 res:// 根与输出目录。 */
  resRoot: string;
  outDir: string;
  runtimeImport: string;
  hostImport: string | null;
  /** 产物运行时打包模式（import 默认 / local 旁挂 / single 内联）。 */
  runtimeMode: RuntimeMode;
  /** build/build-project 是否在产物末尾驱动生命周期（默认 true，产物可直接 node 跑；--no-run 出库）。 */
  run: boolean;
  sourcemap: boolean;
  watch: boolean;
  /** run/run-project：跑完留着临时产物（看生成的代码用），默认删干净。 */
  keep: boolean;
  /** export：用哪个打包器（node 默认 = 官方 SEA；perry = 外部原生编译器）。 */
  pack: Pack;
  /** export --pack node：拿哪个 node 做 --build-sea（它同时就是产物内嵌的运行时）。 */
  seaNode: string;
  /** export：留下中间工作目录（bundle / sea-config），默认删。 */
  keepBundle: boolean;
}

interface Diag {
  code: string;
  message: string;
  line: number;
  col: number;
  file: string;
}

// ---------------------------------------------------------------- 选项归一

/** commander 把 --no-host 解析成 false、--host X 解析成字符串、缺省给默认值。三态归一到 null|string。 */
function hostOf(hostOpt: string | boolean | undefined): string | null {
  if (hostOpt === false) return null;
  return typeof hostOpt === "string" ? hostOpt : "gds2js/host";
}

/** --pack 的取值闸门：写错就响，别默默按默认那条路走（两支的失败形状完全不同）。 */
function packOf(v: unknown): Pack {
  if (v === undefined || v === "node") return "node";
  if (v === "perry") return "perry";
  console.error(`export --pack 只能是 node | perry（收到 ${JSON.stringify(v)}）`);
  process.exit(1);
}

/** 从入口向上找含 project.godot 的目录作为 res:// 根，找不到就用入口所在目录（inferred=true）。 */
function findResRoot(entryAbs: string): { root: string; inferred: boolean } {
  let dir = dirname(entryAbs);
  // eslint-disable-next-line no-constant-condition
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

/**
 * 回退根往下找**嵌套的 Godot 工程**（子目录自己带 project.godot）。
 * 为什么要管：工程级命令会把根目录下的 .gd 递归全收进同一次编译（project.ts 的 findGdFiles），
 * 而那些子工程的 `res://` 是按外层根解析的 —— 于是报出来的 missing-file 跟用户给的入口看着毫无关系。
 */
function findNestedProjects(root: string): string[] {
  const out: string[] = [];
  const SKIP = new Set(["node_modules", ".godot", ".git", "dist", "build"]);
  const walk = (dir: string, depth: number): void => {
    if (depth > 6 || out.length >= 5) return;
    let entries;
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

/** 只在「隐式回退出来的根」上响：显式 --res-root 是用户的决定，不覆盖、也不二次猜测。 */
function refuseNestedProjects(input: string, root: string, nested: string[]): never {
  console.error(
    `${input}:  error  ${root} 本身不是 Godot 工程（向上没找到 project.godot），但它下面嵌着 ${nested.length} 个工程：\n    ` +
      nested.join("\n    "),
  );
  console.error(
    "  工程级命令（check-project / build-project / run-project / export）会把根目录下的 .gd **递归全收**进同一次编译，\n" +
      "  而那些子工程脚本里的 res:// 路径是按外层根解析的 —— 所以报出来的缺文件跟给的入口看着毫无关系。\n" +
      `  改指那个工程里的脚本（例如 ${join(nested[0] ?? root, "main.gd")}），或用 --res-root 明确根目录；\n` +
      "  只编译单个脚本请用 gds2js build / gds2js run（单文件路径不解析 res://）。",
  );
  process.exit(1);
}

// ---------------------------------------------------------------- 单文件前端

interface Loaded {
  ir: ReturnType<typeof lower>;
  diags: Diag[];
}

/** 解析 + lower，不退出。失败把错误信息塞进 diags（供 watch 复用同一套错误呈现）。 */
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

/** 打印诊断；返回是否干净（无诊断）。不退出。 */
function printDiags(diags: Diag[]): boolean {
  for (const d of diags) console.error(`${d.file}:${d.line}:${d.col}  error  ${d.code}: ${d.message}`);
  if (diags.length > 0) console.error(`\n${diags.length} 个错误。`);
  return diags.length === 0;
}

function errOf(e: unknown): string {
  return e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : e instanceof Error ? e.message : String(e);
}

// ---------------------------------------------------------------- 可重跑的构建动作
// watch 模式下同一套函数被反复调用，所以它们只返回成功与否、绝不 process.exit。

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
 * 按 runtimeMode 组装 emit 头部所需选项。
 * - local：把 standalone.cjs 旁挂到产物同目录，产物按 `./gds2js-standalone.cjs` require。
 * - single：读 standalone.cjs 全文内联（旁挂文件不需要）。
 * - import：不改，走 gds2js/runtime + gds2js/host。
 */
function emitOptsFor(ctx: Ctx, outPath: string): Record<string, unknown> {
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

/** 已构建的 dist/runtime.mjs + dist/host.mjs 的 file URL，供打包步骤把运行时按绝对路径内联（不依赖包自引用解析）。 */
function runtimeFileUrls(): { rt: string; host: string } {
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

/**
 * build-project 的 single 模式（也是 export 的前半段）：先按 import 模式把各模块编到系统临时目录
 * （运行时/宿主用 dist 的 file URL，确保 bundler 能在任意路径把它们内联），再交给 rolldown(tsdown build)
 * bundle 成**一个**自包含 .mjs。作用域提升、跨文件类/import、名字冲突都交给真 bundler——不自造拼接（那会静默出错）。
 *
 * 成功返回 bundle 的绝对路径（export 要拿它喂外部编译器），失败返回 null（诊断已打印）。
 */
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
    const { build } = await import("tsdown"); // 仅整app single 才拉 bundler，别把 rolldown 压进每次 CLI 启动
    await build({
      entry: entry.jsPath,
      outDir: ctx.outDir,
      format: "esm",
      target: "node22",
      dts: false,
      clean: true,
      config: false,
      silent: true,
    } as Parameters<typeof build>[0]);
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
  return (await selfContainedBundle(ctx)) !== null;
}

// ---------------------------------------------------------------- 独立可执行文件（export）

function diagText(r: { stdout?: string; stderr?: string; status?: number | null }): string {
  return ((r.stdout ?? "") + (r.stderr ?? "")).trim() || `退出码 ${r.status}`;
}

/** 只截前 n 行：外部编译器/LLVM 的报告动辄上百行，别把终端糊死。 */
function head(text: string, n: number): string {
  return text.split(/\r?\n/).slice(0, n).join("\n");
}

/**
 * 两种打包器：
 * - `node`（默认）：Node 官方的一步式 SEA —— 拿 `<node> --build-sea=<sea-config.json>` 一次生成，要 **Node >= 25.7**。
 *   `--node` / `GDS2JS_NODE_BIN` 可以指另一个够新的二进制，所以 CLI 自己跑在 24 上也能出货。
 * - `perry`：PerryTS 的 `perry compile`（SWC + LLVM，产物里不带 Node）。
 *
 * scriptc 那一支按实测撤了：它硬缺 `Math.fround`（float32 语义）、`bigint`（int64 家族）、
 * 覆写 async 基类方法（`class Main extends SceneTree { async _initialize() }` 就是我们宿主契约本身），
 * 真产物 coverage 也还剩上百处「执行到就抛围栏」—— 细节记在 ROADMAP 5.8。
 * tsdown 的 `exe` 选项本质也是调同一套 SEA，所以不再并存第二份实现。
 */
type Pack = "node" | "perry";

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

/** 问一个 node 二进制的版本；起不来返回 null（PATH 上没有 / 它不是 node）。 */
function nodeVersionOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || "").trim() || null;
}

/** 版本不够时把「该重跑的那条命令」打出来。刚失败的那个 node 不配当建议 —— 那是废话。 */
function refuseOldSea(ctx: Ctx, got: string | null, bin: string): void {
  const v = nodeVersionOf(bin);
  const hint = v !== null && versionAtLeast(v, SEA_MIN_NODE) ? bin : '"<Node >= 25.7>"';
  exportVerdict("refused", `node SEA 版本不够（要 >= ${SEA_MIN_NODE}，实测 ${got ?? "不可用"}）`);
  console.error(
    `${ctx.input}:  error  --pack node 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），${bin} 是 ${got ?? "不可用"}。`,
  );
  console.error(`  换够新的 node 重跑即可：\n    ${hint} ${process.argv[1] ?? "gds2js"} export ${ctx.input} -o ${ctx.outPath} --pack=node`);
}

/**
 * perry 的定位：`PERRY_BIN` 优先，否则先在**本地 node_modules** 解析
 * （它的 npm 包是分平台的，装在 PATH 别处没用 —— 官方 shim 只在自己的 node_modules 树里翻，实测过），
 * 最后才吃 PATH 上的 `perry`。
 */
function perryBin(): string {
  if (process.env.PERRY_BIN) return process.env.PERRY_BIN;
  if (process.platform === "win32" && process.arch === "x64") {
    try {
      return createRequire(import.meta.url).resolve("@perryts/perry-win32-x64/bin/perry.exe");
    } catch {
      /* 没装成本地依赖就回 PATH */
    }
  }
  return "perry";
}

function preflightPerry(): { bin: string; version: string } | null {
  const bin = perryBin();
  const r = spawnSync(bin, ["--version"], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (r.error || r.status !== 0) {
    console.error(`${bin} --version 失败：${r.error?.message ?? diagText(r)}`);
    console.error("  装 @perryts/perry（连带平台包 @perryts/perry-win32-x64），或用 PERRY_BIN 指到具体可执行文件。");
    exportVerdict("refused", "perry 二进制不可用");
    return null;
  }
  return { bin, version: (r.stdout || "").trim() };
}

/**
 * export 的失败分类只从这里出：**我们**给结论，不让下游去 scrape 上游的自由文本 ——
 * 上一轮就是教训：scriptc 先用 `@override` 那类类型检查错挡下来，措辞完全不在预料里，
 * 抓文本的 classify 把「本该拒绝」误报成了红灯。tools/export-check.ts 认的就是这一行。
 */
type ExportVerdict = "refused" | "no-lib" | "crash" | "failed";
function exportVerdict(v: ExportVerdict, note: string): void {
  console.error(`gds2js-export[${v}] ${note}`);
}

/**
 * perry 在本机实测撞的两道墙，各自把它自己吐的原因翻成可行动的补救。
 * 匹配的是 perry 的原文，它改了句子这里就不响 —— 宁可多印一句原文也别猜。
 */
function perryWall(why: string, status: number | null | undefined): { v: ExportVerdict; advice: string } | null {
  if (/Could not find perry_runtime\.lib/.test(why)) {
    return {
      v: "no-lib",
      advice:
        "perry 的 win32 npm 包没带预编译运行时（perry_runtime.lib），链接这一步谁都过不去。\n" +
        "  两条出路：① 等上游把 lib 打进 @perryts/perry-win32-x64；② 自己 checkout perry 源码，\n" +
        "  `cargo build --release -p perry-runtime-static` 后用 PERRY_WORKSPACE_ROOT 指过去。",
    };
  }
  if (/PERRY_RS4GC|WinEH funclet|catchpad/.test(why)) {
    return {
      v: "refused",
      advice:
        "perry 默认的 GC 模式（RS4GC）在 Windows 上不肯编译含 try/catch 的模块 —— 它明说\n" +
        "  LLVM 的 rewrite-statepoints-for-gc 不支持 MSVC funclet EH，硬上会访问违例（上游 #7354）。\n" +
        "  我们的运行时浑身是 try/catch，所以这条必然撞上。可以 `PERRY_RS4GC=0` 绕过（本 CLI 会把环境变量转给 perry），\n" +
        "  但那等于换 GC 策略：产物必须跑一遍全量语料逐字节对 golden 才谈得上可信。",
    };
  }
  if (status === 3221225477 || status === -1073741819) {
    // perry 自己说过这一类会「访问违例而不是报错」，所以崩了就没有文字可匹配，只能认退出码
    return {
      v: "crash",
      advice:
        "perry 在 LLVM 里访问违例（0xC0000005）—— 这就是它预告过的 RS4GC + Windows try/catch 那一类（上游 #7354）。\n" +
        "  实测加 `PERRY_RS4GC=0` 后，我们的整份 bundle 能走完 codegen（约 3.4 分钟）只剩链接那一步：\n" +
        "    PERRY_RS4GC=0 gds2js export <entry.gd> -o app.exe --pack perry\n" +
        "  但那等于换 GC 策略，产物必须跑一遍全量语料逐字节对 golden 才算可信 —— 别默认打开。",
    };
  }
  return null;
}

/**
 * export：整个工程 → **Windows** 独立可执行文件。Linux 产物不做。
 * 输入固定是 `single` 那条路打出的自包含 bundle（零 import、bundler 已擦类型）。
 */
async function exportExecutable(ctx: Ctx): Promise<boolean> {
  if (process.platform !== "win32") {
    console.error(`${ctx.input}:  error  export 只出 Windows 产物（当前平台 ${process.platform}）。Linux 未纳入。`);
    return false;
  }
  const pack = ctx.pack;
  // node 那一支的门禁在「哪个 node 做 SEA」上，与跑 CLI 的进程可以不是同一个
  if (pack === "node") {
    const v = nodeVersionOf(ctx.seaNode);
    if (v === null || !versionAtLeast(v, SEA_MIN_NODE)) {
      refuseOldSea(ctx, v, ctx.seaNode);
      return false;
    }
  }
  const perry = pack === "perry" ? preflightPerry() : null;
  if (pack === "perry" && !perry) return false;

  const bundle = await selfContainedBundle(ctx);
  if (!bundle) return false;
  const exe = ctx.outPath;
  const cfg = join(ctx.outDir, "sea-config.json");
  let made = false;
  try {
    if (pack === "node") {
      // 实测 Node >= 25.7 认 mainFormat:"module"，所以带顶层 await 的 ESM bundle 原样就是合法的 SEA main
      writeFileSync(cfg, JSON.stringify({ main: bundle, mainFormat: "module", output: exe, disableExperimentalSEAWarning: true }, null, 2), "utf8");
      console.error(`node SEA（v${nodeVersionOf(ctx.seaNode)}）打包中：${ctx.seaNode} --build-sea=${cfg}`);
      const r = spawnSync(ctx.seaNode, [`--build-sea=${cfg}`], { encoding: "utf8", windowsHide: true, timeout: 600_000 });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText(r);
        console.error(`${ctx.input}:  error  --build-sea 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        exportVerdict("failed", "node SEA 没能出货（原因未归类，原文见上）");
      }
    } else {
      const bin = perry?.bin ?? "perry";
      const args = ["compile", bundle, "-o", exe];
      console.error(`perry（${perry?.version || bin}）打包中：${bin} ${args.join(" ")}`);
      const r = spawnSync(bin, args, { encoding: "utf8", windowsHide: true, timeout: 1_500_000 });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText(r);
        console.error(`${ctx.input}:  error  perry 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        const wall = perryWall(why, r.status);
        if (wall) {
          exportVerdict(wall.v, "perry 没能出货");
          console.error(wall.advice);
        } else exportVerdict("failed", "perry 没能出货（原因未归类，原文见上）");
      }
    }
    if (!made) console.error(`  bundle 留在 ${bundle}（--keep-bundle 就不会清了），可直接拿它重试编译器。`);
    else console.error(`已导出 Windows 可执行文件（${pack}）→ ${exe} (${(statSync(exe).size / 1048576).toFixed(1)} MB)`);
    return made;
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  } finally {
    if (ctx.keepBundle) console.error(`中间件已保留（--keep-bundle）：${ctx.outDir}`);
    else {
      rmSync(cfg, { force: true });
      if (made) {
        rmSync(bundle, { force: true });
        try {
          rmdirSync(ctx.outDir);
        } catch {
          /* 非空就别递归删用户目录 */
        }
      }
    }
  }
}

async function buildProject(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode === "single") return bundleProjectSingle(ctx);
  let result;
  try {
    const modeOpts =
      ctx.runtimeMode === "local"
        ? (() => {
            mkdirSync(ctx.outDir, { recursive: true });
            const dest = join(ctx.outDir, STANDALONE_FILE);
            copyFileSync(standalonePath(), dest);
            return { runtimeMode: "local" as const, standaloneFile: dest };
          })()
        : { runtimeMode: "import" as const };
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
  let result;
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

function projectDiags(result: Awaited<ReturnType<typeof compileProject>>, resRoot: string): Diag[] {
  return result.diags.map((d) => ({
    file: join(resRoot, d.resPath.replace(/^res:\/\//, "")),
    code: d.diagnostic.code,
    message: d.diagnostic.message,
    line: d.diagnostic.loc.line,
    col: d.diagnostic.loc.col,
  }));
}

// ---------------------------------------------------------------- 直接执行（run）

/** 临时产物的名字前缀（跑完即删；留着是给 --keep 看生成代码用的）。 */
const RUN_TMP = ".gds2js-run-";

/**
 * run：编译 + **在同一个进程里执行**，脚本自己的 `print` 就是命令的输出。
 *
 * 为什么不 spawn 子进程：这台机器上 `node` 子进程会 EBUSY（tools/js-runner.mjs 里记着同一条），
 * 而且宿主桩的 `quit()` 只是置个标志位、由 `SceneTree.run()` 收尾时 `flush()`，
 * 所以进程内 import 一个带 autoRun 的产物就是完整的一次运行，不需要子进程隔离。
 *
 * 临时产物写在**源文件旁边**而不是 os.tmpdir：产物的头部是 `import "gds2js/runtime"` 这样的
 * 裸说明符，node 要从导入方的目录向上找 node_modules，写到临时盘就解析不到了。
 */
async function runSingle(ctx: Ctx): Promise<boolean> {
  // local 模式要把 standalone.cjs 旁挂到产物同目录，而 run 的产物就在用户源文件旁边 ——
  // 为了不留（更不能删）用户目录里的派生文件，run 只走 import / single。
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
    await import(pathToFileURL(tmpPath).href);
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

/** run-project：整个工程编到 `<res-root>/.gds2js-run-<pid>/`，跑入口产物，然后连目录一起删。 */
async function runProject(ctx: Ctx): Promise<boolean> {
  // local/single 目前只有单文件那条路实现过；这里宁可拒绝，也不要"看起来支持、其实按 import 跑"。
  if (ctx.runtimeMode !== "import") {
    console.error(`${ctx.input}:  error  run-project 只支持 --runtime-mode import（local/single 请先 build-project 再 node 产物）`);
    return false;
  }
  const outDir = join(ctx.resRoot, `${RUN_TMP}${process.pid}`);
  let result;
  try {
    result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir,
      runtimeImport: ctx.runtimeImport,
      hostImport: ctx.hostImport,
      // 交回项目层决定谁能被驱动：只有入口产物该带生命周期尾巴，
      // 每个模块都加一遍的话，纯类模块（不继承 SceneTree）就 `.run is not a function`。
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
  // 入口产物：resPath 与入口文件对上的那个模块；找不到就退回拓扑序最后一个。
  const entryRes = "res://" + relative(ctx.resRoot, ctx.input).split(sep).join("/");
  const entry = result.modules.find((m) => m.resPath === entryRes) ?? result.modules[result.modules.length - 1];
  if (!entry) {
    console.error(`${ctx.input}: 工程里没有可执行的模块`);
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  try {
    await import(pathToFileURL(entry.jsPath).href);
    return true;
  } catch (e) {
    console.error(`${ctx.input}:  runtime error  ${errOf(e)}`);
    return false;
  } finally {
    if (!ctx.keep) rmSync(outDir, { recursive: true, force: true });
    else console.error(`${outDir}: 产物已保留（--keep）`);
  }
}

// ---------------------------------------------------------------- 运行 + watch 循环

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

function startWatch(ctx: Ctx): void {
  const isProject = ctx.cmd === "check-project" || ctx.cmd === "build-project";
  const watchDir = isProject ? ctx.resRoot : dirname(ctx.input);
  console.error(`\n👀 监听 ${watchDir}（改 .gd 自动重跑，Ctrl+C 退出）`);

  let timer: NodeJS.Timeout | null = null;
  const onChange = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      console.error(`\n—— 重新运行 ${new Date().toLocaleTimeString()} ——`);
      void RUNNERS[ctx.cmd](ctx);
    }, 80);
  };

  try {
    watch(watchDir, { recursive: isProject }, (_event, filename) => {
      if (filename && /\.gd$/i.test(filename)) onChange();
    });
  } catch (e) {
    console.error(`监听失败：${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
  // watch 句柄不阻止事件循环退出，挂一个巨型 no-op timer 兜底保活。
  setInterval(() => {}, 1 << 30);
}

// ---------------------------------------------------------------- commander 装配

const program = new Command("gds2js")
  .description("GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）")
  .showHelpAfterError();

// 共享选项工厂：所有子命令都吃 --watch / --runtime / --host
function withCommon(cmd: Command): Command {
  return cmd
    .option("--runtime <spec>", "运行时的 import 说明符", "gds2js/runtime")
    .option("--host <spec>", "宿主的 import 说明符", "gds2js/host")
    .option("--no-host", "不引入宿主，发射成不继承任何基类的纯类")
    .option("-w, --watch", "跑一次后监听 .gd 变更自动重跑（错误不中断，Ctrl+C 退出）");
}

const resolveCtx = (
  cmd: CmdName,
  file: string,
  opts: Record<string, unknown>,
): Ctx => {
  const input = resolve(file);
  const isProject = cmd === "check-project" || cmd === "build-project" || cmd === "run-project" || cmd === "export";
  const givenRoot = typeof opts.resRoot === "string" ? resolve(opts.resRoot) : null;
  let resRoot = "";
  if (isProject) {
    if (givenRoot) {
      resRoot = givenRoot;
    } else {
      const found = findResRoot(input);
      if (found.inferred) {
        const nested = findNestedProjects(found.root);
        if (nested.length > 0) refuseNestedProjects(input, found.root, nested);
      }
      resRoot = found.root;
    }
  }
  return {
    cmd,
    input,
    // build：产物带可擦除的 TS 标注（: Promise<void> 等），默认 .mts 才能被 node 原生类型擦除直接跑。
    // export：-o 的语义换成"可执行文件路径"，所以中间工作目录另算（见下面 outDir）。
    outPath: resolve(
      (opts.out as string) ??
        (cmd === "export"
          ? join(dirname(input), basename(input).replace(/\.gd$/i, "")) + (process.platform === "win32" ? ".exe" : "")
          : input.replace(/\.gd$/i, ".mts")),
    ),
    resRoot,
    outDir: isProject
      ? resolve(cmd === "export" ? join(resRoot, ".gds2js-export") : ((opts.out as string) ?? join(resRoot, ".gds2js")))
      : "",
    runtimeImport: (opts.runtime as string) ?? "gds2js/runtime",
    hostImport: hostOf(opts.host as string | boolean | undefined),
    runtimeMode: ((opts.runtimeMode as string) ?? "import") as RuntimeMode,
    run: opts.run !== false,
    sourcemap: opts.sourcemap === true,
    watch: opts.watch === true,
    keep: opts.keep === true,
    pack: cmd === "export" ? packOf(opts.pack) : "node",
    seaNode: cmd === "export" ? ((opts.node as string) ?? process.env.GDS2JS_NODE_BIN) || process.execPath : process.execPath,
    keepBundle: opts.keepBundle === true,
  };
};

withCommon(
  program.command("check <file>").description("静态检查（解析 / lowering / 语义分析）"),
).action((file: string, opts) => dispatch(resolveCtx("check", file, opts)));

withCommon(
  program
    .command("build <file>")
    .description("编译单个文件成 ESM 模块")
    .option("-o, --out <path>", "输出文件（默认与源同名 .mts）")
    .option("--runtime-mode <mode>", "运行时打包模式：import(默认) | local(旁挂 standalone) | single(内联自包含)")
    .option("--no-run", "不在产物末尾驱动生命周期（出库/被 import 时用；默认会 run）")
    .option("--sourcemap", "额外生成行粒度 .map（默认关，关掉时产物字节完全不变）"),
).action((file: string, opts) => dispatch(resolveCtx("build", file, opts)));

withCommon(
  program
    .command("check-project <entry>")
    .description("跨文件静态检查（编译作用域内全部 .gd）")
    .option("--res-root <dir>", "res:// 工程根（默认向上找 project.godot）"),
).action((entry: string, opts) => dispatch(resolveCtx("check-project", entry, opts)));

withCommon(
  program
    .command("build-project <entry>")
    .description("跨文件编译整个工程（class_name / extends / is / preload）")
    .option("--res-root <dir>", "res:// 工程根（默认向上找 project.godot）")
    .option("-o, --out <dir>", "输出目录（默认 <res-root>/.gds2js）")
    .option("--runtime-mode <mode>", "运行时打包模式：import(默认) | local(旁挂 standalone) | single(内联自包含)")
    .option("--no-run", "入口产物不自动驱动生命周期（默认会 run）")
    .option("--sourcemap", "为每个产物生成行粒度 .map"),
).action((entry: string, opts) => dispatch(resolveCtx("build-project", entry, opts)));

withCommon(
  program
    .command("run <file>")
    .description("编译并直接执行单个脚本：脚本的 print 就是本命令的输出（临时产物跑完即删）")
    .option("--runtime-mode <mode>", "运行时打包模式：import(默认) | single(内联自包含)；local 会往源目录旁挂文件，run 不支持")
    .option("--keep", "留下临时产物（看生成的代码用），默认执行完删掉"),
).action((file: string, opts) => dispatch(resolveCtx("run", file, opts)));

withCommon(
  program
    .command("run-project <entry>")
    .description("编译并直接执行整个工程（跑入口产物，临时目录用完即删；只支持 import 模式）")
    .option("--res-root <dir>", "res:// 工程根（默认向上找 project.godot）")
    .option("--keep", "留下临时产物目录（看生成的代码用），默认执行完删掉"),
).action((entry: string, opts) => dispatch(resolveCtx("run-project", entry, opts)));

// export 固定走 single bundle（自包含才打得成 exe），不吃 --runtime-mode；也不套 withCommon。
program
  .command("export <entry>")
  .description("把整个工程编译成自包含 bundle，再用 perry / scriptc 打成 **Windows** 原生可执行文件（产物不带 Node）")
  .option("--pack <name>", "打包器：node(默认，官方 SEA，要 Node>=25.7) | perry（外部原生编译器，PERRY_BIN 可指路）", "node")
  .option("--node <path>", "--pack node 时用哪个 node 做 --build-sea（同时也是产物内嵌的运行时）；默认取 GDS2JS_NODE_BIN 否则当前 node")
  .option("--res-root <dir>", "res:// 工程根（默认向上找 project.godot）")
  .option("-o, --out <file>", "可执行文件输出路径（默认与入口同名，带 .exe）")
  .option("--keep-bundle", "留下中间 bundle（排查用），默认删")
  .action((entry: string, opts) => dispatch(resolveCtx("export", entry, opts)));

// 无参数时打印帮助（与旧版 usage(0) 一致）；未知子命令由 commander 报错并 exit 1。
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
