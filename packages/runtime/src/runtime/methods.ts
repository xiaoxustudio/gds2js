import { GodotRuntimeError, UnsupportedError } from "./errors";
import { md5Hex } from "./md5";
import { HEX_PREFIX_RE, HEX_RE, INT_RE, hashDjb2, strHexToInt, toBool, toFloat, toInt } from "./builtins";
import { strToInt, strToFloat } from "./numstr";
import { CallableBox, boundArgsOf, callableArityBounds, classNameOf, declaredArgCount, descOf, fieldTypesOf, getMeta, hasMeta, isCallableBox, isNullCallable, isVariant, methodAritiesOf, nativeBaseOf, nullCallable, requiredArgCount, removeMeta, setMeta, staticCall, hasStaticName, staticNamesOf, varSlotOf, staticVarsOf, wrapValue, GdScriptObject, methodCallable, ClassDesc, type Fn } from "./object";
import { Signal } from "./signal";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, strAt, strCapitalize, strCase, strContains, strEdge, strFind, strFormat, strJoin, strLength, strReplace, strSplit,
  strSplitCapped, strSubstr, toStringNameSlot, truthyOf } from "./values";
import { isLess } from "./ops";
import { GVector2, toVec2, vecReadIndex, vecWrite, vector2Method } from "./vector2";
import { GVector3, vec3ReadIndex, vec3Write, vector3Method } from "./vector3";
import { GVector2i, toVec2i, vec2iReadIndex, vec2iWrite, vector2iMethod } from "./vector2i";
import { asVec3i, GVector3i, toVec3, toVec3i, vec3iReadIndex, vec3iWrite, vector3iMethod } from "./vector3i";
import { colorMethod, colorRead, colorWrite, GColor, toColor } from "./color";
import { bytesReadIndex, bytesMethod, bytesWriteIndex, GBytes, packItems } from "./packed";

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

/** `Object.call` / `callv` 报错文本里的 `RefCounted (Thing)` 标签：与形参槽、`get_class()` 同一批登记。 */
function objectBaseLabel(inner: unknown): string {
  const cls = classNameOf(inner);
  const native = nativeBaseOf(inner);
  if (native !== null && cls !== null) return `${native} (${cls})`;
  if (native !== null) return native;
  if (cls !== null) return cls;
  throw new UnsupportedError("object-call-base", "call/callv 的报错还不知道这个对象的基类标签");
}

/** `callv(name, args)` 的第二个实参：必须是 Array，元素原样当实参用。 */
function callvArgs(v: Variant | undefined): Variant[] {
  if (v === undefined || v.t !== Tag.ARRAY) {
    throw new GodotRuntimeError("object-callv", "callv() 的第二个实参需要是 Array");
  }
  return (v.v as GArray).raw().slice();
}

/** 声明类型槽的写入值折算；字段写与静态变量写**共用这一张表**，避免两套规则各写一遍。 */
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
  if (kind === "Vector2i") return toVec2i(value);
  if (kind === "Vector3") return toVec3(value);
  if (kind === "Vector3i") return toVec3i(value);
  if (kind === "Color") return toColor(value);
  if (kind === "StringName") return toStringNameSlot(value);
  return value;
}

/** 静态方法调用：`A.f()` 与 `p.f()` 两条路都汇到这里，入口表在登记时就建好，这里只按名字取用。 */
function callStatic(desc: ClassDesc, name: string, args: Variant[]): Variant {
  return staticCall(desc, name, args);
}

/** 在接收者上按名字调一个方法：`this` 由方法调用表达式天然给对，所以不需要 `Function.prototype.apply`（它在静态编译目标上没有 lowering）。 */
function callSlot(recv: unknown, name: string, args: Variant[]): Variant | null {
  // 一次 `instanceof` 收窄，真正的「按名字找方法」在**子类生成的 `__gdDispatch`** 里 —— 运行时全程不 cast 动态值。
  return recv instanceof GdScriptObject ? recv.__gdDispatch(name, args) : null;
}

/** 接收者（实例、类值、或「脚本值」那一格）→ 它的 desc；不是脚本类给 null。 */
function descFor(inner: unknown): ClassDesc | null {
  return descOf(inner);
}

