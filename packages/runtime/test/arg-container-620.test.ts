/** 定形容器实参位的运行期两句（S620），读数 `tmp/probe619/`（k1..k13）与 `tmp/probe618/`（c1..c16）。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { paramContainer } from "@gds2js/runtime/runtime/slots";
import { registerClass, registerNativeBase, registerScriptLabel } from "@gds2js/runtime/runtime/class/object/script-object";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, stampArray, stampClassArray, stampDict } from "@gds2js/runtime/runtime/values";

class Kid620 {}
const dKid = registerClass("Kid620", Kid620, () => new Kid620(), (o) => o instanceof Kid620);
registerNativeBase(dKid, "RefCounted");
registerScriptLabel(dKid, "Kid");
const self = new Kid620();

const err = (v: Variant, target: string, i: number, fn: string): string => {
  try {
    paramContainer(v, target, i, fn, self);
    return "没抛";
  } catch (e) {
    return String((e as Error).message);
  }
};

describe("runtime/slots · 定形容器的实参位（S620）", () => {
  it("引擎的五形逐字", () => {
    eq("620", "k1 未定型数组", err(V.array(new GArray()), "Array[RefCounted]", 1, "takes"),
      "Invalid type in function 'takes' in base 'RefCounted (Kid)'. The array of argument 1 (Array) does not have the same element type as the expected typed array argument.");
    eq("620", "c10 定型数组进类名槽", err(stampArray(V.array(GArray.of([])), "String", true), "Array[RefCounted]", 1, "takes1"),
      "Invalid type in function 'takes1' in base 'RefCounted (Kid)'. The array of argument 1 (Array[String]) does not have the same element type as the expected typed array argument.");
    eq("620", "c14 int 源进 float 槽", err(stampArray(V.array(GArray.of([])), "int", true), "Array[float]", 1, "takes4"),
      "Invalid type in function 'takes4' in base 'RefCounted (Kid)'. The array of argument 1 (Array[int]) does not have the same element type as the expected typed array argument.");
    eq("620", "k8 未定型字典", err(V.dict(new GDict()), "Dictionary[int, String]", 1, "takes"),
      "Invalid type in function 'takes' in base 'RefCounted (Kid)'. The dictionary of argument 1 (Dictionary) does not have the same element type as the expected typed dictionary argument.");
    eq("620", "c16 定型字典进另一定型槽", err(stampDict(V.dict(new GDict()), "int", "String", true), "Dictionary[String, String]", 2, "takes5"),
      "Invalid type in function 'takes5' in base 'RefCounted (Kid)'. The dictionary of argument 2 (Dictionary[int, String]) does not have the same element type as the expected typed dictionary argument.");
  });
  it("同型与类名同型都收下（c15 / d5）", () => {
    const a = stampArray(V.array(GArray.of([])), "int", true);
    eq("620", "Array[int] 进 Array[int]", err(a, "Array[int]", 1, "takes3"), "没抛");
    const cls = stampClassArray(V.array(GArray.of([])), "RefCounted", true);
    eq("620", "类名同型进同型槽", err(cls, "Array[RefCounted]", 1, "takes"), "没抛");
    const d = stampDict(V.dict(new GDict()), "int", "String", true);
    eq("620", "字典同型", err(d, "Dictionary[int, String]", 1, "takes"), "没抛");
  });
  it("非容器源响亮拒（没量过的形）", () => {
    eq("620", "int 源", err(V.int(1), "Array[int]", 1, "takes"), "定形容器的实参位只实测过 Array 与 Dictionary 源（收到 int）");
  });
});
