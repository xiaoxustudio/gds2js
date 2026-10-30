import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { strVec2 } from "../../numfmt";
import { asVec2, vector2, GVector2 } from "../vector/vector2";
import { GVector2i, asVec2i, vector2i, wrap32 } from "../vector/vector2i";

export class GRect2 {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x: number, y: number, w: number, h: number) {
    this.x = Math.fround(x);
    this.y = Math.fround(y);
    this.w = Math.fround(w);
    this.h = Math.fround(h);
  }
}

export class GRect2i {
  x: number;
  y: number;
  w: number;
  h: number;
  constructor(x: number | bigint, y: number | bigint, w: number | bigint, h: number | bigint) {
    this.x = wrap32(x);
    this.y = wrap32(y);
    this.w = wrap32(w);
    this.h = wrap32(h);
  }
}

export function rect2iPartsOf(o: object): [number, number, number, number] | null {
  return o instanceof GRect2i ? [o.x, o.y, o.w, o.h] : null;
}

const r = Math.fround;
export function rect2(x: number, y: number, w: number, h: number): Variant {
  return V.object(new GRect2(x, y, w, h));
}
export function asRect2(v: Variant): GRect2 | null {
  return v.t === Tag.OBJECT && v.v instanceof GRect2 ? (v.v as GRect2) : null;
}
function scalar(v: Variant, at: string): number {
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return r(Number(v.v));
  throw new UnsupportedError("rect2-arg", `Rect2() 的 ${at} 只收量过的数与向量形状（收到 ${tagName(v.t)}）`);
}
export function rect2New(args: Variant[]): Variant {
  if (args.length === 0) return rect2(0, 0, 0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const same = asRect2(a);
    if (same !== null) return rect2(same.x, same.y, same.w, same.h);
    const inner = a.t === Tag.OBJECT && a.v !== null && typeof a.v === "object" ? (a.v as object) : null;
    const parts = inner !== null ? rect2iPartsOf(inner) : null;
    if (parts !== null) return rect2(parts[0] as number, parts[1] as number, parts[2] as number, parts[3] as number);
    throw new UnsupportedError("rect2-arg", `Rect2() 单参只收 Rect2 / Rect2i（收到 ${tagName(a.t)}）`);
  }
  if (args.length === 2) {
    const p = asVec2(args[0] as Variant);
    const s = asVec2(args[1] as Variant);
    if (p !== null && s !== null) return rect2(p.x, p.y, s.x, s.y);
    throw new UnsupportedError("rect2-arg", `Rect2() 两参只收两个 Vector2（${tagName((args[0] as Variant).t)} / ${tagName((args[1] as Variant).t)}）`);
  }
  if (args.length !== 4) {
    throw new UnsupportedError("rect2-arity", `Rect2() 需要 0、1（Rect2/Rect2i）、2（两个 Vector2）或 4 个参数（收到 ${args.length} 个）`);
  }
  const x = scalar(args[0] as Variant, "第 1 参");
  const y = scalar(args[1] as Variant, "第 2 参");
  const w = scalar(args[2] as Variant, "第 3 参");
  const h = scalar(args[3] as Variant, "第 4 参");
  return rect2(x, y, w, h);
}
export function toRect2(v: Variant): Variant {
  return rect2New([v]);
}
export function rect2ReadProp(v: GRect2, name: string): Variant | null {
  if (name === "position") return vector2(v.x, v.y);
  if (name === "size") return vector2(v.w, v.h);
  if (name === "end") return vector2(r(v.x + v.w), r(v.y + v.h));
  return null;
}
export function rect2WriteProp(v: GRect2, name: string, value: Variant): Variant | null {
  const p = asVec2(value);
  if (p === null) {
    const ip = value.t === Tag.OBJECT && value.v instanceof GVector2i ? [value.v.x, value.v.y] : null;
    if (ip === null) throw new UnsupportedError("rect2-write", `Rect2.${name} 的写入只量过 Vector2 那一形（收到 ${tagName(value.t)}）`);
    if (name === "position") { v.x = r(ip[0] as number); v.y = r(ip[1] as number); return null; }
    if (name === "size") { v.w = r(ip[0] as number); v.h = r(ip[1] as number); return null; }
    throw new UnsupportedError("rect2-prop", `Rect2.${name} 的写入没量过`);
  }
  if (name === "position") { v.x = p.x; v.y = p.y; return null; }
  if (name === "size") { v.w = p.x; v.h = p.y; return null; }
  throw new UnsupportedError("rect2-end-write", "Rect2.end 的写入那一形没量过");
}
export function rect2Text(v: GRect2): string {
  return `[P: (${strVec2(v.x)}, ${strVec2(v.y)}), S: (${strVec2(v.w)}, ${strVec2(v.h)})]`;
}
export function rect2i(x: number | bigint, y: number | bigint, w: number | bigint, h: number | bigint): Variant {
  return V.object(new GRect2i(x, y, w, h));
}
export function asRect2i(v: Variant): GRect2i | null {
  return v.t === Tag.OBJECT && v.v instanceof GRect2i ? (v.v as GRect2i) : null;
}
function icscalar(v: Variant, at: string): number {
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return wrap32(Number(v.v));
  throw new UnsupportedError("rect2i-arg", `Rect2i() 的 ${at} 只收量过的数与整向量形状（收到 ${tagName(v.t)}）`);
}
export function rect2iNew(args: Variant[]): Variant {
  if (args.length === 0) return rect2i(0, 0, 0, 0);
  if (args.length === 1) {
    const a = args[0] as Variant;
    const same = asRect2i(a);
    if (same !== null) return rect2i(same.x, same.y, same.w, same.h);
    const f = asRect2(a);
    if (f !== null) return rect2i(f.x, f.y, f.w, f.h);
    throw new UnsupportedError("rect2i-arg", `Rect2i() 单参只收 Rect2i / Rect2（收到 ${tagName(a.t)}）`);
  }
  if (args.length === 2) {
    const p = asVec2i(args[0] as Variant);
    const s = asVec2i(args[1] as Variant);
    if (p !== null && s !== null) return rect2i(p.x, p.y, s.x, s.y);
    throw new UnsupportedError("rect2i-arg", `Rect2i() 两参只收两个 Vector2i（${tagName((args[0] as Variant).t)} / ${tagName((args[1] as Variant).t)}）`);
  }
  if (args.length !== 4) {
    throw new UnsupportedError("rect2i-arity", `Rect2i() 需要 0、1（Rect2/Rect2i）、2（两个 Vector2i）或 4 个参数（收到 ${args.length} 个）`);
  }
  return rect2i(icscalar(args[0] as Variant, "第 1 参"), icscalar(args[1] as Variant, "第 2 参"), icscalar(args[2] as Variant, "第 3 参"), icscalar(args[3] as Variant, "第 4 参"));
}
export function toRect2i(v: Variant): Variant {
  return rect2iNew([v]);
}
export function rect2iReadProp(v: GRect2i, name: string): Variant | null {
  if (name === "position") return vector2i(v.x, v.y);
  if (name === "size") return vector2i(v.w, v.h);
  if (name === "end") return vector2i(v.x + v.w, v.y + v.h);
  return null;
}
export function rect2iWriteProp(v: GRect2i, name: string, value: Variant): Variant | null {
  const p = asVec2i(value);
  if (p === null) {
    const fp = value.t === Tag.OBJECT && value.v instanceof GVector2 ? [value.v.x, value.v.y] : null;
    if (fp === null) throw new UnsupportedError("rect2i-write", `Rect2i.${name} 的写入只量过 Vector2i 那一形（收到 ${tagName(value.t)}）`);
    if (name === "position") { v.x = wrap32(fp[0] as number); v.y = wrap32(fp[1] as number); return null; }
    if (name === "size") { v.w = wrap32(fp[0] as number); v.h = wrap32(fp[1] as number); return null; }
    throw new UnsupportedError("rect2i-prop", `Rect2i.${name} 的写入没量过`);
  }
  if (name === "position") { v.x = p.x; v.y = p.y; return null; }
  if (name === "size") { v.w = p.x; v.h = p.y; return null; }
  throw new UnsupportedError("rect2i-end-write", "Rect2i.end 的写入那一形没量过");
}
export function rect2iText(v: GRect2i): string {
  return `[P: (${String(v.x)}, ${String(v.y)}), S: (${String(v.w)}, ${String(v.h)})]`;
}
const f = Math.fround;
function asRect2v(v: Variant): GRect2 {
  if (v.t === Tag.OBJECT && v.v instanceof GRect2) return v.v as GRect2;
  throw new UnsupportedError("rect2-arg-type", "Rect2.intersects() / encloses() / merge() / is_equal_approx() 的实参只量过 Rect2");
}
function asRect2iv(v: Variant): GRect2i {
  if (v.t === Tag.OBJECT && v.v instanceof GRect2i) return v.v as GRect2i;
  throw new UnsupportedError("rect2i-arg-type", "Rect2i.intersects() / encloses() / merge() 的实参只量过 Rect2i");
}
function num(v: Variant, at: string): number {
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return f(Number(v.v));
  throw new UnsupportedError("rect2-arg-type", `Rect2.${at} 的实参只量过数（收到 ${v.t}）`);
}
function one<T>(args: Variant[], name: string, pick: (v: Variant) => T | null, say: string): T {
  if (args.length !== 1) {
    throw new UnsupportedError("rect2-arity", `Rect2.${name}() 只量过 1 个实参（收到 ${args.length} 个）`);
  }
  const hit = pick(args[0] as Variant);
  if (hit === null) throw new UnsupportedError("rect2-arg-type", `Rect2.${name}() 的实参${say}`);
  return hit;
}
export function rect2Method(inner: GRect2, name: string, args: Variant[]): Variant {
  const px = inner.x;
  const py = inner.y;
  const sx = inner.w;
  const sy = inner.h;
  switch (name) {
    case "get_area":
      return V.float(f(sx * sy));
    case "get_center":
      return vector2(f(px + f(sx / 2)), f(py + f(sy / 2)));
    case "has_point": {
      const p = one(args, "has_point", asVec2, "只量过 Vector2");
      return V.bool(p.x >= px && p.y >= py && p.x < f(px + sx) && p.y < f(py + sy));
    }
    case "intersects": {
      if (args.length < 1 || args.length > 2) throw new UnsupportedError("rect2-arity", `Rect2.intersects() 只量过 1 与 2 个实参（收到 ${args.length} 个）`);
      const other = asRect2v(args[0] as Variant);
      if (args.length === 2) {
        const g = args[1] as Variant;
        if (g.t === Tag.BOOL && g.v === true) {
          return V.bool(rect2Intersects(f(px - 1), f(py - 1), f(sx + 2), f(sy + 2), other.x - 1, other.y - 1, other.w + 2, other.h + 2));
        }
        if (g.t === Tag.BOOL && g.v === false) return V.bool(rect2Intersects(px, py, sx, sy, other.x, other.y, other.w, other.h));
        throw new UnsupportedError("rect2-intersects-margin", `Rect2.intersects() 的第二参只量过布尔 true / false（收到 ${g.t}）：给数时引擎这一格的行为没读清，别照抄`);
      }
      return V.bool(rect2Intersects(px, py, sx, sy, other.x, other.y, other.w, other.h));
    }
    case "encloses": {
      const other = asRect2v(args[0] as Variant);
      return V.bool(px <= other.x && py <= other.y && f(px + sx) >= f(other.x + other.w) && f(py + sy) >= f(other.y + other.h));
    }
    case "merge": {
      const other = asRect2v(args[0] as Variant);
      const nx = Math.min(px, other.x);
      const ny = Math.min(py, other.y);
      return rect2(nx, ny, f(Math.max(f(px + sx), f(other.x + other.w)) - nx), f(Math.max(f(py + sy), f(other.y + other.h)) - ny));
    }
    case "expand": {
      const p = one(args, "expand", asVec2, "只量过 Vector2");
      const nx = Math.min(px, p.x);
      const ny = Math.min(py, p.y);
      return rect2(nx, ny, f(Math.max(f(px + sx), p.x) - nx), f(Math.max(f(py + sy), p.y) - ny));
    }
    case "grow": {
      const m = one(args, "grow", (v: Variant) => (v.t === Tag.INT || v.t === Tag.FLOAT ? f(Number(v.v)) : null), "只量过数");
      return rect2(f(px - m), f(py - m), f(sx + f(m * 2)), f(sy + f(m * 2)));
    }
    case "grow_individual": {
      if (args.length !== 4) throw new UnsupportedError("rect2-arity", `Rect2.grow_individual() 只量过 4 个实参（收到 ${args.length} 个）`);
      const l = num(args[0] as Variant, "grow_individual");
      const t = num(args[1] as Variant, "grow_individual");
      const r = num(args[2] as Variant, "grow_individual");
      const b = num(args[3] as Variant, "grow_individual");
      return rect2(f(px - l), f(py - t), f(sx + f(l + r)), f(sy + f(t + b)));
    }
    case "grow_side": {
      if (args.length !== 2) throw new UnsupportedError("rect2-arity", `Rect2.grow_side() 只量过 2 个实参（收到 ${args.length} 个）`);
      const side = num(args[0] as Variant, "grow_side");
      const m = num(args[1] as Variant, "grow_side");
      if (side === 0) return rect2(f(px - m), py, f(sx + m), sy);
      if (side === 1) return rect2(px, f(py - m), sx, f(sy + m));
      if (side === 2) return rect2(px, py, f(sx + m), sy);
      if (side === 3) return rect2(px, py, sx, f(sy + m));
      throw new UnsupportedError("rect2-side", `Rect2.grow_side() 的边号只量过 0..3（收到 ${String(side)}）`);
    }
    case "abs": {
      const nx = sx < 0 ? f(px + sx) : px;
      const ny = sy < 0 ? f(py + sy) : py;
      return rect2(nx, ny, f(Math.abs(sx)), f(Math.abs(sy)));
    }
    case "is_equal_approx": {
      const other = asRect2v(args[0] as Variant);
      return V.bool(px === other.x && py === other.y && sx === other.w && sy === other.h);
    }
    case "is_finite":
      return V.bool(Number.isFinite(px) && Number.isFinite(py) && Number.isFinite(sx) && Number.isFinite(sy));
    default:
      throw new UnsupportedError("rect2-method", `Rect2.${name}() 这一支没量过（存在性与返回值都只按实测的十四支放行）`);
  }
}
function rect2Intersects(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
  return ax < f(bx + bw) && f(ax + aw) > bx && ay < f(by + bh) && f(ay + ah) > by;
}
export function rect2iMethod(inner: GRect2i, name: string, args: Variant[]): Variant {
  const px = inner.x;
  const py = inner.y;
  const sx = inner.w;
  const sy = inner.h;
  const idiv = (a: number, b: number): number => (b === 0 ? 0 : Math.trunc(a / b));
  switch (name) {
    case "get_area":
      return V.int(sx * sy);
    case "get_center":
      return vector2i(px + idiv(sx, 2), py + idiv(sy, 2));
    case "has_point": {
      const p = one(args, "has_point", asVec2i, "只量过 Vector2i");
      return V.bool(p.x >= px && p.y >= py && p.x < px + sx && p.y < py + sy);
    }
    case "intersects": {
      if (args.length < 1 || args.length > 2) throw new UnsupportedError("rect2i-arity", `Rect2i.intersects() 只量过 1 与 2 个实参（收到 ${args.length} 个）`);
      const other = asRect2iv(args[0] as Variant);
      if (args.length === 2) {
        const g = args[1] as Variant;
        if (g.t === Tag.BOOL && g.v === true) return V.bool(rect2Intersects(px - 1, py - 1, sx + 2, sy + 2, other.x - 1, other.y - 1, other.w + 2, other.h + 2));
        if (g.t === Tag.BOOL && g.v === false) return V.bool(rect2Intersects(px, py, sx, sy, other.x, other.y, other.w, other.h));
        throw new UnsupportedError("rect2i-intersects-margin", `Rect2i.intersects() 的第二参只量过布尔 true / false（收到 ${g.t}）`);
      }
      return V.bool(rect2Intersects(px, py, sx, sy, other.x, other.y, other.w, other.h));
    }
    case "encloses": {
      const other = asRect2iv(args[0] as Variant);
      return V.bool(px <= other.x && py <= other.y && px + sx >= other.x + other.w && py + sy >= other.y + other.h);
    }
    case "merge": {
      const other = asRect2iv(args[0] as Variant);
      const nx = Math.min(px, other.x);
      const ny = Math.min(py, other.y);
      return rect2i(nx, ny, Math.max(px + sx, other.x + other.w) - nx, Math.max(py + sy, other.y + other.h) - ny);
    }
    case "expand": {
      const p = one(args, "expand", asVec2i, "只量过 Vector2i");
      const nx = Math.min(px, p.x);
      const ny = Math.min(py, p.y);
      return rect2i(nx, ny, Math.max(px + sx, p.x) - nx, Math.max(py + sy, p.y) - ny);
    }
    case "grow": {
      const m = one(args, "grow", (v: Variant) => (v.t === Tag.INT ? Number(v.v) : null), "只量过整数");
      return rect2i(px - m, py - m, sx + m * 2, sy + m * 2);
    }
    case "grow_individual": {
      if (args.length !== 4) throw new UnsupportedError("rect2i-arity", `Rect2i.grow_individual() 只量过 4 个实参（收到 ${args.length} 个）`);
      const l = Math.trunc(num(args[0] as Variant, "grow_individual"));
      const t = Math.trunc(num(args[1] as Variant, "grow_individual"));
      const r = Math.trunc(num(args[2] as Variant, "grow_individual"));
      const b = Math.trunc(num(args[3] as Variant, "grow_individual"));
      return rect2i(px - l, py - t, sx + l + r, sy + t + b);
    }
    case "grow_side": {
      if (args.length !== 2) throw new UnsupportedError("rect2i-arity", `Rect2i.grow_side() 只量过 2 个实参（收到 ${args.length} 个）`);
      const side = Math.trunc(num(args[0] as Variant, "grow_side"));
      const m = Math.trunc(num(args[1] as Variant, "grow_side"));
      if (side === 0) return rect2i(px - m, py, sx + m, sy);
      if (side === 1) return rect2i(px, py - m, sx, sy + m);
      if (side === 2) return rect2i(px, py, sx + m, sy);
      if (side === 3) return rect2i(px, py, sx, sy + m);
      throw new UnsupportedError("rect2i-side", `Rect2i.grow_side() 的边号只量过 0..3（收到 ${String(side)}）`);
    }
    case "abs": {
      const nx = sx < 0 ? px + sx : px;
      const ny = sy < 0 ? py + sy : py;
      return rect2i(nx, ny, Math.abs(sx), Math.abs(sy));
    }
    default:
      throw new UnsupportedError("rect2i-method", `Rect2i.${name}() 这一支没量过（is_finite 与 is_equal_approx 在 4.6.3 都不存在）`);
  }
}