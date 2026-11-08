import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { registerHostIo } from "../src/runtime/host-io";
import { nodeHostIo } from "../src/runtime/host-io-node";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

registerHostIo(nodeHostIo);

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const KEY = "0".repeat(64);

describe("runtime/pck packer face", () => {
  it("writes a Godot pack and reports error shapes", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-pck-"));
    try {
      const src = join(base, "a.txt");
      writeFileSync(src, "hello");
      const out = join(base, "out.pck");
      const p = engineClassNew("PCKPacker").v;
      expect(method(p, "flush", [V.bool(false)]).v).toBe(31);
      expect(method(p, "pck_start", [V.str(out), V.int(0), V.str(KEY), V.bool(false)]).v).toBe(20);
      expect(method(p, "pck_start", [V.str(out), V.int(16), V.str("short"), V.bool(false)]).v).toBe(20);
      expect(method(p, "pck_start", [V.str(out), V.int(16), V.str(KEY), V.bool(false)]).v).toBe(0);
      expect(method(p, "add_file", [V.str("res://missing.txt"), V.str(join(base, "missing.txt"))]).v).toBe(7);
      expect(method(p, "add_file", [V.str("res://a.txt"), V.str(src)]).v).toBe(0);
      expect(method(p, "add_file_removal", [V.str("res://gone.txt")]).v).toBe(0);
      expect(method(p, "flush", [V.bool(false)]).v).toBe(0);
      const bytes = readFileSync(out);
      expect(bytes.subarray(0, 4).toString()).toBe("GDPC");
      expect(bytes.readUInt32LE(4)).toBe(3);
      expect(bytes.subarray(8, 20)).toEqual(Buffer.from([4, 0, 0, 0, 6, 0, 0, 0, 3, 0, 0, 0]));
      expect(bytes.readUInt32LE(20)).toBe(2);
      expect(bytes.readBigUInt64LE(24)).toBe(112n);
      expect(bytes.subarray(112, 117).toString()).toBe("hello");
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
