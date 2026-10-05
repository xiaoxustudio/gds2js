/**
 * 原生 CLI 等价性门：不带 node 的 gds2js.exe 与 node 侧 CLI 出货必须一致。
 * 读数 `原生 CLI 等价性门：通过 N 项，失败 M 项` 由 afterAll 原样打印。
 *
 * 前置：`pnpm build`（原生 exe 把 dist 与 runtime 源码嵌进自己）、libtree-sitter（TS_SRC）、
 * zig、scriptc。缺任何一样整支 skip 并说出缺什么，而不是把「环境没料」混进「真的坏了」的红。
 *
 * 开关改成环境变量：
 *   GDS2JS_CLI_NATIVE_QUICK=1      跳过 ④⑥ 两格 scriptc/SEA 出货（只比 build/run/拒绝语）
 *   GDS2JS_CLI_NATIVE_REBUILD=1    强制重编原生 exe
 *   GDS2JS_CLI_NATIVE_NO_REBUILD=1 exe 过期时拒绝验旧货、直接红
 *
 * newestInputMtime() 递归 walk `packages/` 时**必须排除 `test`**：测试文件不是 exe 的输入，
 * 照抄旧版（它 walk 时还没有 packages/*\/test/）会导致「改一个测试文件 → exe 判过期 →
 * 每次重建（zig 编 C + scriptc 出货，几分钟）」。`node_modules` 也一并显式排除。
 * exe 的真实输入集没变：packages/*\/src、native/、dist/、构建脚本。
 */
import { spawn, spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { hasDist, hasScriptc, hasTsSrc, hasZig, isWindows, missing, TS_SRC } from "../support/env";
import { ROOT } from "../support/lib-bridge";

const EXE = join(ROOT, "tmp", "cli-native", "gds2js.exe");
const WD = join(ROOT, "tmp", "cli-native-check");
const QUICK = process.env.GDS2JS_CLI_NATIVE_QUICK === "1";
const REBUILD = process.env.GDS2JS_CLI_NATIVE_REBUILD === "1";
const SINGLE = ["001-int-division", "021-class-basic", "062-string-escapes", "060-string-utf32"];
const PROJECT_CASE = "032-preload-load";

const LACK = [
  !isWindows ? `Windows 平台（当前 ${process.platform}；zig 的 target triple 是 x86_64-windows-gnu）` : null,
  !hasDist ? "packages/gds2js/dist（先跑 pnpm build）" : null,
  !hasZig ? "zig（ZIG_CC 可覆盖）" : null,
  !hasScriptc ? "scriptc" : null,
  !hasTsSrc ? `libtree-sitter 源码 ${TS_SRC}（TS_SRC 可覆盖）` : null,
].filter((x): x is string => x !== null);
const ready = LACK.length === 0;
const SKIP_WHY = ready ? "" : `（跳过：${missing(...LACK)}）`;

let okCount = 0;
const badList: string[] = [];

/** 一格判定：成了记 ok，不成记一笔红。 */
function cell(cond: boolean, failMsg: string): void {
  if (cond) {
    okCount++;
    return;
  }
  badList.push(failMsg);
  expect(cond, `✗ ${failMsg}`).toBe(true);
}

/** npm/pnpm 包装层噪声（例：pnpm 把 store-dir 注入子进程 env 后 npx 的告警）不是两侧的行为差异，
 *  比前必须剔掉 —— 不剔就会假红。 */
function cleanNoise(s: string): string {
  return s
    .split("\n")
    .filter((l) => !/^npm warn Unknown env config /.test(l))
    .join("\n");
}

function run(bin: string, args: string[], cwd: string): { status: number | null; out: string } {
  const r = spawnSync(bin, args, { encoding: "utf8", cwd: ROOT, timeout: 2_400_000, windowsHide: true });
  if (r.error !== undefined) throw new Error(`${bin} 起不来：${r.error.message}（args=${JSON.stringify(args)}）`);
  return { status: r.status, out: cleanNoise(`${r.stdout ?? ""}${r.stderr ?? ""}`) };
}
/** node 那支 CLI：走仓库里的 tsx（与 test:diff 同一口径）。 */
const cliNode = (args: string[], cwd: string): { status: number | null; out: string } =>
  run("npx", ["tsx", "packages/gds2js/src/cli.ts", ...args], cwd);
const cliExe = (args: string[], cwd: string): { status: number | null; out: string } => run(EXE, args, cwd);
const read = (p: string): string => readFileSync(p, "utf8");

/** 轮询到条件成立为止（`--watch` 那两格用它等子进程的输出）。 */
async function until(pred: () => boolean, ms: number): Promise<boolean> {
  const stopAt = Date.now() + ms;
  while (Date.now() < stopAt) {
    if (pred()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return pred();
}

function copyTree(from: string, to: string): void {
  mkdirSync(to, { recursive: true });
  for (const e of readdirSync(from, { withFileTypes: true })) {
    const a = join(from, e.name);
    const b = join(to, e.name);
    if (e.isDirectory()) copyTree(a, b);
    else copyFileSync(a, b);
  }
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string): void => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out.push(relative(dir, p).split("\\").join("/"));
    }
  };
  walk(dir);
  return out;
}

