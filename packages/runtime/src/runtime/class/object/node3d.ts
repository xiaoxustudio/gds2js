import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { basisDeterminant, basisEulerYXZ, basisScaleParts, basis } from "../orient/basis";
import { asVec3, vector3 } from "../vector/vector3";
import { transform3d } from "../orient/transform3d";
import { nodeFaceOf, type NodeRec } from "./node";
import { sceneTree } from "./scene-tree";
import { stackBlockLines, writeOrderedStderr } from "../../frames";

import { GBasis } from "../orient/basis";

import { asTransform3D } from "../orient/transform3d";

const r = Math.fround;

type T3Store = {
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  sx: number;
  sy: number;
  sz: number;
  b3?: GBasis;
};

function rec(target: unknown): NodeRec {
  const f = nodeFaceOf(target);
  if (f === null) throw new UnsupportedError("node-face-missing", "这一支要落在带节点面的对象上");
  return f;
}

function t3(target: unknown): T3Store {
  const face = rec(target);
  const store = face.__gd_node_t3d__ as T3Store | undefined;
  if (store !== undefined) return store;
  const fresh: T3Store = { px: 0, py: 0, pz: 0, rx: 0, ry: 0, rz: 0, sx: 1, sy: 1, sz: 1 };
  face.__gd_node_t3d__ = fresh;
  return fresh;
}

type M3 = [[number, number, number], [number, number, number], [number, number, number]];

function dot(row: [number, number, number], c0: number, c1: number, c2: number): number {
  return r(r(r(row[0] * c0) + r(row[1] * c1)) + r(row[2] * c2));
}

function mul(a: M3, b: M3): M3 {
  const [a0, a1, a2] = a;
  const [b0, b1, b2] = b;
  const row = (u: [number, number, number]): [number, number, number] => [
    dot(u, b0[0], b1[0], b2[0]),
    dot(u, b0[1], b1[1], b2[1]),
    dot(u, b0[2], b1[2], b2[2]),
  ];
  return [row(a0), row(a1), row(a2)];
}

export function node3dBasisParts(s: T3Store): GBasis {
  if (s.b3 !== undefined) return s.b3;
  const cx = r(Math.cos(s.rx));
  const sx = r(Math.sin(s.rx));
  const cy = r(Math.cos(s.ry));
  const sy = r(Math.sin(s.ry));
  const cz = r(Math.cos(s.rz));
  const sz = r(Math.sin(s.rz));
  const rx: M3 = [[1, 0, 0], [0, cx, r(-sx)], [0, sx, cx]];
  const ry: M3 = [[cy, 0, sy], [0, 1, 0], [r(-sy), 0, cy]];
  const rz: M3 = [[cz, r(-sz), 0], [sz, cz, 0], [0, 0, 1]];
  const m = mul(ry, mul(rx, rz));
  return new GBasis(
    r(m[0][0] * s.sx), r(m[1][0] * s.sx), r(m[2][0] * s.sx),
    r(m[0][1] * s.sy), r(m[1][1] * s.sy), r(m[2][1] * s.sy),
    r(m[0][2] * s.sz), r(m[1][2] * s.sz), r(m[2][2] * s.sz),
  );
}

export function node3dBasis(s: T3Store): Variant {
  const b = node3dBasisParts(s);
  return basis(b.x0, b.x1, b.x2, b.y0, b.y1, b.y2, b.z0, b.z1, b.z2);
}

function node3dRotation(s: T3Store): [number, number, number] {
  const b = s.b3;
  if (b === undefined) return [s.rx, s.ry, s.rz];
  if (basisDeterminant(b) === 0) throw new UnsupportedError("node3d-transform-decompose", "Node3D.transform 存下行列式为零的 basis 后再读 rotation/scale 那一形没量过：orthonormalized 要除以列长");
  return basisEulerYXZ(b);
}

function node3dScale(s: T3Store): [number, number, number] {
  const b = s.b3;
  if (b === undefined) return [s.sx, s.sy, s.sz];
  if (basisDeterminant(b) === 0) throw new UnsupportedError("node3d-transform-decompose", "Node3D.transform 存下行列式为零的 basis 后再读 rotation/scale 那一形没量过：orthonormalized 要除以列长");
  return basisScaleParts(b);
}

function node3dMaterialize(s: T3Store): void {
  const b = s.b3;
  if (b === undefined) return;
  const e = basisEulerYXZ(b);
  const k = basisScaleParts(b);
  s.rx = e[0];
  s.ry = e[1];
  s.rz = e[2];
  s.sx = k[0];
  s.sy = k[1];
  s.sz = k[2];
  delete s.b3;
}

