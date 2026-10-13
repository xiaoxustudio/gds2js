/**
 * scriptc 出货门：把语料的产物喂给 scriptc 编成原生 exe，再逐字节对拍 Godot 的 golden。
 * 单文件用例走「产物 + 换宿主 import → scriptc build」这条短路，项目树用例走真命令
 * `export --pack scriptc`。
 *
 * 读数 `出货 X/N 编过、Y/N 跑通、逐字节一致 Z/N` 由 afterAll 原样打印；
 * 判红口径：**逐字节一致数必须等于用例数**（编不过 / 跑挂 / 输出不符都算红）。
 *
 * 开关改成环境变量（Vitest 下 argv 是 runner 自己的）：
 *   GDS2JS_SCRIPTC_ALL=1      全量（≈150 例：141 单文件 + 9 项目树），并发 4
 *   GDS2JS_SCRIPTC_PROJECT=1  只跑项目树那几例，走真命令 export --pack scriptc
 *   GDS2JS_SCRIPTC_KEEP=1     收尾不删替身树与 .gds2js-export 树
 *
 * 并发安全：两个进程**同时跑同一个 id** 会互删替身树，且 `ensureZstdPackages()` 往共享的
 * `tmp/sc-gate/node_modules` 写。所以 (1) 整个 e2e project 钉死单 worker 串行，杜绝跨文件
 * 并发；(2) ensureZstdPackages **提到 beforeAll 只调一次**，拆掉那个共享目录的写竞争；
 * (3) 只有全量/项目树模式才开 it.concurrent（各 id 独占 `tmp/sc-gate/<id>/`，同进程内互不
 * 干扰），代表集仍串行。
 */
import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TREE_FACE } from "@gds2js/runtime/tree-face";
import { hasScriptc, missing } from "../support/env";
import { caseDir, caseIsProject, caseScript, godotOk, listCases, normalize, readGolden, ROOT } from "../support/lib-bridge";
// 文本口径与 IR 标志（usesPackCodec）的互锁断言在 packages/compiler/test/emit-invariants.test.ts；
// 两边共用这一份正则，省掉两处各抄一份带来的漂移。
import { NEED_ZSTD_TEXT } from "../support/pack-codec";

const ALL = process.env.GDS2JS_SCRIPTC_ALL === "1";
const PROJECT_ONLY = process.env.GDS2JS_SCRIPTC_PROJECT === "1";
const KEEP = process.env.GDS2JS_SCRIPTC_KEEP === "1";
/** case-id 子串过滤。给了它就跑全部匹配用例、不只跑代表集（tools/release.mjs 的面探针靠它
 *  点名 234-string-methods-batch）。这与 Vitest 自己的 `-t` 不同：`-t` 只过滤**已收集**的
 *  测试，挑不出代表集之外的用例。 */
const FILTER = process.env.GDS2JS_SCRIPTC_FILTER ?? "";
const JOBS = ALL || PROJECT_ONLY ? Math.min(4, cpus().length) : 1;

const WORK = join(ROOT, "tmp", "sc-gate");
/** 收尾只删本进程建过的这几份，不连锅端 `tmp/sc-gate` —— 那样会把另一个门进程正在编的替身树删掉。 */
const created: string[] = [];

/** 代表集：一族一格各一个。`246` 是「node 过、静态目标炸」那类的闸 —— 属性面按名索引只在 AOT 上暴露（S270 ④）。
 *  `266` 是它的续集：`dict_to_inst` 要的是「实例上那张按名的原值表 + 不跑 `_init` 的构造路」，两条都只有 AOT 才验得出来。
 *  `268` 不是续集而是补账：NodePath 这一族（构造 + 字面量）此前在代表集里一格都没有。
 *  `285` 是这一轮新加的：符号零那几支（`floor` / `ceil` / `round` / `clampf` / `deg_to_rad` / `fmod` / `floori`）改的是运行时函数体里的算式，
 *  其中 `round` 那一支多了一层内联箭头函数 —— 这类形状只有真编到静态目标才验得出来（S270 ④ 同一条路）。
 *  `286` 是同一轮的第二格：容器元素的 `c_escape` 改的是 `values.ts` 里 `repr` 那一句，String / StringName 两条通道的出货文本都从它出（S296）。
 *  `334` / `335` 是八面体解码与 `from_angle` 那一轮：两支都新走 `rt.vector3Const(name, [args])` / `rt.vector2Const(name, [args])` 那个带实参的静态口，
 *  函数体里是 `Math.fround` 套 `Math.abs` / `Math.cos` 的算式与一条 `Number.isFinite` 的限 —— 这类只改运行时函数体的形状，同样只有真编到静态目标才验得出来（S322 / S323）。
 *  `336` 是同族的第三格：`String.num(number, decimals)` 要从 IEEE754 位里拆 `m · 2^e`，用的是 `DataView` + `getBigUint64` + `BigInt` 的 `**` 与移位 ——
 *  scriptc 对这类内建历来有围栏（S200 那四道坑），所以这一支不真编一遍不算数。
 *  `339` 是同族的第四格：`bezier_derivative` 两支的函数体全是 `Math.fround` 套加乘减的直算式，没有一处能退回 double ——
 *  静态目标上把中间量升成 double 就等于换了舍入模型，只有真编一遍才看得出来（S329）。
 *  `340` 是同族的第五格：一轮普查把 `move_toward` / `smoothstep` / `wrapf` / `fposmod` 四支的函数体照源重写（早退支、带号比较、`is_equal_approx` 那一档），
 *  改的全是运行期函数体里的算式与判据顺序 —— 同样是只有真编到静态目标才验得出来的形状（S331）。 */
