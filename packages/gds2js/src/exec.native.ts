import { spawnSync } from "node:child_process";
import { claimRunReportingInChild, releaseRunReporting } from "@gds2js/runtime/runtime/errors";

const BIN: string = process.env.GDS2JS_NODE_BIN === undefined || process.env.GDS2JS_NODE_BIN === "" ? "node" : process.env.GDS2JS_NODE_BIN;

/** 纯函数：子进程按「父进程报」的口径只写正文；正文为空（不是产物兜底那条路炸的）就退回退出码。 */
function childReason(stderr: string, status: number | null): string {
  const text = stderr.trim();
  return text === "" ? `产物退出码 ${String(status)}` : text;
}

export async function runProduct(path: string): Promise<void> {
  const prev = claimRunReportingInChild();
  const r = spawnSync(BIN, [path], { stdio: ["inherit", "inherit", "pipe"], encoding: "utf8", windowsHide: true });
  releaseRunReporting(prev);
  if (r.error) throw new Error(`起 ${BIN} 失败（产物要 node ≥ 25；可以用 GDS2JS_NODE_BIN 指到具体二进制）：${r.error.message}`);
  if (r.status !== 0) throw new Error(childReason(r.stderr, r.status));
}
