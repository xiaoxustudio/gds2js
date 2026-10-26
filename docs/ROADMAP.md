# gds2js 开发路线

> 目标：GDScript 4.x → JavaScript 的 **AOT 编译器 + 独立运行时**。
> 路线：**A（独立运行时），按 C→A 推进** —— 先纯语言层（Tier 1），引擎宿主后置。
> 裁判版本：**Godot 4.6.3.stable.official.7d41c59c**（`F:/godot/Godot_v4.6.3-stable_win64_console.exe`）。
> 配套文档：`docs/SEMANTICS.md`（语义基线，全部为 4.6.3 实测）、`docs/RUNTIME_API.md`。
>
> 维护口径：本文件只留「决策 / 计划 / 当前任务 / 非目标」；实测语义记在 `docs/SEMANTICS.md`。
> 代码注释与本目录里的 `S\d+`、`§n` 指的是 `docs/SEMANTICS.md` 的行号（现有 S1–S204）与小节；对不上时以当期代码与门读数为准。

---

> **本文只留决策、阶段判据与大任务。** 2026-10-26 清理：§1.3 起的逐笔流水（原 1.3–1.275，约 2650 行）
> 与 `docs/SEMANTICS.md`（S 编号语义基线，约 1.5 MB）已从工作树删除 —— 判据、门读数与出货状态一律以本文 §2 为准，
> 要考古或核对某格的原始读数用 `git log -- docs/ROADMAP.md docs/SEMANTICS.md`（最后一次含全文的版本是 `fa46a87`）。

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
- `corpus-diff` 285/285 逐字节，静默错 0 / 崩溃 0 / 未实现 0；golden **446/446 零漂移**；`pnpm test` 27402 格 / 321 文件；typecheck 4/4；`test:cli-native` 20/20；正文门 143/143。
- 出货（形态 A，scriptc 由用户自备）：`release/gds2js-0.1.3-win64.exe` + `.sha256`。
- 历史逐笔流水（原 §1.3 起）与 S 编号语义基线（原 `docs/SEMANTICS.md`）已从工作树删除；要考古按 git 历史取回。

**Tier 1 之后（Tier 2 与待拍板，不在本层动代码）**

1. 宿主与引擎 API：`Node` / `SceneTree` / `class N extends Node`（D4；`SCRIPT_HOST_BASES` 已备好待接）。
2. 七个值类型 `Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`（D6：整族值表示 + 方法面 + 序列化）。
3. 延后队列的对象生命周期与确定性释放（D7）。
4. **引擎类值的属性面**：`RefCounted.new` / `Object.new` / `Node.new` / `Resource.new` / `FileAccess.new` / `GDScript.new` 当值。实测读数已全：六支同名同标签 `GDScriptNativeClass::new`、`typeof` 25、两次取值 `==` true、`get_method()` `new`、`is_valid()` true、`get_argument_count()` 0、`bind(1)` 后 −1、`.call()` 造得出实例（号按进程内分配，语料一律掩号再比）。**实现未接**，Tier 2 接宿主时照这份读数做，不必重量。
5. 18 页超时件的**退出形状**：引擎那侧入口被作废后走不到 `quit()`、永不退出，我们的宿主主循环自己收尾退 0 —— 对齐要动宿主 MainLoop 的寿命。
6. 性能（D2，含 AOT 装箱账）：仍守「没有 `bench:ab` 配对收益不动热路」；单态 / 去装箱的设计拍板不由代码侧决定。
7. `hash(Callable)`：**已定案不追**，见 §3。

**决策 / 发布类**

1. **#27 已决（§0 I）：SEA 保留。**
1. **身份数字（instance id / `<Base#id>` 打印 / RID / WeakRef）已决（2026-10-07，S262）：产物自造稳定合成号** —— 形状照引擎、号按进程内分配顺序发，语料里带号的格子一律掩号再比；引擎那边读数是 30 格两遍一字不差（`tmp/probe-ids/ids2-1.log`），但号**起点**是引擎选的，跨版本不保证，所以逐字复刻那条路不通。`hash(Callable)` 那一格因此继续欠着（它的数是从号算出来的）。**这一条已经花掉（S263，语料 260）**：`get_instance_id()` / `instance_from_id()` / `is_instance_valid()` / `is_instance_id_valid()` / `weakref()` 与 `<基类名#号>` 的打印都按这条口径发出了。**RID 那两支也跟着花掉了（S264，语料 261）**，但它不属于这笔合成号账：`rid_allocate_id()` 给的整数、`RID(n)` 的打印与 `hash(RID)` 都有固定读数（起点 13241、五格哈希与 4.3 的 `hash_one_uint64(get_id())` 一名一名对上），所以是逐字钉住的，不走掩号那条路。`hash(Callable)` 一支**已定案「不追」（2026-10-25，第二百五十二笔）**，理由与读数见 0b⑤，位置改到 §3 明确非目标 —— 它不再是「欠着」。
1. **2026-10-25 复述维持（按推荐方向那一轮逐条核过，四条都不动代码）**：**D4 纯语言宿主**照旧 —— `Node` / `SceneTree` / `class N extends Node` 一律响亮 `unsupported`，`SCRIPT_HOST_BASES` 继续备好待 Tier 2；**D6 七个值类型**不进（构造式、运算、成员名都照拦）；**D7 延后队列的对象生命周期**不进（`call_deferred` 随局部作用域释放丢弃只按量过的口径实现）；**性能**仍守「没有 `bench:ab` 配对收益不动热路」（S695 那次 `|t|=0.65` 就是照这条只记账不改码）。**从这四条里独立出来的一件新立项**：18 页超时件的**退出形状** —— 引擎那侧入口被作废后走不到 `quit()`、永不退出，我们的宿主主循环自己收尾退 0（两侧读数见第二百五十一笔 ③，这条差本身最早记在第二百四十九笔 ⑤；`export` 门 boom 那格判据也按这个口径改的），要对齐得动宿主 MainLoop 的寿命，属 Tier 2，不在本层顺手改。
2. **#29 已决（§0 H）：形态 A；`pnpm release` 已落地**（版本戳 0.1.0 起、`gds2js --version`、release/ 产物 + sha256）。
   许可备查：scriptc 是 Apache-2.0、无 NOTICE，随包分发本来允许（若将来改 B 再启用）。
