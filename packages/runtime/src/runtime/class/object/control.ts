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
  ratio: number;
  prx: number;
  pry: number;
  gh: number;
  gv: number;
  mf: number;
  ld: number;
  clip: boolean;
  tip: string;
  ttv: string;
  lns: boolean;
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
  const fresh: CtlStore = {
    aL: 0, aT: 0, aR: 0, aB: 0, oL: 0, oT: 0, oR: 0, oB: 0, rot: 0, scx: 1, scy: 1,
    pvx: 0, pvy: 0, minx: 0, miny: 0, fh: 1, fv: 1,
    ratio: 1, prx: 0, pry: 0, gh: 1, gv: 1, mf: 0, ld: 0, clip: false, tip: "", ttv: "", lns: true,
  };
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

const DEG_PER_RAD = r(180 / r(Math.PI));
const RAD_PER_DEG = r(r(Math.PI) / 180);

function fromText(v: Variant | undefined, who: string): string {
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) {
    throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过字符串（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return v.v as string;
}

function fromInt(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) {
    throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过整数（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return Math.trunc(Number(v.v));
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
    case "rotation_degrees":
      return V.float(r(s.rot * DEG_PER_RAD));
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
    case "size_flags_stretch_ratio":
      return V.float(s.ratio);
    case "pivot_offset_ratio":
      return vector2(s.prx, s.pry);
    case "grow_horizontal":
      return V.int(s.gh);
    case "grow_vertical":
      return V.int(s.gv);
    case "mouse_filter":
      return V.int(s.mf);
    case "layout_direction":
      return V.int(s.ld);
    case "clip_contents":
      return V.bool(s.clip);
    case "tooltip_text":
      return V.str(s.tip);
    case "theme_type_variation":
      return V.str(s.ttv);
    case "localize_numeral_system":
      return V.bool(s.lns);
    default:
      return null;
  }
}

const CTL_GETTERS: Readonly<Record<string, string>> = {
  get_position: "position",
  get_size: "size",
  get_rotation: "rotation",
  get_rotation_degrees: "rotation_degrees",
  get_scale: "scale",
  get_global_position: "global_position",
  get_pivot_offset: "pivot_offset",
  get_custom_minimum_size: "custom_minimum_size",
  get_h_size_flags: "size_flags_horizontal",
  get_v_size_flags: "size_flags_vertical",
  get_stretch_ratio: "size_flags_stretch_ratio",
  get_pivot_offset_ratio: "pivot_offset_ratio",
  get_h_grow_direction: "grow_horizontal",
  get_v_grow_direction: "grow_vertical",
  get_mouse_filter: "mouse_filter",
  get_layout_direction: "layout_direction",
  is_clipping_contents: "clip_contents",
  get_tooltip_text: "tooltip_text",
  get_theme_type_variation: "theme_type_variation",
};

const CTL_SETTERS: Readonly<Record<string, string>> = {
  set_position: "position",
  set_size: "size",
  set_rotation: "rotation",
  set_rotation_degrees: "rotation_degrees",
  set_scale: "scale",
  set_pivot_offset: "pivot_offset",
  set_custom_minimum_size: "custom_minimum_size",
  set_h_size_flags: "size_flags_horizontal",
  set_v_size_flags: "size_flags_vertical",
  set_stretch_ratio: "size_flags_stretch_ratio",
  set_pivot_offset_ratio: "pivot_offset_ratio",
  set_h_grow_direction: "grow_horizontal",
  set_v_grow_direction: "grow_vertical",
  set_mouse_filter: "mouse_filter",
  set_layout_direction: "layout_direction",
  set_clip_contents: "clip_contents",
  set_tooltip_text: "tooltip_text",
  set_theme_type_variation: "theme_type_variation",
  set_localize_numeral_system: "localize_numeral_system",
};

export const CTL_METHOD_NAMES: readonly string[] = [
  ...Object.keys(CTL_GETTERS),
  ...Object.keys(CTL_SETTERS),
  "get_offset",
  "set_offset",
  "reset_size",
];

export function ctlMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  const getter = CTL_GETTERS[name];
  if (getter !== undefined) return ctlRead(target, getter);
  const setter = CTL_SETTERS[name];
  if (setter !== undefined) {
    const value = args[0];
    if (value === undefined) throw new UnsupportedError("ctl-arg-type", `Control.${name} 少了实参`);
    ctlWrite(target, setter, value);
    return V.nil();
  }
  switch (name) {
    case "get_offset": {
      const i = fromInt(args[0], "get_offset");
      const s = ctl(target);
      return V.float(i === 0 ? s.oL : i === 1 ? s.oT : i === 2 ? s.oR : s.oB);
    }
    case "set_offset": {
      const i = fromInt(args[0], "set_offset");
      const s = ctl(target);
      const v = fromAngle(args[1], "set_offset");
      if (i === 0) s.oL = v;
      else if (i === 1) s.oT = v;
      else if (i === 2) s.oR = v;
      else s.oB = v;
      return V.nil();
    }
    case "reset_size":
      ctlWrite(target, "size", vector2(0, 0));
      return V.nil();
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
    case "rotation_degrees":
      s.rot = r(fromAngle(value, "rotation_degrees") * RAD_PER_DEG);
      return;
    case "size_flags_stretch_ratio":
      s.ratio = r(Number(value.v));
      return;
    case "pivot_offset_ratio": {
      const p = fromVec2(value, "pivot_offset_ratio");
      s.prx = p[0];
      s.pry = p[1];
      return;
    }
    case "grow_horizontal":
      s.gh = fromInt(value, "grow_horizontal");
      return;
    case "grow_vertical":
      s.gv = fromInt(value, "grow_vertical");
      return;
    case "mouse_filter":
      s.mf = fromInt(value, "mouse_filter");
      return;
    case "layout_direction":
      s.ld = fromInt(value, "layout_direction");
      return;
    case "clip_contents":
      s.clip = value.t === Tag.BOOL ? value.v === true : Boolean(value.v);
      return;
    case "tooltip_text":
      s.tip = fromText(value, "tooltip_text");
      return;
    case "theme_type_variation":
      s.ttv = fromText(value, "theme_type_variation");
      return;
    case "localize_numeral_system":
      s.lns = value.t === Tag.BOOL ? value.v === true : Boolean(value.v);
      return;
    default:
      throw new UnsupportedError("ctl-prop", `Control.${name} 的写入没量过`);
  }
}
