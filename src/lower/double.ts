/**
 * GDScript 浮点字面量的解析口径 —— **不是正确舍入的 strtod**（step 23 留下的悬案，step 48 逆出来并复现）。
 *
 * Godot 的 `String::to_double` 是「先把小数位截到 **17 位**，再把整数部分与截好的小数部分拼成一个整数、
 * 除以 10 的幂」，于是有**两次** double 舍入，结果和一次到位的正确值可以差 1 ulp。
 * 判据（全部 Godot 4.6.3 实测，`int(字面量 × 系数)` 形式取出精确值，绕开打印层的 15 位截断）：
 *
 * | 字面量 | Godot | JS `Number()` | 为什么分家 |
 * | --- | --- | --- | --- |
 * | `9007199254740993.0` | `9007199254740994` | `…992` | 拼出的整数 90071992547409930 先舍到 …936，再 /10 → …993.6 → 舍成 …994 |
 * | `9007199254740993.5` | `9007199254740994` | 同 | 非平局，两条路一致（留着当回归位） |
 * | `0.1234567890123456789` | ×1e17 → `12345678901234568` | 同 | 截 17 位小数后仍落在同一个 double |
 * | `0.0000001234567890123456789` | ×1e25 → `1234567890100000256` | `1234567890123456800` | 预算按**小数位**数，6 个前导零吃掉额度 → 只剩 11 位有效数字 |
 * | `1.000000000000000083266726846886739642044414197265625` | ×1e18 → `1000000000000000000` | `…000300` | 截 17 位小数后 `.00000000000000008` 落在 1.0 的半个 ulp 内 |
 * | `100000000000000001.0`、`1234567890123456789.0` | 与 JS 同 | — | 非平局，两条路一致 |
 *
 * 十种组合（截位口径 × 累加方式 × 缩放方式）里只有「**BigInt 拼整数 + 一次 /10^k + 一次 ×10^exp**」
 * 这一条能同时命中全部实测点，所以下面就照它写。整数部分不截（实测没触及），前导零**算进**小数预算。
 */
const FRAC_DIGITS = 17;

/**
 * 不做下划线处理的版本：字面量里 `1_000.5` 合法，但**运行时的字符串**不认下划线
 * （实测 `("1_000_000.25").to_float()` → **1.0**、`is_valid_float()` → false），
 * 所以下划线的剥离只属于字面量那条路。
 */
export function decimalToDouble(s: string): number {
  let text = s;
  let neg = false;
  if (text[0] === "-" || text[0] === "+") {
    neg = text[0] === "-";
    text = text.slice(1);
  }
  let mant = text;
  let exp = 0;
  const ei = text.toLowerCase().indexOf("e");
  if (ei >= 0) {
    mant = text.slice(0, ei);
    exp = Number(text.slice(ei + 1)) || 0;
  }
  const dot = mant.indexOf(".");
  const ip = dot < 0 ? mant : mant.slice(0, dot);
  let fp = dot < 0 ? "" : mant.slice(dot + 1);
  if (fp.length > FRAC_DIGITS) fp = fp.slice(0, FRAC_DIGITS);
  const all = `${ip}${fp}`;
  if (!/^[0-9]*$/.test(all)) return Number(s); // 混进非数字（含 e 后面不是整数）时退回 JS
  let v = Number(BigInt(all === "" ? "0" : all)) / Math.pow(10, fp.length);
  if (exp !== 0) v *= Math.pow(10, exp);
  return neg ? -v : v;
}

export function parseGdDouble(text: string): number {
  return decimalToDouble(text.replaceAll("_", ""));
}
