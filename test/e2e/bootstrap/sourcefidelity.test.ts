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

interface Block {
  errs: number;
  text: string;
  rows: string[];
}

function readBlocks(): Block[] {
  if (!existsSync(REF)) return [];
  const lines = readFileSync(REF, "utf8").split("\n");
  const out: Block[] = [];
  let cur: Block | null = null;
  for (const line of lines) {
    const m = /^s\|(\d+)\|(\d+)\|(.*)$/.exec(line);
    if (m) {
      cur = { errs: Number(m[2]), text: m[3]!.split("~n").join("\n").split("~t").join("\t"), rows: [] };
      out.push(cur);
      continue;
    }
    if (cur === null) continue;
    if (/^\d\|/.test(line)) cur.rows.push(line);
    else if (line.startsWith("se|")) continue;
    else cur = null;
  }
  return out;
}

const blocks = readBlocks();

describe("bootstrap · 整源 CST 与 TypeScript 参考解析器逐行对账", () => {
  it("① 样本与读数都在盘面", (ctx) => {
    if (blocks.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(blocks.length, "整源样本少于 10 组").toBeGreaterThanOrEqual(10);
    const bad = blocks.filter((b) => b.errs > 0);
    if (bad.length > 0) expect(bad.map((b) => b.text), "移植版解析失败的整源样本").toEqual([]);
  });

  for (const b of blocks) {
    it(`② ${JSON.stringify(b.text.slice(0, 32))}`, async (ctx) => {
      if (blocks.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const tree = await parseSource(b.text);
      const ts = dump((tree as unknown as { rootNode: CsNodeLike }).rootNode, 0);
      expect(b.rows.length, "GDScript 侧没有对应读数").toBeGreaterThan(0);
      const at = ts.findIndex((row, i) => row !== b.rows[i]);
      expect(b.rows, `第 ${String(at + 1)} 行不一致\n  ts: ${ts[at] ?? "<无>"}\n  gd: ${b.rows[at] ?? "<无>"}`).toEqual(ts);
    });
  }
});