3. ~~**#30** `engines.node`（25.7 只服务 `--pack node` 那支，位置可能写错了）~~ —— **已实测并改正（2026-10-03）**：
   猜测成立 —— ≥25.7 确实只属于 SEA 那一支，而且代码里 `SEA_MIN_NODE = "25.7.0"` 早就在运行期判并给明确拒（18/20/22/24 上都实测到那句 refusal），不该写进整包的 engines。
   前置条件也不用另装：本机 `D:/nvm` 里已有 v18.20.4 / v20.19.4 / v22.19.0 / v24.8.0，拿四支跑了一遍命令矩阵 ——
   `check` `check-project` `build` 在 18 与 20 也过；**`run` 在 18/20 炸**（`Unknown file extension ".mts"`）、**`build-project --runtime-mode single` 在 20 炸**
   （`Promise.withResolvers is not a function`，18 给的是 tsdown 的另一句）；**22.19.0 / 24.8.0 / 26.10.0 全过**，且三支的 `run` 输出逐字节相同、
   `export --pack scriptc` 在 22.19.0 上真打出 1.7 MB 的 exe 并跑得通。
   所以 engines 改成 **`>=22.18`**（根与对外 `gds2js` 两处一字一致；22.18 是 Node 默认开类型剥离的那条线，也是 `exec.native.ts` 里「产物要 node ≥ 22.18」既有的那句 —— 实测跑过的是 22.19.0，不是 22.18 本身）。
   README 的两处旧数字（"Node >= 25"、"tools/ 侧需要 ≥23.6"、产物那行的 ">= 22.6"）一并并到同一条底线：门脚本 `.mjs` 直接 `import` 包内 `.ts` 在 22.19.0 上不开任何旗标就能跑，23.6 那说是过严的。
   **互锁**：`pnpm release` 的第 1b 步校验「根 engines == gds2js engines == `exec.native.ts` 的那句数」，漂了就红。
   补测（同日续）：本机那颗 `node` 是启动器 shim，中途从 26.10.0 换成 **24.21.0** —— 五道 node 门 + pkgmodes + typecheck + build 在 24.21.0 上全绿（engines 那条底线因此多一档实机佐证），
   `pnpm release` 整链也跑通并出 `release/gds2js-0.1.0-win64.exe`。唯一跟着动的是 SEA 那几格的记账口径：`test:export` 在 24.21.0 上是 **ok 10 / 记账 3 / FAIL 0**，
   同一份代码 `GDS2JS_NODE_BIN` 指到 26.10.0 就是 **ok 18 / 记账 0 / FAIL 0**（比原记账口径还多跑通一格）—— 这是环境换版本的正常反应，口径已写进 README 的环境一节。

**缺口 / 覆盖面**

0. **2026-10-22 那份「下一轮开工清单」的 ①–⑦ 已全部结清**（核到 2026-10-26）：`class N extends Node` 按用户拍板维持 D4 不开禁；`hash(Callable)` 定案不追（见 §3）；装箱轨属性读落在值型基上那句已按裁判发出（S669，语料 416）；`H.new` 当值从 S673 起通，今天 `.new` 一族又补满五十形（含裸内建类型名当值、定形容器接收者）并随 0.1.3 出货；`pattern-arm-*` 行号、名册五名与括号字面量接收者三格复验均为过期账（代码零改动）。逐笔台账与 S 编号基线本轮随 docs 清理归档到 git 历史，考古用 `git log -- docs/`。

0a. **S616 的读数已量齐（七形，一脚本一形；探针 `tmp/probe569/g1..g9.gd`，生成器 `tmp/d6/gen616.mjs`）** —— 定形容器之间的赋值引擎全在解析期拒，我们一句都不发：
    - `var h: Array[String] = ["a"]` 之后 `var i: Array[RefCounted] = h` → `Cannot assign a value of type Array[String] to variable "i" with specified type Array[RefCounted].`
    - 反向（`Array[RefCounted]` → `Array[String]`）同式一句（g2）；`Array[int]` → `Array[float]`（g5）与 `Array[int]` → `Array[String]`（g6）**也照拒** —— 定形容器之间**没有任何放宽**，int→float 那一条标量式的转换在这里不成立。
    - 源是**不定型** `Array` 时引擎不在解析期发句，而是**运行期**一句：`Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".`（g3 推断的 `var u = []` 与 g4 标注 `var u2: Array` 同句，位置在赋值那一行）
    - 同型赋值 `var b: Array[int] = a` 收（g9 印 `[1]`）—— 判据是**标注文本相等**就不拒。
    实现落点：`analyze.ts` 里走定形容器声明那一趟（`for (const t of targets)`，已知目标标注 `Array[X]` 与 `t.init`），要补的是**标识符源**的解析 —— 把函数内已声明变量的标注文本攒成一张表（模块级的 `typedVars` 已有，局部要自己收），源标注与目标标注都是定形容器且文本不同 → 发 `Cannot assign a value of type <src> to variable "<name>" with specified type <slot>.`；源是 `Array` / `Dictionary`（无方括号）时**不在解析期发**，改由赋值路径发运行期那句。两侧都要过 `sema-wording-parity`（新增语料会是预期报错那批）。

    **复验结清（第一百八十七笔，尺 `tmp/probe662/s662.mts` 九格两侧对读）**：上面那套「标识符源」的判据**早已落地** —— `Array[String]`→`Array[RefCounted]`、反向、`Array[int]`→`Array[float]`、`Array[int]`→`Array[String]`、`Dictionary[int,String]`→`Dictionary[String,int]` 五格解析期同句同行；源是不定型的两格（`var u = []` 与 `var u2: Array`）两侧都在**运行期**给 `Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".`（我们那句一字一样）；同标注那格收下（`V|[1]`），字面量源那格仍是原来的两句式（`Cannot include a value of type "int" as "String".` + `Cannot have an element …`）。九格全对，无代码改动 —— 这一条待办与 ②‴ / ⑤ 同批属过期账。


0c. **契约文档的覆盖面配平（2026-10-25 数出来的新账，等拍板要不要动）**：`docs/RUNTIME_API.md` 顶上写的是「runtime 与 emitter 之间唯一的契约 · 签名冻结」，但把发射器实际用到的名字逐个数过去 —— `packages/compiler/src/emit/*.ts` 里 `rt.<名>(` 共 **192** 个不同名，改文档之前只有 **3** 个名字在文档里出现过（`Signal` / `range` / `reportRunFailure`），其余 **189** 个连词都没有；本轮把 S696 新加的 `formatOf` 补进去之后是 **4 / 188**（`ops.mod` 那一行不算：文档里写的是 `ops.mod`，与 `rt.mod` 不是同一个名）。尺是十行脚本（`tmp/probe724/api-audit.mjs`：抓 `rt\.[A-Za-z_]\w*\(` → 与文档词集做差）。这不等于文档写错了：文档按 `ops.*` / `fast.*` / 容器 / String / 对象类 / 信号这几类**只登记需要冻结形状的那一层**，其余是 runtime 内部导出的面。要拍的板是二选一：① 把文档口径改明「本契约只覆盖跨层冻结的形状，全量发射面以 `rt` 的导出表为准」并给一条**自动对账**（新门或 `test/repo` 里的一条不变量：产物里出现的 `rt.<名>` 必须在 runtime 导出表里存在）；② 真把 189 名的签名表补全（工作量与保鲜成本都高）。**① 的自动对账已落地**：新门 `test/repo/emit-surface.test.ts` 扫 443 份 `main.gen.mts`，把 `rt.<名>(` 与 `rt.ops.<名>(` / `rt.fast.<名>(` / `rt.V.<名>(` 两类调用点都收进来，逐个对 `import * as rt from "@gds2js/runtime"` 的导出表与那三张子表 —— 本轮读数 **246 个名（裸调用 195 + 带点 51）/ 缺 0**，门进 `pnpm test` 的 repo project（文件 2 支、格 4 格）。剩下的拍板只关乎**文档口径**要不要按 ① 写死，或按 ② 补表。本轮另把这两笔自己动过的补齐（§3 `ops.mod` 的 `soft`、§6 新增 `formatOf`，并落一行 v1 补记），其余不动。
   **口径已按 ① 写死（2026-10-25 第二百五十九笔）**：`docs/RUNTIME_API.md` §0 总约定添一行「覆盖面」—— 本契约只登记需要跨层冻结形状的那一层，全量发射面以 `rt` 的导出表为准并由 `test/repo/emit-surface.test.ts` 逐名对账，变更记录同步落一行 v1（补记 2）。**② 不采**（189 名签名表的保鲜成本高于收益），这一笔待办到此收口。

