import { GodotRuntimeError, UnsupportedError } from "./errors";
import { hexUpper } from "./numstr";
import { Tag, tagName, V, intToBig, intToNum, type IntPayload, type Variant } from "./tags";
import { CASE_LOWER_FIX, CASE_UPPER_FIX } from "./case-table";
import { GVector2, asVec2, vecCmp } from "./vector2";
import { GVector3, asVec3, vec3Cmp, vector3 } from "./vector3";
import { asVec2i, GVector2i, vec2iCmp, vector2i } from "./vector2i";
import { asVec3i, GVector3i, vector3i } from "./vector3i";
import { asColor, color, colorCmp, GColor, tryColorSlot } from "./color";
import { bytesEq, GBytes, packItems, registerPackStringifier } from "./packed";
import { sortGodot } from "./sort";
import { callableSame, isCallable, type CallableBox } from "./callable";

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
  return keyOfIn(v, 0);
}

/**
 * 桶的编码。容器键（实测 k1/q1/r1）按**内容**分格：等值的新数组命中同一格（`d[a]=1` 之后
 * `d[[1,2]]` 改到同一格），但 `[1]` / `[1.0]` / `[true]` / `[0]` 是四个不同的格（元素走
 * {@link valueSame} 的身份口径），字典的编码**跟着键序走**（实测 q3：`{"a":1,"b":2}` 与
 * `{"b":2,"a":1}` 是两个格，尽管它们 `==` 成立）。`c:` 前缀保证容器桶不会跟标量桶撞车。
 */
function keyOfIn(v: Variant, depth: number): string {
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
    case Tag.STRING_NAME:
      return `s:${v.v as string}`;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GArray;
      const items = g.raw();
      let out = "c:[";
      for (let i = 0; i < items.length; i++) out += (i === 0 ? "" : ",") + keyOfIn(items[i] as Variant, depth + 1);
      return out + "]";
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "…";
      const g = v.v as GDict;
      const ks = g.keys();
      const vs = g.values();
      let out = "c:{";
      for (let i = 0; i < ks.length; i++) {
        out +=
          (i === 0 ? "" : ",") +
          keyOfIn(ks[i] as Variant, depth + 1) +
          "=>" +
          keyOfIn(vs[i] as Variant, depth + 1);
      }
      return out + "}";
    }
    case Tag.OBJECT: {
      const vec = asVec2(v);
      if (vec) return `v:${String(vec.x)},${String(vec.y)}`;
      const vec3 = asVec3(v);
      if (vec3) return `w:${String(vec3.x)},${String(vec3.y)},${String(vec3.z)}`;
      const vec2i = asVec2i(v);
      if (vec2i) return `x:${String(vec2i.x)},${String(vec2i.y)}`;
      const vec3i = asVec3i(v);
      if (vec3i) return `u:${String(vec3i.x)},${String(vec3i.y)},${String(vec3i.z)}`;
      const col = asColor(v);
      if (col)
        return `z:${String(col.r)},${String(col.g)},${String(col.b)},${String(col.a)}`;
      break;
    }
    default:
      break;
  }
  throw new UnsupportedError("dict-key-type", `${tagName(v.t)} 不能作为字典键（未实现）`);
}

export type ElemKind =
  | "int"
  | "float"
  | "bool"
  | "String"
  | "StringName"
  | "Vector2"
  | "Vector3"
  | "Vector2i"
  | "Vector3i"
  | "Color"
  | "Array"
  | "Dictionary";

/** Godot 认识、且我们能在运行时校验的容器标注类型名 */
export function isElemKind(name: string): name is ElemKind {
  return (
    name === "int" || name === "float" || name === "bool" || name === "String" ||
    name === "StringName" ||
    name === "Vector2" ||
    name === "Vector3" ||
    name === "Vector2i" ||
    name === "Vector3i" ||
    name === "Color" ||
    name === "Array" ||
    name === "Dictionary"
  );
}

/**
 * `resize` 扩张时填进新格子的默认值。实测（083）：`Array[int]` → 0、`Array[float]` → 0.0、
 * `Array[bool]` → false、`Array[String]` → ""、`Array[StringName]` → &""、
 * `Array[Vector2]` → (0.0, 0.0)、`Array[Array]` → []、`Array[Dictionary]` → {  }。
 * 未定型数组给 null（实测 `Array` resize 出 `[1, null]`）。
 */
export function elemDefault(kind: ElemKind): Variant {
  switch (kind) {
    case "int":
      return V.int(0);
    case "float":
      return V.float(0);
    case "bool":
      return V.bool(false);
    case "String":
      return V.str("");
    case "StringName":
      return V.stringName("");
    case "Vector2":
      return V.object(new GVector2(0, 0));
    case "Vector3":
      return vector3(0, 0, 0);
    case "Vector2i":
      return vector2i(0, 0);
    case "Vector3i":
      return vector3i(0, 0, 0);
    case "Color":
      return color(0, 0, 0, 1);
    case "Array":
      return V.array(new GArray());
    case "Dictionary":
      return V.dict(new GDict());
  }
}

/**
 * 元素转换矩阵（083 全格实测）。规则是**能转就转、不能转就整次操作作废**，而不是报错：
 * Godot 在 `typed.validate(...)` 失败时只往 stderr 打一条 ERROR、容器原样不动。
 *   int   ← int / float（向零截断：2.9→2、-1.9→-1；|x| ≥ 2^63 或非有限 → INT64_MIN，与 `int()` 同口径）/ bool
 *   float ← float / int / bool（true → 1.0）
 *   bool  ← bool / int / float（0 与 0.0 为假）
 *   String ← String / StringName      StringName ← StringName / String
 *   Vector2 / Array / Dictionary 只收同型本身
 * **明确不收**（收下就是静默错）：String → int（实测 `Array[int].append("3")` 数组不变）、
 * String → bool、int → String、Vector2 → int、null → int、容器 → 标量 等。
 */
export function elemConvert(kind: ElemKind, v: Variant): Variant | null {
  switch (kind) {
    case "int":
      if (v.t === Tag.INT) return v;
      if (v.t === Tag.BOOL) return V.int(v.v ? 1 : 0);
      if (v.t === Tag.FLOAT) {
        const x = v.v as number;
        if (!Number.isFinite(x) || Math.abs(x) >= 2n ** 63n) return V.int(-(2n ** 63n));
        return V.int(BigInt(Math.trunc(x)));
      }
      return null;
    case "float":
      if (v.t === Tag.FLOAT) return v;
      if (v.t === Tag.INT) return V.float(intToNum(v.v as IntPayload));
      if (v.t === Tag.BOOL) return V.float(v.v ? 1 : 0);
      return null;
    case "bool":
      if (v.t === Tag.BOOL) return v;
      if (v.t === Tag.INT || v.t === Tag.FLOAT) return V.bool((v.v as number) !== 0);
      return null;
    case "String":
      if (v.t === Tag.STRING) return v;
      if (v.t === Tag.STRING_NAME) return V.str(v.v as string);
      return null;
    case "StringName":
      if (v.t === Tag.STRING_NAME) return v;
      if (v.t === Tag.STRING) return V.stringName(v.v as string);
      return null;
    case "Vector2": {
      // `Array[Vector2].append(Vector2i(1, 2))` → `[(1.0, 2.0)]`（`tmp/f69 u02`）：整型向量升成 float。
      if (v.t === Tag.OBJECT && v.v instanceof GVector2i) return V.object(new GVector2((v.v as GVector2i).x, (v.v as GVector2i).y));
      return v.t === Tag.OBJECT && v.v instanceof GVector2 ? v : null;
    }
    case "Vector3": {
      // 同一格的 Vector3i → Vector3（`tmp/f69 u03`）。
      const g3i = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g3i instanceof GVector3i) return vector3(g3i.x, g3i.y, g3i.z);
      return v.t === Tag.OBJECT && v.v instanceof GVector3 ? v : null;
    }
    case "Vector2i": {
      // `Array[Vector2i].append(Vector2(1.7, 2.9))` → `[(1, 2)]`（`tmp/f69 u01`）：逐分量向零截断。
      // 这一格之前只收同型，于是整次 append 被 validate 挡掉、数组**静默不动**，而 Godot 收下了。
      const g2 = v.t === Tag.OBJECT ? (v.v as object) : null;
      if (g2 instanceof GVector2) return vector2i(g2.x, g2.y);
      return v.t === Tag.OBJECT && v.v instanceof GVector2i ? v : null;
    }
    case "Vector3i": {
      // `Array[Vector3i].append(Vector3(4.7, 5.2, 6.9))` → `(4, 5, 6)`：收 Vector3 并**逐分量向零截断**
      // （实测 `tmp/f67 t13`）。Vector2i 那一侧的同一格还没量，所以那边照旧只收同型。
      if (v.t === Tag.OBJECT && v.v instanceof GVector3i) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GVector3) return vector3i(v.v.x, v.v.y, v.v.z);
      return null;
    }
    case "Color":
      // `Array[Color]` 的元素与 `Dictionary[StringName, Color]` 的值都收 int / String（`tmp/f77` / `tmp/f79`：
      // `append(1)` → `(0.0, 0.0, 0.0, 0.0039)`、`append("f00")` → `(1.0, 0.0, 0.0, 1.0)`、`{"k": 5}` 同理）。
      return tryColorSlot(v);
    case "Array":
      return v.t === Tag.ARRAY ? v : null;
    case "Dictionary":
      return v.t === Tag.DICT ? v : null;
  }
}

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

