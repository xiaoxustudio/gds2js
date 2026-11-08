import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { registerHostIo } from "../src/runtime/host-io";
import { nodeHostIo } from "../src/runtime/host-io-node";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

registerHostIo(nodeHostIo);

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const cf = (): any => engineClassNew("ConfigFile").v;
const strings = (v: Variant): string[] => (v.v as GBytes).raw() as string[];

describe("runtime/config file face", () => {
  it("text encode, parse and accessors", () => {
    const c = cf();
    method(c, "set_value", [V.str("s"), V.str("a"), V.int(1)]);
    method(c, "set_value", [V.str("s"), V.str("b"), V.str("with space")]);
    method(c, "set_value", [V.str("s"), V.str("gone"), V.int(2)]);
    method(c, "set_value", [V.str("s"), V.str("gone"), V.nil()]);
    const text = method(c, "encode_to_text", []).v as string;
    expect(text).toContain("[s]");
    expect(text).toContain('b="with space"');
    expect(text).not.toContain("gone=");
    expect(strings(method(c, "get_sections", [])).join(",")).toBe("s");
    expect(strings(method(c, "get_section_keys", [V.str("s")])).join(",")).toBe("a,b");
    expect(method(c, "has_section", [V.str("s")]).v).toBe(true);
    expect(method(c, "has_section", [V.str("x")]).v).toBe(false);
    expect(method(c, "has_section_key", [V.str("s"), V.str("a")]).v).toBe(true);
    expect(method(c, "get_value", [V.str("s"), V.str("a")]).v).toBe(1);
    expect(method(c, "get_value", [V.str("s"), V.str("m"), V.int(7)]).v).toBe(7);
    const other = cf();
    expect(method(other, "parse", [V.str(text)]).v).toBe(0);
    expect(method(other, "get_value", [V.str("s"), V.str("b")]).v).toBe("with space");
    expect(method(other, "parse", [V.str("[s\nk=v")]).v).toBe(43);
    method(c, "erase_section_key", [V.str("s"), V.str("a")]);
    expect(strings(method(c, "get_section_keys", [V.str("s")])).join(",")).toBe("b");
    method(c, "erase_section", [V.str("s")]);
    expect(method(c, "get_sections", []).t).toBe(Tag.OBJECT);
    expect(strings(method(c, "get_sections", [])).length).toBe(0);
    method(c, "clear", []);
    expect(strings(method(c, "get_sections", [])).length).toBe(0);
  });

  it("plain and encrypted file roundtrip", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-cfg-"));
    try {
      const c = cf();
      method(c, "set_value", [V.str("s"), V.str("k"), V.str("v")]);
      const plain = join(base, "a.cfg");
      expect(method(c, "load", [V.str(join(base, "missing.cfg"))]).v).toBe(7);
      expect(method(c, "save", [V.str(plain)]).v).toBe(0);
      const back = cf();
      expect(method(back, "load", [V.str(plain)]).v).toBe(0);
      expect(method(back, "get_value", [V.str("s"), V.str("k")]).v).toBe("v");

      const enc = join(base, "e.cfg");
      expect(method(c, "save_encrypted_pass", [V.str(enc), V.str("pw")]).v).toBe(0);
      const backPass = cf();
      expect(method(backPass, "load_encrypted_pass", [V.str(enc), V.str("pw")]).v).toBe(0);
      expect(method(backPass, "get_value", [V.str("s"), V.str("k")]).v).toBe("v");
      expect(method(backPass, "load_encrypted_pass", [V.str(enc), V.str("bad")]).v).toBe(16);

      const enc2 = join(base, "k.cfg");
      const key = V.object(GBytes.of(Array.from({ length: 32 }, (_, i) => i), "byte"));
      expect(method(c, "save_encrypted", [V.str(enc2), key]).v).toBe(0);
      const backKey = cf();
      expect(method(backKey, "load_encrypted", [V.str(enc2), key]).v).toBe(0);
      expect(method(backKey, "get_value", [V.str("s"), V.str("k")]).v).toBe("v");
      const short = V.object(GBytes.of(Array.from({ length: 16 }, (_, i) => i), "byte"));
      expect(method(backKey, "load_encrypted", [V.str(enc2), short]).v).toBe(31);
      expect(method(c, "save_encrypted", [V.str(enc2), short]).v).toBe(31);
      const wrong = V.object(GBytes.of(Array.from({ length: 32 }, (_, i) => (i * 7) % 256), "byte"));
      expect(method(backKey, "load_encrypted", [V.str(enc2), wrong]).v).toBe(16);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
