import { Signal } from "./runtime/signal";
import { GdScriptObject } from "./runtime/object";
import type { Variant } from "./runtime/tags";
import { truthyOf } from "./runtime/values";

let out: string[] = [];

/**
 * 产物里唯一的调用形是 `print(rt.showArgs([...]))` —— 实参永远是**已经印好的字符串**，
 * 所以签名收 `string[]` 而不是 `unknown[]`：`unknown[]` 在静态编译目标上没有表示形式
 * （实测 scriptc：values of type 'unknown[]' have no static representation），
 * 而这一格正是 `--pack scriptc` 能否出货的那堵墙。
 */
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

  /**
   * 两条 virtual 都**不写成 async**、签名与产物侧的覆写完全一致。
   * 依据是实测：基类声明 `async` 方法再让子类覆写，在静态编译目标上是硬围栏
   * （scriptc：`overriding the async method '_initialize' … the vtable slot machinery has no fiber-spawn story`），
   * 而「基类返回 Promise 的普通方法 + 子类同签名的普通覆写 + async 实体另起一个名字」是 100% 静态的，
   * `await` 语义一点没少（探针 `tmp/sc-virtual2.ts`：出货 exe 与 Node 输出逐字节一致）。
   */
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
