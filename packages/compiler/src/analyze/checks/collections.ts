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

import { type StaticType, type TypedSlot, diKey, parseTyped, run } from "../state";
import { assignTargetName, moduleAssignedNames, reassignedNames, walkExpr, walkExprKinds, walkStmts } from "../walk";
import { dictKeyText, dictKeyToken, literalFaceText } from "../literals";
import { canHold, dictSlotOf, foldDictKey, instanceOfTypeArgMessage, isCollText, namedAppendSource, namedSlotSource, packArgScopes, packArgSource, scalarSourceName, slotSource, varSlotHolds } from "../slots";
import { argFaceBase, attrFaceRecv, attrScopes, chainRecvFace, faceReceiverNames, faceScopes, packFaceRecv, readFaceOf, scalarStaticName, staticType, staticTypeName, stringNameVars } from "../faces";
import { containerCallArity, faceGhostDiags, instanceFaceManaged, instanceMemberAbsent, memberNameAbsent } from "../arity";

export function checkTypedCollections(m: Module, diags: Diagnostic[]): void {
  const targets: Array<{ type: TypeRef | null; init: Expr | null; loc: Loc; varName?: string; srcAnn?: TypeRef | null; fnName?: string; fnPos?: number; assignStmt?: boolean }> = [
    ...m.vars.map((v) => ({ type: v.type, init: v.init, loc: v.loc })),
    ...m.funcs.flatMap((f) => [
      ...f.params.map((p) => ({ type: p.type, init: p.default, loc: f.loc })),
      { type: f.returnType, init: null, loc: f.loc },
    ]),
  ];
  const collect = (cls: ClassDecl): void => {
    for (const v of cls.vars) targets.push({ type: v.type, init: v.init, loc: v.loc });
    for (const f of cls.funcs) {
      for (const p of f.params) targets.push({ type: p.type, init: p.default, loc: f.loc });
      targets.push({ type: f.returnType, init: null, loc: f.loc });
    }
    for (const inner of cls.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  const classNames = new Set<string>();
  const collectClassNames = (c: ClassDecl): void => {
    classNames.add(c.name);
    for (const inner of c.innerClasses) collectClassNames(inner);
  };
  for (const c of m.innerClasses) collectClassNames(c);
  const typedVars = new Map<string, TypeRef>();
  for (const v of m.vars) if (v.type !== null) typedVars.set(v.name, v.type);
  const fnParams = new Map<string, (TypeRef | null)[]>();
  for (const f of m.funcs) fnParams.set(f.name, f.params.map((p) => p.type));
  const walkStmts = (stmts: Stmt[], retType: TypeRef | null): void => {
    if (retType === null) locals.clear();
    for (const s of stmts) {
      if (s.kind === "var") {
        const srcAnn = s.init !== null && s.init.kind === "ident" ? locals.get(s.name === undefined ? "" : (s.init as Record<string, unknown>).name as string) ?? null : null;
        targets.push({ type: s.type, init: s.init, loc: s.loc, varName: s.name, srcAnn });
        if (s.name !== undefined && s.type !== null && !locals.has(s.name)) locals.set(s.name, s.type);
      }
      else if (s.kind === "if") for (const b of s.branches) walkStmts(b.body, retType);
      else if (s.kind === "for" || s.kind === "while") walkStmts(s.body, retType);
      else if (s.kind === "return" && retType !== null) targets.push({ type: retType, init: s.value, loc: s.loc });
      else if (s.kind === "assign" && assignTargetName(s.target) !== null) {
        const name = assignTargetName(s.target) as string;
        const decl = typedVars.get(name) ?? locals.get(name);
        if (decl !== undefined) targets.push({ type: decl, init: s.value, loc: s.loc, srcAnn: srcAnnOf(s.value), assignStmt: true });
      } else walkExprs(s, retType);
    }
  };
  const walkExprs = (n: unknown, retType: TypeRef | null): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkExprs(x, retType);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o.kind === "var") {
      const t = o.type as TypeRef | null;
      if (typeof o.name === "string" && t !== null && !locals.has(o.name)) locals.set(o.name, t);
    }
    if (o.kind === "return" && retType !== null) targets.push({ type: retType, init: (o.value as Expr | null) ?? null, loc: o.loc as Loc });
    if (o.kind === "assign" && retType !== null) {
      const name = assignTargetName(o.target);
      const decl = name === null ? undefined : typedVars.get(name) ?? locals.get(name);
      if (decl !== undefined) targets.push({ type: decl, init: o.value as Expr, loc: o.loc as Loc, srcAnn: srcAnnOf(o.value as Expr), assignStmt: true });
    }
    if (o.kind === "call" && Array.isArray(o.args)) {
      const callee = o.callee as Record<string, unknown>;
      if (callee.kind === "ident" && typeof callee.name === "string") {
        const pt = fnParams.get(callee.name);
        if (pt !== undefined) {
          const args = o.args as Expr[];
          for (let i = 0; i < args.length && i < pt.length; i++) {
            const t = pt[i];
            const arg0 = args[i] ?? null;
            const argAnn: TypeRef | null = arg0 !== null && arg0.kind === "ident" ? locals.get((arg0 as unknown as Record<string, unknown>).name as string) ?? null : null;
            targets.push({ type: t ?? null, init: arg0, loc: args[i]!.loc, srcAnn: argAnn, fnName: callee.name, fnPos: i + 1 });
          }
        }
      }
    }
    for (const key of Object.keys(o)) {
      if (key !== "loc") walkExprs(o[key], retType);
    }
  };
  const locals = new Map<string, TypeRef>();
  /** 源的标注：标识符查函数内那张声明表，字面量与调用没有标注可查 */
  const srcAnnOf = (e: Expr | null): TypeRef | null => (e !== null && e.kind === "ident" ? locals.get(e.name) ?? null : null);
  for (const f of m.funcs) walkStmts(f.body, f.returnType);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) walkStmts(f.body, f.returnType);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  for (const t of targets) {
    const slotAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.fnName !== undefined && t.fnPos !== undefined && slotAnn !== null && t.srcAnn !== undefined && t.srcAnn !== null &&
        t.srcAnn.kind === "named" && (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) &&
        (slotAnn.startsWith("Array[") || slotAnn.startsWith("Dictionary[")) && t.srcAnn.name !== slotAnn) {
      diags.push({
        code: "typed-collection-param",
        message: `Invalid argument for "${t.fnName}()" function: argument ${String(t.fnPos)} should be "${slotAnn}" but is "${t.srcAnn.name}".`,
        loc: t.loc,
      });
      continue;
    }
    const targetAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && isCollText(t.srcAnn.name) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null && t.srcAnn.kind === "named" &&
      (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign",
        message: `Cannot assign a value of type ${t.srcAnn.name} to variable "${t.varName}" with specified type ${targetAnn}.`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.init !== null) {
      const srcKind = t.init.kind === "array" ? "Array" : t.init.kind === "dict" ? "Dictionary" : null;
      const wantKind = targetAnn.startsWith("Array") ? "Array" : "Dictionary";
      if (srcKind !== null && srcKind !== wantKind) {
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${literalFaceText(t.init, srcKind)} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
      const st = srcKind === null ? slotSource(t.init) : null;
      if (st !== null && scalarSourceName(st, classNames)) {
        diags.push({
          code: "typed-collection-assign-as",
          message: `Cannot assign a value of type "${st}" as "${targetAnn}".`,
          loc: t.loc,
        });
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${st} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
    }
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && scalarSourceName(t.srcAnn.name, classNames)) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
    if (t.type === null || t.type.kind !== "named") continue;
    const m2 = /^(Array|Dictionary)\[(.+)\]$/.exec(t.type.name);
    if (m2 === null) continue;
    const inner = m2[2] ?? "";
    if (inner.includes("[")) {
      diags.push({
        code: "typed-collection-nested",
        message: "Nested typed collections are not supported.",
        loc: t.loc,
      });
      continue;
    }
    if (t.init === null) continue;
    const slotOf = (e: Expr): NonNullable<StaticType> | null => {
      if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.name === "new" && e.callee.obj.kind === "ident" && classNames.has(e.callee.obj.name)) return e.callee.obj.name as NonNullable<StaticType>;
      return slotSource(e);
    };
    const parentOf = new Map<string, string>();
    const collectParents = (c: ClassDecl): void => {
      if (c.extends !== null && c.extends !== "") parentOf.set(c.name, c.extends);
      for (const inner of c.innerClasses) collectParents(inner);
    };
    for (const c of m.innerClasses) collectParents(c);
    const related = (a: string, b: string): boolean => {
      for (let x: string | undefined = a; x !== undefined; x = parentOf.get(x)) if (x === b) return true;
      for (let x: string | undefined = b; x !== undefined; x = parentOf.get(x)) if (x === a) return true;
      return false;
    };
    const nativeRoot = (x: string): string => {
      let cur: string | undefined = x;
      for (let guard = 0; guard < 16 && cur !== undefined; guard++) {
        const p = parentOf.get(cur);
        if (p === undefined) return classNames.has(cur) ? "RefCounted" : cur;
        if (!classNames.has(p)) return p;
        cur = p;
      }
      return "RefCounted";
    };
    const isObjectFace = (x: string): boolean => classNames.has(x) || NATIVE_CLASS_SLOTS.has(x);
    const holds = (kind: string, st: NonNullable<StaticType>): boolean => {
      if (st === "null") return true;
      if (NATIVE_CLASS_SLOTS.has(kind)) return kind === "Object" ? isObjectFace(st) : isObjectFace(st) && nativeRoot(st) === kind;
      if (classNames.has(kind)) return classNames.has(st) && related(kind, st);
      return canHold(kind, st);
    };
    const report = (st: NonNullable<StaticType>, kind: string, second: string): void => {
      if (!isObjectFace(kind) && !isObjectFace(st)) {
        diags.push({ code: "typed-collection-literal", message: `Cannot include a value of type "${st}" as "${kind}".`, loc: t.loc });
      }
      diags.push({ code: "typed-collection-element", message: second, loc: t.loc });
    };
    if (m2[1] === "Array") {
      const kind = inner.trim();
      if (t.init.kind === "array") {
        let done = false;
        for (const it of t.init.items) {
          if (done) break;
          const st = slotOf(it);
          if (st === null || holds(kind, st)) continue;
          done = true;
          report(st, kind, `Cannot have an element of type "${st}" in an array of type "Array[${kind}]".`);
        }
      }
    } else {
      const parts = inner.split(",").map((p) => p.trim());
      const keyKind = parts[0] ?? "";
      const valKind = parts[1] ?? "";
      if (t.init.kind === "dict" && parts.length === 2) {
        const text = `Dictionary[${keyKind}, ${valKind}]`;
        let done = false;
        for (const en of t.init.entries) {
          if (done) break;
          const ks = slotOf(en.key);
          if (ks !== null && !holds(keyKind, ks)) {
            done = true;
            report(ks, keyKind, `Cannot have a key of type "${ks}" in a dictionary of type "${text}".`);
            break;
          }
          const vs = slotOf(en.value);
          if (vs !== null && !holds(valKind, vs)) {
            done = true;
            report(vs, valKind, `Cannot have a value of type "${vs}" in a dictionary of type "${text}".`);
          }
        }
      }
    }
  }
}

