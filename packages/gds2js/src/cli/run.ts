import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { runProduct } from "../exec";
import { errOf, printDiags, projectDiags, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";
import { emitOptsFor } from "./build";

/** 临时产物的名字前缀（跑完即删；留着是给 --keep 看生成代码用的）。 */
export const RUN_TMP = ".gds2js-run-";

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

export async function runProject(ctx: Ctx): Promise<boolean> {
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
