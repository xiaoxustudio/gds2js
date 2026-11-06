import { Tag, V, tagName, type Variant } from "../../tags";
import { UnsupportedError } from "../../errors";
import { num6Text } from "../../numfmt";
import { asVec3, vector3 } from "../vector/vector3";

export class GQuaternion {
  x: number;
  y: number;
  z: number;
  w: number;
  constructor(x: number, y: number, z: number, w: number) {
    const r = Math.fround;
    this.x = r(x);
    this.y = r(y);
    this.z = r(z);
    this.w = r(w);
  }
}

export function asQuaternion(v: Variant): GQuaternion | null {
  return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? (v.v as GQuaternion) : null;
}

const r = Math.fround;
export function quaternion(x: number, y: number, z: number, w: number): Variant {
  return V.object(new GQuaternion(x, y, z, w));
}
function num(v: Variant | undefined, at: string): number {
  if (v === undefined) throw new UnsupportedError("quaternion-arity", `Quaternion() 的 ${at} 缺了`);
  if (v.t === Tag.INT || v.t === Tag.FLOAT) return r(Number(v.v));
  throw new UnsupportedError("quaternion-arg", `Quaternion() 的 ${at} 只量过数（收到 ${tagName(v.t)}）`);
}
function axisAngle(ax: number, ay: number, az: number, angle: number): Variant {
  const half = r(angle / 2);
  const s = r(Math.sin(half));
  return quaternion(r(ax * s), r(ay * s), r(az * s), r(Math.cos(half)));
}
export function quaternionNew(args: Variant[]): Variant {
  if (args.length === 0) return quaternion(0, 0, 0, 1);
  if (args.length === 1) {
    const q = asQuaternion(args[0] as Variant);
    if (q !== null) return quaternion(q.x, q.y, q.z, q.w);
    throw new UnsupportedError("quaternion-arg", `Quaternion() 单参只量过 Quaternion 本身（收到 ${tagName((args[0] as Variant).t)}）`);
  }
  if (args.length === 2) {
    const a = asVec3(args[0] as Variant);
    const b = asVec3(args[1] as Variant);
    if (a !== null && b !== null) {
      const cx = r(r(a.y * b.z) - r(a.z * b.y));
      const cy = r(r(a.z * b.x) - r(a.x * b.z));
      const cz = r(r(a.x * b.y) - r(a.y * b.x));
      const len = Math.sqrt(r(r(cx * cx) + r(cy * cy)) + r(cz * cz));
      if (len === 0) throw new UnsupportedError("quaternion-arc", "Quaternion(from, to) 的退化那一形（叉积为零）没量过");
      const dot = r(r(a.x * b.x) + r(a.y * b.y)) + r(a.z * b.z);
      return axisAngle(r(cx / len), r(cy / len), r(cz / len), r(Math.acos(Math.max(-1, Math.min(1, dot)))));
    }
    const axis = asVec3(args[0] as Variant);
    if (axis !== null) return axisAngle(axis.x, axis.y, axis.z, num(args[1], "第二参"));
    throw new UnsupportedError("quaternion-arg", "Quaternion() 两参只量过 (Vector3, Vector3) 与 (Vector3, 角度)");
  }
  if (args.length !== 4) throw new UnsupportedError("quaternion-arity", `Quaternion() 只量过 0、1、2、4 个实参（收到 ${args.length} 个）`);
  return quaternion(num(args[0], "第 1 参"), num(args[1], "第 2 参"), num(args[2], "第 3 参"), num(args[3], "第 4 参"));
}
export function toQuaternion(v: Variant): Variant {
  return v.t === Tag.OBJECT && v.v instanceof GQuaternion ? v : quaternionNew([v]);
}
export function quaternionText(v: GQuaternion): string {
  return `(${num6Text(v.x)}, ${num6Text(v.y)}, ${num6Text(v.z)}, ${num6Text(v.w)})`;
}
export function quaternionReadProp(v: GQuaternion, name: string): Variant | null {
  if (name === "x") return V.float(v.x);
  if (name === "y") return V.float(v.y);
  if (name === "z") return V.float(v.z);
  if (name === "w") return V.float(v.w);
  return null;
}
function len2(q: GQuaternion): number {
  let s = r(q.x * q.x);
  s = r(s + r(q.y * q.y));
  s = r(s + r(q.z * q.z));
  return r(s + r(q.w * q.w));
}
function same(v: Variant | undefined, name: string): GQuaternion {
  if (v !== undefined && v.t === Tag.OBJECT && v.v instanceof GQuaternion) return v.v as GQuaternion;
  throw new UnsupportedError("quaternion-arg-type", `Quaternion.${name}() 的实参只量过 Quaternion`);
}
function vec3(v: Variant | undefined, name: string): [number, number, number] {
  const p = v === undefined ? null : asVec3(v);
  if (p === null) throw new UnsupportedError("quaternion-arg-type", `Quaternion.${name}() 的实参只量过 Vector3`);
  return [p.x, p.y, p.z];
}
type EulerHook = (x: number, y: number, z: number, w: number) => [number, number, number];
let EULER_HOOK: EulerHook | null = null;

