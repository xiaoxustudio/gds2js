# gds2js

## 项目概述

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。
管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。
Tier 1 内不实现 `Node` / `SceneTree` 等引擎 API，遇到即抛 `unsupported`（D4）；Tier 2 按 `docs/TIER2.md` 分阶段解禁，已放行引擎类值的 `.new` 面（造实例仍在阶段三）。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。
核心技术：tree-sitter（WASM 语法，`tree-sitter-gdscript` submodule）、scriptc（AOT 出原生 exe）。

## 仓库结构（pnpm workspace + Turbo）

| 位置 | 内容 |
| --- | --- |
| `packages/runtime` | 运行时内核：值表示 / `ops.*` 动态路径 / `fast.*` 快路径、容器、UTF-32 String、Vector/Color、hash；GDScript 内建函数按族拆在 `runtime/builtin/*.ts`（`builtins.ts` 只剩再导出与两处 hook 接线），方法名与属性面按接收者种类拆在 `runtime/method/*.ts`（`methods.ts` 只留 `method()` 分派器），容器 / 打印 / `%` 格式化 / 型标注盖章拆在 `runtime/values/*.ts`（`values.ts` 只剩门面）；同族模块用目录、目录里不再重复前缀；host 宿主入口 |
| `packages/compiler` | parse（tree-sitter WASM→CST）→ lower(IR) → analyze → emit；`analyze/` 按判断维度分模块、入口 `analyze/index.ts`；`emit/` 按发射维度分模块、入口 `emit/index.ts`、每模块共享 `emit/context.ts` 的 `EmitContext`；`semantics/` 装 Godot 实测静态表；`compile/project.ts` 跨文件工程编译；`compile/ir-cache.ts` 内容寻址 IR 缓存；`tree-face.ts` 产物树唯一清单 |
| `packages/gds2js` | CLI（`src/cli.ts` 薄入口 + `src/cli/` 模块）+ 打包三模式（import/local/single）+ export（SEA/scriptc）；`src/version.ts` 是唯一版本字面量 |
| `packages/testkit` | 测试断言库 |
| `tools/` | 门脚本与生成器：`golden.mjs` / `compile.ts` / `release.mjs` / `cli-native.mjs` / `bench*` 等 |
| `corpus/cases/` | 语料用例 457 例（另有 `000-*` 探头，不入语料），逐例 golden 对账；工程用例带 `project.godot`，场景用例再带 `main.tscn` 第三格夹具 |
| `test/` | `repo/`（仓库不变量）+ `e2e/`（出货与语义门，逐支落点看目录）+ `support/` |

## 常用命令

```bash
pnpm install            # pnpm@12.13.0；开发机 Node >= 25（产物最低 Node >= 25）
pnpm gen:ws             # tree-sitter-cli 编 gdscript.wasm（先拉 submodule）
pnpm build              # turbo run build → packages/gds2js/dist/*
pnpm dev                # tsx 跑 CLI 源码
pnpm test               # 快层四 project（testkit+runtime+compiler+repo），零外部依赖
pnpm test:unit          # 只 runtime+compiler
pnpm test:e2e           # E2E 门全跑，缺外部工具自动 skip 并说明缺什么
pnpm test:all           # 两层全跑
pnpm typecheck          # turbo run typecheck + tsc -p tsconfig.test.json
pnpm test:golden        # 重跑/重生成 golden（要 GODOT_BIN）
pnpm release            # 版本一致性校验 → build → 门 → release/gds2js-<ver>-win64.exe(+.sha256)
pnpm bench / bench:ab / bench:godot / bench:scriptc   # 性能三把尺；收益只认 bench:ab 的 |t|≥2
```

E2E 外部工具落点：`GODOT_BIN` / `SCRIPTC_BIN` / `ZIG_CC` / `TS_SRC` / `GDS2JS_NODE_BIN`。

## 架构要点

- **seam 模式**：node 侧与原生 exe 的分岔口是同名的 `*.native.ts` 覆盖原文件（parser / ir-cache / bundle / exec / home 五处），其余源码一行不改；`tools/cli-native.mjs` 装配 scratch 树，zig cc（`-target x86_64-windows-gnu`）编 C shim，scriptc 出 exe。
- **tree-face**：`packages/compiler/src/tree-face.ts` 是产物树 / 内嵌 HOME 布局的唯一清单，三个消费者共用；`test:treeface`（`test/repo/`）对账，改产物树或 HOME 布局先跑它。
- **双轨值表示**（D1/D2）：编译期能定类型 → 原生直译（`fast.*`）；推断不出 / `Variant` → 装箱走 `ops.*`。int 分轨：安全整数内纯 Number、越界响亮抛错；装箱轨算术升 bigint 按 int64 回绕。
- **产物**：ESM `.mts`，带可擦除 TS 标注，Node 原生类型擦除直接跑；默认末尾 `await new Main().run()`，`--no-run` 关闭。

