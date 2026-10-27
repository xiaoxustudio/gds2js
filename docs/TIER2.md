# Tier 2 —— 减负前置、引擎类值、七个值类型、宿主与对象生命周期

## Context

Tier 1 是纯语言层（D4）：不实现 `Node` / `SceneTree` / 任何引擎 API，遇到就抛 `UnsupportedError`。它已收口。Tier 2 要回答的是**同一批语义之外的那一层**：引擎类当值、七个值类型（D6）、宿主与对象生命周期（D7）；外加一支不含语义增量的**阶段零**，因为六份预算封顶文件已经零余量。

`docs/ROADMAP.md` §2 以前只挂着七条待办，没有阶段、判据、取证计划，也没有写下这一层的**硬约束**。而硬约束会直接否决最省事的实现路线 —— 例如「靠字符串名反射引擎属性」这条路在原生轨上**根本编不过**（`packages/gds2js/src/cli/export-exec.ts:175-176` 列了 scriptc 静态编译不收的形状：按名取成员、cast 成函数表、namespace import）。这份文档就是把这三件事先说清楚，再排期。

现状盘点（都是盘面事实，不是推测）：

- `compile/project.ts:538-539` 在进 emit 之前就把 `extends Node` 抛掉；`:17-20` 的 `ENGINE_BASES` 是手抄 12 个名字，名单外的 `extends Sprite2D` 掉到 `:541 extends-unknown`。
- `emit/surface.ts:223 SCRIPT_HOST_BASES`（`RefCounted` / `Node` / `Object`）与 `project.ts:15 HOST_BASES`（只有 `SceneTree`）语义互相抵消，且**零测试覆盖**。
- `packages/runtime/src/host.ts:107-167` 的 `SceneTree` 是 `setTimeout` 自制帧循环：无 children、无 `add_child`、无 `_ready`，`run(maxFrames=3000)` 固定 `dt`。`:111` 那条注释是实测教训：**基类 `async` 虚方法被子类覆写在静态编译目标上没有实现**，所以两条 virtual 都写成「非 async 签名 + 返回 Promise」。
- `runtime/identity.ts` 的 `LIVE: Map<number, object>` 是强引用且从不清除 → 没有确定性释放，D7 与 `object.ts:109 signal-flag-deferred` 都卡在这。
- 全仓 **0 个 `.tscn`**，`tools/golden.mjs` 只发 `--script`、从不加载场景；`tools/lib.mjs` 的夹具槽硬编码成 `main.gd` / `godot.txt` 两个名字，`normalize` 只按 gd 路径归一，**没有实例 id 掩码**。
- `emit/index.ts` 尾部写死 `await new Main().run()`：产物只有一个宿主驱动入口。

## 三条硬约束（决定所有设计形状）

1. **不许按名反射。** 引擎成员面必须在**发射期**解析成静态调用或静态表；任何 `obj[name]` / 动态 vtable 的写法在 node 轨能跑、在 scriptc 轨编译失败，而 `test:cli-native` / `test:scriptc` 是本项目的门（拒答文案就在 `export-exec.ts:175-176`）。
2. **不加第五个包，新模块必须是 `packages/*/src/**/*.ts`。** `tools/cli-native.mjs` 的复制清单与 `@gds2js/<pkg>/<subpath>` 相对化正则只认 runtime/compiler；`copyTreeTs` 只搬 `.ts`；`TREE_FACE`（`packages/compiler/src/tree-face.ts`）是封闭清单，产物树形状由 `test/repo/tree-face.test.ts` 逐一 `existsSync` 对账。
3. **登记必须实测派生。** 基类集合、引擎成员面、值类型的构造式/成员/元数，一律由探头从 Godot 取，不手抄名单（现在的手抄名单就是 `ENGINE_BASES` 那个 12 名的坑）。

## 阶段

### 阶段零 —— 减负前置切片（不加语义，只腾预算）

阶段一~三要动的落点，**恰好全压在预算顶格的文件上**。`test/repo/file-budget.test.ts:10-17` 的六条登记值，盘面行数与登记的封顶**一字不差**：

