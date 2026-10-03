import { UnsupportedError } from "./errors";import { Tag, V, tagName, type Variant } from "./tags";
import { GArray, GDict } from "./values";
import { CallableBox, isNullCallable, type Fn } from "./callable";
import { nextObjectId } from "./identity";

// Callable 盒子的**形状**与等式在叶子模块 `callable.ts` 里（`values.ts` 要用等式，不能反向 import 本模块），这里只把外需要的几样转出去。
export { CallableBox, callableEq, callableSame, isCallable, isCallableBox, isNullCallable, nullCallable, type Fn } from "./callable";

/** 所有脚本类的根（宿主 `SceneTree` 也挂在它下面）：**运行时不能拿着 `unknown` 去按名字找方法**，「名字 → 方法」这张表由知道具体类的发射器生成成子类的 `__gdDispatch` 覆写。 */
export class GdScriptObject {
  /** 实例身份号：`get_instance_id()`、对象当字典键、数组里的成员判定都吃它（Godot 那侧是指针派生的号，跨运行不定，所以只复现关系不复现数字）。 */
  readonly gdObjectId: number = nextObjectId();
  /** 命中给装箱值（调用方再 `wrapValue` 也无妨 —— `wrapValue` 对 Variant 原样返回）；没这个方法给 null。 */
  __gdDispatch(_name: string, _args: Variant[]): Variant | null {
    return null;
  }
}

/** lambda 的 Callable 盒子（`rt.callable((a) => {...}, 形参数)`）。 */
export function callable(fn: Fn, arity: number | null = null): Variant {
  return V.object(new CallableBox(fn, null, null, [], arity));
}

/** 方法 / 静态方法 Callable 的盒子：只记「在哪个对象上、叫什么」，调用时按名派发；lambda 不走这里，它的 `get_method()` 是 `<anonymous lambda>`。 */
export function methodCallable(obj: Variant, name: string): Variant {
  return V.object(new CallableBox(null, name, obj, [], null));
}

/** 发射器 / 内部要一个 lambda 盒子时的入口（形参数与 lambda 同形）。 */
export function callableOf(fn: Fn, arity: number | null = null): Variant {
  return callable(fn, arity);
}

/** 声明的**必填**实参数：方法从方法表里拿、lambda 从盒子里拿，拿不到给 null。 */
export function requiredArgCount(box: CallableBox): number | null {
  if (box.name !== null) {
    const table = box.object === null ? null : methodAritiesOf(box.object.v);
    const row = table?.[box.name];
    return row === undefined ? null : row[0];
  }
  return box.arity;
}

/** 实例方法的调用槽：按名字在接收者上取出来调（`this` 天然正确）。 */
export type MethodSlot = (this: unknown, ...args: Variant[]) => unknown;

/** Callable 盒子「还缺几个实参」：绑定的实参**抵扣**声明形参数。 */
export function boundArgsOf(box: CallableBox): Variant[] {
  return box.bound;
}

/** Callable 的声明形参数；表里没有、或那方法带默认值时给 null，由调用方响亮拒。 */
export function declaredArgCount(box: CallableBox): number | null {
  if (isNullCallable(box)) return 0;
  const name = box.name;
  if (name !== null) {
    const table = box.object === null ? null : methodAritiesOf(box.object.v);
    const row = table?.[name];
    // `[必填, 全部]` 两值不等说明有默认值形参 —— Godot 在那一形上给什么没有可靠口径，不猜。
    if (row === undefined || row[0] !== row[1]) return null;
    return row[1];
  }
  // lambda：形参默认值在发射期就被拒，声明形参数由发射器直接写进盒子。
  return box.arity;
}

/** Callable 的 `[必填, 全部]` 形参数：少给按「必填数」报、多给按「全部数」报；方法与静态方法查方法表，lambda 两个数都取发射器给的形参数。空 Callable 给 null，由调用方走另一句报错。 */
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

/** 静态方法的调用入口：一个普通函数值，运行期从模块级的闭包表里按名取。 */
export type StaticFn = (args: Variant[]) => Variant;

