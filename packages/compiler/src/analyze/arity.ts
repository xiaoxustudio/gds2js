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

import { argFaceBase, staticFaceConstName } from "./faces";

export function classFaceArity(t: string): Record<string, [number, number]> | undefined {
  if (t === "Array") return ARRAY_METHOD_ARITY;
  if (t === "String") return STRING_METHOD_ARITY;
  if (t === "StringName") return STRING_NAME_METHOD_ARITY;
  if (t === "NodePath") return NODE_PATH_METHOD_ARITY;
  if (t === "Dictionary") return DICT_METHOD_ARITY;
  return undefined;
}

/** 表里那一列认不认这个来源名：定形容器按基型查（S501，尺 `tmp/d6/s501a.py` 一百八十格） */
export function faceListHas(list: readonly string[], t: string): boolean {
  return list.includes(t) || (t.includes("[") && list.includes(argFaceBase(t)));
}

export function arityDiag(
  table: Record<string, [number, number]>,
  code: string,
  method: string,
  got: number,
  loc: Diagnostic["loc"],
): Diagnostic | null {
  const sig = table[method];
  if (sig === undefined) return null;
  if (got >= sig[0] && got <= sig[1]) return null;
  return {
    code,
    message:
      got < sig[0]
        ? `Too few arguments for "${method}()" call. Expected at least ${sig[0]} but received ${got}.`
        : `Too many arguments for "${method}()" call. Expected at most ${sig[1]} but received ${got}.`,
    loc,
  };
}

export function containerCallArity(
  n: Record<string, unknown>,
  table: Record<string, [number, number]>,
  code: string,
  names: Set<string>,
  isLiteral: (obj: Record<string, unknown>) => boolean,
): Diagnostic | null {
  if (n.kind !== "call") return null;
  const callee = n.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "attribute") return null;
  const obj = callee.obj as Record<string, unknown> | undefined;
  if (obj === undefined) return null;
  const proven = isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name));
  if (!proven) return null;
  const method = callee.name;
  if (typeof method !== "string") return null;
  return arityDiag(table, code, method, ((n.args as Expr[]) ?? []).length, (n.loc as Diagnostic["loc"]) ?? null);
}

