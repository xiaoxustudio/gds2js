/**
 * 协程调用的取值位与语句位（S407）：引擎那一句 `Function "f()" is a coroutine, so it must be called with "await".`
 * 只在**取值位**发，语句位丢弃返回值那一格放过 —— 16 格逐位量的（尺 `tmp/probe-awaitcall/round8.mts`，
 * 读数 `compare92.txt`，出货端到端 16 格对照 `tmp/probe-awaitcall/ours.mts` 不合 0）。
 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const AWAIT = 'Function "f()" is a coroutine, so it must be called with "await".';
const F = "func f():\n\tawait create_timer(0.01).timeout\n\treturn 1\n\nfunc g(v):\n\tprint(v)\n\nvar v\n\n";

async function first(src: string): Promise<string> {
  return analyze(lower(await parseSource(src))).diagnostics[0]?.message ?? "不拦";
}
const at = (call: string): string => `extends SceneTree\n\n${F}func _initialize():\n\t${call}\n\tquit()\n`;

describe("协程调用的位置", () => {
  const DISCARD = [
    "f()",
    "if true:\n\t\tf()",
    "for i in [1]:\n\t\tf()",
    "while true:\n\t\tf()\n\t\tbreak",
    "match 1:\n\t\t1:\n\t\t\tf()",
    "var c = func():\n\t\tf()\n\tc.call()",
  ];
  const VALUE = ["var r = f()", "print(f())", "g(f())", "var a = [f()]", "v = f()", "print(f() + 1)"];

  it("语句位丢弃的六形都不拦（引擎只打后面那一句）", async () => {
    for (const call of DISCARD) {
      expect(await first(at(call)), `丢弃位 ${call.split("\n")[0]} 该放过`).toBe("不拦");
    }
  });

  it("取值位的六形照旧拦，句子一字不差", async () => {
    for (const call of VALUE) {
      expect(await first(at(call)), `取值位 ${call}`).toBe(AWAIT);
    }
  });

  it("await 那一形与协程里丢弃另一支协程都不拦", async () => {
    const src = "extends SceneTree\n\nfunc h():\n\tawait create_timer(0.01).timeout\n\nfunc f():\n\th()\n\nfunc _initialize():\n\tawait f()\n\tquit()\n";
    expect(await first(src), "两格都放过").toBe("不拦");
  });

  it("定形返回值的协程在语句位同样放过", async () => {
    const src = "extends SceneTree\n\nfunc f() -> int:\n\tawait create_timer(0.01).timeout\n\treturn 1\n\nfunc _initialize():\n\tf()\n\tprint(\"A|后面\")\n\tquit()\n";
    expect(await first(src), "引擎那格打的是 A|后面").toBe("不拦");
  });

  it("内部类里的 f() 语句位给的是找不到名字那一句", async () => {
    const src = "extends SceneTree\n\nclass Thing:\n\tfunc _init():\n\t\tf()\n\nfunc f():\n\tawait create_timer(0.01).timeout\n\nfunc _initialize():\n\tThing.new()\n\tquit()\n";
    expect(await first(src), "引擎那格是 not found in base self").toBe('Function "f()" not found in base self.');
  });
});
