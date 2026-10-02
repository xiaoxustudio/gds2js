import { existsSync, readFileSync, writeFileSync } from "node:fs";

const GOLDEN = "corpus/cases/000-probe-cf-0/godot.txt";
const OUT = "packages/runtime/src/runtime/case-flags.ts";
const MAX = 0x10ffff;

if (!existsSync(GOLDEN)) {
  console.error(`缺 golden：${GOLDEN}（先跑 node tools/golden.mjs 000-probe-cf）`);
  process.exit(1);
}

const lines = readFileSync(GOLDEN, "utf8").split("\n");

function readSet(name) {
  const line = lines.find((l) => l.startsWith(`${name} `));
  if (!line) {
    console.error(`golden 里缺 ${name} 行`);
    process.exit(1);
  }
  const parts = line.trim().split(/\s+/);
  const count = Number(parts[1]);
  const cps = parts.slice(2).map((h) => parseInt(h, 16));
  if (cps.length !== count) {
    console.error(`${name} 声明 ${count} 个、实到 ${cps.length} 个`);
    process.exit(1);
  }
  for (const [i, cp] of cps.entries()) {
    if (!Number.isFinite(cp) || cp < 0 || cp > MAX || (cp >= 0xd800 && cp <= 0xdfff)) {
      console.error(`${name} 里有非法码点 ${parts[i + 2]}`);
      process.exit(1);
    }
  }
  return new Set(cps);
}

const upperSlot = readSet("UP");
const lower = readSet("LO");
const sep = readSet("SEP");
const digit = readSet("DIG");

// 判别式 "a"+c 在 c 是数字时同样拆词，UP 行其实是「大写 ∪ 数字」，减掉数字才是大写。
for (const cp of digit) {
  if (!upperSlot.has(cp)) console.error(`数字码点 ${cp.toString(16)} 没进 UP 并集，判别式变了`);
  if (sep.has(cp)) console.error(`数字码点 ${cp.toString(16)} 同时被判成分隔符，判别式变了`);
}
const upper = new Set([...upperSlot].filter((cp) => !digit.has(cp)));

function toRanges(set) {
  const out = [];
  for (const cp of [...set].sort((a, b) => a - b)) {
    const last = out[out.length - 1];
    if (last && last[1] === cp - 1) last[1] = cp;
    else out.push([cp, cp]);
  }
  return out;
}

const hex = (n) => "0x" + n.toString(16).toUpperCase().padStart(4, "0");
const hexLine = (ranges) =>
  ranges.map(([lo, hi]) => `  ${hex(lo)}, ${hex(hi)},`).join("\n");

const body = `/**
 * Godot CharTypes 的码点分类表 —— 生成物，别手改，改请重跑生成流程（pnpm regen:case-flags）。
 *
 *   node tools/case-flags-probe.mjs
 *   node tools/golden.mjs 000-probe-cf
 *   node tools/case-flags.mjs
 *
 * 数据是 0x0000…0x10FFFF 全部码点在 Godot 4.6.3 下走 capitalize() 的实测分类结果
 * （四条判别式在 tools/case-flags-probe.mjs 写进的探头用例里，现搭现弃、不入库），闭区间成对存放：
 *  - GD_UPPER：is_unicode_upper_case
 *  - GD_LOWER：is_unicode_lower_case
 *  - GD_SEP：is_whitespace ∪ is_underscore ∪ is_hyphen（capitalize 一律折成空格）
 *  - GD_DIGIT：is_digit（实测只有 ASCII 0-9，非 ASCII 数字一律不算）
 * 不在表里的码点，就是 Godot 认为它不属于这一类。
 */

export const GD_UPPER: readonly number[] = [
${hexLine(toRanges(upper))}
];

export const GD_LOWER: readonly number[] = [
${hexLine(toRanges(lower))}
];

export const GD_SEP: readonly number[] = [
${hexLine(toRanges(sep))}
];

export const GD_DIGIT: readonly number[] = [
${hexLine(toRanges(digit))}
];

function inRanges(ranges: readonly number[], cp: number): boolean {
  let lo = 0;
  let hi = ranges.length / 2 - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const start = ranges[mid * 2] as number;
    const end = ranges[mid * 2 + 1] as number;
    if (cp < start) hi = mid - 1;
    else if (cp > end) lo = mid + 1;
    else return true;
  }
  return false;
}

/** Godot 的 is_unicode_upper_case(cp)。 */
export function gdIsUpper(cp: number): boolean {
  return inRanges(GD_UPPER, cp);
}

/** Godot 的 is_unicode_lower_case(cp)。 */
export function gdIsLower(cp: number): boolean {
  return inRanges(GD_LOWER, cp);
}

/** Godot 的 is_whitespace(cp) || is_underscore(cp) || is_hyphen(cp)。 */
export function gdIsSep(cp: number): boolean {
  return inRanges(GD_SEP, cp);
}

/** Godot 的 is_digit(cp)。 */
export function gdIsDigit(cp: number): boolean {
  return inRanges(GD_DIGIT, cp);
}
`;

writeFileSync(OUT, body, "utf8");
console.log(
  `${OUT}：UPPER ${upper.size}（区间 ${toRanges(upper).length}）、LOWER ${lower.size}（区间 ${toRanges(lower).length}）、SEP ${sep.size}（区间 ${toRanges(sep).length}）、DIGIT ${digit.size}`,
);
