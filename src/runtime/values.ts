import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, intToBig, intToNum, type IntPayload, type Variant } from "./tags";
import { GVector2 } from "./vector2";

/** 把 INT/FLOAT 变体收成裸 number（bigint 载荷按 Godot 的 double 精度损失折算）。 */
function numVal(v: Variant): number {
  return v.t === Tag.INT ? intToNum(v.v as IntPayload) : (v.v as number);
}

/**
 * Dictionary 键编码。
 * Godot 里 1（int）、1.0（float）、"1"（String）是三个不同的键（S14），
 * 而 JS 的 Map 会把 1 和 1.0 合并 —— 所以键必须带类型前缀。
 */
export function keyOf(v: Variant): string {
  switch (v.t) {
    case Tag.NIL:
      return "n:";
    case Tag.BOOL:
      return `b:${String(v.v)}`;
    case Tag.INT:
      return `i:${String(v.v)}`;
    case Tag.FLOAT:
      return `f:${String(v.v)}`;
    case Tag.STRING:
      return `s:${v.v as string}`;
    default:
      throw new UnsupportedError("dict-key-type", `${tagName(v.t)} 不能作为字典键（未实现）`);
  }
}

// ---------------------------------------------------------------- Array

/**
 * Godot 数组下标的唯一口径（056 实测）：**支持负数**（`a[-1]` 是最后一格，读写同规则），
 * 越界一律响亮报 `array-index` —— 尤其写越界，Godot 是 SCRIPT ERROR，**不会**像 JS 那样
 * 把数组撑长或挂一个 `-1` 属性上去（后者先前在 GArray.set 里是静默错）。
 */
export function arrIdx(i: number, len: number): number {
  const k = i < 0 ? i + len : i;
  if (k < 0 || k >= len) {
    throw new GodotRuntimeError("array-index", `数组索引越界: ${i}`);
  }
  return k;
}

export class GArray {
  private items: Variant[];

  constructor(items: Variant[] = []) {
    this.items = items;
  }

  static of(items: Variant[]): GArray {
    return new GArray(items);
  }

  size(): number {
    return this.items.length;
  }

  raw(): Variant[] {
    return this.items;
  }

  get(i: number): Variant {
    return this.items[arrIdx(i, this.items.length)]!;
  }

  set(i: number, v: Variant): void {
    this.items[arrIdx(i, this.items.length)] = v;
  }

  append(v: Variant): void {
    this.items.push(v);
  }

  /** 深拷贝：元素里的容器也要复制（S9 —— 赋值是共享，duplicate 才是拷贝） */
  duplicate(): GArray {
    return new GArray(this.items.map(deepCopy));
  }

  has(v: Variant): boolean {
    return this.items.some((x) => valueEq(x, v));
  }

  /** `+` 产生新数组，不修改原数组 */
  concat(other: GArray): GArray {
    return new GArray([...this.items, ...other.raw()]);
  }

  eq(other: GArray): boolean {
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => {
      const y = other.items[i];
      return y !== undefined && valueEq(x, y);
    });
  }

  sort(): void {
    if (this.items.length === 0) return;
    const allNum = this.items.every((x) => x.t === Tag.INT || x.t === Tag.FLOAT);
    const allStr = this.items.every((x) => x.t === Tag.STRING);
    if (!allNum && !allStr) {
      throw new UnsupportedError("array-sort-mixed", "混合类型数组排序（未实现）");
    }
    // 数值排序：int 载荷可能是 bigint，混着 `-` 会 TypeError；两边都可能是 bigint，
    // 用 number 减又会因 >2^53 相等而错排。所以先按「窄化到 number」的跨类型序，
    // 两个 int 之间再退回 bigint 精确比较。
    const cmp = allNum
      ? (a: Variant, b: Variant) =>
          a.t === Tag.INT && b.t === Tag.INT
            ? intToBig(a.v as IntPayload) < intToBig(b.v as IntPayload)
              ? -1
              : intToBig(a.v as IntPayload) > intToBig(b.v as IntPayload)
                ? 1
                : 0
            : numVal(a) - numVal(b)
      : (a: Variant, b: Variant) => strCmp(a.v as string, b.v as string);
    this.items = [...this.items].sort(cmp);
  }
}

