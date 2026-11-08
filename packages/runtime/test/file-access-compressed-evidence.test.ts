import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import "@gds2js/runtime/host-node";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const FILE = nativeClass("FileAccess");

describe("runtime/file access compressed face", () => {
  it("roundtrips every writable compression mode", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-comp-"));
    try {
      for (const mode of [0, 1, 2, 3]) {
        const path = join(base, `c${mode}.bin`);
        const w = method(FILE, "open_compressed", [V.str(path), V.int(2), V.int(mode)]);
        method(w, "store_string", [V.str("hello")]);
        method(w, "close", []);
        const r = method(FILE, "open_compressed", [V.str(path), V.int(1), V.int(mode)]);
        expect(method(r, "get_as_text", []).v).toBe("hello");
        method(r, "close", []);
      }
      const path = join(base, "big.bin");
      const w = method(FILE, "open_compressed", [V.str(path), V.int(2), V.int(1)]);
      method(w, "store_string", [V.str("x".repeat(5000))]);
      method(w, "close", []);
      const r = method(FILE, "open_compressed", [V.str(path), V.int(1), V.int(1)]);
      expect(String(method(r, "get_as_text", []).v).length).toBe(5000);
      method(r, "close", []);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
