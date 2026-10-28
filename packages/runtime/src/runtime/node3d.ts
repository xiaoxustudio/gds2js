import { Tag, V, tagName, type Variant } from "./tags";
import { UnsupportedError } from "./errors";
import { basis } from "./basis";
import { asVec3, vector3 } from "./vector3";
import { nodeFaceOf, type NodeRec } from "./node";

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

export function node3dBasis(s: T3Store): Variant {
  const cx = r(Math.cos(s.rx));
  const sx = r(Math.sin(s.rx));
  const cy = r(Math.cos(s.ry));
  const sy = r(Math.sin(s.ry));
  const cz = r(Math.cos(s.rz));
  const sz = r(Math.sin(s.rz));
  const rx: M3 = [[1, 0, 0], [0, cx, r(-sx)], [0, sx, cx]];
  const ry: M3 = [[cy, 0, sy], [0, 1, 0], [r(-sy), 0, cy]];
  const rz: M3 = [[cz, r(-sz), 0], [sz, cz, 0], [0, 0, 1]];
  const m = mul(mul(ry, rx), rz);
  return basis(
    r(m[0][0] * s.sx), r(m[1][0] * s.sx), r(m[2][0] * s.sx),
    r(m[0][1] * s.sy), r(m[1][1] * s.sy), r(m[2][1] * s.sy),
    r(m[0][2] * s.sz), r(m[1][2] * s.sz), r(m[2][2] * s.sz),
  );
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

export function node3dRead(target: unknown, name: string): Variant | null {
  const s = t3(target);
  switch (name) {
    case "position":
      return vector3(s.px, s.py, s.pz);
    case "rotation":
      return vector3(s.rx, s.ry, s.rz);
    case "rotation_degrees":
      return vector3(degOf(s.rx), degOf(s.ry), degOf(s.rz));
    case "scale":
      return vector3(s.sx, s.sy, s.sz);
    case "basis":
      return node3dBasis(s);
    case "visible":
      return V.bool(rec(target).__gd_node_visible__ !== false);
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
      s.rx = p[0];
      s.ry = p[1];
      s.rz = p[2];
      return;
    }
    case "scale": {
      const p = fromVec3(value, "scale");
      s.sx = p[0];
      s.sy = p[1];
      s.sz = p[2];
      return;
    }
    case "visible":
      if (value.t !== Tag.BOOL) throw new UnsupportedError("node3d-arg-type", `Node3D.visible 的写入只量过 bool（收到 ${tagName(value.t)}）`);
      rec(target).__gd_node_visible__ = value.v === true;
      return;
    default:
      throw new UnsupportedError("node3d-prop", `Node3D.${name} 的成员面没量过（transform 要的是 Transform3D 值类型，global_* 要的是在树里那一形）`);
  }
}
