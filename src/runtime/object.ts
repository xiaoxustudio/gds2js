import { UnsupportedError } from "./errors";import { Tag, V, tagName, type Variant } from "./tags";
import { GArray, GDict } from "./values";
import { CallableBox, isNullCallable, type Fn } from "./callable";

// Callable 盒子的**形状**与等式在叶子模块 `callable.ts` 里（`values.ts` 要用等式，而不能反向 import 本模块）；
// 这里只把外需要的几样转出去。
export { CallableBox, callableSame, isCallable, isCallableBox, isNullCallable, nullCallable, type Fn } from "./callable";

/**
 * 所有脚本类的根（宿主 `SceneTree` 也挂在它下面）。存在的理由只有一条：
 * **运行时不能拿着 `unknown` 去按名字找方法** —— 实测 scriptc 里，动态值（`unknown` / `object`）
 * 只能 checked cast 成 JSON 可表示的类型，而 `Function.prototype.call` / `.apply` 对
 * 「rest 形参 + 动态接收者」这种签名也没有 lowering，`--dynamic` 岛同样救不了。
 * 于是「名字 → 方法」这张表由**知道具体类的发射器**生成成子类的 `__gdDispatch` 覆写
 * （里面 `this` 就是那个类，全程无 cast），运行时只做一次 `instanceof` 收窄（实测可编）。
 */
export class GdScriptObject {
  /** 命中给装箱值（调用方再 `wrapValue` 也无妨 —— `wrapValue` 对 Variant 原样返回）；没这个方法给 null。 */
  __gdDispatch(_name: string, _args: Variant[]): Variant | null {
    return null;
  }
}

/** lambda 的 Callable 盒子（`rt.callable((a) => {...}, 形参数)`，S193 / `tmp/f97` a2）。 */
export function callable(fn: Fn, arity: number | null = null): Variant {
  return V.object(new CallableBox(fn, null, null, [], arity));
}

/**
 * 方法 / 静态方法 Callable 的盒子：只记「在哪个对象上、叫什么」，调用时由 `method()` 按名派发。
 * 带上 name / obj 是为了 `get_method()`、`is_null()`、`is_valid()` 这几条实测过的谓词；
 * lambda 不走这里 —— 它的 `get_method()` 实测给 `<anonymous lambda>`（`tmp/f96` c04c）。
 */
export function methodCallable(obj: Variant, name: string): Variant {
  return V.object(new CallableBox(null, name, obj, [], null));
}

/** 发射器 / 内部要一个 lambda 盒子时的入口（形参数与 lambda 同形，`tmp/f97` a2）。 */
export function callableOf(fn: Fn, arity: number | null = null): Variant {
  return callable(fn, arity);
}

/** 声明的**必填**实参数 —— 旧实现读 `fn.length`（它只数到第一个带默认值的形参之前），
 * 而 `Function.length` 在静态编译目标上没有 lowering，所以两条路各自从盒子 / 方法表里拿同一个数。 */
export function requiredArgCount(box: CallableBox): number | null {
  if (box.name !== null) {
    const table = box.object === null ? null : methodAritiesOf(box.object.v);
    const row = table?.[box.name];
    return row === undefined ? null : row[0];
  }
  return box.arity;
}

/** 实例方法的调用槽：按名字在接收者上取出来调（`this` 天然正确），
 * 用来替掉 `Function.prototype.apply` —— 它在静态编译目标上没有 lowering。 */
export type MethodSlot = (this: unknown, ...args: Variant[]) => unknown;

/** Callable 盒子「还缺几个实参」：绑定的实参**抵扣**声明形参数（实测见 `declaredArgCount` 的注释）。 */
export function boundArgsOf(box: CallableBox): Variant[] {
  return box.bound;
}

