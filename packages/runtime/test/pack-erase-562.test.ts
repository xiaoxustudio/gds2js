/** 九支 pack 的 `erase(value)`（S562），读数 `tmp/d6/s562p*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/class/vector/vector2";
import { GVector3 } from "@gds2js/runtime/runtime/class/vector/vector3";
import { GColor } from "@gds2js/runtime/runtime/class/color/color";
import { I, S } from "./support/variants";

const p = (kind: string, items: unknown[]) => V.object(new GBytes(items as never[], kind as never));

describe("Packed*Array.erase（S562）", () => {
  it("删第一处命中并返回 true；未命中 false；实参按元素槽折算", () => {
    const a = p("int32", [1, 2, 1, 3]);
    eq("562", "int32 删首个 1", `${String(method(a, "erase", [I(1)]).v)}|${show(a)}`, "true|[2, 1, 3]");
    eq("562", "未命中", String(method(a, "erase", [I(9)]).v), "false");
    eq("562", "float 1.0 折成 int 1", `${String(method(a, "erase", [V.float(1)]).v)}|${show(a)}`, "true|[2, 3]");
    const e = p("int32", [1, 2, 1]);
    eq("562", "float 1.9 向零截断", `${String(method(e, "erase", [V.float(1.9)]).v)}|${show(e)}`, "true|[2, 1]");
  });
  it("byte 回绕、bool 折算", () => {
    const c = p("byte", [1, 2]);
    eq("562", "258 → 2", `${String(method(c, "erase", [I(258)]).v)}|${show(c)}`, "true|[1]");
    eq("562", "true → 1", `${String(method(c, "erase", [V.bool(true)]).v)}|${show(c)}`, "true|[]");
  });
  it("float32 / string / int64 / 向量 / 颜色", () => {
    const f = p("float32", [1.5, 2.5]);
    eq("562", "float32 2.5", `${String(method(f, "erase", [V.float(2.5)]).v)}|${show(f)}`, "true|[1.5]");
    eq("562", "float32 int 1 不命中", String(method(f, "erase", [I(1)]).v), "false");
    const d = p("string", ["a", "b"]);
    eq("562", "string a", `${String(method(d, "erase", [S("a")]).v)}|${show(d)}`, "true|[\"b\"]");
    eq("562", "string z 不命中", String(method(d, "erase", [S("z")]).v), "false");
    const g = p("int64", [5n, 6n]);
    eq("562", "int64 6", `${String(method(g, "erase", [I(6)]).v)}|${show(g)}`, "true|[5]");
    const v2 = p("vector2", [new GVector2(1, 2), new GVector2(3, 4)]);
    eq("562", "vector2 按分量", `${String(method(v2, "erase", [V.object(new GVector2(3, 4))]).v)}|${show(v2)}`, "true|[(1.0, 2.0)]");
    const v3 = p("vector3", [new GVector3(1, 2, 3)]);
    eq("562", "vector3", `${String(method(v3, "erase", [V.object(new GVector3(1, 2, 3))]).v)}|${show(v3)}`, "true|[]");
    const col = p("color", [new GColor(1, 0, 0, 1)]);
    eq("562", "color", String(method(col, "erase", [V.object(new GColor(1, 0, 0, 1))]).v), "true");
    const z = p("int32", []);
    eq("562", "空 pack 未命中", String(method(z, "erase", [I(1)]).v), "false");
  });
});
