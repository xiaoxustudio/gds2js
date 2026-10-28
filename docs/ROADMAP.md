# gds2js 开发路线

> 目标：GDScript 4.x → JavaScript 的 **AOT 编译器 + 独立运行时**。
> 路线：**A（独立运行时），按 C→A 推进** —— 先纯语言层（Tier 1），引擎宿主后置。
> 裁判版本：**Godot 4.6.3.stable.official.7d41c59c4**（单一字面量在 `tools/lib.mjs` 的 `GODOT_PIN`，落读数的入口写盘前先验它）。
> 配套文档：`docs/ARCHITECTURE.md`（架构史与不变量）、`docs/RUNTIME_API.md`（runtime ↔ emitter 契约，签名冻结；覆盖面口径见它的 §0）、原 `docs/TIER2.md`（下一层的计划与判据；Tier 2 收口后归档，考古用 `git show ca95311:docs/TIER2.md`）。
>
> **2026-10-26 清理：本文只留决策、阶段判据与大任务。** §1.3 起的逐笔流水（原 1.3–1.275，约 2650 行）与
> `docs/SEMANTICS.md`（S 编号语义基线，约 1.5 MB）已从工作树删除，判据、门读数与出货状态一律以 §2 为准。
> 文中残留的 `S###`、`§1.3+` 与 `tmp/probe*` 指归档件里的编号与当时的探头目录，正文已无对应内容 ——
> 考古用 `git show fa46a87:docs/ROADMAP.md` 与 `git show fa46a87:docs/SEMANTICS.md`（`tmp/` 不入库，探头要重跑）。

## 0. 已拍板的决策（不再讨论，直接执行）

| 编号 | 决策 | 结论 |
| --- | --- | --- |
| **D1** | int 表示 | **分轨**（2026-09-25 修订）。**解箱轨**纯 Number：覆盖 2^53 内场景，越界**响亮抛错**、绝不静默回绕。**装箱轨**（Variant）载荷归一化为「2^53 内 number / 超出 bigint」，算术与位运算统一升 bigint 并按 **int64 回绕**，与 Godot 逐位一致。`str()` 靠标签区分 int/float。**"全面 BigInt" 依旧否决**（热路径差一个数量级）。 |
| **D2** | 值表示 | **类型驱动双轨**：编译期能定类型 → 原生直译；`Variant` / 推断不出 → 走 `ops.*`。 |
| **D3** | `await` 语义 | **直接降级为 JS `async/await` + Promise**。实测证明引擎强制"协程必须被 await"（读数与逐笔台账已归档，判定看 `corpus/` golden），所谓 async 传染**就是引擎自己的规则**，不是偏差。 |
| **D4** | 宿主深度 | **Tier 1：纯语言**。Tier 1 内不实现 `Node` / `SceneTree` / 任何引擎 API，遇到就抛 `unsupported`。Tier 2 按 `docs/TIER2.md`（已归档） 分阶段解禁，四阶段**已收口**：七个值类型整族进来（`Transform3D` 除外），`Node` / `Node2D` / `Control` / `Node3D` 四支基类的成员面、节点树、场景通知、分组与查不到节点的那几块 ERROR 都按实测落地；没量过的形状仍一律 `unsupported`。 |
| **D5** | 版本 | 钉 **4.6.3**。已实测：4.6.3 与 4.7 在本项目覆盖的语义上输出逐字节一致。 |
| **D6** | 七个值类型 | **不进 Tier 1**（2026-10-14 拍板）。`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB` 的构造式、静态名、方法、打印、哈希与序列化**照 D4 继续抛 `unsupported`** —— 补它们要的是整族值表示 + 方法面 + 序列化，不是登记一笔的事（逐笔读数已归档；整族方案见 `docs/TIER2.md`（已归档） 阶段二）。Tier 1 收尾因此只看「已实现面上的错值、过拦与解析期拒」。**Tier 2 阶段二已把这一族整族落地**（逐型逐字节对账），唯一没做的是 `Transform3D` —— 它不在 D6 那七支里，`Node3D.transform` 因此照旧响亮拒。 |
| **D7** | 延后队列的对象生命周期 | **不进 Tier 1**（2026-10-24 拍板，用户选的口径）。引擎把 `Callable.call_deferred` 排在**局部作用域的 RefCounted 实例**上那一支，在泵之前就随引用计数归零丢掉；复刻它要给脚本类实例做**确定性引用计数**，牵连释放后的打印、`is_instance_valid`、容器键、Callable 的等式与 hash 五处 —— 与 D6 同性质，是范围决定不是对账活。Tier 1 期间这一族**照跑不拦**；Tier 2 阶段三按 γ 收口（见 `docs/TIER2.md`（已归档））：释放时机的读数已取 —— 引擎把最后一个引用赋成 `null` 后**同一条语句之后**就 `is_instance_id_valid()` false、`instance_from_id()` null，`Node.free()` 同形；我们这边 `identity.ts` 的 `LIVE` 是强引用，要匹配它得做真引用计数（`WeakRef` 的回收时机测不出可复现 golden），所以"引用已全部放开"那一形照旧响亮拒，不静默降级。 |
| **D8** | 架构整改（2026-10-26 起，持续） | **分阶段渐进，不动出货模型**。八项落地：阶段契约显式化（只读 `AnalysisResult` + per-module `EmitContext`，拔掉跨阶段侧信道）、两个巨无霸按维度拆目录、`exports` 通配收成实测白名单、Godot 实测表归位 `src/semantics/`、`tree-face` 归位 compiler、发射面名表类型化钉在 runtime 真实导出面上、仓库不变量进门（`test/repo`）。后续追加：文件尺寸棘轮、依赖环登记册（现为空表）、四张实测生成表的 `regen:` 出处、裁判版本单一字面量 `GODOT_PIN`、同族模块改目录。**全文、不变量与被实测否掉的那条（barrel 拆公共/内部面）见 `docs/ARCHITECTURE.md`。** |