/**
 * 声明形参数。`tmp/f97` 的 a1 阶梯把 `get_argument_count()` 的口径钉死了：它给的是**还要几个实参**，
 * 不是声明形参数、也不是绑定数 —— `add3` 未绑给 3、`bind(1)` 给 2、`bind(1, 2)` 给 1、
 * `bind(1, 2, 3)` 给 0、`bind()` 给 3，lambda 与静态方法同一式（a2 / a3），调用一次之后不变（a4）。
 * S190 当年记的「绑过的 Callable 给 0」正是**绑满**那一格，被当成通用规则发出去就成了静默错。
 * 拿不到声明数（表里没有、或那方法带默认值 —— 那一格没量）→ null，由调用方响亮拒。
 */
export function declaredArgCount(box: CallableBox): number | null {
  if (isNullCallable(box)) return 0;
  const name = box.name;
  if (name !== null) {
    const table = box.object === null ? null : methodAritiesOf(box.object.v);
    const row = table?.[name];
    // `[必填, 全部]` 两值不等说明有默认值形参 —— Godot 在那一形上给什么没量过，不猜。
    if (row === undefined || row[0] !== row[1]) return null;
    return row[1];
  }
  // lambda：形参默认值在发射期就被拒（`lambda-param-default`），发射器把声明形参数直接写进盒子
  // （原来读 `fn.length`，而 `Function.length` 在静态编译目标上没有 lowering）。
  return box.arity;
}

/**
 * Callable 的 `[必填, 全部]` 形参数 —— `tmp/f101` 那两句 arity 拒要用**两个**数：
 * 少给报「必填数」、多给报「全部数」（`twice(x, y = "z")`：给 0 个是 `Expected 1 argument(s).`、
 * 给 3 个是 `Expected 2 argument(s).`）。方法与静态方法查发射器那张表（静态方法 step 98 起进表），
 * lambda 两个数都取发射器给的形参数（默认值形参那一形在发射期就被拒）。
 * 空 Callable 返回 null：它走的是另一句（`Attempt to call function 'null::null (Callable)' …`）。
 */
export function callableArityBounds(box: CallableBox): [number, number] | null {
  if (isNullCallable(box)) return null;
  const name = box.name;
  if (name !== null) {
    if (box.object === null) return null;
    return methodAritiesOf(box.object.v)?.[name] ?? null;
  }
  const n = box.arity ?? 0;
  return [n, n];
}

export function isVariant(v: unknown): v is Variant {
  return typeof v === "object" && v !== null && typeof (v as Variant).t === "number";
}

export function wrapValue(v: unknown): Variant {
  if (isVariant(v)) return v;
  if (v === null || v === undefined) return V.nil();
  if (typeof v === "boolean") return V.bool(v);
  if (typeof v === "number") {
    return Number.isSafeInteger(v) ? V.int(v) : V.float(v);
  }
  if (typeof v === "string") return V.str(v);
  if (v instanceof GArray) return V.array(v);
  if (v instanceof GDict) return V.dict(v);
  if (Array.isArray(v)) return V.array(GArray.of(v.map(wrapValue)));
  return V.object(v);
}

export function unwrap(v: unknown): unknown {
  return isVariant(v) ? v.v : v;
}

/**
 * 一个脚本类的静态身份。
 * 不用构造器值：`new (...args) => object` 这类**构造器签名类型**在静态编译目标上根本不可编
 * （实测 scriptc 连类型都拒绝），而 `.constructor` / `Object.getPrototypeOf` 那两条反查路同样没有 lowering。
 * 所以改成「工厂函数 + 判子」两个普通函数值（普通函数当变量/字段/参数都实测可编），
 * 继承关系显式挂在 `base` 上，不再靠 JS 原型链并表。
 */
/** 静态方法的调用入口：一个普通函数值（`object`/`unknown` 类型的**类字段**在静态编译目标上不可编，
 *  所以类值本身只作为登记时的参数存在，运行期拿到的是这张闭包表）。 */
export type StaticFn = (args: Variant[]) => Variant;

