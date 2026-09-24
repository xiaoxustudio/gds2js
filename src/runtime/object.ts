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
