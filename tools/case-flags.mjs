#!/usr/bin/env node
// case-flags 的落盘侧：读探头 golden → 调 tools/case-codegen.mjs 算内容 → 写进 runtime。
// 「算什么」与「怎么写」分开的理由见 case-codegen.mjs 头注释：
// test/e2e/codegen-drift.test.ts 要复用同一份计算来做漂移门，但绝不写盘。
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseCaseFlagsSets, renderCaseFlags, toRanges } from "./case-codegen.mjs";

const GOLDEN = "corpus/cases/000-probe-cf-0/godot.txt";
const OUT = "packages/runtime/src/runtime/case-flags.ts";

if (!existsSync(GOLDEN)) {
  console.error(`缺 golden：${GOLDEN}（先跑 node tools/golden.mjs 000-probe-cf）`);
  process.exit(1);
}

let sets;
try {
  sets = parseCaseFlagsSets(readFileSync(GOLDEN, "utf8"));
} catch (e) {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
}

writeFileSync(OUT, renderCaseFlags(sets), "utf8");

const ranges = (s) => toRanges(s).length;
console.log(
  `${OUT}：UPPER ${sets.upper.size}（区间 ${ranges(sets.upper)}）、LOWER ${sets.lower.size}（区间 ${ranges(sets.lower)}）、SEP ${sets.sep.size}（区间 ${ranges(sets.sep)}）、DIGIT ${sets.digit.size}`,
);
