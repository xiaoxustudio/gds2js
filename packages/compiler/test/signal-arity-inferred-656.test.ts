/** `var g = sig` 与 `var g = Signal(sig)` 这两形由初值证出 Signal 面（S656，读数 `tmp/probe656/S_inf_*` / `S_varinit_*` 三十格 + `W_*_valid.gd` 三形分岔）。
 *  引擎对这三形发**同样的元数与取值 void 两句**（同一行），但「找不到成员」那两句只在**裸信号名与标注形**发：
 *  推断形的 `g.is_valid()` 是运行期那句 `Invalid call. Nonexistent function 'is_valid' in base 'Signal'.` —— 所以认面要分档，不能一刀切。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const CB = 'Callable(H.new(), "m")';
const HEAD = 'extends SceneTree\n\nsignal sig(a, b)\n\nclass H:\n\textends RefCounted\n\n\tfunc m(x):\n\t\treturn x\n\nfunc _initialize():\n';
const SEEDS: Array<[string, string]> = [
  ["初值是裸信号名", "\tvar g = sig\n"],
  ["初值是 Signal 构造式", "\tvar g = Signal(sig)\n"],
  ["标注形（旧账已通）", "\tvar g: Signal = sig\n"],
];

const msgs = async (seed: string, call: string): Promise<string[]> => {
  const source = `${HEAD}${seed}\tprint("V|", ${call})\n\tquit()\n`;
  return analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
};

const many = (n: string, max: number, got: number): string =>
  `Too many arguments for "${n}()" call. Expected at most ${String(max)} but received ${String(got)}.`;
const VOID = (n: string): string => `Cannot get return value of call to "${n}()" because it returns "void".`;

const OVER: Array<[string, string, string]> = [
  ["g.get_name(1)", "get_name", many("get_name", 0, 1)],
  ["g.get_object(1)", "get_object", many("get_object", 0, 1)],
  ["g.is_null(1)", "is_null", many("is_null", 0, 1)],
  ["g.has_connections(1)", "has_connections", many("has_connections", 0, 1)],
  [`g.connect(${CB}, 1, 2)`, "connect", many("connect", 2, 3)],
  [`g.is_connected(${CB}, 1)`, "is_connected", many("is_connected", 1, 2)],
];

describe("analyze · 由初值证出的 Signal 面", () => {
  for (const [label, seed] of SEEDS) {
    it.each(OVER)(`${label}：%s 给引擎那一句`, async (call, _n, want) => {
      expect(await msgs(seed, call), call).toEqual([want]);
    });
  }

  it("合规实参一句不发", async () => {
    for (const [, seed] of SEEDS) {
      expect(await msgs(seed, `g.connect(${CB})`), "connect 一支").toEqual([]);
      expect(await msgs(seed, "g.get_name()"), "get_name 零支").toEqual([]);
      expect(await msgs(seed, "g.emit(1, 2, 3)"), "emit 三支").toEqual([VOID("emit")]);
    }
  });

  it("disconnect 两支：元数句排在取值 void 之前", async () => {
    for (const [, seed] of SEEDS) {
      expect(await msgs(seed, `g.disconnect(${CB}, 1)`)).toEqual([many("disconnect", 1, 2), VOID("disconnect")]);
    }
  });

  it("「找不到成员」两句只在裸名与标注形发；推断形放过交回运行期", async () => {
    const pair = ['Cannot find member "is_valid" in base "Signal".', 'Function "is_valid()" not found in base Signal.'];
    expect(await msgs("\tvar g: Signal = sig\n", "g.is_valid()")).toEqual(pair);
    expect(await msgs("", "sig.is_valid()")).toEqual(pair);
    expect(await msgs("\tvar g = sig\n", "g.is_valid()")).toEqual([]);
    expect(await msgs("\tvar g = Signal(sig)\n", "g.is_valid()")).toEqual([]);
  });

  it("行号与引擎同格（初值那一格）", async () => {
    const source = `${HEAD}\tvar g = sig\n\tg.has_connections(1)\n\tquit()\n`;
    const at = source.split("\n").indexOf("\tg.has_connections(1)") + 1;
    const got = analyze(lower(await parseSource(source))).diagnostics;
    expect(got.map((d) => `${String(d.loc?.line)}|${d.message}`)).toEqual([`${String(at)}|${many("has_connections", 0, 1)}`]);
  });
});
