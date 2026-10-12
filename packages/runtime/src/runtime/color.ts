import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, int64ParamBig, tagName, type IntPayload, type Variant } from "./tags";
import { CMP_EPS, approxEq, clamp, vecFailKey } from "./vector2";
import { COLOR_NAMED } from "./color-named";

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

/** 数值实参：int/float 收成 number，其余响亮报错。 */
/** 数值实参：float 在调用边界上折回 `real_t`（S313，与 Vector 两支同一条），int 收成 number，其余响亮报错。 */
function numArg(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return r32(v.v as number);
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  throw new UnsupportedError("color-arg", `Color.${who} 需要数值实参，收到 ${tagName(v.t)}`);
}

function strArg(v: Variant | undefined, who: string): string {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return v.v as string;
  throw new UnsupportedError("color-arg", `Color.${who} 需要字符串实参，收到 ${tagName(v.t)}`);
}

/** `hex` / `hex64` 的实参：只收 int，按无符号截到低 32 / 64 位（实测 `Color.hex(-1)` 与 `Color.hex(0xFFFFFFFF)` 同值、`Color.hex(4294967296)` 给全零）。 */
function intBits(v: Variant | undefined, who: string, bits: number): bigint {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t !== Tag.INT) throw new UnsupportedError("color-arg", `Color.${who} 需要 int 实参，收到 ${tagName(v.t)}`);
  return intToBig(v.v as IntPayload) & ((1n << BigInt(bits)) - 1n);
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

/** `Color.` 上的静态成员：常量名（`Color.RED`、`Color.TRANSPARENT`）与 `html` / `from_string` / `from_hsv` 三个静态函数，名单外响亮报缺。 */
export function colorStatic(name: string, args: Variant[] = []): Variant {
  if (args.length > 0 || name === "html" || name === "from_string" || name === "from_hsv") {
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
        const fb = asColor(args[1] as Variant);
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
  const v = a === undefined ? null : asColor(a);
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
      const withAlpha = args.length === 0 ? true : Boolean((args[0] as Variant).v);
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
    case "from_hsv":
      // 声明是 `from_hsv(h, s, v, alpha = 1.0)`，元数不对时运行期那句报 4（S305 ③）
      if (args.length < 3 || args.length > 4) arity(args, 4, "from_hsv");
      return colorStatic("from_hsv", args);
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

/** Color 没有大小顺序（`c1 < c2` 在 Godot 是 Parse Error），所以比较一律响亮报缺。 */
export function colorCmp(): never {
  throw new UnsupportedError("color-cmp", "Color 没有大小比较（实测 `<`/`>` 在 Godot 是 Parse Error）");
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
