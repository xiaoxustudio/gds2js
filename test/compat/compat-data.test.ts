import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { GODOT_PIN, ROOT } from "../../tools/lib.mjs";
import { parseRoster } from "../../tools/compat/roster-parse.mjs";

type Evidence = [string, string];

interface Row {
  o: string;
  k: string;
  n: string;
  s: string;
  f: number;
  h: number | null;
  t: string;
  e: Evidence[];
}

interface Chunk {
  id: string;
  rows: Row[];
}

interface Index {
  schema: number;
  engine: { major: number; minor: number; patch: number; fullName: string };
  rowCount: number;
  modules: { id: string; rows: number; stats: Record<string, number> }[];
  stats: Record<string, number>;
  roster: { cells: number; codes: string[] };
  search: { rows: number };
  builtinClasses: string[];
}

const DATA = join(ROOT, "site", "public", "data", "v1");
const STATUSES = new Set(["implemented", "partial", "missing", "unplanned"]);

function slug(id: string): string {
  return id.replace(/[^A-Za-z0-9_-]+/g, "-");
}

const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8")) as Index;
const chunks = index.modules.map((m) => JSON.parse(readFileSync(join(DATA, "modules", `${slug(m.id)}.json`), "utf8")) as Chunk);

describe("compat · 数据快照", () => {
  it("引擎读数跟仓库钉住的版本一致", () => {
    expect(index.schema).toBe(1);
    expect(`${index.engine.major}.${index.engine.minor}.${index.engine.patch}`).toBe(GODOT_PIN);
    expect(index.builtinClasses).toContain("String");
    expect(index.builtinClasses).toContain("Transform3D");
  });

  it("行数与模块统计自洽", () => {
    const rows = chunks.reduce((n, c) => n + c.rows.length, 0);
    expect(rows).toBe(index.rowCount);
    for (const m of index.modules) {
      const chunk = chunks.find((c) => c.id === m.id);
      expect(chunk, m.id).toBeDefined();
      expect(chunk?.rows.length, m.id).toBe(m.rows);
      const sum = Object.values(m.stats).reduce((a, b) => a + b, 0);
      expect(sum, m.id).toBe(m.rows);
    }
    expect(Object.values(index.stats).reduce((a, b) => a + b, 0)).toBe(index.rowCount);
    const search = JSON.parse(readFileSync(join(DATA, "search.json"), "utf8")) as unknown[];
    expect(search.length).toBe(index.rowCount);
  });

  it("每个模块内行 id 唯一且状态合法", () => {
    for (const chunk of chunks) {
      const ids = new Set<string>();
      for (const row of chunk.rows) {
        const id = `${row.o}.${row.n}#${row.k}`;
        expect(ids.has(id), `${chunk.id}: ${id}`).toBe(false);
        ids.add(id);
        expect(STATUSES.has(row.t), `${chunk.id}: ${id} -> ${row.t}`).toBe(true);
      }
    }
  });
});

describe("compat · 状态与证据", () => {
  it("已实现必须带语料或测试证据", () => {
    for (const chunk of chunks) {
      for (const row of chunk.rows) {
        if (row.t !== "implemented") continue;
        const backed = row.e.some((e) => e[0] === "c" || e[0] === "t");
        expect(backed, `${chunk.id}: ${row.o}.${row.n}`).toBe(true);
      }
    }
  });

  it("没计划必须写明理由", () => {
    for (const chunk of chunks) {
      for (const row of chunk.rows) {
        if (row.t !== "unplanned") continue;
        const note = row.e.some((e) => e[0] === "n" && e[1].trim() !== "");
        expect(note, `${chunk.id}: ${row.o}.${row.n}`).toBe(true);
      }
    }
  });

  it("证据路径真实存在，语料证据带 godot.txt", () => {
    for (const chunk of chunks) {
      for (const row of chunk.rows) {
        for (const [kind, id] of row.e) {
          if (kind === "c") {
            const gd = join(ROOT, "corpus", "cases", id, "main.gd");
            expect(existsSync(gd), `${chunk.id}: ${gd}`).toBe(true);
            expect(existsSync(join(dirname(gd), "godot.txt")), gd).toBe(true);
          }
          if (kind === "t") {
            const file = join(ROOT, "packages", "runtime", "test", `${id}.test.ts`);
            expect(existsSync(file), `${chunk.id}: ${file}`).toBe(true);
          }
        }
      }
    }
  });

  it("roster 拒绝码都是定形代码并进了索引", () => {
    const cells = parseRoster();
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.length).toBe(index.roster.cells);
    for (const cell of cells) {
      expect(cell.code, cell.label).toMatch(/^[a-z0-9-]+$/);
      expect(index.roster.codes).toContain(cell.code);
    }
  });

  it("overrides 的键都指向真实行且带理由", () => {
    const overrides = JSON.parse(readFileSync(join(ROOT, "tools", "compat", "overrides.json"), "utf8")) as Record<
      string,
      { status?: string; reason?: string }
    >;
    const ids = new Set<string>();
    for (const chunk of chunks) for (const row of chunk.rows) ids.add(`${row.o}.${row.n}`);
    for (const [key, value] of Object.entries(overrides)) {
      const base = key.split("#")[0] ?? key;
      expect(ids.has(base), key).toBe(true);
      expect(STATUSES.has(value.status ?? ""), key).toBe(true);
      expect((value.reason ?? "").trim() === "", key).toBe(false);
    }
  });
});
