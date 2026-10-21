/** 定形容器槽位的运行期那一族（S618）：源的类型文本与槽的标注必须一字不差，差一个就发引擎那两句。读数 `tmp/probe618/`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, arrayTypeLabel, assignContainer, returnContainer, stampArray, stampClassArray, stampDict } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

const err = (f: () => unknown): string => {
  try {
    f();
    return "没抛";
  } catch (e) {
    return (e as { message?: string }).message ?? "?";
  }
};

describe("容器值自己的类型文本（S618）", () => {
  it("未定型给基名，定型带元素型 / 类名 / 键值型", () => {
    eq("618", "未定型数组", arrayTypeLabel(new GArray()), "Array");
    eq("618", "定型数组", arrayTypeLabel((stampArray(V.array(GArray.of([I(1)])), "int", true).v as GArray)), "Array[int]");
    eq("618", "类名数组", arrayTypeLabel((stampClassArray(V.array(GArray.of([])), "RefCounted", true).v as GArray)), "Array[RefCounted]");
    const d = new GDict();
    eq("618", "定型字典", (stampDict(V.dict(d), "int", "String", true).v as GDict).typeLabel(), "Dictionary[int, String]");
    eq("618", "未定型字典", new GDict().typeLabel(), "Dictionary");
  });
});

describe("赋值位的运行期句子（S618）", () => {
  it("引擎的六形逐字", () => {
    eq("618", "b1 未定型进类名槽", err(() => assignContainer(V.array(new GArray()), "Array[RefCounted]")),
      'Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".');
    eq("618", "c11 定型数组进类名槽", err(() => assignContainer(stampArray(V.array(GArray.of([])), "String", true), "Array[RefCounted]")),
      'Trying to assign an array of type "Array[String]" to a variable of type "Array[RefCounted]".');
    eq("618", "b6 未定型字典进定型槽", err(() => assignContainer(V.dict(new GDict()), "Dictionary[int, String]")),
      'Trying to assign a dictionary of type "Dictionary" to a variable of type "Dictionary[int, String]".');
    eq("618", "c12 定型字典进另一定型槽", err(() => assignContainer(stampDict(V.dict(new GDict()), "String", "int", true), "Dictionary[int, String]")),
      'Trying to assign a dictionary of type "Dictionary[String, int]" to a variable of type "Dictionary[int, String]".');
    eq("618", "b10 未定型数组进 int 槽", err(() => assignContainer(V.array(GArray.of([I(1)])), "Array[int]")),
      'Trying to assign an array of type "Array" to a variable of type "Array[int]".');
    eq("618", "c14 标量源响亮拒", err(() => assignContainer(I(1), "Array[int]")), "定形容器的槽位只实测过 Array 与 Dictionary 源（收到 int）");
  });
  it("同名收下并且是同一支容器（e10 / e11 的别名读数）", () => {
    const a = stampArray(V.array(GArray.of([I(1)])), "int", true);
    const got = assignContainer(a, "Array[int]");
    eq("618", "同一个盒子", got === a, "true");
    const g = a.v as GArray;
    g.set(0, I(9));
    eq("618", "改源看得见", String((got.v as GArray).get(0).v), "9");
    const cls = stampClassArray(V.array(GArray.of([])), "RefCounted", true);
    eq("618", "类名同名收下", err(() => assignContainer(cls, "Array[RefCounted]")), "没抛");
  });
});

describe("返回位的运行期句子（S618）", () => {
  it("数组与字典两句逐字", () => {
    eq("618", "c5 返回未定型数组", err(() => returnContainer(V.array(new GArray()), "Array[String]")),
      'Trying to return an array of type "Array" where expected return type is "Array[String]".');
    eq("618", "c6 返回未定型字典", err(() => returnContainer(V.dict(new GDict()), "Dictionary[int, String]")),
      'Trying to return a dictionary of type "Dictionary" where expected return type is "Dictionary[int, String]".');
    eq("618", "c7 返回进类名槽", err(() => returnContainer(V.array(new GArray()), "Array[Inner]")),
      'Trying to return an array of type "Array" where expected return type is "Array[Inner]".');
    eq("618", "同名收下", err(() => returnContainer(stampArray(V.array(GArray.of([I(1)])), "int", true), "Array[int]")), "没抛");
  });
});
