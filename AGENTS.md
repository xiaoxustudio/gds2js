# gds2js

## 项目概述

GDScript 4.x → JavaScript 的 AOT 编译器（Tier 1：纯语言层）。
管线：手写递归下降 CST → lower(IR) → analyze(语义) → emit(ESM `.mts`)。
Tier 1 内不实现 `Node` / `SceneTree` 等引擎 API，遇到即抛 `unsupported`（D4）；Tier 2 四阶段**已收口**：D6 那七支值类型加 `Transform3D` 共八支整族落地、引擎类实例构造与成员面放行（`Node` / `Node2D` / `Control` / `Node3D` 四支基类 + 类体裸名读写，`Node3D.transform` 与 `global_*` 按不在树里那一形落地）、节点树与场景通知路线打通（`.tscn` 编译期展树 + `sceneRun` 帧环 + 分组查询），没量过的形状仍一律 `UnsupportedError`（D7 引用计数按 γ 记档不落地）。

语义正确性只以 **Godot golden** 为准（`corpus/` + `tools/golden.mjs`），不靠"看着对"。
**Tier 3（宿主 API 族）已收口**：`JSON` 面按实测落地（`stringify` 的两支浮点印法与排序 / pretty、`parse_string` / `parse` / `get_data` / `get_error_*` 的成功路径、实例打印与 `is` / `is_class` 链），解析失败那一形连同引擎 ERROR 的消息集**还没实测完，照旧响亮拒**；`FileAccess` / `DirAccess` 走宿主能力表 `HostIo`（`host.ts` 注册的那张 `node:fs` 表三轨共用；`FileAccess` 的 `READ_WRITE(3)` / `WRITE_READ(7)` 按 4.6.3 实测放行——WRITE_READ 开已存在文件即截断、READ_WRITE 从不建文件（缺就 null + 7），交错写对同目录的另一个句柄即时可见（写穿透到盘面）（scriptc 轨实测 `node:fs` 读数与 node 轨逐字节一致）；`user://` 解到 `%APPDATA%/Godot/app_userdata/<config/name>`，`res://` 与裸相对路径一律 `UnsupportedError`）；`RegEx` / `RegExMatch` 按实测 pattern 白名单放行（名单外的字面量与运行期字符串都在 `compile()` 就响亮拒，文本实参只量过 ASCII 那层：需配对码位、非 ASCII 配 `\w` 类、`$` 配换行都拒）；`Marshalls` 经实测在 GDScript 里根本不可达（引擎单例，静态调用解析期就拒）→ 划出范围；`Engine` 是明示的非目标；`OS` 那一族按 Tier 4 拍板① 只放行实测过的三格（`get_cmdline_user_args` / `get_environment` / `has_environment`，走 `host-proc.ts` 那张进程能力表），其余照旧响亮拒；三族之外没量过的宿主 API 与引擎单例集中钉在 `packages/runtime/test/tier3-refusal-roster.test.ts` 那张定形拒绝清单上——实现了哪一格就得把哪一格划走。
**Tier 4（自举：把编译器本体翻成 GDScript）阶段零已立门**：判据落在 `test/e2e/bootstrap/`（切片级两阶段收敛：同一切片两次发射逐字节相同 + 产物输出逐字节等于 `tools/bootstrap.mjs` 从 Godot 4.6.3 取的 `godot.txt`；夹具在 `test/fixtures/bootstrap/slices/`，不入 corpus 语义账，边界由 `test/repo/bootstrap-boundary` 钉住）与 `packages/compiler/src` 之外零改动的那把「门自己得能红」自校验。开工拍板（Tier 4 文的 §5，按推荐项定的四条硬口径）：① `OS` 那一族从「明示非目标」改为 Tier 4 目标，阶段四实测 `get_cmdline_args` / `get_cmdline_user_args` / `get_environment`，在那之前照旧响亮拒；② cwd 走实测 `DirAccess.get_current_dir()`；③ `res://` 运行期照旧拒，自举版编译器只用带盘符绝对路径工作；④ fixpoint 判据两把都要（`N+1` 产物逐字节 == `N` **且** `N+1` 重跑全语料 golden 零漂移）。其余七条（探针切片取 `descent/lexer.ts`、CST 用十字段 Dictionary、`namedChildren` 留预计算副本、`bigint` 逐格核对能否降 Godot int、自举版第一版不带 IR 缓存、全量 scriptc 门阶段六跑一次即锁、按目录一片一片搬）同样按推荐项定。
**阶段一的撞墙读数**：探针切片落 `corpus/cases/479-descent-lexer`（`descent/lexer.ts` 整支的 GDScript 形，18 组样本带码位面 / 零宽字符 / CJK 身份 / 未闭合串），逐字节等于 Godot 4.6.3 的 golden，而 `UnsupportedError` **一支都没撞到** —— 九支异形不在 lexer 的控制流里，成本全在 GDScript 本身不提供的那批写法上：`emit` / `fail` 两支按引用闭包 → 实例字段 + 方法、`ZERO_WIDTH` 那支 `Set` 与 `STR_PREFIX` 那张 `Record` → 函数分派、谓词实参（`runOf` 的 `test` 与 radix 那一支三元）→ tag 字符串、越界 `src[i]` 的 `undefined` 语义 → `ch()` 越界返 `""`（GDScript 那边越界是 SCRIPT ERROR）、`number_end` / `read_delim` 的结构体返回 → Dictionary。另抓到一支**静默错**：脚本自声明 `func run(...)` 会盖上产物入口 `Main.run()`（`emit/surface.ts` 的 `HOST_MEMBERS` 里有 `run`，却没做保留名检查），而 Godot 侧完全合法 —— 阶段二要把这一格变成响亮拒。
**阶段二开门的实测清单**（15 支切片一趟跑齐：8 支收敛、5 支真墙钉在切片目录的 `wall.txt`、2 支引擎同拒由门自动分类）：真墙只有五支 —— `inner-class`（内部类再套内部类）、静态 `_init()`、带默认形参的 lambda 再 `bind()`（两支切片同因，一支带型一支不带型）、脚本自声明 `func run()` 撞产物入口名 `Main.run()`（已按 `emit-entry-name` 收成响亮拒：入口类的 `run()` / `__gdDispatch()` 都拒，内部类的同名方法照发）。
§2 那份先验清单里其余几支实测**不需要清账**：`class X extends RefCounted`、内部类之间的 extends 链 + `super.method()`（含副作用次序）、属性裸 `get:` 与 `get`/`set(value)` 成对、`match` 的常量标识符 / `var` 绑定 / `[1, 2]` 列表 / `_` 通配四类臂，全部逐字节收敛；而 `super.属性` 与 `match` 臂里的运行时表达式是**引擎自己就拒**——Godot 4.6.3 对 `super.tag` 报 "Expected \"(\" after function name."，对非常量臂报 "Expression in match pattern must be a constant expression…"，语言层没有的写法，自举版自然用不到。阶段二按这张表排序，不按先验清单。
**阶段四开局的进程面读数**：argv 的 `--` 切分、`get_environment` 分不清「设成空串」与「没设」（只有 `has_environment` 分得开）、`DirAccess.get_current_dir()` 回显的是**开进来的那串**而不是进程 cwd、`change_dir` 落空回 31 而不是 7、`get_cmdline_raw_array()` 在 4.6.3 根本不存在、`DirAccess.get_current_dir()` 不是静态的 —— 全部落进 `corpus/cases/481-proc-env-and-cwd` 与探头 `000-probe-t4-argv-env-cwd`；`test/e2e/bootstrap/procface.test.ts` 那把门用同一份 GDScript 分别起真 Godot（`--script … -- alpha "beta gamma" --flag=1`）与真 bundle 产物（`node app.mjs compile -- …`），六格输出逐字节对账。cwd 那一格还没放行：产物侧 `DirAccess.open(".")` 照旧拒（`io-path-shape`），cwd 那一格按 `484-da-open-relative` 的读数放行：`resolveIoPath` 只认 `.` / `..` / `./x` / `../x` 那四形（不带 `./` 前缀的裸名照旧 `io-path-shape` 拒，引擎那侧还要再过一层 globalize），产物侧按进程 cwd 解并归成正斜杠；沙箱门的产物侧同时 `chdir` 进沙箱工程根，两侧才真同源。
**阶段四的第二格（目录树）**：实测 `remove_absolute` 对非空目录回 1 且**不递归**，而 `DirAccess.open(p)` + `list_dir_begin/get_next/current_is_dir/remove(相对名)` + `remove_absolute(空目录)` 那一套 GDScript 自己写的递归删实测回 0 —— 自举 CLI 的 `rmSync` 替身就此成立（`mkdtemp` 那一格没有对应物，得用 `make_dir_absolute` 撞 32 再换名的循环）。同时改掉的读数差：实例 `rename` / `remove` 的**相对**实参跟着开进来那一层走（原实现按 `da-abs-arg` 拒了），实例 `copy` 却不全局化（引擎拿原串去开，落回进程 cwd 给 7 与一条 core/io 的 ERROR，照旧只认带前缀那形）；`make_dir_absolute` 撞已存在回 32（`ERR_ALREADY_EXISTS`，宿主表新格），不是 1。落成语料 `483-da-tree-and-wipe`（含递归 wipe 的逐格输出与顺序）。
**阶段二收尾的用量实测**（对「要移植的那 18k 行」直接数，不是先验估计）：带默认形参的 lambda 0 处、`.bind()` 0 处、嵌套内部类 0 处、`static` 类成员 16 处（`static var` / `static func` 实测已放行，只有静态 `_init()` 仍拒，而它在 GDScript 侧等价于在声明处直接给初值——已量过那一形）、`class` 5 支且 extends 链已收敛。结论：那四支余墙（inner-class 嵌套 / 静态 `_init()` / lambda 默认形参再 `bind()`）都不挡自举，真挡路的只有进程能力与数据形状那两摊，阶段二按此收口，阶段四/三优先级抬到前面。
**阶段三的第一格已验**：`corpus/cases/485-cst-dict-builder` 把 `parse/descent/builder.ts` 整支（Draft 栈 + `mk` + `open/openAnon/close/anon/leaf/attach/setLastField/liftLast/mark/spliceFrom/setEnd/flush/stashComment/root`）翻成 GDScript，节点用拍板⑥ 的十字段 Dictionary、`namedChildren` 用拍板⑦ 的预计算副本，产物与 Godot 逐字节相同、零拒因。顺带把移植要用的一条语言事实钉死：GDScript 的 Dictionary/Array 是**引用语义**，`setLastField` 改的是已挂进父节点的那一份、`spliceFrom` 摘走的孩子仍能被新父持有 —— 现树 builder 的变异式写法可以照搬，不必换成不可变重建。
**阶段五的跨文件那一格**：`preload` 拿到的脚本类上三形实测放行 —— 别处的 `static func`（含跨两层调用）、`Class.new()`、以及这一笔补上的**脚本级 const 跨文件读**（`EmitOptions.preloadConsts` + `ctx.PRELOAD_CONST_OWNERS`，发射时直发 `Class.CONST`；只在「本工程内被别人 preload」的模块上生效，所以单文件存量产物一字节未改）。同时记下两支口径：文件级 `extends RefCounted` 仍响亮拒（脚本基类只量过 Node / Node2D / Control / Node3D），而**省掉 extends 行**（GDScript 默认基类本就是 RefCounted）实测可用 —— 自举的库文件按后者写；`corpus/cases/487-preload-cross-file` 与 `486-descent-tokens` 是这两格的回归钉。
**移植树与它抓到的相撞 bug**：`test/fixtures/bootstrap/gdsrc/`（`tokens.gd` + `lexer.gd`（内含 `Scanner` 内部类）+ `main.gd` + `project.godot`）是阶段五那棵树的起步形态，`portface` 那把门把「工程编译得过 / 两次编译逐字节相同 / bundle 产物逐字节等于 Godot 参照」三面一起钉；它一立起来就抓到一支会发成非法 JS 的相撞 —— 模块类名由**文件名**派生（`lexer.gd` → `Lexer`），文件内再写 `class Lexer:` 就发成两个同名标识符（Godot 侧完全合法、rolldown 直接 `Identifier has already been declared`），单文件发射按 `emit-class-clash` 响亮拒；工程编译那侧改成把模块类名错成 `<派生名>Module`（`BoxModule` / `BuilderModule`），于是「一文件一类、类名同名」这种最自然的 GDScript 写法不需要改名。同一处派生还留下一个已知口径：不同目录的同名文件（`a/tokens.gd` 与 `b/tokens.gd`）会派生出同一个类名，自举的文件命名不许撞名。 树里现在装着 `tokens.gd`（PUNCT / KEYWORDS / XID 码位段表）+ `lexer.gd`（内含 `Scanner` 类）+ `indent.gd`（内含 `LineSpan` 与 `Cursor`，那套「按需问缩进」的查询面）+ `main.gd` 驱动，参照 173 行里 112 行是游标逐格的读数；跨文件那三形（别处 static func、内部类跨文件 `new()`、脚本级 const 读）在树里都是活的路径，`%` 格式化与默认形参也一并过了。词法那一支还补齐成与 `descent/lexer.ts` 同形（进制与下划线数字、指数与点号数字、四种字符串定界符、三重引号、u/U/x/o 四种转义、`#region` 三型、零宽字符、反斜杠续行），479 那十八组样本一并进了驱动。 第二批进树的是 `builder.gd`（CST 构造器，含 `Draft`）与 `state.gd`（`Parser` 拆 `stash` / 各 `at_*` 查询 / `fail` 桩），参照长到 285 行（词法十八组样本 + 游标四种走法 + 小文法 `parse` 的逐格输出）。这一批把头号结构差异量清了：**GDScript 没有 try/catch**，`GdSyntaxError` 那条路只能改成「置 `failed` + 记 `issues` + 调用点早返回」——`Parser.expect_*` 返回 `null` 由调用点判定，正是阶段三那条「错误码 + 消息 + 通道」的落地形态。它还抓到第二支静默错：形参或局部变量叫 `rt`（或 `print` 那一族）会把发射器引进来的运行时命名空间盖住，产物里直接 `Cannot access 'rt' before initialization` —— 现按 `emit-prelude-shadow` 响亮拒（形参、带型局部、无型局部三处都查）。
**阶段三的迁移清单（逐格数过，不是估计）**：`bigint` 恰好 17 处（`analyze/slots.ts` 8、`lower/lit.ts` 2、`lower/ir.ts` 2、`emit/expr-boxed.ts` 2、`emit/abi.ts` 2、`analyze/state.ts` 1），全部是 int64 语义，可整族降到 Godot `int`；边界读数在 `corpus/cases/489-int64-face`（回绕、截断除法、`%` 随被除数、`<<`、`float()` 舍入、`int(float())` 越界、`to_int` / `hex_to_int` 精确），越界字面量那一形（`18446744073709551615`）在探头 `000-probe-t4-int64`：夹到 `INT64_MAX` 并打三条 `Cannot represent … as a 64-bit signed integer, since the value is too large.`。`WeakMap` / `WeakSet` 恰好两处（`lower/cst.ts:49` 的 `CST_PARENTS`、`analyze/state.ts:182` 的 `CLASS_FACE_RECEIVERS`），换下标键即可（CST 节点是十字段 Dictionary，另挂一个自增 `__id`），D7 那五处等式面不碰。泛型容器 208 处（`Map`/`Set` 形态）→ Dictionary / Array（树里已活）；`?.` / `??` 369 处 → 显式判空；`#private` 0 处、`.bind()` 0 处。
**阶段四收尾（fa-closed 为什么仍拒）**：探头 `000-probe-t4-fa-closed` 把 close() 之后整张表量了 —— 值都能复现（`is_open` false、`get_position` / `get_length` 0、`eof_reached` false、`get_line` 空、`get_buffer(2).size()` 仍是 2、`get_error` 0、`is_open` 之后再 `close()` 无害），但每种方法打**不同的**引擎 ERROR 块：`get_position` 是 `File must be opened before use.`、`get_length` / `seek` / `flush` / `store_buffer` 一族是 `Parameter "f" is null.`、`get_as_text` 走 `core/io` 的 `Condition "r != len" is true.`，文件与 backtrace 都绑在 Windows 驱动上。产物侧照旧响亮拒（`fa-closed`），理由从「值没法复现」改成实测的这套消息集。
**Tier 4 进度账（判据各自有门，别拿"写完了"当证据）**：阶段零～四**已收口**——零：`test/e2e/bootstrap/convergence`（三面 + 门自己七面自校验）、`test/repo/bootstrap-boundary`、`tools/bootstrap.mjs`；一：语料 `479` 逐字节 + 撞墙读数；二：15 支切片 8/5/2 分类 + 三支相撞收成响亮拒（entry-name / class-clash / prelude-shadow）；三：拍板⑥⑦ 由语料 `485` 与树验证、迁移清单逐格数完（17 bigint → int64，语料 `489` 量边界；2 处 WeakMap 换 `__id`；208 处泛型容器；369 处 `?.`/`??`）；四：`481`–`484` 四支语料 + `procface` 两宿主对账 + 门槛表（`fa-closed` 量完仍拒）。阶段五**进行中**：`test/fixtures/bootstrap/gdsrc/` 已装 `tokens` / `lexer` / `indent` / `builder` / `state` / `diag` 六支（≈整层 `descent/`），`portface` 三面（工程编译 / 两次编译逐字节 / bundle == Godot 参照）守着；余下是语法本体（`stmt` / `expr` / `decl` / `index`）到 emit / analyze / lower / compile / cli 那四十来片。阶段六（`N+1` 自举闭环）在阶段五完成前无从谈起。
核心技术：手写递归下降解析器（`packages/compiler/src/parse/descent/`，纯 TS，无 wasm 无 C）、scriptc（AOT 出原生 exe）。