/**
 * 方法参数里的下标（`pop_at` / `remove_at` / `insert` …）：与 arrIdx 同样「负数从尾部数」，
 * 但**越界不给异常** —— 实测这些方法越界是静默无操作（`pop_at` 连返回都是 null）。
 * 方括号下标走 arrIdx（那条必须炸），两套口径别混。
 */
function fromEnd(i: number, len: number): number | null {
  const k = i < 0 ? i + len : i;
  return k < 0 || k >= len ? null : k;
}

export class GArray {
  private items: Variant[];
  elem: ElemKind | null = null;

  constructor(items: Variant[] = []) {
    this.items = items;
  }

  static of(items: Variant[]): GArray {
    return new GArray(items);
  }

  stampElem(kind: ElemKind): void {
    this.elem = kind;
    this.items = this.items.map((x) => elemConvert(kind, x) ?? x);
  }

  elemKind(): ElemKind | null {
    return this.elem;
  }

  private asElement(v: Variant): Variant | null {
    return this.elem === null ? v : elemConvert(this.elem, v);
  }

  private asElements(vs: Variant[]): Variant[] | null {
    if (this.elem === null) return vs;
    const out: Variant[] = [];
    for (const v of vs) {
      const c = elemConvert(this.elem, v);
      if (c === null) return null;
      out.push(c);
    }
    return out;
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
    const c = this.asElement(v);
    if (c === null) return;
    this.items[arrIdx(i, this.items.length)] = c;
  }

  append(v: Variant): void {
    const c = this.asElement(v);
    if (c !== null) this.items.push(c);
  }

  duplicate(deep = false, memo?: Map<unknown, Variant>): GArray {
    if (!deep) {
      const shared = new GArray([...this.items]);
      shared.elem = this.elem;
      return shared;
    }
    const m = memo ?? new Map<unknown, Variant>();
    const copy = new GArray([]);
    const seen = m.get(this);
    if (seen !== undefined) return (seen.v as GArray);
    m.set(this, V.array(copy));
    for (const it of this.items) copy.items.push(deepCopy(it, m));
    copy.elem = this.elem;
    return copy;
  }

  private asQuery(v: Variant): Variant | null {
    return this.elem === null ? v : elemConvert(this.elem, v);
  }

  has(v: Variant): boolean {
    const q = this.asQuery(v);
    return q !== null && this.items.some((x) => valueSame(x, q));
  }

  insertAt(at: number, v: Variant): boolean {
    const n = this.items.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return false;
    const c = this.asElement(v);
    if (c === null) return false;
    this.items.splice(k, 0, c);
    return true;
  }

  erase(v: Variant): void {
    const i = this.findSame(v);
    if (i >= 0) this.items.splice(i, 1);
  }

  popFront(): Variant {
    return this.shiftAt(this.items.length ? 0 : null);
  }

  popBack(): Variant {
    return this.shiftAt(this.items.length ? this.items.length - 1 : null);
  }

  popAt(i: number): Variant {
    return this.shiftAt(fromEnd(i, this.items.length));
  }

  private shiftAt(k: number | null): Variant {
    if (k === null) return V.nil();
    return this.items.splice(k, 1)[0] as Variant;
  }

  pushFront(v: Variant): void {
    const c = this.asElement(v);
    if (c !== null) this.items.unshift(c);
  }

  removeAt(i: number): void {
    const k = fromEnd(i, this.items.length);
    if (k !== null) this.shiftAt(k);
  }

  fillWith(v: Variant): void {
    const c = this.asElement(v);
    if (c === null) return;
    for (let i = 0; i < this.items.length; i++) this.items[i] = c;
  }

  resize(n: number): void {
    if (n < 0 || n === this.items.length) return;
    if (n < this.items.length) {
      this.items.length = n;
      return;
    }
    const filler = this.elem === null ? null : elemDefault(this.elem);
    while (this.items.length < n) this.items.push(filler === null ? V.nil() : deepCopy(filler));
  }

  sliceItems(begin: number, end: number | null, step: number, deep: boolean): GArray {
    const n = this.items.length;
    const out: Variant[] = [];
    if (step !== 0) {
      let b = begin < 0 ? n + begin : begin;
      let e = end === null ? n : end < 0 ? n + end : end;
      if (step > 0) {
        b = Math.min(Math.max(b, 0), n);
        e = Math.min(Math.max(e, 0), n);
        for (let i = b; i < e; i += step) out.push(this.items[i] as Variant);
      } else {
        b = Math.min(Math.max(b, 0), n - 1);
        e = Math.max(e, -1);
        for (let i = b; i > e; i += step) out.push(this.items[i] as Variant);
      }
    }
    let cut: GArray;
    {
      const m = new Map<unknown, Variant>();
      cut = deep ? new GArray(out.map((x) => deepCopy(x, m))) : new GArray(out);
    }
    cut.elem = this.elem;
    return cut;
  }

  appendAll(other: GArray): void {
    const converted = this.asElements(other.raw());
    if (converted !== null) this.items.push(...converted);
  }

  assignFrom(other: GArray): void {
    const converted = this.asElements(other.raw());
    if (converted !== null) this.items = [...converted];
  }

  reverseItems(): void {
    this.items.reverse();
  }

  clearAll(): void {
    this.items = [];
  }

