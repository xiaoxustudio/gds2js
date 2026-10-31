import { numVal, strFloat } from "../numfmt";
import { posOobSay, strCEscape, strColor, strVec2, valueTypeName } from "../string-ops";
import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, tagName, V, intToNum, type IntPayload, type Variant } from "../tags";
import { GVector2, asVec2 } from "../class/vector/vector2";
import { GVector3, asVec3, vector3 } from "../class/vector/vector3";
import { GVector4, asVec4, vector4 } from "../class/vector/vector4";
import { asVec2i, GVector2i, vector2i } from "../class/vector/vector2i";
import { asRect2, GRect2, rect2, rect2Text } from "../rect2";
import { asRect2i, GRect2i, rect2i, rect2iText } from "../rect2i";
import { aabb, aabbText } from "../aabb";
import { plane, planeText } from "../plane";
import { quaternion, quaternionText } from "../quaternion";
import { asQuaternion, GQuaternion } from "../composite-classes";
import { asTransform2D, GTransform2D } from "../composite-classes";
import { asTransform3D, GTransform3D } from "../composite-classes";
import { transform2d, transform2dText } from "../transform2d";
import { transform3d, transform3dText } from "../transform3d";
import { asBasis, basis, basisText, GBasis } from "../basis";
import { asPlane, GPlane } from "../composite-classes";
import { asAABB, GAABB } from "../composite-classes";
import { asVec3i, GVector3i, vector3i } from "../class/vector/vector3i";
import { asVec4i, GVector4i, vector4i } from "../class/vector/vector4i";
import { asColor, color, GColor, tryColorSlot } from "../color";
import { bytesEq, GBytes, packItems, registerPackStringifier } from "../packed";
import { callableEq, callableLabel, isCallable, isNullCallable, type CallableBox } from "../callable";
import { GdNativeClass } from "../native-class";
import { isEncodedObjectIdBox, isNullRefValue, isWeakRefBox } from "../identity";
import type { GdIdentified } from "../identity";
import { asRid, ridText } from "../rid";
import { asNodePath, nodePathText, sameNodePath } from "../node-path";
import type { GArray, GDict } from "./containers";

let containerFactories: { array: () => GArray; dict: () => GDict } | null = null;
export function registerContainerFactories(f: { array: () => GArray; dict: () => GDict }): void {
  containerFactories = f;
}

function newContainer(kind: "array" | "dict"): GArray | GDict {
  if (containerFactories === null) throw new UnsupportedError("container-factory", "容器工厂还没接上：`values/containers` 没被加载进运行时模块图");
  return kind === "array" ? containerFactories.array() : containerFactories.dict();
}


/** Dictionary 键编码：键必须带类型前缀，否则 1（int）与 1.0（float）会撞成同一个键。 */
export function keyOf(v: Variant): string {
  return keyOfIn(v, 0);
}

function callableKey(box: CallableBox): string {
  if (isNullCallable(box)) return "y:";
  const boundTag = box.boundOnce ? "1" : "0";
  if (box.name !== null) {
    const recv = box.object;
    if (recv === null) return `g:${box.name}:${boundTag}`;
    if (recv.t === Tag.OBJECT && !(recv.v instanceof GBytes)) {
      const id = (recv.v as GdIdentified).gdObjectId;
      if (id > 0) return `q:${String(id)}:${box.name}:${boundTag}`;
    }
    throw new UnsupportedError("dict-key-type", "这种接收者的方法 Callable 当字典键还没量过");
  }
  return `m:${String(box.gdObjectId)}`;
}

