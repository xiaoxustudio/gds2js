import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const bytes = (items: number[]): Variant => V.object(GBytes.of(items, "byte"));
const hex = (v: Variant): string => (v.v as GBytes).raw().map((b) => Number(b).toString(16).padStart(2, "0")).join("");

const KEY = Array.from({ length: 16 }, (_, i) => i);
const KEY32 = Array.from({ length: 32 }, (_, i) => i);
const IV = Array.from({ length: 16 }, (_, i) => 16 + i);
const PLAIN = [...new TextEncoder().encode("0123456789abcdef")];

describe("runtime/aes context face", () => {
  it("cbc and ecb vectors", () => {
    const c = engineClassNew("AESContext").v;
    expect(method(c, "start", [V.int(2), bytes(KEY), bytes(IV)]).v).toBe(0);
    const ct = method(c, "update", [bytes(PLAIN)]);
    expect(hex(ct)).toBe("eb9e5ba41b902db8252982aa1a23f4be");
    expect(hex(method(c, "get_iv_state", []))).toBe("eb9e5ba41b902db8252982aa1a23f4be");
    expect(hex(method(c, "update", [bytes([...new TextEncoder().encode("fedcba9876543210")])]))).toBe("03854166ab69ccaa54f94bb8926bcc78");
    method(c, "finish", []);

    const e = engineClassNew("AESContext").v;
    method(e, "start", [V.int(0), bytes(KEY), bytes([])]);
    expect(hex(method(e, "update", [bytes(PLAIN)]))).toBe("281567ab2f4cf0d73d3198225b8b8393");
    expect(hex(method(e, "get_iv_state", []))).toBe("");

    const g = engineClassNew("AESContext").v;
    method(g, "start", [V.int(0), bytes(KEY32), bytes([])]);
    const ct32 = method(g, "update", [bytes(PLAIN)]);
    expect(hex(ct32)).toBe("d8c95758e3353e530fa52bd10e73b986");
    method(g, "finish", []);
    const d = engineClassNew("AESContext").v;
    method(d, "start", [V.int(1), bytes(KEY32), bytes([])]);
    expect(hex(method(d, "update", [ct32]))).toBe("30313233343536373839616263646566");
  });

  it("error shapes and mode values", () => {
    const h = engineClassNew("AESContext").v;
    expect(method(h, "start", [V.int(99), bytes(KEY), bytes(IV)]).v).toBe(31);
    expect(method(h, "update", [bytes(PLAIN)])).toBeInstanceOf(Object);
    expect(method(h, "update", [bytes(PLAIN)]).t).toBe(Tag.OBJECT);
    expect(method(h, "start", [V.int(2), bytes([1, 2, 3]), bytes(IV)]).v).toBe(31);
    expect(method(h, "start", [V.int(2), bytes(KEY), bytes([])]).v).toBe(31);
    expect(method(h, "start", [V.int(2), bytes(KEY), bytes(IV)]).v).toBe(0);
    expect(method(h, "update", [bytes([1, 2, 3])]).t).toBe(Tag.OBJECT);
    expect(hex(method(h, "get_iv_state", []))).toBe("101112131415161718191a1b1c1d1e1f");
    method(h, "finish", []);
    const MODE = nativeClass("AESContext");
    expect(attribute(MODE, "MODE_ECB_ENCRYPT").v).toBe(0);
    expect(attribute(MODE, "MODE_ECB_DECRYPT").v).toBe(1);
    expect(attribute(MODE, "MODE_CBC_ENCRYPT").v).toBe(2);
    expect(attribute(MODE, "MODE_CBC_DECRYPT").v).toBe(3);
    expect(attribute(MODE, "MODE_MAX").v).toBe(4);
  });
});
