/**
 * 发射期守卫的四段 cell table（从 tools/compile.ts 的守卫段迁出）。
 *
 * 这四段与 compile.ts 的语料循环无关：它们不看 corpus，只用内联的 GDScript 片段探
 * 「发射期抛不抛、抛什么 code」。抽出来后 compile.ts 只剩语料编译与它自己的读数，四段守卫的读数改由本文件 afterAll 打印（文本逐字沿用，仍可直接 grep）。
 *
 * 判据只有「抛不抛 + code」，产物文本不参与断言，所以这里用的是探测用的
 * EMIT_OPTS_PROBE 而不是 compile.ts 里那个冻结的 GEN_EMIT_OPTS —— emitModule
 * （emitter.ts:264-265）只把两个 specifier 当字符串嵌进产物、不做任何校验，
 * 换成短占位值是惰性的，也免得把冻结字面量抄成第二份、将来改一处漏一处。
 */
import { afterAll, describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { GLOBAL_TODO_FUNCTIONS } from "@gds2js/compiler/lower/globals";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GLOBAL_CALLABLES, GLOBAL_VALUE_NAMES } from "@gds2js/runtime/runtime/global-names";

const EMIT_OPTS_PROBE = { runtimeImport: "rt", hostImport: "host" };

/** 三张表共用的分类器：编得过就给 okMarker，否则给 UnsupportedError 的 code。 */
async function classify(src: string, okMarker: string): Promise<string> {
  try {
    const m = lower(await parseSource(src));
    // S387：元数那两句出自 analyze，先按那两句查一遍再谈发射 —— 只认那两句，别的诊断不参与这张分类器
    const hit = analyze(m).find((d) => /^Too (few|many) arguments for /.test(d.message));
    if (hit !== undefined) return hit.code ?? "无码";
    emitModule(m, EMIT_OPTS_PROBE);
    return okMarker;
  } catch (e) {
    return e instanceof UnsupportedError ? ((e as { code?: string }).code ?? "无码") : "非 UnsupportedError";
  }
}

const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n\t${body}\n`;const IN = (body: string): string =>
  `extends SceneTree\n\nclass Inner extends RefCounted:\n\tfunc f():\n\t\t${body}\n\nfunc _initialize():\n\tquit()\n`;
const PRINT = (call: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint(${call})\n\tquit()\n`;

const arityText = async (src: string): Promise<string> => {
  const m = lower(await parseSource(src));
  const hit = analyze(m).find((d) => /^Too (few|many) arguments for /.test(d.message));
  return hit?.message ?? "居然编得过";
};

// ── ① 全局拒答清单 ─────────────────────────────────────────────────
// 清单上残留的名字必须真的在发射期抛 emit-builtin —— 实现了却忘了从清单划走，就是清单在烂。
const TODO_NAMES = [...GLOBAL_TODO_FUNCTIONS];
const stale: string[] = [];

describe("全局拒答清单仍响亮拒", () => {
  it("清单在 S286 之后清空：残留的名字必须真的还在发射期抛 emit-builtin", async () => {
    expect(TODO_NAMES.join(","), "发射期的拒答清单现在应当为空（最后两支已发出）").toBe("");
    for (const name of TODO_NAMES) {
      const code = await classify(PRINT(`${name}()`), "居然编得过");
      if (code !== "emit-builtin") stale.push(`${name}:${code}`);
      expect(code, `${name} 期望发射期抛 emit-builtin`).toBe("emit-builtin");
    }
  });
});

// ── ①b 打印一族：发的五支各走一个宿主名，拒的五支要把实测到的缘由说出口 ──────
describe("打印一族的发射与拒答", () => {
  const msg = async (src: string): Promise<string> => {
    try {
      await emitted(src);
      return "居然编得过";
    } catch (e) {
      return e instanceof UnsupportedError ? e.message : "非 UnsupportedError";
    }
  };

  it("prints / printt / printraw / printerr / print_verbose / print_rich 发成宿主的六支", async () => {
    const code = await emitted(BODY(['prints("a", 1)', "quit()"]));
    expect(code, "宿主那条 import 要带上七支的名字").toContain(
      'import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "host";',
    );
    expect(code, "prints 是一个空格").toContain('printJoined(" ", [');
    expect(await emitted(BODY(['printt("a", 1)', "quit()"])), "printt 是制表符").toContain('printJoined("\\t", [');
    expect(await emitted(BODY(['printraw("a")', "quit()"])), "printraw 走 printRaw").toContain("printRaw([");
    expect(await emitted(BODY(['printerr("a")', "quit()"])), "printerr 走 printErr").toContain("printErr([");
    expect(await emitted(BODY(['print_verbose("a")', "quit()"])), "print_verbose 走 printVerbose").toContain(
      "printVerbose([",
    );
    expect(await emitted(BODY(['print_rich("[b]x[/b]")', "quit()"])), "print_rich 走 printRich").toContain("printRich([");
    expect(await classify(PRINT('prints("a")'), "ok"), "prints 单实参编得过").toBe("ok");
    expect(await classify(PRINT("prints()"), "ok"), "prints 零实参也编得过（实测出一行空行）").toBe("ok");
  });

  it("带对象表那两支按 S284 发出：各自走 runtime 的那一条式子", async () => {
    expect(await emitted(BODY(['print(var_to_bytes_with_objects(5))', "quit()"])), "编码那支走 gVarToBytesWithObjects").toContain(
      "rt.gVarToBytesWithObjects(rt.V.int(5))",
    );
    expect(await emitted(BODY(['print(bytes_to_var_with_objects(var_to_bytes_with_objects(5)))', "quit()"])), "解码那支走 gBytesToVarWithObjects").toContain(
      "rt.gBytesToVarWithObjects(rt.gVarToBytesWithObjects(rt.V.int(5)))",
    );
  });

  it("print_debug 已按 S266 发出：走宿主的 printDebug 并带上调用点", async () => {
    const code = await emitted(BODY(['print_debug("x")', "quit()"]));
    expect(code, "print_debug 走 printDebug").toContain('printDebug([rt.V.str("x")]');
    expect(code, "第二句的 At: 由发射器写好路径、行号与所在函数").toContain('.gd", 4, "_initialize")');
  });
});

