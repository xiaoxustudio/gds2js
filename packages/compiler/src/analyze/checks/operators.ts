import { staticMemberFn } from "../../lower/ir";
import { ELEM_FACES, NATIVE_CLASS_SLOTS } from "../../semantics/elem-faces";
import type { AnalysisResult, Diagnostic } from "../analysis-result";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_INSTANCE_PROPS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, BUILTIN_TYPE_NAMES, FACE_CTOR_LITERAL, JOIN_BAD_ARG, UTILITY_ARITY } from "../../semantics/builtin-members";
import { OP_PAIRS_CONST_A, OP_PAIRS_CONST_B, OP_PAIRS_REFUSED_A, OP_PAIRS_REFUSED_B, OP_PAIRS_REFUSED_CALLABLE, OP_PAIRS_REFUSED_DECL, OP_PAIRS_REFUSED_DECL_VAL, OP_PAIRS_REFUSED_DECL_VAL_REV } from "../../semantics/op-pairs";
import { ANNOT_SOURCES, ARG_NAME_TYPES, FACE_ANNOTATIONS, INSTANCE_OF_TYPE_LAST, NUMERIC_VALUE_CTORS, OBJECT_ARG_NAMES, PACK_APPEND_ARRAY_AS, PACK_APPEND_NAMED, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_SHAPE_NAMES, PACK_TYPE_NAMES, PARAM_OWN_SLOTS, PCT_MSG, PCT_NUMERIC, PCT_VALUE_CTORS, PCT_VECTORS, SIGNAL_PARSE_MISSING, STATIC_VALUE_TYPES, VALUE_ARG_WANTS } from "../../semantics/elem-faces";
import { CALLABLE_PARSE_ARGS, CALLABLE_PARSE_ARITY, HOST_VALUE_METHODS, NO_HOST_VALUE_METHODS, SIGNAL_PARSE_ARITY_MAX, VIRTUAL_HOST_NAMES, VOID_ARRAY_METHODS, VOID_BYTES_METHODS, VOID_CALLABLE_METHODS, VOID_DICT_METHODS, VOID_OBJECT_METHODS, VOID_SIGNAL_METHODS } from "../../semantics/void-methods";
import { CTOR_REFUSED, CUBIC_NAME_ARG_FUNCS, FUNC_ARG_SLOTS, GLOBAL_NUM_ARITH, GLOBAL_TYPED_NAME_ARGS, NODE_PATH_FACE, STATIC_FACE, STRINGNAME_FACE, type NamedFace } from "../../semantics/faces";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "../../semantics/arg-types/static-arg-types";
import { FACE_ARG_AS, FACE_ARG_TYPES } from "../../semantics/arg-types/face-arg-types";
import { INSTANCE_ARG_AS, INSTANCE_ARG_TYPES } from "../../semantics/arg-types/instance-arg-types";
import { isGlobalConst } from "../../lower/globals";
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
} from "../../semantics/arg-types/global-arg-types";
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
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "../../lower/ir";

import { canHold, pctArg, pctSlotMessage, pctSlots } from "../slots";
import { type ContainerShape, parseTyped } from "../state";
import { flattenBodies, flattenBody } from "../walk";
import { arityDiag, faceCtorLiteral } from "../arity";
import { chainRecvFace, knownFaceAnnotation, literalTypeName, staticType } from "../faces";
import { isLiteralOperand, isNegativeLiteral } from "../literals";

