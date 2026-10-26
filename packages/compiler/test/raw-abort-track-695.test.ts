// 解箱轨（裸 ABI）接不住「运行期作废」那个值（S695，尺 `tmp/probe718/{u,v,x,z}.gd` + 语料 445）：
// 引擎里无标注的函数体一旦作废，交回调用点的是 **Nil**，而裸轨的签名是 `number` / `string`，装不下它；
// 于是原来发的是 `rt.V.int(this.div0(1))` 配一句 `return rt.V.nil();` 的接住点 —— 盒子被当成 int 再箱一次，跑成
// `[int64-out-of-range] 整数 [object Object] 超出 2^53` 并退 1，引擎那边却是 `D <null>` 退 0。
// 这一支把「体里可能作废」的函数整个请出裸轨（int 的 `/`、`%` 除数不是非零字面量那一族），
// 作废边界回到装箱轨：无标注给 `rt.V.nil()`、标注了返回型的给该型默认值；裸轨那支不再发接住点（它只剩 int64 越界那条未实现的响亮拒，原样上抛比咽下去诚实）。
import { describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };
const H = "extends SceneTree\n\n";

async function emitted(body: string, call: string): Promise<string> {
  const pad = (l: string): string => `\t${l}`;
  const src = `${H}${body}\nfunc _initialize():\n${call.split("\n").map(pad).join("\n")}\n\tquit()\n`;
  const ir = lower(await parseSource(src));
  const analysis = analyze(ir);
  const diags = analysis.diagnostics;
  if (diags.length > 0) throw new Error(`语义拦下：${diags[0]!.message}`);
  return emitModule(ir, OPTS, analysis);
}

/** 那一支从签名到收尾的整截产物。 */
function funcText(code: string, name: string): string {
  const i = code.indexOf(`\n  ${name}(`);
  if (i < 0) return "没找着那一支";
  const j = code.indexOf("\n  }\n", i);
  return code.slice(i + 1, j < 0 ? code.length : j);
}

const sigOf = (code: string, name: string): string => (funcText(code, name).split("\n")[0] ?? "").replace(/^ {2}/, "").replace(/ \{$/, "");

const DIV = "func d(z):\n\tvar z2 = 0\n\treturn 100 / z2\n";

describe("发射 · 会作废的函数整个退出解箱轨（S695）", () => {
  it("int 除数是运行期值：签名回到 rt.Variant，调用点不再二次装箱", async () => {
    const code = await emitted(DIV, "print(d(1))");
    expect(sigOf(code, "d"), "d 的签名").toBe("d(z: rt.Variant): rt.Variant");
    expect(code, "旧那道把盒子当 int 再箱的发射").not.toContain("rt.V.int(this.d(");
    expect(funcText(code, "d"), "接住点按无标注给 Nil 盒子").toContain("return rt.V.nil();");
  });

  it("运行期取模同判据", async () => {
    const code = await emitted("func m(z):\n\tvar z2 = 0\n\treturn 100 % z2\n", "print(m(1))");
    expect(sigOf(code, "m"), "m 的签名").toBe("m(z: rt.Variant): rt.Variant");
  });

  it("除数是非零字面量：留在解箱轨，且那一支不再发接住点", async () => {
    const code = await emitted("func keep(z):\n\tvar half = 100 / 4\n\treturn half + z\n", "print(keep(3))");
    const f = funcText(code, "keep");
    expect(sigOf(code, "keep"), "keep 的签名").toBe("keep(z: number): number");
    expect(f, "体里还是解箱那条快路").toContain("rt.fast.iDivC(100, 4)");
    expect(f, "裸轨那支没有会作废的引擎错，接住点不发").not.toContain("rt.gdFunctionError");
    expect(f, "帧照样进出").toContain("rt.frameExit(__gd_frame);");
  });

  it("float 除零不作废（给 INF），留在解箱轨", async () => {
    const code = await emitted("func f(z):\n\tvar z2 = 0.0\n\treturn 100.0 / z2\n", "print(f(1.0))");
    expect(sigOf(code, "f"), "f 的签名").toBe("f(z: number): number");
  });

  it("消费作废值的 caller 一起退出解箱轨，一层层往上都是", async () => {
    const body = `${DIV}\nfunc cascade(z):\n\tvar v = d(z)\n\treturn v + 1\n\nfunc top(z):\n\tvar w = cascade(z)\n\treturn w + 2\n`;
    const code = await emitted(body, "print(top(1))");
    expect(sigOf(code, "cascade"), "cascade 的签名").toBe("cascade(z: rt.Variant): rt.Variant");
    expect(sigOf(code, "top"), "top 的签名").toBe("top(z: rt.Variant): rt.Variant");
    expect(funcText(code, "cascade"), "Nil 参与运算交给装箱那支发引擎句").toContain("rt.ops.add(v, rt.V.int(1))");
  });

  it("不作废的 helper 照旧走解箱轨（判据不是把快路一刀切）", async () => {
    const body = "func add2(a, b):\n\treturn a + b\n\nfunc tri(x):\n\tvar y = x * 3\n\tvar z2 = y + x\n\treturn z2\n";
    const code = await emitted(body, "print(add2(1, 2))\nprint(tri(3))");
    expect(sigOf(code, "add2"), "add2 的签名").toBe("add2(a: number, b: number): number");
    expect(sigOf(code, "tri"), "tri 的签名").toBe("tri(x: number): number");
  });
});
