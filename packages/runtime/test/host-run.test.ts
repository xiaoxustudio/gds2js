// 由 tools/ops-check.ts 机械搬迁：region 3355-3399。
// 断言口径、以及「一个 it() = 一个原子 region、不可再拆成一格一个 it()」的理由，见 @gds2js/testkit。

import { afterEach, describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { print, resetOut, SceneTree } from "@gds2js/runtime/host";
import { callDeferred } from "@gds2js/runtime/runtime/class/identity/callable";
import { awaitValue } from "@gds2js/runtime/runtime/class/identity/signal";

describe("runtime/host · print/flush 的进程内捕获", () => {
  it("host-run · print/flush 的进程内捕获与复位", async () => {
    class FrameErrorTree extends SceneTree {
      override _initialize(): Promise<void> {
        print("before-frame-error");
        return Promise.resolve();
      }
      override _process(_delta: number): Promise<unknown> {
        throw new Error("frame-boom");
      }
    }
    class InitErrorTree extends SceneTree {
      override _initialize(): Promise<void> {
        print("before-init-error");
        return Promise.reject(new Error("init-boom"));
      }
    }
    const probe = async (tree: SceneTree): Promise<{ out: string; order: string; msg: string }> => {
      resetOut();
      let text = "";
      const events: string[] = [];
      const real = process.stdout.write;
      process.stdout.write = ((chunk: unknown): boolean => {
        text += typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8");
        events.push("write");
        return true;
      }) as typeof process.stdout.write;
      let msg = "";
      try {
        await tree.run(5);
        events.push("return");
      } catch (e) {
        events.push("throw");
        msg = e instanceof Error ? e.message : String(e);
      } finally {
        process.stdout.write = real;
        resetOut();
      }
      return { out: text, order: events.join(">"), msg };
    };
    const frameErr = await probe(new FrameErrorTree());
    eq("host-run", "帧循环抛错：抛错前已缓冲的输出仍落盘", frameErr.out, "before-frame-error\n");
    eq("host-run", "帧循环抛错：write 先于 throw（flush 在错误传播之前）", frameErr.order, "write>throw");
    const initErr = await probe(new InitErrorTree());
    eq("host-run", "init 抛错：同样先 flush 再抛", `${initErr.order}|${initErr.msg}`, "write>throw|init-boom");
  });

  // host.ts:6 的 out 是模块级数组；抛断言时也要清干净，免得缓冲漏给下一格。
  afterEach(() => resetOut());
});

// 退出前把「当前这一轮」排干：延后队列跑到空、已到期的计时器发一遍，未到期的等不到
// （读数 tmp/probe-drain/compare{94,95}.txt —— 十格端到端对照 tmp/probe-drain/ours.mts 不合 1 格，那一格是宿主虚拟时钟的墙上时间）。
describe("runtime/host · 退出前排干当前这一轮", () => {
  const runOf = async (make: () => SceneTree): Promise<string> => {
    resetOut();
    const tree = make();
    let text = "";
    const real = process.stdout.write;
    process.stdout.write = ((chunk: unknown): boolean => {
      text += typeof chunk === "string" ? chunk : Buffer.from(chunk as Uint8Array).toString("utf8");
      return true;
    }) as typeof process.stdout.write;
    try {
      await tree.run(1);
    } finally {
      process.stdout.write = real;
      resetOut();
    }
    return text;
  };

  class DeferredAfterQuit extends SceneTree {
    override _initialize(): Promise<void> {
      print("before");
      this.quit();
      callDeferred(() => print("later"));
      return Promise.resolve();
    }
  }
  class DeferredNested extends SceneTree {
    override _initialize(): Promise<void> {
      this.quit();
      callDeferred(() => {
        print("one");
        callDeferred(() => print("two"));
      });
      return Promise.resolve();
    }
  }
  class DeferredFifo extends SceneTree {
    override _initialize(): Promise<void> {
      this.quit();
      callDeferred(() => print("a"));
      callDeferred(() => print("b"));
      return Promise.resolve();
    }
  }
  const timerTree = (sec: number): (() => SceneTree) => () => {
    class T extends SceneTree {
      override _initialize(): Promise<void> {
        print("outer");
        this.quit();
        const t = this.create_timer(sec);
        void (async (): Promise<void> => {
          await awaitValue(t.timeout);
          print("due");
        })();
        return Promise.resolve();
      }
    }
    return new T();
  };

  it("五格排干口径逐一对上读数", async () => {
    eq("host-drain", "quit() 之后排的延后照样跑", await runOf(() => new DeferredAfterQuit()), "before\nlater\n");
    eq("host-drain", "延后里再排的延后也跑", await runOf(() => new DeferredNested()), "one\ntwo\n");
    eq("host-drain", "两支延后按排的次序", await runOf(() => new DeferredFifo()), "a\nb\n");
    eq("host-drain", "已到期的计时器在退出前发一遍", await runOf(timerTree(0)), "outer\ndue\n");
    eq("host-drain", "未到期的计时器等不到", await runOf(timerTree(5)), "outer\n");
  });
});