function keyOfIn(v: Variant, depth: number): string {
  switch (v.t) {
    case Tag.NIL:
      return "n:";
    case Tag.BOOL:
      return `b:${String(v.v)}`;
    case Tag.INT:
      return `i:${String(v.v)}`;
    case Tag.FLOAT:
      return `f:${String(v.v)}`;
    case Tag.STRING:
      return `s:${v.v as string}`;
    case Tag.STRING_NAME:
      return `s:${v.v as string}`;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GArray;
      const items = g.raw();
      let out = "c:[";
      for (let i = 0; i < items.length; i++) out += (i === 0 ? "" : ",") + keyOfIn(items[i] as Variant, depth + 1);
      return out + "]";
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GDict;
      const ks = g.keys();
      const vs = g.values();
      let out = "c:{";
      for (let i = 0; i < ks.length; i++) {
        out +=
          (i === 0 ? "" : ",") +
          keyOfIn(ks[i] as Variant, depth + 1) +
          "=>" +
          keyOfIn(vs[i] as Variant, depth + 1);
      }
      return out + "}";
    }
    case Tag.OBJECT: {
      const vec = asVec2(v);
      if (vec) return `v:${String(vec.x)},${String(vec.y)}`;
      const vec3 = asVec3(v);
      if (vec3) return `w:${String(vec3.x)},${String(vec3.y)},${String(vec3.z)}`;
      const vec2i = asVec2i(v);
      if (vec2i) return `x:${String(vec2i.x)},${String(vec2i.y)}`;
      const vec3i = asVec3i(v);
      if (vec3i) return `u:${String(vec3i.x)},${String(vec3i.y)},${String(vec3i.z)}`;
      const vec4 = asVec4(v);
      if (vec4) return `4:${String(vec4.x)},${String(vec4.y)},${String(vec4.z)},${String(vec4.w)}`;
      const vec4i = asVec4i(v);
      if (vec4i) return `5:${String(vec4i.x)},${String(vec4i.y)},${String(vec4i.z)},${String(vec4i.w)}`;
      const col = asColor(v);
      if (col)
        return `z:${String(col.r)},${String(col.g)},${String(col.b)},${String(col.a)}`;
      const rc2 = asRect2(v);
      if (rc2) return `7:${String(rc2.x)},${String(rc2.y)},${String(rc2.w)},${String(rc2.h)}`;
      const rc2i = asRect2i(v);
      const t2 = asTransform2D(v);
      if (t2) return `11:${String(t2.xx)},${String(t2.xy)},${String(t2.yx)},${String(t2.yy)},${String(t2.ox)},${String(t2.oy)}`;
      const qq = asQuaternion(v);
      if (qq) return `15:${String(qq.x)},${String(qq.y)},${String(qq.z)},${String(qq.w)}`;
      const pl = asPlane(v);
      if (pl) return `14:${String(pl.nx)},${String(pl.ny)},${String(pl.nz)},${String(pl.d)}`;
      const ab = asAABB(v);
      if (ab) return `16:${String(ab.x)},${String(ab.y)},${String(ab.z)},${String(ab.sx)},${String(ab.sy)},${String(ab.sz)}`;
      if (rc2i) return `8:${String(rc2i.x)},${String(rc2i.y)},${String(rc2i.w)},${String(rc2i.h)}`;
      const bsKey = asBasis(v);
      if (bsKey) return `17:${String(bsKey.x0)},${String(bsKey.x1)},${String(bsKey.x2)},${String(bsKey.y0)},${String(bsKey.y1)},${String(bsKey.y2)},${String(bsKey.z0)},${String(bsKey.z1)},${String(bsKey.z2)}`;
      const t3Key = asTransform3D(v);
      if (t3Key) return `18:${String(t3Key.x0)},${String(t3Key.x1)},${String(t3Key.x2)},${String(t3Key.y0)},${String(t3Key.y1)},${String(t3Key.y2)},${String(t3Key.z0)},${String(t3Key.z1)},${String(t3Key.z2)},${String(t3Key.ox)},${String(t3Key.oy)},${String(t3Key.oz)}`;
      const ridKey = asRid(v);
      if (ridKey !== null) return "r:" + String(ridKey.id);
      const npKey = asNodePath(v);
      if (npKey !== null) return "^" + nodePathText(npKey);
      if (isCallable(v)) return callableKey(v.v as CallableBox);
      if (!(v.v instanceof GBytes)) {
        const id = (v.v as GdIdentified).gdObjectId;
        if (id > 0) return `o:${String(id)}`;
      }
      break;
    }
    default:
      break;
  }
  throw new UnsupportedError("dict-key-type", `${tagName(v.t)} 不能作为字典键（未实现）`);
}

