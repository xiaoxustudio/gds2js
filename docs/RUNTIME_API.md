# 运行时 API 契约（v1 · 签名冻结）

> 本文件是 **runtime 与 emitter 之间唯一的契约**。
> **签名冻结**：改这里等于 emitter 全量重写。要改就升版本并在顶部记变更。
>
> 每条语义都带一个 Godot 4.6.3 实测的依据编号（`S###`）；编号台账原文在 `docs/SEMANTICS.md`，2026-10-26 已归档到 git 历史（`git show fa46a87:docs/SEMANTICS.md`），判定以 `corpus/` 的 golden 逐字节为准。
> 没依据的行为一律不准写进实现 —— 抛 `UnsupportedError`。

---

## 0. 总约定

| 项 | 值 |
| --- | --- |
| 契约版本 | v1 |
| 裁判版本 | Godot 4.6.3.stable.official.7d41c59c4 |
| 范围 | **Tier 1 纯语言 + Tier 2 的引擎值与宿主入口**。Tier 2 只复用本契约里已冻结的那几个形状（`rt.method` / `rt.attribute` / `rt.writeProp` / `rt.index` 的接收者面 + `rt.V.object` 的引擎类值），新增的都是站内的分支而不是新签名：引擎类实例走 `rt.engineClassNew`，场景建树走 `rt.sceneNode` 与 host 的 `sceneRun`，成员面按发射期那张实测表（`compiler/src/semantics/node-face.ts`）解析；因此 v1 的签名一个都没动，`emit-surface` / `emit-contract` 两道门仍是全量名表的对账依据。没量过的形状照旧抛 `UnsupportedError` |
| 错误处理 | 不支持一律抛 `UnsupportedError`，**绝不静默降级**（D4 + 项目红线） |
| 产物 import 形式 | `import * as rt from "gds2js/runtime"` |
| 覆盖面 | 本契约**只登记需要跨层冻结形状的那一层**（`ops.*` / `fast.*` / 容器 / String / 对象类 / 信号）；发射器实际用到的全量面有两道机器门：**源侧** `emit/surface.ts` 的名表用 `satisfies readonly RtName[]` 钉在 `keyof typeof rt` 上（拼错或 runtime 改名 → `pnpm typecheck` 直接红），**产物侧** `test/repo/emit-surface.test.ts` 逐名对账（产物里每个 `rt.<名>(` 与 `rt.ops.<名>(` / `rt.fast.<名>(` / `rt.V.<名>(` 都必须在导出表上）。`test/repo/emit-contract.test.ts` 再双向锁：emitter 源码 ⊆ 名表 ⊆ runtime 导出，且不得超出产物实际用量 |

---

## 1. 值的表示（D1）

```ts
```ts
export const Tag = {
  NIL: 0, BOOL: 1, INT: 2, FLOAT: 3,
  STRING: 4, ARRAY: 5, DICT: 6, OBJECT: 7,
  STRING_NAME: 8,          // `&"foo"`：与 STRING 同族不同标签，`str()` / `==` / 打印都另有形
} as const;

export type TagValue = (typeof Tag)[keyof typeof Tag];
export interface Variant { t: TagValue; v: unknown }
```
```

**四条规则（emitter 必须遵守）**

| # | 规则 | 说明 |
| --- | --- | --- |
| R1 | 静态已知 `int` → **裸 JS number** | emitter 保证只对它用 int 语义的 op |
| R2 | 静态已知 `float` → **裸 JS number** | emitter 保证只对它用 float 语义的 op |
| R3 | 推断不出（`Variant` / 无注解 / 动态调用返回值）→ **`Variant` 装箱** | |
| R4 | `Variant` 参与的运算一律走 `ops.*` | |

> 为什么必须有标签：`str(1) == "1"` 但 `str(1.0) == "1.0"`（S7）。
> 裸 Number 无法区分二者，所以「全部映射成 JS 原生类型」这条路从根上不成立。
> 静态类型已知时不需要标签，是因为 emitter 在发射点就知道该用哪个 op。

