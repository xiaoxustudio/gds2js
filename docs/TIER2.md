# Tier 2 —— 减负前置、引擎类值、七个值类型、宿主与对象生命周期

## Context

Tier 1 是纯语言层（D4）：不实现 `Node` / `SceneTree` / 任何引擎 API，遇到就抛 `UnsupportedError`。它已收口。Tier 2 要回答的是**同一批语义之外的那一层**：引擎类当值、七个值类型（D6）、宿主与对象生命周期（D7）；外加一支不含语义增量的**阶段零**，因为六份预算封顶文件已经零余量。

`docs/ROADMAP.md` §2 以前只挂着七条待办，没有阶段、判据、取证计划，也没有写下这一层的**硬约束**。而硬约束会直接否决最省事的实现路线 —— 例如「靠字符串名反射引擎属性」这条路在原生轨上**根本编不过**（`packages/gds2js/src/cli/export-exec.ts:175-176` 列了 scriptc 静态编译不收的形状：按名取成员、cast 成函数表、namespace import）。这份文档就是把这三件事先说清楚，再排期。

现状盘点（都是盘面事实，不是推测）：

- `compile/project.ts:538-539` 在进 emit 之前就把 `extends Node` 抛掉；`:17-20` 的 `ENGINE_BASES` 是手抄 12 个名字，名单外的 `extends Sprite2D` 掉到 `:541 extends-unknown`。
- `emit/surface.ts:230 SCRIPT_HOST_BASES`（`RefCounted` / `Node` / `Object`，只喂内部类的基类链）与 `project.ts:16 HOST_BASES`（只有 `SceneTree`，管模块级 `extends` 走宿主导入）——两集合今天各管一段、不再互相抵消，第三张手抄名单 `ENGINE_BASES`（12 名）已删：「这个名字是不是引擎类」由 `regen:engine-classes` 那张 ClassDB 全量表回答，「能不能当脚本基类」由实测过的 `SCRIPT_NODE_BASES`（`Node` / `Node2D`）回答。四格判定（宿主 / 引擎基类 / 引擎类但未量 / 根本不是类名）由 `packages/compiler/test/script-base-sets.test.ts` 十格钉住（这一带原来是零覆盖）。
- `packages/runtime/src/host.ts:107-167` 的 `SceneTree` 是 `setTimeout` 自制帧循环：无 children、无 `add_child`、无 `_ready`，`run(maxFrames=3000)` 固定 `dt`。`:111` 那条注释是实测教训：**基类 `async` 虚方法被子类覆写在静态编译目标上没有实现**，所以两条 virtual 都写成「非 async 签名 + 返回 Promise」。
- `runtime/identity.ts` 的 `LIVE: Map<number, object>` 是强引用且从不清除 → 没有确定性释放，D7 与 `object.ts:109 signal-flag-deferred` 都卡在这。
- 全仓 **0 个 `.tscn`**，`tools/golden.mjs` 只发 `--script`、从不加载场景；`tools/lib.mjs` 的夹具槽硬编码成 `main.gd` / `godot.txt` 两个名字；`normalize` 已掩 `<Class#号>` 与引擎 `core/variant`、`core/math` 的报错帧，但**裸 `get_instance_id()` 数字**没有规则。
- `emit/index.ts` 尾部写死 `await new Main().run()`：产物只有一个宿主驱动入口。

## 三条硬约束（决定所有设计形状）

1. **不许按名反射。** 引擎成员面必须在**发射期**解析成静态调用或静态表；任何 `obj[name]` / 动态 vtable 的写法在 node 轨能跑、在 scriptc 轨编译失败，而 `test:cli-native` / `test:scriptc` 是本项目的门（拒答文案就在 `export-exec.ts:175-176`）。
2. **不加第五个包，新模块必须是 `packages/*/src/**/*.ts`。** `tools/cli-native.mjs` 的复制清单与 `@gds2js/<pkg>/<subpath>` 相对化正则只认 runtime/compiler；`copyTreeTs` 只搬 `.ts`；`TREE_FACE`（`packages/compiler/src/tree-face.ts`）是封闭清单，产物树形状由 `test/repo/tree-face.test.ts` 逐一 `existsSync` 对账。
3. **登记必须实测派生。** 基类集合、引擎成员面、值类型的构造式/成员/元数，一律由探头从 Godot 取，不手抄名单（现在的手抄名单就是 `ENGINE_BASES` 那个 12 名的坑）。

## 阶段

### 阶段零 —— 减负前置切片（不加语义，只腾预算）

阶段一~三要动的落点，**恰好压在预算顶格的文件上**。`test/repo/file-budget.test.ts` 原来登记六份，盘面行数与封顶**一字不差**；本阶段切完剩四份：

| 原登记文件 | 原封顶 | 现状 | 结果 |
| --- | --- | --- | --- |
| `analyze/checks/collections.ts` | 1153 | 目录化成 `checks/collections/{typed,index-slots,var-assign,pack,method-arity}.ts` | 登记删除（没有单文件再接近任何线）；阶段二的 `Array[T]` 盖章落 `collections/typed.ts` |
| `compiler/lower/lower.ts` | 1269 | 切出 `lower/{cst,lit}.ts`，封顶随降到 1020 | 余 249；阶段二的 `CTOR_ARMS` / `ARM_NO_CTOR` 落回本文件 |
| `runtime/values/core.ts` | 1202 | `GArray` / `GDict` 搬到 `values/containers.ts`，core 降到 576 | 登记删除；阶段二六面（默认值 / 转换 / 打印 / 相等 / 字典键前缀 / `deepCopy`）有了落点 |
| `runtime/packed.ts` | 1098 | **没动** | 阶段二不需要它：`Rect2` 不是 packed 元素种类，七类型互转走 `values/`，不碰 packed 数组 |
| `runtime/methods.ts` / `builtins.ts` | 59 / 37 | **没动** | 再导出名是往**已有的单行 `export { … } from`** 里追加名字，行数增量为 0；只有新增一整行时才受顶格约束 |

