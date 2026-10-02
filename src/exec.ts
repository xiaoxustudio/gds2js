/**
 * 「把产物跑起来」这一格的 seam（#14）。
 *
 * 为什么要 seam：node 那侧 `run` 是在**当前进程**里 `await import(产物路径)`，而计算型 specifier 的
 * `import()` 在静态目标上直接不收（SC1090：模块图是构建期嵌进去的，只认字面量），
 * 加 `--dynamic` 也绕不过这一形。原生构建由 `tools/cli-native.mjs` 生成同名文件，
 * 那一支改成**起子进程**跑产物 —— 反正产物吃的是 node 的 builtin（`src/host-node.ts`），
 * 静态 exe 里本来就没有能跑它的引擎。
 */
import { pathToFileURL } from "node:url";

/** 执行一个已落盘的产物模块；失败就抛，调用方负责把 `runtime error` 那一行报出来。 */
export async function runProduct(path: string): Promise<void> {
  await import(pathToFileURL(path).href);
}
