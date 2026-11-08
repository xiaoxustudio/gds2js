import { mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { method } from "@gds2js/runtime/runtime/methods";
import { registerHostIo } from "../src/runtime/host-io";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { Tag, V } from "@gds2js/runtime/runtime/tags";
import { nodeHostIo } from "../src/runtime/host-io-node";

registerHostIo(nodeHostIo);

const DIR = nativeClass("DirAccess");
const FILE = nativeClass("FileAccess");

describe("runtime/host face evidence", () => {
  it("DirAccess and FileAccess face", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-face-"));
    try {
      const dir = method(DIR, "open", [V.str(base)]);
      expect((dir as { t: number }).t).toBe(Tag.OBJECT);
      method(dir, "make_dir_recursive", [V.str("a/b")]);
      expect(existsSync(join(base, "a", "b"))).toBe(true);
      const src = join(base, "src.bin");
      const w = method(FILE, "open", [V.str(src), V.int(2)]);
      method(w, "store_real", [V.float(1.5)]);
      method(w, "close", []);
      expect(existsSync(src)).toBe(true);
      const dst = join(base, "dst.bin");
      method(DIR, "copy_absolute", [V.str(src), V.str(dst)]);
      expect(existsSync(dst)).toBe(true);
      const r = method(FILE, "open", [V.str(src), V.int(1)]);
      expect(method(r, "get_real", []).v).toBe(1.5);
      method(r, "close", []);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