门是「只降不升」的棘轮（`m.lines > budget` 即红），所以规则是**先减后加**：后续阶段若要把代码写进仍被登记的文件，必须当场再切一刀，而不是把封顶改大。

切法只用了 Tier 1 已验证的两把刀，且学到一条边界：

- **同族目录化**（`collections.ts` 九支判断本就按维度天然分块，除共享 import 头之外零耦合，是最便宜的一刀）。
- **叶子外提**：只切「被引用、但不反向引用」的簇。`lower.ts` 试过把 expr/pattern/arm 一族整块搬出去，结果是把**同文件内的互递归**变成**跨模块值环** —— 那一族必须留下，能走的只有 CST 访问子与字面量处理两片叶子。
- **注入断开回程边**（`values/core.ts` 那一刀的关键）：core 里六处容器引用中只有两处**构造**（`elemDefault` 的 `new GArray()` / `new GDict()`），改成 `registerContainerFactories` 由 `containers.ts` 注册；其余全是 `Tag` 分流后的 `as GArray` 型标注 —— 型边不计值环，所以 `module-cycles` 仍是空表、`module-reach` 仍从入口走到每一份。

**两道连带门，切的时候要一起处理，不然会静默失效**：

1. `compile/ir-cache.ts:8` 的 `STAMP_SOURCES` 是 IR 缓存戳的输入清单，`:17-23` 的读取包在 `try{}catch{}` 里 —— 文件不在就直接跳过，不报。门 `test/repo/stamp-sources.test.ts` 的③ 只扫 **`lower.ts` 一层的 `./` import**：新表若被 `lower/ir.ts` 等传递依赖引用，缓存戳算不到它，改表不会让 IR 缓存失效（**假绿**）。本轮 `lower/{cst,lit}.ts` 已手工补进清单；若将来要拆 `lower/ir.ts` 的传递依赖，得把③ 加深成闭包。
2. `emit/surface.ts` 的名表与 `emit-contract` / `emit-surface` 双向门：搬动只要碰发射面导出的名字，名表与门必须同时绿。

**判据与读数**：`pnpm test:compile` + `git diff --exit-code -- corpus/cases` 零漂移（三刀各自跑过，均零漂移）；`pnpm test`、`pnpm test:treeface`、`pnpm typecheck` 全绿。纯结构搬迁按常驻口径 5 免读数是惯例，但 `values/core.ts` 是相等/打印热面，仍出了配对 A/B：|t|=0.44、checksum 一致 → **按无回归记录**（结构调整本来就该读成这样）。

### 阶段一 —— 引擎类值的属性面（读数已全，先落地）

> **进度（2026-10-27）**：六支引擎类值的 `.new` 面已放行（`45c8d30`）—— 生成表 `semantics/engine-faces.ts` + `tools/engine-class-face*.{mjs,d.mts}` + `pnpm regen:engine-class-face` + `codegen-drift` 第五条逐字节门 + 语料用例 `450-engine-class-new-face`（九格 golden，`corpus-diff` 286/286 逐字节、三桶全 0）；出货面按门序也全跑过：`pkg-modes` + `export` 42 格绿 2 格跳，`cli-native` 20/20（含 scriptc 出货与原生 CLI 等价），`GDS2JS_SCRIPTC_FILTER=450 pnpm test:scriptc` 真编真跑逐字节 1/1 —— 这是硬约束 1「不许按名反射」在新发射形状上的唯一机器证明。**没做的**：造实例那一形照旧抛 `native-class-member`（阶段三）；`ENGINE_TODO_FACES` 那份可机器校验清单换成了一支测试（`packages/runtime/test/engine-class-new-face.test.ts`）逐名要求仍抛，没另建 src 侧清单表。下面正文是当初的设计，保留作考古。

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

### 阶段二 —— 七个值类型（D6，整族进，分三批）【已收口：七型全落地，`unsupportedValueDefault` 那条拒已随 `Basis` 一起删掉】

