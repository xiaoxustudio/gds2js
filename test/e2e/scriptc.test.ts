import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it, type TestContext } from "vitest";
import { TREE_FACE } from "@gds2js/runtime/tree-face";
import { hasScriptc, missing } from "../support/env";
import { caseDir, caseIsProject, caseScript, godotOk, listCases, normalize, readGolden, ROOT } from "../support/lib-bridge";
import { NEED_ZSTD_TEXT } from "../support/pack-codec";

const ALL = process.env.GDS2JS_SCRIPTC_ALL === "1";
const PROJECT_ONLY = process.env.GDS2JS_SCRIPTC_PROJECT === "1";
const KEEP = process.env.GDS2JS_SCRIPTC_KEEP === "1";
const FILTER = process.env.GDS2JS_SCRIPTC_FILTER ?? "";
const JOBS = ALL || PROJECT_ONLY ? Math.min(4, cpus().length) : 1;

const WORK = join(ROOT, "tmp", "sc-gate");
const created: string[] = [];

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
  const allIds = listCases(FILTER)
    .filter((id) => (PROJECT_ONLY ? caseIsProject(id) : true))
    .filter((id) => godotOk(readGolden(id)) && (caseIsProject(id) || existsSync(genFile(id))));
  if (ALL || PROJECT_ONLY || FILTER !== "") return allIds;
  return DEFAULT_SET.filter((id) => allIds.includes(id));
}

const cases = pickCases();
expect(cases.length, "挑出 0 个用例（golden 或 main.gen.mts 都不在？先跑 pnpm test:compile）").toBeGreaterThan(0);

function prepare(id: string): { dir: string; file: string; zstd: boolean } {
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

async function scBuild(file: string): Promise<{ code: number; out: string }> {
  const a = ["build", file, "--strip"];
  let last = await sp("scriptc", a, { cwd: ROOT, timeout: 600000 });
  for (let retry = 0; retry < 2 && (last.status === null || last.status < 0); retry++) {
    last = await sp("scriptc", a, { cwd: ROOT, timeout: 600000 });
  }
  return { code: last.status ?? -1, out: last.out };
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
  if (!KEEP) rmSync(treeDir, { recursive: true, force: true });
  return { built, exe, out: r.out, code: r.status };
}

interface Row {
  id: string;
  built: boolean;
  ran: boolean;
  exact: boolean;
  note: string;
  booked: string | null;
}
const rows: Row[] = [];

const islandGone = (text: string): boolean =>
  /Unknown option '--dynamic'|SC2013|binding form with no lowering|method calls like/.test(text);

const staticAccessorGone = (text: string): boolean => /static accessors and initializer-less/.test(text);

async function gateOne(id: string): Promise<Row> {
  const row: Row = { id, built: false, ran: false, exact: false, note: "", booked: null };
  let exe: string | null = null;
  if (caseIsProject(id)) {
    const g = await gateProject(id);
    row.built = g.built;
    exe = g.exe;
    if (!g.built) row.note = scNote(g.out, `export 退出 ${String(g.code)}`);
  } else {
    const { dir, file, zstd } = prepare(id);
    const build = await scBuild(file);
    exe = exePath(dir);
    row.built = build.code === 0 && exe !== null;
    if (!row.built) row.note = scNote(build.out, `build 退出 ${String(build.code)}`);
    if (!row.built && zstd && islandGone(build.out)) {
      row.booked = "静态目标没有岛档：这页用 mode 2（vendored 那份 asm zstd 绑定），出货走 --pack node";
      return row;
    }
    if (!row.built && staticAccessorGone(build.out)) {
      row.booked = "静态目标没有静态访问器：这页有 static var 配读写器，出货走 --pack node";
      return row;
    }
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

/** 失败消息里区分三件不同的事：编不过 / 跑挂 / 输出不符；工具链没这能力那一族另说。 */
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
    const booked = rows.filter((r) => r.booked !== null).length;
    console.log(`\n出货 ${built}/${rows.length} 编过、${ran}/${rows.length} 跑通、逐字节一致 ${exact}/${rows.length}` + (booked > 0 ? `、工具链记账 ${booked}/${rows.length}` : ""));
    if (!KEEP) for (const dir of created) rmSync(dir, { recursive: true, force: true });
  });

  const gate = async (id: string, ctx: TestContext): Promise<void> => {
    const row = await gateOne(id);
    rows.push(row);
    if (row.booked !== null) {
      ctx.skip(true, `${id}：${row.booked}`);
      return;
    }
    if (!row.exact) expect(row.exact, `${id.padEnd(34)} ${markOf(row)}  ${row.note}`).toBe(true);
  };
  for (const id of cases) {
    if (JOBS > 1) it.concurrent(id, (ctx) => gate(id, ctx));
    else it(id, (ctx) => gate(id, ctx));
  }
});
