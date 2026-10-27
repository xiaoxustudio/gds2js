# gds2js 开发路线

> 目标：GDScript 4.x → JavaScript 的 **AOT 编译器 + 独立运行时**。
> 路线：**A（独立运行时），按 C→A 推进** —— 先纯语言层（Tier 1），引擎宿主后置。
> 裁判版本：**Godot 4.6.3.stable.official.7d41c59c**（`F:/godot/Godot_v4.6.3-stable_win64_console.exe`）。
> 配套文档：`docs/RUNTIME_API.md`（runtime ↔ emitter 契约，签名冻结；覆盖面口径见它的 §0）。
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
| **D3** | `await` 语义 | **直接降级为 JS `async/await` + Promise**。实测证明 Godot 强制"协程必须被 await"（见 SEMANTICS §5），所谓 async 传染**就是 Godot 自己的规则**，不是偏差。 |
| **D4** | 宿主深度 | **Tier 1：纯语言**。不实现 `Node` / `SceneTree` / 任何引擎 API，遇到就抛 `unsupported`。 |
| **D5** | 版本 | 钉 **4.6.3**。已实测：4.6.3 与 4.7 在本项目覆盖的语义上输出逐字节一致。 |
| **D6** | 七个值类型 | **不进 Tier 1**（2026-10-14 拍板）。`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB` 的构造式、静态名、方法、打印、哈希与序列化**照 D4 继续抛 `unsupported`** —— 补它们要的是整族值表示 + 方法面 + 序列化，不是登记一笔的事（明细见 §1.131 与 §6 第 43 条⑪）。Tier 1 收尾因此只看「已实现面上的错值、过拦与解析期拒」。 |

| **D7** | 延后队列的对象生命周期 | **不进 Tier 1**（2026-10-24 拍板，用户选的口径）。引擎把 `Callable.call_deferred` 排在**局部作用域的 RefCounted 实例**上那一支，在泵之前就随引用计数归零丢掉（读数 `tmp/probe714/lifetime.mts` 四格：挂脚本字段的照跑、只活在局部的永不跑）；复刻它要给脚本类实例做**确定性引用计数**，牵连释放后的打印、`is_instance_valid`、容器键、Callable 的等式与 hash 五处 —— 与 D6 同性质，是范围决定不是对账活。Tier 1 期间这一族**照跑不拦**，差异记在第二百四十笔；Tier 2 接宿主时一并处理。 |

