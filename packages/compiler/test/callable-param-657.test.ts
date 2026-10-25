/** Callable 面的**形参型**两句（S657，读数 `tmp/probe657/r657.mts` 二十六格：标注与构造式推断两形 × 十三调用）。
 *  排序照引擎：元数那句在前，`Cannot pass a value of type` 与 `Invalid argument for` 两句在后。
 *  只认字面量实参：命名实参（`var w: int` 之后 `c.unbind(w)`）引擎发哪一句没量过，不收。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const CB = 'Callable(H.new(), "m")';
const HEAD = 'extends SceneTree\n\nclass H:\n\textends RefCounted\n\n\tfunc m(x):\n\t\treturn x\n\nfunc _initialize():\n';
const SEEDS: Array<[string, string]> = [
  ["标注", `\tvar c: Callable = ${CB}\n\tprint("V|", c.%C%)\n`],
  ["推断", `\tvar c = ${CB}\n\tprint("V|", c.%C%)\n`],
];
const ANN_TPL = SEEDS[0] === undefined ? "" : SEEDS[0][1];

const msgs = async (tpl: string, call: string): Promise<string[]> => {
  const source = HEAD + tpl.replace("%C%", call) + "\tquit()\n";
  return analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
};

const pass = (src: string, want: string): string => `Cannot pass a value of type "${src}" as "${want}".`;
const badArg = (m: string, pos: number, want: string, src: string): string =>
  `Invalid argument for "${m}()" function: argument ${String(pos)} should be "${want}" but is "${src}".`;

const PARAM: Array<[string, string[]]> = [
  ["create(1, 2)", [pass("int", "StringName"), badArg("create", 2, "StringName", "int")]],
  ["create(true, false)", [pass("bool", "StringName"), badArg("create", 2, "StringName", "bool")]],
  ["create(null, Vector2i(1, 2))", [pass("Vector2i", "StringName"), badArg("create", 2, "StringName", "Vector2i")]],
  ["create([1], 2)", [pass("int", "StringName"), badArg("create", 2, "StringName", "int")]],
  ["bindv(1)", [pass("int", "Array"), badArg("bindv", 1, "Array", "int")]],
  ['callv(&"x")', [pass("StringName", "Array"), badArg("callv", 1, "Array", "StringName")]],
  ['unbind(&"x")', [pass("StringName", "int"), badArg("unbind", 1, "int", "StringName")]],
];

const ACCEPT = ['create(1, &"m")', 'create(1, "m")', 'create("a", "b")', 'create(NodePath("a/b"), &"m")'];

describe("analyze · Callable 面的形参型两句", () => {
  for (const [label, tpl] of SEEDS) {
    it.each(PARAM)(`%s 在${label}接收者上两句齐发`, async (call, want) => {
      expect(await msgs(tpl, call), `${label} · ${call}`).toEqual(want);
    });
    it.each(ACCEPT)(`%s 在${label}接收者上被接受，一句不发`, async (call) => {
      expect(await msgs(tpl, call), `${label} · ${call}`).toEqual([]);
    });
  }

  it("create(1, 2, 3) 三句：元数在前、形参两句在后", async () => {
    expect(await msgs(ANN_TPL, "create(1, 2, 3)")).toEqual([
      'Too many arguments for "create()" call. Expected at most 2 but received 3.',
      pass("int", "StringName"),
      badArg("create", 2, "StringName", "int"),
    ]);
  });

  it("create(1) 那一格只发缺元数，不追形参句", async () => {
    expect(await msgs(ANN_TPL, "create(1)")).toEqual([
      'Too few arguments for "create()" call. Expected at least 2 but received 1.',
    ]);
  });
});