export function faceGhostDiags(
  n: Record<string, unknown>,
  table: Record<string, [number, number]>,
  type: string,
  twoSentences: boolean,
  names: Set<string>,
  isLiteral: (obj: Record<string, unknown>) => boolean,
  texts?: Map<string, string>,
): Diagnostic[] {
  if (n.kind !== "call") return [];
  const callee = n.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "attribute") return [];
  const obj = callee.obj as Record<string, unknown> | undefined;
  if (obj === undefined) return [];
  if (!(isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name)))) return [];
  const method = callee.name;
  if (typeof method !== "string" || method in table) return [];
  const loc = (n.loc as Diagnostic["loc"]) ?? null;
  const shown = obj.kind === "ident" && typeof obj.name === "string" ? texts?.get(obj.name) ?? type : type;
  const out: Diagnostic[] = [];
  if (twoSentences) {
    out.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${shown}".`, loc });
  }
  out.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${shown}.`, loc });
  return out;
}

/** pack 那一面的表外名：不在 dump 的方法全集里就是那两句（S480，尺 `tmp/d6/ppack.py` 八十一格 + `tmp/d6/ppack2.py` 二百五十三格）。 */
export function memberNameAbsent(face: string, name: string): boolean {
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

/** 链子那一形的元数表与那句的 code：三面名字面另有三张表，其余（值型五支 + pack 九支）共用 `VALUE_METHOD_ARITY`。 */
export function chainArityFace(face: string): { table: Record<string, [number, number]>; code: string } | null {
  if (face === "String" || face === "StringName") return { table: face === "String" ? STRING_METHOD_ARITY : STRING_NAME_METHOD_ARITY, code: face === "String" ? "string-arity" : "string-name-arity" };
  if (face === "NodePath") return { table: NODE_PATH_METHOD_ARITY, code: "node-path-arity" };
  return { table: VALUE_METHOD_ARITY[face] ?? {}, code: "value-arity" };
}

export function instanceFaceManaged(face: string): boolean {
  if (face === "Array" || face === "Dictionary" || face === "StringName" || face === "NodePath" || PACK_TYPE_NAMES.has(face)) return false;
  return BUILTIN_INSTANCE_MEMBERS[face] !== undefined;
}

export function instanceMemberAbsent(face: string, name: string): boolean {
  if (!instanceFaceManaged(face) && face !== "String") return false;
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

export function builtinInstanceAbsent(face: string, name: string): boolean {
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

export function faceCtorLiteral(e: Expr): string | null {
  if (e.kind !== "call" || e.callee.kind !== "ident") return null;
  const face = FACE_CTOR_LITERAL[e.callee.name];
  if (face === undefined) return null;
  const args = e.args ?? [];
  if (args.length !== 1) return null;
  const a = args[0] as Expr;
  return a.kind === "lit" && a.lit === "string" ? face : null;
}

export function builtinArity(name: string, got: number): string | null {
  const ar = BUILTIN_ARITY[name];
  if (ar === undefined) return null;
  if (got >= ar[0] && got <= ar[1]) return null;
  return got < ar[0]
    ? `Too few arguments for "${name}()" call. Expected at least ${String(ar[0])} but received ${String(got)}.`
    : `Too many arguments for "${name}()" call. Expected at most ${String(ar[1])} but received ${String(got)}.`;
}

export function utilityArity(name: string, got: number): string | null {
  const u = UTILITY_ARITY[name];
  if (u === undefined) return null;
  const min = u[0];
  const max = u[1];
  const kind = u[2];
  if (got >= min && (max === null || got <= max)) return null;
  return `Invalid call to ${kind} "${name}()". Expected ${String(max !== null && got > max ? max : min)} argument(s).`;
}

export function builtinArityCode(name: string): string {
  if (name === "char") return "char-arity";
  if (name === "var_to_str") return "var-to-str-arity";
  if (name === "str_to_var") return "str-to-var-arity";
  if (name === "convert" || name === "type_convert") return "convert-arity";
  if (name === "range" || name === "str") return `${name}-arity`;
  return "builtin-arity";
}

export function valueCtorType(e: Expr | null): string | null {
  return e !== null && e.kind === "call" && e.callee.kind === "ident" && e.callee.name in VALUE_METHOD_ARITY
    ? e.callee.name
    : null;
}

/** 「类名.成员」的调用式：常量当函数调 / 静态函数元数 / 实例方法在类名上直接调 / 表外名字两句。 */
export function staticCallDiags(t: string, name: string, got: number): Array<{ code: string; message: string }> {
  const face = STATIC_FACE[t];
  const extra = classFaceArity(t);
  if (face === undefined && !PACK_TYPE_NAMES.has(t) && extra === undefined) return [];
  if (face !== undefined && staticFaceConstName(t, name)) {
    const shown = face.axis.includes(name) ? `${t}.Axis` : t;
    return [{ code: "static-const-call", message: `Name "${name}" called as a function but is a "${shown}".` }];
  }
  const sig = face?.statics[name];
  if (sig !== undefined) {
    if (got >= sig[0] && got <= sig[1]) return [];
    return [
      {
        code: "static-arity",
        message:
          got < sig[0]
            ? `Too few arguments for "${name}()" call. Expected at least ${sig[0]} but received ${got}.`
            : `Too many arguments for "${name}()" call. Expected at most ${sig[1]} but received ${got}.`,
      },
    ];
  }
  if (VALUE_METHOD_ARITY[t]?.[name] !== undefined || (extra !== undefined && name in extra)) {
    return [
      {
        code: "static-nonstatic-call",
        message: `Cannot call non-static function "${name}()" on the class "${t}" directly. Make an instance instead.`,
      },
    ];
  }
  return [
    { code: "static-member-unknown", message: `Cannot find member "${name}" in base "${t}".` },
    { code: "static-member-unknown", message: `Function "${name}()" not found in base ${t}.` },
  ];
}

/** 「类名.静态函数」当值引用（不调用）不是一等成员：引擎那句报两遍。 */
export function staticBareDiags(t: string, name: string): Array<{ code: string; message: string }> {
  if (name === "new" && BUILTIN_NEW_ABSENT_FACES.has(t)) {
    const one = `Cannot find member "new" in base "${t}".`;
    return [
      { code: "static-member-unknown", message: one },
      { code: "static-member-unknown", message: one },
    ];
  }
  const face = STATIC_FACE[t];
  if (face === undefined || face.statics[name] === undefined || staticFaceConstName(t, name)) return [];
  const one = `Cannot find member "${name}" in base "${t}".`;
  return [
    { code: "static-member-unknown", message: one },
    { code: "static-member-unknown", message: one },
  ];
}
