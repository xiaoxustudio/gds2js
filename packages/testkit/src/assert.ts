import { expect, TestRunner } from "vitest";

const META_KEY = "gds2jsAsserts";

type Counters = { pass: number; fail: number };

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

const EXPECTED_ERROR_NAMES: ReadonlySet<string> = new Set(["UnsupportedError", "GodotRuntimeError"]);

export function isExpectedThrow(e: unknown): boolean {
  return e instanceof Error && EXPECTED_ERROR_NAMES.has(e.name);
}

const THROW_WANT = "抛了 UnsupportedError / GodotRuntimeError";

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
