/** 字面量的解析口径，不是正确舍入的 strtod：Godot 先把小数位截到这个位数，再用拼出来的整数除以 10 的幂，两次 double 舍入，所以不能直接用 `Number()`。 */
const FRAC_DIGITS = 17;

/** 不做下划线处理：运行时的字符串不认 `1_000.5`，剥下划线只属于字面量那条路（由 `parseGdDouble` 负责）。 */
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
  if (!/^[0-9]*$/.test(all)) return Number(s);
  let v = Number(BigInt(all === "" ? "0" : all)) / Math.pow(10, fp.length);
  if (exp !== 0) v *= Math.pow(10, exp);
  return neg ? -v : v;
}

export function parseGdDouble(text: string): number {
  return decimalToDouble(text.replaceAll("_", ""));
}
