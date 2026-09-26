/**
 * 语义分析的检出率度量。
 *
 * 判据不是"我觉得该报错"，而是 **Godot 到底报没报错**：golden 里有 SCRIPT ERROR 就是预期报错。
 * - 误报：我们报错但 Godot 放过了 —— 会把能跑的代码拦死，最伤
 * - 漏报：Godot 报错但我们放过了 —— 会以"编译成功但语义错"的形式漏出去
 *
 * 跑：node_modules/.bin/tsx tools/sema-check.ts
 */
import { readFileSync } from "node:fs";
import { analyze } from "../src/lower/analyze";
import { lower } from "../src/lower/lower";
import { parseSource } from "../src/parse/parser";
import { caseScript, godotOk, listSingleCases, readGolden } from "./lib.mjs";

interface Row {
  id: string;
  code: string;
  msg: string;
}

/**
 * Godot 的报错分两类，只有**静态**那类才是语义分析层该拦的：
 *   - 解析/分析期：`SCRIPT ERROR: Parse Error: ...`，栈帧是 `at: GDScript::reload`
 *     （未声明标识符、构造调用签名不符、字典字面量重复键、非法转义…）—— 不拦就是真漏报；
 *   - 运行期：栈帧是 `at: _initialize (...)`（range 步长截断成 0、Vector2 与 float 相加、
 *     调用不存在的方法…）—— 语义分析层拦不到也不该拦，改由运行时抛错，由 diff/ops-check 覆盖。
 * 反过来，若我们把「Godot 只在运行期报错」的脚本静态拒了，那仍然是误报（照旧计入）。
 */
function isStaticReject(golden: string): boolean {
  return golden.includes("Parse Error");
}

const cases = listSingleCases();
let hit = 0;
const falsePositives: Row[] = [];
const misses: Row[] = [];
const crashes: Row[] = [];
const runtimeOnly: string[] = [];

for (const id of cases) {
  const golden = readGolden(id) ?? "";
  const expectError = !godotOk(golden) && isStaticReject(golden);
  if (!godotOk(golden) && !expectError) runtimeOnly.push(id);

  let diags: Array<{ code: string; message: string }> = [];
  let crashed = false;
  try {
    diags = analyze(lower(await parseSource(readFileSync(caseScript(id), "utf8"))));
  } catch (e) {
    crashed = true;
    diags = [{ code: "CRASH", message: e instanceof Error ? e.message : String(e) }];
  }

  if (process.argv.includes("--verbose") && diags.length > 0) {
    console.log(`  [${id}] ` + diags.map((d) => `${d.code}: ${d.message}`).join(" | "));
  }

  const gotError = diags.length > 0;
  if (crashed) {
    crashes.push({ id, code: "CRASH", msg: diags[0]?.message ?? "" });
    continue;
  }
  if (gotError === expectError) {
    hit++;
  } else if (gotError) {
    falsePositives.push({ id, code: diags[0]?.code ?? "", msg: diags[0]?.message ?? "" });
  } else {
    misses.push({ id, code: "missed", msg: "Godot 报错但我们放过了" });
  }
}

console.log(`语义分析检出：命中 ${hit}/${cases.length}`);
console.log(`  误报 ${falsePositives.length}   漏报 ${misses.length}   崩溃 ${crashes.length}`);
console.log(`  另有 ${runtimeOnly.length} 例是 Godot 运行期才报错、语义分析层不管辖的：${runtimeOnly.join(", ") || "无"}`);

const dump = (title: string, rows: Row[]) => {
  if (rows.length === 0) return;
  console.log(`\n${title}`);
  for (const r of rows) console.log(`  ${r.id.padEnd(30)} ${r.code.padEnd(22)} ${r.msg}`);
};
dump("误报（我们报错，Godot 通过）", falsePositives);
dump("漏报（Godot 报错，我们放过）", misses);
dump("崩溃", crashes);

if (falsePositives.length + misses.length + crashes.length > 0) process.exit(1);
