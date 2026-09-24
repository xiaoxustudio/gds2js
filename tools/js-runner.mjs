#!/usr/bin/env node
/**
 * 被测侧运行器：把某个 case 用 gds2js 跑一遍，返回它的输出。
 * 由 tools/diff.mjs 调用；case 没有驱动就返回 null，diff 会诚实记成「未实现」。
 *
 * 注意：驱动是 .mts，所以 **diff 必须跑在 tsx 下**（`pnpm test:diff` 已经是了）。
 * 这里用进程内 import 而不是 spawn —— 本机 spawn node 子进程会 EBUSY
 * （spawn godot 没事，估计是 sandbox 拦了同名可执行文件）。
 *
 * 现状：emitter 还没落地，每个 case 旁边放的是**手写的等价 main.mts**，
 * 用来驱动运行时算子的正确性。emitter 完成后这些手写文件会被编译产物取代，
 * 驱动方式不变。
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { CORPUS, caseDir, caseIsProject } from "./lib.mjs";

export default async function runCase(id) {
  // 多文件工程用例：整个 case 目录就是 res:// 根，跨文件编译后跑入口。
  if (caseIsProject(id)) return runProjectCase(id);

  // 优先跑 emitter 的产物，没有再退回到手写等价驱动
  const gen = join(CORPUS, id, "main.gen.mts");
  const hand = join(CORPUS, id, "main.mts");
  const driver = existsSync(gen) ? gen : existsSync(hand) ? hand : null;
  if (!driver) return null;

  // 跑之前先清缓冲：上一个用例若中途抛错，它没 flush 的输出会串到这一个
  try {
    const harness = await import("../tools/harness/scene-tree");
    harness.reset?.();
  } catch {
    /* 拿不到就跳过，靠 compile 清产物兜底 */
  }

  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    await import(pathToFileURL(driver).href);
  } finally {
    process.stdout.write = original;
  }
  return chunks.join("");
}

/**
 * 编译并运行一个多文件用例。产物写进 `<case>/.gen/`（相对 case 目录，res:// 镜像）。
 * 说明符用 gds2js 自引用包名（本仓有 name+exports，node/tsx 能解析）。
 */
async function runProjectCase(id) {
  const root = caseDir(id);
  const outDir = join(root, ".gen");
  const { compileProject } = await import("../src/compile/project.ts");
  const result = await compileProject({
    entries: [join(root, "main.gd")],
    resRoot: root,
    outDir,
    runtimeImport: "gds2js/runtime",
    hostImport: "gds2js/host",
  });
  if (result.diags.length > 0) {
    throw new Error(`静态检查拦下：${result.diags[0].resPath} ${result.diags[0].diagnostic.message}`);
  }
  const entry = result.modules.find((m) => m.resPath === "res://main.gd");
  if (!entry) throw new Error("工程用例未产出入口 main.mts");

  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }

  try {
    const harness = await import("../src/host.ts");
    harness.resetOut?.();
  } catch {
    /* 忽略 */
  }

  const chunks = [];
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = (chunk) => {
    chunks.push(String(chunk));
    return true;
  };
  try {
    await import(pathToFileURL(entry.jsPath).href);
  } finally {
    process.stdout.write = original;
  }
  return chunks.join("");
}