export function checkTypedIndexSlots(m: Module, diags: Diagnostic[]): void {
  type Seed = { name: string; type: TypeRef | null };
  const moduleSeeds: Seed[] = m.vars.map((v) => ({ name: v.name, type: v.type }));
  const bodies: Array<{ stmts: Stmt[]; params: Seed[]; seeds: Seed[]; ret: TypeRef | null }> = m.funcs.map((f) => ({ stmts: f.body, params: f.params, seeds: moduleSeeds, ret: f.returnType }));
  const collect = (c: ClassDecl): void => {
    const fields: Seed[] = [...moduleSeeds, ...c.vars.map((v) => ({ name: v.name, type: v.type }))];
    for (const f of c.funcs) bodies.push({ stmts: f.body, params: f.params, seeds: fields, ret: f.returnType });
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  for (const c of m.innerClasses) collect(c);
  const inits: Array<{ expr: Expr; seeds: Seed[] }> = [];
  const collectInits = (vars: VarDecl[], seeds: Seed[]): void => {
    for (const v of vars) if (v.init !== null && v.init !== undefined) inits.push({ expr: v.init, seeds });
  };
  const collectInitClasses = (c: ClassDecl): void => {
    collectInits(c.vars, [...moduleSeeds, ...c.vars.map((v) => ({ name: v.name, type: v.type }))]);
    for (const inner of c.innerClasses) collectInitClasses(inner);
  };
  collectInits(m.vars, moduleSeeds);
  for (const c of m.innerClasses) collectInitClasses(c);

  const scriptNames = new Map<string, string>();
  const collectNames = (c: ClassDecl): void => {
    scriptNames.set(c.name, c.extends ?? "");
    for (const inner of c.innerClasses) collectNames(inner);
  };
  for (const c of m.innerClasses) collectNames(c);
  const subOf = (x: string, base: string): boolean => {
    let cur: string | undefined = x;
    for (let guard = 0; guard < 16 && cur !== undefined; guard++) {
      if (cur === base) return true;
      const p = scriptNames.get(cur);
      if (p === undefined || p === "") return false;
      cur = p;
    }
    return false;
  };
  const ctorClass = (e: Expr): string | null => {
    if (e.kind !== "call" || e.callee.kind !== "attribute" || e.callee.name !== "new" || e.callee.obj.kind !== "ident") return null;
    return scriptNames.has(e.callee.obj.name) ? e.callee.obj.name : null;
  };

  const stOf = (e: Expr, decls: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const d = decls.get(e.name);
      return d === undefined ? null : (d as NonNullable<StaticType>);
    }
    return (ctorClass(e) as NonNullable<StaticType> | null) ?? slotSource(e) ?? (callType(e) as NonNullable<StaticType> | null);
  };

  const badKey = (slot: TypedSlot, index: Expr, decls: Map<string, string>): void => {
    const st = stOf(index, decls);
    if (st === null) return;
    if (slot.kind === "Array") {
      if (st === "int" || st === "float") return;
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if (slot.key === undefined) return;
    if (st === "null") return;
    if (scriptNames.has(slot.key)) {
      if (st === slot.key) return;
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if ((slot.key === "Vector4" && st === "Vector4i") || (slot.key === "Vector4i" && st === "Vector4")) {
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if (canHold(slot.key, st)) return;
    diags.push({
      code: "typed-index-key",
      message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
      loc: index.loc,
    });
  };

  const positionalSlot = (decl: string | null, init: Expr | null): TypedSlot | null => {
    if (decl !== null) {
      const t = parseTyped(decl);
      if (t !== null) return t.kind === "Array" ? t : null;
      if (decl === "Array" || decl === "String" || PACK_SHAPE_NAMES.has(decl)) return { decl, kind: "Array" };
      return null;
    }
    if (init === null) return null;
    if (init.kind === "array") return { decl: "Array", kind: "Array" };
    if (init.kind === "lit" && init.lit === "string") return { decl: "String", kind: "Array" };
    return null;
  };

  const walkExpr = (e: Expr, typed: Map<string, TypedSlot>, decls: Map<string, string>): void => {
    switch (e.kind) {
      case "index": {
        if (e.obj.kind === "ident") {
          const slot = typed.get(e.obj.name);
          if (slot !== undefined) {
            badKey(slot, e.index, decls);
            if (slot.kind === "Dictionary" && stOf(e.index, decls) === "int") run.dictIntReads.add(diKey(run, e.loc.line, e.loc.col));
            if (slot.kind === "Array" && slot.ann !== undefined) run.posReadLabels.set(diKey(run, e.loc.line, e.loc.col), slot.ann);
          }
        } else if (e.obj.kind === "array") {
          badKey({ decl: "Array", kind: "Array" }, e.index, decls);
        } else if (e.obj.kind === "dict") {
          if (stOf(e.index, decls) === "int") run.dictIntReads.add(diKey(run, e.loc.line, e.loc.col));
        } else {
          const own = e.obj.kind === "call" ? dictSlotOf(callType(e.obj) ?? "") : null;
          if (own !== null && own.kind === "Dictionary" && stOf(e.index, decls) === "int") run.dictIntReads.add(diKey(run, e.loc.line, e.loc.col));
        }
        walkExpr(e.obj, typed, decls);
        walkExpr(e.index, typed, decls);
        return;
      }
      case "binary":
        walkExpr(e.left, typed, decls);
        walkExpr(e.right, typed, decls);
        return;
      case "unary":
        walkExpr(e.operand, typed, decls);
        return;
      case "call":
        walkExpr(e.callee, typed, decls);
        for (const a of e.args) walkExpr(a, typed, decls);
        return;
      case "attribute":
        walkExpr(e.obj, typed, decls);
        return;
      case "array":
        for (const it of e.items) walkExpr(it, typed, decls);
        return;
      case "dict":
        for (const en of e.entries) {
          walkExpr(en.key, typed, decls);
          walkExpr(en.value, typed, decls);
        }
        return;
      case "await":
        walkExpr(e.operand, typed, decls);
        return;
      case "lambda": {
        const ltyped = new Map(typed);
        const ldecls = new Map(decls);
        for (const p of e.params) {
          if (p.type === null || p.type.kind !== "named") continue;
          seedInto(ltyped, ldecls, p.name, p.type.name);
        }
        walkStmts(e.body, ltyped, ldecls);
        return;
      }
      default:
        return;
    }
  };

  const valueMsg = (slotKind: string, value: Expr, index: Expr, decls: Map<string, string>, dictSlot = false): void => {
    const st = stOf(value, decls);
    if (st === null || st === "null") return;
    if (dictSlot && scriptNames.has(slotKind)) {
      if (st === slotKind || (scriptNames.has(st) && subOf(st, slotKind))) return;
      diags.push({
        code: "typed-index-assign",
        message: `Value of type "${st}" cannot be assigned to a variable of type "${slotKind}".`,
        loc: value.loc,
      });
      return;
    }
    if (canHold(slotKind, st)) return;
    const literalIndex = index.kind === "lit";
    if (literalIndex) {
      diags.push({
        code: "typed-index-value",
        message: `Cannot assign a value of type "${st}" as "${slotKind}".`,
        loc: value.loc,
      });
    }
    diags.push({
      code: "typed-index-assign",
      message: `Value of type "${st}" cannot be assigned to a variable of type "${slotKind}".`,
      loc: value.loc,
    });
  };

  const walkStmts = (stmts: Stmt[], typed: Map<string, TypedSlot>, decls: Map<string, string>): void => {
    for (const s of stmts) {
      switch (s.kind) {
        case "var": {
          if (s.type !== null && s.type.kind === "named") {
            const slot = parseTyped(s.type.name);
            if (slot !== null) typed.set(s.name, { ...slot, ann: s.type.name });
            else {
              const scalar = scalarStaticName(s.type.name);
              if (scalar !== null) decls.set(s.name, scalar);
              const pos = positionalSlot(s.type.name, null);
              if (pos !== null) typed.set(s.name, { ...pos, ann: s.type.name });
              const ds = dictSlotOf(s.type.name);
              if (ds !== null) typed.set(s.name, { ...ds, ann: s.type.name });
            }
          } else if (s.type === null) {
            const pos = positionalSlot(null, s.init);
            if (pos !== null) typed.set(s.name, pos);
            if (s.init !== null && s.init.kind === "call" && s.init.callee.kind === "ident" && (s.init.callee.name === "Vector4" || s.init.callee.name === "Vector4i")) {
              decls.set(s.name, s.init.callee.name);
            }
          }
          if (s.init !== null) walkExpr(s.init, typed, decls);
          continue;
        }
        case "assign": {
          let handledTarget = false;
          if (s.target.kind === "index" && s.target.obj.kind === "ident") {
            const slot = typed.get(s.target.obj.name);
            if (slot !== undefined) {
              handledTarget = true;
              badKey(slot, s.target.index, decls);
              if (slot.kind === "Dictionary" && stOf(s.target.index, decls) === "int") run.dictIntReads.delete(diKey(run, s.target.loc.line, s.target.loc.col));
              const kind = slot.kind === "Array" ? slot.elem : slot.val;
              if (kind !== undefined) valueMsg(kind, s.value, s.target.index, decls, slot.kind === "Dictionary");
            }
          }
          if (!handledTarget) walkExpr(s.target, typed, decls);
          walkExpr(s.value, typed, decls);
          continue;
        }
        case "expr":
          walkExpr(s.expr, typed, decls);
          continue;
        case "return":
          if (s.value !== null) walkExpr(s.value, typed, decls);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) walkExpr(b.cond, typed, decls);
            walkStmts(b.body, typed, decls);
          }
          continue;
        case "for":
          walkExpr(s.iter, typed, decls);
          walkStmts(s.body, typed, decls);
          continue;
        case "while":
          walkExpr(s.cond, typed, decls);
          walkStmts(s.body, typed, decls);
          continue;
        case "match":
          walkExpr(s.subject, typed, decls);
          for (const arm of s.arms) {
            if (arm.guard !== null) walkExpr(arm.guard, typed, decls);
            walkStmts(arm.body, typed, decls);
          }
          continue;
        default:
          continue;
      }
    }
  };

  const callType = (e: Expr): string | null => {
    if (e.kind !== "call" || e.callee.kind !== "attribute" || e.callee.obj.kind !== "ident") return null;
    if (e.callee.obj.name !== "self") return null;
    const called = e.callee.name;
    const d = m.funcs.find((f) => f.name === called);
    const t = d?.returnType;
    return t !== null && t !== undefined && t.kind === "named" ? t.name : null;
  };

  const seedInto = (typed: Map<string, TypedSlot>, decls: Map<string, string>, name: string, typeName: string): void => {
    const scalar = scalarStaticName(typeName);
    if (scalar !== null) decls.set(name, scalar);
    const pos = positionalSlot(typeName, null);
    if (pos !== null) typed.set(name, { ...pos, ann: typeName });
    const ds = dictSlotOf(typeName);
    if (ds !== null) typed.set(name, { ...ds, ann: typeName });
  };
  const scopeOf = (seeds: Seed[], params: Seed[], ret: TypeRef | null): [Map<string, TypedSlot>, Map<string, string>] => {
    const typed = new Map<string, TypedSlot>();
    const decls = new Map<string, string>();
    if (ret !== null && ret.kind === "named") seedInto(typed, decls, "self", ret.name);
    for (const p of seeds) {
      if (p.type === null || p.type.kind !== "named") continue;
      seedInto(typed, decls, p.name, p.type.name);
    }
    for (const p of params) {
      if (p.type === null || p.type.kind !== "named") continue;
      seedInto(typed, decls, p.name, p.type.name);
    }
    return [typed, decls];
  };
  for (const { stmts, params, seeds, ret } of bodies) {
    const [typed, decls] = scopeOf(seeds, params, ret);
    walkStmts(stmts, typed, decls);
  }
  for (const { expr, seeds } of inits) {
    const [typed, decls] = scopeOf(seeds, [], null);
    walkExpr(expr, typed, decls);
  }
}

export function checkTypedVarAssign(m: Module, diags: Diagnostic[]): void {
  const scalarType = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    if (base === "int" || base === "float" || base === "bool" || base === "String") return base;
    if (base === "StringName") return base;
    return STATIC_VALUE_TYPES.has(base) ? base : null;
  };

  const staticOf = (e: Expr, d: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const t = d.get(e.name);
      return t === undefined ? null : (t as NonNullable<StaticType>);
    }
    return slotSource(e);
  };

  const declRefuse = (name: string, slot: string, init: Expr, slots: Map<string, string>): void => {
    const st = staticOf(init, slots);
    if (st === null || varSlotHolds(slot, st) !== false) return;
    diags.push({
      code: "typed-var-value",
      message: `Cannot assign a value of type "${st}" as "${slot}".`,
      loc: init.loc,
    });
    diags.push({
      code: "typed-var-assign",
      message: `Cannot assign a value of type ${st} to variable "${name}" with specified type ${slot}.`,
      loc: init.loc,
    });
  };

  const checkBody = (body: Stmt[], outer: Map<string, string>): void => {
    const decls = new Map(outer);
    const stmt = (s: Stmt): void => {
      switch (s.kind) {
        case "var": {
          const d = scalarType(s.type);
          if (d !== null) decls.set(s.name, d);
          if (d !== null && s.init) declRefuse(s.name, d, s.init, decls);
          if (s.init) expr(s.init);
          return;
        }
        case "assign": {
          if (s.target.kind === "ident") {
            const slot = decls.get(s.target.name);
            const st = staticOf(s.value, decls);
            if (slot !== undefined && st !== null) {
              const holds = varSlotHolds(slot, st);
              if (holds === false) {
                if (s.value.kind === "lit" || (staticType(s.value) !== null && STATIC_VALUE_TYPES.has(st))) {
                  diags.push({
                    code: "typed-var-value",
                    message: `Cannot assign a value of type "${st}" as "${slot}".`,
                    loc: s.value.loc,
                  });
                }
                diags.push({
                  code: "typed-var-assign",
                  message: `Value of type "${st}" cannot be assigned to a variable of type "${slot}".`,
                  loc: s.value.loc,
                });
              }
            }
          }
          expr(s.value);
          return;
        }
        case "if":
          for (const br of s.branches) {
            if (br.cond) expr(br.cond);
            br.body.forEach(stmt);
          }
          return;
        case "for":
          expr(s.iter);
          s.body.forEach(stmt);
          return;
        case "while":
          expr(s.cond);
          s.body.forEach(stmt);
          return;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard) expr(arm.guard);
            arm.body.forEach(stmt);
          }
          return;
        case "expr":
          expr(s.expr);
          return;
        case "return":
          if (s.value) expr(s.value);
          return;
        default:
          return;
      }
    };
    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "lambda":
          checkBody(e.body, decls);
          return;
        case "call": {
          if (e.callee.kind === "ident" && e.callee.name === "is_instance_of") {
            const msg = instanceOfTypeArgMessage(e);
            if (msg !== null) diags.push({ code: "instance-of-type-arg", message: msg, loc: e.loc });
          }
          expr(e.callee);
          e.args.forEach(expr);
          return;
        }
        case "binary":
          expr(e.left);
          expr(e.right);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          expr(e.operand);
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
        default:
          return;
      }
    };
    body.forEach(stmt);
  };

  const run = (vars: VarDecl[], funcs: FuncDecl[]): void => {
    const outer = new Map<string, string>();
    for (const v of vars) {
      const d = scalarType(v.type);
      if (d !== null) outer.set(v.name, d);
    }
    for (const v of vars) {
      const d = scalarType(v.type);
      if (d !== null && v.init) declRefuse(v.name, d, v.init, outer);
    }
    for (const f of funcs) checkBody(f.body, outer);
  };

  run(m.vars, m.funcs);
  const classes = (c: ClassDecl): void => {
    run(c.vars, c.funcs);
    for (const inner of c.innerClasses) classes(inner);
  };
  for (const c of m.innerClasses) classes(c);
}