export type ElemKind =
  | "int"
  | "float"
  | "bool"
  | "String"
  | "StringName"
  | "Vector2"
  | "Vector3"
  | "Vector2i"
  | "Vector3i"
  | "Rect2"
  | "Rect2i"
  | "Plane"
  | "Quaternion"
  | "Transform2D"
  | "Transform3D"
  | "Basis"
  | "AABB"
  | "Vector4"
  | "Vector4i"
  | "Color"
  | "Array"
  | "Dictionary"
  | "Object";

export function elemDefault(kind: ElemKind): Variant {
  switch (kind) {
    case "Object":
      return V.nil();
    case "int":
      return V.int(0);
    case "float":
      return V.float(0);
    case "bool":
      return V.bool(false);
    case "String":
      return V.str("");
    case "StringName":
      return V.stringName("");
    case "Vector2":
      return V.object(new GVector2(0, 0));
    case "Vector3":
      return vector3(0, 0, 0);
    case "Vector2i":
      return vector2i(0, 0);
    case "Rect2":
      return rect2(0, 0, 0, 0);
    case "Rect2i":
      return rect2i(0, 0, 0, 0);
    case "AABB":
      return aabb(0, 0, 0, 0, 0, 0);
    case "Plane":
      return plane(0, 0, 0, 0);
    case "Quaternion":
      return quaternion(0, 0, 0, 1);
    case "Transform2D":
      return transform2d(1, 0, 0, 1, 0, 0);
    case "Transform3D":
      return transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
    case "Basis":
      return basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
    case "Vector3i":
      return vector3i(0, 0, 0);
    case "Vector4":
      return vector4(0, 0, 0, 0);
    case "Vector4i":
      return vector4i(0, 0, 0, 0);
    case "Color":
      return color(0, 0, 0, 1);
    case "Array":
      return V.array(newContainer("array"));
    case "Dictionary":
      return V.dict(newContainer("dict"));
  }
}

let classFaceCheck: ((cls: string, v: Variant) => boolean) | null = null;
export function registerClassFaceCheck(fn: (cls: string, v: Variant) => boolean): void {
  classFaceCheck = fn;
}
export function classFaceMatches(cls: string, v: Variant): Variant | null {
  if (classFaceCheck === null) return v;
  return classFaceCheck(cls, v) ? v : null;
}

