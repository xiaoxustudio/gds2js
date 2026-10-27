import { strHumanizeSize, strNumDecimals, strSci, wrapUnsigned64 } from "./numfmt";
import { strReplace, stringChr, valueTypeName } from "./string-ops";
import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, intToBig, intToNum, int64ParamBig, type IntPayload, type Variant } from "./tags";
import { GVector2 } from "./vector2";
import { GVector3 } from "./vector3";
import { GVector4 } from "./vector4";
import { GVector2i } from "./vector2i";
import { GVector3i } from "./vector3i";
import { GVector4i } from "./vector4i";
import { asNodePath, emptyNodePath, nodePathValue } from "./node-path";
import { scriptPropsHook } from "./values-print";
import { GArray, GDict, show, truthyOf } from "./values-core";

export function strFormatV(text: string, v: Variant, ph: string): string {
  const items: Array<[string, Variant]> = [];
  if (v.t === Tag.ARRAY) {
    const raw = (v.v as GArray).raw();
    for (let j = 0; j < raw.length; j++) {
      const el = raw[j] as Variant;
      if (el.t === Tag.ARRAY) {
        const pair = (el.v as GArray).raw();
        if (pair.length !== 2) continue;
        items.push([show(pair[0] as Variant), pair[1] as Variant]);
      } else {
        items.push([String(j), el]);
      }
    }
  } else if (v.t === Tag.DICT) {
    const d = v.v as GDict;
    const keys = d.keys();
    const vals = d.values();
    for (let j = 0; j < keys.length; j++) items.push([show(keys[j] as Variant), vals[j] as Variant]);
  } else if (v.t === Tag.OBJECT) {
    const face = scriptPropsHook === null ? null : scriptPropsHook(v.v as object);
    if (face === null) return text;
    if (face.unmodeledBase !== null) {
      throw new UnsupportedError("format-object", `String.format() 的实参是挂在 ${face.unmodeledBase} 上的脚本实例：引擎那一侧的属性表没量过，不猜`);
    }
    const scriptKey = ph.split("_").join("script");
    if (scriptKey !== "" && text.indexOf(scriptKey) >= 0) {
      throw new UnsupportedError("format-object", `String.format() 撞上 ${scriptKey}：引擎那一格打的是 ():<GDScript#一个进程内的号>，复现不了`);
    }
    let objOut = text;
    for (const p of face.props) {
      const key = ph.split("_").join(p.name);
      if (key === "") continue;
      objOut = strReplace(objOut, key, show(p.value));
    }
    return objOut;
  } else {
    return text;
  }
  const hasMark = ph.indexOf("_") >= 0;
  let out = text;
  for (const [key, val] of items) {
    const valText = show(val);
    if (hasMark) out = strReplace(out, ph.split("_").join(key), valText);
    else if (ph !== "") {
      const at = out.indexOf(ph);
      if (at >= 0) out = out.slice(0, at) + valText + out.slice(at + ph.length);
    }
  }
  return out;
}

const TWO_63_B = 9223372036854775808;

const FMT_TYPES = new Set(["d", "o", "x", "X", "c", "s", "f", "v"]);

const FMT_ERR = {
  unsupported: "unsupported format character in operator '%'.",
  incomplete: "incomplete format in operator '%'.",
  number: "a number is required in operator '%'.",
  char: "%c requires number or single-character string in operator '%'.",
  lower: "unsigned integer is lower than minimum in operator '%'.",
  upper: "unsigned integer is greater than maximum in operator '%'.",
  vector: "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator '%'.",
  star: "* wants number or vector in operator '%'.",
  notAll: "not all arguments converted during string formatting in operator '%'.",
  notEnough: "not enough arguments for format string in operator '%'.",
};

interface FmtSpec {
  flags: string;
  width: number;
  prec: number | null;
  type: string;
  text: string;
  widthStars: number;
  precStars: number;
}

type FmtTok = { lit: string } | { spec: FmtSpec };

function padFmt(body: string, sign: string, sp: FmtSpec): string {
  const left = sp.flags.includes("-");
  const zero = !left && sp.flags.includes("0");
  if (zero && sp.width > 0) return sign + body.padStart(sp.width - sign.length, "0");
  const raw = sign + body;
  if (raw.length >= sp.width) return raw;
  return left ? raw.padEnd(sp.width) : raw.padStart(sp.width);
}