> **进度（批次一第一片）**：`Rect2` / `Rect2i` 的**值形状**已落地 —— 构造式全形（`()` / 四数 / 两 Vector2 / 两 Vector2i / 同型与互转单参，浮点进 Rect2i 按引擎截断）、`position` / `size` / `end` 属性读写、打印 `[P: (1.0, 2.0), S: (3.0, 4.0)]`、`var_to_str` / `str_to_var` 往返、`var_to_bytes` 型码 7 / 8 与四分量编解码、`hash` 逐分量 murmur（**绝对值对上引擎**：`hash(Rect2(1,2,3,4)) = 3873189715`、`hash(Rect2i(1,2,3,4)) = 3206438488`、`hash(Rect2(1.5,2.5,3.5,4.5)) = 2235871981`）、`==` / `!=` 逐分量与 `Rect2 == Rect2i` 的响亮拒、`is Rect2` / `is Rect2i`、`Array[Rect2]` 元素与字典键、`var r: Rect2` 默认值。语料用例 `451-rect2-face` 十七格逐字节一致，`corpus-diff` 287/287、三桶全 0。
> **方法面也落了一半**：`method/rect.ts` 收下 Rect2 十四支与 Rect2i 十一支（Rect2i 没有 `is_finite` / `is_equal_approx`，实测不存在），语料用例 `452-rect2-methods` 十一格逐字节。三条从读数里逼出来的形状值得记住：`get_area()` 用**有符号**积（负尺寸照样正数）、`get_center()` 与 `end` 用**有符号**尺寸、`abs()` 才做归一；`grow_side` 的边号顺序是 Margin 的 `0=LEFT 1=TOP 2=RIGHT 3=BOTTOM`（猜成左右上下会全格错）；负尺寸矩形打 `has_point` / `intersects` / `encloses` 时引擎往 stderr 吐一句 `Rect2 size is negative, this is not supported. Use Rect2.abs() ...` 并回 false —— 那句带 `rect2.h:185` 的源文件行号，产物复现不了，所以**负尺寸那一形不能进语料**，只在用例外的读数里留证。另有两格没定案：`intersects(r, true)` 这种两参形在 `var e := Rect2(...)` 之后是解析期 `Too many arguments ... Expected at most 1`，但对构造式临时值同样写法却给 true —— 静态类型是否已知造成的分歧，没读清就响亮拒；`%` 格式化的 `%v`、以及 `e.abs` 当值取（打 `Rect2::abs`）也仍未定案。`%` 格式化的 `%v`（实测吐字面量）与 `e.abs` 当值取（打 `Rect2::abs`）两格待单独定案；`op-pairs` 的 Rect2 矩阵**故意不加条目**（引擎对 Rect2 没有算术与序比较，加了就是自造语义）。
> 结构上的两条副产出：`runtime/rect-classes.ts` 是把 `GRect2` / `GRect2i` 放在叶子模块以免 `string-ops → rect2 → string-ops` 成环（`module-cycles` 抓到过），`lower.ts` 的 `CTOR_ARMS` 外提成 `semantics/ctor-arms.ts` 换回了预算余量并同步进 `STAMP_SOURCES`。



成本量级（以已实现的 `Vector2` 为模板实测：口径 = `packages/*/src` + `tools/` + `test/`，不计 `corpus/` 产物，**45 个文件、3229 次命中**）。这不是"加一个类文件"的工作量，落点清单：

- **runtime**：新类文件（仿 `runtime/vector2.ts` 的 `GVector2` / `vector2()` / `asVec2` / `toVec2` / `vector2New` / 常量表这套形状）、`tags.ts`（**值类型没有自己的 Tag，全走 `Tag.OBJECT` + `instanceof`**，`V` 工厂也没有 `V.vector2`）、`builtin/names.ts` 的 `TYPE_NAMES`（七个名字已在册）、`method/object.ts:47-68` 接收者分派、`method/access.ts:416` 属性读、`face-arity.ts` 的元数与存在表、`values/core.ts`（默认值 / 转换 / 打印 / 相等 / 字典键前缀 / `deepCopy`）、`values/print.ts`（`SV_VALUE_CTORS` 与 `str_to_var` 构造式）、`values/format.ts` 的 `%v`、`values/stamp.ts`、`builtin/hash.ts` 的 murmur 逐分量、`var-bytes.ts` 序列化、`convert.ts`、`ops.ts` 六则运算符逐对 + `SORT_ORDERED`、`runtime/slots.ts` 槽位加宽；出货面 = `packages/runtime/package.json` 的 `exports` 白名单加一条 + `runtime/index.ts` 一行再导出。
- **compiler**：`semantics/faces.ts`（现在 `Rect2: []` 是**空表**）、`semantics/elem-faces.ts` 的 `PARAM_OWN_SLOTS`（这七个名字已在，语义是「只准占位不准用」，要逐名划走）、`semantics/builtin-members.ts:174-188`、`op-pairs.ts`、`arg-types/`（face / instance / global / static 四份）、`analyze/slots.ts`（加宽与槽形）、`analyze/state.ts`、`checks/operators.ts`、`emit/surface.ts:267 D6_VALUE_TYPES`（唯一消费者是 `emit/helpers.ts:947` 发 `rt.unsupportedValueDefault`，其 runtime 侧占位在 `builtin/ops.ts:14-16`）、`emit/abi.ts` 的 `declaredCast` 与 `MEASURED_SLOTS`、`lower/lower.ts` 的 `CTOR_ARMS` / `ARM_NO_CTOR`（七支现在全 `true`）、`lower/ir.ts` 的 `STATIC_MEMBER_FNS`。

**取证的现实形状（2026-10-27 实测撞出来的，别再撞一遍）**：想从引擎里一次性读回内置类型的成员面 —— `ClassDB.get_builtin_method_list(...)` / `get_builtin_property_list(...)` —— 在 GDScript 侧**不存在**：4.6.3 直接报 `Static function "get_builtin_method_list()" not found in base "GDScriptNativeClass"`。所以 `semantics/builtin-members.ts` 里 Vector2 那一族成员表当初是一支一用量出来的，Rect2 也只能走同一条路：**每个候选成员单独一支小脚本**（名字错了是解析期错误，会把整支脚本带走，所以不能合批）。顺带两条免费的口径读数：`Rect2 == Rect2i` 这种「内置类型名当表达式用」引擎给的是 `Builtin type cannot be used as a name on its own` + `Identifier "Rect2" not declared in the current scope`，各出一条 —— 这正是我们 `test:sema` 要对齐的那一类句子。