export class ClassDesc {
  name: string;
  base: ClassDesc | null;
  make: (args: Variant[]) => object;
  check: (o: object) => boolean;
  /** `get_class()` 要的那个**原生**基类名（实测 f39 t3：外层脚本给 `SceneTree`、内部类给 `RefCounted`）。 */
  nativeBase: string | null;
  fieldTypes: Record<string, string> | null;
  methodArities: Record<string, [number, number]> | null;
  staticVars: Record<string, string> | null;
  /**
   * 静态方法的**名字表**、静态方法的调用入口、静态变量的读写格都不放在字段里：
   * 实测 scriptc —— 类字段装 `Set` 或「函数值的 Record」时读出来是 `unknown`（编译期 SC1100/SC2004 直接拒），
   * 而 `desc.staticMethods` 那一族读法在产物里跑起来就是
   * `class fields cannot be represented as checked-dynamic properties`。
   * 三张表改挂模块级的 `Map<object, …>`（键是 desc 本身，实测可编可跑，`tmp/g6/main.ts`）。
   */
  constructor(name: string, make: (args: Variant[]) => object, check: (o: object) => boolean) {
    this.name = name;
    this.base = null;
    this.make = make;
    this.check = check;
    this.nativeBase = null;
    this.fieldTypes = null;
    this.methodArities = null;
    this.staticVars = null;
  }
}

/** desc → 静态方法名（`has_method` / 三条调用路都查这一格）。 */
const STATIC_NAMES = new Map<object, string[]>();
/** desc → 名字 → 静态调用入口。 */
const STATIC_FNS = new Map<object, Record<string, StaticFn>>();
/** desc → 名字 → 静态变量的一格。 */
const VAR_SLOTS = new Map<object, Record<string, StaticVarSlot>>();

const CLASS_REGISTRY = new Map<string, ClassDesc>();
/** 全部已登记的类，`descOf` 按 `check` 线性认实例属于哪个类（结果按实例缓存）。 */
const DESCS: ClassDesc[] = [];
// 这两张缓存**不能**是 WeakMap：实测 scriptc 编译期先拒（`.get()` 给 `unknown`），
// 而运行期另有一种弱集合的键形会撞「Weak collection keys of this native reference type have no
// weak lifetime lowering」。代价是这些对象不再被回收：产物是短生命周期的批处理进程，实测口径优先。
const DESC_BY_INSTANCE = new Map<object, ClassDesc | null>();
/** 直接拿**类值**当接收者（`A.f()` 那种）也认得：类值 → desc。 */
const DESC_BY_CLASS = new Map<object, ClassDesc>();

/**
 * 实例（或类值、或 desc 本身）→ 它的类。判子闭包里是 `o instanceof 那个类`（静态类引用，可编），
 * 所以这里既不需要 `.constructor`，也不需要走原型链。
 * **从后往前**找：发射器按 `orderInnerClasses` 先登基类后登派生类，而 `check` 对派生实例两边都真，
 * 取最后登记的那一条才等于今天 `.constructor` 给的「最派生那个类」（报错文本 `RefCounted (Inner)` 要用它）。
 * 调用方一律传**已解包**的内层值（`(v as Variant).v`），这里不再判 Variant —— 脚本类里 `var t: int` 是合法字段名。
 */
export function descOf(target: unknown): ClassDesc | null {
  if (target instanceof ClassDesc) return target;
  // JS 的类值 `typeof` 是 "function"，而发射器之外（报错文本、Callable 的接收者）也可能直接拿类值当接收者。
  if (typeof target !== "object" && typeof target !== "function") return null;
  if (target === null) return null;
  const asClass = DESC_BY_CLASS.get(target);
  if (asClass !== undefined) return asClass;
  const seen = DESC_BY_INSTANCE.get(target);
  if (seen !== undefined) return seen;
  for (let i = DESCS.length - 1; i >= 0; i--) {
    const d = DESCS[i];
    if (d !== undefined && d.check(target)) {
      DESC_BY_INSTANCE.set(target, d);
      return d;
    }
  }
  DESC_BY_INSTANCE.set(target, null);
  return null;
}

