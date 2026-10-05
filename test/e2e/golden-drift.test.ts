/**
 * 语料门 · golden 漂移检测：拿真 Godot 重跑每个用例，与已提交的 godot.txt 逐字节比。
 * `tools/golden.mjs` 的重生成分支**不迁** —— 它写 238 个 golden，是 codegen 不是断言，
 * 仍由 `pnpm test:golden` 承担。
 *
 * 这里补上了旧脚本**缺的一道守卫**：golden.mjs 从不探测 GODOT_BIN 是否存在。缺了它，
 * runGodot 会返回 `<<GDS2JS_SPAWN_ERROR>> …` 文本、godotOk 为假，于是 check 模式把 238 例
 * 全报成「漂移」退 1（还算响的），而**重生模式会把 238 个 golden 全部覆盖成那段报错文本**
 * （静默毒化整个语料）。describe.skipIf 把「没有裁判引擎」与「golden 真的漂了」分开 ——
 * 红只剩一个意思。
 *
 * 读数 `合计: OK X / 编译或运行报错 Y / 超时 Z / 漂移或缺 golden W` 由 afterAll 原样打印。
 */
import { afterAll, describe, expect, it } from "vitest";
import { hasGodot, missing } from "../support/env";
import {
  caseDir,
  caseIsProject,
  caseScript,
  GODOT_BIN,
  godotOk,
  listCases,
  normalize,
  readGolden,
  runGodot,
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
      const projectPath = caseIsProject(id) ? caseDir(id) : null;
      const { text, timedOut } = runGodot(gd, { projectPath });
      const norm = normalize(text, gd);
      const status = timedOut ? "TIMEOUT" : godotOk(norm) ? "OK" : "PARSE/RUN-ERR";
      if (timedOut) timeout++;
      else if (status === "OK") ok++;
      else parseErr++;

      const prev = readGolden(id);
      // 「缺 golden」与「漂移」共用同一个 drift 计数（读数的口径），但区别写进失败消息，
      // 好让人知道该跑 pnpm test:golden 还是去查 Godot 版本。
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
  // 与 tools/golden.mjs 的 check 模式逐字同形。
  console.log(`\n合计: OK ${ok} / 编译或运行报错 ${parseErr} / 超时 ${timeout} / 漂移或缺 golden ${drift}`);
});
