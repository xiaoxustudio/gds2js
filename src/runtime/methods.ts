import { GodotRuntimeError, UnsupportedError } from "./errors";
import { CALLABLE, isVariant, wrapValue, type Fn } from "./object";
import { Signal } from "./signal";
import { Tag, V, intToNum, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, strAt, strCase, strFormat, strLength, strSubstr } from "./values";
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
          return V.array(a.duplicate());
        case "size":
          return V.int(a.size());
        case "has":
          return V.bool(a.has(one(args, "has")));
        case "sort":
          a.sort();
          return V.nil();
        case "concat":
          return V.array(a.concat(asArray(one(args, "concat"), "concat")));
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
          return d.get(one(args, "get"));
        case "set":
          d.set(args[0] as Variant, args[1] as Variant);
          return V.nil();
        case "duplicate":
          return V.dict(d.duplicate());
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
          return V.str(strSubstr(s, intArg(args, 0, "substr"), intArg(args, 1, "substr")));
        case "to_upper":
          return V.str(strCase(s, "upper"));
        case "to_lower":
          return V.str(strCase(s, "lower"));
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

function one(args: Variant[], who: string): Variant {
  const a = args[0];
  if (a === undefined) throw new GodotRuntimeError("arity", `${who} 缺少参数`);
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