/**
 * 发射期给一个脚本类建身份：
 * `rt.defineClass(Inner, (a) => new Inner(...a), (o) => o instanceof Inner)`。
 * 两个闭包里都是**静态类引用**（可编）。`cls` 只用来认「直接拿类值当接收者」那种写法
 * （`A.f()` 的 Callable 接收者、测试里裸传类），不当字段存下来。
 * 这里**不**登记 `is X` / `as X` 的名字 —— 匿名脚本（没有 `class_name`）在 Godot 里本来就不认，
 * 名字由 `nameClass` 单独登记。
 */
export function defineClass(
  cls: object,
  make: (args: Variant[]) => object,
  check: (o: object) => boolean,
): ClassDesc {
  const d = new ClassDesc("", make, check);
  DESCS.push(d);
  DESC_BY_CLASS.set(cls, d);
  return d;
}

/** 给已建好的类登记 `is X` / `as X` 用的名字（`class_name Foo` 与内部类才有）。 */
export function nameClass(desc: ClassDesc, name: string): void {
  desc.name = name;
  CLASS_REGISTRY.set(name, desc);
}

export function registerClass(
  name: string,
  cls: object,
  make: (args: Variant[]) => object,
  check: (o: object) => boolean,
): ClassDesc {
  const d = defineClass(cls, make, check);
  nameClass(d, name);
  return d;
}

/** 派生类登记它的基类 desc（`extends 别的脚本` 时由发射器给；原生基类那一路留 null）。 */
export function setClassBase(desc: ClassDesc, base: ClassDesc | null | undefined): void {
  desc.base = base ?? null;
}

export function registerFieldTypes(desc: ClassDesc, table: Record<string, string>): void {
  desc.fieldTypes = table;
}

/**
 * 方法名的 `[必填实参数, 全部实参数]` 表（S189）。`Object.call` / `callv` 的 arity 检查要用它：
 * JS 的 `fn.length` 只数**到第一个带默认值的形参之前**，正好是「必填数」，但「最多数」拿不到 ——
 * 而 Godot 两边都管（`tmp/f89 q04`：`hi(x, y)` 只给一个实参是 `Expected 2 argument(s).`；
 * `tmp/f88 p06` / 语料 186：`twice(s = "z")` 给 0 个与 1 个都合法）。
 */
export function registerMethodArities(desc: ClassDesc, table: Record<string, [number, number]>): void {
  desc.methodArities = table;
}

/**
 * 沿显式 `base` 链并表，派生类盖过基类（与 `fieldTypesOf` 同一口径）。
 */
export function methodAritiesOf(target: unknown): Record<string, [number, number]> | null {
  const chain: ClassDesc[] = [];
  for (let d = descOf(target); d !== null; d = d.base) chain.push(d);
  let out: Record<string, [number, number]> | null = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    const t = chain[i]?.methodArities;
    if (t === null || t === undefined) continue;
    out = { ...(out ?? {}), ...t };
  }
  return out;
}

/**
 * 实例（或类）的声明类型表，没有则 null。
 * **沿 base 链并表**：派生类自己的表只登记自有成员，而继承来的带标注成员同样要拿到声明类型
 * （内部类现在能 `extends` 内部类，S174 ④；子类里写 `p.t = 5.5` 仍要按基类声明的 `int` 转成 5）。
 */
const FIELD_TYPES_CHAIN = new Map<ClassDesc, Record<string, string>>();
export function fieldTypesOf(target: unknown): Record<string, string> | null {
  const d = descOf(target);
  if (d === null) return null;
  if (d.base === null) return d.fieldTypes;
  const cached = FIELD_TYPES_CHAIN.get(d);
  if (cached !== undefined) return cached;
  let merged: Record<string, string> | null = null;
  for (let c: ClassDesc | null = d; c !== null; c = c.base) {
    if (c.fieldTypes !== null) merged = { ...c.fieldTypes, ...(merged ?? {}) };
  }
  if (merged !== null) FIELD_TYPES_CHAIN.set(d, merged);
  return merged;
}

