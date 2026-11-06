import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { asVec2, vector2 } from "../vector/vector2";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";

import { GTransform2D } from "../orient/transform2d";

const r = Math.fround;

type CtlStore = {
  aL: number;
  aT: number;
  aR: number;
  aB: number;
  oL: number;
  oT: number;
  oR: number;
  oB: number;
  rot: number;
  scx: number;
  scy: number;
  pvx: number;
  pvy: number;
  minx: number;
  miny: number;
  fh: number;
  fv: number;
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
  const fresh: CtlStore = { aL: 0, aT: 0, aR: 0, aB: 0, oL: 0, oT: 0, oR: 0, oB: 0, rot: 0, scx: 1, scy: 1, pvx: 0, pvy: 0, minx: 0, miny: 0, fh: 1, fv: 1 };
  face.__gd_ctl__ = fresh;
  return fresh;
}

function parentArea(target: unknown): [number, number] {
  const up = nodeFaceOf(nodeParent(target));
  if (up === null || up.__gd_engine_class__ !== "Control") return [0, 0];
  return sizeOf(up, ctl(up));
}

function posOf(target: unknown, s: CtlStore): [number, number] {
  const [pw, ph] = parentArea(target);
  return [r(r(s.aL * pw) + s.oL), r(r(s.aT * ph) + s.oT)];
}

function sizeOf(target: unknown, s: CtlStore): [number, number] {
  const [pw, ph] = parentArea(target);
  return [r(r(r(s.aR - s.aL) * pw) + r(s.oR - s.oL)), r(r(r(s.aB - s.aT) * ph) + r(s.oB - s.oT))];
}

function ownTransform(target: unknown, s: CtlStore): GTransform2D {
  const [px, py] = posOf(target, s);
  const a = r(s.rot);
  const c = r(Math.cos(a));
  const sn = r(Math.sin(a));
  const xx = r(c * s.scx);
  const xy = r(sn * s.scx);
  const yx = r(-sn * s.scy);
  const yy = r(c * s.scy);
  const dx = r(r(xx * s.pvx) + r(yx * s.pvy));
  const dy = r(r(xy * s.pvx) + r(yy * s.pvy));
  return new GTransform2D(xx, xy, yx, yy, r(r(px + s.pvx) - dx), r(r(py + s.pvy) - dy));
}

export function ctlGlobalTransform(target: unknown): GTransform2D {
  let cur = ownTransform(target, ctl(target));
  let up = nodeParent(target);
  while (up !== null) {
    const face = nodeFaceOf(up);
    if (face === null) throw new UnsupportedError("ctl-parent", "Control 往上的祖先没有节点面那一形没量过");
    if (face.__gd_engine_class__ !== "Control") throw new UnsupportedError("ctl-parent-base", `祖先的 ${face.__gd_engine_class__} 不在 Control 链上那一形没量过`);
    const p = ownTransform(up, ctl(up));
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
      return vector2(...posOf(target, s));
    case "size":
      return vector2(...sizeOf(target, s));
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
    case "custom_minimum_size":
      return vector2(s.minx, s.miny);
    case "size_flags_horizontal":
      return V.int(s.fh);
    case "size_flags_vertical":
      return V.int(s.fv);
    case "anchor_left":
      return V.float(s.aL);
    case "anchor_top":
      return V.float(s.aT);
    case "anchor_right":
      return V.float(s.aR);
    case "anchor_bottom":
      return V.float(s.aB);
    case "offset_left":
      return V.float(s.oL);
    case "offset_top":
      return V.float(s.oT);
    case "offset_right":
      return V.float(s.oR);
    case "offset_bottom":
      return V.float(s.oB);
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
    case "get_minimum_size":
      return vector2(0, 0);
    case "get_combined_minimum_size": {
      const s = ctl(target);
      return vector2(s.minx, s.miny);
    }
    case "get_anchor": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("ctl-arg-type", "get_anchor() 的边号只量过数");
      const s = ctl(target);
      const i = Math.trunc(Number(v.v));
      return V.float(i === 0 ? s.aL : i === 1 ? s.aT : i === 2 ? s.aR : s.aB);
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
      const size = sizeOf(target, s);
      s.oL = p[0];
      s.oR = r(p[0] + size[0]);
      s.oT = p[1];
      s.oB = r(p[1] + size[1]);
      return;
    }
    case "size": {
      const p = fromVec2(value, "size");
      s.oR = r(s.oL + p[0]);
      s.oB = r(s.oT + p[1]);
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
    case "custom_minimum_size": {
      const p = fromVec2(value, "custom_minimum_size");
      s.minx = p[0];
      s.miny = p[1];
      return;
    }
    case "size_flags_horizontal":
      s.fh = Math.trunc(Number(value.v));
      return;
    case "size_flags_vertical":
      s.fv = Math.trunc(Number(value.v));
      return;
    case "anchor_left":
      s.aL = fromAngle(value, "anchor_left");
      return;
    case "anchor_top":
      s.aT = fromAngle(value, "anchor_top");
      return;
    case "anchor_right":
      s.aR = fromAngle(value, "anchor_right");
      return;
    case "anchor_bottom":
      s.aB = fromAngle(value, "anchor_bottom");
      return;
    case "offset_left":
      s.oL = fromAngle(value, "offset_left");
      return;
    case "offset_top":
      s.oT = fromAngle(value, "offset_top");
      return;
    case "offset_right":
      s.oR = fromAngle(value, "offset_right");
      return;
    case "offset_bottom":
      s.oB = fromAngle(value, "offset_bottom");
      return;
    default:
      throw new UnsupportedError("ctl-prop", `Control.${name} 的写入没量过`);
  }
}
