import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib.mjs";

const OUT = join(ROOT, "site", "public", "data", "v1");
const SCOPE = JSON.parse(readFileSync(join(ROOT, "tools", "compat", "scope.json"), "utf8"));

const HOST = new Set(SCOPE.engine.hostClasses);
const NODE = new Set(SCOPE.engine.nodeClasses);

const KIND_ORDER = ["m", "bm", "uf", "p", "bp", "s", "c", "bc", "e", "be", "ge", "v", "bv", "gv", "op", "ct"];

function slug(id) {
  return id.replace(/[^A-Za-z0-9_-]+/g, "-");
}

function argsText(args) {
  const list = args ?? [];
  return list.map((a) => `${a.name}: ${a.type}`).join(", ");
}

function classMethodSig(m) {
  const ret = m.return_value?.type ?? "void";
  const sep = m.is_vararg ? (m.arguments?.length ? ", ..." : "...") : "";
  return `${m.name}(${argsText(m.arguments)}${sep}) -> ${ret}`;
}

function builtinMethodSig(m) {
  const ret = m.return_type ?? "void";
  const sep = m.is_vararg ? (m.arguments?.length ? ", ..." : "...") : "";
  return `${m.name}(${argsText(m.arguments)}${sep}) -> ${ret}`;
}

function utilitySig(f) {
  const sep = f.is_vararg ? (f.arguments?.length ? ", ..." : "...") : "";
  return `${f.name}(${argsText(f.arguments)}${sep}) -> ${f.return_type ?? "void"}`;
}

function classFlags(m) {
  return (m.is_static ? 1 : 0) | (m.is_vararg ? 2 : 0) | (m.is_virtual ? 4 : 0) | (m.is_const ? 8 : 0) | (m.is_required ? 16 : 0);
}

function enumRows(owner, enums, kindEnum, kindValue) {
  const rows = [];
  for (const e of enums ?? []) {
    rows.push({ o: owner, k: kindEnum, n: e.name, s: `${(e.values ?? []).length} values`, f: e.is_bitfield ? 1 : 0, h: null, t: "missing", e: [] });
    for (const v of e.values ?? []) {
      rows.push({ o: owner, k: kindValue, n: `${e.name}.${v.name}`, s: String(v.value), f: 0, h: null, t: "missing", e: [] });
    }
  }
  return rows;
}

function familyOf(classes, name) {
  const chain = [];
  const seen = new Set();
  let cur = name;
  for (;;) {
    if (seen.has(cur)) break;
    seen.add(cur);
    chain.push(cur);
    const next = classes.get(cur)?.inherits;
    if (next === null || next === undefined) break;
    cur = next;
  }
  chain.reverse();
  if (chain[0] === "Object") chain.shift();
  return chain[1] ?? chain[0] ?? name;
}

function classModule(classes, name) {
  if (HOST.has(name)) return `host:${name}`;
  if (NODE.has(name)) return "node";
  return `engine:${familyOf(classes, name)}`;
}

function moduleLabel(id) {
  const [family, tail] = id.split(":");
  if (family === "global") return "GlobalScope";
  if (family === "builtin") return `内建 · ${tail}`;
  if (family === "host") return `宿主 · ${tail}`;
  if (family === "node") return "节点与对象";
  return `引擎 · ${tail}`;
}

function moduleFamily(id) {
  return id.split(":")[0];
}

function sortRows(a, b) {
  if (a.o !== b.o) return a.o < b.o ? -1 : 1;
  const ka = KIND_ORDER.indexOf(a.k);
  const kb = KIND_ORDER.indexOf(b.k);
  if (ka !== kb) return ka - kb;
  return a.n < b.n ? -1 : a.n > b.n ? 1 : 0;
}

