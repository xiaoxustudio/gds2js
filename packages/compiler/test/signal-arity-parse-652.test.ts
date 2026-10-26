/** Signal 面的解析期元数**上界**（S652，读数 `tmp/probe653/P_*.gd` 十二格 + `G_ann.gd`，一名一名过裁判）。
 *  这一族只有上界：`sig.connect()` / `sig.disconnect()` / `sig.is_connected()` 零实参三格引擎都给了 `done`，
 *  所以下界一句都不发 —— 把 `Too few` 补上就是把引擎没说的话说成引擎说的。
 *  病灶：`sig.disconnect(cb, 1)` 此前一路放行到运行期安静给 nil（引擎是解析期拦死、整脚本不跑）。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const HEAD = 'extends SceneTree\n\nsignal sig(a, b)\n\nclass H:\n\textends RefCounted\n\n\tfunc m(x):\n\t\treturn x\n\nfunc _initialize():\n';

const msgs = async (body: string): Promise<string[]> => {
  const source = `${HEAD}${body}\n\tquit()\n`;
  return analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
};

const say = (name: string, max: number, got: number): string =>
  `Too many arguments for "${name}()" call. Expected at most ${String(max)} but received ${String(got)}.`;

const CB = 'Callable(H.new(), "m")';

const OVER: Array<[string, string, string]> = [
  ["connect 三支", `sig.connect(${CB}, 1, 2)`, say("connect", 2, 3)],
  ["disconnect 两支", `sig.disconnect(${CB}, 1)`, say("disconnect", 1, 2)],
  ["is_connected 两支", `sig.is_connected(${CB}, 1)`, say("is_connected", 1, 2)],
  ["get_name 一支", "sig.get_name(1)", say("get_name", 0, 1)],
  ["get_object 一支", "sig.get_object(1)", say("get_object", 0, 1)],
  ["get_object_id 一支", "sig.get_object_id(1)", say("get_object_id", 0, 1)],
  ["get_connections 一支", "sig.get_connections(1)", say("get_connections", 0, 1)],
  ["has_connections 一支", "sig.has_connections(1)", say("has_connections", 0, 1)],
  ["is_null 一支", "sig.is_null(1)", say("is_null", 0, 1)],
];

describe("analyze · Signal 面的解析期元数上界", () => {
  it.each(OVER)("%s 给引擎那一句", async (_name, call, expected) => {
    const got = await msgs(`\t${call}\n`);
    expect(got, `源：\n${call}`).toEqual([expected]);
  });

  it("零实参那三格引擎照跑，我们一句不发", async () => {
    for (const call of ["sig.connect()", "sig.disconnect()", "sig.is_connected()"]) {
      expect(await msgs(`\t${call}\n`), call).toEqual([]);
    }
  });

  it("emit 是 vararg：零到三支都放过", async () => {
    for (const call of ["sig.emit()", "sig.emit(1)", "sig.emit(1, 2)", "sig.emit(1, 2, 3)"]) {
      expect(await msgs(`\t${call}\n`), call).toEqual([]);
    }
  });

  it("合规的 connect 两支（带 flags）与 is_connected / disconnect 一支不发", async () => {
    expect(await msgs(`\tsig.connect(${CB}, 1)\n\tsig.is_connected(${CB})\n\tsig.disconnect(${CB})\n`)).toEqual([]);
  });

  it("标注 Signal 的变量接收者同一句", async () => {
    expect(await msgs("\tvar g: Signal = sig\n\tg.get_name(1)\n")).toEqual([say("get_name", 0, 1)]);
  });

  it("越界那句排在取值 void 那句之前", async () => {
    expect(await msgs("\tvar v = sig.disconnect(1, 2)\n")).toEqual([
      say("disconnect", 1, 2),
      'Cannot get return value of call to "disconnect()" because it returns "void".',
    ]);
  });

  it("行号与引擎同格", async () => {
    const source = `${HEAD}\tsig.has_connections(1)\n\tquit()\n`;
    const at = source.split("\n").indexOf("\tsig.has_connections(1)") + 1;
    const got = analyze(lower(await parseSource(source))).diagnostics.map((d) => `${String(d.loc?.line)}|${d.message}`);
    expect(got).toEqual([`${String(at)}|${say("has_connections", 0, 1)}`]);
  });
});
