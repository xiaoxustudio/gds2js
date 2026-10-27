import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GTransform2D } from "../composite-classes";
import { asVec2, vector2 } from "../vector2";
import { transform2d } from "../transform2d";

const r = Math.fround;

function cols(t: GTransform2D): [number, number, number, number] {
  return [t.xx, t.xy, t.yx, t.yy];
}

export function transform2dMethod(inner: GTransform2D, name: string, args: Variant[]): Variant {
  const [xx, xy, yx, yy] = cols(inner);
  switch (name) {
    case "determinant":
      return V.float(r(r(xx * yy) - r(xy * yx)));
    case "get_rotation":
      return V.float(Math.atan2(xy, xx));
    case "get_scale":
      return vector2(r(Math.sqrt(r(xx * xx) + r(xy * xy))), r(Math.sqrt(r(yx * yx) + r(yy * yy))));
    case "affine_inverse": {
      const det = r(r(xx * yy) - r(xy * yx));
      if (det === 0) throw new UnsupportedError("transform2d-inverse", "Transform2D.affine_inverse() 的行列式为零那一形没量过");
      const ix = r(yy / det);
      const iy = r(-xy / det);
      const jx = r(-yx / det);
      const jy = r(xx / det);
      return transform2d(ix, iy, jx, jy, r(-(r(ix * inner.ox) + r(jx * inner.oy))), r(-(r(iy * inner.ox) + r(jy * inner.oy))));
    }
    case "translated": {
      const d = asVec2(args[0] as Variant);
      if (d === null) throw new UnsupportedError("transform2d-arg-type", "Transform2D.translated() 的实参只量过 Vector2");
      return transform2d(xx, xy, yx, yy, r(inner.ox + d.x), r(inner.oy + d.y));
    }
    case "scaled": {
      const s = asVec2(args[0] as Variant);
      if (s === null) throw new UnsupportedError("transform2d-arg-type", "Transform2D.scaled() 的实参只量过 Vector2");
      return transform2d(r(xx * s.x), r(xy * s.x), r(yx * s.y), r(yy * s.y), r(inner.ox * s.x), r(inner.oy * s.y));
    }
    case "rotated": {
      const a = args[0] as Variant;
      if (a === undefined || (a.t !== Tag.INT && a.t !== Tag.FLOAT)) throw new UnsupportedError("transform2d-arg-type", "Transform2D.rotated() 的实参只量过数");
      const c = r(Math.cos(Number(a.v)));
      const s = r(Math.sin(Number(a.v)));
      return transform2d(r(r(c * xx) - r(s * xy)), r(r(s * xx) + r(c * xy)), r(r(c * yx) - r(s * yy)), r(r(s * yx) + r(c * yy)), r(r(c * inner.ox) - r(s * inner.oy)), r(r(s * inner.ox) + r(c * inner.oy)));
    }
    case "is_conformal":
      return V.bool(r(r(xx * yx) + r(xy * yy)) === 0 && r(r(xx * xx) + r(xy * xy)) === r(r(yx * yx) + r(yy * yy)));
    default:
      throw new UnsupportedError("transform2d-method", `Transform2D.${name}() 这一支没量过（interpolate_with / xform / basis_xform 那几支还没读数）`);
  }
}
