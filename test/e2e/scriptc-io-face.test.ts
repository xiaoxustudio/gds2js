import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, type TestContext } from "vitest";
import { hasScriptc, missing } from "../support/env";
import { ROOT } from "../support/lib-bridge";

const FIX = join(ROOT, "test", "fixtures", "scriptc-io");
const WORK = join(ROOT, "tmp", "sc-io");
const KEEP = process.env.GDS2JS_SCRIPTC_IO_KEEP === "1";
const FILTER = process.env.GDS2JS_SCRIPTC_IO_FILTER ?? "";

/** 两轨都必须逐字回这些行：读数是 node 轨现跑的，静态轨编不出就跑不出就记档。 */
const EXPECT: Record<string, string[]> = {
  fs: [
    "k|fs.exists|true",
    "k|fs.size|6",
    "k|fs.read|gds2js",
    "k|fs.bytetype|true",
    "k|fs.bytesum|6",
    "k|fs.readdir|1",
    "k|fs.gone|true",
  ],
  path: [
    "k|path.join|a/b/c.txt",
    "k|path.basename|c.txt",
    "k|path.extname|.txt",
    "k|path.dirname|a/b",
    "k|path.relative|../c",
    "k|path.resolve|true",
    "k|path.sep|true",
  ],
  os: [
    "k|os.tmpdir|true",
    "k|os.homedir|true",
    "k|os.platform|true",
    "k|os.arch|true",
    "k|os.env|true",
  ],
  regexp: [
    "k|re.test|true",
    "k|re.groups|12-345/12/345/3",
    "k|re.named|2026/10",
    "k|re.sticky|false/true",
    "k|re.dollar|30/10/2026",
    "k|re.fn|a#1b#2",
    "k|re.split|2",
    "k|re.lookbehind|true",
    "k|re.dotall|true",
    "k|re.unicode|true",
    "k|re.matchall|2",
    "k|re.invalid|throws",
  ],
  bytes: [
    "k|bytes.le|4,3,2,1",
    "k|bytes.be|67305985",
    "k|bytes.f32|true",
    "k|bytes.wrap|44",
    "k|bytes.slice|3,2",
  ],
  "bi-scalar": [
    "k|bi.add|12345678901234567891",
    "k|bi.mod|890",
    "k|bi.pow|18446744073709551616",
    "k|bi.cmp|true",
    "k|bi.and|f0",
  ],
  "bi-dataview": [
    "k|bdv.round|true",
    "k|bdv.bits|8000000000000001",
    "k|bdv.setu|true",
  ],
  "bi-typedarray": [
    "k|bta.round|true",
    "k|bta.pair|42",
    "k|bta.max|18446744073709551615",
  ],
  textcodec: [
    "k|codec.len|5",
    "k|codec.round|true",
    "k|codec.bad|true",
    "k|codec.hex|true",
  ],
};

const CELLS = Object.keys(EXPECT).filter((c) => FILTER === "" || c.startsWith(FILTER));
expect(CELLS.length, "筛选器把这组能力探针筛空了").toBeGreaterThan(0);

interface SpResult {
  status: number;
  out: string;
}

function sp(cmd: string, args: string[], opts: Parameters<typeof spawn>[2] = {}): Promise<SpResult> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { ...opts, shell: opts?.shell === true });
    let stdout = "";
    let stderr = "";
    if (child.stdout !== null) child.stdout.setEncoding("utf8").on("data", (d: string) => (stdout += d));
    if (child.stderr !== null) child.stderr.setEncoding("utf8").on("data", (d: string) => (stderr += d));
    const done = (status: number): void => resolve({ status, out: stdout + stderr });
    child.on("error", (e) => {
      stderr += String(e);
      done(-1);
    });
    child.on("close", (code) => done(code ?? -1));
  });
}

/** 行序不敏感地比对：去 \r、丢空行，逐行比。 */
function lines(text: string): string[] {
  return text.split(/\r?\n/).filter((l) => l !== "");
}

function matches(got: string, want: string[]): boolean {
  const g = lines(got);
  return g.length === want.length && g.every((l, i) => l === (want[i] as string));
}

function firstDiff(got: string, want: string[]): string {
  const g = lines(got);
  const at = g.findIndex((l, i) => l !== want[i]);
  if (at < 0) return `行数 ${String(g.length)} vs ${String(want.length)}`;
  return `第 ${String(at + 1)} 行 期望=${JSON.stringify(want[at] ?? "<无>")} 实得=${JSON.stringify(g[at] ?? "<无>")}`;
}

function scNote(out: string, fallback: string): string {
  const m = out.match(/error SC\d+:[^\n]*/g) ?? [];
  if (m.length > 0) return `${String(m.length)} 个 SC 错，首个：${(m[0] as string).slice(0, 140)}`;
  return `${fallback}：${out.trim().split(/\r?\n/).pop()?.slice(0, 140) ?? ""}`;
}

interface Row {
  cell: string;
  node: boolean;
  built: boolean;
  ran: boolean;
  exact: boolean;
  booked: string | null;
  note: string;
}

const rows: Row[] = [];
const created: string[] = [];

