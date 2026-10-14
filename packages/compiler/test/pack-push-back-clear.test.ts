/**
 * pack 的 `clear` 是 void、`push_back` 与 `append` 同槽同返回值（S375）：`push_back` 此前挂在「Godot 里没这名字」那张表上，
 * `clear` 此前根本没登记 —— 九支逐支过裁判后两名都发货（尺 `tmp/probe-pack/{nosuch,returns}.mts`，读数 `tmp/probe-pack/{nosuch.json,compare15.txt}`）。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(src: string): Promise<string[]> {
  return analyze(lower(await parseSource(src))).map((d) => d.message);
}

const H = "extends SceneTree\n\n";
const MOD = (body: string): string => `${H}func _initialize():\n${body}\n\tquit()\n`;
const BYTE = '\tvar s = PackedByteArray([1, 2])\n';

describe("pack 的 clear 是 void", () => {
  it("取 clear() 的返回值：解析期那一句", async () => {
    const d = await diags(MOD(`${BYTE}\tvar x = s.clear()\n\tprint(x)`));
    eq("375", "clear 取值", d[0] ?? "没拒", 'Cannot get return value of call to "clear()" because it returns "void".');
  });

  it("append 与 push_back 返回 bool，取值合法", async () => {
    eq("375", "append 取值", await diags(MOD(`${BYTE}\tvar x = s.append(9)\n\tprint(x)`)), []);
    eq("375", "push_back 取值", await diags(MOD(`${BYTE}\tvar x = s.push_back(9)\n\tprint(x)`)), []);
  });

  it("clear() 当语句用不拒", async () => {
    eq("375", "clear 当语句", await diags(MOD(`${BYTE}\ts.clear()\n\tprint(s.size())`)), []);
  });
});

describe("push_back 的实参照样过元素槽判据", () => {
  it("string 支收 int：引擎那两句里的第一句", async () => {
    const d = await diags(MOD('\tvar s = PackedStringArray(["a"])\n\ts.push_back(1)\n\tprint(s)'));
    eq("375", "string 支收 int", d[0] ?? "没拒", 'Cannot pass a value of type "int" as "String".');
  });

  it("同一格换 append 是同句（对照）", async () => {
    const d = await diags(MOD('\tvar s = PackedStringArray(["a"])\n\ts.append(1)\n\tprint(s)'));
    eq("375", "append 同句", d[0] ?? "没拒", 'Cannot pass a value of type "int" as "String".');
  });

  it("vector2 支收 Vector2 不拒", async () => {
    eq("375", "vector2 支收对类型", await diags(MOD("\tvar s = PackedVector2Array([Vector2(1, 2)])\n\ts.push_back(Vector2(9, 8))\n\tprint(s)")), []);
  });
});
