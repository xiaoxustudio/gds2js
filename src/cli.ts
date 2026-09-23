#!/usr/bin/env node
/**
 * gds2js CLI —— GDScript 4.x → JavaScript AOT 编译器。
 *
 *   gds2js check <file.gd>                     静态检查（解析 / lowering / 语义分析）
 *   gds2js build <file.gd> [-o out]            编译单个文件成 ESM 模块
 *   gds2js check-project <entry.gd>            跨文件静态检查（编译作用域内全部 .gd）
 *   gds2js build-project <entry.gd> [-o dir]   跨文件编译整个工程（class_name / extends / is）
 *
 * 产出的模块 export 一个脚本类，import "gds2js/runtime"（语言运行时）和
 * "gds2js/host"（宿主桩）。怎么驱动生命周期由使用方决定。
 *
 * 参数解析用 commander；下面的构建/检查动作被写成可重跑的纯函数，watch 模式复用同一套。
 */
import { mkdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { Command } from "commander";
import { compileProject } from "./compile/project";
import { emitModule, emitModuleWithMap } from "./emit/emitter";
import type { RawSourceMap } from "./emit/sourcemap";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { UnsupportedError } from "./runtime/errors";

type CmdName = "check" | "build" | "check-project" | "build-project";

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
  sourcemap: boolean;
  watch: boolean;
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

/** 从入口向上找含 project.godot 的目录作为 res:// 根，找不到就用入口所在目录。 */
function findResRoot(entryAbs: string): string {
  let dir = dirname(entryAbs);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      readFileSync(join(dir, "project.godot"), "utf8");
      return dir;
    } catch {
      const parent = dirname(dir);
      if (parent === dir) return dirname(entryAbs);
      dir = parent;
    }
  }
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
    const result = ctx.sourcemap
      ? emitModuleWithMap(loaded.ir, {
          runtimeImport: ctx.runtimeImport,
          hostImport: ctx.hostImport,
          autoRun: false,
          sourcemap: true,
          sourceFile: ctx.input,
          jsFile: basename(ctx.outPath),
        })
      : { code: emitModule(loaded.ir, { runtimeImport: ctx.runtimeImport, hostImport: ctx.hostImport, autoRun: false }), map: null };
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

async function buildProject(ctx: Ctx): Promise<boolean> {
  let result;
  try {
    result = await compileProject({
      entries: [ctx.input],
      resRoot: ctx.resRoot,
      outDir: ctx.outDir,
      runtimeImport: ctx.runtimeImport,
      hostImport: ctx.hostImport,
      autoRun: false,
      sourcemap: ctx.sourcemap,
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

// ---------------------------------------------------------------- 运行 + watch 循环

const RUNNERS: Record<CmdName, (ctx: Ctx) => Promise<boolean>> = {
  check: checkSingle,
  build: buildSingle,
  "check-project": checkProject,
  "build-project": buildProject,
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
  const isProject = cmd === "check-project" || cmd === "build-project";
  const resRoot = isProject ? resolve((opts.resRoot as string) ?? findResRoot(input)) : "";
  return {
    cmd,
    input,
    outPath: resolve((opts.out as string) ?? input.replace(/\.gd$/i, ".mjs")),
    resRoot,
    outDir: isProject ? resolve((opts.out as string) ?? join(resRoot, ".gds2js")) : "",
    runtimeImport: (opts.runtime as string) ?? "gds2js/runtime",
    hostImport: hostOf(opts.host as string | boolean | undefined),
    sourcemap: opts.sourcemap === true,
    watch: opts.watch === true,
  };
};

withCommon(
  program.command("check <file>").description("静态检查（解析 / lowering / 语义分析）"),
).action((file: string, opts) => dispatch(resolveCtx("check", file, opts)));

withCommon(
  program
    .command("build <file>")
    .description("编译单个文件成 ESM 模块")
    .option("-o, --out <path>", "输出文件（默认与源同名 .mjs）")
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
    .option("--sourcemap", "为每个产物生成行粒度 .map"),
).action((entry: string, opts) => dispatch(resolveCtx("build-project", entry, opts)));

// 无参数时打印帮助（与旧版 usage(0) 一致）；未知子命令由 commander 报错并 exit 1。
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
  process.exit(0);
}

program.parse();
