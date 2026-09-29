export class Signal {
  #listeners = new Set<(...args: unknown[]) => void>();
  #waiting: Array<(v: unknown) => void> = [];

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

export async function awaitValue(x: unknown): Promise<Variant> {
  return wrapValue(await x);
}

export function awaitSignal(sig: Signal): Promise<unknown> {
  return Promise.resolve(sig);
}
