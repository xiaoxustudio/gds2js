import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModule } from "@gds2js/compiler/emit";
import { TREE_FACE } from "@gds2js/compiler/tree-face";
import { runtimeTsDir } from "../paths";
import { baseName, closureRoot, errOf, printDiags, projectDiags, tryLoadSingle, type Ctx } from "./ctx";
import { exportVerdict, NO_DIRS, walkMjs, type ExportTree } from "./export-common";

export async function exportTsTree(ctx: Ctx): Promise<ExportTree | null> {
  const rt = runtimeTsDir();
  if (rt === null) {
    console.error("找不到 runtime 的 TS 源码（scriptc 编的是源码图，不是打平的 product.mjs）。");
    console.error("  仓库里跑请用 tsx / pnpm dev；发布态请设 GDS2JS_RUNTIME_SRC 指向含 index.ts 的 runtime 目录。");
    exportVerdict("refused", "没有 runtime 的 TS 源码");
    return null;
  }
  const srcRoot = dirname(rt);
  const hostTs = join(srcRoot, TREE_FACE.repo.host);
  const doubleTs = join(srcRoot, TREE_FACE.repo.sharedDouble);
  if (!existsSync(hostTs) || !existsSync(doubleTs)) {
    console.error(`runtime 源码的邻居缺一格：${existsSync(hostTs) ? doubleTs : hostTs}`);
    exportVerdict("refused", "runtime 源码的邻居不齐");
    return null;
  }
  const dir = ctx.outDir;
  try {
    const doubleDest = join(dir, TREE_FACE.tree.sharedDouble);
    mkdirSync(dirname(doubleDest), { recursive: true });
    copyTreeTs(rt, join(dir, TREE_FACE.tree.runtimeDir));
    copyFileSync(hostTs, join(dir, TREE_FACE.tree.host));
    copyFileSync(doubleTs, doubleDest);
  } catch (e) {
    console.error(`${ctx.input}:  error  铺 runtime 源码失败：${errOf(e)}`);
    return null;
  }
  if (ctx.project) {
    return exportTsProjectTree(ctx, dir, srcRoot);
  }
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return null;
  }
  if (loaded.deps) return exportTsProjectTree(ctx, dir, srcRoot, true);
  if (!printDiags(loaded.diags)) return null;
  const entry = join(dir, basename(ctx.input).replace(/\.gd$/i, "") + ".mts");
  const rtSpec = "./" + TREE_FACE.tree.runtimeDir + "/" + baseName(TREE_FACE.repo.runtimeIndex);
  const hostSpec = "./" + baseName(TREE_FACE.tree.host);
  const zstdHostSpec = "./" + baseName(TREE_FACE.tree.zstdHost);
  try {
    let code = emitModule(loaded.ir, { runtimeImport: rtSpec, hostImport: hostSpec, autoRun: ctx.run }, loaded.analysis);
    const useZstd = loaded.ir.usesPackCodec;
    if (useZstd) {
      if (!copyZstdHost(dir, srcRoot)) return null;
      code = emitModule(loaded.ir, { runtimeImport: rtSpec, hostImport: zstdHostSpec, autoRun: ctx.run }, loaded.analysis);
    }
    writeFileSync(entry, code, "utf8");
    if (ctx.verbose) console.error(`已编译成单文件 + runtime TS 源码（${rt}）→ ${dir}`);
    return { entry, files: walkMjs(dir), dirs: NO_DIRS, dynamic: useZstd };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

export async function exportTsProjectTree(
  ctx: Ctx,
  dir: string,
  srcRoot: string,
  closureOnly = false,
): Promise<ExportTree | null> {
  const resRoot = closureOnly ? closureRoot(ctx) : ctx.resRoot;
  try {
    const compile = (hostImport: string | null, hostFile: string) =>
      compileProject({
        entries: [ctx.input],
        resRoot,
        outDir: dir,
        runtimeRoot: dir,
        runtimeImport: "./" + TREE_FACE.tree.runtimeDir + "/" + baseName(TREE_FACE.repo.runtimeIndex),
        hostImport,
        hostFile,
        autoRun: ctx.run ? undefined : false,
        closureOnly,
      });
    let result = await compile(ctx.hostImport === null ? null : "./" + baseName(TREE_FACE.tree.host), baseName(TREE_FACE.tree.host));
    if (!printDiags(projectDiags(result, resRoot))) return null;
    const useZstd = ctx.hostImport !== null && result.modules.some((m) => m.usesPackCodec);
    if (useZstd) {
      result = await compile("./" + baseName(TREE_FACE.tree.zstdHost), baseName(TREE_FACE.tree.zstdHost));
      if (!printDiags(projectDiags(result, resRoot))) return null;
      if (!copyZstdHost(dir, srcRoot)) return null;
    }
    for (const m of result.modules) {
      mkdirSync(dirname(m.jsPath), { recursive: true });
      writeFileSync(m.jsPath, m.code, "utf8");
    }
    const wantRes = "res://" + relative(resRoot, ctx.input).split("\\").join("/");
    const entry = result.modules.find((m) => m.resPath === wantRes) ?? result.modules[0];
    if (!entry) {
      console.error(`${ctx.input}: 无可编译模块`);
      return null;
    }
    if (ctx.verbose) console.error(`已编译成 ${result.modules.length} 个模块 + 1 份 runtime 源码 → ${dir}`);
    return { entry: entry.jsPath, files: walkMjs(dir), dirs: NO_DIRS, dynamic: useZstd };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}
export function copyTreeTs(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTreeTs(a, b);
    else if(/\.ts$/.test(e.name)) copyFileSync(a, b);
  }
}

export function copyTreeAll(from: string, to: string): void {
  if (!statSync(from).isDirectory()) {
    copyFileSync(from, to);
    return;
  }
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTreeAll(a, b);
    else copyFileSync(a, b);
  }
}

export function copyZstdHost(dir: string, srcRoot: string): boolean {
  const vendor = join(srcRoot, TREE_FACE.repo.vendorDir);
  const hostVariant = join(srcRoot, TREE_FACE.repo.zstdHost);
  const declare = join(srcRoot, TREE_FACE.repo.zstdDts);
  const driver = TREE_FACE.tree.zstdPackages[0];
  const codec = TREE_FACE.tree.zstdPackages[1];
  if (!existsSync(hostVariant) || !existsSync(declare) || !existsSync(join(vendor, driver)) || !existsSync(join(vendor, codec))) {
    console.error(`找不到 zstd 宿主变体或驱动包（见 tree-face 清单：${TREE_FACE.repo.runtimeSrcRoot} 下的 zstdHost / zstdDts / vendor/…）。`);
    exportVerdict("refused", "缺 zstd 宿主/驱动");
    return false;
  }
  try {
    copyTreeAll(hostVariant, join(dir, TREE_FACE.tree.zstdHost));
    copyTreeAll(declare, join(dir, TREE_FACE.tree.zstdDts));
    copyTreeAll(join(vendor, driver), join(dir, "node_modules", driver));
    copyTreeAll(join(vendor, codec), join(dir, "node_modules", codec));
  } catch (e) {
    console.error(`${dir}:  error  铺 zstd 宿主/驱动失败：${errOf(e)}`);
    return false;
  }
  return true;
}
