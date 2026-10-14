// int64 / float32 / float64 / vector2 / vector3 / color 六支 pack 上「4.6.3 根本没这名字」的那 29 名，逐名钉引擎那句
//（名单与句子来自 `tmp/probe-pack/sweep.mts` 的 312 格过裁判：六支读数一字不差，引擎说无的 180 格；S375）。
// 此前这六支的表只登了 `remove_at_copy` / `bsearch_custom` 三名，其余落到 switch 的兜底、发的是中文自述。
// 名单里混着几个根本不是方法的串（`int32` / `vector2` 那一族，是扫描时从 packed.ts 的表里连出来的），
// 引擎对它们同样给 Nonexistent，所以一并钉住 —— 这一门要的是「引擎怎么说我们就怎么说」，不是「名字像不像方法」。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { packBytes, packCtor, packMethod, type PackKind } from "@gds2js/runtime/runtime/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { vector2 } from "@gds2js/runtime/runtime/vector2";
import { vector3 } from "@gds2js/runtime/runtime/vector3";
import { colorNew } from "@gds2js/runtime/runtime/color";

const errOf = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

const KINDS: Array<[string, PackKind]> = [
  ["PackedInt64Array", "int64"],
  ["PackedFloat32Array", "float32"],
  ["PackedFloat64Array", "float64"],
  ["PackedVector2Array", "vector2"],
  ["PackedVector3Array", "vector3"],
  ["PackedColorArray", "color"],
];

const ABSENT = [
  "arity",
  "bigint",
  "bsearch_custom",
  "color",
  "compress",
  "decode_string",
  "decompress",
  "empty",
  "float32",
  "float64",
  "get_bytes",
  "get_string_from_ascii",
  "get_string_from_utf8",
  "hex_encode",
  "index_of",
  "int32",
  "int64",
  "remove_at_copy",
  "search_sorted",
  "string",
  "to_base64",
  "to_float32_array",
  "to_float64_array",
  "to_hex_string",
  "to_int32_array",
  "to_int64_array",
  "to_raw_string",
  "vector2",
  "vector3",
];

describe("runtime/packed · 六支上引擎没有那些成员名", () => {
  for (const [type, kind] of KINDS) {
    it(`${type} · ${String(ABSENT.length)} 名逐个给 Nonexistent function 那句`, () => {
      const recv = packBytes(packCtor(kind, []));
      for (const n of ABSENT) {
        eq("375", `${type}.${n}()`, errOf(() => packMethod(recv, n, [])), `Invalid call. Nonexistent function '${n}' in base '${type}'.`);
      }
    });
  }
});

describe("runtime/packed · 六支上引擎有的那些名字不许被这张表拦掉", () => {
  it("size / is_empty / append 三支照跑", () => {
    for (const [type, kind] of KINDS) {
      const recv = packBytes(packCtor(kind, []));
      eq("375", `${type}.size()`, errOf(() => packMethod(recv, "size", [])), "没抛");
      eq("375", `${type}.is_empty()`, errOf(() => packMethod(recv, "is_empty", [])), "没抛");
      eq("375", `${type}.append() 缺实参给的是元数那句`, /需要 1 个参数/.test(errOf(() => packMethod(recv, "append", []))), true);
    }
  });
});

describe("runtime/packed · push_back 与 clear 九支都发货", () => {
  const NINE: Array<[string, PackKind, () => Variant]> = [
    ["PackedByteArray", "byte", () => V.int(9)],
    ["PackedInt32Array", "int32", () => V.int(9)],
    ["PackedInt64Array", "int64", () => V.int(9)],
    ["PackedFloat32Array", "float32", () => V.float(9.5)],
    ["PackedFloat64Array", "float64", () => V.float(9.5)],
    ["PackedStringArray", "string", () => V.str("z")],
    ["PackedVector2Array", "vector2", () => vector2(9, 8)],
    ["PackedVector3Array", "vector3", () => vector3(9, 8, 7)],
    ["PackedColorArray", "color", () => colorNew([V.float(0), V.float(1), V.float(0)])],
  ];

  it("push_back 追加一个元素、返回 bool 且实测值是 false", () => {
    for (const [type, kind, elem] of NINE) {
      const recv = packBytes(packCtor(kind, []));
      const got = packMethod(recv, "push_back", [elem()]);
      eq("375", `${type}.push_back 的返回`, got.t === Tag.BOOL && got.v === false, true);
      eq("375", `${type}.push_back 之后的长度`, String(packMethod(recv, "size", []).v), "1");
    }
  });

  it("clear 清空、返回 nil", () => {
    for (const [type, kind, elem] of NINE) {
      const recv = packBytes(packCtor(kind, []));
      packMethod(recv, "push_back", [elem()]);
      const got = packMethod(recv, "clear", []);
      eq("375", `${type}.clear 的返回`, got.t === Tag.NIL, true);
      eq("375", `${type}.clear 之后的长度`, String(packMethod(recv, "size", []).v), "0");
      eq("375", `${type}.clear 之后 is_empty`, String(packMethod(recv, "is_empty", []).v), "true");
    }
  });

  it("push_back 与 clear 的元数各按实测卡住", () => {
    const recv = packBytes(packCtor("byte", []));
    eq("375", "push_back 缺实参", /需要 1 个参数/.test(errOf(() => packMethod(recv, "push_back", []))), true);
    eq("375", "clear 多实参", /需要 0 个参数/.test(errOf(() => packMethod(recv, "clear", [V.int(1)]))), true);
  });

  it("sort_custom 九支都没这名字：pack 只有 sort（逐支量过）", () => {
    for (const [type, kind] of NINE) {
      const recv = packBytes(packCtor(kind, []));
      eq("376", `${type}.sort_custom()`, errOf(() => packMethod(recv, "sort_custom", [])), `Invalid call. Nonexistent function 'sort_custom' in base '${type}'.`);
    }
  });
});
