/** 编译器侧的路径候选链都在这里 —— 每条注明服务的场景，调用方不再各写一份。 */
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { selfFile } from "./home";

/** gdscript.wasm 的候选链（相对 `import.meta.url`，产物形态不同、放置位置也不同）。每跳服务的场景：
 *  - `../../../../`：仓库里 `packages/compiler/src/parse/` 出发 → 仓库根的 gdscript.wasm（`pnpm gen:ws` 的落点）；
 *  - `../../../`：少一层的嵌套（根 src|dist 时代的形态）；
 *  - `../../`、`../`：被打平到一两层的中间树；
 *  - `./`：npm 安装态与 dist —— wasm 与产物同目录（构建期拷进 dist）。
 */
export const WASM_CANDIDATES = ["../../../../gdscript.wasm", "../../../gdscript.wasm", "../../gdscript.wasm", "../gdscript.wasm", "./gdscript.wasm"];

/** 找 gdscript.wasm：先问自带家目录，再按候选链试。`base` 传调用模块的 `import.meta.url`。 */
export function resolveWasm(base: string): string {
  const fromHome = selfFile("gdscript.wasm");
  if (fromHome) return fromHome;
  for (const spec of WASM_CANDIDATES) {
    const p = fileURLToPath(new URL(spec, base));
    if (existsSync(p)) return p;
  }
  throw new Error(`找不到 gdscript.wasm（试过 ${WASM_CANDIDATES.join(" , ")}，基于 ${base}）`);
}
