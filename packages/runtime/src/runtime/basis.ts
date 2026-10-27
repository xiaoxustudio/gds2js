import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { strVec2 } from "./string-ops";
import { asBasis, GQuaternion, GBasis } from "./composite-classes";
import { asVec3, vector3 } from "./vector3";

const r = Math.fround;

export { asBasis, GBasis };

export function basis(
  x0: number, x1: number, x2: number,
  y0: number, y1: number, y2: number,
  z0: number, z1: number, z2: number,
): Variant {
  return V.object(new GBasis(x0, x1, x2, y0, y1, y2, z0, z1, z2));
}

function num(v: Variant | undefined, at: string): number {
  if (v === undefined) throw new UnsupportedError("basis-arity", `Basis() 的 ${at} 缺了`);
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return r(Number(v.v));
  throw new UnsupportedError("basis-arg", `Basis() 的 ${at} 只量过数与向量（收到 ${tagName(v.t)}）`);
}

export function axisAngleBasis(ax: number, ay: number, az: number, angle: number): GBasis {
  const len2 = r(r(r(ax * ax) + r(ay * ay)) + r(az * az));
  if (len2 !== 1) throw new UnsupportedError("basis-axis-normalized", "Basis 的轴角两支只量过单位轴：轴长平方不为 1 那一形引擎发 ERROR 并回单位阵，没建模");
  const a = r(angle);
  const c = r(Math.cos(a));
  const s = r(Math.sin(a));
  const t = r(1 - c);
  const tx = r(t * ax);
  const ty = r(t * ay);
  const tz = r(t * az);
  const sx = r(s * ax);
  const sy = r(s * ay);
  const sz = r(s * az);
  return new GBasis(
    r(r(tx * ax) + c), r(r(ty * ax) + sz), r(r(tz * ax) - sy),
    r(r(tx * ay) - sz), r(r(ty * ay) + c), r(r(tz * ay) + sx),
    r(r(tx * az) + sy), r(r(ty * az) - sx), r(r(tz * az) + c),
  );
}

export function basisFromAxisAngle(ax: number, ay: number, az: number, angle: number): Variant {
  return V.object(axisAngleBasis(ax, ay, az, angle));
}

export function basisFromQuaternion(q: GQuaternion): Variant {
  const x = q.x;
  const y = q.y;
  const z = q.z;
  const w = q.w;
  const norm2 = r(r(r(r(x * x) + r(y * y)) + r(z * z)) + r(w * w));
  if (norm2 === 0) return basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
  const s = r(2 / norm2);
  const x2 = r(r(x * x) * s);
  const y2 = r(r(y * y) * s);
  const z2 = r(r(z * z) * s);
  const xy = r(r(x * y) * s);
  const xz = r(r(x * z) * s);
  const yz = r(r(y * z) * s);
  const xw = r(r(x * w) * s);
  const yw = r(r(y * w) * s);
  const zw = r(r(z * w) * s);
  return basis(
    r(1 - r(y2 + z2)), r(xy + zw), r(xz - yw),
    r(xy - zw), r(1 - r(x2 + z2)), r(yz + xw),
    r(xz + yw), r(yz - xw), r(1 - r(x2 + y2)),
  );
}

export function basisNew(args: Variant[]): Variant {
  if (args.length === 0) return basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const q = a.t === Tag.OBJECT && a.v instanceof GQuaternion ? (a.v as GQuaternion) : null;
    if (q !== null) return basisFromQuaternion(q);
    const same = asBasis(a);
    if (same !== null) return basis(same.x0, same.x1, same.x2, same.y0, same.y1, same.y2, same.z0, same.z1, same.z2);
    throw new UnsupportedError("basis-arg", `Basis() 单参只量过 Basis 与 Quaternion（收到 ${tagName(a.t)}）`);
  }
  if (args.length === 2) {
    const axis = asVec3(args[0] as Variant);
    if (axis !== null) return basisFromAxisAngle(axis.x, axis.y, axis.z, num(args[1], "第 2 参"));
    throw new UnsupportedError("basis-arg", `Basis() 两参只量过 (Vector3 轴, 角)（收到 ${tagName((args[0] as Variant).t)}）`);
  }
  if (args.length === 3) {
    const x = asVec3(args[0] as Variant);
    const y = asVec3(args[1] as Variant);
    const z = asVec3(args[2] as Variant);
    if (x !== null && y !== null && z !== null) {
      return basis(x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z);
    }
    throw new UnsupportedError("basis-arg", "Basis() 三参只量过三个 Vector3 列");
  }
  throw new UnsupportedError("basis-arity", `Basis() 只量过 0、1、2、3 个实参（收到 ${args.length} 个）：九数写法只在 var_to_str 的输出里量到过`);
}