  findSame(v: Variant, from = 0): number {
    const q = this.asQuery(v);
    if (q === null) return -1;
    v = q;
    if (from < 0 || from >= this.items.length) return -1;
    for (let i = from; i < this.items.length; i++) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  rfindSame(v: Variant, from = -1): number {
    const q = this.asQuery(v);
    if (q === null) return -1;
    v = q;
    const n = this.items.length;
    if (n === 0) return -1;
    let k = from < 0 ? n + from : from;
    if (k < 0 || k >= n) k = n - 1;
    for (let i = k; i >= 0; i--) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  count(v: Variant): number {
    const q = this.asQuery(v);
    if (q === null) return 0;
    return this.items.reduce((m, x) => (valueSame(x, q) ? m + 1 : m), 0);
  }

  concat(other: GArray): GArray {
    return new GArray([...this.items, ...other.raw()]);
  }

  eq(other: GArray, depth = 0): boolean {
    return this.eqAt(other, depth);
  }

  private eqAt(other: GArray, depth: number): boolean {
    if (this.items === other.items) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => {
      const y = other.items[i];
      return y !== undefined && valueEq(x, y, depth + 1);
    });
  }

  same(other: GArray, depth = 0): boolean {
    return this.sameAt(other, depth);
  }

  private sameAt(other: GArray, depth: number): boolean {
    if (this.items === other.items) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => valueSame(x, other.items[i] as Variant, depth + 1));
  }

  sort(): void {
    if (this.items.length === 0) return;
    const allNum = this.items.every((x) => x.t === Tag.INT || x.t === Tag.FLOAT);
    const allStr = this.items.every((x) => x.t === Tag.STRING || x.t === Tag.STRING_NAME);
    const allBool = this.items.every((x) => x.t === Tag.BOOL);
    const allVec = this.items.every((x) => asVec2(x) !== null);
    const allVec3 = this.items.every((x) => asVec3(x) !== null);
    const allVec2i = this.items.every((x) => asVec2i(x) !== null);
    if (!allNum && !allStr && !allBool && !allVec && !allVec3 && !allVec2i) {
      throw new UnsupportedError("array-sort-mixed", "混合类型数组排序（未实现）");
    }
    const cmp = allNum
      ? (a: Variant, b: Variant) =>
          a.t === Tag.INT && b.t === Tag.INT
            ? intToBig(a.v as IntPayload) < intToBig(b.v as IntPayload)
              ? -1
              : intToBig(a.v as IntPayload) > intToBig(b.v as IntPayload)
                ? 1
                : 0
            : numVal(a) - numVal(b)
      : allStr
        ? (a: Variant, b: Variant) => strCmp(a.v as string, b.v as string)
        : allBool
          ? (a: Variant, b: Variant) => Number(a.v) - Number(b.v)
          : allVec
            ? (a: Variant, b: Variant) => vecCmp(asVec2(a) as GVector2, asVec2(b) as GVector2)
            : allVec3
              ? (a: Variant, b: Variant) => vec3Cmp(asVec3(a) as GVector3, asVec3(b) as GVector3)
              : (a: Variant, b: Variant) => {
                  if (asColor(a) !== null && asColor(b) !== null) colorCmp();
                  return vec2iCmp(asVec2i(a) as GVector2i, asVec2i(b) as GVector2i);
                };
    this.items = [...this.items].sort(cmp);
  }

  /**
   * 同键顺序走引擎那份置换（`src/runtime/sort.ts` 逐行转写 `core/templates/sort_array.h`），不再是 JS 的稳定 sort。
   * 这一格挂了五轮（S184 / S133–S134）：n≤16 时两者本来就一致，**n≥17 有同键才分叉**。指纹是
   * `Vector2i(键, 下标)` 只按键比、印出下标序列，两套共 **71 格全中**：
   *  - `tmp/f74.txt` 45 格（拟合用的那批：全等键 n=16…100、mod3/mod5、有序 / 逆序 / 锯齿 / 分块、反向比较器、恒假谓词）；
   *  - `tmp/f94.txt` 26 格（**没参与拟合的独立批**：新 n（19/21/25/36/48/50/65/96/128/200）、新重复度（mod7 / mod2-64 / i*i%5 / mod9）、
   *    反向比较器 n=25/60，以及非自洽的比较器 `<=` 与恒真）。对拍脚本 `npx tsx tmp/sort-shipped.mts`。
   * `tmp/f94` 还顺定量出一件此前只能猜的事：**这份 4.6.3 构建的 `Validate` 是开的** —— 恒真比较器会往 stderr 打
   * `ERROR: bad comparison function; sorting will be broken`、出处 `unguarded_linear_insert (./core/templates/sort_array.h:252)`，
   * 而那条宏是 `break`（只中断当前那个扫描 while，分治循环照走），所以引擎给的是「带着 break 的置换」而不是中断。
   * **置换复现了、那行 stderr 复现不了**，所以不自洽比较器的形状只钉进 ops-check 与探针，不进语料。
   * `sort()`（无比较器）不动：它的同键元素是**值相等**的元素，置换再怎么变印出来都一样，量不到也就没必要换。
   */
  sortCustom(before: (a: Variant, b: Variant) => boolean): void {
    this.items = sortGodot(this.items, before);
  }

  bsearch(value: Variant, less: (a: Variant, b: Variant) => boolean): number {
    let lo = 0;
    let hi = this.items.length;
    while (lo < hi) {
      const m = (hi + lo) >> 1;
      const e = this.items[m] as Variant;
      if (less(e, value)) lo = m + 1;
      else if (!less(value, e)) return m;
      else hi = m;
    }
    return lo;
  }

  filterBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null && truthyOf(r)) out.push(x);
    }
    const kept = new GArray(out);
    kept.elem = this.elem;
    return kept;
  }

  mapBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null) out.push(r);
    }
    return new GArray(out);
  }

  anyBy(p: (v: Variant) => Variant | null): boolean {
    for (const x of this.items) {
      const r = p(x);
      if (r !== null && truthyOf(r)) return true;
    }
    return false;
  }

  allBy(p: (v: Variant) => Variant | null): boolean {
    for (const x of this.items) {
      const r = p(x);
      if (r === null || !truthyOf(r)) return false;
    }
    return true;
  }

  findCustom(p: (v: Variant) => Variant | null, from = 0): number {
    if (from < 0 || from >= this.items.length) return -1;
    for (let i = from; i < this.items.length; i++) {
      const r = p(this.items[i] as Variant);
      if (r !== null && truthyOf(r)) return i;
    }
    return -1;
  }

  rfindCustom(p: (v: Variant) => Variant | null, from = -1): number {
    const n = this.items.length;
    if (n === 0) return -1;
    let k = from < 0 ? n + from : from;
    if (k < 0 || k >= n) k = n - 1;
    for (let i = k; i >= 0; i--) {
      const r = p(this.items[i] as Variant);
      if (r !== null && truthyOf(r)) return i;
    }
    return -1;
  }

  extreme(    wantMin: boolean,
    less: (a: Variant, b: Variant) => boolean,
  ): Variant | null {
    let best: Variant | null = null;
    for (const x of this.items) {
      if (best === null) {
        best = x;
        continue;
      }
      if (wantMin ? less(x, best) : less(best, x)) best = x;
    }
    return best;
  }
}

export class GDict {
  private ks: Variant[] = [];
  private vs: Variant[] = [];
  private index = new Map<string, number>();
  private bkt: string[] = [];
  private prev: number[] = [];
  keyKind: ElemKind | null = null;
  valKind: ElemKind | null = null;

  stampElem(k: ElemKind, val: ElemKind): void {
    this.keyKind = k;
    this.valKind = val;
    const ks = this.ks;
    const vs = this.vs;
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
    for (let i = 0; i < ks.length; i++) this.set(ks[i] as Variant, vs[i] as Variant);
  }

  private conv(k: Variant, v: Variant): [Variant, Variant] | null {
    const kk = this.keyKind === null ? k : elemConvert(this.keyKind, k);
    if (kk === null) return null;
    const vv = this.valKind === null ? v : elemConvert(this.valKind, v);
    if (vv === null) return null;
    return [kk, vv];
  }

  size(): number {
    return this.ks.length;
  }

  keys(): Variant[] {
    return [...this.ks];
  }

  values(): Variant[] {
    return [...this.vs];
  }

  private asQuery(k: Variant): Variant | null {
    return this.keyKind === null ? k : elemConvert(this.keyKind, k);
  }