export function checkVoidAnnotation(m: Module, diags: Diagnostic[]): void {
  const hasVoid = (t: TypeRef | null): boolean => {
    if (t === null || t.kind !== "named") return false;
    return t.name.split(/[\[\],]/).some((part) => part.trim() === "void");
  };
  const found: Diagnostic["loc"][] = [];
  const checkParams = (params: readonly Param[], loc: Diagnostic["loc"]): void => {
    for (const p of params) {
      if (hasVoid(p.type)) found.push(loc);
    }
  };
  const checkVar = (v: VarDecl): void => {
    if (hasVoid(v.type)) found.push(v.loc);
  };
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) checkParams(f.params, f.loc);
    for (const v of c.vars) checkVar(v);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const f of m.funcs) checkParams(f.params, f.loc);
  for (const v of m.vars) checkVar(v);
  for (const c of m.innerClasses) walkClass(c);
  const first = found.sort((a, b) => (a === null ? 1e9 : a.line) - (b === null ? 1e9 : b.line))[0];
  if (first !== undefined) {
    diags.push({ code: "void-annotation", message: `"void" is only allowed for a function return type.`, loc: first });
  }
}

export function checkBoolOrdering(m: Module, diags: Diagnostic[]): void {
  const isBoolDecl = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name === "bool";
  const moduleBools = new Set<string>(m.vars.filter((v) => isBoolDecl(v.type)).map((v) => v.name));
  const constBools = new Set<string>(m.vars.filter((v) => v.isConst && isBoolDecl(v.type)).map((v) => v.name));

  const litBool = (e: Expr): boolean => e.kind === "lit" && typeof e.value === "boolean";
  const foldableBool = (e: Expr): boolean => litBool(e) || (e.kind === "ident" && constBools.has(e.name));

  const scan = (ss: Stmt[], bools: Set<string>): void => {
    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "binary":
          if ((e.op === "<=" || e.op === ">=") && boolSide(e.left) && boolSide(e.right)) {
            diags.push({
              code: "bool-ordering",
              message:
                foldableBool(e.left) && foldableBool(e.right)
                  ? `Invalid operands to operator ${e.op}, bool and bool.`
                  : `Invalid operands "bool" and "bool" for "${e.op}" operator.`,
              loc: e.loc,
            });
          }
          expr(e.left);
          expr(e.right);
          return;
        case "unary":
          expr(e.operand);
          return;
        case "call":
          expr(e.callee);
          e.args.forEach(expr);
          return;
        case "attribute":
          expr(e.obj);
          return;
        case "index":
          expr(e.obj);
          expr(e.index);
          return;
        case "array":
          e.items.forEach(expr);
          return;
        case "dict":
          for (const en of e.entries) {
            expr(en.key);
            expr(en.value);
          }
          return;
        case "lambda":
          scan(e.body, new Set([...bools, ...e.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
          return;
        case "await":
          expr(e.operand);
          return;
        default:
          return;
      }
    };
    const boolSide = (e: Expr): boolean => litBool(e) || (e.kind === "ident" && bools.has(e.name));
    for (const s of ss) {
      switch (s.kind) {
        case "var":
          if (isBoolDecl(s.type)) bools.add(s.name);
          if (s.init !== null) expr(s.init);
          continue;
        case "assign":
          expr(s.target);
          expr(s.value);
          continue;
        case "expr":
          expr(s.expr);
          continue;
        case "return":
          if (s.value !== null && s.value !== undefined) expr(s.value as Expr);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) expr(b.cond);
            scan(b.body, bools);
          }
          continue;
        case "while":
          expr(s.cond);
          scan(s.body, bools);
          continue;
        case "for":
          expr(s.iter);
          scan(s.body, bools);
          continue;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) scan(arm.body, bools);
          continue;
        default:
          continue;
      }
    }
  };

  for (const f of m.funcs) scan(f.body, new Set([...moduleBools, ...f.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const bools = new Set([...inherited, ...c.vars.filter((v) => isBoolDecl(v.type)).map((v) => v.name)]);
    for (const f of c.funcs) scan(f.body, new Set([...bools, ...f.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
    for (const inner of c.innerClasses) walkClass(inner, bools);
  };
  for (const c of m.innerClasses) walkClass(c, moduleBools);
}

export function checkVoidMethodValues(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);

  const packSeeds = new Map<Stmt[], Map<string, string>>();
  const packAnn = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" && PACK_TYPE_NAMES.has(t.name) ? t.name : null);
  const containerSeeds = new Map<Stmt[], Map<string, string>>();
  const shapeAnn = (t: TypeRef | null): string | null =>
    t === null || t.kind !== "named"
      ? null
      : /^Array(\[|$)/.test(t.name)
        ? "Array"
        : /^Dictionary(\[|$)/.test(t.name)
          ? "Dictionary"
          : PACK_TYPE_NAMES.has(t.name)
            ? "Pack"
            : null;
  const seedFunc = (f: FuncDecl, fields: Map<string, string>, shapeFields: Map<string, string>): void => {
    const s = new Map(fields);
    const cs = new Map(shapeFields);
    for (const p of f.params) {
      const ty = packAnn(p.type);
      if (ty !== null) s.set(p.name, ty);
      const sh = shapeAnn(p.type);
      if (sh !== null) cs.set(p.name, sh);
    }
    packSeeds.set(f.body, s);
    containerSeeds.set(f.body, cs);
  };
  for (const f of m.funcs) seedFunc(f, new Map<string, string>(), new Map<string, string>());
  const seedCls = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    const shapeFields = new Map<string, string>();
    for (const v of c.vars) {
      const ty = packAnn(v.type);
      if (ty !== null) fields.set(v.name, ty);
      const sh = shapeAnn(v.type);
      if (sh !== null) shapeFields.set(v.name, sh);
    }
    for (const f of c.funcs) seedFunc(f, fields, shapeFields);
    for (const inner of c.innerClasses) seedCls(inner);
  };
  for (const c of m.innerClasses) seedCls(c);

  const classNames = new Set<string>(m.className ? [m.className] : []);
  const addClassNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      classNames.add(c.name);
      addClassNames(c.innerClasses);
    }
  };
  addClassNames(m.innerClasses);

  const signalNames = new Set<string>(m.signals.map((s) => s.name));
  const addSignalNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      for (const s of c.signals) signalNames.add(s.name);
      addSignalNames(c.innerClasses);
    }
  };
  addSignalNames(m.innerClasses);

  const modAnn = new Map<string, string>();
  for (const v of m.vars) {
    const f = knownFaceAnnotation(v.type);
    if (f !== null) modAnn.set(v.name, f);
  }

  const shapeOf = (e: Expr): ContainerShape | null => {
    if (e.kind === "array") return "Array";
    if (e.kind === "dict") return "Dictionary";
    if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "Callable") return "Callable";
    if (e.kind === "ident" && signalNames.has(e.name)) return "SignalDyn";
    if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "Signal") return "SignalDyn";
    if (e.kind === "call" && e.callee.kind === "ident" && PACK_SHAPE_NAMES.has(e.callee.name)) {
      return "Pack";
    }
    if (
      e.kind === "call" &&
      e.callee.kind === "attribute" &&
      e.callee.name === "new" &&
      e.callee.obj.kind === "ident" &&
      classNames.has(e.callee.obj.name)
    ) {
      return "Object";
    }
    return null;
  };

  const seed = new Map<string, ContainerShape>();
  for (const v of m.vars) {
    if (v.type === null || v.type.kind !== "named") continue;
    const sh: ContainerShape | null =
      /^Array(\[|$)/.test(v.type.name) ? "Array" : /^Dictionary(\[|$)/.test(v.type.name) ? "Dictionary" : PACK_SHAPE_NAMES.has(v.type.name) ? "Pack" : null;
    if (sh !== null) seed.set(v.name, sh);
  }

  for (const body of bodies) {
    const shapes = new Map(seed);
    const packSeed = packSeeds.get(body);
    if (packSeed !== undefined) {
      for (const [name] of packSeed) shapes.set(name, "Pack");
    }
    const containerSeed = containerSeeds.get(body);
    if (containerSeed !== undefined) {
      for (const [name, sh] of containerSeed) shapes.set(name, sh as ContainerShape);
    }
    const localAnn = new Map<string, string>();
    for (const n of flattenBody(body)) {
      if (n.kind === "var" && typeof n.name === "string") {
        const f = knownFaceAnnotation(n.type as TypeRef | null);
        if (f !== null) localAnn.set(n.name, f);
      }
    }
    const scopePacks = packSeeds.get(body) ?? new Map<string, string>();
    const ownerFace = (obj: Expr): string | null => {
      if (obj.kind === "lit") return obj.lit === "string" ? "String" : null;
      if (obj.kind === "ident" && typeof obj.name === "string") {
        return localAnn.get(obj.name) ?? modAnn.get(obj.name) ?? scopePacks.get(obj.name) ?? null;
      }
      if (obj.kind === "call" && obj.callee.kind === "ident" && PACK_TYPE_NAMES.has(obj.callee.name)) return obj.callee.name;
      return obj.kind === "call" ? chainRecvFace(obj, ownerFace) : null;
    };
    const expr = (e: Expr, discarded: boolean): void => {
      switch (e.kind) {
        case "call": {
          if (e.callee.kind === "attribute" && (e.callee.obj.kind === "ident" || e.callee.obj.kind === "call" || e.callee.obj.kind === "array" || e.callee.obj.kind === "dict")) {
            const name = e.callee.name;
            const chainPack = e.callee.obj.kind === "call" ? (PACK_TYPE_NAMES.has(ownerFace(e.callee.obj) ?? "") ? "Pack" : null) : null;
            const ctorCall =
              e.callee.obj.kind === "call" && e.callee.obj.callee.kind === "ident" && e.callee.obj.callee.name === "Callable";
            const shape =
              e.callee.obj.kind === "ident"
                ? shapes.get(e.callee.obj.name) ??
                  (PACK_TYPE_NAMES.has(e.callee.obj.name) ? "Pack" : null) ??
                  (e.callee.obj.name === "Array" || e.callee.obj.name === "Dictionary" ? e.callee.obj.name : null) ??
                  (signalNames.has(e.callee.obj.name) ? "Signal" : null)
                : e.callee.obj.kind === "array"
                  ? "Array"
                  : e.callee.obj.kind === "dict"
                    ? "Dictionary"
                    : chainPack ?? (ctorCall ? "Callable" : null);
            if (shape === "Signal" && SIGNAL_PARSE_MISSING.has(name)) {
              diags.push({
                code: "signal-member-missing",
                message: `Cannot find member "${name}" in base "Signal".`,
                loc: e.loc,
              });
              diags.push({
                code: "signal-member-not-found",
                message: `Function "${name}()" not found in base Signal.`,
                loc: e.loc,
              });
            }
            const sigMax = shape === "Signal" || shape === "SignalDyn" ? SIGNAL_PARSE_ARITY_MAX[name] : undefined;
            if (sigMax !== undefined && e.args.length > sigMax) {
              diags.push({
                code: "signal-arity",
                message: `Too many arguments for "${name}()" call. Expected at most ${String(sigMax)} but received ${String(e.args.length)}.`,
                loc: e.loc,
              });
            }
            if (shape === "Callable") {
              const d = arityDiag(CALLABLE_PARSE_ARITY, "callable-arity", name, e.args.length, e.loc);
              if (d !== null) diags.push(d);
              for (const [pos, refuse, want] of CALLABLE_PARSE_ARGS[name] ?? []) {
                const bad = literalTypeName(e.args[pos - 1]);
                if (bad === null || !refuse.includes(bad)) continue;
                diags.push({
                  code: "callable-arg-pass",
                  message: `Cannot pass a value of type "${bad}" as "${want}".`,
                  loc: e.loc,
                });
                diags.push({
                  code: "callable-arg-type",
                  message: `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`,
                  loc: e.loc,
                });
              }
            }
            if (!discarded) {
              const isVoid =
                shape === "Pack"
                  ? VOID_BYTES_METHODS.has(name)
                  : shape === "Object"
                    ? VOID_OBJECT_METHODS.has(name)
                    : shape === "Signal" || shape === "SignalDyn"
                      ? VOID_SIGNAL_METHODS.has(name)
                      : shape === "Callable"
                        ? VOID_CALLABLE_METHODS.has(name)
                        : (shape === "Array" ? VOID_ARRAY_METHODS : shape === "Dictionary" ? VOID_DICT_METHODS : null)?.has(name) === true;
              if (isVoid) {
                diags.push({
                  code: "void-method-value",
                  message: `Cannot get return value of call to "${name}()" because it returns "void".`,
                  loc: e.loc,
                });
              }
            }
          }
          expr(e.callee, false);
          for (const a of e.args) expr(a, false);
          return;
        }
        case "index":
          expr(e.obj, false);
          expr(e.index, false);
          return;
        case "attribute":
          expr(e.obj, false);
          return;
        case "binary":
          expr(e.left, false);
          expr(e.right, false);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          expr(e.operand, false);
          return;
        case "array":
          for (const it of e.items) expr(it, false);
          return;
        case "dict":
          for (const en of e.entries) {
            expr(en.key, false);
            expr(en.value, false);
          }
          return;
        case "lambda":
          for (const p of e.params) {
            if (p.type !== null && p.type.kind === "named") {
              if (/^Array(\[|$)/.test(p.type.name)) shapes.set(p.name, "Array");
              else if (/^Dictionary(\[|$)/.test(p.type.name)) shapes.set(p.name, "Dictionary");
              else if (PACK_SHAPE_NAMES.has(p.type.name)) shapes.set(p.name, "Pack");
            }
          }
          stmts(e.body);
          return;
        default:
          return;
      }
    };
    const stmts = (ss: Stmt[]): void => {
      for (const s of ss) {
        switch (s.kind) {
          case "var": {
            if (s.type !== null && s.type.kind === "named") {
              if (/^Array(\[|$)/.test(s.type.name)) shapes.set(s.name, "Array");
              else if (/^Dictionary(\[|$)/.test(s.type.name)) shapes.set(s.name, "Dictionary");
              else if (PACK_SHAPE_NAMES.has(s.type.name)) shapes.set(s.name, "Pack");
              else if (s.type.name === "Signal") shapes.set(s.name, "Signal");
              else if (s.type.name === "Callable") shapes.set(s.name, "Callable");
            } else if (s.init !== null) {
              const sh = shapeOf(s.init);
              if (sh !== null) shapes.set(s.name, sh);
            }
            if (s.init !== null) expr(s.init, false);
            continue;
          }
          case "assign": {
            if (s.target.kind === "ident") {
              const sh = shapeOf(s.value);
              if (sh === null) shapes.delete(s.target.name);
              else shapes.set(s.target.name, sh);
            }
            expr(s.target, false);
            expr(s.value, false);
            continue;
          }
          case "expr":
            expr(s.expr, true);
            continue;
          case "return":
            if (s.value !== null) expr(s.value, false);
            continue;
          case "if":
            for (const b of s.branches) {
              if (b.cond !== null) expr(b.cond, false);
              stmts(b.body);
            }
            continue;
          case "for":
            expr(s.iter, false);
            stmts(s.body);
            continue;
          case "while":
            expr(s.cond, false);
            stmts(s.body);
            continue;
          case "match":
            expr(s.subject, false);
            for (const arm of s.arms) {
              if (arm.guard !== null) expr(arm.guard, false);
              stmts(arm.body);
            }
            continue;
          default:
            continue;
        }
      }
    };
    stmts(body);
  }
}

export function checkPercentFormat(m: Module, diags: Diagnostic[]): void {
  for (const nodes of flattenBodies(m)) {
    for (const n of nodes) {
      if (n.kind !== "binary" || n.op !== "%") continue;
      const left = n.left as Expr;
      const right = n.right as Expr;
      if (left.kind !== "lit" || (left.lit !== "string" && left.lit !== "string_name")) continue;
      if (right.kind === "array" || right.kind === "dict") continue;
      const arg = pctArg(right);
      if (arg === null) continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      const slots = pctSlots(String(left.value));
      let message: string | null = null;
      let used = 0;
      for (const slot of slots) {
        if (slot.kind !== "tail") {
          if (used >= 1) {
            message = PCT_MSG.notEnough;
            break;
          }
          used++;
          message = pctSlotMessage(slot, arg);
        } else {
          message = pctSlotMessage(slot, arg);
        }
        if (message !== null) break;
      }
      if (message === null && used === 0) message = PCT_MSG.notAll;
      if (message !== null) diags.push({ code: "pct-format", message, loc });
    }
  }
}

export function checkOperandPairs(m: Module, diags: Diagnostic[]): void {
  const ANNOT = new Set(["bool", "int", "float", "String", "StringName", "NodePath", "PackedByteArray", "PackedStringArray", "Array", "Dictionary", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]);
  const named = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    return ANNOT.has(base) ? base : null;
  };
  const moduleTypes = new Map<string, string>();
  const moduleConsts = new Map<string, string>();
  const moduleRaws = new Map<string, string>();
  const rawOf = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" ? t.name : null);
  for (const v of m.vars) {
    const rw = rawOf(v.type);
    if (rw !== null) moduleRaws.set(v.name, rw);
    const t = named(v.type);
    if (t === null) continue;
    if (v.isConst) moduleConsts.set(v.name, t);
    else moduleTypes.set(v.name, t);
  }
  const literalKind = (e: Expr): string | null => literalTypeName(e) ?? staticType(e);

  const checkBody = (body: Stmt[], base: Map<string, string>, consts: Map<string, string>): void => {
    const types = new Map(base);
    const raws = new Map(moduleRaws);
    const nodes = flattenBody(body);
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || n.isConst === true) continue;
      const rw = rawOf(n.type as TypeRef | null);
      if (rw !== null) raws.set(n.name, rw);
      const t = named(n.type as TypeRef | null);
      if (t !== null) types.set(n.name, t);
    }
    const faceOf = (e: Expr): string | null =>
      e.kind === "ident" ? (types.get(e.name) ?? null) : e.kind === "index" ? elemOf(e) : staticType(e);
    const callableOf = (e: Expr): string | null => {
      if (e.kind !== "attribute") return null;
      const face = faceOf(e.obj);
      if (face === null) return null;
      const nm = e.name;
      if (typeof nm !== "string") return null;
      const members = BUILTIN_INSTANCE_MEMBERS[face];
      if (members === undefined || !members.includes(nm)) return null;
      if ((BUILTIN_INSTANCE_PROPS[face] ?? []).includes(nm)) {
        const by = BUILTIN_MEMBER_TYPES[face];
        const t = by === undefined ? undefined : by[nm];
        return typeof t === "string" && ANNOT.has(t) ? t : null;
      }
      return "Callable";
    };
    const callRet = (e: Expr): string | null => {
      if (e.kind !== "call" || e.callee.kind !== "attribute") return null;
      const face = faceOf(e.callee.obj);
      if (face === null) return null;
      const by = BUILTIN_METHOD_RETURNS[face];
      if (by === undefined) return null;
      const name = e.callee.name;
      return typeof name === "string" ? (by[name] ?? null) : null;
    };
    const packCtorFace = (e: Expr): string | null =>
      e.kind === "call" && e.callee.kind === "ident" && PACK_TYPE_NAMES.has(e.callee.name) ? e.callee.name : null;
    const operandKind = (e: Expr): string | null => {
      const lit = literalKind(e);
      if (lit !== null) return lit;
      if (e.kind === "ident") {
        const nm = types.get(e.name) ?? consts.get(e.name) ?? null;
        if (nm !== null) return nm;
      }
      return callRet(e) ?? packCtorFace(e) ?? callableOf(e) ?? elemOf(e);
    };
    const elemOf = (e: Expr): string | null => {
      if (e.kind !== "index" || e.obj.kind !== "ident") return null;
      const slot = parseTyped(raws.get(e.obj.name) ?? "");
      if (slot === null) return null;
      const kt = staticType(e.index);
      if (slot.kind === "Array") {
        if (kt !== null && kt !== "int") return null;
        return slot.elem !== undefined && ANNOT.has(slot.elem) ? slot.elem : null;
      }
      if (slot.key === undefined || slot.val === undefined || !ANNOT.has(slot.val)) return null;
      if (kt !== null && !canHold(slot.key, kt)) return null;
      return slot.val;
    };
    const dispOf = (e: Expr, base: string): string => (e.kind === "ident" ? (raws.get(e.name) ?? base) : base);
    const reported = new Set<Expr>();
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (isLiteralOperand(e.left) && isLiteralOperand(e.right)) continue;
      if (e.left.kind !== "ident" && e.left.kind !== "index" && e.left.kind !== "call" && e.left.kind !== "attribute") continue;
      const rt = operandKind(e.right);
      if (rt === null) continue;
      const isIdent = e.left.kind === "ident";
      const name = isIdent ? (e.left as Extract<Expr, { kind: "ident" }>).name : "";
      const isConst = isIdent && consts.has(name);
      const lt = isIdent ? (isConst ? (consts.get(name) ?? null) : (types.get(name) ?? null)) : e.left.kind === "index" ? elemOf(e.left) : e.left.kind === "call" ? callRet(e.left) ?? literalKind(e.left) ?? packCtorFace(e.left) : callableOf(e.left);
      if (lt === null) continue;
      const pair = `${lt}|${rt}`;
      const foldedA = isConst && OP_PAIRS_CONST_A[e.op]?.includes(pair) === true;
      const foldedB = isConst && OP_PAIRS_CONST_B[e.op]?.includes(pair) === true;
      const declaredB = !isConst && (OP_PAIRS_REFUSED_DECL[e.op]?.includes(pair) === true || OP_PAIRS_REFUSED_DECL_VAL[e.op]?.includes(pair) === true || OP_PAIRS_REFUSED_CALLABLE[e.op]?.includes(pair) === true);
      if (!foldedA && !foldedB && !declaredB) continue;
      diags.push({
        code: "op-pair",
        message: foldedA
          ? `Invalid operands to operator ${e.op}, ${lt} and ${rt}.`
          : `Invalid operands "${dispOf(e.left, lt)}" and "${dispOf(e.right, rt)}" for "${e.op}" operator.`,
        loc: e.loc,
      });
      reported.add(e);
    }
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (reported.has(e)) continue;
      if (isLiteralOperand(e.left) && isLiteralOperand(e.right)) continue;
      if (e.right.kind !== "ident" && e.right.kind !== "index" && e.right.kind !== "call" && e.right.kind !== "attribute") continue;
      const lt2 = operandKind(e.left);
      if (lt2 === null) continue;
      const rt2 = e.right.kind === "ident" ? (types.get((e.right as Extract<Expr, { kind: "ident" }>).name) ?? null) : e.right.kind === "index" ? elemOf(e.right) : e.right.kind === "call" ? callRet(e.right) ?? literalKind(e.right) ?? packCtorFace(e.right) : callableOf(e.right);
      if (rt2 === null) continue;
      const pair2 = `${lt2}|${rt2}`;
      if (OP_PAIRS_REFUSED_DECL[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_DECL_VAL_REV[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_CALLABLE[e.op]?.includes(pair2) !== true) continue;
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${dispOf(e.left, lt2)}" and "${dispOf(e.right, rt2)}" for "${e.op}" operator.`,
        loc: e.loc,
      });
    }
  };

  const withParams = (f: FuncDecl): Map<string, string> => {
    const types = new Map(moduleTypes);
    for (const p of f.params) {
      const t = named(p.type);
      if (t !== null) types.set(p.name, t);
    }
    return types;
  };
  for (const f of m.funcs) checkBody(f.body, withParams(f), moduleConsts);
  const collect = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    for (const v of c.vars) {
      const t = named(v.type);
      if (t !== null && !v.isConst) fields.set(v.name, t);
    }
    for (const f of c.funcs) {
      const types = new Map(fields);
      for (const p of f.params) {
        const t = named(p.type);
        if (t !== null) types.set(p.name, t);
      }
      checkBody(f.body, types, new Map<string, string>());
    }
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
}

