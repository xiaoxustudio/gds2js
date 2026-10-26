import { toBool, toFloat, strOf, toInt } from "./builtins";
import { GodotRuntimeError, UnsupportedError } from "./errors";
import { classNameOf, nativeBaseOf, scriptLabelOf } from "./object";
import { Tag, tagName, V, type Variant } from "./tags";
import { containerFace, valueTypeName } from "./values";
import { colorNew } from "./color";
import { toVec2 } from "./vector2";
import { vector2iNew } from "./vector2i";
import { toVec3, toVec3i } from "./vector3i";

const PARAM_SLOTS: Record<string, { from: string[]; cast: (v: Variant) => Variant }> = {
  int: { from: ["int", "float", "bool"], cast: toInt },
  float: { from: ["int", "float", "bool"], cast: toFloat },
  bool: { from: ["int", "float", "bool"], cast: toBool },
  String: { from: ["String", "StringName"], cast: strOf },
  StringName: { from: ["StringName", "String"], cast: (v) => V.stringName(v.v as string) },
  Vector2: { from: ["Vector2", "Vector2i"], cast: toVec2 },
  Vector2i: { from: ["Vector2i", "Vector2"], cast: (v) => vector2iNew([v]) },
  Vector3: { from: ["Vector3", "Vector3i"], cast: toVec3 },
  Vector3i: { from: ["Vector3i", "Vector3"], cast: toVec3i },
  Color: { from: ["Color", "String", "int"], cast: (v) => colorNew([v]) },
};

function argLabel(v: Variant): string {
  return v.t === Tag.NIL ? "Nil" : valueTypeName(v);
}

function baseLabel(self: unknown): string {
  const cls = scriptLabelOf(self) ?? classNameOf(self);
  const native = nativeBaseOf(self);
  if (native !== null && cls !== null) return `${native} (${cls})`;
  if (native !== null) return native;
  if (cls !== null) return cls;
  throw new UnsupportedError("param-slot-base", "形参槽位报错还不知道这个对象的基类标签");
}

export function paramContainer(v: Variant, target: string, index: number, fn: string, self: unknown): Variant {
  const c = containerFace(v);
  if (c === null) throw new UnsupportedError("param-slot", `定形容器的实参位只实测过 Array 与 Dictionary 源（收到 ${tagName(v.t)}）`);
  if (c.label === target) return v;
  throw new GodotRuntimeError(
    "param-slot",
    `Invalid type in function '${fn}' in base '${baseLabel(self)}'. The ${c.word} of argument ${String(index)} (${c.label}) does not have the same element type as the expected typed ${c.word} argument.`,
  );
}

export function paramSlot(v: Variant, slot: string, index: number, fn: string, self: unknown): Variant {
  const rule = PARAM_SLOTS[slot];
  if (rule === undefined) return v;
  const from = argLabel(v);
  if (rule.from.includes(from)) return from === slot ? v : rule.cast(v);
  throw new GodotRuntimeError("param-slot", paramSlotErrorText(fn, self, index, from, slot));
}

/** 槽位收不下某个实参时 Godot 抛的那句话；抽出来好让语义与 `paramSlot` 的分支共用一份口径。 */
export function paramSlotErrorText(fn: string, self: unknown, index: number, from: string, slot: string): string {
  return `Invalid type in function '${fn}' in base '${baseLabel(self)}'. Cannot convert argument ${index} from ${from} to ${slot}.`;
}