**int64 边界（D1）**：int 用 JS number 承载，安全范围为 ±2^53。
超出范围或需要回绕语义时：

```ts
throw new UnsupportedError("int64-out-of-range", "整数超出 2^53，需 BigInt 路径（未实现）")
```

**不做**静默降级 —— 宁可响，不能悄悄算错（S5）。

---

## 2. 错误

```ts
export class UnsupportedError extends Error {
  constructor(public code: string, message: string)
}
export class GodotRuntimeError extends Error {
  constructor(public code: string, message: string)
}
```

- `UnsupportedError` —— 我们不支持。缺功能，用户看得见。
- `GodotRuntimeError` —— Godot 也会在运行时炸的情况（如整数除零，S27）。

产物顶层的收口（发射器的 autoRun 尾巴调，口径见归档台账 S200）：

```ts
export function errOf(e: unknown): string                 // `[code] message` / `message`
export const RUN_OWNER_ENV = "GDS2JS_RUN_OWNER";          // 外层声明「归我报」的通道（process.env）
export function claimRunReporting(): string | undefined   // 同进程宿主声明，值 in-process
export function claimRunReportingInChild(): string | undefined // 隔进程宿主声明，值 child
export function releaseRunReporting(prev: string | undefined): void
export function reportRunFailure(e: unknown): void        // in-process → 再抛；child → 只置退出码；都没声明 → 印一句 runtime error
```

---

## 3. `ops.*`（动态路径）

输入输出**均为 `Variant`**（R3 的值）。这一层是"语义正确"的兜底，性能其次。

### 算术

| 签名 | 语义 | 依据 |
| --- | --- | --- |
| `ops.add(a, b): Variant` | int+int→int；含 float→float；String 连接；Array 拼接；Vector2 分量加 | S13 |
| `ops.sub(a, b): Variant` | 同 add 的数值规则 | |
| `ops.mul(a, b): Variant` | 同上 | |
| `ops.div(a, b): Variant` | **两个操作数都是 INT 才走整数除法（向零截断）**，否则浮点除法 | S1 / S2 |
| `ops.mod(a, b, soft): Variant` | 数值取模看两侧型；左支是 `String` / `StringName` 时是格式化那一族，`soft` 是发射器按**两侧静态型**定的形状旗标（true = 失败推一块非致命 ERROR 回原格式串，false = 失败抛 SCRIPT ERROR 作废当前那支函数，S696） | S3 / S491 / S696 |
| `ops.pow(a, b): Variant` | **左结合**（`2**3**2 == 64`），由 emitter 加括号保证 | S4 |
| `ops.neg(a): Variant` | 数值取负 | |

### 比较与真值

| 签名 | 语义 | 依据 |
| --- | --- | --- |
| `ops.eq(a, b): Variant(BOOL)` | **深度比较**；跨 int/float 数值相等为 true | S10 / S11 |
| `ops.neq(a, b): Variant(BOOL)` | `!eq` | |
| `ops.lt / lte / gt / gte(a, b): Variant(BOOL)` | 数值比较，跨 int/float 归一 | |
| `ops.truthy(a): boolean` | **`[]` `{}` `0` `0.0` `""` 全为 false** —— 与 JS 相反 | S12 |

> S12 是高频静默错误源：`if []` 在 Godot 走 else，在 JS 走 then。

### 位运算

| 签名 | 语义 | 依据 |
| --- | --- | --- |
| `ops.band / bor / bxor(a, b): Variant` | int64 位运算。操作数必须在 int 安全范围内 | S24 |
| `ops.bnot(a): Variant` | 按位取反 | |
| `ops.shl / shr(a, b): Variant` | 左移/右移。Godot 编译期就拒绝负操作数，emitter 同样要拦 | S24 |

### 其他

