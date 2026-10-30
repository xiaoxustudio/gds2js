import { nextObjectId } from "./null-object";

export const CONNECT_OK = 0;
export const CONNECT_ALREADY_CONNECTED = 31;

type Listener = { box: object; fn: (args: Variant[]) => void; oneShot: boolean; flags: number };

export class Signal {
  #listeners: Listener[] = [];
  #waiting: Array<(v: unknown) => void> = [];
  readonly gdObjectId: number = nextObjectId();

  constructor(readonly sigName: string = "") {}

  connectTo(box: object, fn: (args: Variant[]) => void, flags: number): number {
    for (const l of this.#listeners) {
      if (!sameBox(l.box, box)) continue;
      return flags === 8 ? CONNECT_OK : CONNECT_ALREADY_CONNECTED;
    }
    this.#listeners.push({ box, fn, oneShot: flags === 4, flags });
    return CONNECT_OK;
  }

  /** `is_connected(callable)`（S545）：身份按 Callable 等式比，**绑定串不算**（实测 `bind(1)` 那支仍真）。 */
  isConnected(box: object): boolean {
    for (const l of this.#listeners) if (sameBox(l.box, box)) return true;
    return false;
  }

  hasConnections(): boolean {
    return this.#listeners.length > 0;
  }

  /** `get_connections()` 的三格：signal 本体、连进来的 Callable、原样存下的 flags（实测 0 / 4 / 8）。 */
  connections(): Array<{ box: object; flags: number }> {
    const out: Array<{ box: object; flags: number }> = [];
    for (const l of this.#listeners) out.push({ box: l.box, flags: l.flags });
    return out;
  }

  disconnectFrom(box: object): void {
    const i = this.#listeners.findIndex((l) => sameBox(l.box, box));
    if (i >= 0) removeAt(this.#listeners, i);
  }

  emit(...args: Variant[]): void {
    this.emitList(args);
  }

  emitList(args: Variant[]): void {
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

  nextValue(): Promise<Variant> {
    return new Promise<Variant>((resolve) => {
      this.#waiting.push((v: unknown) => resolve(v as Variant));
    });
  }

  then(resolve: (v: unknown) => void): void {
    this.#waiting.push(resolve);
  }
}

function removeAt(list: Listener[], i: number): void {
  for (let j = i; j + 1 < list.length; j++) list[j] = list[j + 1] as Listener;
  list.pop();
}

function removeOnce(list: Listener[], l: Listener): void {
  const at = list.indexOf(l);
  if (at >= 0) removeAt(list, at);
}

/** 连接身份：盒子每次读都是新建的，所以比的是**内层 Callable 的等式**（`callableSame`）。 */
function sameBox(a: object, b: object): boolean {
  return callableSame(a as unknown as CallableBox, b as unknown as CallableBox);
}

import { callableSame, type CallableBox } from "../object/script-object";

export function normalizeArgs(args: Variant[]): Variant {
  if (args.length === 0) return V.nil();
  const first = args[0] as Variant;
  if (args.length === 1) return first;
  const items: Variant[] = [];
  for (const v of args) items.push(v);
  return V.array(GArray.of(items));
}

import { isVariant, wrapValue } from "../object/script-object";
import { GArray } from "../../values";
import { V, type Variant } from "../../tags";

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