// ---------------------------------------------------------------- Dictionary

export class GDict {
  private ks: Variant[] = [];
  private vs: Variant[] = [];
  private index = new Map<string, number>();

  size(): number {
    return this.ks.length;
  }

  /** 保持插入顺序（S15） */
  keys(): Variant[] {
    return [...this.ks];
  }

  /** 值按插入顺序，与 keys() 对应 */
  values(): Variant[] {
    return [...this.vs];
  }

  has(k: Variant): boolean {
    return this.index.has(keyOf(k));
  }

  get(k: Variant): Variant {
    const i = this.index.get(keyOf(k));
    if (i === undefined) return V.nil();
    return this.vs[i] ?? V.nil();
  }

  /**
   * 方括号读 `d[k]`（S 语义：Godot 对缺键**报错**，见 `Invalid access to property or key`），
   * 与 `.get(k)`（缺键返回 nil）区分开。装箱读与容器单态化的裸读都以此为准，二者必须一致。
   */
  getRequired(k: Variant): Variant {
    const i = this.index.get(keyOf(k));
    if (i === undefined) {
      throw new GodotRuntimeError("dict-key", `字典键不存在: ${show(k)}`);
    }
    return this.vs[i] as Variant;
  }

  set(k: Variant, v: Variant): void {
    const key = keyOf(k);
    const i = this.index.get(key);
    if (i === undefined) {
      this.index.set(key, this.ks.length);
      this.ks.push(k);
      this.vs.push(v);
    } else {
      this.vs[i] = v;
    }
  }

  duplicate(): GDict {
    const d = new GDict();
    for (let i = 0; i < this.ks.length; i++) {
      const k = this.ks[i];
      const v = this.vs[i];
      if (k !== undefined && v !== undefined) d.set(deepCopy(k), deepCopy(v));
    }
    return d;
  }

  eq(other: GDict): boolean {
    if (this.size() !== other.size()) return false;
    return this.ks.every((k) => valueEq(this.get(k), other.get(k)));
  }
}

function deepCopy(v: Variant): Variant {
  if (v.t === Tag.ARRAY) return V.array((v.v as GArray).duplicate());
  if (v.t === Tag.DICT) return V.dict((v.v as GDict).duplicate());
  return { t: v.t, v: v.v };
}

// ---------------------------------------------------------------- String

/** GDScript String 是 UTF-32，length 数码点，JS 是 UTF-16（S26） */
export function strLength(s: string): number {
  return [...s].length;
}

export function strAt(s: string, i: number): string {
  const chars = [...s];
  const c = chars[i];
  if (c === undefined) {
    throw new GodotRuntimeError("string-index", `字符串索引越界: ${i}`);
  }
  return c;
}

export function strSubstr(s: string, from: number, len: number): string {
  return [...s].slice(from, from + len).join("");
}

/**
 * Godot 的 to_upper / to_lower 走 **Unicode 简单映射**：一个码点映一个码点、长度不变
 * （探针实测 ß→ß、ﬁ→ﬁ、İ→i、ǳ→Ǳ、ǅ→Ǆ）。JS 的 toUpperCase/toLowerCase 走**兼容全映射**
 * （ß→SS、ﬁ→FI、İ→i̇、ǳ→DŽ），于是 `"ß".to_upper()` 会**静默**产出与 Godot 不同长度的字符串
 * （060 差分抓到过）。
 *
 * 这里逐码点映射：JS 的结果仍是单码点的（覆盖日常文字）直接采用，天然与简单映射一致；
 * 一旦 JS 把它撑开，简单映射的值要么等于原字符、要么是另一个我们无从由 JS 推得的单码点，
 * 于是只认下表里**已对 Godot 实测确认**的条目，其余一律响亮拒绝 —— 宁可报缺，不发错字。
 */
const SIMPLE_CASE: Record<"upper" | "lower", Record<string, string>> = {
  upper: { ß: "ß", ﬁ: "ﬁ", ǳ: "Ǳ", ǅ: "Ǆ" },
  lower: { İ: "i" },
};

