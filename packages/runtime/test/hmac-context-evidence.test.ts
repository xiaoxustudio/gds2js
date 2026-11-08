import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const bytes = (s: string): Variant => V.object(GBytes.of([...new TextEncoder().encode(s)], "byte"));
const hex = (v: Variant): string => (v.v as GBytes).raw().map((b) => Number(b).toString(16).padStart(2, "0")).join("");

describe("runtime/hmac and encoded object id face", () => {
  it("hmac sha1 and sha256", () => {
    const h = engineClassNew("HMACContext").v;
    expect(method(h, "start", [V.int(1), bytes("key")]).v).toBe(0);
    expect(method(h, "update", [bytes("msg")]).v).toBe(0);
    expect(hex(method(h, "finish", []))).toBe("102900b72b7bf1031eec76b4804b66052376896b");
    const h2 = engineClassNew("HMACContext").v;
    method(h2, "start", [V.int(2), bytes("key")]);
    method(h2, "update", [bytes("msg")]);
    expect(hex(method(h2, "finish", []))).toBe("2d93cbc1be167bcb1637a4a23cbff01a7878f0c50ee833954ea5221bb1b8c628");
    const long = engineClassNew("HMACContext").v;
    method(long, "start", [V.int(2), bytes("a".repeat(100))]);
    method(long, "update", [bytes("data")]);
    expect(hex(method(long, "finish", []))).toBe("e14de9a494162761a795f27ecd019c4ce8fe3ea948c960e0fd251c78af6f1ccc");
  });

  it("hmac error shapes", () => {
    const h = engineClassNew("HMACContext").v;
    expect(method(h, "start", [V.int(0), bytes("key")]).v).toBe(31);
    expect(method(h, "update", [bytes("x")]).v).toBe(30);
    expect(method(h, "finish", []).t).toBe(Tag.OBJECT);
    expect(method(h, "start", [V.int(99), bytes("k")]).v).toBe(31);
  });

  it("encoded object id face", () => {
    const e = engineClassNew("EncodedObjectAsID").v;
    expect(method(e, "get_object_id", []).v).toBe(0);
    method(e, "set_object_id", [V.int(7)]);
    expect(method(e, "get_object_id", []).v).toBe(7);
    expect(attribute(e, "object_id").v).toBe(7);
    method(e, "set_object_id", [V.int(42)]);
    expect(attribute(e, "object_id").v).toBe(42);
  });
});
