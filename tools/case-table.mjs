#!/usr/bin/env node
// case-table 的落盘侧：读探头 golden → 调 tools/case-codegen.mjs 算内容 → 写进 runtime。
// 「算什么」与「怎么写」分开的理由见 case-codegen.mjs 头注释：
// test/e2e/codegen-drift.test.ts 要复用同一份计算来做漂移门，但绝不写盘。
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { computeCaseTable, parseCaseTableRows, renderCaseTable } from "./case-codegen.mjs";

const OUT = "packages/runtime/src/runtime/case-table.ts";
const BS = String.fromCharCode(92);

const probeDirs = readdirSync("corpus/cases").filter((d) => d.startsWith("000-probe-cs-"));
const goldens = [];
for (const dir of probeDirs) {
  const path = `corpus/cases/${dir}/godot.txt`;
  if (!existsSync(path)) {
    console.error(`缺 golden：${path}（先跑 node tools/golden.mjs 000-probe-cs）`);
    process.exit(1);
  }
  goldens.push(readFileSync(path, "utf8"));
}

let rows;
let stats;
try {
  rows = parseCaseTableRows(goldens);
  stats = computeCaseTable(rows);
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

/** 已有的表（只用来报告「哪些是这次新发现的」，不参与产物内容）。 */
const covered = new Set();
if (existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  for (const m of prev.matchAll(/"(\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\})": "((?:\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\})*)", \/\/ (U\+[0-9A-F]+) (to_upper|to_lower)/g)) {
    covered.add(`${m[4]}:${m[5]}:${m[3]}`);
  }
}

const hex = (cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
const esc = (cp) =>
  cp > 0xffff ? BS + "u{" + cp.toString(16).toUpperCase() + "}" : BS + "u" + cp.toString(16).toUpperCase().padStart(4, "0");
const escStr = (s) => [...s].map((c) => esc(c.codePointAt(0))).join("");

const fresh = [];
for (const r of rows) {
  const ch = String.fromCodePoint(r.cp);
  if (r.up !== ch.toUpperCase() && !covered.has(`${hex(r.cp)}:to_upper:${escStr(r.up)}`)) {
    fresh.push(`UP  ${hex(r.cp)} godot=${escStr(r.up)} js=${escStr(ch.toUpperCase())}`);
  }
  if (r.low !== ch.toLowerCase() && !covered.has(`${hex(r.cp)}:to_lower:${escStr(r.low)}`)) {
    fresh.push(`LOW ${hex(r.cp)} godot=${escStr(r.low)} js=${escStr(ch.toLowerCase())}`);
  }
}

writeFileSync(OUT, renderCaseTable(rows, stats), "utf8");

console.log(
  `${OUT}：扫到 ${rows.length} 个码点：与 JS 一致 ${stats.agree}，进表 upper ${stats.fixUp.size} + lower ${stats.fixLow.size}`,
);
console.log(`Godot 给出多码点结果的：${stats.multi} 个（应为 0，非 0 说明"简单映射"的前提破了）`);
if (covered.size > 0) {
  console.log(`与上一版表相比新增/变动 ${fresh.length} 条${fresh.length ? "：" : "（表没变）"}`);
  for (const l of fresh.slice(0, 30)) console.log("  " + l);
} else {
  console.log("（首次生成，无上一版可比）");
}