/** `Callable()`（空 Callable）与 `Callable(对象, "方法名")` 两个构造式；一参形在 Godot 是解析期那句，运行期先响亮拒。 */
export function callableCtor(args: Variant[]): Variant {
  if (args.length === 0) return nullCallable();
  if (args.length === 2) {
    const [obj, name] = args as [Variant, Variant | undefined];
    if (name === undefined || (name.t !== Tag.STRING && name.t !== Tag.STRING_NAME)) {
      throw new UnsupportedError("callable-ctor", "Callable(对象, 名字) 的第二个实参量过的是方法名字符串");
    }
    return attribute(obj, String(name.v)) as Variant;
  }
  throw new UnsupportedError(
    "callable-ctor",
    `Callable() 只量过 0 参与 2 参（收到 ${args.length} 个；1 参那一格在 Godot 是解析期拒）`,
  );
}

/** 调一个 Callable 盒子：调用实参排在绑定实参**之前**；lambda 走盒子带的式子，方法 / 静态方法交 `method()` 按名派发。 */
function callCallableBox(box: CallableBox, args: Variant[]): Variant {
  const all: Variant[] = [];
  for (const a of args) all.push(a);
  for (const b of box.bound) all.push(b);
  if (box.fn !== null) return wrapValue(box.fn(all));
  if (box.name !== null && box.object !== null) return method(box.object, box.name, all);
  throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
}

/** `Callable.call()` 的实参数量：**给的 + 绑的** 对不上声明数就是运行期那句 `Invalid call to function '<标签> (Callable)'. Expected <N> argument(s).`，少给报必填数、多给报全部数。 */
function callableCall(box: CallableBox, args: Variant[]): Variant {
  if (isNullCallable(box)) {
    throw new GodotRuntimeError("callable-null-call", "Attempt to call function 'null::null (Callable)' on a null instance.");
  }
  const bounds = callableArityBounds(box);
  if (bounds !== null) {
    const given = args.length + boundArgsOf(box).length;
    if (given < bounds[0] || given > bounds[1]) {
      const n = given < bounds[0] ? bounds[0] : bounds[1];
      throw new GodotRuntimeError(
        "callable-arity",
        `Invalid call to function '${callableCallLabel(box)} (Callable)'. Expected ${n} argument(s).`,
      );
    }
  }
  return callCallableBox(box, args);
}

/** 那句报错里的**函数标签**，四种接收者四种形状：lambda → `<anonymous lambda>(lambda)`；静态方法 → `GDScript::<名字>`；内部类实例 → 只印原生基类 `RefCounted::<名字>`；外层脚本自己的方法要产物知道 `.gd` 的名字，响亮拒。 */
function callableCallLabel(box: CallableBox): string {
  const name = box.name;
  if (name === null) return "<anonymous lambda>(lambda)";
  const inner = box.object?.v;
  if (inner !== undefined && hasStaticName(inner, name)) return `GDScript::${name}`;
  const native = inner === undefined ? null : nativeBaseOf(inner);
  if (native === null) throw new UnsupportedError("callable-arity-label", "还不知道这个 Callable 的函数标签");
  if (native === "RefCounted") return `RefCounted::${name}`;
  throw new UnsupportedError("callable-arity-label", `${native} 的函数标签要脚本文件名（docs/SEMANTICS.md §6 的挂账），这一格没发出去过`);
}

