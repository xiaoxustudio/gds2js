import { UnsupportedError } from "./errors";
import { Tag, V, intToBig, intToNum, tagName, type IntPayload, type Variant } from "./tags";
import { GArray, GDict, show, truthyOf } from "./values";
import { toFloat, toInt } from "./builtins";
import { GBytes, packItems, toElem, type PackKind } from "./packed";
import { GVector2 } from "./vector2";
import { GVector2i } from "./vector2i";
import { GVector3 } from "./vector3";
import { GVector3i } from "./vector3i";
import { GColor } from "./color";

/** 引擎 `Variant.Type` 里我们手里有形状的那二十支号（其余在 `variantConvert` 里响亮拒，S235）。 */
const GT = {
  NIL: 0,
  BOOL: 1,
  INT: 2,
  FLOAT: 3,
  STRING: 4,
  VECTOR2: 5,
  VECTOR2I: 6,
  VECTOR3: 9,
  VECTOR3I: 10,
  COLOR: 20,
  STRING_NAME: 21,
  DICT: 27,
  ARRAY: 28,
} as const;

/** pack 目标的号 → 我们的 pack 形状。 */
const PACK_TARGET: Record<number, PackKind> = {
  29: "byte",
  30: "int32",
  31: "int64",
  32: "float32",
  33: "float64",
  34: "string",
  35: "vector2",
};

function isNum(t: number): boolean {
  return t === Tag.BOOL || t === Tag.INT || t === Tag.FLOAT;
}

function isText(t: number): boolean {
  return t === Tag.STRING || t === Tag.STRING_NAME;
}

/** `Vector2` 与 `Vector2i` 是一族（`Vector3` 同），转换时按 x / y / z 搬，缺的补 0、多的丢掉。 */
function vecOf(v: Variant): [number, number, number] | null {
  if (v.t !== Tag.OBJECT) return null;
  const o = v.v as object;
  if (o instanceof GVector2) return [o.x, o.y, 0];
  if (o instanceof GVector2i) return [o.x, o.y, 0];
  if (o instanceof GVector3) return [o.x, o.y, o.z];
  if (o instanceof GVector3i) return [o.x, o.y, o.z];
  return null;
}

function vecFamily(v: Variant): 2 | 3 | 0 {
  if (v.t !== Tag.OBJECT) return 0;
  const o = v.v as object;
  if (o instanceof GVector2 || o instanceof GVector2i) return 2;
  if (o instanceof GVector3 || o instanceof GVector3i) return 3;
  return 0;
}

function mkVec(target: number, x: number, y: number, z: number): Variant {
  if (target === GT.VECTOR2) return V.object(new GVector2(x, y));
  if (target === GT.VECTOR2I) return V.object(new GVector2i(Math.trunc(x), Math.trunc(y)));
  if (target === GT.VECTOR3) return V.object(new GVector3(x, y, z));
  return V.object(new GVector3i(Math.trunc(x), Math.trunc(y), Math.trunc(z)));
}

/** int → Color 走的是 0xRRGGBBAA 那套字节拆包（实测 255 给 `(0, 0, 0, 1.0)`、256 给 `(0, 0, 0.0039, 0.0)`、-1 给全 1）。 */
function colorFromInt(n: bigint): Variant {
  const w = BigInt.asUintN(32, n);
  const ch = (k: number): number => (Number((w >> BigInt(k * 8)) & 0xffn) as number) / 255;
  return V.object(new GColor(ch(3), ch(2), ch(1), ch(0)));
}

function convPack(v: Variant, kind: PackKind, strict: boolean): Variant {
  if (v.t === Tag.ARRAY) {
    const items = (v.v as GArray).raw().map((x) => toElem(kind, x));
    return V.object(new GBytes(items, kind));
  }
  if (v.t === Tag.OBJECT && v.v instanceof GBytes) {
    const src = v.v as GBytes;
    // 同型 pack 也是**拷一份**：实测 `var q = convert(p, TYPE_PACKED_BYTE_ARRAY)` 之后 `q[0] = 9` 不串回 p，
    // 与数组、字典那两支的共享引用不一样（语料 236 的 id1 / id2 两格一边一条）。
    if (src.kind === kind) return V.object(new GBytes(src.raw().slice(), kind));
    if (strict) return V.nil();
    return V.object(new GBytes(packItems(src).map((x) => toElem(kind, x)), kind));
  }
  if (strict) return V.nil();
  return V.object(new GBytes([], kind));
}