export function registerQuaternionEulerHook(fn: EulerHook): void {
  EULER_HOOK = fn;
}

type FromEulerHook = (e: Variant) => Variant;
let FROM_EULER_HOOK: FromEulerHook | null = null;

export function registerQuaternionFromEulerHook(fn: FromEulerHook): void {
  FROM_EULER_HOOK = fn;
}

export function quaternionStatic(name: string, args: Variant[]): Variant {
  if (name === "from_euler") {
    if (FROM_EULER_HOOK === null) throw new UnsupportedError("quaternion-static", "Quaternion.from_euler() 的钩子未注册");
    return FROM_EULER_HOOK(args[0] as Variant);
  }
  throw new UnsupportedError("quaternion-static", `Quaternion.${name}() 这一支没量过`);
}

function qmul(a: GQuaternion, b: GQuaternion): GQuaternion {
  return new GQuaternion(
    r(r(r(a.w * b.x) + r(a.x * b.w)) + r(r(a.y * b.z) - r(a.z * b.y))),
    r(r(r(a.w * b.y) - r(a.x * b.z)) + r(r(a.y * b.w) + r(a.z * b.x))),
    r(r(r(a.w * b.z) + r(a.x * b.y)) - r(r(a.y * b.x) - r(a.z * b.w))),
    r(r(r(a.w * b.w) - r(a.x * b.x)) - r(r(a.y * b.y) + r(a.z * b.z))),
  );
}

function qinv(a: GQuaternion): GQuaternion {
  return new GQuaternion(r(-a.x), r(-a.y), r(-a.z), a.w);
}

function qlog(a: GQuaternion): GQuaternion {
  const vlen = r(Math.sqrt(r(r(a.x * a.x) + r(a.y * a.y)) + r(a.z * a.z)));
  if (vlen === 0) return new GQuaternion(0, 0, 0, 0);
  const s = r(Math.sqrt(r(1 - r(a.w * a.w))));
  const k = r(r(2 * Math.acos(Math.max(-1, Math.min(1, a.w)))) / s);
  return new GQuaternion(r(a.x * k), r(a.y * k), r(a.z * k), 0);
}

function qexp(a: GQuaternion): GQuaternion {
  const vlen = r(Math.sqrt(r(r(a.x * a.x) + r(a.y * a.y)) + r(a.z * a.z)));
  if (vlen === 0) return new GQuaternion(0, 0, 0, 1);
  const half = r(vlen / 2);
  const k = r(Math.sin(half) / vlen);
  return new GQuaternion(r(a.x * k), r(a.y * k), r(a.z * k), r(Math.cos(half)));
}

function cubic(a: number, b: number, pre: number, post: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (a * 2 + (-pre + b) * t + (2 * pre - 5 * a + 4 * b - post) * t2 + (-pre + 3 * a - 3 * b + post) * t3);
}

