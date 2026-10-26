
type U64 = { hi: number; lo: number };

const B32 = 4294967296;

/** n < 2^53。 */
function fromNum(n: number): U64 {
  return { hi: Math.floor(n / B32), lo: n % B32 };
}

function oneShift(s: number): U64 {
  return s >= 32 ? { hi: 2 ** (s - 32), lo: 0 } : { hi: 0, lo: 2 ** s };
}

function cmpU(a: U64, b: U64): number {
  if (a.hi !== b.hi) return a.hi < b.hi ? -1 : 1;
  if (a.lo !== b.lo) return a.lo < b.lo ? -1 : 1;
  return 0;
}

function addU(a: U64, b: U64): U64 {
  const lo = a.lo + b.lo;
  return { hi: (a.hi + b.hi + Math.floor(lo / B32)) % B32, lo: lo % B32 };
}

/** 只在 a ≥ b 时用（算法各处都由边界保证）。 */
function subU(a: U64, b: U64): U64 {
  const lo = a.lo - b.lo;
  return { hi: (a.hi - b.hi - (lo < 0 ? 1 : 0) + B32) % B32, lo: (lo + B32) % B32 };
}

function dblU(a: U64): U64 {
  return { hi: (a.hi * 2 + (a.lo >= 2147483648 ? 1 : 0)) % B32, lo: (a.lo * 2) % B32 };
}

function halfU(a: U64): U64 {
  return { hi: Math.floor(a.hi / 2), lo: Math.floor(a.lo / 2) + (a.hi % 2) * 2147483648 };
}

function shlU(a: U64, s: number): U64 {
  let r = a;
  for (let i = 0; i < s; i++) r = dblU(r);
  return r;
}

function shrU(a: U64, s: number): U64 {
  let r = a;
  for (let i = 0; i < s; i++) r = halfU(r);
  return r;
}

/** 值要落在 2^53 内才用（各处都保证 ≤ 32 位）。 */
function toNum(a: U64): number {
  return a.hi * B32 + a.lo;
}

function mul10U(a: U64): U64 {
  const lo = a.lo * 10;
  return { hi: (a.hi * 10 + Math.floor(lo / B32)) % B32, lo: lo % B32 };
}

function mul32(a: number, b: number): U64 {
  const al = a % 65536;
  const ah = Math.floor(a / 65536);
  const bl = b % 65536;
  const bh = Math.floor(b / 65536);
  const p0 = al * bl;
  const p1 = al * bh;
  const p2 = ah * bl;
  const p3 = ah * bh;
  const mid = Math.floor(p0 / 65536) + (p1 % 65536) + (p2 % 65536);
  return { hi: p3 + Math.floor(p1 / 65536) + Math.floor(p2 / 65536) + Math.floor(mid / 65536), lo: (p0 % 65536) + (mid % 65536) * 65536 };
}

function mulHigh(x: U64, y: U64): U64 {
  const p0 = mul32(x.lo, y.lo);
  const p1 = mul32(x.lo, y.hi);
  const p2 = mul32(x.hi, y.lo);
  const p3 = mul32(x.hi, y.hi);
  const q = p0.hi + p1.lo + p2.lo + 2147483648;
  return addU(p3, fromNum(p1.hi + p2.hi + Math.floor(q / B32)));
}

type Diy = { f: U64; e: number };

const W63 = { hi: 2147483648, lo: 0 };

function topBitSet(x: U64): boolean {
  return x.hi >= W63.hi;
}

function normalize(x: Diy): Diy {
  let f = x.f;
  let e = x.e;
  while (!topBitSet(f)) {
    f = shlU(f, 1);
    e -= 1;
  }
  return { f, e };
}

function normalizeTo(x: Diy, targetExponent: number): Diy {
  return { f: shlU(x.f, x.e - targetExponent), e: targetExponent };
}

function mul(x: Diy, y: Diy): Diy {
  return { f: mulHigh(x.f, y.f), e: x.e + y.e + 64 };
}

