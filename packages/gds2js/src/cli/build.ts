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
import { errOf, printDiags, projectDiags, STANDALONE_FILE, standalonePath, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";

export async function buildSingle(ctx: Ctx): Promise<boolean> {
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

export async function selfContainedBundle(ctx: Ctx): Promise<string | null> {
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

export async function bundleProjectSingle(ctx: Ctx): Promise<boolean> {
  if (!(await bundlingAvailable())) {
    console.error(`${ctx.input}:  error  这个构建里没带可用的打包器（tsdown），--runtime-mode single 做不了。`);
    console.error("  自包含 exe 用 export 出货：--pack node 或 --pack scriptc 都不需要 single；");
    console.error("  要 single 请在装了 gds2js 的 node 环境里跑：gds2js build-project <entry> --runtime-mode single");
    return false;
  }
  return (await selfContainedBundle(ctx)) !== null;
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