function cubicInTime(a: number, b: number, pre: number, post: number, t: number, bt: number, pret: number, postt: number): number {
  const tt = t * bt;
  const a1 = pre + (a - pre) * (pret === 0 ? 0 : (tt - pret) / -pret);
  const a2 = a + (b - a) * (bt === 0 ? 0.5 : tt / bt);
  const a3 = b + (post - b) * (postt - bt === 0 ? 1 : (tt - bt) / (postt - bt));
  const b1 = a1 + (a2 - a1) * (bt - pret === 0 ? 0 : (tt - pret) / (bt - pret));
  const b2 = a2 + (a3 - a2) * (postt === 0 ? 1 : tt / postt);
  return b1 + (b2 - b1) * (bt === 0 ? 0.5 : tt / bt);
}

function slerpQ(a: GQuaternion, b: GQuaternion, t: number): GQuaternion {
  let bx = b.x;
  let by = b.y;
  let bz = b.z;
  let bw = b.w;
  let d = r(r(r(a.x * bx) + r(a.y * by)) + r(r(a.z * bz) + r(a.w * bw)));
  if (d < 0) {
    bx = r(-bx);
    by = r(-by);
    bz = r(-bz);
    bw = r(-bw);
    d = r(-d);
  }
  if (d > 0.9995) {
    const x = r(a.x + r(t * r(bx - a.x)));
    const y = r(a.y + r(t * r(by - a.y)));
    const z = r(a.z + r(t * r(bz - a.z)));
    const w = r(a.w + r(t * r(bw - a.w)));
    const l = r(Math.sqrt(r(r(x * x) + r(y * y)) + r(r(z * z) + r(w * w))));
    return new GQuaternion(x / l, y / l, z / l, w / l);
  }
  const theta = Math.acos(d);
  const sin = Math.sin(theta);
  const ka = r(Math.sin(r(r(1 - t) * theta)) / sin);
  const kb = r(Math.sin(r(t * theta)) / sin);
  return new GQuaternion(r(r(ka * a.x) + r(kb * bx)), r(r(ka * a.y) + r(kb * by)), r(r(ka * a.z) + r(kb * bz)), r(r(ka * a.w) + r(kb * bw)));
}

