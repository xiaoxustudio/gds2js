/** Vector4 的全局工具运行期句子与 max/min 解析期闸门（S586），读数 `tmp/d6/s587.gd` / `s586.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { gIsEqualApprox, gIsZeroApprox, gIsFinite, gMax, gMin } from "@gds2js/runtime/runtime/builtins";
import { vector4New } from "@gds2js/runtime/runtime/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/vector4i";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";
import { gBytesToVar, gVarToBytes } from "@gds2js/runtime/runtime/var-bytes";
import { GBytes, packCtor } from "@gds2js/runtime/runtime/packed";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([V.float(x), V.float(y), V.float(z), V.float(w)]);
const i4 = (x: number, y: number, z: number, w: number): Variant => vector4iNew([I(x), I(y), I(z), I(w)]);
const conv = (fn: string, n: number, src: string) => `Invalid type in utility function "${fn}()". Cannot convert argument ${n} from ${src} to float.`;
const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

describe("Vector4 的 var_to_bytes（S586）", () => {
  it("PackedVector4Array 与 Vector4 字典键逐字节", () => {
    const p = packCtor("vector4", [V.array(GArray.of([v4(1, 2, 3, 4), v4(5, 6, 7, 8)]))]);
    const b = gVarToBytes(p);
    eq("586", "pack bytes", (b.v as GBytes).raw().map((x) => (x as number).toString(16).padStart(2, "0")).join(""), "26000000020000000000803f0000004000004040000080400000a0400000c0400000e04000000041");
    eq("586", "pack roundtrip", show(gBytesToVar(b)), "[(1.0, 2.0, 3.0, 4.0), (5.0, 6.0, 7.0, 8.0)]");
    const d = new GDict();
    d.set(v4(1, 2, 3, 4), I(1));
    const db = gVarToBytes(V.dict(d));
    eq("586", "dict bytes", (db.v as GBytes).raw().map((x) => (x as number).toString(16).padStart(2, "0")).join(""), "1b000000010000000c0000000000803f0000004000004040000080400200000001000000");
    eq("586", "dict roundtrip", show(gBytesToVar(db)), "{ (1.0, 2.0, 3.0, 4.0): 1 }");
  });
  it("Vector4i 值 / 字典键 / 定形数组 / pack 的 hex 与引擎一致（S587）", () => {
    const hex = (v: Variant): string => (gVarToBytes(v).v as GBytes).raw().map((x) => (x as number).toString(16).padStart(2, "0")).join("");
    const a = i4(1, -2, 3, -4);
    eq("587", "V4i 值", hex(a), "0d00000001000000feffffff03000000fcffffff");
    eq("587", "V4i 回读", show(gBytesToVar(gVarToBytes(a))), "(1, -2, 3, -4)");
    const d = new GDict();
    d.set(i4(1, 2, 3, 4), I(1));
    eq("587", "V4i 键", hex(V.dict(d)), "1b000000010000000d000000010000000200000003000000040000000200000001000000");
    const arr = GArray.of([i4(1, 2, 3, 4)]);
    arr.stampElem("Vector4i");
    eq("587", "定形数组", hex(V.array(arr)), "1c0001000d000000010000000d00000001000000020000000300000004000000");
    const p = packCtor("vector4", [V.array(GArray.of([v4(1, 2, 3, 4)]))]);
    eq("587", "pack", hex(p), "26000000010000000000803f000000400000404000008040");
  });
  it("动态 Vector4i 键进 Dictionary[Vector4, …] 会转换（解析期只拒字面量）", () => {
    const d = new GDict();
    d.stampElem("Vector4", "Vector4i");
    d.set(i4(1, 2, 3, 4), i4(1, 2, 3, 4));
    eq("586", "转换", show(V.dict(d)), "{ (1.0, 2.0, 3.0, 4.0): (1, 2, 3, 4) }");
  });
});

describe("Vector4 全局工具的运行期句子（S586）", () => {
  it("谓词与 max/min 逐位引擎句", () => {
    eq("586", "is_equal_approx 1", err(() => gIsEqualApprox(v4(1, 2, 3, 4), v4(1, 2, 3, 4))), conv("is_equal_approx", 1, "Vector4"));
    eq("586", "is_zero_approx", err(() => gIsZeroApprox(v4(1, 2, 3, 4))), conv("is_zero_approx", 1, "Vector4"));
    eq("586", "is_finite", err(() => gIsFinite(v4(1, 2, 3, 4))), conv("is_finite", 1, "Vector4"));
    eq("586", "max", err(() => gMax(v4(1, 2, 3, 4), v4(1, 2, 3, 4))), conv("max", 1, "Vector4"));
    eq("586", "min V4i", err(() => gMin(i4(1, 2, 3, 4), i4(1, 2, 3, 4))), conv("min", 1, "Vector4i"));
  });
});
