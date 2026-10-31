import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GAABB } from "../composite-classes";
import { asVec3, vector3 } from "../class/vector/vector3";
import { aabb } from "../aabb";

const r = Math.fround;

function other(v: Variant | undefined): GAABB {
  if (v !== undefined && v.t === Tag.OBJECT && v.v instanceof GAABB) return v.v as GAABB;
  throw new UnsupportedError("aabb-arg-type", "AABB 的这一支方法只量过 AABB 实参");
}

function pt(v: Variant | undefined): Variant {
  if (v === undefined) throw new UnsupportedError("aabb-arity", "AABB 的这一支方法只量过 1 个实参");
  return v;
}

export function aabbMethod(inner: GAABB, name: string, args: Variant[]): Variant {
  const px = inner.x;
  const py = inner.y;
  const pz = inner.z;
  const sx = inner.sx;
  const sy = inner.sy;
  const sz = inner.sz;
  const ex = r(px + sx);
  const ey = r(py + sy);
  const ez = r(pz + sz);
  switch (name) {
    case "get_volume":
      return V.float(r(r(sx * sy) * sz));
    case "has_volume":
      return V.bool(sx > 0 && sy > 0 && sz > 0);
    case "get_center":
      return vector3(r(px + r(sx / 2)), r(py + r(sy / 2)), r(pz + r(sz / 2)));
    case "has_point": {
      const p = asVec3(pt(args[0]));
      if (p === null) throw new UnsupportedError("aabb-arg-type", "AABB.has_point() 的实参只量过 Vector3");
      return V.bool(p.x >= px && p.y >= py && p.z >= pz && p.x <= ex && p.y <= ey && p.z <= ez);
    }
    case "intersects": {
      const o = other(args[0]);
      return V.bool(px < r(o.x + o.sx) && ex > o.x && py < r(o.y + o.sy) && ey > o.y && pz < r(o.z + o.sz) && ez > o.z);
    }
    case "merge": {
      const o = other(args[0]);
      const nx = Math.min(px, o.x);
      const ny = Math.min(py, o.y);
      const nz = Math.min(pz, o.z);
      return aabb(nx, ny, nz, r(Math.max(ex, r(o.x + o.sx)) - nx), r(Math.max(ey, r(o.y + o.sy)) - ny), r(Math.max(ez, r(o.z + o.sz)) - nz));
    }
    case "expand": {
      const p = asVec3(pt(args[0]));
      if (p === null) throw new UnsupportedError("aabb-arg-type", "AABB.expand() 的实参只量过 Vector3");
      const nx = Math.min(px, p.x);
      const ny = Math.min(py, p.y);
      const nz = Math.min(pz, p.z);
      return aabb(nx, ny, nz, r(Math.max(ex, p.x) - nx), r(Math.max(ey, p.y) - ny), r(Math.max(ez, p.z) - nz));
    }
    case "is_finite":
      return V.bool(Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(pz) && Number.isFinite(sx) && Number.isFinite(sy) && Number.isFinite(sz));
    case "is_equal_approx": {
      const o = other(args[0]);
      return V.bool(px === o.x && py === o.y && pz === o.z && sx === o.sx && sy === o.sy && sz === o.sz);
    }
    default:
      throw new UnsupportedError("aabb-method", `AABB.${name}() 这一支没量过（get_support / 轴向那几支还没读数）`);
  }
}
