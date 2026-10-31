import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { analyze } from "../../../packages/compiler/src/analyze/index";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("azd|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(`${parts[2]!}|${parts[3]!}|${parts.slice(4).join("|")}`);
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("az|src|")).length;

const SOURCES = [
  'var a: Array[int] = ["s"]\nfunc f():\n\treturn zzz\n',
  "const A = 1\nfunc f():\n\tA = 2\n",
  'extends SceneTree\nfunc f():\n\tcall_deferred("x")\n',
  "func f():\n\tvar q = 1\n\tvar g = func(): return q\n",
  "class K:\n\tvar a = zzz\n",
  "func f():\n\tvar x = pow(1)\n",
  "func f(p: PackedByteArray):\n\tp.nope()\n",
  'var d: Dictionary[String, int] = {}\nfunc f():\n\td["k"] = "v"\n',
];

describe("bootstrap · 整层 analyze 与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② analyze ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const r = analyze(mod, new Set(), "t");
      const want = r.diagnostics.map((d) => `${d.code}|${String(d.loc?.line ?? 0)}|${d.message}`);
      expect(gd.get(String(i)) ?? []).toEqual(want);
    });
  }
});