0b. **旧靶单（2026-10-21 收笔时留，①–④ 已随 S602–S604 结清，留文备查）**：
   ① **`Array(...)` 的签名矩阵**（S601 ⑤）：**已收口**（S663 第四参、S664 十六条臂、S665 标注变量源）—— 读数与门读数见第一百九十 / 九十一 / 九十二笔；剩下的是原条目末尾那句「整张矩阵」的备查文字，判据已按逐格量过的 22 形登记，未量的型配不上任何一行 → 照旧落运行期。   ② **`min` / `minf` 的 Vector4i 字面量位**（S598 ⑥）：**已结清（复验，`tmp/probe663` 七格两侧对读，代码零改动）** —— `min/minf/max/maxf(Vector4i(…), Vector4i(…))` 四支引擎全在解析期发 `Invalid argument for "X()" function: argument 1 should be "float" but is "Vector4i".`，我们同句同位（`4:14`）；`min(Vector4i, 2)` 混型那一格同句；对照两支 `clamp(Vector4i, Vector4i, Vector4i)` 给 `(1, 2, 3, 4)`、`wrapi(1.5, 0, 2)` 给 `1` 也都一致。
   ③ **cubic / bezier 六支的名字实参形**（S600 ⑤）：**读数已量齐，缺口定位到两处**（尺 `tmp/probe664` 十五格两侧对读）。合规支数那几格值全对：`cubic_interpolate(int/float 标注变量, …, 0.5)=1.25`、`bezier_interpolate=2.5`、`bezier_derivative=3.0`、`cubic_interpolate_in_time=0.466`；支数不足那一族两侧同句（`Too few arguments for "cubic_interpolate()" call. Expected at least 5 but received 4.` / in_time 报 8）。**缺口**：`var s: String` 放进首位时引擎发解析期 `Invalid argument for "cubic_interpolate()" function: argument 1 should be "float" but is "String".`，我们发的是 `argument 2`（取的是**第一处字面量**那位，名字实参那位没查），而 `bezier_interpolate` / `bezier_derivative` / `cubic_interpolate_in_time` 首位放名字时我们**一句都不发**、拖到运行期给 `Invalid type in utility function …`。**已随第一百八十八笔（S662）落地**：这四支进了「第一处命中」的扫描源（新名单 `CUBIC_NAME_ARG_FUNCS` + `nameArgBad`，只认标注非数值型），槽位升序取第一处的口径沿用原闸门；`clamp` / `lerp` / `wrap` 的名字形没量过照旧不进引擎在那些格只报第一处，报序也要照这个口径量。
   ④ **其余单变体全局函数的「容器要不要推迟」**（S600 ①）：**已复验结清**（`tmp/probe664`：`clamp([1],0,2)` / `lerp([1],[2],0.5)` / `wrap([1],0,2)` / `snapped([1],1)` / `max([1],2)` / `min([1],2)` 六格两侧**一字一样**走到运行期那句（`Invalid type in utility function "clamp()". Cannot convert argument 2 from int to Array.` / `Error calling utility function "lerp()": Argument "from" must be …` 那三种式子都对上）。代码零改动。
   ⑤ **`hash(Callable)`**（§2 第 1 条那笔旧账）：**定案长期拒** —— `tmp/probe661/fit3.mts` 量到 `get_instance_id()` 是高位为 1 的指针派 int64（`-9223372010866866769`，同批第二个实例差 1.6e10），方法/静态/lambda 三支的 Callable 哈希都随实例与名字变，是**对不上也不可能对上**的一族；lambda 那支引擎自己每进程换数。详见 S661 与其补正。
   六支的读数量法是现成的：一脚本一位一形（解析期句会让整个脚本停住，所以**一脚本一形**），运行期句用内部类一格一调用（`_init` 照样跑到 `quit()`）。
   本轮（S597–S601）的门数：`pnpm test` **26583**（247 文件）、ops **7257**、typecheck 4/4、compile **268/386**、diff **261/261**（静默错 / 崩溃 / 未实现全 0）、golden **397/397 零漂移**。

4. ~~静态宿主没有 node 侧那层 try/catch~~ —— **已闭合（2026-10-03，S200）**：发射器的 autoRun 尾巴包成 `try/catch` + `rt.reportRunFailure(e)`，
   直接跑产物（`node dist/x.mts`、`--pack scriptc` 出的 exe）撞未实现时给的是 `  runtime error  [code] message` + 退出码 1，不再是一条 Uncaught 栈。
   **「谁在报」由外层声明**（通道 `GDS2JS_RUN_OWNER`：同进程 `in-process` → 产物原样再抛、隔进程 `child` → 只置退出码），
   所以 CLI 那行的文本与 js-runner 的「崩溃 / 静默错」归桶都没动。代价是一次产物面 churn：217 份 `main.gen.mts` 各 +5 行，逐字节输出一条没变。
   途中撞到**四道 scriptc 围栏**（都改形状绕开、没加旗标，明细在 S200 末）：`globalThis` 往 `Record` 的两种转（SC1090 / SC0001）、
   `spawnSync` 的 `env` 选项（SC2020，只能「父环境改写 + 子进程继承」）、`split` 出来的元素做 `[...w]`（SC1090）、
   以及 `readonly [boolean, boolean, boolean]` 元组取下标直接 **SC9001 内部崩溃**。
   gate：compile 新增「有 autoRun 尾巴却没 `reportRunFailure`」= 0、ops `run-fallback` 三格；export / pkgmodes / cli-native 三门复跑。
   **同日续 · 四个收口形状量齐**：拿 `String.count()`（仍未实现那一格）当探针，把 node CLI / 原生 CLI / `--pack scriptc` exe / `--pack node` SEA exe
   四个面各跑一遍 —— 前两个是 `<输入文件>:  runtime error  [string-method] String.count() 未实现`，后两个是同一句去掉前缀，四者都 `before` 先落盘、退出码 1、没有 Uncaught。
   ① 原生那一支原先只让子进程「闭嘴带回退出码」，结果 CLI 报的是 **`产物退出码 1`，理由整个丢了** —— 改成**子进程 stderr 单接管、正文接回来再按宿主格式报**；
   ② `errOf` 原先用 `instanceof` 认 `UnsupportedError`，而 **CLI 吃 `dist` 那份 runtime、产物吃源码那份**，跨这份分岔时 instanceof 静默失效、`[code]` 掉——改成认 `name`。
   两支 CLI 的报错行现在逐字节相同。gate：`test:cli-native` **19 → 20** 项（新格钉「两支同一行 / 不退化成退出码 / 不重复报 / 不漏 Uncaught」，这条正是 ① 的回归闸），ops `run-fallback` **3 → 5** 格。
   另：`pnpm release` 与 README 里写死的「19 项」去掉 —— 项数随门加长会漂，不再当文档。