| 登记文件 | 封顶 | 盘面 | 余量 | Tier 2 谁要动它 |
| --- | --- | --- | --- | --- |
| `runtime/values/core.ts` | 1202 | 1202 | **0** | 阶段二：默认值 / 转换 / 打印 / 相等 / 字典键前缀 / `deepCopy` 六面都要加臂 |
| ~~`compiler/lower/lower.ts`~~ | 1269 | 已切出 `lower/{cst,lit}.ts` | 249 | 阶段二要用 `CTOR_ARMS` / `ARM_NO_CTOR` 那一族；封顶已随切分降到 1020，两份新模块同步进了 `STAMP_SOURCES` |
| ~~`analyze/checks/collections.ts`~~ | 1153 | 已拆 | — | 阶段零已目录化为 `checks/collections/{typed,index-slots,var-assign,pack,method-arity}.ts`，预算登记随之删除；阶段二的 `Array[T]` 盖章落在 `collections/typed.ts` |
| `runtime/packed.ts` | 1098 | 1098 | **0** | 阶段二：与值类型互转 |
| `runtime/methods.ts` | 59 | 59 | **0** | 门面：新成员族要加再导出名 |
| `runtime/builtins.ts` | 37 | 37 | **0** | 门面：同上 |

门是「只降不升」的棘轮（`:46` 判 `> budget` 即红），所以 Tier 2 的**每一行新增都必须先在这儿换出等量的行**，否则第一笔语义提交就把仓库不变量顶破。把它当成一个独立阶段而不是"顺手挪两行"：本阶段**零语义增量**，判据就是存量字节门零漂移，可整体回滚。

切法沿用 Tier 1 已验证的那三条路子，不再发明：

- **同族目录化**：`values/core.ts` 里成簇的（默认值 / 转换 / 相等）按 Tier 1 P4/P7 的 decl 级搬迁切到 `values/` 下新模块，门面留再导出 —— 公开面 169 名一字不变的证明流程（`tmp/surface-check.mts` 那套）重跑一遍即可。
- **叶子外提**（本轮实际用的那把刀）：只切「被引用、但不反向引用」的簇。`lower.ts` 试过把 expr/pattern/arm 一族整块搬出去，结果是把**同文件内的互递归**变成**跨模块值环** —— 那一族必须留在 `lower.ts`，能走的只有 CST 访问子与字面量处理两片叶子。
- **门面瘦身**：`methods.ts` / `builtins.ts` 两行封顶的门面，把逐名再导出改成 `export * from`（前提：`module-cycles` 门把 `export … from` 也算价值边，这条改动要看着它绿）。

**两道连带门，切的时候要一起处理，不然会静默失效**：

1. `compile/ir-cache.ts:8` 的 `STAMP_SOURCES` 是 IR 缓存戳的输入清单，`:17-23` 的读取包在 `try{}catch{}` 里 —— 文件不在就直接跳过，不报。门 `test/repo/stamp-sources.test.ts` 的③ 只扫 **`lower.ts` 一层的 `./` import**：新表若被 `lower/ir.ts` 等传递依赖引用，缓存戳算不到它，改表不会让 IR 缓存失效（**假绿**）。所以本阶段每外提一份表，要么同步加进 `STAMP_SOURCES`，要么把③ 加深成传递闭包 —— 二选一，写在提交正文里。
2. `emit/surface.ts` 的四张名表与 `emit-contract` / `emit-surface` 双向门：搬动只要碰发射面导出的名字，名表与门必须同时绿。

**判据**：`pnpm test:compile` + `git diff --exit-code -- corpus/cases` 零漂移；`pnpm test` 与 `pnpm test:treeface` 全绿且六条封顶值**只降不升**（降了就把登记数字一起改小，棘轮才真生效）；纯结构调整免 `bench:ab`，但若动了 `values/core.ts` 的相等/打印热臂，按常驻口径 5 出配对读数。

### 阶段一 —— 引擎类值的属性面（读数已全，先落地）

