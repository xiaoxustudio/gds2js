// 由 tools/ops-check.ts 机械搬迁：region 2404-2491, 2493-2555, 2557-2592, 2594-2634, 2636-2648, 2650-2692, 2694-2762, 2764-2820, 2822-2879, 3303-3352。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { arrayFromVariant } from "@gds2js/runtime/runtime/builtins";
import { attribute, index, method, writeIdx, writeProp } from "@gds2js/runtime/runtime/methods";
import { ops } from "@gds2js/runtime/runtime/ops";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, valueEq } from "@gds2js/runtime/runtime/values";
import { GColor } from "@gds2js/runtime/runtime/color";
import { GVector2, vector2 } from "@gds2js/runtime/runtime/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/vector3";
import { bytesCtor, GBytes, packCtor, toByte } from "@gds2js/runtime/runtime/packed";
import { asType, isType, typeOf } from "@gds2js/runtime/runtime/patterns";
import { GVector2i } from "@gds2js/runtime/runtime/vector2i";
import { F, I, S } from "./support/variants";

describe("runtime/packed · 打包数组与 zstd", () => {
  it("step67 +2 · 构造 + 打印 + typeof → 29", async () => {
    const err = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    const pack = (ns: number[]): Variant => V.object(GBytes.of(ns));
    const b = bytesCtor([V.array(GArray.of([I(3), I(1), I(2)]))]);
    eq("step67", "构造 + 打印 + typeof → 29", `${show(b)} ${typeOf(b).v}`, "[3, 1, 2] 29");
    eq("step67", "元素折成字节：300→44、-1→255、2.7→2、true→1",
      `${toByte(I(300))} ${toByte(I(-1))} ${toByte(F(2.7))} ${toByte(V.bool(true))}`, "44 255 2 1");
    eq("step67", "`+` 拼接给新 pack", `${show(ops.add(b, pack([7])))}`, "[3, 1, 2, 7]");
    eq("step67", "== 比内容：同内容真、不同内容假",
      `${valueEq(b, bytesCtor([V.array(GArray.of([I(3), I(1), I(2)]))]))} ${valueEq(b, pack([7]))}`, "true false");
    const neg = pack([1, 2]);
    eq("step67", "负下标从尾部数", `${show(index(neg, I(-1)))}`, "2");
    eq("step67", "越界读的文本逐字对上", err(() => index(neg, I(5))),
      "Invalid access of index '5' on a base object of type: 'PackedByteArray'.");
    eq("step67", "越界写的文本逐字对上", err(() => writeIdx(neg, I(5), I(1))),
      "Invalid assignment of index '5' (on base: 'PackedByteArray') with value of type 'int'.");
    const wr = pack([0, 0]);
    writeIdx(wr, I(0), I(700));
    eq("step67", "下标写 700 回绕成 188", `${show(wr)}`, "[188, 0]");
    const dup = method(b, "duplicate", []);
    writeIdx(dup, I(0), I(8));
    const cp = bytesCtor([b]);
    writeIdx(cp, I(1), I(5));
    eq("step67", "duplicate() 与 PackedByteArray(src) 都是独立拷贝",
      `${show(b)} ${show(dup)} ${show(cp)}`, "[3, 1, 2] [8, 1, 2] [3, 5, 2]");
    const rs = pack([1]);
    method(rs, "resize", [I(3)]);
    eq("step67", "resize 长出来的格子填 0", `${show(rs)}`, "[1, 0, 0]");
    eq("step67", "hex_encode", `${method(pack([1, 2, 3, 255]), "hex_encode", []).v}`, "010203ff");
    eq("step67", "UTF-8 往返：六字节 → héllo",
      `${method(pack([104, 195, 169, 108, 108, 111]), "get_string_from_utf8", []).v}`, "héllo");
    eq("step67", "文本 → 字节（to_utf8_buffer）", `${show(method(S("héllo"), "to_utf8_buffer", []))}`,
      "[104, 195, 169, 108, 108, 111]");
    eq("step67", "get_string_from_ascii 只实测过纯 ASCII，带高位字节响着拒",
      err(() => method(pack([104, 200]), "get_string_from_ascii", [])),
      "get_string_from_ascii() 只实测过纯 ASCII 的字节");
    eq("step67", "不存在的 min / to_byte_array 给运行期 Nonexistent 文本（用例 135）",
      `${err(() => method(b, "min", []))}|${err(() => method(b, "to_byte_array", []))}`,
      "Invalid call. Nonexistent function 'min' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'to_byte_array' in base 'PackedByteArray'.");
    eq("step81", "bsearch 这一轮量齐了：给的是下标，找不到给插入位而不是 -1 —— [3,1,2] 上 bsearch(1) 是 0、bsearch(2) 是 2",
      `${show(method(b, "bsearch", [I(1)]))} ${show(method(b, "bsearch", [I(2)]))}`, "0 2");
    const viaArray = arrayFromVariant(b);
    eq("step67", "Array(pack) 是 int 元素的 Array（用例 135 u19）",
      `${show(viaArray)} ${typeOf(index(viaArray, I(0))).v}`, "[3, 1, 2] 2");
    shouldThrow("step67", "Array(x) 只实测过 PackedByteArray 实参", () => arrayFromVariant(S("abc")));
    shouldThrow("step67", "读 pack 的「属性」一律响（属性面没实测过，成员全是方法）", () => attribute(b, "length"));
    shouldThrow("step67", "写 pack 的内部键不许落进存储", () => writeProp(b, "items", I(1)));
    const mut = (ns: number[]): Variant => V.object(GBytes.of(ns));
    const ap = mut([1, 2, 3]);
    eq("step67", "append() 返回 **bool false** 且照样追加",
      `${show(method(ap, "append", [I(9)]))} ${show(ap)}`, "false [1, 2, 3, 9]");
    const ins = mut([1, 2, 3]);
    eq("step67", "insert 合法给 0 并插进去（batch1 t）", `${show(method(ins, "insert", [I(0), I(5)]))} ${show(ins)}`, "0 [5, 1, 2, 3]");
    const insNeg = mut([1, 2, 3]);
    eq("step67", "insert(-1) 是**原样不动** + 31（不是尾部插入）",
      `${show(method(insNeg, "insert", [I(-1), I(9)]))} ${show(insNeg)}`, "31 [1, 2, 3]");
    const insOob = mut([1, 2, 3]);
    eq("step67", "insert 越界同样 31 且不动", `${show(method(insOob, "insert", [I(10), I(5)]))} ${show(insOob)}`, "31 [1, 2, 3]");
    const rz = mut([1, 2, 3]);
    eq("step67", "resize 缩回去是截断，返回 0", `${show(method(rz, "resize", [I(2)]))} ${show(rz)}`, "0 [1, 2]");
    const rzNeg = mut([1, 2, 3]);
    eq("step67", "resize(-1) 给 31 且长度不变", `${show(method(rzNeg, "resize", [I(-1)]))} ${show(rzNeg)}`, "31 [1, 2, 3]");
    const rmNeg = mut([1, 2, 3]);
    method(rmNeg, "remove_at", [I(-1)]);
    eq("step67", "remove_at 的负下标**不删末尾**（JS 的 splice(-1,1) 会删）", `${show(rmNeg)}`, "[1, 2, 3]");
    const rmOob = mut([1, 2, 3]);
    method(rmOob, "remove_at", [I(9)]);
    eq("step67", "remove_at 越界原样不动", `${show(rmOob)}`, "[1, 2, 3]");
    const gt = mut([1, 2, 3]);
    eq("step67", "get 越界给 **0** 而不是报错（与 `b[5]` 两套口径）", `${show(method(gt, "get", [I(5)]))}`, "0");
    eq("step80", "get 的负下标算**越界**、给默认元素值（Godot 另打一句引擎 stderr，stdout 那半是 0；与 `b[-1]` 从尾部数是两套口径）",
      `${show(method(gt, "get", [I(-1)]))}`, "0");
    const nw = mut([1, 2, 3]);
    writeIdx(nw, I(-1), I(9));
    eq("step67", "写的负下标与读一样从尾部数", `${show(nw)}`, "[1, 2, 9]");
    eq("step67", "copy_on_write 在 4.6.3 对这个类型不存在",
      err(() => method(b, "copy_on_write", [])), "Invalid call. Nonexistent function 'copy_on_write' in base 'PackedByteArray'.");
    eq("step67", "slice 的单参与负 end 都按 JS 口径（实测同值）",
      `${show(method(V.object(GBytes.of([1, 2, 3, 4])), "slice", [I(1)]))} ${show(method(V.object(GBytes.of([1, 2, 3, 4])), "slice", [I(1), I(-1)]))}`,
      "[2, 3, 4] [2, 3]");
  });

  it("step68 +1 · int32 是**回绕**不是饱和（2^31→-2^31、-2^31-1→2^3…", async () => {
    const perr = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    const i32 = packCtor("int32", [V.array(GArray.of([I(2147483648), I(-2147483649), I(4294967296), I(9007199254740993n), F(2.7), F(-2.7), V.bool(true)]))]);
    eq("step68", "int32 是**回绕**不是饱和（2^31→-2^31、-2^31-1→2^31-1、2^32→0、2^53+1→1）",
      `${show(i32)} ${typeOf(i32).v}`, "[-2147483648, 2147483647, 0, 1, 2, -2, 1] 30");
    const i32f = packCtor("int32", [V.array(GArray.of([F(0.1), F(1.0), F(1e308)]))]);
    eq("step68", "float→int32：范围内截断，**越上界饱和到 INT32_MIN**（不是 MAX、也不是截低位）",
      `${show(i32f)} ${show(index(i32f, I(0)))} ${show(ops.eq(index(i32f, I(0)), F(0.1)))}`, "[0, 1, -2147483648] 0 false");
    const i64 = packCtor("int64", [V.array(GArray.of([I(2147483648), I(-2147483649), I(9007199254740993n), F(2.7), V.bool(true)]))]);
    eq("step68", "int64 保精确（2^53+1 原样存 → 元素必须是 BigInt，typeof 31）",
      `${show(i64)} ${typeOf(i64).v} ${show(index(i64, I(2)))} ${typeOf(index(i64, I(0))).v}`,
      "[2147483648, -2147483649, 9007199254740993, 2, 1] 31 9007199254740993 2");
    const i32b = V.object(GBytes.of([1, 2, 3], "int32"));
    eq("step68", "int32 的 append 折 0..255？**不折**：300 原样存，返回值仍是 bool false（byte 那族才折）",
      `${show(method(i32b, "append", [I(300)]))} ${show(i32b)}`, "false [1, 2, 3, 300]");
    const i32r = V.object(GBytes.of([1, 2, 3], "int32"));
    eq("step68", "resize 长出来填 0、返回 0（h-*ret / k-*resgrow）",
      `${show(method(i32r, "resize", [I(5)]))} ${show(i32r)}`, "0 [1, 2, 3, 0, 0]");
    const i32n = V.object(GBytes.of([1, 2, 3], "int32"));
    eq("step68", "resize(-1) 给 31 且长度不变", `${show(method(i32n, "resize", [I(-1)]))} ${show(i32n)}`, "31 [1, 2, 3]");
    const i32i = V.object(GBytes.of([1, 2, 3], "int32"));
    eq("step68", "insert 的三种位置：合法 0、负数与越界都 31 且原样不动",
      [method(i32i, "insert", [I(0), I(5)]).v, method(i32i, "insert", [I(-1), I(9)]).v, method(i32i, "insert", [I(99), I(9)]).v].join(","),
      "0,31,31");
    eq("step68", "上面那两次失败插入确实没动存储", `${show(i32i)}`, "[5, 1, 2, 3]");
    const i32d = V.object(GBytes.of([1, 2, 3], "int32"));
    method(i32d, "remove_at", [I(-1)]);
    eq("step68", "remove_at(-1) 不删末尾（JS 的 splice(-1,1) 会删）", `${show(i32d)}`, "[1, 2, 3]");
    const i32g = V.object(GBytes.of([1, 2, 3], "int32"));
    eq("step68", "get 越界给 0（int pack 与 byte 同形）", `${show(method(i32g, "get", [I(5)]))} ${show(method(i32g, "get", [I(1)]))}`, "0 2");
    const i32w = V.object(GBytes.of([1, 2, 3], "int32"));
    writeIdx(i32w, I(-1), I(77));
    eq("step68", "写的负下标从尾部数（k-*negwrite）", `${show(i32w)}`, "[1, 2, 77]");
    eq("step68", "hex_encode 在 PackedInt32Array 上不存在（k-*hex）",
      perr(() => method(i32g, "hex_encode", [])), "Invalid call. Nonexistent function 'hex_encode' in base 'PackedInt32Array'.");
    eq("step68", "越界的**下标读**用各自的类型名（不是照抄 PackedByteArray 那句）",
      perr(() => index(i32g, I(5))), "Invalid access of index '5' on a base object of type: 'PackedInt32Array'.");
    eq("step68", "越界写的那句也照类型名变", perr(() => writeIdx(i32g, I(5), I(1))),
      "Invalid assignment of index '5' (on base: 'PackedInt32Array') with value of type 'int'.");
    shouldThrow("step68", "跨 pack 拼接没量过 → 响", () => ops.add(i32g, V.object(GBytes.of([1], "byte"))));
    shouldThrow("step68", "Array(int pack) 只量过 Array(PackedByteArray) → 响", () => arrayFromVariant(i32g));
    eq("step80", "String 元素走**前导数解析**（与 to_int() 同一条式子：\"12abc\" → 12、\"-7xyz\" → -7、\"x\" → 0）",
      `${show(packCtor("int32", [V.array(GArray.of([S("12abc")]))]))} ${show(packCtor("int32", [V.array(GArray.of([S("-7xyz")]))]))} ${show(packCtor("byte", [V.array(GArray.of([S("x")]))]))}`,
      "[12] [-7] [0]");
    eq("step80", "int64 收 float 的正向溢出**饱和到 INT64_MIN**（1e30 → -9223372036854775808；nan/inf 仍响）",
      `${show(packCtor("int64", [V.array(GArray.of([F(1e308), F(1e30), F(2.7), F(-2.7)]))]))}`,
      "[-9223372036854775808, -9223372036854775808, 2, -2]");
    shouldThrow("step80", "int64 收 nan / inf 这一格没量过 → 仍响（饱和只量了有限大数）", () =>
      packCtor("int64", [V.array(GArray.of([F(Number.NaN)]))]));
    shouldThrow("step68", "跨 pack 的拷贝构造没量过 → 响", () => packCtor("int32", [V.object(GBytes.of([1], "byte"))]));
    const i64s = V.object(GBytes.of([3n, 1n, 2n], "int64"));
    method(i64s, "sort", []);
    eq("step68", "int64 的比较走 BigInt（不是把 bigint 折成 number）", `${show(i64s)}`, "[1, 2, 3]");
    eq("step68", "== 比内容、同形状才比（138 u7 / u12）",
      `${show(ops.eq(V.object(GBytes.of([1, 2], "int32")), V.object(GBytes.of([1, 2], "int32"))))}`, "true");
  });

  it("step69 +1 · float32 的 0.1 / 2.7 / 1/3 / 1e-5 / 1e20 …", async () => {
    const fl = (kind: "float32" | "float64", ns: number[]): Variant =>
      packCtor(kind, [V.array(GArray.of(ns.map((x) => V.float(x))))]);
    eq("step69", "float32 的 0.1 / 2.7 / 1/3 / 1e-5 / 1e20 打印与 Godot 同字，typeof 32",
      `${show(fl("float32", [0.1, 2.7, 1 / 3, 1e-5, 123456.789, -0.0, 1e20]))} ${typeOf(fl("float32", [1])).v}`,
      "[0.10000000149012, 2.70000004768372, 0.33333334326744, 0.00000999999975, 123456.7890625, 0.0, 100000002004087730000.0] 32");
    eq("step69", "float64 原样保精度（0.1 == 0.1 真、1/3 给 14 位小数），typeof 33",
      `${show(fl("float64", [0.1, 1 / 3]))} ${typeOf(fl("float64", [1])).v} ${show(ops.eq(index(fl("float64", [0.1]), I(0)), F(0.1)))}`,
      "[0.1, 0.33333333333333] 33 true");
    eq("step69", "float32 的 1e308 → **inf**，float64 的 1e308 → 309 位全展",
      `${show(index(fl("float32", [1e308]), I(0)))} ${show(index(fl("float64", [1e308]), I(0))).slice(0, 12)}…${show(index(fl("float64", [1e308]), I(0))).slice(-3)}`,
      "inf 100000000000…0.0");
    eq("step69", "int / bool 升格：[1, true, 3] → [1.0, 1.0, 3.0]（不是回绕、不是折字节）",
      `${show(packCtor("float64", [V.array(GArray.of([I(1), V.bool(true), I(3)]))]))}`, "[1.0, 1.0, 3.0]");
    const fz = V.object(GBytes.of([1.5], "float32"));
    method(fz, "resize", [I(3)]);
    eq("step69", "resize 长出来填 **0.0**（按元素类型），append 仍返回 bool false",
      `${show(fz)} ${show(method(fz, "append", [F(2.5)]))} ${show(fz)}`, "[1.5, 0.0, 0.0] false [1.5, 0.0, 0.0, 2.5]");
    const fg = V.object(GBytes.of([1.5, 2.5], "float32"));
    eq("step69", "get 越界给 **0.0**（不是 int 的 0）、负下标从尾部数",
      `${show(method(fg, "get", [I(5)]))} ${show(index(fg, I(-1)))}`, "0.0 2.5");
    const fi = V.object(GBytes.of([1.5, 2.5], "float64"));
    eq("step69", "insert 的 0 / 31 同形（负数原样不动）",
      `${show(method(fi, "insert", [I(0), F(9.5)]))} ${show(method(fi, "insert", [I(-1), F(9)]))} ${show(fi)}`,
      "0 31 [9.5, 1.5, 2.5]");
    const fw = V.object(GBytes.of([1.5, 2.5], "float32"));
    writeIdx(fw, I(-1), F(8.25));
    eq("step69", "写的负下标也从尾部数", `${show(fw)}`, "[1.5, 8.25]");
    shouldThrow("step69", "跨形状拼接（float32 + byte）没量过 → 响", () =>
      ops.add(V.object(GBytes.of([1.5], "float32")), V.object(GBytes.of([1], "byte"))));
    eq("step80", "float pack 的 String 元素同一条前导数解析（\"x\" → 0.0、\"1.5abc\" → 1.5，float32 再过储存）",
      `${show(packCtor("float32", [V.array(GArray.of([S("x"), S("1.5")]))]))} ${show(packCtor("float64", [V.array(GArray.of([S("1.5abc")]))]))}`,
      "[0.0, 1.5] [1.5]");
    shouldThrow("step69", "hex_encode 不在 float pack 上（只有 byte 那支量过）", () =>
      method(V.object(GBytes.of([1.5], "float32")), "hex_encode", []));
  });

  it("step71 · 元素取 show：[1, 2.5, true, null, &\\", async () => {
    const strs = (vs: Variant[]): Variant => packCtor("string", [V.array(GArray.of(vs))]);
    eq("step71", "元素取 show：[1, 2.5, true, null, &\"nm\"] → [\"1\", \"2.5\", \"true\", \"<null>\", \"nm\"]",
      show(strs([I(1), F(2.5), V.bool(true), V.nil(), V.stringName("nm")])),
      '["1", "2.5", "true", "<null>", "nm"]');
    const sb = strs([S("a"), S("b")]);
    eq("step71", "打印与 typeof 34、元素 typeof 4（不是 11）", `${show(sb)} ${typeOf(sb).v} ${typeOf(index(sb, I(0))).v}`,
      '["a", "b"] 34 4');
    const sdef = V.object(GBytes.of([], "string"));
    method(sdef, "resize", [I(2)]);
    eq("step71", "resize 长出来填**空串**（int/float 那两侧填 0 / 0.0，byte 填 0）", `${show(sdef)} ${sdef.t}`, `["", ""] ${Tag.OBJECT}`);
    eq("step71", "get 越界给空串（与 b[i] 越界报错是两套口径）",
      `${show(method(sdef, "get", [I(9)]))}| ${show(sdef)}`, '| ["", ""]');
    const sap = V.object(GBytes.of(["a"], "string"));
    eq("step71", "append 返回 bool false 且追加", `${show(method(sap, "append", [S("x")]))} ${show(sap)}`, 'false ["a", "x"]');
    const sneg = V.object(GBytes.of(["a", "b"], "string"));
    writeIdx(sneg, I(-1), S("z"));
    eq("step71", "写的负下标从尾部数", `${show(sneg)}`, '["a", "z"]');
    const ssort = V.object(GBytes.of(["b", "a", "ab"], "string"));
    method(ssort, "sort", []);
    eq("step71", "sort 按码点（step 19 那条），不是把字符串当数字相减", `${show(ssort)}`, '["a", "ab", "b"]');
    eq("step71", "== 比内容、+ 同形状拼接",
      `${show(ops.eq(strs([S("a")]), strs([S("a")])))} ${show(ops.add(strs([S("a")]), strs([S("b")])))}`,
      'true ["a", "b"]');
    shouldThrow("step71", "跨形状拼接（string + byte）没量过 → 响", () =>
      ops.add(strs([S("a")]), V.object(GBytes.of([1], "byte"))));
    shouldThrow("step71", "Array(PackedStringArray) 只量过 Array(PackedByteArray) → 响", () => arrayFromVariant(sb));
    const serr = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    eq("step71", "min 在 PackedStringArray 上不存在，句子里的型名跟着换",
      serr(() => method(sb, "min", [])), "Invalid call. Nonexistent function 'min' in base 'PackedStringArray'.");
    eq("step71", "join 在 PackedStringArray 上不存在（旧文档有、4.6.3 没有；九支在 step 102 一次量齐）",
      serr(() => method(sb, "join", [S("-")])),
      "Invalid call. Nonexistent function 'join' in base 'PackedStringArray'.");
  });

  it("step72 · b is PackedByteArray 真、is PackedInt32Arr…", async () => {
    const byte = V.object(GBytes.of([1, 2], "byte"));
    const i32 = V.object(GBytes.of([7], "int32"));
    eq("step72", "b is PackedByteArray 真、is PackedInt32Array / Array / Object 全假、is Variant 真",
      [isType(byte, "PackedByteArray").v, isType(byte, "PackedInt32Array").v, isType(byte, "Array").v, isType(byte, "Object").v, isType(byte, "Variant").v].join(","),
      "true,false,false,false,true");
    eq("step72", "同一支 int32 只认自己那个名字", `${isType(i32, "PackedInt32Array").v} ${isType(i32, "PackedByteArray").v}`, "true false");
    eq("step72", "as 同形状是**同一个值**（c == b 真）", `${show(asType(byte, "PackedByteArray"))} ${valueEq(asType(byte, "PackedByteArray"), byte)}`, "[1, 2] true");
    shouldThrow("step72", "as 到别的形状没量过 → 响（静态能判的那类由语义分析层在解析期拒）", () => asType(byte, "PackedStringArray"));
    eq("step72", "跨形状的 is 现在判得出来（step 73 之后九种全实现）：byte 不是 PackedVector2Array",
      `${isType(byte, "PackedVector2Array").v}`, "false");
    eq("step72", "普通值不受影响：1 is Object 假、[] is Array 真", `${isType(I(1), "Object").v} ${isType(V.array(GArray.of([])), "Array").v}`, "false true");
  });

  it("step73 +1 · PackedVector2Array 的打印与 typeof 35、元素 typ…", async () => {
    const v2 = (x: number, y: number): Variant => V.object(new GVector2(x, y));
    const p2 = packCtor("vector2", [V.array(GArray.of([v2(3, 3), v2(1, 1), v2(2, 2)]))]);
    eq("step73", "PackedVector2Array 的打印与 typeof 35、元素 typeof 5",
      `${show(p2)} ${typeOf(p2).v} ${typeOf(index(p2, I(0))).v}`, "[(3.0, 3.0), (1.0, 1.0), (2.0, 2.0)] 35 5");
    const p2s = V.object(GBytes.of([new GVector2(3, 3), new GVector2(1, 1), new GVector2(2, 2)], "vector2"));
    method(p2s, "sort", []);
    eq("step73", "sort 按 x 再按 y（实测同一条序列）", `${show(p2s)} ${show(index(p2s, I(-1)))}`,
      "[(1.0, 1.0), (2.0, 2.0), (3.0, 3.0)] (3.0, 3.0)");
    const pf = V.object(GBytes.of([], "vector2"));
    method(pf, "resize", [I(3)]);
    eq("step73", "resize 长出来填**默认向量** (0.0, 0.0)，get 越界同值",
      `${show(pf)} ${show(method(pf, "get", [I(9)]))}`, "[(0.0, 0.0), (0.0, 0.0), (0.0, 0.0)] (0.0, 0.0)");
    eq("step73", "append 返回 bool false、insert 合法给 0（与其余六种同形）",
      `${show(method(pf, "append", [v2(1, 2)]))} ${show(method(pf, "insert", [I(0), v2(0, 5)]))} ${show(method(pf, "size", []))}`,
      "false 0 5");
    const pu = packCtor("vector2", [V.array(GArray.of([V.object(new GVector2i(1, 2))]))]);
    eq("step73", "Vector2i 升格成 Vector2（实测）", `${show(pu)}`, "[(1.0, 2.0)]");
    const pbad = packCtor("vector2", [V.array(GArray.of([I(1), S("x"), V.bool(true)]))]);
    eq("step73", "对不上的类型一律折成默认值、**不报错**", `${show(pbad)}`, "[(0.0, 0.0), (0.0, 0.0), (0.0, 0.0)]");
    const pbtc = packCtor("color", [V.array(GArray.of([v2(1, 2)]))]);
    eq("step73", "颜色 pack 收 Vector2 → 默认色 (0.0, 0.0, 0.0, 1.0)（实测给一句 stderr，stdout 不受影响）",
      `${show(pbtc)} ${typeOf(pbtc).v}`, "[(0.0, 0.0, 0.0, 1.0)] 37");
    eq("step73", "== 比的是分量内容（两个新建的同值 pack 相等）",
      `${show(ops.eq(V.object(GBytes.of([new GVector2(1, 2)], "vector2")), V.object(GBytes.of([new GVector2(1, 2)], "vector2"))))}`,
      "true");
    const pdup = method(V.object(GBytes.of([new GVector2(1, 1)], "vector2")), "duplicate", []);
    writeIdx(pdup, I(0), v2(7, 7));
    eq("step73", "duplicate 是独立拷贝（写回去不动原 pack）", `${show(pdup)} ${show(V.object(GBytes.of([new GVector2(1, 1)], "vector2")))}`,
      "[(7.0, 7.0)] [(1.0, 1.0)]");
    const v3 = packCtor("vector3", [V.array(GArray.of([V.object(new GVector3(1, 2, 3))]))]);
    eq("step73", "PackedVector3Array 的打印与 typeof 36", `${show(v3)} ${typeOf(v3).v}`, "[(1.0, 2.0, 3.0)] 36");
    eq("step73", "is / as 三种也各认各形状（c is PackedColorArray 真、is PackedVector3Array 假）",
      `${isType(V.object(GBytes.of([new GColor(1, 0, 0, 1)], "color")), "PackedColorArray").v} ${isType(V.object(GBytes.of([new GColor(1, 0, 0, 1)], "color")), "PackedVector3Array").v}`,
      "true false");
    const cs = V.object(GBytes.of([new GColor(0.9, 0.1, 0.1, 1), new GColor(0.1, 0.9, 0.1, 0.5), new GColor(0.5, 0.5, 0.5, 1), new GColor(0.1, 0.1, 0.9, 1), new GColor(0.5, 0.1, 0.9, 0.25)], "color"));
    method(cs, "sort", []);
    eq("step80", "Color pack 的 sort 是 r→g→b→a 字典序（反着排再排一次得同一序列）", `${show(cs)}`,
      "[(0.1, 0.1, 0.9, 1.0), (0.1, 0.9, 0.1, 0.5), (0.5, 0.1, 0.9, 0.25), (0.5, 0.5, 0.5, 1.0), (0.9, 0.1, 0.1, 1.0)]");
    eq("step80", "向量 pack 的 has / count / find 按**分量内容**比（JS 的 includes/indexOf 对这些载荷是比引用，不改就是静默错）",
      `${show(method(p2s, "has", [v2(1, 1)]))} ${show(method(p2s, "find", [v2(3, 3)]))} ${show(method(p2s, "count", [v2(2, 2)]))} ${show(method(p2s, "find", [v2(9, 9)]))}`,
      "true 2 1 -1");
  });

  it("step80 · 越界与负下标那几格 Godot 会往 stderr 打一句引擎 ERROR，只能…", async () => {
    // 越界与负下标那几格 Godot 会往 stderr 打一句引擎 ERROR，只能钉在这里
    const perr = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    const bset = V.object(GBytes.of([1, 2, 3], "byte"));
    method(bset, "set", [I(0), I(300)]);
    eq("step80", "set() 的元素走与字面量同一套折算：set(0, 300) → [44, 2, 3]", `${show(bset)}`, "[44, 2, 3]");
    method(bset, "set", [I(-1), I(9)]);
    method(bset, "set", [I(5), I(9)]);
    eq("step80", "set() 的负下标与越界**静默不动**（既不改内容也不改长度，与 `p[i] = v` 那两句报错两套口径）",
      `${show(bset)} ${show(method(bset, "size", []))}`, "[44, 2, 3] 3");
    const i32set = V.object(GBytes.of([1, 2], "int32"));
    method(i32set, "set", [I(1), I(70000)]);
    method(i32set, "set", [I(-1), I(9)]);
    eq("step80", "int32 的 set 不回绕（70000 原样），负下标同样不动", `${show(i32set)}`, "[1, 70000]");
    const i64set = V.object(GBytes.of([1n, 2n], "int64"));
    method(i64set, "set", [I(1), I(-3)]);
    eq("step80", "int64 的 set（[1, -3]）", `${show(i64set)}`, "[1, -3]");
    const f32set = V.object(GBytes.of([1.5, 2.5], "float32"));
    method(f32set, "set", [I(0), I(3)]);
    method(f32set, "set", [I(1), F(0.1)]);
    eq("step80", "float32 的 set：int 实参升格、0.1 落进 float32 储存", `${show(f32set)}`,
      "[3.0, 0.10000000149012]");
    const f64set = V.object(GBytes.of([1.5, 2.5], "float64"));
    method(f64set, "set", [I(0), I(7)]);
    eq("step80", "float64 的 set 收 int 给 7.0", `${show(f64set)}`, "[7.0, 2.5]");
    const sset = packCtor("string", [V.array(GArray.of([S("a"), S("b")]))]);
    method(sset, "set", [I(1), S("z")]);
    method(sset, "set", [I(5), S("y")]);
    eq("step80", "String pack 的 set：改一格、越界那句只多一句引擎 stderr",
      `${show(sset)} ${show(method(sset, "size", []))}`, `["a", "z"] 2`);
    const v2set = V.object(GBytes.of([new GVector2(1, 2)], "vector2"));
    method(v2set, "set", [I(0), V.object(new GVector2(9, 9))]);
    method(v2set, "set", [I(3), V.object(new GVector2(1, 1))]);
    eq("step80", "Vector2 pack 的 set 写进去的是**拷贝**、越界不动", `${show(v2set)}`, "[(9.0, 9.0)]");
    const v3set = V.object(GBytes.of([new GVector3(1, 2, 3)], "vector3"));
    method(v3set, "set", [I(0), V.object(new GVector3(9, 9, 9))]);
    eq("step80", "Vector3 pack 的 set", `${show(v3set)}`, "[(9.0, 9.0, 9.0)]");
    const cv = V.object(GBytes.of([new GColor(1, 0, 0, 1)], "color"));
    method(cv, "set", [I(0), V.object(new GColor(0, 1, 0, 0.5))]);
    eq("step80", "Color pack 的 set", `${show(cv)}`, "[(0.0, 1.0, 0.0, 0.5)]");
    const gb = V.object(GBytes.of([1, 2, 3], "byte"));
    const sget = packCtor("string", [V.array(GArray.of([S("a")]))]);
    eq("step80", "get 的负下标算越界、给默认元素值：byte → 0、String → 空串（Godot 另打引擎 stderr，那条不进语料）",
      `${show(method(gb, "get", [I(-1)]))}|${show(method(sget, "get", [I(-1)]))}|${show(method(sget, "get", [I(0)]))}`,
      "0||a");
    const colhc = V.object(GBytes.of([new GColor(0.1, 0.2, 0.3, 1), new GColor(0.1, 0.2, 0.3, 0.5)], "color"));
    eq("step80", "Color 的 has / find 按四个分量比，0.1 与 0.10000001 **不是**同一格（float32 储存也不把它们并掉）",
      `${show(method(colhc, "has", [V.object(new GColor(0.1, 0.2, 0.3, 1))]))} ${show(method(colhc, "find", [V.object(new GColor(0.10000001, 0.2, 0.3, 1))]))}`,
      "true -1");
    const v2hc = packCtor("vector2", [V.array(GArray.of([V.object(new GVector2(1.0000001, 2)), V.object(new GVector2(1, 2))]))]);
    eq("step80", "Vector2 pack 的 has 按分量比（引用比会是 false —— 那一格就是静默错）",
      `${show(method(v2hc, "has", [V.object(new GVector2(1, 2))]))} ${show(method(v2hc, "count", [V.object(new GVector2(1, 2))]))}`,
      "true 1");
    eq("step80", "byte 那支四个名字在 4.6.3 不存在，型名照实测文本",
      [perr(() => method(gb, "to_hex_string", [])), perr(() => method(gb, "search_sorted", [])), perr(() => method(gb, "to_base64", [])), perr(() => method(gb, "decode_string", []))].join("|"),
      "Invalid call. Nonexistent function 'to_hex_string' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'search_sorted' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'to_base64' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'decode_string' in base 'PackedByteArray'.");
    eq("step80", "index_of 在 PackedStringArray 上不存在",
      perr(() => method(packCtor("string", [V.array(GArray.of([S("a")]))]), "index_of", [S("a")])),
      "Invalid call. Nonexistent function 'index_of' in base 'PackedStringArray'.");
    shouldThrow("step80", "这四个名字只在 byte / String 那两支量到「不存在」，别的形状仍走响亮拒（不拿邻居的结论凑）", () =>
      method(V.object(GBytes.of([1], "int32")), "to_hex_string", []));
  });

  it("step81 · pack 工具箱第一半", async () => {
    // pack 工具箱第一半
    const perr = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    const bb = (ns: number[]): Variant => V.object(GBytes.of(ns, "byte"));
    eq("step81", "bsearch 找得到给下标、找不到给**插入位**（越界两头是 0 与 size，**从来不给 -1**）",
      `${show(method(bb([1, 3, 5, 7]), "bsearch", [I(5)]))} ${show(method(bb([1, 3, 5, 7]), "bsearch", [I(6)]))} ${show(method(bb([1, 3, 5, 7]), "bsearch", [I(0)]))} ${show(method(bb([1, 3, 5, 7]), "bsearch", [I(9)]))}`,
      "2 3 0 4");
    eq("step81", "before 默认是真；写 false 走 upper_bound（第一格 **>** 目标），重复元素一路数到尾（[2,2,2] / [1,1,2,2,3]）",
      `${show(method(bb([1, 3, 5, 7]), "bsearch", [I(5), V.bool(false)]))} ${show(method(bb([2, 2, 2]), "bsearch", [I(2), V.bool(false)]))} ${show(method(bb([1, 1, 2, 2, 3]), "bsearch", [I(2), V.bool(true)]))} ${show(method(bb([1, 1, 2, 2, 3]), "bsearch", [I(2), V.bool(false)]))}`,
      "3 3 2 4");
    eq("step81", "未排序的 pack 也照 Godot 那条「折半 + `len -= half + 1`」的走（五个数组全部逐格对上）",
      `${show(method(bb([3, 1, 2]), "bsearch", [I(2)]))} ${show(method(bb([3, 1, 2]), "bsearch", [I(9)]))} ${show(method(bb([3, 1, 2]), "bsearch", [I(0)]))} ${show(method(bb([5, 5, 1]), "bsearch", [I(6)]))} ${show(method(bb([9, 2, 7, 4]), "bsearch", [I(7)]))} ${show(method(bb([4, 3, 2, 1]), "bsearch", [I(2), V.bool(false)]))}`,
      "2 3 0 3 2 4");
    eq("step81", "空 pack 给 0（两种 before 都是），越出两端的给 0 / size",
      `${show(method(bb([]), "bsearch", [I(1)]))} ${show(method(bb([]), "bsearch", [I(1), V.bool(false)]))}`,
      "0 0");
    eq("step81", "String / float64 / Vector2 / Color 的 bsearch 用各自 sort 的那条比较",
      `${show(method(packCtor("string", [V.array(GArray.of([S("a"), S("c"), S("e")]))]), "bsearch", [S("d")]))} ${show(method(V.object(GBytes.of([1.5, 2.5, 3.5], "float64")), "bsearch", [F(2.0)]))} ${show(method(V.object(GBytes.of([new GVector2(1, 1)], "vector2")), "bsearch", [V.object(new GVector2(5, 5))]))} ${show(method(V.object(GBytes.of([new GColor(0, 1, 0, 1), new GColor(1, 0, 0, 1)], "color")), "bsearch", [V.object(new GColor(1, 0, 0, 1))]))}`,
      "2 1 1 1");
    shouldThrow("step81", "bsearch 的第二个参数只量过 bool —— 别的来源响亮拒", () =>
      method(bb([1, 2]), "bsearch", [I(1), F(0.5)]));
    eq("step81", "byte 的四个 to_*_array 都是**小端**（0x3F800000 写作 [0,0,128,63]、1 写作末字节 1）",
      `${show(method(bb([0, 0, 128, 63]), "to_float32_array", []))} ${show(method(bb([205, 204, 204, 61]), "to_float32_array", []))} ${show(method(bb([1, 0, 0, 0]), "to_int32_array", []))} ${show(method(bb([0, 0, 0, 0, 0, 0, 248, 63]), "to_float64_array", []))} ${show(method(bb([0, 0, 0, 0, 0, 0, 0, 1]), "to_int64_array", []))} ${show(method(bb([0, 0, 0, 0, 0, 0, 0, 128]), "to_int64_array", []))}`,
      "[1.0] [0.10000000149012] [1] [1.5] [72057594037927936] [-9223372036854775808]");
    eq("step81", "长度**不是整数倍就给空 pack**（六字节的 to_float32_array 是 `[]`，不是「读一个整组」；那句 multiple of 是引擎 stderr，不进语料）；空 pack 也给空的",
      `${show(method(bb([1, 2, 3, 4, 5, 6, 7, 8]), "to_float32_array", []))} ${show(method(bb([1, 2, 3]), "to_int64_array", []))} ${show(method(bb([1, 2, 3, 4, 5, 6]), "to_float32_array", []))} ${typeOf(method(bb([0, 0, 128, 63]), "to_float32_array", [])).v} ${typeOf(method(bb([1, 0, 0, 0, 0, 0, 0, 0]), "to_int64_array", [])).v} ${show(method(bb([]), "to_float32_array", []))}`,
      "[0.0, 0.0] [] [] 32 31 []");
    eq("step81", "to_int64_array 的元素是 int（typeof 2），负一还原成八格 255",
      `${show(method(bb([255, 255, 255, 255, 255, 255, 255, 255]), "to_int64_array", []))} ${show(method(bb([1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]), "to_int64_array", []))} ${typeOf(index(method(bb([1, 0, 0, 0, 0, 0, 0, 0]), "to_int64_array", []), I(0))).v}`,
      "[-1] [1, 2] 2");
    eq("step81", "to_byte_array 八种形状都有（int32 / int64 / float32 / float64 / String / Vector2 / Vector3 / Color），一律小端铺平",
      `${show(method(V.object(GBytes.of([1, -2], "int32")), "to_byte_array", []))} ${show(method(V.object(GBytes.of([1n, -2n], "int64")), "to_byte_array", []))} ${show(method(V.object(GBytes.of([1.5, -1.0, 0.1], "float32")), "to_byte_array", []))} ${show(method(V.object(GBytes.of([1.5], "float64")), "to_byte_array", []))}`,
      "[1, 0, 0, 0, 254, 255, 255, 255] [1, 0, 0, 0, 0, 0, 0, 0, 254, 255, 255, 255, 255, 255, 255, 255] [0, 0, 192, 63, 0, 0, 128, 191, 205, 204, 204, 61] [0, 0, 0, 0, 0, 0, 248, 63]");
    eq("step81", "值类型与颜色的 to_byte_array：float32 逐分量（Vector2 八字节、Vector3 十二字节、Color 十六字节 r→g→b→a）",
      `${show(method(V.object(GBytes.of([new GVector2(1, 2)], "vector2")), "to_byte_array", []))} ${show(method(V.object(GBytes.of([new GVector3(1, 2, 3)], "vector3")), "to_byte_array", []))} ${show(method(V.object(GBytes.of([new GColor(1, 0, 0, 1)], "color")), "to_byte_array", []))}`,
      "[0, 0, 128, 63, 0, 0, 0, 64] [0, 0, 128, 63, 0, 0, 0, 64, 0, 0, 64, 64] [0, 0, 128, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 128, 63]");
    eq("step81", "String pack 的 to_byte_array 是**每元素一份 UTF-8 再接一个 0**（[\"ab\",\"c\"]、[\"\"] → [0]、[] → []、[\"éA\"]）",
      `${show(method(packCtor("string", [V.array(GArray.of([S("ab"), S("c")]))]), "to_byte_array", []))} ${show(method(packCtor("string", [V.array(GArray.of([S("")]))]), "to_byte_array", []))} ${show(method(packCtor("string", [V.array(GArray.of([]))]), "to_byte_array", []))} ${show(method(packCtor("string", [V.array(GArray.of([S("éA")]))]), "to_byte_array", []))}`,
      "[97, 98, 0, 99, 0] [0] [] [195, 169, 65, 0]");
    eq("step81", "to_byte_array 的返回形状是 PackedByteArray（typeof 29）",
      `${typeOf(method(packCtor("string", [V.array(GArray.of([S("ab")]))]), "to_byte_array", [])).v}`, "29");
    eq("step81", "byte 自己没有 to_byte_array，也没有 get_bytes / to_raw_string",
      [perr(() => method(bb([1]), "to_byte_array", [])), perr(() => method(bb([1]), "get_bytes", [I(0), I(1)])), perr(() => method(bb([1]), "to_raw_string", []))].join("|"),
      "Invalid call. Nonexistent function 'to_byte_array' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'get_bytes' in base 'PackedByteArray'.|Invalid call. Nonexistent function 'to_raw_string' in base 'PackedByteArray'.");
    eq("step81", "int32 上没有 to_float32_array / to_int32_array（解析期两句，运行期那一格是这句）",
      [perr(() => method(V.object(GBytes.of([1], "int32")), "to_float32_array", [])), perr(() => method(V.object(GBytes.of([1], "int32")), "to_int32_array", []))].join("|"),
      "Invalid call. Nonexistent function 'to_float32_array' in base 'PackedInt32Array'.|Invalid call. Nonexistent function 'to_int32_array' in base 'PackedInt32Array'.");
    shouldThrow("step81", "四个 to_*_array 只在 byte 上量到「有」，别的形状（int64 / float / 向量）仍响亮拒", () =>
      method(V.object(GBytes.of([1n], "int64")), "to_int64_array", []));
  });

  it("step82 · compress / decompress", async () => {
    // compress / decompress
    const perr = (fn: () => unknown): string => {
      try {
        fn();
      } catch (e) {
        return (e as Error).message;
      }
      return "<没抛>";
    };
    const bb = (ns: number[]): Variant => V.object(GBytes.of(ns, "byte"));
    const hex = (v: Variant): string => String(method(v, "hex_encode", []).v);
    const hello: number[] = [...new TextEncoder().encode("hello hello hello")];
    const vectors: Array<[string, number[]]> = [["6 字节", [1, 2, 3, 1, 2, 3]], ["64 个 A", new Array(64).fill(65)], ["17 字节文本", hello]];
    const godotHex: Record<string, string[]> = {
      "1": ["789c6364626664620600002c000d", "789c7374a40c0000107e1041", "789ccb48cdc9c957c84090003a2e067d"],
      "2": ["28b52ffd2006310000010203010203", "28b52ffd20404500001041410100930016", "28b52ffd20116500003068656c6c6f200100314a11"],
      "3": ["1f8b080000000000000a636462666462060087d716b806000000", "1f8b080000000000000a7374a40c00003c624c4140000000", "1f8b080000000000000acb48cdc9c957c84090008088f9e511000000"],
    };
    for (const mode of ["1", "2", "3"]) {
      vectors.forEach(([name, ns], i) => {
        const c = method(bb(ns), "compress", [I(Number(mode))]);
        eq(`step82`, `compress(${mode}) 在「${name}」上的字节与 Godot 逐字节相同、decompress 再还原`,
          `${hex(c)} ${show(method(c, "decompress", [I(ns.length), I(Number(mode))]))}`,
          `${godotHex[mode]![i]} ${show(bb(ns))}`);
      });
    }
    eq("step82", "空 pack 压哪种模式都给空 pack（—— node 的 deflateSync 反倒给 8 字节，这一格必须照 Godot）",
      `${show(method(bb([]), "compress", [I(1)]))} ${show(method(bb([]), "compress", [I(2)]))} ${show(method(bb([]), "compress", [I(3)]))}`,
      "[] [] []");
    eq("step82", "越界的模式给空 pack（实测的 4 / 9 / -1 三格，compress 与 decompress 都是）",
      `${show(method(bb([1, 2, 3]), "compress", [I(4)]))} ${show(method(bb([1, 2, 3]), "compress", [I(9)]))} ${show(method(bb([1, 2, 3]), "compress", [I(-1)]))} ${show(method(bb([1, 2, 3]), "decompress", [I(6), I(4)]))}`,
      "[] [] [] []");
    const c1 = method(bb(hello), "compress", [I(1)]);
    const back20 = method(c1, "decompress", [I(20), I(1)]);
    eq("step82", "expected_size 的三条口径：0 与负数给空 pack、**比真身小也给空 pack**（不是截断！那是 mode 0 的行为）、比真身大不补零",
      `${show(method(c1, "decompress", [I(0), I(1)]))} ${show(method(c1, "decompress", [I(-1), I(1)]))} ${show(method(c1, "decompress", [I(5), I(1)]))} ${(back20.v as GBytes).length} ${show(back20)}`,
      `[] [] [] 17 [104, 101, 108, 108, 111, 32, 104, 101, 108, 108, 111, 32, 104, 101, 108, 108, 111]`);
    eq("step82", "垃圾数据解不出来给空 pack（三种模式一致，Godot 另打一句引擎 stderr）",
      `${show(method(bb([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]), "decompress", [I(17), I(1)]))} ${show(method(bb([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]), "decompress", [I(17), I(3)]))}`,
      "[] []");
    shouldThrow("step82", "compress(0)（不写模式时的默认值）没对上任何 node 编解码器 → 响亮拒，不发近似字节", () =>
      method(bb([1, 2, 3, 1, 2, 3]), "compress", [I(0)]));
    shouldThrow("step82", "compress() 零参同样是 mode 0 → 同一句响（量到它给 17 字节的「头部 + 原字节 + 补零」）", () =>
      method(bb([1]), "compress", []));
    shouldThrow("step82", "decompress 不写模式 = mode 0 → 也响", () => method(bb([1, 2, 3]), "decompress", [I(6)]));
    eq("step82", "模式实参只量过 int：给 float 响亮拒（不拿「int 槽会截断」那条推）",
      perr(() => method(bb([1, 2, 3]), "compress", [F(1.5)])), "compress() / decompress() 的模式只实测过 int（收到 float）");
    shouldThrow("step82", "compress / decompress 只在 PackedByteArray 上量过，别的形状仍响亮拒", () =>
      method(V.object(GBytes.of([1], "int32")), "compress", [I(1)]));
    eq("step82", "compress 不动 self，返回的还是 PackedByteArray（typeof 29）",
      (() => {
        const p = bb([1, 2, 3, 1, 2, 3]);
        const c = method(p, "compress", [I(1)]);
        return `${show(p)} ${typeOf(c).v}`;
      })(),
      "[1, 2, 3, 1, 2, 3] 29");
  });

  it("219 +2 · pack 一族的明账：带引擎 stderr 或跑期才响的形状钉在这里", async () => {
    // pack 一族的明账：带引擎 stderr 或跑期才响的形状钉在这里
    const errText102 = (fn: () => unknown): string => {
      try {
        const r = fn();
        return `没抛：${String(r)}`;
      } catch (e) {
        return e instanceof Error ? e.message : String(e);
      }
    };
    const mk = (kind: Parameters<typeof packCtor>[0], items: Variant[]): Variant => packCtor(kind, [V.array(GArray.of(items))]);
    const byte3 = () => mk("byte", [I(1), I(2), I(3)]);
    const i323 = () => mk("int32", [I(1), I(2), I(3)]);
    const str2 = () => mk("string", [S("a"), S("b")]);
    const v21 = () => mk("vector2", [vector2(1, 2)]);

    eq("219", "remove_at_copy 在量过的四支上都是 Nonexistent（系列；它此前挂在「没实测」那张表）",
      errText102(() => method(byte3(), "remove_at_copy", [I(0)])),
      "Invalid call. Nonexistent function 'remove_at_copy' in base 'PackedByteArray'.");
    eq("219", "compress / decompress 在其余八支上全部 Nonexistent（八格，step 82 那句「只在 byte 量过」升级成实测文本）",
      `${errText102(() => method(i323(), "compress", [I(1)]))} || ${errText102(() => method(v21(), "decompress", [I(9), I(1)]))}`,
      "Invalid call. Nonexistent function 'compress' in base 'PackedInt32Array'. || Invalid call. Nonexistent function 'decompress' in base 'PackedVector2Array'.");
    eq("223", "Array 与 Dictionary 上也根本没有 join（j2 / j6 / j7：它是 String 的方法）",
      `${errText102(() => method(V.array(GArray.of([I(1), I(2)])), "join", [S("-")]))} || ${errText102(() => method(V.dict(new GDict()), "join", [S("-")]))}`,
      "Invalid call. Nonexistent function 'join' in base 'Array'. || Invalid call. Nonexistent function 'join' in base 'Dictionary'.");
    eq("300", "Array 上也没有 concat（那是 JS 的 API：String / Array / Dictionary 三族 180 名逐个过裁判，唯一那一格幽灵名）",
      errText102(() => method(V.array(GArray.of([I(1), I(2)])), "concat", [V.array(GArray.of([I(3)]))])),
      "Invalid call. Nonexistent function 'concat' in base 'Array'.");
    eq("219", "join 九支全都没有（这一轮补了 byte / i64 / f32 / v3 / color 五支，与此前四支合成整族）",
      errText102(() => method(str2(), "join", [S("-")])),
      "Invalid call. Nonexistent function 'join' in base 'PackedStringArray'.");
    eq("219", "bsearch_custom 在 byte 与 v2 上量到不存在（其余七支仍未量 → 走「没实测」那条响）",
      `${errText102(() => method(byte3(), "bsearch_custom", [S(""), I(1)]))} || ${errText102(() => method(v21(), "bsearch_custom", [S(""), I(1)]))}`,
      "Invalid call. Nonexistent function 'bsearch_custom' in base 'PackedByteArray'. || Invalid call. Nonexistent function 'bsearch_custom' in base 'PackedVector2Array'.");
    eq("218", "下标位给 float 是**向零截断**、不报错（c1–c5：读 / 写 / set / insert / remove_at 五格）",
      (() => {
        const p = byte3();
        const read = show(index(p, F(1.5)));
        writeIdx(p, F(1.5), I(5));
        method(p, "set", [F(1.5), I(6)]);
        method(p, "insert", [F(0.9), I(4)]);
        method(p, "remove_at", [F(2.7)]);
        return `${read} ${show(p)}`;
      })(),
      "2 [4, 1, 3]");
    const sizeOf = (v: Variant): unknown => method(v, "size", []).v;
    eq(
      "218",
      "模式 5 与 -2 都给空 pack（越界范围从 4 / 9 / -1 扩到这两格），decompress 的模式 5 也是空 pack",
      `${sizeOf(method(byte3(), "compress", [I(5)]))} ${sizeOf(method(byte3(), "compress", [I(-2)]))} ${sizeOf(method(method(byte3(), "compress", [I(1)]), "decompress", [I(9), I(5)]))}`,
      "0 0 0",
    );
  });
});
