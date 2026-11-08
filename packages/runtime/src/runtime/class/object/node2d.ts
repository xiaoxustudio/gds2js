import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { asVec2, vector2 } from "../vector/vector2";
import { transform2d } from "../orient/transform2d";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";

import { GTransform2D } from "../orient/transform2d";

const r = Math.fround;
const DEG_PER_RAD = r(180 / r(Math.PI));
const RAD_PER_DEG = r(r(Math.PI) / 180);

export function isNode2D(target: unknown): boolean {
  return nodeFaceOf(target)?.__gd_engine_class__ === "Node2D";
}

function rec(target: unknown): NodeRec {
  const f = nodeFaceOf(target);
  if (f === null) throw new UnsupportedError("node-face-missing", "这一支要落在带节点面的对象上");
  return f;
}

function t2d(target: unknown): GTransform2D {
  const face = rec(target);
  const store = face.__gd_node_t2d__;
  if (store instanceof GTransform2D) return store;
  const fresh = new GTransform2D(1, 0, 0, 1, 0, 0);
  face.__gd_node_t2d__ = fresh;
  return fresh;
}

function setT2d(target: unknown, next: GTransform2D): void {
  rec(target).__gd_node_t2d__ = next;
}

function rotBasis(angle: number): [number, number, number, number] {
  const a = r(angle);
  return [r(Math.cos(a)), r(Math.sin(a)), r(-Math.sin(a)), r(Math.cos(a))];
}

function basisAngle(x: number, y: number): number {
  return r(Math.atan2(y, x));
}

function columnLength(a: number, b: number): number {
  return r(Math.sqrt(r(r(a * a) + r(b * b))));
}

function originOf(store: GTransform2D): Variant {
  return vector2(store.ox, store.oy);
}

function skewOf(g: GTransform2D): number {
  return r(r(Math.atan2(g.yy, g.yx) - Math.atan2(g.xy, g.xx)) - r(Math.PI / 2));
}

function rotationOf(g: GTransform2D): number {
  return basisAngle(g.xx, g.xy);
}

function scaleOf(g: GTransform2D): [number, number] {
  return [columnLength(g.xx, g.xy), columnLength(g.yx, g.yy)];
}

type T2Vals = { rot: number; skew: number; sx: number; sy: number };

function valsOf(target: unknown, store: GTransform2D): T2Vals {
  const face = rec(target);
  let v = face.__gd_node_t2d_vals__ as T2Vals | undefined;
  if (v === undefined) {
    const k = scaleOf(store);
    v = { rot: rotationOf(store), skew: skewOf(store), sx: k[0], sy: k[1] };
    face.__gd_node_t2d_vals__ = v;
  }
  return v;
}

function deriveVals(target: unknown, g: GTransform2D): void {
  const k = scaleOf(g);
  rec(target).__gd_node_t2d_vals__ = { rot: rotationOf(g), skew: skewOf(g), sx: k[0], sy: k[1] };
}

function fromRotScaleSkew(g: GTransform2D, rot: number, sx: number, sy: number, skew: number): GTransform2D {
  return new GTransform2D(
    r(r(Math.cos(rot)) * sx),
    r(r(Math.sin(rot)) * sx),
    r(-r(Math.sin(r(rot + skew))) * sy),
    r(r(Math.cos(r(rot + skew))) * sy),
    g.ox,
    g.oy,
  );
}

function withRotation(g: GTransform2D, rot: number): GTransform2D {
  const k = scaleOf(g);
  return fromRotScaleSkew(g, rot, k[0], k[1], skewOf(g));
}

function withScale(g: GTransform2D, k: [number, number]): GTransform2D {
  return fromRotScaleSkew(g, rotationOf(g), k[0], k[1], skewOf(g));
}

function withSkew(g: GTransform2D, skew: number): GTransform2D {
  const k = scaleOf(g);
  return fromRotScaleSkew(g, rotationOf(g), k[0], k[1], skew);
}

const GETTERS: Readonly<Record<string, string>> = {
  get_position: "position",
  get_rotation: "rotation",
  get_rotation_degrees: "rotation_degrees",
  get_scale: "scale",
  get_skew: "skew",
  get_global_position: "global_position",
  get_global_rotation: "global_rotation",
  get_global_rotation_degrees: "global_rotation_degrees",
  get_global_scale: "global_scale",
  get_global_skew: "global_skew",
};

