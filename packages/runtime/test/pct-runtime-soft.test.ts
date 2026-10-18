/**
 * 运行期 `%` 的格式化那一族（S491）：左支 `String` 与 `StringName` 同一条通道，失败时引擎**不打断脚本** ——
 * 推一块 `ERROR: String formatting error: <细节>.`（`at:` 是 `validated_evaluate (core/variant/variant_op.h:829)`），
 * 回值是**格式串原样**。尺 `tmp/d6/s491c.py` 二十格 + `tmp/d6/s491d.py` 十六格 + `tmp/d6/s491e.py` 十二格，
 * 读数同名 `.json` / `.txt`；值那一头另由语料 396-pct-runtime 逐字节钉住（Godot 侧的 ERROR 块被 normalize 滤掉，所以这块文本只能在这里钉）。
 */
import { describe, it, vi } from "vitest";
import { eq } from "@gds2js/testkit";
import { ops } from "@gds2js/runtime/runtime/ops";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, show } from "@gds2js/runtime/runtime/values";

const arr = (xs: Variant[]): Variant => V.array(GArray.of(xs));
const AT = "   at: validated_evaluate (core/variant/variant_op.h:829)";

/** [说明, 左支面, 格式串, 实参, 回值, 引擎那块的头两行（不收就 null）] */
const CASES: Array<[string, "str" | "sn", string, Variant, string, string | null]> = [
  ["`%d` 配 int", "sn", "%d", V.int(7), "7", null],
  ["`%d` 配 int（String 左支）", "str", "%d", V.int(7), "7", null],
  ["`%s` 配 int", "sn", "%s", V.int(3), "3", null],
  ["`%d` 配 float 截断", "sn", "%d", V.float(1.5), "1", null],
  ["`%d` 配负 int", "sn", "%d", V.int(-1), "-1", null],
  ["`%x` 配 255", "sn", "%x", V.int(255), "ff", null],
  ["`%c` 配单字符 String", "sn", "%c", V.str("a"), "a", null],
  ["`%5.2f` 配 float", "sn", "%5.2f", V.float(1.234), " 1.23", null],
  ["`%d` 配一支数组", "sn", "%d", arr([V.int(1)]), "1", null],
  ["`%*d` 配两支数组", "sn", "%*d", arr([V.int(1), V.int(2)]), "2", null],
  ["混排的格式串", "sn", "a%db", V.int(7), "a7b", null],
  ["`%s` 配 StringName 实参", "sn", "%s", V.stringName("ab"), "ab", null],

  ["`%d` 配 String：一句 + 原样回", "sn", "%d", V.str("ab"), "%d", "ERROR: String formatting error: a number is required."],
  ["`%d` 配 String（String 左支）", "str", "%d", V.str("ab"), "%d", "ERROR: String formatting error: a number is required."],
  ["`%s%s` 只给一支：参数少用", "sn", "%s%s", V.str("ab"), "%s%s", "ERROR: String formatting error: not enough arguments for format string."],
  ["`%*d` 只给一个数：值位缺", "str", "%*d", V.int(7), "%*d", "ERROR: String formatting error: not enough arguments for format string."],
  ["`%*s` 的星位不是数", "str", "%*s", V.str("ab"), "%*s", "ERROR: String formatting error: * wants number or vector."],
  ["`%d` 配两支数组：参数多用", "sn", "%d", arr([V.int(1), V.int(2)]), "%d", "ERROR: String formatting error: not all arguments converted during string formatting."],
  ["无占位符的格式串配一个数", "sn", "ab", V.int(7), "ab", "ERROR: String formatting error: not all arguments converted during string formatting."],
  ["`%q` 不认的转换符", "str", "%q", V.str("ab"), "%q", "ERROR: String formatting error: unsupported format character."],
  ["`%u` 是残缺格式", "sn", "%u", V.int(-1), "%u", "ERROR: String formatting error: incomplete format."],
  ["`%d%` 结尾残缺", "str", "%d%", V.int(-1), "%d%", "ERROR: String formatting error: incomplete format."],
  ["`%v` 要向量", "sn", "%v", V.int(7), "%v", "ERROR: String formatting error: %v requires a vector type (Vector2/3/4/2i/3i/4i)."],
  ["`%c` 要数或单字符", "str", "%c", V.str("ab"), "%c", "ERROR: String formatting error: %c requires number or single-character string."],
];

describe("运行期 `%`：失败推一块 ERROR、格式串原样回出去", () => {
  for (const [label, side, fmt, arg, want, head] of CASES) {
    it(label, () => {
      const chunks: string[] = [];
      const spy = vi.spyOn(process.stderr, "write").mockImplementation((c: unknown) => {
        chunks.push(String(c));
        return true;
      });
      const got = ops.mod(side === "sn" ? V.stringName(fmt) : V.str(fmt), arg);
      spy.mockRestore();
      eq("491", `${label} 的回值`, show(got), want);
      const lines = chunks.join("").replace(/\r/g, "").split("\n").filter(Boolean);
      eq("491", `${label} 的块`, head === null ? [] : [lines[0] ?? "", lines[1] ?? ""], head === null ? [] : [head, AT]);
    });
  }
});
