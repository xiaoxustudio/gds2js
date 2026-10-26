/**
 * 值类型方法调用的实参数（S305）：引擎在**解析期**按接收者的静态形拦，两句文案是机械的
 * （`Too few … Expected at least N but received M.` / `Too many … Expected at most N but received M.`），
 * 表本身是 154 名逐名过裁判量出来的（`tmp/probe-value-arity/{a,max,max6}.mts`）。
 * 接收者那侧的形状是 `tmp/probe-value-arity/recv.mts` 十二形的读数：五形解析期拦、两形放过成运行期那句，
 * 链式那一形随 S482（名字打头）与 S498（构造式打头，读数 `tmp/d6/s498a.json` 九十三格）接上；定形数组元素那一形已随 S473 接上（读数 `tmp/d6/q4.gd`）。
 * `@行号` 是测试自己加的（引擎把行号放在 `at: GDScript::reload (…:N)` 那一帧，句子文本里没有）。
 */
import { afterAll, describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const bodySrc = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`;

const FEW = (who: string, min: number, got: number): string =>
  `Too few arguments for "${who}()" call. Expected at least ${String(min)} but received ${String(got)}.`;
const MANY = (who: string, max: number, got: number): string =>
  `Too many arguments for "${who}()" call. Expected at most ${String(max)} but received ${String(got)}.`;

const CASES: Array<[string, string, string[]]> = [
  ["字面构造式少给", bodySrc("\tprint(Vector2(1, 2).angle_to())"), [FEW("angle_to", 1, 0) + " @4"]],
  ["字面构造式多给", bodySrc("\tprint(Vector2(1, 2).abs(0))"), [MANY("abs", 0, 1) + " @4"]],
  ["标注的局部 var", bodySrc("\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.rotated(0, 0))"), [MANY("rotated", 1, 2) + " @5"]],
  ["只声明不赋值的 var", bodySrc("\tvar v: Vector2\n\tprint(v.angle_to())"), [FEW("angle_to", 1, 0) + " @5"]],
  ["推断出来的 var", bodySrc("\tvar v = Vector2i(3, 4)\n\tprint(v.snapped(Vector2i(1, 1), Vector2i(2, 2)))"), [MANY("snapped", 1, 2) + " @5"]],
  ["形参标注", "extends SceneTree\n\nfunc f(v: Vector3):\n\tprint(v.distance_to())\n\nfunc _initialize():\n\tf(Vector3(1, 2, 3))\n\tquit()\n", [FEW("distance_to", 1, 0) + " @4"]],
  ["模块级 var", "extends SceneTree\n\nvar v: Vector2 = Vector2(1, 2)\n\nfunc _initialize():\n\tprint(v.angle_to())\n\tquit()\n", [FEW("angle_to", 1, 0) + " @6"]],
  ["模块级 const", "extends SceneTree\n\nconst C = Vector2(1, 2)\n\nfunc _initialize():\n\tprint(C.angle_to())\n\tquit()\n", [FEW("angle_to", 1, 0) + " @6"]],
  ["永不执行的分支也拦", bodySrc("\tvar v: Vector2 = Vector2(3, 4)\n\tif false:\n\t\tprint(v.limit_length(2.0, 3.0))\n\tprint(v.length())"), [MANY("limit_length", 1, 2) + " @6"]],
  ["Color 少给", bodySrc("\tvar c: Color = Color(0.25, 0.5, 0.75, 1)\n\tprint(c.lerp())"), [FEW("lerp", 2, 0) + " @5"]],
  ["Color 多给", bodySrc("\tvar c: Color = Color(0.25, 0.5, 0.75, 1)\n\tprint(c.blend(c, c))"), [MANY("blend", 1, 2) + " @5"]],
  ["带默认实参那一族：0 支收", bodySrc("\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.limit_length())"), []],
  ["带默认实参那一族：1 支收", bodySrc("\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.limit_length(2.0))"), []],
  ["带默认实参那一族：2 支拒", bodySrc("\tvar c: Color = Color(0.25, 0.5, 0.75, 1)\n\tprint(c.to_html(1, 1))"), [MANY("to_html", 1, 2) + " @5"]],
  ["Color.clamp 是 0..2", bodySrc("\tvar c: Color = Color(0.25, 0.5, 0.75, 1)\n\tprint(c.clamp() + c.clamp(c) + c.clamp(c, c))"), []],
  ["大下界那支（7 个实参）", bodySrc("\tprint(Vector2(1, 2).cubic_interpolate_in_time())"), [FEW("cubic_interpolate_in_time", 7, 0) + " @4"]],
  ["未定形 Array 的元素：解析期放过（引擎也是运行期那句）", bodySrc("\tvar a = [Vector2(1, 2)]\n\tprint(a[0].angle_to())"), []],
  ["Variant 标注：解析期放过（同上）", bodySrc("\tvar v: Variant = Vector2(1, 2)\n\tprint(v.angle_to())"), []],
  ["链式：构造式打头也交得出面（S498，尺 `tmp/d6/s498a.py` 九十三格逐格对裁判）", bodySrc("\tprint(Vector2(1, 2).normalized().angle_to())"), [`${FEW("angle_to", 1, 0)} @4`]],
  ["定形数组元素：内型那张表接上后逐格对裁判（S473）", bodySrc("\tvar a: Array[Vector2] = [Vector2(1, 2)]\n\tprint(a[0].angle_to())"), [`${FEW("angle_to", 1, 0)} @5`]],
  ["推断的 var 被重新赋值后不再作证", bodySrc("\tvar v = Vector2(1, 2)\n\tv = 5\n\tprint(v.angle_to())"), []],
  ["表外的名字不猜（Vector2 没有 inverse）", bodySrc("\tvar v: Vector2 = Vector2(1, 2)\n\tprint(v.inverse(0))"), []],
  ["自定义类型的同名方法不猜", "extends SceneTree\n\nclass B:\n\tfunc angle_to():\n\t\treturn 1\n\nfunc _initialize():\n\tvar b = B.new()\n\tprint(b.angle_to())\n\tquit()\n", []],
  ["内部类的方法不预置模块级名字（那一侧引擎怎么判没量过）", "extends SceneTree\n\nvar v: Vector2 = Vector2(1, 2)\n\nclass B:\n\tvar v: int = 1\n\n\tfunc f():\n\t\tprint(v.angle_to())\n\nfunc _initialize():\n\tquit()\n", []],
  ["`self.v` 那一形没量，放过", "extends SceneTree\n\nvar v: Vector2 = Vector2(1, 2)\n\nfunc _initialize():\n\tprint(self.v.angle_to())\n\tquit()\n", []],
  ["按正确元数调全收", bodySrc("\tvar v: Vector2 = Vector2(3, 4)\n\tprint(v.angle_to(v) + v.distance_to(v) + v.lerp(v, 0.5) + v.snapped(v))"), []],
];

let rejected = 0;
let accepted = 0;

describe("analyze · 值类型方法的实参数", () => {
  it.each(CASES)("%s", async (_name, src, expected) => {
    const diags = analyze(lower(await parseSource(src))).diagnostics.filter((d) => d.code === "value-arity");
    const got = diags.map((d) => `${d.message} @${String((d.loc as { line: number }).line)}`);
    expect(got, `源：\n${src}`).toEqual(expected);
    if (expected.length === 0) accepted++;
    else rejected++;
  });

  afterAll(() => {
    console.log(`\n元数表：${String(CASES.length)} 形，拒 ${String(rejected)} 形、收 ${String(accepted)} 形`);
  });
});
