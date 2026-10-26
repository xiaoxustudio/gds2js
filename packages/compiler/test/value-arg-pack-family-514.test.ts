/**
 * 值型面形参拒碰上**名字实参是 pack**（S514）：`tmp/d6/s514.py` 七百九十二格 = 九种 `want` 型各取一支实例法
 * （float/int/bool/String/Color/Vector2/Vector2i/Vector3/Vector3i）× 廿二型 × 四种名字（模块标注 / 局部标注 /
 * 形参标注 / 内部类字段），读数同名 `.json` / `.txt`。落地前 `INSTANCE_ARG_TYPES` 里 147 个「refuse 只到
 * `PackedByteArray`」的子行对同组另八支 pack 整族放过 —— 引擎句句发 `Invalid argument for "M()" function:
 * argument N should be "W" but is "<pack>"`（名字来的不发 AS 那一句，四种名字一字一样）。
 * 判据：收/拒集只由 `want` 型决定，八支 pack 对九种 want 无一被放行，故 `tmp/d6/fixpack.py` 把这批子行的 refuse
 * 一律补成全九支 pack。复量 792 格 0 分歧、pnpm test / compile 分桶 / diff 一律不动。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function msgs(body: string): Promise<string[]> {
  const src = "extends SceneTree\n\n" + body;
  return analyze(lower(await parseSource(src))).diagnostics.map((d) => d.message).sort();
}

// S513 落地的八支非-Bytes pack（PackedByteArray 早在表里，是本轮的对照）。
const PACKS = ["PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"];

type Slot = { recv: string; meth: string; want: string; accept: string[] };
// 九种 want 型各一支单参实例法（`v.meth(w)`，w 坐第 1 位）。
const SLOTS: Slot[] = [
  { recv: "Vector2", meth: "rotated", want: "float", accept: ["bool", "float", "int"] },
  { recv: "Vector2i", meth: "maxi", want: "int", accept: ["bool", "float", "int"] },
  { recv: "Color", meth: "to_html", want: "bool", accept: ["bool", "float", "int"] },
  { recv: "Color", meth: "html", want: "String", accept: ["String", "StringName", "NodePath"] },
  { recv: "Color", meth: "blend", want: "Color", accept: ["Color", "String", "int"] },
  { recv: "Vector2", meth: "dot", want: "Vector2", accept: ["Vector2", "Vector2i"] },
  { recv: "Vector2i", meth: "max", want: "Vector2i", accept: ["Vector2", "Vector2i"] },
  { recv: "Vector3", meth: "dot", want: "Vector3", accept: ["Vector3", "Vector3i"] },
  { recv: "Vector3i", meth: "max", want: "Vector3i", accept: ["Vector3", "Vector3i"] },
];

function forms(s: Slot, src: string): Array<[string, string]> {
  const call = `\tv.${s.meth}(w)`;
  return [
    ["模块标注", `var w: ${src}\n\nfunc c(v: ${s.recv}):\n${call}\n`],
    ["局部标注", `func c(v: ${s.recv}):\n\tvar w: ${src}\n${call}\n`],
    ["形参标注", `func c(v: ${s.recv}, w: ${src}):\n${call}\n`],
    ["内部类字段", `class Q:\n\tvar v: ${s.recv}\n\tvar w: ${src}\n\n\tfunc f():\n\t\tv.${s.meth}(w)\n\nfunc c():\n\tQ.new().f()\n`],
  ];
}

const sent = (s: Slot, src: string): string =>
  `Invalid argument for "${s.meth}()" function: argument 1 should be "${s.want}" but is "${src}".`;

describe("值型面九种 want 型：名字实参是八支 pack 时照引擎发第二句", () => {
  for (const s of SLOTS) {
    for (const src of PACKS) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth}(${src}) · ${form}：发句`, async () => {
          eq("514", `${s.recv}.${s.meth}(${src}) ${form}`, await msgs(body), [sent(s, src)]);
        });
      }
    }
    for (const src of s.accept) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth}(${src}) · ${form}：收`, async () => {
          eq("514", `${s.recv}.${s.meth}(${src}) ${form} 不该开口`, await msgs(body), []);
        });
      }
    }
  }
});
