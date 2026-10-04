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
- **两条新账，都没写进实现**：① 4.6.3 的 `var_to_str` 有第二个实参 `indent: String`，而本机 4.3 树 `core/variant/` 里 grep 不到 `indent` —— 又一处「4.3 ≠ 4.6.3」（§1.28 的 `format` 是第一条）；缩进串还会让装字典的数组变成多行，收尾那个 `]` 一会儿顶格一会儿缩两档，式子没排出来。② 串里的 U+0000 在 `to_utf8_buffer()` 那层就变成 `ef bf bd`（`char(0)` 的 `length()` 仍是 1），`c_escape` 同输入同结果 —— 这是**所有打印共用**的 String→UTF8 层，归 §6 新增的第 18 条，不记在 `var_to_str` 头上。
- **账**：语料 236 加 31 格、ops 加 27 格（1452→1479），`test:compile` 160/229、`emitter 不支持 0`、`全局拒答清单失效 0`、新增「var_to_str 单实参口径 3/3」门格，`test:diff` 逐字节一致 152/152、静默错误 0。下一支照 S214 已有的二十格发 `str_to_var`。

### 1.32 `str_to_var` 的读侧语法量清并发出：155 格与引擎逐格对上，读不懂的地方给 null、没量过的给响亮拒（2026-10-04，§6 第 17 条②、S231）

- **一条规则把 S214 的怪账全清了**：`str_to_var` 顶部**只读一个值，后面跟着的不看**。于是「`0x10` 给 0」「`0b11` 给 0」「`1_000` 给 1」「`1.5.2` 给 1.5」「`1 2` 给 1」不是四条各自古怪的容忍行为，而是同一条读到就停。剩下的量点摊成六支探头（`sv_grammar` / `sv_escapes2` / `sv_more` / `sv_more2` / `sv_last` / `sv_ws`），155 格与判引擎逐格对上的表在 `tmp/sv-check.ts`。
- **发出去的**：小写 `null` / `true` / `false` / `inf` / `-inf` / `inf_neg` / `nan`；数字带点带指数、int 饱和到 INT64_MAX；字符串的双引号加十个转义（`\n \t \r \b \f \\ \/ \" \'` 与 `\u` 四位十六进制），其余字母是「删掉反斜杠留原字符」（`\a` → `a`、`\x41` → `x41`），代理区与非十六进制的 `\u` 整串作废；`&"名字"`；数组与字典（尾逗号收、缺逗号作废、多行写法照收、重复键后者盖前者）；`Vector2` / `Vector2i` / `Vector3` / `Vector3i` / `Color` 五支值类型（arity 严格、整型那两支截断）与七支 pack 构造式（byte 回绕 300→44、-1→255，float 收 int，串 pack 只收串）。认不出的一律给 null —— 那批二十余格实测全是 null。
- **拒的三类**：`\U` 量到「吃六个十六进制位」但越界与代理区凑不成式子 → `[str-to-var-shape]`；`Rect2`（typeof 7）/ `Quaternion`（15）/ `PackedVector3Array` / `PackedColorArray` 是引擎给得出值而我们没有的形状 → `[str-to-var-type]`；构造式名字认不出时**不发那个可能是错的 null**（只量过 `NoSuchType(1)` 那一格给 null，「Godot 认识哪些名字」那张表没量）→ `[str-to-var-shape]`。双实参与非 String 实参分别抛 `[str-to-var-arity]` / `[str-to-var-arg]`，前者钉在 `test:compile` 新改的「转换族单实参口径 6/6」。
- **账**：语料 236 加 43 格、ops 加 30 格（1479→1509）。`test:compile` 160/229、各桶全清、守卫 8/8 与 6/6，`test:diff` 逐字节一致 152/152、静默错误 0、崩溃 0。转换族只剩 `convert` / `type_convert` 两支没合出真源（S214 已量清标量表，卡在数组→标量那一格引擎在运行期拒）。

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
    生成物口径：227 份 `main.gen.mts`（2026-10-03 写这条时是 216 份）的运行时说明符是 `../../../packages/runtime/src/runtime/index`
    （现由 `tools/compile.ts` 的 `GEN_EMIT_OPTS` 显式声明；emitter 已不带仓库布局默认值）；corpus 之外
    （examples/multi、bench/.out）仍走裸名 `gds2js/runtime`，由 workspace 链接解析。
    **收尾口径（2026-10-03）**：全量 `test:scriptc --all` 因耗时（约 2 分钟/例，全量 3.5~5 小时）按用户拍板
    中途停掉，改单跑 `161` 验证 zstd 路径（✓ 出货一致）；验收以代表集 10/10 + 项目树 9/9 + 原生 20/20 +
    `test:export` ok 17/FAIL 0 + `test:pkgmodes` 失败 0 + 五道 node 门（compile/ir/sema/ops/diff）为准。
    **改口径（2026-10-04，§1.9）**：门按用例铺开跑了 —— 全量 150 例 **40 分 52 秒**、逐字节全绿，
    「中途停掉」那套验收不再是默认形状（要全绿就直接 `pnpm test:scriptc --all`）。
