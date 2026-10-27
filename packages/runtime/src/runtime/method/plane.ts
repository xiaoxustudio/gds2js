import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GPlane } from "../composite-classes";
import { asVec3, vector3 } from "../vector3";
import { plane } from "../plane";

const r = Math.fround;

function vec(v: Variant | undefined): [number, number, number] {
  const p = v === undefined ? null : asVec3(v);
  if (p === null) throw new UnsupportedError("plane-arg-type", "Plane 的这一支方法只量过 Vector3 实参");
  return [p.x, p.y, p.z];
}

export function planeMethod(inner: GPlane, name: string, args: Variant[]): Variant {
  const nx = inner.nx;
  const ny = inner.ny;
  const nz = inner.nz;
  const d = inner.d;
  switch (name) {
    case "normalized": {
      const len = Math.sqrt(r(r(nx * nx) + r(ny * ny)) + r(nz * nz));
      if (len === 0) throw new UnsupportedError("plane-normalized-zero", "Plane().normalized() 法身为零那一形没量过");
      return plane(r(nx / len), r(ny / len), r(nz / len), r(d / len));
    }
    case "distance_to": {
      const p = vec(args[0]);
      return V.float(r(r(r(nx * p[0]) + r(ny * p[1])) + r(nz * p[2])) - d);
    }
    case "has_point": {
      const p = vec(args[0]);
      return V.bool(Math.abs(r(r(r(nx * p[0]) + r(ny * p[1])) + r(nz * p[2])) - d) <= 0.00001);
    }
    case "intersects_ray": {
      if (args.length !== 2) throw new UnsupportedError("plane-arity", `Plane.intersects_ray() 只量过 2 个实参（收到 ${args.length} 个）`);
      const from = vec(args[0]);
      const dir = vec(args[1]);
      const den = r(r(nx * dir[0]) + r(ny * dir[1])) + r(nz * dir[2]);
      if (den === 0) return V.nil();
      const tf = r(r(d - r(r(nx * from[0]) + r(ny * from[1])) + r(nz * from[2])) / den);
      return vector3(r(from[0] + r(tf * dir[0])), r(from[1] + r(tf * dir[1])), r(from[2] + r(tf * dir[2])));
    }
    case "is_equal_approx": {
      const o = args[0];
      if (o === undefined || !(o.t === Tag.OBJECT && o.v instanceof GPlane)) throw new UnsupportedError("plane-arg-type", "Plane.is_equal_approx() 的实参只量过 Plane");
      const p = o.v as GPlane;
      return V.bool(nx === p.nx && ny === p.ny && nz === p.nz && d === p.d);
    }
    default:
      throw new UnsupportedError("plane-method", `Plane.${name}() 这一支没量过（intersects_segment / intersects_plane / get_center 那几支还没读数）`);
  }
}
