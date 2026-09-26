import { GodotRuntimeError, UnsupportedError } from "./errors";
import { md5Hex } from "./md5";
import { CALLABLE, isVariant, wrapValue, type Fn } from "./object";
import { Signal } from "./signal";
import { Tag, V, intToNum, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, strAt, strCase, strContains, strEdge, strFormat, strLength, strSplit, strSubstr, truthyOf } from "./values";
import { isLess } from "./ops";
import { GVector2, vec2Index, vector2Method } from "./vector2";

/**
 * 容器 / 字符串 / 对象上的方法与下标操作。
 * 放在这里而不是各自的类里，是为了让 emitter 只需要一个统一入口
 * （`rt.method(obj, "name", args)`），不必在生成代码里判断值的具体类型。
 */

function asArray(v: Variant, who: string): GArray {
  if (v.t !== Tag.ARRAY) throw new UnsupportedError("not-array", `${who} 需要 Array，收到 ${v.t}`);
  return v.v as GArray;
}

function asDict(v: Variant, who: string): GDict {
  if (v.t !== Tag.DICT) throw new UnsupportedError("not-dict", `${who} 需要 Dictionary，收到 ${v.t}`);
  return v.v as GDict;
}

function asString(v: Variant, who: string): string {
  if (v.t !== Tag.STRING) throw new UnsupportedError("not-string", `${who} 需要 String，收到 ${v.t}`);
  return v.v as string;
}

/** 入口可能是裸 JS 值（lambda、引擎对象），先归一成 Variant */
function norm(v: unknown): Variant {
  return isVariant(v) ? v : wrapValue(v);
}

