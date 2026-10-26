/**
 * 取值记号按模块分主（§6 第 61 条结清）：三张记号表是进程内累积的，旧口径只按 `名@行:列` 记，
 * 于是**两份文件在同名同位置**会互相抢记号 —— 一份里 `quit` 是宿主 Callable，另一份里同位置的 `quit`
 * 是局部形参，发射器先撞记号就把形参发成了 Callable（错值）。引擎那边每份脚本各自编译，没有这种共享。
 * 下面四格是两对撞车源，正序反序各一遍。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const analysis = analyze(ir);
  return emitModule(ir, OPTS, analysis);
}

// 宿主裸名那一对：两行的 `quit` 都在 6:8，一份是取值、一份是 setter 的形参
const HOST_READ = "extends SceneTree\n\nvar s = 0\n\nvar thing: Variant:\n\tset(v):\n\t\tprint(quit)\n\nfunc _initialize():\n\tquit()\n";
const HOST_SHADOW = "extends SceneTree\n\nvar s = 0\n\nvar thing: Variant:\n\tset(quit):\n\t\tprint(quit)\n\nfunc _initialize():\n\tquit()\n";
// 全局函数名那一对：两行的 `abs` 都在 3:15，一份是取值、一份是形参
const GLOBAL_READ = "func f():\n\tvar c: Variant = abs\n\tprint(c)\n";
const GLOBAL_SHADOW = "func f(abs):\n\tvar c: Variant = abs\n\tprint(c)\n";

describe("撞名撞位置的两份模块各发各的", () => {
  it("宿主名：先取值份再形参份", async () => {
    const a = await compile(HOST_READ);
    const b = await compile(HOST_SHADOW);
    eq("61", "取值份发 Callable", a.includes('methodCallable(rt.V.object(this), "quit")'), true);
    eq("61", "形参份不被抢记号", b.includes("methodCallable"), false);
  });

  it("宿主名：先形参份再取值份", async () => {
    const b = await compile(HOST_SHADOW);
    const a = await compile(HOST_READ);
    eq("61", "形参份发裸名", b.includes("methodCallable"), false);
    eq("61", "取值份照样发 Callable", a.includes('methodCallable(rt.V.object(this), "quit")'), true);
  });

  it("全局函数名：先取值份再形参份", async () => {
    const a = await compile(GLOBAL_READ);
    const b = await compile(GLOBAL_SHADOW);
    eq("61", "取值份发 globalCallable", a.includes('rt.globalCallable("abs")'), true);
    eq("61", "形参份不被抢记号", b.includes('rt.globalCallable("abs")'), false);
  });

  it("全局函数名：先形参份再取值份", async () => {
    const b = await compile(GLOBAL_SHADOW);
    const a = await compile(GLOBAL_READ);
    eq("61", "形参份发裸名", b.includes('rt.globalCallable("abs")'), false);
    eq("61", "取值份照样发 globalCallable", a.includes('rt.globalCallable("abs")'), true);
  });
});
