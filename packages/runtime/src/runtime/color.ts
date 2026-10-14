import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, int64ParamBig, tagName, type IntPayload, type Variant } from "./tags";
import { CMP_EPS, approxEq, clamp, vecFailKey } from "./vector2";
import { COLOR_NAMED } from "./color-named";
import { asNodePath, nodePathText } from "./node-path";

export class GColor {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(r: number, g: number, b: number, a: number) {
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
    this.a = Math.fround(a);
  }
}

const r32 = Math.fround;
const mul = (a: number, b: number) => r32(a * b);
const div = (a: number, b: number) => r32(a / b);
const add = (a: number, b: number) => r32(a + b);
const sub = (a: number, b: number) => r32(a - b);

export function color(rr: number, gg: number, bb: number, aa: number): Variant {
  return V.object(new GColor(rr, gg, bb, aa));
}

export function asColor(v: Variant): GColor | null {
  return v.t === Tag.OBJECT && v.v instanceof GColor ? (v.v as GColor) : null;
}

/** 数值实参：float 在调用边界上折回 `real_t`（S313，与 Vector 两支同一条），int 收成 number，其余响亮报错。 */
function numArg(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return r32(v.v as number);
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  // bool 在数值位上引擎收下来折 0 / 1（`Color(1, 0, 0, 1).from_hsv(true, 1, 1)` 实测照算）
  if (v.t === Tag.BOOL) return v.v ? 1 : 0;
  throw new UnsupportedError("color-arg", `Color.${who} 需要数值实参，收到 ${tagName(v.t)}`);
}

function uppercaseSlot(v: Variant): boolean {
  if (v.t === Tag.BOOL) return v.v as boolean;
  if (v.t === Tag.INT) return intToBig(v.v as IntPayload) !== 0n;
  if (v.t === Tag.FLOAT) {
    const x = v.v as number;
    if (!Number.isFinite(x)) throw new UnsupportedError("color-to-html", `Color.to_html() 的 uppercase 收到 ${String(x)}（非有限值没量过）`);
    return x !== 0;
  }
  throw new UnsupportedError("color-to-html", `Color.to_html() 的 uppercase 只量过 bool / int / float（收到 ${tagName(v.t)}）`);
}

function strArg(v: Variant | undefined, who: string): string {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return v.v as string;
  // NodePath 在字符串位上引擎按其文本折（`Color.html(^"808080")` 实测给 `(0.502, 0.502, 0.502, 1.0)`，与给 `"808080"` 同值）
  const np = asNodePath(v);
  if (np !== null) return nodePathText(np);
  throw new UnsupportedError("color-arg", `Color.${who} 需要字符串实参，收到 ${tagName(v.t)}`);
}

/** `hex` / `hex64` 的实参：那一位声明是 int，引擎收 int / float / bool（`tmp/probe-argtype/hexfold.txt`），
 *  折法与其余 int 形参同一口径（`int64ParamBig`），再按无符号截到低 32 / 64 位（实测 `Color.hex(-1)` 与 `Color.hex(0xFFFFFFFF)` 同值、`Color.hex(4294967296)` 给全零）。 */
function intBits(v: Variant | undefined, who: string, bits: number): bigint {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  return int64ParamBig(v, `Color.${who}`) & ((1n << BigInt(bits)) - 1n);
}

/** `hex` / `hex64` 的通道切法：高位在前（与 `to_rgba32` / `to_rgba64` 那一路同序），标度分别是 255 与 65535。 */
const fromHex32 = (h: bigint): Variant => {
  const b = (sh: number) => div(Number((h >> BigInt(sh)) & 0xffn), 255);
  return color(b(24), b(16), b(8), b(0));
};

const fromHex64 = (h: bigint): Variant => {
  const s = (sh: number) => div(Number((h >> BigInt(sh)) & 0xffffn), 65535);
  return color(s(48), s(32), s(16), s(0));
};

/** 解析失败时的兜底色：`Color(String)` 与 `Color.html` 都用 (0,0,0,1)。 */
const ZERO_COLOR = (): Variant => color(0, 0, 0, 1);