export function checkPackIsAs(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  for (const body of bodies) {
    const snVars = new Set<string>();
    stringNameVars(body, snVars);
    const found: Extract<Expr, { kind: "is" | "as" }>[] = [];
    walkExprKinds(body, found);
    for (const node of found) {
      if (node.type.kind !== "named") continue;
      const target = node.type.name.replace(/\[.*\]$/, "");
      const packTarget = PACK_IS_AS_NAMES.has(target);
      const snVarOperand = node.operand.kind === "ident" && snVars.has(node.operand.name);
      const snAgainstString = target === "String" && node.kind === "is" && (snVarOperand || staticTypeName(node.operand) === "StringName");
      if (!packTarget && !snAgainstString) continue;
      const from = snVarOperand && !packTarget ? "StringName" : staticTypeName(node.operand);
      if (from === null) continue;
      if (node.kind === "is") {
        diags.push({
          code: "pack-is-type",
          message: `Expression is of type "${from}" so it can't be of type "${target}".`,
          loc: node.loc,
        });
      } else {
        diags.push({ code: "pack-as-type", message: `Cannot cast a value of type "${from}" as "${target}".`, loc: node.loc });
        diags.push({ code: "pack-as-type", message: `Invalid cast. Cannot convert from "${from}" to "${target}".`, loc: node.loc });
      }
    }
  }
}

