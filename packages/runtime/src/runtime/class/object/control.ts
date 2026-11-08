import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { asVec2, vector2 } from "../vector/vector2";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";
import { sceneTree } from "./scene-tree";

import { GTransform2D } from "../orient/transform2d";
import { rect2 } from "../shape/rect";
import { asVec2 as asVec2p } from "../vector/vector2";
import { asNodePath, nodePathText, nodePathValue } from "../identity/node-path";
import { GArray } from "../../values";
import { NULL_OBJECT } from "../identity/null-object";

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
  fm: number;
  fbr: number;
  mbr: number;
  mdfc: number;
  mfpse: boolean;
  at: boolean;
  ttm: number;
  sc: Variant | null;
  themeVal: Variant | null;
  fnext: string;
  fprev: string;
  fnl: string;
  fnt: string;
  fnr: string;
  fnb: string;
  an: string;
  ad: string;
  al: number;
  accControls: Variant[];
  accDescribed: Variant[];
  accFlow: Variant[];
  accLabeled: Variant[];
  ovColor: Map<string, Variant>;
  ovConst: Map<string, Variant>;
  ovFont: Map<string, Variant>;
  ovFontSize: Map<string, Variant>;
  ovIcon: Map<string, Variant>;
  ovStyle: Map<string, Variant>;
  dragPreview: Variant | null;
  dragFw: Variant[];
  bulk: boolean;
};

function rec(target: unknown): NodeRec {
  const f = nodeFaceOf(target);
  if (f === null) throw new UnsupportedError("node-face-missing", "这一支要落在带节点面的对象上");
  return f;
}

type CtlStoreX = CtlStore & {
  anchorOf(edge: number): number;
  setAnchor(edge: number, value: number): void;
  offsetOf(edge: number): number;
  setOffset(edge: number, value: number): void;
};

function ctl(target: unknown): CtlStoreX {
  const face = rec(target);
  const existing = face.__gd_ctl__ as CtlStore | undefined;
  if (existing !== undefined) return existing as CtlStoreX;
  const store = {
    aL: 0, aT: 0, aR: 0, aB: 0, oL: 0, oT: 0, oR: 0, oB: 0, rot: 0, scx: 1, scy: 1,
    pvx: 0, pvy: 0, minx: 0, miny: 0, fh: 1, fv: 1,
    ratio: 1, prx: 0, pry: 0, gh: 1, gv: 1, mf: 0, ld: 0, clip: false, tip: "", ttv: "", lns: true,
    fm: 0, fbr: 0, mbr: 0, mdfc: 0, mfpse: true, at: true, ttm: 0, sc: null, themeVal: null,
    fnext: "", fprev: "", fnl: "", fnt: "", fnr: "", fnb: "",
    an: "", ad: "", al: 0, accControls: [], accDescribed: [], accFlow: [], accLabeled: [],
    ovColor: new Map(), ovConst: new Map(), ovFont: new Map(), ovFontSize: new Map(), ovIcon: new Map(), ovStyle: new Map(),
    dragPreview: null, dragFw: [], bulk: false,
    anchorOf(edge: number): number { return edge === 0 ? this.aL : edge === 1 ? this.aT : edge === 2 ? this.aR : this.aB; },
    setAnchor(edge: number, value: number): void { if (edge === 0) this.aL = value; else if (edge === 1) this.aT = value; else if (edge === 2) this.aR = value; else this.aB = value; },
    offsetOf(edge: number): number { return edge === 0 ? this.oL : edge === 1 ? this.oT : edge === 2 ? this.oR : this.oB; },
    setOffset(edge: number, value: number): void { if (edge === 0) this.oL = value; else if (edge === 1) this.oT = value; else if (edge === 2) this.oR = value; else this.oB = value; },
  };
  face.__gd_ctl__ = store;
  return store as CtlStoreX;
}

function parentArea(target: unknown): [number, number] {
  const up = nodeFaceOf(nodeParent(target));
  if (up === null || up.__gd_engine_class__ !== "Control") return [0, 0];
  if (!insideTree(target)) return [0, 0];
  return sizeOf(up, ctl(up));
}

function posOf(target: unknown, s: CtlStore): [number, number] {
  const [pw, ph] = parentArea(target);
  return [r(r(s.aL * pw) + s.oL), r(r(s.aT * ph) + s.oT)];
}