/** Callable 的方法面：方法 Callable、静态方法 Callable、lambda、`Callable()` 空 Callable 四种形状共用这一张表。 */
function callableMethod(box: CallableBox, name: string, args: Variant[]): Variant {
  const bound = boundArgsOf(box);
  const empty = isNullCallable(box);
  switch (name) {
    case "bind": {
      // 绑定串排在**前面**；实参拼接不用 spread —— 静态编译目标上没有它的 lowering
      const next: Variant[] = [];
      for (const a of args) next.push(a);
      for (const b of bound) next.push(b);
      return V.object(new CallableBox(box.fn, box.name, box.object, next, box.arity));
    }
    case "get_bound_arguments":
      return V.array(GArray.of(bound.slice()));
    case "get_argument_count": {
      // 语义是「**还要几个实参**」= 声明形参数 − 绑定数，不是「只要 bind 过就给 0」
      const declared = declaredArgCount(box);
      if (declared === null) {
        throw new UnsupportedError(
          "callable-arity-count",
          "get_argument_count() 拿不到这个 Callable 的声明形参数（方法表里没有它，或它带默认值形参 —— 那一格没量）",
        );
      }
      return V.int(declared - bound.length);
    }
    case "call":
      return callableCall(box, args);
    case "call_deferred": {
      if (empty) throw new UnsupportedError("callable-deferred-null", "空 Callable 上 call_deferred() 没量过");
      setTimeout(() => {
        callCallableBox(box, args);
      }, 0);
      return V.nil();
    }
    case "callv": {
      const arr = args[0];
      if (arr === undefined || !(arr.v instanceof GArray)) {
        throw new GodotRuntimeError("callable-callv", "callv() 需要一个 Array 实参");
      }
      // 空 Callable 的 `callv` **不报错也不调**，给 null
      if (empty) return V.nil();
      const given = (arr.v as GArray).raw();
      // `callv` 的数量不合式**既不报错也不调用**，安静给 null —— 与 `call()` 那两句正相反，照 `call` 那样抛就把「安静给 null」变成了「抛错」
      const bounds = callableArityBounds(box);
      if (bounds !== null) {
        const total = given.length + bound.length;
        if (total < bounds[0] || total > bounds[1]) return V.nil();
      }
      return callCallableBox(box, given);
    }
    case "get_method": {
      const m = box.name;
      if (m !== null) return V.str(m);
      // 空 Callable 给**空串**；lambda 给字面量 `<anonymous lambda>`
      if (empty) return V.str("");
      return V.str("<anonymous lambda>");
    }
    case "is_null":
      // 四种形状里只有空 Callable 为真；绑过实参就不再是空的
      return V.bool(empty && bound.length === 0);
    case "is_valid":
      if (empty && bound.length > 0) {
        throw new UnsupportedError("callable-is-valid-bound-null", "绑过实参的空 Callable 上 is_valid() 没量过");
      }
      // 空 Callable 假；lambda / 静态方法 / 方法 Callable 真
      return V.bool(!empty);
  }
  throw new UnsupportedError("callable-method", `Callable.${name}() 未实现`);
}

