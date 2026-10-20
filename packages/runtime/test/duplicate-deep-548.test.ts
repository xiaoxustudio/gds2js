/** Array/Dictionary.duplicate_deep（S548）：纯容器各模式都是整棵深拷，读数 `tmp/d6/s548.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { GArray, GDict, show, valueEq } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { I, S } from "./support/variants";

const arr = (xs: Parameters<typeof GArray.of>[0]) => V.array(GArray.of(xs));
const inner = (v: ReturnType<typeof V.array>): GArray => ((v.v as GArray).raw()[0] as ReturnType<typeof V.array>).v as GArray;

describe("duplicate_deep（S548）", () => {
  it("嵌套数组整棵深拷，模式 0/2/3/-1 同一条", () => {
    const a = arr([arr([I(1)]), arr([I(2)])]);
    for (const mode of [undefined, I(0), I(2), I(3), I(-1)]) {
      const b = method(a, "duplicate_deep", mode === undefined ? [] : [mode]);
      const bi = inner(b as ReturnType<typeof V.array>);
      bi.raw()[0] = I(9);
      const ai = inner(a);
      eq("548", `mode ${mode === undefined ? "缺省" : String(mode.v)}`, `${show(ai.raw()[0] as ReturnType<typeof V.int>)}/${show(bi.raw()[0] as ReturnType<typeof V.int>)}`, "1/9");
    }
  });
  it("嵌套字典整棵深拷", () => {
    const mk = () => {
      const innerD = new GDict();
      innerD.set(S("y"), I(1));
      const outer = new GDict();
      outer.set(S("x"), V.dict(innerD));
      return V.dict(outer);
    };
    const d = mk();
    const e = method(d, "duplicate_deep", []);
    (((e.v as GDict).get(S("x")) as ReturnType<typeof V.dict>).v as GDict).set(S("y"), I(2));
    eq("548", "改副本不动原字典", `${show(((d.v as GDict).get(S("x")) as ReturnType<typeof V.dict>))}/${show(((e.v as GDict).get(S("x")) as ReturnType<typeof V.dict>))}`, '{ "y": 1 }/{ "y": 2 }');
  });
  it("平数组内容相等、模式参数非 int 响亮拒", () => {
    const h = arr([I(1), S("x"), V.nil(), V.bool(true)]);
    eq("548", "值与原件相等", String(valueEq(method(h, "duplicate_deep", []), h)), "true");
    let code = "没抛";
    try {
      method(h, "duplicate_deep", [V.float(1)]);
    } catch (e) {
      code = (e as { code?: string }).code ?? "?";
    }
    eq("548", "float 模式拒", code, "duplicate-deep-arg");
  });
});
