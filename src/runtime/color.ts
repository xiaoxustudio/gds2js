import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { CMP_EPS, approxEq, vecFailKey } from "./vector2";
import { COLOR_NAMED } from "./color-named";

/**
 * 颜色 —— 值类型这一族的最后一个（逐条探针实测，Godot 4.6.3）：
 *   `typeof(Color(1,0,0))` → **20**、`Color(0.1,0.2,0.3).r` → `0.10000000149012`（分量是 float32）、
 *   `var d = c; d.b = 1` 不动 `c`（值语义）、能当字典键、`Array[Color]` 的默认元素是 `(0.0, 0.0, 0.0, 1.0)`。
 *
 * 三个只属于 Color 的口径（都和 Vector2/3 不同，别照抄）：
 *  - **打印用 4 位小数**且**保留 -0.0 的负号**：`Color(1.0/3.0, 1e-5, -1e-5, -0.0)` →
 *    `(0.3333, 0.0, -0.0, -0.0)`（Vector2 的 -0.0 会印成 `0.0`）；大整数分量仍走 15/17 位那条路。
 *  - **`<`/`>` 根本没有**（实测是 Parse Error），所以比较这里响亮报缺而不是给个字典序。
 *  - **一元负号是「反色」**：`-Color(1,-2,0,0.5)` → `(0.0, 3.0, 1.0, 0.5)`，即 `1-x` 且 **alpha 原样保留**，
 *    与 `inverted()` 同式，不是分量取负。
 *
 * `h/s/v` 是可读写派生属性（实测 `c.h = 0.5` 会按 HSV 重算 rgb），`r8/g8/b8/a8` 是 0..255 的字节属性。
 */
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

/** 数值实参：int/float 收成 number，其余响亮报错（实测 `Color("1",2,3)` 是解析期类型错）。 */
function numArg(v: Variant | undefined, who: string): number {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.FLOAT) return v.v as number;
  if (v.t === Tag.INT) return intToNum(v.v as IntPayload);
  throw new UnsupportedError("color-arg", `Color.${who} 需要数值实参，收到 ${tagName(v.t)}`);
}

function strArg(v: Variant | undefined, who: string): string {
  if (v === undefined) throw new UnsupportedError("color-arity", `Color.${who} 缺少实参`);
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return v.v as string;
  throw new UnsupportedError("color-arg", `Color.${who} 需要字符串实参，收到 ${tagName(v.t)}`);
}

/** 解析失败时的兜底色：`Color(String)` 与 `Color.html` 都用 (0,0,0,1)（实测 `Color("notacolor")`）。 */
const ZERO_COLOR = (): Variant => color(0, 0, 0, 1);

/** 名字查表用的键：下划线可有可无、大小写不敏感（实测 "rebeccapurple" / "REBECCA_PURPLE" 同中）。 */
function namedOf(s: string): number | undefined {
  const key = s.toLowerCase().replace(/_/g, "");
  for (const name in COLOR_NAMED) {
    if (name.replace(/_/g, "") === key) return COLOR_NAMED[name];
  }
  return undefined;
}

/** 名字表里的 0xAARRGGBB → Color（实测常量面与 Color.from_string 完全一致）。 */
function packedColor(packed: number): Variant {
  const b = (i: number) => Number((BigInt(packed) >> BigInt(i * 8)) & 0xffn);
  return color(b(2) / 255, b(1) / 255, b(0) / 255, b(3) / 255);
}

/**
 * 十六进制解析：`#` 可省，长度 3（`f00`→`ff0000`）/ 6（RGB）/ 8（RGBA，**alpha 在后**）三种，
 * 其余长度或非法字符一律走兜底（实测 `Color("0x80ff0000")` → `(0.0, 0.0, 0.0, 1.0)`）。
 * `names` 为 false 时不查名字表 —— 这是 `Color.html` 与 `Color(String)` 的唯一区别
 * （实测 `Color.html("red")` → `(0.0, 0.0, 0.0, 1.0)`，而 `Color("red")` → `(1.0, 0.0, 0.0, 1.0)`）。
 */
