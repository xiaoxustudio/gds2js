import { staticMemberFn } from "../lower/ir";
import { ELEM_FACES, NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import type { AnalysisResult, Diagnostic } from "./analysis-result";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_INSTANCE_PROPS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, BUILTIN_TYPE_NAMES, FACE_CTOR_LITERAL, JOIN_BAD_ARG, UTILITY_ARITY } from "../semantics/builtin-members";
import { OP_PAIRS_CONST_A, OP_PAIRS_CONST_B, OP_PAIRS_REFUSED_A, OP_PAIRS_REFUSED_B, OP_PAIRS_REFUSED_CALLABLE, OP_PAIRS_REFUSED_DECL, OP_PAIRS_REFUSED_DECL_VAL, OP_PAIRS_REFUSED_DECL_VAL_REV } from "../semantics/op-pairs";
import { ANNOT_SOURCES, ARG_NAME_TYPES, FACE_ANNOTATIONS, INSTANCE_OF_TYPE_LAST, NUMERIC_VALUE_CTORS, OBJECT_ARG_NAMES, PACK_APPEND_ARRAY_AS, PACK_APPEND_NAMED, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_SHAPE_NAMES, PACK_TYPE_NAMES, PARAM_OWN_SLOTS, PCT_MSG, PCT_NUMERIC, PCT_VALUE_CTORS, PCT_VECTORS, SIGNAL_PARSE_MISSING, STATIC_VALUE_TYPES, VALUE_ARG_WANTS } from "../semantics/elem-faces";
import { CALLABLE_PARSE_ARGS, CALLABLE_PARSE_ARITY, HOST_VALUE_METHODS, NO_HOST_VALUE_METHODS, SIGNAL_PARSE_ARITY_MAX, VIRTUAL_HOST_NAMES, VOID_ARRAY_METHODS, VOID_BYTES_METHODS, VOID_CALLABLE_METHODS, VOID_DICT_METHODS, VOID_OBJECT_METHODS, VOID_SIGNAL_METHODS } from "../semantics/void-methods";
import { ENGINE_SELF_BASES, nodeSelfProps } from "../semantics/node-face";
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

import { Scope, capKey, declNames, diKey, gvKey, nextMarkSeq, resetRun, run } from "./state";
import { checkTypedCollections } from "./checks/collections/typed";
import { checkTypedIndexSlots } from "./checks/collections/index-slots";
import { checkTypedVarAssign } from "./checks/collections/var-assign";
import { checkPackArgSlots, checkPackFaceNames, checkPackIsAs } from "./checks/collections/pack";
import { checkArrayMethodArity, checkDictDuplicateKeys, checkDictMethodArity } from "./checks/collections/method-arity";
import { checkClass, checkClassFuncVisibility, checkConstAssign, checkFieldInits, checkInitContracts, checkParamDefaultAssign, checkPropertyDelegates, checkReturnPaths, checkScriptClassSlots, checkSignalDefaults } from "./checks/decls";
import { checkBoolOrdering, checkOperandPairs, checkPercentFormat, checkVoidAnnotation, checkVoidMethodValues } from "./checks/operators";
import { checkFunc, classTable, markClassFaceReceivers, seedOuterNames } from "./walk";
import { checkCtorSignatures, checkFuncArgSlots, checkNamedFace, checkStaticAccess, checkStringMethodArity, checkValueMethodArity } from "./checks/calls";
import { lambdaCaptureNames } from "./faces";

