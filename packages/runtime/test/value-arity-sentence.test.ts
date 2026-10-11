/** 值类型方法少给/多给实参时的**运行期**那一句（S305）：接收者解不出静态形（`Variant` 标注、未定形 Array 的元素）时，
 *  引擎不在解析期拦，而是运行期给 `Invalid call to function 'X' in base 'T'. Expected N argument(s).`
 *  （读数 `tmp/probe-value-arity/rt.mts` 十二格 + `n.mts` 四格）。
 *  N 取的是**声明的形参数**：带默认实参那一族少给也报上界 —— 实测 `a[2].from_hsv(0)` 给 4 而不是 3。 */
import { afterAll, describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { colorNew } from "@gds2js/runtime/runtime/color";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector2i } from "@gds2js/runtime/runtime/vector2i";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { vector3i } from "@gds2js/runtime/runtime/vector3i";
import type { Variant } from "@gds2js/runtime/runtime/tags";
import { V } from "@gds2js/runtime/runtime/tags";

const errOf = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

const CELLS: Array<[string, () => Variant, string, number, Variant[]]> = [
  ["Vector2.angle_to 少给", () => vector2(1, 2), "angle_to", 1, []],
  ["Vector2.abs 多给（0 元）", () => vector2(1, 2), "abs", 0, [V.float(1)]],
  ["Vector2.rotated 多给", () => vector2(1, 2), "rotated", 1, [V.float(1), V.float(1)]],
  ["Vector2.limit_length 多给（0..1 报上界）", () => vector2(3, 4), "limit_length", 1, [V.float(1), V.float(1)]],
  ["Vector2.move_toward 少给", () => vector2(1, 2), "move_toward", 2, [vector2(1, 2)]],
  ["Vector2i.snapped 多给", () => vector2i(3, 4), "snapped", 1, [vector2i(1, 1), vector2i(2, 2)]],
  ["Vector2i.min 少给", () => vector2i(3, 4), "min", 1, []],
  ["Vector3.distance_to 少给", () => vector3(1, 2, 3), "distance_to", 1, []],
  ["Vector3.limit_length 多给", () => vector3(1, 2, 3), "limit_length", 1, [V.float(1), V.float(1)]],
  ["Vector3.slerp 少给", () => vector3(1, 2, 3), "slerp", 2, [vector3(0, 1, 0)]],
  ["Vector3i.min 少给", () => vector3i(1, 2, 3), "min", 1, []],
  ["Color.lerp 少给", () => colorNew([]), "lerp", 2, []],
  ["Color.lightened 少给", () => colorNew([]), "lightened", 1, []],
  ["Color.to_html 多给（0..1 报上界）", () => colorNew([]), "to_html", 1, [V.bool(true), V.bool(true)]],
];

describe("runtime/value · 元数不对时给引擎那一句", () => {
  for (const [what, recv, name, n, args] of CELLS) {
    it(what, async () => {
      const base = what.slice(0, what.indexOf("."));
      eq("305", what, errOf(() => method(recv(), name, args)),
        `Invalid call to function '${name}' in base '${base}'. Expected ${String(n)} argument(s).`);
    });
  }

  afterAll(() => {
    console.log(`\n运行期元数句：${String(CELLS.length)} 格`);
  });
});