function parseColor(s: string, names: boolean): Variant | null {
  // 名字表只在认名字的口子生效：实测 Color("red") 给红色，而 Color.html("red") 给兜底色
  if (names) {
    const packed = namedOf(s);
    if (packed !== undefined) return packedColor(packed);
  }
  let h = s[0] === "#" ? s.slice(1) : s;
  if (h.length === 3) h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  if (h.length !== 6 && h.length !== 8) return null;
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  const byte = (i: number) => parseInt(h.slice(i, i + 2), 16);
  const a = h.length === 8 ? byte(6) : 255;
  return color(byte(0) / 255, byte(2) / 255, byte(4) / 255, a / 255);
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
    throw new UnsupportedError("color-arg", `Color() 单参只收 Color 或字符串，收到 ${tagName(a.t)}`);
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

/**
 * `Color.` 上的静态成员：常量名（`Color.RED`、`Color.TRANSPARENT`）与三个静态函数
 * （`html` / `from_string` / `from_hsv`）。实测**没有** `CLAMPED`、`is_zero_approx` 这类，
 * 名单外的名字一律响亮报缺。
 */
export function colorStatic(name: string, args: Variant[] = []): Variant {
  if (args.length > 0 || name === "html" || name === "from_string" || name === "from_hsv") {
    switch (name) {
      case "html": {
        // 实测 `Color.html("f00")` → (1,0,0,1)、`Color.html("80ff0000")` → (0.502,1,0,0)（RGBA）
        if (args.length !== 1) {
          throw new UnsupportedError("color-arity", `Color.html() 只收 1 个字符串（收到 ${args.length} 个）`);
        }
        return parseColor(strArg(args[0], "html"), false) ?? ZERO_COLOR();
      }
      case "from_string": {
        // 实测必须两个参数（少一个就是解析期报错），第二个是兜底色
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
        // 实测 3 参 alpha 补 1、4 参照收：from_hsv(0.5,0.25,0.5) → (0.375, 0.5, 0.5, 1.0)
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

/** HSV → RGB（Godot `Color::from_hsv`）。实测 `from_hsv(1,1,1)` → `(1,0,0)`：扇区号要按 6 取模。 */
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

/**
 * 字节属性读（`c.r8`）。实测口径：`round(分量*255)` 后夹到 0..255，
 * 而 **nan 给 -2147483648**（Godot 那边过了一次 int32 转换）、`inf` → 255、`-inf` → 0。
 */
function byteOf(n: number): number {
  if (Number.isNaN(n)) return -2147483648;
  // 乘法本身也留在 float32 里：实测 0.7 的字节是 **179** 而不是 178 —— double 算 0.7f*255 得
  // 178.49999696 会舍到 178，而 float32 把它表成精确的 178.5，半数远离零进位就是 179。
  // to_html / to_rgba32 / r8 三个口子共用这一条。
  const scaled = r32(n * 255);
  const v = scaled < 0 ? -Math.round(-scaled) : Math.round(scaled);
  if (v < 0) return 0;
  if (v > 255) return 255;
  return v;
}

function arity(args: Variant[], n: number, who: string): void {
  if (args.length !== n) {
    throw new UnsupportedError("color-arity", `Color.${who} 需要 ${n} 个实参（收到 ${args.length} 个）`);
  }
}

function colArg(args: Variant[], i: number, who: string): GColor {
  const a = args[i];
  const v = a === undefined ? null : asColor(a);
  if (!v) throw new UnsupportedError("color-arg", `Color.${who} 的第 ${i + 1} 个实参需要 Color`);
  return v;
}

/** 打包成 int32 再按无符号读回（实测 `Color(1,1,1,1).to_rgba32()` → 4294967295，是 64 位 int）。 */
const pack32 = (bytes: number[]): Variant => {
  let out = 0n;
  for (const b of bytes) out = (out << 8n) | BigInt(b & 0xff);
  return V.int(out);
};

/**
 * Color 的方法面。**实测存在**：`to_html([with_alpha])`、`to_rgba32`、`to_argb32`、`to_abgr32`、
 * `get_luminance`、`lightened`、`darkened`、`inverted`、`lerp`、`is_equal_approx`。
 * **实测不存在**（问到即报缺，别按文档印象实现）：`clamped`、`is_finite`、`is_zero_approx`、`mix`、
 * `blend_rgb`、`to_rgba8`/`to_argb8`/`to_abgr8`/`to_bgra8`、`to_bgra32`、`get_hsv`、`snap`、
 * `Color.from_rgba32`。
 */
export function colorMethod(c: GColor, name: string, args: Variant[]): Variant {
  switch (name) {
    case "to_html": {
      // 实测：无参时 alpha 为 1 就省掉两位，否则总是 8 位；参数是布尔（true 强制带 alpha）
      if (args.length > 1) {
        throw new UnsupportedError("color-arity", `Color.to_html() 最多 1 个实参（收到 ${args.length} 个）`);
      }
      const hex = (n: number) => byteOf(n).toString(16).padStart(2, "0");
      const body = hex(c.r) + hex(c.g) + hex(c.b);
      // 实测 to_html() **默认就带** alpha（Color(0.6,0.4,0.2,1).to_html() → "996633ff"），
      // 只有显式 to_html(false) 才给 6 位
      const withAlpha = args.length === 0 ? true : Boolean((args[0] as Variant).v);
      return V.str(withAlpha ? body + hex(c.a) : body);
    }
    case "to_rgba32":
      arity(args, 0, "to_rgba32");
      return pack32([byteOf(c.r), byteOf(c.g), byteOf(c.b), byteOf(c.a)]);
    case "to_argb32":
      // 实测 Color(0.6,0.4,0.2,1).to_argb32() → 4288243251 = 0xFF996633
      arity(args, 0, "to_argb32");
      return pack32([byteOf(c.a), byteOf(c.r), byteOf(c.g), byteOf(c.b)]);
    case "to_abgr32":
      // 实测同色 to_abgr32() → 4281558681 = 0xFF336699
      arity(args, 0, "to_abgr32");
      return pack32([byteOf(c.a), byteOf(c.b), byteOf(c.g), byteOf(c.r)]);
    case "get_luminance":
      // 实测是 Rec.709 权重：(0.25,0.5,0.75) → 0.4649、(0.6,0.4,0.2) → 0.42808、灰 0.5 → 0.5
      arity(args, 0, "get_luminance");
      return V.float(add(add(mul(0.2126, c.r), mul(0.7152, c.g)), mul(0.0722, c.b)));
    case "lightened": {
      // 实测 `Color(0.6,0.4,0.2,1).lightened(0.5)` → `(0.8, 0.7, 0.6, 1.0)`：
      // 不是「分量加」也不是「夹到 1」，而是**向白插值**（amount 为负会往回走，(0.4, 0.1, -0.2)）
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
      // 实测同色 darkened(0.5) → `(0.3, 0.2, 0.1, 1.0)`：向黑插值，alpha 同样不动
      arity(args, 1, "darkened");
      const w = numArg(args[0], "darkened");
      return color(
        add(c.r, mul(sub(0, c.r), w)),
        add(c.g, mul(sub(0, c.g), w)),
        add(c.b, mul(sub(0, c.b), w)),
        c.a,
      );
    }
    case "inverted":
      // 实测 (0.6,0.4,0.2,0.3).inverted() → (0.4, 0.6, 0.8, 0.3)：1-分量、alpha 保留
      arity(args, 0, "inverted");
      return color(sub(1, c.r), sub(1, c.g), sub(1, c.b), c.a);
    case "lerp": {
      // 实测 (0.1,0.2,0.3,0.4).lerp((0.7,0.8,0.9,1), 0.333) → (0.2998, 0.3998, 0.4998, 0.5998)
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
    case "is_equal_approx": {
      // 实测与向量共用 CMP_EPSILON 那条相对容差：1 vs 1.000009 真、vs 1.00001 假、0.5 vs 0.500004 真
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
      throw new UnsupportedError("color-method", `Color.${name}() 实测不存在（4.6.3 探针）`);
    default:
      throw new UnsupportedError("color-method", `Color.${name}() 未实现`);
  }
}

/** 实测 Color 没有大小顺序（`c1 < c2` 是 Parse Error），所以比较一律响亮报缺。 */
export function colorCmp(): never {
  throw new UnsupportedError("color-cmp", "Color 没有大小比较（实测 `<`/`>` 在 Godot 是 Parse Error）");
}

/** 分量槽位：0..3 与 r/g/b/a；派生的 h/s/v 与字节族 r8/g8/b8/a8 各占一段。 */
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

/** 读分量：`c[0]`/`c["r"]` 给 float32、`c["h"]` 给派生值、`c["r8"]` 给 int（实测 `c["h"]` 可读）。 */
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

/** 下标读（实测 `c[4]` → `Invalid access of index '4' on a base object of type: 'Color'.`）。 */
export function colorReadIndex(c: GColor, key: Variant): Variant {
  return colorRead(c, key, "read");
}

/**
 * 写分量（实测 r/g/b/a **不做夹取**：`c.r = 2.7` 存的就是 2.7；int 实参可以，String 实参报错）。
 * h/s/v 的写法是「转 HSV → 换那一格 → 转回 RGB」（实测 `c.h = 0.5` 把 (0.1,0.2,0.3) 改成
 * (0.1, 0.3, 0.3)，`c.v = 0.5` 改成 (0.1667, 0.3333, 0.5)）；r8 写的是字节（实测 `c.r8 = 128` → 0.502）。
 */
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
  // 字节写入实测只在 0..255 内验过（`c.a8 = 64` → 0.251）；越界实参 Godot 侧怎么处理没探，响亮报缺
  if (n < 0 || n > 255 || !Number.isInteger(n)) {
    throw new UnsupportedError(
      "color-byte",
      `Color 的 r8/g8/b8/a8 写入只实现了 0..255 的整数（收到 ${n}，越界口径未探针）`,
    );
  }
  return withChannel(c, (s - 7) as ColorSlot, n / 255);
}
