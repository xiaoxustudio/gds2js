import { staticMemberFn } from "../lower/ir";
import { ELEM_FACES, NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import type { AnalysisResult, Diagnostic } from "../analyze/analysis-result";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_INSTANCE_PROPS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, BUILTIN_TYPE_NAMES, FACE_CTOR_LITERAL, JOIN_BAD_ARG, UTILITY_ARITY } from "../semantics/builtin-members";
import { OP_PAIRS_CONST_A, OP_PAIRS_CONST_B, OP_PAIRS_REFUSED_A, OP_PAIRS_REFUSED_B, OP_PAIRS_REFUSED_CALLABLE, OP_PAIRS_REFUSED_DECL, OP_PAIRS_REFUSED_DECL_VAL, OP_PAIRS_REFUSED_DECL_VAL_REV } from "../semantics/op-pairs";
import { ANNOT_SOURCES, ARG_NAME_TYPES, FACE_ANNOTATIONS, INSTANCE_OF_TYPE_LAST, NUMERIC_VALUE_CTORS, OBJECT_ARG_NAMES, PACK_APPEND_ARRAY_AS, PACK_APPEND_NAMED, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_SHAPE_NAMES, PACK_TYPE_NAMES, PARAM_OWN_SLOTS, PCT_MSG, PCT_NUMERIC, PCT_VALUE_CTORS, PCT_VECTORS, SIGNAL_PARSE_MISSING, STATIC_VALUE_TYPES, VALUE_ARG_WANTS } from "../semantics/elem-faces";
import { CALLABLE_PARSE_ARGS, CALLABLE_PARSE_ARITY, HOST_VALUE_METHODS, NO_HOST_VALUE_METHODS, SIGNAL_PARSE_ARITY_MAX, VIRTUAL_HOST_NAMES, VOID_ARRAY_METHODS, VOID_BYTES_METHODS, VOID_CALLABLE_METHODS, VOID_DICT_METHODS, VOID_OBJECT_METHODS, VOID_SIGNAL_METHODS } from "../semantics/void-methods";
import { CTOR_REFUSED, CUBIC_NAME_ARG_FUNCS, FUNC_ARG_SLOTS, GLOBAL_NUM_ARITH, GLOBAL_TYPED_NAME_ARGS, NODE_PATH_FACE, STATIC_FACE, STRINGNAME_FACE, type NamedFace } from "../semantics/faces";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "../semantics/arg-types/static-arg-types";
import { FACE_ARG_AS, FACE_ARG_TYPES } from "../semantics/arg-types/face-arg-types";
import { INSTANCE_ARG_AS, INSTANCE_ARG_TYPES } from "../semantics/arg-types/instance-arg-types";
import { isGlobalConst } from "../lower/globals";
import {
  ARG_TYPE_FOLLOWS_FIRST,
  DERIVED_ARG_TYPES,
  GLOBAL_ARG_AS,
  GLOBAL_ARG_BOOL_REFUSED,
  GLOBAL_ARG_FOLLOWS_BOOL,
  GLOBAL_ARG_SENTENCE,
  GLOBAL_ARG_SUPPRESS_OTHER,
  GLOBAL_ARG_SHOULD_BE,
  GLOBAL_ARG_TYPES,
  GLOBAL_ARG_VARARG,
} from "../semantics/arg-types/global-arg-types";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { GLOBAL_CALLABLES, GLOBAL_VALUE_NAMES } from "@gds2js/runtime/runtime/global-names";
import {
  ARRAY_METHOD_ARITY,
  DICT_METHOD_ARITY,
  NODE_PATH_METHOD_ARITY,
  PACK_METHOD_ARITY,
  PACK_METHOD_ARITY_WITH_BYTES,
  STRING_METHOD_ARITY,
  STRING_NAME_METHOD_ARITY,
  VALUE_METHOD_ARITY,
  valueAttrKind,
} from "@gds2js/runtime/runtime/face-arity";
import { strFloat } from "@gds2js/runtime/runtime/numfmt";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/color-named";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";

