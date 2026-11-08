import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { asBasis, axisAngleBasis, basisDeterminant, basisEulerYXZ, basisFromQuaternion, basisInverseParts, basisMul, basisOrthoParts, basisScaleParts, basisStatic, basisToQuaternion, basisXform, basis } from "../orient/basis";
import { asQuaternion, quaternion } from "../orient/quaternion";
import { NULL_OBJECT } from "../identity/null-object";
import { asVec3, vector3 } from "../vector/vector3";
import { transform3d } from "../orient/transform3d";
import { nodeFaceOf, nodeParent, type NodeRec } from "./node";
import { sceneTree } from "./scene-tree";
import { stackBlockLines, writeOrderedStderr } from "../../frames";

import { GBasis } from "../orient/basis";

import { asTransform3D, GTransform3D, transform3dCompose } from "../orient/transform3d";
import { asNodePath, nodePathText, nodePathValue } from "../identity/node-path";

const r = Math.fround;
const DEG_PER_RAD = r(180 / r(Math.PI));
const RAD_PER_DEG = r(r(Math.PI) / 180);

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
  return r(a * DEG_PER_RAD);
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
  if (!inTree(target)) globalTransformError();
}

export function node3dGlobalParts(target: unknown): { b: GBasis; x: number; y: number; z: number } {
  const s = t3(target);
  let b = node3dBasisParts(s);
  let x = s.px;
  let y = s.py;
  let z = s.pz;
  let up = nodeParent(target);
  while (up !== null) {
    const face = nodeFaceOf(up);
    if (face === null) break;
    if (face.__gd_engine_class__ === "Window") break;
    if (face.__gd_engine_class__ === "Node3D") {
      const ps = t3(up);
      const pb = node3dBasisParts(ps);
      const [ox, oy, oz] = basisXform(pb, x, y, z);
      x = r(ox + ps.px);
      y = r(oy + ps.py);
      z = r(oz + ps.pz);
      b = asBasis(basisMul(pb, b)) as GBasis;
    }
    up = nodeParent(up);
  }
  return { b, x, y, z };
}

export function node3dGlobalTransform(target: unknown): Variant {
  globalFace(target);
  if (!inTree(target)) return transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0);
  const g = node3dGlobalParts(target);
  return transform3d(g.b.x0, g.b.x1, g.b.x2, g.b.y0, g.b.y1, g.b.y2, g.b.z0, g.b.z1, g.b.z2, g.x, g.y, g.z);
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
    case "global_position": {
      if (!inTree(target)) {
        globalFace(target);
        return vector3(0, 0, 0);
      }
      const g = node3dGlobalParts(target);
      return vector3(g.x, g.y, g.z);
    }
    case "global_rotation": {
      if (!inTree(target)) {
        globalFace(target);
        return vector3(0, 0, 0);
      }
      const g = node3dGlobalParts(target);
      const e = basisEulerYXZ(g.b);
      return vector3(e[0], e[1], e[2]);
    }
    case "global_rotation_degrees": {
      if (!inTree(target)) {
        globalFace(target);
        return vector3(0, 0, 0);
      }
      const g = node3dGlobalParts(target);
      const e = basisEulerYXZ(g.b);
      return vector3(degOf(e[0]), degOf(e[1]), degOf(e[2]));
    }
    case "global_transform":
      return node3dGlobalTransform(target);
    case "global_basis": {
      if (!inTree(target)) {
        globalFace(target);
        return basis(1, 0, 0, 0, 1, 0, 0, 0, 1);
      }
      const g = node3dGlobalParts(target);
      return basis(g.b.x0, g.b.x1, g.b.x2, g.b.y0, g.b.y1, g.b.y2, g.b.z0, g.b.z1, g.b.z2);
    }
    case "quaternion": {
      const q = basisToQuaternion(node3dBasisParts(s));
      return quaternion(q.x, q.y, q.z, q.w);
    }
    case "top_level":
      return V.bool(rec(target).__gd_node_top_level__ === true);
    case "visibility_parent":
      return nodePathValue(rec(target).__gd_node_visibility_parent__ ?? "");
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
    case "rotation_degrees": {
      const p = fromVec3(value, "rotation_degrees");
      node3dMaterialize(s);
      s.rx = r(p[0] * RAD_PER_DEG);
      s.ry = r(p[1] * RAD_PER_DEG);
      s.rz = r(p[2] * RAD_PER_DEG);
      return;
    }
    case "basis": {
      const b = asBasis(value);
      if (b === null) throw new UnsupportedError("node3d-arg-type", `Node3D.basis 的写入只量过 Basis（收到 ${tagName(value.t)}）`);
      s.b3 = b;
      return;
    }
    case "quaternion": {
      const q = asQuaternion(value);
      if (q === null) throw new UnsupportedError("node3d-arg-type", `Node3D.quaternion 的写入只量过 Quaternion（收到 ${tagName(value.t)}）`);
      s.b3 = asBasis(basisFromQuaternion(q)) as GBasis;
      return;
    }
    case "top_level": {
      if (value.t !== Tag.BOOL) throw new UnsupportedError("node3d-arg-type", `Node3D.top_level 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_top_level__ = value.v === true;
      return;
    }
    case "visibility_parent": {
      const np = asNodePath(value);
      if (np === null) throw new UnsupportedError("node3d-arg-type", `Node3D.visibility_parent 的写入只量过 NodePath（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visibility_parent__ = nodePathText(np);
      return;
    }
    default:
      throw new UnsupportedError("node3d-prop", `Node3D.${name} 的成员面没量过（global_rotation 那几支的写入、look_at / translate / rotate_* 一族还没读数）`);
  }
}