export function basisMul(a: GBasis, b: GBasis): Variant {
  return basis(
    r(r(r(a.x0 * b.x0) + r(a.y0 * b.x1)) + r(a.z0 * b.x2)),
    r(r(r(a.x1 * b.x0) + r(a.y1 * b.x1)) + r(a.z1 * b.x2)),
    r(r(r(a.x2 * b.x0) + r(a.y2 * b.x1)) + r(a.z2 * b.x2)),
    r(r(r(a.x0 * b.y0) + r(a.y0 * b.y1)) + r(a.z0 * b.y2)),
    r(r(r(a.x1 * b.y0) + r(a.y1 * b.y1)) + r(a.z1 * b.y2)),
    r(r(r(a.x2 * b.y0) + r(a.y2 * b.y1)) + r(a.z2 * b.y2)),
    r(r(r(a.x0 * b.z0) + r(a.y0 * b.z1)) + r(a.z0 * b.z2)),
    r(r(r(a.x1 * b.z0) + r(a.y1 * b.z1)) + r(a.z1 * b.z2)),
    r(r(r(a.x2 * b.z0) + r(a.y2 * b.z1)) + r(a.z2 * b.z2)),
  );
}

export function basisXform(a: GBasis, vx: number, vy: number, vz: number): [number, number, number] {
  return [
    r(r(r(a.x0 * vx) + r(a.y0 * vy)) + r(a.z0 * vz)),
    r(r(r(a.x1 * vx) + r(a.y1 * vy)) + r(a.z1 * vz)),
    r(r(r(a.x2 * vx) + r(a.y2 * vy)) + r(a.z2 * vz)),
  ];
}

export function basisScaled(a: GBasis, k: number): Variant {
  return basis(
    r(a.x0 * k), r(a.x1 * k), r(a.x2 * k),
    r(a.y0 * k), r(a.y1 * k), r(a.y2 * k),
    r(a.z0 * k), r(a.z1 * k), r(a.z2 * k),
  );
}

export function basisDeterminant(a: GBasis): number {
  const cx = r(r(a.y1 * a.z2) - r(a.z1 * a.y2));
  const cy = r(r(a.z1 * a.x2) - r(a.x1 * a.z2));
  const cz = r(r(a.x1 * a.y2) - r(a.y1 * a.x2));
  return r(r(r(a.x0 * cx) + r(a.y0 * cy)) + r(a.z0 * cz));
}

export function basisText(v: GBasis): string {
  return `[X: (${strVec2(v.x0)}, ${strVec2(v.x1)}, ${strVec2(v.x2)}), `
    + `Y: (${strVec2(v.y0)}, ${strVec2(v.y1)}, ${strVec2(v.y2)}), `
    + `Z: (${strVec2(v.z0)}, ${strVec2(v.z1)}, ${strVec2(v.z2)})]`;
}

export function basisReadProp(v: GBasis, name: string): Variant | null {
  if (name === "x") return vector3(v.x0, v.x1, v.x2);
  if (name === "y") return vector3(v.y0, v.y1, v.y2);
  if (name === "z") return vector3(v.z0, v.z1, v.z2);
  return null;
}

export function basisWriteProp(v: GBasis, name: string, value: Variant): Variant | null {
  const col = asVec3(value);
  if (col === null) throw new UnsupportedError("basis-write", `Basis.${name} 的写入只量过 Vector3 那一形（收到 ${tagName(value.t)}）`);
  if (name === "x") { v.x0 = col.x; v.x1 = col.y; v.x2 = col.z; return null; }
  if (name === "y") { v.y0 = col.x; v.y1 = col.y; v.y2 = col.z; return null; }
  if (name === "z") { v.z0 = col.x; v.z1 = col.y; v.z2 = col.z; return null; }
  throw new UnsupportedError("basis-prop", `Basis.${name} 的写入没量过`);
}
