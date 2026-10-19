/**
 * `snapped()` 的解析期句（S530，`tmp/d6/s530.py` 六十四格 = value 八型 × step 八型字面量）：
 * - value 非法 → **只发 x 那一句** `Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`，
 *   step 不再查（`snapped(true, true)` / `snapped(true, Vector2(1,2))` 引擎只有一句）；
 * - value 是向量、step 型对不上 → `argument 2 should be "Vector2"` 那一句（step 型跟着 value 走）；
 * - 任一位是 Array / Dictionary 字面量 → 引擎整体 **defer 到运行期**，解析期一句都不发；
 * - value/step 合法（int/float/bool 数值位）→ 解析期不发。
 * 落地前 23/64 分歧（value 非法时我们 x+step 两句齐发、或容器情形多发）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  return analyze(lower(await parseSource("extends SceneTree\n\nfunc c():\n\t" + body))).map((d) => d.message).sort();
}

const X = `Invalid argument for "snapped()" function: Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`;
const STEP = `Invalid argument for "snapped()" function: Argument "step" must be "int" or "float".`;
const V2STEP = (k: string): string => `Invalid argument for "snapped()" function: argument 2 should be "Vector2" but is "${k}".`;

const CASES: Array<[string, string, string[]]> = [
  ["value bool", "var r = snapped(true, true)\n", [X]],
  ["value bool + 向量 step", "var r = snapped(true, Vector2(1, 2))\n", [X]],
  ["value Color", "var r = snapped(Color(1, 0, 0), 1)\n", [X]],
  ["value String", 'var r = snapped("a", 1)\n', [X]],
  ["step bool（value 合法）", "var r = snapped(1, true)\n", [STEP]],
  ["step String（value 合法）", 'var r = snapped(1, "a")\n', [STEP]],
  ["向量 value + int step", "var r = snapped(Vector2(1, 2), 1)\n", [V2STEP("int")]],
  ["向量 value + Color step", "var r = snapped(Vector2(1, 2), Color(1, 0, 0))\n", [V2STEP("Color")]],
  ["value Array：defer", "var r = snapped([1], 1)\n", []],
  ["step Array：defer", "var r = snapped(true, [1])\n", []],
  ["value Color + step Array：defer", "var r = snapped(Color(1, 0, 0), [1])\n", []],
  ["合法 int/float", "var r = snapped(1, 1.5)\n", []],
  ["合法 向量/向量", "var r = snapped(Vector2(1, 2), Vector2(1, 2))\n", []],
];

describe("snapped() 解析期句（S530）", () => {
  for (const [label, body, want] of CASES) {
    it(label, async () => {
      eq("530", label, await msgs(body), want);
    });
  }
});
