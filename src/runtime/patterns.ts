import { UnsupportedError } from "./errors";
import { lookupClass } from "./object";
import { Tag, V, type TagValue, type Variant } from "./tags";
import { GArray, GDict, valueEq } from "./values";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";

/**
 * `match` 的模式匹配与 `is` / `as` 的类型判定。
 *
 * 语义依据 docs/SEMANTICS.md：
 * - 数组模式要求长度相等、逐项匹配，绑定按出现顺序收集（用例 020）
 * - 字典模式是**精确键集匹配**：键数相等且每个模式键都在、值匹配；多余键 → 不匹配（实测 4.6.3，用例 041）
 * - `is` 在 Godot 4.6.3 是编译期就能确定的类型判定（用例 021）
 */

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
      // 常量模式：按值相等匹配（与字面量同一套 valueEq 语义）
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
      // Godot 字典模式是**精确键集匹配**，不是子集：subject 的键必须与模式完全一致
      // （键数相等 + 每个模式键都在且值匹配）。多余键 → 不匹配（实测 4.6.3，用例 041）。
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

// ---------------------------------------------------------------- is / as

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
  // Array[int] 这类带元素类型的写法，判定只看容器类型
  return TYPE_TAGS[name.replace(/\[.*\]$/, "")];
}

/**
 * 数学内建类型（都挤在 Tag.OBJECT 里，只能按实例判）。实测 `Vector2(3,4) is Vector2` → true。
 * Vector2i / Color 还没实现，问到就落到下面的报缺分支。
 */
const MATH_TYPES: Record<string, (v: Variant) => boolean> = {
  Vector2: (v) => v.t === Tag.OBJECT && v.v instanceof GVector2,
  Vector3: (v) => v.t === Tag.OBJECT && v.v instanceof GVector3,
};

export function isType(v: Variant, name: string): Variant {
  if (name === "Variant") return V.bool(true);
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
  const t = builtinTag(name);
  if (t !== undefined) return v.t === t ? v : V.nil();
  const math = MATH_TYPES[name];
  if (math) return math(v) ? v : V.nil();
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

export function typeOf(v: Variant): Variant {
  // 数学内建类型都塞在 Tag.OBJECT 里，得按实例再分一次（实测 typeof(Vector2(1,2)) → 5）
  if (v.t === Tag.OBJECT && v.v instanceof GVector2) return V.int(5);
  // 实测 typeof(Vector3(1,2,3)) → 9（Vector2i 是 6，还没实现）
  if (v.t === Tag.OBJECT && v.v instanceof GVector3) return V.int(9);
  return V.int(GODOT_TYPE[v.t]);
}
