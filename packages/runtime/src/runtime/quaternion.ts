import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { num6Text } from "./string-ops";
import { GQuaternion, asQuaternion } from "./composite-classes";
import { asVec3 } from "./class/vector/vector3";

const r = Math.fround;

export function quaternion(x: number, y: number, z: number, w: number): Variant {
  return V.object(new GQuaternion(x, y, z, w));
}

export { asQuaternion };

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
