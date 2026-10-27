// 单一 vitest 根配置：四个 project 分管两层。不用 vitest.workspace.ts（Vitest 4 已删）。
// 不需要 resolve.alias：pnpm 软链 + exports 映射直接指到 src/*.ts，Vite 当项目源码内联转译。
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const at = (p: string): string => fileURLToPath(new URL(p, import.meta.url));

/**
 * Vitest 5 硬约束：`sequence.groupOrder` 相同的 project 共用一个 worker 池，因此它们的
 * `maxWorkers` 必须相同，否则整轮直接报错退出。而 `fileParallelism: false` 会把 maxWorkers
 * 强制成 1，所以「必须串行」的 project 天生与「放开并行」的不同组。
 * 组间串行 ⇒ 快层总耗时 ≈ 组0 + 组1。
 */
const GROUP_PARALLEL = 0; // testkit / repo / compiler，同组共用池子，一律 maxWorkers:8
const GROUP_RUNTIME = 1; // runtime，maxWorkers:1
const GROUP_E2E = 2; // e2e，同上；排最后 ⇒ test:all 时先快后慢

export default defineConfig({
  test: {
    // reporter 是主进程的东西，只能挂根上（挂 project 里会被忽略）。
    reporters: ["default", at("./packages/runtime/test/support/assert-count-reporter.ts")],
    // runtime project 有 23 个测试文件、每个都引整套 runtime 源码，冷启动光 transform
    // 就要 ~40s（Vitest 自己的诊断：`transform 90%, re-done on every run`）。
    // fsModuleCache 把 transform 结果落到文件系统、跨运行与跨进程复用，热启动就不再重做。
    fsModuleCache: true,
    projects: [
      // ── 快层：零外部依赖、零 build ──────────────────────────────────
      {
        extends: false,
        test: {
          name: "testkit",
          root: at("./packages/testkit"),
          environment: "node",
          include: ["test/**/*.test.ts"],
          pool: "forks",
          maxWorkers: 8,
          isolate: true,
          sequence: { groupOrder: GROUP_PARALLEL },
        },
      },
      {
        // extends:false 钉死行为 —— v4 默认 false、v5 默认 true，不让版本悄悄改解析。
        extends: false,
        test: {
          name: "runtime",
          root: at("./packages/runtime"),
          environment: "node",
          include: ["test/**/*.test.ts"],
          // 一个 worker、串行：process.env(GDS2JS_RUN_OWNER) / stdout.write / exitCode 三处
          // 全局副作用因此不可能与别的文件抢。（Vitest 4 起 poolOptions 已移除，旧
          // singleFork / maxForks 的等价物是顶层 maxWorkers。）
          pool: "forks",
          maxWorkers: 1,
          fileParallelism: false,
          /**
           * isolate:false 不是妥协 —— ops 门本来就是一个进程、一份模块注册表、76 个 region
           * 顺序跑。实测 true 时每文件重建 worker+环境，23 文件 15.95s vs false 的 2.36s，
           * 而两者读数逐字相同（1509/0）。曾以为必须 true 的理由
           * （registerClass("Holder") 在 :2307 与 :3123 各登记一次）核实后不成立：nameClass 是
           * CLASS_REGISTRY.set(name, desc)，撞名只覆盖不抛，两处各用自己返回的 descriptor，
           * 全文没有按名字回查 "Holder"。当时的逐笔读数已归档（git show fa46a87:docs/ROADMAP.md）。
           *
           * 代价：跨文件的模块级脏状态不会被隔离兜住。
           */
          isolate: false,
          setupFiles: [at("./packages/runtime/test/support/setup.ts")],
          sequence: { groupOrder: GROUP_RUNTIME },
          testTimeout: 20_000,
        },
      },
      {
        extends: false,
        test: {
          name: "compiler",
          root: at("./packages/compiler"),
          environment: "node",
          include: ["test/**/*.test.ts"],
          // 三个同组 project 共用一个 worker 池，maxWorkers 必须一字相同（见文件头那道 Vitest 5 硬约束）。
          pool: "forks",
          maxWorkers: 8,
          isolate: true,
          fileParallelism: true,
          sequence: { groupOrder: GROUP_PARALLEL },
          testTimeout: 60_000, // 452 例真解析，给足余量
          hookTimeout: 60_000,
        },
      },
      {
        extends: false,
        test: {
          name: "repo", // 仓库不变量：只读、亚秒级、天然并发安全
          root: at("."),
          environment: "node",
          include: ["test/repo/**/*.test.ts"],
          pool: "forks",
          maxWorkers: 8,
          isolate: true,
          sequence: { groupOrder: GROUP_PARALLEL },
        },
      },
      // ── E2E 层：串行、缺二进制自动 skip ─────────────────────────────
      {
        extends: false,
        test: {
          name: "e2e",
          root: at("."),
          environment: "node",
          include: ["test/e2e/**/*.test.ts"],
          // 六支 E2E 门全部使用固定临时目录名（tmp/sc-gate、tmp/cli-native-check、
          // tmp/export-check、pkg-check），两支并发就互删；cli-native-check 还会改
          // process.env.GDS2JS_RUN_BUNDLE。这里放弃跨文件并行，换判定语义不被竞争污染。
          pool: "forks",
          maxWorkers: 1,
          fileParallelism: false,
          isolate: true,
          // js-runner 的 import specifier 无 query string，同进程重跑同一用例会命中
          // ES module cache 而静默产出空输出 —— 重跑等于假绿，所以钉死 0。
          retry: 0,
          sequence: { groupOrder: GROUP_E2E },
          // 只有 scriptc.test.ts 的全量模式会用 it.concurrent（各 id 独占 tmp/sc-gate/<id>/），
          // 上限 Math.min(4, cpus())。
          maxConcurrency: 4,
          testTimeout: 1_800_000, // scriptc build 单例上限 600s、export 1500s
          hookTimeout: 3_600_000, // cli-native 自动重建 zig+scriptc 可到 3000s
        },
      },
    ],
    // teardownTimeout 属于 NonProjectOptions（只能挂根上，挂 project 里 tsc 会报 TS2769）。
    // 给足时间是因为 E2E 各支门收尾要删自己铺出来的临时树（tmp/sc-gate/<id> 等）。
    teardownTimeout: 120_000,
  },
});
