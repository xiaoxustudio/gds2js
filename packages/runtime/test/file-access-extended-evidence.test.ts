import { mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw, writeProp as writePropRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { registerHostIo } from "../src/runtime/host-io";
import { nodeHostIo } from "../src/runtime/host-io-node";
import { GBytes } from "@gds2js/runtime/runtime/class/bytes/packed";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

registerHostIo(nodeHostIo);

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const writeProp = (recv: any, name: string, value: any): any => writePropRaw(recv, name, value);
const FILE = nativeClass("FileAccess");
const bytes = (items: number[]): Variant => V.object(GBytes.of(items, "byte"));
const raw = (v: Variant): number[] => (v.v as GBytes).raw().map((b) => Number(b) & 255);

describe("runtime/file access extended face", () => {
  it("hash, timestamps, attributes and permissions", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-fa-"));
    try {
      const file = join(base, "a.txt");
      writeFileSync(file, "hello");
      expect(method(FILE, "get_sha256", [V.str(file)]).v).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
      expect(method(FILE, "get_modified_time", [V.str(file)]).v).toBeGreaterThan(0);
      expect(method(FILE, "get_access_time", [V.str(file)]).v).toBeGreaterThan(0);
      expect(method(FILE, "get_hidden_attribute", [V.str(file)]).t).toBe(Tag.BOOL);
      expect(method(FILE, "get_read_only_attribute", [V.str(file)]).t).toBe(Tag.BOOL);
      if (process.platform === "win32") {
        expect(method(FILE, "set_read_only_attribute", [V.str(file), V.bool(true)]).v).toBe(0);
        expect(method(FILE, "get_read_only_attribute", [V.str(file)]).v).toBe(true);
        method(FILE, "set_read_only_attribute", [V.str(file), V.bool(false)]);
        expect(method(FILE, "get_unix_permissions", [V.str(file)]).v).toBe(0);
        expect(method(FILE, "set_unix_permissions", [V.str(file), V.int(448)]).v).toBe(2);
        expect(method(FILE, "set_extended_attribute", [V.str(file), V.str("test.attr"), bytes([1, 2, 3])]).v).toBe(0);
        expect(raw(method(FILE, "get_extended_attribute", [V.str(file), V.str("test.attr")]))).toEqual([1, 2, 3]);
        method(FILE, "set_extended_attribute_string", [V.str(file), V.str("test.str"), V.str("v")]);
        expect(method(FILE, "get_extended_attribute_string", [V.str(file), V.str("test.str")]).v).toBe("v");
        expect(raw(method(FILE, "get_extended_attributes_list", [V.str(file)])).length).toBe(2);
        expect(method(FILE, "remove_extended_attribute", [V.str(file), V.str("test.attr")]).v).toBe(0);
      }
      const temp = method(FILE, "create_temp", [V.int(2), V.str("probe"), V.str(".bin"), V.bool(true)]);
      expect(temp.t).toBe(Tag.OBJECT);
      const path = String(method(temp.v, "get_path", []).v);
      expect(path.includes("probe")).toBe(true);
      expect(existsSync(path)).toBe(true);
      method(temp.v, "close", []);
      expect(existsSync(path)).toBe(true);
      const temp2 = method(FILE, "create_temp", [V.int(2), V.str("probe2"), V.str(".bin"), V.bool(false)]);
      const path2 = String(method(temp2.v, "get_path", []).v);
      method(temp2.v, "close", []);
      expect(existsSync(path2)).toBe(true);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });

  it("encrypted roundtrips and endian flag", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-fa-enc-"));
    try {
      const key = Array.from({ length: 32 }, (_, i) => i);
      const iv = Array.from({ length: 16 }, (_, i) => i);
      const file = join(base, "e.bin");
      const w = method(FILE, "open_encrypted", [V.str(file), V.int(2), bytes(key), bytes(iv)]);
      method(w, "store_string", [V.str("secret")]);
      method(w, "close", []);
      const head = readFileSync(file);
      expect(head.subarray(0, 4).toString()).toBe("GDEC");
      const r = method(FILE, "open_encrypted", [V.str(file), V.int(1), bytes(key), bytes(iv)]);
      expect(method(r, "get_as_text", []).v).toBe("secret");
      expect(attribute(r.v, "big_endian").v).toBe(false);
      writeProp(r.v, "big_endian", V.bool(true));
      expect(attribute(r.v, "big_endian").v).toBe(true);
      method(r, "close", []);
      const file2 = join(base, "ep.bin");
      const pw = method(FILE, "open_encrypted_with_pass", [V.str(file2), V.int(2), V.str("pw")]);
      method(pw, "store_string", [V.str("secret")]);
      method(pw, "close", []);
      const pr = method(FILE, "open_encrypted_with_pass", [V.str(file2), V.int(1), V.str("pw")]);
      expect(method(pr, "get_as_text", []).v).toBe("secret");
      method(pr, "close", []);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
