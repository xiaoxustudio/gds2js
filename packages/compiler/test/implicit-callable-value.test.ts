/**
 * 宿主基类（`extends SceneTree`）的方法名**裸当值用**（S358）：分析器在根类的实例方法里放行，发射器发真的 Callable。
 * 读数 `tmp/probe-argtype/{implicit-callable,host-names,implicit-edge}.txt`，尺 `{fold28,fold29,fold30}.mts`
 * （fold29 / fold30 是一格一份脚本一次 spawn —— 解析期报错会整份脚本作废，混在一起分不出是谁）。
 * 端到端的取值、打印与调用钉在语料 `corpus/cases/361-implicit-callable-value/`。
 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { emitModule } from "@gds2js/compiler/emit";
import { analyze } from "@gds2js/compiler/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const OPTS = { runtimeImport: "rt", hostImport: "host" };

async function compile(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const analysis = analyze(ir);
  const diags = analysis.diagnostics;
  if (diags.length > 0) return `diag:${diags[0]!.code}`;
  return emitModule(ir, OPTS, analysis);
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

  it("静态方法里读到宿主名：引擎那句是「不能从静态函数访问非静态变量」", async () => {
    const src = "extends SceneTree\n\nstatic func f():\n\tvar c: Variant = quit\n\tprint(c)\n\nfunc _initialize():\n\tquit()\n";
    eq("361", "静态方法里的 quit", await compile(src), "diag:host-read-in-static");
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

/** 读得到、写不得：这三族名字（全局函数名 / 引擎类名 / 宿主方法名）在目标位上引擎给的是常量那句拒。
 *  没接之前发出来的是 `rt.globalCallable("abs") = rt.V.int(5);` —— 产物直接是非法 JS。
 *  读数 `tmp/probe-argtype/wr1.gd` / `wr2.gd` / `wr3.gd`（`abs = 5`、`print = 5`、`Node = 5`、`quit = 5`、`quit += 5` 同一句；
 *  而 `var quit: Variant = 1` 之后 `quit = 5` 合法给 5，`var abs = 2` 之后同理）。 */
describe("compiler · 能读不能写的那三族名字", () => {
  const WRITE = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n\t${body}\n\tprint("A|ok")\n\tquit()\n`;

  for (const body of ["abs = 5", "print = 5", "typeof = 3", "Node = 5", "quit = 5", "quit += 5", "get_class = 5"]) {
    it(`${body} 解析期拒`, async () => {
      eq("362", body, await compile(WRITE(body)), "diag:const-assign");
    });
  }

  it("类型名兼函数名那 21 支不是常量位：走的是未声明那一句（引擎两句里的后一句）", async () => {
    eq("362", "Callable = 5", await compile(WRITE("Callable = 5")), "diag:undeclared-identifier");
    eq("362", "Vector2 = 1", await compile(WRITE("Vector2 = 1")), "diag:undeclared-identifier");
  });

  it("局部同名可以写（引擎给 5 / 7）", async () => {
    const out = await compile(WRITE('var quit: Variant = 1\n\tquit = 5\n\tprint(quit)'));
    eq("362", "var quit 之后再写合法", out.startsWith("diag:"), false);
    const out2 = await compile(WRITE("var abs = 2\n\tabs = 7\n\tprint(abs)"));
    eq("362", "var abs 之后再写合法", out2.startsWith("diag:"), false);
  });

  it("内部类里看不见宿主那面：那一形仍按未声明拒", async () => {
    const src = "extends SceneTree\n\nclass Inner:\n\tfunc f():\n\t\tquit = 5\n\nfunc _initialize():\n\tquit()\n";
    eq("362", "内部类里写 quit", await compile(src), "diag:undeclared-identifier");
  });

  it("静态方法里写宿主名：同一句，不是那句「常量」", async () => {
    const src = "extends SceneTree\n\nstatic func f():\n\tquit = 5\n\nfunc _initialize():\n\tquit()\n";
    eq("362", "静态方法里写 quit", await compile(src), "diag:host-read-in-static");
  });
});
