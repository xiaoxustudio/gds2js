import { UnsupportedError } from "./errors";
import { V, type Variant } from "./tags";
import { GArray, GDict } from "./values";

/**
 * 可调用对象（Callable）与「任意 JS 值 → 变体」的归一。
 *
 * 之所以需要这层：emitter 生成的代码里，lambda、绑定方法、引擎对象（如 Timer）
 * 都是普通 JS 值，而容器的 `method` / `index` 入口只认 Variant。
 * 与其让生成代码到处判断类型，不如统一在这里收口。
 */

export const CALLABLE = "__gds2js_callable";

export type Fn = (...args: Variant[]) => Variant;

export function callable(fn: Fn): Variant {
  return V.object({ [CALLABLE]: fn });
}

/** 把已经绑定好 this 的方法包成 Callable（GDScript 里 `fire_zero` 本身就是个 Callable） */
export function callableOf(fn: (...args: unknown[]) => unknown): Variant {
  return V.object({ [CALLABLE]: fn });
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

// ---------------------------------------------------------------- 类注册表

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

/** class_name / 内部类都注册进来，`is` 判定和 `X.new()` 靠它 */
export function registerClass(name: string, ctor: GdClassCtor): void {
  CLASS_REGISTRY.set(name, ctor);
  CLASS_NAMES.set(ctor, name);
}

/** 发射器为每个类补发一行：`rt.registerFieldTypes(Inner, { t: "int", v: "Vector2" })`。 */
export function registerFieldTypes(ctor: GdClassCtor, table: Record<string, string>): void {
  FIELD_TYPES.set(ctor, table);
}

/** 实例（或构造器）的声明类型表，没有则 null。 */
export function fieldTypesOf(target: unknown): Record<string, string> | null {
  const ctor = typeof target === "function" ? (target as GdClassCtor) : (target as { constructor?: GdClassCtor })?.constructor;
  return (ctor && FIELD_TYPES.get(ctor)) || null;
}

/** 发射器为每个类补发一行：`rt.registerStaticMethods(Inner, ["make", "twice"])`。 */
export function registerStaticMethods(ctor: GdClassCtor, names: string[]): void {
  STATIC_METHODS.set(ctor, new Set(names));
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

export function lookupClass(name: string): GdClassCtor | undefined {
  return CLASS_REGISTRY.get(name);
}

// ---------------------------------------------------------------- 脚本注册表

/** res:// 路径 → 该脚本的类构造器。preload/load 按路径取"脚本"这个值。 */
const SCRIPT_REGISTRY = new Map<string, GdClassCtor>();

/**
 * 每个编译产物在模块体里注册自己：`rt.registerScript("res://foo.gd", Foo)`。
 * load(动态) 靠它按 res 路径解析；preload(静态) 走 ESM import，但也注册一份保持一致。
 */
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
