// 调用栈那一族（语料 273 钉了引擎的逐字节读数；本门钉语料看不见的那些：交错时帧不退错、异常路径也退帧、
// 两块文本的逐行形状与 `get_stack()` 的键序。读数：`tmp/probe-frames/`（S281，原文靠 `--language en`）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { showArgs } from "@gds2js/runtime/runtime/values";
import {
  frameEnter,
  frameExit,
  frameLine,
  gGetStack,
  gPrintStack,
  setStackPrintSink,
  stackBlockLines,
  stackFrameLines,
} from "@gds2js/runtime/runtime/frames";

/** 一帧一格：进栈、写行号，体跑完再退 —— 与产物里 `rt.frameEnter` / `rt.frameLine` / `rt.frameExit` 同一套。 */
function frame<T>(source: string, fn: string, line: number, body: () => T): T {
  const depth = frameEnter(source, fn);
  try {
    frameLine(line);
    return body();
  } finally {
    frameExit(depth);
  }
}

const b = (v: boolean): string => String(v);

describe("runtime/frames · 帧栈的进出", () => {
  it("空栈、单层、嵌套三格", () => {
    eq("281", "没人进栈时三块都是空的", `${String(stackFrameLines().length)}|${showArgs([gGetStack()])}`, "0|[]");
    eq("281", "一帧的形状：Frame 0 在最前", frame("res://a.gd", "one", 7, () => stackFrameLines().join(";")) + `|${String(stackFrameLines().length)}`, "Frame 0 - res://a.gd:7 in function 'one'|0");
    eq(
      "281",
      "三层链：最近的帧在前，父帧停在调用点那一行",
      frame("res://a.gd", "top", 12, () =>
        frame("res://a.gd", "mid", 20, () => frame("res://a.gd", "boot", 33, () => stackFrameLines().join("|")))
      ),
      "Frame 0 - res://a.gd:33 in function 'boot'|Frame 1 - res://a.gd:20 in function 'mid'|Frame 2 - res://a.gd:12 in function 'top'",
    );
    eq("281", "体抛错也要退帧（finally 那一对）", (() => {
      try {
        frame("res://a.gd", "boom", 3, () => {
          throw new Error("x");
        });
      } catch {
        /* 吞掉，只看帧有没有留下 */
      }
      return String(stackFrameLines().length);
    })(), "0");
  });

  it("交错的两条链不许把别人的帧摘走", () => {
    const outer = frameEnter("res://a.gd", "outer");
    frameLine(2);
    const inner = frameEnter("res://a.gd", "inner");
    frameLine(6);
    // 协程交错：内层还没退，外层先退了 —— 深度是外层的，栈被收回外层之前
    frameExit(outer);
    eq("281", "外层先退，栈里一个都不剩", String(stackFrameLines().length), "0");
    frameExit(inner);
    eq("281", "内层后退出也不许把已退的帧复活", String(stackFrameLines().length), "0");
  });

  it("两块文本与 get_stack 的键序", () => {
    eq(
      "281",
      "push_error 那一块：首行 + at: + 表头 + 每帧一行，实参顺次拼",
      frame("res://m.gd", "lvl", 4, () => stackBlockLines("ERROR", "push_error (core/variant/variant_utility.cpp:1024)", [V.str("boom"), V.int(5)]).join("\n")),
      "ERROR: boom5\n   at: push_error (core/variant/variant_utility.cpp:1024)\n   GDScript backtrace (most recent call first):\n       [0] lvl (res://m.gd:4)",
    );
    eq(
      "281",
      "空实参照打，首行只剩一个空格",
      frame("res://m.gd", "lvl", 6, () => stackBlockLines("ERROR", "push_error (core/variant/variant_utility.cpp:1024)", [])[0]),
      "ERROR: ",
    );
    eq(
      "281",
      "get_stack 的键序固定 source / function / line，键是 String",
      frame("res://m.gd", "deep", 16, () => showArgs([gGetStack()])),
      '[{ "source": "res://m.gd", "function": "deep", "line": 16 }]',
    );
  });

  it("print_stack 的每一行都从宿主那侧出口走", () => {
    const got: string[] = [];
    setStackPrintSink((line: string) => got.push(line));
    frame("res://m.gd", "one", 3, () => {
      gPrintStack();
      frame("res://m.gd", "two", 9, () => {
        gPrintStack();
      });
    });
    eq(
      "281",
      "第二次的栈里多了一层，所以是三行、最近的仍在前",
      got.join("|"),
      "Frame 0 - res://m.gd:3 in function 'one'|Frame 0 - res://m.gd:9 in function 'two'|Frame 1 - res://m.gd:3 in function 'one'",
    );
    eq("281", "print_stack 是 void（实测值位置被解析期拦）", b(gPrintStack().t === V.nil().t), "true");
  });
});