/** 名字查表用的键：引擎把 空格、`-`、`_`、`'`、`.` 五种都抹掉再转大写（`"web green"` `"web-green"` `"WEB_GREEN"` 都算 web_green），表里的下划线同样得抹掉才对得上。 */
const NAME_SEPS = /[ \-_'".]/g;

function namedOf(s: string): number | undefined {
  const key = s.toLowerCase().replace(NAME_SEPS, "");
  for (const name in COLOR_NAMED) {
    if (name.replace(NAME_SEPS, "") === key) return COLOR_NAMED[name];
  }
  return undefined;
}

/** 名字表里的 0xAARRGGBB → Color。 */
function packedColor(packed: number): Variant {
  const b = (i: number) => Number((BigInt(packed) >> BigInt(i * 8)) & 0xffn);
  return color(b(2) / 255, b(1) / 255, b(0) / 255, b(3) / 255);
}

/** 十六进制解析：`#` 可省，长度 3（`f00`→`ff0000`）/ 4（`f00f`→`ff0000ff`，一数字一通道）/ 6（RGB）/ 8（RGBA，**alpha 在后**），其余长度或非法字符给 null；`names` 为 false 时不查名字表 —— 这是 `Color.html` 与 `Color(String)` 的唯一区别。 */
function parseColor(s: string, names: boolean): Variant | null {
  if (names) {
    const packed = namedOf(s);
    if (packed !== undefined) return packedColor(packed);
  }
  let h = s[0] === "#" ? s.slice(1) : s;
  if (h.length === 3 || h.length === 4) h = h.split("").map((d) => d + d).join("");
  if (h.length !== 6 && h.length !== 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  const byte = (i: number) => parseInt(h.slice(i, i + 2), 16);
  const a = h.length === 8 ? byte(6) : 255;
  return color(byte(0) / 255, byte(2) / 255, byte(4) / 255, a / 255);
}

/** `Color.html_is_valid()` 的判据：非空、可省 `#`、去掉后长度只认 3 / 4 / 6 / 8，且每一位都是十六进制数字。 */
function htmlIsValid(s: string): boolean {
  if (s.length === 0) return false;
  const h = s[0] === "#" ? s.slice(1) : s;
  if (!(h.length === 3 || h.length === 4 || h.length === 6 || h.length === 8)) return false;
  return /^[0-9a-fA-F]+$/.test(h);
}

/** 文本 → Color 的那条道（名字表优先、再 hex、都不中给 `(0,0,0,1)`）：构造器、Color 槽与 `convert()` 共用。 */
export function colorFromText(s: string): Variant {
  return parseColor(s, true) ?? ZERO_COLOR();
}

/** int → Color 的 **packed RGBA** 那一形（构造器与槽共用，见 `colorNew` 与 `tryColorSlot`）。 */
function packedRgba(raw: bigint): Variant {
  const u = ((raw % 4294967296n) + 4294967296n) % 4294967296n;
  const ch = (k: bigint) => Number((u >> k) & 255n) / 255;
  return color(ch(24n), ch(16n), ch(8n), ch(0n));
}

/** `Color(...)`：0 参给 `(0,0,0,1)`；1 参收 Color 或字符串；3 参 alpha 补 1；4 参照收。 */
export function colorNew(args: Variant[]): Variant {
  if (args.length === 0) return ZERO_COLOR();
  if (args.length === 1) {
    const a = args[0] as Variant;
    const c = asColor(a);
    if (c) return color(c.r, c.g, c.b, c.a);
    if (a.t === Tag.STRING || a.t === Tag.STRING_NAME) {
      return parseColor(a.v as string, true) ?? ZERO_COLOR();
    }
    // 单参收 int = **packed RGBA**：r/g/b/a 各占一字节，先按 2³² 取模；float 那一形 Godot 解析期就拒，不顺手接。
    if (a.t === Tag.INT) return packedRgba(intToBig(a.v as IntPayload));
    throw new UnsupportedError("color-arg", `Color() 单参只收 Color / 字符串 / int，收到 ${tagName(a.t)}`);
  }
  if (args.length === 3) {
    return color(numArg(args[0], "Color"), numArg(args[1], "Color"), numArg(args[2], "Color"), 1);
  }
  if (args.length !== 4) {
    throw new UnsupportedError(
      "color-arity",
      `Color() 需要 0、1（Color/字符串）、3 或 4 个参数（收到 ${args.length} 个）`,
    );
  }
  return color(
    numArg(args[0], "Color"),
    numArg(args[1], "Color"),
    numArg(args[2], "Color"),
    numArg(args[3], "Color"),
  );
}

/** **Color 槽**（变量初值 / 后续赋值 / 字段 / 定型容器元素与字典键值 / 形参默认值）收什么：同型拷一份、int 走 packed RGBA、String 走色名与 hex；装不下的形状给 null，由调用方按自己的口径处理。 */
export function tryColorSlot(v: Variant): Variant | null {
  const c = asColor(v);
  if (c !== null) return color(c.r, c.g, c.b, c.a);
  if (v.t === Tag.INT) return packedRgba(intToBig(v.v as IntPayload));
  if (v.t === Tag.STRING) return parseColor(v.v as string, true) ?? ZERO_COLOR();
  return null;
}

/** 变量 / 字段那一族的 Color 转换：槽只能装 Color，装不下不是「原样塞进去」而是响亮报。 */
export function toColor(v: Variant): Variant {
  const r = tryColorSlot(v);
  if (r !== null) return r;
  throw new UnsupportedError("color-slot", `Color 槽只收 Color / int / String，收到 ${tagName(v.t)}`);
}

/** `Color.` 上的静态成员：常量名（`Color.RED`、`Color.TRANSPARENT`）与 `html` / `from_string` / `from_hsv` / `from_ok_hsl` 四个静态函数，名单外响亮报缺。 */
export function colorStatic(name: string, args: Variant[] = []): Variant {
  if (args.length > 0 || name === "html" || name === "from_string" || name === "from_hsv" || name === "from_ok_hsl") {
    switch (name) {
      case "html": {
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.html() 只收 1 个字符串（收到 ${args.length} 个）`);
        }
        return parseColor(strArg(args[0], "html"), false) ?? ZERO_COLOR();
      }
      case "from_string": {
        if (args.length !== 2) {
          throw new UnsupportedError(
            "color-arity",
            `Color.from_string() 需要 2 个参数（字符串 + 兜底色，收到 ${args.length} 个）`,
          );
        }
        // 兜底色那一位与 **Color 槽**同口径：Color / int（打包）/ String（按 html）都收（实测 `from_string("a", 1)` 给 `(0.0, 0.0, 0.0, 0.0039)`、`from_string("a", "a")` 给 `(0.0, 0.0, 0.0, 1.0)`）
        const folded = args[1] === undefined ? null : tryColorSlot(args[1]);
        const fb = folded === null ? null : asColor(folded);
        if (fb === null) throw new UnsupportedError("color-arg", "Color.from_string() 的第 2 个实参需要 Color");
        return parseColor(strArg(args[0], "from_string"), true) ?? color(fb.r, fb.g, fb.b, fb.a);
      }
      case "from_hsv": {
        if (args.length !== 3 && args.length !== 4) {
          throw new UnsupportedError(
            "color-arity",
            `Color.from_hsv() 需要 3 或 4 个参数（收到 ${args.length} 个）`,
          );
        }
        return fromHsv(
          numArg(args[0], "from_hsv"),
          numArg(args[1], "from_hsv"),
          numArg(args[2], "from_hsv"),
          args.length === 4 ? numArg(args[3], "from_hsv") : 1,
        );
      }
      case "from_ok_hsl": {
        if (args.length !== 3 && args.length !== 4) {
          throw new UnsupportedError(
            "color-arity",
            `Color.from_ok_hsl() 需要 3 或 4 个参数（收到 ${args.length} 个）`,
          );
        }
        const [r, g, b] = okhslToSrgb(
          numArg(args[0], "from_ok_hsl"),
          numArg(args[1], "from_ok_hsl"),
          numArg(args[2], "from_ok_hsl"),
        );
        // 原文不夹，引擎在最后一道把四个通道全夹进 0..1：463 格里 38 格（全是 s 满格）落在 ±1e-6 外、引擎一律给整 0 / 整 1，
        // alpha 同样夹（实测 `-0.2 → 0`、`2 → 1`、`INF → 1`，而 `NAN` 原样留 nan —— 与 `x<0→0 / x>1→1` 的三目一致）
        const ch = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);
        return color(ch(r), ch(g), ch(b), ch(args.length === 4 ? numArg(args[3], "from_ok_hsl") : 1));
      }
      case "html_is_valid": {
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.html_is_valid() 只收 1 个字符串（收到 ${args.length} 个）`);
        }
        return V.bool(htmlIsValid(strArg(args[0], "html_is_valid")));
      }
      case "hex": {
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.hex() 只收 1 个 int（收到 ${args.length} 个）`);
        }
        return fromHex32(intBits(args[0], "hex", 32));
      }
      case "hex64": {
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.hex64() 只收 1 个 int（收到 ${args.length} 个）`);
        }
        return fromHex64(intBits(args[0], "hex64", 64));
      }
      case "from_rgba8": {
        if (args.length !== 3 && args.length !== 4) {
          throw new UnsupportedError("color-arity", `Color.from_rgba8() 需要 3 或 4 个 int（收到 ${args.length} 个）`);
        }
        // 式子是 `int64 / 255.0f`：整数先升 float32 再除，不夹范围（实测 300 → 1.1765、-5 → -0.0196）。
        const ch = (v: Variant | undefined, i: number): number =>
          div(r32(Number(int64ParamBig(v, `Color.from_rgba8() 的第 ${i + 1} 个实参`))), 255);
        return color(ch(args[0], 0), ch(args[1], 1), ch(args[2], 2), args[3] === undefined ? 1 : ch(args[3], 3));
      }
      case "from_rgbe9995": {
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.from_rgbe9995() 只收 1 个 int（收到 ${args.length} 个）`);
        }
        // 源是 `core/math/color.cpp` 的 `Color::from_rgbe9995(uint32_t)`：R/G/B 各取 9 位、最高 5 位是指数的原码，
        // `m = Math::pow(2.0f, e - 15.0f - 9.0f)`。形参声明是 int，装箱值先折进 uint32 —— 实测 `4294967296` 给全零、
        // `-1` 与 `0xFFFFFFFF` 同值、`2147483647`（e = 15）给 0.998（24 格读数在 `tmp/probe-argtype/rgbe.txt`）。
        const p = Number(BigInt.asUintN(32, int64ParamBig(args[0], "Color.from_rgbe9995() 的实参")));
        const m = r32(Math.pow(2, (p >>> 27) - 15 - 9));
        return color(r32((p & 0x1ff) * m), r32(((p >>> 9) & 0x1ff) * m), r32(((p >>> 18) & 0x1ff) * m), 1);
      }
      default:
        throw new UnsupportedError("color-static", `Color.${name}(...) 未实现`);
    }
  }
  if (name === "TRANSPARENT") return color(1, 1, 1, 0);
  const packed = COLOR_NAMED[name.toLowerCase()];
  if (packed === undefined) {
    throw new UnsupportedError(
      "color-const",
      `Color.${name} 不存在（实测只有 ${Object.keys(COLOR_NAMED).length} 个 CSS3 颜色名 + TRANSPARENT）`,
    );
  }
  const b = (i: number) => Number((BigInt(packed) >> BigInt(i * 8)) & 0xffn);
  return color(b(2) / 255, b(1) / 255, b(0) / 255, b(3) / 255);
}

/* ---------------- OKHSL → sRGB：`thirdparty/ok_color.h`（Björn Ottosson，MIT）里 `okhsl_to_srgb` 那一支的逐字移植 ----------------
 * 每一步都按 float32 落一次（`r32` / `mul` / `div` / `add` / `sub`），常数先折成 `...f` 字面量的 float32，
 * 多项式的括号层次、Halley 只走一步与 `FLT_MAX` 哨兵都照原文。判据是三张引擎读数表：
 * 463 格全精度网格（`tmp/probe-argtype/okhsl-full.txt`，尺 `fold41.mts`）全合、199 格边界批（`okhsl-b2.json`，尺 `fold42.mts`）除满色相支路的
 * 3 格外全合、792 格细扫掠（`okhsl-sweep.json`，尺 `fold43.mts`）里 s=0 的 396 格全合、s=1 的 396 格合 327 格（差值 ≤1.1e-6）。
 * 两条试过的替代口径都被读数否掉：全程 double 只剩 40/792 合、把 `w0*x + w1*y + w2*z` 收成 FMA 只剩 217/792 合 —— 引擎确是逐算子 float32。 */

const OK_PI = r32(3.1415926535897932384626433832795028841971693993751058209749445923078164062);
const OK_FLT_MAX = 3.4028234663852886e38;

function okMax(x: number, y: number): number {
  return x < y ? y : x;
}

function okMin(x: number, y: number): number {
  return x < y ? x : y;
}

/** 原文里出现三次的 `w0 * x + w1 * y + w2 * z`：按 C 的左结合逐层加。 */
const W_R: readonly [number, number, number] = [r32(4.0767416621), r32(-3.3077115913), r32(0.2309699292)];
const W_G: readonly [number, number, number] = [r32(-1.2684380046), r32(2.6097574011), r32(-0.3413193965)];
const W_B: readonly [number, number, number] = [r32(-0.0041960863), r32(-0.7034186147), r32(1.707614701)];

function dot3(w: readonly [number, number, number], x: number, y: number, z: number): number {
  return add(add(mul(w[0], x), mul(w[1], y)), mul(w[2], z));
}

function srgbTransfer(a: number): number {
  return r32(0.0031308) >= a ? mul(r32(12.92), a) : sub(mul(r32(1.055), r32(Math.pow(a, r32(0.4166666666666667)))), r32(0.055));
}

function oklabToLinearSrgb(L: number, a: number, b: number): [number, number, number] {
  const l_ = add(add(L, mul(r32(0.3963377774), a)), mul(r32(0.2158037573), b));
  const m_ = sub(sub(L, mul(r32(0.1055613458), a)), mul(r32(0.0638541728), b));
  const s_ = sub(sub(L, mul(r32(0.0894841775), a)), mul(r32(1.291485548), b));
  const l = mul(mul(l_, l_), l_);
  const m = mul(mul(m_, m_), m_);
  const s = mul(mul(s_, s_), s_);
  return [dot3(W_R, l, m, s), dot3(W_G, l, m, s), dot3(W_B, l, m, s)];
}

function computeMaxSaturation(a: number, b: number): number {
  let k0: number, k1: number, k2: number, k3: number, k4: number, wl: number, wm: number, ws: number;
  if (add(mul(r32(-1.88170328), a), mul(r32(-0.80936493), b)) > 1) {
    k0 = r32(1.19086277); k1 = r32(1.76576728); k2 = r32(0.59662641); k3 = r32(0.75515197); k4 = r32(0.56771245);
    wl = r32(4.0767416621); wm = r32(-3.3077115913); ws = r32(0.2309699292);
  } else if (sub(mul(r32(1.81444104), a), mul(r32(1.19445276), b)) > 1) {
    k0 = r32(0.73956515); k1 = r32(-0.45954404); k2 = r32(0.08285427); k3 = r32(0.1254107); k4 = r32(0.14503204);
    wl = r32(-1.2684380046); wm = r32(2.6097574011); ws = r32(-0.3413193965);
  } else {
    k0 = r32(1.35733652); k1 = r32(-0.00915799); k2 = r32(-1.1513021); k3 = r32(-0.50559606); k4 = r32(0.00692167);
    wl = r32(-0.0041960863); wm = r32(-0.7034186147); ws = r32(1.707614701);
  }

  let S = add(add(add(add(k0, mul(k1, a)), mul(k2, b)), mul(mul(k3, a), a)), mul(mul(k4, a), b));

  const k_l = add(mul(r32(0.3963377774), a), mul(r32(0.2158037573), b));
  const k_m = sub(mul(r32(-0.1055613458), a), mul(r32(0.0638541728), b));
  const k_s = sub(mul(r32(-0.0894841775), a), mul(r32(1.291485548), b));

  const l_ = add(1, mul(S, k_l));
  const m_ = add(1, mul(S, k_m));
  const s_ = add(1, mul(S, k_s));

  const l = mul(mul(l_, l_), l_);
  const m = mul(mul(m_, m_), m_);
  const s = mul(mul(s_, s_), s_);

  const l_dS = mul(mul(mul(3, k_l), l_), l_);
  const m_dS = mul(mul(mul(3, k_m), m_), m_);
  const s_dS = mul(mul(mul(3, k_s), s_), s_);

  const l_dS2 = mul(mul(mul(6, k_l), k_l), l_);
  const m_dS2 = mul(mul(mul(6, k_m), k_m), m_);
  const s_dS2 = mul(mul(mul(6, k_s), k_s), s_);

  const f = add(add(mul(wl, l), mul(wm, m)), mul(ws, s));
  const f1 = add(add(mul(wl, l_dS), mul(wm, m_dS)), mul(ws, s_dS));
  const f2 = add(add(mul(wl, l_dS2), mul(wm, m_dS2)), mul(ws, s_dS2));

  return sub(S, div(mul(f, f1), sub(mul(f1, f1), mul(mul(0.5, f), f2))));
}

function findCusp(a: number, b: number): [number, number] {
  const S = computeMaxSaturation(a, b);
  const [r, g, bl] = oklabToLinearSrgb(1, mul(S, a), mul(S, b));
  const L = r32(Math.cbrt(div(1, okMax(r, okMax(g, bl)))));
  return [L, mul(L, S)];
}

function findGamutIntersection(a: number, b: number, L1: number, C1: number, L0: number, cusp: [number, number]): number {
  const cL = cusp[0];
  const cC = cusp[1];
  let t: number;
  if (sub(mul(sub(L1, L0), cC), mul(sub(cL, L0), C1)) <= 0) {
    t = div(mul(cC, L0), add(mul(C1, cL), mul(cC, sub(L0, L1))));
  } else {
    t = div(mul(cC, sub(L0, 1)), add(mul(C1, sub(cL, 1)), mul(cC, sub(L0, L1))));

    const dL = sub(L1, L0);
    const dC = C1;
    const k_l = add(mul(r32(0.3963377774), a), mul(r32(0.2158037573), b));
    const k_m = sub(mul(r32(-0.1055613458), a), mul(r32(0.0638541728), b));
    const k_s = sub(mul(r32(-0.0894841775), a), mul(r32(1.291485548), b));

    const l_dt = add(dL, mul(dC, k_l));
    const m_dt = add(dL, mul(dC, k_m));
    const s_dt = add(dL, mul(dC, k_s));

    const L = add(mul(L0, sub(1, t)), mul(t, L1));
    const C = mul(t, C1);
    const l_ = add(L, mul(C, k_l));
    const m_ = add(L, mul(C, k_m));
    const s_ = add(L, mul(C, k_s));
    const l = mul(mul(l_, l_), l_);
    const m = mul(mul(m_, m_), m_);
    const s = mul(mul(s_, s_), s_);

    const ldt = mul(mul(mul(3, l_dt), l_), l_);
    const mdt = mul(mul(mul(3, m_dt), m_), m_);
    const sdt = mul(mul(mul(3, s_dt), s_), s_);
    const ldt2 = mul(mul(mul(6, l_dt), l_dt), l_);
    const mdt2 = mul(mul(mul(6, m_dt), m_dt), m_);
    const sdt2 = mul(mul(mul(6, s_dt), s_dt), s_);

    const rr = sub(dot3(W_R, l, m, s), 1);
    const rr1 = dot3(W_R, ldt, mdt, sdt);
    const rr2 = dot3(W_R, ldt2, mdt2, sdt2);
    const u_r = div(rr1, sub(mul(rr1, rr1), mul(mul(0.5, rr), rr2)));
    let t_r = mul(-rr, u_r);

    const gg = sub(dot3(W_G, l, m, s), 1);
    const gg1 = dot3(W_G, ldt, mdt, sdt);
    const gg2 = dot3(W_G, ldt2, mdt2, sdt2);
    const u_g = div(gg1, sub(mul(gg1, gg1), mul(mul(0.5, gg), gg2)));
    let t_g = mul(-gg, u_g);

    const bb = sub(dot3(W_B, l, m, s), 1);
    const bb1 = dot3(W_B, ldt, mdt, sdt);
    const bb2 = dot3(W_B, ldt2, mdt2, sdt2);
    const u_b = div(bb1, sub(mul(bb1, bb1), mul(mul(0.5, bb), bb2)));
    let t_b = mul(-bb, u_b);

    t_r = u_r >= 0 ? t_r : OK_FLT_MAX;
    t_g = u_g >= 0 ? t_g : OK_FLT_MAX;
    t_b = u_b >= 0 ? t_b : OK_FLT_MAX;

    t = add(t, okMin(t_r, okMin(t_g, t_b)));
  }
  return t;
}

function toeInv(x: number): number {
  const k1 = r32(0.206);
  const k2 = r32(0.03);
  const k3 = div(add(1, k1), add(1, k2));
  return div(add(mul(x, x), mul(k1, x)), mul(k3, add(x, k2)));
}

function getSTMid(a: number, b: number): [number, number] {
  const sE1 = add(add(r32(-4.24894561), mul(r32(5.38770819), b)), mul(r32(4.69891013), a));
  const sE2 = add(sub(r32(-2.13704948), mul(r32(10.02301043), b)), mul(a, sE1));
  const sE3 = add(add(r32(-2.19557347), mul(r32(1.75198401), b)), mul(a, sE2));
  const S = add(r32(0.11516993), div(1, add(add(r32(7.4477897), mul(r32(4.1590124), b)), mul(a, sE3))));

  const tE1 = sub(add(r32(0.00299215), mul(r32(-0.45399568), b)), mul(r32(0.14661872), a));
  const tE2 = add(add(r32(-0.27087943), mul(r32(0.6122399), b)), mul(a, tE1));
  const tE3 = add(add(r32(0.40370612), mul(r32(0.90148123), b)), mul(a, tE2));
  const T = add(r32(0.11239642), div(1, add(sub(r32(1.6132032), mul(r32(0.68124379), b)), mul(a, tE3))));

  return [S, T];
}

function getCs(L: number, a: number, b: number): [number, number, number] {
  const cusp = findCusp(a, b);
  const cL = cusp[0];
  const cC = cusp[1];
  const C_max = findGamutIntersection(a, b, L, 1, L, cusp);
  const S_max = div(cC, cL);
  const T_max = div(cC, sub(1, cL));
  const k = div(C_max, okMin(mul(L, S_max), mul(sub(1, L), T_max)));

  const ST = getSTMid(a, b);
  const C_a = mul(L, ST[0]);
  const C_b = mul(sub(1, L), ST[1]);
  const C_a4 = mul(mul(mul(C_a, C_a), C_a), C_a);
  const C_b4 = mul(mul(mul(C_b, C_b), C_b), C_b);
  const C_mid = mul(mul(r32(0.9), k), r32(Math.sqrt(r32(Math.sqrt(div(1, add(div(1, C_a4), div(1, C_b4))))))));

  const D_a = mul(L, r32(0.4));
  const D_b = mul(sub(1, L), r32(0.8));
  const C_0 = r32(Math.sqrt(div(1, add(div(1, mul(D_a, D_a)), div(1, mul(D_b, D_b))))));

  return [C_0, C_mid, C_max];
}

/** OKHSL → sRGB（不夹取、不管 alpha；`l == 1` / `l == 0` 两支先短路，与原文同）。 */
function okhslToSrgb(h: number, s: number, l: number): [number, number, number] {
  if (l === 1) return [1, 1, 1];
  if (l === 0) return [0, 0, 0];
  const a_ = r32(Math.cos(mul(mul(2, OK_PI), h)));
  const b_ = r32(Math.sin(mul(mul(2, OK_PI), h)));
  const L = toeInv(l);
  const [C_0, C_mid, C_max] = getCs(L, a_, b_);
  const mid = r32(0.8);
  const mid_inv = r32(1.25);
  let C: number, t: number, k_1: number, k_2: number;
  if (s < mid) {
    t = mul(mid_inv, s);
    k_1 = mul(mid, C_0);
    k_2 = sub(1, div(k_1, C_mid));
    C = div(mul(t, k_1), sub(1, mul(k_2, t)));
  } else {
    t = div(sub(s, mid), sub(1, mid));
    const k_0 = C_mid;
    k_1 = div(mul(mul(mul(mul(sub(1, mid), C_mid), C_mid), mid_inv), mid_inv), C_0);
    k_2 = sub(1, div(k_1, sub(C_max, C_mid)));
    C = add(k_0, div(mul(t, k_1), sub(1, mul(k_2, t))));
  }
  const [lr, lg, lb] = oklabToLinearSrgb(L, mul(C, a_), mul(C, b_));
  return [srgbTransfer(lr), srgbTransfer(lg), srgbTransfer(lb)];
}

/** RGB → HSV（Godot `Color::to_hsv`）：delta 在容差内给 h=s=0，saturation 除的是 max 不是 1。 */
function toHsv(c: GColor): [number, number, number] {
  const min = Math.min(c.r, c.g, c.b);
  const max = Math.max(c.r, c.g, c.b);
  const delta = sub(max, min);
  let h = 0;
  if (delta > CMP_EPS) {
    if (max === c.r) h = add(div(sub(c.g, c.b), delta), c.g < c.b ? 6 : 0);
    else if (max === c.g) h = add(div(sub(c.b, c.r), delta), 2);
    else h = add(div(sub(c.r, c.g), delta), 4);
    h = div(h, 6);
    if (h < 0) h = add(h, 1);
  }
  const s = max > CMP_EPS ? div(delta, max) : 0;
  return [h, s, max];
}

/** HSV → RGB（Godot `Color::from_hsv`）：扇区号要按 6 取模。 */
function fromHsv(h: number, s: number, v: number, a: number): Variant {
  const hh = mul(h, 6);
  const i = Math.floor(hh);
  const f = r32(hh - i);
  const p = mul(v, sub(1, s));
  const q = mul(v, sub(1, mul(f, s)));
  const t = mul(v, sub(1, mul(sub(1, f), s)));
  switch (((i % 6) + 6) % 6) {
    case 0:
      return color(v, t, p, a);
    case 1:
      return color(q, v, p, a);
    case 2:
      return color(p, v, t, a);
    case 3:
      return color(p, q, v, a);
    case 4:
      return color(t, p, v, a);
    default:
      return color(v, p, q, a);
  }
}

const HEX_DIGITS = "0123456789abcdef";

/** 整数的十六进制（幅值），按位取模拼。 */
function hexMag(v: number): string {
  if (v <= 0) return "0";
  let out = "";
  let n = v;
  while (n > 0) {
    out = HEX_DIGITS.charAt(n % 16) + out;
    n = Math.floor(n / 16);
  }
  return out;
}

/** `x.toString(16)` 的等价实现 —— 整数的 `toString(radix)` 在静态编译目标上没有 lowering。口径照 JS 原样：0–255 给两位，负数给符号 + 幅值。 */
function hexByte(v: number): string {
  if (v < 0) return `-${hexMag(-v)}`;
  if (v > 255) return hexMag(v);
  return HEX_DIGITS.charAt((v >> 4) & 0xf) + HEX_DIGITS.charAt(v & 0xf);
}

/** 字节属性读（`c.r8`）：`round(分量*255)` 后夹到 0..255，而 **nan 给 -2147483648**、`inf` → 255、`-inf` → 0。 */
function byteOf(n: number): number {
  if (Number.isNaN(n)) return -2147483648;
  const scaled = r32(n * 255);
  const v = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new GodotRuntimeError("color-arity", `Invalid call to function '${who}' in base 'Color'. Expected ${n} argument(s).`);
  }
}

function colArg(args: Variant[], i: number, who: string): GColor {
  const a = args[i];
  // Color 位上引擎收 Color / int（按打包值）/ String（按 html），实测 `c.blend(1)`、`c.clamp("a", Color(...))` 都算得出值（`tmp/probe-argtype/values.mts`）
  const folded = a === undefined ? null : tryColorSlot(a);
  const v = folded === null ? null : asColor(folded);
  if (!v) throw new UnsupportedError("color-arg", `Color.${who} 的第 ${i + 1} 个实参需要 Color`);
  return v;
}

/** 打包那一路（`to_rgba32` / `to_*64`）与属性读 `c.r8` **不是同一条口径**：`round(分量*标度)` 之后只留低 8/16 位（越界是**回绕**而不是夹紧），
 *  非有限值（nan / ±inf）一律给 0。读数在语料 297 的 C32 / C64 两组：`Color(-0.2, 1.5, NAN, 0.5)` 的 rgba32 四字节是 `205,127,0,128`，
 *  而同一支的 `r8` / `g8` 是 `0` / `255`（夹紧那一条）。 */
const packChannel = (n: number, scale: number, mask: number): number => {
  if (!Number.isFinite(n)) return 0;
  const scaled = r32(n * scale);
  return (scaled < 0 ? -Math.round(-scaled) : Math.round(scaled)) & mask;
};

/** 打包成 int32 再按无符号读回（交出去的是 64 位 int）。 */
const pack8 = (n: number): number => packChannel(n, 255, 0xff);
const pack16 = (n: number): number => packChannel(n, 65535, 0xffff);

const pack32 = (bytes: number[]): Variant => {
  let out = 0n;
  for (const b of bytes) out = (out << 8n) | BigInt(b);
  return V.int(out);
};

const pack64 = (shorts: number[]): Variant => {
  let out = 0n;
  for (const s of shorts) out = (out << 16n) | BigInt(s);
  return V.int(out);
};

/** Color 的方法面：Godot 里没有的成员（下面那一串 case）一律响亮报缺，别按文档印象实现。 */
export function colorMethod(c: GColor, name: string, args: Variant[]): Variant {
  switch (name) {
    case "to_html": {
      if (args.length > 1) arity(args, 1, "to_html");
      // 有限分量走 `byteOf` 那条**夹紧**（`Color(1.0039, 0.49999, 0.5000001, 0.99999).to_html()` 给 `ff7f80ff`），
      // 非有限分量（nan / ±inf）一律 `00`（`Color(INF, -INF, 0.25, 1).to_html()` 给 `000040ff`，S311）
      const hex = (n: number) => hexByte(Number.isFinite(n) ? byteOf(n) : 0);
      const body = hex(c.r) + hex(c.g) + hex(c.b);
      // 那一位的声明是 `bool uppercase`：int / float 按 `≠ 0` 折（`0` / `0.0` / `-0.0` 给小写体、`1` / `2` / `0.5` 给带 alpha），
      // 其余形引擎在解析期就拒（`tmp/probe-argtype/html.txt`），所以这里一律响亮抛、不按 JS 的真值编一个值出来。
      const withAlpha = args.length === 0 ? true : uppercaseSlot(args[0]!);
      return V.str(withAlpha ? body + hex(c.a) : body);
    }
    case "html":
      // 静态那四支在实例上也能调，结果与静态一字一样（语料 298 的 S / F 行；元数先按引擎那句拦）
      arity(args, 1, "html");
      return colorStatic("html", args);
    case "html_is_valid":
      arity(args, 1, "html_is_valid");
      return colorStatic("html_is_valid", args);
    case "from_string":
      arity(args, 2, "from_string");
      return colorStatic("from_string", args);
    case "from_rgbe9995":
      // 静态那一支在实例上同样调得出，三格读数（int / float / bool 各一）与静态一字一样（`tmp/probe-argtype/values.txt`）
      return colorStatic("from_rgbe9995", args);
    case "from_hsv":
      // 声明是 `from_hsv(h, s, v, alpha = 1.0)`，元数不对时运行期那句报 4（S305 ③）
      if (args.length < 3 || args.length > 4) arity(args, 4, "from_hsv");
      return colorStatic("from_hsv", args);
    case "from_ok_hsl":
      if (args.length < 3 || args.length > 4) arity(args, 4, "from_ok_hsl");
      return colorStatic("from_ok_hsl", args);
    case "hex":
      arity(args, 1, "hex");
      return fromHex32(intBits(args[0], "hex", 32));
    case "hex64":
      arity(args, 1, "hex64");
      return fromHex64(intBits(args[0], "hex64", 64));
    case "blend": {
      // `p_with` 叠在接收者**之上**（over）：alpha 不守恒时各通道按 `(src*srcA + (1-srcA)*dstA*dst) / outA`，outA 为 0 就全给零（S309）
      arity(args, 1, "blend");
      const s = colArg(args, 0, "blend");
      const oa = add(s.a, mul(sub(1, s.a), c.a));
      if (oa === 0) return color(0, 0, 0, 0);
      const k = sub(1, s.a);
      const ch = (sc: number, dc: number) => div(add(mul(sc, s.a), mul(k, mul(dc, c.a))), oa);
      return color(ch(s.r, c.r), ch(s.g, c.g), ch(s.b, c.b), oa);
    }
    case "to_rgba32":
      arity(args, 0, "to_rgba32");
      return pack32([pack8(c.r), pack8(c.g), pack8(c.b), pack8(c.a)]);
    case "to_argb32":
      arity(args, 0, "to_argb32");
      return pack32([pack8(c.a), pack8(c.r), pack8(c.g), pack8(c.b)]);
    case "to_abgr32":
      arity(args, 0, "to_abgr32");
      return pack32([pack8(c.a), pack8(c.b), pack8(c.g), pack8(c.r)]);
    case "to_rgba64":
      arity(args, 0, "to_rgba64");
      return pack64([pack16(c.r), pack16(c.g), pack16(c.b), pack16(c.a)]);
    case "to_argb64":
      arity(args, 0, "to_argb64");
      return pack64([pack16(c.a), pack16(c.r), pack16(c.g), pack16(c.b)]);
    case "to_abgr64":
      arity(args, 0, "to_abgr64");
      return pack64([pack16(c.a), pack16(c.b), pack16(c.g), pack16(c.r)]);
    case "get_luminance":
      // 三项之和是**右结合**：`t1 + (t2 + t3)`（`Color(1.0039, 0.49999, 0.5000001, …)` 引擎给 `0.60712200403214`，左结合给 `0.60712206363678`；S311）
      arity(args, 0, "get_luminance");
      return V.float(add(mul(0.2126, c.r), add(mul(0.7152, c.g), mul(0.0722, c.b))));
    case "lightened": {
      arity(args, 1, "lightened");
      const w = numArg(args[0], "lightened");
      return color(
        add(c.r, mul(sub(1, c.r), w)),
        add(c.g, mul(sub(1, c.g), w)),
        add(c.b, mul(sub(1, c.b), w)),
        c.a,
      );
    }
    case "darkened": {
      arity(args, 1, "darkened");
      const w = numArg(args[0], "darkened");
      // 引擎是乘性的 `分量 * (1 - amount)`：`-0.0` 保住号、`inf` 不被减成 nan（S311）
      const k = sub(1, w);
      return color(
        mul(c.r, k),
        mul(c.g, k),
        mul(c.b, k),
        c.a,
      );
    }
    case "inverted":
      arity(args, 0, "inverted");
      return color(sub(1, c.r), sub(1, c.g), sub(1, c.b), c.a);
    case "lerp": {
      arity(args, 2, "lerp");
      const o = colArg(args, 0, "lerp");
      const w = numArg(args[1], "lerp");
      return color(
        add(c.r, mul(sub(o.r, c.r), w)),
        add(c.g, mul(sub(o.g, c.g), w)),
        add(c.b, mul(sub(o.b, c.b), w)),
        add(c.a, mul(sub(o.a, c.a), w)),
      );
    }
    case "clamp": {
      // 形参是 `clamp(min = Color(0,0,0,0), max = Color(1,1,1,1))`，0 支与 1 支都收（S305 的元数表：上界 2）
      if (args.length > 2) arity(args, 2, "clamp");
      const lo = args.length === 0 ? new GColor(0, 0, 0, 0) : colArg(args, 0, "clamp");
      const hi = args.length < 2 ? new GColor(1, 1, 1, 1) : colArg(args, 1, "clamp");
      return color(clamp(c.r, lo.r, hi.r), clamp(c.g, lo.g, hi.g), clamp(c.b, lo.b, hi.b), clamp(c.a, lo.a, hi.a));
    }
    case "linear_to_srgb": {
      arity(args, 0, "linear_to_srgb");
      const f = (n: number) => (n < r32(0.0031308) ? mul(n, 12.92) : sub(mul(r32(Math.pow(n, r32(1 / 2.4))), 1.055), 0.055));
      return color(f(c.r), f(c.g), f(c.b), c.a);
    }
    case "srgb_to_linear": {
      arity(args, 0, "srgb_to_linear");
      const f = (n: number) => (n < r32(0.04045) ? div(n, 12.92) : r32(Math.pow(div(add(n, 0.055), 1.055), 2.4)));
      return color(f(c.r), f(c.g), f(c.b), c.a);
    }
    case "is_equal_approx": {
      arity(args, 1, "is_equal_approx");
      const o = colArg(args, 0, "is_equal_approx");
      return V.bool(
        approxEq(c.r, o.r) && approxEq(c.g, o.g) && approxEq(c.b, o.b) && approxEq(c.a, o.a),
      );
    }
    case "clamped":
    case "is_finite":
    case "is_zero_approx":
    case "mix":
    case "blend_rgb":
    case "get_hsv":
    case "snap":
    case "to_rgba8":
    case "to_argb8":
    case "to_abgr8":
    case "to_bgra8":
    case "to_bgra32":
      throw new GodotRuntimeError("color-method", `Invalid call. Nonexistent function '${name}' in base 'Color'.`);
    default:
      throw new UnsupportedError("color-method", `Color.${name}() 未实现`);
  }
}

type ColorSlot = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const SLOTS: Record<string, ColorSlot> = {
  r: 0,
  g: 1,
  b: 2,
  a: 3,
  h: 4,
  s: 5,
  v: 6,
  r8: 7,
  g8: 8,
  b8: 9,
  a8: 10,
};

function colorSlot(key: Variant): ColorSlot | null {
  if (key.t === Tag.INT) {
    const i = intToNum(key.v as IntPayload);
    return i === 0 || i === 1 || i === 2 || i === 3 ? (i as ColorSlot) : null;
  }
  if (key.t === Tag.STRING || key.t === Tag.STRING_NAME) {
    const s = SLOTS[key.v as string];
    return s === undefined ? null : s;
  }
  return null;
}

function channelOf(c: GColor, slot: ColorSlot): number {
  return slot === 0 ? c.r : slot === 1 ? c.g : slot === 2 ? c.b : c.a;
}

function withChannel(c: GColor, slot: ColorSlot, value: number): Variant {
  return color(
    slot === 0 ? value : c.r,
    slot === 1 ? value : c.g,
    slot === 2 ? value : c.b,
    slot === 3 ? value : c.a,
  );
}

/** 读分量：`c[0]`/`c["r"]` 给 float32、`c["h"]` 给派生值、`c["r8"]` 给 int。 */
export function colorRead(c: GColor, key: Variant, via: "prop" | "index" | "read"): Variant {
  const slot = colorSlot(key);
  if (slot === null) vecFailKey(key, via, "Color");
  const s = slot as ColorSlot;
  if (s <= 3) return V.float(channelOf(c, s));
  if (s <= 6) {
    const [h, sv, v] = toHsv(c);
    return V.float(s === 4 ? h : s === 5 ? sv : v);
  }
  const bytes = [byteOf(c.r), byteOf(c.g), byteOf(c.b), byteOf(c.a)];
  return V.int(bytes[s - 7] as number);
}

/** 下标读：Color 只有 0..3 那一形合法，其余报 `Invalid access of index …`。 */
export function colorReadIndex(c: GColor, key: Variant): Variant {
  return colorRead(c, key, "read");
}

/** 写分量：r/g/b/a **不做夹取**（`c.r = 2.7` 存的就是 2.7），实参只收整数族；h/s/v 是「转 HSV → 换那一格 → 转回 RGB」，r8 一族写的是字节。 */
export function colorWrite(c: GColor, key: Variant, value: Variant, via: "prop" | "index"): Variant {
  const slot = colorSlot(key);
  if (slot === null) vecFailKey(key, via, "Color", value);
  const s = slot as ColorSlot;
  if (value.t !== Tag.INT && value.t !== Tag.FLOAT) vecFailKey(key, via, "Color", value);
  const n = numArg(value, "分量写入");
  if (s <= 3) return withChannel(c, s, n);
  if (s <= 6) {
    const [h, sv, v] = toHsv(c);
    return fromHsv(s === 4 ? n : h, s === 5 ? n : sv, s === 6 ? n : v, c.a);
  }
  if (n < 0 || n > 255 || !Number.isInteger(n)) {
    throw new UnsupportedError(
      "color-byte",
      `Color 的 r8/g8/b8/a8 写入只实现了 0..255 的整数（收到 ${n}，越界口径未探针）`,
    );
  }
  return withChannel(c, (s - 7) as ColorSlot, n / 255);
}
