# gds2js 开发路线

> 目标：GDScript 4.x → JavaScript 的 **AOT 编译器 + 独立运行时**。
> 路线：**A（独立运行时），按 C→A 推进** —— 先纯语言层（Tier 1），引擎宿主后置。
> 裁判版本：**Godot 4.6.3.stable.official.7d41c59c**（`F:/godot/Godot_v4.6.3-stable_win64_console.exe`）。
> 配套文档：`docs/SEMANTICS.md`（语义基线，全部为 4.6.3 实测）、`docs/RUNTIME_API.md`。
>
> 维护口径：本文件只留「决策 / 计划 / 当前任务 / 非目标」；实测语义记在 `docs/SEMANTICS.md`。
> 代码注释与本目录里的 `S\d+`、`§n` 指的是 `docs/SEMANTICS.md` 的行号（现有 S1–S204）与小节；对不上时以当期代码与门读数为准。

---

## 0. 已拍板的决策（不再讨论，直接执行）

| 编号 | 决策 | 结论 |
| --- | --- | --- |
| **D1** | int 表示 | **分轨**（2026-09-25 修订）。**解箱轨**纯 Number：覆盖 2^53 内场景，越界**响亮抛错**、绝不静默回绕。**装箱轨**（Variant）载荷归一化为「2^53 内 number / 超出 bigint」，算术与位运算统一升 bigint 并按 **int64 回绕**，与 Godot 逐位一致。`str()` 靠标签区分 int/float。**"全面 BigInt" 依旧否决**（热路径差一个数量级）。 |
| **D2** | 值表示 | **类型驱动双轨**：编译期能定类型 → 原生直译；`Variant` / 推断不出 → 走 `ops.*`。 |
| **D3** | `await` 语义 | **直接降级为 JS `async/await` + Promise**。实测证明 Godot 强制"协程必须被 await"（见 SEMANTICS §5），所谓 async 传染**就是 Godot 自己的规则**，不是偏差。 |
| **D4** | 宿主深度 | **Tier 1：纯语言**。不实现 `Node` / `SceneTree` / 任何引擎 API，遇到就抛 `unsupported`。 |
| **D5** | 版本 | 钉 **4.6.3**。已实测：4.6.3 与 4.7 在本项目覆盖的语义上输出逐字节一致。 |

### 2026-10-03 拍板（CLI 出货形态）

| 编号 | 决策 | 结论 |
| --- | --- | --- |
| A | `--watch` | 保留轮询（一份实现两个 tier 通用；回退面是 `startWatch` 一个函数）。 |
| B | 出货形态 | 只出 `--dynamic`；`tools/cli-native.mjs` 的静态构建降级成 `--static` 后备（也编得过）。 |
| C | SEA / `--pack node` | **先不删**，等 native CLI 出货并跑满一个门周期再议（任务 #27）。 |
| D | 压缩（原 #24） | **已落地（2026-10-03）**：scriptc 支 mode 1/3 走 scriptc 内置 `node:zlib`，mode 2 走 vendored zstd-codec（跑在 `--dynamic` 岛上）；保真口径见 §1.2 的 P5。 |
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
| 5.5 性能（D2） | 进行中 | 先 benchmark 后优化；收益量化 + golden 逐字节不变 + 校验值一致三重护栏。 |
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

### 1.3 架构整改轮（2026-10-03，全量落地）

- **readings（终验口径）**：`test:treeface` 新门 16/0；`test:cli-native` 19/19（含过期自动重建路径）；`test:scriptc` 代表集 9/9 + `161` 1/1 + `--project` 9/9；`test:export` ok 17 / 记账 1 / FAIL 0；`test:pkgmodes` 失败 0；node 门 compile 150/216（pack codec 口径交叉 0 不一致）/ diff 142/142 / ir 216/216 / sema 216/216 / `test:ops` **1325/0**（+3 = host flush-on-error 断言）。
- **R1** seam 真源化：`parser/bundle/exec/home` 四份 `*.native.ts` + `home-lib.ts` 工厂 + `home-assets.gen.ts`（空占位入库、构建期覆写）；`tools/cli-native.mjs` 只做复制覆写与资产生成，不再内嵌模板。
- **R2** `packages/runtime/src/tree-face.ts` 唯一清单；cli.ts / scriptc-check / cli-native 三消费者引用；`test:treeface` 对账（盘面存在 + 镜像不变量 + 消费者零硬编码）；scriptc-check 的「同形宿主模板」已删（读真实 `host-scriptc.ts` 改写相对路径）。
- **R3** `Module.usesPackCodec`（lowering 置位）替代正则；`tools/compile.ts` 加「文本 regex vs IR 标志」逐用例交叉断言（与 scriptc-check 的 `NEED_ZSTD` 互锁）。
- **R4** `cli-native-check` 过期即自动重建（输入集 mtime；`GDS2JS_CLI_NATIVE_NO_REBUILD=1` 时过期=响亮失败）。
- **R5** emitter 删 `DEFAULT_RUNTIME_IMPORT`/`DEFAULT_HOST_IMPORT`，`EmitOptions` 两字段必填；`tools/compile.ts` 显式 `GEN_EMIT_OPTS`（值与原默认逐字节相同 → 216 份重生成 0 churn）。
- **R6** 路径候选链收敛到 `packages/compiler/src/paths.ts`（wasm）与 `packages/gds2js/src/paths.ts`（runtime TS 目录/产品运行时/scriptc）；清掉 monorepo 后不再命中的两条迁移期候选（cli-native 19/19 兜底验证过）。
- **R7** case-table 管线：`listCases` 默认排除 `000-`（点名放行）；探头现搭现弃不入库；`regen:case-table` 三步脚本；`case-table.ts` 重写（3037 码点、上限 130 + 下限 29 与旧表逐项一致）。
- **R8** `SceneTree.run` try/finally：帧循环/init 抛错也先 `flush()` 再抛。
- **R9** `cli.ts` 拆为 `cli/` 下 10 模块（ctx/build/export-common/export-exec/export-ts-tree/check/run/watch/main + 薄入口）；watch 的 RUNNERS 由 main 注入（无环）。
- **R10** `lower/double.ts` → `shared/double.ts`（exports、相对导入、产物树键、HOME 键；全仓 `lower/double` 归零）。
- **发布收口（同日续）**：拍板 §0 H/I（A 形态 + SEA 保留）；版本戳 0.1.0（`gds2js --version`；`version.ts` 与四处
  `package.json` 一字一致由 `pnpm release` 校验）；`pnpm release` = 版本校验 → build → 19 项门 → `release/gds2js-<ver>-win64.exe`
  + `.sha256` + 产物 `--version` 冒烟。

