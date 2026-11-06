import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asTransform3D, type GTransform3D } from "./transform3d";
import { asVec4, GVector4, vector4 } from "../vector/vector4";
import { asVec2, vector2 } from "../vector/vector2";
import { GPlane } from "./plane";

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

function rowOf(v: GVector4): [number, number, number, number] {
  return [v.x, v.y, v.z, v.w];
}

function matOf(p: GProjection): number[][] {
  return [rowOf(p.x), rowOf(p.y), rowOf(p.z), rowOf(p.w)];
}

function det4(m: number[][]): number {
  const a = m[0] as number[];
  let out = 0;
  for (let i = 0; i < 4; i++) {
    const sub: number[][] = [];
    for (let r = 1; r < 4; r++) sub.push((m[r] as number[]).filter((_v, c) => c !== i));
    const d3 = (sub[0] as number[])[0]! * ((sub[1] as number[])[1]! * (sub[2] as number[])[2]! - (sub[1] as number[])[2]! * (sub[2] as number[])[1]!)
      - (sub[0] as number[])[1]! * ((sub[1] as number[])[0]! * (sub[2] as number[])[2]! - (sub[1] as number[])[2]! * (sub[2] as number[])[0]!)
      + (sub[0] as number[])[2]! * ((sub[1] as number[])[0]! * (sub[2] as number[])[1]! - (sub[1] as number[])[1]! * (sub[2] as number[])[0]!);
    out += (i % 2 === 0 ? 1 : -1) * (a[i] as number) * d3;
  }
  return out;
}

function inverseMat(m: number[][]): number[][] | null {
  const det = det4(m);
  if (det === 0) return null;
  const out: number[][] = [];
  for (let r = 0; r < 4; r++) {
    const row: number[] = [];
    for (let c = 0; c < 4; c++) {
      const sub: number[][] = [];
      for (let rr = 0; rr < 4; rr++) {
        if (rr === c) continue;
        sub.push((m[rr] as number[]).filter((_v, cc) => cc !== r));
      }
      const d3 = (sub[0] as number[])[0]! * ((sub[1] as number[])[1]! * (sub[2] as number[])[2]! - (sub[1] as number[])[2]! * (sub[2] as number[])[1]!)
        - (sub[0] as number[])[1]! * ((sub[1] as number[])[0]! * (sub[2] as number[])[2]! - (sub[1] as number[])[2]! * (sub[2] as number[])[0]!)
        + (sub[0] as number[])[2]! * ((sub[1] as number[])[0]! * (sub[2] as number[])[1]! - (sub[1] as number[])[1]! * (sub[2] as number[])[0]!);
      row.push(Math.fround(((r + c) % 2 === 0 ? 1 : -1) * d3 / det));
    }
    out.push(row);
  }
  return out;
}