13. 架构整改轮（§1.3）后的常驻项：改产物树/HOME 布局先跑 `test:treeface`；`case-table.ts` 只走
    `pnpm regen:case-table`；`case-flags.ts` 只走 `pnpm regen:case-flags`（两张都是实测生成物，别手改）；native seam 新增分岔口照「复制 `*.native.ts` 覆盖」办理；
    改 `packages/runtime/src` 内的**发射形状/函数形状**（新增 helper、往函数表塞值、换码点展开写法）先跑 `node tools/scriptc-check.mjs 234`（38s 面探针，`pnpm release` 的 2b 就是它）再提交。
14. 两条观察项（记录，不动）：dist 内容哈希块名（HOME/export 均按 glob/目录读，无门依赖具体块名）；
    门粒度（无子集运行能力，靠各门自带 `--quick`/筛选参数）。

14. **转换族与 `format` 的四个卡点（2026-10-04 记，读数全在 S214 / S219 / S220 / S221 / S225 / S226 / S227）**：① `var_to_str` 的浮点 —— 出处已定位（`VariantWriter` 的 FLOAT 支 → `rtos_fix` → `String::num_scientific`，`%g` 家族 + 去尾随零 + 「无点无 e 才补 `.0`」；零短路给 `0`、负无穷是 `inf_neg` 而 print 给 `-inf`），还剩两格不被任何固定 precision 解释：最小正规数与次正规数都给 `0.0`、`1e23` 要 16 位而 `7e22` 要 17 位 —— 要的是把 4.6.3 那个 `%g` 的**实际行为**量成一表，别再猜精度。② `str_to_var` 的认与不认**已经量齐**（S214），只欠实现。③ `convert` / `type_convert` 标量表已齐（S220），卡在 `convert([], TYPE_INT)` 那条**运行期**拒（引擎文案连函数名都指错了），数组→标量按什么判要先量。④ `format`：4.3 的式子只解释得通「给了第二参」那一半，缺省占位符在 4.6.3 已是 `"{0}"`（S219），键序/非字符串键/值转文本那一路还要再量。**①的一条更正（S228）**：`var_to_str` 那两处「极小值给 `0.0`」的反常已经查到是**字面量解析**掉的，不是 writer 的问题 —— ①里剩下的只有「尾数 16 位还是 17 位」一问，做法是把待测值用**算术**造出来绕开解析层，再看是不是纯 `%.*g` 舍入。**共同前提**：任务 #18（AOT 那 ~140 倍的装箱账）要的是单态/去装箱的设计拍板，不由代码侧决定，仍未定。

---

## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- 性能优化 —— 先要正确；benchmark 读数已出（§1.10），真要动优化走 5.5 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
