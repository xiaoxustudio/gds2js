import { UnsupportedError } from "../errors";
import { Tag, V, type Variant } from "../tags";
import { GRect2 } from "../rect-classes";
import { GRect2i } from "../rect-classes";
import { asVec2 } from "../vector2";
import { asVec2i } from "../vector2i";
import { vector2 } from "../vector2";
import { vector2i } from "../vector2i";
import { rect2 } from "../rect2";
import { rect2i } from "../rect2i";

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
