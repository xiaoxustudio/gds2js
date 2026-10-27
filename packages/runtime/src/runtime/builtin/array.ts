import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, V, intToNum, tagName, type IntPayload, type Variant } from "../tags";
import { GArray, GDict, elemConvert, type ElemKind } from "../values";
import { intArgBig, valueTypeName } from "../string-ops";
import { ELEM_TYPE_CODE } from "../method/core";
import { GBytes, isBytes, packBytes, packItems, packTypeName } from "../packed";
import { ClassDesc, dictShapeOf, dictWrittenOf } from "../object";
import { GdNativeClass } from "../native-class";
import { emptyNodePath, nodePathValue } from "../node-path";
import { GVector2 } from "../vector2";
import { GVector2i } from "../vector2i";
import { GVector3 } from "../vector3";
import { GVector3i } from "../vector3i";
import { GVector4, vector4 } from "../vector4";
import { GVector4i } from "../vector4i";
import { GColor } from "../color";

export function arrayFromVariant(v: Variant): Variant {
  if (v.t === Tag.ARRAY) {
    return v;
  }
  if (isBytes(v)) {
    return V.array(GArray.of(packItems(packBytes(v))));
  }
  if (v.t === Tag.DICT || v.t === Tag.STRING || v.t === Tag.INT || v.t === Tag.NIL ||
    (v.t === Tag.OBJECT && v.v instanceof GVector2)) {
    throw new GodotRuntimeError("array-ctor", "Invalid call. Nonexistent 'Array' constructor.");
  }
  throw new UnsupportedError("array-ctor-from", `Array(...) 只实测过 pack、Array 与那五种坏源形（收到 ${tagName(v.t)}）`);
}

/** 型码 → 元素标注名：现取 `ELEM_TYPE_CODE` 的反向，免得第二张表漂。 */
function kindByCode(code: number): ElemKind | null {
  for (const [name, c] of Object.entries(ELEM_TYPE_CODE)) {
    if (c === code) return name as ElemKind;
  }
  return null;
}

export function arrayFromArgs(args: Variant[]): Variant {
  if (args.length === 0) return V.array(GArray.of([]));
  if (args.length === 1) return arrayFromVariant(args[0] as Variant);
  if (args.length !== 4) {
    throw new UnsupportedError("array-ctor-arity", `Array(...) 只实测过 0 / 1 / 4 参三形（收到 ${String(args.length)} 参）`);
  }
  const [base, typeArg, classArg] = args as [Variant, Variant, Variant, Variant];
  if (base.t !== Tag.ARRAY) {
    if (isBytes(base)) {
      throw new GodotRuntimeError("array-ctor-base", `Invalid type in 'Array' constructor. Cannot convert argument 1 from ${packTypeName(packBytes(base).kind)} to Array.`);
    }
    throw new UnsupportedError("array-ctor-base", `Array(...) 四参形的第一参只实测过 Array（收到 ${tagName(base.t)}）`);
  }
  if (typeArg.t !== Tag.INT) {
    throw new UnsupportedError("array-ctor-type-arg", `Array(...) 的第二参只实测过 int 型码（收到 ${tagName(typeArg.t)}）`);
  }
  const codeRaw = intToNum(typeArg.v as IntPayload);
  if (typeof codeRaw === "bigint") {
    throw new UnsupportedError("array-ctor-type-arg", `Array(...) 的型码越出 int 范围（收到 ${String(codeRaw)}）`);
  }
  const items = (base.v as GArray).raw();
  if (codeRaw === 0) {
    return V.array(GArray.of([...items]));
  }
  const kind = kindByCode(codeRaw);
  if (kind === null) {
    throw new UnsupportedError("array-ctor-kind", `Array(...) 的定型形只实测过容器标注的那批型名；型码 ${String(codeRaw)} 没量过（类名位收到 ${tagName(classArg.t)}）`);
  }
  const cls = ctorClassName(classArg);
  const convertAll = (): Variant[] | null => {
    const out: Variant[] = [];
    for (const x of items) {
      const converted = elemConvert(kind, x);
      if (converted === null) return null;
      out.push(converted);
    }
    return out;
  };
  if (cls !== null && kind !== "Object") {
    const converted = convertAll();
    return V.array(GArray.of(converted ?? []));
  }
  const built = (list: Variant[]): Variant => {
    const g = GArray.of(list);
    if (kind === "Object" && cls !== null) {
      g.stampElem(kind);
      g.className = cls;
    }
    else g.stampElem(kind);
    return V.array(g);
  };
  const converted = convertAll();
  return built(converted ?? []);
}

