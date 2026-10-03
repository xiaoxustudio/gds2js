import { Signal } from "./runtime/signal";
import { GdScriptObject } from "./runtime/object";
import type { Variant } from "./runtime/tags";
import { truthyOf } from "./runtime/values";

let out: string[] = [];

/** 记录一次 print 的输出。签名收 `string[]` 而不是 `unknown[]`：后者在静态编译目标上没有表示形式。 */
export function print(...args: string[]): void {
  out.push(args.join(""));
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

export class SceneTree extends GdScriptObject {
  #quitted = false;
  #timers: Timer[] = [];

  /** 两条 virtual 都不写成 async、签名与产物侧的覆写完全一致：基类的 `async` 方法被子类覆写在静态编译目标上没有实现。 */
  _initialize(): Promise<void> {
    return Promise.resolve();
  }
  _process(_delta: number): Promise<unknown> {
    const no: unknown = false;
    return Promise.resolve(no);
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

    try {
      let frames = 0;
      while (!this.#quitted && frames < maxFrames) {
        await new Promise((r) => setTimeout(r, 2));
        this.#timers = this.#timers.filter((t) => !t.advance(0.002));
        if (isTruthyResult(await this._process(0.002))) this.quit();
        frames++;
      }
      await initDone;
    } finally {
      // 帧循环或 init 抛错也要先落盘再抛：缓冲输出属于「已经发生的事」。
      flush();
    }
    if (initError !== null) throw initError;
  }
}

/** _process 的返回值可能是裸 boolean，也可能是 Variant 装箱 */
function isTruthyResult(r: unknown): boolean {
  if (r === true) return true;
  if (typeof r === "object" && r !== null && "t" in r) return truthyOf(r as Variant);
  return false;
}
