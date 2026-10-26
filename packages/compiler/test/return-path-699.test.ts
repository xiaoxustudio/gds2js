// 声明了返回型的函数必须每条路径都回值（S699，尺 `tmp/probe725/{p1,p2}.gd` + `tmp/probe726/{m_if,m_while,m_ifelse,m_for,m_untyped}.gd`）：
// 引擎判得是**句法**的 —— `while true:` 里回值照样算没回；没标返回型的函数掉尾交 Nil，引擎不拒。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const SAY = "Not all code paths return a value.";
const src = (body: string): string => `extends SceneTree\n\n${body}\n\nfunc _initialize():\n\tquit()\n`;
const sayings = async (body: string): Promise<string[] | null> => {
  const hits = analyze(lower(await parseSource(src(body)))).diagnostics.filter((d) => d.message === SAY);
  return hits.length === 0 ? null : hits.map((d) => `${String(d.loc.line)}:${d.code}`);
};

describe("analyze · Not all code paths return a value", () => {
  it.each([
    ["体只有 pass", "\tfunc f() -> String:\n\t\tpass"],
    ["if 没 else", "\tfunc f(q) -> String:\n\t\tif q > 0:\n\t\t\treturn \"p\""],
    ["while true 里回值", "\tfunc f(q) -> String:\n\t\twhile true:\n\t\t\treturn \"loop\""],
    ["for 里条件回值", "\tfunc f(q) -> String:\n\t\tfor i in 3:\n\t\t\tif i == q:\n\t\t\t\treturn \"hit\""],
    ["match 无兜底臂", "\tfunc f(q) -> String:\n\t\tmatch q:\n\t\t\t1:\n\t\t\t\treturn \"one\""],
  ])("%s 引擎拒、我们也拒在函数那一行", async (_label, body) => {
    expect(await sayings(body)).toEqual(["3:return-path"]);
  });

  it("两支都回与 _ 兜底臂收下", async () => {
    expect(await sayings("\tfunc f(q) -> String:\n\t\tif q > 0:\n\t\t\treturn \"p\"\n\t\telse:\n\t\t\treturn \"n\"")).toBeNull();
    expect(await sayings("\tfunc f(q) -> String:\n\t\tmatch q:\n\t\t\t1:\n\t\t\t\treturn \"one\"\n\t\t\t_:\n\t\t\t\treturn \"other\"")).toBeNull();
  });

  it("没标返回型的函数不拒（掉尾交 Nil，实测 m_untyped）", async () => {
    expect(await sayings("\tfunc f(q):\n\t\tif q > 0:\n\t\t\treturn 1")).toBeNull();
  });

  it("-> void 不拒", async () => {
    expect(await sayings("\tfunc f(q) -> void:\n\t\tif q > 0:\n\t\t\tprint(q)")).toBeNull();
  });
});
