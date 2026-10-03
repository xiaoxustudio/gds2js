/** 构建期由 tools/cli-native.mjs 同名换实现：原生 exe 跑产物要起外部 node 子进程，它自己没有能跑产物的引擎。 */
import { pathToFileURL } from "node:url";

/** 执行一个已落盘的产物模块；失败就抛，调用方负责把 `runtime error` 那一行报出来。 */
export async function runProduct(path: string): Promise<void> {
  await import(pathToFileURL(path).href);
}
