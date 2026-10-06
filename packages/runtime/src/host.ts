import { Signal } from "./runtime/signal";
import { GdScriptObject } from "./runtime/object";
import type { Variant } from "./runtime/tags";
import { richAnsi } from "./runtime/rich-ansi";
import { showArgsSep, truthyOf } from "./runtime/values";

/** 已经结尾的行，一条一个元素。 */
let out: string[] = [];
/** `printraw` 留下的那半行：实测它不结尾，下一条 `print` 接在同一行上（`printraw("a")` + `print("b")` → 一行 `ab`）。 */
let pending = "";

/** 一条结尾的行落进缓冲，顺带把 `printraw` 那半行并到行首。 */
function addLine(text: string): void {
  out.push(pending + text);
  pending = "";
}

/** 记录一次 print 的输出。签名收 `string[]` 而不是 `unknown[]`：后者在静态编译目标上没有表示形式。 */
export function print(...args: string[]): void {
  addLine(args.join(""));
}

/** `prints` / `printt`：实参之间一个空格 / 一个制表符。零实参那格实测仍结尾一行（`printraw("A")` + `prints()` + `print("B")` → 两行 `A` / `B`）。 */
export function printJoined(sep: string, args: Variant[]): void {
  addLine(showArgsSep(args, sep));
}

/** `printraw`：无分隔、不结尾；实测零实参连那半行都不开（`printraw("A")` + `printraw()` + `print("B")` → 一行 `AB`）。 */
export function printRaw(args: Variant[]): void {
  if (args.length === 0) return;
  pending += showArgsSep(args, "");
}

/** `printerr`：实测走 stderr、实参之间无分隔、结尾一个换行；零实参就只落那个换行。 */
export function printErr(args: Variant[]): void {
  process.stderr.write(showArgsSep(args, "") + "\n");
}

/** `print_verbose`：实测 headless 默认声级下不出声（实参照常求值，只是没人听）。要跟随声级开关得先给 CLI 加那条旗标。 */
export function printVerbose(_args: Variant[]): void {}

/** `print_rich`：实参无分隔拼起来，整串过 bbcode→ANSI 那张表，尾巴补一个复位再结尾（实测零实参就只出复位序列）。 */
export function printRich(args: Variant[]): void {
  addLine(richAnsi(showArgsSep(args, "")));
}

export function flush(): void {
  if (out.length > 0) process.stdout.write(out.join("\n") + "\n");
  // 引擎不给 printraw 补结尾换行，这里也不补。
  if (pending !== "") process.stdout.write(pending);
  out = [];
  pending = "";
}

export function captured(): string {
  if (pending === "") return out.join("\n");
  return out.join("\n") + (out.length > 0 ? "\n" : "") + pending;
}

/** 用例之间必须清干净：上一个用例若中途抛错，没 flush 的输出会串到下一个 */
export function resetOut(): void {
  out = [];
  pending = "";
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
