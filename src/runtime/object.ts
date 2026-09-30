import { UnsupportedError } from "./errors";
import { Tag, V, tagName, type Variant } from "./tags";
import { GArray, GDict } from "./values";

export const CALLABLE = "__gds2js_callable";
/** 方法 Callable 的方法名与接收者（`get_method()` / `is_null()` / `is_valid()` 要用，实测 f34）。 */
export const CALLABLE_NAME = "__gds2js_callable_name";
export const CALLABLE_OBJECT = "__gds2js_callable_object";

export type Fn = (...args: Variant[]) => Variant;

export function callable(fn: Fn): Variant {
  return V.object({ [CALLABLE]: fn });
}

/**
 * 把已经绑定好 this 的方法包成 Callable（GDScript 里 `fire_zero` 本身就是个 Callable）。
 * 带上 name / obj 是为了 `get_method()`、`is_null()`、`is_valid()` 这几条实测过的谓词；
 * lambda 与「拿不到接收者」的形状一律不带 —— 那些组合没测过，宁可响亮报缺也不猜。
 */
export function callableOf(fn: (...args: unknown[]) => unknown, name?: string, obj?: Variant): Variant {
  const box: Record<string, unknown> = { [CALLABLE]: fn };
  if (name !== undefined) box[CALLABLE_NAME] = name;
  if (obj !== undefined) box[CALLABLE_OBJECT] = obj;
  return V.object(box);
}

export function isVariant(v: unknown): v is Variant {
  return typeof v === "object" && v !== null && typeof (v as Variant).t === "number";
}

export function wrapValue(v: unknown): Variant {
  if (isVariant(v)) return v;
  if (v === null || v === undefined) return V.nil();
  if (typeof v === "boolean") return V.bool(v);
  if (typeof v === "number") {
    return Number.isSafeInteger(v) ? V.int(v) : V.float(v);
  }
  if (typeof v === "string") return V.str(v);
  if (v instanceof GArray) return V.array(v);
  if (v instanceof GDict) return V.dict(v);
  if (Array.isArray(v)) return V.array(GArray.of(v.map(wrapValue)));
  return V.object(v);
}

export function unwrap(v: unknown): unknown {
  return isVariant(v) ? v.v : v;
}

export interface GdClassCtor {
  new (...args: unknown[]): object;
}

const CLASS_REGISTRY = new Map<string, GdClassCtor>();
/** 构造器 → 注册名：属性写报错的 `RefCounted (Inner)` 那一段要用（e1 实测的形体）。 */
const CLASS_NAMES = new WeakMap<GdClassCtor, string>();
/**
 * 构造器 → 「成员名 → 声明类型名」（`var t: int` 这类**带标注的成员**）。
 * 属性写 `p.t = v` 走的是 named-property 那条动态路径，Godot 在那儿**不报解析期错、而是转换**
 * （实测 f5：`p.t = 5.5` → 5、`p.t = "12abc"` → 12、`p.v = Vector2i(3,4)` → (3.0, 4.0)），
 * 所以运行时必须知道字段声明成什么，否则就是把 float 存进 int 槽的静默错。
 */
const FIELD_TYPES = new WeakMap<GdClassCtor, Record<string, string>>();
/**
 * 构造器 → 静态方法名集合（`static func`）。实测 S160：静态方法**三条路都能调**
 * （`A.f()`、`p.f()`、`var cb = A.f`），而 JS 那边它是构造器上的自有属性 —— 实例既看不见
 * 也摸不着，所以这三条都要靠这张表在运行时回退。
 */
const STATIC_METHODS = new WeakMap<GdClassCtor, Set<string>>();

export function registerClass(name: string, ctor: GdClassCtor): void {
  CLASS_REGISTRY.set(name, ctor);
  CLASS_NAMES.set(ctor, name);
}

export function registerFieldTypes(ctor: GdClassCtor, table: Record<string, string>): void {
  FIELD_TYPES.set(ctor, table);
}

/**
 * 实例（或构造器）的声明类型表，没有则 null。
 * **沿原型链并表**：派生类自己的表只登记自有成员，而继承来的带标注成员同样要拿到声明类型
 * （内部类现在能 `extends` 内部类，S174 ④；子类里写 `p.t = 5.5` 仍要按基类声明的 `int` 转成 5）。
 * 每张构造器只算一次，注册行都在产物加载期跑完，用户代码才开始查，所以缓存不会读到半张表。
 */
const FIELD_TYPES_CHAIN = new WeakMap<Function, Record<string, string> | null>();
export function fieldTypesOf(target: unknown): Record<string, string> | null {
  const start = typeof target === "function" ? (target as Function) : (target as { constructor?: Function })?.constructor ?? null;
  if (!start) return null;
  if (FIELD_TYPES_CHAIN.has(start)) return FIELD_TYPES_CHAIN.get(start) ?? null;
  let merged: Record<string, string> | null = null;
  // 从自己的表往上并（子类的声明盖住父类的同名声明）；走到 null 或 JS 原型链的头就停。
  for (let c: Function | null = start; c !== null; c = Object.getPrototypeOf(c) as Function | null) {
    const table = FIELD_TYPES.get(c as GdClassCtor);
    if (table) merged = { ...table, ...(merged ?? {}) };
  }
  FIELD_TYPES_CHAIN.set(start, merged);
  return merged;
}

export function registerStaticMethods(ctor: GdClassCtor, names: string[]): void {
  STATIC_METHODS.set(ctor, new Set(names));
}

/**
 * 构造器 → 「静态变量名 → 声明类型名」（`static var x: int`）。实测 S161：静态变量是**共享的一格**，
 * 类名（`A.x = 100`）、实例（`p.x = 200`）与静态方法里裸写都落在同一格上，
 * 带类型的槽照 S150 那五种规则转换（f17 t7：`A.setx(2.7)` → 2）。
 */
