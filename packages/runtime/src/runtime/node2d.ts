import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { asVec2, vector2 } from "./class/vector/vector2";
import { transform2d } from "./class/orient/transform2d";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";

import { GTransform2D } from "./class/orient/transform2d";

const r = Math.fround;

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

export function node2dGlobalTransform(target: unknown): GTransform2D {
  let cur: GTransform2D = t2d(target);
  let up = nodeParent(target);
  while (up !== null) {
    const face = nodeFaceOf(up);
    if (face === null) throw new UnsupportedError("node2d-parent", "Node2D 往上的祖先没有节点面那一形没量过");
    if (face.__gd_engine_class__ === "Window") break;
    if (face.__gd_engine_class__ !== "Node2D") throw new UnsupportedError("node2d-parent-base", `祖先的 ${face.__gd_engine_class__} 不在 2D 链上那一形没量过`);
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
      return V.float(basisAngle(store.xx, store.xy));
    case "rotation_degrees":
      return V.float(r(r(basisAngle(store.xx, store.xy)) * r(180 / Math.PI)));
    case "scale":
      return vector2(columnLength(store.xx, store.xy), columnLength(store.yx, store.yy));
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
      const [bx, by, cy, dy] = rotBasis(fromVariantAngle(value, "rotation"));
      setT2d(target, new GTransform2D(bx, by, cy, dy, store.ox, store.oy));
      return;
    }
    case "rotation_degrees": {
      const deg = fromVariantAngle(value, "rotation_degrees");
      const [bx, by, cy, dy] = rotBasis(r(deg * r(Math.PI / 180)));
      setT2d(target, new GTransform2D(bx, by, cy, dy, store.ox, store.oy));
      return;
    }
    case "scale": {
      const s = fromVariantVec2(value, "scale");
      setT2d(target, new GTransform2D(r(store.xx * s[0]), r(store.xy * s[0]), r(store.yx * s[1]), r(store.yy * s[1]), store.ox, store.oy));
      return;
    }
    case "transform": {
      if (value.t !== Tag.OBJECT || !(value.v instanceof GTransform2D)) throw new UnsupportedError("node2d-arg-type", `Node2D.transform 的写入只量过 Transform2D（收到 ${tagName(value.t)}）`);
      const g = value.v as GTransform2D;
      setT2d(target, new GTransform2D(g.xx, g.xy, g.yx, g.yy, g.ox, g.oy));
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
      const det = r(r(g.xx * g.yy) - r(g.xy * g.yx));
      if (det === 0) throw new UnsupportedError("node2d-inverse", "全局位置写入要过行列式为零的父变换那一形没量过");
      const dx = r(want[0] - g.ox);
      const dy = r(want[1] - g.oy);
      const lx = r(r(r(g.yy * dx) - r(g.yx * dy)) / det);
      const ly = r(r(r(g.xx * dy) - r(g.xy * dx)) / det);
      setT2d(target, new GTransform2D(store.xx, store.xy, store.yx, store.yy, lx, ly));
      return;
    }
    case "visible": {
      if (value.t !== Tag.BOOL) throw new UnsupportedError("node2d-arg-type", `Node2D.visible 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visible__ = value.v === true;
      return;
    }
    default:
      throw new UnsupportedError("node2d-prop", `Node2D.${name} 的写入没量过`);
  }
}

export function node2dMethod(target: unknown, name: string, args: Variant[]): Variant {
  switch (name) {
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
    default:
      throw new UnsupportedError("node2d-method", `Node2D.${name}() 这一支没量过（to_local / to_global / get_viewport 那几支还没读数）`);
  }
}