| 签名 | 语义 | 依据 |
| --- | --- | --- |
| `ops.inOp(a, b): Variant(BOOL)` | `a in b`：Array 查元素 / String 查子串 / Dict 查键 | `019` |
| `ops.truthy(a): Variant(BOOL)` | 真值判定：`0` / `""` / 空数组 / 空字典为假（**没有** `truthyInt` / `truthyStr` 这种分型 —— 那是 §4 那一代的设想，实际只有这一颗） | S12 |

转字符串与 Dictionary 键编码**不在 `ops.*` 面上**：前者是内建函数 `str()`（发射面上的 `rt.str`，走 `values/` 那族），后者是 `keyOf`（`values/core.ts`，同样不是 `ops` 成员）。文档早先写的 `ops.str` / `ops.key` 两颗名字从来没有导出过，emitter 也不发它们。

---

## 4. `fast.*`（单态快路径 · D2 双轨）

emitter 在**编译期能确定类型**时直接发这些，输入输出都是**裸 JS 值**（不装箱）。
这是 D2 的"快路径"那一轨；`ops.*` 是"动态"那一轨。

**名表不在这份文档里列** —— 早先这里是一张手写的 `fast.iDiv / fDiv / iPow / sConcat / strInt / truthyInt / eqDeep …` 表，和真实导出面**一个名字都对不上**，而且只要漂移就没人会发现（它是第二份清单）。真源只有一个：`packages/compiler/src/emit/surface.ts` 里的四个常量 `RT_NAMES` / `FAST_NAMES` / `OPS_NAMES` / `V_NAMES`，每个都用 `satisfies readonly RtName[]` 钉在 runtime 的真实导出面上 —— **拼错名字或 runtime 改名，`pnpm typecheck` 直接红**。产物侧另有 `test/repo/emit-surface.test.ts` 逐名对账，`test/repo/emit-contract.test.ts` 双向锁（emitter 源码 ⊆ 名表 ⊆ runtime 导出，且不得超出产物实际用量）。

今天 `fast.*` 这一轨实际分成三族，语义各不相同：

| 族 | 形状 | 为什么单独一族 |
| --- | --- | --- |
| `iAddC / iSubC / iMulC / iDivC / iModC` | 带**检查**的整数五则（`C` = checked）：安全整数内走裸 Number，越界响亮抛错而不是静默回绕 | D1 的"越界必须响"要求发射点带边界检查，不能是裸 `+ - * /` |
| `rawArrGetNum / rawArrSetStr / rawArrInsertNum / rawArrPushFrontNum / rawArrRemoveAtNum / rawArrClearStr / rawArrGetNum2 …` | 定形 Array 槽位的裸读写（元素型静态已知时不走 `GArray` 装箱） | 快路径的收益主要在这里：容器逐元素装箱是当初最大的常数项 |
| `rawDictGet / rawDictGetOrNum` + `unboxNum / unboxStr` | 定形 Dictionary 取值，以及从 `Variant` 解回裸值 | 解箱只在发射点静态已型时才发 |

`fast.*` 是**可选加速轨**：不做类型推断也能工作（全走 `ops.*`），只是慢。这一轨已经落地（不是"留给性能阶段"），要扩面必须先有 `bench:ab` 配对收益（`AGENTS.md` 红线 5）。

---

## 5. 容器

```ts
export class GArray {
  size(): number
  get(i: number): Variant
  set(i: number, v: Variant): void
  append(v: Variant): void
  duplicate(): GArray          // 深拷贝
  eq(other: GArray): boolean   // 深度比较
  sort(): void
  has(v: Variant): boolean
  concat(other: GArray): GArray
}
```

- **赋值是共享引用**（不是拷贝），`duplicate()` 才深拷贝 → S9
- **`==` 是深度比较** → S10

```ts
export class GDict {
  size(): number
  get(k: Variant): Variant
  set(k: Variant, v: Variant): void
  has(k: Variant): boolean
  keys(): Variant[]            // 保持插入顺序
  eq(other: GDict): boolean
  duplicate(): GDict
}
```

