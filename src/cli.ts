#!/usr/bin/env node
/**
 * gds2js CLI —— GDScript 4.x → JavaScript AOT 编译器。
 *
 *   gds2js check <file.gd>                     静态检查（解析 / lowering / 语义分析）
 *   gds2js build <file.gd> [-o out]            编译单个文件成 ESM 模块
 *   gds2js check-project <entry.gd>            编译作用域内全部文件做静态检查
 *   gds2js build-project <entry.gd> [-o dir]   跨文件编译整个工程（class_name / extends / is）
 *
 * 产出的模块 export 一个脚本类，import "gds2js/runtime"（语言运行时）和
 * "gds2js/host"（宿主桩）。怎么驱动生命周期（跑不跑 _initialize / _process）由使用方决定。
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { compileProject, findGdFiles } from "./compile/project";
import { emitModule, emitModuleWithMap } from "./emit/emitter";
import type { RawSourceMap } from "./emit/sourcemap";
import { analyze } from "./lower/analyze";
import { lower } from "./lower/lower";
import { parseSource } from "./parse/parser";
import { UnsupportedError } from "./runtime/errors";

interface Diag {
  code: string;
  message: string;
  line: number;
  col: number;
  file: string;
}

function usage(code: number): never {
  console.log(`gds2js —— GDScript 4.x → JavaScript AOT 编译器（Tier 1：纯语言层）

用法:
  gds2js check <file.gd>                     静态检查（解析 / lowering / 语义分析）
  gds2js build <file.gd> [-o out]            编译单个文件成 ESM 模块
  gds2js check-project <entry.gd>            跨文件静态检查（编译作用域内全部 .gd）
  gds2js build-project <entry.gd> [-o dir]   跨文件编译整个工程

选项:
  -o, --out <path>       输出路径（build: .mjs 文件；build-project: 输出目录）
      --res-root <dir>   res:// 映射到的工程根（默认向上找 project.godot，否则入口所在目录）
  --runtime <spec>       运行时的 import 说明符（默认 "gds2js/runtime"）
  --host <spec>          宿主的 import 说明符（默认 "gds2js/host"）
      --no-host          不引入宿主，发射成不继承任何基类的纯类
      --sourcemap        额外生成行粒度 .map（默认关，关掉时产物字节完全不变）`);
  process.exit(code);
}

// ---- 参数解析：位置参数 + 带值/无值 flag ----
const argv = process.argv.slice(2);
const FLAGS_WITH_VALUE = new Set(["-o", "--out", "--runtime", "--host", "--res-root"]);
const positional: string[] = [];
const flagValue = new Map<string, string>();
const flags = new Set<string>();
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]!;
  if (a === "--help" || a === "-h") usage(0);
  else if (a === "--no-host") flags.add("no-host");
  else if (a === "--sourcemap") flags.add("sourcemap");
  else if (a.startsWith("-")) {
    if (FLAGS_WITH_VALUE.has(a)) {
      const v = argv[i + 1];
      if (v !== undefined) {
        flagValue.set(a, v);
        i++;
      }
    }
  } else positional.push(a);
}

const cmd = positional[0];
const file = positional[1];
if (!cmd) usage(0);
if (cmd !== "check-project" && !file) usage(1);

const runtimeImport = flagValue.get("--runtime") ?? "gds2js/runtime";
const hostImport = flags.has("no-host") ? null : (flagValue.get("--host") ?? "gds2js/host");

function readFlagValue(...names: string[]): string | undefined {
  for (const n of names) {
    const v = flagValue.get(n);
    if (v) return v;
  }
  return undefined;
}

/** 从入口向上找含 project.godot 的目录作为 res:// 根，找不到就用入口所在目录。 */
function findResRoot(entryAbs: string): string {
  let dir = dirname(entryAbs);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      readFileSync(join(dir, "project.godot"), "utf8");
      return dir;
    } catch {
      const parent = dirname(dir);
      if (parent === dir) return dirname(entryAbs);
      dir = parent;
    }
  }
}

