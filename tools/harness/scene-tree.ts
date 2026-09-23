/**
 * 差分测试的测试脚手架 —— **不属于产物依赖**。
 *
 * 边界声明：语料用例全都 `extends SceneTree`，所以跑它们必须有这层东西。
 * 但它是**测试脚手架**，不是产品侧的引擎 API 支持：
 * `src/runtime/` 里不出现任何 SceneTree / Node，Tier 1 的产物遇到引擎 API 照样抛
 * UnsupportedError（D4）。见 docs/RUNTIME_API.md §0。
 */
import { Signal } from "../../src/runtime/signal";

let out: string[] = [];

/** GDScript 的 print 是全局函数，多个参数用空格连接 */
export function print(...args: unknown[]): void {
  out.push(args.map((a) => String(a)).join(" "));
}

export function flush(): void {
  process.stdout.write(out.join("\n") + (out.length > 0 ? "\n" : ""));
  out = [];
}

export function captured(): string {
  return out.join("\n");
}

class Timer {
  readonly timeout = new Signal();
  #left: number;

  constructor(sec: number) {
    this.#left = sec;
  }

  /** 返回 true 表示已触发，可以从队列里移除 */
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
  async _process(_delta: number): Promise<boolean> {
    return false;
  }

  create_timer(sec: number): Timer {
    const t = new Timer(sec);
    this.#timers.push(t);
    return t;
  }

  quit(): void {
    this.#quitted = true;
  }

  async run(maxFrames = 3000): Promise<void> {
    await this._initialize();
    let frames = 0;
    while (!this.#quitted && frames < maxFrames) {
      await new Promise((r) => setTimeout(r, 2));
      this.#timers = this.#timers.filter((t) => !t.advance(0.002));
      if (await this._process(0.002)) this.quit();
      frames++;
    }
    flush();
  }
}
