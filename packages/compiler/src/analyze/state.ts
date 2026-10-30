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
import { COLOR_NAMED } from "@gds2js/runtime/runtime/class/color/named";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";


export interface Decl {
  vars: Array<{ name: string }>;
  signals: Array<{ name: string }>;
  funcs: Array<{ name: string }>;
  innerClasses: Array<{ name: string }>;
}

export class Scope {
  constructor(
    private vars: Set<string>,
    private parent: Scope | null,
    private selfOk?: boolean,
    private isLocal = false,
  ) {}

  has(name: string): boolean {
    return this.vars.has(name) || (this.parent !== null && this.parent.has(name));
  }

  hasLocal(name: string): boolean {
    return this.isLocal && (this.vars.has(name) || (this.parent !== null && this.parent.hasLocal(name)));
  }

  funcChild(names: string[], selfOk?: boolean): Scope {
    return new Scope(new Set(names), this, selfOk, true);
  }

  allowsSelf(): boolean {
    return this.selfOk ?? (this.parent !== null && this.parent.allowsSelf());
  }

  child(names: string[], selfOk?: boolean): Scope {
    return new Scope(new Set(names), this, selfOk, this.isLocal);
  }

  declare(name: string): void {
    this.vars.add(name);
  }
}

export type StaticType =
  | "int"
  | "float"
  | "String"
  | "bool"
  | "null"
  | "Array"
  | "Dictionary"
  | "Vector2"
  | "Vector2i"
  | "Vector3"
  | "Vector3i"
  | "Vector4"
  | "Vector4i"
  | "Color"
  | "StringName"
  | null;

export function declNames(d: Decl): string[] {
  return [
    ...d.vars.map((v) => v.name),
    ...d.signals.map((s) => s.name),
    ...d.funcs.map((f) => f.name),
    ...d.innerClasses.map((c) => c.name),
  ];
}

export type TypedSlot = { decl: string; kind: "Array" | "Dictionary"; elem?: string; key?: string; val?: string; ann?: string };

export type HostStaticCtx = { kind: "func"; name: string } | { kind: "var" } | { kind: "const"; name: string } | null;

export interface Run {
  owner: string;
  dictIntReads: Set<string>;
  posReadLabels: Map<string, string>;
  boundFaces: Map<string, string>;
  globalValueReads: Set<string>;
  nativeClassReads: Set<string>;
  hostMethodReads: Set<string>;
  enginePropReads: Set<string>;
  lambdaCaptures: Map<string, string[]>;
  outerNames: Set<string>;
  hostValueMethods: Set<string>;
  enginePropFace: ReadonlySet<string>;
  hostStaticCtx: HostStaticCtx;
}

export function newRun(): Run {
  return {
    owner: "",
    dictIntReads: new Set<string>(),
    posReadLabels: new Map<string, string>(),
    boundFaces: new Map<string, string>(),
    globalValueReads: new Set<string>(),
    nativeClassReads: new Set<string>(),
    hostMethodReads: new Set<string>(),
    enginePropReads: new Set<string>(),
    lambdaCaptures: new Map<string, string[]>(),
    outerNames: new Set<string>(),
    hostValueMethods: new Set<string>(),
    enginePropFace: new Set<string>(),
    hostStaticCtx: null,
  };
}

export let run: Run = newRun();

export let markSeq = 0;

export function resetRun(owner: string): Run {
  run = newRun();
  run.owner = owner;
  return run;
}

export function nextMarkSeq(): number {
  markSeq++;
  return markSeq;
}

export const diKey = (r: Run, line: number, col: number): string => `${r.owner}#${String(line)}:${String(col)}`;

export const gvKey = (r: Run, name: string, line: number, col: number): string => `${r.owner}#${name}@${line}:${col}`;

export const capKey = (r: Run, line: number, col: number): string => `${r.owner}@${String(line)}:${String(col)}`;

export function parseTyped(name: string): TypedSlot | null {
  const m = /^(Array|Dictionary)\[(.+)\]$/.exec(name);
  if (m === null) return null;
  const inner = m[2] as string;
  if (inner.includes("[")) return null;
  if (m[1] === "Array") return { decl: name, kind: "Array", elem: inner.trim() };
  const parts = inner.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  return { decl: name, kind: "Dictionary", key: parts[0] as string, val: parts[1] as string };
}

export type ContainerShape = "Array" | "Dictionary" | "Pack" | "Object" | "Signal" | "SignalDyn" | "Callable";

export const CLASS_FACE_RECEIVERS = new WeakSet<object>();

export interface PctArg {
  num: boolean;
  neg: boolean;
  vec: boolean;
  text: string | null;
}

export type PctSlot = { kind: "star" } | { kind: "conv"; ch: string } | { kind: "tail" };

export type DictKey =
  | { t: "int"; v: bigint }
  | { t: "float"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "null" }
  | { t: "vec"; name: "Vector2" | "Vector3"; xs: number[] }
  | { t: "np"; v: string };