export function checkPackArgSlots(m: Module, diags: Diagnostic[]): void {
  for (const { nodes, base } of packArgScopes(m)) {
    const packs = new Map<string, string>();
    const annot = new Map<string, string>();
    for (const [name, ty] of base) {
      if (ty in PACK_ARG_SLOTS) packs.set(name, ty);
      else if (ANNOT_SOURCES.has(ty)) annot.set(name, ty);
    }
    const reassigned = reassignedNames(nodes);
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || reassigned.has(n.name)) continue;
      const type = n.type as TypeRef | null;
      if (type !== null && type.kind === "named" && type.name in PACK_ARG_SLOTS) {
        packs.set(n.name, type.name);
        continue;
      }
      if (type !== null && type.kind === "named" && ANNOT_SOURCES.has(type.name)) annot.set(n.name, type.name);
      const init = n.init as Expr | null;
      if (init !== null && init.kind === "call" && init.callee.kind === "ident" && init.callee.name in PACK_ARG_SLOTS) {
        packs.set(n.name, init.callee.name);
      }
    }
    const annAll = new Map<string, string>(base);
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || reassigned.has(n.name)) continue;
      const type = n.type as TypeRef | null;
      if (type !== null && type.kind === "named") annAll.set(n.name, type.name);
    }
    const ownerFace = (obj: Expr): string | null => {
      if (obj.kind === "lit") return obj.lit === "string" ? "String" : null;
      if (obj.kind === "ident" && typeof obj.name === "string") return packs.get(obj.name) ?? annot.get(obj.name) ?? base.get(obj.name) ?? null;
      return obj.kind === "call" ? chainRecvFace(obj, ownerFace) : null;
    };

    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "attribute") continue;
      const obj = callee.obj as Record<string, unknown> | undefined;
      if (obj === undefined) continue;
      const objCallee = obj.kind === "call" ? (obj.callee as Record<string, unknown> | undefined) : undefined;
      const inline = objCallee !== undefined && objCallee["kind"] === "ident" && typeof objCallee["name"] === "string"
        && String(objCallee["name"]) in PACK_ARG_SLOTS ? String(objCallee["name"]) : null;
      const viaChain = obj.kind === "call" ? chainRecvFace(obj as Expr, ownerFace) : null;
      const pack = obj.kind === "ident" && typeof obj.name === "string"
        ? (packs.get(obj.name) ?? (obj.name in PACK_ARG_SLOTS ? obj.name : undefined))
        : (inline ?? (viaChain !== null && PACK_TYPE_NAMES.has(viaChain) ? viaChain : undefined));
      if (pack === undefined) continue;
      const method = callee.name;
      if (typeof method !== "string") continue;
      const slots = PACK_ARG_POSITIONS[method];
      if (slots === undefined) continue;
      const args = (n.args as Expr[]) ?? [];
      const face = PACK_ARG_SLOTS[pack] as { slot: string; ok: readonly string[] };
      for (let p = 0; p < Math.min(slots.length, args.length); p++) {
        const arg0 = args[p] as Expr;
        const src = packArgSource(arg0);
        const annotated = src === null ? namedSlotSource(arg0, annAll) : null;
        const proven = src ?? annotated;
        const kind = slots[p];
        if (kind === "a") {
          const namedA = arg0.kind === "ident" ? namedAppendSource(arg0.name, annAll) : null;
          const srcA = src ?? namedA;
          if (srcA !== null && (srcA === "null" || OBJECT_ARG_NAMES.has(srcA)) && !VALUE_ARG_WANTS.has(pack)) continue;
          const baseA = srcA === null ? "" : argFaceBase(srcA);
          if (srcA === null || baseA === "Array" || baseA === pack) continue;
          const two = PACK_APPEND_ARRAY_AS.includes(baseA);
          if (!two && !(baseA === "Dictionary" || PACK_TYPE_NAMES.has(baseA))) continue;
          const aloc = (n.loc as Diagnostic["loc"]) ?? null;
          if (two && namedA === null) {
            diags.push({ code: "pack-arg-slot", message: `Cannot pass a value of type "${srcA}" as "${pack}".`, loc: aloc });
          }
          diags.push({
            code: "pack-arg-slot",
            message: `Invalid argument for "${method}()" function: argument ${String(p + 1)} should be "${pack}" but is "${srcA}".`,
            loc: aloc,
          });
          continue;
        }
        if (proven === null) continue;
        const slot = kind === "i" ? "int" : kind === "b" ? "bool" : face.slot;
        const ok = kind === "i" ? PACK_INT_SLOT_OK : kind === "b" ? PACK_BOOL_SLOT_OK : face.ok;
        if (ok.includes(proven)) continue;
        if (OBJECT_ARG_NAMES.has(proven) && !VALUE_ARG_WANTS.has(slot)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        if (src !== null && proven !== "Array" && proven !== "Dictionary" && !PACK_TYPE_NAMES.has(proven)) {
          diags.push({ code: "pack-arg-slot", message: `Cannot pass a value of type "${proven}" as "${slot}".`, loc });
        }
        diags.push({
          code: "pack-arg-slot",
          message: `Invalid argument for "${method}()" function: argument ${String(p + 1)} should be "${slot}" but is "${proven}".`,
          loc,
        });
      }
    }
  }
}

