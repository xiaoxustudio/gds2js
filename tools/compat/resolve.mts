import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib.mjs";
import { buildInventories, hasMember } from "./inventories.mts";
import { scanEvidence } from "./evidence.mjs";
import { parseRoster } from "./roster-parse.mjs";

const DATA = join(ROOT, "site", "public", "data", "v1");
const scope = JSON.parse(readFileSync(join(ROOT, "tools", "compat", "scope.json"), "utf8"));
const overrides = JSON.parse(readFileSync(join(ROOT, "tools", "compat", "overrides.json"), "utf8"));
const index = JSON.parse(readFileSync(join(DATA, "index.json"), "utf8"));

const inv = buildInventories();
const classes = index.classes;
const modeled = new Set([...scope.engine.modeledClasses, ...scope.engine.hostClasses, ...scope.engine.nodeClasses]);
const unplannedClasses = new Set(scope.engine.unplannedClasses);
const unplannedMembers = scope.engine.unplannedMembers ?? {};
const roster = parseRoster();

const refs = scanEvidence({ globalNames: new Set(Object.keys(inv.globals.callables)) });
const globalImplemented = new Set(inv.globals.implemented);
const globalConstants = new Set(inv.globals.constants);
const builtinNames = new Set(index.builtinClasses ?? []);
const modeledBuiltins = new Set([...Object.keys(inv.methods), ...Object.keys(inv.props)].filter((n) => builtinNames.has(n)));
const ctors = new Set(inv.ctors);

const METHOD = new Set(["m", "bm", "uf"]);
const PROP = new Set(["p", "bp"]);
const ENUM = new Set(["e", "be", "ge"]);
const ENUM_VALUE = new Set(["v", "bv"]);
const CONST = new Set(["c", "bc", "gv"]);