## 纪律（红线）

1. 语义只认 Godot 4.6.3 实测（**corpus golden 逐字节** + `tools/golden.mjs` 对账；历史 S 编号台账已归档到 git 历史的 `docs/SEMANTICS.md`）；**没测过的不许写进实现**——一律抛 `UnsupportedError`，绝不静默降级、不猜。钉版本只有一个字面量 `tools/lib.mjs` 的 `GODOT_PIN`：任何要落读数的工具（`golden.mjs` / `regen:*` 探头）落盘前先 `requireGodotPin()`，版本不符直接拒写，`test/repo` 的文档计数门③ 保证树里所有「Godot x.y.z」都跟着它一起搬。
2. **禁止自行添加语言特性、长短注释及说明注释等，除非我特意说明，否则直接禁止添加。** 存量注释的口径：**源码里只留纯函数的 `/** */` 文档注释**，其余（任务编号、读数依据、临时说明）不写；`case-table.ts` / `case-flags.ts` / `ucaps.ts` / `engine-classes.ts` 四张实测生成物的头注释由生成器产出，只能走 `pnpm regen:*`，别手删（`test:codegen` 会红）。
3. 测试文件只放 `packages/<pkg>/test/` 或根 `test/`，**绝不放进 `packages/*/src/`**（会被 `copyTreeTs` 扫进出货产物树）。
4. 版本戳：`packages/gds2js/src/version.ts` 与**五份** `package.json`（根 + 四包）必须一字一致（`pnpm release` 与 `test/repo/version-consistency` 双重校验）。
5. 任何语义改动：golden 必须逐字节不变；性能改动要有 `bench:ab` 配对读数才作数。

## 常驻操作口径（动代码或跑门之前先看这几条）

1. **两道引擎门不并跑** —— `test:golden-check` 与 `test:scriptc` 同跑会因 CPU 争用误报超时与漂移；报了超时先单跑点名的几格复现（`npx vitest run --project e2e golden-drift -t "00[1-6]-"`），别急着改 golden。
2. **长门在跑时别动 `corpus/cases/*`、别改源码** —— 门读的是盘面产物，改了就是拿两份不同的东西比对（假红）；停门要停干净，残留的 godot / node / scriptc 子进程能让三支门同时红。
3. **改 runtime 的发射形状或函数形状** —— 先 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc`（面探针），`pnpm release` 的第 2b 步就是它。
4. **新增 runtime 的导出名** —— 先 `pnpm build`：工程形状用例的产物 import 的是 `packages/gds2js/dist/runtime.mjs` 那份打包副本，不重建会报 `xxx is not a function`。
5. **改产物树 / 内嵌 HOME 布局** —— 先跑 `pnpm test:treeface`；三个消费者共用 `packages/compiler/src/tree-face.ts` 那一张清单。
6. **语义改动的验收** —— `corpus-diff` 逐字节 + `test:golden-check` 零漂移 + 三桶（静默错 / 崩溃 / 未实现）全 0；性能改动没有 `bench:ab` 配对读数就不动热路。
7. **出货** —— `pnpm release` 前先确认全量 scriptc 门零红（`GDS2JS_SCRIPTC_ALL=1 pnpm test:scriptc`，本机以小时计，四并发）；版本戳一致由 release 自己校验，漂了就红。
8. **重构的默认判据** —— `pnpm test:compile` 之后 `git diff --exit-code -- corpus/cases` 必须零漂移：它只对**已追踪**的产物敏感，正是「存量语义没变」的机器判据（新增用例走自己的 golden 基线）。

## 文档索引

- `docs/ROADMAP.md` — 已拍板决策（D1–D8、A–I）/ 阶段判据 / Tier 1 收口状态快照
- `docs/ARCHITECTURE.md` — 架构史与不变量（D8 正文：出货模型、阶段契约、模块布局、尺寸棘轮、依赖图纪律、发射面、实测出处）
- `docs/TIER2.md` — Tier 2（宿主与引擎 API、七个值类型、对象生命周期）的阶段、判据、取证清单与待拍板问题
- `docs/RUNTIME_API.md` — runtime ↔ emitter 契约（v1，签名冻结；覆盖面口径见 §0）
- `README.md` — CLI 用法、运行时打包模式、测试分层详解
- 历史逐笔台账与 S 编号语义基线（原 `docs/SEMANTICS.md` 与 ROADMAP 的逐笔流水）已归档，需要时 `git show fa46a87:docs/SEMANTICS.md` / `git show fa46a87:docs/ROADMAP.md` 取回
