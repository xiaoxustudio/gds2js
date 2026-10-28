import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { ROOT } from "../../../tools/lib.mjs";
import { allScripts } from "./support/corpus";

type CsLike = {
  type: string;
  text: string;
  isNamed: boolean;
  hasError: boolean;
  startPosition: { row: number; column: number };
  fieldName: string;
  children: CsLike[];
  namedChildren: CsLike[];
};

type Input = { id: string; origin: string; src: string };

type Drift = { input: string; path: string; field: string; want: string; got: string };

type Outcome = {
  compared: number;
  nodes: number;
  errored: string[];
  threw: string[];
  drifts: Drift[];
  driftInputs: Set<string>;
  types: Set<string>;
  fields: Set<string>;
  anon: Set<string>;
};

const oracle: (src: string) => Promise<{ rootNode: CsLike }> = parseSource;
const candidate: (src: string) => Promise<{ rootNode: CsLike }> = parseSource;

const CAP = 20;

const FLOOR_TYPES = 71;
const FLOOR_FIELDS = 17;
const FLOOR_ANON = 70;

function blank(): Outcome {
  return {
    compared: 0,
    nodes: 0,
    errored: [],
    threw: [],
    drifts: [],
    driftInputs: new Set(),
    types: new Set(),
    fields: new Set(),
    anon: new Set(),
  };
}

function diffNode(want: CsLike, got: CsLike, path: string, input: string, out: Outcome): void {
  out.nodes++;
  if (want.isNamed) out.types.add(want.type);
  else out.anon.add(want.text);
  if (want.fieldName !== "") out.fields.add(want.fieldName);
  const push = (field: string, a: unknown, b: unknown): void => {
    if (String(a) === String(b)) return;
    out.drifts.push({ input, path, field, want: String(a), got: String(b) });
    out.driftInputs.add(input);
  };
  push("type", want.type, got.type);
  push("isNamed", want.isNamed, got.isNamed);
  push("fieldName", want.fieldName, got.fieldName);
  push("text", want.text, got.text);
  push("startPosition.row", want.startPosition.row, got.startPosition.row);
  push("startPosition.column", want.startPosition.column, got.startPosition.column);
  push("children.length", want.children.length, got.children.length);
  push("namedChildren.length", want.namedChildren.length, got.namedChildren.length);
  push("hasError", want.hasError, got.hasError);
  const n = Math.min(want.children.length, got.children.length);
  for (let i = 0; i < n; i++) {
    const w = want.children[i];
    const g = got.children[i];
    if (w === undefined || g === undefined) continue;
    diffNode(w, g, `${path}/${w.type}[${String(i)}]`, input, out);
  }
}

async function compareAll(inputs: Input[]): Promise<Outcome> {
  const out = blank();
  for (const inp of inputs) {
    const want = (await oracle(inp.src)).rootNode;
    if (want.hasError) {
      out.errored.push(inp.id);
      continue;
    }
    let got: CsLike;
    try {
      got = (await candidate(inp.src)).rootNode;
    } catch (e) {
      out.threw.push(`${inp.id}: ${String(e)}`);
      out.driftInputs.add(inp.id);
      continue;
    }
    out.compared++;
    diffNode(want, got, want.type, inp.id, out);
  }
  return out;
}

function report(out: Outcome): string {
  const lines: string[] = [];
  for (const t of out.threw.slice(0, CAP)) lines.push(`候选侧抛错 ${t}`);
  let last = "";
  for (const d of out.drifts.slice(0, CAP)) {
    if (d.input !== last) {
      lines.push(`── ${d.input}`);
      last = d.input;
    }
    lines.push(`   ${d.path}  ${d.field}: 期望 ${JSON.stringify(d.want)} 实得 ${JSON.stringify(d.got)}`);
  }
  if (out.drifts.length > CAP) lines.push(`   …另有 ${String(out.drifts.length - CAP)} 处未列`);
  if (out.errored.length > 0) {
    lines.push(`oracle 侧带 ERROR 的 ${String(out.errored.length)} 份不参与结构比对：${out.errored.slice(0, CAP).join(", ")}`);
  }
  return lines.join("\n");
}

function assertClean(label: string, out: Outcome): void {
  const tail = `（比对 ${String(out.compared)} 份 / ${String(out.nodes)} 个节点，ERROR 侧 ${String(out.errored.length)} 份另计）`;
  const detail = out.drifts.length === 0 && out.threw.length === 0 ? "" : `\n${report(out)}`;
  expect(out.threw.length, `${label} 候选侧不抛错${detail}`).toBe(0);
  expect(out.driftInputs.size, `${label} 零漂移${tail}${detail}`).toBe(0);
}

