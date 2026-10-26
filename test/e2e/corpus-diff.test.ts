import { afterAll, describe, expect, it } from "vitest";
import runCase from "../support/js-runner";
import { caseScript, godotOk, listCases, normalize, readGolden } from "../support/lib-bridge";

const cases = listCases();

expect(cases.length, `用例数不对劲（${cases.length}），语料根算歪了？`).toBeGreaterThan(200);

interface Row {
  id: string;
  godotOk: boolean;
  rtErr: boolean;
  hung: boolean;
  stale: boolean;
  js: string | null;
  jsErr: string | null;
}

/** 「预期报错」其实分三副面孔：解析期就拒的那一副，JS 侧压根没有「跑出来」这回事（编译期那 140 支句子归 `sema-wording-parity`）；
 *  运行期才错、但引擎把脚本跑完、值也打了的那一副 —— 只多一块 SCRIPT ERROR，此前一律归桶跳过，
 *  于是第二百四十三笔那条「产物退 1 且印 `[object Object]`」的崩相在门里照不到（它就在 445 那一页）；
 *  第三副见 `engineHung`。 */
function parseRefused(golden: string): boolean {
  return /Parse Error/.test(golden);
}

/** 第三副面孔：golden 带 `<<GDS2JS_TIMEOUT>>` 的那 18 页 —— **引擎自己也没跑到 `quit()`**（错误作废了入口那支，
 *  主循环从此转不完），所以「跑完的输出」这份参照根本不存在，产物侧照同一脚本来也会挂住。
 *  照旧跳过，但理由与数量单列：这是参照缺失，不是我们对错了。 */
function engineHung(golden: string): boolean {
  return golden.includes("<<GDS2JS_TIMEOUT>>");
}

const rows: Row[] = [];

describe("corpus · JS 侧产物 vs Godot golden 逐字节", () => {
  for (const id of cases) {
    it(id, async (ctx) => {
      const gd = caseScript(id);
      const golden = readGolden(id);
      const hung = golden !== null && engineHung(golden);
      const row: Row = { id, godotOk: godotOk(golden), rtErr: golden !== null && !godotOk(golden) && !hung && !parseRefused(golden), hung, stale: golden === null, js: null, jsErr: null };
      rows.push(row);

      if (row.stale) {
        ctx.skip(true, "golden 缺失：先跑 pnpm test:golden");
        return;
      }
      if (!row.godotOk && !row.rtErr) {
        ctx.skip(true, row.hung ? "引擎侧自己没跑完（golden 带超时标记），没有跑完的参照可对" : "Godot 解析期就拒（编译期句子归正文门），JS 侧不参与对拍");
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
  const rtErr = rows.filter((r) => r.rtErr).length;
  const hung = rows.filter((r) => r.hung).length;
  const compared = godotRunnable + rtErr;
  const jsRan = rows.filter((r) => r.js !== null).length;
  const match = rows.filter((r) => r.js !== null && r.js === readGolden(r.id)).length;
  const silent = rows.filter((r) => r.js !== null && r.js !== readGolden(r.id));
  const crashed = rows.filter((r) => (r.godotOk || r.rtErr) && r.js === null && r.jsErr !== null);
  const todo = rows.filter((r) => (r.godotOk || r.rtErr) && r.js === null && r.jsErr === null);
  const expectedErr = rows.filter((r) => !r.godotOk && !r.rtErr).length;
  const stale = rows.filter((r) => r.stale).length;

  console.log(`用例 ${rows.length}\n`);
  console.log("状态层");
  console.log(`  Godot 侧可编译+运行      ${godotRunnable}/${rows.length}`);
  console.log(`  运行期报错但照跑         ${rtErr}/${rows.length}`);
  console.log(`  引擎侧自己没跑完         ${hung}/${rows.length}`);
  console.log(`  Godot 侧预期报错用例      ${expectedErr}/${rows.length}`);
  console.log(`  golden 未漂移            ${rows.length - stale}/${rows.length}`);
  console.log(`  JS 侧已实现并跑出结果     ${jsRan}/${compared}`);
  console.log("\n内容层");
  console.log(`  逐字节一致               ${match}/${compared}`);
  console.log("\n缺口（按处理优先级）");
  console.log(`  静默错误（能跑但输出错）  ${silent.length}   <- 最优先`);
  console.log(`  崩溃（抛 unsupported 等）${crashed.length}   <- 分清是设计取舍还是真 bug`);
  console.log(`  未实现                   ${todo.length}   <- 排期`);

  if (crashed.length > 0) {
    console.log("\n--- 崩溃明细 ---");
    for (const r of crashed) console.log(`  [崩溃] ${r.id}  ${r.jsErr ?? ""}`);
  }
});