**批次一（`Rect2` + `Rect2i`）的读数已经取了**（`tmp/r2/grid.txt`，钉住的 4.6.3 直接跑，零解析错），几条会改变实现形状的：打印是 `[P: (1.0, 2.0), S: (3.0, 4.0)]` 这种**带前缀空格**的形状（`Rect2i` 同理但整数不带 `.0`），不是 `Rect2(...)`；`var_to_str` 反过来给 `Rect2(1, 2, 3, 4)` 且 `str_to_var` 能读回；`typeof` 是 7 / 8（与现有 Tag 表冲突点在 `Tag.OBJECT` 分流上，照 D6 的 OBJECT+instanceof 走没问题）；`var_to_bytes`/`bytes_to_var` 往返为真；`hash(b) == hash(c)` 为真（两个同值不同构造的矩形同哈希）；字典键 `{Rect2: 1}` 成立；`Array[Rect2]` 的字面量元素与 `arr[0] == b` 成立；默认值 `var j: Rect2` 给全零。**两条要单独定案**：`e.abs` 打出来是 `Rect2::abs`（说明 `abs` 是**方法名当值取**的那一形，不是属性），`"%v|%s" % [b, ...]` 两个占位符都按字面吐出 —— 这两格不能照抄直觉实现，要么补读数要么响亮拒。**六则运算符与 `<` `<=` `>` `>=` 比较对在 Rect2 上全部是解析期错误**（`Invalid operands "Rect2" and "Rect2" for "+" operator.`），所以 `op-pairs.ts` 这一族**不该加条目**，加了就是自造语义；`b is Rect2i` / `b is Object` 同样是解析期错误（`Expression is of type "Rect2" so it can't be of type ...`），只有 `b is Rect2` 合法；`grow_endpoints()` 在 4.6.3 不存在（`Array[Rect2].identical()` 也不存在）—— 名字表里没有就是没有，别补。

> **批次二进展**：`AABB` 已落地（typeof 16、`[P: (…), S: (…)]` 打印、`()` 与 `(Vector3, Vector3)` 两形、`position` / `size` / `end` 读、`get_volume` / `has_volume` / `get_center` / `has_point`（**闭区间**，与 Rect2 的半开不同）/ `intersects` / `merge` / `expand` / `is_equal_approx` / `is_finite`、`var_to_str` 写 `AABB(0, 0, 0, 1, 2, 3)` 并读回、`var_to_bytes` 28 字节、`Array[AABB]`、字典键、默认值、`is AABB`），语料用例 `453-aabb-face` 十一格逐字节，`corpus-diff` 289/289 三桶全 0。`has_volume()` 用 `size > 0` 三分量与（零与负尺寸都 false，实测）、`get_volume()` 是带符号积（负尺寸给 -8.0）。剩 `Plane` / `Quaternion`（批次二零头剩下的两支）与 `Basis` / `Transform2D`（批次三）。

**`*` 运算符（语料 `456-quaternion-mul` 五格逐字节）**：四元数积已按实测式子发出（非交换、`b*b` 的 y 打印 `1.0`、`u*u` 给 `(0, 0, 0, -1)` 即 360° 那一支）。**`Quaternion * Vector3` 整支响亮拒**，理由是复现不了：三种 float32 结合次序（`u×(2(u×v))`、`2(u×(u×v))`、基矩阵式）各只能对上四格里的三格，差的那一格是 `b * Vector3(1,2,3)` 的 z 给 `-1.000001`（引擎 `-1.0`）与 `b * Vector3(1,0,0)` 的 x 给 `-1.19e-7`（引擎 `-0.0`，基矩阵式在这格丢符号）—— 式子没读出来就不发数。读数与差值都在 `tmp/r2/rot*.mjs`。
**踩到的工程约束**：新值类型模块必须进 `packages/runtime/package.json` 的 `exports` 白名单（41 → 46 条），否则测试与产物按子路径 import 时 `ERR_MODULE_NOT_FOUND`；`composite-classes` / `value-ctors` 这类内部接线按口径**不**开放。

**批次二 / 三 的其余读数已取（4.6.3 直跑，`tmp/r2/b2.gd`）** —— 实现时照这份对，别再重量：
**`Plane` 也已落地**（语料 `454-plane-face` 九格逐字节，`corpus-diff` 290/290）：默认值是**零法身** `[N: (0.0, 0.0, 0.0), D: 0]` 不是 (0,0,1)；`d` 存的是常数项，故 `distance_to(p) = dot(n, p) - d`、`has_point` 是 `|dot - d| <= 1e-5`、`intersects_ray` 的 `t = (d - dot(n, from)) / dot(n, dir)`（这三处的符号我一处猜反过，是读数纠正的）；三点构造式的法身是 `cross(c - a, b - a)`（反过来就整体变号），`D = dot(n, a)`；打印里 **D 用 6 位小数去尾零**（`2` / `0.707107`），与法身三分量的 `0.0` 强制小数**不同形** —— 同一行里两套浮点格式，照着 vector 的写法抄就会错。