export function snapshot(apiPath) {
  const api = JSON.parse(readFileSync(apiPath, "utf8"));
  const header = api.header;
  const classes = new Map(api.classes.map((c) => [c.name, c]));
  const modules = new Map();
  const classIndex = Object.create(null);
  const push = (module, row) => {
    if (!modules.has(module)) modules.set(module, []);
    modules.get(module).push(row);
  };

  for (const f of api.utility_functions ?? []) {
    push("global", { o: "GlobalScope", k: "uf", n: f.name, s: utilitySig(f), f: f.is_vararg ? 2 : 0, h: f.hash ?? null, t: "missing", e: [] });
  }
  for (const g of api.global_enums ?? []) {
    push("global", { o: "GlobalScope", k: "ge", n: g.name, s: `${(g.values ?? []).length} values`, f: g.is_bitfield ? 1 : 0, h: null, t: "missing", e: [] });
    for (const v of g.values ?? []) {
      push("global", { o: "GlobalScope", k: "gv", n: `${g.name}.${v.name}`, s: String(v.value), f: 0, h: null, t: "missing", e: [] });
    }
  }
  for (const c of api.global_constants ?? []) {
    push("global", { o: "GlobalScope", k: "c", n: c.name, s: `${c.type} = ${c.value}`, f: 0, h: null, t: "missing", e: [] });
  }

  const singletons = new Set((api.singletons ?? []).map((s) => s.type));

  for (const b of api.builtin_classes ?? []) {
    const mod = `builtin:${b.name}`;
    for (const m of b.methods ?? []) {
      push(mod, { o: b.name, k: "bm", n: m.name, s: builtinMethodSig(m), f: classFlags(m), h: m.hash ?? null, t: "missing", e: [] });
    }
    for (const m of b.members ?? []) {
      push(mod, { o: b.name, k: "bp", n: m.name, s: m.type, f: 0, h: null, t: "missing", e: [] });
    }
    for (const c of b.constants ?? []) {
      push(mod, { o: b.name, k: "bc", n: c.name, s: `${c.type} = ${c.value}`, f: 0, h: null, t: "missing", e: [] });
    }
    for (const row of enumRows(b.name, b.enums, "be", "bv")) push(mod, row);
    for (const op of b.operators ?? []) {
      push(mod, { o: b.name, k: "op", n: `${op.name} ${op.right_type ?? "none"}`, s: `right: ${op.right_type ?? "none"} -> ${op.return_type ?? "void"}`, f: 0, h: null, t: "missing", e: [] });
    }
    for (const c of b.constructors ?? []) {
      push(mod, { o: b.name, k: "ct", n: `new[${c.index}]`, s: `constructor[${c.index}]`, f: 0, h: null, t: "missing", e: [] });
    }
  }

  for (const c of api.classes ?? []) {
    const mod = classModule(classes, c.name);
    classIndex[c.name] = {
      m: mod,
      i: c.inherits ?? null,
      sg: singletons.has(c.name),
      ins: !!c.is_instantiable,
      rc: !!c.is_refcounted,
    };
    for (const m of c.methods ?? []) {
      push(mod, { o: c.name, k: "m", n: m.name, s: classMethodSig(m), f: classFlags(m), h: m.hash ?? null, t: "missing", e: [] });
    }
    for (const p of c.properties ?? []) {
      push(mod, { o: c.name, k: "p", n: p.name, s: p.type, f: 0, h: null, t: "missing", e: [] });
    }
    for (const s of c.signals ?? []) {
      push(mod, { o: c.name, k: "s", n: s.name, s: `signal ${s.name}(${argsText(s.arguments)})`, f: 0, h: null, t: "missing", e: [] });
    }
    for (const row of enumRows(c.name, c.enums, "e", "v")) push(mod, row);
    for (const k of c.constants ?? []) {
      push(mod, { o: c.name, k: "c", n: k.name, s: String(k.value), f: 0, h: null, t: "missing", e: [] });
    }
  }

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(join(OUT, "modules"), { recursive: true });

  const moduleIndex = [];
  let rowCount = 0;
  for (const id of [...modules.keys()].sort()) {
    const rows = modules.get(id).sort(sortRows);
    rowCount += rows.length;
    const owners = [...new Set(rows.map((r) => r.o))].sort();
    const chunk = {
      id,
      label: moduleLabel(id),
      family: moduleFamily(id),
      cols: ["o", "k", "n", "s", "f", "h", "t", "e"],
      rows,
    };
    writeFileSync(join(OUT, "modules", `${slug(id)}.json`), `${JSON.stringify(chunk)}\n`, "utf8");
    moduleIndex.push({ id, label: chunk.label, family: chunk.family, rows: rows.length, owners });
  }

  const index = {
    schema: 1,
    engine: {
      major: header.version_major,
      minor: header.version_minor,
      patch: header.version_patch,
      status: header.version_status,
      build: header.version_build,
      fullName: header.version_full_name,
      precision: header.precision,
    },
    rowCount,
    modules: moduleIndex,
    classes: classIndex,
    builtinClasses: (api.builtin_classes ?? []).map((b) => b.name).sort(),
    singletons: [...singletons].sort(),
  };
  writeFileSync(join(OUT, "index.json"), `${JSON.stringify(index)}\n`, "utf8");
  return { index, moduleCount: moduleIndex.length, rowCount };
}

export function listModules() {
  const dir = join(OUT, "modules");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
}
