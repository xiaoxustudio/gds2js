import { GodotRuntimeError, UnsupportedError } from "./errors";
import { md5Hex } from "./md5";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt } from "./builtins";
import { strToInt, strToFloat } from "./numstr";
import { CALLABLE, CALLABLE_NAME, CALLABLE_OBJECT, callableOf, classNameOf, fieldTypesOf, getMeta, hasMeta, isVariant, nativeBaseOf, removeMeta, setMeta, staticMethodsOf, staticVarsOf, wrapValue, type Fn } from "./object";
import { Signal } from "./signal";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, strAt, strCase, strContains, strEdge, strFormat, strJoin, strLength, strSplit,
  strSplitCapped, strSubstr, truthyOf } from "./values";
import { isLess } from "./ops";
import { GVector2, toVec2, vecReadIndex, vecWrite, vector2Method } from "./vector2";
import { GVector3, vec3ReadIndex, vec3Write, vector3Method } from "./vector3";
import { GVector2i, vec2iReadIndex, vec2iWrite, vector2iMethod } from "./vector2i";
import { colorMethod, colorRead, colorWrite, GColor } from "./color";
import { bytesReadIndex, bytesMethod, bytesWriteIndex, GBytes } from "./packed";

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

/**
 * 声明类型槽的写入值（S150 实测的那五种 + 「没实测过的槽原样存」）。
 * 字段写与静态变量写**共用这一张表** —— 两套规则各写一遍正是 S154 警告过的分叉温床。
 */
function intoSlot(kind: string | undefined, value: Variant, key: string, owner: unknown): Variant {
  if (kind === undefined) return value;
  if (kind === "int") return toInt(value);
  if (kind === "float") return toFloat(value);
  if (kind === "bool") return toBool(value);
  if (kind === "String") {
    if (value.t === Tag.STRING) return value;
    if (value.t === Tag.STRING_NAME) return V.str(value.v as string);
    throw propAssignError(key, value, owner);
  }
  if (kind === "Vector2") return toVec2(value);
  return value;
}

/** 静态方法调用：`A.f()` 与 `p.f()` 两条路都汇到这里（实测 S160 两者结果一样）。
 * 接收者给构造器本身，与 GDScript「静态方法没有 self」一致 —— 发出去的产物里静态方法
 * 也只用 `A.x` 这种具名形式碰自己的类，不依赖 `this`。
 */
function callStatic(ctor: unknown, name: string, args: Variant[]): Variant {
  return wrapValue(staticFnOf(ctor, name).apply(ctor, args));
}

/**
 * 表里登记过的静态名，构造器上就该有对应的函数。拿不到说明产物与表不一致 —— 响亮报，不静默给 undefined。
 */
function staticFnOf(ctor: unknown, name: string): (...a: Variant[]) => unknown {
  const f = (ctor as Record<string, unknown> | null)?.[name];
  if (typeof f !== "function") {
    throw new UnsupportedError("static-fn-missing", `静态方法 ${name}() 在类上找不到（注册表与产物不一致）`);
  }
  return f as (...a: Variant[]) => unknown;
}

/** 静态成员挂在构造器上，从实例摸要经 constructor。 */
function staticCtorOf(inner: unknown): unknown {
  return typeof inner === "function" ? inner : (inner as { constructor?: unknown })?.constructor;
}

