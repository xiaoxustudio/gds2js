import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GQuaternion } from "../composite-classes";
import { asVec3, vector3 } from "../class/vector/vector3";
import { quaternion } from "../quaternion";

const r = Math.fround;

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
