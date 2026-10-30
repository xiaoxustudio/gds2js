import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { num6Text } from "../../numfmt";
import { asVec3, vector3 } from "../vector/vector3";

export class GQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number, y: number, z: number, w: number) {
    const r = Math.fround;
    this.x = r(x);
    this.y = r(y);
    this.z = r(z);
    this.w = r(w);
  }
}

export function asQuaternion(v: Variant): GQuaternion | null {
  return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? (v.v as GQuaternion) : null;
}

const r = Math.fround;
export function quaternion(x: number, y: number, z: number, w: number): Variant {
  return V.object(new GQuaternion(x, y, z, w));
}
function num(v: Variant | undefined, at: string): number {
  if (v === undefined) throw new UnsupportedError("quaternion-arity", `Quaternion() 的 ${at} 缺了`);
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return r(Number(v.v));
  throw new UnsupportedError("quaternion-arg", `Quaternion() 的 ${at} 只量过数（收到 ${tagName(v.t)}）`);
}
function axisAngle(ax: number, ay: number, az: number, angle: number): Variant {
  const half = r(angle / 2);
  const s = r(Math.sin(half));
  return quaternion(r(ax * s), r(ay * s), r(az * s), r(Math.cos(half)));
}
export function quaternionNew(args: Variant[]): Variant {
  if (args.length === 0) return quaternion(0, 0, 0, 1);
  if (args.length === 1) {
    const q = asQuaternion(args[0] as Variant);
    if (q !== null) return quaternion(q.x, q.y, q.z, q.w);
    throw new UnsupportedError("quaternion-arg", `Quaternion() 单参只量过 Quaternion 本身（收到 ${tagName((args[0] as Variant).t)}）`);
  }
  if (args.length === 2) {
    const a = asVec3(args[0] as Variant);
    const b = asVec3(args[1] as Variant);
    if (a !== null && b !== null) {
      const cx = r(r(a.y * b.z) - r(a.z * b.y));
      const cy = r(r(a.z * b.x) - r(a.x * b.z));
      const cz = r(r(a.x * b.y) - r(a.y * b.x));
      const len = Math.sqrt(r(r(cx * cx) + r(cy * cy)) + r(cz * cz));
      if (len === 0) throw new UnsupportedError("quaternion-arc", "Quaternion(from, to) 的退化那一形（叉积为零）没量过");
      const dot = r(r(a.x * b.x) + r(a.y * b.y)) + r(a.z * b.z);
      return axisAngle(r(cx / len), r(cy / len), r(cz / len), r(Math.acos(Math.max(-1, Math.min(1, dot)))));
    }
    const axis = asVec3(args[0] as Variant);
    if (axis !== null) return axisAngle(axis.x, axis.y, axis.z, num(args[1], "第二参"));
    throw new UnsupportedError("quaternion-arg", "Quaternion() 两参只量过 (Vector3, Vector3) 与 (Vector3, 角度)");
  }
  if (args.length !== 4) throw new UnsupportedError("quaternion-arity", `Quaternion() 只量过 0、1、2、4 个实参（收到 ${args.length} 个）`);
  return quaternion(num(args[0], "第 1 参"), num(args[1], "第 2 参"), num(args[2], "第 3 参"), num(args[3], "第 4 参"));
}
export function toQuaternion(v: Variant): Variant {
  return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? v : quaternionNew([v]);
}
export function quaternionText(v: GQuaternion): string {
  return `(${num6Text(v.x)}, ${num6Text(v.y)}, ${num6Text(v.z)}, ${num6Text(v.w)})`;
}
export function quaternionReadProp(v: GQuaternion, name: string): Variant | null {
  if (name === "x") return V.float(v.x);
  if (name === "y") return V.float(v.y);
  if (name === "z") return V.float(v.z);
  if (name === "w") return V.float(v.w);
  return null;
}
function len2(q: GQuaternion): number {
  let s = r(q.x * q.x);
  s = r(s + r(q.y * q.y));
  s = r(s + r(q.z * q.z));
  return r(s + r(q.w * q.w));
}
function same(v: Variant | undefined, name: string): GQuaternion {
  if (v !== undefined && v.t === Tag.OBJECT && v.v instanceof GQuaternion) return v.v as GQuaternion;
  throw new UnsupportedError("quaternion-arg-type", `Quaternion.${name}() 的实参只量过 Quaternion`);
}
function vec3(v: Variant | undefined, name: string): [number, number, number] {
  const p = v === undefined ? null : asVec3(v);
  if (p === null) throw new UnsupportedError("quaternion-arg-type", `Quaternion.${name}() 的实参只量过 Vector3`);
  return [p.x, p.y, p.z];
}
export function quaternionMethod(inner: GQuaternion, name: string, args: Variant[]): Variant {
  switch (name) {
    case "length_squared":
      return V.float(len2(inner));
    case "length":
      return V.float(r(Math.sqrt(len2(inner))));
    case "normalized": {
      const l = r(Math.sqrt(len2(inner)));
      if (l === 0) throw new UnsupportedError("quaternion-normalized-zero", "Quaternion().normalized() 长度为零那一形没量过");
      const k = r(1 / l);
      return quaternion(r(inner.x * k), r(inner.y * k), r(inner.z * k), r(inner.w * k));
    }
    case "dot": {
      const o = same(args[0], "dot");
      let d = r(inner.x * o.x);
      d = r(d + r(inner.y * o.y));
      d = r(d + r(inner.z * o.z));
      return V.float(r(d + r(inner.w * o.w)));
    }
    case "get_angle": {
      if (inner.w > 1 || inner.w < -1) throw new UnsupportedError("quaternion-angle-range", "get_angle() 的 w 越界那一形没量过");
      return V.float(r(2 * Math.acos(inner.w)));
    }
    case "get_axis": {
      if (inner.w > 1 || inner.w < -1) throw new UnsupportedError("quaternion-axis-range", "get_axis() 的 w 越界那一形没量过");
      const s = Math.sqrt(Math.max(0, 1 - inner.w * inner.w));
      if (s < 0.00001) return vector3(0, 0, 1);
      return vector3(inner.x / s, inner.y / s, inner.z / s);
    }
    case "is_equal_approx": {
      const o = same(args[0], "is_equal_approx");
      return V.bool(inner.x === o.x && inner.y === o.y && inner.z === o.z && inner.w === o.w);
    }
    case "inverse": {
      if (len2(inner) !== 1) {
        throw new UnsupportedError("quaternion-inverse-band", "Quaternion.inverse() 只量过长度平方恰为 1 的那一形；引擎那句 must be normalized 走 stderr 且容差band没读，不发静默值");
      }
      return quaternion(r(-inner.x), r(-inner.y), r(-inner.z), inner.w);
    }
    default:
      throw new UnsupportedError("quaternion-method", `Quaternion.${name}() 这一支没量过（get_euler / exp / log / 静态 from_* 都只有一格读数，不足以定式子）`);
  }
}