  private slot(b: string, q: Variant): number {
    let i = this.index.get(b);
    if (i === undefined) return -1;
    if (b[0] !== "c") return i;
    while (i >= 0) {
      const k = this.ks[i];
      if (k !== undefined && valueSame(k, q)) return i;
      i = this.prev[i] as number;
    }
    return -1;
  }

  has(k: Variant): boolean {
    const q = this.asQuery(k);
    return q !== null && this.slot(keyOf(q), q) >= 0;
  }

  get(k: Variant): Variant {
    const q = this.asQuery(k);
    if (q === null) return V.nil();
    const i = this.slot(keyOf(q), q);
    if (i < 0) return V.nil();
    return this.vs[i] ?? V.nil();
  }

  getRequired(k: Variant): Variant {
    const q = this.asQuery(k);
    const i = q === null ? -1 : this.slot(keyOf(q), q);
    if (i < 0) {
      throw new GodotRuntimeError("dict-key", `字典键不存在: ${show(k)}`);
    }
    return this.vs[i] as Variant;
  }

  set(k: Variant, v: Variant): void {
    const cv = this.conv(k, v);
    if (cv === null) return;
    k = cv[0];
    v = cv[1];
    const b = keyOf(k);
    const i = this.slot(b, k);
    if (i >= 0) {
      this.vs[i] = v;
      return;
    }
    const older = this.index.get(b);
    this.index.set(b, this.ks.length);
    this.bkt.push(b);
    this.prev.push(older === undefined ? -1 : older);
    this.ks.push(k);
    this.vs.push(v);
  }

  duplicate(deep = false, memo?: Map<unknown, Variant>): GDict {
    const d = new GDict();
    d.keyKind = this.keyKind;
    d.valKind = this.valKind;
    if (deep) {
      const m = memo ?? new Map<unknown, Variant>();
      const seen = m.get(this);
      if (seen !== undefined) return (seen.v as GDict);
      m.set(this, V.dict(d));
      for (let i = 0; i < this.ks.length; i++) {
        const k = this.ks[i];
        const v = this.vs[i];
        if (k !== undefined && v !== undefined) d.set(deepCopy(k, m), deepCopy(v, m));
      }
      return d;
    }
    for (let i = 0; i < this.ks.length; i++) {
      const k = this.ks[i];
      const v = this.vs[i];
      if (k === undefined || v === undefined) continue;
      const b = this.bkt[i] as string;
      const older = d.index.get(b);
      d.index.set(b, d.ks.length);
      d.bkt.push(b);
      d.prev.push(older === undefined ? -1 : older);
      d.ks.push(k);
      d.vs.push(v);
    }
    return d;
  }

  erase(k: Variant): boolean {
    const q = this.asQuery(k);
    if (q === null) return false;
    const b = keyOf(q);
    const i = this.slot(b, q);
    if (i < 0) return false;
    const older = this.prev[i] as number;
    if (this.index.get(b) === i) {
      if (older < 0) this.index.delete(b);
      else this.index.set(b, older);
    }
    this.ks.splice(i, 1);
    this.vs.splice(i, 1);
    this.bkt.splice(i, 1);
    this.prev.splice(i, 1);
    for (let j = 0; j < this.prev.length; j++) {
      if (this.prev[j] === i) this.prev[j] = older;
      else if ((this.prev[j] as number) > i) this.prev[j] = (this.prev[j] as number) - 1;
    }
    for (const [kk, ii] of [...this.index.entries()]) {
      if (ii > i) this.index.set(kk, ii - 1);
    }
    return true;
  }

  clearAll(): void {
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
  }

  mergeWith(other: GDict, overwrite: boolean): void {
    const ks = other.keys();
    const vs = other.values();
    for (let i = 0; i < ks.length; i++) {
      const k = ks[i] as Variant;
      if (!overwrite && this.has(k)) continue;
      this.set(k, vs[i] as Variant);
    }
  }

  hasAll(keys: GArray): boolean {
    return keys.raw().every((k) => this.has(k));
  }

  findKey(v: Variant): Variant {
    const q = this.valKind === null ? v : elemConvert(this.valKind, v);
    if (q === null) return V.nil();
    for (let i = 0; i < this.vs.length; i++) {
      if (valueSame(this.vs[i] as Variant, q)) return this.ks[i] as Variant;
    }
    return V.nil();
  }

  assignFrom(other: GDict): void {
    const ks = other.keys();
    const vs = other.values();
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    this.bkt = [];
    this.prev = [];
    for (let i = 0; i < ks.length; i++) this.set(ks[i] as Variant, vs[i] as Variant);
  }

  isEmpty(): boolean {
    return this.ks.length === 0;
  }

  same(other: GDict, depth = 0): boolean {
    return this.sameAt(other, depth);
  }

