import { Tag, V, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { GArray } from "../../values";
import { GVector3, asVec3, vector3 } from "../vector/vector3";
import { GPlane, asPlane, plane } from "../orient/plane";
import { GBytes } from "../bytes/packed";

type V3 = { x: number; y: number; z: number };

const EPS = 1e-6;

const add = (a: V3, b: V3): V3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const sub = (a: V3, b: V3): V3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const mul = (a: V3, k: number): V3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const dot = (a: V3, b: V3): number => a.x * b.x + a.y * b.y + a.z * b.z;
const cross = (a: V3, b: V3): V3 => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const len2 = (a: V3): number => dot(a, a);
const norm = (a: V3): V3 => {
  const l = Math.sqrt(len2(a));
  return l === 0 ? { x: 0, y: 0, z: 0 } : mul(a, 1 / l);
};

function v3Arg(args: Variant[], at: number, who: string): V3 {
  const v = args[at];
  const g = v === undefined ? null : asVec3(v);
  if (g === null) throw new UnsupportedError("geometry-arg", `Geometry3D.${who}() 的第 ${String(at + 1)} 参只量过 Vector3`);
  return { x: g.x, y: g.y, z: g.z };
}

function numArg(args: Variant[], at: number, who: string): number {
  const v = args[at];
  if (v === undefined || (v.t !== Tag.INT && v.t !== Tag.FLOAT)) throw new UnsupportedError("geometry-arg", `Geometry3D.${who}() 的第 ${String(at + 1)} 参只量过数`);
  return Number(v.v as number | bigint);
}

function intArg(args: Variant[], at: number, who: string): number {
  return Math.trunc(numArg(args, at, who));
}

function planesArg(args: Variant[], at: number, who: string): GPlane[] {
  const v = args[at];
  if (v === undefined || v.t !== Tag.ARRAY) throw new UnsupportedError("geometry-arg", `Geometry3D.${who}() 的平面表只量过 Array[Plane]`);
  const out: GPlane[] = [];
  for (const item of (v.v as GArray).raw()) {
    const p = asPlane(item);
    if (p === null) throw new UnsupportedError("geometry-arg", `Geometry3D.${who}() 的平面表里有非 Plane`);
    out.push(p);
  }
  return out;
}

function packV3Arg(args: Variant[], at: number, who: string): V3[] {
  const v = args[at];
  if (v === undefined || v.t !== Tag.OBJECT || !(v.v instanceof GBytes)) throw new UnsupportedError("geometry-arg", `Geometry3D.${who}() 只量过 PackedVector3Array`);
  const out: V3[] = [];
  for (const item of (v.v as GBytes).raw()) {
    const g = item as GVector3;
    out.push({ x: g.x, y: g.y, z: g.z });
  }
  return out;
}

const packV3 = (items: V3[]): Variant => V.object(new GBytes(items.map((p) => new GVector3(p.x, p.y, p.z)), "vector3"));
const planeList = (items: GPlane[]): Variant => V.array(GArray.of(items.map((p) => plane(p.nx, p.ny, p.nz, p.d))));

function axisRadial(axis: number, angle: number): V3 {
  const n = { x: 0, y: 0, z: 0 };
  n[["x", "y", "z"][(axis + 1) % 3] as "x" | "y" | "z"] = Math.cos(angle);
  n[["x", "y", "z"][(axis + 2) % 3] as "x" | "y" | "z"] = Math.sin(angle);
  return n;
}

function buildBoxPlanes(extents: V3): GPlane[] {
  return [
    new GPlane(1, 0, 0, extents.x),
    new GPlane(-1, 0, 0, extents.x),
    new GPlane(0, 1, 0, extents.y),
    new GPlane(0, -1, 0, extents.y),
    new GPlane(0, 0, 1, extents.z),
    new GPlane(0, 0, -1, extents.z),
  ];
}

function buildCylinderPlanes(radius: number, height: number, sides: number, axis: number): GPlane[] {
  const out: GPlane[] = [];
  for (let i = 0; i < sides; i++) {
    const n = axisRadial(axis, (i * Math.PI * 2) / sides);
    out.push(new GPlane(n.x, n.y, n.z, radius));
  }
  const up = { x: 0, y: 0, z: 0 };
  up[["x", "y", "z"][axis] as "x" | "y" | "z"] = 1;
  out.push(new GPlane(up.x, up.y, up.z, height / 2));
  out.push(new GPlane(-up.x, -up.y, -up.z, height / 2));
  return out;
}

function buildCapsulePlanes(radius: number, height: number, sides: number, lats: number, axis: number): GPlane[] {
  const out: GPlane[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides;
    const radial = axisRadial(axis, angle);
    out.push(new GPlane(radial.x, radial.y, radial.z, radius));
    for (let k = 1; k <= lats; k++) {
      const y = k;
      const r = lats - k;
      const n = norm(add(mul(radial, r), axisUnit(axis, y)));
      const d = radius + (height / 2) * (y / Math.sqrt(y * y + r * r));
      out.push(new GPlane(n.x, n.y, n.z, d));
      out.push(new GPlane(-n.x, -n.y, -n.z, d));
    }
  }
  return out;
}

function axisUnit(axis: number, k: number): V3 {
  const n = { x: 0, y: 0, z: 0 };
  n[["x", "y", "z"][axis] as "x" | "y" | "z"] = k;
  return n;
}

function clipPolygon(points: V3[], p: GPlane): V3[] {
  const out: V3[] = [];
  const n = points.length;
  const normal = { x: p.nx, y: p.ny, z: p.nz };
  for (let i = 0; i < n; i++) {
    const cur = points[i] as V3;
    const prev = points[(i - 1 + n) % n] as V3;
    const dCur = dot(normal, cur) - p.d;
    const dPrev = dot(normal, prev) - p.d;
    if (dCur > 0) {
      if (dPrev <= 0) {
        const t = dPrev / (dPrev - dCur);
        out.push(add(prev, mul(sub(cur, prev), t)));
      }
      continue;
    }
    if (dPrev > 0) {
      const t = dPrev / (dPrev - dCur);
      out.push(add(prev, mul(sub(cur, prev), t)));
    }
    out.push(cur);
  }
  return out;
}

function intersectionOfPlanes(a: GPlane, b: GPlane, c: GPlane): V3 | null {
  const n1 = { x: a.nx, y: a.ny, z: a.nz };
  const n2 = { x: b.nx, y: b.ny, z: b.nz };
  const n3 = { x: c.nx, y: c.ny, z: c.nz };
  const c23 = cross(n2, n3);
  const denom = dot(n1, c23);
  if (Math.abs(denom) < 1e-9) return null;
  const c31 = cross(n3, n1);
  const c12 = cross(n1, n2);
  return mul(add(add(mul(c23, a.d), mul(c31, b.d)), mul(c12, c.d)), 1 / denom);
}

function insideAll(p: V3, planes: GPlane[]): boolean {
  for (const pl of planes) if (dot({ x: pl.nx, y: pl.ny, z: pl.nz }, p) - pl.d > 1e-4) return false;
  return true;
}

function segmentTriangle(from: V3, to: V3, a: V3, b: V3, c: V3): V3 | null {
  const dir = sub(to, from);
  const e1 = sub(b, a);
  const e2 = sub(c, a);
  const h = cross(dir, e2);
  const det = dot(e1, h);
  if (Math.abs(det) < 1e-12) return null;
  const f = 1 / det;
  const s = sub(from, a);
  const u = f * dot(s, h);
  if (u < -EPS || u > 1 + EPS) return null;
  const q = cross(s, e1);
  const v = f * dot(dir, q);
  if (v < -EPS || u + v > 1 + EPS) return null;
  const t = f * dot(e2, q);
  return t < -EPS || t > 1 + EPS ? null : add(from, mul(dir, t));
}

function rayTriangle(from: V3, dir: V3, a: V3, b: V3, c: V3): V3 | null {
  const e1 = sub(b, a);
  const e2 = sub(c, a);
  const h = cross(dir, e2);
  const det = dot(e1, h);
  if (Math.abs(det) < 1e-12) return null;
  const f = 1 / det;
  const s = sub(from, a);
  const u = f * dot(s, h);
  if (u < -EPS || u > 1 + EPS) return null;
  const q = cross(s, e1);
  const v = f * dot(dir, q);
  if (v < -EPS || u + v > 1 + EPS) return null;
  const t = f * dot(e2, q);
  return t < -EPS ? null : add(from, mul(dir, t));
}

function closestOnSegment(p: V3, s1: V3, s2: V3, capped: boolean): V3 {
  const d = sub(s2, s1);
  const l = len2(d);
  if (l === 0) return s1;
  let t = dot(sub(p, s1), d) / l;
  if (capped) t = Math.max(0, Math.min(1, t));
  return add(s1, mul(d, t));
}

function closestBetween(p1: V3, p2: V3, q1: V3, q2: V3): [V3, V3] {
  const d1 = sub(p2, p1);
  const d2 = sub(q2, q1);
  const r = sub(p1, q1);
  const a = len2(d1);
  const e = len2(d2);
  const f = dot(d2, r);
  let s: number;
  let t: number;
  if (a <= EPS && e <= EPS) return [p1, q1];
  if (a <= EPS) {
    s = 0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = dot(d1, r);
    if (e <= EPS) {
      t = 0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = dot(d1, d2);
      const denom = a * e - b * b;
      s = denom === 0 ? 0 : Math.max(0, Math.min(1, (b * f - c * e) / denom));
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1) {
        t = 1;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }
  return [add(p1, mul(d1, s)), add(q1, mul(d2, t))];
}

function tetraVolumeSign(a: V3, b: V3, c: V3, d: V3): number {
  return dot(sub(b, a), cross(sub(c, a), sub(d, a)));
}

function inCircumsphere(a: V3, b: V3, c: V3, d: V3, p: V3): boolean {
  const ax = a.x - p.x, ay = a.y - p.y, az = a.z - p.z;
  const bx = b.x - p.x, by = b.y - p.y, bz = b.z - p.z;
  const cx = c.x - p.x, cy = c.y - p.y, cz = c.z - p.z;
  const dx = d.x - p.x, dy = d.y - p.y, dz = d.z - p.z;
  const al = ax * ax + ay * ay + az * az;
  const bl = bx * bx + by * by + bz * bz;
  const cl = cx * cx + cy * cy + cz * cz;
  const dl = dx * dx + dy * dy + dz * dz;
  const det =
    ax * (by * (cz * dl - cl * dz) - bz * (cy * dl - cl * dy) + bl * (cy * dz - cz * dy)) -
    ay * (bx * (cz * dl - cl * dz) - bz * (cx * dl - cl * dx) + bl * (cx * dz - cz * dx)) +
    az * (bx * (cy * dl - cl * dy) - by * (cx * dl - cl * dx) + bl * (cx * dy - cy * dx)) -
    al * (bx * (cy * dz - cz * dy) - by * (cx * dz - cz * dx) + bz * (cx * dy - cy * dx));
  return tetraVolumeSign(a, b, c, d) > 0 ? det < -EPS : det > EPS;
}

function delaunay(points: V3[]): number[] {
  if (points.length < 4) return [];
  let min = { x: Infinity, y: Infinity, z: Infinity };
  let max = { x: -Infinity, y: -Infinity, z: -Infinity };
  for (const p of points) {
    min = { x: Math.min(min.x, p.x), y: Math.min(min.y, p.y), z: Math.min(min.z, p.z) };
    max = { x: Math.max(max.x, p.x), y: Math.max(max.y, p.y), z: Math.max(max.z, p.z) };
  }
  const center = mul(add(min, max), 0.5);
  const span = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 1);
  const s = span * 20;
  const superVerts: V3[] = [
    { x: center.x - s, y: center.y - s, z: center.z - s },
    { x: center.x + s, y: center.y - s, z: center.z - s },
    { x: center.x, y: center.y + s, z: center.z - s },
    { x: center.x, y: center.y, z: center.z + s },
  ];
  const verts = [...points, ...superVerts];
  const superStart = points.length;
  let tets: Array<[number, number, number, number]> = [[superStart, superStart + 1, superStart + 2, superStart + 3]];
  for (let i = 0; i < points.length; i++) {
    const p = points[i] as V3;
    const bad: Array<[number, number, number, number]> = [];
    const keep: typeof tets = [];
    for (const t of tets) {
      if (inCircumsphere(verts[t[0]] as V3, verts[t[1]] as V3, verts[t[2]] as V3, verts[t[3]] as V3, p)) bad.push(t);
      else keep.push(t);
    }
    const faces = new Map<string, [number, number, number]>();
    for (const t of bad) {
      for (const f of [[t[1], t[2], t[3]], [t[0], t[2], t[3]], [t[0], t[1], t[3]], [t[0], t[1], t[2]]] as Array<[number, number, number]>) {
        const key = [...f].sort((x, y) => x - y).join(",");
        if (faces.has(key)) faces.delete(key);
        else faces.set(key, f);
      }
    }
    tets = keep;
    for (const f of faces.values()) tets.push([f[0], f[1], f[2], i]);
  }
  const out: string[] = [];
  for (const t of tets) {
    if (t.some((idx) => idx >= superStart)) continue;
    out.push([...t].sort((x, y) => x - y).join(","));
  }
  out.sort();
  return out.flatMap((s) => s.split(",").map(Number));
}

export function geometry3dStatic(name: string, args: Variant[]): Variant {
  switch (name) {
    case "build_box_planes":
      return planeList(buildBoxPlanes(v3Arg(args, 0, name)));
    case "build_cylinder_planes":
      return planeList(buildCylinderPlanes(numArg(args, 0, name), numArg(args, 1, name), intArg(args, 2, name), intArg(args, 3, name)));
    case "build_capsule_planes":
      return planeList(buildCapsulePlanes(numArg(args, 0, name), numArg(args, 1, name), intArg(args, 2, name), intArg(args, 3, name), intArg(args, 4, name)));
    case "clip_polygon": {
      const pl = args[1] === undefined ? null : asPlane(args[1]);
      if (pl === null) throw new UnsupportedError("geometry-arg", "Geometry3D.clip_polygon() 的第 2 参只量过 Plane");
      return packV3(clipPolygon(packV3Arg(args, 0, name), pl));
    }
    case "compute_convex_mesh_points": {
      const planes = planesArg(args, 0, name);
      const points: V3[] = [];
      for (let i = 0; i < planes.length; i++) {
        for (let j = i + 1; j < planes.length; j++) {
          for (let k = j + 1; k < planes.length; k++) {
            const p = intersectionOfPlanes(planes[i] as GPlane, planes[j] as GPlane, planes[k] as GPlane);
            if (p === null || !insideAll(p, planes)) continue;
            if (points.some((q) => Math.abs(q.x - p.x) < 1e-5 && Math.abs(q.y - p.y) < 1e-5 && Math.abs(q.z - p.z) < 1e-5)) continue;
            points.push(p);
          }
        }
      }
      points.sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
      return packV3(points);
    }
    case "get_closest_point_to_segment":
      return packPoint(closestOnSegment(v3Arg(args, 0, name), v3Arg(args, 1, name), v3Arg(args, 2, name), true));
    case "get_closest_point_to_segment_uncapped":
      return packPoint(closestOnSegment(v3Arg(args, 0, name), v3Arg(args, 1, name), v3Arg(args, 2, name), false));
    case "get_closest_points_between_segments": {
      const [pa, qa] = closestBetween(v3Arg(args, 0, name), v3Arg(args, 1, name), v3Arg(args, 2, name), v3Arg(args, 3, name));
      return packV3([pa, qa]);
    }
    case "get_triangle_barycentric_coords": {
      const p = v3Arg(args, 0, name);
      const a = v3Arg(args, 1, name);
      const b = v3Arg(args, 2, name);
      const c = v3Arg(args, 3, name);
      const v0 = sub(b, a);
      const v1 = sub(c, a);
      const v2 = sub(p, a);
      const d00 = dot(v0, v0);
      const d01 = dot(v0, v1);
      const d11 = dot(v1, v1);
      const d20 = dot(v2, v0);
      const d21 = dot(v2, v1);
      const denom = d00 * d11 - d01 * d01;
      const v = (d11 * d20 - d01 * d21) / denom;
      const w = (d00 * d21 - d01 * d20) / denom;
      return packPoint({ x: 1 - v - w, y: v, z: w });
    }
    case "ray_intersects_triangle": {
      const hit = rayTriangle(v3Arg(args, 0, name), v3Arg(args, 1, name), v3Arg(args, 2, name), v3Arg(args, 3, name), v3Arg(args, 4, name));
      return hit === null ? V.nil() : packPoint(hit);
    }
    case "segment_intersects_triangle": {
      const hit = segmentTriangle(v3Arg(args, 0, name), v3Arg(args, 1, name), v3Arg(args, 2, name), v3Arg(args, 3, name), v3Arg(args, 4, name));
      return hit === null ? V.nil() : packPoint(hit);
    }
    case "segment_intersects_sphere": {
      const from = v3Arg(args, 0, name);
      const to = v3Arg(args, 1, name);
      const center = v3Arg(args, 2, name);
      const r = numArg(args, 3, name);
      const dir = sub(to, from);
      const oc = sub(from, center);
      if (len2(oc) < r * r) return packV3([]);
      const a = len2(dir);
      const b = 2 * dot(oc, dir);
      const c = len2(oc) - r * r;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return packV3([]);
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t < 0 || t > 1) return packV3([]);
      const hit = add(from, mul(dir, t));
      return packV3([hit, hit]);
    }
    case "segment_intersects_cylinder": {
      const from = v3Arg(args, 0, name);
      const to = v3Arg(args, 1, name);
      const height = numArg(args, 2, name);
      const radius = numArg(args, 3, name);
      const hit = cylinderEntry(from, to, height, radius);
      return hit === null ? packV3([]) : packV3([hit, hit]);
    }
    case "segment_intersects_convex": {
      const from = v3Arg(args, 0, name);
      const to = v3Arg(args, 1, name);
      const planes = planesArg(args, 2, name);
      const res = convexEntry(from, to, planes);
      return res === null ? packV3([]) : packV3([res.point, res.normal]);
    }
    case "tetrahedralize_delaunay":
      return V.object(new GBytes(delaunay(packV3Arg(args, 0, name)), "int32"));
    default:
      throw new UnsupportedError("geometry-method", `Geometry3D.${name}() 这一支没量过`);
  }
}

