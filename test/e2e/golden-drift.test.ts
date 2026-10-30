import { afterAll, describe, expect, it } from "vitest";
import { hasGodot, missing } from "../support/env";
import {
  caseDir,
  caseIsProject,
  caseSandboxed,
  caseScene,
  caseScript,
  dropSandbox,
  GODOT_BIN,
  godotOk,
  hangBudget,
  listCases,
  normalize,
  prepareSandbox,
  readGolden,
  runGodot,
  sandboxEnv,
} from "../support/lib-bridge";

const cases = listCases();
expect(cases.length, `用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

let ok = 0;
let parseErr = 0;
let timeout = 0;
let drift = 0;

const SKIP_WHY = hasGodot ? "" : `（跳过：${missing(`裁判引擎 ${GODOT_BIN}`)}）`;

describe.skipIf(!hasGodot)(`golden 漂移检测${SKIP_WHY}`, () => {
  for (const id of cases) {
    it(id, () => {
      const gd = caseScript(id);
      const prev = readGolden(id);
      const sandboxed = caseSandboxed(id);
      const projectPath = sandboxed ? prepareSandbox(id).engine : caseIsProject(id) ? caseDir(id) : null;
      let ran;
      try {
        ran = runGodot(gd, {
          projectPath,
          scene: caseScene(id) !== null,
          timeoutMs: hangBudget(prev),
          env: sandboxed ? sandboxEnv(id) : null,
          cwd: sandboxed ? projectPath : null,
        });
      } finally {
        if (sandboxed) dropSandbox(id);
      }
      const { text, timedOut } = ran;
      const norm = normalize(text, gd, sandboxed ? id : null);
      const status = timedOut ? "TIMEOUT" : godotOk(norm) ? "OK" : "PARSE/RUN-ERR";
      if (timedOut) timeout++;
      else if (status === "OK") ok++;
      else parseErr++;

      if (prev === null) {
        drift++;
        expect(prev, `${id.padEnd(34)} ${status.padEnd(12)} 缺 golden —— 跑 pnpm test:golden 生成`).not.toBe(null);
        return;
      }
      if (prev !== norm) {
        drift++;
        const g = prev.split("\n");
        const n = norm.split("\n");
        const i = g.findIndex((line, idx) => line !== n[idx]);
        const at = i < 0 ? Math.max(g.length, n.length) : i;
        expect(
          norm,
          `${id.padEnd(34)} ${status.padEnd(12)} 漂移 第 ${at + 1} 行\n` +
            `  golden: ${g[at] ?? "<无>"}\n  godot : ${n[at] ?? "<无>"}`,
        ).toBe(prev);
      }
    });
  }
});

afterAll(() => {
  if (!hasGodot) {
    console.log(`golden 漂移检测：整支跳过 —— ${missing(`裁判引擎 ${GODOT_BIN}`)}`);
    return;
  }
  console.log(`裁判引擎: ${GODOT_BIN}`);
  console.log(`用例数量: ${cases.length}  (check 模式，不写盘)`);
  console.log(`\n合计: OK ${ok} / 编译或运行报错 ${parseErr} / 超时 ${timeout} / 漂移或缺 golden ${drift}`);
});
