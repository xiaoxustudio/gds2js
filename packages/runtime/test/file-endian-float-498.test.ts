import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method, nativeClass, registerHostIo, V, type HostIo, type Variant } from "@gds2js/runtime";

const FILES = new Map<string, Uint8Array>();

const TABLE: HostIo = {
  exists: (p) => p.endsWith("/work") || FILES.has(p),
  isDir: (p) => p.endsWith("/work"),
  read: (p) => FILES.get(p) ?? new Uint8Array(0),
  write: (p, b) => {
    FILES.set(p, b);
    return true;
  },
  size: (p) => FILES.get(p)?.length ?? 0,
  makeDir: () => 0,
  remove: () => 0,
  rename: () => 0,
  copy: () => 0,
  list: () => [],
};

registerHostIo(TABLE);

const I = (x: number): Variant => V.int(x);
const FILE = nativeClass("FileAccess");

function open(path: string, mode: number): Variant {
  return method(FILE, "open", [V.str(path), I(mode)]);
}

describe("runtime/file endian float（498）", () => {
  it("498 · set_big_endian 影响 float/double 读写", () => {
    const w = open("./work/be_f.bin", 2);
    method(w, "set_big_endian", [V.bool(true)]);
    method(w, "store_float", [V.float(1.5)]);
    method(w, "store_float", [V.float(-2.25)]);
    method(w, "store_double", [V.float(3.5)]);
    eq("498", "写入长度", method(w, "get_length", []).v, 16);
    method(w, "close", []);

    const r = open("./work/be_f.bin", 1);
    method(r, "set_big_endian", [V.bool(true)]);
    eq(
      "498",
      "大端读回浮点",
      `${String(method(r, "get_float", []).v)}|${String(method(r, "get_float", []).v)}|${String(method(r, "get_double", []).v)}|${String(method(r, "get_position", []).v)}`,
      "1.5|-2.25|3.5|16",
    );
    method(r, "close", []);

    const le = open("./work/be_f.bin", 1);
    eq(
      "498",
      "同一批字节按小端读 32 位",
      `${String(method(le, "get_32", []).v)}|${String(method(le, "get_32", []).v)}|${String(method(le, "get_32", []).v)}|${String(method(le, "get_32", []).v)}`,
      "49215|4288|3136|0",
    );
    method(le, "close", []);
  });
});