`Plane` typeof 14，打印 `[N: (0.0, 1.0, 0.0), D: 1.5]`，构造四形 `()` / `(Vector3, float)` / `(Vector3×3)` / `(四数)`，成员 `normal` / `d`，方法 `normalized()` / `distance_to()` / `has_point()` / `intersects_ray()`（给点或 null）/ `is_equal_approx()`，`var_to_str` 写 `Plane(0, 1, 0, 1.5)` 且能读回，`var_to_bytes` 长 20（型码 14 + 4 个 float32）；**没有** `is_normalized()` 也没有 `is_normalized_normal()`（两支都是解析期错）。
**`Quaternion` 也落地**（语料 `455-quaternion-face` 十一格逐字节）。三处只有读数能给：`length_squared()` / `dot()` 的**累加次序**是实数左结合 `(((x² + y²) + z²) + w²)`，按 `(x²+y²)+(z²+w²)` 分组就在第 8 位有效数字上错；`normalized()` 是**先取倒数再乘**（`k = r(1/len)` 后分量乘 `k`），直接除会在第三位小数错（0.307794 vs 引擎 0.307793）；`get_axis()` / `get_angle()` **不做长度归一**，直接用裸 `w`（`2·acos(w)`、`(x,y,z)/sqrt(1-w²)`）并把结果折进 float32。**没落地的**：`get_euler()` / `exp()` / `log()` 各只有一格读数（不足以定式子，硬写就是猜），`slerp()` 的引擎前置是「必须归一」且容差band没读 → 一律响亮拒；`nlerp` / `xform` / `xform_inv` / `angle_difference` / `get_shortest_arc` / `Quaternion.from_axis_angle` 在 4.6.3 **不存在**（解析期就没这个方法），`from_euler` 存在但只量了零欧拉角那一格。`*` 运算符（四元数积与 `q * Vector3`）已量到真值，作为单独一片再接触发器与 `op-pairs`。

`Quaternion` typeof 15，打印是**裸四元组** `(0, 0.247404, 0, 0.968912)`（不是 `[...]` 那两型），构造 `()` / `(四数)` / `(Vector3, float 角)`，成员 `x y z w`，方法 `length()` / `length_squared()` / `inverse()` / `normalized()` / `get_angle()` / `get_axis()` / `dot()` / `slerp()` / `is_equal_approx()`，`*` 四元数乘法成立（`q1 * q1` 有效，与 Rect2 相反），`var_to_str` 写 `Quaternion(0, 0, 0, 1)`，`var_to_bytes` 长 20。
`AABB` typeof 16，打印 `[P: (0.0, 0.0, 0.0), S: (1.0, 2.0, 3.0)]`，构造**只两形**：`()` 与 `(Vector3, Vector3)` —— 六数式是解析期 `No constructor of "AABB" matches the signature`；成员 `position` / `size` / `end`，方法 `get_volume()` / `has_volume()` / `has_point(Vector3)`（**没有** `contains`，也没有 `Point3` 这个类型名）/ `intersects()` / `merge()` / `expand()` / `is_equal_approx()`，`var_to_str` 写 `AABB(0, 0, 0, 1, 2, 3)`（六数写法与构造式不同 —— 读回靠的是这一式），`var_to_bytes` 长 28。

> **批次三进度**：`Transform2D` 已落地（typeof 11，语料 `457-transform2d-face` 十一格逐字节）。一处值得留档：`rotated(a)` 的式子是整体左乘 `R = [[c, -s], [s, c]]`（三列一起转），我第一版把 X 列写成 `c*x + s*y`，在 `t` 的基正好是单位阵时与正确答案同值，只有原点分量把差异暴露出来 —— 「对称输入下巧合对上」是这类式子的典型陷阱，用例里要保持非对称数值。`var_to_bytes` 型码 11、六个 float32 共 28 字节，`var_to_str` 是六数式。没量的 `interpolate_with` / `xform` / `basis_xform` / `affine_xform` / `get_origin` 与四参 `(角度, 位置, 缩放)` 形一律响亮拒。

**批次三收尾（`Basis` 已落地，语料 `458-basis-face` 十七格逐字节）**：把上面「还没读到」的四项各自补到了能定式子的格数 ——
`get_scale()` = 列长 × `sign(determinant())`（shear 那支给 `(-3.741657, -8.774964, -14.59452)`，单位阵给 `(1.0, 1.0, 1.0)`）；
`Basis * float` 只有右乘那一侧（`b * 2.0` 与 `b * 2` 同值，三列一起放缩；`2.0 * b` 是解析期错，见上）；
`rotated(axis, angle)` 用同一支再转一次的复合格定死了「整体左乘 `from_axis_angle`」；
`is_conformal` 存在（shear 支 false、两支旋转基 true），但**没实现**：引擎那一格靠 epsilon 容差，`(0.1,0.2,0.3,0.4)` 那支的点积是 2e-8 量级仍判 true，strict 规则会在这一格静默错 —— 容差公式没读数，一律响亮拒。
两处式子不是「看着对」而是被读数钉住的：`inverse()` 用余子式乘 `r(1/det)` 而**不是**除法（`4 / -3` 与 `4 * r(-0.33333334)` 差一个 ulp，读数 `-1.3333334` 只认后者）；
`var_to_bytes` 与 `var_to_str` 与 `hash()` 三处都是**行主序** `(x0,y0,z0, x1,y1,z1, x2,y2,z2)`，`hash` 第一版按列序写就撞上 `k14` 那一格（引擎 `1562345701`，列序得 `3090056357`）。
轴角两支（构造式与 `rotated`）只量过**单位轴**：非归一化轴引擎发 `ERROR: The axis … must be normalized.` 并回单位阵，那条形我们没建模，改抛 `basis-axis-normalized`。
`Basis()` 的九数写法引擎构造式**不收**（`No constructor of "Basis" matches the signature "Basis(float × 9)"`），只有 `var_to_str` 认 —— 所以 `basisNew` 的元数表是 0/1/2/3，九数路径单独只走 `str_to_var`。
仍响亮拒：`get_euler`（三个 order 的分支与象限没量）、`scaled`、`slerp`、`looking_at`、`orthonormalized`、与 `null` 之外的异型 `==` 配对。

