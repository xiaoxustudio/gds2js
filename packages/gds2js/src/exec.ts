/** 构建期由 tools/cli-native.mjs 同名换实现：原生 exe 跑产物要起外部 node 子进程，它自己没有能跑产物的引擎。 */
import { pathToFileURL } from "node:url";
import { claimRunReporting, releaseRunReporting } from "@gds2js/runtime/runtime/errors";

/** 执行一个已落盘的产物模块；失败就抛，调用方负责把 `runtime error` 那一行报出来。 */
export async function runProduct(path: string): Promise<void> {
  // 产物顶层有一层自兜底（没人报时补一句 runtime error）；这一层是 CLI 在同一个进程里跑它，
  // 报法照旧归 CLI，声明「归我报」让产物原样再抛。
  const prev = claimRunReporting();
  try {
    await import(pathToFileURL(path).href);
  } finally {
    releaseRunReporting(prev);
  }
}
