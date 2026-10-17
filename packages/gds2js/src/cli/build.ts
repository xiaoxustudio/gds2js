import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModule, emitModuleWithMap } from "@gds2js/compiler/emit/emitter";
import type { RawSourceMap } from "@gds2js/compiler/emit/sourcemap";
import { selfFile } from "@gds2js/compiler/home";
import { bundleModule, bundlingAvailable } from "../bundle";
import { closureResPath, compileClosure, errOf, printDiags, projectDiags, STANDALONE_FILE, standalonePath, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";

export async function buildSingle(ctx: Ctx): Promise<boolean> {
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (loaded.deps) {
    if (ctx.runtimeMode === "single") return buildClosureSingle(ctx);
    return buildClosure(ctx);
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

/** 单文件带依赖：把闭包小树写进 `-o` 所在目录，入口按要的名字落位（S455）。 */
async function buildClosure(ctx: Ctx): Promise<boolean> {
  const root = dirname(ctx.input);
  const outDir = dirname(ctx.outPath);
  const modeOpts: { runtimeMode?: "import" | "local"; standaloneFile?: string } = { runtimeMode: "import" };
  if (ctx.runtimeMode === "local") {
    mkdirSync(outDir, { recursive: true });
    const dest = join(outDir, STANDALONE_FILE);
    copyFileSync(standalonePath(), dest);
    modeOpts.runtimeMode = "local";
    modeOpts.standaloneFile = dest;
  }
  let result: CompileResult;
  try {
    result = await compileClosure(ctx, outDir, ctx.run, modeOpts);
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  }
  if (!printDiags(projectDiags(result, root))) return false;
  let entryPath = "";
  let lines = 0;
  try {
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
      lines += m.code.split("\n").length;
      if (m.resPath === closureResPath(ctx.input)) entryPath = m.jsPath;
    }
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return false;
  }
  if (entryPath === "") {
    console.error(`${ctx.input}: 闭包里没有入口模块`);
    return false;
  }
  if (entryPath !== ctx.outPath) {
    const code = readFileSync(entryPath, "utf8");
    writeFileSync(ctx.outPath, code, "utf8");
    rmSync(entryPath, { force: true });
  }
  console.error(`${ctx.outPath}: 已生成 (${lines} 行，含 ${result.modules.length} 份脚本)`);
  return true;
}

/** `emitModule` 那三个模式共用的选项：刻意是一张声明过的记录，而不是 `Record<string, unknown>` —— 值类型为 `unknown` 的索引记录展开在静态目标上没有形状。 */
export type EmitOpts = {
  runtimeImport: string;
  hostImport: string | null;
  autoRun?: boolean;
  runtimeMode?: "single" | "local";
  standaloneInline?: string;
  standaloneRequirePath?: string;
};

export function emitOptsFor(ctx: Ctx, outPath: string): EmitOpts {
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

export function runtimeFileUrls(): { rt: string; host: string } {
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

export async function selfContainedBundle(ctx: Ctx, closureOnly = false, outDir = ctx.outDir): Promise<string | null> {
  const emit = mkdtempSync(join(tmpdir(), "gds2js-emit-"));
  const resRoot = closureOnly ? dirname(ctx.input) : ctx.resRoot;
  try {
    const { rt, host } = runtimeFileUrls();
    const result = await compileProject({
      entries: [ctx.input],
      resRoot,
      outDir: emit,
      runtimeImport: rt,
      hostImport: ctx.hostImport === null ? null : host,
      autoRun: ctx.run ? undefined : false,
      closureOnly,
    });
    if (!printDiags(projectDiags(result, resRoot))) return null;
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const wantRes = "res://" + relative(resRoot, ctx.input).split("\\").join("/");
    const entry = result.modules.find((m) => m.resPath === wantRes) ?? result.modules[0];
    if (!entry) {
      console.error(`${ctx.input}: 无可打包模块`);
      return null;
    }
    await bundleModule(entry.jsPath, outDir);
    const bundlePath = join(outDir, basename(entry.jsPath).replace(/\.mts$/i, ".mjs"));
    console.error(`已编译并 bundle 成单文件 → ${bundlePath}`);
    return bundlePath;
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  } finally {
    rmSync(emit, { recursive: true, force: true });
  }
}

export async function bundleProjectSingle(ctx: Ctx): Promise<boolean> {
  if (!(await bundlingAvailable())) {
    console.error(`${ctx.input}:  error  这个构建里没带可用的打包器（tsdown），--runtime-mode single 做不了。`);
    console.error("  自包含 exe 用 export 出货：--pack node 或 --pack scriptc 都不需要 single；");
    console.error("  要 single 请在装了 gds2js 的 node 环境里跑：gds2js build-project <entry> --runtime-mode single");
    return false;
  }
  return (await selfContainedBundle(ctx)) !== null;
}

/** 闭包 × single：小树压成一个文件再按 `-o` 的名字落位。压之前先过一遍暂存目录 —— tsdown 的 `clean` 会清掉整个输出目录，不能拿它对着用户的目录跑。 */
async function buildClosureSingle(ctx: Ctx): Promise<boolean> {
  if (!(await bundlingAvailable())) {
    console.error(`${ctx.input}:  error  这个构建里没带可用的打包器（tsdown），--runtime-mode single 做不了。`);
    console.error("  自包含 exe 用 export 出货：--pack node 或 --pack scriptc 都不需要 single；");
    console.error("  要 single 请在装了 gds2js 的 node 环境里跑：gds2js build <entry> --runtime-mode single");
    return false;
  }
  const stage = mkdtempSync(join(tmpdir(), "gds2js-single-"));
  try {
    const bundle = await selfContainedBundle(ctx, true, stage);
    if (bundle === null) return false;
    mkdirSync(dirname(ctx.outPath), { recursive: true });
    copyFileSync(bundle, ctx.outPath);
    console.error(`${ctx.outPath}: 已生成（单文件闭包）`);
    return true;
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}


export async function buildProject(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode === "single") return bundleProjectSingle(ctx);
  let result: CompileResult;
  try {
    // 刻意用一张带可选格的记录，不是「两种形状二选一」：联合记录展开没有 lowering。
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
