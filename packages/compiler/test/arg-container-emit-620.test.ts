/** 认得到 callee 的调用点：字面量实参折算、其余实参发运行期那一句（S620），读数 `tmp/probe619/`。 */
import { describe, expect, it } from "vitest";
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

const HEAD = "func top(v: Array[int]) -> void:\n\tpass\n\nfunc tops(v: Array[String]) -> void:\n\tpass\n\nfunc topd(v: Dictionary[int, String]) -> void:\n\tpass\n\n";
const F = (body: string): string => `extends SceneTree\n\n${HEAD}func _initialize():\n${body}\n\tquit()\n`;

describe("emit · 定形容器实参位的两种发法", () => {
  it("非字面量实参发 paramContainer，标注与函数名一起交给运行期", async () => {
    const c = await code(F("\tvar w: Variant = [1]\n\ttop(w)\n"));
    expect(c).toContain('rt.paramContainer(w, "Array[int]", 1, "top", this)');
  });
  it("self. 前缀同一形", async () => {
    const c = await code(F("\tvar w: Variant = [1]\n\tself.top(w)\n"));
    expect(c).toContain('rt.paramContainer(w, "Array[int]", 1, "top", this)');
  });
  it("字面量实参照编译期折算，不进那一句", async () => {
    const c = await code(F("\ttop([1, 2])\n"));
    expect(c).toContain('rt.stampArray(');
    expect(c).not.toContain("rt.paramContainer");
  });
  it("类名槽的字面量走 stampClassArray", async () => {
    const c = await code(`extends SceneTree\n\nfunc takec(v: Array[RefCounted]) -> void:\n\tpass\n\nfunc _initialize():\n\ttakec([])\n\tquit()\n`);
    expect(c).toContain('rt.stampClassArray(');
  });
  it("字典槽的字面量走 stampDict", async () => {
    const c = await code(F('\ttopd({1: "a"})\n'));
    expect(c).toContain('rt.stampDict(');
  });
  it("第二位的位置与函数名跟着实参走", async () => {
    const c = await code(`extends SceneTree\n\nfunc two(a: int, v: Array[String]) -> void:\n\tpass\n\nfunc _initialize():\n\tvar w: Variant = ["s"]\n\ttwo(1, w)\n\tquit()\n`);
    expect(c).toContain('rt.paramContainer(w, "Array[String]", 2, "two", this)');
  });
  it("不定形标注的形参不发这一句", async () => {
    const c = await code(`extends SceneTree\n\nfunc free(v) -> void:\n\tpass\n\nfunc _initialize():\n\tvar w: Variant = [1]\n\tfree(w)\n\tquit()\n`);
    expect(c).not.toContain("rt.paramContainer");
  });
});