const CACHED: Array<[number, number, number, number]> = [
  [0xab70fe17, 0xc79ac6ca, -1060, -300],
  [0xff77b1fc, 0xbebcdc4f, -1034, -292],
  [0xbe5691ef, 0x416bd60c, -1007, -284],
  [0x8dd01fad, 0x907ffc3c, -980, -276],
  [0xd3515c28, 0x31559a83, -954, -268],
  [0x9d71ac8f, 0xada6c9b5, -927, -260],
  [0xea9c2277, 0x23ee8bcb, -901, -252],
  [0xaecc4991, 0x4078536d, -874, -244],
  [0x823c1279, 0x5db6ce57, -847, -236],
  [0xc2109436, 0x4dfb5637, -821, -228],
  [0x9096ea6f, 0x3848984f, -794, -220],
  [0xd77485cb, 0x25823ac7, -768, -212],
  [0xa086cfcd, 0x97bf97f4, -741, -204],
  [0xef340a98, 0x172aace5, -715, -196],
  [0xb23867fb, 0x2a35b28e, -688, -188],
  [0x84c8d4df, 0xd2c63f3b, -661, -180],
  [0xc5dd4427, 0x1ad3cdba, -635, -172],
  [0x936b9fce, 0xbb25c996, -608, -164],
  [0xdbac6c24, 0x7d62a584, -582, -156],
  [0xa3ab6658, 0x0d5fdaf6, -555, -148],
  [0xf3e2f893, 0xdec3f126, -529, -140],
  [0xb5b5ada8, 0xaaff80b8, -502, -132],
  [0x87625f05, 0x6c7c4a8b, -475, -124],
  [0xc9bcff60, 0x34c13053, -449, -116],
  [0x964e858c, 0x91ba2655, -422, -108],
  [0xdff97724, 0x70297ebd, -396, -100],
  [0xa6dfbd9f, 0xb8e5b88f, -369, -92],
  [0xf8a95fcf, 0x88747d94, -343, -84],
  [0xb9447093, 0x8fa89bcf, -316, -76],
  [0x8a08f0f8, 0xbf0f156b, -289, -68],
  [0xcdb02555, 0x653131b6, -263, -60],
  [0x993fe2c6, 0xd07b7fac, -236, -52],
  [0xe45c10c4, 0x2a2b3b06, -210, -44],
  [0xaa242499, 0x697392d3, -183, -36],
  [0xfd87b5f2, 0x8300ca0e, -157, -28],
  [0xbce50864, 0x92111aeb, -130, -20],
  [0x8cbccc09, 0x6f5088cc, -103, -12],
  [0xd1b71758, 0xe219652c, -77, -4],
  [0x9c400000, 0x00000000, -50, 4],
  [0xe8d4a510, 0x00000000, -24, 12],
  [0xad78ebc5, 0xac620000, 3, 20],
  [0x813f3978, 0xf8940984, 30, 28],
  [0xc097ce7b, 0xc90715b3, 56, 36],
  [0x8f7e32ce, 0x7bea5c70, 83, 44],
  [0xd5d238a4, 0xabe98068, 109, 52],
  [0x9f4f2726, 0x179a2245, 136, 60],
  [0xed63a231, 0xd4c4fb27, 162, 68],
  [0xb0de6538, 0x8cc8ada8, 189, 76],
  [0x83c7088e, 0x1aab65db, 216, 84],
  [0xc45d1df9, 0x42711d9a, 242, 92],
  [0x924d692c, 0xa61be758, 269, 100],
  [0xda01ee64, 0x1a708dea, 295, 108],
  [0xa26da399, 0x9aef774a, 322, 116],
  [0xf209787b, 0xb47d6b85, 348, 124],
  [0xb454e4a1, 0x79dd1877, 375, 132],
  [0x865b8692, 0x5b9bc5c2, 402, 140],
  [0xc83553c5, 0xc8965d3d, 428, 148],
  [0x952ab45c, 0xfa97a0b3, 455, 156],
  [0xde469fbd, 0x99a05fe3, 481, 164],
  [0xa59bc234, 0xdb398c25, 508, 172],
  [0xf6c69a72, 0xa3989f5c, 534, 180],
  [0xb7dcbf53, 0x54e9bece, 561, 188],
  [0x88fcf317, 0xf22241e2, 588, 196],
  [0xcc20ce9b, 0xd35c78a5, 614, 204],
  [0x98165af3, 0x7b2153df, 641, 212],
  [0xe2a0b5dc, 0x971f303a, 667, 220],
  [0xa8d9d153, 0x5ce3b396, 694, 228],
  [0xfb9b7cd9, 0xa4a7443c, 720, 236],
  [0xbb764c4c, 0xa7a44410, 747, 244],
  [0x8bab8eef, 0xb6409c1a, 774, 252],
  [0xd01fef10, 0xa657842c, 800, 260],
  [0x9b10a4e5, 0xe9913129, 827, 268],
  [0xe7109bfb, 0xa19c0c9d, 853, 276],
  [0xac2820d9, 0x623bf429, 880, 284],
  [0x80444b5e, 0x7aa7cf85, 907, 292],
  [0xbf21e440, 0x03acdd2d, 933, 300],
  [0x8e679c2f, 0x5e44ff8f, 960, 308],
  [0xd433179d, 0x9c8cb841, 986, 316],
  [0x9e19db92, 0xb4e31ba9, 1013, 324],
];

