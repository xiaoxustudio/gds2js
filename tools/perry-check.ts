#!/usr/bin/env node
/**
 * perry 产物的**语义可信度**门：把语料真打成独立 exe，跑起来，逐字节对 Godot golden。
 *
 *   node tools/perry-check.ts 001 063 077          # 指定若干例（前缀匹配）
 *   node tools/perry-check.ts                      # 默认：风险面代表集（验 CLI 的默认 GC）
 *   node tools/perry-check.ts --all                # 全量（发版前跑）
 *   PERRY_RS4GC=1 node tools/perry-check.ts 001    # 换 GC 模式验（显式设过就照你的值）
 *
 * 为什么要有这一条而不是只看「export 出货了」：perry 那一支走的是 `PERRY_RS4GC=0`
 * （CLI 的默认 —— 默认那支 RS4GC 在 Windows 上编译含 try/catch 的模块会访问违例，上游 #7354）。
 * 换 GC 策略换来的是**能跑但可能算错**的风险 —— 只有拿真 Godot 的输出做裁判才量得出来。
 * 所以这个门对失败严格：任何一例不一致就红灯，不像 export-check 那样容忍上游状态。
 *
 * 成本实测：打平运行时进 perry 的模块缓存后，单例 ~3–10 s；冷启动第一例（要原生编那份运行时）
 * 到 2 min 量级。所以默认跑代表集，`--all` 留给发版前。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ROOT, caseScript, godotOk, listCases, normalize, readGolden } from "./lib.mjs";

/**
 * 代表集：挑的是 perry 最容易翻车的地方，不是随机抽样。
 * int64/bigint、float32（Math.fround）、字符串里靠正则的方法（hash/md5/split/format）、
 * 容器与闭包（GC 面）、跨文件类与 await（调用约定面）、预期报错那类（异常路径）。
 */
const CORE = [
  "001-int-division",
  "005-int64-range",
  "006-int64-overflow",
  "009-equality-deep",
  "015-closure-capture-loop",
  "017-float-special-values",
  "021-class-basic",
  "023-await-return-value",
  "031-cross-file-class",
  "037-super-method",
  "060-string-utf32",
  "063-format-specs",
  "066-vector2-float32",
  "077-string-scientific-md5",
  "091-vector3",
  "096-color",
  "098-string-hash",
  "099-split-max",
  "103-string-to-float",
  "105-sort-tie-order",
  "135-packed-byte-array",
  "141-packed-string-array",
  "145-packed-vector-color",
  "092-vector3-index-error",
  "084-typed-nested-error",
  "113-array-void-return-error",
];

const argv = process.argv.slice(2);
const all = argv.includes("--all");
const only = argv.filter((a) => !a.startsWith("--"));
const cases = only.length > 0 ? only.flatMap((f) => listCases(f)) : all ? listCases("") : CORE;

// 不设 PERRY_RS4GC 时，验的就是 CLI 自己那条默认路（CLI 会给 perry 注入 PERRY_RS4GC=0）。
// 显式设过就照你设的值验 —— 这一条门钉的是「哪一种 GC 模式下产物与 golden 逐字节一致」，
// 所以打印出来的模式必须是当真跑的那一个。
const gcNote = process.env.PERRY_RS4GC
  ? `按你显式设的 PERRY_RS4GC=${process.env.PERRY_RS4GC} 验`
  : "未设 PERRY_RS4GC —— 验的是 CLI 的默认（它给 perry 注入 PERRY_RS4GC=0）";
if (!existsSync(join(ROOT, "dist", "cli.mjs"))) {
  console.error("没有 dist/cli.mjs —— 先跑 pnpm build（export 吃 dist/product.mjs）。");
  process.exit(2);
}

const work = join(tmpdir(), "gds2js-perry-check");
mkdirSync(work, { recursive: true });

/** 一例：CLI 真打一个 exe，再把它当黑盒跑起来。 */
function check(id: string): { id: string; ok: boolean; note: string } {
  const entry = caseScript(id);
  const golden = readGolden(id);
  if (golden === null) return { id, ok: false, note: "没有 golden" };
  const exe = join(work, `${id}.exe`);
  rmSync(exe, { force: true });
  const build = spawnSync(
    process.execPath,
    ["dist/cli.mjs", "export", entry, "-o", exe, "--pack", "perry"],
    { cwd: ROOT, encoding: "utf8", windowsHide: true, timeout: 1_800_000 },
  );
  const wantedOk = godotOk(golden);
  if (build.status !== 0 || !existsSync(exe)) {
    // Godot 侧就报错的用例里有一类是**静态**错（定型容器嵌套、把 void 返回值当值用…），
    // 我们的语义分析在编译期就拦下 —— export 正确地不出货。这种「非 0 + 有诊断」就是通过。
    if (!wantedOk) {
      const diag = (build.stderr || "").trim();
      if (diag === "") return { id, ok: false, note: "预期报错用例拒了但没给任何诊断" };
      return { id, ok: true, note: "编译期正确拒绝（语义分析拦下）" };
    }
    const why = (build.stderr || build.stdout || "").trim().split("\n").slice(-4).join("\n  ");
    return { id, ok: false, note: `没能出货（退出码 ${build.status}）：\n  ${why}` };
  }
  const run = spawnSync(exe, [], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  const out = run.stdout ?? "";
  if (run.error) return { id, ok: false, note: `exe 起不来：${run.error.message}` };
  if (!wantedOk) {
    // 另一类预期报错是**运行期**的（除零、越界下标…）：exe 该有，但跑起来必须非 0 且报错可见 ——
    // 静默退 0 就是语义错了，最坏的假绿
    if (run.status === 0) return { id, ok: false, note: "预期报错用例却退出 0" };
    if ((run.stderr || "").trim() === "") return { id, ok: false, note: `退了 ${run.status} 但 stderr 没任何报错` };
    return { id, ok: true, note: "运行期正确报错（非 0 退出）" };
  }
  if (run.status !== 0) {
    return { id, ok: false, note: `退出码 ${run.status}：${(run.stderr || "").trim().split("\n").slice(-2).join(" / ")}` };
  }
  // 与 run-check 同一条对比契约：golden 是 normalize 过的，产物走同一个 normalize
  const got = normalize(out, entry);
  if (got === golden) return { id, ok: true, note: "逐字节一致" };
  const a = golden.split("\n");
  const b = got.split("\n");
  const line = a.findIndex((x, i) => x !== b[i]);
  return { id, ok: false, note: `第 ${line + 1} 行不一致 godot=${JSON.stringify(a[line])} perry=${JSON.stringify(b[line])}` };
}

let pass = 0;
const fails: string[] = [];
console.log(`perry 语义门（共 ${cases.length} 例）：${gcNote}`);
for (const id of cases) {
  const t0 = Date.now();
  const r = check(id);
  const sec = ((Date.now() - t0) / 1000).toFixed(0);
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${id} (${sec}s) ${r.ok ? "" : r.note}`);
  if (r.ok) pass++;
  else fails.push(`${id}: ${r.note}`);
}
if (!argv.includes("--keep")) rmSync(work, { recursive: true, force: true });
console.log(`\nperry 产物：通过 ${pass}，失败 ${cases.length - pass}（共 ${cases.length} 例）`);
for (const f of fails) console.log(`  FAIL  ${f}`);
process.exit(fails.length === 0 ? 0 : 1);