/**
 * Godot 的 String 是 UTF-32，`<` / `>` / `<=` / `>=` 以及 `Array.sort()` 都按**码点**逐位比较。
 * JS 的字符串比较按 UTF-16 **码元**，代理区（U+D800–U+DFFF）会排到 U+FFFF 之下：
 * 探针实测 `String.chr(0x1F600) < String.chr(0xFFFF)` 在 Godot 里是 **false**，JS 却给 **true** ——
 * 一条能静默改判定向的错（emoji 与 BMP 高位字符比较、含 emoji 的字符串数组排序都会中）。
 *
 * 快路：两边都不含代理对时，码元序与码点序必然一致，直接用原生比较（日常文本全走这条）。
 * 只有真出现代理对才逐码点比。
 */
export function strCmp(x: string, y: string): number {
  if (!/[\uD800-\uDFFF]/.test(x) && !/[\uD800-\uDFFF]/.test(y)) {
    return x === y ? 0 : x < y ? -1 : 1;
  }
  const xa = [...x];
  const ya = [...y];
  const n = Math.min(xa.length, ya.length);
  for (let i = 0; i < n; i++) {
    const cx = xa[i]!.codePointAt(0)!;
    const cy = ya[i]!.codePointAt(0)!;
    if (cx !== cy) return cx < cy ? -1 : 1;
  }
  if (xa.length === ya.length) return 0;
  return xa.length < ya.length ? -1 : 1;
}

export function strCase(s: string, dir: "upper" | "lower"): string {
  const table = SIMPLE_CASE[dir];
  const out: string[] = [];
  for (const ch of s) {
    const mapped = dir === "upper" ? ch.toUpperCase() : ch.toLowerCase();
    if ([...mapped].length === 1) {
      out.push(mapped);
      continue;
    }
    const fixed = table[ch];
    if (fixed !== undefined) {
      out.push(fixed);
      continue;
    }
    throw new UnsupportedError(
      "case-mapping",
      `to_${dir === "upper" ? "upper" : "lower"}：字符 ${ch}（U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase()
        }）的 Unicode 简单映射无法由 JS 推得（JS 给 "${mapped}"，Godot 给单码点），` +
        `已实测的字符可补进 SIMPLE_CASE.${dir} 表`,
    );
  }
  return out.join("");
}

/** Godot 的 `%` 只认这几个转换符；`%i %u %e %g` 与 `#` 标志在 Godot 是 Parse Error。 */
const FMT_TYPES = new Set(["d", "o", "x", "X", "c", "s", "f"]);

interface FmtSpec {
  flags: string;
  width: number;
  prec: number | null;
  type: string;
  text: string;
}

type FmtTok = { lit: string } | { spec: FmtSpec };

/** 符号在前、再补零（实测 %05d/-42 → "-0042"、%08.2f/-3.14159 → "-0003.14"）。 */
function padFmt(body: string, sign: string, sp: FmtSpec): string {
  const left = sp.flags.includes("-");
  const zero = !left && sp.flags.includes("0");
  if (zero && sp.width > 0) return sign + body.padStart(sp.width - sign.length, "0");
  const raw = sign + body;
  if (raw.length >= sp.width) return raw;
  return left ? raw.padEnd(sp.width) : raw.padStart(sp.width);
}

function fmtNum(a: Variant, sp: FmtSpec): number {
  if (a.t === Tag.INT) return intToNum(a.v as IntPayload);
  if (a.t === Tag.FLOAT) return a.v as number;
  throw new UnsupportedError(
    "format-number",
    `${sp.text} 需要数值，收到 ${tagName(a.t)}（Godot 此处是 Parse Error: a number is required in operator %）`,
  );
}

/** x/X/o/c 只验证过 int；float 是否像 %d 那样截断**未实测**，宁缺毋猜。 */
function fmtIntOnly(a: Variant, sp: FmtSpec): bigint {
  if (a.t === Tag.INT) return intToBig(a.v as IntPayload);
  throw new UnsupportedError(
    "format-int",
    `${sp.text} 只对 int 实测过（收到 ${tagName(a.t)}）；Godot 对 float 的行为未探针确认，拒绝猜测`,
  );
}

