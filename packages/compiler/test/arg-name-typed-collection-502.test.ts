/**
 * 定形容器标注的名字实参：其余元素型与 `Variant` 那一形（S502）。
 * `tmp/d6/s502b.py` 四十二格（十一标注 × 三位子）+ `tmp/d6/s502c.py` 十八格（`Variant` 参在元素表里的四种拼法）+
 * `tmp/d6/s502d.py` 十格（归一后在 `append_array` 那一位的判据）+ `tmp/d6/s502e.py` 十八格（模块标注名与局部标注名两形），
 * 读数同名 `.json`。判据与 S501 同一族：定形标注就是静态证明，元素型是什么都不改收拒；
 * 型名文本两条规矩 —— 标注**规格化**后印（`Array[ PackedStringArray ]` → `Array[PackedStringArray]`），
 * 元素**全是** `Variant` 的那一形引擎报裸基型（`Array[Variant]` → `Array`），混着一个非 Variant 照报全名。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + body;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

const CELLS: Array<[string, string, string[]]> = [
  ["形参 · String.find(Array[Vector2])", "func c0(r0: String):\n\tvar w0: Array[Vector2]\n\tprint(r0.find(w0))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[Vector2]\"."]],
  ["形参 · Array.resize(Array[Vector2])", "func c1(r1: Array):\n\tvar w1: Array[Vector2]\n\tprint(r1.resize(w1))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[Vector2]\"."]],
  ["形参 · PackedByteArray.append(Array[Vector2])", "func c2(r2: PackedByteArray):\n\tvar w2: Array[Vector2]\n\tprint(r2.append(w2))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[Vector2]\"."]],
  ["形参 · String.find(Array[Color])", "func c3(r3: String):\n\tvar w3: Array[Color]\n\tprint(r3.find(w3))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[Color]\"."]],
  ["形参 · Array.resize(Array[Color])", "func c4(r4: Array):\n\tvar w4: Array[Color]\n\tprint(r4.resize(w4))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[Color]\"."]],
  ["形参 · PackedByteArray.append(Array[Color])", "func c5(r5: PackedByteArray):\n\tvar w5: Array[Color]\n\tprint(r5.append(w5))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[Color]\"."]],
  ["形参 · String.find(Array[StringName])", "func c6(r6: String):\n\tvar w6: Array[StringName]\n\tprint(r6.find(w6))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[StringName]\"."]],
  ["形参 · Array.resize(Array[StringName])", "func c7(r7: Array):\n\tvar w7: Array[StringName]\n\tprint(r7.resize(w7))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[StringName]\"."]],
  ["形参 · PackedByteArray.append(Array[StringName])", "func c8(r8: PackedByteArray):\n\tvar w8: Array[StringName]\n\tprint(r8.append(w8))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[StringName]\"."]],
  ["形参 · String.find(Array[Callable])", "func c9(r9: String):\n\tvar w9: Array[Callable]\n\tprint(r9.find(w9))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[Callable]\"."]],
  ["形参 · Array.resize(Array[Callable])", "func c10(r10: Array):\n\tvar w10: Array[Callable]\n\tprint(r10.resize(w10))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[Callable]\"."]],
  ["形参 · PackedByteArray.append(Array[Callable])", "func c11(r11: PackedByteArray):\n\tvar w11: Array[Callable]\n\tprint(r11.append(w11))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[Callable]\"."]],
  ["形参 · String.find(Array[Variant])", "func c12(r12: String):\n\tvar w12: Array[Variant]\n\tprint(r12.find(w12))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["形参 · Array.resize(Array[Variant])", "func c13(r13: Array):\n\tvar w13: Array[Variant]\n\tprint(r13.resize(w13))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["形参 · PackedByteArray.append(Array[Variant])", "func c14(r14: PackedByteArray):\n\tvar w14: Array[Variant]\n\tprint(r14.append(w14))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["形参 · String.find(Array[Array])", "func c15(r15: String):\n\tvar w15: Array[Array]\n\tprint(r15.find(w15))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[Array]\"."]],
  ["形参 · Array.resize(Array[Array])", "func c16(r16: Array):\n\tvar w16: Array[Array]\n\tprint(r16.resize(w16))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[Array]\"."]],
  ["形参 · PackedByteArray.append(Array[Array])", "func c17(r17: PackedByteArray):\n\tvar w17: Array[Array]\n\tprint(r17.append(w17))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[Array]\"."]],
  ["形参 · String.find(Dictionary[int, Array])", "func c18(r18: String):\n\tvar w18: Dictionary[int, Array]\n\tprint(r18.find(w18))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[int, Array]\"."]],
  ["形参 · Array.resize(Dictionary[int, Array])", "func c19(r19: Array):\n\tvar w19: Dictionary[int, Array]\n\tprint(r19.resize(w19))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[int, Array]\"."]],
  ["形参 · PackedByteArray.append(Dictionary[int, Array])", "func c20(r20: PackedByteArray):\n\tvar w20: Dictionary[int, Array]\n\tprint(r20.append(w20))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[int, Array]\"."]],
  ["形参 · String.find(Array[ PackedStringArray ])", "func c21(r21: String):\n\tvar w21: Array[ PackedStringArray ]\n\tprint(r21.find(w21))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array[PackedStringArray]\"."]],
  ["形参 · Array.resize(Array[ PackedStringArray ])", "func c22(r22: Array):\n\tvar w22: Array[ PackedStringArray ]\n\tprint(r22.resize(w22))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array[PackedStringArray]\"."]],
  ["形参 · PackedByteArray.append(Array[ PackedStringArray ])", "func c23(r23: PackedByteArray):\n\tvar w23: Array[ PackedStringArray ]\n\tprint(r23.append(w23))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array[PackedStringArray]\"."]],
  ["形参 · String.find(Dictionary[int, float])", "func c24(r24: String):\n\tvar w24: Dictionary[int, float]\n\tprint(r24.find(w24))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[int, float]\"."]],
  ["形参 · Array.resize(Dictionary[int, float])", "func c25(r25: Array):\n\tvar w25: Dictionary[int, float]\n\tprint(r25.resize(w25))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[int, float]\"."]],
  ["形参 · PackedByteArray.append(Dictionary[int, float])", "func c26(r26: PackedByteArray):\n\tvar w26: Dictionary[int, float]\n\tprint(r26.append(w26))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[int, float]\"."]],
  ["形参 · String.find(Dictionary[Variant, Variant])", "func c27(r27: String):\n\tvar w27: Dictionary[Variant, Variant]\n\tprint(r27.find(w27))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["形参 · Array.resize(Dictionary[Variant, Variant])", "func c28(r28: Array):\n\tvar w28: Dictionary[Variant, Variant]\n\tprint(r28.resize(w28))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["形参 · PackedByteArray.append(Dictionary[Variant, Variant])", "func c29(r29: PackedByteArray):\n\tvar w29: Dictionary[Variant, Variant]\n\tprint(r29.append(w29))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["形参 · String.find(Dictionary[String, Variant])", "func c30(r30: String):\n\tvar w30: Dictionary[String, Variant]\n\tprint(r30.find(w30))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[String, Variant]\"."]],
  ["形参 · Array.resize(Dictionary[String, Variant])", "func c31(r31: Array):\n\tvar w31: Dictionary[String, Variant]\n\tprint(r31.resize(w31))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
  ["形参 · PackedByteArray.append(Dictionary[String, Variant])", "func c32(r32: PackedByteArray):\n\tvar w32: Dictionary[String, Variant]\n\tprint(r32.append(w32))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
  ["形参 · String.find(Dictionary[Variant, int])", "func c33(r33: String):\n\tvar w33: Dictionary[Variant, int]\n\tprint(r33.find(w33))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[Variant, int]\"."]],
  ["形参 · Array.resize(Dictionary[Variant, int])", "func c34(r34: Array):\n\tvar w34: Dictionary[Variant, int]\n\tprint(r34.resize(w34))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[Variant, int]\"."]],
  ["形参 · PackedByteArray.append(Dictionary[Variant, int])", "func c35(r35: PackedByteArray):\n\tvar w35: Dictionary[Variant, int]\n\tprint(r35.append(w35))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[Variant, int]\"."]],
  ["形参 · String.find(Array[Variant])", "func c36(r36: String):\n\tvar w36: Array[Variant]\n\tprint(r36.find(w36))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["形参 · Array.resize(Array[Variant])", "func c37(r37: Array):\n\tvar w37: Array[Variant]\n\tprint(r37.resize(w37))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["形参 · PackedByteArray.append(Array[Variant])", "func c38(r38: PackedByteArray):\n\tvar w38: Array[Variant]\n\tprint(r38.append(w38))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["形参 · String.find(Dictionary[String, int])", "func c39(r39: String):\n\tvar w39: Dictionary[String, int]\n\tprint(r39.find(w39))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[String, int]\"."]],
  ["形参 · Array.resize(Dictionary[String, int])", "func c40(r40: Array):\n\tvar w40: Dictionary[String, int]\n\tprint(r40.resize(w40))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[String, int]\"."]],
  ["形参 · PackedByteArray.append(Dictionary[String, int])", "func c41(r41: PackedByteArray):\n\tvar w41: Dictionary[String, int]\n\tprint(r41.append(w41))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[String, int]\"."]],
  ["形参 · PackedByteArray.append_array(Array[Variant])", "func c42(r42: PackedByteArray):\n\tvar w42: Array[Variant]\n\tprint(r42.append_array(w42))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["形参 · PackedStringArray.append_array(Array[Variant])", "func c43(r43: PackedStringArray):\n\tvar w43: Array[Variant]\n\tprint(r43.append_array(w43))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["形参 · PackedByteArray.append_array(Dictionary[Variant, Variant])", "func c44(r44: PackedByteArray):\n\tvar w44: Dictionary[Variant, Variant]\n\tprint(r44.append_array(w44))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"PackedByteArray\" but is \"Dictionary\"."]],
  ["形参 · PackedStringArray.append_array(Dictionary[Variant, Variant])", "func c45(r45: PackedStringArray):\n\tvar w45: Dictionary[Variant, Variant]\n\tprint(r45.append_array(w45))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"PackedStringArray\" but is \"Dictionary\"."]],
  ["形参 · PackedByteArray.append_array(Array[int])", "func c46(r46: PackedByteArray):\n\tvar w46: Array[int]\n\tprint(r46.append_array(w46))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["形参 · PackedStringArray.append_array(Array[int])", "func c47(r47: PackedStringArray):\n\tvar w47: Array[int]\n\tprint(r47.append_array(w47))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\"."]],
  ["形参 · PackedByteArray.append_array(Dictionary[String, int])", "func c48(r48: PackedByteArray):\n\tvar w48: Dictionary[String, int]\n\tprint(r48.append_array(w48))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"PackedByteArray\" but is \"Dictionary[String, int]\"."]],
  ["形参 · PackedStringArray.append_array(Dictionary[String, int])", "func c49(r49: PackedStringArray):\n\tvar w49: Dictionary[String, int]\n\tprint(r49.append_array(w49))\n", ["Cannot get return value of call to \"append_array()\" because it returns \"void\".", "Invalid argument for \"append_array()\" function: argument 1 should be \"PackedStringArray\" but is \"Dictionary[String, int]\"."]],
  ["模块 · String.find(Array[Variant])", "var rr: String\nvar w50: Array[Variant]\n\nfunc c50():\n\tprint(rr.find(w50))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["局部 · String.find(Array[Variant])", "var rr: String\n\nfunc c51():\n\tvar w51: Array[Variant]\n\tprint(rr.find(w51))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Array\"."]],
  ["模块 · Array.resize(Array[Variant])", "var rr: Array\nvar w52: Array[Variant]\n\nfunc c52():\n\tprint(rr.resize(w52))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["局部 · Array.resize(Array[Variant])", "var rr: Array\n\nfunc c53():\n\tvar w53: Array[Variant]\n\tprint(rr.resize(w53))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["模块 · PackedByteArray.append(Array[Variant])", "var rr: PackedByteArray\nvar w54: Array[Variant]\n\nfunc c54():\n\tprint(rr.append(w54))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["局部 · PackedByteArray.append(Array[Variant])", "var rr: PackedByteArray\n\nfunc c55():\n\tvar w55: Array[Variant]\n\tprint(rr.append(w55))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Array\"."]],
  ["模块 · String.find(Dictionary[Variant, Variant])", "var rr: String\nvar w56: Dictionary[Variant, Variant]\n\nfunc c56():\n\tprint(rr.find(w56))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["局部 · String.find(Dictionary[Variant, Variant])", "var rr: String\n\nfunc c57():\n\tvar w57: Dictionary[Variant, Variant]\n\tprint(rr.find(w57))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary\"."]],
  ["模块 · Array.resize(Dictionary[Variant, Variant])", "var rr: Array\nvar w58: Dictionary[Variant, Variant]\n\nfunc c58():\n\tprint(rr.resize(w58))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["局部 · Array.resize(Dictionary[Variant, Variant])", "var rr: Array\n\nfunc c59():\n\tvar w59: Dictionary[Variant, Variant]\n\tprint(rr.resize(w59))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["模块 · PackedByteArray.append(Dictionary[Variant, Variant])", "var rr: PackedByteArray\nvar w60: Dictionary[Variant, Variant]\n\nfunc c60():\n\tprint(rr.append(w60))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["局部 · PackedByteArray.append(Dictionary[Variant, Variant])", "var rr: PackedByteArray\n\nfunc c61():\n\tvar w61: Dictionary[Variant, Variant]\n\tprint(rr.append(w61))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary\"."]],
  ["模块 · String.find(Dictionary[String, Variant])", "var rr: String\nvar w62: Dictionary[String, Variant]\n\nfunc c62():\n\tprint(rr.find(w62))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[String, Variant]\"."]],
  ["局部 · String.find(Dictionary[String, Variant])", "var rr: String\n\nfunc c63():\n\tvar w63: Dictionary[String, Variant]\n\tprint(rr.find(w63))\n", ["Invalid argument for \"find()\" function: argument 1 should be \"String\" but is \"Dictionary[String, Variant]\"."]],
  ["模块 · Array.resize(Dictionary[String, Variant])", "var rr: Array\nvar w64: Dictionary[String, Variant]\n\nfunc c64():\n\tprint(rr.resize(w64))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
  ["局部 · Array.resize(Dictionary[String, Variant])", "var rr: Array\n\nfunc c65():\n\tvar w65: Dictionary[String, Variant]\n\tprint(rr.resize(w65))\n", ["Invalid argument for \"resize()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
  ["模块 · PackedByteArray.append(Dictionary[String, Variant])", "var rr: PackedByteArray\nvar w66: Dictionary[String, Variant]\n\nfunc c66():\n\tprint(rr.append(w66))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
  ["局部 · PackedByteArray.append(Dictionary[String, Variant])", "var rr: PackedByteArray\n\nfunc c67():\n\tvar w67: Dictionary[String, Variant]\n\tprint(rr.append(w67))\n", ["Invalid argument for \"append()\" function: argument 1 should be \"int\" but is \"Dictionary[String, Variant]\"."]],
];

describe("定形容器标注的名字实参：元素型与 Variant 归一", () => {
  for (const [label, body, want] of CELLS) {
    it(label, async () => eq("502", label, await msgs(body), want));
  }
});
