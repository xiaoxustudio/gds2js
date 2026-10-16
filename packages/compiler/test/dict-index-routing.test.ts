/**
 * 静态标注的字典 + 静态 int 键的那一格得走 `rt.dictIndexInt`（引擎讲的是数组那一式，S405），其余形状仍走 `rt.index`。
 * 尺 `tmp/probe-dictkey/round4.mts`（模块标注 / 局部标注 / 形参标注 / 内部类字段 / `Variant` 标注 / 推断 / 写形式的读数），读数 `compare{75,76,77,78}.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function code(src: string): Promise<string> {
  const m = lower(await parseSource(src));
  analyze(m);
  return emitModule(m, OPTS);
}

const F = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;

const ROUTES: Array<[string, string, boolean]> = [
  ["局部标注 Dictionary + int 字面量键", F('\tvar a: Dictionary = {1: 2}\n\tprint(a[0])'), true],
  ["局部标注 Dictionary + int 名字键", F('\tvar a: Dictionary = {1: 2}\n\tvar k: int = 0\n\tprint(a[k])'), true],
  ["局部标注 Dictionary + String 键", F('\tvar a: Dictionary = {1: 2}\n\tprint(a["x"])'), false],
  ["局部标注 Dictionary + float 键", F('\tvar a: Dictionary = {1: 2}\n\tprint(a[2.0])'), false],
  ["推断字典 + int 键", F("\tvar a = {1: 2}\n\tprint(a[0])"), false],
  ["Variant 标注 + int 键", F("\tvar a: Variant = {1: 2}\n\tprint(a[0])"), false],
  ["定形 int 键字典 + int 键", F('\tvar a: Dictionary[int, String] = {1: "x"}\n\tprint(a[7])'), true],
  ["定形 String 键字典 + String 键", F('\tvar a: Dictionary[String, int] = {"x": 1}\n\tprint(a["nope"])'), false],
  ["标注字典的下标写", F("\tvar a: Dictionary = {1: 2}\n\ta[0] = 5"), false],
  ["模块标注 Dictionary + int 键", "extends SceneTree\n\nvar a: Dictionary = {1: 2}\n\nfunc _initialize():\n\tprint(a[0])\n\tquit()\n", true],
  ["形参标注 Dictionary + int 键", "extends SceneTree\n\nfunc f(a: Dictionary):\n\tprint(a[0])\n\nfunc _initialize():\n\tf({1: 2})\n\tquit()\n", true],
  ["内部类字段标注 + self 方法返回字典", "extends SceneTree\n\nclass Inner:\n\tvar a: Dictionary = {1: 2}\n\tfunc g():\n\t\tprint(a[0])\n\nfunc _initialize():\n\tInner.new().g()\n\tquit()\n", true],
  ["标注方法返回字典 + self 调用的 int 键", "extends SceneTree\n\nfunc d() -> Dictionary:\n\treturn {1: 2}\n\nfunc _initialize():\n\tprint(self.d()[0])\n\tquit()\n", true],
  ["数组的 int 键不路由", F("\tvar a = [1, 2]\n\tprint(a[0])"), false],
];

describe("字典 int 键的路由", () => {
  for (const [label, src, routed] of ROUTES) {
    it(label, async () => {
      const c = await code(src);
      eq("405", label, c.includes("rt.dictIndexInt("), routed);
    });
  }
});