### 2026-10-03 拍板（CLI 出货形态）

| 编号 | 决策 | 结论 |
| --- | --- | --- |
| A | `--watch` | 保留轮询（一份实现两个 tier 通用；回退面是 `startWatch` 一个函数）。 |
| B | 出货形态 | 只出 `--dynamic`；`tools/cli-native.mjs` 的静态构建降级成 `--static` 后备（也编得过）。**（2026-10-17 作废：scriptc 0.3 删了 `--dynamic` 与内嵌引擎，只剩原生轨；当时的读数已归档。）** |
| C | SEA / `--pack node` | **先不删**，等 native CLI 出货并跑满一个门周期再议（任务 #27）。 |
| D | 压缩（原 #24） | **已落地（2026-10-03）**：scriptc 支 mode 1/3 走 scriptc 内置 `node:zlib`，mode 2 走 vendored zstd-codec（原本跑在 `--dynamic` 岛上 —— **0.3 起内嵌引擎被删，`export` 却还在给那一格发 `--dynamic`（已是未知选项），mode 2 要另开一轮量**）；保真口径见 §1.2。 |
| E | 未提交的 200 个文件 | 先打 checkpoint commit —— **已执行**（`aa91d20..9ea77d5` 一组）。 |
| F | 仓库形态 | **monorepo（pnpm workspace + Turbo `^2.11.7`）**：`packages/{runtime,compiler,gds2js}` 三包，**各包 TS 源码都在包内 `src/`**（`vendor/`、tsdown 配置留在包根）；turbo 只编排包级 `build`/`typecheck`，门保持根脚本原样；pnpm 钉 `12.8.1`（`packageManager`）。对外的 `gds2js` 包名、`gds2js/runtime|host|standalone` 说明符、dist 产物名与 scriptc 产物树脸**一字不变**。 |
| G | 架构整改（2026-10-03） | **全量 P0/P1/P2 主体**：seam 真源化、tree-face 清单+对账门、usesPackCodec IR 标志、exe 过期自动重建、emitter 删布局默认值、case-table 管线修复、host flush-on-error、paths 收敛、cli.ts 拆模块、`lower/double`→`shared/double`（明细已归档）。**生成物保持入库**：全部签入的 `main.gen.mts` 零字节变化；`case-table.ts` 接受生成器整文件重写（表体逐项一致，仅新增生成器头+逐条注释）。 |
| H | 发布形态（#29） | **A：只发 `gds2js.exe`**（2026-10-03 拍板）。scriptc 不进包：用户自备（同目录 `scriptc/`、项目里 `npm i -D scriptc`、或 `SCRIPTC_BIN`）。`pnpm release` 出 `release/gds2js-<ver>-win64.exe` + `.sha256`。B（含 scriptc 的 zip）实测代价：本机 scriptc 安装态 ~586 MB（LLVM codegen 44 MB + 主程序 27 MB + 各档 runtime 产物），弃。 |
| I | SEA（#27） | **保留**（2026-10-03 拍板）：`--pack node` 是 compress(2) 走 Node 原版 zstd 的保真路径，也是 scriptc 不可用时的备用打包器；维持现状，门里继续守着。 |

---

## 1. 计划表

### 1.1 分阶段路线（Tier 1 的原始记账，已收口）

那张带「进行中 / 2–3 周 / 30 用例」状态列的阶段表不再维护 —— 一次性读数跟着门改了口径，原文在归档件里：`git show fa46a87:docs/ROADMAP.md`。**今天还约束着工作的只有两条口径**：

- **性能（D2）**：先 benchmark 后优化；动热路要过三重护栏 —— 收益量化（`bench:ab` 配对读数，|t|≥2 才算收益）、golden 逐字节不变、校验值一致。
- **宿主与引擎 API 归 Tier 2**：阶段、判据与取证计划见 `docs/TIER2.md`（已归档）。

### 1.2 native CLI / scriptc 迁移（2026-10-03，已收口）