  private sameAt(other: GDict, depth: number): boolean {
    if (this === other) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.size() !== other.size()) return false;
    return this.ks.every((k, i) => {
      for (let j = 0; j < other.ks.length; j++) {
        if (valueSame(k, other.ks[j] as Variant, depth + 1)) {
          return valueSame(this.vs[i] as Variant, other.vs[j] as Variant, depth + 1);
        }
      }
      return false;
    });
  }

  eq(other: GDict, depth = 0): boolean {
    return this.eqAt(other, depth);
  }

  private eqAt(other: GDict, depth: number): boolean {
    if (this === other) return true;
    if (depth >= COMPARE_DEPTH) return true;
    if (this.size() !== other.size()) return false;
    for (let i = 0; i < this.ks.length; i++) {
      const b = this.bkt[i];
      let found = false;
      for (let j = 0; j < other.ks.length; j++) {
        if (other.bkt[j] === b) {
          found = valueEq(this.vs[i] as Variant, other.vs[j] as Variant, depth + 1);
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }
}

function deepCopy(v: Variant, memo?: Map<unknown, Variant>): Variant {
  if (v.t === Tag.ARRAY) return V.array((v.v as GArray).duplicate(true, memo));
  if (v.t === Tag.DICT) return V.dict((v.v as GDict).duplicate(true, memo));
  return { t: v.t, v: v.v };
}

/**
 * 声明处给容器值盖上元素类型。Godot 把类型记在**值**上，所以章只盖一次、跟着值走
 * （实测 `var u = a` 之后 u 照样受限）。
 * fromLiteral 为假且容器本来未定型、又非空时，Godot 是**运行时报错**
 * （`Trying to assign an array of type "Array" to a variable of type "Array[int]"`），不是静默转类型。
 */
export function stampArray(v: Variant, kind: ElemKind, fromLiteral: boolean): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${kind}] 的初值不是数组`);
  if (!fromLiteral && g.elemKind() === null) {
    throw new GodotRuntimeError(
      "typed-assign",
      `Trying to assign an array of type "Array" to a variable of type "Array[${kind}]"`,
    );
  }
  g.stampElem(kind);
  return v;
}

export function stampDict(v: Variant, k: ElemKind, val: ElemKind, fromLiteral: boolean): Variant {
  const d = v.t === Tag.DICT ? (v.v as GDict) : null;
  if (d === null) throw new UnsupportedError("typed-assign", `Dictionary[${k}, ${val}] 的初值不是字典`);
  if (!fromLiteral && d.keyKind === null) {
    throw new GodotRuntimeError(
      "typed-assign",
      `Trying to assign a dictionary of type "Dictionary" to a variable of type "Dictionary[${k}, ${val}]"`,
    );
  }
  d.stampElem(k, val);
  return v;
}

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

/**
 * `substr(from, len = -1)`。实测的三条边界，JS 原生 slice 一条都不对：
 * `from` 为负或越过串尾都给**空串**（JS 的负 index 是从尾部数，`"abc".substr(-2)` 会给出 "bc"），
 * `len` 省略或为负表示截到串尾（`"abc".substr(2)` → "c"、`substr(0, -1)` → "abc"）。
 */
export function strSubstr(s: string, from: number, len = -1): string {
  const chars = [...s];
  if (from < 0 || from >= chars.length) return "";
  return (len < 0 ? chars.slice(from) : chars.slice(from, from + len)).join("");
}

/**
 * `left(n)` / `right(n)`：n 是**码点**个数。负数先折成 `length + n`（实测 `"abc".left(-1)` → "ab"、
 * `"abc".right(-1)` → "bc"，即从另一端各丢 |n| 个），再夹进 [0, length]（实测 left(-5)/right(-5) → ""、
 * left(99) → 整串）。
 */
export function strEdge(s: string, n: number, side: "left" | "right"): string {
  const len = strLength(s);
  const k = n < 0 ? len + n : n;
  if (k <= 0) return "";
  if (k >= len) return s;
  const chars = [...s];
  return (side === "left" ? chars.slice(0, k) : chars.slice(len - k)).join("");
}

/**
 * `contains(needle)`：**空 needle 不算包含**（实测 `"abc".contains("")` 与 `"".contains("")` 都是 false）。
 * JS 的 `includes` 恰好给 true —— 不特判就是一条静默错。
 */
export function strContains(hay: string, needle: string): boolean {
  return needle !== "" && hay.includes(needle);
}

export function strSplitCapped(s: string, delim: string, allowEmpty: boolean, maxSplit: number): string[] {
  const sepLen = delim.length;
  const cuts: number[] = [];
  if (sepLen === 0) {
    const chars = [...s];
    let at = 0;
    for (let i = 0; i < chars.length - 1; i++) {
      at += (chars[i] as string).length;
      cuts.push(at);
    }
  } else {
    for (let i = 0; i + sepLen <= s.length; ) {
      if (s.startsWith(delim, i)) {
        cuts.push(i);
        i += sepLen;
      } else i += 1;
    }
  }
  const out: string[] = [];
  let readFrom = 0;
  let count = 0;
  let pi = 0;
  while (pi < cuts.length && count < maxSplit) {
    let p = cuts[pi] as number;
    if (!allowEmpty) {
      while (p === readFrom) {
        readFrom = p + sepLen;
        pi++;
        if (pi >= cuts.length) {
          p = -1;
          break;
        }
        p = cuts[pi] as number;
      }
      if (p === -1) break;
    }
    count++;
    out.push(s.slice(readFrom, p));
    readFrom = p + sepLen;
    pi++;
  }
  if (!allowEmpty) {
    while (sepLen > 0 && readFrom < s.length && s.startsWith(delim, readFrom)) readFrom += sepLen;
  }
  const tail = s.slice(readFrom);
  if (allowEmpty || tail !== "") out.push(tail);
  return out;
}

export function strSplit(s: string, delim: string, allowEmpty: boolean): string[] {
  let parts: string[];
  if (delim === "") {
    const chars = [...s];
    parts = chars.length === 0 ? [""] : chars;
  } else if (/[\uD800-\uDFFF]/.test(s) || /[\uD800-\uDFFF]/.test(delim)) {
    const chars = [...s];
    const dchars = [...delim];
    parts = [];
    let cur = "";
    let i = 0;
    while (i < chars.length) {
      if (i + dchars.length <= chars.length && dchars.every((c, j) => chars[i + j] === c)) {
        parts.push(cur);
        cur = "";
        i += dchars.length;
      } else {
        cur += chars[i];
        i++;
      }
    }
    parts.push(cur);
  } else {
    parts = s.split(delim);
  }
  return allowEmpty ? parts : parts.filter((p) => p !== "");
}

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
  const table = dir === "upper" ? CASE_UPPER_FIX : CASE_LOWER_FIX;
  const out: string[] = [];
  for (const ch of s) {
    const fixed = table[ch];
    if (fixed !== undefined) {
      out.push(fixed);
      continue;
    }
    const mapped = dir === "upper" ? ch.toUpperCase() : ch.toLowerCase();
    if ([...mapped].length === 1) {
      out.push(mapped);
      continue;
    }
    throw new UnsupportedError(
      "case-mapping",
      `to_${dir === "upper" ? "upper" : "lower"}：字符 ${ch}（U+${hexUpper(ch.codePointAt(0) ?? 0)}）的 Godot 简单映射没有实测数据（JS 给 "${mapped}"，Godot 只会给单码点）。` +
        `重跑 tools/case-probe.mjs + tools/golden.mjs 000-probe-cs + tools/case-table.mjs 生成表格`,
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

  if (args.length > specs) return fmt;
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
          const v = Math.trunc(fmtNum(a, sp));
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

/**
 * `n.toPrecision(17)` 的等价实现，用 bigint 手算（静态编译目标没有 `toPrecision` 的 lowering）。
 * 口径必须是**约 17 位有效数字**而不是 double 的精确展开：`String(1e300)` 给最短往返表示 `1e+300`、
 * `BigInt(1e300)` 给 301 位精确值，两者都与 Godot 不符；取整到 17 位再补零才符合
 * （实测 `print(1e300)` 得 `10000000000000001` 后跟零）。
 * 进位让位数 +1 的那一族照规范给更大的那个，展开自然多一位零。
 */
function digits17(n: number): string {
  let b = BigInt(n);
  const neg = b < 0n;
  if (neg) b = -b;
  const s = String(b);
  if (s.length <= 17) return neg ? `-${s}` : s;
  const tail = s.length - 17;
  const pow = 10n ** BigInt(tail);
  let q = b / pow;
  const r = b - q * pow;
  if (r * 2n >= pow) q = q + 1n;
  return `${neg ? "-" : ""}${String(q)}${"0".repeat(tail)}`;
}

/**
 * 浮点转字符串。16 个单表达式探针对 Godot 4.6.3 实测，规则可完整复现：
 *   `nan` / `inf` / `-inf` 原样；**0 与 -0.0 都印 `0.0`**；
 *   **整数值**浮点 → 约 17 位有效数字的十进制 + `.0`（`1e14`→`100000000000000.0`、`1e300`→`10000000000000001` 后跟零）；
 *   **非整数** → 小数位数 = `max(0, 14 - 整数位数)`，再去尾随零（`0.0000001`→`0.0000001`、
 *   `0.1+0.2`→`0.3`、`1e-20`→`0.0`）；整数位已超 14 位时小数位为 0，四舍五入**远离零**且
 *   **不补 `.0`**（`123456789012345.6`→`123456789012346`）。
 * 旧实现用 `toPrecision(14)`，一旦落到科学计数法就抛 `float-format-exp` —— 于是任何大浮点
 * （`1e15` 起）都跑不了；改用 BigInt 展开十进制后不再有这个上限（`toFixed` 在 ≥1e21 会自己转科学计数法，故不走它）。
 */
export function strFloat(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0.0";
  if (Number.isInteger(n)) return `${digits17(n)}.0`;
  const intDigits = Math.max(0, Math.floor(Math.log10(Math.abs(n))) + 1);
  const decimals = Math.max(0, Math.min(14, 15 - intDigits));
  if (decimals === 0) {
    const r = Math.sign(n) * Math.round(Math.abs(n));
    return BigInt(r).toString();
  }
  const trimmed = n.toFixed(decimals).replace(/0+$/, "");
  return trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
}

/**
 * Vector2 分量的打印格式：**小数值**走固定 6 位小数再去尾随零（至少留一位小数），
 * **整数值**改走 strFloat 的 17 位有效数字展开。两条路都是探针实测：
 *   `Vector2(1.2345678901234567, 0.1+0.2)` → `(1.234568, 0.3)`（6 位小数）
 *   `Vector2(0.9999999, 0.000001)`         → `(1.0, 0.000001)`（1e-7 被 6 位小数吃掉）
 *   `Vector2(1e20, -1e20)`                 → `(100000002004087730000.0, -100000002004087730000.0)`
 *     —— 这是 17 位有效数字，若也按 6 位小数印会给 full 精度 `…7730176.0`。
 *   `Vector2(-0.5, -0.0)`                  → `(-0.5, 0.0)`（恰好是 0 时符号丢掉）
 *   `Vector2(-0.0000004, …)`               → `(-0.0, …)`（非零但舍到 0 时**保留**负号）
 * 分量是 float32，所以 ≥2^23 的值一律是整数、走第二条路，两者不会在同一分量上打架。
 */
/**
 * Color 分量的打印格式：与 strVec2 同一套规则但只有 **4 位小数**（实测
 * `print(Color(1.0/3.0, 0.1, 0.123456789, 1.0))` → `(0.3333, 0.1, 0.1235, 1.0)`），
 * 两条实测差别：
 *  - **恰好 -0.0 也保留负号**（`Color(1/3, 1e-5, -1e-5, -0.0)` → `(0.3333, 0.0, -0.0, -0.0)`，
 *    Vector2 同位置给 `0.0`）；
 *  - 舍到零的非零值同样留负号（-1e-5 → `-0.0`），1e20 这类整数分量仍走 strFloat 的展开。
 */
export function strColor(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (n === 0) return Object.is(n, -0) ? "-0.0" : "0.0";
  if (Number.isInteger(n)) return strFloat(n);
  const t = n.toFixed(4).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

export function strVec2(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (!Number.isFinite(n)) return n > 0 ? "inf" : "-inf";
  if (Number.isInteger(n)) return strFloat(n);
  const t = n.toFixed(6).replace(/0+$/, "");
  return t.endsWith(".") ? `${t}0` : t;
}

/**
 * 工具函数「int 形参」的统一归一（实测口径）：**float 向零截断**、**bool 当 0/1**、
 * int 原样；其余类型 Godot 是编译期类型错，我们运行时报错（能到这一步说明静态侧判不出）。
 * 用 bigint 作中介，`num_int64(9007199254740993)` 这种要逐位精确的才不会被折成 double。
 */
export function intArgBig(v: Variant, who: string): bigint {
  switch (v.t) {
    case Tag.INT:
      return intToBig(v.v as IntPayload);
    case Tag.FLOAT: {
      const n = v.v as number;
      if (!Number.isFinite(n)) {
        throw new GodotRuntimeError("arg-int", `${who} 需要 int，收到非有限浮点 ${strFloat(n)}`);
      }
      return BigInt(Math.trunc(n));
    }
    case Tag.BOOL:
      return v.v ? 1n : 0n;
    default:
      throw new GodotRuntimeError("arg-int", `${who} 需要 int，收到 ${tagName(v.t)}`);
  }
}

/**
 * `String.num(v)` 的口径。与 str()/print() 同一条浮点格式（实测 1e-20→0.0、
 * 123456789012345.6→123456789012346、1e20→21 位展开 + .0、inf/nan 同名），
 * **唯一实测差别是 -0.0**：print 给 `0.0`，String.num 给 `-0.0`。
 */
export function strNum(n: number): string {
  return Object.is(n, -0) ? "-0.0" : strFloat(n);
}

/**
 * `String.num_scientific(v)`。实测口径（Godot 4.6.3）：
 *   - 只有指数够极端才走科学计数法：`1e15` → `1e+15`、`1e20` → `1e+20`、`1e-5` → `1e-05`，
 *     而 `1e-4` → `0.0001`、`1e3` → `1000` —— 临界是 `|x| >= 1e15` 或 `|x| < 1e-4`；
 *   - 数字部分是**最短可回读**表示（`9.9999999e-07`、`123456789012345.6` 都和 JS 一样）；
 *   - 指数**带符号并补到两位**（JS 原生给 `1e-7`，Godot 要 `1e-07`）；
 *   - 与 str()/print() 是两套印法：`num_scientific(42)` → `42`、`(0)` → `0`，都没有 `.0`。
 */
export function strSci(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  if (n === 0) return "0";
  const a = Math.abs(n);
  if (a < 1e15 && a >= 1e-4) return String(n);
  const m = /^(-?[\d.]+)e([+-])(\d+)$/.exec(n.toExponential());
  return m ? `${m[1]}e${m[2]}${m[3]!.padStart(2, "0")}` : n.toExponential();
}

/**
 * `String.humanize_size(n)` —— 40 个实测点拟合出的规则（`1025`→`1.00 KiB`、
 * `1075`→`1.04 KiB`（**截断不是四舍五入**）、`1048575`→`1023.9 KiB`、`1048576`→`1024 KiB`、
 * `1048577`→`1.00 MiB`、`-1024`→`16.00 EiB`）：
 *  - 参数按 **uint64** 解释（所以负数变成一个巨大值），再转成 **double** 参与比较 ——
 *    `2^64-1024` 在 double 里就是 `2^64`，这正是 `-1024` 给 `16.00 EiB` 而非 `15.99` 的原因；
 *  - 档位：`while (value > 1024) value /= 1024`（**严格大于**，故 1048576 停在 KiB 档给 `1024 KiB`）；
 *  - 小数位：`< 100` 两位、`< 1024` 一位、再大**不留小数**（`100.0`、`1023.9`、`1024` 全对上）；
 *  - 原始档位（B）直接印整数本身，不走上面的缩放。
 */
const SIZE_UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

export function strHumanizeSize(v: Variant): Variant {
  const signed = intArgBig(v, "String.humanize_size() 的参数");
  const u = signed & ((1n << 64n) - 1n);
  if (u === 0n) return V.str("0 B");
  let value = Number(u);
  let cat = 0;
  while (value > 1024) {
    value /= 1024;
    cat++;
  }
  const unit = SIZE_UNITS[cat] ?? SIZE_UNITS[SIZE_UNITS.length - 1]!;
  if (cat === 0) return V.str(`${u.toString()} B`);
  const digits = value < 100 ? 2 : value < 1024 ? 1 : 0;
  const scale = 10 ** digits;
  const trunc = Math.trunc(value * scale) / scale;
  return V.str(digits === 0 ? `${Math.trunc(value)} ${unit}` : `${trunc.toFixed(digits)} ${unit}`);
}

/**
 * `String.` 上的静态成员。目前实现探针钉住的三个：
 *   `chr(n)` —— 参数转 int（float 截断、bool 当 0/1）；**0、负数、代理区、> U+10FFFF
 *   一律换成 U+FFFD**（实测 `String.chr(0) == String.chr(0xFFFD)` 为真：Godot 的串里不留 NUL）；
 *   `num(v)` —— 见 strNum；`num_int64(v)` —— 转 int 后按十进制精确印。
 * 其余（`num_float` 之类 Godot 根本没有的、以及 md5_text/humanize_size 这些还没实现的）响亮报缺。
 */
export function stringStatic(name: string, args: Variant[] = []): Variant {
  switch (name) {
    case "chr": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.chr() 缺少参数");
      const cp = intArgBig(v, "String.chr() 的参数");
      const bad = cp <= 0n || cp > 0x10ffffn || (cp >= 0xd800n && cp <= 0xdfff);
      return V.str(String.fromCodePoint(bad ? 0xfffd : Number(cp)));
    }
    case "num": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num() 缺少参数");
      if (v.t === Tag.FLOAT) return V.str(strNum(v.v as number));
      if (v.t === Tag.INT) return V.str(strNum(intToNum(v.v as IntPayload)));
      if (v.t === Tag.BOOL) return V.str(strNum(v.v ? 1 : 0));
      throw new GodotRuntimeError("string-arg", `String.num() 不接受 ${tagName(v.t)}`);
    }
    case "num_int64": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num_int64() 缺少参数");
      return V.str(intArgBig(v, "String.num_int64() 的参数").toString());
    }
    case "num_scientific": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.num_scientific() 缺少参数");
      if (v.t === Tag.FLOAT) return V.str(strSci(v.v as number));
      if (v.t === Tag.INT) return V.str(strSci(intToNum(v.v as IntPayload)));
      if (v.t === Tag.BOOL) return V.str(strSci(v.v ? 1 : 0));
      throw new GodotRuntimeError("string-arg", `String.num_scientific() 不接受 ${tagName(v.t)}`);
    }
    case "humanize_size": {
      const v = args[0];
      if (v === undefined) throw new GodotRuntimeError("arity", "String.humanize_size() 缺少参数");
      return strHumanizeSize(v);
    }
    default:
      throw new UnsupportedError(
        "string-static",
        `String.${name} 未实现（实测存在的静态成员是 chr/num/num_int64/num_scientific/humanize_size；num_float 这类 Godot 根本没有）`,
      );
  }
}

/**
 * `str(a, b, c…)`：Godot 是**每个实参按 print 那套渲染，然后无分隔拼起来** ——
 * `tmp/f93`：`str("a","-","b")` → `a-b`、`str(1,2,3)` → `123`、`str("x", null, 2.5)` → `x<null>2.5`。
 * 之前发射的是 `rt.strOf(第一个实参)`，多余实参被**静默丢掉**（`str("a","-", "b")` 只给 `a`）。
 */
export function strBuiltin(args: Variant[]): Variant {
  return V.str(args.map((v) => show(v)).join(""));
}

/**
 * `String(x)` 构造器：实测**只接受 String**（`String("x")` → x），
 * int/float/bool/null/Vector2/Array 全是 Godot 的 Parse Error，所以到得了运行时还不是字符串就报错。
 */
export function stringCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-ctor-arity", `String() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  if (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME) {
    throw new GodotRuntimeError("string-ctor", `没有 String(${tagName(v.t)}) 这个构造器（Godot 是 Parse Error）`);
  }
  return V.str(v.v as string);
}

