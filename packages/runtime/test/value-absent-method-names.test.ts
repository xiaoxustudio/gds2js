// Vector2i / Vector3i / Color 上「4.6.3 根本没这名字」的那 59 名，逐名钉引擎那句
// （名单与句子来自 `tmp/probe-member-tables/vsweep.mts` 的 218 名过裁判 + `verify.mts` 的逐名对账；S301）。
// 此前的分支已经把它们归到「实测不存在」那一组，只是发的是中文自述 —— 这一门钉的是**句子**与引擎一字一样。
// `inverse` 那三名（Vector2 / Vector2i / Vector3i）是 S304 量的：这支只有 Vector3 有。

import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { vector2i } from "@gds2js/runtime/runtime/class/vector/vector2i";
import { vector3i } from "@gds2js/runtime/runtime/class/vector/vector3i";
import { colorNew } from "@gds2js/runtime/runtime/class/color/color";
import type { Variant } from "@gds2js/runtime/runtime/tags";

const errOf = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

const ABSENT: Array<[string, () => Variant, string[]]> = [
  ["Vector2", () => vector2(1, 2), ["inverse"]],
  ["Vector2i", () => vector2i(1, 2), [
    "ceil", "ceildiv", "clampf", "direction_to", "floor", "floordiv", "inverse", "is_equal_approx", "is_normalized",
    "move_toward", "normalized", "posmod", "round", "signwrapping", "snappedf",
  ]],
  ["Vector3i", () => vector3i(1, 2, 3), [
    "angle_to", "aspect", "axis_get", "axis_set", "bounce", "ceil", "ceildiv", "ceilf", "count_zeros", "cross",
    "direction_to", "dot", "floor", "floordiv", "floorf", "hash", "inverse", "is_equal_approx", "is_zero_approx", "lerp",
    "move_toward", "normalized", "octant", "posmod", "posmodv", "pow", "reflect", "round", "roundf", "same_sign",
    "signwrapping", "snapn", "snappedf", "to_vector3",
  ]],
  ["Color", () => colorNew([]), [
    "blend_rgb", "clamped", "get_hsv", "is_finite", "is_zero_approx", "mix", "snap", "to_abgr8", "to_argb8",
    "to_bgra32", "to_bgra8", "to_rgba8",
  ]],
];

describe("runtime/value · 引擎没有那些成员名", () => {
  for (const [type, recv, names] of ABSENT) {
    it(`${type} · ${String(names.length)} 名逐个给 Nonexistent function 那句`, async () => {
      for (const n of names) {
        eq("301", `${type}.${n}()`, errOf(() => method(recv(), n, [])), `Invalid call. Nonexistent function '${n}' in base '${type}'.`);
      }
    });
  }

  // Pack 那两支（byte 独有的方法在别的支上引擎根本没这名字）：S302 逐名过裁判，18 格
  const PACK_NAMES = ["compress", "decompress", "get_string_from_ascii", "get_string_from_utf8", "hex_encode",
    "to_float32_array", "to_float64_array", "to_int32_array", "to_int64_array"];
  for (const [type, kind] of [["PackedInt32Array", "int32"], ["PackedStringArray", "string"]] as const) {
    it(`${type} · byte 独有那 9 名给 Nonexistent function 那句`, async () => {
      for (const n of PACK_NAMES) {
        eq("302", `${type}.${n}()`, errOf(() => method(packCtor(kind, []), n, [])), `Invalid call. Nonexistent function '${n}' in base '${type}'.`);
      }
    });
  }
});