import { type StaticType, capKey, parseTyped, run } from "./state";
import { canHold, varSlotHolds } from "./slots";
import { flattenBody, reassignedNames } from "./walk";
import { isNum, typedFaceText } from "./literals";
import { instanceFaceManaged } from "./arity";
import { checkValueMethodArity } from "./checks-calls";

export function readFaceOf(decl: string, keyType: StaticType): string | null {
  const slot = parseTyped(decl);
  if (slot === null) return null;
  if (slot.kind === "Array") {
    if (keyType !== null && keyType !== "int") return null;
    return slot.elem !== undefined && ELEM_FACES.has(slot.elem) ? slot.elem : null;
  }
  if (slot.key === undefined || slot.val === undefined || !ELEM_FACES.has(slot.val)) return null;
  if (keyType !== null && !canHold(slot.key, keyType)) return null;
  return slot.val;
}

export function holdsParamDefault(slot: string, st: string): boolean {
  if (slot === st) return true;
  if (slot === "int" || slot === "float" || slot === "bool") return st === "int" || st === "float" || st === "bool";
  if (slot === "String") return st === "String" || st === "StringName" || st === "NodePath";
  if (slot === "StringName") return st === "String" || st === "StringName";
  if (slot === "NodePath") return st === "String" || st === "NodePath";
  if (PARAM_OWN_SLOTS.has(slot)) return false;
  if (st === "Array" || st === "Dictionary" || st === "NodePath") return false;
  return varSlotHolds(slot, st as NonNullable<StaticType>) === true;
}