export function elemConvert(kind: ElemKind, v: Variant): Variant | null {
  switch (kind) {
    case "Object":
      return v.t === Tag.NIL || v.t === Tag.OBJECT ? v : null;
    case "int":
      if (v.t === Tag.INT) return v;
      if (v.t === Tag.BOOL) return V.int(v.v ? 1 : 0);
      if (v.t === Tag.FLOAT) {
        const x = v.v as number;
        if (!Number.isFinite(x) || Math.abs(x) >= 2n ** 63n) return V.int(-(2n ** 63n));
        return V.int(BigInt(Math.trunc(x)));
      }
      return null;
    case "float":
      if (v.t === Tag.FLOAT) return v;
      if (v.t === Tag.INT) return V.float(intToNum(v.v as IntPayload));
      if (v.t === Tag.BOOL) return V.float(v.v ? 1 : 0);
      return null;
    case "bool":
      if (v.t === Tag.BOOL) return v;
      if (v.t === Tag.INT || v.t === Tag.FLOAT) return V.bool((v.v as number) !== 0);
      return null;
    case "String":
      if (v.t === Tag.STRING) return v;
      if (v.t === Tag.STRING_NAME) return V.str(v.v as string);
      return null;
    case "StringName":
      if (v.t === Tag.STRING_NAME) return v;
      if (v.t === Tag.STRING) return V.stringName(v.v as string);
      return null;
    case "Vector2": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector2i) return V.object(new GVector2((v.v as GVector2i).x, (v.v as GVector2i).y));
      return v.t === Tag.OBJECT && v.v instanceof GVector2 ? v : null;
    }
    case "Vector3": {
      const g3i = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g3i instanceof GVector3i) return vector3(g3i.x, g3i.y, g3i.z);
      return v.t === Tag.OBJECT && v.v instanceof GVector3 ? v : null;
    }
    case "Vector2i": {
      const g2 = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g2 instanceof GVector2) return vector2i(g2.x, g2.y);
      return v.t === Tag.OBJECT && v.v instanceof GVector2i ? v : null;
    }
    case "Rect2": {
      if (v.t === Tag.OBJECT && v.v instanceof GRect2) return v;
      const ri = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (ri instanceof GRect2i) return rect2(ri.x, ri.y, ri.w, ri.h);
      return null;
    }
    case "Transform2D":
      return v.t === Tag.OBJECT && v.v instanceof GTransform2D ? v : null;
    case "Transform3D":
      return v.t === Tag.OBJECT && v.v instanceof GTransform3D ? v : null;
    case "Basis":
      return v.t === Tag.OBJECT && v.v instanceof GBasis ? v : null;
    case "Quaternion":
      return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? v : null;
    case "Plane":
      return v.t === Tag.OBJECT && v.v instanceof GPlane ? v : null;
    case "AABB":
      return v.t === Tag.OBJECT && v.v instanceof GAABB ? v : null;
    case "Rect2i": {
      if (v.t === Tag.OBJECT && v.v instanceof GRect2i) return v;
      const rf = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (rf instanceof GRect2) return rect2i(rf.x, rf.y, rf.w, rf.h);
      return null;
    }
    case "Vector3i": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector3i) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector3) return vector3i(v.v.x, v.v.y, v.v.z);
      return null;
    }
    case "Vector4": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector4) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector4i) return vector4(v.v.x, v.v.y, v.v.z, v.v.w);
      return null;
    }
    case "Vector4i": {
      if (v.t === Tag.OBJECT && v.v instanceof GVector4i) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector4) return vector4i(v.v.x, v.v.y, v.v.z, v.v.w);
      return null;
    }
    case "Color":
      return tryColorSlot(v);
    case "Array":
      return v.t === Tag.ARRAY ? v : null;
    case "Dictionary":
      return v.t === Tag.DICT ? v : null;
  }
}

export function arrIdx(i: number, len: number, base?: string, valueType = "Array"): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index", posOobSay(String(i), base, valueType));
  }
  return k;
}

/** 下标赋值那一侧的越界句：与读不同式，带上写入值的型（S403 量的，负数按原样印）。 */
export function arrIdxWrite(i: number, len: number, vt: string, base = "Array"): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index-write", `Invalid assignment of index '${String(i)}' (on base: '${base}') with value of type '${vt}'.`);
  }
  return k;
}

export function fromEnd(i: number, len: number): number | null {
  const k = i < 0 ? i + len : i;
  return k < 0 || k >= len ? null : k;
}




export function deepCopy(v: Variant, memo?: Map<unknown, Variant>): Variant {
  if (v.t === Tag.ARRAY) return V.array((v.v as GArray).duplicate(true, memo));
  if (v.t === Tag.DICT) return V.dict((v.v as GDict).duplicate(true, memo));
  return { t: v.t, v: v.v };
}

/** `contains(needle)`：**空 needle 不算包含** —— JS 的 `includes` 恰好给 true，不特判就是静默错。 */

/** 单码点的 Godot 简单降档，供不区分大小写的比较用（Godot 的大小写表永不撑开）。 */

/** `String.reverse()`（S574）：按码点反转（`"aé😀"`→`😀éa`）。 */

/** `String.json_escape()`（S575）：反斜杠、五个控制转义、`\v`、双引号；其余控制字符原样。 */

/** `String.validate_node_name()`（S575）：只换 `.` `:` `@` `/` `"` 五个，前后空白不动。 */

/** `String.is_valid_ip_address()`（S577）：长度门槛 16 / 40，带 `:` 走 IPv6（含嵌入 IPv4），否则走点分 IPv4。 */

/** `get_slice`：切段取第 n 段。找不到分隔符时整串就是那一段（实测任意 n ≥ 0 都回原串），负数与越界回空。 */

let objectLabelHook: ((inner: object) => string | null) | null = null;

export function registerObjectLabelHook(f: (inner: object) => string | null): void {
  objectLabelHook = f;
}

