import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GBasis } from "../composite-classes";
import { asVec3, vector3 } from "../class/vector/vector3";
import { axisAngleBasis, basis, basisDeterminant, basisInverseParts, basisMul } from "../basis";

const r = Math.fround;

function columnLength(x: number, y: number, z: number): number {
  return r(Math.sqrt(r(r(r(x * x) + r(y * y)) + r(z * z))));
}

function dot3(ax: number, ay: number, az: number, bx: number, by: number, bz: number): number {
  return r(r(r(ax * bx) + r(ay * by)) + r(az * bz));
}

export function basisMethod(inner: GBasis, name: string, args: Variant[]): Variant {
  switch (name) {
    case "determinant":
      return V.float(basisDeterminant(inner));
    case "transposed":
      return basis(inner.x0, inner.y0, inner.z0, inner.x1, inner.y1, inner.z1, inner.x2, inner.y2, inner.z2);
    case "inverse": {
      const inv = basisInverseParts(inner);
      if (inv === null) throw new UnsupportedError("basis-inverse", "Basis.inverse() 的行列式为零那一形没量过");
      return basis(inv.x0, inv.x1, inv.x2, inv.y0, inv.y1, inv.y2, inv.z0, inv.z1, inv.z2);
    }
    case "get_scale": {
      const det = basisDeterminant(inner);
      const sign = det > 0 ? 1 : -1;
      return vector3(
        r(sign * columnLength(inner.x0, inner.x1, inner.x2)),
        r(sign * columnLength(inner.y0, inner.y1, inner.y2)),
        r(sign * columnLength(inner.z0, inner.z1, inner.z2)),
      );
    }
    case "rotated": {
      const axis = asVec3(args[0] as Variant);
      if (axis === null) throw new UnsupportedError("basis-arg-type", "Basis.rotated() 的第 1 参只量过 Vector3");
      const angle = args[1] as Variant;
      if (angle === undefined || (angle.t !== Tag.INT && angle.t !== Tag.FLOAT)) throw new UnsupportedError("basis-arg-type", "Basis.rotated() 的第 2 参只量过数");
      return basisMul(axisAngleBasis(axis.x, axis.y, axis.z, Number(angle.v)), inner);
    }
    case "tdotx": {
      const v = asVec3(args[0] as Variant);
      if (v === null) throw new UnsupportedError("basis-arg-type", "Basis.tdotx() 的实参只量过 Vector3");
      return V.float(dot3(inner.x0, inner.x1, inner.x2, v.x, v.y, v.z));
    }
    case "tdoty": {
      const v = asVec3(args[0] as Variant);
      if (v === null) throw new UnsupportedError("basis-arg-type", "Basis.tdoty() 的实参只量过 Vector3");
      return V.float(dot3(inner.y0, inner.y1, inner.y2, v.x, v.y, v.z));
    }
    case "tdotz": {
      const v = asVec3(args[0] as Variant);
      if (v === null) throw new UnsupportedError("basis-arg-type", "Basis.tdotz() 的实参只量过 Vector3");
      return V.float(dot3(inner.z0, inner.z1, inner.z2, v.x, v.y, v.z));
    }
    default:
      throw new UnsupportedError("basis-method", `Basis.${name}() 这一支没量过（get_euler / is_conformal / scaled / slerp / looking_at / orthonormalized 那几支还没读数）`);
  }
}
