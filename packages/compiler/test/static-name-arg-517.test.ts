/**
 * 静态名调用配**名字实参**（S517，补上 S516 刻意留着的名字形）：`tmp/d6/s517.py` 一百三十二格（六 want 型各一支静态位
 * × 廿一型模块标注名）+ `tmp/d6/s517b.py` 四形复验，读数同名 `.json`。落地前静态段实参取型只走 `literalTypeName`
 * （analyze.ts，对 ident 恒 null），所以 `Color.hex(var w: Color)` 这类整套 kind 全放过 —— 引擎对每个 want 型
 * 「除 accept 外全部 kind」只发第二句 `Invalid argument for "M()" function: argument N should be "W" but is "K".`
 * （`Cannot pass…` 那一句不跟名字走，与 S495/S503 一路同口径），accept 集与 S516/S514 同构。
 * 落地：静态块加名字旁路，用 `argNameType(arg, argAnn)` 解析已量过的标注型，落在该位 `STATIC_ARG_AS ∪ STATIC_ARG_TYPES`
 * refuse 并集里就补第二句；字面量路不动，二者对 ident / literal 互斥不重复发。
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

type Slot = { call: string; pos: number; want: string; accept: string[]; refuse: string[] };
// 六 want 型各一支静态位；refuse 只列本轮量过的代表 kind（含 pack），accept 是与 S516 同构的放行集。
const SLOTS: Slot[] = [
  { call: "Color.hex(w)", pos: 1, want: "int", accept: ["bool", "int"], refuse: ["Color", "Array", "PackedInt32Array", "PackedColorArray", "String"] },
  { call: "Color.html(w)", pos: 1, want: "String", accept: ["String", "StringName", "NodePath"], refuse: ["Color", "int", "PackedByteArray", "Dictionary"] },
  { call: "String.num_scientific(w)", pos: 1, want: "float", accept: ["float", "int"], refuse: ["Vector2", "PackedInt32Array", "Array"] },
  { call: "Color.from_string(\"a\", w)", pos: 2, want: "Color", accept: ["Color"], refuse: ["StringName", "Vector3", "PackedInt64Array"] },
  { call: "Vector3.octahedron_decode(w)", pos: 1, want: "Vector2", accept: ["Vector2", "Vector2i"], refuse: ["Color", "PackedByteArray", "bool"] },
  { call: "String.num_int64(1, 2, w)", pos: 3, want: "bool", accept: ["bool", "int"], refuse: ["String", "PackedInt32Array", "Dictionary"] },
  // 多位静态名字实参（S520 逐位量过：from_rgba8 pos2 int、from_hsv pos4 float）
  { call: "Color.from_rgba8(1, w, 1, 1)", pos: 2, want: "int", accept: ["int"], refuse: ["Color", "Array", "PackedInt32Array", "String"] },
  { call: "Color.from_hsv(0.5, 0.5, 0.5, w)", pos: 4, want: "float", accept: ["float"], refuse: ["Color", "Dictionary", "PackedColorArray", "Vector2"] },
];

/** 四种名字实参写法（同 S513 / S514 / S515 口径）。 */
function forms(s: Slot, kind: string): Array<[string, string]> {
  return [
    ["模块标注", `var w: ${kind}\n\nfunc c():\n\t${s.call}\n`],
    ["局部标注", `func c():\n\tvar w: ${kind}\n\t${s.call}\n`],
    ["形参标注", `func c(w: ${kind}):\n\t${s.call}\n`],
    ["内部类字段", `class Q:\n\tvar w: ${kind}\n\n\tfunc f():\n\t\t${s.call}\n\nfunc c():\n\tQ.new().f()\n`],
  ];
}

const second = (meth: string, pos: number, want: string, kind: string): string[] => {
  const m = (meth.split(".")[1] ?? "").split("(")[0];
  return [`Invalid argument for "${m}()" function: argument ${pos} should be "${want}" but is "${kind}".`];
};
const methName = (s: Slot): string => s.call.slice(0, s.call.indexOf("("));

describe("静态名调用：名字实参按 want 型逐格对齐引擎第二句（S517）", () => {
  for (const s of SLOTS) {
    for (const kind of s.refuse) {
      for (const [form, body] of forms(s, kind)) {
        it(`${methName(s)} 第 ${s.pos} 位 · ${form} · ${kind} 名：只补第二句`, async () => {
          eq("517", `${methName(s)}(${kind}) ${form}`, await msgs(body), second(methName(s), s.pos, s.want, kind));
        });
      }
    }
    for (const kind of s.accept) {
      for (const [form, body] of forms(s, kind)) {
        it(`${methName(s)} 第 ${s.pos} 位 · ${form} · ${kind} 名：收`, async () => {
          eq("517", `${methName(s)}(${kind}) ${form} 不该开口`, await msgs(body), []);
        });
      }
    }
  }
});