function ctorClassName(v: Variant): string | null {
  if (v.t === Tag.STRING_NAME || v.t === Tag.STRING) {
    const text = v.v as string;
    return text === "" ? null : text;
  }
  throw new UnsupportedError("array-ctor-class", `Array(...) 的第三参只实测过 StringName 与 String（收到 ${tagName(v.t)}）`);
}

export function rangeInt(v: Variant | undefined, n: number): number {
  if (v === undefined) {
    throw new GodotRuntimeError("range-arity", `range 缺少第 ${n} 个参数`);
  }
  return Number(intArgBig(v, `range 的第 ${n} 个参数`));
}

export function rangeSeq(args: Variant[]): number[] {
  const end = rangeInt(args.length >= 2 ? args[1] : args[0], args.length >= 2 ? 2 : 1);
  const start = args.length >= 2 ? rangeInt(args[0], 1) : 0;
  const step = args.length >= 3 ? rangeInt(args[2], 3) : 1;
  if (step === 0) {
    throw new GodotRuntimeError("range-step-zero", `Error calling GDScript utility function "range()": 步长参数为零！`);
  }
  const items: number[] = [];
  if (step > 0) {
    for (let i = start; i < end; i += step) items.push(i);
  } else {
    for (let i = start; i > end; i += step) items.push(i);
  }
  return items;
}

export function range(args: Variant[]): GArray {
  return GArray.of(rangeSeq(args).map((i) => V.int(i)));
}

function dictTypeDefault(t: string | null): Variant {
  if (t === null) return V.nil();
  switch (t) {
    case "int":
      return V.int(0);
    case "float":
      return V.float(0);
    case "bool":
      return V.bool(false);
    case "String":
      return V.str("");
    case "StringName":
      return V.stringName("");
    case "Vector2":
      return V.object(new GVector2(0, 0));
    case "Vector2i":
      return V.object(new GVector2i(0, 0));
    case "Vector3":
      return V.object(new GVector3(0, 0, 0));
    case "Vector3i":
      return V.object(new GVector3i(0, 0, 0));
    case "Vector4":
      return V.object(new GVector4(0, 0, 0, 0));
    case "Vector4i":
      return V.object(new GVector4i(0, 0, 0, 0));
    case "Color":
      return V.object(new GColor(0, 0, 0, 1));
    case "NodePath":
      return emptyNodePath();
    case "Array":
      return V.array(GArray.of([]));
    case "Dictionary":
      return V.dict(new GDict());
    case "PackedByteArray":
      return V.object(new GBytes([], "byte"));
    case "PackedStringArray":
      return V.object(new GBytes([], "string"));
    case "PackedVector4Array":
      return V.object(new GBytes([], "vector4"));
    default:
      throw new UnsupportedError(
        "inst-to-dict-acc-type",
        `inst_to_dict() 里 ${t} 类型的 get/set 属性没量过出门值（S269 ④ 量齐的是十六种形状），不猜`,
      );
  }
}

export function gInstToDict(v: Variant): Variant {
  if (v.t === Tag.NIL) return V.nil();
  if (v.t !== Tag.OBJECT) {
    throw new UnsupportedError(
      "inst-to-dict-arg",
      `inst_to_dict() 的实参只量过脚本实例、类值与 null（收到 ${valueTypeName(v)}）：静态不合式的来源在引擎是解析期那句 argument 1 should be "Object"`,
    );
  }
  const inner = v.v as object;
  if (inner instanceof ClassDesc || inner instanceof GdNativeClass) {
    throw new GodotRuntimeError(
      "inst-to-dict",
      `Error calling GDScript utility function "inst_to_dict()": Not a script with an instance.`,
    );
  }
  const shape = dictShapeOf(inner);
  if (shape === null) {
    throw new UnsupportedError("inst-to-dict-arg", `inst_to_dict() 的实参是 ${valueTypeName(v)}：只有脚本实例量过这一支`);
  }
  if (shape.resPath === null) {
    throw new UnsupportedError("inst-to-dict-path", "inst_to_dict() 发不出 @path：这份产物没有模块的 res 路径（单文件模式），那一格没量过");
  }
  const d = new GDict();
  d.set(V.str("@subpath"), nodePathValue(shape.classPath));
  d.set(V.str("@path"), V.str(shape.resPath));
  const acc = shape.accessors;
  const written = Object.keys(acc).length === 0 ? null : dictWrittenOf(inner);
  for (let i = 0; i < shape.names.length; i++) {
    const name = shape.names[i] as string;
    const declared = acc[name] as string | null | undefined;
    const carried = declared === undefined || written === null ? undefined : written[name];
    const value = declared === undefined ? (shape.values[i] as Variant) : carried === undefined ? dictTypeDefault(declared) : carried;
    d.set(V.stringName(name), value);
  }
  return V.dict(d);
}
