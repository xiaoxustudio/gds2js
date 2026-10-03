import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { bundleModule, bundlingAvailable } from "../bundle";
import { runProduct } from "../exec";
import { errOf, printDiags, projectDiags, tryLoadSingle, type CompileResult, type Ctx } from "./ctx";
import { emitOptsFor } from "./build";

/** 临时产物的名字前缀（跑完即删；留着是给 --keep 看生成代码用的）。 */
export const RUN_TMP = ".gds2js-run-";

// `--watch` 是在同一个进程里重跑命令的，而 Node 按解析后的 URL 缓存 ES 模块 ——
// 名字只带 pid 的话第二次 import 拿到的是缓存模块，脚本**不会再执行**（实测只多一行「重新运行」）。
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
  if (!printDiags(loaded.diags)) return false;

  const tmpPath = join(dirname(ctx.input), `${runTag()}.mts`);
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

// 实测的交叉点（同一 600 模块工程，import 模式 vs 打单文件再跑）：50 模块打包**亏** 170 ms，
// 100 省 118 ms、200 省 421 ms、400 省 1014 ms —— 小工程不值得为 tsdown 的固定启动钱付账。
export const BUNDLE_FROM_MODULES = 100;

/** `run-project` 要不要走单文件产物（`GDS2JS_RUN_BUNDLE=0` 留一条能配对复测的退路）。 */
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
  // 大工程逐份装载产物太贵（实测每份 .mts ~1.5 ms，600 份就是 888 ms，而同一张图打成
  // 单文件装载只要 95 ms）：过了交叉点就先 bundle 再跑，语义同一张模块图，输出实测一字一样。
  let product = entry.jsPath;
  if (await shouldBundle(result.modules.length)) {
    const bundleDir = join(outDir, "bundle");
    try {
      await bundleModule(entry.jsPath, bundleDir, true);
      const single = join(bundleDir, basename(entry.jsPath).replace(/\.mts$/, ".mjs"));
      if (existsSync(single)) product = single;
    } catch {
      // 打包器抽风就照旧逐份装载 —— 慢一点，但结果与今天一样
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
