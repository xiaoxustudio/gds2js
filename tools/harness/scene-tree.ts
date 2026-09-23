/**
 * 差分测试的测试脚手架 —— **不属于产物依赖**。
 *
 * 边界声明：语料用例全都 `extends SceneTree`，所以跑它们必须有这层东西。
 * 但它是**测试脚手架**，不是产品侧的引擎 API 支持：
 * `src/runtime/` 里不出现任何 SceneTree / Node，Tier 1 的产物遇到引擎 API 照样抛
 * UnsupportedError（D4）。见 docs/RUNTIME_API.md §0。
 */
import { Signal } from "../../src/runtime/signal";
import type { Variant } from "../../src/runtime/tags";
import { truthyOf } from "../../src/runtime/values";

/** _process 的返回值可能是裸 boolean，也可能是 Variant 装箱 */
function isTruthyResult(r: unknown): boolean {
  if (r === true) return true;
  if (typeof r === "object" && r !== null && "t" in r) return truthyOf(r as Variant);
  return false;
}

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

/** 用例之间必须清干净：上一个用例若中途抛错，没 flush 的输出会串到下一个 */
export function reset(): void {
  out = [];
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
  /**
   * 返回值用 unknown：编译产物可能返回裸 boolean，也可能返回 Variant 装箱。
   * 两种都在 run() 里解释（编译产物由 emitter 生成，不做强制约定）。
   */
  async _process(_delta: number): Promise<unknown> {
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
      if (isTruthyResult(await this._process(0.002))) this.quit();
      frames++;
    }
    flush();
  }
}
