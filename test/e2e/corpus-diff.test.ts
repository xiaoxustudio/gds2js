/**
 * 语料门 · 端到端对拍：在本进程内跑每个用例的编译产物，与 Godot 的 golden 逐字节比。
 *
 * 这一支**不是普通的门，是进度看板**：原来只有「静默错误」才退非 0，崩溃 / 未实现 /
 * golden 缺失全部退 0。三态分派沿用那句老注释 ——「崩溃和「没做」必须分开算：
 * 前者是 bug，后者是排期」：
 *   match       → pass
 *   silent      → fail（唯一退非 0 的老条件）
 *   crashed     → fail（**本轮唯一有意的行为变更**；迁移前实测为 0，所以不会当天变红）
 *   todo        → skip（排期，不是 bug）
 *   expectedErr → skip（Godot 侧本来就报错，JS 侧不参与对拍）
 *   stale       → skip（golden 缺失；漂移检测归 golden-drift.test.ts）
 * 六行看板读数由 afterAll 原样打印，`diff 152/152` 这条历史序列仍可 grep。
 *
 * 没迁的部分：`--refresh`（要对 238 例逐个起 Godot、数十分钟，本质是 golden 重生）、
 * `--show`（细节改由失败消息带出首个分歧行）。case-id 子串过滤由 `-t <pattern>` 承担。
 *
 * **必须严格串行**：js-runner 的 import specifier 不带 query string，同进程重跑同一用例
 * 会命中 ES module cache 而静默产出空输出（= 假绿）；且 process.stdout.write 的猴补丁不可重入。
 * 所以本文件禁 test.concurrent，e2e project 也钉死了 retry:0。
 */
import { afterAll, describe, expect, it } from "vitest";
import runCase from "../support/js-runner";
import { caseScript, godotOk, listCases, normalize, readGolden } from "../support/lib-bridge";

const cases = listCases();

// listCases 对不存在的目录返回空数组 → 0 个 it() → 门报绿。这是最坏的失败形状，先响亮拒。
expect(cases.length, `用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

interface Row {
  id: string;
  godotOk: boolean;
  stale: boolean;
  js: string | null;
  jsErr: string | null;
}

const rows: Row[] = [];

describe("corpus · JS 侧产物 vs Godot golden 逐字节", () => {
  // 不用 it.each：Vitest 5 的 each 回调**拿不到 test context**（实测 ctx 为 undefined），
  // 而 todo / expectedErr / stale 三桶要在运行时 ctx.skip。改成 for 循环建 it()，
  // 用例 id 仍在测试名里，`-t 088-vector2-write-error` 这种单例重跑照旧可用。
  for (const id of cases) {
    it(id, async (ctx) => {
      const gd = caseScript(id);
      const golden = readGolden(id);
      const row: Row = { id, godotOk: godotOk(golden), stale: golden === null, js: null, jsErr: null };
      // 先记账再判分派：看板要的是**全部** 238 行的分桶，跳过的那些也得算进 expectedErr/stale。
      rows.push(row);

      if (row.stale) {
        ctx.skip(true, "golden 缺失：先跑 pnpm test:golden");
        return;
      }
      if (!row.godotOk) {
        ctx.skip(true, "Godot 侧就报错（预期报错用例），JS 侧不参与对拍");
        return;
      }

      try {
        const raw = await runCase(id);
        row.js = raw === null || raw === undefined ? null : normalize(String(raw), gd);
      } catch (e) {
        row.jsErr = e instanceof Error ? e.message : String(e);
      }

      if (row.jsErr !== null) {
        expect(row.jsErr, `[崩溃] ${id}：${row.jsErr}`).toBe(null);
        return;
      }
      if (row.js === null) {
        ctx.skip(true, "未实现：排期（main.gen.mts / main.mts 都不在盘面）");
        return;
      }

      // 失败消息带上首个分歧行，顶替旧的 --show 细节。
      if (row.js !== golden) {
        const g = (golden ?? "").split("\n");
        const j = row.js.split("\n");
        const i = g.findIndex((line, idx) => line !== j[idx]);
        const at = i < 0 ? g.length : i;
        expect(
          row.js,
          `[不一致] ${id} 第 ${at + 1} 行\n  godot: ${g[at] ?? "<无>"}\n  js   : ${j[at] ?? "<无>"}`,
        ).toBe(golden);
      }
    });
  }
});

afterAll(() => {
  const godotRunnable = rows.filter((r) => r.godotOk).length;
  const jsRan = rows.filter((r) => r.js !== null).length;
  const match = rows.filter((r) => r.js !== null && r.js === readGolden(r.id)).length;
  const silent = rows.filter((r) => r.js !== null && r.js !== readGolden(r.id));
  const crashed = rows.filter((r) => r.godotOk && r.js === null && r.jsErr !== null);
  const todo = rows.filter((r) => r.godotOk && r.js === null && r.jsErr === null);
  const expectedErr = rows.filter((r) => !r.godotOk).length;
  const stale = rows.filter((r) => r.stale).length;

  // 以下 12 行与旧门脚本逐字同形，好让 ROADMAP 的 `diff 152/152` 序列可 grep。
  console.log(`用例 ${rows.length}\n`);
  console.log("状态层");
  console.log(`  Godot 侧可编译+运行      ${godotRunnable}/${rows.length}`);
  console.log(`  Godot 侧预期报错用例      ${expectedErr}/${rows.length}`);
  console.log(`  golden 未漂移            ${rows.length - stale}/${rows.length}`);
  console.log(`  JS 侧已实现并跑出结果     ${jsRan}/${godotRunnable}`);
  console.log("\n内容层");
  console.log(`  逐字节一致               ${match}/${godotRunnable}`);
  console.log("\n缺口（按处理优先级）");
  console.log(`  静默错误（能跑但输出错）  ${silent.length}   <- 最优先`);
  console.log(`  崩溃（抛 unsupported 等）${crashed.length}   <- 分清是设计取舍还是真 bug`);
  console.log(`  未实现                   ${todo.length}   <- 排期`);

  // 旧 --show 的崩溃明细：现在崩溃会直接判红，但把理由聚合在这里更好读。
  if (crashed.length > 0) {
    console.log("\n--- 崩溃明细 ---");
    for (const r of crashed) console.log(`  [崩溃] ${r.id}  ${r.jsErr ?? ""}`);
  }
});
