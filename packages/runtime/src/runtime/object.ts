import { UnsupportedError } from "./errors";import { Tag, V, tagName, type Variant } from "./tags";
import { GArray, GDict, registerClassFaceCheck, registerObjectLabelHook, registerScriptPropsHook } from "./values";
import { CallableBox, isNullCallable, registerCallableLabelHook, type Fn } from "./callable";
import { globalCallableRow } from "./global-names";
import { nextObjectId } from "./identity";
import { GdNativeClass, nativeClassNewArgs } from "./native-class";

export { CallableBox, callableEq, callableLabel, callableSame, isCallable, isCallableBox, isNullCallable, nullCallable, registerBoundSnapshotHook, type Fn } from "./callable";

export class GdScriptObject {
  readonly gdObjectId: number = nextObjectId(this);
  __gd_dict_written__: Record<string, Variant> | null = null;
  /** 命中给装箱值（调用方再 `wrapValue` 也无妨 —— `wrapValue` 对 Variant 原样返回）；没这个方法给 null。 */
  __gdDispatch(_name: string, _args: Variant[]): Variant | null {
    return null;
  }
}

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

export type MethodSlot = (this: unknown, ...args: Variant[]) => unknown;

/** Callable 盒子「还缺几个实参」：绑定的实参**抵扣**声明形参数。 */
export function boundArgsOf(box: CallableBox): Variant[] {
  return box.bound;
}

export function declaredArgCount(box: CallableBox): number | null {
  if (isNullCallable(box)) return 0;
  if (box.builtinBounds !== null) return box.builtinBounds[1];
  const name = box.name;
  if (name === "new") {
    const native = box.object === null ? null : nativeClassNewArgs(box.object.v);
    if (native !== null) return native;
    const ctor = box.object === null ? null : ctorAritiesOf(box.object.v);
    if (ctor !== null) return 0;
  }
  if (name !== null) {
    if (box.object === null) return globalCallableRow(name)?.argc ?? null;
    const table = methodAritiesOf(box.object.v);
    const row = table?.[name];
    return row === undefined ? null : row[1];
  }
  return box.arity;
}

export function callableArityBounds(box: CallableBox): [number, number] | null {
  if (isNullCallable(box)) return null;
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

export type StaticFn = (args: Variant[]) => Variant;

export class ClassDesc {
  name: string;
  base: ClassDesc | null;
  make: (args: Variant[]) => object;
  check: (o: object) => boolean;
  readonly gdObjectId: number = nextObjectId();
  nativeBase: string | null;
  scriptLabel: string | null;
  fieldTypes: Record<string, string> | null;
  scriptProps: string[] | null;
  scriptValues: ((o: object) => Variant[]) | null;
  methodArities: Record<string, [number, number]> | null;
  ctorArities: [number, number] | null;
  methodParams: Record<string, (string | null)[]> | null;
  staticVars: Record<string, string> | null;
  dictResPath: string | null;
  dictClassPath: string | null;
  dictNames: string[] | null;
  dictAccessors: Record<string, string | null> | null;
  dictValues: ((o: object) => Variant[]) | null;
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
    this.ctorArities = null;
    this.methodParams = null;
    this.staticVars = null;
    this.dictResPath = null;
    this.dictClassPath = null;
    this.dictNames = null;
    this.dictAccessors = null;
    this.dictValues = null;
  }
}

const STATIC_NAMES = new Map<object, string[]>();
const STATIC_FNS = new Map<object, Record<string, StaticFn>>();
const VAR_SLOTS = new Map<object, Record<string, StaticVarSlot>>();

const CLASS_REGISTRY = new Map<string, ClassDesc>();
const DESCS: ClassDesc[] = [];
const DESC_BY_INSTANCE = new Map<object, ClassDesc | null>();
const DESC_BY_CLASS = new Map<object, ClassDesc>();

export function descOf(target: unknown): ClassDesc | null {
  if (target instanceof ClassDesc) return target;
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

export function registerScriptProps(desc: ClassDesc, names: string[], reader: (o: object) => Variant[]): void {
  desc.scriptProps = names;
  desc.scriptValues = reader;
}

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
  if (resPath !== null) DICT_REGISTRY.set(dictKey(resPath, classPath), desc);
}