**`Basis` 的第一轮读数（`tmp/r2/b.sh`，一支一脚本防解析期连坐）**：typeof 17；打印 `[X: (1.0, 2.0, 3.0), Y: …, Z: …]`（列即构造实参）；成员 `x` / `y` / `z`；`determinant()` 在列 (1,2,3)/(4,5,6)/(7,8,10) 上是 `-3.0`；`transposed()` 给 `[X: (1.0,4.0,7.0), Y: (2.0,5.0,8.0), Z: (3.0,6.0,10.0)]`；`inverse() * b` 回到单位；`q * Vector3(1,2,3) = (3.0, 2.0, -1.0)`（即 `x*v.x + y*v.y + z*v.z`）；`Basis(Quaternion)` 与 `Basis(Vector3 轴, float 角)` 两支都在，后者给 `X: (0.877583, 0.0, -0.479426), Z: (0.479426, 0.0, 0.877583)`；`get_euler()` 存在（90° 那支给 `(0.0, 1.570796, 0.0)`）；`rotated(axis, angle)` 存在且有一格数；`var_to_bytes` 型码 17、40 字节往返成立；`2.0 * Basis` 是解析期错（`Invalid operands "float" and "Basis" for "*" operator.`），`orthonormalize()` 不存在。这一轮缺的 `get_scale` / `is_conformal` / `Basis * float` 合法侧 / `rotated` 复合式，都在上面收尾那一轮补到了格数。

**分批（按依赖序，不是一次七支）**：

1. `Rect2` + `Rect2i` —— 只依赖已实现的 `Vector2` / `Vector2i`。
2. `Plane` + `Quaternion` + `AABB` —— 依赖已实现的 `Vector3`。
3. `Basis` + `Transform2D` —— `Basis` 依赖 `Quaternion` 与轴向量，`Transform2D` 依赖 `Vector2` 和自己的列。

每批独立可回滚，每批一份实测清单（下列格子**一支都不能少**，缺哪格哪格继续抛）：构造式 arity 全形（含空构造、`from`/`to` 两形、与兄弟类型的互转）、静态名、成员面 + `get_argument_count`、`==` / `hash`、`str()` / `var_to_str` / `str_to_var` **三向往返**、`%v` 格式化、`var_to_bytes` / `bytes_to_var` 往返、`Array[T]` 元素盖章与 `is_same_typed`、字典键、`is` / `get_class`、六则运算符与比较对（op-pairs 双向）、类型违反的报错整句、`var x: T` 的默认值。

**Tag 取舍**：继续 `Tag.OBJECT` + `instanceof`，不给这七支新增 Tag。理由：八个 Tag 在全仓有硬编码分支面（`tagName`、`typeOf`、`valueTypeName`、`keyOf` 前缀、`var_to_str`），新增 Tag 会牵动 `typeof` / `hash` / 字典键三条**已实测**的等式；而 `Vector2` / `Color` 已经证明 OBJECT+instanceof 这条路在这三面上逐字节对得上 golden。代价要写清楚：装箱轨上每多一个值类型，判定链就多一串 `instanceof`，热面（`values/core.ts` 相等与打印、`ops.ts` 运算符）会变长 —— 所以**每批都要出 `bench:ab` 配对读数**，|t|≥2 才算收益，读不出就按"无回归"记录，不许凭单次运行下结论。

**判据**：这批动的是**语义增量**，字节门只对存量敏感（见「门序」）；新增用例走 `pnpm test:golden` 建新基线；`emit-surface` / `emit-contract` 必须绿（新名要么进名表要么不发）；**本阶段是预算最紧的一支** —— 落点里 `values/core.ts`、`lower/lower.ts`、`checks/collections.ts`、`packed.ts` 四份都顶格，`runtime/index.ts` / `methods.ts` / `builtins.ts` 三扇门面也要加新类文件的再导出（且新增模块必须仍被 `module-reach` 从入口走到、被 `test:pkgmodes` 打进 bundle），所以**每批开工前先确认阶段零换出的余量够这一批用**，不够就回到阶段零再切一刀，不许临时把登记封顶改大（棘轮只降不升，改大要单独一笔并说明理由）。

### 阶段三 —— 宿主与引擎 API + 对象生命周期

按依赖拆四步，每步都要先出实测再做实现：

1. **实例 id 与打印的可比性（前置，最先做）**：**本轮复核纠正了这条的说法** —— `tools/lib.mjs` 的 `normalize` 已经掩 `<Class#号>` 这一形（`:137` 的 `/<([A-Za-z_]\w*)#-?\d+>/g`），所以带类名的对象打印早就可比；**真正缺的是裸数字那一形**（`print(node.get_instance_id())` 直接吐一个 int，掩它会把合法数据一起吃掉），以及 `Callable` 的字典键 `q:<id>:<name>:<boundTag>` 只在运行时内部、不进打印。所以这一步的活是：定一个「用例必须用标记位打印 id」的 harness 约定（例如只允许 `print("id|", ...)` 包一层再归一），而不是再写一个掩码正则。`identity.ts` 的 `LIVE` 强引用不清除仍然是这一步的第二半（D7）。
   - **本轮已落的部分**：`normalize` 又补了 `@Class@号` 与 `_Class_号` 两条（引擎在 `add_child` 重名与 `duplicate()` 两处分给节点这两个形的自动名，号是进程内的 —— 见下面的第一轮取证）。裸 `get_instance_id()` 那一形**仍未解决**：它周围没有任何标记，掩它会连合法数字一起吃掉，所以还等那条「用例侧包一层」的约定。
