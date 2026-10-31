import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { Scope, capKey, declNames, diKey, gvKey, parseTyped } from "../../../packages/compiler/src/analyze/state";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n").filter((l) => l.startsWith("st|")) : [];

function field(line: string, at: number): string {
  const parts = line.split("|");
  return parts[at] ?? "";
}

describe("bootstrap · 判定状态的纯函数与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(lines.length).toBeGreaterThanOrEqual(10);
  });

  const parseRows = lines.filter((l) => l.startsWith("st|parse|"));
  for (const row of parseRows) {
    it(`② parseTyped ${field(row, 2)}`, (ctx) => {
      if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      expect(JSON.parse(field(row, 3))).toEqual(parseTyped(field(row, 2)));
    });
  }

  it("③ declNames", async (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const row = lines.find((l) => l.startsWith("st|decl|"));
    expect(row).toBeDefined();
    const mod = lower(await parseSource("var a = 1\nsignal s(b)\nfunc f():\n\tpass\nclass C:\n\tpass\n"));
    expect(JSON.parse(field(row!, 2))).toEqual(declNames(mod));
  });

  it("④ 三个键函数", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const row = lines.find((l) => l.startsWith("st|keys|"))!;
    const r = { owner: "own" } as never;
    expect(field(row, 2)).toBe(diKey(r, 3, 4));
    expect(field(row, 3)).toBe(gvKey(r, "x", 3, 4));
    expect(field(row, 4)).toBe(capKey(r, 3, 4));
  });

  it("⑤ Scope 的 has / hasLocal / allowsSelf 走同一条链", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const row = lines.find((l) => l.startsWith("st|scope|"))!;
    const g = new Scope(new Set(["gv", "gf"]), null, true);
    const c = g.child(["cv"]);
    const f = c.funcChild(["lv"], false);
    const trace = [g, c, f]
      .map((s) => `${String(s.has("gv"))}${String(s.has("lv"))}${String(s.hasLocal("gv"))}${String(s.hasLocal("lv"))}${String(s.allowsSelf())},`)
      .join("");
    expect(field(row, 2)).toBe(trace);
  });
});