const DEFAULT_SET = [
  "001-int-division",
  "064-float-render",
  "082-array-callable",
  "124-static-func",
  "128-static-var",
  "133-callable-signal-methods",
  "155-param-defaults",
  "200-module-const-shadows-global",
  "234-string-methods-batch",
  "246-format-object-props",
  "266-dict-to-inst",
  "267-is-instance-of",
  "268-node-path-literal",
  "272-ctor-match-arms",
  "273-stack-frames",
  "274-var-to-bytes",
  "275-wire-format-shapes",
  "276-object-identity-bytes",
  "277-object-table-shapes",
  "278-var-to-str-float",
  "279-decimal-reader",
  "280-pow-precedence",
  "281-int-pow-negative",
  "282-vector-slide-bounce",
  "285-sign-zero-ops",
  "286-container-escape",
  "287-negative-ctor-arms",
  "288-bound-argument-count",
  "289-axis-index-inverse-limit",
  "290-value-arity-calls",
  "295-value-methods-batch",
  "296-move-toward-chain",
  "297-angle-and-64bit",
  "298-color-hex-blend",
  "299-bezier-cubic",
  "300-value-edge-cells",
  "301-float32-print-band",
  "302-real-param-band",
  "303-cubic-in-time",
  "314-eol-in-brackets",
  "334-vector3-octahedron-decode",
  "335-vector2-from-angle",
  "336-string-num-family",
  "339-bezier-derivative",
  "340-global-math-shapes",
  "341-global-ease",
  "342-step-decimals",
  "343-snapped-and-predicates",
  "344-zero-modulus",
  "348-global-vector-args",
  "350-color-from-rgbe9995",
  "032-preload-load",
];

/** 异步版 spawnSync：全量门要靠它把多个用例叠在一起跑。 */
interface SpResult {
  status: number;
  stdout: string;
  stderr: string;
  out: string;
}
function sp(cmd: string, cmdArgs: string[], opts: Parameters<typeof spawn>[2] = {}): Promise<SpResult> {
  return new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, { ...opts, shell: opts?.shell === true });
    let stdout = "";
    let stderr = "";
    if (child.stdout !== null) child.stdout.setEncoding("utf8").on("data", (d: string) => (stdout += d));
    if (child.stderr !== null) child.stderr.setEncoding("utf8").on("data", (d: string) => (stderr += d));
    const done = (status: number): void => resolve({ status, stdout, stderr, out: stdout + stderr });
    child.on("error", (e) => {
      stderr += String(e);
      done(-1);
    });
    child.on("close", (code) => done(code ?? -1));
  });
}

const genFile = (id: string): string => join(caseDir(id), "main.gen.mts");

/** 替身树里的 zstd 宿主：直接读真实的 zstdHost 源码，按 tree-face 清单把它那些相对说明符
 *  改写成回指仓库源（深度按替身树位置算）—— 不再有同形副本。 */
function zstdHostSource(dir: string): string {
  const rtSrc = join(ROOT, TREE_FACE.repo.runtimeSrcRoot);
  const src = readFileSync(join(rtSrc, TREE_FACE.repo.zstdHost), "utf8");
  return src.replace(/"\.\/[^"]+"/g, (spec) => {
    const target = join(rtSrc, spec.slice(3, -1));
    let rel = relative(dir, target).split("\\").join("/");
    if (!rel.startsWith(".")) rel = `./${rel}`;
    return `"${rel}"`;
  });
}

