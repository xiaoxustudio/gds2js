import { UnsupportedError } from "./errors";
import { CALLABLE, isVariant, lookupClass, wrapValue } from "./object";
import { Signal } from "./signal";
import { Tag, V, type TagValue, type Variant } from "./tags";
import { GArray, GDict, valueEq } from "./values";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";
import { GVector2i } from "./vector2i";
import { GVector3i } from "./vector3i";
import { asVec3i, toVec3 } from "./vector3i";
import { GColor } from "./color";
import { asBytes, GBytes, packTypeOfCode, type PackKind } from "./packed";

export type Pat =
  | { k: "wild" }
  | { k: "lit"; v: Variant }
  | { k: "bind" }
  | { k: "arr"; items: Pat[] }
  | { k: "dict"; entries: Array<{ key: Variant; pat: Pat }> }
  | { k: "const"; v: Variant };

export const patWild = (): Pat => ({ k: "wild" });
export const patLit = (v: Variant): Pat => ({ k: "lit", v });
export const patBind = (): Pat => ({ k: "bind" });
export const patArray = (items: Pat[]): Pat => ({ k: "arr", items });
export const patConst = (v: Variant): Pat => ({ k: "const", v });
export const patDict = (entries: Array<[Variant, Pat]>): Pat => ({
  k: "dict",
  entries: entries.map(([key, pat]) => ({ key, pat })),
});

/**
 * 匹配成功返回**按绑定出现顺序**收集的值数组，失败返回 null。
 * emitter 拿到数组后按 IR 里 pattern 的绑定名依次解构。
 */
export function matchPattern(subject: Variant, p: Pat): Variant[] | null {
  const out: Variant[] = [];
  return matches(subject, p, out) ? out : null;
}

function matches(s: Variant, p: Pat, out: Variant[]): boolean {
  switch (p.k) {
    case "wild":
      return true;
    case "bind":
      out.push(s);
      return true;
    case "lit":
      return valueEq(s, p.v);
    case "const":
      return valueEq(s, p.v);
    case "arr": {
      if (s.t !== Tag.ARRAY) return false;
      const items = (s.v as GArray).raw();
      if (items.length !== p.items.length) return false;
      return p.items.every((sub, i) => {
        const item = items[i];
        return item !== undefined && matches(item, sub, out);
      });
    }
    case "dict": {
      if (s.t !== Tag.DICT) return false;
      const d = s.v as GDict;
      if (d.size() !== p.entries.length) return false;
      for (const en of p.entries) {
        if (!d.has(en.key)) return false;
        if (!matches(d.get(en.key), en.pat, out)) return false;
      }
      return true;
    }
  }
}

const TYPE_TAGS: Record<string, TagValue> = {
  int: Tag.INT,
  float: Tag.FLOAT,
  bool: Tag.BOOL,
  String: Tag.STRING,
  StringName: Tag.STRING_NAME,
  Array: Tag.ARRAY,
  Dictionary: Tag.DICT,
  Object: Tag.OBJECT,
  Nil: Tag.NIL,
  null: Tag.NIL,
};

function builtinTag(name: string): TagValue | undefined {
  return TYPE_TAGS[name.replace(/\[.*\]$/, "")];
}

/**
 * 数学内建类型（都挤在 Tag.OBJECT 里，只能按实例判）。实测 `Vector2(3,4) is Vector2` → true。
 * Color 还没实现时问到就落到下面的报缺分支；实测 typeof(Color(1,0,0,1)) → 20。
 */
const MATH_TYPES: Record<string, (v: Variant) => boolean> = {
  Vector2: (v) => v.t === Tag.OBJECT && v.v instanceof GVector2,
  Vector3: (v) => v.t === Tag.OBJECT && v.v instanceof GVector3,
  Vector2i: (v) => v.t === Tag.OBJECT && v.v instanceof GVector2i,
  Vector3i: (v) => v.t === Tag.OBJECT && v.v instanceof GVector3i,
  Color: (v) => v.t === Tag.OBJECT && v.v instanceof GColor,
};

/**
 * Packed\*Array 的 `is` / `as`（S172 实测）。两条要点：
 * - **各认各的形状**：`b is PackedByteArray` 真，而同一支 `b is PackedInt32Array` **假**；
 * - pack **不算 Array、也不算 Object**（`b is Array` 假、`b is Object` 假），只有 `is Variant` 真。
 *   后一条与 TYPE_TAGS 把 `Object` 映到 Tag.OBJECT 相冲，所以下面 `is Object` 那支要先把 pack 摘出去。
 */
