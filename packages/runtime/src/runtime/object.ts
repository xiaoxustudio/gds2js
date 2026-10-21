import { UnsupportedError } from "./errors";import { Tag, V, tagName, type Variant } from "./tags";
import { GArray, GDict, registerClassFaceCheck, registerObjectLabelHook, registerScriptPropsHook } from "./values";
import { CallableBox, isNullCallable, registerCallableLabelHook, type Fn } from "./callable";
import { globalCallableRow } from "./global-names";
import { nextObjectId } from "./identity";

// Callable 盒子的**形状**与等式在叶子模块 `callable.ts` 里（`values.ts` 要用等式，不能反向 import 本模块），这里只把外需要的几样转出去。
export { CallableBox, callableEq, callableLabel, callableSame, isCallable, isCallableBox, isNullCallable, nullCallable, registerBoundSnapshotHook, type Fn } from "./callable";

/** 所有脚本类的根（宿主 `SceneTree` 也挂在它下面）：**运行时不能拿着 `unknown` 去按名字找方法**，「名字 → 方法」这张表由知道具体类的发射器生成成子类的 `__gdDispatch` 覆写。 */
export class GdScriptObject {
  readonly gdObjectId: number = nextObjectId(this);
  /** `dict_to_inst` 灌进带 get/set 属性的原值（引擎不调 setter，值只住在这一台实例上，S272 ③）。 */
  __gd_dict_written__: Record<string, Variant> | null = null;
  /** 命中给装箱值（调用方再 `wrapValue` 也无妨 —— `wrapValue` 对 Variant 原样返回）；没这个方法给 null。 */
  __gdDispatch(_name: string, _args: Variant[]): Variant | null {
    return null;
  }
}

/** 空对象引用与 `weakref()` 的盒子住在叶子模块 `identity.ts`（`values.ts` 的打印与等式都要读它们，不能反向 import 本模块）。 */
export {
  GdNullObject,
  NULL_OBJECT,
  WeakRefBox,
  isNullRefValue,
  isWeakRefBox,
  liveObjectOf,
  nextObjectId,
  weakRefBox,
} from "./identity";
export type { GdIdentified } from "./identity";

/** lambda 的 Callable 盒子（`rt.callable((a) => {...}, 形参数)`）：第三参是尾部带默认值的形参数，元数句要用必填数。 */
export function callable(fn: Fn, arity: number | null = null, defaultCount = 0): Variant {
  return V.object(new CallableBox(fn, null, null, [], arity, false, null, null, defaultCount));
}

/** 方法 / 静态方法 Callable 的盒子：只记「在哪个对象上、叫什么」，调用时按名派发；lambda 不走这里，它的 `get_method()` 是 `<anonymous lambda>`。 */
export function methodCallable(obj: Variant, name: string): Variant {
  return V.object(new CallableBox(null, name, obj, [], null));
}

/** 发射器 / 内部要一个 lambda 盒子时的入口（形参数与 lambda 同形）。 */
export function callableOf(fn: Fn, arity: number | null = null): Variant {
  return callable(fn, arity);
}

