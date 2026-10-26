/**
 * 静态标注的字典 + 静态 int 键的那一格得走 `rt.dictIndexInt`（引擎讲的是数组那一式，S405），其余形状仍走 `rt.index`。
 * 尺 `tmp/probe-dictkey/round4.mts`（模块标注 / 局部标注 / 形参标注 / 内部类字段 / `Variant` 标注 / 推断 / 写形式的读数），读数 `compare{75,76,77,78}.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function code(src: string): Promise<string> {
  const m = lower(await parseSource(src));
  const analysis = analyze(m);
  return emitModule(m, OPTS, analysis);
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

// 静态标注的**位置型基**（Array / Array[k] / String / 八支 pack）读的那一格要带声明拼法，运行期才发得出 `Out of bounds get index …` 那一式
// （21 格读数 `tmp/probe-typedlabel/compare{98,99}.txt`，出货端到端 12 格 + 10 格对照 `tmp/probe-typedlabel/round15.mts` 与 `round16.mts`）。
const POS: Array<[string, string, string | null]> = [
  ["局部定形 Array", F("\tvar a: Array[int] = [1]\n\tprint(a[5])"), "Array[int]"],
  ["局部裸标注 Array", F("\tvar a: Array = [1]\n\tprint(a[5])"), "Array"],
  ["局部标注 String", F('\tvar s: String = "ab"\n\tprint(s[5])'), "String"],
  ["局部定形 pack", F("\tvar p: PackedInt32Array = PackedInt32Array([1])\n\tprint(p[5])"), "PackedInt32Array"],
  ["形参定形 Array", "extends SceneTree\n\nfunc f(a: Array[int]):\n\tprint(a[5])\n\nfunc _initialize():\n\tf([1])\n\tquit()\n", "Array[int]"],
  ["内部类字段定形 Array", "extends SceneTree\n\nclass Thing:\n\tvar a: Array[int] = [1]\n\tfunc g():\n\t\tprint(a[5])\n\nfunc _initialize():\n\tThing.new().g()\n\tquit()\n", "Array[int]"],
  ["模块级定形 Array", "extends SceneTree\n\nvar a: Array[int] = [1]\n\nfunc _initialize():\n\tprint(a[5])\n\tquit()\n", "Array[int]"],
  ["推断的数组不带", F("\tvar a = [1]\n\tprint(a[5])"), null],
  ["标注转手给未标注", "extends SceneTree\n\nvar a: Array[int] = [1]\nvar b = a\n\nfunc _initialize():\n\tprint(b[5])\n\tquit()\n", null],
  ["Variant 标注收定形数组", "extends SceneTree\n\nvar a: Array[int] = [1]\nvar v: Variant = a\n\nfunc _initialize():\n\tprint(v[5])\n\tquit()\n", null],
  ["形参 Variant 收定形数组", "extends SceneTree\n\nvar a: Array[int] = [1]\n\nfunc f(v: Variant):\n\tprint(v[5])\n\nfunc _initialize():\n\tf(a)\n\tquit()\n", null],
  ["下标写不路由（另一式已经对）", F("\tvar a: Array[int] = [1]\n\ta[5] = 2"), null],
];

describe("位置型基标注的路由", () => {
  const LABELS = ["Array[int]", "Array", "String", "PackedInt32Array"];
  for (const [label, src, want] of POS) {
    it(label, async () => {
      const c = await code(src);
      if (want === null) {
        eq("412", `${label} 不该带基名`, LABELS.some((x) => c.includes(`, "${x}")`)), false);
      } else {
        eq("412", `${label} 该带基名 ${want}`, c.includes(`, "${want}")`), true);
      }
    });
  }
});