export function method(raw: unknown, name: string, args: Variant[]): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.STRING_NAME) return method(V.str(obj.v as string), name, args);

  if (obj.t === Tag.OBJECT) {
    const inner = obj.v;

    if (inner instanceof GVector2) return vector2Method(inner, name, args);
    if (inner instanceof GVector3) return vector3Method(inner, name, args);
    if (inner instanceof GVector2i) return vector2iMethod(inner, name, args);
    if (inner instanceof GColor) return colorMethod(inner, name, args);
    if (inner instanceof GBytes) return bytesMethod(inner, name, args);

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
      if (name === "get_name") return V.str(inner.sigName);
      if (name === "is_null") return V.bool(false);
      throw new UnsupportedError("signal-method", `Signal.${name}() 未实现`);
    }

    const fn = (inner as Record<string, unknown>)[CALLABLE];
    if (typeof fn === "function") {
      const f = fn as Fn;
      if (name === "call") return wrapValue(f(...args));
      if (name === "call_deferred") {
        setTimeout(() => {
          f(...args);
        }, 0);
        return V.nil();
      }
      if (name === "callv") {
        const arr = args[0];
        if (arr === undefined || !(arr.v instanceof GArray)) {
          throw new GodotRuntimeError("callable-callv", "callv() 需要一个 Array 实参");
        }
        return wrapValue(f(...(arr.v as GArray).raw()));
      }
      if (name === "get_method") {
        const m = (inner as Record<string, unknown>)[CALLABLE_NAME];
        if (typeof m !== "string") {
          throw new UnsupportedError("callable-method", `Callable.${name}() 未实现（这个 Callable 不是方法引用）`);
        }
        return V.str(m);
      }
      if (name === "is_null" || name === "is_valid") {
        const meta = inner as Record<string, unknown>;
        if (typeof meta[CALLABLE_NAME] !== "string" || meta[CALLABLE_OBJECT] === undefined) {
          throw new UnsupportedError("callable-method", `Callable.${name}() 未实现（没实测过这种 Callable）`);
        }
        return V.bool(name === "is_valid");
      }
      throw new UnsupportedError("callable-method", `Callable.${name}() 未实现`);
    }

    if (typeof inner === "function") {
      if (name === "new") {
        const Ctor = inner as new (...a: Variant[]) => object;
        return V.object(new Ctor(...args));
      }
      if (staticMethodsOf(inner)?.has(name)) return callStatic(inner, name, args);
      throw new UnsupportedError("script-method", `脚本上的 ${name}() 未实现`);
    }

    if (name === "has_method") {
      const m = args[0];
      if (m === undefined || (m.t !== Tag.STRING && m.t !== Tag.STRING_NAME)) {
        throw new GodotRuntimeError("has-method", "has_method() 需要一个 String 实参");
      }
      const key = m.v as string;
      return V.bool(
        key === "has_method" || key === "get_class" || key === "set_meta" || key === "get_meta" ||
        key === "has_meta" || key === "remove_meta" ||
        typeof (inner as Record<string, unknown>)[key] === "function" ||
        staticMethodsOf(inner)?.has(key) === true,
      );
    }
    if (name === "get_class") {
      const base = nativeBaseOf(inner);
      if (base === null) throw new UnsupportedError("get-class", `get_class() 还不知道这个类的原生基类`);
      return V.str(base);
    }
    if (name === "set_meta" || name === "get_meta" || name === "has_meta" || name === "remove_meta") {
      const obj = inner as object;
      if (name === "set_meta") {
        if (args.length !== 2) throw new GodotRuntimeError("arity", `set_meta() 需要 2 个参数（收到 ${args.length} 个）`);
        setMeta(obj, args[0] as Variant, args[1] as Variant);
        return V.nil();
      }
      if (name === "has_meta") {
        if (args.length !== 1) throw new GodotRuntimeError("arity", `has_meta() 需要 1 个参数（收到 ${args.length} 个）`);
        return V.bool(hasMeta(obj, args[0] as Variant));
      }
      if (name === "remove_meta") {
        if (args.length !== 1) throw new GodotRuntimeError("arity", `remove_meta() 需要 1 个参数（收到 ${args.length} 个）`);
        removeMeta(obj, args[0] as Variant);
        return V.nil();
      }
      if (args.length > 2 || args.length < 1) throw new GodotRuntimeError("arity", `get_meta() 需要 1 或 2 个参数（收到 ${args.length} 个）`);
      return getMeta(obj, args[0] as Variant, args[1]);
    }

    const member = (inner as unknown as Record<string, unknown>)[name];
    if (typeof member === "function") {
      const f = member as (...a: Variant[]) => unknown;
      return wrapValue(f.apply(inner, args));
    }

    if (staticMethodsOf(inner)?.has(name)) return callStatic(staticCtorOf(inner), name, args);

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
          return V.int(a.insertAt(intArg(args, 0, "insert"), argAt(args, 1, "insert")) ? 0 : 31);
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
          return V.array(
            a.sliceItems(
              intArgOr(args, 0, 0),
              args[1] === undefined ? null : intArg(args, 1, "slice"),
              intArgOr(args, 2, 1),
              boolArgOr(args, 3, false),
            ),
          );
        case "resize": {
          const n = intArg(args, 0, "resize");
          a.resize(n);
          return V.int(n < 0 ? 31 : 0);
        }
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
          const call = callerOf(args[0], 2, "reduce");
          const items = a.raw();
          let acc: Variant;
          let start = 0;
          if (args.length > 1) {
            acc = args[1] as Variant;
          } else {
            if (items.length === 0) return V.nil();
            acc = items[0] as Variant;
            start = 1;
          }
          for (let i = start; i < items.length; i++) {
            const r = call([acc, items[i] as Variant]);
            if (r === null) return V.nil();
            acc = r;
          }
          return acc;
        }
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
          if (args.length > 3) {
            throw new GodotRuntimeError("arity", `split() 最多 3 个参数（收到 ${args.length} 个）`);
          }
          const allow = args[1] === undefined ? true : boolArg(args, 1, "split");
          const dm = asString(one(args, "split"), "split");
          let parts: string[];
          if (args.length === 3) {
            const mx = args[2] as Variant;
            if (mx.t !== Tag.INT) {
              throw new GodotRuntimeError("split-arg", `split() 的第 3 个参数需要 int，收到 ${tagName(mx.t)}`);
            }
            const cap = intToNum(mx.v as IntPayload);
            parts = cap <= 0 ? strSplit(s, dm, allow) : strSplitCapped(s, dm, allow, cap);
          } else {
            parts = strSplit(s, dm, allow);
          }
          return V.array(GArray.of(parts.map((p) => V.str(p))));
        }
        case "to_upper":
          return V.str(strCase(s, "upper"));
        case "to_lower":
          return V.str(strCase(s, "lower"));
        case "to_utf8_buffer": {
          if (args.length !== 0) throw new GodotRuntimeError("arity", `to_utf8_buffer() 不接受参数（收到 ${args.length} 个）`);
          return V.object(new GBytes(Array.from(new TextEncoder().encode(s))));
        }
        case "to_ascii_buffer": {
          if (args.length !== 0) throw new GodotRuntimeError("arity", `to_ascii_buffer() 不接受参数（收到 ${args.length} 个）`);
          if (Array.from(s).some((ch) => (ch.codePointAt(0) as number) > 127)) {
            throw new UnsupportedError("string-ascii-buffer", "to_ascii_buffer() 只实测过纯 ASCII 字符串");
          }
          return V.object(new GBytes(Array.from(s, (ch) => ch.codePointAt(0) as number)));
        }
        case "to_float":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `to_float() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.float(strToFloat(s));
        case "is_valid_float": {
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_float() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]*)?$/.test(s));
        }
        case "join": {
          if (args.length !== 1) {
            throw new GodotRuntimeError(
              "join-arity",
              args.length === 0
                ? `Too few arguments for "join()" call. Expected at least 1 but received 0.`
                : `Too many arguments for "join()" call. Expected at most 1 but received ${args.length}.`,
            );
          }
          const a = args[0] as Variant;
          if (a.t !== Tag.ARRAY) {
            throw new GodotRuntimeError(
              "join-arg",
              a.t === Tag.DICT
                ? `Invalid argument for "join()" function: argument 1 should be "PackedStringArray" but is "Dictionary".`
                : `Cannot pass a value of type "${tagName(a.t)}" as "PackedStringArray".`,
            );
          }
          return V.str(strJoin(s, a.v as GArray));
        }
        case "to_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `to_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(strToInt(s));
        case "is_valid_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `is_valid_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.bool(INT_RE.test(s));
        case "hex_to_int":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `hex_to_int() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(strHexToInt(s));
        case "is_valid_hex_number": {
          if (args.length > 1) {
            throw new GodotRuntimeError("arity", `is_valid_hex_number() 最多 1 个参数（收到 ${args.length} 个）`);
          }
          const withPrefix = args.length === 1 ? boolArg(args, 0, "is_valid_hex_number") : false;
          return V.bool(withPrefix ? HEX_PREFIX_RE.test(s) : HEX_RE.test(s));
        }
        case "hash":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `hash() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.int(hashDjb2(s));
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
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2) return vecReadIndex(obj.v as GVector2, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3) return vec3ReadIndex(obj.v as GVector3, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector2i) return vec2iReadIndex(obj.v as GVector2i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GColor) return colorRead(obj.v as GColor, idx, "read");
  if (obj.t === Tag.OBJECT && obj.v instanceof GBytes) return bytesReadIndex(obj.v as GBytes, idx);
  throw new UnsupportedError("index-type", `类型 ${obj.t} 不支持下标`);
}

