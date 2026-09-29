import { toBool, toFloat, strOf, toInt } from "./builtins";
import { GodotRuntimeError, UnsupportedError } from "./errors";
import { classNameOf, nativeBaseOf } from "./object";
import { Tag, type Variant } from "./tags";
import { valueTypeName } from "./values";
import { colorNew } from "./color";
import { toVec2 } from "./vector2";
import { vector2iNew } from "./vector2i";

/**
 * 定目标量**形参**的入口槽位（S176，`tmp/f55-matrix.txt` 是 7 槽 × 13 来源的整张对拍表）。
 *
 * 这一格比变量 / 字段赋值**严**：`func g(a: int)` 收到 String 时 Godot 不转换，而是在函数入口抛
 * `Invalid type in function 'g' in base 'RefCounted (A)'. Cannot convert argument 1 from String to int.`
 * 而收到 float / bool 又确实转换（2.7 → 2、true → 1、1e30 → int64 最小值）。
 * 所以「谁能塞进哪个槽」只能是一张实测表，S150 那张转换表在这里不成立。
 *
 * 表里没有的组合一律抛那句话；**量到可以转但我们还没有对应实现的**（`Color` 槽吃 `int` 的 packed RGBA 解析）
 * 走 `UnsupportedError` 响亮拒 —— 静默少转一格正是这个项目一路在挡的事。
 * 槽类型本身不在表里的（`Vector3` / `StringName` / 类名……）原样透传：那一整格还没量，
 * 不猜转换、也不误拒合法的同类实参，量完再补。
 */
const PARAM_SLOTS: Record<string, { from: string[]; cast: (v: Variant) => Variant }> = {
  int: { from: ["int", "float", "bool"], cast: toInt },
  float: { from: ["int", "float", "bool"], cast: toFloat },
  bool: { from: ["int", "float", "bool"], cast: toBool },
  String: { from: ["String", "StringName"], cast: strOf },
  Vector2: { from: ["Vector2", "Vector2i"], cast: toVec2 },
  Vector2i: { from: ["Vector2i", "Vector2"], cast: (v) => vector2iNew([v]) },
  Color: { from: ["Color", "String"], cast: (v) => colorNew([v]) },
};

/** Godot 在报错文本里管 null 叫 `Nil`，与我们内部的 `nil` 不同名。 */
function argLabel(v: Variant): string {
  return v.t === Tag.NIL ? "Nil" : valueTypeName(v);
}

/** 报错文本里的 `RefCounted (A)`：原生基类 + 脚本类名，与对象打印 / `get_class()` 同一批登记（S167）。 */
function baseLabel(self: unknown): string {
  const cls = classNameOf(self);
  const native = nativeBaseOf(self);
  if (native !== null && cls !== null) return `${native} (${cls})`;
  if (native !== null) return native;
  if (cls !== null) return cls;
  throw new UnsupportedError("param-slot-base", "形参槽位报错还不知道这个对象的基类标签");
}

export function paramSlot(v: Variant, slot: string, index: number, fn: string, self: unknown): Variant {
  const rule = PARAM_SLOTS[slot];
  if (rule === undefined) return v;
  const from = argLabel(v);
  if (rule.from.includes(from)) return from === slot ? v : rule.cast(v);
  // 实测 `Color(1)` → (0.0, 0.0, 0.0, 0.0039)（int 当 packed RGBA 解析），Color 槽同样吃 int；
  // 那条解析运行时还没实现 —— 响亮拒，不能悄悄把 int 塞进 Color 槽。
  if (slot === "Color" && from === "int") {
    throw new UnsupportedError("param-slot-cast", "Color 槽吃 int（packed RGBA 解析）实测成立，但运行时还没实现这条转换");
  }
  throw new GodotRuntimeError("param-slot", paramSlotErrorText(fn, self, index, from, slot));
}

/** 量到「Godot 直接抛」的组合时用的那句话；抽出来好让语义与 `paramSlot` 的分支共用一份口径。 */
export function paramSlotErrorText(fn: string, self: unknown, index: number, from: string, slot: string): string {
  return `Invalid type in function '${fn}' in base '${baseLabel(self)}'. Cannot convert argument ${index} from ${from} to ${slot}.`;
}