function sizeOf(target: unknown, s: CtlStore): [number, number] {
  const [pw, ph] = parentArea(target);
  const w = r(r(r(s.aR - s.aL) * pw) + r(s.oR - s.oL));
  const h = r(r(r(s.aB - s.aT) * ph) + r(s.oB - s.oT));
  return [w < 0 ? 0 : w, h < 0 ? 0 : h];
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
    if (face.__gd_engine_class__ !== "Control") break;
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


const ANCHOR_PRESETS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 0, 0, 0], [1, 0, 1, 0], [0, 1, 0, 1], [1, 1, 1, 1],
  [0, 0.5, 0, 0.5], [0.5, 0, 0.5, 0], [1, 0.5, 1, 0.5], [0.5, 1, 0.5, 1],
  [0.5, 0.5, 0.5, 0.5], [0, 0, 0, 1], [0, 0, 1, 0], [1, 0, 1, 1],
  [0, 1, 1, 1], [0.5, 0, 0.5, 1], [0, 0.5, 1, 0.5], [0, 0, 1, 1],
];

function parentControl(target: unknown): boolean {
  const up = nodeFaceOf(nodeParent(target));
  return up !== null && up.__gd_engine_class__ === "Control";
}

function insideTree(target: unknown): boolean {
  const tree = sceneTree();
  if (tree === null) return false;
  let cur: object | null = target as object;
  for (;;) {
    if (cur === tree.root) return true;
    cur = nodeFaceOf(cur)?.__gd_node_parent__ ?? null;
    if (cur === null) return false;
  }
}

function parentSize(target: unknown): [number, number] {
  const up = nodeFaceOf(nodeParent(target));
  if (up === null || up.__gd_engine_class__ !== "Control") return [0, 0];
  if (!insideTree(target)) return [0, 0];
  const us = ctl(up);
  return sizeOf(up, us);
}

function anchorsPresetOf(s: CtlStore): number {
  const v = [s.aL, s.aT, s.aR, s.aB];
  for (let i = 0; i < ANCHOR_PRESETS.length; i++) {
    const p = ANCHOR_PRESETS[i] as readonly [number, number, number, number];
    if (v[0] === p[0] && v[1] === p[1] && v[2] === p[2] && v[3] === p[3]) return i;
  }
  return -1;
}

function setAnchor(target: unknown, edge: number, anchor: number, keepOffset: boolean, push: boolean): void {
  const s = ctl(target);
  const [pw, ph] = parentSize(target);
  const range = edge === 0 || edge === 2 ? pw : ph;
  const opposite = (edge + 2) % 4;
  const previous = r(r(s.offsetOf(edge) as number) + r(s.anchorOf(edge) as number * range));
  const previousOpposite = r(r(s.offsetOf(opposite) as number) + r(s.anchorOf(opposite) as number * range));
  s.setAnchor(edge, anchor);
  if ((edge === 0 || edge === 1) && s.anchorOf(edge) > s.anchorOf(opposite)) {
    if (push) s.setAnchor(opposite, s.anchorOf(edge));
    else s.setAnchor(edge, s.anchorOf(opposite));
  } else if ((edge === 2 || edge === 3) && s.anchorOf(edge) < s.anchorOf(opposite)) {
    if (push) s.setAnchor(opposite, s.anchorOf(edge));
    else s.setAnchor(edge, s.anchorOf(opposite));
  }
  if (!keepOffset) {
    s.setOffset(edge, r(previous - r(s.anchorOf(edge) * range)));
    if (push) s.setOffset(opposite, r(previousOpposite - r(s.anchorOf(opposite) * range)));
  }
}

function setOffsetsPreset(target: unknown, preset: number, mode: number, margin: number): void {
  const s = ctl(target);
  const [pw, ph] = parentSize(target);
  const [mw, mh] = [s.minx, s.miny];
  let size = sizeOf(target, s);
  let nw = size[0];
  let nh = size[1];
  if (mode === 0 || mode === 2) nw = mw;
  if (mode === 0 || mode === 3) nh = mh;
  const x = pw;
  const presetX = preset;
  const left = (): number => {
    if ([0, 2, 4, 10, 12, 9, 14, 15].includes(presetX)) return r(x * (0 - s.aL)) + margin;
    if ([5, 7, 8, 13].includes(presetX)) return r(x * (0.5 - s.aL)) - nw / 2;
    return r(x * (1 - s.aL)) - nw - margin;
  };
  const top = (): number => {
    if ([0, 1, 5, 9, 11, 10, 13, 15].includes(presetX)) return r(ph * (0 - s.aT)) + margin;
    if ([4, 6, 8, 14].includes(presetX)) return r(ph * (0.5 - s.aT)) - nh / 2;
    return r(ph * (1 - s.aT)) - nh - margin;
  };
  const right = (): number => {
    if ([0, 2, 4, 9].includes(presetX)) return r(x * (0 - s.aR)) + nw + margin;
    if ([5, 7, 8, 13].includes(presetX)) return r(x * (0.5 - s.aR)) + nw / 2;
    return r(x * (1 - s.aR)) - margin;
  };
  const bottom = (): number => {
    if ([0, 1, 5, 10].includes(presetX)) return r(ph * (0 - s.aB)) + nh + margin;
    if ([4, 6, 8, 14].includes(presetX)) return r(ph * (0.5 - s.aB)) + nh / 2;
    return r(ph * (1 - s.aB)) - margin;
  };
  s.oL = left();
  s.oT = top();
  s.oR = right();
  s.oB = bottom();
}

