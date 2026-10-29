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

export class GPlane {
  nx: number;
  ny: number;
  nz: number;
  d: number;
  constructor(nx: number, ny: number, nz: number, d: number) {
    const r = Math.fround;
    this.nx = r(nx);
    this.ny = r(ny);
    this.nz = r(nz);
    this.d = r(d);
  }
}

export function asPlane(v: Variant): GPlane | null {
  return v.t === Tag.OBJECT && v.v instanceof GPlane ? (v.v as GPlane) : null;
}

export class GQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number, y: number, z: number, w: number) {
    const r = Math.fround;
    this.x = r(x);
    this.y = r(y);
    this.z = r(z);
    this.w = r(w);
  }
}

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

export function asQuaternion(v: Variant): GQuaternion | null {
  return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? (v.v as GQuaternion) : null;
}

export class GBasis {
  x0: number;
  x1: number;
  x2: number;
  y0: number;
  y1: number;
  y2: number;
  z0: number;
  z1: number;
  z2: number;
  constructor(x0: number, x1: number, x2: number, y0: number, y1: number, y2: number, z0: number, z1: number, z2: number) {
    const f = Math.fround;
    this.x0 = f(x0);
    this.x1 = f(x1);
    this.x2 = f(x2);
    this.y0 = f(y0);
    this.y1 = f(y1);
    this.y2 = f(y2);
    this.z0 = f(z0);
    this.z1 = f(z1);
    this.z2 = f(z2);
  }
}

export function asBasis(v: Variant): GBasis | null {
  return v.t === Tag.OBJECT && v.v instanceof GBasis ? (v.v as GBasis) : null;
}

export class GTransform3D {
  x0: number;
  x1: number;
  x2: number;
  y0: number;
  y1: number;
  y2: number;
  z0: number;
  z1: number;
  z2: number;
  ox: number;
  oy: number;
  oz: number;
  constructor(
    x0: number, x1: number, x2: number,
    y0: number, y1: number, y2: number,
    z0: number, z1: number, z2: number,
    ox: number, oy: number, oz: number,
  ) {
    const f = Math.fround;
    this.x0 = f(x0);
    this.x1 = f(x1);
    this.x2 = f(x2);
    this.y0 = f(y0);
    this.y1 = f(y1);
    this.y2 = f(y2);
    this.z0 = f(z0);
    this.z1 = f(z1);
    this.z2 = f(z2);
    this.ox = f(ox);
    this.oy = f(oy);
    this.oz = f(oz);
  }
}

export function asTransform3D(v: Variant): GTransform3D | null {
  return v.t === Tag.OBJECT && v.v instanceof GTransform3D ? (v.v as GTransform3D) : null;
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
