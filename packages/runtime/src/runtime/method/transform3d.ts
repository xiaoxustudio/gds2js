import { Tag, V, tagName, type Variant } from "../tags";
import { UnsupportedError } from "../errors";
import { asBasis, GBasis, type GTransform3D } from "../composite-classes";
import { asVec3 } from "../class/vector/vector3";
import { axisAngleBasis, basisInverseParts, basisMul, basisOrthoParts, basisXform } from "../basis";
import { transform3d, transform3dBasisParts, transform3dOfParts } from "../transform3d";

const r = Math.fround;

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
