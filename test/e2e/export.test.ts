/**
 * `gds2js export` 的出货门（SEA node exe + scriptc exe）。只出 Windows 产物，
 * 所以非 Windows 整支 skip。三态映射与 crash 算红的理由见 test/support/verdict.ts。
 *
 * 结构上的取舍：所有昂贵动作（runExport / 跑 exe）都在 beforeAll 里按固定顺序跑完、
 * 把每格判定记进 results；然后按**静态格子清单**一格一个 it() 去认领自己的判定。
 * 之所以要静态清单：Vitest 先收集测试再跑钩子，没法用 beforeAll 的结果动态生成 it()。
 * 这样同时拿到三样东西 —— 精确的 `汇总：ok X / 上游或环境记账 Y / FAIL Z` 读数、
 * 每格独立的 pass/skip/fail、以及 `-t "scriptc/nested"` 这种单格重跑。
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, it, type TestContext } from "vitest";
import { hasDist, isWindows, missing, SEA_MIN_NODE, seaCapableNode } from "../support/env";
import { ROOT } from "../support/lib-bridge";
import { newTally, settle, summaryLine, verdictOf, type Tally, type Verdict } from "../support/verdict";

const TMP = join(ROOT, "tmp", "export-check");
const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");
const WORK = join(ROOT, "examples", "multi", ".gds2js-export");
const MULTI = join(ROOT, "examples", "multi", "main.gd");
const MULTI_ROOT = join(ROOT, "examples", "multi");
const MULTI_WANT = "7\ntrue\nshape-7\nhi bob\ntrue\nhi zed\n";

interface Result {
  cell: string;
  v: Verdict;
  note: string;
}
const results: Result[] = [];
const tally: Tally = newTally();

function record(cell: string, v: Verdict, note: string): void {
  results.push({ cell, v, note });
}

/** 静态格子清单：beforeAll 会走到的全部 record() 落点（含 checkExe 合成的 /清理 子格）。
 *  没走到的（上游 refused 或提前失败）会在 it() 里被认成 skip，不会假绿。 */
const CELLS = [
  "node/出货",
  "node/出货/清理",
  "node/抛错形状",
  "node/抛错形状/清理",
  "node/版本门禁",
  "node/nested",
  "node/nested/清理",
  "node/nested/子目录清理",
  "scriptc/nested",
  "scriptc/nested/清理",
  "scriptc/nested/子目录清理",
  "node/散装单文件",
  "node/散装单文件/清理",
  "scriptc/散装单文件",
  "scriptc/散装单文件/清理",
  "--pack scriptc",
  "--pack scriptc/清理",
  "默认 pack",
  "默认 pack/清理",
];

function nodeVerOf(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  return r.error !== undefined || r.status !== 0 ? null : (r.stdout || "").trim() || null;
}

function runExport(args: string[], env: NodeJS.ProcessEnv): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [CLI, "export", ...args], {
    cwd: ROOT,
    encoding: "utf8",
    windowsHide: true,
    timeout: 1_500_000,
    env: { ...process.env, ...env },
  });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

