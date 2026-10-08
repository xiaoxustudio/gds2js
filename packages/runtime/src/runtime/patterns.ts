import { UnsupportedError, GodotRuntimeError } from "./errors";
import { ENGINE_CLASS_NAMES } from "./engine-classes";
import { ClassDesc, GdScriptObject, isCallableBox, isVariant, lookupClass, nativeBaseOf, objIs, wrapValue } from "./object";
import { Signal } from "./signal";
import { GdNativeClass } from "./native-class";
import { Tag, V, intToNum, type IntPayload, type TagValue, type Variant } from "./tags";
import { GArray, GDict, valueEq } from "./values";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";
import { GVector2i } from "./vector2i";
import { GVector3i } from "./vector3i";
import { asVec3i, toVec3 } from "./vector3i";
import { GColor } from "./color";
import { GBytes, isBytes, packBytes, packTypeOfCode, type PackKind } from "./packed";
import { GdRid } from "./rid";
import { asNodePath, GdNodePath, nodePathValue, sameNodePath } from "./node-path";

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

/** 匹配成功返回按绑定出现顺序收集的值数组，失败返回 null。 */
export function matchPattern(subject: Variant, p: Pat): Variant[] | null {
  const out: Variant[] = [];
  return matches(subject, p, out) ? out : null;
}

function armEq(s: Variant, v: Variant): boolean {
  // match 臂的等式不抛：异型一律假（实测 m01 / m04 / m05 —— `^"a/b"` 臂遇到 String 走 `_`，`Vector2(1, 2)` 臂遇到 String 也走 `_`）。
  const sp = asNodePath(s);
  const vp = asNodePath(v);
  if (sp === null && vp === null) return valueEq(s, v);
  return sp !== null && vp !== null && sameNodePath(sp, vp);
}

