/** `connect()` 的返回码（`tmp/f97` b1 实测）：成功 0，**同一个 Callable 已经连着**给 31（Error.ALREADY_IN_USE）。 */
export const CONNECT_OK = 0;
export const CONNECT_ALREADY_CONNECTED = 31;

/** 一条连接：盒子用于**身份比较**，fn 是真正要跑的式子（flags 的实测口径见 `connectTo`）。 */
type Listener = { box: object; fn: (...args: unknown[]) => void; oneShot: boolean };

export class Signal {
  #listeners: Listener[] = [];
  #waiting: Array<(v: unknown) => void> = [];

  constructor(readonly sigName: string = "") {}

  /**
   * Godot 的 `connect(callable, flags)` 口径（`tmp/f97` b1 / b5 / b7、`tmp/f99b` q05–q09）：
   * - 返回 **Error 码 int**：成功 0，重复连**同一个** Callable 给 31 且**不**多一份投递
   *   （b1：`emit(5)` 只印一次）；`disconnect` 之后再连又给 0；
   * - flags 量过的四个可发值：**0 与 2**（`CONNECT_PERSIST`）走常规连接，q08 量到 2 的重复判定与 0
   *   **完全同形**（第二次仍 31）；**4**（`CONNECT_ONE_SHOT`）投一次就摘掉（b5：两次 emit 只印一次，
   *   q09：摘掉之前重复连仍给 31）；**8**（`CONNECT_REFERENCE_COUNTED`）**允许**重复连（q07 两次都 0）
   *   但只投一份；
   * - **1（`CONNECT_DEFERRED`）量到了、故意不发**：q05 / q06 量到它的投递排在当前这一轮之后，
   *   而宿主 `quit()` 之后直接 flush + `process.exit`，宏任务一个都不排干 → 发出去会静默丢行，
   *   所以由调用方响亮拒（`methods.ts` 的 `signal-flag-deferred`）；
   * - 其余值（含压着好几个位的 `-1`，q10 只量到它给 0）也没量 → 响亮拒，不静默按常规连接发。
   * 身份比的是 Callable 的**等式**（`callableSame`：接收者 + 方法名，绑定串不算），所以
   * `s.connect(o.hi)` 两次是 31；`s.connect(o.hi.bind(1))` 与 `s.connect(o.hi.bind(2))` 撞同一格
   * 是从实测等式**推**出来的，没单独量 → 记在 S194 的没量清单里。
   */
  connectTo(box: object, fn: (...args: unknown[]) => void, flags: number): number {
    for (const l of this.#listeners) {
      if (!sameBox(l.box, box)) continue;
      return flags === 8 ? CONNECT_OK : CONNECT_ALREADY_CONNECTED;
    }
    this.#listeners.push({ box, fn, oneShot: flags === 4 });
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