**切割口径**：只做「把 `Node.new` 这类成员当**值**发出来，并满足已测读数」；**真正调用它造实例照旧响亮拒**（造实例要对象模型 → 阶段三）。这是唯一能让"读数已全"立刻落地、又不把宿主提前拖进来的切法。

**本轮新取的读数**（`GODOT_BIN` = Godot 4.6.3.stable.official.7d41c59c4，`tools/golden.mjs` 落盘；探头料在 `corpus/cases/000-probe-engine-class-new/`，实现落地时转正为语料用例）。当前我们在这一支的失败点是 `method/object.ts:45 native-class-member`（取属性 `Node.new` 就抛，还没走到造实例）：

```
f01|25|25|25|25|25|25                 typeof Node.new / RefCounted.new / Object.new / Resource.new / FileAccess.new / GDScript.new 全是 25（Callable）
f02|true|false|true                  n == Node.new 为 true；n == RefCounted.new 为 false；两次独立取值等式成立
f03|new|new|new                      .get_method() 一律 "new"
f04|true|true|true                   .is_valid()
f05|0|0|0                            .get_argument_count()
f06|-1|new|true                      bind(1) 之后元数 −1、名与有效性不变
f07|false|false                      .is_null()
f08|1|true|1                         {Node.new: 1} 的 size / has / 取值 —— 两次取值能当同一个字典键
f09|GDScriptNativeClass::new|...     str() 三支同名同标签，不带进程内号
```

读数里**没有**任何实例 id（`.call()` / `Node.new()` 造出的实例那一形不在本阶段，掩号是阶段三第 1 步的前置），所以这一格可以现在就变成语料用例而不等掩号落地。

已测读数（原 §2 第 4 条，不必重量）：`RefCounted` / `Object` / `Node` / `Resource` / `FileAccess` / `GDScript` 六支的 `.new` 同名同标签 `GDScriptNativeClass::new`、`typeof` 为 25、两次取同一属性 `==` 为 true、`get_method()` 给 `new`、`is_valid()` true、`get_argument_count()` 0、`bind(1)` 后 −1、`.call()` 造得出实例（实例号按进程内分配，语料一律掩号再比）。

落点（复用现成机制，不新造形状）：

| 要做的事 | 复用的现成件 | 改哪里 |
| --- | --- | --- |
| 引擎类成员名当值发 | `emit/expr-boxed.ts:206-212` 已有 `rt.methodCallable(rt.V.object(...), "名")` 的 method-value 发射 | 新增一支：接收者是 `GdNativeClass` 且成员在实测面上 → 发同一形状 |
| 「面 → 成员名 + 元数」的编译期表 | `semantics/builtin-members.ts`（`BUILTIN_INSTANCE_MEMBERS` / `BUILTIN_ARITY`）+ 消费者 `analyze/arity.ts:126-149`、`face-arity.ts` | 新表 `semantics/engine-faces.ts`，按同一形状被 analyze 消费 |
| 两次取值 `==` true | `runtime/native-class.ts` 的 `BOXES` 进程内缓存（同名同一个盒） | 不动 |
| 放行后剩下的拒 | `method/object.ts:45 native-class-member`、`method/access.ts:414`、`object.ts:220`（`.new` 只对 `ClassDesc` 生效） | 从「整支拒」改成「按表放行，未测面继续抛」 |

**取证与出处**（新表必须可重算，不能又成一张手抄表）：新增 `tools/engine-class-face-probe.mjs`（无头引擎里跑 `ClassDB.class_get_method_list` / `property_list`，探头先只覆盖这六支，落盘前走 `requireGodotPin()`）+ `tools/engine-class-face.mjs` 渲染 `semantics/engine-faces.ts`；`package.json` 加 `regen:engine-class-face`；`test/repo/file-budget.test.ts` 里这张表要**同时**进 `EXEMPT_FROM_BUDGET`（`:7`）和 `REGENERATED`（`:8`）—— 门④（`:68-75`）判的是「豁免但未生成的表必须落在 `PROVENANCE_DEBT` 里」，而该清单现在是空数组（`:9`），所以只加豁免、不加生成器就直接红；反过来两个清单都登记到位，它就永久不进债务账。`test/e2e/codegen-drift.test.ts` 加一条逐字节门（现有四条），`doc-counters③` 已经递归扫 `docs/` 全目录（`walkUnder`，无需为新文档扩清单）。