/** 打出 exe 并跑一遍，把结果拆成主格 + `/清理` 子格记进 results。 */
function checkExe(cell: string, exe: string, want: string | null, work = WORK): void {
  if (!existsSync(exe)) return record(cell, "FAIL", `退出码 0 但没有 ${exe}`);
  const run = spawnSync(exe, [], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (want === null) {
    // boom 工程：运行期就该抛，退了 0 说明错误上报丢了；退了非 0 但 stderr 空也说明丢了。
    if (run.status === 0) return record(cell, "FAIL", "运行期抛错却退了 0（错误上报丢了）");
    if ((run.stderr || "").trim() === "") return record(cell, "FAIL", `退了 ${run.status} 但 stderr 没任何报错`);
    return record(cell, "ok", `退出码 ${run.status}`);
  }
  if (run.stdout !== want) {
    return record(
      cell,
      "FAIL",
      `输出不符 code=${run.status}\n    got=${JSON.stringify(run.stdout.slice(0, 160))}\n    exp=${JSON.stringify(want)}`,
    );
  }
  if ((run.stderr || "").length > 0) {
    return record(cell, "FAIL", `输出对但 stderr 不干净：${JSON.stringify(run.stderr.slice(0, 120))}`);
  }
  record(cell, "ok", "stdout 逐字节一致、退出码 0、stderr 干净");
  if (existsSync(work)) record(`${cell}/清理`, "FAIL", `中间工作目录没清：${work}`);
  else record(`${cell}/清理`, "ok", "");
}

function boomProject(): string {
  const proj = join(TMP, "boom");
  mkdirSync(proj, { recursive: true });
  writeFileSync(join(proj, "project.godot"), '[application]\nconfig/name="boom"\n', "utf8");
  writeFileSync(
    join(proj, "main.gd"),
    "extends SceneTree\n\nfunc _initialize():\n\tvar z = 0\n\tprint(100 / z)\n\tquit()\n",
    "utf8",
  );
  return proj;
}

function looseScript(): { file: string; want: string } {
  const file = join(TMP, "loose.gd");
  writeFileSync(
    file,
    'extends SceneTree\n\nfunc _initialize():\n\tprint("散装脚本")\n\tprint(2 ** 10)\n\tquit()\n',
    "utf8",
  );
  return { file, want: "散装脚本\n1024\n" };
}

function nestedProject(): { root: string; entry: string; want: string } {
  const root = join(TMP, "nested");
  mkdirSync(join(root, "game", "ui"), { recursive: true });
  writeFileSync(join(root, "project.godot"), '[application]\nconfig/name="nested"\n', "utf8");
  writeFileSync(
    join(root, "game", "ui", "label.gd"),
    'class_name Fancy\n\nvar text: String = ""\n\nfunc render() -> String:\n\treturn "[" + text + "]"\n',
    "utf8",
  );
  writeFileSync(
    join(root, "game", "main.gd"),
    "extends SceneTree\n\nfunc _initialize():\n\tvar f := Fancy.new()\n\tf.text = \"hi\"\n\tprint(f.render())\n\tprint(5 / 2)\n\tquit()\n",
    "utf8",
  );
  return { root, entry: join(root, "game", "main.gd"), want: "[hi]\n2\n" };
}

const TAIL = (out: string, n: number): string => out.split(/\r?\n/).slice(-n).join("\n");

const ready = isWindows && hasDist;
const SKIP_WHY = ready
  ? ""
  : `（跳过：${missing(...[!isWindows ? `Windows 平台（当前 ${process.platform}）` : null, !hasDist ? "packages/gds2js/dist/cli.mjs（先跑 pnpm build）" : null].filter((x): x is string => x !== null))}）`;

describe.skipIf(!ready)(`gds2js export 出货门${SKIP_WHY}`, () => {
  beforeAll(() => {
    rmSync(TMP, { recursive: true, force: true });
    mkdirSync(TMP, { recursive: true });

    const selfV = nodeVerOf(process.execPath) ?? "0.0.0";
    const seaCapable = seaCapableNode();

    // A node/出货（官方一步式 --build-sea）
    if (seaCapable === null) {
      record("node/出货", "refused", `本机没有 Node >= ${SEA_MIN_NODE}（用 GDS2JS_NODE_BIN 指一个）`);
    } else {
      const exe = join(TMP, "node-app.exe");
      const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "node", "--node", seaCapable], {});
      const v = verdictOf(r.out);
      if (r.code !== 0) record("node/出货", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${TAIL(r.out, 6)}`);
      else {
        checkExe("node/出货", exe, MULTI_WANT);
        const boom = boomProject();
        const rb = runExport(
          [join(boom, "main.gd"), "--res-root", boom, "-o", join(TMP, "node-boom.exe"), "--pack", "node", "--node", seaCapable],
          {},
        );
        if (rb.code !== 0) record("node/抛错形状", verdictOf(rb.out)?.v ?? "FAIL", "导出抛错工程时退出码非 0");
        else checkExe("node/抛错形状", join(TMP, "node-boom.exe"), null);
      }
    }

    // B node/版本门禁（SEA 节点不够新时该响，并给出重跑命令）
    // 反向逻辑逐字保留：**当前 node 已够新时这一格记 refused** —— 没有更旧的当对照物，
    // 那就诚实地说「测不了」，而不是硬凑一个 pass。
    const atLeast = (v: string, min: string): boolean => {
      const a = v.replace(/^v/, "").split(".").map(Number);
      const b = min.split(".").map(Number);
      for (let i = 0; i < 3; i++) {
        if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
        if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
      }
      return true;
    };
    if (atLeast(selfV, SEA_MIN_NODE)) {
      record("node/版本门禁", "refused", `当前 node v${selfV} 已够新，没有更旧的当对照物`);
    } else {
      const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "old.exe"), "--pack", "node"], {
        GDS2JS_NODE_BIN: process.execPath,
      });
      const v = verdictOf(r.out);
      if (r.code === 0) record("node/版本门禁", "FAIL", `旧 node（v${selfV}）本该拒绝，却退了 0`);
      else if (v?.v !== "refused") record("node/版本门禁", "FAIL", `拒了但没打分类标记：${v?.note ?? r.out.slice(0, 120)}`);
      else if (!/换够新的 node 重跑/.test(r.out)) record("node/版本门禁", "FAIL", "拒绝却没给出重跑命令");
      else record("node/版本门禁", "ok", `v${selfV} 上响亮拒绝 + 给出重跑命令`);
    }

    // E 嵌套目录工程（入口在子目录，两支都真打真跑）
    {
      const nested = nestedProject();
      const cells: Array<{ name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean }> = [
        { name: "node/nested", args: seaCapable !== null ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true },
        { name: "scriptc/nested", args: ["--pack", "scriptc"], env: {}, needSea: false },
      ];
      for (const c of cells) {
        if (c.needSea && seaCapable === null) {
          record(c.name, "refused", `本机没有 Node >= ${SEA_MIN_NODE}`);
          continue;
        }
        const exe = join(TMP, `${c.name.replace("/", "-")}.exe`);
        const r = runExport([nested.entry, "--res-root", nested.root, "-o", exe, ...c.args], c.env);
        const v = verdictOf(r.out);
        if (r.code !== 0) record(c.name, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${TAIL(r.out, 6)}`);
        else {
          checkExe(c.name, exe, nested.want, join(nested.root, ".gds2js-export"));
          const work = join(nested.root, ".gds2js-export");
          if (existsSync(work)) record(`${c.name}/子目录清理`, "FAIL", `没清干净：${work}`);
          else record(`${c.name}/子目录清理`, "ok", "空目录自底向上收掉了");
        }
      }
    }

    // G 散装单文件（入口不在任何工程里）：两支都该照 build/run 的边界打得出 exe
    {
      const loose = looseScript();
      const cells: Array<{ label: string; name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean }> = [
        { label: "node/散装单文件", name: "node-loose", args: seaCapable !== null ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true },
        { label: "scriptc/散装单文件", name: "scriptc-loose", args: ["--pack", "scriptc"], env: {}, needSea: false },
      ];
      for (const c of cells) {
        if (c.needSea && seaCapable === null) {
          record(c.label, "refused", `本机没有 Node >= ${SEA_MIN_NODE}`);
          continue;
        }
        const exe = join(TMP, `${c.name}.exe`);
        const r = runExport([loose.file, "-o", exe, ...c.args], c.env);
        const v = verdictOf(r.out);
        if (/本身不是 Godot 工程/.test(r.out)) record(c.label, "FAIL", "散装单文件又被嵌套工程守卫拦住了");
        else if (r.code !== 0) record(c.label, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${TAIL(r.out, 6)}`);
        else checkExe(c.label, exe, loose.want, join(TMP, ".gds2js-export"));
      }
    }

    // H --pack scriptc：项目树也出货（examples/multi 多模块，整棵树只共享一份 runtime 源码）
    {
      const exe = join(TMP, "s.exe");
      const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "scriptc"], {});
      const v = verdictOf(r.out);
      if (r.code !== 0) record("--pack scriptc", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${TAIL(r.out, 6)}`);
      else checkExe("--pack scriptc", exe, MULTI_WANT);
    }

    // I 不带 --pack 的默认值必须落在 scriptc 那一支（翻默认值这件事得有人守着）
    {
      const exe = join(TMP, "default.exe");
      const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--verbose"], {});
      const v = verdictOf(r.out);
      if (r.code !== 0) record("默认 pack", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${TAIL(r.out, 6)}`);
      else if (!/scriptc ← /.test(r.out)) {
        record("默认 pack", "FAIL", `-v 里没有 scriptc 的定位行，说明默认值不是 scriptc：\n${TAIL(r.out, 4)}`);
      } else checkExe("默认 pack", exe, MULTI_WANT);
    }
  });

  afterAll(() => {
    rmSync(TMP, { recursive: true, force: true });
    rmSync(WORK, { recursive: true, force: true });
    console.log(`\n${summaryLine(tally)}`);
    if (!results.some((x) => x.cell === "node/出货" && x.v === "ok")) {
      console.log(`注意：node 那一支本轮没打出可用 exe（缺 Node>=${SEA_MIN_NODE}），逐字节对 golden 的结论来自手工实测。`);
    }
  });

  for (const cell of CELLS) {
    it(cell, (ctx: TestContext) => {
      const hit = results.find((r) => r.cell === cell);
      // 本轮没记到这一格：上游 refused 或提前失败了。记成 skip 而不是 pass —— 假绿最坏。
      if (hit === undefined) {
        ctx.skip(true, "本轮没走到这一格（上游 refused 或提前失败）");
        return;
      }
      settle(cell, hit.v, hit.note, ctx, tally);
    });
  }
});
