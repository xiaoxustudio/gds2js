import type { Diagnostic } from "../analysis-result";
import type { StaticType } from "../state";
import type { ClassDecl, Expr, FuncDecl, Module, Stmt, TypeRef } from "../../lower/ir";
import { isGlobalEnumName } from "../../lower/globals";
import { slotSource, valueSlotHolds } from "../slots";

const NUMERIC = new Set(["int", "float", "bool"]);
const STRINGY = new Set(["String", "StringName"]);
const VALUE_FACES = new Set([
  ...NUMERIC,
  ...STRINGY,
  "Vector2",
  "Vector2i",
  "Vector3",
  "Vector3i",
  "Vector4",
  "Vector4i",
  "Color",
  "Rect2",
  "Rect2i",
  "AABB",
  "Plane",
  "Quaternion",
  "Transform2D",
  "Transform3D",
  "Projection",
  "Basis",
]);

function targetOf(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const name = t.name;
  if (name === "Variant" || name === "Array" || name === "Dictionary" || name.startsWith("Array[") || name.startsWith("Dictionary[")) return null;
  return name;
}

function badReturn(target: string, st: string): boolean {
  if (isGlobalEnumName(target)) return st !== "int";
  if (NUMERIC.has(target)) return !NUMERIC.has(st);
  if (STRINGY.has(target)) return !STRINGY.has(st);
  if (VALUE_FACES.has(target)) {
    if (NUMERIC.has(st) || STRINGY.has(st) || st === "null" || st === "Array" || st === "Dictionary") return true;
    return !valueSlotHolds(target, st as NonNullable<StaticType>);
  }
  return st !== "null" && (NUMERIC.has(st) || STRINGY.has(st) || st === "Array" || st === "Dictionary" || VALUE_FACES.has(st));
}

function checkFunc(f: FuncDecl, diags: Diagnostic[]): void {
  const target = targetOf(f.returnType);
  if (target === null) return;
  const objectTarget = !isGlobalEnumName(target) && !VALUE_FACES.has(target);
  const locals = new Map<string, string>();
  const sourceOf = (e: Expr): string | null => {
    if (e.kind === "ident") return locals.get(e.name) ?? null;
    return slotSource(e);
  };
  const report = (st: string, loc: Diagnostic["loc"]): void => {
    if (!objectTarget) {
      diags.push({ code: "return-type-value", message: `Cannot return a value of type "${st}" as "${target}".`, loc });
    }
    diags.push({ code: "return-type", message: `Cannot return value of type "${st}" because the function return type is "${target}".`, loc });
  };
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "var":
        if (s.init !== null) {
          const ann = s.type !== null && s.type.kind === "named" ? (isGlobalEnumName(s.type.name) ? "int" : s.type.name) : null;
          const st = ann ?? slotSource(s.init);
          if (st !== null) locals.set(s.name, st);
        }
        return;
      case "if":
        for (const br of s.branches) br.body.forEach(stmt);
        return;
      case "for":
        s.body.forEach(stmt);
        return;
      case "while":
        s.body.forEach(stmt);
        return;
      case "match":
        for (const arm of s.arms) arm.body.forEach(stmt);
        return;
      case "return":
        if (s.value === null) return;
        {
          const st = sourceOf(s.value);
          if (st !== null && badReturn(target, st)) report(st, s.value.loc);
        }
        return;
      default:
        return;
    }
  };
  f.body.forEach(stmt);
}

function checkClass(c: ClassDecl, diags: Diagnostic[]): void {
  for (const f of c.funcs) checkFunc(f, diags);
  for (const inner of c.innerClasses) checkClass(inner, diags);
}

export function checkReturnTypes(m: Module, diags: Diagnostic[]): void {
  for (const f of m.funcs) checkFunc(f, diags);
  for (const c of m.innerClasses) checkClass(c, diags);
}
