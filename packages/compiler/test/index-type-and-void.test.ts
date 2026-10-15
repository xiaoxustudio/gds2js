/**
 * 下标型与 void 返回值这两族解析期拒（S404）：一格一脚本量回来的引擎原文，逐格对 analyze 的输出。
 * 尺 `tmp/probe-idxtype/{round1,round2,round3,round4}.mts` 与 `tmp/probe-voidnames/round1.mts`，
 * 读数 `compare{74,80,81,82}.txt` 与 `compare79.txt`。位置型基（Array / Array[k] / String / 八支 pack）的下标只收 int 与 float，
 * 其余型（含 null）给 `Invalid index type "<型>" for a base of type "<基名>".`；`Dictionary` 与推断出来的字典不在这条里。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const H = "extends SceneTree\n\nfunc _initialize():\n";

async function first(src: string): Promise<string> {
  const hit = analyze(lower(await parseSource(src)))[0];
  return hit?.message ?? "不拦";
}

const idx = (decl: string, key: string): string => `${H}${decl}\n\tprint(a[${key}])\n\tquit()\n`;
const idxWrite = (decl: string, key: string, val: string): string => `${H}${decl}\n\ta[${key}] = ${val}\n\tquit()\n`;
const voidCell = (decl: string, call: string): string => `${H}${decl}\n\tprint(${call})\n\tquit()\n`;

const ARR = "\tvar a = [1, 2]";
const ARR_T = "\tvar a: Array[int] = [1, 2]";
const ARR_BARE = "\tvar a: Array = [1, 2]";
const STR = '\tvar a: String = "abc"';
const STR_INF = '\tvar a = "abc"';
const DICT = "\tvar a = {1: 2}";
const DICT_T = "\tvar a: Dictionary = {1: 2}";

const REFUSE = (st: string, base: string): string => `Invalid index type "${st}" for a base of type "${base}".`;

const INDEX_CELLS: Array<[string, string, string]> = [
  ["推断 Array-bool", idx(ARR, "true"), REFUSE("bool", "Array")],
  ["推断 Array-String", idx(ARR, '"x"'), REFUSE("String", "Array")],
  ["推断 Array-Vector2", idx(ARR, "Vector2(1, 2)"), REFUSE("Vector2", "Array")],
  ["推断 Array-null", idx(ARR, "null"), REFUSE("null", "Array")],
  ["推断 Array-int", idx(ARR, "0"), "不拦"],
  ["推断 Array-float", idx(ARR, "1.5"), "不拦"],
  ["定形 Array-bool", idx(ARR_T, "true"), REFUSE("bool", "Array[int]")],
  ["定形 Array-String", idx(ARR_T, '"x"'), REFUSE("String", "Array[int]")],
  ["定形 Array-null", idx(ARR_T, "null"), REFUSE("null", "Array[int]")],
  ["定形 Array-int", idx(ARR_T, "0"), "不拦"],
  ["裸标注 Array-bool", idx(ARR_BARE, "true"), REFUSE("bool", "Array")],
  ["裸标注 Array-int", idx(ARR_BARE, "0"), "不拦"],
  ["Array 写-bool", idxWrite(ARR_BARE, "true", "7"), REFUSE("bool", "Array")],
  ["Array 写-String 键", idxWrite(ARR_T, '"x"', "7"), REFUSE("String", "Array[int]")],
  ["Array 写-float 键", idxWrite(ARR, "1.5", "7"), "不拦"],
  ["String-bool 键", idx(STR, "true"), REFUSE("bool", "String")],
  ["String-String 键", idx(STR, '"x"'), REFUSE("String", "String")],
  ["String-null 键", idx(STR, "null"), REFUSE("null", "String")],
  ["String-int 键", idx(STR, "0"), "不拦"],
  ["String-float 键", idx(STR, "1.5"), "不拦"],
  ["推断 String-bool 键", idx(STR_INF, "true"), REFUSE("bool", "String")],
  ["String 写-String 键", idxWrite(STR, '"x"', "7"), REFUSE("String", "String")],
  ["PackedInt32-bool 键", idx("\tvar a: PackedInt32Array = PackedInt32Array([1])", "true"), REFUSE("bool", "PackedInt32Array")],
  ["PackedInt32-null 键写", idxWrite("\tvar a: PackedInt32Array = PackedInt32Array([1])", "null", "7"), REFUSE("null", "PackedInt32Array")],
  ["PackedInt32-int 键", idx("\tvar a: PackedInt32Array = PackedInt32Array([1])", "0"), "不拦"],
  ["PackedByteArray-bool 键", idx("\tvar a: PackedByteArray = PackedByteArray([1])", "true"), REFUSE("bool", "PackedByteArray")],
  ["PackedInt64-bool 键", idx("\tvar a: PackedInt64Array = PackedInt64Array([1])", "true"), REFUSE("bool", "PackedInt64Array")],
  ["PackedFloat32-bool 键", idx("\tvar a: PackedFloat32Array = PackedFloat32Array([1])", "true"), REFUSE("bool", "PackedFloat32Array")],
  ["PackedFloat64-bool 键", idx("\tvar a: PackedFloat64Array = PackedFloat64Array([1])", "true"), REFUSE("bool", "PackedFloat64Array")],
  ["PackedString-bool 键", idx('\tvar a: PackedStringArray = PackedStringArray(["a"])', "true"), REFUSE("bool", "PackedStringArray")],
  ["PackedVector2-bool 键", idx("\tvar a: PackedVector2Array = PackedVector2Array([Vector2(1, 2)])", "true"), REFUSE("bool", "PackedVector2Array")],
  ["PackedVector3-bool 键", idx("\tvar a: PackedVector3Array = PackedVector3Array([Vector3(1, 2, 3)])", "true"), REFUSE("bool", "PackedVector3Array")],
  ["推断字典-bool 键", idx(DICT, "true"), "不拦"],
  ["标注字典-bool 键", idx(DICT_T, "true"), "不拦"],
  ["标注字典-String 键", idx(DICT_T, '"x"'), "不拦"],
  ["定形字典-int 键", idx('\tvar a: Dictionary[String, int] = {"x": 1}', "0"), REFUSE("int", "Dictionary[String, int]")],
  ["定形字典-String 键", idx('\tvar a: Dictionary[String, int] = {"x": 1}', '"nope"'), "不拦"],
  ["形参 Array-bool 键", "extends SceneTree\n\nfunc f(a: Array):\n\tprint(a[true])\n\nfunc _initialize():\n\tquit()\n", REFUSE("bool", "Array")],
  ["标注 int 名字作键", `${H}${ARR}\n\tvar k: int = 0\n\tprint(a[k])\n\tquit()\n`, "不拦"],
  ["标注 String 名字作键", `${H}${ARR}\n\tvar k: String = "x"\n\tprint(a[k])\n\tquit()\n`, REFUSE("String", "Array")],
];

const VOID_CELLS: Array<[string, string, string]> = [
  ["数组 append", voidCell(ARR, "a.append(2)"), 'Cannot get return value of call to "append()" because it returns "void".'],
  ["数组 append_array", voidCell(ARR, "a.append_array([3])"), 'Cannot get return value of call to "append_array()" because it returns "void".'],
  ["数组 sort", voidCell(ARR, "a.sort()"), 'Cannot get return value of call to "sort()" because it returns "void".'],
  ["数组 sort_custom", voidCell(ARR, "a.sort_custom(func(x, y): return x < y)"), 'Cannot get return value of call to "sort_custom()" because it returns "void".'],
  ["数组 reverse", voidCell(ARR, "a.reverse()"), 'Cannot get return value of call to "reverse()" because it returns "void".'],
  ["数组 shuffle", voidCell(ARR, "a.shuffle()"), 'Cannot get return value of call to "shuffle()" because it returns "void".'],
  ["数组 fill", voidCell(ARR, "a.fill(9)"), 'Cannot get return value of call to "fill()" because it returns "void".'],
  ["数组 erase", voidCell(ARR, "a.erase(1)"), 'Cannot get return value of call to "erase()" because it returns "void".'],
  ["数组 remove_at", voidCell(ARR, "a.remove_at(0)"), 'Cannot get return value of call to "remove_at()" because it returns "void".'],
  ["数组 make_read_only", voidCell(ARR, "a.make_read_only()"), 'Cannot get return value of call to "make_read_only()" because it returns "void".'],
  ["数组 insert 不是 void", voidCell(ARR, "a.insert(0, 3)"), "不拦"],
  ["数组 resize 不是 void", voidCell(ARR, "a.resize(4)"), "不拦"],
  ["数组 pop_back 不是 void", voidCell(ARR, "a.pop_back()"), "不拦"],
  ["数组 pick_random 不是 void", voidCell(ARR, "a.pick_random()"), "不拦"],
  ["数组 has 不是 void", voidCell(ARR, "a.has(1)"), "不拦"],
  ["字典 sort", voidCell(DICT, "a.sort()"), 'Cannot get return value of call to "sort()" because it returns "void".'],
  ["字典 merge", voidCell(DICT, 'a.merge({"z": 2})'), 'Cannot get return value of call to "merge()" because it returns "void".'],
  ["字典 assign", voidCell(DICT, 'a.assign({"z": 2})'), 'Cannot get return value of call to "assign()" because it returns "void".'],
  ["字典 clear", voidCell(DICT, "a.clear()"), 'Cannot get return value of call to "clear()" because it returns "void".'],
  ["字典 make_read_only", voidCell(DICT, "a.make_read_only()"), 'Cannot get return value of call to "make_read_only()" because it returns "void".'],
  ["字典 set 不是 void", voidCell(DICT, 'a.set("a", 2)'), "不拦"],
  ["字典 erase 不是 void", voidCell(DICT, 'a.erase("a")'), "不拦"],
  ["字典 merged 不是 void", voidCell(DICT, 'a.merged({"z": 2})'), "不拦"],
  ["字典 get_or_add 不是 void", voidCell(DICT, 'a.get_or_add("z", 2)'), "不拦"],
];

describe("位置型基的下标型拒", () => {
  for (const [label, src, want] of INDEX_CELLS) {
    it(label, async () => eq("404", label, await first(src), want));
  }
});

describe("容器方法返回值那一族的 void 拒", () => {
  for (const [label, src, want] of VOID_CELLS) {
    it(label, async () => eq("404", label, await first(src), want));
  }
});
