import { Tag, V, type Variant } from "./tags";

/**
 * Callable 盒子的**形状**与等式。单独一个叶子模块，不 import `values.ts` / `object.ts`：
 * `object.ts → values.ts` 已经是一条边，等式判据（`values.ts` 要用）再反向 import 就成了循环 ——
 * 与 `numstr.ts`（S177 那轮为同样的理由抽出去）同一处理方式。
 */
export const CALLABLE = "__gds2js_callable";
/** 方法 Callable 的方法名与接收者（`get_method()` / `is_null()` / `is_valid()` 要用，实测 f34）。 */
export const CALLABLE_NAME = "__gds2js_callable_name";
export const CALLABLE_OBJECT = "__gds2js_callable_object";
/** `Callable.bind(...)` 绑上去的实参（实测排在调用实参**之后**，S190）。 */
export const CALLABLE_BOUND = "__gds2js_callable_bound";

/** 这个 OBJECT 载荷是一个 Callable 盒子吗？空 Callable（`Callable()`）也算 —— 它的 `CALLABLE` 键在但不是函数。 */
export function isCallableBox(inner: unknown): inner is Record<string, unknown> {
  return typeof inner === "object" && inner !== null && CALLABLE in (inner as Record<string, unknown>);
}

export function isCallable(v: Variant): boolean {
  return v.t === Tag.OBJECT && isCallableBox(v.v);
}

/** 一个 Callable 盒子是不是**空**的（`Callable()` / `Callable().bind(...)`）。 */
export function isNullCallable(box: Record<string, unknown>): boolean {
  return typeof box[CALLABLE] !== "function";
}

/**
 * Callable 的等式（`tmp/f97` d1 / d2 / d3 / d4 / d7 / c5，实测于 `==`、`!=` 与 `Array.has`）：
 * - 方法 Callable 比的是 **(接收者, 方法名)**：`o.add3 == o.add3` 真、`o.add3 == p.add3` 假、
 *   `Thing.sadd3 == Thing.sadd3` 真。两个盒子是**各自新建**的（读一次属性就 `bind` 一个新的），
 *   所以按 JS 引用比会一路判成假 —— 那是静默错，正是这一族最贵的一类；
 * - **绑定的实参不进等式**：`o.add3.bind(1) == o.add3.bind(2)` 是**真**（d3）。照着「连绑定串一起比」
 *   写就把这一格判成假；
 * - lambda 比 JS 引用：两个**同体** lambda `f == g` 是**假**（d2），同一个 var 自比真；
 * - 空 Callable 之间一律相等（c5：`Callable() == Callable()` 真、`!=` 假）。
 */
export function callableSame(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const fa = a[CALLABLE];
  const fb = b[CALLABLE];
  if (typeof fa !== "function" || typeof fb !== "function") {
    return typeof fa !== "function" && typeof fb !== "function";
  }
  const na = a[CALLABLE_NAME];
  const nb = b[CALLABLE_NAME];
  if (typeof na === "string" && typeof nb === "string") {
    if (na !== nb) return false;
    const oa = a[CALLABLE_OBJECT] as Variant | undefined;
    const ob = b[CALLABLE_OBJECT] as Variant | undefined;
    // 比**内层**而不是盒子本身：`o.add3` 读两次拿到的是两个新 Variant，包着同一个实例
    return (oa?.v ?? null) === (ob?.v ?? null);
  }
  if (typeof na === "string" || typeof nb === "string") return false;
  return fa === fb;
}

/** `Callable()` 造出来的**空 Callable**：typeof 仍是 25，谓词与方法面的实测口径见 `methods.ts`。 */
export function nullCallable(): Variant {
  return V.object({ [CALLABLE]: null });
}
