import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "tsdown";
import { compileProject } from "@gds2js/compiler/compile/project";
import { emitModuleWithMap } from "@gds2js/compiler/emit/emitter";
import { analyze } from "@gds2js/compiler/lower/analyze";
import { lower } from "@gds2js/compiler/lower/lower";
import { parseSource } from "@gds2js/compiler/parse/parser";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, "pkg-check");
const STANDALONE_CJS = join(ROOT, "packages/gds2js/dist/standalone.cjs");
const STANDALONE_SRC = readFileSync(STANDALONE_CJS, "utf8");

let failures = 0;
function ok(msg: string): void {
  console.log(`  ✓ ${msg}`);
}
function bad(msg: string): void {
  failures++;
  console.log(`  ✗ ${msg}`);
}

function runNode(cwd: string, file: string): { out: string; code: number | null } {
  const r = spawnSync(process.execPath, [file], { cwd, encoding: "utf8", timeout: 15000 });
  return { out: (r.stdout || "") + (r.stderr || ""), code: r.status };
}

async function checkPerCaseModes(): Promise<void> {
  console.log("① single/local × 代表性用例 vs golden（走 npm 安装态：原生 exe 不带打包器，single 在那边会响亮拒）");
  const cases = [
    "011-add-operator-types",
    "020-match-array-pattern",
    "023-await-return-value",
    "024-await-signal-args",
    "042-enum",
    "046-int-div-mod",
    "049-array-unbox",
    "050-dict-unbox",
  ];
  for (const mode of ["single", "local"] as const) {
    for (const c of cases) {
      const src = readFileSync(join(ROOT, "corpus/cases", c, "main.gd"), "utf8");
      const ir = lower(await parseSource(src));
      const diags = analyze(ir);
      if (diags.length > 0) {
        bad(`${mode} ${c}: 不该被 sema 拦（${diags[0]!.code}）`);
        continue;
      }
      const dir = join(TMP, `${mode}_${c}`);
      mkdirSync(dir, { recursive: true });
      copyFileSync(STANDALONE_CJS, join(dir, "gds2js-standalone.cjs"));
      const { code } = emitModuleWithMap(ir, {
        autoRun: true,
        runtimeMode: mode,
        ...(mode === "single" ? { standaloneInline: STANDALONE_SRC } : { standaloneRequirePath: "./gds2js-standalone.cjs" }),
      });
      const file = join(dir, "m.mts");
      writeFileSync(file, code, "utf8");
      const { out } = runNode(dir, "m.mts");
      const golden = readFileSync(join(ROOT, "corpus/cases", c, "godot.txt"), "utf8");
      if (out === golden) ok(`${mode} ${c}`);
      else bad(`${mode} ${c}: 输出与 golden 不符\n    got=${JSON.stringify(out.slice(0, 120))}\n    exp=${JSON.stringify(golden.slice(0, 120))}`);
    }
  }
}

async function checkNestedProjectLocal(): Promise<void> {
  console.log("② 子目录工程 local：../ 相对旁挂 + 跨文件 registerClass 共享");
  const proj = join(TMP, "nested_src");
  mkdirSync(join(proj, "sub"), { recursive: true });
  writeFileSync(join(proj, "project.godot"), "[application]\nconfig/name=\"nested\"\n", "utf8");
  writeFileSync(join(proj, "main.gd"), "extends SceneTree\n\nfunc _initialize():\n\tvar t = Thing.new()\n\tprint(t.greet())\n\tquit()\n", "utf8");
  writeFileSync(join(proj, "sub/thing.gd"), "class_name Thing\n\nfunc greet():\n\treturn \"hi from sub\"\n", "utf8");

  const outDir = join(TMP, "nested_out");
  mkdirSync(outDir, { recursive: true });
  const standaloneFile = join(outDir, "gds2js-standalone.cjs");
  copyFileSync(STANDALONE_CJS, standaloneFile);

  const result = await compileProject({
    entries: [join(proj, "main.gd")],
    resRoot: proj,
    outDir,
    runtimeImport: "gds2js/runtime",
    hostImport: "gds2js/host",
    runtimeMode: "local",
    standaloneFile,
  });
  if (result.diags.length > 0) bad(`nested 编译有诊断：${result.diags[0]!.diagnostic.message}`);
  const byRes = new Map(result.modules.map((m) => [m.resPath, m]));
  const sub = byRes.get("res://sub/thing.gd");
  if (!sub) return bad("nested 未产出 res://sub/thing.gd 模块");
  mkdirSync(dirname(sub.jsPath), { recursive: true });
  for (const m of result.modules) writeFileSync(m.jsPath, m.code, "utf8");
  if (sub.code.includes("../gds2js-standalone.cjs")) ok("子模块 requirePath 用 ../ 命中上级旁挂包");
  else bad(`子模块 requirePath 未走 ../：\n    ${sub.code.split("\n").find((l) => l.includes("standalone")) ?? "(无 standalone 行)"}`);

  const entry = byRes.get("res://main.gd");
  if (!entry) return bad("nested 未产出入口 main");
  const { out, code } = runNode(outDir, "main.mts");
  if (code === 0 && out === "hi from sub\n") ok("nested local 入口跑通，输出正确");
  else bad(`nested local 运行异常 code=${code} out=${JSON.stringify(out.slice(0, 200))}`);
}