5. ~~`String.replace` / `find` / `capitalize` 未实现~~ —— **已落地（2026-10-03，S199）**：`replace` / `replacen` / `find` / `findn` / `rfind` / `rfindn` / `capitalize` 七格补齐，
   语料 `226-string-replace-find-capitalize` 443 行逐字节、ops 1325 → **1360**。三条实测出来的硬口径记在 S199：`replace` **只有两个参数**（第三个 `cases_enabled` 是解析期错）、
   `find` 一族负 `from` 按「可落点数」折回且正反不对称、`capitalize` 走 `_separate_compound_words` 的拆词四条件（这一版**没有**罗马数字与代词特例）。
   拆词用的大小写/分隔符类别是**全码点实测表** `runtime/case-flags.ts`（`pnpm regen:case-flags`）。`slice` 根本不是 Godot 的 String 方法（原注记仍成立）。

**早先的 P1 开工清单**

6. ~~补 `docs/SEMANTICS.md` §6 的待补测（setter/getter、`super`、Packed\*、静态类型违反）~~ —— **这四条在 §6 里已全部划掉，本条是过期账（2026-10-03 核）**：
   setter/getter 见 S152/S156（语料 `121`，两种写法各钉一遍）、`super` 与构造顺序见 S174（语料 `148`）、
   Packed\* 见 S168/S173/S177/S178/S179/S180/S181/S197/S198（语料 `135`–`225` 一整批）、静态类型违反见 S66–S69/S176/S185/S186（语料 `157`–`178`、`219`–`224`）。
   **这一族真正常挂的是各条目末尾那些「没量的相邻格」**，它们逐条写在 SEMANTICS §5 对应行末尾，不再单独占本清单的号。
   **§6 第 5 条 `when` guard 已量清** —— 语料 `227` 用带副作用的 guard 把六格行为量死
   （惰性逐分支短路 / guard 假就落到同模式的下一条 / 逗号并列的多模式共享一个 guard 且只判一次 / 全不中静默落空 / `and` 短路 / 裸标识符是**值模式**），
   `228` 钉住**模式内绑出来的名字 guard 看不见**那句解析期拒。发射器早就是「先模式后 guard」的形状，**一字没动就对上**（S201）。
   §6 里还挂着的全是这种「条目末尾没量的相邻格」，按门读数一颗一颗销。
   再往下是 §6 第 7 条 **`for` 的自定义迭代**：量清了 —— 4.6.3 **不吃** `_iter_init`/`_iter_next`/`_iter_value` 那套鸭子协议（`Unable to obtain iterator object of type ‘Object’.`)、`_get_iterator()` 也拿不到原生 `Iterator`，所以那一格**没有可实现的入口**；
   真正挖出来的缺口是另一边 —— **`for i in 5` 这类计数迭代与九种 pack 的迭代我们当场抛 `[iter-type]`**（「Godot 能跑、我们崩」），已补 `iter()` 的 INT/FLOAT/GBytes 三格并钉语料 229（27 行逐字节）；顺带 §6 第 9 条末尾那句「`for c in &"…"` 没探针」也销了（StringName **不**逐字符迭代）。向量的「两分量当区间端点」那条怪路（S202 ⑤）**量到但不实现**，仍走响亮拒。
   再往下是 §6 第 10 条 **`Variant` 混 float 时的整除提升**：也量齐了（S203，语料 230 / 231）—— `/` 有一个 float 就升 float、int 之间向零截断；**`%` 只吃两个 int，混档与 float/float 都是解析期拒**，只有动态档位留到运行期给那句 Godot 原文（型名带单引号）；`**` 两边 int 才留 int、移位只收非负操作数。
   这一格代码只动了一处：分析层两句早就是原文，**运行期那格我们发的是中文自述**（`[need-int] 需要两个 int…`），与仓库自己 `==` 那格的口径不一致，已改成 Godot 模板并把错误类从 `UnsupportedError` 归位成 `GodotRuntimeError`。
   §6 第 2 条末尾那句「三条解析期拒已量文本但还没实现」已过期 —— **三条全都已实现、文本一字不差**（`149`/`150`/`152`/`153` 早就钉着），只缺 `super(...)` 的少/多参那一格，补成语料 `232`。
   §6 第 12 条（≥3 维 / ragged 容器）也量齐并钉成语料 `233`：三维与 ragged 的打印、`==` 逐层比内容、`duplicate(true)` 深到末端而 `duplicate(false)` 会串回原串、`Array[Array]` 与 `Array[PackedInt32Array]` 合法 —— 这四格**一字未改就对上**。顺带量到 **`Array.hash()` 在 Godot 是按实例不是按内容**（同结构两个数组两个数），那一格继续保持响亮拒：它要的是引擎侧对象身份模型，与 §6 第 6 条 `<RefCounted#id>` 同一个前置，自己按内容补一个哈希反而是**静默错**。
7. ~~工程卫生：tsconfig 开 `strict`~~ —— **已在（2026-10-03 核）**：根 `tsconfig.json` 是 `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride` +
   `noFallthroughCasesInSwitch` + `verbatimModuleSyntax` + `isolatedModules`，三个包各自 `extends` 它；`pnpm typecheck` 3/3 干净。
   （`case-flags.ts` / `strFind` / `strReplace` / `strCapitalize` 都在这套严格档下，索引取值一律显式收窄。）
8. ~~定义 IR schema 并写 IR 快照测试；定死 `ops.*` 签名，然后才动 emitter~~ —— **已达成（2026-10-03 核），快照换了落点**：
   schema 在 `packages/compiler/src/lower/ir.ts`（18 个导出形状：`Expr` / `Stmt` / `Pattern` / `FuncDecl` / `VarDecl` / `TypeRef` / `Module`…）；
   `ops.*` 签名冻结在 `docs/RUNTIME_API.md`（顶部就是「签名冻结：改这里等于 emitter 全量重写」）；emitter 早已发出去并过了 P2.5/P3/P4。
   **快照没做在 IR 上，做在产物上**：217 份 `main.gen.mts` 入库 + `test:compile` 整批重生成（autoRun 尾巴那次 churn 就是它报出来的，逐字节输出一条没变）
   + `test:diff` 对 Godot golden 逐字节。产物面快照比 IR 快照覆盖面更宽（连 emitter 自己的回归也钉住），
   按 §2 第 11 条「不做重复保护」的口径就不再补一份 IR 级快照。`test:ir` / `test:sema` 217/217 守的是 lowering 与分析层。
9. ~~替换 `examples/test1.gd` —— 它依赖 `Node.new()`，Tier 1 跑不了~~ —— **原记的理由不成立**（当时那份根本没写 `Node.new()`，实测 Godot 与产物逐字节相同），
   但「例子压在引擎帧循环上」这件事是真的：它靠 `_process` 数到第 40 帧才 `quit()`。已按此重写为**纯语言层**的一页展示
   （int/float 双轨、容器引用语义、定型数组、UTF-32 String 与 `replace`/`find`/`capitalize`、`%` 格式化、内部类继承与 `super.方法()`、信号 `await`），
   `_initialize` 里直接 `quit()`，不再跑帧循环；Godot 4.6.3 与 `gds2js run` 输出逐字节一致。
   另有两格**例子写作约束**：`Shape.describe()` 这种「类名直接调非静态方法」在 Godot 是解析期错，得写 `super.describe()`；
   **同步 `emit` 之后再 `await` 那个信号，Godot 也会永久挂起**（信号只唤未来的发射），例子必须走 `call_deferred` 那一形。

**备忘**

10. 压缩保真与代价见 §1.2 的 P5（不同源，vendored zstd 不保证任意输入同字节）；
    单文件与**项目树**两条树出口都有压缩用例守着（corpus 里还没有项目树压缩例）。