**键编码（关键）**：`1`（int）、`1.0`（float）、`"1"`（String）在 Godot 里是**三个不同的键**（S14）。
JS `Map` 会把 `1` 和 `1.0` 合并，所以键必须经 `ops.key(v)` 编码成带类型前缀的字符串，例如：

```
ops.key(V.int(1))    -> "i:1"
ops.key(V.float(1))  -> "f:1"
ops.key(V.str("1"))  -> "s:1"
```

---

## 6. String

GDScript String 是 **UTF-32**，`length()` 数的是**码点**，索引也按码点（S26）。
JS 是 UTF-16，所以不能直接复用 `String.length` / `[i]`。

**没有 `GString` 这个类**（早期草案写过，从未落地）。运行时里 GDScript 的 String 就是**裸 JS 字符串**装在 `Variant`（`Tag.STRING`）或 `StringName`（`Tag.STRING_NAME`）里，码点语义全部由 `packages/runtime/src/runtime/string-ops.ts` 的一组**函数**提供 —— 因为 UTF-32 索引/长度在 JS 侧必须是显式操作，做成一个包装类只会把每个内建函数的装箱成本加一遍：

```ts
strLength(s: string): number            // 码点数，不是 s.length
strAt(s: string, i: number): Variant    // 按码点取，越界走实测那句报错
strSubstr(s: string, from: number, len: number): Variant
strCase(s: string, upper: boolean): string   // to_upper / to_lower，走 case-flags.ts 的实测分类表
codepoints(s: string): number[]         // UTF-32 视图，索引族共用它
```

字符串上另外三条纯函数（`packages/runtime/src/runtime/string-ops.ts`，口径全部实测于 4.6.3，见归档台账 S199）：

```ts
// 左起、不重叠；what 为空串整串原样返回。insensitive 对应 Godot 的 replacen。
strReplace(hay: string, what: string, by: string, insensitive?: boolean): string
// from 为负按 B = len - m + 1 + from 折回；空 needle 恒 -1；last=true 走 rfind 那条额外的 from <= len - m 检查。
strFind(hay: string, needle: string, from: number, last: boolean, insensitive?: boolean): number
// 依赖 case-flags.ts 的实测码点分类表（pnpm regen:case-flags）。
strCapitalize(s: string): string
```

浮点的 `nan` / `inf` / `-inf` 输出也走这一层（`017`）。

`%` 那一族的另一颗入口（`packages/runtime/src/runtime/method/access.ts`）：左支是 **String 字面量**时发射器不走 `ops.mod`，直发这一颗。

```ts
// soft 与 ops.mod 第三个参数同一个旗标：发射器按两侧静态型定（true = 非致命那块，false = SCRIPT ERROR 并作废旧那支）。
formatOf(fmt: Variant, args: Variant, soft: boolean): Variant   // S696 / S491 / S697
```

---

## 7. 对象与类

**没有 `GObject` / `GClass` 这两个类**（早期草案）。脚本类实例的真实形状是 `packages/runtime/src/object.ts` 里的一对：

```ts
export class GdScriptObject {          // 脚本类实例的宿主侧基类
  gdObjectId: number                   // 进程内自增号（语料一律掩号再比）
  __gdDispatch(name: string, args: Variant[]): Variant | null   // 方法表，产物覆写它
}
export interface ClassDesc {           // 一个脚本类的登记表：由 emitter 在模块级填
  base: string | null; make: () => GdScriptObject; check: (v: Variant) => boolean;
  nativeBase: string; methodArities: ...; ctorArities: ...; methodParams: ...;
  staticVars / scriptProps / fieldTypes / dict 族 ...
}
```

- `is` / `get_class` / `has_method` 沿 `ClassDesc.base` 链走（`021`）；今天**只有脚本类**在这套表里，引擎类当值另有专支（`native-class.ts`）—— 那一族的成员面是 Tier 2 阶段一（`docs/TIER2.md`）。
- 属性 setter/getter 按实测语义（归档 S152 / S156）：读只走 get、写只走 set、只有 getter 时写是静默无操作。
- 静态成员/静态变量走 `varSlotOf` / `staticCall` / `hasStaticName`，`call_deferred` 与 `CONNECT_DEFERRED` 仍响亮拒（等 Tier 2 的对象生命周期）。

