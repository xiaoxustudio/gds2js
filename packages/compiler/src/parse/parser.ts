import type { CsTree } from "./cst";
import { parseSync } from "./descent";

/**
 * 解析入口。签名保持 async 不动 —— 145 个单测、compile/project.ts、tools/compile.ts 与 tools/bench.ts
 * 全在 await 它，而手写解析器是同步的，await 一个非 Promise 不花钱。
 */
export async function parseSource(src: string): Promise<CsTree> {
  return parseSync(src);
}
