/** pack 名册补齐在解析期那两族句子（S636）：新入表的 38 名按量过的上下界发元数两句，byte 之外九支对 byte 独有名发既有两句表外名。
 *  读数 `tmp/probe636/arity636.compare.txt`（0 / 5 实参各一句）与 `a.gd` / `b.gd`（静态接收者两形）。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

async function diags(body: string): Promise<string[]> {
  return analyze(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n${body}\n\tquit()\n`))).diagnostics.map((d) => d.message);
}

describe("解析期 · pack 新入表名字的两句", () => {
  const CASES: Array<[string, string, string[]]> = [
    ["byte 越上界", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.decode_u8(1, 2, 3, 4, 5)", ['Too many arguments for "decode_u8()" call. Expected at most 1 but received 5.']],
    ["byte 越下界", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.decode_u8()", ['Too few arguments for "decode_u8()" call. Expected at least 1 but received 0.']],
    ["零元那支越界", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.get_string_from_utf32(\"x\")", ['Too many arguments for "get_string_from_utf32()" call. Expected at most 0 but received 1.']],
    ["bswap16 收下界 0", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.bswap16()", []],
    ["bswap16 三实参越界", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.bswap16(1, 2, 3)", ['Too many arguments for "bswap16()" call. Expected at most 2 but received 3.']],
    ["encode_var 越下界", "\tvar p: PackedByteArray = PackedByteArray()\n\tp.encode_var(1)", ['Too few arguments for "encode_var()" call. Expected at least 2 but received 1.']],
    ["九支都收 erase 一格", "\tvar q: PackedInt32Array = PackedInt32Array()\n\tq.erase(1)", []],
    ["erase 越下界", "\tvar q: PackedInt32Array = PackedInt32Array()\n\tq.erase()", ['Too few arguments for "erase()" call. Expected at least 1 but received 0.']],
    ["byte 独有在 i32 上是表外名", "\tprint(PackedInt32Array().decode_u8(1))", ['Cannot find member "decode_u8" in base "PackedInt32Array".', 'Function "decode_u8()" not found in base PackedInt32Array.']],
  ];
  for (const [name, src, want] of CASES) {
    it(name, async () => {
      expect(await diags(src)).toEqual(want);
    });
  }
});
