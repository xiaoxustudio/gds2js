import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "./lib.mjs";
import { computeCaps, parseSweep } from "./ucaps-codegen.mjs";

const SWEEP = join(ROOT, "tmp", "ucaps-probe", "sweep.txt");
const OUT = join(ROOT, "packages", "runtime", "src", "runtime", "ucaps.ts");

const hex = (n) => "0x" + n.toString(16);

const table = (name, map) => {
  const rows = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => `  [${hex(k)}, ${hex(v)}]`);
  return `const ${name}: readonly (readonly [number, number])[] = [\n${rows.join(",\n")}\n];`;
};

const FIND = (name, tbl) => `export function ${name}(ch: number): number {
  let low = 0;
  let high = ${tbl}.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const row = ${tbl}[middle] as readonly [number, number];
    if (ch < row[0]) high = middle - 1;
    else if (row[0] < ch) low = middle + 1;
    else return row[1];
  }
  return ch;
}`;

const HEADER = `/**
 * Godot 简单大小写映射表 —— 生成物，别手改，改请重跑生成流程（pnpm regen:ucaps）。
 *
 *   node tools/ucaps-probe.mjs
 *   node tools/ucaps.mjs write
 *
 * 数据是 0x0040…0x10FFFF 全部码点在 Godot 4.6.3 下走 to_upper() / to_lower() 的实测结果：
 * 只收「映射到另一个单一码点」的那些，故 U+1F80 一族（Godot 给单码点、JS 给多功能字符映射）在表里，
 * 而 ß（两支都回原码点）不在。升序存放，findUpper / findLower 二分。
 */

`;

export function renderUcaps(text) {
  const { upper, lower } = computeCaps(parseSweep(text));
  return HEADER + [
    table("CAPS_TABLE", upper),
    table("REVERSE_CAPS_TABLE", lower),
    FIND("findUpper", "CAPS_TABLE"),
    FIND("findLower", "REVERSE_CAPS_TABLE"),
    "",
  ].join("\n\n");
}

if (process.argv[2] === "write") {
  if (!existsSync(SWEEP)) {
    console.error(`缺扫描读数 ${SWEEP.replace(ROOT, ".")}（先跑 node tools/ucaps-probe.mjs）`);
    process.exit(1);
  }
  const before = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  const after = renderUcaps(readFileSync(SWEEP, "utf8"));
  writeFileSync(OUT, after, "utf8");
  const bodySame = before.slice(before.indexOf("const CAPS_TABLE")).trimEnd() === after.slice(after.indexOf("const CAPS_TABLE")).trimEnd();
  console.log(`已写 ${OUT.replace(ROOT, ".")}；表体与旧文件${bodySame ? "逐字节相同（只有新增头部是差异）" : "有差异——先逐对账再提交"}`);
}
