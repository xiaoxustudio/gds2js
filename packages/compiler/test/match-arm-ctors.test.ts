/**
 * S322 · 手臂里的构造式：那张按实参类型的合法表两侧对过 340 格（`tmp/probe-arm-arity/compare.mts`），
 *  这里钉的是四格语料的句子（从 golden 取，不转抄）与「以前被我们多拦、以前被我们放过」的两头。
 */
import { readFileSync } from "node:fs";
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseScript, cases, readGolden } from "./support/corpus";

const MOD = (arm: string): string => `extends SceneTree\n\nfunc g(p):\n\tmatch p:\n\t\t${arm}:\n\t\t\tprint(1)\n\t\t_:\n\t\t\tprint(2)\n\tquit()\n`;

const verdict = async (src: string): Promise<string> => {
  try {
    analyze(lower(await parseSource(src))).diagnostics;
    return "放过";
  } catch (e) {
    return e instanceof UnsupportedError ? e.message : `非拒答：${e instanceof Error ? e.message : String(e)}`;
  }
};

let goldenCells = 0;
let acceptedCells = 0;
let refusedCells = 0;

describe("手臂构造式 · 与语料 golden 同句", () => {
  const ids = cases.filter((id) => id.slice(4).startsWith("arm-"));
  expect(ids.length, "语料里的手臂构造格应当是四格").toBe(4);
  it.each(ids)("%s", async (id) => {
    const engine = [...(readGolden(id) ?? "").matchAll(/Parse Error: (.*)/g)].map((m) => m[1]?.trim() ?? "").join(String.fromCharCode(10));
    expect(engine, `[${id}] golden 里没有 Parse Error 那句`).not.toBe("");
    expect(await verdict(readFileSync(caseScript(id), "utf8")), `[${id}] 句子与引擎不一致`).toBe(engine);
    goldenCells++;
  });
});

describe("手臂构造式 · 合法表收下的都能编", () => {
  const ARMS = [
    "Vector2()", "Vector2(1, 2)", "Vector2(1, 2.5)", "Vector2(true, false)", "Vector2(Vector2(1, 2))",
    "Vector2i()", "Vector2i(1, 2.5)", "Vector2i(Vector2(1.5, 2))", "Vector3(1, 2.5, 3)", "Vector3i(1, 2, 3)",
    "StringName(\"a\")", "NodePath(\"a/b\")", "Callable()", "Color()", "Color(1, 2, 3)", "Color(1.5, 2.5, 3.5, 4.5)", "Color(\"ff0000\")", "String(\"a\")",
  ];
  it.each(ARMS)("%s", async (arm) => {
    expect(await verdict(MOD(arm)), `${arm} 引擎收，我们不许拦`).toBe("放过");
    acceptedCells++;
  });
});

/** `Color(1)` 与 `Color(1, 2)` 引擎手臂收（`sig-table2` / `mix-table`：一元 int 与 `(int,int)` 都收，而 `(float)` 与 `(float,float)` 拒），
 *  可我们运行期那支 `color()` 只到 0 / 1 / 3 / 4 与字符串 —— 收进来就是产物里的一句抛错，所以先留在表外。 */
describe("手臂构造式 · 运行期构造子还没对上那两形仍拦", () => {
  const ARMS = ["Color(1)", "Color(1, 2)", "Color(1, 2.5)"];
  it.each(ARMS)("%s", async (arm) => {
    expect(await verdict(MOD(arm)), `${arm} 现在还不该放过`).not.toBe("放过");
    refusedCells++;
  });
});

/** 引擎手臂收这些形，可这些类名的构造调用连表达式位置都编不过 ——
 *  收了只会把拦点从 lower 挪到 emit，所以仍留在表外；那七支构造接进全局可调用表之后再看这一格。 */
describe("手臂构造式 · 构造子没接进表达式位置的七形仍拦", () => {
  const ARMS = ["Transform2D()", "Plane(1, 2.5, 3, 4)", "Quaternion(1, 2, 3, 4)", "Basis()", "Signal()", "AABB()"];
  it.each(ARMS)("%s", async (arm) => {
    expect(await verdict(MOD(arm)), `${arm} 现在还不该放过`).not.toBe("放过");
    refusedCells++;
  });
});

describe("手臂构造式 · 表外的那一批发引擎那句", () => {
  const ARM2 = 'Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").';
const TWO = (sig: string): string => sig + String.fromCharCode(10) + ARM2;
const ARMS = [
    ["Vector2(1)", TWO('No constructor of "Vector2" matches the signature "Vector2(int)".')],
    ["Vector2(1, 2, 2.5)", TWO('No constructor of "Vector2" matches the signature "Vector2(int, int, float)".')],
    ["Vector2(1, &\"a\")", TWO('No constructor of "Vector2" matches the signature "Vector2(int, StringName)".')],
    ["Vector2(1, Vector2(2, 3))", TWO('No constructor of "Vector2" matches the signature "Vector2(int, Vector2)".')],
    ["StringName(1)", TWO('No constructor of "StringName" matches the signature "StringName(int)".')],
    ["NodePath(1)", TWO('No constructor of "NodePath" matches the signature "NodePath(int)".')],
    ["Color(1.5)", TWO('No constructor of "Color" matches the signature "Color(float)".')],
    ["Color(1.5, 1.5)", TWO('No constructor of "Color" matches the signature "Color(float, float)".')],
    ["Color(Vector2(1, 2))", TWO('No constructor of "Color" matches the signature "Color(Vector2)".')],
    ["Vector3(1, 2)", TWO('No constructor of "Vector3" matches the signature "Vector3(int, int)".')],
    ["Array(1)", TWO('No constructor of "Array" matches the signature "Array(int)".')],
    ["Dictionary(\"a\")", TWO('No constructor of "Dictionary" matches the signature "Dictionary(String)".')],
    ["Rect2(1)", TWO('No constructor of "Rect2" matches the signature "Rect2(int)".')],
    ["Vector2(Rect2(1))", 'No constructor of "Rect2" matches the signature "Rect2(int)".' + String.fromCharCode(10) + 'No constructor of "Vector2" matches the signature "Vector2(Rect2)".' + String.fromCharCode(10) + ARM2],
    ["NoSuchType(1)", TWO('Function "NoSuchType()" not found in base self.')],
    ["Vector2(q, 2)", ARM2],
  ] as Array<[string, string]>;
  it.each(ARMS)("%s", async (arm, sentence) => {
    expect(await verdict(MOD(arm)), `${arm} 的句子不对`).toBe(sentence);
    refusedCells++;
  });
});

afterAll(() => {
  console.log(`手臂构造式读数：golden 同句 ${goldenCells}/4 · 表内收下 ${acceptedCells} 形 · 表外同拒 ${refusedCells} 形`);
});
