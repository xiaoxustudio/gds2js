/**
 * Signal —— 契约 §8。
 * 做成 thenable，这样 emitter 可以直接把 `await sig` 发射成 `await sig`，
 * 不需要额外的包装函数。
 */
export class Signal {
  #listeners = new Set<(...args: unknown[]) => void>();
  #waiting: Array<(v: unknown) => void> = [];

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

export function awaitSignal(sig: Signal): Promise<unknown> {
  return Promise.resolve(sig);
}
