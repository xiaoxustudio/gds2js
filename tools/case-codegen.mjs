/**
 * case-table / case-flags 两张生成表的**纯计算部分**：从 golden 文本算出行与区间、再拼成
 * 最终文件内容。不读盘、不写盘，所以两个调用方都能用：
 *
 *   - `tools/case-table.mjs` / `tools/case-flags.mjs` —— 读 golden → 调这里 → 写盘（codegen）
 *   - `test/e2e/codegen-drift.test.ts` —— 读 golden → 调这里 → 与**已提交的**文件比对（漂移门）
 *
 * 之所以要有那道门：`packages/runtime/src/runtime/case-{table,flags}.ts` 是生成物、
 * 文件头自己写着「别手改，改请重跑生成流程」，但**过去没有任何门能发现有人手改了它**，
 * 也发现不了「跑了 regen 却忘了提交」。golden 有 golden-drift 门，生成源码一直没有。
 *
 * ⚠ 拼模板的字符串必须与迁移前逐字一致，否则漂移门会在第一天就报红。
 */

const BS = String.fromCharCode(92);
const MAX = 0x10ffff;

// ── 共用小工具 ────────────────────────────────────────────────────────

const hexCp = (cp) => "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
const escCp = (cp) =>
  cp > 0xffff ? BS + "u{" + cp.toString(16).toUpperCase() + "}" : BS + "u" + cp.toString(16).toUpperCase().padStart(4, "0");
const escStr = (s) => [...s].map((c) => escCp(c.codePointAt(0))).join("");

/** 把码点集合并成闭区间对，[lo, hi, lo, hi, …] 那种形状的原始区间列表。 */
export function toRanges(set) {
  const out = [];
  for (const cp of [...set].sort((a, b) => a - b)) {
    const last = out[out.length - 1];
    if (last && last[1] === cp - 1) last[1] = cp;
    else out.push([cp, cp]);
  }
  return out;
}

// ── case-table：Godot 与 JS 大小写映射不一致的码点表 ──────────────────

/**
 * 从一批探头 golden 文本里解析出 `{cp, up, low}` 行。
 * 字段数异常一律抛（旧脚本是 console.error + process.exit(1)，抽成函数后改成抛，
 * 由调用方决定是退出还是判红）。
 */
export function parseCaseTableRows(goldenTexts) {
  const rows = [];
  for (const text of goldenTexts) {
    for (const line of text.split("\n")) {
      if (!line.includes("|")) continue;
      const parts = line.split("|");
      if (parts.length !== 3) throw new Error(`golden 里有字段数异常的行：${JSON.stringify(line)}`);
      rows.push({ cp: parseInt(parts[0], 16), up: parts[1], low: parts[2] });
    }
  }
  rows.sort((a, b) => a.cp - b.cp);
  if (rows.length === 0) throw new Error("一个码点都没扫到，先跑 tools/case-probe.mjs");
  return rows;
}

/** 由行算出两张修正表 + 报告用的统计。 */
export function computeCaseTable(rows) {
  const fixUp = new Map();
  const fixLow = new Map();
  let agree = 0;
  let multi = 0;
  for (const r of rows) {
    const ch = String.fromCodePoint(r.cp);
    const ju = ch.toUpperCase();
    const jl = ch.toLowerCase();
    if ([...r.up].length > 1 || [...r.low].length > 1) multi++;
    let same = true;
    if (r.up !== ju) {
      same = false;
      fixUp.set(ch, r.up);
    }
    if (r.low !== jl) {
      same = false;
      fixLow.set(ch, r.low);
    }
    if (same) agree++;
  }
  return { fixUp, fixLow, agree, multi };
}

/** 拼出 packages/runtime/src/runtime/case-table.ts 的完整内容。 */
export function renderCaseTable(rows, { fixUp, fixLow, agree, multi }) {
  const emit = (name, dir, map) => {
    const keys = [...map.keys()].sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
    const body = keys.map((k) => `  "${escCp(k.codePointAt(0))}": "${escStr(map.get(k))}", // ${hexCp(k.codePointAt(0))} ${dir}`);
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

  return header + "\n" + emit("CASE_UPPER_FIX", "to_upper", fixUp) + "\n\n" + emit("CASE_LOWER_FIX", "to_lower", fixLow) + "\n";
}

// ── case-flags：Godot CharTypes 的码点分类表 ──────────────────────────

/** 从一份 golden 文本里读出一个码点集合；非法输入一律抛（旧脚本是 exit(1)）。 */
export function parseCaseFlagsSets(goldenText) {
  const lines = goldenText.split("\n");

  const readSet = (name) => {
    const line = lines.find((l) => l.startsWith(`${name} `));
    if (!line) throw new Error(`golden 里缺 ${name} 行`);
    const parts = line.trim().split(/\s+/);
    const count = Number(parts[1]);
    const cps = parts.slice(2).map((h) => parseInt(h, 16));
    if (cps.length !== count) throw new Error(`${name} 声明 ${count} 个、实到 ${cps.length} 个`);
    for (const [i, cp] of cps.entries()) {
      if (!Number.isFinite(cp) || cp < 0 || cp > MAX || (cp >= 0xd800 && cp <= 0xdfff)) {
        throw new Error(`${name} 里有非法码点 ${parts[i + 2]}`);
      }
    }
    return new Set(cps);
  };

  const upperSlot = readSet("UP");
  const lower = readSet("LO");
  const sep = readSet("SEP");
  const digit = readSet("DIG");

  // 判别式 "a"+c 在 c 是数字时同样拆词，UP 行其实是「大写 ∪ 数字」，减掉数字才是大写。
  for (const cp of digit) {
    if (!upperSlot.has(cp)) throw new Error(`数字码点 ${cp.toString(16)} 没进 UP 并集，判别式变了`);
    if (sep.has(cp)) throw new Error(`数字码点 ${cp.toString(16)} 同时被判成分隔符，判别式变了`);
  }
  const upper = new Set([...upperSlot].filter((cp) => !digit.has(cp)));
  return { upper, lower, sep, digit };
}

/** 拼出 packages/runtime/src/runtime/case-flags.ts 的完整内容。 */
export function renderCaseFlags({ upper, lower, sep, digit }) {
  const hex = (n) => "0x" + n.toString(16).toUpperCase().padStart(4, "0");
  const hexLine = (ranges) => ranges.map(([lo, hi]) => `  ${hex(lo)}, ${hex(hi)},`).join("\n");
  const block = (name, set) => `export const ${name}: readonly number[] = [\n${hexLine(toRanges(set))}\n];`;

  return `/**
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

${block("GD_UPPER", upper)}

${block("GD_LOWER", lower)}

${block("GD_SEP", sep)}

${block("GD_DIGIT", digit)}

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
}
