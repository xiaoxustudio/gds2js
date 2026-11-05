# gds2js

## 项目概述

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。
管线：手写递归下降 CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。
Tier 1 内不实现 `Node` / `SceneTree` 等引擎 API，遇到即抛 `unsupported`（D4）；Tier 2 四阶段**已收口**：D6 那七支值类型加 `Transform3D` 共八支整族落地、引擎类实例构造与成员面放行（`Node` / `Node2D` / `Control` / `Node3D` 四支基类 + 类体裸名读写，`Node3D.transform` 与 `global_*` 按不在树里那一形落地）、节点树与场景通知路线打通（`.tscn` 编译期展树 + `sceneRun` 帧环 + 分组查询），没量过的形状仍一律 `UnsupportedError`（D7 引用计数按 γ 记档，归 Tier 4 收口）。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。
**Tier 3（宿主 API 族）已收口**：`JSON` 面按实测落地（`stringify` 的两支浮点印法与排序 / pretty、`parse_string` / `parse` / `get_data` / `get_error_*` 的成功路径、实例打印与 `is` / `is_class` 链），解析失败那一形连同引擎 ERROR 的消息集**还没实测完，照旧响亮拒**；`FileAccess` / `DirAccess` 走宿主能力表 `HostIo`（`host.ts` 注册的那张 `node:fs` 表三轨共用；`FileAccess` 的 `READ_WRITE(3)` / `WRITE_READ(7)` 按 4.6.3 实测放行——WRITE_READ 开已存在文件即截断、READ_WRITE 从不建文件（缺就 null + 7），交错写对同目录的另一个句柄即时可见（写穿透到盘面）（scriptc 轨实测 `node:fs` 读数与 node 轨逐字节一致）；`user://` 解到 `%APPDATA%/Godot/app_userdata/<config/name>`，`res://` 与裸相对路径一律 `UnsupportedError`）；`RegEx` / `RegExMatch` 按实测 pattern 白名单放行（名单外的字面量与运行期字符串都在 `compile()` 就响亮拒，文本实参按实测：`\w` / `\d` 是 ASCII-only（与 JS 一致）、`$` 认末尾换行前，孤立代理与 `\s` 遇非 ASCII 仍拒）；`Marshalls` 经实测在 GDScript 里根本不可达（引擎单例，静态调用解析期就拒）→ 划出范围；`Engine` 是明示的非目标；`OS` 那一族只放行实测过的五格（`get_cmdline_user_args` / `get_environment` / `has_environment` / `get_name` / `set_environment`，走 `host-proc.ts` 那张进程能力表），其余照旧响亮拒；三族之外没量过的宿主 API 与引擎单例集中钉在 `packages/runtime/test/tier3-refusal-roster.test.ts` 那张定形拒绝清单上——实现了哪一格就得把哪一格划走。
**Tier 4（运行时完整性）**：目标是把 Tier 3 那张定形拒绝清单与 D7 引用计数逐格收口——只做「先实测、再放行 / 记账」的转换，不新增语言特性，也不扩引擎类面（更多节点类、资源系统、`await` / 协程不属本 Tier）。范围四组：① **D7 对象生命周期**：`runtime/method/object.ts` 的 `signal-flag-deferred`（`connect()` 的 `CONNECT_DEFERRED`）与 `runtime/method/callable.ts` 的 `callable-deferred-null`（空 `Callable` 的 `call_deferred()`），以及 `free` / `queue_free` 后引用、`disconnect` / `is_connected` 等未量过的形状；② **FileAccess / DirAccess 残余**：成员面（`get_pascal_string` / `seek_end` / `get_md5` / `set_big_endian` / `open_compressed`）、打开面（`READ_FLUSH(4)`、模式 0、第三实参 `allow_user_substitution`）、关闭后调用（`fa-closed` 的每方法 ERROR 块）与 `res://` / 裸相对路径两形；③ **RegEx / JSON 错误路径**：`rx-unicode-subject` / `rx-dollar-newline` / `rx-subject-encoding` / 白名单外 pattern，以及 `json-parse-failure` 的消息、行列与 `json-number-nan` / `json-key-sort` 残余；④ **OS / 引擎单例残余**：`get_cmdline_args`（两侧不同源）、`get_executable_path`、`set_environment`、`get_name` 等，`Engine` 与 `Marshalls` 仍明示非目标。
**Tier 4 的验收口径**：每一格先落 `corpus/` golden（Godot 4.6.3 逐字节），再改实现；实现一格就从 `packages/runtime/test/tier3-refusal-roster.test.ts` 划走一格，名单里不许留「已实现仍拒」的格子；错误路径与值分开记账——值可复现但引擎 ERROR 消息集复现不了（`fa-closed` 是模板），照旧 `UnsupportedError` 并把实测消息写进理由；语义改动过 `pnpm test:golden-check` 零漂移与 `git diff --exit-code -- corpus/cases`，动 runtime 发射形状先跑 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc`。
**Tier 4 的台阶**：4-1 对象生命周期（**已放行** `CONNECT_DEFERRED` 的 lambda / Node 目标：下一轮投递、目标 free 后静默跳过，语料 `491-signal-deferred`；空 Callable 的 `call_deferred()` 是 no-op，`var x: Callable` 的默认值改为空 Callable；RefCounted 方法目标按 `signal-flag-deferred-refcount` 照旧拒——Godot 会随对象回收丢掉回调，宿主持强引用会多印；Node 目标 `free()` 后连接惰性失效：`is_connected` / `has_connections` / `get_connections` 与发射都看不见它，方法 Callable 的 `is_valid()` 变假，语料 `500-signal-free-target`；`disconnect` 一个不存在的连接是引擎 ERROR 后继续，按 `signal-disconnect-missing` 记账）；4-2 文件与目录（**已放行** `seek_end`、`set_big_endian` 的 16/32/64 位整数与 `store_float` / `get_float` / `store_double` / `get_double` 的大端读写、`get_pascal_string` / `store_pascal_string`（4 字节长度前缀）与 `FileAccess.get_md5` 成功路径，`eof_reached` 改成读导致的内部标志，语料 `492-file-seek-end`、`498-file-endian-float`；打开模式 0 / 4 / 5 实测回 null + 31，已放行；`DirAccess.get_files_at` / `get_directories_at` 放行，语料 `493-da-statics`；pascal 长度前缀越界的脏读、`get_md5` 缺失文件、`get_files_at` 缺失目录仍拒；`get_files_at_absolute` 在 4.6.3 不存在（解析期拒），`open_compressed` 与 `fa-closed` 的消息集按工具链记账；余下成员面 / 路径前缀待量）；4-3 RegEx Unicode 面与 JSON 失败路径（**已放行** `$` 认末尾换行前（翻译成 `(?=\n?$)`）、`\w` / `\d` / `\b` 的 ASCII-only 语义与 JS 一致（非 ASCII 文本不再拒），语料 `495-regex-unicode`；非 BMP 文本按码位偏移（`u` 标志 + 码位/码元换算），语料 `501-regex-nonbmp`；`\s` / `\S` / `[\s]` / `[^\s]` 的 ASCII-only 空白集合（空格 / TAB / LF / CR / VT / FF），语料 `499-regex-space-ascii`；`JSON.parse` 第二实参、`JSON.stringify(NaN)` → `"null"`（引擎的一次性 WARNING 块不复刻），语料 `494-json-parse-keep`；孤立代理、白名单外 pattern、JSON 解析失败的消息集仍拒/记账）；4-4 OS 残余与名单清零（**已放行** `OS.get_name` 与 `set_environment`（设空串后变量仍在），语料 `496-os-env`；`get_cmdline_args` / `get_executable_path` 两侧不同源、`get_processor_count` 等未量格照旧拒；roster 已无「已实现仍拒」的格子）。四阶至此收口：实现格都有 `corpus/` golden 与 runtime 测试，记账格都写明实测出处与拒因。
**自举线（原 Tier 4，不占 Tier 编号）**：把 `packages/compiler/src` 翻成 GDScript 并以 `N+1` fixpoint 收口。判据入口：`pnpm test:bootstrap`（`test/e2e/bootstrap/` 的 convergence / portface / procface / fixpoint / corpusfixpoint 与各 `*fidelity` 差分门）、`test/repo/bootstrap-boundary`、`tools/bootstrap.mjs`；切片 golden 只能由 `pnpm regen:bootstrap-golden` 写盘，移植树参照只能由 `pnpm regen:bootstrap-tree` 从钉住的裁判引擎重写。夹具两处：`test/fixtures/bootstrap/slices/`（不入语料语义账）与 `test/fixtures/bootstrap/gdsrc/`（移植树 + `gdsrc.txt`）。
**自举线现状**：阶段零～四已收口；阶段五移植树的 `descent/` `lower/` `analyze/` `emit/` `compile/` 已装齐；阶段六判据①已过（`fixpoint` 门：N+1 产物与 TS 编译器逐字节相同），判据②的语料棘轮是 **335/343** 适用面（8 支浮点边界两侧文本拼法不同但值相同，按工具链记账），`corpusfixpoint` 只跑不写盘；未收口：错误路径的 CST 形状（`expect_*` 失败返回占位节点会改转储）、cli 余片、覆盖率 305/381。
**自举线的语言事实**（移植时绕不开的几条）：GDScript 没有 try/catch，`fail` 改成「置 `failed` + 记 `issues` + 调用点早返回」；Dictionary / Array 是引用语义，变异式 builder 可照搬；形参或局部叫 `rt` 会盖住发射器引入的运行时命名空间（`emit-prelude-shadow`）；模块类名由文件名派生，工程编译错成 `<派生名>Module` 以避免「一文件一类、类名同名」相撞。
**自举线的工具链记账**：`test:scriptc` 钉在 0.4.6（0.4.8 在本机运行时缺符号）；`161`（zstd 岛）、`371`（static var 读写器）、`487` / `488`（scriptc 无静态访问器 / initializer-less 静态字段的 lowering）四支按工具链记账，不计入零红。
核心技术：手写递归下降解析器（`packages/compiler/src/parse/descent/`，纯 TS，无 wasm 无 C）、scriptc（AOT 出原生 exe）。

## 仓库结构（pnpm workspace + Turbo）

| 位置 | 内容 |
| --- | --- |
| `packages/runtime` | 运行时内核：值表示 / `ops.*` 动态路径 / `fast.*` 快路径、容器、UTF-32 String、Vector/Color、hash；GDScript 内建函数按族拆在 `runtime/builtin/*.ts`（`builtins.ts` 只剩再导出与两处 hook 接线），方法名与属性面按接收者种类拆在 `runtime/method/*.ts`（`methods.ts` 只留 `method()` 分派器），容器 / 打印 / `%` 格式化 / 型标注盖章拆在 `runtime/values/*.ts`（`values.ts` 只剩门面）；**内置类一律住在 `runtime/class/<族>/<类>.ts`**，一支类的类体、构造、打印与方法面同处，七个族：`vector`（六支向量）、`shape`（`rect` = Rect2+Rect2i、`aabb`）、`orient`（`plane` / `quaternion` / `basis` / `transform2d` / `transform3d`）、`color`（`color` + `named` 表）、`bytes`、`identity`（`rid` / `node-path` / `signal` / `callable` / `native-class` / `null-object`）、`object`（`script-object` / `node` / `node2d` / `node3d` / `control` / `scene-tree` / `node-face`）、`host`（`json` / `regex` / `file-access` 含 GdDir）；两支面单列同目录模块是实测出来的取舍——`packed` 并入方法面会撞 1500 行预算线，`node` 并入方法面会造出 `node → node2d → node` 的价值环；同族模块用目录、目录里不再重复前缀；host 宿主入口 |
| `packages/compiler` | parse（手写递归下降→CST）→ lower(IR) → analyze → emit；`analyze/` 按判断维度分模块、入口 `analyze/index.ts`；`emit/` 按发射维度分模块、入口 `emit/index.ts`、每模块共享 `emit/context.ts` 的 `EmitContext`；`semantics/` 装 Godot 实测静态表；`compile/project.ts` 跨文件工程编译；`compile/ir-cache.ts` 内容寻址 IR 缓存；`tree-face.ts` 产物树唯一清单 |
| `packages/gds2js` | CLI（`src/cli.ts` 薄入口 + `src/cli/` 模块）+ 打包三模式（import/local/single）+ export（SEA/scriptc）；`src/version.ts` 是唯一版本字面量 |
| `packages/testkit` | 测试断言库 |
| `tools/` | 门脚本与生成器：`golden.mjs` / `compile.ts` / `release.mjs` / `cli-native.mjs` / `bench*` 等 |
| `corpus/cases/` | 语料用例 496 例（另有 `000-*` 探头，不入语料），逐例 golden 对账；工程用例带 `project.godot`，场景用例再带 `main.tscn` 第三格夹具 |
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

## 常驻操作口径（动代码或跑门之前先看这几条）

1. **两道引擎门不并跑** —— `test:golden-check` 与 `test:scriptc` 同跑会因 CPU 争用误报超时与漂移；报了超时先单跑点名的几格复现（`npx vitest run --project e2e golden-drift -t "00[1-6]-"`），别急着改 golden。
2. **长门在跑时别动 `corpus/cases/*`、别改源码** —— 门读的是盘面产物，改了就是拿两份不同的东西比对（假红）；停门要停干净，残留的 godot / node / scriptc 子进程能让三支门同时红。
3. **改 runtime 的发射形状或函数形状** —— 先 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc`（面探针），`pnpm release` 的第 2b 步就是它。
4. **新增 runtime 的导出名** —— 先 `pnpm build`：工程形状用例的产物 import 的是 `packages/gds2js/dist/runtime.mjs` 那份打包副本，不重建会报 `xxx is not a function`。
5. **改产物树 / 内嵌 HOME 布局** —— 先跑 `pnpm test:treeface`；三个消费者共用 `packages/compiler/src/tree-face.ts` 那一张清单。
6. **语义改动的验收** —— `corpus-diff` 逐字节 + `test:golden-check` 零漂移 + 三桶（静默错 / 崩溃 / 未实现）全 0；性能改动没有 `bench:ab` 配对读数就不动热路。
7. **出货** —— `pnpm release` 前先确认全量 scriptc 门零红（`GDS2JS_SCRIPTC_ALL=1 pnpm test:scriptc`，本机以小时计；并发默认 4，`GDS2JS_SCRIPTC_JOBS=<n>` 可提到核数）；版本戳一致由 release 自己校验，漂了就红。
8. **重构的默认判据** —— `pnpm test:compile` 之后 `git diff --exit-code -- corpus/cases` 必须零漂移：它只对**已追踪**的产物敏感，正是「存量语义没变」的机器判据（新增用例走自己的 golden 基线）。
9. **自举线的切片门** —— 动 `parse/` `lower/` `emit/` 任何一支形状后跑 `pnpm test:bootstrap`（`vitest run --project e2e bootstrap`）；切片的新 `godot.txt` 只能由 `pnpm regen:bootstrap-golden` 从钉住的裁判引擎写盘，别手抄。切片产出的撞墙读数（哪一支 `UnsupportedError`）决定阶段二的排序。 阶段五起移植树同属这把门：`test/e2e/bootstrap/portface.test.ts` 三面判据（工程编译得过、两次编译逐字节相同、bundle 产物 == `gdsrc.txt`），参照只能由 `pnpm regen:bootstrap-tree` 从钉住的裁判引擎重写。

## 文档索引

- `docs/` 整套已随 Tier 2 收口归档进 git 历史，取回：`git show 64cf250:docs/ROADMAP.md`（拍板决策 D1–D8 / A–I、阶段判据、收口快照）、`git show 64cf250:docs/ARCHITECTURE.md`（D8 正文：出货模型、阶段契约、模块布局、尺寸棘轮、依赖图纪律、发射面、实测出处）、`git show 64cf250:docs/RUNTIME_API.md`（runtime ↔ emitter 契约 v1，签名冻结）、`git show ca95311:docs/TIER2.md`（Tier 2 阶段与取证清单）、`git show fa46a87:docs/SEMANTICS.md`（S 编号语义基线与逐笔台账）。
- 归档件不再承载待办，它的判据本体全部有门守着：D8 不变量 → `test/repo/`（`tree-face` / `seam-count` / `module-cycles` / `phase-boundary` / `version-consistency` / `file-budget`）、契约面 → `test/repo/emit-surface` + `emit-contract`、语义 → `corpus/` golden + `pnpm test:golden` + `corpus-diff` 三桶、出货 → `test/e2e/export` + `cli-native` + 全量 `test:scriptc`。还开着的 D7 那一族已归 Tier 4 收口（见项目概述）：判据在代码里，`runtime/method/object.ts` 的 `signal-flag-deferred` 与 `runtime/method/callable.ts` 的 `callable-deferred-null` 两支 `UnsupportedError` —— 一律「没量过就响亮拒」，不准静默降级。
- `README.md` — CLI 用法、运行时打包模式、测试分层详解
