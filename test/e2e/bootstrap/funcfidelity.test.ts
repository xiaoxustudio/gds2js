import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { emitParamSlots, frameStmtLines } from "../../../packages/compiler/src/emit/func";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`fn|${label}|`));

const F = { name: "f", params: [{ name: "a", type: { kind: "named", name: "int" } }, { name: "b", type: { kind: "named", name: "Foo" } }, { name: "c", type: null }] };

describe("bootstrap · emit/func 两支助手与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("slots")).toBeDefined();
  });

  it("② emitParamSlots", () => {
    expect(row("slots")).toBe(["fn", "slots", emitParamSlots(F as never).join(";")].join("|"));
  });

  it("② frameStmtLines", () => {
    const want = ["", frameStmtLines({ line: 7 }).join(";")];
    expect(row("frame")).toBe(["fn", "frame", ...want].join("|"));
  });
});
