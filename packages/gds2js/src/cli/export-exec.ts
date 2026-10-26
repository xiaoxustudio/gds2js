import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { compileProject } from "@gds2js/compiler/compile/project";
import { selfHome } from "@gds2js/compiler/home";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { PRODUCT_RUNTIME_FILE, productRuntimePath, scriptcCandidates } from "../paths";
import { closureRoot, errOf, printDiags, projectDiags, tryLoadSingle, type Ctx } from "./ctx";
import { exportTsTree } from "./export-ts-tree";
import { exportVerdict, NO_DIRS, walkMjs, type ExportTree, type ExportVerdict } from "./export-common";

export async function exportTree(ctx: Ctx, closureOnly = false): Promise<ExportTree | null> {
  if (!ctx.project && !closureOnly) return exportSingleTree(ctx);
  const dir = ctx.outDir;
  const resRoot = closureOnly ? closureRoot(ctx) : ctx.resRoot;
  const product = productRuntimePath();
  try {
    mkdirSync(dir, { recursive: true });
    const result = await compileProject({
      entries: [ctx.input],
      resRoot,
      outDir: dir,
      runtimeRoot: dir,
      runtimeFile: PRODUCT_RUNTIME_FILE,
      hostFile: PRODUCT_RUNTIME_FILE,
      runtimeImport: "./" + PRODUCT_RUNTIME_FILE,
      hostImport: ctx.hostImport === null ? null : "./" + PRODUCT_RUNTIME_FILE,
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
      console.error(`${ctx.input}: 无可编译模块`);
      return null;
    }
    const dirs = [...new Set(result.modules.map((m) => dirname(m.jsPath)))];
    copyFileSync(product, join(dir, PRODUCT_RUNTIME_FILE));
    const files = walkMjs(dir);
    if (ctx.verbose) console.error(`已编译成 ${result.modules.length} 个模块 + 1 份打平运行时 → ${dir}`);
    return { entry: entry.jsPath, files, dirs: dirs.filter((d) => d !== dir) };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

export async function exportSingleTree(ctx: Ctx): Promise<ExportTree | null> {
  const dir = ctx.outDir;
  const product = productRuntimePath();
  const loaded = await tryLoadSingle(ctx.input);
  if ("error" in loaded) {
    console.error(loaded.error);
    return null;
  }
  if (loaded.deps) return exportTree(ctx, true);
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
    return { entry, files, dirs: NO_DIRS };
  } catch (e) {
    console.error(`${ctx.input}:  error  ${errOf(e)}`);
    return null;
  }
}

export const SEA_MAIN_FILE = "sea-main.mjs";
export const EXPORT_TREE_DIR = ".gds2js-export";
export function diagText(r: { stdout?: string; stderr?: string; status?: number | null }): string {
  return ((r.stdout ?? "") + (r.stderr ?? "")).trim() || `退出码 ${r.status}`;
}

export function hasHostEntry(code: string): boolean {
  return /_(initialize|process)\s*\(/.test(code);
}

/** 只截前 n 行：外部编译器/LLVM 的报告动辄上百行，别把终端糊死。 */
export function head(text: string, n: number): string {
  return text.split(/\r?\n/).slice(0, n).join("\n");
}

export const SEA_MIN_NODE = "25.7.0";

export function versionAtLeast(v: string, min: string): boolean {
  const a = v.replace(/^v/, "").split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

export function nodeVersionOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  if (r.error || r.status !== 0) return null;
  const out = (r.stdout || "").trim();
  return /^\d+\.\d+\.\d+/.test(out) ? out : null;
}

export function refuseOldSea(cmd: string, input: string, outPath: string, got: string | null, bin: string | null): void {
  const v = bin === null ? null : nodeVersionOf(bin);
  const hint = v !== null && versionAtLeast(v, SEA_MIN_NODE) ? bin : '"<Node >= 25.7>"';
  exportVerdict("refused", bin === null ? "找不到可用的 node" : `node SEA 版本不够（要 >= ${SEA_MIN_NODE}，实测 ${got ?? "不可用"}）`);
  if (bin === null) {
    console.error(`${input}:  error  ${cmd} 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），但这台机器上没找到 node。`);
    console.error(`  自包含 exe 里**不带 node**（用户决定：node 是外部打包器）。三条出路：`);
    console.error(`    ① 装个 Node >= ${SEA_MIN_NODE} 并让它出现在 PATH 上；`);
    console.error(`    ② --node <path> 或 GDS2JS_NODE_BIN=<path> 指过去；`);
    console.error(`    ③ 改用 --pack scriptc（静态编 runtime 源码图，产物里**不带 node**，也不要求够新的 node）。`);
    return;
  }
  console.error(`${input}:  error  ${cmd} 需要 Node >= ${SEA_MIN_NODE}（SEA 的一步式 --build-sea），${bin} 是 ${got ?? "不可用"}。`);
  console.error(`  换够新的 node 重跑即可：\n    ${hint} ${process.argv[1] ?? "gds2js"} ${cmd} ${input} -o ${outPath}`);
}

export function externalSeaNode(explicit: string | null): string | null {
  const wanted = explicit ?? process.env.GDS2JS_NODE_BIN;
  if (wanted) return wanted;
  if (!selfHome()) return process.execPath;
  for (const cand of ["node", "node.exe"]) {
    if (nodeVersionOf(cand) !== null) return cand;
  }
  return null;
}

export function preflightScriptc(): { bin: string; version: string } | null {
  const cands = scriptcCandidates();
  let last = "";
  for (const bin of cands) {
    if (bin !== "scriptc" && !existsSync(bin)) continue;
    const r = spawnSync(bin, ["--version"], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
    if (!r.error && r.status === 0) return { bin, version: (r.stdout || "").trim() };
    last = r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr });
  }
  console.error(`找不到可用的 scriptc（试过的路径见下）：${cands.join(" | ")}`);
  if (last !== "") console.error(`  最后一次调用：${last}`);
  console.error("  三条路：随包放一份 <gds2js 同目录>/scriptc/scriptc.exe；项目里 npm i -D scriptc；或设 SCRIPTC_BIN 指到可执行文件。");
  console.error(`  哪条都不想要就退回 --pack node（只要 Node >= ${SEA_MIN_NODE}，不需要外部编译器）。`);
  exportVerdict("refused", "scriptc 二进制不可用");
  return null;
}

/** 把 scriptc 的失败原文归成一个结论类别，并给一行用户看得懂的话。 */
export function scriptcWall(why: string): { v: ExportVerdict; advice: string } {
  const codes = [...why.matchAll(/error (SC\d+)/g)].map((m) => m[1] as string);
  const n = codes.length;
  const head = `scriptc 没能出货（${n === 0 ? "没有 SC 编号的失败" : `${n} 个错`}）`;
  if (codes.includes("SC9001")) return { v: "crash", advice: `  ${head}：scriptc 内部崩溃（SC9001），原文见上。` };
  if (/overriding the async method/.test(why)) {
    return {
      v: "refused",
      advice: `  ${head}：静态那支不能覆写父脚本的 async 成员（SC1090，scriptc 的 vtable 槽没有起纤程那套）。` +
        `\n  这条继承链用 --pack node，或让子类不复写父类那个 async / 入口方法（复写同步方法不受限）。`,
    };
  }
  if (codes.some((c) => c === "SC2011" || c === "SC2012" || c === "SC2020")) {
    return { v: "no-lib", advice: `  ${head}：有形没有 lowering（SC2011/2012/2020）。改发射形状或登记缺的那格，别指望 --dynamic。` };
  }
  if (codes.some((c) => c === "SC1090" || c === "SC1091" || c === "SC1013" || c === "SC1100" || c === "SC1101" || c === "SC2004")) {
    return { v: "refused", advice: `  ${head}：动态形状（按名取成员 / cast 成函数表 / namespace import）静态不收。见 README 的 --pack 表。` };
  }
  return { v: "failed", advice: `  ${head}（原因未归类，原文见上）` };
}

export async function exportExecutable(ctx: Ctx): Promise<boolean> {
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
  const sc = pack === "scriptc" ? preflightScriptc() : null;
  if (pack === "scriptc" && !sc) return false;
  if (sc !== null && ctx.verbose) console.error(`  scriptc ← ${sc.bin}（${sc.version}）`);

  const tree = pack === "scriptc" ? await exportTsTree(ctx) : await exportTree(ctx);
  if (!tree) return false;
  const exe = ctx.outPath;
  const cfg = join(ctx.outDir, "sea-config.json");
  const shim = join(ctx.outDir, SEA_MAIN_FILE);
  let made = false;
  let note = "";
  try {
    if (pack === "scriptc") {
      const args = ["build", tree.entry, "-o", exe, "--strip"];
      if (tree.dynamic === true) args.push("--dynamic");
      note = `scriptc ${sc?.version ?? ""}`;
      if (ctx.verbose) console.error(`  ${sc?.bin ?? "scriptc"} ${args.join(" ")}`);
      const r = spawnSync(sc?.bin ?? "scriptc", args, { encoding: "utf8", windowsHide: true, timeout: 1_500_000 });
      made = !r.error && r.status === 0 && existsSync(exe);
      if (!made) {
        const why = r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr });
        console.error(`${ctx.input}:  error  scriptc 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        const wall = scriptcWall(why);
        exportVerdict(wall.v, "scriptc 没能出货");
        console.error(wall.advice);
      }
    } else if (pack === "node") {
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
        const why = r.error?.message ?? diagText({ status: r.status, stdout: r.stdout, stderr: r.stderr });
        console.error(`${ctx.input}:  error  --build-sea 失败（退出码 ${r.status}）：\n${head(why, 20)}`);
        exportVerdict("failed", "node SEA 没能出货（原因未归类，原文见上）");
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
      if (pack === "scriptc") {
        if (basename(ctx.outDir) === EXPORT_TREE_DIR) rmSync(ctx.outDir, { recursive: true, force: true });
        else if (tree.dynamic === true) rmSync(join(ctx.outDir, "node_modules"), { recursive: true, force: true });
      } else {
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
}