const SETTERS: Readonly<Record<string, string>> = {
  set_position: "position",
  set_rotation: "rotation",
  set_rotation_degrees: "rotation_degrees",
  set_scale: "scale",
  set_skew: "skew",
  set_global_position: "global_position",
  set_global_rotation: "global_rotation",
  set_global_rotation_degrees: "global_rotation_degrees",
  set_global_scale: "global_scale",
  set_global_skew: "global_skew",
  set_transform: "transform",
};

export const NODE2D_METHOD_NAMES: readonly string[] = [
  ...Object.keys(GETTERS),
  ...Object.keys(SETTERS),
  "get_global_transform",
  "get_angle_to",
  "look_at",
  "global_translate",
  "set_global_transform",
];

export function node2dGlobalTransform(target: unknown): GTransform2D {
  let cur: GTransform2D = t2d(target);
  let up = nodeParent(target);
  while (up !== null) {
    const face = nodeFaceOf(up);
    if (face === null) throw new UnsupportedError("node2d-parent", "Node2D 往上的祖先没有节点面那一形没量过");
    if (face.__gd_engine_class__ === "Window") break;
    if (face.__gd_engine_class__ !== "Node2D" && face.__gd_engine_class__ !== "Control") throw new UnsupportedError("node2d-parent-base", `祖先的 ${face.__gd_engine_class__} 不在 2D 链上那一形没量过`);
    if (rec(up).__gd_node_top_level__ === true) throw new UnsupportedError("node2d-top-level", "top_level 为 true 时的全局变换没量过");
    const parent = t2d(up);
    cur = new GTransform2D(
      r(r(parent.xx * cur.xx) + r(parent.yx * cur.xy)),
      r(r(parent.xy * cur.xx) + r(parent.yy * cur.xy)),
      r(r(parent.xx * cur.yx) + r(parent.yx * cur.yy)),
      r(r(parent.xy * cur.yx) + r(parent.yy * cur.yy)),
      r(r(r(parent.xx * cur.ox) + r(parent.yx * cur.oy)) + parent.ox),
      r(r(r(parent.xy * cur.ox) + r(parent.yy * cur.oy)) + parent.oy),
    );
    up = nodeParent(up);
  }
  return cur;
}

function applyInverseTransform(g: GTransform2D): GTransform2D {
  const det = r(r(g.xx * g.yy) - r(g.xy * g.yx));
  if (det === 0) throw new UnsupportedError("node2d-inverse", "逆变换行列式为零那一形没量过");
  const inv = 1 / det;
  const xx = r(g.yy * inv);
  const xy = r(-g.xy * inv);
  const yx = r(-g.yx * inv);
  const yy = r(g.xx * inv);
  return new GTransform2D(
    xx,
    xy,
    yx,
    yy,
    r(-r(r(xx * g.ox) + r(yx * g.oy))),
    r(-r(r(xy * g.ox) + r(yy * g.oy))),
  );
}

function mulTransform(a: GTransform2D, b: GTransform2D): GTransform2D {
  return new GTransform2D(
    r(r(a.xx * b.xx) + r(a.yx * b.xy)),
    r(r(a.xy * b.xx) + r(a.yy * b.xy)),
    r(r(a.xx * b.yx) + r(a.yx * b.yy)),
    r(r(a.xy * b.yx) + r(a.yy * b.yy)),
    r(r(r(a.xx * b.ox) + r(a.yx * b.oy)) + a.ox),
    r(r(r(a.xy * b.ox) + r(a.yy * b.oy)) + a.oy),
  );
}

function fromVariantAngle(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node2d-arg-type", `Node2D.${who} 的写入只量过数（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
  return r(Number(v.v));
}

function fromVariantVec2(v: Variant | undefined, who: string): [number, number] {
  if (v === undefined) throw new UnsupportedError("node2d-arg-type", `Node2D.${who} 的写入少了实参`);
  const p = asVec2(v);
  if (p === null) throw new UnsupportedError("node2d-arg-type", `Node2D.${who} 的写入只量过 Vector2（收到 ${tagName(v.t)}）`);
  return [p.x, p.y];
}

export function node2dVisible(target: unknown): boolean {
  return rec(target).__gd_node_visible__ !== false;
}

