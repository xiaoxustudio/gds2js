import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, "tmp", "export-check");
const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");
const WORK = join(ROOT, "examples", "multi", ".gds2js-export");
const SEA_MIN_NODE = "25.7.0";
const MULTI = join(ROOT, "examples", "multi", "main.gd");
const MULTI_ROOT = join(ROOT, "examples", "multi");
const MULTI_WANT = "7\ntrue\nshape-7\nhi bob\ntrue\nhi zed\n";

type Verdict = "ok" | "refused" | "no-lib" | "crash" | "FAIL";
const results: Array<{ cell: string; v: Verdict; note: string }> = [];

function record(cell: string, v: Verdict, note: string): void {
  results.push({ cell, v, note });
  const tag = v === "FAIL" ? "✗ FAIL" : v === "ok" ? "✓ ok" : `- ${v.toUpperCase()}`;
  console.log(`  ${tag}  ${cell}${note ? `：${note}` : ""}`);
}

function nodeVer(bin: string): string | null {
  const r = spawnSync(bin, ["-p", "process.versions.node"], { encoding: "utf8", windowsHide: true, timeout: 60_000 });
  return r.error || r.status !== 0 ? null : (r.stdout || "").trim() || null;
}
function atLeast(v: string, min: string): boolean {
  const a = v.replace(/^v/, "").split(".").map(Number);
  const b = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) > (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) < (b[i] ?? 0)) return false;
  }
  return true;
}