/**
 * `convert()` / `type_convert()`：一张一支一支量出来的目标类型表（S235），`strict` 是 `convert()` 那一支。
 * 两支的区别全在「凑不出来怎么办」：`convert()` 给 null，`type_convert()` 给该类型的就近默认值。
 * 同型转换的引用形状两支一样：数组与字典**是同一个对象**（实测 `append` 串得回去），pack **拷一份**（实测写回不串原包）。
 * 字符串转 Color 走十六进制与名字两套（`"abc"` → `(0.6667, 0.7333, 0.8, 1.0)`），名字表我们没有 → 响亮拒。
 */
export function variantConvert(v: Variant, target: Variant, strict: boolean): Variant {
  if (target.t !== Tag.INT) {
    throw new UnsupportedError("convert-target", `${strict ? "convert" : "type_convert"}() 的目标类型需要 int（收到 ${tagName(target.t)}）`);
  }
  const t = intToNum(target.v as IntPayload);
  if (t < 0 || t >= 39) return v;
  const pack = PACK_TARGET[t];
  if (pack !== undefined) return convPack(v, pack, strict);

  switch (t) {
    case GT.NIL:
      return V.nil();
    case GT.BOOL:
      return isNum(v.t) || !strict ? V.bool(truthyOf(v)) : V.nil();
    case GT.INT:
      if (isNum(v.t)) return toInt(v);
      if (isText(v.t)) return toInt(V.str(v.v as string));
      return strict ? V.nil() : V.int(0);
    case GT.FLOAT:
      if (isNum(v.t)) return toFloat(v);
      if (isText(v.t)) return toFloat(V.str(v.v as string));
      return strict ? V.nil() : V.float(0);
    case GT.STRING:
      if (v.t === Tag.STRING) return v;
      if (isText(v.t) || !strict) return V.str(show(v));
      return V.nil();
    case GT.STRING_NAME:
      if (v.t === Tag.STRING_NAME) return v;
      if (v.t === Tag.STRING) return V.stringName(v.v as string);
      return strict ? V.nil() : V.stringName("");
    case GT.VECTOR2:
    case GT.VECTOR2I:
    case GT.VECTOR3:
    case GT.VECTOR3I: {
      const fam = vecFamily(v);
      const want = t === GT.VECTOR3 || t === GT.VECTOR3I ? 3 : 2;
      if (fam === 0) return strict ? V.nil() : mkVec(t, 0, 0, 0);
      if (strict && fam !== want) return V.nil();
      const xyz = vecOf(v) as [number, number, number];
      return mkVec(t, xyz[0], xyz[1], xyz[2]);
    }
    case GT.COLOR: {
      if (v.t === Tag.OBJECT && v.v instanceof GColor) return v;
      if (v.t === Tag.INT) return colorFromInt(intToBig(v.v as IntPayload));
      if (v.t === Tag.STRING || v.t === Tag.STRING_NAME) {
        throw new UnsupportedError("convert-color-string", "convert() 的字符串转 Color 走 #rrggbb 与颜色名两套（实测 \"abc\" → (0.6667, 0.7333, 0.8, 1.0)），颜色名表没量过，先不猜");
      }
      return strict ? V.nil() : V.object(new GColor(0, 0, 0, 1));
    }
    case GT.ARRAY:
      if (v.t === Tag.ARRAY) return v;
      if (v.t === Tag.OBJECT && v.v instanceof GBytes) return V.array(GArray.of(packItems(v.v as GBytes)));
      return strict ? V.nil() : V.array(GArray.of([]));
    case GT.DICT:
      if (v.t === Tag.DICT) return v;
      return strict ? V.nil() : V.dict(new GDict());
    default:
      throw new UnsupportedError("convert-target", `${strict ? "convert" : "type_convert"}() 的目标 TYPE_${t} 我们没那个形状（实测引擎给得出值，如 Rect2 是 typeof 7、Quaternion 是 15）`);
  }
}