const NODE3D_GETTERS: Readonly<Record<string, string>> = {
  get_position: "position",
  get_rotation: "rotation",
  get_rotation_degrees: "rotation_degrees",
  get_scale: "scale",
  get_basis: "basis",
  get_transform: "transform",
  get_quaternion: "quaternion",
  get_global_position: "global_position",
  get_global_rotation: "global_rotation",
  get_global_rotation_degrees: "global_rotation_degrees",
  get_global_basis: "global_basis",
  get_global_transform: "global_transform",
  is_set_as_top_level: "top_level",
};

const NODE3D_SETTERS: Readonly<Record<string, string>> = {
  set_position: "position",
  set_rotation: "rotation",
  set_rotation_degrees: "rotation_degrees",
  set_scale: "scale",
  set_basis: "basis",
  set_transform: "transform",
  set_quaternion: "quaternion",
  set_global_position: "global_position",
  set_as_top_level: "top_level",
};

export const NODE3D_METHOD_NAMES: readonly string[] = [
  ...Object.keys(NODE3D_GETTERS),
  ...Object.keys(NODE3D_SETTERS),
  "set_identity",
  "get_visibility_parent",
  "set_visibility_parent",
  "global_rotate",
  "global_scale",
  "global_translate",
  "rotate_object_local",
  "scale_object_local",
  "translate_object_local",
  "look_at",
  "look_at_from_position",
  "set_global_basis",
  "set_global_rotation",
  "set_global_rotation_degrees",
  "set_global_transform",
];

function setGlobalTransform(target: unknown, basisIn: GBasis, ox: number, oy: number, oz: number): void {
  const up = nodeParent(target);
  const face = nodeFaceOf(up);
  if (face === null || face.__gd_engine_class__ !== "Node3D" || rec(target).__gd_node_top_level__ === true) {
    const s = t3(target);
    s.b3 = new GBasis(basisIn.x0, basisIn.x1, basisIn.x2, basisIn.y0, basisIn.y1, basisIn.y2, basisIn.z0, basisIn.z1, basisIn.z2);
    s.px = r(ox);
    s.py = r(oy);
    s.pz = r(oz);
    return;
  }
  const pg = node3dGlobalParts(up);
  const inv = basisInverseParts(pg.b);
  if (inv === null) throw new UnsupportedError("node3d-inverse", "set_global_transform 的父基不可逆那一形没量过");
  const invOrigin = basisXform(inv, r(-pg.x), r(-pg.y), r(-pg.z));
  const invT = asTransform3D(transform3d(inv.x0, inv.x1, inv.x2, inv.y0, inv.y1, inv.y2, inv.z0, inv.z1, inv.z2, invOrigin[0] as number, invOrigin[1] as number, invOrigin[2] as number)) as GTransform3D;
  const targetT = asTransform3D(transform3d(basisIn.x0, basisIn.x1, basisIn.x2, basisIn.y0, basisIn.y1, basisIn.y2, basisIn.z0, basisIn.z1, basisIn.z2, ox, oy, oz)) as GTransform3D;
  const local = transform3dCompose(invT, targetT);
  const t = asTransform3D(local);
  if (t === null) throw new UnsupportedError("node3d-transform", "set_global_transform 的合成结果没量过");
  const s = t3(target);
  s.b3 = new GBasis(t.x0, t.x1, t.x2, t.y0, t.y1, t.y2, t.z0, t.z1, t.z2);
  s.px = t.ox;
  s.py = t.oy;
  s.pz = t.oz;
}