## 仓库结构（pnpm workspace + Turbo）

| 位置 | 内容 |
| --- | --- |
| `packages/runtime` | 运行时内核：值表示 / `ops.*` 动态路径 / `fast.*` 快路径、容器、UTF-32 String、Vector/Color、hash；GDScript 内建函数按族拆在 `runtime/builtin/*.ts`（`builtins.ts` 只剩再导出与两处 hook 接线），方法名与属性面按接收者种类拆在 `runtime/method/*.ts`（`methods.ts` 只留 `method()` 分派器），容器 / 打印 / `%` 格式化 / 型标注盖章拆在 `runtime/values/*.ts`（`values.ts` 只剩门面）；**内置类一律住在 `runtime/class/<族>/<类>.ts`**，一支类的类体、构造、打印与方法面同处，七个族：`vector`（六支向量）、`shape`（`rect` = Rect2+Rect2i、`aabb`）、`orient`（`plane` / `quaternion` / `basis` / `transform2d` / `transform3d`）、`color`（`color` + `named` 表）、`bytes`、`identity`（`rid` / `node-path` / `signal` / `callable` / `native-class` / `null-object`）、`object`（`script-object` / `node` / `node2d` / `node3d` / `control` / `scene-tree` / `node-face`）、`host`（`json` / `regex` / `file-access` 含 GdDir）；两支面单列同目录模块是实测出来的取舍——`packed` 并入方法面会撞 1500 行预算线，`node` 并入方法面会造出 `node → node2d → node` 的价值环；同族模块用目录、目录里不再重复前缀；host 宿主入口 |
| `packages/compiler` | parse（手写递归下降→CST）→ lower(IR) → analyze → emit；`analyze/` 按判断维度分模块、入口 `analyze/index.ts`；`emit/` 按发射维度分模块、入口 `emit/index.ts`、每模块共享 `emit/context.ts` 的 `EmitContext`；`semantics/` 装 Godot 实测静态表；`compile/project.ts` 跨文件工程编译；`compile/ir-cache.ts` 内容寻址 IR 缓存；`tree-face.ts` 产物树唯一清单 |
| `packages/gds2js` | CLI（`src/cli.ts` 薄入口 + `src/cli/` 模块）+ 打包三模式（import/local/single）+ export（SEA/scriptc）；`src/version.ts` 是唯一版本字面量 |
| `packages/testkit` | 测试断言库 |
| `tools/` | 门脚本与生成器：`golden.mjs` / `compile.ts` / `release.mjs` / `cli-native.mjs` / `bench*` 等 |
| `corpus/cases/` | 语料用例 485 例（另有 `000-*` 探头，不入语料），逐例 golden 对账；工程用例带 `project.godot`，场景用例再带 `main.tscn` 第三格夹具 |
| `test/` | `repo/`（仓库不变量）+ `e2e/`（出货与语义门，逐支落点看目录；`e2e/bootstrap/` 是 Tier 4 那把切片级收敛门）+ `fixtures/bootstrap/slices/`（自举切片夹具，不入语义账）+ `fixtures/bootstrap/gdsrc/`（阶段五那棵逐步长大的移植树，带 Godot 参照 gdsrc.txt）+ `support/` |

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
7. **出货** —— `pnpm release` 前先确认全量 scriptc 门零红（`GDS2JS_SCRIPTC_ALL=1 pnpm test:scriptc`，本机以小时计，四并发）；版本戳一致由 release 自己校验，漂了就红。
8. **重构的默认判据** —— `pnpm test:compile` 之后 `git diff --exit-code -- corpus/cases` 必须零漂移：它只对**已追踪**的产物敏感，正是「存量语义没变」的机器判据（新增用例走自己的 golden 基线）。
9. **Tier 4 的切片门** —— 动 `parse/` `lower/` `emit/` 任何一支形状后跑 `pnpm test:bootstrap`（`vitest run --project e2e bootstrap`）；切片的新 `godot.txt` 只能由 `pnpm regen:bootstrap-golden` 从钉住的裁判引擎写盘，别手抄。切片产出的撞墙读数（哪一支 `UnsupportedError`）决定阶段二的排序。 阶段五起移植树同属这把门：`test/e2e/bootstrap/portface.test.ts` 三面判据（工程编译得过、两次编译逐字节相同、bundle 产物 == `gdsrc.txt`），参照只能由 `pnpm regen:bootstrap-tree` 从钉住的裁判引擎重写。

