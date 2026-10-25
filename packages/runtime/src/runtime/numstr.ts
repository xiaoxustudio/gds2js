import { wrap64 } from "./tags";
import { decimalToDouble } from "../shared/double";

export const INT64_MIN = BigInt("-9223372036854775808");
export const INT64_MAX = BigInt("9223372036854775807");
export const TWO_63 = 2 ** 63;

const HEX_LOWER = "0123456789abcdef";
const HEX_UPPER = "0123456789ABCDEF";

function hexAbs(v: number, digits: string): string {
  if (v === 0) return "0";
  let out = "";
  let n = v;
  while (n > 0) {
    out = digits.charAt(n % 16) + out;
    n = Math.floor(n / 16);
  }
  return out;
}

/** `v.toString(16)` 的等价：`0` → `"0"`、负数带符号（`-1` → `"-1"`），不补零。 */
export function hexLower(v: number): string {
  return v < 0 ? `-${hexAbs(-v, HEX_LOWER)}` : hexAbs(v, HEX_LOWER);
}

/** `v.toString(16).toUpperCase()` 的等价。 */
export function hexUpper(v: number): string {
  return v < 0 ? `-${hexAbs(-v, HEX_UPPER)}` : hexAbs(v, HEX_UPPER);
}

export function padZero2(s: string): string {
  return s.length >= 2 ? s : `0${s}`;
}

const DEC_SATURATE_AT = 10n ** 18n;

export function strToInt(s: string): bigint {
  let acc = 0n;
  let neg = false;
  let seenDigit = false;
  let sat = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]!;
    if (ch === ".") break;
    if (ch >= "0" && ch <= "9") {
      seenDigit = true;
      if (sat) continue;
      if (acc >= DEC_SATURATE_AT || acc <= -DEC_SATURATE_AT) {
        sat = true;
        continue;
      }
      acc = wrap64(acc * 10n + BigInt(ch.charCodeAt(0) - 48));
    } else if (ch === "-" && !seenDigit) {
      neg = !neg;
    }
  }
  if (sat) return neg ? INT64_MIN : INT64_MAX;
  return neg ? wrap64(-acc) : acc;
}

/** float(String)：取前导浮点数，取不到就是 0（`0x10` → 0.0、`abc` → 0.0）。 */
export function strToFloat(s: string): number {
  const m = /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d*)?/.exec(s);
  return m ? decimalToDouble(m[0]) : 0;
}
