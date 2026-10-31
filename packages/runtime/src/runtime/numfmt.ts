import { Tag, V, intToNum, int64ParamBig, type IntPayload, type Variant } from "./tags";

export function numVal(v: Variant): number {
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

export function digits17(n: number): string {
  let b = BigInt(n);
  const neg = b < 0n;
  if (neg) b = -b;
  const s = String(b);
  if (s.length <= 17) return neg ? `-${s}` : s;
  const tail = s.length - 17;
  const pow = 10n ** BigInt(tail);
  let q = b / pow;
  const r = b - q * pow;
  if (r * 2n >= pow) q = q + 1n;
  return `${neg ? "-" : ""}${String(q)}${"0".repeat(tail)}`;
}

export function strFloat(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0.0";
  if (Number.isInteger(n)) return `${n >= -(2 ** 63) && n < 2 ** 63 ? String(BigInt(n)) : digits17(n)}.0`;
  const intDigits = Math.max(0, Math.floor(Math.log10(Math.abs(n))) + 1);
  const decimals = Math.max(0, Math.min(14, 15 - intDigits));
  if (decimals === 0) {
    const r = Math.sign(n) * Math.round(Math.abs(n));
    return BigInt(r).toString();
  }
  const trimmed = n.toFixed(decimals).replace(/0+$/, "");
  return trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
}

export function strNum(n: number): string {
  return Object.is(n, -0) ? "-0.0" : strFloat(n);
}

export function strSci(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a < 1e15 && a >= 1e-4) return String(n);
  const m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(n.toExponential());
  return m ? `${m[1]}e${m[2]}${m[3]!.padStart(2, "0")}` : n.toExponential();
}

export const SIZE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

export function strHumanizeSize(v: Variant): Variant {
  const signed = int64ParamBig(v, "String.humanize_size() 的参数");
  const u = signed & ((1n << 64n) - 1n);
  if (u === 0n) return V.str("0 B");
  let value = Number(u);
  let cat = 0;
  while (value > 1024) {
    value /= 1024;
    cat++;
  }
  const unit = SIZE_UNITS[cat] ?? SIZE_UNITS[SIZE_UNITS.length - 1]!;
  if (cat === 0) return V.str(`${u.toString()} B`);
  const digits = value < 100 ? 2 : value < 1024 ? 1 : 0;
  const scale = 10 ** digits;
  const trunc = Math.trunc(value * scale) / scale;
  return V.str(digits === 0 ? `${Math.trunc(value)} ${unit}` : `${trunc.toFixed(digits)} ${unit}`);
}

export function wrapUnsigned64(n: bigint): bigint {
  return n & ((1n << 64n) - 1n);
}

export function scaledRound64(a: number, k: number): bigint {
  const dv = new DataView(new ArrayBuffer(8));
  dv.setFloat64(0, a, true);
  const bits = dv.getBigUint64(0, true);
  const expBits = Number((bits >> 52n) & 0x7ffn);
  const mant = bits & ((1n << 52n) - 1n);
  const m = expBits === 0 ? mant : mant | (1n << 52n);
  const e = BigInt(expBits === 0 ? -1074 : expBits - 1075);
  const ten = 10n ** BigInt(k);
  if (e >= 0n) return m * 2n ** e * ten;
  const num = m * ten;
  const den = 2n ** -e;
  const q = num / den;
  const rem = num - q * den;
  return rem * 2n >= den ? q + 1n : q;
}

export function sigDigitCap(a: number): number {
  const probe = scaledRound64(a, 30).toString().padStart(31, "0");
  const intPart = probe.slice(0, probe.length - 30).replace(/^0+/, "");
  if (intPart !== "") return 17 - intPart.length;
  const frac = probe.slice(probe.length - 30);
  let z = 0;
  while (z < frac.length && frac[z] === "0") z++;
  return 17 + z;
}

export function renderAt(n: bigint, k: number, p: number): string {
  const ten = 10n ** BigInt(k);
  const q = 10n ** BigInt(p);
  const v = n * q;
  const mag = (v % ten) * 2n >= ten ? v / ten + 1n : v / ten;
  const s = mag.toString().padStart(p + 1, "0");
  return p === 0 ? s : `${s.slice(0, s.length - p)}.${s.slice(s.length - p)}`;
}

export function strNumDecimals(x: number, decimals: number): string {
  if (Number.isNaN(x)) return "nan";
  if (!Number.isFinite(x)) return x < 0 ? "-inf" : "inf";
  let p = decimals;
  if (p < 0) {
    p = 14;
    const a = Math.abs(x);
    if (a > 10) p -= Math.floor(Math.log10(a));
  }
  if (p > 32) p = 32;
  if (p < 0) p = 6;
  const a = Math.abs(x);
  const cap = a === 0 ? p : sigDigitCap(a);
  let n: bigint;
  let k: number;
  if (cap >= 0) {
    n = scaledRound64(a, cap);
    k = cap;
  } else {
    const unit = 10n ** BigInt(-cap);
    const q = scaledRound64(a, 0);
    const t = (q % unit) * 2n >= unit ? q / unit + 1n : q / unit;
    n = t * unit;
    k = 0;
  }
  const body = renderAt(n, k, p);
  const sign = x < 0 || Object.is(x, -0) ? "-" : "";
  if (body.length + sign.length > 324) return "";
  return `${sign}${stripTrailingZeros(body)}`;
}

export function stripTrailingZeros(src: string): string {
  if (!src.includes(".")) return src;
  const chars = src.split("");
  let i = chars.length - 1;
  while (i > 0) {
    if (chars[i] === "0") chars[i] = "\0";
    else if (chars[i] === ".") {
      chars[i + 1] = "0";
      break;
    } else break;
    i--;
  }
  return chars.join("").split("\0")[0]!;
}

export function strVec2(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (Number.isInteger(n)) return strFloat(n);
  const magnitude = Math.trunc(Math.fround(Math.log10(Math.abs(n))));
  const decimals = Math.max(0, Math.min(6, 6 - magnitude));
  if (decimals === 0) return n.toFixed(0);
  const t = n.toFixed(decimals).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/** 引擎给 Plane.D 与 Quaternion 分量的那一形：六位小数、去尾零（`2` / `0.707107`）。 */
export function num6Text(n: number): string {
  if (!Number.isFinite(n)) return strVec2(n);
  if (Number.isInteger(n)) return String(n);
  const s = n.toFixed(6).replace(/0+$/, "");
  return s.endsWith(".") ? s + "0" : s;
}