export function node2dRead(target: unknown, name: string): Variant | null {
  const store = t2d(target);
  switch (name) {
    case "position":
      return originOf(store);
    case "rotation":
      return V.float(valsOf(target, store).rot);
    case "rotation_degrees":
      return V.float(r(valsOf(target, store).rot * DEG_PER_RAD));
    case "scale": {
      const v = valsOf(target, store);
      return vector2(v.sx, v.sy);
    }
    case "transform":
      return V.object(store);
    case "global_transform": {
      const g = node2dGlobalTransform(target);
      return V.object(g);
    }
    case "global_position": {
      const g = node2dGlobalTransform(target);
      return originOf(g);
    }
    case "visible":
      return V.bool(rec(target).__gd_node_visible__ !== false);
    case "z_index":
      return V.int(0);
    case "top_level":
      return V.bool(rec(target).__gd_node_top_level__ === true);
    case "y_sort_enabled":
      return V.bool(false);
    case "skew":
      return V.float(valsOf(target, store).skew);
    case "global_rotation":
      return V.float(rotationOf(node2dGlobalTransform(target)));
    case "global_rotation_degrees":
      return V.float(r(r(rotationOf(node2dGlobalTransform(target))) * DEG_PER_RAD));
    case "global_scale": {
      const k = scaleOf(node2dGlobalTransform(target));
      return vector2(k[0], k[1]);
    }
    case "global_skew":
      return V.float(skewOf(node2dGlobalTransform(target)));
    default:
      return null;
  }
}

