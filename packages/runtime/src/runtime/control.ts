import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { GTransform2D } from "./composite-classes";
import { asVec2, vector2 } from "./vector2";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";

const r = Math.fround;

type CtlStore = {
  px: number;
  py: number;
  sx: number;
  sy: number;
  rot: number;
  scx: number;
  scy: number;
  pvx: number;
  pvy: number;
};

function rec(target: unknown): NodeRec {
  const f = nodeFaceOf(target);
  if (f === null) throw new UnsupportedError("node-face-missing", "这一支要落在带节点面的对象上");
  return f;
}

function ctl(target: unknown): CtlStore {
  const face = rec(target);
  const store = face.__gd_ctl__ as CtlStore | undefined;
  if (store !== undefined) return store;
  const fresh: CtlStore = { px: 0, py: 0, sx: 0, sy: 0, rot: 0, scx: 1, scy: 1, pvx: 0, pvy: 0 };
  face.__gd_ctl__ = fresh;
  return fresh;
}

function ownTransform(s: CtlStore): GTransform2D {
  const a = r(s.rot);
  const c = r(Math.cos(a));
  const sn = r(Math.sin(a));
  const xx = r(c * s.scx);
  const xy = r(sn * s.scx);
  const yx = r(-sn * s.scy);
  const yy = r(c * s.scy);
  const dx = r(r(xx * s.pvx) + r(yx * s.pvy));
  const dy = r(r(xy * s.pvx) + r(yy * s.pvy));
  return new GTransform2D(xx, xy, yx, yy, r(r(s.px + s.pvx) - dx), r(r(s.py + s.pvy) - dy));
}

export function ctlGlobalTransform(target: unknown): GTransform2D {
  let cur = ownTransform(ctl(target));
  let up = nodeParent(target);
  while (up !== null) {
    const face = nodeFaceOf(up);
    if (face === null) throw new UnsupportedError("ctl-parent", "Control 往上的祖先没有节点面那一形没量过");
    if (face.__gd_engine_class__ !== "Control") throw new UnsupportedError("ctl-parent-base", `祖先的 ${face.__gd_engine_class__} 不在 Control 链上那一形没量过`);
    const p = ownTransform(ctl(up));
    cur = new GTransform2D(
      r(r(p.xx * cur.xx) + r(p.yx * cur.xy)),
      r(r(p.xy * cur.xx) + r(p.yy * cur.xy)),
      r(r(p.xx * cur.yx) + r(p.yx * cur.yy)),
      r(r(p.xy * cur.yx) + r(p.yy * cur.yy)),
      r(r(r(p.xx * cur.ox) + r(p.yx * cur.oy)) + p.ox),
      r(r(r(p.xy * cur.ox) + r(p.yy * cur.oy)) + p.oy),
    );
    up = nodeParent(up);
  }
  return cur;
}

function fromVec2(v: Variant | undefined, who: string): [number, number] {
  if (v === undefined) throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入少了实参`);
  const p = asVec2(v);
  if (p === null) throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过 Vector2（收到 ${tagName(v.t)}）`);
  return [p.x, p.y];
}

function fromAngle(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) {
    throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过数（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return r(Number(v.v));
}

export function ctlRead(target: unknown, name: string): Variant | null {
  const s = ctl(target);
  switch (name) {
    case "position":
      return vector2(s.px, s.py);
    case "size":
      return vector2(s.sx, s.sy);
    case "rotation":
      return V.float(s.rot);
    case "scale":
      return vector2(s.scx, s.scy);
    case "pivot_offset":
      return vector2(s.pvx, s.pvy);
    case "global_position": {
      const g = ctlGlobalTransform(target);
      return vector2(g.ox, g.oy);
    }
    case "visible":
      return V.bool(rec(target).__gd_node_visible__ !== false);
    default:
      return null;
  }
}

export function ctlMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  switch (name) {
    case "show":
      rec(target).__gd_node_visible__ = true;
      return V.nil();
    case "hide":
      rec(target).__gd_node_visible__ = false;
      return V.nil();
    case "get_global_transform": {
      if (args.length !== 0) throw new UnsupportedError("ctl-arity", `get_global_transform() 只量过 0 个实参（收到 ${args.length} 个）`);
      return V.object(ctlGlobalTransform(target));
    }
    default:
      return null;
  }
}

export function ctlWrite(target: unknown, name: string, value: Variant): void {
  const s = ctl(target);
  switch (name) {
    case "position": {
      const p = fromVec2(value, "position");
      s.px = p[0];
      s.py = p[1];
      return;
    }
    case "size": {
      const p = fromVec2(value, "size");
      s.sx = p[0];
      s.sy = p[1];
      return;
    }
    case "scale": {
      const p = fromVec2(value, "scale");
      s.scx = p[0];
      s.scy = p[1];
      return;
    }
    case "pivot_offset": {
      const p = fromVec2(value, "pivot_offset");
      s.pvx = p[0];
      s.pvy = p[1];
      return;
    }
    case "rotation":
      s.rot = fromAngle(value, "rotation");
      return;
    case "visible":
      if (value.t !== Tag.BOOL) throw new UnsupportedError("ctl-arg-type", `Control.visible 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visible__ = value.v === true;
      return;
    default:
      throw new UnsupportedError("ctl-prop", `Control.${name} 的写入没量过`);
  }
}