const PACK_TYPES: Record<string, PackKind> = {
  PackedByteArray: "byte",
  PackedInt32Array: "int32",
  PackedInt64Array: "int64",
  PackedFloat32Array: "float32",
  PackedFloat64Array: "float64",
  PackedStringArray: "string",
  PackedVector2Array: "vector2",
  PackedVector3Array: "vector3",
  PackedColorArray: "color",
};

function packKindMatches(v: Variant, kind: PackKind): boolean {
  const b = asBytes(v);
  return b !== null && b.kind === kind;
}

export function isType(v: Variant, name: string): Variant {
  if (name === "Variant") return V.bool(true);
  const pk = PACK_TYPES[name];
  if (pk !== undefined) return V.bool(packKindMatches(v, pk));
  if (name === "Object" && asBytes(v) !== null) return V.bool(false);
  const t = builtinTag(name);
  if (t !== undefined) return V.bool(v.t === t);
  const math = MATH_TYPES[name];
  if (math) return V.bool(math(v));
  const ctor = lookupClass(name);
  if (ctor) {
    return V.bool(v.t === Tag.OBJECT && v.v instanceof ctor);
  }
  throw new UnsupportedError("is-type", `is ${name} 未实现（未知类型）`);
}

export function asType(v: Variant, name: string): Variant {
  if (name === "Variant") return v;
  const pk = PACK_TYPES[name];
  if (pk !== undefined) {
    if (packKindMatches(v, pk)) return v;
    throw new UnsupportedError("as-type-pack", `as ${name} 只量过形状相符的 pack（收到的是别的东西）`);
  }
  const t = builtinTag(name);
  if (t !== undefined) return v.t === t ? v : V.nil();
  const math = MATH_TYPES[name];
  if (math) {
    // `as` 在整型向量与浮点向量之间是**转换**而不是判空：`tmp/f69 t65` 实测
    // `Vector3i(1, 2, 3) as Vector3` → `(1.0, 2.0, 3.0)`、`typeof` 给 9；
    // 走下面的判空就会静默成 `<null>`，那是这一族里最容易被漏的一格。
    if (name === "Vector3" && asVec3i(v) !== null) return toVec3(v);
    return math(v) ? v : V.nil();
  }
  const ctor = lookupClass(name);
  if (ctor) {
    return v.t === Tag.OBJECT && v.v instanceof ctor ? v : V.nil();
  }
  throw new UnsupportedError("as-type", `as ${name} 未实现（未知类型）`);
}

/**
 * `typeof` 返回的是 Godot 的 Variant.Type 枚举值（int=2、float=3，见用例 002）。
 * **不能**直接用我们的 Tag —— NIL/BOOL/INT/FLOAT/STRING 恰好同值（0–4），
 * 但 ARRAY 在 Godot 里是 28 不是 5，DICT 是 27 不是 6。
 */
const GODOT_TYPE: Record<TagValue, number> = {
  [Tag.NIL]: 0,
  [Tag.BOOL]: 1,
  [Tag.INT]: 2,
  [Tag.FLOAT]: 3,
  [Tag.STRING]: 4,
  [Tag.STRING_NAME]: 21,
  [Tag.ARRAY]: 28,
  [Tag.DICT]: 27,
  [Tag.OBJECT]: 24,
};

export function typeOf(raw: unknown): Variant {
  const v = isVariant(raw) ? raw : wrapValue(raw);
  if (v.t === Tag.OBJECT && v.v instanceof GVector2) return V.int(5);
  if (v.t === Tag.OBJECT && v.v instanceof GVector3) return V.int(9);
  if (v.t === Tag.OBJECT && v.v instanceof GVector2i) return V.int(6);
  if (v.t === Tag.OBJECT && v.v instanceof GVector3i) return V.int(10);
  if (v.t === Tag.OBJECT && v.v instanceof GColor) return V.int(20);
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) return V.int(packTypeOfCode((v.v as GBytes).kind));
  if (v.t === Tag.OBJECT && v.v instanceof Signal) return V.int(26);
  if (v.t === Tag.OBJECT && CALLABLE in (v.v as Record<string, unknown>)) return V.int(25);
  return V.int(GODOT_TYPE[v.t]);
}
