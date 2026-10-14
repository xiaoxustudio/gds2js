/**
 * 宿主基类（`extends SceneTree`）的方法名**裸当值用**（S358）：分析器在根类的实例方法里放行，发射器发真的 Callable。
 * 读数 `tmp/probe-argtype/{implicit-callable,host-names,implicit-edge}.txt`，尺 `{fold28,fold29,fold30}.mts`
 * （fold29 / fold30 是一格一份脚本一次 spawn —— 解析期报错会整份脚本作废，混在一起分不出是谁）。
 * 端到端的取值、打印与调用钉在语料 `corpus/cases/361-implicit-callable-value/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const diags = analyze(ir);
  if (diags.length > 0) return `diag:${diags[0]!.code}`;
  return emitModule(ir, OPTS);
}

const HOST_BODY = (lines: string[]): string =>
  `extends SceneTree\n\nfunc _initialize():\n${lines.map((l) => `\t${l}`).join("\n")}\n\tquit()\n`;
const READ = (name: string): string => HOST_BODY([`var c: Variant = ${name}`, `print(c)`]);

/** 23 个名字里实测给 Callable 的那 15 支（`typeof` 25、打印 `SceneTree(<文件>)::<名>`）。 */
const ACCEPTED = [
  "quit",
  "create_timer",
  "call",
  "call_deferred",
  "set",
  "get",
  "has_method",
  "get_class",
  "connect",
  "disconnect",
  "emit_signal",
  "notification",
  "set_meta",
  "get_meta",
  "free",
];
/** 同一次扫里引擎给 `Identifier "…" not declared` 的三支：`quit_and_ide_debug` / `queue_free` 不在这条链上，`process_mode` 是别人的属性。 */
const REFUSED = ["quit_and_ide_debug", "queue_free", "process_mode"];

describe("compiler · 宿主基类方法名裸当值用", () => {
  for (const name of ACCEPTED) {
    it(`${name} 取值放行并发出 methodCallable`, async () => {
      const out = await compile(READ(name));
      eq("361", `${name} 不报未声明`, out.startsWith("diag:") ? out : "无", "无");
      eq("361", `${name} 发的是 Callable 盒子`, out.includes(`rt.methodCallable(rt.V.object(this), "${name}")`), true);
    });
  }

  for (const name of REFUSED) {
    it(`${name} 照旧拦（引擎同拒）`, async () => {
      eq("361", `${name} 解析期拒`, await compile(READ(name)), "diag:undeclared-identifier");
    });
  }

  it("属性读数那一形 Tier 1 不接：引擎给值而我们照旧拦", async () => {
    // 实测 `root` 给 typeof 24 的对象、`paused` 给 false —— 那是引擎 API，不在 Tier 1 的面上
    eq("361", "root 是属性不是方法", await compile(READ("root")), "diag:undeclared-identifier");
    eq("361", "paused 是属性不是方法", await compile(READ("paused")), "diag:undeclared-identifier");
  });

  it("内部类里同名照旧拦（实测引擎也拒）", async () => {
    const src = "extends SceneTree\n\nclass Inner:\n\tfunc f():\n\t\tvar c: Variant = quit\n\t\tprint(c)\n\nfunc _initialize():\n\tquit()\n";
    eq("361", "内部类里的 quit", await compile(src), "diag:undeclared-identifier");
  });

  it("不写 extends 的脚本里 quit 照旧拦（实测引擎也拒）", async () => {
    const src = "func f():\n\tvar c: Variant = quit\n\tprint(c)\n";
    eq("361", "非宿主脚本里的 quit", await compile(src), "diag:undeclared-identifier");
  });

  it("静态方法里那一形没量过，所以不认", async () => {
    const src = "extends SceneTree\n\nstatic func f():\n\tvar c: Variant = quit\n\tprint(c)\n\nfunc _initialize():\n\tquit()\n";
    eq("361", "静态方法里的 quit", await compile(src), "diag:undeclared-identifier");
  });

  it("局部变量与形参盖住同名：取到的是变量而不是 Callable", async () => {
    const local = await compile(HOST_BODY(["var quit: Variant = 1", "var c: Variant = quit", "print(c)"]));
    eq("361", "局部变量优先", local.includes("methodCallable"), false);
    const param = await compile("extends SceneTree\n\nfunc take2(quit):\n\tvar c: Variant = quit\n\tprint(c)\n\nfunc _initialize():\n\tquit()\n");
    eq("361", "形参优先", param.includes("methodCallable"), false);
  });

  it("脚本自己声明的同名方法走原来那支 MODULE_FUNCS，不重复发盒子", async () => {
    const out = await compile("extends SceneTree\n\nfunc quit():\n\tprint(\"x\")\n\nfunc _initialize():\n\tvar c: Variant = quit\n\tprint(c)\n\tquit()\n");
    eq("361", "同名脚本方法仍按本模块方法发", out.includes('rt.methodCallable(rt.V.object(this), "quit")'), true);
  });
});
