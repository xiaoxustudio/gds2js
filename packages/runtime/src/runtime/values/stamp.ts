import { GodotRuntimeError, UnsupportedError } from "../errors";
import { Tag, tagName, type Variant } from "../tags";
import { GArray, GDict } from "./containers";
import { type ElemKind } from "./core";

export function isElemKind(name: string): name is ElemKind {
  return (
    name === "int" || name === "float" || name === "bool" || name === "String" ||
    name === "StringName" ||
    name === "Vector2" ||
    name === "Vector3" ||
    name === "Vector4" ||
    name === "Vector4i" ||
    name === "Vector2i" ||
    name === "Vector3i" ||
    name === "Color" ||
    name === "Array" ||
    name === "Dictionary"
  );
}

/** `Array[类名]` 标注那一族（S615 量了 `Array[RefCounted]` / `Array[Object]` / `Array[Node]`）：元素按 Object 收，类名照标注挂。 */
export function stampClassArray(v: Variant, cls: string, fromLiteral: boolean): Variant {
  return stampArray(v, "Object", fromLiteral, cls);
}

export function stampScriptArray(v: Variant, name: string, nativeBase: string, fromLiteral: boolean): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${name}] 的初值不是数组`);
  if (!fromLiteral) return assignContainer(v, `Array[${name}]`);
  g.stampElem("Object");
  g.className = nativeBase;
  g.scriptName = name;
  return v;
}

export function arrayTypeLabel(g: GArray): string {
  if (g.elem === null) return "Array";
  const name = g.scriptName !== "" ? g.scriptName : g.className;
  return `Array[${name === "" ? g.elem : name}]`;
}

/** `word` 是不带冠词的引擎拼法（S619 实参位那两句要用）。 */
export function containerFace(v: Variant): { word: string; label: string } | null {
  if (v.t === Tag.ARRAY) return { word: "array", label: arrayTypeLabel(v.v as GArray) };
  if (v.t === Tag.DICT) return { word: "dictionary", label: (v.v as GDict).typeLabel() };
  return null;
}

function needSameFace(v: Variant, target: string, say: (word: string, src: string) => string): Variant {
  const c = containerFace(v);
  if (c === null) throw new UnsupportedError("typed-assign", `定形容器的槽位只实测过 Array 与 Dictionary 源（收到 ${tagName(v.t)}）`);
  if (c.label === target) return v;
  throw new GodotRuntimeError("typed-assign", say(c.word === "array" ? "an array" : "a dictionary", c.label));
}

export function assignContainer(v: Variant, target: string): Variant {
  return needSameFace(v, target, (word, src) => `Trying to assign ${word} of type "${src}" to a variable of type "${target}".`);
}

export function returnContainer(v: Variant, target: string): Variant {
  return needSameFace(v, target, (word, src) => `Trying to return ${word} of type "${src}" where expected return type is "${target}".`);
}

export function stampArray(v: Variant, kind: ElemKind, fromLiteral: boolean, cls = ""): Variant {
  const g = v.t === Tag.ARRAY ? (v.v as GArray) : null;
  if (g === null) throw new UnsupportedError("typed-assign", `Array[${kind}] 的初值不是数组`);
  const target = `Array[${cls === "" ? kind : cls}]`;
  if (!fromLiteral) return assignContainer(v, target);
  g.stampElem(kind);
  g.className = cls;
  return v;
}

export function stampDict(v: Variant, k: ElemKind, val: ElemKind, fromLiteral: boolean): Variant {
  const d = v.t === Tag.DICT ? (v.v as GDict) : null;
  if (d === null) throw new UnsupportedError("typed-assign", `Dictionary[${k}, ${val}] 的初值不是字典`);
  if (!fromLiteral) return assignContainer(v, `Dictionary[${k}, ${val}]`);
  d.stampElem(k, val);
  return v;
}