**「还没做什么」要变成可机器校验的清单**，而不是散落的 `throw`。**但不要照抄 `lower/globals.ts:3` 那张 `GLOBAL_TODO_FUNCTIONS`** —— 它在 S286 之后已清空，而且 `packages/compiler/test/emit-guards.test.ts:53` 用 `expect(TODO_NAMES.join(",")).toBe("")` 把它**钉成必须为空**；往里加名字会直接红。要抄的是它的**机制形状**（清单被 emit 侧多处 import、门逐名要求「仍在发射期抛」）：新建 `packages/compiler/src/semantics/engine-todo-faces.ts` 导出 `ENGINE_TODO_FACES`，配**一条自己的新门**（清单里每个名字都必须仍然抛对应的 `UnsupportedError` code；实现了却忘了划走就红），本阶段至少含 `instantiate` / `call-on-new` / 属性读写三族。

**这张清单的名字表与放行用的名表是两回事，两边都要登记**：`semantics/engine-faces.ts` 里的引擎成员名只给 analyze/emit 用（编译期，不进产物）；一旦本阶段需要 runtime 侧**新导出名**（例如给 method-value 形状补一支工厂），那个名字必须同时进 `emit/surface.ts:11` 的 `RT_NAMES`（`emit-contract.test.ts` ①②③ 与 `emit-surface.test.ts:37` 会验「产物里每个 `rt.<名>()` 都在 runtime 导出表上」），漏登记就是出货面缺项。

**判据**：新增 corpus 用例逐字节对齐上述读数；**存量产物零漂移**（`pnpm test:compile` + `git diff --exit-code -- corpus/cases` —— 这些形状今天全在抛错，不进产物，所以存量必须一字不动）；`is` / `typeof` / 打印三面不许动（`runtime/patterns.ts:136-155` 的 `PROBED_CLASS_NAMES` 要扩也必须先出实测）；`test:cli-native` 20/20 与 scriptc 面探针必须绿（约束 1 的唯一机器证明）。

**预算影响**：本阶段的主落点 `method/object.ts`（375 行）与 `method/access.ts`（485 行）离 1500 线都远，不需要先减负；但引擎类成员**不需要**新增导出名（放行的是既有的 `methodCallable` / `V.object` 形状，新表在 compiler 侧）。真正的预算压力在阶段二，见下。

### 阶段二 —— 七个值类型（D6，整族进，分三批）

成本量级（以已实现的 `Vector2` 为模板实测：口径 = `packages/*/src` + `tools/` + `test/`，不计 `corpus/` 产物，**45 个文件、3229 次命中**）。这不是"加一个类文件"的工作量，落点清单：

