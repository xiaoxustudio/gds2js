/**
 * 产品化宿主 —— SceneTree 桩 + print。
 *
 * 边界（见 docs/RUNTIME_API.md §0）：这是**宿主**，不属于运行时
 * （`src/runtime/` 里没有任何 SceneTree）。
 * Tier 1 的产物如果不需要宿主，可以不 import 这个入口，自己驱动生命周期。
 *
 * 与 `tools/harness` 的关系：测试脚手架只是这个文件的转发层，
 * 加上用例之间缓冲隔离的 reset —— 除此之外没有别的差异。
 */
import { Signal } from "./runtime/signal";
import type { Variant } from "./runtime/tags";
import { truthyOf } from "./runtime/values";

let out: string[] = [];

/**
 * GDScript 的 print 是全局函数。**多参数是无分隔符拼接**，不是空格连接 ——
 * 这是用例 002 第 6 行（`print(typeof(1), " ", typeof(1.0))` → "2 3"）实测出来的。
 * 要带分隔符得自己写进字符串，或用 `prints()`。
 */
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

  /**
   * 注意：编译产物传进来的是 Variant（`rt.V.float(0.02)`），不是裸 number。
   * 不拆箱的话 `#left -= dt` 会变成 NaN，定时器永不触发，
   * `_initialize` 就永远 await 下去 —— 表现为用例静默挂死。
   */
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
    /**
     * Godot 里 `_initialize` 可以是协程，主循环与它**并发**推进。
     * 如果先 await _initialize 再跑循环就会死锁：
     * _initialize 在等定时器，而定时器只能靠主循环推进。
     * 所以这里先把它挂起来，循环跑完再收尾。
     */
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