| **D8** | 架构整改（2026-10-26） | **分阶段渐进，不动出货模型**。三包 `noEmit` + `exports` 指 `.ts` 的「源码即出货」保持原样（seam 覆盖、`copyTreeTs`、scriptc 铺树、HOME 内嵌全建在这条不变量上），**不新增第五个包**（`cli-native.mjs` 的复制清单与相对化正则硬编码 runtime/compiler/gds2js，新包会静默炸原生轨）。落地八项：仓库不变量进门（`test/repo`：src 无测试、五处版本戳、seam 数、文档读数、IR 缓存戳）；`exports` 通配收成实测白名单；`tree-face` 归位 compiler；Godot 实测表从 `analyze.ts` 抽到 `src/semantics/`；`analyze()` 的 7 张进程级黑板 + 5 个模块级 `let` 封成只读 `AnalysisResult`，拔掉 `useMarkOwner` 与 IR 的 `markOwner`/`hostChain` 侧信道；`analyze.ts` 6011 行按判断维度拆 `src/analyze/`；emitter 的 41 个顶层 `let` 收进 per-module `EmitContext` 并拆 `emit/` 11 模块；发射面 204+22+22+8 个 `rt.*` 名字用 `satisfies readonly RtName[]` 钉在 runtime 真实导出面上（拼错即 typecheck 红），双向门 `emit-contract` 同时管源侧与产物侧。**measured 后否掉的一条**：runtime barrel 拆「公共面 / 内部面」—— 22 个模块只有 `vector4i`/`node-path`/`global-names` 三个对产物零贡献（收益 <6%），而 `product.ts`/`standalone.ts` 整体再导出该 barrel、产物又在**类型位置**经它取 `rt.Variant` 一类名字，按符号显式收窄会削掉类型面；判为高扰动低收益，维持整 barrel。**尺寸收口（D8 的后续，同一出货模型）**：`test/repo/file-budget` 用「登记预算只许降不许升 + 超 1500 必须登记 + 实测生成表另立一档」钉住文件尺寸；已落 `values.ts` 3592→2238（字符串族抽成 `numfmt` / `string-ops`）与 `methods.ts` 2928→59（1190 行的 `method()` 按接收者种类拆成 `method-object` / `method-array` / `method-dict` / `method-string`，另有 `method-core` / `method-access` / `method-bytes` / `method-callable` / `method-globals`），分支与 fallback 抛错顺序逐字照搬、不改表驱动（那是语义改动，要重新实测）；拆分顺带把 runtime 内部的**价值环清零**——`builtins↔convert↔methods` 随 `methods.ts` 变薄而消失，`module-cycles` 门也改成只数价值边（`import type` 边不算，`packed↔values` 那一组本是类型边），登记册现为空表；Callable 回 `method()` 的那一格按 `registerBoundSnapshotHook` 先例改成 `registerMethodDispatch` 注入，公共面 18 个名字零缩水；`builtins.ts` 1674→37（按族拆成 `builtin-args`（参数折算与共享常数）/ `builtin-hash`（murmur 与 `variant_hash`）/ `builtin-rand`（PCG）/ `builtin-cast`（字符串→数）/ `builtin-names`（型名与错误名）/ `builtin-array`（`Array()`/`range`/`dict_to_inst`）/ `builtin-math`（取整、min/max、clamp、近似）/ `builtin-geom`（三角、缓动、贝塞尔、角度）/ `builtin-ops`（`and`/`or`/`length`/身份与 RID 那几支），源文件只留再导出与两处 hook 接线，130 个公共名一个不少、barrel 没多泄一个内部名，价值环仍为零）。**出处收口**：最后一张无来源的表 `engine-classes.ts`（1053 个类名，`6e8be7b` 从 ClassDB 冻结来的）现由 `pnpm regen:engine-classes` 产出 —— 探头在无头 Godot 里跑 `ClassDB.get_class_list()`，1.2 秒报出 1053 个，与冻结表**逐字节相同**（差异只有生成器头部），`test:codegen` 第四条把它一起钉住，`file-budget` 的 `PROVENANCE_DEBT` 从此为空：四张实测生成物全有可重算的出处。**裁判版本收成单一字面量**：`tools/lib.mjs` 的 `GODOT_PIN="4.6.3"` 配 `requireGodotPin()`，挂在三个会落读数的入口（`golden.mjs`、`ucaps-probe`、`engine-classes-probe`）—— 本机 `F:\godot\godot.exe` 自报 4.7.stable，实测它能把读数用的引擎静默换掉，现在直接拒写；`test/repo` 文档计数门③ 再钉一层：树里 17 处「Godot 4.6.3」字面量必须全等于 `GODOT_PIN`。**尺寸收口补最后一刀**：`values.ts` 2238 行按实测的函数级价值 SCC（11 成员 / 1001 行，容器⇄相等⇄键⇄深拷贝⇄打印互指）切开——SCC 可达闭包锁住的那 1202 行留在 `values-core.ts`，无核内引用的 54 个声明 / 866 行搬到 `values-print.ts`（457）/ `values-format.ts`（423）/ `values-stamp.ts`（81），`values.ts` 缩成 5 行门面：**出货源码树（`packages/*/src`，实测生成表另立一档）里再无超过 1500 行的手写码文件**（`ucaps.ts` 那 2981 行是生成表，走 `regen:ucaps`；根 `test/` 与 `packages/*/test/` 的巨型用例文件不在 `file-budget` 的射程内，它是出货面门，要钉测试尺寸得另开门）。门面带来的 `export … from` 反向依赖同时暴露了环门自己的漏洞 —— 它原来只数 `import` 边，`export {x} from "./m"` 同样会让 `./m` 求值，现已计入，收紧后 runtime 内部价值环仍为零（`values ↔ values-print/format` 那一组新环是靠这层加严才被抓到、再用门面下沉解掉的）。**命名口径（2026-10-27）**：同族模块改用目录而不是 `-` 拼接 —— `runtime/method/`、`runtime/builtin/`、`runtime/values/`、`analyze/checks/` 共 26 份文件去掉前缀（`method-object.ts` → `method/object.ts`），三份入口门面位置与公共面不变，`exports` 白名单与跨包裸说明符零改动（这批模块本就只被相对引用）；`module-cycles` 与 `phase-boundary` 两道原来只扫一层的门同时改成递归，否则子目录里的模块会被静默漏检。 |

### 2026-10-03 拍板（CLI 出货形态）