---

### 1.4 覆盖面收口轮（2026-10-03，§2 的缺口账清零）

- **readings（终验口径）**：五道 node 门 compile **155/224**（新增一格「有 autoRun 尾巴却没 `reportRunFailure`」= 0）/
  ir **224/224** / sema **224/224**（误报 0、漏报 0、崩溃 0）/ ops **1325 → 1379**（+35 = String 一族、+5 = `run-fallback` 三种声明形状与 `errOf` 两格、+14 = `iter` 的可迭代面）/
  diff **147/147 逐字节**（用例数 217 → 224：`when` guard 两例 + `for` 计数迭代一例 + 除模/promotion 两例）、静默错 0、崩溃 0、未实现 0；`test:treeface` 17/0、`test:cli-native` **20/20**、
  `test:pkgmodes` 失败 0、`test:export` FAIL 0（本机 shim 把 node 换成 24.21.0 之后是 ok 10 / 记账 3，`GDS2JS_NODE_BIN` 指一份 ≥25.7 就是 ok 18 / 记账 0 —— SEA 那几格跟着环境走，见 §2 第 3 条末）；`pnpm typecheck` 3/3、`pnpm release` 整链绿（含 engines 互锁那行）。
- **做的四件事**：① String 的 `replace` / `find` 一族 / `capitalize` 补齐（§2 第 5 条，S199）；
  ② 产物顶层的 `runtime error` 兜底（§2 第 4 条，S200）；③ `examples/test1.gd` 换成不压引擎帧循环的纯语言一页（§2 第 9 条）；
  ④ §2 第 6/7/8 三条过期账就地核对并记账（实测都已在）。
- **§6 待补测继续销账（同日续）**：`when` guard（S201，语料 227/228）、`for` 的自定义迭代（S202，语料 229：4.6.3 根本没有 `_iter_*` 入口，真缺口是 `for i in 5` 与 pack 迭代）、除模与 int/float 提升（S203，语料 230/231：运行期那句归 Godot 模板）、`super()` arity 的最后一格（语料 232）、≥3 维与 ragged（S204，语料 233）。
- **新增的门与管线**：`226-string-replace-find-capitalize`（443 行 golden）、`runtime/case-flags.ts` + `tools/case-flags{,-probe}.mjs` + `pnpm regen:case-flags`
  （全码点分类实测表，探头照 R7 的口径现搭现弃、已进 `.gitignore`）、compile 门的 autoRun 兜底断言、ops 的 `run-fallback` 三格。
- **产物面 churn 的账**：217 份 `main.gen.mts` 各 +5 行（只有 autoRun 尾巴），逐字节输出一条没变。
- **仍未闭合的**：无 —— §2 的 1–9 条全部落定（第 3 条 `engines.node` 用本机 `D:/nvm` 里现成的 18/20/22/24 四支测完并改成 `>=22.18`）。
  第 10–14 条是备忘与常驻口径，不是待办；§6 各条目末尾的「没量的相邻格」继续逐条挂在 SEMANTICS 里。

---

### 1.5 String 第二批（2026-10-04，覆盖面续收）