/** `StringName("x")`：实测只接受字符串族（int 是 Parse Error），结果与 `&"x"` 同类。 */
export function stringNameCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-name-ctor-arity", `StringName() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  if (v.t !== Tag.STRING && v.t !== Tag.STRING_NAME) {
    throw new GodotRuntimeError(
      "string-name-ctor",
      `没有 StringName(${tagName(v.t)}) 这个构造器（Godot 是 Parse Error: No constructor of "StringName" matches the signature）`,
    );
  }
  return V.stringName(v.v as string);
}

/**
 * **StringName 槽**（变量 / 字段 / 容器元素与键 / 形参默认值）：`tmp/f77` 与 `tmp/f79` 量到
 * `var sn: StringName = "nm"`、`sn = "zz"`、`Dictionary[StringName, int] = { "a": 1 }` 全部成立，
 * 而 `= 5`（`v-sn-str`）与 `= Color(...)`（`v-sn-color`）是解析期两句。装不下就响亮报，不原样塞进去。
 */
export function toStringNameSlot(v: Variant): Variant {
  if (v.t === Tag.STRING_NAME) return v;
  if (v.t === Tag.STRING) return V.stringName(v.v as string);
  throw new UnsupportedError("string-name-slot", `StringName 槽只收 StringName / String，收到 ${tagName(v.t)}`);
}

