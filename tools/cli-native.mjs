#!/usr/bin/env node
/**
 * 把 gds2js 自己编成不带 node 的原生 exe：复制 src/ 到 scratch、把四份同名文件换成原生实现、
 * 用 zig 编 C、写 ffi manifest、跑 scriptc build。
 * C 必须用 zig cc -target x86_64-windows-gnu 编：换工具链目标会在链接期找不到 libuuid.a。
 *
 * 用法：
 *   node tools/cli-native.mjs                    # 出货形态：--dynamic（岛），编出来在 tmp/cli-native/gds2js.exe
 *   node tools/cli-native.mjs --ts-only --keep   # 只重编 TS：沿用已有的 .o
 *   node tools/cli-native.mjs --coverage         # 只要围栏清单（带 file:line）
 *   TS_SRC=../libtree-sitter node tools/cli-native.mjs
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRATCH = join(ROOT, "tmp", "cli-native");
const TS_SRC = process.env.TS_SRC ?? join(ROOT, "tmp", "libtree-sitter");
const ZIG = process.env.ZIG_CC ?? "zig";
const SCRIPTC = process.env.SCRIPTC_BIN ?? "scriptc";
const GRAMMAR = join(ROOT, "tree-sitter-gdscript", "src");
const coverageOnly = process.argv.includes("--coverage");
const keep = process.argv.includes("--keep");

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function listTs(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) listTs(p, out);
    else if (name.endsWith(".ts")) out.push(p);
  }
  return out;
}

if (!existsSync(join(TS_SRC, "lib", "src", "lib.c"))) {
  fail(`找不到 libtree-sitter 源码：${TS_SRC}\n  用 TS_SRC=<目录> 指过去（那目录要有 lib/src/lib.c 与 lib/include/tree_sitter/api.h）。`);
}

/* 1) scratch 里的 src/ */
rmSync(join(SCRATCH, "src"), { recursive: true, force: true });
const srcFiles = listTs(join(ROOT, "src"));
for (const abs of srcFiles) {
  const rel = relative(ROOT, abs).split("\\").join("/");
  const dest = join(SCRATCH, rel);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(abs, dest);
}
console.log(`复制了 ${srcFiles.length} 份源码 → ${join(SCRATCH, "src")}`);

/* 2) parser.ts 换成原生实现（工具链之外的依赖就断在这里） */
const NATIVE_PARSER = `// 原生构建专用（由 tools/cli-native.mjs 生成，**不要**在仓库里改这份）：
// 同一个 \`parseSource\`，树从 libtree-sitter（\`--ffi\`）来，不再碰 web-tree-sitter。
// CST 形状是 \`./cst\` 的普通记录 —— 类实例喂不进记录形参（S231 的 SC2002），两側都交记录（S232）。
import { buildCsTree, type NodeTable } from "./native";
import type { CsTree } from "./cst";

declare function gdsInit(): number;
declare function gdsParseNodes(src: string, len: number): number;
declare function gdsNodesBytes(): number;
declare function gdsNodesInto(buf: Uint8Array, cap: number): number;
declare function gdsNamesBytes(): number;
declare function gdsNamesInto(buf: Uint8Array, cap: number): number;

let ready = false;

function ensureLanguage(): void {
  if (ready) return;
  if (gdsInit() !== 1) throw new Error("tree-sitter 装载 gdscript 语言失败");
  ready = true;
}

function tableFromFfi(src: string): NodeTable {
  const nb = gdsNodesBytes();
  const recBuf = new Uint8Array(nb);
  gdsNodesInto(recBuf, nb);
  const mb = gdsNamesBytes();
  const names = new Uint8Array(mb);
  gdsNamesInto(names, mb);
  return { rec: new Int32Array(recBuf.buffer), names, src };
}

export async function parseSource(src: string): Promise<CsTree> {
  ensureLanguage();
  if (gdsParseNodes(src, src.length) < 0) throw new Error("gds_parse_nodes 失败（parser 没装载？）");
  return buildCsTree(tableFromFfi(src));
}
`;
writeFileSync(join(SCRATCH, "src", "parse", "parser.ts"), NATIVE_PARSER, "utf8");
console.log("scratch 的 parser.ts 换成原生实现");

/* 2b) 另外三份同名文件换成原生实现。
 *     parser / exec / bundle / home 这四份是构建期分岔的口子：node 那侧吃 web-tree-sitter、
 *     进程内 import()、tsdown、SEA 资产，原生 exe 里这四样都不存在，所以同名换实现，其余源码一行不改。
 */
const NATIVE_BUNDLE = `// 原生构建专用（由 tools/cli-native.mjs 生成）：exe 里没有打包器，single 照实响亮拒。
export async function bundlingAvailable(): Promise<boolean> {
  return false;
}

export async function bundleModule(entry: string, outDir: string): Promise<void> {
  throw new Error(\`这个构建里没带打包器（\${entry} → \${outDir}）\`);
}
`;
writeFileSync(join(SCRATCH, "src", "bundle.ts"), NATIVE_BUNDLE, "utf8");
console.log("scratch 的 bundle.ts 换成原生实现（single 响亮拒）");