export function quaternionMethod(inner: GQuaternion, name: string, args: Variant[]): Variant {
  switch (name) {
    case "length_squared":
      return V.float(len2(inner));
    case "length":
      return V.float(r(Math.sqrt(len2(inner))));
    case "normalized": {
      const l = r(Math.sqrt(len2(inner)));
      if (l === 0) throw new UnsupportedError("quaternion-normalized-zero", "Quaternion().normalized() 长度为零那一形没量过");
      const k = r(1 / l);
      return quaternion(r(inner.x * k), r(inner.y * k), r(inner.z * k), r(inner.w * k));
    }
    case "dot": {
      const o = same(args[0], "dot");
      let d = r(inner.x * o.x);
      d = r(d + r(inner.y * o.y));
      d = r(d + r(inner.z * o.z));
      return V.float(r(d + r(inner.w * o.w)));
    }
    case "get_angle": {
      if (inner.w > 1 || inner.w < -1) throw new UnsupportedError("quaternion-angle-range", "get_angle() 的 w 越界那一形没量过");
      return V.float(r(2 * Math.acos(inner.w)));
    }
    case "get_axis": {
      if (inner.w > 1 || inner.w < -1) throw new UnsupportedError("quaternion-axis-range", "get_axis() 的 w 越界那一形没量过");
      const s = Math.sqrt(Math.max(0, 1 - inner.w * inner.w));
      if (s < 0.00001) return vector3(0, 0, 1);
      return vector3(inner.x / s, inner.y / s, inner.z / s);
    }
    case "is_normalized":
      return V.bool(Math.abs(len2(inner) - 1) < 1e-5);
    case "is_finite":
      return V.bool(Number.isFinite(inner.x) && Number.isFinite(inner.y) && Number.isFinite(inner.z) && Number.isFinite(inner.w));
    case "get_euler": {
      if (EULER_HOOK === null) throw new UnsupportedError("quaternion-euler", "Quaternion.get_euler() 的钩子未注册");
      const e = EULER_HOOK(inner.x, inner.y, inner.z, inner.w);
      return vector3(e[0], e[1], e[2]);
    }
    case "exp": {
      const vlen = r(Math.sqrt(r(r(inner.x * inner.x) + r(inner.y * inner.y)) + r(inner.z * inner.z)));
      if (vlen === 0) return quaternion(0, 0, 0, 1);
      const half = r(vlen / 2);
      const k = r(Math.sin(half) / vlen);
      return quaternion(r(inner.x * k), r(inner.y * k), r(inner.z * k), r(Math.cos(half)));
    }
    case "log": {
      const vlen = r(Math.sqrt(r(r(inner.x * inner.x) + r(inner.y * inner.y)) + r(inner.z * inner.z)));
      if (vlen === 0) return quaternion(0, 0, 0, 0);
      const s = r(Math.sqrt(r(1 - r(inner.w * inner.w))));
      if (s === 0) throw new UnsupportedError("quaternion-log", "Quaternion.log() 的 w=±1 那一形没量过");
      const k = r(r(2 * Math.acos(Math.max(-1, Math.min(1, inner.w)))) / s);
      return quaternion(r(inner.x * k), r(inner.y * k), r(inner.z * k), 0);
    }
    case "spherical_cubic_interpolate":
    case "spherical_cubic_interpolate_in_time": {
      const b = same(args[0], name);
      const preIn = same(args[1], name);
      const postIn = same(args[2], name);
      const w = args[3];
      if (w === undefined) throw new UnsupportedError("quaternion-arity", `${name}() 少了权重`);
      const inTime = name.endsWith("in_time");
      const bt = inTime ? r(Number((args[4] as Variant).v)) : 0;
      const pret = inTime ? r(Number((args[5] as Variant).v)) : 0;
      const postt = inTime ? r(Number((args[6] as Variant).v)) : 0;
      const t = r(Number(w.v));
      const from = inner;
      let pre: GQuaternion = preIn;
      let to: GQuaternion = b;
      let post: GQuaternion = postIn;
      const dot = (x: GQuaternion, y: GQuaternion): number => r(r(r(x.x * y.x) + r(x.y * y.y)) + r(r(x.z * y.z) + r(x.w * y.w)));
      if (dot(from, pre) < 0) pre = new GQuaternion(-pre.x, -pre.y, -pre.z, -pre.w);
      const flip2 = dot(from, to) < 0;
      if (flip2) to = new GQuaternion(-to.x, -to.y, -to.z, -to.w);
      const postDot = dot(to, post);
      if (flip2 ? postDot <= 0 : postDot < 0) post = new GQuaternion(-post.x, -post.y, -post.z, -post.w);
      const calc = (base: GQuaternion, target: GQuaternion): GQuaternion => {
        const lf = new GQuaternion(0, 0, 0, 0);
        const lt = qlog(qmul(qinv(base), target));
        const lp = qlog(qmul(qinv(base), pre));
        const lq = qlog(qmul(qinv(base), post));
        const f = inTime ? cubicInTime : cubic;
        const ln = new GQuaternion(
          f(lf.x, lt.x, lp.x, lq.x, t, bt, pret, postt),
          f(lf.y, lt.y, lp.y, lq.y, t, bt, pret, postt),
          f(lf.z, lt.z, lp.z, lq.z, t, bt, pret, postt),
          0,
        );
        return qmul(base, qexp(ln));
      };
      const q1 = calc(from, to);
      const lf2 = qlog(qmul(qinv(to), from));
      const zero = new GQuaternion(0, 0, 0, 0);
      const lp2 = qlog(qmul(qinv(to), pre));
      const lq2 = qlog(qmul(qinv(to), post));
      const f = inTime ? cubicInTime : cubic;
      const ln2 = new GQuaternion(
        f(lf2.x, zero.x, lp2.x, lq2.x, t, bt, pret, postt),
        f(lf2.y, zero.y, lp2.y, lq2.y, t, bt, pret, postt),
        f(lf2.z, zero.z, lp2.z, lq2.z, t, bt, pret, postt),
        0,
      );
      const q2 = qmul(to, qexp(ln2));
      return V.object(slerpQ(q1, q2, t));
    }
    case "angle_to": {
      const o = same(args[0], "angle_to");
      let d = r(inner.x * o.x);
      d = r(d + r(inner.y * o.y));
      d = r(d + r(inner.z * o.z));
      d = r(d + r(inner.w * o.w));
      const k = Math.max(-1, Math.min(1, r(r(2 * d * d) - 1)));
      return V.float(r(Math.acos(k)));
    }
    case "slerp":
    case "slerpni": {
      const o = same(args[0], name);
      const t = args[1];
      if (t === undefined || (t.t !== Tag.INT && t.t !== Tag.FLOAT)) throw new UnsupportedError("quaternion-arg-type", `${name}() 的权重只量过数`);
      let w = r(Number(t.v));
      let ox = o.x;
      let oy = o.y;
      let oz = o.z;
      let ow = o.w;
      if (name === "slerp") {
        let d = r(r(r(inner.x * ox) + r(inner.y * oy)) + r(r(inner.z * oz) + r(inner.w * ow)));
        if (d < 0) {
          ox = r(-ox);
          oy = r(-oy);
          oz = r(-oz);
          ow = r(-ow);
          d = r(-d);
        }
        if (d > 0.9995) {
          const nx = r(inner.x + r(w * r(ox - inner.x)));
          const ny = r(inner.y + r(w * r(oy - inner.y)));
          const nz = r(inner.z + r(w * r(oz - inner.z)));
          const nw = r(inner.w + r(w * r(ow - inner.w)));
          const l = r(Math.sqrt(r(r(nx * nx) + r(ny * ny)) + r(r(nz * nz) + r(nw * nw))));
          return quaternion(nx / l, ny / l, nz / l, nw / l);
        }
        const theta = Math.acos(d);
        const sin = Math.sin(theta);
        const a = r(Math.sin(r(r(1 - w) * theta)) / sin);
        const b = r(Math.sin(r(w * theta)) / sin);
        return quaternion(r(r(a * inner.x) + r(b * ox)), r(r(a * inner.y) + r(b * oy)), r(r(a * inner.z) + r(b * oz)), r(r(a * inner.w) + r(b * ow)));
      }
      const d = r(r(r(inner.x * ox) + r(inner.y * oy)) + r(r(inner.z * oz) + r(inner.w * ow)));
      if (d > 0.9995) {
        const nx = r(inner.x + r(w * r(ox - inner.x)));
        const ny = r(inner.y + r(w * r(oy - inner.y)));
        const nz = r(inner.z + r(w * r(oz - inner.z)));
        const nw = r(inner.w + r(w * r(ow - inner.w)));
        const l = r(Math.sqrt(r(r(nx * nx) + r(ny * ny)) + r(r(nz * nz) + r(nw * nw))));
        return quaternion(nx / l, ny / l, nz / l, nw / l);
      }
      const theta = Math.acos(d);
      const sin = Math.sin(theta);
      const a = r(Math.sin(r(r(1 - w) * theta)) / sin);
      const b = r(Math.sin(r(w * theta)) / sin);
      return quaternion(r(r(a * inner.x) + r(b * ox)), r(r(a * inner.y) + r(b * oy)), r(r(a * inner.z) + r(b * oz)), r(r(a * inner.w) + r(b * ow)));
    }
    case "is_equal_approx": {
      const o = same(args[0], "is_equal_approx");
      return V.bool(inner.x === o.x && inner.y === o.y && inner.z === o.z && inner.w === o.w);
    }
    case "inverse": {
      if (len2(inner) !== 1) {
        throw new UnsupportedError("quaternion-inverse-band", "Quaternion.inverse() 只量过长度平方恰为 1 的那一形；引擎那句 must be normalized 走 stderr 且容差band没读，不发静默值");
      }
      return quaternion(r(-inner.x), r(-inner.y), r(-inner.z), inner.w);
    }
    default:
      throw new UnsupportedError("quaternion-method", `Quaternion.${name}() 这一支没量过（get_euler / exp / log / 静态 from_* 都只有一格读数，不足以定式子）`);
  }
}