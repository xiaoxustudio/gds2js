import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");

interface CsNodeLike {
  type: string;
  fieldName: string;
  isNamed: boolean;
  hasError: boolean;
  startIndex: number;
  endIndex: number;
  startPosition: { row: number; column: number };
  children: CsNodeLike[];
  namedChildren: CsNodeLike[];
}

function dump(n: CsNodeLike, depth: number, out: string[] = []): string[] {
  out.push([depth, n.type, n.fieldName, n.isNamed ? "T" : "-", n.hasError ? "T" : "-", n.startIndex, n.endIndex, n.startPosition.row, n.startPosition.column, n.children.length, n.namedChildren.length].join("|"));
  for (const c of n.children) dump(c, depth + 1, out);
  return out;
}

function shiftOffsets(rows: string[], off: number): string[] {
  return rows.map((r, i) => {
    const f = r.split("|");
    f[5] = String(Number(f[5]) - off);
    f[6] = String(Number(f[6]) - off);
    f[8] = String(Number(f[8]) - off);
    const kept = f.slice(1).join("|");
    if (i !== 0) return kept;
    const g = kept.split("|");
    g[1] = "";
    return g.join("|");
  });
}

function gdRows(text: string): string[] {
  const lines = readFileSync(REF, "utf8").split("\n");
  const out: string[] = [];
  let inside = false;
  for (const line of lines) {
    if (line.startsWith("e|")) {
      inside = line.slice(2) === text;
      continue;
    }
    if (!inside) continue;
    if (/^\d\|/.test(line)) out.push(line.split("|").slice(1).join("|"));
    else inside = false;
  }
  return out.slice(1);
}

const samples = existsSync(REF)
  ? readFileSync(REF, "utf8")
      .split("\n")
      .filter((l) => l.startsWith("e|"))
      .map((l) => l.slice(2))
  : [];

describe("bootstrap · 表达式 CST 与 TypeScript 参考解析器逐行对账", () => {
  it("① 参照在盘面且样本够用", (ctx) => {
    if (!existsSync(REF)) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(samples.length, "表达式样本少于 10 组").toBeGreaterThanOrEqual(10);
  });

  for (const text of samples) {
    it(`② ${text}`, async (ctx) => {
      if (samples.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const tree = await parseSource(`var __v = ${text}\n`);
      const root = (tree as unknown as { rootNode: CsNodeLike }).rootNode;
      const stmt = root.children.find((c) => c.type === "variable_statement");
      if (stmt === undefined) {
        ctx.skip(true, `参考解析器对这一形不产 variable_statement（样本留给 GDScript 侧单测）：${text}`);
        return;
      }
      const named = stmt.namedChildren;
      const value = named[named.length - 1]!;
      const ts = shiftOffsets(dump(value, 0), 10);
      const gd = gdRows(text);
      expect(gd.length, `${text}：GDScript 侧没有对应读数`).toBeGreaterThan(0);
      const at = ts.findIndex((row, i) => row !== gd[i]);
      expect(gd, `${text}：第 ${String(at + 1)} 行不一致\n  ts: ${ts[at] ?? "<无>"}\n  gd: ${gd[at] ?? "<无>"}`).toEqual(ts);
    });
  }
});
