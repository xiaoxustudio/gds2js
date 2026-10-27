import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { num6Text, strVec2 } from "./string-ops";
import { GPlane, asPlane } from "./composite-classes";
import { asVec3, vector3 } from "./vector3";

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

export { GPlane };