export function checkPackFaceNames(m: Module, diags: Diagnostic[]): void {
  for (const { nodes, params } of attrScopes(m)) {
    const ann = new Map<string, string>();
    const faceName = (t: TypeRef | null): string | null =>
      t !== null && t.kind === "named" && (PACK_TYPE_NAMES.has(t.name) || t.name === "Array" || t.name === "String" || t.name === "StringName" || t.name === "NodePath" || t.name === "int" || t.name === "float" || t.name === "bool" || t.name in VALUE_METHOD_ARITY) ? t.name : null;
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string") continue;
      const face = faceName(n.type as TypeRef | null);
      if (face !== null) ann.set(n.name, face);
    }
    const attr = new Map(ann);
    for (const p of params) {
      const face = faceName(p.type);
      if (face !== null) attr.set(p.name, face);
    }
    const mods = new Map<string, string>();
    for (const v of m.vars) {
      const face = faceName(v.type);
      if (face !== null) mods.set(v.name, face);
    }
    const elems = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) elems.set(name, t.name);
    };
    for (const v of m.vars) noteElem(v.name, v.type);
    for (const n of nodes) {
      if (n.kind === "var" && typeof n.name === "string") noteElem(n.name, n.type as TypeRef | null);
    }
    for (const prm of params) noteElem(prm.name, prm.type);
    const callCallees = new Set<unknown>();
    const writeTargets = new Set<unknown>();
    for (const n of nodes) {
      if (n.kind === "call") callCallees.add(n.callee);
      if (n.kind === "assign") {
        const t = n.target as Record<string, unknown> | undefined;
        if (t !== undefined && t.kind === "attribute") writeTargets.add(t);
      }
    }
    for (const n of nodes) {
      if (n.kind === "call") {
        const callee = n.callee as Record<string, unknown> | undefined;
        if (callee === undefined || callee.kind !== "attribute") continue;
        const kind = packFaceRecv(callee.obj as Record<string, unknown>, attr);
        if (kind === null || !PACK_TYPE_NAMES.has(kind)) {
          const recvObj = callee.obj as Record<string, unknown>;
          const chainRecv = recvObj.kind === "call" && (recvObj.callee as Record<string, unknown> | undefined)?.kind === "attribute";
          const vface = attrFaceRecv(recvObj, attr, elems, mods);
          if (vface === null || (!instanceFaceManaged(vface) && !PACK_TYPE_NAMES.has(vface) && vface !== "StringName" && vface !== "NodePath")) continue;
          if (vface === "String" && recvObj.kind !== "index" && !chainRecv) continue;
          const vmethod = callee.name;
          if (typeof vmethod !== "string") continue;
          if (vmethod in (VALUE_METHOD_ARITY[vface] ?? {}) || !memberNameAbsent(vface, vmethod)) continue;
          const vloc = (n.loc as Diagnostic["loc"]) ?? null;
          diags.push({ code: "face-member-missing", message: `Cannot find member "${vmethod}" in base "${vface}".`, loc: vloc });
          diags.push({ code: "face-member-not-found", message: `Function "${vmethod}()" not found in base ${vface}.`, loc: vloc });
          continue;
        }
        const method = callee.name;
        if (typeof method !== "string" || method in (VALUE_METHOD_ARITY[kind] ?? {})) continue;
        if (!memberNameAbsent(kind, method)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        diags.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${kind}".`, loc });
        diags.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${kind}.`, loc });
        continue;
      }
      if (n.kind !== "attribute" || callCallees.has(n)) continue;
      const face = attrFaceRecv(n.obj as Record<string, unknown>, attr, elems, mods);
      const name = n.name;
      if (typeof name !== "string") continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      if (face === null) {
        const rec = n.obj as Record<string, unknown>;
        if (name === "new" && rec.kind === "ident" && typeof rec.name === "string") {
          const annText = elems.get(rec.name) ?? attr.get(rec.name) ?? "";
          if (/^(Array|Dictionary)\[[^\]]+\]$/.test(annText)) {
            const shown = annText.replace(/\[([^\]]*)\]/, (_m, inner: string) => `[${inner.split(",").map((s) => s.trim()).join(", ")}]`);
            const one = `Cannot find member "new" in base "${shown}".`;
            diags.push({ code: "face-attr-missing", message: one, loc });
            if (annText.startsWith("Array")) diags.push({ code: "face-attr-missing", message: one, loc });
          }
        }
        continue;
      }
      const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "String" ? STRING_METHOD_ARITY : face === "StringName" ? STRING_NAME_METHOD_ARITY : face === "NodePath" ? NODE_PATH_METHOD_ARITY : (VALUE_METHOD_ARITY[face] ?? {});
      const refused = PACK_TYPE_NAMES.has(face) || face === "Array" || face === "String";
      if (name in table) {
        if (writeTargets.has(n)) {
          if (refused) diags.push({ code: "face-attr-constant", message: "Cannot assign a new value to a constant.", loc });
        } else {
          const l = n.loc as { line: number; col: number } | undefined;
          const bounds = table[name];
          if (l !== undefined && bounds !== undefined) run.boundFaces.set(diKey(run, l.line, l.col), face + "," + String(bounds[0]) + "," + String(bounds[1]));
        }
        continue;
      }
      const absent = PACK_TYPE_NAMES.has(face)
        ? memberNameAbsent(face, name)
        : face === "Array" || face === "String"
          ? true
          : valueAttrKind(face, name) === "absent" || instanceMemberAbsent(face, name) ||
            ((face === "StringName" || face === "NodePath") && memberNameAbsent(face, name));
      if (!absent) continue;
      if (!refused && writeTargets.has(n)) continue;
      const one = `Cannot find member "${name}" in base "${face}".`;
      diags.push({ code: "face-attr-missing", message: one, loc });
      diags.push({ code: "face-attr-missing", message: one, loc });
    }
  }
}

export function checkDictMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded, texts: scopeTexts } of faceScopes(m, "Dictionary", (init) => init.kind === "dict")) {
    const texts = new Map(scopeTexts);
    const dicts = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict");
    const dictAnn = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict", true, texts);
    for (const n of nodes) {
      const d = containerCallArity(n, DICT_METHOD_ARITY, "dict-arity", dicts, (obj) => obj.kind === "dict");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, DICT_METHOD_ARITY, "Dictionary", false, dictAnn, (obj) => obj.kind === "dict", texts)) diags.push(g);
    }
  }
}

export function checkArrayMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded, texts: scopeTexts } of faceScopes(m, "Array", (init) => init.kind === "array")) {
    const texts = new Map(scopeTexts);
    const arrays = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array");
    const arrAnn = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array", true, texts);
    for (const n of nodes) {
      const d = containerCallArity(n, ARRAY_METHOD_ARITY, "array-arity", arrays, (obj) => obj.kind === "array");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, ARRAY_METHOD_ARITY, "Array", true, arrAnn, (obj) => obj.kind === "array", texts)) diags.push(g);
    }
  }
}

export function checkDictDuplicateKeys(m: Module, diags: Diagnostic[]): void {
  const expr = (e: Expr): void => {
    switch (e.kind) {
      case "index":
        expr(e.obj);
        expr(e.index);
        return;
      case "attribute":
        expr(e.obj);
        return;
      case "binary":
        expr(e.left);
        expr(e.right);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand);
        return;
      case "array":
        for (const it of e.items) expr(it);
        return;
      case "call":
        expr(e.callee);
        for (const a of e.args) expr(a);
        return;
      case "dict": {
        const seen = new Map<string, Loc>();
        for (const en of e.entries) {
          expr(en.key);
          expr(en.value);
          const key = foldDictKey(en.key);
          if (key === null) continue;
          const token = dictKeyToken(key);
          const first = seen.get(token);
          if (first === undefined) seen.set(token, en.key.loc);
          else diags.push({ code: "dict-dup-key", message: `Key "${dictKeyText(key)}" was already used in this dictionary (at line ${String(first?.line ?? 0)}).`, loc: en.key.loc });
        }
        return;
      }
      case "lambda":
        stmts(e.body);
        return;
      default:
        return;
    }
  };
  const stmts = (body: Stmt[]): void => {
    for (const s of body) {
      switch (s.kind) {
        case "expr":
          expr(s.expr);
          continue;
        case "var":
          if (s.init !== null) expr(s.init);
          continue;
        case "assign":
          expr(s.target);
          expr(s.value);
          continue;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) expr(br.cond);
            stmts(br.body);
          }
          continue;
        case "for":
          expr(s.iter);
          stmts(s.body);
          continue;
        case "while":
          expr(s.cond);
          stmts(s.body);
          continue;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard !== null) expr(arm.guard);
            stmts(arm.body);
          }
          continue;
        case "return":
          if (s.value !== null) expr(s.value);
          continue;
        default:
          continue;
      }
    }
  };
  const vars = (list: VarDecl[]): void => {
    for (const v of list) {
      if (v.init !== null) expr(v.init);
      const acc = v.accessor;
      if (acc !== null) {
        if (acc.getter !== null && acc.getter.kind === "inline") stmts(acc.getter.body);
        if (acc.setter !== null && acc.setter.kind === "inline") stmts(acc.setter.body);
      }
    }
  };
  const classes = (list: ClassDecl[]): void => {
    for (const c of list) {
      vars(c.vars);
      for (const f of c.funcs) stmts(f.body);
      classes(c.innerClasses);
    }
  };
  vars(m.vars);
  for (const f of m.funcs) stmts(f.body);
  classes(m.innerClasses);
}
