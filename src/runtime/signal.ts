/** `connect()` 的返回码（`tmp/f97` b1 实测）：成功 0，**同一个 Callable 已经连着**给 31（Error.ALREADY_IN_USE）。 */
export const CONNECT_OK = 0;
export const CONNECT_ALREADY_CONNECTED = 31;

/**
 * 一条连接：盒子用于**身份比较**，fn 是真正要跑的式子（flags 的实测口径见 `connectTo`）。
 * 形参类型写死成 `Variant`：`(...args: unknown[]) => void` 这种「unknown 的 rest 数组」在静态编译目标上
 * 没有表示形式，会把整个 `Listener[]` 连带 `Signal` 类一起打挂（实测 scriptc）。
 */
type Listener = { box: object; fn: (args: Variant[]) => void; oneShot: boolean };

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
  connectTo(box: object, fn: (args: Variant[]) => void, flags: number): number {
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

  /**
   * GDScript 的 `await signal` 走这一格：交一个**真 Promise** 出去。
   * 不能只靠下面那个 `then` 的 thenable 展开 —— 静态编译目标上 `await` 不认自定义 thenable，
   * 实测 024 的 exe 把 Signal 本身当成了 await 的结果（print 于是报「不支持该对象类型」）。
   */
  nextValue(): Promise<Variant> {
    return new Promise<Variant>((resolve) => {
      this.#waiting.push((v: unknown) => resolve(v as Variant));
    });
  }

  then(resolve: (v: unknown) => void): void {
    this.#waiting.push(resolve);
  }
}

/**
 * 摘掉第 i 格。不用 `a.splice(i, 1)`：`splice` 这类方法调用在静态编译目标上没有 lowering
 * （实测 scriptc），前移覆盖 + `pop` 与它的读数一致。
 */
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

/**
 * 信号参数归一（SEMANTICS S21）：0 参 → null，1 参 → 值本身，2+ 参 → **一个 Array**。
 * 2+ 那一格以前交的是裸 JS 数组、由 `awaitValue` 的 `wrapValue` 用 `Array.isArray` 收口；
 * 静态编译目标上 `Array.isArray` 不认自己的数组表示，收口没发生、装箱值一路落到 `show` 的
 * OBJECT 分支，报「print 不支持该对象类型」（实测 024-await-signal-args 的 exe，node 侧同产物是对的）。
 * 现在就在这里装箱成 `GArray`，两条路同一格。
 */
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

/**
 * 等的是信号本身，还是装箱过的信号？两形都认（`await someVar` 里 someVar 可能是 Var 也可能是 V.object）。
 * 判子**不能写 `instanceof`**：`awaitValue` 的入参静态类型是 unknown，每一次 coroutine 调用
 * （`await this.f()`）都走进来，而接收者是 scriptc 内建 `Promise` 时 `instanceof` 没有 lowering
 * （实测 `tmp/pr-promise/p4`：`Object.getPrototypeOf on this value is not supported yet`，
 * 整族 await 用例一起挂）。改读 `sigName` —— Signal 独有这个名字（全仓库只有 `get_name()` 读它），
 * 而「把 unknown 当别的形状读一个字段」实测是过的（`isVariant` 一直这么用，p5 量到五种接收者全不炸：
 * Promise→false、Signal→true、Variant→false、字符串→false）。
 */
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
