import { existsSync } from "node:fs";
import { CORPUS } from "../../tools/lib.mjs";

if (!existsSync(CORPUS)) {
  throw new Error(`语料根算错了：${CORPUS}（tools/lib.mjs 的 import.meta.url 没落成真实路径？）`);
}

export * from "../../tools/lib.mjs";
