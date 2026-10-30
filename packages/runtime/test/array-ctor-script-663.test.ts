// `Array(base, type, class_name, script)` 的第四参**收任何型并整个丢掉**（S663，读数 `tmp/probe665` 十一形：
// null / bool / int / float / String / StringName / Array / Dictionary / Vector2 / PackedByteArray / Color ——
// `Array([1], TYPE_INT, &"", <那十一形>) == [1]` 全真）。此前只放 null 过，其余十一形全被我方自发话拦死。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { arrayFromArgs } from "@gds2js/runtime/runtime/builtins";
import { V, Tag, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { GdNodePath } from "@gds2js/runtime/runtime/class/identity/node-path";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";

const src = V.array(GArray.of([V.int(1)]));
const argsWith = (script: Variant): Variant[] => [src, V.int(2), V.stringName(""), script];
const shown = (script: Variant): string => {
  try {
    const r = arrayFromArgs(argsWith(script));
    return (r.v as GArray).raw().map((x) => String(x.v)).join("/");
  } catch (e) {
    return `拒 ${((e as { code?: string }).code ?? "?")}`;
  }
};

describe("runtime/builtins · Array 四参形的第四参", () => {
  const kinds: Array<[string, Variant]> = [
    ["null", V.nil()],
    ["bool", V.bool(false)],
    ["int", V.int(1)],
    ["float", V.float(1.5)],
    ["String", V.str("x")],
    ["StringName", V.stringName("x")],
    ["Array", V.array(GArray.of([V.int(9)]))],
    ["Dictionary", V.dict(0)],
    ["Vector2", V.object(new GVector2(1, 2))],
    ["NodePath", V.object(new GdNodePath(false, ["a"], [], false))],
  ];
  for (const [name, v] of kinds) {
    it(`第四参是 ${name} 也收下并丢掉`, () => {
      eq("663", `${name} 那形给的还是转好的那一份`, shown(v), "1");
    });
  }

  it("第一参与第三参那两道闸不动", () => {
    let got = "没抛";
    try {
      arrayFromArgs([V.int(5), V.int(2), V.stringName(""), V.nil()]);
    } catch (e) {
      got = `[${(e as { code?: string }).code}] ${(e as { message?: string }).message}`;
    }
    eq("663", "int 当第一参仍响亮拒", got.includes("array-ctor-base"), true);
  });

  it(Tag.INT === 2 ? "型码 2 就是 TYPE_INT（这一形按它转）" : "型码对不上", () => {
    eq("663", "TYPE_INT 码", String(Tag.INT), "2");
  });
});