/** 从 stdout+stderr 里认我们自己的分类标记。 */
function verdictOf(out: string): { v: Verdict; note: string } | null {
  const m = /gds2js-export\[([\w-]+)\]\s*(.*)/.exec(out);
  if (!m) return null;
  const raw = m[1]!;
  const note = m[2] ?? "";
  if (raw === "failed") return { v: "FAIL", note };
  if (raw === "refused" || raw === "no-lib" || raw === "crash") return { v: raw, note };
  return { v: "FAIL", note: `认不出的分类 ${raw}` };
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

function checkExe(cell: string, exe: string, want: string | null, work = WORK): void {
  if (!existsSync(exe)) return record(cell, "FAIL", `退出码 0 但没有 ${exe}`);
  const run = spawnSync(exe, [], { encoding: "utf8", windowsHide: true, timeout: 120_000 });
  if (want === null) {
    if (run.status === 0) return record(cell, "FAIL", "运行期抛错却退了 0（错误上报丢了）");
    if ((run.stderr || "").trim() === "") return record(cell, "FAIL", `退了 ${run.status} 但 stderr 没任何报错`);
    return record(cell, "ok", `退出码 ${run.status}`);
  }
  if (run.stdout !== want) {
    return record(cell, "FAIL", `输出不符 code=${run.status}\n    got=${JSON.stringify(run.stdout.slice(0, 160))}\n    exp=${JSON.stringify(want)}`);
  }
  if ((run.stderr || "").length > 0) return record(cell, "FAIL", `输出对但 stderr 不干净：${JSON.stringify(run.stderr.slice(0, 120))}`);
  record(cell, "ok", "stdout 逐字节一致、退出码 0、stderr 干净");
  if (existsSync(work)) record(`${cell}/清理`, "FAIL", `中间工作目录没清：${work}`);
  else record(`${cell}/清理`, "ok", "");
}

function boomProject(): string {
  const proj = join(TMP, "boom");
  mkdirSync(proj, { recursive: true });
  writeFileSync(join(proj, "project.godot"), '[application]\nconfig/name="boom"\n', "utf8");
  writeFileSync(join(proj, "main.gd"), "extends SceneTree\n\nfunc _initialize():\n\tvar z = 0\n\tprint(100 / z)\n\tquit()\n", "utf8");
  return proj;
}

function looseScript(): { file: string; want: string } {
  const file = join(TMP, "loose.gd");
  writeFileSync(file, 'extends SceneTree\n\nfunc _initialize():\n\tprint("散装脚本")\n\tprint(2 ** 10)\n\tquit()\n', "utf8");
  return { file, want: "散装脚本\n1024\n" };
}

function nestedProject(): { root: string; entry: string; want: string } {
  const root = join(TMP, "nested");
  mkdirSync(join(root, "game", "ui"), { recursive: true });
  writeFileSync(join(root, "project.godot"), '[application]\nconfig/name="nested"\n', "utf8");
  writeFileSync(join(root, "game", "ui", "label.gd"), "class_name Fancy\n\nvar text: String = \"\"\n\nfunc render() -> String:\n\treturn \"[\" + text + \"]\"\n", "utf8");
  writeFileSync(join(root, "game", "main.gd"), "extends SceneTree\n\nfunc _initialize():\n\tvar f := Fancy.new()\n\tf.text = \"hi\"\n\tprint(f.render())\n\tprint(5 / 2)\n\tquit()\n", "utf8");
  return { root, entry: join(root, "game", "main.gd"), want: "[hi]\n2\n" };
}

function main(): void {
  if (process.platform !== "win32") {
    console.log(`- SKIP 只出 Windows 产物，当前平台 ${process.platform}`);
    return;
  }
  if (!existsSync(CLI)) {
    console.error(`找不到 ${CLI} —— 先跑 pnpm build。`);
    process.exit(1);
  }
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  const selfV = nodeVer(process.execPath) ?? "0.0.0";
  const envBin = process.env.GDS2JS_NODE_BIN;
  const seaCapable = envBin && atLeast(nodeVer(envBin) ?? "0", SEA_MIN_NODE) ? envBin : atLeast(selfV, SEA_MIN_NODE) ? process.execPath : null;

  console.log("A node/出货（官方一步式 --build-sea）");
  if (!seaCapable) {
    record("node/出货", "refused", `本机没有 Node >= ${SEA_MIN_NODE}（用 GDS2JS_NODE_BIN 指一个）`);
  } else {
    const exe = join(TMP, "node-app.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "node", "--node", seaCapable], {});
    const v = verdictOf(r.out);
    if (r.code !== 0) record("node/出货", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
    else {
      checkExe("node/出货", exe, MULTI_WANT);
      const boom = boomProject();
      const rb = runExport([join(boom, "main.gd"), "--res-root", boom, "-o", join(TMP, "node-boom.exe"), "--pack", "node", "--node", seaCapable], {});
      if (rb.code !== 0) record("node/抛错形状", verdictOf(rb.out)?.v ?? "FAIL", "导出抛错工程时退出码非 0");
      else checkExe("node/抛错形状", join(TMP, "node-boom.exe"), null);
    }
  }

  console.log("B node/版本门禁（SEA 节点不够新时该响，并给出重跑命令）");
  if (atLeast(selfV, SEA_MIN_NODE)) record("node/版本门禁", "refused", `当前 node v${selfV} 已够新，没有更旧的当对照物`);
  else {
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "old.exe"), "--pack", "node"], { GDS2JS_NODE_BIN: process.execPath });
    const v = verdictOf(r.out);
    if (r.code === 0) record("node/版本门禁", "FAIL", `旧 node（v${selfV}）本该拒绝，却退了 0`);
    else if (v?.v !== "refused") record("node/版本门禁", "FAIL", `拒了但没打分类标记：${v?.note ?? r.out.slice(0, 120)}`);
    else if (!/换够新的 node 重跑/.test(r.out)) record("node/版本门禁", "FAIL", "拒绝却没给出重跑命令");
    else record("node/版本门禁", "ok", `v${selfV} 上响亮拒绝 + 给出重跑命令`);
  }

  console.log("E 嵌套目录工程（入口在子目录，两支都真打真跑）");
  {
    const nested = nestedProject();
    const cells: Array<{ name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean }> = [
      { name: "node/nested", args: seaCapable ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true },
      { name: "scriptc/nested", args: ["--pack", "scriptc"], env: {}, needSea: false },
    ];
    for (const c of cells) {
      if (c.needSea && !seaCapable) {
        record(c.name, "refused", `本机没有 Node >= ${SEA_MIN_NODE}`);
        continue;
      }
      const exe = join(TMP, `${c.name.replace("/", "-")}.exe`);
      const r = runExport([nested.entry, "--res-root", nested.root, "-o", exe, ...c.args], c.env);
      const v = verdictOf(r.out);
      if (r.code !== 0) record(c.name, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
      else {
        checkExe(c.name, exe, nested.want, join(nested.root, ".gds2js-export"));
        const work = join(nested.root, ".gds2js-export");
        if (existsSync(work)) record(`${c.name}/子目录清理`, "FAIL", `没清干净：${work}`);
        else record(`${c.name}/子目录清理`, "ok", "空目录自底向上收掉了");
      }
    }
  }

  console.log("G 散装单文件（入口不在任何工程里）：两支都该照 build/run 的边界打得出 exe");
  {
    const loose = looseScript();
    const cells: Array<{ label: string; name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean }> = [
      { label: "node/散装单文件", name: "node-loose", args: seaCapable ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true },
      { label: "scriptc/散装单文件", name: "scriptc-loose", args: ["--pack", "scriptc"], env: {}, needSea: false },
    ];
    for (const c of cells) {
      if (c.needSea && !seaCapable) {
        record(c.label, "refused", `本机没有 Node >= ${SEA_MIN_NODE}`);
        continue;
      }
      const exe = join(TMP, `${c.name}.exe`);
      const r = runExport([loose.file, "-o", exe, ...c.args], c.env);
      const v = verdictOf(r.out);
      if (/本身不是 Godot 工程/.test(r.out)) record(c.label, "FAIL", "散装单文件又被嵌套工程守卫拦住了");
      else if (r.code !== 0) record(c.label, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
      else checkExe(c.label, exe, loose.want, join(TMP, ".gds2js-export"));
    }
  }

  console.log("H --pack scriptc：项目树也出货（examples/multi 多模块，整棵树只共享一份 runtime 源码）");
  {
    const exe = join(TMP, "s.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "scriptc"], {});
    const v = verdictOf(r.out);
    if (r.code !== 0) {
      record("--pack scriptc", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
    } else checkExe("--pack scriptc", exe, MULTI_WANT);
  }

  console.log("I 不带 --pack 的默认值必须落在 scriptc 那一支（翻默认值这件事得有人守着）");
  {
    const exe = join(TMP, "default.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--verbose"], {});
    const v = verdictOf(r.out);
    if (r.code !== 0) record("默认 pack", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
    else if (!/scriptc ← /.test(r.out))
      record("默认 pack", "FAIL", `-v 里没有 scriptc 的定位行，说明默认值不是 scriptc：\n${r.out.split(/\r?\n/).slice(-4).join("\n")}`);
    else checkExe("默认 pack", exe, MULTI_WANT);
  }

  rmSync(TMP, { recursive: true, force: true });
  rmSync(WORK, { recursive: true, force: true });
  const failed = results.filter((x) => x.v === "FAIL");
  const okc = results.filter((x) => x.v === "ok").length;
  console.log(`\n汇总：ok ${okc} / 上游或环境记账 ${results.length - okc - failed.length} / FAIL ${failed.length}`);
  if (!results.some((x) => x.cell === "node/出货" && x.v === "ok")) {
    console.log("注意：node 那一支本轮没打出可用 exe（缺 Node>=25.7），逐字节对 golden 的结论来自手工实测。");
  }
  if (failed.length > 0) process.exit(1);
}

main();
