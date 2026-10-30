import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asBasis, GBasis, basis, basisMul, basisXform, axisAngleBasis, basisInverseParts, basisOrthoParts } from "./basis";
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