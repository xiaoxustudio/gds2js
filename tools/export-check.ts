/**
 * export 回归自检（tools）—— `pnpm test:export`
 * 两支打包器各跑真流程，并把「当前卡在哪」如实分类；分类只认 CLI 自己吐的
 * `gds2js-export[<verdict>]` 标记，不 scrape 上游自由文本（上一轮被 scriptc 的
 * `@override` 措辞骗出过假红灯，教训记在 ROADMAP 5.8）。
 *
 *   ok        打出 exe 且跑起来 stdout 逐字节等于期望
 *   refused   版本/二进制/GC 模式门禁（含 --pack node 在旧 node 上该响的那一声）
 *   no-lib    perry 拿不到链接用的 perry_runtime.lib（我们本来会解压包里那颗 zst，见 src/perry.ts）
 *   crash     perry 访问违例（RS4GC + Windows try/catch，上游 #7354）
 *   FAIL      以上都不是 —— 真回归，红灯
 *
 * 格子：
 *   A node/出货            需要 SEA-capable 的 node（GDS2JS_NODE_BIN 或当前 node ≥25.7）；
 *                          成了就再跑一遍「运行期抛错必须非 0」那套
 *   B node/版本门禁        当前 node < 25.7 时必须响亮拒绝并给出重跑命令
 *   C perry/默认GC         未设 PERRY_RS4GC：CLI 自己注入 `PERRY_RS4GC=0` 并**说出来**，出货 + 逐字节对
 *   D perry/显式RS4GC=0    显式设过就原样传（日志必须写"你显式设的"，不能把用户的值改成默认口径）
 *   E 嵌套目录工程         入口在 `res://game/` 而不是工程根：两支各真打一个 exe、逐字节对，
 *                          并钉住「VFS 资产 key 相对 main 目录」与「中间工作目录清干净」这两条
 *   F perry 非 ASCII 输出路径 实测 perry 链接失败**却退 0**、只留一句 "Linking failed"：
 *                          必须翻成可行动的拒绝（中文 exe 名是常态，不能甩一句「未归类」）
 *   G 散装单文件            入口不在任何工程里（`export 单文件.gd -o app.exe`）：两支都得真打出
 *                          能跑的 exe，且**不许**被「隐式根里嵌着别的工程」那条守卫拦住
 *   H --pack scriptc       必须被拒（这一支已按实测撤掉，别再悄悄回来）
 *
 * 除 FAIL 外一律记账不红灯。跑：node_modules/.bin/tsx tools/export-check.ts
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TMP = join(ROOT, "tmp", "export-check");
const CLI = join(ROOT, "dist", "cli.mjs");
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

/** 跑产物并对期望输出；抛错形状（want=null）则要求非 0 退出 + stderr 有内容。 */
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
  // 整数除零：Godot 与我们的运行时都在运行期抛（S27）
  writeFileSync(join(proj, "main.gd"), "extends SceneTree\n\nfunc _initialize():\n\tvar z = 0\n\tprint(100 / z)\n\tquit()\n", "utf8");
  return proj;
}

/**
 * 不在任何工程里的散装脚本。
 *
 * 这一格钉的是用户会敲的第一行：`gds2js export 单文件.gd -o app.exe`。
 * 以前 export 无条件走工程级，这种入口会先撞上「隐式根里嵌着别的工程」的守卫 ——
 * 等于**单文件根本打不了 exe**（实测 examples/test1.gd）。现在按单文件编，与 build/run 同一条边界。
 */
function looseScript(): { file: string; want: string } {
  const file = join(TMP, "loose.gd");
  writeFileSync(file, 'extends SceneTree\n\nfunc _initialize():\n\tprint("散装脚本")\n\tprint(2 ** 10)\n\tquit()\n', "utf8");
  return { file, want: "散装脚本\n1024\n" };
}