const STATIC_VARS = new WeakMap<GdClassCtor, Record<string, string>>();

export function registerStaticVars(ctor: GdClassCtor, table: Record<string, string>): void {
  STATIC_VARS.set(ctor, table);
}

/** 实例（或构造器）的静态变量表，没有则 null。 */
export function staticVarsOf(target: unknown): Record<string, string> | null {
  const ctor = typeof target === "function" ? (target as GdClassCtor) : (target as { constructor?: GdClassCtor })?.constructor;
  return (ctor && STATIC_VARS.get(ctor)) || null;
}

/**
 * 类（或实例）的静态方法名表。**必须是显式表**：静态方法就是构造器上的自有属性，
 * 拿 `constructor[name]` 鸭子类型去认会把 JS 函数自带的 `name` / `length` 当成方法。
 */
export function staticMethodsOf(target: unknown): Set<string> | null {
  const ctor = typeof target === "function" ? (target as GdClassCtor) : (target as { constructor?: GdClassCtor })?.constructor;
  return (ctor && STATIC_METHODS.get(ctor)) || null;
}

/** 实例（或构造器）的注册名，用于报错文本；拿不到就 null。 */
export function classNameOf(target: unknown): string | null {
  const ctor = typeof target === "function" ? (target as GdClassCtor) : (target as { constructor?: GdClassCtor })?.constructor;
  return (ctor && CLASS_NAMES.get(ctor)) ?? null;
}

/**
 * 构造器 → **原生基类名**（`get_class()` 要返回它）。
 * 实测 f39 t3：外层脚本 `extends SceneTree` 给 `SceneTree`，内部类（没 extends）给 `RefCounted` ——
 * 返回的是**原生基类**而不是脚本类名，所以这张表必须由发射器按基类登记，不能拿注册名顶。
 * 用 WeakMap 按构造器存：匿名脚本的类名（Main）在多文件工程里会撞，登记名那条路不能走。
 */
const NATIVE_BASE = new WeakMap<GdClassCtor, string>();

export function registerNativeBase(ctor: GdClassCtor, name: string): void {
  NATIVE_BASE.set(ctor, name);
}

/** 沿 JS 原型链往上找第一个登记过的原生基类（`extends 别的脚本` 时靠这条）。 */
export function nativeBaseOf(target: unknown): string | null {
  let ctor: unknown = typeof target === "function" ? target : (target as { constructor?: unknown })?.constructor;
  while (typeof ctor === "function") {
    const hit = NATIVE_BASE.get(ctor as GdClassCtor);
    if (hit !== undefined) return hit;
    ctor = Object.getPrototypeOf(ctor);
  }
  return null;
}

// ---------------------------------------------------------------- meta 存储
//
// `set_meta` / `get_meta` / `has_meta` / `remove_meta`（实测 f36 / f39）：
// 键是 String 或 StringName（**同一个键**：`a.set_meta(&"sn", 6)` 之后 `a.has_meta("sn")` 是真），
// 值随便装；`get_meta` 两参形给默认值，一参形遇到没有的键**给 null 并继续跑**（Godot 那边只多一条
// core/object 的引擎 ERROR，脚本不中断 —— f37 实测 exit 0）。
const METAS = new WeakMap<object, Map<string, Variant>>();

function metaKey(v: Variant): string {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return v.v as string;
  throw new UnsupportedError("meta-key", `meta 的键需要 String 或 StringName，收到 ${tagName(v.t)}`);
}

function metaStore(obj: object): Map<string, Variant> {
  let m = METAS.get(obj);
  if (m === undefined) {
    m = new Map<string, Variant>();
    METAS.set(obj, m);
  }
  return m;
}

export function setMeta(obj: object, key: Variant, value: Variant): void {
  metaStore(obj).set(metaKey(key), value);
}

export function hasMeta(obj: object, key: Variant): boolean {
  return metaStore(obj).has(metaKey(key));
}

export function removeMeta(obj: object, key: Variant): void {
  metaStore(obj).delete(metaKey(key));
}

/** 一参形缺键时给 null（实测 f37 / f39 t9 的 `<null>`），两参形给那个默认值。 */
export function getMeta(obj: object, key: Variant, dflt?: Variant): Variant {
  const hit = metaStore(obj).get(metaKey(key));
  if (hit !== undefined) return hit;
  return dflt === undefined ? V.nil() : dflt;
}

export function lookupClass(name: string): GdClassCtor | undefined {
  return CLASS_REGISTRY.get(name);
}

/** res:// 路径 → 该脚本的类构造器。preload/load 按路径取"脚本"这个值。 */
const SCRIPT_REGISTRY = new Map<string, GdClassCtor>();

export function registerScript(resPath: string, ctor: GdClassCtor): void {
  SCRIPT_REGISTRY.set(resPath, ctor);
}

/**
 * 一个"脚本"值 = 用 OBJECT 承载构造器（Godot 里 GDScript 本身就是个 Object/Resource）。
 * 支持 `S = preload(...)` 之后 `S.new()`（见 method() 里的 new 分支）。
 */
export function scriptValue(ctor: GdClassCtor): Variant {
  return V.object(ctor);
}

/** `load("res://x.gd")` 运行时解析；未知路径响亮报错，绝不静默返回 null。 */
export function loadScript(path: Variant | string): Variant {
  const key = typeof path === "string" ? path : String((path as Variant).v);
  const ctor = SCRIPT_REGISTRY.get(key);
  if (!ctor) {
    throw new UnsupportedError("load-unknown-script", `load() 解析不到脚本：${key}`);
  }
  return V.object(ctor);
}
