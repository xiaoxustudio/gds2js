# gds2js

## 项目概述

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。
管线：tree-sitter CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。
不实现 `Node` / `SceneTree` 等任何引擎 API，遇到即抛 `unsupported`（D4）。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。
核心技术：tree-sitter（WASM 语法，`tree-sitter-gdscript` submodule）、scriptc（AOT 出原生 exe）。

## 仓库结构（pnpm workspace + Turbo）

| 位置 | 内容 |
| --- | --- |
| `packages/runtime` | 运行时内核：值表示 / `ops.*` 动态路径 / `fast.*` 快路径、容器、UTF-32 String、Vector/Color、hash；host 宿主入口；`tree-face.ts` 产物树唯一清单 |
| `packages/compiler` | parse（tree-sitter WASM→CST）→ lower(IR) → analyze → emit；`compile/project.ts` 跨文件工程编译；`compile/ir-cache.ts` 内容寻址 IR 缓存 |
| `packages/gds2js` | CLI（`src/cli.ts` 薄入口 + `src/cli/` 模块）+ 打包三模式（import/local/single）+ export（SEA/scriptc）；`src/version.ts` 是唯一版本字面量 |
| `packages/testkit` | 测试断言库 |
| `tools/` | 门脚本与生成器：`golden.mjs` / `compile.ts` / `release.mjs` / `cli-native.mjs` / `bench*` 等 |
| `corpus/cases/` | 语料用例 001–338，逐例 golden 对账 |
| `test/` | `repo/`（仓库不变量）+ `e2e/`（六支门）+ `support/` |

## 常用命令

```bash
pnpm install            # pnpm@12.9.0；开发机 Node >= 24.18（产物最低 Node >= 22.18）
pnpm gen:ws             # tree-sitter-cli 编 gdscript.wasm（先拉 submodule）
pnpm build              # turbo run build → packages/gds2js/dist/*
pnpm dev                # tsx 跑 CLI 源码
pnpm test               # 快层四 project（testkit+runtime+compiler+repo），零外部依赖
pnpm test:unit          # 只 runtime+compiler
pnpm test:e2e           # E2E 六支，缺外部工具自动 skip 并说明缺什么
pnpm test:all           # 两层全跑
pnpm typecheck          # turbo run typecheck + tsc -p tsconfig.test.json
pnpm test:golden        # 重跑/重生成 golden（要 GODOT_BIN）
pnpm release            # 版本一致性校验 → build → 门 → release/gds2js-<ver>-win64.exe(+.sha256)
pnpm bench / bench:ab / bench:godot / bench:scriptc   # 性能三把尺；收益只认 bench:ab 的 |t|≥2
```

E2E 外部工具落点：`GODOT_BIN` / `SCRIPTC_BIN` / `ZIG_CC` / `TS_SRC` / `GDS2JS_NODE_BIN`。

## 架构要点

- **seam 模式**：node 侧与原生 exe 的分岔口是同名的 `*.native.ts` 覆盖原文件（parser / ir-cache / bundle / exec / home 五处），其余源码一行不改；`tools/cli-native.mjs` 装配 scratch 树，zig cc（`-target x86_64-windows-gnu`）编 C shim，scriptc 出 exe。
- **tree-face**：`packages/runtime/src/tree-face.ts` 是产物树 / 内嵌 HOME 布局的唯一清单，四个消费者共用；`test:treeface`（`test/repo/`）对账，改产物树或 HOME 布局先跑它。
- **双轨值表示**（D1/D2）：编译期能定类型 → 原生直译（`fast.*`）；推断不出 / `Variant` → 装箱走 `ops.*`。int 分轨：安全整数内纯 Number、越界响亮抛错；装箱轨算术升 bigint 按 int64 回绕。
- **产物**：ESM `.mts`，带可擦除 TS 标注，Node 原生类型擦除直接跑；默认末尾 `await new Main().run()`，`--no-run` 关闭。

## 纪律（红线）

1. 语义只认 Godot 4.6.3 实测（`docs/SEMANTICS.md` 的 S 编号 + corpus golden）；**没测过的不许写进实现**——一律抛 `UnsupportedError`，绝不静默降级、不猜。
2. **禁止自行添加语言特性、长短注释及说明注释等，除非我特意说明，否则直接禁止添加。**
3. 测试文件只放 `packages/<pkg>/test/` 或根 `test/`，**绝不放进 `packages/*/src/`**（会被 `copyTreeTs` 扫进出货产物树）。
4. 版本戳：`packages/gds2js/src/version.ts` 与四处 `package.json` 必须一字一致（`pnpm release` 校验）。
5. 任何语义改动：golden 必须逐字节不变；性能改动要有 `bench:ab` 配对读数才作数。

## 文档索引

- `docs/ROADMAP.md` — 已拍板决策（D1–D5 等）/ 阶段计划 / 当前任务
- `docs/SEMANTICS.md` — Godot 4.6.3 实测语义基线（S 编号，裁判版本 4.6.3.stable.official.7d41c59c4）
- `docs/RUNTIME_API.md` — runtime ↔ emitter 契约（v1，签名冻结）
- `README.md` — CLI 用法、运行时打包模式、测试分层详解
