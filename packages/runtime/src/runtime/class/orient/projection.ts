import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asTransform3D, type GTransform3D } from "./transform3d";
import { asVec4, GVector4, vector4 } from "../vector/vector4";

export class GProjection {
  x: GVector4;
  y: GVector4;
  z: GVector4;
  w: GVector4;
  constructor(x: GVector4, y: GVector4, z: GVector4, w: GVector4) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}

export function asProjection(v: Variant): GProjection | null {
  return v.t === Tag.OBJECT && v.v instanceof GProjection ? (v.v as GProjection) : null;
}

export const PROJECTION_IDENTITY = new GProjection(new GVector4(1, 0, 0, 0), new GVector4(0, 1, 0, 0), new GVector4(0, 0, 1, 0), new GVector4(0, 0, 0, 1));

export function projection(x: GVector4, y: GVector4, z: GVector4, w: GVector4): Variant {
  return V.object(new GProjection(x, y, z, w));
}

export function projectionCopy(p: GProjection): Variant {
  return projection(p.x, p.y, p.z, p.w);
}

export function projectionNew(args: Variant[]): Variant {
  if (args.length === 0) return projectionCopy(PROJECTION_IDENTITY);
  if (args.length === 1) {
    const t = asTransform3D(args[0] as Variant);
    if (t === null) throw new UnsupportedError("projection-arg", `Projection() 的单参只量过 Transform3D（收到 ${tagName((args[0] as Variant).t)}）`);
    return projection(
      vector4(t.x0, t.x1, t.x2, 0).v as GVector4,
      vector4(t.y0, t.y1, t.y2, 0).v as GVector4,
      vector4(t.z0, t.z1, t.z2, 0).v as GVector4,
      vector4(t.ox, t.oy, t.oz, 1).v as GVector4,
    );
  }
  if (args.length === 4) {
    const x = asVec4(args[0] as Variant);
    const y = asVec4(args[1] as Variant);
    const z = asVec4(args[2] as Variant);
    const w = asVec4(args[3] as Variant);
    if (x === null || y === null || z === null || w === null) throw new UnsupportedError("projection-arg", "Projection() 的四参只量过 Vector4");
    return projection(x, y, z, w);
  }
  throw new UnsupportedError("projection-arity", `Projection() 只量过 0、1、4 个实参（收到 ${args.length} 个）`);
}

export function projectionText(p: GProjection): string {
  const row = (v: GVector4): string => `(${strVec2(v.x)}, ${strVec2(v.y)}, ${strVec2(v.z)}, ${strVec2(v.w)})`;
  return `[X: ${row(p.x)}, Y: ${row(p.y)}, Z: ${row(p.z)}, W: ${row(p.w)}]`;
}

export function projectionMethod(target: GProjection, name: string, args: Variant[]): Variant {
  switch (name) {
    case "determinant": {
      if (args.length !== 0) throw new UnsupportedError("projection-arity", "determinant() 不接受实参");
      const m = [p1(target.x), p1(target.y), p1(target.z), p1(target.w)];
      const a = m[0] as [number, number, number, number];
      const b = m[1] as [number, number, number, number];
      const c = m[2] as [number, number, number, number];
      const d = m[3] as [number, number, number, number];
      const det =
        a[0] * (b[1] * (c[2] * d[3] - c[3] * d[2]) - b[2] * (c[1] * d[3] - c[3] * d[1]) + b[3] * (c[1] * d[2] - c[2] * d[1])) -
        a[1] * (b[0] * (c[2] * d[3] - c[3] * d[2]) - b[2] * (c[0] * d[3] - c[3] * d[0]) + b[3] * (c[0] * d[2] - c[2] * d[0])) +
        a[2] * (b[0] * (c[1] * d[3] - c[3] * d[1]) - b[1] * (c[0] * d[3] - c[3] * d[0]) + b[3] * (c[0] * d[1] - c[1] * d[0])) -
        a[3] * (b[0] * (c[1] * d[2] - c[2] * d[1]) - b[1] * (c[0] * d[2] - c[2] * d[0]) + b[2] * (c[0] * d[1] - c[1] * d[0]));
      return V.float(det);
    }
    case "is_equal_approx": {
      const o = asProjection(args[0] as Variant);
      if (o === null) throw new UnsupportedError("projection-arg", "is_equal_approx() 只量过 Projection");
      const eq = (u: number, v: number): boolean => Math.abs(u - v) < 1e-5;
      const row = (a: GVector4, b: GVector4): boolean => eq(a.x, b.x) && eq(a.y, b.y) && eq(a.z, b.z) && eq(a.w, b.w);
      return V.bool(row(target.x, o.x) && row(target.y, o.y) && row(target.z, o.z) && row(target.w, o.w));
    }
    default:
      throw new UnsupportedError("projection-method", `Projection.${name}() 这一支没量过`);
  }
}

function p1(v: GVector4): [number, number, number, number] {
  return [v.x, v.y, v.z, v.w];
}

export function projectionReadProp(p: GProjection, name: string): Variant | null {
  if (name === "x") return V.object(p.x);
  if (name === "y") return V.object(p.y);
  if (name === "z") return V.object(p.z);
  if (name === "w") return V.object(p.w);
  return null;
}