11. 测试套件收窄（2026-10-03，拍板）：`test:run`（真 CLI run 层）、`test:facade`（wasm/FFI 解析树等价）、
    `test:escape`（转义边界手写断言）、`test:multi`（examples/multi 冒烟）四门连同工具与脚本已删除
    （README、package.json 同步）；这三层保障以后不再有专门门。
12. monorepo 迁移后的三个坑位（2026-10-03）：① ~~原生构建的 scratch 靠向上查找解析 `commander` —— 它在根
    devDeps 里是**解析锚点**，别随 `packages/gds2js` 的依赖清理顺手摘掉（摘掉就是 SC1010 + SC0001 两条）~~ ——
    **随 §1.259 那条工具链账作废**：CLI 自己解析 argv，没人再 import commander，两处 manifest 与 lock 里的它已摘掉；
    ② tsdown 的 dts 程序面走根 tsconfig，根 `include` 里的 `packages` 不能删；③ cli-native 的 scratch 用
    「`@gds2js/*` 逐文件相对化」而不是 node_modules（落进 node_modules 会被 scriptc 当包代码 —— 0.3 起是**静态吞包**、
    不是岛，编不过的点编成跑到就抛，见 §1.259）。
    生成物口径：248 份 `main.gen.mts`（2026-10-03 写这条时是 216 份，2026-10-07 数了一遍是 248 份 = 语料 248 例全部有产物，被分析拦下的那些是抛错的占位文件）的运行时说明符是 `../../../packages/runtime/src/runtime/index`
    （现由 `tools/compile.ts` 的 `GEN_EMIT_OPTS` 显式声明；emitter 已不带仓库布局默认值）；corpus 之外
    （examples/multi、bench/.out）仍走裸名 `gds2js/runtime`，由 workspace 链接解析。
    **收尾口径（2026-10-03）**：全量 `test:scriptc --all` 因耗时（约 2 分钟/例，全量 3.5~5 小时）按用户拍板
    中途停掉，改单跑 `161` 验证 zstd 路径（✓ 出货一致）；验收以代表集 10/10 + 项目树 9/9 + 原生 20/20 +
    `test:export` ok 17/FAIL 0 + `test:pkgmodes` 失败 0 + 五道 node 门（compile/ir/sema/ops/diff）为准。
    **改口径（2026-10-04，§1.9）**：门按用例铺开跑了 —— 全量 150 例 **40 分 52 秒**、逐字节全绿，
    「中途停掉」那套验收不再是默认形状（要全绿就直接 `pnpm test:scriptc --all`）。
13. 架构整改轮（§1.3）后的常驻项：改产物树/HOME 布局先跑 `test:treeface`；`case-table.ts` 只走
    `pnpm regen:case-table`；`case-flags.ts` 只走 `pnpm regen:case-flags`（两张都是实测生成物，别手改）；native seam 新增分岔口照「复制 `*.native.ts` 覆盖」办理；
    改 `packages/runtime/src` 内的**发射形状/函数形状**（新增 helper、往函数表塞值、换码点展开写法）先跑「`GDS2JS_SCRIPTC_FILTER=234-string-methods-batch` + `pnpm test:scriptc`」（57s 面探针，`pnpm release` 的 2b 就是它；门迁进 Vitest 后 `tools/scriptc-check.mjs` 已不存在，过滤器只认这个环境变量）再提交。
    新增 runtime 的**导出名**还要先 `pnpm build`：语料里的工程形状用例（带 `project.godot` 那十来个）产物 import 的是 `gds2js/runtime` → `packages/gds2js/dist/runtime.mjs`，那是份打包副本，不重建就报 `__vite_ssr_import_0__.xxx is not a function`（S239 这轮就是这么撞上的）。
14. 三条观察项（记录，不动）：dist 内容哈希块名（HOME/export 均按 glob/目录读，无门依赖具体块名）；
    门粒度（无子集运行能力，靠各门自带 `--quick`/筛选参数）；**两道引擎门不要并发** —— golden 检测在抢 CPU 时把大 golden（`236` 那 445 行）判成超时并误报漂移，2026-10-06 实测一次「并发报漂移、单跑 245/245 全绿」，查漂移那几分钟别顺手跑探头或另一道门。**同一道门第二种误报形态：冷启动段**——2026-10-06 又一轮整跑 1225s（前一轮 522s），把最前面的 001–006 判成超时报漂移，逐格单跑 6/6 干净、每格 1.5–2.2s；因此这一门报了超时先别改 golden，按 `vitest run --project e2e golden-drift -t "00[1-6]-"` 把点名的几格复跑一遍再定。**第三种误报形态是门自己在跑、这边改源码**：2026-10-07 的 `test:cli-native` ④ 报 `✗ 模块树不一致：runtime/rich-ansi.ts 内容不同` —— 那颗格是把 exe 内嵌的 runtime 源码树与工作区逐文件比，而 `pnpm build` 之后exe 就定型了；那一轮在门跑着的时候改了 rich-ansi.ts 的注释，读到的就是「内嵌的那份 ≠ 现在这份」。源码定稿再跑出货门，重跑一次即 20/20（④ 那格实测 128 秒）。

14. **转换族与 `format` 的四个卡点（2026-10-04 记，读数全在 S214 / S219 / S220 / S221 / S225 / S226 / S227）**：① `var_to_str` 的浮点 —— **已出货（S289 / §1.93）**：`[var-to-str-float]` 那支删了，尾数是 `thirdparty/grisu2/grisu2.h` 那台生成器的直译（`packages/runtime/src/runtime/grisu2.ts`，4059 + 257 格零分岔）。S287 / S288 猜的「`%.*g` 家族」与「读取器往返判据」两条一起作废 —— 反常位数正是 Grisu2 窗口生成的固有产物，而装得下 float32 的值另走 float 尾数；打包数组的元素不补 `.0`。**欠账挪到读那一头**：字面量与字符串的十进制解析照 `built_in_strtod` 另立一轮（§6 第 30 条①）—— **已出货（S290 / §1.94，1302 格零分岔）**，本轮语料里那三格改用算术造值的字面量原形（`2.5e-11`、`1024e23`、`1.7976931348623157e308`）也由 279 钉回字面量。② `str_to_var` 的认与不认**已经量齐**（S214），只欠实现 —— **S231 已发出**（155 格逐格对上；`\U` 吃六位数却量不出越界处理、构造式名字认不出、实参不是 String 三条分别抛 `[str-to-var-shape]` / `[str-to-var-type]` / `[str-to-var-arg]`）。③ `convert` / `type_convert` 标量表已齐（S220），卡在 `convert([], TYPE_INT)` 那条**运行期**拒（引擎文案连函数名都指错了），数组→标量按什么判要先量；**那道前置已解（S233）**：`TYPE_*` 整族 37 支 + `TYPE_MAX` 量清并发出（逐名用 `GDScript.reload` 编内层脚本，避免一个不存在的名字带废整支探针；每支又与 `typeof(样本)` 对了一遍），语料 236 钉了 37 格打印 + 17 格 `typeof(x) == TYPE_X`。这两支剩下的量测在 §1.37 一次跑完（340 格矩阵）：解析期接受集合按第一实参的静态类型分岔，`type_convert` 一支都不拒。④ `format`：**已出货（S232）**，而且 S219 那格「缺省占位符是 `"{0}"`」的读数也纠正了 —— 占位符本身是 `"{_}"`，`{0}` 是键文本渲染出来的样子；键序（字典按插入顺序遍历键）、非字符串键、值转文本（走 print 那套）全量过，只剩 Object 那一支抛 `[format-object]`。**①的一条更正（S228）**：`var_to_str` 那两处「极小值给 `0.0`」的反常已经查到是**字面量解析**掉的，不是 writer 的问题 —— ~~①里剩下的只有「尾数 16 位还是 17 位」一问~~ 这一问也结了：**既不是 16 也不是 17**，是 Grisu2 在自己的 `[M-, M+]` 窗口里生成（S289）；解析那一半由 `built_in_strtod` 结清（S290）。**共同前提**：任务 #18（AOT 那 ~140 倍的装箱账）要的是单态/去装箱的设计拍板，不由代码侧决定，仍未定。

