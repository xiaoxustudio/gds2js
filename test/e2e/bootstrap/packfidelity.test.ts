import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { checkPackArgSlots, checkPackIsAs } from "../../../packages/compiler/src/analyze/checks/collections/pack";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("pkd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("pk|src|")).length;

const SOURCES = [
  'var s: StringName = &"x"\nfunc f():\n\tif s is String:\n\t\tpass\n',
  "func f():\n\tvar b = [1] as PackedByteArray\n",
  'func f():\n\tvar c = "s" as PackedFloat32Array\n',
  "func f():\n\tif [1] is PackedByteArray:\n\t\tpass\n",
  'var a = PackedByteArray()\nfunc f():\n\ta.append("s")\n\ta.append(1)\n\ta.append_array([1])\n\ta.set(0, "s")\n\ta.insert("s", 1)\n\ta.fill("s")\n',
];

describe("bootstrap · pack 检查与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② pack ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const diags: Array<{ code: string; message: string; loc: { line: number } }> = [];
      checkPackIsAs(mod, diags as never[]);
      checkPackArgSlots(mod, diags as never[]);
      const want = diags.map((d) => `${d.code}|${String(d.loc.line)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