function copyTreeAll(from: string, to: string): void {
  if (!statSync(from).isDirectory()) {
    copyFileSync(from, to);
    return;
  }
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTreeAll(a, b);
    else copyFileSync(a, b);
  }
}

/** 把 vendor 里两个包铺到 `tmp/sc-gate/node_modules`（替身宿主从 tmp/sc-gate/<id>/ 往上正好找得到）。
 *  只在 beforeAll 调一次 —— 每个 zstd 用例各调一次就是对这个共享目录的无守卫并发写。 */
function ensureZstdPackages(): void {
  const from = join(ROOT, TREE_FACE.repo.runtimeSrcRoot, TREE_FACE.repo.vendorDir);
  const to = join(WORK, "node_modules");
  for (const pkg of TREE_FACE.tree.zstdPackages) {
    if (!existsSync(join(from, pkg))) {
      throw new Error(`缺 ${TREE_FACE.repo.vendorDir}/${pkg}（${TREE_FACE.repo.runtimeSrcRoot} 下）—— zstd 用例没法铺驱动包`);
    }
    copyTreeAll(join(from, pkg), join(to, pkg));
  }
}

function pickCases(): string[] {
  // 项目树用例走真 CLI 的 `export --pack scriptc`，不需要 `main.gen.mts`（那一支只发单文件产物）
  const allIds = listCases(FILTER)
    .filter((id) => (PROJECT_ONLY ? caseIsProject(id) : true))
    .filter((id) => godotOk(readGolden(id)) && (caseIsProject(id) || existsSync(genFile(id))));
  if (ALL || PROJECT_ONLY || FILTER !== "") return allIds;
  return DEFAULT_SET.filter((id) => allIds.includes(id));
}

const cases = pickCases();
// 「挑出 0 例 → 0 个 it() → 门报绿」是最坏的失败形状，所以响亮拒。
expect(cases.length, "挑出 0 个用例（golden 或 main.gen.mts 都不在？先跑 pnpm test:compile）").toBeGreaterThan(0);

function prepare(id: string): { dir: string; file: string; zstd: boolean } {
  // 与 `corpus/cases/<case>/` 同深（三级），runtime 的 import 原样保留，只把宿主那一行换成静态可用的宿主
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  const src = readFileSync(genFile(id), "utf8");
  const zstd = NEED_ZSTD_TEXT.test(src);
  const zstdSpec = `./${TREE_FACE.tree.zstdHost.replace(/\.ts$/, "")}`;
  const repoHostSpec = relative(dir, join(ROOT, TREE_FACE.repo.runtimeSrcRoot, TREE_FACE.repo.host))
    .split("\\")
    .join("/")
    .replace(/\.ts$/, "");
  const moved = src.split("../../../tools/harness/scene-tree").join(zstd ? zstdSpec : repoHostSpec);
  const file = join(dir, "main.mts");
  writeFileSync(file, moved, "utf8");
  if (zstd) writeFileSync(join(dir, TREE_FACE.tree.zstdHost), zstdHostSource(dir), "utf8");
  return { dir, file, zstd };
}

async function scBuild(file: string, dynamic: boolean): Promise<{ code: number; out: string }> {
  const a = ["build", file, "--strip"];
  if (dynamic) a.push("--dynamic");
  const r = await sp("scriptc", a, { cwd: ROOT, timeout: 600000 });
  return { code: r.status, out: r.out };
}

function exePath(dir: string): string | null {
  const p = join(dir, ".scriptc", process.platform === "win32" ? "main.exe" : "main");
  return existsSync(p) ? p : null;
}

function scNote(out: string, fallback: string): string {
  const m = out.match(/error SC\d+:[^\n]*/g) ?? [];
  if (m.length > 0) return `${m.length} 个 SC 错，首个：${m[0]!.slice(0, 120)}`;
  return `${fallback}：${out.trim().split("\n").pop()?.slice(0, 120) ?? ""}`;
}

