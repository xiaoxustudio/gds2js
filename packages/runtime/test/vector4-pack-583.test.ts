/** PackedVector4Array（S582），读数 `tmp/d6/s583.gd` / `s584.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes, packCtor } from "@gds2js/runtime/runtime/class/bytes/packed";
import { GArray, show, varToStr, valueEq } from "@gds2js/runtime/runtime/values";
import { typeOf } from "@gds2js/runtime/runtime/patterns";
import { variantHashNumber } from "@gds2js/runtime/runtime/builtins";
import { vector4New } from "@gds2js/runtime/runtime/class/vector/vector4";
import { vector4iNew } from "@gds2js/runtime/runtime/class/vector/vector4i";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I } from "./support/variants";

const v4 = (x: number, y: number, z: number, w: number): Variant => vector4New([I(x), I(y), I(z), I(w)]);
const pack = (...items: Variant[]): Variant => packCtor("vector4", [V.array(GArray.of(items))]);
const call = (r: Variant, n: string, args: Variant[] = []): Variant => method(r, n, args) as Variant;
const sh = (r: Variant, n: string, args: Variant[] = []): string => show(call(r, n, args));

describe("PackedVector4Array 基础（S582）", () => {
  it("typeof / 打印 / var_to_str / hash / 等式", () => {
    const p = pack(v4(1, 2, 3, 4), v4(5, 6, 7, 8));
    eq("582", "typeof", typeOf(p).v, 38);
    eq("582", "show", show(p), "[(1.0, 2.0, 3.0, 4.0), (5.0, 6.0, 7.0, 8.0)]");
    eq("582", "vts", varToStr(p), "PackedVector4Array(1, 2, 3, 4, 5, 6, 7, 8)");
    eq("582", "hash", variantHashNumber(p), 1689136173);
    eq("582", "eq", valueEq(p, pack(v4(1, 2, 3, 4), v4(5, 6, 7, 8))), true);
    eq("582", "empty", show(packCtor("vector4", [])), "[]");
  });
  it("size / get / 下标 / push / append / insert / set / fill / resize", () => {
    const p = pack(v4(1, 2, 3, 4), v4(5, 6, 7, 8));
    eq("582", "size/get", `${call(p, "size").v}|${sh(p, "get", [I(1)])}`, "2|(5.0, 6.0, 7.0, 8.0)");
    const q = packCtor("vector4", []);
    call(q, "push_back", [v4(1, 2, 3, 4)]);
    call(q, "append", [v4(5, 6, 7, 8)]);
    call(q, "insert", [I(1), v4(9, 9, 9, 9)]);
    eq("582", "mut", show(q), "[(1.0, 2.0, 3.0, 4.0), (9.0, 9.0, 9.0, 9.0), (5.0, 6.0, 7.0, 8.0)]");
    call(q, "set", [I(0), v4(7, 7, 7, 7)]);
    call(q, "fill", [v4(2, 3, 4, 5)]);
    eq("582", "fill", `${show(q)}|${call(q, "size").v}`, "[(2.0, 3.0, 4.0, 5.0), (2.0, 3.0, 4.0, 5.0), (2.0, 3.0, 4.0, 5.0)]|3");
    call(q, "resize", [I(2)]);
    call(q, "resize", [I(3)]);
    eq("582", "resize", show(q), "[(2.0, 3.0, 4.0, 5.0), (2.0, 3.0, 4.0, 5.0), (0.0, 0.0, 0.0, 0.0)]");
    eq("582", "has/find/count", `${call(q, "has", [v4(2, 3, 4, 5)]).v}|${call(q, "find", [v4(2, 3, 4, 5)]).v}|${call(q, "count", [v4(2, 3, 4, 5)]).v}`, "true|0|2");
  });
  it("Vector4i 可塞入；int / String 按引擎句拒", () => {
    const p = packCtor("vector4", []);
    call(p, "push_back", [vector4iNew([I(1), I(2), I(3), I(4)])]);
    eq("582", "v4i", show(p), "[(1.0, 2.0, 3.0, 4.0)]");
    let msg = "";
    try {
      call(p, "push_back", [I(1)]);
    } catch (e) {
      msg = (e as { message?: string }).message ?? "";
    }
    eq("582", "int 拒", msg, "Invalid type in function 'push_back' in base 'PackedVector4Array'. Cannot convert argument 1 from int to Vector4.");
  });
});

describe("PackedVector4Array 排序 / 切片 / 字节（S582）", () => {
  it("sort / bsearch / slice / reverse / erase / rfind", () => {
    const p = pack(v4(3, 4, 1, 2), v4(1, 2, 3, 4), v4(1, 2, 3, 5), v4(0, 9, 9, 9));
    call(p, "sort");
    eq("582", "sort", show(p), "[(0.0, 9.0, 9.0, 9.0), (1.0, 2.0, 3.0, 4.0), (1.0, 2.0, 3.0, 5.0), (3.0, 4.0, 1.0, 2.0)]");
    eq("582", "bsearch", `${call(p, "bsearch", [v4(1, 2, 3, 4)]).v}|${call(p, "bsearch", [v4(2, 0, 0, 0)]).v}`, "1|3");
    eq("582", "slice", show(call(p, "slice", [I(1), I(3)])), "[(1.0, 2.0, 3.0, 4.0), (1.0, 2.0, 3.0, 5.0)]");
    const d = call(p, "duplicate");
    call(d, "reverse");
    eq("582", "reverse", show(d), "[(3.0, 4.0, 1.0, 2.0), (1.0, 2.0, 3.0, 5.0), (1.0, 2.0, 3.0, 4.0), (0.0, 9.0, 9.0, 9.0)]");
    eq("582", "erase/rfind", `${call(call(p, "duplicate"), "erase", [v4(1, 2, 3, 5)]).v}|${call(p, "rfind", [v4(1, 2, 3, 4)]).v}`, "true|1");
  });
  it("to_byte_array 16 字节/元素，反解同值", () => {
    const p = pack(v4(1, 2, 3, 4), v4(5, 6, 7, 8));
    const b = call(p, "to_byte_array") as Variant;
    eq("582", "bytes", `${(b.v as GBytes).length}|${show(b)}`, "32|[0, 0, 128, 63, 0, 0, 0, 64, 0, 0, 64, 64, 0, 0, 128, 64, 0, 0, 160, 64, 0, 0, 192, 64, 0, 0, 224, 64, 0, 0, 0, 65]");
    eq("582", "from", show(call(b, "to_vector4_array")), "[(1.0, 2.0, 3.0, 4.0), (5.0, 6.0, 7.0, 8.0)]");
  });
});