| 编号 | 决策 | 结论 |
| --- | --- | --- |
| A | `--watch` | 保留轮询（一份实现两个 tier 通用；回退面是 `startWatch` 一个函数）。 |
| B | 出货形态 | 只出 `--dynamic`；`tools/cli-native.mjs` 的静态构建降级成 `--static` 后备（也编得过）。**（2026-10-17 作废：scriptc 0.3 删了 `--dynamic` 与内嵌引擎，只剩原生轨，见 §1.259。）** |
| C | SEA / `--pack node` | **先不删**，等 native CLI 出货并跑满一个门周期再议（任务 #27）。 |
| D | 压缩（原 #24） | **已落地（2026-10-03）**：scriptc 支 mode 1/3 走 scriptc 内置 `node:zlib`，mode 2 走 vendored zstd-codec（跑在 `--dynamic` 岛上 —— **0.3 起内嵌引擎被删，`export` 却还在给那一格发 `--dynamic`（已是未知选项），mode 2 要另开一轮量，见 §1.259**）；保真口径见 §1.2 的 P5。 |
| E | 未提交的 200 个文件 | 先打 checkpoint commit —— **已执行**（`aa91d20..9ea77d5` 一组）。 |
| F | 仓库形态 | **monorepo（pnpm workspace + Turbo `^2.11.7`）**：`packages/{runtime,compiler,gds2js}` 三包，**各包 TS 源码都在包内 `src/`**（`vendor/`、tsdown 配置留在包根）；turbo 只编排包级 `build`/`typecheck`，门保持根脚本原样；pnpm 钉 `12.8.1`（`packageManager`）。对外的 `gds2js` 包名、`gds2js/runtime|host|standalone` 说明符、dist 产物名与 scriptc 产物树脸**一字不变**。 |
| G | 架构整改（2026-10-03） | **全量 P0/P1/P2 主体**：seam 真源化、tree-face 清单+对账门、usesPackCodec IR 标志、exe 过期自动重建、emitter 删布局默认值、case-table 管线修复、host flush-on-error、paths 收敛、cli.ts 拆 10 模块、`lower/double`→`shared/double`（明细见 §1.3）。**生成物保持入库**：216 个 `main.gen.mts` 零字节变化；`case-table.ts` 接受生成器整文件重写（表体逐项一致，仅新增生成器头+逐条注释）。 |
| H | 发布形态（#29） | **A：只发 `gds2js.exe`**（2026-10-03 拍板）。scriptc 不进包：用户自备（同目录 `scriptc/`、项目里 `npm i -D scriptc`、或 `SCRIPTC_BIN`）。`pnpm release` 出 `release/gds2js-<ver>-win64.exe` + `.sha256`。B（含 scriptc 的 zip）实测代价：本机 scriptc 安装态 ~586 MB（LLVM codegen 44 MB + 主程序 27 MB + 各档 runtime 产物），弃。 |
| I | SEA（#27） | **保留**（2026-10-03 拍板）：`--pack node` 是 compress(2) 走 Node 原版 zstd 的保真路径，也是 scriptc 不可用时的备用打包器；维持现状，门里继续守着。 |

---

## 1. 计划表

### 1.1 分阶段路线（§5 原始记账）

> 状态列是当时的原文；当前推进状态与判据以 §1.2 与 §2 为准。

| 阶段 | 状态 | 一句话 |
| --- | --- | --- |
| P0 语义基线 | ✅ 已完成 | 差分测试台（golden/diff）、30 用例 golden、`await` 全部测实、4.6.3 vs 4.7 交叉验证。 |
| P1 契约与骨架 | 进行中 | IR schema、`ops.*` 签名、工程卫生（见 §2 的遗留清单）。 |
| P2.5 Emitter | 进行中 | IR → JS；v1 一律走 `ops.*` 动态路径，不做单态快路径。 |
| P2 运行时内核 | 进行中 | values / ops / 容器 / UTF-32 String / `show`+`repr`。 |
| P3 Emitter 与语言特性 | 2–3 周 | 表达式/语句发射、函数/类/继承、`super`、属性 setter/getter、`is`/`as`、signal。 |
| P4 `await` 与信号 | 1 周 | await → async 函数、`awaitSignal`、Signal 参数归一、`await <非信号>` 直译。 |
| P5 工程层 | 进行中 | 宿主入口（`gds2js/host`）、工程编译、打包三模式（import / local / single）。 |
| 5.5 性能（D2） | 进行中 | 先 benchmark 后优化；读数已出（§1.10：整体 5.2×，两格数组 kernel 仍慢于 Godot），优化未动。收益量化 + golden 逐字节不变 + 校验值一致三重护栏。 |
| P6 宿主与性能（Tier 2+） | 暂不启动 | 用户明确 Tier 1 纯语言优先；要开再单独评估。 |