// ── ①i 调用栈那一族：四支都发得出，帧栈常开（运行期错误要在每支函数边界接住，S281 + S406）──
describe("调用栈一族的发射与帧打点", () => {
  const textOf = arityText;
  const ROWS: Array<[string, string]> = [
    ["print_stack()", "rt.gPrintStack()"],
    ["get_stack()", "rt.gGetStack()"],
    ['push_error("boom")', 'rt.gPushError([rt.V.str("boom")])'],
    ['push_warning("a", "b")', 'rt.gPushWarning([rt.V.str("a"), rt.V.str("b")])'],
  ];
  const FRAMED = "extends SceneTree\n\nfunc deep():\n\tprint_stack()\n\nfunc _initialize():\n\tdeep()\n\tquit()\n";
  const PLAIN = "extends SceneTree\n\nfunc deep():\n\tprint(1)\n\nfunc _initialize():\n\tdeep()\n\tquit()\n";

  it("四支各发各的 runtime 名", async () => {
    for (const [call, want] of ROWS) {
      const src = PRINT(call);
      expect(await classify(src, "ok"), `${call} 该编得过`).toBe("ok");
      expect(await emitted(src), `${call} 的发射`).toContain(want);
    }
  });

  it("一进一出配 finally，语句各带自己的行号", async () => {
    const code = await emitted(FRAMED);
    expect(code, "帧按函数名进栈").toContain('rt.frameEnter("Main.gd", "deep")');
    expect(code, "栈顶那一帧报的是当前语句行").toContain("rt.frameLine(4);");
    expect(code, "退栈在 finally 里，提前 return 与抛错都不留帧").toContain("rt.frameExit(__gd_frame);");
  });

  it("没用这四支的产物照样打点，并带那一个接住运行期错误的 catch", async () => {
    const code = await emitted(PLAIN);
    expect(code, "帧栈常开：错误那一块的 at: 与 backtrace 靠它").toContain('rt.frameEnter("Main.gd", "deep")');
    expect(code, "行号打点也常开").toContain("rt.frameLine(4);");
    expect(code, "每支函数自己接住").toContain("rt.gdFunctionError(__gd_err);");
    expect(code, "不返回值的函数接住后按原样返回").toContain("rt.gdFunctionError(__gd_err);\n      return;");
  });

  it("print_stack 与 get_stack 只收 0 支，push_* 却是 0..N", async () => {
    expect(await classify(PRINT("print_stack(1)"), "ok"), "print_stack 多给该拦").toBe("builtin-arity");
    expect(await textOf(PRINT("print_stack(1)"))).toBe(
      'Too many arguments for "print_stack()" call. Expected at most 0 but received 1.',
    );
    expect(await classify(PRINT("get_stack(1)"), "ok"), "get_stack 多给该拦").toBe("builtin-arity");
    expect(await textOf(PRINT("get_stack(1)"))).toBe(
      'Too many arguments for "get_stack()" call. Expected at most 0 but received 1.',
    );
    expect(await classify(PRINT('push_error("a", "b", "c")'), "ok"), "push_error 是 0..N").toBe("ok");
    expect(await classify(PRINT("push_error()"), "ok"), "空实参照打（实测出一句 `ERROR: `）").toBe("ok");
    expect(await classify(PRINT('push_warning("a", 5)'), "ok"), "push_warning 也拼实参").toBe("ok");
  });
});

