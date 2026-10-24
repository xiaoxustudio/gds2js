/**
 * 超时件的那一副参照（#31，判据与踩坑记在 ROADMAP 第二百四十八 / 二百四十九笔）：
 * golden 里带 `<<GDS2JS_TIMEOUT>>` 的那 18 页 —— 运行期错作废了入口那支，`quit()` 再也不会被叫到，
 * **引擎自己也没跑完**，所以 `corpus-diff` 把它们记成「没有跑完的参照」而跳过（第二百四十八笔的那一副第三面孔）。
 * 但参照其实还剩一半：被杀掉之前落盘的那一份输出。两侧形状一致 —— 产物同样挂住，SCRIPT ERROR 那块在挂住之前就写完了。
 * 于是这一支用**子进程 + 硬超时**去取那一份前缀，与 golden 去掉标记之后逐字节比；退出形状也是判据：
 * 产物要是自己退出了而引擎那侧挂住，那是另一类分歧（宿主 MainLoop 的形状），照样判红。
 *
 * 为什么单开一支而不并进 `corpus-diff`：那边是**本进程**动态 import 产物（`test/support/js-runner`），
 * 挂住的模块会把 `process.stdout.write` 的猴补丁连同整个 worker 一起拖死 —— 这条是实测踩出来的。
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasDist } from "../support/env";
import { CORPUS, ROOT, caseScript, normalize, readGolden } from "../support/lib-bridge";

const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");
/** 产物起来要先编译一次，之后由这里杀掉。 */
const KILL_MS = 15_000;
const MARK = "<<GDS2JS_TIMEOUT>>";

function hungCases(): string[] {
  if (!existsSync(CORPUS)) return [];
  return readdirSync(CORPUS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d{3}-/.test(d.name))
    .map((d) => d.name)
    .sort()
    .filter((id) => {
      const g = readFileSync(join(CORPUS, id, "godot.txt"), "utf8");
      return g.includes(MARK);
    });
}

const CASES = hungCases();

expect(CASES.length, `超时件数量不对劲（${CASES.length}）：语料根算歪了？`).toBeGreaterThan(0);

describe("超时件 · 被杀掉之前那一份输出与 golden 逐字节", () => {
  const built = hasDist;
  for (const id of CASES) {
    it(id, async (ctx) => {
      if (!built) {
        ctx.skip(true, "没跑 pnpm build（`packages/gds2js/dist/cli.mjs` 不在盘面）");
        return;
      }
      const gd = caseScript(id);
      const golden = normalize(readGolden(id) ?? "", gd).split("\n").filter((l) => !l.includes(MARK)).join("\n").trimEnd();
      const r = spawnSync(process.execPath, [CLI, "run", gd], {
        cwd: ROOT,
        encoding: "utf8",
        windowsHide: true,
        timeout: KILL_MS,
      });
      expect(r.signal ?? "", `${id}：产物没被超时杀掉（退出码 ${String(r.status)}），而引擎那侧是挂住的`).toBe("SIGTERM");
      const ours = normalize((r.stdout || "") + (r.stderr || ""), gd).trimEnd();
      if (ours !== golden) {
        const g = golden.split("\n");
        const j = ours.split("\n");
        const i = g.findIndex((line, idx) => line !== j[idx]);
        const at = i < 0 ? g.length : i;
        expect(
          ours,
          `[不一致] ${id} 第 ${at + 1} 行\n  godot: ${g[at] ?? "<无>"}\n  js   : ${j[at] ?? "<无>"}`,
        ).toBe(golden);
      }
    }, KILL_MS + 30_000);
  }
});
