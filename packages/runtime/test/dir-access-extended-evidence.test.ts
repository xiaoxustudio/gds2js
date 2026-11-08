import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw, writeProp as writePropRaw } from "@gds2js/runtime/runtime/methods";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { registerHostIo } from "../src/runtime/host-io";
import { nodeHostIo } from "../src/runtime/host-io-node";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

registerHostIo(nodeHostIo);

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;
const writeProp = (recv: any, name: string, value: any): any => writePropRaw(recv, name, value);
const DIR = nativeClass("DirAccess");

describe("runtime/dir access extended face", () => {
  it("flags, drives, links and temp dirs", () => {
    const base = mkdtempSync(join(tmpdir(), "gds2js-da-"));
    try {
      const d = method(DIR, "open", [V.str(base)]);
      expect(d.t).toBe(Tag.OBJECT);
      const inner = d.v;
      expect(method(inner, "get_include_hidden", []).v).toBe(false);
      method(inner, "set_include_hidden", [V.bool(true)]);
      expect(method(inner, "get_include_hidden", []).v).toBe(true);
      expect(attribute(inner, "include_hidden").v).toBe(true);
      writeProp(inner, "include_hidden", V.bool(false));
      expect(attribute(inner, "include_hidden").v).toBe(false);
      method(inner, "set_include_navigational", [V.bool(true)]);
      expect(attribute(inner, "include_navigational").v).toBe(true);
      expect(method(inner, "get_include_navigational", []).v).toBe(true);
      expect(method(inner, "get_space_left", []).v).toBeGreaterThan(0);
      expect(method(inner, "get_filesystem_type", []).t).toBe(Tag.STRING);
      expect(method(inner, "is_bundle", [V.str(base)]).v).toBe(false);
      expect(method(inner, "is_case_sensitive", [V.str(base)]).t).toBe(Tag.BOOL);
      if (process.platform === "win32") {
        expect(method(DIR, "get_drive_count", []).v).toBeGreaterThan(0);
        expect(String(method(DIR, "get_drive_name", [V.int(0)]).v).length).toBeGreaterThan(0);
        expect(method(inner, "get_current_drive", []).v).toBeGreaterThanOrEqual(0);
      }
      const src = join(base, "a.txt");
      writeFileSync(src, "x");
      const link = join(base, "a-link.txt");
      expect(method(inner, "create_link", [V.str(src), V.str(link)]).v).toBe(0);
      expect(method(inner, "is_link", [V.str(link)]).v).toBe(true);
      expect(String(method(inner, "read_link", [V.str(link)]).v).split("\\").join("/")).toBe(src.split("\\").join("/"));
      expect(method(inner, "is_equivalent", [V.str(src), V.str(link)]).v).toBe(true);
      const temp = method(DIR, "create_temp", [V.str("daprobe"), V.bool(true)]);
      expect(temp.t).toBe(Tag.OBJECT);
      expect(String(method(temp.v, "get_current_dir", []).v).includes("daprobe")).toBe(true);
    } finally {
      rmSync(base, { recursive: true, force: true });
    }
  });
});
