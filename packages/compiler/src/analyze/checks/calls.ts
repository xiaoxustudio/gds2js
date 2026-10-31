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
import { COLOR_NAMED } from "@gds2js/runtime/runtime/class/color/named";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "../../lower/ir";

import { argNameScopes, argNameType, chainRecvFace, ctorRecvFace, faceReceiverNames, faceScopes, knownFaceAnnotation, literalFaceType, literalTypeName, readFaceOf, staticType, valueTypeAnnotation } from "../faces";
import { classTable, collectLocalNames, flattenBodies, flattenBody, moduleAssignedNames, walkExpr, walkStmt } from "../walk";
import { arityDiag, chainArityFace, classFaceArity, containerCallArity, faceGhostDiags, faceListHas, staticBareDiags, staticCallDiags, valueCtorType } from "../arity";
import { classFaceArgDiags, classSlotNames, ctorArgName, funcSlotName, literalIntArg, nameArgBad, nullRefusedByValueSlot, objectNameRefusedByValueSlot, slotSource } from "../slots";
import { nonNumericLiteral, numericLiteralKind } from "../literals";

export function checkStringMethodArity(m: Module, diags: Diagnostic[]): void {
  const isStringLit = (obj: Record<string, unknown>): boolean => obj.kind === "lit" && obj.lit === "string";
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, "String", (init) => init.kind === "lit" && init.lit === "string")) {
    const strs = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string");
    const strAnn = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string", true);
    const reads = new Map<string, string>();
    const noteRead = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) reads.set(name, t.name);
    };
    for (const v of m.vars) noteRead(v.name, v.type);
    for (const n of nodes) {
      if (n.kind === "var" && typeof n.name === "string") noteRead(n.name, n.type as TypeRef | null);
    }
    const isStringRead = (obj: Record<string, unknown>): boolean => {
      if (obj.kind !== "index") return false;
      const base = obj.obj as Record<string, unknown> | undefined;
      if (base === undefined || base.kind !== "ident" || typeof base.name !== "string") return false;
      return readFaceOf(reads.get(base.name) ?? "", staticType(obj.index as Expr)) === "String";
    };
    for (const n of nodes) {
      const d = containerCallArity(n, STRING_METHOD_ARITY, "string-arity", strs, (obj) => isStringLit(obj) || isStringRead(obj));
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, STRING_METHOD_ARITY, "String", true, strAnn, isStringLit)) diags.push(g);
    }
  }
}

