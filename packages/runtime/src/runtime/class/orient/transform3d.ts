import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asBasis, GBasis, basis, basisFromQuaternion, basisMul, basisScaleParts, basisXform, axisAngleBasis, basisInverseParts, basisOrthoParts } from "./basis";
import { GQuaternion } from "./quaternion";
import { asVec3, vector3 } from "../vector/vector3";

export class GTransform3D {
  x0: number;
  x1: number;
  x2: number;
  y0: number;
  y1: number;
  y2: number;
  z0: number;
  z1: number;
  z2: number;
  ox: number;
  oy: number;
  oz: number;
  constructor(
    x0: number, x1: number, x2: number,
    y0: number, y1: number, y2: number,
    z0: number, z1: number, z2: number,
    ox: number, oy: number, oz: number,
  ) {
    const f = Math.fround;
    this.x0 = f(x0);
    this.x1 = f(x1);
    this.x2 = f(x2);
    this.y0 = f(y0);
    this.y1 = f(y1);
    this.y2 = f(y2);
    this.z0 = f(z0);
    this.z1 = f(z1);
    this.z2 = f(z2);
    this.ox = f(ox);
    this.oy = f(oy);
    this.oz = f(oz);
  }
}

export function asTransform3D(v: Variant): GTransform3D | null {
  return v.t === Tag.OBJECT && v.v instanceof GTransform3D ? (v.v as GTransform3D) : null;
}

