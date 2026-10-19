/**
 * `abs` / `sign` / `floor` / `ceil` / `round` 的坏型实参：引擎走**运行期**
 * `Error calling utility function "<fn>()": Argument "x" must be "int", "float", "Vector2", "Vector2i",
 * "Vector3", "Vector3i", "Vector4", or "Vector4i".`（S524，`tmp/d6/s520.py` 五支逐字同句；corpus normalize
 * 会把运行期 ERROR 块滤掉，所以这句只能在 runtime 这边钉）。bool 照收、折 0/1（S362）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { abs, gSign, gFloor, gCeil, gRound } from "@gds2js/runtime/runtime/builtins";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GColor } from "@gds2js/runtime/runtime/color";

const MSG = (fn: string): string =>
  `Error calling utility function "${fn}()": Argument "x" must be "int", "float", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", or "Vector4i".`;

const FNS: Array<[string, (v: Variant) => Variant]> = [
  ["abs", (v) => abs(v)],
  ["sign", (v) => gSign(v)],
  ["floor", (v) => gFloor(v)],
  ["ceil", (v) => gCeil(v)],
  ["round", (v) => gRound(v)],
];

describe("数值工具函数坏型实参：运行期抛引擎原文（S524）", () => {
  for (const [fn, call] of FNS) {
    it(`${fn}(Color)：引擎原文`, () => {
      let msg = "";
      try {
        call(V.object(new GColor(1, 0, 0, 1)));
      } catch (e) {
        msg = (e as Error).message;
      }
      eq("524", `${fn}(Color)`, msg, MSG(fn));
    });
    it(`${fn}(数值) 照常收`, () => {
      let threw = false;
      try {
        call(V.float(1.5));
      } catch {
        threw = true;
      }
      eq("524", `${fn}(1.5) 不该抛`, threw, false);
    });
  }
});
