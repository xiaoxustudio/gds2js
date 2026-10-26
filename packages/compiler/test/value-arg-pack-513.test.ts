/**
 * 值型 `distance_to` / `Color.lerp` 第 2 位碰上**名字实参是 pack**（S513）：`tmp/d6/s513.py` 二百六十四格
 * = `Vector2i.distance_to` 第 1 位 / `Vector3i.distance_to` 第 1 位 / `Color.lerp` 第 2 位 × 廿二型 ×
 * 四种名字（模块标注 / 局部标注 / 形参标注 / 内部类字段），读数同名 `.json` / `.txt`。
 * 落地前这三档只拒 `Array` / `Dictionary` / `PackedByteArray`，`PackedByteArray` 以外的八支 pack 整族放过（引擎句句发
 * `Invalid argument for "M()" function: argument N should be "W" but is "X".`）；按 `Color.lerp` 第 1 位那张已量齐的
 * pack 名单同序补齐后，二百六十四格分歧 0、放过 0、过拦 0。四种名字写的句子一字一样（名字来的不发 AS 那一句）。
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

const PACKS = ["PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array",
  "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"];

/** 一个位子的规格：接收者型、方法名、位序、该位的实参写法（`w` 坐在第几位）、引擎期望型。 */
type Slot = { recv: string; meth: string; args: string; pos: number; want: string; accept: string[] };
const SLOTS: Slot[] = [
  { recv: "Vector2i", meth: "distance_to", args: "w", pos: 1, want: "Vector2i", accept: ["Vector2", "Vector2i"] },
  { recv: "Vector3i", meth: "distance_to", args: "w", pos: 1, want: "Vector3i", accept: ["Vector3", "Vector3i"] },
  { recv: "Color", meth: "lerp", args: "Color(1, 0, 0), w", pos: 2, want: "float", accept: ["bool", "float", "int"] },
];

/** 四种名字实参写法（S493 / S494 / S496 同一条判据）。 */
function forms(s: Slot, src: string): Array<[string, string]> {
  const call = `\tv.${s.meth}(${s.args})`;
  return [
    ["模块标注", `var w: ${src}\n\nfunc c(v: ${s.recv}):\n${call}\n`],
    ["局部标注", `func c(v: ${s.recv}):\n\tvar w: ${src}\n${call}\n`],
    ["形参标注", `func c(v: ${s.recv}, w: ${src}):\n${call}\n`],
    ["内部类字段", `class Q:\n\tvar v: ${s.recv}\n\tvar w: ${src}\n\n\tfunc f():\n\t\tv.${s.meth}(${s.args})\n\nfunc c():\n\tQ.new().f()\n`],
  ];
}

const sent = (s: Slot, src: string): string =>
  `Invalid argument for "${s.meth}()" function: argument ${s.pos} should be "${s.want}" but is "${src}".`;

describe("值型 distance_to 与 Color.lerp 第 2 位：名字实参是 pack 时照引擎发第二句", () => {
  for (const s of SLOTS) {
    for (const src of [...PACKS, "Array", "Dictionary", "String"]) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth} 第 ${s.pos} 位 · ${form} · ${src} 名：发句`, async () => {
          eq("513", `${s.recv}.${s.meth}(${src}) ${form}`, await msgs(body), [sent(s, src)]);
        });
      }
    }
    for (const src of s.accept) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth} 第 ${s.pos} 位 · ${form} · ${src} 名：收（引擎放行）`, async () => {
          eq("513", `${s.recv}.${s.meth}(${src}) ${form} 不该开口`, await msgs(body), []);
        });
      }
    }
  }
});
