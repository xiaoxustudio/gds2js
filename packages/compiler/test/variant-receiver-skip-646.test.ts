/** 显式标注 `Variant` 的接收者**不在解析期开口**（S646，读数 `tmp/probe644/ps645.compare.txt` 六面 × 四形 × 越界两向）。
 *  同一把尺也钉住反面：不标注的推断形、标注那面本身、字面量直接当接收者 —— 引擎三形都在解析期发句，我们照发。
 *  病灶是「由初值证面」那三处原先不看显式标注，于是 `var s: Variant = "ab"` 被当 String 面拦在解析期。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const src = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;

const TOOMANY = 'Too many arguments for "strip_edges()" call. Expected at most 2 but received 3.';
const TOOFEW = 'Too few arguments for "slice()" call. Expected at least 1 but received 0.';

const CASES: Array<[string, string, string[]]> = [
  // ① 显式 Variant：一句不发，交回运行期那两句
  ["标注 Variant 的字符串接收者放过", src('\tvar s: Variant = "ab"\n\ts.strip_edges(1, 2, 3)\n'), []],
  ["标注 Variant 的缺元数也放过", src('\tvar np: Variant = NodePath("a/b")\n\tnp.slice()\n'), []],
  ["标注 Variant 的数组表外名放过", src("\tvar a: Variant = [1]\n\ta.nope()\n"), []],
  ["标注 Variant 的字典实参位放过", src("\tvar d: Variant = {1: 2}\n\td.set(1)\n"), []],
  ["标注 Variant 的 Callable 放过", src("\tvar c: Variant = Callable()\n\tc.unbind()\n"), []],
  ["标注 Variant 的 Signal 放过", src("\tvar g: Variant = Signal()\n\tg.get_name(1)\n"), []],
  // ② 其余三形：引擎在解析期发句，我们也发（一字不差）
  ["推断接收者仍在解析期拦（同句）", src('\tvar s = "ab"\n\ts.strip_edges(1, 2, 3)\n'), [TOOMANY]],
  ["标注 String 接收者仍在解析期拦", src('\tvar s: String = "ab"\n\ts.strip_edges(1, 2, 3)\n'), [TOOMANY]],
  ["字面量直接当接收者仍在解析期拦", src('\tNodePath("a/b").slice()\n'), [TOOFEW]],
  ["标注那面的表外名仍发两句", src("\tvar a: Array = [1]\n\ta.nope()\n"), ['Cannot find member "nope" in base "Array".', 'Function "nope()" not found in base Array.']],
];

describe("analyze · 显式 Variant 的接收者从解析期放行", () => {
  it.each(CASES)("%s", async (_name, source, expected) => {
    const got = analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
    expect(got, `源：\n${source}`).toEqual(expected);
  });

  it("模块级 var 与类字段同判据", async () => {
    const mod = await parseSource('extends SceneTree\n\nvar ms: Variant = "ab"\nvar is = "cd"\n\nfunc _initialize():\n\tms.strip_edges(1, 2, 3)\n\tis.strip_edges(1, 2, 3)\n\tquit()\n');
    expect(analyze(lower(mod)).diagnostics.map((d) => d.message), "模块级：标注 Variant 放过、推断形照拦").toEqual([TOOMANY]);
    const cls = await parseSource('extends SceneTree\n\nclass One:\n\tvar fs: Variant = "ab"\n\tvar gi = "cd"\n\n\tfunc f():\n\t\tfs.strip_edges(1, 2, 3)\n\t\tgi.strip_edges(1, 2, 3)\n');
    expect(analyze(lower(cls)).diagnostics.map((d) => d.message), "类字段同一条").toEqual([TOOMANY]);
  });
});
