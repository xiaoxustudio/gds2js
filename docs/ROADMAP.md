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

### 1.73 `inst_to_dict` 发出：类身份四段由发射器静态登记，顺带撞到一条静态目标的新围栏（2026-10-08，S270，语料 265，§1.72 那份清单花掉一半）

- **进门名单与出门值都照 S269**：`@subpath`（NodePath 的类路径，根类为空）+ `@path`（模块 res 路径）是 String 键、字段键是 StringName、键序 `@subpath → @path → 声明序`；`const` / `static var` / `signal` 不进；继承链**基类在前**；带 get/set 的属性**不调 getter**，出门的是声明类型默认值（runtime 那张表贴了十六种实测形状，表外如 Rect2 响亮拒）。
- **静态目标的新围栏：类实例不能当 `Record<string, Variant>` 索引**。scriptc **编得过、跑起来炸**：`expected object at $.gdObjectId, got number`（build 侧对同一式子给 SC2002 `record shapes must match exactly or width-coerce`）—— 它拿记录形状去校验实例自己的槽，第一格就是 `gdObjectId`。改成**发射器静态拼读数器**：`rt.registerDictIdentity(desc, resPath, classPath, names, accessors, (o) => { const s = o as Inner; return [s.k, rt.V.nil()]; })`。定位靠 `tmp/sc-gate/265-inst-to-dict/probe.mts` 那种一步步 step 的探针，比猜式子快得多。
- **顺带抓到一条 HEAD 上就有的 AOT 洞**：语料 246（`String.format()` 吃脚本实例）在 scriptc 上挂的就是同一句，来源是 S232 `scriptPropsHook` 里同一条 cast（`git diff` 证明本论没碰那段）。它一直不红是因为 **246 不在 scriptc 代表集里** —— 门从没走过这条路。已开**任务 #45**：把 hook 也换成静态读数器，并把这一形塞进代表集，让「node 过、AOT 炸」这类形状以后自动有门。
- **拒答清单又短一支**：`inst_to_dict` 从发射期拒答清单划进 `BUILTIN` + `BUILTIN_ARITY` + `GLOBAL_CALLABLES`（名表可派发 107→**108**、该拒 19→**18**、清单 11→**10**）。元数两句走引擎原文；`Not a script with an instance.` 这类**过 `RTR()` 的文案只在 ops 钉**（本机默认语言给中文，英文要 `--language en`，S269 ⑧）。单文件模式没有 res 路径，`@path` 那一格抛 `[inst-to-dict-path]` 而不是编一个。
- **下一轮**：`dict_to_inst` 一支（读数已在 S269 ⑦：跳过 `_init`、缺 `@path` / 加载不到 / `@subpath` 不存在的三句、缺 `@subpath` 就是造模块根类那一形 Tier 1 发不出要拒）。它要的是「按 res 路径找脚本 + 按类路径找内嵌类」，与 `load()` 那张表贴在一起。
- **账**：语料 265 共 32 行 golden / 27 格逐字节；`test:diff` **179/179**（共 265 例，静默 0、崩溃 0）、`pnpm test` **1104** 例 / 48 文件、ops 自校验 1884→**1892**、guards **184** 例、`test:compile` 187/256、codegen 2/2、pkgmodes 25/25、export ok 10 / FAIL 0、cli-native 20 例全过、typecheck 4/4；AOT 单例门 `265-inst-to-dict` **1/1 编过 + 1/1 跑通 + 逐字节一致**。**产物面 churn**：186 份 `main.gen.mts` 各多一行 `rt.registerDictIdentity(…)`，逐字节输出一条没变。**门维护两笔**：跑 `test:pkgmodes` / `test:cli-native` 前先 `pnpm build`（§1.71 那条口径这次照做，两门直接绿）；`pnpm test:compile` 撞到一次 Windows 的 `UNKNOWN open` 写盘错，重跑即过 —— 它是环境抖动，不是编译器问题，但**门链里排在它后面的那几步必须跟着重跑**（本轮第一次 SC265 / DIFF 红就是拿旧产物跑的假红）。
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