export function node2dWrite(target: unknown, name: string, value: Variant): void {
  const store = t2d(target);
  switch (name) {
    case "position": {
      const p = fromVariantVec2(value, "position");
      setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, p[0], p[1]));
      return;
    }
    case "rotation": {
      const v = valsOf(target, store);
      const angle = fromVariantAngle(value, "rotation");
      v.rot = angle;
      setT2d(target, fromRotScaleSkew(store, angle, v.sx, v.sy, v.skew));
      return;
    }
    case "rotation_degrees": {
      const v = valsOf(target, store);
      const angle = r(fromVariantAngle(value, "rotation_degrees") * RAD_PER_DEG);
      v.rot = angle;
      setT2d(target, fromRotScaleSkew(store, angle, v.sx, v.sy, v.skew));
      return;
    }
    case "scale": {
      const v = valsOf(target, store);
      const k = fromVariantVec2(value, "scale");
      v.sx = k[0];
      v.sy = k[1];
      setT2d(target, fromRotScaleSkew(store, v.rot, k[0], k[1], v.skew));
      return;
    }
    case "transform": {
      if (value.t !== Tag.OBJECT || !(value.v instanceof GTransform2D)) throw new UnsupportedError("node2d-arg-type", `Node2D.transform 的写入只量过 Transform2D（收到 ${tagName(value.t)}）`);
      const g = value.v as GTransform2D;
      setT2d(target, new GTransform2D(g.xx, g.xy, g.yx, g.yy, g.ox, g.oy));
      deriveVals(target, g);
      return;
    }
    case "global_position": {
      const want = fromVariantVec2(value, "global_position");
      const up = nodeParent(target);
      if (up === null) {
        setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, r(want[0]), r(want[1])));
        return;
      }
      const g = node2dGlobalTransform(up);
      const p = applyInverse(g, want[0], want[1]);
      setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, p[0], p[1]));
      return;
    }
    case "visible": {
      if (value.t !== Tag.BOOL) throw new UnsupportedError("node2d-arg-type", `Node2D.visible 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visible__ = value.v === true;
      return;
    }
    case "skew": {
      const v = valsOf(target, store);
      const skew = fromVariantAngle(value, "skew");
      v.skew = skew;
      setT2d(target, fromRotScaleSkew(store, v.rot, v.sx, v.sy, skew));
      return;
    }
    case "global_rotation":
    case "global_rotation_degrees": {
      const deg = name === "global_rotation_degrees";
      const angle = r(deg ? r(fromVariantAngle(value, name) * RAD_PER_DEG) : fromVariantAngle(value, name));
      const up = nodeParent(target);
      if (up === null) {
        node2dWrite(target, "rotation", V.float(angle));
        return;
      }
      const pg = node2dGlobalTransform(up);
      const cur = mulTransform(pg, store);
      const replaced = withRotation(cur, angle);
      const next = mulTransform(applyInverseTransform(pg), replaced);
      node2dWrite(target, "rotation", V.float(rotationOf(next)));
      return;
    }
    case "global_scale": {
      const k = fromVariantVec2(value, "global_scale");
      const up = nodeParent(target);
      if (up === null) {
        node2dWrite(target, "scale", vector2(k[0], k[1]));
        return;
      }
      const pg = node2dGlobalTransform(up);
      const cur = mulTransform(pg, store);
      const next = mulTransform(applyInverseTransform(pg), withScale(cur, k));
      const out = scaleOf(next);
      node2dWrite(target, "scale", vector2(out[0], out[1]));
      return;
    }
    case "global_skew": {
      const skew = fromVariantAngle(value, "global_skew");
      const up = nodeParent(target);
      if (up === null) {
        node2dWrite(target, "skew", V.float(skew));
        return;
      }
      const pg = node2dGlobalTransform(up);
      const cur = mulTransform(pg, store);
      const next = mulTransform(applyInverseTransform(pg), withSkew(cur, skew));
      node2dWrite(target, "skew", V.float(skewOf(next)));
      return;
    }
    default:
      throw new UnsupportedError("node2d-prop", `Node2D.${name} 的写入没量过`);
  }
}

export function node2dApplyGlobal(target: unknown, want: GTransform2D): void {
  const up = nodeParent(target);
  const face = nodeFaceOf(up);
  if (face === null) {
    setT2d(target, new GTransform2D(want.xx, want.xy, want.yx, want.yy, want.ox, want.oy));
    return;
  }
  if (face.__gd_engine_class__ === "Window") {
    setT2d(target, new GTransform2D(want.xx, want.xy, want.yx, want.yy, want.ox, want.oy));
    return;
  }
  if (face.__gd_engine_class__ !== "Node2D" && face.__gd_engine_class__ !== "Control") throw new UnsupportedError("node2d-parent-base", `祖先的 ${face.__gd_engine_class__} 不在 2D 链上那一形没量过`);
  const g = node2dGlobalTransform(up);
  const inv = applyInverseTransform(g);
  const local = mulTransform(inv, want);
  setT2d(target, new GTransform2D(local.xx, local.xy, local.yx, local.yy, local.ox, local.oy));
  deriveVals(target, t2d(target));
}

function applyTo(g: GTransform2D, x: number, y: number): [number, number] {
  const px = r(x);
  const py = r(y);
  return [r(r(r(g.xx * px) + r(g.yx * py)) + g.ox), r(r(r(g.xy * px) + r(g.yy * py)) + g.oy)];
}

function applyInverse(g: GTransform2D, x: number, y: number): [number, number] {
  const inv = applyInverseTransform(g);
  const px = r(x);
  const py = r(y);
  return [r(r(r(inv.xx * px) + r(inv.yx * py)) + inv.ox), r(r(r(inv.xy * px) + r(inv.yy * py)) + inv.oy)];
}

export function node2dMethod(target: unknown, name: string, args: Variant[]): Variant {
  const prop = GETTERS[name];
  if (prop !== undefined) return node2dRead(target, prop) ?? V.nil();
  const propSet = SETTERS[name];
  if (propSet !== undefined) {
    const value = args[0];
    if (value === undefined) throw new UnsupportedError("node2d-arg-type", `Node2D.${name} 少了实参`);
    node2dWrite(target, propSet, value);
    return V.nil();
  }
  switch (name) {
    case "to_local": {
      const p = fromVariantVec2(args[0], "to_local");
      const g = node2dGlobalTransform(target);
      const out = applyInverse(g, p[0], p[1]);
      return vector2(out[0], out[1]);
    }
    case "to_global": {
      const p = fromVariantVec2(args[0], "to_global");
      const g = node2dGlobalTransform(target);
      const out = applyTo(g, p[0], p[1]);
      return vector2(out[0], out[1]);
    }
    case "rotate": {
      const a = fromVariantAngle(args[0], "rotate");
      const store = t2d(target);
      const v = valsOf(target, store);
      v.rot = r(v.rot + a);
      setT2d(target, fromRotScaleSkew(store, v.rot, v.sx, v.sy, v.skew));
      return V.nil();
    }
    case "translate": {
      const p = fromVariantVec2(args[0], "translate");
      const store = t2d(target);
      setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, r(store.ox + p[0]), r(store.oy + p[1])));
      return V.nil();
    }
    case "move_local_x":
    case "move_local_y": {
      const v = args[0];
      if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node2d-arg-type", `Node2D.${name} 的位移只量过数`);
      const scaled = args[1] !== undefined && args[1].t === Tag.BOOL && args[1].v === true;
      const delta = r(Number(v.v));
      const store = t2d(target);
      const ang = basisAngle(store.xx, store.xy);
      const c = r(Math.cos(ang));
      const s = r(Math.sin(ang));
      const k = name === "move_local_x" ? (scaled ? columnLength(store.xx, store.xy) : 1) : (scaled ? columnLength(store.yx, store.yy) : 1);
      const d = r(delta * k);
      const dx = name === "move_local_x" ? r(c * d) : r(-s * d);
      const dy = name === "move_local_x" ? r(s * d) : r(c * d);
      setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, r(store.ox + dx), r(store.oy + dy)));
      return V.nil();
    }
    case "apply_scale": {
      const p = fromVariantVec2(args[0], "apply_scale");
      const store = t2d(target);
      setT2d(target, new GTransform2D(r(store.xx * p[0]), r(store.xy * p[0]), r(store.yx * p[1]), r(store.yy * p[1]), store.ox, store.oy));
      const v = valsOf(target, store);
      v.sx = r(v.sx * p[0]);
      v.sy = r(v.sy * p[1]);
      return V.nil();
    }
    case "get_relative_transform_to_parent": {
      const p = args[0];
      const parent = p === undefined ? nodeParent(target) : nodeFaceOf(p.t === Tag.OBJECT ? p.v : null);
      const parentClass = nodeFaceOf(parent)?.__gd_engine_class__;
      if (parent === null || (parentClass !== "Node2D" && parentClass !== "Control")) throw new UnsupportedError("node2d-parent-base", "get_relative_transform_to_parent 的父节点不在 2D 链上那一形没量过");
      if (nodeParent(target) === parent) {
        const local = t2d(target);
        return transform2d(local.xx, local.xy, local.yx, local.yy, local.ox, local.oy);
      }
      const g = node2dGlobalTransform(target);
      const pg = node2dGlobalTransform(parent);
      const inv = applyInverseTransform(pg);
      const out = mulTransform(inv, g);
      return transform2d(out.xx, out.xy, out.yx, out.yy, out.ox, out.oy);
    }
    case "show":
      rec(target).__gd_node_visible__ = true;
      return V.nil();
    case "hide":
      rec(target).__gd_node_visible__ = false;
      return V.nil();
    case "is_visible_in_tree":
      return V.bool(false);
    case "get_global_transform": {
      const g = node2dGlobalTransform(target);
      return transform2d(g.xx, g.xy, g.yx, g.yy, g.ox, g.oy);
    }
    case "get_angle_to": {
      const p = fromVariantVec2(args[0], "get_angle_to");
      const g = node2dGlobalTransform(target);
      const local = applyInverse(g, p[0], p[1]);
      const v = valsOf(target, t2d(target));
      return V.float(r(Math.atan2(r(local[1] * v.sy), r(local[0] * v.sx))));
    }
    case "look_at": {
      const angle = node2dMethod(target, "get_angle_to", args);
      node2dMethod(target, "rotate", [angle]);
      return V.nil();
    }
    case "global_translate": {
      const p = fromVariantVec2(args[0], "global_translate");
      const cur = node2dRead(target, "global_position") as Variant;
      const c = asVec2(cur);
      if (c === null) throw new UnsupportedError("node2d-arg-type", "global_translate() 的全局位置读不回来");
      node2dWrite(target, "global_position", vector2(r(c.x + p[0]), r(c.y + p[1])));
      return V.nil();
    }
    case "set_global_transform": {
      const v = args[0];
      if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GTransform2D)) throw new UnsupportedError("node2d-arg-type", `Node2D.set_global_transform 只量过 Transform2D（收到 ${v === undefined ? "缺参" : tagName(v.t)}）`);
      const g = v.v as GTransform2D;
      node2dApplyGlobal(target, g);
      return V.nil();
    }
    default:
      throw new UnsupportedError("node2d-method", `Node2D.${name}() 这一支没量过（to_local / to_global / get_viewport 那几支还没读数）`);
  }
}
