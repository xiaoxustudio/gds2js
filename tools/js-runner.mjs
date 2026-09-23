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
import { existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { CORPUS } from "./lib.mjs";

export default async function runCase(id) {
  const driver = join(CORPUS, id, "main.mts");
  if (!existsSync(driver)) return null;

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