### 1.2 阶段计划与判据（2026-10-03：native CLI / scriptc 迁移）

- **P0 ✅**：测量 + 9 项重构。判据：`--dynamic` 原生构建 0 error、`tsc --noEmit` 干净。
- **P1 ✅**：门转绿 —— `test:cli-native` **14/14**；node 侧 `test:diff` 142/142、
  `test:ops` 1322/0、`test:ir`/`test:sema` 216/216、
  `test:pkgmodes` 失败 0、`test:export` ok 15 / FAIL 0；并验证 exe 移开 scratch 后仍靠**内嵌的 33 份资产**出货。
- **P2 ✅（结论：产品侧干净）**：字符串操作三方（Godot / node / scriptc exe）逐行、逐码元一致。
  两笔覆盖面账记在 §2：① 静态宿主没有 node 侧那层 try/catch；② `String.replace/find/capitalize` 未实现。
- **P3 ✅**：出货定稿 —— 默认 `--dynamic`、README 有「不带 node 的 `gds2js.exe`」一节、
  版本戳刻意没做（留给出货流水线）。
- **P4 ✅（决策已拍，见 §0 I）**：SEA 退役决策（`--pack node` + `home.ts` 的 SEA 分支）—— 结论是**保留**：它是 compress(2) 走 Node 原版 zstd 的保真路径，
  也是 scriptc 不可用时的备用打包器，门里继续守着。CLI 自身的 SEA 自打包（`self-pack` / `build:self`）**已删**（2026-10-03）——出货形态只剩原生 CLI 这一支。
- **P5 ✅（2026-10-03 落地）**：压缩格（原 #24）—— scriptc 支 `compress()/decompress()` 全量转绿
  （mode 1/3 = scriptc 内置 `node:zlib` 静态降级；mode 2 = vendored zstd-codec 的 asm 绑定跑在岛上）。
  **保真口径**：语料逐字节对 golden；vendored zstd 与 Node 的 1.5.7 不同源（实测 155/180），
  要 Node 原版 zstd 就走 `--pack node`。代价：带压缩的产物 +~2.4 MB、岛上 asm 解释执行慢。

## 2. 当前任务与待办

**Tier 1 收口状态（2026-10-26）**：Tier 1（纯语言层）按 §1.1 / §1.2 的判据**已收口**。

- 全量 scriptc 门零红：`出货 280/282 编过、280/282 跑通、逐字节一致 280/282`，另 2 例按工具链能力**记账**（`161-pack-compress` 岛档、`371-property-delegation` 静态访问器），页数由 `test/repo/static-accessor-pages.test.ts` 钉住。
- `corpus-diff` 285/285 逐字节，静默错 0 / 崩溃 0 / 未实现 0；golden **446/446 零漂移**；`pnpm test` 27436 格 / 333 文件；typecheck 4/4；`test:cli-native` 20/20；正文门 143/143。
- **架构整改后的全量 e2e 复验（2026-10-27，钉 GODOT_BIN=4.6.3）**：`Test Files 10 passed (10)`、`Tests 1023 passed | 163 skipped`、72 分 24 秒；`corpus-diff` 446 格里 285 支可执行者逐字节一致、JS 侧 285/285 跑出结果、三桶（静默错 / 崩溃 / 未实现）全 0；`codegen-drift` 4/4（含新加的 `engine-classes` 一条）；`export` 出货门 ok 17 / 上游或环境记账 1 / FAIL 0；scriptc 面探针与 `cli-native` 原生 exe 装配（zig + scriptc 产出 9.6MB `gds2js.exe`）都在这轮里真跑过、没静默 skip。覆盖 D8 后续四笔拆分（values / methods / builtins 家族 + 打印格式化族）改动的出货 runtime 模块图。
- 出货（形态 A，scriptc 由用户自备）：`release/gds2js-0.1.4-win64.exe` + `.sha256`（`d72c4776…1a9316a6`）。0.1.1→0.1.2→0.1.3 分别是 `.new` 族修复与定形容器接收者那一笔；0.1.4 是让出货件与「源码只留纯函数文档注释」的清理后的源码一致（`ea7638f`，纯注释改动，`golden-check` 446/446 零漂移、`cli-native` 20/20 已证行为不变）。
- 历史逐笔流水（原 §1.3 起）与 S 编号语义基线（原 `docs/SEMANTICS.md`）已从工作树删除；要考古按 git 历史取回。

