import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asVec3, vector3 } from "../vector/vector3";

export class GAABB {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  constructor(x: number, y: number, z: number, sx: number, sy: number, sz: number) {
    const r = Math.fround;
    this.x = r(x);
    this.y = r(y);
    this.z = r(z);
    this.sx = r(sx);
    this.sy = r(sy);
    this.sz = r(sz);
  }
}

export function asAABB(v: Variant): GAABB | null {
  return v.t === Tag.OBJECT && v.v instanceof GAABB ? (v.v as GAABB) : null;
}

const r = Math.fround;
export function aabb(x: number, y: number, z: number, sx: number, sy: number, sz: number): Variant {
  return V.object(new GAABB(x, y, z, sx, sy, sz));
}
export function aabbNew(args: Variant[]): Variant {
  if (args.length === 0) return aabb(0, 0, 0, 0, 0, 0);
  if (args.length === 2) {
    const p = asVec3(args[0] as Variant);
    const s = asVec3(args[1] as Variant);
    if (p !== null && s !== null) return aabb(p.x, p.y, p.z, s.x, s.y, s.z);
    throw new UnsupportedError("aabb-arg", `AABB() 两参只量过两个 Vector3（${tagName((args[0] as Variant).t)} / ${tagName((args[1] as Variant).t)}）`);
  }
  throw new UnsupportedError("aabb-arity", `AABB() 只量过 0 与 2 个实参（收到 ${args.length} 个）：六数写法只在 var_to_str 的输出里量到过`);
}
export function toAABB(v: Variant): Variant {
  return v.t === Tag.OBJECT && v.v instanceof GAABB ? v : aabbNew([v]);
}
export function aabbText(v: GAABB): string {
  return `[P: (${strVec2(v.x)}, ${strVec2(v.y)}, ${strVec2(v.z)}), S: (${strVec2(v.sx)}, ${strVec2(v.sy)}, ${strVec2(v.sz)})]`;
}
export function aabbReadProp(v: GAABB, name: string): Variant | null {
  if (name === "position") return vector3(v.x, v.y, v.z);
  if (name === "size") return vector3(v.sx, v.sy, v.sz);
  if (name === "end") return vector3(r(v.x + v.sx), r(v.y + v.sy), r(v.z + v.sz));
  return null;
}
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
    case "get_longest_axis_index":
      return V.int(sx >= sy && sx >= sz ? 0 : sy >= sz ? 1 : 2);
    case "get_shortest_axis_index":
      return V.int(sx <= sy && sx <= sz ? 0 : sy <= sz ? 1 : 2);
    case "get_longest_axis": {
      const i = sx >= sy && sx >= sz ? 0 : sy >= sz ? 1 : 2;
      return vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
    }
    case "get_shortest_axis": {
      const i = sx <= sy && sx <= sz ? 0 : sy <= sz ? 1 : 2;
      return vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
    }
    case "get_longest_axis_size":
      return V.float(sx >= sy && sx >= sz ? sx : sy >= sz ? sy : sz);
    case "get_shortest_axis_size":
      return V.float(sx <= sy && sx <= sz ? sx : sy <= sz ? sy : sz);
    case "get_support": {
      const d = asVec3(pt(args[0]));
      if (d === null) throw new UnsupportedError("aabb-arg-type", "AABB.get_support() 的实参只量过 Vector3");
      return vector3(d.x >= 0 ? ex : px, d.y >= 0 ? ey : py, d.z >= 0 ? ez : pz);
    }
    case "has_surface":
      return V.bool(sx > 0 || sy > 0 || sz > 0);
    case "abs": {
      const nx = sx < 0 ? r(px + sx) : px;
      const ny = sy < 0 ? r(py + sy) : py;
      const nz = sz < 0 ? r(pz + sz) : pz;
      return aabb(nx, ny, nz, Math.abs(sx), Math.abs(sy), Math.abs(sz));
    }
    case "grow": {
      const g = args[0];
      if (g === undefined || (g.t !== Tag.INT && g.t !== Tag.FLOAT)) throw new UnsupportedError("aabb-arg-type", "AABB.grow() 的实参只量过数");
      const k = r(Number(g.v));
      return aabb(r(px - k), r(py - k), r(pz - k), r(sx + r(2 * k)), r(sy + r(2 * k)), r(sz + r(2 * k)));
    }
    case "encloses": {
      const o = other(args[0]);
      return V.bool(px <= o.x && py <= o.y && pz <= o.z && ex >= r(o.x + o.sx) && ey >= r(o.y + o.sy) && ez >= r(o.z + o.sz));
    }
    case "intersection": {
      const o = other(args[0]);
      const nx = Math.max(px, o.x);
      const ny = Math.max(py, o.y);
      const nz = Math.max(pz, o.z);
      return aabb(nx, ny, nz, r(Math.min(ex, r(o.x + o.sx)) - nx), r(Math.min(ey, r(o.y + o.sy)) - ny), r(Math.min(ez, r(o.z + o.sz)) - nz));
    }
    case "get_endpoint": {
      const i = args[0];
      if (i === undefined || (i.t !== Tag.INT && i.t !== Tag.FLOAT)) throw new UnsupportedError("aabb-arg-type", "AABB.get_endpoint() 的编号只量过数");
      const n = Math.trunc(Number(i.v));
      return vector3((n & 4) !== 0 ? ex : px, (n & 2) !== 0 ? ey : py, (n & 1) !== 0 ? ez : pz);
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