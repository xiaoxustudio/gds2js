/** Callable 面的解析期元数两句（S655，读数 `tmp/probe655/{C_ann,C_ctor,C_infer,Z_*}.gd` 三十六格：三种接收者形状 × 十二名，外加八支零实参名）。
 *  与 Signal 那一族正相反：**这一面两向都开口**（`bindv()` 给 `Too few`、`bindv([1], 2)` 给 `Too many`），三形读数一字一样。
 *  病灶：此前三种接收者我们一句都不发，`c.bindv()` 这类要到运行期才撞上 —— 引擎是解析期拦死、整脚本不跑。 */
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const CB = 'Callable(H.new(), "m")';
const HEAD = 'extends SceneTree\n\nclass H:\n\textends RefCounted\n\n\tfunc m(x):\n\t\treturn x\n\nfunc _initialize():\n';
/** 三种接收者形状：标注、由构造式推断、构造式直接当接收者。 */
const RECV: Record<string, string> = {
  标注: `\tvar c: Callable = ${CB}\n\tprint("S|", c.%C%)\n`,
  推断: `\tvar c = ${CB}\n\tprint("S|", c.%C%)\n`,
  构造式: `\tprint("S|", ${CB}.%C%)\n`,
};

const msgs = async (call: string, shape: string): Promise<string[]> => {
  const source = `${HEAD}${RECV[shape]?.replace("%C%", call) ?? call}\tquit()\n`;
  return analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
};

const few = (n: string, min: number, got: number): string => `Too few arguments for "${n}()" call. Expected at least ${String(min)} but received ${String(got)}.`;
const many = (n: string, max: number, got: number): string => `Too many arguments for "${n}()" call. Expected at most ${String(max)} but received ${String(got)}.`;
const VOID = (n: string): string => `Cannot get return value of call to "${n}()" because it returns "void".`;

const BOTH: Array<[string, string]> = [
  ["bindv()", few("bindv", 1, 0)],
  ["bindv([1], 2)", many("bindv", 1, 2)],
  ["callv()", few("callv", 1, 0)],
  ["callv([1], 2)", many("callv", 1, 2)],
  ["unbind()", few("unbind", 1, 0)],
  ["unbind(1, 2)", many("unbind", 1, 2)],
  ["create(1)", few("create", 2, 1)],
  ["get_method(1)", many("get_method", 0, 1)],
  ["is_null(1)", many("is_null", 0, 1)],
  ["hash(1)", many("hash", 0, 1)],
  ["get_argument_count(1)", many("get_argument_count", 0, 1)],
  ["get_object(1)", many("get_object", 0, 1)],
  ["get_bound_arguments(1)", many("get_bound_arguments", 0, 1)],
  ["get_unbound_arguments_count(1)", many("get_unbound_arguments_count", 0, 1)],
  ["is_valid(1)", many("is_valid", 0, 1)],

];

describe("analyze · Callable 面的解析期元数两句", () => {
  for (const shape of Object.keys(RECV)) {
    it.each(BOTH)("%s 在" + shape + "接收者上给引擎那一句", async (call, want) => {
      expect(await msgs(call, shape), `${shape} · ${call}`).toEqual([want]);
    });
  }

  it("create(1, 2, 3) 的三句里元数那句排在最前", async () => {
    const got = await msgs("create(1, 2, 3)", "标注");
    expect(got[0], got.join(" / ")).toBe(many("create", 2, 3));
  });

  it("vararg 那三支不过界：bind(1) 与 call(1) 一句不发", async () => {
    expect(await msgs("bind(1)", "标注"), "bind(1)").toEqual([]);
    expect(await msgs("call(1)", "标注"), "call(1)").toEqual([]);
  });

  it("rpc_id() 先发缺元数、再发取值 void", async () => {
    expect(await msgs("rpc_id()", "标注")).toEqual([few("rpc_id", 1, 0), VOID("rpc_id")]);
  });

  it("rpc() 与 call_deferred(1) 取值那一句（S655 的 Z_rpc）", async () => {
    expect(await msgs("rpc()", "标注")).toEqual([VOID("rpc")]);
    expect(await msgs("call_deferred(1)", "标注")).toEqual([VOID("call_deferred")]);
  });

  it("丢值位置（语句形）同句", async () => {
    const source = `${HEAD}\tvar c: Callable = ${CB}\n\tc.bindv()\n\tquit()\n`;
    const at = source.split("\n").indexOf("\tc.bindv()") + 1;
    const got = analyze(lower(await parseSource(source))).diagnostics;
    expect(got.map((d) => `${String(d.loc?.line)}|${d.message}`)).toEqual([`${String(at)}|${few("bindv", 1, 0)}`]);
  });

  it("标注 Variant 的 Callable 接收者仍从解析期放行（S646 的口径不动）", async () => {
    const source = `${HEAD}\tvar c: Variant = Callable()\n\tc.bindv()\n\tquit()\n`;
    expect(analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message)).toEqual([]);
  });
});
