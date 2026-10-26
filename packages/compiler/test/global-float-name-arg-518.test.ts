/**
 * 单参 float 数学全局函数的**名字实参**解析期拒（S518）：`tmp/d6/s518b.py` 一百七十六格 = 8 支
 * （`sqrt`/`exp`/`log`/`sin`/`cos`/`tan`/`deg_to_rad`/`rad_to_deg`）× 廿一型（无 null 型可标）模块标注名，读数同名 `.json`。
 * 落地前全局段只按 `literalTypeName` / `nonNumericLiteral` 取实参型（对 ident 恒 null），所以 `sqrt(var w: Color)`
 * 这类整套非数值名实参不解析拒、流到运行期抛中文 `[not-number]` —— 引擎却解析期就发
 * `Invalid argument for "X()" function: argument 1 should be "float" but is "<K>"`。收的集 {bool,int,float}（int/bool 隐式转 float）。
 * 落地：全局门加名字旁路，仅对这张量过的 8 支单参函数在 pos1 用 `argNameType(arg, argAnn)` 解型、非 {bool,int,float} 补第二句；
 * 多参 / 「跟第一参走」/ suppress 那几族（clamp / lerp / wrap …）没量过名字形，照红线不动。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + body;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

const FNS = ["sqrt", "exp", "log", "sin", "cos", "tan", "deg_to_rad", "rad_to_deg"];
const REFUSE = ["String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i",
  "Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedColorArray"];
const ACCEPT = ["bool", "int", "float"];

function forms(fn: string, kind: string): Array<[string, string]> {
  return [
    ["模块标注", `var w: ${kind}\n\nfunc c():\n\tvar r = ${fn}(w)\n`],
    ["局部标注", `func c():\n\tvar w: ${kind}\n\tvar r = ${fn}(w)\n`],
    ["形参标注", `func c(w: ${kind}):\n\tvar r = ${fn}(w)\n`],
  ];
}

describe("float 数学全局函数：名字实参非 {bool,int,float} 时解析期发 should-be-float", () => {
  for (const fn of FNS) {
    for (const kind of REFUSE) {
      for (const [form, body] of forms(fn, kind)) {
        it(`${fn}(${kind}) · ${form}：发句`, async () => {
          eq("518", `${fn}(${kind}) ${form}`, await msgs(body),
            [`Invalid argument for "${fn}()" function: argument 1 should be "float" but is "${kind}".`]);
        });
      }
    }
    for (const kind of ACCEPT) {
      for (const [form, body] of forms(fn, kind)) {
        it(`${fn}(${kind}) · ${form}：收`, async () => {
          eq("518", `${fn}(${kind}) ${form} 不该开口`, await msgs(body), []);
        });
      }
    }
  }
});