- **runtime**：新类文件（仿 `runtime/vector2.ts` 的 `GVector2` / `vector2()` / `asVec2` / `toVec2` / `vector2New` / 常量表这套形状）、`tags.ts`（**值类型没有自己的 Tag，全走 `Tag.OBJECT` + `instanceof`**，`V` 工厂也没有 `V.vector2`）、`builtin/names.ts` 的 `TYPE_NAMES`（七个名字已在册）、`method/object.ts:47-68` 接收者分派、`method/access.ts:416` 属性读、`face-arity.ts` 的元数与存在表、`values/core.ts`（默认值 / 转换 / 打印 / 相等 / 字典键前缀 / `deepCopy`）、`values/print.ts`（`SV_VALUE_CTORS` 与 `str_to_var` 构造式）、`values/format.ts` 的 `%v`、`values/stamp.ts`、`builtin/hash.ts` 的 murmur 逐分量、`var-bytes.ts` 序列化、`convert.ts`、`ops.ts` 六则运算符逐对 + `SORT_ORDERED`、`runtime/slots.ts` 槽位加宽；出货面 = `packages/runtime/package.json` 的 `exports` 白名单加一条 + `runtime/index.ts` 一行再导出。
- **compiler**：`semantics/faces.ts`（现在 `Rect2: []` 是**空表**）、`semantics/elem-faces.ts` 的 `PARAM_OWN_SLOTS`（这七个名字已在，语义是「只准占位不准用」，要逐名划走）、`semantics/builtin-members.ts:174-188`、`op-pairs.ts`、`arg-types/`（face / instance / global / static 四份）、`analyze/slots.ts`（加宽与槽形）、`analyze/state.ts`、`checks/operators.ts`、`emit/surface.ts:267 D6_VALUE_TYPES`（唯一消费者是 `emit/helpers.ts:947` 发 `rt.unsupportedValueDefault`，其 runtime 侧占位在 `builtin/ops.ts:14-16`）、`emit/abi.ts` 的 `declaredCast` 与 `MEASURED_SLOTS`、`lower/lower.ts` 的 `CTOR_ARMS` / `ARM_NO_CTOR`（七支现在全 `true`）、`lower/ir.ts` 的 `STATIC_MEMBER_FNS`。

**分批（按依赖序，不是一次七支）**：

1. `Rect2` + `Rect2i` —— 只依赖已实现的 `Vector2` / `Vector2i`。
2. `Plane` + `Quaternion` + `AABB` —— 依赖已实现的 `Vector3`。
3. `Basis` + `Transform2D` —— `Basis` 依赖 `Quaternion` 与轴向量，`Transform2D` 依赖 `Vector2` 和自己的列。

每批独立可回滚，每批一份实测清单（下列格子**一支都不能少**，缺哪格哪格继续抛）：构造式 arity 全形（含空构造、`from`/`to` 两形、与兄弟类型的互转）、静态名、成员面 + `get_argument_count`、`==` / `hash`、`str()` / `var_to_str` / `str_to_var` **三向往返**、`%v` 格式化、`var_to_bytes` / `bytes_to_var` 往返、`Array[T]` 元素盖章与 `is_same_typed`、字典键、`is` / `get_class`、六则运算符与比较对（op-pairs 双向）、类型违反的报错整句、`var x: T` 的默认值。

**Tag 取舍**：继续 `Tag.OBJECT` + `instanceof`，不给这七支新增 Tag。理由：八个 Tag 在全仓有硬编码分支面（`tagName`、`typeOf`、`valueTypeName`、`keyOf` 前缀、`var_to_str`），新增 Tag 会牵动 `typeof` / `hash` / 字典键三条**已实测**的等式；而 `Vector2` / `Color` 已经证明 OBJECT+instanceof 这条路在这三面上逐字节对得上 golden。代价要写清楚：装箱轨上每多一个值类型，判定链就多一串 `instanceof`，热面（`values/core.ts` 相等与打印、`ops.ts` 运算符）会变长 —— 所以**每批都要出 `bench:ab` 配对读数**，|t|≥2 才算收益，读不出就按"无回归"记录，不许凭单次运行下结论。

**判据**：这批动的是**语义增量**，字节门只对存量敏感（见「门序」）；新增用例走 `pnpm test:golden` 建新基线；`emit-surface` / `emit-contract` 必须绿（新名要么进名表要么不发）；**本阶段是预算最紧的一支** —— 落点里 `values/core.ts`、`lower/lower.ts`、`checks/collections.ts`、`packed.ts` 四份都顶格，`runtime/index.ts` / `methods.ts` / `builtins.ts` 三扇门面也要加新类文件的再导出（且新增模块必须仍被 `module-reach` 从入口走到、被 `test:pkgmodes` 打进 bundle），所以**每批开工前先确认阶段零换出的余量够这一批用**，不够就回到阶段零再切一刀，不许临时把登记封顶改大（棘轮只降不升，改大要单独一笔并说明理由）。