function evidenceFor(o, n, kind) {
  const out = [];
  const seen = new Set();
  const push = (r) => {
    const key = `${r.k}:${r.i}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push([r.k === "case" ? "c" : "t", r.i]);
  };
  const bare = kind === "ct" ? "new" : ENUM_VALUE.has(kind) ? n.split(".").pop() : n;
  for (const r of refs.ownerRefs.get(`${o}.${n}`) ?? []) push(r);
  for (const r of refs.nameRefs.get(bare) ?? []) push(r);
  return out.slice(0, 4);
}

function overrideOf(o, n, kind) {
  return overrides[`${o}.${n}#${kind}`] ?? overrides[`${o}.${n}`] ?? null;
}

function classify(row) {
  const o = row.o;
  const n = row.n;
  const k = row.k;
  const ev = evidenceFor(o, n, k);
  const hasEvidence = ev.length > 0;
  const note = (text) => [["n", text]];

  if (k === "uf") {
    const hit = globalImplemented.has(n);
    return { status: hit ? (hasEvidence ? "implemented" : "partial") : "missing", ev: hit ? ev : note("全局函数未进 GLOBAL_CALLABLE_IMPLEMENTED，按响亮拒处理") };
  }
  if (o === "GlobalScope" && CONST.has(k)) {
    const hit = globalConstants.has(n) || globalConstants.has(n.split(".").pop());
    return { status: hit ? (hasEvidence ? "implemented" : "partial") : "missing", ev: hit ? ev : note("全局常量未进 GLOBAL_CONSTANTS") };
  }
  if (ENUM.has(k) && o === "GlobalScope") return { status: "missing", ev };

  if (builtinNames.has(o)) {
    if (!modeledBuiltins.has(o)) return { status: "missing", ev: note(scope.builtins.unmodeledReason) };
    if (METHOD.has(k)) {
      const hit = inv.methods[o]?.includes(n) ?? false;
      return hit
        ? { status: hasEvidence ? "implemented" : "partial", ev: hasEvidence ? ev : note(scope.builtins.partialReason) }
        : { status: "missing", ev: note(`${o}.${n} 不在该方法面表里`) };
    }
    if (PROP.has(k)) {
      const hit = inv.props[o]?.includes(n) ?? false;
      return hit
        ? { status: hasEvidence ? "implemented" : "partial", ev: hasEvidence ? ev : note(scope.builtins.partialReason) }
        : { status: "missing", ev: note(`${o}.${n} 不在该属性面表里`) };
    }
    if (k === "ct") {
      const hit = ctors.has(o);
      return hit
        ? { status: hasEvidence ? "implemented" : "partial", ev: hasEvidence ? ev : note(scope.builtins.partialReason) }
        : { status: "missing", ev: note(`${o} 的构造面未建模`) };
    }
    return { status: "partial", ev: note(scope.builtins.partialReason) };
  }

  if (!builtinNames.has(o) && o !== "GlobalScope" && !classes[o]) {
    return { status: "missing", ev };
  }

  if (!modeled.has(o) || unplannedClasses.has(o)) {
    const reason = scope.engine.unplannedReasons[o] ?? scope.engine.unplannedReasons.class;
    return { status: "unplanned", ev: note(reason) };
  }

  const memberNote = unplannedMembers[o]?.[n];
  if (memberNote !== undefined) return { status: "unplanned", ev: note(memberNote) };

  if (METHOD.has(k)) {
    const hit = hasMember(inv, "method", classes, o, n);
    return hit
      ? { status: hasEvidence ? "implemented" : "partial", ev: hasEvidence ? ev : note(`${o}.${n} 在派发表里，但没有逐条 golden 证据`) }
      : { status: "missing", ev: note(`${o}.${n} 未进派发表，按响亮拒处理`) };
  }
  if (PROP.has(k)) {
    const hit = hasMember(inv, "prop", classes, o, n);
    return hit
      ? { status: hasEvidence ? "implemented" : "partial", ev: hasEvidence ? ev : note(`${o}.${n} 在属性面里，但没有逐条 golden 证据`) }
      : { status: "missing", ev: note(`${o}.${n} 未进属性面，按响亮拒处理`) };
  }
  if (ENUM.has(k)) return { status: "missing", ev };
  if (ENUM_VALUE.has(k)) return { status: "missing", ev };
  return { status: "missing", ev: note("这一类引擎面未建模") };
}

const totals = { implemented: 0, partial: 0, missing: 0, unplanned: 0 };
const moduleStats = new Map();
const searchRows: [string, string, string, number, string][] = [];

for (let mi = 0; mi < index.modules.length; mi++) {
  const mod = index.modules[mi];
  const file = join(DATA, "modules", `${mod.id.replace(/[^A-Za-z0-9_-]+/g, "-")}.json`);
  const chunk = JSON.parse(readFileSync(file, "utf8"));
  const stats = { implemented: 0, partial: 0, missing: 0, unplanned: 0 };
  for (const row of chunk.rows) {
    const ov = overrideOf(row.o, row.n, row.k);
    let result;
    if (ov !== null) {
      result = { status: ov.status, ev: [["n", ov.reason ?? "人工口径"]] };
    } else {
      result = classify(row);
    }
    row.t = result.status;
    row.e = result.ev;
    stats[result.status] += 1;
    totals[result.status] += 1;
  }
  for (const row of chunk.rows) {
    if (!ENUM.has(row.k) || row.t === "unplanned") continue;
    const prefix = `${row.n}.`;
    const children = chunk.rows.filter((r) => ENUM_VALUE.has(r.k) && r.o === row.o && r.n.startsWith(prefix));
    if (children.length === 0) continue;
    const done = children.filter((r) => r.t === "implemented").length;
    const next = done === children.length ? "implemented" : done > 0 ? "partial" : row.t;
    if (next !== row.t) {
      stats[row.t] -= 1;
      stats[next] += 1;
      totals[row.t] -= 1;
      totals[next] += 1;
      row.t = next;
    }
  }
  writeFileSync(file, `${JSON.stringify(chunk)}\n`, "utf8");
  for (const row of chunk.rows) searchRows.push([row.o, row.n, row.t, mi, row.k]);
  mod.stats = stats;
  moduleStats.set(mod.id, stats);
}

writeFileSync(join(DATA, "search.json"), `${JSON.stringify(searchRows)}\n`, "utf8");
index.search = { rows: searchRows.length };
index.statsModeled = totals.implemented + totals.partial + totals.missing;
index.stats = totals;
index.roster = { cells: roster.length, codes: [...new Set(roster.map((r) => r.code))].sort() };
index.evidence = refs.stats;
writeFileSync(join(DATA, "index.json"), `${JSON.stringify(index)}\n`, "utf8");

const pct = ((totals.implemented / index.rowCount) * 100).toFixed(1);
process.stdout.write(
  `兼容性状态：${index.rowCount} 行 · 已实现 ${totals.implemented}（${pct}%）· 部分 ${totals.partial} · 未实现 ${totals.missing} · 没计划 ${totals.unplanned}\n`,
);