14. **转换族与 `format` 的四个卡点（2026-10-04 记，读数全在 S214 / S219 / S220 / S221 / S225 / S226 / S227）**：① `var_to_str` 的浮点 —— **S230 已经把非浮点那半发出去了（浮点抛 `[var-to-str-float]`），这一格欠的就是剩下的尾数**：出处已定位（`VariantWriter` 的 FLOAT 支 → `rtos_fix` → `String::num_scientific`，`%g` 家族 + 去尾随零 + 「无点无 e 才补 `.0`」；零短路给 `0`、负无穷是 `inf_neg` 而 print 给 `-inf`），还剩两格不被任何固定 precision 解释：最小正规数与次正规数都给 `0.0`、`1e23` 要 16 位而 `7e22` 要 17 位 —— 要的是把 4.6.3 那个 `%g` 的**实际行为**量成一表，别再猜精度。② `str_to_var` 的认与不认**已经量齐**（S214），只欠实现 —— **S231 已发出**（155 格逐格对上；`\U` 吃六位数却量不出越界处理、构造式名字认不出、实参不是 String 三条分别抛 `[str-to-var-shape]` / `[str-to-var-type]` / `[str-to-var-arg]`）。③ `convert` / `type_convert` 标量表已齐（S220），卡在 `convert([], TYPE_INT)` 那条**运行期**拒（引擎文案连函数名都指错了），数组→标量按什么判要先量；**那道前置已解（S233）**：`TYPE_*` 整族 37 支 + `TYPE_MAX` 量清并发出（逐名用 `GDScript.reload` 编内层脚本，避免一个不存在的名字带废整支探针；每支又与 `typeof(样本)` 对了一遍），语料 236 钉了 37 格打印 + 17 格 `typeof(x) == TYPE_X`。这两支剩下的量测在 §1.37 一次跑完（340 格矩阵）：解析期接受集合按第一实参的静态类型分岔，`type_convert` 一支都不拒。④ `format`：**已出货（S232）**，而且 S219 那格「缺省占位符是 `"{0}"`」的读数也纠正了 —— 占位符本身是 `"{_}"`，`{0}` 是键文本渲染出来的样子；键序（字典按插入顺序遍历键）、非字符串键、值转文本（走 print 那套）全量过，只剩 Object 那一支抛 `[format-object]`。**①的一条更正（S228）**：`var_to_str` 那两处「极小值给 `0.0`」的反常已经查到是**字面量解析**掉的，不是 writer 的问题 —— ①里剩下的只有「尾数 16 位还是 17 位」一问，做法是把待测值用**算术**造出来绕开解析层，再看是不是纯 `%.*g` 舍入。**共同前提**：任务 #18（AOT 那 ~140 倍的装箱账）要的是单态/去装箱的设计拍板，不由代码侧决定，仍未定。

15. **`run --watch` 在原生目标上看不见「mtime 变了、字节数没变」的保存（2026-10-07 记，§1.66，未动实现）**：`gdSignature` 是 `路径:mtime:大小` 三段，node 侧四格延迟扫（0/6/12/30s）全部重跑，原生 exe 同一把扫法有两格不重跑，而父侧 `statSync` 每次都报出真实变了的 mtime —— 也就是失灵点在 scriptc 那一侧的读数或轮询里，**没量清就不改实现**。要动先做探头：一份只用 `node:fs` 的小 scriptc 产物，对同一个文件反复 `statSync().mtimeMs` 并与 node 同印一份，两侧数字对上了才知道该给摘要加哪一维（内容指纹 / 首块尺寸 / ctime）。门这边已经先把不确定性拿掉：`⑨b` 两次保存改成不等长（尺寸维必变），并等 `监听` + 首跑都出现再动手。
16. **NodePath 值型已发出（2026-10-08，S268，语料 264），`inst_to_dict` 也已发出（同日 S270，语料 265）—— 这一族只剩 `dict_to_inst` 一支**：它要的是「按 res 路径找脚本 + 按类路径找内嵌类 + **跳过 `_init`** 造实例」（读数都在 S269 ⑦：缺 `@path`、路径加载不到、`@subpath` 指名不存在的类三句都已量；缺 `@subpath` 就是造模块根类那一形在 Tier 1 发不出，按响亮拒处理）。所以它仍留在发射期拒答清单（现共 **10** 支）上，不猜。**门维护口径**：`packages/gds2js/dist` 不入库，而 `test:pkgmodes` 与 `test:cli-native` 吃的就是那份 dist / exe —— 改了 `packages/*/src` 之后**先 `pnpm build` 再跑这两门**，否则报的是「`printDebug` is not exported by dist/host.mjs」这类过货假红（S268 那轮撞到并写进 §1.71，S270 这轮照做，两门直接绿）。
17. **「node 跑得通、scriptc 出的 exe 当场炸」这类形状目前只有一格已知未修（2026-10-08 记，S270 ④，任务 #45）**：语料 246（`String.format()` 的实参是脚本实例）在 `GDS2JS_SCRIPTC_FILTER=246` 下跑挂 `expected object at $.gdObjectId, got number`，根源是 S232 `scriptPropsHook` 里那条「把类实例当 `Record<string, Variant>` 索引」—— 静态目标会拿记录形状去校验实例自己的槽，第一格就是 `gdObjectId`（build 侧同一式子给 SC2002）。修法就是 §1.73 那套静态读数器。**真正的缺口是门**：246 不在 scriptc 代表集里，所以这类问题不会自己现形；任务 #45 的第二半就是把这一形加进代表集，让「只有 AOT 才暴露」的形状从此有闸。

---

## 3. 明确的非目标

- 任何引擎 API（`Node` / `SceneTree` / `add_child` …）—— Tier 1 遇到就抛 `unsupported`
- GDScript 3.x 兼容（`yield` / `setget`）
- 编辑器 / LSP
- 性能优化 —— 先要正确；benchmark 读数已出（§1.10），真要动优化走 5.5 那三重护栏（收益量化 + golden 逐字节不变 + 校验值一致）
