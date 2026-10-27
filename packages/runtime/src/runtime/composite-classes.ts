import { wrap32 } from "./vector2i";
import { Tag, type Variant } from "./tags";

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

export class GAABB {
  x: number;
  y: number;
  z: number;
  sx: number;
  sy: number;
  sz: number;
  constructor(x: number, y: number, z: number, sx: number, sy: number, sz: number) {
    const r = Math.fround;
    this.x = r(x);
    this.y = r(y);
    this.z = r(z);
    this.sx = r(sx);
    this.sy = r(sy);
    this.sz = r(sz);
  }
}

export function asAABB(v: Variant): GAABB | null {
  return v.t === Tag.OBJECT && v.v instanceof GAABB ? (v.v as GAABB) : null;
}

export function rect2iPartsOf(o: object): [number, number, number, number] | null {
  return o instanceof GRect2i ? [o.x, o.y, o.w, o.h] : null;
}

export function asRect2(v: Variant): GRect2 | null {
  return v.t === Tag.OBJECT && v.v instanceof GRect2 ? (v.v as GRect2) : null;
}

export function asRect2i(v: Variant): GRect2i | null {
  return v.t === Tag.OBJECT && v.v instanceof GRect2i ? (v.v as GRect2i) : null;
}