function fromVec3(v: Variant | undefined, who: string): [number, number, number] {
  if (v === undefined) throw new UnsupportedError("node3d-arg-type", `Node3D.${who} 的写入少了实参`);
  const p = asVec3(v);
  if (p === null) throw new UnsupportedError("node3d-arg-type", `Node3D.${who} 的写入只量过 Vector3（收到 ${tagName(v.t)}）`);
  return [p.x, p.y, p.z];
}

function degOf(a: number): number {
  return r(a * r(180 / Math.PI));
}

function globalTransformError(): void {
  writeOrderedStderr(stackBlockLines("ERROR", "get_global_transform (scene/3d/node_3d.cpp:642)", [V.str('Condition "!is_inside_tree()" is true. Returning: Transform3D()')]));
}

function inTree(target: unknown): boolean {
  const tree = sceneTree();
  if (tree === null) return false;
  let cur: object | null = target as object;
  for (;;) {
    if (cur === tree.root) return true;
    cur = nodeFaceOf(cur)?.__gd_node_parent__ ?? null;
    if (cur === null) return false;
  }
}

function globalFace(target: unknown): void {
  if (inTree(target)) throw new UnsupportedError("node3d-global-in-tree", "Node3D 的 global_* 只量过不在树里那一形：挂在活树上的链还没读数");
}

export function node3dGlobalTransform(target: unknown): Variant {
  globalFace(target);
  globalTransformError();
  return transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
}

export function node3dRead(target: unknown, name: string): Variant | null {
  const s = t3(target);
  switch (name) {
    case "position":
      return vector3(s.px, s.py, s.pz);
    case "rotation": {
      const e = node3dRotation(s);
      return vector3(e[0], e[1], e[2]);
    }
    case "rotation_degrees": {
      const e = node3dRotation(s);
      return vector3(degOf(e[0]), degOf(e[1]), degOf(e[2]));
    }
    case "scale": {
      const k = node3dScale(s);
      return vector3(k[0], k[1], k[2]);
    }
    case "basis":
      return node3dBasis(s);
    case "visible":
      return V.bool(rec(target).__gd_node_visible__ !== false);
    case "transform": {
      const b = node3dBasisParts(s);
      return transform3d(b.x0, b.x1, b.x2, b.y0, b.y1, b.y2, b.z0, b.z1, b.z2, s.px, s.py, s.pz);
    }
    case "global_position":
    case "global_rotation":
    case "global_rotation_degrees":
      globalFace(target);
      globalTransformError();
      return vector3(0, 0, 0);
    case "global_basis":
      globalFace(target);
      globalTransformError();
      return basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
    default:
      return null;
  }
}

export function node3dWrite(target: unknown, name: string, value: Variant): void {
  const s = t3(target);
  switch (name) {
    case "position": {
      const p = fromVec3(value, "position");
      s.px = p[0];
      s.py = p[1];
      s.pz = p[2];
      return;
    }
    case "rotation": {
      const p = fromVec3(value, "rotation");
      node3dMaterialize(s);
      s.rx = p[0];
      s.ry = p[1];
      s.rz = p[2];
      return;
    }
    case "scale": {
      const p = fromVec3(value, "scale");
      node3dMaterialize(s);
      s.sx = p[0];
      s.sy = p[1];
      s.sz = p[2];
      return;
    }
    case "visible":
      if (value.t !== Tag.BOOL) throw new UnsupportedError("node3d-arg-type", `Node3D.visible 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visible__ = value.v === true;
      return;
    case "transform": {
      const t = asTransform3D(value);
      if (t === null) throw new UnsupportedError("node3d-arg-type", `Node3D.transform 的写入只量过 Transform3D（收到 ${tagName(value.t)}）`);
      s.b3 = new GBasis(t.x0, t.x1, t.x2, t.y0, t.y1, t.y2, t.z0, t.z1, t.z2);
      s.px = t.ox;
      s.py = t.oy;
      s.pz = t.oz;
      return;
    }
    case "global_position": {
      const p = fromVec3(value, "global_position");
      globalFace(target);
      globalTransformError();
      delete s.b3;
      s.px = p[0];
      s.py = p[1];
      s.pz = p[2];
      s.rx = 0;
      s.ry = 0;
      s.rz = 0;
      s.sx = 1;
      s.sy = 1;
      s.sz = 1;
      return;
    }
    default:
      throw new UnsupportedError("node3d-prop", `Node3D.${name} 的成员面没量过（global_rotation 那几支的写入、look_at / translate / rotate_* 一族还没读数）`);
  }
}
