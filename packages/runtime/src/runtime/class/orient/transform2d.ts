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
    case "basis_xform": {
      const v = asVec2(args[0] as Variant);
      if (v === null) throw new UnsupportedError("transform2d-arg-type", "Transform2D.basis_xform() 的实参只量过 Vector2");
      return vector2(r(r(xx * v.x) + r(yx * v.y)), r(r(xy * v.x) + r(yy * v.y)));
    }
    case "basis_xform_inv": {
      const v = asVec2(args[0] as Variant);
      if (v === null) throw new UnsupportedError("transform2d-arg-type", "Transform2D.basis_xform_inv() 的实参只量过 Vector2");
      return vector2(r(r(xx * v.x) + r(xy * v.y)), r(r(yx * v.x) + r(yy * v.y)));
    }
    case "get_origin":
      return vector2(inner.ox, inner.oy);
    case "get_skew": {
      const det = r(r(xx * yy) - r(xy * yx));
      const l0 = r(Math.sqrt(r(r(xx * xx) + r(xy * xy))));
      const l1 = r(Math.sqrt(r(r(yx * yx) + r(yy * yy))));
      const n0x = l0 === 0 ? 0 : r(xx / l0);
      const n0y = l0 === 0 ? 0 : r(xy / l0);
      const n1x = l1 === 0 ? 0 : r(yx / l1);
      const n1y = l1 === 0 ? 0 : r(yy / l1);
      const sgn = det < 0 ? -1 : 1;
      const dot = r(r(n0x * r(sgn * n1x)) + r(n0y * r(sgn * n1y)));
      return V.float(r(Math.acos(dot) - r(r(Math.PI) * r(0.5))));
    }
    case "inverse": {
      const ox = r(-(r(xx * inner.ox) + r(xy * inner.oy)));
      const oy = r(-(r(yx * inner.ox) + r(yy * inner.oy)));
      return transform2d(xx, yx, xy, yy, ox, oy);
    }
    case "orthonormalized": {
      const lx = r(Math.sqrt(r(xx * xx) + r(xy * xy)));
      if (lx === 0) throw new UnsupportedError("transform2d-inverse", "orthonormalized() 的零列那一形没量过");
      const nx = r(xx / lx);
      const ny = r(xy / lx);
      const proj = r(nx * yx + ny * yy);
      const oy1 = r(yy - r(proj * ny));
      const oy0 = r(yx - r(proj * nx));
      const ly = r(Math.sqrt(r(oy0 * oy0) + r(oy1 * oy1)));
      return transform2d(nx, ny, r(oy0 / ly), r(oy1 / ly), inner.ox, inner.oy);
    }
    case "is_equal_approx": {
      const o = args[0];
      if (o === undefined || !(o.v instanceof GTransform2D)) throw new UnsupportedError("transform2d-arg-type", "Transform2D.is_equal_approx() 的实参只量过 Transform2D");
      const b = o.v as GTransform2D;
      const eq = (m: number, n: number): boolean => Math.abs(m - n) < 1e-5;
      return V.bool(eq(xx, b.xx) && eq(xy, b.xy) && eq(yx, b.yx) && eq(yy, b.yy) && eq(inner.ox, b.ox) && eq(inner.oy, b.oy));
    }
    case "is_finite":
      return V.bool([xx, xy, yx, yy, inner.ox, inner.oy].every((n) => Number.isFinite(n)));
    case "rotated_local": {
      const a = args[0] as Variant;
      if (a === undefined || (a.t !== Tag.INT && a.t !== Tag.FLOAT)) throw new UnsupportedError("transform2d-arg-type", "rotated_local() 的实参只量过数");
      const c = r(Math.cos(Number(a.v)));
      const s = r(Math.sin(Number(a.v)));
      return transform2d(r(r(xx * c) + r(yx * s)), r(r(xy * c) + r(yy * s)), r(r(-xx * s) + r(yx * c)), r(r(-xy * s) + r(yy * c)), inner.ox, inner.oy);
    }
    case "scaled_local": {
      const v = asVec2(args[0] as Variant);
      if (v === null) throw new UnsupportedError("transform2d-arg-type", "scaled_local() 的实参只量过 Vector2");
      return transform2d(r(xx * v.x), r(xy * v.x), r(yx * v.y), r(yy * v.y), inner.ox, inner.oy);
    }
    case "translated_local": {
      const v = asVec2(args[0] as Variant);
      if (v === null) throw new UnsupportedError("transform2d-arg-type", "translated_local() 的实参只量过 Vector2");
      return transform2d(xx, xy, yx, yy, r(inner.ox + r(r(xx * v.x) + r(yx * v.y))), r(inner.oy + r(r(xy * v.x) + r(yy * v.y))));
    }
    case "interpolate_with": {
      const o = args[0];
      const w = args[1];
      if (o === undefined || !(o.v instanceof GTransform2D) || w === undefined) throw new UnsupportedError("transform2d-arg-type", "interpolate_with() 只量过 (Transform2D, 数)");
      const b = o.v as GTransform2D;
      const t = r(Number(w.v));
      const ra = Math.atan2(xy, xx);
      const rb = Math.atan2(b.xy, b.xx);
      const rot = r(ra + r(t * r(rb - ra)));
      const sa = Math.sqrt(r(xx * xx) + r(xy * xy));
      const sb = Math.sqrt(r(b.xx * b.xx) + r(b.xy * b.xy));
      const sx = r(sa + r(t * r(sb - sa)));
      const ya = Math.sqrt(r(yx * yx) + r(yy * yy));
      const yb = Math.sqrt(r(b.yx * b.yx) + r(b.yy * b.yy));
      const sy = r(ya + r(t * r(yb - ya)));
      const ka = r(r(Math.atan2(yy, yx) - Math.atan2(xy, xx)) - r(Math.PI / 2));
      const kb = r(r(Math.atan2(b.yy, b.yx) - Math.atan2(b.xy, b.xx)) - r(Math.PI / 2));
      const skew = r(ka + r(t * r(kb - ka)));
      return transform2d(
        r(Math.cos(rot) * sx), r(Math.sin(rot) * sx),
        r(-Math.sin(r(rot + skew)) * sy), r(Math.cos(r(rot + skew)) * sy),
        r(inner.ox + r(t * r(b.ox - inner.ox))), r(inner.oy + r(t * r(b.oy - inner.oy))),
      );
    }
    case "looking_at": {
      const p = asVec2(args[0] as Variant);
      if (p === null) throw new UnsupportedError("transform2d-arg-type", "looking_at() 只量过 Vector2");
      const a = r(Math.atan2(p.y, p.x));
      const c = r(Math.cos(a));
      const s = r(Math.sin(a));
      return transform2d(c, s, r(-s), c, inner.ox, inner.oy);
    }
    case "is_conformal":
      return V.bool(r(r(xx * yx) + r(xy * yy)) === 0 && r(r(xx * xx) + r(xy * xy)) === r(r(yx * yx) + r(yy * yy)));
    default:
      throw new UnsupportedError("transform2d-method", `Transform2D.${name}() 这一支没量过（interpolate_with / xform / basis_xform 那几支还没读数）`);
  }
}
export function transform2dStatic(name: string, args: Variant[] = []): Variant {
  if (args.length === 0) {
    if (name === "IDENTITY") return transform2d(1, 0, 0, 1, 0, 0);
    if (name === "FLIP_X") return transform2d(-1, 0, 0, 1, 0, 0);
    if (name === "FLIP_Y") return transform2d(1, 0, 0, -1, 0, 0);
  }
  throw new UnsupportedError("transform2d-static", `Transform2D.${name} 这一支没量过`);
}
