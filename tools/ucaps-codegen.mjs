import { readFileSync } from "node:fs";
import { ROOT } from "./lib.mjs";

export function parseSweep(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const m = /^([0-9a-f]+)\|(.*)\|(.*)$/.exec(line);
    if (m === null) continue;
    rows.push({ cp: Number.parseInt(m[1], 16), upper: m[2], lower: m[3] });
  }
  return rows;
}

function cps(s) {
  const out = [];
  for (const ch of s) out.push(ch.codePointAt(0));
  return out;
}

export function computeCaps(rows) {
  const upper = new Map();
  const lower = new Map();
  const multiUpper = new Map();
  const multiLower = new Map();
  for (const r of rows) {
    const u = cps(r.upper);
    const l = cps(r.lower);
    if (u.length === 1 && u[0] !== r.cp) upper.set(r.cp, u[0]);
    else if (u.length > 1) multiUpper.set(r.cp, u);
    if (l.length === 1 && l[0] !== r.cp) lower.set(r.cp, l[0]);
    else if (l.length > 1) multiLower.set(r.cp, l);
  }
  return { upper, lower, multiUpper, multiLower };
}

export function parseCommitted(text) {
  const one = (name) => {
    const at = text.indexOf(`const ${name}`);
    const end = text.indexOf("\n];", at);
    const pairs = new Map();
    for (const m of text.slice(at, end).matchAll(/\[(0x[0-9a-fA-F]+),\s*(0x[0-9a-fA-F]+)\]/g)) {
      pairs.set(Number(m[1]), Number(m[2]));
    }
    return pairs;
  };
  return { upper: one("CAPS_TABLE"), lower: one("REVERSE_CAPS_TABLE") };
}


if (process.argv[2] === "diff") {
  const sweep = readFileSync("tmp/ucaps-probe/sweep.txt", "utf8");
  const committedText = readFileSync("packages/runtime/src/runtime/ucaps.ts", "utf8");
  const got = computeCaps(parseSweep(sweep));
  const have = parseCommitted(committedText);
  const cmp = (label, a, b) => {
    const missing = [...a.entries()].filter(([k, v]) => b.get(k) !== v);
    const extra = [...b.entries()].filter(([k]) => !a.has(k));
    console.log(`${label}: Godot ${String(a.size)} / 入库 ${String(b.size)} ｜ 入库缺 ${String(missing.length)}，入库多 ${String(extra.length)}`);
    console.log(`  缺(前12): ${missing.slice(0, 12).map(([k, v]) => `U+${k.toString(16)}→U+${String(v).toString(16)}`).join(" ")}`);
    console.log(`  多(前12): ${extra.slice(0, 12).map(([k, v]) => `U+${k.toString(16)}→U+${String(v).toString(16)}`).join(" ")}`);
  };
  cmp("upper", got.upper, have.upper);
  cmp("lower", got.lower, have.lower);
  console.log(`Godot 多功能字符映射：upper ${String(got.multiUpper.size)}、lower ${String(got.multiLower.size)} 个码点`);
}