export function method(raw: unknown, name: string, args: Variant[]): Variant {
  const obj = norm(raw);
  // StringName 上实测能直接调用 String 的方法族（length/substr/split/contains/to_upper…），
  // 且**返回的是 String 而不是 StringName**（typeof(&"abc".to_upper()) → 4），所以先降成 String 再走原分派。
  if (obj.t === Tag.STRING_NAME) return method(V.str(obj.v as string), name, args);

  if (obj.t === Tag.OBJECT) {
    const inner = obj.v;

    // Vector2 的方法面（语义逐条探针实测，测不准的直接报缺，见 vector2.ts 的注释）
    if (inner instanceof GVector2) return vector2Method(inner, name, args);

    if (inner instanceof Signal) {
      if (name === "emit") {
        inner.emit(...args.map((a) => a.v));
        return V.nil();
      }
      if (name === "connect") {
        const fn = args[0];
        if (fn === undefined) throw new GodotRuntimeError("arity", "connect 缺少参数");
        inner.connect((...a: unknown[]) => {
          const f = (fn.v as Record<string, unknown>)[CALLABLE] as Fn | undefined;
          if (f) f(...a.map(wrapValue));
        });
        return V.nil();
      }
      throw new UnsupportedError("signal-method", `Signal.${name}() 未实现`);
    }

    const fn = (inner as Record<string, unknown>)[CALLABLE];
    if (typeof fn === "function") {
      const f = fn as Fn;
      if (name === "call") return wrapValue(f(...args));
      // call_deferred：推到下一个宏任务，等价于 Godot 的帧末调用
      if (name === "call_deferred") {
        setTimeout(() => {
          f(...args);
        }, 0);
        return V.nil();
      }
      throw new UnsupportedError("callable-method", `Callable.${name}() 未实现`);
    }

    // 脚本值（preload / load 的结果）：`.v` 就是类构造器，`.new()` 实例化它
    if (typeof inner === "function") {
      if (name === "new") {
        const Ctor = inner as new (...a: Variant[]) => object;
        return V.object(new Ctor(...args));
      }
      throw new UnsupportedError("script-method", `脚本上的 ${name}() 未实现`);
    }

    // 用户类实例：方法就是原型上的函数
    const member = (inner as unknown as Record<string, unknown>)[name];
    if (typeof member === "function") {
      const f = member as (...a: Variant[]) => unknown;
      return wrapValue(f.apply(inner, args));
    }

    throw new UnsupportedError("object-method", `对象上的 ${name}() 未实现`);
  }

  switch (obj.t) {
    case Tag.ARRAY: {
      const a = obj.v as GArray;
      switch (name) {
        case "append":
          a.append(one(args, "append"));
          return V.nil();
        case "duplicate":
          return V.array(a.duplicate(boolArgOr(args, 0, false)));
        case "size":
          return V.int(a.size());
        case "is_empty":
          return V.bool(a.size() === 0);
        case "has":
          return V.bool(a.has(one(args, "has")));
        case "insert":
          a.insertAt(intArg(args, 0, "insert"), argAt(args, 1, "insert"));
          return V.nil();
        case "erase":
          a.erase(one(args, "erase"));
          return V.nil();
        case "push_front":
          a.pushFront(one(args, "push_front"));
          return V.nil();
        case "push_back":
          a.append(one(args, "push_back"));
          return V.nil();
        case "pop_front":
          return a.popFront();
        case "pop_back":
          return a.popBack();
        case "pop_at":
          return a.popAt(intArg(args, 0, "pop_at"));
        case "remove_at":
          a.removeAt(intArg(args, 0, "remove_at"));
          return V.nil();
        case "clear":
          a.clearAll();
          return V.nil();
        case "reverse":
          a.reverseItems();
          return V.nil();
        case "fill":
          a.fillWith(one(args, "fill"));
          return V.nil();
        case "append_array":
          a.appendAll(asArray(one(args, "append_array"), "append_array"));
          return V.nil();
        case "assign":
          a.assignFrom(asArray(one(args, "assign"), "assign"));
          return V.nil();
        case "slice":
          // 第 2 个实参**省略**与显式给 -1 是两回事（前者截到尾），所以按 undefined 分岔
          return V.array(
            a.sliceItems(
              intArgOr(args, 0, 0),
              args[1] === undefined ? null : intArg(args, 1, "slice"),
              intArgOr(args, 2, 1),
              boolArgOr(args, 3, false),
            ),
          );
        case "resize":
          // 实测定长扩张要按**元素类型的默认值**填（Array[int] 给 0、Array[String] 给 ""），
          // 而未定型数组给 null。我们的数组不携带元素类型（见 ROADMAP 待做），
          // 一律填 null 会在定型数组上静默错，所以整条先报缺。
          throw new UnsupportedError(
            "array-resize",
            "Array.resize() 未实现：定型数组要按元素类型填默认值，运行时还不携带元素类型",
          );
        case "sort":
          a.sort();
          return V.nil();
        case "concat":
          return V.array(a.concat(asArray(one(args, "concat"), "concat")));
        case "sort_custom": {
          const before = comparatorOf(args[0], "sort_custom");
          a.sortCustom(before);
          return V.nil();
        }
        case "bsearch":
          return V.int(a.bsearch(one(args, "bsearch"), isLess));
        case "bsearch_custom":
          return V.int(a.bsearch(one(args, "bsearch_custom"), comparatorOf(args[1], "bsearch_custom")));
        case "find":
          return V.int(a.findSame(one(args, "find"), intArgOr(args, 1, 0)));
        case "rfind":
          return V.int(a.rfindSame(one(args, "rfind"), intArgOr(args, 1, -1)));
        case "count":
          return V.int(a.count(one(args, "count")));
        case "filter":
          return V.array(a.filterBy(predOf(args[0], "filter")));
        case "map":
          return V.array(a.mapBy(predOf(args[0], "map")));
        case "any":
          return V.bool(a.anyBy(predOf(args[0], "any")));
        case "all":
          return V.bool(a.allBy(predOf(args[0], "all")));
        case "find_custom":
          return V.int(a.findCustom(predOf(args[0], "find_custom"), intArgOr(args, 1, 0)));
        case "rfind_custom":
          return V.int(a.rfindCustom(predOf(args[0], "rfind_custom"), intArgOr(args, 1, -1)));
        case "reduce": {
          // 实参个数按 Godot 是 2（acc, 元素）；省略第二个实参时拿**第一个元素**当 acc、从下标 1
          // 开始折（实测 [1,2,3].reduce(acc*10+x) → 123），给了 acc 就从 0 开始折。
          const call = callerOf(args[0], 2, "reduce");
          const items = a.raw();
          let acc: Variant;
          let start = 0;
          if (args.length > 1) {
            acc = args[1] as Variant;
          } else {
            if (items.length === 0) return V.nil(); // 实测空数组又没 acc 给 null
            acc = items[0] as Variant;
            start = 1;
          }
          for (let i = start; i < items.length; i++) {
            const r = call([acc, items[i] as Variant]);
            // 实测：任何一次调用失败，整个 reduce 就给 null（不是保留已折出的部分）
            if (r === null) return V.nil();
            acc = r;
          }
          return acc;
        }
        // 实测空数组的 min()/max() 都是 null（不是报错）
        case "min":
          return a.extreme(true, isLess) ?? V.nil();
        case "max":
          return a.extreme(false, isLess) ?? V.nil();
        default:
          throw new UnsupportedError("array-method", `Array.${name}() 未实现`);
      }
    }
    case Tag.DICT: {
      const d = obj.v as GDict;
      switch (name) {
        case "size":
          return V.int(d.size());
        case "has":
          return V.bool(d.has(one(args, "has")));
        case "keys":
          return V.array(GArray.of(d.keys()));
        case "values":
          return V.array(GArray.of(d.values()));
        case "get":
          // 实测缺键：get(k) 给 null，get(k, def) 给 def（与方括号 d[k] 的「缺键报错」是两回事）
          return d.has(one(args, "get")) ? d.get(args[0] as Variant) : (args[1] ?? V.nil());
        case "set":
          d.set(args[0] as Variant, args[1] as Variant);
          return V.nil();
        case "is_empty":
          return V.bool(d.isEmpty());
        case "erase":
          return V.bool(d.erase(one(args, "erase")));
        case "clear":
          d.clearAll();
          return V.nil();
        case "merge":
          // 默认**不覆盖**已有的键（实测），第二个实参给 true 才顶
          d.mergeWith(asDict(one(args, "merge"), "merge"), boolArgOr(args, 1, false));
          return V.nil();
        case "has_all":
          return V.bool(d.hasAll(asArray(one(args, "has_all"), "has_all")));
        case "find_key":
          return d.findKey(one(args, "find_key"));
        case "assign":
          d.assignFrom(asDict(one(args, "assign"), "assign"));
          return V.nil();
        case "duplicate":
          return V.dict(d.duplicate(boolArgOr(args, 0, false)));
        default:
          throw new UnsupportedError("dict-method", `Dictionary.${name}() 未实现`);
      }
    }
    case Tag.STRING: {
      const s = obj.v as string;
      switch (name) {
        case "length":
          return V.int(strLength(s));
        case "substr":
          return V.str(strSubstr(s, intArg(args, 0, "substr"), intArgOr(args, 1, -1)));
        case "left":
          return V.str(strEdge(s, intArg(args, 0, "left"), "left"));
        case "right":
          return V.str(strEdge(s, intArg(args, 0, "right"), "right"));
        case "is_empty":
          return V.bool(strLength(s) === 0);
        case "contains":
          return V.bool(strContains(s, asString(one(args, "contains"), "contains")));
        case "split": {
          // max_splits 与 allow_empty=false 的相互作用实测凑不出简洁算式
          // （"a,,b".split(",", false, 1) 给 ["a","b"] 而不是 ["a",",b"]，
          //  "a-b-c".split("-", false, 0) 又完全不限刀），先响亮报缺，不发猜的语义。
          if (args.length > 2) {
            throw new UnsupportedError("split-max-splits", "split() 的第 3 个参数 max_splits 未实现");
          }
          const allow = args[1] === undefined ? true : boolArg(args, 1, "split");
          const parts = strSplit(s, asString(one(args, "split"), "split"), allow).map((p) => V.str(p));
          return V.array(GArray.of(parts));
        }
        case "to_upper":
          return V.str(strCase(s, "upper"));
        case "to_lower":
          return V.str(strCase(s, "lower"));
        // 实测与标准 MD5（RFC 1321）逐向量一致，走自带的 UTF-8 版本，不引 node:crypto
        case "md5_text":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `md5_text() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(md5Hex(s));
        default:
          throw new UnsupportedError("string-method", `String.${name}() 未实现`);
      }
    }
    default:
      throw new UnsupportedError("method-on-type", `类型 ${obj.t} 上调用 ${name}() 未实现`);
  }
}

export function index(raw: unknown, idx: Variant): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.ARRAY) return asArray(obj, "下标").get(intArg([idx], 0, "下标"));
  if (obj.t === Tag.DICT) return asDict(obj, "下标").getRequired(idx);
  if (obj.t === Tag.STRING) return V.str(strAt(asString(obj, "下标"), intArg([idx], 0, "下标")));
  // Vector2 可以按下标取分量（实测 v[0] → 3.0、v[1] → 4.0；越界 Godot 在解析期就拦）
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2) return vec2Index(obj.v as GVector2, idx);
  throw new UnsupportedError("index-type", `类型 ${obj.t} 不支持下标`);
}

export function setIndex(raw: unknown, idx: Variant, val: Variant): void {
  const obj = norm(raw);
  if (obj.t === Tag.ARRAY) {
    asArray(obj, "下标赋值").set(intArg([idx], 0, "下标赋值"), val);
    return;
  }
  if (obj.t === Tag.DICT) {
    asDict(obj, "下标赋值").set(idx, val);
    return;
  }
  throw new UnsupportedError("setindex-type", `类型 ${obj.t} 不支持下标赋值`);
}

/** for ... in 的迭代协议 */
export function iter(v: Variant): Variant[] {
  if (v.t === Tag.ARRAY) return (v.v as GArray).raw();
  if (v.t === Tag.DICT) return (v.v as GDict).keys();
  if (v.t === Tag.STRING) return [...(v.v as string)].map((c) => V.str(c));
  throw new UnsupportedError("iter-type", `类型 ${v.t} 不可迭代`);
}

/** 字典字面量：必须保留键的类型，所以走和运行时一样的键编码 */
export function dictOf(pairs: Array<[Variant, Variant]>): Variant {
  const d = new GDict();
  for (const [k, v] of pairs) d.set(k, v);
  return V.dict(d);
}

/** `"%d/%s" % [...]` —— 字符串格式化运算符 */
export function formatOf(fmt: Variant, args: Variant): Variant {
  const list = args.t === Tag.ARRAY ? (args.v as GArray).raw() : [args];
  return V.str(strFormat(asString(fmt, "格式化"), list));
}

/**
 * 取属性。返回值**不**归一成 Variant —— 因为 `create_timer(...).timeout`
 * 拿到的是个 Signal，await 它才有意义；包成 Variant 反而会让它立刻 resolve。
 */
export function attribute(raw: unknown, name: string): unknown {
  const obj = norm(raw);
  if (obj.t === Tag.OBJECT) {
    // Vector2 的分量读取要给 Variant：下面 `name in inner` 那条是给 Signal / Callable 用的
    // （它们要的正是裸对象），走那条会把 number 直接递给 rt.show / ops，于是 "print 不支持 undefined"。
    const vec = obj.v instanceof GVector2 ? (obj.v as GVector2) : null;
    if (vec && (name === "x" || name === "y")) return V.float(vec[name]);
    const inner = obj.v as Record<string, unknown>;
    if (name in inner) return inner[name];
  }
  if (obj.t === Tag.NIL) {
    throw new GodotRuntimeError("nil-attribute", `对 null 取属性 ${name}`);
  }
  throw new UnsupportedError("attribute", `取属性 ${name} 未实现（对象模型还没做完）`);
}

/**
 * Callable 实参：Godot **严格按声明的实参个数**调用，对不上整次调用就失败 —— 而失败在 Godot
 * 不是脚本错误，只有一条 stderr 诊断，实测各家把「没有结果」解释成自己的口径
 * （见 GArray 的 filterBy/mapBy/… 与下面的 reduce）。返回的调用器用 `null` 表示「这次调用失败」。
 * 我们的 lambda 发成同形参数的箭头函数、方法 Callable 是 `bind(this)` 过的原方法（bind 第一个
 * thisArg 不减 length），所以 `fn.length` 正好就是 Godot 那份声明的实参个数。
 */
function callerOf(v: Variant | undefined, argc: number, who: string): (args: Variant[]) => Variant | null {
  const inner = v === undefined ? undefined : (v.v as Record<string, unknown>);
  const fn = inner === undefined ? undefined : (inner[CALLABLE] as Fn | undefined);
  if (typeof fn !== "function") {
    throw new UnsupportedError("array-callable", `Array.${who}() 需要一个 Callable`);
  }
  if (fn.length !== argc) return () => null;
  return (args) => wrapValue(fn(...args));
}

/** 单实参谓词：`filter`/`map`/`any`/`all`/`find_custom`/`rfind_custom` 收到的都是 `f(元素)`。 */
function predOf(v: Variant | undefined, who: string): (x: Variant) => Variant | null {
  const call = callerOf(v, 1, who);
  return (x) => call([x]);
}

/**
 * `sort_custom` / `bsearch_custom` 的比较实参：Godot 传进来的是 Callable，
 * f(a,b) 为真表示 a 该在 b 前（`func(a, b): return a < b` 是升序）。
 * 实参个数对不上时实测比较器恒不成立（`[2,1].sort_custom(func(x): return true)` 保持 [2, 1]）。
 */
function comparatorOf(v: Variant | undefined, who: string): (a: Variant, b: Variant) => boolean {
  const call = callerOf(v, 2, who);
  return (x, y) => {
    const r = call([x, y]);
    return r !== null && truthyOf(r);
  };
}

function one(args: Variant[], who: string): Variant {
  const a = args[0];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少参数`);
  return a;
}

function argAt(args: Variant[], i: number, who: string): Variant {
  const a = args[i];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少第 ${i} 个参数`);
  return a;
}

function intArg(args: Variant[], i: number, who: string): number {
  const a = args[i];
  if (a === undefined || a.t !== Tag.INT) {
    throw new UnsupportedError("need-int-arg", `${who} 的第 ${i} 个参数需要 int`);
  }
  // 载荷可能是 bigint（超出 2^53）：这些位置都是长度/索引，只能是裸 number。
  return intToNum(a.v as IntPayload);
}

/** 可选 int 参：省略时取 Godot 的默认值（实测 `"abc".substr(2)` → "c"，长度默认到串尾） */
function intArgOr(args: Variant[], i: number, dflt: number): number {
  const a = args[i];
  if (a === undefined) return dflt;
  if (a.t !== Tag.INT) throw new UnsupportedError("need-int-arg", `第 ${i} 个参数需要 int`);
  return intToNum(a.v as IntPayload);
}

function boolArg(args: Variant[], i: number, who: string): boolean {
  const a = args[i];
  if (a === undefined || a.t !== Tag.BOOL) {
    throw new UnsupportedError("need-bool-arg", `${who} 的第 ${i} 个参数需要 bool`);
  }
  return a.v as boolean;
}

/** 可选 bool 参：省略时取 Godot 的默认值（实测 duplicate()/slice() 的 deep、merge 的 overwrite 都默认 false） */
function boolArgOr(args: Variant[], i: number, dflt: boolean): boolean {
  const a = args[i];
  if (a === undefined) return dflt;
  if (a.t !== Tag.BOOL) throw new UnsupportedError("need-bool-arg", `第 ${i} 个参数需要 bool`);
  return a.v as boolean;
}