const r = Math.fround;
export function transform3d(
  x0: number, x1: number, x2: number,
  y0: number, y1: number, y2: number,
  z0: number, z1: number, z2: number,
  ox: number, oy: number, oz: number,
): Variant {
  return V.object(new GTransform3D(x0, x1, x2, y0, y1, y2, z0, z1, z2, ox, oy, oz));
}
export function transform3dOfParts(b: GBasis, ox: number, oy: number, oz: number): Variant {
  return transform3d(b.x0, b.x1, b.x2, b.y0, b.y1, b.y2, b.z0, b.z1, b.z2, ox, oy, oz);
}
export function transform3dCopy(v: GTransform3D): Variant {
  return transform3d(v.x0, v.x1, v.x2, v.y0, v.y1, v.y2, v.z0, v.z1, v.z2, v.ox, v.oy, v.oz);
}
function sayArg(at: string, got: string): never {
  throw new UnsupportedError("transform3d-arg", `Transform3D() 的 ${at} 只量过 Basis、Vector3 与 Transform3D（收到 ${got}）`);
}
export function transform3dNew(args: Variant[]): Variant {
  if (args.length === 0) return transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const same = asTransform3D(a);
    if (same !== null) return transform3dCopy(same);
    const b = asBasis(a);
    if (b !== null) return transform3dOfParts(b, 0, 0, 0);
    sayArg("单参", tagName(a.t));
  }
  if (args.length === 2) {
    const b = asBasis(args[0] as Variant);
    const o = asVec3(args[1] as Variant);
    if (b !== null && o !== null) return transform3dOfParts(b, o.x, o.y, o.z);
    sayArg("两参", `${tagName((args[0] as Variant).t)} 与 ${tagName((args[1] as Variant).t)}`);
  }
  if (args.length === 4) {
    const x = asVec3(args[0] as Variant);
    const y = asVec3(args[1] as Variant);
    const z = asVec3(args[2] as Variant);
    const o = asVec3(args[3] as Variant);
    if (x !== null && y !== null && z !== null && o !== null) {
      return transform3d(x.x, x.y, x.z, y.x, y.y, y.z, z.x, z.y, z.z, o.x, o.y, o.z);
    }
    sayArg("四参", "四参写法只量过四个 Vector3 列");
  }
  throw new UnsupportedError("transform3d-arity", `Transform3D() 只量过 0、1、2、4 个实参（收到 ${args.length} 个）`);
}
export function transform3dText(v: GTransform3D): string {
  return `[X: (${strVec2(v.x0)}, ${strVec2(v.x1)}, ${strVec2(v.x2)}), `
    + `Y: (${strVec2(v.y0)}, ${strVec2(v.y1)}, ${strVec2(v.y2)}), `
    + `Z: (${strVec2(v.z0)}, ${strVec2(v.z1)}, ${strVec2(v.z2)}), `
    + `O: (${strVec2(v.ox)}, ${strVec2(v.oy)}, ${strVec2(v.oz)})]`;
}
export function transform3dBasis(v: GTransform3D): Variant {
  return basis(v.x0, v.x1, v.x2, v.y0, v.y1, v.y2, v.z0, v.z1, v.z2);
}
export function transform3dOrigin(v: GTransform3D): Variant {
  return vector3(v.ox, v.oy, v.oz);
}
export function transform3dReadProp(v: GTransform3D, name: string): Variant | null {
  if (name === "basis") return transform3dBasis(v);
  if (name === "origin") return transform3dOrigin(v);
  return null;
}
export function transform3dWriteProp(v: GTransform3D, name: string, value: Variant): void {
  if (name === "origin") {
    const o = asVec3(value);
    if (o === null) sayArg("origin 的写入", tagName(value.t));
    const p = o as { x: number; y: number; z: number };
    v.ox = r(p.x);
    v.oy = r(p.y);
    v.oz = r(p.z);
    return;
  }
  if (name === "basis") {
    const b = asBasis(value);
    if (b === null) sayArg("basis 的写入", tagName(value.t));
    const g = b as GBasis;
    v.x0 = g.x0;
    v.x1 = g.x1;
    v.x2 = g.x2;
    v.y0 = g.y0;
    v.y1 = g.y1;
    v.y2 = g.y2;
    v.z0 = g.z0;
    v.z1 = g.z1;
    v.z2 = g.z2;
    return;
  }
  throw new UnsupportedError("transform3d-prop", `Transform3D.${name} 的写入没量过`);
}
export function transform3dBasisParts(v: GTransform3D): GBasis {
  return new GBasis(v.x0, v.x1, v.x2, v.y0, v.y1, v.y2, v.z0, v.z1, v.z2);
}
export function transform3dCompose(a: GTransform3D, b: GTransform3D): Variant {
  const bs = asBasis(basisMul(transform3dBasisParts(a), transform3dBasisParts(b))) as GBasis;
  const p = basisXform(transform3dBasisParts(a), b.ox, b.oy, b.oz);
  return transform3d(bs.x0, bs.x1, bs.x2, bs.y0, bs.y1, bs.y2, bs.z0, bs.z1, bs.z2, p[0] + a.ox, p[1] + a.oy, p[2] + a.oz);
}
export function transform3dXformPoint(a: GTransform3D, x: number, y: number, z: number): Variant {
  const p = basisXform(transform3dBasisParts(a), x, y, z);
  return vector3(p[0] + a.ox, p[1] + a.oy, p[2] + a.oz);
}
function rowDot(x0: number, x1: number, x2: number, y: number, z: number, w: number): number {
  return r(r(r(x0 * y) + r(x1 * z)) + r(x2 * w));
}
export function pointMulTransform3d(x: number, y: number, z: number, a: GTransform3D): Variant {
  const wx = r(x - a.ox);
  const wy = r(y - a.oy);
  const wz = r(z - a.oz);
  return vector3(
    rowDot(a.x0, a.x1, a.x2, wx, wy, wz),
    rowDot(a.y0, a.y1, a.y2, wx, wy, wz),
    rowDot(a.z0, a.z1, a.z2, wx, wy, wz),
  );
}
function vecArg(args: Variant[], at: string): { x: number; y: number; z: number } {
  const p = asVec3(args[0] as Variant);
  if (p === null) throw new UnsupportedError("transform3d-arg-type", `Transform3D.${at}() 的实参只量过 Vector3（收到 ${args.length === 0 ? "缺参" : tagName((args[0] as Variant).t)}）`);
  return p;
}
function reParts(b: GBasis, ox: number, oy: number, oz: number): Variant {
  return transform3dOfParts(b, ox, oy, oz);
}
function quatOfBasis(b: GBasis): GQuaternion {
  const trace = r(r(b.x0 + b.y1) + b.z2);
  if (trace > 0) {
    const s = r(Math.sqrt(trace + 1) * 2);
    return new GQuaternion(r((b.y2 - b.z1) / s), r((b.z0 - b.x2) / s), r((b.x1 - b.y0) / s), r(0.25 * s));
  }
  if (b.x0 > b.y1 && b.x0 > b.z2) {
    const s = r(Math.sqrt(1 + b.x0 - b.y1 - b.z2) * 2);
    return new GQuaternion(r(0.25 * s), r((b.y0 + b.x1) / s), r((b.z0 + b.x2) / s), r((b.y2 - b.z1) / s));
  }
  if (b.y1 > b.z2) {
    const s = r(Math.sqrt(1 + b.y1 - b.x0 - b.z2) * 2);
    return new GQuaternion(r((b.y0 + b.x1) / s), r(0.25 * s), r((b.z1 + b.y2) / s), r((b.z0 - b.x2) / s));
  }
  const s = r(Math.sqrt(1 + b.z2 - b.x0 - b.y1) * 2);
  return new GQuaternion(r((b.z0 + b.x2) / s), r((b.z1 + b.y2) / s), r(0.25 * s), r((b.x1 - b.y0) / s));
}