function packPoint(p: V3): Variant {
  return vector3(p.x, p.y, p.z);
}

function cylinderEntry(from: V3, to: V3, height: number, radius: number): V3 | null {
  const dir = sub(to, from);
  const insideY = Math.abs(from.y) <= height / 2;
  const radial = from.x * from.x + from.z * from.z;
  if (radial < radius * radius && insideY) return null;
  let best = Infinity;
  if (radial >= radius * radius) {
    const a = dir.x * dir.x + dir.z * dir.z;
    const b = 2 * (from.x * dir.x + from.z * dir.z);
    const c = radial - radius * radius;
    const disc = b * b - 4 * a * c;
    if (disc >= 0 && a !== 0) {
      const t = (-b - Math.sqrt(disc)) / (2 * a);
      if (t >= 0 && t <= 1) {
        const y = from.y + dir.y * t;
        if (Math.abs(y) <= height / 2) best = Math.min(best, t);
      }
    }
  }
  if (Math.abs(dir.y) > 1e-12) {
    for (const yc of [height / 2, -height / 2]) {
      const t = (yc - from.y) / dir.y;
      if (t < 0 || t > 1) continue;
      const x = from.x + dir.x * t;
      const z = from.z + dir.z * t;
      if (x * x + z * z <= radius * radius + 1e-9) best = Math.min(best, t);
    }
  }
  return best === Infinity ? null : add(from, mul(dir, best));
}

function convexEntry(from: V3, to: V3, planes: GPlane[]): { point: V3; normal: V3 } | null {
  const dir = sub(to, from);
  let entryT = -Infinity;
  let exitT = Infinity;
  let entryNormal: V3 | null = null;
  for (const pl of planes) {
    const normal = { x: pl.nx, y: pl.ny, z: pl.nz };
    const d0 = dot(normal, from) - pl.d;
    const d1 = dot(normal, to) - pl.d;
    if (d0 > 0 && d1 <= 0) {
      const t = d0 / (d0 - d1);
      if (t > entryT) {
        entryT = t;
        entryNormal = normal;
      }
    } else if (d0 <= 0 && d1 > 0) {
      exitT = Math.min(exitT, d0 / (d0 - d1));
    }
  }
  if (entryNormal === null || entryT > exitT || entryT > 1) return null;
  return { point: add(from, mul(dir, entryT)), normal: entryNormal };
}