15. ~~**`run --watch` 在原生目标上看不见「mtime 变了、字节数没变」的保存（2026-10-07 记，§1.66，未动实现）**~~ —— **2026-10-08 复测：这一条不成立，门已改建在等长保存上（§1.85，`tmp/probe-watch/`）**。① **读数层先洗清**：把「每 400ms 读一次同一份文件」的小探头用 scriptc 编成 exe（`stat.mts`），父侧 node 同拍读一遍 —— 四拍里两拍是**同尺寸**保存（8 字节不动），exe 报的 `mtimeMs` 与父侧逐格相同（`…413907.558 → …417499.2285 → …418705.657 → …419917.1272`），`Math.round(mtimeMs)` 摘要维也相同，`ctimeMs` 一起跟上，`ino` 不变。顺手量到 scriptc 的 `Stats` 面：`st.mtime.getTime()` 直接编不过（`error SC2020: 'Stats.mtime' is typed by @types/node but has no scriptc lowering yet`，hint 列的是 `isFile()/isDirectory()/isSymbolicLink()/dev/ino/size/blocks/nlink/atimeMs/mtimeMs/ctimeMs`）。② **真 CLI 复测**（`cli-run.mts`，exe 与 `tsx` 跑源码两侧同一段扫法：等「监听」+ 首跑之后 0.3/3/6/12s 各写一次**等长** 62 字节的 `main.gd`）：两侧都是「重新运行」4 次、标签 `t000…t004` 全印出。③ **所以没改 `gdSignature`**（没有可修的失灵），当年那两格没重跑更像 ⑨b 记的那个洞的连带现象（重跑写同名产物 → 第二次执行被 ES 模块缓存吃掉；那洞在打成单文件装载那一轮已修，当时门为了绕开它把夹具改成不等长）。④ **门反过来收紧**：`test/e2e/cli-native.test.ts` 的 ⑨b 夹具从 `watch-a` / `watch-bb` 改回**等长**的 `watch-a` / `watch-b`，「只有 mtime 动」这一维从此由门看着。
16. ~~**NodePath 值型已发出（2026-10-08，S268，语料 264），`inst_to_dict` 也已发出（同日 S270，语料 265）—— 这一族只剩 `dict_to_inst` 一支**~~ —— **`dict_to_inst` 同日也已发出（S273，语料 266，§1.76），NodePath / `inst_to_dict` / `dict_to_inst` 这一族到齐**：它要那三件都已就位 —— 查找表用 `registerDictIdentity` 的 `(resPath, classPath)`、跳过 `_init` 靠新的 `rt.bareConstruction()` 旗（发射器两处 `_init` 入口都关到旗子后面）、字典与字段不一致那三条口径照语料 t14/t16/t22 落地。留在拒答清单上的只剩「造不出宿主根类」那一形（缺 `@subpath` 或 `@subpath` 是空 NodePath，`[dict-to-inst-root]`）。发射期拒答清单现共 **8** 支（`is_instance_of` 已在 S274 发出，见 §1.77）。**门维护口径**：`packages/gds2js/dist` 不入库，而 `test:pkgmodes` 与 `test:cli-native` 吃的就是那份 dist / exe —— 改了 `packages/*/src` 之后**先 `pnpm build` 再跑这两门**，否则报的是「`printDebug` is not exported by dist/host.mjs」这类过货假红（S268 那轮撞到并写进 §1.71，S270 起照做，两门直接绿；S273 这轮 `test:diff` 也吃 dist，项目树用例报的 `bareConstruction is not a function` 就是同一类假红）。**停门要停干净**：判红之后只停 wrapper 就直接起重跑，子进程还活着，于是 `cli-native` 的 `ENOTEMPTY tmp/cli-native-check`、`scriptc` 的 `EPERM tmp/sc-gate/…`、`pkgmodes` 的 `Cannot find module pkg-check\nested_out\main.mts` 三处一起红，看着像语义回归（S304 那轮亲踩，单独串行重跑即全绿）—— 起重跑之前先确认没有残留的 godot / node 子进程。**同一族的第二条**：长门在跑的时候**不要动 `corpus/cases/*`** —— 改了 `main.gd` 而 golden 还是旧的，那一例的门就在比对两份不同的东西（S313 那轮在 scriptc 跑到一半时往语料 300 加了三格，那一例直接假红）。
17. ~~**「node 跑得通、scriptc 出的 exe 当场炸」这类形状只有一格已知未修（2026-10-08 记，S270 ④，任务 #45）**~~ —— **同日已修并已进门（S271，任务 #45 结清）**：语料 246（`String.format()` 的实参是脚本实例）当时在 `GDS2JS_SCRIPTC_FILTER=246` 下跑挂 `expected object at $.gdObjectId, got number`，根源是 S232 `scriptPropsHook` 里那条「把类实例当 `Record<string, Variant>` 索引」。修法与 §1.73 同一套（发射器按名单同序静态拼取值闭包），但**多量到一条**：scriptc 的校验挂在**转换语句本身**，把它留在函数体里当兜底也会炸 —— 所以 `registerScriptProps` 的读数器是**必填**第三参。**门也补上了**：246 进 scriptc 代表集（10 → 11 格），门注释写明它是这类形状的唯一已知样本，往后「只有 AOT 才暴露」的问题会先在这里响。**S273 又补一格**（11 → 12）：语料 266 是它的同类续集 —— 「实例上那张按名的原值表」与「不跑 `_init` 的构造路」两条都只有静态目标才验得出来。**S274 再补一格**（12 → 13）：语料 267 的三分岔全靠 `instanceof` 与 union 载荷。

