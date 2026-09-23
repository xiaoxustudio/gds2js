import { GodotRuntimeError, UnsupportedError } from "./errors";
import { Tag, tagName, V, type Variant } from "./tags";

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
    const v = this.items[i];
    if (v === undefined) {
      throw new GodotRuntimeError("array-index", `数组索引越界: ${i}`);
    }
    return v;
  }

  set(i: number, v: Variant): void {
    this.items[i] = v;
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
    const cmp = allNum
      ? (a: Variant, b: Variant) => (a.v as number) - (b.v as number)
      : (a: Variant, b: Variant) => (a.v as string) < (b.v as string) ? -1 : 1;
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

  has(k: Variant): boolean {
    return this.index.has(keyOf(k));
  }

  get(k: Variant): Variant {
    const i = this.index.get(keyOf(k));
    if (i === undefined) return V.nil();
    return this.vs[i] ?? V.nil();
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

export function strFormat(fmt: string, args: Variant[]): string {
  let i = 0;
  return fmt.replace(/%[dfs]/g, (spec) => {
    const a = args[i++];
    if (a === undefined) {
      throw new GodotRuntimeError("format-arity", `格式化参数不足: ${fmt}`);
    }
    if (spec === "%d") {
      if (a.t !== Tag.INT) {
        throw new UnsupportedError("format-d", `%d 需要 int，收到 ${tagName(a.t)}`);
      }
      return String(a.v);
    }
    if (spec === "%s") return show(a);
    return strFloat(a.v as number);
  });
}

// ---------------------------------------------------------------- 格式化

/**
 * 浮点转字符串（Godot 规则：14 位有效数字，去尾随零，至少保留一位小数）。
 * str(1.0) == "1.0"，str(2.5) == "2.5"（S7）
 */
export function strFloat(n: number): string {
  if (Number.isNaN(n)) return "nan";
  if (n === Infinity) return "inf";
  if (n === -Infinity) return "-inf";
  const s = n.toPrecision(14);
  if (/[eE]/.test(s)) {
    throw new UnsupportedError(
      "float-format-exp",
      `浮点科学计数法格式化未补测: ${n}（见 SEMANTICS §6-8）`,
    );
  }
  if (s.includes(".")) {
    const trimmed = s.replace(/0+$/, "");
    return trimmed.endsWith(".") ? `${trimmed}0` : trimmed;
  }
  return `${s}.0`;
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
    // 跨 int/float 数值相等（S11）
    if (tb === Tag.INT || tb === Tag.FLOAT) return (a.v as number) === (b.v as number);
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
