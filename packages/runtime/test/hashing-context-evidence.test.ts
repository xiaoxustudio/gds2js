import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const abc = (): Variant => V.object(GBytes.of([97, 98, 99], "byte"));
const hex = (v: Variant): string => (v.v as GBytes).raw().map((b) => Number(b).toString(16).padStart(2, "0")).join("");

describe("runtime/hashing context face", () => {
  it("md5, sha1 and sha256 digests", () => {
    const md5 = engineClassNew("HashingContext").v;
    expect(method(md5, "start", [V.int(0)]).v).toBe(0);
    expect(method(md5, "update", [abc()]).v).toBe(0);
    expect(hex(method(md5, "finish", []))).toBe("900150983cd24fb0d6963f7d28e17f72");

    const sha1 = engineClassNew("HashingContext").v;
    method(sha1, "start", [V.int(1)]);
    method(sha1, "update", [abc()]);
    expect(hex(method(sha1, "finish", []))).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");

    const sha256 = engineClassNew("HashingContext").v;
    method(sha256, "start", [V.int(2)]);
    method(sha256, "update", [V.object(GBytes.of([97, 98], "byte"))]);
    method(sha256, "update", [V.object(GBytes.of([99], "byte"))]);
    expect(hex(method(sha256, "finish", []))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("hashing error shapes and enum values", () => {
    const h = engineClassNew("HashingContext").v;
    expect(method(h, "update", [abc()]).v).toBe(3);
    expect(hex(method(h, "finish", []))).toBe("");
    expect(method(h, "start", [V.int(99)]).v).toBe(2);
    expect(method(h, "start", [V.int(0)]).v).toBe(0);
    expect(attribute(nativeClass("HashingContext"), "HASH_MD5").v).toBe(0);
    expect(attribute(nativeClass("HashingContext"), "HASH_SHA1").v).toBe(1);
    expect(attribute(nativeClass("HashingContext"), "HASH_SHA256").v).toBe(2);
    expect(method(h, "finish", []).t).toBe(Tag.OBJECT);
  });
});
