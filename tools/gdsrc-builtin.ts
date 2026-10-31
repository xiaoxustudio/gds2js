import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { BUILTIN } from "../packages/compiler/src/emit/surface";
import { ROOT } from "./lib.mjs";

const OUT = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "builtin_tables.gd");

const esc = (x: string): string => x.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
const SENT = (i: number): string => `\u00ab${String(i)}\u00bb`;
const argsOf = (n: number): string[] => Array.from({ length: n }, (_, i) => SENT(i));

export const builtinIsJoin = (name: string): boolean => BUILTIN[name]!(argsOf(10)).includes(SENT(9));

export const builtinArity = (name: string): number => {
  if (builtinIsJoin(name)) return -1;
  const fn = BUILTIN[name]!;
  for (let k = 1; k <= 10; k++) {
    const text = fn(argsOf(k));
    if (text.includes(SENT(k - 1)) && !text.includes("undefined")) return k;
  }
  return 0;
};

export function renderBuiltinTables(): string {
  const fixed: Array<[string, string]> = [];
  const join: Array<[string, string, string]> = [];
  const count: Array<[string, number]> = [];
  for (const name of Object.keys(BUILTIN).sort()) {
    const fn = BUILTIN[name]!;
    if (builtinIsJoin(name)) {
      const text = fn(argsOf(3));
      const at = text.indexOf(SENT(0));
      const tail = text.indexOf(SENT(2));
      if (at < 0 || tail < 0) throw new Error(`join template without args: ${name}`);
      const middle = text.slice(at, tail + SENT(2).length);
      if (middle !== `${SENT(0)}, ${SENT(1)}, ${SENT(2)}`) throw new Error(`join shape changed: ${name}: ${middle}`);
      join.push([name, text.slice(0, at), text.slice(tail + SENT(2).length)]);
      count.push([name, -1]);
      continue;
    }
    const k = builtinArity(name);
    let text = fn(argsOf(k));
    for (let i = 0; i < k; i++) text = text.split(SENT(i)).join(`{${String(i)}}`);
    fixed.push([name, text]);
    count.push([name, k]);
  }
  return [
    "# 由 tools/gdsrc-builtin.ts 从 emit/surface.ts 的 BUILTIN 生成 —— 不要手改。",
    "",
    "const FIXED = {",
    ...fixed.map(([k, v]) => `\t"${k}": "${esc(v)}",`),
    "}",
    "",
    "const JOIN = {",
    ...join.map(([k, p, s]) => `\t"${k}": ["${esc(p)}", "${esc(s)}"],`),
    "}",
    "",
    "const COUNT = {",
    ...count.map(([k, v]) => `\t"${k}": ${String(v)},`),
    "}",
    "",
  ].join("\n");
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const text = renderBuiltinTables();
  writeFileSync(OUT, text, "utf8");
  console.log(`builtin_tables.gd 写出：${String(text.split("\n").length)} 行`);
}
