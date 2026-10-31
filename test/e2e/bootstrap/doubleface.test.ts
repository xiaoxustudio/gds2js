import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const rows = existsSync(REF)
  ? readFileSync(REF, "utf8")
      .split("\n")
      .filter((l) => l.startsWith("d|"))
      .map((l) => l.split("|"))
  : [];

describe("bootstrap · 移植版 parseGdDouble 与引擎自己的 to_float 逐格一致", () => {
  it("① 读数在盘面", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length, "float 样本少于 12 组").toBeGreaterThanOrEqual(12);
  });

  for (const r of rows) {
    it(`② ${r[1] ?? "?"}`, (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      expect(r[2], `parse_gd_double(${r[1]}) 与 to_float 不一致：${r[3]} vs ${r[4]}`).toBe("true");
    });
  }
});
