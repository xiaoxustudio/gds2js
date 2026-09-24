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

/** class_name / 内部类都注册进来，`is` 判定和 `X.new()` 靠它 */
export function registerClass(name: string, ctor: GdClassCtor): void {
  CLASS_REGISTRY.set(name, ctor);
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
