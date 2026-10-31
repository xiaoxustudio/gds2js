/** Quaternion 乘法：四元数积按实测五形发，`q * Vector3` 在 float32 结合次序对上之前响亮拒。 */
import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { quaternion } from "@gds2js/runtime/runtime/quaternion";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { ops } from "@gds2js/runtime/runtime/ops";
import { show } from "@gds2js/runtime/runtime/values";

const a = quaternion(0.1, 0.2, 0.3, 0.9);
const b = quaternion(0, 0.7071068, 0, 0.7071068);
const u = quaternion(0, 1, 0, 0);

describe("Quaternion 的 * 那一族", () => {
  it("四元数积非交换，两处实测值逐字对上", () => {
    eq("456", "a * b", show(ops.mul(a, b)), "(-0.141421, 0.777817, 0.282843, 0.494975)");
    eq("456", "b * a", show(ops.mul(b, a)), "(0.282843, 0.777817, 0.141421, 0.494975)");
    eq("456", "b * b 的整数带一位小数", show(ops.mul(b, b)), "(0, 1.0, 0, 0)");
    eq("456", "u * u 是转 360°，引擎给 -1 那一支", show(ops.mul(u, u)), "(0, 0, 0, -1)");
  });

  it("q * Vector3 在式子读出之前响亮拒", () => {
    shouldThrow("456", "b * Vector3(1, 0, 0)", () => ops.mul(b, vector3(1, 0, 0)));
    shouldThrow("456", "a * Vector3(1, 2, 3)", () => ops.mul(a, vector3(1, 2, 3)));
  });
});
