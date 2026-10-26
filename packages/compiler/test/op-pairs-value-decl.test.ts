/**
 * 标值型**标注**作操作数的那两张对表（S457 第一笔）：210 格 × 两向逐格过 Godot 4.6.3 的裁判
 * （尺 `tmp/d6/annot.py`，读数 `tmp/d6/av-decl.txt` / `tmp/d6/av-mirror.txt`，361 对零分歧）。
 * 从前这一族整族放过 —— `var v: Vector2` 摆在模块顶上，`v + 1` / `1 + v` 都出货。
 * 两向**不是镜像**（正向 177 对、反向 184 对），所以各记一张表，这里把两笔的张数也钉住。
 * S489 往这两张表各并进 232 / 242 对（StringName / NodePath 两面，尺 `tmp/d6/s489c.py` + `tmp/d6/s489e.py`），
 * 张数涨到 469 / 667；右支写成字面量还是标注名，引擎拒的集一字一样，所以两形共用一张表。
 */
import { describe, expect, it } from "vitest";
import { analyze, OP_PAIRS_REFUSED_DECL_VAL, OP_PAIRS_REFUSED_DECL_VAL_REV } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = 'extends SceneTree\n\nvar v: Vector2 = Vector2(1, 2)\nvar vi: Vector2i = Vector2i(1, 2)\nvar c: Color = Color(1, 2, 3, 4)\nvar s: String = "x"\nvar ea: Array[Vector2] = [Vector2(1, 2)]\nvar ei: Array[int] = [1]\nvar dv: Dictionary[String, Vector2] = {"a": Vector2(1, 2)}\nvar k: String = "a"\n';

async function pairs(body: string): Promise<string[]> {
  const src = HEAD + body + "\nfunc _initialize():\n\tprint(\"ok\")\n\tquit()\n";
  return analyze(lower(await parseSource(src))).diagnostics
    .filter((d) => d.code === "op-pair")
    .map((d) => d.message);
}

const msg = (a: string, b: string, op: string): string => `Invalid operands "${a}" and "${b}" for "${op}" operator.`;

const count = (t: Readonly<Record<string, ReadonlyArray<string>>>): number => Object.values(t).reduce((a, b) => a + b.length, 0);

const REFUSED: Array<[string, string, string, string, string]> = [
  ["正向 · Vector2 加 int", "print(v + 1)", "Vector2", "int", "+"],
  ["正向 · Vector2 比 int", "print(v < 1)", "Vector2", "int", "<"],
  ["正向 · Vector2 等 int", "print(v == 1)", "Vector2", "int", "=="],
  ["正向 · Color 取模 float", "print(c % 1.5)", "Color", "float", "%"],
  ["正向 · Vector2i 乘 Vector2", "print(vi * Vector2(1, 2))", "Vector2i", "Vector2", "*"],
  ["反向 · int 加 Vector2", "print(1 + v)", "int", "Vector2", "+"],
  ["反向 · String 除 Color", "print(\"x\" / c)", "String", "Color", "/"],
  ["元素读 · `Array[Vector2]` 的 `e[0]` 加 int", "print(ea[0] + 1)", "Vector2", "int", "+"],
  ["元素读 · 定形数组内型当左支取模", "print(ea[0] % 1)", "Vector2", "int", "%"],
  ["元素读 · 反向 `1 + e[0]`", "print(1 + ea[0])", "int", "Vector2", "+"],
  ["元素读 · `Array[int]` 的内型配 Color", "print(ei[0] + Color(1, 2, 3, 4))", "int", "Color", "+"],
];

describe("标值型标注的运算符对", () => {
  for (const [name, body, a, b, op] of REFUSED) {
    it(name, async () => {
      expect(await pairs("func z():\n\t" + body + "\n")).toEqual([msg(a, b, op)]);
    });
  }

  it("定形字典的值读与数组的非字面量下标读同样交出内型（S468）", async () => {
    expect(await pairs('func z():\n\tprint(dv["a"] + "x")\n')).toEqual([msg("Vector2", "String", "+")]);
    expect(await pairs("func z():\n\tprint(dv[k] + \"x\")\n")).toEqual([msg("Vector2", "String", "+")]);
    expect(await pairs("func z():\n\tprint(1 + dv[\"a\"])\n")).toEqual([msg("int", "Vector2", "+")]);
    expect(await pairs("func z():\n\tprint(dv[1] + \"x\")\n")).toEqual([]);
    expect(await pairs("func z():\n\tprint(dv[\"a\"] + Vector2(3, 4))\n")).toEqual([]);
  });

  it("同型那一格照收：`Vector2 + Vector2` 与 `Color + Color` 引擎不拦", async () => {
    expect(await pairs("func z():\n\tprint(v + Vector2(3, 4))\n")).toEqual([]);
    expect(await pairs("func z():\n\tprint(c + Color(1, 1, 1, 1))\n")).toEqual([]);
  });

  it("两张表按实测各 469 / 667 对 —— 反向不是正向的镜像，且反向还含「值型字面量在左」那一批", () => {
    expect(count(OP_PAIRS_REFUSED_DECL_VAL)).toBe(469);
    expect(count(OP_PAIRS_REFUSED_DECL_VAL_REV)).toBe(667);
  });

  it("属性名当值拿的是属性自己的型（S467），方法名当值才是 Callable", async () => {
    expect(await pairs("func z():\n\tprint(v.x + \"x\")\n")).toEqual([msg("float", "String", "+")]);
    expect(await pairs("func z():\n\tprint(Vector2(1, 2) + v.x)\n")).toEqual([msg("Vector2", "float", "+")]);
    expect(await pairs("func z():\n\tprint(Vector2(1, 2) * v.x)\n")).toEqual([]);
    expect(await pairs("func z():\n\tprint(v.x + 1)\n")).toEqual([]);
  });

  it("标量的老集没被扩表带歪：`String + int` 仍旧一句", async () => {
    expect(await pairs("func z():\n\tprint(s + 1)\n")).toEqual([msg("String", "int", "+")]);
  });
});