18. **拒答清单只剩两支：`var_to_bytes_with_objects` 与 `bytes_to_var_with_objects`（2026-10-08 记，S274 之后；第一堆结清于 S281 / §1.84，第二堆也开出两支 —— S282 / §1.86）**：① ~~**要逐帧栈的四支**~~ —— **已按 S276 / S281 全部发出（`push_error` / `push_warning` / `print_stack` / `get_stack`）**：产物有了运行期帧栈（函数体一对 `rt.frameEnter` / `rt.frameExit`，每条语句一行 `rt.frameLine`，只有用到的模块才打点），语料 273 钉了 22 行逐字节，ops 钉了 `ERROR:` 那块被 normalize 滤掉的那半 —— `print_stack` / `get_stack` / `push_error` / `push_warning`。形状与文案都量清了：`push_error` / `push_warning` 是「首行 + `at: … (core/variant/variant_utility.cpp:…)` + backtrace 表头 + 每帧一行」且不中断脚本、元数 0..N；`print_stack()` 每帧一行 `Frame N - 路径:行 in function '名'`（无表头、只收 0 支）；`get_stack()` 给 Array，帧字典键序固定 `source` / `function` / `line`，函数名是裸名、lambda 是 `<anonymous lambda>`、C++ 帧不出。**缺的是工程活不是数**：产物运行时要能报出 `(函数名, .gd 行号)` 的调用栈 —— `mark(genLine, loc)` 现在只喂 source map（`LINE_MAPPINGS` 编译期用完就丢），runtime 也没有帧栈。所以下一件要做的是「每支函数体一对 push/pop + 一张运行期产物行→`.gd` 行的表」这一件 emitter+runtime 的配套活；顺带记着 normalize 会把整块 `ERROR:` 滤掉，`push_error` 进不了语料对账 —— 那一块由 ops `stack-frames.test.ts` 钉。还欠的三形也记在 S281 ⑧：await 信号后重开的帧栈、字段初始化子的 `@implicit_new` 帧、两条协程同时活着时的顺序。② ~~**二进制序列格式的四支**~~ —— **`var_to_bytes` / `bytes_to_var` 已按逐字节量出的形状发出（S282，语料 274 共 58 格）**：编解码两头是 `core/io/marshalls.cpp` 的 `encode_variant` / `decode_variant`（不是 `variant_utility.cpp`），头部四字节、`1 << 16` 是宽 payload 位，String 走「UTF-8 长度 + 补零到 4」（`-0.0` 的号被丢掉那句**已由 S283 更正**：那是字面量在解析期折成 +0.0，编码照 IEEE 把符号位写进 float32）。**S283 又收掉四族**（九种 pack、NodePath、Vector3i、定型数组与定型字典，语料 275 共 53 格），编码侧的响亮拒只剩「对象 / RID / Callable / Signal」四支。仍挂着的是**带对象表那两支**：对象表里放什么（类名、属性名与值）一格没量，照旧 `emit-builtin`；剩下的欠账整份在 §6 第 29 条。另有 §6 第 26 条（越界字面量的解析期那句）、第 27 条（`hash(NodePath)` 七个数已取回、六形式子已排除）与第 28 条（臂的等式已整族量清（S279）、`^"…"` 与 `NodePath("…")` 都能当手臂，剩下的只是其余构造式手臂的发射式子）三笔小账；§6 第 25 条（`^"a/b"` 字面量的 lowering）已结清（S275，语料 268）。

19. **这一轮（S294 / S295，2026-10-10）结清与仍开着的**：① 结清 —— 字典字面量重复键的解析期拒（`checkDictDuplicateKeys`，语料 283 钉那句拒、语料 284 钉那张桶表、门 `packages/compiler/test/dict-dup-key.test.ts` 29 形），符号零那五处静默错（`floor` / `ceil` / `round` / `clampf` / `deg_to_rad` / `rad_to_deg` / `fmod` 的抹号 + `vi()` 让 int 槽装着 −0），以及 §6 第 23 条末尾挂了很久的「`atan2(-0.0, 0.0)`」那一格 —— 复测两侧一字一样，旧账作废。② 当时仍开着的 **`var x =` 之后换行再写表达式**那一族**已于 2026-10-11 结清（S316，语料 304–314，门 `line-continuation.test.ts` 39 形）**：判据是「换行只在成对括号内合法」，十句解析期拒一次接齐。同一轮的范围探头还翻出重复键那族的**一格漏报**：`{^"a": 1, ^"a": 2}` 这种 NodePath 字面量键引擎照拒，我们仍收 —— 欠的是 `str(NodePath)` 在子名与绝对位那几形的读数（S294 ⑨），补上读数就能接。③ **放宽了一条旧口径**：S265 ④ 记的是「同一份脚本里 `0.0` 与 `-0.0` 在常量池同一个槽」，本轮量到触发条件更宽 —— 连 `var pz: float = 1 - 1` 这种**折叠得出**的 0 值常量也算先占槽。照旧不复刻（那是引擎的实现细节），但它意味着**任何混着两种零字面量的探针脚本两侧都不可能对齐**：往后量这一族一律用运行时算出来的零（`var nz = pz * -1.0`），语料 262 / 285 同此口径。④ `.gitattributes` 那一问仍待拍板（§1.97 末），本轮工作树上 `280-pow-precedence` 那三份的假 M 又挂回来了。

20. **§1.100（S296）之后开着的一批（2026-10-10 记，读数全在 §6 第 8 / 28 条与 S296，别重量）**：① ~~**match 手臂七形**~~ —— **负数与三元已发货（S297，语料 287，代表集加了这格）**：`Vector2(-1, 2)` / `Vector3(-1, -2, -3)` / `Vector2i(-1, 2)` / `Color(1, 2, 3)` 四形进了 `CTOR_ARMS`（元数改成集合、实参位多收「一元负号 + 整 / 浮字面量」），发射仍走 S280 那条 `rt.patConst`。剩的是**错元数那两句**：`Vector2(1)` 引擎给 `No constructor of "Vector2" matches the signature "Vector2(int)".` + `Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").`，各自行号与「什么形状发第一句、什么形状发第二句」都没量过 —— 那是解析期文案的活儿，不是准入门的。② ~~**`Callable().bind(n)` 的 `get_argument_count()`**~~ —— **已发货（S298，语料 288）**：空 `Callable()` 基恒给 0，方法与 lambda **不加夹子**（`one` 绑 3 支 −2、`h` 绑 2 支与链式 −1 都是引擎原值）。③ **`Callable.unbind()` / `unbind_many()`**：十格读数已在（`tmp/probe-binds-c/u.mts`，明细在 §6 第 8 条②）。两件事：`unbind_many` **4.6.3 根本没这个名字**（引擎 `Invalid call. Nonexistent function 'unbind_many' in base 'Callable'.`），我们却把它挂在「未实现」表上 —— 属**名字表被抄来的清单污染** —— **已由 S299 整族归位**（二十四名一名一名过裁判：存在 20 名、没这名字的四名是 `from` / `get_object_instance_id` / `is_equal` / `unbind_many`；表外名改发引擎那句 `Nonexistent function`，门 `packages/runtime/test/callable-member-names.test.ts`；同族手法可以照抄去量 String / Array / Dictionary / Vector 那几族的成员表）；`unbind(n)` 的 count 式子已拟合（`声明 − (已绑 − n)`，四格全中）但**调用侧把实参丢了**（`unbind(1)` 后 `call(9)` 给的是 `f(1, 2)` 的 102），两条口径打架 → 语义没自洽前照红线继续响。④ **NodePath 字面量键的重复键拒**（S294 ⑨）：要先量 `str(NodePath)` 在子名与绝对位那几形。⑤ 这一族的**门盲区教训**已经写进 S296 ④：容器里带引号 / 反斜杠 / 制表符的字符串以前没有任何一格覆盖 —— 以后再动 print / repr / var_to_str 这类**出货文本**函数，先补一形带特殊字符的语料，别只靠既有 golden 全绿。⑥ **探头已经跑到 8 格**（`tmp/probe-tails/binds.mts` n01–n08，n09–n18 未跑）：`get_argument_count()` 的式子按 S298 落定（**方法与 lambda 都给 `声明 − 已绑`、可为负，只有空基恒 0**；上一轮记的「在 0 处夹住」是单格探头的假读数，更正见 S298 ③④），`unbind` 那两格引擎响的是**调用 arity** 那句、不是 unbind 自身拒。⑦ **上一轮那条「疑似挂起」已结案**：把 240 秒超时等满的是**引擎侧**——报完 `Attempt to call function 'null::null (Callable)' on a null instance.` 之后脚本中止、`quit()` 到不了，进程留着，正是 §1.97 那 17 格 `<<GDS2JS_TIMEOUT>>` 同族；我们这侧同文本、rc=1 退出，两句一字一样，没有要修的东西。⑧ **本轮起加一条读数纪律**（S298 ④）：量 Callable 的元数据，基对象**必须先进一个变量**再用 —— `var w = A.new().one.bind(…)` 这种临时基在引擎那侧会被当场回收，给出的是「对象没了」的数，不是 arity 的数。

