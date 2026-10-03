import { compileProject } from "@gds2js/compiler/compile/project";
import { errOf, printDiags, projectDiags, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";

export async function checkSingle(ctx: Ctx): Promise<boolean> {
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return false;
  }
  if (!printDiags(loaded.diags)) return false;
  console.error(`${ctx.input}: 静态检查通过`);
  return true;
}

export async function checkProject(ctx: Ctx): Promise<boolean> {
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

