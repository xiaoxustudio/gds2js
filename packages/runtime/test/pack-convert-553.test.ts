/** PackedByteArray.to_vector2/3/color_array 与 get_string_from_utf32（S553），读数 `tmp/d6/s553.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));

function capture<T>(f: () => T): { value: T; text: string } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value!: T;
  try {
    value = f();
  } finally {
    process.stderr.write = orig;
  }
  return { value, text: writes.join("").split("\n").slice(0, 2).join("§") };
}

const F1 = [0x00, 0x00, 0x80, 0x3f];
const F2 = [0x00, 0x00, 0x00, 0x40];
const F3 = [0x00, 0x00, 0x40, 0x40];

describe("PackedByteArray 的向量/颜色转换（S553）", () => {
  it("整数倍：逐分量小端 f32", () => {
    eq("553", "to_vector2_array", show(method(pb([...F1, ...F2]), "to_vector2_array", [])), "[(1.0, 2.0)]");
    eq("553", "to_vector3_array", show(method(pb([...F1, ...F2, ...F3]), "to_vector3_array", [])), "[(1.0, 2.0, 3.0)]");
    eq("553", "to_color_array", show(method(pb([...F1, 0, 0, 0, 0, 0, 0, 0, 0, ...F1]), "to_color_array", [])), "[(1.0, 0.0, 0.0, 1.0)]");
  });
  it("空 pack 给空且不报；非整数倍打 ERROR 且给空", () => {
    const e = capture(() => method(pb([]), "to_vector2_array", []));
    eq("553", "空 pack", `${show(e.value as ReturnType<typeof V.array>)}|${e.text}`, "[]|");
    const t = capture(() => method(pb([...F1, ...F2, 1, 2, 3, 4]), "to_vector2_array", []));
    eq("553", "12 字节 to_vector2", `${show(t.value as ReturnType<typeof V.array>)}|${t.text}`, `[]|ERROR: PackedByteArray size must be a multiple of 8 (size of Vector2) to convert to PackedVector2Array.§   at: func_PackedByteArray_decode_vector2_array (core/variant/variant_call.cpp:1021)`);
    eq("553", "13 字节 to_vector3", capture(() => method(pb(new Array(13).fill(0)), "to_vector3_array", [])).text.split("§")[0], "ERROR: PackedByteArray size must be a multiple of 12 (size of Vector3) to convert to PackedVector3Array.");
    eq("553", "18 字节 to_color", capture(() => method(pb(new Array(18).fill(0)), "to_color_array", [])).text.split("§")[0], "ERROR: PackedByteArray size must be a multiple of 16 (size of Color variant) to convert to PackedColorArray.");
  });
  it("to_vector4_array 与 multibyte 响亮拒", () => {
    let c1 = "";
    let c2 = "";
    try {
      method(pb([1]), "to_vector4_array", []);
    } catch (e) {
      c1 = (e as { code?: string }).code ?? "?";
    }
    try {
      method(pb([1]), "get_string_from_multibyte_char", []);
    } catch (e) {
      c2 = (e as { code?: string }).code ?? "?";
    }
    eq("553", "两处拒", `${c1}/${c2}`, "packed-vector4/packed-multibyte-acp");
  });
});

describe("PackedByteArray.get_string_from_utf32（S553）", () => {
  it("小端码点、尾巴不足 4 字节静默丢", () => {
    const s = pb([0x41, 0, 0, 0, 0xe9, 0, 0, 0, 0x00, 0xf6, 0x01, 0x00, 9, 9]);
    eq("553", "Aé😀 + 尾巴", String(method(s, "get_string_from_utf32", []).v), "Aé😀");
    const r = pb([0x41, 0, 0, 0, 9]);
    eq("553", "尾巴丢", String(method(r, "get_string_from_utf32", []).v), "A");
    eq("553", "空", `[${String(method(pb([]), "get_string_from_utf32", []).v)}]`, "[]");
  });
  it("非标量码点换 U+FFFD（S579 实测）", () => {
    const bad = pb([0x00, 0x00, 0x11, 0x00]);
    const orig = process.stderr.write;
    const writes: string[] = [];
    process.stderr.write = ((chunk: string) => {
      writes.push(String(chunk));
      return true;
    }) as typeof process.stderr.write;
    let got = "";
    try {
      got = String(method(bad, "get_string_from_utf32", []).v);
    } finally {
      process.stderr.write = orig;
    }
    eq("553", "0x110000", `${got}|${writes.join("").includes("Invalid unicode codepoint (110000)")}`, "\ufffd|true");
  });
});
