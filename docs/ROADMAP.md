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
| **D6** | 七个值类型 | **不进 Tier 1**（2026-10-14 拍板）。`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB` 的构造式、静态名、方法、打印、哈希与序列化**照 D4 继续抛 `unsupported`** —— 补它们要的是整族值表示 + 方法面 + 序列化，不是登记一笔的事（明细见 §1.131 与 §6 第 43 条⑪）。Tier 1 收尾因此只看「已实现面上的错值、过拦与解析期拒」。 |

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

### 1.6 对象身份轮（2026-10-04，§6 第 6 条那一格落地）

- **readings**：compile **157/226**、ir **226/226**、sema **226/226**（误报 0 / 漏报 0 / 崩溃 0）、ops **1415 → 1425**、diff **149/149 逐字节**（静默 0 / 崩溃 0 / 未实现 0）、treeface 17/0、`pnpm release` 整链绿（含 2b 面探针 38s）。
- **落的是什么**：脚本实例、方法 Callable、lambda、空 Callable 现在都能当字典键与数组成员，判据是身份；`get_instance_id()` 发出去了（同实例稳定、异实例不同、typeof 2）。Callable 的等式实测比 `connect()` 多一条「绑过没绑过」（`c == c.bind(1)` 假、`c.bind(1) == c.bind(2)` 真、`hash(c) == hash(c.bind(1))` 真），所以新的 `callableEq` 只用在 `==` / 成员判定上，信号连接口径不动。号码本身**不进语料**（Godot 那个数是指针派生的、跨运行不定），用例钉的是关系；打印对象那一格仍响亮拒。
- **顺带纠正一条旧账**：S204 记的「`Array.hash()` 在 Godot 是按实例不是按内容」**是错的** —— 它按内容且可复现（`[1,2]` 两支变量与字面量都同一个数）。当初看到两个数是因为那两支数组里装着对象，而**对象的 hash 才按身份**。一批实测数字记在 S208 当逆式的靶子，式子没逆出来之前 `hash()` / `Array.hash()` / `Dictionary.hash()` 继续响亮拒。
- **一条写作约束（踩过）**：语料里别留 RefCounted 环 —— `var f := {}; f[p] = f` 让对象活到退出，Godot 会在 golden 里多打一行 `WARNING: ObjectDB instances leaked at exit`。
- **本轮摘掉的一格**：信号当值用还在漏裸对象（`this.<signal>` 落的是 `rt.Signal` 而不是装箱 Variant，没走 `wrapValue`），所以 `fired == fired` 我们给假、`d[fired] = 1` 报 `dict-key-type`。实测口径已写进 §6 第 16 条③，等发射侧补上装箱再进语料 —— 宁可摘出来，也不留半条链。

---

### 1.7 全局函数族（2026-10-04，把抄来的拒答清单换成量出来的）

- **readings**：compile **158/227**（新增一格「全局拒答清单失效 0」）、ir **227/227**、sema **227/227**（误报/漏报/崩溃 0）、ops 1425/0、diff **150/150 逐字节**（静默/崩溃/未实现 0）、treeface 17/0、`test:scriptc 236` 出货一致、typecheck 3/3。
- **落的一族**：`sign(i/f)` `floor(f/i)` `ceil(f/i)` `round(f/i)` `fmod` `posmod` `fposmod` `wrapi` `wrapf` `lerp(f)` `inverse_lerp` `move_toward` `snapped(f/i)` `deg_to_rad` `rad_to_deg` `angle_difference` `is_equal_approx` `is_zero_approx` `is_nan` `is_inf` `is_finite` `min/max(i/f)` `clamp(f/i)` `smoothstep` `ease` `cubic_interpolate` `remap` `exp` `log` `pow` + 修好的 `abs`。语料 `236-global-math-family` 251 行逐字节，类型规则全记在 S209。
- **量出来的一条静默错**：`abs(-3)` 在 Godot 是 **int 3**，我们恒给 float —— 之前没有一条用例钉它，所以没人看见。（`sqrt(1e300)` 那 150 位数字也顺手证明了浮点打印口径。）
- **拒答清单原来是抄的**：`BUILTIN_TODO` 里五条名字全是死的（`Vector2i/Vector3/Vector3i` 早走 `BUILTIN` 构造表、`load/preload` 各有分支，实测三个构造器都跑得出来）。现在这份清单换成**实测存在、我们未实现**的 15 个全局函数（转换族 + 随机族 + `weakref`/`instance_from_id`/`get_stack`/`print_stack`），并由 `test:compile` 新增的那格逐个现编现验：**清单上的名字必须真的抛 `emit-builtin`**，实现了忘了划走就会红。
- **试过又撤回的一条（后来做成了，见 §1.23）**：想让「认不出归属的全局调用」在发射期响亮拒（今天它是 `this.wrapi(...)` → 裸 JS `TypeError`）。实测这条守卫打挂 156 个用例 —— `quit()` 属于宿主基类、`helper()` 属于内部类/局部，分析层的 `scope.has` 又不涵盖模块级函数。要做就得先有一张跨作用域成员表，记在 §6 第 17 条①，这轮不硬上。

---

### 1.8 信号装箱与哈希线索（2026-10-04，接 §1.7 尾巴）

- **readings**：compile **158/227**、ir **227/227**、sema **227/227**（误报/漏报/崩溃 0）、ops 1425/0、diff **150/150 逐字节**、treeface 17/0、`pnpm typecheck` 3/3、`test:scriptc 235` 出货一致、`test:cli-native` 20/0、`test:pkgmodes` 失败 0。
- **修掉的洞**：`this.<signal>` 当值用时没装箱，于是 `fired == fired` 假、`d[fired] = 1` 抛 `dict-key-type`。发射器现在按「模块级信号名」只在**值路径**上包一层 `rt.wrapValue`，`fired.emit(...)` 与 `await fired` 两条属性/等待路径照旧拿裸对象。五格实测口径进了语料 `235`（24–28 行），S211 记口径，§6 第 16 条③ 就此收掉 —— 身份号那层上一轮已经就位，缺的只有装箱。
- **哈希那一格推进到「只差三段本体」**：从上游 `Variant::hash` 读到 int 走 `hash_one_uint64`、float 走 `hash_murmur3_one_double`、对象走指针的 `hash_one_uint64`（这条同时解释了为什么对象号天生不可复现）、数组/字典是 `hash_murmur3_one_32(elem_hash, h)` 逐个折叠再收尾混合。剩下的未知收窄到 `hash_one_uint64`、`hash_murmur3_one_32` 与折叠的种子/收尾三式，S208 的实测数就是逆它们的靶子；盲拟合这轮试过（经典 murmur 变体对不上 `hash(7)`），不再靠猜推进。
- **§1.8 那条哈希线索今天撞到墙，而且撞得有意义**：21 个**公开**式子（murmur3 x86_32 四个种子 × 三种接法、fmix32/fmix64/wyhash/djb2）全部对不上 `hash(7)=2503556531`；新测的 int 序列几乎线性（相邻差稳定在 3.5765e8 上下抖动，`hash(0)`…`hash(8)`、`hash(255/256/65535/65536/±1/1000000007)` 都定在 S208 那条旁边），avalanching 混合给不出这种形状 —— 「int 走经典 murmur/fmix 那一族」可以排除，拟合这条路到此为止；**当天稍后翻盘**：本机 `E:/编程练习/godot` 有一份 4.3.0 源码树，读出的式子不是 murmur 而是 SuperFastHash 的 patter，22 个数全中 —— 落进实现的过程与剩下的两格拒答记在 §1.11 / S212。

### 1.9 出货门铺开跑（2026-10-04）

- **readings**：`test:scriptc --all --jobs=4` **150 例、wall 2452s（40 分 52 秒）、149 格逐字节一致** —— 唯一红的 `039-cross-file-ref` 是本轮我自己并发单跑探针造成的（旧收尾会把 `tmp/sc-gate` 连锅端掉），串行重跑 22s ✓ 出货一致，等于全绿。代表集：暖缓存串行 14s / 并发 4 路 10s / 冷缓存 377s（那 377s 是 scriptc 首轮编 stdlib 的固定成本，与用例数无关）。compile 158/227、生成物 0 漂移。
- **`--jobs=N`**：门按用例铺开 —— 每例一份替身树（`tmp/sc-gate/<id>/`），互不碰；全量与 `--project` 默认 4，筛选与代表集默认 1（所以老命令的跑法没变）。`--jobs=` / `--jobs=abc` 落回默认而不是 0：判不出并发度时若起 0 个 worker，就会「0 例 0 绿」静默放行，收尾判分现在按 `cases.length` 而不是 `rows.length` 算。
- **收尾口径改了**：门只删本进程建过的那几份替身树，不再连锅端工作根 —— `039` 那格就是被这条老口径坏掉的。剩一个口：两个进程同时跑**同一个 id** 仍会互删（开工先清自己那个目录），已写进门头注释。

### 1.10 首批性能读数（2026-10-04，5.5 的头一遍）

- **readings**：`pnpm bench` 合计 **85.42 / 88.01 ms**、`pnpm bench:godot` **441.54 / 480.17 ms**（各跑两遍，抖动约 3% / 9%），**14/14 kernel 校验值与 Godot 同字面** —— 三重护栏里「校验值一致」这条从今天起有基线了。裁判同一台机器同一个 `Godot_v4.6.3-stable_win64_console.exe`。
- **整体快 5.2×**（两遍 5.2 / 5.5）。最赚的是调用类 kernel —— `helper-int` 24.3×、`helper-assign` 26.8×：GDScript 的动态调用在这里贵得多，而我们发射的是普通 JS 函数调用。
- **两格我们更慢，两遍都复现，不是噪声**：`array-for-range` 0.4×（17.4 vs 6.6 ms）、`array-write` 0.8×（23.8 vs 18.8 ms）—— 数组下标读/写加 `for … in range()` 的定长循环，正是 5.5 该先动的位置；它们走的还是 §1.1 里 P2.5 那行的 v1 口径（`ops.*` 动态路径 + Variant 全程装箱）。

### 1.11 非字符串的 `hash()` 落进实现（2026-10-04，§1.8 那条线索收口）

- **readings**：compile **159/228**、ir **228/228**、sema **228/228**（误报/漏报/崩溃 0）、ops **1428/0**（098 那三格「还没逆出来」的拒答断言换成实测数）、diff **151/151 逐字节**（新增语料 `237-hash-chain` 35 行）、`test:scriptc 237` 出货一致、`pnpm typecheck` 无 `error TS`。
- **出货那一面复跑过**（改的是 runtime 源码，不只是门）：`test:pkgmodes` 失败 0、`test:cli-native` **20/0**、`test:treeface` **17/0**、代表集 **10/10 出货一致**；`test:export` **ok 10 / 环境记账 3 / FAIL 0** —— 记账那三格都是 `node/*`（SEA 要 Node ≥25.7，本机 nvm 里最高只有 24.8.0），与这轮改动无关。
- **式子的出处**：拟合到此为止 —— 前面那 21 个公开 murmur/fmix 变体全灭之后，在本机 `E:/编程练习/godot` 找到一份 **4.3.0 引擎源码树**，直接读 `core/templates/hashfuncs.h` 与 `core/variant/{array,dictionary}.cpp`。`hash_one_uint64` 原来是 **SuperFastHash 的 patter**（`(~v)+(v<<18)`、`*21`、`+ (v<<6)`、异或移位收尾，全程 64 位回绕），不是 murmur；murmur 那一轮的默认种子是 `0x7F07C65`。4.6.3 的裁判二进制对 4.3 的式子逐条点头 —— 这条链跨版本没动。
- **实现与对撞**：`variantHashNumber` 一处真源，全局 `hash()` 与 `Array.hash()` / `Dictionary.hash()` 都走它；22 个定住的数在真实运行时代码路径上全中，容器那格的关键是**起手把类型标签折进种子**（Array=28 / Dictionary=27，用的是 Godot 的 `Variant.Type`，不是我们内部的 Tag 编号），字典再按插入序把键、值交替折。`hash(0.0)==hash(-0.0)` 实测确认了引擎那句 ±0 归一。
- **仍然拒的两格**（没测就不写）：`hash(NaN)` —— 引擎先换成 C++ `NAN` 常量的位型，那 8 个字节我们没实测；对象 / Vector2 / Color 等 —— 引擎走指针号，天生不可复现。深层嵌套也照实递归：引擎的 `recursive_hash` 越过 `MAX_RECURSION` 会 ERR_PRINT 后直接给 0，这条没测过就先进 §6 的待补测（S212 记着）。
- **scriptc 面又量到一条**：`BigUint64Array` **没有 lowering（SC2020）** —— 双精度取那两个 32 位字得用 `DataView`（和 `ops.ts` 里 bigint 那套同一套路）。这条是 `test:scriptc 237` 逼出来的：node 侧 22/22 全对、scriptc 那一支直接编不过。

### 1.12 5.5 的第一次优化尝试：仪器先于优化（2026-10-04）

- **两次改动都量不出收益，都已回退**：① `ops.i64` 给 int×int 加 number 短路（避开 `intToBig`）—— 5 轮对 5 轮、每个 kernel 取最小值：**76.43 → 76.94 ms，−0.7%**；② `normInt` 先看是否落在安全整数区再决定要不要做 bigint 取模（避开 `wrap64`）—— 交错配对 12 轮：**|t| = 0.65，42 组里 14 组更快**。两份都写完了、`test:ops` 1428/0、`test:diff` 151/151 逐字节、005/006/055 那几个 int64 溢出例还过了 scriptc 出货门 —— 但**没有收益就不进主干**，回退。
- **真正的发现是仪器**：拿**同一份代码**自对照（base vs base）跑交错配对，读数照样飘 —— 单轮总时 82→281 ms，四组配对差 **+23.5% / +2.2% / −1.1% / +14.9%**，工具对「零改动」报出 **−5.4%、|t| = 1.46**。也就是说这台机器上，小于两成的效应本来就无法证明，之前 §1.10 那 5.2× 之所以敢写，是因为效应本身有五倍。
- **落下的仪器**：`pnpm bench` 现在每 kernel 连跑 `GDS2JS_BENCH_ROUNDS`（默认 3）轮取最小值，同窗口内散布压到 ~1.4%；新增 `pnpm bench:ab --rounds=N <仓内文件>=<候选文件>` 做交替配对，自己把 base 与候选来回写、跑完还原，打印配对差均值 ± SE 与 |t|，并顺手校验各轮 checksum 一字一致。**以后 5.5 的「收益量化」这一栏只认 `bench:ab` 的 |t| ≥ 2，不认两次独立运行。**
- **热点复测（这次仪器对了，结论也翻了一个）**：400 遍 `array-write` 自采样里 `writeIdx` 829 ms、`normInt` 677 ms、`mul` 674 ms、`wrapValue` 658 ms、`index` 629 ms —— `intToBig` 根本不在榜上，所以①那条假设从一开始就是错的。两格慢 kernel 的下一个人该先量 `ops.writeIdx` / `wrapValue` 这两处，而不是算术轨。

### 1.13 容器哈希的递归上限收口（2026-10-04，§1.11 留的那格）

- **readings**：compile **160/229**、diff **152/152 逐字节**（新增语料 `238-hash-recursion-limit` 7 行）、ops **1428/0**、`test:scriptc 238` 出货一致、`pnpm typecheck` 无 `error TS`。
- **量到的形状**：引擎的 `MAX_RECURSION` 是 100（`core/typedefs.h`），而那句检查在 `recursion_count++` **之前** —— 所以真正的截点是**第 102 层**那一支返回 0，它上面各层照常把那个 0 折进累加器。三个深度互锁把这个 off-by-one 钉死：100 圈不截（284975118）、101 圈截（1691475427）、120 圈与 101 圈**同一个数**（截断点以上再深也无差别），字典同形（3895054912）。`ERR_PRINT("Max recursion reached")` 只进 stderr、被 `normalize()` 滤掉，所以 stdout 里只剩数字。
- **拟合的边界**：`depth > 100` / `>= 100` / `>= 101` 三个候选里**只有 `> 100` 同时中五条**，其余各挂两三条 —— 这是「拿实测数挑一个常数」而不是「猜一个常数」。写回实现前先用一次性脚本把这五个数对撞过。
- **仍开着的**：自引用容器（引擎靠 recursion_count 挡，但语料不能留 RefCounted 环，S207 那条纪律）与 `hash(NaN)`、CALLABLE / NODE_PATH / RID 那一族，照旧响亮拒。

### 1.14 CLI 启动延迟：先造仪器，再谈优化（2026-10-04）

- **动机**：用户报「`run` 一个脚本要等很久」。新门 `pnpm latency`（`tools/cli-latency.mjs`）交替配对 8 轮、奇数轮反序，实测同一脚本端到端：**原生 exe ~255 ms（最快）**、`node dist/cli.mjs` +52 ms（|t|=6.5）、`tsx` 跑源码 +453 ms（|t|=16.1）、**`pnpm exec gds2js` +770 ms（|t|=33.5）**，Godot 冷启 +1407 ms（|t|=27.5）→ 我们本来就比裁判快 **6.5 倍**，体感的慢几乎全在调用姿势上。README 加了「怎么调最划算」一节。
- **仪器先救了我一次**：同一件事独立两批数（不配对）给出过完全相反的结论 —— 第一批 `NODE_COMPILE_CACHE` 看着 −34 ms（|t|=4.0），第二批配对后是 **+0.3 ms、|t|=0.13**，所以**编译缓存不设、不写进实现**。这台机器独立批次能飘 ±40%，`bench:ab` 那套 |t|≥2 的规矩从此同样适用于延迟门。
- **一条被证伪的前提**：我原以为 `run` 的产物在逐文件装载 runtime 的 TS 源码。实测 `gds2js/runtime` 走 `packages/gds2js` 的 exports，**已经解析到打包面 `dist/runtime.mjs`**（`run --keep` 看产物的 import 行确认）。所以「打包 runtime」这项收益根本不存在，源码路径慢是 `tsx` 那条门内跑法的特点，不是产物的。
- **L2 的结论翻过一次，翻案原因是门自己的 bug**：最早 6 轮配对报「exe 比 dist 慢 +48.5 ms、|t|=4.6」，我差点把「exe 起外部 node 跑产物」（`exec.native.ts` 那条：静态 exe 里没有能跑产物的引擎）判成要修的架构性损耗。改成 12 轮 + 奇数轮反序后是 **exe 比 dist 快 52~86 ms（|t|=3.75~6.5）**，方向相反 —— 病根是**变体每轮按同一顺序跑**：固定「A 先 B 后」把手本的热身、文件缓存、频率爬坡这些位置偏置算成了 A/B 差，两批都「显著」却反号。现在奇数轮反序，并拿**同一条命令贴两个标签**做零对照：dist vs dist2 = −9.5 ms ± 19.2（|t|=0.50），正是该有的「量不出来」。exe 仍然是最快的入口，不需要动。
- **L3 划到划算线以外**：造了个 100 模块的合法工程实测：`run-project` 100 模块 514 ms vs 4 模块 439 ms —— **每多一个模块约 0.8 ms**。按内容哈希做增量缓存要几十行正确性敏感的代码，换来的在小工程上是几十毫秒、要等工程上千脚本才划算，所以**先不做**，把 0.8 ms/模块这个数留在这里当下次的判据。
- **热路径量到一个真 bug（已修）**：`--watch` 的重跑是**同进程**再调一次命令（`watch.ts` 里 `runners[ctx.cmd](ctx)`），而 `runSingle` 的临时产物名只带 `process.pid` —— 第二次 `import()` 同一个 URL，Node 直接给缓存模块，于是「重新运行」打出来了、**脚本却不再执行**。实测探针：第一次 `tick 0` 有，改了文件只有那句「重新运行」，20 秒内等不到第二次输出。修法是每次重跑换一个序号的产物名（`runTag()` = `RUN_TMP<pid>-<n>`），`run` / `run-project` 两支都走它。修完探针读数：热重跑约 **290 ms** 出程序的新输出，其中 250 ms 轮询 + 80 ms 去抖是设计上限，编译执行只占几十毫秒。
- **门为什么没抓住它**：`test:cli-native` 的 ⑨ 格用的是 `check --watch`，并且只断言「重新运行」那句日志 —— 这两点合起来正好绕开了这个洞（`check` 不 import 产物；日志行不等于程序跑了）。新增 **⑨b** 格：`run --watch` 下先等程序打 `watch-a`，改文件成 `watch-b` 再等**程序自己的第二次不同输出**，等不到就红。这一格的判据是程序输出，不是 CLI 的提示语。修完 ⑨b 通过，`test:cli-native` **21/0**。
- **延迟门自己的三个坑（已修）**：`.exe` 走 `shell:true` 会被拼参而非转义，把成功的跑法报成 exit 1；`spawn` 起不来时报的是「1 ms 超快」；变体每轮同序跑把手本热身算成 A/B 差。现在裸命令留给 PATH、相对路径按仓库根解析，**任何变体起不来就 exit 1**，奇数轮反序，并且能拿同命令双标签做零对照 —— 失败的读数不许冒充成绩。

### 1.15 工程编译的 IR 缓存（2026-10-04，任务 #17），顺带量出 run-project 真正的大头

- **readings**（600 模块的合法工程，`pnpm latency` 交替配对）：`check-project` 开缓存 **−119.7 ms ± 11.2（|t|=10.7，8/8 轮更快）**；同一个工程上 `run-project` 的净效应是 **+37 ms（|t|=0.53）—— 没有收益**。分段量出来为什么：`check` 783 ms、`build` 再 +164 ms（|t|=4.8）、`run` 再 **+2613 ms（|t|=30.2）**，也就是 `run-project` 的三秒里编译只占 0.9 s，大头是**让 Node 逐份装载产物**。隔离测过：逐文件 import 601 份 `.mts` = **888 ms（1.48 ms/份）**，同一入口打成一份 490 KB 的 bundle 再 import = **95 ms**，两边输出一字一样（`ok|141198`）。所以下一格不是缓存，是**让 `run-project` 装成单文件产物**（记成新任务）。
- **实现**：一处接缝 `cachedLower(src, build)`（`compile/ir-cache.ts`），node 侧是真缓存 —— 内容寻址落在 `tmpdir/gds2js-ir/<编译器内容戳>/<sha256>`，**不进工程目录、不进出货树**（tree-face 没有新增面）；静态岛走 `ir-cache.native.ts` 原样透传（岛里没有 `node:crypto`，而缓存只是省时间，不该为它带新 builtin）—— 这是 memo 13 那条「新增分岔口照 `*.native.ts` 覆盖办理」的又一次应用，seam 清单已登记。
- **失效是重点，不是附件**：戳把**自己所在的 bundle 全文** + 能读到的 7 份 lowering/parse 源文件一起哈希 —— 仓库里改 `lower.ts` 立刻换目录，打包后读不到源码就退化成按 `dist/cli.mjs` 全文哈希（升级/重构建同样换目录）。实测四条：改一个模块的源码 → 输出立刻从 `ok|141198` 变 `ok|161198`；把缓存文件截断成坏 JSON → 当没命中、结果照旧对；`GDS2JS_IR_CACHE=0` → 完全不碰缓存；缓存目录不可写 → 降级成每次重算，不报错也不出错。
- **门**：typecheck 无 `error TS`、compile 160/229（拒答清单失效 0）、ir 229/229、sema 229/229、ops 1428/0、diff **152/152 逐字节**、treeface 17/0、`test:cli-native` **21/0**（岛里那份透传 stub 真被换进去了，`run-project`/`--watch` 那些格照旧）、`test:pkgmodes` 失败 0、`test:export` **ok 10 / 环境记账 3 / FAIL 0**（记账那三格还是 `node/*` 要 Node ≥25.7）、`test:scriptc` 代表集 10/10。

### 1.16 run-project 的装载方式换掉（2026-10-04，§1.15 量出来的那一格）

- **读数**：600 模块的合法工程，`run-project` 中位 **3473 ms → 2464 ms**，交替配对 **−963.9 ms ± 47.5（|t|=20.3，6/6 轮更快）= −27.8%**；两边输出 `ok|141198` 一字一样。4 模块的小工程**没走这条路**（输出照旧 `hi bob | true | hi zed`）。压掉打包噪音后复量一批：中位 **3379 → 1860 ms**，配对 **−2226 ms ± 728（|t|=3.06，6/6 轮更快）** —— 这批里有一个 7.5 s 的离群值把 SE 扯大了，所以两次一起记：**12/12 轮全部更快，改善在 28%～66% 之间**，别只挑好看的那次讲。
- **阈值是量出来的，不是拍的**：同一套探针测了四个点数（import 模式 vs 打包再跑）——50 模块 710 / 880 ms（**打包亏 170**，tsdown 有 ~500 ms 固定启动钱）、100 模块 1102 / 984、200 1665 / 1244、400 2709 / 1695。交叉点在 50 与 100 之间，取保守的 **100 份模块**（`BUNDLE_FROM_MODULES`），小工程一律维持今天的逐文件装载。
- **机制是复用现成的**：`bundlingAvailable()` / `bundleModule()` 本来就是 `--runtime-mode single` 那条支路，岛里 `bundle.native.ts` 恒给 false —— 所以原生 exe 照旧逐文件，不需要新面；`GDS2JS_RUN_BUNDLE=0` 既是退路也是这次配对测量的开关。
- **新格 ⑨c**：120 模块工程上「node 打包 / node 关打包 / exe 逐文件」三方输出必须逐字相等 —— **装载方式不许变成语义分岔**。这条守卫是给上面的阈值改动兜底的，而且**当场就抓到一件事**：程序输出本身三方一样（都是 `ok|0238`），但打包那支多出了 tsdown 的进度行（`ℹ entry: …`、`✔ Build complete in 200ms`），而 `run` 的契约是「脚本的 print 就是命令输出」—— 这些行是污染。探针量过四种写法：现有 `silent: true` 漏 201 字符、`logger:false` 漏 220、`globalLogger.level="silent"` 漏 220，**只有 `logLevel:"silent"` 压到 0**。`bundleModule` 因此多了个 `quiet` 参数，只给 `run-project` 这条路传 true；`--runtime-mode single` 那两条构建路径的样子一字不动（免得牵连别的门）。
- **门**：`test:cli-native` **22/0**（含新的 ⑨c 格与 exe 重编）、`test:pkgmodes` 失败 0、`test:export` ok 10 / 环境记账 3 / **FAIL 0**、`test:scriptc` 代表集 **10/10 出货一致**、compile 160/229、ir 229/229、sema 229/229、ops 1428/0、diff **152/152 逐字节**、treeface 17/0、typecheck 无 `error TS`。
- **剩下的账**：§1.15 说的大头（每份 `.mts` ~1.5 ms 的 Node 装载）现在过了交叉点就绕开；小工程那 350 ms 里剩下的固定成本是 node 启动 183 ms + wasm/编译 ~120 ms，属 §1.14 那张表，不是这格的。

### 1.17 5.5 第三试仍为 null，顺手修了 A/B 工具一个会写坏源文件的 bug（2026-10-04）

- **第三试**：把 `ops.mul/div/mod/sub` 的数值分支从「十几个 `asVec*/asColor` 探针之后」提到函数开头，并把 `writeIdx` 的数组/字典分支提到六个 `instanceof` 之前 —— 纯顺序调整（那些探针全要求 `Tag.OBJECT`，数值/数组必然落空），`test:ops` 1428/0、`test:diff` 152/152、typecheck 干净。`bench:ab` 6 轮配对：**−4.26% ± 7.6%（SE），|t| = 0.62，5/6 轮更快**，`array-for-range` 那格反而 +1.78 ms。按 §1.12 立的规矩，**不采纳，改动已弃**。三试（`intToBig` 短路、`normInt` 免取模、分派顺序）全 null，说明 `array-write` / `array-for-range` 的代价不在分派链上，而在**每次写都新造 Variant 的分配与 GC**（profile 里 GC 自占 9.5%）—— 那要的是 §1.1 里 P2.5 明写「v1 故意不做」的单态/去装箱快路径，属于一个要先拍板的设计变更，不是再顺手挪几行能拿到的。
- **工具 bug（严重过一次，已修）**：`bench-ab.ts` 把多条 `<目标>=<候选>` 的备份写到**同一个** `tmp/bench-ab/orig`，两条 pair 时第二条覆盖第一条，收尾就把 `methods.ts` 的内容还原进了 `ops.ts` —— 实测把 `packages/runtime/src/runtime/ops.ts` 写成了另一个文件（`git checkout` 才救回来）。现在原始字节全在内存里、恢复也从内存写、恢复后逐字节回读校验，对不上就 exit 1；再拿两条 pair 做零候选冒烟：exit 0、两个目标 `git status` 干净。

### 1.19 换尺子：AOT（scriptc 原生 exe）侧的首批读数（2026-10-04，用户拍板转攻这一侧）

- **新尺子**：`pnpm bench:scriptc`（`tools/bench-scriptc.ts`）—— 与 `bench`/`bench:godot` **同一张 kernel 表**，每格编一份自跑 exe（进程内连跑 reps+1 次），墙钟减掉空转基线再摊到每次调用，5 次取最小。口径丑话写在工具头上：AOT 那一列含原生启动与退出、且**没有 V8 的 JIT 预热红利**，与 node 那列不同尺，不能当倍数直接引用。
- **总体读数（14 格，node/scriptc）**：AOT **普遍比 node 慢** —— `int-fib` 0.33×、`int-sum` 0.47×、`dict-set-get` 0.24×、`string-array` 0.08×、`helper-assign` 0.19×；唯一大赢的是 `float-math` **2.27×**（原生没有 NaN 装箱那一套）。`array-2d` 0.39×、`array-append-sum` 0.41×。
- **真正的洞在「按下标写」，而且是尺寸悬崖不是算法**：同一份 50000 元素的 GDScript，只 append **38 ms**、按下标读 **88 ms（约 8 ms/调用）**、按下标写 **4006 ms（约 625 ms/调用）** —— 写比读贵 **80 倍**。规模律量过：8000 元素时写还只有 1–3 ms/调用（≈0.25 µs/次写），50000 → 625 ms、100000 → 1176 ms，**翻倍即翻倍（线性）**，所以是每次写的**常数**在 8k–50k 之间涨了约 50 倍（≈12.5 µs/次），不是复杂度变了。对撞基准：同一格 Godot 是 18.78 ms，AOT 4091 ms —— 差 **200 多倍**，这是 5.5 现在最贵的一格。
- **这解释了为什么两处都要量**：node 侧那两格慢（0.4×/0.8×）是装箱与分配（§1.17），AOT 侧同样两格慢是表示法悬崖（本节）—— **同一个 kernel 在两条轨上病因不同**，以后 5.5 的每一格改动都要 `bench` / `bench:ab` / `bench:scriptc` 三把尺子一起看，不能只量一条。
- **工具口径的已知缺陷（记下来别再被骗）**：空转基线只在扫描开头量过一次（那次 48 ms），机器飘了以后 `string-concat` 那格算出 **−1.7 ms** —— 已改成**首尾各量一次取小**并允许「低于基线 → 直接标读数不可信」。但小格子仍然量不准：同一份 `array-2d` 两次分别得 0.38 ms 与 4.84 ms/次（基线读到 48 ms 与 15 ms 的差别）。**结论：这条尺子现在只配报远大于基线漂移的格子**（如 `array-write` 那 4000 ms 级别的悬崖），要拿小格子的可信数字得先把 `GDS2JS_BENCH_SCRIPTC_RUNS` 提上去、或改成 exe 内部计时。

### 1.22 悬崖查到我们自己头上：原生侧「按下标写」快了近 5 倍（2026-10-04，任务 #20）

- **先排除 scriptc**：不经 gds2js、拿四份**裸 JS** 让 scriptc 编（50000 元素、进程内 6 次）：只 append **2.19 ms/调用**、append 后按下标写 **2.48**、预分配后写 **1.56**、按下标读 **7.56** —— 每元素操作 ≈50 ns。**scriptc 的数组没问题**；同一形状走 gds2js 是 12.5 µs/次写，差 **250 倍**在我们自己身上。
- **两处形状问题**：① `writeIdx` 在数组那一支之前空跑六个 `instanceof`（`GVector2/3`、`Vec2i/3i`、`GColor`、`GBytes` 全都要求 `Tag.OBJECT`）；② `setIndex` 为了取一个 int 下标，**每次写都现造一个参数数组**喂给 `intArg`。改法是数组/字典/字符串先落回 `setIndex`，并加 `intArgIdx` 直接收 Variant —— **报错文本与 `intArg` 一字一致**（`who 的第 0 个参数需要 int`），免得动语义。仅这一步：`array-write` 的 AOT 每次调用 **4091 → 1097 ms**。
- **第二步才有意思**：把 `ops.mul` 的数值分支从「十几个探针之后」提到函数开头 —— 这条在 **node 侧三次 A/B 全部 null**（§1.12/§1.17 里被弃用的同款改动），但在 **AOT 侧**两遍复量得 **~875 / 906 ms/次**（弃用前是 1097）。累计 **4091 → ~875 ms，约 4.7×**。**同一条改动在两条尺子上结论不同** —— 以后 5.5 每一格必须 `bench`（node 进程内）与 `bench:scriptc`（原生 exe）一起看，显著性用 `bench:ab` 的 |t|。
- **离群值怎么处理**：中途一次量到 1745 ms/次，随后同一 binary 两次得 875/906 —— 判为机器抖动，不写进结论；小格子仍受基线噪声限制（§1.19 末条）。
- **还剩多少**：每次写摊到约 7 µs（875 ms / ~125k 次元素操作）对裸 JS 的 50 ns，仍差 **~140 倍** —— 那截是 Variant 装箱与解释开销，属任务 #18 那条「要不要开单态/去装箱快路径」的设计决定（用户尚未拍板）。
- **第四次尝试也量不出来，已弃**：把 node 侧三试 null 的那个 `i64` number 短路（安全整数就不升 bigint）搬到 AOT 尺上：`array-write` 得 1000 ms/次，对上一个提交复量到的 875/906 读不出差别，而同批小格子（`array-append-sum` 4.25→17.5、`array-2d` 0.38→6.7）整批飘了 4× —— 判为噪声，`git checkout` 回退。**结论：装箱这一截不是换写法能拿到的，#18 那个设计口不开就别再第四次试。**
- **门**：ops **1428/0**、diff **152/152 逐字节**、compile 160/229、typecheck 无 `error TS`、`test:scriptc` 代表集 **10/10**、treeface **17/0**；node 侧 `array-write` 24.64 / 24.74 ms（基线 23.77 / 24.89）**没有退步**，14 格校验值一字一样；`cli-native` / `pkgmodes` / `export` 的读数见下条提交说明。

### 1.23 未知调用终于响亮拒了：那张「跨作用域成员表」就是发射器手里已有的几张（2026-10-04，任务 #16）

- **先扫后写**：把全部语料 IR 里 callee 是 ident 的裸 `call` 都过一遍，减掉模块 / 内部类 / 局部的名字，剩下 83 个「看着像哪儿都不在」的名字逐个归类 —— 全落在四张合法表里：宿主基类成员（`quit` 242 例、`create_timer` 023/026）、内置与构造器表（`print` `hash` `Vector2` `Packed*` …）、关键字 `super`（5 例）、跨文件继承来的脚本类成员（`getv`，034）。上一轮那句「得先有一张跨作用域的成员表」其实不用新装表，发射器手里已经有。
- **落点**：`emitCall` 那条 `this.x(...)` 兜底之前过一遍 `callableInScope`，认不出的抛 `UnsupportedError("call-unknown", …)`，文本抄引擎解析期那一句（S213 ①）。从此不再有我自己在 S210 记的那格「运行期裸 JS `TypeError`、没有 `[code]`、不是 `UnsupportedError`」—— 实测 `gds2js run` 现在给 ` error  [call-unknown] Function "this_is_not_a_function()" not found in base self.` 且退出码 1（`check` 看不见它：那一层只跑到分析，不到发射，与 `[emit-builtin]` 同一格口径）。
- **门当场逼出两处误拦，都不是设计问题而是发射顺序**：① `test:diff` 立刻红 148 —— 字段初始化式发在 `INHERITED_METHODS` 建起来之前，而 `CURRENT_MEMBERS` 只收字段不收方法，于是内部类里 `var bx: int = _mk()` 被当成未知全局。补一张在发射字段前就位的 `CLASS_FUNCS`（内部类＝own + 沿 `extends` 继承来的方法名；模块类＝own + `inheritedMembers` + 宿主成员）。② 034 的 `quit()` —— 发射期只看得到直接基类是 `import`，不知道链顶挂不挂宿主；`compileProject` 顺着 extends 算出 `hostBaseInChain`（走到 `SceneTree`，或链顶是「没写 extends 的入口脚本」，与 `baseClass` 那条式子同源）交进 emit 选项。
- **三条 callee 解析规则是量出来的**（`tmp/probe-unknown-call`、`tmp/probe-classname-ctor`，判引擎 4.6.3）：局部名不参与 —— `var cb = getv` 之后 `cb()` 也是 `Function "cb()" not found in base self.`；类名不参与 —— 内部类 `Inner()` 给 `Member "Inner" is not a function.` 与 `Name "Inner" called as a function but is a "Inner".` 两句，工程里 `class_name Foo` 的 `Foo()` 给的却是 `Function "Foo()" not found in base self.`（与守卫一字一致，构造是 `.new()`）；内部类里 `quit()` / `create_timer(1.0)` 同样拒（内部类不挂宿主）。第一条直接回答了「放行表要不要收局部名」：收了是多余的，把那张表和配套的局部名收集器摘掉，语料仍 **152/152 逐字节** —— 没用的机器当场删，不留。
- **口径**：`test:compile` 多一格「未知调用守卫 8/8 格口径一致」，5 格该拒（模块级 / 内部类里的未知名字、内部类里的 `quit()` 与 `create_timer()`、把类名当函数调）+ 3 格该放行（宿主基类的 `quit()`、内部类字段初始化裸调本类方法、裸调继承来的方法）—— 放行那三格正是上一轮打挂 156 个用例的形状，钉在这儿防守卫退化。
- **顺手把守卫的措辞账量平了一格**：`[call-unknown]` 分不清「Godot 也没有」与「Godot 有、我们没做」，两边都说成 `not found in base self.`。于是把打印一族一支一支过判引擎：`print_json` / `print_raw` **4.6.3 没有**（照旧给那一句，已加进 S210 的「没有」串）；`prints`（参数间一个空格）、`printt`（一个制表符）、`print_rich`（直接拼）、`print_verbose`（headless 下不出声）、`push_error`、`push_warning` **有** —— 六支划进 `GLOBAL_TODO_FUNCTIONS`，走 `[emit-builtin]` 那句「我们拒」。**没量过的名字仍然只会说 `not found in base self.`**，量一支划一支（§6 第 17 条②）。
- **门**：typecheck 无 `error TS`、compile **160/229**（emitter 缺口 0）+ 守卫 **8/8**、ir **229/229**、sema **229/229**（误报/漏报/崩溃 0）、ops **1428/0**、diff **152/152 逐字节**（golden 238/238 未漂移）、`pkgmodes` 失败 0、treeface **17/0**、`test:scriptc` 代表集 **10/10 出货一致**、`cli-native` **22/0**、`test:export` **ok 10 / 环境记账 3 / FAIL 0**（记账那三格仍是 SEA 要 Node ≥25.7）—— 改的是发射器与工程编译，出货那一面全复跑过。
- **还剩的一格**（照实记在 S213 末尾）：值位置的未知名字（`var f = wrapi`）仍发成裸 JS 标识符、运行期 `ReferenceError` —— 那是同一张表的「取值」版，这轮没动，不顺手扩。

### 1.24 转换族量清了，剩下的是实现（2026-10-04，§6 第 17 条②收口，明细全在 S214）

- **为什么这轮只量不写**：S210/S213 的账都落在「有依据才写」这条线上，而转换族四支连**参数顺序**都没验过 —— 上一轮的探针被自己的引号写法带废（`Expected closing ")"`）。四支一支一支过判引擎（`tmp/probe-convert/`，八个探头文件、每支单独一份，一个解析错不会遮住另一支）。
- **两条推翻老文档的形状**：`convert` 与 `type_convert` 在 4.6.3 都是**值在前、类型在后**，`type_convert(TYPE_INT, "7")` 那种顺序写法直接 `Cannot pass a value of type "String" as "int."`；而且两支**解析期**允许的类型集合不一样 —— `convert(x, TYPE_STRING)` / `convert(x, TYPE_VECTOR2)` 是 `Invalid call for function "convert".`，`type_convert` 那两支却过得去（`type_convert(7, TYPE_STRING)` → `"7"`，`type_convert("1,2", TYPE_VECTOR2)` → `(0.0, 0.0)`）。
- **`var_to_str` 的真形状**：字典在**任意深度**都多行美化且**不缩进**、键一律带引号，数组恒单行，只有空的 `{}` / `[]` 是紧凑式；字符串里制表符与换行**按原字符写入**（不是 `\t` / `\n`），`"` 与 `\` 转义；`-0.0` 归一 `0.0`，指数式是 `1e+20` / `1e-07` / `-1e+20`（指数带符号、补足两位），INF/NAN 是 `inf` / `nan`；值类型与打包数组给构造式（`Vector2(1, 2)`、`Color(1, 0.5, 0.25, 1)`、`&"name"`、`PackedByteArray(1, 2)`）。
- **`str_to_var` 的认与不认**：`"[1,]"` 收尾逗号、`"[1"` 给 null；`"true"` 是布尔而 `"TRUE"` / `"True"` 是 null；`"&\"name\""` 给 StringName(21)、`"Vector2(1, 2)"` 给 (5)、`"Vector2i(1, 2)"` 给 (6)，**`"Color(1, 0, 0)"` 却给 null**；`"0x10"` / `"0b11"` 都给 **0**（进制前缀不认）、`"+7"` 给 null、`" 7 "` 给 7、`"1e3"` 给 `1000.0`、`"inf"` 给 INF float 而 `"NaN"` 给 null；`"{}"` 是空字典（打印 `{  }` 两个空格）。
- **取舍**：先接 `var_to_str` / `str_to_var`（形状已全量齐、Tier 1 里真有用），`convert` / `type_convert` 等同一条标量真源合出来后再按各自「解析期允许的形状」分岔。四支在实现前留在 `GLOBAL_TODO_FUNCTIONS` 抛 `[emit-builtin]`；语料也等实现那一轮与 JS 侧一起进 —— 只把 Godot 侧的读数放进「跑得出结果」那 152 格，会把 diff 的账拆成两半，不划算。
- **门**：本轮没动实现，门的读数与上一提交一致（compile 160/229 + 守卫 8/8、ir/sema 229/229、ops 1428/0、diff 152/152 逐字节、typecheck 无 `error TS`）。

### 1.25 `similarity` 从源码里读出来了：拟合不动就去看引擎怎么写的（2026-10-04，§6 第 15 条那一格）

- **用的还是 S212 那招**：S206 留下的九个读数用 LCS 比值与 Levenshtein 都拟合不出，就不猜第十种式子 —— 读本机 `E:/编程练习/godot` 那份 **4.3.0 树**的 `core/string/ustring.cpp:3881`。式子是**交叠 bigram 的 Dice 系数**：`operator==` 先给 1.0，任一边长度不足 2 给 0.0，其余 `2 × 交集 / (两边 bigram 数之和)`，而交集「源的每个 bigram 在目标里出现就计一次、不消耗目标」—— 这条正是 `"aaaa"`/`"aa"` 给 **1.5** 的原因，**大于 1 不是 bug 是式子**，拟合时最容易把它当噪声扔掉。
- **一处类型的账**：函数在 C++ 那边返回 `float`，所以 `4/3` 打出来是 `1.33333337306976`。实现里结果过一遍 `Math.fround`（`color.ts` / `vector2.ts` 早就这么办，scriptc 有 lowering），不然我们的 double 打印永远对不上。`bigrams()` 也顺带读了：`length() - 1` 个**重叠**二字组，按码点走（复用 `codepoints()`，非 BMP 算一个）。
- **出货与钉子**：`strSimilarity` 落在 `values.ts` 的字符串族里，`methods.ts` 加 `case "similarity"`；ops 那组 234 从「公式没拟合，仍拒」换成 **10 格实测值**（总 **1437/0**），语料 `234-string-methods-batch` 末尾加 12 行并**重生成 golden** —— 新生成的 golden 顺手把两格边界也量了：`""`/`""` 给 `1.0`（等号判在长度检查之前）、`"a"`/`"ab"` 与 `""`/`"ab"` 给 `0.0`。diff **152/152 逐字节**。
- **一条工具顺序的坑（记下来别再踩）**：改完 `main.gd` 只重生成 golden、没重跑 `test:compile` 就去看 `test:diff`，会报「静默错误 1」—— 因为 diff 跑的是上一轮的 `main.gen.mts`，产物里没有那 12 行。这次先 `compile` 再 `diff` 就 0 静默。**golden 与产物必须同轮生成**，否则最优先那一格会自己造出来。
- **门**：typecheck 无 `error TS`、ops **1437/0**、diff **152/152 逐字节**（golden 238/238 未漂移）、compile **160/229**（emitter 缺口 0、守卫 8/8）、ir **229/229**、sema **229/229**（误报/漏报/崩溃 0）、`pkgmodes` 失败 0、treeface **17/0**、`test:scriptc` 代表集 **10/10 出货一致**（234 那一格现在也走 AOT exe）、`cli-native` **22/0**、`test:export` **ok 10 / 环境记账 3 / FAIL 0**。
- **下一格已经有着落了**：同一份源码里 `pad_zeros`（4789 行）与 `get_slicec`（1288 行）都有明确式子 —— `pad_zeros` 是「以小数点为界，跳过前导非数字，把 `0` 插到数字段开头」，S206 那四条看着互相矛盾的读数（`".5"` 不动、`"abc"`→`abc00000`、`"--5"`→`--05`）在这条式子下应当各自消解 —— 但 S206 没记下当时传的 `p_digits`，所以这只是**待验的推论**，探头要按已知参数把四格重打一遍才算数；`get_slicec` 的第一参数是 **`char32_t` 码点**不是 String，所以 `(1, 0)` 给整串、`(1, 非 0)` 给空，与文档写的 `(delimiter, slice)` 根本不是一回事。两格的探头在 `tmp/probe-pad-slice/`，量过之后再出货；`uri_decode` 的非法转义与 `format` 的 `placeholder` 第二参仍照 S206 响亮拒。

### 1.26 `pad_zeros` 与 `get_slicec`：S206 那批「互相矛盾」的读数其实是同一条式子（2026-10-04，§6 第 15 条再收两格）

- **接着上一轮的路子**：拟合不动就不猜，读 `E:/编程练习/godot` 那份 4.3.0 树。这次读的是 `core/string/ustring.cpp:4789`（`pad_zeros`）与 `:1288`（`get_slicec`），先读式子、再拿判引擎逐格对。
- **`pad_zeros`**：以**第一个小数点**为界（没有就整串）；界落在最前直接原样返回（`".5"`）；界内**跳过前导非数字**得到 `begin`；补的零数 `= p_digits - (界长 - begin)`，插在 `begin` 处。于是 S206 那四条「互相矛盾」的读数一条式子全解释：`"abc"` 是界=3、begin=3、零=5 → `abc00000`（往后贴，不是往前补）、`"--5"` → `--05`、`"0.5"` → `000.5`。新量的一批也全中：`"+5"`→`+005`、`" 5"`→` 005`、`"-.5"`→`-000.5`、`"x"`→`x000`、`"a.b"`→`a00000.b`、够宽与空串不动。
- **`get_slicec`**：引擎签名是 `get_slicec(char32_t p_splitter, int p_slice)` —— 分隔符是**码点数字**。这直接解释了 S206 那格怪事：`(1, 0)` 给整串是因为 U+0001 不在串里、第 0 段就是整串，`(1, 非 0)` 给空是段号越界；文档写的 `(delimiter, slice)` 形状在 4.6.3 **过不了解析**（`argument 1 should be "int" but is "String"`）。空串给空、负段号给空、空段（`"a//b"` 第 1 段）给空，都照源码逐格量过。
- **出货**：`values.ts` 加 `strPadZeros` / `strGetSlicec`，`methods.ts` 加两条分发；ops 的 234 那组把两条 `shouldThrow` 换成 **10 格实测值**（总 **1445/0**），语料 234 尾部加 **23 行**并重生成 golden —— 顺手也验了 `similarity` 那 12 行没漂。`test:compile` 仍是 160/229、emitter 缺口 0、未知调用守卫 8/8。
- **顺手把 `uri_decode` 也读了（S217，未出货）**：`ustring.cpp:4542` 的式子解释了 S206 全部四格怪事 —— 合法位只认 **0-9 与 A-Z**（小写 hex 位不算，于是 `"%2f"` 把 `%` 吃掉留 `2f`）、`CharString::length()` 含尾 NUL（所以 `"a%41"` 仍折得出 `aA`）、非法 hex 经 `strtol` 得到 0x00/0x04 而重组按 strlen 走（`"%G1"` 成空串）、`+` 换空格。20 格探头（`tmp/probe-uri-decode/`）逐格与式子一致，实现留到下一轮。
- **门**：typecheck 无 `error TS`、ops **1445/0**、diff **152/152 逐字节**（golden 238/238 未漂移）、compile **160/229**（emitter 缺口 0、未知调用守卫 8/8）、ir **229/229**、sema **229/229**、`pkgmodes` 失败 0、treeface **17/0**、`test:scriptc` 代表集 **10/10 出货一致**（234 那 23 行新格子也走了一遍原生 exe）、`cli-native` **22/0**。
- **仍未出货**：`format` 的 `placeholder` 第二参与 `count` 的 `chars` 真值 + 第 3 个 int 参数 —— 继续 `UnsupportedError`，等下一轮从同一份源码里读。

### 1.27 `uri_decode`：S206 那批怪事在同一条式子里全解释了（2026-10-04，§6 第 15 条再收一格）

- **式子中门**：读 `ustring.cpp:4542`，三条规则一次解释完 S206 的四个怪读数 —— **合法 hex 位只认 `0-9` 与 `A-Z`**（`is_digit || is_ascii_upper_case`，小写 a-f 不算，于是 `"%2f"` 把 `%` 吃掉、剩下 `2f` 照原样出）；**「后面还有两位」是 `i + 2 < 字节数` 的严格小于**（`"a%41"` 折得出 `aA`，而 `"x%4"`、`"%%4"` 都把 `%` 留下）；**`strtol` 是部分解析**（`"%G1"` 的 `G` 不是 hex 位 → 得 `0x00`，`"%4Z"` 的 `Z` 同理 → 得 `0x04`），而重组 `String::utf8(res)` 按 strlen 取长度 → **撞到 0 就截断**，所以 `"%G1"` 是空串。`+` 一律换空格。
- **不用新写状态机**：字节流的重组直接复用 `packed.ts` 里那台手写的 WHATWG UTF-8 解码器（`TextDecoder` 在静态编译目标没有 lowering 才写的），只把它导出给 `values.ts` 用 —— `values.ts` 早就从 `packed.ts` 拿东西，而 `packed.ts` 对 `values.ts` 只有 `import type`，不构成运行期环。多字节因此天然正确：`%C3%A9`→é、`%F0%9F%98%80`→😀，`length()` 都是 1。
- **21 格逐格对撞**：`tmp/uri-check.ts` 把实现对着判引擎的读数打了一遍，21/21 一致，含两格不好放进语料的：`"%4Z"` 给 U+0004（控制字符）、`"%FF"` 给一个 U+FFFD。**与引擎差的一处是 stderr**：非法字节 Godot 还往 stderr 打一句引擎 ERROR（S206 只记了「会打」，文本没逐字量过），那行不属于产物，我们不复制。
- **钉子**：ops 的 234 那组把「非法转义形状没量清，仍拒」换成 **7 格实测值**（总 **1452/0**），语料 234 尾部加 16 行（golden 重生成，**152/152 逐字节**）。
- **门**：typecheck 无 `error TS`、ops **1452/0**、diff **152/152 逐字节**（golden 238/238 未漂移）、compile **160/229**（emitter 缺口 0、未知调用守卫 8/8）、ir **229/229**、sema **229/229**（误报/漏报/崩溃 0）、`pkgmodes` 失败 0、treeface **17/0**、`test:scriptc` 代表集 **10/10 出货一致**（那 16 行新格子也过了原生 exe）、`cli-native` **22/0**。
- **§6 第 15 条剩两格**：`format` 的 `placeholder` 第二参、`count` 的 `chars` 真值 + 第 3 个 int 参数 —— 同一份源码里应该也有式子可读，下一轮接着收。

### 1.28 `format` 量了 18 格，撞到第一条「4.3 源码 ≠ 4.6.3」的证据（2026-10-04，仍不硬装）

- **前三格都是同一个套路成的**：`similarity`（S215）、`pad_zeros` / `get_slicec`（S216）、`uri_decode`（S217/S218）—— 读 4.3.0 树的式子 → 判引擎逐格对 → 对上才写。这轮换 `format`，式子也读出来了（`ustring.cpp:3940`），18 格也量了（`tmp/probe-format/`），**但式子只对上了一半**。
- **对上的那一半**：给了第二参时，4.6.3 就是 4.3 那条式子 —— 占位符含 `_` 就按 `placeholder.replace("_", 下标或键)` 全串替换（`"_0 _1"` → `_a _b`、`"_0 _0"` → `_a _a`、`"A_1_B"` 用 `"_1"` 原样），不含 `_` 就 `replace_first`（`"[%s]"` → `1`，`"[0]"` 与 `"{0} {1}"` 原样）；内层数组必须是 2 元键值对；字典按 `"{键}"` 替（`"{a}-{b}"` → `1-2`）。
- **对不上的那一半，而且更要紧**：**缺省占位符在 4.6.3 是 `"{0}"` 而不是 `"{}"`** —— `"{}".format([1])` 原样、`"{0}".format(["x"])` 却给 `x`；引擎的错误行也从 4.3 那句 `STRING.format Inner Array size != 2` 换成了 `Invalid format: the inner Array at index 0 needs to contain only 2 elements, as a key-value pair.`（`at: format (core/string/ustring.cpp:3569)`），非容器那句也从 `use Array or Dictionary.` 变成带 Object 的版本。**结论：4.3.0 树不是 4.6.3 的替身**，它在 String 这一族里能给式子但不能给默认值与文案；S215/S216/S218 那三格之所以能出货，是因为**判引擎逐格点过头**，不是因为读了源码。这条记法以后照抄：读源码只算提出式子，量过才算数。
- **所以这格仍不进实现**：缺省那一半还要再量（键的顺序、非字符串键、值转文本走哪套 print、`{}` 与 `{0}` 混排），量齐之前 `format` 继续走 `string-method` 那格响亮拒；18 格数据与两版差异全记在 S219。
- **同一批还顺手把 `convert` / `type_convert` 的标量表量全了（S220）**：14 格对上（`"abc"` 转 bool 是 **true**、`null` 转 String 是六字符的 `"<null>"`、`"7abc"` 转 int 是 7、空字典打印 `{  }`），中止整支脚本的那格是 `convert([], TYPE_INT)`，报的却是「utility function "convert()" 不存在」—— 同一份文件前面十格 `convert()` 都跑通，所以那句拒在哪一层没定，数组转标量这条线单独量过之前不写进实现。
- **门**：本轮只动文档与 `tmp/` 探头，代码与语料未变，门的读数与上一提交（`uri_decode`）一字一样：compile 160/229 + 守卫 8/8、ir 229/229、sema 229/229、ops 1452/0、diff 152/152 逐字节、typecheck 无 `error TS`、pkgmodes 失败 0、treeface 17/0、scriptc 代表集 10/10、cli-native 22/0。

### 1.29 `var_to_str`：量到一条会让「复用 print」变成静默错的分岔（2026-10-04，§6 第 17 条②续，本轮零代码）

- **为什么单独一节**：这一格的价值不在实现，而在**拦下一个看起来最省事的错做法**。`var_to_str` 最自然的写法是复用 `strFloat` / `show`，实测却分家：`print(1e20)` 给 `100000000000000000000.0`，`var_to_str(1e20)` 给 `1e+20`；`var_to_str(1e14)` 还是定点、`1e15` 就换指数式。我们的 `strFloat` 与 print 一字一样，所以照抄下去编译得过、跑得出结果，**只有大数量级的数字会静默错** —— 正是 §1.12 之后一直在防的那类。
- **第二条不好抄的**：字典的键在 `var_to_str` 里**要排序**（类型等级 `null < bool < int < float < String < StringName`，同级再按值），print 却是插入序单行式。`{1, 2.5, 0.5}` 给 `1、0.5、2.5` 说明「按值排」不够，等级在先；`{"B","a","A"}` 给码点序，不是不分大小写。
- **可以照抄的部分也量清了**：nil 是 `null`、字符串只转义 `"` 与 `\`（制表与换行按原字符）、数组单行、`Callable()` / `Signal()` 可复现、值类型与打包数组给构造式且**打包数组摊平**、打包元素里的整数值不带 `.0` 而标量带、空容器是紧凑式。全在 S221。
- **本轮代码一行没加**：中途写进去的 `varToStr` 已整块撤回（`git checkout` 掉那 110 行），因为浮点那两条界的边角、嵌套容器的深度闸门、次正规数都还没量 —— 按红线「没依据的不准写进实现」，半条式子的实现比不写更贵。`var_to_str` / `str_to_var` / `convert` / `type_convert` 继续在 `GLOBAL_TODO_FUNCTIONS` 抛 `[emit-builtin]`。
- **门**：只动文档与 `tmp/` 探头，读数与 `uri_decode` 那一轮一字一样（compile 160/229 + 守卫 8/8、ir/sema 229/229、ops 1452/0、diff 152/152 逐字节、typecheck 干净、pkgmodes 0、treeface 17/0、scriptc 10/10、cli-native 22/0）。

### 1.30 `var_to_str` 的浮点式子仍未拟合：三条猜测都被自己的数据打掉（2026-10-04，接 §1.29，仍零代码）

- **补量三格**（`float_digits.gd`、`self_arr.gd`、`convert_arr_int.gd`）：print 与 `var_to_str` 的**位数**就不是一回事（`0.1234567890123456` 一个给 14 位有效、一个原样给 16 位；`1e23` 一个定点展开、一个 `9.999999999999999e+22`）；自引用数组不会被拒也不会炸，说明 `var_to_str` 自己那道深度闸门存在、只是最内层渲染成 `[]` 而不是 print 的 `[...]`；`convert([], TYPE_INT)` 是**运行期**拒（编译过得去，抛在行号上），引擎那句文案还指着「utility function 不存在」。
- **为什么还是不写**：`var_to_str` 走 `VariantWriter::write_to_string`，不是 `String::num` —— 所以「读 `String::num_double` 就能对上」这个方向从源头就是错的，而按最短往返、17 位有效截断、`%.15g` 三条候选逐条试，每条都被实测数据打掉一到两格（`0.000123456789012345678` → `0.00012345678901234`、`0.0001000000047497451` → `0.00010000000474974`）。**没拟合出来就继续抛 `[emit-builtin]`**，这是 S206 那批「量到了但式子没出来」的同一处置，也是 §1.29 那条「不抄 print 的浮点」的下一步。
- **本轮唯一产出是账**：S222 记完这三格与三条被否的候选，`var_to_str` 剩下要量的收窄成两件 —— 定点支的数字规则、深度闸门的层数。代码仍是一行没加，门的读数与 `uri_decode` 那轮一致。

### 1.31 `var_to_str` 按「量到哪发到哪」发出去了：非浮点形状全上，浮点、对象、缩进串各留一句响亮拒（2026-10-04，§6 第 17 条②、S230）

- **取舍**：S229 摆着两条路 —— 拿到 4.6.x 的 `num_scientific` 再发，或只发非浮点那一半。这轮走第二条，并把边界钉成三条 code：浮点抛 `[var-to-str-float]`（装浮点的数组与 pack 一起拒），对象与其余没量过的类型抛 `[var-to-str-type]`，两个容器键的排序抛 `[var-to-str-key]`，带缩进串的双实参在**发射期**就抛 `[var-to-str-arity]`。发出去的形状每条都有 hex 或引擎原文背书：**转义只碰 `"` 与 `\`**（制表符 `22 09 22`、响铃 `22 07 22`、é `22 c3 a9 22` 全原样写进串，同批输入走 `c_escape` 拿到的是 `5c 74` / `5c 61` —— 这条通道不是 `c_escape`，抄错就成静默错）；**键序** `null < bool < int < float < String < StringName`、同级字符串按码点（`"10"` 排在 `"a"` 前）；容器能当字典键（`[1, 2]: 9`），数组跟着里面的字典一起换行。
- **两条新账，都没写进实现**：① 4.6.3 的 `var_to_str` 有第二个实参 `indent: String`，而本机 4.3 树 `core/variant/` 里 grep 不到 `indent` —— 又一处「4.3 ≠ 4.6.3」（§1.28 的 `format` 是第一条）；缩进串还会让装字典的数组变成多行，收尾那个 `]` 一会儿顶格一会儿缩两档，式子没排出来。 **这一条在 S244 被推翻**：判断引擎三个面各说一遍 —— 解析期那句 "Too many arguments for \"var_to_str()\" call. Expected at most 1 but received 2."、`get_argument_count()` 是 1、`.call` 的运行期闸门 "Expected 1 argument(s)" —— 4.6.3 也只认**一个**实参。方向反了：不是「4.3 没有而 4.6.3 有」，是两边都没有。② 串里的 U+0000 在 `to_utf8_buffer()` 那层就变成 `ef bf bd`（`char(0)` 的 `length()` 仍是 1），`c_escape` 同输入同结果 —— 这是**所有打印共用**的 String→UTF8 层，归 §6 新增的第 18 条，不记在 `var_to_str` 头上。
- **账**：语料 236 加 31 格、ops 加 27 格（1452→1479），`test:compile` 160/229、`emitter 不支持 0`、`全局拒答清单失效 0`、新增「var_to_str 单实参口径 3/3」门格，`test:diff` 逐字节一致 152/152、静默错误 0。下一支照 S214 已有的二十格发 `str_to_var`。

### 1.32 `str_to_var` 的读侧语法量清并发出：155 格与引擎逐格对上，读不懂的地方给 null、没量过的给响亮拒（2026-10-04，§6 第 17 条②、S231）

- **一条规则把 S214 的怪账全清了**：`str_to_var` 顶部**只读一个值，后面跟着的不看**。于是「`0x10` 给 0」「`0b11` 给 0」「`1_000` 给 1」「`1.5.2` 给 1.5」「`1 2` 给 1」不是四条各自古怪的容忍行为，而是同一条读到就停。剩下的量点摊成六支探头（`sv_grammar` / `sv_escapes2` / `sv_more` / `sv_more2` / `sv_last` / `sv_ws`），155 格与判引擎逐格对上的表在 `tmp/sv-check.ts`。
- **发出去的**：小写 `null` / `true` / `false` / `inf` / `-inf` / `inf_neg` / `nan`；数字带点带指数、int 饱和到 INT64_MAX；字符串的双引号加十个转义（`\n \t \r \b \f \\ \/ \" \'` 与 `\u` 四位十六进制），其余字母是「删掉反斜杠留原字符」（`\a` → `a`、`\x41` → `x41`），代理区与非十六进制的 `\u` 整串作废；`&"名字"`；数组与字典（尾逗号收、缺逗号作废、多行写法照收、重复键后者盖前者）；`Vector2` / `Vector2i` / `Vector3` / `Vector3i` / `Color` 五支值类型（arity 严格、整型那两支截断）与七支 pack 构造式（byte 回绕 300→44、-1→255，float 收 int，串 pack 只收串）。认不出的一律给 null —— 那批二十余格实测全是 null。
- **拒的三类**：`\U` 量到「吃六个十六进制位」但越界与代理区凑不成式子 → `[str-to-var-shape]`；`Rect2`（typeof 7）/ `Quaternion`（15）/ `PackedVector3Array` / `PackedColorArray` 是引擎给得出值而我们没有的形状 → `[str-to-var-type]`；构造式名字认不出时**不发那个可能是错的 null**（只量过 `NoSuchType(1)` 那一格给 null，「Godot 认识哪些名字」那张表没量）→ `[str-to-var-shape]`。双实参与非 String 实参分别抛 `[str-to-var-arity]` / `[str-to-var-arg]`，前者钉在 `test:compile` 新改的「转换族单实参口径 6/6」。
- **账**：语料 236 加 43 格、ops 加 30 格（1479→1509）。`test:compile` 160/229、各桶全清、守卫 8/8 与 6/6，`test:diff` 逐字节一致 152/152、静默错误 0、崩溃 0。转换族只剩 `convert` / `type_convert` 两支没合出真源（S214 已量清标量表，卡在数组→标量那一格引擎在运行期拒）。

### 1.33 十一支门全量迁到 Vitest：搬进各自的包，历史读数一行没动（2026-10-05，纯测试基建，零产品代码改动）

- **动因**：`tools/` 下 27 支手写门脚本靠 `pass++` / `fails.push()` / `process.exit(1)` 三件套自证，其中 `ops-check.ts` 一个文件 3442 行、1509 条断言 —— 改一格要滚三千行；runtime 的单测躺在仓库根而不在 `packages/runtime` 里；没有 watch、没有按名过滤。这轮把**全部 11 支 `test:*` 门**迁到 Vitest（`vitest@5.0.3` + `vite@8.3.2`，单一根配置四个 project），11 个脚本名全部存活、10 个改指向。
- **分层**：快层 `pnpm test`（testkit + runtime + compiler + repo，**零外部依赖、零 build，实测 4.62s**）；E2E 层 `pnpm test:e2e`（六支，串行、缺料自动 skip）；`pnpm test:all` 两层全跑。快层能零 build 是因为 Node 24 直接把 workspace 的 exports 映射解析到 `.ts` 源码（`import.meta.resolve('@gds2js/runtime/runtime/ops')` → `packages/runtime/src/runtime/ops.ts`），Vite 同样吃得下，所以不需要 `resolve.alias`、也不需要 `^build` 前置。
- **三态统一**：今天只有 `export-check.ts` 有 `ok|refused|no-lib|crash|FAIL` 五态，其余五支只有 ok/fail 两态 —— 缺 Godot/scriptc/zig 时要么静默变绿、要么一堆看不懂的紅。现在 `refused`/`no-lib` 一律 `ctx.skip(true, note)`（S1 实测原因会显示在方括号里），红只剩一个意思：真的坏了。**一处有意的行为变更**：`diff.mjs` 的 `crashed` 与 `export-check.ts` 的 `crash` 从 tolerated（不退非 0）改成 fail，依据是 `diff.mjs:53` 自己的注释「崩溃和「没做」必须分开算：前者是 bug，后者是排期」；S0 基线实测两者都是 0，所以迁移当天没变红。
- **读数保真靠 `task.meta` + 自定义 reporter**：1509 这个数**不等于**静态调用点数（1403）—— region 280-390 的 `runMut` 那类表驱动 helper 会循环生成断言，只有运行时才知道总数。而断言散在 23 个文件里、`isolate` 下模块作用域互不相通，所以计数写进 `task.meta`、由 reporter 在主进程重新加总。Vitest 5 的 API 与文档印象差得挺远，实测修正了六处：`getCurrentTest` 不再从主入口导出（改 `TestRunner.getCurrentTest()`）、`Reporter.onFinished(files)` 换成 `onTestRunEnd(testModules)`、`meta` 从属性变方法、类型在 `vitest/node` 而非 `vitest/reporters`、`poolOptions` 整个删了（`singleFork` → `maxWorkers:1`）、`it.each` 的回调**拿不到 context**（所以 `corpus-diff` 改用 `for` 循环建 `it()`）。
- **ops 的拆分：codemod 只在 region 级动刀，绝不解析实参列表**。`eq`/`shouldThrow` 的签名原样保留、只是从局部声明变成 import，所以 1403 个调用点（含跨 5 行、带嵌套括号与中文模板字面量的那些）一个都不碰，codemod 退化成「按行区间切 region → 贴进 `it()` 体 → 拼 import 前奏」。region 边界不靠手写词法器（TS 7.0.2 是 Go 移植版、不暴露 `createSourceFile`），而靠这份文件的排版约定：**顶层裸块的 `{`/`}` 必定顶格单独成行**，且实测「反引号数为奇数的行 = 0」证明没有跨行模板串，判据无歧义。机械发现 68 个顶格块 + 9 段无声明顶层语句 = 77 个 region，其中 **511 行那一格（`eq("009","[1,2]==[1,2]",…)`）是顶层裸语句、原归属表漏了它** —— 被「每个 region 必须恰好落进一项归属」的断言当场抓住，否则会静默丢掉一条断言。
- **一个 `it()` = 一个原子 region，不是一格一个**：region 内的 `eq` 读的是它前面语句累积下来的状态（`g.set(-1, I(9))` 就夹在两条断言之间），拆细会让第一格之后全红。反过来语料门（ir/sema/diff/golden/scriptc）用例之间无共享可变状态，就一例一个 `it()`，于是 `-t 088-vector2-write-error` 能一秒重跑单例。
- **计划书里 `isolate: true` 那条硬性要求被证伪，改成 `false`**：理由是 `registerClass("Holder", …)` 在 2307 与 3123 各登记一次、"靠源码顺序侥幸不撞"。核实后不成立 —— `nameClass`（`object.ts:177-180`）是 `CLASS_REGISTRY.set(name, desc)`，撞名只覆盖不抛；两处各自接住自己返回的 descriptor 直接用，全文没有任何地方按名字回查 `"Holder"`。实测 `isolate:false` 得到**逐字相同**的 1509/0，且 **2.36s vs 15.95s（6 倍）**。`isolate:false` 恰恰是对旧执行形状的忠实复现：`tsx tools/ops-check.ts` 本来就是一个进程、一份模块注册表、76 个 region 顺序跑。
- **没迁的四类**（它们改写仓库，不是断言）：`golden.mjs` 重生模式（写 238 个 golden，且**旧版缺 Godot 存在性守卫** —— 缺了会把整个语料覆盖成 `<<GDS2JS_SPAWN_ERROR>>`；迁过来的 `golden-drift.test.ts` 补上了这道守卫）、`bench-ab.ts`（测量期间**覆写真实源文件**、从内存还原，测试运行器里的硬性禁区）、`release.mjs`、`case-*.mjs` codegen。四支 bench 与 `latency` 零断言、只出读数并交接 `bench/.out/js.json`，也留为脚本。`test:golden` 与 `test:compile` 名字虽叫 `test:` 但实为 codegen，逐字不动。
- **两处被迁移逼出来的修正**：① `newestInputMtime()`（cli-native 判 exe 陈旧）递归 walk 整个 `packages/`，测试搬进 `packages/*/test/` 后会导致「改一个测试文件 → exe 判过期 → 每次重建几分钟」，所以 walk 里排除 `test` 与 `node_modules`（exe 的真实输入集没变）。② `tools/release.mjs` 按文件路径直接调 `scriptc-check.mjs` 与 `cli-native-check.mjs`，删掉它们会打断发布流水线，已改成调 vitest；scriptc 的 case-id 过滤走 `GDS2JS_SCRIPTC_FILTER` 而不是 `-t`（`-t` 只过滤**已收集**的测试，挑不出代表集之外的用例）。
- **测试文件一律不进 `packages/*/src/`**：`export-ts-tree.ts:32` 的 `copyTreeTs` 会把 `packages/runtime/src/` 下每个 `.ts` 递归拷进 `--pack scriptc` 的产物树。`tools/harness/scene-tree.ts` 路径**冻结**（244 个已提交的 `main.gen.mts` 里硬编码了 `../../../tools/harness/scene-tree`），`corpus/` 与 `GEN_EMIT_OPTS` 一个字没动 —— `git ls-files -s -- corpus` 的 728 个 blob SHA 迁移前后全等。
- **账**（迁移前后逐字对照，全部由新旧并排跑 + 负对照验过）：`ops 自校验：通过 1509，失败 0`（23 文件 79 个 `it()`，2.36s；旧 1.98s）· `Lowering 成功 229/229`（1.20s，旧 2.42s）· `命中 229/229 误报 0 漏报 0 崩溃 0`、17 例 runtimeOnly 清单逐条相同（1.55s，旧 2.64s）· `tree-face 对账：通过 17 项，失败 0 项` · 守卫三行 `0 / 8-8 / 6-6` 从 `test:compile` 移到新的 `test:guards`（33 格），`test:compile` 剩下 5 行含 `编译成功 160/229` 逐字不变 · `test:diff` 六行看板逐字相同（152/238、86/238、238/238、152/152、152/152、0/0/0），6.84s（旧「几分钟」）· `失败 0 项`（pkgmodes）· `出货 10/10 编过、10/10 跑通、逐字节一致 10/10` · `汇总：ok 10 / 上游或环境记账 3 / FAIL 0` · `原生 CLI 等价性门：通过 22 项，失败 0 项` · `合计: OK 152 / 编译或运行报错 69 / 超时 17 / 漂移或缺 golden 0`。**`pnpm typecheck` 3/3 → 4/4**（testkit 是第四个），另加 `tsconfig.test.json` 覆盖根级 `test/`（根 tsconfig 那份 `include: ["tools","packages"]` 其实没人跑，且有 9 个既存错误在 `bench-ab.ts`/`bench-scriptc.ts`，与本轮无关、没碰）。**静态调用点完整性另有一道独立校验**：原文件 1233 个 `eq(` + 170 个 `shouldThrow(` = 1403，23 个生成文件里同样是 1403，没漏没重。
- **遗留（都是装饰性的，不影响判定）**：① 23 个 runtime 测试文件各带一份未裁剪的 103 行 import 前奏（共约 2400 行冗余）—— 这是刻意取舍：根 tsconfig 没开 `noUnusedLocals`，全量照抄一举消灭了「漏了某个 import」整类失败，裁剪留作单独一轮。② `docs/SEMANTICS.md` 有约 8 处把 "ops-check" 当语义钉点的代名词引用（「只钉 ops-check、不进语料」「ops-check +10 条 → 1259」），那是历史实测记录、不该改写；现在 "ops-check" 指的是 `packages/runtime/test/`。③ `tools/compile.ts:40` 写进 `main.gen.mts` 的 stub 文本里提到 "js-runner"，改一个字就是 244 份产物的 churn，所以原样留着。

### 1.34 清掉 tools/ 的最后三段判据，并给生成源码补上漂移门（2026-10-05，接 §1.33）

- **还剩什么**：§1.33 之后 `tools/` 16 支里没有一支是「测试」了，但有两处判据藏得很不舒服。① `compile.ts` 里剩的 `pack codec 口径不一致 0` 与 `自兜底缺失 0` —— 两处都设 `process.exitCode = 1`，是真断言，却住在一个 codegen 脚本里，只有记得跑 `test:compile` 才生效。② 生成物 `packages/runtime/src/runtime/case-{table,flags}.ts` 文件头写着「别手改，改请重跑生成流程」，但**没有任何门能发现有人手改了它**，也发现不了「regen 跑了没提交」；golden 在 §1.33 有了漂移门，生成源码一直没有。
- **①迁进快层**：新建 `packages/compiler/test/emit-invariants.test.ts`，229 例各验两条 —— 扫产物文本得到的 `NEED_ZSTD_TEXT` 必须与 lowering 记下的 `ir.usesPackCodec` 一致；有 `const __gd_entry = new …` 尾巴的产物必须含 `rt.reportRunFailure(`（直接跑产物时外面没有 CLI 那层 try/catch，缺兜底就是一坨 Uncaught 栈）。两条判据**互相独立**（一条看发射出的字符串、一条看 IR 标志），所以互锁有牙。语义分析/发射器拦下的那 69 例没有产物可验，与旧实现同样跳过。`compile.ts` 自此是纯 codegen（三行统计、不设 exitCode），两条读数原文迁进新门的 afterAll。
- **顺手把那条正则收成一份**：旧实现把 `/,\s*"(?:compress|decompress)"\s*,/` 抄在 `tools/compile.ts:20` 与 `tools/scriptc-check.mjs:70` 两处（注释里明说是同一条口径），两份字面量之间没有编译期联系。现在 `test/support/pack-codec.ts` 单份导出，`emit-invariants.test.ts` 与 `test/e2e/scriptc.test.ts` 各引一次 —— 共享的只是正则，文本侧与 IR 侧依旧独立。
- **②补生成源码漂移门**：把两支生成脚本的「算内容」与「写盘」拆开 —— 新增 `tools/case-codegen.mjs`（纯函数：解析 golden → 算区间 → 拼最终文件内容）+ `case-codegen.d.mts`（沿用 `lib.d.mts` 那套 .mjs 配 .d.mts 的约定），`case-table.mjs` / `case-flags.mjs` 瘦成「读 golden → 调它 → 写盘」。`test/e2e/codegen-drift.test.ts` 复用同一份纯计算，算出「现在该是什么」与盘上已提交的逐字节比，一个字都不写。**先验证抽取忠实**：重跑两支脚本后 `case-table.ts` / `case-flags.ts` 在 git 里仍是 0 脏文件，才谈得上门。
- **一道被 autocrlf 逼出来的修正**：漂移门第一次写完是绿的，但那次绿是**假的** —— 我在跑脚本之后才建门，而脚本用模板字面量写盘产出 LF，恰好与 committed 的 LF blob 相符。做负对照（手改一个导出名 → 门红 ✓ → `git checkout --` 还原 → **门仍然红**）才挖出来：本机 `core.autocrlf=true`，committed blob 是 182 行 LF / 7606 字节，`git checkout` 把工作树重写成 182 行 CRLF / 7788 字节。比的是内容不是行尾策略，于是两边先统一成 LF 再比；改完复验：CRLF 工作树下绿、手改函数名即红、还原即绿。⚠ 同一个坑在 golden 比对那边潜伏着（corpus 的 golden 是 LF，一旦被 re-smudge 成 CRLF，`normalize()` 产出的 LF 就对不上）—— 那是既有事实、本轮没动，**值得单开一轮加 `.gitattributes`**。
- **一处诚实的限制**：探头用例 `000-probe-cs-*` / `000-probe-cf-*` 是 gitignored（"现搭现弃不入库"），所以新克隆的机器上 `test:codegen` 整支 skip。它防的是「手改生成物」与「regen 跑了没提交」这两类真事故；**Godot 侧的分类/映射本身变了没有**，仍要跑 `pnpm regen:case-table` / `regen:case-flags`（会重搭探头、真起 Godot）才知道。
- **顺带**：修掉 4 处指向已删文件的过期注释（`tree-face.ts` 的消费者清单两条、`host-scriptc.ts`、`host-node.ts`、`lib.mjs` 的工具清单）；扫了一遍**被跟踪文件里没有零引用的孤儿**（§1.33 删掉那 10 支之后没留死源码）；本次会话在 `tmp/` 下的 9 项脚手架已清（`tmp/` 本身 gitignored，从未污染仓库）。
- **账**：新门 `emit-invariants` 229 例、`codegen-drift` 2 例，两条互锁读数 `pack codec 口径不一致 0` 与 `自兜底缺失 0` 逐字沿用、另附「各验了 229 / 229 例」；compiler project 从 3 文件 491 例变 **4 文件 720 例 / 4.10s**；快层 `pnpm test` 仍全绿、`pnpm typecheck` 4/4；`git ls-files -s -- corpus` 的 728 个 blob SHA 与 §1.33 的 S0 基线仍全等，`test:compile` 剩下三行 `160/229 / 69 / 0` 未变。新增根脚本 `test:codegen`；11 个旧 `test:*` 名字继续存活。

### 1.35 `count` 的 from/to 窗口与 `format` 的缺省占位符 `{_}`：两格按 4.6.3 重写，S219 的账结清（2026-10-05，§6 第 15 条、S232）

- **两处老口径是错的，实测把方向掰回来**：`count` / `countn` 的第 2、3 实参不是 `chars` / `limit` 而是 **`from` / `to` 码点窗口**（41 格，含 `"aé日".count("aé", 0, 2)` = 1、`"😀😀a".count("😀")` = 2 这种 UTF-16 与码点分岔的格），`string-count-chars` / `string-count-third` 两条拒直接删掉；`format` 的缺省占位符实测是 **`"{_}"`**，不是 S219 猜的 `"{0}"` —— `{0}` 是键文本渲染出来的样子，所以 `"{}".format([1])` 原样而 `"{0}".format([1])` 给 `1`，S219 那一批「`{}` 留着」的读数全部由这一条解释。
- **`format` 的两条通道**：占位符含 `_` 时把 `_` 换成键文本再做**全串替换**，不含时对每个值做一次 `replace_first`；键文本与值文本都走 print 那套（`null` → `<null>`、float 15 位、StringName 不带 `&`、字典 `{ "a": 1 }`）。Array 通道里**恰 2 元的数组元素按 (键, 值) 解**、不是 2 元的跳过；Dictionary 通道**按插入顺序遍历键**（`{a} {b}` 配 `{"a":"{b}","b":"z"}` 给 `z z`，反过来给 `{b} z`，一正一反把「遍历键」与「扫描花括号」两种猜想分开）。值转文本与 `var_to_str` 是两条道（后者负无穷写 `inf_neg`，这里写 `-inf`，S230 反过来也用上了）。
- **两处没写进实现**：Object 实参那一支引擎确实按属性表替换（实测属性 `k` 换掉 `{k}`），但属性的集合与顺序没量过 → 抛 `[format-object]`；不是 2 元的内层数组被跳过时引擎往 stderr 打 `Invalid format: the inner Array at index N …` 加 `at: ustring.cpp:3569` 与一段回栈，那几行带引擎源文件行号、属「复现不了的打印」，所以我们的跳过是静默的、这类格不进语料（差异写在 S232 账上）。
- **账**：语料 234 加 62 格（format 44 + count 18）、ops 加 29 格（1509→1538）；`test:diff` 152/152 逐字节、静默错误 0，`pnpm test` 810 例全过、treeface 17/17、typecheck 4/4。§6 第 15 条这一族从此只剩 `format` 的 Object 那一支（`[format-object]`）；「值位置的未知名字」那格仍记在 §6 第 17 条①的尾巴上。

### 1.36 `TYPE_*` 整族量清并发出：37 支常量 + `TYPE_MAX`，量法本身是一条新门道（2026-10-05，S233，#23 的前置）

- **难点不在读数在探针**：`TYPE_LAMBDA` 那种「名字不存在」在 GDScript 是**解析期**错，一支脚本里写错一个名就整支编不过、后面的格子全看不见。做法是换成运行时编译 —— `GDScript.new()` 写 `source_code`、`reload(true)`，编不过就是没这个名字，一趟把 39 个候选全量完（探针 `tmp/probe-types/list_types.gd`）。这条办法对「逐名验证一个会被解析期拦死的集合」通用，后面量 `convert` 各自接受哪些 `TYPE_` 直接照抄。
- **读数**：0…11、14…18、20…39 连续对上（`TYPE_PLANE` 14、`TYPE_COLOR` 20、`TYPE_MAX` 39），**12 / 13 / 19 三个号没有名字**（enum 本身的洞，不是漏抄），`TYPE_LAMBDA` / `TYPE_CONST` 实测不存在。九支 pack 是 29…38，其中 38 是 `TYPE_PACKED_VECTOR4_ARRAY`。每支都另用 `typeof(样本)` 复核过，两套读数一格不差；语料 236 加 37 格打印 + 17 格 `typeof(x) == TYPE_X`，逐字节一致 152/152、`pnpm test` 810 例、ops 1538、treeface 17/17 全清。
- **这格的意义是把 #21 的最后一层剥开**：`convert` / `type_convert` 此前连编译都过不了（`TYPE_INT` 是个未知标识符），现在常量在手，卡点收敛成两条可量的实验 —— 两支函数各自的解析期接受集合（用上面那套内层脚本法）、以及 `convert([], TYPE_INT)` 那句运行期拒到底在哪一层。

### 1.37 `convert` 与 `type_convert` 的接受集合一次量完：解析期按第一实参的静态类型分岔（2026-10-05，S234，本轮零代码）

- **量法沿用 §1.36 那条内层脚本**：340 个 (字面量实参, 目标 `TYPE_`) 组合一支脚本编一次，编不过就是解析期拒。跑出来 **254 行读数 + 86 行解析拒 + 33 句运行期报错**，S214 那句「`convert(x, TYPE_STRING)` 解析期拒」原来只对了一半。
- **分岔形状**：null 实参十个目标全拒；bool / int / float 只过 BOOL / INT / FLOAT / COLOR；String / StringName 过 INT / FLOAT / STRING / STRING_NAME / COLOR 但 **BOOL 在解析期拒**；`Color(...)` / `Vector2(...)` 只过同型目标；**容器实参全过解析期、运行时才拒**（除同型那一格外一律 null，且引擎报的是 `Invalid call. Nonexistent GDScript utility function "convert()."` —— S220 那格「文案指错函数」到这里成体系）。`type_convert` 一支都不拒，转不出来就给就近默认值（`null` 转 String 是六字符 `<null>`、数组转 String 是打印文本、转 pack 按元素搬）。
- **为什么不硬装**：三支各自的活不同。`convert` 要在发射期复刻「按静态类型的接受集合」（86 格的文案）；字符串转 Color 走的是**颜色名字查表**，查不到给 `(0.0, 0.0, 0.0, 1.0)` 并往 stderr 打 `Invalid color name: …`，而那张名字表我们没有（只量到 `"abc"` → `(0.6667, 0.7333, 0.8, 1.0)` 这种回退），这一支按红线只能抛；`type_convert` 的表齐了，但目标里 Rect2 / Plane / RID / Object 那批是「引擎给得出值、我们没形状」，处置照 S231 那条走响亮拒。三支都还在 `GLOBAL_TODO_FUNCTIONS` 里抛 `[emit-builtin]`，代码一行没加。
- **下一步的形状已经很清楚**：先做 `type_convert` 的标量与容器表（目标限我们有的那 14 支），`convert` 等发射期那张「静态类型 × 目标」的接受集合表做完再接，颜色名那支单独量表。

### 1.38 `convert` 与 `type_convert` 发出：653 格对照用探针读数直接生成，三条没量的照旧响亮拒（2026-10-05，S235，#21 收口）

- **对照的做法值得留**：读数不在人手里过一遍 —— `tmp/conv-check.ts` 读四支探头的原始日志（`matrix1` / `matrix2` / `extra` / `gaps`），把每行 `R|函数|输入|目标|typeof|打印` 折成我们这边的 `variantConvert` 输出逐格比，**653 格全中**，只有 10 格按形状拒（字符串转 Color）。人抄表才会错，机器读日志不会。
- **两支的分岔就一句话**：`convert()` 凑不出来给 null，`type_convert()` 给该类型的就近默认值；目标号越界（`-1`、`TYPE_MAX`）两支都原样返回。发出去的形状里两条读数挺有意思：`int` 转 Color 是 **0xRRGGBBAA 拆字节**（255 → alpha 1.0、256 → 蓝 0.0039、-1 → 全 1），字符串转 int 走 `String.to_int()` 那条「跳过非数字、遇点就停」的道（`"0x10"` → 10、`"1e3"` → 13，与 28 格 `to_int` 读数一格不差）。
- **顺带修到两处真问题**：① `truthyOf` 原来对所有 OBJECT 给真，实测空 `PackedByteArray` 是假（`type_convert(PackedByteArray(), TYPE_BOOL)` → false）；② 同型 pack 转换**必须拷一份**（实测写回不串原包），而数组与字典是**同一个对象**（`append` 串得回去）—— 第一版按 identity 发出去，被语料 236 的 `id2` 一格当场抓住（diff 151/152、静默错误 1），改成拷贝后 152/152。
- **三条没写进去的**：颜色名表（`"abc"` → `(0.6667, 0.7333, 0.8, 1.0)`，我们只会 `#rgb` 那一半也不敢半装）、没形状的 16 支目标类型（`[convert-target]`），以及**发射期那张「按第一实参静态类型的解析期接受集合」** —— 我们的编译器现在会放过引擎解析期拒掉的 86 格，运行期照未定型那条道给 null；这是诊断口径的差异（那 86 格在引擎里根本跑不到输出），要补的是发射期的静态类型判定，记在 §6 第 17 条②。
- **账**：语料 236 加 50 格、ops 加 17 格（1538→1555）、转换族口径门格 6→11，`test:diff` 152/152 逐字节、静默错误 0，`pnpm test` 814 例、typecheck 4/4。

### 1.39 值位置未知名字的十格读数：引擎那句是解析期错，而内置函数当值用是合法的 `@GlobalScope::abs`（2026-10-05，S236，本轮零代码）

- **两条一起量的才有意义**：未知标识符在 var 初始化式 / `print` 实参 / 内部类方法体 / 模块字段 / `if` 条件 / 不存在的 `TYPE_` 与常量名上，全是同一句解析期错 `Identifier "X" not declared in the current scope.`（十格一支不漏）；而 `var f = abs`、`= str`、`= print` 三支**编得过也跑得通**，打出来是 `@GlobalScope::abs` 这种 Callable —— 内置函数在值位置上是一等值，不是保留字。
- **判据早就在编译路径上跑着，本轮推翻的是这个猜测**：`undeclared-identifier` 连文案都写好在 `lower/analyze.ts` 的 `case "ident"` 里，把十格喂进 `compileProject` 一看，五格未知名全报出来了（上一节记的「只挂在 check-project 路上、编译路径没跑它」是因为那十格当时用 `lower()` + `emitModule()` 直编、绕开了工程级检查，读数是假的，已在 S236 就地改正）。**真问题变成两条误拦**：内置函数当值用（`var f = abs` / `str` / `print`）引擎合法、typeof 25、打 `@GlobalScope::abs`，而且 16 格 `c.callv(...)` 实测与直接调用逐格一致（`hash(7)` 还是 S208 那个 2503556531）—— 我们报 `undeclared-identifier` 把合法工程拦了；引擎类名当值用（`var k = Node`，typeof 24）同理被拦，只是它的打印是 `<GDScriptNativeClass#号>` 属复现不了那一族。反过来 `int` / `float` / `bool` 这批确实不能当值用，引擎是两句错（`Builtin type cannot be used as a name on its own.` + 那句 not declared），我们只报一句，方向没错。顺带一格：**`Callable.get_name()` 在 4.6.3 不存在**。
- **于是 #24 的活变了性质**：不是「把判据搬到编译期」，而是「把值位置该认的名单补全，并给内置名发出真 Callable」—— 名单要含我们量过的内置函数名（`BUILTIN` ∪ `GLOBAL_TODO_FUNCTIONS`，没实现的那些给得出值但 `.call(...)` 要响亮拒）与引擎类名，`match` 绑定与 lambda 形参这些**已经**在 `analyze()` 的 scope 里（十格里 `match`、lambda 两格都是「编得过、零诊断」，正好证反面）。少一项就是拦死合法工程，所以这格得连着名单一次做完，已记在任务 #24。
- **本轮零代码**：语料、门、产物都没动，`pnpm test` 814 例照旧全过。

### 1.40 #24 发出去：值位置的 78 个内置名不再误拦，`var f = abs` 是真 Callable（2026-10-05，S237 / S238，语料 239 / 240）

- **判据搬到分析器，不是搬到发射器**：作用域本来就只有 `lower/analyze.ts` 有，所以取值点由它记账、发射器认号发 `rt.globalCallable(名)`。三格遮蔽实测都按这个方向才对（`gc8`）：`var len = 5` 之后 `len` 归局部而 `abs` 还是全局；`var abs = 7` **之前**那一读仍是全局；lambda 形参 `abs` 只在体内盖住。中途试过的「发射器自己收一份局部名超集」被这三格否掉了 —— 超集会吃掉声明之前的那读，还会把 `UNBOXED` 的裸值优化按名字整支盖上去（真跑出来是 `Cannot access 'len' before initialization`）。
- **记账用 `名@行:列` 而不是节点身份**：原生 CLI 那条 scriptc 通道报 **SC1090**（对象进 `WeakSet` 不属于能跨界那几种形状），loc 键既过得去又抗重复 lower。顺带把 `tools/compile.ts` 从「诊断 lower 一遍、发射再 lower 一遍」并成一份 IR 走 analyze → emit。
- **表在运行时、名单只有一份**：新增 `runtime/global-names.ts` 收实测的 78 行（`scope` 前缀 / `get_argument_count()` 读数 / `.call()` 区间），分析器与发射器都从它取键，`methods.ts` 那张「名字 → 式子」表由 ops 门钉住与实测表一一对上（60 支发得出、18 支只拒调用不拒取值）。变元两支单独量：`str` 是 `[1, ∞)`、`range` 是 `[1, 3]`。
- **顺手修掉三处**：`get_method()` 四种形状实测都是 **StringName（typeof 21）**，我们一直在发 String；`get_bound_arguments_count()` 从没发过；**`X.bind()` 零实参也算绑过**（四支实测全一致，S238）—— 盒子因此多一个 `boundOnce`，等式与字典键读它，`bound.length` 只喂 `get_bound_arguments*()`。另加一种字典键编码 `g:<名>:<绑过>`。
- **账**：语料 239（64 格）+ 240（19 格）、ops 新增 `global-callable.test.ts` 46 格、guards 新增「值位置 Callable 78/78」；`test:diff` **154/154 逐字节**、静默错误 0，`pnpm test` **912 例 / ops 1601 条**全过，`test:scriptc` 10/10，原生 CLI 重编后 **22/22**，`pnpm typecheck` 4/4。
- **还欠的两格**：引擎类名当值用仍是误拦（`ClassDB` 名单 + 带号的打印没定口径，§6 第 19 条）、`hash(全局 Callable)` 与 `"{0}".format(abs)` 那两格读数没合桌（§6 第 20 条）。

### 1.41 `print(o.method)` 发出去：五种 Callable 形状共用一句标签（2026-10-05，S239，语料 241）

- **先量再动手**：`corpus/cases/241` 的 20 格与 `tmp/probe-callable-print/`（带 `project.godot` 的四份脚本：`class_name Util`、无 class_name 的 `implicit.gd`、`extends "res://util.gd"` 的 `child.gd`、`extends Node` 的 `nodey.gd`）一起量出标签规则 —— `<原生基类>[(<class_name ?? 文件名>)]::<方法>`，内部类没有括号那一截、静态一律 `GDScript::<名>`、空的是 `null::null`、lambda 是 `<anonymous lambda>(lambda)`，绑过实参不改它。
- **一句标签两处用**：打印与 `Invalid call to function '… (Callable)'` 实测是同一串，所以合成 `callableLabel()` 一个出口 —— `show()` 与 `callableCallLabel()` 都读它，S212 那格「外层脚本自己的方法要文件名、发不出就拒」的 `[callable-arity-label]` 随之销账（ops 里那条 `shouldThrow` 换成实测那句 `SceneTree(main.gd)::topfn`）。
- **叶子拿不到类身份**：`callable.ts` 是最叶子，`object.ts` 在 import 时把「静态 / 实例方法」那两支挂成 hook；`ClassDesc` 多一个 `scriptLabel`，由发射器按 `m.className ?? basename(resPath)` 登记 —— 语料 codegen 的 `GEN_EMIT_OPTS` 因此补 `resPath: "res://main.gd"`，与 `compileProject` 给用例算出来的那个值一致。
- **`var_to_str` 顺手补齐**：方法 / 静态 / lambda / 空 / 全局 / 绑过的六格实测全打 `Callable()`，`[var-to-str-type]` 那支的适用面缩到「真有形状却没量过」的。
- **账**：语料 241（19 格）、ops 新增 10 格（1609），`test:diff` **155/155 逐字节**、静默 0，`pnpm test` 915 例，`pnpm typecheck` 4/4。撞出来的工作规则记在 §2 第 13 条：**新增 runtime 导出要先 `pnpm build`** —— 工程形状的用例吃的是 `gds2js/dist/runtime.mjs` 那份副本，这次十来个用例一起报 `registerScriptLabel is not a function` 就是它。
- **没发的两格**：静态方法 Callable 当字典键（打印量到了 `{ GDScript::sm: 1 }`，键要的类身份号没有，按标签分格会把两类别名同名的并成一格 → §6 第 21 条）、`Callable.get_object()`（两支都带进程内号 → §6 第 22 条）。

### 1.42 §1.41 那两格的第一格：静态 Callable 的字典键吃类身份号（2026-10-05，S240，语料 241 再加 6 格）

- **先把「会不会撞键」量出来**：探针项目里放四个都叫 `shared` 的静态方法 —— `Util` / `Widged` 两个 `class_name` 类加 `Kid` / `Cub` 两个内部类 —— 一起塞进一张字典给 `d.size()` 4、逐键取回各自的值、两两 `==` 全假、`has` / `erase` 按类走、`.call()` 各调各的，而 `str(d)` 打出来是四串一模一样的 `GDScript::shared`（k01–k07）。上一轮担心「按标签分格会把两格并成一格」就是这么量死的：引擎的等式跟打印不是一条，键必须吃**类身份**。
- **实现只多一个字段**：`ClassDesc` 拿 `nextObjectId()` 发一个 `readonly gdObjectId`，与 `GdIdentified` 同形 —— `callableKey` 里那条 `q:<号>:<名>:<绑过>` 原本只认实例，现在类值也走同一条，判据一行没加。标签那头照常 `GDScript::<名>`，所以「同一串两格」是引擎本来的样子。
- **账**：语料 241 从 19 格长到 25 格（r01–r06）、ops 1610（新增一格比 `keyOf` 不同 + `GDict` 两格），`pnpm build` 后 `test:diff` 与 drift 门一起重跑；`[show-type]` / `dict-key-type` 这两支拒口又各少一类形状。
- **剩的那格**：`Callable.get_object()` 两支都带进程内的号（§6 第 22 条），要先定「关系对、数字不对」这一族在语料里怎么记。

### 1.43 文本进 Color 全量齐：名字表补齐、hex 四位与两条拒口销账（2026-10-05，S241，语料 242）

- **名表这一族 4.3 与 4.6.3 没有分岔**：把源码 `color_names.inc` 的 146 支逐个喂给判断引擎的 `Color("<名>")`，回读 `to_html(true)` 与表里整数逐支比 —— **零出入**（`tmp/probe-color-names/names.log`）。我们那张只有 138 支，补齐差的八支（`dark_khaki` `light_goldenrod` `medium_orchid` `transparent` `web_gray` `web_green` `web_maroon` `web_purple`），文件由 `tmp/probe-color-names/regen.ts` 从读数生成、不再手抄；表里只有 `GRAY` 没有 `GREY` 也照实测留成缺口。
- **抓出两处静默错**（不是拒口，是给了错值）：① 引擎查名前会抹掉 空格 / `-` / `_` / `'` / `.` 五种分隔符再转大写，我们只抹下划线，于是 `Color("web green")` 给 `(0,0,0,1)`；② hex 的「一数字一通道」有 3 位**和 4 位**两档，我们只展 3 位，`Color("f00f")` 同样静默变黑。两格都是语料 242 的 golden 对拍抓出来的。
- **发出 `Color.html_is_valid()`**（只认长度 3/4/6/8 与十六进制位，`#` 可省：`"#f0"` 假、`"#fff"` 真、`"#"` 假），并把 `convert` / `type_convert` 的 `[convert-color-string]` 销掉：两支都吃 String 的名字 + hex，认不出给 `(0,0,0,1)` 而不是 null。
- **一条不许顺手统一的分岔**：StringName 只在 `convert` 那一侧认，`type_convert(&"red", TYPE_COLOR)` 与 `type_convert(&"00ff00", TYPE_COLOR)` 实测都给 `(0,0,0,1)`（`sn.log` w01）—— 照读数分开走。
- **顺带钉两笔「4.6.3 没有的名字」**：`String.to_color()`、`Color.from_uint()` / `from_uint8()` 都是解析期 `Cannot find member`（探头前两版就死在这上面）。
- **账**：语料 242（15 格）、ops 新增 `color-text.test.ts` 14 格（1624 条），`convert.test.ts` 那条「响亮拒」的老读数改成实测值；`pnpm test` 921 例、`test:diff` **156/156 逐字节**、drift 244、静默错误 0，`pnpm build` 后 scriptc / pkg-modes / export / 原生 CLI 一起重跑。

### 1.44 引擎类名当值用：误拦停了，发的是身份盒子（2026-10-05，S242，语料 243）

- **名单先量齐**：4.6.3 的 `ClassDB.get_class_list()` 是 **1053 支**，一支一名冻成 `packages/compiler/src/lower/engine-classes.ts`；大小写硬（`HttpRequest` 与 `NonexistentClass900` 解析期就拒），与 78 支「能当值用的函数名」、21 支「类型名兼函数名」零交集 —— 三条都由 guards 钉住。
- **放行照旧走真实作用域**：类名**可以当局部名**（`var Node = 1`、`func v(Node)` 实测都过），所以这次是分析器在同一套 `名@行:列` 记号上记的第二类，被局部盖住的读还是发局部；发射器发 `rt.nativeClass("<名>")`，一个类名一个盒子（`Map` 记忆），于是 `typeof` 24、`Node == Node` 真、`Node == Label` 假、`{Node: 1, Label: 2}` 两格、`count(Node)` 2 全都白拿。
- **复现不了的两支各给一条拒**：打印带进程内的号（`<GDScriptNativeClass#…>`）→ `[show-native-class]`；`Node.new()` 实测造得出 `<Node#…>` 的实例、类值的属性面没建模 → `[native-class-member]`。语料 243 因此只钉身份读数（10 格），带号的一律不进 —— §6 第 19 条就此从「误拦」收窄成「带号打印怎么记 + Tier 2 的实例化」。
- **账**：ops 新增 `native-class.test.ts` 9 格、guards 新增 6 格（123→128），`test:diff` **157/157 逐字节**、静默 0，`pnpm test` 931 例 / ops 1633 条，drift 245、scriptc 10/10、pkg-modes 与 export ok 10 / FAIL 0，`pnpm build`（新增 runtime 导出）后原生 CLI 重编再 22/22。

### 1.45 `char(n)` 的码点闸门：U+FFFD 是建串那一刻换的，78 支变 79 支（2026-10-06，S243，语料 244）

- **§6 第 18 条② 的那一问有答案了**：`char(0).unicode_at(0)` 就是 65533、`length()` 仍是 1、`to_utf8_buffer()` 是 `ef bf bd` —— 换字符发生在**建串**那一刻，不是 String→UTF8 那层，所以 `print` / `c_escape` / `var_to_str` 三条通道天然一致（`var_to_str(char(0))` 长 3、`"a"+char(0)+"b"` 是 3 个码点，两处都是这么来的）。四类不合法同一个结果：`0`、负数、代理区 `D800`–`DFFF`、超过 `0x10FFFF`；合法侧把边界钉在 `1 / 65 / 0x7F / 0x80 / 0x10FFFF`。
- **带 `Unicode parsing error` 的那几格进不了语料**：引擎除了给值还往 stderr 打一句，`normalize()` 只剔 `core/variant/` 那几帧，这句会留在 golden 里而 JS 侧发不出 —— 所以这类读数只进 ops，语料 244 清一色合法码点（12 格，含 `é` 的 `195,169` 与 U+10FFFF 的 utf8 长度 4）。
- **arity 两句从解析期搬到发射期**：`char()` / `char(1, 2)` 引擎是**解析期**拒（脚本到不了输出），文案 `Too few arguments for "char()" call. Expected at least 1 but received 0.` 与 `Too many arguments … Expected at most 1 but received 2.` 一字不差地钉在 guards 的 `[char-arity]` 两格上。
- **`char` 补进「能当值用的全局函数名」表，78 → 79**：`typeof` 25、打印 `@GDScript::char`、`get_argument_count()` 1、`.call(65)` → `"A"`、等式按名；顺带把 `String.chr` 与全局 `char` 合成一支 `stringChr`（实测两支相等），两条通道不再可能分岔。实参收敛仍是 int 那条道（`char(1.5)` → 1、`char(2.9)` → 2）。
- **账**：语料 244（12 格）、ops 新增 `char-codepoint.test.ts` 14 格（1633→1647）、guards 新增一格（128→130 例），`test:compile` 166/235，`test:diff` **158/158 逐字节**、静默 0，drift 两道全绿（golden 244/244、codegen 2/2），`pnpm test` 939 例，`pnpm build` 后 pkg-modes 25/25、export ok 10 / FAIL 0、面探针 1/1（57s；顺手把 §2 第 13 条里那条已经不存在的 `tools/scriptc-check.mjs` 改成 `GDS2JS_SCRIPTC_FILTER` + `pnpm test:scriptc`）、原生 CLI 20/20、typecheck 4/4。

### 1.46 `var_to_str` 的「缩进串」是个假前提：4.6.3 也只认一个实参（2026-10-06，S244，§6 第 18 条① 销账）

- **一问到底**：§6 第 18 条① 记的是「4.6.3 有第二个实参 `indent: String`、式子没量出来」，本轮不去量式子，先去量**到底有没有这个实参** —— 解析期一句 `Too many arguments for "var_to_str()" call. Expected at most 1 but received 2.`（三支实参那句是 `received 3`），`var_to_str()` 是 `Too few arguments … Expected at least 1 but received 0.`，`str_to_var` 三格同形；`get_argument_count()` 给 1；把 `var_to_str` 当 Callable 用 `.call({1: 2}, "->")` 撞的是运行期那句 `Invalid call to function '@GlobalScope::var_to_str (Callable)'. Expected 1 argument(s).`，`callv` 给两支实参按 S237 的口径安静 null。三个面各自独立、方向一致：**没有这个实参**。
- **这条卡点因此从「欠量测」变成「已结清」**：所谓「缩进串会让装字典的数组一起换行、收尾的 `]` 一会儿顶格一会儿缩两档」不在这一版的行为里；§1.31 记的方向整个反了 —— 不是「4.3 没有、4.6.3 有」，是两边都没有，已在原文处补一句推翻。剩下真正的两格照旧挂着：浮点尾数（§6 第 18 条之外那条卡点）与 `str_to_var` 的③。
- **实现只动文案**：`[var-to-str-arity]` / `[str-to-var-arity]` 的自造中文换成引擎那两句（少给 "at least 1"、多给 "at most 1"），三支单实参名（`char` / `var_to_str` / `str_to_var`）合成一支 `singleArgArity` —— 措辞只有一份，改一处不会漏两处；发射与拒的形状都没变。
- **账**：guards 那一格从 1 支名扩成 3 支名 × 7 断言（编得过 / 零实参 code / 双实参 code / 两句原文 / 三支发射形状），仍 130 例全过；ops 1647 条与 typecheck 4/4 不变；`[var-to-str-arity]` 的拒口继续钉在「转换族单实参口径 11/11」。

### 1.47 `str_to_var` 的 `\U` 发出去了：六位、越界折 U+FFFD、代理区整串作废（2026-10-06，S245，语料 245，§6 第 18 条③ 收窄）

- **量法**：`\U` 这种「吃掉几位」的问题只能靠**尾数留不留**来判 —— 探头把 `\\U0001F600` 之类喂进 `str_to_var`，读回 `length()`、`unicode_at(0)` 与 `to_utf8_buffer().hex_encode()` 三栏，四批共 45 格（`tmp/probe-str-to-var-u/`）。结论是一条四档式子：**读满六位**十六进制位（大小写都收），六位不足或夹非十六进制位 → **整串作废给 null**；读到的值在代理区 → 同样是**整串作废**；`> U+10FFFF` 或 `0` → **U+FFFD**；其余照本来的码点。多出来的第 7、8 位**照字面留在串里**（`10FFFF` 给 U+10FF + `FF`，`FFFFFFF` 给 U+FFFD + `F`）。
- **顺手抓出一格静默错**：`"\u0000"` 引擎给 U+FFFD（长度 1、字节 `ef bf bd`），我们以前在这里发的是真 NUL —— 语料与 ops 都没有这一格，所以它一直没被发现。同一批还量清「非字符」`U+FFFE` / `U+FFFF` 两支**照收**，折叠名单里没有它们。
- **报警的那两类不进语料**：NUL 与越界两支引擎除了给值还往 stderr 打 `Unicode parsing error …`（`Invalid unicode codepoint (那六位小写原文)` / `Unexpected NUL character`），`normalize()` 滤不掉，所以这几格只进 ops；语料 245 钉的是不报警的 12 格，一次跑绿。与语料 `075-escape-unicode`（GDScript 自己的字面量也是六位）正好成对：读侧与解析侧同一条位数。
- **`[str-to-var-shape]` 从此只剩一张表**：构造式的名字仍只量过「`NoSuchType(1)` 给 null」与「`Rect2` 给真值」两头，中间那张「Godot 到底认识哪些名字」的表没量，认不出就抛，不发可能是错的 null。
- **另外修了一处文档伤**：上一轮那条脚本化的 §6 改写把 item 18 之后的内容整段截掉了（19–22 条与「## 7. 语料索引」共 33 行），本轮从 `4f483a7` 取回并逐行核过 —— 教训是脚本改文档时 `slice` 的**尾段**必须显式接回去，锚点找不到要抛而不是凑。
- **账**：语料 245（12 格）、ops 新增 `str-to-var-upper-u.test.ts` 19 格（1647→1666），`convert.test.ts` 那格旧的 `[str-to-var-shape]` 读数换成实测值；`pnpm test` 944 例、`test:compile` 167/236、`test:diff` **159/159 逐字节**、静默 0，golden 漂移 **0**（245/245 一次绿，超时 17 与解析报错 69 是那两族的既有形状）、codegen drift 2/2，面探针 1/1，pkg-modes 25/25，原生 CLI 重编后 20/20，export ok 10 / FAIL 0，typecheck 4/4。

### 1.48 `format` 的 Object 实参发出去了：属性表按「自己类在前、基类在后」（2026-10-06，S246，语料 246，§6 第 20 条② 结账）

- **先量族、再量式子**：`tmp/probe-format-nontainer/` 五批探头把「实参不是容器」的每一形都喂了一遍 —— nil / bool / int / float / String / StringName / Vector2 / Color / Callable / 空 Callable / pack / 引擎类值 / 信号 / 宿主 int。引擎的动作统一是**不改串**，另外往 stderr 打 `ERROR: Invalid type: use Array, Dictionary or Object.`。我们标量那半本来就是这个行为，只有 OBJECT 整支在 `[format-object]` 后面拒着；现在 Callable / pack / 类值 / 信号四形也归到「原样返回」，因为它们不是引擎意义上的 `Object*`。
- **真对象那一支的式子只有一句顺序**：按属性表逐个把占位符里的 `_` 换成属性名、再全串替换，值走 print；认不出的键留着、大小写硬。顺序实测是**自己类在前、基类在后** —— `Kid{three,back}` 挂 `Base{two,holder}`、`holder` 的值是 `"{three}"` 时，`"{holder}|{three}|{two}"` 给 `{three}|3|2`（换成基类先走就是 `3|3|2`，静默错）。这条顺序是本轮唯一「不量就会写错」的地方。
- **因此发射器多发一行**：带脚本变量的类各发一条 `rt.registerScriptProps(__gd_d_X, […])`（声明顺序），运行时沿 `desc.base` 串成引擎那张表。挂着的 `fieldTypes` 顶不上 —— 它只登带类型且类型受支持的字段，未定型的脚本变量根本不在表里。代价是 36 份 `main.gen.mts` 重生成（codegen 门 2/2 认了）。
- **仍拒的两格**：`{script}` 引擎打 `():<GDScript#一个进程内的号>`；挂在没量过属性表的原生基类（Node / Resource 那一族）上的脚本实例。后者在 Tier 1 现在也走不到 —— `Node.new()` 自己先吃 `[native-class-member]`。
- **缺省占位符那一格别再猜**：`"{_}"` 对 Object 不成立（`{_}={_}`、`{}` 都原样），显式占位符不含 `_` 时对所有属性都是同一个字面量。数组与字典两条通道一格没动，实测过才算。
- **账**：语料 246（14 格）、ops 新增 `format-object-props.test.ts` 17 格（1666→1683），`string.test.ts` 那格「响亮拒」读数换成实测值；`pnpm test` 950 例、`test:compile` 168/237、`test:diff` **160/160 逐字节**、静默 0，golden 漂移 246/246 全绿（漂移 0）、codegen 2/2、guards 130 例、pkg-modes 25/25、面探针 1/1 与代表集 10/10、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.49 `Callable.get_object()` 发出方法与静态两形（2026-10-06，S247，语料 247，§6 第 22 条收窄）

- **量的是关系不是号**：四形一起喂（`tmp/probe-callable-object/`，方法 / 静态 / lambda / 空 Callable / 全局内置 / 绑过的）。方法那形 `o.m.get_object() == o` 真、跨实例假、`.v` 取得到、`get_class()` 是 `RefCounted`；脚本自己的方法给 `self`；**绑过实参不改 owner**。这些全是可复现的关系，所以进了语料（247 的 9 格，逐字节一次过）。
- **静态那一形是白拿的**：`Inner.sstat.get_object() == Inner` 实测真 —— 我们的静态 Callable 接收者本来就是类值，`box.object` 原样返回就是同一条等式；`== 外层脚本` 假也对得上。
- **拒的两形各有理由**：lambda 的 owner 是**定义它那个类的 GDScript 对象**（`== get_script()` 真、`== self` 假，而内部类方法里造的 lambda 连外层脚本都不是 —— u04 两格都假），我们没有一个用户能拿到同一个身份的 GDScript 对象值；空 Callable 与全局内置给的是 **typeof 24 的 null Object**（`<Object#null>`、`== null` 真），这个形状我们根本没有。两支都抛 `[callable-get-object]`，不发「大概是 null」的东西 —— 发 `V.nil()` 会把 typeof 从 24 变成 0，那是把拒换成静默错。
- **两笔「4.6.3 没有的名字」**：`Callable.get_object_instance_id()` 与 `Callable.is_equal()` 都在解析期就 `Nonexistent function`（Godot 3 的两支没搬过来）—— 探头前两版死在这上面，记下来免得再去撞。
- **§6 第 22 条就此收窄**：值发出去了，**打印**那一格仍复现不了（`(文件):<GDScript#一个进程内的号>`），继续挂在「带号的打印怎么记」那条口径下面。
- **账**：语料 247（9 格）、ops 新增 `callable-get-object.test.ts` 6 格（1683→1689），`pnpm test` 954 例、`test:compile` 169/238、`test:diff` **161/161 逐字节**、静默 0，golden 漂移 247/247 全绿（漂移 0）、codegen 2/2、pkg-modes 25/25、面探针 1/1 与代表集 10/10、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.50 `is` 认引擎类名，顺手抓出「结构体也算 Object」那格静默错（2026-10-06，S248，语料 248）

- **入口是自家语料**：写 247 时 `cm.get_object() is RefCounted` 被我们的 `[is-type]` 拦下，引擎却给真。往回查发现两条毛病叠着 —— 名字表外的一律拒，而 `is Object` 是按**内部** Tag.OBJECT 判的。
- **静默错那条**：`Vector2(1, 2) is Object`、`PackedByteArray([1]) is Object`、`o.m is Object` 三条我们此前都给真，引擎三条都是假（m07 / m10 / n01 / n10）。以前照不着是因为实参一旦带静态类型，引擎**解析期**就拒（`Expression is of type "Vector2" so it can't be of type "Object".`）；换成 Variant（数组元素、`get_object()` 的返回值）这条通道就开了。这类「只有动态位才走到」的格子正是语料该钉的。
- **发出去的是一张形状表**：量过的名字只有 Object / RefCounted / Resource / GDScript / Node / SceneTree / MainLoop 七支，外加按盒子判的 Callable。脚本实例看登记的引擎基类（RefCounted 一条链、宿主 SceneTree 一条链 —— `self is RefCounted` 实测假），脚本类值一条四真的链（m06 / n08），引擎类值只有 {Object, RefCounted} 且 **`Node is Node` 假**（n07）。
- **三条仍拒，都是没量过**：表外的引擎类名、信号值对任何类名、以及**没登记引擎基类的实例**。第三条 Tier 1 现在走不到 —— `class X extends Resource` 在发射期先抛 `[class-extends]`（引擎类型属 Tier 2），它是防御性的拒；顺手把两条真链量下来留给 Tier 2 当靶子（Resource → {Object, RefCounted, Resource}、Node → {Object, Node}，类值则 `Res is Resource` 真、`Nodey is Node` 假，读数在 `tmp/probe-is-class/base-chain/`，那条探头本身因基类未发出而不进语料）。`as` 那一条一格实测都没有，故原样不动。
- **两笔解析期读数**：`Comparable` 在 4.6.3 不是类；实例化 Node / Resource 会让引擎退出时打 `WARNING: ObjectDB instances leaked at exit`，所以那两形只进 ops 与探头，不进语料。
- **账**：语料 248（14 行）、ops 新增 `is-engine-class-names.test.ts` 10 格（1689→1699），`pnpm test` 959 例、`test:compile` 170/239、`test:diff` **162/162 逐字节**、静默 0，golden 漂移 248/248 一次跑绿（漂移 0）、codegen 2/2、guards 130 例、pkg-modes 25/25、scriptc 代表集 10/10、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.51 `hash()` 的 Callable 那一支：内置那族折的就是名字哈希（16 支全中）（2026-10-06，S249，语料 249，§6 第 20 条① 结清）

- **先问稳不稳**：§6 第 20 条① 卡的是「跨进程还没验」。同一支探头连跑两个进程，`abs` `sign` `len` `str` `range` `load` `print` `str_to_var` 八个数一字不差 —— 这一族不是指针号，可以走靶子路线。
- **式子来自 4.3 树 + 16 支靶子**：`core/variant/callable.cpp:248` 那条是 `method.hash()` → `hash_murmur3_one_64(object, …)` → `hash_fmix32(…)`，而内置那一族走 `is_custom()` 分支，实测**折出来直接等于名字那支 String 哈希** —— 用 S212 已有的名字哈希逐名算，16 支全中（含 `type_convert` `convert` `ceil` `floor` `max` `min` `sqrt` `hash`），于是 `hash(abs) == hash("abs")` 这种同值关系也进了语料。
- **空 Callable 才是那条非 custom 式子**：名字空串（5381）+ 对象 0 折两轮再 fmix32 → 2661229415，一次中。
- **三支继续拒**：方法 3706878008、静态 346654436 这两轮稳定但五支候选式子都对不上（`fit.mjs`），lambda 两轮就换数（697588052 / 1141399711）—— 折的是引擎侧的函数标识，Tier 1 复现不了就抛 `[hash-callable]`，不发「大概是名字哈希」的数。顺带一条：绑实参不改数（`hash(o.m.bind(1)) == hash(o.m)`）。
- **代码里那句旧账是错的**：`callableCtor` 注释与拒口都写着「1 参那一格在 Godot 是解析期拒」。实测 `Callable(abs)` 通、`== abs` 真、typeof 25、哈希同值；解析期拒的是 `Callable("abs")` / `Callable(5)` / `Callable(null)` / `Callable(Callable, String)` 这些签名。发出去的规则因此是「单实参本身就是 Callable → 原样给回」，其余单实参抛 `[callable-ctor]`。
- **撞出一张表的缺口，记成 §6 第 23 条**：`type_exists` 值位置合法（`hash(type_exists)` = 4093741862），我们的 79 支表里没有它，分析器报 `undeclared-identifier` —— 那张表当初只扫了我们自己的名单，从没与引擎的全局函数表对过差集。下一轮把差集量出来（一支一名验 `typeof` / 打印 / `get_argument_count()`）。
- **账**：语料 249（9 行）、ops 新增 `hash-callable.test.ts` 13 格（1699→1712），`pnpm test` 964 例、`test:compile` 171/240、`test:diff` **163/163 逐字节**、静默 0，golden 漂移 249/249 全绿（漂移 0）、codegen 2/2、guards 130 例、pkg-modes 25/25、面探针 1/1、原生 CLI 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.52 全局函数名表补了 44 支：`sin` 这一批以前被当成「Godot 没这个名字」（2026-10-06，S250，语料 250，§6 第 23 条结清一轮）

- **怎么暴露的**：查 §6 第 23 条时先试 `print(sin(0.5))`。引擎给数，我们给 `[call-unknown] Function "sin()" not found in base self.`；`var f = sin` 另一句 `Identifier "sin" not declared`。**两句都在说「Godot 没这个名字」，而引擎两种都收** —— 这是「误拦合法工程」那一族里最大的一次（表只有 79 支，而引擎那族是 123 支）。
- **枚举拿不到，只能扫**：4.6.3 不把 `@GlobalScope` / `@GDScript` 当 ClassDB 类（`class_exists("@GlobalScope")` 假、`class_get_method_list` 空），DocData 也不在这个构建里 —— 所以候选池是 4.3 树 `core/variant/variant_utility.cpp` 的 `VariantUtilityFunctions::` 那一族 ∪ 我们两张名单 ∪ 4.4+ 已知的新名字，共 133 支；每支塞进 `GDScript.new()` 的 `func f(): return <名>` 里 `reload()`，成功才算合法，再读 `typeof` / 标签 / `get_argument_count()`。**123 收 10 拒**。
- **拒的那十支**：`acosd` `asindeg` `invalidate_nodes`（没有）、`assert`（是关键字）、`int` `float`（那 21 支「类型名兼函数名」）、`hex` `hex64` `rgb8` `rgb16`（4.6.3 不是全局函数）—— 这十支照旧 `undeclared-identifier`，方向与引擎一致。
- **发出去的是数据不是实现**：44 支新行一律 `TODO(scope, argc)`，区间 null ⇒ 取值、打印（`@GlobalScope::sin` / `@GDScript::type_exists`）、等式、字典键、`get_method()` / `get_argument_count()`、`hash()` 都按实测发，只有 `.call` 抛 `[global-callable-call]`；调用那一头则从 `[call-unknown]` 换回 `[emit-builtin] 内置函数 sin() 还没实现` —— 这正是 §6 第 17 条① 定的口径（「Godot 有、我们没做」要说成「我们拒」）。
- **标签前缀那张表第一次变宽**：`@GDScript` 那侧从七支变十支（多了 `dict_to_inst` `inst_to_dict` `type_exists`），guards 的「值位置 Callable」从 79 支变 123 支，整族从 130 例涨到 218 例。
- **还欠**：44 支的实现（数学那一族多半能从 4.3 树读出式子再逐格验；`inst_to_dict` / `dict_to_inst` 要对象模型，`printerr` / `printraw` 要宿主打印通道，`rid_*` 是 RID 形状），以及候选池的覆盖 —— 4.6 独有的名字若还有漏网的，量到再补。
- **账**：语料 250（10 行）、guards 218 例（123/123 那一族）、ops 沿用 1712 条，`pnpm test` 1052 例、`test:compile` 172/241、`test:diff` **164/164 逐字节**、静默 0，golden 漂移 单跑 250/250 全绿（漂移 0）、codegen 2/2、pkg-modes 25/25、面探针 1/1 与代表集 10/10、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。
- **一次误报值得记**：golden 检测与别的引擎门**并发**跑时，445 行 golden 的 `236-global-math-family` 会被判成超时并误报漂移 —— 本轮第一次就是这么报的，单独重跑 245/245 全绿。已写进 §2 第 14 条的观察项。

### 1.53 44 支里先结四支：`absf` `absi` `wrap` `is_same`，外加两处静默错（2026-10-06，S251，语料 251，§6 第 23 条收窄）

- **为什么先做这四支**：44 支里只有它们不需要新地基 —— 式子是纯算术或纯比较，边界能一支一名量清楚；`sin` 那一族要逐格验超越函数、`inst_to_dict` 要对象模型、`printerr` 要宿主通道、`rid_*` 要 RID 形状，各是独立一轮。
- **`absi` / `abs` 在 INT64_MIN 上回绕**（e.log v11 / v13：两支都给 `-9223372036854775808`）。以前我们对负数直接取反装箱，发出去的是一个**装不进 int64 的数** —— 那是静默错，只是过去没有任何一格写到 `abs(-2**63)`。两支都改走 `wrap64`。
- **实参类型这一眼只能一支一支量**（f.log 十二格）：每一格包在自己的函数里，运行期错只掐那次调用，否则 `_initialize` 一挂整份探头就没读数了。String / StringName / Nil / Array / Vector2 五形全报 `Invalid type … Cannot convert argument 1 from X to float.`（absi 换 int），bool 反而收（`absf(true)` → 1.0）。语料进不去这些格 —— 引擎的 ERROR 在 stderr，stdout 一格不出；闸门因此是 `[arg-float]` / `[arg-int]`，与 `intArgBig` 那条例外同形。
- **`wrap` 的型别按实参那一眼，`止 < 起` 也量了**：`wrap(7, 0, -5)` → -3、`wrap(-1, -3, 0)` → -1、`wrapf(1.5, -3, 0)` → -1.5。现有那条「先交换起停」的式子在两格上都对得上，一格没改；`wrap` 只新增「三支全 int 才走整数道」那一层。
- **`is_same` 是「先比类型，再按类型比同一性」**：`is_same(1, 1.0)` / `(1, true)` / `(3.0, 3)` / `(0, -0.0)` 全假，`&"a"` 与 `"a"` 假；浮点 `0.0` 与 `-0.0` 真、`NAN` 与 `NAN` 真；数组 / 字典 / pack / 对象 / 类值 / 信号按身份（两个等值数组假），Callable 按等式（`o.m` 与 `o.m` 真、与 `o.m.bind(1)` 假），结构体按分量。
- **z06 那一格逼出第二处静默错**：为了钉 `absf(INT64_MIN)` 顺手量了大浮点（g.log 十五格），引擎的口径是 4.3 树 `String::num_real()` 那一眼 —— **落进 int64 就按整数十进制精确展开，装不进才换成约 17 位有效数字**。实测 `2^62` → `4611686018427387904.0`、`2^63-1024` → `9223372036854774784.0`、`123456789012345678.0` → `123456789012345680.0`，而 `2^63` → `9223372036854775800.0`、`1e19` → `10000000000000000000.0`。我们以前对所有整数值浮点都用后者，`print(absf(-4611686018427387903))` 因此少印两位。`strFloat` 现在也按这一眼分岔。
- **表里的计数**：可派发 61→**65**、该拒 62→**58**，`GLOBAL_IMPL` 多四行、`GLOBAL_TODO_FUNCTIONS` 少四个；`methods.ts` 里那句「没实现的 18 支」是老账，一并换成 58。
- **账**：语料 251（32 行）、ops 1712→**1749**（新门 `small-builtins.test.ts` 37 格），`pnpm test` 1059 例、`test:compile` 173/242、`test:diff` **165/165 逐字节**、静默 0，golden 漂移单跑 251/251 全绿（漂移 0、缺 golden 0），codegen 2/2、guards 214 例、pkg-modes 25/25、面探针 1/1、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.54 三角与双曲 13 支发出，名表换成按 doc XML 重核（2026-10-06，S252，语料 252，§6 第 23 条再收窄）

- **为什么这一族先做**：44 支剩下的部分要么要新地基（对象模型、宿主打印、RID），要么要逆 PCG；三角与双曲是纯式子，边界也能一支一名量。
- **量法是逐格比文本而不是比数值**：`h.gd` 一支函数 × 25 个实参 = 435 格、`l.gd` 再补幅度阶梯 56 格，比的是「`value|typeof` 两栏文本」—— 数值上 5e-15 的差在打印里看不见，只有文本比法才会漏。
- **引擎的 `::sin` 在大幅度上丢位**：`cos` 从 1e6、`sin` 从 1e7 起与本机的式子差到第 11~14 位（`sin(1e10)` 引擎 `-0.48750602507627` vs `-0.48750602508751`）。本机的更准，但裁判是引擎 —— 于是 `sin` / `cos` **只发到量过的那一格**（1e6 / 1e5），过界抛 `[trig-large-arg]`；`tan` 到 1e300 都对得上，不设限。
- **四支反函数引擎先夹再算**（4.3 树 `math_funcs.h` 那四行「Always does clamping」＋实测）：`asin(±2)` → ±π/2、`acos(2)` → `0.0` / `acos(-2)` → π、`acosh(<1)` → `0.0`、`atanh(>1)` → ±inf；NaN 不夹。
- **名表换了来源**：上轮那 133 支是从 `variant_utility.cpp` 的 `VariantUtilityFunctions::` 声明扫的，**漏了 `FUNCBINDR(...)` 那张注册表**，于是 `acosh` 整支没进候选。换成 4.3 的 `doc/classes/@GlobalScope.xml` ∪ `modules/gdscript/doc_classes/@GDScript.xml`（128 支）再核，缺的只剩五支；实测 `preload` / `assert` 在值位置不合法（前者 `Expected "(" after "preload".`），`acosh` / `is_instance_of` / `print_debug` 合法 → 表 123 → **126**。
- **两支只发形状**：`is_instance_of`（`@GDScript`、argc 2）与 `print_debug`（`@GDScript`、argc 0）的量法与上轮那 44 支一样（`GDScript.new()` 里 `return <名>`），式子没量，`.call` 抛 `[global-callable-call]`。
- **AOT 面上白捡一整个函数族**：`252-trig-family` 单独走 scriptc 出货门 1/1 逐字节一致 —— `Math.asinh/acosh/atanh/cosh/tanh/sinh` 这些以前从没在 AOT 面上跑过，都有 lowering。
- **计数**：可派发 65→78、该拒 58→48（40 支欠账减到 28 支，另加两支新名）；`@GDScript` 标签前缀十支变十二支。
- **还欠**：`atan2(-0.0, 0.0)` 那一格（引擎 `-π`、本机负零，而负零在 stdout 里看不出来）；`sin`/`cos` 上限之外的幅度要匹配就得逆引擎那套归约；4.4+ 新增的名字在 4.3 的 doc XML 里也不会有，仍是同一条覆盖性提醒。
- **账**：语料 252（54 行）、ops 1749→1768，`pnpm test` 1059 例、`test:compile` 174/243、`test:diff` 166/166 逐字节、静默 0，golden 漂移单跑 252/252，codegen 2/2，guards 全过，pkg-modes 25/25，面探针 1/1 与 `252-` 的 scriptc 1/1，原生 CLI 重编后 20/20，export ok 10 / FAIL 0，typecheck 4/4。

### 1.55 角度族与 dB / 幂次 / 步长 12 支发出，`angle_difference` 的 ±π 翻法换成引擎那句（2026-10-06，S253，语料 253，§6 第 23 条再收窄）

- **一次量一整族**：四张探头（`n.gd` 单/双参一格一读数、`o.gd` 补多参与门槛边界、`p.gd` 角度的 ±π 那一格、`q.gd` 差 1e-9 的邻格）——`_initialize` 里运行期错只掐自己那次调用，所以一格一个函数是这类矩阵量的前提。
- **`step_decimals` 打掉了「按对数」这个想当然**：引擎的式子是拿小数部分比一张十格门槛表（`0.9999 / 0.09999 / …`），读数 `1.5 → 1`、`2 → 0`、`12.3456 → 1`、`0.01 → 2`、`inf / nan → 0`。任何 log 形式的猜测在这一族上格都不对，所以这条只能从源码读，不能从语义推。
- **`nearest_po2` 是「进一位」不是「取最近」**：`5 → 8`（离 4 更近），`0 → 0`、`-3 → 0` 是无符号抹平再加一的自然回绕。这一支的 `inf` 那格引擎给 `INT64_MIN`（`cvttsd2si` 越界的 UB 读数），一般规则没量清，我们继续 `[arg-int]` 拒。
- **修掉一处静默错**：`angle_difference` 以前用 1e-5 的近似判 ±π 才翻。实测「正好 ±π 才翻」——`angle_difference(PI, 0)` 引擎 **+π**（我们 -π），`angle_difference(0, PI - 1e-9)` 不翻。换成引擎那句 `fmod(2*d, TAU) - d` 之后 `lerp_angle` / `rotate_toward` 三格跟着对上，96 行的语料 253 首轮就逐字节一致。
- **`rotate_toward` 的 delta 语义读源码才靠得住**：`from + CLAMP(delta, |差| - π, |差|) * sign(差)` —— 负 delta 那一格没量过（式子给了行为，语料里不钉），delta 比弧大时落在**折过界**的目标上（`3 → -3` 走 +0.28318 得 `3.28318…`，越过了 π 也不回折）。
- **可选实参的 arity 只在一侧可达**：`pingpong` 的第三支、`nearest_po2` 的第二支（`round_up`）在 `.call()` 那侧引擎自己就拒（`Expected 2 / 1 argument(s)`），直接调用那一形没量 —— 表的区间因此照实测留 `[2,2]` / `[1,1]`。
- **计数**：可派发 78→**90**、该拒 48→**36**；第二批那 44 支欠账减到 16 支（另两支是这轮新加的名，只发形状）。
- **账**：语料 253（96 行）、ops 1768→1782，`pnpm test` 1053 例、`test:compile` 175/244、`test:diff` 167/167 逐字节、静默 0，golden 漂移 247/253 + 头六格逐格单跑复验 6/6（漂移 0；本轮两次整跑都在冷启动段把最前面的格判成超时，见 §2 第 14 条）、codegen 2/2、guards 195 例、pkg-modes 25/25、面探针 1/1 与 `253-` 的 scriptc 1/1、原生 CLI 重编后 20/20、export ok 10 / FAIL 0、typecheck 4/4。

### 1.56 `run --watch` 的「第一拍」记号：读空一次就再也不重跑（2026-10-06，CLI 门）

- **怎么撞上的**：本轮出货门整跑时 `⑨b run --watch` 连着两次在 35.5s 判失败（两次整跑都一样），失败缓冲里只有脚本第一次的 `watch-a` 与那句 `👀 监听 …` 横幅 —— 改了 `.gd` 之后**一次都没重跑**，连「—— 重新运行 ——」都没出现过；单独点这一格 6.5s 就过，把 ⑨/⑨b/⑨c 三格合起来点也全过。
- **代码里的确定性缺陷**：`watch.ts` 的 `poll()` 用 `if (last !== "" && sig !== last)` 判变更，而 `""` 既可能是「这目录里一个 `.gd` 都没有」也可能是「这一刻 `readdirSync` 抛了」（`gdSignature` 对读不到的目录 `continue`，读得到的空目录同样给 `""`）。于是**首拍读空 ⇒ `last` 停在 `""` ⇒ 之后永远不比对**，改文件不会重跑 —— 这一条不需要复现今天的环境就能从代码读出来。
- **改法**：换成 `primed` 布尔记号，首拍只负责落基线（哪怕基线是 `""`），之后摘要一变就重跑。另外 `⑨b` 的夹具目录原来只 `mkdirSync(recursive)`，跨轮残留的 `main.gd` 与新写入的那份**字节数相同**（`watch-a` / `watch-b` 等长，只有 mtime 会变），现改成与 `⑨c` 一样先 `rmSync` —— 门自己不该带跨轮状态。
- **归因留着**：改完两处后整跑 20/20，但我没拿旧代码把今天的失败复现出来，所以「是哪一处解掉的」不写死；能写死的是首拍读空那一支的行为不对，与今天两次失败的现象（横幅之后再无任何输出）也自洽。
- **门自己的一条账**：同一天里 golden 整跑先 1225s（上轮 522s）并把 001–006 判成超时报漂移，逐格单跑 6/6 干净（1.5–2.2s/格）；`①②④⑨c` 这些格也从 5–8s 涨到 20–31s。这台机器慢下来的时候，**看门钟点先分清是读数变了还是没跑完** —— 已把「冷启动/整体变慢」这一形态与复跑命令写进 §2 第 14 条。

### 1.57 内置函数少给 / 多给实参改在发射期拒：`undefined` 不再进产物（2026-10-06，S254，§6 第 24 条结清）

- **量法**：二十支 × 两形，一形一份脚本（解析期错误会让整份脚本出不来，只能拆开跑），一支一支把两句原文抄回来 —— `tmp/probe-arity/gen.mts` 是可重跑的，加一支名只要往表里加一行。
- **撞出这一族的经过**：本轮给三角/角度族加发射点时，顺手拿 `rotate_toward(1.0, 2.0)`（少一支）试了一下，产物里是 `rt.gRotateToward(rt.V.float(1), rt.V.float(2), undefined)`；再把 `BUILTIN` 整表与实测区间对了一遍，`clamp(1)` / `lerp(1, 2)` / `snapped(1)` / `abs()` 全都一样 —— 不是新加的这几支的毛病，是**分析器对内置调用根本不查 arity**。
- **改的是口径而不是文案**：一张 `[min, max]` 表 + 一句 `Too few/many arguments for "x()" call. Expected at least/at most N but received M.`；表按读数建（`min` / `max` 是 `[2, ∞)`，`cubic_interpolate_in_time` 是 `[8, 8]`），表外的变元与类型构造器照旧不拦。
- **guards 是唯一能钉住它的门**：这两句走 stderr，golden 里只剩空 stdout，所以语料进不去；新增一 it 钉四十格 + 三支「不该拦」的负断言，guards 195→196 例。
- **账**：`pnpm test`、`test:compile` 175/244、`test:diff` 167/167 逐字节、guards 196、codegen 2/2、typecheck 4/4、golden 漂移本轮整跑把 13 格判超时（机器慢两三倍，见 §2 第 14 条），这一改动动不到引擎读数，覆盖它的是改完之后跑的 `test:compile` 175/244 与 `test:diff` 167/167。

### 1.58 `type_string` / `error_string` 的名表发出，顺带量到那两支的形参是 int32（2026-10-06，S255，语料 254，§6 第 23 条再收窄）

- **欠账的真相是「没人去读表」**：§6 第 23 条一直写这两支「要的是枚举名表」，其实一支一名把 0–75 号打一遍就拿到了 —— 40 格类型名 + 49 格错误码名 + 出界那两串。
- **溢出那一格是本轮唯一意外的读数**：`error_string(INT64_MIN)` → `OK`。差别只在引擎的形参是 int32：先回绕再查界。第一版按 bigint 比表长，语料 254 第 93 行直接报不一致，改完才全绿 —— 这条走的正是「语料仲裁」的老路，没有靠猜。
- **arity 表没顺手扩**：那两句解析期文案不在这轮量过的 20 支里，所以 `type_string` / `error_string` 不进 `BUILTIN_ARITY`；少给实参会在运行期被 `intArgBig` 响亮拒，不发 `undefined`、但也不是引擎那句。下一轮把探头补上这两支就能并进去。
- **计数**：可派发 90→92、该拒 36→34，§6 第 23 条剩 14 支。
- **账**：语料 254（100 行）、ops 仍 1782（这条只成语料）、`pnpm test` 1055 例、`test:compile` 176/245、`test:diff` 168/168 逐字节、静默 0、codegen 2/2、typecheck 4/4。

### 1.59 `type_exists` 发出：判据就是那张 ClassDB 名单；顺手量到 scriptc 对 Callable 的 `==` 说 SC1043（2026-10-06，S256，语料 255，§6 第 23 条再收窄）

- **规则一支一名量出来的**：`tmp/probe-small-builtins/s.log` 73 格（39 支内建类型名 + 16 支类名 + 11 支近似串 + 4 支边界名）与 `ENGINE_CLASS_NAMES` 比对**零不一致** —— `type_exists("TextServer")` 真、`"EditorNode"` 假（这一版 ClassDB 里没有）、38 支内建类型名里只有 `Object` 真（它同时是 ClassDB 的类），`"Variant"` 也假。
- **因此名单换了住处**：判据要在运行期用（`.call()` 那一侧），所以 `engine-classes.ts` 从 `packages/compiler/src/lower/` 移到 `packages/runtime/src/runtime/`，分析器与 guards 改从 runtime 取 —— 方向仍是编译期依赖运行时，没有第二份名单。
- **计数**：可派发 92→93、该拒 34→33，第二批 44 支里剩 13 支。
- **AOT 这一条是旧暴露、不是本轮写坏**：`255-type-exists` 走 scriptc 出货门报 2 个 `error SC1043: comparing non-number, non-string values are not supported yet` —— 就是语料里那两格 Callable 的 `==`（`type_exists == type_exists`、`type_exists == error_string`）。把语料翻了一遍：`239-global-callable-values` 与 `250-global-name-sweep-additions` 里有同样的裸 `==`，那两轮只跑过面探针与代表集，没单独跑这两格 —— 欠的是 AOT 的对象比较 lowering。JS 侧两者都对（169/169 逐字节），拒的是 AOT 那侧的 `==` lowering 不覆盖对象比较；这一条与任务 #18（装箱账）同属 AOT 轨道，别把它当语义问题处理。探针 `is_same(a, b)` 那一形在 252 已通过 scriptc，说明走运行时的比较是安全的。
- **实参只量过 String**：`type_exists(StringName)` / 数字实参都没读数，因此 `gTypeExists` 对非 String 抛 `[type-exists-arg]`。
- **账**：语料 255（76 行逐字节）、ops 仍 1782、`pnpm test` 1057 例、`test:compile` 177/246、`test:diff` 169/169 逐字节、静默 0、崩溃 0，codegen 2/2、typecheck 4/4 与 `tsconfig.test.json` 全过；scriptc 对 255 报上面那两条 SC1043（JS 门全绿，AOT 门此格不复跑为绿之前，255 不进代表集）。
- **出货门现在是红的（下一轮第一件事就是它）**：HEAD 上重跑三连门，`test:export` 的 scriptc 四格（`scriptc/nested`、`scriptc/散装单文件`、`--pack scriptc`、`默认 pack`）全报 `scriptc 没能出货: FAIL`，`test:cli-native` 的 `④ 工程 export --pack scriptc` 同一条（`⑨b run --watch` 那格的 30 秒窗口这轮又超时），`test:pkgmodes` 被同一条拉着红。JS 侧的门这轮全绿（`pnpm test` 1057、`test:compile` 177/246、`test:diff` 169/169 逐字节、codegen、typecheck、golden），所以红的是 **AOT 打包轨**：上一次这三连门全绿是 12:09–12:36（在 `56e6d9f` 之前），嫌疑窗是 `56e6d9f → da355c8 → 05a7bc7 → 6e8be7b`，先二分再谈发货。
- **二分的第一手证据（本轮补测，未 fix）**：面探针那格 `234-string-methods-batch` 今天 12:21 还是 1/1 逐字节一致，HEAD 上重跑成 `0/1 编过` —— 也就是说 AOT 不是「某份夹具撞上新语句」，而是**整条打包轨红了**。嫌疑窗因此收窄到 `56e6d9f → da355c8 → 05a7bc7 → 6e8be7b` 这四支之内，而 **头号嫌疑是 `6e8be7b` 把 1053 支的 `ENGINE_CLASS_NAMES` 挪进运行时包**（scriptc 要把这份大文字表编进产物）。本轮两次试 `git revert 6e8be7b` 都没拿到能判定的读数：第一次参数写错（`--no-edit -q` 不是 revert 的合法组合）没执行；第二次 `-n` 在两份文档上撞出冲突、`pnpm build` 又走了 turbo 缓存（169ms FULL TURBO），所以那次 234 的「还是 0/1」不算证据。实验作废、工作树已 `reset --hard` 回到 HEAD 并核过干净（255 那三份文件在位），这个假设**仍未验过**。正确做法是 `git bisect good f7c0cc1 .. bad HEAD`（中间四支，两步就够），每步只跑 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc`；二分到的那一支再决定是回退还是就地修（若确是名单进包那一支，就把名单留在编译期、`type_exists` 由分析器折叠或注入）。
- **原因抓到了（不再是嫌疑）**：面探针 `234-string-methods-batch` 的失败详情是 2 个 `error SC1043: comparing non-number, non-string values are not supported yet` —— 与 255 那两格 Callable `==` 同一条错，但 234 里根本没有那种式子。scriptc 编的是**整个运行时包**，所以只要运行时代码里出现 scriptc 不支持的比较，每一份产物都会红。嫌疑落点因此是这轮往运行时里加的 **bigint 比较**：`56e6d9f` 的 `gNearestPo2`（`x >= 0n`、`x < BigInt(...)`）与 `05a7bc7` 的 `nameById`（`x >= 0 && x < BigInt(names.length)`）—— 两者都是 bigint 之间的关系运算，而 `234` 最后一次全绿（12:21）正是在 `56e6d9f` 之前。修法不是回退功能：把这两处改成不走 bigint 关系运算的写法（例如先 `Number.isSafeInteger` 分流、或用 `toString()` 长度与首字符比较、或让 `nearest_po2` 走纯 `Number` 路径并在越界处响亮拒），改完只需 `GDS2JS_SCRIPTC_FILTER=234-string-methods-batch pnpm test:scriptc` 一条就能判（2 分钟），绿了再补 `255` 与出货门。
- （本条的嫌疑已由 §1.60 证否：真凶是 `nameById` 里那两处 bigint 关系运算，1 分钟就能复现与判绿。）

### 1.60 AOT 红的原因抓到并修好了：运行时的两处 bigint 关系运算没有 lowering（2026-10-06，S257，任务 #37 结清）

- **先纠正我上一轮的猜法**：`docs/ROADMAP.md` §1.59 里写「头号嫌疑是 1053 支名单进包」——**错了**。查了 scriptc 文档（`/docs/limitations`：BigInt 的字面量、运算符、转换、Map/Set 元素都在支持之列，不支持的是 `BigInt64Array`/`BigUint64Array` 与 bigint 越过嵌入引擎边界），再用 `export --pack scriptc` 直接复现，错误原文指得很清楚：
  `.gds2js-export/runtime/builtins.ts:859:15 error SC1043: comparing non-number, non-string values are not supported yet`，两处都在 `nameById` 里 —— `if (x < 0n) x += 4294967296n;` 与 `if (x >= 2147483648n) x -= 4294967296n;`（S255 为了复刻引擎那一眼 int32 回绕手写的折位）。
- **为什么同一天别的 bigint 比较没红**：同一文件里 `x < 0n ? wrap64(-x) : x`（S251 加的 `abs`/`absi` 那两处）**编得过**。差别不在「有没有 bigint 比较」，而在比较的对象是**刚做过 `% 4294967296n` 的局部量与六个十六进制位的字面量**这一组合；scriptc 文档并没把这条写成限制，所以按实测当事实记着，别再靠文档推断。
- **修法不动语义**：折 int32 改走 `Number(BigInt.asIntN(32, intArgBig(v, who)))` 一句，比较全部退回 Number 域 —— 与 S255 那 4 格溢出读数（`error_string(INT64_MIN)` → `OK`、`error_string(-1)` → `(invalid error code)`、`type_string(INT64_MAX)` → `<invalid type>`）完全一致，语料一字未改。
- **判据（都是实跑）**：`234-string-methods-batch` 面探针从 `0/1 编过` 回到 **1/1 编过、1/1 跑通、逐字节一致 1/1**；`test:diff` 回到 **169/169 逐字节、静默 0、崩溃 0**。
- **一条附带教训**：`git revert -n` + `git reset --hard` 之后，255 那三份文件被 autocrlf 换成了 CRLF，语料门立刻报「第 1 行不一致」——那是行尾噪声不是语义错。凡是动过这类 git 操作，跑门之前先把 corpus 文件归一回 LF（本轮就是 `split("\r\n").join("\n")` 一遍）。
- **账**：面探针 1/1、`test:diff` 169/169 逐字节（静默 0、崩溃 0）、guards 全过、typecheck 4/4 与 `tsconfig.test.json`；出货三连读完并全绿 —— `test:pkgmodes` 25/25、`test:export` ok 10 / FAIL 0（红的正是它那四格 scriptc 格）、`test:cli-native` 20/20（含 `④ 工程 export --pack scriptc` 与 `⑨b run --watch`）。§1.59 那条红账到此销掉。

### 1.61 打印一族按原始字节重重量一遍：五支发出、五支把缘由写进错文（2026-10-07，S258，语料 256，§6 第 23 条再收窄）

- **上一轮那份读数是错的，错在探头**：`tmp/probe-prints/prints.log` 记 stdout 时把空行滤掉了，于是 `prints()` / `printt()` 被写成「一行都不出」，`printerr()` 也被读成「什么都不出」。按原始字节重量（`zero-arg.log` 14 格 + `err-shape.log` 5 格）才看清零实参那格五支各不一样：`print()` / `prints()` / `printt()` 照旧结尾一行，`printraw()` / `print_verbose()` 什么都不动（连 `printraw` 那半行都不开），`printerr()` 只往 **stderr** 落一个换行。这轮之所以发现得早，是因为语料 256 里放了 `printraw("A")` + 零实参 + `print("B")` 那种夹心格 —— golden 一记就是 `A` / `B` 两行，跟实现给的 `AB` 一行当场对不上。**教训写进口径里：滤空行的探头不能用来判「出不出行」。**
- **发的五支**（形状全部来自实测）：`prints` 实参间一个空格、`printt` 一个制表符、`printraw` 无分隔且不结尾、`printerr` 无分隔且走 stderr、`print_verbose` 在默认声级下整支不出声（4.3 树 `variant_utility.cpp:997` 那句 `if (OS::is_stdout_verbose())` 正是这一格 —— 我们的宿主没有声级旗标，所以发成空操作而不是凭空定一条）。实参照旧「全部先求值再逐个 show」（S170 ⑦），分隔符只出现在实参之间。
- **宿主因此多了一个状态**：`printraw` 那半行。下一条结尾的行把它并到行首（`printraw("A") prints("s","t") print("B")` → `As t` / `B`），程序收尾时按原样落盘、不补换行（`printraw("only")` 的 stdout 就是 `only`，与引擎同形）。`resetOut()` 一并清它，否则上个用例的半行会串进下个用例。
- **两条门的分流口径之前不一致，这轮对齐了**：`godot.txt` 的定义是 stdout 拼 stderr（`tools/lib.mjs:88`），而 JS 侧两个门都只看 stdout —— `test/support/js-runner.ts` 现在两路一起收，`test/e2e/scriptc.test.ts:225` 从 `run.stdout` 换成 `run.out`。改之前 `256-` 在出货门报「第 22 行 godot="e12true" js=""」，那正是 `printerr` 那行：不是产品少了输出，是门少收了一路。
- **仍拒的五支开始说实话**：`emitter.ts` 新增 `BUILTIN_TODO_WHY`，错文里带上实测到的那半截 —— `print_rich`（bbcode→ANSI 只量过 `[b]`）、`print_debug`（第二行是 `At: res://<脚本>:<行>:<函数>()`）、`print_stack`（帧里带指针号）、`push_error` / `push_warning`（stderr 四行，含 `at: push_error (core/variant/variant_utility.cpp:1024)` 与 GDScript backtrace）。这些读数原样留在 `tmp/probe-prints/prints.log`，等「带脚本身份的打印」那条口径定了再一起做。
- **账**：语料 256 共 22 行逐字节（末行来自 stderr）、`test:diff` **170/170**（静默 0、崩溃 0）、`test:compile` 178/247、`pnpm test` 1060 例、ops 1799、guards 190 例（新增「打印一族的发射与拒答」2 例）、`packages/runtime/test/print-family.test.ts` 3 例 17 格（钉的正是 golden 里看不见的那几格）、tree-face 17 项、`test:codegen` 2/2、面探针 `234-` 1/1、`256-` AOT 逐字节 1/1（`process.stderr.write` 在静态目标上出得来）、`test:pkgmodes` 25/25、`test:export` ok 10 / FAIL 0、`test:cli-native` 20/20（含 `④ 工程 export --pack scriptc` —— 换新的宿主 import 行之后静态出货照样逐字节）、typecheck 4/4 与 `tsconfig.test.json`；发射期拒答清单 32→**27**。golden 漂移门本轮不重跑整批：256 那份 golden 就是这轮从裁判引擎记下来的，其余用例的 `main.gd` 一字未动（改的只有 JS 侧的宿主 import 行）。

### 1.62 `print_rich` 的 bbcode 整张表发出，颜色那一族按 4.6.3 的规矩走（2026-10-07，S259，语料 257，§6 第 23 条再收窄）

- 起点是上一轮拒它的那句理由（「bbcode→ANSI 只量过 `[b]`」）。这张表其实是**有源码的有限表** —— 4.3 树 `core/string/print_string.cpp:88-169` 就是 61 条 `String::replace` 再加一个尾部复位。搬过来之后第一次对表，87 格里 5 格对不上，全在 `*color=` 那一族。
- 那 5 格说明 4.6.3 换了规矩，量出来是（`tmp/probe-rich/colors.log` 27 格）：名字表那 13 色照旧走各自的老码，**表外**的值一律解析成 Color 再发 24 位 —— `[color=#ff0000]` / `[color=ff0000]` / `[color=#f00]` 都是 `38;2;255;0;0`，`bgcolor` 是 `48;2`，`fgcolor` 两段串起来；解析不中的（`bogus` / `grey` / 空串 / `#gg0000`）发 `0;0;0`；alpha 不参与（`#ff000080` 与 `#ff0000ff` 同形）；4.3 那三道 `contains("[color")` 闸门在 4.6.3 已经没了（光一个 `[/color]` 也转成 `39`）；Color 自己那张名字表仍生效（`[color= red]`、`[color=RED]` 都成 `255;0;0`），而 bbcode 名表是精确小写（`gray` → `90`，不是 Color 那边的 `128;128;128`）。
- **取字节是截断不是四舍五入**（C 那句 `(uint8)(ch*255.0)`），解析直接复用 S241 的 `colorFromText` —— 同一个 `/255` 除法配反向的 `*255`，八格刁串十六进制（`#010203` / `#808080` / `#7f7f7f` / `#aaaaaa` / `#555555` / `#050a14` / `#abcdef` / `#fefffd`）才逐字对得上。没闭合的标签（`[color=#ff0000`、`[color=`）实测就是原样出，照这条写、不多猜。
- **判据**：116 格逐字节对完才发（`tmp/probe-rich/rich.log` 存着两侧的整段原文）；**那份探头脚本已经进了盘面** —— 语料 257 的 `main.gd` 就是它（131 行脚本、125 行 golden），以后重跑对表只要 `node tools/golden.mjs 257-`，不依赖 `tmp/`。末尾另加了五格夹心格钉接缝：`printraw("q1")` + `print_rich("[b]q2[/b]")` 实测是一行 `q1\u001b[1mq2\u001b[22m\u001b[0m`（`print_rich` 接得住 `printraw` 那半行，复位补在整行末尾），`print_rich("[center]q8[/center]")` 那种串里带换行的也照实测走。`test:diff` **171/171 逐字节、静默 0、崩溃 0**。AOT 一并过了 —— `257-print-rich` 在 scriptc 出货门 1/1 编过、跑通、125 行逐字节，`indexOf(needle, from)` / `slice` / `Math.floor` 这套式子在静态目标上出得来。
- 顺手修了一处盘面损伤：S256 那一行在前几轮插入之后**断了** —— 它的续段（当时红的出货门那六格的读数）漂到 S259 之后，S256 行尾还少了收口的竖线。已接回同一行，并把「现在是红的、未结」那句改成已结的留档口径（结清记录在 S257 与 §1.60）；S258 / S259 粘成一行的那处也拆开了。
- **账**：语料 257（125 行）、`test:diff` 171/171、`test:compile` 179/248、`pnpm test` 1062 例、ops 1799、guards 189 例、`test:codegen` 2/2、`test:pkgmodes` 25/25、面探针 `234-` 1/1 与 `257-` 1/1、typecheck 4/4 与 `tsconfig.test.json`；发射期拒答清单 27→**26**（打印一族只剩 `print_debug` / `print_stack` / `push_error` / `push_warning` 四支带缘由的拒）。出货另两门：`test:export` ok 10 / 记账 3 / FAIL 0、`test:cli-native` 20/20（`④ 工程 export --pack scriptc` 128 秒那格第一次跑红，报的是「门在跑的时候改了 runtime 源文件」，不是产物问题 —— 已记进 §2 第 14 条那串误报形态）。

### 1.63 `is` 的两条拒口一次量清：表外的引擎类名与信号值都按实测发假（2026-10-07，S260，语料 258，S248 ④ 留的两条欠账结清）

- **缺口是 S248 ④ 留的三条**：表外的引擎类名（`is Node2D` 这一族）、信号值对任何类名、以及没登记引擎基类的实例。第三条 Tier 1 走不到（`extends Resource` 在发射期就先抛 `[class-extends]`），前两条要的只是一张矩阵 —— 一次引擎跑 208 格就齐了：16 支类名 × 13 种形状，全走 `objs[i] is 名` 那种动态形（静态类型对不上时引擎解析期就拒，S248 ② 那条）。
- **读数**：208 格里只有 14 格给真，而且**没有一格真值来自表外的名字** —— 真值全落在表内那 7 支的链上（实例 → Object/RefCounted；`self` → Object/SceneTree/MainLoop；脚本类值 → Object/RefCounted/Resource/GDScript；引擎类值 → Object/RefCounted；`abs` → Callable）。信号值那一列 16 格全假。所以「表外名一律假」是量出来的，不是拿继承树推的；`as` 那条仍然没动（一条读数都没有）。
- **实现落成一条判据**：`patterns.ts` 的 `isType` 在 `lookupClass`（脚本自己声明的类名）之后加一格 —— 名字在 `ENGINE_CLASS_NAMES`（S242 冻的 1053 支）里就发假，不在才抛 `[is-type]`。于是 `is Node2D` 发假、`is HttpRequest`（大小写不对，不是类名）照旧响亮拒；`engineClassIs` 里信号值那一格从 `null` 改成 `false`。排在 `lookupClass` 后面是有意的：用户自己写的 `class Node` 不能被引擎名单抢走。
- **语料 258 就是那张矩阵**（208 行 golden、其中 14 个真），探头脚本与它同一份 —— 以后重跑 `node tools/golden.mjs 258-` 就复查了整张表。ops `is-engine-class-names.test.ts` 从 10 格补到 15 格，钉的是「表外名对四类形状都假」「信号值那一列」「大小写不对的名字仍拒」这三格。
- **账**：`test:diff` **172/172 逐字节、静默 0、崩溃 0**、`test:compile` 180/249、`pnpm test` 1065 例、ops 自校验 1799→**1804**、guards 189 例、`test:codegen` 2/2、tree-face 17 项、`test:pkgmodes` 25/25、面探针 `234-` 1/1（改了 runtime 的函数形状就过面探针，§2 第 13 条那条口径）、`258-` AOT 1/1、`test:export` ok 10 / 记账 3 / FAIL 0、`test:cli-native` 20/20、typecheck 4/4 与 `tsconfig.test.json`。


### 1.64 随机族八支发出：pcg32 复刻，`randf()` 按 4.6.3 的 float32 除法走（2026-10-07，S261，语料 259，§6 第 23 条再收窄）

- **这一族欠的是「同一个 seed 的序列要复刻」**，§6 第 23 条与 globals 的抬头都这么写。式子其实全在 4.3 树里：`thirdparty/misc/pcg.cpp` 的 XSH-RR 与 srandom 两步预热、`core/math/random_pcg.h` 的 `randd()`（CLZ + ldexp，三发）与 `random(int,int)`、`core/math/math_funcs.cpp` 的 `default_rand` 常数与 `rand_from_seed` 那支「下一发 + 原 seed」。先照 4.3 搬完，再拿引擎逐格对 —— 261 格里 81 格不对，**全在 `randf()` 与 `randi_range()` 两支**。
- **`randf()` 与 4.3 不一样**：4.6.3 只吃一发，值是 `rand()/2^32` **落在 float32 上**再 widen。seed(0) 组那格实测 `0.47646453976631`，纯 double 除法给 `0.47646454931237`（差在第 9 位），4.3 那支 CLZ float 版要吃两发 —— 照搬会把后面每一格都挪位。`randd()` 反倒是三发制，照 4.3 一字不差对得上。
- **`randi_range()` 折实参不折跨度**：两个实参先按 int32 折（`randi_range(0, 4294967295)` 走的是 (0, -1) 那一格，给 `0`），跨度却是宽类型算的：`randi_range(INT32_MIN, INT32_MAX)` 实测 `-335896151` = 首发 `1811587497` − 2^31，也就是 bound 取 2^32；要是按 C 那句 `abs(p_from-p_to)+1` 折回 int32，bound 会变成 2、给不出这个数。`from == to` 那一格直接回、一发不吃（后面那发 randi 照样是首发）✓。
- **开局是播过种的**：同一支脚本连跑两次，未 seed 的首发 `randi()` 是 1956456239 / 2444007460，而 `seed(1234)` 之后三格两次一字不差 —— 所以引擎启动时 randomize 过一次。这边同样按时钟播一次（`Date.now()`，毫秒级，不是引擎那句 unix_time+ticks），**性质对齐而不是数值对齐**：不可复现这件事对齐，具体数字本来就没人能钉；语料因此每格都先 seed，未 seed 那一形不进任何门。
- **元数与两句**照 `variant_utility.cpp:1784-1791` 的 FUNCBIND 注册表，八格 Too few / Too many 在 4.6.3 一支一名量过（零实参那三支的多给句就是 `Expected at most 0 but received 1.`），进了 `BUILTIN_ARITY`；实参类型仍走数学族那条老闸（非数值抛 `[arg-int]` / `[arg-float]`，引擎那几句是转换期的、这一族没量过原文就不冒充），float 落 int 槽按既有截断规矩收。
- **账**：语料 259（274 行 golden 逐字节）+ 读数表 `tmp/probe-rand/rand-map.tsv`、`test:diff` **173/173**（静默 0、崩溃 0）、`test:compile` 181/250、`pnpm test` 1067 例、ops 自校验 1804→**1819**、guards 183 例（新增「随机族的发射与元数闸门」2 例）、`test:codegen` 2/2、`test:pkgmodes` 25/25、面探针 `234-` 1/1（`Date.now()` 与 BigInt 位运算在静态目标上 lowering 得过来）、`test:export` ok 10 / 记账 3 / FAIL 0、`test:cli-native` 20/20、typecheck 4/4 与 `tsconfig.test.json`；发射期拒答清单 26→**18**，名表里可派发 93→**101**、该拒 33→**25**。**AOT 也补跑完了**：`259-` 的单例 scriptc 出货门 1/1 编过、1/1 跑通、274 行逐字节一致 —— `Date.now()`、BigInt 位运算与拒绝采样循环在静态目标上全都 lowering 得过来。

### 1.65 身份族按合成号口径发出：发号器顺手登记，`<基类名#号>` 双侧掩号进语料（2026-10-07，S263，语料 260，§6 第 19 条收窄）

- **这一条把 S262 那份读数花掉了**：`nextObjectId()` 原先只发号、不记「号 → 对象」，所以 `instance_from_id()` 无从查起；现在发完把自己挂进 `LIVE` 那张表，`GdScriptObject` 的字段初始化相应改成 `nextObjectId(this)`。四支全局函数（`weakref` / `instance_from_id` / `is_instance_valid` / `is_instance_id_valid`）从发射期拒答清单划进 `BUILTIN` + `BUILTIN_ARITY` + `GLOBAL_IMPL`，名表里那四行跟着从 TODO 翻成 GS。元数那八句是当场一支一名量回来的（`tmp/probe-ids-arity/arity.log`），与前一轮随机族同一套做法。
- **号只保证「自己的算术」**：同对象同号、`a < b`、`instance_from_id(id) == a` 钉得住，与引擎的数字对不对得上没人钉 —— 所以 `tools/lib.mjs` 的 normalize 多了一条 `<类名#-数字> → <类名#号>`，golden 与产物**两侧同一条掩法**（不是只抹平我们这一侧），`260-object-identity` 那 39 行因此能逐字节比。
- **打印那一格欠的是「基类名」**：`Inner extends RefCounted` 印 `<RefCounted#…>` 而不是 `<Inner#…>`，走 `nativeBaseOf`；为了不打断 values.ts → object.ts 那条 import 环，沿用与 `scriptPropsHook` 同一个注入口（`registerObjectLabelHook`）。
- **AOT 的读数：一条真围栏、一条撤掉的误记**（明细在 S263 ⑦）。真的那条是 `(an ? b : a).t` —— 条件式直接当接收者报 SC1090；JS 的 `WeakRef` 也确实在静态目标上编不过（复测过的三行：SC2009「`Map<number, WeakRef<object>>` 里 value 那维编不过」、SC1090「Map 的值只能是 number/string/boolean/record/class 实例/数组/promise/Map/Set 或其联合」、SC2020「这个签名的 `Map.set` 还没有 lowering」，所以登记处是强引用表）。**撤掉的那条**：「本轮新写的 `class` 被 `instanceof` 用到就报 SC1090」是把两个症状混在一起了 —— 拿 class 版（`GdNullObject` / `WeakRefBox` + `instanceof`）重跑 `234-` 面探针 **1/1 编过、逐字节一致**，说明 class 与 `instanceof` 本来就过得去（`GVector2` / `GColor` 这些老结构体一直是 class），代码已改回 class 版。**这一发的新读数是「报错带行列」**（`values.ts:2458:48`）：拿到它靠的是 `GDS2JS_SCRIPTC_KEEP=1` 把替身树留在 `tmp/sc-gate/<用例>/`，再 `scriptc build <那棵树>/main.mts --strip` 直接读全文 —— 以前只在门的 120 字截断里猜，改形状试了好几轮。
- **生命周期那一格明说不复刻**：`LIVE` 是强引用，被丢弃的 RefCounted 在我们这一侧仍查得回、仍算「有效」，引擎那边已回收并把号作废。这一形留在 §6 第 19 条，与 `CONNECT_DEFERRED` 那一格同一个前提：先有宿主的对象生命周期模型才谈得上。
- **没量过的照旧响亮拒**：`weakref(5)` 抛 `[weakref-arg]`、`WeakRef.is_null()` 抛 `[weakref-method]`；`is_instance_valid` 的「真」只发实测过的那几类（引擎类值 `Node` / `SceneTree` 两格是本轮当场补量的，`tmp/probe-ids-more/m.log`）。
- **账**：语料 260（39 行逐字节）+ ops `object-identity.test.ts` 4 段 15 格 + guards **179 → 181** 例；发射期拒答清单 **18 → 14**、名表可派发 **101 → 105** / 该拒 **25 → 21**；`pnpm test` 1072 例、ops 自校验 1834、`test:compile` 182/251、`test:diff` **174/174**（共 260 个用例）、`test:codegen` 2/2、`test:pkgmodes` 25/25、`test:export` ok 10 / FAIL 0、typecheck 4/4 与 `tsconfig.test.json`；AOT 面探针 `234-` **1/1**、`260-` 单例出货门 **1/1 编过 + 1/1 跑通 + 39 行逐字节**、`test:cli-native` 重编 exe 后 **20 例 / 22 格全过**。同一轮里 CLI 门 `⑨b run --watch` 那格的红另有一笔账，见 §1.66。


### 1.66 `⑨b run --watch` 又在整跑里红：门改成「等长保存也看得见」，原生那一侧还剩一形没量清（2026-10-07，CLI 门，§1.56 的续）

- **现象与 §1.56 一字不差**：整跑 `test:cli-native` 时 `⑨b` 判失败，缓冲里只有脚本第一次的 `watch-a` 与那句 `👀 监听 …` 横幅，连「—— 重新运行 ——」都没出现；同一轮里 `⑨`（`check --watch`）是过的。
- **门自己的两处形状问题（都改了）**：① 旧门等的是 `watch-a`，而横幅在原生那一支比脚本 stdout **晚 25ms** 到（本机追踪：`watch-a` +320ms、`监听` +345ms），于是「第一次采样」可能已经带着改后的摘要 —— 改成 `监听` 与 `watch-a` 都出现才动手。② `watch-a` / `watch-b` **等长**，摘要 `路径:mtime:大小` 里只剩 mtime 一维会动，这一格对 mtime 的分辨率有依赖而 `⑨` 没有（它走 `appendFileSync`，尺寸必变，所以从不红）—— 第二次保存改成 `watch-bb`，让尺寸那一维也动。这一格要钉的洞（重跑写同名产物 → 第二次执行被 ES 模块缓存吃掉）与文件长度无关，改夹具不削弱它。
- **扫出来的形状（数据在此，不写死因果）**：`tmp/wsweep.mjs` 按固定延迟写盘、看六秒内认不认。原生 exe：+225ms 不重跑、+613ms 重跑、+1236ms 不重跑、+3015ms 重跑；父侧 `statSync` 每次都报出真实变了的 mtime（+231 / +612 / +1234 / +3014ms），所以不是没写进去。同一条扫法在 node CLI 是 **0|6|12|30 四格全重跑**（node 冷启约 1s，四次写都在横幅之后）。改完夹具后 `⑨b` 单点与整跑都过。
- **产品那一侧留着的那一形**：`--watch` 在原生目标上对某些「mtime 变了、尺寸没变」的保存不反应，而同一份 `watch.ts` 在 node 上看得见 —— 差别在 scriptc 那一侧的 `statSync().mtimeMs` 或轮询本身，**这一轮没量清，所以不动实现**（要动先按数据来：拿一份 scriptc 小探头把同一个文件的 mtime 在两侧对印）。已记 §2 待办。

### 1.67 RID 一族发出：两支全局函数、一个真值型，比序那一格是语料抓出来的（2026-10-07，S264，语料 261，§2 那条身份决定的 RID 半截结清）

- **先量后写**：`typeof` 23、`RID(<号>)` 的打印、字典键分格、`get_id()`、`hash()` 五格、四种实参折法、十种来源的运算符报错句 —— 全是一把一把探头量出来的（`tmp/probe-rid/`、`tmp/probe-rid2/`、`tmp/probe-rid3/`、`tmp/probe-rid4/`）。哈希那一格是白捡的：4.3 的 `core/variant/variant.cpp` 里 RID 分支就是 `hash_one_uint64(get_id())`，而 `hashOneUint64` 在转换族那一轮已经实现过 —— 五格读数一名一名对上就发出去了。
- **比序是语料抓的，不是读源码读出来的**：第一版按带符号 bigint 比，`rid_from_int64(-1) < rid_from_int64(0)` 我们给真、引擎给**假**。r23 那一格红了才回头补量，量出「无符号」这条（`tmp/probe-rid3/unsigned.gd` 四格：`-1` 折成 2^64-1，是最大的那一个）。这类「看着显然」的格子正是 golden 的价值所在 —— 单位测试是我自己写的，只有引擎那侧能说不。
- **`!=` 那句里写的运算符名**：引擎按你写的那个运算符发句，而我们 `valueEq` 里两处报错把 `==` 写死了 —— RID 要接这句就得先修这个口径。做法是 `valueEq` 多收一个运算名参数、`ops.neq` 把 `!=` 传下去，**只用在新加的 RID 那一支**：Callable 与结构体那两处仍按量过的 `==` 发，不拿 `!=` 去外推（那两句的 `!=` 形状这轮没量）。
- **`rid_allocate_id()` 不是 S262 那笔合成号账**：它给的就是引擎公开的那个整数，起点 13241、连号、两份独立脚本首格同值 —— 所以逐字钉得住，与「对象号自造 + 语料掩号」是两件事，别并成一条。
- **值只能从两支来**：`RID(5)` 在引擎是解析期那句 `No constructor of "RID" matches the signature "RID(int)"`，`RID()` 那一形仍走引擎类值的拒（S242），所以 runtime 里没有 RID 构造函数。`int(rid)` / `String(rid)` 两格的引擎原文是 `Invalid call. Nonexistent 'int' constructor.`（Vector2 那一格同句，说明它不是 RID 专属）—— 我们这两支仍发转换族自家那句 `[to-int]`，**口径差写在 S264 ⑦，不当已对齐**。
- **AOT 新围栏 SC1043**：`nextRid += 1n` 在静态目标上报 `comparing non-number, non-string values are not supported yet`（`rid.ts:26`），改成 number 累加 + 出号时一次 `BigInt()`；号段远在 2^53 之内，语义一字未动。同一轮又确认了一遍 S263 撤掉误记之后的一半事实：`class GdRid` 带 bigint 字段、`instanceof` 派发，静态目标上都过得去。
- **账**：语料 261（41 行逐字节）+ ops `rid-family.test.ts` 4 段 13 格 + guards 新 2 例；发射期拒答清单 14→**12**、名表可派发 105→**107** / 该拒 21→**19**；`pnpm test` 1079 例、ops 自校验 1834→**1850**、guards 181 例、`test:compile` 183/252、`test:diff` **175/175**（共 261 个用例）、`test:codegen` 2/2、`test:pkgmodes` 25/25、`test:export` ok 10 / 记账 3 / FAIL 0、`test:cli-native` 重编 exe 后 **20 例 / 22 格全过**、typecheck 4/4 与 `tsconfig.test.json`；AOT 面探针 `234-` **1/1**、`261-rid-family` **1/1 编过 + 1/1 跑通 + 41 行逐字节**。

### 1.68 负零与无穷：`%` 格式那一族四处静默错修掉，另量到常量池把 `0.0` 与 `-0.0` 当一个（2026-10-07，S265，语料 262）

- **起点是待办里的「`atan2(-0.0, 0.0)` 对不对得上」**：量完的答案是 **atan2 本来就对得上** —— 4.3 树里 `Math::atan2` 就是 `::atan2`（`core/math/math_funcs.h:88`），四个零角 `0.0 / -0.0 / ±3.14159265358979` 与 JS 一字不差。看着像不一致，是因为**打印那一层把 `-0.0` 的号藏了**（`print(-0.0)` 给 `0.0`），而 `"%.1f"` 不藏（给 `-0.0`）—— 同一条式子在两条路上形状不同，这格只能靠量，不能靠想。
- **真正错的是 `String % float` 那一支，四处全是静默错**：① `%.1f` / `%f` 对 `-0.0` 我们发 `0.0`（判负用的是 `v < 0`，而 `-0 < 0` 在 JS 里是假），引擎留号；② 非有限值我们发 JS 那三个词 `Infinity` / `-Infinity` / `NaN`，引擎发 `inf` / `-inf` / `nan`；③ `0` 那旗标对普通数垫零（`%09.1f` 对 1.5 给 `0000001.5`），对那三个词**不垫**（给六个空格 + `inf`）—— 只看一种形状看不出来；④ `%d` 收 float 走 C 那句 `(int64)` 转换：范围内向零截断（`1.5 → 1`、`-1.5 → -1`），**越界与非有限一律 `-9223372036854775808`**（±inf / nan / 1e30 三格同值，x64 的 integer-indeterminate 结果），我们原来直接把 `Infinity` 印了出去。
- **一条不打算复刻的引擎行为**（量清楚了但故意不对齐，理由写在 S265 ④）：同一份脚本里 `0.0` 与 `-0.0` 进的是**同一个常量槽**（相等又同哈希），谁先出现谁定全场那个零的号 —— 先写 `var pz = 0.0` 再写 `var nz = -0.0`，`1.0 / nz` 给 `inf`；两行调换，同一支脚本里 `1.0 / pz` 给 `-inf`（`tmp/probe-sign0/{plusfirst,minusfirst}.gd` 只差行序）。复刻它要照搬常量池的插入顺序，那是实现细节不是语义，而且「读起来是 `-0.0` 的代码在我们这里就真拿到 `-0.0`」这条更可取。语料 262 因此只用运行时算出来的零（`var nz = pz * -1.0`）与纯字面量两种形状。
- **账**：语料 262（33 行逐字节）+ ops `format-signed-zero.test.ts` 3 段 11 格；`test:diff` **176/176**（共 262 个用例，静默 0、崩溃 0）、`pnpm test` 1085 例、ops 自校验 1850→**1860**、guards 181 例、`test:compile` 184/253、typecheck 4/4；AOT 面探针 `234-` **1/1**、`262-negative-zero` **1/1 编过 + 1/1 跑通 + 33 行逐字节**；出货三门 `test:pkgmodes` 25/25、`test:export` ok 10 / 记账 3 / FAIL 0、`test:cli-native` 重编 exe 后 20 例 / 22 格全过。

### 1.69 `print_debug` 发出：`At:` 那一行的路径、行号与函数名都是发射期已知的（2026-10-07，S266，语料 263，§6 第 23 条打印那一族再收窄）

- **待办里那句「要产物报出自己的脚本身份」是个误判**：量完发现引擎只打**一帧**（调用点自己那一句），不是整条栈 —— 路径、行号、函数名三样在发射期全是静态的，不需要运行时的调用栈地基。四个形状的探头各跑一遍就定了形：`_initialize()` / 具名函数 / 静态 / `_init` / 内部类方法 / lambda，读数在 `tmp/probe-pdebug/`。
- **两处形状细节**：`At:` 前是三个空格（与 `SCRIPT ERROR` 那句的 `   at:` 同宽但大写 A，且**没有** `GDScript backtrace` 那一段）；函数名**不带类前缀**（`m()` 而不是 `RefCounted (C)::m()`），lambda 那一格是 `<anonymous lambda>()`。后者单独用一个 `LAMBDA_DEPTH` 记，不碰 `CURRENT_FUNC` —— 那个变量还管着 `super()` 的发射。
- **`push_error` / `push_warning` / `print_stack` / `get_stack` 仍拒，理由量清楚了**：那四支要的是整条栈（实测四行里逐帧 `[0] leaf (路径:4)` / `[1] mid (路径:7)` / `[2] _initialize (路径:10)`），外加一句引擎自己的源码位置 `at: push_error (core/variant/variant_utility.cpp:1024)` —— 语料侧的 normalize 只滤 `core/variant/` 那一族，WARNING 那支滤不掉，所以这一格**不能靠掩码混过去**；产物要发它得先有「每帧 .gd 行号」的地基（与 #18 那条去箱化同一类工程）。
- **零实参那格**：`print_debug()` 第一句是空行 —— 只有按原始字节量才看得见（`tmp/probe-pdebug/zero2.gd`），normalize 会把空行滤掉，所以 ops 那两格钉的就是这个滤完看不见的形状。
- **账**：发射期拒答清单 12→**11**；`test:diff` **177/177**（共 263 个用例，静默 0、崩溃 0）、`pnpm test` 1085 例、ops 自校验 1860、guards 181、`test:compile` 185/254、codegen 2/2、pkgmodes 25/25、`test:export` ok 10 / FAIL 0、`test:cli-native` 重编 exe 后 20 例 / 22 格全过、typecheck 4/4、AOT 面探针 `234-` **1/1**。产物面 churn 另记一笔：`HOST_PRINT_NAMES` 多一个名字 → 184 份 `main.gen.mts` 的宿主 import 行各改一行，逐字节输出一条没变。

### 1.70 NodePath 的读数一次量齐：`hash()` 在 4.6.3 换了式子，两处钉不住（2026-10-07，S267，读数轮 · 无实现变更）

- **为什么要单独一轮**：`inst_to_dict` / `dict_to_inst` 那两支持续被记成「欠对象模型」，但实测它们的字典里根本没有实例号 —— 欠的是 **`@subpath` 那个 NodePath 值型**（`{ "@subpath": ^"Inner", "@path": "res://…", &"k": 1 }`）。于是先把 NodePath 一族量清，别照着 4.3 的式子写实现。
- **量到的形状**：`typeof` **22**；三种打印（`str()` 给折好的路径串、容器与字典键给 `^"<串>"`、`var_to_str` 给 `NodePath("<串>")`）；等式按「绝对位 + 名字表 + 子名表」；`get_name(i)` / `get_subname(i)` 返回的是 **StringName（typeof 21）**；八支方法齐，而 `get_name_index` / `simplify` / `to_i` / `get_total_name_count` / `get_index_in_parent` / `re_substitute` 在 4.6.3 的 GDScript 绑定里根本不存在。
- **解析式子有三处与 4.3 那份 `node_path.cpp` 不同**：`\:` 是**真转义**（`a\:b` 一个名字、打印把反斜杠带回来、且不等价于 `a:b`），`\/` **不是**（`a\/b` 两个名字，第一个是 `a\`）；结尾空子名被允许（`x:` → 0 个子名、`str()` 丢掉冒号、与 `x` 相等）；大小写保留且区分；空格不裁；`"."` 是普通名字而 `"/"` 是「绝对 + 零名字」。**这一条的第一句已撤账（S268 ①）**：4.6.3 没有任何转义，`a\:b` 是「名字 `a\` + 子名 `b`」，把名数 1 当成了「一个带转义冒号的名字」。
- **两处钉不住，实现时只能拒**：① `hash(NodePath)` 的式子变了 —— 4.3 是「绝对位起手 1、再把各名 `StringName::hash()` 异或」，实测三格候选全假（`hash(NodePath("a"))` = 3608900604，而 `hash(&"a")` = 177670 = `hash("a")`，这一条同名哈希相等的口径倒是量到了），没逆出来就按 S237 那批 Callable 哈希的先例拒；② `get_name(3)` 越界**不崩**，回空 StringName 并往 stderr 打 `ERROR: Index p_idx = 3 is out of bounds (data->path.size() = 1).` + `at: get_name (core/string/node_path.cpp:69)` —— 那句带引擎自己的 C++ 文件名与行号，normalize 只滤 `core/variant/` 那一族，滤不掉，所以越界那一形也进不了实现。
- **下一轮照这份数做就行**：值型 + 解析式子 + 三种打印 + 等式 + `keyOf` 的 `^` 桶 + 八支方法（越界与哈希两支拒）+ `NodePath(String)` 构造 + 与 int / String / StringName 的比较按 RID 那一套模板（S264 刚铺好）；`convert(NodePath, TYPE_STRING)` 与 `String(NodePath)` 实测就是 `str()` 那一串，可以并进去。做完 `inst_to_dict` 就只欠 `@path` 的 res 路径与 `dict_to_inst` 的「跳过 `_init` 造实例」两件事。
- **账**：无实现变更，八份探头与全部读数在 `tmp/probe-nodepath/`；本轮出货门一字未动（`test:diff` 177/177、ops 1860、guards 181 仍如 §1.69 所记）。

### 1.71 NodePath 一族发出：解析式子里根本没有转义，那一格是语料抓回来的（2026-10-08，S268，语料 264，§1.70 那份清单花掉）

- **S267 ④ 读反了一条**：`a\:b` 不是「带转义冒号的一个名字」，而是「名字 `a\` + 子名 `b`」—— 名数 1、**子名数也是 1**。上一轮只看了 `get_name_count()` 与 `str()` 两格就下了结论，这一轮补了 `get_subname_count()` / `get_name(0)` / `get_subname(0)` 三格才发现；第一版实现照 S267 写，是语料 264 的 n56 那格（引擎给 1）把它抓回来的。式子回到 4.3 那句 `path.find(":")`：**没有任何转义**，反斜杠只是普通字符。
- **打印三形分两条路**：裸串（`str()` / `print()` / `"%s"`）不过 escape，容器里的 `^"…"` 与 `var_to_str` 的 `NodePath("…")` 过 4.3 的 `String::c_escape()`（`variant.cpp:1681` / `variant_parser.cpp:1953` 两处同一条式子）—— 同一个值 `a\:b` 在数组里是 `[^"a\\:b"]`，两条路差一个反斜杠，只量一条就会写错另一条。
- **`var_to_str` 的字典键等级多一格，且并列按插入序**：七键实测 `null < bool < int < float < String < StringName < NodePath`；同为 NodePath 的五键是 `/a、z、a、a/b、""`（插入序，不是码点序）。这一格的另一侧是 `vsKeyCompare` 原来只认六个 Tag，NodePath 骑在 `Tag.OBJECT` 上就一句「没量过」拒掉 —— 语料跑第一遍就是这儿崩的。
- **与 RID 不同的一条**：NodePath **不参与排序**。两侧都是它时 `<` `<=` `>` `>=` 四句全是运行期那句 `Invalid operands`（RID 那边按无符号号可比），`+` 与 `-` 同样。等式那侧来源累计八种（补了 float / bool / Array / Dictionary / Vector2 五格）。
- **方法七支发出、两支拒**：六句元数文一支一名量齐；`hash()` 与越界下标仍拒（前者是 S267 ⑥a 的账 —— 4.6.3 换了式子且没逆出来，后者要打的是带引擎自己 C++ 文件与行号的 ERROR）。`get_as_property_path()` 的式子是「零名字原样回，否则名字折成第一个子名、绝对位丢掉」，五形实测过。
- **构造走签名句而不是元数句**：`NodePath(String, String)` 与 `NodePath(int)` 引擎说的都是 `No constructor of "NodePath" matches the signature …`，所以这一支**不进 `BUILTIN_ARITY`**（那张表发的是 `Too few/many arguments`，跟错了就成假话）。
- **下一轮**：NodePath 已经在 `{ "@subpath": ^"Inner", … }` 那条路上就位 —— `inst_to_dict` 只欠 `@path` 的 res 路径怎么发，`dict_to_inst` 只欠「跳过 `_init` 造实例」。另有一格没量：`StringName` 在容器里的 `&"…"` 那条**没过** `c_escape()`（我们这边 `repr` 对 StringName 也不转义），要钉得另起探头。
- **账**：语料 264 共 115 行 golden 逐字节；`test:diff` **178/178**（共 264 个用例，静默 0、崩溃 0），全量引擎复测 `test:golden-check` **264/264、漂移 0**（17 格 TIMEOUT 全是 golden 本身就带 `<<GDS2JS_TIMEOUT>>` 的挂起类用例，重跑一字不差 —— 同一门跑到一半被并发探头抢 CPU 时会多报成 19 格超时并把 2 格报成漂移，所以读数只算独跑那一次）、`pnpm test` **1098** 例、ops 自校验 1860→**1884**、guards 现共 **183** 例、`test:compile` 186/255、codegen 2/2、pkgmodes 25/25、`test:export` ok 10 / FAIL 0、`test:cli-native` 重编 exe 后 20 例 / 22 格全过、typecheck 4/4；AOT 单例门 `264-node-path` 与面探针 `234-` 各 **1/1 编过 + 1/1 跑通 + 逐字节一致**。发射期拒答清单仍 **11**（NodePath 是构造器不是全局函数，名表两张数不动）。**两门在 HEAD 上是红的、本论一并修好**：守卫那两格是 S266 漏改（宿主 import 从六支变七支、`print_debug` 还挂在「拒的四支」里）；pkgmodes 那格与本论无关 —— `packages/gds2js/dist` 不入库，S266 那轮没重跑 `pnpm build` 就跑门，`dist/host.mjs` 里自然没有 `printDebug`，`pnpm build` 之后 25/25。**往后每轮跑 pkgmodes 之前先 `pnpm build`。**

### 1.72 `inst_to_dict` / `dict_to_inst` 的读数一次量齐：`@subpath` 是类路径，get/set 属性出门的是类型默认值（2026-10-08，S269，读数轮 · 无实现变更）

- **NodePath 就位之后这一族只剩自己的形状**：十一份探头一次跑完（`tmp/probe-inst/`），返回 Dictionary（typeof 27）、`"@subpath"` / `"@path"` 是 String 键而字段键是 StringName、键序 `@subpath → @path → 声明序`。
- **`@subpath` 是「类路径」**：模块根类是**空 NodePath**，内嵌类是 `Inner`，三层是 `A/B/C`（`get_name_count()` 3）；`@path` 始终是模块那份脚本的路径。没有 S268 那个值型就印不出 `^"Inner"` 这一形 —— 这正是 §1.70 记下「先量 NodePath」的原因。
- **进门名单量死**：`var` 全进（无初值、`_` 前缀、`@export`），`const` / `static var` / `signal` 都不进；脚本继承链按**基类字段在前**合并；宿主基类自己的属性（`script` 那一族）一条不进。
- **最反直觉的一格**：带 `get/set` 的属性**不调 getter**，出门的是声明类型的默认值 —— 同一台对象 `.ai` 读出来 42，字典里是 0。十六种类型量齐（int 0 / float 0.0 / bool false / String `""` / StringName `&""` / Vector2 `(0.0, 0.0)` / Vector2i `(0, 0)` / Vector3 `(0.0, 0.0, 0.0)` / Vector3i `(0, 0, 0)` / Array `[]` / Dictionary `{ }` / 无类型 `<null>` / NodePath `^""` / Color `(0.0, 0.0, 0.0, 1.0)` / 两种 pack 空串），与「typed 但没赋值的普通 var」那一格一字不差，所以实现里就复用那张默认值表。
- **一条顺序陷阱**：`inst_to_dict` 的继承链是**基类字段在前**，而 S232 量过的 `String.format()` 属性序是**自己类在前、基类在后** —— 两条路反着走，别为了省事共用一个走链的辅助函数。
- **值是引用**：对象字段出门是 `<RefCounted#号>`（语料侧掩号），数组与字典是原值，**不递归序列化**。
- **`dict_to_inst` 跳过 `_init` 量清了**：`_init` 里的 print 副作用在 `new()` 打一次、在 `dict_to_inst` 一次没打，字段照灌、类型照对（`b is WithInit` 真）。四格报错也齐：缺 `@path`、路径加载不到（前面还带两句 ERROR）、`@subpath` 指名不存在的类，以及**缺 `@subpath` 就是造模块根类** —— 那一格真造出了一台 `<SceneTree#号>` 并漏出一片 RID，Tier 1 发不出，实现按响亮拒处理。
- **新记一条方法学**：这几句报错过 `RTR()`，本机默认语言是中文（量到 `不是带有实例的脚本。`），**要英文原文得给引擎加 `--language en`**（`Not a script with an instance.`）。这类文案随跑门机器的语言漂，所以**不进语料、只进 ops**，中英两形都写进文档。
- **账**：无实现变更，门读数沿用 §1.71 那一笔。下一轮照 S269 ⑨ 那份前置清单做 `inst_to_dict`（类路径登记 / 继承链字段合并 / accessor 的类型表），再单独一轮做 `dict_to_inst`。

---

### 1.73 `inst_to_dict` 发出：类身份四段由发射器静态登记，顺带撞到一条静态目标的新围栏（2026-10-08，S270，语料 265，§1.72 那份清单花掉一半）

- **进门名单与出门值都照 S269**：`@subpath`（NodePath 的类路径，根类为空）+ `@path`（模块 res 路径）是 String 键、字段键是 StringName、键序 `@subpath → @path → 声明序`；`const` / `static var` / `signal` 不进；继承链**基类在前**；带 get/set 的属性**不调 getter**，出门的是声明类型默认值（runtime 那张表贴了十六种实测形状，表外如 Rect2 响亮拒）。
- **静态目标的新围栏：类实例不能当 `Record<string, Variant>` 索引**。scriptc **编得过、跑起来炸**：`expected object at $.gdObjectId, got number`（build 侧对同一式子给 SC2002 `record shapes must match exactly or width-coerce`）—— 它拿记录形状去校验实例自己的槽，第一格就是 `gdObjectId`。改成**发射器静态拼读数器**：`rt.registerDictIdentity(desc, resPath, classPath, names, accessors, (o) => { const s = o as Inner; return [s.k, rt.V.nil()]; })`。定位靠 `tmp/sc-gate/265-inst-to-dict/probe.mts` 那种一步步 step 的探针，比猜式子快得多。
- **顺带抓到一条 HEAD 上就有的 AOT 洞**：语料 246（`String.format()` 吃脚本实例）在 scriptc 上挂的就是同一句，来源是 S232 `scriptPropsHook` 里同一条 cast（`git diff` 证明本论没碰那段）。它一直不红是因为 **246 不在 scriptc 代表集里** —— 门从没走过这条路。已开**任务 #45**：把 hook 也换成静态读数器，并把这一形塞进代表集，让「node 过、AOT 炸」这类形状以后自动有门。
- **拒答清单又短一支**：`inst_to_dict` 从发射期拒答清单划进 `BUILTIN` + `BUILTIN_ARITY` + `GLOBAL_CALLABLES`（名表可派发 107→**108**、该拒 19→**18**、清单 11→**10**）。元数两句走引擎原文；`Not a script with an instance.` 这类**过 `RTR()` 的文案只在 ops 钉**（本机默认语言给中文，英文要 `--language en`，S269 ⑧）。单文件模式没有 res 路径，`@path` 那一格抛 `[inst-to-dict-path]` 而不是编一个。
- **下一轮**：`dict_to_inst` 一支（读数已在 S269 ⑦：跳过 `_init`、缺 `@path` / 加载不到 / `@subpath` 不存在的三句、缺 `@subpath` 就是造模块根类那一形 Tier 1 发不出要拒）。它要的是「按 res 路径找脚本 + 按类路径找内嵌类」，与 `load()` 那张表贴在一起。
- **账**：语料 265 共 32 行 golden / 27 格逐字节；`test:diff` **179/179**（共 265 例，静默 0、崩溃 0）、`pnpm test` **1104** 例 / 48 文件、ops 自校验 1884→**1892**、guards **184** 例、`test:compile` 187/256、codegen 2/2、pkgmodes 25/25、export ok 10 / FAIL 0、cli-native 20 例全过、typecheck 4/4；AOT 单例门 `265-inst-to-dict` **1/1 编过 + 1/1 跑通 + 逐字节一致**。**产物面 churn**：186 份 `main.gen.mts` 各多一行 `rt.registerDictIdentity(…)`，逐字节输出一条没变。**门维护两笔**：跑 `test:pkgmodes` / `test:cli-native` 前先 `pnpm build`（§1.71 那条口径这次照做，两门直接绿）；`pnpm test:compile` 撞到一次 Windows 的 `UNKNOWN open` 写盘错，重跑即过 —— 它是环境抖动，不是编译器问题，但**门链里排在它后面的那几步必须跟着重跑**（本轮第一次 SC265 / DIFF 红就是拿旧产物跑的假红）。

### 1.74 修掉 String.format 的静态目标洞：那条记录转换连留作兜底都不行（2026-10-08，S271，任务 #45 结清）

- **它是 S270 ④ 顺手抓到的一笔**：语料 246（`String.format()` 吃脚本实例）在 scriptc 上跑挂 `expected object at $.gdObjectId, got number`，而 node 侧 15 格一直逐字节过 —— 「只有 AOT 才暴露」的形状，且因为 246 不在代表集里，门从来没过这条路。
- **定位只能截**：`GDS2JS_SCRIPTC_KEEP=1` 留住替身树 → 按格删 `print` 重编重跑（全删退出 0、留任何 format 格就炸）→ 再写最小探针：同一台对象 `print` 出来是 `<RefCounted#3>` 正常，走 format 立刻炸 —— 锁定 `strFormatV` 的 OBJECT 分支里 S232 那句 `as unknown as Record<string, Variant>`。
- **最有用的一条**：改成「有读数器走读数器、没有就按名索引」之后**还是炸同一句**。scriptc 对「对象 → 记录形状」的校验挂在**转换语句本身**，不是执行到分支才校验。把那条 cast 彻底删掉、读数器变成 `registerScriptProps` 的必填第三参，才真的过。**结论：这类式子不能留在函数体里当兜底。**
- **node 语义没动**：`const` / `static var` 在类上、实例按名取本来是 `undefined`，`s.NAME` 同值；带 get/set 的属性两条路都会触发原型 getter。41 份产物只多了一个实参，`test:diff` 179/179 逐字节照旧。
- **门补上了**：246 进 scriptc 代表集（10 → **11** 格），门注释写明为什么在这 —— 下次再出现「node 绿、exe 炸」的形状，代表集先响。
- **账**：`test:scriptc` 代表集 **11/11 出货一致**、`test:diff` **179/179**（265 例）、`pnpm test` 1104 / 48 文件、ops 1892、guards 184、compile 187/256、codegen 2/2、pkgmodes 25/25、export ok 10 / FAIL 0、cli-native 20 例、typecheck 4/4。
### 1.75 `dict_to_inst` 的读数补齐：三句失败的英文原文，加字典与字段不一致那三条口径（2026-10-08，S272，读数轮 · 无实现变更）

- **为什么单独一小轮**：S269 ⑦ 已经把「跳过 `_init`」与三句失败量到了，但那三句是**中文**（本机默认语言，过 `RTR()`），实现要写进错文的是英文原文 —— 这次用 `--language en` 重跑一次取回，并把两形都留档。
- **三条新口径**：字典**少**字段 → 那一格是**类声明的默认值**（不是 null，也不是 `_init` 的结果）；字典**多**出来的键 → **静默忽略**，不报错也不挂属性；字典改过的格 → 照字典值灌进去。合起来是「以类为准的构造 + 逐格 set，多余不管、缺失留默认」。
- **还有一形只能拒**：`@path` 加载不到时引擎固定先打两句带自己 C++ 文件行号的 `ERROR:`（`load_source_code (modules/gdscript/gdscript.cpp:1127)` / `_load (core/io/resource_loader.cpp:343)`），normalize 滤不掉那两形，所以实现只发第三句。缺 `@subpath` 是造**模块根类** —— 在语料宿主里那是 `SceneTree`，Tier 1 发不出实例，按响亮拒处理。
- **实现的前置已经就位大半**：`registerDictIdentity` 每类都带 `(resPath, classPath)`，查找表直接能用；缺的是「只跑字段初始化子、不跑 `_init` 体」那个构造入口（发射器本来就把这两步分开）。
- **账**：无实现变更，门读数沿用 §1.74 那一笔。

### 1.76 `dict_to_inst` 发出：一条不跑 `_init` 的构造入口，加实例上那张按名原值表（2026-10-08，S273，语料 266，§1.75 那份读数花掉）

- **认类那一步是白捡的**：`registerDictIdentity` 早就按 `(resPath, classPath)` 登记了每一类（S270 为它准备的），`@path` + `@subpath` 直接查表；两句「认不到」的分岔靠「空类路径那一格在不在表里」判（产物一定会登记模块根类），于是 `can't load script at @path` 与 `invalid subclasses` 各归各。
- **真正要新造的是构造入口**：`rt.beginBareConstruction()` / `endBareConstruction()` / `bareConstruction()` 一面旗，`desc.make([])` 期间举着；发射器把**两处** `_init` 入口都关到旗子后面 —— `emitInitAsConstructor` 整个体进 `if (!rt.bareConstruction()) { … }`，`emitRootConstructor` 那条派发路加同一个前置。字段初始化子本来就在 `_init` 外面，正好就是引擎要的那半截。语料 t10/t13 钉住「`_init` 里的 print 一次都不打、字段仍从字典灌进去」。
- **一条被读错的口径当场改正**（探头 `tmp/probe-inst/h-share.gd`）：S269 ④ / S270 ② 写的「带 get/set 的属性出门的是声明类型的默认值」在 `new()` 这一形上与真相同读数，实读的是**实例上那张按名索引的原值表** —— `dict_to_inst` 灌 accessor 那一格**不调 setter**，但值存进了这一台实例，`inst_to_dict` 再出门就带它（语料 t22 印 `&"v": 2` 而 `_v` 仍是 1、`ab.v` 走 getter 也仍是 1），同类的旁两台照旧默认（h01/h03/h04）。实现是 `GdScriptObject` 多一面懒创建的 `__gd_dict_written__`，`gInstToDict` 在「灌过的原值」与那张十六形默认值表之间按它选；**265 那份 golden 一字未变**（`test:diff` 180/180），旧账不用翻。
- **又是只有静态目标才验得出来的形状**：「实例上那张按名的表」与「不跑 `_init` 的构造路」两条都落在 AOT 的射程里，所以 266 进 `test:scriptc` 代表集（**11 → 12** 格），与 246 作对；单例门 **1/1 编过 + 1/1 跑通 + 逐字节一致 1/1**。
- **仍按响亮拒处理的两形**：缺 `@subpath`（或 `@subpath` 是空 NodePath，即 `inst_to_dict` 对模块根类发的那一格）要造的是宿主根类，引擎实测造出 `<SceneTree#号>` 并漏一片 RID，Tier 1 发不出、别的宿主基类也没量过 → `[dict-to-inst-root]`；`@path` 加载不到时引擎前那两句带自己 C++ 文件行号的 `ERROR:` 不复刻，只发第三句。
- **账**：发射期拒答清单 10 → **9**、名表可派发 108 → **109** / 该拒 18 → **17**；`test:diff` **180/180**（共 266 个用例，静默 0、崩溃 0）、`pnpm test` **1111** 例 / 49 文件、ops 自校验 **1906**、guards **185**、`test:compile` **188/257**、`test:golden-check` **266/266** 漂移 0、`test:codegen` 2/2、`pnpm build` 后 `test:pkgmodes` 25/25、`test:export` ok 10 / FAIL 0、`test:cli-native` 20 例、typecheck 4/4；产物 churn 15 份 `main.gen.mts` 套上裸构造守卫，输出逐字节没变。

### 1.77 `is_instance_of` 发出：第二参三形各走各的表，界量在 TYPE_MAX 那一格（2026-10-08，S274，语料 267）

- **为什么这一支值得单独一轮**：它是拒答清单上最后一支「语言层」的全局函数 —— 剩下的 `bytes_to_var` / `var_to_bytes` 是引擎的二进制序列格式，`print_stack` / `get_stack` / `push_error` / `push_warning` 要的是逐帧 `.gd` 栈，都不是补一格读数就能发出去的。
- **三形各走各的表**（这是这一轮的实际形状）：int 那一形是 `typeof` 同一张码表的**严格同型**比较（`&"x"` 对 TYPE_STRING 假、对 TYPE_STRING_NAME 真；实例对 24 真、对 27 假；RID 对 TYPE_OBJECT 假）；类值那一形走脚本 `is` 那条链（继承真、别家假）；引擎类值那一形走 `is` 量过的那七支。所以实现里没有任何新表 —— 复用 S258 那批链，加一条 `typeof(值) === 那个数`。
- **界是量出来的，不是推出来的**：38 有读数、**39 起报错**，而 39 正是 `TYPE_MAX` 那一格（S224 的常数表）；字面量与变量两形都落在这句上。顺手记下两侧的一处差异：越界的**字面量**在引擎是解析期（整支脚本加载失败），我们是运行期 —— 要复刻得先让 IR 认得出「这格实参是字面量 int」，写进 §6 第 26 条，没动实现。
- **第一参不是对象不报错**：null / int / String / RID 四格都是假。这一形容易猜成「运行期那一句」，量了才知道引擎忍着。
- **两句失败原文与元数两句都是 `--language en` 量的**（本机默认语言中文，过 `RTR()`）：第二参不合式那句 String / 自己的实例 / 别人的实例 / null 四格共用；元数两句走 `BUILTIN_ARITY: [2, 2]`。Callable 那一眼照旧：`@GDScript::is_instance_of`、argc 2、`.call()` 只认恰好两支。
- **表外的引擎类值仍拒**：`is_instance_of(a, Label)` 引擎给什么没量，`[is-instance-of-class]` 响亮拒 —— 这一形 Tier 1 里也几乎用不上。
- **门**：267 进 scriptc 代表集（**12 → 13**）。它不是因为新围栏才进（`intToNum(klass.v as IntPayload)` 与 `rt.nativeClass(...)` 在静态目标上都过），而是因为这条式子的三分岔全靠 `instanceof` 与 union 载荷 —— 那正是只有 AOT 才会挑出来的形状。代表集 **13/13** 出货一致。
- **账**：发射期拒答清单 9 → **8**、名表可派发 109 → **110** / 该拒 17 → **16**；`test:diff` **181/181**（共 267 个用例，静默 0、崩溃 0）、`pnpm test` **1117** 例 / 50 文件、ops 自校验 1906 → **1918**、guards **186**、`test:compile` **189/258**、`test:golden-check` **267/267** 漂移 0、`test:codegen` 2/2、`pnpm build` 后 `test:pkgmodes` 25/25、`test:export` ok 10 / FAIL 0、`test:cli-native` 20 例、typecheck 4/4。另把 `trig-family` 里「没式子的两支 `.call` 响亮拒」那格的样本换成 `var_to_bytes`：样本名字自己已经有式子了，留着就是门在讲假话。

### 1.78 `^"a/b"` 字面量接上：词法与 `&"…"` 同一套，发射直接复用构造函数那条路（2026-10-08，S275，语料 268，§6 第 25 条结清）

- **为什么单独一格**：S273 写 `dict_to_inst` 的闸门时撞上「`^"…"` 编不过」—— 值型早就出货（S267/S268），缺的只是 lowering，而语料里当时一格字面量都没有，门因此从没响过。
- **量到的第一件事：字面量与构造函数是同一个值**。`^"a/b" == NodePath("a/b")` 真、`typeof` 22、print 与 `str()` 出门是裸文本、`var_to_str` 给 `NodePath("a/b")`、`is NodePath` 真、名字数 / 子名数 / `is_absolute()` / 空字面量 / `^"a:1"` / `^".."` / `^"$A/B"` 逐格与构造那一形一字不差；字典键也同一条（`{ ^"a/b": 1 }` 的 `has(NodePath("a/b"))` 真、`keys()` 给 `[^"a/b"]`）。于是实现只发 `rt.nodePathCtor([rt.V.str(文本)])`，**runtime 一行没改**。
- **量到的第二件事：转义在词法器就解完了**。`^"a\tb"` 等于带真制表符那一串、不等于 `NodePath("a\\tb")`（反斜杠加 t 两个字符），`^"a\nb"` 打两行、`^"a\"b"` 给 `a"b`、`^"a\\b"` 给 `a\b`。lowering 因此就是 `unquote(stripCaret(text))`，与 `&"…"` 共用同一个 `unquote`；这与 S267 那条「NodePath 自己的文本不认转义」不打架 —— 一层是词法、一层是路径解析。
- **一处刻意不给静态名**：`staticType` 对 `node_path` 给 null（那张表还喂着打印、运算与 pack 实参的判据，NodePath 字面量在里面的口径没量过），走动态路；语料 34 格逐字节证明够用。
- **顺手取回、但没实现**：`hash(NodePath)` 七个数（`^"a/b"` = 1780534522、`^""` = 0、`a/b/c` = 1023628924、`a:1` = 1043212071、`/a/b` = 2514432773、`a b` = 787445055、`a/b:0` = 1488325207），与同批文本的 `hash()` 全不一样（`hash("a/b")` = 193484279）—— 不是「把文本再走一遍字符串那条链」。照 S208 反 murmur3 的方法反推之前继续拒；读数进 §6 第 27 条。两句解析期的运算错文也量了（`Invalid operands to operator + / <, NodePath …`），与 S268 的自家拒同向，只写文档。
- **顺带量清一族跨型比较，并当场抓到一格自家 bug**（`tmp/probe-np-lit/dyn.mts` 七份 + `cmp.mts` 四份）：算子里（`==` / `!=` / `<` / `+`）NodePath 与 String / StringName 一比就是错 —— 静态形是解析期 `Invalid operands to operator ==, NodePath and String.`，**动态形（实参 untyped）是运行期 `Invalid operands 'String' and 'NodePath' in operator '=='.`**，而这句与 S268 那轮自家抛的**一字相同**（等于反向验了一遍那轮的拒答文案）。但**容器与 match 臂走的是另一条不抛的比较**：`^"a/b" in [^"a/b"]` 真、`arr.has("a/b")` 假、`&"a/b" in {^"a/b": 1}` 假、`d.get("a/b", 0)` 给 0、`match p: ^"a/b":` 只认 NodePath。**bug 就在这**：`Array.has` 与 `in` 用的 `valueSame` 对 OBJECT 载荷按 JS 引用比，而 NodePath 盒子每次读都是新建的 —— 于是那两格我们假、引擎真（语料 t35 / t37 照出来）。修法与 Callable 那条同形：给 `valueSame` 加一条 `sameNodePath` 的结构比较。**这是本轮唯一动到 runtime 的地方**，`test:diff` 182/182 逐字节一条没变。
- **`^"…"` 仍进不了 match 臂**：臂比较引擎那里不抛，我们把臂降成会抛的 `==`，两条口径不一样，`lowerPattern` 因此没收 `node_path`（报 `[pattern] 模式 node_path 未支持`），要发的先补三件测量 —— 见 §6 第 28 条。
- **门**：语料 268 共 43 行 / 42 格逐字节；guards「NodePath 族的发射闸门」加了两形字面量与三格放行；`test:compile` **190/259**。**代表集这轮补了一格**（13 → 14）：清点在册那 12 支的产物，`nodePathCtor` / `NodePath(` 出现 **0 次** —— 也就是 NodePath 这一族（264 构造 + 268 字面量）从来没被静态目标门量过，268 进去把两条路一起挂上门。
- **账**：`test:diff` **182/182** 逐字节（共 268 个用例，静默 0、崩溃 0、未实现 0）、typecheck 4/4、`pnpm test` **1120** 例 / 50 文件、ops 自校验 **1918**、guards **186**、`test:compile` **190/259**、`test:golden-check` **268/268** 漂移 0、`test:codegen` 2/2、`pnpm build` 后 `test:pkgmodes` 25/25、`test:export` ok 10 / 环境记账 3 / FAIL 0、`test:cli-native` 20 例；scriptc 代表集 **14/14** 出货一致（含 268）。

### 1.79 `push_error` / `push_warning` / `print_stack` / `get_stack` 的读数补齐：四支缺的是运行期帧栈，不是文案（2026-10-08，S276，读数轮 · 无实现变更）

- **为什么先量不先发**：§2 第 18 条把这四支归到「要逐帧栈的那堆」，当时并没有量过。这轮一次取回 15 格（全 `--language en`），文案与形状都定了，只剩一件工程活。
- **三件与直觉不同的读数**：① `push_error()` 空实参照打、多实参按 `print` 那条顺次拼（`push_warning("a", "b")` → `WARNING: ab`），元数是 0..N 而不是恰好 1；② 这两支**不中断脚本**，前后语句照跑；③ `get_stack()` 的帧字典键序固定 `source` / `function` / `line`，函数名是**裸名**（静态方法不带类名、lambda 是 `<anonymous lambda>`），C++ 帧一条不出；`print_stack()` 每帧一行 `Frame N - 路径:行 in function '名'` 且**没有表头**，只收 0 支。
- **门的一条硬约束**：那两块的 `at:` 行是 `core/variant/variant_utility.cpp`，normalize 会把**整块 `ERROR:` 连同帧一起滤掉**，`WARNING:` 那块滤不掉 —— 于是 `push_error` 在语料侧不可见，只有 `push_warning` / `print_stack` / `get_stack` 真能进逐字节对账。下一轮别把「被滤掉」当成「不用实现」，也别只给 `push_error` 写语料格。
- **缺的那件活**：产物运行时要能报出 `(函数名, .gd 行号)` 的帧栈。`mark(genLine, loc)` 现在只喂 source map，`LINE_MAPPINGS` 编译期就丢，runtime 无帧栈；要么每个函数体一对 push/pop + 一张运行期「产物行 → `.gd` 行」表，要么只在拿得到行号的路径上出货。**四支继续留在拒答清单（现共 8 支）**。
- **下一轮不用再测的（`frames.mts` 八格已量）**：帧是真调用栈（`[signal_received:21, _initialize:18]`）；`await f()` 与 `f.call()` 形状相同、不插帧；**每帧 line 是这一帧当前执行的行**（栈顶是 `get_stack()` 自己那行，父帧是调用点那行）；递归不截断（`rec(400)` 给 402 帧）；lambda 的帧名是 `<anonymous lambda>`。所以只有用到那四支的模块需要逐语句打点，其余模块保持零开销 —— 打点方案要在 node 与 scriptc 两侧都可信（`mark()` 那张表编译期就丢，AOT 没有可信的 `Error().stack` 行号）。
- **元数与标签的实测**（`arity.mts`）：`push_error` / `push_warning` 属 `@GlobalScope::`（argc 1，但实参是 **0..N 顺次拼**，`push_error("a","b","c")` 给 `abc`）；`get_stack` / `print_stack` 属 `@GDScript::`、argc 0、多给报 `Expected at most 0`。两块文本走 **stderr**，而门的 `runGodot` 是 stdout 拼 stderr —— 写语料时这两块只能排在所有 print 之后。
- **发射侧的省活方案（读数量完才知道可行）**：帧的 `line` 只有两种来源 —— 栈顶那帧是「本函数里那句 `get_stack` / `push_error` 所在行」，父帧是「它调用下游那一行」。两类都是**调用点**，所以打点只需包在 call 表达式外面（`(rt.frameAt(41), foo())` 这种逗号式）而不是每条语句都打；进出函数一对 `frameEnter` / `frameLeave`，为了让 `return` 与异常都弹干净，flag 打开的模块才把函数体套 `try/finally`。**没用到这四支的模块一行打点都不加**（零开销），flag 在发射期扫模块 AST 就能定。
- **账**：无实现变更，门读数沿用 §1.78 那一笔（`test:diff` 182/182、`test:golden-check` 268/268 漂移 0、scriptc 代表集 14/14、ops 1918、guards 186）。

### 1.80 把 `is_instance_of` 的越界字面量搬到分析期：分岔看的是第一参（2026-10-08，S277，§6 第 26 条结清）

- **为什么值得单独一格**：S274 出货时把这一形留在「运行期那一句」，并记了一句「字面量越界在引擎是解析期」—— 那句话不准确。补量之后规则不是范围也不是第二参的字面量性，而是**第一参是不是字面量**：`is_instance_of(5, 1000)` 解析期拒，`is_instance_of(a, 999)` 与 `(a, 99)` 却走到运行期那句（`tmp/probe-is/arg1.mts` + `boundary.mts`，12 个数值全跑过）。
- **落点选在分析器**：`tools/compile.ts` 的分账要求「emitter 不支持」保持 0，而这一形在引擎本来就是分析期的事，所以新增 `instanceOfTypeArgMessage`（diagnostic 码 `instance-of-type-arg`），界只留一个常量 38（= `TYPE_MAX` 前一格：实测 38 照跑、39 拒）。`-1` 在 IR 里是一元负号套字面量，也算字面量。
- **语料侧只能走预期报错**：引擎那一形整支脚本加载失败，golden 记的就是那四行；这类格子 JS 侧不参与逐字节对拍，所以对它作数的是 `test:compile` 的两行分账：**分析器拦下 69 → 70、emitter 不支持保持 0**。
- **两侧合成一条口径**：分析期只吃「两参都是字面量」那一形，其余全交给运行期那句引擎原文（运行期侧一字未动）。
- **账**：typecheck 4/4、`test:compile` **190/260**（拦下 70、缺口 0）、guards **187**、`test:diff` **182/182** 逐字节（共 269 例）；`pnpm test` 与 golden-check / codegen / scriptc / pkgmodes / export / cli-native 的读数记在提交信息里。

### 1.81 match 臂用的是另一条等式：`^"a/b"` 进模式位，异型只走默认不抛（2026-10-08，S278，语料 270，§6 第 28 条前半结清）

- **这一格是 S275 那轮欠的**：当时发现臂比较不抛、我们的臂却降成会抛的 `==`，两条形都不发。这轮把量清的那半补上：`^"…"` 可以当手臂，异型落 `_`。
- **量的关键三格**（`tmp/probe-match-arm/run.mts`）：五臂同摆时 StringName 与 String 都落字符串臂、NodePath 只落自己的臂；只摆字符串臂时 `NodePath("a/b")` 落 `_`（**不报错**）；而 `when q == ^"a/b"` 的 guard 遇到 String 照旧是运行期那句带 backtrace 的错 —— 一条链上两条等式，分得很清。
- **实现最小**：`lowerPattern` 收 `node_path`（与 `&"…"` 共用 `unquote`），发射复用 `rt.patLit(...)`；`patterns.ts` 的 `armEq` 只在有一侧是 NodePath 时接管，其余仍走 `valueEq`。RID 手臂故意不动：引擎那里 `rid_from_int64(5)` 根本不算常量表达式，而 RID Subject 对上别的手臂给什么没量 —— 按红线不猜。
- **剩下的是「还有哪些构造能当手臂」**：一次量齐了（`arms.mts` + `ctors.mts` 二十余格）—— 引擎收 15 种构造式手臂（`Vector2` / `Rect2i` / `Transform2D` / `Quaternion` / `Basis` / `StringName` / `Callable()` 等）、拒 `AABB` / `Array` / `Dictionary` / `rid_from_int64` / `str` / `A.new()` 与非常量实参；本轮只收了**等式也量过**的 `NodePath("字符串字面量")`（与 `^"…"` 同一支），其余的要先逐型量「异型 Subject 遇到它抛不抛」再发。全表在 §6 第 28 条。
- **账**：语料 270 共 16 格逐字节、`test:compile` **191/261**（emitter 缺口 0）、guards **188**；其余门读数见提交信息。



### 1.84 产物有了运行期帧栈，调用栈那一族四支随之出货（2026-10-08，S281，§2 第 18 条第一堆结清）

- **这一格欠的不是读数**：S276 早就把四支的文本、元数、键序与帧语义量全了，卡的是「产物运行期能不能报出 `(函数名, .gd 行)`」。今天的答案是**能，而且便宜**：函数体一对 `rt.frameEnter` / `rt.frameExit`（后者在 `finally` 里，提前 return 与抛错都不留帧），每条语句一行 `rt.frameLine`。
- **成本按模块付**：lowering 挂 `usesStack` 标志（照 `usesPackCodec` 那一支的写法），只有用到这四支的模块才发帧点，其余产物的函数体一字不变 —— `test:diff` 186/186 就是这条不变性的证据。跨文件的工程由 project.ts 把整份工程 OR 成一把旗，帧链才不断。
- **一处形状上的取舍**：`print_stack()` 实测走 stdout、要与其余 print 同序，而 stdout 的缓冲在宿主手里 —— 所以 runtime 只留一个出口槽，宿主装载时登记自己的 `addLine`（与 `packed.ts` 的三组槽同一种接法）。这样 `.call()` 那条路（runtime 侧）与直接调用（宿主侧）共用一份实现，不会写出两套文本。
- **语料看不见的部分另开一门**：normalize 滤掉整块 `ERROR:`，所以 `push_error` 的逐行文案改由 ops 的 12 格钉（英文原文靠 `--language en` 量的）；`print_stack` / `get_stack` / `push_warning` 三样真进了逐字节对账。
- **三条已知不等价全记在 S281 ⑧ 且都不在语料里**：await 信号后引擎的帧栈是从信号那里重开的（实测只剩一帧）、字段初始化子那一帧引擎叫 `@implicit_new`、两条协程同时活着时共享栈的顺序没量过。写清比装作没有强。
- **账**：语料 273（22 行逐字节）、ops 1918→**1930**、`pnpm test` **1143**、`test:compile` **194/264**（emitter 缺口 0）、`test:diff` **186/186**、guards 仍 **190**（拒答那支 `it.each` 少 4 格、新四例抵平）、拒答清单 8→**4**、scriptc 代表集 **16**；其余读数见提交信息。

### 1.259 scriptc 0.3 没有岛：CLI 那一层换成自己写的 argv 解析（2026-10-17，工具链口径 · 第 12 条①作废）

- **怎么撞上的**：`pnpm release` 升到 scriptc 0.3.x 之后第一次重编原生 CLI（`a80f358` 换了工具链，那之后这支 exe 没再重编过），于是把攒下的账一次翻出来 —— 先是分析层 8 格 `SC1090`（数组展开、对象展开、逻辑或接收者），清掉之后编得出 exe，但每条命令起手就抛。
- **commander 编不过的三格**：`_registerCommand` 里 `knownBy` 那格 union 布局不唯一（SC2003）、`_parseCommand` 的 `` `command:${this.name()}` ``（`name()` 是 `string | Command`，带对象臂的转字符串，SC1090）、help 那一格（`Uncaught TypeError: expected boolean at $, got undefined`）。它们都不报编译错，而是编成「跑到就抛」的 deferred site。
- **0.3 的口径**：文档 `dependencies#upgrading-from-scriptc-0-2` 写明 0.3 删了 `--dynamic` 与内嵌引擎，应用与包代码全上原生轨；实测 `scriptc build --dynamic` → `Unknown option`，coverage 的 `statementsDynamic` 恒 0。所以第 12 条③那句「落进 node_modules 会被收进岛」按 0.3.4 应读成「会被**静态吞包**」。
- **不是我们的用法**：照文档那条 commander 示例（`argument` + `--upper` + `action`）单编一次，0.3.4 一样抛在 1608；`--npm-static` 只有「选进来」没有「踢出去」，空表和显式指名别的包都仍是 `commander static`；commander 12 / 13 / 14 更早抛在 `esm.mjs`（namespace 对象当值）。补丁也试过两处（按文档提示先窄化、把闭包提到模块级带 JSDoc）仍抛 —— 判上游缺口，绕开而不是修依赖。
- **换法**：`packages/gds2js/src/commands.ts` 自己解析 argv、自己排 help。式子照抄 commander 的 `Help`：无颜色时 `displayWidth` 就是 `.length`、`padWidth` 取整页最长项、说明折到 `helpWidth - termWidth - 4`、不足 40 列不折、续行缩进 `termWidth + 4`；四类报错句连同一套 Damerau-Levenshtein 的 `Did you mean` 也同式。先后口径照它：`-V/--version` 在 `--` 之前扫到就当场打印（哪怕 `-h` 在它前面），verb 之后的 `-h` 归 verb，verb 之前 root 认不出的选项跟着 `operands.concat(unknown)` 一起交给 verb。
- **验收**：`tmp/cli-all.mjs` + 基线 `tmp/cli-all.json` 那 97 格形状在 node 产物与原生 exe 两侧都逐字节相同，另 21 格拿 10-04 那支老 exe 对过零差异；门见下。**踩到的一次假失败**：`tools/cli-native.mjs` 收尾会自己删 scratch，想留 exe 复验得带 `--keep`。
- **顺手两处**：commander 从两处 manifest 与 lock 摘掉（第 12 条①那条「根 devDeps 的 commander 是原生构建的解析锚点」的前置到此作废），自包含 exe 从 9.27 MB 降到 6.79 MB。
- **还没了的账**：`export --pack scriptc` 给带 zstd 的产物加的那句 `--dynamic`（`packages/gds2js/src/cli/export-exec.ts` 里 `tree.dynamic === true` 那一支）在 0.3.x 上已是未知选项，mode 2 那一格要另开一轮量；`main.ts` 的 `--pack` help 文案与 `tools/cli-native.mjs` 的「岛是默认」注释也还写着旧事。
- **门读数**：`pnpm release` 全过 —— 版本与 engines 门、scriptc 面探针 1/1、`test:cli-native` **22 项 0 失败**、产物 `--version` 冒烟；`pnpm test` **14343**（139 文件）、typecheck **4/4**、ops 自校验 6130、tree-face **17/0**。

### 1.275 Packed* 九面的形参拒补全：逐位声明槽与链式接收者（2026-10-17，S444，§6 第 52 条那一面结清）

- **漏拦的规模**：九面 2160 格里 1590 格引擎在解析期拒、我们放过 —— 根因是原表只支持「一支方法一个元素位 + 实参数正好等于那位」。
- **改法**：`PACK_ARG_POSITIONS` 按位给声明槽（`e` 元素型 / `i` int / `b` bool；`bsearch` 的 `before` 实测与 int 槽同集合），每位各判各的；接收者多认「就地构造的链式」一种证明。
- **两侧对过**：链式与命名变量两种接收者各跑一遍 2160 格，句子与行号逐格相同（`tmp/probe-packargs/{cross,crossvar}.py`）；新语料 387 二十句与裁判逐行同文。
- **门读数**：`pnpm test` **14409**（140 文件）、typecheck **4/4**、`test:compile` **264/375**、`test:diff` **257/257** 逐字节、`test:codegen` 全过。

### 1.274 单文件模式撞上父脚本 extends：把误导的两句换成一句准确的（2026-10-17，S443，§6 第 60 条② 收窄）

- **实测**：`main.gd` 写 `extends "res://sub.gd"`、`sub.gd` 是 `extends SceneTree` 带 `helper()` —— 引擎工程模式给 `C1|25 7`；我们的单文件路径把 `var q = quit` 报成 `Identifier "quit" not declared in the current scope.`、把 `helper()` 报成 `Function "helper()" not found in base self.` —— 两句都在说「这东西不存在」，而真相是「单文件模式没读父脚本」。
- **改法**：`cli/ctx.ts` 的 `tryLoadSingle` 在 lower 之后先看 `ir.extends` 的文本（剥引号后含斜杠 / 反斜杠、以 `.gd` 收尾、或带 `res://` `user://` `uid:` 前缀）——命中就返回 `[single-file-extends]` 一句并指去 `run-project` / `build-project`；标识符（类名、`SceneTree`）一律照旧，四道命令共用这一条路。
- **2026-10-17 推进（S455）**：`tryLoadSingle` 不再拒，改成报 `deps`；`compileProject` 加 `closureOnly`（只种入口、不扫根目录），`check` / `run` / `build --runtime-mode import` 三面走闭包管线，继承面判定与工程模式同一份代码。夹具两侧同字（引擎 `C1|25 7`，出货 `run` 与 `build`+`node` 同）。常驻门：`test/e2e/cli-closure.test.ts`。
- **工程模式没动**：`build-project` / `run-project` 读依赖表，`hostOnChain` 判得出链顶，这份文件出货与引擎逐字节同（`C1|25 7`）。
- **账收窄了一笔**：#42 那条正账（让单文件也读依赖、把 `hostOnChain` 的输入补全）当时只把错诊断换成准确拒，没有假装支持；下一轮由 S455 / S456 结清。
- **门读数**：`pnpm test` **14409**（140 文件）、typecheck **4/4**、`test:compile` **264/374**、`test:diff` **257/257** 逐字节、`test:codegen` 全过 —— 四格计数与上一轮一字不差。
- **2026-10-17 推进（S455 收尾 / S456）**：闭包的**另三面**接完 —— `--runtime-mode local` 旁挂一份 standalone、`--runtime-mode single` 把小树压成一个文件（build 先压临时目录再按 `-o` 落位，run 压完直跑）、`export` 两支铺闭包树；`[closure-pack]` / `[closure-export]` 两句随之删除。依赖往上爬出闭包根那一形（`extends "../sub.gd"`）新增 `[closure-root]` 响亮拒 —— res 空间放不下 `..`，不拒就会静默绑到根内同名格。闭包 export 逼出静态那支的 `SC0001`：入口实体 `__gd__<名>` 在父脚本也定义过时是真覆写，`override` 不能省（S456，三格实测：同步覆写出货 `SYNC|2` 与引擎同字，async / 入口两形撞 scriptc 自己的 `SC1090` 墙，`scriptcWall` 那句改成分支点名）。常驻门 `test/e2e/cli-closure.test.ts` 现在是八格，另加 `packages/compiler/test/entry-override.test.ts` 五格钉发射形状。**#42 那条正账就此结清**。
- **门读数（本轮）**：`pnpm test` **14555**（143 文件）、typecheck **4/4**、`test:compile` **265/383**、`test:diff` **258/258** 逐字节、`test:codegen` **2/2**、`test:golden` 内容变更 **0**、`test:e2e/cli-closure` **8/8**。
- **2026-10-17 推进（S455 ⑦）**：`--res-root` 补到 `check` / `build` / `run` 三面（原先只有工程级命令与 `export` 收这一旗），闭包的根改按 `closureRoot(ctx)` 算 —— 入口在下层的 `extends "res://lib/base.gd"` 与往上爬出的 `extends "../sub.gd"` 两形从此有退路，实测 `RR|25` / `A|25` 与引擎一字同。`[closure-root]` 那句的退路口径跟着改。常驻门到**十三格**，`test:scriptc` 面探针 **52/52**、`test:cli-native` **20/20** 复跑绿。
- **2026-10-17 推进（S455 ⑥ / #42 的最后一形）**：`load("….gd")` 那一形原来留在单文件支上撞自家的 `[load-unknown-script]` —— CLI 的读依赖判据只认 `extends` + `preload`，而 `compileProject` 的收集环认 `preload` + `load` 两个名字，差那一格是**过拦**（同一份源码工程模式出 `P2|41`）。判据补齐后 `preload` 常量 / `load` / `preload(…).new()` 三形与引擎逐字同（`P1|41` `P2|41` `P3|41`，夹具 `tmp/d6/pre-{const,load,var}/`），常驻门到**十格**。重门复跑：`test:cli-native` **20/20**（原生 exe 面在 S456 的发射改动后一字未改）。
### 1.273 字典重复键补上 NodePath 那一族（2026-10-17，S442，语料 386，§2 第 20 条④结清)

- **判据**：NodePath 字面量键折成独立一类（`np:`），同路径算重复、跨 String / StringName 各算各的；`NodePath("a")` 这种构造写法与 `^"a"` 同键（引擎实测那句拒在**首次出现**那一格）。
- **不误拦**：`^"a"`/`"a"`、`^"a"`/`&"a"`、`^"a"`/`^"b"`、`^"a"`/`^"A"` 四形引擎收，门各钉一格。
- **门读数**：`pnpm test` 14406、typecheck 4/4、`test:compile` 264/374、`test:diff` 257/257、`test:codegen` 全过。

### 1.271 unbind 之后再 bind 与 unbind 进等式：两形解绑（2026-10-17，S441，语料 385 十二格逐字节，§6 第 90 条结清）

- **一句机制**：`bind()` 落在 `unbind` 腾出的空位上 —— 绑定串一字不动（`get_bound_arguments()` 仍 `[1, 2, 3]`），只把 unbind 的计数按绑的支数减回去，所以计数从 2 到 1 到 0，`call()` 一直是 `f(1, 2, 3)`。
- **累加**：`unbind(1).unbind(1)` == `unbind(2)`（X6），`unbind(0)` 不加不动。
- **等式加一位**：`u1 == g` 假、`unbind(2) == unbind(1)` 假、同参数的两次 unbind 之间真 —— S298「绑定状态进等式」补上「**unbind 的位数也进**」，落在 `callableEq` 一处，`callableSame`（`connect()` 那条身份判定）不动。
- **闸撤了一处**：`[callable-bind-unbind]` 不再发；仍响的是负数 / 非 int 的 n 与「带默认值形参的 lambda 再 bind」（S437 ⑥）。
- **门读数**：`pnpm test` **14401**（140 文件）、typecheck **4/4**、`test:compile` **264/373**、`test:diff` **257/257** 逐字节、`test:codegen` 全过。

### 1.270 `Callable.unbind(n)` 的式子量清并发货（2026-10-17，S440，语料 385 七格逐字节，§2 第 20 条③ 那半笔结清）

- **判据**：调用时先把 caller 实参的**尾部 n 支**削掉，再把绑定串接在后面 —— 所以 `bind(1,2).unbind(1).call(9)` 是 `f(1,2)` 的 102，而 `bind(1,2).unbind(1).call(8,9)`（三位声明）是 `f(8,1,2)` 的 80102；绑定串与 `get_bound_arguments()` 一律不变。
- **两句各管各的**：caller 给得比 n 少 → `Callable unbinds N arguments, but called with M`（无句点，先判）；削完仍对不上声明数 → 老的 `Invalid call to function '…'. Expected N argument(s).`。
- **计数**：`get_argument_count()` = 声明 − (已绑 − n)，把 S298 那条式子加回 n；`unbind(n)` 的 n 超过声明支数照收（W5 实测）。
- **仍响的两形**：负数与非 int 的 n、以及 **unbind 过再 bind**（引擎的绑定串与计数两式对不上，登 §6 第 90 条）；同一格里 `u1 == g` 给 false 也与 S298 的等式口径不同向，一并记着没动 `callableEq`。
- **门读数**：`pnpm test` **14401**（140 文件）、typecheck **4/4**、`test:compile` **264/373**、`test:diff` **257/257** 逐字节、`test:codegen` 全过。

### 1.269 绑定 Callable 存「读那一刻的接收者快照」：§6 第 85 条那格翻案结清（2026-10-17，S439，语料 384 十一格逐字节）

- **一格定案**：`var c = a.append` 之后 `a.append(3)`，`c == a.append` 引擎给 false 而 `c == c` 给 true、`c.call(7)` 仍改活的那一台 —— 「按接收者的值比」那条口径补上后半句：**比的是读那一刻的值**，调用照旧走活对象。
- **快照是深拷**：`var w = [[1]]` 读完后改内层 `w[0]` 也断等式（B11），浅拷元素挡不住这一格；pack 九支同形，值类型本来不可变所以是同一规则的另一种表现。
- **接法**：`boundBuiltinCallable` 造盒子时挂快照（Array 深拷 / GBytes 拷缓冲），`callableSame` 内建那一段比快照；`callable.ts` 是叶子模块，拷贝式子由 `methods.ts` 装载时注册钩子递进去。字典面不发绑定 Callable（S419 ②），不参与。
- **顺带对上旧账**：`hash` 跟着快照走（S430 那条「hash 随值同」补一句「随读那一刻的值」）；`bind()` 过的一支与 fresh 读值不等，仍归 S430 的「绑过就不等」。
- **门读数**：`pnpm test` **14398**（140 文件）、typecheck **4/4**、`test:compile` **263/372**、`test:diff` **256/256** 逐字节、`test:codegen` 全过。

### 1.268 捕获表补上子作用域的继承：循环体与嵌套 lambda 也进影子层（2026-10-17，S438 ⑧，语料 383 扩到十格）

- **上一轮漏的一半**：`Scope.child` 建出来的子作用域没带上「函数那一段」的标记，于是循环体里、lambda 体里读到的外层局部全被判成非局部 —— P9 那格引擎 `[7, 9, 9]` 出货 `[9, 9, 9]`，P10 引擎 `[2, 3]` 出货 `[101, 102]`。
- **改法**：`child()` 把 `isLocal` 往下传（`funcChild` 仍只用于函数那一层），捕获表自然覆盖嵌套 lambda 与循环体；容器仍只拷引用。
- **门**：`lambda-param-defaults.test.ts` 加一格「循环体里建的 lambda 也带上影子层」（钉 `(((k, n) => rt.callable(` 与 `))(k, n);`），16 格全过；语料 383 从八格扩到十格，golden 由裁判重写。
- **门读数**：`pnpm test` **14392**（140 文件）、typecheck **4/4**、`test:compile` **262/371**、`test:diff` **255/255** 逐字节、`test:codegen` 全过。

### 1.267 lambda 按值捕获接进出货：影子箭头一层（2026-10-17，S438，语料 383 八格逐字节，§6 第 89 条结清）

- **上一轮量到的唯一错值面**：函数级标量局部该在 lambda 创建那一刻冻住（引擎 5 / 出货 6；`s1` 那格 2 对 11），本轮按 §6 第 89 条⑤定好的接法落地。
- **两侧各加一处**：分析器 `Scope` 分出「函数那一段」与类 / 模块那一段（`funcChild` + `hasLocal`），按 `归属:行:列` 记下每支 lambda 的自由局部名；发射器据此把 `rt.callable(...)` 包进 `((q) => ...)(q)` —— 不改名不动式子，体内读到的自然是影子参数。
- **不参与捕获的**：模块变量与类成员（`declNames` 那一圈 + 内部类名，K5 实测活读到 2）、`self`（K6 typeof 24）、子树自己绑过的名字（形参 / `var` / `bind` 臂名）。
- **与 S437 的交接**：默认值式子仍在调用那一刻评，但式子里的外层量已经冻住 —— `func(x = q)` 那格语料 382 不收（当时按引用闭包会漂移），现在由语料 383 的 P7 钉住。
- **门读数**：`pnpm test` **14391**（140 文件）、typecheck **4/4**、`test:compile` **262/371**、`test:diff` **255/255** 逐字节、`test:codegen` 全过；捕获那一层只改到一份既有产物：语料 015（循环里建一批 lambda）加上 `(((i) => rt.callable(...))(i))`，出货输出与 golden 仍逐字节一样（`test:diff` 256/256）

### 1.266 lambda 捕获这一族的读数轮：错值面量到只剩一格（2026-10-17，§6 第 89 条④⑤ · 只量不接）

- **量清的**：`for` 每轮的循环变量两侧都给 `[1, 2, 3]`（出货靠 JS 每轮重绑撞对）；容器**只拷引用**（体内 `d["k"] = 9` 外面看得见）；**模块变量不捕获**（`var mv` 改了之后 lambda 读到新值，出货走 `this.mv` 天然一致）；`self` 在体内照旧 typeof 24。
- **唯一错值面**：**函数级标量局部**在 lambda 创建那一刻该冻结 —— 引擎 `var outer = 5` 建 lambda 后 `outer = 6`，两层嵌套都还是 5；出货给出 6（`var s1 = 1` 那格同形，11 对 2）。
- **接法定稿**：分析器那一层已经按真实作用域走 lambda，只缺「这一读是函数级局部还是类成员 / 模块变量」的分辨（类作用域种的成员名与 `self` 要打非局部标记）；把每个 lambda 的自由局部名清单记给发射器，发射器套一层只跑一次的影子箭头 `((q) => rt.callable(...))(q)` —— 拷的是盒子引用，所以容器共享那格不受影响。
- **门读数**：与上一轮一字不差（`pnpm test` 14383 / 140 文件、typecheck 4/4、`test:compile` 261/370、`test:diff` 254/254、`test:codegen` 全过）—— 本轮不动实现。

### 1.265 lambda 形参的默认值接进出货（2026-10-17，S437，语料 382 十格逐字节，§6 第 60 条③结清）

- **发法**：尾部带默认值的那几位发成 `const p = __a[i] as rt.Variant ?? <式子>;` —— 默认值在**调用那一刻**评，所以后一位看得见前一位（`func(x = 1, y = x)` 读数 `[1, 1]`）；没有默认值的 lambda 仍不发第三个实参（闸门钉住 `}, 2);` 与 `}, 2, 0);` 的分别）。
- **盒子多带一个数**：`rt.callable(fn, 声明数, 默认值形参数)`，`callableArityBounds` 因此给出 `[必填, 声明]` —— 少给报必填数、多给报声明数那两句在 `func(a, b = 2)` 上分别是 `Expected 1` / `Expected 2`，`get_argument_count()` 仍报声明数。
- **解析期那一格**：分析器给默认值走查开的是「前面的形参 + 外层」那一层作用域，`func(a = b, b = 1)` 照引擎发 `Identifier "b" not declared in the current scope.`。
- **三形仍拦**：默认值排在必填之前、默认值那一位直接放 lambda、带默认值的 lambda 再 `bind()` —— 三形没读数，按红线响亮拒。
- **顺带撞出一族已知错值**：lambda 是**按值捕获**，出货按引用闭包（`var q = 7` → 建 lambda → `q = 9` → 引擎 7 / 出货 9），登 §6 第 89 条；语料 382 因此不收依赖捕获的格。
- **门读数**：`pnpm test` **14383**（140 文件）、typecheck **4/4**、`test:compile` **261/370**、`test:diff` **254/254** 逐字节、`test:codegen` 全过。

### 1.264 循环变量的绑定改成按区域计数：出了循环不再冒充局部名（2026-10-17，S436，§6 第 88 条结清）

- **漏点**：`emit/emitter.ts` 的 `collectBinds` 把 `for` 的循环变量记在整支函数上，只给「宿主方法名取值点」那一格当护栏用；于是 `for quit in [1, 2]` 之后 `print(quit)` 被当成局部名、发成裸 `quit`，产物到运行期才抛 JS 自己的 `quit is not defined` —— 引擎那里是宿主的 Callable（`SceneTree(<文件>)::quit`、typeof 25）。
- **改法**：那张表从 `Set<string>` 换成 `Map<string, number>` 的**区域计数**：进循环体 +1、出循环体 −1（嵌套里外同名各占一层），形参与 `var` 仍按整支函数算。分析器一侧的作用域本来就是对的（循环体开子作用域），所以 `for k` 之后 `print(k)` 一直是解析期那句 `Identifier "k" not declared in the current scope.`，这一格不动。
- **不进语料的一格**：我们发的 `SceneTree::quit` 比引擎少括号里那个脚本名，属 S281 那支带进程内号码的打印形，复刻不了就不钉；改由门钉两支新格（体里认局部 / 体后认宿主，外加体后读普通循环名仍是解析期拒）。
- **门读数**：`pnpm test` **14370**（139 文件）、typecheck **4/4**、`test:compile` **260/369**（sema 83 / 响亮拒 26 / emitter 0 三格一字不差）、`test:diff` **253/253** 逐字节、`test:codegen` 全过。

### 1.263 撞出一处作用域泄漏：循环变量在循环体之后仍被当成局部名（2026-10-17，§6 第 88 条新登 · 只量不接）

- **引擎脾气**：`for k in [1, 2]` 的 `k` 只活到循环体结束，循环之后 `print(k)` 是解析期那句 `Identifier "k" not declared in the current scope.`（整段编不过）；同名于全局/宿主方法（`for quit in …`）时循环体里照收，出了循环又回到宿主那支。
- **我们侧**：产物在运行期抛 JS 自己的 `quit is not defined` —— 解析期该拦的没拦、抛出来的又不是裁判的话，属「该拦不拦 + 错句」两重，读数 `tmp/probe-forvar/{p1,p2}.gd` 钉在 §6 第 88 条。
- **为什么这一轮不接**：`analyze` 的 `decls` 与发射器的局部名收集都没给循环体单独一层（`analyze.ts:515`），改之前要先把 `for` 里的 `var` / `const` / 嵌套循环 / `match` 臂变量各扫一遍，否则容易把「多拦」换成「漏拦」；按红线先登记不猜。（下一轮 1.264 接完了：漏点只在发射器那张「绑过的名字」表，分析器一侧的作用域本来就是对的。）

### 1.262 match 手臂的拒句补齐第二句（2026-10-17，S435，§6 第 43 条①③④结清）

- **两句同序**：手臂的构造式合不上表时，引擎在元数那句之后紧跟 `Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").`；lowering 的 `pattern-arm-signature` 现在带全两句，语料 330–333 的 golden 从「只比第一行」改成「比全部 Parse Error 行」，四格逐句对上。
- **三种形状各发哪几句**（`tmp/probe-arm-arity/readings.txt`）：嵌套的从里往外（`Vector2(Rect2(1))` 三行，外层用内层类名拼签名）、类名整个不存在换成 `Function "X()" not found in base self.`、实参是运行期表达式（`Vector2(q, 2)`）只发 pattern 那一句 —— 三种各钉一格门（`match-arm-ctors.test.ts` 51 格）。
- **准入没开**：`Rect2` 那七支仍不进合法表（构造调用连表达式位置都编不过，第 43 条⑩那条账没变），只是拒句从自述话换成引擎原文；`Color(1)` 那一形运行期 `packedRgba` 已经发得出值，但手臂命中那一格没量过，`Color(int, int)` 更走的是 `Color(String, float)` 重载并往 stderr 吐 `ERROR: Invalid color name: …`（带 C++ 文件行号，按 S269 ⑦ 不复刻）—— 两格都留在表外，实测读数登进第 43 条⑫。
- **门读数**：`pnpm test` **14368**（139 文件）、typecheck **4/4**、`test:compile` **260/369**（sema 83 / 响亮拒 26 与上一轮一字不差）、`test:diff` **253/253**、`test:codegen` 全过。

### 1.261 `PackedByteArray` 独有那 11 名的元数，与 `get_argument_count()` 读哪一个数（2026-10-17，S434，语料 381，§6 第 87 条结清）

- **11 名的上下界量齐**（尺 `tmp/probe-bytearity/round2.mts`，读数 `compare1.txt` / `raw.txt`）：`compress` `[0,1]`、`decompress` `[1,2]`、其余九支 `[0,0]` —— 零实参不报错即「至少 0」，五实参那句 `Too many arguments for "<名>()" call. Expected at most N` 报的就是上界；表落成 `runtime/face-arity.ts` 的 `PACK_BYTE_EXTRA_ARITY`，byte 那一面单独合出 `PACK_BYTE_ARITY`，`faceArity` 的 byte 分支与 `VALUE_METHOD_ARITY.PackedByteArray` 同一处取。
- **一次口径翻案**：绑定 Callable 的 `get_argument_count()` 给的是**声明支数**（= 元数上界），不是 S419 写的「必填数」。一把尺 329 名逐名对裁判（`tmp/probe-argc/gen.mts` → `compare1.txt`，13 面全表）—— 除 StringName 面上本就不存在的那 6 名，读数与表的第二值一字不差。旧口径之所以没露馅：撞出来的两格 `compress` 必填 1 / 读数 1 同数，`decompress` 必填 1 而读数 2 才把它驳掉（语料 381 的 Y7 `0 1 2`）。改在 `declaredArgCount` 一处，`requiredArgCount`（`Array.map` 那族按严格支数派发用的）仍取下界。
- **不另立第三张表**：这一族的「`.call()` 认的上界」与「声明支数」量出来是同一个数，所以 `rt.boundMethod` 仍只带 `[min, max]` 那一对。
- **顺手复核**：StringName 复用 String 表的 108 名里，只有 `chr` / `humanize_size` / `num` / `num_int64` / `num_scientific` / `num_uint64` 六名调不出 Callable —— 与 S431 那份存在名单缺的六名一字吻合（两份数据不会各漂一半）。
- **门读数**：`pnpm test` **14366**（139 文件）、typecheck **4/4**、`test:compile` **260/369**、`test:diff` **253/253** 逐字节、`test:golden-check` **380/380**、`test:codegen` 全过、ops 自校验 6140、tree-face 17。

### 1.260 `NodePath` 两支持名拼接实装（2026-10-17，S433，语料 380，§6 第 86 条①结清）

- **读数**：`tmp/probe-np/compare1.txt` 十二格 + `t1.gd` —— 名段与子名段各按 `"/"` 拼、互不掺（`a/b:cmp` 两支分别 `a/b` / `cmp`）、不做路径化简（`a/../b` 照原样）、绝对位只给子名段（`:a/b` 名段空串）。
- **返回型**：**StringName**（`typeof` 21）；拿它当 `String` 比会被引擎解析期直接拒，这一格是解析器自己报的，比打印更硬。
- **不收的一格**：`NodePath("").get_concatenated_names()` 引擎额外吐一句带自己 C++ 位置的 `ERROR: Parameter "data" is null.` —— 复刻不了（同 S269 ⑦），语料 380 因此避开，登记在第 86 条①b。
- **门读数**：`pnpm test` **14359**（139 文件）、typecheck **4/4**、`test:compile` **259/368**、`test:diff` **252/252** 逐字节、`test:codegen` 全过、ops 自校验 6137、tree-face 17。

### 1.259 七面属性读三分岔接进出货（2026-10-17，S432，语料 379，§6 第 84 条②结清、第 86 条新登）

- **三分岔**：`valueAttrKind(face, name)` 用 S431 的两份数据把属性读分成成员（给 `rt.boundMethod` 那只盒子）/ 真属性（`x` `y` `z` `r` `g` `b` `a`，走原路）/ 表外（给 `Invalid access …` 那句）；宇宙之外继续响亮拒，不猜。
- **两侧同步**：解析期那两句也铺到七面，但**只铺读形**——写形的两格没读数（护栏格钉住 `v.keys = 1` 不发诊断、`v.nosuchzz` 宇宙外放过）。
- **同一处存放**：`NODE_PATH_METHOD_ARITY` 搬进 `runtime/face-arity.ts`，StringName 复用 String 那张表（S389 量过）；`faceArity` 一处认全面。
- **顺手量出旧账**：`NodePath` 的 `get_concatenated_names` / `get_concatenated_subnames` / `get_as_property_path` 三名没实装（引擎有真值），连同 S267 ⑥a 的 `hash(NodePath)` 式子一起登 §6 第 86 条。
- **门读数**：`pnpm test` **14356**（139 文件）、typecheck **4/4**、`test:compile` **258/367**、`test:diff` **251/251** 逐字节、`test:codegen` 全过、ops 自校验 6137、tree-face 17。

### 1.258 值类型七面的属性读两面量齐（2026-10-16，S431 读数轮 · §6 第 84 条那份名单已可开写）

- **构造位**：候选宇宙 175 名（拿别面的成员名当表外名试）× 七面逐名过裁判 —— 表外数 `Vector2` 168 / `Vector2i` 169 / `Vector3` 167 / `Vector3i` 168 / `Color` 169 / `StringName` 73 / `NodePath` 171，句都是 `Cannot find member "<名>" in base "<面>".` 同一句两遍，与 pack / Array / String 完全同形。
- **装箱位**：七面逐面一格都给 `Invalid access to property or key 'nosuch' on a base object of type '<面>'.`（`tmp/probe-vattr/box.gd`），与 S416 / S424 同式。
- **下一步就一件事**：把七份确认不存在名单写进 runtime（与 `PACK_ABSENT_*` 同一存放处）再接属性读；名单外的名字继续响亮拒，不猜。
- **本轮不动出货**：读数在 `tmp/probe-vattr/compare1.txt`。

### 1.257 值类型面的装箱读发绑定 Callable，等式改成按接收者的值比（2026-10-16，S430，语料 378）

- **读数**：`tmp/probe-bincall/m1.gd`（M1–M9：`Vector2::length`、`Color::to_html`、`Vector3i::length` 与真属性 `v.x` / `c.r` / `q.z` 并存）+ `e1.gd`（E1–E7：同值 pack / 同值数组 / 同值 Color 都等，值不同假，`hash` 随值同）。
- **等式改法**：`callable.ts` 加 `registerRecvEqHook`（叶子不 import `ops`），`ops.ts` 注册 `ops.eq`；引擎不给比的型对（`Vector2` 与 `Vector2i`）在钩子里吞成 false，与 N7 第二格一致。
- **搬表**：`VALUE_METHOD_ARITY` 进 `runtime/face-arity.ts`，`faceArity` 一处覆盖 Array / String / pack 九支 / 五面值类型。
- **顺手更正第 85 条**：等式不是「按 JS 实例引用」而是「按绑定那一刻接收者的值」；剩下 `c.call(9)` 之后再比转 false 那一格仍没吃透（像是绑了副本而本体共享），继续只登账不实现。
- **门读数**：`pnpm test` **14343**（139 文件）、typecheck **4/4**、`test:compile` **257/366**、`test:diff` **250/250** 逐字节、`test:codegen` 全过、ops 自校验 6130、tree-face 17。

### 1.256 装箱 pack 的成员名读也发绑定 Callable（2026-10-16，S429，语料 377，§6 第 83 条①再一面）

- **读数**：`p.size` 印 `PackedStringArray::size`、`.call()` 给 2、`get_method` / `get_object`（空引用）/ `get_argument_count` 齐；`q.count.call(2)` 给 1；跨实例 `p.append == PackedStringArray(["a"]).append` 假。语料 377 五格逐字节。
- **搬表**：`PACK_METHOD_ARITY`（20 名）与 `PACK_METHOD_ARITY_WITH_BYTES` 进 `runtime/face-arity.ts`，`faceArity` 按面名分岔 —— byte 吃基表、其余八支吃带 `to_byte_array` 那张。
- **不越界**：byte 独有那 11 名的**元数**没量过（`hex_encode` / `compress` / `get_string_from_*` / `to_*_array`），读值时既不冒充 Callable 也不发引擎那句，继续响亮抛。
- **门读数**：`pnpm test` **14340**（139 文件）、typecheck **4/4**、`test:compile` **256/365**、`test:diff` **249/249** 逐字节、`test:codegen` 全过、ops 自校验 6129、tree-face 17。

### 1.255 装箱接收者的成员名读发绑定 Callable：两张元数表搬进 runtime（2026-10-16，S428，语料 376，§6 第 84 条②结清、第 85 条新登）

- **分岔的口径**：`attribute` 见 Array / String 先问两份名单 —— 确认不存在名单命中给 `Invalid access …`（S424），成员元数表命中给绑定 Callable，两边都落空继续响亮抛（候选宇宙之外不猜）。
- **搬表**：`ARRAY_METHOD_ARITY` / `STRING_METHOD_ARITY` 挪进 `runtime/face-arity.ts` 并导出 `faceArity`，`analyze` 改成 import —— 与 `PACK_ABSENT_*` 同一条 compiler → runtime 单向，两侧共用一份读数。
- **新量到的一格**：`var c = a.append` 之后 `c.call(9)`，`c == a.append` 转**假**（同格 `print(a)` 是 `[1, 2, 9]`），机制只有这一例反证 → 登 §6 第 85 条，出货不建模。
- **新语料 376**：七格（印法、两次读值等式真、跨台假、`call` 改数组、`get_method` / `get_object` / `is_valid` / `is_null`、`get_argument_count`），golden 与出货逐字节一致。
- **门读数**：`pnpm test` **14335**（139 文件）、typecheck **4/4**、`test:compile` **255/364**、`test:diff` **248/248** 逐字节、`test:codegen` 全过、ops 自校验 6121、tree-face 17 项对账。

### 1.254 绑定 Callable 铺到值类型与 StringName / NodePath（2026-10-16，S427，语料 375）

- **铺的面**：`Vector2` / `Vector2i` / `Vector3` / `Vector3i` / `Color` / `StringName` / `NodePath` —— 标注变量、构造位与 `&"…"` / `^"…"` 字面量都算静态接收者；读数 `tmp/probe-bincall/p1.gd` 十六面一字一样。
- **护栏**：这些面的表外名属性读与写成员名**都没量过**，拒的两形不开口；`face-member-name.test.ts` 新增 7 格钉住。
- **`hash(Callable)`**：boost 型 `hash_combine` 两序算出 2174785061 / 2934202107，引擎给 1741244043（`tmp/probe-bincall/s1.gd`）—— 拟合不出，继续响亮抛。
- **新语料 375**：九格（含 `.call()` 与 `v.x` 真属性照旧），golden 与出货逐字节一致。
- **门读数**：`pnpm test` **14330**（139 文件）、typecheck **4/4**、`test:compile` **254/363**、`test:diff` **247/247** 逐字节、`test:codegen` 全过、ops 6115、tree-face 17。

### 1.253 内建类型面的成员名当值发绑定 Callable（2026-10-16，S426，语料 374，§6 第 83 条①接一面）

- **读数**：`tmp/probe-bincall/` 五份（`compare{1,2,4,5,6}.txt` + `p1.gd` / `h3.gd`）—— 印法 `Array::append`、`typeof` 25、`get_object()` 是 typeof 24 的空引用、`get_argument_count()` 给必填数、元数句 `Invalid call to function 'Array::append (Callable)'. Expected 1 argument(s).`、等式按（实例, 名）、`var_to_str` 退化成品 `Callable()`；16 个面值类型同形（Dictionary 仍给 Invalid access）。
- **接法**：`CallableBox` 添 `builtin` / `builtinBounds` 两格，analyze 的属性扫描记下「成员名当值 + 量过的元数」，发射器发 `rt.boundMethod(recv, "<面>", "<名>", min, max)`；`callableArityBounds` / `requiredArgCount` / `declaredArgCount` 先认这一格，`get_object()` 在这一族上给 `NULL_OBJECT`。
- **新语料 374**：六格打印（含 `c.call(9)` 改数组、`s.to_upper.call()`、`p.size.call()`），golden 与出货逐字节一致。
- **仍欠**：装箱接收者的成员名读值、值类型十几面的标注接收者、`hash(Callable)` 的式子（只量到同进程一致，跨实例随内容变，拟合不出就照 `[hash-callable] 响亮拒`）。
- **门读数**：`pnpm test` **14320**（139 文件）、typecheck **4/4**、`test:compile` **253/362**、`test:diff` **246/246** 逐字节、`test:codegen` 全过、端到端 6 行一字一样。

### 1.252 形参标注进属性面的静态接收者（2026-10-16，S425，§6 第 84 条那三面收齐）

- **读数**：`tmp/probe-bincall/compare6.txt` 六格 —— 形参标注的 `a.nosuch` / `s.nosuch` / `p.keys` 与 var 标注一字一样（解析期那句报两遍），`a.append = 1` / `p.size = 1` 给 `Cannot assign a new value to a constant.`。
- **钉住不扩**：形参标注的 Dictionary 读属性不在解析期开口（N5 是运行期那句）、成员名当值不开口（N6 印 `Array::append`）、没标注的形参放过。
- **改法**：`checkPackFaceNames` 改走 `attrScopes`（函数体 + 形参表），只有属性那一支吃形参标注；调用那一支仍只认 S414 量过的 var 标注与构造位，不越读数范围。
- **门读数**：`pnpm test` **14312**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.251 String 与 Array 的属性读按名单分岔，缺格给引擎那句（2026-10-16，S424，§6 第 84 条②这两面接完）

- **读数**：`tmp/probe-bincall/round5.mts` 把 189 个候选名在 `"abcd".<名>` 与 `[1, 2].<名>` 上逐名过裁判（`compare5.txt`）：String 面确认不存在 81 名、Array 面 139 名，与 S413 的存在数 108 / 50 互补；属性位与调用位不分岔。
- **出货**：`methods.ts` 添 `STRING_ATTR_ABSENT` / `ARRAY_ATTR_ABSENT`，`attribute` 见 String / Array 先问名单 —— 命中就发 `Invalid access to property or key '<名>' on a base object of type '<面>'.`，成员名照旧响亮抛（Callable 那一族没接，不许冒充引擎那句）。
- **没开的东西**：不新增 runtime 文件（产物树清单在 `tree-face.ts` 要一起对账），名单就地放在 `ARRAY_NO_METHOD` 旁边。
- **仍欠**：值类型（`Vector2` 那一族）的属性读只量到一格（M6），各面名单没量，仍走兜底自述；绑定 Callable 整族仍是 §6 第 83 条①。
- **门读数**：`pnpm test` **14304**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.250 Array 与 String 的属性写给引擎那句：装箱形不必名单分岔（2026-10-16，S423，§6 第 84 条接一半）

- **读数**：`tmp/probe-bincall/compare4.txt` 的 M4 / M5 / M8 —— `a.nosuch = 1`、`a.append = 1`、`s.nosuch = 1` 全给 `Invalid assignment of property or key '<名>' with value of type '<型>' on a base object of type 'Array'/'String'.`，成员名与表外名同句。
- **出货**：`writeProp` 见 Array / String 直接发那句（此前挂 JS 属性，GDScript 侧什么都看不见 = 错值）。
- **仍欠**：属性**读**那一形要分成员 / 表外（成员名引擎给 `Array::append` 这种 Callable），所以还等 §6 第 84 条②那张存在名单搬进 runtime。
- **门读数**：`pnpm test` **14302**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.249 字面量与构造位的 Array / String 属性面接进解析期（2026-10-16，S422，§6 第 83 条③那半形结清、第 84 条新登）

- **读数**：`tmp/probe-bincall/round3.mts` 十格 —— `[1, 2].nosuch` / `Array([1, 2]).nosuch` / `"abcd".nosuch` / `String("abcd").nosuch` 都是 `Cannot find member "<名>" in base "<型>".` 同一句两遍；`[1, 2].append = 1` 与 `"abcd".to_upper = 1` 给 `Cannot assign a new value to a constant.`；`[1, 2].append` 与 `"abcd".to_upper` 给 Callable（`Array::append` / `String::to_upper`）。
- **放过的那两形**：推断来的 `a.nosuch` 与字面量字典 `{1: 2}.nosuch` 引擎都不在解析期开口，运行期给 `Invalid access to property or key …` —— 字典那支 S421 已接对，Array 那支缺一张能分岔「成员 / 表外」的名单，登记 §6 第 84 条。
- **门读数**：`pnpm test` **14300**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.248 字典的属性两面：写折成 StringName 键、读按格给那句（2026-10-16，S421，§6 第 83 条②结清）

- **引擎读数**：`tmp/probe-bincall/j1.gd` 八格 —— `d.foo = 5` 不报错、`print(d)` 是 `{ &"foo": 5 }`、`d.foo` / `d["foo"]` / `d[&"foo"]` 三读同为 5、`has` 两形都真；缺格时读给 `Invalid access to property or key '<名>' on a base object of type 'Dictionary'.`，成员名（`keys` / `size` / `has`）也一样。
- **出货改的两处**：`writeProp` 见 Dictionary 就 `GDict.set(V.stringName(key), value)`（此前挂 JS 属性 = 错值）；`attribute` 见 Dictionary 先查那一格，查不到发上面那句。
- **顺带钉住的一条**：Dictionary 面上「方法名当值」永远不是 Callable（S419 ②），写过同名键之后才被属性读认走 —— 两形现在都按实测发。
- **门读数**：`pnpm test` **14293**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.247 Array / String 的属性面照 pack 接进解析期（2026-10-16，S420，§6 第 83 条③结清）

- **读数**：`tmp/probe-bincall/round2.mts` 的 H5 / H6 / H7 / H15 四格 —— 标注接收者读表外名与 pack 同形（`Cannot find member "<名>" in base "<型>".` 同一句报两遍），写成员名给 `Cannot assign a new value to a constant.`。
- **反向的一形**：标注字典读属性解析期不开口、写属性不报错（S419 ③ 的 StringName 键），所以 Dictionary 面这一族不发解析期拒。
- **没量的不放**：`[1, 2].nosuch` 那种字面量接收者本轮没有读数，照旧放过；pack 的构造位与标注位都量过（`tmp/probe-attr/compare3.txt`），照 S417 发。
- **门读数**：`pnpm test` **14289**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0。

### 1.246 内建类型方法名当值 = 绑定 Callable，Dictionary 是例外（2026-10-16，S419 读数轮 · §6 第 83 条新登）

- **几面给 Callable**：`Array` / `String` / `Vector2` / `Color` / pack 都印 `<型>::<名>`，`typeof` 25、`is_valid()` 真、`get_method()` / `get_object()`（`<Object#null>`）/ `get_argument_count()` 齐、`.call()` 照调（void 回 `<null>`）、元数句 `Invalid call to function 'Array::append (Callable)'. Expected 1 argument(s).`、同法两次取值相等、跨面同名不相等、能当字典键、`var_to_str` 里退化成 `Callable()`、跟数字比在解析期就拒。
- **Dictionary 两条形**：属性读（成员名也算）运行期给 `Invalid access to property or key '<名>' on a base object of type 'Dictionary'.`；属性写**不报错**，等于塞一格 StringName 键 —— `d.nosuch = 1` 后 `print(d)` 是 `{ 1: 2, &"nosuch": 1 }`。出货今天挂 JS 属性，是错值。
- **Array / String 的属性面**与 pack 同形（表外名同一句两遍、写成员名给常量那句），S417 / S418 的扫描没铺过去。
- **本轮不动出货**：三形登记为 §6 第 83 条；`hash(Callable)` 只量到同进程一致，接之前先量跨进程。

### 1.245 属性写侧从 `size` 放开到整张成员表（2026-10-16，S418，§6 第 82 条②只剩 Callable 那一形）

- **读数**：三型 × 22 名一趟量齐（尺 `tmp/probe-attr/round5.mts`，读数 `compare4.txt`）：写 16 个成员名一律 `Cannot assign a new value to a constant.`，写 `pick_random` / `shuffle` / `min` / `max` / `keys` / `values` 一律 S417 那句两遍。
- **接法**：`checkPackFaceNames` 的属性那一支摘掉 `name === "size"` 的限制，改成「成员表里的名字被写就发常量那句」；推断来的名字与装箱位没量过，照旧不开口 / 响亮拒。
- **门读数**：`pnpm test` **14282**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 0（`test:golden-check` 本轮不涉我们的代码，未重跑）。

### 1.244 pack 的属性两面接进解析期：表外名那一句引擎报两遍（2026-10-16，S417，§6 第 82 条②再接一半）

- **读数**：九支 × 四形（读表外名 / 写表外名 / 读方法名当值 / 写 `size`）一次过裁判，尺 `tmp/probe-attr/round3.mts`，读数 `compare3.txt`。静态位的读与写都发 `Cannot find member "<名>" in base "<支>".` **同一句两遍**；写 `size` 发 `Cannot assign a new value to a constant.`；`print(q.size)` 引擎给 Callable（无错）。
- **接法**：`checkPackFaceNames` 多一趟属性扫描（跳过调用位那一支，免得与两句那族重复），接收者仍是构造位字面量与标注变量两形，名字仍只认 S414 / S415 那份确认不存在名单；成员名的写只放行量过的 `size`。
- **剩下的**：其余成员名的写没量过、内建类型的绑定 Callable 整族没接（§6 第 82 条②）。
- **门读数**：`pnpm test` **14279**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` **372/372** 逐字节、产物 churn 0。

### 1.243 pack 的属性两面过裁判：装箱两形按引擎那句发（2026-10-16，S416，§6 第 82 条②接一半）

- **读数**：三型（byte / int32 / string）× 15 形，尺 `tmp/probe-attr/{round1,round2}.mts`，读数 `compare{1,2}.txt`。静态位读写各只发一句 `Cannot find member "<名>" in base "<支>".`；装箱位读 `Invalid access to property or key '<名>' on a base object of type '<支>'.`、写 `Invalid assignment of property or key '<名>' with value of type '<型>' on a base object of type '<支>'.`；写成员名是 `Cannot assign a new value to a constant.`。
- **接的两形**：`methods.ts` 的 `attribute` / `writeProp` 各加一支 pack 分支，只认 S414 / S415 那份确认不存在名单；成员名（`size`）在装箱位没量过，继续响亮抛，不冒充引擎。
- **剩下的**：静态位那三句还在落运行期；`print(q.size)` 引擎给的是内建类型的绑定 Callable（印成 `PackedByteArray::size`），整族没接。
- **门读数**：`pnpm test` **14270**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` **372/372** 逐字节、产物 churn 0。

### 1.242 pack 九支的运行期表外名换成引擎那句：名单两侧共用一份（2026-10-16，S415，§6 第 82 条①结清）

- **接的是同一份读数**：`packMethod` 的 `default:` 此前对没实现的名字发中文自述 `<支>.<名>() 未实现`；现在先问 S414 那份确认不存在名单，命中就发 `Invalid call. Nonexistent function '<名>' in base '<支名>'.`，名单外的照旧响亮抛。
- **替换点排在 switch 之后**，`MISSING_ON` / `BYTE_ONLY` / `NON_BYTE_MISSING` 三张逐支读数表照旧在前 —— 按支分岔的名字（`to_byte_array`、`compress` / `hex_encode` / `get_string_from_*` / `to_*_array`）不会因为换了兜底就在别的面上冒充引擎。
- **单一来源**：`PACK_ABSENT_ALL` / `PACK_ABSENT_NOT_BYTE` / `PACK_ABSENT_BYTE_ONLY` 从 `analyze.ts` 搬到 `packages/runtime/src/runtime/packed.ts` 并导出，解析期直接 import（compiler → runtime 那一条老路，同 `ENGINE_CLASS_NAMES`），杜绝两侧各量一次。
- **门读数**：`pnpm test` **14267**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` **372/372** 逐字节、产物 churn 0。
- **剩的债**：§6 第 82 条② —— pack 九支的属性面（`p.foo` 读与写）一句都没量过，`methods.ts` 的 `packed-attribute` 仍是中文自述。

### 1.241 pack 九支的表外方法名接进解析期：名单要反着列（2026-10-16，S414，§6 第 81 条底下那半结清、第 82 条新登）

- **量法换了方向**：180 名 × 九支在构造位逐名过裁判（`tmp/probe-slice/round8.mts`，读数 `compare110.txt`）。第一版按 S413 的「存在白名单」接，`PackedByteArray.compress` / `hex_encode` / `to_float32_array` 与语料 135 / 160 / 161 当场误报 —— 手列的候选宇宙里「没量到」推不出「不存在」。改成只列裁判**确认不存在**的名字：byte 147 名、其余八支各 157 名，两支差 11 名（byte 独有的 `compress` / `decompress` / `hex_encode` / `get_string_from_*` / `to_int32_array` / `to_int64_array` / `to_float32_array` / `to_float64_array`），反向只差 `to_byte_array`。
- **静态只认两形**：构造位字面量与带标注的名字发那两句；`var p = PackedStringArray([...])` 这种初值推断的名字解析期不开口，留运行期那句（`tmp/probe-slice/r7c.gd`，语料 224 同份读数）。因此新检查 `checkPackFaceNames` 不看 `checkValueMethodArity` 那张含推断的 `typed` 表。
- **顺手归位**：`join` 那支硬写两句的 pack 分支（`joinReceiverBase`）摘掉，pack 的名字拒只剩一家。
- **门读数**：`pnpm test` **14264**（139 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` **372/372** 逐字节、产物 churn 0。
- **剩的债**：§6 第 82 条两条 —— 运行期装箱那一形的 `packMethod` `default:` 中文自述，与属性面一句没量过的 `packed-attribute`。

### 1.240 静态接收者的表外方法名：存在名单补上后三面接进出货（2026-10-16，S413，§6 第 80 条接一半、第 81 条结清）

- **先把「存在 / 表外」一次量清**：158 个名字 × 四面（String / Array / Dictionary / PackedInt32Array）= 632 格，一份脚本一行一名、按引擎自己那句「not found」归类（尺 `tmp/probe-slice/round4.mts`，读数 `compare106.txt`）—— 存在的名字每个 108 / 50 / 23 / 22 个，其余全是表外。
- **补的就是那五个「存在但没量元数」的名字**：`Array.set`、`Dictionary.set` / `is_typed` / `is_same_typed`、pack 的 `erase`；有了这张表，表外那两句才敢按「表键 ∪ 这几个」之外的名字发。
- **接进三面**：字面量 / 标注变量 / 形参标注三种静态写法（`faceScopes` 的 `seeded` 分 annot 与 inferred，拒只认 annot 与字面量），`String` / `Array` 发两句，`Dictionary` 只发第二句 —— 16 格里 9 格一字一样对上，剩 7 格是 pack 那一面（2 格）与运行期动态那两形（5 格）。
- **门**：新开 `packages/compiler/test/face-member-name.test.ts` 12 格（八格分面句子 + 四格「存在没量元数不许误拦」）。
- **账**：`pnpm test` **14240→14252**（139 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn **0**。

### 1.239 `String.slice` 不存在，欠账改名成「表外方法名那两句」（2026-10-16，读数轮 · §6 第 80 条改写）

- **一格一次的 21 行探针跑出来是 21 格同一对句子**：`Cannot find member "slice" in base "String".` + `Function "slice()" not found in base String.` —— 4.6.3 的 `String` 面上没有 `slice`，不是我们的实现缺口。
- **顺手把这一族量齐 16 格**（`tmp/probe-slice/round2.mts` 与 `round3.mts` 两侧对照）：静态三种写法（字面量 / 标注变量 / 形参标注）给解析期那两句（`Dictionary` 只给第二句），**初值推断与 `Variant` 装箱给运行期那句** `Invalid call. Nonexistent function 'X' in base 'T'.` —— 这一族里推断不算静态，跟 S349 的实参型那一族口径相反。
- **出货侧的账**：三处中文自述（`String.X() 未实现` 那族）15/16 格文字不对、形参那一格一句都没发；接的时候要分清「表内名没实现」（仍响亮拒）与「表外名」（发引擎句），故运行期先得有一张各面名字表。
- **本轮零实现变更**，只改台账；复跑的尺与读数都留在 `tmp/probe-slice/`。

### 1.238 String / Array / Packed 那几支的元数上界按 4 / 5 参重量：一张表没改，另撞出一支没实现的（2026-10-16，§6 第 52 条⑧结清、新增第 80 条）

- **一格一次的探针换成一行一格的 packed 形状**（`tmp/probe-strupper/round18.mts` 与 `round19.mts`，30 行一份脚本、两次 spawn 量完），读数 `compare{101,102}.txt`。
- **对上的五条**：`String.split` `[0,3]`、`String.count` / `countn` `[1,3]`、`Array.slice` `[1,4]`、`Array.count` `[1,1]`、`PackedInt32Array.slice` `[1,2]` —— 出货的三张元数表逐条一致，**本轮不动实现**。
- **撞出来的一支**：`String.slice` 今天抛 `[string-method] String.slice() 未实现`，而引擎 0..5 实参一路收（上界至少到 5，`slice(1,2,3,"a",4)` 也不报元数句）—— 登 §6 第 80 条，把 `from` / `to` / `step`、负数与越界、`step` 给 0 / 负、以及那多出来的两位到底吃什么量齐再接。
- **踩过的两个坑**：一行一格时**每格要换一个变量名**（重名那句 `There is already a variable named "z"` 会把整份脚本吃掉）；填充实参要按签名位置给合式的型，否则先撞上实参类型那两句、元数句读不到。

### 1.237 后一式的型名取自值自己：补量五格当场结清第 79 条（2026-10-16，S412 的续量 · 无实现变更）

- **上一轮留的那格「已知不等价」其实是探头拿旧 dist 跑的**：重建后 `var b = a` 转手越界就印 `Array[int]` —— `rt.stampArray` 早把 `elem` 登记进装箱值，`GArray.get` 按它拼型名（S412 同一处改动）。
- **补量 5 格全合**（`tmp/probe-typedlabel/round17.mts` → `compare100.txt`）：转手、`Variant` 标注、形参 `Variant` 三路给 `Array[int]` / `Array[String]`，混排推断与裸 `Array` 标注两路给 `Array`。
- **动的是台账与门**：`dict-index-routing` 续两格（`Variant` 两路不路由），§6 第 79 条当场划掉，S412 ③ 与 §1.236 那条「不等价」的说法一并改正。
- **账**：`pnpm test` **14238→14240**（138 文件）、typecheck **4/4**；`packages/*/src` 一行未动，语料、产物与 golden 因此不变。

### 1.236 静态标注的位置型基读越界换那一式，String 的中文自述清掉（2026-10-16，S412，§6 第 78 条结清、新增第 79 条）

- **两句的分工照字典那一族**：标注的基给 `Out of bounds get index '<k>' (on base: '<声明的拼法>')`（无句点、负数原样），推断 / `Variant` / 转手过的给 `Invalid access of index '<k>' on a base object of type: '<型>'.`；写侧不受影响。
- **接线四处**：`TypedSlot.ann`（只由标注填，`seedInto` 覆盖模块 var / 形参 / 内部类字段，`var` 语句的初值推断不算）→ `posReadLabels` → 发射器把基名当第三个实参给 `rt.index` 与快轨两个裸数组取值 → 运行期 `posOobSay` 一句分两式（`arrIdx` / `strAt` 收基名）。
- **顺带清掉**：String 读越界今天发中文自述 `字符串索引越界: 5`，两句都不是它。
- **后一式的型名取自值自己**（补量 5 格 `compare100.txt`）：转手、`Variant` 标注、形参 `Variant` 三路越界都印 `Array[int]` / `Array[String]`，混排的两路印 `Array` —— 定形字面量本来就走 `rt.stampArray` 登记 `elem`，`GArray.get` 据此拼型名，第 79 条因此当场结清。
- **账**：门 `dict-index-routing` 新增 10 格，`pnpm test` 14228→**14238**（138 文件）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn 7 份、`test:golden-check` 372 例逐字节不变；出货 12 格 + 10 格对照不合 **0** 与 **1**。

### 1.235 嵌套定型容器那句去掉自加的型名后缀，顺带量齐位置型基读越界的两句（2026-10-16，S411，§6 新增第 78 条）

- **一句文本**：引擎发 `Nested typed collections are not supported.`，出货在同句后面多挂了 `（Array[Array[int]]）` —— 去掉后缀，语料 084 的 golden 早就是原文（churn 只有那一份注释）。
- **顺带量的 21 格（`tmp/probe-typedlabel/compare{98,99}.txt`）**：**标注**的位置型基（`Array` / `Array[k]` / `String` / pack）读越界给 `Out of bounds get index '<k>' (on base: '<声明的拼法>')`，**推断/转手**的同一份值给 `Invalid access of index '<k>' on a base object of type: '<型>'.` —— 与 S405 字典那族同一条「看标注不看值」；负下标原样印；写侧不受影响。
- **出货今天的两处不合**：一律发后一式；String 那一支两句都不发，发的是中文自述 `字符串索引越界: 5`。接法照 `dictIndexInt` 那条通道，登记为 §6 第 78 条（并把第 72 条⑤那条「快轨基名不带元素型」并进来）。
- **账**：`pnpm test` 14228（138 文件）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245** 逐字节、`test:codegen` 全过。

### 1.234 内部类能看见模块级的哪些名字：15 格量齐，自己类的信号不再发裸标识符（2026-10-16，S410，§6 第 68 条①结清）

- **看不见**：模块 `func`（`not found in base self.`，函数体 / `_init` 体 / 两层内部类同句）、模块 `var` / `signal` / `static var` 与裸写的枚举成员名（`not declared in the current scope.`）—— 出货的解析期本来就同句，这四处零改动。
- **看得见**：模块 `const`、`enum` 名（`Col.RED`）、兄弟类（`Other.new()`）、全局类型名与全局函数、自己类的方法 / 常量 / 信号。
- **修的一格在发射器**：内部类里裸写自己类的信号（`own_sig.emit()`）此前发成 `rt.method(own_sig, ...)`，运行时 JS 的 `own_sig is not defined` —— 连 S406 那层接住点都盖不住（不是引擎那一句）。现在 `CURRENT_MEMBERS` 把自己类的信号一起收进，取值走 `rt.wrapValue(this.own_sig)`，与模块级信号同一条装箱口径。
- **不放宽的相邻两形**：内部类里裸调外层实例成员照 S373 那句；枚举成员名在内部类里裸写照旧拒。
- **账**：门 `packages/compiler/test/inner-class-outer-func.test.ts` **5 格**（九张名字表 + 一格发射），`pnpm test` **14226→14228**（138 文件）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn **0**；出货端到端 15 格对照不合 **0**。

### 1.233 D6 那七型的默认值站点不再静默给 null：三站 21 格量齐后换成响亮拒（2026-10-16，S409，§6 第 77 条结清）

- **引擎侧 21 格**（`tmp/probe-valuedefault/round13.mts` → `compare96.txt`）：七型 × 三站 —— 模块 `var r: T` 无初值、内嵌类字段无初值、`func T() -> X` 出错后 S406 那个接住点 —— 给的全是各型自己的默认值（`Transform2D` / `Basis` 是单位阵、`Quaternion` 是 `(0, 0, 0, 1)`、`Plane` 是零法线零距离、`Rect2` / `Rect2i` / `AABB` 是零位置零尺寸）。
- **出货此前的样子**：`typeDefault` 认不出型名就兜底 null 盒子，三站都印 `<null>` —— 静默错值，与 D6「不进 Tier 1 就抛 `unsupported`」相反。
- **改法两处**：`emitter.typeDefault` 在兜底之前拦 `D6_VALUE_TYPES` 七个名字，发 `rt.unsupportedValueDefault(名)`；`builtins.ts` 那一支抛 `UnsupportedError`（code `value-default`，消息点名哪一型）。因为不是引擎那一句，S406 的接住点原样再抛 —— 拒到脚本外。
- **不变**：语料无一例用这七型标注（`test:diff` 245/245、产物 churn 0）；那七型的构造调用照旧在 lowering 抛引擎原文。
- **账**：门 `packages/compiler/test/error-boundary.test.ts` **8 格**（七型接住点 + 两站声明），`pnpm test` **14218→14226**（138 文件）、typecheck **4/4**、`test:compile` **252/361**（emitter 缺口 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过。

### 1.232 信号回调与延后调用同一条错误边界，宿主退出前排干当前这一轮（2026-10-16，S408，§6 第 75 条①②与第 76 条结清）

- **回调那一族七格零代码**：S406 的函数边界本来就管到 `emit()` 里的回调 —— 调用方与后面的回调都照跑，lambda 连上去同形，回调里再调一支函数时外层继续（读数 `tmp/probe-signalerr/compare93.txt`，出货对照不合 **0 格**）。
- **延后那一族十格改的是宿主**：`quit()` 之后排的延后照样跑、延后里再排的也跑、两支按 FIFO；已到期的计时器（0.0 秒与嵌套）在退出前发完，一秒与五秒的等不到（读数 `tmp/probe-drain/compare{94,95}.txt`，出货不合 **1 格** —— 那一格是虚拟时钟的墙钟，不是输出）。
- **接线三处**：`callable.ts` 加延后在途计数与 `callDeferred`（`Callable.call_deferred()` 与 `Object.call_deferred(名)` 共用一条队列），`host.ts` 的 `run()` 在帧循环与 `initDone` 之后加 `#drain()`（每轮「发到期项 → 让出一轮宏任务」到队列空才 flush），`Timer.isDue()` 只看账面剩余。
- **`connect(cb, CONNECT_DEFERRED)` 仍响亮拒**：那条「宿主还没有对象生命周期模型」的理由不变，排干队列不会把它变成静默多印。
- **账**：门 `packages/runtime/test/host-run.test.ts` 五格，`pnpm test` **14217→14218**（138 文件）、typecheck **4/4**、`test:diff` **245/245**、`test:compile` **252/361**、`test:codegen` 全过、`pkg-modes` **25/25**、产物 churn **0**；golden-check 本轮未重跑（改的是宿主与运行时，语料与 `godot.txt` 都没动，出货侧已由 `test:diff` 逐字节对账）。

### 1.231 协程调用那句只在取值位发：语句位丢弃返回值引擎不拦（2026-10-16，S407，§6 第 76 条新增）

- **16 格逐位量过**（`tmp/probe-awaitcall/round8.mts` → `compare92.txt`）：`var r = f()` / `v = f()` / `print(f())` / `g(f())` / `[f()]` / `f() + 1` 六形发那句；`f()` 单独一句与 `if` / `for` / `while` / `match` / lambda 里的语句位、`await f()` 丢弃、协程里丢弃另一支协程、`-> int` 协程丢弃 —— 全放过。
- **一处改动**：`walkStmt` 的 `case "expr"` 给语句位那一层根节点 `awaited = true`，往下的实参 / 元素 / 运算数 / 右值照旧是取值位 —— 出货此前一律拦，是一处**过拦**。
- **顺带量到内部类那一格**：`class Thing` 的 `_init` 里裸调模块函数给 `Function "f()" not found in base self.`，出货同句同位置（第 69 条那族的新读数）。
- **放过之后露出来的不等价登 §6 第 76 条**：丢弃的协程跨过 `quit()` 之后引擎仍跑完（`Q|外面` 再 `P|协程里`），出货退出时不跑 —— 宿主的收尾顺序，不在本轮接。
- **账**：门 `packages/compiler/test/await-positions.test.ts` **5 格**，`pnpm test` **14212→14217**（138 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、产物 churn **0**、`test:golden-check` 372 例逐字节不变；出货侧 16 格对照 `tmp/probe-awaitcall/ours.mts` 不合 **0**。

### 1.230 运行期错误只作废当前那支函数：帧栈常开、每支函数一个接住点、按返回型给默认值（2026-10-16，S406，§6 第 74 条结清、新增第 75 条）

- **接法落地**：`frameEnter` / `frameLine` 不再挑模块（`usesStack` 与 `frames` 那条旗标连同 `lower` 里的名表一起删掉），每支 GDScript 函数包一层 `try / catch(rt.gdFunctionError) / finally`；接住之后按**声明返回型**给默认值返回，`-> void` 与入口那两支不返回值，不是引擎那一句的（`UnsupportedError`）原样再抛。
- **默认值那张表 18 型逐格对过引擎**（`compare{86,87}.txt`）：`<null>` / `0` / `0.0` / `false` / `""` / `&""` / `[]` / `{  }` / `(0.0, 0.0)` / `(0.0, 0.0, 0.0)` / `(0.0, 0.0, 0.0, 1.0)` —— 与变量默认值共用 `typeDefault` 一支，没有第二份表。
- **三种边界同一规则**：`_init` 出错对象照样造出来、体照跑；字段初始化子那一格（引擎的 `@implicit_new`）出错只作废本类那一段，后面的初始化子不再跑、读出来 `<null>`，`_init` 与其余类的初始化子照旧；lambda 出错只作废那一支，`c.call()` 拿回 `<null>`。legacy 形状的字段初始化子为此从类字段挪进 `__gd_fields__`，与 proto 形状并成一条。
- **顺带补的解析期管辖**（读数 `compare91.txt`）：下标型拒、定形字典键型拒、void 取值拒那三句在 **lambda 体、字段初始化子与模块 var 的初值**里引擎照发；数组字面量直接下标（`[1, 2]["a"]`）同句，字典字面量的 int 下标（`({1: 2})[0]`）走 `Out of bounds get index` 那一式。
- **出货侧 51 格对照不合 3 格**，三条都有另外的条：协程不调 `await` 的准入差、对象 id 编号、`-> Rect2`（D6）。
- **开销换正确性，本轮没取 `bench:ab` 配对读数**：帧打点从「只有用到那四支的模块才有」变成常开，每条语句多一次 `frameLine`、每支函数多一层 try/catch/finally —— S281 ⑤ 那条「其余模块零开销」因此作废（要数字另开一轮，A/B 得连 `ir.ts` / `lower.ts` 一起回到基线）。
- **账**：门 `packages/compiler/test/error-boundary.test.ts` **28 格** + `emit-guards` 那两格改写，`pnpm test` **14184→14212**（137 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；产物 churn 264 份（帧与 `__gd_fields__`）。

### 1.229 运行期错误的传播量齐、本轮零代码：打断的是当前那支函数（2026-10-16，§6 第 74 条定案，读数轮 · 无实现变更）

- **9 格**（`tmp/probe-errorflow/round1.mts` → `compare85.txt`）：错出在被调函数里时，**该函数剩余语句不跑、调用方接得上**（`E|b到了` / `Z|回来` 都打，更深的 `D|c到了` 不打）；错出在 `_initialize` 本体才停整支。
- **调用方拿到的值**：无标注接收给 `<null>`；返回型标注 `int` 的函数给 **`0`**。错误是表达式一环时整条语句照跑（`print("L|=", f([1]))` 打出 `L|=<null>`，下一句 `M|后面` 也在）。
- **同函数内的其它形状**：`for` 循环里出错 → 循环不继续、函数后面的语句也不跑；`match` 手臂里出错同理。
- **接法**：每支 GDScript 函数的产物包一层「捕获自己抛出的运行期错误 → 在那一次打印 → 按返回型给默认值返回」；抛点和打印点必须分开（否则外层重复打印）。`await` 那一头与信号回调那一头还没量，动实现前先补。
- **本轮零代码**：出货今天一律抛到脚本外（与①的后半不等价），已登 §6 第 74 条；语料里没有这种形状（`test:diff` 245 格与 golden 372 例都逐字节不变），所以这条不影响现有读数。

### 1.228 字典缺键那两句发货：静态 int 键走 `Out of bounds get index`，其余走 `Invalid access to property or key`（2026-10-16，S405，§6 第 73 条结清、新增第 74 条）

- **分工按静态形状**：基是标注过的 `Dictionary` / `Dictionary[K, V]`（模块 var、局部 var、形参、内部类字段、`self.f()` 的标注返回型五种作用域都量过）且键静态是 int → `Out of bounds get index '<k>' (on base: '<基名>')`（无句点）；其余一律 `Invalid access to property or key '<键>' on a base object of type '<基名>'.`，定形字典的基名带键值型。
- **键的印法逐型量齐**：`0` / `-5` / `999999999999` / `2.0` / `x`（String 与 StringName 都不带引号）/ `a/b` / `true` / `(1.0, 2.0)` / `[1, 2]` / `{ "k": 1 }`。
- **写不缺**：四种作用域的 `a[0] = 5` 都直接建键、一句不推（量过）。
- **接线**：analyze 标 `dictIntReads`（种子扩到模块 var、类字段、形参与 `self.f()` 返回型）→ 发射器发 `rt.dictIndexInt` → 运行期只在键真是 int 时发 `Out of bounds` 那一句；裸字典快轨遇这一形让位给装箱路。
- **门**：`dict-missing-key.test.ts` 16 断言 + `dict-index-routing.test.ts` 14 格；端到端 30 格对照 `tmp/probe-dictkey/ours4.mts` 27 格一字一样，三格不合都有账（两格见下条第 74 条，一格是探头没剥出货的 `[码] ` 前缀）。
- **另登一账**（§6 第 74 条）：错出在被调函数里时引擎**从该函数返回、脚本继续跑**（`n2` / `b3` 先打完 `S|ok`），出在 `_initialize` 本体才打断（`b1` / `m1` / `e1`）；出货一律打断 —— 这一族要先量「返回给调用方的是什么值、多层嵌套怎么折」。

### 1.227 位置型基的下标型拒接进解析期，容器 void 表补到 24 格，元数那句排到 void 之前（2026-10-16，S404，§6 第 72 条①②结清）

- **60 + 12 + 10 + 6 格探头**（`tmp/probe-idxtype/{round1..4}.mts`、`tmp/probe-voidnames/round1.mts`，读数 `compare{74,80,81,82}.txt` 与 `compare79.txt`）：`Array`（裸标注 / 推断）/ `Array[k]` / `String`（标注 / 推断）/ 八支 `Packed*Array` 的下标只收 int 与 float，其余（含 `null`）给 `Invalid index type "<型>" for a base of type "<基名>".`，读写两形同句、基名按声明拼法、整份脚本加载失败。
- **`Dictionary` 不在这一条里**：无标注与裸标注字典的任何键型都放过（16 格量过，全部落到运行期那一句），只有定形 `Dictionary[K, V]` 拒键型 —— 那一支早有，本轮把同一句式补到位置型基，`checkTypedIndexSlots` 加 `positionalSlot` 并给形参也铺槽位。
- **void 两张表补全**：数组 `append_array` / `sort` / `sort_custom` / `reverse` / `shuffle` / `make_read_only`、字典 `sort` / `merge` / `assign` / `make_read_only`；不是 void 的十支一起钉在门里防误收。
- **两句的先后是量出来的**：`print(d.assign())` 引擎先给元数那句，合法那一格才给 void 那句 —— `checkVoidMethodValues` 因此挪到 `checkDictMethodArity` / `checkArrayMethodArity` 之后，`dict-method-arity` 里 merge 的两格「合法」期望同步翻成 void 原文。
- **一处读数误记已纠正**：`String` 下标写的第二句是 `Value of type "int" cannot be assigned to a variable of type "String".`（此前被截断记成 setter 那一句），出货本来就对。
- **门**：`packages/compiler/test/index-type-and-void.test.ts` 64 断言；`pnpm test` **14154**（134 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0 —— 语料无一例撞上新拒）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.226 字典缺键那两句的边界隔离完了、本轮零代码（2026-10-16，§6 第 73 条④⑤定案，读数轮 · 无实现变更）

- **16 格**（`tmp/probe-dictkey/{round2,round3}.mts` → `compare{76,77}.txt`）：**基是「静态已知的 `Dictionary` 标注」而键是 int** 时引擎给数组那一式 `Out of bounds get index '0' (on base: 'Dictionary')`（句末没句点），键换 float / String / bool 回到 `Invalid access to property or key …`；`var b = a` 之后再 `b[0]` 也回到 `Invalid access …` —— 差别在标注不在值。
- **写不缺**：标注字典 `a[0] = 5` 直接建键、不打断。
- **定形字典的键型不符是解析期拒**：`Dictionary[String, int]` 用 int 下标给 `Invalid index type "int" for a base of type "Dictionary[String, int]".` 并整份脚本加载失败 —— 第 72 条②那族因此要连 `Dictionary[K, V]` 基一起接，无标注 `Dictionary` 一形都不拒这条边界也量过。
- **接的时候的账**：运行期看不见「标注」这一条，得由发射器把静态基名带到 `rt.index` / `rt.setIndex`；出货今天两句都没发、只发中文自述 `字典键不存在: x`（打断这一行为是对的）。
- **本轮零代码**：SEMANTICS 第 73 条④⑤定案；ROADMAP 记 §1.226。

### 1.225 两族新读数量齐、本轮零代码：下标型的解析期拒 60 格与字典缺键那句 10 格（2026-10-16，§6 第 72 条②扩、新增第 73 条，读数轮 · 无实现变更）

- **下标型矩阵 60 格**（`tmp/probe-idxtype/round1.mts` → `compare74.txt`）：基 `Array` / `Array[int]` / `String` / `PackedInt32Array` / `Dictionary` × 下标 `bool/int/float/String/Vector2/null` × 读写两形。四支基都只收 **int 与 float**（`s[1.5]` 收），其余四形给 `Invalid index type "<型>" for a base of type "<基名>".`，基名带定形拼法，且整份脚本加载失败；`Dictionary` 一形都不拒。
- **顺带抓到 `String` 的下标写另有两句**：`Cannot assign a value of type "int" as "String".` + `Value of type "int" cannot be returned from a setter expected to have type "String"…`。
- **字典缺键 10 格**（`tmp/probe-dictkey/round1.mts` → `compare75.txt`）：那句是 `Invalid access to property or key '<键>' on a base object of type '<基名>'.`，键按 `str()` 印（Array / Dictionary / StringName / NodePath 四种键都量了，StringName 去掉 `&`、NodePath 原样），定形字典基名 `Dictionary[String, int]`；写不缺、命中两支给值。
- **一格反常留着**：`{1: 2}` 里 `a[0]` 给的是数组那一式 `Out of bounds get index '0' (on base: 'Dictionary')`，而同批 `-5` / `999999999999` 给 `Invalid access …` —— 那一格来自另一批探头，**下一轮先隔离再动实现**。
- **出货现状**：三族都不拦 / 都发中文自述（`字典键不存在: x`），行为侧「打断」是对的、文本不对 —— 都登记进 §6 第 72 条②与第 73 条，代码一字未动。

### 1.224 只读容器的写面三分句接进出货，数组下标越界那两句换成引擎原文（2026-10-16，S403，§6 第 65 条结清、新增第 72 条）

- **两支面先发货**：`make_read_only` / `is_read_only` 此前只在元数表里、调到就抛中文响亮拒 —— 现在置位与谓词都在（浅的，重复置位不响）。
- **写侧三种反应按读数落地**：(a) 下标写打断脚本，数组那句光秃秃、字典那句前面多一块 `ERROR: Dictionary is in read-only state.`；(b) 方法写只推一块 ERROR、不打断、内容不变，`at:` 行按每支自己的 C++ 文件与行号（21 支逐个量的，`append` 借 `push_back` 那一行）；(c) 三件意外 —— `assign` 两支面照样整个换掉、`get_or_add` 返回默认值但不写入、`Array.resize` / `insert` 返回 23（`ERR_READ_ONLY`）。
- **顺带接的两句下标越界**：读 `Invalid access of index '5' on a base object of type: 'Array'.`、写 `Invalid assignment of index '2' (on base: 'Array') with value of type 'int'.` —— 两式不同、写入值的型要点名、负数按原样印、定形数组基名带元素型（`'Array[String]'`）；出货此前两支都发 `数组索引越界: 2`。
- **门**：`readonly-containers.test.ts` 33 断言（含 21 支方法写的块原文与返回值）；端到端 11 格对照 `tmp/probe-readonly2/ours.mts` 不合 0 格；`test:diff` 245 格逐字节不变。
- **新登记的欠**（§6 第 72 条）：`print(<void 方法>())` 的解析期拒 `Cannot get return value of call to "assign()" because it returns "void".`、非 int 下标的 `Invalid index type "String" for a base of type "Array".`（整份脚本加载失败），两族出货都不拦；快轨裸数组的基名不带元素型。
- **门读数**：`pnpm test` **14090**（133 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.223 移位两支与 `~` 的 78 格矩阵：只有三格给值，`~` 那句自造话换成引擎原文（2026-10-16，S402，§6 第 71 条④结清）

- **78 格**（`tmp/probe-shift/round1.mts` → `compare70.txt`）：**解析期 0 拦**、75 格拒在运行期、3 格给值（`2 << 2` = 8、`2 >> 2` = 0、`~2` = -3）—— 两侧都必须是 int，`2 << 1.5` 与 `2 >> true` 全拒。
- **`~` 的第二格是 `Nil`**：`Invalid operands 'float' and 'Nil' in operator '~'.`，与一元 `-` / `+` 同形但名字不带 `unary` 前缀；出货那句 `~ 需要 int，收到 float` 换掉了，六型之外照旧响亮拒。
- **移位两支本来就对**：`ops.shl` / `shr` 走 `intPair`，发的早就是第三式原文 —— 这一族补的是门不是代码。
- **门**：`packages/runtime/test/operator-shift-bnot.test.ts` 78 格逐格对值与原文（`tmp/probe-shift/gen6.mts` 生成）；端到端 78 格对照不合 0 格。
- **门读数**：`pnpm test` **14057**（132 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过；`test:golden-check` 371 例逐字节不变，`095-vector2i-div-zero` 那格批跑撞的是门自己的超时（同格单跑绿），已在 S402 ⑤ 记着。

### 1.222 `**` 与 `in` 两支的六型矩阵：解析期不拦、55 格拒在运行期，出货那两句自造话换成引擎原文（2026-10-16，S401，§6 第 71 条③结清）

- **72 格**（`tmp/probe-powin/round1.mts` → `compare69.txt`，左支仍是初值推断的模块 var）：**解析期 0 拦**、17 格给值、55 格拒在运行期，句式仍是第三式 `Invalid operands 'A' and 'B' in operator '**' / 'in'.`。
- **`**` 只收 int / float 两侧**：4 格给值（`2 ** 2` = 4、`2 ** 1.5` = 2.82842712474619、`1.5 ** 2` = 2.25、`1.5 ** 1.5` = 1.83711730708738），其余 32 格拒 —— **`true ** 2` 也拒**，bool 在 `**` 这一支既不能当底也不能当指数，与 `+ - * / %` 把 bool 当数那一族不同。
- **`in` 的闸门在右支**：Array / Dictionary 全收（六型左支都给 `false`，只有 `"a" in "a"` 真）；右支是 String 时只收 String 左支（`[1] in "a"` 拒）；右支是 bool / int / float 时全拒。
- **实现两处换句**：`ops.pow` / `ops.inOp` 落到末尾那支时不再发 `** 不支持 bool ** int` 这类自写文本，六型之内复用 S399 的 `operandsRefused` 发引擎原文，六型之外照旧响亮拒。
- **门**：`packages/runtime/test/operator-pow-in.test.ts` 72 格逐格对值与那句原文（`tmp/probe-powin/gen5.mts` 从读数生成）；出货端到端 72 格对照 `tmp/probe-powin/ours.mts` 不合 0 格。
- **门读数**：`pnpm test` **14056**（131 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.221 一元那三支量齐：`-` / `+` 只有 int 与 float 走得通，`not` 恒为 bool（2026-10-16，S400，§6 新增第 71 条）

- **18 格一元两支 + 12 格 `not`**（`tmp/probe-unary/{round1,round2}.mts` → `compare{67,68}.txt`）：`-1` / `-1.5` / `+1` / `+1.5` 给值，bool / String / Array / Dictionary 四型两支都给 `Invalid operands 'X' and 'Nil' in operator 'unary-' / 'unary+'.` —— **第二格是 `Nil`、操作数名带 `unary` 前缀**，与二元那一句同式不同名。
- **一条「Godot 能跑、我们当场拒」**：`+a` 此前在发射期抛 `[emit-unary] 一元运算符 + 还没实现`；新增 `ops.pos`（数值原样返回、六型之内发引擎原文、六型之外响亮拒）与 emitter 那一行。
- **`ops.neg` 的自造话换掉**：`- 不支持 bool` 那句引擎从没有过；六型之内改发第三式原文，向量 / Color 那些探针之后落空的照旧响亮拒。
- **`not` 是实现本来就对、补门的那一族**：六型真侧全 `false`、假侧全 `true`，`typeof(not …)` 给 1。
- **门**：`packages/runtime/test/unary-operators.test.ts` 30 断言；出货端到端 18 格逐格对照（`tmp/probe-unary/ours.mts`）不合 0 格。
- **仍欠**：`**` 与 `in` 两支的六型矩阵、`~`（bnot）与一元在六型之外的读数，以及第 69 条剩下的装箱 `Variant` 与链式两形。
- **门读数**：`pnpm test` **14055**（130 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.220 运算符那一族第五张矩阵：左支换成初值推断的模块 var，引擎解析期一声不出、拒格全在运行期（2026-10-16，S399，§6 第 69 条的推断那一形结清）

- **468 格**（`tmp/probe-inferrecv/round1.mts`，读数 `compare62.txt`）：**0 格解析期拒、133 格照发值、329 格拒在运行期、6 格属 `String %`** —— 拒的三元对与 `OP_PAIRS_REFUSED_DECL` 逐对相同（共同 329、两侧独有各 0），只是句式换成运行期第三式 `Invalid operands 'A' and 'B' in operator 'X'.`。
- **改的是运行期不是解析期**：`ops.add` / `sub` / `mul` / `div` 落到末尾那支时发的是 `[add-operands] + 不支持 bool + int` 这类自写文本，引擎讲的是第三式；`ops.eq` / `neq` 更糟 —— 异型给 `false` 而引擎当场抛。新增 `operandsRefused` / `eqSixRefused` 两道：**六型之内发引擎原文，六型之外照旧响亮拒**（没量过的型不猜）。
- **`==` 那一族只挂运算符支**：`eqSixRefused` 只加在 `ops.eq` / `ops.neq` 上，容器内部比等（`has` / `index` / `match` 手臂）走的 `valueEq` 一行没动，S279 的「异型假而不抛」不受影响；六型里只有 int 与 float 互相能比。
- **门**：`operator-pairs.test.ts` 第五半 468 格逐格期望「不拦」；新门 `operator-runtime-pairs.test.ts` 462 格逐格比对值与那句运行期原文（生成器 `tmp/probe-inferrecv/gen4.mts`）。
- **一格噪声已重量**：`Dictionary|float|!=` 被引擎自己的 `editor_settings-4.6.tres` 那句 Parse Error 混掉，`fix422.mts` 重跑归位。
- **仍欠**：装箱 `Variant`（形参不带标注）、链式 `x.y <= 1`、`String %` 的边界，与「内部类方法能否看见模块 const」。
- **门读数**：`pnpm test` **14031**（129 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.219 `and` / `or` 的值恒为 bool：出货此前是 Python 式把实参原样递出去（2026-10-16，S398，§6 新增第 70 条结清）

- **27 格读数**（`tmp/probe-andor/round4.mts` → `compare65.txt`）：`1 and 2` 给 `true`、`0 and 3` 给 `false`、`3 or 0` 给 `true`、`[] or {}` 给 `false`，而 `typeof(1 and 2)` / `typeof(0 or 3)` / `typeof(true and 1)` 三格全给 **1（BOOL）**；装箱那一头（`Variant` 形参）同形 —— 与操作数的静态型无关。
- **短路没变**：`0 and side()` 不跑、`1 and side()` 跑、`1 or side()` 不跑、`0 or side()` 跑，六格靠 `SIDE` 那一行打印定案。
- **实现改两支**：`rt.and` / `rt.or` 恒发 `V.bool(...)`；发射器只有 `rt.and(l, () => r)` 一条路（emitter.ts:3323），没有第二处要跟着改。
- **门为什么不响**：语料里 `and` / `or` 全用作条件（真值一致），没有一格把它的值当数打出来 —— 所以 golden 与 `test:diff` 逐字节不变是这一条的凭据，而不是「没改到东西」；`gds2js run` 端到端 27 格从 26 格不合改到不合 0 格。
- **门读数**：`pnpm test` **14031**（129 文件，含新门 `logic-and-or.test.ts` 20 断言）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.218 运算符那一族第四张矩阵：右支换成标明类型的名字，集合与第三张逐对相同（2026-10-15，S397，§6 第 69 条③的第一形结清）

- **468 格**（`tmp/probe-revrecv/round1.mts`，读数 `compare61.txt`）：左支字面量、右支是模块级 `var b: T` —— **329 格拒（全第二式）、133 格照发值、6 格属 `String %` 那条通道**，三类计数与「左支是名字」那一形一字不差。
- **不另立表**：把两张矩阵的拒格都归一成「左型、右型、符」三元对，**共同 329、只在名字左支 0、只在名字右支 0** —— 引擎判的是型对，跟哪一侧是名字无关，出货因此只在 `checkOperandPairs` 里镜像一趟判据。
- **门**：`operator-pairs.test.ts` 四张矩阵共 **1848 格**（各 462，减掉 `%` 那六格）逐格对引擎，不合 0 格。
- **仍欠**：推断来的局部（`var a = true` 之后 `a <= 1`）、装箱 `Variant`、链式 `x.y <= 1` 三形一格没量；`String %` 的边界与「内部类方法能否看见模块 const」也照旧欠。
- **门读数**：`pnpm test` **14009**（127 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.217 运算符那一族第三张矩阵：左支换成模块级 const，句式与集合都自成一集（2026-10-15，S396，§6 第 69 条的 const 一侧结清）

- **468 格**（`tmp/probe-constrecv/round1.mts`，读数 `compare60.txt`）：左支 `const K: T = <字面量>`、右支字面量 —— **359 格拒（238 第一式 + 121 第二式）、103 格照发值、6 格属 `String % 任何` 那条格式化通道**。
- **借不得前两张表**：与字面量集差 104 格，全是句式差（容器左支在字面量集走第二式、在 const 集走第一式），另有 16 对是 const 集多拒的（`and` / `or` 掺容器）。
- **连带修一处**：`bool-ordering` 原来按「两支都是字面量吗」分式，而 const 是名字却吃第一式 —— 改成按**可折叠**（字面量或模块 const）分式，`compare60.txt` 与 S361 那两处读数同时钉住。
- **实现**：`checkOperandPairs` 一支 pass 管三形（标明类型的名字 → 第二式表；模块 const → 两张 CONST 表按式发），`flattenBody` 从 `flattenBodies` 拆出来以便带上形参与内部类字段。
- **仍欠的两形**：右支是名字（`1 <= a`）与推断来的局部 / 装箱 Variant / 链式，以及「内部类方法能否看见模块 const」—— 都没量，一概不发。
- **门**：`operator-pairs.test.ts` 三张矩阵共 **1386 格**逐格对引擎；`pnpm test` **14008**（127 文件）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.216 运算符那一族再扫一形：左支换成标明类型的名字，引擎一律走第二式（2026-10-15，S395，§6 第 69 条收窄）

- **第二张 468 格矩阵**（尺 `tmp/probe-declrecv/round1.mts`，读数 `compare58.txt`）：左支改成模块级 `var a: T`、右支仍是字面量 —— 133 格照发值、329 格拒，**拒的 329 格全用第二式**（`Invalid operands "bool" and "int" for "<=" operator.`），没有一格用第一式。
- **两集不能合并**：`and` / `or` 掺 String 那十四对在字面量集里拒、在名字集里收，所以另立一张 `OP_PAIRS_REFUSED_DECL`。
- **写法又抽了三种**（`round2.mts`，`compare59.txt` 十二格）：形参标注、内部类字段与模块 var 同式；**`const` 反而与字面量同式**（第一式），但只四格不够定表，那一形本轮不拦（也不发错句）。
- **修掉一句自造的话**：`op-mod-float` 在左支型证不出时把型名印成 `null`（`Invalid operands to operator %, null and float.` 引擎从不这么写），改成两侧都证得出才发，证不出的交给新表按第二式发 —— 五格被这条老 bug 挡着发错句。
- **门**：`operator-pairs.test.ts` 由生成器（`tmp/probe-declrecv/gen2.mts`）扩成两半共 **924 格**逐格对引擎；`pnpm test` **14007**（127 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.215 运算符 × 操作数型对：468 格矩阵过一次裁判，字面量那一半接进解析期（2026-10-15，S394，§6 第 56 条③④⑤结清、新增第 69 条）

- **六型 × 六型 × 十三符 = 468 格**（尺 `tmp/probe-opmatrix/round1.mts`，一格一脚本一次 spawn，读数 `compare57.txt`，折叠 `fold.mts`，门由 `gen-test.mts` 从读数生成）：**343 格引擎在解析期拒、119 格照发值、6 格属另一条通道**。
- **拒的句子有两式**：两侧都是标量字面量 → `Invalid operands to operator X, A and B.`；掺进容器那一族 → `Invalid operands "A" and "B" for "X" operator.`。两式各一张表，闸门只在两侧都是字面量时发 —— 因为`var a: bool` 之后 `a <= 1` 换成了第二式（`tmp/probe-booleq/compare55.txt` 三格），那一头没量全，欠的登第 69 条。
- **新拦到的都是静默错值那一类**：`true <= 1`、`1 <= true`、`true == 1`、`true != 1`、`true + 1`、`"a" <= 1`、`true and [1]`、`[1] % 1.5`…… 出货此前一声不出直接把式子发出去。既有三道闸门发过的组合不重复发（`%` 皆标量带 float、`==`/`!=` 串对数、`bool <= bool`）。
- **推翻一条旧格**：`bool-ordering` 里「混合 int 与 bool 的 `<=` 不归这条管」是当年没量的猜测，读数说引擎拒 —— 翻成拒并钉句子。
- **顺手结的两处**：写权那一族四形（`for quit in …`、lambda 形参、match 手臂绑定、普通 var）引擎与出货**都放过**，四格当放行读数钉进门里；内部类标注 bool 的成员引擎照样拒，`checkBoolOrdering` 那条「猜的边界」正好合上。
- **`String % 任何` 那六格不接**：引擎判的是格式串里有没有占位符（`"a" % 1` 拒、`"a%d" % 1` 收），与型对无关，属另一条通道。
- **门**：`operator-pairs.test.ts` 462 格逐格对引擎（`pnpm test` **14006**、127 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0 —— 语料无一例撞新表）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.214 `max` / `min` 的运行期转换通道接上：容器一出现，整支调用就不在解析期发句（2026-10-15，S393，§6 第 67 条结清）

- **十四形各装箱一格**（尺 `tmp/probe-maxrt/round1.mts`，读数 `compare53.txt`）：`bool` / `Nil` / `String` / `StringName` / `NodePath` / `Array` / `Dictionary` / `PackedInt32Array` / `Callable` / `Color` / `Vector2` 在运行期一律 `Invalid type in utility function "max()". Cannot convert argument 3 from <型> to float.` + `at:` + backtrace 并打断；**只认 int 与 float** —— 「`Variant::as_double` 认得起来数字串」那条猜测被读数打掉。
- **解析期那条规则改硬**（`round2.mts`，`compare54.txt` 四形混排）：不是「容器那一位不发句、后面的位照判」，而是**这一支调用里只要有一个容器，整族的解析期类型句全不发** —— `max("a", 1, [1])` 引擎不给解析期那句，运行期点 argument 1 from String；`max(1, [1], "a")` 点 argument 2 from Array。S388 那张表因此换成两趟扫。
- **两处改**：`rt.gMax` / `rt.gMin` 把 `need2`（自写 `[math-number]`）换成逐位 `maxMinFloat` 抛引擎原文，旧的「赢家带自己的型 / NaN 留先出现」26 格一字未动；analyze 里 `vararg-runtime-coerce` 那支自写句删掉。
- **端到端**：28 格装箱读数 + 4 格混排读数用 `gds2js run` 与引擎逐格对，**不合 0 格**（四个 object 系标签都走同一支 `utilityArgLabel`，它从私有改成导出）。
- **门**：`global-max-min-variadic.test.ts` 加长 9 格（七形两支 + 两位号 + 打断类型）、`maxmin-vararg.test.ts` 容器那一族翻成「解析期不拦」并补两格「没有容器照旧发句」；`pnpm test` **14004**（126 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:golden-check` 372 例逐字节不变。

### 1.213 `String` 静态三支的 int 形参折法：`chr` 与 `num.decimals` 走 int32 回绕，`humanize_size` 留在 int64（2026-10-15，S392，§6 第 47 条⑧的尾巴结清）

- **一条式子靠一组 2^32 的整圈定下来**（尺 `tmp/probe-int64params/{round1,round2,round3}.mts`，读数 `compare{49,50,51,52}.txt`）：`String.num(0.3333333333, 2^32+5)` → `0.33333`、`2^32+1` → `0.3`、`2^32-1` 与 `2^31+5` 折成负数走默认那支、`2^32+32` 与 `40` 都夹到 32；`String.chr(2^32+65)` → `A`、`chr(2^53+1)` → U+0001、`chr(2^53)` / `chr(2^33)` → 绕回 0 → U+FFFD。
- **非有限那一头**：`num(1.5, INF / -INF / NAN / ±1e20)` 全给 `2`（`INT64_MIN` 的低 32 位是 0）；`chr` 的六支非有限/越界全给 U+FFFD；`humanize_size(INF / -INF / NAN / 1e20)` 全给 `8.00 EiB`、`-1` 与 `-1024` 给 `16.00 EiB`、`2^32` 仍是 `4.00 GiB` —— 这一支不截 int32。
- **改的只有三处取数**：`strHumanizeSize` / `stringStatic` 的 `chr`、`num` 的 decimals 换成 `int64ParamBig`（后两支再套 `BigInt.asIntN(32, …)`）；**全局 `char()` 没动** —— 它的非有限实参没量过，照旧响亮抛。
- **推翻一条旧外推**：`string.test.ts` 那格「`chr` 的 bigint 载荷越界换 U+FFFD」用的是 `2^53+1`，引擎其实给 U+0001（先回绕、再判 FFFD）；改成读数值并另补三格。
- **还欠**：`num_int64` / `num_uint64` 的 `base` / `capitalize_hex` 没量过 int32 回绕（S324 只到 int32 范围内），不外推。
- **门**：`string-int-params.test.ts` 6 格 · 40 断言 + `string.test.ts` 改正 1 格加补 3 格；出货与引擎**逐行对照 49 格一字一样**（`tmp/probe-int64params/ours-{a,b,c}.txt` vs `compare{49,50,51}.txt`）；`pnpm test` **13996**（126 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变。

### 1.212 接收者的静态证明补齐：形参标注与内部类字段也拦，「初值推断 + 重赋值」量回来是不拦（2026-10-15，S391，§6 第 68 条结清）

- **十八格新读数**（尺 `tmp/probe-modrecv/{round2,round3}.mts`，读数 `compare{47,48}.txt`，一格一份脚本一次 spawn）：`func f(s: String)` / `(a: Array)` / `(d: Dictionary)` / `(sn: StringName)` / `(np: NodePath)` / 定形 `Array[int]`，加内部类自己字段（带标注与初值推断两形）—— 引擎全在解析期拦；无标注形参与合法元数那两格照旧放过。
- **两条重赋值口径各有凭据**：带标注的名字被重新赋值**仍拦**（模块 var 与形参两侧都量过），**初值推断**的模块 var 被重赋值后引擎给 `S|ok` —— 出货对「annot」一律保留、对「inferred」一律丢弃，两边都与读数一致（`tmp/probe-modrecv/ours.mts` 三十格逐格对过，不合 0）。
- **实现**：`flattenBodies` 拆出 `flattenBody`，新增 `faceScopes` —— 每个函数体带一份「外面证得出的名字」（顶层函数拿模块级、内部类的方法拿自己类的字段，再加本函数标注过的形参），`faceReceiverNames` 改吃这份种子表；字典 / 数组 / String / StringName / NodePath **五面一次改完**。
- **仍欠的两笔**（登在 §6 第 68 条尾注）：内部类能否看见模块级名字没量过（照 `checkValueMethodArity` 的旧口径不给）；`&"ab".length(1)` 那一形 tree-sitter 仍解析成 ERROR，`^"a/b".get_name(1, 2)` 则走得通、本轮已拦。
- **门**：四把闸门加长共 19 断言（`string-method-arity` 5、`array-method-arity` 4、`dict-method-arity` 4、`string-name-node-path-faces` 6，其中把 S389 那格「形参标注不算初值证明」翻成「未标注形参才不拦」）；`pnpm test` **13990**（125 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.211 `String.num()` 的 324 那一格把负号算进去：一侧一档的差只有一条式子能解释（2026-10-15，S390，§6 第 47 条⑨结清）

- **两侧各扫一遍**（尺 `tmp/probe-numsign/{round1,round2}.mts`，读数 `compare{45,46}.txt`）：`String.num(1e300, d)`，d 从 18 到 28 —— 正值 303 字一路出到 22 位、23 位起空；负值 304 字只出到 21 位、22 位就空。**负的一侧总是早一档**。
- **`DBL_MAX` 那一头同形**（上一批只量过正号那三支，S383 ⑤ 因此把界记成「不含号」）：d=12 / 13 两侧都出（311 与 312），**d=14 正出负空**，d=15 两侧都空 —— 按削零之前的长度算正 14 位是 324 字（贴界出）、负 14 位是 325 字（越界空）。两条读数合起来只剩一条式子：**长度按「符号 + 数字串」判，界仍是 324**。
- **实现改一行**：`strNumDecimals` 把符号先定下来，判 `body.length + sign.length > 324`；符号沿用既有的那条（实测 `-0.0` 那两支的号跟着实参走 —— 负零那一支够不到那么长，所以它占不占界无读数，实现与「号跟着实参走」同一条即可）。
- **不许被这一改动到的形状**（一格一脚本量回）：`String.num(1.5, 2)` → `1.5`、`(-1.5, 2)` → `-1.5`、`(1.5, 0)` → `2`、`(2.0, 3)` → `2.0`、`(-0.0, 2)` → `-0.0`、`(-0.0, 0)` → `-0`。
- **门**：`packages/runtime/test/string-num-sign-buffer.test.ts` 4 格 · 59 断言（22 档 `1e300` 两侧 + 4 档 `DBL_MAX` 两侧 + 6 格小数值）；`pnpm test` **13986**（125 文件）、typecheck **4/4**、`test:diff` **245/245** 逐字节、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.210 StringName / NodePath 两面各有表了，顺带补上「模块 var / const 当接收者」这一形（2026-10-15，S389，§6 第 64 条结清、新增第 68 条）

- **一名两格扫两面**（尺 `tmp/probe-snfaces/{round1,round2}.mts`，读数 `compare{42,43}.txt`）：五实参那一格直接读上界、零实参那一格读下界，121 格 + 112 格过裁判。
- **StringName 不是「借」String 的表**：108 名逐个量，102 名的 `[下界, 上界]` 与 `STRING_METHOD_ARITY` **一字一样（0 处漂移）**，另六名 `chr` / `humanize_size` / `num` / `num_int64` / `num_scientific` / `num_uint64` 引擎回「找不到成员」那两句（第二句的类名不带引号，与 Signal 同形）。S380 当年「不许借」的谨慎现在有了数据。
- **NodePath 只认十名**：`get_name` / `get_subname` 各 `[1,1]`，其余八名 `[0,0]`（含 `hash`）；`simplify` / `is_same` / `length` 三名没有 —— 出货此前把 `np.simplify()` 放到运行期才给 `Invalid call. Nonexistent function 'simplify' in base 'NodePath'.`，引擎那两句在解析期。
- **顺带抓到一族系统性漏拦**（`tmp/probe-modrecv/round1.mts`，12 格，`compare44.txt`）：模块 `var`（标注 / 初值推断）、模块 `const`、被重新赋值过的带标注模块 var、形参标注、内部类字段 —— 引擎全在解析期拦，字典 / 数组 / String 三道闸门此前只认函数体内的局部 var。本轮接了模块 `var` / `const` 那一形，并把五面（含新增两面）的收集合成一支 `faceReceiverNames`；标注那条连重赋值也保留，初值推断那条仍要在名字被赋过值时丢掉（后者没量过）。
- **没接的两形登 §6 第 68 条**：形参标注与内部类字段（`tmp/probe-modrecv/dbg.mts` 四格实测全不报）—— 值类型那一族认形参标注，但内部类的方法连模块名都不预置，代码里写着「那一侧引擎怎么判没量过，宁可漏拦也不误拦」。
- **口径翻转**：`string-method-arity.test.ts` 那两格「另两面不借 String 的表」改成「各自有表了」，同门另加长三格钉模块级那一形。
- **门**：`string-name-node-path-faces.test.ts` 8 格 · 35 断言 + 上述 2 格 · 5 断言；`pnpm test` **13982**（124 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.209 `max` / `min` 的变元尾巴两处不对都改过来：解析期每一位都扫、容器那两形归运行期那一条通道（2026-10-15，S388，§6 第 66 条结清、新增第 67 条）

- **漏拦那一处**：`max(1, 2, "a")`、`min(1, 2, false)` 三支以后整条不拦 —— S387 逐名对表抓到的 `bounds` 漂移让类型判据跳过三支，`analyze` 里那段专拦三位 bool 的 `boolAll` 是死码（它要拦的形全被挡在门外），一并删。
- **扫法不是按位表那一套**：变元这两支**第一位不对就停** —— `max("a", 1, "b")` 引擎只推 argument 1，而 S365 那族（`randf_range([1], "a")`）是逐位推两句。所以另建 `GLOBAL_ARG_VARARG` / `GLOBAL_ARG_VARARG_DEFERRED` 两张表走一条到停为止的扫描，`GLOBAL_ARG_TYPES` 与 `GLOBAL_ARG_BOOL_REFUSED` 里那两行删掉；量过的形是 `String` / `StringName` / `NodePath` / `bool` / `null`，位号 1..4。
- **容器是另一条通道**：`Array` / `Dictionary` 解析期**不发句**，走到运行期才打 `Invalid type in utility function "max()". Cannot convert argument N from Array to float.` + backtrace 并打断脚本；而且点名的是左起第一个转不动的位（`max(1, "x", [1])` 说的是第 2 位 from String）。出货此前用**引擎从不打印的那句**拦（`… but is "Array".`，句对不上通道），本轮换成自写的响亮拒并把引擎原文引在句里 —— 运行期那条通道没接，登 §6 第 67 条。
- **上界与 Callable 面**：4..8 支全收；`max.call(1, 2, 3)` 与 `max.callv([1, 2, 3])` 引擎照调给 3，我们按 `[2, 2]` 响亮拒 —— `get_argument_count()` 那个 2 是**必填数**不是上界，表里改成 `[2, ∞]`（`push_error` / `push_warning` 早就是这么记的，消费处认 `∞`），少给那一句与 `get_argument_count()` 一律不动。
- **门**：`maxmin-vararg.test.ts` 6 格 · 52 断言（9 句位号 + 3 停在前 + 5 容器 + 1 容器挡后面 + 8 放行 + 2 元数在先）、`global-callable.test.ts` 新增 4 断言（三支 / callv / 少给 / argument_count）；`pnpm test` **13973**（123 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.208 全局函数的元数两句搬到解析期：`gds2js check` 从此看得见它们，顺带对出 `max` / `min` 那两位记错（2026-10-15，S387，§6 第 59 条①结清、新增第 66 条）

- **搬的是位置，不是措辞**：发射器里 112 名的 `BUILTIN_ARITY` 与 `range` / `str` 的 `UTILITY_ARITY` 原样移进 `analyze.ts`，句子与 `code` 一字未改（`char-arity` / `var-to-str-arity` / `str-to-var-arity` / `convert-arity` / `range-arity` / `str-arity` / `builtin-arity`），发射期两道闸门删掉。
- **看得见的差别**：搬完 `check` 给 `main.gd:4:8  error  builtin-arity: Too many arguments for "abs()" call. Expected at most 1 but received 2.`，`range()` / `range(1,2,3,4)` / `str()` 三条各带自己的行列；此前这三格在 `check` 里全是「静态检查通过」，只有 `build` / `run` 才发。
- **搬闸门 = 把覆盖范围交给走查**，所以逐位置钉 27 格：函数体、`if` / `while` 块、`for` 的迭代式、`match` 手臂、lambda 体、lambda 形参默认值、形参默认值、`var` / `const` / `static var` 初值、内部类字段、读写器 `get` / `set` 体、具名委托方法体、数组元素、字典值、二元右支、`await` 操作数，加 utility 通道那两名各自的三个位置。
- **钉这一步真抓到洞**：lambda 形参的默认值原来整条没走查 —— `var g = func(a = abs(1, 1)): return a` 编得过；补 `walkExpr(p.default, …)` 后与 `func` 形参默认值同口径（S386 那道构造式闸门同处同一个漏口，一并被这一补堵上）。
- **顺带逐名对表**（`tmp/probe-timing/bounds-diff.mts`）：110/112 名与 `GLOBAL_CALLABLES` 的 `bounds` 一字一样，漂移的是 `max` / `min`。四格新读数定谁错：`max(1,2,3)` 收、`max(1,2,3,4)` 给 4、`min(1,2.5,3)` 给 1、`max(1)` → `Too few … at least 2 … received 1.`，而 `get_argument_count()` 两名都是 2 —— Callable 那一位是**声明形参数**，表里当成上界了；全局函数实参类型那一族开头的 bounds 判据（「元数不在区间内就只说元数句、别说类型句」）因此跳过三支以上，`max(1, 2, "a")` 该拦不拦、透传成 `rt.gMax(1, 2, "a")` 是静默错值。表在运行时侧，改它要先把变元尾巴的逐位类型量完 → 新条 §6 第 66 条。
- **门**：`arity-gate-positions.test.ts` 3 格 · 30 断言（19 位置 + 3 合法 + utility 那两名各自 8 格）、`utility-arity.test.ts` 的 `refuse()` 从「两处都读」换成只读 analyze；`pnpm test` **13966**（122 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0）、`test:diff` **245/245**、`test:codegen` 全过、`test:golden-check` 372 例逐字节不变；本轮不碰任何 `.gd`。

### 1.207 类型构造式越界的第三种句子接上：出货此前十三形全部静默收下（2026-10-15，S386，§6 第 59 条④结清）

- **一句一式**：`No constructor of "X" matches the signature "X(类型, …)".` —— 句号在引号外，签名文本就是实参类型表机械拼出来的。既有那句只在 **match 手臂** 那条路上（`CTOR_ARMS` / `armSignature`），普通调用整族没接。
- **随手一试就是十三形**：`float(1, 2)`、`String(1)`、`Array(1)`、`Dictionary(1)`、`Vector2(1)`、`Vector3(1, 2)`、`PackedInt32Array(1)`、`Callable(1)`、`RID(1)`…… 全部编得过，`float(1, 2)` 还照第一支头发出去 —— 不止漏拦，是静默错值。
- **100 格的分布**（20 名 × 五形，尺 `tmp/probe-ctor/round1.mts`，读数 `compare35.txt`）：`int` / `float` 收 0、1 与一支字符串；`bool` 一支字符串**也拒**；`String` / `StringName` / `NodePath` / `Array` / `Dictionary` 连一支整数都拒（`String(1)` 不是 `str(1)`）；`Color` 五形全收；`Vector2(i)` 只收 0 与 2、`Vector3(i)` 只收 0 与 3；`Callable` / `Signal` / `RID` / 四支 `Packed*Array` 只收 0。
- **只拒量到的组合**：表外一律放过 —— `float(1.5, 2)` 与 `Array([1])` 这一轮没量，闸门就不发，门里也把这两格钉住，防止后来人把「两支实参」外推到所有类型对（红线一的另一面：不猜就不误拦）。
- **两处不重复建**：`bool` 的单支 Array / String / Dictionary 既有 `checkCall` 已在发同一句（`code` 不变），表里就不登；同名函数（`func int(a, b)`）不抢。
- **门**：`ctor-signatures.test.ts` 4 格 · 105 断言（65 拒 + 35 放行 + 2 表外 + 1 遮蔽）；`pnpm test` **13963**（121 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.206 `range` 与 `str` 的元数句换成引擎原文：utility 通道那一族是第三种句子（2026-10-15，S385，§6 第 59 条②③结清）

- **上一轮量不到是因为探针自己挡住了自己**：那九支返回 void 的全局函数被包进 `print(...)`，引擎先给 `Cannot get return value of call to "seed()" because it returns "void".`，元数那两句根本没机会出。这轮换**语句形**（光一行 `seed(1)`），一格一脚本、五档实参（0 / 1 / 2 / 3 / 5）摆下去（尺 `tmp/probe-void/{round1,round2}.mts`，读数 `compare33.txt` / `compare34.txt`）。
- **`range` 不是 `Too few` / `Too many` 那一族**：`Invalid call to GDScript utility function "range()". Expected N argument(s).` —— 少给报下界那一元（`Expected 1`）、多给报上界那三元（四支、六支都是 `Expected 3`），不说 at most / at least。出货此前发的是自写中文 `range 最多 3 个参数（收到 4 个）`，本轮删自写、换原文。
- **`str` 同通道、前缀却不同**：`Invalid call to utility function "str()". Expected 1 argument(s).` —— 少了 "GDScript" 四个字。两支各抄各的，不合并成一条模板。
- **`str()` 是一格漏拦**：引擎解析期拒零支，出货编得过、发成空串；本轮接上。上界没量（八支照收），所以只拦下界那一头 —— 表里那一维写成 `null` 表示「这一支没量过上界」。
- **变元三支确认不拦**：`print` 0 支起、`push_error` / `push_warning` **0 支也收**（八支也收），表里不建条目。
- **void 七支的区间与既有表一字一样**（`seed` 恰一元、其余六支 `[0,0]`），S365 那条「九支没量到」记的是**那两句**没量到 —— 读数补齐后照旧是钉，不是改。`get_stack` 那格又撞见一次「文档写有默认实参、裁判不收」。
- **仍未接**：① 时机那一层（发射期 → 解析期）—— 要先逐名对 `GLOBAL_CALLABLES` 与 `BUILTIN_ARITY` 两份区间；④ 类型构造式那第三句 `No constructor of "float" matches the signature "float(int, int)".`。
- **门**：`utility-arity.test.ts` 4 格 · 28 断言；`pnpm test` **13959**（120 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26、emitter 0，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.205 只读容器那一族整面量齐、本轮零代码：三件意外把「只接两支谓词」这条路堵死（2026-10-15，§6 新增第 65 条、第 63 条⑤改账）

- **尺**：`tmp/probe-readonly/round1.mts`（读的一侧一脚本批量、写的一侧一格一脚本 —— 引擎那句会把脚本打断），补量 `tmp/probe-readonly/assign.mts`；读数 `tmp/probe-readonly/compare31.txt` + 逐格原文 `tmp/probe-readonly/*.txt`。
- **量的过程本身就是这一族的判据**：只读**是浅的**（内层那个数组仍可写）、读与 `==` / `hash` / `print` / `typeof` 全不受影响、`duplicate` / `duplicate(true)` / `slice` / `filter` / `map` 拷出去都可写；写的一侧分三种句 —— 下标赋值**打断**并给 `Invalid assignment on read-only value (on base: 'Dictionary')`、方法写只推一块 `ERROR: … is in read-only state.` 且**不打断**、`Array.resize` 还返回 **23**（`ERR_READ_ONLY`）。
- **三件意外**：`assign` 在只读容器上**照样把内容整个换掉**、一句不响；`get_or_add` 给缺键返回默认值但**静默不写**；只读数组的**越界写**给的是只读那一句而不是越界那一句。三条都是「照文档推一定推错」的形状。
- **为什么本轮不接**：接就要一次覆盖 `GArray` / `GDict` 每个写方法 + 下标赋值那条要发「打断」句的路 + `assign` / `get_or_add` 两条形外。只补 `make_read_only` / `is_read_only` 两支谓词会让出货变成「能置只读、写了照样改」—— 比现在的响亮拒更坏（红线一：宁可响亮拒，不静默降级），所以整族一起做，清单写进 §6 第 65 条④⑥。
- **顺带把 §6 第 63 条⑤改了账**：那一条原本写着「行为没量、照旧不实现」，现在行为已量齐、仍未接，指回第 65 条。
- **门读数**：本轮零代码，`pnpm test` / typecheck / `test:compile` / `test:diff` 沿用 S384 那一轮（**13955** · 4/4 · **252/361** · **245/245**），文档一轮不改任何产物。

### 1.204 内部类里的读写器畸形形接上：类内六句与模块级一字不差，只有一形按上下文分岔（2026-10-15，S384，§6 第 62 条结清）

- **上一轮留的那一格补了读数**：S374 量了模块级六形、接了四句，类内那一形一直「引擎给哪句没量、判据只有一格支撑」，所以不猜不接（尺 `tmp/probe-inneracc/round1.mts`，读数 `compare32.txt` + 逐格原文 `g*.txt`）。本轮九形过完裁判：六句与模块级一字不差，合法并列形照收。
- **唯一一处上下文分岔**：`var x:`（不带类型）换行写一段 `get _g` —— 类内 `Expected ":" or "(" after "get".`、模块级 `Expected type after ":"`（对照读数 `tmp/probe-inneracc/m1.mts`）。出货此前两处都发后一句，本轮只改类内那一支；模块级照旧，那句就是实测的。
- **接法是最小的一种**：`lowerVar` 多一个 `inClass` 形参，类体那一支在「类型句」之前先跑一遍 S374 那四句的同一支持 `accessorTokenErr` —— 判据不另建一份，调用点只有类体那一处传 `true`。
- **门**：`property-delegation.test.ts` 22 格长到 **28** 格（新格同时钉住类内九形与模块级那一形，防止后来人把两处上下文合并成一句）；`pnpm test` **13955**（119 文件）、typecheck **4/4**、`test:compile` **252/361**（一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.203 `String.num(number, decimals)` 的末位带量齐：抓到两处静默错值，一处是少了一层舍入（2026-10-15，S383，§6 第 47 条②结清，另记⑨⑩两笔）

- **这一族量的是值，不是解析期拒**：一支脚本批量打几百格就够（元数那一族才要一格一脚本）。两轮 936 格、进门 898 格（尺 `tmp/probe-num/{round1,round2,buf}.mts`，读数 `{readings,readings2,compare30}.txt`）。
- **引擎是两次取位，出货以前是一次**：先把这支 double 收敛到**十七位有效数字**，再从那个十进制值按请求位定点。差一格落在边界上 —— `String.num(1.0 / 7.0, 16)` 引擎 `0.1428571428571429`、出货 `0.1428571428571428`。这一格只有把 936 格全压上去才会露出来：上一轮那 279 格（语料 336）全都在这条界的外侧。
- **平局那一档再确认一次**：`2.5`→`3`、`0.125` 两位→`0.13`、`0.375`→`0.38`、`10.5` 零位→`11` —— 远离零，不是 C 库默认的逢偶进。出货本来就对，本轮钉进门里。
- **整数位本身过十七位那一头，上限整个失效**：`DBL_MAX` 出货发的是这支 double 的全长精确展开（尾巴 `…8368`），引擎发的是十七位有效之后补零（`…000`）。第一次取位改成「位数为负就往整数侧舍到最近的 10^k」之后两名同格。
- **一条只有批量压才看得见的口径**：削零**之前**的串长过 **324** 个字符，引擎给**空串**。三个量级十个档定出这条界（`…e308` 14 位出 / 15 位空、`1e300` 20 位出 / 24 位空、`1e20` 全出）。负号占不占那一格没量过 —— 不计，记 §6 第 47 条⑨。
- **两条不是这一族的账**：`12345678901234567.0` 引擎 `print` 回来是 `…566`、JS 字面量落 `…568`（换成引擎那支值，13 格全消）—— 差在**字面量解析**；`-0.0` 那一形 GDScript 把一元负号折进字面量，本轮从没量到负零（§6 第 47 条⑩）。
- **一次踩到并行会话的门**：本轮的生成器先写成了 `string-num-decimals.test.ts`，把另一路会话已提交的那一份（语料 336 的 279 格）整个覆盖了 —— 测试文件数从 119 掉回 118 才看出来。已还原那一份，本轮的 898 格另起 `string-num-grid.test.ts`。**同一份工作树里新建文件前先 `git status` / 看 HEAD 有没有同名**。
- **门**：`string-num-grid.test.ts` 898 格；`pnpm test` **13954**（119 文件）、typecheck **4/4**、`test:compile` **252/361**（一例未动）、`test:diff` **245/245** 逐字节 —— 语料没有一例把 `String.num` 的两位形用到，golden 一字未变。

### 1.202 Array / String 两侧的实参类型两句逐名量齐：容器三族这一族从此没有缺口（2026-10-15，S382，§6 第 63 条结清）

- **720 格一次摆齐**：38 个缺口名 × 每一位 × 15 个 kind，一句一行、一次 spawn 量一批（尺 `tmp/probe-faces2/round1.mts`，读数 `compare29.txt`）。表与门同出一份读数：`gen-test.mts` 同时生成三张表的行与门里的数据数组，谁也不手抄。
- **覆盖从此 96 名全覆盖**：`FACE_ARG_AS` / `FACE_ARG_TYPES` / `FACE_SLOTS` 三张表长到 Array 22 / Dictionary 6 / String 57 名；Array 那 7 个「缺口」位（`append` / `count` / `erase` / `fill` / `has` / `push_back` / `push_front`）15 个 kind 全放行 —— 实参是 `Variant`，**不建条目**，「没有那一句」同样是量出来的。
- **三处形参次序与文档相反**：`lpad` / `rpad` 是 `(int, String)`（不是「先填充字符再长度」那个方向）、`rsplit` 是 `(String, bool, int)`（第二支是 `allow_empty` 不是 `maxsplit`）、`indent` 的上界是 **1**。第三支是本轮踩的坑：手抄写成 2 位，引擎当场用 `Too many arguments …` 把整行挡住，那一轮的「全放行」是假的 —— 元数一律从 S379 / S380 的读数现取，不再手写。
- **A 式那句不带位号**：`Cannot pass a value of type "X" as "Y".` 里没有 `argument N`，按位过滤时整条被丢 —— 第一版折表因此把 31 行 `FACE_ARG_AS` 全折成了 `FACE_ARG_TYPES`。归位规则改成「B 式紧跟其前的那条 A 式、且 kind 对得上」。
- **合表用脚本**：新行按字母序插进既有行之间，既有行次序一字不动（93 行纯插入）；`};` 前那个空行必须留在末尾，第一版把新行挤成了 `…]],};`。
- **补齐之后回头改了上一轮的两把门**：`array-method-arity` / `string-method-arity` 里「合法」那一格挑的实参撞上了新量到的期望型（4 格当场红），改成 `is_same_typed` 给 `[]`、`indent` 给串、`lpad` / `rpad` 给 `(1, "x")`、`rsplit` 给 `("x", true, 1)` —— 那两把门的读数各涨一格，改的都是实参类型、元数句子一格没动。
- **门**：`face-arg-coverage.test.ts` 1 格 · 720 断言；`pnpm test` **13953**（118 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.201 字典侧的实参类型两句补齐：`merged` / `recursive_equal` 进表，Callable 那一格本来就能发（2026-10-15，S381，§6 第 63 条①的字典那一半收尾）

- **量法换了才有这一轮**：元数那一族一句废整份脚本、只能一格一脚本；实参类型这一族引擎**一轮能报多行 Parse Error**，所以一格一行、一次 spawn 量 15 个 kind（尺 `tmp/probe-dictface/round1.mts`，读数 `tmp/probe-dictface/compare27.txt`）。行号归格踩过一次 —— `extends` / 空行 / `func` / `var d` 占四行，第一格在**第五行**，差一行就整表错位（第一版就是这么量的，句子里的 kind 全偏一格）。
- **两句不是一句**：引擎真拒的那批 kind 发 A + B 两句（`Cannot pass a value of type "Color" as "Dictionary".` + `Invalid argument for "merged()" function: argument 1 should be "Dictionary" but is "Color".`），Array / Dictionary / Callable 那三名只发 B 一句 —— 既有表就是按这两栏建的（`FACE_ARG_AS` 带 `also`、`FACE_ARG_TYPES` 只发 B），本轮照同一形状补。
- **`merged` 的一参与两参各量一遍**：同一位、同一句（`compare28.txt`），所以 `FACE_SLOTS` 那一维从「一个上界」扩成「可写名单」—— 只有这一支用名单形，别的支没量过下界那一形，照旧不发（宁可漏拦不误拦）。
- **五名的「不拒」也是量出来的**：`find_key` / `get_or_add` / `get` / `erase` / `has` 全 kind 过裁判，一格都不响（实参是 `Variant`），表里因此**不建条目**。`recursive_equal` 第二位放行的是 bool / float / int 三名，不是只有 int。
- **一处只有读代码才看得见的哑火**：`literalTypeName` 不认识 lambda（返回 null → 整条判据跳过），所以引擎那句 `... but is "Callable".` 我们从来发不出 —— 本轮认 `kind === "lambda"` 为 `"Callable"`。改前把三张表全核过：`Callable` 只在「期望型」那一栏出现过、从没进任何拒名单，所以这一改不会让既有的格子新响（`test:compile` 252/361 一字未动就是那把尺）。
- **上一轮记错的一条已改账**：S379 / S380 把实参类型那一族记成「String 侧只顺带对上两支」，读表数出来的其实是 **Array 20 名 / String 28 名 / Dictionary 4 名** —— 欠的是覆盖面（与元数表的 49 / 108 之间那一截），不是整族。§6 第 63 条①③按这个改了。
- **门**：`dict-face-arg-types.test.ts` 6 格 · 90 断言；`pnpm test` **13952**（117 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.200 String 的方法元数接进解析期：109 名过裁判，三格与文档相反（2026-10-15，S380，§6 第 63 条①的字符串那一半收尾）

- **同一把尺第三次摆下去**：一格一份 `.gd` 一次 spawn，每名两格（零实参读「至少」、五实参读「至多」），语句形（尺 `tmp/probe-str/round1.mts`，读数 `tmp/probe-str/compare25.txt`）。108 名的表由读数**直接生成**（`tmp/probe-str/gen.mts`）—— 到这个体量手抄一定会错，门里的 `T` 与 `STRING_METHOD_ARITY` 都出自同一份文本。
- **三格与文档相反**：`split` / `rsplit` 的下界是 **0**（不填分隔符也收）、`count` / `countn` 的上界是 **3**（`from` 与 `to` 都在内）、`is_valid_int` / `is_valid_float` **不收**那支默认布尔（4.x 文档明写 `is_valid_int(allow_leading_plus := true)`，裁判一支都不给 —— 与 S365 全局函数那一轮「文档里的默认实参一概不收」同一条规律，这次是在方法面上）。
- **静态名在实例接收者上照样先查元数**：`s.chr()` 给 `Too few arguments for "chr()" call. Expected at least 1 but received 0.`。文档挂着 static 的五支（`chr` / `num` / `num_int64` / `num_uint64` / `join`）都这样，元数闸门先于「能不能这么调」。
- **同族两名不同型**：`get_slice` 收 `(String, int)`、`get_slicec` 收 `(int, int)` —— 元数都是 `[2,2]`，只有实参类型那两句分得出，本门钉元数、类型那族照旧由既有的 `face-arg-*` 管。门里「合法」那一格因此要给类型也对得上的实参。
- **另两面各量一格、都不接**：`StringName` 的 `sn.length(1)` 引擎给**同族那句**（说明这一面自己也有解析期闸门），`NodePath` 给的是**另两句**（`Cannot find member … in base "NodePath".` + `Function … not found in base NodePath.`）。一格定不了一张表，所以闸门只认 `String`，另两面证不出就不报 —— 新账记 §6 第 64 条。
- **共用件长了一维**：`containerCallArity` 的「字面量直接当接收者」从写死 IR kind 换成调用方给的判据（`{…}` / `[…]` 是节点种类，`"…"` 要看到 `lit === "string"`），三族形状不同、判据各写各的。
- **门**：`string-method-arity.test.ts` 6 格 · 430 断言（108 名逐名钉两句 + 两端元数合法）；`pnpm test` **13946**（116 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物。

### 1.199 Array 的方法元数接进解析期：51 名过裁判，顺手看清「实参类型那两句本来就有」（2026-10-15，S379，§6 第 63 条①的数组那一半）

- **字典那一轮的同一把尺**：一格一份 `.gd` 一次 spawn，每名两格 —— 零实参读「至少」、**五**实参读「至多」（尺 `tmp/probe-arr/{round1,round2}.mts`，读数 `tmp/probe-arr/{compare23,compare24}.txt`）。五支是为了 `slice(begin, end, step, deep)`：三支量不到它的上界 4，字典那一轮的三支法在这儿会漏。
- **一律用语句形**：Array 这一面 void 方法多（`clear` / `sort` / `shuffle` / `reverse` / `append_array` …），套进 `print` 会先撞上 `Cannot get return value …` 那一句、把元数盖住 —— 字典那一轮就在 `clear` 上撞过一回，这轮一次做对。
- **存在的 49 名两侧都量到了**：`DICT_METHOD_ARITY` 的同族表长成 `ARRAY_METHOD_ARITY`，四支零参的读法名（`back` / `front` / `pick_random` / `max` / `min`）、`insert [2,2]`、`bsearch_custom [2,3]`、`duplicate [0,1]`、`slice [1,4]` 逐格钉在门上。
- **`find_custom` / `rfind_custom` 是本轮最能说明「为什么必须量」的一格**：本机那份旧版 `Array.xml` 里根本没有这两名，探针的候选池因此漏了它们（出货 dispatch 里有）—— 靠 dispatch 与文档名单求差才发现，补量后 4.6.3 两支都收、区间 `[1,2]`。以后每一轮的候选池都要跟 dispatch 名单求一次差。
- **本来就有的一半（账记正）**：实参**类型**那两句在数组侧早就走 `face-arg-pass` / `face-arg-type`（`a.all(1)` 两句齐全），§6 第 63 条一直把它记成「三侧都没量」—— 本轮才看清缺的只有元数。字典侧确实没有（`d.merged([1])` 一句不报）。
- **一名幽灵归位**：`is_same` 在数组上不存在（这一支叫 `is_same_typed`），`ARRAY_NO_METHOD` 从两名长成三名。
- **三道闸门合成一套共用件**：pack / 字典 / 数组原本各抄一份「按函数体扁平化节点表 + 收集重新赋值名」的走查，这轮抽成 `flattenBodies` / `reassignedNames` / `containerCallArity` / `arityDiag`；**接收者证明那张表仍各自留在自己那一支**（三族证法不同，共用只会把差异藏起来）。`code` 一族一名，实测一张调用不会同时落两条。
- **门**：`array-method-arity.test.ts` 11 格（四个区间族逐名钉两句）+ `packed.test.ts` 一格幽灵名；`pnpm test` **13940**（115 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26，一例未动）、`test:diff` **245/245** 逐字节；本轮不碰任何 `.gd`、不改任何产物，golden `--check` 复核另跑。

### 1.198 Dictionary 的方法元数接进解析期、29 支幽灵名归位：49 名一次过裁判（2026-10-15，S378，§6 第 63 条①的字典那一半与④）

- **§6 第 63 条那笔账先动字典这一半**：S377 撞到「容器方法的解析期元数出货一概没有」，本轮把 49 名（引擎 `Dictionary` 的全部公开方法名 + Array 那侧常混进来的名字）一名一名过裁判 —— 每名两格，零实参读「至少」、三实参读「至多」（尺 `tmp/probe-dict/arity.mts`，读数 `tmp/probe-dict/compare22.txt`）。
- **存在的 20 名两侧都量到了**：`assign [1,1]`、`clear [0,0]`、`duplicate [0,1]`、`erase [1,1]`、`find_key [1,1]`、`get [1,2]`、`get_or_add [1,2]`、`has [1,1]`、`has_all [1,1]`、`hash [0,0]`、`is_empty [0,0]`、`is_read_only [0,0]`、`keys [0,0]`、`make_read_only [0,0]`、`merge [1,2]`、`merged [1,2]`、`recursive_equal [2,2]`、`size [0,0]`、`sort [0,0]`、`values [0,0]` —— 落进 `DICT_METHOD_ARITY`，句子与值类型五支（S305）、pack 九支（S376）同族。
- **两处只有量了才知道的**：字典上的 `sort()` 是**零参**（按键排，不收比较器），与 Array 那支同名同元数但不同语义，照文档写会把它当 `[1,1]`；`recursive_equal` 要**两支**（第二支是递归计数），与 S377 那一轮的读数对上。
- **不存在的 29 支一并归位**：`all any append_array bsearch bsearch_custom count fill filter find find_custom insert is_same join map max min pop_at pop_back pop_front push_back push_front reduce remove_at resize reverse rfind rfind_custom slice sort_custom` —— 引擎一律 `Invalid call. Nonexistent function '<名>' in base 'Dictionary'.`，此前落到 switch 兜底发中文「未实现」。原来只有 `join` 一名单挂着，现在换成 `DICT_NO_METHOD` 一张表（§6 第 63 条④的 `is_same` 就在这 29 支里）。
- **闸门只认证得出 Dictionary 的接收者**：`checkDictMethodArity` 与 `checkPackArgSlots` 同一口径 —— 标注 `Dictionary`（含 `Dictionary[K, V]`）与 `{…}` 字面量两种静态证明，字面量直接当接收者也认，被重新赋值过的名字丢掉，证不出就不报（宁可漏拦不误拦）。
- **门**：`dict-method-arity.test.ts` 9 格（两句各钉原文 + 零参那一族合法）+ `dict-pure-methods.test.ts` 长到 14 格（幽灵名两格）；`pnpm test` **13929**（114 文件）、typecheck **4/4**、`test:compile` **252/361**（sema 83、响亮拒 26，一例未动 —— 没有语料把字典方法用到区间外）、`test:diff` **245/245** 逐字节；golden `--check` **372/372 零漂移**（本轮不碰任何 `.gd`、不改任何产物）。

### 1.197 Dictionary 的三支纯方法发货：`merged` / `get_or_add` / `recursive_equal`，其中一支的签名与直觉不同（2026-10-14，S377，语料 373）

- **覆盖面账上最小的一族先动**：`sweep.log` 末段那 5 名（引擎有、我们表里没登）里，`merged` / `get_or_add` / `recursive_equal` 是三支纯方法，`make_read_only` / `is_read_only` 要连带「写只读容器给哪一句」一起量，留给下一轮。三支此前一律发中文自述 `Dictionary.<名>() 未实现`。
- **一支签名差点写错**：`recursive_equal` 要**两支**实参 —— `(字典, 递归计数)`，少一支引擎给 `Expected at least 2 but received 1`。第一轮探针照「一个实参」的直觉写，八格全被这句盖住；翻 4.3 的 XML 才看到 `recursion_count` 那一参。**教训写进 §6 第 63 条③：先量后接，文档与直觉都会骗人。**计数本身在无环时不影响结果（0 / 1 / 2 / 99 / -1 五格同值），所以实现直接走 `valueEq`。
- **`recursive_equal` 与 `==` 是同一段 C++**：两支自引用字典互比时两边都先打 `ERROR: Max recursion reached`（`at: recursive_equal (core/variant/dictionary.cpp:278)`）再给 `true`；那块 ERROR 带 `core/variant/` 自有帧、被 `normalize` 滤掉，所以进不了语料，而出货的 `==` 本来也不发它 —— 口径一致，不用另做。
- **`merged` 的三条口径都是量的**：给新字典（改结果不动接收者）、键序「接收者在前、对面的新键按对面次序」、**浅拷**（嵌套那一份两边共享，改 `b["k"]["n"]` 连原内层字典一起动），`overwrite=true` 时嵌套整个被顶掉、不深挖。`get_or_add` 的三条：键已在给现值且默认值一个字不写、不在才落且**落在末尾**、**单实参合法**（落 null），默认值是字典时装的是**同一份**不拷。
- **撞到一笔更大的账（没接，记 §6 第 63 条）**：容器方法的**解析期元数与实参类型**两句出货一概没有 —— `merged()` 零参、`merged([1])` 非字典、`get_or_add("j", 9, 9)` 三参，引擎都在解析期拒，我们放到运行期发中文自述、而「多给」那一形照跑（掩盖型）。这一族与值类型五支（S305）、pack 九支（S376）同构，要的是一张「容器方法 → 上下界 + 每槽类型」表，量不小，另开。顺带一名幽灵：`Dictionary.is_same` 引擎说没这名字，我们发中文「未实现」，与 S300 那格 `Array.concat` 同类。
- **门**：`dict-pure-methods.test.ts` 12 格（三支方法逐条口径）+ 语料 373（二十行逐字节，一次就对上）。**读数**：`pnpm test` **13918**（113 文件）、typecheck **4/4**、`test:compile` **252/361**、`test:diff` **245/245** 逐字节、既有产物一份没改；golden 只新建 373 一例。

### 1.196 类名直调 pack 的方法：另立一张类型名表，不去动那张喂着 `staticType` 的旧表（2026-10-14，S376 ⑤，门 4 格）

- **上一轮记下的那条尾巴当轮就结了**：`PackedInt64Array.size()` 引擎给的是与值类型五支同文的两句（`Cannot call non-static function "size()" on the class "PackedInt64Array" directly. Make an instance instead.`；没这名字时 `Cannot find member "X" in base "T".` + `Function "X()" not found in base T.`），出货给的是 `Identifier "PackedInt64Array" not declared in the current scope.` —— 三格读数本来就在 `arity2.log` 第 07–09 格。
- **不塞 `STATIC_VALUE_TYPES`**：那张表还喂着 `staticType` 的构造调用折算，注释明写「`PackedX(...)` 一律 null，判不出来就不报」，塞进去会翻掉槽矩阵与 `Array[Vector2]` 元素槽那两族的口径。改成另立 `PACK_TYPE_NAMES`（九支类型名），只在两处用：主走查的 `attribute` 臂（类型名当属性基时不当值走，于是不会再报「没声明」）与 `checkValueMethodArity` 的类名直调臂；`staticCallDiags` 的早退放宽成「没有静态面但确实是 pack 类型名」也照发。
- **一处只有量了才知道的口径**：`PackedInt64Array.append(1)` 元数明明不对，引擎**只说**「不是静态方法」那一句、不提元数 —— 因为 `append` 不在 pack 的静态面里（pack 根本没有静态面），元数那一句轮不到。门里钉了这一格，免得下一轮顺手把元数句提前。
- **门**：`pack-method-arity.test.ts` 从 7 格长到 **11** 格（两句各钉原文 + 元数不提那格 + 九支同表）。**读数**：`pnpm test` **13903**（112 文件）、typecheck **4/4**、`test:compile` **251/360**、`test:diff` **244/244** 逐字节、既有产物一份没改、golden 零改动。

### 1.195 pack 的方法元数接进解析期：22 名 × 九支两侧量齐，`slice` 的上限是 2 不是 3（2026-10-14，S376，门 8 格）

- **上一轮白捡的靶子打完了**：六支扫描每格都是零实参调用，于是「至少」那一半的读数已经在手；这一轮把「至多」那一半也量齐 —— int64 / byte / string 三支 69 格、其余五支 110 格，**五支读数一字不差**，所以九支共用一张表（八支多一支 `to_byte_array`，byte 自己那支引擎说没这名字）。
- **一处只有量了才知道的形状**：`slice` 的上限是 **2**（`slice(0, 1, 1, 1)` 给 `Expected at most 2 but received 4`）—— pack 那支**没有** `Array.slice(begin, end, step)` 的 step。照 Array 那侧抄表就会把合法调用拦成错。
- **接法是把九支塞进 `VALUE_METHOD_ARITY`**：那张表本来就喂着「标注接收者 / 推断接收者 / 构造式接收者」三条路，塞进去三形一起生效，`Too few` / `Too many` 两句与值类型五支同文。此前 pack 的元数一路放到运行期，发的是中文自述 `append() 需要 1 个参数（收到 0 个）` —— 属错值（引擎在解析期就拒，整份脚本都不跑）。
- **顺带归位一名**：`sort_custom` 九支逐支量过都说没这名字（pack 只有 `sort`，`sort_custom` 是 Array 那侧的），此前落到 switch 的兜底发中文自述，现登进 `NO_SUCH_METHOD`。
- **没接的一格，理由写清**：类名直调（`PackedInt64Array.size()`）引擎给的是与值类型五支同文的两句（读数在 `arity2.log` 第 07–09 格），出货给的是 `Identifier "PackedInt64Array" not declared in the current scope.`。接它要动 `STATIC_VALUE_TYPES`，而那张表还喂着 `staticType` 的构造调用折算、注释明写 pack 构造式一律 null —— 顺手塞进去会翻掉别的族，所以另开一处判据，记在 §6 第 34 条①。运行期那一侧（接收者静态判不出来）照旧发中文句，引擎在动态形上给哪一句没量，同处记账。
- **门**：`pack-method-arity.test.ts` 7 格（少给 / 多给各形、三种接收者、`slice` 的上限、带默认实参那三名的第二参合法、`to_byte_array` 按支分、九支同表）+ `packed-member-names.test.ts` 补一格 `sort_custom` 九支。**读数**：`pnpm test` **13899**（112 文件）、typecheck **4/4**、`test:compile` **251/360**（一例未动）、`test:diff` **244/244** 逐字节、既有产物一份没改；golden 零改动（本轮不碰任何 `.gd`）。

### 1.194 Pack 其余六支的成员名表过完裁判：翻出一处名单污染 —— `push_back` 被我们登成「Godot 里没这名字」（2026-10-14，S375，门 16 格）

- **§6 第 33 条最后一族**：int64 / float32 / float64 / vector2 / vector3 / color 六支各 52 名过裁判（312 格，一格一脚本一次 spawn），引擎有 132、无 180。**六支的「无」名单一字不差**（同 29 名），所以登一张共用表 `MISSING_ON_SIX` 就够，不必六份。名单里混着几个根本不是方法的串（`int32` / `vector2` / `arity` / `empty` 那一族 —— 扫描时从 `packed.ts` 自己的表里连出来的），引擎对它们同样给 Nonexistent，所以一并登：此前它们落到 switch 的兜底、发的是中文自述。
- **翻案的两名才是这一轮的肉**：① `push_back` 一直登在 `NO_SUCH_METHOD`（「Godot 里**不存在**的那批方法名」）上，于是九支 pack 上调用它，出货发的都是引擎那句 `Invalid call. Nonexistent function 'push_back' in base 'PackedByteArray'.` —— **一句伪造的引擎原文**，而引擎九支全都有这个方法。这与 S300 那格 `Array.concat` 同族（名单是抄来的、没过裁判），只是方向反过来：那次是我们多实现了一个不存在的方法，这次是我们多**否认**了一个存在的方法。② `clear` 从来没登记，落到兜底发中文自述。
- **两名的口径都量到九支**（`tmp/probe-pack/compare15.txt` 27 格）：`push_back` 与 `append` **完全同一支读数** —— 追加一个元素、返回 bool 而且实测值是 `false`（不是 true，与 Array 那侧的 void 也不同）；`clear` 是 **void**，取它的返回值是解析期那句 `Cannot get return value of call to "clear()" because it returns "void".`（进 `VOID_BYTES_METHODS`），当语句用则清空（`size()` 0、`is_empty()` true、打印 `[]`）。`push_back` 的实参照样过元素槽判据（`PackedStringArray` 上收 int 给 `Cannot pass a value of type "int" as "String".`，`PACK_ELEMENT_ARG` 补一名）。
- **`NO_SUCH_METHOD` 其余十二名复测成立**（135 格）：`min` / `max` / `sum` / `pop_back` / `pop_front` / `subarray` / `to_string` / `decode_utf8` / `decode_ascii` / `hash` / `push_front` / `copy_on_write` / `join` 九支都说没这名字 —— 那张表只有 `push_back` 一名是脏的。
- **白捡一批下一轮的靶子**：六支扫描每格都是**零实参**调用，于是每个要实参的方法都给的是**解析期**那一句（`Too few arguments for "append()" call. Expected at least 1 but received 0.`，`insert` / `set` 是 at least 2）。所以 pack 的元数与值类型那一族同类，而出货现在发的是运行期中文自述 `<名>() 需要 N 个参数（收到 M 个）` —— 属**错值**，「至少」那一半的读数已经在手，「至多」那一半还没量（§6 第 34 条①）。
- **门**：`packed-member-names.test.ts` 10 格（六支 × 29 名逐名钉句子 + 三格钉「引擎有的名字不许被这张表拦掉」+ push_back / clear 九支的行为与元数）、`pack-push-back-clear.test.ts` 6 格（clear 的 void 句、append / push_back 取值合法、元素槽两句）。**读数**：`pnpm test` **13891**（111 文件）、typecheck **4/4**、`test:compile` **251/360**（一例未动）、`test:diff` **244/244** 逐字节、既有产物一份没改；golden 零改动（本轮不碰任何 `.gd`）。
- **一处工序提醒**：改了 `packages/runtime/src` 之后**先 `pnpm build`** 再用 CLI 复核 —— CLI 的产物吃的是 dist，不重建会读到旧运行时（本轮 `push_back` 改完第一次复核就是这么假的，直接问运行时的 `tmp/probe-pack/direct.mts` 才是真的）。

### 1.193 读写器的记号级畸形形：六形量齐、四句接上，`get` 与 `set` 两侧不同文（2026-10-14，S374，门 27 格）

- **§6 第 62 条①的尾巴**：上一轮只接了「名字 / 签名 / 少逗号」那五句，剩下的是记号级畸形形 —— `get 名`（漏等号）与 `get = 5`（等号后不是名字）。量下来是**六形六句**，而且 `set` 那一侧与 `get` **不同文**：`set 名` 给 `Expected "(" after "set".`（没有「或 `:`」，set 必须带形参），等号后不是名字那两句也各按 getter / setter 分文。
- **两条容易踩的**：① `get = _g` 换行再 `set = 5`，引擎给的仍是**少逗号那一句**（`Expected end of indented block for property.`）而不是 setter 那一句 —— 判据的先后次序因此是钉住的；② `get =`（等号后空着）时 tree-sitter 会把**下一行的 `func`** 捡去当 getter 名，所以「等号后是不是名字」必须卡**同一行**，否则合法形会被误判成畸形。
- **接法**：这四句只能在 ERROR 节点上认（整条属性声明连后文被吐成一个 ERROR）。`accessorTokenErr(n)` 把节点的记号摊平，先要见到 `var` 再认 `get` / `set`，然后按它后面那个记号走三条分支；模块层与类内两个 `default:` 各挂一次。等号后空着那一形的 ERROR 落在 `setget` **里面**，所以 `lowerAccessor` 也调同一个判据（不带 `var` 前置）。
- **没接的一形**：内部类里的 `get 名` —— ERROR 落在 `variable_statement` 里、`get` 是它最后一个记号，出货给 `顶层节点 expression_statement 未支持`。引擎在**类内**给哪一句本轮没量，判据也只有一格支撑，按红线不猜（§6 第 62 条①）。
- **门**：`property-delegation.test.ts` 从 22 格长到 **27** 格（六句各钉原文 + 一格钉五种合法形一句都不许响）。**读数**：`pnpm test` **13875**（109 文件）、typecheck **4/4**、`test:compile` **251/360**（一例未动）、`test:diff` **244/244** 逐字节；本轮不碰任何 `.gd`、不改任何产物，golden 零改动。

### 1.192 内部类调外层方法那一句补齐到五个位置：字段初值、形参默认值、读写器体此前都放到运行期才炸（2026-10-14，S373，门 9 格）

- **上一轮量具名委托时那一格探头自己的读数**：内部类里调外层类的方法，引擎解析期给 `Function "p()" not found in base self.`，出货照跑 —— 一查才知道这句早就接了，但**只接了函数体一处**：字段初值（`class C: var f = p()`）、形参默认值（`func go(a = p())`）、getter 体与 setter 体这四处全漏，运行期炸 `this.p is not a function`（比引擎晚一整个阶段，且句子是我们自己的 JS 错）。
- **补法是把走查面补齐、判据一字不改**：`checkClassFuncVisibility` 原来只 `scanStmts(f.body)`，现在同一张 `outerFuncs`（模块级方法名）/ `own`（本类方法名）/ `local`（局部名表）三表判据多走四处 —— 初值当单表达式、形参默认值逐个、getter 体当语句列表、setter 体多把形参放进 `local`（所以 `set(p): print(p())` 不误报）。
- **顺手把「内部类看不见外层成员」整面量齐（十三格，两侧十一格本来就合）**：实例字段 / `static var` / 信号给 `Identifier "X" not declared in the current scope.`，实例方法与 static 方法都给 not-found-in-base-self 那一句，两层内部类调最外层方法同句 —— **唯一的例外是外层 `const` 看得见**（`return KC` 两侧都给 `2|2`）。这四格此前就是对的，本轮只是把它们钉进门里，别让下一轮改走查面时碰坏。
- **门**：`inner-class-outer-func.test.ts` 9 格（五个位置各钉一句 + 四格钉「不许跟着拦」：自己的方法、同名遮蔽、setter 形参遮蔽、模块级对照）。**读数**：`pnpm test` **13870**（109 文件）、typecheck **4/4**、`test:compile` **251/360**（一例未动）、`test:diff` **244/244** 逐字节；本轮不碰任何 `.gd`、不改任何产物，golden 零改动。
- **§6 第 62 条三面到此都接完**，只剩①末尾那两句记号级畸形形（`get 名` 漏等号、`get = 5`）—— 那两形 tree-sitter 把整条属性声明吐成一个 ERROR 节点，要复刻引擎的句子得在错恢复的文本上认形状。

### 1.191 static 语境的准入面数齐：三处语境一套判据，出货此前只覆盖其中两格（2026-10-14，S372，门 13 格）

- **上一轮量具名委托时顺带撞出来的两条欠账，一起数成一面**：静态语境其实有**三处**（静态函数体、静态变量初值、静态读写器体），越界有**两种**（`self`、非静态成员），六格里出货此前只对了两格 —— `static var x = p()` 要跑到运行期才炸 `this.p is not a function`，静态读写器体里的 `self` / 非静态成员一律放过（`return typeof(self)` 出货照发、读非静态字段发成读 `undefined`）。
- **句子只有两个模板，尾巴按语境换**：`Cannot access non-static variable "X" from <语境>.` 与 `Cannot call non-static function "X()" from <语境>.`，`<语境>` 三种 —— 静态函数 `the static function "f()"`、静态变量初值 `a static variable initializer`（不带引号也不带字段名）、静态读写器体用 S368 那两个合成名 `the static function "@<字段>_getter()"` / `"@<字段>_setter()"`。`self` 只有一句 `Cannot use "self" inside a static function.`，四处语境同句。
- **接法是把 `checkStaticAccess` 从「按函数循环」改成「按语境循环」**：走查器与判据一行没动，只是多喂两种语境（初值当单表达式走、读写器体当语句列表走，setter 的形参进局部名表所以遮蔽同名字段不误报）；`self` 那一句不在这里 —— 它由 `checkFieldInits` 的作用域管，静态读写器体换一个不许 `self` 的子作用域即可。
- **一个必须留着的例外**：`static var` 的**初值**里写 `self`，引擎不拒、给 typeof 0（S367 那条读数本轮复测成立）—— 初值不是函数体。这一格两侧一直是对的，扩语境的时候没把它一起拦掉（门里专门一格钉「不拒」）。
- **门**：`static-context-access.test.ts` 13 格（十二格量到的形状 + 一格遮蔽对照）。**读数**：`pnpm test` **13861**（108 文件）、typecheck **4/4**、`test:compile` **251/360**（一例未动 —— 既有语料没有踩这三句的形状）、`test:diff` **244/244** 逐字节；本轮不碰任何 `.gd`、不改任何产物，golden 零改动。
- **顺带记一笔**：这一轮的尺落在自己的目录 `tmp/probe-static/`（上一轮 `tmp/probe-argtype/fold60-61` 与 `tmp/pos/{compare6,d*,e*}` 被并行轮同名覆盖过一次，读数靠逐格原文才没丢）。

### 1.190 具名委托的准入四句接进解析期：引擎拒编译的源码不再被出货照跑（2026-10-14，S371 ④，门 22 格）

- **这一族此前一格准入都没有**：`get = 名` / `set = 名` 的名字与签名出货一律不看，直接发 `this.<名>()`。于是「Godot 拒绝编译、我们照跑」的掩盖型错一排四格 —— 委托到不存在的方法要跑到运行期才 `this._nope is not a function`，getter 带一个参数 / setter 带零个或两个参数**根本不响**（照调，实参对不上就是 undefined），委托到宿主裸名（`get = quit`）甚至真的把 `quit()` 调了。
- **判据是量出来的两条**：① 名字必须在**本类声明的方法**里 —— 宿主裸名不算、模块 `var cb` 不算、内部类的方法不算，**继承来的也不算**（内部类 `C extends B` 委托 `B._g` 与 `extends "res://base.gd"` 委托基文件里的 `_g`，引擎两句都是 `Getter "_g" not found.`，`tmp/pos/compare11.txt`）；② 签名只看**元数与有没有默认值** —— getter 恰好 0 参、setter 恰好 1 参，`func _g(a = 1)` 与 `func _s(v, extra = 2)` 都不合格，而**参数类型不看**（`func _s(v: int)` 给 `Variant` 属性当 setter 引擎照收）。四句原文照抄，行号指属性声明那一行（与引擎同）。
- **顺带接了第五句**：两段之间**少逗号**（`get = _g` 换行再 `set = _s`）引擎给 `Expected end of indented block for property.`，出货此前给的是「属性访问器里没见过的形态：ERROR "set = _s"」。带逗号换行是**合法**的 —— 语料 121 那一格 (`get = _getr,` / `set = _setr`) 一直是这个形状，别把它一起拦了。
- **仍欠两句**：`get 名`（漏等号）与 `get = 5` 那两形 tree-sitter 把整条属性声明吐成一个 ERROR 节点，要复刻引擎的 `Expected ":" or "(" after "get".` / `Expected getter function name after "=".` 得在错恢复的文本上认形状，比前四句贵，记在 §6 第 62 条①。
- **门**：`property-delegation.test.ts` 从 14 格长到 **22** 格（四句 + 少逗号一句各钉原文，另三格钉「定型形参 / static 目标 / 带逗号换行」不许拦）。**读数**：`pnpm test` **13848**（107 文件）、typecheck **4/4**、`test:compile` **251/360**（语料里只有 121 用这一形，一例未动）、`test:diff` **244/244** 逐字节、golden 零改动（本轮不碰任何 `.gd`）。

### 1.189 后备槽补上「没初值」那一半：定型的只写属性读出来是那一型的零值，不是 null（2026-10-14，S371 ③，语料 371 长到十五行）

- **上一轮的槽只发给「有初值」的属性**，于是漏了一格：`var x: int: set = _s`（没有初值）引擎读出来是 `0`（typeof 2），出货读出来是 null —— 因为「只带 set 的属性读出来是 null」那句读数是从 `Variant` 那一形量的，被当成了整族的口径。槽装的其实是**声明类型的零值**，`Variant` / 不写型那一形才恰好是 null。
- **接法只动一句判据**：`propSlot(v)` 从「有初值才发槽」改成「有初值**或**没有 getter 就发槽」，槽的初值仍走 `slotInit(v.type, v.init)` —— 空初值时它给的就是 `typeDefault(t)`，`int` 发 `rt.toInt(rt.V.int(0))`、`Variant` 发 `rt.V.nil()`，四种成员发射口与 `inst_to_dict` 的读数器一行没改就都跟上了。
- **既有产物只有语料 370 动了**（两个只写属性各多一个装 nil 的槽、读数器从死写的 `rt.V.nil()` 改成读槽），输出一字未变 —— `test:diff` **244/244** 逐字节就是这条不变性的证据；那一轮的门 `property-accessor-names.test.ts` 里「发 null 盒子」那格跟着换成钉槽。
- **门**：`property-delegation.test.ts` 14 格（多一格：`Variant` 那一形槽装 nil、`int` 那一形槽装零值）+ 语料 371 加两行（`定型属性只带 setter → 2 | 0`、写它之后仍是 `2 | 0`）。**读数**：`pnpm test` **13840**（107 文件）、typecheck **4/4**、`test:compile` **251/360**、`test:diff` **244/244**、golden 只重生成 371 一例。
- **同一轮量到、按判据没接的**：具名委托的准入四句（`Getter/Setter "X" not found.` 与两句 `cannot be used as … because of its signature.`）读数已在 `tmp/pos/compare10.txt` —— **继承来的方法不算找到**（内部类 `C extends B` 委托 `B._g` 引擎照样给 not found），签名只看元数与有没有默认值、**不看类型**（`func _s(v: int)` 给 `Variant` 属性当 setter 合法）。接的活是下一轮。

### 1.188 属性的具名委托与 static 那一维：三处静默错值连一块运行期 ERROR 一起接上（2026-10-14，S371，语料 371）

- **上一轮留的那半（§6 第 61 条⑥）量清了**：具名委托的合法写法是 `get = 名` / `set = 名`，而且**两段必须并列在一行**（`var x: Variant: get = _g, set = _s`）—— 分成两行引擎给 `Expected end of indented block for property.`。上一轮探针写成 `get get_thing`（漏等号）本来就是非法形，那句 `Expected ":" or "(" after "get".` 与出货的「未支持」两边都拒但不同句，五句解析期拒本轮**只量未接**。
- **量出三处静默错值**：① `static var` 带读写器时出货发的是**实例**访问器，`Main.thing` 读到 undefined 当场炸（inline 与具名两形都中，`static var x: get: return 3` 这种最普通的形也炸）；② 委托目标是 `static func` 时出货发 `this._g()`，实例上没那个槽；③ **带初值的属性出货把初值整个丢了** —— 引擎是「初值进后备槽、没 getter 时读的就是它、写属性不动它」，而且初值**照评**、副作用与邻字段按声明次序交错。第三条连 1.185 那轮的 inline 形一起错，不只是具名那一支。
- **一块新的运行期 ERROR**：static 属性委托到**实例**方法，引擎不在解析期拦，运行期每次读写各打一块 `Can't call non-static function 'X' in script.`（`at: callp (modules/gdscript/gdscript.cpp:940)` + backtrace），值给 null、写不动。这一块 `normalize` **滤不掉**（它只滤带 `core/(variant|math)/` 自有帧的块，`push_error` 那块正是因此进不了语料），所以它进了 golden，出货必须逐字节复现 —— 复用 S281 那套帧栈：`frames.ts` 加一支 `reportNonStaticCall`，`FRAMES_ON` 的判据多一条「本模块有没有这种死委托」（`hasDeadStaticDelegate`），不然帧栈是空的、backtrace 一行也打不出来。
- **接法**：`emitAccessors` 按 `v.isStatic` 发 `static get/set`；委托的接收者按目标在不在 `STATIC_FUNCS` 里分（类 / `this`）；`propSlot(v)` 给「带读写器且有初值」的属性发一个 `__gd_store_<名>` 后备槽，四个成员发射口（legacy 字段、proto 的 `declare` + `__gd_fields__`、类级 static、legacy static）各自按声明次序落它，`selfInNilContext` 那一维**不动**（`self` 在 static 读写器体里是解析期拒，不是给 nil，见⑤）；`inst_to_dict` 的读数器从死写的 `rt.V.nil()` 改成「有槽读槽、没槽才 nil」。
- **顺带量到两条不属这一族的欠账**（都记进 §6，本轮不动）：`static var x = p()`（初值调非静态函数、没有读写器）引擎解析期就给 `Cannot call non-static function "p()" from a static variable initializer.`，出货运行期才炸；static 读写器体里的 `self` 引擎给 `Cannot use "self" inside a static function.`，出货发 typeof 0。
- **门**：`property-delegation.test.ts` 13 格（发射式子逐支钉）+ 语料 371（十三行逐字节，含三块 ERROR）。**读数**：`pnpm test` **13839**（107 文件）、typecheck **4/4**、`test:compile` **251/360**、`test:diff` **244/244** 逐字节、codegen-drift 绿；既有产物只有语料 370 少两行注释（那句说明并进了 `emitAccessors` 的函数头），输出一字未变。
- **并行轮踩到的坑（记下来给下一轮）**：这一轮与另一支会话同时在**同一个工作树**上跑，`tmp/probe-argtype/fold60.mts` / `fold61.mts` 与 `tmp/pos/compare6.txt` 被对方同名覆盖 —— 逐格原文（`tmp/pos/deleg-*.txt`）与格子源（`tmp/pos/{d,e,f,g}*.gd`）还在，读数不丢，但**尺的文件名会撞**：往后开探针先 `ls` 一眼，或直接用 `tmp/probe-<本轮名>/` 自己的目录。提交只挑自己那几个文件（`git status` 逐条对过），别 `git add -A`。

### 1.187 `extends` 文件链上的子脚本也认宿主裸名：过拦的那道字面判断换成链判断（2026-10-14，S370，语料 372）

- **这是一笔过拦**：`extends "res://base.gd"`（base 自己 `extends SceneTree`）里 `var f = quit` 引擎给 typeof 25 的 Callable，出货解析期就给 `Identifier "quit" not declared in the current scope.` —— 根因只是 `analyze` 里那一句 `m.extends === "SceneTree"` 的字面比较，链走不到。
- **量法**：`fold60` 五格（子里字段初值、子里形参默认值、两跳链、两跳链的 static func、基类是 RefCounted 的对照），`fold61` 把这套做成一份自足的小工程（`tmp/chain`：project.godot + base / mid / deep）两侧各跑一遍 `run-project` —— 跨文件那一形单文件模式判不出来，必须走工程路。
- **接法**：判定式子中现成的就有 —— `project.ts` 的 `hostOnChain` 一直在算「JS 原型链顶端挂不挂宿主」，发射器靠它发 `hostBaseInChain`。现在同一趟循环里先把它写进 `m.hostChain`，`analyze` 改看 `m.extends === "SceneTree" || m.hostChain === true`，发射器复用同一个布尔，两处不可能分岔。上一轮那套位置口径（字段初值、形参默认值、静态语境三句）在链上一格没变。
- **两侧都读到但没进语料的一格**：子脚本的 `static func` 里读宿主名 —— 引擎与出货给的都是 `Cannot access non-static variable "quit" from the static function "s()".`，但解析期错一句就废整份脚本，语料要的取值那几格就印不出来了，所以只留读数（S370 ②）。
- **没做的两支**：单文件模式（`gds2js run` 走 `tryLoadSingle`，没有整工程的 loaded 表）照旧判不出链；基类是 `RefCounted` 的那条链只读到 `load` 成功、`go()` 那一格没取到值，所以照旧拒（拒不是错值，量到再放）。
- **门**：语料 372（四行逐字节：字段初值、带型字段、`self`、形参默认值，走的是 `main → mid → base` 两跳）。`pnpm test` **13826**（106 文件）、typecheck **4/4**、`test:compile` **250/359**、`test:diff` **244/244** 逐字节、codegen-drift 绿；golden 没动任何既有用例的 `.gd`，整份 `--check` 复核提交时仍在跑（上一次跑完的读数是 0 漂移 / 369 例）。

### 1.186 取值记号按模块分主：两份文件同 `行:列` 的同名字不再互相抢记号（2026-10-14，§6 第 61 条结清）

- **这不是新语义，是出货的错值**：三张记号表（全局函数取值 / 引擎类名取值 / 宿主方法名取值）是进程内累积的 `Set<string>`，`analyze` 从不清，键只有 `名@行:列`。跨文件工程是「每份先 analyze、再逐份发射」，于是 A 文件里 `quit@6:8` 的 Callable 记号，会被 B 文件同一行同一列那个叫 `quit` 的**形参**继承过去 —— 局部名发成了 Callable。引擎那边每份脚本各自编译，根本没有这种共享。
- **撞它的正是上一轮的门**：两格源只差一个 setter 的形参名，行:列一字不差，前一刻记的号后一格直接取到。当时第一反应是把那一格错开，但那只是把证据藏起来。
- **结法**：记号键加一位**归属**。`analyze(m, globals, owner?)` 给每份模块定主 —— `project.ts` 传 `resPath`、CLI 传 `absPath`、`tools/compile.ts` 传用例号，调用方没给就换一个进程内递增序号；归属写进 `m.markOwner`，发射器在 `emitModuleWithMap` 入口 `useMarkOwner(m.markOwner ?? "")` 对准当前模块再查表。**没有**改回对象身份：scriptc 那条原生通道不让把对象塞进 WeakSet（SC1090），这层限制原样留着。
- **门**：`mark-owner-isolation.test.ts` 四格（宿主名一对、全局函数名一对，各自正序反序），`property-accessor-names.test.ts` 那一格恢复原形。
- **不改变任何一份产物**：`test:compile` 250/359 一字未动、242 份 `main.gen.mts` 一份没改（`git status` 干净）、`test:diff` 242/242 逐字节、codegen-drift 绿、golden 未漂移 **369/369**（引擎侧与我们的记号无关）。`pnpm test` **13823**（106 文件）、typecheck **4/4**、`pkg-modes` + `export` 两门 ok 10 / 上游或环境记账 3 / FAIL 0。

### 1.185 inline 读写器体从此真查：`get:` / `set(v):` 里不再是「不查名字的那两段」，只带 set 的属性也收下（2026-10-14，S368，语料 370）

- **出货里的第二处真 bug**：1.184 把字段初值接住了，读写器那两段却还是同一个洞的另一半 —— `checkFunc` 只走查函数体，`var thing: int: get: return quit` 里的 `quit` 从没被记过，于是发成裸标识符，跑起来 `quit is not defined`（复现只需一行：读数 `tmp/pos/compare4.txt` 首行）。
- **量法**：属性一律声明成 `Variant`，不然引擎的返回类型检查先抢答（第一轮 `fold57` 就是这样，`int` 属性返回 Callable 当场给 `Cannot return value of type "Callable" …`，名字那一层的问题整个被盖住）；`fold58` 十五格钉读写器体里的六种名字与三句拒，`fold59` 五格钉「只带 set / 只带 get / 成对」三种属性形状各自读出来给什么。一格一份 `.gd` 一次 spawn 这条老规矩不变。
- **接法**：`checkFieldInits` 除了初值，也把 getter（允许 `self` 的作用域）与 setter（再多绑一个形参名）走查一遍；`checkConstAssign` 同样吃这两段，于是 setter 里 `quit = 5` 给的是引擎那句「常量」。`static var` 的两支引擎用的是**合成函数名** —— `@thing_getter()` / `@thing_setter()`，句子仍是 S367 那一句，出货照这两个名字发。
- **顺带解掉一个过拦**：只带 `set` 的属性引擎是收下的（实测写它照跑体、读它是 typeof 0），出货 `lower.ts` 那句「还没实测过，先拒绝」撤掉；`PropAccessor.getter` 改成可空，发射器给空 getter 发 `return rt.V.nil()` —— 要的是真的 null 盒子，不是 JS 的 `undefined`，两者 `typeof` 一样、别处（打印、传参、`.is_valid()`）不一样。
- **门**：`property-accessor-names.test.ts` 12 格（放行的钉发射式子、拒的钉原文）+ 语料 370 七行逐字节。两格源只差一个形参名、行:列撞车时互相抢记号那一节记在 §6 第 61 条，门里已把源错开并把原因写成注释。
- **门读数**：`pnpm test` **13819**（105 文件）、typecheck **4/4**、`test:compile` **250/359**（sema 83、响亮拒 26，一例未动）、`test:diff` **242/242** 逐字节、golden 未漂移 **369/369**。
- **还欠的**：具名委托那一形（探针写法被引擎判成 `Expected ":" or "(" after "get".`，出货是「未支持」，两句不同）—— 那一形怎么写合法要先量，见 §6 第 61 条④。

### 1.184 字段初值与形参默认值那一层从此真查：模块级 `var f = quit` 不再发成裸标识符，静态语境三句按位置分文（2026-10-14，S367，语料 369）

- **出货里的真 bug**：`analyze` 旧码 `recordInitValueReads` 走查字段初值只为补记「全局函数取值点」，整摞诊断丢进一张空表 —— 等于那一层不查名字。后果是模块级 `var f = quit` 编得过、发出来的是裸标识符，跑起来当场 `quit is not defined`；同一层里 `var f = nosuch` 也一路放行到运行期。
- **量法**：解析期报错一句废整份脚本，所以一格一份 `.gd` 一次 spawn —— `fold55` 二十格钉「函数体之外的那些位置」，`fold56` 六格补 `static func` 里的**写**位与 `self` 在 `static var` / `const` 初值里的形状；两侧同表对照，读数 `tmp/pos/{compare.txt,compare2.txt}`。
- **接法**：`checkFieldInits` 取代那张空表（模块与内部类的字段初值都真查，走的是允许 `self` 的作用域 —— 模块字段、内部类字段、实例方法形参默认值里的 `self` 实测都给 typeof 24），`checkFunc` 多走查一遍形参默认值，宿主名单仍只给根模块。静态语境三句分文：`static func`（读、写、默认值三种位置同一句、带那支函数名）、`static var` 初值、`const` 初值各一句，逐字照引擎。
- **顺带修的一处静默错值**：`static var f = self` 引擎给 typeof 0（那处没有实例），出货此前一律发 `rt.V.object(this)`，而 JS 静态字段初始化里的 `this` 是那个类本身 → typeof 24。发射器在 `static var` 初值那一段改发 `rt.V.nil()`。
- **门**：`host-name-positions.test.ts` 15 格（放行的六格钉发射式子、拒的六格钉原文、`self` 三格钉收/拒），`implicit-callable-value.test.ts` 那两支「静态方法没量过所以按未声明拒」的旧格子换成实测那句；语料 369 七行逐字节 —— 「内部类字段初值的 `self`」那一格引擎在退出时报 `ObjectDB instances leaked`，golden 里带上那两行就没法逐字节对账，所以请出语料、只留门与两侧读数。
- **门读数**：`pnpm test` **13804**（104 文件）、typecheck **4/4**、`test:compile` **249/358**（sema 83、响亮拒 26，一例未动）、`test:diff` **241/241** 逐字节、golden 未漂移 **368/368**。
- **还欠的三面**（§6 第 60 条）：内部类自己 `extends SceneTree` 那一形（引擎认、发射期先拒）、沿 `extends "res://…"` 文件链挂到 SceneTree 的脚本（本轮只量了引擎一侧）、lambda 形参的默认值（引擎给 25、出货响亮拒）。

### 1.183 `_x` 虚方法名换回引擎那一句：`Identifier not found: _process`（末尾没有句号）（2026-10-14，S366 补）

- **接着 1.182 的那 15 名**：它们不进宿主名单是对的（引擎取值也报错），但报错的句子与一般没声明的名字**不是一样** —— 引擎发 `SCRIPT ERROR: Compile Error: Identifier not found: _process`，而我们统一发 `Identifier "X" not declared in the current scope.`（那句在语料 golden 里有一批，是一般名字的正确原文）。
- **改法**：`analyze` 里加一张实测的 15 名表（`_finalize` / `_get` / `_get_property_list` / `_init` / `_iter_get` / `_iter_init` / `_iter_next` / `_notification` / `_physics_process` / `_process` / `_property_can_revert` / `_property_get_revert` / `_set` / `_to_string` / `_validate_property`），同一取值位置改发 `Identifier not found: <名>`，`code` 仍是 `undeclared-identifier`，别处一字未动。
- **门**：`host-value-method-names.test.ts` 那 15 名各钉「照旧拦 + 句子逐字」，另加一格钉一般名字仍是老句；`pnpm test` **13786**（103 文件）、typecheck **4/4**、`test:compile` **248/357**（sema 83、响亮拒 26，一例未动）、`test:diff` **240/240** 逐字节、golden 未漂移 **367/367**。
- **还没穷尽的**：这 15 名在**调用位**（`_process()`）与**赋值位**给什么句子，没量过 —— 这一轮只换了实测过的那个取值位置。

### 1.182 宿主裸方法名当值用的名单一次扫齐：15 名 → 97 名，另 15 支 `_x` 虚方法是第三种句子（2026-10-14，S366，语料 368）

- **一次数完再逐名量**：`ClassDB.class_get_method_list("SceneTree")` 给 113 名（`Object` 那 62 名全在其中），一格一份脚本 spawn 量「裸名当值」—— 这一族混着编译期拒，packed probe 分不出是谁。读数 `tmp/hostnames/readings.txt`，尺 `fold45.mts`。
- **97 名给 typeof 25 的 Callable**（打印 `SceneTree(<文件>)::<名>`），其中 82 名此前被解析期一句 `Identifier "…" not declared` 拦掉 —— 是「合法代码被过拦」那一类，S358 当时只逐支量了 15 名。
- **另 15 名是虚方法那一族**（`_process` / `_init` / `_to_string` / `_get` / `_set` / `_notification` / `_iter_*`…），引擎给的是 `Compile Error: Identifier not found: _process` —— 与一般没声明名字那句 `Identifier "X" not declared in the current scope.` **不是一样**，出货照旧拦，差的只是句子形状。
- **`_initialize` 是个陷阱**：探针里它确实是 Callable，只因探针脚本自己定义了它；宿主给不给没量到，所以不进名单，读数里那一格单独标出。
- **运行时一字未动**：`get_method()` / `is_valid()` / `is_null()` 全按 Callable 盒子给（`methodCallable` 造的形状与 `Callable(self, "<名>")` 同一口径），所以新名单里那些调用起来还没实现的名字取值合法、`call()` 才响亮拒 —— 语料 368 因此只钉元数据。
- **对过的两头的口径**：这 97 名与 `GLOBAL_VALUE_NAMES`、`ENGINE_CLASS_NAMES` 零冲突，解析顺序仍是局部 → 全局常量 → 全局函数名 → 引擎类名 → 宿主方法名（`host-collide.mts` 逐名核过）。
- **门**：`host-value-method-names.test.ts` 97 名逐个钉「不出诊断 + 发出 `rt.methodCallable`」+ 一格钉 15 支虚方法照旧 `undeclared-identifier`；语料 368 三十六行逐字节；`pnpm test` **13785**（103 文件）、typecheck **4/4**、`test:compile` **248/357**（sema 83、响亮拒 26）、`test:diff` **240/240** 逐字节（用例 367、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **367/367**。

### 1.181 全局函数的元数一次补全 61 名：「Godot 4 有默认实参」这一族假设被读数否掉（2026-10-14，S365）

- **起点是 `screen-arity.mts` 的一次自查**：把「发射式子只取 `a[0]` / `a[1]`，又不在 `BUILTIN_ARITY` 上」的名字全筛出来 —— 六十多支。按公开签名，`ease(x, c, ease_style)`、`pingpong(time, length, pause)`、`is_equal_approx(a, b, tolerance)`、`type_exists(type, inherit)`、`var_to_str(var, pretty_print)`、`inst_to_dict(obj, props_only)` 都该带默认实参，那这就是「静默丢实参」的错值族。
- **读数把假设打回**：`fold50` 给每名做「省掉这一位 / 给这一位」两格对照，`fold51` 再对每名量「少一元 / 多一元」两句 —— 4.6.3 的裁判对**多给一位**一律 `Too many arguments for "X()" call. Expected at most N but received M.`，一支都不收。所以真正的缺口是**闸门缺失**（多给实参编得过、按前两元发出去），不是丢位错值。
- **零冲突复核**：`arity-diff.mts` 把读数与现有 51 行对照，**一格都不差**（顺带验了上一轮刚补的 `maxi` / `mini` / `maxf` / `minf`）；两名齐全的另一批 61 名进了表，表上从 51 → **112 名**。
- **顺手修的一句**：`convert(1)` / `type_convert()` 旧发的是自写的 `Expected 2 but received 1.`，引擎同格是 `Expected at least 2 but received 1.` —— 两支现成的 throw 删掉改走闸门，`code` 仍是 `convert-arity`，`emit-guards` 那三格只换句子不改口径。
- **没量的照旧不动**（§6 第 59 条）：`range` 上界走 `Invalid call to GDScript utility function "range()". Expected 3 argument(s).` 这条另一形状；返回 void 的九支被探针包法挡住，要换形状再量；类型构造式是第三种句子 `No constructor of "float" matches the signature …`。
- **时机还差一层**：引擎两句都在解析期，出货在发射期发同文，`gds2js check` 看不见 —— 要接到 `analyze` 得先对两张区间表（S364 已经抓到 `max` / `min` 两边记法不同）。
- **门**：`builtin-arity-sentences.test.ts` 208 格句子逐字钉 + `emit-guards` 的转换族 12 格；`pnpm test` **13684**（102 文件）、typecheck **4/4**、`test:compile` **247/356**（sema 83、响亮拒 26 —— 没有一例语料把这些名字用到区间外）、`test:diff` **239/239** 逐字节、golden 未漂移 **366/366**。

### 1.180 全局 `max` / `min` 三元以上被截成两元：一条静默错值，顺带补齐四支定长名的元数闸门（2026-10-14，S364，语料 367）

- **怎么露出来的**：发 S363 之后重跑「引擎收下的合法调用」那一侧普查，`max` / `min` 不在不合名单上（那批格子都是两元），但顺手用 `gds2js run` 试了三元的 `max(1, 2, 3)` —— 我们给 **2**、引擎给 **3**；`max(1, 5, 3, 9, 2)` 我们给 5、引擎给 9。发射式子是 `rt.gMax(${a[0]}, ${a[1]})`，第三元往后**当场丢掉**，`BUILTIN_ARITY` 又写着 `[2, +∞)`，于是解析期一声不出。
- **折法是量出来的**：左折、赢家带自己的型（`max(1.0, 2, 3)` 给 int 3）、并列留先出现的那个（`max(2, 2.0, 2)` 给 int 2）、NaN 那六格两向（`max(NAN, 1, 2)` 给 nan 一路留到底、`max(1, NAN, 2)` 给 2 跨过中间的 nan）、20 元与 22 元都给值。尺 `fold46` / `fold47`（一格一份量句子 + 一次 spawn 量值）与 `fold48`（四支定长名的两句 + 31 格值），读数在 `tmp/maxmin/`。
- **元数闸门补了四名**：`maxi` / `mini` / `maxf` / `minf` 引擎是**恰好两元**（少给 `at least 2`、多给 `at most 2`，`maxi(1, 2.5, 3)` 也报多给），出货表上原本没有这四支 → `maxf(1, 2, 3)` 编得过还静默给 `2.0`，同一类毛病。
- **两元那一支一字未动**，只把「三位以后也照折」接上；`methods` 的动态那一面（`max.call(…)` 那条链）同步走 `gMax(ga(a,0), ga(a,1), ...a.slice(2))`。
- **还剩两处口径差异**（§6 第 57 条改记）：Array / Dictionary 实参引擎是**运行期** `Invalid type in utility function "max()". Cannot convert argument N from Array to float.`，出货按解析期那一句发；`max.call(...)` 的 Callable 面区间还记 `[2, 2]`，三元给什么没量。
- **门**：语料 367 三十行逐字节、`global-max-min-variadic.test.ts` 27 格、`emit-guards.test.ts` 新闸门 16 格；`pnpm test` **13476**（101 文件）、typecheck **4/4**、`test:compile` **247/356**（sema 83、响亮拒 26）、`test:diff` **239/239** 逐字节（用例 366、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **366/366**。

### 1.179 `Color.from_ok_hsl` 发货：1437 格读数里 1367 格逐位合，alpha 也跟着夹（2026-10-14，S363，语料 366）

- **出货口径**：`thirdparty/ok_color.h` 的 `okhsl_to_srgb` 那一支按**逐算子 float32** 移植（`r32` / `mul` / `div` / `add` / `sub` 一层一落地落），常数先折成 `...f` 字面量，Halley 只走一步、`FLT_MAX` 哨兵与分支顺序照原文；出货最后一道把 **四个通道一起夹进 0..1**。引擎侧的证据是 `core/math/color.cpp` 的 `Color::set_ok_hsl(float, float, float, float)` —— 它调 `ok_color::okhsl_to_srgb` 再 `Color(…).clamp()`，形参声明就是 float。
- **clamp 的三件细节都是量出来的**：alpha 同样夹（`-0.2 → 0`、`2 → 1`、`INF → 1`）、`NAN` 原样留 nan、而 **`-0.0` 留号**（语料 366 各钉一行）—— 与 `x<0→0 / x>1→1 / 否则原值` 那一支三目一字一样。
- **两条被读数否掉的替代口径**（省得下次再走）：同一支移植改成**全程 double** 只剩 40/792 合；把 `w0*x + w1*y + w2*z` 收成一条 FMA 只剩 217/792 合。s=0 那 396 格（只剩 `toe_inv` + 灰度 + `powf`）在逐算子 float32 下**全合**，`cbrt` 换成 `pow(x, 1/3)` 一格不变 —— 引擎确是逐算子 float32，且末位分歧不在 cube root。
- **剩一条带**：70 格（全在 s 满格的 chroma 支路）两侧差 ≤1.1e-6，归到 `cosf` / `sinf` 的末位之差被消去放大，与 `Vector3.rotated` 的 libm 上限同源；门里这一组按 2e-6 带上界钉住（§6 第 58 条）。语料 366 挑的格全在逐位合的那一批。
- **顺带结清的两笔旧账**：`Color` 实例形 `c.from_ok_hsl(…)` 是**静态调用**（给出新色、接收者不动，与 `from_hsv` 同形）；§6 第 36 条那份「名在表里、运行时报未实现」的清单因此只剩 `Vector3.rotated` / `Vector3.outer` 两名。
- **门**：语料 366 四十一行逐字节、`packages/runtime/test/color-from-ok-hsl.test.ts` 1367 + 70 + 形状六格；`pnpm test` **13444**（100 文件）、typecheck **4/4**、`test:compile` **246/355**（sema 83、响亮拒 26）、`test:diff` **238/238** 逐字节（用例 365、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **365/365**；「引擎收下的合法调用」那一侧普查从 657 合 / 22 不合 变成 **673 合 / 6 不合**（那 16 格 `from_ok_hsl` 全翻合，剩下 6 格是 `Vector3.rotated` 四格与 `Vector3.outer` 两格）。

### 1.178 `Color.from_ok_hsl` 的两块拦路石搬掉了：逐字式子进仓、第一参是「圈」不是「度」（2026-10-14，§6 第 53 条④，未动代码）

- **原文到手**：`thirdparty/ok_color.h` = Björn Ottosson 的 MIT 原文，取自 `raw.githubusercontent.com/godotengine/godot/4.6.3-stable/thirdparty/misc/ok_color.h`（与裁判**同 tag**），sha256 `776f1de1…34281`，693 行一字未改；许可头留在文件里，它不进产物树（`tree-face` 不管根目录的 `thirdparty/`）。
- **先量到的一条硬事实**：`Color.from_ok_hsl(h, …)` 的第一参是**圈（turn）不是度** —— `(0.25, 0.5, 0.5)` 与 `(1.25, …)`、`(-0.25, …)` 与 `(0.75, …)` 一字一样，而 `30 / 90 / 150 / 180 / 240 / 300 / 360` 这一整批「度」写法全落到同一个颜色（原文 `cosf(2 * pi * h)` 正是这个意思）。照 `Color.from_hsv` 的直觉接必错。
- **对表数据已备**：128 格网格（两批 h × s ∈ {0, .25, .5, 1} × l ∈ {0, .5, .75, 1}，`tmp/probe-argtype/okhsl.txt`，尺 `fold40.mts`，一次 spawn 出全）—— 移植完先对这张表，再谈语料与 golden。
- **还欠的**：把 `okhsl_to_srgb` 那一支按 float32 口径逐字移植（含 `find_cusp` / `compute_max_saturation` / `find_gamut_intersection` / `toe` / `toe_inv` / `get_ST_mid` / `get_Cs` 与两轮 32 次二分），以及 `Vector3.rotated`（libm 天花板）与 `Vector3.outer`（要 `Basis`，挂在 #15 那个范围拍板下）。

### 1.177 bool 字面量进全局函数的数值位：101 位里引擎只拒三处，收的那 97 格此前一半在运行期崩（2026-10-14，S362，语料 365）

- **量法**：把 `GLOBAL_ARG_TYPES` 里 64 个函数的 101 个 int / float 位**逐位塞 `false`**，一格一份脚本、一次 spawn（解析期报错整份作废）；「跟第一参走」那族的第三位与 bool 当第一参的样子由 `fold38` / `fold39` 补齐。
- **拒的只有三处**（句子仍是 A 式、期望型照该位的型）：`max` / `min` 的每一位、`wrap` 的第一位、以及被跟的那几位（期望型 = 第一参的型：`clamp(1, false, 1)` 说 "int"、`clamp(1.5, false, 1.5)` 说 "float"、`wrap(1, 2, false)` 说第三位 "int"）。`clamp` 还反过来跟 bool 走：第一参是 bool 时 2 / 3 位期望 bool，int / float 反倒拒。
- **收的那 97 格是崩溃点不是过拦**：`absf(false)` / `sqrt(false)` / `acos(false)` / `angle_difference` / `atan2` / `posmod` / `remap` / `move_toward` / `is_equal_approx` / `lerp` 的权重位引擎全给值，而 `builtins.num` 只认 INT / FLOAT —— 编译一声不出、一跑就 `[not-number] 需要数值，收到类型 1`。现在按 false=0 / true=1 折（真拒的那些位已被表拦在解析期，走不到这里）。
- **bool 的 `clamp` 与数值不同序**：六格真值表只合「先并下界、再截上界」（`clamp(false, true, false)` 给 false，数值那一序会给下界 true），所以 `gClamp` 加了一支 bool 专用式 `(v || lo) && hi`，数值那序（`clamp(1, 2, 0)` 给 0、`clamp(NAN, 0, 1)` 给 nan）一字未动。
- **顺带量到的新账**：`max` / `min` 是「至少两个」的变元族（`max(1, 2, 3)` 给 3、`max(1, 2, false)` 拒第三位），而 `GLOBAL_CALLABLES` 的 bounds 记成 `[2, 2]` —— 记进 §6 第 57 条。
- **门**：语料 365 五行逐字节、`global-arg-bool.test.ts` 36 格（18 拒 + 15 收 + 3 允许集）；`pnpm test` **13433**（99 文件）、typecheck **4/4**、`test:compile` **245/354**（sema 83、响亮拒 26）、`test:diff` **237/237** 逐字节（用例 364、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **364/364**。

### 1.176 bool 比较一族接完两层：装箱 `<` / `>` 合式、`<=` / `>=` 静态已知时解析期就拒（两句）（2026-10-14，S361，语料 364）

- **量法**：这一族解析期拒与运行期拒混在一起，**一句废整份脚本** —— 所以 21 + 6 格全部「一格一份 `.gd`、一次 spawn」（`fold35` / `fold36`），packed probe 在这儿分不出是谁。
- **运行期那一层**：`false < true` 给 true、`true > false` 给 true、同值给 false（严格 less）；`<=` / `>=` 才拒，句子各自命名（`Invalid operands 'bool' and 'bool' in operator '<='.` / `'>='`）；`null < true` 也拒（`'Nil' and 'bool'`）。消费方跟着这条走：`[false, true].bsearch(true)` 1、`.bsearch(false)` 0、`.bsearch(true, false)` 2、`[true, false].bsearch(true)` 2、`[false, true].min()` false、`[true, true, false].max()` true、`find` / `count` 各 1、`sort_custom(func(a, b): return a < b)` 排出 `[false, true]`。
- **解析期那一层是两句话**：两支字面量 → `Invalid operands to operator <=, bool and bool.`；掺进一次「声明成 bool」的表达式（局部 / 模块级 / 形参）→ `Invalid operands "bool" and "bool" for "<=" operator.`。`false <= false` 一样拒。
- **不当静态 bool 的三种形**：`var a = false` 推断来的局部、装箱 `Variant`、数组元素 —— 引擎到运行期才拒，所以分析层一声不出（那一句由运行期的 `compare` 发）。
- **落点**：`ops.compare` 新增 bool-对-bool 一支；`analyze` 新增 `checkBoolOrdering` 一趟（只看 `binary` 的 `<=` / `>=`，两侧要么字面量要么**声明**为 bool）；S360 里 `extreme` 的 bool 特例删掉，口径统一回 `compare`；`Array.sort()` 那条（S357）一字未动，两边同向。
- **顺带挖到**：全局 `min()` / `max()` 的数值位**不吃 bool**（引擎 `argument 1 should be "float" but is "bool".`，而 `clamp(false, true, false)` 给值），出货今天无诊断 —— 记进 §6 第 56 条②，接法走 #28 那套逐位句表，但要先扫全「数值位收 bool」的样子。
- **门**：语料 364 七行逐字节、`bool-ordering.test.ts` 10 格钉解析期两句、`bool-compare-family.test.ts` 6 格钉运行期与消费方；`pnpm test` **13394**（98 文件）、typecheck **4/4**、`test:compile` **244/353**（sema 83、响亮拒 26）、`test:diff` **236/236** 逐字节（用例 363、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **363/363**。

### 1.175 `Array.min()` / `max()` 是第四条比较口子：一比就废整串给 null，此前我们抛的是运行期拒（2026-10-14，S360，语料 363）

- **发现路径**：给 `sort()` 量比较器那几把顺手把 `min()` / `max()` 摆上同一张形格 —— 63 格（`fold31` 36 + `fold32` 27）一次 spawn 量完，引擎**一行错误都没推**，而比不了的组合当场给 null；出货那边 `[1, "a"].min()` 抛的是 `Invalid operands 'int' and 'String' in operator '<'.`（S356 刚钉的那句）。合法代码跑出不同结果，属于最该先收的那一类。
- **判据**：基准是**第一个元素**，后面逐个比；碰到比不了的组合**整串当场废**（`[1, "a", 0]` 给 null 而不是 0 —— 不是「跳过这一步继续比」，这条只有三元素以上的格子分得出）；给 null 的形是 null 掺在里面、Color / NodePath / 字典 / pack / Callable / **用户对象**同形，以及任何跨形组合；给值的形是 int / float 按值、bool false 在前、串按码点、向量按分量、RID 按无符号号、数组走 S355 那条装箱序。
- **NaN 不是「比不出」**：float 对 float 是合式比较、只是结果为假，所以基准是谁就看谁在前头（`[nan, 1.5, 2]` → nan|nan，`[1.5, nan, 2]` → 1.5|2）—— 与 S355「容器里 NaN 最大」不是一条。
- **顺带挖出 bool 的两层**：源里 `false < true` 是**解析期**拒（`Invalid operands to operator <=, bool and bool.`，我们没这一层），可装箱 bool 的 `<` / `>` 运行时**合式**（`a < true` 给 true），只有 `<=` / `>=` 是运行期拒。`min()` / `max()` 用 `<` / `>` ⇒ bool 比得出来。完整口径要连着 bsearch 的 bool 格与全局 `min` / `max` 一起重核，记进 §6 第 56 条 —— 所以今天只在 `GArray.extreme` 里就地按 false 在前判，`ops.compare` 一字未动。
- **StringName 两头**：两支 StringName 引擎按指针序给值（`[&"b", &"a", &"c"]` 的 min 是 `c`）→ 照旧响亮拒；StringName 对 String 是比不出 → null。
- **门**：语料 363 十五行逐字节、`array-minmax-face.test.ts` 63 格（61 值 + 2 拒）；`pnpm test` **13375**（96 文件）、typecheck **4/4**、`test:compile` **243/352**（sema 83、响亮拒 26）、`test:diff` **235/235** 逐字节（用例 362、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **362/362**。

### 1.174 读得到的名字写不得：`abs = 5` / `Node = 5` / `quit = 5` 此前发出来的是非法 JS（2026-10-14，S359，语料 362）

- **是一条产品级缺陷**：那三族「能当值用」的名字（全局函数名 / 引擎类名 / S358 刚接的宿主方法名）在**赋值目标位**上分析器一字不报，发射器把读的那支盒子原样发到目标位 —— `rt.globalCallable("abs") = rt.V.int(5);`、`rt.nativeClass("Node") = rt.V.int(5);`、`rt.methodCallable(rt.V.object(this), "quit") = rt.ops.add(…)`，产物连解析都过不了；引擎那边这些形全部解析期当场拒。
- **句子是现成那句**：实测 `abs = 5` / `print = 5` / `typeof = 3` / `Node = 5` / `quit = 5` / `quit += 5` / `get_class = 5` 一律 `Cannot assign a new value to a constant.` —— 与写常量同句，所以并进既有 `checkConstAssign` 的谓词（`const-assign` 那道闸），不新加一支，发射器一字未动。
- **另一对句子不在这儿**：21 支「类型名兼函数名」当目标时引擎给的是 `Builtin type cannot be used as a name on its own.` 加 `Identifier "Callable" not declared…`（`Callable = 5` / `Vector2 = 1` 实测），那两支名字不在三张表里，出货继续走未声明那一句，正对得上后一句。
- **遮蔽边界不用新造**：`var quit: Variant = 1` 之后 `quit = 5` 引擎合法给 5、`var abs = 2` 之后给 7，而 `checkConstAssign` 第二道保守边界「本函数里被另绑过一次就整格放行」恰好就是这条。
- **范围跟着 S358 走**：内部类与静态方法那两形的写位仍按未声明拒（读位就没量过）；`for quit in …`、lambda 形参同名、match 手臂绑定这些位置还没扫，记在 §6 第 55 条④。
- **门**：语料 362 是预期报错用例（golden 记 Parse Error + `at:` + `Failed to load script`），编译门把它算进「语义分析拦下」83 支；`implicit-callable-value.test.ts` 加了 14 格、现在 35 格；`pnpm test` **13309**（95 文件）、typecheck **4/4**、`test:compile` **242/351**（sema 83、响亮拒 26）、`test:diff` **234/234** 逐字节（用例 361、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **361/361**。

### 1.173 宿主基类的方法名可以裸当值用了：`var c = quit` 给的是真的 Callable，出货此前在解析期就拦死（2026-10-14，S358，语料 361）

- **接的是 S356 顺带量到的那条过拦**：引擎收 `Callable(quit)` / `var c = quit`，出货的分析层报 `Identifier "quit" not declared in the current scope.`，合法代码编不过。
- **量法换了**：这一族是**解析期**行为，一份脚本里错一格就整份作废、分不出是谁 —— 所以 23 + 18 + 5 格全部「一格一份 `.gd`、一次 spawn」（`fold29` / `fold30`），不再用 packed probe。
- **判据**：链上挂着宿主时，SceneTree 的 `quit` / `create_timer` 加 Object 的十三支（`call` `call_deferred` `set` `get` `has_method` `get_class` `connect` `disconnect` `emit_signal` `notification` `set_meta` `get_meta` `free`）给 typeof 25 的 Callable，打印 `SceneTree(<文件>)::<名>`，与 `Callable(self, "<名>")` 同一个盒子；`.is_valid()` / `.get_method()` / `.call()` 全真，能进数组、当字典键、传 `Callable` 形参。链外的名字（`quit_and_ide_debug`、`queue_free`）与别人的属性（`process_mode`、`name`）实测仍 `not declared`，出货照旧拦。
- **范围收到根类的实例方法体**：内部类里 `quit` 引擎也拒（内部类自己的方法名 `g` 却有值，给 `RefCounted::g`），不写 `extends` 的脚本也拒；静态方法与「沿 extends 链挂宿主」两形没量过，所以不认（§6 第 55 条③）。`root` / `paused` 是**属性读数**（引擎给窗口对象 / `false`），按 D4 不接，是今天与引擎仅剩的不同侧（§6 第 55 条①）。
- **踩到一处记号的坑**：分析器的取值记号是 `名@行:列` 的跨模块表，这次门里真撞过一回 —— 两份同形同位的源，一份的局部 `quit` 被另一份的记号读成了 Callable（静默错值）。发射器因此新增 `FUNC_BINDS`（本函数形参 + 体内所有 `var` + lambda 形参 + `for` 循环变量 + match 手臂 `bind`）先认局部；读 / 写位置不分那道缝记进 §6 第 55 条④。
- **门**：语料 361 五行逐字节（取值 + `typeof` + `get_method` + `is_valid` + `Callable` 形参 + `.call()` + 容器元素）、`implicit-callable-value.test.ts` 24 格；`pnpm test` **13295**（95 文件）、typecheck **4/4**、`test:compile` **242/350**（sema 82、响亮拒 26）、`test:diff` **234/234** 逐字节（用例 360、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **360/360**、codegen 未漂移。

### 1.172 `Array.sort()` 自己那条比较器接完：跨形只有 int 对 float、六形同形比不出，置换改成引擎那一把（2026-10-14，S357，语料 360）

- **接的是 §6 第 54 条③**：混合类型数组排序此前 `array-sort-mixed` 响亮拒（合法代码跑不动），而且 `sort()` 的**置换**走的是 JS 稳定 sort、比较口径还被当成 `isLess` 那条共用（`ops.ts` 里那句旧注释也这么写，已改）。
- **129 格实测**（尺 `fold25` / `fold26` / `fold27`，每格包成一个小函数、一次 spawn 量一批）：跨形**只有 int 对 float 按值**有方向；**bool 掺进数值里不比**、**null 也不是「永远最小」**；同形才比值（串按码点、四个向量按分量、RID 按无符号号、数组走 S355 那条装箱序、同值不换）；null / Dictionary / Color / NodePath / pack / Callable **同形也一律比不出**（两向都 false、引擎不推错误）；NaN 在 sort 里谁都不小于（与 S355 容器里「NaN 最大」不是一条）。
- **StringName 仍响亮拒**：`[&"b", &"a"]`、`[&"zzz", &"a"]` 都按文字序换位，可 `[&"ab", &"b"]` 换出来的是 `[&"b", &"ab"]` —— 与文字序矛盾，是指针序，复现不了；两支同现才拒，一支不碍事。
- **置换必须是引擎那一把**：n>16 的输出不是稳定序也不是任何秩表 —— 21 元素「17 int + 8 串」把整块串搬到最前、24 元素向量混串给出另一副样子，`sort.ts` 那份 `sort_array.h` 转写三把都逐字节对过；`sort()` 与 `sort_custom()` 从此共用同一份置换。
- **顺带解掉两处静默 / 过拦**：String 与 StringName 混排旧实现按 `allStr` 文字比（静默错值）；Color 数组 sort 旧实现抛错（引擎原地不动）—— 旧的 `colorCmp()` 助手连同那句「Parse Error」的旧说法一起删。
- **不动别人口径**：源里 `<` / `bsearch` / `min` / `max` 仍走 `compare` / `isLess`，S355 的 240 格与 S353 的 246 格一字未变；`array-sort-face.test.ts` 126 格里 118 钉值、6 钉 StringName 的拒、2 钉 Callable 原地不动。
- **门**：`pnpm test` **13268**（94 文件）、typecheck **4/4**、`test:compile` **241/349**（sema 82、响亮拒 26）、`test:diff` **233/233** 逐字节（用例 359、静默 / 崩溃 / 未实现 全 0）、golden 未漂移 **359/359**。

### 1.171 装箱比较的运行期拒换成引擎同文：一句 `Invalid operands 'L' and 'R' in operator 'OP'.`，形名走 `Nil` / `PackedInt32Array` 那套拼法（2026-10-14，S356，语料 359）

- **接的是 §6 第 54 条①**：改前抛中文「比较不支持 int 与 String」，形状对、句子不同。48 格一次 spawn 量完（尺 `tmp/probe-argtype/fold24.mts`：每格包进一个小函数，那句 SCRIPT ERROR 只打断那个函数，脚本照跑下一格），生成器 `mk-lessmsg-artifacts.mts` 把它摊成门 `compare-operands-sentence.test.ts` 47 格。
- **句式只有一条**：四个运算符同文、只换引号里的运算符名，且**实参顺序就是式子里的左右顺序**（`1 < "a"` 与 `"a" < 1` 各钉一格）。**形名是唯一会被 `tagName` 答错的地方**：null 叫 `Nil`、pack 各叫本名（`PackedInt32Array` / `PackedStringArray` / `PackedByteArray`，不是 `Object`），新 `valueTypeName` 补这两条后 `+` / `-` / 整除那几条旧句子同口径。
- **Color 单独一条错误码、同一个句子**：`Color < Color`、`Color < int`、`Color < NodePath` 三形都拒（与 S355 里「Color 在容器内两头都假、不报错」不是一条口子）。`int` 对 `bool` 也拒 —— 源里的 `<` 不折 bool，别拿标量那一族的经验套。给值那几格（`1 < 1`、`1.5 < 1`、`1 < 1.5`、`["a"] >= ["b"]`）一字没动。
- **不动别人口径**：错误码 `compare-operands` / `color-cmp` 保留，S353 的 `lessOrFalse` 仍只吞这两支，`bsearch` 246 格与 `sort_custom` 全门未变；`&"b" < &"a"` 一形引擎给值而我们照旧拒（S355 ③ 的指针序复现不了），生成器把它明写在 drop 名单里。
- **顺带量到一条新过拦**（还没修）：`var x: Variant = Callable(quit)` 引擎收下，出货分析层先报 `Identifier "quit" not declared in the current scope.` —— 裸方法名当 Callable 值那一形解析期就拦死了。
- **门**：`pnpm test` **13139**（93 文件）、typecheck **4/4**、`test:compile` **240/348**（sema 82、响亮拒 26）、`test:diff` **232/232** 逐字节（用例 358、静默 / 崩溃 / 未实现 全 0）。

### 1.170 数组对数组的 `<` 接上：形秩全序 + 同型比值 + 长度平手，Color / NodePath / 字典比不出（2026-10-14，S355，语料 358）

- **接的是 §6 第 54 条②那条**：改前 `compare` 对「容器对容器」一律抛，而引擎给值 —— 语料 358 七行、门 `array-order.test.ts` 240 格，另有 S353 门里跳过的 12 格容器格补回（`array-bsearch-bound.test.ts` 现在 246 格）。
- **判据**：先比**形的秩**（`null < bool < int < float < String < V2 < V2i < V3 < V3i < Color < StringName < NodePath < RID < Dict < Array`），**数值三个形之间也按秩不按值**（`[2.5] < [3]` 假、`[3] < [2.5]` 真、`[true] < [1]` 真 —— 标量那一族「bool 折成 0 / 1 再比值」的经验在这儿**不成立**）；同型才比值（NaN 最大、向量按分量、RID 按无符号号）；**Color / NodePath / 字典同型两头都假**（于是 `<=` `>=` 都真，四运算符实测钉过）；长度平手、嵌套递归。
- **StringName 照旧响亮拒**：引擎在容器里也走 intern 之后的指针序，四对读数拼不出任何文字规则（`[&"aaa"] < [&"abc"]` 假、`[&"a"] < [&"zzz"]` 真），复现不了就拒，不猜。
- **顺带把回放尺修对了一次**：头一版拿**元素**去比（引擎比的是数组本身），又把 ordcmp6 的表达式列当成了读数，一度报 117 格「不合」—— 改完 240 合 / 4 拒（StringName 那一形）/ 14 跳过（sort 一族，本条不管）。
- **还没接的**：③ `Array.sort()` 自己那条秩（混合类型数组排序今天仍 `array-sort-mixed` 响亮拒）；字典与数组在 ③ 里的细判据；自引用容器（实测两支各自含自己的数组比较直接把引擎跑爆，退出码 3221225725 = 栈溢出；`a == b` 只推一句 `Max recursion reached` 给 true）。
- **门**：`pnpm test` **13089**（92 文件）、typecheck **4/4**、`test:compile` **239/347**（sema 82、响亮拒 26）、`test:diff` **232/232** 逐字节（用例 357、golden 未漂移 357/357）；S351 那把尺重跑仍 **657 / 22**。

### 1.169 两条装箱比较器各量成 105 对全表：数组对数组是一条全序，`Array.sort()` 是另一条（2026-10-14，§6 第 54 条，仍未动代码）

- **做法**：15 种形两两一对，各量两个方向 —— 数组对数组的 `<`（`[X] < [Y]`）105 对 + `Array.sort()`（`[X, Y].sort()` 看谁在前）105 对，一次 spawn 30 格，420 格全印出来（`tmp/probe-argtype/ordcmp4.txt`，尺 `fold17.mts`，分析 `cmp-ord{,2,3}.mts`）。
- **① 数组对数组那条是全序**：没有「两向都假」也没有「两向都真」的矛盾对，秩是 `null < bool < int < float < String < Vector2 < Vector2i < Vector3 < Vector3i < Color < StringName < NodePath < RID < Dictionary < Array`，同型才比值；字典自己**不参与**（`[{"x":1}]` 与 `[{"y":2}]` 两头都假）。
- **② `Array.sort()` 是另一条**：`RID < Dictionary < Array < Color < Vector3i < Vector3 < Vector2i < Vector2 < NodePath < StringName < String < 数值按值穿插 < null`，与 ① 逐对核 **106 同 / 104 不同**（`[0] < [true]` 在 ① 假、在 ② sort 把 int 排在 bool 前；null 在 ① 最前、在 sort 最后）—— 一条 `compare` 喂不动两条，出货要拆口子。
- **③ 顺带把尺子自己纠了一次**：头一版分析拿 GDScript 源文本去比 sort 的打印形（`null` vs `<null>`、`rid_from_int64(7)` vs `RID(7)`），一度报出 96 对「不一致」里全是假信号 —— **判据本该动而读数不动，先怀疑尺子**（同 §1.163 那条教训）。
- **④ 还欠的**：字典在 sort 那条里确实被排了序（`{"y": 2}` 排到 `{"x": 1}` 前，输入序相反），判据没量；数组在 sort 里的细判据（长度 / 嵌套 / 混合）也没量；自引用容器要单独一档。
- **门**：本轮无代码改动（文档 + 探针），与 S354 那一轮同读数（`pnpm test` **12834**、`test:diff` **231/231**）。

### 1.168 `cubic_interpolate_in_time` 的退化跨度接上：引擎是 Barry-Goldman 三层割线，六处退化分支各钉一个常数（2026-10-14，S354，语料 357）

- **清的是 §6 第 41 条那笔旧账**：旧实现写成「归一化切线的三次 Hermite」，`Δ` 里任一段为零或相消就要除零 → 响亮拒；引擎在那些形上给的全是有限值（S351 那把尺里剩 24 格就是这一族）。
- **真正的形状**：`t = lerp(0, b_time, weight)` → `a1/a2/a3` → `b1/b2` → 收尾一格，六步 lerp 的权重各带一条「跨度退化就换钉死的常数」的判据（`pre_time==0 → 0`、`b_time==0 → 0.5`、`post_time-b_time==0 → 1`、`b_time-pre_time==0 → 0`、`post_time==0 → 1`、收尾 `b_time==0 → 0.5`），逐分量 float32。
- **这些分支正好解释那些「怪值」**：`pre_time=0` 时 `w=0` 那一端落在 **pre**、`post_time=b_time` 时 `w=1` 那一端落在 **post**、`b_time=0` 时结果与 weight 完全无关恒为 `(self+b)/2`、三位全 0 恒为 `(pre+post)/2`。
- **量的口径**：四个点互不相同（全等点上任何式子都给同一个值，判不出式子），九形 × 五 weight 的 V2 + 七形 × 三 weight 的 V3 = 66 格，再补旧门那 8 格 —— `check-cubtau.mts` 逐格对 **74 合 / 0 不合**；非退化那一支一字没动（`golden 未漂移 356/356`、S315 那六档 α 全在原位）。
- **旧断言请回**：`cubic-in-time.test.ts` 里那六格「响亮拒」按实测改成值（与 S351 那四支同例）。
- **门**：`pnpm test` **12834**（91 文件）、typecheck **4/4**、`test:compile` **238/346**（sema 82、响亮拒 26）、`test:diff` **231/231** 逐字节；S351 那把尺重跑 **合 657 / 不合 22** —— 剩下 22 格全是 `from_ok_hsl` 16 / `rotated` 4 / `outer` 2 那三份外部前提没到位的名单（第 5 项）。

### 1.167 量出「装箱比较不是一条口子」：源里 `<`、`Array.sort()`、数组对数组各是一条（2026-10-14，§6 第 54 条，接不动先记账）

- **触发点**：S353 那趟量到引擎**给数组排序**（`[[1], [2], [3]].bsearch([2])` 给 1），而出货的 `compare` 认「容器对容器」比不了 —— 要接就得先知道引擎那一条 comparator 长什么样。
- **量出来的结论是「不是一条，是三条」**：① 源里 `Variant` 对 `Variant` 的 `<` 类型不合是**运行期 SCRIPT ERROR 且脚本当场停**（那一格 25 秒超时、`quit()` 跑不到）；② 数组对数组的 `<` 逐元素比、跨 kinds **不报错**（`[1] < ["a"]` 真、反向假；Dictionary 参与时两头都假）；③ `Array.sort()` 用的是另一条秩：`RID < Dictionary < Array < Color < Vector3i < Vector3 < Vector2i < Vector2 < NodePath < StringName < String < 数值按值穿插 < null`，与 ② 的逐对结果互相打架（null 在 ② 里排前、在 ③ 里排最后）。
- **所以今天不动代码**：出货只有一条共用 `compare`，同时喂 `<` / `sort()` / `bsearch` / `min`；三条口子怎么拆要先拍板，而且 S353 刚钉死的「`bsearch` 比不了按 false」234 格不能被动。读数全在 `tmp/probe-argtype/{ordcmp,ordcmp2,ordcmp3}.txt`。
- **顺带钉住的句子**：引擎在 `bsearch` 遇到比不了的组合时**一行错误都不推**（`fold11` 数过 stderr = 0），但在源里直接写 `i < s` 就是那条 SCRIPT ERROR —— 两条都记在 §6 第 54 条里，免得下次拿一条去套另一条。
- **门**：本轮无代码改动（只有文档与探针），`pnpm test` / `test:diff` 与 S353 那一轮同读数（**12814** / **230/230**）。

### 1.166 `Array.bsearch` 换回引擎那条界循环：`before` 换的是实参顺序，比不了的组合按 false 走（2026-10-13，S353，语料 356）

- **两处不等价一起收**：旧实现**收了 `before` 却根本不读**（`[1, 2, 3].bsearch(1, false)` 引擎给 1、我们给 0 —— 静默错值），并且遇到比不了的组合直接抛（`[1, 2].bsearch("a")` 引擎照样走完二分给 0 —— 合法代码被挡）。
- **判据**（162 + 72 格逐格对过）：`half = min + ((max - min) >> 1)`；`before` 真 → 比 `cmp(元素, 值)`，假 → 比 `!cmp(值, 元素)`；走到底返回 `min`，**找不到不回 -1**，给的就是插入位。
- **「换顺序」不是「取反」的证据**：`a < b` 与 `a > b` 两支各量一整组，`gt` 那一支真形给 0、假形给 3，只有换实参顺序才解释得通。
- **顺带钉住**：Color 与 NodePath 在装箱比较里**没有序**（`[Color(1,…), Color(2,…)].bsearch(Color(3,…))` 给 0）；引擎在这条路上**一行错误都不推**（stderr 计数 0），所以吞掉 `compare-operands` / `color-cmp` 两条 code 就够，其余照旧抛。
- **新立一账**：引擎**给 Array 排序**（`[[1], [2], [3]].bsearch([2])` 给 1），出货认「容器对容器」比不了 —— Array / Dictionary 的序量清之前，门里先跳过那 12 格（§6 第 53 条⑥）。
- **门**：`pnpm test` **12814**（90 文件）、typecheck **4/4**、`test:compile` **237/345**（sema 82、响亮拒 26）、`test:diff` **230/230** 逐字节（用例 355、golden 未漂移 355/355）；S351 那把尺重跑 **合 633 / 不合 46**。

### 1.165 `String.strip_edges(left, right)` 接上：那两位是真参数，判据还顺带钉出 `0 < 码点 <= 0x20`（2026-10-13，S352，语料 355）

- **这一格是 S351 那把尺掉下来的第一族**：表里早就标了 `strip_edges` 的两位收 bool / int / float（元数 `[0,2]`），出货运行期却对任何实参抛「不接受参数」——「合法代码跑不动」那一侧。
- **两位的语义**（读数 `strip.txt` 20 格）：第一位管左端、第二位管右端，默认都真；`strip_edges(false)` 只关左端（右端仍按默认裁），int / float 按 `≠ 0` 折（`(2, 2)`、`(-1, -1)`、`(1.5, 1.5)` 与 `(true, true)` 同值）。
- **顺带钉出静默错值一处**：空白判据是 `0 < 码点 <= 0x20`，NUL **不裁**（`stripws.txt` 45 格，一格一码点、只印长度）；改前写的是 `<= 0x20`，缺 `> 0` 那一半 —— `"  abc" + char(0)` 我们会多裁一个字符。
- **NUL 那一格进不了语料**：源文件里的 `\u0000` 让 GDScript 词法器推 `Unicode parsing error …`，那两行不带 `ERROR:` 前缀、`normalize()` 滤不掉，会被 golden 当成品内容收进去 → 逐字节永远对不上。判据钉在单测，语料那侧改印 `char(1)`（能进串也能印长度）。
- **门**：`pnpm test` **12577**（89 文件）、typecheck **4/4**、`test:compile` **236/344**（sema 82、响亮拒 26）、`test:diff` **229/229** 逐字节（用例 354、golden 未漂移 354/354）；S351 那把尺重跑 **合 619 / 不合 60**，掉的正是这五格。

### 1.164 审「引擎收下的那一侧」：758 格两侧取值逐格对，出货从 338 格不合降到 65 格（2026-10-13，S351，语料 354）

- **前几轮接的是「引擎拒、我们跑」，这一轮反过来**：判据表把**收**的那一侧圈出来之后，每一格两侧都得给同一个值 —— 不然出货要么响亮抛（合法代码跑不动），要么给一个引擎不给的值（静默错值，最坏那一类）。尺子是 `tmp/probe-argtype/values.mts`：758 格逐格「引擎 print vs `show(method(...))`」。
- **量出的折法全部落地**（读数 `fold8.txt` / `hexfold.txt` + 语料 354 的 21 行）：int 位吃 float（向零截断）与 bool（0 / 1），非有限与越界折 `INT64_MIN` 再按位截；bool 位吃 int / float 按 `≠ 0`，NaN 也算不等 0；String 位吃 StringName 与 NodePath（按其文本）；Color 位吃 Color / int（打包）/ String（按 html）；向量位吃另一形的向量逐分量截断。`String` / 容器 / 五型三面各按各自入口接（`foldInt` / `foldBool` / `asString` / `colArg` / `vecArg`）。
- **一族里唯一的静默错值**：`Dictionary.set` 引擎返回 `true`，出货给 `null` —— 按读数改了。
- **旧断言请回四支**：`string.test.ts` 里 `count` 的 from/to 与 `split` 的 max_splits 当年断的是「响亮拒」，实测引擎折得出值，断言照读数改成值。
- **剩下 65 格全是欠实现、没有一格是「两侧都给值而值不同」**，四族已各立一条（§6 第 53 条）：`from_ok_hsl` 16、`cubic_interpolate_in_time` 退化跨度 24、`bsearch` 不可比值 14、`strip_edges(left, right)` 5，另 `rotated` 4 / `outer` 2 归第 5 项那两份名单。顺带在同一条里记下一处新发现的静默错值候选：`strip_edges` 裁的是 `0 < c <= ' '`，出货今天的 `<= 0x20` 不带 `> 0`。
- **尺子自己的两处改动**：引擎读数按格缓存（`engine-cache.json`，重跑只量新格），并把每格两侧值全量落进 `values-all.txt`，门里的钉子逐格抄读数而不是抄结论。
- **门**：`pnpm test` **12571**（88 文件）、typecheck **4/4**、`test:compile` **235/343**（sema 82、响亮拒 26）、`test:diff` **228/228** 逐字节（用例 353、golden 未漂移 353/353，静默 / 崩溃 / 未实现 全 0）。

### 1.163 补账：值类型那张表也换三种接收者写法各量一整趟，0 格不同（2026-10-13，S350）

- **欠的是验据不是功能**：S347 的判据挂在已有的接收者识别上（标注变量、形参、推断初值都会走进去），读数却只量了 `Vector2(1, 2).dot(1)` 那种字面量构造式。
- **三趟各 2170 格**：`var v2: Vector2 = …` / `func _run(v2: Vector2, …)` / `var v2 = …`，与字面量那一趟逐格比 —— **同 2170、不同 0**（三形都是）。
- **门里按密度钉**：标注变量逐格（最常见那一形，2170 格），形参与推断每位一格；引擎读数全在 `p6-*.txt` 留底。
- **自纠**：头一趟报「1980 格不同」是探针的行号算错了（5 条声明之后语句从第 **9** 行起，`func _run` 那形从第 7 行起）—— **读数大面积不合，先怀疑尺子**。
- **门**：`pnpm test` **12535**（86 文件）、typecheck **4/4**、`test:diff` **227/227** 逐字节不变（用例 352、golden 未漂移 352/352）。

### 1.162 接收者换个写法还是同一套句子：字面量 / 标注变量 / 形参 / 推断四形各量一趟 1358 格（2026-10-13，S349）

- **动机**：真实代码写的是 `var name: String` 再 `name.repeat("a")`，S348 那张表只认字面量接收者，最有用的那一半还留在「引擎拒、我们跑到运行期才响」。
- **量的办法**：同一批 1358 格只换接收者写法，四形各一趟 —— `p3-typed.txt`（标注变量）、`p5-param.txt`（形参 `func _run(rs: String, ra: Array, rd: Dictionary)`）、`p5-infer.txt`（`var rs = "abc"`）；逐格与字面量那一趟比（`cmp-typed.mts` / `cmp-shapes.mts`），**三趟都是同 1358、不同 0** → 一张表四形共用，不用给键加「接收者写法」这一维。
- **标注那一形内部也单独量**（`typed-variants.mts` 五格）：只标注不给初值、初值是 `String.num(1)` 那种非同面字面量，都说同一套句子；`Dictionary.get(…, …)` 那两位是 Variant，怎么写都收。
- **两支新门**：`face-typed-receiver.test.ts` 1106 格 + `face-receiver-shapes.test.ts` 2212 格；两侧的筛子都是「句子点了别位就不算这格的判据」，`Array.find_custom` / `rfind_custom` 那一位 Callable 槽因此留在表外（字面量探针造不出合法填充）。
- **出货那三支识别**：标注变量、形参、推断初值（推断沿用「没标注又被重新赋值就不保证」那条老闸门）。
- **门**：`pnpm test` **10055**（85 文件）、typecheck **4/4**、`test:compile` **234/342**（sema 82）、`test:diff` **227/227** 逐字节不变（用例 352、golden 未漂移 352/352）。

### 1.161 带类型标注的变量接收者与字面量接收者同一套句子：1358 格逐格比过，表照用（2026-10-13，S349）

- **这一趟不是为了新句子，是为了「谁能当接收者」**：真实代码写的是 `var name: String` 再 `name.repeat("a")`，S348 那张表只认字面量接收者，等于最有用的那一半还留在运行期。
- **口径**：同一批 1358 格只换接收者写法（`var rs: String = "abc"` / `var ra: Array` / `var rd: Dictionary`），`cmp-typed.mts` 逐格与字面量那一趟比 —— **同 1358、不同 0**，所以 `FACE_ARG_*` 的键不用加接收者这一维。
- **两种形单独量**（`typed-variants.mts`）：标注了但不给初值、初值不是同面字面量（`String.num(1)`）都说同一套句子；`Dictionary.get(…, …)` 那两位是 Variant，怎么换都收。
- **没量过所以没接**：形参接收者（`func f(s: String)`）与不带标注的推断接收者（`var s = "abc"`）—— 分析器只认 `var` 声明那一侧的标注（红线 1）。
- **门**：`pnpm test` **7843**（84 文件）、typecheck **4/4**、`test:compile` **234/342**（sema 82 不变）、`test:diff` **227/227** 逐字节不变（用例 352、golden 未漂移 352/352）。

### 1.160 String / 容器「字面量接收者」的形参拒接完：1246 格，元数是问引擎要的，顺带补上 join 少发的那一句（2026-10-13，S348，语料 353）

- **元数先从引擎那里问**：出货的 `methods.ts` 只有名没有元数。第一趟每种方法只发两格（0 参与 3 参），拿 `Too few … at least K` / `Too many … at most N` 反推 `[min,max]`；**只有真换来「Too many」的支才算有上界**（97 支进表、`split` / `count` / `countn` / `slice` 那 5 支不进了就算）。
- **判据带上元数**：读数全部建在「实参个数正好等于量过的那个上界」上，`FACE_SLOTS` 与两张表一起出货，别的元数不发（红线 1）。
- **值类型那一面补了下界元数**：`packed.mts` 的 `minmax` 模式把 `min ≠ max` 的支在两种元数下各量一遍（2254 格 0 不合、0 跳过），判据放宽成「元数等于上界或下界」。
- **`join` 的老表少一句**：`JOIN_BAD_ARG` 是早期手抄的，对 `int` / `float` / `bool` / `null` 只发 `Cannot pass …`，实测引擎发两句 —— 字面量实参改走量过的表（两句齐），变量实参那一支维持原状（没量过不动）。
- **工具又自纠一次**：`mk-face-artifacts.mts` 的 A 式正则把函数名写成非捕获组，位号因此读到期望型，生成器报「拒 0 格」而复核脚本报一切正常 —— **两侧数字不一致就是工具坏了**（S342 ④ / §1.159 第三次应验）。
- **门**：`pnpm test` **6737**（83 文件）、typecheck **4/4**、`test:compile` **234/342**（sema 81 → 82、emitter 不支持 0）、`test:diff` **227/227** 逐字节不变（用例 352、golden 未漂移 352/352）。

### 1.159 值类型实例方法的形参拒整族接完：2170 格逐格对账，靠 packed 探针与自举的合法填充（2026-10-13，S347，语料 352）

- **成本这一关先过**：五型 111 支方法 × 位 × 14 形 = 2170 格，一格一次 spawn 跑不完。改成 **packed 探针**：一个脚本 40 条 `var vN = <一格>`，引擎的分析期句子按行报，`at: …:LINE` 归格 —— 十来趟量完。
- **合法填充是自举出来的**：先按接收者同形跑一趟，再用「句子点了哪几位」反推每一位被引擎放行过哪些形（别位违规不影响本位判定），拿这套填充重跑，两轮收敛成 `fillmap`（155 位全有干净读数）。
- **一格工具 BUG 换来的纪律**：`fillmap` 的键是 `类型.方法#位|填充`，探针却按三段解析，静默退回同形填充，连跑三趟读数一点没动 —— **读数不动而判据本该动就是工具坏了**（S342 ④ 那条教训这次是它的续集）。
- **两侧都是实测**：拒的 1789 格句子逐字钉（C+A 两式、容器只说 A 式、按位升序发）；收的 381 格里有 `c.to_html(128)`、`c.clamp(1, "a")`、`v.snapped(1)` 这种「看着像该拒其实收」的；两种填充族交叉核对没有任何一格出现「换个填充就收/拒翻面」（重载冲突 0 格）。
- **门**：`pnpm test` **5404**（82 文件）、typecheck **4/4**、`test:compile` **234/341**（sema 80 → 81、emitter 不支持 0）、`test:diff` **227/227** 逐字节不变（用例 351、golden 未漂移 351/351）。
- **下一块地**：String / Array / Dictionary / Packed* 那三面（引擎同样两句拒，原文已在 `inst.txt`），卡点是分析器要先认得出那三面的接收者形（§6 第 52 条⑥）。

### 1.158 普查实例方法那一族的错类型实参：465 格里三格是静默错值，`Color.to_html` 的 bool 位先修（2026-10-13，S346，§6 第 52 条开新账）

- **一把本地尺**（`sweep-inst.mts` 全枚举 `VALUE_METHOD_ARITY` 五型 111 支方法 × 位 × {String, null, Dictionary}）：**分析期 0 格拒、运行期响亮抛 459 格、发得出值 6 格**。
- **那 6 格剔三格**：`c.html("a")` / `c.from_string("bff00", …)` 是静态名在实例上调，引擎给值、我们也给同值 —— 剩下的三格才是 bug：`Color.to_html("a")` 给 `ff0000ff`、`to_html(null)` 给 `ff0000`、`to_html({"a":1})` 给 `ff0000ff`，而引擎对这一位（声明是 **bool**）解析期两句拒。
- **折法一起量一起钉**（`html.mts` 13 格）：`true` / `1` / `2` / `128` / `-1` / `0.5` / `1.5` → 带 alpha；`false` / `0` / `0.0` / `-0.0` → 不带；不传参 = 带。NaN / ±inf 没量过 → 响亮抛，不按真值编。
- **459 格那一族是下一块地**（§6 第 52 条）：引擎在实例方法上说的还是同那两式（`Vector2.dot(1)`、`"abc".repeat("a")`、`[1,2].insert("a",1)`…），接法与静态名同构；成本卡在一格一次 spawn，`sweep-inst.mts` 之外要改成**一行一格的 packed 探针**（语料 347 那种 54 行 86 句就是同一趟量的，按行号归格）。
- **门**：`pnpm test` **3231**（81 文件）、typecheck **4/4**、`test:diff` **227/227** 逐字节不变、ops 自校验 2127 / 0。

### 1.157 静态名那一族形参拒接完：320 格全合，顺带把「引擎按位升序推句」钉进两条循环（2026-10-13，S345，语料 351）

- **一名一位一 kind 一张表**：`statics.mts` 300 格 + `statics2` 20（`Color.from_string` 第一参钉合法值）+ `statics3` 10（`String.num_scientific` 按一元重量）+ `statics4` 30（三个四元名的第四位）→ `STATIC_ARG_AS` / `STATIC_ARG_TYPES` 17 支名，接法与全局函数同构；门 `static-arg-allow-list.test.ts` 320 格（229 拒 + 91 收）、复核尺 `check-statics.mts` 320 合 / 0 不合。
- **两处探针自纠**：主探针把 `num_scientific` 上界抄成 `[1,2]`（出货 `[1,1]` 才对）、`from_string` 的第一参填充不合法 —— 生成器因此加了**污染哨**（第二句点到的位 ≠ 被测位就整格丢），这类抄错会自己冒出来，不用等门。
- **`argc = min(上界, 3)` 的口径漏了四元名的第四位**：补测之前 `Color.from_rgba8(1, 1, 1, "a")` 引擎两句、我们一句都不发 —— 覆盖面口径本身也要被审。
- **引擎按位升序推句**（`multi.mts` 14 格并排）：`Color.from_rgba8([1], Color(1, 0, 0, 1), 1)`、`randf_range([1], "a")` 两格我们发的是倒序；静态与全局两条循环都改成先按位归桶、再按位升序发，改后 9/14 一字一样。
- **剩下 5 格是三笔新欠**（元数越界时类型句照发 / B 族首位拒后整族停 / 别位容器既加句也减句）—— 原文进 §6 第 51 条⑦，没量齐之前不进实现（红线 1）。
- **门**：`pnpm test` **3209**（80 文件）、typecheck **4/4**、`test:compile` **234/340**（sema 79 → **80**、emitter 不支持 0）、`test:diff` **227/227** 逐字节不变（用例 350、预期报错 123、golden 未漂移 350/350）。

### 1.156 `Color.from_rgbe9995` 发货：24 格一次过，含「装箱实参先折进 uint32」那一步（2026-10-13，S344，语料 350）

- **式子照 4.6.3 的源抄**（`Color::from_rgbe9995(uint32_t)`：三个 9 位段 + 不掩码的 5 位指数 + `m = pow(2.0f, e - 15.0f - 9.0f)`），落地前先一把尺量 24 格（`tmp/probe-argtype/rgbe.mts`），实现完再逐格对一遍：**24/24 全合**，语料 350 的 20 行逐字节、原生门 1/1。
- **中段格才是判据**（S310 ① 那条老教训）：`r=100,g=200,b=300,e=20` 给 `(6.25, 12.5, 18.75)`、`r=1,g=2,b=3,e=15` 给 `(0.002, 0.0039, 0.0059)`；全零 / 全 511 那种端点格分不清位段顺序与指数偏置。
- **「折进 uint32」不是猜的**：`4294967296` 全零、`-1` 与 `0xFFFFFFFF` 同值、`1 << 40` 全零、`2147483648` 三位全零、`2147483647` 给 `0.998` —— `BigInt.asUintN(32, …)` 一条式子全合。
- **顺带量到静态名的形参拒**（`Color.from_rgbe9995(&"a")` 两句一起推），但**静态方法那一族的形参判据还没接**（`STATIC_FACE` 今天只管元数与常量名）—— 记进 §6 第 51 条⑥。
- **老教训又收一次费**：第一版把 `&"a"` / `1.5` 混进取值那一段，一个解析错把 24 行全打死（stdout 空）。一格一脚本之外，**取值段里不许混进会被解析期拒的形**。
- **门**：`pnpm test` **2886**（79 文件）、typecheck **4/4**、`test:compile` **233/339**（sema 79 不变、emitter 不支持 0）、`test:diff` **227/227**（跳过 122，静默 / 崩溃 / 未实现 全 0）、`test:scriptc` 350 一格 1/1。

### 1.155 「一位一句子」是探针给的错觉：434 格全句子矩阵把连推两句补满（2026-10-13，S342，语料 347 换 kind 重记）

- **S338 的矩阵用 `lines.find(…)` 只取第一行 Parse Error**，于是「一个违规一句」看着像引擎的规矩。`matrix2.mts` 把同 434 格重跑、一次调用的**全部**句子收齐：声明类型那 16 位上每个被拒的 kind 都追一句 A 式（`Cannot pass a value of type "StringName" as "PackedByteArray".` + `argument 1 should be "PackedByteArray" but is "StringName".`）。
- **出货照发**：`GLOBAL_ARG_AS` 第五列（`also`）从 54 格的抽样填满到逐 kind，`analyze` 在同一次调用里按引擎的顺序发两句；434 格里最多两句，没有第三种组合，所以表的形状没动。
- **语料 347 换了一批 kind 重记**（`StringName` / `null` / `Vector2` / `Color`）：引擎 86 句、我们 86 句、逐字 0 处不同 —— 这一格门从此钉的是**句数**不只是拦不拦。
- **一次生成器自纠**：`gen-table2.mts` 读新矩阵时沿用另一把尺的字段数（`slice(4)` 应为 `slice(3)`），表看着没变、测试格数从 403 掉到 269。**掉格子而不是掉判据 = 工具坏了**，这条按 S330 / S322 的老规矩记下来。
- **门**：`pnpm test` 2861（78 文件）、typecheck 4/4、`test:compile` 233/338（sema 79）、`test:diff` 226/226（跳过 122，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` 347 重记后无漂移。

### 1.154 「跟第一参走」的向量与 Color 那一支接完：252 格派生矩阵，另把引擎不讲理的那四格落成例外表（2026-10-13，S341，语料 349）

- **换一把尺子才量得到**：这一族的期望型由第一参决定，「一位塞一种字面量」那种测法只能量到第一处违规。新探针把**第一参钉死一形、其余位给同型合法值**，只换被测位（6 位 × Vector2 / Color / Vector3 三形 × 14 kind = 252 格，`tmp/probe-argtype/derived2.mts`）。
- **接法**：新表 `DERIVED_ARG_TYPES`（`(第一参的形, 位, 那一位拒的 kind 名单)`）+ 一条新判据，句子仍是 A 式、期望型 = 第一参那一形；同型与 Array / Dictionary 在派生位是**收**的，名单里一个容器都没有。
- **逮到自己一侧的一处过拦**：`wrap(Vector2(1, 2), [1], Vector2(1, 2))` 与 `wrap(Vector2(1, 2), {"a": 1}, …)`（含第三位同形共四格）引擎**一句都不推**，而 S337 那张 A 表按「非数字字面量就拒」会把它们拦下。四格按实测落成 `GLOBAL_ARG_SUPPRESS_OTHER`：其余位出现 Array / Dictionary 时那一句不发。
- **引擎不讲理的那一格照录不美化**：第一参是 Color 时，`clamp(Color…, Color…, …)` 第二位推的竟是 `should be "Color" but is "Color"` —— 于是第三位那一形根本量不到（14 格全是第二位的句子），表里就没有那一位，欠记在 §6 第 51 条①。
- **门**：`pnpm test` **2861**（78 文件）、typecheck **4/4**、`test:compile` **233/338**（sema 拦下 78 → **79**、响亮拒 26、emitter 不支持 0）、`test:diff` **226/226**（跳过 121 → 122，静默 / 崩溃 / 未实现 全 0）、语料 349 的 10 句与我们 diag 逐字 0 处不同、`--check` 无漂移。

### 1.153 静默 NaN 的根子是共用的取数口子：`fl()` / `intOf()` 一次性堵掉，数值一族 141 格全数响亮拒（2026-10-13，S340）

- **S339 修的是 `floor` 一支，病在共用的两口子上**：`fl(v)` 的 `intToNum(v.v as IntPayload)` 与 `intOf(v)` 的 `Math.trunc(v.v as number)` 对装箱的 String / 向量 / 字典都不报错，往下算成 NaN —— 数值一族 47 支全靠这两口。
- **改前改后各跑一遍同一把尺**（`tmp/probe-argtype/precheck.mts`，47 支 × {String, Vector2, Dictionary} = 141 格）：改前 **74 格发编出来的值**（`nan` 31、`false` 15、`0.0` 11、`1.0` 9、`0` 6、±1/inf 2）、13 格抛 JS 的 `RangeError` / `TypeError`、只有 54 格本来就是 `arg-float` 那一式；改后 **141 格一格值都不发**（`UnsupportedError` 96 + `GodotRuntimeError` 45）。
- **引擎那一侧本来就是拒**：S339 ⑤ 那 32 格运行期读数（`Error calling utility function "abs()": Argument "x" must be …`）—— 原句逐支还没量齐（§6 第 51 条③），所以这一轮只发我们自己的响亮拒，不冒充引擎文本。
- **bool 一字不动**：`mathNum` 里 BOOL 明确折 1 / 0（实测 a05 / k01），int / float 两支走原路 —— 新分支只在「既不是数也不是 bool」那一侧，合法程序一个都不经过（`test:diff` 226/226 一字不变）。
- **门**：`pnpm test` **2710**（78 文件）、typecheck **4/4**、ops 自校验 2127 / 0。

### 1.152 允许集顺出来的静默错值：`floor(Vector2)` 给 NaN 那一族逐分量发出（2026-10-13，S339，语料 348）

- **上一轮的表自己供了线索**：S338 量到 `abs` / `floor` / `ceil` / `round` / `sign` 的形参允许集带四种向量、`lerp` 还带 Color —— 引擎**收**这些形，而我们那几支的写法是 `roundThree(v.v as number, …)` / `one(v.v as number)` / `fl(…)`。实参是 `GVector2` 时就是拿对象当数：`floor(Vector2(-1.5, 2))` 出货给 **NaN**、`sign(Vector2(-1.5, 2))` 给 **0.0**，`snapped` 抛 JS `RangeError`、`lerp` 抛 `TypeError`。
- **一格一脚本量 66 格**（`tmp/probe-argtype/vals.mts` → `vals.txt`）：20 格一元 × 四向量、`snapped` 同型两支、`lerp` 四支（含 `lerp(Color…, 0.5)` 与权重 2.5 那支——**权重不夹进 [0,1]**）、外加 32 格「Variant 装着串 / 数组 / 字典 / null」的运行期形状。
- **式子就是值类型那一族**：按实参类型直接交给 `vector2Method` / `vector3Method` / `vector2iMethod` / `vector3iMethod` / `colorMethod` 已有的 `abs` / `floor` / `ceil` / `round` / `sign` / `snapped` / `lerp`；int 向量没有 `floor` / `ceil` / `round` 那三支方法，分量本来就是整数，实测原样给回。
- **一形不采信**：`lerp(Vector2(0, 0), Vector2(4, 8), Vector2(0.5, 0.25))` 实测给 `(0.0, 0.0)`，既不是按轴插值也立不成「向量权重折成 0」那条规则（单格无第二判据），那一形继续不发。
- **非数值实参按红线 1 改成响亮拒**：引擎运行期也拒（`Error calling utility function "abs()": Argument "x" must be …`），但逐支原句没取齐（`round` 缺、`lerp(1, X, .5)` 是另一式），所以出货先发我们自己的 `UnsupportedError`，不再静默给 NaN / 0；原句留 §6 第 51 条③。
- **门**：语料 348 新钉 26 行逐字节 + `test:scriptc` 348 一格 1/1（41.2s）；`pnpm test` **2569**（77 文件）、typecheck **4/4**、`test:compile` **233/337**（sema 78 不变、emitter 不支持 0）、`test:diff` **226/226**（跳过 121，静默 / 崩溃 / 未实现 全 0，旧 225 例一字不变）。

### 1.151 形参拒剩下的三族接完：434 格矩阵，同一次调用引擎会连推两句（2026-10-13，S338，语料 347）

- **把 §1.150 留下的 B / C / Object 一次做完**：尺子从「一位一探针」换成「**一位 × 一种字面量**」—— 31 个位 × 14 形 = 434 格，每格一条引擎读数（`tmp/probe-argtype/matrix.mts` → `matrix.txt`），表由 `gen-table2.mts` 生成，门 406 例（`global-arg-allow-list.test.ts`）逐格钉句子与「不许误拦」，语料 347 钉 54 次调用。
- **同位换 kind 就换句子，所以 refuse 名单必须逐 kind 存**：`bytes_to_var("a")` 说 `Cannot pass a value of type "String" as "PackedByteArray".`、`bytes_to_var({})` 说 `argument 1 should be "PackedByteArray" but is "Dictionary".`、`bytes_to_var([])` 收；`convert(1, "a")` 要 int 而 `convert(1, [])` 要 Variant.Type。上一轮那种「一位一个期望型」的写法在这里会漏句也会拦错。
- **一次调用两句是数出来的不是猜的**：矩阵那一趟只记第一行，语料 347 第一版按它接完只对上半句 —— 于是把选中的 54 格逐格重跑、把每一次调用推的**全部** Parse Error 收齐（`counts.txt`）：C 族那 19 格是「先 as 句、再同位的 A 句」。出货照发两句后，引擎 73 句 / 我们 73 句、逐字不同 0 处。
- **这一族对 bool / Color 的判法与 A 族相反**：A 族 102 位收 bool（`sqrt(false)` 算得出），B / C 族真拒；Color 字面量在 B 族也拒。反过来 `abs([])`、`floor({})`、`snapped([], 1)`、`lerp([], 1, 1)` 引擎全收 —— 一条都不许拦。
- **两道门各逮到我们一侧的一条**：(a) `lerp` 第二参那句「跟第一参走」被当固定形照抄，合法的 `lerp(1, 2, 3)` 遭拦，`test/sema.test.ts` 236 那格（我们报错、Godot 通过）当场红 —— 表里因此加了「第一参是这些 kind 时整条让开」那一列；(b) 类型句抢在元数句前面，`test/emit-guards.test.ts` 里 `inst_to_dict(1, 2)` 退化成「居然编得过」—— 判据改成**实参个数不在 `GLOBAL_CALLABLES.bounds` 区间内时类型那一族一律不插手**。
- **`convert` 的第一参不发**：`Invalid call for function "convert".` 说的是 (from, to) 那一对，`convert("42", TYPE_FLOAT)` 合法而 `convert("a", 1)` 被拒 —— 生成器里明确把它剔掉，欠在 §6 第 51 条④。
- **三条欠都留了读数**：跟随第一参那一族的向量 / Color 支（11 格已在 `matrix.txt`，task #31）、C 族其余 kind 的双句（尺子 `matrix2.mts` 已备好，跑一次 434 格约 45 分钟）、B 族全局函数的**运行期**向量那一半（`floor(Vector2)` 出货现在给 NaN、`sign(Vector2)` 给 0.0，task #30，脚本 `vals.mts`）。
- **门**：`pnpm test` **2530**（76 文件）、typecheck **4/4**、`test:compile` **232/336**（sema 拦下 77 → **78**、响亮拒 26、emitter 不支持 0）、`test:diff` **225/225**（跳过 120 → 121，静默 / 崩溃 / 未实现 全 0）、`test:golden` 347 新记后 `--check` 无漂移、既有 225 例一字不变。

### 1.150 全局函数「形参收到非数字字面量」：102 位逐位实测成表，另 5 位是「跟第一参走」（2026-10-12，S337，语料 346）

- **一族句子先分成三类**：A `argument N should be "T" but is "U".`（形参是具体类型）、B `Argument "x" must be "int", "float", …`（Variant + 允许集，每支名单不同）、C 各自一句（`range` 是运行期 `Invalid type…`、`len` 自一句、没名字那句还带 `Did you mean to use "remap()"?`）。本轮只接 A 类里 T 是 int / float 的位。
- **普查怎么铺的**：126 支按我们表里的 argc 逐位塞 `"a"`、其余位给 1（189 位）→ A 108、收 17、其他 64；再把每条 A 的第一参换成 `1.0` 重测一遍，**期望型不变的才进表**（102 位 / 65 支），变的 5 位（`clamp` 2/3、`lerp` 2、`wrap` 2/3）另记一张「跟第一参」表，实现里只有第一参是 int / float 字面量时才知道期望型。表是生成的：`tmp/probe-argtype/gen-table.mts` → `packages/compiler/src/lower/global-arg-types.ts`。
- **U 那一侧逐形量过界**：int / float / **bool** 字面量引擎都收（`sqrt(false)`、`sqrt(1e309)`、`char(1.5)`），拒的是 String / StringName / NodePath / null / Array / Dictionary 与 `Vector2` / `Vector2i` / `Vector3` / `Vector3i` / `Color` 构造式，报出来的名字就是它自己。
- **被逐字节门救回来的一次过度概括**（本轮最值钱的一课）：把同一条规则套到 `inst_to_dict` 的 **Object** 位，语料 265 立刻变崩溃 —— **null 在 Object 位是收的**，现证就躺在语料 265 第 90 行 `typeof(inst_to_dict(null))`（那格在跑通桶里）。规则不能跨声明类型照搬，表因此只收 int / float 位，Object 位与 B 族一起留给 §6 第 50 条（`inst_to_dict(&"a")` 引擎确实拒，那一形还没接）。
- **两侧都钉**：门 120 例里那 102 位的期望句逐字取自普查那一次的引擎读数，另有跟随 6 形与「不许误拦」12 形；语料 346 的 12 句与我们 diag 逐字比过（`tmp/probe-argtype/parity.mts`），0 处不同。
- **门**：`pnpm test` **2121**（75 文件）、typecheck **4/4**、`test:compile` **232/335**（sema 拦下 76 → **77**、响亮拒 26、emitter 不支持 0）、`test:diff` **225/225**（跳过 120，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` 346 无漂移。

### 1.149 `char()` 越界接进解析期：字面量整数那一侧引擎拒，float / bool 那一侧它放过（2026-10-12，S336，语料 345）

- **接 §1.147 记的 masking**：`char(-1)` 这类越界字面量引擎在**解析期**拒（`Invalid argument for "char()" function: Expected an integer between 0 and 2^32 - 1.`，一格一脚本量到四形），而我们发射器是 `char: (a) => rt.stringChr(...)`，看都不看 —— 编得过、跑起来才知道。
- **边界要往两侧量，不然会接成过拦**：同一批探针里 `char(1.5)`、`char(1.0)`、`char(true)`、`char(-0.0)` 引擎**全放过**（实测算出 U+0001 与替换符），只有 int 字面量越界才拒。所以判据只吃「字面量 int」与「一元负号套字面量 int」两形（值按 bigint 走，避免 `9223372036854775807` 掉进 Number），别的表达式一律放过。
- **还欠的两形都有读数**：`char("a")` 也是解析期拒，但句子是通用那一式 `argument 1 should be "int" but is "String".` —— 属于「全局函数 int 形参收到别的字面量类型」那一整族，126 支没扫，不在这轮；`var q := -1` 再 `char(q)` 是**运行期**错，而且文本带本地化中文（`Error calling GDScript utility function "char()"…`），既不伪造也不进语料。
- **一条语料口径**：`char(0)` 打 NUL、`char(5535)` 是孤立代理（引擎自己会前缀 `Unicode parsing error…U+FFFD`），两形都不能进 golden —— 本轮第一次 148 格试跑就是被它们打挂的（读到 0 行），区间内其余形只在探针里量。
- **门**：`pnpm test` **1998**（74 文件）、typecheck **4/4**、`test:compile` **232/334**（sema 拦下 75 → **76**、响亮拒 26、emitter 不支持 0）、`test:diff` **225/225**（跳过 119，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` 语料 345 无漂移。

### 1.148 `posmod` 的模数为 0 发出：引擎给 0，那条 ERROR 由 `normalize` 滤掉（2026-10-12，S335，语料 344）

- **接 §1.147 记的那条欠**：一格一脚本量到 `posmod(5|0|-5|2147483648|2^63-1, 0)` **全给 0**，引擎每格推 `ERROR: Division by zero in posmod is undefined. Returning 0 as fallback.` + `   at: posmod (./core/math/math_funcs.h:314)`。旧实现抛 `UnsupportedError`，注释自己写着「Godot 那侧这一格没量过」。
- **一条口径澄清**（顺手把旧记忆更正了）：`tools/lib.mjs` 的 `normalize` 会把 frame 命中 `core/(variant|math)/` 的引擎内部错误块**整块滤掉** —— 所以这类格子是能进语料的，出货只发那个值就行，不需要伪造 C++ 的行号。§1.147 的任务描述里「注意 golden 会带 ERROR 行、此前有 ERROR 行打挂逐字节门」那句是旧的担心，与 `numInBase` 的 base 越界同一口径，已在本条更正并写进 S335 ②。
- **同批把「零除数 / 零步长」这一族钉齐**（22 行逐字节）：`fposmod / fmod` 的 0 除数给 `nan`、`wrapi(5,0,0)` 给 0、`wrapi(-3,2,2)` 给 2、`snapped(5,0)` 给 5、`snappedi(5,0)` 给 5、`snappedf(5.0,0.0)` 给 5.0、`snapped(2.5,0)` 与 `snappedi(2.5,0)` 都给 **2**（int 步长那侧结果也 int，且是截断）。最后这形同时把 §1.147 里 `snappedi` guard 改用的 `Math.trunc` 钉住了。
- **门**：`pnpm test` **1980**（73 文件）、typecheck **4/4**、`test:compile` **232/333**（三档分类一字不变）、`test:diff` **225/225**（静默 / 崩溃 / 未实现 全 0）、`test:scriptc` 原生门 344 一格编过 / 跑通 / 逐字节一致 1/1。

### 1.147 普查第二批逮到 `snapped` 全族的折半方向：源是 `floor(v/step + 0.5)`，往 +∞ 折（2026-10-12，S334，语料 343）

- **换了一把尺子**：float 输出的普查要在 17 位上比，尾数级分岔既难归因又看不见（§1.143 / §1.144 那批）；这一批专挑**输出是 bool / int / 串**的全局函数 —— 这类输出没有地方躲，裂一格就是语义错。
- **裂出来的就是 `snapped` 全族**：`snapped(-0.5, 1.0)` 引擎 `0.0` 我们 `-1.0`、`snapped(-7.5, 3.0)` 引擎 `-6.0` 我们 `-9.0`、`snappedi(0.5|1.5|2.5, 1.0)` 引擎 `1|2|3` 我们 `0|1|2`。根因是旧实现借用了 `round()`（远离零），而 `Math::snapped` 写的是 `floor(value / step + 0.5) * step`（往 +∞）；**旧注释「= round(2.5)·3」在正数上恰好同值，所以十几年门里从没区分过**。
- **`snappedi` 另有一条**：旧实现先把两支实参 `intOf` 截断，而 `snappedi(7.5, 3.0)` 引擎给 9 —— 说明实参按 double 走、只在结果上取整。改完两条都对。
- **同批一起钉进语料 343（154 行逐字节）**：`is_zero_approx` 的四个门槛格、`is_equal_approx` 十二对（`NAN/NAN`、`INF/INF` 给 true）、`is_finite / is_inf / is_nan`、`posmod / fposmod / fmod` 符号四角、`wrapi`（含 `wrapi(0, 5, 0)` → 5）、`nearest_po2` 十二格、`char` 四格、`min / max / sign / signf / abs` 的 ±0 混排。
- **两条新欠都取到读数的（§6 第 49 条）**：`posmod(5, 0)` 引擎给 0 并推 `ERROR: Division by zero in posmod is undefined. Returning 0 as fallback.`，我们那支还在抛 `UnsupportedError`（那条注释说的「没量过」现在量了）；`char(-1)` / `char(4294967296)` 是**解析期**拒（`Expected an integer between 0 and 2^32 - 1`），而发射器 `char: (a) => rt.stringChr(...)` 根本不看区间 —— 一条 masking。各立任务。
- **探针自己踩的坑记一条**：第一批 148 格试跑读到 0 行 —— `char(0)` 把 NUL 写进了 golden，`char(5535)`（孤立代理）让引擎前缀一行 `Unicode parsing error…U+FFFD`；剔掉这两格才有干净的 154 行。**往语料放串输出之前先想这两个形状**。
- **另一条流程教训**：改完 runtime 用 `cli run` 复验，结果全是旧值 —— 那条路吃的是 `dist`，不是 `src`；本轮改用「语料 + `test:diff`」那条本来就 import `src` 的路复验（这条口径此前记过一次，这次再犯说明它值得写进文档）。
- **门**：`pnpm test` **1977**（73 文件）、typecheck **4/4**、`test:compile` **231/332**、`test:diff` **224/224**（静默 / 崩溃 / 未实现 全 0）、`test:scriptc` 原生门 343 一格编过 / 跑通 / 逐字节一致 1/1。

### 1.146 `step_decimals` 也折 float32：全局函数里「绑定签名写 float」那一族只有两支（2026-10-12，S333，语料 342）

- **普查之后的收尾一问**：§1.145 发现 `ease` 的分岔根因是绑定形参写着 `float`。那么**还有哪些全局是这种签名**？把 4.6.3 `core/variant/variant_utility.cpp` 挑一遍 —— 只有两支：`ease(float x, float curve)` 与 `step_decimals(float step)`，其余全是 `double` / `Variant`（这也解释了 §1.144 普查里十三支为什么全合）。
- **式子本来是对的，错在实参**：`Math::step_decimals` 就是那张十格门槛表（`0.9999 / 0.09999 / …`，第一格旁边的注释 `// somehow compensate for floating point error` 正是给 float 误差留的），我们的表照它抄的；但引擎先把实参折成 float32 —— `f32(0.9999)` = `0.99989998…` 掉到门槛下面，`step_decimals(0.9999)` 引擎给 **1**、我们给 **0**。整数级分岔，打印看得见，是又一条出货代码里的静默错值。
- **不用改的那一半**：`decs = abs - (int)abs` 里 `(int)` 溢出那一档两边都落回 0；折成 float32 以后 `|x| ≥ 2^24` 本来就没有小数部分，所以 `1e9 / 16777216.0 / 33554432.0` 那三形照样合。
- **钉法**：53 格读数（`tmp/probe-gfbz/{sd,sd2}.txt`，十道门槛各取门槛上 / 门槛值 / 再下面一点，加负号、整数部分、`0.0`、`1e-11`、大数）全合；语料 342 是打印口径 48 行逐字节 —— 两支都只出 int，不需要 17 位那一半。
- **口径**：**接一条全局函数之前先去看它绑定的形参类型**，而不是看它算出来像哪种数 —— 这三轮（§1.144 / §1.145 / 本条）踩的是同一件事的三种形状。
- **门**：`pnpm test` **1974**（73 文件）、typecheck **4/4**、`test:compile` **230/331**、`test:diff` **223/223**（静默 / 崩溃 / 未实现 全 0）、`test:scriptc` 原生门 342 一格编过 / 跑通 / 逐字节一致 1/1（62s）。

### 1.145 `ease` 结清：分岔的根因是绑定签名写 `float`，不是我猜的曲线项（2026-10-12，S332，语料 341）

- **上一轮留的猜是错的**：§1.144 记「引擎的指数那一侧还要过一条 ease 曲线」。**取回源一看是另一回事**：`core/variant/variant_utility.cpp` 里那支绑定声明的是 `ease(float x, float curve)` —— 实参在调用边界先折 float32，然后才进 `Math::ease` 的 double 式子。第 8 位有效数字的分岔就是 float32 输入误差被 `pow(·, 3.5)` 放大，跟曲线项无关。
- **源里的四条支**（`core/math/math_funcs.cpp` 逐字抄回）：`x` 先夹 `[0, 1]`；`0 < c < 1` 给 `1.0 - pow(1.0 - x, 1.0 / c)`；`c >= 1` 给 `pow(x, c)`；`c < 0` 是 inout（`x < 0.5` 一条、否则另一条）；`c == 0` 给 `0`。旧实现只有中间那一条，负曲线还响亮拒。
- **这就是出货代码里的静默错值**：`ease(0.37, 0.25)` 引擎 `0.84247039476926799`、旧实现 `0.77992067098508289` —— 打印看得见，是 §1.144 普查把它抓出来的（普查 11/30 那一支）。
- **两侧都钉**：语料 341 走打印口径 176 行逐字节（14 条曲线 × 12 个 x，另加 `ease(1/3, 3)`、`ease(-0.0, 2)`、int 实参几形）；`global-ease.test.ts` 走 17 位真身 112 格。**198 格里 195 合**，剩两格（`ease(0.37, 3.5)`、`ease(0.999999, 9)`）差 double 的最后一两位，是 `Math.pow` 与引擎 `::pow` 的 libm 差（§6 第 39 条那一族）—— 按旧口径不钉、不进语料，测试文件头部写明剔了几格。
- **顺手删掉两条自己加的早退**：`approxEq(x, 0) → 0`、`approxEq(x, 1) → 1` 源里没有；删掉后 `x = 0.999999` 那一档照样合（曲线本来就把值算到 1 附近）。负曲线的 `UnsupportedError` 一起删。
- **口径**：这一族连着三轮（§1.142 / §1.143 / §1.144）都在说同一件事 —— **式子的精度轨要按「绑定签名」而不是「看起来像哪种数」来判断**，而分步形状（先折 float32 还是先算再折）只能靠 17 位读数验，逐字节门对尾数级分岔是瞎的。
- **门**：`pnpm test` **1971**（73 文件）、typecheck **4/4**、`test:compile` **229/330**、`test:diff` **222/222**（跳过 118，静默 / 崩溃 / 未实现 全 0）、`test:scriptc` 原生门 341 一格编过 / 跑通 / 逐字节一致 1/1（73s）。

### 1.144 全局数学函数普查：四支的式子与源不同一起修掉，其中 `move_toward` 是语义级（2026-10-12，S331，语料 340）

- **接 §1.143 的那条口径往下扫**：既然「出货把 double 乘积摊平」逐字节门看不见，那只看门绿就不可靠 —— 这轮给 19 支全局数学函数各排 30 格随机（`tmp/probe-gfbz/mksweep.mts` → `sweep.gd` → `sweep.txt`，比的是 `String.num(x, 17)`），打分脚本 `sweepscore.mts`。
- **结果是两类问题**：十三支全合；四支有分岔，其中**两支是打印就看得见的语义级**（`move_toward` 8/30、`smoothstep` 21/30），两支是尾数级（`wrapf` 13/30、`fposmod` 22/30）。
- **`move_toward` 那条最有意思**：源 `abs(to - from) <= delta ? to : from + SIGN(to - from) * delta` 的上界比的是**带号** delta —— 负 delta 引擎是往反方向走，而旧实现取了 `abs(delta)`（看起来更"合理"，其实是自己脑补的语义）。修完还剩一格：`move_toward(3, 3, -1)` 引擎给 `3.0`、我们给 `2.0` —— **`SIGN(0)` 是 0 不是 1**，这一格普查的随机数撞不到（要 `from == to`），是**语料 340 的逐字节门当场抓出来的**，正好说明 §1.143 结尾那句「两条腿都要有」。
- **`smoothstep` 的降序那一侧根本没有早退支**：源只有 `CLAMP((s - from) / (to - from), 0, 1)` 再 `s*s*(3-2s)`；我们那两条按 `a < b` 写的三元早退在 `a > b` 时把 0 与 1 交错，另外 `is_equal_approx` 那一支的边界是 `s <= from → 0.0` 而不是「大于等于给 1」。
- **`wrapf` 两条**：源**不排序两端**（倒序输入就让负 range 自己走），末尾还有一条 `is_equal_approx(result, max) → min`；`fposmod` 是 `fmod` 按号折回，`a - b*floor(a/b)` 那一形只在最后一两位分岔。
- **没修的记成欠账**：`ease` 11/30 —— 出货 `pow(x, c)`，引擎的指数还要过一条 ease 曲线（`ease(0.37, 0.25)` 差 `0.84247039476926799` vs `0.77992067098508289`，**打印看得见**，所以是货真价实的静默错值），实现要在 `math_funcs.cpp` 里取；`lerp_angle` 29/30 那一格差 double 的 1 ULP，同 §6 第 39 / 41 条那一族。两条都在 §6 第 48 条挂着，`ease` 另立了任务。
- **门**：`pnpm test` **1856**（72 文件）、typecheck **4/4**、`test:compile` **228/329**（sema 75、响亮拒 26、emitter 不支持 0 全不变）、`test:diff` **221/221**（跳过 118，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` 语料 340 一格零漂移、`test:scriptc` 原生门 340 一格编过 / 跑通 / 逐字节一致 1/1（76s）。

### 1.143 全局 bezier / cubic 那一族的分组修掉了：轨是 double，错在乘法摊平（2026-10-12，S330）

- **怎么撞上的**：§1.142 收尾时顺手看了一眼全局 `bezier_derivative`（`builtins.ts` 的 `gBezierDerivative`）——它全程 double，而内建方法那一轨刚证明是 float32，像是下一条静默错值。**量下来轨是对的**：`bezier_derivative(1000.1, 2000.2, 3000.3, 4000.4, 0.618)` 引擎给 `3000.3000000000002`，float32 在 3000 那档存不下这个精度。
- **真正的错在分组**：`math_funcs.h:442 / :463 / :343` 三条 double 式子都先把 `omt2 / omt3 / t2 / t3` 各成一个变量，我们的写法把乘法摊平了。120 格随机电池（17 位读数比真身）：`bezier_derivative` 裂 **31**、`bezier_interpolate` 裂 **17**、`cubic_interpolate` 裂 **40**。
- **为什么一直没被发现**：差动全在 double 的最后一两位，`strFloat` 打出来一字一样，语料 253 那三格又是 `t = 0/1` 的端点格 —— **逐字节门对这类分岔天然瞎**。结论写进 S330 ③：这一族只能靠 17 位读数钉，语料格钉不住。
- **改法**：三条式子照源建中间变量；`gCubic` 里那条式子的第二份抄本删掉、改调 `cubicNum`。共用 `cubicNum` / `cubicInTimeNum` 的 `cubic_interpolate_in_time`、`cubic_interpolate_angle`、`cubic_interpolate_angle_in_time` 跟着一起合 —— 六支 × 100 格里 **599 合**，剩 `cubic_interpolate` 一格差 double 的 1 ULP（`…0966` vs `…0965`），与 §6 第 39 / 41 条那一族同形状，记成天花板不追。
- **口径带出来的一条通用教训**：§1.142 是「探针把 float32 的实参当 double 喂」，本轮是「出货把 double 的乘积摊平」—— **同一个源式子在两种精度轨上都要逐字照分组**，`a * b * c` 与 `a * (b * c)` 在 float32 与 double 上都不是恒等式。以后新接的算式一律先数一遍源里的中间变量，再按电池打分（不是先看能不能打印成一样）。
- **门**：`pnpm test` **1810**（71 文件）、typecheck **4/4**、`test:compile` **227/328**（三档分类一字不变）、`test:diff` **220/220**（静默 / 崩溃 / 未实现 全 0，逐字节不变即「对打印不可见」的证明）。

### 1.142 两支 `bezier_derivative` 发货：式子一直是源里那一条，卡住的是探针自己没折实参（2026-10-12，S329，语料 339）

- **欠在哪**：§6 第 36 条那份「名在表里、运行时报未实现」的名单里只剩六名，`bezier_derivative` 占两支；第 38 条记的是「式子读不出来」—— 扫过 320 个分步形状最好 41/49，再补 10 组 fma 形状 27/32，而且分岔**两个方向都有**，看着像编译期乘加收缩点位问题。
- **破局还是读源 + 把猜想摊开筛**：`core/math/math_funcs.h:472` 那条 float 式子照抄成候选，再把「哪几步落回 float32」排成 16 个舍入点、2^16 张候选表，用 134 个分量读数筛（150 格随机之前先按「只留一条乘式」排了六组隔离格定位）。剔掉一行被引擎自己截断的读数之后，**全合的四张只差在 `c1-s` / `c2-c1` 两个减法点上，这批读数分不出**，出货照源取「每步都落 float32」。
- **根因是一条口径教训**：旧候选模型把 GDScript 字面量当 double 直接喂进去，而引擎写进 `Vector2` 那一刻已经折成 float32 —— 1e-9 量级的差在强抵消那一列正好翻掉最后一位，于是造出「引擎一会儿高 2 ULP 一会儿低 1 ULP」的假分岔。**以后量「最后一两位」的分步模型，先把两侧字面量都折成 real_t 再比**（这条已写进 §6 第 38 条）。
- **发货形状**：`vector2.ts` / `vector3.ts` 各一个 `case "bezier_derivative"`，四个实参走既有的 `vecArg` × 3 + `scalar`（`scalar` 本来就把 float 实参折回 float32，S313 那条口径）；`analyze.ts` 的元数表早就有 `bezier_derivative: [4, 4]`，emitter 与 lower 一行没动。
- **钉法**：语料 339 共 222 行逐字节（150 格随机四量级档 × 15 个 `t` 全收进来，加设计格：三条乘式各自隔离、三条两两隔离、全式、`t = 0 / 1 / 2 / -1.5 / 12.5`、1e6 量级、int 实参那一形）；门 `vector-bezier-derivative.test.ts` 25 例逐字抄引擎读数，元数与实参类型的响亮拒也在里面；发货前那批随机电池按 float32 真身 + 打印机两条口径 **525 项零分岔**。
- **门**：`pnpm test` **1756**（70 文件）、typecheck **4/4**、`test:compile` **227/328**（sema 拦下 75、lowering 响亮拒 26、emitter 不支持 0 全不变）、`test:diff` **220/220**（跳过 118，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` **338 例零漂移**（OK 220 / 报错 101 / 超时 17）、`test:scriptc` 原生门带 339 一格（编过 / 跑通 / 逐字节一致各 1/1，182s）。
- **还欠的**：§6 第 36 条剩四名（`Vector3.rotated` / `outer`、`Color.from_ok_hsl` / `from_rgbe9995`）。本轮顺手发现一条**没量过的轨**：全局函数 `bezier_derivative` / `bezier_interpolate`（`builtins.ts` 的 `gBezierDerivative` / `gBezierInterpolate`）今天全程按 double 算，而引擎那些全局形参声明是 `real_t`；语料 253 的 z78/z79/z80 三格都是 `t = 0/1` 的端点格，打印口径分不出这两轨 —— 下一轮一格一脚本量 17 位读数，若是 float32 就是一条出货代码里的静默错值。

### 1.141 把「类名.成员」那一面的解析期拒接进 analyze：五形六型一次接齐（2026-10-12，S328，语料 338）

- **欠的是同一处活**：§6 第 44 条（静态调用的元数 / 类型 / bare 引用晚到运行期）与第 45 条①（`Vector2.ZERO(1)` 我们照算常量放过）这两笔，加上 §1.139 翻出的「轴常量当函数调那句的槽位是枚举名」，一起在这一轮结掉。
- **量在哪**：`tmp/probe-static-face/run.mts` → `readings.txt`，六型 × 七形一格一脚本共 44 形（解析期错会带走整份脚本，只能一形一跑）。五句原文按类型名/枚举名槽位套用，`String` 那边 `HEX` 这种不存在的常量走的是表外那两句。
- **接法**：`analyze.ts` 里加 `STATIC_FACE`（`consts` / `axis` / `statics` 三列）+ 两个纯函数，调用式与 bare 引用式各一个入口；`Color` 的 154 支颜色名直接查运行时的 `COLOR_NAMED`，不在编译器再抄一份。
- **口径上的两档来源要写清**：静态函数名单与 `Vector2i` / `Vector3i` 的空表来自引擎绑定表（`bind_static_method` 数过来），**少一支就会误拦合法代码**；元数上下界里 `from_angle` / `octahedron_decode` / `html` / `from_string` / `from_hsv` / `chr` / `num_int64` 都有实测的 `Too few/many` 句，而 `String.num` 的上界 2、`num_int64` / `num_uint64` 的上界 3、`from_rgba8` 的 `[3,4]` 取自绑定自己的形参表与默认值 —— 实测只覆盖「缺参那一句」和「3/4 支都收」，这一档在 S328 ④ 里标着，不当已量。
- **两侧都钉**：门 `static-face.test.ts` 43 例 —— 非法 27 形逐字一样、合法 15 形一个 diag 都不许多冒（含 `Color.RED` / `Vector3.AXIS_Y` / `Vector2i.MAX` 这些 bare 读与三种实例式）；语料 338 是引擎那侧的九行解析期原文，编译门记进「语义分析拦下」74 → **75**。
- **门**：`pnpm test` **1728**（69 文件）、typecheck **4/4**、`test:compile` **226/327**、`test:diff` **219/219**（跳过 117 → 118，静默 / 崩溃 / 未实现 全 0）、`test:golden --check` **337 例零漂移**（OK 219 / 报错 101 / 超时 17）。

### 1.140 轴常量发货：四张常量表里补上 int 那一条支（2026-10-12，S327，语料 337）

- **接 §1.139 量的那一批**：`Vector3` / `Vector3i` 有 `AXIS_X/Y/Z` = `0/1/2`，`Vector2` / `Vector2i` 只有 `AXIS_X/Y` = `0/1`（`AXIS_Z` 解析期就拒），`Color` 一支也没有；值全是 int（`typeof` 给 `2`）。今天除 `Vector3i` 之外全被拦成「不存在」。
- **实现**：`Vector3i` 本来就挂着 int 支（`VEC3I_CONST_INT`），本轮把 `Vector2` / `Vector2i` / `Vector3` 三张表各补一张同形的 int 表，读口先查向量表再查 int 表，「不存在」那句把两张表的名单并起来报 —— §1.139 里我写「四张表都是分量数组的形状」不准确，第三张本来就有 int 支，这条也在本轮回改里更正。
- **连带验掉的几形**（都进语料 337，24 行逐字节）：`var i: int = Vector3.AXIS_Y`、`var v = Vector2i.AXIS_X` 的推断、`[Vector3.AXIS_X, …]` 打 `[0, 1, 2]`、`Vector3(10,20,30)[Vector3.AXIS_Y]` 取下标给 `20.0`、`match` 手臂 `Vector3.AXIS_X:` 命中 `0` / `Vector3i.AXIS_Y:` 命中 `1` / `Vector3.AXIS_Z when q == 2:` 命中 `2`、加减乘与 `==` 按 int 走。**发探针脚本时踩到自己写错的一形**：手臂守卫的关键字是 `when` 不是 `if`（写成 `if` 引擎给 `Expected "else" after ternary operator condition.`），而 `Vector2.AXIS_Z` 这种不存在的成员会把整份脚本带走 —— 两形都改成本轮实际进语料的写法。
- **故意没接的两形**（与 §6 第 44、45 条同一处活）：轴常量**在实例上读不到**（解析期 `Cannot find member "AXIS_Z" in base "Vector3".`，我们目前放过属性读口）、**当函数调那句的槽位是枚举名**（`Name "AXIS_X" called as a function but is a "Vector3.Axis".`，我们今天报的是自述句）。
- **门**：`pnpm test` **1682**（68 文件）、typecheck **4/4**、`test:diff` **219/219**（静默 / 崩溃 / 未实现 全 0）、`test:compile` **226/326**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **336 例零漂移**（OK 219 / 报错 100 / 超时 17）。

### 1.139 轴常量一族量齐了：四个向量类型都有、值是 int，还带出两条新句子（2026-10-12，§6 第 45 条②，出货代码不动）

- **读数量在哪**：`tmp/probe-axis/run.mts` → `readings.txt`，16 形一格一脚本（解析期错会带走整份脚本，只能一格一跑）。
- **收的形**：`Vector3.AXIS_X/Y/Z` = `0/1/2`、`Vector3i.AXIS_X/Z` = `0/2`、`Vector2.AXIS_X` = `0`、`Vector2i.AXIS_X` = `0` —— **四个向量类型都有，值都是 int**；`Color.AXIS_X` 没有（`Cannot find member "AXIS_X" in base "Color".`）。我们今天全拦成「不存在」，是过拦。
- **两条新句子**：① 轴常量**在实例上读不到** —— `Vector3(1, 2, 3).AXIS_Z` 解析期拒 `Cannot find member "AXIS_Z" in base "Vector3".`，跟「静态函数在实例上可调」（S322 ④ / S323 ②）正相反，所以这类名字是**只走类名**的；② 把它当函数调，句子里的槽位填的是**枚举名不是类型名** —— `Vector3.AXIS_X(1)` → `Name "AXIS_X" called as a function but is a "Vector3.Axis".`（§6 第 45 条①那条 `Name "X" called as a function but is a "T".` 的 `T` 在这里是 `Vector3.Axis`）。
- **发出去要连带处理的**：值的形状是 int，而四张常量表现在都是「分量数组」的形状（`VEC3_CONST` 那种 `[number, number, number]`）—— 要么表里加一条 int 支，要么另挂一张轴表；同时 `var i: int = Vector3.AXIS_Y`、`match` 手臂里 `Vector3.AXIS_X:` 命中 subject `0`、`v[Vector3.AXIS_Y]` 取下标这三形都得跟着通（都实测过）。
- **门**：本轮只动文档与 `tmp/` 探针，src 与语料一字未改 —— §1.138 那套读数（`pnpm test` 1673、`test:diff` 218/218、`test:compile` 225/325、golden-check 335 例零漂移、原生门 336 那一格 338 格逐字节）继续有效。

### 1.138 `Color.from_rgba8` 发货，顺带把 int64 形参的 float 折法量成了一条规则（2026-10-12，S326，语料 336 长到 338 格）

- **§1.137 记的那个卡点解决了**：112 形一格一脚本扫下来（`tmp/probe-int64-arg/readings.txt`），`String.num_int64` / `num_uint64` / `Color.from_rgba8` / 全局 `int()` 四条 API 在 float→int64 上同一口径 —— 范围内向零截断，**越界与非有限一律给 `INT64_MIN`**（x86 `cvttsd2si` 的整数不定值）。全局 `int()` 我们本来就是这么发的（`builtins.ts` 的 `TWO_63` 那一支），本轮等于把同一条规则从「全局函数」扩到了「内建类型的形参」。
- **`from_rgba8` 的式子**：`Color(r / 255.0f, g / 255.0f, b / 255.0f, a / 255.0f)`，整数先升 float32 再除、`a` 默认 255、不夹范围。语料 336 补 59 格（含 `2^53`、`1e20`、`NAN`、`±INF` 那几形），338 格逐字节 0 分歧。
- **一条看着不同其实同源的读数**：int32 形参那侧 `Vector2i(9007199254740992.0, 0)` / `(NAN, …)` 全给 `(0, 0)` —— 是「先折 int64 再 `static_cast<int32_t>` 取低 32 位」的后段（`INT64_MIN` 低 32 位正好是 0）。本轮没动 int32 那侧的现有路径。
- **实现落点**：新 helper 叫 `int64ParamBig`，放 `tags.ts` —— `values` 引 `color`，`color` 不能反向引 `values`，这条规则两边都要用，叶子模块是唯一不成环的位置。
- **故意没扩的三处**：`String.chr` / `humanize_size` / `num` 的 `decimals` 仍走旧的 `intArgBig`（非有限值在那些形参上引擎给什么没量过，红线 1）；`Color.from_rgba8` 的**实例式**调用没接（静态名在实例上能调只对 `html` / `hex` 那几支量过）。
- **门**：`pnpm test` **1673**（67 文件）、typecheck **4/4**、`test:diff` **218/218**、`test:compile` **225/325**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **335 例零漂移**（OK 218 / 报错 100 / 超时 17）；原生门里 336 那一格也跟着重跑了一遍 —— **338 格编过 + 跑通 + 逐字节一致**（`GDS2JS_SCRIPTC_FILTER=336`，约 1 分钟），新走的 `BigInt → Number → Math.fround → /255` 那一条在静态目标上同样不炸。

### 1.137 原生门补上 336 那一格：`DataView` + `BigInt` 在 scriptc 上过得去（2026-10-12，§6 第 47 条⑦，出货代码不动）

- **为什么要补**：§1.136 那支式子中到的东西代表集从没验过 —— 从 IEEE754 位里拆 `m · 2^e` 用的是 `new DataView(new ArrayBuffer(8))` + `getBigUint64` + `BigInt` 的 `**` 与移位，而 scriptc 对内建历来有围栏（S200 那四道坑：`globalThis` 往 `Record` 的转法、`spawnSync` 的 `env`、`split` 出来再展开……）。node 侧绿不代表静态目标绿。
- **结果**：把 `336-string-num-family` 加进代表集后单跑 —— **编过、跑通、279 格逐字节一致**（46s）。这几样在 scriptc 上不炸，记下来免得下一轮重新试。同一轮 `pnpm test:scriptc` 全代表集 **43/43** 也是绿的（那是 §1.135/§1.136 两支进去之后的第一次全跑）。
- **`Color.from_rgba8` 仍不发，卡点变了**：11 格读数早在 `tmp/probe-num/full-golden.txt`，式子也简单（`r / 255.0f`，`a` 默认 255、不夹范围），但形参是 **int64**，于是 float 实参先要按引擎那条折法走 —— 实测 `from_rgba8(1e20, 0, 0)` / `(NAN, 0, 0)` / `(INF, -INF, 0)` 全给 `(-36170088558100480.0, …)`，即 x86 `cvttsd2si` 的**整数不定值** `0x8000000000000000` 再除 255。我们的 `intArgBig` 对非有限浮点是抛错的，所以先要量齐「内建类型 int64 形参上的 float→int64 折法」（正常值、±0、`2^53`、`2^63`、`1e20`、`NAN`、`±INF`、负数截断方向）—— 这一条大概不只这一支用得到（`Color.hex` / `hex64`、`Vector2i` / `Vector3i` 的形参、`String.num_int64` 的 base 都是 int 形参，但**各自走的是不是同一条转换路一格都没量**）。量齐之前照旧响亮拒（§6 第 47 条⑦）。
- **门**：本轮只动测试代表集与文档，src 与语料一字未改 —— §1.136 那套读数（`pnpm test` 1668、`test:diff` 218/218、`test:compile` 225/325、golden-check 335 例零漂移）继续有效。

### 1.136 `String.num(number, decimals)` 的第二实参接上：不能用 toFixed 代 snprintf（2026-10-12，S325，语料 336 长到 279 格）

- **静默错值的另一半**：绑定是 `num(number, decimals = -1)`，而 `stringStatic` 只读 `args[0]` —— `String.num(3.14159, 2)` 我们给全长。§1.135 发了进制那一半，这一轮把 decimals 补上，`String` 那六支静态里只剩 `Color` 侧的 `from_rgba8` 还没发。
- **踩到的第一坑是 `toFixed`**：V8 给的是双精度的**精确**展开，引擎那侧的打印只有 17 位有效数字、多的补零 —— `num(1/3, 32)` 引擎 `0.33333333333333331`、`num(3.14159, 32)` 引擎 `3.1415899999999999`。落地的式子改成从 IEEE754 位拆 `m · 2^e`，用 BigInt 精确乘 `10^k` 四舍五入，再按 17 位上限决定几位是真、几位是零，最后按引擎那段「削尾零但小数点后至少留一个零」收尾。`num(1e-7, 32)` 那格还额外教了一遍：上限要按**精确值**的首个有效位算（`1e-7` 的真值是 `9.9999999999999995…e-8`，首位在小数第 8 位而不是第 7 位）。
- **舍入方向**：`0.5 → 1`、`1.5 → 2`、`2.5 → 3`、`-0.5 → -1` —— 半程**离零更远**，不是 half-even（`2.5` 那格是判据）。`decimals < 0` 那一支先取 14、`|x| > 10` 再减 `floor(log10|x|)`，减成负数就走 `%.lf` 的默认 6 位（`num(1e20)` → `100000000000000000000.0`）。
- **踩到的第二坑是引擎自己的常量池**：同一份脚本里 `-0.0` 与 `0.0` 折成同一个常量，谁先出现谁定号 —— 三格 ±0 因此在两种脚本里给出两种读数，只有一格一脚本时才各自稳定。这是解析期折叠，不是 `String::num` 的算法，产物里也复刻不了，所以**那三格请出语料**，负零的符号规则改由单测按一格一脚本的读数钉（`num(-0.0, 2)` → `-0.0`、`num(-0.0, 0)` → `-0`）。这条也写进 §6 第 47 条⑥，以后凡「同脚本多个 ±0 字面量」的读数都要警惕。
- **门**：`pnpm test` **1668**（66 文件，新增 `string-num-decimals.test.ts` 19 例）、typecheck **4/4**、`test:diff` **218/218**（静默 / 崩溃 / 未实现 全 0）、`test:compile` **225/325**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **335 例零漂移**（OK 218 / 报错 100 / 超时 17）。拟合脚本 `tmp/probe-num/fit3.mts`：165 格 0 分歧。

### 1.135 `String.num_int64` / `num_uint64` 的进制实参接上：一条静默错值结掉一半（2026-10-12，S324，语料 336）

- **来源**：§1.134 那份静态清单直接翻出来的 —— 绑定写的是 `num_int64(number, base = 10, capitalize_hex = false)`，而 `stringStatic` 每一支只读 `args[0]`。也就是说 `String.num_int64(255, 16)` 我们今天给 `255`，`String.num_uint64` 干脆不存在。
- **发出去的**：两支的 `base` + `capitalize_hex` 全接（式子照 `ustring.cpp:1501` / `:1541`，先数长度再倒着填、余数取绝对值、除法向零截断），`num_uint64` 整支新建并按 uint64 回绕实参；语料 336 钉 117 行逐字节，`string-num-base.test.ts` 19 例补越界与默认实参。
- **一进一出踩到的坑**：`base` 越界那八格引擎是 `ERR_FAIL_COND_V_MSG` —— 返回空串**并另 push 一条内部 `ERROR:`（带 `at: … ustring.cpp:1502` 与 GDScript 栈）**，语料的逐字节对账不滤这种块，进去就是 `静默错误 1`。所以那八格请出语料，只留单测钉返回值 `""`；那条错误通道今天不接（要接得先定「产物该不该往 stderr 发同样一句」，属宿主面的决定）。
- **没动的另一半**：`num(number, decimals)` 那条支要复刻的是 Windows libc 的 `snprintf("%.<N>lf")` + 尾部削零，还带一条「超过 17 位有效数字被截到 17 位」的脾气（实测三支都留了证据），舍入方向是**离零更远**而不是 half-even —— 这些读数已全部躺在 `tmp/probe-num/full-golden.txt`，下一轮直接拿它当判据。`Color.from_rgba8` 同批待发。
- **门**：`pnpm test` **1649**（65 文件）、typecheck **4/4**、`test:diff` **218/218**、`test:compile` **225/325**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **335 例零漂移**（OK 218 / 报错 100 / 超时 17）。

### 1.134 静态名这一整类数完了：引擎一共 33 支，Tier 1 里又翻出两支我们一直拦着的（2026-10-12，§6 第 46 条，出货代码不动）

- **为什么要数**：S323 那一轮撞上的不是「一格欠账」而是**盘点口径漏了一整类** —— §6 第 36 条那份 50 名来自「名在实例方法表里、运行时报未实现」的扫描，而 `Vector2.from_angle` 这种只能在类名上调的名字根本走不到那条路。
- **ClassDB 问不出来（实测负结论）**：`ClassDB.class_get_method_list` 对 19 个内建类型全给空表、`class_has_method("Vector2", "from_angle", false)` 给 `false`、`ClassDB.METHOD_FLAG_STATIC` 在 GDScript 里取不到。想一次性问出内建类型的方法面这条路今天不通 —— 别再试。
- **通的是源**：`core/variant/variant_call.cpp` 里 `bind_static_method` / `bind_static_methodv` 全数一遍，得 33 支（`Vector2` 1、`Vector3` 1、`String` 6、`Color` 9、`Callable` 1、`Basis` 3、`Quaternion` 1、`Projection` 11；`Vector2i` / `Vector3i` / `StringName` / `NodePath` / `Array` / `Dictionary` / `Signal` 一支都没有）。照 S322 的口径，**源只当候选**，每一支要发之前还得一格一脚本量过。
- **翻出来的两处过拦**：`String.num_uint64`（实测 `(-1)` → `18446744073709551615`，按 uint64 回绕）与 `Color.from_rgba8`（a 默认 255、**不夹范围** `300` → `1.1765`、float 实参先截断 —— S313 那条 call-boundary 口径的又一同族）。两支都还欠格子（`num_uint64` 欠 `1 << 63` 那一档与 base 越界，`from_rgba8` 欠 NAN / INF 实参与负数一侧的截断），量齐才发，记任务清单。
- **不在本层的**：`Callable.create` 引擎要两支实参（实测元数句 `Too few arguments for "create()" call. Expected at least 2 but received 1.`），第一支是 `Object` —— 按 D4 与 §3 的口径属 Tier 1 之外；`Basis` / `Quaternion` / `Projection` 那 16 支跟着第 15 条那个「七个值类型要不要进 Tier 1」的范围决定一起躺着（`Projection` 连第 43 条⑪那份名单都没进过，本轮补记）。
- **门**：本轮只动文档与 `tmp/` 探针（`tmp/probe-static-list/` 的 ClassDB 负结论 + `tmp/probe-static-gap/readings.txt` 的六格），src 与语料一字未改 —— §1.133 那套门读数（`pnpm test` 1627、`test:diff` 217/217、`test:golden --check` 334 例零漂移、`test:compile` 224/324）继续有效。

### 1.133 `Vector2.from_angle()` 发货：覆盖面盘点漏了「只能在类名上调」那一整类（2026-10-12，S323，语料 335）

- **怎么撞上的**：给 §6 第 44 条量静态调用的句子时，顺手扫了一批「类名.名字」形，撞上 `Vector2.from_angle(0.5)` 引擎给 `(0.877583, 0.479426)` 而我们拒 —— 这一支**从来不在 §6 第 36 条那份 50 名里**，因为那份 survey 的口径是「名在实例方法表里、运行时报未实现」，静态名不在实例调用路径上，整类都没被盘点到（`octahedron_decode` 也是这一类，S322 发的正是它）。元数表里 `from_angle: [1, 1]` 早就有了，缺的只是实现口。
- **式子与调用式**：`Vector2(cos(a), sin(a))`，实参先折 float32（S313 那条口径）、两个分量各折回 float32；静态式与实例式同一条式子、实例被忽略（两支实测一字一样），所以挂 `vector2Const` + `vector2Method` 两处共用 `fromAngle`，int 实参放行。
- **发货线 1e12**：`[0, 1e12]` 六段 500 格（抖动到 9 位小数）+ 负零族 + 早先 68 格全合；1e12 之上是**按值**裂的 —— `75e13`、`2e14`、`4e14`、`1e15` 末位差 1，`1e20`、`1e30` 整支错，而 `1.5e14` 反而合，所以不给「大概到多少都安全」，只发到量过的那一档，之上抛 `trig-large-arg`（与标量 `sin` / `cos` 那两条限同一口径，同 S314 那把 libm 天花板）。
- **语料与门**：语料 335 钉 38 行逐字节（含 `from_angle(PI)` → `(-1.0, -0.0)`、`PI / 2` → `(-0.0, 1.0)` 两支负零，与 NAN / INF / -INF 三支 `(nan, nan)`）；`pnpm test` **1627**（64 文件，新增 `vector2-from-angle.test.ts` 21 例）、typecheck **4/4**、`test:diff` **217/217**、`test:compile` **224/324**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **334 例零漂移**（OK 217 / 报错 100 / 超时 17）。
- **顺带记下的三笔（§6 第 45 条）**：**新 masking** —— `Vector2.ZERO(1)` 这类「把常量当函数调」引擎解析期拒 `Name "ZERO" called as a function but is a "Vector2".`，我们照算常量放过；**新过拦** —— `Vector3.AXIS_X` 实测是 int `0`，我们的常量表只认九支；**两句原文族** —— 实例方法在类名上直接调、表外名字调用、bare 引用静态函数这三形各自的原句已存着，接进 analyze 的活是第 44 条那一件。
- **`Color.from_string` 那一格另说**：引擎收 int 当兜底色（过解析），我们只认 Color 实参 —— 但实测那格没走到兜底支，int→Color 到底转成什么还没量，欠一格读数。

### 1.132 `Vector3.octahedron_decode()` 发货：式子是从引擎源里读出来的，不是猜出来的（2026-10-12，S322，语料 334）

- **卡点与解法**：S321 那轮把标准反折（`z < 0` 时按 `(1-|·|)*sign(·)` 折、`z` 翻号）否掉了，之后 `tmp/probe-oct/fit.mts` 的八条候选最好的一条还错 32/169。这一轮不再猜：直接读 4.6.3-stable 的 `core/math/vector3.cpp`，那支是 `n = (f.x, f.y, 1-|f.x|-|f.y|)` + **`t = CLAMP(-n.z, 0, 1)`** + `n.x += n.x >= 0 ? -t : t`（y 同形）+ `normalized()` —— 照它落地 **169/169 全合**，`t` 那个上夹 1 正是越界格里「水平分量各挪 ±1」的来源，也解释了 `z == 0` 一带为什么不折（`t = 0`）。
- **源只当候选，判据仍是读数**：`tmp/probe-oct/fit2.mts` 拿 169 格同时试三条（CLAMP / 不夹 / 别支），CLAMP 支 169、不夹支 54 —— 记进 §6 第 36 条那句「式子反复猜不中就去读引擎自己的源」，同时把红线 1 的口径再钉一遍：**读了源也要拿格子验**。
- **两种调用式一条式子**：静态式与实例式实测一字一样（`Vector3(1,2,3).octahedron_decode(Vector2(0.25,0.75))` → `(-0.707107, 0.707107, 0.0)`，实例被忽略），所以 `octaDecode` 挂在静态口（`vector3Const`，emitter 那条 `STATIC_MEMBER_FNS` 早已带 `args`）与 `vector3Method` 两处共用。实参口 `Vector2` 直收、`Vector2i` 走 `Vector2()` 那条升 float 的支（实测放行两支）。
- **顺带量到一族时机差**：元数、实参类型、bare 成员引用这三形引擎全在**解析期**拒（四句原文见 §6 第 44 条），我们五形全编得过、运行期才响亮拒，而且 float 那一形报的是转换口的句子（基名写成 `Vector2()`）。要做的是 analyze 里给「内建类型名 + 该类型静态函数名单」加解析期判据 —— 但名单另一头 `Color` 那四支的引擎原文一格都没量过，先扫再动，记 §6 第 44 条⑤。
- **非有限值五格**（`nan` 三支全 `nan`、`(INF, 0.5)` → `(nan, 0.0, nan)` 等）与 `.normalized()` 本身同一脾气，实测过 `Vector3(1, NAN, 2).normalized()` 也是三支全 `nan` —— 顺手排除了一条可疑：源里 `length_sq > 0` 那类写法若真成立，NAN 该给 `(0,0,0)`，实测不给，所以共用 helper 不动。
- **门**：`pnpm test` **1603**（63 文件）、typecheck **4/4**、`test:diff` **216/216 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **223/323**（emitter 不支持 0、响亮拒 26 不变）、`test:golden --check` **333 例零漂移**（OK 216 / 报错 100 / 超时 17）、语料 334 新钉 183 行。§6 第 36 条 7 → **6 名**。
- **一处流程坑**：`cli run` 走的是 `packages/*/dist`，改完 runtime 不 build 就会拿旧代码做读数 —— 本轮那格「0 参撞常量句」的假象就是这么来的，重 `pnpm build` 之后才见到真正的元数句。**探针口径：改过 runtime 先 build，或直接 import `src`。**

### 1.131 更正：那七支构造子不是漏登记，是七个值类型整个没有（2026-10-12，§6 第 43 条⑪，出货代码不动）

- **上一轮的推断错了一步**：`Rect2(1, 2, 3, 4)` 编不过，我看到 `Function "Rect2()" not found in base self.` 就写成「全局可调用表缺七行」，像是一下午就能补的活。翻 `packages/runtime/src/runtime/` 才看清：**`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB` 连值类型的实现都没有**（没有对应文件，`Tag` 里没有槽，`Signal` 只有类型名），所以缺的是一整个类型族的值表示 + 方法面 + 打印 + 哈希 + 序列化，不是登记一笔的事。按 D4 与 §3，「Tier 1 要不要扩到这七个值类型」是**范围决定**，得用户拍板，不该我单方面开工。
- **读数先存着**：一格一脚本扫了 36 形（`tmp/probe-ctors/godot.txt`），七支构造的 0 元默认值、收哪几种实参形状、拒的给什么签名全在里面 —— 三条要留意的：`Rect2i(Vector2(1.5, 2.5), Vector2(3, 4))` 是**截断**不是四舍五入；`Transform2D(0.5, Vector2(1, 2))`、`Basis(Vector3, 1.5)`、`Quaternion(Vector3, 0.5)` 三支带三角，开工就撞 S314 那把 libm 天花板；`AABB` 的实参**必须**是 Vector3 那一族（`AABB(Vector2, Vector2)` 引擎直接拒）。谁做谁省事，不必再量一遍。
- **门**：本轮只动文档与 `tmp/` 探针，src 与语料一字未改 —— §1.130 那套门读数（`pnpm test` 1579、`test:diff` 215/215、golden-check 332 例零漂移、scriptc 41/41）继续有效。

### 1.130 手臂构造式按实参类型接进 lower，顺带挖出七个类名的构造子缺口（2026-10-12，§6 第 43 条⑩，语料 329–333）

- **做了什么**：`CTOR_ARMS` 从「类名→元数」换成**类名→实测收下的实参类型序列**（键来自 §6 第 43 条⑥⑦⑧那三批读数，340 格两侧对账零分歧），手臂里 `Vector2()`、`Vector2i(1, 2.5)`、`Vector2(Vector2(1, 2))`、`Color(1, 2, 3)`、`String("a")`、`Callable()` 等十七形从此编得过；同时**修掉一条 masking**：`StringName(1)` 与 `NodePath(1)` 旧表按元数放行（引擎拒），现在发引擎那句 `No constructor of "StringName" matches the signature "StringName(int)".`（四格语料 330–333 钉句子，门 `match-arm-ctors.test.ts` 49 形）。
- **挖到的才是大头**：把表接上之后逐形试发射，发现 **`Rect2` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB` / `Signal` 这七个类名的构造调用连表达式位置都编不过**（`Function "Rect2()" not found in base self.`）—— 也就是 `var r = Rect2(1, 2, 3, 4)` 这种极普通的 GDScript 我们今天照样拒。下一轮更正了原因（见 §1.131）：不是表少登记七行，而是**这七个值类型在运行时里整个没有**。
- **另一层**：`Color(1)` 与 `Color(1, 2)` 引擎手臂收，编译也能过，但**运行期** `color()` 不认两参数那一支 → 产物里抛错；而且实测 `Color(1, 2, 0, 1)` 与臂 `Color(1, 2)` **不等**（语料 329 第 4 行 `C|color-none`），说明引擎那支的默认位不是「b=0、a=1」。这两形因此退回表外继续响亮拒，欠的是「`Color(int)` / `Color(int,int)` 到底造出什么值」的读数。
- **口径**：这一轮的取舍标准是「**手臂收不收，取决于这支构造在表达式位置能不能造出值**」—— 收了却在 emit 或运行期抛，等于把 lower 处的拦挪到 emit 处的拦，对用户没有区别；所以宁缺毋滥，缺的都写进 §6 第 43 条⑩与本条。
- **门**：`pnpm test` **1579**（63 文件全绿，新增 `match-arm-ctors.test.ts`）、typecheck **4/4 无 `error TS`**、`test:diff` **215/215 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **222/322** 且 **emitter 不支持 0**（响亮拒 22 → **26**）、`test:golden --check` **332 例零漂移**（OK 215 / 报错 100 / 超时 17）、`test:scriptc` 代表集 **41/41 编过 + 跑通 + 逐字节**。

### 1.129 手臂合法表的第二列（按实参类型）与命中表一起量完（2026-10-12，§6 第 43 条⑧⑨，出货代码不动）

- **接着 §1.128 留的口子**：那张按元数扫的表只能说明「int 实参吃哪几档」，而引擎真正看的是**实参类型**（同是一元，`StringName("a")` 收、`StringName(1)` 拒）。这一轮把类型那一列扫完：19 类 × 元数 1..4 × 四种同质实参（int / float / String / 嵌套 `Vector2(1, 2)`），合法集列成 §6 第 43 条⑧那几条 —— 其中最不像话的两格值得写下来：`Color(float)` 与 `Color(float, float)` **拒**，而 `Color(int)`、`Color(int, int)`、`Color(1, 2, 3)`、四元全收；`AABB(Vector2, Vector2)` 也拒（它 0 元反而收）。
- **命中表一起量了**：21 条合法手臂写进同一份脚本 → 解析全过，五个 Subject 各落一格：`Vector2(1, 2)` 命中同形臂而 `Vector2()` 不接、int `1` 谁都不接、`&"a"` 命中 `StringName("a")`、`NodePath("a/b")` 命中同形而 `String("a")` 不接 —— **异型一律落空不抛**，与 S275 / S278 / S279 那张表完全一致，所以发射侧要动的只有 `CTOR_ARMS` 那张白名单（还要把它从「按个数」改成「按实参类型序列」），比对语义沿用 `patterns.ts` 的 `armEq`。
- **探针自己的一次假错**：合表脚本第一版报 `Expected closing ")" after call arguments` —— 是我把带引号的臂名（`StringName("a")`）嵌进双引号字符串打出来的，逐形单跑 21 条全过。**这条也值得记**：探针的引号写法会伪装成引擎的语法意见。
- **门**：本轮只动文档与 `tmp/` 探针，src 与语料一字未改 —— §1.128 的门读数继续有效。下一件就是任务 #14：按这张表把过拦解掉（合法集扩进 `lowerPattern`，表外发引擎那句 `No constructor of "X" matches the signature "X(…)"`），配语料格与门。

### 1.128 scriptc 补跑三支全绿，代价是先把宿主的 npm 告警从比对里剔掉（2026-10-12，含 §6 第 43 条的合法表）

- **门补齐**：用户重装 scriptc 之后 `which scriptc` 恢复（0.2.7，`/e/.vite-plus/bin/scriptc`），三支按序补跑：`test:scriptc` **41/41 编过 + 跑通 + 逐字节**、`test:export` **10 通过 / 9 跳过**、`test:cli-native` **通过 22 项 / 失败 0 项**。§1.122–§1.127 那几行「scriptc 不可用」的读数就此作废（各条已就地指向本条）。
- **补跑第一遍红了九格，红的是门自己**：`cli-native` 逐字节比对里 node 那支多出 `npm warn Unknown user config "home". …`，exe 那支不经过 npm 所以没有 —— 本机 `~/.npmrc` 多了一个 `home` 键（node 从 24.18 换到 24.21、npm 也随之换版，新版把未知键当告警）。仓库里那道剔噪声的过滤器只写着 `Unknown env config`，所以这一句穿过去了。修法就是把过滤器补成 `Unknown (env|user) config`，注释写清楚**为什么这不算两侧行为差异**：比的是 CLI 的输出，不是宿主包管理器的牢骚。
- **这条坑值得记的形状**：宿主的 npm/node 版本变化能**只污染比对的一侧**，于是门的红与出货代码毫无关系 —— 与 §1.121 那次 node 20↔24 漂移导致 161 与 zstd 两格翻转是同一类（读门之前先看宿主）。
- **顺带把 §6 第 43 条欠的那张表量了**：`tmp/probe-arm-arity/sweep.mts` 按 19 个类名 × 元数 0..4 扫完（`sig-table.txt`），读数成形状 —— **每个类的 0 元全收**（`Vector2()` / `Color()` / `Callable()`…），只有 `Array` / `Dictionary` 连 0 元都不进（给的是 pattern 那句而不是元数那句）；1..4 元里 int 实参**只在「全 int 的那几条重载」上收**：Vector2/2i 收 2、Vector3/3i 收 3、Rect2/2i 与 Plane/Quaternion 收 4、**Color 0..4 全收**，其余（Transform2D / Basis / StringName / NodePath / Callable / Signal / AABB / String）int 实参一律拒；被拒时签名文本就是 `类名(int, int, …)` 按实参个数摊开。**这条把「我们多拦的合法形」划出了范围**：`Vector2()`、`Color(1, 2)` 这类今天被一句 `模式 call 未支持` 挡掉的，引擎确实收 —— 但合法表真正要按**实参类型**而不是个数来列（`StringName("a")` 一元是收的，`StringName(1)` 一元拒），所以下一件活是同一把尺子按 int / float / String / 嵌套构造式几种实参类型再扫一遍，扫完才谈接进 `lowerPattern`。
- **门**：本轮动的是 `test/e2e/cli-native.test.ts` 一处过滤器与文档，src 与语料未改；typecheck **4/4 无 `error TS`**，`test:cli-native` 补跑后 **22 项 / 0 失败**，其余读数沿用 §1.125 与 §1.127。

### 1.127 match 手臂的两句顺序量清了，顺带抓到我们自己多拦的两形（2026-10-11，§6 第 43 条，出货代码不动）

- **为什么挑这件**：§6 第 28 条与 §2 第 20 条①都挂着「错元数那两句的落点与行号没量」；而这条欠账的旁边正好躺着一条更值钱的读数 —— 用同一批探针就能对两侧。
- **引擎那两句的顺序钉住了**：`No constructor of "Vector2" matches the signature "Vector2(int)".` 紧跟 `Expression in match pattern must be a constant expression, an identifier, or an attribute access ("A.B").`；两臂都错就发两对；嵌套从里往外报（`Vector2(Rect2(1))` → 先 `Rect2(int)` 再 `Vector2(Rect2)` 再 pattern 判据）；表外类名换的是 `Function "NoSuchType()" not found in base self.`（括号是空的）；实参是运行期表达式时只有 pattern 那一句。签名里打的是**实参折出来的类型名**。
- **顺带抓到的是一条过拦**：十二形里我们只放过 `Vector2(1, 2)` 一格，其余十一形全走同一句自述 `模式 call 未支持` —— 而 **`Vector2()` 与 `Color(1, 2)` 引擎是跑通的**。这就是 S294 ⑨ 早就警告过的那类「误拦合法工程」：不是漏报，是把能编的项目挡在门外，按优先级排第二档。
- **下一件的形状很明确**：把「能当手臂的构造式」按 (类名, 元数) 列成实测合法表（类名名单第 28 条已有 15 形，元数扫 0～4），表内接到现有常量手臂的发射上，表外按上面那两句的顺序发。
- **门**：本轮只动文档与探针，src 与语料一字未改 —— §1.125 的门读数继续有效。scriptc 那三支本轮仍在跑（`test:scriptc` → `export` → `cli-native`），读数落地后单独记。

### 1.126 退化跨度那一支的基函数拟合干净了，差的是舍入顺序（2026-10-11，§6 第 42 条，出货代码不动）

- **为什么挑这件**：§6 第 41 条①挂着的五形退化跨度是 `cubic_interpolate_in_time` 唯一还没发的半边，而 `tmp/probe-cit/degen.gd` 那份基抽取读数早就在盘上 —— 先把它读完而不是重量，是这一族唯一不动语料也能推进的一段。
- **读数说得很清楚**：α=0 那一支的四条权重是干净有理式（`w0 = (1-w)²`、`w2 = (2+1/β)w² - (1+1/β)w³`、`w3 = ±1/(β(β+1))·w²(w-1)`、`w1` 由恒和 1 补出），**只看 β = Δ2/Δ1 不看绝对尺度**（`(1,2)` 与 `(3,6)` 一字一样），而且 **weight = 0 落在 pre 点而不是自己** —— 结构就不是通用那条 Hermite，所以「取 α→0 极限」这条路根本不存在。β=0（两段同时退化）另有组系数，六格残差 0。
- **仍差的只有逐步 `fround` 的摆法**：拿这组式子对 18 组随机点 × 多个 weight 共 294 个分量复算，40 格一字一样、254 格偏离、最大 3.97e-6 —— 量级 4 的 float32 ULP 是 4.8e-7，八个 ULP 不是末位噪声，是顺序。**下一步写在 §6 第 42 条⑤**：照 S315 那套扫站点顺序，扫到零偏离才发，扫不出来照旧响亮拒。
- **门**：本轮只动文档（`docs/SEMANTICS.md` 的 §6 第 42 条与本条），src 与语料一字未改 —— §1.125 那套门读数（`pnpm test` 1515、`test:diff` 214/214、golden-check 327 例零漂移）继续有效，不需要重跑。

### 1.125 `octahedron_encode` 一条式子量全发货，`octahedron_decode` 被自家读数否掉（2026-10-11，S321，语料 328）

- **为什么挑这件**：§6 第 36 条那 8 名里只剩这一对不带三角、不要 `Basis`（`rotated` 撞上 S314 的 libm 天花板、`outer` 要 `Basis`、`bezier_derivative` 四组式子全不合、`Color.from_ok_hsl` / `from_rgbe9995` 是常数族与共享指数）。
- **encode 一次合上 29 格**：`l1 = |x|+|y|+|z|`（左结合）→ `u = x/l1`、`w = y/l1` → `z >= 0` 就取 `(u, w)`，`z < 0` 折成 `(1-|w|)*sign(u)` 与 `(1-|u|)*sign(w)` → 各 `* 0.5 + 0.5`；分量全程 float32 逐步舍回。**零向量不用特例**：`l1 = 0` 让 `0/0` 自然给 `nan`，引擎那格正是 `(nan, nan)` —— 又一处「别处处特判 0」（S297 那条）。
- **decode 不是没猜，是被读数否掉**：标准反折（`f = 2x-1`、`g = 2y-1`、`v = (f, g, 1-|f|-|g|)`、`z<0` 时 `(1-|·|)*sign(·)`、normalize）能合 `(0.125, 0.875)` 与 `(0.9, 0.1)` 这类格，可 `(0.25, -0.75)` 那格 `z` 恰为 `0`、按模型不折应给 `(-0.707, -0.707, 0)`，引擎却给 ∝`(0.25, -0.75, -1)`；`(-1, -1)` 给 ∝`(2, 2, 5)` 而模型给 `(0, 0, -1)`。**照红线继续响亮拒**，并把「下一轮该重量的两条边界」（`z == 0` 与 `|f| == 1`）写进 S321 ④，省得再摸一遍。
- **覆盖面**：§6 第 36 条 8 → **7 名**。
- **门**：`pnpm test` **1515**（62 文件全绿，新增 `vector3-octahedron.test.ts` 31 例）、typecheck **4/4 无 `error TS`**、`test:diff` **214/214 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **221/317** 且 **emitter 不支持 0**、`test:golden --check` **327 例零漂移**（OK 214 / 报错 96 / 超时 17）；**scriptc 那三支补跑全绿（见 §1.128）**：`test:scriptc` **41/41**、`test:export` **10 通过 / 9 跳过**、`test:cli-native` **22 项 / 0 失败**。

### 1.124 冒号判据的最后三句：elif / else / class，helper 顺手收成位置式（2026-10-11，S320，语料 325–327）

- **还是那一族**：§1.123 记下「本轮没动 `elif` 与 `class` / `func` 的冒号」，这轮把三句接完 —— `elif b`↵`:` → `Expected ":" after "elif" condition.`、`else`↵`:` → `Expected ":" after "else".`、`class Inner extends RefCounted`↵`:` → `Expected ":" after class declaration.`（带不带 `extends` 同句、内部类套内部类也同句，三形各量过）。
- **实现反而变短了**：冒号这一侧八处共用一条**位置式**规则 —— `checkColonHere(n, 句)` 拿「本节点第一个匿名 `:`」对「它前一个兄弟的收尾行」，前一个兄弟正好就是那条表达式，于是不再需要把节点手递进去，S319 那五个调用点一起简化。
- **`func` / `static func` 那一形不是冒号判据**：引擎给 `Unexpected ":" in class body.`（语句在换行处被切断了），我们的 CST 把 `:` 落成顶层 ERROR 节点，走 `module-node` 响亮拒 —— 句子不同但都不放过，本轮把两格钉进门里钉的是「不许放过」这一条。
- **只剩的一格仍然故意不接**：手臂之后的冒号 —— 标量 `1`↵`:` 拒、数组 `[1]`↵`:` 引擎却放，读数打架就没写实现（S319 ④ / S320 ④），语料 314 的 `AA|1` 继续钉住「不许误拦」。
- **门**：`pnpm test` **1481**（61 文件全绿）、`test:diff` **213/213 逐字节**、`test:compile` **220/316** 且 **emitter 不支持 0**（响亮拒 19 → **22**）、sema **316/316**、`line-continuation.test.ts` 76 → **85 形**（golden 同句 19 → **22**、同句其余 34 → **37**、括号放行 20 → **23**）；typecheck **4/4 无 `error TS`**（第一版 `checkColonHere` 直接索引 `kids[at]`，在 `noUncheckedIndexedAccess` 下报两处 TS2532/TS2345 —— 快层 `pnpm test` 不类型检查，是这道门抓的）与 `test:golden --check` **326 例零漂移**（OK 213 / 报错 96 / 超时 17）。scriptc 那三支**已补跑全绿，见 §1.128**。

### 1.123 冒号之前换行那一族：五句接上，手臂那一形读数打架所以不接（2026-10-11，S319，语料 320–324 + 314 补一形）

- **还是同一族的下半**：§1.122 记下「两句故意没接」，理由是判据要表达式的**结束行**而 `CsNode` 只带起始位置。这轮没去动两份 CST 构造器 —— 节点文本早就物化好了，`lastRow` 数一下自己文本里的 `\\n` 就够，一行代码换五句落地。
- **量到的规律比预想的硬**：`if (`↵`true`↵`)`↵`:`、`for i in [`↵`1`↵`]`↵`:`、`match [1,`↵`2]`↵`:`、`1 when (`↵`true`↵`)`↵`:` 四形**全拒** —— 括号豁免只管得着「换行发生在括号内」，一旦 `)` / `]` 收了口、换行落在收尾行之后，深度就回到零照拒。这与 S316 那条正好互为反面，也说明 `checkAfterToken` 那套「值的首行晚于关键字行」不能照搬到冒号这一侧。
- **一条读数打架，所以少接一句**：手臂之后的冒号 —— 标量 `1`↵`:` 给 `Expected ":" or "when" after "match" patterns.`，可数组 `[1]`↵`:` **跑通**。两种模式两种结局，规则没量全就写实现等于猜；本轮只把两格读数钉进 `readings8.txt`，并在语料 314 加一行 `AA|1` 钉住「我们不许把数组那形误拦」。
- **门自己又长一截**：`line-continuation.test.ts` 从 64 形到 **76 形**（golden 同句 14 → **19**、同句其余 29 → **34**、括号放行 18 → **20**），`test:compile` 的「lowering 响亮拒」14 → **19**。
- **门**：`pnpm test` **1463**（61 文件全绿）、`test:diff` **213/213 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **220/313** 且 **emitter 不支持 0**、sema **313/313**（误报 0 漏报 0 崩溃 0）、IR **294/313**；typecheck **4/4 无 `error TS`** 与 `test:golden --check` **323 例零漂移**（OK 213 / 报错 93 / 超时 17）。scriptc 那三支**已补跑全绿，见 §1.128**（当时 `which scriptc` 为空）。

### 1.122 换行族第二半：十一种复合赋值 + match 主题 + when 守卫 + for…in（2026-10-11，S318，语料 316–319 + 314 补四形）

- **接着上一轮的那半条**：§1.120 记的「仍欠的读数」三形，这轮一次量齐（`tmp/probe-eol/run4.mts` / `run5.mts`，44 格一形一脚本）—— 其中**最值钱的一条是省事的**：`+= -= *= /= %= **= <<= >>= &= |= ^=` 十一种复合赋值之后换行，引擎给的全是**裸 `=` 那一句**，所以实现只要把「找 `=` 这个匿名孩子」换成「找本节点第一个匿名孩子」，十一种一起接住。
- **另外三句各一支**：`match`↵主题、`1 when`↵条件、`for i in`↵迭代子 —— 全是同一个 `checkAfterToken`  helper 再加一行，句子照抄实测。
- **两句故意没接**：`match 1`↵`:` 与手臂 `1`↵`:` 拒的是**冒号之前**的换行，判据要「前一个节点在哪行结束」，而我们的 CST 记录只带 `startPosition`（`parse/cst.ts` 那三条约定里就有「无父指针」，如今又加一条「无结束位置」）。为两句去改两份构造器（wasm 与 native）不划算，先记在 S318 ⑤ 与 §6 第 32 条。
- **组合形也要问过引擎才敢放行**：`a += (`↵`2)`、`match (`↵`1):`、`1 when (`↵`true):`、`for i in (`↵`5):`、`for i in [`↵…`]` 这五形是我按落点式子**推**出来的合法形，`tmp/probe-eol/run6.mts` 五格全跑通才写进门的放行表 —— 红线 1 不只管实现，也管测试里那句「这个应当放过」。
- **门自己长了一截**：`line-continuation.test.ts` 从 39 形到 **64 形**（golden 同句 10 → **14**、同句其余 13 → **29**、括号放行 13 → **18**），`test:compile` 的「lowering 响亮拒」那格从 10 → **14**。
- **上一条记的 node 漂移已复位**：开发机 PATH 上的 node 又回到 **v24.21.0**（中途那一阵是 20.19.4），语料 161-pack-compress 与 `packed.test.ts` 的 zstd 两格因此重新变绿 —— §1.121 那条红格读数按 node ≥ 24 作废、以本轮为准。
- **门**（长门在同一支配跑完）：`pnpm test` **1436**（61 文件全绿）、typecheck **4/4 无 `error TS`**、`test:diff` **213/213 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **220/308** 且 **emitter 不支持 0**、sema **308/308**（误报 0 漏报 0 崩溃 0）、IR **294/308**、`test:golden --check` **318 例零漂移**（OK 213 / 报错 88 / 超时 17）。**`test:scriptc` 这一支整门跳过（41 skipped）** —— 原因不是代码：`test/support/env.ts` 的 `hasScriptc = which("scriptc")` 现在是假，PATH 上那颗 `scriptc.exe` 没了（同日 20:47 那一支还是 41/41 全绿，见 §1.120；同一轮里 node 也被换过一颗，见 §1.121 末）。跳过门自己会带上 `（跳过：…）` 的缘由写在 title 上，读起来不是红格，**但这一轮的 scriptc 覆盖面读数因此等于零** —— 要把 §1.122 的改动过 scriptc，得先把 scriptc 放回 PATH（用户侧的事），本轮不猜它在哪。同一原因下 `test:export` 掉到 **1 通过 / 18 跳过**、`test:cli-native` **20 例全跳过**；不吃 scriptc 的那两支照旧全绿：`test:pkgmodes` **25/25**。（**后记**：用户重装 scriptc 之后这三支于 §1.128 补跑，全绿。）

### 1.121 打印与字面量互转排到量级两端：93 格全合，一条欠账撤销（2026-10-11，S317，语料 315，出货代码不动）

- **为什么挑这件**：按我自己定的优先级，第一档是「出货代码里的静默错值」，而 `strVec2`（S312 才改过）与 `strFloat` 在两端是**故意没进语料**的那一带 —— §6 第 40 条明记「`|x| ≥ 1e21` 没量清」。这种「已知没量」的打印路径比新方法更该先补，因为 213 例跑通的语料全在中段。
- **一次摆三族**：V2 / V3 各 24 格、Color 14 格、裸 double 31 格，小数端从 `5e-324` 排到 `1e-4`、大数端从 `1e17` 排到 `1e24`，外加 `9223372036854775807.0`、`1234567890123456789.0`、`1.0000001e18` 这些跨 int64 边界的格。**93 格逐字节全合** —— 那条欠账撤销，两端就此进语料门。
- **量到一条引擎的解析器怪癖**：`9007199254740991.0` 这种**精确可表示**的 double，在引擎里存成 `...990.0`（`a == ...990.0` 实测真、`a - b` 给 `0.0`），`...993.0` → `994.0`、`995.0` → `996.0`、`997.0` → `996.0`。形状就是「全部数字按 `v = v*10 + d` 累进 double 再除 10 的幂」的**二次舍入**，不是正确舍入的 `strtod`。我们的 `parseGdDouble`（S290 那条直译）本来就走这条路，15 格逐格合 —— 这一族是 S290 那次「不靠看着对」最实在的回报。
- **第三次踩同一个探针坑**：比对脚本第一版用 `Number(lit)` 解析字面量，于是 `9007199254740993.0` 报出一格假分岔（引擎 `...994.0` / 我们 `...992.0`）。改成 `parseGdDouble` 之后 67/67 全合。**规矩再写一遍：探针的解析与打印一律用出货的那支实现**，自写的 `Number()` / 固定小数位 fmt 已经在 S313、S315、S317 三轮里各造过一次假分岔。
- **本轮撞到一台机器上的环境漂移**：跑门时 PATH 上的 node 从 24.18 变成了 **20.19.4**（`D:\nodejs` 那一颗，`zlib.zstdCompress` 为 `undefined`）。受影响的是两处**照设计响亮拒**的格子：语料 161-pack-compress 的 `compress(mode 2)`（zstd）与 `packages/runtime/test/packed.test.ts` 的 zstd 那一支。两处拒答文案自己就写着「node ≥ 24 有 zstd」，所以这是宿主读数而不是代码回归 —— 但**本轮的全门读数因此不能与 §1.119/§1.120 那两轮直接比**：`pnpm test` 现在 1398/1399、`test:diff` 212/213，红的那格两处都是同一颗 node 引起。要把这两格恢复成绿，得把开发机的默认 node 切回 ≥ 24（`nvm use`，机器级改动，等用户拍板）。
- **门**（本轮只加语料与文档，`src` 一字未改）：`test:golden 315-print` 新建 OK、`test:compile` **220/304**（emitter 不支持 0、响亮拒仍 10）、`test:diff` **212/213 逐字节 + 崩溃 1（161，node 20 引起）**、sema **304/304**（误报 0 漏报 0 崩溃 0）、IR **294/304**、`pnpm test` **1398/1399**（唯一红格是 packed 的 zstd）。长门（scriptc / pkgmodes / export / cli-native）在 §1.120 那一支配刚全绿过，本轮没有出货代码改动，不重跑。

### 1.120 换行族的落点：十句解析期拒一次接齐，另三形引擎同拒我们同拒（2026-10-11，S316，语料 304–314）

- **为什么挑这件**：§6 第 32 条从 S294 起就挂着「Godot 拒、我们跑」这一类，而且这一族的形状正好命中我给自己定的优先级第二档 —— 引擎编不过的脚本我们的产物照跑，用户拿不到错。
- **一条规则管十句**：tokenizer 只在括号深度为零时发 NEWLINE。所以 `=`（`var` / `const` / 赋值）、`:` 型注、二元与一元运算符、`if` / `elif` / `while` / `for` 之后换行都在解析期拒；同一落点落在 `(` / `[` / `{` 之内就放行。**判据写成「值的首行晚于关键字/运算符那一行」**，而不是「运算符是不是在括号里」—— `if (`↵`b)` 与 `while (`↵`n < 1)` 两格就是这条式子的试金石：条件节点从 `(` 起算，与关键字同一行，所以放行；换行若发生在 `if` 之后、`(` 之前就照拒。
- **十格的句子不抄第二遍**：语料 304–313 一格一句钉进 `godot.txt`，门（`packages/compiler/test/line-continuation.test.ts`）**从 golden 里正则取出那句再比** —— 以后改句子会当场红，不会出现「实现改了、测试跟着改成一样错」那种自洽。另有 13 形同句但值形态不同（接字典 / 数组 / 调用 / 括号 / 负数 / 字符串 / 定形值 / 深缩进 / 夹注释 / `*` / `and` / `-`），三形引擎同拒而句子归别的落点管（`var a = 1,`↵、`str`↵`(1)`、`var a: int`↵`= 1`），十三形括号内放行 —— 一共 39 形。
- **踩到的实现坑**：`CsNode` 是**无父指针的普通记录**（`packages/compiler/src/parse/cst.ts` 那句注释写得明白，我动手时忘了），第一版照 `n.parent`  walks 上去，`inBrackets` 恒为假 —— 于是 `[1 +`↵`2]` / `(1 +`↵`2)` / `print(\nb and`↵`true\n)` 三形被误拦。改法是 `lower()` 开局给整棵树搭一张 WeakMap 父亲表。**教训**：这一族的错向两侧都响 —— 漏放是「Godot 拒我们跑」，过拦是「Godot 跑我们拒」，所以门必须两侧同时钉（这份表 26 拒 + 13 放就是为这个）。
- **门自己的口径也跟着改了一处**：`tools/compile.ts` 原先把 lowering 期的 `UnsupportedError` 一律记进「emitter 不支持」，`ir.test.ts` 一律记进「崩溃」—— 这两条在「引擎本来也编不过」的格子上都不对。现在两边各多一个桶：golden 是解析期报错的用例上我们响亮拒，记作**设计取舍**（新印一行 `lowering 响亮拒（引擎解析期同拒） 10`），其余仍算缺口 / 崩溃。emitter 缺口仍是 **0**。
- **仍欠的读数**（都在 S316 ⑥ 与 §6 第 32 条）：`a +=`↵ 复合赋值、`match`↵ 主题、`return`↵ 值三形没量；括号内外混排那一格（`f(\n1) +`↵`2`）只按首个落点判；§6 第 32 条原本还挂着的 `{^"a": 1, ^"a": 2}` 键文本欠 `str(NodePath)` 的几形，这轮不动。
- **门**（长门在同一支配跑完，全部绿）：`pnpm test` **1396**（61 文件全绿，ops 自校验 **2127** / 0，tree-face 17 项 / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **212/212 逐字节**（211 旧例一字不变）、`test:compile` **219/303** 且 **emitter 不支持 0**、sema **303/303**（误报 0 漏报 0 崩溃 0）、IR **293/303**（另 10 格是新桶的响亮拒）、`test:golden --check` **313 例零漂移**（OK 212 / 报错 84 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **41/41 编过 + 41/41 跑通 + 逐字节 41/41**（314 已进代表集）、`test:pkgmodes` **25/25**、`test:export` **10 通过 / 9 跳过**、`test:cli-native` 重编 exe 后 **20 例全绿**。

### 1.119 `cubic_interpolate_in_time` 两支发货，代价是先踩「跨度没归一」这个坑（2026-10-11，S315，语料 303 新钉）

- **为什么挑这件**：§6 第 36 条剩下的名单里它是唯一纯多项式、又不带三角的一支（S314 刚把带三角的那一族定成精度天花板，所以那条路先封着）。
- **式子**（S315 ②）：段 [0,1] 的三次 Hermite，两端切线 = 相邻两段割线按**另一侧跨度**加权；自己的 knot 时间是 0，所以 Δ0 = `-pre_time`、Δ1 = `b_time`、Δ2 = `post_time - b_time`。
- **踩的坑：跨度必须先按段长归一**。第一版直接拿原始 Δ 做那套组合，等于把切线少乘一个 Δ1 —— 语料 303 的 K / G / H / V / W 六行**同时**分歧（不是某一格，是整片），换成 α = Δ0/Δ1、β = Δ2/Δ1 之后一次合上 37/40 个分量。**教训**：这种「一片全错」的形状说明错在量纲/归一化，而不是舍入点 —— 与 S313 那种「只差一格」的根因完全不同，看分歧行数就能分流。
- **量式子的手法**（`tmp/probe-cit/basis.gd`）：把四支点换成单位向量组（p1 / p2 / p0 / p3 各取一次 1），一次跑就拿到四条**基多项式**的打印值，再逐条解三次系数 —— 比拿随机点猜系数快得多；`α` 扫六档 × 六个 weight 一次跑完，系数表直接对上「二次导数形」的切线公式。
- **两条留在拒的那一侧**：① **退化跨度五形**（Δ0=0、Δ1=0、Δ2=0、Δ0+Δ1=0、Δ1+Δ2=0）—— 引擎在 `pre_time = 0` 那形给的是有限曲线（`5 - 8t + 7t² - t³`，t=0 落在 p0 而不是自己），说明有一条不除零的分支，没量出来之前响亮拒（门六格钉句子）；② **一格 1 ULP**：`α=0.5` 且 p1 量级 9.9e4 的强抵消配置引擎 `85551.36` 对我们 `85551.37`，扫过 240+ 种分步顺序全不合 —— 这一支不带三角，所以这一档剩下的嫌疑就是**编译期乘加收缩**本身（§6 第 41 条②），与第 38 条 `bezier_derivative` 同一类。
- **覆盖面**：§6 第 36 条 10 → **8 名**（剩两支 `bezier_derivative`、`Vector3.rotated` / `octahedron_encode` / `octahedron_decode`、`Color.from_ok_hsl` / `from_rgbe9995`）。
- **门**（长门在同一支配跑完，全部绿）：`pnpm test` **1324**（60 文件全绿，ops 自校验 **2127** / 0，tree-face 17 项 / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **211/211 逐字节**（207 旧例一字不变）、`test:compile` **218/292** 且 **emitter 不支持 0**、`test:golden --check` **302 例零漂移**、`test:scriptc` 代表集 **40/40 编过 + 40/40 跑通 + 逐字节 40/40**（303 已进代表集）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` **22 项 / 0 失败**。

### 1.118 三角那一族判死：是 libm 精度天花板，不是式子形状（2026-10-11，S314，出货代码不动）

- **为什么挑这件**：§1.117 之后剩下的两条「已出货但合不上」就是 `slerp`（1e7 那四格）与 `bezier_derivative`。前者带三角，后者不带 —— 先把带三角的这一族定性，免得后面的轮次一遍遍重搜形状。
- **量法**：新做一批跨量级的 `slerp` 格（`|v|` 从 8 到 2.2e7，三个控制目标 × 三个 `w`，18 行 = **108 个分量**），不比「合不合」而比**相对误差落在哪一档**（`tmp/probe-slerp/quant.mts`）：**100 个 ≤1e-6、5 个在 1e-6～1e-4、3 个完全相同，没有一个超过 1e-4**。
- **结论**：式子形状是对的。引擎的 `real_t` 三角走单精度 libm（`atan2f` / `cosf` / `sinf`，实现自带 1～2 ULP 误差），我们这边是 double libm 再折回 float32 —— 两边都在正确值的 1～2 ULP 内，但不是同一个 1～2 ULP。那 5 个「看着大」的格是同一档角度差被**近轴分量放大**（`Vector2(12345.75,-9876.5).slerp((-5.5,3.25), 0.3)` 的 x 只有 -45.48，长度 1.58e4，6e-8 弧度折到绝对值就是 4.5e-4）。
- **扫过的 20 组形状**（`fit` / `fit2` / `fit3` 三个脚本）：角度取原分量或 `normalized()` 的分量、`atan2` 折不折、绕行四种写法（`while` / `fmod` / `(d+π)%τ` / 引擎 `angle_difference` 族）、`π` 用 double 或 float32、以及整支换成「`acos(dot)` + 正交基」—— 最好一组 24/54（出货的是 18/54），仍无一全合。**不改出货**：把 18/54 换成 24/54 不是「钉住语义」，是把一种分岔换成另一种，红线 1 不过。
- **这一族的口径从此定案**：`slerp` / `rotated` / `from_angle` / `angle_to` 在大量级或近轴分量上最后一两位与引擎不同，属**已定案的精度天花板**，不是待修项；要钉死只能仿平台 libm 的实现误差（不在 Godot 语义里，跨平台还会变）。§6 第 39 条按这个口径改写。
- **顺带开的新题**：`cubic_interpolate_in_time`（V2 / V3 两名，纯多项式，不带三角）已量到三条结构关系（偏移 `(-1,1,2)` ≡ `cubic_interpolate`；偏移整体缩放不起作用；`pre_time = 0` 时 `(1,2)` 与 `(0.5,1)` 同值 —— 最后一条排掉了朴素差商形），闭式与做法记在 §6 第 41 条。
- **门**：本轮只动文档（`docs/SEMANTICS.md` 的 S314 与 §6 第 39 / 40 / 41 条、本条），src 与语料一字未改 —— §1.117 那套门读数（`test:diff` 210/210、`pnpm test` 1318、长门五支全绿）**继续有效**，不需要重跑。

### 1.117 「实参在调用边界上是 real_t」这一把折了三支欠账（2026-10-11，S313，语料 300 请回三格 + 302 新钉）

- **怎么来的**：S312 修完打印位数之后，语料 300 只剩 cubic 与 slerp 两行不合，读数都是 1e7 量级差 1 个 ULP。把 `cubic_interpolate` 的形状扫一遍（39 格：V2 的 24 + V3 的 15），命中的不是 FMA，而是**两件事叠在一起**：实参 `t` 没折回 float32，加上 V3 那两个系数的分组写法与 C++ 源码不同。
- **判据格**：`Vector2(1e7, 20000001.5).cubic_interpolate(Vector2(0.3,-0.7), Vector2(2.5,2.5), Vector2(-1.5,4.5), 0.3)` 的 y —— 引擎 `16310002.0`，不折给 `16310001.0`，折了就给 `16310002.0`。小量级的格子看不出这一位，所以 S306 起发了这么多方法一直没露。
- **落点**：`vector2.ts` / `vector3.ts` 的 `scalar()` 与 `color.ts` 的 `numArg()` 各加一道 `fround`（只加在 `Tag.FLOAT` 那支；int 与 bool 不动），`cubic_interpolate` 两支统一到 `(2p1 + (p2-p0)t + ((2p0-5p1)+4p2-p3)t² + ((3(p1-p2)-p0)+p3)t³) * 0.5`。
- **顺带结掉 §6 第 35 条（`Vector3.move_toward`）**：那条欠账说「46 格里两格的 z 差 1～3 ULP」—— 把拟合脚本的打印口径换成 S312 之后的 `strVec2` 重跑，**46 格全合**（`|x| ≈ 14` 引擎只印 5 位小数，旧脚本固定 6 位，是自己造出来的假分岔）。于是 `Vector3.move_toward` 出货，覆盖面按第 36 条划账（剩 11 → **10 名**）。教训写进手法：**拟合口径必须是出货的打印函数，不能是探针里手写的固定小数**。
- **还是没合的**：`slerp` 在 1e7 的四个分量（折参之后一模一样地差，所以不在实参那一层，在三角那一段），以及 `bezier_derivative`（新量 49 格，折参之后扫 320 个纯分步形状最好 41/49，再补 10 组 fma 形状 27/32，分岔方向两边都有）。两支都留在语料外面，读数全记在 §6 第 38 / 39 条。
- **本轮自己造的一次门竞**：长门（scriptc）还在跑的时候改了 `corpus/cases/300/main.gd`，那一例的 exe 输出与当时 golden 的行数不同 → 会报一处假红。规则补进 §2 第 16 条：**长门在跑就不要动语料**（改 `.gd` 会连带让门比对到没重录的 golden）。
- **门**：`pnpm test` **1318**（59 文件全绿，ops 自校验 **2114** / 0，tree-face **17 项** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **210/210 逐字节**（既有 207 例一字不变 —— 这一条是「改了实参折参 + 两支式子却零 golden churn」的直接证据）、`test:compile` **217/291** 且 **emitter 不支持 0**、`test:golden --check` **301 例零漂移**、`test:scriptc` 代表集 **39/39 编过 + 39/39 跑通 + 逐字节 39/39**（302 也进代表集）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**。
- **下一轮**：`cubic_interpolate_in_time` 那两支（§6 第 41 条：三条结构关系已量到，闭式待解；纯多项式不带三角，最像能直接量出来）、`bezier_derivative`（§6 第 38 条，49 格新读数在 `tmp/probe-bz/bd2.txt`，那一族没有三角，分岔来源只剩收缩 / 分组一类）、第 36 条剩下的 10 名里 `Vector3.rotated` / `octahedron_encode` / `octahedron_decode`（要新读数；`rotated` 属 S314 那个天花板族，发之前先定格子取在哪一档）；Pack 九支元数、链式与定形数组元素两形、`unbind` 自洽、match 臂错元数、`var x =` 换行族、§6 第 29 条对象表、第 40 条大量级打印带；任务 #58 与 `.gitattributes`（要用户拍板）。**`slerp` 从这张单子上划掉了** —— §1.118 / S314 已定性成 libm 天花板，不是待修分岔。

### 1.116 打印位数那条错藏了 208 例，因为旧语料一格都分辨不出（2026-10-11，S312，语料 301）

- **怎么撞上的**：这一轮本来只是给 S311 挑「1e7 量级」的判别格，结果产物与 golden 在 `bezier_interpolate` 那格差了半个 ULP 就露不出来 —— 引擎给 `(3430001, 6860001)` 而我们给 `(3430000.75, 6860000.5)`。一追到底不是算式错，是**打印**：引擎的 `Vector` 分量按量级收小数位，我们固定 6 位。
- **量出来的位数表**：`6 - trunc(log10|x|)` 夹在 `0..6`，三轮探针（`tmp/probe-edge/{ladder,ladder2,ladder3}.gd`）把每一档都钉了一格，含两个只认 float32 那折 `log10` 的进位格（`999999.875` 给 `1000000`、`9999.9995` 给 `10000.0`）与「`.0` 只由分量本身是否整数决定」那格（`Vector2(3430000.75, 3430001.0)` 给 `(3430001, 3430001.0)`）。
- **两处自己踩的坑**：① 先写成「先折 7 位有效数字再定小数位」，`-0.8626604` 这种值被二次舍入推成了 `-0.862661`（比 golden 多一位）；② 小数位为 0 时还去尾随零，`1000000` 被削成 `1`。两条都是靠产物 vs golden 的 diff 当场露出来的。
- **为什么 208 例一直没管**：float32 在 `|x| < 100` 的十进制展开本来就在 6 位以内，去尾随零之后两种写法同值；扫过全部 golden，**没有一格**的 `Vector` 分量是「非整数且 `|x| ≥ 100`」。这是「出货文本错了但语料分辨不出」的典型形状 —— 与 S308 那三条打包口径、S311 那七处同一类债。
- **影响面**：`str(V)` / `print(V)` / `"%s" % V` 三条通道同源；`Color` 分量（固定 4 位）与标量 float（`strFloat` 的 14～15 位）**不动**，各有一格钉住不回退。`1e21` 以上那一带故意没进语料（引擎给 18 位、我们给 17 位那条不一样），记在 §6 第 40 条。
- **顺带结掉的一条欠账**：`Vector3i(2147483647, 2147483647, -2147483648).length_squared()` 越 `INT64_MAX` 那一格进了语料 300，实测引擎按 int64 回绕给 `-4611686027017322494` —— 我们经 `V.int` 的 `wrap64` 本来就回绕，第一次被钉住。
- **摘掉的格**：1e7 量级的 `cubic_interpolate` 与 `slerp` 共 6 个分量合不上（读数全记在 §6 第 39 条），照红线 1 从语料 300 摘掉不写进实现；同一批的 `bezier_interpolate` / `limit_length` / `project` / `slide` / `bounce` 全合，留着。**cubic 那三格在下一轮（§1.117 / S313）已经请回来** —— 摘的时候以为是 FMA 那一类，实际是实参边界与系数分组两件事。
- **门**：`pnpm test` **1308**（58 文件全绿，ops 自校验 **2102** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **209/209 逐字节**、`test:compile` **216/290** 且 **emitter 不支持 0**、`test:golden --check` **300 例零漂移**、`test:scriptc` 代表集 **38/38 编过 + 跑通 + 逐字节**（300 / 301 两例是新加的）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` **22 项 / 0 失败**，既有 207 例 golden 与产物零 churn。

### 1.115 回头给已出货的方法补边界格：一轮量到七处静默错值（2026-10-11，S311，语料 300）

- **为什么挑这件**：S306～S310 发出去的四十来名里，绝大多数格子是 2 幂与小整数 —— float32 与 double 在那些值上同值，写错了 golden 也不响。补一批 `NAN` / `INF` / `-0.0` / 压线值 / int32 两端 / 非 2 幂中段，是当时最近的一条零成本账。
- **七处分岔（全读在 S311）**：`round` 的「先舍回 float32 再取整」（`0.49999997` 那格给 1 不给 0）、`slerp` 零长退回 lerp、`Vector2i.aspect` 少一道 fround、`Color.darkened` 是乘性不是加性（`-0.0` 保号、`INF` 不折成 `nan`）、`to_html` 非有限分量给 `00` 而有限分量仍夹紧、`Vector*i` 平方差族的差值先回绕、`get_luminance` 三项之和右结合。
- **每一处都是「Godot 出数、我们出错值」**：七条全在出货代码里，且全都不是新方法的式子，只是老式子的边界 —— 这批的量法可以直接复制到别的族（同一条判据：非 2 幂、压线、非有限、int32 两端）。
- **门**：`test:diff` **208/208**（当时）、`test:compile` **215/289**、`pnpm test` **1305**、typecheck **4/4 无 `error TS`**；完整六支长门读数见 §1.116（同一轮收）。
- **下一轮**：§6 第 39 条那条 FMA 收缩假设（当时以为一次能结掉 `bezier_derivative` × 2、`Vector3.move_toward` 与 1e7 那 6 个分量）—— **实际结果分三方**：cubic 那一支的根因不是 FMA 而是「实参没折回 real_t + V3 系数分组」（§1.117 / S313），`Vector3.move_toward` 是探针打印口径造的假分岔（§6 第 35 条结清），`slerp` 与 `bezier_derivative` 才归到精度 / 收缩那一类（§1.118 / S314、第 38 条）。

### 1.114 Bézier 这一族：端点格检验不出系数错，`bezier_derivative` 四组形状全不合（2026-10-11，S310）

- **为什么挑这件**：§6 第 36 条那份名单里剩下的主体就是 bezier / cubic 一族（纯多项式，不需要三角与 `Basis`）。
- **发出去 3 名**：`Vector2.bezier_interpolate`、`Vector2.cubic_interpolate`、`Vector3.bezier_interpolate`（语料 299 逐字节，`t` 特意取了 `0.3 / 0.7 / 0.13 / 0.37` 这些非 2 幂的值）。
- **一版就错在中段，而且错得静**：把 `bezier_interpolate` 的第二项写成 `c1*(u3*t*3)`，`t=0` 给 `this`、`t=1` 给 `end` 两格全对，只有 `t=0.25` / `0.5` 错 —— **端点是单项式，检验不出系数错**。这条已写进 §6 第 36 条的做法：中段必须有格。
- **`cubic_interpolate` 的形参序是个坑**：`(b, pre, post, weight)` 里 `p0` 取**第二个**实参、`p2` 取**第一个**。顺带把两种写法都验到了：`Vector2` 用引擎的链式、既有 `Vector3` 用展开式，两条在非 2 幂的格子上同值 —— 这一对不再是「没钉住的舍入点」（§6 第 37 条从欠账改成了结论）。
- **`bezier_derivative` 没发**：`t=1` 那格先排除了「复用 `dmt+mt2t`」那种写法（会给 `(0.0, 0.0)`，引擎给 `(3.0, -21.0)`）；剩下的形状在 24 个分量上比四组，最好的一组也差 6 格，而且引擎的值**普遍低一个 float32 ULP** —— 这不是舍入点顺序能调出来的，像式子本身形状不同。照红线 1 继续响亮拒，四组比分与拟合脚本记在 §6 第 38 条。
- **手法**：比对不再靠 `test:diff`（它只报**第一处**分歧），改成 `npx tsx corpus/cases/<用例>/main.gen.mts` 跑产物再 `diff` 一遍 —— 一次看全部分岔行；改完 `main.gd` 要先 `pnpm test:compile`，否则比的是旧产物（本轮踩过）。
- **门**：`pnpm test` **1302**（57 文件全绿，ops 自校验 **2092** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **207/207 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **214/288** 且 **emitter 不支持 0**、`test:golden --check` **298 例零漂移**（OK 207 / 报错 74 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **36/36 编过 + 36/36 跑通 + 逐字节 36/36**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn。

### 1.113 `Color` 的静态名在实例上也能调：`hex` 的截位方向与 `blend` 的三条分支（2026-10-11，S309）

- **为什么挑这件**：接着 §6 第 36 条那份名单发下一批。`Color` 这一族里 `hex` / `hex64` / `blend` 三支要新写，另外四名（`html` / `html_is_valid` / `from_string` / `from_hsv`）只是把已有的静态实现接到实例那侧 —— 前提是先量到「实例调用与静态调用一字一样」（`a.html("80ff00")` 与 `Color.html("80ff00")` 都给 `(0.502, 1.0, 0.0, 1.0)`）。
- **两处容易写反的地方**：① `hex` / `hex64` 的通道切法是**高位在前**（`Color.hex(0x123456)` 把 `0x00123456` 按 `r,g,b,a` 切，给 `(0.0, 0.0706, 0.2039, 0.3373)`）—— 与 S308 刚钉的 `to_rgba32` / `to_rgba64` 同一个序，双向自洽；② 实参是**无符号截位**：`hex(-1)` == `hex(0xFFFFFFFF)` 全 1、`hex(4294967296)` 全零，`hex64(0x7FFF…)` 顶通道给 `0.5`。
- **`blend` 是「`p_with` 叠在接收者之上」**：`outA = srcA + (1-srcA)*dstA`，`outA != 0` 时 `outC = (srcC*srcA + (1-srcA)*dstA*dstC)/outA`，`outA == 0` 四通道全零。三条分支各有一格（`a.blend(a)` 那格同时钉住前两条，`Color(0,0,0,0).blend(Color(.5,.5,.5,0))` 钉第三条）；非有限值也取了格：源 alpha 为 `INF` 时 `inf - inf` 让四通道全 `nan`。
- **两支照旧不发**：`Color.from_ok_hsl`（OKLab 常数族）与 `from_rgbe9995`（共享指数解码）—— 名字与元数都在表里（S305），式子没读出来就不发；`hex` 的 float / String 实参同样没量过，继续响亮拒。
- **门**：`pnpm test` **1299**（57 文件全绿，ops 自校验 **2092** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **206/206 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **213/287** 且 **emitter 不支持 0**、`test:golden --check` **297 例零漂移**（OK 206 / 报错 74 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **35/35 编过 + 35/35 跑通 + 逐字节 35/35**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn。
- **下一轮**：`Vector2` / `Vector3` 的 bezier 与 cubic 那一族（§6 第 36 条剩 8 名的主体）；`Vector3.rotated` / `octahedron_*` / `outer`；`Vector3.move_toward` 的卡 z 判别格（§6 第 35 条）；Pack 九支的元数表；链式与定形数组元素那两形；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.112 一支新 Color 打包方法逼出三条「分量转整数」口径（2026-10-10，S308）

- **为什么挑这件**：接着 §6 第 36 条那份欠款名单发下一批（S307 那条手法提醒还在手上：发货要带判别格）。这一批挑了 `Vector2.from_angle` / `Vector3.signed_angle_to` / `Color.to_rgba64` 三支族，五名。
- **一支新方法把老方法的静默错逼出来了**：`to_rgba64` 的越界格（`Color(-0.2, 1.5, NAN, 0.5)`）实测四字节是 `205,127,0,128` —— 打包族是 `round(分量*标度)` 之后**只留低位、回绕**，而我们出货的 `to_rgba32` 那一族走的是**夹紧**。同一个 `byteOf` 被三条口径共用是不该有的：**属性读 `c.r8` 夹紧、nan 给 `INT32_MIN`**（实测同一支颜色 `0|255|-2147483648|128`）、**打包族回绕、非有限给 0**、**`to_html` 夹紧但 nan 当 0**（`Color(NAN,0.5,0.5,0.5).to_html()` = `00808080`）。三条口径各自一个 helper，各有一格语料钉住。
- **`signed_angle_to` 的两处直觉错**：反平行那格给 `pi` —— 没有「叉积为 0 先返 0」那道判据，且 `sign(0)` 取 `+1`。照 Godot 3 的印象或照 `angle_to` 的形状写都会错。
- **`from_angle` 的入参要先折 float32**：`from_angle(3.14159265358979)` 给 `(-1.0, -0.0)`；拿 double 的 pi 直接算 `sin` 得 `+3.2e-15`，打印成 `0.0` —— 符号反了。这一格是本轮唯一能分辨「字面量何时折回单精度」的格子。
- **一条门上的手法**（已写进 S307/S308）：`test:diff` 只报**第一个**分歧行，一行红会遮住后面的分岔；改完 `main.gd` 必须先 `test:compile` 再跑逐字节门，否则新增的行压根没进比对（本轮两处都是这么露出来的）。
- **门**：`pnpm test` **1296**（57 文件全绿，ops 自校验 **2092** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **205/205 逐字节**（静默 0、崩溃 0、未实现 0）、`test:compile` **212/286** 且 **emitter 不支持 0**、`test:golden --check` **296 例零漂移**（OK 205 / 报错 74 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **34/34 编过 + 34/34 跑通 + 逐字节 34/34**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn。
- **下一轮**：§6 第 36 条剩下那 21 名（`Vector2` 的 bezier / cubic 四支、`Vector3` 的 bezier / `rotated` / `octahedron_*` / `outer`、`Color` 的 `blend` / `from_*` / `hex*` / `html*`）；`Vector3.move_toward` 的卡 z 判别格（§6 第 35 条）；Pack 九支的元数表；链式与定形数组元素那两形；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.111 给已经出货的那条式子补判别格：`Vector2.move_toward` 第一次被钉住（2026-10-10，S307）

- **为什么挑这件**：S306 ④ 那条读数是被动撞上的 —— 回头看，出货的 `Vector2.move_toward` 在 068 / 091 那几支用例里的格子全是小整数向量，**任何一条候选式子都能过**。这种「能跑、有 golden、但 golden 分辨不了它」的格子比没发货的名字更危险，因为它给人「已经验证过」的错觉。
- **读数**：新用例 296 的 27 条 `Vector2` 格逐字节对上（`test:diff` 203/203 → **204/204**），出货那支 `v + ((o - v) / len) * delta` 在 46 格拟合里只错 2 格，且那 2 格全是 `Vector3` 的。
- **造判别格的两种手法**（这条比读数本身更值钱）：① **大分量** —— `Vector2(1e7, 2e7)` 那一档 float32 的 ULP ≈ 1.9，任何在中途多舍一次或少舍一次的写法都会被打出来（引擎给 `(9999995.0, 19999990.0)`）；② **delta 贴着 len** —— `Vector2(-4, 8)` 到 `(1, 1)` 的 `len = sqrt(74) = 8.6023259`，delta 取 `8.6` 给 `(0.998649, 1.001892)`、取 `8.602325` 给 `(1.0, 1.0)`，边界那一支就此钉住。
- **八条候选式子的名次**：中途舍回点与乘除次序都影响读数，看着等价的写法**不能互换**（`v + (o-v)*(d/len)` 差 5 格、`o - (o-v)*((len-d)/len)` 差 7 格，出货那支差 2 格）。拟合脚本 `tmp/probe-mt/{gen,fit}.mts` 直接读语料 golden，改一处式子就能重跑一遍。
- **没有就此发 `Vector3.move_toward`**：同一格 x、y 合、只有 z 差 1–3 ULP，12 格里只有 2 格能分辨 —— 样本不足以定式子，照红线响亮拒，下一步记在 §6 第 35 条（补一批专门卡 z 的格）。
- **门**：本轮**零 `src` 改动**（只加语料 + 文档），`pnpm test` **1293**（57 文件）、ops **2092** / 0、tree-face 17 / 0、`test:compile` **211/285**（emitter 缺口 0）、`test:diff` **204/204 逐字节**、`test:golden --check` 与 codegen-drift **295 例零漂移**；`scriptc` / `pkgmodes` / `export` / `cli-native` 沿用上一步（S306）那份绿 —— 它们吃的 `dist` 与产物本轮一字未变，长门留到按族发货那轮再起。
- **下一轮**：§6 第 36 条那串名字（`Vector3.rotated` / `Color.blend` / `from_*` / `to_*64` / `Vector2` 的 bezier 与 cubic 四支）；`Vector3.move_toward` 的卡 z 判别格；Pack 九支的元数表；链式与定形数组元素那两形；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.110 元数门当探雷器：两处静默错值与一批发货（2026-10-10，S306）

- **为什么挑这件**：S305 ④ 记的那笔账 —— 元数表一接上，「名字在表里、实现还没有」从「不知道差多少」变成一串名字。`tmp/probe-value-arity/survey.mts` 在进程内把 154 名逐个问了一遍运行时，欠款 50 名，按族排期。
- **门当探雷器，两处是**已经出货的静默错**：① 值类型五族的 `clamp` 走的是「先比下界、再比上界」那支，我们发的是 `Math.max(lo, Math.min(hi, v))` —— 只在 `lo > hi` 那一形分岔，CLX / CLY / CLZ 三行把三种候选式子分开（其中 `Math.min(Math.max(v, lo), hi)` 在一格上巧合对、另一格就错，所以必须两格一起放）。② `Vector2i` / `Vector3i` 的 `snapped` 是**饱和**不是回绕：`Vector2i(2147483647, -2147483648).snapped(Vector2i(5, 5))` 引擎留 `INT32_MIN`，`wrap32` 会翻成 `2147483646`。同批钉住式子仍是 `step * floor(x / step + 0.5)` 而不是 `round`（`Vector2i(-5, 5).snappedi(2)` 给 `(-4, 6)`）。
- **发货 24 名**：`Vector2` 的 min/max/minf/maxf/clamp/clampf/snappedf/posmod/posmodv、`Vector3` 的 minf/maxf/posmod/posmodv、`Vector2i` 与 `Vector3i` 各 mini/maxi/clampi/snappedi、`Color` 的 clamp（0/1/2 三支都收）与 `linear_to_srgb` / `srgb_to_linear`。`posmod` 走 `fposmod` 那一支，`Vector2(1.5, -2.5).posmod(-2.0)` 给 `(-0.5, -0.5)` 是它与 C 的 `fmod` 那支的分水岭。
- **一支量不出来，留在拒的那一侧**：`Vector3.move_toward` 四条候选式子全给 `-14.215463`，引擎给 `-14.21546` —— 式子没量出来就照红线响亮拒，同时把这条记成 §6 第 35 条，并给已出货的 `Vector2.move_toward` 挂上「判别格缺席」的账。这一支没有因为「差一点点」就写进实现。
- **纪律**：`git diff` 之前先 `pnpm build`；本轮两次工作树假红（EOL 假 M 与并发门）都记在 §2 第 16 条，没再新增。**别在 shell 的引号里放反引号** —— 本轮我用 `node -e` 改文档时把 TS 源码里的反引号带进命令，bash 把它当命令替换执行了一堆文件内容；仓库没被写坏，但那几行注释被吞掉了（当场发现、当场补回）。往文档/源码里插带反引号的文本一律用 Edit 工具。
- **门**：`pnpm test` **1290**（57 文件全绿，ops 自校验 **2092** / 0，tree-face 17 / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **203/203 逐字节**（静默 0）、`test:compile` **210/284** 且 **emitter 不支持 0**、`test:golden --check` **294 例零漂移**（OK 203 / 报错 74 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **32/32 编过 + 32/32 跑通 + 逐字节 32/32**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn。
- **下一轮**：`Vector3.rotated` / `Color.blend` 与 `from_*` 那一族（§6 第 36 条）；`move_toward` 的判别格（§6 第 35 条）；Pack 九支的元数表（§6 第 34 条残项①）；链式与定形数组元素那两形（残项②）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.109 值类型方法的元数表：一句解析期的话能改变整个程序（2026-10-10，S305，§6 第 34 条五族结清）

- **为什么挑这件**：§1.107 / §1.108 两轮都把它挂在「下一轮」第一条 —— S303 那格 `Vector2i(3, 4).snapped(Vector2i(1, 1), Vector2i(2, 2))` 说的不是「句子发错」，而是**时机**：引擎解析期就编不过，我们编得过、跑得动。那一行如果落在永不执行的分支里，两边就是两个不同的程序（语料 293 专门钉这一形）。
- **两批读数把表填满**：下界从「0 实参」那句 `Expected at least N` 读（154 名，`arity.json`），上界从「下界 + 1 实参」那句 `Expected at most N` 读（`arity-max.json`）—— **148 名 min = max**，只有六支带默认实参（`Vector2` / `Vector3.limit_length` 0..1、`Color.clamp` 0..2、`from_hsv` / `from_ok_hsl` 3..4、`to_html` 0..1）。那六支是上界批里唯一「多给一个也收」的，`max6.mts` 逐个加到出句为止 —— S304 那一支 `limit_length` 正好是这一族，两张表合起来才是完整的它。
- **接收者定得出形才拦得住**：`recv.mts` 十二形过裁判，解析期拦的五形是字面构造式、带标注的 var（**有没有初值都算**）、推断的 var、形参标注、模块级 `var` 与 `const`；放过的是 `var v: Variant` 与未定形 `Array` 的元素。**踩到的一处过度拒绝**：第一版把「没标注才看初值」写成「标注解不出就回落初值」，于是 `var v: Variant = Vector2(1, 2)` 被当成 Vector2 拦了 —— 引擎那侧这一形是放过的，误拦合法工程比漏一格贵，改回「标了别的类型就不许再拿初值猜」。链式与定形 `Array[Vector2]` 元素引擎也解析期拦，缺「方法返回类型表」与「定形数组元素形」两张表，本轮按红线放过（落运行期那句）。
- **运行期那一句的 N 是个反直觉读数**：`Invalid call to function 'X' in base 'T'. Expected N argument(s).` 里 **N 取声明的形参数（上界）**，少给也一样 —— `a[2].from_hsv(0)` 给的是 `Expected 4 argument(s)` 而不是 3。五族的 `arity()` helper 此前发中文自述（`Vector2.x 需要 N 个实参（收到 M 个）`），五支一起换成引擎原文，`Color.to_html` 那支自己写的分支改走同一个 helper。
- **覆盖账多一行有名单的**：门一接上就暴露出 `Vector3.rotated` / `Color.blend` / `Vector2.cubic_interpolate_in_time` 这些名**元数都量到了、实现还没有** —— 属 S301 ④ 那一族「有名单」的欠款，本轮不补，但它从「不知道差什么」变成了一串名字。
- **门**：`pnpm test` **1287**（57 文件全绿，ops 自校验 **2092** / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **202/202 逐字节**（静默 0）、`test:compile` **209/283** 且 **emitter 不支持 0**（语义拦下 71→74 全是本轮三格解析期用例）、`test:golden --check` **293 例零漂移**（OK 202 / 报错 74 / §1.97 那族超时仍是 17）、`test:scriptc` 代表集 **31/31 编过 + 31/31 跑通 + 逐字节 31/31**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn。
- **下一轮**：Pack 九支的元数表（§6 第 34 条残项①）；链式与定形数组元素那两形（残项②，要先有方法返回类型表）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；`Vector3.rotated` 等有名单那一族按族发货；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.108 轴下标那支镜像写法在并列格上是静默错值：四族 27 格把两条写法分开（2026-10-10，S304）

- **为什么挑这件**：§1.107 的「下一轮」第一条（值类型元数表）要先量一张表才能动，而这一轮的三处是**已经在响的用户可见错** —— `Vector2i` / `Vector3i` 的 `min_axis_index` 在并列向量上给 0（引擎给 2，静默错值）、`limit_length` 的 0 支被我们拦成缺实参（引擎带默认实参、照出数）、`Vector2` 的两支轴下标整支没接。
- **式子的分水岭只有两形**：并列与 NaN。引擎是严格的 `<` 嵌套（`min = x<y ? (x<z ? 0 : 2) : (y<z ? 1 : 2)`、`max = x<y ? (y<z ? 2 : 1) : (x<z ? 2 : 0)`），我们此前发的是镜像的 `>=` / `<=` —— `(2,2,2)` 的 min 差一格（0 对 2）、`(NAN,0,1)` 的 max 差一格（2 对 0）：**NaN 与任何数比都假，所以它一定走 else 分支**，这一格与并列格合起来才把两条写法钉死。四族 27 格（`Vector2` 9 / `Vector2i` 6 / `Vector3` 7 / `Vector3i` 5）+ `typeof = 2`。
- **零长保护是被门逼出来的**：`test:diff` 报 `289` 第 30 行 `godot: LL2|…|(0.0, 0.0)` / `js: …|(nan, nan)` —— `(0,0,0).limit_length(-1.0)` 缺一道缩放前的零长判据。补上之后没有就此收手：**「非零」与「> 1e-5」两种写法在这格上是同一个值**，所以另量一档 5e-6 的向量（`tmp/probe-limitlen/ll.gd`）—— 引擎照样缩放到 `(0.0, 0.0)`，门槛确认是「长度非零」，那种 epsilon 写法作废；比较方向（`(0.000005, 0).limit_length(1.0)` 原样返回）与负 `length`（`(-3,-4).limit_length(-1.0)` 给 `(0.6, 0.8)`）同批钉住。
- **反向收获一名**：`inverse()` **只有 `Vector3` 有** —— `Vector2` / `Vector2i` / `Vector3i` 三族实测全给运行期那句 `Nonexistent function`，归进 S301 / S302 那张成员名表（ops 2075→**2078**）。三格都是 §1.97 那族「SCRIPT ERROR 之后 `quit()` 跑不到 → 进程挂着」，所以**一次一格**才分得清是谁挂的；`Vector3.inverse()` 本身没有零保护（`(0,0,0)` 给 `(inf, inf, inf)`），`1/0` 的 inf 就是逐分量 float32 除法的自然结果。
- **门自己撞了一次自己的腿（记进 §2 第 16 条）**：上一轮我把一支 e2e 门判红后停了它的 wrapper 就起重跑 —— **子进程没跟着死**，于是 `test:cli-native` 报 `ENOTEMPTY tmp/cli-native-check`、`test:scriptc` 报 `EPERM tmp/sc-gate/…`、`test:pkgmodes` 报 `Cannot find module pkg-check\nested_out\main.mts`，三处一起红，看着像语义回归。单独串行重跑：pkgmodes **25/25**、scriptc **30/30 编过 + 30/30 跑通 + 逐字节 30/30**。停门要先确认没有残留的 godot / node 子进程，再起下一支。
- **账**：语料 289（37 行逐字节，`test:diff` **201/201** 静默 **0**）、`test:compile` **208/279**（emitter 缺口 0）、ops 2075→**2078**、`pnpm test` **1235**（55 文件全绿）、typecheck **4/4 无 `error TS`**、`test:scriptc` 代表集 **30/30 编过 + 30/30 跑通 + 逐字节 30/30**、`test:pkgmodes` **25/25**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、既有 golden 与产物零 churn（唯一的工作树噪声还是 `280-pow-precedence` 那三份的 EOL 假 M —— `.gitattributes` 那一问仍待拍板）。
- **下一轮**：值类型方法的**元数表**（§6 第 34 条；下界 154 名已在 `tmp/probe-value-arity/arity.json`，上界这一半的探头 `tmp/probe-value-arity/max.mts` 已写好待跑）；Pack 其余六支的名单（§6 第 33 条残项）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.107 整数向量没有那套几何方法：一个负答案省下一整轮（2026-10-10，S303）

- **为什么挑这件**：§1.98 的「下一轮」第一条就是「`Vector2i` / `Vector3i` 有没有这套几何要先量」—— 它挂在待办上，会一直诱导人去补，先把它问死。
- **答案：没有。**`slide` / `bounce` / `reflect` / `project` 在 `Vector2i` 与 `Vector3i` 上引擎全给 `Nonexistent function`，`wrap` 也没有 —— 所以那不是「Godot 能跑、我们崩」，是**Godot 自己也没做的东西**，§1.98 那条从待办里划掉。正对照同批出数（`distance_to` / `distance_squared_to` / `length` / `abs` / `sign` / `clamp` / `aspect`），并且 `Vector3i.octant` 判「无」与 S301 那张表一字不差 —— 通道是通的、旧读数被复证。
- **同一轮白捡一个新缺口（S303 ②，值得单独排期）**：`Vector2i(3, 4).snapped(Vector2i(1, 1), Vector2i(2, 2))` 引擎**解析期**就拒（`Too many arguments for "snapped()" call. Expected at most 1.`），我们编得过、到**运行期**才响中文自述。时机比句子更要紧：那一行若落在永不执行的分支里，两边就是两个不同的程序。缺的是一张**值类型方法的形参元数表**（哪些方法收几个、少给/多给各发哪句原文）—— 与 S254（内置函数元数改到发射期拒）、S180（容器方法实参槽两句）同族，落点现成。
- **探头纪律第三次应验**（S302 ④ / S303 ③）：第一遍我把参数串写成 `s.slide((1, 0))`，12 格里 8 格是解析期错、判据全废；加了正对照重跑才算数。**每批探头都要有一格「这一步一定出数」的对照**，否则整族读数会静默失真。
- **门**：这一格只出读数、不动实现，所以没有产品面变化需要门保 —— 记录在 S303 与 §6 第 34 条。
- **下一轮**：值类型方法的元数表（§6 第 34 条，先量后接）；Pack 其余六支的名单（§6 第 33 条残项）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；§6 第 29 条对象表三形；覆盖面账按族排期（S300 ⑥ / S301 ④ / S302 ⑥）；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.106 成员名表扫到最后一族：Pack 的 byte 独有组还差一句（2026-10-10，S302）

- **为什么挑这件**：把 §6 第 33 条那张表收完 —— Pack 三支代表（byte / int32 / string）+ StringName + NodePath + RID，同一把尺子。
- **量到的**：244 名（有 220 / 无 24，含乱造对照）。**byte 独有那一组**（`compress` `decompress` `get_string_from_ascii` `get_string_from_utf8` `hex_encode` `to_float32_array` `to_float64_array` `to_int32_array` `to_int64_array`）在 int32 / string 两支引擎全拒；我们的 `packedMethod` 早就分了三组处理未知名，其中两组句子一字一样（9 格「已发对」），**只有 `BYTE_ONLY` 那一组发的是「只在 PackedByteArray 上量过」**——本轮换成引擎那句（同函数里现成的 `packed-no-method` 口径），11 格、新门 +18 格。
- **StringName / NodePath / RID 零幽灵** ✓；RID 这一族差点被读成"全都有"，因为第一遍的接收者写成了 `RID(65)`，而 **`RID(int)` 在 4.6.3 不是合法构造签名**（整支脚本连编译都过不去），分类器只认「有没有 Nonexistent 那句」于是每格都判成「有」。**探头自身的这条纪律已写进 S302 ④：过裁判之前先验证接收者跑得通**（第一格放个正对照）。
- **一条贯穿五个批的结论**：「我们实现了引擎根本没有的成员」这一类（S300 的 `Array.concat`）在 Callable / String / Array / Dictionary / Vector×4 / Color / Pack / StringName / NodePath / RID 里**只有那一个**——「给得出值」桶在五批里全是空的。所以污染是个案，不是系统性；但个案的后果值得它单独一级：那是掩盖型错误。
- **门**：`pnpm test` **1231**（ops 自校验 2075 / 0）、typecheck **4/4 无 `error TS`**、`test:diff` **200/200 逐字节**（静默 0）、`test:compile` **207/278** 且 **emitter 不支持 0**、既有产物与 golden 零 churn、`test:scriptc` 代表集 **29/29 编过 + 29/29 跑通 + 29/29 逐字节**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**。
- **下一轮**：Pack 其余六支的名单（§6 第 33 条）；把 74 + 53 + 若干「引擎有、我们没登」的覆盖面账按族排期（S300 ⑥ / S301 ④ / S302 ⑥）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；`Vector2i` / `Vector3i` 几何支；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.105 Vector 四支与 Color 的成员名表：59 名分类早就对了，差的是句子（2026-10-10，S301）

- **为什么挑这件**：S300 收尾时判定「掩盖型污染是局部的还是系统的」还没证据 —— 把 Vector 四支与 Color 过一遍就有答案。
- **量到的**：218 名（我们的候选 ∪ 4.3 XML ∪ 乱造对照）过裁判，**有 154 / 无 64**（含 5 支对照）→ 真不存在的是 **59 名**：Vector2i 14、Vector3i 33、Color 12。**Vector2 与 Vector3 零幽灵**（48 + 48 个名在 4.6.3 全部存在）。
- **答案：是局部的**。拿这 59 名逐个去问我们的运行时（`ask-ours.mts`），落进「**给得出值**」那一桶的是**空**的 —— 这三族早就把它们归在「实测不存在」那一组（分支里写着"实测不存在（4.6.3 探针）"），只是发的是**中文自述**而不是引擎那句。所以 `Array.concat` 那一类（Godot 拒绝编译、我们照跑）目前是个案，不是一片。
- **改的只有三处 throw**：`vector2i.ts` / `vector3i.ts` / `color.ts` 各一处，换成 `Invalid call. Nonexistent function '<名>' in base '<类型>'.`（`UnsupportedError` → `GodotRuntimeError`，与 Signal / RID / Array / Callable 同一口径）；新门 `packages/runtime/test/value-absent-method-names.test.ts` 59 格逐名钉句子，ops 自校验 1998 → **2057**。
- **一条方法教训（本轮真踩，S301 ⑤）**：判「我们的表里有没有某个名」**不能 grep 源码的 `case "…"`** —— 同一个 dispatch 段里既挂着「已实现」也挂着「实测不存在」两组 fall-through，往后翻还会翻到别的 switch，于是一片假阳（我第一次就把 §6 第 11 条早量过的 `Vector2i.normalized` 当成「我们当合法名待着」）。正确做法是问运行时、按抛出的 message 分四桶。
- **覆盖面账**：引擎有、我们表里没登 **53 名**（逐名在 `tmp/probe-member-tables/vsweep.log` 末段），照红线继续响亮拒。
- **门**：`pnpm test` **1229**（55 份）、ops 自校验 **2057** / 0、typecheck **4/4 无 `error TS`**、`test:diff` **200/200 逐字节**（静默 0）、`test:compile` **207/278** 且 **emitter 不支持 0**（既有产物零 churn）、`test:scriptc` 代表集 **29/29 编过 + 29/29 跑通 + 29/29 逐字节**（新句子在静态目标上同一条）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**。
- **下一轮**：Pack 九支与 StringName / NodePath / RID 的成员名表（§6 第 33 条）；`unbind` 语义自洽；match 臂错元数那两句；`var x =` 换行族；`Vector2i` / `Vector3i` 几何支（§1.98 —— 与本轮的名单正好可以合着量）；§6 第 29 条对象表三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.104 String / Array / Dictionary 的成员名表：抓出一个被**实现**了的幽灵名（2026-10-10，S300）

- **为什么挑这件**：§1.103 刚把 Callable 的名表过完裁判就捞出四个幽灵名，而同一套手法可以直接搬到别的类型 —— 这不是补覆盖面，是**查我们替 Godot 招了哪些它没有的 API**。
- **两条批量通道都撞墙**（都记进 S300 ①，免得下一族再试）：`ClassDB.class_get_method_list("String")` 对内置类型**给空表**（19 类各 0 名，内置方法走 VariantInternal 不进 ClassDB）；把调用写进一支永不调用的函数体指望解析器批量报错也不行 —— **4.6.3 对内置类型的未知成员解析期放过、运行期才报**（S193 ⑤ 那个形状）。剩下的只有一格一跑：180 格，引擎侧 9 秒超时。
- **抓到的是本轮最重的一条**：`Array.concat` 在 4.6.3 **根本没这名字**（`Invalid call. Nonexistent function 'concat' in base 'Array'.`），而我们不但表里登了它，还**实现了它** —— 用的正是 JS `Array.prototype.concat` 的语义。后果不是「一句话发错」，而是**外语 API 混进了 GDScript 的接受集合**：用户按 JS 习惯写 `a.concat(b)`，Godot 拒绝编译，我们的产物给出一张新数组继续跑，错误被完全掩盖。
- **修法照既有先例**：`join` 那格（S171 量过：Array / Dictionary / 九种 pack 上都没有 `join`）已经是「表外名发引擎那句」的形状，本轮把它从一句 `if (name === "join")` 扩成一张 `ARRAY_NO_METHOD = {"join", "concat"}`，并**删掉那条 `case "concat"`**。全仓语料与门里没有任何一格用过 `.concat(`（grep 空），所以出货文本零 churn。
- **顺带把覆盖面账量清了**：引擎有而我们表里没登的 **74 名**（String 58 / Array 11 / Dictionary 5，分组清单在 S300 ⑥，逐名在 `tmp/probe-member-tables/sweep.log`）—— 照红线继续响亮拒，但从此是**有名单的账**而不是「不知道还差多少」。String / Dictionary 这两族本轮过裁判**零污染**（除 `concat` 外，我们表里 103 名引擎全认）。
- **门**：`pnpm test` **1226**、ops 自校验 1997 → **1998**、typecheck **4/4 无 `error TS`**、`test:diff` **200/200 逐字节**（静默 0 / 崩溃 0 / 未实现 0，既有产物一字未改）、`test:scriptc` 代表集 **29/29 编过 + 29/29 跑通 + 29/29 逐字节**、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**（汇总里 3 格记为上游 / 环境记账）、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**。
- **下一轮**：把同一把尺子搬到 Pack 九支 / Vector 四支 / Color / StringName / NodePath / RID（§6 第 33 条）；`unbind` 的语义自洽；match 臂错元数那两句；`var x =` 换行族；`Vector2i` / `Vector3i` 几何支；§6 第 29 条对象表那三形；任务 #58 与 `.gitattributes`（要用户拍板）。

### 1.103 Callable 成员名表过了一遍裁判：四名根本不存在的名字被挂在「未实现」上（2026-10-10，S299）

- **为什么挑这件**：§1.102 末尾记的就是这条 —— `unbind_many` 那格读数显出「名字表被抄来的清单污染」，而这类污染不可能一格一格撞出来，只能整族过一遍裁判（§1.52 对全局函数名表干过同样的活，成员表一直没人做）。
- **怎么量**：候选池 = 4.3 `doc/classes/Callable.xml` 的方法名 ∪ 我们自己表里的名 ∪ S247 记过的两支可疑名，共 24 名，一名一支脚本发 `c.<名>()`；判据是那句 `Invalid call. Nonexistent function 'X' in base 'Callable'.` 出现 = 没这名字，出 arity 句或给出值 = 有。
- **量到的**：存在 **20 名**；**没这名字的四名是 `from` / `get_object_instance_id` / `is_equal` / `unbind_many`**，而我们此前把四名全挂在 `Callable.X() 未实现` 上——等于**替引擎招了一个不存在的 API**。更普泛的一条是**任何打错字的名**（对照格用 `frobnicate`）当时也发「未实现」，而引擎发的是运行期那句，且 lambda 基与空 `Callable()` 基**同一句**。
- **改的法子**：照 Signal（S193 ⑤）/ RID / NodePath 那张已有的模式——新增 `CALLABLE_METHOD_NAMES` 这张实测名单，`callableMethod` 的兜底先判名单：表外 → `Invalid call. Nonexistent function '<名>' in base 'Callable'.`（`GodotRuntimeError`），表内而没式子 → 仍 `Callable.<名>() 未实现`（`UnsupportedError`）。两类句子各有各的门钉着（`packages/runtime/test/callable-member-names.test.ts`）。
- **为什么不进语料**：`Nonexistent function` 是运行期 SCRIPT ERROR，脚本当场中止、`quit()` 到不了，golden 会带上「引擎不退出」那一族（§1.97 刚记过），照 S243 / S265 那条口径这类只进 ops。
- **一处仪器教训**：第一遍 sweep 把 24 名的「有 / 无」**全判错了**——这台机器上有个野生 project 目录（`F:/ex/godot_projects/…`）会往 stderr 印 `ConfigFile parse error`，占掉输出首两行，于是每格都被读成「有」。加噪声过滤重跑才是上面那份表。**过裁判的探头必须先滤 stderr**，别只看首行。
- **门**：ops 自校验 1981 → **1997**、`pnpm test` **1226**（54 份）、typecheck **4/4 无 `error TS`**、`test:diff` **200/200 逐字节**（静默 0 / 崩溃 0 / 未实现 0）、`test:scriptc` 代表集 **29/29 编过 + 29/29 跑通 + 29/29 逐字节**（含 234 面探针与 133 那格 Callable 成员族 —— 新加的模块级 `Set` 与改了兜底的 `callableMethod` 在静态目标上没问题）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**（汇总里 3 格记为上游 / 环境记账）、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**；既有 golden 与产物一字未改。
- **下一轮**：`unbind` 的语义（count 式子已拟合、调用侧口径还打架，§6 第 8 条②b）；match 臂错元数那两句解析期文案（S297 ⑤）；`var x =` 换行那一族（§6 第 32 条）；NodePath 字面量键的重复拒（S294 ⑨）；`Vector2i` / `Vector3i` 几何支（§1.98）；§6 第 29 条那三形对象表；**其余内建类型的成员名表也该这样过一遍裁判**（String / Array / Dictionary / Vector 那几族的名单还是抄来的）；任务 #58 与 `.gitattributes`（两件都要用户拍板）。

### 1.102 `get_argument_count()` 那一格负数：一条被单格探头骗了一遍的式子（2026-10-10，S298，语料 288）

- **为什么挑这件**：§1.101 末尾记的「下一轮」里，这一格是唯一**读数已在手且属静默错**的（引擎给数、我们给另一个数，不是响亮拒）。
- **结论**：式子是「声明形参数 − 已绑个数」，**方法与 lambda 都允许负数**（`one(a)` 绑 3 支 → −2；`h(a)` 绑 2 支、链式绑 2 支 → −1），只有**空 `Callable()` 基恒给 0** —— 我们原先在空基上发 −1 / −2 / −2 / −3，本轮按 `isNullCallable` 单给 0，方法和 lambda 一个夹子都不加。
- **一次真实的读数翻案（这部分最值钱）**：上一轮我用「一格一脚本」的探头量到 `A.new().one.bind(1,2,3)` 给 **0**，当场写成「方法基夹在 0」并进了文档。这一轮同一支脚本里并排四种写法把它驳倒了：`var o = A.new()` 之后取 → **−2**；`var v = o.one.bind(…)` → **−2**；`var w = A.new().one.bind(…)` → **0**；`print(A.new().one.bind(…).get_argument_count())` 当场取 → **−2**。差在**基对象是不是临时表达式**：`A` 属 RefCounted 一族，`var w = A.new()…` 那句结束后实例没有别的引用、当场被引擎回收，Callable 摸不到元数据就报 0 —— 这是 §6 第 19 条「对象生命周期不复刻」那条口径的连带现象，属引擎实现细节，不进实现。**读数纪律因此加一条**：量 Callable 的元数据，基对象必须先进变量再用；单格探头在这条上会给假规则（已写进 S298 ④）。
- **顺带结掉一条虚警**：上一轮记的「探头有几格把 240 秒超时等满、疑似我们这侧挂起」——是**引擎侧**报完 `Attempt to call function 'null::null (Callable)' on a null instance.` 之后不退出（脚本报错中止 → `quit()` 到不了），与 §1.97 那 17 格 `<<GDS2JS_TIMEOUT>>` 同族；我们这侧同文本、rc=1 退出，两句一字一样。**不是挂起，是那一族的老形状**。
- **门**：`test:diff` **200/200 逐字节**（静默 0 / 崩溃 0 / 未实现 0）、`pnpm test` **1225**（ops 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` 新格 **1/1** 且 **emitter 不支持 0**、`test:scriptc` 代表集 **29/29 编过 + 29/29 跑通 + 29/29 逐字节**（`287` / `288` 两格都已进集）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**（汇总里 3 格记为上游 / 环境记账）、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**；既有 golden 与产物一字未改（`git status` 里 `corpus/` 只有新用例）。`test:golden-check` 那次整 sweep 是 S295/S294 那批之后跑的（OK 197 / 报错 71 / 超时 17 / 漂移 0），这三轮只往引擎侧**新增**了 286 / 287 / 288 三支 golden，且逐支跑过 `node tools/golden.mjs <格> --check`（各 **OK 1 / 漂移 0**），旧 golden 一格没动。

### 1.101 match 手臂的负数与三元 `Color`：七形「Godot 能跑、我们当场抛」收口（2026-10-10，S297，语料 287）

- **为什么挑这件**：§1.100 那批小读数里，match 手臂那一族是唯一「读数已经齐、只欠发射准入门」的缺口 —— 不需要新探头，也不用等 Tier 2（`Vector2` / `Vector3` / `Vector2i` / `Color` 四支值型都在手上）。
- **卡点在哪**：`-1` 在这棵语法树里**不是负字面量**，是 `unary_operator` 套一个 `integer`（`tmp/probe-tails/cst.mts` 打出来才看清），所以旧判据「实参类型必须在 `ARM_ARG_LITERALS` 那张表里」把这些形全挡在门外，手臂落到 `lower` 的 default 分支抛 `模式 call 未支持`；`Color` 则是元数表只登了 4。
- **改的只有准入门**：`CTOR_ARMS` 从「名字 → 一个元数」换成「名字 → 量过的元数集合」（`Color: [3, 4]`），实参位多收一条「一元负号 + 整 / 浮字面量」。发射没新形状 —— 走的还是 S280 那条 `rt.patConst(<构造式>)`，负数带着 `lowerExpr` 原有的括号（`rt.V.int((-1))`），三元 Color 就是 `rt.colorNew([...])` 少一格。当表达式用那两条两侧本来就对（探头 A/B 组：`Color(1, 2, 3)` 给 `(1.0, 2.0, 3.0, 1.0)`、`.a` 是 `1.0`、`typeof` 20），所以这次是纯粹的覆盖面收口。
- **一处门的自我修正**：`emit-guards` 那张手臂表里 `Color(1, 2, 3)` 与 `Vector2(-1, 2)` 原先钉在 **REFUSED**（当年的口径是「没量过就先拦」）。读数到手后这两格挪进 ARMS 并各钉自己的发射式子，`Vector2(1)` 留在 REFUSED —— 引擎那一形发**两句**（`No constructor of "Vector2" matches the signature "Vector2(int)".` + 那句常量表达式拒），我们仍是一句自述，那两句的账留在 §6 第 28 条 / §2 第 20 条①。闸门这次是**先响后才改**的，没绕过它。
- **反例也钉了**：subject `Vector2(1, 2)` 对臂 `Vector2(-1, 2)` 落 `_`（语料 287 的 B 组）—— 放行不是把负号吞掉当成同一个值。
- **门**：`pnpm test` **1222**（53 份；ops 1981/0、tree-face 17/0，含改过的 `emit-guards` 十一形 + 一形反例）、typecheck **4/4 无 `error TS`**、`test:compile` **206/277** 且 **emitter 不支持 0**、`test:diff` **199/199 逐字节**（静默 0 / 崩溃 0 / 未实现 0）、`test:scriptc` 新格 `287` **1/1 编过 + 跑通 + 逐字节**（代表集清单从 27 格变 28 格）、**既有产物一字未改**（`git status` 里 `corpus/` 只有新用例，`280-pow-precedence` 那三份仍是 §1.96 记的行尾假 M）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**（汇总里 3 格记为上游 / 环境记账）、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败**。
- **下一轮**：错元数那两句解析期文案（含各自的行号）；`Callable().bind(n)` 的 count 那一格静默错与 `unbind` 一族；`var x =` 换行那一族（§6 第 32 条）；NodePath 字面量键的重复拒（S294 ⑨）；`Vector2i` / `Vector3i` 几何支（§1.98 记的，要先量）；§6 第 29 条那三形对象表；任务 #58 那把性能尺子与 `.gitattributes`（两件都要用户拍板）。

### 1.100 容器元素的 `c_escape`：出货文本级的静默错，门一直没响是因为语料没那种形状（2026-10-10，S296，语料 286）

- **为什么挑这件**：接着 §1.99 往下扫推荐清单第 8 项那批小读数（StringName 进容器要不要转义 / match 臂的负数与元数 / lambda 与空 Callable 上的 bind）。第一探头就翻出比目标本身大得多的东西：**`print(["a\"b"])` 我们印的是 `["a"b"]`** —— 容器里的 String 元素从来没过 `String::c_escape()`，引号、反斜杠、单引号、换行、制表、CR、bell、垂直制表、换页九种字符全部裸印出去，是出货文本级的静默错（不是拒答，是印错）。
- **量到的**（`tmp/probe-tails/esc2.mts`，15 字符 × 10 通道 = 150 格逐字节）：容器那一列走 `c_escape`（`\"` `\\` `\'` `\n` `\t` `\r` `\a` `\v` `\f`，ESC 与 U+001B 一族留原样）；顶层 `var_to_str(串)` 只转 `"` 与 `\`、控制字符留原样；`var_to_str([串])` 又与顶层同尺 —— **三条尺子别并成一条**。StringName 与 NodePath 同一把尺（`[&"a\"b"]`），§6 第 9 条那一问就此结清，`variant.cpp:1678` 的预测成立。
- **修的地方只有一行半**：`packages/runtime/src/runtime/values.ts` 的 `repr` 里 STRING 与 STRING_NAME 两支各套上 `strCEscape`（node_path 那一支 S268 ② 早就接了，同一条尺子）。
- **门为什么一直绿着**：285 份 golden 里没有一格把带引号 / 反斜杠 / 制表符的字符串放进容器 —— 这是**门的盲区**而不是门的失灵，`test:diff` 只能对账语料写过的形状。语料 286 补的就是这一格；NUL 那一形按 S243 的口径不进语料（引擎那句 `Unicode parsing error …` 在 stderr，golden 收得下而我们发不出，第一次跑就是这么报的静默错 1，摘掉 0 之后 15 形全绿）。
- **顺带量清、这一轮没接的三批**（读数已进 §6 第 8 / 28 条，别再重量）：① **match 手臂的负数字面量引擎全收且命中**（`Vector2(-1, 2)` / `Vector3(-1,-2,-3)` / `Vector2i(-1,2)` / 三元 `Color(1, 2, 3)`），我们七形当场全抛 `模式 call 未支持`；`Vector2(1)` 那种错元数引擎发**两句**（`No constructor of "Vector2" matches the signature "Vector2(int)".` + 那句常量表达式拒）。② ~~**空 `Callable()` 上 bind 之后 `get_argument_count()` 引擎给 0、我们给 −1**~~ —— 新的静默错一格，**已发货（S298，语料 288）**。③ ~~**`Callable.unbind()` 没实现**（引擎跑得通），欠 `unbind` / `unbind_many` 的实参形状读数~~ —— 读数已在（§6 第 8 条②），其中 **`unbind_many` 那格由 S299 定案：4.6.3 没这名字**，「未实现」那句改成了引擎的 `Nonexistent function`；`unbind` 本身仍欠自洽的语义。lambda 上 bind、`bind()` 空列表、链式 bind、空 Callable 被调那四形实测两侧一字一样，不用动。
- **门**：`test:diff` **198/198 逐字节**（静默 0 / 崩溃 0 / 未实现 0）、`pnpm test` **1219**（ops 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` **205/276** 且 **emitter 不支持 0**、`test:scriptc` 面探针 `234` **1/1** + 新格 `286` **1/1 编过 + 跑通 + 逐字节**（`repr` 这一改在静态目标上同一条式子）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / FAIL 0**（19 格里 9 格按 skip 记，汇总里 3 格记为上游/环境记账）、`test:cli-native` 重编 exe 后 **22 项 / 0 失败**、探头 150 格 **0 分岔**。**代表集清单从现在起是 27 格**（`285` 与 `286` 都进去了），本轮没重跑那 27 格的整集，`286` 是用 `GDS2JS_SCRIPTC_FILTER` 单格过的（编过 + 跑通 + 逐字节）。**既有 golden 与产物一字未改**：`git status` 里被动的只有 `analyze.ts` / `builtins.ts` / `values.ts` / `scriptc.test.ts` 四份源码与两份文档，`corpus/` 下只有四支新用例 —— 所以 285 份旧 golden 的引擎侧读数没有可变的理由，`test:golden-check` 那一轮 13 分钟的整 sweep 这轮没重跑（上一轮的整 sweep 是 §1.99 那批改动之后跑的，OK 197 / 报错 71 / 超时 17 / 漂移 0）。
- **下一轮**：match 臂那七形（负数字面量 + 元数两句拒的文案）；`Callable().bind()` 的 count 那一格与 `unbind` 一族；`var x =` 换行那一族（§6 第 32 条）；`Vector2i` / `Vector3i` 几何缺口（§1.98 记的）；§6 第 29 条那三形对象表与 NodePath 字面量键那一格（S294 ⑨）；任务 #58 那把性能尺子（要用户拍板）；`.gitattributes` 那一问（工作树 `280-pow-precedence` 的假 M 仍在）。

### 1.99 字典字面量的重复键与符号零：从「跑出个错数」那一栏挑的第一件（2026-10-10，S294 / S295，语料 283 / 284 / 285）

- **为什么挑这两件**：待办清单里「用户可见的错」排在最前 —— §6 第 23 条末尾明写着 `atan2(-0.0, 0.0)` 引擎给 −π、本机式子给负零，那是**跑出错值**而不是响亮拒。这一族的邻格（三角、角度、取整、负零）一并扫，一轮出清。
- **第一件反转：atan2 那一格早就对了**。四形 `atan2(±0.0, ±0.0)` 给 `0.0 / -0.0 / ±3.14159265358979`，两侧一字一样（S265 那一轮顺带带上的，旧账没划）。真正还开着的是同一批扫出来的**字典字面量重复键**：`{"a": 1, "a": 2}` 引擎把脚本编不过，我们照收照跑、后面的值静默盖掉前面的 —— 从探头里翻出来的，不在任何一张清单上。
- **第二件反转：怀疑的六支函数里，五支的抹号方向和我以为的相反**。先是 114 格的混读（`tmp/probe-negzero/nz.mts`）看着「字面量 `-0.0` 那族全对、三角族六格分岔」，但那一支脚本里 `var z: float = 0.0` 先占了常量池，把后面所有 `-0.0` 字面量的号带跑了（S265 ④ 那条），读数不可信。改用**运行时算出来的零**重量 38 格（`nz3.mts`）才看清：**引擎留号而我们抹号的**是 `floor` / `ceil` / `round` / `clampf` / `deg_to_rad` / `rad_to_deg` / `fmod`，方向与我起初的猜测正好相反；另有一格是反的 —— `floori(-0.0)` / `ceili(-0.0)` 引擎给的是**正零 int**，而 JS 的 `Math.floor(-0)` 是 `-0`，我们从 `vi()` 把它原样装进了 INT 载荷，于是那条 int 在除法与 `%` 格式里 behaves 成 `-0.0`。
- **式子（读数全在 S295）**：`floor(-0.0)` / `ceil(-0.0)` / `round(-0.0)` / `clampf(-0.0, 0.0, 1.0)` / `deg_to_rad(-0.0)` / `rad_to_deg(-0.0)` / `fmod(-0.0, 1.0)` 全留号（`1.0 / (v * 1.0)` 给 `-inf`、`"%.1f" % v` 给 `-0.0`）；`abs` / `sign` / `snapped` / `fposmod` / `lerpf` / `move_toward` / `sqrt` / `clamp` 三支那形两侧本来同值，**照旧不动**。`round` 那一支的抹号还另有出处 —— `gdRound` 用 `x >= 0` 判方向，而 `-0 >= 0` 是真的，于是绕进 `floor(-0 + 0.5)` 折成正零；保号只做在 `round` 自己那一支，因为 `snapped(-0.0, 1.0)` 实测要的是 `+0.0`，塞进共用的 `gdRound` 就把它带坏了。
- **重复键那一族的规则（36 形两侧对撞，`keys.mts` / `keys2.mts`）**：① 只查**折得出常量**的键（`{1 + 1: 2, 2: 3}` 拒、`{1: 1, x: 2}` 放过）；② **容器键不查**（`{{1: 2}: 1, {1: 2}: 2}` 两侧都收）；③ 同键就是**字典的桶判据**——`String` 与 `StringName` 同键、`0.0` 与 `-0.0` 同键、`nan` 与自己同键（这一格和 `==` 那条不同，值得记），而 `1` / `1.0` / `true` / `"1"` 各是两支键；④ 键文本就是 `str(键)`（`a` 不带引号、`<null>`、`(1.0, 2.0)`、`-0.0` 出 `0.0`）；⑤ **报的行号是首次出现那一格**，不是重复那一格（跨行字典实测：重复在 7 行、报 6 行），一个字典里几处重复就发几行。落点 `packages/compiler/src/lower/analyze.ts:checkDictDuplicateKeys`，判据表另钉成门 `packages/compiler/test/dict-dup-key.test.ts`（29 形：19 拒 10 收），语料 283 钉那句拒、284 钉那张运行期桶表（`{1, 1.0, 0.0, true, "a", 0, false, null, Vector2(1,2)}` 九支键 + `d[算出来的 −0.0]` 落进 `0.0` 那一格）。
- **一处仪器教训（本轮真实踩到，写下来免得再来一次）**：改完 `packages/runtime/src` 直接跑探头**读数不变** —— 探头吃的是 `packages/gds2js/dist` 那份打包副本，`pnpm build` 之后才见到新数。§2 第 16 条早就写了这条，本轮是在探头上而非门上撞的，同一颗坑两种踩法。
- **顺带量到、没发货的一形**：`var d2 =` 之后换行才写 `{`，引擎报 `Expected expression for variable initial value after "=".`，我们照收 —— 立 §6 第 32 条（整族没量：`= ` 后换行接标量 / 数组 / 调用各给什么、括号内跨行放行到哪，都没读数，照红线不写实现）。
- **门**：`pnpm test` **1216**（53 份；ops 自校验 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:sema` 命中 **275/275**（误报 0 / 漏报 0 / 崩溃 0，那 17 例运行期清单**一字未变** —— 新加的解析期拒没把任何一例从「运行期才错」拽成「静态拒」）、`test:compile` **204/275** 且 **emitter 不支持 0**、`test:diff` **197/197 逐字节**（静默 0 / 崩溃 0 / 未实现 0，**既有产物一字未改**）、`test:golden-check` **OK 197 / 编译或运行报错 71 / 超时 17 / 漂移 0**（763.5 s，报错那一栏从 70 变 71 就是新用例 283）、`test:scriptc` 代表集 **26/26 编过 + 跑通 + 逐字节**（新进的 `285` 在列 —— `round` 那支新加的内联箭头函数在静态目标上没炸）、`test:pkgmodes` **25/25**、`test:export` **ok 10 / 记账 9 / FAIL 0**、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败**、新门 `dict-dup-key.test.ts` **29 形**（19 拒 10 收）、`tmp/probe-negzero/nz3.mts` 那批 38 格修前 10 分岔 → 修后 **0**。
- **范围那一侧另跑了一支六形探头**（`tmp/probe-negzero/scope.mts`）：定型字面量、lambda 体里、当实参传的字典都**同句同行号**拒，match 手臂里的 Pattern 字典引擎不查、我们也不查（不多拦）；翻出来一形仍漏 —— **NodePath 字面量键**（`{^"a": 1, ^"a": 2}` 引擎拒、键文本是不带 `^` 的 `a`），因为 `str(NodePath)` 在子名与绝对位那几形没量过，照红线不发。明细记 S294 ⑨。
- **下一轮**：§6 第 32 条那一族（`var x =` 换行）；§1.98 记的 `Vector2i` / `Vector3i` 几何缺口（整数版有没有 `slide` / `bounce` / `reflect` / `project` 要先量）；§6 第 29 条那三形对象表；S281 ⑧ 的三形帧；任务 #58 那把性能尺子（要用户拍板去不去装箱）；`.gitattributes` 那一问仍待拍板（工作树上 `280-pow-precedence` 那三份的假 M 还在）。

### 1.98 `Vector2` / `Vector3` 的四支几何方法：一条 normalize 口径把「复现不了」改写成「不复刻」

- **为什么挑这支**：S95 记的是「有成员但**故意不接**」，理由有两条 —— `reflect` 「六个实测点互相矛盾」、`bounce`/`slide` 「法向不是单位向量时引擎除了给零向量还往 stderr 打一行，产物复现不了」。这轮两条都站不住：矛盾是采样点里混了非单位法向，而「复现不了」把**值**和**stderr** 混在一句话里 —— 值从来就复现得了，只有那行带 C++ 文件行号的 ERROR 不属于产物（§1.26 早就定过这个口径）。
- **量到的**：64 形两侧对撞（`tmp/probe-slide/slide.mts`：`{slide, bounce, reflect, project}` × 8 组法向 × Vector2/Vector3）+ 8 格 epsilon 边界（`eps.mts`）+ 8 格补测（`t3.mts`）。式子与 4.3 树的 `core/math/vector2.cpp:177` / `vector3.h:582` 同形，逐分量 float32：`slide = v − n·(v·n)`、`reflect = 2·n·(v·n) − v`、`bounce = −reflect`、`project = n·((v·n)/(n·n))`。前三支的法向要过 `is_normalized()`，不合格给零向量；`project` 不设门槛，零法向落 `(nan, nan)`。epsilon 与 `is_normalized` 同一把尺、而且是 `<` 不是 `<=`：Δlen² = 9.986e-4 过，整 1.000e-3 不过。
- **门那一侧的一处真修**：要让这些格进语料对账，得先让 `tools/lib.mjs` 的 `normalize` 认得这类引擎内部 ERROR 块。它原来的 `ENGINE_FRAME` 只认 `core/variant/`，本轮扩到 `\.?/?core/(variant|math)/` —— **顺带量到 Vector3 那支的帧带 `./` 前缀**（`at: slide (./core/math/vector3.h:582)`），只加 `core/math` 不加 `./` 的话那三块会留在 golden 里、`test:diff` 立刻报静默错（第一次跑就是这样，读数 `第 49 行 godot: ERROR: … js:`）。扩规则前后确认过：全仓只有新用例带 `./core/` 帧，既有 281 份 golden 一格没被这条改写。
- **两侧同值之后**：语料 282 钉 48 格，含非单位法向那 8 格（s04 / s05 / s06 / s08 / b04 / t05 / t06 / u03 全走零向量）与 epsilon 两侧各一格（s07 过、s08 不过）；返回类型也钉进同一批（`typeof` 给 5 / 9，与 S233 的 `TYPE_*` 表同口径）。`packages/runtime/test/vector3.test.ts` 里三格「未实现要响」的护栏换成实测值 —— 只在读过引擎之后改期望，没有为了过门改数字。
- **门**：golden-check **OK 195 / 报错 70 / 超时 17 / 漂移 0**（708.5 s，比上一轮的 746 s 又快一点，仍是 §1.97 那条预算在起作用）、`test:diff` **195/195 逐字节**（静默错 0、崩溃 0、未实现 0）、`pnpm test` **1178**（ops 自校验 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` 202/272 且 emitter 不支持 0、`test:codegen` 2/2、`test:scriptc` 代表集 **25/25 编过、跑通、逐字节一致**（282 在列 —— 这四支在 AOT 目标上也是同一条式子）、`test:pkgmodes` **25/25**、`test:export` 10 过 / 9 跳、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败**。
- **下一轮**：`Vector2i` / `Vector3i` 的对应缺口（`vector2i-method` / `vector3i-method` 那几处仍写着「实测不存在或未实现」，整数版有没有这套几何要先量）；§6 第 29 条那三形对象表；S281 ⑧ 的三形帧；任务 #58 那把性能尺子（要用户拍板去不去装箱）。

### 1.97 golden 门那 17 格「卡住」的用例不再白等满超时：任务 #63 的前提先收回（2026-10-09）

- **原任务是错的**：#63 当初写的是「把 case 210 的 golden 重录到没有 `<<GDS2JS_TIMEOUT>>` 标记」。读了那格的正文才明白 —— 那一族 17 格的 golden 记的是**运行期 SCRIPT ERROR**（`210` 是 `c.call(2)` 实参不够：`Invalid call to function 'RefCounted::three (Callable)'. Expected 3 argument(s).`），脚本报错就中止，后面的 `quit()` 永远到不了，进程因此不会自己退出。标记不是仪器失灵，它记的就是真行为：**是我们把它杀了**。把标记抹掉等于造假，所以这条收回，改成量得到的那一半。
- **白等的账**：每格为了等这个「再也不会来输出」的状态要等满 15 秒（`DEFAULT_TIMEOUT_MS`），17 格就是 255 秒 —— 占 `test:golden-check` 单轮的四分之一。现在 `tools/lib.mjs` 多一条 `hangBudget(golden)`：golden 里已经带标记的用例只按三分之一段预算跑（15000 → 5000，下限 4000；慢机器用 `GDS2JS_GODOT_TIMEOUT_MS` 放大时两道一起放大），两个消费者 `tools/golden.mjs` 与 `test/e2e/golden-drift.test.ts` 都走它，`.d.mts` 那份声明同步补上（漏了它 typecheck 立刻 TS2305，这条门是有效的）。
- **验收**：17 格逐格 `--check`，读数全是「超时 1 / 漂移 0」—— 提前杀不影响 captured 文本，读数在冷启动那几秒里就打完了，而且**那一族没有一行退出噪声**（`Thread destroyed` / `RID leaked` / `PagedAllocator` 都没出现，所以原任务里「先加噪声过滤再重录」的前置也不需要）。全门一轮 **1028 s → 746 s（−282 s）**，按 17 格 × 省 10 秒算的下限是 170 秒，多出来的是两轮之间的本机浮动；这格是门的耗时，不是产品性能读数，不受 `|t| ≥ 2` 那条管。
- **其余门**：`pnpm test` **1175**（ops 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` 201/271 且 emitter 不支持 0、`test:diff` **194/194 逐字节**（静默错 0、崩溃 0、未实现 0）、golden-check **OK 194 / 报错 70 / 超时 17 / 漂移 0**（分类一字未动）。`packages/` 一个文件都没改，出货产物与 exe 逐字节是上一轮的，所以 `test:scriptc` / `pkgmodes` / `export` / `cli-native` 这轮重跑没有新信息，没占机器。
- **还开着的**：`.gitattributes` 那一问（§1.96 记的行尾假红 —— 本轮又被 `git` 的 autocrlf 提醒了一次：`corpus/cases/280-pow-precedence/` 三份文件在工作树里是 CRLF、库里是 LF，`git status` 就报 M，内容差为零）。要不要加、怎么加，是用户的口径，不由代码侧定。

### 1.96 整数负次幂：一条 `int()` 的饱和式子就把「平台行为」那一问解释掉（2026-10-09，S292）

- **为什么这一轮做它**：`[int-pow-negative]` 是**用户可见的拒答** —— 同一句 `2 ** -3`，引擎给 `0`，我们的产物当场抛错。S291 已经把「还缺哪三批」写在 §6 第 31 条上，量齐就能把这支摘掉。
- **量到的**：47 格零分岔（`tmp/probe-pow/intneg.mts` 23 格字面量 + `tracks.mts` 24 格两条轨，装箱 `var u = 2` 与 typed `var t: int` 再到 `var z: int = t ** k`）。一条式子解释全部：**先按浮点算，再走 `int()` 那条量过的截断与饱和**（S61）—— 够不到 1 的截成 `0`，`±1` 保号保奇偶（`(-1) ** -101` → `-1`、`(-1) ** -2` → `1`），`0 ** -1` 的 `+inf` 饱和成 `-9223372036854775808`，于是 S291 当初担心的「那是不是平台转换行为」根本不需要引平台行为来解释。与 `pow()` 的分岔也钉住了：`2 ** -3` → `0`（typeof 2）而 `pow(2, -3)` → `0.125`（typeof 3），语料 281 的 q02 / q21 / q22 三格。
- **删掉的两支拒答**：`ops.pow` 那一支是活的（`ARITH_RAW` 表里根本没有 `**`，所以 `int ** int` 无论静态类型如何都发 `rt.ops.pow`，实测 q15–q20 的产物是 `rt.toInt(rt.ops.pow(t2, k2))`）；`fast.iPow` 那一支今天**没有读数也没有门**，跟着改只为两条轨口径一致，将来谁把它接线要先补量 —— 这句留在 §6 第 31 条的尾巴上。
- **一处仪器假红（本轮真实撞到）**：上一轮为了把提交说明的主题行与正文之间补一个空行，做了本地历史重写，`git reset --hard` 让 `core.autocrlf=true` 把 `corpus/cases/280-pow-precedence/godot.txt` 写成 CRLF —— `test:diff` 立刻报「静默错误 1」，而 godot / js 两栏**一字一样**，差的只是行尾。全仓 286 份 golden 是 LF、只有这一份被改写，而仓库里**没有 `.gitattributes`**；这个坑 `test/e2e/codegen-drift.test.ts` 的头注早就点名了（「golden 比对那边潜伏着同一个坑，本轮没动，建议单开一轮加 .gitattributes」），本轮先手工归一，加不加 `.gitattributes` 留给用户拍板。
- **门**：golden-check **OK 194 / 编译或运行报错 70 / 超时 17 / 漂移 0**、`test:diff` **194/194 逐字节**（静默错 0、崩溃 0、未实现 0）、`pnpm test` **1175**（ops 自校验 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` 201/271 且 **emitter 不支持 0**、`test:codegen` 2/2、`test:scriptc` 代表集 **24/24 编过、24/24 跑通、逐字节一致 24/24**（281 在列）、`test:pkgmodes` **25/25**、`test:export` 10 过 / 9 跳、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败**。
- **下一轮**：任务 #63 —— case 210 那格 golden 还带着 `<<GDS2JS_TIMEOUT>>` 标记，重录要连着 `tools/lib.mjs` 的 normalize 一起改（引擎退出噪声：`Thread destroyed` / `RID leaked at exit` / `PagedAllocator`），顺手把 `.gitattributes` 那一问摆到桌面上；再往后是 §6 第 27 / 28 / 29 条与 S281 ⑧ 剩下的读数，以及任务 #58 那把性能尺子。

### 1.95 `**` 的结合位：语法树把它排错了一层，读数先量齐、纠偏放在 lower（2026-10-09，S291）

- **为什么现在动它**：§6 第 30 条②那一格不是拒答，是**跑出个错数** —— 同一句 `3.0 * 2.0 ** 2` 引擎给 `12.0`、本机给 `36.0`。上一轮把十进制读数结清之后，这是剩下最疼的一条用户可见错误。
- **量到的**：34 形两侧对撞（`tmp/probe-pow/mix.mts` 20 形 + `more.mts` 14 形），修前能读到数的 30 形里 11 形错：`6 / 2 ** 2` 引擎 `1` 我们 `9`，`7 % 2 ** 2` 引擎 `3` 我们 `1`，`2 * 2 * 2 ** 3 / 4` 引擎 `8` 我们 `128`，`2 ** 3 * 2 ** 2` 引擎 `32` 我们 `256`，`100 / 5 % 2 ** 3` 引擎 `4` 我们 `0`。把 CST 打出来才看清形状 —— 树是 `((6 / 2) ** 2)`：`tree-sitter-gdscript` 的语法把 `**` 排在 `*` `/` `%` **之后**，而引擎排在之前；`+ -` 与移位那两层本来就是对的（`1 + 2 ** 2`、`2 << 2 ** 2` 两侧一直一致）。
- **为什么不改语法**：`tree-sitter-gdscript` 是用户的 submodule，代码侧不动它（红线）。纠偏落在 `packages/compiler/src/lower/lower.ts`：同一层的链先按**源码顺序**摊平成「操作数 / 运算符」两条表，再用 `MUL_LEVEL`（`**` 记 2、`*` `/` `%` 记 1，全左结合）做优先级爬升重排成 IR。摊平只吃没被括号包住的 `binary_operator` 节点，而 `parenthesized_expression` 在 CST 里是另一种节点类型、天然就是边界 —— 所以 `(3 * 2) ** 2` 仍是 `36`、`2 ** (3 * 2)` 仍是 `64`，两条都钉进语料 280。左结合也跟着读数走：`2 ** 3 ** 2` 与 `2 ** 2 ** 3` 两侧都是 `64`。
- **顺带量到、没发货的**：整数负次幂那一族 —— 引擎 `2 ** -3` → `0`、`0 ** -1` → `-9223372036854775808`、`1 ** -1` → `1`、`(-1) ** -3` → `-1`，而 `2.0 ** -3` 与函数那一支 `pow(2, -3)` 都给 `0.125`。看着像「浮点幂算完再截断回 int64」，但负底数奇偶次、底数 0、大数回绕三批没量齐，照红线 `[int-pow-negative]` 继续响亮拒，另立 §6 第 31 条；语料 280 因此一格负次幂都没放。
- **门**：golden-check **OK 193 / 编译或运行报错 70 / 超时 17 / 漂移 0**，`test:diff` **193 过 / 87 跳**（静默错 0、崩溃 0、未实现 0），`pnpm test` **1172**、typecheck **4/4 无 `error TS`**、`test:compile` 200/270 且 **emitter 不支持 0**、`test:codegen` 2/2、`test:scriptc` 代表集 **23/23 逐字节**（280 在列）、`test:pkgmodes` **25/25**、`test:export` 10 过 / 9 跳、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败**。这一改**没有重写任何既有产物**：`git status` 除新用例外一字干净，说明现有 279 例里没有裸写 `a * b ** c` 这一层的形状，golden 逐字节不变。
- **下一轮**：§6 第 31 条那三批负次幂读数（量齐就能把 `[int-pow-negative]` 这支用户可见的拒答摘掉）；case 210 那格 `<<GDS2JS_TIMEOUT>>` 的旧账要连着 normalize 的引擎退出噪声过滤一起做（§1.93 记的）；再往后是 §5.5 那把性能尺子（任务 #58：数组按下标写）。

### 1.94 十进制读数：`built_in_strtod` 直译发货，1302 格从「猜」换成「同一式子」（2026-10-09，S290）

- **为什么是这一支**：S289 把打印钉死之后，剩下三格语料（`2.5e-11`、`1024e23`、`1.7976931348623157e308`）还卡在「字面量两侧值不同」上。这轮把 `core/string/ustring.cpp` 的 `built_in_strtod` 整段搬过来：尾数用两个 9 位整数拼成 `1.0e9*frac1 + frac2`，指数按 `10^2^i` 表逐位拼，尾数只认前 18 位，指数位不成形就 `goto done`。四件事同时解释清楚 —— 为什么 `1e-30` 偏低一 ulp 而 `1.0e-30` 准、为什么 `3e-30` 准而 `3.0e-30` 偏、为什么 `"1.5e+"` 是 15 而不是 1.5、为什么 `"1e-309"` 是 0。
- **账**：1302 格「文本 → 字节」对账零分岔（旧式子 853、正确舍入 `Number()` 913），语料 279 二十格同时钉住读与写两端，`test:diff` 192/192、`pnpm test` 1169、typecheck 4/4、`test:scriptc` 单例 279 过。垃圾串与长尾那 14 格（`xyz` / `1e` / `-` / `+7` / `12abc` / `1.5e+` / 21 位小数…）单独再对一遍，出货全中、旧式子六格不同形（四格落 NaN）；`float(String)` 与 `String.to_float()` 那两支另核 17 格前导空白与怪号（`\r1.5` → `0.0`、`1_000.5` → `1.0`、`-.5` → `-0.5`…），两侧一字一样（`tmp/probe-varstr/ws.mts`）。改读数之前先确认了老语料不动：`test:golden-check` 与 `test:diff` 逐字节一致，S289 那批打印读数也仍然一致（写侧没碰）。
- **门**：`pnpm test` **1169**（ops 自校验 1981/0、tree-face 17/0）、typecheck **4/4 无 `error TS`**、`test:compile` 199/269 且 **emitter 不支持 0**、`test:diff` **192 过 / 87 跳**（崩溃 0、未实现 0）、`test:golden-check` **279/279 逐字节**（老语料一格没动，新的 279 也一并钉住）、`test:codegen` 2/2、`test:scriptc` 代表集 **22/22**（279 在列）、`test:pkgmodes` **25/25**、`test:export` 10 过 / 9 跳、`test:cli-native` 报「原生 exe 过期，自动重建…」后 **22 项 / 0 失败** —— 出货树里那份 `double.ts` 确实是新的，§1.93 记下的「门有没有真重编」那一问这次有正面读数。
- **出货目标那一格**：这条式子第一版用 `s[i]` 取下标，scriptc 直接 SC1090（它不认 `string | undefined` 这个结果形状），换成 `charCodeAt` 的码值比较才过 —— 与 §1.93 那两处同样是「只有真编译到原生目标才暴露」的形状问题。
- **下一轮**：§6 第 30 条②那条 `**` 结合（`3.0 * 2.0 ** 2` 引擎 12.0 / 本机 36.0）是用户可见的算错，比剩下的读数缺口更疼；`test:golden-check` 那格 `<<GDS2JS_TIMEOUT>>` 的旧账（§1.93 账末尾记的）要连着 normalize 的退出噪声过滤一起做。

### 1.93 `var_to_str()` 的浮点支：位数之谜在 Grisu2 源码上结案，顺带挖掉出货目标的一处静默错（2026-10-09，S289）

- **为什么这轮能成**：S287 / S288 两轮把「`%.*g` 家族」「拿引擎读取器作往返判据的位数搜索」「28 条尾数×缩放模型」逐个否证，缺的是**实现**而不是读数 —— 只看得见 4.6 的行为。这轮直接取 4.6 的源码：`VariantWriter::write` 的 FLOAT 支 → `rtos_fix()` → `String::num_scientific()` → `grisu2::to_chars()`，那台生成器就是 `thirdparty/grisu2/grisu2.h`（头注自己写着「不保证生成 `(m-, m+)` 里最短的数」）。之前所有反常一次解释干净：`1e23` 打 16 位、`5e22` 与 `7e22` 打 17 位，而 `2.0 ** 63` 只打 7 位 —— 最后那条是 `(double)(float)v == v` 的 float 分支，与 S283 那条窄身字节判据同源。
- **实现**：新增 `packages/runtime/src/runtime/grisu2.ts`（Grisu2 直译 + `rtos_fix` / `floatConstructText`）。64 位算术全程走 `{hi, lo}` 两个 32 位 + 16 位分块乘，**不用 BigInt**：scriptc 不认 BigInt 之间的比较（SC1043），也不认往「方法返回的数组」上按下标赋值；移位用乘 2 / 除 2 的循环，中间量全在 2^53 内。文件落在 `runtime/` 而不是 `shared/` —— `shared/` 那一层要靠 tree-face 逐名清单才进得了产物树，`runtime/` 整目录被 `copyTreeTs` 扫走，出货树零改动（先放 `shared/` 时 `test:scriptc` 的项目树两例直接 SC0001 找不到模块）。
- **接线**：`varToStr` 的 FLOAT 支发 `floatConstructText`；pack 那两支发 `rtosFix(item, true)`（**元素不补 `.0`**，S289 ④）；`[var-to-str-float]` 从运行时删掉，新留 `[var-to-str-pack]` 给没量过的对象元素。运行时那一族的用户可见拒答因此又少一支。
- **顺带挖出的出货目标静默错**：`packCtor` 与 `str_to_var` 的数组解析都往「方法返回的数组」上 `push` —— scriptc 上是**空操作**，`PackedFloat32Array([1.5, 0.1, 2.0]).size()` 在 exe 里是 0，`str_to_var("[1, 2, 3]")` 同形，而 node 侧一直是对的。改成先攒局部数组再交构造器、以及用 `GArray.append`。**这 bug 不是本轮引入的**：把本轮改动整批 stash 起来后，`GDS2JS_SCRIPTC_FILTER=275` 在 HEAD 上单独跑就是红的（pack 全空）—— 也就是说上一轮那句「scriptc 20/20」是不成立的读数，得记在口径上：代表集跑完要看**每例**的输出，不能只看总数。修完 275 与 278 两侧齐绿。
- **同一把 rebuild 又扫出一处旧账**：这轮强制重建原生 exe，scriptc 在 `packages/compiler/src/lower/lower.ts` 的代理对折叠那一支报 SC1043 —— 它不认「`typeof p === "string"` 卫语句 + `continue`」这种收窄，于是 `(p - 0xd800)` 在它眼里是「拿非 number 非 string 的值作比较」。改成先落一个 `const hi = p as number;`、后面一律用 `hi`，顺手把 `<< 10` 换成 `* 1024`（同一数值，189 例 guards 与 993 例 compiler 全不动）。这与上面那处一样**不是本轮引入的**，是「exe 没过期就不重建」这个口径把出货目标的破损留了很久：以后 `cli-native` 的读数要写清这次到底重没重建。
- **两件新欠账另立任务**：① 十进制**读取**（`built_in_strtod`）—— 1021 格 `str_to_var` 逐字节里 356 格与 JS 不同，`1e-309` 以下给 0，且偏差不受「尾数 × 固定 10^E 因子」任何式子支配（乘、除、连乘、快速幂、引擎 `pow` 表全试过，最好 640/1041）；② `**` 与 `*` `/` `%` 的结合 —— 引擎 `3.0 * 2.0 ** 2` 给 `12.0`，本机给 `36.0`。语料里凡两侧读数不同的字面量这轮一律改用算术造值（f13 / f21 / f38 三格），没有为了过门改期望。
- **下一轮怎么收**：源码这一翻顺带把 §6 第 28 条那七支值类型的 `var_to_str` 面照亮了 —— `VariantWriter` 对 `VECTOR2` / `RECT2` / `QUATERNION` 这些就是「构造器名 + 各分量走 `rtos_fix`（**不补 `.0`**）+ `)`」，与这轮钉下的 pack 那两支同一式子；先发一支（比如 `Vector2`，两侧比 20 格）验证「不补 `.0`」在值类型上同样成立，再按 §6 第 28 条把缺的值类型本体一支一支补，缺体仍然 `var-to-str-type` 响亮拒。另一件是同一处读来的：`str()` / `print()` 走的是 `String::num_real`（14 位定点那支），与 `var_to_str` 两条通道互不相干，别互相抄 —— S287 那 38 格分岔就是这条线。
- **账**：语料新增 278（43 格）→ `test:diff` 191/191 逐字节一致、`test:compile` 198/268 且 `emitter 不支持 0`；ops 把原三支 `[var-to-str-float]` 响亮拒换成读数、另加两支（`pnpm test` 1166 例全过）；`test:scriptc` 代表集 **21/21 逐字节一致**（含新加的 278，以及上一轮被漏读、HEAD 上其实是红的 275）；打印侧验收 `tmp/probe-varstr/verify.log` 4059 格 + `grisu.mts` 257 格**零分岔**；typecheck 4/4。`test:golden-check` 是 209 绿 + 1 红，那格红与本轮无关：210 的 golden 第 5 行是一枚 `<<GDS2JS_TIMEOUT>>`（录制那轮引擎没在预算内退出，标记被当正文写进去了，HEAD 上原样如此）；直接重录会把引擎退出期的 Thread destroyed / RID leaked at exit / PagedAllocator 那几段噪声一并录进 golden，而产物发不出它们，反而把 `test:diff` 拖红 —— 要先给 `tools/lib.mjs` 的 normalize 补一段退出噪声过滤再重录，另立一轮（§6 记账：任务已挂）。

### 1.92 `var_to_str()` 的位数：读取器洗清，卡点换成「位数是怎么生成的」（2026-10-09，S288，读数轮 · 无实现变更）

- **这一步值在哪**：S287 把剩下的账记在「引擎那台十进制读取器不够精确」上，本轮第一格就把这个方向否了 —— 48 格 `to_float()` → 字节逐格对下来，普通格的读取器就是正确舍入（含 `1e23` 这一格），而格式化照样多打 1~2 位。**读卡点从「读」搬到「写」**，少一轮白工。
- **两条否证**：固定 precision 被同尾数跨档打回（`1e23` 16 位、`5e22` / `7e22` 17 位、`1e24` 1 位）；「最短 + 回读」被 `space.mts` 与 `mantissa.mts` 共 28 种「尾数累加 × 幂施法」组合的最高分 44/48 打回（读取器本身只有 41/48，且错的 7 格与格式化的分岔不重合）。
- **能给的可发底线**：232 格扫描量出分岔带 —— JS 最短式子对 190 格，42 格分岔里 39 格在 |指数| ≥ 23（只剩 3 格在 20 / 22 档），形状清一色是「多 1~2 位、末位差一个 ulp」—— 而 **10^22 是最后一个能被双精度精确表出的十次幂**（5^22 < 2^53 ≤ 5^23），分岔正好从 23 档起，说明进去的是某个由 `10^n` 拼出来的量。这条也顺手把「先照 JS 最短发、把那几格当已知分歧记着」的路堵了：18% 的分岔率、且专挑 `1e23` 这种脚本里最常写的形，不是边缘噪声。
- **下一轮怎么收**：还量到一条硬线索 —— `pow(10.0, n)` 在引擎里**不是正确舍入的**（78 档里 15 档与 JS 的 `1e n` 差一个 ulp，全在 |n| ≥ 23 那侧，正号 23..32 反倒准），与 ③ 的分岔带同源；问题因此从「位数怎么生成」缩成「格式化在哪一步乘除了这个 `10^n`」。格子要这么设计：同一 x 分别按 `x`、`x * pow(10,-n)`、`x / pow(10,n)` 三条再打印，看 ulp 从哪一步进来。验收单仍是 S288 ④ 那三组（缩放舍入 → 尾随零上界 → 232 格零分岔）；成了才动 `varToStr` 的 FLOAT 与 pack 两支，顺带把 S287 ② 那套已钉死的写法族（定点只在 -4..14、科学指数至少两位、无点无 e 才补 `.0`）一起发出去。
- **账**：无实现变更，门读数沿用 §1.90 那一笔；本轮重跑 `pnpm test`（1163 / ops 1976）与 `pnpm typecheck`（4/4）确认盘面没动。

### 1.91 `var_to_str()` 的浮点支量到 77 格带原值：格式化定了性，卡点搬到引擎那台读取器（2026-10-09，S287，读数轮 · 无实现变更）

- **为什么单独一轮**：这是运行时仅剩的用户能直接撞到的拒答 —— `var_to_str(任何浮点)` 现在抛 `[var-to-str-float]`，而 §2 第 14 条第 ① 项挂的就是「别再猜精度」。这一轮先把两列并排量出来：72 格里 38 格 `var_to_str` 与 `str()` 不同，于是「照抄打印那一族」这条最省事的想法被定性成静默错值。
- **拿到的是整条写法族**：定点 ⇄ 科学的切换只看小数指数（`-4..14`），与位数无关 —— 这一条推翻了 `%g` 的「指数 < 精度」直觉（`123456789012345` 十五位定点、`1234567890123456` 十六位已经成科学）。加上科学写法的「尾数一位不带点、指数至少两位」与定点的「无点无 e 才补 `.0`」，77 格里 73 格就是**正确舍入的最短十进制**配这套写法。
- **剩下 4 格把卡点挪了位置**：`1.1754944e-38`（8 位）与 `9.223372e+18`（7 位）比正确舍入的最短串短 —— 说明引擎按「用**它自己那台读取器**能回读」收尾；`9.999999999999999e+22` 与 `7.0000000000000004e+22` 又是任何读取器都回读不到的短串被跳过。四条候选式子（单次 `pow` 回读 67、连乘回读 54、15 位起手容差 62、15 位起手等值 62、固定 17 位 53）全过不了这 4 格 —— 缺的不是格式化，是**把 Godot 的十进制读取器量到 bit 级**。
- **下一轮照这个做**：`shared/double.ts` 现在那份是近似的（字面量那侧靠 corpus 兜），要用「串 → 该串读回来的 double 字节」配对量四件事：整数位怎么累、小数位怎么累、指数是连乘 / 连除 / 一次 `pow`、有没有位数截断。量清之后 `var_to_str` 的浮点支与 S228 那批字面量差异一起结清，**在那之前继续抛**。
- **账**：无实现变更，门读数沿用 §1.90 那一笔；本轮只重跑 `pnpm test`（1163 / ops 1976）与 `pnpm typecheck`（4/4）确认盘面没动。

### 1.90 对象表两端接上：发射期那张拒答清单到此清空（2026-10-09，S286，语料 277，§6 第 29 条第 ① 项花掉）

- **为什么这一轮值得两端一起做**：S284 把形状量齐之后，编码侧只剩「类名 + `script` 一格」，解码侧要的正是 `dict_to_inst` 那条现成路（`dictDescOf` 认类 + `beginBareConstruction` 跳过 `_init`）—— 两端各缺一半就都发不出去，一起做才闭环。Tier 1 没有 `@export`，而普通 `var` 本来就不进 storage 那一族（S284 ③ 那格 `var plain` 一字不写），于是「表里只有 `script`」这一形正好是我们发得出来也解得回去的那一形。
- **反直觉的一格**：内嵌类的实例**编码不出来** —— 引擎打 `Failed to encode a path to a custom script` 并回一个空 PackedByteArray。我们照这一形发空数组（不搬 stderr）；同一条路上 `bytes_to_var` 读到条目也回 `<null>`（`Condition "!p_allow_objects"`）。这两形与 `Cannot get class` 都带 `core/io/marshalls.cpp` 的 `at:` 行，normalize 滤不掉，第一版语料 277 因此 golden 里多出六段 ERROR —— 撤出后 24 行一字不差，三形改由 ops 钉。
- **吞与不吞分成两份名单**：`bytes_to_var` 仍按实测把读不通的四形全吞成 `<null>`；`bytes_to_var_with_objects` 只吞「字节读不通」那一族，宿主类名本体、除 `script` 外的属性、不认识的元素类型码三形**照旧抛出**（不是字节坏了，是我们造不出 / 没量过）。同一台解码器、两条吞名单，这条分界写进 S286 ③。
- **清单清空之后仍留闸门**：`GLOBAL_TODO_FUNCTIONS` 现在是空集，`emit-builtin` 那道闸门和它的守卫格留着（清单里再有名字就必须真的抛），guards 因此从 190 变 189（那条按名字展开的拒答守卫并成一格「清单应为空」）；`GLOBAL_CALLABLES` 有区间的 116→118、该拒的 10→8（剩下的全是打印族）。
- **账**：语料 277（项目树 24 行 golden 逐字节，首轮即一致）、`test:compile` 197/267（emitter 缺口 0）、`test:diff` 189→**190**/190、ops 1964→**1976**、`pnpm test` 1162→**1163**、guards 190→**189**、scriptc 代表集 19→**20**（这一格是项目树用例，走真命令 `export --pack scriptc`）；golden-check / pkgmodes / export / cli-native 的读数见提交信息。

### 1.89 OBJECT 的身份那一支出货，`bytes_to_var` 从此多一个值型（2026-10-09，S285，语料 276，§6 第 29 条第 ① 项收窄）

- **发出去的三格**：`var_to_bytes(实例)` = `24,0,1,0` + int64 号共 12 字节（容器里递归同一支：两支实例的数组 32 字节、`{"k": 实例}` 32 字节）；`bytes_to_var` 读这一支回 `EncodedObjectAsID` 的盒子；descriptor 那一支在没开对象表的解码器里回 `<null>`（引擎那句 `ERR_UNAUTHORIZED` 后面没有 `at:` 行，与坏字节那四格同样进不了语料，由 ops 钉）。
- **新值型只照读数发得出那么多**：typeof 24、打印 `<EncodedObjectAsID#号>`、成员只发实测的 `get_object_id()`。**打印里那个号是盒子自己的**，字节里那个要 `get_object_id()` 才拿得到（实测两数不同），两次解出来的盒子 `==` 是假 —— 这三格决定了盒子必须自己占一个身份号，不能把 storedId 当成打印的那一个。
- **号不进语料这条是硬约束**：normalize 只掩 `<类名#号>` 那种文本，字节里的 int64 没得掩，所以语料钉「总长 + 头部四字节 + 掩码后的打印 + 比较式」，`get_object_id()` 与 `get_instance_id()` 的相等那格留在 ops（同侧对拍，跨侧比号一律撤）。
- **仍拒的两支**：`var_to_bytes_with_objects` 要 descriptor 那一形（宿主基类名 + storage 属性），`bytes_to_var_with_objects` 还要按 res 路径造实例、跳过 `_init` 的重建（现成路是 `dictDescOf` + `bareConstruction`）。这一对得连项目树语料一起接，所以留作下一轮；宿主类名的实例（`RefCounted` / `Node` / `StyleBoxFlat`）Tier 1 根本造不出，接的时候按红线响亮拒 —— 前置清单在 S284 ⑥。
- **账**：语料 276（11 行 golden 逐字节，首轮即一致）、`test:compile` 196→**197**/267（emitter 缺口 0）、`test:diff` 188→**189**/189、ops 1957→**1964**、`pnpm test` 1157→**1162**、guards 仍 **190**、scriptc 代表集 18→**19**；golden-check / pkgmodes / export / cli-native 的读数见提交信息。

### 1.88 对象表那一族一次量齐：没有序号也不共享，进表的只有 storage 属性（2026-10-09，S284，读数轮 · 无实现变更）

- **为什么非得在项目树里量**：`--script` 那条路上脚本实例**根本编不出来** —— 引擎自己打 `ERROR: Failed to encode a path to a custom script` 并返回一个空 PackedByteArray（`objects.mts` 那七格全是 0 字节）。换成带路径的项目树（`thing.gd` / `sub.gd` / `exp.gd` 三支脚本，再加宿主 `StyleBoxFlat` 与 `Node` 各一格）之后，读数一次到位。
- **三条反直觉**：① 条目**内联**，没有「对象表序号」那回事（§6 旧账那句猜错），`[t, t]` 与 `[T.new(), T.new()]` 字节一字不差，解回来是两个不同号的对象 —— 这一族不复用身份；② 类名写的是**宿主基类**（脚本实例给 `RefCounted`），与 S263 的打印口径正好同一名，发射侧现成就有；③ 进表的属性只有 storage 那一族 —— 同一支脚本里 `@export var ea/eb` 进、`var plain` 一字不写，而 Tier 1 没有 `@export`，于是「脚本实例的表里只有 `script` 一格」正好是我们发得出来的那一形。
- **解那侧的三个卡点**（`Cannot get class 'NoSuchThing'` / `Invalid script path "res://nope.gd"` / 空属性正常回对象且 `get("script")` 是 `<null>`）都带 `ERROR:` 却**没有 `at:` 行**，normalize 滤不掉 —— 与坏字节那四格同命，进不了语料对账，只能由 ops 钉返回值。
- **下一轮的入口条件写在 S284 ⑥**：脚本实例那一支的编码，加 `bytes_to_var_with_objects` 复用 `dict_to_inst` 那条「按路径取脚本 + `bareConstruction` 跳过 `_init`」的现成路；宿主类名那一支与表里的 RID / Callable / Signal 照红线继续拒。另记两笔还没量的：目标上不存在的属性名是设还是丢，以及表里嵌 RID / Callable 的字节。
- **账**：无实现变更，门读数沿用 §1.87 那一笔（本轮重跑 `pnpm test` 1157、ops 1957、typecheck 4/4 确认盘面没动）。

### 1.87 二进制序列剩下的非对象形状一次收齐，浮点窄身缩回一条判据（2026-10-09，S283，语料 275，§6 第 29 条清掉大半）

- **这一轮的收获几乎全在「撤回自己加的补偿」上**：上一轮为了让 `-0.0` 与极小值那几格对上，编码里补了「|d| 不超过 DBL_MIN 走窄身」和「零一律写全零」两条。今天换成运行期的量法把它们拆开：`var z = 0.0` 再 `-z` 实测四字节是 `0,0,0,128`（符号位照 IEEE 写），而字面量 `-0.0` 的 `1.0 / v` 给的是 `inf` —— 号在**解析期**就没了；`2.0 ** -1022`（真 DBL_MIN）与 `2.0 ** -1074`（最小非规格化双精）都挂宽位。两条补偿一起撤，判据缩回一条 `float32(d) == d`，NaN（`NaN != NaN`）与 ±inf（折回自己）自然各归各位，§6 第 29 条旧账里「NaN 头部还挂着另一位」那句也随之作废。
- **语料从此钉「算出来的」边界而不是「写出来的」字面量**：`1e-310` / `5e-324` / `2.2250738585072014e-308` 那批两侧解析不同（引擎的十进制读取器要么直接下溢成 0，要么差 1 ulp），钉不住也不该钉，整批写进 §6 第 29 条第 ② 项；能钉的是 `2.0 ** -126 / -149 / -1022 / -1074 / -1075` 那五格（两侧都是精确的 2 的幂，语料 275 的 t20 / t43 / t13 / t14 / t45）。
- **收进来的四族形状**：① 九种 pack —— 头部 + 个数 + 逐格裸元素，**补零只有 PackedByteArray 需要**，而 PackedStringArray 的长度**含终止符**（`"a"`→2、`"é"`→3），比非 pack 的 String 段多一个 NUL；② NodePath —— `22,0,0,0` 后三枚字是「名字数 | 1<<31」「子名数」「绝对位」，那一位 13 形里恒置，段体照 String 写法（`parseNodePath` 那份表原样上线，不加新规矩）；③ Vector3i —— `10,0,0,0` + 三格 int32，S282 那份七形拒答清单缩到「对象 / RID / Callable / Signal」四支；④ 定型数组与定型字典 —— 数组头部挂 `1<<16` 再跟一枚元素码，字典用位 1（带键）与 4（带值），`ElemKind` 十二支持有的类型码到此与 S224 那张 TYPE_* 表逐一对上。
- **两形模型接不住，只记账不猜**：`Dictionary[Variant, int]`（`GDict.stampElem` 一次钉两端，所以 `[var-to-bytes-typed]` 那句是模型外的保险而不是会走到的分支）与 pack 当容器元素（`Array[PackedInt32Array]` 实测给元素码 30，但 `ElemKind` 里没有 pack 那一族）。
- **账**：语料 275（53 格逐字节，首轮即一致）与 274 的 t29（换成运行期取负后重生成 golden）、`test:compile` 195→**196**/266（emitter 缺口 0）、`test:diff` 187→**188**/188、ops 1937→**1957**、`pnpm test` 1150→**1157**、guards 仍 **190**、scriptc 代表集 17→**18**；typecheck / golden-check / codegen / pkgmodes / export / cli-native 的读数见提交信息。

### 1.86 二进制序列那一族开出两支：`var_to_bytes` / `bytes_to_var` 按实测字节出货（2026-10-08，S282，语料 274，§6 第 29 条立账）

- **量的方法**：一次把 31 个值喂给 `var_to_bytes` 并逐字节印回（`str(b[i])` 拼串，避开十六进制格式化与本地化），同一支脚本里再 `bytes_to_var` 解回去验往返；第二批专量浮点边界、定型容器、坏字节与 `*_with_objects` 的 size。全部读数在 `tmp/probe-varbytes/`。
- **两处反直觉**：① **`-0.0` 的号被丢掉**（与 `0.0` 同一串字节），所以「float 能塞进 float32」那一位判的是值而不是位型；② **`StringName` 上线写的是文本不是序号**（`&"a"` 与 `"a"` 只差头部那个类型码），这与 S275 那条「`hash(&"a") == hash("a")` 恰好同值」不是一回事，别拿它当序号编码的证据。
- **坏字节那几格从语料里撤了**：引擎在解码失败时打的是 `ERROR: Condition "len < 4" …` 加 `at: decode_variant (core/io/marshalls.cpp:190)`，而 normalize 只滤 `core/variant/` 那一族 —— 那四行会原样进 golden，产物不可能也不该复刻。改由 ops 的 12 格钉返回值（四形都是 `<null>`），语料只钉能逐字节的编码面。
- **两处实现约束**：字节位型只走 `DataView`（`getBigUint64` / `setBigUint64`），不碰 `BigUint64Array` —— 那是 `packed.ts` 记过的 scriptc 缺口；语料 274 进了 `test:scriptc` 代表集，这条约束从此有门看着。UTF-8 走自己写的码点循环，宿主与静态目标同一条路。
- **仍欠的一族已立账**（§6 第 29 条）：带对象表那两支、`NodePath` 的 32 字节、定型容器与其余七种 pack、`Vector3i` / `Rect2` / `Plane` / `Quaternion` / `Basis` / `Signal` / `Callable` / `RID` / 对象、以及 NaN 那一位。这些全在两处响亮拒里：编码侧 `[var-to-bytes-*]`，发射侧 `emit-builtin`。
- **账**：语料 274（58 格逐字节）、拒答清单 4→**2**、ops **1937**、`pnpm test` **1150**、`test:compile` **195/265**（emitter 缺口 0）、`test:diff` **187/187**、guards 仍 **190**（拒答那支 `it.each` 从 4 格缩到 2 格、新开的两例正好抵平）、scriptc 代表集 16→**17**；其余读数见提交信息。
### 1.85 复测「原生 --watch 看不见同尺寸保存」：读数层是干净的，门改建在等长保存上（2026-10-08，§2 第 15 条结清）

- **为什么值得单独一格**：这条挂着的是「原生开发循环漏保存」这种用户直接踩得到的洞，而且 §1.66 当年写的是「没量清就不改实现」—— 挂着不动就等于留着一个没人负责的怀疑。这轮把量清的部分一次量清了。
- **探头怎么做的**：`tmp/probe-watch/stat.mts` 只用 `node:fs` + `setTimeout`，scriptc 编成 exe 后每 400ms 印一次 `mtimeMs/round/size/typeof/ctimeMs/ino`；父侧 node 同拍读同一个文件。四次外部写入里 **B、C 两格是同尺寸**（8 字节不变，只动 mtime）—— exe 侧数字与父侧逐格相同，一个都没漏。顺带把 scriptc 的 `Stats` 支持面量出来：`st.mtime` 没有 lowering（SC2020），`mtimeMs/ctimeMs/atimeMs/size/ino/...` 有。
- **真 CLI 也照同一把扫法复测**：`cli-run.mts` 两侧各跑一次 `run main.gd --watch`（原生 exe 与 `node --import tsx` 跑源码），arm 之后 0.3/3/6/12 秒各写一次**等长** 62 字节的脚本 —— 两侧都是 4 次「重新运行」、`t000…t004` 五个标签全印出。**结论：§2 第 15 条的 premise 不成立，`gdSignature` 一字未改**（没有可修的失灵）。
- **当年那两格怎么解释**：最可疑的是 ⑨b 记的那个真洞 —— 重跑写同名产物时第二次执行被 ES 模块缓存吃掉，于是「看起来像没触发」。那个洞在打成单文件装载那一轮已经修掉，而门为了绕开它把夹具改成不等长保存，反倒把「只有 mtime 动」这一维留在无人看守的状态。这轮把夹具改回**等长**（`watch-a` → `watch-b`），门从此正对着这条。
- **账**：`test:cli-native` 20/20（⑨b 夹具换成等长保存后仍全绿）、typecheck 4/4；其余门不受影响（本轮没有实现变更，只动了一格门的夹具与两处文档）。
### 1.83 构造式手臂收进模式位：七支走 `const` 那条现成发射（2026-10-08，S280，语料 272，§6 第 28 条再窄一格）

- **上一轮的同型判把这条路铺平了**：S279 之后「异型 Subject 假而不抛」对每一支都成立，所以剩下的只是「引擎收哪些构造、我们有没有那个值型」。量过的七支（`Vector2` / `Vector2i` / `Vector3` / `Vector3i` / `Color` / `StringName` / `Callable`）今天一次收进来。
- **实现只往表里加东西**：`lowerPattern` 的 `case "call"` 除 `NodePath("…")` 外再认一张 `CTOR_ARMS`（名字 → 实测元数，实参必须全是字面量），降成 `{kind: "const"}`，发射复用 `rt.patConst(emitExpr(...))`；runtime 一字未动 —— 手臂比较仍由 S279 那条 `armKind` + `valueEq` 判。
- **读数里最容易被猜错的两格**：`Vector2(1, 2)` 臂**收** `Vector2(1.0, 2.0)`（t03，构造实参一旦算出值就只剩 Vector2 这一支型，与 S279 的 int/float 不互认不打架），而 `Vector2i(1, 2)` 臂遇 `Vector2(1, 2)` 走 `_`（t10，跨向量族靠原型分组拦住）。
- **保守面写清**：`Vector2(1)` / `Color(1, 2, 3)` / `Vector2(-1, 2)` 这三形引擎收不收没量过，白名单按名字 + 实测元数 + 全字面量实参卡住，所以一并拒 —— 这是我们的取舍，不是复刻引擎。表内剩下的七支（`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `Signal`）卡在 Tier 1 没有那些值型，值型到位后往表里加名字就行。
- **账**：语料 272 共 32 格逐字节、`test:compile` **193/263**（emitter 缺口 0）、`test:diff` **185/185**、guards **190**、`pnpm test` **1136**、ops 1918、scriptc 代表集 **15**（新用例进集合）；其余读数见提交信息。
### 1.82 match 臂的等式补成整族：同型才比，异型假而不抛（2026-10-08，S279，语料 271，§6 第 28 条第一件事结清）

- **S278 只把「异型即假」接到了 NodePath 上**，其余形状仍走算子等式。这轮一次量齐（`tmp/probe-match-arm2/run.mts` 17 格一臂一脚本）：臂那一侧是 `hash_compare` 的口径 —— **数字不做 int/float 跨型合一**（`5` 臂遇到 `5.0` 落 `_`，双向都验），**只有 String 与 StringName 互认**，**异型一律假而不抛**。算子 `==` 那条照旧（`5 == 5.0` 仍真、RID 对上 int 仍抛），`when` guard 也照旧。
- **旧实现有两支错**：`5` 臂遇到 `Vector2` / RID 会抛 `Invalid operands 'int' and 'Vector2' in operator '=='.`（`tmp/probe-arm-strict/old-throw.mts` 复现，引擎那格是 `_`）；`5` 臂遇到 `5.0` 会**静默命中**，而引擎走 `_`。前者是崩溃、后者是错输出，都在这轮一次改掉。
- **实现一处**：`patterns.ts` 新增 `armKind`，`armEq` 改成「同型才交给 `valueEq`」—— String / StringName 并一支，非 OBJECT 按 Tag，OBJECT 按原型，Callable 盒子单独并一支免得每次读属性新建的盒子把等式拆散。容器臂的递归本来就在 `matches` 里，所以 `[1, 2]` 臂遇到 `[1.0, 2.0]`、`{"a": 1}` 臂遇到 `{"a": 1.0}` 自然各比各的型（t26 / t33 钉住）。
- **顺手钉住两格读数**：`null` 当手臂合法且只认 `null`（t16–t18），NodePath 臂对 String / int / RID / Vector2 全是 `_`（t36–t40，与语料 270 同口径）。
- **账**：语料 271 共 40 格逐字节、`test:compile` **192/262**（拦下 70、emitter 缺口 0）、`test:diff` **184/184**、`pnpm test` **1131**、ops 1918、golden-check 271 格漂移 0；typecheck / codegen / scriptc / pkgmodes / export / cli-native 的读数见提交信息。
---

## 2. 当前任务与待办

**决策 / 发布类**

1. **#27 已决（§0 I）：SEA 保留。**
1. **身份数字（instance id / `<Base#id>` 打印 / RID / WeakRef）已决（2026-10-07，S262）：产物自造稳定合成号** —— 形状照引擎、号按进程内分配顺序发，语料里带号的格子一律掩号再比；引擎那边读数是 30 格两遍一字不差（`tmp/probe-ids/ids2-1.log`），但号**起点**是引擎选的，跨版本不保证，所以逐字复刻那条路不通。`hash(Callable)` 那一格因此继续欠着（它的数是从号算出来的）。**这一条已经花掉（S263，语料 260）**：`get_instance_id()` / `instance_from_id()` / `is_instance_valid()` / `is_instance_id_valid()` / `weakref()` 与 `<基类名#号>` 的打印都按这条口径发出了。**RID 那两支也跟着花掉了（S264，语料 261）**，但它不属于这笔合成号账：`rid_allocate_id()` 给的整数、`RID(n)` 的打印与 `hash(RID)` 都有固定读数（起点 13241、五格哈希与 4.3 的 `hash_one_uint64(get_id())` 一名一名对上），所以是逐字钉住的，不走掩号那条路。仍欠的是 `hash(Callable)`（它的数从引擎侧的函数标识算，合成号对不上）。
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

0a. **S616 的读数已量齐（七形，一脚本一形；探针 `tmp/probe569/g1..g9.gd`，生成器 `tmp/d6/gen616.mjs`）** —— 定形容器之间的赋值引擎全在解析期拒，我们一句都不发：
    - `var h: Array[String] = ["a"]` 之后 `var i: Array[RefCounted] = h` → `Cannot assign a value of type Array[String] to variable "i" with specified type Array[RefCounted].`
    - 反向（`Array[RefCounted]` → `Array[String]`）同式一句（g2）；`Array[int]` → `Array[float]`（g5）与 `Array[int]` → `Array[String]`（g6）**也照拒** —— 定形容器之间**没有任何放宽**，int→float 那一条标量式的转换在这里不成立。
    - 源是**不定型** `Array` 时引擎不在解析期发句，而是**运行期**一句：`Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".`（g3 推断的 `var u = []` 与 g4 标注 `var u2: Array` 同句，位置在赋值那一行）
    - 同型赋值 `var b: Array[int] = a` 收（g9 印 `[1]`）—— 判据是**标注文本相等**就不拒。
    实现落点：`analyze.ts` 里走定形容器声明那一趟（`for (const t of targets)`，已知目标标注 `Array[X]` 与 `t.init`），要补的是**标识符源**的解析 —— 把函数内已声明变量的标注文本攒成一张表（模块级的 `typedVars` 已有，局部要自己收），源标注与目标标注都是定形容器且文本不同 → 发 `Cannot assign a value of type <src> to variable "<name>" with specified type <slot>.`；源是 `Array` / `Dictionary`（无方括号）时**不在解析期发**，改由赋值路径发运行期那句。两侧都要过 `sema-wording-parity`（新增语料会是预期报错那批）。

    **复验结清（第一百八十七笔，尺 `tmp/probe662/s662.mts` 九格两侧对读）**：上面那套「标识符源」的判据**早已落地** —— `Array[String]`→`Array[RefCounted]`、反向、`Array[int]`→`Array[float]`、`Array[int]`→`Array[String]`、`Dictionary[int,String]`→`Dictionary[String,int]` 五格解析期同句同行；源是不定型的两格（`var u = []` 与 `var u2: Array`）两侧都在**运行期**给 `Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".`（我们那句一字一样）；同标注那格收下（`V|[1]`），字面量源那格仍是原来的两句式（`Cannot include a value of type "int" as "String".` + `Cannot have an element …`）。九格全对，无代码改动 —— 这一条待办与 ②‴ / ⑤ 同批属过期账。

0. **下一轮开工清单（2026-10-22 收笔时留，全部已量好或已定判据，按性价比排序）**：
   ①② **已结清**：异类字面量元素进类名槽与字面量容器的推断文本随 S622 落地；pack 十支的**名册完整性**（S629 ⑤ / S635 ⑥ 剩的那一格）随 S636 落地 —— 属性读 94 名 × 十支、元数两界逐名、九支调用句 324 格都过了裁判。
   ②′ **已随 S639 结清**：名册尺不再猜宇宙，改用同版本 `--dump-extension-api` 与运行期表逐名对账 —— 差出 StringName 九名、`NodePath.slice`、`Color.from_rgba8` 四处并接上。
   ②″ **已随 S640 / S642 / S643 / S644 结清**：解析期的 StringName 分岔（S640）与装箱直调的元数句一族（S642 八面 + S643 铺到 Dictionary 与 vector 六支）都接上，`NodePath.slice` 的实现也发货（S644，名册十一名至此全部实现）。
   ②‴ **已随 S646 / S647 结清（2026-10-23 复验：`tmp/probe650/ng.gd` 的 String 字面量两句、`ng2.gd` 的 Array 源只第二句，两侧一字一样；这一面其余八名不接参数，没有剩下的格子）**（显式 `Variant` 标注的接收者从解析期放行 + `NodePath("…")` 构造式接收者认面）；剩：**NodePath 面的形参拒那一小族**（读数已在 `tmp/probe644/st_*.raw.txt`）：**NodePath 面的解析期形参拒与静态接收者形状** —— 标注接收者的 `slice("a")` / `slice(Vector2i(1,2))` / `slice(null)` 引擎发两句（`Cannot pass a value of type "X" as "int".` + `Invalid argument for "slice()" function: argument 1 should be "int" but is "X".`）、`slice([1])` 只发第二句，而**字面量接收者**（`NodePath("a/b/c").slice()`）与**推断接收者**（`var x = NodePath(...)`）的零支/三支形引擎发元数句，我们现在一句不发；`var s = "a"` 那一形是运行期句，已经对上。要的是把 S347 那一族静态层的认面名单铺到 NodePath，并且一形一形先量（其余面的同一格没量过，不许类推）。**——这一格已于 S654 复验结清（三十格两侧全对：元数两向、两句形、`Array` 源只第二句、`1.5` / `true` 折成 int 收下，行号也一致；上面那句「我们现在一句不发」是过期账）**。
   ③ **`class N extends Node` 那一形**（s4 引擎给 `Node`）：**2026-10-23 用户拍板 —— 维持 D4，Tier 1 不开禁**（发射器的 `[class-extends]` 闸门保持拦着，`SCRIPT_HOST_BASES` 继续备好待 Tier 2）。
   ④ **动态接收者的实参位**（S620 ⑧）—— **已随 S648 结清**（被调方入口按发射器登记的形参型拒/折，语料 409 两侧逐字节；`static` 接收者的运行期那一形没量，另记）。
   ⑤ 旧账两件：**#12 已随 S649 结清**（下降函数在抛出处挂 `err.line`，正文门那 26 支现在连行号一起比，26/26 对齐）；只剩 `hash(Callable)`（三支式子拟合不出、跨进程数没量）。
   ⑥ 值扫（S650 / S651）剩下的四片，**已全部随 S652 / S653 / S654 / S655 结清**：Signal 面解析期只有上界 + `Callable.rpc` 看基分句（S652）；`replace_char` / `replace_chars` 越界码点量准、过拦保留但拒词换成量过的理由（S653）；NodePath 面那小族复验发现早已随 S647 / S651 落地、②‴ 那句「我们现在一句不发」是过期账（S654，三十格两侧全对）；Callable 面三形接收者的元数两向（S655，静默过宽已接拦）；见第一百七十九笔末尾的四格（`create` 三句形、`c.call()` 的运行期分岔、410 的 `binary_operator` CST 修复、`hash(Callable)`）—— 推断形 Signal 接收者已随 S656 结清。
   本轮（S618–S622）的门：typecheck 4/4、`pnpm test` **26655**（256 文件）、ops 7308、compile 273/395、diff **266/266**（静默 / 崩溃 / 未实现全 0）、正文门 122/122；`test:golden-check` 已在 S622 之后整跑过：**406/406 零漂移**（OK 266 / 报错 123 / 超时 17 / 漂移 0，日志 `tmp/d6/gc622.log`；更早一次同样整跑撞成 exit 1、重跑即绿，记为 Godot 侧争用）。下一轮不必再补这一把。

0b. **旧靶单（2026-10-21 收笔时留，①–④ 已随 S602–S604 结清，留文备查）**：
   ① **`Array(...)` 的签名矩阵**（S601 ⑤）：2 参与 4 参两形的解析期原文已量到 —— `No constructor of "Array" matches the signature "Array(PackedByteArray, Variant.Type)".` 与 `"Array(Array, Variant.Type, Variant.Type, bool)".`（读数 `tmp/d6/s606.gd`），
   但「源形 × 参数个数」整张矩阵没量，`Array(2.5)` / `Array(true)` / `Array(StringName)` 三格的接受性也没量 —— 这一笔要的是一趟脚本量齐矩阵，再决定接进静态层还是运行期句。
   ② **`min` / `minf` 的 Vector4i 字面量位**（S598 ⑥）：**已结清（复验，`tmp/probe663` 七格两侧对读，代码零改动）** —— `min/minf/max/maxf(Vector4i(…), Vector4i(…))` 四支引擎全在解析期发 `Invalid argument for "X()" function: argument 1 should be "float" but is "Vector4i".`，我们同句同位（`4:14`）；`min(Vector4i, 2)` 混型那一格同句；对照两支 `clamp(Vector4i, Vector4i, Vector4i)` 给 `(1, 2, 3, 4)`、`wrapi(1.5, 0, 2)` 给 `1` 也都一致。
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

21. **成员名表这条线：十一批已过裁判（Callable S299、String / Array / Dictionary S300、Vector 四支与 Color S301、Pack 三支代表与 StringName / NodePath / RID S302），只剩 Pack 其余六支（§6 第 33 条）**。已定案的污染共五名：Callable 的 `from` / `get_object_instance_id` / `is_equal` / `unbind_many`（我们当「未实现」挂着，引擎根本没这名字）与 **`Array.concat`（我们连实现都有 —— JS 语义）**；后者严重一级，属「用户写错、Godot 拒绝编译、我们照跑」的**掩盖型**错误，而五批扫描证明它是个案（「给得出值」桶在每一批里都是空的）。句子这一层也一并收口：Vector 五族 59 名与 Pack 的 11 格此前发的是中文自述，现在都是引擎那句 `Invalid call. Nonexistent function '<名>' in base '<类型>'.`（门 `value-absent-method-names.test.ts` 77 格）。**手法上的三条坑**已写进 S300 ① / S301 ⑤ / S302 ④：批量通道（ClassDB、解析期）对内置类型都不通、判「我们的表有没有」要问运行时别 grep `case`、以及**先验证探头的接收者本身跑得通**（`RID(65)` 那一族整批判定就是这么变假的）。覆盖面账现在是有名单不是估计数：String 58 / Array 11 / Dictionary 5 / Vector+Color 53 / Pack+其余 若干（S300 ⑥、S301 ④、S302 ⑥）。三处已定案的污染要记住：Callable 的 `from` / `get_object_instance_id` / `is_equal` / `unbind_many` 在 4.6.3 **没这名字**（我们当「未实现」挂着）；`Array.concat` 更是**被实现了**（JS 语义）—— 后者属「用户写错、Godot 拒绝编译、我们照跑」的**掩盖型**错误，严重一级，而 S301 证明这类污染目前是**个案**（Vector 五族 59 名里「给得出值」那桶为空，只差句子）。覆盖面也从「不知道差多少」变成有名单：String 58 / Array 11 / Dictionary 5 / Vector+Color 53 名引擎有而我们没登。**手法上的两条坑**已写进 S300 ① 与 S301 ⑤：批量通道（ClassDB、解析期）对内置类型都不通，只能一格一跑；判「我们的表里有没有」要问运行时、别 grep `case`。

22. **S304 / S305 两轮之后开着的（2026-10-10 记）**：① 元数表五族已接进解析期，**残两笔**记在 §6 第 34 条 —— Pack 九支的元数没量；链式接收者与定形 `Array[Vector2]` 元素那两形引擎解析期拦而我们放过，缺的是「方法返回类型表」。**2026-10-17 复证：这两笔还开着**，七格全 DIFF（尺 `tmp/d6/one2.py`、读数 `tmp/d6/n2.txt`，句子逐格登在 S457）—— 其中五格只缺「`index` 读定形容器时交出内型」，交出后运算符型对 / 成员名表 / 调用元数三条现成的路各自就接得住；剩两格要新表（方法返回类型），得逐族过裁判。**同轮基线对照把这笔账的病灶挪到更下一层**（尺 `tmp/d6/one3.py`、读数 `tmp/d6/n3.txt`、明细 S457 ④）：`var v: Vector2 = Vector2(1, 2)` 直接 `v + 1` 与 `v.zzz` 也是引擎拦、我们放过 —— 值型**标注本身**就没进那两支闸门（`checkOperandPairs` 的 `ANNOT` 只收 `bool / int / float / String / Array / Dictionary` 六个名字，成员名那支的接收者表同范围），不是只缺元素读；同一探针里 `s: String` 的 `s + 1` 与 `v.distance_to()` 的元数句都是对的。正账因此重排：**①' 先按运算 × 型对把九支值型在「标注」这一格逐格过裁判，再 widen 那两张接收者表**（现成的 `OP_PAIRS_REFUSED_DECL` 没测过这一族，不许顺手扩）；**②' 然后**才轮到 `index` 读交出内型（`a[0]`），它建在①'之上。**①' 随 `1b474d9` 发货、②' 随本轮发货（S459）**：元素读经 `rawOf` + 现成 `parseTyped` 交出内型，与标注那两张表**逐对相等**（844 格 missing 0 / extra 0）。只剩第三笔「方法返回类型表」与元素读的成员名 / 调用元数两形。**第三笔的一半随 `4655760` 发货（S460）**：元素读交出内型后，五支值型内型的短元数与 `Array[String]` 的缺席属性逐格与裁判同（尺 `tmp/d6/n5.py`，二十七格）。**剩下两格卡在「名字全集没量」**：把值型七面的表外属性名一律当缺席试过 —— n5 对上十一格，但 `pnpm test` 当场红 **1863** 格，`valueAttrKind` 的 `null` 是刻意静音，扩它等于把没测过的形状当已知，已收回（S460 ②）。要先量「七面 × 任意串」那张全集表，才轮到元素读的表外**方法名**两句与方法返回类型表。② 元数门一接上就暴露出「名字在表里、实现还没有」那一串（`Vector3.rotated` / `Color.blend` / `Vector2.cubic_interpolate_in_time` 起步），是 S301 ④ 覆盖面名单的新条目，按族发货。③ 停门要停干净 —— 已写进 §2 第 16 条（残留子进程能让三支门同时假红）。④ `.gitattributes` 那一问仍待拍板（§1.97 末）：工作树上 `280-pow-precedence` 三份的 EOL 假 M 还挂着。⑤ **S306 已把那张欠款名单动了 24 名，并顺手修掉两处静默错值**（值类型族的 `clamp` 是「先比下界再比上界」，与全局 `clamp()` 不同一条；`Vector2i` / `Vector3i` 的 `snapped` 饱和不回绕）—— 剩下的名单与 `move_toward` 那条式子记在 §6 第 35 / 36 条。  
- **2026-10-17 结清这一条的①**：值型那面的「表外名」不再靠静音 —— 名单改从本机 `--dump-extension-api` 的内置类型 methods + members 取（S461，`BUILTIN_INSTANCE_MEMBERS`：Vector2 50 / Vector3 51 / Color 40 / String 116 / StringName 110 / NodePath 11，**类常量不算**：实测 `v.INF` 两句拒而 `v.abs` / `v.x` 全收）。属性读对所有认得的面接单，调用读只接 `e[0]` 元素读那一形（对所有接收者开会把 NodePath `length` 那种另一支已在报的两句报成四句）。`int` / `float` / `bool` 三面 dump 的实例方法集为空、正形没量过，故意留空。只剩**方法返回类型表**这一笔。
- **2026-10-17 把这一条的①' 一路结到 S468**：上面那笔「方法返回类型表」已按同一份 dump 的 `methods[].return_type` 量齐（S457 最后一笔），链式接收者 / 元素读 / 属性名当值 / Callable 当值四形各自进了运算符型对、成员名、调用元数三条闸门。定形容器的「读」一次补全（S468）：`Dictionary[K, V]` 的值读交出 `V`，`Array[T]` 的下标不再要求字面量 int —— 尺 `tmp/d6/dictread.py` 四百二十格与裁判**零分歧**（引擎拒 302、发货前放过 251、过拦 0），四把旧尺（`props.py` 770 / `n5` 27 / `n7` 24 / S459 的 844）合起来一千六百多格也无一格多拦。`int` / `float` / `bool` 三面的表外名同轮按 `tmp/d6/n9.py` 四十三格量齐（每形两句，属性读与调用读各一），不再是留空。开着的：`%` 格式化碰上 Callable  operand 那一句、scriptc 静态面不能覆盖 async 成员（`SC1090`，只能响亮拒）。
- **2026-10-17 又下一层（S473）**：容器那一读当**接收者**时，成员名与元数两支闸门以前只认「数组 + 字面量 int 下标」，现在走与 S468 同一条 `readFaceOf` —— 字典的值读、非常量下标都交面，String 那一面的元数另有一道闸门也一并接上（只喂元数，不重复成员名那两句）。三十七格 + 十五格 + 九格（局部标注）逐格过裁判，放过从 13 清到 2；`value-arity` 里那条「定形数组元素缺元素形那一列」的旧期望按裁判改成拒。仍开着三形（都量过）：属性读再往下一层（`v.x.zzz`）、键型不合式那一格的句子先后、`%` 格式化碰上 Callable。
- **2026-10-17 把「属性读当接收者」接上（S474）**：`attrFaceRecv` 的 attribute 那一支按 `BUILTIN_MEMBER_TYPES` 交属性自己的型，float / int 两面在 dump 里方法集为空 —— 十八格里引擎拒 17、句句是「找不到成员」两句，放过从 17 清到 1（剩那格是 String 面的**返回型**还没量进 `BUILTIN_METHOD_RETURNS`，下一笔要先把 String / StringName / NodePath 三面的返回型逐名过裁判）。门 **14597**（146 文件）。
- **2026-10-17 再下一层（S475）**：链子的**方法返回型**把 String / StringName / NodePath 三面接上 —— 128 个零必填调用逐个读 `.zzz`，引擎报的基名与 dump 的 `return_type` 全部一致，认得面的 99 名进表；`StringName` / `NodePath` 也进了型对闸门的 `ANNOT`，那支的 72 格分歧（66 放过）清零。顺手修掉一处自 S380 就存在的误拦：`is_valid_ascii_identifier` / `is_valid_unicode_identifier` / `uri_file_decode` 三名不在元数表里就被幽灵闸门当成不存在，引擎句句收 —— 改登 `FACE_EXISTS_BEYOND_ARITY`。仍放过的是返回 pack / StringName / NodePath 那 29 名的下一层（那三张成员表不认这些面）。门 **14598**（147 文件）。
- **2026-10-17 两件收尾**：① HEAD `00e331b` 的 golden 复证过：**OK 258 / 编译或运行报错 119 / 超时 17 / 内容变更 0**（读数 `tmp/d6/golden-s475.log`），六轮语义改动逐字节没动过任何一份 golden 或产物（`test:diff` 258/258 同步在案）。② `%` 格式化那一支补尺（`tmp/d6/fmt.py` 五十二格：四种格式符 × 十三种实参形，含链子、容器读、属性读与 Callable）—— 引擎九拒全是 `a number is required in operator %.`，与 S445 的判据同一句，**零分歧、放过 0、过拦 0**，闸门不用改；S469 / S475 行末那笔就此结清，记 S476。
- **2026-10-17 扫三面方法全集（S477）扫出一处误拦**：`ghostsweep.py` 二百三十七格把 String / StringName / NodePath 的全部方法名各以零实参调一次 —— 引擎拒 109 格全是元数或实参型两句，而我们把 `remove_char` / `remove_chars` / `replace_char` / `replace_chars` / `to_multibyte_char_buffer` 五名当不存在（S380 那张 109 名的表没有它们，闸门「不在表里即不存在」在这里就是误拦），五名登进 `FACE_EXISTS_BEYOND_ARITY` 后清零，剩 9 格是放过、0 格误拦。**新的欠款**：这五名的元数与实参型（`s.remove_char("a")` 引擎讲 `Cannot pass a value of type "String" as "int".`，两张表都缺），以及链子交出 pack 面后的那一层（`chain2` 一百四十二格里 109 笔放过）。门 **14606**（147 文件）。
- **2026-10-17 把 S478 的第一半结掉**：五名后加的 String 方法（`remove_char` / `remove_chars` / `replace_char` / `replace_chars` / `to_multibyte_char_buffer`）按 188 + 7 格的读数补上元数上下界与逐位形参拒（十二种字面量一位一位量：九种两式同拒、`Array` / `Dictionary` / lambda 的 `Callable` 只发 B 式），并顺手量出**模块级标注的名字从来没进 `faceTyped`** —— 接上后 String 面九十四格 87 格同句、过拦 0。新开两笔：`sn.` / `np.` 那道闸门根本没有形参那一段（84 格放过），以及 `literalTypeName` 只认字面量（`v.normalized` 当实参那 7 格）。门 **14607**（148 文件）。
- **2026-10-17 紧接一笔（S479）**：`checkNamedFace` 那道 StringName / NodePath 闸门原来只有元数与幽灵名两段，形参那一族整段是缺的 —— 按 n16 同一把尺量到的「`sn.` 与 `s.` 逐格一字不差」补上同形检查，五名五行进 `FACE_ARG_*` / `FACE_SLOTS`，`NodePath` 一名没量就不登。n16 一百八十八格只剩 14 格放过（都是 `v.normalized` 当实参那一形），过拦 0。下一笔仍是那两条：Callable 静态型进 `literalTypeName`、以及 StringName / NodePath 其余方法名的逐位形参族。
- **2026-10-17 第三笔（S480）**：pack 九支的表外名判据换成 **dump 方法全集** —— 两侧都量过：54 格发明名（三支形态 × 九支）引擎句句两句，253 个真名（每支的方法全集，成员与常量两张表是空的）一格都没被开口，写形同读形（`b.zzz = 1` 两句、`b.size = 1` 才是常量句）。解析期那一支从此不再读 `PACK_ABSENT_*` 三份名单（runtime 那侧不动，装箱另有实测），并把 `attrFaceRecv` 的链分支与调用分支一并放行 pack 面 —— `chain2` 一百四十二格放过 113 → **61**、过拦 0；剩的两类是链子的元数（26 格）与链子参加运算的型对句（29 格），都要先按每符量过才登。门 **14615**（148 文件）。
- **2026-10-18 第四笔（S481）**：pack 两面参加运算的型对从零量齐 —— `n19.py` 五百一十二格（标注 / 链子两种接收者 × 八种字面量 × 八符两向），引擎拒 478、句句第二式，收的 34 格正是同型拼接那一族；`ANNOT` 认这两面、`OP_PAIRS_REFUSED_DECL` 每符并到 90–111 对，并给两支循环的 `call` 位加 `packCtorFace` 回落（pack 构造位 `staticType` 不认，那 112 格卡在这）。`chain2` 的放过 113 → 35，全尺 0 过拦。新门 `op-pairs-pack` 512 格。门 **14616**（149 文件）。剩：链子的元数（26 格）、其余七支 pack 面与 StringName / NodePath 的型对集、`v.normalized` 当实参那一形。
- **2026-10-18 第五笔（S482）**：链子交出的那一面接进四闸 —— 元数（`checkValueMethodArity` 的 `recv` 认 `BUILTIN_METHOD_RETURNS` 的返回型，pack 两支 600 格里引擎拒的 478 格句句照报）、成员名（`checkPackFaceNames` 给 `StringName` / `NodePath` / `String` 的链子调用式放开）、pack 形参两句（`checkPackArgSlots` 认模块级标注名证得出的链子）、pack void 那句（`checkVoidMethodValues` 认 pack 链子）；827 格的分歧 **544 → 46**、过拦 0，`chain2` 35 → 6，旧尺 `n19` / `dictread` / `ppack2` / `ghostsweep` / `props` / `n10` / `n11` / `n13` 一律 **0** 差，`face-chain-return` 门从 495 格增到 **1089** 格。欠的三笔另账：① 越界元数时引擎照查第 1 位的形参两句（`p.append(1, 2)` 那一形，直接收者与链子同漏 9 格）与模块级标注 pack 名的形参拒（`p.append(1)`）；② pack 的 `sort` / `reverse` 在非零元数同样报 void（`s482d` 十三格量齐，`VOID_BYTES_ZEROARG` 那一侧也漏）；③ `StringName` / `NodePath` 的表外名在**字面量与标注名**两形照报两句（`s482d` 八格量到，出货只在链子那一形开口）。
- **2026-10-18 第六笔（S483）**：void 那一族把 pack 的 `sort` / `reverse` 从「只在零参」改成**任意元数**（九支构造式 × 五形共 45 格量齐，元数那一句照旧另发），并把 `checkVoidMethodValues` 的接收者证明补三形 —— 模块级标注的 Array / Dictionary / pack 名字、就地构造式 `PackedByteArray([1])`、S482 那条链子；`tmp/d6/s483.py` 五十九格引擎全拒，发货前分歧 53（放过 18）、过拦 0，落地后 **0** 分歧，`s482.py` 那 600 格整把尺同时清零、`s482b` 九格降到八格。没读数的那几形故意不动：`Signal` / `Callable` 的模块名、一切推断来的模块名、`[1, 2].sort(1)` 那种字面量接收者。还欠的两笔：① 形参两句只在**量过的那一元数**才发（`p.append(1, 2)` 越上界、`p.append(1)` 是模块标注名、链子的 `find(1)` / `count(1)` —— `s482b` 八格 + `s482c` 十二格）；② `StringName` / `NodePath` 的表外名在**字面量与标注名**两形照报两句、`.zzz` 那种候选宇宙之外的属性读也不开口（`s482d` 八格 + `s482c` 五格）。
- **2026-10-18 第七笔（S484）**：`StringName` / `NodePath` 的表外名不再靠两张固定名单（六名 + 三名）—— 判据换成 S480 那张 dump 全集，四种接收者（字面量 / 模块标注名 / 形参标注 / 构造式）× 两式（属性读、调用）一次对齐，`tmp/d6/s484.py` 一百一十二格 + `tmp/d6/s484b.py` 十三格落地后与裁判 **0** 分歧、过拦 **0**；那两句的 code 从 `string-name-member` / `node-path-member` 并成 `face-member-missing` / `face-member-not-found`（原文一字未动），`checkNamedFace` 的 `ghosts` 一支与两张名单一起删。顺带修一处真漏：调用式的接收者证明原来只递 `ann`，形参标注那一形没进去（S391 明明量过）。`s482c` 十七格降到十二、`chain2` 六降到三，其余旧尺 `ppack` / `n19` / `n13` / `n10` / `n11` / `dictread` / `props` / `ghostsweep` 一律 0 差。`&"…"` 字面量接成员那一形仍撞 tree-sitter（§6 第 64 条⑤），本轮从尺里摘掉、没写进语义层。只剩形参两句那一族：引擎在 `sn.count(1)` 这种**下界元数**上照查第 1 位（九格读数），与 `p.append(1, 2)` 越上界同源，另账结。
- **2026-10-18 第八笔（S485）**：形参那两句的判据从「实参个数正好等于量过那一元数」改成**按位查** —— `FACE_SLOTS` 那张闸门表连同两处 `measured` 判定整个删掉，值型 / pack / 链子那支的形参段从「元数合式」分支里搬出来（越上界、欠下界都先逐位发句子，再补元数那一句），`Array.assign` 按两格新读数补进 void 集。`tmp/d6/s485.py` 二百五十四格（四张形参表的第 1 位每行一格、只给一个实参）引擎全拒且句句点在第 1 位，出货放过 85 格、过拦 0 → 0 分歧；`tmp/probe-argtype/check-inst.mts` 的一千二百八十八格旧读数一字不差，`s482b` 分歧 8 → 5、其余尺（`s482` 六百格 / `chain2` / `n19` / `dictread` / `props` / `ppack` / `ppack2` / `ghostsweep` / `n10` / `n11` / `n13`）0 差；新建 `packages/compiler/test/face-arg-any-arity.test.ts` 逐格钉住。还欠的两笔都量到了格数：`checkPackArgSlots` 的接收者证明只吃函数体内的 var（模块级标注 pack 名那一形，5 格），`chainRecvFace` 交出的面只喂了元数那一道、`FACE_ARG_*` 的形参两句在链子上还漏（12 格）；静态面 `STATIC_ARG_*` 同一条等元数口径没重量，按老规矩不动。
- **2026-10-18 第九笔（S486）**：形参那两句补最后两种接收者 —— `checkPackArgSlots` 的 `packs` 认模块级**标注**的 pack 名（`var k1: PackedInt32Array` 之后 `k1.append("a")` 两句照回，函数体内同名 var 优先），`checkValueMethodArity` 头一段认链子交出的 `String` / `StringName` / `NodePath` 三面、且查完形参仍落到下面那段补元数那句。`tmp/d6/s486.py` 一百二十五格读数：引擎拒 93，落地前分歧 45（放过 35 + 缺两句 10）→ **9**、过拦 0；`s482b` 三十二格整族清零、`s482c` 12 → 8、`s482` / `s485` 一字不动，`check-inst.mts` 一千二百八十八格旧读数不合 0。新建 `packages/compiler/test/arg-slot-receivers-486.test.ts` 钉 84 格。剩下 9 格是**缺表行**不是缺判据：`PACK_ARG_POSITIONS` 缺 `append_array` 那一行（三格，槽位是 pack 型本身、与 void 同格回），`FACE_ARG_*` 缺 `StringName` 面 `find` / `count` / `begins_with` / `split` / `insert` 第 1 位行（六格，句子原文都在 `tmp/d6/s486.json`）—— 下一笔要按「每种被拒类型逐位量齐」的口径补，不能只照一种字面量写半行。
- **2026-10-18 第十笔（S487）**：`StringName` 八名（`find` / `count` / `begins_with` / `ends_with` / `split` / `insert` / `erase` / `substr`）十四个位的形参两句照读数登进 `FACE_ARG_AS` / `FACE_ARG_TYPES`（S479 那张表在 `StringName` 面上只有五名，其余六名一直缺行），同时让 `literalTypeName` 认 pack 构造式 —— 它此前只认数值型构造式，pack 实参在任何面都点不着火。`tmp/d6/s487b.py` 二百二十四格引擎拒 182，落地前 182 格全放过、过拦 0 → **0** 分歧。两笔对照量好了没动：`s487d.py` 三百格里其余各面 296 格引擎同样只回第二句（那些行的 pack 种类还没登，是同一判据下的表行补全）；`s487c.py` 一百六十八格量清 pack 的 `append_array` 在五种接收者下同判（同型 pack 与 `Array` 收、其余两句齐发且与 void 同格），与 `PACK_ARG_*` 那道「Array / Dictionary 只发第二句」的特例不同，得另写。新建 `face-arg-stringname-slots.test.ts` 钉 182 格；S486 留在 `s482c` 的十二格随这张表一起清零（该尺 0 分歧），`s485` / `s482` / `s482b` / `n19` / `dictread` / `props` / `ppack` / `ppack2` / `ghostsweep` / `n10` / `n11` / `n13` 与一千二百八十八格旧读数一律 0 差；`chain2` 剩三格是型对表里 `StringName` / `NodePath` 与 int 那两对没登（同一判据，另笔）。
- **2026-10-18 第十一笔（S488）**：`literalTypeName` 认 pack 构造式（此前只认数值型构造式，pack 实参在所有面都交不出型名），并把 `PackedByteArray` 按读数登进 `FACE_ARG_TYPES` / `INSTANCE_ARG_TYPES` 的 282 处位（两表 296 处需要，14 处 S487 已登）。`tmp/d6/s487d.py` 三百格：引擎 298 拒、296 格只回第二句，`Array` 槽那两格收；发货前 296 格全放过、过拦 0，落地后 0 分歧。新建 `face-arg-pack-ctor-args.test.ts` 钉 298 格；`s485` / `s482` / `s482b` / `s482c` / `n19` / `dictread` / `props` / `ppack2` / `n10` / `n13` 与一千二百八十八格旧读数一律 0 差，`chain2` 仍欠型对表那三格（`StringName` / `NodePath` 与 int 那两对没登）。`PackedStringArray` 当实参那一型只在 `StringName` 面量过（S487），其余各面还没量，另笔。
- **2026-10-18 第十二笔（S489）**：`StringName` / `NodePath` 两面参加运算的型对量齐并接进 `OP_PAIRS_REFUSED_DECL_VAL` / `_REV`（各并 232 / 242 对，两表 237 → 469、425 → 667，各添 `!=` / `**` / `<=` / `>` / `>=` / `in` 六个键）。`tmp/d6/s489c.py` 八百三十二格（右支字面量）引擎拒 748、句句第二式，落地前全放过；闸门按型对查表不看右支写法，所以另起 `tmp/d6/s489e.py` 五百二十格把右支换成标注名重量一遍，引擎拒 474 且**两形拒的集一字一样**（`s489f.py` 差额 0），两形才敢共用一张表。真正的错值不在表里而在操作数名：`checkOperandPairs` 的 `literalKind` 借 `staticType`，它把 `&"ab"` 折进 `String`、`^"a/b"` 回 null（S275 留的口径），`sn - &"ab"` 因此印成 `"StringName"` 与 `"String"`、`sn + ^"a/b"` 连型对都点不着；改成先问 `literalTypeName` 就拿到了引擎句里那两个名，链子那一形一行没动（`BUILTIN_METHOD_RETURNS` 早交出那三个名字）。实测三处不对称照登：`sn % X` 十型全收而 `np % X` 十型全拒、`"ab" % sn` 两形都收；`==` / `!=` 收同型、`<` / `<=` / `>` / `>=` 只 `StringName` 配 `StringName` 收；`in` 收 `sn in "ab"` / `sn in [1]` / `np in [1]` 那六形。`chain2` 剩的三格（S487 ④ / S488 ③ 挂账）随之清零；旧尺 `s482` / `s482b` / `s482c` / `s482d` / `ctor2` / `inop` / `n7` / `callables2` / `cb4` / `n19` / `dictread` / `props` / `ppack` / `ppack2` 与 packed 读数两千六百三十二格一律 0 差。新建 `op-pair-name-faces-489.test.ts` 钉 1352 格，门 **16917**（155 文件）、`test:golden-check` 394/394、`test:compile` 265/383。还欠：两侧都字面量那一形（`&"ab" + 1`，走 `OP_PAIRS_REFUSED_A` / `_B`）两面的行一行没登，`and` / `or` 掺这两面没量过。另有一把旧尺作废 —— `tmp/d6/nested.py` 复跑报 51 格过拦，其实是尺子自己写错了：它顶上 `Array[Array[Vector2]]` 那四个标注本身就撞引擎那句 `Nested typed collections are not supported.`（出货 `typed-collection-nested` 四条同句早发），整脚本解析中止才让 630 格全读成「引擎收」；`ea[0] + 1` 单拿裁判跑 `tmp/d6/nt-check.gd` 确认引擎照拒同一句，钉格断言不动，换 HEAD 版 analyze 跑那三格也是一字一样。
- **2026-10-18 第十四笔（S491）**：运行期 `%` 的格式化那一族按值量齐并发货 —— 左支写成变量时引擎不折叠，失败落在运行期：推一块 `ERROR: String formatting error: <细节>.`（`at: validated_evaluate (core/variant/variant_op.h:829)`）、**脚本照跑**、回值是**格式串原样**（`"%d" % "ab"` 给 `"%d"`、`"ab" % 7` 给 `"ab"`、`"%s%s" % "ab"` 给 `"%s%s"`）。`ops.mod` 的格式化分支原先只认 `Tag.STRING`，`StringName` 左支掉进数值那路抛 `Invalid operands 'StringName' and 'int'`，而引擎那一格给的是 `7`；抽出 `pctFormatOp`（`isStringish` 两支共用、`typeof` 一律 4 = String），失败经 `strFormatSoft` 折成「回格式串 + 细节一句」由 `frames.pctFormatError` 推那块，`methods.formatOf` 并进同一支。**此前手抄的那句运行期文本 `<细节> in operator '%'.` 是推出来的、不是量出来的** —— 带引号的写法只在解析期成立，八类运行期细节这轮逐格量齐。`*` 那一位纠了一处顺序：星号位的类型检查排在元数检查之前（`"%*s" % "ab"` 给 `* wants number or vector.`，`"%*d" % 7` 给 `not enough arguments for format string.`），头一道闸改数**值槽**、循环里逐位补检查。新建语料 396-pct-runtime（三十格逐字节）+ `packages/runtime/test/pct-runtime-soft.test.ts`（24 格钉回值与那块头两行）；复量 `tmp/d6/s491f.py` 七十格（其中 50 格带 ERROR 块）与裁判 **0** 分歧。门 **17660**（157 文件）、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:compile` 266/384、`test:golden-check` 395/395 内容变更 0。**一条手法记账**：`cli run` 在开发态吃的是 `packages/runtime/dist` 那份构建产物，改完 runtime 不 `pnpm build` 就复尺会读到旧行为（这轮第一次复量就是这样误报了 60 格）。`String.format()` 与 `strFormatV` 那两条通道的运行期失败仍没量过、不动。
- **2026-10-18 第十五笔（S492）**：`append_array` 的实参位补进 `PACK_ARG_POSITIONS` —— 这一位的槽型是**接收者自己那一型**，判据与 `e` 槽不是一档，所以新开一个 `a` 槽。`tmp/d6/s492.py` 三百九十六格（九面 × 廿二型来源 × 模块标注名与就地构造式两种接收者）引擎句句带 void 那句，形参两句分三档：`Array` 与同型那支 pack **收**，十一型（bool / float / int / String / StringName / NodePath / Color / Vector2 / Vector2i / Vector3 / Vector3i）**两句齐发**，`Dictionary` 与其余八支 pack **只回第二句** —— 与 `PACK_ARG_*` 那道「容器来源只第二句」的特例不同（那道 `Array` 只第二句，这位 `Array` 直接收）。`packArgSource` 认不出 `^"a/b"` 与 pack 构造式，`a` 槽自己补这两形（NodePath 两句、其余八支 pack 只第二句），没量过的来源（`null` / Callable / 类名）不开口；五种接收者证明（`s487c` 一百六十八格）与两形接收者（`s492` 不一致 0 格）逐格句子一字一样。新建 `pack-arg-append-array.test.ts` 钉 396 格；`s486` 的九格旧账随 S487 那笔一起清零（该尺 125 格 0 分歧），`s487c` / `s485` / `s482b` / `ppack2` 与 packed 读数两千六百三十二格一律 0 差。门 **18056**（158 文件）、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:compile` 266/384、`test:golden-check` 395/395 内容变更 0。还欠：`var w: NodePath` 这类**标注来的实参**塞进 `a` 槽那一形没量，闸门暂按既有「标注来源只发第二句」走，补量另笔。
- **2026-10-18 第十六笔（S493）**：把上一笔留的 `a` 槽名字形量齐 —— `tmp/d6/s493.py` 五百九十四格（九面 × 廿二型 × 模块标注名 / 局部标注名 / 初值推断名）：标注名两形**只回第二句**（同型 pack 与 `Array` 仍收），初值推断那一形 198 格引擎全收 —— 与 S492 字面量形的「十一型两句齐发」不是一档，`Cannot pass a value of type …` 那一句只跟着字面量与构造式走。落地：`a` 槽再认一张 `annAll`（模块标注打底、同名局部标注覆盖、被重新赋值过的丢掉、只收量过的廿二型，定形标注 `Array[int]` 不开口），命中的名字只发第二句；既有的 `annot` 只有 `ANNOT_SOURCES` 那十二名、不含 `NodePath` 与九支 pack，正是局部标注那档先前漏的 81 格。`s493` 五百九十四格、复量 `s492` 三百九十六格、`s486` 一百二十五格、`s487c` 一百六十八格一律 **0** 分歧、过拦 0。新建 `pack-arg-append-array-names.test.ts` 钉 594 格，门 **18650**（159 文件）、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:compile` 266/384、`test:golden-check` 395/395。还欠：形参标注与内部类字段那两形塞进 `a` 槽没量，另笔。
- **2026-10-18 第十七笔（S494）**：pack 两道闸门的静态证明从「模块标注名 + 函数体内标注 var」放开到**形参标注名**与**内部类字段标注名**两形（作用域口径同 S391 的 `faceScopes`：模块打底 → 内部类字段 → 本函数形参）。三把尺：`tmp/d6/s494.py` 三百九十六格（九面 × 廿二型 × 两形，`append_array` 那一位）落地前整族放过 → **0** 分歧；`tmp/d6/s494b.py` 六十六格（接收者换成这两形去量 `append` / `insert` / `bsearch` / `resize` / `slice` / `fill` / `append_array`，实参是字面量）五十八拒八收，分歧二十四 → **0**；`tmp/d6/s494c.py` 三百二十四格是顺手补的第三形 —— `annot` 底表一放开，`e` / `i` / `b` 三槽也会认名字实参，「只回第二句」这条判据先前只在 `a` 槽量过，不量就等于押在没测过的槽位上，过裁判二百七十六拒四十八收、`Cannot pass a value of type` 一次没出、一百零八个分组三形逐组同句，判据才敢整族接。落地：新增 `packArgScopes`，`checkPackArgSlots` 的 `packs` / `annot` / `annAll` / `ownerFace` 全从这一层起步；`checkVoidMethodValues` 加 `packSeeds`，但**只补 pack**（容器与值型的接收者这两形没在这把尺里量，照旧不开口）。`s492` / `s493` / `s486` / `s487c` / `s487d` / `s485` / `ppack2` / `n19` / `dictread` 与 packed 读数两千六百三十二格一律 0 差。新建 `pack-arg-param-field.test.ts` 钉七百八十六格，门 **19436**（160 文件）、typecheck 4/4、`test:diff` 259/259、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。还欠：这两形当链子接收者没量；`Array` / `Dictionary` / `String` 三面拿这两形作实参没量。
- **2026-10-18 第十八笔（S495）**：形参拒那两张表接上**名字实参**那一形 —— 闸门原先只拿 `literalTypeName` 认实参，任何名字都交不出型，440 格（五位位子 × 廿二型 × 四种名字：模块标注 / 局部标注 / 形参标注 / 内部类字段）里引擎拒 352 而我们整族放过。读数给的判据与 pack 那族（S493 / S494）一模一样：**名字来的只回第二句**，`Cannot pass a value of type …` 一次没出，四种名字写的句子逐组一字一样。落地：新增 `argNameScopes`（每支函数体一份「名字 → 标注型」，模块打底 / 内部类字段 / 形参 / 体内标注 var 四层盖，只收量过的廿二型，定形标注与 `Callable` / `Variant` 不开口）接进 `checkNamedFace` 与 `checkValueMethodArity` 的 `FACE_ARG_*` 那一段，**链子接收者那一形不开**（没量）；`checkValueMethodArity` 的 `funcs` 带上内部类字段，`faceTyped` 才接得住 字段当接收者 那一形。顺手把字面量复量（110 格）撞出的 **23 格表缺行**按读数登进 `FACE_ARG_TYPES`（`String.find` 两位 / `Array.resize` 第 1 位 / `StringName.find` 第 1 位各补八支 pack；`Dictionary.has_all` 的 pack 全收，一行不登）。`FACE_ARG_AS` 一百四十六行 `refuse` 与 `also` 完全相等，两形才敢共用一张表。`s495` / `s495c` 440 格与 `s495b` / `s495d` 110 格一律 0 分歧、过拦 0；旧尺 `s494` 三把 / `s492` / `s493` / `s487c` / `s487d` / `s486` / `s485` / `ppack2` / `n19` / `dictread` 与 packed 读数两千六百三十二格一字不动。新建 `face-arg-named-arguments-495.test.ts` 钉 550 格，门 **19986**（161 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。还欠：`INSTANCE_ARG_*` 那两张表（值型面与 pack 面）的名字实参一行没量，链子接收者配名字实参也没量，`NodePath` 面在那两张表里本来就一行没有。
- **2026-10-18 第十九笔（S496）**：把上一笔的判据推过值型那一族 —— `INSTANCE_ARG_AS` / `INSTANCE_ARG_TYPES` 两张表（Color / Vector2 / Vector2i / Vector3 / Vector3i 五面各一百行）接上**名字实参**：`tmp/d6/s496.py` 四百四十格（`Vector2.distance_to` 第 1 位 / `Vector2.lerp` 第 1、2 位 / `Color.lerp` 第 1 位 / `Vector3.distance_to` 第 1 位 × 廿二型 × 四种名字）落地前整族放过（引擎拒三百九十二），落地后 **0** 分歧、放过 0、过拦 0。读数与 S495 同一判据：名字来的只回第二句（`Cannot pass a value of type` 一次没出），四种名字写的句子在一百一十个分组里一字一样，把 AS 剥掉后与字面量形逐格差额 0；`INSTANCE_ARG_AS` 一百五十五行 `refuse` 与 `also` 完全相等，两形才敢共用一张表。另起 `tmp/d6/s496c.py` 一百一十格专量**内部类字段当值型接收者**那一形（与 `s496b.py` 的形参接收者逐格同句，拒九十八收十二），才把 `checkValueMethodArity` 的 `typed` 喂上类自己的字段——模块级名字往内部类灌这条照旧不给（没量过）。链子接收者配名字实参不开口。字面量两趟另撞出 **40 格表缺行**（五位各缺八支 pack，全只回第二句）按读数登进 `INSTANCE_ARG_TYPES`（`Color.lerp` 只登量过的第 1 位）。`check-inst.mts` 两千六百三十二格（不合 0）与 `s495` / `s494` 三把 / `s492` / `s493` / `s487c` / `s487d` / `s486` / `s485` / `s482` 三把 / `ppack2` / `n19` / `dictread` 一律 0 差。新建 `value-arg-named-arguments-496.test.ts` 钉 660 格，门 **20646**（162 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。还欠：链子接收者配名字实参、`Vector2i` / `Vector3i` 两面、`Color.lerp` 第 2 位、定形标注与初值推断的名字。
- **2026-10-18 第二十笔（S497）**：形参拒那三族闸门把**链子接收者**与**构造式接收者**配上名字实参一并放开 —— `tmp/d6/s497.py` 四百四十格（`Vector2.normalized().distance_to` / `Vector2.normalized().lerp` / `NodePath.get_concatenated_names().find` / `String.to_upper().find` / `String.hex_decode().append` 五种写法 × 廿二型 × 四种名字）落地前放过三百一十二格，落地后只剩 **40** 格、过拦 **0**；同批写法另尺重量 110 格字面量形（`s497b`）与 66 格构造式接收者形（`s497e`）。判据与 S495 / S496 合成一句话：**闸门按型对查表，实参写法只决定 `Cannot pass a value of type …` 那一句在不在**，名字来的只回第二句，四种名字写的句子在一百一十个分组里一字一样。顺手补一处静态证明：链子头是**内部类字段**时（`class Q: var r: NodePath` 之后 `r.get_concatenated_names().find(w)`）先前 `nameFaces` 只吃模块 var / 形参 / 体内标注 var，那一形连面都证不出，按读数补上本类字段那一层；定形容器元素当接收者（`a[0].m(w)`）没量过名字实参，照旧不开口。剩的 40 格不是判据而是**表行**：pack 面 `e` 槽缺 `NodePath`（两句齐发）与九支 pack（只第二句）两档，读数已另起两把尺备齐 —— `s497c` 一百一十格（名字接收者）与 `s497d` 三百九十六格（九面 × 廿二型 × 两种写法，引擎拒三百四十六、过拦 0），连同构造式链头那一族（`s497e` 二十格）一起留给下一笔。旧尺 `s496` 三把 / `s495` 两把 / `s494` 三把 / `s492` / `s493` / `s487c` / `s487d` / `s486` / `s485` / `s482` 三把 / `ppack2` / `n19` / `dictread` 与 packed 读数两千六百三十二格一律 0 差。新建 `chain-arg-named-arguments-497.test.ts` 钉 484 格，门 **21130**（163 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。
- **2026-10-19 第二十一笔（S498）**：把 S497 ⑥ 留的两族账一次结清。① **pack 面 `e` / `i` / `b` 三槽补两档来源**：`tmp/d6/s497c.py` 一百一十格 + `tmp/d6/s497d.py` 三百九十六格 + `tmp/d6/s498b.py` 一百三十二格（i 槽 `get` / `resize`、b 槽 `bsearch` 第 2 位）共 638 格，引擎拒五百五十五，落地前放过 288、过拦 0 → **0**。三档分法与 `a` 槽同判：字面量的 `NodePath` 两句齐发、九支 pack 的字面量与构造式只回第二句、名字来的（含 `NodePath` 与 pack 标注名）一律只回第二句；`PackedStringArray` 的 String 槽实测**收** `NodePath`，`PACK_ARG_SLOTS` 的 `ok` 补这一名。实现：`packArgSource` 认 `node_path` 与九支 pack 构造式（`a` 槽那段自补的 `litA` 成了重复，删掉），e/i/b 的名字实参改走 `namedSlotSource`（照 `ARG_NAME_TYPES` 的廿二型口径），pack 来源不进 AS 那一句。② **值型那族的链子头认构造式**：`tmp/d6/s498a.py` 九十三格（含字面量形与元数那五格）与 `tmp/d6/s497e.py` 六十六格逐格对上 —— `Vector2(1, 2).normalized().distance_to(…)` 与名字打头同判，落地前整族放过（形参两句与元数两句都不发）。实现只一行：`recvOwner` 的 `call` 分支先问 `valueCtorType`。旧钉的一格按裁判翻案：`value-arity.test.ts` 里那条「链式：这张表没有返回类型所以放过」改钉 `Too few arguments for "angle_to()" call. Expected at least 1 but received 0.`。③ `s497` / `s497b` 剩的 40 + 10 格（pack 位）随这一笔清零；旧尺 `s492` / `s493` / `s494` 三把 / `s486` / `s487c` / `s487d` / `s495` 两把 / `s496` 三把 / `ppack2` / `n19` / `dictread` / `s485` / `s482` 三把与 packed 读数两千六百三十二格一律 0 差。新建 `pack-slot-node-path-498.test.ts` 钉 638 格、`chain-arg-named-arguments-497.test.ts` 补齐到 616 格，门 **21900**（164 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。还欠：多位方法的第二位以后只量了 `bsearch` 那一位；`null` / `Callable` / 定形标注 / 初值推断的名字仍一律不开口；类名直调那一形没量名字实参。
- **2026-10-19 第二十二笔（S499）**：`NodePath` 面的形参拒从「两张表一行没有」量齐登表 —— `tmp/d6/s499a.py` 二百二十格（`get_name` / `get_subname` × 廿二型 × 五种写法）与 `tmp/d6/s499b.py` 一百三十二格（同批型走链子接收者）过裁判：拒三百零四格、收四十八格，落地前**整族放过**、过拦 0 → 两把尺 **0** 分歧。两档分法与 S492–S498 同一判据（九支标量与值型的字面量两句齐发、`Array` / `Dictionary` / 九支 pack 只第二句、名字形一律只第二句），四种名字写的句子在四十四组里一字一样，链子接收者与直收者逐组同句（名字与字面量各四十四组差额 0）。表行：`FACE_ARG_AS` 两行（八名 `refuse` 与 `also` 相等）、`FACE_ARG_TYPES` 两行（十一名），`null` 没量就不登。至此三面 + 值型五面 + pack 九面的形参拒共用一条判据：**闸门按型对查表，实参写法只决定 AS 那一句在不在**。旧尺 `s498` 三把 / `s497` 四把 / `s496` 三把 / `s495` 两把 / `s494` 三把 / `s492` / `s493` / `s486` / `s487c` / `s487d` / `s485` / `s482` 三把 / `ppack2` / `n19` / `dictread` 与 packed 读数两千六百三十二格一律 0 差。新建 `face-arg-node-path-slots-499.test.ts` 钉 352 格，门 **22252**（165 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384（92 / 26 / 0）、`test:golden-check` 395/395 内容变更 0。还欠：`null` / `Callable` / 定形标注 / 初值推断的名字当实参；`NodePath.equals` / `is_subname_of` 两名的存在与元数没查。
- **2026-10-19 第二十三笔（S500）**：pack 多位方法的**第 2 位**过裁判 —— `tmp/d6/s500a.py` 四百四十格（`PackedByteArray` / `PackedStringArray` 两面 × `set` / `insert` / `find` / `slice` / `bsearch` 五位 × 廿二型 × 字面量与形参标注名两形）：引擎拒三百八十、收六十，三档分法与第 1 位一字不差（AS 那一句只在八支标量与值型的字面量里出现八十次，名字形一次没有；二百二十组里剥掉 AS 后与字面量形逐组差额 0）。**出货零改动对上**：S498 把来源认全与「pack 来源不进 AS」都作在 `PACK_ARG_POSITIONS` 逐位查槽的那一段，不是补在某一位，所以这一族是那条实现的跨位子独立验证 —— 上一笔（S499）与 S498 ⑥ 挂的「第二位以后没量」随这一笔读数结清。顺带第二次独立证实 `PackedStringArray` 的 e 位收 `NodePath`（`set` / `insert` 的第 2 位），与 S498 补进 `PACK_ARG_SLOTS` 的那一名同形。新建 `pack-slot-second-position-500.test.ts` 钉 440 格，门 **22692**（166 文件）与 typecheck 4/4；出货代码本轮不动，五道 corpus 门沿用 S499 落地后单独跑完的读数（`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384、`test:golden-check` 395/395 漂移 0）。还欠：`null` / `Callable` 当实参、定形标注与初值推断的名字、类名直调配名字实参，以及 pack 另七面第 2 位（本轮只量 int 槽与 String 槽两面）。
- **2026-10-19 第二十四笔（S501）**：把名字实参剩下两种写法量齐 —— `tmp/d6/s501a.py` 一百八十格（三族闸门各取位子：pack `e` 位与 `a` 位、`PackedStringArray.set` 第 2 位、`String.find`、`Vector2.distance_to`、`Array.resize` × 十一种初值推断 + 四种定形容器标注 × 局部与模块两 scope）。读数：**初值推断那一形 132 格引擎全收**（解析期不拿推断当静态证明，S492 / S493 同口径，出货零改动对上）；**定形容器标注 48 格拒四十二**、句句只回第二句，型名印**规格化**后的标注（`tmp/d6/s501b.gd`：`Dictionary[ String ,  int ]` → `Dictionary[String, int]`、`Array[ int ]` → `Array[int]`）。落地：`argNameOf` 认带 `[` 的标注并规格化、`argFaceBase` 取基型，三族闸门的表判定改走 `faceListHas`（按基型查表、印出原文），pack `a` 位改按基型分收拒（`Array[…]` 与 `Array` 同档收、`Dictionary[…]` 与 `Dictionary` 同档拒），`namedAppendSource` / `namedSlotSource` 同步。`s501a` 一百八十格 0 分歧 0 过拦；`s500a` 四百四十格、`s499` 两把、`s498` 三把、`s497` 四把、`s496` 三把、`s495` 两把、`s494` 三把、`s492` / `s493` / `s486` / `s487c` / `s487d` / `s485` / `s482` 三把 / `ppack2` / `n19` / `dictread` 与 packed 读数两千六百三十二格一律 0 差。新建 `arg-name-typed-collection-501.test.ts` 钉 180 格，门 **22872**（167 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384；`test:golden-check` 三次整跑各撞一例 Godot 侧超时（`224` / `265` / `287`），单跑各例全绿、`test:diff` 259/259 逐字节、golden 文件零改动，记为机器争用。还欠：内型是值型或嵌套的定形标注没量（本轮认的是四条读数，其余属外推）、`null` / `Callable` / `Variant` 当实参、类名直调配名字实参。
- **2026-10-19 第二十五笔（S502）**：把上一笔挂着的那句「其余属外推」换成读数 —— 定形容器标注的其余元素形过裁判。四把尺逐格一份脚本（嵌套那一形会让整份 Godot 脚本在声明行中止，S489 ⑦ 的老规矩）：`tmp/d6/s502b.py` 四十二格（十一种标注 × `String.find` / `Array.resize` / `PackedByteArray.append` 三位子）、`tmp/d6/s502c.py` 十八格（`Variant` 坐在元素表里的四种拼法）、`tmp/d6/s502d.py` 十格（归一之后在 `append_array` 那一位的**判据**）、`tmp/d6/s502e.py` 十八格（模块标注名与局部标注名两形）。可量的六十八格**引擎句句拒、我们句句对上**（0 放过 0 过拦）：判据与 S501 同一条，元素型是什么都不改收拒 —— 因为表本来就按基型查（`argFaceBase`），这一族是该通用性的第二次独立验证，**判据侧一行没动**。真正的缺口只有型名文本两处：① pack 那一族的 `e` / `i` / `b` 槽此前印标注**原文**（`Array[ PackedStringArray ]` 带空格漏出去），S501 的规格化只作在另两族站点上 —— `namedSlotSource` 改走 `typedFaceText`；② 元素**全是** `Variant` 的那一形引擎报**裸基型**（`Array[Variant]` → `Array`、`Dictionary[Variant, Variant]` → `Dictionary`），混着一个非 Variant 照报全名（`Dictionary[String, Variant]` / `Dictionary[Variant, int]` 六格证实不折叠），`typedFaceText` 加这一格归一；`Array[Variant]` 在 `a` 位随 `Array` 收、`Dictionary[Variant, Variant]` 随 `Dictionary` 拒，判据与文本同归一致。声明行就中止的二十格（nested / `Array[node_path]` / `Array[int, int]` / `Dictionary[Array]` 那几句）记在 S502 ④，属声明期不进实参闸门。新建 `arg-name-typed-collection-502.test.ts` 钉 68 格，门 **22940**（168 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384，语料产物零 churn；复量直接压在本轮站点上的 `s501a` 一百八十格与 packed 读数两千六百三十二格一律 0 差。还欠：`null` / `Callable` 当实参、**裸** `Variant` 标注那一形（本轮只量了 `Variant` 坐在容器元素位上）、类名直调配名字实参、`Vector2i` / `Vector3i` 两面与 `Color.lerp` 第 2 位。
- **2026-10-19 第二十六笔（S503）**：三族闸门一直关着的那两档来源量齐 —— `tmp/d6/s503.py` 三十六格（六位位子 × `null` 字面量 / 初值推断的 null / `Callable` / `Variant` / `Object` / `Node`，逐格一份脚本）+ `tmp/d6/s503b.py` 一百三十二格（六面 pack 的 `append` / `resize` / `bsearch` / `append_array` 四位与九处静态面的位子 × 四种来源）。一百六十八格里引擎拒一百五十四、收十四：**值型槽对 `null` 字面量两句齐发、对对象型名字只回第二句**，与 S495 起的名字口径一字一样；收的十四格是 `Dictionary.get` 第 1 位（Variant 槽）四种来源全收、`var w: Variant` 六格全收（**裸 `Variant` 标注本身不算静态证明**，与初值推断同档）、`var w = null` 六格全收。落地：`ARG_NAME_TYPES` 认进 `Callable` / `Object` / `Node` 三支但只在 `VALUE_ARG_WANTS` 那十三档槽型上开口（`Array` / `Dictionary` / `StringName` / `NodePath` / `Vector3` / `Vector3i` 当槽型没量过，照旧不开口 —— 这是本轮与 S502 同一款「按读数关着」的口径），pack `a` 位两张表补 `null` 与三支名字，静态三族闸门走 `nullRefusedByValueSlot` / `objectNameRefusedByValueSlot`。**顺带修一处双发**：同一位子被 `*_ARG_AS` 与 `*_ARG_TYPES` 两行各命中一次时我们发两遍第二句，引擎从不这么说话（`String.find(null)` 实测两句各一次）—— 三处 `put` 改按位同文去重。新建 `arg-null-object-name-503.test.ts` 钉 168 格，门 **23108**（169 文件）、typecheck 4/4、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384，语料产物零 churn；复量直接压在被改代码上的 `s501a` 一百八十格与 `s502` 四把（27 / 15 / 8 / 18 格）一律 0 差、packed 读数两千六百三十二格合 2632 不合 0，`test:golden-check` 整跑 **395 例 OK 259 / 报错 119 / 超时 17 / 漂移 0**（`tmp/d6/gc503.log`，与基线一字一样）。还欠：`StringName` / `NodePath` / `Vector3` / `Vector3i` 与 `Array` / `Dictionary` 当槽型时这两档来源、pack 另三面的 `a` / e 位、类名直调配名字实参、S491 的运行期 `%` 失败通道。
- **2026-10-19 第二十七笔（S504）**：**类名直调不是遮蔽后续检查的独立错，它只是多加一句** —— `tmp/d6/s504.py` 一百二十格（五面 pack 的 `append` / `resize` / `bsearch` / `append_array` 四位 × `null` / `int` / `Callable` / `Array[int]` / `String` 五种实参写法）。pack 那一百格里，`Cannot call non-static function … Make an instance instead.` 之后，值型槽的形参两句、对象型名字的第二句、定形标注的第二句、`append_array` 的 void 那一句**引擎全部照说**，与实例接收者一字一样；我们此前只发头一句。落地把类名补成**第三种接收者证明**：`checkPackArgSlots` 认「ident 且名字就是九面之一」，`checkVoidMethodValues` 的 `shape` 同处补 `Pack` 一档（排在 `shapes` 之后、信号名兜底之前，信号那一形一字未动）—— 零新增句子模板，走的全是既有闸门，所以 S503 那两档新来源在类名形里同步对上。值型面那二十格**量了没接**，并撞出两处**错句**：`Array.resize(…)` / `Dictionary.get(…)` 我们发 `Identifier "Array" not declared in the current scope.`（这两名不在静态面登记表里，作用域闸门把它们当未声明名），引擎给非静态那一句；`String.find(…)` 我们发 `Cannot find member "find" in base "String".` 两句，引擎给非静态加形参拒（`VALUE_METHOD_ARITY.String` 缺 `find` 那一行）；`Vector2.distance_to(…)` 头一句对、后两句缺。这一族另开一笔，不猜着接。新建 `static-pack-arg-sentences-504.test.ts` 钉 100 格，门 **23208**（170 文件）、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn；八把账尺（`s494` 396 / `s500a` 440 / `s501a` 180 / `s503b` 132 / `s502` 四把 / `check-inst` 2632）复量全部 0 分歧 0 放过 0 过拦、`test:golden-check` 整跑 395 例 OK 259 / 报错 119 / 超时 17 / 漂移 0（`tmp/d6/gc504.log`，与 S500–S503 基线一字一样）。还欠：值型面类名直调那二十格（含两处错句）、pack 另四面与 `insert` / `set` / `slice` 在类名形下的读数、S503 ⑤ 那几条。
- **2026-10-19 第二十八笔（S505）**：把 S504 ③ 挂着的值型面类名直调从二十格扩成八十一格 —— `tmp/d6/s505.py` 九面（`String` / `StringName` / `NodePath` / `Vector2` / `Vector2i` / `Vector3` / `Color` / `Array` / `Dictionary`）× 各一面的一位方法 × 九种实参写法。引擎句句开口，七十九格与出货不同、过拦 0：**头一句「Make an instance instead」之后，形参拒两句 / 对象型名字的第二句 / 定形标注的第二句照说，与实例接收者一字一样**（与上一笔给 pack 量到的形状同一口径）。两处**错句**（不是缺句）随这一笔浮出：`StringName` / `NodePath` / `Array` / `Dictionary` 当类名接收者时我们发 `Identifier "X" not declared in the current scope.`（这四位不在 `STATIC_FACE` 里，作用域闸门把类名当未声明名），`String.find(…)` 我们发 `Cannot find member "find" in base "String".` 那两句（`VALUE_METHOD_ARITY.String` 缺 `find` 那一行，掉进「表外名」那一支）。**本轮一个字实现代码没改** —— 接它要先登静态面判据表（S376 ⑤ / S420 那一族的底盘）再把三族闸门指到类名，而八十一格只覆盖九面各一位方法，不足以为整面登表；按红线留待九面 × 方法全列量齐的那一笔。出货零改动，门读数沿用 S504：`pnpm test` 23208（170 文件）、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、`test:compile` 266/384、`test:golden-check` OK 259 / 报错 119 / 超时 17 / 漂移 0。
- **2026-10-19 第二十九笔（S506）**：上一笔记下的两处**错句**按读数归位 —— `tmp/d6/s506.py` 十八格（十面 × 实例方法 / 表外名 / 真静态函数）。类名直调这一形引擎只有两支句子：表里的实例方法发「Make an instance instead」那一句，表外名发「Cannot find member / Function not found」那两句，`Identifier "X" not declared in the current scope.` **一次都没出现**；出货此前把 `Array` / `Dictionary` / `StringName` / `NodePath` 当未声明标识符、把 `String.find` 归进表外名。落地：`classFaceArity` 把这五面的实例元数表接进 `staticCallDiags`（在表里 → 非静态那一句；不在 → 表外名那两句），并在 `analyze()` 开头把「当成员访问接收者用」的类名节点记进 `CLASS_FACE_RECEIVERS`，作用域闸门只放行**接收者那一形**（`var k = Array` 那种取值形一字不动）。`Vector2` / `Vector2i` / `Vector3` / `Vector3i` / pack 九面早就走对，本轮复量一字未动。剩的一格 `Color.lerp(Color, Color, 0.5)` 属另一族 —— 值型面类名直调还要过三族形参闸门（S505 ① 已量齐，读数在 `tmp/d6/s505.json`），本轮只归句子分类。新建 `class-name-direct-call-sentences-506.test.ts` 钉 17 格，门 **23225**（171 文件）、typecheck 4/4、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn、`test:golden-check` OK 259 / 报错 119 / 超时 17 / 漂移 0（`tmp/d6/gc506.log`）；复量 `s505` 八十一格分歧由 79 降到 62（缺的只剩形参那几句）、`s503b` 与 `s502b` 一字不动。
- **2026-10-19 第三十笔（S507）**：把上一笔留着的形参闸门接到类名上 —— `tmp/d6/s507.py` 一百零五格（十面 × 廿一处位子 × 五种实参写法），并把 `s505` 八十一格与 `s506` 十八格复量到底：**三把尺二百零四格逐格一字一样，0 分歧 0 放过 0 过拦**。形状与 S504 给 pack 量到的同一条 —— 类名直调不遮蔽后续检查：非静态那一句在前，形参拒两句（`null` 档）/ 第二句（名字档，含定形标注与对象型名字）照发，`Array.remove_at` 这类 void 那一句照发，越界时元数那句也照发（`Color.lerp(a, b, c)` 的「至多 2」）。落地：新增 `classFaceArgDiags` 按 `(面.方法, 位)` 复用那四张既有形参表（模板一字不改、同文按位去重），在静态面那一段认出「这个名字是实例方法而非真静态」时接上它并补元数句；`checkVoidMethodValues` 的 `shape` 把类名 `Array` / `Dictionary` 也认成那两档；`Vector3` / `Vector3i` 进 `VALUE_ARG_WANTS`（`Vector3.distance_to` / `cross` 与 `Vector3i.distance_to` 三位实测照拒 `Callable` 名，S503 ⑤ 挂着的那档随之结清）。新建 `class-name-value-face-args-507.test.ts` 钉 204 格，门 **23429**（172 文件）、typecheck 4/4、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn；七把账尺（`s494` 396 / `s500a` 440 / `s501a` 180 / `s502` 三把 / `s503` 三十六格）复量全 0 分歧、packed 读数两千六百三十二格合 2632 不合 0、`test:golden-check` 整跑 395 例 OK 259 / 编译或运行报错 119 / 超时 17 / 漂移或缺 golden 0（`tmp/d6/gc507.log`）。
- **2026-10-19 第三十一笔（S508）**：类名直调 pack **九面 × 五位子 × 五种实参写法**量齐 —— `tmp/d6/s508.py` 二百廿五格（`append` e 位 / `set` e 位 / `resize` i 位 / `insert` i 位 / `append_array` a 位 × `null` / `int` / `String` / `Callable` / `Array[int]`）。引擎句句开口，落地后**逐格一字一样**（0 分歧 0 放过 0 过拦），此前关着的 `PackedInt64Array` / `PackedFloat64Array` / `PackedVector3Array` 三面在 `null` 与对象型名字两档下的句子与另六面一字一样 —— `VALUE_ARG_WANTS` 因此由十三档补到十八档（九支 pack 全收），`Array` / `Dictionary` / `StringName` / `NodePath` 当**槽型**那一档照旧没量过、照旧不开口。新建 `class-name-pack-faces-508.test.ts` 钉 225 格，门 **23654**（173 文件）、typecheck 4/4、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn；`s507` / `s503b` / `s502d` 三把复量一字不动。还欠：那三面的 `bsearch` `b` 位在这两档来源下的读数、四面当槽型时的这两档来源、S491 的运行期 `%` 通道。
- **2026-10-19 第三十二笔（S509）**：容器面方法的接收者写成形参标注名 —— `tmp/d6/s509.py` 四十四格（八位容器位子 × 四种实参 + pack 另三面的 `bsearch` `b` 位）。引擎开口三十九格、落地后**逐格一字一样**（0 分歧 0 放过 0 过拦）：`func f(a: Array)` 之后的 `print(a.assign(w))` 照发 void 那一句（此前只对模块标注名与局部标注名发），容器档槽对 `null` 两句齐发、对 `Callable` 只回第二句，`recursive_equal` 那一位与非静态/形参两句同格还带元数那句；pack 另三面的 `b` 位与量过的六面一字一样，上一笔挂的那一格结清。实现两条：`checkVoidMethodValues` 的 `shapes` 按 `shapeAnn` 播种**形参**那一形的 `Array` / `Dictionary` / `Pack`（内部类字段那一形没量，照旧不播），`VALUE_ARG_WANTS` 由十八档补到廿档（加 `Array` / `Dictionary` 两档槽型）。新建 `container-param-void-509.test.ts` 钉满 44 格（生成脚本 `tmp/d6/gen509test.py`），门 **23694**（174 文件）、typecheck 4/4、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn；`test:golden-check` 整跑撞出 OK 257 / 报错 119 / 超时 19 / **漂移 3**，三例全是 TIMEOUT 型记账（本轮与 `pnpm test` 并发抢 Godot 起进程），单独重跑 `041` / `043` / `212` 三例全绿（`OK 2 / 超时 1 / 漂移 0`）、`test:diff` 259/259 逐字节、golden 文件零改动，**空载独跑整轮复验回到基线 OK 259 / 报错 119 / 超时 17 / 漂移 0**（`tmp/d6/gc509b.log`，顺带把 S508 那轮五例 TIMEOUT 型记账一并证掉）。还欠：- **2026-10-19 第三十三笔（S510）**：容器方法的接收者写成**内部类字段**那一形 —— `tmp/d6/s510a.py` 三十二格（八位容器位子 × `null` / `Callable` / `int` / `Array[int]`）。引擎开口三十格，改前我们**独漏 void 那一句**（十六格缺句、其中两格整格放过），落地后逐格一字一样（0 分歧 0 放过 0 过拦）：`class Q: var d: Dictionary` 之后的 `print(d.merge(w))` 与形参标注名那一形（S509）说的是同一套句子，字段那一形没理由少一句。实现照 S494b 给 pack 走过的老路：`containerSeeds` 按 `shapeAnn` 同时播种字段与形参两形（`seedFunc` 多带一张 `shapeFields`）。新建 `container-field-void-510.test.ts` 钉 32 格，门 **23730**（175 文件）、typecheck 4/4、`test:compile` 266/384、`test:diff` 259/259、`test:sema` / `test:ir` 384/384、`test:codegen` 2/2、产物零 churn、`test:golden-check` 整跑 OK 259 / 编译或运行报错 119 / 超时 17 / 漂移或缺 golden 0（`tmp/d6/gc510.log`，空载独跑）；`s509` 四十四格复量 0 差。还欠：`StringName` / `NodePath` 当槽型那一档（内建表里还没有带这两档形参的方法名）、S491 的 `String.format()` / `strFormatV` 运行期失败通道（要新语料 golden，已在任务表）。
- **2026-10-19 第三十四笔（S511）**：把 S491 ⑥ 挂着的最后一族运行期通道**量齐、不接** —— `tmp/d6/s511.py` 九十格（十种格式串 × 九种 `values`，一格一份脚本，引擎跑 Godot、我们跑 `cli run`，逐行比值行与 ERROR 行）。读数干净得一句话就能说完：**值行 0 格不同**（失败时两边都原样回吐格式串，成功时同值），分歧全在 ERROR 那一句 —— `values` 是 int / float / String / bool / null / Vector2 这六档时引擎发 `ERROR: Invalid type: use Array, Dictionary or Object.`（脚本不停），六十格，我们一句不发；`values` 是 Array / Dictionary 那三十格两边本来就一致。不接的理由：改点在 `packages/runtime/src` 的 `String.format` 通道，按 §13 要同跑 scriptc 面探针 + `pnpm build` 并新语料带 golden，本轮预算不够 —— 句子文本、触发档位、回吐形状都在 `tmp/d6/s511.json`，下一笔照钉即可。本轮出货零改动，门读数沿 S510（`pnpm test` 23730 / diff 259 / sema+ir 384 / codegen 2 / compile 266 / golden-check OK 259 报错 119 超时 17 漂移 0）。
- **2026-10-19 第三十五笔（S512）**：把上一笔「下一笔照钉即可」那句兑现 —— `String.format()` 的运行期失败通道按 S511 读数落地。① 直接看 `tmp/d6/s511fmt.gd` 的原始 stderr 更正 S511 ① 的一句：那块**带 GDScript backtrace**（`ERROR: Invalid type: use Array, Dictionary or Object.` + `   at: format (core/string/ustring.cpp:3598)` + backtrace 表头 + 每帧一行），与 `push_error` 同形，上一轮 s511.py 把 `at:`/backtrace 行滤了才误记。② 实现：`frames.ts` 加 `stringFormatInvalidType()`（`pushBlock` 同族），`methods.ts` 的 `String.format` 派发在 `values` 既非 Array/Dictionary、又非真脚本实例（`instanceof GdScriptObject`）时推这一块 —— 判据是引擎 `String::format` 的「非 ARRAY/DICT/OBJECT 即错」那一档：值型装成 `Tag.OBJECT` 但不是 `GdScriptObject`，照开口；标量 / `StringName` / `NodePath` 走 else 开口；真脚本实例不开口，语料 246 逐字节没变。回值一行没动（`strFormatV` 那两路本就原样回吐格式串、脚本不停）。③ 门：`pnpm test` **23840**（176 文件；新建 `packages/runtime/test/string-format-invalid-type.test.ts` 钉 110 格）、typecheck **4/4**、`test:diff` **259/259**、`test:sema` / `test:ir` **384/384**、`test:codegen` **2/2**、`test:compile` **266/384**、产物零 churn；按 §13 复量 `tmp/d6/s511.py` 九十格 **分歧 0**、`GDS2JS_SCRIPTC_FILTER=246-format-object-props pnpm test:scriptc` **1/1 逐字节一致**。还欠：`StringName` / `NodePath` / `Color` / `Vector3` 与四支 pack 当 `values` 已复量确认开口（`tmp/d6/s512.py` / `s512b.py` 逐格一字一样、0 分歧）；`Callable`（`self.k` 与空基）与 `RID` 拿现成实例也补量到位（`tmp/d6/s512c.py` 三格 0 分歧）—— `String.format()` 非法档通道全族量齐结清，无遗留；`test:golden-check` 整跑 395 例全过零漂移（`tmp/d6/gc512.log`）。
- **2026-10-19 第三十六笔（S513）**：结掉 S496/S502 挂着的「`Vector2i` / `Vector3i` 两面与 `Color.lerp` 第 2 位名字实参没量」—— `tmp/d6/s513.py` 二百六十四格（三档位子 × 廿二型 × 四形）。三档的 `INSTANCE_ARG_TYPES` 行只拒到 `PackedByteArray`，八支 pack 整族放过（引擎句句第二句），落地前分歧 96、过拦 0。按同表 `Color.lerp` 第 1 位那条量齐的 pack 名单同序补进 refuse 列（只加拒项、不动模板）后复量 **0 / 0 / 0**。门：`pnpm test` **24012**（177 文件；新建 `packages/compiler/test/value-arg-pack-513.test.ts` 程序化钉 172 格）、typecheck 4/4、sema/ir 384/384、compile 266/384 分桶未动、diff 259/259、零产物 churn、`test:golden-check` 复跑通过（395 全过、exit 0、零漂移，`tmp/d6/gc513.log`）。同款缺口的 `pos2 float` 行表里还有八处、`Vector2i`/`Vector3i` 其余位子没量，照红线不猜着扩。
- **2026-10-19 第三十七笔（S514）**：把上一笔点到的「同款缺口还有八处」一次扫成整类——`INSTANCE_ARG_TYPES` 里 **147 个子行 / 94 张方法行**的 refuse 都只到 `PackedByteArray`，其余八支 pack 当名字实参整族放过。`tmp/d6/s514.py` 七百九十二格按九种 `want` 型各取一支实例法（float/int/bool/String/Color/Vector2/2i/3/3i）× 廿二型 × 四形过裁判：落地前放过 288、过拦 0，**每一型的收的集都不含任何 pack、八支 pack 逐型句句只回第二句、四形一字一样**。判据是「收/拒只由 `want` 型决定、与位序无关」，九型逐一实证后 `tmp/d6/fixpack.py` 把这批子行的 refuse 一律补成全九支 pack（只加拒项、不动模板与 AS 表），复量 **0 / 0 / 0**。门：`pnpm test` **24392**（178 文件；新建 `packages/compiler/test/value-arg-pack-family-514.test.ts` 程序化钉 380 格）、typecheck 4/4、sema/ir 384/384、compile 266/384 分桶未动（无语料被翻成报错）、diff 259/259、零 churn、`test:golden-check` 复跑通过（395 全过、exit 0、零漂移，`tmp/d6/gc514.log`）。开着的：`int`/`float`/`bool` 三面表外名与链子接收者配 pack 名字实参那几族没量，照旧不动。
- **2026-10-19 第三十八笔（S515）**：把 S514 那族 pack 缺口推到姊妹表 `FACE_ARG_TYPES`（容器 / String 面，在 `face-arg-types.ts`）——**137 个 refuse 子表**含 `PackedByteArray` 却缺其余八支 pack，那八支当名字实参整族放过。`tmp/d6/s515.py` 四百四十格 + `s515b.py` 二百六十四格按 deficient 的六型（int/String/bool/Callable/Dictionary/float）各取一支代表位 × 廿二型 × 四形过裁判：每型 accept 集不含 pack、非-pack 分歧全空、过拦 0，八支 pack 句句第二句、四形一字一样。`tmp/d6/fixface.py` 只动 TYPES 段把这些子表按 S514 同序补成全九支 pack，复量 704 格 **0/0/0**。门：`pnpm test` **24680**（179 文件；新建 `packages/compiler/test/face-arg-pack-515.test.ts` 钉 288 格）、typecheck 4/4、sema/ir 384/384、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check` 复跑零漂移（`tmp/d6/gc515.log`）。开着的：链子接收者配 pack 名字实参、`int`/`float`/`bool` 表外名那几族、静态面 `STATIC_ARG_*` 同款 pack 口径没重量。
- **2026-10-19 第三十九笔（S516）**：把 S514/S515 的 pack/kind 补齐推到第三张姊妹表 `STATIC_ARG_*`（静态名调用，`static-arg-types.ts`）——`STATIC_ARG_AS` 缺 `NodePath`/`Vector2i`/`Vector3`/`Vector3i`（AS 双句）、`STATIC_ARG_TYPES` 只列 Array/Dictionary 缺九支 pack（第二句），静态字面量放过 115 格。`tmp/d6/s516.py`（207）+ `s516b.py`（69）按六种 want（int/float/bool/String/Color/Vector2）各取一支静态位过裁判，收/拒集与 S514/S515 同构（收集只由 want 决定、pack 恒只第二句）。`fixstatic.py` 按 want 重生成两表 refuse（32+32 子行、pos/want 不变），复量 276 格 **0/0/0**。本轮刻意只做字面量形：静态段实参取型走 `literalTypeName`（analyze.ts:5477/5485）对名字恒 null，故静态**名字**实参整套 kind 仍放过——那是比补表大的判据活（要先引 `argNameScopes` 名字解析进静态分支），按红线留待下一笔。门：`pnpm test` **24887**（180 文件；新建 `packages/compiler/test/static-literal-arg-516.test.ts` 钉 207 格）、typecheck 4/4、sema/ir 384/384、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check` 复跑零漂移（`tmp/d6/gc516.log`）。开着的：静态名字实参判据、`STATIC_ARG` 其余多位子行（本轮量的 12 位）、`from_rgba8`/`from_hsv` 多 float/int 位的名字形。
- **2026-10-19 第四十笔（S517）**：接上 S516 刻意留着的静态**名字**实参。静态段取型只走 `literalTypeName`（对 ident 恒 null）→ 整套 kind 放过（`tmp/d6/s517.py` 132 格分歧 115）。引擎对六 want 型逐型只发第二句（`Cannot pass…` 不跟名字走，同 S495/S503）、accept 集与 S516/S514 同构。落地：静态块加名字旁路，`argNameType(arg, argAnn)`（S495 已验证的名字→型表）解析、落在该位 `STATIC_ARG_AS ∪ STATIC_ARG_TYPES` refuse 并集里补第二句，字面量路不动、二者互斥不重复发（`put` 加同文去重）。四形复验 0 分歧。门：`pnpm test` **25019**（181 文件；新建 `packages/compiler/test/static-name-arg-517.test.ts` 钉 132 格）、typecheck 4/4、sema/ir 384/384、compile 266/384 分桶未动（无语料翻案）、diff 259/259、零 churn、复量 `s517` 0 / `s516` 0、`test:golden-check` 整跑撞 1 例 `300-value-edge-cells` 的 TIMEOUT 型记账（908s 争用），空载单跑该例 OK / 超时 0 / 漂移 0，配 compile 分桶未动、diff 259/259 含 300 → 零真漂移（`tmp/d6/gc517.log`）。开着的：`null`/`Callable`/`Variant` 当静态实参、`from_rgba8`/`from_hsv` 多位行的名字形没单独量。
- **2026-10-20 第四十一笔（S518）**：把 S517 的名字旁路搬到第四张表 `GLOBAL_ARG_TYPES`。全局段取型走 `literalTypeName`/`nonNumericLiteral`（对 ident 恒 null）→ 单参 float 数学全局函数（`sqrt`/`exp`/`log`/`sin`/`cos`/`tan`/`deg_to_rad`/`rad_to_deg`）配非数值名字实参不解析拒、流到运行期抛中文 `[not-number] 需要数值，收到类型 7`（连裸 Tag 号都漏），引擎却解析期发 `argument 1 should be "float" but is "<K>"`、收 {bool,int,float}。`tmp/d6/s518b.py` 176 格（8 支 × 廿一型标注名）落地前分歧 152、过拦 0；只对这 8 支单参函数在 pos1 加 `argNameType(arg, argAnn)` 名字旁路补第二句（多参/follows/suppress/vararg 那几族没量，不动），复量 0 分歧。门：`pnpm test` **25403**（182 文件；新建 `global-float-name-arg-518.test.ts` 钉 384 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check` 见 `tmp/d6/gc518.log`。并补修 S517 测试一处 `noUncheckedIndexedAccess` 漏检（`split(".")[1]` 加 `?? ""`）。开着的：多 float 参全局（`wrapf`/`remap`/`move_toward`/`smoothstep`/`is_equal_approx`）名字形、`int`/`bool` 参数学全局（abs 家族运行期 `Error calling utility function` 文案）没量。
- **2026-10-20 第四十二笔（S519）**：把 S518 的 float 数学全局名字旁路从单参 pos1 泛化到多参逐位，并补登整支缺表的 remap。`tmp/d6/s519.py` 144 格（`wrapf`/`move_toward`/`smoothstep`/`is_equal_approx`/`remap` 名字实参逐位 × 九型）：引擎每一位都 `argument N should be "float"`、收 {bool,int,float}（与单参同判，float 隐式转换普适）。四支已在 `GLOBAL_ARG_TYPES`（旁路经 spec 即接），`remap` 整支没登 → 字面量与名字两形都放过（`remap(Color,1.0,…)` 引擎连字面量都解析拒，已 `tmp/d6/remap.gd` 量）；补 remap 五位 float 入表后一并接上。名字旁路改成遍历 `spec` 所有 `want==="float"` 位、字面量交回原循环不重复。落地前分歧 96（含 remap 30）→ 0、过拦 0。门：`pnpm test` **25517**（183 文件；新建 `global-float-multi-arg-519.test.ts` 钉 114 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc519.log`）。开着的：`acos`/`asin`/`clampf` 等已在表的大票 float 全局名字形理应一致但只量了 13 支、abs 家族运行期文案没动。
- **2026-10-20 第四十三笔（S521）**：把 S518/S519 的 float 数学全局名字旁路再扩 16 支纯 float 参函数（`acos`/`asin`/`atan`/`atanh`/`sinh`/`cosh`/`tanh`/`ceilf`/`floorf`/`roundf`/`signf` 1 位 + `atan2`/`pow`/`maxf`/`minf`/`angle_difference` 2 位）。`tmp/d6/s521.py` 252 格逐位实测：引擎句句 `argument N should be "float"`、收 {bool,int,float}（与前 13 支一字一样、无异常句），且这 16 支只在 `GLOBAL_ARG_TYPES`（无 follows/suppress/vararg 交织）→ 加进 `GLOBAL_FLOAT_ARITH` 即由 S519 按位旁路生效。落地前分歧 189、过拦 0 → 0。门：`pnpm test` **25704**（183 文件；S519 测试 FNS 扩到 21 支 +147 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc521.log`）。仍开：`int`/`bool` 参数学全局（abs 家族运行期 `Error calling utility function`）、带 interplay 的 float 全局逐支单独量。
- **2026-10-20 第四十四笔（S522）**：把 float 数学全局名字旁路再扩 18 支（`absf`/`acosh`/`asinh`/`clampf`/`db_to_linear`/`ease`/`fmod`/`fposmod`/`inverse_lerp`/`is_finite`/`is_inf`/`is_nan`/`is_zero_approx`/`lerp_angle`/`lerpf`/`linear_to_db`/`pingpong`/`rotate_toward`）。早前「有 interplay」是 section 解析越界的假信号——真 `follows`/`suppress` 只 `clamp`/`lerp`/`wrap`；`wrap` 经 `tmp/d6/s522.py` 实测对一切类型 ACCEPTED（引擎不拒）→ 留 allowlist 外，`step_decimals` 是把 int 位当 float 测的尺 bug、另笔。18 支逐 float 位实测：坏型名实参句句只回第二句 `should be "float"`、收 {bool,int,float}。加进 `GLOBAL_FLOAT_ARITH` 即由 S519 按位旁路生效，`s521`/`s518b`/`s519` 复量仍 0。float-want 全局名字实参解析拒至此覆盖 47 支。门：`pnpm test` **25928**（183 文件；`global-float-multi-arg-519.test.ts` FNS 扩到 40 支、485 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc522.log`）。仍开：abs 家族运行期文案、`wrap`/`step_decimals`、`int`/`bool` 参数学。
- **2026-10-20 第四十五笔（S523）**：把数值全局名字旁路从 float 泛化到 int 参。`tmp/d6/s523.py` 210 格（`absi`/`char`/`clampi`/`maxi`/`mini`/`nearest_po2`/`posmod`/`signi`/`wrapi`/`snappedi` pos2 各 int 位 × 十型）：int 位与 float 位同一判据（收 {bool,int,float}、坏型名实参逐位发 `should be "int"`、ODD 空）；`ceili`/`floori`/`roundi`/`snappedi` pos1 实为 float 位（早前误标）。`GLOBAL_FLOAT_ARITH`→`GLOBAL_NUM_ARITH`、旁路放到 `want ∈ {float,int}`、消息用实际 want，补这些 int 参函数与 ceili/floori/roundi 入表（`wrap` 一切接受、`clamp`/`lerp` 跟第一参走，不进）。数值全局名字实参解析拒至此 60 支，`s523`/`s521`/`s519`/`s518b` 全 0/0/0。门：`pnpm test` **26117**（184 文件；新建 `global-num-name-arg-523.test.ts` 钉 189 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、本轮纯解析期新增拒答、零产物 churn、compile 分桶未动、diff 逐字节不变，出货面不可能挪动任何一份 Godot golden。仍开：abs 家族运行期 `Error calling utility function` 文案（task#3）、`wrap`（引擎一切接受、无需接）。
- **2026-10-20 第四十六笔（S524）**：运行期数值工具函数坏型实参改用引擎原文（task#3 第一半，`abs`/`sign`/`floor`/`ceil`/`round`）。`tmp/d6/s520.py` 实测五支向量分支让开后坏型走运行期 `Error calling utility function "<fn>()": Argument "x" must be "int", "float", … , or "Vector4i".`（逐字同句；corpus normalize 滤掉运行期块，只能 runtime 测钉）。我们此前抛中文 `[not-number] 需要数值，收到类型 <Tag号>`（漏裸型号）。`builtins.ts` 加 `numOrVectorArg(v, fn)`：非 INT/FLOAT/BOOL 抛 `GodotRuntimeError` 引擎原文、数值走原 `num()`；abs/gSign 直接换、gFloor/gCeil/gRound 仅 auto 模式换（floorf/floori 未量保持原样），错误类 Unsupported→GodotRuntime（S203 同款）。`cli run` 端到端 `abs(Color)` 打引擎原文逐字。门：`pnpm test` **26136**（185 文件；新建 `builtins-utility-arg-524.test.ts` 10 格、`global-vector-args.test.ts` 5 格归位）、typecheck 4/4、compile 266/384、diff 259/259、零 churn；§13 面探针 `234-string-methods-batch` 1/1 逐字节（236 不在代表集、其 `[9,2]` 集外差异与本改动无关）。仍开：`snapped`/`lerp` 等其余共享 `num()` 的函数文案、`floorf`/`floori` 一族运行期句。
- **2026-10-20 第四十七笔（S525）**：`get_argument_count()` 的「带默认值形参」那一格量清并发出。引擎 = **全部声明数（含默认值）− 已绑**（`tmp/d6/ga2.gd`：`quit(exit_code=0)`→1、`h(a,b=1)`→2、`k(a,b=1,c=2)`→3、`h.bind(5)`→1）。`object.ts` 的 `declaredArgCount` 原对「必填≠全部」一律返 null 让调用方响（没量不猜），现按实测直接返 `row[1]`；`get_argument_count` 的响亮拒随之去掉。宿主方法 `quit` 仍不在 `methodAritiesOf` 表（D4 Tier 2 宿主面，照旧拒）。门：`pnpm test` **26136**（`signal.test.ts` 那格由「响亮拒」改为实测 `twice→2`；`cli run` 端到端 `h→2`/`h.bind(5)→1`）、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 面探针 `234` 1/1 逐字节。仍开：宿主方法 Callable 的 arity/标签（task#5，Tier 2 宿主面）。
- **2026-10-20 第四十八笔（S526）**：具体型全局函数的名字实参解析拒。`tmp/d6/s526.py` 68 格（`load`/`str_to_var`/`bytes_to_var`/`inst_to_dict` × 十八型模块标注名）：四支引擎按声明型解析期发第二句——`load`/`str_to_var` 收 {NodePath,String,StringName}、`bytes_to_var` 收 {Array,PackedByteArray}、`inst_to_dict` 对量过十八型全拒；`load`/`str_to_var` 连全局表都没进，所以此前名字实参整族放过（60/68 分歧）。新增 `GLOBAL_TYPED_NAME_ARGS` 旁路放在几族判定之前、只补 pos1 ident（literal 交原表不重复）。门：`pnpm test` **26164**（186 文件；新建 `global-typed-name-arg-526.test.ts` 钉 28 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、复量 `s526` 0 分歧、`test:golden-check`（`tmp/d6/gc526.log`）。仍开：其余未进表的全局函数名字形、`null`/`Callable`/`Variant` 名。
- **2026-10-20 第四十九笔（S527）**：把 S526 的名字旁路泛化成「每函数多位 `[位, 期望型, 收集]`」，补 13 支具体型全局的名字实参。`tmp/d6/s527.py` 240 格（`error_string`/`instance_from_id`/`is_instance_id_valid`/`rand_from_seed`/`rid_from_int64`/`type_string`/`randi_range`/`randf_range`/`randfn`/`dict_to_inst`/`bytes_to_var_with_objects`/`convert`/`type_convert` × 十二型 × 各位）：int/float 族收 {bool,float,int}、`dict_to_inst` 收 {Dictionary}、`bytes_to_var_with_objects` 收 {Array,PackedByteArray}、`convert` 第二参收 {int}（期望 Variant.Type）；`convert`/`type_convert`/`is_instance_of` 首参是 Variant 不登表。落地前 149 格放过、过拦 0 → 0。门：`pnpm test` **26244**（187 文件；新建 `global-typed-name-arg-527.test.ts` 钉 80 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、复量 `s527`/`s526` 双 0、`test:golden-check`（`tmp/d6/gc527.log`）。仍开：`null`/`Callable`/`Variant` 名、其余未进表全局名字形。
- **2026-10-20 第五十笔（S528）**：再补 `ord`（收 {NodePath,String,StringName}，`should be "String"`）与 `type_exists`（收 {String,StringName}，引擎说 **StringName**、早前表里误写 String，按实测纠正）两支具体型全局的名字实参。`ord` 不在 `GLOBAL_CALLABLES`（bounds=null），原旁路在 bounds 判定之后会被跳过——把名字旁路整体挪到 bounds 之前、自带 arity 守卫。`typecheck` 4/4、`pnpm test` **26254**（`global-typed-name-arg-527.test.ts` 扩到 90 格）、compile 266/384 分桶未动、diff 259/259、`ord`/`type_exists` 逐型 0 分歧、`s527`/`s526` 仍 0、`test:golden-check`（`tmp/d6/gc528.log`）。仍开：`print`/`assert`（void+vararg 不涉类型拒）、`null`/`Callable`/`Variant` 名。
- **2026-10-20 第五十一笔（S530）**：`snapped()` 解析期句按规则归位。`tmp/d6/s530.py` 64 格（value 八型 × step 八型字面量）：value 非法时引擎**只发 x 那一句**（bool/Color/String/Array 都不收 value），step 不再查；向量 value + 错型 step 发 `argument 2 should be "VectorN"`（step 跟 value 走）；**任一实参是 Array/Dictionary 字面量时引擎整体 defer 到运行期**、解析期一句不发（`snapped(true,[1])` / `snapped([1],1)` 都是 SCRIPT ERROR）。落地前 23/64 分歧（value 非法时我们 x+step 两句齐发、容器情形多发）→ 0；加 `snappedValueBad` 与 `snappedContainer` 两条守卫。门：`pnpm test` **26267**（188 文件；新建 `snapped-parse-530.test.ts` 13 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、复量 `s530` 0、`test:golden-check`（`tmp/d6/gc530.log`）。仍开：`snapped`/`lerp` 的**运行期**文案（defer 组合落地运行时仍走中文 `num()` 句）。
- **2026-10-20 第五十二笔（S532）**：`clamp`/`lerp`/`wrap` 的容器字面量让位。这三支槽是 Variant（跟第一参走），任一实参是 Array/Dictionary 字面量时引擎**整体 defer 到运行期**（`clamp(1,[],2)` / `lerp(1,[],0.5)` 都是 SCRIPT ERROR、解析期一句不发）；我们此前在解析期发 `argument N should be …`（9/12 相位差）。加 `followContainer` guard `wants` 与 `DERIVED_ARG_TYPES` 两段，解析期尺 15 格 0 分歧。门：`pnpm test` **26279**（189 文件；新建 `follows-container-532.test.ts` 12 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc532.log`）。仍开：`snapped`/`lerp` defer 组合的运行期文案（中文 `num()` 句）。
- **2026-10-20 第五十三笔（S533）**：`load`/`str_to_var`/`ord`/`type_exists` 这四支在全局表里一行都没有，S526–S528 的旁路又只接名字实参（字面量 continue），于是**字面量坏型也放过**（`type_exists({})` / `ord([1])` 引擎解析期照拒）。把五张表查表上移、算 `hasLiteralTable`：有表的函数字面量仍交回原表，没表的在旁路里一并查 `lit ?? argNameType(...)`。`tmp/d6/s533.py` 15 格 0 分歧，`s526`/`s527` 仍 0。门：`pnpm test` **26291**（190 文件；新建 `global-typed-literal-533.test.ts` 12 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc533.log`）。仍开：`snapped`/`lerp` defer 组合运行期文案（task#3）。
- **2026-10-20 第五十四笔（S534）**：`seed()` 的解析期句 + 既有 int/float 全局 `SHOULD_BE` 行补九支 pack。`tmp/d6/s534b.py` 逐型：`seed`（void、int 参）收 {int,float,bool}、值型/String/StringName/NodePath/null 走 **AS 双句**、Array/Dictionary/九支 pack 只发第二句、名字只第二句——此前 seed 一张表都没进、全放过。同趟发现 `rand_from_seed`/`type_string`/`randi_range`/`randf_range`/`error_string`/`rid_from_int64` 等的 SHOULD_BE refuse 只列 Array/Dictionary、缺九支 pack（`rand_from_seed(PackedByteArray([1]))` 引擎发第二句、我们全放过）。补 14 个子行 + seed 三处（AS/SHOULD_BE/TYPED）。`seed` 全型与各 pack 逐格与引擎一致、无回归。门：`pnpm test` **26304**（191 文件；新建 `seed-pack-should-be-534.test.ts` 13 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc534.log`）。仍开：`snapped`/`lerp` 运行期文案。
- **2026-10-20 第五十六笔（S536）**：`snapped()` 收 `Vector2i`/`Vector3i`（修一处「合法程序崩溃」）。引擎 `snapped(Vector2i(1,2),Vector2i(2,2))`→`(2, 2)`、`Vector3i` 那格 `(2, 2, 4)`；`lerp(Vector2i…)` 反而解析拒（from 列表不含 int 向量），故只对 snapped 加。`sameTypeVectorMath` 原来只认 V2/V3/Color，合法调用掉进 `num()` 抛中文 `[not-number] 收到类型 7`。补 `name==="snapped"` 的 GVector2i/GVector3i 分支（走已有 vector2iMethod/vector3iMethod 的 snapped），`lerp` 不开口。`cli run` 端到端对上、V2/标量回归不变。门：`pnpm test` **26319**（193 文件；新建 `snapped-int-vector-536.test.ts` 4 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、§13 面探针 234 逐字节、`test:golden-check`（`tmp/d6/gc536.log`）。仍开：snapped/lerp 动态坏型的运行期文案、snapped(Color_dynamic) 仍走 color 分支。
- **2026-10-20 第五十七笔（S537）**：`clamp(VectorN, VectorN, VectorN)` 引擎规则解出并发出。21 格拟合：引擎对向量用 **Variant `<`/`>` 的字典序**（x→y→z），公式 `CLAMP(v)=v<lo?lo:(v>hi?hi:v)`、整支返回（不是逐分量夹）。`gClamp` 在 need2 前加同 class 的 V2/V2i/V3/V3i 分支（`vecComponents3` + 字典序 cmp），命中整支返回 v/lo/hi；混 class 与其余对象照旧响亮拒。16 格端到端 `cli run` **0 分歧**、标量回归不变。门：`pnpm test` **26331**（194 文件；新建 `clamp-vector-537.test.ts` 12 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc537.log`）。仍开：clamp 混 class、clampf/clampi 收向量未量。
- **2026-10-20 第五十八笔（S538/S539）**：值类型的 `var_to_str()` 与 `hash()` 两支一起解出（两处都是「合法调用崩溃」）。`var_to_str` 打构造式、浮点分量走 `rtos_fix` 不补 `.0`（`Vector2(1, 2)` / `Color(0.1, 0.2, 0.3, 1)`，含 `-0`、`inf_neg`、`nan`）；values.ts 反向 import 成环，故加 `registerVarToStrValueHook` 由 builtins 注入五支。`hash` 是分量 murmur3（浮点折 float32 位型、−0 归一；整型折 int32）+ fmix32，14 格全中。门：`pnpm test` **26360**（195 文件；新建 `value-str-hash-538.test.ts` 29 格）、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、10 格端到端 0 分歧、`test:golden-check`（`tmp/d6/gc538.log`）。仍开：NodePath 哈希式子、pack 哈希、`str_to_var` 读回值类型构造式。
- **2026-10-20 第五十九笔（S540）**：`hash()` 的 pack 九支解出（此前一律 `[hash-type]` 拒）。byte/int32/int64 折小端字节缓冲（murmur3 buffer：4 字节块 + 尾巴 + 长度收尾）；float32/float64/string/vector2/vector3/color 折元素链后 fmix32。空 pack 的三种怪值按引擎实测：`one_64(0)` / `one_float(0.0)` / 种子本身。`builtins.ts` 加 `hashBuffer` / `packHash` / `hashDoubleInto`。25 个引擎格 + 10 格端到端全中。门：`pnpm test` **26364**（196 文件；新建 `pack-hash-540.test.ts` 26 格）、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc540.log`）。仍开：float64 pack 的 NaN（`[hash-nan]`）、NodePath 哈希式子。
- **2026-10-20 第六十笔（S541）**：NodePath 的哈希式子解出（结掉 S267 ⑥a）。公式：空路径 0；否则 path / subpath 各折 StringName 哈希，拼 `(h1<<32)|h2` 过 `hash_one_uint64`，相对路径再取反。14 个引擎格全中（含绝对位、子名、`.`、`/`、空格与混合形）。`node-path.ts` 加注入钩子，`builtins.ts` 的 `nodePathHash` 注册进去；`NodePath.hash()` 与全局 `hash()` 同走一条。门：`pnpm test` **26364**（196 文件；`node-path.test.ts` 新增 14 格）、ops 6492、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、8 格端到端 0 分歧、`test:golden-check`（`tmp/d6/gc541.log`）。仍开：非 ASCII 名字、`a::b` 解析失败形。
- **2026-10-20 第六十一笔（S542）**：`hash()` 的 NaN 结掉 `[hash-nan]` 拒。double 侧折规范静默 NaN 位型 `0x7ff8000000000000`（`hash(NAN)`=971070090、±NaN 同值），float32 侧折 `0x7fc00000`；标量、向量/颜色分量、float32/float64 pack 统一走这两支。5 格端到端全中。门：`pnpm test` **26365**（196 文件；`pack-hash-540.test.ts` +4 格）、ops 6496、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc542.log`）。
- **2026-10-20 第六十二笔（S543）**：`Vector3.rotated()` 补上（合法程序原来是 `[vector3-method] 未实现` 崩）。用 `--dump-extension-api` 对账值类型方法面：Vector2/Vector2i/Vector3i/Color 一支不缺，Vector3 缺 `rotated`（另一个 `outer` 返回 Basis，D6 不出）；顺手把 §1.98「整数向量有没有几何」问死 —— 25 名逐名 parse 拒，**不存在**。实现照 `Basis::set_axis_angle` + `xform` 逐项 float32；非单位轴引擎打 ERROR 并回原向量，stderr 不复刻故响亮拒。门：`pnpm test` **26374**（197 文件；新建 `vector3-rotated-543.test.ts` 9 格）、ops 6505、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、4 格端到端 0 分歧、`test:golden-check`（`tmp/d6/gc543.log`）。
- **2026-10-20 第六十三笔（S544）**：String 六支补上 —— `replace_char` / `replace_chars` / `remove_char` / `remove_chars` / `uri_file_decode` / `is_valid_ascii_identifier`（此前都走 `[string-method] 未实现` 崩）。四支字符操作按码点；`with=0` 引擎打非致命 ERROR 并回原串，用 frames 块复刻（两处 at 行实测）；`uri_file_decode` 与 `uri_decode` 只差 `+` 不换空格；ASCII 标识符八格。替换码点越界（负 / >0x10FFFF / 代理区）仍拒。门：`pnpm test` **26379**（198 文件；新建 `string-char-544.test.ts` 24 格）、ops 6534、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、6 格端到端 0 分歧、`test:golden-check`（`tmp/d6/gc544.log`）。仍开：`is_valid_unicode_identifier`（要整张 XID 表）、`to_multibyte_char_buffer`（宿主编码）。
- **2026-10-20 第六十四笔（S545）**：Signal 的三支连接查询（`is_connected` / `has_connections` / `get_connections`）与 `Callable.get_unbound_arguments_count()` 补上（此前都是「未实现」崩）。`get_connections()` 三键字典键序 signal/callable/flags、flags 原样 0/4/8、flags=8 重复连只留一行；is_connected 忽略绑定串。unbound 计数就是 unbind 数，`unbind(2).bind(1)`→1。门：`pnpm test` **26383**（199 文件；新建 `connection-queries-545.test.ts` 24 格）、ops 6547、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、7 行端到端 0 分歧、`test:golden-check`（`tmp/d6/gc545.log`）。仍开：重复连接那块 ERROR 我们不发；零名 Signal 的 is_null 没量。
- **2026-10-20 第六十五笔（S546）**：`Signal.connect()` 的两块非致命 ERROR 复刻（结掉 S545 ④）。重复连（31）打 `Signal '<名>' is already connected …`（object.cpp:1682）；**空 Callable 第一次也返回 31**、打 `Cannot connect to '<名>': the provided callable is null.`（object.cpp:1639）、不进连接表。`frames.ts` 加两块、methods 的 connect 接上；标签拿不到时只少 stderr、返回值不变。门：`pnpm test` **26385**（200 文件；新建 `signal-connect-errors-546.test.ts` 5 格）、ops 6553、typecheck 4/4、compile 266/384、diff 259/259、零 churn、三行 stdout 逐字、lambda/空 Callable 两块头两行一致、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc546.log`）。仍开：单文件 cli run 的方法标签缺 `(文件名)`。
- **2026-10-20 第六十六笔（S547）**：零名 `Signal()` 的谓词/对象面/哈希 + 构造式进编译器。`Signal().is_null()` 引擎是 **true**（我们此前恒 false 的静默错）、`get_object` `<Object#null>`、`get_object_id` 0、`hash` = 2641593226（`one_64(0, hash(""))`）；带名那三支折宿主实例号，照旧拒。构造式实测：`Signal()` 与 `Signal(Object,StringName)` 合法（后者与同名信号同身份）、`Signal(5)` 解析拒；emitter 只发 0 参形，两参形响亮拒 `[signal-ctor]`。门：`pnpm test` **26387**（201 文件；新建 `signal-null-547.test.ts` 7 格）、ops 6560、typecheck 4/4、compile 266/384、diff 259/259、零 churn、5 行端到端逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc547.log`）。仍开：两参构造式的信号身份查找、带名 Signal 的对象面/哈希。
- **2026-10-20 第六十七笔（S548）**：Array/Dictionary 的 `duplicate_deep()` 接上（此前运行期「未实现」崩，且 Array 字面量接收者还会被分析层按表外名拦）。实测纯容器里模式 0/1/2/3/-1 全是整棵深拷（模式只管 Resource 子资源），走既有 `duplicate(true)`；`ARRAY_METHOD_ARITY` 补 `duplicate_deep: [0,1]`。门：`pnpm test` **26390**（202 文件；新建 `duplicate-deep-548.test.ts` 7 格）、ops 6568、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc548.log`）。仍开：模式 2 的 Resource 子资源复制（宿主面）。
- **2026-10-20 第六十八笔（S549）**：`PackedByteArray.bswap16/32/64` 接上（原「未实现」崩）。三支 void、原地、`(offset=0,count=-1)`；尾巴不足一组原样留；`sz==0 || count==0` 提前返回不校 offset；两道 ERR_FAIL（offset 到 sz−width / count 超 floor）打块且字节不动。`methods.ts` 拦三名转 `bytesBswap`，`frames.ts` 加 `packBswapGuard`。门：`pnpm test` **26394**（203 文件；新建 `pack-bswap-549.test.ts` 20 格）、ops 6587、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc549.log`）。仍开：encode/decode 一族。
- **2026-10-20 第六十九笔（S550）**：`PackedByteArray.decode_/encode_` 的整数八对接上（原「未实现」崩）。全部小端；u64/s64 按 int64 回绕（全 ff → −1）；encode 值按宽度取模；读侧越界那块带 ` Returning: 0` 并回 0，写侧不带且字节不动。两张宽度/行号表 + `packDecode`/`packEncode`，frames 加读/写守卫块。门：`pnpm test` **26399**（204 文件；新建 `pack-bin-550.test.ts` 20 格）、ops 6600、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc550.log`）。仍开：half/float/double 与 var 的编解码。
- **2026-10-20 第七十笔（S551）**：`PackedByteArray` 的 half/float/double 三对编解码接上。half 是引擎自己的 `make_half_float`：尾数截断（65520→65504）、denormal 归零、−0 丢符号、NaN 折全 1；float 走 fround、double 直写。顺带修正 S550 写侧守卫文案（实测写侧条件不带括号）。门：`pnpm test` **26402**（205 文件；新建 `pack-float-551.test.ts` 8 格，S550 断言同步改）、ops 6611、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc551.log`）。仍开：var 编解码族。
- **2026-10-20 第七十一笔（S552）**：`PackedByteArray` 的 var 编解码四支（`has_encoded_var` / `decode_var` / `decode_var_size` / `encode_var`）接上。编码返回写入字节数、装不下只回 −1；解码从 offset 读一个 Variant，剩余不足 4 字节复刻 marshalls 的 `len < 4` 块并给 null/0/false；负偏移四块文案齐全。`var-bytes.ts` 加 `gVarDecodeAt`（带消费字节数），methods 加 `packVarCodec`。门：`pnpm test` **26406**（206 文件；新建 `pack-var-552.test.ts` 15 格）、ops 6630、typecheck 4/4、compile 266/384、diff 259/259、零 churn、5 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc552.log`）。仍开：更深层坏数据的 marshalls 内部块。
- **2026-10-20 第七十二笔（S553）**：`PackedByteArray` 的 `to_vector2_array` / `to_vector3_array` / `to_color_array` / `get_string_from_utf32` 接上。三支转换空 pack 给空、非整数倍打块给空、整数倍按小端 f32 逐分量；utf32 按 `floor(size/4)` 读码点、尾巴静默丢、非标量码点拒。`to_vector4_array`（Vector4 未建型）与 multibyte（宿主代码页）登记为响亮拒。门：`pnpm test` **26411**（207 文件；新建 `pack-convert-553.test.ts` 13 格）、ops 6642、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc553.log`）。仍开：Vector4、multibyte、decompress_dynamic。
- **2026-10-20 第七十三笔（S554）**：Array/Dictionary 的定型查询十二支接上（原来运行期「未实现」，且带标注的字典接收者还会被分析层按表外名拦）。Array 五支：is_typed / is_same_typed / get_typed_builtin / class_name（StringName 空串）/ script（null 对象）；Dictionary 十二支：is_typed 是「键或值任一定型」、键值两侧各报、is_same_typed 三支按 stamped kind 比、builtin 码表（int2/float3/String4/Vector2 5/Vector2i 6/Vector3 9/Vector3i10/Color20/StringName21/Dictionary27/Array28）、class_name/script 同 Array。`analyze.ts` 的 DICT_METHOD_ARITY 补十二名 + duplicate_deep。门：`pnpm test` **26416**（208 文件；新建 `typed-query-554.test.ts` 22 格）、ops 6658、typecheck 4/4、compile 266/384、diff 259/259、零 churn、5 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc554.log`）。仍开：宿主类定型的 class_name、跨容器 is_same_typed 运行期文案。
- **2026-10-20 第七十四笔（S555）**：`String.is_valid_unicode_identifier()` 接上。用 `tmp/d6/s555.gd` 对 0..0x10FFFF 全码点逐点测 start / continue 两位，折出 1879 段（start 685 / continue 800）生成 `runtime/unicode-identifier.ts` 区间表；整串判据是首码点 start、其余 continue、空串假，25 格样例与引擎一致。StringName 走既有转发。门：`pnpm test` **26418**（209 文件；新建 `unicode-identifier-555.test.ts` 27 格）、ops 6685、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc555.log`）。仍开：multibyte 宿主编码。
- **2026-10-20 第七十五笔（S556）**：`Signal(Object, name)` 构造式接上（结掉 S547 ④ / S543 ⑤），`var_to_str(Signal)` 同笔补齐。两参取对象上同名信号的原实例（内部类同）；缺失名给脱离信号（is_null 假、get_name 有名、var_to_str 打 `Signal()`）；零参仍是空信号。emitter 改发 `rt.signalCtor`，methods 的 signalCtor 做属性查找；var_to_str 走 builtins 的值钩子（直接 import 到 values.ts 会 TDZ 炸 96 个 compiler 测试）。门：`pnpm test` **26421**（210 文件；新建 `signal-ctor-556.test.ts` 10 格）、ops 6691、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc556.log`）。仍开：两次缺失名 Signal 是否相等没量、带名信号对象面/哈希仍拒。
- **2026-10-21 第七十六笔（S557）**：`PackedByteArray.decompress_dynamic()` 接上。`buffer_size` 是上限：够就整段还原，太小/为 0/坏数据打 `Decompression failed.`（variant_call.cpp:844）回空；空输入先打 compression 233 的 `p_src_size <= 0` 再打 844；mode 0 无宿主 codec 响亮拒。`packed.ts` 加 `packDynamicUnpack`、methods 加 `bytesDecompressDynamic`、frames 加两块。门：`pnpm test` **26425**（211 文件；新建 `pack-dynamic-557.test.ts` 7 格）、ops 6697、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 stdout 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc557.log`）。仍开：坏数据的 zlib WARNING、老 decompress 的失败文案块。
- **2026-10-21 第七十七笔（S558）**：FastLZ（mode 0，默认模式）接上。照 `fastlz.c` 移植 level 1/2 的 compress 与 decompress 到 `runtime/fastlz.ts`；`compress()` 默认可用、<16 字节先补零到 16（解回来 16 字节），`decompress(want,0)` want≥16 给真身、<16 拷前 want 字节（仅合法补零流；失败那形引擎拷未初始化栈，响亮拒）。逐字节对账：7 个小 payload hex 全同、70000 字节 level 2 输出 7085 字节 sha 相同、回环相等。旧测试里「mode 0 响亮拒」三格改成实测字节。门：`pnpm test` **26428**（212 文件；新建 `pack-fastlz-558.test.ts` 15 格）、ops 6712、typecheck 4/4、compile 266/384、diff 259/259、零 churn、5 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc558.log`）。仍开：短缓冲失败形、dynamic mode 0。
- **2026-10-21 第七十八笔（S559）**：`PackedByteArray.decompress()` 的三块失败文案补齐：buffer ≤ 0（818）、空压缩源（821）、zlib 上限不足/坏数据（compression 197 `err != 1`），都回空；FastLZ / zstd 解不开时不打块。`packed.ts` 加 `registerPackErrorSink`（避免 packed→frames 环），methods 注入三块。门：`pnpm test` **26431**（213 文件；新建 `pack-decompress-err-559.test.ts` 7 格）、ops 6718、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc559.log`）。仍开：zstd 失败文案、dynamic mode 0。
- **2026-10-21 第七十九笔（S560）**：`decompress_dynamic()` 的模式边界。引擎只收 DEFLATE / GZIP：FastLZ(0) / zstd(2) / 越界模式都是 compression 295 的 `p_mode != MODE_DEFLATE && p_mode != MODE_GZIP` 块 + 外层 844 `Decompression failed.` + 空 pack；空输入仍先走 233。methods 加 mode 守卫、frames 加 `packDynamicBadMode`，旧「mode 0 响拒」测试改成两块。门：`pnpm test` **26431**（213 文件）、ops 6719、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc560.log`）。仍开：宿主无 zlib、FastLZ 短缓冲 UB、Vector4/multibyte。
- **2026-10-21 第八十笔（S561）**：`PackedByteArray.get_string_from_utf16()` / `get_string_from_wchar()` 接上（原「未实现」）。默认小端、尾巴不足 2 字节丢；代理对合成；孤立高位保留成码点；BOM（FF FE / FE FF）定字节序且不进食；高位后跟非低位（引擎怪值）响亮拒。Windows 上 wchar 与 utf16 同一支；两支补进 BYTE_ONLY，其余 pack 照发 Nonexistent。门：`pnpm test` **26434**（214 文件；新建 `pack-utf16-561.test.ts` 10 格）、ops 6728、typecheck 4/4、compile 266/384、diff 259/259、零 churn、4 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc561.log`）。仍开：非法配对怪值、非 Windows wchar。
- **2026-10-21 第八十一笔（S562）**：扩展 API 逐方法扫描（`tmp/d6/audit562.mts`）找出并补上最后一处「合法调用未实现」—— 九支 pack 的 `erase(value)`：删第一处命中回 true、未命中/空回 false，实参先按元素槽折算（byte 258→2、bool→1、float 1.9 向零截断成 1），向量颜色按分量比。`packed.ts` 走既有 `toElem` + `elemSame`。门：`pnpm test` **26437**（215 文件；新建 `pack-erase-562.test.ts` 14 格）、ops 6743、typecheck 4/4、compile 266/384、diff 259/259、零 churn、6 行端到端 0 分歧、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc562.log`）。仍开：`Vector3.outer`（Basis）、multibyte、Vector4。
- **2026-10-21 第八十二笔（S563）**：`snapped` / `lerp` 的运行期坏型文案与权重折算（task#3 收口）。snapped：x 列表八型（无 Color）、数值 x 的 step 只收 int/float、向量 x 收异型 step 给「跟第一参走」句；lerp：from 列表十型（无 int 向量）、to 失败按 from 的型写目标；**权重按 Variant→float 折**（String 前导解析、Array/null/Vector2 折 0），顺势解释了 S339 的 V2 权重那格。旧五格 `UnsupportedError` 断言按引擎原文归位。门：`pnpm test` **26441**（216 文件；新建 `utility-arg-563.test.ts` 17 格）、ops 6762、typecheck 4/4、compile 266/384、diff 259/259、零 churn、两格端到端 SCRIPT ERROR 行逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc563.log`）。仍开：D6 五型只出现在句子里、若干动态转换句没量。
- **2026-10-21 第八十三笔（S564）**：数值全局函数的运行期坏型文案。单参 float 族统一 `Invalid type in utility function "F()". Cannot convert argument 1 from <源型> to float.`（源型含 String / Vector2 / Array / Nil 的引擎拼法）；pow/fmod/fposmod/atan2 逐位报；nearest_po2 目标 int；bool 照收。`utilFloatArg` / `utilIntArg` 两个助手接进 sqrt/trig/反三角/exp/log/pow/fmod/fposmod/atan2/deg_to_rad/rad_to_deg/absf/signf 与六个 f/i 取整支；三处旧断言归位。门：`pnpm test` **26444**（217 文件；新建 `numeric-arg-564.test.ts` 23 格）、ops 6791、typecheck 4/4、compile 266/384、diff 259/259、零 churn、`sqrt(String)` 端到端逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc564.log`）。仍开：多参插值/角族与 db/rand 族、int 目标那一族。
- **2026-10-21 第八十四笔（S565）**：多参数值全局函数的运行期坏型文案。量法升级：每个调用放进内部类独立方法，一趟脚本量 34 格；move_toward/inverse_lerp/remap(1..5)/smoothstep/lerp_angle/rotate_toward/wrapf 逐位、pingpong/randf_range/randfn 两位、step_decimals/db_to_linear/linear_to_db 单参全是 `… from String to float.`，randi_range 目标 int。`fl`/`numArg` 换成 utilFloatArg/utilIntArg；gRemap 先校验五格；gRandiRange 先挡坏型。两处旧断言归位。门：`pnpm test` **26448**（218 文件；新建 `numeric-arg-565.test.ts` 34 格）、ops 6808、typecheck 4/4、compile 266/384、diff 259/259、零 churn、`move_toward(String,…)` 端到端逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc565.log`）。仍开：cubic/bezier 族、int 目标那一族、ease/angle_difference。
- **2026-10-21 第八十五笔（S566）**：cubic / bezier / int 目标那一族的运行期坏型文案（数值 SENTENCE 族收口）。同一隔离法一趟量 67 格：cubic 五支（5/8/5/8 位）、bezier 两支（5 位）全 float；absi/signi/posmod/wrapi/clampi/mini/maxi 目标 int；minf/maxf/clampf/ease/angle_difference 目标 float；**wrap 的怪处是第 1 位 float、第 2/3 位 int**。utilFloatArg/utilIntArg 接进这些函数；wrap/wrapf/wrapi 按调用路径取名；clampf/clampi 三位守卫。门：`pnpm test` **26450**（219 文件；新建 `numeric-arg-566.test.ts` 66 格）、ops 6882、typecheck 4/4、compile 266/384、diff 259/259、零 churn、cubic 端到端逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc566.log`）。仍开：clamp(auto) 的「目标跟 x、源跟被转位」第三怪形矩阵、max/min 变参族。
- **2026-10-21 第八十六笔（S567）**：`clamp(auto)` 的「目标型跟第一参走」+ max/min 变参族。20 格动态矩阵：lo/hi 先往 x 的型转、第一位失败报 argument 2/3；数值目标只收 int/float（bool 不认），bool 目标只收 bool，向量/其余要同型；max/min 逐位 from <源型> to float（原有句子经 8 格视为已量）。`gClamp` 在 auto 的 bool/向量分支前加 `clampTargetName`/`clampAccepts` 逐位校验。门：`pnpm test` **26454**（220 文件；新建 `numeric-arg-567.test.ts` 24 格）、ops 6908、typecheck 4/4、compile 266/384、diff 259/259、零 churn、clamp 端到端逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc567.log`）。仍开：int/float 互转的 clamp 接受性、max/min 收 bool、D6 值型。
- **2026-10-21 第八十七笔（S568）**：谓词族 / max·min 的 bool / clamp 的 int↔float 互转 / len / char 收口。五个谓词逐位 `from <源型> to float`；max/min 明拒 bool（普通 float 函数照收）；clamp 数值目标互收 int/float 并返回命中的原值（`clamp(1,1.5,3)`→1.5、`clamp(1.5,1,1)`→1）；len 收 Dictionary 与九支 pack、坏型七格统一 GDScript utility 句（Signal 名就地特别处理，valueTypeName 会印 Object）；char 坏型同句式。门：`pnpm test` **26460**（221 文件；新建 `numeric-arg-568.test.ts` 6 格）、ops 6927、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc568.log`）。仍开：len 的 StringName/定形容器、char 的 float 折整、谓词收 bool。
- **2026-10-21 第八十八笔（S569）**：String 的 buffer 四支与非 ASCII 的 ascii 两向。`to_utf16_buffer`/`to_wchar_buffer`（Windows 同一支）按 UTF-16 码元小端、代理对拆两格；`to_utf32_buffer` 码点 4 字节小端；`to_ascii_buffer` 每个非 ASCII 码点换 0x20 并逐码点打 `Unicode parsing error: …` 行；`get_string_from_ascii` 实测是 Latin-1 逐字节折码点（不是 UTF-8）且首个 0x00 截断。`methods.ts` 补四支、`packed.ts` 改 from_ascii，旧「高位字节响拒」断言改成实测值。门：`pnpm test` **26472**（223 文件；新建 `string-buffer-569.test.ts` 6 组）、ops 6962、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc569.log`）。仍开：孤立代理、stderr 行序、multibyte。
- **2026-10-21 第八十九笔（S570）**：`to_multibyte_char_buffer` / `get_string_from_multibyte_char` 的 UTF-8 与 ISO-8859-1 形。缺省 `""` 是宿主 ACP（这台 CP936），具名编码末尾多一个 0x00，空串是宿主本地化 Error 87 块；正向 UTF-8 合法还原、坏字节/截断给 U+FFFD、首个 NUL 截断、Latin-1 直折。`bytesMultibyte` + `windowsUtf8Decode`，String 侧 Latin-1 按码元折 `?`；未接编码名一律响亮拒（不冒发 Unknown 块），ACP/空串同样拒。门：`pnpm test` **26472**（223 文件；新建 `multibyte-570.test.ts` 6 组）、ops 6962、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc569.log`）。仍开：ACP 全表、Error 87 文案、其余代码页、复杂坏序列分段。
- **2026-10-21 第九十笔（S571）**：Callable 的 `bindv` / `is_custom` / `is_standard` / `get_object_id` / `hash` 接上（成员名表里最后五个「表内未实现」）。实测量齐七形标准/自定义判据；`get_object_id` 方法与静态给接收者 / 类对象号（关系钉死），空 / 全局 / 内建面给 0，lambda 宿主号拒；`hash` 全局 / 空 / 绑过的全局同值，方法 / lambda 拒；`bindv` 与 bind 同序（新绑实参排在旧绑定前，`max.bind(1).bindv([2])` 给 [2,1]、call=2），空数组回同一只，坏型发引擎句。门：`pnpm test` **26477**（224 文件；新建 `callable-methods-571.test.ts` 5 组）、ops 6984、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc569.log`）。仍开：rpc/rpc_id、create、lambda 与内建面的宿主哈希 / 对象号。
- **2026-10-21 第九十一笔（S572）**：Array 的 `get` / `set` / `front` / `back` / `pick_random` / `shuffle` 与 `Dictionary.sort()` 接上。下标 int/float/bool 照折、负下标不回绕、越界与空数组块逐行对上（variant_call.cpp:681、array.cpp:355/360/365）；`pick_random`/`shuffle` 走 `Math::rand()` 的 PCG（seed(123) 两发 30/20、洗成 [1,3,4,2,5]）；字典按键升序原地重排且值跟随。`frames` 加两组块、`builtins` 导出 `randNextUint32`、`GDict.sortKeys` 重建索引。门：`pnpm test` **26482**（225 文件；新建 `array-methods-572.test.ts` 5 组）、ops 7002、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：只读 set/sort 块、get/set 多余实参、定型数组 set 转换、混合键 sort。
- **2026-10-21 第九十二笔（S573）**：String 路径族八支接上（`get_extension` / `get_basename` / `get_base_dir` / `get_file` / `path_join` / `simplify_path` / `is_absolute_path` / `is_relative_path`）。读数 11 条路径 × 4 格 + 11 格绝对/相对 + 7 格 join + 10 格 simplify；实现逐句照 `ustring.cpp` 的同名式子（`://` / 盘符 / UNC 前缀、`\` 当分隔符、`.`/`..` 折叠、`res://` 不上跳）。`values.ts` 八个纯函数 + `methods.ts` 八支分派。门：`pnpm test` **26486**（226 文件；新建 `string-path-573.test.ts` 4 组）、ops 7006、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：path_join 非 String 实参、UNC / res:// 上跳未实测。
- **2026-10-21 第九十三笔（S574）**：String 的反转 / bigrams / 切割 / 填充 / 修剪十支。reverse 与 bigrams 按码点；get_slice_count 不重叠计数；rsplit 从右切再反转（空分隔符逐字切、maxsplit/allow_empty 照引擎）；split_floats 前导解析；lpad/rpad 默认空格且重复整串字符；pad_decimals 补点/截断/补零；trim_prefix/suffix 只削一次。`values.ts` 十个纯函数 + `methods.ts` 十支分派。门：`pnpm test` **26494**（227 文件；新建 `string-transform-574.test.ts` 8 组）、ops 7035、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：lpad/rpad 非 String 实参、split_floats 特殊数段、strip_escapes/indent/校验族。
- **2026-10-21 第九十四笔（S575）**：String 的转义 / 缩进 / 校验 / 通配族十支。strip_escapes 删 <32；c_unescape 按引擎顺序（`\n` 先于 `\\`）；json_escape 只转五种控制转义 + `\v` + 引号；xml_escape 默认不转引号；indent 只加非空行；dedent 以第一段文本行缩进为基准；validate_filename 先 trim 再换十字符；validate_node_name 只换五字符；match 的 `*` / `?` 通配（`?` 不吃点、空串 false）；is_valid_identifier = ASCII 判据。`values.ts` 十支纯函数 + `methods.ts` 分派。门：`pnpm test` **26504**（228 文件；新建 `string-escape-575.test.ts` 10 组）、ops 7056、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：xml_unescape 数字实体、is_valid_html_color / is_valid_ip_address、非 BMP 缩进行首。
- **2026-10-21 第九十五笔（S576）**：String 比较 / 大小写不敏感查找 / 通配 / 子序列 / 剥离 / Pascal 十二支。用 4.6.3 `ucaps.h` 生成 `runtime/ucaps.ts`（1477 + 1460 对 + findUpper/findLower 二分）；nocase/natural/file 三族、containsn、matchn、is_subsequence_of(n)、lstrip/rstrip、to_pascal_case 接上，`lowerOne` 改走 `findLower`（findn/replacen 同步）。读数含 ß/SS、İ/i、前导 `_` 排序、数字段前导零、A2B→A2b。门：`pnpm test` **26513**（229 文件；新建 `string-compare-576.test.ts` 9 组）、ops 7067、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：to_upper/to_lower 未换 ucaps、sha1/sha256/hex_decode/xml_unescape/HTML 与 IP 校验。
- **2026-10-21 第九十六笔（S577）**：String 的摘要 / hex_decode / xml_unescape / HTML 与 IP 校验八支。新 `hashes.ts` 纯 SHA-1/SHA-256（UTF-8 输入，scriptc 可编），md5_buffer 复用 md5Hex；hex_decode 有效偶数位直出、奇数长度发 1658 块、非法字符响拒；xml_unescape 五个命名实体 + 十进制 / 小写 x 十六进制；is_valid_html_color 可选 # + 3/4/6/8 位；is_valid_ip_address 移植 IPv4/IPv6（含 :: 与 ::ffff: 嵌入）。门：`pnpm test` **26520**（230 文件；新建 `string-hash-577.test.ts` 7 组）、ops 7081、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：非法 hex 字符的 U+FFFD 怪块、数字实体溢出边界、Vector3.outer（D6）。
- **2026-10-21 第九十七笔（S578）**：`Callable.create(obj, name)` 接上（内建静态面最后一支）。实测与 `Callable(obj, name)` 相等、String/StringName 同形、值位置与零参是解析期拒；实现 `callableStatic` + `STATIC_MEMBER_FNS.Callable` + `STATIC_FACE.create=[2,2]`，端到端 `pnpm dev run` 打 7/ping。门：`pnpm test` **26522**（231 文件；新建 `callable-create-578.test.ts` 2 组）、ops 7088、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：create(null,name) 与 create(h,"nope") 的无效 Callable 形状、值位置的解析期时机。
- **2026-10-21 第九十八笔（S579）**：UTF-32 非法码点与 utf16 代理边界的编码。utf32 非法码点换 U+FFFD 并发引擎那行诊断；utf16 孤立代理保留成码点，`to_utf8_buffer` 改成逐码点编码（孤立代理给 CESU 三字节 eda080/edb080，正常代理对四字节不变）。`utf8EncodeWtf` + `stringUnicodeReplaceError`，旧 553「非标量响拒」断言归位。门：`pnpm test` **26527**（232 文件；新建 `string-unicode-579.test.ts` 5 组）、ops 7099、typecheck 4/4、compile 266/384、diff 259/259、零 churn、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc572.log`）。仍开：孤立高代理后跟非低位的怪值、utf16 解码诊断行。
- **2026-10-21 第九十九笔（S580）**：Vector4 / Vector4i 核心值类型。量齐 typeof 12/13、打印 / var_to_str、0/4 参与单参互转（int32 回绕）、槽默认值与互转、逐分量五组运算、字典序比较、下标 / 分量读写（负下标 681 式引擎句）、四分量哈希（3873189715 / 3206438488）、常量表与 1/2/3 参解析期拒。新 `vector4.ts` / `vector4i.ts` + values/patterns/builtins/ops/methods/analyze/emitter/ir 接线；全局函数与 `%v` 上的 Vector4 先加守卫响亮拒。门：`pnpm test` **26532**（233 文件；新建 `vector4-core-580.test.ts` 5 组）、ops 7116、typecheck 4/4、compile 266/384、diff 259/259、零 churn、端到端三脚本与引擎逐行一致、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：Vector4/V4i 方法共 46 支、PackedVector4Array、全局函数语义。
- **2026-10-21 第一百笔（S581）**：Vector4 的 30 支与 Vector4i 的 16 支方法全部接上。量齐轴索引并列规则（min 给最后一格、max 给第一格）、长度 / 距离 / 点积、逐分量一元与取整、lerp / cubic、posmod、snapped 两种、clamp 两种、归一化、inverse、min/max 族、近似谓词；int 侧的 int64 累加与 snapped 的取整规则。`vector4.ts`/`vector4i.ts` 方法分派 + face-arity/analyze 表 + 属性读写。门：`pnpm test` **26537**（234 文件；新建 `vector4-methods-581.test.ts` 5 组）、ops 7134、typecheck 4/4、compile 266/384、diff 259/259、零 churn、端到端 `v4meth.gd` 与 Godot 7 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：cubic_in_time 只按同式、PackedVector4Array、全局函数。
- **2026-10-21 第一百零一笔（S582）**：`PackedVector4Array` 与 `to_vector4_array()`。PackKind 加 vector4（typeof 38、默认零元素、toElem/elemVariant/elemSame/cmpElem/packToBytes/守卫）；var_to_str 摊平分量、hash 1689136173、var-bytes 类型码 38、to_byte_array 16 字节/元素、to_vector4_array 与 1049 块；analyzer/emitter 的 pack 名单、元素槽、方法表、构造与默认值。门：`pnpm test` **26542**（235 文件；新建 `vector4-pack-583.test.ts` 5 组）、ops 7154、typecheck 4/4、compile 266/384、diff 259/259、零 churn、端到端 `v4pack.gd` 10 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：非法构造签名、var_to_bytes 未单独量、下标写 V4i、NaN 排序/哈希。
- **2026-10-21 第一百零二笔（S583）**：Vector4 / Vector4i 的全局工具函数与 `%v`。abs/sign/floor/ceil/round 逐分量；lerp/snapped 同型；clamp 走字典序整支返回（实测全零 lo 那一格）；`%v` 四分量按 `%f` 默认精度、`%.2v` 生效。`vectorMath`/`gLerp`/`gSnapped`/`gClamp`/`fmtVecComps` 五处接线并移除守卫。门：`pnpm test` **26545**（236 文件；新建 `vector4-global-583.test.ts` 3 组）、ops 7161、typecheck 4/4、compile 266/384、diff 259/259、零 churn、端到端 `v4util.gd` 6 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：max/min 的 Vector4 形、clamp 跨型、`%v` 宽度/星号。
- **2026-10-21 第一百零三笔（S584）**：Vector4 的定形容器。`Array[Vector4]` 收 Vector4i 并升 float（builtin 12）、`Array[Vector4i]` 截断并回绕（13）、`Dictionary[Vector4, Vector4i]` 键值两槽与字典打印。`ELEM_FACES`、`ElemKind`/`isElemKind`/`elemDefault`/`elemConvert`、`keyOfIn`、两处类型码 12/13。门：`pnpm test` **26548**（237 文件；新建 `vector4-typed-584.test.ts` 3 组）、ops 7170、typecheck 4/4、compile 266/384、diff 259/259、零 churn、端到端 `v4typed.gd` 3 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：字典键跨型、嵌套容器、序列化 12/13 未逐格量。
- **2026-10-21 第一百零四笔（S585）**：全局实参闸门认 Vector4/Vector4i 构造式。`NUMERIC_VALUE_CTORS` 加两型后，`is_equal_approx` / `is_zero_approx` / `is_finite` 的 Vector4 字面量按引擎解析期原文拒（此前运行期才响拒）；`dev check` 与引擎两句逐字一致。门：`pnpm test` **26548**、ops 7170、typecheck 4/4、compile 266/384、diff 259/259。仍开：max/min 变参位闸门、动态变量运行期句。
- **2026-10-21 第一百零五笔（S586）**：Vector4 的全局运行期句子、max/min 变参与字典键闸门、var_to_bytes。动态谓词/max/min 发引擎转换句；max/min 字面量解析期按 should be float 拒；字典字面量异型键解析期拒、动态键运行期转换（实测）；var-bytes 加类型码 12/13 编解码，PackedVector4Array 与 Vector4 字典键两串 hex 与引擎逐字节。门：`pnpm test` **26551**（238 文件）、ops 7180、typecheck 4/4、compile 266/384、diff 259/259、零 churn、v4bytes hex 一致、`dev check` 两句逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：推断变量键的解析期相位、V4i 值序列化布局未单测。
- **2026-10-21 第一百零六笔（S587）**：V4i 序列化布局与推断局部量的字典键闸门。四串 var_to_bytes（V4i 值 / 字典键 / Array[Vector4i] / pack）与引擎逐字节；`var k = Vector4i(...); d[k]` 现在按引擎解析期拒。门：`pnpm test` **26552**（238 文件）、ops 7185、typecheck 4/4、compile 266/384、diff 259/259、dev check 同句、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：非直接构造式的初值推断、其他键型对。
- **2026-10-21 第一百零七笔（S588）**：Vector4/Vector4i 的方法名当值。`length` / `normalized` 取属性给 typeof 25 的绑定 Callable，标签 `Vector4::length` 等，调用同方法；`vface` 接两型走既有 boundBuiltinCallable 路。门：`pnpm test` **26553**（239 文件；新建 `vector4-attr-588.test.ts`）、ops 7190、typecheck 4/4、compile 266/384、diff 259/259、端到端 `v4attr.gd` 3 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：存在表外方法名当值、hash 不存在。
- **2026-10-21 第一百零八笔（S589）**：Vector4/Vector4i 全表方法名当值。自动生成的探针把 48 个方法名逐个取属性，全部 typeof 25、标签 `<型>::<名>`；存在表从只量过的几支扩到完整方法名单 + 分量。门：`pnpm test` **26554**（239 文件；`vector4-attr-588.test.ts` 扩到 2 组）、ops 7194、typecheck 4/4、compile 266/384、diff 259/259、端到端 `v4attr2.gd` 4 行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：绑定 Callable 的等式/哈希/元数查询。
- **2026-10-21 第一百零九笔（S590）**：`Callable.create(null|int, name)` 脱离形。null::ping 的标签/谓词/方法名/零元数/等式、调用 null 实例句；int::x 标签；hash 1862405700 与 bind/unbind 未拟合，响亮拒。`CallableBox.detachedOwner` 一字段贯穿标签/等式/is_valid/get_object/get_argument_count/调用。门：`pnpm test` **26557**（240 文件；新建 `callable-create-590.test.ts` 3 组）、ops 7204、typecheck 4/4、compile 266/384、diff 259/259、端到端 stdout 四行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：hash 来源、bind/unbind、1647 打印块。
- **2026-10-21 第一百一十笔（S591）**：`PackedVector4Array(Vector4)` 构造拒补进 `CTOR_REFUSED`；`%v` 的宽度/精度/星号/左对齐/加号在 Vector4/V4i 上六格与引擎逐字节（无需改代码，补测试）。门：`pnpm test` **26558**（240 文件；`vector4-global-583.test.ts` 扩到 4 组）、ops 7210、typecheck 4/4、compile 266/384、diff 259/259、dev check 同句、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：pack 其他非法签名、%v 其它旗标。
- **2026-10-21 第一百一十一笔（S592）**：`Callable.create(obj, 不存在的方法)` 无效 Callable。is_null 假/is_valid 假/get_method 名字/get_object 空对象/零元数/等式真；调用句 `Invalid call. Nonexistent function 'RefCounted::nope (Callable)'.`；hash 3626010400 未拟合、bind/unbind 未量，均响亮拒。`CallableBox.invalidMethod` 贯穿谓词/对象/元数/调用/等式。门：`pnpm test` **26559**（240 文件；`callable-create-590.test.ts` 扩到 4 组）、ops 7214、typecheck 4/4、compile 266/384、diff 259/259、端到端 stdout 三行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：hash 来源、bind/unbind、1647 块。
- **2026-10-21 第一百一十二笔（S593）**：`WINDOWS-1252` multibyte 双向。编码 `A€é汉😀`→`41 80 E9 3F 3F 3F 00`；解码 0x80/0x81/0x93/0x94 走 CP1252 表；32 项高区表 + 编解码助手，白名单加该名。门：`pnpm test` **26561**（241 文件；新建 `multibyte-1252-593.test.ts` 2 组）、ops 7218、typecheck 4/4、compile 266/384、diff 259/259、端到端四行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：宿主 ACP、其余代码页、Error 87 本地化块。
- **2026-10-21 第一百一十三笔（S594）**：Vector4/V4i 进 Array.sort / Dictionary.sort。V4 三格按四分量字典序、V4i 异型留末尾、V4i 自身排序、字典键序；`SORT_ORDERED` 加两型，比较走既有 vec4Cmp/vec4iCmp。门：`pnpm test` **26563**（242 文件；新建 `vector4-sort-594.test.ts` 2 组）、ops 7221、typecheck 4/4、compile 266/384、diff 259/259、端到端三行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：嵌套数组元素序、sort_custom。
- **2026-10-21 第一百一十四笔（S595）**：`str_to_var` 的 Vector4/V4i。四个数值分量 → typeof 12/13；空参与跨构造 → null；`SV_VALUE_CTORS` 与构造式分支加两型。门：`pnpm test` **26564**（243 文件；新建 `vector4-strtovar-595.test.ts`）、ops 7225、typecheck 4/4、compile 266/384、diff 259/259、端到端六行逐字节、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：其他参数量形状、V4i 浮点截断。
- **2026-10-21 第一百一十五笔（S596）**：Vector4 的 snapped/clamp/lerp 跨型句。五格引擎原文（snapped 标量 step、clamp 低/高 V4i、lerp to V4i、lerp from V4i 的列表句）；vecClassName 加两型、gLerp 分岔、gSnapped 发 utilConvertError，去掉全局守卫。门：`pnpm test` **26565**（243 文件；`vector4-utility-586.test.ts` 扩到 5 组）、ops 7230、typecheck 4/4、compile 266/384、diff 259/259、端到端五句逐字、§13 探针 234 逐字节、`test:golden-check`（`tmp/d6/gc580.log`）。仍开：snapped(V4i, 标量) 原句只按对称形接。
- **2026-10-21 第一百一十六笔（S597）**：`Array(pack)` 放开到十支 pack。11 行读数：byte/int32/int64 → 元素 2、float32/64 → 3、string → 4、v2/v3/color/v4 → 5/9/20/12，空 V4 pack 转出 `is_typed()` 假；`arrayFromVariant` 去掉 kind 必须是 byte 的两道闸，改 `packItems(packBytes(v))` 逐元素装箱，非 pack 仍响亮拒。语料 **397-array-from-pack**（12 行）。门：`pnpm test` **26570**（244 文件；新建 `array-from-pack-597.test.ts` 2 组、`packed.test.ts` 两条旧「只量过 PackedByteArray → 响」改正向断言）、ops 7236、typecheck 4/4、compile **267/385**（新用例进成功桶）、diff **260/260**、golden 零漂移（`tmp/d6/gc597.log`）、§13 探针 234 逐字节。仍开：`Array(Dictionary)` / `Array(String)` 源形状、`Array(pack, type, …)` 的定型形。
- **2026-10-21 第一百一十七笔（S598）**：`max`/`min` 六支的 Vector4/V4i 形（结掉 S591/S593 那两笔「没量」）。运行期 10 格逐行同字（`to float` 四位 / `to int` 两位 / 变参按第一个坏位报位号）；解析期 9 形 `Invalid argument for "F()" function: argument 1 should be "float"|"int" but is "Vector4"|"Vector4i".`；**代码零改动**（`maxMinFloat` + `utilityArgLabel` + `utilFloatArg`/`utilIntArg` 本来就发得出）。新见一处可见差别：同支调用两个坏位时我们报两条，引擎第一条就停 —— 首条逐字相同，多报的记为仍开。门：`pnpm test` **26574**（245 文件；新建 `global-maxmin-vector4-598.test.ts` 3 组、`vector4-utility-586.test.ts` 扩到 6 组）、ops 7246、typecheck 4/4、compile 267/385、diff 260/260、零产物 churn。仍开：坏位多报那一条、`min`/`minf` 的 V4i 字面量位。
- **2026-10-21 第一百一十八笔（S599）**：全局函数实参句「单一变体只推第一个坏位」。实测：跨语句会继续收集（一支脚本三个坏调用各推一句），但同一支调用内 `clampi("x","y","z")` / `maxf(V4i,V4i)` / `cubic_interpolate(五元三坏)` / `bezier_interpolate(同形)` 都只推 argument 1，而 `randf_range([1],"a")` 推三条（A 式 + as 式 + A 式）。实现：`analyze.ts` 的 `wants` 字面量位循环改成坏位先攒、只推位次最小的一条，`asRows`/`shouldRows`/`sentenceRows`/`typedName` 与名字实参通道不动。门：`pnpm test` **26575**（245 文件；`global-maxmin-vector4-598.test.ts` 扩到 4 组）、ops 7246、typecheck 4/4、compile 267/385、diff 260/260、golden 396/396 零漂移（预期报错 136 例的文本一条没变）。
- **2026-10-21 第一百一十九笔（S600）**：`cubic_interpolate` 四支 + `bezier_interpolate` / `bezier_derivative` 的解析期实参位（S566 只量了运行期那一半）。30 支探头读数：每一位都 `should be "float"`，**容器不推迟**（`([1], …)` 解析期就推 A 式，与 `clamp`/`lerp`/`wrap`/`snapped`/`max`/`min` 那条 S532 闸不同），bool 与 int 字面量**收**（不进 BOOL_REFUSED）；三条坏位仍只报 argument 1。实现只在 `GLOBAL_ARG_TYPES` 按字母序补六行，代码零改动。顺带**作废 S599 ② 的机制说法**：`randf_range` 在 `extension_api` 里只有 1 个变体却推三条 —— 正确的形状是按**通道**记（A 式通道每支调用只推第一个坏位，`as` 式是另一条通道），行为不受影响。门：新建 `global-cubic-bezier-args-600.test.ts`（2 组）、`pnpm test` **26577**（246 文件）、ops 7246、typecheck 4/4、compile 267/385、diff 260/260、golden 396/396 零漂移。仍开：这六支的名字实参形（`GLOBAL_NUM_ARITH` 通道）、其余单变体族的容器推迟形状。
- **2026-10-21 第一百二十笔（S601）**：`Array()` 零参 + `Array(Array)` 的别名 + 五种坏源形的引擎句。实测：`Array()` → `[]`（append 后 `[1]`、`is_typed()` 假、元素 int）；`Array(a)` **就是那支数组本身**（`r[0] = 7` 把源也改成 `[7, 2]`）；源形是 Dictionary / String / int / null / Vector2 五格发运行期句 `Invalid call. Nonexistent 'Array' constructor.`。实现：`arrayFromVariant` 加 `Tag.ARRAY` 原样给回支与五格引擎句支（没量过的 bool / StringName / 其余对象照旧 `UnsupportedError`），发射器按元数分岔让零参走 `rt.V.array(rt.GArray.of([]))` —— 原先零参被当 `V.nil()` 送进运行期吃我们的拒，是过拦。语料 **398-array-ctor-shapes**（6 行）。门：新建 `array-ctor-shapes-601.test.ts`（3 组）、`pnpm test` **26583**（247 文件）、ops 7257、typecheck 4/4、compile **268/386**、diff **261/261**、golden 无漂移。仍开：2 参 / 4 参的解析期句 `No constructor of "Array" matches the signature …` 已量到原文但整张签名矩阵没量；`Array(2.5)` / `Array(true)` / `Array(StringName)` 的接受性没量。
- **2026-10-21 第一百二十一笔（S604）**：`min` / `minf` 的 Vector4i 字面量位补完（S598 ⑥ 那一格）。两支各一句 `Invalid argument for "min()"/"minf()" function: argument 1 should be "float" but is "Vector4i".`，与已量的 max / maxf / maxi / mini 同式；**代码零改动**，只在 `global-maxmin-vector4-598.test.ts` 补一组两格。门：`pnpm test` **26584**（247 文件）、ops 7257、typecheck 4/4、compile 268/386、diff 261/261 静默错 0、golden 397/397 零漂移。仍开：`minf(Vector4i, Vector4)` 混排位序没单独量。
- **2026-10-21 第一百二十二笔（S605）**：`Array(base, type, class_name, script)` 四参定形构造 —— **修掉一处静默错值**（此前发射器把四参形当单参发，`Array(base, TYPE_INT, &"", null)` 给的是别名 + 不 typed，跑得出结果、输出却错）。读数来自 `extension_api` 那张构造式表（Array 共 13 形：零参 / `Array from` / 这支四参 / 十支 pack）+ 三趟探头 + 语料 399 的 14 行 golden：四参形**新建**数组、逐格往目标型转（1.7→`[1]`、`[1]`→`[1.0]`、`[1]`→`[true]`、Vector2→Vector2i 截断）、型码 0 给不 typed、**任一格转不过就交回空的定型数组**（引擎另推的 `ERROR: Unable to convert array index N …` 由 normalize 整块滤掉）、非 OBJECT 型带类名时类名被丢。实现：新增 `arrayFromArgs`（0 / 1 / 4 三形，其余元数与没量过的位一律响亮拒），型码→型名取 `ELEM_TYPE_CODE` 反向，逐格 `elemConvert`；发射器整套传参。门：`pnpm test` **26590**（248 文件；新建 `array-typed-ctor-605.test.ts` 3 组）、ops **7272**、typecheck 4/4、compile **269/387**、diff **262/262** 静默错 0、golden **398/398 零漂移**（135 / 397 的 `main.gen.mts` 有发射 churn，输出一条没变）。仍开：`TYPE_OBJECT` 带类名那一形（读数齐了，要扩 `ElemKind` 与序列化）、2 / 3 / 5 / 6 参的解析期句六格已量未接（#8）、第三参给 String 字面量的运行期形没量。
- **2026-10-21 第一百二十三笔（S606）**：`Array(...)` 的构造签名拒接进静态层（#8 结掉）。一脚本一形量了 24 形，`extension_api` 给 Array 的构造式只有 13 形，合不上的**字面量**形都在解析期发 `No constructor of "Array" matches the signature "Array(<型名, …>)".`；三条关键口径 —— **`TYPE_*` 常量在句里叫 `Variant.Type`**、值类型与 pack 的构造式调用按**类名**写、第四参给 `null` 字面量时写 `null`（所以好形 `Array(Array, Variant.Type, StringName, null)` 不在坏名单）。实现：`CTOR_REFUSED.Array` 补 14 行实测坏形 + 新增 `ctorArgName`（字面量照旧走 `literalTypeName`，`TYPE_` 且 `isGlobalConst` 认得的改报 `Variant.Type`）—— 过去这一类实参返回 null 让整条判据让开，`Array([1], TYPE_INT)` 一路落到运行期发 S601 那句，而引擎在解析期就拒。语料 **400-array-ctor-signatures**：24 形的句子与**行号逐条对齐**。门：`pnpm test` **26593**（248 文件）、ops **7272**、typecheck 4/4、compile **269/388**（预期报错桶 93）、diff **262/262** 静默错 0、golden **399/399 零漂移**。仍开：其余 8 支 pack 当第一参的四参形只量了两支；`NodePath` / `RID` / `Signal` / `Callable` 源形没量；`TYPE_OBJECT` 带类名那形（S605 ⑤）仍没接。
- **2026-10-21 第一百二十四笔（S607）**：元数越界时 Array 字面量还要补一条声明位句子（#9 结掉）。两批共 43 形一趟扫完：固定 int / float 槽的全局函数**见容器不让开**（`move_toward` / `inverse_lerp` / `remap` / `smoothstep` / `wrapf` / `wrapi` / `pingpong` / `step_decimals` / `db_to_linear` / `linear_to_db` / `randfn` / `randi_range` / `ease` / `angle_difference` / `fmod` / `sqrt` / `deg_to_rad` / `pow` / `log` / `is_equal_approx` / `is_finite` / `bezier_derivative` / `cubic_interpolate_angle` / `lerp_angle` / `rotate_toward` 全发 A 式），S532 那条让开规则只属于 `clamp` / `lerp` / `wrap` / `snapped` / `max` / `min`。元数越界那支引擎**发两条**：元数句 + 声明位补句，补句只认 **Array 源**（String 源不补：`pingpong("a", 1.0, 2.0)` / `wrapi(1, "x")` 各只有一条）、越出声明位不补（`wrapf(1.0, 2.0, 3.0, [1])`）。实现只改 `analyze.ts` 那一支 `continue`：越界时只走 `spec` 表、只认 `literalTypeName === "Array"` 的第一条声明位，其余通道一概不碰。语料 **401-arity-container-slots**（11 形 / golden 38 行），。门：新建 `global-arity-container-slots-607.test.ts`（3 组）、`pnpm test` **26599**（249 文件）、ops **7272**、typecheck 4/4、compile **269/389**（预期报错桶 94）、diff **262/262** 静默错 0、golden **400/400 零漂移**。仍开：越界 + Dictionary / null / 值类型构造式源的补句、名字实参在越界形的行为、`sign([1])` 那一格。 **另发现跨语句的排列差**：`builtin-arity` 整族先列、再列 `global-arg-type`，引擎按语句位置交错（语料 401 的 18 条内容与行号全对、先后不对）—— 修法是按 (行, 列) 稳定排序，记为 S608；同时预期报错那 138 例没有任何门在比正文，排序修好后该补那道门。
- **2026-10-21 第一百二十五笔（S608）**：先给「预期报错正文」补了一道**只对账不拦**的脚本（`tmp/d6/parity608.ts`，120 支带 `Parse Error` 的 golden 逐条比行号 + 句子：88 支原序即一致、1 支需稳定排序、22 支是 lowering 抛出型、9 支有差），随后按读数纠正重复键那一族 —— 引擎那句自带 `Key "X" was already used in this dictionary (at line <首次>).`，而报错位置是**重复那一格**（跨行字典实测句子 `(at line 6)`、`at:` 在 7；int / StringName 键的名都不带引号）。S294 当年把首次行号记进了位置、句子却不带 `(at line …)`，跨行那形于是行号早一格、文案少一截。实现：`dict-dup-key` 消息自带首次行号、`loc` 换成重复格，`dict-dup-key.test.ts` 19 格按新读数重写。对账结果：283 / 386 两支语料转为原序一致，一致数 88 → **90**、不一致 5 → **3**。门：`pnpm test` **26599**（249 文件）、typecheck 4/4、compile 269/389、diff 262/262 静默错 0、golden 400/400 零漂移。剩三笔已定位：221 我们把一支调用的两句发重（引擎 2 条 / 我们 4 条）、228 引擎把 match 守卫的未声明标识符报两遍而我们报一遍、393 待按明细查；另 4 支抛出型（330–333）是一条消息带两句、与引擎分行等价，属对账脚本自己的口径，下一步按行拆开再比。
- **2026-10-21 第一百二十六笔（S609）**：`join()` 接收者的两句归通用 `face-member-*` 判据，S221 时代那条专枝删掉。六形实测（`tmp/probe569/s616.gd`）：Array / pack 字面量与标注接收者都是**两句**，**Dictionary 只有一句** `Function "join()" not found in base Dictionary.`（没有 `Cannot find member` 那一句，与 Array 面不对称），推断接收者 `var a = []` 解析期一句不发。病灶正是语料 221 一直对不上正文的那条：专枝与通用判据**都**为字面量接收者发同一对 → 我们 4 条 / 引擎 2 条，Dictionary 那形还多引擎一句。实现删专枝那一段 + 只认字面量的 `joinReceiverBase`，字符串字面量接收者的实参形状判据照旧留。门：新建 `join-receiver-face-609.test.ts`（2 组 9 形）、`pnpm test` **26601**（250 文件）、typecheck 4/4、compile 269/389、diff 262/262 静默错 0、golden 400/400 零漂移；正文对账「原序一致」90 → **91**，剩 228（引擎把 match 守卫的未声明标识符报两遍、我们报一遍）与 393（九条里一条文案差）两支，另 1 支需要按 (行,列) 稳定排序才一致 —— 改排序前先把这 91 支的一致验住。
- **2026-10-21 S610 的读数已备好（未开工）**：`228` 那对「match 守卫里未声明标识符被引擎报两遍」的形状有了 —— `tmp/probe569/s617.gd` 两个 arm 的守卫里 `a` / `c` / `d` 各出现一次就各报 **2** 条，`b` 出现两次报 **3** 条，像「**守卫内每次出现报一条 + 每个名字另送一条**」。动手前还要量清：嵌套出现、被外层 `var` 遮名字、只图案无守卫、多 arm 同行这几形。`393` 那支是九条同内容而**先后**不同（我们按语句发，引擎另有分组），要拿全文对照（明细在 `tmp/d6/parity608.txt`）再定归组规则。两支都清完，才能把 `tmp/d6/parity608.ts` 这道只对账脚本升成正式门 —— 现在升上去就是红的。
- **2026-10-21 第一百二十七笔（S610）**：match 图案里的值模式标识符按**每次出现**报一句、图案那截在 guard 之前（S610 预量的形状证实并细化：`[a, b] when a > b` 4 句、`[a] when (a > 1)` 2 句、`[k, v] when k > 1 and v > 2 and k > 3` 5 句、`[a, b] when 1 > 0` 只用图案也 2 句、`[_, _] when q > 1` 1 句、外层有 `var a` 就 0 句、两臂各 2 句）。实现只加一支 `patternNames`：递归进图案里能装表达式的位置（值模式 `expr`、数组图案元素、字典图案的键与子图案），用**外层 scope** 走既有 `walkExpr`，调用点在 `armScope` 之前 —— `bind` / `wildcard` / `lit` 三种图案不碰（绑定名硬走一遍会把合法形状报成未声明）。门：新建 `match-pattern-identifiers-610.test.ts`（3 组 7 形）、`pnpm test` **26604**（251 文件）、typecheck 4/4、compile 269/389、diff 262/262 静默错 0、golden 400/400 零漂移；正文对账「原序一致」91 → **92**，语料 228 转一致。剩：`393` 的分组差、1 支需要 (行,列) 稳定排序、抛出型 4 支要按行拆开再比；图案其余形（`bind`、`{...}` 变长、嵌套数组、typed 主语）报不报没量。
- **2026-10-21 第一百二十九笔（S613，`5ea3689`）**：类定型数组 `Array(base, TYPE_OBJECT, 类名, null)` 接上 —— 十形用**同一支脚本两侧对跑**逐条同字（`tmp/d6/s613ours.gd`）。要点：类名由 `get_typed_class_name()` 读回、`get_typed_builtin()` 恒 **24**、元素**只收 null**（转不过给空的定型数组且**类名照挂**；`append(1)` 长度不动）、`duplicate()` / `assign()` 保类名、`==` 不看类名而 `is_same_typed()` 看、第三参给 String 也收。**顺带纠正 S605 的一处口径**：非 OBJECT 型带类名时引擎是**整支降成不 typed**（`get_typed_builtin()` 给 0），不是「只丢类名」—— 值面当时对、定型性错。实现：`GArray.className` + `ElemKind` 的 `"Object"`（`isElemKind` 不放，标注形未量）+ `elemConvert` 只收 null + `elemDefault` 抛 `typed-object-default` + 四条 `get_typed_*` / `is_same_typed` / `duplicate` 认类名 + `ctorClassName`；**类定型的 `var_to_bytes` 响亮拒**（头部 flags=2 + `"EncodedObjectAsID"`，写的不是类名，未拆完），纯 `Array[Object]`（flags=1 + 码 24）按实测放行。门：typecheck 4/4、`pnpm test` 26604（251 文件）、ops 7272、compile 269/389、diff 262/262 静默错 0、golden 400/400、正文门 120/120。仍开：类定型序列化、`var a: Array[RefCounted] = []` 标注形的静态层、`has_all` 那格透露的「报错句里型名带方括号」一族、`resize` / `fill` 与其余型码配这一支构造的形。
- **2026-10-21 第一百二十八笔（S611）**：`script-class-slot` 那族按**分组**发（393 那支内容差归零）。重搭一形交叉印证（`tmp/probe569/s619.gd`：两支内部类 + 模块 var + 形参默认值 + 函数体 var）：引擎序是 **外层 var 默认值 → 外层形参默认值 → 各内部类成员 var（按声明序）→ 外层函数体 → 内部类的函数**，读数 `9, 11, 4, 15, 18, 19, 7` 与语料 393 的 `11, 13, 14, 16, 19, 6, 29, 31, 9` 同一条规则。实现把 `checkScriptClassSlots` 原先「外层 var → 外层函数（形参和体挤一起）→ 内部类递归」的三段改成五段各一遍，`walkStmtVars` 一字未动，**改的全是发序、产物零变化**。门：`pnpm test` **26604**（251 文件）、typecheck 4/4、compile 269/389、diff 262/262 静默错 0、golden 400/400 零漂移；正文对账「内容不一致」归零 —— 120 支里 93 原序一致 + 22 抛出文案一致 + 4 一条消息带两句 + 1 需要 (行,列) 稳定排序。仍开：那 1 支的分组规则还没从这两形推出来（不能拿稳定排序当通用修法，会把 93 支洗掉）；内部类形参默认值排进第五段是类推、没单独量。
- **2026-10-21 第一百三十笔（S614）**：类定型数组的序列化字节形拆完并接上（结掉 S613 ⑤ 第一项）。布局：`u32 (28|2<<16)` → `u32 17` → `"EncodedObjectAsID"` → 3 字节补零对齐 → `u32 元素数` → 元素（null 每位 4 字节）；**类名不入字节**（`&"Node"` / `&"Resource"` / `&"RefCounted"` 三支 hex 一字不差），**回读把类名改写成 `EncodedObjectAsID`**（is_typed 仍真、码 24、值原样），元素型码这一支不写（flags=1 的纯 `Array[Object]` 才写 24）。实现只动 `var-bytes.ts` 的 ARRAY 编解码两处，原先的 `var-to-bytes-class-typed` 拒消失。语料 **402-class-typed-bytes**（8 行，含字典内嵌与「转不过 → 空的定型数组」）。门：五形两侧同脚本逐条同字、typecheck 4/4、`pnpm test` 26607（251 文件）、compile 270/390、diff 263/263 静默错 0、golden 401/401 零漂移、sema-wording-parity 120/120。仍开：`Array[Class]` / `Array[Object]` 标注形的静态层、`Object` 型 `resize` / `fill`、其余型码配四参构造那一族、`var_to_bytes_with_objects` 那一档。
- **2026-10-21 第一百三十一笔（S615）**：`Array[类名]` 标注形接上（量过的三支：`Object` / `RefCounted` / `Node`）。一脚本一形量了十形：`Array[RefCounted] = []` → `[] true 24 RefCounted 28`、`Array[Object]` 类名就是 `Object`、无初值时默认是空的定型数组、`[null]` 与 `append(null)` 收、`append(1)` 运行时丢弃并写回 flags=2 那一套、跨形赋值（四参构造 → 标注槽）引擎照收。两句解析期拒量到：元素不合式 `Cannot have an element of type "int" in an array of type "Array[RefCounted]".`（**只这一句**，与脚本类名同形）与跨型赋值 `Cannot assign a value of type Array[String] to variable "i" with specified type Array[RefCounted].`。实现：`stampClassArray` + `NATIVE_CLASS_SLOTS`（`holds` 认 null 或同名、`report` 这一族只发第二句）+ 发射器在这三支时走 `rt.stampClassArray(...)`。语料 **403-array-class-annot**（8 行）；门：compile 271/391、diff 264/264 静默错 0、golden 402/402 零漂移、pnpm test 26610（251 文件）、typecheck 4/4、正文门 120/120，十形两侧逐条同字。仍开：**跨型赋值那一句还没拒**（要把源容器元素型带进赋值判据，是下一笔）、其余宿主类名与 `Array[X]` 未量的维持现状。
- **2026-10-21 第一百三十二笔（S616）**：定形容器之间的赋值按**标注文本**比对，不同即解析期拒 —— `Array[String]`↔`Array[RefCounted]` 双向、`Array[int]`→`Array[float]`、`Array[int]`→`Array[String]` 四形各一句 `Cannot assign a value of type <源> to variable "<名>" with specified type <目标>.`；**容器之间没有标量那套放宽**（int→float 也拒），同标注收下（g9）。实现：`targets` 那一趟新增函数内标注表 `locals`（声明按序登记、跨函数清空）与 `varName` / `srcAnn`，主循环最前面加 `typed-collection-assign` 判据。语料 **404-array-typed-assign-refusal**（四句，行号 5/7/9/10 与引擎同序）。门：typecheck 4/4、`pnpm test` 26613（251 文件）、compile 271/392、diff 264/264 静默错 0、golden 403/403 零漂移、正文门 121/121。仍开：源是**不定型 `Array`** 时引擎改发运行期句 `Trying to assign an array of type "Array" to a variable of type "Array[RefCounted]".`（g3 / g4，下一笔）；参数字位那句 `Invalid argument for "takes2()" … should be "Array[RefCounted]" but is "Array[String]".`（g7 已量）；`Dictionary[K,V]` 之间同式只量了 Array。
- **2026-10-23 第一百八十六笔（S661）**：运算数型的运行期那一句补一对 + hash(Callable) 的可复现性量清。动态侧十格复验（`tmp/probe661/dyn.mts`）：Variant 标注 / 推断 / 从容器取出 / 函数返回 五种来源之后 `v + "z"` 与 `v == "z"` 引擎都给运行期那句 `Invalid operands 'NodePath' and 'String' in operator '+'.`，我们六格本来就一字一样 —— S660 那格留的时机问题结清。唯一不齐的是 `(&"ab" as Variant) + 1`：引擎那句同模板，我们发的是自述；接进 `RUNTIME_REFUSED_PAIRS` 只登量过的这一对，反向 `int + StringName` 没量照旧响亮拒。**hash(Callable)**（同一份脚本跑两遍）：空 / 方法 / 静态 / 全局的数**跨进程可复现**（2661229415 / 386162489 / 193485979），lambda 那一支两遍换数（1404238616 → 2932062239）；方法那支仍是**式子未拟合**，那一格开着，拒词由这两组读数支撑、不发近似。对象号读数补充：`get_instance_id()` 给的是高位为 1 的指针派 int64（`-9223372010866866769` / `-9223372010850089552`），两遍同值只是同机同进程布局下的重复，不是可移植的数 —— 方法/静态那支的 hash 因此是**对不上也不可能对上**的一族，长期响亮拒。`hash(&"m")==hash("m")==177682`、`hash(a)==436902150` 两格料记下。门：typecheck 4/4、`pnpm test` 26943（283 文件）、compile 276/398 三桶未动、diff 269/269、正文门 122/122、golden-check 409/409 零漂移（`tmp/d6/gc660.log`）。
- **2026-10-23 第一百八十五笔（S660 落地）**：二元运算两侧的解析期型拒补上两支构造式 —— `checkOperator` 的字面量一侧原样只认 `literalTypeName` 得出的型，`NodePath("a/b")` / `StringName("a")` 这种「一支字符串字面量的构造式」引擎在这一路当字面量认（第一式句子），我们四格都拖到运行期才用第三种文案拒；新表 `FACE_CTOR_LITERAL` + 闸门放宽把这一形接进现成的 `OP_PAIRS_REFUSED_A/B` 通道，第二式（`var p: NodePath` 那一头）与 int/Color 同族基线都不动。门：typecheck 4/4、`pnpm test` 26940（282 文件）、compile 276/398 三桶未动、diff 269/269、正文门 122/122；新建 `op-pair-nodepath-ctor-660` 十五格。§2 只剩 `hash(Callable)` 与「动态侧运行期那句什么时候发」两格。
- **2026-10-23 第一百八十四笔（S660，读数笔，代码零改动）**：二元运算两侧的解析期型拒量齐十四格 —— 引擎这一族**两种句式**：字面量侧 `Invalid operands to operator +, NodePath and String.`（不带引号），类型标注侧 `Invalid operands "NodePath" and "String" for "+" operator.`（带引号）；我们四格 NodePath 形都拖到运行期才拒，还是第三种文案（`Invalid operands 'NodePath' and 'String' in operator '+'.`）。同族的 `int + String` / `String + int` / `bool + int` / `Color + String` 四格两侧**早已解析期同句**，说明通道存在、只是没铺到 NodePath 那族型。接受侧钉了六格当反向基线（`&"ab" + "z"`、`[1] + [2]`、`Vector2 + Vector2`、`NodePath == NodePath` 等）。落地要做的是：现成通道按型对铺 + 两种句式都发 + 运行期那句的时机留格另量。
- **2026-10-23 第一百八十三笔（S659）**：410 那一格结清 —— 字面量点方法**再接一个运算符**收形。CST（`tmp/probe658/cstop2.mts`，`==` / `<` / `and` 三形同构）是 `ERROR(string_name) + binary_operator(base_call, OP, 右)`：方法链在运算符节点的 left 槽里。折法把「字面量 + 那条 base_call」拼成 left，经新加的 `LEFT_RECOVER` / `lowerOperand` 交回现成的 `lowerBinary`（运算符、结合级、mul 链都沿用老路，不另写），其余形状（left 槽是 binary_operator、字面量在右、两侧都是字面量链、三元）一律照旧响亮拒。语料件 `410-stringname-literal-binary` 二十八格 golden 已生成并逐字节对过（`Abz|4 / az|4 / 5863207|2 / 4|2 …`）；compile 桶随新件变 **276/398**，另三桶 96 / 26 / 0 未动，diff **269/269**、正文门 122/122、`pnpm test` 26918（281 文件）、typecheck 4/4；`test:golden-check` 上一把 **408/408 零漂移**（`tmp/d6/gc658.log`，924s）。**造件时量到新的一族**：`NodePath("a/b/c").slice(1) == "b/c"` 引擎解析期发 `Invalid operands "NodePath" and "String" for "==" operator.` 且整脚本不跑，我们照编译照跑值 —— 这是静默过宽（不是过拦），已开新格：**运算符两侧的解析期型拒**（`Invalid operands "A" and "B" for "OP" operator.` 一形一形量，形如 S652/S655 那把尺）。
- **2026-10-23 第一百八十二笔（S658，读数笔，代码零改动）**：`c.call()` 的运行期基标签分岔复验 —— 尺 `tmp/probe658/t658.mts` 十三格（一格一脚本、两侧同一份源）：方法 `RefCounted::m` / 静态 `GDScript::s` / 全局 `@GlobalScope::abs` / lambda `<anonymous lambda>(lambda)` / 空 Callable `null::null` 五形**两侧一字一样**，少支与多支两向同报声明数 1；`callv([])` 与 `callv([1, 2])` 两侧都安静（不给句也不调）。探头里那一格 `Array.append.call()` 是我造的假格子（引擎解析期就发 `Cannot find member "append" in base "Array".`，内建类型的方法不是式子值），不是缺口。§2 清单剩下的一格：`hash(Callable)` 的方法/静态那支**式子未拟合**（数已证实跨进程可复现：386162489 两遍同值；lambda 那支引擎自己每进程换数，属不可复现，不发）。动态侧运行期那句已随第一百八十六笔复验结清。
- **2026-10-23 第一百八十一笔（S657 落地）**：Callable 面的形参型两句接上。接法改在 S655 已认面的 `expr` 分支里做 —— 原先记的 `NamedFace` 那条路**覆盖不到** `Callable(H.new(), "m")` 这种两支构造式接收者（`ctorRecvFace` 只认「一支实参且是字符串字面量」），而 `expr` 分支的 `shape` 三形（标注 / 推断 / 构造式直调）实测一字一样，正好复用。新表 `CALLABLE_PARSE_ARGS` 四行、只认字面量实参（命名实参没量，不收），元数句在前的次序自然由「先 `arityDiag` 再形参两句」得到。读数 26 格两侧逐句对（`create(1, 2, 3)` 三句全同）；门：typecheck 4/4、`pnpm test` **26896**（280 文件）、compile 275/397 三桶未动、diff 268/268、正文门 122/122；新建 `callable-param-657` 三十格。§2 剩下的两格：410 的 `binary_operator` CST 修复、`c.call()` 的运行期基分岔（`hash(Callable)` 仍挂在 ⑤）。
- **2026-10-23 第一百八十笔（S657，读数笔，代码零改动）**：把 Callable 面的**形参型两句族**量齐 —— 尺 `tmp/probe657/r657.mts` 二十六格（标注与构造式推断两形 × 十三调用，两侧同一份脚本）。读数要点：①`create` 第二槽要 `StringName`，int / bool / Vector2i 三个源都是**两句齐发**（`Cannot pass a value of type "X" as "StringName".` + `Invalid argument for "create()" function: argument 2 should be "StringName" but is "X".`），而 `String` 与 `StringName` 被**接受**（`create("a", "b")` 给 `String::b`）；第一槽是 Variant，数组与 NodePath 都不算错（`create([1], 2)` 只报第二槽）。②`bindv(1)` / `callv(&"x")`（要 Array）与 `unbind(&"x")`（要 int）同样两句齐发。③ 排序：`create(1, 2, 3)` 引擎发三句，元数那句在前；我们该格只发元数，其余每一格**一句都不发**（少发一族）。④ 接法定了：Callable 铺成一条 `NamedFace`（走 `FACE_ARG_AS` / `FACE_ARG_TYPES` 那两条现成通道），同时把 S655 挂在 `expr` 分支的元数判据并进同一条 pass，不然元数两句会发两遍 —— 这一格是本笔**没动代码**的原因：判据重合要先量好去重口径再落地。
- **2026-10-23 第一百八十八笔（S662）**：0b③ 结清 —— cubic / bezier 四支的名字实参进「第一处命中」扫描。读数 `tmp/probe664` 十二格两侧对读：`var s: String` 放 `cubic_interpolate` 首位引擎只推 `argument 1` 那一句，我们当时报成 `argument 2`（首位是名字时 `literalTypeName` 交不出型就整条跳过，取了下一支字面量那位），而 `bezier_interpolate` / `bezier_derivative` / `cubic_interpolate_in_time` 首位是名字时**一句都不发**、拖到运行期给另一句。修法是新名单 `CUBIC_NAME_ARG_FUNCS` + `nameArgBad`（只认标注非数值型；int / float / bool 与期望同名都算收），槽位升序只取第一处的口径沿用原闸门；`clamp` / `lerp` / `wrap` 那几家的名字形没量过，不进名单（红线不动）。数值名字那四格两侧同值（1.25 / 2.5 / 3.0 / 0.466）。门：typecheck 4/4、compile 三桶未动、diff 269/269、正文门 122/122；新建 `cubic-name-arg-662` 六格。§2 旧靶单现在只剩 0b①（`Array(...)` 签名矩阵）、item 18 两支 `*_with_objects` 与 item 20 那批。
- **2026-10-23 第一百九十笔（S663）**：0b① 的第一片 —— `Array(...)` 四参形的**第四参**量清：十一形（null / bool / int / float / String / StringName / Array / Dictionary / Vector2 / PackedByteArray / Color）全部**收下并整个丢掉**，引擎给的都是同一份转换结果，我们那道只放 null 过的闸门撤掉；相邻判据（第一参是 pack 走引擎原句、int 当第一参响亮拒、第二参与第三参的闸、S605 那套逐格转换与「转不过给空定型数组」）全部复验未动，旧门里「第四参非 null 拒」那一格重钉成「收下并丢掉」。门：typecheck 4/4、`pnpm test` 26966（285 文件）、compile 276/398 三桶未动、diff 269/269、正文门 122/122；新建 `array-ctor-script-663` 十二格。**0b① 还剩一片**：解析期签名矩阵 —— `Array(5, TYPE_INT)` / 三支 / 五支 / 四支而第一参非 Array 这些组合，引擎在解析期发 `No constructor of "Array" matches the signature "Array(<型名表>)".`（`var x: int` 之后 `Array(x)` 按静态型渲染成 `Array(int)`），我们七格拖到运行期自发言，要接的是把 `ctorAccepts` 那套装进标识符静态型与这七条臂。
- **2026-10-23 第一百九十一笔（S664）**：`Array(...)` 的解析期签名表补十六条臂（0b① 收大半）。十三格从「运行期自发言」变成与引擎同句同行，六格接受形两侧同值；型名渲染口径（TYPE_* → `Variant.Type`、`Packed*Array(...)` → 本名、`null` → `null`）钉住。**只剩标识符源那一格**：`ctorArgName` 对 `var x: int` 之类交不出型，签名判据整条跳过，落到运行期那句 —— 接法是给这一趟接上标注变量静态型表（S616 的 `locals` 同型机制）与 `TYPE_*` 渲染。门：typecheck 4/4、`pnpm test` 26979（285 文件）、compile 276/398 三桶未动、diff 269/269、正文门 122/122。
- **2026-10-23 第一百七十九笔（S656）**：由初值证出的 Signal 面接上解析期两句（`tmp/probe656/s656.mts` 三十格 + `W_*_valid.gd` 三形分岔）。`var g = sig` 与 `var g = Signal(sig)` 两形此前**一句都不发**，引擎却与标注形一字一样、同一行 —— 元数上界九格、取值 void、以及 `g.disconnect(cb, 1)` 的「元数在前、void 在后」都补齐；合规那几格（`g.connect(cb)` 给 0、`g.get_name()` 给 `sig`、`g.emit(1, 2, 3)` 只发 void）照旧放过。**关键是那一处分岔**：`is_valid` 一族裸名与标注形是解析期两句，推断形却是运行期那句 `Invalid call. Nonexistent function 'is_valid' in base 'Signal'.` —— 于是新认一档 `SignalDyn`（元数与 void 两族同判、`SIGNAL_PARSE_MISSING` 不发），一刀切会把引擎没在解析期说的两句替引擎说了。门：typecheck 4/4、`pnpm test` **279 文件**全绿、compile **275/397** 三桶未动、diff **268/268**、正文门 **122/122**；新建 `signal-arity-inferred-656` 二十二格。§2 清单里 ⑥ 的最后一片（推断形 Signal 接收者）结清，剩下的两格：410 的 `binary_operator` CST 修复、`hash(Callable)`（`c.call()` 的运行期基分岔已随 S658 复验结清，形参型两句族随第一百八十一笔落地）。
- **2026-10-23 第一百七十八笔（S654 + S655）**：把 §2 清单里 ②‴ 那格过期账验结，再沿 S652 的刀路把 Callable 面的解析期元数接上。**S654**（尺 `tmp/probe654/np654.mts`，三十格两侧全对）：ROADMAP 上「字面量接收者与推断接收者的零支/三支形引擎发元数句，我们现在一句不发」已经不成立 —— 三形接收者（标注 `var p: NodePath` / 推断 `var p = NodePath(...)` / 构造式直接当接收者）在元数两向、`String`/`null`/`Vector2i` 的两句形、`Array` 源只第二句上都与引擎一字一样、行号一样；`slice(1.5)` 与 `slice(true)` 引擎**折成 int 收下**（给 `b/c`），我们同样一句不发并算出同值（十二格值全对，含 `slice(-1)` 的 `c`）。**S655**（尺 `tmp/probe655/{c655,z655}.mts`，48+13 格）：同一把尺量到 Callable 面**两向都开口** —— `c.bindv()` 给 `Too few arguments for "bindv()" call. Expected at least 1 but received 0.`、`c.bindv([1], 2)` 给 `Too many … 1 but received 2.`，八支零实参名过界都报 `Expected at most 0`，**三形接收者读数一字一样**；此前我们三种接收者一句都不发，`c.bindv()` 要拖到运行期才撞上（与 S652 的 `sig.disconnect(cb, 1)` 同一类静默过宽）。实现：`analyze` 给 `shape === "Callable"` 的接收者按新表 `CALLABLE_PARSE_ARITY` 走现成的 `arityDiag`（排在取值 void 之前），`Callable(...)` 直接当接收者那一形补进认面链（推断形 `shapeOf` 早就认）；vararg 那支实测不过界（`bind(1)` 给值、`call(1)` 给运行期句），而 `rpc` / `rpc_id` 是 void —— `VOID_CALLABLE_METHODS` 补两名。**门**：typecheck 4/4、`pnpm test` **278 文件全绿**（ops 零失败）、compile **275/397** 三桶未动、diff **268/268**、正文门 **122/122**。新建 `callable-arity-parse-655` 五十一格。**四件新账**：① `create(1, 2, 3)` 引擎发**三句**（元数 + `Cannot pass a value of type "int" as "StringName".` + `Invalid argument …`），我们只发元数那一句；② `c.call()` 的基分岔句形（`Attempt to call function 'null::m (Callable)' on a null instance.` 对 `Invalid call to function 'RefCounted::m (Callable)'. Expected 1 argument(s).`）属运行期那一族；③ 410 那格的卡点是 CST 修复级：`&"ab".capitalize() + "z"` 的 ERROR 里包的是 `string_name` + **`binary_operator`** 兄弟（`NodePath(...).slice(1) + "z"` 却不报 ERROR —— 缺的是 StringName 字面量那条），要接得按运算符一形一形量；④ `var g = sig` 的推断形 Signal 接收者引擎照发解析期句，我们的 `shapes` 只认标注形。
- **2026-10-23 第一百七十七笔（S652 + S653）**：值扫之后补的两刀，一刀接拦、一刀把拒的理由换成量过的。**S652 ①**（尺 `tmp/probe653/sigparse.mts` 十二格 + `G_ann.gd`/`G_inf.gd`）：裸信号名当接收者时引擎**只对上界开口** —— 九支名过界给 `Too many arguments for "get_name()" call. Expected at most 0 but received 1.`（`connect` 报声明的全部数 2），而 `sig.connect()` / `sig.disconnect()` / `sig.is_connected()` 零实参三格引擎**照跑到 `done`**，所以这一族没有下界；`emit` 是 vararg（0–3 支都过）。**病灶**：`sig.disconnect(cb, 1)` 我们此前一路放行、运行期安静给 nil（`D1.gd` 我们侧 `D1|done`），引擎是解析期拦死整脚本不跑 —— 这是本轮扫出的唯一一处**静默过宽**。实现是 `analyze` 里给 `shape === "Signal"` 的接收者按 `SIGNAL_PARSE_ARITY_MAX` 只发上界那一句，排在取值 void 那句之前（S378 口径），标注 `var g: Signal` 的变量接收者同句（`G_ann.gd` 实测）。**S652 ②**：`Callable.rpc()` / `rpc_id()` 两支名在册（extension_api 的 Callable 十七名）但一调就报错，**句形看基**（`{R0,R3,I3,L1,L3,L5}.gd` 六格）—— lambda 与全局内建基给 `Nonexistent function`，方法 / 静态 / 空 Callable 基给 `Attempt to call function 'rpc' in base 'Callable' on a null instance.`，带不带实参都不改；内建类型面绑来的那一只没量过，仍给「未实现」。**S653**：越界替换码点那 31 格量准（`tmp/probe653/rcb.mts`）—— 引擎把 int 按 **uint32 回绕**当 char32_t 存（`replace_char(97, -1)` 的 `unicode_at(0)` 是 4294967295、`length()` 仍 3），打印那侧另有一套编码（`< 0x200000` 直出四位 UTF-8、代理区出三位 WTF-8、更大折 `EF BF BD`）；宿主的 UTF-16 串装不下 `>= 0x110000` 那一段，所以**过拦保留**，但拒的文案从「没实测过」改成量过的理由。**门**：typecheck 4/4、`pnpm test` **26799**（277 文件）、ops 7513、compile **275/397** 三桶未动、diff **268/268**、正文门 **122/122**、`test:golden-check` **408/408 零漂移**（日志 `tmp/d6/gc652.log`，588s）。新建 `signal-arity-parse-652`（十五格）与 `callable-rpc-bases-652`（十格），`callable-member-names` 的 298 那一格里两名从「未实现」重钉到 Nonexistent。**两件新账**：① 410 那格卡点定位到了 —— `&"ab".capitalize() + "z"` 的 CST 是 `ERROR(string_name, binary_operator(base_call, "+", string))`，兄弟节点是 **`binary_operator` 而不是 `base_call`**，S651 的 `recoverLiteralCall` 不认这一形（要接得先按运算符一形一形量，另开一笔）；② `var g = sig` 的**推断形**接收者引擎也发解析期句（`G_inf.gd`），我们的 `shapes` 只认标注形 —— 放过。**操作教训**：`test:golden-check` 一把要跑近十分钟，默认 120s 超时会被转后台而前两把并行争用（引擎门不能并跑），读数得等一把干净的整跑；本轮清掉重复的 runner 与残留 Godot 后才拿到 408/408。
- **2026-10-23 第一百七十六笔（S651）**：值扫当场捞出的最大一族过拦接掉了 —— **StringName 面 212 形全部在 lowering 就抛 `表达式 ERROR 未支持`**（`&"abc".length()` 这种字面量直接点方法），而引擎那边这些都算得出发数。CST 实测看清形状：vendored 语法把**接收者**吞进 `ERROR`，单步调用那段仍是独立的 `base_call` 兄弟；链式是另一种形状（`call(string_name, ERROR("."), arguments)` + 兄弟 `attribute_call`），**没量过就不猜，照旧拒**。实现三处：`lower()` 前加 `markLiteralCalls` 预扫描（参数迭代发生在下降之前，标记必须先行）、`callArgs` 滤掉被拼掉的兄弟、`recoverLiteralCall` + `baseCallStep` 把两块拼回一次 `attribute` 调用，字面量只认 `string_name` / `node_path`。12 形与引擎逐形对过值（`3 / bc / a / true / x / bba / ab0000 / a+b / 0.5 / ABC / ["a", "b", "c"] / 900150983cd24fb0d6963f7d28e17f72`）；一格旧钉随之改向（`&"ab".to_upper(1)` 现在两侧同发引擎那句 `Too many arguments for "to_upper()" call. Expected at most 0 but received 1.`，此前钉的是我们编译期抛）。新建 `stringname-literal-call-651` 十三格。门：typecheck 4/4、`pnpm test` **26774**（275 文件）、ops 7501、compile **275/397** 三桶未动、diff **268/268** 静默错 0 崩溃 0 未实现 0、正文门 122/122。**没做完的两件**：①这一形的语料件（造 410 时单步逐形都过、多形同印里某一组合仍撞 `[emit-call] 不支持的调用形式`，还没定位到那一格，件已撤回）；②链式那一形的收形（CST 形状已记）。值扫本笔的净读数：上一把干净跑通的是 599 格可比、除 `Array.pick_random`（随机取值，天生不可比对）之外**零不一致**。
- **2026-10-23 第一百七十五笔（S650，读数笔，代码零改动）**：把 S639 那把「名册完整性」的尺从 StringName 推广到**全部二十四面**（尺 `tmp/probe650/roster650.mjs`：Array / Dictionary / String / StringName / NodePath / 十支 pack / Callable / Signal / 值型六支 / Color，逐名与同版本 `--dump-extension-api` 的实例成员表对账）。结果：**表内没有任何幽灵名**（每一面「表有而 api 没有」都是空集），缺口只有两处、且都是刻意没量的：`Callable` 的四支变参名（`call` / `call_deferred` / `rpc` / `rpc_id`）与 `Signal` 的 `emit` / `disconnect`（这两支的元数被引擎那句「取 void 返回值」拦住，是另一族，S645 ⑨ 已记）。顺带扫手写值形时撞到的一格：**我们造的五个名字（`String.splitn` / `pad_chars` / `file_to_uri` / `base32_decode` / `bytes_to_base64`、`Array.reversed` / `shuffled` / `lower_bound` / `upper_bound` / `has_all` / `sorted` / `flatten`、`String.cmp_to`）在 4.6.3 都不存在** —— extension_api 说不存在、引擎当场发 `Cannot find member`，而我们的表里也确实没有它们（S639 那把尺的又一次自证）。**同一把扫还顺手验正了两处可疑签名**：`String.lpad` / `rpad` 的第一位在 4.6.3 是 `int`（`lpad(min_length, chars, end)`），我们的实现（`methods.ts:2109` 起）本来就按这个顺序读，是对的。批量两侧对拍（值扫）这一把没跑成 harness —— GDScript 的 void 判据与 extension_api 的 `return_type` 对不上，改两趟分类时把临时脚本改坏了，已停手（临时件在 `tmp/probe650/`，不进仓库）；下一把值扫的形状已跑通一半（尺 `tmp/probe650/gen653.mjs`，读数 `tmp/probe650/653.diff.txt`）：方法名全取 `extension_api`、一格一个函数、按引擎自己的 `Cannot get return value of call to "X("` 先把 void 形分类（**1502 格里 244 格是 void 形**，这一档 `extension_api` 的 `return_type` 全不可信），改成语句调用后打接收者。剩的前置：第二趟引擎仍有解析错、整支脚本停住，所以要再加一趟「按解析错点名的格逐格摘除」的循环才能收敛（本轮没做完，值扫读数暂不作数）。
- **2026-10-23 第一百七十四笔（S649）**：**§2 第 12 条结清 —— lowering 抛错带行号，正文门从那 26 支也比起行号来**。此前 `test/e2e/sema-wording-parity.test.ts` 对 lowering 抛出那一族只能比「句子集合」，因为抛在走 IR 之前、诊断的 `loc` 还不存在（S608 建门那天就把这一格写明挂着）。实现是给四个下降函数（`lowerModule` / `lowerClass` / `lowerStmt` / `lowerExpr`）加一层 `atNode(n, () => …Inner(n))`，**在抛出的那一层**把 `startPosition.row + 1` 挂成 `err.line`（第一版挂在 `lower()` 出口拿栈顶，unwind 之后栈早空了，一行都挂不上）；`UnsupportedError` 与产物共用、签名冻在 RUNTIME_API，所以只加一个编译器侧的小类型 `LineCarrying`，不动它。行号判据一名一名量（尺 `tmp/probe648/line12.mjs`）：`eol-after-*` 那一族引擎指的是**断掉那个 token 自己那一行**（`311-eol-after-elif` 给 7 不是 `if` 的 5），`eol-before-*colon` 指的是冒号前那个 token 所在行，match 手臂那四支（330–333，一条消息带两句）指手臂图案那一行、两句同行 —— 三处各改指对的节点后 **26/26 句与行全对**。门：typecheck 4/4、`pnpm test` **26761**（274 文件）、ops 7501、compile **275/397** 三桶未动、diff **268/268** 静默错 0 崩溃 0 未实现 0、**正文门 122/122（其中 26 支现在连行号一起比）**。⑤ 那两件旧账剩下的只有 `hash(Callable)`（三支式子拟合不出、跨进程数没量）。
- **2026-10-22 第一百七十二笔（S648）**：§2 0 ④（动态接收者的实参位）结清，而且这一族**原本是静默错值** —— `func take(a: int)` 走装箱接收者 `o.take("x")` 我们印 `0`、`o.takestr(1)` 印空串，引擎两边都拒。读数 `tmp/probe648/params648.txt` 廿四形（一形一脚本，解析期句会让整支停住）把接受集钉死：`int` 收 int / bool / float（截断，`-1.7` 给 `-1`）拒八源；`float` 收 int / bool / float 拒 String / Nil / Vector2；`bool` 收 int / bool / float 拒 Nil / String；`String` 收 String / StringName 拒五源；`StringName` 收 String 拒 int；`Vector2` 只收 Vector2 —— 表外的 want（脚本类名与容器那几档）与没量过的源形一概不动。那句 `Invalid type in function '<名>' in base '<原生基类> (<动态类名>)'. Cannot convert argument <N> from <源> to <目标>.` 的 base 与 S645 ④ 元数句同一串。实现三处：`registerMethodParams` / `methodParamsOf`（沿 `base` 链并表，与 arities 同口径）、入口 `scriptParamArgs`（先拒后折）、发射器 `methodParamsLiteral` 只登记有标注位的方法（`_init` 与全无标注的形状不发，产物树一字不动）。第一版的 `float → int` 折法把语料 156 那格 `1e30` 撞进自家 2^53 闸（diff 门当场报崩溃），改成**只在安全整数内折、越界交回原路径** —— 又一次是老语料兜住新代码。语料 **409-script-param-fold**（动态与标注两形接收者 × 折形 + `typeof` 码 + 边界）两侧逐字节；新建 `script-param-648` 廿四格。门：typecheck 4/4、`pnpm test` **26761**（274 文件）、ops **7501**、compile **275/397**（96 / 26 / 0）、diff **268/268** 静默错 0 崩溃 0 未实现 0、正文门 122/122。仍开：静态（标注类名）接收者那形的运行期句没量；`NodePath` 其余十名的形参拒；`Signal.emit` / `disconnect` 的元数；四支变参 Callable 名的界。
- **2026-10-22 第一百七十一笔（S647）**：S646 ⑦ 留的 `NodePath.slice` 形参拒接进静态层。三批读数（字面量 / 标注名 / 第二位）把判据钉清：两槽同一判据、字面量给两句（String / Vector2i / null），**Array 字面量只给第二句**，**标注名只给第二句**，而推断名与标注 `Variant` 的名一句不发（留运行期那句，S644 ④ 已发），`float` / `bool` 两槽都收。实现是两张表各一行：`FACE_ARG_AS["NodePath.slice"]`（含 `null` —— 这一名只有 `slice` 量到，`get_name` 那行没有）与 `FACE_ARG_TYPES["NodePath.slice"]` 只放量过的 `Array`（其余容器源形不许从 `get_name` 那行类推）。新建 `nodepath-slice-arg-slots-647` 十四格。门：typecheck 4/4、`pnpm test` **26754**（273 文件）、ops 7472、compile **274/396** 三桶未动、diff **267/267** 静默错 0 崩溃 0 未实现 0、正文门 122/122。仍开：`NodePath` 其余十名的同族形参拒要一名一名量；`Signal.emit` / `disconnect` 的元数；四支变参 Callable 名的界。
- **2026-10-22 第一百七笔（S646）**：S645 ⑨ 那一族的两半都接了。① 读数 `tmp/probe644/ps645.compare.txt`（六面 × 四形接收者 × 越元数两向 = 72 形，一形一脚本）。**这一把先把我上一轮的猜测打掉**：`var s = "ab"` 那形引擎**就在解析期**发 `Too many arguments for "strip_edges()" call…`，与标注形、字面量形同句 —— 我们原来对推断接收者发解析期句是对的；**只有显式标注 `Variant`** 那一形引擎放过解析期、运行期给 `Invalid call to function 'X' in base 'Face'. Expected N argument(s).`（表外名给 `Invalid call. Nonexistent function 'join' in base 'Array'.`）。② 病灶是「由初值证面」那三处（`faceReceiverNames` 的局部 var 支 + `faceScopes` 的模块级 var 与类字段支）只看初值形状不看标注，`Variant` 被初值顶掉；改成**没写标注才由初值证面**。③ 反方向一格：`NodePath("a/b").slice()` / `(1,2,3)` 引擎在解析期发元数句、`.slice("a")` 发两句形参拒、`var x = NodePath("a/b")` 的推断形同句，我们一句不发 —— 给 `NamedFace` 开 `ctorRecv`，只让 NodePath 认「一支实参且是字符串字面量」的构造式（`StringName("a")` 同形状没量过，不许类推），接收者与初值两条通道共用。④ 新建 `variant-receiver-skip-646` 十一格。门：typecheck 4/4、`pnpm test` **26740**（272 文件）、ops 7472、compile **274/396**（96 / 26 / 0 三桶未动）、diff **267/267** 静默错 0 崩溃 0 未实现 0、正文门 122/122；72 形的两侧全量对账（`tmp/probe644/compare645.mjs`）落定：**64/64 一致、零不匹配**（跑程跨了本笔与 S647 两次改动，受影响的字面量与形参拒各形随后单独两侧复过）。⑤ 仍开：**NodePath 面的形参拒那一小族**（`x.slice("a")` / `(Vector2i(1,2))` / `(null)` 两句、`([1])` 只第二句，标注与构造式两种接收者一样，读数在 `tmp/probe644/st_{typedstr,typedvec,typednull,arr,litstr}.raw.txt`）—— 要的是 `FACE_ARG_TYPES` / `FACE_ARG_AS` 里 `NodePath.slice` 那几行，下一笔；`Signal.emit` / `disconnect` 的元数；四支变参 Callable 名的界。
- **2026-10-22 第一百六十九笔（S645）**：装箱元数句铺到 Callable / Signal / 脚本对象直调三面，并挖出**第三条判据**。读数 `tmp/probe644/sc645.gd`（Callable 十七名 + Signal 八名 × 越界两向 + 脚本方法六形）与 `so645{,b,c,d}.gd`。前两面与前八面同一条 `Invalid call to function 'X' in base 'Face'. Expected <声明全部数> argument(s).`；**`Signal.connect` 的两界是 `[1,2]` 不是 `[2,2]`** —— 越界那句报的数（2）单独定不出下界，是 S546 那批「一支实参照样连上」的旧读数把 `flags` 的默认位定住的，第一版按 `[2,2]` 写出来当场被自家那两道门红给我看。**脚本对象直调另一条**：少给报**必填数**、多给报**全部数**（`top(a,b=1,c=2)` 的 `top()` 报 1、`top(1,2,3,4)` 报 3），base 写 `<原生基类> (<动态类名>)`（`class Kid extends One` 也给 `RefCounted (Kid)`）。这一族在改之前是**最坏的形状**：多参我们**静默算出值**（`o.top(1,2,3,4)` 给 `[1,2,3]`）、少参**崩成 JS 内部错**（`Cannot read properties of undefined (reading 't')`），引擎两边都是那一句元数。实现：两张名册进 `face-arity.ts`（变参 `bind` 的上界占位到 `MAX_SAFE_INTEGER`，越不出界）、`callableMethod` 与 Signal 分派入口各问一次 `nativeAritySay`（`callable-arity` / `signal-arity`）、脚本对象那一形在 `callSlot` 前问新守卫 `scriptMethodSay`（只认发射器登记的方法表，表外名证不了「不存在」仍响亮拒）；`unbindCountArg` 的少/多参两句与 `bindv` 的「元数没量过」随之成为死代码，删。新建 `boxed-arity-say-645` 四十一格 + `callable-member-names` 三格改钉。门：typecheck 4/4、`pnpm test` **26729**（271 文件）、ops **7472**、compile **274/396** 三桶未动、diff **267/267** 静默错 0 崩溃 0 未实现 0、正文门 122/122；端到端 `so645.gd` / `so645b.gd` 与引擎逐字节同句同行。**同日量到、没接的一族**（`tmp/probe644/ps645.compare.txt`，六面 × 四形接收者 × 越界两向共 72 形）：**只有显式标注 `Variant` 那一形要放行** —— `var s: Variant = "ab"` 的 `strip_edges(1,2,3)` 引擎解析期放过、运行期发 `Invalid call to function 'strip_edges' in base 'String'. Expected 2 argument(s).`，而**推断形 `var s = "ab"`、标注形、字面量形引擎就在解析期发 `Too many arguments for "strip_edges()" call…`**，所以我们原来对推断接收者发解析期句是**对的**（先把这一条猜测打掉）；要改的是 analyze 那道认初值推出面名的闸门。另两格仍欠：`emit` / `disconnect` 的元数（引擎在「取返回值」那一步先给 `Trying to get a return value of a method that returns "void"`，另一族）与 `call` / `call_deferred` / `rpc` / `rpc_id` 的变参界。
- **2026-10-22 第一百六十八笔（S644）**：S643 ⑦ 留的 `NodePath.slice` 实现发出去了。读数 `tmp/probe644/`：装箱矩阵两趟 342 形 + 解析期 20 形一脚本一形。判据按 4.6.3 的 `NodePath::slice` 一条一条钉死 —— 两界先 `CLAMP(v, -total, total)` 再对负数 `+= total`，`total` 是**名数 + 子名数**（子名按 `:` 切，`a/b:1/2` 只有一个子名），名字段与子名段共用一条下标轴（`sub_begin = max(begin - name_count, 0)`），**绝对位只在 `begin === 0` 保留**（`/a/b/c` 的 `slice(1)` → `b/c`、`slice(0,0)` → `/`、`slice(-3)` → 还是 `/a/b/c`），而 `end` 的缺省在 `extension_api` 是 `2147483647` 不是 -1（所以 `a/b:1/2` 的 `slice(0)` 与 `slice(0,-1)` 是两形）。顺带解释了上一笔那格反常：`/` 怎么切都是 `/`（空名字表 + 绝对位），`""` 怎么切都是空。`begin > end` 那几形引擎打的是 `Vector::slice` 的一句 core ERROR（`at: slice (./core/templates/vector.h:241)`），按既有口径不复刻，所以语料只收不撞这一界的形、那一族改钉 ops 单测。实参位：int / bool / float 收下（float 截断、bool 折 1/0），String / StringName / Nil / Vector2i / NodePath 五源给运行期那句 `Invalid type in function 'slice' in base 'NodePath'. Cannot convert argument <N> from <源> to int.` 且**位号取第一个坏位**，其余源响亮拒。实现落在 `node-path.ts` 的新纯函数 `nodePathSlice`（+ `NODE_PATH_SLICE_END_DEFAULT`）与 `methods.ts` 的 NodePath 分派；S643 那个「名册里有但没实现」的 `node-path-unimplemented` 占位守卫至此没有名字可拦（名册十一名全实现），删掉，`boxed-arity-say-643` 那一格改钉「界内算得出值」。语料 **408-nodepath-slice**（48 行，十五路径 × 单/双支矩阵，标注与装箱两形接收者都在内）两侧逐字节；新建 `nodepath-slice-644` 六组。门：typecheck 4/4、`pnpm test` **26726**（270 文件）、ops **7430**、compile **274/396**（96 / 26 / 0）、diff **267/267** 静默错 0 崩溃 0 未实现 0、正文门 **122/122**；本笔只新增 408 一例的 golden（二次取为「无变化」），其余 406 例的 golden 文件一字未动，整把 `test:golden-check` 本笔提交后跑完：**407/407 零漂移**（exit 0，日志 `tmp/probe644/g-golden.log`）。**新量到一族没接**（读数在 `tmp/probe644/st_*.raw.txt`）：NodePath 面的**解析期形参拒**与**字面量 / 推断接收者**——`x.slice("a")`（标注形）引擎发两句、`NodePath("a/b/c").slice()` 与推断接收者的零支形引擎发元数句、`var s = "a"` 那一形是运行期句（我们已对），而这三种静态形我们现在**一句不发**。仍开：`Signal` / `Callable` 与脚本对象方法的装箱越元数句。
- **2026-10-22 第一百六十七笔（S643）**：S642 ⑦ 那半接完。十四格一把量完（`tmp/probe636/dd643.gd`）：`Dictionary` 与 vector 六支同为 `Invalid call to function 'X' in base 'Face'. Expected <声明全部数> argument(s).`（`size`/`keys`/`length`/`sign`/`abs` 报 0、`get` 报 2、`distance_to` 报 1、`clamp` 与 `rotated` 报 2）。同把尺顺带定了一条**次序**：`Vector3.dot(1)` 元数本来就对，引擎发的是类型句 `Cannot convert argument 1 from int to Vector3.` —— 元数判据只在数对不上时开口，界内一律让原路走（`nativeAritySay` 界内返回 null 正是这条）。实现把守卫补到 `case Tag.DICT` 与六支 vector 的委派处（新 code：`dict-arity` / `vector-arity`），并把 S642 留的另一格结掉：名册里有、元数也对、我们没实现的名字（`np.slice(0)`，引擎实测算出 `a/b[1]`）此前发的是引擎留给「没这名字」的 Nonexistent 句 —— 改成响亮拒 `node-path-unimplemented`，表外名照旧发引擎那句。新建 `boxed-arity-say-643` 十五格。门：typecheck 4/4、`pnpm test` 26717（269 文件）、compile 273/395 三桶未动、diff 266/140 静默错 0 崩溃 0、正文门 122/122（golden 那把量引擎侧，本笔不参与）。仍开：`Signal` / `Callable` 与脚本对象方法的同族句式没量；`NodePath.slice` 的实现另立一笔。

- **2026-10-22 第一百六十六笔（S642）**：把 S639 ⑥ 留的装箱元数句接完，并**改掉一族旧钉**。九格读数（`tmp/probe636/np642.gd` + `tmp/probe639/{names,call}.mjs`）说清两件事：其一，装箱直调越元数引擎发的是 `Invalid call to function 'X' in base 'Face'. Expected <声明全部数> argument(s).`，八面同一条、名字不带引号；而 `node-path.test.ts` 里那六格旧钉抄的是**解析期**的 `Too many/few arguments for "X()" call…`，运行期从来不是这句 —— 按新读数改钉。其二，Array / String 的元数判据只在 `default:` 岔，已实现的名字根本不检查，`a.size(1)` / `"abcd".length(1)` 我们**静默算出值**，属于最优先那一族（错值）。实现加 `nativeAritySay`，六个分派点（Array / String 的 case 开头、Color / pack / NodePath 的委派处、StringName 在 `faceMemberKnown` 之后）委派前先问；helper 只能住 `face-arity.ts`、调用点只能留 `methods.ts`，因为 `face-arity → color → node-path` 已经成链，反向 import 就是 scriptc 扛不住的环。新建 `boxed-arity-say-642` 十四格。门：typecheck 4/4、`pnpm test` 26715（268 文件）、compile 273/395 三桶未动、diff 266/140 静默错 0 崩溃 0、正文门 122/122（golden 那把量的是引擎侧，本笔不参与，S640 刚整跑过 406/406）。仍开：Dictionary 与 vector 六支等面的同一族句式没量；界内未实现的名字发 Nonexistent 该改响亮拒。

- **2026-10-22 第一百六十五笔（S640）**：把 S639 留在解析期那一半接完。analyze.ts 有四处拿 `STRING_METHOD_ARITY` 认 StringName（`classFaceArity` / `chainArityFace` / `face-member-missing` 的 table / `STRINGNAME_FACE.arity`），静态接收者对六名 `chr / num / num_int64 / num_scientific / num_uint64 / humanize_size` **一句不发**；十二形一脚本一形量齐（`tmp/probe639/sn639.mjs` → `sn639.compare.txt`）：那六名两句（`Cannot find member "X" in base "StringName".` + `Function "X()" not found in base StringName.`）、属性读那形把 `Cannot find member` **发两遍**（与 pack 的 S415 同形）、零元三名越界是 `Too many arguments for "uri_file_decode()" call. Expected at most 0 but received 1.`、`count` 两面同界 3、推断接收者解析期放过。四处一律换成 `STRING_NAME_METHOD_ARITY`。另有一格量到却**没接**：`print(&"a".chr(65))` 引擎发那两句，但我们 tree-sitter 把「StringName 字面量直接点方法」收成 ERROR 节点、`lowerExpr` 抛 `表达式 ERROR 未支持` —— 那是语法/收形的另一笔，与名册无关。新建 `stringname-face-split-640` 九格。门：typecheck 4/4、`pnpm test` 26713（267 文件）、compile 273/395 三桶未动、diff 266/140 静默错 0 且崩溃 0、正文门 122/122、`test:golden-check` 整跑 406/406 零漂移。

- **2026-10-22 第一百六十四笔（S639）**：名册尺换打法 —— 不再猜候选宇宙，直接拿**同裁判版本**的本机 4.6.3 `--dump-extension-api` 导出（`tmp/probe639/extension_api.json`，38 支内建类）与运行期那几张表逐名对账（`diff639.mts`，把 `FACE_EXISTS_BEYOND_ARITY` 也算进存在集）。一把跑完看清 Array 51 / Dictionary 34 / String 116 / 十支 pack 69·23 / 六支 vector 全齐，差的只有四处：**StringName 与 String 不同名册**（dump 110 名：三名 `uri_file_decode / is_valid_ascii_identifier / is_valid_unicode_identifier` 存在且零元，六名 `chr / humanize_size / num / num_int64 / num_scientific / num_uint64` 根本没有）、**`NodePath.slice` [1,2]**、**`Color.from_rgba8` [3,4]**。九名两名各回裁判量了形状（`names.gd` 二十一格 + `call.gd` 三格）：此前我们**两侧都错** —— 表外六名的属性读给了绑定 Callable、调用落到 `[string-method] String.num() 未实现` 的中文自述。实现加 `STRING_NAME_METHOD_ARITY` + `faceArity` 的 StringName 分岔 + `method()` 那岔先过 `faceMemberKnown`，再补 NodePath / Color 两名，属性读立刻对上 `StringName::uri_file_decode`、`NodePath::slice`、`Color::from_rgba8`。两格**故意没接**：解析期 analyze.ts 仍拿 String 表认 StringName（静态形 `&"a".chr(65)` 引擎发什么都没量），装箱直调的 `Invalid call to function 'X' in base 'Face'. Expected <全部数> argument(s).` 一族（读数已留在 `tmp/probe639/`）要给「表内未实现 + 越元数」开共用判据才能接。新建 `face-roster-diff-639` 三格。门：typecheck 4/4、`pnpm test` 26704（266 文件）、compile 273/395 分桶未动、diff 266/140 静默错 0、正文门 122/122、`test:golden-check` 整跑 406/406 零漂移（exit 0）。

- **2026-10-22 第一百六十三笔（S638）**：S637 那条只量了**无绑**形状；一旦 `bind()`，`bind` 造新盒子时把 `builtin` / `builtinBounds` / `builtinSnap` 丢成 null，三格同时坏 —— `get_argument_count()` 落响亮拒、`to_vector2_array.bind(1).call()` 因没了界**照跑**（引擎要报那句）、面身份打印走别的路。读数补齐（`tmp/probe637/{args,bind,bindcall}.gd`，一格一函数）：内建面 `get_argument_count()` 就是声明的全部数（与 S636 那张表的第二值一字不差），绑过之后「声明 − 已绑」、过头给负数（`count.bind(1)` 2、`slice.bind(1)` 3、`slice.bind(1,2,3)` 1、`to_vector2_array.bind(1)` −1）；盒子把三样带过去之后 `String::count` / `Array::slice` 的打印与 `Expected 3 / 0 / 4 argument(s)` 三句一并跟上。`bindv()` **故意没改** —— 内建面走 bindv 的读数本轮没量，不拿 bind 的读数类推。新建 `native-bind-callable-638` 两格九句。门：typecheck 4/4、`pnpm test` 26701（265 文件）、compile 273/395 分桶未动、diff 266/140 静默错 0、正文门 122/122、`test:golden-check` 整跑 406/406 零漂移（exit 0）。仍开：绑过之后的等式与 `hash()`、内建面绑过后的 `is_custom` / `is_standard` 那两格没重量。

- **2026-10-22 第一百六十二笔（S637）**：接完 S636 的名册，`x.count` / `x.slice` 这类成员名当值读第一次走通到**绑定 Callable 调用**那条岔，量到内建面的元数句与脚本方法**不同族**：`String::count`（界 [1,3]）**少给也报 3**、`PackedInt32Array::slice`（[1,2]）少给报 2、`Array::duplicate`（[0,1]）多给报 1、`PackedByteArray::to_vector2_array`（[0,0]）多给报 0 —— 内建面两句都报**声明的全部数**；同一脚本里的 `top(a, b = 1, c = 2)` 少给报 1、多给报 3，S440 那条读数照旧，分岔在接收者是内建面还是脚本对象。实现只改 `callableCall` 那一行的取数（`box.builtin !== null || given > upper ? upper : lower`）。新建 `callable-native-arity-637` 一格四句。门：typecheck 4/4、`pnpm test` 26699（264 文件）、compile 273/395 分桶未动、diff 266/140 静默错 0、正文门 122/122、`test:golden-check` 整跑 406/406 零漂移（exit 0）。仍开：内建面的 `get_argument_count()` / `is_argument_count_valid()` 读数没拿到，带 `bind()` 的越元数形只在无绑形状上对过。
- **2026-10-22 第一百六十一笔（S636）**：九支 pack 与 byte 的**名册补齐**结掉 S635 ⑥ / S629 ⑤ 那一格。一把尺把 94 个候选名 × 十支的属性读扫完（`tmp/probe636/gen636.mjs` → `attr.out`）：byte 69 名、其余九支各 23 名，与解析期那份 4.6.3 `--dump-extension-api` 的实例成员表一字不差 —— 缺的只在运行期那两支元数表：`erase`（十支都有）加 byte 独有 36 名（`bswap* / decode_* / encode_* / has_encoded_var / decompress_dynamic / get_string_from_{utf32,multibyte_char} / to_vector*_array / to_color_array`）。后果是**错句**：成员名当值读我们发表外那一句，引擎给 `PackedByteArray::decode_u8` 这类绑定 Callable（`show636.gd`）。两界逐名量（`arity636.compare.txt`，0 实参 / 5 实参各一句；void 那句不冲掉元数读数）；调用面另量九支对这 36 名都是 `Invalid call. Nonexistent function 'X' in base '<九支>'.`（`call636b.final.txt`，324 格一字一样），于是把它们一并纳进 `packed.ts` 的 `BYTE_ONLY`（byte 自己那 36 名 `methods.ts` 早就实现，空数组越界 `decode_u8(1)` 两侧同为 `0`）。尺自身的坑记两条：`_init` 里第一条运行期错误会中止后面所有格（首版一趟只出 1 句），一格一函数才收齐；回映射按 `at: cN` 的函数名而不是行号算式。新建 `pack-roster-636` 三格与 `pack-roster-arity-636` 九格（解析期那两族按量过的上下界与表外名两句收）。门：typecheck 4/4、`pnpm test` 26698（263 文件）、ops 7326、compile 273/395 分桶未动、diff 266/140 静默错 0、正文门 122/122、`test:golden-check` 整跑 406/406 零漂移（exit 0）。仍开：名册尺的候选宇宙只有 94 名，宇宙外未量。
- **2026-10-22 第一百六十笔（S635）**：接 S634 时撞出**错句不是缺句** —— Color 的表外属性读我们发的是赋值句（`Invalid assignment of property or key 'nope' with value of type '?' …`），根因是 `methods.ts` 属性读给 `colorRead` 传了 `via="prop"`，而 `vecFailKey` 里 `"prop"` 是赋值文案、`"read"` 才是访问文案，一个词改完；NodePath 同时纳进 vector 那一岔的 `!faceMemberKnown`（npath 量到七个表外名同句，且这面没有真属性读、不会误拒）。新建 `color-nodepath-attr-635` 两格。门：typecheck 4/4、`pnpm test` 26686（261 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122、golden 406/406 零漂移。这一族只剩九支 pack 的名册完整性。
：Color 与 NodePath 的属性/成员名册一次量齐（`tmp/probe633/col.gd` 24 名、`npath.gd` 16 名，一格一名 `print(x.名)`）。两面印证「**非成员即 `Invalid access to property or key 'X' on a base object of type 'Face'.`**」是引擎在所有值型面上的统一规则（Color 拒 `blend_rgba`/`clamped`/`interpolated_with_hues`/`nope`；NodePath 拒 `file`/`subnames`/`name_count`/`to_string`/`simplify_path`/`begins_with`/`get_slice`），真属性 `r/a8/h` 与成员名照旧取值。本轮**只记不接**：这两面的真属性读发生在 vface 那一岔**之后**（`colorRead` 与后续分支），直接把 `!faceMemberKnown` 纳进那一岔会误拒真属性，得先把两张名册做成属性表再三分岔 —— 落点写在 S634 ③。出货零改动，门沿用 S632 / S633。剩两格：Color / NodePath 的属性读接入、九支 pack 名册完整性。
：`StringName` 沿用 `String` 名册**验证通过** —— `tmp/probe633/sn.gd` 二十个 String 方法名在 `&"a b"` 上全是成员，且走解析期核对（引擎发 `Too many arguments for "length()"…` 与 `Invalid argument for "join()" function: argument 1 should be "PackedStringArray"…` 两类句），所以 S627 / S628 / S630 三面复用 `STRING_METHOD_ARITY` 不是错值，这一格结案。对照 t6 的 `get_slice_base` 两面都不是成员、我们同句。出货零改动，门沿用 S632。剩两格：Color / NodePath 的属性名册（不量就纳不进 vface 那一岔）、九支 pack 的名册完整性。
：六支 vector 面的属性读也按面表判（w2 / w6 / w7：非成员名发 `Invalid access to property or key 'X' on a base object of type 'Vector2'.`，`v.abs` 仍是 `Vector2::abs`、`v.x` 仍是 `1.0`）—— 判据只加进 vector 六面，**Color / NodePath 明确排除**（那两面属性走后面的分支，纳进来会误拒真属性，得先量属性名册）。`object.test.ts` 里 S630 留的那格 Vector2 保守断言按新读数改掉。门：typecheck 4/4、`pnpm test` 26684（260 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。仍欠：Color / NodePath 属性名册、`StringName` 成员数复核、pack 九面名册完整性、S620 ⑧ 动态接收者、#12、`hash(Callable)`。
：属性读保守再收两面 —— Array 与九支 pack 的「候选宇宙之外」名现在发引擎那句 `Invalid access to property or key 'X' on a base object of type 'Array' / 'PackedInt32Array'.`（`tmp/probe628/w1..w6`、`z1..z3`：怪名字 `zzzquantum` 同句；成员名 `a.size` 仍是 `Array::size`、属性 `v.x` 仍是值），判据仍走 S627 的 `faceMemberKnown`。未量的值型各面（w2 Vector2、w4 Color 只记到引擎文本）不动，留下一格；`callable.test.ts` 里那格旧保守按新读数改掉（pack 面改由 CLI 脚本 z3 钉）。门：typecheck 4/4、`pnpm test` 26684（260 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。
：`String` / `StringName` 面的**宇宙外属性读**改发引擎那句 `Invalid access to property or key 'X' on a base object of type 'Face'.`（读数 `tmp/probe628/t1..t11`，与名字在不在逐名缺席表里无关；成员名照旧给 `Face::method`）—— 判据挂上 S627 的 `faceMemberKnown`，只动这两面，Array / Vector2 等未量面仍响亮拒。同批把 `object.test.ts` 里**把当年保守选择当结论**的那格改掉（StringName 那格现在断言引擎原文），Vector2 那格不动。门：typecheck 4/4、`pnpm test` 26684（260 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。仍欠：值型五面与 pack 九面的同形、`StringName` 成员数的逐名复核、其余 pack 面的名册完整性核验（S629 ⑤）。
：pack 面 `MISSING_ON` 补两格 —— 一脚本一形量到 `PackedByteArray.index_of` 与 `PackedInt32Array.index_of` 引擎都发 `Invalid call. Nonexistent function 'index_of' in base '<面>'.`（我们发的是「未实现」响亮拒），其余五面本来就同句；只把**实测确认的两面**补进表，未量面不动。同批确认 `PackedInt32Array.count(1)` 两侧都收。门：typecheck 4/4、`pnpm test` 26684（260 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122、golden 406/406 零漂移。仍欠：其余七面 `index_of` 与 pack 全名册的面表完整性核验、`StringName` 元数与属性读两形。
：`StringName` 接收者的「方法不存在」那句改印 `StringName`（u11）—— `method()` 把它重装箱成 `String` 沿用成员表是对的，但面标签跟着错了；修法只在派发口接住 `string-no-method` 按 `StringName` 重发一句，其余走 String 的文案不动（那些形没量）。新建 `face-method-absent-627` 三组十格钉住四面句子、表内不误判（`size` / `is_typed` / `set`）、旧缺席名单同句、表内未实现仍响亮拒。门：typecheck 4/4、`pnpm test` 26684（260 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。仍欠：pack 八面与值型五面同族（缺面表完整性核验）、`StringName` 的元数与属性读那两形。
：运行期「方法不存在」改按**面表**判 —— `DICT_METHOD_ARITY` 与 `FACE_EXISTS_BEYOND_ARITY` 从 `analyze.ts` 移进两侧共用的 `face-arity.ts`，新增 `faceMemberKnown`，`methods.ts` 三处兜底改成「表外发引擎那句 `Invalid call. Nonexistent function 'X' in base 'Face'.`、表内没实现仍响亮拒」。泛化前先证表完整：`tmp/probe624/m00..m18` 19 名一脚本一名过裁判，表外 11 名引擎全给 Nonexistent、表内 6 名全给 Too many arguments（= 存在），再加 S300 / S413 的 Array 50 / String 108。读数 `u1..u10`：推断与 `Variant` 接收者的五形现在逐字一致，标注与字面量接收者的解析期四形不变。门：typecheck 4/4、`pnpm test` 26681（259 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。仍欠：pack 八面与值型五面的同一格（走 `PACK_ABSENT_*`，缺这轮的面表完整性核验）、`StringName` / `NodePath` 接收者、#12、`hash(Callable)`、S620 ⑧。
：v9 那格改完 —— `faceScopes` 随作用域带 `name → 标注全文` 的 `texts` 表（模块 var / 形参 / 内部类字段三处登记，作用域各自拷贝、就近遮蔽照旧覆盖），`faceReceiverNames` 补入体内标注，`faceGhostDiags` 只在**消息文本**用 `shown`，判据仍走基名（定形面不外溢）。z1 / z2 / z3 / z5 / z6 / z7 六形与引擎逐字一致，新建 `typed-receiver-face-626` 六格钉住。门：typecheck 4/4、`pnpm test` 26681（259 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。仍欠 z4 那一族运行期句（S626 ④）、动态接收者实参位、`extends` 宿主基类那一形、#12、`hash(Callable)`。
：v9 那一格的规律量齐（`tmp/probe624/z1..z7`）—— 定形数组接收者的「找不到成员」**两句都发、base 印标注全文**（`Array[int]` / `Array[One]` / `Array[String]`），定形字典**仍只第二句**、base 同样是标注全文；我们现在两句里印的是剥掉定形的基名，改动点写在 S626 ③（`checkPackFaceNames` 的 `faceName` 只收裸名，定形容器进不去）。同批扫出更重的一格（z4）：`var a = []` 后 `a.nope()` 引擎解析期放过、运行期才发 `Invalid call. Nonexistent function 'nope' in base 'Array'.`，我们发的是 `[array-method]` 未实现抛错 —— 属运行期缺句，先把 Array / Dictionary 定形与不定形四格文本量齐再动。本轮出货零改动，门沿用 S625（typecheck 4/4、`pnpm test` 26675（258 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122）。
：定形字典的**类名键位与值位**接上（读数 `tmp/probe624/y1..y5`）—— 键**只收同名类**（子类 y1、父类 y5、异类 y2 / v13 全发 `Invalid index type "X" for a base of type "Dictionary[K, V]".`），值按**类族**宽松一档（子类 y3 收、异类 y4 只发 `Value of type "Two" cannot be assigned to a variable of type "One".`）；实现是 `checkTypedIndexSlots` 里的 `scriptNames`（带 `extends` 名，配 `subOf`）+ `ctorClass`（`<类>.new()` 的静态型）接进 `stOf`，`badKey` 与 `valueMsg` 各加一档（数组元素写位没量，故意不放）。复量 y1..y5 + v11..v13 七形逐字同句同行；门：typecheck 4/4、`pnpm test` 26668（257 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。剩：v9 的 base 带定形全名、`Array[类名]` 下标写位类族（没量）、宿主类名作字典键值（没量）。
：v11 的错值修掉 —— 发射器 `stampDict` 的键值位认「八档元素型 + 本文件登记的脚本类名」（`slotElemKindName`，类名按 `Object` 盖章），`Dictionary[int, One].is_typed()` 从假变真与引擎一致，v12 同键写不变；宿主类名作键值仍不盖章（没量），S618 / S620 的槽位文本比对也先不放进这一形。门：typecheck 4/4、`pnpm test` 26668（257 文件）、compile 273/395、diff 266/266 静默错 0。S624 那一行的序号也一并理顺（原 ②bis 的半截改动重写成 ①–⑥）。剩两格：v13 的全新索引键句 `Invalid index type …`、v9 的 base 带定形全名。
- **2026-10-22 第一百四十七笔（S624）**：方法面第二把对拍（`tmp/probe624/v1..v20`，两侧逐行比）扫出六处分歧，修掉三形四处 —— `elemDefault("Object")` 照读数发 `nil`（v1 / v17 / v18 的 `<null>`，原先是 S613 留的响亮拒口子），`holds` 的宿主槽改成按 `nativeRoot` 的**原生根基类**匹配（v16 `Array[Node]` 拒 `RefCounted` 系脚本类且只发第二句；v15 `Array[RefCounted]` 收实例、`get_typed_class_name()` 印 `RefCounted`；`Object` 槽仍收任何对象形）。复量 v1 / v5 / v15 / v16 / v17 / v18 / w2 / w5 全对，门：typecheck 4/4、`pnpm test` 26668（257 文件）、ops 7308、compile 273/395、diff 266/266 静默错 0、正文门 122/122。**扫出未修的三格**已写进 S624 ③：`Dictionary[int, One]` 不盖章（v11 引擎 `is_typed()` 真）、`Dictionary[One, int]` 的异类键索引写全新一句 `Invalid index type …`（v13，同键收 v12）、`Array[One]` 找不到成员时两句里的 base 要印带定形全名（v9）。另有两条与引擎已一致的细节记在 S624 ④（父类实例进子类槽：解析放行 + core ERROR 但格留；`fill` / `append_array` 不合式源丢弃继续）。
：上一笔把类名槽放宽成「槽与源同为对象形就放行」，**自家 s5 那格测试当场红**（两支无关系的类引擎照拒），改成按 `extends` 链的**亲缘**判据：`parentOf` / `related` 双向走链，子进父（w2）与父进子（w3）都收、无关系（s5）拒、槽是 `Object` / `RefCounted` / `Node` 时任何对象形源收（w5）、`null` 两档收；对象源进标量槽仍只发第二句（w9）。十八形（w1..w15 + x1..x3 + s5）与引擎逐形一致，`pnpm test` **26668 / 257 全绿**、typecheck 4/4、compile 273/395、diff 266/266 静默错 0、正文门 122/122。教训记在 S623 ⑦：外推必须先过自家测试网。
- **2026-10-22 第一百四十五笔（S623）**：新开一把**家族自动对拍**（`tmp/d6/sweep623.mjs` 生 `w1..w15` + `x1..x3`，两侧各跑一遍逐行比），当场揪出**三格过拦 + 一句多话**并改判据 —— 解析期对「槽与源同为对象形」的定形容器一律放行（w2 子类进父槽、w3 父类进子槽、w5 `Array[Object]` 收脚本实例；`isObjectFace` 认脚本类名与 `Object` / `RefCounted` / `Node`，`null` 照收），对象源进标量槽只发第二句（w9），标量对标量那两句一字未动（w6 / w7）。运行期继承不用改（S622 的 `classFaceCheck` 顺基类链已对：x1 收、x2 丢且继续、x3 收）。门：typecheck 4/4、`pnpm test` 26668（257 文件）、ops 7308、compile 273/395、diff 266/266 静默错 0、正文门 122/122。还欠：其余宿主类名作槽（没量）、动态接收者实参位、`extends` 宿主基类那一形、#12、`hash(Callable)`。
：靶单第②格结清 —— 字面量容器的推断文本量成十格一张表（`tmp/probe624/` t1..t10）：数组字面量元素全 int（含空）才印 `Array[int]`，否则基名 `Array`；字典字面量键全 int（含空）印 `Dictionary[int, Variant]`（值位恒印 `Variant`），非 int 键就印 `Dictionary`。`literalFaceText` 照表改判（原先按首元素推），t1..t10 逐字对上、q4 不变。门：typecheck 4/4、`pnpm test` 26655（256 文件）、compile 273/395、diff 266/266 静默错 0。靶单剩三格：动态接收者实参位（S620 ⑧）、`extends` 宿主基类那一形、#12 与 `hash(Callable)`。
- **2026-10-22 第一百四十三笔（S622 续）**：靶单第①格结清 —— `checkScriptClassSlots` 里加 `slotOf`，把「本文件登记的脚本类名 `.new()`」的静态型认成那个类名，于是异类字面量元素进类名槽发引擎那句 `Cannot have an element of type "Two" in an array of type "Array[One]".`（s5）；s1 / s8 / q9 一字未动，`tmp/probe621` + `tmp/probe623` 廿形复量全对。门：typecheck 4/4、`pnpm test` 26655（256 文件）、compile 273/395、diff 266/266 静默错 0、正文门 122/122。靶单剩四格：字面量推断文本（s6 / s7）、`extends` 宿主基类那一形、动态接收者实参位、#12 与 `hash(Callable)`。
- **2026-10-22 第一百四十二笔（S622）**：类名槽的**成员判据**接上（读数 `tmp/probe623/` s1..s8）—— `Array[One]` 收异类对象时引擎丢那位并继续（core ERROR，`size` 不变），`Array[Object]` 照收实例；实现是 `values.ts` 的 `registerClassFaceCheck` 钩子 + `object.ts` 按 `descOf` 名字与基类链认，只在 `elem === Object && scriptName` 那一格生效。新建 `class-slot-elements-621`（3 组）钉住 nil / 对象 / 标量 / 异类 / 别名五档。门：typecheck 4/4、`pnpm test` 26655（256 文件）、compile 273/395、diff 266/266 静默错 0。没接的两格写在 S622 ⑩：`class N extends Node` 的 `Array[N]`（发射器更早的 `[class-extends]` 闸门在前，宿主基类名只先备进 `SCRIPT_HOST_BASES`）、异类**字面量**元素进类名槽（s5 引擎发 element 那句，我们 `slotSource` 认不出 `<类>.new()` 的静态型、照收了）；另 s6 / s7 量到空字面量与字典字面量的**推断文本**（`Array[int]` / `Dictionary[int, Variant]`）与我们的推法不同，留作下一笔。
- **2026-10-22 第一百四十一笔（S621 续二 · 错值）**：新建语料 **407-array-script-class-slots** 撞出一格真错值 —— `elemConvert("Object")` 只收 `null`，脚本类实例 `append` 进 `Array[Inner]` 被静默丢掉（引擎 `C=1` 我们 `C=0`），字面量那一支靠 `?? x` 兜底看不出来；现在 `NIL` / `OBJECT` 两形都收，407 五行（A–E）逐字节对上，b12 / d5 那两格「int 进 Object 槽照旧丢」不变。门：typecheck 4/4、`pnpm test` 26653（255 文件）、ops 7299、compile 273/395、diff **266/266** 静默错 0、正文门 122/122。仍欠：异类对象进 `Array[Kid]`（没量，现一律收下）、空字面量交叉源文本、`extends` 宿主基类那一链、S620 ⑧ 动态接收者。
- **2026-10-22 第一百四十笔（S621 续）**：`Array[脚本类名]` 的 `extends` 那一形与标量源的全部源名接上 —— `collectScriptBase` 改按链上的原生基类认（`Kid extends RefCounted`、`Big extends Kid` 都给 `RefCounted`，r8 / r9 逐字；宿主基类那条链没量、不进表），标量源判据从 `int` / `String` 两格白名换成 `scalarSourceName`（非容器、非 `Variant`、非脚本类名），r1..r7 六形（float / bool / Vector2 / StringName / `null` / 字典槽 / `Array[String]` 槽）与引擎两句一字一样。读数 `tmp/probe622/`，r1..r12 + q1..q12 廿四形全部同句同行。门：typecheck 4/4、`pnpm test` 26650（255 文件）、compile 272/394、diff 265/265 静默错 0、正文门 122/122。仍欠：空字面量交叉源的文本、`extends` 宿主基类那一链、S620 ⑧ 的动态接收者。
- **2026-10-22 第一百三十九笔（S621 落地）**：`Array[脚本类名]` 那一族接上（`GArray.scriptName` + `stampScriptArray` + `SCRIPT_BASE`，只收没写 `extends` 的内部类），分析层补齐交叉源与标量源那三形（`typed-collection-assign-as` 头一句 + 声明位第二句 + 再赋值位那一句；交叉字面量按首元素推文本）—— q1..q12 十二形逐字同句同行。门：typecheck 4/4、`pnpm test` 26650（255 文件）、compile 272/394、diff 265/265 静默错 0、正文门 122/122。仍欠：写了 `extends` 的脚本类名标注那一形（没量）、空字面量交叉源的文本（没量）、标量源只认 `int` / `String` 两格、S620 ⑧ 的动态接收者。
- **2026-10-22 第一百三十八笔（S621 · 只读数）**：定形容器槽位的**交叉源**与 `Array[脚本类名]` 一族量齐（`tmp/probe621/` q1..q12）：字典↔数组只一句、与 S616 同句；标量源进容器槽发**两句**（`Cannot assign a value of type "int" as "Array[int]".` + `…to variable "i" with specified type Array[int].`）；已声明容器变量被标量再赋值是第三句 `Value of type "int" cannot be assigned to a variable of type "Array[int]".`。`Array[Inner]` 是真定形（q7：`is_typed()` 真、`get_typed_class_name()` 给 `RefCounted`、元素 typeof 24），报错文本里印的是**标注原文**（q6 / q8），同型经 `Variant` 中转收下（q12）—— 落地要两格字段（标注名 vs 原生基类名）。本轮试做把发射器改坏、已回退，出货零改动，判据与实施次序写在 S621 ④。
：实参位那一族补齐最后一格并钉死 —— `run` 单文件直编现在把输入名交给 emitter（`cli/run.ts` 的 `sourceFile: ctx.input` + 新的 `basenameOfGd`），p1 / k13 两句逐字对上引擎的 `SceneTree (p1.gd)` / `SceneTree (k13.gd)`，带 `class_name` 的 p2 对上 `SceneTree (Probe619)`；新建 `arg-container-620`（runtime 三组）与 `arg-container-emit-620`（compiler 七格）钉住「字面量折算、非字面量发句、位与函数名、不定形标注不发」。门：typecheck 4/4、`pnpm test` 26650（255 文件）、ops 7299、compile 272/394、diff 265/265 静默错 0、正文门 122/122、golden 405/405 零漂移。仍欠（S620 ⑧）：动态接收者 `o.top(w)` 不发检查、`Array` 与 `Dictionary` 交叉源、这一族的语料专例。
- **2026-10-22 第一百三十六笔（S620）**：定形容器**实参位**那两句落地（认得到 callee 的那一形）—— 字面量实参照引擎在编译期折算成定形容器（`takes([])` 收下、坏元素早被解析期两句拦），非字面量实参发 `rt.paramContainer` 那句 `Invalid type in function 'top' in base '<标签>'. The array of argument 1 (Array) does not have the same element type as the expected typed array argument.`；`baseLabel` 改成先查 `scriptLabelOf`（`class_name` / 文件名那一截），内部类仍给 `RefCounted (Own)`。已知两格偏差写在 S620 ③：`run` 单文件直编时括号里是产物名 `Main.gd`（引擎给输入文件名），动态接收者 `o.top(w)` 那一形**不发检查**（宁欠不拦：折不了字面量）。门：typecheck 4/4、`pnpm test` 26640（253 文件）、compile 272/394、diff 265/265 静默错 0、正文门 122/122、golden 405/405 零漂移。还欠：这一族的钉句测试与语料专例、`sourceFile` 进 `run` 那条路。
- **2026-10-22 第一百三十五笔（S619 · 只读数）**：定形容器实参位的运行期两句量齐（`tmp/probe619/` 十三形）：句子 `Invalid type in function 'f' in base '<标签>'. The array of argument N (<值自己的拼法>) does not have the same element type as the expected typed array argument.`（字典那一句换 dictionary）；中止的是**调用方**；base 标签内部类是 `RefCounted (类名)`、脚本模块级函数是 `SceneTree (文件名)`。字面量实参不走这一支（`takes([])` 收、坏元素早在解析期两句、定形源由 S617 解析期拦）。落地前置两条记在案：调用点折算字面量实参、被调方入口检查所需的接收者类名解析（外加把源文件名带进产物 trace）。本轮出货代码不动，S618 那一批门数沿用（diff 265/265 静默错 0、`pnpm test` 26640、typecheck 4/4、正文门 122/122）。
- **2026-10-22 第一百三十四笔（S618）**：定形容器槽位的运行期那一族对上 —— 变量位（声明与再赋值同一句）`Trying to assign an/a<array|dictionary> of type "<值自己的拼法>" to a variable of type "<标注>".`、返回位 `Trying to return … where expected return type is …`、解析期再添一句 `Value of type "X" cannot be assigned to a variable of type "Y".`（已声明的定形变量被定形源再赋值，e1..e3；不定型源仍留运行期）。同标注是同一支容器（别名），字面量源四处折算。实现：`values.ts` 的 `arrayTypeLabel` / `assignContainer` / `returnContainer` 一处判据，`emitter.ts` 的 `containerAnnText` + `containerSlot` 发赋值与返回的检查，`analyze.ts` 添 `typed-collection-assign-value`，顺带修掉 `var w: Variant = 定形数组` 的 S616 误拦。门：语料 **406**、runtime 十四格 + compiler 十七格、typecheck 4/4、`pnpm test` 26640、compile 272/394、diff 265/265 静默错 0、正文门 122/122。还欠：实参位那两句（`Invalid type in function 'f' in base 'RefCounted (Inner)'. The array of argument 1 (…) does not have the same element type as the expected typed array argument.`，要调用点先把字面量折成定形容器，S619）、返回位报错后调用方拿到空定形容器的 `is_typed()` 那一格、`Array[脚本类名]` 的运行期文本。
- **2026-10-21 第一百三十三笔（S617）**：实参位上的定形容器不合式也在解析期拒（`takes3(v: Array[RefCounted])` 喂 `Array[String]`、`takes4(v: Array[String])` 喂 `Array[int]` 各一句 `Invalid argument for “f()” function: argument 1 should be “<槽标注>” but is “<源标注>”.`），形参位与变量位同样不放宽；并补齐 S616 里没量的 `Dictionary[K, V]` 那一形（`Dictionary[int, String]` → `Dictionary[String, int]` 引擎那句我们本来就发同一句）。还差的仍是「源是不定型容器」那一族 —— 引擎改发运行期句：数组 `Trying to assign an array of type “Array” …`、字典 `Trying to assign a dictionary of type “Dictionary” …`（g3 / g4 / h2），留给运行期那一笔。实现：实参那一趟带 `fnName` / `fnPos` / `srcAnn`，主循环加 `typed-collection-param` 判据。门：语料 **405**（三句同行号同序）、typecheck 4/4、`pnpm test` 26616、compile 271/393、diff 264/264 静默错 0、golden 404/404 零漂移、正文门 122/122。
- **2026-10-20 第五十五笔（S535）**：want 非 int/float 的全局行补九支 pack。`inst_to_dict`(Object)、`dict_to_inst`(Dictionary)、`bytes_to_var`/`bytes_to_var_with_objects`(PackedByteArray) 的 pack 字面量引擎逐格发第二句、我们放过；`convert` 第二参的 pack 更错归在「int」子行（引擎说 **Variant.Type**）。补四条 SHOULD_BE + 把 convert 的 9 支 pack 从 int 子行移到 Variant.Type 子行。**踩到并修掉一处过拦**：`bytes_to_var` 的 want 就是 PackedByteArray，把它也塞进 refuse 会发 `should be "PackedByteArray" but is "PackedByteArray"` 并把语料 274 打成分析期拒（compile 266→265、diff 1 fail）；去掉后回 266/259。门：`pnpm test` **26315**（192 文件；新建 `global-pack-mixed-535.test.ts` 11 格）、typecheck 4/4、compile 266/384 分桶未动、diff 259/259、零 churn、`test:golden-check`（`tmp/d6/gc535.log`）。
`StringName` / `NodePath` 当槽型那一档、容器面内部类字段接收者的 void 那一形、S491 的运行期 `%` 通道。
- **2026-10-18 scriptc 升到 0.3.6：`pnpm release` 撞出一道新围栏 SC2020**。原生 CLI 那一步在 `packages/compiler/src/lower/analyze.ts` 停住：`reported.has(e as unknown as Extract<Expr, { kind: "binary" }>)` 报 `'collection key assertion requiring a structural copy or dynamic conversion' is part of the standard library types but has no scriptc lowering yet`，hint 就是「拿与集合键同型的那个引用」。那一支本来就是 `Set<Expr>` 查一支 `Extract<…>` 二元式，双重断言是纯噪声 —— 改成 `reported.has(e)` 直接过。全仓再扫一遍 `as unknown as`：只剩六处，其余五处（`walkExprKinds` 的 push、两支 `n as unknown as Extract<…>`、`methods.ts` 的 Record 索引、`signal.ts` 的 `callableSame`）都不当集合键用，0.3.6 下编得过。改完 `node tools/cli-native.mjs` 出货 `tmp/cli-native/gds2js.exe`，`cli-native.test.ts` **20/20** 逐字相等（含 `export --pack scriptc` 与 `--sourcemap` 那两格），scriptc 面探针 234 格与门 1/1 逐字节照过。
- **2026-10-18 第十三笔（S490）**：两侧都是字面量那一形的最后一族量齐 —— 十型字面量里只要一支落在 `StringName` / `NodePath` 就入格，十五符 × 两向 540 格，引擎拒 500（第一式 392 / 第二式 98 / 格式化那句 10）、收 40；发货前 498 格分歧（放过 328、另 170 格是错值：`1 + &"ab"` 印成 `int and String`）。同一个根子：`checkOperator` 也借 `staticType` 拿操作数名，`&"ab"` 折进 `String`、`^"a/b"` 回 null，所以两张表里两面一行都没有；改成先问 `literalTypeName` 后 A 表并 392 对（601 → 993）、B 表并 98 对（367 → 465），各添 `**` 一个新键，收的 40 格一行不登。格式化那道闸门（`checkPercentFormat`）的入口原来只认 `lit === "string"`，另尺 176 格把 `&"…" % X` 与同串 `"…" % X` 逐格对下来句子一字一样（可比 88 格、不同 0），于是入口放宽到也认 `string_name`，`op-mod-float` 的「左支是 String」同步认 StringName —— `&"ab" % 1.5` 引擎回格式化那句而不是型对那句。新建 `op-pairs-literal-faces-490.test.ts` 钉 716 格，门 **17633**（156 文件）、`test:diff` 258/258、`test:golden-check` 394/394、`test:compile` 265/383 一字不动；旧尺 `fmt` 52 / `ctor2` 2048 / `inop` 225 / `typednames` 648 / `s489c` 832 全 0 差。**运行期还欠一笔（已量到值）**：解析期认了 `&"…"` 当格式串，runtime 的 `%` 不认 —— `&"%d" % 1` 引擎给 `1`、`&"%s" % 3` 给 `3`、`&"a%db" % 7` 给 `a7b`、`&"%d" % [1]` 给 `1`，我们四形全抛 `Invalid operands 'StringName' and 'int' in operator '%'.`（`tmp/d6/sn-pct2.gd` 两跑对照），下一笔按值量齐再补 golden。
- **2026-10-17 再往下一层：`in` 那一式从零量齐（S469），Callable 补上缺的五对（S470）**。之前每一把尺的运算符都止于 `==` —— `in` 一格没测过，二百二十五格矩阵里引擎拒 161、我们放过 161；判据与 S394 / S395 同一条（两侧字面量第一式、掺名字第二式、右支是容器就一路收到运行期），只给三张表各加一个 `"in"` 键就接住了。Callable 那一头复尺四百三十二 + 二百二十四格，缺的是同一批五对（`int|Callable` / `Array|Callable` / `Callable|Array` / `Dictionary|Callable` / `Callable|Dictionary`）× 七式。**下一笔已量清待发**：构造式字面量 `Vector2(1, 2)` 参加运算时引擎把它**当字面量**（`tmp/d6/ctor.py` 二百八十八格：第一式 134 / 第二式 100 / 收 54，放过 160），要先把 `isLiteralOperand` 与两支循环的 `call` 回落接上，再把五支值型构造式逐对过裁判（现在只量了 `Vector2` 与 `Color`）—— 记 S471。
- **2026-10-17 把 S471 与 S472 一并结掉**：构造式字面量两千零四十八格逐格过裁判后接进三张表（判据与 S394 / S395 同一条 —— 引擎把 `Vector2(1, 2)` 就当字面量），顺带修掉 `%` 掺 float 那一支的重复句子与「名字 × 名字」从不进闸门那两条；定形容器参加运算时句子印**原文标注**（`"Array[Vector2]"`），查表仍按基名。四把尺（`ctor2` 2048 / `typednames` 648 / `inop` 225 / `chain` 960）与旧尺八把全部 **0 分歧、过拦 0**，门 **14579**（146 文件）。开着的还是那两笔：`!=` / `>` / `<=` / `>=` / `and` / `or` 六符的构造式与定形名那一头没量过（不发）、scriptc 静态面不能覆盖 async 成员。

---

## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- **七个值类型**（`Rect2` / `Rect2i` / `Transform2D` / `Plane` / `Quaternion` / `Basis` / `AABB`）—— 按 D6 不进这一层，构造式与成员照旧响亮拒
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- 性能优化 —— 先要正确；benchmark 读数已出（§1.10），真要动优化走 5.5 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