function globalTransform(target: unknown): { b: GBasis; x: number; y: number; z: number } {
  return node3dGlobalParts(target);
}

function setGlobalBasis(target: unknown, b: GBasis): void {
  const g = globalTransform(target);
  setGlobalTransform(target, b, g.x, g.y, g.z);
}

function scaleRows(b: GBasis, sx: number, sy: number, sz: number): GBasis {
  return new GBasis(
    r(b.x0 * sx), r(b.x1 * sy), r(b.x2 * sz),
    r(b.y0 * sx), r(b.y1 * sy), r(b.y2 * sz),
    r(b.z0 * sx), r(b.z1 * sy), r(b.z2 * sz),
  );
}

function scaleColumns(b: GBasis, sx: number, sy: number, sz: number): GBasis {
  return new GBasis(
    r(b.x0 * sx), r(b.x1 * sx), r(b.x2 * sx),
    r(b.y0 * sy), r(b.y1 * sy), r(b.y2 * sy),
    r(b.z0 * sz), r(b.z1 * sz), r(b.z2 * sz),
  );
}

function lookingAt(forwardX: number, forwardY: number, forwardZ: number, upX: number, upY: number, upZ: number, modelFront: boolean): GBasis {
  const lengthsq = r(r(r(forwardX * forwardX) + r(forwardY * forwardY)) + r(forwardZ * forwardZ));
  const len = Math.sqrt(lengthsq);
  let zx = len === 0 ? 0 : r(forwardX / len);
  let zy = len === 0 ? 0 : r(forwardY / len);
  let zz = len === 0 ? 0 : r(forwardZ / len);
  if (!modelFront) {
    zx = r(-zx);
    zy = r(-zy);
    zz = r(-zz);
  }
  let xx = r(r(upY * zz) - r(upZ * zy));
  let xy = r(r(upZ * zx) - r(upX * zz));
  let xz = r(r(upX * zy) - r(upY * zx));
  const xlensq = r(r(r(xx * xx) + r(xy * xy)) + r(xz * xz));
  if (xlensq === 0) {
    xx = 1;
    xy = 0;
    xz = 0;
  } else {
    const xlen = Math.sqrt(xlensq);
    xx = r(xx / xlen);
    xy = r(xy / xlen);
    xz = r(xz / xlen);
  }
  const yx = r(r(zy * xz) - r(zz * xy));
  const yy = r(r(zz * xx) - r(zx * xz));
  const yz = r(r(zx * xy) - r(zy * xx));
  return new GBasis(xx, yx, zx, xy, yy, zy, xz, yz, zz);
}

function vec3Arg(v: Variant | undefined, who: string): [number, number, number] {
  return fromVec3(v, who);
}

function numArg3(v: Variant | undefined, who: string): number {
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node3d-arg-type", `Node3D.${who} 只量过数`);
  return r(Number(v.v));
}

function boolArg3(v: Variant | undefined): boolean {
  return v !== undefined && v.t === Tag.BOOL && v.v === true;
}

