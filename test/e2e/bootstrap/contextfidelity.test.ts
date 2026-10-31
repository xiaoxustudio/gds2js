import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { analysis, beginEmit, ctx, newContext } from "../../../packages/compiler/src/emit/context";
import { NO_ANALYSIS } from "../../../packages/compiler/src/analyze/analysis-result";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`cx|${label}|`));

function tag(v: unknown): string {
  if (v instanceof Set || v instanceof Map) return "dict";
  if (Array.isArray(v)) return "array";
  if (v === null) return "null";
  if (typeof v === "boolean") return "bool";
  if (typeof v === "number") return "int";
  if (typeof v === "string") return "str";
  return "other";
}

describe("bootstrap · 发射上下文初值与 TypeScript newContext 逐键对账", () => {
  it("① 读数在盘面", (ctxOrSkip) => {
    if (lines.length === 0) ctxOrSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("keys")).toBeDefined();
  });

  it("② 键数", () => {
    const keys = Object.keys(newContext()).sort();
    expect(row("keys")).toBe(["cx", "keys", String(keys.length)].join("|"));
  });

  for (const key of Object.keys(newContext()).sort()) {
    it(`② ctx.${key}`, () => {
      expect(row(key)).toBe(`cx|${key}|${tag((newContext() as unknown as Record<string, unknown>)[key])}`);
    });
  }

  it("② beginEmit 重置", () => {
    ctx.MODULE_VARS.add("x");
    beginEmit({} as never);
    expect(row("reset")).toBe(["cx", "reset", String(ctx.MODULE_VARS.size), String(analysis !== NO_ANALYSIS)].join("|"));
  });
});
