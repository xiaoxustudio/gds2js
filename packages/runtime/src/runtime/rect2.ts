import { Tag, V, tagName, type Variant } from "./tags";
import { GRect2, rect2iPartsOf } from "./composite-classes";

export { GRect2 } from "./composite-classes";
import { UnsupportedError } from "./errors";
import { strVec2 } from "./string-ops";
import { asVec2, vector2 } from "./class/vector/vector2";
import { GVector2i } from "./class/vector/vector2i";

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