export function node3dMethod(target: unknown, name: string, args: Variant[]): Variant | null {
  const prop = NODE3D_GETTERS[name];
  if (prop !== undefined) return node3dRead(target, prop) ?? V.nil();
  const propSet = NODE3D_SETTERS[name];
  if (propSet !== undefined) {
    const value = args[0];
    if (value === undefined) throw new UnsupportedError("node3d-arg-type", `Node3D.${name} 少了实参`);
    node3dWrite(target, propSet, value);
    return V.nil();
  }
  if (name === "set_identity") {
    node3dWrite(target, "transform", transform3d(1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0));
    return V.nil();
  }
  switch (name) {
    case "to_local": {
      const p = fromVec3(args[0], "to_local");
      const g = node3dGlobalParts(target);
      const inv = basisInverseParts(g.b);
      if (inv === null) throw new UnsupportedError("node3d-inverse", "to_local() 的全局基不可逆那一形没量过");
      const [x, y, z] = basisXform(inv, r(p[0] - g.x), r(p[1] - g.y), r(p[2] - g.z));
      return vector3(x, y, z);
    }
    case "to_global": {
      const p = fromVec3(args[0], "to_global");
      const g = node3dGlobalParts(target);
      const [x, y, z] = basisXform(g.b, p[0], p[1], p[2]);
      return vector3(r(x + g.x), r(y + g.y), r(z + g.z));
    }
    case "rotate":
    case "rotate_x":
    case "rotate_y":
    case "rotate_z": {
      const s = t3(target);
      const b = node3dBasisParts(s);
      let axisX = 1;
      let axisY = 0;
      let axisZ = 0;
      let angle = 0;
      if (name === "rotate") {
        const a = fromVec3(args[0], "rotate");
        axisX = a[0];
        axisY = a[1];
        axisZ = a[2];
        const v = args[1];
        if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node3d-arg-type", "rotate() 的角度只量过数");
        angle = r(Number(v.v));
      } else {
        if (name === "rotate_y") {
          axisX = 0;
          axisY = 1;
        } else if (name === "rotate_z") {
          axisX = 0;
          axisZ = 1;
        }
        const v = args[0];
        if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("node3d-arg-type", `${name}() 的角度只量过数`);
        angle = r(Number(v.v));
      }
      const rot = axisAngleBasis(axisX, axisY, axisZ, angle);
      s.b3 = asBasis(basisMul(rot, b)) as GBasis;
      return V.nil();
    }
    case "translate": {
      const p = fromVec3(args[0], "translate");
      const s = t3(target);
      const b = node3dBasisParts(s);
      const [x, y, z] = basisXform(b, p[0], p[1], p[2]);
      s.px = r(s.px + x);
      s.py = r(s.py + y);
      s.pz = r(s.pz + z);
      delete s.b3;
      return V.nil();
    }
    case "orthonormalize": {
      const s = t3(target);
      const b = node3dBasisParts(s);
      const o = basisOrthoParts(b);
      s.b3 = o;
      return V.nil();
    }
    case "get_visibility_parent":
      return nodePathValue(rec(target).__gd_node_visibility_parent__ ?? "");
    case "set_visibility_parent": {
      const np = asNodePath(args[0] as Variant);
      if (np === null) throw new UnsupportedError("node3d-arg-type", "set_visibility_parent() 只量过 NodePath");
      rec(target).__gd_node_visibility_parent__ = nodePathText(np);
      return V.nil();
    }
    case "set_global_transform": {
      const t = asTransform3D(args[0] as Variant);
      if (t === null) throw new UnsupportedError("node3d-arg-type", "set_global_transform() 只量过 Transform3D");
      setGlobalTransform(target, new GBasis(t.x0, t.x1, t.x2, t.y0, t.y1, t.y2, t.z0, t.z1, t.z2), t.ox, t.oy, t.oz);
      return V.nil();
    }
    case "set_global_basis": {
      const b = asBasis(args[0] as Variant);
      if (b === null) throw new UnsupportedError("node3d-arg-type", "set_global_basis() 只量过 Basis");
      setGlobalBasis(target, b);
      return V.nil();
    }
    case "set_global_rotation":
    case "set_global_rotation_degrees": {
      const deg = name.endsWith("degrees");
      const e = vec3Arg(args[0], name);
      const rot = deg ? [r(e[0] * RAD_PER_DEG), r(e[1] * RAD_PER_DEG), r(e[2] * RAD_PER_DEG)] : e;
      const g = globalTransform(target);
      const scale = basisScaleParts(g.b);
      const rotB = asBasis(basisStatic("from_euler", [vector3(rot[0] as number, rot[1] as number, rot[2] as number)]));
      const scaleB = asBasis(basisStatic("from_scale", [vector3(scale[0] as number, scale[1] as number, scale[2] as number)]));
      if (rotB === null || scaleB === null) throw new UnsupportedError("node3d-basis", "set_global_rotation 的基构造没量过");
      setGlobalTransform(target, asBasis(basisMul(rotB, scaleB)) as GBasis, g.x, g.y, g.z);
      return V.nil();
    }
    case "global_rotate": {
      const axis = vec3Arg(args[0], "global_rotate");
      const angle = numArg3(args[1], "global_rotate");
      const g = globalTransform(target);
      const rot = axisAngleBasis(axis[0] as number, axis[1] as number, axis[2] as number, angle);
      setGlobalTransform(target, asBasis(basisMul(rot, g.b)) as GBasis, g.x, g.y, g.z);
      return V.nil();
    }
    case "global_scale": {
      const k = vec3Arg(args[0], "global_scale");
      const g = globalTransform(target);
      setGlobalTransform(target, scaleRows(g.b, k[0] as number, k[1] as number, k[2] as number), g.x, g.y, g.z);
      return V.nil();
    }
    case "global_translate": {
      const off = vec3Arg(args[0], "global_translate");
      const g = globalTransform(target);
      setGlobalTransform(target, g.b, r(g.x + (off[0] as number)), r(g.y + (off[1] as number)), r(g.z + (off[2] as number)));
      return V.nil();
    }
    case "rotate_object_local": {
      const axis = vec3Arg(args[0], "rotate_object_local");
      const angle = numArg3(args[1], "rotate_object_local");
      const s = t3(target);
      const b = node3dBasisParts(s);
      const rot = axisAngleBasis(axis[0] as number, axis[1] as number, axis[2] as number, angle);
      s.b3 = asBasis(basisMul(b, rot)) as GBasis;
      return V.nil();
    }
    case "scale_object_local": {
      const k = vec3Arg(args[0], "scale_object_local");
      const s = t3(target);
      const b = node3dBasisParts(s);
      s.b3 = scaleColumns(b, k[0] as number, k[1] as number, k[2] as number);
      return V.nil();
    }
    case "translate_object_local": {
      const off = vec3Arg(args[0], "translate_object_local");
      const s = t3(target);
      const b = node3dBasisParts(s);
      const d = basisXform(b, off[0] as number, off[1] as number, off[2] as number);
      s.px = r(s.px + (d[0] as number));
      s.py = r(s.py + (d[1] as number));
      s.pz = r(s.pz + (d[2] as number));
      delete s.b3;
      return V.nil();
    }
    case "look_at":
    case "look_at_from_position": {
      const at = name === "look_at" ? 0 : 1;
      const pos = name === "look_at" ? [0, 0, 0] : vec3Arg(args[0], name);
      const tgt = vec3Arg(args[at], name);
      const up = vec3Arg(args[at + 1], name);
      const modelFront = boolArg3(args[at + 2]);
      if (name === "look_at") {
        const g = globalTransform(target);
        pos[0] = g.x;
        pos[1] = g.y;
        pos[2] = g.z;
      }
      const forward = [r((tgt[0] as number) - (pos[0] as number)), r((tgt[1] as number) - (pos[1] as number)), r((tgt[2] as number) - (pos[2] as number))];
      const b = lookingAt(forward[0] as number, forward[1] as number, forward[2] as number, up[0] as number, up[1] as number, up[2] as number, modelFront);
      const scale = node3dScale(t3(target));
      setGlobalTransform(target, b, pos[0] as number, pos[1] as number, pos[2] as number);
      node3dWrite(target, "scale", vector3(scale[0] as number, scale[1] as number, scale[2] as number));
      return V.nil();
    }
    case "get_parent_node_3d": {
      let up = nodeParent(target);
      while (up !== null) {
        const face = nodeFaceOf(up);
        if (face === null) return V.object(NULL_OBJECT);
        if (face.__gd_engine_class__ === "Node3D") return V.object(up);
        up = nodeParent(up);
      }
      return V.object(NULL_OBJECT);
    }
    default:
      return null;
  }
}