21. **成员名表这条线：十一批已过裁判（Callable S299、String / Array / Dictionary S300、Vector 四支与 Color S301、Pack 三支代表与 StringName / NodePath / RID S302），只剩 Pack 其余六支（§6 第 33 条）**。已定案的污染共五名：Callable 的 `from` / `get_object_instance_id` / `is_equal` / `unbind_many`（我们当「未实现」挂着，引擎根本没这名字）与 **`Array.concat`（我们连实现都有 —— JS 语义）—— 2026-10-23 复验：这一格早已修好，五名两侧都发引擎那句 Nonexistent function（读数 `tmp/probe665`，见第一百九十三笔）**；后者严重一级，属「用户写错、Godot 拒绝编译、我们照跑」的**掩盖型**错误，而五批扫描证明它是个案（「给得出值」桶在每一批里都是空的）。句子这一层也一并收口：Vector 五族 59 名与 Pack 的 11 格此前发的是中文自述，现在都是引擎那句 `Invalid call. Nonexistent function '<名>' in base '<类型>'.`（门 `value-absent-method-names.test.ts` 77 格）。**手法上的三条坑**已写进 S300 ① / S301 ⑤ / S302 ④：批量通道（ClassDB、解析期）对内置类型都不通、判「我们的表有没有」要问运行时别 grep `case`、以及**先验证探头的接收者本身跑得通**（`RID(65)` 那一族整批判定就是这么变假的）。覆盖面账现在是有名单不是估计数：String 58 / Array 11 / Dictionary 5 / Vector+Color 53 / Pack+其余 若干（S300 ⑥、S301 ④、S302 ⑥）。三处已定案的污染要记住：Callable 的 `from` / `get_object_instance_id` / `is_equal` / `unbind_many` 在 4.6.3 **没这名字**（我们当「未实现」挂着）；`Array.concat` 更是**被实现了**（JS 语义）—— 后者属「用户写错、Godot 拒绝编译、我们照跑」的**掩盖型**错误，严重一级，而 S301 证明这类污染目前是**个案**（Vector 五族 59 名里「给得出值」那桶为空，只差句子）。覆盖面也从「不知道差多少」变成有名单：String 58 / Array 11 / Dictionary 5 / Vector+Color 53 名引擎有而我们没登。**手法上的两条坑**已写进 S300 ① 与 S301 ⑤：批量通道（ClassDB、解析期）对内置类型都不通，只能一格一跑；判「我们的表里有没有」要问运行时、别 grep `case`。

22. **S304 / S305 两轮之后开着的（2026-10-10 记）**：① 元数表五族已接进解析期，**残两笔**记在 §6 第 34 条 —— Pack 九支的元数没量；链式接收者与定形 `Array[Vector2]` 元素那两形引擎解析期拦而我们放过，缺的是「方法返回类型表」。**2026-10-17 复证：这两笔还开着**，七格全 DIFF（尺 `tmp/d6/one2.py`、读数 `tmp/d6/n2.txt`，句子逐格登在 S457）—— 其中五格只缺「`index` 读定形容器时交出内型」，交出后运算符型对 / 成员名表 / 调用元数三条现成的路各自就接得住；剩两格要新表（方法返回类型），得逐族过裁判。**同轮基线对照把这笔账的病灶挪到更下一层**（尺 `tmp/d6/one3.py`、读数 `tmp/d6/n3.txt`、明细 S457 ④）：`var v: Vector2 = Vector2(1, 2)` 直接 `v + 1` 与 `v.zzz` 也是引擎拦、我们放过 —— 值型**标注本身**就没进那两支闸门（`checkOperandPairs` 的 `ANNOT` 只收 `bool / int / float / String / Array / Dictionary` 六个名字，成员名那支的接收者表同范围），不是只缺元素读；同一探针里 `s: String` 的 `s + 1` 与 `v.distance_to()` 的元数句都是对的。正账因此重排：**①' 先按运算 × 型对把九支值型在「标注」这一格逐格过裁判，再 widen 那两张接收者表**（现成的 `OP_PAIRS_REFUSED_DECL` 没测过这一族，不许顺手扩）；**②' 然后**才轮到 `index` 读交出内型（`a[0]`），它建在①'之上。**①' 随 `1b474d9` 发货、②' 随本轮发货（S459）**：元素读经 `rawOf` + 现成 `parseTyped` 交出内型，与标注那两张表**逐对相等**（844 格 missing 0 / extra 0）。只剩第三笔「方法返回类型表」与元素读的成员名 / 调用元数两形。**第三笔的一半随 `4655760` 发货（S460）**：元素读交出内型后，五支值型内型的短元数与 `Array[String]` 的缺席属性逐格与裁判同（尺 `tmp/d6/n5.py`，二十七格）。**剩下两格卡在「名字全集没量」**：把值型七面的表外属性名一律当缺席试过 —— n5 对上十一格，但 `pnpm test` 当场红 **1863** 格，`valueAttrKind` 的 `null` 是刻意静音，扩它等于把没测过的形状当已知，已收回（S460 ②）。要先量「七面 × 任意串」那张全集表，才轮到元素读的表外**方法名**两句与方法返回类型表。② 元数门一接上就暴露出「名字在表里、实现还没有」那一串（`Vector3.rotated` / `Color.blend` / `Vector2.cubic_interpolate_in_time` 起步），是 S301 ④ 覆盖面名单的新条目，按族发货。③ 停门要停干净 —— 已写进 §2 第 16 条（残留子进程能让三支门同时假红）。④ `.gitattributes` 那一问仍待拍板（§1.97 末）：工作树上 `280-pow-precedence` 三份的 EOL 假 M 还挂着。⑤ **S306 已把那张欠款名单动了 24 名，并顺手修掉两处静默错值**（值类型族的 `clamp` 是「先比下界再比上界」，与全局 `clamp()` 不同一条；`Vector2i` / `Vector3i` 的 `snapped` 饱和不回绕）—— 剩下的名单与 `move_toward` 那条式子记在 §6 第 35 / 36 条。  
## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- **七个值类型**（`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`）—— 按 D6 不进这一层，构造式与成员照旧响亮拒
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- **`hash(Callable)` 的数值**（2026-10-25 定案「不追」，从待办改判决）—— 引擎那三支哈希都从 `get_instance_id()` 的指针派 int64 算出（S661：同批第二个实例差 1.6e10），方法 / 静态两支五候选式子全拟合不出，lambda 两支每进程换数；逐字复刻这条路根本不存在，本层对该名一律响亮拒。
- 性能优化 —— 先要正确；benchmark 读数已出（§1.10），真要动优化走 5.5 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
