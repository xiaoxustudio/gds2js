import { Signal } from "./runtime/signal";
import type { Variant } from "./runtime/tags";
import { truthyOf } from "./runtime/values";

let out: string[] = [];

export function print(...args: unknown[]): void {
  out.push(args.map((a) => String(a)).join(""));
}

export function flush(): void {
  process.stdout.write(out.join("\n") + (out.length > 0 ? "\n" : ""));
  out = [];
}

export function captured(): string {
  return out.join("\n");
}

/** 用例之间必须清干净：上一个用例若中途抛错，没 flush 的输出会串到下一个 */
export function resetOut(): void {
  out = [];
}

class Timer {
  readonly timeout = new Signal();
  #left: number;

  constructor(sec: number) {
    this.#left = sec;
  }

  advance(dt: number): boolean {
    this.#left -= dt;
    if (this.#left <= 0) {
      this.timeout.emit();
      return true;
    }
    return false;
  }
}

export class SceneTree {
  #quitted = false;
  #timers: Timer[] = [];

  async _initialize(): Promise<void> {}
  async _process(_delta: number): Promise<unknown> {
    return false;
  }

  create_timer(sec: number | Variant): Timer {
    const s = typeof sec === "number" ? sec : Number((sec as Variant).v);
    const t = new Timer(s);
    this.#timers.push(t);
    return t;
  }

  quit(): void {
    this.#quitted = true;
  }

  async run(maxFrames = 3000): Promise<void> {
    let initError: unknown = null;
    const initDone = this._initialize().catch((e: unknown) => {
      initError = e;
      this.quit();
    });

    let frames = 0;
    while (!this.#quitted && frames < maxFrames) {
      await new Promise((r) => setTimeout(r, 2));
      this.#timers = this.#timers.filter((t) => !t.advance(0.002));
      if (isTruthyResult(await this._process(0.002))) this.quit();
      frames++;
    }

    await initDone;
    flush();
    if (initError !== null) throw initError;
  }
}

/** _process 的返回值可能是裸 boolean，也可能是 Variant 装箱 */
function isTruthyResult(r: unknown): boolean {
  if (r === true) return true;
  if (typeof r === "object" && r !== null && "t" in r) return truthyOf(r as Variant);
  return false;
}