## 文档索引

- `docs/` 整套已随 Tier 2 收口归档进 git 历史，取回：`git show 64cf250:docs/ROADMAP.md`（拍板决策 D1–D8 / A–I、阶段判据、收口快照）、`git show 64cf250:docs/ARCHITECTURE.md`（D8 正文：出货模型、阶段契约、模块布局、尺寸棘轮、依赖图纪律、发射面、实测出处）、`git show 64cf250:docs/RUNTIME_API.md`（runtime ↔ emitter 契约 v1，签名冻结）、`git show ca95311:docs/TIER2.md`（Tier 2 阶段与取证清单）、`git show fa46a87:docs/SEMANTICS.md`（S 编号语义基线与逐笔台账）。
- 归档件不再承载待办，它的判据本体全部有门守着：D8 不变量 → `test/repo/`（`tree-face` / `seam-count` / `module-cycles` / `phase-boundary` / `version-consistency` / `file-budget`）、契约面 → `test/repo/emit-surface` + `emit-contract`、语义 → `corpus/` golden + `pnpm test:golden` + `corpus-diff` 三桶、出货 → `test/e2e/export` + `cli-native` + 全量 `test:scriptc`。还开着的只有 D7 那一族（引用计数没建模）：判据在代码里，`runtime/method/object.ts` 的 `signal-flag-deferred` 与 `runtime/method/callable.ts` 的 `callable-deferred-null` 两支 `UnsupportedError` —— 一律「没量过就响亮拒」，不准静默降级。
- `README.md` — CLI 用法、运行时打包模式、测试分层详解