function fmtNum(a: Variant, sp: FmtSpec): number {
  if (a.t === Tag.INT) return intToNum(a.v as IntPayload);
  if (a.t === Tag.FLOAT) return a.v as number;
  throw new GodotRuntimeError("format-number", FMT_ERR.number);
}

/** `%d %x %X %o` 共用的截断：float 走 `(int64)trunc(v)`，越界给 -9223372036854775808 那一格（w04–w06）。 */
function fmtTruncMag(a: Variant, sp: FmtSpec): { neg: boolean; mag: bigint } {
  if (a.t === Tag.INT) {
    const p = intToBig(a.v as IntPayload);
    return { neg: p < 0n, mag: p < 0n ? -p : p };
  }
  const v = fmtNum(a, sp);
  const t = Number.isFinite(v) ? Math.trunc(v) : Number.NaN;
  const inRange = Number.isFinite(t) && t >= -TWO_63_B && t < TWO_63_B;
  if (!inRange) return { neg: true, mag: 2n ** 63n };
  const b = BigInt(t);
  return { neg: b < 0n, mag: b < 0n ? -b : b };
}

function fmtVecComps(a: Variant): number[] | null {
  if (a.t !== Tag.OBJECT) return null;
  const o = a.v as object;
  if (o instanceof GVector2) return [o.x, o.y];
  if (o instanceof GVector2i) return [o.x, o.y];
  if (o instanceof GVector3) return [o.x, o.y, o.z];
  if (o instanceof GVector3i) return [o.x, o.y, o.z];
  if (o instanceof GVector4) return [o.x, o.y, o.z, o.w];
  if (o instanceof GVector4i) return [o.x, o.y, o.z, o.w];
  return null;
}

/** 向量的每一支按 `%f` 的默认精度印（实测 `(1.000000, 2.000000)`，`%.2v` 给 `(1.00, 2.00)`，INF / NAN 给 `inf` / `nan`）。 */
function fmtVecPart(v: number, prec: number | null): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? "nan" : v < 0 ? "-inf" : "inf";
  return (Object.is(v, -0) || v < 0 ? "-" : "") + Math.abs(v).toFixed(prec ?? 6);
}

