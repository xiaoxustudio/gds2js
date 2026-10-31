/**
 * `Array.sort()` 自己那条比较器（S357）：**一格一个 it，钉「排完的打印与引擎一字一样」**。
 * 三份读数共 129 格：`tmp/probe-argtype/sortcmp.txt`（46 格，形对形与同形）/ `sortcmp2.txt`（67 格：同形倒序、跨形两向、n>16 的混排）/
 * `sortcmp3.txt`（16 格：bool 掺进数值，与 21 / 22 / 24 元素的混排整串），尺 `{fold25,fold26,fold27}.mts`（每格包进一个小函数，一次 spawn 量一批）。
 * 判据三条：① **形不同只有 int 对 float 有方向**（按值；bool 掺进数值里不比、null 也不是「永远最小」）；
 * ② **形相同才比值**：串按码点（`é` 排在 `z` 之后）、四个向量按分量、RID 按无符号号、数组走装箱那条序、bool 是 false 在前；
 * ③ null / Dictionary / Color / NodePath / pack / Callable 同形也**比不出**（两向都不换位、引擎也不报错），
 *    StringName 走 intern 之后的指针序（`[&"ab", &"b"]` 与文字序相反）复现不了 —— 响亮拒。
 * 置换不是 JS 的稳定 sort：`packages/runtime/src/runtime/sort.ts` 那份 `sort_array.h` 转写，读数末三行（21 / 22 / 24 元素）钉的就是它的输出。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";
import { dictOf } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/packed";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { vector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";
import { color } from "@gds2js/runtime/runtime/color";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { rid } from "@gds2js/runtime/runtime/rid";
import { callableOf, nullCallable } from "@gds2js/runtime/runtime/object";
import { sortLess } from "@gds2js/runtime/runtime/ops";

function sortedShow(els: Variant[]): string {
  const g = GArray.of(els);
  g.sort(sortLess);
  return show(V.array(g));
}

const CELLS: Array<[Variant[], string, string]> = [
  [[V.int(1n), V.int(2n)], "[1, 2]", "int [1, 2]"],
  [[V.int(1n), V.int(1n)], "[1, 1]", "int 等值 [1, 1]"],
  [[V.float(1.5), V.float(2.5)], "[1.5, 2.5]", "float [1.5, 2.5]"],
  [[V.float(1.0), V.int(1n)], "[1.0, 1]", "float 与 int 同值 [1.0, 1]"],
  [[V.int(1n), V.float(1.0)], "[1, 1.0]", "int 与 float 同值 [1, 1.0]"],
  [[V.float(NaN), V.float(1.5)], "[nan, 1.5]", "NAN 与 float [NAN, 1.5]"],
  [[V.float(1.5), V.float(NaN)], "[1.5, nan]", "float 与 NAN [1.5, NAN]"],
  [[V.bool(false), V.bool(true)], "[false, true]", "bool [false, true]"],
  [[V.str("a"), V.str("b")], "[\"a\", \"b\"]", "String [\"a\", \"b\"]"],
  [[V.str("A"), V.str("a")], "[\"A\", \"a\"]", "String 大小写 [\"A\", \"a\"]"],
  [[V.str("b"), V.str("ab")], "[\"ab\", \"b\"]", "String 长度 [\"b\", \"ab\"]"],
  [[nodePathValue("a"), nodePathValue("b")], "[^\"a\", ^\"b\"]", "NodePath [^\"a\", ^\"b\"]"],
  [[nodePathValue("z"), nodePathValue("a/b")], "[^\"z\", ^\"a/b\"]", "NodePath 多层 [^\"z\", ^\"a/b\"]"],
  [[vector2(0, 3), vector2(1, 2)], "[(0.0, 3.0), (1.0, 2.0)]", "Vector2 [Vector2(0, 3), Vector2(1, 2)]"],
  [[vector2(1, 2), vector2(1, 5)], "[(1.0, 2.0), (1.0, 5.0)]", "Vector2 同 x [Vector2(1, 2), Vector2(1, 5)]"],
  [[vector2i(0, 3), vector2i(1, 2)], "[(0, 3), (1, 2)]", "Vector2i [Vector2i(0, 3), Vector2i(1, 2)]"],
  [[vector3(0, 9, 9), vector3(1, 2, 3)], "[(0.0, 9.0, 9.0), (1.0, 2.0, 3.0)]", "Vector3 [Vector3(0, 9, 9), Vector3(1, 2, 3)]"],
  [[vector3i(0, 9, 9), vector3i(1, 2, 3)], "[(0, 9, 9), (1, 2, 3)]", "Vector3i [Vector3i(0, 9, 9), Vector3i(1, 2, 3)]"],
  [[color(0, 1, 0, 1), color(1, 0, 0, 1)], "[(0.0, 1.0, 0.0, 1.0), (1.0, 0.0, 0.0, 1.0)]", "Color [Color(0, 1, 0, 1), Color(1, 0, 0, 1)]"],
  [[rid(BigInt(7)), rid(BigInt(8))], "[RID(7), RID(8)]", "RID [rid_from_int64(7), rid_from_int64(8)]"],
  [[dictOf([[V.str("a"), V.int(1n)]]), dictOf([[V.str("b"), V.int(1n)]])], "[{ \"a\": 1 }, { \"b\": 1 }]", "Dictionary [{\"a\": 1}, {\"b\": 1}]"],
  [[V.array(GArray.of([V.int(1n)])), V.array(GArray.of([V.int(2n)]))], "[[1], [2]]", "Array [[1], [2]]"],
  [[V.array(GArray.of([V.int(1n), V.int(2n)])), V.array(GArray.of([V.int(1n)]))], "[[1], [1, 2]]", "Array 长度 [[1, 2], [1]]"],
  [[V.object(GBytes.of([1], "int32")), V.object(GBytes.of([2], "int32"))], "[[1], [2]]", "PackedInt32Array [PackedInt32Array([1]), PackedInt32Array([2])]"],
  [[V.object(GBytes.of(["a"], "string")), V.object(GBytes.of(["b"], "string"))], "[[\"a\"], [\"b\"]]", "PackedStringArray [PackedStringArray([\"a\"]), PackedStringArray([\"b\"])]"],
  [[V.object(GBytes.of([1], "byte")), V.object(GBytes.of([2], "byte"))], "[[1], [2]]", "PackedByteArray [PackedByteArray([1]), PackedByteArray([2])]"],
  [[V.nil(), V.nil()], "[<null>, <null>]", "null 两个 [null, null]"],
  [[V.int(1n), V.str("a")], "[1, \"a\"]", "String 对 int [1, \"a\"]"],
  [[V.str("a"), V.int(1n)], "[\"a\", 1]", "int 对 String [\"a\", 1]"],
  [[V.str("a"), V.stringName("a")], "[\"a\", &\"a\"]", "StringName 对 String [\"a\", &\"a\"]"],
  [[V.stringName("a"), V.str("a")], "[&\"a\", \"a\"]", "String 对 StringName [&\"a\", \"a\"]"],
  [[V.str("a"), V.stringName("b")], "[\"a\", &\"b\"]", "StringName 对 String 反 [\"a\", &\"b\"]"],
  [[V.int(1n), V.bool(true)], "[1, true]", "bool 对 int [1, true]"],
  [[V.bool(true), V.int(1n)], "[true, 1]", "int 对 bool [true, 1]"],
  [[V.float(0.5), V.bool(true)], "[0.5, true]", "bool 对 float [0.5, true]"],
  [[V.int(1n), V.nil()], "[1, <null>]", "null 对 int [1, null]"],
  [[V.nil(), V.int(1n)], "[<null>, 1]", "int 对 null [null, 1]"],
  [[vector2i(1, 1), vector2(1, 1)], "[(1, 1), (1.0, 1.0)]", "Vector2 对 Vector2i [Vector2i(1, 1), Vector2(1, 1)]"],
  [[V.array(GArray.of([V.int(1n)])), V.object(GBytes.of([1], "int32"))], "[[1], [1]]", "pack 对 Array [[1], PackedInt32Array([1])]"],
  [[V.str("a"), color(1, 0, 0, 1)], "[\"a\", (1.0, 0.0, 0.0, 1.0)]", "Color 对 String [\"a\", Color(1, 0, 0, 1)]"],
  [[V.int(7n), rid(BigInt(7))], "[7, RID(7)]", "RID 对 int [7, rid_from_int64(7)]"],
  [[V.str("a"), V.int(1n), V.nil()], "[\"a\", 1, <null>]", "混三形 [\"a\", 1, null]"],
  [[V.int(1n), V.float(2.5), V.bool(true), V.nil(), V.str("s"), V.stringName("n"), nodePathValue("p"), vector2(1, 2), vector2i(1, 2), vector3(1, 2, 3), vector3i(1, 2, 3), color(1, 0, 0, 1), rid(BigInt(7))], "[1, 2.5, true, <null>, \"s\", &\"n\", ^\"p\", (1.0, 2.0), (1, 2), (1.0, 2.0, 3.0), (1, 2, 3), (1.0, 0.0, 0.0, 1.0), RID(7)]", "混十三形 [1, 2.5, true, null, \"s\", &\"n\", ^\"p\", Vector2(1, 2), Vector2i(1, 2), Vector3(1, 2, 3), Vector3i(1, 2, 3), Color(1, 0, 0, 1), rid_from_int64(7)]"],
  [[V.int(2n), V.int(1n)], "[1, 2]", "int [2, 1]"],
  [[V.float(2.5), V.float(1.5)], "[1.5, 2.5]", "float [2.5, 1.5]"],
  [[V.bool(true), V.bool(false)], "[false, true]", "bool [true, false]"],
  [[V.str("b"), V.str("a")], "[\"a\", \"b\"]", "String [\"b\", \"a\"]"],
  [[V.str("a"), V.str("A")], "[\"A\", \"a\"]", "String 大小写 [\"a\", \"A\"]"],
  [[V.str("ab"), V.str("b")], "[\"ab\", \"b\"]", "String 长度 [\"ab\", \"b\"]"],
  [[V.str("é"), V.str("z")], "[\"z\", \"é\"]", "String 码点高 [\"é\", \"z\"]"],
  [[nodePathValue("b"), nodePathValue("a")], "[^\"b\", ^\"a\"]", "NodePath [^\"b\", ^\"a\"]"],
  [[nodePathValue("a/b"), nodePathValue("z")], "[^\"a/b\", ^\"z\"]", "NodePath 多层 [^\"a/b\", ^\"z\"]"],
  [[nodePathValue("a"), nodePathValue("a/b")], "[^\"a\", ^\"a/b\"]", "NodePath 段数 [^\"a\", ^\"a/b\"]"],
  [[vector2(1, 2), vector2(0, 3)], "[(0.0, 3.0), (1.0, 2.0)]", "Vector2 [Vector2(1, 2), Vector2(0, 3)]"],
  [[vector2(1, 5), vector2(1, 2)], "[(1.0, 2.0), (1.0, 5.0)]", "Vector2 同 x [Vector2(1, 5), Vector2(1, 2)]"],
  [[vector2i(1, 2), vector2i(0, 3)], "[(0, 3), (1, 2)]", "Vector2i [Vector2i(1, 2), Vector2i(0, 3)]"],
  [[vector3(1, 2, 3), vector3(0, 9, 9)], "[(0.0, 9.0, 9.0), (1.0, 2.0, 3.0)]", "Vector3 [Vector3(1, 2, 3), Vector3(0, 9, 9)]"],
  [[vector3(1, 5, 1), vector3(1, 2, 9)], "[(1.0, 2.0, 9.0), (1.0, 5.0, 1.0)]", "Vector3 同 x [Vector3(1, 5, 1), Vector3(1, 2, 9)]"],
  [[vector3i(1, 2, 3), vector3i(0, 9, 9)], "[(0, 9, 9), (1, 2, 3)]", "Vector3i [Vector3i(1, 2, 3), Vector3i(0, 9, 9)]"],
  [[color(1, 0, 0, 1), color(0, 1, 0, 1)], "[(1.0, 0.0, 0.0, 1.0), (0.0, 1.0, 0.0, 1.0)]", "Color [Color(1, 0, 0, 1), Color(0, 1, 0, 1)]"],
  [[color(1, 1, 0, 1), color(1, 0, 0, 1)], "[(1.0, 1.0, 0.0, 1.0), (1.0, 0.0, 0.0, 1.0)]", "Color 同 r [Color(1, 1, 0, 1), Color(1, 0, 0, 1)]"],
  [[rid(BigInt(8)), rid(BigInt(7))], "[RID(7), RID(8)]", "RID [rid_from_int64(8), rid_from_int64(7)]"],
  [[rid(BigInt(-1)), rid(BigInt(1))], "[RID(1), RID(-1)]", "RID 负号 [rid_from_int64(-1), rid_from_int64(1)]"],
  [[dictOf([[V.str("b"), V.int(1n)]]), dictOf([[V.str("a"), V.int(1n)]])], "[{ \"b\": 1 }, { \"a\": 1 }]", "Dictionary [{\"b\": 1}, {\"a\": 1}]"],
  [[dictOf([[V.str("a"), V.int(1n)], [V.str("b"), V.int(2n)]]), dictOf([[V.str("a"), V.int(1n)]])], "[{ \"a\": 1, \"b\": 2 }, { \"a\": 1 }]", "Dictionary 大小 [{\"a\": 1, \"b\": 2}, {\"a\": 1}]"],
  [[V.array(GArray.of([V.int(2n)])), V.array(GArray.of([V.int(1n)]))], "[[1], [2]]", "Array [[2], [1]]"],
  [[V.array(GArray.of([V.int(1n), V.int(2n)])), V.array(GArray.of([V.int(1n)]))], "[[1], [1, 2]]", "Array 长度 [[1, 2], [1]]"],
  [[V.array(GArray.of([V.int(1n)])), V.array(GArray.of([]))], "[[], [1]]", "Array 空与非空 [[1], []]"],
  [[V.object(GBytes.of([2], "int32")), V.object(GBytes.of([1], "int32"))], "[[2], [1]]", "PackedInt32Array [PackedInt32Array([2]), PackedInt32Array([1])]"],
  [[V.object(GBytes.of(["b"], "string")), V.object(GBytes.of(["a"], "string"))], "[[\"b\"], [\"a\"]]", "PackedStringArray [PackedStringArray([\"b\"]), PackedStringArray([\"a\"])]"],
  [[V.object(GBytes.of([2], "byte")), V.object(GBytes.of([1], "byte"))], "[[2], [1]]", "PackedByteArray [PackedByteArray([2]), PackedByteArray([1])]"],
  [[V.nil(), V.nil()], "[<null>, <null>]", "null 两个 [null, null]"],
  [[V.int(1n), V.int(1n)], "[1, 1]", "int 同值 [1, 1]"],
  [[V.int(1n), V.float(1.0)], "[1, 1.0]", "float 与 int 同值 [1, 1.0]"],
  [[V.float(1.0), V.int(1n)], "[1.0, 1]", "float 与 int 同值反 [1.0, 1]"],
  [[V.float(NaN), V.float(1.5)], "[nan, 1.5]", "NAN 与 float [NAN, 1.5]"],
  [[V.float(1.5), V.float(NaN)], "[1.5, nan]", "float 与 NAN [1.5, NAN]"],
  [[V.int(1n), V.float(2.5)], "[1, 2.5]", "int 对 float [1, 2.5]"],
  [[V.float(2.5), V.int(1n)], "[1, 2.5]", "float 对 int [2.5, 1]"],
  [[V.float(2.5), V.int(1n)], "[1, 2.5]", "int 对 float 反 [2.5, 1]"],
  [[V.int(1n), V.float(2.5)], "[1, 2.5]", "float 对 int 反 [1, 2.5]"],
  [[vector2(3, 3), vector2i(1, 1)], "[(3.0, 3.0), (1, 1)]", "Vector2 对 Vector2i [Vector2(3, 3), Vector2i(1, 1)]"],
  [[vector2i(1, 1), vector2(3, 3)], "[(1, 1), (3.0, 3.0)]", "Vector2i 对 Vector2 [Vector2i(1, 1), Vector2(3, 3)]"],
  [[V.object(GBytes.of([9], "int32")), V.array(GArray.of([V.int(1n)]))], "[[9], [1]]", "pack 对 Array [PackedInt32Array([9]), [1]]"],
  [[V.array(GArray.of([V.int(1n)])), V.object(GBytes.of([9], "int32"))], "[[1], [9]]", "Array 对 pack [[1], PackedInt32Array([9])]"],
  [[color(1, 0, 0, 1), V.str("a")], "[(1.0, 0.0, 0.0, 1.0), \"a\"]", "Color 对 String [Color(1, 0, 0, 1), \"a\"]"],
  [[V.str("a"), color(1, 0, 0, 1)], "[\"a\", (1.0, 0.0, 0.0, 1.0)]", "String 对 Color [\"a\", Color(1, 0, 0, 1)]"],
  [[rid(BigInt(7)), V.int(7n)], "[RID(7), 7]", "RID 对 int [rid_from_int64(7), 7]"],
  [[V.int(7n), rid(BigInt(7))], "[7, RID(7)]", "int 对 RID [7, rid_from_int64(7)]"],
  [[dictOf([[V.str("a"), V.int(1n)]]), V.array(GArray.of([V.int(1n)]))], "[{ \"a\": 1 }, [1]]", "Dict 对 Array [{\"a\": 1}, [1]]"],
  [[V.array(GArray.of([V.int(1n)])), dictOf([[V.str("a"), V.int(1n)]])], "[[1], { \"a\": 1 }]", "Array 对 Dict [[1], {\"a\": 1}]"],
  [[V.nil(), V.str("a")], "[<null>, \"a\"]", "null 对 String [null, \"a\"]"],
  [[V.str("a"), V.nil()], "[\"a\", <null>]", "String 对 null [\"a\", null]"],
  [[vector3(9, 9, 9), vector3i(1, 1, 1)], "[(9.0, 9.0, 9.0), (1, 1, 1)]", "V3 对 V3i [Vector3(9, 9, 9), Vector3i(1, 1, 1)]"],
  [[vector3i(1, 1, 1), vector3(9, 9, 9)], "[(1, 1, 1), (9.0, 9.0, 9.0)]", "V3i 对 V3 [Vector3i(1, 1, 1), Vector3(9, 9, 9)]"],
  [[nodePathValue("b"), V.stringName("a")], "[^\"b\", &\"a\"]", "NodePath 对 StringName [^\"b\", &\"a\"]"],
  [[V.stringName("a"), nodePathValue("b")], "[&\"a\", ^\"b\"]", "StringName 对 NodePath [&\"a\", ^\"b\"]"],
  [[V.int(16n), V.int(0n), V.int(15n), V.int(1n), V.int(14n), V.int(2n), V.int(13n), V.int(3n), V.int(12n), V.int(4n), V.int(11n), V.int(5n), V.int(10n), V.int(6n), V.int(9n), V.int(7n), V.int(8n)], "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]", "混十七乱序 int [16, 0, 15, 1, 14, 2, 13, 3, 12, 4, 11, 5, 10, 6, 9, 7, 8]"],
  [[V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n), V.int(0n)], "[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]", "混十七全等 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]"],
  [[V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n), V.int(1n), V.int(0n)], "[0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1]", "混十八两键 [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]"],
  [[V.int(20n), V.str("t"), V.int(19n), V.float(1.5), V.nil(), V.stringName("n"), nodePathValue("p"), vector2(1, 2), vector2i(1, 2), vector3(1, 2, 3), vector3i(1, 2, 3), color(1, 0, 0, 1), rid(BigInt(7)), V.array(GArray.of([V.int(1n)])), dictOf([[V.str("a"), V.int(1n)]]), V.object(GBytes.of([1], "int32")), V.int(3n), V.float(2.5), V.bool(true), V.int(1n)], "[1, true, 2.5, 3, [1], { \"a\": 1 }, [1], RID(7), (1.0, 0.0, 0.0, 1.0), (1, 2, 3), (1.0, 2.0, 3.0), (1, 2), (1.0, 2.0), ^\"p\", &\"n\", <null>, 1.5, 19, \"t\", 20]", "混二十跨形 [20, \"t\", 19, 1.5, null, &\"n\", ^\"p\", Vector2(1, 2), Vector2i(1, 2), Vector3(1, 2, 3), Vector3i(1, 2, 3), Color(1, 0, 0, 1), rid_from_int64(7), [1], {\"a\": 1}, PackedInt32Array([1]), 3, 2.5, true, 1]"],
  [[V.int(1n), V.int(2n), V.int(3n), V.int(4n), V.int(5n), V.int(6n), V.int(7n), V.int(8n), V.int(9n), V.int(10n), V.int(11n), V.int(12n), V.int(13n), V.int(14n), V.int(15n), V.int(16n), V.int(17n), V.str("z"), V.str("y"), V.str("x"), V.str("w"), V.str("v"), V.str("u"), V.str("t"), V.str("s")], "[\"s\", \"t\", \"u\", \"v\", \"w\", \"x\", \"y\", \"z\", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]", "混廿一串 [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, \"z\", \"y\", \"x\", \"w\", \"v\", \"u\", \"t\", \"s\"]"],
  [[V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n), V.int(1n), V.int(2n)], "[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]", "混廿五重复 [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]"],
  [[V.int(1n), V.float(2.5), V.bool(true), V.nil(), V.str("s"), V.stringName("n"), nodePathValue("p"), vector2(1, 2), vector2i(1, 2), vector3(1, 2, 3), vector3i(1, 2, 3), color(1, 0, 0, 1), rid(BigInt(7))], "[1, 2.5, true, <null>, \"s\", &\"n\", ^\"p\", (1.0, 2.0), (1, 2), (1.0, 2.0, 3.0), (1, 2, 3), (1.0, 0.0, 0.0, 1.0), RID(7)]", "混十三跨形 [1, 2.5, true, null, \"s\", &\"n\", ^\"p\", Vector2(1, 2), Vector2i(1, 2), Vector3(1, 2, 3), Vector3i(1, 2, 3), Color(1, 0, 0, 1), rid_from_int64(7)]"],
  [[V.bool(true), V.float(0.5)], "[true, 0.5]", "bool 对 float 该换 [true, 0.5]"],
  [[V.float(0.5), V.bool(true)], "[0.5, true]", "bool 对 float 不换 [0.5, true]"],
  [[V.bool(false), V.int(1n)], "[false, 1]", "false 对 int 该换 [false, 1]"],
  [[V.int(1n), V.bool(false)], "[1, false]", "false 对 int 不换 [1, false]"],
  [[V.bool(true), V.int(1n)], "[true, 1]", "bool 对 int 等值 [true, 1]"],
  [[V.int(1n), V.bool(true)], "[1, true]", "bool 对 int 等值反 [1, true]"],
  [[V.bool(false), V.int(0n)], "[false, 0]", "false 对 0 [false, 0]"],
  [[V.int(0n), V.bool(false)], "[0, false]", "0 对 false [0, false]"],
  [[V.bool(true), V.bool(false)], "[false, true]", "bool 对 bool 反 [true, false]"],
  [[V.nil(), V.float(1.5)], "[<null>, 1.5]", "null 对 float [null, 1.5]"],
  [[V.float(1.5), V.nil()], "[1.5, <null>]", "float 对 null [1.5, null]"],
  [[V.bool(true), V.int(1n), V.bool(false), V.int(0n), V.int(2n), V.float(1.5), V.bool(false), V.bool(true), V.int(3n), V.float(0.5), V.int(4n), V.bool(true), V.float(2.5), V.int(5n), V.bool(false), V.int(1n), V.int(6n), V.int(0n), V.int(7n), V.bool(true), V.int(8n)], "[0, 1, 8, true, 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, false, false, false, true, true, true]", "廿一 bool 混数值 [true, 1, false, 0, 2, 1.5, false, true, 3, 0.5, 4, true, 2.5, 5, false, 1, 6, 0, 7, true, 8]"],
  [[V.str("m"), V.int(1n), V.str("n"), V.int(2n), V.str("o"), V.int(3n), V.str("p"), V.int(4n), V.str("q"), V.int(5n), V.str("r"), V.int(6n), V.str("s"), V.int(7n), V.str("t"), V.int(8n), V.str("u"), V.int(9n), V.str("v"), V.int(10n), V.str("w"), V.int(11n)], "[1, 11, \"w\", 2, 3, 10, \"v\", 4, 5, 9, \"u\", 6, 7, 8, \"m\", \"n\", \"o\", \"p\", \"q\", \"r\", \"s\", \"t\"]", "廿二串与数 [\"m\", 1, \"n\", 2, \"o\", 3, \"p\", 4, \"q\", 5, \"r\", 6, \"s\", 7, \"t\", 8, \"u\", 9, \"v\", 10, \"w\", 11]"],
  [[vector2(1, 1), V.str("a"), vector2(0, 5), V.str("b"), vector2(2, 0), V.str("c"), vector2(-1, 9), V.str("d"), vector2(3, 3), V.str("e"), vector2(1, 0), V.str("f"), vector2(0, 0), V.str("g"), vector2(5, 5), V.str("h"), vector2(2, 2), V.str("i"), vector2(-2, -2), V.str("j"), vector2(4, 1), V.str("k"), vector2(1, 5), V.str("l")], "[\"c\", \"d\", \"e\", \"f\", \"g\", \"h\", \"i\", \"j\", \"k\", \"l\", (-2.0, -2.0), (-1.0, 9.0), (0.0, 0.0), (1.0, 0.0), (2.0, 0.0), (2.0, 2.0), (3.0, 3.0), (5.0, 5.0), \"b\", (0.0, 5.0), (4.0, 1.0), \"a\", (1.0, 1.0), (1.0, 5.0)]", "廿四向量混串 [Vector2(1, 1), \"a\", Vector2(0, 5), \"b\", Vector2(2, 0), \"c\", Vector2(-1, 9), \"d\", Vector2(3, 3), \"e\", Vector2(1, 0), \"f\", Vector2(0, 0), \"g\", Vector2(5, 5), \"h\", Vector2(2, 2), \"i\", Vector2(-2, -2), \"j\", Vector2(4, 1), \"k\", Vector2(1, 5), \"l\"]"],
  [[nullCallable(), callableOf(() => V.nil(), 0)], "[null::null, <anonymous lambda>(lambda)]", "Callable 两支：引擎比不出"],
  [[callableOf(() => V.nil(), 0), nullCallable()], "[<anonymous lambda>(lambda), null::null]", "Callable 两支反向：原地不动"],
];

const REFUSE = "StringName 的 sort 序走 Godot 内部指针，实测 [&\"ab\"] 与 [&\"b\"] 的文字序、反序都对不上 —— 复现不了，响亮拒";

const REFUSALS: Array<[Variant[], string]> = [
  [[V.stringName("a"), V.stringName("b")], "StringName [&\"a\", &\"b\"]"],
  [[V.stringName("a"), V.stringName("zzz")], "StringName 文字序反 [&\"a\", &\"zzz\"]"],
  [[V.stringName("b"), V.stringName("a")], "StringName [&\"b\", &\"a\"]"],
  [[V.stringName("zzz"), V.stringName("a")], "StringName 文字反 [&\"zzz\", &\"a\"]"],
  [[V.stringName("ab"), V.stringName("b")], "StringName 长 [&\"ab\", &\"b\"]"],
  [[V.stringName("a"), V.stringName("a")], "StringName 同值 [&\"a\", &\"a\"]"],
];

describe("runtime/values · Array.sort() 自己那条比较器", () => {
  for (const [els, want, label] of CELLS) {
    it(label, () => {
      eq("360", label + " → " + want, sortedShow(els), want);
    });
  }
  for (const [els, label] of REFUSALS) {
    it(label + " 响亮拒", () => {
      let msg = "没抛";
      try {
        sortedShow(els);
      } catch (e) {
        msg = (e as Error).message;
      }
      eq("360", label, msg, REFUSE);
    });
  }
});