function matches(s: Variant, p: Pat, out: Variant[]): boolean {
  switch (p.k) {
    case "wild":
      return true;
    case "bind":
      out.push(s);
      return true;
    case "lit":
      return armEq(s, p.v);
    case "const":
      return armEq(s, p.v);
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

/** 数学内建类型：都挤在 Tag.OBJECT 里，只能按实例判。 */
const MATH_TYPES: Record<string, (v: Variant) => boolean> = {
  Vector2: (v) => v.t === Tag.OBJECT && v.v instanceof GVector2,
  Vector3: (v) => v.t === Tag.OBJECT && v.v instanceof GVector3,
  Vector2i: (v) => v.t === Tag.OBJECT && v.v instanceof GVector2i,
  Vector3i: (v) => v.t === Tag.OBJECT && v.v instanceof GVector3i,
  Color: (v) => v.t === Tag.OBJECT && v.v instanceof GColor,
};

/** Packed*Array 的 `is` / `as`：各认各的形状，且 pack 既不算 Array 也不算 Object —— `is Object` 那支要先把它摘出去。 */
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
  return isBytes(v) && packBytes(v).kind === kind;
}

/** 引擎类名的 `is`：探头 `tmp/probe-is-class/` 量过这七个名（表外的响亮拒）。 */
const PROBED_CLASS_NAMES = ["Object", "RefCounted", "Resource", "GDScript", "Node", "SceneTree", "MainLoop"];

/** 脚本实例那条链上的引擎基类：量过的只有 RefCounted 与宿主 SceneTree 两条。 */
function instanceClassNames(base: string | null): string[] | null {
  if (base === "RefCounted") return ["Object", "RefCounted"];
  if (base === "SceneTree") return ["Object", "SceneTree", "MainLoop"];
  return null;
}

/** 一个值是不是某引擎类名的实例：按四类形状各查各的表。 */
function engineClassIs(v: Variant, name: string): boolean | null {
  if (name === "Callable") return v.t === Tag.OBJECT && isCallableBox(v.v);
  if (v.t !== Tag.OBJECT) return false;
  const inner = v.v;
  if (inner instanceof Signal) return false;
  if (PROBED_CLASS_NAMES.indexOf(name) < 0) return null;
  if (inner instanceof GdScriptObject) {
    const names = instanceClassNames(nativeBaseOf(inner));
    return names === null ? null : names.indexOf(name) >= 0;
  }
  if (inner instanceof ClassDesc) return name === "Object" || name === "RefCounted" || name === "Resource" || name === "GDScript";
  if (inner instanceof GdNativeClass) return name === "Object" || name === "RefCounted";
  return false;
}

export function isType(v: Variant, name: string): Variant {
  if (name === "Variant") return V.bool(true);
  const pk = PACK_TYPES[name];
  if (pk !== undefined) return V.bool(packKindMatches(v, pk));
  // 实测 `NodePath("x") is NodePath` 真（g7）：`NodePath` 既不是 ClassDB 的类值，也不在 `builtinTag` 那张表里，单列一条。
  if (name === "NodePath") return V.bool(asNodePath(v) !== null);
  if (PROBED_CLASS_NAMES.indexOf(name) >= 0 || name === "Callable") {
    const e = engineClassIs(v, name);
    if (e !== null) return V.bool(e);
    throw new UnsupportedError("is-type", `is ${name} 这一支没量过（表内那 7 支的形状、信号值那 16 格都量过 —— tmp/probe-is-class/ 与 tmp/probe-is-unprobed/is.log）`);
  }
  const t = builtinTag(name);
  if (t !== undefined) return V.bool(v.t === t);
  const math = MATH_TYPES[name];
  if (math) return V.bool(math(v));
  const desc = lookupClass(name);
  if (desc !== undefined) {
    return V.bool(objIs(v, desc));
  }
  if (ENGINE_CLASS_NAMES.has(name)) return V.bool(false);
  throw new UnsupportedError("is-type", `is ${name} 未实现（未知类型）`);
}

/** TYPE_* 那一族的合法码数：实测 `TYPE_MAX` 是 39（S224 那张常数表），越界的 int 抛函数里那一句。 */
const IS_INSTANCE_OF_TYPE_COUNT = 39;

/** `is_instance_of(值, TYPE_* 常数 | 脚本类值 | 引擎类值)`（S274）：int 那形比的是 `typeof` 的同一张码表，两种类值复用 `is` 量过的两条链，其余第二参抛引擎运行期那一句。 */
export function gIsInstanceOf(obj: Variant, klass: Variant): Variant {
  if (klass.t === Tag.INT) {
    const t = intToNum(klass.v as IntPayload);
    if (t < 0 || t >= IS_INSTANCE_OF_TYPE_COUNT) {
      throw new GodotRuntimeError(
        "is-instance-of-type",
        `Error calling GDScript utility function "is_instance_of()": Invalid type argument for is_instance_of(), use TYPE_* constants for built-in types.`,
      );
    }
    return V.bool(intToNum(typeOf(obj).v as IntPayload) === t);
  }
  if (klass.t === Tag.OBJECT) {
    const inner = klass.v;
    if (inner instanceof ClassDesc) return V.bool(objIs(obj, inner));
    if (inner instanceof GdNativeClass) {
      const e = engineClassIs(obj, inner.className);
      if (e === null) {
        throw new UnsupportedError("is-instance-of-class", `is_instance_of() 的引擎类值只量过 is 那七支（收到 ${inner.className}），不猜`);
      }
      return V.bool(e);
    }
  }
  throw new GodotRuntimeError(
    "is-instance-of-arg",
    `Error calling GDScript utility function "is_instance_of()": Invalid type argument for is_instance_of(), should be a TYPE_* constant, a class or a script.`,
  );
}

export function asType(v: Variant, name: string): Variant {
  if (name === "Variant") return v;
  const pk = PACK_TYPES[name];
  if (pk !== undefined) {
    if (packKindMatches(v, pk)) return v;
    throw new UnsupportedError("as-type-pack", `as ${name} 只量过形状相符的 pack（收到的是别的东西）`);
  }
  // `as NodePath`：同型原样回、String 与 StringName 走解析式子，其余来源是运行期那一句（null / int / bool / Dictionary 四格同一句）
  if (name === "NodePath") {
    if (asNodePath(v) !== null) return v;
    if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return nodePathValue(v.v as string);
    throw new GodotRuntimeError("as-node-path", `Invalid cast: could not convert value to 'NodePath'.`);
  }
  const t = builtinTag(name);
  if (t !== undefined) return v.t === t ? v : V.nil();
  const math = MATH_TYPES[name];
  if (math) {
    // `as` 在整型向量与浮点向量之间是转换而不是判空，走下面的判空会静默成 `<null>`。
    if (name === "Vector3" && asVec3i(v) !== null) return toVec3(v);
    return math(v) ? v : V.nil();
  }
  const desc = lookupClass(name);
  if (desc !== undefined) {
    return objIs(v, desc) ? v : V.nil();
  }
  throw new UnsupportedError("as-type", `as ${name} 未实现（未知类型）`);
}

/** `typeof` 返回 Godot 的 Variant.Type 枚举值（int=2、float=3），与内部的 Tag 不同值，只能另建一张表。 */
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
  if (v.t === Tag.OBJECT && v.v instanceof GdRid) return V.int(23);
  if (v.t === Tag.OBJECT && v.v instanceof GdNodePath) return V.int(22);
  if (v.t === Tag.OBJECT && isCallableBox(v.v)) return V.int(25);
  return V.int(GODOT_TYPE[v.t]);
}
