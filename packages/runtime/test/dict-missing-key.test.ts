/**
 * 字典缺键的那两句（S405）：通读那条是 `Invalid access to property or key '<键>' on a base object of type '<基名>'.`，
 * 而**静态标注的字典配 int 键**那条是数组那一式 `Out of bounds get index '<k>' (on base: '<基名>')`（句末没有句点）。
 * 尺 `tmp/probe-dictkey/{round1,round2,round3,round4}.mts`，读数 `compare{75,76,77,78}.txt`，出货端到端对照 `tmp/probe-dictkey/ours.mts`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { dictIndexInt, index, setIndex } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, type ElemKind } from "@gds2js/runtime/runtime/values";
import { nodePathValue } from "@gds2js/runtime/runtime/node-path";
import { vector2 } from "@gds2js/runtime/runtime/class/vector/vector2";

function dict(pairs: Array<[Variant, Variant]>): Variant {
  const d = new GDict();
  for (const [k, v] of pairs) d.set(k, v);
  return V.dict(d);
}

function typedDict(k: ElemKind, v: ElemKind, pairs: Array<[Variant, Variant]> = []): Variant {
  const d = new GDict();
  d.stampElem(k, v);
  for (const [kk, vv] of pairs) d.set(kk, vv);
  return V.dict(d);
}

const msg = (fn: () => unknown): string => {
  try {
    fn();
    return "没抛";
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
};

describe("通读缺键那一句", () => {
  const d = dict([[V.int(1), V.int(2)]]);
  const cases: Array<[string, Variant, string]> = [
    ["int 键", V.int(0), "Invalid access to property or key '0' on a base object of type 'Dictionary'."],
    ["负 int 键", V.int(-5), "Invalid access to property or key '-5' on a base object of type 'Dictionary'."],
    ["大 int 键", V.int(999999999999), "Invalid access to property or key '999999999999' on a base object of type 'Dictionary'."],
    ["float 键", V.float(2), "Invalid access to property or key '2.0' on a base object of type 'Dictionary'."],
    ["String 键", V.str("x"), "Invalid access to property or key 'x' on a base object of type 'Dictionary'."],
    ["bool 键", V.bool(true), "Invalid access to property or key 'true' on a base object of type 'Dictionary'."],
    ["StringName 键", V.stringName("x"), "Invalid access to property or key 'x' on a base object of type 'Dictionary'."],
    ["NodePath 键", nodePathValue("a/b"), "Invalid access to property or key 'a/b' on a base object of type 'Dictionary'."],
    ["Vector2 键", vector2(1, 2), "Invalid access to property or key '(1.0, 2.0)' on a base object of type 'Dictionary'."],
    ["Array 键", V.array(GArray.of([V.int(1), V.int(2)])), "Invalid access to property or key '[1, 2]' on a base object of type 'Dictionary'."],
    ["字典键", dict([[V.str("k"), V.int(1)]]), 'Invalid access to property or key \'{ "k": 1 }\' on a base object of type \'Dictionary\'.'],
  ];
  for (const [label, key, want] of cases) {
    it(label, () => eq("405", label, msg(() => index(d, key)), want));
  }
  it("定形字典的基名带键值型", () => {
    eq("405", "Dictionary[String, int]", msg(() => index(typedDict("String", "int"), V.str("nope"))), "Invalid access to property or key 'nope' on a base object of type 'Dictionary[String, int]'.");
  });
  it("命中的键照旧给值", () => {
    const d = dict([[V.int(1), V.int(2)]]);
    eq("405", "命中 int 键", show(index(d, V.int(1))), "2");
  });
});

describe("静态 int 键那一形", () => {
  it("标注字典 + int 缺键给数组那一式", () => {
    const d = dict([[V.int(1), V.int(2)]]);
    eq("405", "int 缺键", msg(() => dictIndexInt(d, V.int(0))), "Out of bounds get index '0' (on base: 'Dictionary')");
    eq("405", "负 int 缺键", msg(() => dictIndexInt(d, V.int(-5))), "Out of bounds get index '-5' (on base: 'Dictionary')");
    eq("405", "定形 int 键字典", msg(() => dictIndexInt(typedDict("int", "String", [[V.int(1), V.str("x")]]), V.int(7))), "Out of bounds get index '7' (on base: 'Dictionary[int, String]')");
  });
  it("命中就照读，非 int 形状退回通读", () => {
    const d = dict([[V.int(1), V.int(2)]]);
    eq("405", "命中", msg(() => dictIndexInt(d, V.int(1))), "没抛");
    eq("405", "float 键走通读那一句", msg(() => dictIndexInt(d, V.float(2))), "Invalid access to property or key '2.0' on a base object of type 'Dictionary'.");
    eq("405", "String 键走通读那一句", msg(() => dictIndexInt(d, V.str("x"))), "Invalid access to property or key 'x' on a base object of type 'Dictionary'.");
  });
  it("写不缺：标注字典的 int 写就是建键", () => {
    const d = dict([[V.int(1), V.int(2)]]);
    setIndex(d, V.int(0), V.int(5));
    eq("405", "写完读回来", msg(() => index(d, V.int(0))), "没抛");
  });
});