/** 顶层 print：字符串不加引号 */
/**
 * 容器打印 / 比较的深度上限。**实测是一条固定的层数闸门，不是「看见重复就断」**：
 *  - 没有环、纯粹 101 层嵌套（`nest(100)`）全展开；102 层（`nest(101)`）起最里一层换成 `[...]`；
 *  - 自引用数组 `a=[a]` → `[`×101 + `[...]` + `]`×101（`str(a).length()` 实测 **207**）；
 *  - 自引用字典 `d["x"]=d` → (`{ "x": ` + ` }`)×101 + `{ ... }`（长度实测 **916**，收尾标记是带空格的 `{ ... }`）；
 *  - 间接环（`p=[q]`、`q=[p]`）与直接环同一个层数，所以不是重复检测。
 * 比较（`==`）也按同一层数截断：实测两个**不同**的自引用数组相等（`a == b` 真）、两条不同的间接环相等、
 * 两个不同的自引用字典也相等 —— 不截断的话我们这边是 RangeError 栈溢出。
 */
export const PRINT_DEPTH = 101;

/**
 * 比较（`==` / `has` / `count` 走的身份比较）另有一道**更浅**的闸门 = **52 层**（实测，与打印那道不是一条）。
 * 判据是三条边界：
 *  - `a == nest(n)`（a=[a]，nest(n) 有 n+1 层）在 n=51 假、n=52 真；
 *  - `nest(n) == nest(n+1)` 与 `nest(n) == nest(n+2)` 同样在 n=51 假、n=52 真；
 *  - 而**桶**要深得多：`d[nest(100)]` 查 `nest(101)` 仍然落空，`d[nest(101)]` 查 `nest(102)` 才命中（=101 那道）。
 * 也就是说 Godot 的 `==` 在 52 层之外会把**明显不同**的两个容器判成相等（`nest(52) == nest(53)` 实测为真），
 * 字典格还要另看桶。两条闸门各按各的实测值，别合成一条。
 */
export const COMPARE_DEPTH = 52;

registerPackStringifier((v) => show(v));

/**
 * `print(a, b, c)` 的口径：**Godot 先把所有实参求值完，才开始把每个转成字符串**
 * （S170 ⑦ 实测：`print(r, r.append(2.5), r)` 两个 `r` 都是追加之后的）。
 * 所以发射器不能把 `rt.show(...)` 铺在实参位置上（那会让转字符串夹在副作用之间），
 * 而是把整串实参交到这里，按顺序 show、用空串拼（Godot 的 print 不加分隔符）。
 */
export function showArgs(args: Variant[]): string {
  let out = "";
  for (const a of args) out += show(a);
  return out;
}