export function dictDescOf(resPath: string, classPath: string): ClassDesc | null {
  const hit = DICT_REGISTRY.get(dictKey(resPath, classPath));
  return hit === undefined ? null : hit;
}

function dictKey(resPath: string, classPath: string): string {
  return `${resPath}#${classPath}`;
}

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

export function writeDictWritten(target: object, name: string, value: Variant): void {
  if (!(target instanceof GdScriptObject)) return;
  if (target.__gd_dict_written__ === null) target.__gd_dict_written__ = {};
  target.__gd_dict_written__[name] = value;
}

/** 方法名的 `[必填实参数, 全部实参数]` 表：arity 检查要用**两个**数，少给与多给 Godot 两边都管。 */
export function registerMethodArities(desc: ClassDesc, table: Record<string, [number, number]>): void {
  desc.methodArities = table;
}

export function registerMethodParams(desc: ClassDesc, table: Record<string, (string | null)[]>): void {
  desc.methodParams = table;
}

/** 构造子元数：发射器只给声明了 `_init` 且带形参的类登记，子类不登记时沿基类链拿父类那一行。 */
export function registerCtorArities(desc: ClassDesc, row: [number, number]): void {
  desc.ctorArities = row;
}

export function ctorAritiesOf(target: unknown): [number, number] | null {
  for (let d = descOf(target); d !== null; d = d.base) {
    if (d.ctorArities !== null) return d.ctorArities;
  }
  return null;
}

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

export function registerStaticMethods(desc: ClassDesc, names: string[], table: Record<string, StaticFn>): void {
  STATIC_NAMES.set(desc, names);
  STATIC_FNS.set(desc, table);
}

export function staticFnOf(desc: ClassDesc, name: string): StaticFn | null {
  const table = STATIC_FNS.get(desc);
  if (table === undefined) return null;
  const f = table[name];
  return f === undefined ? null : f;
}

export type StaticVarSlot = { get: () => Variant; set: (v: Variant) => void };

export function registerStaticVars(desc: ClassDesc, types: Record<string, string>, slots: Record<string, StaticVarSlot>): void {
  desc.staticVars = types;
  VAR_SLOTS.set(desc, slots);
}

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

export function hasStaticName(target: unknown, name: string): boolean {
  const desc = descOf(target);
  if (desc === null) return false;
  const names = STATIC_NAMES.get(desc);
  if (names === undefined) return false;
  for (const n of names) if (n === name) return true;
  return false;
}

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

export function scriptLabelOf(target: unknown): string | null {
  for (let d = descOf(target); d !== null; d = d.base) {
    if (d.scriptLabel !== null) return d.scriptLabel;
  }
  return null;
}

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
  if (inner instanceof ClassDesc && name === "new") return "GDScript::new";
  if (inner instanceof GdNativeClass && name === "new") return "GDScriptNativeClass::new";
  if (hasStaticName(inner, name)) return `GDScript::${name}`;
  const base = nativeBaseOf(inner);
  if (base === null) return null;
  const label = scriptLabelOf(inner);
  return label === null ? `${base}::${name}` : `${base}(${label})::${name}`;
});

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

export function getMeta(obj: object, key: Variant, dflt?: Variant): Variant {
  const hit = metaStore(obj).get(metaKey(key));
  if (hit !== undefined) return hit;
  return dflt === undefined ? V.nil() : dflt;
}

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

const SCRIPT_REGISTRY = new Map<string, ClassDesc>();
const DICT_REGISTRY = new Map<string, ClassDesc>();

export function registerScript(resPath: string, desc: ClassDesc): void {
  SCRIPT_REGISTRY.set(resPath, desc);
}

export function loadScript(path: Variant | string): Variant {
  const key = typeof path === "string" ? path : String((path as Variant).v);
  const desc = SCRIPT_REGISTRY.get(key);
  if (!desc) {
    throw new UnsupportedError("load-unknown-script", `load() 解析不到脚本：${key}`);
  }
  return V.object(desc);
}
