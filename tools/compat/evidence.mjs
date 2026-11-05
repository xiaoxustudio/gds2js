import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, listCases } from "../lib.mjs";

function stripCode(text) {
  return text
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/#.*$/gm, "");
}

function addRef(map, key, ref) {
  let list = map.get(key);
  if (list === undefined) {
    list = [];
    map.set(key, list);
  }
  if (list.some((r) => r.k === ref.k && r.i === ref.i)) return;
  if (list.length < 6) list.push(ref);
}

export function scanEvidence({ globalNames = new Set() } = {}) {
  const cases = listCases("");
  const nameRefs = new Map();
  const ownerRefs = new Map();
  const globals = new Set();
  let caseCount = 0;

  for (const id of cases) {
    if (id.startsWith("000-")) continue;
    const gd = join(ROOT, "corpus", "cases", id, "main.gd");
    if (!existsSync(gd)) continue;
    caseCount += 1;
    const ref = { k: "case", i: id, p: `corpus/cases/${id}/main.gd` };
    const code = stripCode(readFileSync(gd, "utf8"));
    for (const m of code.matchAll(/\b([A-Z]\w*)\.([A-Za-z_]\w*)\s*\(/g)) {
      addRef(ownerRefs, `${m[1]}.${m[2]}`, ref);
      addRef(nameRefs, m[2], ref);
    }
    for (const m of code.matchAll(/\.([A-Za-z_]\w*)\s*\(/g)) addRef(nameRefs, m[1], ref);
    for (const m of code.matchAll(/\.([A-Za-z_]\w*)\b(?!\s*\()/g)) addRef(nameRefs, m[1], ref);
    for (const m of code.matchAll(/\b([a-z_]\w*)\s*\(/g)) {
      if (globalNames.has(m[1])) {
        globals.add(m[1]);
        addRef(nameRefs, m[1], ref);
      }
    }
  }

  const testDir = join(ROOT, "packages", "runtime", "test");
  const testFiles = existsSync(testDir) ? readdirSync(testDir).filter((f) => f.endsWith(".test.ts")) : [];
  for (const file of testFiles) {
    const ref = { k: "test", i: file.replace(/\.test\.ts$/, ""), p: `packages/runtime/test/${file}` };
    const text = readFileSync(join(testDir, file), "utf8");
    for (const m of text.matchAll(/method\([^,\n]+,\s*"([A-Za-z_]\w*)"/g)) addRef(nameRefs, m[1], ref);
    for (const m of text.matchAll(/attribute\([^,\n]+,\s*"([A-Za-z_]\w*)"/g)) addRef(nameRefs, m[1], ref);
  }

  return { nameRefs, ownerRefs, globals, stats: { cases: caseCount, tests: testFiles.length } };
}
