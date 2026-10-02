/**
 * 字符串→数值的解析（int() / float() / String.to_int() / to_float() 共用的那两条实测式子）。
 * 住在独立的叶子模块是因为 packed.ts 的元素折算也要复用它们（S177 ④：数值 pack 收 String 走前导数解析），
 * 而 builtins.ts 已经 import packed.ts —— 两边都从这一份取，式子只有一处，不会出现「同一个语义两个实现」。
 */
import { wrap64 } from "./tags";
import { decimalToDouble } from "../lower/double";

export const INT64_MIN = BigInt("-9223372036854775808");
export const INT64_MAX = BigInt("9223372036854775807");
export const TWO_63 = 2 ** 63;

const HEX_LOWER = "0123456789abcdef";
const HEX_UPPER = "0123456789ABCDEF";

/** 整数的十六进制幅值：整数的 `toString(radix)` 在静态编译目标上没有 lowering（实测 scriptc）。 */
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

/** 十进制累加的饱和闸门，见 {@link strToInt} 的实测说明 */
const DEC_SATURATE_AT = 10n ** 18n;

/**
 * `to_int()` / `int(字符串)` 的算式（用例 104 的 118 个值 + 6 组同形探针，口径见 SEMANTICS S127–S129）。
 * **单趟扫描**，每个字符只有四种待遇：
 *  - 数字：`acc = acc*10 + d`，**int64 回绕**（Godot 那边就是有符号溢出）；
 *  - `-`：**只在还没见过任何数字时**翻一次符号，可反复翻 —— `"a-5"`→-5、`"a--5"`→5、
 *    `"-a-2"`→2、`"+ -3"`→-3，而 `"5-3"`→53、`"1--2"`→12（见过数字就再也不翻了）；
 *  - `.`：**立刻停止**（`"1.5"`→1、`"x.5"`→0、`"-1.5x2"`→-1），不是把后面的数字也攒上；
 *  - 其余（空白、字母、下划线、`+`）：一律跳过且不断扫描 —— 所以 `"\r\n-5"`→-5、
 *    非断空格也算普通跳过项，前导空白**不需要**单独一轮循环处理。
 *
 * 溢出是**两段式**的，这条最容易凭直觉写错：
 *  - 19 位以内老老实实回绕：`"9223372036854775808"`(2^63) → INT64_MIN、
 *    `"9500000000000000009"` → -8946744073709551607、`"9999999999999999991"` → -8446744073709551625；
 *  - 但**乘 10 之前** `|acc|` 已达 `10^18` 就饱和：`"10000000000000000000"`(10^19) → INT64_MAX
 *    （不是绕成 -8446744073709551616），负的那侧给 INT64_MIN。闸门量到个位：
 *    `|acc| = 10^18-1` 仍回绕，`10^18` 才饱和 —— 跟 `INT64_MAX/10` 那个「防溢出」常数**不是一个数**，
 *    别拿它当判据（`"9223372036854775811"` 实测绕成 -9223372036854775805，按 INT64_MAX/10 就该饱和）。
 *  - 饱和看的是**回绕之后**的绝对值：`"99999999999999999999"` 第 19 位先绕成 -8.4e18，第 20 位才撞上闸门。
 *
 * 符号是「先攒无符号累加值、最后再取负」，取负同样回绕：`"-9223372036854775809"` → INT64_MAX。
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

/** float(String)：取前导浮点数，取不到就是 0（实测 `0x10`→0.0、`abc`→0.0）。 */
export function strToFloat(s: string): number {
  const m = /^\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d*)?/.exec(s);
  return m ? decimalToDouble(m[0]) : 0;
}
