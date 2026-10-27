import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GBasis } from "../composite-classes";
import { asVec3, vector3 } from "../vector3";
import { axisAngleBasis, basis, basisDeterminant, basisMul } from "../basis";

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
      const det = basisDeterminant(inner);
      if (det === 0) throw new UnsupportedError("basis-inverse", "Basis.inverse() 的行列式为零那一形没量过");
      const rd = r(1 / det);
      const x0 = inner.x0, x1 = inner.x1, x2 = inner.x2;
      const y0 = inner.y0, y1 = inner.y1, y2 = inner.y2;
      const z0 = inner.z0, z1 = inner.z1, z2 = inner.z2;
      return basis(
        r(rd * r(r(y1 * z2) - r(z1 * y2))), r(rd * r(r(z1 * x2) - r(x1 * z2))), r(rd * r(r(x1 * y2) - r(y1 * x2))),
        r(rd * r(r(y2 * z0) - r(z2 * y0))), r(rd * r(r(x0 * z2) - r(z0 * x2))), r(rd * r(r(x2 * y0) - r(y2 * x0))),
        r(rd * r(r(y0 * z1) - r(z0 * y1))), r(rd * r(r(x1 * z0) - r(z1 * x0))), r(rd * r(r(x0 * y1) - r(y0 * x1))),
      );
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
