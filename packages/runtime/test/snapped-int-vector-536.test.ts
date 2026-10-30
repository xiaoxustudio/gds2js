/**
 * `snapped()` 的 x 还收 `Vector2i` / `Vector3i`（S536）：引擎 x 列表里含这两型、`lerp` 的 from 列表不含；
 * `sameTypeVectorMath` 此前只认 V2 / V3 / Color，`snapped(Vector2i(…), Vector2i(…))` 这类**合法调用**在运行期
 * 掉进 `num()` 抛 `[not-number]`（引擎给 `(2, 2)` / `(2, 2, 4)`）。补上两分支（只对 `snapped`）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { gSnapped } from "@gds2js/runtime/runtime/builtins";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { GVector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";

const o = (v: object) => V.object(v);

describe("snapped() 收 Vector2i / Vector3i（S536）", () => {
  it("snapped(Vector2i, Vector2i)", () => {
    eq("536", "v2i", show(gSnapped(o(new GVector2i(1, 2)), o(new GVector2i(2, 2)))), "(2, 2)");
  });
  it("snapped(Vector3i, Vector3i)", () => {
    eq("536", "v3i", show(gSnapped(o(new GVector3i(1, 2, 3)), o(new GVector3i(2, 2, 2)))), "(2, 2, 4)");
  });
  it("snapped(Vector2, Vector2) 不变", () => {
    eq("536", "v2", show(gSnapped(o(new GVector2(1, 2)), o(new GVector2(2, 2)))), "(2.0, 2.0)");
  });
  it("snapped(float, float) 不变", () => {
    eq("536", "float", show(gSnapped(V.float(1.5), V.float(1.0))), "2.0");
  });
});
