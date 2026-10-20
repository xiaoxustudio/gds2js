/** Array / Dictionary 的定型查询（S554），读数 `tmp/d6/s554*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show, type ElemKind } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";

const arr = (k: ElemKind | null) => {
  const a = new GArray();
  if (k !== null) a.stampElem(k);
  return V.array(a);
};
const dict = (k: ElemKind | null, v: ElemKind | null) => {
  const d = new GDict();
  d.keyKind = k;
  d.valKind = v;
  return V.dict(d);
};

describe("Array 的定型查询（S554）", () => {
  it("is_typed / builtin / class_name / script", () => {
    const a = arr("int");
    eq("554", "int 定型", `${String(method(a, "is_typed", []).v)}/${String(method(a, "get_typed_builtin", []).v)}`, "true/2");
    eq("554", "class_name 是 StringName 空串", `[${String(method(a, "get_typed_class_name", []).v)}]/${String(typeOf(method(a, "get_typed_class_name", [])).v)}`, "[]/21");
    eq("554", "script 是 <Object#null>", `${show(method(a, "get_typed_script", []))}/${String(typeOf(method(a, "get_typed_script", [])).v)}`, "<Object#null>/24");
    eq("554", "float / 未定型", `${String(method(arr("float"), "get_typed_builtin", []).v)}/${String(method(arr(null), "is_typed", []).v)}/${String(method(arr(null), "get_typed_builtin", []).v)}`, "3/false/0");
  });
  it("is_same_typed 四种组合", () => {
    eq("554", "typed/typed、int/float、int/未定型、未定型/未定型",
      [
        method(arr("int"), "is_same_typed", [arr("int")]),
        method(arr("int"), "is_same_typed", [arr("float")]),
        method(arr("int"), "is_same_typed", [arr(null)]),
        method(arr(null), "is_same_typed", [arr(null)]),
      ].map((x) => String(x.v)).join("/"),
      "true/false/false/true");
  });
});

describe("Dictionary 的定型查询（S554）", () => {
  it("is_typed 是「键或值任一定型」；两侧各自报", () => {
    const full = dict("String", "int");
    eq("554", "全定型三格", `${String(method(full, "is_typed", []).v)}/${String(method(full, "is_typed_key", []).v)}/${String(method(full, "is_typed_value", []).v)}`, "true/true/true");
    const kOnly = dict("String", null);
    eq("554", "只键定型", `${String(method(kOnly, "is_typed", []).v)}/${String(method(kOnly, "is_typed_key", []).v)}/${String(method(kOnly, "is_typed_value", []).v)}`, "true/true/false");
    const vOnly = dict(null, "int");
    eq("554", "只值定型", `${String(method(vOnly, "is_typed", []).v)}/${String(method(vOnly, "is_typed_key", []).v)}/${String(method(vOnly, "is_typed_value", []).v)}`, "true/false/true");
    const none = dict(null, null);
    eq("554", "未定型", `${String(method(none, "is_typed", []).v)}/${String(method(none, "get_typed_key_builtin", []).v)}`, "false/0");
  });
  it("builtin 码、class_name / script", () => {
    const full = dict("String", "int");
    eq("554", "builtin 4/2", `${String(method(full, "get_typed_key_builtin", []).v)}/${String(method(full, "get_typed_value_builtin", []).v)}`, "4/2");
    const kOnly = dict("String", null);
    eq("554", "半定型 4/0", `${String(method(kOnly, "get_typed_key_builtin", []).v)}/${String(method(kOnly, "get_typed_value_builtin", []).v)}`, "4/0");
    const vOnly = dict(null, "int");
    eq("554", "半定型 0/2", `${String(method(vOnly, "get_typed_key_builtin", []).v)}/${String(method(vOnly, "get_typed_value_builtin", []).v)}`, "0/2");
    eq("554", "class_name / script", `${String(method(full, "get_typed_key_class_name", []).v)}|${show(method(full, "get_typed_value_script", []))}`, "|<Object#null>");
  });
  it("is_same_typed 三支", () => {
    const full = dict("String", "int");
    const full2 = dict("String", "int");
    const kOnly = dict("String", null);
    const vOnly = dict(null, "int");
    eq("554", "全同", `${String(method(full, "is_same_typed", [full2]).v)}/${String(method(full, "is_same_typed_key", [full2]).v)}/${String(method(full, "is_same_typed_value", [full2]).v)}`, "true/true/true");
    eq("554", "半定型互比", `${String(method(kOnly, "is_same_typed", [vOnly]).v)}/${String(method(kOnly, "is_same_typed_key", [vOnly]).v)}/${String(method(kOnly, "is_same_typed_value", [vOnly]).v)}`, "false/false/false");
    const none1 = dict(null, null);
    const none2 = dict(null, null);
    eq("554", "未定型互比", String(method(none1, "is_same_typed", [none2]).v), "true");
  });
});
