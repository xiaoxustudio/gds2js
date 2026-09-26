import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, intToBig, intToNum, type IntPayload, type Variant } from "./tags";
import { CASE_LOWER_FIX, CASE_UPPER_FIX } from "./case-table";
import { GVector2, asVec2, vecCmp } from "./vector2";

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
    case Tag.STRING_NAME:
      // 实测 StringName 与等价 String 是**同一个键**（{&"k": 1, "k": 2} 在 Godot 是重复键报错）
      return `s:${v.v as string}`;
    case Tag.OBJECT: {
      // Vector2 能当键，且按**值**分（实测 k[Vector2(1,2)] 与 k[Vector2(1.0,2.0)] 是同一格、
      // 而 k[Vector2(1,2)] 与 k[Vector2(2,1)] 是两格）。分量已 fround，所以字符串化就够稳定。
      const vec = asVec2(v);
      if (vec) return `v:${String(vec.x)},${String(vec.y)}`;
      break;
    }
    default:
      break;
  }
  throw new UnsupportedError("dict-key-type", `${tagName(v.t)} 不能作为字典键（未实现）`);
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
  duplicate(deep = false): GArray {
    // 实测 `duplicate()` 是**浅**的：外层新数组、内层容器仍是同一个引用
    // （`var s = a.duplicate(); s[0][0] = 9` 会把 `a` 也改掉），要 `duplicate(true)` 才断开
    return deep ? new GArray(this.items.map(deepCopy)) : new GArray([...this.items]);
  }

  has(v: Variant): boolean {
    return this.items.some((x) => valueSame(x, v));
  }

  /**
   * `insert(at, v)`。实测越界是**静默不插入**（既不报错也不追加）：`insert(10)` 无变化，
   * 但 `insert(size)` 恰好等于尾接；负数按下标从尾部折算（`insert(-1)` 插在倒数第一格之前）。
   */
  insertAt(at: number, v: Variant): void {
    const n = this.items.length;
    const k = at < 0 ? n + at : at;
    if (k < 0 || k > n) return;
    this.items.splice(k, 0, v);
  }

  /** `erase(v)`：删掉第一个身份相等的元素，没有就什么都不做（实测不报错）。 */
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

  /** `pop_at(i)`：越界（含折算后越界的负数）实测给 null 且**不改数组**。 */
  popAt(i: number): Variant {
    return this.shiftAt(fromEnd(i, this.items.length));
  }

  private shiftAt(k: number | null): Variant {
    if (k === null) return V.nil();
    return this.items.splice(k, 1)[0] as Variant;
  }

  pushFront(v: Variant): void {
    this.items.unshift(v);
  }

  /** `remove_at(i)`：与 pop_at 同一套折算，越界静默无操作。 */
  removeAt(i: number): void {
    const k = fromEnd(i, this.items.length);
    if (k !== null) this.shiftAt(k);
  }

  /**
   * `fill(v)`：整格填成**同一个引用**（实测 `a.fill(b)` 后改 `b`，a 的每一格都跟着变），
   * 不是每格一份拷贝。
   */
  fillWith(v: Variant): void {
    for (let i = 0; i < this.items.length; i++) this.items[i] = v;
  }

  /**
   * `slice(begin, end, step, deep)`。end 传 null 表示实参省略（实测省略时截到串尾，
   * 而**显式 -1** 是「末尾前一格」—— `slice(2, -1)` 在 3 格数组上给 []，两者不能混为一谈）。
   * 步长为 0 实测给空数组；负步长只往回走，方向不对直接空（`slice(0, 5, -1)` → []）。
   */
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
        // 负步长：起点越过末位就从末位开始（实测 slice(9,1,-1) → [5,4,3]），
        // 终点最低压到 -1，好让 slice(-1,-9,-1) 还能取下标 0。
        b = Math.min(Math.max(b, 0), n - 1);
        e = Math.max(e, -1);
        for (let i = b; i > e; i += step) out.push(this.items[i] as Variant);
      }
    }
    return deep ? new GArray(out.map(deepCopy)) : new GArray(out);
  }

  /** `append_array(other)`：元素按引用接上（实测改 src 的嵌套容器会串进来）。 */
  appendAll(other: GArray): void {
    this.items.push(...other.raw());
  }

  /** `assign(other)`：整层换掉，但元素仍共享引用（实测 b 改了内层会串进 a，改外层不会）。 */
  assignFrom(other: GArray): void {
    this.items = [...other.raw()];
  }

  reverseItems(): void {
    this.items.reverse();
  }

  clearAll(): void {
    this.items = [];
  }

  /**
   * `find(v, from = 0)` / `count(v)` / `erase(v)` / `has(v)` 都用**身份**相等而不是 `==`
   * （见 valueSame），且 `from` 不做「从尾部数」：实测负数一律 -1、越过尾也 -1。
   */
  findSame(v: Variant, from = 0): number {
    if (from < 0 || from >= this.items.length) return -1;
    for (let i = from; i < this.items.length; i++) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  /**
   * `rfind(v, from = -1)`：负 from **先**按从尾部折算，折算后仍越界才退回「整段都找」。
   * 实测 `[1,2,1,2]` 上 `from=0` → 0、`-2` → 2、`-4` → 0 而 `-9` → 2，只有这两步能同时满足。
   */
  rfindSame(v: Variant, from = -1): number {
    const n = this.items.length;
    if (n === 0) return -1;
    let k = from < 0 ? n + from : from;
    if (k < 0 || k >= n) k = n - 1;
    for (let i = k; i >= 0; i--) if (valueSame(this.items[i] as Variant, v)) return i;
    return -1;
  }

  count(v: Variant): number {
    return this.items.reduce((m, x) => (valueSame(x, v) ? m + 1 : m), 0);
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

  /** 身份版比较：`has`/`find`/`count` 走它（见 valueSame）。 */
  same(other: GArray): boolean {
    if (this.items.length !== other.items.length) return false;
    return this.items.every((x, i) => valueSame(x, other.items[i] as Variant));
  }

  /**
   * `sort()`。实测（4.6.3）：int/float 混排按数值排、各自保留原类型（`[2.5,1,3.0,2]` → `[1, 2, 2.5, 3.0]`）；
   * 字符串按码点（`["b","a","C"]` → `["C","a","b"]`）；纯 bool 能排（false 在前）；
   * Vector2 按字典序（`[Vector2(1,2),Vector2(0,3)]` → `[(0.0, 3.0), (1.0, 2.0)]`）。
   * **掺进不可比的类型时 Godot 不报错**，只是比较永远不成立、顺序原样保留（`[1,"a"]` 照旧、`[true,1]` 照旧）。
   * 我们不复现这种"猜出来的顺序"，响亮报缺 —— 这里最不该有的就是静默给一个错顺序。
   */
  sort(): void {
    if (this.items.length === 0) return;
    const allNum = this.items.every((x) => x.t === Tag.INT || x.t === Tag.FLOAT);
    const allStr = this.items.every((x) => x.t === Tag.STRING || x.t === Tag.STRING_NAME);
    const allBool = this.items.every((x) => x.t === Tag.BOOL);
    const allVec = this.items.every((x) => asVec2(x) !== null);
    if (!allNum && !allStr && !allBool && !allVec) {
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
      : allStr
        ? (a: Variant, b: Variant) => strCmp(a.v as string, b.v as string)
        : allBool
          ? (a: Variant, b: Variant) => Number(a.v) - Number(b.v)
          : (a: Variant, b: Variant) => vecCmp(asVec2(a) as GVector2, asVec2(b) as GVector2);
    this.items = [...this.items].sort(cmp);
  }

  /**
   * `sort_custom(f)`：f(a,b) 为真表示 a 该排在 b 前。实测与 JS 的稳定排序一致
   * （ties 保留插入顺序：`[[1,a],[2,b],[1,c],[2,d],[1,e]]` 按首元素排完是 a、c、e 的先后）。
   * JS 的 sort 只吃三值比较器，所以一次比较要问两侧 f(a,b) 与 f(b,a)。
   */
  sortCustom(before: (a: Variant, b: Variant) => boolean): void {
    this.items = [...this.items].sort((x, y) => (before(x, y) ? -1 : before(y, x) ? 1 : 0));
  }

  /**
   * `bsearch(v)` / `bsearch_custom(v, f)` 的走法（实测对上 Godot 的 Algorithm::bsearch）：
   * 命中返回该下标，未命中返回**该插入的位置**（不是 `~idx`）。四条实测全部复现：
   * `[1,3,5].bsearch(3)`=1、`.bsearch(4)`=2、`[3,1,2].bsearch(99)`=3、`[3,1,2].bsearch(2)`=2
   * （最后一条也说明：数组无序时 Godot 不检查，照这套二分走法给值，所以必须逐比对齐而不是"找不到就 -1"）。
   */
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

  /**
   * `filter(f)` / `map(f)` / `find_custom(f, from)` / `rfind_custom(f, from)` 一族。
   * 谓词返回 `null` 表示**这次调用失败**（实参个数与 Callable 声明对不上，Godot 只往 stderr 打
   * 一条引擎诊断、不报错）。实测（082）失败时的口径：filter 不收这一格、map 也不收
   * （`[1,2].map(func(x, i): return 1)` → `[]`）、find_custom/rfind_custom 当不匹配。
   * 结果是新数组，但**元素仍是引用**（实测改结果里的嵌套容器会串回原表）。
   */
  filterBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null && truthyOf(r)) out.push(x);
    }
    return new GArray(out);
  }

  mapBy(p: (v: Variant) => Variant | null): GArray {
    const out: Variant[] = [];
    for (const x of this.items) {
      const r = p(x);
      if (r !== null) out.push(r);
    }
    return new GArray(out);
  }

  /** `any(f)` / `all(f)`：实测**短路**（`[1,2,3,4].any(x>2)` 只调用到 3）。空数组 any 假、all 真。 */
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

  /** `find_custom` / `rfind_custom` 实测给的是**下标**（不是元素），未命中 -1；from 的折算与 find/rfind 同一套。 */
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

  /** min/max 的比较口径由调用方给（值类型在 ops 那边，运行时这里不能反向依赖）。 */
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

  /** 实测 `duplicate()` 是浅拷贝（改副本里的嵌套容器会串回原字典），`duplicate(true)` 才断开。 */
  duplicate(deep = false): GDict {
    const d = new GDict();
    for (let i = 0; i < this.ks.length; i++) {
      const k = this.ks[i];
      const v = this.vs[i];
      if (k !== undefined && v !== undefined) d.set(deep ? deepCopy(k) : k, deep ? deepCopy(v) : v);
    }
    return d;
  }

  /** `erase(k)`：实测返回** bool**（键在不在），不是 void。 */
  erase(k: Variant): boolean {
    const key = keyOf(k);
    const i = this.index.get(key);
    if (i === undefined) return false;
    this.ks.splice(i, 1);
    this.vs.splice(i, 1);
    this.index.delete(key);
    for (const [kk, ii] of [...this.index.entries()]) {
      if (ii > i) this.index.set(kk, ii - 1);
    }
    return true;
  }

  clearAll(): void {
    this.ks = [];
    this.vs = [];
    this.index = new Map();
  }

  /**
   * `merge(other, overwrite)`。实测**默认不覆盖**（`{"a":1}` merge `{"a":9,"b":2}` 仍是 `{"a":1,"b":2}`），
   * 第二个实参给 true 才顶掉已有的键；新键两种情况都会补上。
   */
  mergeWith(other: GDict, overwrite: boolean): void {
    const ks = other.keys();
    for (const k of ks) {
      if (this.has(k)) {
        if (overwrite) this.set(k, other.get(k));
      } else {
        this.set(k, other.get(k));
      }
    }
  }

  /** `has_all(keys)`：键用 `==` 口径（与 `has` 同一个 index 查法）；空数组实测为 true。 */
  hasAll(keys: GArray): boolean {
    return keys.raw().every((k) => this.has(k));
  }

  /** `find_key(v)`：按身份找值，命中给键、未命中实测给 null。 */
  findKey(v: Variant): Variant {
    for (let i = 0; i < this.vs.length; i++) {
      if (valueSame(this.vs[i] as Variant, v)) return this.ks[i] as Variant;
    }
    return V.nil();
  }

  /** `assign(other)`：整层换成实参的一份拷贝（实测改实参不影响本字典）。 */
  assignFrom(other: GDict): void {
    const ks = other.keys();
    const vs = other.values();
    this.ks = [];
    this.vs = [];
    this.index = new Map();
    for (let i = 0; i < ks.length; i++) this.set(ks[i] as Variant, vs[i] as Variant);
  }

  isEmpty(): boolean {
    return this.ks.length === 0;
  }

  /** 身份版比较（`count`/`find` 的实参是容器时用，见 valueSame）：不看键序。 */
  same(other: GDict): boolean {
    if (this.size() !== other.size()) return false;
    return this.ks.every((k, i) => {
      for (let j = 0; j < other.ks.length; j++) {
        if (valueSame(k, other.ks[j] as Variant)) {
          return valueSame(this.vs[i] as Variant, other.vs[j] as Variant);
        }
      }
      return false;
    });
  }

  eq(other: GDict): boolean {
    if (this.size() !== other.size()) return false;
    return this.ks.every((k) => valueEq(this.get(k), other.get(k)));
  }
}

