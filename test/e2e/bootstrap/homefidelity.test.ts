import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fnv1a } from "../../../packages/compiler/src/home-lib";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = lines.find((l) => l.startsWith("hl|fnv|"));

describe("bootstrap · home-lib 的 fnv1a 与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row).toBeDefined();
  });

  it("② fnv1a 六形", () => {
    const want = ["", "a", "abc", "gds2js", "中", "😀"].map((s) => fnv1a(s));
    expect(row!.split("|").slice(2).join("|")).toBe(want.join("|"));
  });
});