2. **对象生命周期与确定性释放（D7）**：`identity.ts` 的 `LIVE` 强引用 map 要换成可释放登记；`object.ts:109 signal-flag-deferred`（`CONNECT_DEFERRED`）与 `call_deferred` 一族在这里解禁。差异牵连五处等式面（打印、`is_instance_valid`、容器键、Callable 的等式、`hash`），见待拍板 9。**释放机制别顺手选 JS 的反射式方案**：`WeakRef` + `FinalizationRegistry` 看似最省事，但回收时机由 GC 决定、跨进程不确定的行为**测不出可复现的 golden**，违反红线 1「没测过的不许写进实现」；scriptc 静态轨对它的支持也未知。三条候选（γ 先响亮拒 / 引用计数照 Godot 的 `RefCounted` 语义自己实现 / WeakRef 交给 GC）里**建议 γ**：这一格继续抛 `UnsupportedError`，把「引用计数何时归零」作为单独一批实测读数（拿真 Godot 的 `is_instance_valid()` 时序量），量出来再落地。
3. **节点树与通知**：新增 `runtime/node.ts`（children、`add_child` / `remove_child` / `get_node(path)` / `free` / `queue_free`），今天这些名字全落 `method/object.ts:374 object-method`。通知派发**必须走发射期静态表**，复用 `emit/class.ts:200-222` 的 `__gdDispatch` 机制；`_ready` / `_process` 的覆写形状守 `src/host.ts:111` 那条实测教训（非 async 签名 + 返回 Promise）。基类集合改为探头派生的父子链，替换 `project.ts:17-20` 手抄名单，并解开它与 `surface.ts:223` / `project.ts:15` 的三集合冲突（补测试，今天零覆盖）。
   - **已落的那一半（`runtime/node.ts` + `runtime/method/node.ts`，语料 `459-node-tree-face` 十二格逐字节）**：`Node.new()` / `Node2D.new()` / `RefCounted.new()` / `Object.new()` 走实测的**无实参**那一形（其余引擎类仍发 `native-class-member`）；`name` 读写、`add_child`（含重名与无名时在**进树那一刻**生成 `@类名@号`）、`remove_child`、`move_child`、`get_child(数)`、`get_child_count`、`get_children`、`get_parent`、`get_index`（无父给 `-1`）、`get_node(String)`、`get_node_or_null`、`has_node`、`is_inside_tree`（`--script` 宿主里恒为 false，与引擎同形）、`free()`（**级联子树**并从父上摘下）、`get_class()`、`set_name` / `get_name`、打印 `名字:<类名#号>`、字典键与 `==` 沿用对象那一套；`is_instance_valid` 现在认得出已 free 的实例（`nativeBaseOf` 也一并读得到裸实例的原生基类，`get_class()` 因此不用再开一条面）。
   - **仍响亮拒**：`queue_free`（要帧）、`duplicate`（子树复制没量）、`find_child`（多支时的次序没量）、`get_path` / `get_tree`（引擎在这一格里发 ERROR 再回空，那条 ERROR 的形状还没进运行时）、把 `name` 写成空串、`add_child` 自己或已有父亲的节点（引擎发 ERROR 并什么都不做）、`get_child` 越界与 `get_node` 走不通的路径（同上）、`Node2D` 的 `position` / `visible` 等子类成员、`extends Node` 一族（要等通知派发与主场景两格）。名字清洗只量过 `: . @ /` → `_`（空格与 `-` 保留），其余字符是**没量过的形状**。

**场景路线通了（甲路线，语料 `460-scene-notifications`）**：`tools/lib.mjs` 多了第三格夹具 `caseScene(id)`（用例目录里有 `main.tscn` 时，引擎侧走 `--headless --path <case>` 的主场景、**不发 `--script`**），`compileProject` 多一个 `sceneFile` 输入，`parse/scene.ts` 只在**编译期**读 `.tscn`，把树展成 `rt.sceneNode(...)` 的静态建树代码，入口尾部由 `await __gd_entry.run()` 换成 `await sceneRun(...)` —— 产物树与 `TREE_FACE` 一字未动，符合硬约束 2。实测钉住的几格：
`_init` 在挂树之前跑（`name` 空、`get_child_count()` 0）；`_enter_tree` 前序（父先于子，且此时兄弟与孩子都已就位：Root 看到 2、C1 看到 1）；`_ready` 后序（叶子先）；`_process` 每帧前序；`quit()` **不收尾当前帧**（同帧里后面的节点照跑）；`_exit_tree` 后序（叶子 → 子 → 根）；`get_tree().get_root()` 是那个名为 `root` 的 Window，`current_scene` 就是场景根；路径 `/root/Root/C1/G1`。`extends Node` / `extends Node2D` 由 `BaseSpec` 的 `engine` 一支发出（`registerNativeBase` 记引擎基类，类体里补五个节点面字段），类体里的**裸名**引擎方法调用走 `semantics/node-face.ts` 那张实测表，翻成 `rt.method(this, "…", [...])`。

一条把用例写法直接改掉读数：**`get_tree().get_frame()` 在引擎侧不可比** —— 同一支用例，场景根的第二次实测第一次 `_process` 时报 2、重跑报 1（进场景前走过几拍取决于进程时序）。所以用例自己要数拍子（`_tick += 1`），别把 `get_frame()` 打进 golden。也因此 `sceneRun` 的 `frame` 从 0 起算只是我们自己的计数。

- **基类登记改实测派生**：`extends Node` / `Node2D` 之外的一切引擎类名，答复来自 `ENGINE_CLASS_NAMES`（ClassDB 全量表）而不是手抄名单，所以 `extends Sprite2D` 现在发 `engine-base` 而不再掉进 `extends-unknown`；名单删掉的那 12 个名字不再参与判定。

