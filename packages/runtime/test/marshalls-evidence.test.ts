import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;

const bytes = (items: number[]): Variant => V.object(GBytes.of(items, "byte"));

describe("runtime/marshalls face", () => {
  it("raw and utf8 base64", () => {
    const m = nativeClass("Marshalls");
    expect(method(m, "raw_to_base64", [bytes([104, 105, 0, 255])]).v).toBe("aGkA/w==");
    const raw = method(m, "base64_to_raw", [V.str("aGkA/w==")]);
    expect(raw.t).toBe(Tag.OBJECT);
    expect((raw.v as GBytes).raw()).toEqual([104, 105, 0, 255]);
    expect(method(m, "utf8_to_base64", [V.str("hé😀")]).v).toBe("aMOp8J+YgA==");
    expect(method(m, "base64_to_utf8", [V.str("aMOp8J+YgA==")]).v).toBe("hé😀");
    expect(method(m, "base64_to_raw", [V.str("")]).v).toBeInstanceOf(GBytes);
    expect(method(m, "utf8_to_base64", [V.str("")]).v).toBe("");
    expect(method(m, "base64_to_utf8", [V.str("")]).v).toBe("");
  });

  it("variant base64 roundtrip", () => {
    const m = nativeClass("Marshalls");
    expect(method(m, "variant_to_base64", [V.int(1), V.bool(false)]).v).toBe("AgAAAAEAAAA=");
    expect(method(m, "variant_to_base64", [V.str("a"), V.bool(false)]).v).toBe("BAAAAAEAAABhAAAA");
    const arr = V.array(GArray.of([V.int(1), V.int(2), V.int(3)]));
    expect(method(m, "variant_to_base64", [arr, V.bool(false)]).v).toBe("HAAAAAMAAAACAAAAAQAAAAIAAAACAAAAAgAAAAMAAAA=");
    expect(method(m, "variant_to_base64", [V.bool(true), V.bool(false)]).v).toBe("AQAAAAEAAAA=");
    expect(method(m, "variant_to_base64", [V.nil(), V.bool(false)]).v).toBe("AAAAAA==");
    expect(method(m, "base64_to_variant", [V.str("HAAAAAMAAAACAAAAAQAAAAIAAAACAAAAAgAAAAMAAAA="), V.bool(false)]).t).toBe(Tag.ARRAY);
  });
});