### 阶段三 —— 宿主与引擎 API + 对象生命周期

按依赖拆四步，每步都要先出实测再做实现：

1. **实例 id 与打印的可比性（前置，最先做）**：`tools/lib.mjs` 的 `normalize` 目前只按 gd 路径归一，**没有实例 id 掩码**；而这一层所有新读数的号都是进程内分配。掩号规则不落地，任何节点/实例用例都不可比 —— 所以它是后三步的门槛，不是收尾活。
2. **对象生命周期与确定性释放（D7）**：`identity.ts` 的 `LIVE` 强引用 map 要换成可释放登记；`object.ts:109 signal-flag-deferred`（`CONNECT_DEFERRED`）与 `call_deferred` 一族在这里解禁。差异牵连五处等式面（打印、`is_instance_valid`、容器键、Callable 的等式、`hash`），见待拍板 9。**释放机制别顺手选 JS 的反射式方案**：`WeakRef` + `FinalizationRegistry` 看似最省事，但回收时机由 GC 决定、跨进程不确定的行为**测不出可复现的 golden**，违反红线 1「没测过的不许写进实现」；scriptc 静态轨对它的支持也未知。三条候选（γ 先响亮拒 / 引用计数照 Godot 的 `RefCounted` 语义自己实现 / WeakRef 交给 GC）里**建议 γ**：这一格继续抛 `UnsupportedError`，把「引用计数何时归零」作为单独一批实测读数（拿真 Godot 的 `is_instance_valid()` 时序量），量出来再落地。
3. **节点树与通知**：新增 `runtime/node.ts`（children、`add_child` / `remove_child` / `get_node(path)` / `free` / `queue_free`），今天这些名字全落 `method/object.ts:374 object-method`。通知派发**必须走发射期静态表**，复用 `emit/class.ts:200-222` 的 `__gdDispatch` 机制；`_ready` / `_process` 的覆写形状守 `src/host.ts:111` 那条实测教训（非 async 签名 + 返回 Promise）。基类集合改为探头派生的父子链，替换 `project.ts:17-20` 手抄名单，并解开它与 `surface.ts:223` / `project.ts:15` 的三集合冲突（补测试，今天零覆盖）。
4. **主循环与退出形状**：`emit/index.ts` 尾部写死 `await new Main().run()`，`src/host.ts:145 run(maxFrames=3000)` 是 `setTimeout` 自制循环。接真 `SceneTree` 要先拍：谁持有主循环、`quit(code)` 的退出码语义、以及那 18 例带 `<<GDS2JS_TIMEOUT>>` 的**退出形状**（引擎侧入口被作废后走不到 `quit()`、永不退出，我们的宿主自己收尾退 0）。这不是"改改就行"：`test/e2e/corpus-hang.test.ts:38-44` 要求**产物也被 SIGTERM 杀掉、且杀之前输出逐字节相等**，所以要连 `tools/lib.mjs` 的超时预算（`DEFAULT_TIMEOUT_MS`、`hangBudget`）与标记追加逻辑一起复核。
   - **这一支的门会随语义进步而变红，红了不许删断言**：`corpus-hang` 的用例清单是从 golden 里含 `<<GDS2JS_TIMEOUT>>` 的页**算出来的**（`:12-24`），所以宿主一旦让这批页真能走到 `quit()`、正常退 0，清单就掉成空集，`:26` 的顶层 `toBeGreaterThan(0)` 立刻红。这是有意的哨兵（防止门静默失效变成摆设），正确处置是**把这批用例从超时族正式划走**（重生成不带标记的 golden + 同一笔里调整本门的判据或适用范围），而不是把 `:26` 删了事。18 这个数当前由盘面实测确认。

**场景语料（从零开始）**：全仓 0 个 `.tscn`，`golden.mjs` 只发 `--headless --script`，所以这一格是**先设计后动工**。两条路线：

