// cubic / bezier 四支的**名字实参**参与「第一处命中」扫描（S662，读数 `tmp/probe664` 十二格两侧对读）。
// 引擎在这一族按槽位升序只推第一处：`var s: String` 放首位就报 argument 1（后面三支同为 String 也不再推），
// 而此前这一位 literalTypeName 交不出型就整条跳过 —— 于是报成下一支字面量的 argument 2，或在另外三支一句不发拖到运行期。
import { describe, expect, it } from "vitest";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const head = "extends SceneTree\n\nfunc _initialize():\n";
const say = (name: string, pos: number, want: string, got: string): string =>
  `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "${got}".`;


const msgs = async (decl: string, call: string): Promise<string[]> => {
  const source = `${head}${decl}\tprint("V|", ${call})\n\tquit()\n`;
  return analyze(lower(await parseSource(source))).diagnostics.map((d) => d.message);
};

const SDECL = "\tvar s: String = \"a\"\n";
const VDECL = "\tvar v: Vector2 = Vector2(1, 1)\n";

describe("analyze · cubic/bezier 的名字实参位", () => {
  it("首位 String：四支都报 argument 1，且只报这一句", async () => {
    expect(await msgs(SDECL, 'cubic_interpolate(s, "b", "c", "d", 0.5)')).toEqual([say("cubic_interpolate", 1, "float", "String")]);
    expect(await msgs(SDECL, "bezier_interpolate(s, 2.0, 3.0, 4.0, 0.5)")).toEqual([say("bezier_interpolate", 1, "float", "String")]);
    expect(await msgs(SDECL, "bezier_derivative(s, 2.0, 3.0, 4.0, 0.5)")).toEqual([say("bezier_derivative", 1, "float", "String")]);
    expect(await msgs(SDECL, "cubic_interpolate_in_time(s, 1.0, 2.0, 3.0, 0.1, 0.2, 0.3, 0.5)")).toEqual([say("cubic_interpolate_in_time", 1, "float", "String")]);
  });

  it("次位 String：报 argument 2（第一处命中随槽位升序）", async () => {
    expect(await msgs(SDECL, "cubic_interpolate(1.0, s, 3.0, 4.0, 0.5)")).toEqual([say("cubic_interpolate", 2, "float", "String")]);
  });

  it("首位 Vector2 名字同样报第一处", async () => {
    expect(await msgs(VDECL, "bezier_derivative(v, 2.0, 3.0, 4.0, 0.5)")).toEqual([say("bezier_derivative", 1, "float", "Vector2")]);
  });

  it("int / float 名字全合法时一句不发（实测给值 1.25）", async () => {
    expect(await msgs("\tvar a: int = 1\n", "cubic_interpolate(a, 2, 3, 4, 0.5)")).toEqual([]);
    expect(await msgs("\tvar f: float = 1.0\n", "cubic_interpolate(f, 2.0, 3.0, 4.0, 0.5)")).toEqual([]);
  });

  it("支数不足那族仍是元数那句在前（本轮没动它）", async () => {
    expect(await msgs(SDECL, 'cubic_interpolate(s, "b", "c", "d")')).toEqual([
      'Too few arguments for "cubic_interpolate()" call. Expected at least 5 but received 4.',
    ]);
  });

  it("同族那几支 clamp / lerp / wrap 不在这张名单，名字实参照旧不查（红线不动）", async () => {
    expect(await msgs(SDECL, "clamp(s, 0, 2)")).toEqual([]);
  });
});
