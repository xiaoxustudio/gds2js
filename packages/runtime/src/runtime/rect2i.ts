import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { asVec2i, vector2i, wrap32 } from "./vector2i";
import { GRect2i } from "./rect-classes";

export { GRect2i } from "./rect-classes";
import { asRect2 } from "./rect2";
import { GVector2 } from "./vector2";

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