- **readings（终验口径）**：compile **156/225**、ir **225/225**、sema **225/225**（误报 0、漏报 0、崩溃 0）、ops **1379 → 1415**、diff **148/148 逐字节**（静默错 0、崩溃 0、未实现 0）、treeface **17/0**、`test:cli-native` **20/0**、`pnpm typecheck` 3/3。
- **落地的 18 格**：`count` `countn` `get_slice` `begins_with` `ends_with` `insert` `erase` `repeat` `strip_edges` `to_camel_case` `to_kebab_case` `to_snake_case` `casecmp_to` `unicode_at` `bin_to_int` `is_valid_filename` `uri_encode` `c_escape`，逐字节钉在语料 `234-string-methods-batch`（169 行 golden），口径全记在 S205。
- **顺手钉死「4.6.3 根本没有的方法」**：`pad_chars` `pad_spaces` `strip_edges_left` `strip_edges_right` `rtrim_with` `ltrim_with` `to_title_case` `casecmp` `nocasecmp` `naturalcasecmp` `naturalnocasecmp` `split_float` `is_valid_ascii` `xmltostr` `distance_to` —— 每支单独一个脚本量的，全是解析期 `Cannot find member "X" in base "String".`，以后别再照旧文档去接。
- **量到了但规则没拟合出来，继续响亮拒**：`get_slicec`（实测两参都只收 int）`pad_zeros` `similarity` `format` 的 `placeholder` 第二参 `uri_decode` 的非法转义形状、`count` 的 `chars` 真值与第 3 个 int 参数 —— 数据原样记在 S206，§6 新加第 15 条挂着。
- **顺带撞到第五道 scriptc 围栏**：`strAt` / `strSubstr` / `strEdge` / `strLength` 这四个原本人手可达的函数，被新代码拉进工程出口的 runtime 面之后当场炸 —— 码点展开 `[...s]` 是 SC1090，`Array.from(s)` 是 SC2020（**两种形状都没有 lowering**），`substr: strSubstr` 这种「带默认值的函数当值」进函数表也是 SC1090。改成都走 `codepoints()`（`for…of` 逐码点 push），`strOps.substr` 换成显式三参箭头；`test:cli-native` ⑤ 那格的探针从 `"hello".count("l")` 换成 `"5".pad_zeros(3)`（count 这一轮实现了，拿它当「撞未实现」的探针会失真）。
  **快门落在哪儿**：这类围栏的触发条件是**可达性**，不是文本 —— 面里 `[...s]` 有二十多处本来就能出货，所以「正则扫形状」的门会误报。真正便宜的做法是让 scriptc 自己说：`234-string-methods-batch` 进 `tools/scriptc-check.mjs` 的代表集（9 → **10** 格），并且 `pnpm release` 新增 **2b 面探针**那一步（本机 **38s** 一例），build 之后立刻跑，别等 5 分钟的等价性门。

---

## 2. 当前任务与待办

**决策 / 发布类**

1. **#27 已决（§0 I）：SEA 保留。**
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
12. monorepo 迁移后的三个坑位（2026-10-03）：① 原生构建的 scratch 靠向上查找解析 `commander` —— 它在根
    devDeps 里是**解析锚点**，别随 `packages/gds2js` 的依赖清理顺手摘掉（摘掉就是 SC1010 + SC0001 两条）；
    ② tsdown 的 dts 程序面走根 tsconfig，根 `include` 里的 `packages` 不能删；③ cli-native 的 scratch 用
    「`@gds2js/*` 逐文件相对化」而不是 node_modules（落进 node_modules 会被 scriptc 当包代码收进岛）。
    生成物口径：216 份 `main.gen.mts` 的运行时说明符是 `../../../packages/runtime/src/runtime/index`
    （现由 `tools/compile.ts` 的 `GEN_EMIT_OPTS` 显式声明；emitter 已不带仓库布局默认值）；corpus 之外
    （examples/multi、bench/.out）仍走裸名 `gds2js/runtime`，由 workspace 链接解析。
    **收尾口径（2026-10-03）**：全量 `test:scriptc --all` 因耗时（约 2 分钟/例，全量 3.5~5 小时）按用户拍板
    中途停掉，改单跑 `161` 验证 zstd 路径（✓ 出货一致）；验收以代表集 10/10 + 项目树 9/9 + 原生 20/20 +
    `test:export` ok 17/FAIL 0 + `test:pkgmodes` 失败 0 + 五道 node 门（compile/ir/sema/ops/diff）为准。
13. 架构整改轮（§1.3）后的常驻项：改产物树/HOME 布局先跑 `test:treeface`；`case-table.ts` 只走
    `pnpm regen:case-table`；`case-flags.ts` 只走 `pnpm regen:case-flags`（两张都是实测生成物，别手改）；native seam 新增分岔口照「复制 `*.native.ts` 覆盖」办理；
    改 `packages/runtime/src` 内的**发射形状/函数形状**（新增 helper、往函数表塞值、换码点展开写法）先跑 `node tools/scriptc-check.mjs 234`（38s 面探针，`pnpm release` 的 2b 就是它）再提交。
14. 两条观察项（记录，不动）：dist 内容哈希块名（HOME/export 均按 glob/目录读，无门依赖具体块名）；
    门粒度（无子集运行能力，靠各门自带 `--quick`/筛选参数）。

---

## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- 性能优化 —— 先要正确，数字等有 benchmark 再说