export function checkOperator(e: Extract<Expr, { kind: "binary" }>, diags: Diagnostic[]): void {
  const l = literalTypeName(e.left) ?? faceCtorLiteral(e.left) ?? staticType(e.left);
  const r = literalTypeName(e.right) ?? faceCtorLiteral(e.right) ?? staticType(e.right);

  const pair = l !== null && r !== null ? `${l}|${r}` : null;
  const scalar = (t: string | null): boolean => t === "bool" || t === "int" || t === "float";
  const covered =
    (e.op === "%" && (l === "float" || r === "float") && scalar(l) && scalar(r)) ||
    ((e.op === "==" || e.op === "!=") &&
      ((l === "String" && (r === "int" || r === "float")) || (r === "String" && (l === "int" || l === "float")))) ||
    ((e.op === "<=" || e.op === ">=") && l === "bool" && r === "bool");
  let paired = false;
  if (!covered && (isLiteralOperand(e.left) || faceCtorLiteral(e.left) !== null) && (isLiteralOperand(e.right) || faceCtorLiteral(e.right) !== null) && pair !== null && l !== null && r !== null) {
    if (OP_PAIRS_REFUSED_A[e.op]?.includes(pair) === true) {
      paired = true;
      diags.push({
        code: "op-pair",
        message: `Invalid operands to operator ${e.op}, ${l} and ${r}.`,
        loc: e.loc,
      });
    } else if (OP_PAIRS_REFUSED_B[e.op]?.includes(pair) === true) {
      paired = true;
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${l}" and "${r}" for "${e.op}" operator.`,
        loc: e.loc,
      });
    }
  }
  const strLike = (t: string | null): boolean => t === "String" || t === "StringName";
  const isModulo = !strLike(l) && !strLike(r);
  if (!paired && e.op === "%" && isModulo && l !== null && r !== null && (l === "float" || r === "float")) {
    diags.push({
      code: "op-mod-float",
      message: `Invalid operands to operator %, ${l} and ${r}.`,
      loc: e.loc,
    });
  }

  if (e.op === "==" || e.op === "!=") {
    const sVsN = (l === "String" && (r === "int" || r === "float")) || (r === "String" && (l === "int" || l === "float"));
    if (sVsN) {
      diags.push({
        code: "op-eq-cross-type",
        message: `Invalid operands to operator ${e.op}, ${l} and ${r}.`,
        loc: e.loc,
      });
    }
  }

  if (e.op === ">>" || e.op === "<<") {
    if (isNegativeLiteral(e.left) || isNegativeLiteral(e.right)) {
      diags.push({
        code: "op-shift-negative",
        message: `Invalid operands for bit shifting. Only positive operands are supported. in operator ${e.op}.`,
        loc: e.loc,
      });
    }
  }

  if (
    (e.op === "/" || e.op === "%") &&
    e.left.kind === "lit" &&
    (e.left.lit === "int" || e.left.lit === "float") &&
    e.right.kind === "lit" &&
    e.right.lit === "int" &&
    Number(e.right.value) === 0
  ) {
    if (e.op === "%" && e.left.lit !== "int") return;
    diags.push({
      code: e.op === "/" ? "div-by-zero" : "mod-by-zero",
      message: e.op === "/" ? "Division by zero error in operator /." : "Modulo by zero error in operator %.",
      loc: e.loc,
    });
  }
}
