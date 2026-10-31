import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import {
  assignTargetName,
  classTable,
  collectLocalNames,
  collectReads,
  flattenBody,
  guaranteedReturn,
  inheritedNames,
  moduleAssignedNames,
  patternBindings,
  walkExprKinds,
} from "../../../packages/compiler/src/analyze/walk";
import type { Expr, Module } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`wb|${label}|`));
const cell = (v: unknown): string => String(v);

const WALK_SRC = 'var mod_a = 1\nvar mod_b = 2\nvar obj = {"k": 3}\n\nfunc f(a, b):\n\tvar x = 1\n\tx = a + b\n\tfor i in range(3):\n\t\tx += i\n\tif x > 2:\n\t\tvar y = x\n\telse:\n\t\ty = 0\n\tmatch x:\n\t\t[1, 2]:\n\t\t\tx = 3\n\t\t{"k": q}:\n\t\t\tx = 4\n\t\t_:\n\t\t\tx = 5\n\treturn x\n\nfunc g():\n\tpass\n\nclass Base:\n\tvar bv = 1\n\nclass Child extends Base:\n\tvar cv = 2\n\n\tfunc h():\n\t\treturn cv\n';

let mod: Module;
async function load(): Promise<Module> {
  mod ??= lower(await parseSource(WALK_SRC));
  return mod;
}

describe("bootstrap · analyze/walk 纯函数与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("assigned")).toBeDefined();
  });

  it("② moduleAssignedNames", async () => {
    const want = [...moduleAssignedNames(await load())].sort().join(", ");
    expect(row("assigned")).toBe(`wb|assigned|${want}`);
  });

  it("② flattenBody", async () => {
    const m = await load();
    const flat = flattenBody(m.funcs[0]!.body);
    const kinds = flat.filter((n) => n.kind !== undefined).map((n) => String(n.kind)).sort();
    expect(row("flat")).toBe(`wb|flat|${String(flat.length)}|${kinds.join(", ")}`);
  });

  it("② collectLocalNames", async () => {
    const m = await load();
    const out = new Set<string>();
    collectLocalNames(m.funcs[0]!.body, m.funcs[0]!.params.map((p) => p.name), out);
    expect(row("locals")).toBe(`wb|locals|${[...out].sort().join(", ")}`);
  });

  it("② classTable / inheritedNames", async () => {
    const m = await load();
    const table = classTable(m);
    expect(row("classes")).toBe(`wb|classes|${[...table.keys()].sort().join(", ")}`);
    const child = m.innerClasses.find((c) => c.extends !== null)!;
    expect(row(`inherit|${child.name}`)).toBe(`wb|inherit|${child.name}|${inheritedNames(child, table).join(", ")}`);
  });

  it("② guaranteedReturn", async () => {
    const m = await load();
    expect(row("gret")).toBe(["wb", "gret", ...m.funcs.map((f) => cell(guaranteedReturn(f.body)))].join("|"));
  });

  it("② assignTargetName", () => {
    const want = [
      assignTargetName({ kind: "ident", name: "x" }),
      assignTargetName({ kind: "attribute", name: "p", obj: { kind: "ident", name: "self" } }),
      assignTargetName({ kind: "attribute", name: "p", obj: { kind: "ident", name: "o" } }),
      assignTargetName({ kind: "index" }),
    ].map(cell);
    expect(row("assign")).toBe(["wb", "assign", ...want].join("|"));
  });

  it("② patternBindings", () => {
    const want = [
      patternBindings({ kind: "bind", name: "a" } as never).join(", "),
      patternBindings({ kind: "array", items: [{ kind: "bind", name: "a" }, { kind: "wildcard" }] } as never).join(", "),
      patternBindings({ kind: "dict", entries: [{ pattern: { kind: "bind", name: "q" } }, { pattern: { kind: "bind", name: "r" } }] } as never).join(", "),
      patternBindings({ kind: "wildcard" } as never).join(", "),
    ].map(cell);
    expect(row("bind")).toBe(["wb", "bind", ...want].join("|"));
  });

  it("② collectReads", () => {
    const out = new Set<string>();
    collectReads({ kind: "binary", left: { kind: "ident", name: "x" }, right: { kind: "ident", name: "y" } }, new Set(["x"]), out);
    expect(row("reads")).toBe(`wb|reads|${[...out].sort().join(", ")}`);
  });

  it("② walkExprKinds", () => {
    const out: Expr[] = [];
    walkExprKinds({ kind: "binary", left: { kind: "is", operand: { kind: "ident", name: "x" } }, right: { kind: "as", operand: { kind: "ident", name: "y" } }, loc: { line: 1 } } as never, out as never[]);
    expect(row("ikinds")).toBe(["wb", "ikinds", cell(out.length)].join("|"));
  });
});
