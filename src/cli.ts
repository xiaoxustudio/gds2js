#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, watch, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { Command } from "commander";
import { compileProject } from "./compile/project";
import { seaFile, seaHome, seaPerryExe } from "./home";
import { emitModule, emitModuleWithMap } from "./emit/emitter";
import type { RawSourceMap } from "./emit/sourcemap";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { perryRuntimeDir } from "./perry";
import { UnsupportedError } from "./runtime/errors";

type CmdName = "check" | "build" | "check-project" | "build-project" | "run" | "run-project" | "export";
type RuntimeMode = "import" | "local" | "single";

/** 旁挂/内联用的自包含运行时文件名（local 模式复制到输出目录时用它）。 */
const STANDALONE_FILE = "gds2js-standalone.cjs";

function standalonePath(): string {
  const fromHome = seaFile("dist/standalone.cjs");
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
function hostOf(hostOpt: string | boolean | undefined): string | null {
  if (hostOpt === false) return null;
  return typeof hostOpt === "string" ? hostOpt : "gds2js/host";
}

function packOf(v: unknown): Pack {
  if (v === undefined || v === "node") return "node";
  if (v === "perry") return "perry";
  console.error(`export --pack 只能是 node | perry（收到 ${JSON.stringify(v)}）`);
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

function runtimeFileUrls(): { rt: string; host: string } {
  const rt = seaFile("dist/runtime.mjs");
  const host = seaFile("dist/host.mjs");
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
    const { build } = await import("tsdown");
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
  if (seaHome() && !(await bundlingAvailable())) {
    console.error(`${ctx.input}:  error  自包含 exe 里没带可用的打包器（rolldown），--runtime-mode single 做不了。`);
    console.error("  export --pack node 不需要它（走 SEA 的 VFS）；要 single 请用 npm 安装态：gds2js build-project <entry> --runtime-mode single");
    return false;
  }
  return (await selfContainedBundle(ctx)) !== null;
}

async function bundlingAvailable(): Promise<boolean> {
  try {
    return typeof (await import("tsdown")).build === "function";
  } catch {
    return false;
  }
}

async function exportTree(ctx: Ctx): Promise<{ entry: string; files: string[]; dirs: string[] } | null> {
  if (!ctx.project) return exportSingleTree(ctx);
  const dir = ctx.outDir;
  const product = productRuntimePath();
  try {
    const result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: dir,
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
    for (const d of dirs) copyFileSync(product, join(d, PRODUCT_RUNTIME_FILE));
    const files = walkMjs(dir);
    if (ctx.verbose) console.error(`已编译成 ${result.modules.length} 个模块 + 1 份打平运行时 → ${dir}`);
    return { entry: entry.jsPath, files, dirs: dirs.filter((d) => d !== dir) };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

async function exportSingleTree(ctx: Ctx): Promise<{ entry: string; files: string[]; dirs: string[] } | null> {
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
    return { entry, files, dirs: [] };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

/** export 用的自带运行时文件名（由 `tsdown.product.config.ts` 打成零 import 的单文件）。 */
const PRODUCT_RUNTIME_FILE = "product.mjs";
/** `--pack node` 放在模块树根上的 SEA main 转接文件（入口在子目录时靠它对回 VFS 的挂载根）。 */
const SEA_MAIN_FILE = "sea-main.mjs";

function productRuntimePath(): string {
  const p = seaFile(`dist/${PRODUCT_RUNTIME_FILE}`) ?? join(runtimeDistDir(), PRODUCT_RUNTIME_FILE);
  if (!existsSync(p)) throw new Error(`没有 dist/${PRODUCT_RUNTIME_FILE}（先 pnpm build）：找的是 ${p}`);
  return p;
}

function runtimeDistDir(): string {
  const fromHome = seaFile("dist/runtime.mjs");
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
    console.error(`    ③ 改用 --pack perry（perry 是打进 exe 的那一支）。`);
    return;
  }
  console.error(`${input}:  error  ${cmd} 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），${bin} 是 ${got ?? "不可用"}。`);
  console.error(`  换够新的 node 重跑即可：\n    ${hint} ${process.argv[1] ?? "gds2js"} ${cmd} ${input} -o ${outPath}`);
}

function externalSeaNode(explicit?: string): string | null {
  const wanted = explicit ?? process.env.GDS2JS_NODE_BIN;
  if (wanted) return wanted;
  if (!seaHome()) return process.execPath;
  for (const cand of ["node", "node.exe"]) {
    if (nodeVersionOf(cand) !== null) return cand;
  }
  return null;
}

function perryBin(): string {
  if (process.env.PERRY_BIN) return process.env.PERRY_BIN;
  const embedded = seaPerryExe();
  if (embedded) return embedded;
  if (process.platform === "win32" && process.arch === "x64") {
    try {
      return createRequire(import.meta.url).resolve("@perryts/perry-win32-x64/bin/perry.exe");
    } catch {
    }
  }
  return "perry";
}

function perryGc(): { value: string; defaulted: boolean } {
  const v = process.env.PERRY_RS4GC;
  if (v !== undefined && v !== "") return { value: v, defaulted: false };
  return { value: "0", defaulted: true };
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

type ExportVerdict = "refused" | "no-lib" | "crash" | "failed";
function exportVerdict(v: ExportVerdict, note: string): void {
  console.error(`gds2js-export[${v}] ${note}`);
}

/**
 * perry 失败时把它自己的原话翻成可行动的补救。
 * 匹配的是 perry 的原文，它改了句子这里就不响 —— 宁可多印一句原文也别猜。
 * 分类结论只走 `exportVerdict`，tools/export-check.ts 认那一行。
 */
function perryWall(why: string, status: number | null | undefined, exe: string): { v: ExportVerdict; advice: string } | null {
  if (/Could not find perry_runtime\.lib/.test(why)) {
    return {
      v: "no-lib",
      advice:
        "perry 找不到链接用的 perry_runtime.lib。正常情况下本 CLI 会把 npm 包里那颗 zst 压的\n" +
        "  运行时解到临时目录再 `PERRY_RUNTIME_DIR` 指过去（perry 自己不解 zst，实测过）—— 走到这条\n" +
        "  说明没拿到那颗 zst：多半是 PERRY_BIN 指到了别处的 perry，或上游改了包里的 lib 形状。\n" +
        "  补法：`pnpm add -D @perryts/perry-win32-x64`，或把 PERRY_RUNTIME_DIR 直接指到一个放着\n" +
        "  perry_runtime.lib 的目录。",
    };
  }
  const unresolved = why.match(/(?:unresolved external symbol|无法解析的外部符号)[^\n\r]*/g);
  if (/LNK(1120|2019)/.test(why)) {
    return {
      v: "refused",
      advice:
        `perry 链接期有未解析符号（LNK2019/1120）：\n${(unresolved ?? []).slice(0, 8).map((s) => "  " + s.trim()).join("\n")}\n` +
        "  这一支编不了这份产物 —— 别拿一个缺符号的 exe 出货。",
    };
  }
  if (/Linking failed|Illegal byte sequence|could not locate/.test(why) && /[^\x20-\x7e]/.test(exe)) {
    return {
      v: "refused",
      advice:
        `perry 没能写出 ${exe}，原因是这个 -o 路径含非 ASCII 字符。\n` +
        "  实测它会把路径按错代码页处理：要么链接期就失败，要么把一个**乱码文件名**写到同目录去。\n" +
        "  出路：换个 ASCII 的 -o（源文件与工程目录里带中文都没关系，实测正常出货）。\n" +
        "  同目录里如果多了个对不上号的 .exe，那是 perry 这次写歪的产物，可以删。",
    };
  }
  if (/Linking failed/.test(why)) {
    return {
      v: "refused",
      advice:
        "perry 链接失败（它只吐一句 \"Linking failed\"，且实测**退出码可能还是 0**）。\n" +
        "  已知两种成因：① 拿不到 perry_runtime.lib（本 CLI 会自动解压包里那颗 zst，见 src/perry.ts；\n" +
        "  被 PERRY_BIN 指到别处时请用 PERRY_RUNTIME_DIR 也指过去）；② -o 路径含非 ASCII 字符。\n" +
        "  先换 ASCII 的 -o 试一次，再 `perry doctor` 看运行时库。",
    };
  }
  if (/PERRY_RS4GC|WinEH funclet|catchpad/.test(why)) {
    return {
      v: "refused",
      advice:
        "perry 默认的 GC 模式（RS4GC）在 Windows 上不肯编译含 try/catch 的模块 —— 它明说\n" +
        "  LLVM 的 rewrite-statepoints-for-gc 不支持 MSVC funclet EH，硬上会访问违例（上游 #7354）。\n" +
        "  我们的运行时浑身是 try/catch，所以这条必然撞上 —— 本 CLI 因此**默认**就传 `PERRY_RS4GC=0`；\n" +
        "  走到这条说明你把 PERRY_RS4GC 显式设成了别的值。语义拿 `pnpm test:perry` 逐字节对 golden。",
    };
  }
  if (status === 3221225477 || status === -1073741819) {
    return {
      v: "crash",
      advice:
        "perry 在 LLVM 里访问违例（0xC0000005）—— 这就是它预告过的 RS4GC + Windows try/catch 那一类（上游 #7354）。\n" +
        "  本 CLI 的默认是 `PERRY_RS4GC=0`（实测那样能出货：走完 codegen 再链接，产物 20 MB 级，\n" +
        "  输出与 node 那份逐字节相同）；走到这条说明你把 PERRY_RS4GC 显式设成了别的值，想要 perry 原始语义就带着它重跑。",
    };
  }
  return null;
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
  const perry = pack === "perry" ? preflightPerry() : null;
  if (pack === "perry" && !perry) return false;

  const tree = await exportTree(ctx);
  if (!tree) return false;
  const exe = ctx.outPath;
  const cfg = join(ctx.outDir, "sea-config.json");
  const shim = join(ctx.outDir, SEA_MAIN_FILE);
  let made = false;
  let note = "";
  try {
    if (pack === "node") {
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
        const why = r.error?.message ?? diagText(r);
        console.error(`${ctx.input}:  error  --build-sea 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        exportVerdict("failed", "node SEA 没能出货（原因未归类，原文见上）");
      }
    } else {
      const bin = perry?.bin ?? "perry";
      const args = ["compile", tree.entry, "-o", exe];
      const rtDir = process.env.PERRY_RUNTIME_DIR ? null : perryRuntimeDir(bin);
      const gc = perryGc();
      note = `${perry?.version || "perry"}，GC PERRY_RS4GC=${gc.value}${gc.defaulted ? "（默认）" : "（你显式设的）"}`;
      if (ctx.verbose) {
        if (rtDir) console.error(`  perry 运行时（包里的 zst 解压来）：${rtDir}`);
        console.error(`  ${bin} ${args.join(" ")}`);
      }
      const r = spawnSync(bin, args, {
        encoding: "utf8",
        windowsHide: true,
        timeout: 1_500_000,
        env: { ...process.env, ...(rtDir ? { PERRY_RUNTIME_DIR: rtDir } : {}), PERRY_RS4GC: gc.value },
      });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText(r);
        console.error(`${ctx.input}:  error  perry 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        const wall = perryWall(why, r.status, exe);
        if (wall) {
          exportVerdict(wall.v, "perry 没能出货");
          console.error(wall.advice);
        } else exportVerdict("failed", "perry 没能出货（原因未归类，原文见上）");
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

async function runProject(ctx: Ctx): Promise<boolean> {
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
  setInterval(() => {}, 1 << 30);
}

const program = new Command("gds2js")
  .description("GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）")
  .showHelpAfterError();

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
  return {
    cmd,
    input,
    outPath: resolve(
      (opts.out as string) ??
        (cmd === "export"
          ? join(dirname(input), basename(input).replace(/\.gd$/i, "")) + (process.platform === "win32" ? ".exe" : "")
          : input.replace(/\.gd$/i, ".mts")),
    ),
    resRoot,
    project: isProject,
    outDir: isProject
      ? resolve(cmd === "export" ? join(resRoot, ".gds2js-export") : ((opts.out as string) ?? join(resRoot, ".gds2js")))
      : cmd === "export"
        ? resolve(join(dirname(input), ".gds2js-export"))
        : "",
    runtimeImport: (opts.runtime as string) ?? "gds2js/runtime",
    hostImport: hostOf(opts.host as string | boolean | undefined),
    runtimeMode: ((opts.runtimeMode as string) ?? "import") as RuntimeMode,
    run: opts.run !== false,
    sourcemap: opts.sourcemap === true,
    watch: opts.watch === true,
    keep: opts.keep === true,
    pack: cmd === "export" ? packOf(opts.pack) : "node",
    seaNode: cmd === "export" ? externalSeaNode(opts.node as string | undefined) : process.execPath,
    keepBundle: opts.keepBundle === true,
    verbose: opts.verbose === true,
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

program
  .command("export <entry>")
  .description("把入口（整工程或单个脚本）编译成模块树，再用 node SEA / perry 打成 **Windows** 原生可执行文件")
  .option("--pack <name>", "打包器：node(默认，官方 SEA，要 Node>=25.7) | perry（外部原生编译器，PERRY_BIN 可指路）", "node")
  .option("--node <path>", "--pack node 时用哪份**外部** node 做 --build-sea（需 ≥25.7）；默认取 GDS2JS_NODE_BIN 否则当前 node，exe 里则从 PATH 找")
  .option("--res-root <dir>", "res:// 工程根（默认向上找 project.godot）")
  .option("-o, --out <file>", "可执行文件输出路径（默认与入口同名，带 .exe）")
  .option("--keep-bundle", "留下中间产物（排查用），默认删")
  .option("-v, --verbose", "打出过程细节：外部编译器完整命令行、工作目录、GC 模式的理由；默认只给结论一行")
  .action((entry: string, opts) => dispatch(resolveCtx("export", entry, opts)));

if (process.argv.slice(2).length === 0) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
