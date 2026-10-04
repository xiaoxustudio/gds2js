import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { emitModule } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { GLOBAL_TODO_FUNCTIONS } from "@gds2js/compiler/lower/globals";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { caseDir, caseScript, listSingleCases } from "./lib.mjs";

const filter = process.argv.slice(2).find((a) => !a.startsWith("--")) || "";
const cases = listSingleCases(filter);

/** 生成物落在 corpus/cases/<id>/：runtime 与测试宿主都按仓库原位（三级回溯）—— 这两个值以前是 emitter 的默认值，现在由调用方声明。 */
const GEN_EMIT_OPTS = {
  runtimeImport: "../../../packages/runtime/src/runtime/index",
  hostImport: "../../../tools/harness/scene-tree",
};

/** scriptc-check 的文本口径：产物里有没有 compress()/decompress()（`rt.method(x, "compress", …)`）。 */
const NEED_ZSTD_TEXT = /,\s*"(?:compress|decompress)"\s*,/;
/** 带 autoRun 尾巴的产物必须自己兜底：直接跑产物时没有 CLI 那层 try/catch。 */
const ENTRY_TAIL = /const __gd_entry = new \w+\(\);/;
const FALLBACK_TAIL = /rt\.reportRunFailure\(/;
const runFallbackMissing: string[] = [];
/** 文本口径（NEED_ZSTD）与 IR 标志（usesPackCodec）必须逐用例一致 —— 两条判据互锁在这里。 */
const packCodecMismatch: string[] = [];

let compiled = 0;
const rejected: string[] = [];
const unsupported: Array<{ id: string; msg: string }> = [];

/**
 * 不用 rmSync 删旧产物 —— 沙箱里 rmSync 会走回收站且可能超时。
 * 改成直接**覆写**：失败用例留一个抛错的占位文件，
 * js-runner 跑到它时会把明确原因记进「崩溃」桶，而不是跑到上一轮的陈旧代码。
 */
const writeStub = (id: string, reason: string): void => {
  writeFileSync(
    join(caseDir(id), "main.gen.mts"),
    `// gds2js：本轮没有生成有效产物。保留文件是为了让 js-runner 报出明确原因。\nthrow new Error(${JSON.stringify(`gds2js 编译失败：${reason}`)});\n`,
    "utf8",
  );
};

for (const id of cases) {
  const src = readFileSync(caseScript(id), "utf8");

  let diags: Array<{ code: string; message: string }> = [];
  try {
    diags = analyze(lower(await parseSource(src)));
  } catch (e) {
    writeStub(id, `lowering 崩溃：${e instanceof Error ? e.message : String(e)}`);
    unsupported.push({ id, msg: String(e) });
    continue;
  }
  if (diags.length > 0) {
    rejected.push(id);
    writeStub(id, `语义分析拦下：${diags[0]?.message ?? ""}`);
    continue;
  }

  try {
    const ir = lower(await parseSource(src));
    const gen = emitModule(ir, GEN_EMIT_OPTS);
    const saysZstd = NEED_ZSTD_TEXT.test(gen);
    if (saysZstd !== (ir.usesPackCodec === true)) {
      packCodecMismatch.push(`${id}: 文本=${String(saysZstd)} / IR=${String(ir.usesPackCodec === true)}`);
    }
    if (ENTRY_TAIL.test(gen) && !FALLBACK_TAIL.test(gen)) runFallbackMissing.push(id);
    writeFileSync(join(caseDir(id), "main.gen.mts"), gen, "utf8");
    compiled++;
  } catch (e) {
    const msg = e instanceof UnsupportedError ? e.message : String(e);
    writeStub(id, msg);
    unsupported.push({ id, msg });
  }
}

console.log(`编译成功 ${compiled}/${cases.length}`);
console.log(`  语义分析拦下（预期报错用例） ${rejected.length}`);
console.log(`  emitter 不支持 ${unsupported.length}`);
console.log(`  pack codec 口径不一致 ${packCodecMismatch.length}（文本 regex vs IR 标志，应为 0）`);
console.log(`  自兜底缺失 ${runFallbackMissing.length}（有 autoRun 尾巴却没 reportRunFailure，应为 0）`);

/** 全局拒答清单：清单上的名字必须真的在发射期抛 emit-builtin —— 实现了却忘了从清单划走，就是清单在烂。 */
{
  const stale: string[] = [];
  for (const name of GLOBAL_TODO_FUNCTIONS) {
    const src = `extends SceneTree\n\nfunc _initialize():\n\tprint(${name}())\n\tquit()\n`;
    let code = "";
    try {
      emitModule(lower(await parseSource(src)), GEN_EMIT_OPTS);
      code = "居然编得过";
    } catch (e) {
      code = e instanceof UnsupportedError ? ((e as { code?: string }).code ?? "无码") : "非 UnsupportedError";
    }
    if (code !== "emit-builtin") stale.push(`${name}:${code}`);
  }
  console.log(`  全局拒答清单失效 ${stale.length}（应为 0）${stale.length > 0 ? "：" + stale.join(", ") : ""}`);
  if (stale.length > 0) process.exitCode = 1;
}
/** 未知调用守卫：拒的五格与判引擎是同一条式子（callee 名不按局部解、不按类名解、不在成员表里 → 解析期就 `not found in base self.`），
 *  放行的三格是守卫容易误拦的形状（宿主基类成员、内部类自己的与继承来的方法在字段初始化式里裸调）。少一格都是守卫在退化。 */
{
  const MOD = (body: string): string => `extends SceneTree\n\nfunc _initialize():\n\t${body}\n`;
  const IN = (body: string): string =>
    `extends SceneTree\n\nclass Inner extends RefCounted:\n\tfunc f():\n\t\t${body}\n\nfunc _initialize():\n\tquit()\n`;
  const cells: Array<{ name: string; src: string; want: "ok" | "call-unknown" }> = [
    { name: "模块级未知名字", src: MOD("no_such_fn_900()"), want: "call-unknown" },
    { name: "内部类里未知名字", src: IN("no_such_fn_901()"), want: "call-unknown" },
    { name: "内部类里 quit()", src: IN("quit()"), want: "call-unknown" },
    { name: "内部类里 create_timer()", src: IN("create_timer(1.0)"), want: "call-unknown" },
    { name: "类名当函数调", src: `extends SceneTree\n\nclass Inner extends RefCounted:\n\tvar k = 1\n\nfunc _initialize():\n\tvar b = Inner()\n\tquit()\n`, want: "call-unknown" },
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
  const bad: string[] = [];
  for (const c of cells) {
    let got: string;
    try {
      emitModule(lower(await parseSource(c.src)), GEN_EMIT_OPTS);
      got = "ok";
    } catch (e) {
      got = e instanceof UnsupportedError ? ((e as { code?: string }).code ?? "无码") : "非 UnsupportedError";
    }
    if (got !== c.want) bad.push(`${c.name}: 期望 ${c.want}，实得 ${got}`);
  }
  console.log(`  未知调用守卫 ${cells.length - bad.length}/${cells.length} 格口径一致（应为 ${cells.length}）${bad.length > 0 ? "：" + bad.join(" | ") : ""}`);
  if (bad.length > 0) process.exitCode = 1;
}
/** `var_to_str()` 的缩进串：4.6.3 收第二个实参，但装字典的数组跟着换行、缩进按深度累加，式子没量出前只在发射期响亮拒。 */
{
  const cells: Array<{ name: string; call: string; want: "ok" | "var-to-str-arity" | "str-to-var-arity" }> = [
    { name: "var_to_str 单实参", call: "var_to_str(1)", want: "ok" },
    { name: "var_to_str 带缩进串", call: 'var_to_str(1, "  ")', want: "var-to-str-arity" },
    { name: "var_to_str 零实参", call: "var_to_str()", want: "var-to-str-arity" },
    { name: "str_to_var 单实参", call: 'str_to_var("1")', want: "ok" },
    { name: "str_to_var 零实参", call: "str_to_var()", want: "str-to-var-arity" },
    { name: "str_to_var 多实参", call: 'str_to_var("1", 2)', want: "str-to-var-arity" },
  ];
  const bad: string[] = [];
  for (const c of cells) {
    let got: string;
    try {
      emitModule(lower(await parseSource(`extends SceneTree\n\nfunc _initialize():\n\tprint(${c.call})\n\tquit()\n`)), GEN_EMIT_OPTS);
      got = "ok";
    } catch (e) {
      got = e instanceof UnsupportedError ? ((e as { code?: string }).code ?? "无码") : "非 UnsupportedError";
    }
    if (got !== c.want) bad.push(`${c.name}: 期望 ${c.want}，实得 ${got}`);
  }
  console.log(`  转换族单实参口径 ${cells.length - bad.length}/${cells.length} 格一致（应为 ${cells.length}）${bad.length > 0 ? "：" + bad.join(" | ") : ""}`);
  if (bad.length > 0) process.exitCode = 1;
}
if (unsupported.length > 0) {
  console.log("\nemitter 缺口：");
  for (const u of unsupported) console.log(`  ${u.id.padEnd(30)} ${u.msg}`);
}
if (packCodecMismatch.length > 0) {
  for (const m of packCodecMismatch) console.log(`  ✗ ${m}`);
  process.exitCode = 1;
}
if (runFallbackMissing.length > 0) {
  for (const m of runFallbackMissing) console.log(`  ✗ ${m}`);
  process.exitCode = 1;
}
