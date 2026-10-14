/**
 * bool 比较一族的**解析期**那一层（S361）：静态已知的两支 bool 比 `<=` / `>=`，引擎在解析期就拒，而且是**两句话**。
 * 尺 `tmp/probe-argtype/fold36.mts`（一格一份脚本一次 spawn —— 一句解析期报错整份作废），读数 `tmp/probe-argtype/boolfamily.txt`。
 * ① 两支都是字面量：`Invalid operands to operator <=, bool and bool.`
 * ② 掺进一次「声明成 bool」的表达式（局部 `var a: bool` / 模块级 `var flag: bool` / 形参 `x: bool`）：`Invalid operands "bool" and "bool" for "<=" operator.`
 * `<` / `>` 不在内（那两支配符对 bool 合式，运行时 false 在前）；`var a = false` 那种**推断**来的局部、装箱 `Variant`、数组元素
 * 引擎都不当静态 bool，改走运行期那一句 —— 所以这里一律「无诊断」，那句由 `packages/runtime/test/bool-compare-family.test.ts` 钉。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function firstDiag(src: string): Promise<string> {
  const diags = analyze(lower(await parseSource(src)));
  return diags.length === 0 ? "无诊断" : `${diags[0]!.code}: ${diags[0]!.message}`;
}

const BODY = (lines: string[]): string => `extends SceneTree\n\nfunc _initialize():\n${lines.map((l) => `\t${l}`).join("\n")}\n\tquit()\n`;

const FORM_A = "bool-ordering: Invalid operands to operator %OP%, bool and bool.";
const FORM_B = 'bool-ordering: Invalid operands "bool" and "bool" for "%OP%" operator.';

describe("compiler · 静态 bool 的 <= 与 >=", () => {
  for (const [op, want] of [["<=", FORM_A], [">=", FORM_A]] as const) {
    it(`两支字面量 ${op} 是 A 式`, async () => {
      eq("364", `false ${op} true`, await firstDiag(BODY([`print(false ${op} true)`])), want.replace("%OP%", op));
    });
  }

  it("同值两支字面量也一样拒（不是「相等就放过」）", async () => {
    eq("364", "false <= false", await firstDiag(BODY(["print(false <= false)"])), FORM_A.replace("%OP%", "<="));
    eq("364", "true >= true", await firstDiag(BODY(["print(true >= true)"])), FORM_A.replace("%OP%", ">="));
  });

  for (const [op, want] of [["<=", FORM_B], [">=", FORM_B]] as const) {
    it(`定型局部 ${op} 字面量是 B 式`, async () => {
      eq("364", `a: bool ${op} true`, await firstDiag(BODY([`var a: bool = false`, `print(a ${op} true)`])), want.replace("%OP%", op));
      eq("364", `false ${op} a: bool`, await firstDiag(BODY([`var a: bool = false`, `print(false ${op} a)`])), want.replace("%OP%", op));
    });
  }

  it("模块级 `var flag: bool` 与形参 `x: bool` 同样是 B 式", async () => {
    eq(
      "364",
      "模块级 flag <= true",
      await firstDiag("var flag: bool = false\n\nfunc _initialize():\n\tprint(flag <= true)\n\tquit()\n"),
      FORM_B.replace("%OP%", "<="),
    );
    eq(
      "364",
      "形参 x <= y",
      await firstDiag("extends SceneTree\n\nfunc f(x: bool, y: bool):\n\tprint(x <= y)\n\nfunc _initialize():\n\tf(false, true)\n\tquit()\n"),
      FORM_B.replace("%OP%", "<="),
    );
  });

  it("`<` 与 `>` 对 bool 合式：一句都不报", async () => {
    eq("364", "false < true", await firstDiag(BODY(["print(false < true)"])), "无诊断");
    eq("364", "a: bool < true", await firstDiag(BODY(["var a: bool = false", "print(a < true)"])), "无诊断");
    eq("364", "a: bool > true", await firstDiag(BODY(["var a: bool = false", "print(a > true)"])), "无诊断");
  });

  it("推断来的局部 / 装箱 Variant / 数组元素：引擎不当静态 bool，这里也一声不出", async () => {    eq("364", "var a = false 之后 a <= b", await firstDiag(BODY(["var a = false", "var b = true", "print(a <= b)"])), "无诊断");
    eq("364", "var a: Variant = false 之后 a <= b", await firstDiag(BODY(["var a: Variant = false", "var b: Variant = true", "print(a <= b)"])), "无诊断");
    eq("364", "x[0] <= x[1]", await firstDiag(BODY(["var x = [false, true]", "print(x[0] <= x[1])"])), "无诊断");
  });

  it("int 对 int 的 <= 照旧放行（这一族只说混合形）", async () => {
    eq("364", "1 <= 2", await firstDiag(BODY(["print(1 <= 2)"])), "无诊断");
    // S394 的矩阵量回来：混合 bool 与 int 引擎在解析期就拒，旧格「不归这条管」是当时没量的猜测
    eq("394", "混合 int 与 bool 的 <= 也拒", await firstDiag(BODY(["print(1 <= true)"])), 'op-pair: Invalid operands to operator <=, int and bool.');
  });

  it("拒掉的格子不发产物（编译门按预期报错记账）", async () => {
    const ir = lower(await parseSource(BODY(["print(false <= true)"])));
    eq("364", "分析层有诊断", analyze(ir).length > 0, true);
    eq("364", "照样能发（拒的是分析层，不是发射层）", typeof emitModule(ir, OPTS), "string");
  });

  it("名字踩全局那一族四形：引擎与出货都放过（S394，读数 compare55）", async () => {
    const H = "extends SceneTree\n\n";
    const TAIL = "\nfunc _initialize():\n\tquit()\n";
    eq("394", "for quit in …", await firstDiag(`${H}func f():\n\tfor quit in [1, 2]:\n\t\tprint(quit)\n${TAIL}`), "无诊断");
    eq("394", "lambda 形参叫 quit", await firstDiag(`${H}func f():\n\tvar g = func(quit): return quit\n\tprint(g.call(3))\n${TAIL}`), "无诊断");
    eq("394", "match 手臂绑定叫 quit", await firstDiag(`${H}func f(x):\n\tmatch x:\n\t\tvar quit:\n\t\t\tprint(quit)\n${TAIL}`), "无诊断");
    eq("394", "普通 var 叫 quit", await firstDiag(`${H}func f():\n\tvar quit = 3\n\tprint(quit)\n${TAIL}`), "无诊断");
  });
});