/** 项目树用例：走用户那条命令 `export --pack scriptc`，门才同时量到「树里只有一份 runtime 源码」。 */
async function gateProject(id: string): Promise<{ built: boolean; exe: string; out: string; code: number }> {
  const dir = join(WORK, id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  const exe = join(dir, "case.exe");
  const treeDir = join(caseDir(id), ".gds2js-export");
  const r = await sp(
    "npx",
    ["tsx", "packages/gds2js/src/cli.ts", "export", caseScript(id), "--pack", "scriptc", "-o", exe, "--keep-bundle"],
    { shell: true, cwd: ROOT, timeout: 1_500_000 },
  );
  const built = existsSync(exe);
  // 无条件清，不是「编出来了才清」：编失败留下的半成品树同样不该脏 corpus
  //（.gds2js-export/ 虽已 gitignore，但会误导下一次跑）。
  if (!KEEP) rmSync(treeDir, { recursive: true, force: true });
  return { built, exe, out: r.out, code: r.status };
}

interface Row {
  id: string;
  built: boolean;
  ran: boolean;
  exact: boolean;
  note: string;
}
const rows: Row[] = [];

async function gateOne(id: string): Promise<Row> {
  const row: Row = { id, built: false, ran: false, exact: false, note: "" };
  let exe: string | null = null;
  if (caseIsProject(id)) {
    const g = await gateProject(id);
    row.built = g.built;
    exe = g.exe;
    if (!g.built) row.note = scNote(g.out, `export 退出 ${String(g.code)}`);
  } else {
    const { dir, file, zstd } = prepare(id);
    const build = await scBuild(file, zstd);
    exe = exePath(dir);
    row.built = build.code === 0 && exe !== null;
    if (!row.built) row.note = scNote(build.out, `build 退出 ${String(build.code)}`);
  }
  if (row.built && exe !== null) {
    const run = await sp(exe, [], { timeout: 30000 });
    row.ran = run.status === 0;
    if (!row.ran) {
      row.note = `exe 退出 ${String(run.status)}：${run.stderr.trim().split("\n")[0]?.slice(0, 140) ?? ""}`;
    } else {
      const got = normalize(run.out, caseScript(id));
      const golden = readGolden(id);
      row.exact = got === golden;
      if (!row.exact) {
        const g = (golden ?? "").split("\n");
        const j = got.split("\n");
        const i = g.findIndex((line, idx) => line !== j[idx]);
        row.note = `第 ${(i < 0 ? Math.min(g.length, j.length) : i) + 1} 行 godot=${JSON.stringify(g[i] ?? "<无>")} js=${JSON.stringify(j[i] ?? "<无>")}`;
      }
    }
  }
  return row;
}

/** 失败消息里区分三件不同的事：编不过 / 跑挂 / 输出不符。 */
const markOf = (r: Row): string => (r.exact ? "✓ 出货一致" : r.built ? (r.ran ? "✗ 输出不符" : "✗ 跑挂") : "✗ 编不过");

const MODE_LABEL = ALL ? "全量" : PROJECT_ONLY ? "项目树" : FILTER !== "" ? `筛选 ${FILTER}` : "代表集";
const SKIP_WHY = hasScriptc ? "" : `（跳过：${missing("scriptc")}）`;

describe.skipIf(!hasScriptc)(`scriptc 出货门 · ${cases.length} 个用例（${MODE_LABEL}，并发 ${JOBS}）${SKIP_WHY}`, () => {
  beforeAll(() => {
    mkdirSync(WORK, { recursive: true });
    ensureZstdPackages();
    const absent = DEFAULT_SET.filter((id) => !cases.includes(id));
    if (!ALL && !PROJECT_ONLY && absent.length > 0) {
      console.log(`(代表集里有 ${absent.length} 个用例这次没进：${absent.join(", ")})`);
    }
  });

  afterAll(() => {
    const built = rows.filter((r) => r.built).length;
    const ran = rows.filter((r) => r.ran).length;
    const exact = rows.filter((r) => r.exact).length;
    console.log(`\n出货 ${built}/${rows.length} 编过、${ran}/${rows.length} 跑通、逐字节一致 ${exact}/${rows.length}`);
    if (!KEEP) for (const dir of created) rmSync(dir, { recursive: true, force: true });
  });

  // 不把 it.concurrent 赋给变量再调 —— chainable API 脱开 it 调用有丢绑定的风险，显式分支更稳。
  const gate = async (id: string): Promise<void> => {
    const row = await gateOne(id);
    rows.push(row);
    if (!row.exact) expect(row.exact, `${id.padEnd(34)} ${markOf(row)}  ${row.note}`).toBe(true);
  };
  for (const id of cases) {
    if (JOBS > 1) it.concurrent(id, () => gate(id));
    else it(id, () => gate(id));
  }
});
