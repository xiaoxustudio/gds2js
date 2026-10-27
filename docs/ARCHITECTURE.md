# 架构史与不变量（D8 的正文）

> 为什么有这个文件：D8「架构整改」的结论是一行字，但它的**过程与不变量**是七轮追加塞进 `docs/ROADMAP.md` §0 表格的一个巨格里长出来的 —— 单行撑到三千多字符，里面同时留着已经改错的模块数、已经改名的文件、和宣布自己改名的最后一段。表格单元不适合承载历史，所以搬到这里。
>
> **口径**：本文只写**结构事实与不变量**，不写会被下一轮改动带偏的读数（模块份数、名表条数、字面量出现次数一律不写死，交给门与代码）。要查某一步的门读数，看提交正文与 `test/repo/` 的门自己。
> 决策本身（D8 = 分阶段渐进、不动出货模型）仍在 `docs/ROADMAP.md` §0，那一行只留指针。

## 1. 出货模型不变量（改之前先读这段）

- **源码即出货**：`runtime` / `compiler` / `gds2js` / `testkit` 四包全部 `noEmit`，`exports` 直指 `.ts`。不引入 dist 层、不加 project references（composite 会强制 emit，与这条冲突）。seam 覆盖、`copyTreeTs` 铺树、scriptc 编源码图、HOME 内嵌，全建在这条之上。
- **不新增第五个包**：`tools/cli-native.mjs` 的复制清单与「把 `@gds2js/<pkg>/<subpath>` 相对化」的正则都只认 runtime/compiler（外加 gds2js 自身），新包会在原生轨上静默炸；层位错位一律用**目录**解决（`src/semantics/`、`src/analyze/`、`src/emit/` 都是这么来的）。
- **同族模块用目录，目录里不重复前缀**：`runtime/method/`、`runtime/builtin/`、`runtime/values/`、`analyze/checks/`。入口门面文件（`methods.ts`、`builtins.ts`、`values.ts`）位置与公共面不动 —— 消费者说明符不变，`exports` 白名单也不变（这些家族模块本来就只被相对引用）。
- **产物树是封闭清单**：唯一真源 `packages/compiler/src/tree-face.ts` 的 `TREE_FACE`，字符串值就是出货布局本身，动它 = `test:pkgmodes` / `test:scriptc` / `test:export` 同时漂。改布局先跑 `pnpm test:treeface`。
- **src 里不许有测试**：会被 `copyTreeTs` 扫进出货产物树（门 `no-test-in-src`）。

## 2. 阶段契约（`parse → lower → analyze → emit`）

- `analyze()` 不再把状态借进程级黑板或模块级 `let` 交给发射器：一次分析封成一个只读 `AnalysisResult`（`packages/compiler/src/analyze/analysis-result.ts`），发射侧只经它取事实（`posReadLabel` / `boundFace` / `isDictIntRead` / `isGlobalValueRead` / `isNativeClassValueRead` / `isHostMethodValueRead` / `lambdaCaptureNames`）。曾经的侧信道 `useMarkOwner()` 与 IR 上的 `markOwner?` / `hostChain?` 已拔掉；`usesPackCodec` 从可选侧信道改成 lower 必产字段。
- 诊断键的模板字面量（`owner#行:列`）是**产物稳定性的来源**，改它 = 全语料漂移。
- 边界由门守着：`test/repo/phase-boundary.test.ts`（emit 只准引 analyze 的契约、阶段目录不许被单文件吞掉、`beginEmit` 统一复位）—— 它扫的是**递归**的目录树，新加子目录不会漏检。

## 3. 模块布局（谁拆成了什么）

| 原形 | 现在 | 为什么 |
| --- | --- | --- |
| `lower/analyze.ts`（六千行单文件） | `analyze/`：`index`（编排与封存）+ `state`（一次分析的可变状态与 `Scope`）+ `walk` + `faces` + `slots` + `arity` + `literals` + `checks/`（按判断维度四份）+ `analysis-result` | 按判断维度分文件，拆完每份都能独立读懂；拆分是**机械剪切**，前提是 §2 的契约先立 |
| `emit/emitter.ts`（三千多行，42 个顶层 `let`） | `emit/`：`index` + `context`（`EmitContext` + `beginEmit`）+ `surface` + `abi` + `layout` + `helpers` + `class` + `func` + `init` + `stmt` + `expr-boxed` + `call` + `sourcemap` | 顶层 `let` 先收进 per-module 的 `EmitContext` 再拆文件，否则拆完就是六份文件共享一份脏状态 |
| Godot 实测静态表住在分析过程里 | `compiler/src/semantics/`（含 `arg-types/`） | 层位错位：它们是「编译期拒绝判断」数据，不是分析算法 |
| `runtime/tree-face.ts` | `compiler/src/tree-face.ts` | 三个消费者都是 CLI/tools/门，没有一个是 runtime 行为 |
| `runtime/values.ts` / `methods.ts` / `builtins.ts`（三个巨无霸） | 门面 + `values/`、`method/`、`builtin/` 三族 | 见 §4、§5 |
| Tier 2 阶段零：`analyze/checks/collections.ts`、`lower/lower.ts`、`runtime/values/core.ts`（预算顶格，加不进行） | `checks/collections/{typed,index-slots,var-assign,pack,method-arity}.ts` + `lower/{cst,lit}.ts` + `values/containers.ts` | 顶格的登记文件要先减才能加；切的全是**只被引用、不反向引用**的叶子簇，`collections` 与 `values/core` 拆完直接删登记（没有单文件超线），`lower.ts` 封顶跟着降。互递归的一族（lower 的 expr/pattern/arm）刻意不搬 —— 搬出去就是把同文件内的互递归变成跨模块值环。core 里两处**构造**容器改用 `registerContainerFactories` 注入断开，其余 `as GArray` 只是型标注、不计值边，`module-cycles` 仍空表。同目录的新模块必须一并进 `compile/ir-cache.ts` 的 `STAMP_SOURCES`，否则 IR 缓存戳静默失效 |

