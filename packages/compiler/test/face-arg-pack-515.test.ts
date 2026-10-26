/**
 * 容器 / String 面的形参拒碰上**名字实参是 pack**（S515，承接 S514 把同款缺口推到 `FACE_ARG_TYPES`）：
 * `tmp/d6/s515.py` 四百四十格（String.count/Array.duplicate/Dictionary.duplicate/Array.remove_at 位）+
 * `tmp/d6/s515b.py` 二百六十四格（String.num float 位 / Array.all Callable 位 / Dictionary.assign Dictionary 位），
 * 各 × 廿二型 × 四种名字，读数同名 `.json` / `.txt`。落地前 `FACE_ARG_TYPES` 里 **137 个 refuse 子表**含
 * `PackedByteArray` 却缺其余八支 pack，那八支当名字实参整族放过 —— 引擎逐 want 型句句发第二句、accept 集不含任何 pack、
 * 非-pack 分歧全空、过拦 0。`tmp/d6/fixface.py` 把这些子表一律补成全九支 pack（只加拒项、不动模板与 AS 表）。
 * 复量两把尺 **0 分歧 / 0 放过 / 0 过拦**。
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

const PACKS = ["PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray"];

type Slot = { recv: string; meth: string; want: string; accept: string[] };
const SLOTS: Slot[] = [
  { recv: "String", meth: "count", want: "String", accept: ["String", "StringName", "NodePath"] },
  { recv: "String", meth: "num", want: "float", accept: ["bool", "float", "int"] },
  { recv: "Array", meth: "duplicate", want: "bool", accept: ["bool", "float", "int"] },
  { recv: "Dictionary", meth: "duplicate", want: "bool", accept: ["bool", "float", "int"] },
  { recv: "Array", meth: "remove_at", want: "int", accept: ["bool", "float", "int"] },
  { recv: "Array", meth: "all", want: "Callable", accept: [] },
  { recv: "Dictionary", meth: "assign", want: "Dictionary", accept: ["Dictionary"] },
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

describe("容器/String 面名字实参是 pack 时照引擎发第二句（S515）", () => {
  for (const s of SLOTS) {
    for (const src of PACKS) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth}(${src}) · ${form}：发句`, async () => {
          eq("515", `${s.recv}.${s.meth}(${src}) ${form}`, await msgs(body), [sent(s, src)]);
        });
      }
    }
    for (const src of s.accept) {
      for (const [form, body] of forms(s, src)) {
        it(`${s.recv}.${s.meth}(${src}) · ${form}：收`, async () => {
          eq("515", `${s.recv}.${s.meth}(${src}) ${form} 不该开口`, await msgs(body), []);
        });
      }
    }
  }
});
