/**
 * Signal —— 契约 §8。
 * 做成 thenable，这样 emitter 可以直接把 `await sig` 发射成 `await sig`，
 * 不需要额外的包装函数。
 */
export class Signal {
  #listeners = new Set<(...args: unknown[]) => void>();
  #waiting: Array<(v: unknown) => void> = [];

  /**
   * 信号名，`get_name()` 要返回它（实测 f34 t9：`fired.get_name()` → `fired`）。
   * 发射器在构造点把 GDScript 里的那个名字传进来，不需要另建一张登记表。
   */
  constructor(readonly sigName: string = "") {}

  connect(fn: (...args: unknown[]) => void): void {
    this.#listeners.add(fn);
  }

  disconnect(fn: (...args: unknown[]) => void): void {
    this.#listeners.delete(fn);
  }

  emit(...args: unknown[]): void {
    for (const fn of [...this.#listeners]) fn(...args);
    const pending = this.#waiting;
    this.#waiting = [];
    for (const resolve of pending) resolve(normalizeArgs(args));
  }

  then(resolve: (v: unknown) => void): void {
    this.#waiting.push(resolve);
  }
}

/** 信号参数归一：0 参 → null，1 参 → 值本身，2+ 参 → Array（SEMANTICS S21） */
export function normalizeArgs(args: unknown[]): unknown {
  if (args.length === 0) return null;
  if (args.length === 1) return args[0];
  return args;
}

import { isVariant, wrapValue } from "./object";
import type { Variant } from "./tags";

/**
 * `await` 的统一入口。
 *
 * - await 一个 Signal（thenable）→ 等它 emit，拿到归一后的参数
 * - await 任何别的东西 → GDScript 直接原样返回（S22），与 JS 语义一致
 *
 * 返回值一律收成 Variant：Signal emit 出来的是裸 JS 值，不收口的话
 * 后面的 `rt.show()` 会拿到 undefined 直接炸。
 */
export async function awaitValue(x: unknown): Promise<Variant> {
  return wrapValue(await x);
}

export function awaitSignal(sig: Signal): Promise<unknown> {
  return Promise.resolve(sig);
}
