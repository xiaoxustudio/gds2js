import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { collectLocalTypes, collectScriptBase, ctorAritiesLiteral, methodAritiesLiteral, methodParamsLiteral, staticsTableLiteral } from "../../../packages/compiler/src/emit/layout";
import type { ClassDecl, FuncDecl, TypeRef } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const gd = new Map<string, string[]>();
for (const l of lines.filter((x) => x.startsWith("lay2|") && !x.startsWith("lay2|src|"))) {
  const parts = l.split("|");
  const bucket = gd.get(parts[1]!) ?? [];
  bucket.push(parts.slice(2).join("|"));
  gd.set(parts[1]!, bucket);
}
const headerCount = lines.filter((x) => x.startsWith("lay2|src|")).length;

const SOURCES = [
  "class K:\n\tstatic func s(a, b):\n\t\tpass\n\tfunc _init(x, y = 1):\n\t\tpass\n\tfunc m(p: int, q):\n\t\tpass\n",
  'func f():\n\tvar a = 1\n\tvar b: int = 2\n\tif a:\n\t\tvar c: String = "x"\n',
  "class A:\n\tpass\nclass B extends A:\n\tpass\nclass C extends Node:\n\tpass\n",
];

function pickFuncs(mod: ReturnType<typeof lower>): FuncDecl[] {
  if (mod.funcs.length > 0) return mod.funcs;
  let list: ClassDecl[] = mod.innerClasses;
  while (list.length > 0) {
    const c = list[0]!;
    if (c.funcs.length > 0) return c.funcs;
    list = c.innerClasses;
  }
  return [];
}

describe("bootstrap · emit 布局字面量六支与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(headerCount).toBe(SOURCES.length);
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② layout2 ${String(i)}`, async () => {
      const mod = lower(await parseSource(SOURCES[i]!));
      const funcs = pickFuncs(mod);
      const cname = mod.className ?? mod.innerClasses[0]?.name ?? "M";
      const rows: string[] = [
        `lay2|${String(i)}|statics|${staticsTableLiteral(cname, funcs)}`,
        `lay2|${String(i)}|methods|${String(methodAritiesLiteral(funcs))}`,
        `lay2|${String(i)}|ctors|${String(ctorAritiesLiteral(funcs))}`,
        `lay2|${String(i)}|params|${String(methodParamsLiteral(funcs))}`,
      ];
      const out = new Map<string, TypeRef | null>();
      const untyped: string[] = [];
      for (const f of funcs) collectLocalTypes(f.body, out, untyped);
      for (const k of [...out.keys()].sort()) {
        const t = out.get(k) ?? null;
        rows.push(`lay2|${String(i)}|localv|${k}|${t !== null && t.kind === "named" ? t.name : "null"}`);
      }
      rows.push(`lay2|${String(i)}|untyped|${[...untyped].sort().join(",")}`);
      const base = new Map<string, string>();
      for (const c of mod.innerClasses) collectScriptBase(c, base);
      for (const k of [...base.keys()].sort()) rows.push(`lay2|${String(i)}|base|${k}|${base.get(k)!}`);
      expect(gd.get(String(i)) ?? []).toEqual(rows.map((r) => r.split("|").slice(2).join("|")));
    });
  }
});