// ── ①c 随机族：八支发成 rt.g*，元数闸门那八句是 4.6.3 一支一名量出来的（S261） ──────
describe("随机族的发射与元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["randi(1)", 'Too many arguments for "randi()" call. Expected at most 0 but received 1.'],
    ["randf(2)", 'Too many arguments for "randf()" call. Expected at most 0 but received 1.'],
    ["randomize(1)", 'Too many arguments for "randomize()" call. Expected at most 0 but received 1.'],
    ["seed()", 'Too few arguments for "seed()" call. Expected at least 1 but received 0.'],
    ["rand_from_seed()", 'Too few arguments for "rand_from_seed()" call. Expected at least 1 but received 0.'],
    ["randfn(1)", 'Too few arguments for "randfn()" call. Expected at least 2 but received 1.'],
    ["randi_range(1, 2, 3)", 'Too many arguments for "randi_range()" call. Expected at most 2 but received 3.'],
    ["randf_range(1)", 'Too few arguments for "randf_range()" call. Expected at least 2 but received 1.'],
  ];

  it("八支各发成自己的 rt.g*", async () => {
    expect(await emitted(BODY(["seed(7)", "randi()", "randf()", "quit()"]))).toContain("rt.gSeed(");
    expect(await emitted(BODY(["randi()", "quit()"]))).toContain("rt.gRandi()");
    expect(await emitted(BODY(["randf()", "quit()"]))).toContain("rt.gRandf()");
    expect(await emitted(BODY(["randomize()", "quit()"]))).toContain("rt.gRandomize()");
    expect(await emitted(BODY(["rand_from_seed(1)", "quit()"]))).toContain("rt.gRandFromSeed(");
    expect(await emitted(BODY(["randi_range(1, 6)", "quit()"]))).toContain("rt.gRandiRange(");
    expect(await emitted(BODY(["randf_range(1.0, 2.0)", "quit()"]))).toContain("rt.gRandfRange(");
    expect(await emitted(BODY(["randfn(0.0, 1.0)", "quit()"]))).toContain("rt.gRandfn(");
    expect(await classify(PRINT("randi()"), "ok"), "randi 零实参编得过").toBe("ok");
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①d 身份族：四支发成 rt.g*，元数闸门那八句是 4.6.3 一支一名量出来的（S263，探头 tmp/probe-ids-arity/arity.log） ──
describe("身份族的发射与元数闸门", () => {
  const body = (stmts: string[]): string =>
    `extends SceneTree\n\nfunc _initialize():\n${stmts.map((s) => `\t${s}`).join("\n")}\n`;
  const DECL = ["var a = 1", "var i = 1"];
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["weakref()", 'Too few arguments for "weakref()" call. Expected at least 1 but received 0.'],
    ["weakref(a, a)", 'Too many arguments for "weakref()" call. Expected at most 1 but received 2.'],
    ["instance_from_id()", 'Too few arguments for "instance_from_id()" call. Expected at least 1 but received 0.'],
    ["instance_from_id(i, 1)", 'Too many arguments for "instance_from_id()" call. Expected at most 1 but received 2.'],
    ["is_instance_valid()", 'Too few arguments for "is_instance_valid()" call. Expected at least 1 but received 0.'],
    ["is_instance_valid(a, a)", 'Too many arguments for "is_instance_valid()" call. Expected at most 1 but received 2.'],
    ["is_instance_id_valid()", 'Too few arguments for "is_instance_id_valid()" call. Expected at least 1 but received 0.'],
    ["is_instance_id_valid(1, 2)", 'Too many arguments for "is_instance_id_valid()" call. Expected at most 1 but received 2.'],
  ];

  it("四支各发成自己的 rt.g*", async () => {
    expect(await emitted(body([...DECL, "weakref(a)", "quit()"]))).toContain("rt.gWeakref(");
    expect(await emitted(body([...DECL, "instance_from_id(i)", "quit()"]))).toContain("rt.gInstanceFromId(");
    expect(await emitted(body([...DECL, "is_instance_valid(a)", "quit()"]))).toContain("rt.gIsInstanceValid(");
    expect(await emitted(body([...DECL, "is_instance_id_valid(i)", "quit()"]))).toContain("rt.gIsInstanceIdValid(");
    expect(await classify(body([...DECL, "print(weakref(a))", "quit()"]), "ok"), "weakref 一支该编得过").toBe("ok");
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      const src = body([...DECL, call, "quit()"]);
      expect(await classify(src, "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(src), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①e RID 族：两支发成 rt.g*，元数三句是 4.6.3 一支一名量出来的（S264，探头 tmp/probe-rid2/*.log、tmp/probe-rid3/tm.gd） ──
describe("RID 族的发射与元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["rid_from_int64()", 'Too few arguments for "rid_from_int64()" call. Expected at least 1 but received 0.'],
    ["rid_from_int64(1, 2)", 'Too many arguments for "rid_from_int64()" call. Expected at most 1 but received 2.'],
    ["rid_allocate_id(1)", 'Too many arguments for "rid_allocate_id()" call. Expected at most 0 but received 1.'],
  ];

  it("两支各发成自己的 rt.g*", async () => {
    expect(await emitted(BODY(["rid_from_int64(5)", "quit()"]))).toContain("rt.gRidFromInt64(");
    expect(await emitted(BODY(["rid_allocate_id()", "quit()"]))).toContain("rt.gRidAllocateId()");
    expect(await classify(PRINT("rid_from_int64(5)"), "ok"), "一支实参该编得过").toBe("ok");
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①f NodePath 族：构造三形与 `^"…"` 字面量都发成 rt.nodePathCtor，方法链 / is / as / 定型变量 / 字典键都编得过（S268 / S275）──
describe("NodePath 族的发射闸门", () => {
  const CTORS: Array<[string, string]> = [
    ['NodePath("a/b")', 'rt.nodePathCtor([rt.V.str("a/b")])'],
    ["NodePath()", "rt.nodePathCtor([])"],
    ['NodePath(&"a")', 'rt.nodePathCtor([rt.V.stringName("a")])'],
    ['^"a/b"', 'rt.nodePathCtor([rt.V.str("a/b")])'],
    ['^"a\\tb"', 'rt.nodePathCtor([rt.V.str("a\\tb")])'],
  ];
  const PASSING: string[] = [
    'print(NodePath("a/b").get_name(0))',
    'print(NodePath("a") is NodePath)',
    'print(str(NodePath("a") as NodePath))',
    'var p: NodePath = NodePath("a")',
    'var d = {}\n\td[NodePath("a")] = 1\n\tprint(d)',
    'print(^"a/b" == NodePath("a/b"))',
    'var p: NodePath = ^"a/b"',
    'var d = { ^"a/b": 1 }\n\tprint(d.keys())',
    'var p = NodePath("a")\n\tmatch p:\n\t\t^"a":\n\t\t\tprint(1)\n\t\t_:\n\t\t\tprint(2)',
    'match ^"a":\n\t\t"a":\n\t\t\tprint(1)\n\t\t_:\n\t\t\tprint(2)',
    'var p = NodePath("a")\n\tmatch p:\n\t\tNodePath("a"):\n\t\t\tprint(1)\n\t\t_:\n\t\t\tprint(2)',
  ];

  it("臂里的字面量走 rt.patLit(rt.nodePathCtor(...))，异型臂不抛只走默认", async () => {
    const src = await emitted(MOD('var p = NodePath("a")\n\tmatch p:\n\t\t^"a":\n\t\t\tprint(1)'));
    expect(src, "模式位也发同一个式子").toContain("rt.patLit(rt.nodePathCtor([rt.V.str(\"a\")]))");
  });

  it("三种构造形与字面量都发成同一个 rt.nodePathCtor（实测 c1 / P7 / a05 三形 + b01 转义那格）", async () => {
    for (const [call, want] of CTORS) {
      const src = PRINT(call);
      expect(await classify(src, "ok"), `${call} 该编得过`).toBe("ok");
      expect(await emitted(src), `${call} 的发射`).toContain(want);
    }
  });

  it("方法链、is / as、定型变量与字典键都不拦", async () => {
    for (const body of PASSING) {
      expect(await classify(MOD(body), "ok"), body.replace(/\n\t/g, " ")).toBe("ok");
    }
  });
});

// ── ①h 构造式手臂：量过的形状各走 rt.patConst(<构造式>)，表外与非常量实参照旧拦（S280 语料 272；负数实参与 `Color` 三元是 S297 语料 287）──
describe("构造式手臂的发射闸门", () => {
  const ARMS: Array<[string, string]> = [
    ["Vector2(1, 2)", "rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)]))"],
    ["Vector2i(1, 2)", "rt.patConst(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]))"],
    ["Vector3(1, 2, 3)", "rt.patConst(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))"],
    ["Vector3i(1, 2, 3)", "rt.patConst(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))"],
    ["Color(1, 2, 3, 4)", "rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))"],
    ['StringName("a")', 'rt.patConst(rt.stringNameCtor([rt.V.str("a")]))'],
    ["Callable()", "rt.patConst(rt.callableCtor([]))"],
    // 负数实参在语法树里是 `unary_operator` 套字面量，发射带着那层括号走，与当表达式用同一条路
    ["Vector2(-1, 2)", "rt.patConst(rt.vector2New([rt.V.int((-1)), rt.V.int(2)]))"],
    ["Vector2i(-1, 2)", "rt.patConst(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]))"],
    ["Vector3(-1, -2, -3)", "rt.patConst(rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))]))"],
    // 三元 Color 收：第四个通道默认 1.0，与 Color(1, 2, 3, 1) 撞上（实测 e 组那一格）
    ["Color(1, 2, 3)", "rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))"],
  ];
  const REFUSED: string[] = [
    "AABB(Vector2(1, 2), Vector2(3, 4))",
    "Array([1])",
    'Dictionary({"a": 1})',
    "rid_from_int64(5)",
    "str(1)",
    "Vector2(1, x)",
    // 错元数：引擎发两句解析期拒（`No constructor of "Vector2" matches the signature "Vector2(int)".` + 那句常量表达式），
    // 我们这一形仍按「表外就当没这形」拦，两句文案的账记 §6 第 28 条
    "Vector2(1)",
  ];
  const armSrc = (arm: string): string =>
    MOD(`var x = 5\n\tvar y = 2\n\tmatch x:\n\t\t${arm}:\n\t\t\tprint(1)\n\t\t_:\n\t\t\tprint(2)`);

  it("各支各发各的构造式", async () => {
    for (const [arm, want] of ARMS) {
      const src = armSrc(arm);
      expect(await classify(src, "ok"), `${arm} 该编得过`).toBe("ok");
      expect(await emitted(src), `${arm} 的发射`).toContain(want);
    }
  });

  it("表外的构造与非常量实参仍拦在模式位", async () => {
    for (const arm of REFUSED) {
      expect(await classify(armSrc(arm), "ok"), `${arm} 该拦下来`).not.toBe("ok");
    }
  });
});

// ── ①j 二进制序列那两支：发成 rt.gVarToBytes / rt.gBytesToVar，元数一句照引擎，带对象表的仍拒（S282，语料 274）──
describe("var_to_bytes 族的发射闸门", () => {
  const textOf = arityText;
  const ROWS: Array<[string, string]> = [
    ["var_to_bytes(5)", "rt.gVarToBytes(rt.V.int(5))"],
    ["var_to_bytes_with_objects(5)", "rt.gVarToBytesWithObjects(rt.V.int(5))"],
    ["bytes_to_var(var_to_bytes(5))", "rt.gBytesToVar(rt.gVarToBytes(rt.V.int(5)))"],
    ["bytes_to_var_with_objects(bytes_to_var(var_to_bytes(5)))", "rt.gBytesToVarWithObjects(rt.gBytesToVar(rt.gVarToBytes(rt.V.int(5))))"],
  ];

  it("四支各发各的 runtime 名", async () => {
    for (const [call, want] of ROWS) {
      const src = PRINT(call);
      expect(await classify(src, "ok"), `${call} 该编得过`).toBe("ok");
      expect(await emitted(src), `${call} 的发射`).toContain(want);
    }
  });

  it("少给与多给是引擎那两句", async () => {
    expect(await classify(PRINT("var_to_bytes()"), "ok"), "var_to_bytes 少给该拦").toBe("builtin-arity");
    expect(await textOf(PRINT("var_to_bytes()"))).toBe('Too few arguments for "var_to_bytes()" call. Expected at least 1 but received 0.');
    expect(await classify(PRINT("bytes_to_var()"), "ok"), "bytes_to_var 少给该拦").toBe("builtin-arity");
    expect(await textOf(PRINT("bytes_to_var()"))).toBe('Too few arguments for "bytes_to_var()" call. Expected at least 1 but received 0.');
    expect(await textOf(PRINT("var_to_bytes_with_objects(1, 2)"))).toBe('Too many arguments for "var_to_bytes_with_objects()" call. Expected at most 1 but received 2.');
    expect(await textOf(PRINT("bytes_to_var_with_objects()"))).toBe('Too few arguments for "bytes_to_var_with_objects()" call. Expected at least 1 but received 0.');
    expect(await classify(PRINT("var_to_bytes(5, 6)"), "ok"), "多给也拦").toBe("builtin-arity");
    expect(await textOf(PRINT("var_to_bytes(5, 6)"))).toBe('Too many arguments for "var_to_bytes()" call. Expected at most 1 but received 2.');
  });
});

// ── ①g `inst_to_dict`：发成 rt.gInstToDict、每个类都带一份 dict 身份，元数两句是一支一名量出来的（S269，探头 tmp/probe-inst/）──
describe("inst_to_dict 的发射与元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["inst_to_dict()", 'Too few arguments for "inst_to_dict()" call. Expected at least 1 but received 0.'],
    ["inst_to_dict(1, 2)", 'Too many arguments for "inst_to_dict()" call. Expected at most 1 but received 2.'],
  ];

  it("发成 rt.gInstToDict，模块根类与内嵌类各登记一份身份", async () => {
    expect(await emitted(BODY(["inst_to_dict(self)", "quit()"]))).toContain("rt.gInstToDict(");
    const inner = await emitted(
      `extends SceneTree\n\nclass Inner extends RefCounted:\n\tvar k = 1\n\tvar p: int:\n\t\tget: return 3\n\nfunc _initialize():\n\tquit()\n`,
    );
    expect(inner, "模块根类登记空类路径").toContain(
      'rt.registerDictIdentity(__gd_d_Main, null, "", [], {}, (o) => { const s = o as Main; return []; });',
    );
    expect(inner, "内嵌类登记自己的类路径、accessor 的声明类型与静态写好的读数器").toContain(
      'rt.registerDictIdentity(__gd_d_Inner, null, "Inner", ["k","p"], {"p": "int"}, (o) => { const s = o as Inner; return [s.k, rt.V.nil()]; });',
    );
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①h `dict_to_inst`：发成 rt.gDictToInst，元数两句与 inst_to_dict 同形（S272，探头 tmp/probe-inst/）──
describe("dict_to_inst 的发射与元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["dict_to_inst()", 'Too few arguments for "dict_to_inst()" call. Expected at least 1 but received 0.'],
    ["dict_to_inst(1, 2)", 'Too many arguments for "dict_to_inst()" call. Expected at most 1 but received 2.'],
  ];

  it("发成 rt.gDictToInst，构造侧带上裸构造守卫", async () => {
    expect(await emitted(BODY(["quit()", 'print(dict_to_inst({"@path": "res://main.gd", "@subpath": NodePath("Inner")}))']))).toContain("rt.gDictToInst(");
    const withInit = await emitted(
      "extends SceneTree\n\nclass Plain extends RefCounted:\n\tvar q = 2\n\nclass Sub extends Plain:\n\tvar r = 3\n\nclass Inner extends RefCounted:\n\tvar k = 1\n\n\tfunc _init():\n\t\tk = 7\n\nfunc _initialize():\n\tprint(dict_to_inst(inst_to_dict(Inner.new())))\n\tquit()\n",
    );
    expect(withInit, "_init 的体整个进裸构造守卫里（dict_to_inst 造实例时一句都不跑，S269 ⑦）").toContain("if (!rt.bareConstruction()) {");
    expect(withInit, "根构造器的 _init 派发也在守卫里").toContain('if (!rt.bareConstruction()) this.__gdDispatch("_init"');
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①i `is_instance_of`：发成 rt.gIsInstanceOf，元数两句是 `--language en` 量的原文（S274，探头 tmp/probe-is/）──
describe("is_instance_of 的发射与元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["is_instance_of(self)", 'Too few arguments for "is_instance_of()" call. Expected at least 2 but received 1.'],
    ["is_instance_of(self, RefCounted, RefCounted)", 'Too many arguments for "is_instance_of()" call. Expected at most 2 but received 3.'],
  ];

  it("发成 rt.gIsInstanceOf，类值与引擎类值都按实参进去", async () => {
    const src = await emitted(BODY(["quit()", "print(is_instance_of(self, RefCounted))", "print(is_instance_of(self, Object))"]));
    expect(src, "第二参发成那份引擎类值").toContain("rt.gIsInstanceOf(");
    expect(src).toContain("rt.nativeClass(\"RefCounted\")");
  });

  it("少给与多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });
});

// ── ①j `is_instance_of` 的解析期那句：只在两参都是字面量 int 且第二参越界时拦（S274 / §6 第 26 条，探头 tmp/probe-is/arg1.mts）──
describe("is_instance_of 的字面量类型实参闸门", () => {
  const MOD2 = (body: string): string =>
    `extends SceneTree\n\nclass A extends RefCounted:\n\tvar x = 1\n\nfunc _initialize():\n\tvar a = A.new()\n\t${body}\n\tquit()\n`;
  const REFUSED: Array<[string, string]> = [
    ["print(is_instance_of(5, 999))", "第二参越界"],
    ["print(is_instance_of(5, -1))", "负数同句"],
    ["print(is_instance_of(5, 39))", "39 就是 TYPE_MAX 那一格"],
  ];
  const PASSED: Array<[string, string]> = [
    ["print(is_instance_of(5, 38))", "界内照发"],
    ["print(is_instance_of(5, TYPE_OBJECT))", "常数名照发"],
    ["print(is_instance_of(a, 999))", "第一参是变量 → 交给运行期那一句"],
    ["print(is_instance_of(a, t))", "两参都是变量"],
  ];

  it("该拦的按解析期那句拦，该发的不误拦", async () => {
    for (const [call, why] of REFUSED) {
      const out = await emitted(MOD2(call).replace("var a = A.new()\n", "var a = A.new()\n\tvar t = 3\n"));
      expect(out, `${call} —— ${why}`).toBe("diag:instance-of-type-arg");
    }
    for (const [call, why] of PASSED) {
      const out = await emitted(MOD2(call).replace("var a = A.new()\n", "var a = A.new()\n\tvar t = 3\n"));
      expect(out, `${call} —— ${why}`).not.toBe("diag:instance-of-type-arg");
    }
  });
});

// ── ② 未知调用守卫 ─────────────────────────────────────────────────
/** 拒的五格与判引擎是同一条式子（callee 名不按局部解、不按类名解、不在成员表里 →
 *  解析期就 `not found in base self.`），放行的三格是守卫容易误拦的形状
 *  （宿主基类成员、内部类自己的与继承来的方法在字段初始化式里裸调）。少一格都是守卫在退化。 */
const UNKNOWN_CALL_CELLS: Array<{ name: string; src: string; want: "ok" | "call-unknown" }> = [
  { name: "模块级未知名字", src: MOD("no_such_fn_900()"), want: "call-unknown" },
  { name: "内部类里未知名字", src: IN("no_such_fn_901()"), want: "call-unknown" },
  { name: "内部类里 quit()", src: IN("quit()"), want: "call-unknown" },
  { name: "内部类里 create_timer()", src: IN("create_timer(1.0)"), want: "call-unknown" },
  {
    name: "类名当函数调",
    src: `extends SceneTree\n\nclass Inner extends RefCounted:\n\tvar k = 1\n\nfunc _initialize():\n\tvar b = Inner()\n\tquit()\n`,
    want: "call-unknown",
  },
  { name: "宿主基类的 quit()", src: MOD("quit()"), want: "ok" },
  {
    name: "内部类字段初始化裸调本类方法",
    src: `extends SceneTree\n\nclass Inner extends RefCounted:\n\tvar bx: int = _mk()\n\n\tfunc _mk() -> int:\n\t\treturn 1\n\nfunc _initialize():\n\tquit()\n`,
    want: "ok",
  },
  {
    name: "内部类字段初始化裸调继承来的方法",
    src: `extends SceneTree\n\nclass Base extends RefCounted:\n\tfunc _mk() -> int:\n\t\treturn 1\n\nclass Child extends Base:\n\tvar cx: int = _mk()\n\nfunc _initialize():\n\tquit()\n`,
    want: "ok",
  },
];
const guardBad: string[] = [];

describe("未知调用守卫", () => {
  it.each(UNKNOWN_CALL_CELLS)("$name", async ({ src, want, name }) => {
    const got = await classify(src, "ok");
    if (got !== want) guardBad.push(`${name}: 期望 ${want}，实得 ${got}`);
    expect(got, `${name}：期望 ${want}，实得 ${got}`).toBe(want);
  });
});

// ── ③ 转换族单实参口径 ─────────────────────────────────────────────
/** `var_to_str()` 的第二个实参（缩进串）在 4.6.3 **引擎解析期就拒**（`Too many arguments for "var_to_str()" call. Expected at most 1 but received 2.`，
 *  读数 `tmp/aritymax/both-ends.txt`），出货同拒；`convert` / `type_convert` 同理是恰好两元。 */
const CONVERT_ARITY_CELLS: Array<{
  name: string;
  call: string;
  want: "ok" | "var-to-str-arity" | "str-to-var-arity" | "convert-arity";
}> = [
  { name: "var_to_str 单实参", call: "var_to_str(1)", want: "ok" },
  { name: "var_to_str 带缩进串", call: 'var_to_str(1, "  ")', want: "var-to-str-arity" },
  { name: "var_to_str 零实参", call: "var_to_str()", want: "var-to-str-arity" },
  { name: "str_to_var 单实参", call: 'str_to_var("1")', want: "ok" },
  { name: "str_to_var 零实参", call: "str_to_var()", want: "str-to-var-arity" },
  { name: "str_to_var 多实参", call: 'str_to_var("1", 2)', want: "str-to-var-arity" },
  { name: "convert 两实参", call: "convert(1, TYPE_INT)", want: "ok" },
  { name: "convert 少实参", call: "convert(1)", want: "convert-arity" },
  { name: "convert 多实参", call: "convert(1, TYPE_INT, 2)", want: "convert-arity" },
  { name: "type_convert 两实参", call: "type_convert(1, TYPE_STRING)", want: "ok" },
  { name: "type_convert 少实参", call: "type_convert()", want: "convert-arity" },
];
const arityBad: string[] = [];

describe("转换族单实参口径", () => {
  it.each(CONVERT_ARITY_CELLS)("$name", async ({ call, want, name }) => {
    const got = await classify(PRINT(call), "ok");
    if (got !== want) arityBad.push(`${name}: 期望 ${want}，实得 ${got}`);
    expect(got, `${name}：期望 ${want}，实得 ${got}`).toBe(want);
  });
});

// ── ④ 值位置的全局函数名 ───────────────────────────────────────────
/** 实测「能当值用的那 123 支」在分析器不再报未声明、发射器发真的 Callable；21 支类型名照旧拦（引擎解析期就拒）。
 *  取值点是 analyze 记的号，所以这一族每格都先 analyze 再 emit —— 跳过 analyze 就退化成裸 JS 标识符。 */
async function emitted(src: string): Promise<string> {
  const ir = lower(await parseSource(src));
  const diags = analyze(ir);
  if (diags.length > 0) return `diag:${diags[0]!.code}`;
  return emitModule(ir, EMIT_OPTS_PROBE);
}
/** 多行函数体：MOD 只给一行，遮蔽那几格得两行式子才试得出来。 */
const BODY = (lines: string[]): string =>
  `extends SceneTree\n\nfunc _initialize():\n${lines.map((l) => `\t${l}`).join("\n")}\n\tquit()\n`;

const VALUE_NAMES = [...GLOBAL_VALUE_NAMES];
const valueBad: string[] = [];

describe("值位置的全局函数名", () => {
  it.each(VALUE_NAMES)("%s 取值放行并发出 Callable", async (name) => {
    const got = await emitted(MOD(`var f = ${name}`));
    const want = `rt.globalCallable(${JSON.stringify(name)})`;
    const ok = got.includes(want);
    if (!ok) valueBad.push(`${name}: ${got.slice(0, 60)}`);
    expect(ok, `${name} 期望发出 ${want}`).toBe(true);
  });

  const VALUE_CELLS: Array<{ name: string; src: string; want: string }> = [
    { name: "类型名 int 仍拦", src: MOD("var k = int"), want: "diag:undeclared-identifier" },
    { name: "类型名 Vector2 仍拦", src: MOD("var k = Vector2"), want: "diag:undeclared-identifier" },
    { name: "不存在的名字仍拦", src: MOD("var k = no_such_value_900"), want: "diag:undeclared-identifier" },
    // 引擎类名当值用实测合法（typeof 24、等式按类）：分析器放行、发射器发身份盒子，带号的打印与 .new() 在运行时各自拒
    { name: "引擎类名当值用发 nativeClass", src: MOD("var k = Node"), want: 'rt.nativeClass("Node")' },
    { name: "打印类值走的还是那支", src: MOD("print(Node)"), want: 'rt.nativeClass("Node")' },
    { name: "Node.new() 的接收者也发出去", src: MOD("var k = Node.new()"), want: 'rt.nativeClass("Node")' },
    { name: "类名大小写是硬的（HttpRequest 不在名单里）", src: MOD("var k = HttpRequest"), want: "diag:undeclared-identifier" },
    { name: "不存在的类名仍拦", src: MOD("var k = NonexistentClass900"), want: "diag:undeclared-identifier" },
    { name: "preload 取值仍拦（引擎也是解析期拒）", src: MOD("var k = preload"), want: "diag:undeclared-identifier" },
    { name: ".call 的接收者走同一条", src: MOD("print(abs.call(-3))"), want: 'rt.method(rt.globalCallable("abs"), "call"' },
    { name: "数组元素位也发 Callable", src: MOD("print([abs])"), want: 'rt.globalCallable("abs")' },
  ];

  it.each(VALUE_CELLS)("$name", async ({ src, want, name }) => {
    const got = await emitted(src);
    const ok = want.startsWith("diag:") ? got === want : got.includes(want);
    expect(ok, `${name}：期望 ${want}，实得 ${got.slice(0, 90)}`).toBe(true);
  });

  it("单实参那三支的 arity 文案按实测发（引擎解析期拒，出货 S387 起也是解析期拒）", async () => {
    const text = arityText;
    const names: Array<[string, string]> = [["char", "char-arity"], ["var_to_str", "var-to-str-arity"], ["str_to_var", "str-to-var-arity"]];
    for (const [name, code] of names) {
      const call = name === "str_to_var" ? `"1"` : "1";
      expect(await classify(PRINT(`${name}(${call})`), "ok"), `${name} 单实参该编得过`).toBe("ok");
      expect(await classify(PRINT(`${name}()`), "ok"), `${name} 零实参`).toBe(code);
      expect(await classify(PRINT(`${name}(${call}, "  ")`), "ok"), `${name} 双实参`).toBe(code);
      expect(await text(PRINT(`${name}()`)), `${name} 少给那句`).toBe(`Too few arguments for "${name}()" call. Expected at least 1 but received 0.`);
      expect(await text(PRINT(`${name}(${call}, "  ")`)), `${name} 多给那句`).toBe(`Too many arguments for "${name}()" call. Expected at most 1 but received 2.`);
    }
    expect(await emitted(MOD("print(char(65))"))).toContain("rt.stringChr(");
    expect(await emitted(MOD('print(var_to_str(1))'))).toContain("rt.varToStr(");
    expect(await emitted(MOD('print(str_to_var("1"))'))).toContain("rt.strToVar(");
  });

  it("内置函数的实参数按实测区间拦（引擎那两句原文）", async () => {
    const text = arityText;
    // 读数来自 `tmp/probe-arity/arity.log`：一支名两形（少给 / 多给），全部一字不差
    const shapes: Array<[string, number, string]> = [
      ["clamp", 3, "1"], ["angle_difference", 2, "1.0"], ["pingpong", 2, "7.0"],
      ["rotate_toward", 3, "1.0"], ["bezier_interpolate", 5, "1.0"], ["cubic_interpolate_in_time", 8, "1.0"],
      ["step_decimals", 1, "0.5"], ["is_same", 2, "1"], ["move_toward", 3, "1.0"], ["remap", 5, "1.0"],
    ];
    for (const [name, want, sample] of shapes) {
      const few = Array.from({ length: want - 1 }, () => sample).join(", ");
      const ok = Array.from({ length: want }, () => sample).join(", ");
      const many = Array.from({ length: want + 1 }, () => sample).join(", ");
      expect(await classify(PRINT(`${name}(${ok})`), "ok"), `${name} 正好 ${String(want)} 支该编得过`).toBe("ok");
      expect(await text(PRINT(`${name}(${few})`)), `${name} 少给那句`).toBe(
        `Too few arguments for "${name}()" call. Expected at least ${String(want)} but received ${String(want - 1)}.`);
      expect(await text(PRINT(`${name}(${many})`)), `${name} 多给那句`).toBe(
        `Too many arguments for "${name}()" call. Expected at most ${String(want)} but received ${String(want + 1)}.`);
    }
    // min / max 实测是「至少 2、上不封顶」：三支与四支都编得过
    expect(await classify(PRINT("min(1, 2, 3)"), "ok"), "min 三支不拦").toBe("ok");
    expect(await classify(PRINT("max(1, 2, 3, 4)"), "ok"), "max 四支不拦").toBe("ok");
    expect(await text(PRINT("min(1)")), "min 一支那句").toBe(`Too few arguments for "min()" call. Expected at least 2 but received 1.`);
    // 表外的名字不拦：print 是变元、`int()` 是类型构造器，两句都没在这一族量过
    expect(await classify(PRINT("print(1, 2, 3)"), "ok"), "print 的变元不参与拦").toBe("ok");
    expect(await classify(MOD("var x = str(1, 2, 3)"), "ok"), "str 的变元不参与拦").toBe("ok");
  });

  it("局部遮蔽的三格按实测方向走", async () => {
    // ① 声明在前：读数归局部（实测 s04 的 len）
    const before = await emitted(BODY(["var len = 5", "print(len)", "print(abs)"]));
    expect(before.includes(`rt.globalCallable("len")`), `len 该归局部：${before.slice(0, 120)}`).toBe(false);
    expect(before.includes(`rt.globalCallable("abs")`), "abs 没被 len 的声明带走").toBe(true);
    // ② 声明在后：前面那读还是全局（实测 s04|5|2|@GlobalScope::abs 与 s06|7 两格）
    const after = await emitted(BODY(["print(abs)", "var abs = 7", "print(abs)"]));
    expect(after.includes(`rt.globalCallable("abs")`), "声明之前的读数还是全局 Callable").toBe(true);
    expect(after.includes("let abs"), "声明之后的读数归局部").toBe(true);
    // ③ lambda 形参只在形参体内盖住全局（实测 s07 的 [9, 2]）
    const lam = await emitted(BODY(["var g = func (abs): return abs", "print(abs)", "print(g.call(9))"]));
    expect(lam.includes(`rt.globalCallable("abs")`), "lambda 形参不该把外层的 abs 也吃掉").toBe(true);
    // ④ 类名可以当局部名（实测 var-Node / param-Node 两支都过解析），那读数是局部不是类值
    const shadowClass = await emitted(BODY(["var Node = 1", "print(Node)"]));
    expect(shadowClass.includes(`rt.nativeClass("Node")`), "声明过的 Node 该发局部").toBe(false);
  });

  it("引擎类名名单本身（1053 支、与其他两张名单零交集）", async () => {
    expect(ENGINE_CLASS_NAMES.size, "ClassDB.get_class_list() 的读数").toBe(1053);
    for (const n of ["Node", "Object", "Resource", "Label", "GDScript", "HTTPRequest", "AStar2D"]) {
      expect(ENGINE_CLASS_NAMES.has(n), `${n} 不在名单里`).toBe(true);
    }
    const clash = [...GLOBAL_VALUE_NAMES].filter((n) => ENGINE_CLASS_NAMES.has(n));
    expect(clash, `与「能当值用的 123 支全局函数名」撞了：${clash.join(",")}`).toEqual([]);
    const types = ["Array", "Callable", "Color", "PackedByteArray", "PackedStringArray", "String", "StringName", "Vector2", "Vector3i", "bool", "float", "int"];
    expect(types.filter((n) => ENGINE_CLASS_NAMES.has(n)), "与值位置解析期拒的类型名撞了").toEqual([]);
  });

  it("拒答清单与实测表的口径对得上", async () => {
    const stale = TODO_NAMES.filter((n) => !GLOBAL_VALUE_NAMES.has(n));
    expect(stale, `GLOBAL_TODO_FUNCTIONS 里有名字不在实测的 123 支里：${stale.join(",")}`).toEqual([]);
    const loose = [...GLOBAL_VALUE_NAMES].filter((n) => GLOBAL_TODO_FUNCTIONS.has(n) && GLOBAL_CALLABLES[n]!.bounds !== null);
    expect(loose, `该拒的那支里有人领了区间闸门：${loose.join(",")}`).toEqual([]);
  });
});

// ── 全局 max / min 一族的元数闸门：两支变元（≥2）+ 四支定长（恰好 2），两句都是逐格量的（S364，读数 tmp/maxmin/maxmin3.txt，尺 fold48.mts）──
describe("max / min 一族的元数闸门", () => {
  const textOf = arityText;
  const ARITY: Array<[string, string]> = [
    ["maxi(1)", 'Too few arguments for "maxi()" call. Expected at least 2 but received 1.'],
    ["maxi()", 'Too few arguments for "maxi()" call. Expected at least 2 but received 0.'],
    ["mini(1)", 'Too few arguments for "mini()" call. Expected at least 2 but received 1.'],
    ["minf()", 'Too few arguments for "minf()" call. Expected at least 2 but received 0.'],
    ["maxf(1)", 'Too few arguments for "maxf()" call. Expected at least 2 but received 1.'],
    ["maxi(1, 2, 3)", 'Too many arguments for "maxi()" call. Expected at most 2 but received 3.'],
    ["mini(1, 2, 3)", 'Too many arguments for "mini()" call. Expected at most 2 but received 3.'],
    ["maxf(1, 2, 3)", 'Too many arguments for "maxf()" call. Expected at most 2 but received 3.'],
    ["minf(1, 2, 3)", 'Too many arguments for "minf()" call. Expected at most 2 but received 3.'],
    ["maxi(1, 2, 3, 4)", 'Too many arguments for "maxi()" call. Expected at most 2 but received 4.'],
    ["maxi(1, 2.5, 3)", 'Too many arguments for "maxi()" call. Expected at most 2 but received 3.'],
    ["max(1)", 'Too few arguments for "max()" call. Expected at least 2 but received 1.'],
    ["min()", 'Too few arguments for "min()" call. Expected at least 2 but received 0.'],
  ];

  it("四支定长名与两支变元的少给 / 多给都按引擎那句", async () => {
    for (const [call, want] of ARITY) {
      expect(await classify(PRINT(call), "ok"), `${call} 该拦在发射期`).toBe("builtin-arity");
      expect(await textOf(PRINT(call)), `${call} 的文案`).toBe(want);
    }
  });

  it("变元那两支把整串实参送进 gMax / gMin，不是只送前两个", async () => {
    expect(await emitted(PRINT("max(1, 2, 3)"))).toContain("rt.gMax(rt.V.int(1), rt.V.int(2), rt.V.int(3))");
    expect(await emitted(PRINT("min(1, 2, 3, 4)"))).toContain("rt.gMin(rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4))");
    expect(await emitted(PRINT("max(1, 2)"))).toContain("rt.gMax(rt.V.int(1), rt.V.int(2))");
    expect(await classify(PRINT("max(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)"), "ok"), "十二元该编得过").toBe("ok");
  });
});

afterAll(() => {
  // 四行读数逐字沿用 compile.ts:100 / 138 / 162，含前导两空格，便于按老样子 grep。
  console.log(
    `  全局拒答清单失效 ${stale.length}（应为 0）${stale.length > 0 ? "：" + stale.join(", ") : ""}`,
  );
  console.log(
    `  未知调用守卫 ${UNKNOWN_CALL_CELLS.length - guardBad.length}/${UNKNOWN_CALL_CELLS.length} 格口径一致（应为 ${UNKNOWN_CALL_CELLS.length}）${guardBad.length > 0 ? "：" + guardBad.join(" | ") : ""}`,
  );
  console.log(
    `  转换族单实参口径 ${CONVERT_ARITY_CELLS.length - arityBad.length}/${CONVERT_ARITY_CELLS.length} 格一致（应为 ${CONVERT_ARITY_CELLS.length}）${arityBad.length > 0 ? "：" + arityBad.join(" | ") : ""}`,
  );
  console.log(
    `  值位置 Callable ${VALUE_NAMES.length - valueBad.length}/${VALUE_NAMES.length} 支一致（应为 ${VALUE_NAMES.length}）${valueBad.length > 0 ? "：" + valueBad.join(", ") : ""}`,
  );
});