function cachedPower(binaryExponent: number): { f: U64; e: number; k: number } {
  const f = -61 - binaryExponent;
  const k = Math.trunc((f * 78913) / 262144) + (f > 0 ? 1 : 0);
  const hit = CACHED[Math.trunc((300 + k + 7) / 8)]!;
  return { f: { hi: hit[0], lo: hit[1] }, e: hit[2], k: hit[3] };
}

/** 值的上下边界：位数 53（double）或 24（float32）；eRaw 是 IEEE 那侧的有偏指数。 */
function boundaries(bits: U64, eRaw: number, precision: number): { w: Diy; minus: Diy; plus: Diy } {
  const hidden = oneShift(precision - 1);
  const bias = precision === 24 ? 150 : 1075;
  const frac = subU(bits, shlU(fromNum(eRaw), precision - 1));
  const v: Diy = eRaw === 0 ? { f: frac, e: 1 - bias } : { f: addU(frac, hidden), e: eRaw - bias };
  const lowerCloser = cmpU(frac, { hi: 0, lo: 0 }) === 0 && eRaw > 1;
  const mPlus: Diy = { f: addU(shlU(v.f, 1), { hi: 0, lo: 1 }), e: v.e - 1 };
  const mMinus: Diy = lowerCloser
    ? { f: subU(shlU(v.f, 2), { hi: 0, lo: 1 }), e: v.e - 2 }
    : { f: subU(shlU(v.f, 1), { hi: 0, lo: 1 }), e: v.e - 1 };
  const wPlus = normalize(mPlus);
  return { w: normalize(v), minus: normalizeTo(mMinus, wPlus.e), plus: wPlus };
}

function largestPow10(n: number): [number, number] {
  const table: Array<[number, number]> = [
    [1000000000, 10],
    [100000000, 9],
    [10000000, 8],
    [1000000, 7],
    [100000, 6],
    [10000, 5],
    [1000, 4],
    [100, 3],
    [10, 2],
    [1, 1],
  ];
  for (const [pow, digits] of table) if (n >= pow) return [digits, pow];
  return [1, 1];
}

function roundSteps(dist: U64, delta: U64, restIn: U64, tenK: U64): number {
  let rest = restIn;
  let dec = 0;
  while (
    cmpU(rest, dist) < 0 &&
    cmpU(subU(delta, rest), tenK) >= 0 &&
    (cmpU(addU(rest, tenK), dist) < 0 || cmpU(subU(dist, rest), subU(addU(rest, tenK), dist)) > 0)
  ) {
    dec += 1;
    rest = addU(rest, tenK);
  }
  return dec;
}

/** 静态编译目标不认「往数组下标上赋值」，末位就靠 pop 之外的一条路：截断再拼回去。 */
function digitsWithRound(out: string[], dec: number): string {
  const last = out[out.length - 1]!;
  return `${out.slice(0, out.length - 1).join("")}${String.fromCharCode(last.charCodeAt(0) - dec)}`;
}

