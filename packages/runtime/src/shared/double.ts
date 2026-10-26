const POW10 = [10, 100, 1e4, 1e8, 1e16, 1e32, 1e64, 1e128, 1e256];
const MAX_EXPONENT = 511;

const SP = 32;
const TAB = 9;
const LF = 10;
const PLUS = 43;
const MINUS = 45;
const DOT = 46;
const ZERO = 48;
const UPPER_E = 69;
const LOWER_E = 101;

/** 越界给 -1：`charCodeAt` 的 NaN 不进比较，静态编译目标才认。 */
function codeAt(s: string, at: number): number {
  if (at < 0 || at >= s.length) return -1;
  return s.charCodeAt(at);
}

function digitOf(c: number): number {
  return c >= ZERO && c <= ZERO + 9 ? c - ZERO : -1;
}

export function decimalToDouble(s: string): number {
  let i = 0;
  let c = codeAt(s, i);
  while (c === SP || c === TAB || c === LF) c = codeAt(s, ++i);
  let sign = false;
  if (c === MINUS) {
    sign = true;
    c = codeAt(s, ++i);
  } else if (c === PLUS) {
    c = codeAt(s, ++i);
  }
  const start = i;
  let mantSize = 0;
  let decPt = -1;
  for (;;) {
    if (digitOf(c) < 0) {
      if (c !== DOT || decPt >= 0) break;
      decPt = mantSize;
    }
    i++;
    mantSize++;
    c = codeAt(s, i);
  }
  if (decPt < 0) decPt = mantSize;
  else mantSize -= 1;
  const fracExp = mantSize > 18 ? decPt - 18 : decPt - mantSize;
  let size = mantSize > 18 ? 18 : mantSize;
  if (size === 0) return sign ? -0 : 0;

  let head = 0;
  let j = start;
  for (; size > 9; size--) {
    let d = codeAt(s, j);
    j++;
    if (d === DOT) {
      d = codeAt(s, j);
      j++;
    }
    head = 10 * head + digitOf(d);
  }
  let tail = 0;
  for (; size > 0; size--) {
    let d = codeAt(s, j);
    j++;
    if (d === DOT) {
      d = codeAt(s, j);
      j++;
    }
    tail = 10 * tail + digitOf(d);
  }
  let fraction = 1.0e9 * head + tail;

  let exp = 0;
  let expSign = false;
  if (c === UPPER_E || c === LOWER_E) {
    let k = i + 1;
    let ec = codeAt(s, k);
    if (ec === MINUS) {
      expSign = true;
      ec = codeAt(s, ++k);
    } else if (ec === PLUS) {
      ec = codeAt(s, ++k);
    }
    if (digitOf(ec) < 0) {
      return sign ? -fraction : fraction;
    }
    while (digitOf(ec) >= 0) {
      exp = 10 * exp + digitOf(ec);
      ec = codeAt(s, ++k);
    }
  }
  exp = expSign ? fracExp - exp : fracExp + exp;
  if (exp < 0) {
    expSign = true;
    exp = -exp;
  } else {
    expSign = false;
  }
  if (exp > MAX_EXPONENT) exp = MAX_EXPONENT;
  let dblExp = 1.0;
  let bit = 0;
  while (exp !== 0) {
    if ((exp & 1) !== 0) dblExp *= POW10[bit]!;
    exp = Math.floor(exp / 2);
    bit++;
  }
  fraction = expSign ? fraction / dblExp : fraction * dblExp;
  return sign ? -fraction : fraction;
}

/** 字面量那侧的入口：先剥下划线再走同一条式子（运行时的字符串不认 `1_000.5`）。 */
export function parseGdDouble(text: string): number {
  return decimalToDouble(text.replaceAll("_", ""));
}