function combinedPivot(target: unknown, s: CtlStore): [number, number] {
  const size = sizeOf(target, s);
  return [r(s.pvx + r(s.prx * size[0])), r(s.pvy + r(s.pry * size[1]))];
}

function internalOrigin(target: unknown, s: CtlStore): [number, number] {
  const [px, py] = combinedPivot(target, s);
  const c = r(Math.cos(s.rot));
  const sn = r(Math.sin(s.rot));
  const bx = r(r(c * s.scx) * r(-px));
  const by = r(r(sn * s.scx) * r(-px));
  const cx = r(r(-sn * s.scy) * r(-py));
  const cy = r(r(c * s.scy) * r(-py));
  return [r(px + r(bx + cx)), r(py + r(by + cy))];
}

const DEG_PER_RAD = r(180 / r(Math.PI));
const RAD_PER_DEG = r(r(Math.PI) / 180);

function fromText(v: Variant | undefined, who: string): string {
  if (v === undefined || (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME)) {
    throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过字符串（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  }
  return v.v as string;
}

function pathText(v: Variant | undefined, who: string): string {
  const np = asNodePath(v as Variant);
  if (np === null) throw new UnsupportedError("ctl-arg-type", `Control.${who} 的写入只量过 NodePath`);
  return nodePathText(np);
}

