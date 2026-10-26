import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { hasDist } from "../support/env";
import { CORPUS, ROOT, caseScript, normalize, readGolden } from "../support/lib-bridge";

const CLI = join(ROOT, "packages", "gds2js", "dist", "cli.mjs");
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