const NATIVE_EXEC = `// 原生构建专用（由 tools/cli-native.mjs 生成）：静态 exe 里没有能跑产物的引擎 ——
// 产物吃的是 node 的 builtin（\`src/host-node.ts\`），所以 \`run\` 起一个**外部 node 子进程**。
// 版本要求是产物那边来的：入口是 \`.mts\`，靠 node 的类型剥离跑（22.18+/23.6+ 默认开）。
import { spawnSync } from "node:child_process";

const BIN: string = process.env.GDS2JS_NODE_BIN === undefined || process.env.GDS2JS_NODE_BIN === "" ? "node" : process.env.GDS2JS_NODE_BIN;

export async function runProduct(path: string): Promise<void> {
  const r = spawnSync(BIN, [path], { stdio: "inherit", windowsHide: true });
  if (r.error) throw new Error(\`起 \${BIN} 失败（产物要 node \u2265 22.18；可以用 GDS2JS_NODE_BIN 指到具体二进制）：\${r.error.message}\`);
  if (r.status !== 0) throw new Error(\`产物退出码 \${String(r.status)}\`);
}
`;
writeFileSync(join(SCRATCH, "src", "exec.ts"), NATIVE_EXEC, "utf8");
console.log("scratch 的 exec.ts 换成原生实现（run 起外部 node 子进程）");

/* 原生那支的「自带家目录」= 构建期把 dist 与 runtime 源码嵌进 exe。
 * 契约与 SEA 那支一字不差：解出一个只读目录，给目录本身和目录里某个文件的落盘路径。
 * 带的是 cli.ts 问到的那些键：dist 下的 .mjs/.cjs、src/runtime/**.ts、src/host.ts、src/lower/double.ts。
 * 不带 wasm：解析器走 FFI，gdscript.wasm 在这条路上没有读者。 */
const HOME = [];
const HOME_KEYS = [];
function assetTo(rel, abs) {
  HOME_KEYS.push(rel);
  HOME.push(`  ${JSON.stringify(rel)}: ${JSON.stringify(readFileSync(abs, "utf8"))}`);
}
for (const name of readdirSync(join(ROOT, "dist")).sort()) {
  if (!/\.(mjs|cjs)$/.test(name)) continue;
  assetTo(`dist/${name}`, join(ROOT, "dist", name));
}
const RT_DIR = join(ROOT, "src", "runtime");
for (const abs of listTs(RT_DIR)) assetTo(`src/runtime/${relative(RT_DIR, abs).split("\\").join("/")}`, abs);
assetTo("src/host.ts", join(ROOT, "src", "host.ts"));
assetTo("src/lower/double.ts", join(ROOT, "src", "lower", "double.ts"));
if (HOME.length === 0) fail("`dist` 里没有 .mjs/.cjs —— 先跑 pnpm build（原生 exe 要把自带运行时嵌进去）。");
const EMBED_MB = (HOME.reduce((n, s) => n + s.length, 0) / 1048576).toFixed(2);
const NATIVE_HOME = `// 原生构建专用（由 tools/cli-native.mjs 生成）：exe 自带的家目录 = 构建期嵌进来的 ${HOME.length} 份文件
// （约 ${EMBED_MB} MB 文本）。第一次用到时解到临时目录，之后 cli.ts 问路径都指那儿 ——
// 与 SEA 那支同一个契约，所以 selfHome()/selfFile() 的调用点一行不用改。
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const ASSETS: Record<string, string> = {
${HOME.join(",\n")}
};

const KEYS: string[] = [
${HOME_KEYS.map((k) => `  ${JSON.stringify(k)}`).join(",\n")}
];

/** 目录名只要求「内容换了它就换」（FNV-1a over 键长与内容长度），不是密码学用途。 */
function tagOf(): string {
  let h = 0x811c9dc5;
  for (const k of KEYS) {
    const v = ASSETS[k] as string;
    const s = k + ":" + String(v.length);
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  }
  return (h >>> 0).toString(16);
}

let home: string | null | undefined;

/** 解出来的家目录（进程内只算一次）。原生 exe 里恒不为 null（除非临时目录写不进去）。 */
export function selfHome(): string | null {
  if (home !== undefined) return home;
  const tag = tagOf();
  const fromEnv = process.env.GDS2JS_HOME;
  const dir = fromEnv === undefined || fromEnv === "" ? join(tmpdir(), "gds2js-home-native-" + tag) : fromEnv;
  try {
    const ready = join(dir, ".ready");
    if (!existsSync(ready) || readText(ready) !== tag) {
      for (const k of KEYS) {
        const dest = join(dir, k);
        mkdirSync(dirname(dest), { recursive: true });
        writeFileSync(dest, ASSETS[k] as string, "utf8");
      }
      writeFileSync(ready, tag, "utf8");
    }
    home = dir;
  } catch (e) {
    console.error("gds2js: 解出 exe 自带的家目录失败：" + (e instanceof Error ? e.message : String(e)));
    console.error("  可以用 GDS2JS_HOME 指到一个可写的目录。");
    home = null;
  }
  return home;
}

function readText(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

export function selfFile(rel: string): string | null {
  const h = selfHome();
  if (!h) return null;
  const p = join(h, rel);
  return existsSync(p) ? p : null;
}
`;
writeFileSync(join(SCRATCH, "src", "home.ts"), NATIVE_HOME, "utf8");
console.log(`scratch 的 home.ts 换成原生实现（嵌 ${HOME.length} 份 / 约 ${EMBED_MB} MB）`);


