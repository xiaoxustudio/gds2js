/**
 * 门脚本那对 eq / shouldThrow 的 Vitest 版，外加 ok / bad。
 *
 * 口径钉死不动：**两边都过 String()**。`String()` 会把 2 / 2n / "2" 折成同一个 "2"，
 * 换成类型化 matcher（toBe / toStrictEqual）会在迁移当口凭空造出一堆红的格子，
 * 那是分诊工作、不是迁移工作。
 *
 * 计数走 task.meta：Vitest 会把 meta 序列化回主进程，所以 assert-count-reporter 能
 * 跨文件、跨 fork 把「通过 N，失败 M」重新加总出来，读数原样保住。读数不等于静态调用点
 * 个数（ops 是 1509 对 1403）—— 表驱动 helper 会循环生成断言，只有运行时才知道总数。
 *
 * 失败用 expect.soft：记一笔、**继续跑**，最后一起报。用 expect() 会在第一格红处
 * 中断那个 it()，region 内后续的格子全丢。
 *
 * **一个 it() = 一个原子 region**：region 内的 eq 读的是它前面语句累积下来的状态
 * （两条断言之间夹着 `g.set(-1, …)` 那种），拆成一格一个 it() 就把状态链切断了。
 *
 * 本包**不依赖任何 @gds2js/\* 包**（见 package.json 的 description）：
 * runtime --dev--> testkit --dep--> runtime 会成环，turbo 的 ^typecheck 图会拒。
 */
import { expect, TestRunner } from "vitest";

/** 与 packages/runtime/test/support/assert-count-reporter.ts 里的 META_KEY 是同一个字面量。
 *  那边不 import 本包（reporter 跑在主进程、本包跑在 worker），所以两处各写一份。 */
const META_KEY = "gds2jsAsserts";

type Counters = { pass: number; fail: number };

/** it() 外面调用时（收集期）的兜底桶，免得读 meta 炸掉真断言。 */
const orphan: Counters = { pass: 0, fail: 0 };

function counters(): Counters {
  const task = TestRunner.getCurrentTest() as { meta?: Record<string, unknown> } | undefined;
  const meta = task?.meta;
  if (meta === undefined) return orphan;
  const hit = meta[META_KEY];
  if (typeof hit === "object" && hit !== null) return hit as Counters;
  const fresh: Counters = { pass: 0, fail: 0 };
  meta[META_KEY] = fresh;
  return fresh;
}

/** Godot 那两个错误类把 name 钉死在实例上（packages/runtime/src/runtime/errors.ts:2,13），
 *  所以按 name 认、不按 instanceof 认 —— 这正是本包不必 import @gds2js/runtime 的原因，
 *  也是 runtime 自己的 errOf() 用的同一招（「认 name 不认实例」）。 */
const EXPECTED_ERROR_NAMES: ReadonlySet<string> = new Set(["UnsupportedError", "GodotRuntimeError"]);

export function isExpectedThrow(e: unknown): boolean {
  return e instanceof Error && EXPECTED_ERROR_NAMES.has(e.name);
}

const THROW_WANT = "抛了 UnsupportedError / GodotRuntimeError";

/** 与旧 eq 逐字同口径：`String(actual) === String(expected)` 就算过。
 *  失败消息也与旧的一致：`<caseId>  <what>：期望 <want>，实得 <got>`。 */
export function eq(caseId: string, what: string, actual: unknown, expected: unknown): void {
  const got = String(actual);
  const want = String(expected);
  const c = counters();
  if (got === want) {
    c.pass++;
    return;
  }
  c.fail++;
  expect.soft(got, `${caseId}  ${what}：期望 ${want}，实得 ${got}`).toBe(want);
}

/** 与旧 shouldThrow 同口径：抛 UnsupportedError / GodotRuntimeError 才算过；
 *  没抛、或抛了别的，都记一笔红的并**继续跑**。两条失败文案逐字沿用旧实现。 */
export function shouldThrow(caseId: string, what: string, fn: () => unknown): void {
  const c = counters();
  let detail: string;
  try {
    const r = fn();
    detail = `期望抛错，实得 ${String(r)}`;
  } catch (e) {
    if (isExpectedThrow(e)) {
      c.pass++;
      return;
    }
    detail = `抛了非预期错误 ${String(e)}`;
  }
  c.fail++;
  expect.soft(detail, `${caseId}  ${what}`).toBe(THROW_WANT);
}

/** 旧 tools/tree-face-check.ts / cli-native-check.mjs 那对口径：
 *  `ok(msg)` 记一笔过的，`bad(msg)` 记一笔红的并继续。 */
export function ok(what: string, cond = true): void {
  const c = counters();
  if (cond) {
    c.pass++;
    return;
  }
  c.fail++;
  expect.soft(cond, `✗ ${what}`).toBe(true);
}

export function bad(what: string): void {
  ok(what, false);
}
