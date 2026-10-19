/**
 * `String.format()` 的运行期失败通道（S511）：`values` 是 Array / Dictionary / 真对象以外的档位时，
 * 引擎**不打断脚本** —— 推一块 `ERROR: Invalid type: use Array, Dictionary or Object.`（`at:` 是 `format (core/string/ustring.cpp:3598)`），
 * 回值是**格式串原样**。尺 `tmp/d6/s511.py` 九十格（十种格式串 × 九种 `values`，一格一份脚本、引擎跑 Godot 我们跑 `cli run`），
 * 读数同名 `.json` / `.txt`：值行 0 格不同（失败时两边都原样回吐格式串），分歧全在这块 ERROR —— 而 Godot 侧的 ERROR 块被语料 normalize 滤掉，
 * 所以这块文本只能在这里钉。Array / Dictionary 那一档两边都只回值行、都开口为零（本来就对）。
 */
import { describe, it, vi } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { GVector2 } from "@gds2js/runtime/runtime/vector2";

const HEAD = "ERROR: Invalid type: use Array, Dictionary or Object.";
const AT = "   at: format (core/string/ustring.cpp:3598)";

const FORMATS = ["%s", "%d", "%x", "%c", "%v", "%f", "%(k)s", "%*d", "ab", "%s%s"];

const dict = (pairs: Array<[string, Variant]>): Variant => {
  const d = new GDict();
  for (const [k, v] of pairs) d.set(V.str(k), v);
  return V.dict(d);
};

// 引擎发这块的六档（量过）：标量五档 + Vector2 那一支值型（我们装成 Tag.OBJECT 但非脚本实例）。
const INVALID: Array<[string, Variant]> = [
  ["int", V.int(7)],
  ["float", V.float(1.5)],
  ["String", V.str("ab")],
  ["null", V.nil()],
  ["bool", V.bool(true)],
  ["Vector2", V.object(new GVector2(1, 2))],
];

// 引擎不开口的容器档（量过）：Array / Dictionary（含空）。
const VALID: Array<[string, Variant]> = [
  ["Array", V.array(GArray.of([V.int(1), V.int(2)]))],
  ["ArrayStr", V.array(GArray.of([V.str("a"), V.str("b")]))],
  ["Dict", dict([["k", V.int(7)]])],
  ["空 Array", V.array(GArray.of([]))],
  ["空 Dict", dict([])],
];

/** 跑一次 String.format()：回吐 show(值)，顺带收回 stderr 那块的头两行。 */
function runFmt(fmt: string, values: Variant): [string, string[]] {
  const chunks: string[] = [];
  const spy = vi.spyOn(process.stderr, "write").mockImplementation((c: unknown) => {
    chunks.push(String(c));
    return true;
  });
  const got = method(V.str(fmt), "format", [values]);
  spy.mockRestore();
  const lines = chunks.join("").replace(/\r/g, "").split("\n").filter(Boolean);
  return [show(got), lines.slice(0, 2)];
}

describe("String.format()：values 不是 Array/Dictionary/对象时推一块 ERROR、格式串原样回", () => {
  for (const fmt of FORMATS) {
    for (const [vk, values] of INVALID) {
      it(`\`${fmt}\` 配 ${vk}：一句 + 原样回`, () => {
        const [val, block] = runFmt(fmt, values);
        eq("511", `\`${fmt}\` 配 ${vk} 的回值`, val, fmt);
        eq("511", `\`${fmt}\` 配 ${vk} 的块`, block, [HEAD, AT]);
      });
    }
    for (const [vk, values] of VALID) {
      it(`\`${fmt}\` 配 ${vk}：不开口`, () => {
        const [, block] = runFmt(fmt, values);
        eq("511", `\`${fmt}\` 配 ${vk} 不该推块`, block, []);
      });
    }
  }
});
