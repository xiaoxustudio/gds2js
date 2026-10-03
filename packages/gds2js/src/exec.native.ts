/** 构建期由 tools/cli-native.mjs 同名换实现（复制本文件为 exec.ts）：静态 exe 里没有能跑产物的引擎 ——
 * 产物吃的是 node 的 builtin（runtime 侧的 host-node.ts），所以 `run` 起一个**外部 node 子进程**。
 * 版本要求是产物那边来的：入口是 `.mts`，靠 node 的类型剥离跑（22.18+/23.6+ 默认开）。 */
import { spawnSync } from "node:child_process";

const BIN: string = process.env.GDS2JS_NODE_BIN === undefined || process.env.GDS2JS_NODE_BIN === "" ? "node" : process.env.GDS2JS_NODE_BIN;

export async function runProduct(path: string): Promise<void> {
  const r = spawnSync(BIN, [path], { stdio: "inherit", windowsHide: true });
  if (r.error) throw new Error(`起 ${BIN} 失败（产物要 node ≥ 22.18；可以用 GDS2JS_NODE_BIN 指到具体二进制）：${r.error.message}`);
  if (r.status !== 0) throw new Error(`产物退出码 ${String(r.status)}`);
}