function tooMany(args: Variant[], max: number, who: string): void {
  if (args.length > max) throw new UnsupportedError("ctl-arity", `Control.${who}() 只量过最多 ${String(max)} 个实参（收到 ${String(args.length)} 个）`);
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
    case "anchors_preset":
      return V.int(0);
    case "layout_mode":
      return V.int(parentControl(target) ? 0 : 3);
    case "focus_mode":
      return V.int(s.fm);
    case "focus_behavior_recursive":
      return V.int(s.fbr);
    case "mouse_behavior_recursive":
      return V.int(s.mbr);
    case "mouse_default_cursor_shape":
      return V.int(s.mdfc);
    case "mouse_force_pass_scroll_events":
      return V.bool(s.mfpse);
    case "auto_translate":
      return V.bool(s.at);
    case "tooltip_auto_translate_mode":
      return V.int(s.ttm);
    case "shortcut_context":
      return s.sc === null ? V.nil() : s.sc;
    case "theme":
      return s.themeVal === null ? V.nil() : s.themeVal;
    case "focus_next":
      return nodePathValue(s.fnext);
    case "focus_previous":
      return nodePathValue(s.fprev);
    case "focus_neighbor_left":
      return nodePathValue(s.fnl);
    case "focus_neighbor_top":
      return nodePathValue(s.fnt);
    case "focus_neighbor_right":
      return nodePathValue(s.fnr);
    case "focus_neighbor_bottom":
      return nodePathValue(s.fnb);
    case "accessibility_name":
      return V.str(s.an);
    case "accessibility_description":
      return V.str(s.ad);
    case "accessibility_live":
      return V.int(s.al);
    case "accessibility_controls_nodes":
      return V.array(GArray.of(s.accControls));
    case "accessibility_described_by_nodes":
      return V.array(GArray.of(s.accDescribed));
    case "accessibility_flow_to_nodes":
      return V.array(GArray.of(s.accFlow));
    case "accessibility_labeled_by_nodes":
      return V.array(GArray.of(s.accLabeled));
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
  "_get_minimum_size",
  "_has_point",
  "_structured_text_parser",
  "get_begin",
  "get_end",
  "set_begin",
  "set_end",
  "get_combined_pivot_offset",
  "get_global_rect",
  "set_anchor",
  "set_anchor_and_offset",
  "set_anchors_preset",
  "set_offsets_preset",
  "set_anchors_and_offsets_preset",
  "set_global_position",
  "update_minimum_size",
  "add_theme_color_override",
  "add_theme_constant_override",
  "add_theme_font_override",
  "add_theme_font_size_override",
  "add_theme_icon_override",
  "add_theme_stylebox_override",
  "has_theme_color_override",
  "has_theme_constant_override",
  "has_theme_font_override",
  "has_theme_font_size_override",
  "has_theme_icon_override",
  "has_theme_stylebox_override",
  "remove_theme_color_override",
  "remove_theme_constant_override",
  "remove_theme_font_override",
  "remove_theme_font_size_override",
  "remove_theme_icon_override",
  "remove_theme_stylebox_override",
  "begin_bulk_theme_override",
  "end_bulk_theme_override",
  "has_theme_color",
  "has_theme_constant",
  "has_theme_font",
  "has_theme_font_size",
  "has_theme_icon",
  "has_theme_stylebox",
  "get_theme",
  "set_theme",
  "get_theme_default_base_scale",
  "get_theme_default_font_size",
  "get_theme_default_font",
  "get_focus_mode",
  "set_focus_mode",
  "get_focus_behavior_recursive",
  "set_focus_behavior_recursive",
  "get_focus_mode_with_override",
  "get_mouse_filter_with_override",
  "get_mouse_behavior_recursive",
  "set_mouse_behavior_recursive",
  "get_default_cursor_shape",
  "get_cursor_shape",
  "set_default_cursor_shape",
  "is_force_pass_scroll_events",
  "set_force_pass_scroll_events",
  "is_auto_translating",
  "set_auto_translate",
  "get_tooltip_auto_translate_mode",
  "set_tooltip_auto_translate_mode",
  "get_shortcut_context",
  "set_shortcut_context",
  "get_tooltip",
  "_get_tooltip",
  "grab_focus",
  "grab_click_focus",
  "release_focus",
  "has_focus",
  "find_next_valid_focus",
  "find_prev_valid_focus",
  "find_valid_focus_neighbor",
  "get_focus_neighbor",
  "set_focus_neighbor",
  "get_focus_next",
  "set_focus_next",
  "get_focus_previous",
  "set_focus_previous",
  "get_parent_control",
  "get_parent_area_size",
  "get_rect",
  "get_screen_position",
  "is_layout_rtl",
  "is_localizing_numeral_system",
  "accept_event",
  "warp_mouse",
  "set_drag_preview",
  "set_drag_forwarding",
  "is_drag_successful",
  "force_drag",
  "_get_drag_data",
  "_can_drop_data",
  "_drop_data",
  "_make_custom_tooltip",
  "_gui_input",
  "get_accessibility_name",
  "set_accessibility_name",
  "get_accessibility_description",
  "set_accessibility_description",
  "get_accessibility_live",
  "set_accessibility_live",
  "get_accessibility_controls_nodes",
  "set_accessibility_controls_nodes",
  "get_accessibility_described_by_nodes",
  "set_accessibility_described_by_nodes",
  "get_accessibility_flow_to_nodes",
  "set_accessibility_flow_to_nodes",
  "get_accessibility_labeled_by_nodes",
  "set_accessibility_labeled_by_nodes",
  "_accessibility_get_contextual_info",
  "_get_accessibility_container_name",
  "accessibility_drag",
  "accessibility_drop",
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
    case "add_theme_color_override":
    case "add_theme_constant_override":
    case "add_theme_font_override":
    case "add_theme_font_size_override":
    case "add_theme_icon_override":
    case "add_theme_stylebox_override": {
      const nm = fromText(args[0], name);
      const val = args[1];
      if (val === undefined) throw new UnsupportedError("ctl-arity", `${name}() 少了实参`);
      const s = ctl(target);
      const map = name.includes("color") ? s.ovColor : name.includes("constant") ? s.ovConst : name.includes("font_size") ? s.ovFontSize : name.includes("font") ? s.ovFont : name.includes("icon") ? s.ovIcon : s.ovStyle;
      map.set(nm, val);
      return V.nil();
    }
    case "has_theme_color_override":
    case "has_theme_constant_override":
    case "has_theme_font_override":
    case "has_theme_font_size_override":
    case "has_theme_icon_override":
    case "has_theme_stylebox_override": {
      const nm = fromText(args[0], name);
      const s = ctl(target);
      const map = name.includes("color") ? s.ovColor : name.includes("constant") ? s.ovConst : name.includes("font_size") ? s.ovFontSize : name.includes("font") ? s.ovFont : name.includes("icon") ? s.ovIcon : s.ovStyle;
      return V.bool(map.has(nm));
    }
    case "remove_theme_color_override":
    case "remove_theme_constant_override":
    case "remove_theme_font_override":
    case "remove_theme_font_size_override":
    case "remove_theme_icon_override":
    case "remove_theme_stylebox_override": {
      const nm = fromText(args[0], name);
      const s = ctl(target);
      const map = name.includes("color") ? s.ovColor : name.includes("constant") ? s.ovConst : name.includes("font_size") ? s.ovFontSize : name.includes("font") ? s.ovFont : name.includes("icon") ? s.ovIcon : s.ovStyle;
      map.delete(nm);
      return V.nil();
    }
    case "begin_bulk_theme_override":
      ctl(target).bulk = true;
      return V.nil();
    case "end_bulk_theme_override":
      ctl(target).bulk = false;
      return V.nil();
    case "has_theme_color":
    case "has_theme_constant":
    case "has_theme_icon":
    case "has_theme_stylebox":
      tooMany(args, 2, name);
      return V.bool(false);
    case "has_theme_font":
    case "has_theme_font_size":
      tooMany(args, 2, name);
      return V.bool(true);
    case "get_theme":
      tooMany(args, 0, name);
      return ctl(target).themeVal === null ? V.nil() : (ctl(target).themeVal as Variant);
    case "set_theme":
      if (args.length !== 1) throw new UnsupportedError("ctl-arity", "set_theme() 只量过 1 个实参");
      ctl(target).themeVal = (args[0] as Variant).t === Tag.NIL ? null : (args[0] as Variant);
      return V.nil();
    case "get_theme_default_base_scale":
      return V.float(1);
    case "get_theme_default_font_size":
      return V.int(16);
    case "get_theme_default_font":
      return V.object(NULL_OBJECT);
    case "get_focus_mode":
      return V.int(ctl(target).fm);
    case "set_focus_mode":
      ctl(target).fm = fromInt(args[0], "set_focus_mode");
      return V.nil();
    case "get_focus_behavior_recursive":
      return V.int(ctl(target).fbr);
    case "set_focus_behavior_recursive":
      ctl(target).fbr = fromInt(args[0], "set_focus_behavior_recursive");
      return V.nil();
    case "get_focus_mode_with_override":
      return V.int(ctl(target).fm);
    case "get_mouse_filter_with_override":
      return V.int(ctl(target).mf);
    case "get_mouse_behavior_recursive":
      return V.int(ctl(target).mbr);
    case "set_mouse_behavior_recursive":
      ctl(target).mbr = fromInt(args[0], "set_mouse_behavior_recursive");
      return V.nil();
    case "get_default_cursor_shape":
    case "get_cursor_shape":
      return V.int(ctl(target).mdfc);
    case "set_default_cursor_shape":
      ctl(target).mdfc = fromInt(args[0], "set_default_cursor_shape");
      return V.nil();
    case "is_force_pass_scroll_events":
      return V.bool(ctl(target).mfpse);
    case "set_force_pass_scroll_events":
      ctl(target).mfpse = (args[0] as Variant | undefined)?.t === Tag.BOOL && (args[0] as Variant).v === true;
      return V.nil();
    case "is_auto_translating":
      return V.bool(ctl(target).at);
    case "set_auto_translate":
      ctl(target).at = (args[0] as Variant | undefined)?.t === Tag.BOOL && (args[0] as Variant).v === true;
      return V.nil();
    case "get_tooltip_auto_translate_mode":
      return V.int(ctl(target).ttm);
    case "set_tooltip_auto_translate_mode":
      ctl(target).ttm = fromInt(args[0], "set_tooltip_auto_translate_mode");
      return V.nil();
    case "get_shortcut_context": {
      const s = ctl(target);
      return s.sc === null ? V.object(NULL_OBJECT) : s.sc;
    }
    case "set_shortcut_context":
      ctl(target).sc = (args[0] as Variant | undefined)?.t === Tag.NIL ? null : (args[0] as Variant);
      return V.nil();
    case "get_tooltip":
      tooMany(args, 1, name);
      return V.str(ctl(target).tip);
    case "_get_tooltip":
      return V.str("");
    case "grab_focus":
      return V.nil();
    case "grab_click_focus":
      return V.nil();
    case "release_focus":
      return V.nil();
    case "has_focus":
      return V.bool(false);
    case "find_next_valid_focus":
    case "find_prev_valid_focus":
    case "find_valid_focus_neighbor":
      return V.object(NULL_OBJECT);
    case "get_focus_neighbor": {
      const side = fromInt(args[0], "get_focus_neighbor");
      const s = ctl(target);
      return nodePathValue(side === 0 ? s.fnl : side === 1 ? s.fnt : side === 2 ? s.fnr : s.fnb);
    }
    case "set_focus_neighbor": {
      const side = fromInt(args[0], "set_focus_neighbor");
      const p = pathText(args[1], "set_focus_neighbor");
      const s = ctl(target);
      if (side === 0) s.fnl = p; else if (side === 1) s.fnt = p; else if (side === 2) s.fnr = p; else s.fnb = p;
      return V.nil();
    }
    case "get_focus_next":
      return nodePathValue(ctl(target).fnext);
    case "set_focus_next":
      ctl(target).fnext = pathText(args[0], "set_focus_next");
      return V.nil();
    case "get_focus_previous":
      return nodePathValue(ctl(target).fprev);
    case "set_focus_previous":
      ctl(target).fprev = pathText(args[0], "set_focus_previous");
      return V.nil();
    case "get_parent_control": {
      const up = nodeFaceOf(nodeParent(target));
      return up !== null && up.__gd_engine_class__ === "Control" ? V.object(up) : V.object(NULL_OBJECT);
    }
    case "get_parent_area_size": {
      const p = parentSize(target);
      return vector2(p[0], p[1]);
    }
    case "get_rect": {
      const size = sizeOf(target, ctl(target));
      return rect2(0, 0, size[0] as number, size[1] as number);
    }
    case "get_screen_position": {
      const g = ctlGlobalTransform(target);
      return vector2(g.ox, g.oy);
    }
    case "is_layout_rtl": {
      const s = ctl(target);
      return V.bool(s.ld === 1);
    }
    case "is_localizing_numeral_system":
      return V.bool(ctl(target).lns);
    case "accept_event":
      return V.nil();
    case "warp_mouse":
      return V.nil();
    case "set_drag_preview":
      ctl(target).dragPreview = args[0] as Variant;
      return V.nil();
    case "set_drag_forwarding":
      ctl(target).dragFw = args as Variant[];
      return V.nil();
    case "is_drag_successful":
      return V.bool(false);
    case "force_drag":
      return V.nil();
    case "_get_drag_data":
      return V.nil();
    case "_can_drop_data":
      return V.bool(false);
    case "_drop_data":
      return V.nil();
    case "_make_custom_tooltip":
      return V.object(NULL_OBJECT);
    case "_gui_input":
      return V.nil();
    case "get_accessibility_name":
      return V.str(ctl(target).an);
    case "set_accessibility_name":
      ctl(target).an = fromText(args[0], "set_accessibility_name");
      return V.nil();
    case "get_accessibility_description":
      return V.str(ctl(target).ad);
    case "set_accessibility_description":
      ctl(target).ad = fromText(args[0], "set_accessibility_description");
      return V.nil();
    case "get_accessibility_live":
      return V.int(ctl(target).al);
    case "set_accessibility_live":
      ctl(target).al = fromInt(args[0], "set_accessibility_live");
      return V.nil();
    case "get_accessibility_controls_nodes":
      return V.array(GArray.of(ctl(target).accControls));
    case "set_accessibility_controls_nodes":
      ctl(target).accControls = args.length > 0 && (args[0] as Variant).t === Tag.ARRAY ? ((args[0] as Variant).v as GArray).raw() as Variant[] : [];
      return V.nil();
    case "get_accessibility_described_by_nodes":
      return V.array(GArray.of(ctl(target).accDescribed));
    case "set_accessibility_described_by_nodes":
      ctl(target).accDescribed = args.length > 0 && (args[0] as Variant).t === Tag.ARRAY ? ((args[0] as Variant).v as GArray).raw() as Variant[] : [];
      return V.nil();
    case "get_accessibility_flow_to_nodes":
      return V.array(GArray.of(ctl(target).accFlow));
    case "set_accessibility_flow_to_nodes":
      ctl(target).accFlow = args.length > 0 && (args[0] as Variant).t === Tag.ARRAY ? ((args[0] as Variant).v as GArray).raw() as Variant[] : [];
      return V.nil();
    case "get_accessibility_labeled_by_nodes":
      return V.array(GArray.of(ctl(target).accLabeled));
    case "set_accessibility_labeled_by_nodes":
      ctl(target).accLabeled = args.length > 0 && (args[0] as Variant).t === Tag.ARRAY ? ((args[0] as Variant).v as GArray).raw() as Variant[] : [];
      return V.nil();
    case "_accessibility_get_contextual_info":
    case "_get_accessibility_container_name":
      return V.str("");
    case "accessibility_drag":
    case "accessibility_drop":
      return V.bool(false);
    case "_get_minimum_size":
      return vector2(0, 0);
    case "_has_point": {
      const p = asVec2p(args[0] as Variant);
      if (p === null) throw new UnsupportedError("ctl-arg-type", "_has_point() 只量过 Vector2");
      const s = ctl(target);
      const size = sizeOf(target, s);
      return V.bool(p.x >= 0 && p.y >= 0 && p.x < (size[0] as number) && p.y < (size[1] as number));
    }
    case "_structured_text_parser":
      return V.nil();
    case "get_begin": {
      const s = ctl(target);
      return vector2(s.oL, s.oT);
    }
    case "get_end": {
      const s = ctl(target);
      return vector2(s.oR, s.oB);
    }
    case "set_begin": {
      const p = asVec2p(args[0] as Variant);
      if (p === null) throw new UnsupportedError("ctl-arg-type", "set_begin() 只量过 Vector2");
      const s = ctl(target);
      s.oL = p.x;
      s.oT = p.y;
      return V.nil();
    }
    case "set_end": {
      const p = asVec2p(args[0] as Variant);
      if (p === null) throw new UnsupportedError("ctl-arg-type", "set_end() 只量过 Vector2");
      const s = ctl(target);
      s.oR = p.x;
      s.oB = p.y;
      return V.nil();
    }
    case "get_combined_pivot_offset": {
      const p = combinedPivot(target, ctl(target));
      return vector2(p[0], p[1]);
    }
    case "get_global_rect": {
      const g = ctlGlobalTransform(target);
      const sx = r(Math.sqrt(r(r(g.xx * g.xx) + r(g.xy * g.xy))));
      const sy = r(Math.sqrt(r(r(g.yx * g.yx) + r(g.yy * g.yy))));
      const s = ctl(target);
      const size = sizeOf(target, s);
      return rect2(g.ox, g.oy, r(sx * (size[0] as number)), r(sy * (size[1] as number)));
    }
    case "set_anchor": {
      const edge = fromInt(args[0], "set_anchor");
      const anchor = fromAngle(args[1], "set_anchor");
      const keep = args[2] !== undefined && args[2].t === Tag.BOOL && args[2].v === true;
      const push = args[3] === undefined || (args[3].t === Tag.BOOL && args[3].v === true);
      setAnchor(target, edge, anchor, keep, push);
      return V.nil();
    }
    case "set_anchor_and_offset": {
      const edge = fromInt(args[0], "set_anchor_and_offset");
      const anchor = fromAngle(args[1], "set_anchor_and_offset");
      const pos = fromAngle(args[2], "set_anchor_and_offset");
      const push = args[3] === undefined || (args[3].t === Tag.BOOL && args[3].v === true);
      setAnchor(target, edge, anchor, false, push);
      ctl(target).setOffset(edge, pos);
      return V.nil();
    }
    case "set_anchors_preset": {
      const preset = fromInt(args[0], "set_anchors_preset");
      const keep = args[1] !== undefined && args[1].t === Tag.BOOL && args[1].v === true;
      const p = ANCHOR_PRESETS[preset];
      if (p === undefined) throw new UnsupportedError("ctl-arg-type", "set_anchors_preset() 的 preset 越界");
      setAnchor(target, 0, p[0], keep, true);
      setAnchor(target, 1, p[1], keep, true);
      setAnchor(target, 2, p[2], keep, true);
      setAnchor(target, 3, p[3], keep, true);
      return V.nil();
    }
    case "set_offsets_preset": {
      const preset = fromInt(args[0], "set_offsets_preset");
      const mode = args[1] === undefined ? 0 : fromInt(args[1], "set_offsets_preset");
      const margin = args[2] === undefined ? 0 : fromInt(args[2], "set_offsets_preset");
      setOffsetsPreset(target, preset, mode, margin);
      return V.nil();
    }
    case "set_anchors_and_offsets_preset": {
      const preset = fromInt(args[0], "set_anchors_and_offsets_preset");
      const mode = args[1] === undefined ? 0 : fromInt(args[1], "set_anchors_and_offsets_preset");
      const margin = args[2] === undefined ? 0 : fromInt(args[2], "set_anchors_and_offsets_preset");
      const p = ANCHOR_PRESETS[preset];
      if (p === undefined) throw new UnsupportedError("ctl-arg-type", "set_anchors_and_offsets_preset() 的 preset 越界");
      setAnchor(target, 0, p[0], false, true);
      setAnchor(target, 1, p[1], false, true);
      setAnchor(target, 2, p[2], false, true);
      setAnchor(target, 3, p[3], false, true);
      setOffsetsPreset(target, preset, mode, margin);
      return V.nil();
    }
    case "set_global_position": {
      const p = asVec2p(args[0] as Variant);
      if (p === null) throw new UnsupportedError("ctl-arg-type", "set_global_position() 只量过 Vector2");
      const s = ctl(target);
      let px = p.x;
      let py = p.y;
      if (parentControl(target)) {
        const g = ctlGlobalTransform(nodeParent(target));
        const det = r(r(g.xx * g.yy) - r(g.xy * g.yx));
        if (det === 0) throw new UnsupportedError("ctl-inverse", "set_global_position 的父变换不可逆那一形没量过");
        const inv = 1 / det;
        const dx = r(px - g.ox);
        const dy = r(py - g.oy);
        px = r(r(r(g.yy * inv) * dx) + r(r(-g.yx * inv) * dy));
        py = r(r(r(-g.xy * inv) * dx) + r(r(g.xx * inv) * dy));
      }
      const io = internalOrigin(target, s);
      const size = sizeOf(target, s);
      s.oL = r(px - io[0]);
      s.oR = r(r(px - io[0]) + (size[0] as number));
      s.oT = r(py - io[1]);
      s.oB = r(r(py - io[1]) + (size[1] as number));
      return V.nil();
    }
    case "update_minimum_size":
      return V.nil();
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
    case "focus_mode":
      s.fm = fromInt(value, "focus_mode");
      return;
    case "focus_behavior_recursive":
      s.fbr = fromInt(value, "focus_behavior_recursive");
      return;
    case "mouse_behavior_recursive":
      s.mbr = fromInt(value, "mouse_behavior_recursive");
      return;
    case "mouse_default_cursor_shape":
      s.mdfc = fromInt(value, "mouse_default_cursor_shape");
      return;
    case "mouse_force_pass_scroll_events":
      s.mfpse = value.t === Tag.BOOL ? value.v === true : Boolean(value.v);
      return;
    case "auto_translate":
      s.at = value.t === Tag.BOOL ? value.v === true : Boolean(value.v);
      return;
    case "tooltip_auto_translate_mode":
      s.ttm = fromInt(value, "tooltip_auto_translate_mode");
      return;
    case "shortcut_context":
      s.sc = value.t === Tag.NIL ? null : value;
      return;
    case "theme":
      s.themeVal = value.t === Tag.NIL ? null : value;
      return;
    case "focus_next":
      s.fnext = pathText(value, "focus_next");
      return;
    case "focus_previous":
      s.fprev = pathText(value, "focus_previous");
      return;
    case "focus_neighbor_left":
      s.fnl = pathText(value, "focus_neighbor_left");
      return;
    case "focus_neighbor_top":
      s.fnt = pathText(value, "focus_neighbor_top");
      return;
    case "focus_neighbor_right":
      s.fnr = pathText(value, "focus_neighbor_right");
      return;
    case "focus_neighbor_bottom":
      s.fnb = pathText(value, "focus_neighbor_bottom");
      return;
    case "accessibility_name":
      s.an = fromText(value, "accessibility_name");
      return;
    case "accessibility_description":
      s.ad = fromText(value, "accessibility_description");
      return;
    case "accessibility_live":
      s.al = fromInt(value, "accessibility_live");
      return;
    case "accessibility_controls_nodes":
    case "accessibility_described_by_nodes":
    case "accessibility_flow_to_nodes":
    case "accessibility_labeled_by_nodes": {
      if (value.t !== Tag.ARRAY) throw new UnsupportedError("ctl-arg-type", `Control.${name} 的写入只量过 Array`);
      const arr = (value.v as GArray).raw() as Variant[];
      if (name === "accessibility_controls_nodes") s.accControls = arr;
      else if (name === "accessibility_described_by_nodes") s.accDescribed = arr;
      else if (name === "accessibility_flow_to_nodes") s.accFlow = arr;
      else s.accLabeled = arr;
      return;
    }
    default:
      throw new UnsupportedError("ctl-prop", `Control.${name} 的写入没量过`);
  }
}