function slerpQuat(a: GQuaternion, b: GQuaternion, t: number): GQuaternion {
  let bx = b.x;
  let by = b.y;
  let bz = b.z;
  let bw = b.w;
  let d = r(r(r(a.x * bx) + r(a.y * by)) + r(r(a.z * bz) + r(a.w * bw)));
  if (d < 0) {
    bx = r(-bx);
    by = r(-by);
    bz = r(-bz);
    bw = r(-bw);
    d = r(-d);
  }
  if (d > 0.9995) {
    const x = r(a.x + r(t * r(bx - a.x)));
    const y = r(a.y + r(t * r(by - a.y)));
    const z = r(a.z + r(t * r(bz - a.z)));
    const w = r(a.w + r(t * r(bw - a.w)));
    const l = r(Math.sqrt(r(r(x * x) + r(y * y)) + r(r(z * z) + r(w * w))));
    return new GQuaternion(x / l, y / l, z / l, w / l);
  }
  const theta = Math.acos(d);
  const sin = Math.sin(theta);
  const ka = r(Math.sin(r(r(1 - t) * theta)) / sin);
  const kb = r(Math.sin(r(t * theta)) / sin);
  return new GQuaternion(r(r(ka * a.x) + r(kb * bx)), r(r(ka * a.y) + r(kb * by)), r(r(ka * a.z) + r(kb * bz)), r(r(ka * a.w) + r(kb * bw)));
}

