/** `connect()` 的返回码：成功 0，**同一个 Callable 已经连着**给 31（Error.ALREADY_IN_USE）。 */
export const CONNECT_OK = 0;
export const CONNECT_ALREADY_CONNECTED = 31;

/** 一条连接：盒子用于**身份比较**，fn 是真正要跑的式子。形参类型写死成 `Variant`：`(...args: unknown[]) => void` 这种「unknown 的 rest 数组」在静态编译目标上没有表示形式。 */
type Listener = { box: object; fn: (args: Variant[]) => void; oneShot: boolean };

export class Signal {
  #listeners: Listener[] = [];
  #waiting: Array<(v: unknown) => void> = [];

  constructor(readonly sigName: string = "") {}

  /** Godot 的 `connect(callable, flags)`：返回 Error 码 int —— 成功 0，重复连**同一个** Callable 给 31 且不多投一份；flags 4 是 one-shot，8 允许重复连但只投一份。身份比的是 Callable 的**等式**（`callableSame`：接收者 + 方法名，绑定串不算）。 */
  // `CONNECT_DEFERRED`(1) 与没见过的 flags 都不在这里发：deferred 的投递排在当前这一轮之后，而宿主 quit 后直接 flush + `process.exit`，宏任务一个都不排干 → 由调用方响亮拒。
  connectTo(box: object, fn: (args: Variant[]) => void, flags: number): number {
    for (const l of this.#listeners) {
      if (!sameBox(l.box, box)) continue;
      return flags === 8 ? CONNECT_OK : CONNECT_ALREADY_CONNECTED;
    }
    this.#listeners.push({ box, fn, oneShot: flags === 4 });
    return CONNECT_OK;
  }

  /** `disconnect(callable)` 是 **void**（取值在 Godot 解析期就拒）；没连过的键静默无操作。 */
  disconnectFrom(box: object): void {
    const i = this.#listeners.findIndex((l) => sameBox(l.box, box));
    if (i >= 0) removeAt(this.#listeners, i);
  }

  emit(...args: Variant[]): void {
    this.emitList(args);
  }

  /** 数组形：静态编译目标上「按 rest 展开调用」没有 lowering，运行时的 `emit` 派发只能走这一条。 */
  emitList(args: Variant[]): void {
    // one-shot 在投递**之前**摘掉：监听者自己再 connect 一次不会被这一趟补投
    const snapshot: Listener[] = [];
    for (const l of this.#listeners) snapshot.push(l);
    for (const l of snapshot) {
      if (l.oneShot) removeOnce(this.#listeners, l);
      l.fn(args);
    }
    const pending = this.#waiting;
    this.#waiting = [];
    for (const resolve of pending) resolve(normalizeArgs(args));
  }

  /** GDScript 的 `await signal` 走这一格：交一个**真 Promise** 出去 —— 静态编译目标上 `await` 不认自定义 thenable。 */
  nextValue(): Promise<Variant> {
    return new Promise<Variant>((resolve) => {
      this.#waiting.push((v: unknown) => resolve(v as Variant));
    });
  }

  then(resolve: (v: unknown) => void): void {
    this.#waiting.push(resolve);
  }
}

/** 摘掉第 i 格：不用 `a.splice(i, 1)` —— 这类方法调用在静态编译目标上没有 lowering，前移覆盖 + `pop` 与它的读数一致。 */
function removeAt(list: Listener[], i: number): void {
  for (let j = i; j + 1 < list.length; j++) list[j] = list[j + 1] as Listener;
  list.pop();
}

/** 摘掉 one-shot 那一格（`indexOf` 找位置，再走同一套前移覆盖）。 */
function removeOnce(list: Listener[], l: Listener): void {
  const at = list.indexOf(l);
  if (at >= 0) removeAt(list, at);
}

/** 连接身份：盒子每次读都是新建的，所以比的是**内层 Callable 的等式**（`callableSame`）。 */
function sameBox(a: object, b: object): boolean {
  return callableSame(a as unknown as CallableBox, b as unknown as CallableBox);
}

import { callableSame, type CallableBox } from "./object";

/** 信号参数归一：0 参 → null，1 参 → 值本身，2+ 参 → **一个装箱成 `GArray` 的 Array**。 */
export function normalizeArgs(args: Variant[]): Variant {
  if (args.length === 0) return V.nil();
  const first = args[0] as Variant;
  if (args.length === 1) return first;
  const items: Variant[] = [];
  for (const v of args) items.push(v);
  return V.array(GArray.of(items));
}

import { isVariant, wrapValue } from "./object";
import { GArray } from "./values";
import { V, type Variant } from "./tags";

export async function awaitValue(x: unknown): Promise<Variant> {
  const sig = asSignal(x);
  if (sig !== null) return wrapValue(await sig.nextValue());
  return wrapValue(await x);
}

/** 等的是信号本身还是装箱过的信号？两形都认（`await someVar` 里 someVar 可能是 Var 也可能是 V.object）。判子**不能写 `instanceof`**：接收者是内建 `Promise` 时它没有 lowering，所以改读 `sigName` —— Signal 独有这个名字。 */
function asSignal(x: unknown): Signal | null {
  const inner = isVariant(x) ? x.v : x;
  return isSignalShape(inner) ? (inner as Signal) : null;
}

function isSignalShape(v: unknown): boolean {
  if (v === null || typeof v !== "object") return false;
  return typeof (v as Signal).sigName === "string";
}

export function awaitSignal(sig: Signal): Promise<unknown> {
  return Promise.resolve(sig);
}