各道门当时的读数（cli-native / diff / ops / ir / sema / pkgmodes / export 跑成多少）与现在的口径已不一致，一律删除 —— 要核对某一步的读数看提交正文与门自己。留下仍然生效的结论：

- **产品侧干净**：字符串操作三方（引擎 / node / scriptc 原生 exe）逐行、逐码元一致。当时记的两笔覆盖面账：静态宿主没有 node 侧那层 try/catch；`String.replace` / `find` / `capitalize` 那一轮尚未实现。
- **SEA 保留**（决策见 §0 I）：`--pack node` 是 compress(2) 走 Node 原版 zstd 的保真路径，也是 scriptc 不可用时的备用打包器；CLI 自身的 SEA 自打包已删，出货只剩原生 CLI 这一支。
- **压缩格**：scriptc 支 mode 1/3 走内置 `node:zlib` 静态降级，mode 2 走 vendored zstd-codec 的 asm 绑定。**保真口径**：语料逐字节对 golden；vendored zstd 与 Node 原版不同源，要 Node 原版 zstd 就走 `--pack node`。代价：带压缩的产物体积明显上涨、岛上 asm 解释执行慢。
- **版本戳后来补上了**：`packages/gds2js/src/version.ts` 是唯一字面量，跨包一致性由 `test/repo` 的门与 `pnpm release` 双重校验（当年「版本戳刻意没做」那句话作废）。

## 2. 当前任务与待办

**Tier 1 收口状态**：Tier 1（纯语言层）按 §1.1 / §1.2 的判据**已收口**。下面是**带日期的门读数快照** —— 它只记录"当时核对到什么"，不作为当前状态的唯一来源（当前状态以跑门为准）。

- **引擎语义面**（最后核对 2026-10-27，钉 `GODOT_PIN`）：`corpus-diff` 可执行者逐字节一致、三桶（静默错 / 崩溃 / 未实现）全 0；`golden-check` 全语料零漂移；全量 `pnpm test:e2e` 十个文件全绿（含 `codegen-drift`、`export`、`cli-native` 原生 exe 装配与 scriptc 面探针，无静默 skip）。快层：`pnpm test` 全绿、typecheck 四包干净、`test/repo` 不变量门全绿。
- **全量 scriptc 门**（上一轮全量核对）：出货面「编过 = 跑通 = 逐字节一致」，缺口按工具链能力**记账**两例（`161-pack-compress` 岛档、`371-property-delegation` 静态访问器），页数由 `test/repo/static-accessor-pages.test.ts` 钉住。
- **出货**（形态 A，scriptc 由用户自备）：`release/` 下的 win64 exe + `.sha256`；版本戳由 `pnpm release` 与 `test/repo/version-consistency` 双重校验。
- 架构整改（D8）之后的复验过程与不变量见 `docs/ARCHITECTURE.md`；逐笔流水与 S 编号语义基线已归档（`git show fa46a87:docs/ROADMAP.md`、`git show fa46a87:docs/SEMANTICS.md`）。

**Tier 1 之后 → Tier 2**

阶段划分、每阶段判据、需要新实测的取证清单与 harness 改造，全部收在**原 `docs/TIER2.md`**（已归档，考古用 `git show ca95311:docs/TIER2.md`）。原先这里散着的七条已经并入它的阶段表：引擎类值的属性面（读数已全，阶段一）、七个值类型（D6，阶段二）、宿主与引擎 API + 延后队列的对象生命周期（D4/D7，阶段三）、超时件的退出形状、性能账（D2）。**`hash(Callable)` 已定案不追**，见 §3。

**已结清的台账**：Tier 1 期间的决策类待办（SEA 保留、身份合成号与 RID、形态 A 与 `pnpm release`、`engines.node` 底线、缺口/覆盖面各族的读数账、开工清单与备忘）逐条已闭合，或转成 `docs/TIER2.md`（已归档） 的大任务；原文与每格原始读数在 `git show fa46a87:docs/ROADMAP.md`。

**常驻操作口径**：已搬进 `AGENTS.md`（动代码或跑门之前先看那几条）。

## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— **Tier 1 内**遇到就抛 `unsupported`；Tier 2 阶段三已按实测解禁四支基类成员面、节点树、场景通知与分组查询（`docs/TIER2.md`（已归档）），没量过的形状照旧拒
- **七个值类型**（`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`）—— 按 D6 不进 Tier 1；Tier 2 阶段二已整族落地（构造式、静态名、方法、打印、哈希与序列化逐字节对账），`Transform3D` 是唯一还没做的值类型，因此 `Node3D.transform` 照旧响亮拒
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- **`hash(Callable)` 的数值**（2026-10-25 定案「不追」，从待办改判决）—— 引擎那三支哈希都从 `get_instance_id()` 的指针派 int64 算出（S661：同批第二个实例差 1.6e10），方法 / 静态两支五候选式子全拟合不出，lambda 两支每进程换数；逐字复刻这条路根本不存在，本层对该名一律响亮拒。
- 性能优化 —— 先要正确；benchmark 读数已出（归档件），真要动优化走 §1.1 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