- **甲（建议）编译期展树**：`.tscn` 只在**编译期**读，把节点树、父子关系、属性初值展成静态建树代码发进产物；runtime 不需要 `res://` 资源加载器，`copyTreeTs`（`export-ts-tree.ts:112-120`，只搬 `.ts`）与 `TREE_FACE` 封闭清单**一字不动** —— 这是它唯一不违反硬约束 2 的走法。用例仍必带 `main.gd`（`tools/lib.mjs:69-75` 把它硬编码成夹具名）作为入口，额外允许 `scene.tscn` 当编译输入；`caseIsProject` 已按 `project.godot` 判定（`:77-79`），产物侧 `test/support/js-runner.ts:20-43` 会现场 `compileProject` 并硬要求 `res://main.gd`，形状沿用。
- **乙运行期 `load("res://scene.tscn")`**：看起来省事，但要求 runtime 有 `res://` 资源系统、且 `.tscn` 得进 HOME / 产物树 —— 直接撞硬约束 2，并且把"场景加载"这一大块未实测语义提前拖进 Tier 2。**不推荐**。

要补的是 harness 的第三格夹具槽（把编译输入从单个 `main.gd` 扩成"`main.gd` + 可选 `scene.tscn`"），以及第 1 步的掩号 —— **甲路线也照样需要掩号**，因为展出来的节点实例仍有进程内 id。

## 门序与「存量零漂移 vs 增量新基线」

每个阶段内部按这条阶梯跑（快 → 慢，且遵守 `AGENTS.md` 常驻口径 1、2）：

```
pnpm test:compile && git diff --exit-code -- corpus/cases   # 存量产物逐字节不变
pnpm typecheck  +  npx tsc -p tsconfig.test.json
pnpm test                                                       # 快层
pnpm test:treeface                                              # repo 不变量（含尺寸/环/出处门）
pnpm test:codegen                                               # 生成表逐字节等于读数重算
pnpm test:pkgmodes / test:cli-native / test:export              # 出货面与原生轨
pnpm test:golden-check  →（单独一轮）→ pnpm test:diff           # 引擎面，不并跑
```

**字节门在 Tier 2 仍然成立，但要分清两件事**：`corpus/cases/*/main.gen.mts` 里被 git 追踪的那些是**存量基线**，`git diff --exit-code -- corpus/cases` 只对它们敏感 → 它就是「存量语义没变」的判据；新用例落的是未追踪的新目录，不会让它变红。增量基线走：`pnpm test:golden <新用例>` 写 `godot.txt`（`requireGodotPin()` 已经挡住换引擎）→ 人工过一遍 `git status --porcelain corpus/cases` 的新目录清单 → `pnpm test:compile` 重跑后把新产物纳入追踪。阶段一、二里那些"从抛错变成能编过"的形状**不会**产生存量 diff（它们本来抛在产物之前），所以一旦存量出现 diff，就是回归，不是新语义。

## 待拍板（开工前要用户定）

按「不定就动不了工」排序；每条给选项与建议。