export function transform3dMethod(inner: GTransform3D, name: string, args: Variant[]): Variant {
  const basis = transform3dBasisParts(inner);
  switch (name) {
    case "affine_inverse": {
      if (args.length !== 0) throw new UnsupportedError("transform3d-arity", `affine_inverse() 只量过 0 个实参（收到 ${args.length} 个）`);
      const inv = basisInverseParts(basis);
      if (inv === null) throw new UnsupportedError("transform3d-affine-inverse", "affine_inverse() 的行列式为零那一形没量过");
      const p = basisXform(inv, inner.ox, inner.oy, inner.oz);
      return transform3d(inv.x0, inv.x1, inv.x2, inv.y0, inv.y1, inv.y2, inv.z0, inv.z1, inv.z2, r(-p[0]), r(-p[1]), r(-p[2]));
    }
    case "orthonormalized": {
      if (args.length !== 0) throw new UnsupportedError("transform3d-arity", `orthonormalized() 只量过 0 个实参（收到 ${args.length} 个）`);
      return reParts(basisOrthoParts(basis), inner.ox, inner.oy, inner.oz);
    }
    case "rotated": {
      const axis = vecArg(args, "rotated");
      const angle = args[1] as Variant;
      if (angle === undefined || (angle.t !== Tag.INT && angle.t !== Tag.FLOAT)) throw new UnsupportedError("transform3d-arg-type", `rotated() 的第 2 参只量过数（收到 ${angle === undefined ? "缺参" : tagName(angle.t)}）`);
      const rot = axisAngleBasis(axis.x, axis.y, axis.z, Number(angle.v));
      const bs = asBasis(basisMul(rot, basis)) as GBasis;
      const p = basisXform(rot, inner.ox, inner.oy, inner.oz);
      return transform3d(bs.x0, bs.x1, bs.x2, bs.y0, bs.y1, bs.y2, bs.z0, bs.z1, bs.z2, p[0], p[1], p[2]);
    }
    case "scaled": {
      const s = vecArg(args, "scaled");
      return transform3d(
        r(basis.x0 * s.x), r(basis.x1 * s.y), r(basis.x2 * s.z),
        r(basis.y0 * s.x), r(basis.y1 * s.y), r(basis.y2 * s.z),
        r(basis.z0 * s.x), r(basis.z1 * s.y), r(basis.z2 * s.z),
        r(inner.ox * s.x), r(inner.oy * s.y), r(inner.oz * s.z),
      );
    }
    case "translated": {
      const d = vecArg(args, "translated");
      return reParts(basis, r(inner.ox + d.x), r(inner.oy + d.y), r(inner.oz + d.z));
    }
    case "inverse": {
      if (args.length !== 0) throw new UnsupportedError("transform3d-arity", "inverse() 只量过 0 个实参");
      const ox = r(-r(r(r(basis.x0 * inner.ox) + r(basis.x1 * inner.oy)) + r(basis.x2 * inner.oz)));
      const oy = r(-r(r(r(basis.y0 * inner.ox) + r(basis.y1 * inner.oy)) + r(basis.y2 * inner.oz)));
      const oz = r(-r(r(r(basis.z0 * inner.ox) + r(basis.z1 * inner.oy)) + r(basis.z2 * inner.oz)));
      return transform3d(basis.x0, basis.y0, basis.z0, basis.x1, basis.y1, basis.z1, basis.x2, basis.y2, basis.z2, ox, oy, oz);
    }
    case "is_equal_approx": {
      const o = args[0];
      if (o === undefined || !(o.v instanceof GTransform3D)) throw new UnsupportedError("transform3d-arg-type", "is_equal_approx() 只量过 Transform3D");
      const b = o.v as GTransform3D;
      const eq = (m: number, n: number): boolean => Math.abs(m - n) < 1e-5;
      return V.bool(eq(inner.x0, b.x0) && eq(inner.x1, b.x1) && eq(inner.x2, b.x2) && eq(inner.y0, b.y0) && eq(inner.y1, b.y1) && eq(inner.y2, b.y2) && eq(inner.z0, b.z0) && eq(inner.z1, b.z1) && eq(inner.z2, b.z2) && eq(inner.ox, b.ox) && eq(inner.oy, b.oy) && eq(inner.oz, b.oz));
    }
    case "rotated_local": {
      const axis = vecArg(args, "rotated_local");
      const angle = args[1] as Variant;
      if (angle === undefined || (angle.t !== Tag.INT && angle.t !== Tag.FLOAT)) throw new UnsupportedError("transform3d-arg-type", "rotated_local() 的第 2 参只量过数");
      const rot = axisAngleBasis(axis.x, axis.y, axis.z, Number(angle.v));
      const bs = asBasis(basisMul(basis, rot)) as GBasis;
      return transform3d(bs.x0, bs.x1, bs.x2, bs.y0, bs.y1, bs.y2, bs.z0, bs.z1, bs.z2, inner.ox, inner.oy, inner.oz);
    }
    case "scaled_local": {
      const s = vecArg(args, "scaled_local");
      return transform3d(r(basis.x0 * s.x), r(basis.x1 * s.x), r(basis.x2 * s.x), r(basis.y0 * s.y), r(basis.y1 * s.y), r(basis.y2 * s.y), r(basis.z0 * s.z), r(basis.z1 * s.z), r(basis.z2 * s.z), inner.ox, inner.oy, inner.oz);
    }
    case "translated_local": {
      const d = vecArg(args, "translated_local");
      const p = basisXform(basis, d.x, d.y, d.z);
      return reParts(basis, r(inner.ox + p[0]), r(inner.oy + p[1]), r(inner.oz + p[2]));
    }
    case "interpolate_with": {
      const o = args[0];
      const w = args[1];
      if (o === undefined || !(o.v instanceof GTransform3D) || w === undefined) throw new UnsupportedError("transform3d-arg", "interpolate_with() 只量过 (Transform3D, 数)");
      const other = o.v as GTransform3D;
      const ob = transform3dBasisParts(other);
      const t = Math.fround(Number(w.v));
      const qa = quatOfBasis(basis);
      const qb = quatOfBasis(ob);
      const q = slerpQuat(qa, qb, t);
      const bs = asBasis(basisFromQuaternion(q)) as GBasis;
      const sa = basisScaleParts(basis);
      const sb = basisScaleParts(ob);
      const sx = r(sa[0] + r(t * r(sb[0] - sa[0])));
      const sy = r(sa[1] + r(t * r(sb[1] - sa[1])));
      const sz = r(sa[2] + r(t * r(sb[2] - sa[2])));
      return transform3d(
        r(bs.x0 * sx), r(bs.x1 * sy), r(bs.x2 * sz),
        r(bs.y0 * sx), r(bs.y1 * sy), r(bs.y2 * sz),
        r(bs.z0 * sx), r(bs.z1 * sy), r(bs.z2 * sz),
        r(inner.ox + r(t * r(other.ox - inner.ox))),
        r(inner.oy + r(t * r(other.oy - inner.oy))),
        r(inner.oz + r(t * r(other.oz - inner.oz))),
      );
    }
    case "looking_at": {
      const target = vecArg(args, "looking_at");
      const upArg = args[1] === undefined ? vector3(0, 1, 0) : args[1];
      const up = asVec3(upArg as Variant);
      if (up === null) throw new UnsupportedError("transform3d-arg", "looking_at() 的 up 只量过 Vector3");
      const front = args[2] !== undefined && args[2].t === Tag.BOOL && args[2].v === true;
      const dx = front ? target.x - inner.ox : inner.ox - target.x;
      const dy = front ? target.y - inner.oy : inner.oy - target.y;
      const dz = front ? target.z - inner.oz : inner.oz - target.z;
      const dl = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const zx = dx / dl;
      const zy = dy / dl;
      const zz = dz / dl;
      let xx = up.y * zz - up.z * zy;
      let xy = up.z * zx - up.x * zz;
      let xz = up.x * zy - up.y * zx;
      const xl = Math.sqrt(xx * xx + xy * xy + xz * xz);
      if (xl === 0) throw new UnsupportedError("transform3d-look-up", "looking_at() 与 up 平行那一形没量过");
      xx /= xl;
      xy /= xl;
      xz /= xl;
      const yx = zy * xz - zz * xy;
      const yy = zz * xx - zx * xz;
      const yz = zx * xy - zy * xx;
      return transform3d(xx, xy, xz, yx, yy, yz, zx, zy, zz, inner.ox, inner.oy, inner.oz);
    }
    case "is_finite": {
      if (args.length !== 0) throw new UnsupportedError("transform3d-arity", `is_finite() 只量过 0 个实参（收到 ${args.length} 个）`);
      return V.bool(
        Number.isFinite(inner.x0) && Number.isFinite(inner.x1) && Number.isFinite(inner.x2)
        && Number.isFinite(inner.y0) && Number.isFinite(inner.y1) && Number.isFinite(inner.y2)
        && Number.isFinite(inner.z0) && Number.isFinite(inner.z1) && Number.isFinite(inner.z2)
        && Number.isFinite(inner.ox) && Number.isFinite(inner.oy) && Number.isFinite(inner.oz),
      );
    }
    default:
      throw new UnsupportedError("transform3d-method", `Transform3D.${name}() 这一支没量过（interpolate_with / looking_at / is_equal_approx 还没落地）`);
  }
}