async function nodeRow(cell: string): Promise<{ ok: boolean; note: string }> {
  const r = await sp(process.execPath, [join(FIX, `${cell}.mts`)], { cwd: FIX, timeout: 60000 });
  if (r.status !== 0) return { ok: false, note: `node 退出 ${String(r.status)}：${r.out.trim().split(/\r?\n/)[0]?.slice(0, 140) ?? ""}` };
  return matches(r.out, EXPECT[cell] as string[])
    ? { ok: true, note: "" }
    : { ok: false, note: firstDiff(r.out, EXPECT[cell] as string[]) };
}

async function scriptcRow(cell: string): Promise<Omit<Row, "cell" | "node">> {
  const dir = join(WORK, cell);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  created.push(dir);
  const file = join(dir, "main.mts");
  copyFileSync(join(FIX, `${cell}.mts`), file);
  const build = await sp("scriptc", ["build", "main.mts", "--strip"], { cwd: dir, timeout: 600000 });
  const exe = join(dir, process.platform === "win32" ? ".scriptc/main.exe" : ".scriptc/main");
  const built = build.status === 0 && existsSync(exe);
  if (!built) {
    const gap = /Unknown|not supported|no lowering|binding form|Cannot find module|is not a function/i.test(build.out);
    return {
      built,
      ran: false,
      exact: false,
      booked: gap ? `工具链没这能力（编不过）：${scNote(build.out, `build 退出 ${String(build.status)}`)}` : null,
      note: gap ? "" : scNote(build.out, `build 退出 ${String(build.status)}`),
    };
  }
  const run = await sp(exe, [], { cwd: dir, timeout: 60000 });
  if (run.status !== 0) {
    return { built, ran: false, exact: false, booked: null, note: `exe 退出 ${String(run.status)}：${run.out.trim().split(/\r?\n/)[0]?.slice(0, 140) ?? ""}` };
  }
  const want = EXPECT[cell] as string[];
  return {
    built,
    ran: true,
    exact: matches(run.out, want),
    booked: null,
    note: matches(run.out, want) ? "" : firstDiff(run.out, want),
  };
}

describe(`scriptc 宿主能力探针 · ${String(CELLS.length)} 格`, () => {
  beforeAll(() => {
    mkdirSync(WORK, { recursive: true });
    if (!existsSync(join(FIX, `${CELLS[0] as string}.mts`))) throw new Error(`缺夹具目录 ${FIX}`);
  });

  afterAll(() => {
    const nodeOk = rows.filter((r) => r.node).length;
    const built = rows.filter((r) => r.built).length;
    const exact = rows.filter((r) => r.exact).length;
    const booked = rows.filter((r) => r.booked !== null).length;
    console.log(`\nD10 读数表（scriptc ${hasScriptc ? "在册" : `缺席：${missing("scriptc")}`}）`);
    for (const r of rows) {
      const staticTrack = r.booked !== null ? `记账（${r.booked}）` : r.exact ? "逐字节一致" : r.built ? (r.ran ? "✗ 输出不符" : "✗ 跑挂") : "✗ 编不过";
      console.log(`  ${(r.cell as string).padEnd(10)} node ${r.node ? "✓" : "✗ " + r.note} | 静态轨 ${staticTrack}${r.note === "" || r.booked !== null ? "" : ` —— ${r.note}`}`);
    }
    console.log(`合计：node 轨 ${String(nodeOk)}/${String(rows.length)}、静态轨编过 ${String(built)}/${String(rows.length)}、逐字节一致 ${String(exact)}/${String(rows.length)}、工具链记账 ${String(booked)}/${String(rows.length)}`);
    console.log(`D10 判定口径：某格静态轨编不过/跑不出 = 那一支宿主能力不能进原生产物，运行时必须抛 io-host-missing；一致 = 可以按 node 轨同一形状落地。读数写进提交正文，不许口头承诺。`);
    if (!KEEP) for (const dir of created) rmSync(dir, { recursive: true, force: true });
  });

  for (const cell of CELLS) {
    it(cell, async (ctx: TestContext) => {
      const row: Row = { cell, node: false, built: false, ran: false, exact: false, booked: null, note: "" };
      const n = await nodeRow(cell);
      row.node = n.ok;
      row.note = n.note;
      if (hasScriptc) {
        const s = await scriptcRow(cell);
        row.built = s.built;
        row.ran = s.ran;
        row.exact = s.exact;
        row.booked = s.booked;
        if (s.note !== "") row.note = s.note;
      } else {
        row.booked = `静态轨未测：${missing("scriptc")}`;
      }
      rows.push(row);
      expect(row.node, `${cell}：node 轨读数与登记的字面量不符 —— ${row.note}`).toBe(true);
      if (!row.exact && row.booked === null) {
        expect(row.exact, `${cell}：静态轨输出不符 —— ${row.note}`).toBe(true);
      }
      if (!row.built && row.booked === null && hasScriptc) {
        expect(row.built, `${cell}：静态轨编不过且不像工具链缺口 —— ${row.note}`).toBe(true);
      }
      if (row.booked !== null) {
        ctx.skip(true, `静态轨这一支未作数：${row.booked}`);
      }
    });
  }
});

/** 夹具本身也得在册可读：漏一格字面量就红。 */
it("夹具与读数表一一对上", () => {
  for (const cell of CELLS) {
    const src = readFileSync(join(FIX, `${cell}.mts`), "utf8");
    const printed = src.match(/console\.log\("k\|/g) ?? [];
    expect(printed.length, `${cell}：夹具的 print 行数与登记的字面量条数不一致`).toBe(EXPECT[cell]?.length);
  }
});