1. **阶段一的切割线（Tier 1 边界画在哪）**：`Node.new` 只当 Callable 值发、真造实例（`.call()` / `.new()`）照旧响亮拒（**建议**，唯一能让"读数已全"落地又不出宿主的切法）vs 连实例一起造（等于把阶段三的对象模型提前）。
2. **`docs/ROADMAP.md` 的 D4 措辞要不要跟着改**：D4 现文是「不实现任何引擎 API，遇到即抛 `unsupported`」，`AGENTS.md` 开头的项目概述同样口径。Tier 2 一旦放行引擎类值面，这句话就成了假陈述（**建议**：阶段一落地那一笔同步改成「Tier 1 范围内不实现；Tier 2 按 `docs/TIER2.md` 分阶段放行」，别让文档与门互相打脸）。
3. **引擎成员表面放哪**：`compiler/src/semantics/engine-faces.ts`（发射期解析，**建议**，产物零负担）vs runtime 全表（每份产物都背一张表，且要过 `copyTreeTs` / `TREE_FACE`）。
4. **七类型的 Tag 策略**：继续 `Tag.OBJECT` + `instanceof`（**建议**）vs 新增 Tag（牵动 `typeof` / `hash` / 字典键三条已实测等式）。
5. **阶段零的切法授权**：同族目录化 + 表外提 + 门面 `export *`（**建议**，全是零语义搬迁，判据是存量字节门）vs 允许把 `CODE_BUDGET` 数字临时改大换余量（会把棘轮变成摆设，不推荐）。
6. **`STAMP_SOURCES` 的处理**：外提表时逐笔同步加进清单（**建议**，改动小）vs 把 `stamp-sources` 门③ 从「`lower.ts` 一层 import」加深成传递闭包（更保险，但门的实现本身要实测它能抓得住）。
7. **`semantics/` 六张手抄表**要不要一起纳入 `regen:` 出处链：建议**只对本轮新增的表强制**（旧表分批补，否则就得往 `file-budget.test.ts:9` 的 `PROVENANCE_DEBT` 里记新账 —— 那本账现在是空的，门④ 对空账的口径是「无来源数据表清零」）。
8. **D7 的释放机制**：γ 继续响亮拒 + 单独一批实测（**建议**）vs 引用计数自实现 vs `WeakRef` / `FinalizationRegistry` 交给 GC（GC 时序不可复现，测不出 golden）。
9. **D7 的等式面**：分批改并各出实测（**建议**）vs 一次改齐五处（打印 / `is_instance_valid` / 容器键 / Callable 等式 / `hash`，一次改齐要重跑全量 golden）。
10. **原生轨的同步要求**：每阶段跑全量 scriptc 门（以小时计）vs **node 轨全绿 + scriptc 只跑面探针**，`pnpm release` 前再补全量（建议后者）。
11. **场景语料走甲还是乙**：编译期展 `.tscn` 成静态建树代码（**建议**，不碰封闭产物树）vs 运行期 `load("res://scene.tscn")`（要 runtime 资源系统 + 产物树加夹具，违反硬约束 2）。
12. **场景语料来源**：自建最小 `.tscn`（**建议**，逐格对着引擎读数写）vs 用户提供示例工程（覆盖面广但每份都要先归一到可比对读数）。

## 风险表

| 风险 | 触发条件 | 缓解 | 验证门 |
| --- | --- | --- | --- |
| 反射写法 node 轨全绿、scriptc 轨编不过 | 任何 `obj[name]` / 动态 vtable | 成员面一律发射期静态解析 | `test:cli-native`、scriptc 面探针 |
| 实例 id 不可比，golden 假绿或假红 | 节点/实例用例进 corpus | 先落 `normalize` 掩号（阶段三第 1 步） | `test:diff`、`golden-check` |
| 值类型判定链变长导致热面回退 | 七类型全走 `instanceof` 串 | 每批出 `bench:ab` 配对读数；必要时分表分派 | `bench:ab`、存量字节门 |
| 新增语义把存量产物带漂 | 改动落在产物可达路径上 | 每阶段第一步就跑字节门，漂了就停 | `git diff --exit-code -- corpus/cases` |
| 新表又变手抄、无出处 | 图省事直接写 `semantics/*` | 探头 + 渲染 + 写盘三段，`REGENERATED` 登记 | `test:codegen`、`file-budget` |
| 帧循环与 `Main().run()` 尾部冲突 | 阶段三接 SceneTree | 待拍板 10 先定驱动形状 | `test:pkgmodes` 三模式逐字节、`corpus-hang` |
| 基类名单继续靠手抄 | `ENGINE_BASES` 再补几个名字了事 | 探头派生父子链 + 补测试 | 新增用例 + `test:sema` |

## 交付判据（这份文档本身）

- 四个阶段（含阶段零）各有「范围 / 落点 / 取证 / 判据 / 可回滚边界」，且落点带 `文件:行号`。
- 十二条待拍板各有选项与建议。
- 阶段零先于任何语义增量：六条登记封顶零余量是盘面实测，不腾余量就不开工。
- 本文不写死会漂的门读数；要读数看 `docs/ROADMAP.md` §2 的带日期快照与提交正文。