/** 一个脚本类的静态身份：「工厂函数 + 判子」两个普通函数值，继承关系显式挂在 `base` 上。 */
export class ClassDesc {
  name: string;
  base: ClassDesc | null;
  make: (args: Variant[]) => object;
  check: (o: object) => boolean;
  /** `get_class()` 要的那个**原生**基类名，不是脚本类名。 */
  nativeBase: string | null;
  fieldTypes: Record<string, string> | null;
  methodArities: Record<string, [number, number]> | null;
  staticVars: Record<string, string> | null;
  // 静态方法的名字表 / 调用入口与静态变量的读写格不放在字段里，改挂模块级的 `Map<object, …>`（键是 desc 本身）。
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
// 这两张缓存不能是 `WeakMap`：静态编译目标上它的读法与弱键 lifetime 都没有 lowering；代价是这些对象不再被回收。
const DESC_BY_INSTANCE = new Map<object, ClassDesc | null>();
/** 直接拿**类值**当接收者（`A.f()` 那种）也认得：类值 → desc。 */
const DESC_BY_CLASS = new Map<object, ClassDesc>();

/** 实例（或类值、或 desc 本身）→ 它的类。**从后往前**找：`check` 对派生实例两边都真，取最后登记的那一条才是「最派生那个类」。调用方一律传**已解包**的内层值，这里不再判 Variant。 */
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

/** 发射期给一个脚本类建身份：`rt.defineClass(Inner, (a) => new Inner(...a), (o) => o instanceof Inner)`。`cls` 只用来认「直接拿类值当接收者」那种写法；`is X` / `as X` 的名字由 `nameClass` 单独登记。 */
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

/** 方法名的 `[必填实参数, 全部实参数]` 表：arity 检查要用**两个**数，少给与多给 Godot 两边都管。 */
export function registerMethodArities(desc: ClassDesc, table: Record<string, [number, number]>): void {
  desc.methodArities = table;
}

/** 沿显式 `base` 链并表，派生类盖过基类（与 `fieldTypesOf` 同一口径）。 */
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

/** 沿 `base` 链并好的声明类型表缓存：派生类自己的表只登记自有成员，继承来的带标注成员同样要拿到声明类型。 */
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

/** 静态方法名集合（`static func`）与调用入口：JS 那边静态方法是构造器上的自有属性，实例既看不见也摸不着，`A.f()` / `p.f()` / `var cb = A.f` 三条路都要靠这两张表在运行时回退。 */
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

/** 静态变量的一格：读与写都发成指向**具体类**的静态引用。 */
export type StaticVarSlot = { get: () => Variant; set: (v: Variant) => void };

/** 登记「静态变量名 → 声明类型名」与读写它们的两个闭包：静态变量是**共享的一格**，类名、实例与静态方法里裸写都落在同一格上。 */
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

/** 类（或实例）有没有这个静态方法名。**必须是显式表**：拿 `constructor[name]` 鸭子类型去认会把 JS 函数自带的 `name` / `length` 当成方法。 */
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

/** 登记原生基类名：`get_class()` 要的是**原生基类**而不是脚本类名，所以这张表必须由发射器按基类登记。 */
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
// meta 的存在处**不能**是 `WeakMap`：它的 `.get()` 在静态编译目标上给 `unknown`；代价是这些对象不再会被回收。
const METAS = new Map<object, Map<string, Variant>>();

/** meta 的键：String 与 StringName 落在**同一个键**上，其余类型响亮报错。 */
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

/** 一参形缺键时给 null（脚本继续跑），两参形给那个默认值。 */
export function getMeta(obj: object, key: Variant, dflt?: Variant): Variant {
  const hit = metaStore(obj).get(metaKey(key));
  if (hit !== undefined) return hit;
  return dflt === undefined ? V.nil() : dflt;
}

/** 按名字调一个静态方法（`A.f()` / `p.f()` / `var cb = A.f` 三条路都汇到这儿）。 */
export function staticCall(desc: ClassDesc, name: string, args: Variant[]): Variant {
  const f = staticFnOf(desc, name);
  if (f === null) {
    throw new UnsupportedError("static-fn-missing", `静态方法 ${name}() 在类上找不到（注册表与产物不一致）`);
  }
  return f(args);
}

/** 装箱值 `v` 是不是 `d` 那个类的实例（`is X` / `as X` 用）。 */
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