**Tier 1 之后（Tier 2 与待拍板，不在本层动代码）**

1. 宿主与引擎 API：`Node` / `SceneTree` / `class N extends Node`（D4；`SCRIPT_HOST_BASES` 已备好待接）。
2. 七个值类型 `Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`（D6：整族值表示 + 方法面 + 序列化）。
3. 延后队列的对象生命周期与确定性释放（D7）。
4. **引擎类值的属性面**：`RefCounted.new` / `Object.new` / `Node.new` / `Resource.new` / `FileAccess.new` / `GDScript.new` 当值。实测读数已全：六支同名同标签 `GDScriptNativeClass::new`、`typeof` 25、两次取值 `==` true、`get_method()` `new`、`is_valid()` true、`get_argument_count()` 0、`bind(1)` 后 −1、`.call()` 造得出实例（号按进程内分配，语料一律掩号再比）。**实现未接**，Tier 2 接宿主时照这份读数做，不必重量。
5. 18 页超时件的**退出形状**：引擎那侧入口被作废后走不到 `quit()`、永不退出，我们的宿主主循环自己收尾退 0 —— 对齐要动宿主 MainLoop 的寿命。
6. 性能（D2，含 AOT 装箱账）：仍守「没有 `bench:ab` 配对收益不动热路」；单态 / 去装箱的设计拍板不由代码侧决定。
7. `hash(Callable)`：**已定案不追**，见 §3。

**已结清的台账**：Tier 1 期间的决策类待办（SEA 保留、身份合成号与 RID、形态 A 与 `pnpm release`、`engines.node` 底线、缺口/覆盖面各族的读数账 0 / 0a / 0b / 0c、P1 开工清单 6–9、备忘 10–22）逐条已闭合，或转成上面「Tier 1 之后」的大任务；原文与每格原始读数在 `git show fa46a87:docs/ROADMAP.md`，语义基线在 `git show fa46a87:docs/SEMANTICS.md`。

**常驻操作口径（动代码或跑门之前先看这几条）**

1. **两道引擎门不并跑** —— `test:golden-check` 与 `test:scriptc` 同跑会因 CPU 争用误报超时与漂移；报了超时先单跑点名的几格复现（`npx vitest run --project e2e golden-drift -t "00[1-6]-"`），别急着改 golden。
2. **长门在跑时别动 `corpus/cases/*`、别改源码** —— 门读的是盘面产物，改了就是拿两份不同的东西比对（假红）；停门要停干净，残留的 godot / node / scriptc 子进程能让三支门同时红。
3. **改 runtime 的发射形状或函数形状** —— 先 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc`（57 秒面探针），`pnpm release` 的第 2b 步就是它。
4. **新增 runtime 的导出名** —— 先 `pnpm build`：工程形状用例的产物 import 的是 `packages/gds2js/dist/runtime.mjs` 那份打包副本，不重建会报 `xxx is not a function`。
5. **改产物树 / 内嵌 HOME 布局** —— 先跑 `pnpm test:treeface`；三个消费者共用 `packages/compiler/src/tree-face.ts` 那一张清单。
6. **语义改动的验收** —— `corpus-diff` 逐字节 + `test:golden-check` 零漂移 + 三桶（静默错 / 崩溃 / 未实现）全 0；性能改动没有 `bench:ab` 配对读数就不动热路。
7. **出货** —— `pnpm release` 前先确认全量 scriptc 门零红（`GDS2JS_SCRIPTC_ALL=1 pnpm test:scriptc`，本机 85 分钟～4.5 小时，四并发）；版本戳六处一字一致由 release 自己校验，漂了就红。
## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- **七个值类型**（`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`）—— 按 D6 不进这一层，构造式与成员照旧响亮拒
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- **`hash(Callable)` 的数值**（2026-10-25 定案「不追」，从待办改判决）—— 引擎那三支哈希都从 `get_instance_id()` 的指针派 int64 算出（S661：同批第二个实例差 1.6e10），方法 / 静态两支五候选式子全拟合不出，lambda 两支每进程换数；逐字复刻这条路根本不存在，本层对该名一律响亮拒。
- 性能优化 —— 先要正确；benchmark 读数已出（§1.10），真要动优化走 5.5 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