/**
 * 静态方法名集合（`static func`）。实测 S160：静态方法**三条路都能调**
 * （`A.f()`、`p.f()`、`var cb = A.f`），而 JS 那边它是构造器上的自有属性 —— 实例既看不见
 * 也摸不着，所以这三条都要靠这张表在运行时回退。
 * 调用入口由**发射器**给（`(a) => rt.wrapValue(Cls.f(a[0] as rt.Variant))` 这种静态引用）：
 * 从类值上按名字取函数再 cast 成 rest 签名，在静态编译目标上不可编（实测 scriptc），
 * 而按 `cls` 参数持有类值本身也是同一族围栏（`object` 类型的类字段不可编）。
 */
export function registerStaticMethods(desc: ClassDesc, names: string[], table: Record<string, StaticFn>): void {
  STATIC_NAMES.set(desc, names);
  STATIC_FNS.set(desc, table);
}

/** 名字 → 静态调用入口。拿不到说明产物与表不一致，由调用方响亮报。 */
export function staticFnOf(desc: ClassDesc, name: string): StaticFn | null {
  const table = STATIC_FNS.get(desc);
  if (table === undefined) return null;
  const f = table[name];
  return f === undefined ? null : f;
}

/**
 * 「静态变量名 → 声明类型名」（`static var x: int`）。实测 S161：静态变量是**共享的一格**，
 * 类名（`A.x = 100`）、实例（`p.x = 200`）与静态方法里裸写都落在同一格上，
 * 带类型的槽照 S150 那五种规则转换（f17 t7：`A.setx(2.7)` → 2）。
 * 格子本身仍挂在类值上（发射期 `static x = ...` 就写在那儿），这里登记的是读写它的两个闭包。
 */
/** 静态变量的一格：读与写都发成指向**具体类**的静态引用（`(X) => X.x` / `(X, v) => { X.x = v; }`）。 */
export type StaticVarSlot = { get: () => Variant; set: (v: Variant) => void };

export function registerStaticVars(desc: ClassDesc, types: Record<string, string>, slots: Record<string, StaticVarSlot>): void {
  desc.staticVars = types;
  VAR_SLOTS.set(desc, slots);
}

/** 静态变量的一格（读写闭包）；没有登记则 null。 */
export function varSlotOf(desc: ClassDesc, key: string): StaticVarSlot | null {
  const table = VAR_SLOTS.get(desc);
  if (table === undefined) return null;
  const slot = table[key];
  return slot === undefined ? null : slot;
}

/** 实例（或类）的静态变量表，没有则 null。 */
export function staticVarsOf(target: unknown): Record<string, string> | null {
  return descOf(target)?.staticVars ?? null;
}

/**
 * 类（或实例）有没有这个静态方法名。**必须是显式表**：静态方法就是构造器上的自有属性，
 * 拿 `constructor[name]` 鸭子类型去认会把 JS 函数自带的 `name` / `length` 当成方法。
 */
export function hasStaticName(target: unknown, name: string): boolean {
  const desc = descOf(target);
  if (desc === null) return false;
  const names = STATIC_NAMES.get(desc);
  if (names === undefined) return false;
  for (const n of names) if (n === name) return true;
  return false;
}

/** 静态方法名列表（`get_method_list` 那一路要枚举时用）。 */
export function staticNamesOf(target: unknown): string[] {
  const desc = descOf(target);
  if (desc === null) return [];
  const names = STATIC_NAMES.get(desc);
  return names === undefined ? [] : names;
}

/** 实例（或类）的注册名，用于报错文本；拿不到就 null。 */
export function classNameOf(target: unknown): string | null {
  return descOf(target)?.name ?? null;
}

/**
 * 原生基类名（`get_class()` 要用）。实测 f39 t3：外层脚本 `extends SceneTree` 给 `SceneTree`，
 * 内部类（没 extends）给 `RefCounted` —— 返回的是**原生基类**而不是脚本类名，所以这张表必须由
 * 发射器按基类登记，不能拿注册名顶。沿显式 `base` 链往上找第一个登记过的（`extends 别的脚本` 靠这条）。
 */
export function registerNativeBase(desc: ClassDesc, name: string): void {
  desc.nativeBase = name;
}