/**
 * `v.x = E`：Vector2 是值类型，写它要产出新值再放回原来的存储位，所以这里**只回报新值**，
 * 由生成的代码决定写回哪里（写回目标是变量还是容器的一格，发射器才知道）。
 * 返回 null 表示已经在原地处理完、不需要写回 —— 属性写在 Godot 里只对值类型成立，
 * 别的基（实测 `a[0].x = 5` 里 a[0] 是 int）一律运行时报错。
 */
/**
 * Godot 属性写的那条错：未知键（e1）、往 String 槽塞 int（f10）、写方法名（f11）**三条文本一模一样**，
 * 所以合成一个助手。基类那一段实测是 `RefCounted (Inner)`（内建类）；拿不到注册名就退成 Object。
 */
function propAssignError(key: string, value: Variant, inner: unknown): never {
  throw new GodotRuntimeError(
    "prop-assign",
    `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type 'RefCounted (${classNameOf(inner) ?? "Object"})'.`,
  );
}

/**
 * 属性写 `base.key = value`。入口和 `method` / `attribute` 一样要**归一裸值**：
 * `A.x = 100` 里的 `A` 是发射出去的裸类构造器（类名不是变量），不归一就什么分支都进不去。
 */
export function writeProp(raw: unknown, key: string, value: Variant): Variant | null {
  const base = norm(raw);
  const vec = base.t === Tag.OBJECT && base.v instanceof GVector2 ? (base.v as GVector2) : null;
  const vec3 = base.t === Tag.OBJECT && base.v instanceof GVector3 ? (base.v as GVector3) : null;
  if (vec3 !== null) return vec3Write(vec3, V.str(key), value, "prop");
  const vec2i = base.t === Tag.OBJECT && base.v instanceof GVector2i ? (base.v as GVector2i) : null;
  if (vec2i !== null) return vec2iWrite(vec2i, V.str(key), value, "prop");
  const col = base.t === Tag.OBJECT && base.v instanceof GColor ? (base.v as GColor) : null;
  if (col !== null) return colorWrite(col, V.str(key), value, "prop");
  if (base.t === Tag.OBJECT && (typeof base.v === "function" || (base.v !== null && typeof base.v === "object"))) {
    const svars = staticVarsOf(base.v);
    if (svars !== null && key in svars) {
      (staticCtorOf(base.v) as Record<string, unknown>)[key] = intoSlot(svars[key], value, key, base.v);
      return null;
    }
  }
  const objInner = base.t === Tag.OBJECT
    && base.v !== null
    && typeof base.v === "object"
    && !(base.v instanceof GVector2 || base.v instanceof GVector3 || base.v instanceof GVector2i || base.v instanceof GColor || base.v instanceof GBytes || base.v instanceof Signal)
    ? (base.v as Record<string, unknown>)
    : null;
  if (objInner !== null) {
    const kind = fieldTypesOf(objInner)?.[key];
    if (kind === undefined && !Object.hasOwn(objInner, key)) {
      throw propAssignError(key, value, objInner);
    }
    objInner[key] = intoSlot(kind, value, key, objInner);
    return null;
  }
  if (vec === null) {
    throw new GodotRuntimeError(
      "vector2-write",
      `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type '${tagName(base.t)}'.`,
    );
  }
  return vecWrite(vec, V.str(key), value, "prop");
}

