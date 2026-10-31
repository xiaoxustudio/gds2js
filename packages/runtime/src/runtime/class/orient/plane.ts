import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { num6Text, strVec2 } from "../../numfmt";
import { asVec3, vector3 } from "../vector/vector3";

export class GPlane {
  nx: number;
  ny: number;
  nz: number;
  d: number;
  constructor(nx: number, ny: number, nz: number, d: number) {
    const r = Math.fround;
    this.nx = r(nx);
    this.ny = r(ny);
    this.nz = r(nz);
    this.d = r(d);
  }
}

export function asPlane(v: Variant): GPlane | null {
  return v.t === Tag.OBJECT && v.v instanceof GPlane ? (v.v as GPlane) : null;
}

const r = Math.fround;
export function plane(nx: number, ny: number, nz: number, d: number): Variant {
  return V.object(new GPlane(nx, ny, nz, d));
}
export function asPlaneV(v: Variant): GPlane | null {
  return asPlane(v);
}
function norm3(v: Variant): [number, number, number] | null {
  const p = asVec3(v);
  return p === null ? null : [p.x, p.y, p.z];
}
function cross(ax: number, ay: number, az: number, bx: number, by: number, bz: number): [number, number, number] {
  return [r(r(ay * bz) - r(az * by)), r(r(az * bx) - r(ax * bz)), r(r(ax * by) - r(ay * bx))];
}
export function planeNew(args: Variant[]): Variant {
  if (args.length === 0) return plane(0, 0, 0, 0);
  if (args.length === 1) {
    const p = asPlaneV(args[0] as Variant);
    if (p !== null) return plane(p.nx, p.ny, p.nz, p.d);
    throw new UnsupportedError("plane-arg", `Plane() 单参只量过 Plane 本身（收到 ${tagName((args[0] as Variant).t)}）`);
  }
  if (args.length === 2) {
    const n = norm3(args[0] as Variant);
    const d = args[1] as Variant;
    if (n === null || (d.t !== Tag.INT && d.t !== Tag.FLOAT)) {
      throw new UnsupportedError("plane-arg", `Plane() 两参只量过 (Vector3, 数)（收到 ${tagName((args[0] as Variant).t)} / ${tagName(d.t)}）`);
    }
    return plane(n[0], n[1], n[2], r(Number(d.v)));
  }
  if (args.length === 3) {
    const a = norm3(args[0] as Variant);
    const b = norm3(args[1] as Variant);
    const c = norm3(args[2] as Variant);
    if (a === null || b === null || c === null) throw new UnsupportedError("plane-arg", "Plane() 三参只量过三个 Vector3");
    const ab: [number, number, number] = [r(b[0] - a[0]), r(b[1] - a[1]), r(b[2] - a[2])];
    const ac: [number, number, number] = [r(c[0] - a[0]), r(c[1] - a[1]), r(c[2] - a[2])];
    const n = cross(ac[0], ac[1], ac[2], ab[0], ab[1], ab[2]);
    const len = Math.sqrt(r(r(n[0] * n[0]) + r(n[1] * n[1])) + r(n[2] * n[2]));
    if (len === 0) throw new UnsupportedError("plane-degenerate", "Plane(a, b, c) 三点共线（法身为零）那一形没量过");
    const ux = r(n[0] / len);
    const uy = r(n[1] / len);
    const uz = r(n[2] / len);
    return plane(ux, uy, uz, r(r(ux * a[0]) + r(r(uy * a[1]) + r(uz * a[2]))));
  }
  if (args.length !== 4) throw new UnsupportedError("plane-arity", `Plane() 只量过 0、1、2、3、4 个实参（收到 ${args.length} 个）`);
  const k = (i: number): number => {
    const v = args[i] as Variant;
    if (v.t === Tag.INT || v.t === Tag.FLOAT) return r(Number(v.v));
    throw new UnsupportedError("plane-arg", `Plane() 四参只量过数（第 ${String(i + 1)} 个收到 ${tagName(v.t)}）`);
  };
  return plane(k(0), k(1), k(2), k(3));
}
export function toPlane(v: Variant): Variant {
  const p = asPlaneV(v);
  if (p !== null) return v;
  return planeNew([v]);
}
export function planeText(v: GPlane): string {
  return `[N: (${strVec2(v.nx)}, ${strVec2(v.ny)}, ${strVec2(v.nz)}), D: ${num6Text(v.d)}]`;
}
export function planeReadProp(v: GPlane, name: string): Variant | null {
  if (name === "normal") return vector3(v.nx, v.ny, v.nz);
  if (name === "d") return V.float(v.d);
  return null;
}
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