/** 只按「有没有非法字符 + 是不是空串」判，Windows 保留名不管（实测 `con` 与 `..` 都是合法文件名）。 */

/** 引擎那道判据：`is_digit(ord) || is_ascii_upper_case(ord)` —— 大写字母全过，但 `G`..`Z` 到 `strtol` 那里就不是 hex 位了。 */

/** 只转义实测到的这十个；其它控制字符与非 ASCII 一律原样出门。 */

/** `String.num(v)`：与 str()/print() 同一条浮点印法，唯一差别是 -0.0 给 `-0.0`（print 给 `0.0`）。 */

/** `num_uint64` 的实参按 **无符号** 解释（4.6.3 实测 `String.num_uint64(-1)` → `18446744073709551615`）：先折进 `[0, 2^64)`。 */

export const PRINT_DEPTH = 101;

export const COMPARE_DEPTH = 52;

registerPackStringifier((v) => show(v));

export function show(v: Variant, depth = 0): string {
  switch (v.t) {
    case Tag.NIL:
      return "<null>";
    case Tag.BOOL:
      return v.v ? "true" : "false";
    case Tag.INT:
      return String(v.v);
    case Tag.FLOAT:
      return strFloat(v.v as number);
    case Tag.STRING:
      return v.v as string;
    case Tag.STRING_NAME:
      return v.v as string;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "[...]";
      const g = v.v as GArray;
      return `[${g.raw().map((x) => repr(x, depth + 1)).join(", ")}]`;
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "{ ... }";
      const d = v.v as GDict;
      const vs = d.values();
      const parts = d.keys().map((k, i) => `${repr(k, depth + 1)}: ${repr(vs[i] as Variant, depth + 1)}`);
      return `{ ${parts.join(", ")} }`;
    }
    case Tag.OBJECT: {
      const inner = v.v;
      if (inner instanceof GVector2) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)})`;
      }
      if (inner instanceof GVector3) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)}, ${strVec2(inner.z)})`;
      }
      if (inner instanceof GVector4) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)}, ${strVec2(inner.z)}, ${strVec2(inner.w)})`;
      }
      if (inner instanceof GVector2i) {
        return `(${String(inner.x)}, ${String(inner.y)})`;
      }
      if (inner instanceof GVector3i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)})`;
      }
      if (inner instanceof GVector4i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)}, ${String(inner.w)})`;
      }
      if (inner instanceof GColor) {
        return `(${strColor(inner.r)}, ${strColor(inner.g)}, ${strColor(inner.b)}, ${strColor(inner.a)})`;
      }
      if (inner instanceof GRect2) {
        return rect2Text(inner);
      }
      if (inner instanceof GRect2i) {
        return rect2iText(inner);
      }
      if (inner instanceof GTransform2D) {
        return transform2dText(inner);
      }
      if (inner instanceof GTransform3D) {
        return transform3dText(inner);
      }
      if (inner instanceof GBasis) {
        return basisText(inner);
      }
      if (inner instanceof GQuaternion) {
        return quaternionText(inner);
      }
      if (inner instanceof GPlane) {
        return planeText(inner);
      }
      if (inner instanceof GAABB) {
        return aabbText(inner);
      }
      if (inner instanceof GBytes) {
        return `[${packItems(inner as GBytes).map((e) => repr(e, depth + 1)).join(", ")}]`;
      }
      const innerRid = asRid(v);
      if (innerRid !== null) return ridText(innerRid);
      const innerNp = asNodePath(v);
      if (innerNp !== null) return nodePathText(innerNp);
      if (isNullRefValue(inner)) return "<Object#null>";
      if (inner instanceof GdNativeClass) return `<GDScriptNativeClass#${String(inner.gdObjectId)}>`;
      if (isWeakRefBox(inner)) return `<WeakRef#${String(inner.gdObjectId)}>`;
      if (isEncodedObjectIdBox(inner)) return `<EncodedObjectAsID#${String(inner.gdObjectId)}>`;
      const shape = objectLabelHook === null ? null : objectLabelHook(inner as object);
      if (shape !== null) return shape;
      if (isCallable(v)) {
        const label = callableLabel(inner as CallableBox);
        if (label !== null) return label;
      }
      throw new UnsupportedError("show-type", "print 不支持该对象类型");
    }
    default:
      throw new UnsupportedError("show-type", `print 不支持 ${tagName(v.t)}`);
  }
}

