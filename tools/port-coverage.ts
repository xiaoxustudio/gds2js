import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib.mjs";

const TS_ROOT = join(ROOT, "packages");
const GD_ROOT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc");
const RATCHET = join(ROOT, "test", "fixtures", "bootstrap", "port-coverage.json");

const SKIP_TS = new Set(["compiler/src/parse/descent/index.ts"]);

const GD_OVERRIDE: Record<string, string> = {
  "compiler/src/analyze/state.ts": "analyze_state.gd",
  "compiler/src/analyze/index.ts": "analyze_idx.gd",
  "compiler/src/analyze/checks/collections/method-arity.ts": "method_arity.gd",
  "compiler/src/analyze/checks/collections/index-slots.ts": "index_slots.gd",
  "compiler/src/emit/expr-boxed.ts": "expr_boxed.gd",
  "compiler/src/semantics/node-face.ts": "node_face.gd",
  "compiler/src/parse/parser.ts": "source.gd",
  "compiler/src/home-lib.ts": "home_lib.gd",
  "compiler/src/analyze/checks/collections/var-assign.ts": "var_assign.gd",
  "compiler/src/analyze/checks/collections/pack.ts": "pack.gd",
  "compiler/src/emit/stmt.ts": "emit_stmt.gd",
  "compiler/src/emit/index.ts": "module_emit.gd",
  "compiler/src/compile/project.ts": "project.gd",
  "gds2js/src/cli/main.ts": "cli_main.gd",
};
const SKIP_DIRS = new Set<string>([]);

export interface ModuleCoverage {
  module: string;
  gd: string | null;
  tsFuncs: number;
  gdFuncs: number;
  covered: number;
  missing: string[];
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "node_modules" && name !== "dist" && name !== "test") walk(p, out);
    } else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

function tsExports(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const names: string[] = [];
  for (const m of text.matchAll(/^export (?:async )?function (\w+)/gm)) names.push(m[1]!);
  return names;
}

function gdStatics(file: string): string[] {
  const text = readFileSync(file, "utf8");
  const names: string[] = [];
  for (const m of text.matchAll(/^static func (\w+)/gm)) names.push(m[1]!);
  return names;
}

const snake = (s: string): string => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

export function coverage(): ModuleCoverage[] {
  const files = [...walk(join(TS_ROOT, "compiler", "src")), ...walk(join(TS_ROOT, "gds2js", "src"))];
  const rows: ModuleCoverage[] = [];
  for (const f of files) {
    const rel = relative(join(TS_ROOT), f).split("\\").join("/");
    const dir = rel.split("/").slice(1, -1).join("/");
    if (SKIP_TS.has(rel)) continue;
    if (dir.split("/").some((seg) => SKIP_DIRS.has(seg))) continue;
    const exports = tsExports(f);
    if (exports.length === 0) continue;
    const stem = snake(basename(f, ".ts"));
    const dirStem = rel.split("/").slice(-2, -1)[0] ?? "";
    const candidates = [GD_OVERRIDE[rel], stem + ".gd", dirStem + "_" + stem + ".gd"].filter((x): x is string => x !== undefined);
    const gdName = GD_OVERRIDE[rel] ?? candidates.find((c) => existsSync(join(GD_ROOT, c))) ?? candidates[candidates.length - 1]!;
    const gdPath = join(GD_ROOT, gdName);
    const statics = existsSync(gdPath) ? gdStatics(gdPath) : [];
    const lowered = new Set(statics.map((s) => s.replace(/_/g, "").toLowerCase()));
    const missing = exports.filter((e) => !lowered.has(e.toLowerCase()));
    rows.push({ module: rel, gd: existsSync(gdPath) ? gdName : null, tsFuncs: exports.length, gdFuncs: statics.length, covered: exports.length - missing.length, missing });
  }
  rows.sort((a, b) => a.module.localeCompare(b.module));
  return rows;
}

export function totals(rows: ModuleCoverage[]): { modules: number; ported: number; funcs: number; covered: number } {
  return {
    modules: rows.length,
    ported: rows.filter((r) => r.gd !== null).length,
    funcs: rows.reduce((a, r) => a + r.tsFuncs, 0),
    covered: rows.reduce((a, r) => a + r.covered, 0),
  };
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const rows = coverage();
  const t = totals(rows);
  const check = process.argv.includes("--check");
  if (!check) {
    for (const r of rows) console.log(`${r.module.padEnd(46)} ${r.gd === null ? "-" : r.gd.padEnd(20)} ${String(r.covered).padStart(3)}/${String(r.tsFuncs).padStart(3)}`);
    console.log(`\n模块 ${String(t.modules)}（已建 ${String(t.ported)}）· 函数覆盖 ${String(t.covered)}/${String(t.funcs)}`);
  }
  if (process.argv.includes("--write")) {
    writeFileSync(RATCHET, JSON.stringify({ totals: t, modules: Object.fromEntries(rows.map((r) => [r.module, r.covered])) }, null, 1) + "\n", "utf8");
    console.log("port-coverage.json 写出");
  }
}