/**
 * 入口躲在子目录的工程（`res://game/main.gd` + `res://game/ui/label.gd`）。
 *
 * 这一格是踩过才算数的：SEA 把 main 挂在虚拟树的**根**，资产 key 因此必须相对 main 所在目录；
 * 扁平的 examples/multi 恰好看不出问题（入口就在树根），只有嵌套形状才暴露
 * 「入口找不到 `./product.mjs`」和「工作目录里的子目录没清」。
 */
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
    // 显式把 SEA 节点指回当前这个旧 node：整条命令可能被注了 GDS2JS_NODE_BIN=<新 node>，
    // 不覆盖掉的话这一格拿到的就是够新的二进制，门禁根本没被测到（上一版就栽在这）
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "old.exe"), "--pack", "node"], { GDS2JS_NODE_BIN: process.execPath });
    const v = verdictOf(r.out);
    if (r.code === 0) record("node/版本门禁", "FAIL", `旧 node（v${selfV}）本该拒绝，却退了 0`);
    else if (v?.v !== "refused") record("node/版本门禁", "FAIL", `拒了但没打分类标记：${v?.note ?? r.out.slice(0, 120)}`);
    else if (!/换够新的 node 重跑/.test(r.out)) record("node/版本门禁", "FAIL", "拒绝却没给出重跑命令");
    else record("node/版本门禁", "ok", `v${selfV} 上响亮拒绝 + 给出重跑命令`);
  }

  console.log("C/D perry（未设 GC 环境变量 = 走 CLI 的默认 PERRY_RS4GC=0；显式设过 = 原样传，两格都该出货并逐字节对）");
  let perryShipped = false; // E/F/G 三格要不要跑 perry，看实测结果，不靠猜
  {
    // 把外层可能存在的 PERRY_RS4GC 清成"未设"：这一格要验的正是 CLI 自己默认的这条路
    const exe = join(TMP, "perry_default.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "perry"], { PERRY_RS4GC: "" });
    const v = verdictOf(r.out);
    if (r.code === 0 && existsSync(exe)) {
      // 默认必须**说出来**：换 GC 语义不能静默
      if (!/PERRY_RS4GC=0/.test(r.out) || !/默认/.test(r.out)) record("perry/默认GC", "FAIL", "给了默认 GC 却没把「这是本 CLI 的默认」讲出来");
      else checkExe("perry/默认GC", exe, MULTI_WANT);
    } else record("perry/默认GC", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code} 且无分类标记`);
    perryShipped = existsSync(exe);
  }
  {
    const exe = join(TMP, "perry_explicit0.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "perry"], { PERRY_RS4GC: "0" });
    const v = verdictOf(r.out);
    if (r.code === 0 && existsSync(exe)) {
      if (!/你显式设的/.test(r.out)) record("perry/显式RS4GC=0", "FAIL", "显式值被改口成默认了 —— 用户设的 PERRY_RS4GC 必须原样传");
      else checkExe("perry/显式RS4GC=0", exe, MULTI_WANT);
    } else record("perry/显式RS4GC=0", v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code} 且无分类标记`);
    perryShipped = perryShipped || existsSync(exe);
  }

  console.log("E 嵌套目录工程（入口在子目录，两支都真打真跑）");
  {
    const nested = nestedProject();
    const cells: Array<{ name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean; needPerry: boolean }> = [
      { name: "node/nested", args: seaCapable ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true, needPerry: false },
      { name: "perry/nested", args: ["--pack", "perry"], env: { PERRY_RS4GC: "0" }, needSea: false, needPerry: true },
    ];
    for (const c of cells) {
      if ((c.needSea && !seaCapable) || (c.needPerry && !perryShipped)) {
        record(c.name, "refused", c.needSea ? `本机没有 Node >= ${SEA_MIN_NODE}` : "perry 那一支上面没出货，这一格跟着跑没意义");
        continue;
      }
      // exe 文件名保持 ASCII：实测 perry 的 -o 路径含非 ASCII 会「链接失败但退 0」，
      // 那是这一支的已知边界（另一格 G 专门钉它），别把它混进嵌套这一格。
      const exe = join(TMP, `${c.name.replace("/", "-")}.exe`);
      const r = runExport([nested.entry, "--res-root", nested.root, "-o", exe, ...c.args], c.env);
      const v = verdictOf(r.out);
      if (r.code !== 0) record(c.name, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
      else {
        checkExe(c.name, exe, nested.want, join(nested.root, ".gds2js-export"));
        // 嵌套形状的中间目录（<res-root>/.gds2js-export/game/ui）必须连空目录一起收干净
        const work = join(nested.root, ".gds2js-export");
        if (existsSync(work)) record(`${c.name}/子目录清理`, "FAIL", `没清干净：${work}`);
        else record(`${c.name}/子目录清理`, "ok", "空目录自底向上收掉了");
      }
    }
  }

  console.log("F perry 的 -o 路径含非 ASCII（实测链接失败却退 0，必须报得出来）");
  if (!perryShipped) record("perry/非ASCII输出路径", "refused", "perry 上面没出货，这一格跳过");
  else {
    const exe = join(TMP, "我的程序.exe");
    const r = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", exe, "--pack", "perry"], { PERRY_RS4GC: "0" });
    if (r.code === 0 && existsSync(exe)) record("perry/非ASCII输出路径", "ok", "这一版 perry 能吃非 ASCII 路径了（记下，别再当限制写死）");
    else if (!/非 ASCII/.test(r.out)) record("perry/非ASCII输出路径", verdictOf(r.out)?.v ?? "FAIL", "失败了却没把「-o 含非 ASCII」说清楚（perry 自己退 0，用户无从下手）");
    else record("perry/非ASCII输出路径", "refused", "响亮拒绝并给出 ASCII 的出路");
  }

  console.log("G 散装单文件（入口不在任何工程里）：两支都该照 build/run 的边界打得出 exe");
  {
    const loose = looseScript();
    const cells: Array<{ label: string; name: string; args: string[]; env: NodeJS.ProcessEnv; needSea: boolean; needPerry: boolean }> = [
      { label: "node/散装单文件", name: "node-loose", args: seaCapable ? ["--pack", "node", "--node", seaCapable] : ["--pack", "node"], env: {}, needSea: true, needPerry: false },
      { label: "perry/散装单文件", name: "perry-loose", args: ["--pack", "perry"], env: { PERRY_RS4GC: "0" }, needSea: false, needPerry: true },
    ];
    for (const c of cells) {
      if ((c.needSea && !seaCapable) || (c.needPerry && !perryShipped)) {
        record(c.label, "refused", c.needSea ? `本机没有 Node >= ${SEA_MIN_NODE}` : "perry 那一支上面没出货，这一格跟着跑没意义");
        continue;
      }
      // 落盘名保持 ASCII：perry 的 -o 含非 ASCII 会写歪（F 格专门钉那条），别让它串台到这一格
      const exe = join(TMP, `${c.name}.exe`);
      const r = runExport([loose.file, "-o", exe, ...c.args], c.env);
      const v = verdictOf(r.out);
      // 关键断言：不能被「隐式根里嵌着别的工程」那条守卫拦掉（它以前就打死在这一行）
      if (/本身不是 Godot 工程/.test(r.out)) record(c.label, "FAIL", "散装单文件又被嵌套工程守卫拦住了");
      else if (r.code !== 0) record(c.label, v?.v ?? "FAIL", v?.note ?? `退出码 ${r.code}\n${r.out.split(/\r?\n/).slice(-6).join("\n")}`);
      // 工作目录跟着**脚本**摆（TMP），不是 examples/multi —— F 格失败时会故意留那边那份，别串到这一格的清理断言上
      else checkExe(c.label, exe, loose.want, join(TMP, ".gds2js-export"));
    }
  }

  console.log("H --pack scriptc 必须被拒（这一支已按实测撤掉）");
  const rs = runExport([MULTI, "--res-root", MULTI_ROOT, "-o", join(TMP, "s.exe"), "--pack", "scriptc"], {});
  if (rs.code === 0 || !/--pack 只能是 node \| perry/.test(rs.out)) {
    record("--pack scriptc", "FAIL", `没有拒掉这个已移除的取值：${rs.out.slice(0, 120)}`);
  } else record("--pack scriptc", "ok", "被取值闸门拒了");

  rmSync(TMP, { recursive: true, force: true });
  rmSync(WORK, { recursive: true, force: true }); // 失败格会故意留 bundle 供人工重试，这里替用户收掉
  const failed = results.filter((x) => x.v === "FAIL");
  const okc = results.filter((x) => x.v === "ok").length;
  console.log(`\n汇总：ok ${okc} / 上游或环境记账 ${results.length - okc - failed.length} / FAIL ${failed.length}`);
  if (!results.some((x) => x.cell === "node/出货" && x.v === "ok")) {
    console.log("注意：node 那一支本轮没打出可用 exe（缺 Node>=25.7），逐字节对 golden 的结论来自手工实测。");
  }
  if (failed.length > 0) process.exit(1);
}

main();
