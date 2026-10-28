/**
 * 语料面：ir / sema / emit-guards / emit-invariants / parse-reject-golden 五个门要的东西过一道。
 *
 * 直接复用 tools/lib.mjs 而不另抄一份：它与 golden.mjs / compile.ts / 各 bench 共用同一份
 * 口径，抄一份就会漂（尤其 godotOk 的正则、与 listCases 对 000- 探头的排除），
 * 一漂就会让 `sema 229/229` 和 `diff 152/152` 不再指同一件事。
 */
import { existsSync } from "node:fs";
import { CORPUS, caseScript, godotOk, listSingleCases, readGolden } from "../../../../tools/lib.mjs";

/** lib.mjs 的 listCases 对不存在的目录返回空数组 → it.each([]) 注册 0 个测试 → 门报绿。
 *  这是最坏的失败形状，所以算歪时先响亮拒一次。 */
if (!existsSync(CORPUS)) {
  throw new Error(`语料根算错了：${CORPUS}（tools/lib.mjs 的 import.meta.url 没落成真实路径？）`);
}

export { caseScript, godotOk, readGolden };

/** 单文件用例集（排除工程用例与 000- 探头）。 */
export const cases: string[] = listSingleCases();

/**
 * Godot 的报错分两类，只有**静态**那类才是语义分析层该拦的：
 *   - 解析/分析期 `SCRIPT ERROR: Parse Error: …`（栈帧 at: GDScript::reload）—— 不拦就是真漏报；
 *   - 运行期（栈帧 at: _initialize）—— 语义层拦不到也不该拦，改由运行时抛错，归 diff/ops 覆盖。
 * 反过来把「Godot 只在运行期报错」的脚本静态拒了仍算误报。
 */
export function isStaticReject(golden: string): boolean {
  return golden.includes("Parse Error");
}
