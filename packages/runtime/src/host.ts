import { Signal } from "./runtime/signal";
import { deferredPendingCount } from "./runtime/callable";
import { setStackPrintSink, setOrderedStderrSink, stackBlockLines } from "./runtime/frames";
import { GdScriptObject } from "./runtime/object";
import { V, type Variant } from "./runtime/tags";
import { setRotatedAxisBlockSink } from "./runtime/vector3";
import { richAnsi } from "./runtime/rich-ansi";
import { showArgsSep, truthyOf } from "./runtime/values";

let out: string[] = [];
let pending = "";

function addLine(text: string): void {
  out.push(pending + text);
  pending = "";
}

setStackPrintSink(addLine);

setOrderedStderrSink((text) => {
  flush();
  process.stderr.write(text);
});

export function installRotatedAxisBlockSink(): void {
  setRotatedAxisBlockSink((axis) => {
    flush();
    process.stderr.write(
      stackBlockLines("ERROR", "set_axis_angle (core/math/basis.cpp:843)", [
        V.str(`The axis Vector3 ${showArgsSep([V.object(axis)], "")} must be normalized.`),
      ]).join("\n") + "\n",
    );
  });
}

installRotatedAxisBlockSink();

/** 记录一次 print 的输出。签名收 `string[]` 而不是 `unknown[]`：后者在静态编译目标上没有表示形式。 */
export function print(...args: string[]): void {
  addLine(args.join(""));
}

export function printJoined(sep: string, args: Variant[]): void {
  addLine(showArgsSep(args, sep));
}

export function printRaw(args: Variant[]): void {
  if (args.length === 0) return;
  pending += showArgsSep(args, "");
}

export function printErr(args: Variant[]): void {
  flush();
  process.stderr.write(showArgsSep(args, "") + "\n");
}

export function printVerbose(_args: Variant[]): void {}

export function printRich(args: Variant[]): void {
  addLine(richAnsi(showArgsSep(args, "")));
}

export function printDebug(args: Variant[], file: string, line: number, fn: string): void {
  addLine(showArgsSep(args, ""));
  addLine(`   At: ${file}:${String(line)}:${fn}()`);
}

export function flush(): void {
  if (out.length > 0) process.stdout.write(out.join("\n") + "\n");
  if (pending !== "") process.stdout.write(pending);
  out = [];
  pending = "";
}

export function captured(): string {
  if (pending === "") return out.join("\n");
  return out.join("\n") + (out.length > 0 ? "\n" : "") + pending;
}

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

  isDue(): boolean {
    return this.#left <= 0;
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

  async #drain(): Promise<void> {
    for (;;) {
      let fired = false;
      this.#timers = this.#timers.filter((t) => {
        if (!t.isDue()) return true;
        t.advance(0);
        fired = true;
        return false;
      });
      if (!fired && deferredPendingCount() === 0 && !this.#timers.some((t) => t.isDue())) return;
      await new Promise((r) => setTimeout(r, 0));
    }
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
      await this.#drain();
    } finally {
      flush();
    }
    if (initError !== null) throw initError;
  }
}

function isTruthyResult(r: unknown): boolean {
  if (r === true) return true;
  if (typeof r === "object" && r !== null && "t" in r) return truthyOf(r as Variant);
  return false;
}