/**
 * GDScript 的 `%` 格式化。逐条对 Godot 4.6.3 探针实测（4 批共 51 个单表达式探针文件）：
 *   转换符只有 `d o x X c s f` —— `%i %u %e %g` 与 `#` 标志在 Godot 是
 *   `Parse Error: unsupported format character`；标志支持 `-`（左对齐）`0`（补零）`+`（正号）；`%%` 出字面 `%`。
 *   `%d` 收 float **向零截断**（3.7→"3"、-3.7→"-3"）；精度对 `%d` 无效（`%.3d` 42 → "42"）。
 *   `%f` 默认 6 位小数（3.5→"3.500000"、int 3→"3.000000"），`%.Nf` 取 N 位且**四舍五入远离零**
 *   （2.5→"3"、3.5→"4"、2.25→"2.3"），与 JS `toFixed` 的取整规则一致。
 *   `%x/%X/%o` 收负数给「符号 + 绝对值的进制串」（-1 → "-1"）；`%c` 是码点转字符（128512 → U+1F600，0 → NUL）。
 *   参数**多于**转换符（只可能是数组右值）时 Godot 原样返回格式串（`"%d" % [1,2]` → `"%d"`）；
 *   **少于**则 Godot 解析期报 not enough arguments，我们在运行期响亮抛。
 * 早先的实现只 `replace(/%[dfs]/g, …)`：其余一律原样留在输出里（`%5d`、`%%`、`%x` 全部静默错），
 * 且 `%f` 走 `strFloat` 得 "3.5" 而非 "3.500000" —— 都是能跑但输出错。
 */
