import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
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

const T = (s: string): Variant => V.str(s);
const I = (x: number): Variant => V.int(x);
const FILE = nativeClass("FileAccess");

function open(path: string, mode: number): Variant {
  return method(FILE, "open", [T(path), I(mode)]);
}

function writeText(path: string, text: string): void {
  const f = open(path, 2);
  method(f, "store_string", [T(text)]);
  method(f, "close", []);
}

describe("runtime/file seek_end · endian · pascal · md5（492）", () => {
  it("492 · seek_end 从末尾偏移，允许越过末尾", () => {
    writeText("./work/se.txt", "abcdef");
    const r = open("./work/se.txt", 1);
    method(r, "seek_end", [I(-2)]);
    eq("492", "seek_end(-2) 的位置与读值", `${method(r, "get_position", []).v}|${method(r, "get_8", []).v}|${method(r, "get_position", []).v}`, "4|101|5");
    method(r, "seek_end", [I(3)]);
    eq("492", "seek_end 可越过末尾且 eof 未置", `${method(r, "get_position", []).v}|${method(r, "eof_reached", []).v}`, "9|false");
    method(r, "seek_end", [I(-99)]);
    eq("492", "负目标不移动", method(r, "get_position", []).v, 9);
  });

  it("492 · set_big_endian 影响 16/32 位读写", () => {
    const w = open("./work/be.bin", 2);
    method(w, "set_big_endian", [V.bool(true)]);
    method(w, "store_16", [I(0x1234)]);
    method(w, "store_32", [I(0x12345678)]);
    method(w, "close", []);
    const r = open("./work/be.bin", 1);
    method(r, "set_big_endian", [V.bool(true)]);
    eq("492", "大端读", `${method(r, "get_16", []).v}|${method(r, "get_32", []).v}`, "4660|305419896");
    method(r, "seek", [I(0)]);
    method(r, "set_big_endian", [V.bool(false)]);
    eq("492", "小端读", `${method(r, "get_16", []).v}|${method(r, "get_32", []).v}`, "13330|2018915346");
  });

  it("492 · pascal 字符串是 4 字节长度前缀 + UTF-8", () => {
    const w = open("./work/ps.bin", 2);
    method(w, "store_pascal_string", [T("abc")]);
    method(w, "close", []);
    const r = open("./work/ps.bin", 1);
    eq("492", "读回与长度", `${method(r, "get_pascal_string", []).v}|${method(r, "get_position", []).v}`, "abc|7");

    const e = open("./work/ps0.bin", 2);
    method(e, "store_pascal_string", [T("")]);
    method(e, "close", []);
    const er = open("./work/ps0.bin", 1);
    eq("492", "空串只占 4 字节", `${method(er, "get_pascal_string", []).v}|${method(er, "get_position", []).v}`, "|4");

    const s = open("./work/ps1.bin", 2);
    method(s, "store_32", [I(9)]);
    method(s, "store_8", [I(65)]);
    method(s, "close", []);
    const sr = open("./work/ps1.bin", 1);
    shouldThrow("492", "长度前缀超出剩余字节时响亮拒", () => method(sr, "get_pascal_string", []));
  });

  it("492 · get_md5 读文件字节", () => {
    writeText("./work/md.txt", "abcdef");
    eq("492", "get_md5", method(FILE, "get_md5", [T("./work/md.txt")]).v, "e80b5017098950fc58aad83c8c14978e");
    shouldThrow("492", "缺失文件响亮拒", () => method(FILE, "get_md5", [T("./work/nope.txt")]));
  });

  it("492 · eof 标志跟着读走，seek 清除", () => {
    writeText("./work/eof.txt", "a\n");
    const r = open("./work/eof.txt", 1);
    eq("492", "get_line 到末尾置 eof", `${method(r, "get_line", []).v}|${method(r, "eof_reached", []).v}`, "a|true");
    method(r, "seek", [I(0)]);
    eq("492", "seek 清 eof", method(r, "eof_reached", []).v, "false");
  });
});