function deepCopy(v: Variant): Variant {
  // 这里必须显式要深拷贝：duplicate() 默认是浅的（Godot 的口径，见上）
  if (v.t === Tag.ARRAY) return V.array((v.v as GArray).duplicate(true));
  if (v.t === Tag.DICT) return V.dict((v.v as GDict).duplicate(true));
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

/**
 * `split(delim)` / `split(delim, allow_empty)`，语义全部实测：
 * - 分隔符为空串 → 逐**码点**切（`"ab".split("")` → ["a","b"]），空串本身 → [""]；
 * - 默认保留空片段（`"a,,b"` → ["a","","b"]、`"a,b,"` → ["a","b",""]、`"".split(",")` → [""]）；
 * - `allow_empty` 为 false → 丢掉所有空片段（`"".split(",", false)` → **[]**、`",a,b"` → ["a","b"]）。
 *
 * 快路用原生 split（无代理元时与 UTF-32 口径等价）；一旦出现代理元就逐码点切 —— 否则
 * 半个代理对（只能由 `String.chr(0xD83D)` 这类运行时构造出来）会当分隔符命中、把 emoji 拦腰截断，
 * 而 Godot 的 UTF-32 里根本没有这个码点，是不出声的错。
 */
export function strSplit(s: string, delim: string, allowEmpty: boolean): string[] {
  let parts: string[];
  if (delim === "") {
    // JS 的 `"ab".split("")` 按码元切、`"".split("")` 还给 []，两处都与 Godot 不同 → 自己按码点走
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

/**
 * Godot 的 to_upper / to_lower 走 Unicode **简单映射**：一个码点映一个码点、长度永远不变
 * （全量实测：JS 里有映射的 3037 个码点，Godot 给多码点结果的 0 个）。
 * JS 的 toUpperCase/toLowerCase 走**兼容全映射**（ß→SS、ﬁ→FI、İ→i̇、ǳ→DŽ），照抄就会
 * 静默产出与 Godot 不同长度、甚至不同字符的结果。
 *
 * 逐码点处理，三步：
 *  1. `case-table.ts` 里有的，直接用表 —— 那是 Godot 实测答案（含两类：JS 撑开的，以及
 *     JS 与 Godot 都给单码点但给的不是同一个字符的，如 Bassa Vah 整段被 Godot 当作无大小写）；
 *  2. 否则取 JS 的结果，只要它仍是单码点 —— 已对 Godot 全量验证过一致；
 *  3. JS 把它撑开、表里又没有：说明遇到本轮没测过的数据（例如换了 Godot 版本或 JS 升级），
 *     响亮拒绝而不是猜。重跑 tools/case-probe.mjs → tools/golden.mjs → tools/case-table.mjs 即可补齐。
 */
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
      `to_${dir === "upper" ? "upper" : "lower"}：字符 ${ch}（U+${(ch.codePointAt(0) ?? 0).toString(16).toUpperCase()
        }）的 Godot 简单映射没有实测数据（JS 给 "${mapped}"，Godot 只会给单码点）。` +
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
  const u = signed & ((1n << 64n) - 1n); // uint64 解释
  if (u === 0n) return V.str("0 B");
  let value = Number(u); // 与 Godot 一致：比较与缩放都在 double 上做
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
      // 形参是 float：int/bool 先收成数字再走浮点格式（实测 String.num(42) → "42.0"）
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
 * `String(x)` 构造器：实测**只接受 String**（`String("x")` → x），
 * int/float/bool/null/Vector2/Array 全是 Godot 的 Parse Error，所以到得了运行时还不是字符串就报错。
 */
export function stringCtor(args: Variant[]): Variant {
  if (args.length !== 1) {
    throw new GodotRuntimeError("string-ctor-arity", `String() 只接受 1 个参数（收到 ${args.length} 个）`);
  }
  const v = args[0] as Variant;
  // 实测 String(&"k") == "k" 为真且 typeof 是 4；其余实参类型 Godot 是 Parse Error
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
    case Tag.STRING_NAME:
      // print(&"abc") 直接给 abc（实测），但装进容器里是 &"abc"（见 repr）
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
  if (v.t === Tag.STRING_NAME) return `&"${v.v as string}"`;
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
  // StringName 与等值 String 相等（实测 &"abc" == "abc" 与反向都为真），要在下面的同标签早退之前判
  if (
    (ta === Tag.STRING || ta === Tag.STRING_NAME) &&
    (tb === Tag.STRING || tb === Tag.STRING_NAME)
  ) {
    return (a.v as string) === (b.v as string);
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

/**
 * Godot 的**身份**相等（`Variant::identity`）：`has` / `find` / `rfind` / `count` / `erase` 用它，
 * 而 `==` 运算符用上面那个跨 int/float 的 valueEq。两者在数字上分家（实测 `[1].has(1.0)` → false、
 * `[1].find(1.0)` → -1，而 `1 == 1.0` 为真；`[0].has(false)`、`[null].has(0)` 也都是 false），
 * String 与 StringName 却合一（实测 `["a"].count(&"a")` → 1），容器递归比身份、字典不看键序
 * （实测 `[{"x":1,"y":2}].count({"y":2,"x":1})` → 1）。
 */
export function valueSame(a: Variant, b: Variant): boolean {
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
      return (a.v as GArray).same(b.v as GArray);
    case Tag.DICT:
      return (a.v as GDict).same(b.v as GDict);
    case Tag.OBJECT:
      // Vector2 按分量而不是引用（实测 [Vector2(1,2)].count(Vector2(1.0,2.0)) → 1）
      if (a.v instanceof GVector2 && b.v instanceof GVector2) {
        return a.v.x === b.v.x && a.v.y === b.v.y;
      }
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