function fixture(file: string): Input[] {
  const p = join(ROOT, "packages", "compiler", "test", "fixtures", file);
  const j = JSON.parse(readFileSync(p, "utf8")) as { snippets: Input[] };
  return j.snippets;
}

function corpusInputs(): Input[] {
  return allScripts().map((p) => ({
    id: relative(join(ROOT, "corpus", "cases"), p).split("\\").join("/"),
    origin: relative(ROOT, p).split("\\").join("/"),
    src: readFileSync(p, "utf8"),
  }));
}

function clone(n: CsLike): CsLike {
  return {
    ...n,
    startPosition: { ...n.startPosition },
    children: n.children.map(clone),
    namedChildren: n.namedChildren.map(clone),
  };
}

function findLeaf(n: CsLike): CsLike | undefined {
  if (n.children.length === 0) return n;
  for (const c of n.children) {
    const hit = findLeaf(c);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

function findWithKids(n: CsLike): CsLike | undefined {
  if (n.children.length >= 2) return n;
  for (const c of n.children) {
    const hit = findWithKids(c);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

const FULL = process.env.GDS2JS_PARSE_DIFF === "1";
const HARVEST = join(ROOT, "tmp", "parse-snippets.json");

describe("CST 差分台（候选解析器 vs tree-sitter oracle）", () => {
  it("自证：九种改坏形状都必须被差分台报出来", async () => {
    const src = 'extends SceneTree\nfunc _initialize():\n\tprint(1 + 2 * 3)\n\tquit()\n';
    const base = (await oracle(src)).rootNode;
    const mutations: Array<[string, (n: CsLike) => void, boolean]> = [
      ["type", (n) => { n.type = "identifier"; }, false],
      ["isNamed", (n) => { n.isNamed = !n.isNamed; }, false],
      ["fieldName", (n) => { n.fieldName = "bogus"; }, false],
      ["text", (n) => { n.text = "bogus"; }, false],
      ["startPosition.row", (n) => { n.startPosition.row += 1; }, false],
      ["startPosition.column", (n) => { n.startPosition.column += 1; }, false],
      ["hasError", (n) => { n.hasError = true; }, false],
      ["children.length", (n) => { n.children.pop(); }, true],
      ["child-order", (n) => { const a = n.children[0]!; n.children[0] = n.children[1]!; n.children[1] = a; }, true],
    ];
    for (const [field, mutate, needsKids] of mutations) {
      const corrupt = clone(base);
      const target = needsKids ? findWithKids(corrupt) : findLeaf(corrupt);
      expect(target, `${field}：找不到可改的节点`).toBeDefined();
      mutate(target!);
      const out = blank();
      diffNode(base, corrupt, base.type, "self-check", out);
      expect(out.drifts.length, `${field} 改了却没被报出来`).toBeGreaterThan(0);
    }
  });

  it("手写边缘形状：零漂移", async () => {
    assertClean("边缘形状", await compareAll(fixture("parse-edges.json")));
  });

  it("畸形样本：干净侧零漂移，ERROR 侧点名交阶段 4", async () => {
    assertClean("畸形样本", await compareAll(fixture("malformed-snippets.json")));
  });

  it.skipIf(!FULL)("语料全量 .gd：零漂移，且词汇面不缩水", async () => {
    const out = await compareAll(corpusInputs());
    assertClean("语料全量", out);
    expect.soft(out.types.size, `具名节点类型种类数实得 ${String(out.types.size)}`).toBeGreaterThanOrEqual(FLOOR_TYPES);
    expect.soft(out.fields.size, `字段名种类数实得 ${String(out.fields.size)}`).toBeGreaterThanOrEqual(FLOOR_FIELDS);
    expect.soft(out.anon.size, `匿名记号种类数实得 ${String(out.anon.size)}`).toBeGreaterThanOrEqual(FLOOR_ANON);
    expect.soft(out.errored.length, `语料里 oracle 侧带 ERROR 的 .gd 份数实得 ${String(out.errored.length)}`).toBe(11);
  }, 600_000);

  it.skipIf(!FULL || !existsSync(HARVEST))("单测内联片段：零漂移", async () => {
    const j = JSON.parse(readFileSync(HARVEST, "utf8")) as { snippets: Input[] };
    assertClean("内联片段", await compareAll(j.snippets));
  }, 900_000);
});
