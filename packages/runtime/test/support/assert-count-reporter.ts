/**
 * 把 @gds2js/testkit 记在 task.meta 上的断言计数按 project 加总，印出与旧门脚本
 * 逐字同形的读数行 —— `git show 64cf250:docs/ROADMAP.md` 按名字记这些数，所以它们必须活着。
 *
 * 计数只能在这里做：表驱动 helper（如 region 280-390 的 runMut）在运行时才生成断言，
 * 总数对不上静态调用点；而各测试文件的模块作用域互不相通，计数得经 task.meta
 * 序列化回主进程才能合流。
 */
import type { Reporter, TestModule } from "vitest/node";

type Counters = { pass: number; fail: number };

/** 与 @gds2js/testkit 里的 META_KEY 同一个字面量；testkit 不依赖本文件，故两处各写一份。 */
const META_KEY = "gds2jsAsserts";

function add(total: Counters, meta: unknown): void {
  if (typeof meta !== "object" || meta === null) return;
  const hit = (meta as Record<string, unknown>)[META_KEY];
  if (typeof hit !== "object" || hit === null) return;
  const c = hit as Partial<Counters>;
  total.pass += typeof c.pass === "number" ? c.pass : 0;
  total.fail += typeof c.fail === "number" ? c.fail : 0;
}

/**
 * 每个 project 一行读数，%d 依次是 pass / fail。文本逐字沿用被搬走的那支门脚本，
 * 好让 `git show 64cf250:docs/ROADMAP.md` 里按名字记的读数仍可 grep。
 *
 * 只有「多文件共用一个总读数」的门才需要 reporter；compiler 与 e2e 的读数形状
 * 各不相同（分桶看板、三元组、ok/记账/FAIL 汇总），由各自文件在 afterAll 里打。
 */
const READINGS: ReadonlyMap<string, string> = new Map([
  ["runtime", "ops 自校验：通过 %d，失败 %d"],
  ["repo", "tree-face 对账：通过 %d 项，失败 %d 项"],
]);

export default class AssertCountReporter implements Reporter {
  onTestRunEnd(testModules: ReadonlyArray<TestModule>): void {
    const byProject = new Map<string, Counters>();
    for (const m of testModules) {
      const name = m.project?.name ?? "";
      let total = byProject.get(name);
      if (total === undefined) {
        total = { pass: 0, fail: 0 };
        byProject.set(name, total);
      }
      add(total, m.meta());
      for (const t of m.children.allTests()) add(total, t.meta());
    }

    for (const [name, template] of READINGS) {
      const c = byProject.get(name);
      if (c === undefined || (c.pass === 0 && c.fail === 0)) continue;
      console.log(template.replace("%d", String(c.pass)).replace("%d", String(c.fail)));
    }
  }
}
