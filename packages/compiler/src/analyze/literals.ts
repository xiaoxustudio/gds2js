import { staticMemberFn } from "../lower/ir";
import { ELEM_FACES, NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import type { AnalysisResult, Diagnostic } from "./analysis-result";
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

import { type DictKey, type StaticType } from "./state";
import { slotSource } from "./slots";
import { valueCtorType } from "./arity";

export function literalFaceText(e: Expr, kind: string): string {
  if (e.kind === "array") {
    for (const it of e.items) if (slotSource(it) !== "int") return kind;
    return "Array[int]";
  }
  if (e.kind === "dict") {
    for (const en of e.entries) if (slotSource(en.key) !== "int") return kind;
    return "Dictionary[int, Variant]";
  }
  return kind;
}

export function typedFaceText(name: string): string {
  const open = name.indexOf("[");
  const closed = name.trimEnd();
  if (open < 0 || !closed.endsWith("]")) return name.trim();
  const base = name.slice(0, open).trim();
  const body = closed.slice(open + 1, closed.length - 1);
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  const mapped = parts.map((p) => typedFaceText(p.trim()));
  if (mapped.length > 0 && mapped.every((p) => p === "Variant")) return base;
  return `${base}[${mapped.join(", ")}]`;
}

/** 桶判据折成一个字符串：`-0.0` 与 `0.0` 同键（`${-0}` 出的就是 `"0"`），`nan` / `inf` / `-inf` 各成一格且**自己与自己同键**（实测 `nan` 那格引擎照拒）。 */
export function dictKeyToken(k: DictKey): string {
  switch (k.t) {
    case "int":
      return `i:${k.v}`;
    case "float":
      return `f:${k.v}`;
    case "str":
      return `s:${k.v}`;
    case "bool":
      return `b:${k.v ? 1 : 0}`;
    case "null":
      return "n";
    case "vec":
      return `v:${k.name}:${k.xs.join(",")}`;
    case "np":
      return `p:${k.v}`;
  }
}

/** 文案里的键文本就是 `str(键)`：`0.0` 藏号（实测 `-0.0` 那格引擎报的是 `Key "0.0"`）、String 与 StringName 都不带引号、null 是 `<null>`。 */
export function dictKeyText(k: DictKey): string {
  switch (k.t) {
    case "int":
      return String(k.v);
    case "float":
      return floatText(k.v);
    case "str":
      return k.v;
    case "bool":
      return k.v ? "true" : "false";
    case "null":
      return "<null>";
    case "vec":
      return `(${k.xs.map(floatText).join(", ")})`;
    case "np":
      return k.v;
  }
}

export function floatText(v: number): string {
  return Object.is(v, -0) ? strFloat(0) : strFloat(v);
}

export function isNum(t: StaticType): boolean {
  return t === "int" || t === "float";
}

export function isNegativeLiteral(e: Expr): boolean {
  if (e.kind === "lit" && (e.lit === "int" || e.lit === "float")) return Number(e.value) < 0;
  if (e.kind === "unary" && e.op === "-") return true;
  return false;
}

export function isLiteralOperand(e: Expr): boolean {
  return e.kind === "lit" || e.kind === "array" || e.kind === "dict" || valueCtorType(e) !== null;
}

export function nonNumericLiteral(e: Expr): string | null {
  if (e.kind === "lit") {
    if (e.lit === "string") return "String";
    if (e.lit === "string_name") return "StringName";
    if (e.lit === "node_path") return "NodePath";
    if (e.lit === "null") return "null";
    return null;
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "call" && e.callee.kind === "ident" && NUMERIC_VALUE_CTORS.has(e.callee.name)) return e.callee.name;
  return null;
}

export function numericLiteralKind(e: Expr): "int" | "float" | null {
  if (e.kind !== "lit") return null;
  if (e.lit === "int") return "int";
  if (e.lit === "float") return "float";
  return null;
}