export function projectionMethod(target: GProjection, name: string, args: Variant[]): Variant {
  switch (name) {
    case "inverse": {
      const inv = inverseMat(matOf(target));
      if (inv === null) throw new UnsupportedError("projection-inverse", "Projection.inverse() 的行列式为零那一形没量过");
      const v = (r: number[]): GVector4 => new GVector4(r[0] as number, r[1] as number, r[2] as number, r[3] as number);
      return projection(v(inv[0] as number[]), v(inv[1] as number[]), v(inv[2] as number[]), v(inv[3] as number[]));
    }
    case "flipped_y":
      return projection(target.x, new GVector4(Math.fround(-target.y.x), Math.fround(-target.y.y), Math.fround(-target.y.z), Math.fround(-target.y.w)), target.z, target.w);
    case "is_orthogonal":
      return V.bool(target.z.w === 0 && target.w.w === 1);
    case "get_z_near":
    case "get_z_far": {
      const zz = target.z.z;
      const wz = target.w.z;
      const ortho = Math.abs(target.z.w) < 1e-6 && Math.abs(target.w.w - 1) < 1e-6;
      if (name === "get_z_near") return V.float(ortho ? Math.fround((wz + 1) / zz) : Math.fround(wz / (zz - 1)));
      return V.float(ortho ? Math.fround((wz - 1) / zz) : Math.fround(wz / (zz + 1)));
    }
    case "get_fov":
      return V.float(Math.fround(2 * Math.atan(1 / Math.abs(target.x.x)) * 180 / Math.PI));
    case "get_fovy": {
      const fovx = args[0];
      const aspect = args[1];
      if (fovx === undefined || aspect === undefined) throw new UnsupportedError("projection-arity", "get_fovy() 需要 fovx 与 aspect");
      const rad = (Number(fovx.v) * Math.PI) / 180;
      return V.float(Math.fround(2 * Math.atan(Math.tan(rad / 2) * Number(aspect.v)) * 180 / Math.PI));
    }
    case "get_viewport_half_extents": {
      const near = target.w.z / (target.z.z - 1);
      return vector2(Math.fround(near / Math.abs(target.x.x)), Math.fround(near / Math.abs(target.y.y)));
    }
    case "get_far_plane_half_extents": {
      const far = target.w.z / (target.z.z + 1);
      return vector2(Math.fround(far / Math.abs(target.x.x)), Math.fround(far / Math.abs(target.y.y)));
    }
    case "get_pixels_per_meter": {
      const w = args[0];
      if (w === undefined) throw new UnsupportedError("projection-arity", "get_pixels_per_meter() 少了宽度");
      const near = target.w.z / (target.z.z - 1);
      const half = Math.fround(near / Math.abs(target.x.x));
      return V.int(Math.floor(Number(w.v) / (2 * half)));
    }
    case "get_lod_multiplier": {
      const fov = 2 * Math.atan(1 / Math.abs(target.x.x));
      return V.float(Math.fround(2 * Math.tan(fov / 2)));
    }
    case "perspective_znear_adjusted": {
      const nn = args[0];
      if (nn === undefined) throw new UnsupportedError("projection-arity", "perspective_znear_adjusted() 少了 near");
      const far = Math.fround(target.w.z / (target.z.z + 1));
      const near = Math.fround(Number(nn.v));
      const nf = Math.fround(near - far);
      return projection(target.x, target.y, new GVector4(0, 0, Math.fround((far + near) / nf), -1), new GVector4(0, 0, Math.fround((2 * far * near) / nf), 0));
    }
    case "jitter_offseted": {
      const v = asVec2(args[0] as Variant);
      if (v === null) throw new UnsupportedError("projection-arg", "jitter_offseted() 只量过 Vector2");
      return projection(target.x, target.y, target.z, new GVector4(Math.fround(target.w.x + v.x), Math.fround(target.w.y + v.y), target.w.z, target.w.w));
    }
    case "get_projection_plane": {
      const i = args[0];
      if (i === undefined) throw new UnsupportedError("projection-arity", "get_projection_plane() 少了平面号");
      const idx = Math.trunc(Number(i.v));
      const near = Math.fround(target.w.z / (target.z.z - 1));
      const far = Math.fround(target.w.z / (target.z.z + 1));
      const norm = (x: number, y: number, z: number, d: number): Variant => {
        const l = Math.fround(Math.sqrt(Math.fround(Math.fround(x * x) + Math.fround(y * y)) + Math.fround(z * z)));
        const p: GPlane = new GPlane(x / l, y / l, z / l, d / l);
        return V.object(p);
      };
      if (idx === 0) return norm(0, 0, 1, -near);
      if (idx === 1) return norm(0, 0, -1, far);
      if (idx === 2) return norm(-target.x.x, 0, 1, 0);
      if (idx === 3) return norm(0, target.y.y, 1, 0);
      if (idx === 4) return norm(target.x.x, 0, 1, 0);
      if (idx === 5) return norm(0, -target.y.y, 1, 0);
      throw new UnsupportedError("projection-plane", "get_projection_plane() 的平面号只量过 0..5");
    }
    case "get_aspect": {
      const len = (v: GVector4): number => Math.fround(Math.sqrt(Math.fround(Math.fround(Math.fround(v.x * v.x) + Math.fround(v.y * v.y)) + Math.fround(v.z * v.z))));
      return V.float(Math.fround(len(target.y) / len(target.x)));
    }
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

function num(v: Variant | undefined, at: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("projection-arg", `Projection.${at} 只量过数`);
  return Number(v.v);
}

function frustum(left: number, right: number, bottom: number, top: number, zn: number, zf: number): Variant {
  const rl = Math.fround(right - left);
  const tb = Math.fround(top - bottom);
  const nf = Math.fround(zn - zf);
  return projection(
    new GVector4(Math.fround(Math.fround(2 * zn) / rl), 0, 0, 0),
    new GVector4(0, Math.fround(Math.fround(2 * zn) / tb), 0, 0),
    new GVector4(Math.fround((right + left) / rl), Math.fround((top + bottom) / tb), Math.fround((zf + zn) / nf), -1),
    new GVector4(0, 0, Math.fround(Math.fround(2 * zf * zn) / nf), 0),
  );
}

export function projectionStatic(name: string, args: Variant[]): Variant {
  switch (name) {
    case "create_perspective": {
      const fovy = num(args[0], "create_perspective");
      const aspect = num(args[1], "create_perspective");
      const zn = num(args[2], "create_perspective");
      const zf = num(args[3], "create_perspective");
      const flip = args[4] !== undefined && args[4].t === Tag.BOOL && args[4].v === true;
      const top = Math.fround(zn * Math.tan((fovy * Math.PI) / 360));
      const right = Math.fround(top * (flip ? 1 / aspect : aspect));
      const left = flip ? Math.fround(-Math.fround(right * aspect)) : -right;
      return frustum(left, right, -top, top, zn, zf);
    }
    case "create_orthogonal": {
      const left = num(args[0], "create_orthogonal");
      const right = num(args[1], "create_orthogonal");
      const bottom = num(args[2], "create_orthogonal");
      const top = num(args[3], "create_orthogonal");
      const zn = num(args[4], "create_orthogonal");
      const zf = num(args[5], "create_orthogonal");
      const rl = Math.fround(right - left);
      const tb = Math.fround(top - bottom);
      const nf = Math.fround(zf - zn);
      return projection(
        new GVector4(Math.fround(2 / rl), 0, 0, 0),
        new GVector4(0, Math.fround(2 / tb), 0, 0),
        new GVector4(0, 0, Math.fround(-2 / nf), 0),
        new GVector4(Math.fround(-(right + left) / rl), Math.fround(-(top + bottom) / tb), Math.fround(-(zf + zn) / nf), 1),
      );
    }
    case "create_fit_aabb": {
      const a = args[0];
      if (a === undefined) throw new UnsupportedError("projection-arity", "create_fit_aabb() 少了 AABB");
      const v = a.v as { x: number; y: number; z: number; sx: number; sy: number; sz: number };
      return projection(new GVector4(1, 0, 0, 0), new GVector4(0, 1, 0, 0), new GVector4(0, 0, 1, 0), new GVector4(Math.fround(-(v.x + Math.fround(v.sx / 2))), Math.fround(-(v.y + Math.fround(v.sy / 2))), Math.fround(-(v.z + Math.fround(v.sz / 2))), 1));
    }
    case "create_depth_correction": {
      const flip = args[0] !== undefined && args[0].t === Tag.BOOL && args[0].v === true;
      return projection(new GVector4(1, 0, 0, 0), new GVector4(0, flip ? -1 : 1, 0, 0), new GVector4(0, 0, -0.5, 0), new GVector4(0, 0, 0.5, 1));
    }
    case "create_light_atlas_rect": {
      const r = args[0];
      if (r === undefined) throw new UnsupportedError("projection-arity", "create_light_atlas_rect() 少了 Rect2");
      const v = r.v as { x: number; y: number; w: number; h: number };
      return projection(new GVector4(v.w, 0, 0, 0), new GVector4(0, v.h, 0, 0), new GVector4(0, 0, 1, 0), new GVector4(v.x, v.y, 0, 1));
    }
    case "create_frustum": {
      return frustum(num(args[0], name), num(args[1], name), num(args[2], name), num(args[3], name), num(args[4], name), num(args[5], name));
    }
    case "create_frustum_aspect": {
      const fovy = num(args[0], name);
      const aspect = num(args[1], name);
      const zn = num(args[2], name);
      const zf = num(args[3], name);
      const top = Math.fround(zn * Math.tan((fovy * Math.PI) / 360));
      return frustum(Math.fround(-top * aspect), Math.fround(top * aspect), -top, top, zn, zf);
    }
    case "create_orthogonal_aspect": {
      const size = num(args[0], name);
      const aspect = num(args[1], name);
      const zn = num(args[2], name);
      const zf = num(args[3], name);
      const half = Math.fround(size / 2);
      return projectionStatic("create_orthogonal", [V.float(-half), V.float(half), V.float(-half), V.float(half), V.float(zn), V.float(zf)]);
    }
    default:
      throw new UnsupportedError("projection-static", `Projection.${name}() 这一支没量过`);
  }
}