export function strFormat(fmt: string, args: Variant[]): string {
  const toks: FmtTok[] = [];
  let lit = "";
  let specs = 0;
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== "%") {
      lit += fmt[i];
      continue;
    }
    if (fmt[i + 1] === "%") {
      lit += "%";
      i++;
      continue;
    }
    let k = i + 1;
    let flags = "";
    while (k < fmt.length && (fmt[k] === "-" || fmt[k] === "+" || fmt[k] === "0")) {
      flags += fmt[k];
      k++;
    }
    let width = 0;
    while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
      width = width * 10 + (fmt[k]!.charCodeAt(0) - 48);
      k++;
    }
    let prec: number | null = null;
    if (fmt[k] === ".") {
      k++;
      prec = 0;
      while (k < fmt.length && fmt[k]! >= "0" && fmt[k]! <= "9") {
        prec = prec * 10 + (fmt[k]!.charCodeAt(0) - 48);
        k++;
      }
    }
    const t = fmt[k];
    if (t === undefined || !FMT_TYPES.has(t)) {
      throw new UnsupportedError(
        "format-spec",
        `不支持的格式符 "${fmt.slice(i, k + 1)}"：Godot 只认 d o x X c s f` +
          `（%i/%u/%e/%g 与 # 标志实测是 Parse Error: unsupported format character）`,
      );
    }
    toks.push({ lit });
    lit = "";
    toks.push({ spec: { flags, width, prec, type: t, text: fmt.slice(i, k + 1) } });
    specs++;
    i = k;
  }
  toks.push({ lit });

  if (args.length > specs) return fmt; // Godot 的怪规则：实参多出来就原样返回格式串
  if (args.length < specs) {
    throw new GodotRuntimeError(
      "format-arity",
      `格式化参数不足: ${fmt}（需 ${specs} 个，给了 ${args.length} 个；Godot 是 Parse Error: not enough arguments）`,
    );
  }

  let ai = 0;
  let out = "";
  for (const tk of toks) {
    if ("lit" in tk) {
      out += tk.lit;
      continue;
    }
    const sp = tk.spec;
    const a = args[ai++]!;
    switch (sp.type) {
      case "s":
        out += padFmt(show(a), "", sp);
        break;
      case "d": {
        let neg: boolean;
        let body: string;
        if (a.t === Tag.INT) {
          const p = a.v as IntPayload;
          if (typeof p === "bigint") {
            neg = p < 0n;
            body = (neg ? -p : p).toString();
          } else {
            neg = p < 0;
            body = Math.abs(p).toString();
          }
        } else {
          const v = Math.trunc(fmtNum(a, sp)); // 向零截断（实测 3.7→3、-3.7→-3）
          neg = v < 0;
          body = Math.abs(v).toString();
        }
        const sign = neg ? "-" : sp.flags.includes("+") ? "+" : "";
        out += padFmt(body, sign, sp);
        break;
      }
      case "f": {
        const v = fmtNum(a, sp);
        const body = Math.abs(v).toFixed(sp.prec ?? 6);
        out += padFmt(body, v < 0 ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "x":
      case "X":
      case "o": {
        const p = fmtIntOnly(a, sp);
        const neg = p < 0n;
        const mag = neg ? -p : p;
        const base = sp.type === "o" ? 8 : 16;
        const body = sp.type === "X" ? mag.toString(base).toUpperCase() : mag.toString(base);
        out += padFmt(body, neg ? "-" : sp.flags.includes("+") ? "+" : "", sp);
        break;
      }
      case "c": {
        const p = fmtIntOnly(a, sp);
        out += padFmt(String.fromCodePoint(Number(p)), "", sp);
        break;
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- 格式化

/**
 * 浮点转字符串。16 个单表达式探针对 Godot 4.6.3 实测，规则可完整复现：
 *   `nan` / `inf` / `-inf` 原样；**0 与 -0.0 都印 `0.0`**；
 *   **整数值**浮点 → 精确十进制位 + `.0`（`1e14`→`100000000000000.0`、`1e20`→21 位+`.0`）；
 *   **非整数** → 小数位数 = `max(0, 14 - 整数位数)`，再去尾随零（`0.0000001`→`0.0000001`、
 *   `0.1+0.2`→`0.3`、`1e-20`→`0.0`）；整数位已超 14 位时小数位为 0，四舍五入**远离零**且
 *   **不补 `.0`**（`123456789012345.6`→`123456789012346`）。
 * 旧实现用 `toPrecision(14)`，一旦落到科学计数法就抛 `float-format-exp` —— 于是任何大浮点
 * （`1e15` 起）都跑不了；改用 BigInt 展开十进制后不再有这个上限（`toFixed` 在 ≥1e21 会自己转科学计数法，故不走它）。
 */
/**
 * 把 `toPrecision(17)` 可能给出的科学计数法展开成普通十进制。
 * Godot 印大浮点时是**先取约 17 位有效数字再展开**，不是取 double 的精确值：
 * 实测 `print(1e300)` 得 `10000000000000001` 后跟零，而 1e300 的精确二进制值是一串
 * 301 位的乱数（我们用 BigInt 展开就会得到它，与 Godot 不一致）。
 */
function expandPlain(s: string): string {
  const m = /^(-?)(\d*)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(s);
  if (!m) return s;
  const ip = m[2]!;
  const fp = m[3] ?? "";
  const digits = ip + fp;
  const pointPos = ip.length + parseInt(m[4]!, 10);
  if (pointPos >= digits.length) return m[1]! + digits + "0".repeat(pointPos - digits.length);
  if (pointPos <= 0) return `${m[1]!}0.${"0".repeat(-pointPos)}${digits}`;
  return m[1]! + digits.slice(0, pointPos) + "." + digits.slice(pointPos);
}

export function strFloat(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0.0";
  if (Number.isInteger(n)) {
    let s = expandPlain(n.toPrecision(17));
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return `${s}.0`;
  }
  const intDigits = Math.max(0, Math.floor(Math.log10(Math.abs(n))) + 1);
  // 实测是 **15 位有效数字**（不是旧实现的 14 位）：1.2345678901234567→"1.23456789012346"、
  // 12345.678901234567→"12345.6789012346"、1234567890123.45→"1234567890123.45" 全部只对 15 位成立。
  // 小数位再夹在 [0, 14]：上界让 1e-20 塌成 "0.0"，下界让 15 位整数位以上直接取整（123456789012345.6→"123456789012346"）。
  const decimals = Math.max(0, Math.min(14, 15 - intDigits));
  if (decimals === 0) {
    const r = Math.sign(n) * Math.round(Math.abs(n));
    return BigInt(r).toString();
  }
  const trimmed = n.toFixed(decimals).replace(/0+$/, "");
  return trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
}

/**
 * Vector2 分量的打印格式：固定 **6 位小数**再去尾随零，至少留一位小数。
 * 与 strFloat（15 位有效数字）是两条路，探针实测：
 *   `Vector2(1.2345678901234567, 0.1+0.2)` → `(1.234568, 0.3)`
 *   `Vector2(1e15, 0).x` 单独打印           → `999999986991104.0`（走 strFloat）
 *   `Vector2(1.0000000000000002, 1e-8)`     → `(1.0, 0.0)`（1e-8 被 6 位小数吃掉）
 *   `Vector2(-0.0, 0.0)`                    → `(0.0, 0.0)`
 */
export function strVec2(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  const t = n.toFixed(6).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/** 顶层 print：字符串不加引号 */
export function show(v: Variant): string {
  switch (v.t) {
    case Tag.NIL:
      return "<null>";
    case Tag.BOOL:
      return v.v ? "true" : "false";
    case Tag.INT:
      return String(v.v);
    case Tag.FLOAT:
      return strFloat(v.v as number);
    case Tag.STRING:
      return v.v as string;
    case Tag.ARRAY:
      return `[${(v.v as GArray).raw().map(repr).join(", ")}]`;
    case Tag.DICT: {
      const d = v.v as GDict;
      const parts = d.keys().map((k) => `${repr(k)}: ${repr(d.get(k))}`);
      return `{ ${parts.join(", ")} }`;
    }
    case Tag.OBJECT: {
      const inner = v.v;
      // Godot 打印 Vector2 用括号，且分量走**专用**的 6 位小数格式（见 strVec2），
      // 不是 strFloat 的 15 位有效数字：实测 Vector2(1.2345678901234567, 0.1+0.2) → "(1.234568, 0.3)"
      if (inner instanceof GVector2) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)})`;
      }
      throw new UnsupportedError("show-type", "print 不支持该对象类型");
    }
    default:
      throw new UnsupportedError("show-type", `print 不支持 ${tagName(v.t)}`);
  }
}

/** 容器内嵌：字符串要加引号 */
export function repr(v: Variant): string {
  if (v.t === Tag.STRING) return `"${v.v as string}"`;
  return show(v);
}

// ---------------------------------------------------------------- 相等与真值

export function valueEq(a: Variant, b: Variant): boolean {
  const ta = a.t;
  const tb = b.t;
  if (ta === Tag.INT || ta === Tag.FLOAT) {
    // 跨 int/float 数值相等（S11）。两个 int 的载荷已归一化（同值同表示），直接 ===；
    // 一旦掺了 float，就得把 bigint 收成 number 再比 —— 否则 2^62n === 2^62 会假。
    if (tb === Tag.INT && ta === Tag.INT) return (a.v as IntPayload) === (b.v as IntPayload);
    if (tb === Tag.INT || tb === Tag.FLOAT) return numVal(a) === numVal(b);
    return false;
  }
  if (ta !== tb) return false;
  switch (ta) {
    case Tag.NIL:
      return true;
    case Tag.BOOL:
    case Tag.STRING:
      return a.v === b.v;
    case Tag.ARRAY:
      return (a.v as GArray).eq(b.v as GArray);
    case Tag.DICT:
      return (a.v as GDict).eq(b.v as GDict);
    case Tag.OBJECT:
      // Vector2 的相等是分量比较，不是引用比较
      if (a.v instanceof GVector2 && b.v instanceof GVector2) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      return a.v === b.v;
  }
  return false;
}

/** 空数组 / 空字典 / 0 / 0.0 / "" 全为 false —— 与 JS 相反（S12） */
export function truthyOf(v: Variant): boolean {
  switch (v.t) {
    case Tag.NIL:
      return false;
    case Tag.BOOL:
      return v.v as boolean;
    case Tag.INT:
    case Tag.FLOAT:
      return (v.v as number) !== 0;
    case Tag.STRING:
      return (v.v as string) !== "";
    case Tag.ARRAY:
      return (v.v as GArray).size() !== 0;
    case Tag.DICT:
      return (v.v as GDict).size() !== 0;
    case Tag.OBJECT:
      return true;
  }
  return false;
}