/** M- ≤ 尾数串 × 10^指数 ≤ M+，从左往右生成，够用就停。 */
function digitGen(mMinus: Diy, w: Diy, mPlus: Diy): { digits: string; decimalExponent: number } {
  const out: string[] = [];
  let decimalExponent = 0;
  let delta = subU(mPlus.f, mMinus.f);
  let dist = subU(mPlus.f, w.f);
  const negE = -mPlus.e;
  const oneF = oneShift(negE);
  let p1 = toNum(shrU(mPlus.f, negE));
  let p2 = subU(mPlus.f, shlU(fromNum(p1), negE));

  let [n, pow10] = largestPow10(p1);
  while (n > 0) {
    out.push(String.fromCharCode(48 + Math.floor(p1 / pow10)));
    p1 %= pow10;
    n -= 1;
    const rest = addU(shlU(fromNum(p1), negE), p2);
    if (cmpU(rest, delta) <= 0) {
      decimalExponent += n;
      return { digits: digitsWithRound(out, roundSteps(dist, delta, rest, shlU(fromNum(pow10), negE))), decimalExponent };
    }
    pow10 = Math.floor(pow10 / 10);
  }

  for (;;) {
    p2 = mul10U(p2);
    const d = toNum(shrU(p2, negE));
    out.push(String.fromCharCode(48 + d));
    p2 = subU(p2, shlU(fromNum(d), negE));
    decimalExponent -= 1;
    delta = mul10U(delta);
    dist = mul10U(dist);
    if (cmpU(p2, delta) <= 0) break;
  }
  return { digits: digitsWithRound(out, roundSteps(dist, delta, p2, oneF)), decimalExponent };
}

function formatBuffer(digits: string, decimalExponent: number): string {
  const len = digits.length;
  const n = len + decimalExponent;
  if (len <= n && n <= 15) return `${digits}${"0".repeat(n - len)}`;
  if (0 < n && n <= 15) return `${digits.slice(0, n)}.${digits.slice(n)}`;
  if (-4 < n && n <= 0) return `0.${"0".repeat(-n)}${digits}`;
  const mantissa = len === 1 ? digits : `${digits[0]}.${digits.slice(1)}`;
  return `${mantissa}e${n - 1 < 0 ? "-" : "+"}${String(Math.abs(n - 1)).padStart(2, "0")}`;
}

function isNegative(x: number): boolean {
  return x < 0 || Object.is(x, -0);
}

function numScientific(value: number, isFloat: boolean): string {
  let head = "";
  let v = value;
  if (isNegative(v)) {
    head = "-";
    v = -v;
  }
  if (v === 0) return `${head}0`;
  const dv = new DataView(new ArrayBuffer(8));
  let bits: U64;
  if (isFloat) {
    dv.setFloat32(0, v, true);
    bits = { hi: 0, lo: dv.getUint32(0, true) };
  } else {
    dv.setFloat64(0, v, true);
    bits = { hi: dv.getUint32(4, true), lo: dv.getUint32(0, true) };
  }
  const eRaw = isFloat ? Math.floor(bits.lo / 2 ** 23) : Math.floor(bits.hi / 2 ** 20);
  const b = boundaries(bits, eRaw, isFloat ? 24 : 53);
  const cp = cachedPower(b.plus.e);
  const c: Diy = { f: cp.f, e: cp.e };
  const w = mul(b.w, c);
  const wMinus = mul(b.minus, c);
  const wPlus = mul(b.plus, c);
  const gen = digitGen(
    { f: addU(wMinus.f, { hi: 0, lo: 1 }), e: wMinus.e },
    w,
    { f: subU(wPlus.f, { hi: 0, lo: 1 }), e: wPlus.e },
  );
  return `${head}${formatBuffer(gen.digits, -cp.k + gen.decimalExponent)}`;
}

export function rtosFix(value: number, compat: boolean): string {
  if (Number.isNaN(value)) return "nan";
  if (value === Number.POSITIVE_INFINITY) return "inf";
  if (value === Number.NEGATIVE_INFINITY) return compat ? "inf_neg" : "-inf";
  if (value === 0) return "0";
  const f32 = Math.fround(value);
  return numScientific(value, Number.isFinite(f32) && f32 === value);
}

export function floatConstructText(value: number): string {
  const s = rtosFix(value, true);
  if (s === "inf" || s === "-inf" || s === "nan" || s.includes(".") || s.includes("e") || s.includes("E")) return s;
  return `${s}.0`;
}
