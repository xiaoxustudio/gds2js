// tree-face 对账门：清单（packages/runtime/src/tree-face.ts）↔ 盘面 ↔ 三处消费者。
//   ① 清单指到的源必须在盘面；② 镜像不变量（tree = repo 原位；home = srcPrefix + repo）；
//   ③ 消费者零硬编码（树面字符串只许出现在 tree-face.ts 里），且确实引用清单。
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { TREE_FACE } from "@gds2js/runtime/tree-face";
import { ROOT } from "./lib.mjs";

let pass = 0;
let fail = 0;

function ok(msg: string): void {
  pass++;
  console.log(`  ✓ ${msg}`);
}
function bad(msg: string): void {
  fail++;
  console.error(`  ✗ ${msg}`);
}

console.log("tree-face 对账门\n");

const T = TREE_FACE;
const rtSrc = join(ROOT, T.repo.runtimeSrcRoot);
const rel = (p: string): string => relative(ROOT, p).split("\\").join("/");

/* ① 清单指到的源文件在盘面 */
console.log("① 清单源在盘面");
const sources: Array<[string, string]> = [
  ["runtime 目录", join(rtSrc, T.repo.runtimeDir)],
  ["runtime 入口", join(rtSrc, T.repo.runtimeDir, T.repo.runtimeIndex)],
  ["host", join(rtSrc, T.repo.host)],
  ["sharedDouble", join(rtSrc, T.repo.sharedDouble)],
  ["zstdHost", join(rtSrc, T.repo.zstdHost)],
  ["zstdDts", join(rtSrc, T.repo.zstdDts)],
  ["vendor 目录", join(rtSrc, T.repo.vendorDir)],
];
for (const [name, p] of sources) {
  if (existsSync(p)) ok(`${name}：${rel(p)}`);
  else bad(`${name} 不在盘面：${rel(p)}`);
}
for (const pkg of T.tree.zstdPackages) {
  const p = join(rtSrc, T.repo.vendorDir, pkg);
  if (existsSync(p)) ok(`vendor 包：${rel(p)}`);
  else bad(`vendor 包不在盘面：${rel(p)}`);
}

/* ② 镜像不变量 */
console.log("② 镜像不变量（tree = repo 原位；home = srcPrefix + repo）");
const mirrored: Array<[keyof typeof T.tree, keyof typeof T.repo]> = [
  ["runtimeDir", "runtimeDir"],
  ["host", "host"],
  ["sharedDouble", "sharedDouble"],
  ["zstdHost", "zstdHost"],
  ["zstdDts", "zstdDts"],
];
const treeDrift = mirrored.filter(([t, r]) => T.tree[t] !== T.repo[r]);
if (treeDrift.length === 0) ok("tree 五项与 repo 同名同构");
else bad(`tree 与 repo 漂移：${treeDrift.map(([t]) => t).join(", ")}`);
if (T.home.runtimeDir === T.home.srcPrefix + "/" + T.repo.runtimeDir) ok("home.runtimeDir = srcPrefix + repo.runtimeDir");
else bad(`home.runtimeDir（${T.home.runtimeDir}）≠ srcPrefix + repo.runtimeDir`);
if (T.home.host === T.home.srcPrefix + "/" + T.repo.host) ok("home.host = srcPrefix + repo.host");
else bad(`home.host（${T.home.host}）≠ srcPrefix + repo.host`);
if (T.home.sharedDouble === T.home.srcPrefix + "/" + T.repo.sharedDouble) ok("home.sharedDouble = srcPrefix + repo.sharedDouble");
else bad(`home.sharedDouble（${T.home.sharedDouble}）≠ srcPrefix + repo.sharedDouble`);

/* ③ 消费者零硬编码 + 确引清单 */
console.log("③ 消费者零硬编码（硬编码的树面字符串只许出现在 tree-face.ts）");
/** cli.ts 是薄入口（不铺树、扫字面量即可）；真正铺树/铺 HOME 的文件必须引用清单。 */
const consumers: Array<{ path: string; mustRef: boolean }> = [
  { path: "packages/gds2js/src/cli.ts", mustRef: false },
  { path: "packages/gds2js/src/cli/export-ts-tree.ts", mustRef: true },
  { path: "tools/scriptc-check.mjs", mustRef: true },
  { path: "tools/cli-native.mjs", mustRef: true },
];
const forbidden = [
  ...new Set<string>([
    T.repo.runtimeSrcRoot,
    T.repo.sharedDouble,
    T.tree.sharedDouble,
    T.repo.zstdHost,
    T.tree.zstdHost,
    T.repo.zstdDts,
    T.tree.zstdDts,
    T.home.runtimeDir,
    T.home.host,
    T.home.sharedDouble,
    ...T.tree.zstdPackages,
  ]),
];
for (const { path: name, mustRef } of consumers) {
  const text = readFileSync(join(ROOT, name), "utf8");
  let hits = 0;
  for (const lit of forbidden) {
    text.split("\n").forEach((line, i) => {
      if (line.includes("tree-face")) return; // 清单自己的 import 说明符是唯一例外
      if (line.includes(lit)) {
        bad(`${name}:${String(i + 1)} 硬编码 ${JSON.stringify(lit)}`);
        hits++;
      }
    });
  }
  if (mustRef && !text.includes("TREE_FACE")) bad(`${name} 没引用 TREE_FACE 清单`);
  else if (hits === 0) ok(`${name}：零硬编码${mustRef ? " + 已引清单" : ""}`);
}

console.log(`\ntree-face 对账：通过 ${pass} 项，失败 ${fail} 项`);
process.exit(fail === 0 ? 0 : 1);
