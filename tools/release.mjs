#!/usr/bin/env node
/**
 * 发布收口（形态 A：只发 `gds2js.exe`，scriptc 由用户自备）——一条链跑完：
 *   版本一致性校验（根/三包 package.json ↔ src/version.ts）→ pnpm build → 原生 CLI 等价性门（项数会随门加长，不写死；
 *   exe 过期会自动重编）→ 落 `release/` + sha256 → 产物 `--version` 冒烟。
 *
 * 用法：pnpm release
 * 不带 scriptc、也不写 zip（拍板记录已归档：`git show 64cf250:docs/ROADMAP.md` §0 的 H/I 两行）。
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { ROOT } from "./lib.mjs";

function fail(msg) {
  console.error(`release: ${msg}`);
  process.exit(1);
}

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: "inherit", cwd: ROOT, windowsHide: true });
  if (r.error) fail(`${bin} 起不来：${r.error.message}`);
  if (r.status !== 0) fail(`${bin} ${args.join(" ")}（退出码 ${r.status}）`);
}

/** Windows 上 pnpm 是 .cmd：整串命令交给 shell（拆 args 会触发 Node 的 DEP0190 告警）。 */
function runCmd(cmd) {
  const r = spawnSync(cmd, { stdio: "inherit", cwd: ROOT, shell: true, windowsHide: true });
  if (r.error) fail(`${cmd} 起不来：${r.error.message}`);
  if (r.status !== 0) fail(`${cmd}（退出码 ${r.status}）`);
}

/* 1) 版本一致性：version.ts 是唯一字面量，其它四处必须一字一致。 */
const versionTs = readFileSync(join(ROOT, "packages", "gds2js", "src", "version.ts"), "utf8");
const m = /VERSION = "([^"]+)"/.exec(versionTs);
if (!m) fail("packages/gds2js/src/version.ts 里找不到 VERSION 字面量");
const version = m[1];
for (const p of ["package.json", "packages/runtime/package.json", "packages/compiler/package.json", "packages/gds2js/package.json"]) {
  const v = JSON.parse(readFileSync(join(ROOT, p), "utf8")).version;
  if (v !== version) fail(`版本不一致：${p} 是 ${v}，version.ts 是 ${version}`);
}
console.log(`release: 版本 ${version}（根/三包/version.ts 一致）`);

/* 1b) Node 底线一致性：engines（根与对外包）与 exec.native.ts 里那句「产物要 node ≥ X」必须同一个数。
       25 是这一版对外声明的底线（engines 已提到 >=25），SEA 那支另要 25.7、由运行期判。 */
const enginesOf = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8")).engines?.node ?? "";
const rootEngines = enginesOf("package.json");
const pkgEngines = enginesOf("packages/gds2js/package.json");
if (rootEngines !== pkgEngines) fail(`engines.node 不一致：根是 ${rootEngines || "缺"}，gds2js 是 ${pkgEngines || "缺"}`);
const seamFloor = /产物要 node ≥ ([\d.]+)/.exec(readFileSync(join(ROOT, "packages", "gds2js", "src", "exec.native.ts"), "utf8"));
if (!seamFloor) fail("packages/gds2js/src/exec.native.ts 里找不到「产物要 node ≥ …」那句，底线口径断了");
if (`>=${seamFloor[1]}` !== rootEngines) fail(`engines.node（${rootEngines}）与 exec.native.ts 的产物底线（>=${seamFloor[1]}）不一致`);
console.log(`release: engines.node ${rootEngines}（根/gds2js/exec.native.ts 一致）`);

/* 2) 构建 + 门：门里 exe 过期会自动重编，编完跑等价性门（含 SEA / scriptc 两支真出货）。 */
console.log("release: pnpm build …");
runCmd("pnpm build");
/* 2b) 面探针：一个把 runtime String 面拉满的用例走 scriptc 短路（本机 38s）。
 * 围栏类回归（新形状没 lowering、或旧形状被新代码变可达）在这里先炸，不用等等价性门那几分钟。
 * 两支门都已迁到 Vitest（test/e2e/），所以这里改成调 runner。
 * GDS2JS_SCRIPTC_FILTER 而不是 `-t`：`-t` 只过滤**已收集**的测试，挑不出代表集之外的用例，
 * 而旧版 `scriptc-check.mjs <id>` 的语义是「有 filter 就跑全部匹配用例」。 */
console.log("release: scriptc 面探针（234-string-methods-batch）…");
// 在父进程里设、由子进程继承 —— 比 `set X=Y&& cmd` 那种 shell 专属写法稳，也不挑平台。
process.env.GDS2JS_SCRIPTC_FILTER = "234-string-methods-batch";
try {
  runCmd("pnpm exec vitest run --project e2e scriptc.test.ts");
} finally {
  delete process.env.GDS2JS_SCRIPTC_FILTER;
}
console.log("release: 原生 CLI 等价性门…");
runCmd("pnpm exec vitest run --project e2e cli-native.test.ts");

/* 3) 落产物：release/gds2js-<version>-win64.exe + .sha256。 */
const exe = join(ROOT, "tmp", "cli-native", "gds2js.exe");
if (!existsSync(exe)) fail("门跑完却没找到 tmp/cli-native/gds2js.exe");
const outDir = join(ROOT, "release");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
const out = join(outDir, `gds2js-${version}-win64.exe`);
copyFileSync(exe, out);
const sha = createHash("sha256").update(readFileSync(out)).digest("hex");
writeFileSync(`${out}.sha256`, `${sha}  ${basename(out)}\n`, "utf8");

/* 4) 冒烟：版本戳真的编进了 exe。 */
const v = spawnSync(out, ["--version"], { encoding: "utf8", cwd: ROOT, windowsHide: true });
const got = (v.stdout ?? "").trim();
if (v.status !== 0 || got !== version) fail(`产物 --version 冒烟失败：status=${String(v.status)} stdout=${JSON.stringify(got)}`);
console.log(`release: ${out}`);
console.log(`release: sha256 ${sha}`);
console.log("release: 完成（形态 A：只发 exe；scriptc 由用户自备——同目录 scriptc/、npm i -D scriptc 或 SCRIPTC_BIN）");