/** `v[0] = E`：基是 Vector2 就回报新值，否则是容器/字典的下标赋值（原地，返回 null）。 */
export function writeIdx(base: Variant, idx: Variant, value: Variant): Variant | null {
  if (base.t === Tag.OBJECT && base.v instanceof GVector2) {
    return vecWrite(base.v as GVector2, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector3) {
    return vec3Write(base.v as GVector3, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector2i) {
    return vec2iWrite(base.v as GVector2i, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GColor) {
    return colorWrite(base.v as GColor, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GBytes) {
    return bytesWriteIndex(base.v as GBytes, idx, value, "index");
  }
  setIndex(base, idx, value);
  return null;
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

export function attribute(raw: unknown, name: string): unknown {
  const obj = norm(raw);
  if (obj.t === Tag.OBJECT) {
    const vec = obj.v instanceof GVector2 ? (obj.v as GVector2) : null;
    if (vec && (name === "x" || name === "y")) return V.float(vec[name]);
    const vec3 = obj.v instanceof GVector3 ? (obj.v as GVector3) : null;
    if (vec3 && (name === "x" || name === "y" || name === "z")) return V.float(vec3[name]);
    const vec2i = obj.v instanceof GVector2i ? (obj.v as GVector2i) : null;
    if (vec2i && (name === "x" || name === "y")) return V.int(vec2i[name]);
    const col = obj.v instanceof GColor ? (obj.v as GColor) : null;
    if (col !== null) return colorRead(col, V.str(name), "prop");
    if (obj.v instanceof GBytes) {
      throw new UnsupportedError("packed-attribute", `PackedByteArray 没有 ${name} 这个成员（这一族的成员全是方法，属性面没实测过）`);
    }
    const inner = obj.v as Record<string, unknown>;
    if (staticMethodsOf(inner)?.has(name)) {
      const ctor = staticCtorOf(inner);
      return callableOf(staticFnOf(ctor, name).bind(ctor) as (...a: unknown[]) => unknown, name);
    }
    const svars = staticVarsOf(inner);
    if (svars !== null && name in svars) {
      return (staticCtorOf(inner) as Record<string, unknown>)[name];
    }
    if (typeof inner !== "function" && name in inner) {
      const v = inner[name];
      if (typeof v === "function") return callableOf(v.bind(inner) as (...a: unknown[]) => unknown, name, obj);
      return v;
    }
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
