/**
 * 大小写映射探针的第二段：把 000-probe-cs-* 的 Godot 真值与 JS 的映射逐码点对账，
 * 重新生成 src/runtime/case-table.ts（运行时唯一的那张例外表）。
 *
 * 为什么必须有这张表：JS 的 toUpperCase/toLowerCase 走**兼容全映射**（ß→SS、İ→i̇、ǳ→DŽ、
 * ﬁ→FI），Godot 走**简单映射**（长度永远不变）。凡是「JS 把单码点撑开」的位置，照抄 JS 就会
 * 静默产出与 Godot 不同长度的字符串；另外还有反向情况 —— JS 与 Godot 都给单码点，但给的
 * 不是同一个字符（实测 Bassa Vah 整段、U+A7CE…U+A7D5：Godot 当作无大小写、JS 却互映射），
 * 那类更阴：长度对、内容错，只有逐码点实测才发现。
 *
 * 用法见 tools/case-probe.mjs 文件头。换 Godot 版本时重跑三步，报告里的 NEW 就是新版本
 * 改了的映射，会被一并写进表里。
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const OUT = "src/runtime/case-table.ts";
const BS = String.fromCharCode(92); // 反斜杠，免得在几层字符串转义里打架

const rows = [];
for (const dir of readdirSync("corpus/cases").filter((d) => d.startsWith("000-probe-cs-"))) {
  const path = `corpus/cases/${dir}/godot.txt`;
  if (!existsSync(path)) {
    console.error(`缺 golden：${path}（先跑 node tools/golden.mjs 000-probe-cs）`);
    process.exit(1);
  }
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.includes("|")) continue;
    const parts = line.split("|");
    if (parts.length !== 3) {
      console.error(`golden 里有字段数异常的行：${JSON.stringify(line)}`);
      process.exit(1);
    }
    rows.push({ cp: parseInt(parts[0], 16), up: parts[1], low: parts[2] });
  }
}
rows.sort((a, b) => a.cp - b.cp);
if (rows.length === 0) {
  console.error("一个码点都没扫到，先跑 tools/case-probe.mjs");
  process.exit(1);
}

const hex = (cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
const esc = (cp) =>
  cp > 0xffff ? BS + "u{" + cp.toString(16).toUpperCase() + "}" : BS + "u" + cp.toString(16).toUpperCase().padStart(4, "0");
const escStr = (s) => [...s].map((c) => esc(c.codePointAt(0))).join("");

/** 已有的表（用来报告「哪些是这次新发现的」） */
const covered = new Set();
if (existsSync(OUT)) {
  const prev = readFileSync(OUT, "utf8");
  for (const m of prev.matchAll(/"(\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\})": "((?:\\u[0-9A-Fa-f]{4}|\\u\{[0-9A-Fa-f]+\})*)", \/\/ (U\+[0-9A-F]+) (to_upper|to_lower)/g)) {
    covered.add(`${m[4]}:${m[5]}:${m[3]}`);
  }
}

const fixUp = new Map();
const fixLow = new Map();
let agree = 0;
let multi = 0;
const fresh = [];

for (const r of rows) {
  const ch = String.fromCodePoint(r.cp);
  const ju = ch.toUpperCase();
  const jl = ch.toLowerCase();
  if ([...r.up].length > 1 || [...r.low].length > 1) multi++;
  let same = true;
  if (r.up !== ju) {
    same = false;
    fixUp.set(ch, r.up);
    if (!covered.has(`${hex(r.cp)}:to_upper:${escStr(r.up)}`)) fresh.push(`UP  ${hex(r.cp)} godot=${escStr(r.up)} js=${escStr(ju)}`);
  }
  if (r.low !== jl) {
    same = false;
    fixLow.set(ch, r.low);
    if (!covered.has(`${hex(r.cp)}:to_lower:${escStr(r.low)}`)) fresh.push(`LOW ${hex(r.cp)} godot=${escStr(r.low)} js=${escStr(jl)}`);
  }
  if (same) agree++;
}

const emit = (name, dir, map) => {
  const keys = [...map.keys()].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
  const body = keys.map((k) => `  "${esc(k.codePointAt(0))}": "${escStr(map.get(k))}", // ${hex(k.codePointAt(0))} ${dir}`);
  return `export const ${name}: Readonly<Record<string, string>> = {\n${body.join("\n")}\n};`;
};

const header = `/**
 * Godot 与 JS 的大小写映射**不一致**的码点表 —— 生成物，别手改，改请重跑生成流程。
 *
 *   node tools/case-probe.mjs
 *   node tools/golden.mjs 000-probe-cs
 *   node tools/case-table.mjs
 *
 * 数据来自 ${rows.length} 个码点（= JS 里存在大小写映射的全部码点，BMP 与卫星平面都算）
 * 在 Godot 4.6.3 下的实测结果；其中 ${agree} 个与 JS 一致、不需要进表。
 * 两条实测出来的规律，运行时就按它们设计：
 *  - Godot 的 to_upper/to_lower **永不撑开**（${rows.length} 个码点里 0 个多码点结果），
 *    所以「JS 结果长度变了吗」可以当作「需不需要查表」的筛子；
 *  - 反过来，JS 与 Godot 都给单码点却**给的不是同一个字符**的情况真实存在
 *    （Bassa Vah U+16EA0…U+16ED3 整段、U+A7CE…U+A7D5：Godot 视为无大小写），
 *    所以不能只处理"撑开"那一类，必须整段对账 —— 这张表就是对账的产物。
 * 未在表内且 JS 也没撑开的码点：JS 的单码点结果与 Godot 实测相同（本轮已全量验证）。
 */
`;

writeFileSync(OUT, header + "\n" + emit("CASE_UPPER_FIX", "to_upper", fixUp) + "\n\n" + emit("CASE_LOWER_FIX", "to_lower", fixLow) + "\n");

console.log(`扫到 ${rows.length} 个码点：与 JS 一致 ${agree}，进表 upper ${fixUp.size} + lower ${fixLow.size} → ${OUT}`);
console.log(`Godot 给出多码点结果的：${multi} 个（应为 0，非 0 说明"简单映射"的前提破了）`);
if (covered.size > 0) {
  console.log(`与上一版表相比新增/变动 ${fresh.length} 条${fresh.length ? "：" : "（表没变）"}`);
  for (const l of fresh.slice(0, 30)) console.log("  " + l);
} else {
  console.log("（首次生成，无上一版可比）");
}