export function analyze(m: Module, globals: Set<string> = new Set<string>(), owner?: string, hostChain = false): AnalysisResult {
  resetRun(owner !== undefined && owner !== "" ? owner : `#${nextMarkSeq()}`);
  seedOuterNames(m);
  markClassFaceReceivers(m);
  const diags: Diagnostic[] = [];

  const enumNames: string[] = [];
  for (const en of m.enums) {
    if (en.name) enumNames.push(en.name);
    else for (const mm of en.members) enumNames.push(mm.name);
  }

  const globalScope = new Scope(
    new Set([...(m.className ? [m.className] : []), ...declNames(m), ...enumNames, ...globals]),
    null,
  );
  const moduleScope = globalScope.child(declNames(m));
  const coroutines = new Set(m.funcs.filter((f) => f.coroutine).map((f) => f.name));
  const classes = classTable(m);
  const classScopeBase = new Scope(
    new Set([
      ...(m.className ? [m.className] : []),
      ...m.vars.filter((v) => v.isConst).map((v) => v.name),
      ...m.innerClasses.map((c) => c.name),
      ...enumNames,
      ...globals,
    ]),
    null,
  );

  const hostFace = m.extends === "SceneTree" || hostChain ? HOST_VALUE_METHODS : NO_HOST_VALUE_METHODS;
  const engineFace = nodeSelfProps(ENGINE_SELF_BASES.has(m.extends ?? "") ? m.extends : null);
  for (const f of m.funcs) checkFunc(f, moduleScope, coroutines, diags, hostFace, engineFace);
  checkReturnPaths(m.funcs, diags);
  checkFieldInits(m.vars, moduleScope, coroutines, diags, hostFace);
  for (const c of m.innerClasses) checkClass(c, classScopeBase, diags, classes);
  checkStaticAccess(m.funcs, m.vars, diags);
  checkClassFuncVisibility(m, diags);
  checkTypedCollections(m, diags);
  checkTypedIndexSlots(m, diags);
  checkConstAssign(m, diags, hostFace);
  checkBoolOrdering(m, diags);
  checkPackIsAs(m, diags);
  checkPackArgSlots(m, diags);
  checkPercentFormat(m, diags);
  checkPackFaceNames(m, diags);
  checkDictMethodArity(m, diags);
  checkArrayMethodArity(m, diags);
  checkVoidMethodValues(m, diags);
  checkCtorSignatures(m, diags);
  checkStringMethodArity(m, diags);
  checkNamedFace(m, STRINGNAME_FACE, diags);
  checkNamedFace(m, NODE_PATH_FACE, diags);
  checkOperandPairs(m, diags);
  checkFuncArgSlots(m, new Set(globals), diags);
  checkTypedVarAssign(m, diags);
  checkParamDefaultAssign(m, diags);
  checkVoidAnnotation(m, diags);
  checkScriptClassSlots(m, diags);
  checkSignalDefaults(m, diags);
  checkDictDuplicateKeys(m, diags);
  checkValueMethodArity(m, diags);
  checkInitContracts(m, new Set(globals), diags);
  checkPropertyDelegates(m, diags);

  const r = run;
  return {
    owner: r.owner,
    diagnostics: diags,
    posReadLabel: (e: Expr): string | null => e.kind === "index" ? r.posReadLabels.get(diKey(r, e.loc.line, e.loc.col)) ?? null : null,
    boundFace: (e: Expr): { face: string; min: number; max: number } | null => {
      if (e.kind !== "attribute") return null;
      const hit = r.boundFaces.get(diKey(r, e.loc.line, e.loc.col));
      if (hit === undefined) return null;
      const parts = hit.split(",");
      return { face: String(parts[0]), min: Number(parts[1]), max: Number(parts[2]) };
    },
    /** 静态标注的 `Dictionary` / `Dictionary[K, V]` 配静态 int 键的那一格：引擎讲的是数组那一式（`Out of bounds get index …`，S405 量过），运行期得知道谁是这一形。 */
    isDictIntRead: (e: Expr): boolean => e.kind === "index" && r.dictIntReads.has(diKey(r, e.loc.line, e.loc.col)),
    isGlobalValueRead: (e: Expr): boolean => e.kind === "ident" && r.globalValueReads.has(gvKey(r, e.name, e.loc.line, e.loc.col)),
    isNativeClassValueRead: (e: Expr): boolean => e.kind === "ident" && r.nativeClassReads.has(gvKey(r, e.name, e.loc.line, e.loc.col)),
    isHostMethodValueRead: (e: Expr): boolean => e.kind === "ident" && r.hostMethodReads.has(gvKey(r, e.name, e.loc.line, e.loc.col)),
    isEnginePropRead: (e: Expr): boolean => e.kind === "ident" && r.enginePropReads.has(gvKey(r, e.name, e.loc.line, e.loc.col)),
    /** 这一支 lambda 创建时要按值影子化的局部名。 */
    lambdaCaptureNames: (e: Expr): string[] => e.kind !== "lambda" || e.loc === null ? [] : r.lambdaCaptures.get(capKey(r, e.loc.line, e.loc.col)) ?? [],
  };
}