**场景这一格仍响亮拒**：类体里**裸属性**读引擎成员（`print(name)` 这类 —— 分析期按「没声明」拦下，得写 `get_name()`；self 属性面还没实测）、`Node` / `Node2D` 之外的场景节点类型、`instance=` / `groups=` / `sub_resource` / 除 `script=` 之外的节点属性、`ext_resource` 的非 Script 类型、场景根不带脚本、一工程多场景、`SceneTree.create_timer` / `call_group` / `get_nodes_in_group`。
   - **已落**：场景模式的主循环（`sceneRun` 的帧环 + `quit(code)` 把 code 写进 `process.exitCode`），`--script` 那条入口一字未动，所以那 18 例超时形状不受影响。
4. **主循环与退出形状**：`emit/index.ts` 尾部写死 `await new Main().run()`，`src/host.ts:145 run(maxFrames=3000)` 是 `setTimeout` 自制循环。接真 `SceneTree` 要先拍：谁持有主循环、`quit(code)` 的退出码语义、以及那 18 例带 `<<GDS2JS_TIMEOUT>>` 的**退出形状**（引擎侧入口被作废后走不到 `quit()`、永不退出，我们的宿主自己收尾退 0）。这不是"改改就行"：`test/e2e/corpus-hang.test.ts:38-44` 要求**产物也被 SIGTERM 杀掉、且杀之前输出逐字节相等**，所以要连 `tools/lib.mjs` 的超时预算（`DEFAULT_TIMEOUT_MS`、`hangBudget`）与标记追加逻辑一起复核。
   - **这一支的门会随语义进步而变红，红了不许删断言**：`corpus-hang` 的用例清单是从 golden 里含 `<<GDS2JS_TIMEOUT>>` 的页**算出来的**（`:12-24`），所以宿主一旦让这批页真能走到 `quit()`、正常退 0，清单就掉成空集，`:26` 的顶层 `toBeGreaterThan(0)` 立刻红。这是有意的哨兵（防止门静默失效变成摆设），正确处置是**把这批用例从超时族正式划走**（重生成不带标记的 golden + 同一笔里调整本门的判据或适用范围），而不是把 `:26` 删了事。18 这个数当前由盘面实测确认。

**阶段三 第一轮取证（`tmp/t3/n1..n3.gd` 走 `--script`，`tmp/t3/scene/` 走主场景）**：

- **`--script` 宿主不是一棵活的树**：`root.add_child(x)` 之后 `x.is_inside_tree()` 仍 **false**，`get_path()` 空串并落 `ERROR: Cannot get path of node as it is not in a scene tree.`，`_enter_tree` / `_ready` **一支都不发**，`get_tree()` 返回 null（另发 `ERROR: Parameter "data.tree" is null.`）。所以通知次序与路径**在这条夹具路上取不到读数**，只能由甲路线（主场景）取 —— 这不是实现偷懒的理由，是取证的边界。
- **主场景路线验通了**：`tmp/t3/scene`（`project.godot` 写 `run/main_scene`，`main.tscn` 的非根节点段必须带 `parent="."` / `parent="Kid"`，Node 脚本里没有 `quit()`、要 `get_tree().quit(0)`）实测到 `_enter_tree` → `_ready` 的次序、`/root/Root` 与 `/root/Root/Kid` 两条路径、`is_inside_tree()` true、`get_child_count()` = 1、`get_node("Kid/..") == self` true、`str(get_children())` 打 `[Kid:<Node#号>]`。harness 要补的就是「用例带 `main.tscn` 时跑主场景、不发 `--script`」这一格。
- **掩号补了两形**（`tools/lib.mjs` 的 `normalize` 加 `@Class@号` 与 `_Class_号`）：重名 `add_child` 时引擎把后者改名 `@Node@1212`（**是加进树那一刻才生成的**，`Node.new()` 出来 `name` 是空串），`duplicate()` 给 `_Node_1212`；两形都带进程内的号，不掩就没法对账。
- **`root` 不是干净起点**：`--script` 下 `root.add_child(x)` 之后 `root.get_child_count()` 是 **2**、`x.get_index()` 是 **1**（root 本身已经挂着东西）。→ 节点用例一律自建子树做断言，不拿 root 的 children 计数当读数。
- **释放时序**：`free()` 之后 `is_instance_valid` 立刻 false；`queue_free()` 当帧仍 true（帧没走）、`is_queued_for_deletion()` 同理按帧；`remove_child(a)` 不动 `a` 自己的子树（`a.get_child_count()` 仍 1、`c.get_parent() == a` 仍 true）。这正是第 2 步 γ 要先量的那一格。
- **类型面**：`p is Node` true / `p is Node2D` false，`typeof(node)` = 24，`get_class()` 报**引擎基类**名（脚本子类也一样报基类），`has_method("add_child")` 与 `has_signal("ready")` true、`get_signal_list().size()` = 13。另有一句解析期诊断要记下：静态型是 `RefCounted` 的变量写 `rc is Node` 直接 **`Expression is of type "RefCounted" so it can't be of type "Node".`**，不是运行时 false。
- **打印形状**：无名 `<Node#号>`、有名 `alpha:<Node#号>`；`RefCounted.new()` 的号可为**负**（`<RefCounted#-9223371867656542708>`），现有 `<Class#-?\d+>` 那条规则已覆盖。

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
2. ~~**D4 措辞要不要跟着改**~~ **已执行**：ROADMAP 的 D4 与 `AGENTS.md` 概述都改成「Tier 1 范围内不实现；Tier 2 按本文分阶段解禁」，随阶段一第一笔一起落地。
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