function decodeMappingsField(str: string): Array<{ genLine: number; srcLine: number; srcCol: number }> {
  const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const val = (c: string): number => {
    const i = B64.indexOf(c);
    if (i < 0) throw new Error(`bad base64 char ${JSON.stringify(c)}`);
    return i;
  };
  const out: Array<{ genLine: number; srcLine: number; srcCol: number }> = [];
  let sIdx = 0, sLine = 0, sCol = 0;
  str.split(";").forEach((grp, genLine) => {
    if (!grp) return;
    for (const seg of grp.split(",")) {
      let pos = 0;
      const field = (): number => {
        let shift = 0, result = 0, cont: number;
        do {
          const d = val(seg[pos++]!);
          cont = d & 32;
          result += (d & 31) * Math.pow(2, shift);
          shift += 5;
        } while (cont);
        return result & 1 ? -(result >> 1) : result >> 1;
      };
      field();
      sIdx += field();
      sLine += field();
      sCol += field();
      void sIdx;
      out.push({ genLine, srcLine: sLine, srcCol: sCol });
    }
  });
  return out;
}

async function checkSourcemapSingle(): Promise<void> {
  console.log("③ single 模式 sourcemap 解码：genLine 被内联头顶大、srcLine 仍指回 .gd 小行号");
  const src = readFileSync(join(ROOT, "corpus/cases/042-enum/main.gd"), "utf8");
  const gdLineCount = src.split("\n").length;
  const ir = lower(await parseSource(src));
  const dir = join(TMP, "smap");
  mkdirSync(dir, { recursive: true });
  const { code, map } = emitModuleWithMap(ir, {
    autoRun: true,
    sourcemap: true,
    runtimeMode: "single",
    standaloneInline: STANDALONE_SRC,
    sourceFile: "main.gd",
    jsFile: "m.mts",
  });
  const totalGenLines = code.split("\n").length;
  if (!map) return bad("single+sourcemap 未产出 map");
  const m = decodeMappingsField(map.mappings);
  if (m.length === 0) return bad("mappings 解码为空");
  const maxGen = Math.max(...m.map((x) => x.genLine));
  const badSrc = m.filter((x) => x.srcLine < 0 || x.srcLine >= gdLineCount);
  if (maxGen > 1000) ok(`映射落在内联头之后（最大 genLine=${maxGen}，总生成行=${totalGenLines}）`);
  else bad(`genLine 未体现内联头偏移（max=${maxGen}）`);
  if (badSrc.length === 0) ok(`全部 ${m.length} 条 srcLine 都在 .gd 行数范围内（<${gdLineCount}）`);
  else bad(`${badSrc.length} 条 srcLine 越界，例：${JSON.stringify(badSrc.slice(0, 3))}`);
  writeFileSync(join(dir, "m.mts"), code, "utf8");
  writeFileSync(join(dir, "m.mts.map"), JSON.stringify(map), "utf8");
  const { out } = runNode(dir, "m.mts");
  const golden = readFileSync(join(ROOT, "corpus/cases/042-enum/godot.txt"), "utf8");
  if (out === golden) ok("带 map 的 single 产物仍逐字节匹配 golden");
  else bad(`带 map single 输出不符：${JSON.stringify(out.slice(0, 120))}`);
}

async function checkWholeAppSingle(): Promise<void> {
  console.log("④ build-project single：tsdown bundle → 零 import 单文件 + 仓库外可跑");
  const req = createRequire(import.meta.url);
  const rt = pathToFileURL(req.resolve("gds2js/runtime")).href;
  const host = pathToFileURL(req.resolve("gds2js/host")).href;
  const emit = join(TMP, "wa_emit");
  const out = join(TMP, "wa_out");
  mkdirSync(emit, { recursive: true });
  const res = await compileProject({
    entries: [join(ROOT, "examples/multi/main.gd")],
    resRoot: join(ROOT, "examples/multi"),
    outDir: emit,
    runtimeImport: rt,
    hostImport: host,
  });
  if (res.diags.length > 0) return bad(`whole-app 编译诊断：${res.diags[0]!.diagnostic.message}`);
  for (const m of res.modules) {
    mkdirSync(dirname(m.jsPath), { recursive: true });
    writeFileSync(m.jsPath, m.code, "utf8");
  }
  const entry = res.modules.find((m) => m.resPath === "res://main.gd");
  if (!entry) return bad("whole-app 无入口模块");
  await build({
    entry: entry.jsPath,
    outDir: out,
    format: "esm",
    target: "node22",
    dts: false,
    clean: true,
    config: false,
    silent: true,
  } as unknown as Parameters<typeof build>[0]);
  const bundleFile = join(out, "main.mjs");
  const b = readFileSync(bundleFile, "utf8");
  const imports = b.split("\n").filter((l) => /^\s*import[\s{*.]/.test(l));
  if (imports.length === 0) ok("bundle 零 top-level import（运行时/宿主/跨文件全内联）");
  else bad(`bundle 仍有 top-level import：${JSON.stringify(imports.slice(0, 3))}`);
  const iso = mkdtempSync(join(tmpdir(), "gds-iso-"));
  try {
    copyFileSync(bundleFile, join(iso, "app.mjs"));
    const { out: o, code } = runNode(iso, "app.mjs");
    if (code === 0 && o === "7\ntrue\nshape-7\nhi bob\ntrue\nhi zed\n") ok("仓库外 node 跑单文件 bundle，输出正确");
    else bad(`仓库外运行异常 code=${code} out=${JSON.stringify(o.slice(0, 160))}`);
  } finally {
    rmSync(iso, { recursive: true, force: true });
  }
}

async function main(): Promise<void> {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });
  try {
    await checkPerCaseModes();
    await checkNestedProjectLocal();
    await checkSourcemapSingle();
    await checkWholeAppSingle();
  } finally {
    console.log(`\n失败 ${failures} 项`);
    rmSync(TMP, { recursive: true, force: true });
    process.exit(failures === 0 ? 0 : 1);
  }
}

await main();
