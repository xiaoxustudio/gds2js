/** 「存在但没量元数」那五名的两界（S668，尺 `tmp/probe670/bounds.mts` 廿七格两侧对读 + 名册尺 `tmp/probe670/roster.mjs`）：
 *  String 的 `uri_file_decode` / `is_valid_ascii_identifier` / `is_valid_unicode_identifier` 只发 `Too many`（零元），
 *  `Array.set` 与 `Dictionary.set` 两向都开口（`[2, 2]`）；`Array.set` 取值时引擎在元数那句之外**再发**一句 void（`Dictionary.set` 给旧值，不发）。
 *  病灶：这五名的存在性登在 `FACE_EXISTS_BEYOND_ARITY` 里但没有上下界，所以越界形我们解析期一句不发 —— String 那三名拖到运行期发的是自述「不接受参数」，
 *  `d.set()` 直接崩（`Cannot read properties of undefined`），`d.set(0)` 还给 `true`。
 *  仍开着的一格：`([1, 2]).set(0)` 这种**括号字面量**当 Array 接收者时元数那句照发、void 那句不发（同尺 `v_arr_lit_*` 三格），
 *  量过的 `append` / `sort` 同形同缺 —— 那是接收者形状那一族的账（`shapeOf` 不认括号字面量），不在这一笔里猜。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = "extends SceneTree\n\nfunc _initialize():\n";
const RECV: Record<string, string> = {
  标注: `\tvar s: String = "a.txt"\n\tvar a: Array = [1, 2]\n\tvar d: Dictionary = {1: 2}\n\tprint("S|", s.%C%)\n`,
  标注容器: `\tvar s: String = "a.txt"\n\tvar a: Array = [1, 2]\n\tvar d: Dictionary = {1: 2}\n\tprint("S|", %R%.%C%)\n`,
  推断: `\tvar s = "a.txt"\n\tvar a = [1, 2]\n\tvar d = {1: 2}\n\tprint("S|", %R%.%C%)\n`,
  字面量: `\tprint("S|", %R%.%C%)\n`,
};

const msgs = async (recv: string, rest: string, call: string): Promise<string[]> => {
  const body = (RECV[recv] ?? "").replace("%R%", rest).replace("%C%", call);
  return analyze(lower(await parseSource(`${HEAD}${body}\tquit()\n`))).diagnostics.map((d) => d.message);
};

const few = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${String(min)} but received ${String(got)}.`;
const many = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${String(max)} but received ${String(got)}.`;
const VOID = `Cannot get return value of call to "set()" because it returns "void".`;

const STR_NAMES = ["uri_file_decode", "is_valid_ascii_identifier", "is_valid_unicode_identifier"];

describe("analyze · String 那三名只发 Too many", () => {
  it.each(STR_NAMES)("%s(1) 三形接收者同句", async (name) => {
    for (const recv of ["标注", "推断", "字面量"]) {
      const rest = recv === "字面量" ? '("a.txt")' : "s";
      expect(await msgs(recv, rest, `${name}(1)`), `${recv} ${name}`).toEqual([many(name, 0, 1)]);
    }
  });

  it.each(STR_NAMES)("%s() 零支收下", async (name) => {
    expect(await msgs("标注", "s", `${name}()`)).toEqual([]);
  });
});

describe("analyze · Array.set 两向都开口并且补 void 那句", () => {
  const CASES: Array<[string, string[]]> = [
    ["set()", [few("set", 2, 0), VOID]],
    ["set(0)", [few("set", 2, 1), VOID]],
    ["set(0, 1, 2)", [many("set", 2, 3), VOID]],
  ];
  it.each(CASES)("%s 标注与推断两形同两句", async (call, want) => {
    expect(await msgs("标注容器", "a", call), call).toEqual(want);
    expect(await msgs("推断", "a", call), call).toEqual(want);
  });

  it("元数合式的形只剩 void 那一句（取值才是引擎拦的那件事）", async () => {
    expect(await msgs("标注容器", "a", "set(0, 9)")).toEqual([VOID]);
  });
});

describe("analyze · Dictionary.set 两向都开口且不补 void", () => {
  const CASES: Array<[string, string[]]> = [
    ["set()", [few("set", 2, 0)]],
    ["set(0)", [few("set", 2, 1)]],
    ["set(0, 1, 2)", [many("set", 2, 3)]],
  ];
  it.each(CASES)("%s 三形接收者同句", async (call, want) => {
    for (const [recv, rest] of [["标注容器", "d"], ["推断", "d"], ["字面量", "{1: 2}"]] as Array<[string, string]>) {
      expect(await msgs(recv, rest, call), `${recv} ${call}`).toEqual(want);
    }
  });

  it("合式两支撑下", async () => {
    expect(await msgs("标注容器", "d", 'set("k", 1)')).toEqual([]);
  });
});