拆分的**验收姿势**（每步都一样）：产物逐字节不变（`pnpm test:compile` + `git diff --exit-code -- corpus/cases`）→ typecheck → 快层 → treeface/codegen → 出货面门。搬迁一律逐字照搬，不改写成表驱动：把 `switch (name)` 换成查表是**语义改动**，得重新实测。

## 4. 尺寸预算（棘轮，只降不升）

`test/repo/file-budget.test.ts` 四件事：登记过的超大文件不得再长；超过 1500 行的手写码必须登记并解释为什么不能拆；豁免清单里的表要真的还是表；无生成器的数据表只能是有登记的那几份（现为零 —— 四张实测生成物全有可重算出处）。

口径要点：**1500 这条线只管 `packages/*/src`**，它是出货面门；`test/` 与 `packages/*/test/` 里的巨型实测表用例不在这道门射程内，要钉测试尺寸得另开门。出货源码树里目前唯一超过这条线的文件是 `runtime/ucaps.ts`，因为它是生成表而不是手写码。

## 5. 依赖图纪律

- `test/repo/module-cycles.test.ts` 算的是 **runtime 内部的价值环**，且**只数价值边**：`import type` 与整串都是类型的说明符不算边（`packed ↔ values` 那组历史上被登记的环，实为一条类型边）；反过来，`export { x } from "./m"` **算边** —— 它和被 import 一样会让 `./m` 求值。这道门曾经只认 `import`，是拆分过程中自己暴露的漏洞。
- 登记册现为空表：runtime 内部**一个价值环都没有**。这是棘轮 —— 新环出现就红，不许写进登记表绕过。
- 真存在的双向语义（`Callable` 调用要回 `method()` 分派器）不靠环解决，靠**注入**：`registerMethodDispatch` 与既有的 `registerBoundSnapshotHook`、`registerClassFaceCheck` 同一先例。没注册就响亮抛错，不静默退化。
- 拆文件的可行性判据是**函数级价值 SCC 的可达闭包**：被核内引用到的东西搬不走（`method()` 与 `Callable` 族互指，所以分派器和 Callable 留在同一模块，靠注入解）。
- 门面模式（`methods.ts` / `builtins.ts` / `values.ts` 只剩具名再导出）的意义：**内部名不泄漏到 barrel，公共名一个不少**。这条由 `emit-surface` / `emit-contract` 两道门与一次导出面清单核对共同保证。

## 6. 发射面契约

- runtime ↔ emitter 之间过去是几百个无类型字符串拼名。现在四张名表（`rt.*`、`fast.*`、`ops.*`、`rt.V.*`）用 `satisfies readonly RtName[]` 钉在 runtime 的真实导出面上（`emit/surface.ts`）：拼错名字、runtime 改名，**typecheck 直接红**。
- 说明符形状：跨包只写 `@gds2js/<pkg>/<subpath>`。裸包名形式（`@gds2js/runtime`）会在 `cli-native` 的相对化步骤上 fail-fast（曾经真炸过一次，之后补了门 `specifier-shape`）。
- 产物侧另有一道门逐名对账：产物里出现的每个 `rt.<名>(` / `rt.ops.<名>(` / `rt.fast.<名>(` / `rt.V.<名>(` 都必须在导出表上；`emit-contract` 双向锁（emitter 源码 ⊆ 名表 ⊆ runtime 导出，且不得超出产物实际用量）。

## 7. 实测出处与裁判版本

- **语义只认 Godot 4.6.3 实测**；没测过的行为一律 `UnsupportedError`，不猜、不静默降级（红线 1）。
- 钉住的版本只有一个字面量：`tools/lib.mjs` 的 `GODOT_PIN`。任何会**落盘读数**的入口（`tools/golden.mjs`、`regen:*` 的探头）在写之前先 `requireGodotPin()`，裁判引擎自报版本不符就拒写 —— 起因是本机 PATH 上那个 `godot.exe` 自报另一条版本线，同一条命令换引擎照样跑通，读数却换了来源。
- 五张实测生成表由生成器产出头注释与表体，只能走 `pnpm regen:*`，手删头部会让 `test:codegen` 红：`case-table`、`case-flags`、`ucaps`、`engine-classes`。生成机制的分工是「探头（跑 Godot 落读数）/ 纯计算渲染 / 写盘」三段，漂移门复用中间那段而不写盘。
- `compiler/src/semantics/` 那批表同样是 Godot 实测面，但目前是**手抄、无生成器** —— 这是已知薄弱点，Tier 2 新增的成员面表要求带探头与漂移门（见 `docs/TIER2.md`）。

## 8. 注释与文档口径

- 源码里只留纯函数的 `/** */` 文档注释；任务编号、读数依据、临时说明不写。生成表头部注释由生成器产出。
- 文档分工：`AGENTS.md` = 纪律与命令（门的措辞契约在这里，例：语料计数句是 `doc-counters` 的正则目标）；`docs/ROADMAP.md` = 决策与阶段判据；本文 = 架构史与不变量；`docs/RUNTIME_API.md` = runtime ↔ emitter 契约；`docs/TIER2.md` = 下一层的计划。逐笔流水与 S 编号语义基线已归档，考古用 `git show fa46a87:docs/ROADMAP.md` 与 `git show fa46a87:docs/SEMANTICS.md`。