export function nativeBaseOf(target: unknown): string | null {
  for (let d = descOf(target); d !== null; d = d.base) {
    if (d.nativeBase !== null) return d.nativeBase;
  }
  return null;
}

// ---------------------------------------------------------------- meta 存储
//
// `set_meta` / `get_meta` / `has_meta` / `remove_meta`（实测 f36 / f39）：
// 键是 String 或 StringName（**同一个键**：`a.set_meta(&"sn", 6)` 之后 `a.has_meta("sn")` 是真），
// 值随便装；`get_meta` 两参形给默认值，一参形遇到没有的键**给 null 并继续跑**（Godot 那边只多一条
// core/object 的引擎 ERROR，脚本不中断 —— f37 实测 exit 0）。
// meta 的存在处。**不能**是 `WeakMap`：它的 `.get()` 在静态编译目标上给的是 `unknown`（实测 scriptc），
// 而挂在对象自身的一格同样不可编（类字段读出去是 `unknown`、写回去是「typed → unknown」）。
// 普通 `Map` 的两端都有 lowering —— 代价是这些对象不再会被回收，产物是短生命周期进程，实测口径优先。
const METAS = new Map<object, Map<string, Variant>>();

function metaKey(v: Variant): string {
  if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) return v.v as string;
  throw new UnsupportedError("meta-key", `meta 的键需要 String 或 StringName，收到 ${tagName(v.t)}`);
}

function metaStore(obj: object): Map<string, Variant> {
  const hit = METAS.get(obj);
  if (hit !== undefined) return hit;
  const fresh = new Map<string, Variant>();
  METAS.set(obj, fresh);
  return fresh;
}

export function setMeta(obj: object, key: Variant, value: Variant): void {
  metaStore(obj).set(metaKey(key), value);
}

export function hasMeta(obj: object, key: Variant): boolean {
  return metaStore(obj).has(metaKey(key));
}

export function removeMeta(obj: object, key: Variant): void {
  metaStore(obj).delete(metaKey(key));
}

/** 一参形缺键时给 null（实测 f37 / f39 t9 的 `<null>`），两参形给那个默认值。 */
export function getMeta(obj: object, key: Variant, dflt?: Variant): Variant {
  const hit = metaStore(obj).get(metaKey(key));
  if (hit !== undefined) return hit;
  return dflt === undefined ? V.nil() : dflt;
}

/** 装箱值 `v` 是不是 `d` 那个类的实例（`is X` / `as X` 用；判子闭包里是静态 `instanceof`）。 */
/** 按名字调一个静态方法（`A.f()` / `p.f()` / `var cb = A.f` 三条路都汇到这儿，S160）。 */
export function staticCall(desc: ClassDesc, name: string, args: Variant[]): Variant {
  const f = staticFnOf(desc, name);
  if (f === null) {
    throw new UnsupportedError("static-fn-missing", `静态方法 ${name}() 在类上找不到（注册表与产物不一致）`);
  }
  return f(args);
}

export function objIs(v: Variant, d: ClassDesc): boolean {
  if (v.t !== Tag.OBJECT) return false;
  const o = v.v;
  return typeof o === "object" && o !== null && d.check(o);
}

export function lookupClass(name: string): ClassDesc | undefined {
  return CLASS_REGISTRY.get(name);
}

/** res:// 路径 → 该脚本的类。preload/load 按路径取"脚本"这个值。 */
const SCRIPT_REGISTRY = new Map<string, ClassDesc>();

export function registerScript(resPath: string, desc: ClassDesc): void {
  SCRIPT_REGISTRY.set(resPath, desc);
}

/** `load("res://x.gd")` 运行时解析；未知路径响亮报错，绝不静默返回 null。 */
export function loadScript(path: Variant | string): Variant {
  const key = typeof path === "string" ? path : String((path as Variant).v);
  const desc = SCRIPT_REGISTRY.get(key);
  if (!desc) {
    throw new UnsupportedError("load-unknown-script", `load() 解析不到脚本：${key}`);
  }
  return V.object(desc);
}
