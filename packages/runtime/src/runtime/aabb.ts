import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { strVec2 } from "./string-ops";
import { GAABB, asAABB } from "./composite-classes";
import { asVec3, vector3 } from "./vector3";

const r = Math.fround;

export function aabb(x: number, y: number, z: number, sx: number, sy: number, sz: number): Variant {
  return V.object(new GAABB(x, y, z, sx, sy, sz));
}

export function aabbNew(args: Variant[]): Variant {
  if (args.length === 0) return aabb(0, 0, 0, 0, 0, 0);
  if (args.length === 2) {
    const p = asVec3(args[0] as Variant);
    const s = asVec3(args[1] as Variant);
    if (p !== null && s !== null) return aabb(p.x, p.y, p.z, s.x, s.y, s.z);
    throw new UnsupportedError("aabb-arg", `AABB() 两参只量过两个 Vector3（${tagName((args[0] as Variant).t)} / ${tagName((args[1] as Variant).t)}）`);
  }
  throw new UnsupportedError("aabb-arity", `AABB() 只量过 0 与 2 个实参（收到 ${args.length} 个）：六数写法只在 var_to_str 的输出里量到过`);
}

export function toAABB(v: Variant): Variant {
  return v.t === Tag.OBJECT && v.v instanceof GAABB ? v : aabbNew([v]);
}

export function aabbText(v: GAABB): string {
  return `[P: (${strVec2(v.x)}, ${strVec2(v.y)}, ${strVec2(v.z)}), S: (${strVec2(v.sx)}, ${strVec2(v.sy)}, ${strVec2(v.sz)})]`;
}

export function aabbReadProp(v: GAABB, name: string): Variant | null {
  if (name === "position") return vector3(v.x, v.y, v.z);
  if (name === "size") return vector3(v.sx, v.sy, v.sz);
  if (name === "end") return vector3(r(v.x + v.sx), r(v.y + v.sy), r(v.z + v.sz));
  return null;
}

export { GAABB, asAABB };
