# gds2js

## 项目概述

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。
管线：手写递归下降 CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。

## 仓库结构（pnpm workspace + Turbo）

| 位置 | 内容 |
| --- | --- |
| `packages/runtime` | 运行时内核：值表示 / `ops.*` 动态路径 / `fast.*` 快路径、容器、UTF-32 String、Vector/Color、hash；GDScript 内建函数按族拆在 `runtime/builtin/*.ts`（`builtins.ts` 只剩再导出与两处 hook 接线），方法名与属性面按接收者种类拆在 `runtime/method/*.ts`（`methods.ts` 只留 `method()` 分派器），容器 / 打印 / `%` 格式化 / 型标注盖章拆在 `runtime/values/*.ts`（`values.ts` 只剩门面）；**内置类一律住在 `runtime/class/<族>/<类>.ts`**，一支类的类体、构造、打印与方法面同处，七个族：`vector`（六支向量）、`shape`（`rect` = Rect2+Rect2i、`aabb`）、`orient`（`plane` / `quaternion` / `basis` / `transform2d` / `transform3d`）、`color`（`color` + `named` 表）、`bytes`、`identity`（`rid` / `node-path` / `signal` / `callable` / `native-class` / `null-object`）、`object`（`script-object` / `node` / `node2d` / `node3d` / `control` / `scene-tree` / `node-face`）、`host`（`json` / `regex` / `file-access` 含 GdDir）；两支面单列同目录模块是实测出来的取舍——`packed` 并入方法面会撞 1500 行预算线，`node` 并入方法面会造出 `node → node2d → node` 的价值环；同族模块用目录、目录里不再重复前缀；host 宿主入口 |
| `packages/compiler` | parse（手写递归下降→CST）→ lower(IR) → analyze → emit；`analyze/` 按判断维度分模块、入口 `analyze/index.ts`；`emit/` 按发射维度分模块、入口 `emit/index.ts`、每模块共享 `emit/context.ts` 的 `EmitContext`；`semantics/` 装 Godot 实测静态表；`compile/project.ts` 跨文件工程编译；`compile/ir-cache.ts` 内容寻址 IR 缓存；`tree-face.ts` 产物树唯一清单 |
| `packages/gds2js` | CLI（`src/cli.ts` 薄入口 + `src/cli/` 模块）+ 打包三模式（import/local/single）+ export（SEA/scriptc）；`src/version.ts` 是唯一版本字面量 |
| `packages/testkit` | 测试断言库 |
| `tools/` | 门脚本与生成器：`golden.mjs` / `compile.ts` / `release.mjs` / `cli-native.mjs` / `bench*` 等；`tools/compat/` 生成兼容性矩阵数据 |
| `site/` | Godot API 兼容性站点：Vite + React 单页，数据由 `tools/compat/` 按钉住引擎导出后提交；不进 workspace / turbo / release |
| `corpus/cases/` | 语料用例 645 例（另有 `000-*` 探头，不入语料），逐例 golden 对账；工程用例带 `project.godot`，场景用例再带 `main.tscn` 第三格夹具 |
| `test/` | `repo/`（仓库不变量）+ `e2e/`（出货与语义门，逐支落点看目录；`e2e/bootstrap/` 是自举线那把切片级收敛门）+ `fixtures/bootstrap/slices/`（自举切片夹具，不入语义账）+ `fixtures/bootstrap/gdsrc/`（阶段五那棵逐步长大的移植树，带 Godot 参照 gdsrc.txt）+ `support/` |

## 常用命令

```bash
pnpm install            # pnpm@12.13.0；开发机 Node >= 25（产物最低 Node >= 25）
pnpm build              # turbo run build → packages/gds2js/dist/*
pnpm dev                # tsx 跑 CLI 源码
pnpm test               # 快层四 project（testkit+runtime+compiler+repo），零外部依赖
pnpm test:unit          # 只 runtime+compiler
pnpm test:e2e           # E2E 门全跑，缺外部工具自动 skip 并说明缺什么
pnpm test:all           # 两层全跑
pnpm typecheck          # turbo run typecheck + tsc -p tsconfig.test.json
pnpm test:golden        # 重跑/重生成 golden（要 GODOT_BIN）
pnpm regen:compat-api   # 用钉住的裁判引擎导出 API 骨架并合并状态（要 GODOT_BIN）
pnpm regen:compat       # 只重算兼容性状态与证据（不要 Godot）
pnpm site:dev / site:build / site:typecheck   # 兼容性站点（site/，不进 turbo / release）
pnpm release            # 版本一致性校验 → build → 门 → release/gds2js-<ver>-win64.exe(+.sha256)
pnpm bench / bench:parse / bench:ab / bench:godot / bench:scriptc   # 运行期收益只认 bench:ab 的 |t|≥2；解析期看 bench:parse 的耗时与节点总数两把
```

E2E 外部工具落点：`GODOT_BIN` / `SCRIPTC_BIN` / `GDS2JS_NODE_BIN`。

## 架构要点

- **seam 模式**：node 侧与原生 exe 的分岔口是同名的 `*.native.ts` 覆盖原文件（ir-cache / bundle / exec / home 四处），其余源码一行不改；`tools/cli-native.mjs` 装配 scratch 树，scriptc 出 exe（解析器是纯 TS，这条路上没有 C 也没有 FFI）。
- **tree-face**：`packages/compiler/src/tree-face.ts` 是产物树 / 内嵌 HOME 布局的唯一清单，三个消费者共用；`test:treeface`（`test/repo/`）对账，改产物树或 HOME 布局先跑它。
- **双轨值表示**（D1/D2）：编译期能定类型 → 原生直译（`fast.*`）；推断不出 / `Variant` → 装箱走 `ops.*`。int 分轨：安全整数内纯 Number、越界响亮抛错；装箱轨算术升 bigint 按 int64 回绕。
- **产物**：ESM `.mts`，带可擦除 TS 标注，Node 原生类型擦除直接跑；默认末尾 `await new Main().run()`，`--no-run` 关闭。

## 纪律（红线）

1. 语义只认 Godot 4.6.3 实测（**corpus golden 逐字节** + `tools/golden.mjs` 对账；历史 S 编号台账已归档，取回 `git show fa46a87:docs/SEMANTICS.md`）；**没测过的不许写进实现**——一律抛 `UnsupportedError`，绝不静默降级、不猜。钉版本只有一个字面量 `tools/lib.mjs` 的 `GODOT_PIN`：任何要落读数的工具（`golden.mjs` / `regen:*` 探头）落盘前先 `requireGodotPin()`，版本不符直接拒写，`test/repo` 的文档计数门③ 保证树里所有「Godot x.y.z」都跟着它一起搬。
2. **禁止自行添加语言特性、长短注释及说明注释等，除非我特意说明，否则直接禁止添加。** 存量注释的口径：**源码里只留纯函数的 `/** */` 文档注释**，其余（任务编号、读数依据、临时说明）不写；`case-table.ts` / `case-flags.ts` / `ucaps.ts` / `engine-classes.ts` 四张实测生成物的头注释由生成器产出，只能走 `pnpm regen:*`，别手删（`test:codegen` 会红）。
3. 测试文件只放 `packages/<pkg>/test/` 或根 `test/`，**绝不放进 `packages/*/src/`**（会被 `copyTreeTs` 扫进出货产物树）。
4. 版本戳：`packages/gds2js/src/version.ts` 与**五份** `package.json`（根 + 四包）必须一字一致（`pnpm release` 与 `test/repo/version-consistency` 双重校验）。
5. 任何语义改动：golden 必须逐字节不变；性能改动要有 `bench:ab` 配对读数才作数。
