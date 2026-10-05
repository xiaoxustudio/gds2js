/**
 * 发射期守卫的三段 cell table（从 tools/compile.ts 的守卫段迁出）。
 *
 * 这三段与 compile.ts 的语料循环无关：它们不看 corpus，只用内联的 GDScript 片段探
 * 「发射期抛不抛、抛什么 code」。抽出来后 compile.ts 只剩语料编译与它自己的读数，
 * 三段守卫的读数改由本文件 afterAll 打印（文本逐字沿用，仍可直接 grep）。
 *
 * 判据只有「抛不抛 + code」，产物文本不参与断言，所以这里用的是探测用的
 * EMIT_OPTS_PROBE 而不是 compile.ts 里那个冻结的 GEN_EMIT_OPTS —— emitModule
 * （emitter.ts:264-265）只把两个 specifier 当字符串嵌进产物、不做任何校验，
 * 换成短占位值是惰性的，也免得把冻结字面量抄成第二份、将来改一处漏一处。
 */
import { afterAll, describe, expect, it } from "vitest";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { GLOBAL_TODO_FUNCTIONS } from "@gds2js/compiler/lower/globals";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";

const EMIT_OPTS_PROBE = { runtimeImport: "rt", hostImport: "host" };

/** 三张表共用的分类器：编得过就给 okMarker，否则给 UnsupportedError 的 code。 */
async function classify(src: string, okMarker: string): Promise<string> {
  try {
    emitModule(lower(await parseSource(src)), EMIT_OPTS_PROBE);
    return okMarker;
  } catch (e) {
    return e instanceof UnsupportedError ? ((e as { code?: string }).code ?? "无码") : "非 UnsupportedError";
  }
}

const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n\t${body}\n`;
const IN = (body: string): string =>
  `extends SceneTree\n\nclass Inner extends RefCounted:\n\tfunc f():\n\t\t${body}\n\nfunc _initialize():\n\tquit()\n`;
const PRINT = (call: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint(${call})\n\tquit()\n`;

// ── ① 全局拒答清单 ─────────────────────────────────────────────────
// 清单上的名字必须真的在发射期抛 emit-builtin —— 实现了却忘了从清单划走，就是清单在烂。
const TODO_NAMES = [...GLOBAL_TODO_FUNCTIONS];
const stale: string[] = [];

describe("全局拒答清单仍响亮拒", () => {
  it.each(TODO_NAMES)("%s", async (name) => {
    const code = await classify(PRINT(`${name}()`), "居然编得过");
    if (code !== "emit-builtin") stale.push(`${name}:${code}`);
    expect(code, `${name} 期望发射期抛 emit-builtin`).toBe("emit-builtin");
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
/** `var_to_str()` 的缩进串：4.6.3 收第二个实参，但装字典的数组跟着换行、缩进按深度累加，
 *  式子没量出前只在发射期响亮拒。 */
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

afterAll(() => {
  // 三行读数逐字沿用 compile.ts:100 / 138 / 162，含前导两空格，便于按老样子 grep。
  console.log(
    `  全局拒答清单失效 ${stale.length}（应为 0）${stale.length > 0 ? "：" + stale.join(", ") : ""}`,
  );
  console.log(
    `  未知调用守卫 ${UNKNOWN_CALL_CELLS.length - guardBad.length}/${UNKNOWN_CALL_CELLS.length} 格口径一致（应为 ${UNKNOWN_CALL_CELLS.length}）${guardBad.length > 0 ? "：" + guardBad.join(" | ") : ""}`,
  );
  console.log(
    `  转换族单实参口径 ${CONVERT_ARITY_CELLS.length - arityBad.length}/${CONVERT_ARITY_CELLS.length} 格一致（应为 ${CONVERT_ARITY_CELLS.length}）${arityBad.length > 0 ? "：" + arityBad.join(" | ") : ""}`,
  );
});
