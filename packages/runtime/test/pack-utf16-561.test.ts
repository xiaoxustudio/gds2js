/** PackedByteArray.get_string_from_utf16 / get_string_from_wchar（S561，Windows wchar = UTF-16），读数 `tmp/d6/s564*.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { V } from "@gds2js/runtime/runtime/tags";

const pb = (xs: number[]) => V.object(new GBytes(xs, "byte"));
const text = (xs: number[], name = "get_string_from_utf16"): string => String(method(pb(xs), name, []).v);
const cps = (s: string): string => Array.from(s).map((c) => (c.codePointAt(0) as number).toString()).join(",");

describe("PackedByteArray UTF-16 / wchar（S561）", () => {
  it("小端、代理对、孤立高位保留、尾巴不足 2 字节丢", () => {
    eq("561", "AB", text([0x41, 0, 0x42, 0]), "AB");
    eq("561", "wchar 同 utf16", text([0x41, 0, 0x42, 0], "get_string_from_wchar"), "AB");
    eq("561", "代理对", cps(text([0x3d, 0xd8, 0x00, 0xde])), "128512");
    eq("561", "孤立高位在末尾", cps(text([0x41, 0, 0x3d, 0xd8])), "65,55357");
    eq("561", "奇数尾巴", text([0x41, 0, 0x42]), "A");
    eq("561", "空", text([]), "");
  });
  it("BOM 决定字节序且不进食", () => {
    eq("561", "LE BOM", text([0xff, 0xfe, 0x41, 0]), "A");
    eq("561", "BE BOM", text([0xfe, 0xff, 0x00, 0x41]), "A");
  });
  it("高位代理后跟非低位：引擎怪值没逆出来 → 响亮拒", () => {
    let code = "";
    try {
      text([0x3d, 0xd8, 0x41, 0]);
    } catch (e) {
      code = (e as { code?: string }).code ?? "?";
    }
    eq("561", "非法配对", code, "packed-utf16");
  });
});
