/** 字符串→数值的解析：`int()` / `float()` / `String.to_int()` / `to_float()` 与 pack 的元素折算共用这两条式子。 */
import { wrap64 } from "./tags";
import { decimalToDouble } from "../shared/double";

export const INT64_MIN = BigInt("-9223372036854775808");
export const INT64_MAX = BigInt("9223372036854775807");
export const TWO_63 = 2 ** 63;

const HEX_LOWER = "0123456789abcdef";
const HEX_UPPER = "0123456789ABCDEF";

/** 整数的十六进制幅值：整数的 `toString(radix)` 在静态编译目标上没有 lowering。 */
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

/** `.padStart(2, "0")` 的等价（三个用点都在 0–255 这一档，长的原样返回）。 */
export function padZero2(s: string): string {
  return s.length >= 2 ? s : `0${s}`;
}

/** 十进制累加的饱和闸门，口径见 {@link strToInt}。 */
const DEC_SATURATE_AT = 10n ** 18n;

/**
 * `to_int()` / `int(字符串)` 的算式：单趟扫描，数字累加并按 int64 回绕；`-` 只在还没见过任何数字时翻符号
 * （可反复翻：`"a--5"`→5、`"5-3"`→53）；`.` 立刻停止；其余字符一律跳过且不断扫描。
 * 溢出是两段式的：19 位以内回绕，但乘 10 之前 `|acc|` 已达 `10^18` 就饱和到 INT64_MAX / INT64_MIN，
 * 且闸门看的是回绕之后的绝对值 —— 跟 `INT64_MAX/10` 那个「防溢出」常数不是一个数，别拿它当判据。
 * 符号是先攒无符号累加值、最后再取负，取负同样回绕。
 */
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