/** 声明的**必填**实参数：方法从方法表里拿、全局 Callable 从实测那张表拿、lambda 从盒子里拿，拿不到给 null。 */
export function requiredArgCount(box: CallableBox): number | null {
  if (box.builtinBounds !== null) return box.builtinBounds[0];
  if (box.name !== null) {
    if (box.object === null) return globalCallableRow(box.name)?.bounds?.[0] ?? null;
    const table = methodAritiesOf(box.object.v);
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

/** Callable 的声明形参数；表里没有给 null，由调用方响亮拒。带默认值形参时取**全部**声明数（S525 实测：`quit(exit_code=0)`→1、`h(a,b=1)`→2、`k(a,b=1,c=2)`→3、`h.bind(5)`→1）。 */
export function declaredArgCount(box: CallableBox): number | null {
  if (isNullCallable(box)) return 0;
  // 内建那几面的元数上界就是**声明形参数**：329 名逐名对过裁判，`get_argument_count()` 与表的第二值一字不差
  // （读数 `tmp/probe-argc/compare1.txt`；语料 381 的 Y7：hex_encode 0、compress 1、decompress 2）。
  if (box.builtinBounds !== null) return box.builtinBounds[1];
  const name = box.name;
  if (name !== null) {
    // 全局 Callable 的 `get_argument_count()` 是实测读数，与 `.call()` 认的区间是两回事（`str` 声明 1 个、变元无上限）。
    if (box.object === null) return globalCallableRow(name)?.argc ?? null;
    const table = methodAritiesOf(box.object.v);
    const row = table?.[name];
    return row === undefined ? null : row[1];
  }
  // lambda：形参默认值在发射期就被拒，声明形参数由发射器直接写进盒子。
  return box.arity;
}

/** Callable 的 `[必填, 全部]` 形参数：少给按「必填数」报、多给按「全部数」报；方法与静态方法查方法表，lambda 两个数都取发射器给的形参数。空 Callable 给 null，由调用方走另一句报错。 */
export function callableArityBounds(box: CallableBox): [number, number] | null {
  if (isNullCallable(box)) return null;
  // lambda 的尾部形参带默认值：必填数是「声明数 − 默认值数」，多给那一句仍报声明数（`tmp/probe-lamdef/{e1,e2,b1,b2}.gd`）
  if (box.defaultCount > 0 && box.arity !== null) return [box.arity - box.defaultCount, box.arity];
  if (box.builtinBounds !== null) return box.builtinBounds;
  const name = box.name;
  if (name !== null) {
    if (box.object === null) {
      const b = globalCallableRow(name)?.bounds;
      return b === undefined || b === null ? null : [b[0], b[1]];
    }
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
  /** 类身份自己也要有号：静态方法的 Callable 挂在「类值」上当接收者，实测四个同名静态（两个 `class_name` 类 + 两个内部类）进同一张字典是**四格**，标签却一模一样都是 `GDScript::shared` —— 键只能吃这个号。 */
  readonly gdObjectId: number = nextObjectId();
  /** `get_class()` 要的那个**原生**基类名，不是脚本类名。 */
  nativeBase: string | null;
  /** Callable 标签里括号那一截：`class_name` 声明的名字，没有就是脚本文件名；内部类不登记（引擎那侧就没有括号）。 */
  scriptLabel: string | null;
  fieldTypes: Record<string, string> | null;
  /** 自己类的脚本变量名，按声明顺序 —— `String.format()` 的属性替换要这个顺序（引擎是「自己类在前、基类在后」）。 */
  scriptProps: string[] | null;
  /** 与 `scriptProps` 同序的取值闭包，由发射器静态拼；手写的测试替身可以没有。 */
  scriptValues: ((o: object) => Variant[]) | null;
  methodArities: Record<string, [number, number]> | null;
  /** 每位形参的声明型名（没标注给 null）：被调方入口那句转换错的判据（S648）。 */
  methodParams: Record<string, (string | null)[]> | null;
  staticVars: Record<string, string> | null;
  /** `inst_to_dict` 的四段身份：所属模块的 res 路径、自己的类路径（模块根类是空串）、进门名单的变量名、带 get/set 的属性名 → 声明类型。 */
  dictResPath: string | null;
  dictClassPath: string | null;
  dictNames: string[] | null;
  dictAccessors: Record<string, string | null> | null;
  /** 读数器：按 `dictNames` 的顺序把自己的字段值取出来（accessor 那一格给 nil，由 `inst_to_dict` 换成类型默认值）。
   *  发不出去的原因是静态目标上不能拿类实例当 `Record<string, Variant>` 索引 —— scriptc 会拿记录形状去校验实例自己的槽，
   *  第一格就撞 `gdObjectId`（实测 `expected object at $.gdObjectId, got number`），所以读字段的式子由发射器按类静态写好。 */
  dictValues: ((o: object) => Variant[]) | null;
  // 静态方法的名字表 / 调用入口与静态变量的读写格不放在字段里，改挂模块级的 `Map<object, …>`（键是 desc 本身）。
  constructor(name: string, make: (args: Variant[]) => object, check: (o: object) => boolean) {
    this.name = name;
    this.base = null;
    this.make = make;
    this.check = check;
    this.nativeBase = null;
    this.scriptLabel = null;
    this.fieldTypes = null;
    this.scriptProps = null;
    this.scriptValues = null;
    this.scriptValues = null;
    this.methodArities = null;
    this.methodParams = null;
    this.staticVars = null;
    this.dictResPath = null;
    this.dictClassPath = null;
    this.dictNames = null;
    this.dictAccessors = null;
    this.dictValues = null;
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

/** 自己类的脚本变量名表（声明顺序），`String.format()` 的实参是脚本实例时按它替换。
 *  `reader` 是发射器按同一顺序静态拼出来的取值闭包：静态编译目标上连「把实例当 `Record<string, Variant>` 的那次转换」
 *  本身都不允许 —— scriptc 会拿记录形状去校验对象（第一格就是 `gdObjectId`），所以那条式子在这里一句都不能出现（S271）。 */
export function registerScriptProps(desc: ClassDesc, names: string[], reader: (o: object) => Variant[]): void {
  desc.scriptProps = names;
  desc.scriptValues = reader;
}

/**
 * `inst_to_dict` 的类身份四段（S269）：`resPath` 是所属模块的 res 路径（单文件模式没有 → 传 null，调用处响亮拒），
 * `classPath` 是类路径（模块根类空串、内嵌类是类名），`names` 是进门名单（`const` / `static var` / `signal` 都不在里头），
 * `accessors` 是带 get/set 的属性名 → 声明类型（null = 无类型）—— 引擎对这类属性**不调 getter**，出门的是声明类型的默认值。
 */
export function registerDictIdentity(
  desc: ClassDesc,
  resPath: string | null,
  classPath: string,
  names: string[],
  accessors: Record<string, string | null>,
  reader: (o: object) => Variant[],
): void {
  desc.dictResPath = resPath;
  desc.dictClassPath = classPath;
  desc.dictNames = names;
  desc.dictAccessors = accessors;
  desc.dictValues = reader;
  // 反查表：`dict_to_inst` 拿 `@path` + `@subpath` 认类（S272 ④）。单文件模式没有 res 路径，那一格进不了表。
  if (resPath !== null) DICT_REGISTRY.set(dictKey(resPath, classPath), desc);
}

/** `(res 路径, 类路径)` → 类：类路径是空串就指模块根类（引擎那一形造的是脚本自己的根类）。 */
export function dictDescOf(resPath: string, classPath: string): ClassDesc | null {
  const hit = DICT_REGISTRY.get(dictKey(resPath, classPath));
  return hit === undefined ? null : hit;
}

function dictKey(resPath: string, classPath: string): string {
  return `${resPath}#${classPath}`;
}

/** 裸构造模式：`dict_to_inst` 造实例时**不跑 `_init`**（S269 ⑦ 实测：`_init` 的副作用一次都不打，字段仍从字典灌进去）。
 *  构造器里的字段初始化子照跑 —— 那部分与 `_init` 是两个步骤，缺的字段才拿得到类声明的默认值（S272 ③）。 */
let BARE_DEPTH = 0;

export function beginBareConstruction(): void {
  BARE_DEPTH += 1;
}

export function endBareConstruction(): void {
  BARE_DEPTH -= 1;
}

export function bareConstruction(): boolean {
  return BARE_DEPTH > 0;
}

/** 一个脚本实例进 `inst_to_dict` 时要的全部读数。字段序是**基类在前**（S269 ③），与 `String.format()` 那条「自己类在前」反着走。 */
export function dictShapeOf(target: unknown): {
  resPath: string | null;
  classPath: string;
  names: string[];
  accessors: Record<string, string | null>;
  values: Variant[];
} | null {
  const desc = descOf(target);
  if (desc === null || desc.dictNames === null) return null;
  const chain: ClassDesc[] = [];
  for (let d: ClassDesc | null = desc; d !== null; d = d.base) chain.push(d);
  const names: string[] = [];
  const values: Variant[] = [];
  const accessors: Record<string, string | null> = {};
  for (let i = chain.length - 1; i >= 0; i--) {
    const d = chain[i] as ClassDesc;
    const own = d.dictNames;
    if (own === null) continue;
    for (const n of own) names.push(n);
    const vals = d.dictValues === null ? null : d.dictValues(target as object);
    for (let j = 0; j < own.length; j++) values.push(vals === null ? V.nil() : (vals[j] as Variant));
    const acc = d.dictAccessors;
    if (acc !== null) for (const key of Object.keys(acc)) accessors[key] = acc[key] as string | null;
  }
  return { resPath: desc.dictResPath, classPath: desc.dictClassPath ?? "", names, accessors, values };
}

/** 这台实例上由 `dict_to_inst` 灌进 get/set 属性的原值；没灌过就是 null（`inst_to_dict` 据此在「灌过的值」与「声明类型默认值」之间选）。 */
export function dictWrittenOf(target: object): Record<string, Variant> | null {
  return target instanceof GdScriptObject ? target.__gd_dict_written__ : null;
}

/** 灌一格原值：表是懒创建的，普通构造一台实例都不会带它。 */
export function writeDictWritten(target: object, name: string, value: Variant): void {
  if (!(target instanceof GdScriptObject)) return;
  if (target.__gd_dict_written__ === null) target.__gd_dict_written__ = {};
  target.__gd_dict_written__[name] = value;
}

/** 方法名的 `[必填实参数, 全部实参数]` 表：arity 检查要用**两个**数，少给与多给 Godot 两边都管。 */
export function registerMethodArities(desc: ClassDesc, table: Record<string, [number, number]>): void {
  desc.methodArities = table;
}

/** 形参型名表：发射器按 `func f(a: int, s)` 登记 `[["int", null]]`，运行期入口按它发那句转换错（S648）。 */
export function registerMethodParams(desc: ClassDesc, table: Record<string, (string | null)[]>): void {
  desc.methodParams = table;
}

/** 沿显式 `base` 链并表，派生类盖过基类（与 `fieldTypesOf` 同一口径）。 */
export function methodParamsOf(target: unknown): Record<string, (string | null)[]> | null {
  const chain: ClassDesc[] = [];
  for (let d = descOf(target); d !== null; d = d.base) chain.push(d);
  let out: Record<string, (string | null)[]> | null = null;
  for (let i = chain.length - 1; i >= 0; i--) {
    const t = chain[i]?.methodParams;
    if (t === null || t === undefined) continue;
    out = { ...(out ?? {}), ...t };
  }
  return out;
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

/** 登记 Callable 标签里那截括号名（`Util` 这种 `class_name`，或 `main.gd` 这种文件名）。 */
export function registerScriptLabel(desc: ClassDesc, label: string): void {
  desc.scriptLabel = label;
}

/** 沿 `base` 链找最近登记过的脚本名：内部类一路没有，标签就不带括号。 */
export function scriptLabelOf(target: unknown): string | null {
  for (let d = descOf(target); d !== null; d = d.base) {
    if (d.scriptLabel !== null) return d.scriptLabel;
  }
  return null;
}

// Callable 标签里「挂在某个脚本类上的那两支」要知道类的身份，而本模块才是知道那一层的地方。
registerClassFaceCheck((cls, v) => {
  if (v.t !== Tag.OBJECT) return false;
  for (let d = descOf(v.v); d !== null; d = d.base) if (d.name === cls) return true;
  return false;
});

registerCallableLabelHook((box) => {
  if (box.builtin !== null && box.name !== null) return `${box.builtin}::${box.name}`;
  const inner = box.object?.v;
  const name = box.name;
  if (inner === undefined || name === null) return null;
  if (hasStaticName(inner, name)) return `GDScript::${name}`;
  const base = nativeBaseOf(inner);
  if (base === null) return null;
  const label = scriptLabelOf(inner);
  return label === null ? `${base}::${name}` : `${base}(${label})::${name}`;
});

// `String.format()` 的属性替换按「自己类在前、基类在后」走，只有本模块看得见继承链。
registerScriptPropsHook((inner) => {
  if (!(inner instanceof GdScriptObject)) return null;
  const desc = descOf(inner);
  if (desc === null) return null;
  const props: Array<{ name: string; value: Variant }> = [];
  let unmodeledBase: string | null = null;
  for (let d: ClassDesc | null = desc; d !== null; d = d.base) {
    if (d.nativeBase !== null && d.nativeBase !== "RefCounted" && d.nativeBase !== "Object") unmodeledBase = d.nativeBase;
    const names = d.scriptProps;
    const vals = d.scriptValues;
    if (names === null || vals === null) continue;
    const read = vals(inner);
    for (let j = 0; j < names.length; j++) props.push({ name: names[j] as string, value: read[j] as Variant });
  }
  return { props, unmodeledBase };
});

registerObjectLabelHook((inner) => {
  if (!(inner instanceof GdScriptObject)) return null;
  const base = nativeBaseOf(inner);
  return base === null ? null : `<${base}#${String(inner.gdObjectId)}>`;
});

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
/** `(res 路径#类路径)` → 类，由 `registerDictIdentity` 填；`dict_to_inst` 的反查表。 */
const DICT_REGISTRY = new Map<string, ClassDesc>();

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