/* 3) 编 C（`--ts-only` 复用已有的 obj，不重编 libtree-sitter） */
const objDir = join(SCRATCH, "obj");
const tsOnly = process.argv.includes("--ts-only");
if (!tsOnly) rmSync(objDir, { recursive: true, force: true });
mkdirSync(objDir, { recursive: true });
const INC = ["-I", join(TS_SRC, "lib", "include"), "-I", join(TS_SRC, "lib", "src"), "-I", GRAMMAR];
const units = [
  { src: join(TS_SRC, "lib", "src", "lib.c"), obj: "lib.o" },
  { src: join(GRAMMAR, "parser.c"), obj: "parser.o" },
  { src: join(GRAMMAR, "scanner.c"), obj: "scanner.o" },
  { src: join(ROOT, "native", "gds_ts.c"), obj: "gds_ts.o" },
];
for (const u of units) {
  if (tsOnly && existsSync(join(objDir, u.obj))) {
    console.log(`沿用 ${u.obj}（--ts-only）`);
    continue;
  }
  const args = ["cc", "-target", "x86_64-windows-gnu", "-O2", "-std=c11", ...INC, "-c", u.src, "-o", join(objDir, u.obj)];
  const r = spawnSync(ZIG, args, { encoding: "utf8", cwd: ROOT, timeout: 900_000 });
  if (r.status !== 0) fail(`${u.obj} 编译失败：\n${((r.stderr ?? "") + (r.stdout ?? "")).slice(0, 3000)}`);
  console.log(`编好 ${u.obj}`);
}

/* 4) manifest + scriptc */
const manifest = {
  ffi_format: 6,
  functions: [
    { name: "gdsInit", symbol: "gds_init", params: [], returns: "i32" },
    { name: "gdsParseNodes", symbol: "gds_parse_nodes", params: ["string", "i32"], returns: "i32" },
    { name: "gdsNodesBytes", symbol: "gds_nodes_bytes", params: [], returns: "i32" },
    { name: "gdsNodesInto", symbol: "gds_nodes_into", params: ["mutable-bytes", "i32"], returns: "i32" },
    { name: "gdsNamesBytes", symbol: "gds_names_bytes", params: [], returns: "i32" },
    { name: "gdsNamesInto", symbol: "gds_names_into", params: ["mutable-bytes", "i32"], returns: "i32" },
  ],
  libraries: units.map((u) => join(objDir, u.obj)),
};
const ffiPath = join(SCRATCH, "ffi.json");
writeFileSync(ffiPath, JSON.stringify(manifest, null, 2), "utf8");

const entry = join(SCRATCH, "src", "cli.ts");
/* 岛是**必需**的，不再是可选形态：CLI 的参数解析用 commander，而 commander 不带岛就是 6 格 SC2013
 * （实测；岛里 0 错并真跑通）。原先 `--static` 那一支随 commander 一起没了。 */
if (coverageOnly) {
  const covArgs = ["coverage", entry, "--dynamic"];
  const r = spawnSync(SCRIPTC, covArgs, { encoding: "utf8", cwd: ROOT, timeout: 1_500_000 });
  process.stdout.write(`${r.stdout ?? ""}${r.stderr ?? ""}`);
  process.exit(r.status ?? 1);
}
const exe = join(SCRATCH, "gds2js.exe");
const build = spawnSync(SCRIPTC, ["build", entry, "--ffi", ffiPath, "--dynamic", "-o", exe, "--strip"], { encoding: "utf8", cwd: ROOT, timeout: 2_400_000 });
process.stdout.write(`${build.stdout ?? ""}${build.stderr ?? ""}`);
if (build.status !== 0 || !existsSync(exe)) {
  console.error("\n还没编过去：把上面每一格的 SC 编号对着 ROADMAP §5.12.2 / §5.12.3 查，新增的围栏要记进 S 账。");
  if (!keep) rmSync(SCRATCH, { recursive: true, force: true });
  process.exit(1);
}
console.log(`原生 CLI 出货：${exe}`);
if (!keep) rmSync(SCRATCH, { recursive: true, force: true });