export function checkNamedFace(m: Module, face: NamedFace, diags: Diagnostic[]): void {
  const isLiteral = (obj: Record<string, unknown>): boolean =>
    (obj.kind === "lit" && obj.lit === face.lit) || ctorRecvFace(obj, face);
  const isRecvInit = (init: Expr): boolean =>
    (init.kind === "lit" && init.lit === face.lit) || ctorRecvFace(init as unknown as Record<string, unknown>, face);
  const assigned = moduleAssignedNames(m);
  const argAnnAll = argNameScopes(m);
  for (const { nodes, seeded, body } of faceScopes(m, face.type, isRecvInit)) {
    const names = faceReceiverNames(nodes, seeded, assigned, face.type, isRecvInit);
    const argAnn = argAnnAll.get(body) ?? new Map<string, string>();
    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "attribute") continue;
      const obj = callee.obj as Record<string, unknown> | undefined;
      if (obj === undefined) continue;
      const method = callee.name;
      if (typeof method !== "string") continue;
      const proven = isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name));
      if (!proven) continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      const d = arityDiag(face.arity, face.arityCode, method, ((n.args as Expr[]) ?? []).length, loc);
      if (d !== null) diags.push(d);
      const fkey = `${face.type}.${method}`;
      const got = (n.args as Expr[]) ?? [];
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        if (bucket.some((d) => d.message === message)) return;
        bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      for (const [pos, refuse, want, also] of FACE_ARG_AS[fkey] ?? []) {
        const lit = got[pos - 1];
        const bad = literalTypeName(lit);
        if (bad !== null) {
          const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
          if (!refuse.includes(bad) && !nullSlot) continue;
          put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
          if (nullSlot || also.includes(bad)) {
            put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`);
          }
          continue;
        }
        const named = argNameType(lit, argAnn);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
        put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${named}".`);
      }
      for (const [pos, refuse, want] of FACE_ARG_TYPES[fkey] ?? []) {
        const lit = got[pos - 1];
        const bad = literalTypeName(lit);
        if (bad !== null) {
          if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
          put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`);
          continue;
        }
        const named = argNameType(lit, argAnn);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
        put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${named}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const g of byPos.get(pos)!) diags.push({ code: g.code, message: g.message, loc });
      }
    }
  }
}

export function checkCtorSignatures(m: Module, diags: Diagnostic[]): void {
  const shadowed = new Set(m.funcs.map((f) => f.name));
  for (const nodes of flattenBodies(m)) {
    const argTypes = new Map<string, string>();
    for (const n of nodes) {
      if (n.kind !== "var") continue;
      const t = n.type as Record<string, unknown> | null | undefined;
      const nm = n.name;
      if (t !== undefined && t !== null && t.kind === "named" && typeof t.name === "string" && typeof nm === "string") argTypes.set(nm, t.name);
    }
    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "ident" || typeof callee.name !== "string") continue;
      const name = callee.name;
      if (shadowed.has(name)) continue;
      const bad = CTOR_REFUSED[name];
      if (bad === undefined) continue;
      const kinds = ((n.args as Expr[]) ?? []).map((a) => ctorArgName(a, argTypes));
      if (kinds.some((k) => k === null)) continue;
      const sig = kinds.join(", ");
      if (!bad.some((t) => t.join(", ") === sig)) continue;
      diags.push({
        code: "ctor-signature",
        message: `No constructor of "${name}" matches the signature "${name}(${sig})".`,
        loc: (n.loc as Diagnostic["loc"]) ?? null,
      });
    }
  }
}

export function checkFuncArgSlots(m: Module, globals: Set<string>, diags: Diagnostic[]): void {
  const classSlots = classSlotNames(m, globals);
  const moduleSigs = new Map<string, Param[]>();
  for (const f of m.funcs) moduleSigs.set(f.name, f.params);
  const classes = classTable(m);

  const sigsFor = (c: ClassDecl): Map<string, Param[]> => {
    const out = new Map(moduleSigs);
    const chain: ClassDecl[] = [];
    const seen = new Set<string>();
    let cur: ClassDecl | null = c;
    while (cur !== null && !seen.has(cur.name)) {
      seen.add(cur.name);
      chain.unshift(cur);
      cur = cur.extends !== null ? classes.get(cur.extends) ?? null : null;
    }
    for (const cc of chain) for (const f of cc.funcs) out.set(f.name, f.params);
    return out;
  };

  const targets: Array<{ body: Stmt[]; sigs: Map<string, Param[]> }> = [];
  for (const f of m.funcs) targets.push({ body: f.body, sigs: moduleSigs });
  const collectClass = (c: ClassDecl): void => {
    const sigs = sigsFor(c);
    for (const f of c.funcs) targets.push({ body: f.body, sigs });
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);

  for (const { body, sigs } of targets) {
    const nodes: Record<string, unknown>[] = [];
    const scan = (n: unknown): void => {
      if (Array.isArray(n)) {
        for (const x of n) scan(x);
        return;
      }
      if (n === null || typeof n !== "object") return;
      const obj = n as Record<string, unknown>;
      if (obj.kind === "lambda") return;
      nodes.push(obj);
      for (const key of Object.keys(obj)) {
        if (key !== "loc") scan(obj[key]);
      }
    };
    scan(body);

    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined) continue;
      let fname: string | null = null;
      if (callee.kind === "ident" && typeof callee.name === "string") fname = callee.name;
      else if (callee.kind === "attribute" && typeof callee.name === "string") {
        const base = callee.obj as Record<string, unknown> | undefined;
        if (base !== undefined && base.kind === "ident" && base.name === "self") fname = callee.name;
      }
      if (fname === null) continue;
      const params = sigs.get(fname);
      if (params === undefined) continue;
      const args = (n.args as Expr[]) ?? [];
      if (args.length !== params.length) continue;
      for (let i = 0; i < args.length; i++) {
        const ptype = (params[i] as Param).type;
        const slot = funcSlotName(ptype);
        const src = slotSource(args[i] as Expr);
        if (src === null) continue;
        if (slot !== null) {
          const accept = FUNC_ARG_SLOTS[slot] as readonly string[];
          if (accept.includes(src)) continue;
          const loc = (n.loc as Diagnostic["loc"]) ?? null;
          if (src !== "Array" && src !== "Dictionary") {
            diags.push({ code: "func-arg-slot", message: `Cannot pass a value of type "${src}" as "${slot}".`, loc });
          }
          diags.push({
            code: "func-arg-slot",
            message: `Invalid argument for "${fname}()" function: argument ${i + 1} should be "${slot}" but is "${src}".`,
            loc,
          });
          continue;
        }
        if (ptype === null || ptype.kind !== "named" || src === "null") continue;
        const cname = ptype.name.replace(/\[.*\]$/, "");
        if (!classSlots.has(cname)) continue;
        if (["Array", "Dictionary"].includes(src) || cname === src) continue;
        if (!["int", "float", "bool", "String", "StringName"].includes(src)) continue;
        diags.push({
          code: "func-arg-class-slot",
          message: `Invalid argument for "${fname}()" function: argument ${i + 1} should be "${cname}" but is "${src}".`,
          loc: (n.loc as Diagnostic["loc"]) ?? null,
        });
      }
    }
  }
}

export function checkStaticAccess(funcs: FuncDecl[], vars: VarDecl[], diags: Diagnostic[]): void {
  const instanceVars = new Set(vars.filter((v) => !v.isConst && !v.isStatic).map((v) => v.name));
  const instanceFuncs = new Set(funcs.filter((f) => !f.isStatic).map((f) => f.name));
  if (instanceVars.size === 0 && instanceFuncs.size === 0) return;

  const contexts: Array<{ who: string; body: Stmt[]; init: Expr | null; params: string[] }> = [];
  for (const f of funcs) {
    if (f.isStatic) contexts.push({ who: `the static function "${f.name}()"`, body: f.body, init: null, params: f.params.map((p) => p.name) });
  }
  for (const v of vars) {
    if (!v.isStatic) continue;
    contexts.push({ who: "a static variable initializer", body: [], init: v.init, params: [] });
    const a = v.accessor;
    if (a === null || a === undefined) continue;
    if (a.getter !== null && a.getter.kind === "inline") contexts.push({ who: `the static function "@${v.name}_getter()"`, body: a.getter.body, init: null, params: [] });
    if (a.setter !== null && a.setter.kind === "inline") contexts.push({ who: `the static function "@${v.name}_setter()"`, body: a.setter.body, init: null, params: [a.setter.param] });
  }

  for (const ctx of contexts) {
    const local = new Set<string>();
    collectLocalNames(ctx.body, ctx.params, local);

    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "ident":
          if (!local.has(e.name) && instanceVars.has(e.name)) {
            diags.push({
              code: "static-access-var",
              message: `Cannot access non-static variable "${e.name}" from ${ctx.who}.`,
              loc: e.loc,
            });
          }
          return;
        case "call": {
          if (e.callee.kind === "ident" && !local.has(e.callee.name) && instanceFuncs.has(e.callee.name)) {
            diags.push({
              code: "static-call-func",
              message: `Cannot call non-static function "${e.callee.name}()" from ${ctx.who}.`,
              loc: e.loc,
            });
          }
          expr(e.callee);
          for (const a of e.args) expr(a);
          return;
        }
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
        case "dict":
          for (const en of e.entries) {
            expr(en.key);
            expr(en.value);
          }
          return;
        case "lambda":
          for (const st of e.body) stmt(st);
          return;
        case "lit":
          return;
      }
    };
    const stmt = (s: Stmt): void => {
      switch (s.kind) {
        case "expr":
          expr(s.expr);
          return;
        case "var":
          if (s.init !== null) expr(s.init);
          return;
        case "assign":
          expr(s.target);
          expr(s.value);
          return;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) expr(br.cond);
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
            if (arm.guard !== null) expr(arm.guard);
            arm.body.forEach(stmt);
          }
          return;
        case "return":
          if (s.value !== null) expr(s.value);
          return;
        default:
          return;
      }
    };
    if (ctx.init !== null) expr(ctx.init);
    ctx.body.forEach(stmt);
  }
}

export function checkMethodCall(name: string, e: Extract<Expr, { kind: "call" }>, diags: Diagnostic[]): void {
  if (name !== "join") return;
  const recv = e.callee.kind === "attribute" ? e.callee.obj : null;
  if (recv !== null && !(recv.kind === "lit" && recv.lit === "string")) {
    return;
  }
  if (e.args.length === 0) {
    diags.push({
      code: "join-arity",
      message: `Too few arguments for "join()" call. Expected at least 1 but received 0.`,
      loc: e.loc,
    });
    return;
  }
  if (e.args.length > 1) {
    diags.push({
      code: "join-arity",
      message: `Too many arguments for "join()" call. Expected at most 1 but received ${e.args.length}.`,
      loc: e.loc,
    });
    return;
  }
  const argKind = literalTypeName(e.args[0]);
  const t = staticType(e.args[0] as Expr);
  const msg = argKind !== null || t === null ? undefined : JOIN_BAD_ARG[t];
  if (msg !== undefined) diags.push({ code: "join-arg", message: msg, loc: e.loc });
}

export function checkCall(name: string, e: Extract<Expr, { kind: "call" }>, diags: Diagnostic[]): void {
  if (name !== "bool" || e.args.length === 0) return;
  const t = staticType(e.args[0] as Expr);
  if (t === "Array" || t === "String" || t === "Dictionary") {
    diags.push({
      code: "bool-ctor-signature",
      message: `No constructor of "bool" matches the signature "bool(${t})".`,
      loc: e.loc,
    });
  }
}

export function checkValueMethodArity(m: Module, diags: Diagnostic[]): void {
  const moduleVars = new Map<string, string>();
  for (const v of m.vars) {
    const t = valueTypeAnnotation(v.type) ?? (v.type === null ? valueCtorType(v.init) : null);
    if (t !== null) moduleVars.set(v.name, t);
  }

  const funcs: Array<{ f: FuncDecl; base: Map<string, string>; fields: Map<string, string>; nameFields: Map<string, string> }> =
    m.funcs.map((f) => ({ f, base: moduleVars, fields: new Map<string, string>(), nameFields: new Map<string, string>() }));
  const collect = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    const nameFields = new Map<string, string>();
    for (const v of c.vars) {
      const ft = v.type !== null && v.type.kind === "named" && FACE_ANNOTATIONS.has(v.type.name) ? v.type.name : null;
      if (ft !== null) fields.set(v.name, ft);
      else {
        const vt = valueTypeAnnotation(v.type);
        if (vt !== null) fields.set(v.name, vt);
        else {
          const nf = knownFaceAnnotation(v.type);
          if (nf !== null && !(nf in PACK_ARG_SLOTS)) nameFields.set(v.name, nf);
        }
      }
    }
    for (const f of c.funcs) funcs.push({ f, base: new Map<string, string>(), fields, nameFields });
    for (const x of c.innerClasses) collect(x);
  };
  for (const c of m.innerClasses) collect(c);

  const argAnnAll = argNameScopes(m);
  for (const { f, base, fields, nameFields } of funcs) {
    const typed = new Map(base);
    const argAnn = argAnnAll.get(f.body) ?? new Map<string, string>();
    const faceTyped = new Map<string, string>();
    for (const v of m.vars) {
      if (v.type !== null && v.type.kind === "named" && FACE_ANNOTATIONS.has(v.type.name)) faceTyped.set(v.name, v.type.name);
    }
    for (const p of f.params) {
      const t = valueTypeAnnotation(p.type);
      if (t !== null) typed.set(p.name, t);
      if (p.type !== null && p.type.kind === "named" && FACE_ANNOTATIONS.has(p.type.name)) faceTyped.set(p.name, p.type.name);
    }
    for (const [name, t] of fields) {
      if (FACE_ANNOTATIONS.has(t)) faceTyped.set(name, t);
      else typed.set(name, t);
    }
    const elemFaces = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) elemFaces.set(name, t.name);
    };
    for (const v of m.vars) noteElem(v.name, v.type);
    for (const prm of f.params) noteElem(prm.name, prm.type);
    for (const n of flattenBody(f.body)) {
      if (n.kind === "var" && typeof n.name === "string") noteElem(n.name, n.type as TypeRef | null);
    }
    const recvElem = (obj: Expr): string | null => {
      if (obj.kind !== "index" || obj.obj.kind !== "ident") return null;
      return readFaceOf(elemFaces.get(obj.obj.name) ?? "", staticType(obj.index));
    };
    const nameFaces = new Map<string, string>();
    const noteNameFace = (name: string, t: TypeRef | null): void => {
      const f = knownFaceAnnotation(t);
      if (f !== null) nameFaces.set(name, f);
    };
    for (const v of m.vars) noteNameFace(v.name, v.type);
    for (const prm of f.params) noteNameFace(prm.name, prm.type);
    for (const n of flattenBody(f.body)) {
      if (n.kind === "var" && typeof n.name === "string") noteNameFace(n.name, n.type as TypeRef | null);
    }
    for (const [name, t] of nameFields) nameFaces.set(name, t);
    const recvOwner = (obj: Expr): string | null => {
      const viaLit = literalFaceType(obj, faceTyped);
      if (viaLit !== null) return viaLit;
      if (obj.kind === "ident") return typed.get(obj.name) ?? nameFaces.get(obj.name) ?? null;
      if (obj.kind === "index") return recvElem(obj);
      return obj.kind === "call" ? valueCtorType(obj) ?? chainRecvFace(obj, recvOwner) : null;
    };
    const recvChain = (obj: Expr): string | null => (obj.kind === "call" ? chainRecvFace(obj, recvOwner) : null);

    const calls: Extract<Expr, { kind: "call" }>[] = [];
    const staticCallees = new Set<Expr>();
    const varDecls: Extract<Stmt, { kind: "var" }>[] = [];
    const assigned = new Set<string>();

    const walkExpr = (e: Expr): void => {
      switch (e.kind) {
        case "attribute":
          if (!staticCallees.has(e) && e.obj.kind === "ident") {
            for (const d of staticBareDiags(e.obj.name, e.name)) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
          walkExpr(e.obj);
          return;
        case "index":
          walkExpr(e.obj);
          walkExpr(e.index);
          return;
        case "binary":
          walkExpr(e.left);
          walkExpr(e.right);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          walkExpr(e.operand);
          return;
        case "array":
          for (const it of e.items) walkExpr(it);
          return;
        case "dict":
          for (const en of e.entries) {
            walkExpr(en.key);
            walkExpr(en.value);
          }
          return;
        case "call":
          calls.push(e);
          if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" &&
              (e.callee.obj.name in STATIC_FACE || BUILTIN_NEW_ABSENT_FACES.has(e.callee.obj.name))) {
            staticCallees.add(e.callee);
          }
          walkExpr(e.callee);
          for (const a of e.args) walkExpr(a);
          return;
        default:
          return;
      }
    };

    const walkStmt = (s: Stmt): void => {
      switch (s.kind) {
        case "expr":
          walkExpr(s.expr);
          return;
        case "var":
          varDecls.push(s);
          if (s.init !== null) walkExpr(s.init);
          return;
        case "assign":
          if (s.target.kind === "ident") assigned.add(s.target.name);
          walkExpr(s.target);
          walkExpr(s.value);
          return;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) walkExpr(br.cond);
            for (const x of br.body) walkStmt(x);
          }
          return;
        case "for":
          walkExpr(s.iter);
          for (const x of s.body) walkStmt(x);
          return;
        case "while":
          walkExpr(s.cond);
          for (const x of s.body) walkStmt(x);
          return;
        case "match":
          walkExpr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard !== null) walkExpr(arm.guard);
            for (const x of arm.body) walkStmt(x);
          }
          return;
        case "return":
          if (s.value !== null) walkExpr(s.value);
          return;
        default:
          return;
      }
    };

    for (const s of f.body) walkStmt(s);

    for (const d of varDecls) {
      if (d.type === null && assigned.has(d.name)) continue;
      const t = valueTypeAnnotation(d.type) ?? (d.type === null ? valueCtorType(d.init) : null);
      if (t !== null) typed.set(d.name, t);
      if (d.type !== null && d.type.kind === "named" && FACE_ANNOTATIONS.has(d.type.name)) faceTyped.set(d.name, d.type.name);
      if (d.type === null && d.init !== null) {
        const inferred = literalFaceType(d.init, new Map());
        if (inferred !== null) faceTyped.set(d.name, inferred);
      }
    }

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "attribute") continue;
      if (callee.obj.kind === "ident" && (callee.obj.name in STATIC_FACE || PACK_TYPE_NAMES.has(callee.obj.name) || classFaceArity(callee.obj.name) !== undefined)) {
        for (const d of staticCallDiags(callee.obj.name, callee.name, e.args.length)) diags.push({ code: d.code, message: d.message, loc: e.loc });
        const clsTable = classFaceArity(callee.obj.name) ?? VALUE_METHOD_ARITY[callee.obj.name];
        const clsSig = callee.name in (clsTable ?? {}) ? clsTable?.[callee.name] : undefined;
        if (STATIC_FACE[callee.obj.name]?.statics[callee.name] === undefined && clsSig !== undefined) {
          for (const d of classFaceArgDiags(e, callee.obj.name, callee.name, argAnn)) diags.push({ code: d.code, message: d.message, loc: e.loc });
          if (e.args.length < clsSig[0]) {
            diags.push({
              code: "value-arity",
              message: `Too few arguments for "${callee.name}()" call. Expected at least ${clsSig[0]} but received ${e.args.length}.`,
              loc: e.loc,
            });
          } else if (e.args.length > clsSig[1]) {
            diags.push({
              code: "value-arity",
              message: `Too many arguments for "${callee.name}()" call. Expected at most ${clsSig[1]} but received ${e.args.length}.`,
              loc: e.loc,
            });
          }
        }
        const bounds = STATIC_FACE[callee.obj.name]?.statics[callee.name];
        if (bounds !== undefined && e.args.length >= bounds[0] && e.args.length <= bounds[1]) {
          const skey = `${callee.obj.name}.${callee.name}`;
          const byPos = new Map<number, Array<{ code: string; message: string }>>();
          const put = (pos: number, code: string, message: string): void => {
            const bucket = byPos.get(pos) ?? [];
            if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
            byPos.set(pos, bucket);
          };
          const wantAt = new Map<number, string>();
          const refuseAt = new Map<number, string[]>();
          const addRefuse = (pos: number, want: string, kinds: readonly string[]): void => {
            wantAt.set(pos, want);
            refuseAt.set(pos, [...(refuseAt.get(pos) ?? []), ...kinds]);
          };
          for (const [pos, refuse, want, also] of STATIC_ARG_AS[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got !== null && refuse.includes(got)) {
              put(pos, "static-arg-pass", `Cannot pass a value of type "${got}" as "${want}".`);
              if (also.includes(got)) {
                put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
              }
            }
            addRefuse(pos, want, refuse);
          }
          for (const [pos, refuse, want] of STATIC_ARG_TYPES[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got !== null && refuse.includes(got)) {
              put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
            }
            addRefuse(pos, want, refuse);
          }
          for (const [pos, want] of wantAt) {
            const arg = e.args[pos - 1];
            if (arg === undefined || literalTypeName(arg) !== null) continue;
            const nm = argNameType(arg, argAnn);
            if (nm === null || !(refuseAt.get(pos) ?? []).includes(nm)) continue;
            put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
          }
          for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
            for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
        }
        continue;
      }
      const chainArgFace = recvChain(callee.obj);
      const litFace = literalFaceType(callee.obj, faceTyped);
      const face = litFace ?? (chainArgFace === "String" || chainArgFace === "StringName" || chainArgFace === "NodePath" ? chainArgFace : null);
      if (face !== null) {
        const fkey = `${face}.${callee.name}`;
        const byPos = new Map<number, Array<{ code: string; message: string }>>();
        const put = (pos: number, code: string, message: string): void => {
          const bucket = byPos.get(pos) ?? [];
          if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
          byPos.set(pos, bucket);
        };
        const namedArg = (arg: Expr | undefined): string | null => argNameType(arg, argAnn);
        for (const [pos, refuse, want, also] of FACE_ARG_AS[fkey] ?? []) {
          const arg = e.args[pos - 1];
          const bad = literalTypeName(arg);
          if (bad !== null) {
            const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
            if (!refuse.includes(bad) && !nullSlot) continue;
            put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
            if (nullSlot || also.includes(bad)) {
              put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
            }
            continue;
          }
          const named = namedArg(arg);
          if (named === null) continue;
          if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
          put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
        }
        for (const [pos, refuse, want] of FACE_ARG_TYPES[fkey] ?? []) {
          const arg = e.args[pos - 1];
          const bad = literalTypeName(arg);
          if (bad !== null) {
            if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
            put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
            continue;
          }
          const named = namedArg(arg);
          if (named === null) continue;
          if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
          put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
        }
        for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
          for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
        }
        if (litFace !== null) continue;
      }
      const direct = callee.obj.kind === "ident" ? (typed.get(callee.obj.name) ?? null) : callee.obj.kind === "index" ? recvElem(callee.obj) : valueCtorType(callee.obj);
      const recv = direct ?? recvChain(callee.obj);
      if (recv === null) continue;
      const arity = direct === null ? chainArityFace(recv) : { table: VALUE_METHOD_ARITY[recv] ?? {}, code: "value-arity" };
      const sig = arity === null ? undefined : arity.table[callee.name];
      if (sig === undefined || arity === null) continue;
      const got = e.args.length;
      const ikey = `${recv}.${callee.name}`;
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      const namedRecvArg = callee.obj.kind === "index"
        ? (): string | null => null
        : (arg: Expr | undefined): string | null => argNameType(arg, argAnn);
      for (const [pos, refuse, want, also] of INSTANCE_ARG_AS[ikey] ?? []) {
        const lit = e.args[pos - 1];
        const bad = lit === undefined ? null : literalTypeName(lit);
        if (bad !== null) {
          const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
          if (!refuse.includes(bad) && !nullSlot) continue;
          put(pos, "instance-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
          if (nullSlot || also.includes(bad)) {
            put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          }
          continue;
        }
        const named = namedRecvArg(lit);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
        put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
      }
      for (const [pos, refuse, want] of INSTANCE_ARG_TYPES[ikey] ?? []) {
        const lit = e.args[pos - 1];
        const bad = lit === undefined ? null : literalTypeName(lit);
        if (bad !== null) {
          if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
          put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          continue;
        }
        const named = namedRecvArg(lit);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
        put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
      }
      if (got >= sig[0] && got <= sig[1]) continue;
      diags.push({
        code: arity.code,
        message:
          got < sig[0]
            ? `Too few arguments for "${callee.name}()" call. Expected at least ${sig[0]} but received ${got}.`
            : `Too many arguments for "${callee.name}()" call. Expected at most ${sig[1]} but received ${got}.`,
        loc: e.loc,
      });
    }

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "ident" || callee.name !== "char" || e.args.length !== 1) continue;
      const v = literalIntArg(e.args[0]!);
      if (v === null || (v >= 0n && v <= 4294967295n)) continue;
      diags.push({
        code: "char-range",
        message: 'Invalid argument for "char()" function: Expected an integer between 0 and 2^32 - 1.',
        loc: e.loc,
      });
    }

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "ident") continue;
      const vararg = GLOBAL_ARG_VARARG[callee.name];
      if (vararg !== undefined) {
        const ar = BUILTIN_ARITY[callee.name];
        const kinds = e.args.map((a) => literalTypeName(a));
        if (ar !== undefined && e.args.length >= ar[0] && e.args.length <= ar[1] && !kinds.includes("Array") && !kinds.includes("Dictionary")) {
          const pos = kinds.findIndex((k) => k !== null && vararg.has(k));
          if (pos >= 0) {
            diags.push({
              code: "global-arg-type",
              message: `Invalid argument for "${callee.name}()" function: argument ${String(pos + 1)} should be "float" but is "${kinds[pos]}".`,
              loc: e.loc,
            });
          }
        }
        continue;
      }
      const spec = GLOBAL_ARG_TYPES[callee.name];
      const follows = ARG_TYPE_FOLLOWS_FIRST[callee.name];
      const shouldRows = GLOBAL_ARG_SHOULD_BE[callee.name];
      const sentenceRows = GLOBAL_ARG_SENTENCE[callee.name];
      const asRows = GLOBAL_ARG_AS[callee.name];
      const hasLiteralTable = spec !== undefined || follows !== undefined || shouldRows !== undefined || sentenceRows !== undefined || asRows !== undefined;
      const typedName = GLOBAL_TYPED_NAME_ARGS[callee.name];
      if (typedName !== undefined) {
        const tb = GLOBAL_CALLABLES[callee.name]?.bounds ?? null;
        if (tb === null || (e.args.length >= tb[0] && e.args.length <= tb[1])) {
          for (const [pos, want, accept] of typedName) {
            const arg = e.args[pos - 1];
            if (arg === undefined) continue;
            const lit = literalTypeName(arg);
            if (lit !== null && hasLiteralTable) continue;
            const nm = lit ?? argNameType(arg, argAnn);
            if (nm === null || accept.includes(nm)) continue;
            diags.push({ code: "global-arg-type", message: `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`, loc: e.loc });
          }
        }
      }
      const bounds = GLOBAL_CALLABLES[callee.name]?.bounds ?? null;
      if (bounds === null || e.args.length < bounds[0] || e.args.length > bounds[1]) continue;
      if (spec === undefined && follows === undefined && shouldRows === undefined && sentenceRows === undefined && asRows === undefined) {
        continue;
      }
      const shouldPos = new Set<number>();
      for (const shouldRow of shouldRows ?? []) shouldPos.add(shouldRow[0]);
      const suppress = GLOBAL_ARG_SUPPRESS_OTHER[callee.name];
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      const followContainer = (callee.name === "clamp" || callee.name === "lerp" || callee.name === "wrap") &&
        e.args.some((a) => { const k = literalTypeName(a); return k === "Array" || k === "Dictionary"; });
      const wants: Array<[number, "int" | "float" | "bool"]> = spec ? spec.map(([p, t]) => [p, t] as [number, "int" | "float"]) : [];
      const boolFollows = follows === undefined ? null : new Set<number>(follows);
      if (follows !== undefined) {
        const first =
          e.args[0] === undefined
            ? null
            : GLOBAL_ARG_FOLLOWS_BOOL[callee.name] === true
              ? literalTypeName(e.args[0])
              : numericLiteralKind(e.args[0]);
        if (first === "int" || first === "float" || first === "bool") for (const p of follows) wants.push([p, first]);
      }
      const boolFixed = new Set(GLOBAL_ARG_BOOL_REFUSED[callee.name] ?? []);
      const refusesBool = (pos: number): boolean => boolFixed.has(pos) || boolFollows?.has(pos) === true;
      let firstLiteralHit: { pos: number; got: string } | null = null;
      for (const [pos, want] of wants) {
        if (followContainer) continue;
        const a = e.args[pos - 1];
        if (a === undefined || shouldPos.has(pos)) continue;
        if (suppress !== undefined && suppress[0] === pos) {
          const other = e.args.some((x, i) => i !== pos - 1 && suppress[1].includes(literalTypeName(x) ?? ""));
          if (other) continue;
        }
        const lit = literalTypeName(a);
        const got =
          want === "bool"
            ? lit === "int" || lit === "float"
              ? lit
              : null
            : nonNumericLiteral(a) ?? (refusesBool(pos) && lit === "bool" ? "bool" : null) ??
              (CUBIC_NAME_ARG_FUNCS.has(callee.name) && lit === null ? nameArgBad(a, argAnn, want) : null);
        if (got === null || got === want) continue;
        if (firstLiteralHit === null || pos < firstLiteralHit.pos) firstLiteralHit = { pos, got };
      }
      if (firstLiteralHit !== null) {
        const wantOf = wants.find(([p]) => p === firstLiteralHit.pos) as [number, "int" | "float" | "bool"];
        put(firstLiteralHit.pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${firstLiteralHit.pos} should be "${wantOf[1]}" but is "${firstLiteralHit.got}".`);
      }
      if (spec !== undefined && GLOBAL_NUM_ARITH.has(callee.name)) {
        for (const [pos, want] of spec) {
          if (want !== "float" && want !== "int") continue;
          const arg = e.args[pos - 1];
          if (arg === undefined || literalTypeName(arg) !== null) continue;
          const nm = argNameType(arg, argAnn);
          if (nm === null || nm === "bool" || nm === "int" || nm === "float") continue;
          put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
        }
      }
      const firstKind = literalTypeName(e.args[0]);
      const sentenceRowsList = sentenceRows;
      const snappedValueBad = callee.name === "snapped" && firstKind !== null &&
        sentenceRowsList !== undefined && sentenceRowsList.some(([p, r]) => p === 1 && r.includes(firstKind));
      const snappedContainer = callee.name === "snapped" &&
        e.args.some((a) => { const k = literalTypeName(a); return k === "Array" || k === "Dictionary"; });
      for (const [pos, refuse, sentence, unlessFirst] of sentenceRows ?? []) {
        if (snappedContainer || (snappedValueBad && pos > 1)) continue;
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-sentence", sentence);
      }
      for (const [pos, refuse, want, unlessFirst, also] of asRows ?? []) {
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-pass", `Cannot pass a value of type "${got}" as "${want}".`);
        if ((also ?? []).includes(got)) {
          put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
        }
      }
      for (const [pos, refuse, want, unlessFirst] of shouldRows ?? []) {
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
      }
      for (const [want, pos, refuse] of DERIVED_ARG_TYPES[callee.name] ?? []) {
        if (followContainer || firstKind !== want) continue;
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (suppress !== undefined && suppress[0] === pos) {
          const other = e.args.some((x, i) => i !== pos - 1 && suppress[1].includes(literalTypeName(x) ?? ""));
          if (other) continue;
        }
        put(pos, "global-arg-derived", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
      }
    }
  }
}