/** 两棵树逐文件比字节。返回第一处不一致（或 null）。 */
function diffTrees(a: string, b: string): string | null {
  const all = [...new Set([...listFiles(a), ...listFiles(b)])].sort();
  for (const rel of all) {
    const pa = join(a, rel);
    const pb = join(b, rel);
    if (!existsSync(pa) || !existsSync(pb)) return `${rel} 只在一边有`;
    if (read(pa) !== read(pb)) return `${rel} 内容不同`;
  }
  return null;
}

/** exe 的输入集 = 包源码 / C 源 / 构建脚本。任何一样比 exe 新就算过期（拒绝验旧货）。
 *  排除 test 与 node_modules 的理由见文件头。 */
function newestInputMtime(): number {
  let newest = 0;
  const SKIP_DIRS = new Set(["test", "node_modules"]);
  const walk = (dir: string): void => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory() && SKIP_DIRS.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else {
        const t = statSync(p).mtimeMs;
        if (t > newest) newest = t;
      }
    }
  };
  walk(join(ROOT, "packages"));
  walk(join(ROOT, "native"));
  const script = statSync(join(ROOT, "tools", "cli-native.mjs")).mtimeMs;
  return script > newest ? script : newest;
}

describe.skipIf(!ready)(`原生 CLI 等价性门${SKIP_WHY}`, () => {
  beforeAll(() => {
    const exeStale = existsSync(EXE) && newestInputMtime() > statSync(EXE).mtimeMs;
    if (exeStale && process.env.GDS2JS_CLI_NATIVE_NO_REBUILD === "1") {
      // 抛而不是 process.exit(1)：让 Vitest 把它记成 beforeAll 失败，而不是整轮静默退出。
      throw new Error("原生 exe 过期（packages/ 或 native/ 比它新），且设了 GDS2JS_CLI_NATIVE_NO_REBUILD=1 —— 拒绝验旧货。");
    }
    if (exeStale) console.log("原生 exe 过期（packages/ 或 native/ 比它新），自动重建…");
    if (!existsSync(EXE) || REBUILD || exeStale) {
      console.log("先编原生 CLI（tools/cli-native.mjs，出货形态默认带 --dynamic；含 zig 编 C + scriptc 出货，慢）…");
      const r = spawnSync("node", [join(ROOT, "tools", "cli-native.mjs"), "--keep"], {
        encoding: "utf8",
        cwd: ROOT,
        timeout: 3_000_000,
      });
      if (r.status !== 0) {
        console.log(`${r.stdout ?? ""}${r.stderr ?? ""}`);
        throw new Error("原生 CLI 没编出来 —— 这一门没有意义。");
      }
    }
    // 开工先清 WD：两个并发实例会互毁，所以 e2e project 钉死了单 worker 串行。
    rmSync(WD, { recursive: true, force: true });
    mkdirSync(WD, { recursive: true });
  });

  afterAll(() => {
    console.log(`\n原生 CLI 等价性门：通过 ${String(okCount)} 项，失败 ${String(badList.length)} 项`);
    for (const b of badList) console.log(`  红：${b}`);
  });

  // ── ① 单文件 build：逐字节（把运行时的说明符钉成同一个，比的是**编译器**而不是默认路径）──
  for (const id of SINGLE) {
    it(`① ${id}：build 产物逐字节`, () => {
      const dir = join(WD, id);
      mkdirSync(dir, { recursive: true });
      copyFileSync(join(ROOT, "corpus", "cases", id, "main.gd"), join(dir, "main.gd"));
      const spec = ["--runtime", "gds2js/runtime", "--host", "gds2js/host"];
      const n = cliNode(["build", join(dir, "main.gd"), "-o", join(dir, "node.mts"), ...spec], ROOT);
      const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts"), ...spec], ROOT);
      if (n.status !== 0 || e.status !== 0) {
        cell(false, `${id}: 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
        return;
      }
      cell(read(join(dir, "node.mts")) === read(join(dir, "exe.mts")), `${id}: build 产物不是逐字节`);
    });

    // ── ② run：输出逐字（原生那支是起外部 node 子进程跑的）──
    it(`② ${id}：run 输出逐字`, () => {
      const dir = join(WD, id);
      const n = cliNode(["run", join(dir, "main.gd")], ROOT);
      const e = cliExe(["run", join(dir, "main.gd")], ROOT);
      if (n.status !== 0 || e.status !== 0) {
        cell(false, `${id}: run 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
        return;
      }
      cell(
        n.out === e.out && /\S/.test(n.out),
        `${id}: run 输出不同 node=${JSON.stringify(n.out.slice(0, 80))} exe=${JSON.stringify(e.out.slice(0, 80))}`,
      );
    });
  }

  // ── ③ 自带家目录：默认说明符要指进 exe 里那份打平运行时 ──
  it("③ 默认运行时说明符 = 家目录里的 file URL", () => {
    const dir = join(WD, "home-spec");
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
    const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts")], ROOT);
    if (e.status !== 0) {
      cell(false, `build 退出码 ${e.status}：${e.out.slice(0, 200)}`);
      return;
    }
    const first = read(join(dir, "exe.mts"))
      .split("\n")
      .find((l) => l.includes("from")) ?? "";
    if (!first.includes("file:///") || !first.includes("gds2js-home-native")) {
      cell(false, `默认说明符没指进家目录：${first}`);
      return;
    }
    const same = cliNode(["run", join(dir, "main.gd")], ROOT).out === cliExe(["run", join(dir, "main.gd")], ROOT).out;
    cell(same, "默认家目录运行时跑出来的输出与 node 侧不同");
  });

  // ── ③′ local 模式：旁挂包来自 exe 内嵌的 dist/standalone.cjs（第三种运行时模式）──
  it("③′ local 模式：旁挂内嵌的 standalone，产物在仓库外也能跑", () => {
    const dir = join(WD, "local-mode");
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
    const n = cliNode(["build", join(dir, "main.gd"), "-o", join(dir, "node.mts"), "--runtime-mode", "local"], ROOT);
    const e = cliExe(["build", join(dir, "main.gd"), "-o", join(dir, "exe.mts"), "--runtime-mode", "local"], ROOT);
    const sideFile = "gds2js-standalone.cjs";
    if (n.status !== 0 || e.status !== 0) {
      cell(false, `local 模式退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
      return;
    }
    if (!existsSync(join(dir, sideFile))) {
      cell(false, `旁挂的 ${sideFile} 没落到产物旁边`);
      return;
    }
    if (read(join(dir, "node.mts")) !== read(join(dir, "exe.mts"))) {
      cell(false, "local 模式的产物不是逐字节（两句 requirePath 应当一样）");
      return;
    }
    const played = run("node", [join(dir, "exe.mts")], ROOT);
    const ref = cliExe(["run", join(dir, "main.gd")], ROOT).out;
    if (played.status !== 0) cell(false, `旁挂产物跑不起来：${played.out.slice(0, 160)}`);
    else {
      cell(
        played.out === ref,
        `旁挂产物的输出与 run 不同：exe侧=${JSON.stringify(played.out.slice(0, 80))} 参照=${JSON.stringify(ref.slice(0, 80))}`,
      );
    }
  });

  // ── ④ 工程出货：exe 自己编一个 scriptc exe，产物树与 node 侧逐字节、跑起来输出逐字 ──
  it.skipIf(QUICK)(`④ 工程 export --pack scriptc：${PROJECT_CASE}`, () => {
    const src = join(ROOT, "corpus", "cases", PROJECT_CASE);
    const side = { node: join(WD, "proj-node"), exe: join(WD, "proj-exe") };
    const results: Record<string, { status: number | null; out: string }> = {};
    for (const [who, dir] of Object.entries(side)) {
      copyTree(src, dir);
      const args = ["export", join(dir, "main.gd"), "--pack", "scriptc", "-o", join(dir, "game.exe"), "--keep-bundle"];
      results[who] = who === "node" ? cliNode(args, ROOT) : cliExe(args, ROOT);
    }
    const rn = results.node!;
    const re = results.exe!;
    if (rn.status !== 0 || re.status !== 0) {
      cell(false, `export 退出码 node=${rn.status} exe=${re.status}：${(rn.out + re.out).slice(-400)}`);
      return;
    }
    const d = diffTrees(join(side.node, ".gds2js-export"), join(side.exe, ".gds2js-export"));
    cell(d === null, `模块树不一致：${d ?? ""}`);
    // 参照：node 侧 CLI 跑同一个工程（run-project 只支持 import 模式）
    const nodeRun = cliNode(["run-project", join(side.node, "main.gd"), "--res-root", side.node], ROOT);
    const exeRun = cliExe(["run-project", join(side.exe, "main.gd"), "--res-root", side.exe], ROOT);
    if (exeRun.status !== 0) cell(false, `exe 的 run-project 退出码 ${exeRun.status}：${exeRun.out.slice(0, 200)}`);
    else {
      cell(
        exeRun.out === nodeRun.out,
        `exe 的 run-project 输出与 node 侧不同：\n    exe=${JSON.stringify(exeRun.out.slice(0, 160))}\n    node=${JSON.stringify(nodeRun.out.slice(0, 160))}`,
      );
    }
    const p = join(side.exe, "game.exe");
    if (!existsSync(p)) cell(false, "原生 exe 没能编出 scriptc 产物");
    else {
      const runOut = run(p, [], ROOT).out;
      cell(
        runOut.trim() === nodeRun.out.trim(),
        `scriptc 产物输出不同：\n    exe=${JSON.stringify(runOut.slice(0, 200))}\n    参照=${JSON.stringify(nodeRun.out.slice(0, 200))}`,
      );
    }
  });

  // ── ⑤ 原生构建做不了的事：响亮拒，不许静默或者崩 ──
  it("⑤ single 模式拒到位（没带打包器）", () => {
    const dir = join(WD, "refuse");
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), join(dir, "main.gd"));
    const single = cliExe(["build-project", join(dir, "main.gd"), "--runtime-mode", "single"], ROOT);
    cell(
      single.status !== 0 && single.out.includes("打包器"),
      `single 没拒到位：退出码 ${single.status} ${single.out.slice(0, 160)}`,
    );
  });

  it("⑤ 缺文件给的是错误行，不是 Uncaught", () => {
    const dir = join(WD, "refuse");
    const missingFile = cliExe(["check", join(dir, "nope.gd")], ROOT);
    cell(/读不到文件/.test(missingFile.out), `缺文件没走到「读不到文件」那一句：${missingFile.out.slice(0, 160)}`);
  });

  it("⑤ run 撞未实现：两支同一行 runtime error，理由没被退出码吃掉、也没重复报", () => {
    // 原生那支是起子进程跑产物的，产物的正文得从子进程 stderr 接回来才算报全。
    const dir = join(WD, "refuse");
    const gd = join(dir, "uns.gd");
    writeFileSync(
      gd,
      'extends SceneTree\n\nfunc _initialize():\n\tprint("before-crash")\n\tprint("5".pad_zeros(3))\n\tquit()\n',
      "utf8",
    );
    const nRun = cliNode(["run", gd], ROOT);
    const xRun = cliExe(["run", gd], ROOT);
    const hits = (s: string): number => s.split("\n").filter((l) => l.includes("runtime error")).length;
    if (/Uncaught/.test(nRun.out) || /Uncaught/.test(xRun.out)) {
      cell(false, `run 撞未实现又漏出 Uncaught 栈：node=${nRun.out.slice(0, 160)} exe=${xRun.out.slice(0, 160)}`);
      return;
    }
    if (nRun.status !== 1 || xRun.status !== 1) {
      cell(false, `run 撞未实现的退出码不是 1：node=${String(nRun.status)} exe=${String(xRun.status)}`);
      return;
    }
    if (/产物退出码/.test(xRun.out)) {
      cell(false, `exe 把理由退化成了退出码：${xRun.out.slice(0, 200)}`);
      return;
    }
    if (!/\[string-method\]/.test(nRun.out) || !/\[string-method\]/.test(xRun.out)) {
      cell(false, `两支都没给出 [code] 正文：node=${nRun.out.slice(0, 160)} exe=${xRun.out.slice(0, 160)}`);
      return;
    }
    if (nRun.out !== xRun.out) {
      cell(
        false,
        `run 撞未实现的两支输出不同：\n    node=${JSON.stringify(nRun.out.slice(0, 200))}\n    exe=${JSON.stringify(xRun.out.slice(0, 200))}`,
      );
      return;
    }
    cell(
      hits(nRun.out) === 1 && hits(xRun.out) === 1,
      `一条错报了两行（产物自己与宿主各报一遍）：node=${hits(nRun.out)} exe=${hits(xRun.out)}`,
    );
  });

  // ── ⑥ --pack node：exe 里没有 node，要么找到外部 node（≥25.7）出货，要么把版本门槛说清楚 ──
  it.skipIf(QUICK)("⑥ --pack node：出货就跑一遍，没够新的 node 就报版本门槛", () => {
    const dir = join(WD, "sea");
    mkdirSync(dir, { recursive: true });
    copyFileSync(join(ROOT, "corpus", "cases", "021-class-basic", "main.gd"), join(dir, "main.gd"));
    const out = join(dir, "sea.exe");
    const r = cliExe(["export", join(dir, "main.gd"), "--pack", "node", "-o", out], ROOT);
    if (/Uncaught/.test(r.out)) {
      cell(false, `--pack node 崩了：${r.out.slice(0, 200)}`);
      return;
    }
    if (r.status === 0 && existsSync(out)) {
      const played = run(out, [], ROOT);
      cell(
        played.status === 0 && /base-10/.test(played.out),
        `SEA 产物跑不出东西：退出码 ${played.status} ${played.out.slice(0, 160)}`,
      );
      return;
    }
    // 外部 node 不够新 → 报的是版本门槛那三行，**这算 ok 不算失败**。
    cell(/Node >=/.test(r.out), `--pack node 既没出货也没报门槛：${r.out.slice(0, 200)}`);
  });

  // ── ⑦ check-project：跨文件静态检查，exe 与 node 侧逐字 ──
  it("⑦ check-project 与 node 侧逐字一致", () => {
    const dir = join(WD, "checkproj");
    copyTree(join(ROOT, "corpus", "cases", "032-preload-load"), dir);
    const args = ["check-project", join(dir, "main.gd"), "--res-root", dir];
    const n = cliNode(args, ROOT);
    const e = cliExe(args, ROOT);
    if (n.status !== 0 || e.status !== 0) {
      cell(false, `check-project 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
      return;
    }
    cell(
      n.out === e.out,
      `check-project 输出不同：node=${JSON.stringify(n.out.slice(0, 100))} exe=${JSON.stringify(e.out.slice(0, 100))}`,
    );
  });

  // ── ⑧ --sourcemap：同一份输入、两个目录里的同名输出 → 产物与 map 都应当逐字节相同 ──
  it("⑧ --sourcemap：map 落盘、指回 .gd，两侧 map 逐字节", () => {
    const src = join(WD, "smap");
    mkdirSync(src, { recursive: true });
    const gd = join(src, "main.gd");
    copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), gd);
    const dirN = join(src, "node");
    const dirE = join(src, "exe");
    // 钉住运行时说明符：exe 的默认值指内嵌家目录（那是 ③ 那一格管的事），这里比的是 sourcemap 那条路
    const spec = ["--runtime", "gds2js/runtime", "--host", "gds2js/host"];
    const n = cliNode(["build", gd, "-o", join(dirN, "out.mts"), "--sourcemap", ...spec], ROOT);
    const e = cliExe(["build", gd, "-o", join(dirE, "out.mts"), "--sourcemap", ...spec], ROOT);
    const mapN = join(dirN, "out.mts.map");
    const mapE = join(dirE, "out.mts.map");
    if (n.status !== 0 || e.status !== 0) {
      cell(false, `--sourcemap 退出码 node=${n.status} exe=${e.status}：${(n.out + e.out).slice(0, 200)}`);
      return;
    }
    if (!existsSync(mapN) || !existsSync(mapE)) {
      cell(false, "map 没落盘（node 侧或 exe 侧）");
      return;
    }
    if (read(join(dirN, "out.mts")) !== read(join(dirE, "out.mts"))) {
      cell(false, "带 map 的产物不是逐字节");
      return;
    }
    if (read(mapN) !== read(mapE)) {
      cell(false, "两侧 map 不是逐字节（同一输入、同名输出应当全等）");
      return;
    }
    const m = JSON.parse(read(mapE)) as { sources: string[]; mappings: string };
    const code = read(join(dirE, "out.mts"));
    const tail = code.trimEnd().split("\n").pop() ?? "";
    if (m.sources.length !== 1 || m.sources[0] !== gd) {
      cell(false, `map 的 sources 没指回 .gd：${JSON.stringify(m.sources)}`);
      return;
    }
    if (typeof m.mappings !== "string" || m.mappings.length === 0) {
      cell(false, "map 的 mappings 是空的");
      return;
    }
    cell(tail.includes("sourceMappingURL=out.mts.map"), `产物尾巴没有 sourceMappingURL 那句：${JSON.stringify(tail)}`);
  });

  // ── ⑨ --watch：验的是 exe 里那份轮询摘要实现（fs.watch 的 recursive 与 listener 形状都没有 lowering）──
  it("⑨ check --watch：改 .gd 要真的重跑", async () => {
    const dir = join(WD, "watch");
    mkdirSync(dir, { recursive: true });
    const gd = join(dir, "main.gd");
    copyFileSync(join(ROOT, "corpus", "cases", "001-int-division", "main.gd"), gd);
    const child = spawn(EXE, ["check", gd, "--watch"], { cwd: ROOT, windowsHide: true });
    let buf = "";
    child.stdout?.on("data", (c) => {
      buf += String(c);
    });
    child.stderr?.on("data", (c) => {
      buf += String(c);
    });
    try {
      const sawStart = await until(() => buf.includes("监听"), 15000);
      appendFileSync(gd, "\n# 改一次\n", "utf8");
      const sawRerun = sawStart && (await until(() => buf.includes("重新运行"), 15000));
      if (!sawStart) cell(false, `没打出「监听 …」那一句（15 秒内）：${buf.slice(0, 200)}`);
      else cell(sawRerun, `改了 .gd 没触发重跑（15 秒内）：${buf.slice(-200)}`);
    } finally {
      child.kill();
      await until(() => child.exitCode !== null, 5000);
    }
  });

  // ── ⑨b run --watch：光看「重新运行」那行不够 —— 重跑若写同名临时产物，Node 按 URL 缓存
  //      ES 模块，命令重跑了但脚本不会再执行（这个洞真出现过）。要的是程序自己的第二次、不同输出的。──
  it("⑨b run --watch：改 .gd 要真的再执行一次脚本", async () => {
    const dir = join(WD, "watch-run");
    mkdirSync(dir, { recursive: true });
    const gd = join(dir, "main.gd");
    const script = (tag: string): string => `extends SceneTree\n\nfunc _initialize():\n\tprint("${tag}")\n\tquit()\n`;
    writeFileSync(gd, script("watch-a"), "utf8");
    const child = spawn(EXE, ["run", gd, "--watch"], { cwd: ROOT, windowsHide: true });
    let buf = "";
    child.stdout?.on("data", (c) => {
      buf += String(c);
    });
    child.stderr?.on("data", (c) => {
      buf += String(c);
    });
    try {
      const sawFirst = await until(() => buf.includes("watch-a"), 30000);
      if (sawFirst) writeFileSync(gd, script("watch-b"), "utf8");
      const sawSecond = sawFirst && (await until(() => buf.includes("watch-b"), 30000));
      if (!sawFirst) cell(false, `run --watch 第一次没执行（30 秒内没见 watch-a）：${buf.slice(0, 200)}`);
      else {
        cell(
          sawSecond,
          `改了 .gd 之后脚本没有再执行一次（命令重跑了、程序没重跑 —— 产物名撞了模块缓存？）：${buf.slice(-240)}`,
        );
      }
    } finally {
      child.kill();
      await until(() => child.exitCode !== null, 5000);
    }
  });

  // ── ⑨c run-project 过交叉点改走「打成单文件再装载」：装载方式不该改变语义 ──
  it("⑨c run-project 大工程：打包装载与逐文件装载输出逐字相等", () => {
    const dir = join(WD, "wide-project");
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(join(dir, "lib"), { recursive: true });
    writeFileSync(join(dir, "project.godot"), '[application]\nconfig/name="wide"\n', "utf8");
    const N = 120;
    for (let i = 0; i < N; i++) {
      writeFileSync(
        join(dir, "lib", `m${i}.gd`),
        `class_name W${i}\n\nvar x = ${i}\n\nfunc twice():\n\treturn x * 2\n`,
        "utf8",
      );
    }
    let main = "extends SceneTree\n";
    for (let i = 0; i < N; i++) main += `const B${i} = preload("res://lib/m${i}.gd")\n`;
    main += `\nfunc _initialize():\n\tprint("ok|", B0.new().twice(), B${N - 1}.new().twice())\n\tquit()\n`;
    writeFileSync(join(dir, "main.gd"), main, "utf8");
    const args = ["run-project", join(dir, "main.gd"), "--res-root", dir];
    const bundled = cliNode(args, ROOT);
    // process.env 是进程级全局：e2e project 钉死单 worker 串行，且这里用 try/finally 兜住还原。
    let perFile: { status: number | null; out: string };
    process.env.GDS2JS_RUN_BUNDLE = "0";
    try {
      perFile = cliNode(args, ROOT);
    } finally {
      delete process.env.GDS2JS_RUN_BUNDLE;
    }
    const exeRun = cliExe(args, ROOT);
    if (bundled.status !== 0) cell(false, `node（打包）退出码 ${bundled.status}：${bundled.out.slice(0, 200)}`);
    else if (perFile.out !== bundled.out) {
      cell(
        false,
        `打包改变了输出：\n    逐文件=${JSON.stringify(perFile.out.slice(0, 120))}\n    打包=${JSON.stringify(bundled.out.slice(0, 120))}`,
      );
    } else if (exeRun.status !== 0) cell(false, `exe（逐文件）退出码 ${exeRun.status}：${exeRun.out.slice(0, 200)}`);
    else {
      cell(
        exeRun.out === bundled.out,
        `exe 与 node（打包）输出不同：\n    exe=${JSON.stringify(exeRun.out.slice(0, 120))}\n    node=${JSON.stringify(bundled.out.slice(0, 120))}`,
      );
    }
  });
});
