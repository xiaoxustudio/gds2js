# 运行时 API 契约（v1 · 签名冻结）

> 本文件是 **runtime 与 emitter 之间唯一的契约**。
> **签名冻结**：改这里等于 emitter 全量重写。要改就升版本并在顶部记变更。
>
> 每条语义都标注 `docs/SEMANTICS.md` 里的依据编号（均为 Godot 4.6.3 实测）。
> 没依据的行为一律不准写进实现 —— 抛 `UnsupportedError`。

---

## 0. 总约定

| 项 | 值 |
| --- | --- |
| 契约版本 | v1 |
| 裁判版本 | Godot 4.6.3.stable.official.7d41c59c4 |
| 范围 | **Tier 1 纯语言**。引擎 API（`Node` / `SceneTree` …）不在本契约内 |
| 错误处理 | 不支持一律抛 `UnsupportedError`，**绝不静默降级**（D4 + 项目红线） |
| 产物 import 形式 | `import * as rt from "gds2js/runtime"` |
| 覆盖面 | 本契约**只登记需要跨层冻结形状的那一层**（`ops.*` / `fast.*` / 容器 / String / 对象类 / 信号）；发射器实际用到的全量面以 `rt` 的导出表为准，由 `test/repo/emit-surface.test.ts` 逐名对账 —— 产物里每个 `rt.<名>(` 与 `rt.ops.<名>(` / `rt.fast.<名>(` / `rt.V.<名>(` 都必须在导出表上，名字对不上就是门红 |

---

## 1. 值的表示（D1）

```ts
export const enum Tag { NIL, BOOL, INT, FLOAT, STRING, ARRAY, DICT, OBJECT }

export interface Variant { t: Tag; v: unknown }
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

产物顶层的收口（发射器的 autoRun 尾巴调，口径见 SEMANTICS S200）：

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
| `ops.str(a): Variant(STRING)` | 转字符串，int/float 输出不同 | S7 |
| `ops.key(a): string` | Dictionary 键编码，**必须区分 int / float / string** | S14 |

---

## 4. `fast.*`（单态快路径 · D2 双轨）

emitter 在**编译期能确定类型**时直接发这些，输入输出都是**裸 JS 值**（不装箱）。
这是 D2 的"快路径"那一轨；`ops.*` 是"动态"那一轨。

| 签名 | 对应场景 | 依据 |
| --- | --- | --- |
| `fast.iDiv(a: number, b: number): number` | int / int → **`Math.trunc(a / b)`**，向零截断 | S1 |
| `fast.fDiv(a: number, b: number): number` | 含 float → `a / b` | S2 |
| `fast.iMod(a: number, b: number): number` | `a % b`（与 Godot 一致） | S3 |
| `fast.iPow(a: number, b: number): number` | `Math.pow(a, b)` | S4 |
| `fast.fPow(a: number, b: number): number` | `Math.pow(a, b)` | S4 |
| `fast.iAdd / iSub / iMul(a, b): number` | 整数加减乘 | |
| `fast.fAdd / fSub / fMul(a, b): number` | 浮点加减乘 | |
| `fast.sConcat(a: string, b: string): string` | 字符串连接 | S13 |
| `fast.strInt(n: number): string` | `String(n)` —— **不带 `.0`** | S7 |
| `fast.strFloat(n: number): string` | Godot 浮点格式：14 位有效数字、去尾随零、**至少保留一位小数**（`1.0` → `"1.0"`） | S7 |
| `fast.truthyInt(n): boolean` | `n !== 0` | S12 |
| `fast.truthyStr(s): boolean` | `s !== ""` | S12 |
| `fast.truthyArr(a): boolean` | `a.length !== 0` —— **空数组 false** | S12 |
| `fast.truthyDict(d): boolean` | `d.size() !== 0` —— **空字典 false** | S12 |
| `fast.eqDeep(a, b): boolean` | 深度比较 | S10 |
| `fast.eqNum(a, b): boolean` | 数值比较（跨 int/float） | S11 |

> `fast.*` 是可选的。emitter 不做类型推断也能工作（全走 `ops.*`），只是慢。
> 所以 P2 可以先只实现 `ops.*`，`fast.*` 留到性能阶段补 —— **但签名现在就定死**。

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

```ts
export class GString {
  length(): number             // 码点数
  at(i: number): string        // 按码点取，返回长度 1 的字符串
  substr(from: number, len: number): string
  toUpper(): string
  format(args: Variant[]): string   // "%d/%s" % [...]
}
```

字符串上另外三条纯函数（`packages/runtime/src/runtime/values.ts`，口径全部实测于 4.6.3，见 SEMANTICS S199）：

```ts
// 左起、不重叠；what 为空串整串原样返回。insensitive 对应 Godot 的 replacen。
strReplace(hay: string, what: string, by: string, insensitive?: boolean): string
// from 为负按 B = len - m + 1 + from 折回；空 needle 恒 -1；last=true 走 rfind 那条额外的 from <= len - m 检查。
strFind(hay: string, needle: string, from: number, last: boolean, insensitive?: boolean): number
// 依赖 case-flags.ts 的实测码点分类表（pnpm regen:case-flags）。
strCapitalize(s: string): string
```

浮点的 `nan` / `inf` / `-inf` 输出也走这一层（`017`）。

`%` 那一族的另一颗入口（`packages/runtime/src/runtime/methods.ts`）：左支是 **String 字面量**时发射器不走 `ops.mod`，直发这一颗。

```ts
// soft 与 ops.mod 第三个参数同一个旗标：发射器按两侧静态型定（true = 非致命那块，false = SCRIPT ERROR 并作废旧那支）。
formatOf(fmt: Variant, args: Variant, soft: boolean): Variant   // S696 / S491 / S697
```

---

## 7. 对象与类

```ts
export class GObject {
  readonly klass: GClass
  is(klass: GClass): boolean
  get(name: string): Variant
  set(name: string, v: Variant): void
  call(name: string, args: Variant[]): Variant
}
```

- 类注册表由 emitter 生成的模块级代码填充
- `is` 走继承链（`021`）
- 属性 setter/getter 按测清语义（SEMANTICS S152 / S156）：读只走 get、写只走 set、只有 getter 时写是静默无操作

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

## 9. 未决项（实现前必须先补测，见 SEMANTICS §6）

1. setter/getter 触发时机
2. `super()` 与构造顺序
3. Packed\*Array 语义
4. 静态类型违反是编译错还是运行时错
5. `match` 的字典模式 / `when` guard
6. `Callable` / `call_deferred`
7. `StringName`（`&"foo"`）
8. 浮点格式化的完整规则（尾随零、科学计数法阈值）—— 目前只知道 14 位有效数字

**这些未测项在实现里一律抛 `UnsupportedError`，不准猜。**

---

## 变更记录

| 版本 | 日期 | 变更 |
| --- | --- | --- |
| v1 | 2026-09-23 | 首版。基于 Godot 4.6.3 实测语义，D1/D2/D3/D4 已拍板 |
| v1（补记） | 2026-10-25 | §3 的 `ops.mod` 第三位 `soft` 旗标与 §6 的 `formatOf` 补登记 —— 两颗都是 S696 / S697 那两笔已经在用的发射面，这里只是把契约文字对齐实现，签名集合没缩也没涨 |
| v1（补记 2） | 2026-10-25 | §0 补「覆盖面」一行，把口径写死：本契约只覆盖跨层冻结的形状，全量发射面以 `rt` 的导出表为准，并由 `test/repo/emit-surface.test.ts` 逐名自动对账。契约文字变宽，签名集合没动 |