export function repr(v: Variant, depth = 0): string {
  if (v.t === Tag.STRING) return `"${strCEscape(v.v as string)}"`;
  if (v.t === Tag.STRING_NAME) return `&"${strCEscape(v.v as string)}"`;
  const np = asNodePath(v);
  if (np !== null) return `^"${strCEscape(nodePathText(np))}"`;
  return show(v, depth);
}

export function valueEq(a: Variant, b: Variant, depth = 0, op = "=="): boolean {
  const ta = a.t;
  const tb = b.t;
  if (ta === Tag.OBJECT && tb === Tag.OBJECT) {
    const at2 = asTransform2D(a);
    const bt2 = asTransform2D(b);
    if (at2 !== null && bt2 !== null) return at2.xx === bt2.xx && at2.xy === bt2.xy && at2.yx === bt2.yx && at2.yy === bt2.yy && at2.ox === bt2.ox && at2.oy === bt2.oy;
    if (at2 !== null || bt2 !== null) {
      const t3: Variant = at2 !== null ? b : a;
      if (t3.t === Tag.NIL) return false;
      throw new UnsupportedError("transform2d-eq-pair", `Transform2D 与 ${valueTypeName(t3)} 的 ${op} 那一格没量过`);
    }
    const at3d = asTransform3D(a);
    const bt3d = asTransform3D(b);
    if (at3d !== null && bt3d !== null) {
      return at3d.x0 === bt3d.x0 && at3d.x1 === bt3d.x1 && at3d.x2 === bt3d.x2
        && at3d.y0 === bt3d.y0 && at3d.y1 === bt3d.y1 && at3d.y2 === bt3d.y2
        && at3d.z0 === bt3d.z0 && at3d.z1 === bt3d.z1 && at3d.z2 === bt3d.z2
        && at3d.ox === bt3d.ox && at3d.oy === bt3d.oy && at3d.oz === bt3d.oz;
    }
    if (at3d !== null || bt3d !== null) {
      const other: Variant = at3d !== null ? b : a;
      if (other.t === Tag.NIL) return false;
      throw new UnsupportedError("transform3d-eq-pair", `Transform3D 与 ${valueTypeName(other)} 的 ${op} 那一格没量过`);
    }
    const aq = asQuaternion(a);
    const bq = asQuaternion(b);
    if (aq !== null && bq !== null) return aq.x === bq.x && aq.y === bq.y && aq.z === bq.z && aq.w === bq.w;
    if (aq !== null || bq !== null) {
      const q2: Variant = aq !== null ? b : a;
      if (q2.t === Tag.NIL) return false;
      throw new UnsupportedError("quaternion-eq-pair", `Quaternion 与 ${valueTypeName(q2)} 的 ${op} 那一格没量过`);
    }
    const ap = asPlane(a);
    const bp = asPlane(b);
    if (ap !== null && bp !== null) return ap.nx === bp.nx && ap.ny === bp.ny && ap.nz === bp.nz && ap.d === bp.d;
    if (ap !== null || bp !== null) {
      const o2: Variant = ap !== null ? b : a;
      if (o2.t === Tag.NIL) return false;
      throw new UnsupportedError("plane-eq-pair", `Plane 与 ${valueTypeName(o2)} 的 ${op} 那一格没量过`);
    }
    const aa = asAABB(a);
    const bb = asAABB(b);
    if (aa !== null && bb !== null) return aa.x === bb.x && aa.y === bb.y && aa.z === bb.z && aa.sx === bb.sx && aa.sy === bb.sy && aa.sz === bb.sz;
    if (aa !== null || bb !== null) {
      const other: Variant = aa !== null ? b : a;
      if (other.t === Tag.NIL) return false;
      throw new UnsupportedError("aabb-eq-pair", `AABB 与 ${valueTypeName(other)} 的 ${op} 那一格没量过`);
    }
    const abs2 = asBasis(a);
    const bbs = asBasis(b);
    if (abs2 !== null && bbs !== null) return abs2.x0 === bbs.x0 && abs2.x1 === bbs.x1 && abs2.x2 === bbs.x2 && abs2.y0 === bbs.y0 && abs2.y1 === bbs.y1 && abs2.y2 === bbs.y2 && abs2.z0 === bbs.z0 && abs2.z1 === bbs.z1 && abs2.z2 === bbs.z2;
    if (abs2 !== null || bbs !== null) {
      const o3: Variant = abs2 !== null ? b : a;
      if (o3.t === Tag.NIL) return false;
      throw new UnsupportedError("basis-eq-pair", `Basis 与 ${valueTypeName(o3)} 的 ${op} 那一格没量过`);
    }
    const av = a.v;
    const bv = b.v;
    if (av instanceof GRect2 || av instanceof GRect2i || bv instanceof GRect2 || bv instanceof GRect2i) {
      if (av instanceof GRect2 && bv instanceof GRect2) return av.x === bv.x && av.y === bv.y && av.w === bv.w && av.h === bv.h;
      if (av instanceof GRect2i && bv instanceof GRect2i) return av.x === bv.x && av.y === bv.y && av.w === bv.w && av.h === bv.h;
      if ((av instanceof GRect2 && bv instanceof GRect2i) || (av instanceof GRect2i && bv instanceof GRect2)) {
        throw new GodotRuntimeError("rect2-eq", `Invalid operands to operator ${op}, Rect2 and Rect2i.`);
      }
      const other: Variant = av instanceof GRect2 || av instanceof GRect2i ? b : a;
      if (other.t === Tag.NIL) return false;
      throw new UnsupportedError("rect2-eq-pair", `Rect2 与 ${valueTypeName(other)} 的 ${op} 那一格没量过`);
    }
  }
  const a2 = asVec2(a);
  const b2 = asVec2(b);
  const a3 = asVec3(a);
  const b3 = asVec3(b);
  const ai = asVec2i(a);
  const bi = asVec2i(b);
  const ai3 = asVec3i(a);
  const bi3 = asVec3i(b);
  const a4 = asVec4(a);
  const b4 = asVec4(b);
  const ai4 = asVec4i(a);
  const bi4 = asVec4i(b);
  const ac = asColor(a);
  const bc = asColor(b);
  const ar = asRid(a);
  const br = asRid(b);
  const anp = asNodePath(a);
  const bnp = asNodePath(b);
  if (ar !== null || br !== null) {
    if (ar !== null && br !== null) return String(ar.id) === String(br.id);
    const ridOther: Variant = ar !== null ? b : a;
    if (ridOther.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  if (
    a2 !== null ||
    b2 !== null ||
    a3 !== null ||
    b3 !== null ||
    ai !== null ||
    bi !== null ||
    ai3 !== null ||
    bi3 !== null ||
    a4 !== null ||
    b4 !== null ||
    ai4 !== null ||
    bi4 !== null ||
    ac !== null ||
    bc !== null
  ) {
    if (a2 !== null && b2 !== null) return a2.x === b2.x && a2.y === b2.y;
    if (a3 !== null && b3 !== null) return a3.x === b3.x && a3.y === b3.y && a3.z === b3.z;
    if (a4 !== null && b4 !== null) return a4.x === b4.x && a4.y === b4.y && a4.z === b4.z && a4.w === b4.w;
    if (ai !== null && bi !== null) return ai.x === bi.x && ai.y === bi.y;
    if (ai3 !== null && bi3 !== null) return ai3.x === bi3.x && ai3.y === bi3.y && ai3.z === bi3.z;
    if (ai4 !== null && bi4 !== null) return ai4.x === bi4.x && ai4.y === bi4.y && ai4.z === bi4.z && ai4.w === bi4.w;
    if (ac !== null && bc !== null)
      return ac.r === bc.r && ac.g === bc.g && ac.b === bc.b && ac.a === bc.a;
    const other: Variant =
      a2 !== null || a3 !== null || a4 !== null || ai !== null || ai3 !== null || ai4 !== null || ac !== null ? b : a;
    if (other.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
  }
  if (anp !== null || bnp !== null) {
    if (anp !== null && bnp !== null) return sameNodePath(anp, bnp);
    const npOther: Variant = anp !== null ? b : a;
    if (npOther.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '${op}'.`);
  }
  if (ta === Tag.INT || ta === Tag.FLOAT) {
    if (tb === Tag.INT && ta === Tag.INT) return (a.v as IntPayload) === (b.v as IntPayload);
    if (tb === Tag.INT || tb === Tag.FLOAT) return numVal(a) === numVal(b);
    return false;
  }
  if (
    (ta === Tag.STRING || ta === Tag.STRING_NAME) &&
    (tb === Tag.STRING || tb === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (isCallable(a) !== isCallable(b)) {
    const other = isCallable(a) ? b : a;
    if (other.t === Tag.INT) {
      throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
    }
  }
  const an = a.t === Tag.OBJECT && isNullRefValue(a.v);
  const bn = b.t === Tag.OBJECT && isNullRefValue(b.v);
  if (an || bn) {
    if (an && bn) return true;
    const other = an ? b : a;
    return other.t === Tag.NIL;
  }
  if (ta !== tb) return false;
  switch (ta) {
    case Tag.NIL:
      return true;
    case Tag.BOOL:
    case Tag.STRING:
      return a.v === b.v;
    case Tag.STRING_NAME:
      return b.t === Tag.STRING_NAME && a.v === b.v;
    case Tag.ARRAY:
      return (a.v as GArray).eq(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).eq(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GBytes && b.v instanceof GBytes) return bytesEq(a.v as GBytes, b.v as GBytes);
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
  }
  return false;
}

export function valueSame(a: Variant, b: Variant, depth = 0): boolean {
  if (depth >= COMPARE_DEPTH && (a.t === Tag.ARRAY || a.t === Tag.DICT) && a.t === b.t) return true;
  if (
    (a.t === Tag.STRING || a.t === Tag.STRING_NAME) &&
    (b.t === Tag.STRING || b.t === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (a.t !== b.t) return false;
  switch (a.t) {
    case Tag.NIL:
      return true;
    case Tag.ARRAY:
      return (a.v as GArray).same(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).same(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GVector2 && b.v instanceof GVector2) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3 && b.v instanceof GVector3) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GVector4 && b.v instanceof GVector4) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z && a.v.w === b.v.w;
      }
      if (a.v instanceof GVector2i && b.v instanceof GVector2i) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GRect2 && b.v instanceof GRect2) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.w === b.v.w && a.v.h === b.v.h;
      }
      if (a.v instanceof GRect2i && b.v instanceof GRect2i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.w === b.v.w && a.v.h === b.v.h;
      }
      if (a.v instanceof GVector3i && b.v instanceof GVector3i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GVector4i && b.v instanceof GVector4i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z && a.v.w === b.v.w;
      }
      if (a.v instanceof GColor && b.v instanceof GColor) {
        return a.v.r === b.v.r && a.v.g === b.v.g && a.v.b === b.v.b && a.v.a === b.v.a;
      }
      if (isCallable(a) && isCallable(b)) return callableEq(a.v as CallableBox, b.v as CallableBox);
      {
        const npa = asNodePath(a);
        const npb = asNodePath(b);
        if (npa !== null && npb !== null) return sameNodePath(npa, npb);
      }
      return a.v === b.v;
    default:
      return a.v === b.v;
  }
}

export function truthyOf(v: Variant): boolean {
  switch (v.t) {
    case Tag.NIL:
      return false;
    case Tag.BOOL:
      return v.v as boolean;
    case Tag.INT:
    case Tag.FLOAT:
      return (v.v as number) !== 0;
    case Tag.STRING:
    case Tag.STRING_NAME:
      return (v.v as string) !== "";
    case Tag.ARRAY:
      return (v.v as GArray).size() !== 0;
    case Tag.DICT:
      return (v.v as GDict).size() !== 0;
    case Tag.OBJECT:
      return v.v instanceof GBytes ? (v.v as GBytes).length !== 0 : true;
  }
  return false;
}