/** 标量标注 → `staticType` 那一套名字；认不出来的（引擎类、Variant）一律不管，交运行时。 */
export function scalarStaticName(name: string): string | null {
  if (/^Array\[/.test(name)) return "Array";
  if (/^Dictionary\[/.test(name)) return "Dictionary";
  switch (name) {
    case "int":
    case "float":
    case "bool":
    case "String":
    case "StringName":
    case "Vector2":
    case "Vector3":
    case "Vector2i":
    case "Vector3i":
    case "Color":
      return name;
    default:
      return null;
  }
}

export function stringNameVars(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const x of node) stringNameVars(x, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (obj.kind === "var") {
    const type = obj.type as TypeRef | null;
    if (type !== null && type.kind === "named" && type.name === "StringName" && typeof obj.name === "string") out.add(obj.name);
  }
  for (const key of Object.keys(obj)) {
    if (key === "loc") continue;
    stringNameVars(obj[key], out);
  }
}

export function staticTypeName(e: Expr): string | null {
  if (e.kind === "lit") {
    return (
      { int: "int", float: "float", bool: "bool", string: "String", string_name: "StringName" } as Record<
        string,
        string
      >
    )[e.lit] ?? null;
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "call" && e.callee.kind === "ident" && STATIC_VALUE_TYPES.has(e.callee.name)) {
    return e.callee.name;
  }
  return null;
}

/** 标注型名去掉定形部分：`Array[int]` 的基是 `Array`（成员判定按基型，印出去的是标注原文）。 */
export function argFaceBase(t: string): string {
  const open = t.indexOf("[");
  return open < 0 ? t : t.slice(0, open);
}

export function argNameOf(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  if (t.name.includes("[") && !t.name.includes("]")) return null;
  const text = t.name.includes("[") ? typedFaceText(t.name) : t.name;
  return ARG_NAME_TYPES.has(argFaceBase(text)) ? text : null;
}

export function argNameScopes(m: Module): Map<Stmt[], Map<string, string>> {
  const plain = argNameOf;
  const out = new Map<Stmt[], Map<string, string>>();
  const collect = (funcs: FuncDecl[], fields: Map<string, string>): void => {
    for (const f of funcs) {
      const ann = new Map(fields);
      for (const p of f.params) {
        const t = plain(p.type);
        if (t !== null) ann.set(p.name, t);
      }
      for (const n of flattenBody(f.body)) {
        if (n.kind !== "var" || typeof n.name !== "string") continue;
        const t = plain(n.type as TypeRef | null);
        if (t !== null) ann.set(n.name, t);
      }
      out.set(f.body, ann);
    }
  };
  const moduleNames = new Map<string, string>();
  for (const v of m.vars) {
    const t = plain(v.type);
    if (t !== null) moduleNames.set(v.name, t);
  }
  collect(m.funcs, moduleNames);
  const collectClass = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    for (const v of c.vars) {
      const t = plain(v.type);
      if (t !== null) fields.set(v.name, t);
    }
    collect(c.funcs, fields);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

export function argNameType(e: Expr | undefined, ann: Map<string, string>): string | null {
  if (e === undefined || e.kind !== "ident" || typeof e.name !== "string") return null;
  return ann.get(e.name) ?? null;
}

export function faceReceiverNames(
  nodes: Record<string, unknown>[],
  seeded: Map<string, "annot" | "inferred">,
  assigned: Set<string>,
  type: string,
  isInit: (init: Expr) => boolean,
  annotOnly = false,
  texts?: Map<string, string>,
): Set<string> {
  const named = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name.replace(/\[.*\]$/, "") === type;
  const out = new Set<string>();
  for (const [name, how] of seeded) {
    if (how === "annot") out.add(name);
    else if (!annotOnly && !assigned.has(name)) out.add(name);
  }
  const reassigned = reassignedNames(nodes);
  for (const n of nodes) {
    if (n.kind !== "var" || typeof n.name !== "string") continue;
    if (reassigned.has(n.name)) {
      out.delete(n.name);
      continue;
    }
    if (named(n.type as TypeRef | null)) {
      out.add(n.name);
      if (texts !== undefined) {
        const t = n.type as TypeRef | null;
        if (t !== null && t.kind === "named") texts.set(n.name, t.name);
      }
      continue;
    }
    const init = n.init as Expr | null;
    if (!annotOnly && n.type === null && init !== null && isInit(init)) out.add(n.name);
    else if (init === null || !isInit(init) || annotOnly) {
      if (annotOnly && named(n.type as TypeRef | null)) continue;
      out.delete(n.name);
    }
  }
  return out;
}

/** 每个函数体一份「外面证得出的名字」：顶层函数拿模块级那批，内部类的方法拿自己类的字段 ——
 *  内部类能否看见模块级名字没量过，照 `checkValueMethodArity` 的同一口径不给（宁可漏拦也不误拦）。 */
export function faceScopes(
  m: Module,
  type: string,
  isInit: (init: Expr) => boolean,
): Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred">; body: Stmt[]; texts: Map<string, string> }> {
  const named = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name.replace(/\[.*\]$/, "") === type;
  const annText = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" ? t.name : null);
  const moduleNames = new Map<string, "annot" | "inferred">();
  const moduleTexts = new Map<string, string>();
  for (const v of m.vars) {
    if (named(v.type)) {
      moduleNames.set(v.name, "annot");
      const txt = annText(v.type);
      if (txt !== null) moduleTexts.set(v.name, txt);
    } else if (v.type === null && v.init !== null && isInit(v.init)) moduleNames.set(v.name, "inferred");
  }

  const out: Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred">; body: Stmt[]; texts: Map<string, string> }> = [];
  const collect = (funcs: FuncDecl[], seededBase: Map<string, "annot" | "inferred">, textsBase: Map<string, string>): void => {
    for (const f of funcs) {
      const seeded = new Map(seededBase);
      const texts = new Map(textsBase);
      for (const p of f.params) {
        if (named(p.type)) {
          seeded.set(p.name, "annot");
          const txt = annText(p.type);
          if (txt !== null) texts.set(p.name, txt);
        }
      }
      out.push({ nodes: flattenBody(f.body), seeded, body: f.body, texts });
    }
  };
  collect(m.funcs, moduleNames, moduleTexts);

  const collectClass = (c: ClassDecl): void => {
    const fields = new Map<string, "annot" | "inferred">();
    const fieldTexts = new Map<string, string>();
    for (const v of c.vars) {
      if (named(v.type)) {
        fields.set(v.name, "annot");
        const txt = annText(v.type);
        if (txt !== null) fieldTexts.set(v.name, txt);
      } else if (v.type === null && v.init !== null && isInit(v.init)) fields.set(v.name, "inferred");
    }
    collect(c.funcs, fields, fieldTexts);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

export function packFaceRecv(obj: Record<string, unknown> | undefined, ann: Map<string, string>): string | null {
  if (obj === undefined) return null;
  if (obj.kind === "ident" && typeof obj.name === "string") return ann.get(obj.name) ?? null;
  if (obj.kind === "call") {
    const inner = obj.callee as Record<string, unknown> | undefined;
    const cn = inner?.kind === "ident" ? inner.name : null;
    if (typeof cn === "string" && PACK_TYPE_NAMES.has(cn)) return cn;
  }
  return null;
}

export function chainFaceKnown(rt: string): boolean {
  return rt in VALUE_METHOD_ARITY || rt === "String" || rt === "StringName" || rt === "NodePath";
}

export function knownFaceAnnotation(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return base === "String" || base === "StringName" || base === "NodePath" || base === "Array" || base === "Dictionary" ||
    PACK_TYPE_NAMES.has(base) || base in VALUE_METHOD_ARITY ? base : null;
}

export function chainRecvFace(e: Expr, ownerOf: (x: Expr) => string | null): string | null {
  if (e.kind !== "call" || e.callee.kind !== "attribute") return null;
  const owner = ownerOf(e.callee.obj);
  if (owner === null) return null;
  const by = BUILTIN_METHOD_RETURNS[owner];
  if (by === undefined) return null;
  const name = e.callee.name;
  if (typeof name !== "string") return null;
  const rt = by[name];
  return typeof rt === "string" && chainFaceKnown(rt) ? rt : null;
}

export function attrFaceRecv(obj: Record<string, unknown> | undefined, ann: Map<string, string>, elems: Map<string, string> = new Map(), mods: Map<string, string> = new Map()): string | null {
  if (obj === undefined) return null;
  if (obj.kind === "index") {
    const base = obj.obj as Record<string, unknown> | undefined;
    if (base === undefined || base.kind !== "ident" || typeof base.name !== "string") return null;
    return readFaceOf(elems.get(base.name) ?? "", staticType(obj.index as Expr));
  }
  if (obj.kind === "ident" && typeof obj.name === "string") {
    const face = ann.get(obj.name) ?? mods.get(obj.name) ?? null;
    return face === "Dictionary" ? null : face;
  }
  if (obj.kind === "array") return "Array";
  if (obj.kind === "lit" && obj.lit === "string") return "String";
  if (obj.kind === "call") {
    const inner = obj.callee as Record<string, unknown> | undefined;
    const cn = inner?.kind === "ident" ? inner.name : null;
    if (typeof cn === "string" && (cn === "Array" || cn === "String" || cn === "StringName" || cn === "NodePath" || cn in VALUE_METHOD_ARITY)) return cn;
    if (inner !== undefined && inner.kind === "attribute") {
      const owner = attrFaceRecv(inner.obj as Record<string, unknown>, ann, elems, mods);
      const mname = inner.name;
      if (owner !== null && typeof mname === "string") {
        const by = BUILTIN_METHOD_RETURNS[owner];
        const rt = by === undefined ? undefined : by[mname];
        if (typeof rt === "string" && (instanceFaceManaged(rt) || chainFaceKnown(rt))) return rt;
      }
    }
  }
  if (obj.kind === "attribute") {
    const owner = attrFaceRecv(obj.obj as Record<string, unknown> | undefined, ann, elems, mods);
    const nm = obj.name;
    if (owner !== null && typeof nm === "string") {
      const by = BUILTIN_MEMBER_TYPES[owner];
      const t = by === undefined ? undefined : by[nm];
      if (typeof t === "string" && (instanceFaceManaged(t) || t === "String")) return t;
    }
    return null;
  }
  if (obj.kind === "lit" && (obj.lit === "string_name" || obj.lit === "node_path")) {
    return obj.lit === "string_name" ? "StringName" : "NodePath";
  }
  return packFaceRecv(obj, ann);
}

/** 属性那一形的静态接收者多一处**形参标注**（读数 `tmp/probe-bincall/compare6.txt` 的 N1 / N2 / N3 / N4 四格与 var 标注一字一样），
 *  所以要带着每个函数体的形参表；调用那一支不扩，仍按 S414 量过的 var 标注 + 构造位。 */
export function attrScopes(m: Module): Array<{ nodes: Record<string, unknown>[]; params: Array<{ name: string; type: TypeRef | null }> }> {
  const out: Array<{ nodes: Record<string, unknown>[]; params: Array<{ name: string; type: TypeRef | null }> }> = [];
  for (const f of m.funcs) out.push({ nodes: flattenBody(f.body), params: f.params });
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) out.push({ nodes: flattenBody(f.body), params: f.params });
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  return out;
}

export function ctorRecvFace(e: Record<string, unknown>, face: NamedFace): boolean {
  if (face.ctorRecv !== true || e.kind !== "call") return false;
  const callee = e.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "ident" || callee.name !== face.type) return false;
  const args = e.args as Record<string, unknown>[] | undefined;
  const first = args?.[0] as Record<string, unknown> | undefined;
  return args?.length === 1 && first !== undefined && first.kind === "lit" && first.lit === "string";
}

export function staticType(e: Expr): StaticType {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int") return "int";
      if (e.lit === "float") return "float";
      if (e.lit === "string" || e.lit === "string_name") return "String";
      if (e.lit === "node_path") return null;
      if (e.lit === "bool") return "bool";
      return "null";
    case "array":
      return "Array";
    case "dict":
      return "Dictionary";
    case "unary": {
      const t = staticType(e.operand);
      if (e.op === "not") return "bool";
      if (e.op === "-" && (t === "int" || t === "float")) return t;
      return null;
    }
    case "binary": {
      const l = staticType(e.left);
      const r = staticType(e.right);
      if (e.op === "+" && (l === "String" || r === "String")) return "String";
      if (e.op === "+" && (l === "Array" || r === "Array")) return "Array";
      if (l === "int" && r === "int") return "int";
      if (isNum(l) && isNum(r)) return "float";
      return null;
    }
    case "call": {
      if (e.callee.kind === "ident" && STATIC_VALUE_TYPES.has(e.callee.name)) return e.callee.name as StaticType;
      return null;
    }
    default:
      return null;
  }
}

export function valueTypeAnnotation(t: TypeRef | null): string | null {
  return t !== null && t.kind === "named" && t.name in VALUE_METHOD_ARITY ? t.name : null;
}

export function staticFaceConstName(t: string, name: string): boolean {
  const face = STATIC_FACE[t];
  if (face === undefined) return false;
  return face.consts.includes(name) || face.axis.includes(name) || (t === "Color" && COLOR_NAMED[name.toLowerCase()] !== undefined);
}

export function literalFaceType(e: Expr, faceTyped: Map<string, string>): string | null {
  if (e.kind === "lit") return e.lit === "string" ? "String" : null;
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "ident") return faceTyped.get(e.name) ?? null;
  return null;
}

export function literalTypeName(e: Expr | undefined): string | null {
  if (e === undefined) return null;
  if (e.kind === "lit") {
    switch (e.lit) {
      case "int":
        return "int";
      case "float":
        return "float";
      case "bool":
        return "bool";
      case "null":
        return "null";
      case "string":
        return "String";
      case "string_name":
        return "StringName";
      case "node_path":
        return "NodePath";
      default:
        return null;
    }
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "lambda") return "Callable";
  if (e.kind === "call" && e.callee.kind === "ident" && (NUMERIC_VALUE_CTORS.has(e.callee.name) || PACK_TYPE_NAMES.has(e.callee.name))) return e.callee.name;
  return null;
}

/** 发射器读的那张表：这一支 lambda 创建时要按值影子化的局部名。 */
export function lambdaCaptureNames(e: Expr): string[] {
  if (e.kind !== "lambda" || e.loc === null) return [];
  return run.lambdaCaptures.get(capKey(run, e.loc.line, e.loc.col)) ?? [];
}
