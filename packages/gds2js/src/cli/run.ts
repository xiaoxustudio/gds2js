import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModule } from "@gds2js/compiler/emit";
import { bundleModule, bundlingAvailable } from "../bundle";
import { runProduct } from "../exec";
import { closureResPath, closureRoot, compileClosure, errOf, printDiags, projectDiags, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";
import { emitOptsFor } from "./build";

export const RUN_TMP = ".gds2js-run-";

let runSeq = 0;
const runTag = (): string => `${RUN_TMP}${process.pid}-${++runSeq}`;

export async function runSingle(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode === "local") {
    console.error(`${ctx.input}:  error  run 不支持 --runtime-mode local（会往源目录旁挂 standalone；要旁挂请先 build）`);
    return false;
  }
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (loaded.deps) return runClosure(ctx);
  if (!printDiags(loaded.diags)) return false;

  const tmpPath = join(dirname(ctx.input), `${runTag()}.mts`);
  try {
    writeFileSync(tmpPath, emitModule(loaded.ir, { ...emitOptsFor({ ...ctx, run: true }, tmpPath), sourceFile: ctx.input }, loaded.analysis), "utf8");
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

async function runClosure(ctx: Ctx): Promise<boolean> {
  const root = closureRoot(ctx);
  const outDir = join(root, runTag());
  let result: CompileResult;
  try {
    result = await compileClosure(ctx, outDir, undefined);
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  if (!printDiags(projectDiags(result, root))) {
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }
  const entry = result.modules.find((m) => m.resPath === closureResPath(ctx));
  if (!entry) {
    console.error(`${ctx.input}: 闭包里没有入口模块`);
    rmSync(outDir, { recursive: true, force: true });
    return false;
  }
  let product = entry.jsPath;
  if (ctx.runtimeMode === "single") {
    if (!(await bundlingAvailable())) {
      console.error(`${ctx.input}:  error  这个构建里没带可用的打包器（tsdown），--runtime-mode single 做不了。`);
      rmSync(outDir, { recursive: true, force: true });
      return false;
    }
    try {
      await bundleModule(entry.jsPath, join(outDir, "bundle"), true);
      const single = join(outDir, "bundle", basename(entry.jsPath).replace(/\.mts$/, ".mjs"));
      if (!existsSync(single)) throw new Error(`没产出单文件：${single}`);
      product = single;
    } catch (e) {
      console.error(`${ctx.input}:  error  打包闭包单文件失败：${errOf(e)}`);
      rmSync(outDir, { recursive: true, force: true });
      return false;
    }
  }
  try {
    await runProduct(product);
    return true;
  } catch (e) {
    console.error(`${ctx.input}:  runtime error  ${errOf(e)}`);
    return false;
  } finally {
    if (!ctx.keep) {
      rmSync(outDir, { recursive: true, force: true });
    } else {
      console.error(`${outDir}: 已生成并保留（--keep）`);
    }
  }
}

export const BUNDLE_FROM_MODULES = 100;

export async function shouldBundle(modules: number): Promise<boolean> {
  if (modules < BUNDLE_FROM_MODULES) return false;
  if (process.env.GDS2JS_RUN_BUNDLE === "0") return false;
  return bundlingAvailable();
}

export async function runProject(ctx: Ctx): Promise<boolean> {
  if (ctx.runtimeMode !== "import") {
    console.error(`${ctx.input}:  error  run-project 只支持 --runtime-mode import（local/single 请先 build-project 再 node 产物）`);
    return false;
  }
  const outDir = join(ctx.resRoot, runTag());
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
  let product = entry.jsPath;
  if (await shouldBundle(result.modules.length)) {
    const bundleDir = join(outDir, "bundle");
    try {
      await bundleModule(entry.jsPath, bundleDir, true);
      const single = join(bundleDir, basename(entry.jsPath).replace(/\.mts$/, ".mjs"));
      if (existsSync(single)) product = single;
    } catch {
    }
  }
  try {
    await runProduct(product);
    return true;
  } catch (e) {
    console.error(`${ctx.input}:  runtime error  ${errOf(e)}`);
    return false;
  } finally {
    if (!ctx.keep) rmSync(outDir, { recursive: true, force: true });
    else console.error(`${outDir}: 产物已保留（--keep）`);
  }
}
