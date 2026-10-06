/**
 * 在本进程内跑语料产物并捕获它写到 stdout 与 stderr 的字节（golden 那侧就是两路拼起来的）。
 *
 * 1. **逐用例清缓冲**：host.ts 的 `out` 是模块级数组，上个用例若中途抛错，没 flush 的输出
 *    会串到下一个，所以两条路都先 `harness.reset()`（它就是 host.ts `resetOut` 的再导出）。
 *    ⚠ 别「顺手修正」成去重置工程产物那份缓冲：工程产物的 hostImport 是 `gds2js/host`，
 *    解析到 tsdown 打的 dist/host.mjs —— **另一份副本、有自己的 out 数组**，从 src 够不着。
 *    它一直靠产物自己的 flush() 写完即清空才没出事。
 *
 * 2. **import specifier 不带 query string** → 同进程重跑同一用例会命中 ES module cache、
 *    静默产出空输出（= 假绿）。所以 e2e project 钉死 `retry: 0`，所有调用方必须严格串行。
 *
 * 捕获用手工赋值而不是 vi.spyOn：两者实测都能捕到 host 直接写出的字节，但 `mockRestore()`
 * 会连带清空 mock.calls，restore 之后再读就永远是空数组。手工补丁 finally 还原、无隐藏顺序依赖。
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compileProject } from "@gds2js/compiler/compile/project";
// 路径冻结：244 个已提交的 main.gen.mts 里硬编码了 "../../../tools/harness/scene-tree"。
// 它在 import 时调 claimRunReporting()，让产物抛错而不是写 process.exitCode。
import * as harness from "../../tools/harness/scene-tree";
import { caseDir, caseIsProject, CORPUS } from "./lib-bridge";

/** 跑一个用例，返回它写到 stdout 与 stderr 的字节；没有产物可跑就返回 null（= 未实现，不是崩溃）。 */
export default async function runCase(id: string): Promise<string | null> {
  if (caseIsProject(id)) return runProjectCase(id);

  const gen = join(CORPUS, id, "main.gen.mts");
  const hand = join(CORPUS, id, "main.mts");
  const driver = existsSync(gen) ? gen : existsSync(hand) ? hand : null;
  if (driver === null) return null;

  harness.reset?.();
  return captureStdout(() => import(pathToFileURL(driver).href));
}

async function runProjectCase(id: string): Promise<string> {
  const root = caseDir(id);
  const outDir = join(root, ".gen"); // gitignored
  const result = await compileProject({
    entries: [join(root, "main.gd")],
    resRoot: root,
    outDir,
    runtimeImport: "gds2js/runtime",
    hostImport: "gds2js/host",
  });
  if (result.diags.length > 0) {
    throw new Error(`静态检查拦下：${result.diags[0]!.resPath} ${result.diags[0]!.diagnostic.message}`);
  }
  const entry = result.modules.find((m) => m.resPath === "res://main.gd");
  if (entry === undefined) throw new Error("工程用例未产出入口 main.mts");

  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }

  harness.reset?.();
  return captureStdout(() => import(pathToFileURL(entry.jsPath).href));
}

async function captureStdout(fn: () => Promise<unknown>): Promise<string> {
  const out: string[] = [];
  const err: string[] = [];
  const original = process.stdout.write.bind(process.stdout);
  const originalErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = (chunk: unknown) => {
    out.push(String(chunk));
    return true;
  };
  process.stderr.write = (chunk: unknown) => {
    err.push(String(chunk));
    return true;
  };
  try {
    await fn();
  } finally {
    process.stdout.write = original;
    process.stderr.write = originalErr;
  }
  // golden 那侧就是 stdout 拼 stderr（tools/lib.mjs:88），两路各归一路、不比对相互次序。
  return out.join("") + err.join("");
}
