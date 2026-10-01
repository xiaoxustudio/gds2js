/** `connect()` 的返回码（`tmp/f97` b1 实测）：成功 0，**同一个 Callable 已经连着**给 31（Error.ALREADY_IN_USE）。 */
export const CONNECT_OK = 0;
export const CONNECT_ALREADY_CONNECTED = 31;

/** 一条连接：盒子用于**身份比较**，fn 是真正要跑的式子，oneShot 来自 `CONNECT_ONE_SHOT`（实测值 4）。 */
type Listener = { box: object; fn: (...args: unknown[]) => void; oneShot: boolean };

export class Signal {
  #listeners: Listener[] = [];
  #waiting: Array<(v: unknown) => void> = [];

  constructor(readonly sigName: string = "") {}

  /**
   * Godot 的 `connect(callable, flags)` 口径（`tmp/f97` b1 / b5 / b6 / b7）：
   * - 返回 **int**：第一次 0，重复连**同一个** Callable 给 31 且**不会**多一份投递
   *   （b1 里 `emit(5)` 只印一次 `got 5`）—— 所以「重复连接」既是返回码的格子也是行为的格子；
   * - `disconnect` 之后可以再连，又给 0；
   * - flags 只量过 **0 / 1 / 4** 三格：4（`CONNECT_ONE_SHOT`）是「投一次就自动断开」（b5：`emit` 两次只印一次），
   *   0 与 1 都是常规连接（b6 两次都印）。**其余的 flags 值没量过** → 由调用方响亮拒，不静默当 0 处理。
   * 身份比的是 Callable 的**等式**（`callableSame`：接收者 + 方法名，绑定串不算），
   * 所以 `s.connect(o.hi)` 两次是 31，而 `s.connect(o.hi.bind(1))` 与 `s.connect(o.hi.bind(2))` 也撞同一格 ——
   * 这一推论来自实测的等式，没有单独量过 connect，记在 S193 的没量清单里。
   */
  connectTo(box: object, fn: (...args: unknown[]) => void, oneShot: boolean): number {
    for (const l of this.#listeners) {
      if (sameBox(l.box, box)) return CONNECT_ALREADY_CONNECTED;
    }
    this.#listeners.push({ box, fn, oneShot });
    return CONNECT_OK;
  }

  /** `disconnect(callable)` 是 **void**（取值在解析期就拒，见 analyze 的 VOID_SIGNAL_METHODS）；没连过的键静默无操作。 */
  disconnectFrom(box: object): void {
    const i = this.#listeners.findIndex((l) => sameBox(l.box, box));
    if (i >= 0) this.#listeners.splice(i, 1);
  }

  emit(...args: unknown[]): void {
    // one-shot 在投递**之前**摘掉：监听者自己再 connect 一次不会被这一趟补投
    for (const l of [...this.#listeners]) {
      if (l.oneShot) this.#listeners.splice(this.#listeners.indexOf(l), 1);
      l.fn(...args);
    }
    const pending = this.#waiting;
    this.#waiting = [];
    for (const resolve of pending) resolve(normalizeArgs(args));
  }

  then(resolve: (v: unknown) => void): void {
    this.#waiting.push(resolve);
  }
}

/** 连接身份：盒子每次读都是新建的，所以比的是**内层 Callable 的等式**（`callableSame`）。 */
function sameBox(a: object, b: object): boolean {
  return callableSame(a as Record<string, unknown>, b as Record<string, unknown>);
}

import { callableSame } from "./object";

/** 信号参数归一：0 参 → null，1 参 → 值本身，2+ 参 → Array（SEMANTICS S21） */
export function normalizeArgs(args: unknown[]): unknown {
  if (args.length === 0) return null;
  if (args.length === 1) return args[0];
  return args;
}

import { isVariant, wrapValue } from "./object";
import type { Variant } from "./tags";

export async function awaitValue(x: unknown): Promise<Variant> {
  return wrapValue(await x);
}

export function awaitSignal(sig: Signal): Promise<unknown> {
  return Promise.resolve(sig);
}
