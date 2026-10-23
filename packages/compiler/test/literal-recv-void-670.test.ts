// 字面量容器**直接当接收者**的 void 那一句（S670，尺 `tmp/probe673/paren.mts` 九格两侧对读）：
// 引擎认这一面 —— `print([1, 2].append(3))` / `print(([1, 2]).sort())` / `print({1: 2}.merge({3: 4}))` /
// `print(([1, 2]).make_read_only())` 四格都在解析期发 `Cannot get return value of call to "X()" because it returns "void".`，
// 括号与不带括号同形；此前那道判据只走 `ident`（标注 / 推断出来的名字）与 `call`（构造式）两支，字面量接收者一句不发。
// 反面对照也在这把尺上：`print(([1, 2]).size())` 与 `print((" ab ").lstrip(" "))` 两侧都无句（不是 void，也不越元数）。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const VOID = (n: string): string => `Cannot get return value of call to "${n}()" because it returns "void".`;
const src = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;
const msgs = async (body: string): Promise<string[]> => analyze(lower(await parseSource(src(body)))).map((d) => d.message);

describe("analyze · 字面量容器接收者的 void 那一句", () => {
  it.each([
    ["Array 裸字面量", "\tprint([1, 2].append(3))", "append"],
    ["Array 括号字面量", "\tprint(([1, 2]).sort())", "sort"],
    ["Array 括号字面量读名", "\tprint(([1, 2]).make_read_only())", "make_read_only"],
    ["Dictionary 裸字面量", "\tprint({1: 2}.merge({3: 4}))", "merge"],
  ])("%s 发引擎那一句", async (_label, body, name) => {
    expect(await msgs(body)).toEqual([VOID(name)]);
  });

  it("非 void 的成员名照旧放行", async () => {
    expect(await msgs("\tprint(([1, 2]).size())\n")).toEqual([]);
    expect(await msgs('\tprint((" ab ").lstrip(" "))\n')).toEqual([]);
  });
});
