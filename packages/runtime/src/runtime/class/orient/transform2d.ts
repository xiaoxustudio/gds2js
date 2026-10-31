import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asVec2, vector2 } from "../vector/vector2";

export class GTransform2D {
  xx: number;
  xy: number;
  yx: number;
  yy: number;
  ox: number;
  oy: number;
  constructor(xx: number, xy: number, yx: number, yy: number, ox: number, oy: number) {
    const f = Math.fround;
    this.xx = f(xx);
    this.xy = f(xy);
    this.yx = f(yx);
    this.yy = f(yy);
    this.ox = f(ox);
    this.oy = f(oy);
  }
}

export function asTransform2D(v: Variant): GTransform2D | null {
  return v.t === Tag.OBJECT && v.v instanceof GTransform2D ? (v.v as GTransform2D) : null;
}

const r = Math.fround;
export function transform2d(xx: number, xy: number, yx: number, yy: number, ox: number, oy: number): Variant {
  return V.object(new GTransform2D(xx, xy, yx, yy, ox, oy));
}
function num(v: Variant | undefined, at: string): number {
  if (v === undefined) throw new UnsupportedError("transform2d-arity", `Transform2D() 的 ${at} 缺了`);
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return Number(v.v);
  throw new UnsupportedError("transform2d-arg", `Transform2D() 的 ${at} 只量过数（收到 ${tagName(v.t)}）`);
}
function rotCols(angle: number): [number, number, number, number] {
  return [r(Math.cos(angle)), r(Math.sin(angle)), r(-Math.sin(angle)), r(Math.cos(angle))];
}
export function transform2dNew(args: Variant[]): Variant {
  if (args.length === 0) return transform2d(1, 0, 0, 1, 0, 0);
  if (args.length === 2) {
    const a = asVec2(args[0] as Variant);
    const b = asVec2(args[1] as Variant);
    if (a !== null && b !== null) return transform2d(a.x, a.y, b.x, b.y, 0, 0);
    if (a === null && b !== null) {
      const [xx, xy, yx, yy] = rotCols(num(args[0], "第 1 参"));
      return transform2d(xx, xy, yx, yy, b.x, b.y);
    }
    throw new UnsupportedError("transform2d-arg", `Transform2D() 两参只量过 (Vector2, Vector2) 与 (角度, Vector2)`);
  }
  if (args.length === 3) {
    const x = asVec2(args[0] as Variant);
    const y = asVec2(args[1] as Variant);
    const o = asVec2(args[2] as Variant);
    if (x !== null && y !== null && o !== null) return transform2d(x.x, x.y, y.x, y.y, o.x, o.y);
    throw new UnsupportedError("transform2d-arg", "Transform2D() 三参只量过 (Vector2, Vector2, Vector2)");
  }
  if (args.length === 6) {
    return transform2d(num(args[0], "第 1 参"), num(args[1], "第 2 参"), num(args[2], "第 3 参"), num(args[3], "第 4 参"), num(args[4], "第 5 参"), num(args[5], "第 6 参"));
  }
  throw new UnsupportedError("transform2d-arity", `Transform2D() 只量过 0、2、3、6 个实参（收到 ${args.length} 个）`);
}
export function toTransform2D(v: Variant): Variant {
  const t = asTransform2D(v);
  if (t !== null) return v;
  return transform2dNew([v]);
}
export function transform2dText(v: GTransform2D): string {
  return `[X: (${strVec2(v.xx)}, ${strVec2(v.xy)}), Y: (${strVec2(v.yx)}, ${strVec2(v.yy)}), O: (${strVec2(v.ox)}, ${strVec2(v.oy)})]`;
}
export function transform2dReadProp(v: GTransform2D, name: string): Variant | null {
  if (name === "x") return vector2(v.xx, v.xy);
  if (name === "y") return vector2(v.yx, v.yy);
  if (name === "origin") return vector2(v.ox, v.oy);
  return null;
}
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