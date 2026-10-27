import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { strVec2 } from "./string-ops";
import { GTransform2D, asTransform2D } from "./composite-classes";
import { asVec2, vector2 } from "./vector2";

const r = Math.fround;

export function transform2d(xx: number, xy: number, yx: number, yy: number, ox: number, oy: number): Variant {
  return V.object(new GTransform2D(xx, xy, yx, yy, ox, oy));
}

export { asTransform2D };

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