export function show(v: Variant, depth = 0): string {
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
    case Tag.STRING_NAME:
      return v.v as string;
    case Tag.ARRAY: {
      if (depth >= PRINT_DEPTH) return "[...]";
      const g = v.v as GArray;
      return `[${g.raw().map((x) => repr(x, depth + 1)).join(", ")}]`;
    }
    case Tag.DICT: {
      if (depth >= PRINT_DEPTH) return "{ ... }";
      const d = v.v as GDict;
      const vs = d.values();
      const parts = d.keys().map((k, i) => `${repr(k, depth + 1)}: ${repr(vs[i] as Variant, depth + 1)}`);
      return `{ ${parts.join(", ")} }`;
    }
    case Tag.OBJECT: {
      const inner = v.v;
      if (inner instanceof GVector2) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)})`;
      }
      if (inner instanceof GVector3) {
        return `(${strVec2(inner.x)}, ${strVec2(inner.y)}, ${strVec2(inner.z)})`;
      }
      if (inner instanceof GVector2i) {
        return `(${String(inner.x)}, ${String(inner.y)})`;
      }
      if (inner instanceof GVector3i) {
        return `(${String(inner.x)}, ${String(inner.y)}, ${String(inner.z)})`;
      }
      if (inner instanceof GColor) {
        return `(${strColor(inner.r)}, ${strColor(inner.g)}, ${strColor(inner.b)}, ${strColor(inner.a)})`;
      }
      if (inner instanceof GBytes) {
        return `[${packItems(inner as GBytes).map((e) => repr(e, depth + 1)).join(", ")}]`;
      }
      throw new UnsupportedError("show-type", "print 不支持该对象类型");
    }
    default:
      throw new UnsupportedError("show-type", `print 不支持 ${tagName(v.t)}`);
  }
}

/** 容器内嵌：字符串要加引号 */
export function repr(v: Variant, depth = 0): string {
  if (v.t === Tag.STRING) return `"${v.v as string}"`;
  if (v.t === Tag.STRING_NAME) return `&"${v.v as string}"`;
  return show(v, depth);
}

/**
 * `分隔符.join(数组)`：每个元素走 **print 那一条 stringify**，不是容器里那套带引号的 repr。
 * 实测：`str(null)` → `<null>`、`str(&"z")` → `z`（无引号）、`str(Vector2(1,2))` → `(1.0, 2.0)`、
 * 而数组元素本身仍按容器形式给 `[1]`；空数组给空串、空分隔符就是把它们粘起来。
 */
export function strJoin(sep: string, g: GArray): string {
  const items = g.raw();
  let out = "";
  for (let i = 0; i < items.length; i++) {
    if (i > 0) out += sep;
    out += show(items[i] as Variant);
  }
  return out;
}

/**
 * Variant 的 **Godot 类型名**：`tagName` 只到 Tag 粒度，值类型都在 OBJECT 里，
 * 而报错文本要说得出 `Vector2` / `Color` 这种名字（`valueEq` 的分支标签与形参槽位都用它）。
 */
export function valueTypeName(x: Variant): string {
  if (asVec2(x) !== null) return "Vector2";
  if (asVec3(x) !== null) return "Vector3";
  if (asVec2i(x) !== null) return "Vector2i";
  if (asVec3i(x) !== null) return "Vector3i";
  if (asColor(x) !== null) return "Color";
  // `tmp/f97` d5 的报错文本里 Callable 就叫 `Callable`（`Invalid operands 'Callable' and 'int' …`）
  if (isCallable(x)) return "Callable";
  return tagName(x.t);
}

export function valueEq(a: Variant, b: Variant, depth = 0): boolean {
  const ta = a.t;
  const tb = b.t;
  const a2 = asVec2(a);
  const b2 = asVec2(b);
  const a3 = asVec3(a);
  const b3 = asVec3(b);
  const ai = asVec2i(a);
  const bi = asVec2i(b);
  const ai3 = asVec3i(a);
  const bi3 = asVec3i(b);
  const ac = asColor(a);
  const bc = asColor(b);
  if (
    a2 !== null ||
    b2 !== null ||
    a3 !== null ||
    b3 !== null ||
    ai !== null ||
    bi !== null ||
    ai3 !== null ||
    bi3 !== null ||
    ac !== null ||
    bc !== null
  ) {
    if (a2 !== null && b2 !== null) return a2.x === b2.x && a2.y === b2.y;
    if (a3 !== null && b3 !== null) return a3.x === b3.x && a3.y === b3.y && a3.z === b3.z;
    if (ai !== null && bi !== null) return ai.x === bi.x && ai.y === bi.y;
    if (ai3 !== null && bi3 !== null) return ai3.x === bi3.x && ai3.y === bi3.y && ai3.z === bi3.z;
    if (ac !== null && bc !== null)
      return ac.r === bc.r && ac.g === bc.g && ac.b === bc.b && ac.a === bc.a;
    const other: Variant =
      a2 !== null || a3 !== null || ai !== null || ai3 !== null || ac !== null ? b : a;
    if (other.t === Tag.NIL) return false;
    throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
  }
  if (ta === Tag.INT || ta === Tag.FLOAT) {
    if (tb === Tag.INT && ta === Tag.INT) return (a.v as IntPayload) === (b.v as IntPayload);
    if (tb === Tag.INT || tb === Tag.FLOAT) return numVal(a) === numVal(b);
    return false;
  }
  if (
    (ta === Tag.STRING || ta === Tag.STRING_NAME) &&
    (tb === Tag.STRING || tb === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (isCallable(a) !== isCallable(b)) {
    // `tmp/f97` d5：Callable 跟 int 比在 Godot **不是** false，而是运行期那一句
    // `Invalid operands 'Callable' and 'int' in operator '=='.`（`== null` / `== "add3"` 两格与
    // float / bool 来源都没量到 —— 那一支 print 在第一个式子上就断了，所以只发实测这一形）
    const other = isCallable(a) ? b : a;
    if (other.t === Tag.INT) {
      throw new GodotRuntimeError("eq-operands", `Invalid operands '${valueTypeName(a)}' and '${valueTypeName(b)}' in operator '=='.`);
    }
  }
  if (ta !== tb) return false;
  switch (ta) {
    case Tag.NIL:
      return true;
    case Tag.BOOL:
    case Tag.STRING:
      return a.v === b.v;
    case Tag.STRING_NAME:
      return b.t === Tag.STRING_NAME && a.v === b.v;
    case Tag.ARRAY:
      return (a.v as GArray).eq(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).eq(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GBytes && b.v instanceof GBytes) return bytesEq(a.v as GBytes, b.v as GBytes);
      // Callable 之间是**内容**等式（接收者 + 方法名，绑定串不算），不是 JS 盒子引用 ——
      // 读一次属性就新建一个盒子，按引用比会把 Godot 的真相判成假（实测见 `callable.ts` 的 `callableSame`）
      if (isCallable(a) && isCallable(b)) return callableSame(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
  }
  return false;
}

/**
 * Godot 的**身份**相等（`Variant::identity`）：`has` / `find` / `rfind` / `count` / `erase` 用它，
 * 而 `==` 运算符用上面那个跨 int/float 的 valueEq。两者在数字上分家（实测 `[1].has(1.0)` → false、
 * `[1].find(1.0)` → -1，而 `1 == 1.0` 为真；`[0].has(false)`、`[null].has(0)` 也都是 false），
 * String 与 StringName 却合一（实测 `["a"].count(&"a")` → 1），容器递归比身份、字典不看键序
 * （实测 `[{"x":1,"y":2}].count({"y":2,"x":1})` → 1）。
 */
export function valueSame(a: Variant, b: Variant, depth = 0): boolean {
  if (depth >= COMPARE_DEPTH && (a.t === Tag.ARRAY || a.t === Tag.DICT) && a.t === b.t) return true;
  if (
    (a.t === Tag.STRING || a.t === Tag.STRING_NAME) &&
    (b.t === Tag.STRING || b.t === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
  }
  if (a.t !== b.t) return false;
  switch (a.t) {
    case Tag.NIL:
      return true;
    case Tag.ARRAY:
      return (a.v as GArray).same(b.v as GArray, depth);
    case Tag.DICT:
      return (a.v as GDict).same(b.v as GDict, depth);
    case Tag.OBJECT:
      if (a.v instanceof GVector2 && b.v instanceof GVector2) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3 && b.v instanceof GVector3) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GVector2i && b.v instanceof GVector2i) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
      if (a.v instanceof GVector3i && b.v instanceof GVector3i) {
        return a.v.x === b.v.x && a.v.y === b.v.y && a.v.z === b.v.z;
      }
      if (a.v instanceof GColor && b.v instanceof GColor) {
        return a.v.r === b.v.r && a.v.g === b.v.g && a.v.b === b.v.b && a.v.a === b.v.a;
      }
      // Callable 走与 `==` 同一条等式：d6 实测 `[o.add3, o.add3].has(o.add3)` 是**真**，
      // 而盒子每次读都是新建的，按 JS 引用比会判成假
      if (isCallable(a) && isCallable(b)) return callableSame(a.v as CallableBox, b.v as CallableBox);
      return a.v === b.v;
    default:
      return a.v === b.v;
  }
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
    case Tag.STRING_NAME:
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