// ---------------------------------------------------------------- 单文件前端

async function loadSingle(absPath: string) {
  const src = readFileSync(absPath, "utf8");
  try {
    const ir = lower(await parseSource(src));
    return { ir, diags: [] as Diag[] };
  } catch (e) {
    console.error(`${absPath}:1:1  error  ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  }
}

function toDiags(absPath: string, ir: ReturnType<typeof lower>): Diag[] {
  return analyze(ir).map((d) => ({ code: d.code, message: d.message, line: d.loc.line, col: d.loc.col, file: absPath }));
}

function reportDiags(diags: Diag[]): void {
  for (const d of diags) console.error(`${d.file}:${d.line}:${d.col}  error  ${d.code}: ${d.message}`);
  if (diags.length > 0) {
    console.error(`\n${diags.length} 个错误，未生成产物。`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------- 命令分发

const input = file ? resolve(file) : "";

if (cmd === "check") {
  const { ir } = await loadSingle(input);
  reportDiags(toDiags(input, ir));
  console.error(`${input}: 静态检查通过`);
  process.exit(0);
}

if (cmd === "build") {
  const { ir } = await loadSingle(input);
  reportDiags(toDiags(input, ir));
  console.error(`${input}: 静态检查通过`);
  const outPath = resolve(readFlagValue("--out", "-o") ?? input.replace(/\.gd$/i, ".mjs"));
  let code: string;
  let map: RawSourceMap | null = null;
  try {
    const sm = flags.has("sourcemap");
    const result = sm
      ? emitModuleWithMap(ir, { runtimeImport, hostImport, autoRun: false, sourcemap: true, sourceFile: input, jsFile: basename(outPath) })
      : { code: emitModule(ir, { runtimeImport, hostImport, autoRun: false }), map: null };
    code = result.code;
    map = result.map;
  } catch (e) {
    const msg = e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : String(e);
    console.error(`${input}:  error  ${msg}`);
    process.exit(1);
  }
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, code, "utf8");
  if (map) writeFileSync(`${outPath}.map`, JSON.stringify(map), "utf8");
  console.error(`${outPath}: 已生成 (${code.split("\n").length} 行)${map ? " + .map" : ""}`);
  process.exit(0);
}

if (cmd === "check-project" || cmd === "build-project") {
  const resRoot = resolve(readFlagValue("--res-root") ?? findResRoot(input));
  const outDir = resolve(readFlagValue("--out", "-o") ?? join(resRoot, ".gds2js"));
  let result;
  try {
    result = await compileProject({
      entries: [input],
      resRoot,
      outDir,
      runtimeImport,
      hostImport,
      autoRun: false,
      sourcemap: flags.has("sourcemap"),
    });
  } catch (e) {
    const msg = e instanceof UnsupportedError ? `[${e.code}] ${e.message}` : String(e);
    console.error(`${input}:  error  ${msg}`);
    process.exit(1);
  }

  reportDiags(
    result.diags.map((d) => ({
      file: join(resRoot, d.resPath.replace(/^res:\/\//, "")),
      code: d.diagnostic.code,
      message: d.diagnostic.message,
      line: d.diagnostic.loc.line,
      col: d.diagnostic.loc.col,
    })),
  );

  if (cmd === "check-project") {
    console.error(`静态检查通过：${result.modules.length} 个文件（作用域 res://${resRoot.replace(/\\/g, "/")}）`);
    process.exit(0);
  }

  for (const m of result.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
    if (m.map) writeFileSync(`${m.jsPath}.map`, JSON.stringify(m.map), "utf8");
  }
  console.error(
    `已编译 ${result.modules.length} 个模块 → ${outDir}（入口发现 ${findGdFiles(resRoot).length} 个 .gd）`,
  );
  process.exit(0);
}

usage(1);
