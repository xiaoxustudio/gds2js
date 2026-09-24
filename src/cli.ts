#!/usr/bin/env node
/**
 * gds2js CLI —— GDScript 4.x → JavaScript AOT 编译器。
 *
 *   gds2js check <file.gd>             静态检查（解析 / lowering / 语义分析）
 *   gds2js build <file.gd> [-o out]    编译成 ESM 模块
 *
 * build 产出的模块 export 一个脚本类（默认叫 Main），
 * 它 import "gds2js/runtime"（语言运行时）和 "gds2js/host"（宿主桩）。
 * 怎么驱动生命周期（跑不跑 _initialize / _process）由使用方决定。
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { emitModule } from "./emit/emitter";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { UnsupportedError } from "./runtime/errors";

interface Diag {
  code: string;
  message: string;
  line: number;
  col: number;
}

function usage(code: number): never {
  console.log(`gds2js —— GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）

用法:
  gds2js check <file.gd>             静态检查（解析 / lowering / 语义分析）
  gds2js build <file.gd> [-o out]    编译成 ESM 模块

选项:
  -o, --out <path>       输出路径（默认与源文件同名 .mjs）
  --runtime <spec>       运行时的 import 说明符（默认 "gds2js/runtime"）
  --host <spec>          宿主的 import 说明符（默认 "gds2js/host"）
      --no-host          不引入宿主，发射成不继承任何基类的纯类`);
  process.exit(code);
}

function readArg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

const positional = process.argv.slice(2).filter((a) => !a.startsWith("-") && !/^(--\w+)$/.test(process.argv[process.argv.indexOf(a) + 1] ?? ""));

const cmd = positional[0];
const file = positional[1];
if (!cmd || !file) usage(cmd ? 1 : 0);

const input = resolve(file);
const src = readFileSync(input, "utf8");

// ---------- 前端：parse → lower → analyze ----------

const diags: Diag[] = [];
let ir;
try {
  ir = lower(await parseSource(src));
} catch (e) {
  console.error(`${input}:1:1  error  ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}

for (const d of analyze(ir)) {
  diags.push({ code: d.code, message: d.message, line: d.loc.line, col: d.loc.col });
}

for (const d of diags) {
  console.error(`${input}:${d.line}:${d.col}  error  ${d.code}: ${d.message}`);
}
if (diags.length > 0) {
  console.error(`\n${diags.length} 个错误，未生成产物。`);
  process.exit(1);
}
console.error(`${input}: 静态检查通过`);

// ---------- 命令分发 ----------

if (cmd === "check") process.exit(0);

if (cmd !== "build") usage(1);

const runtimeImport = readArg("--runtime") ?? "gds2js/runtime";
const hostSpec = readArg("--host") ?? "gds2js/host";
const hostImport = hasFlag("--no-host") ? null : hostSpec;
const outPath = resolve(readArg("--out") ?? readArg("-o") ?? input.replace(/\.gd$/i, ".mjs"));

let code: string;
try {
  code = emitModule(ir, { runtimeImport, hostImport, autoRun: false });
} catch (e) {
  const msg = e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : String(e);
  console.error(`${input}:  error  ${msg}`);
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, code, "utf8");
console.error(`${outPath}: 已生成 (${code.split("\n").length} 行)`);
