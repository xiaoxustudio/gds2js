import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import type { ClassDecl, Param, TypeRef } from "../lower/ir";
import type { LineMapping } from "./sourcemap";

export type Kind = "int" | "float" | "str";
export interface RawAbi {
  params: Kind[];
  ret: Kind;
}

export type ElemKind = "int" | "float" | "str" | "int[]" | "float[]" | "str[]";

export interface EmitContext {
  MODULE_VARS: Set<string>;
  MODULE_SIGNALS: Set<string>;
  CLASS_SIGNALS: Set<string>;
  MODULE_FUNCS: Set<string>;
  PARAM_TYPES: Map<string, Param[]>;
  MODULE_CLASSES: Set<string>;
  SCRIPT_BASE: Map<string, string>;
  INNER_CLASSES: Map<string, ClassDecl>;
  EXTENDED_INNER: Set<string>;
  PRELOADS: Map<string, string>;
  LOADS: Map<string, string>;
  IN_INIT: boolean;
  INIT_HAS_BASE: boolean;
  CURRENT_FUNC: string;
  LAMBDA_DEPTH: number;
  DEBUG_FILE: string;
  MODULE_RES_PATH: string | null;
  INIT_AS_METHOD: boolean;
  INHERITED_METHODS: Set<string>;
  SCRIPT_INHERITED: Set<string>;
  NEEDS_HOST_SUPER: boolean;
  ENUM_NAMES: Set<string>;
  CURRENT_MEMBERS: Set<string>;
  STATIC_FUNCS: Set<string>;
  CURRENT_CLASS: string;
  ENGINE_BASE: string | null;
  selfInNilContext: boolean;
  CLASS_VALUE_OWNERS: Map<string, string>;
  CLASS_VALUES: Map<string, Set<string>>;
  VAR_TYPES: Map<string, TypeRef | null>;
  LOCAL_TYPES: Map<string, TypeRef | null>;
  FUNC_BINDS: Map<string, number>;
  FUNC_RETURNS: Map<string, TypeRef | null>;
  UNTYPED_NAMES: Set<string>;
  CLASS_FUNCS: Set<string>;
  MAP_ACTIVE: boolean;
  LINE_MAPPINGS: LineMapping[];
  UNBOXED: Map<string, "int" | "float" | "str">;
  RAW_ABIS: Map<string, RawAbi>;
  CURRENT_RET: Kind | null;
  CURRENT_RET_ANN: TypeRef | null;
  RAW_ARRAYS: Map<string, ElemKind>;
  RAW_DICTS: Map<string, "int" | "float">;
}

export function newContext(): EmitContext {
  return {
    MODULE_VARS: new Set<string>(),
    MODULE_SIGNALS: new Set<string>(),
    CLASS_SIGNALS: new Set<string>(),
    MODULE_FUNCS: new Set<string>(),
    PARAM_TYPES: new Map<string, Param[]>(),
    MODULE_CLASSES: new Set<string>(),
    SCRIPT_BASE: new Map<string, string>(),
    INNER_CLASSES: new Map<string, ClassDecl>(),
    EXTENDED_INNER: new Set<string>(),
    PRELOADS: new Map<string, string>(),
    LOADS: new Map<string, string>(),
    IN_INIT: false,
    INIT_HAS_BASE: false,
    CURRENT_FUNC: "",
    LAMBDA_DEPTH: 0,
    DEBUG_FILE: "",
    MODULE_RES_PATH: null,
    INIT_AS_METHOD: false,
    INHERITED_METHODS: new Set<string>(),
    SCRIPT_INHERITED: new Set<string>(),
    NEEDS_HOST_SUPER: false,
    ENUM_NAMES: new Set<string>(),
    CURRENT_MEMBERS: new Set<string>(),
    STATIC_FUNCS: new Set<string>(),
    CURRENT_CLASS: "",
    ENGINE_BASE: null,
    selfInNilContext: false,
    CLASS_VALUE_OWNERS: new Map<string, string>(),
    CLASS_VALUES: new Map<string, Set<string>>(),
    VAR_TYPES: new Map<string, TypeRef | null>(),
    LOCAL_TYPES: new Map<string, TypeRef | null>(),
    FUNC_BINDS: new Map<string, number>(),
    FUNC_RETURNS: new Map<string, TypeRef | null>(),
    UNTYPED_NAMES: new Set<string>(),
    CLASS_FUNCS: new Set<string>(),
    MAP_ACTIVE: false,
    LINE_MAPPINGS: [],
    UNBOXED: new Map<string, "int" | "float" | "str">(),
    RAW_ABIS: new Map<string, RawAbi>(),
    CURRENT_RET: null,
    CURRENT_RET_ANN: null,
    RAW_ARRAYS: new Map<string, ElemKind>(),
    RAW_DICTS: new Map<string, "int" | "float">(),
  };
}

export let ctx: EmitContext = newContext();
export let analysis: AnalysisResult = NO_ANALYSIS;

export function beginEmit(analysisResult: AnalysisResult): void {
  ctx = newContext();
  analysis = analysisResult;
}