export function strFormat(fmt: string, args: Variant[]): string {
  const toks: FmtTok[] = [];
  let lit = "";
  let specs = 0;
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== "%") {
      lit += fmt[i];
      continue;
    }
    let k = i + 1;
    let flags = "";
    while (k < fmt.length && (fmt[k] === "-" || fmt[k] === "+" || fmt[k] === "0" || fmt[k] === "u")) {
      flags += fmt[k];
      k++;
    }
    if (fmt[k] === "%") {
      lit += "%";
      i = k;
      continue;
    }
    let width = 0;
    let widthStars = 0;
    if (fmt[k] === "*") {
      widthStars = 1;
      k++;
      while (fmt[k] === "*") {
        widthStars++;
        k++;
      }
    } else {
      while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
        width = width * 10 + (fmt[k]!.charCodeAt(0) - 48);
        k++;
      }
    }
    let prec: number | null = null;
    let precStars = 0;
    if (fmt[k] === ".") {
      k++;
      if (fmt[k] === "*") {
        precStars = 1;
        k++;
        while (fmt[k] === "*") {
          precStars++;
          k++;
        }
      } else {
        prec = 0;
        while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
          prec = prec * 10 + (fmt[k]!.charCodeAt(0) - 48);
          k++;
        }
      }
    }
    const t = fmt[k];
    if (t === undefined) throw new GodotRuntimeError("format-spec", FMT_ERR.incomplete);
    if (!FMT_TYPES.has(t)) throw new GodotRuntimeError("format-spec", FMT_ERR.unsupported);
    toks.push({ lit });
    lit = "";
    toks.push({ spec: { flags, width, prec, type: t, text: fmt.slice(i, k + 1), widthStars, precStars } });
    specs += 1 + widthStars + precStars;
    i = k;
  }
  toks.push({ lit });

  let ai = 0;
  let out = "";
  for (const tk of toks) {
    if ("lit" in tk) {
      out += tk.lit;
      continue;
    }
    const spec = tk.spec;
    let sp = spec;
    if (spec.widthStars + spec.precStars > 0) {
      let width = spec.width;
      let prec = spec.prec;
      for (let s = 0; s < spec.widthStars; s++) {
        if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
        width = fmtStar(args[ai++]!);
      }
      for (let s = 0; s < spec.precStars; s++) {
        if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
        prec = fmtStar(args[ai++]!);
      }
      sp = { ...spec, width, prec };
    }
    if (ai >= args.length) throw new GodotRuntimeError("format-arity", FMT_ERR.notEnough);
    const a = args[ai++]!;
    switch (sp.type) {
      case "s":
        out += padFmt(show(a), "", sp);
        break;
      case "d": {
        const { neg, mag } = fmtTruncMag(a, sp);
        out += padFmt(mag.toString(10), neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "f": {
        const v = fmtNum(a, sp);
        if (!Number.isFinite(v)) {
          const words = sp.flags.replace("0", "");
          const body = Number.isNaN(v) ? "nan" : "inf";
          const sign = Number.isNaN(v) ? "" : v < 0 ? "-" : sp.flags.includes("+") ? "+" : "";
          out += padFmt(body, sign, { ...sp, flags: words });
          break;
        }
        const body = Math.abs(v).toFixed(sp.prec ?? 6);
        const neg = Object.is(v, -0) || v < 0;
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "x":
      case "X":
      case "o": {
        const { neg, mag } = fmtTruncMag(a, sp);
        const base = sp.type === "o" ? 8 : 16;
        const body = sp.type === "X" ? mag.toString(base).toUpperCase() : mag.toString(base);
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "c": {
        if (a.t === Tag.STRING) {
          const s = a.v as string;
          if (s.length !== 1) throw new GodotRuntimeError("format-char", FMT_ERR.char);
          out += padFmt(s, "", sp);
          break;
        }
        if (a.t !== Tag.INT && a.t !== Tag.FLOAT) throw new GodotRuntimeError("format-char", FMT_ERR.char);
        const cp = a.t === Tag.INT ? intToBig(a.v as IntPayload) : fmtStarCodepoint(a.v as number);
        if (cp < 0n) throw new GodotRuntimeError("format-char", FMT_ERR.lower);
        if (cp > 1114111n) throw new GodotRuntimeError("format-char", FMT_ERR.upper);
        out += padFmt(String.fromCodePoint(Number(cp)), "", sp);
        break;
      }
      case "v": {
        const comps = fmtVecComps(a);
        if (comps === null) throw new GodotRuntimeError("format-vector", FMT_ERR.vector);
        const body = comps.map((c) => padFmt(fmtVecPart(c, sp.prec), "", sp)).join(", ");
        out += "(" + body + ")";
        break;
      }
    }
  }
  if (args.length > specs) throw new GodotRuntimeError("format-arity", FMT_ERR.notAll);
  return out;
}

/** `%` 那一路的格式化：运行期失败时引擎**不中断脚本** —— 推一块 ERROR，把格式串原样回出去
 *  （实测 `tmp/d6/s491c.py` 二十格 + `tmp/d6/s491e.py` 十二格：`"%d" % "ab"` 回 `"%d"`、`"ab" % 1` 回 `"ab"`、
 *  `"%s%s" % "ab"` 回 `"%s%s"`）。那句与解析期同文，只少了 ` in operator '%'.` 那截尾巴。 */
export function strFormatSoft(fmt: string, args: Variant[]): { text: string; fail: string | null } {
  try {
    return { text: strFormat(fmt, args), fail: null };
  } catch (err) {
    if (!(err instanceof GodotRuntimeError) || !err.code.startsWith("format-")) throw err;
    return { text: fmt, fail: err.message.replace(" in operator '%'.", ".") };
  }
}

function fmtStarCodepoint(v: number): bigint {
  if (!Number.isFinite(v)) return -(2n ** 63n);
  const t = Math.trunc(v);
  return t >= -TWO_63_B && t < TWO_63_B ? BigInt(t) : -(2n ** 63n);
}

function fmtStar(a: Variant): number {
  if (a.t === Tag.INT || a.t === Tag.FLOAT) {
    const p = a.t === Tag.INT ? intToBig(a.v as IntPayload) : BigInt(fmtStarCodepoint(a.v as number));
    return p > 0n && p <= 10000000n ? Number(p) : 0;
  }
  if (fmtVecComps(a) === null) throw new GodotRuntimeError("format-star", FMT_ERR.star);
  return 0;
}

function numInBase(n: bigint, base: number, cap: boolean, unsigned: boolean): string {
  if (!Number.isInteger(base) || base < 2 || base > 36) return "";
  const B = BigInt(base);
  const sign = !unsigned && n < 0n;
  let chars = 0;
  let m = n;
  do {
    m = m / B;
    chars++;
  } while (m !== 0n);
  if (sign) chars++;
  const out: string[] = new Array(chars);
  let i = chars;
  m = n;
  do {
    const mod = m % B;
    const d = mod < 0n ? -mod : mod;
    i--;
    out[i] = d >= 10n ? String.fromCharCode((cap ? 65 : 97) + Number(d) - 10) : String.fromCharCode(48 + Number(d));
    m = m / B;
  } while (m !== 0n);
  if (sign) out[0] = "-";
  return out.join("");
}

export function stringStatic(name: string, args: Variant[] = []): Variant {
  switch (name) {
    case "chr": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.chr() 缺少参数");
      return stringChr(V.int(Number(BigInt.asIntN(32, int64ParamBig(v, "String.chr() 的实参")))));
    }
    case "num": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num() 缺少参数");
      const d = args[1] === undefined ? -1 : Number(BigInt.asIntN(32, int64ParamBig(args[1], "String.num() 的 decimals")));
      if (v.t === Tag.FLOAT) return V.str(strNumDecimals(v.v as number, d));
      if (v.t === Tag.INT) return V.str(strNumDecimals(intToNum(v.v as IntPayload), d));
      if (v.t === Tag.BOOL) return V.str(strNumDecimals(v.v ? 1 : 0, d));
      throw new GodotRuntimeError("string-arg", `String.num() 不接受 ${tagName(v.t)}`);
    }
    case "num_int64":
    case "num_uint64": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", `String.${name}() 缺少参数`);
      const n0 = int64ParamBig(v, `String.${name}() 的参数`);
      const base = args[1] === undefined ? 10 : Number(int64ParamBig(args[1], `String.${name}() 的 base`));
      const cap = args[2] === undefined ? false : truthyOf(args[2]);
      const n = name === "num_uint64" ? wrapUnsigned64(n0) : n0;
      return V.str(numInBase(n, base, cap, name === "num_uint64"));
    }
    case "num_scientific": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num_scientific() 缺少参数");
      if (v.t === Tag.FLOAT) return V.str(strSci(v.v as number));
      if (v.t === Tag.INT) return V.str(strSci(intToNum(v.v as IntPayload)));
      if (v.t === Tag.BOOL) return V.str(strSci(v.v ? 1 : 0));
      throw new GodotRuntimeError("string-arg", `String.num_scientific() 不接受 ${tagName(v.t)}`);
    }
    case "humanize_size": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.humanize_size() 缺少参数");
      return strHumanizeSize(v);
    }
    default:
      throw new UnsupportedError(
        "string-static",
        `String.${name} 未实现（实测存在的静态成员是 chr/num/num_int64/num_scientific/humanize_size；num_float 这类 Godot 根本没有）`,
      );
  }
}

/** `str(a, b, c…)`：每个实参按 print 那套渲染，然后**无分隔拼起来**。 */
export function strBuiltin(args: Variant[]): Variant {
  return V.str(args.map((v) => show(v)).join(""));
}

export function nodePathCtor(args: Variant[]): Variant {
  if (args.length === 0) return emptyNodePath();
  if (args.length === 1) {
    const v = args[0] as Variant;
    if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return nodePathValue(v.v as string);
    if (asNodePath(v) !== null) return v;
  }
  throw new GodotRuntimeError(
    "node-path-ctor",
    `No constructor of "NodePath" matches the signature "NodePath(${args.map((a) => valueTypeName(a)).join(", ")})".`,
  );
}

export function toStringNameSlot(v: Variant): Variant {
  if (v.t === Tag.STRING_NAME) return v;
  if (v.t === Tag.STRING) return V.stringName(v.v as string);
  throw new UnsupportedError("string-name-slot", `StringName 槽只收 StringName / String，收到 ${tagName(v.t)}`);
}

export function strJoin(sep: string, g: GArray): string {
  const items = g.raw();
  let out = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) out += sep;
    out += show(items[i] as Variant);
  }
  return out;
}
