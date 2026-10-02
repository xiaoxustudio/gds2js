/** 构建期由 tools/cli-native.mjs 同名换实现（复制本文件为 exec.ts）：静态 exe 里没有能跑产物的引擎 ——
 * 产物吃的是 node 的 builtin（runtime 侧的 host-node.ts），所以 `run` 起一个**外部 node 子进程**。
 * 版本要求是产物那边来的：入口是 `.mts`，靠 node 的类型剥离跑（22.18+/23.6+ 默认开）。 */
import { spawnSync } from "node:child_process";
import { claimRunReportingInChild, releaseRunReporting } from "@gds2js/runtime/runtime/errors";

const BIN: string = process.env.GDS2JS_NODE_BIN === undefined || process.env.GDS2JS_NODE_BIN === "" ? "node" : process.env.GDS2JS_NODE_BIN;

/** 纯函数：子进程按「父进程报」的口径只写正文；正文为空（不是产物兜底那条路炸的）就退回退出码。 */
function childReason(stderr: string, status: number | null): string {
  const text = stderr.trim();
  return text === "" ? `产物退出码 ${String(status)}` : text;
}

export async function runProduct(path: string): Promise<void> {
  // 报法还是 CLI 的，但理由得接回来：spawnSync 在 scriptc 上没有 env 这一格（SC2020），
  // 所以走「父环境改写 + 子进程继承」让产物别重复报，stderr 单接管理由转成 CLI 那一行的正文。
  const prev = claimRunReportingInChild();
  const r = spawnSync(BIN, [path], { stdio: ["inherit", "inherit", "pipe"], encoding: "utf8", windowsHide: true });
  releaseRunReporting(prev);
  if (r.error) throw new Error(`起 ${BIN} 失败（产物要 node ≥ 22.18；可以用 GDS2JS_NODE_BIN 指到具体二进制）：${r.error.message}`);
  if (r.status !== 0) throw new Error(childReason(r.stderr, r.status));
}
