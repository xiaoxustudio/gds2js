/**
 * 语料桥：原样转出口 tools/lib.mjs，只加一道存在性自检。
 * 「不另抄一份」的理由见 packages/compiler/test/support/corpus.ts。
 * ROOT 由 lib.mjs 按**它自己的** import.meta.url 算，与谁 import 无关，
 * 所以从根 test/ 引它也指向仓库根，不需要 resolve.alias。
 */
import { existsSync } from "node:fs";
import { CORPUS } from "../../tools/lib.mjs";

/** listCases 对缺失目录返回空数组 → 0 个测试 → 门假绿。响亮拒一次。 */
if (!existsSync(CORPUS)) {
  throw new Error(`语料根算错了：${CORPUS}（tools/lib.mjs 的 import.meta.url 没落成真实路径？）`);
}

export * from "../../tools/lib.mjs";
