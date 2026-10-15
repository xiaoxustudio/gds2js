/**
 * Array / String 两侧实参类型句的覆盖面补齐（S382）：38 名、48 位、720 格一格不落地钉进门里。
 * 表体由读数直接生成（`tmp/probe-faces2/gen-test.mts`），量回来的形状别手抄。
 * 尺 `tmp/probe-faces2/round1.mts`（一句一行、一次 spawn 量一批，句子按行号归格），读数 `tmp/probe-faces2/compare29.txt`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const H = "extends SceneTree\n\n";

async function diags(source: string): Promise<string[]> {
  return analyze(lower(await parseSource(source))).map((d) => d.message);
}

/** `[面, 名, 位, 量过的那一元数, 期望型, 两句都发的 kind, 只发 B 式的 kind, 引擎放行的 kind]` */
const T: Array<[string, string, number, number, string, string[], string[], string[]]> = [
  ["Array", "append", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "count", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "erase", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "fill", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "get", 1, 1, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["Array", "has", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "is_same_typed", 1, 1, "Array", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Dictionary", "Callable"], ["Array"]],
  ["Array", "push_back", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["Array", "push_front", 1, 1, "", [], [], ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null", "Array", "Dictionary", "Callable"]],
  ["String", "chr", 1, 1, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "containsn", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "filecasecmp_to", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "filenocasecmp_to", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "get_slice_count", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "humanize_size", 1, 1, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "indent", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "is_subsequence_ofn", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "is_subsequence_of", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "lpad", 1, 2, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "lpad", 2, 2, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "lstrip", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "matchn", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "match", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "naturalcasecmp_to", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "naturalnocasecmp_to", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "nocasecmp_to", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "num_int64", 1, 3, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_int64", 2, 3, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_int64", 3, 3, "bool", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_scientific", 1, 1, "float", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_uint64", 1, 3, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_uint64", 2, 3, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num_uint64", 3, 3, "bool", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num", 1, 2, "float", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "num", 2, 2, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "pad_decimals", 1, 1, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "path_join", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "rpad", 1, 2, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "rpad", 2, 2, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "rsplit", 1, 3, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "rsplit", 2, 3, "bool", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "rsplit", 3, 3, "int", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "rstrip", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "split_floats", 1, 2, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "split_floats", 2, 2, "bool", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
  ["String", "trim_prefix", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "trim_suffix", 1, 1, "String", ["Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "bool", "float", "int", "null"], ["Array", "Dictionary", "Callable"], ["NodePath", "String", "StringName"]],
  ["String", "xml_escape", 1, 1, "bool", ["Color", "NodePath", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "null"], ["Array", "Dictionary", "Callable"], ["bool", "float", "int"]],
];

const KIND_EXPR: Record<string, string> = {
  Color: "Color(1, 2, 3, 4)", NodePath: '^"ab"', String: '"s"', StringName: '&"sn"',
  Vector2: "Vector2(1, 2)", Vector2i: "Vector2i(1, 2)", Vector3: "Vector3(1, 2, 3)", Vector3i: "Vector3i(1, 2, 3)",
  bool: "true", float: "1.5", int: "1", null: "null", Array: "[1]", Dictionary: '{"k": 1}',
  Callable: "func(): return true",
};
const FILL: Record<string, string> = { String: '"x"', int: "1", bool: "true", float: "1.5", Array: "[]", Dictionary: "{}", Callable: "func(): return true" };
const WANT = new Map<string, string>();
for (const [face, name, pos, , want] of T) if (want !== "") WANT.set(`${face}.${name}|${String(pos)}`, want);

/** 其余位填「该位被放行过的形」—— 那一位的量数结果不在本门，但它先把句子抢走就不是本门要证的形状 */
const call = (face: string, name: string, pos: number, arity: number, kind: string): string => {
  const args: string[] = [];
  for (let i = 1; i <= arity; i++) {
    if (i === pos) args.push(KIND_EXPR[kind] as string);
    else args.push(FILL[WANT.get(`${face}.${name}|${String(i)}` as string) ?? "1"]);
  }
  return `	${face === "Array" ? "a" : "s"}.${name}(${args.join(", ")})`;
};
const A = (kind: string, want: string): string => `Cannot pass a value of type "${kind}" as "${want}".`;
const B = (name: string, pos: number, kind: string, want: string): string =>
  `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "${kind}".`;

describe("48 位逐 kind 钉：两句 / 只 B 式 / 放行", () => {
  it("720 格全钉住", async () => {
    for (const [face, name, pos, arity, wantType, both, onlyB, accepted] of T) {
      for (const k of [...both, ...onlyB, ...accepted]) {
        const source = `${H}func _initialize():\n\tvar a = [1, 2, 3]\n\tvar s = "ab/cd/e"\n${call(face, name, pos, arity, k)}\n\tquit()\n`;
        const wantMsgs = both.includes(k) ? [A(k, wantType), B(name, pos, k, wantType)] : onlyB.includes(k) ? [B(name, pos, k, wantType)] : [];
        eq("382", `${face}.${name} 第${String(pos)}位给 ${k}`, await diags(source), wantMsgs);
      }
    }
  });
});