---

## 8. 信号与 `await`（D3）

**结论：直接降级为 JS `async/await`。**

```ts
export class Signal {
  emit(...args: unknown[]): void
  connect(fn: (...args: unknown[]) => void): void
  then(resolve: (v: unknown) => void): void   // thenable，使 `await sig` 直接可用
}

export function awaitSignal(sig: Signal): Promise<unknown>
```

参数归一（S21）：

| 信号参数个数 | `await` 的结果 |
| --- | --- |
| 0 | `null` |
| 1 | 该值本身 |
| 2+ | `Array` |

emitter 规则：

| GDScript | 发射为 | 依据 |
| --- | --- | --- |
| 函数体含 `await` | `async function` | S18 |
| `await <Signal>` | `await sig`（Signal 已 thenable） | S19 / S21 |
| `await <非信号值>` | `await value`（JS 语义相同，可直译） | S22 |
| 调用协程却不加 `await` | **编译错误** | S18 / `026` |

---

## 9. 未决项（实现前必须先补测）

这一节以前列了八条（setter/getter 触发时机、`super()` 与构造顺序、Packed\*Array 语义、静态类型违反是编译错还是运行时错、`match` 的字典模式与 `when` guard、`Callable` / `call_deferred`、`StringName`、浮点格式化的完整规则）。**其中七条已经在 Tier 1 实测并实现**，留在"未决"清单里只会让人以为这些面还没做 —— 全部删掉。

真正还开着的只有两族，且都不在这一层：

1. **`call_deferred` / `CONNECT_DEFERRED` 的对象生命周期**（D7）：延后泵与局部 RefCounted 实例的确定性释放要连着做，牵连五处等式面。→ `docs/TIER2.md` 阶段三。
2. **引擎类值的成员面与实例化**（D4）：`X.new` 当值、`.call()` 造实例。→ `docs/TIER2.md` 阶段一 / 三。

**这些未测项在实现里一律抛 `UnsupportedError`，不准猜。**（`docs/ROADMAP.md` §0 的 D4 / D6 / D7 就是这条纪律的范围决定。）

---

## 变更记录

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| v1 | 2026-09-23 | 首版。基于 Godot 4.6.3 实测语义，D1/D2/D3/D4 已拍板 |
| v1（补记） | 2026-10-25 | §3 的 `ops.mod` 第三位 `soft` 旗标与 §6 的 `formatOf` 补登记 —— 两颗都是 S696 / S697 那两笔已经在用的发射面，这里只是把契约文字对齐实现，签名集合没缩也没涨 |
| v1（补记 2） | 2026-10-25 | §0 补「覆盖面」一行，把口径写死：本契约只覆盖跨层冻结的形状，全量发射面以 `rt` 的导出表为准，并由 `test/repo/emit-surface.test.ts` 逐名自动对账。契约文字变宽，签名集合没动 |
| v1（补记 3） | 2026-10-27 | **文档纠偏，签名集合一字未动**。§1 的 `Tag` 补回 `STRING_NAME` 并改成真实的对象常量写法；§3 删掉从未导出的 `ops.str` / `ops.key`，真值判定归位成一颗 `ops.truthy`；§4 手写的 `fast.*` 名单与真实导出面零交集，整表删除、改为指向 `surface.ts` 四个常量 + 三道门，并写清今天这一轨实际的三族形状；§6 的 `GString`、§7 的 `GObject` / `GClass` 都是从草案留下的不存在的类，改成实际落地的 `string-ops.ts` 函数族与 `GdScriptObject` + `ClassDesc`；§9 未决项从八条收敛到两条（其余七条 Tier 1 已实测并实现），两条都转 `docs/TIER2.md` |