export function method(raw: unknown, name: string, args: Variant[]): Variant {
  const obj = norm(raw);
  if (obj.t === Tag.STRING_NAME) return method(V.str(obj.v as string), name, args);

  if (obj.t === Tag.OBJECT) {
    const inner = obj.v;

    if (inner instanceof GVector2) return vector2Method(inner, name, args);
    if (inner instanceof GVector3) return vector3Method(inner, name, args);
    if (inner instanceof GVector2i) return vector2iMethod(inner, name, args);
    if (inner instanceof GVector3i) return vector3iMethod(inner, name, args);
    if (inner instanceof GColor) return colorMethod(inner, name, args);
    if (inner instanceof GBytes) return bytesMethod(inner, name, args);

    if (inner instanceof Signal) {
      if (name === "emit") {
        inner.emitList(args);
        return V.nil();
      }
      if (name === "connect") {
        const cb = args[0];
        if (cb === undefined || !isCallableBox(cb.v)) {
          throw new UnsupportedError("signal-connect", "connect() 的 Callable 实参这一格没量过（非 Callable 来源）");
        }
        // flags 只认 int 来源；其余值响亮拒，不静默按 0 处理
        const flags = args.length > 1 ? (args[1] as Variant) : V.int(0);
        if (flags.t !== Tag.INT) {
          throw new UnsupportedError("signal-flag", "connect() 的 flags 只量过 int 来源");
        }
        // flags 认 0 / 1 / 2 / 4 / 8。**1（CONNECT_DEFERRED）故意不发** —— 局部实例在 `_initialize` 返回时被回收、Godot 一声不响丢弃，而我们的盒子对接收者是强引用，排干队列就从「两边都不印」变成「Godot 不印、我们多印一行」= 静默错；要发这一格得先有宿主的对象生命周期模型。
        const n = Number(flags.v);
        if (n === 1) {
          throw new UnsupportedError("signal-flag-deferred", "connect() 的 CONNECT_DEFERRED 要宿主先有对象生命周期模型，否则局部实例那一形会从静默丢行变成静默多印");
        }
        if (n !== 0 && n !== 2 && n !== 4 && n !== 8) {
          throw new UnsupportedError("signal-flag", `connect() 的 flags=${n} 没量过（只量过 0 / 1 / 2 / 4 / 8）`);
        }
        const box = cb.v as CallableBox;
        return V.int(inner.connectTo(box, (a: Variant[]) => {
          callCallableBox(box, a);
        }, n));
      }
      if (name === "disconnect") {
        const cb = args[0];
        if (cb === undefined || !isCallableBox(cb.v)) {
          throw new UnsupportedError("signal-disconnect", "disconnect() 的 Callable 实参这一格没量过（非 Callable 来源）");
        }
        inner.disconnectFrom(cb.v as CallableBox);
        return V.nil();
      }
      if (name === "get_name") return V.str(inner.sigName);
      if (name === "is_null") return V.bool(false);
      // 这三个名字在 Signal 上**不存在**，而且是**运行期**那句 `Invalid call. Nonexistent function 'X' in base 'Signal'.`（`is_valid` 那一格是解析期拦的，不同）
      if (name === "has_method" || name === "get_method_list" || name === "is_connected_to") {
        throw new GodotRuntimeError("signal-method", `Invalid call. Nonexistent function '${name}' in base 'Signal'.`);
      }
      throw new UnsupportedError("signal-method", `Signal.${name}() 未实现`);
    }

    if (isCallableBox(inner)) {
      return callableMethod(inner, name, args);
    }

    if (inner instanceof ClassDesc) {
      if (name === "new") return V.object(inner.make(args));
      if (hasStaticName(inner, name)) return callStatic(inner, name, args);
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
        hasStaticName(inner, key),
      );
    }
    if (name === "get_class") {
      const base = nativeBaseOf(inner);
      if (base === null) throw new UnsupportedError("get-class", `get_class() 还不知道这个类的原生基类`);
      return V.str(base);
    }
    if (name === "is_class") {
      const a0 = args[0] as Variant | undefined;
      if (a0 === undefined || (a0.t !== Tag.STRING && a0.t !== Tag.STRING_NAME)) {
        throw new GodotRuntimeError("is-class", "is_class() 需要一个 String 实参");
      }
      const base = nativeBaseOf(inner);
      if (base === null) throw new UnsupportedError("is-class", "is_class() 还不知道这个类的原生基类");
      // 认的是**引擎那条链**，脚本类名不在里面：`is_class("Thing")` 假，`is_class("RefCounted")` 与 `is_class("Object")` 真
      const want = a0.v as string;
      return V.bool(want === base || want === "Object");
    }
    if (name === "set" || name === "get") {
      const key = args[0] as Variant | undefined;
      if (key === undefined || (key.t !== Tag.STRING && key.t !== Tag.STRING_NAME)) {
        throw new GodotRuntimeError("object-setget", `${name}() 的第一个实参需要是属性名（String）`);
      }
      const prop = key.v as string;
      if (name === "get") {
        // 未知键静默给 null；**方法名给的是 Callable**，字段就是字段值
        if (args.length !== 1) throw new GodotRuntimeError("arity", `get() 需要 1 个参数（收到 ${args.length} 个）`);
        if (!(prop in (inner as Record<string, unknown>))) return V.nil();
        return wrapValue(attribute(obj, prop));
      }
      if (args.length !== 2) throw new GodotRuntimeError("arity", `set() 需要 2 个参数（收到 ${args.length} 个）`);
      // 键不存在或槽装不下都是**静默无操作**（读回来还是原样）；未定型字段照旧自由赋值
      if (!Object.hasOwn(inner as object, prop)) return V.nil();
      try {
        writeProp(obj, prop, args[1] as Variant);
      } catch (e) {
        if (e instanceof GodotRuntimeError) return V.nil();
        throw e;
      }
      return V.nil();
    }
    if (name === "call" || name === "callv") {
      const fname = args[0] as Variant | undefined;
      if (fname === undefined || (fname.t !== Tag.STRING && fname.t !== Tag.STRING_NAME)) {
        throw new GodotRuntimeError("object-call", `${name}() 的第一个实参需要是方法名（String）`);
      }
      const who = fname.v as string;
      const label = objectBaseLabel(inner);
      const fn = (inner as Record<string, unknown>)[who];
      if (typeof fn !== "function") {
        throw new GodotRuntimeError("object-call", `Invalid call. Nonexistent function '${who} (via call)' in base '${label}'.`);
      }
      const rest = name === "call" ? (args.slice(1) as Variant[]) : callvArgs(args[1] as Variant | undefined);
      // 必填数 = 第一个带默认值之前的形参数，最多数由产物登记；两个数都从发射器那张表拿（JS 的 `fn.length` 在静态编译目标上没有 lowering）
      const declared = methodAritiesOf(inner)?.[who];
      if (declared === undefined) {
        throw new UnsupportedError("object-call-arity", `Object.call() 拿不到 ${who}() 的声明形参数（方法表里没有它）`);
      }
      const min = declared[0];
      const max = declared[1];
      if (rest.length < min || rest.length > max) {
        if (name === "callv") {
          // `callv` 不合式**不抛**，返回 null
          return V.nil();
        }
        throw new GodotRuntimeError(
          "object-call",
          `Invalid call to function '${who} (via call)' in base '${label}'. Expected ${max} argument(s).`,
        );
      }
      const hit = callSlot(inner, who, rest);
      if (hit === null) {
        throw new UnsupportedError("method-slot-missing", `${who}() 在接收者上不可调用（注册表与产物不一致）`);
      }
      return hit;
    }
    if (name === "call_deferred") {
      const fname = args[0] as Variant | undefined;
      if (fname === undefined || (fname.t !== Tag.STRING && fname.t !== Tag.STRING_NAME)) {
        throw new GodotRuntimeError("object-call", `call_deferred() 的第一个实参需要是方法名（String）`);
      }
      const who = fname.v as string;
      const fn = (inner as Record<string, unknown>)[who];
      if (typeof fn !== "function") {
        // 「方法不存在」与「实参不合式」的确切文本未定 → 响亮拒
        throw new UnsupportedError("object-call-deferred", `call_deferred("${who}") 的方法不存在，失败形状也没量过`);
      }
      // `call_deferred()` 的**返回值就是 null**，真正的调用排在后面
      const rest = args.slice(1) as Variant[];
      setTimeout(() => {
        callSlot(inner, who, rest);
      }, 0);
      return V.nil();
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

    const direct = callSlot(inner, name, args);
    if (direct !== null) return direct;

    const sd = descFor(inner);
    // 静态方法按名调用（`Inner.make()` 与 `p.make()` 两条接收者都到这里）：类值不在派发表里，走 desc 的显式静态表
    if (sd !== null && hasStaticName(sd, name)) return callStatic(sd, name, args);
    // 走到这里说明注册表与产物不一致：实例上确有这个函数，发射器却没把它进表 → 响亮拒
    if (inner instanceof GdScriptObject) {
      const member = (inner as unknown as Record<string, unknown>)[name];
      if (typeof member === "function") {
        throw new UnsupportedError("method-slot-missing", `${name}() 不在 ${classNameOf(inner) ?? "Object"} 的派发表里（脚本类的方法都由发射器进了表）`);
      }
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
          // `join` 在 Array 上**根本没有**（它是 String 的方法）：接收者是推断出来的 var 时解析期放过，运行期给下面那句
          if (name === "join") throw new GodotRuntimeError("array-no-method", `Invalid call. Nonexistent function 'join' in base 'Array'.`);
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
          // 字典上同样没有 `join`
          if (name === "join") throw new GodotRuntimeError("dict-no-method", `Invalid call. Nonexistent function 'join' in base 'Dictionary'.`);
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
        case "replace":
        case "replacen":
        case "find":
        case "findn":
        case "rfind":
        case "rfindn": {
          const min = name.startsWith("find") || name.startsWith("rfind") ? 1 : 2;
          if (args.length < min) {
            throw new GodotRuntimeError(
              "arity",
              `Too few arguments for "${name}()" call. Expected at least ${min} but received ${args.length}.`,
            );
          }
          if (args.length > 2) {
            throw new GodotRuntimeError(
              "arity",
              `Too many arguments for "${name}()" call. Expected at most 2 but received ${args.length}.`,
            );
          }
          const insensitive = name.endsWith("n");
          if (min === 2) {
            return V.str(
              strReplace(s, asString(args[0] as Variant, name), asString(args[1] as Variant, name), insensitive),
            );
          }
          const needle = asString(args[0] as Variant, name);
          const from = args.length === 2 ? intArg(args, 1, name) : name.startsWith("r") ? -1 : 0;
          return V.int(strFind(s, needle, from, name.startsWith("r"), insensitive));
        }
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
        case "capitalize":
          if (args.length !== 0) {
            throw new GodotRuntimeError("arity", `capitalize() 不接受参数（收到 ${args.length} 个）`);
          }
          return V.str(strCapitalize(s));
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
  if (obj.t === Tag.OBJECT && obj.v instanceof GVector3i) return vec3iReadIndex(obj.v as GVector3i, idx);
  if (obj.t === Tag.OBJECT && obj.v instanceof GColor) return colorRead(obj.v as GColor, idx, "read");
  if (obj.t === Tag.OBJECT && obj.v instanceof GBytes) return bytesReadIndex(obj.v as GBytes, idx);
  throw new UnsupportedError("index-type", `类型 ${obj.t} 不支持下标`);
}

/** 属性写的那条错：未知键、往 String 槽塞 int、写方法名**三条文本一模一样**，所以合成一个助手；基类那一段是 `RefCounted (内建类名)`，拿不到注册名就退成 Object。 */
function propAssignError(key: string, value: Variant, inner: unknown): GodotRuntimeError {
  return new GodotRuntimeError(
    "prop-assign",
    `Invalid assignment of property or key '${key}' with value of type '${tagName(value.t)}' on a base object of type 'RefCounted (${classNameOf(inner) ?? "Object"})'.`,
  );
}

/** 属性写 `base.key = value`：入口与 `method` / `attribute` 一样要**归一裸值**；基是值类型时只回报新值（写回目标是变量还是容器的一格，发射器才知道），返回 null 表示原地处理完。 */
export function writeProp(raw: unknown, key: string, value: Variant): Variant | null {
  const base = norm(raw);
  const vec = base.t === Tag.OBJECT && base.v instanceof GVector2 ? (base.v as GVector2) : null;
  const vec3 = base.t === Tag.OBJECT && base.v instanceof GVector3 ? (base.v as GVector3) : null;
  if (vec3 !== null) return vec3Write(vec3, V.str(key), value, "prop");
  const vec2i = base.t === Tag.OBJECT && base.v instanceof GVector2i ? (base.v as GVector2i) : null;
  if (vec2i !== null) return vec2iWrite(vec2i, V.str(key), value, "prop");
  const vec3i = asVec3i(base);
  if (vec3i !== null) return vec3iWrite(vec3i, V.str(key), value, "prop");
  const col = base.t === Tag.OBJECT && base.v instanceof GColor ? (base.v as GColor) : null;
  if (col !== null) return colorWrite(col, V.str(key), value, "prop");
  if (
    base.t === Tag.OBJECT &&
    base.v !== null &&
    (typeof base.v === "function" || typeof base.v === "object")
  ) {
    const sd = descFor(base.v);
    const svars = sd === null ? null : sd.staticVars;
    const slot = sd === null ? null : varSlotOf(sd, key);
    if (sd !== null && svars !== null && slot !== null) {
      slot.set(intoSlot(svars[key], value, key, base.v));
      return null;
    }
  }
  const objInner = base.t === Tag.OBJECT
    && base.v !== null
    && typeof base.v === "object"
    && !(base.v instanceof GVector2 || base.v instanceof GVector3 || base.v instanceof GVector2i || base.v instanceof GVector3i || base.v instanceof GColor || base.v instanceof GBytes || base.v instanceof Signal)
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

/** `v[0] = E`：基是值类型就回报新值，容器/字典的下标赋值原地处理（返回 null）；基收 `unknown` 是因为发射器递来的读式（`rt.attribute` / `rt.index`）就是这个类型。 */
export function writeIdx(raw: unknown, idx: Variant, value: Variant): Variant | null {
  const base = norm(raw);
  if (base.t === Tag.OBJECT && base.v instanceof GVector2) {
    return vecWrite(base.v as GVector2, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector3) {
    return vec3Write(base.v as GVector3, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector2i) {
    return vec2iWrite(base.v as GVector2i, idx, value, "index");
  }
  if (base.t === Tag.OBJECT && base.v instanceof GVector3i) {
    return vec3iWrite(base.v as GVector3i, idx, value, "index");
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
/**
 * `for x in <数>` 是「从 0 数到那个数」：整数给 `0..n-1`、float 给 `0.0..`，n<=0 空转（4.6.3 实测，见 SEMANTICS S202）。
 * 计数口径与 `rangeSeq` 同一条 —— 都是先展开成数组再走 for-of。
 */
export function iter(v: Variant): Variant[] {
  if (v.t === Tag.ARRAY) return (v.v as GArray).raw();
  if (v.t === Tag.DICT) return (v.v as GDict).keys();
  if (v.t === Tag.STRING) return [...(v.v as string)].map((c) => V.str(c));
  if (v.t === Tag.INT) {
    const n = intToNum(v.v as IntPayload);
    if (!Number.isSafeInteger(n)) {
      throw new UnsupportedError("iter-count", `for 的整数上界超出 2^53 安全整数范围（${String(v.v)}）`);
    }
    const out: Variant[] = [];
    for (let i = 0; i < n; i++) out.push(V.int(i));
    return out;
  }
  if (v.t === Tag.FLOAT) {
    const end = v.v as number;
    if (!Number.isFinite(end)) {
      throw new UnsupportedError("iter-count", `for 的 float 上界是 ${String(end)}，展不开`);
    }
    const out: Variant[] = [];
    for (let i = 0; i < end; i++) out.push(V.float(i));
    return out;
  }
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) return packItems(v.v as GBytes);
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
    const vec3i = obj.v instanceof GVector3i ? (obj.v as GVector3i) : null;
    if (vec3i && (name === "x" || name === "y" || name === "z")) return V.int(vec3i[name]);
    const col = obj.v instanceof GColor ? (obj.v as GColor) : null;
    if (col !== null) return colorRead(col, V.str(name), "prop");
    if (obj.v instanceof GBytes) {
      throw new UnsupportedError("packed-attribute", `PackedByteArray 没有 ${name} 这个成员（这一族的成员全是方法，属性面没实测过）`);
    }
    const inner = obj.v as Record<string, unknown>;
    const sd = descFor(inner);
    if (sd !== null && hasStaticName(sd, name)) {
      // 接收者带**类身份**：静态方法 Callable 的形参数与等式都按 (类, 方法名) 判；盒子存 `(a) => staticCall(desc, name, a)` —— 不 spread、不 bind，静态编译目标两样都没有 lowering
      return methodCallable(V.object(sd), name);
    }
    const svars = sd === null ? null : sd.staticVars;
    if (svars !== null && sd !== null && name in svars) {
      const hit = varSlotOf(sd, name);
      if (hit !== null) return hit.get();
    }
    if (!(inner instanceof ClassDesc) && name in inner) {
      const v = inner[name];
      if (typeof v === "function") return methodCallable(obj, name);
      return v;
    }
  }
  if (obj.t === Tag.NIL) {
    throw new GodotRuntimeError("nil-attribute", `对 null 取属性 ${name}`);
  }
  throw new UnsupportedError("attribute", `取属性 ${name} 未实现（对象模型还没做完）`);
}

/** Callable 实参：Godot **严格按声明的实参个数**调用，对不上整次调用就失败 —— 返回的调用器用 `null` 表示「这次调用失败」。 */
function callerOf(v: Variant | undefined, argc: number, who: string): (args: Variant[]) => Variant | null {
  const inner = v === undefined ? undefined : v.v;
  if (!(inner instanceof CallableBox)) {
    throw new UnsupportedError("array-callable", `Array.${who}() 需要一个 Callable`);
  }
  if (requiredArgCount(inner) !== argc) return () => null;
  return (args) => callCallableBox(inner, args);
}

/** 单实参谓词：`filter`/`map`/`any`/`all`/`find_custom`/`rfind_custom` 收到的都是 `f(元素)`。 */
function predOf(v: Variant | undefined, who: string): (x: Variant) => Variant | null {
  const call = callerOf(v, 1, who);
  return (x) => call([x]);
}

/** `sort_custom` / `bsearch_custom` 的比较实参：f(a,b) 为真表示 a 该在 b 前；实参个数对不上时比较器恒不成立。 */
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

/** 可选 int 参：省略时取 Godot 的默认值。 */
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

/** 可选 bool 参：省略时取 Godot 的默认值。 */
function boolArgOr(args: Variant[], i: number, dflt: boolean): boolean {
  const a = args[i];
  if (a === undefined) return dflt;
  if (a.t !== Tag.BOOL) throw new UnsupportedError("need-bool-arg", `第 ${i} 个参数需要 bool`);
  return a.v as boolean;
}
