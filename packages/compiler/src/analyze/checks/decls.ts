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

import { Scope, declNames, run } from "../state";
import { holdsParamDefault } from "../faces";
import { checkFunc, collectLocalNames, flattenBody, guaranteedReturn, inheritedNames, patternBindings, walkExpr, walkStmts } from "../walk";
import { checkStaticAccess } from "./calls";
import { slotSource } from "../slots";

export function checkParamDefaultAssign(m: Module, diags: Diagnostic[]): void {
  const slotOf = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    if (base === "int" || base === "float" || base === "bool" || base === "String" || base === "StringName") return base;
    if (PARAM_OWN_SLOTS.has(base)) return base;
    return STATIC_VALUE_TYPES.has(base) ? base : null;
  };
  const sourceOf = (e: Expr): string | null => {
    const st = slotSource(e);
    if (st !== null) return st;
    if (e.kind === "lit" && e.lit === "node_path") return "NodePath";
    return null;
  };
  const checkParams = (params: readonly Param[]): void => {
    for (const p of params) {
      const slot = slotOf(p.type);
      const def = p.default;
      if (slot === null || def === null) continue;
      const st = sourceOf(def);
      if (st === null) continue;
      if (holdsParamDefault(slot, st)) continue;
      if (st !== "Array" && st !== "Dictionary") {
        diags.push({ code: "param-default-value", message: `Cannot assign a value of type "${st}" as "${slot}".`, loc: def.loc });
      }
      diags.push({
        code: "param-default-assign",
        message: `Cannot assign a value of type ${st} to parameter "${p.name}" with specified type ${slot}.`,
        loc: def.loc,
      });
    }
  };
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) checkParams(f.params);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const f of m.funcs) checkParams(f.params);
  for (const c of m.innerClasses) walkClass(c);
  /** lambda 是另一层作用域，`flattenBody` 走到它就停，所以这里自己下钻把形参表收齐（S449）。 */
  const lambdas = (n: unknown): void => {
    if (Array.isArray(n)) {
      for (const x of n) lambdas(x);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const obj = n as Record<string, unknown>;
    if (obj.kind === "lambda") checkParams((obj.params as Param[]) ?? []);
    for (const key of Object.keys(obj)) {
      if (key !== "loc") lambdas(obj[key]);
    }
  };
  lambdas(m);
}

export function checkScriptClassSlots(m: Module, diags: Diagnostic[]): void {
  const names = new Set<string>();
  const collect = (c: ClassDecl): void => {
    names.add(c.name);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  if (names.size === 0) return;
  const slotOf = (t: TypeRef | null): string | null =>
    t !== null && t.kind === "named" && names.has(t.name) ? t.name : null;
  const refuse = (name: string, kind: string, slot: string, init: Expr | null, loc: Diagnostic["loc"]): void => {
    if (init === null) return;
    const st = slotSource(init);
    if (st === null || st === "null") return;
    diags.push({
      code: "script-class-slot",
      message: `Cannot assign a value of type ${st} to ${kind} "${name}" with specified type ${slot}.`,
      loc,
    });
  };
  /** 引擎这一族是按**分组**发的，不是按源码行序（两形实测：`tmp/probe569/s619.gd` 两支内部类 + 语料 393）：
   *  ① 外层 var 的默认值 → ② 外层函数形参的默认值 → ③ 各内部类的成员 var（按类声明序）→ ④ 外层函数体里的 var → ⑤ 内部类的函数。 */
  const varSlot = (v: VarDecl): void => {
    const slot = slotOf(v.type);
    if (slot !== null) refuse(v.name, "variable", slot, v.init, v.loc);
  };
  const paramSlots = (f: { params: Param[]; loc: Diagnostic["loc"] }): void => {
    for (const p of f.params) {
      const slot = slotOf(p.type);
      if (slot !== null) refuse(p.name, "parameter", slot, p.default, f.loc);
    }
  };
  const classVars = (c: ClassDecl): void => {
    for (const v of c.vars) varSlot(v);
    for (const inner of c.innerClasses) classVars(inner);
  };
  const classFuncs = (c: ClassDecl): void => {
    for (const f of c.funcs) {
      paramSlots(f);
      walkStmtVars(f.body);
    }
    for (const inner of c.innerClasses) classFuncs(inner);
  };
  const walkStmtVars = (n: unknown): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkStmtVars(x);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const obj = n as Record<string, unknown>;
    if (obj.kind === "var") {
      const slot = slotOf(obj.type as TypeRef | null);
      if (slot !== null && typeof obj.name === "string") {
        refuse(obj.name, "variable", slot, (obj.init as Expr | null) ?? null, obj.loc as Diagnostic["loc"]);
      }
    }
    for (const key of Object.keys(obj)) {
      if (key !== "loc") walkStmtVars(obj[key]);
    }
  };
  for (const v of m.vars) varSlot(v);
  for (const f of m.funcs) paramSlots(f);
  for (const c of m.innerClasses) classVars(c);
  for (const f of m.funcs) walkStmtVars(f.body);
  for (const c of m.innerClasses) classFuncs(c);
}

export function checkSignalDefaults(m: Module, diags: Diagnostic[]): void {
  const found: SignalDecl[] = [];
  const walkClass = (c: ClassDecl): void => {
    for (const s of c.signals) if (s.hasDefaults) found.push(s);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const s of m.signals) if (s.hasDefaults) found.push(s);
  for (const c of m.innerClasses) walkClass(c);
  const first = found.sort((a, b) => a.loc.line - b.loc.line)[0];
  if (first !== undefined) {
    diags.push({ code: "signal-default-param", message: "Signal parameters cannot have a default value.", loc: first.loc });
  }
}

export function checkConstAssign(m: Module, diags: Diagnostic[], hostFace: Set<string>): void {
  const moduleConsts = new Set<string>(m.vars.filter((v) => v.isConst).map((v) => v.name));

  const bindings = (ss: Stmt[], rebound: Set<string>, localConsts: Set<string>): void => {
    for (const s of ss) {
      switch (s.kind) {
        case "var":
          if (s.isConst) localConsts.add(s.name);
          else rebound.add(s.name);
          exprBindings(s.init, rebound, localConsts);
          continue;
        case "assign":
          exprBindings(s.target, rebound, localConsts);
          exprBindings(s.value, rebound, localConsts);
          continue;
        case "for":
          rebound.add(s.var);
          exprBindings(s.iter, rebound, localConsts);
          bindings(s.body, rebound, localConsts);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) exprBindings(b.cond, rebound, localConsts);
            bindings(b.body, rebound, localConsts);
          }
          continue;
        case "while":
          exprBindings(s.cond, rebound, localConsts);
          bindings(s.body, rebound, localConsts);
          continue;
        case "match":
          exprBindings(s.subject, rebound, localConsts);
          for (const arm of s.arms) {
            for (const n of patternBindings(arm.pattern)) rebound.add(n);
            if (arm.guard !== null) exprBindings(arm.guard, rebound, localConsts);
            bindings(arm.body, rebound, localConsts);
          }
          continue;
        case "expr":
          exprBindings(s.expr, rebound, localConsts);
          continue;
        case "return":
          if (s.value !== null) exprBindings(s.value, rebound, localConsts);
          continue;
        default:
          continue;
      }
    }
  };

  const exprBindings = (e: Expr | null, rebound: Set<string>, localConsts: Set<string>): void => {
    if (e === null) return;
    switch (e.kind) {
      case "lambda":
        for (const p of e.params) rebound.add(p.name);
        bindings(e.body, rebound, localConsts);
        return;
      case "binary":
        exprBindings(e.left, rebound, localConsts);
        exprBindings(e.right, rebound, localConsts);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        exprBindings(e.operand, rebound, localConsts);
        return;
      case "index":
        exprBindings(e.obj, rebound, localConsts);
        exprBindings(e.index, rebound, localConsts);
        return;
      case "attribute":
        exprBindings(e.obj, rebound, localConsts);
        return;
      case "array":
        for (const it of e.items) exprBindings(it, rebound, localConsts);
        return;
      case "dict":
        for (const en of e.entries) {
          exprBindings(en.key, rebound, localConsts);
          exprBindings(en.value, rebound, localConsts);
        }
        return;
      default:
        return;
    }
  };

  const check = (ss: Stmt[], consts: Set<string>, rebound: Set<string>, names: Set<string>): void => {
    for (const s of ss) {
      switch (s.kind) {
        case "assign": {
          if (s.target.kind === "ident") {
            const nm = s.target.name;
            if (!rebound.has(nm) && (consts.has(nm) || isGlobalConst(nm) || GLOBAL_VALUE_NAMES.has(nm) || ENGINE_CLASS_NAMES.has(nm) || names.has(nm))) {
              diags.push({
                code: "const-assign",
                message: "Cannot assign a new value to a constant.",
                loc: s.loc,
              });
            }
          }
          check(s.value.kind === "lambda" ? s.value.body : [], consts, rebound, names);
          continue;
        }
        case "var":
          if (s.init !== null && s.init.kind === "lambda") check(s.init.body, consts, rebound, names);
          continue;
        case "if":
          for (const b of s.branches) check(b.body, consts, rebound, names);
          continue;
        case "while":
          check(s.body, consts, rebound, names);
          continue;
        case "for":
          check(s.body, consts, rebound, names);
          continue;
        case "match":
          for (const arm of s.arms) check(arm.body, consts, rebound, names);
          continue;
        case "expr":
          if (s.expr.kind === "lambda") check(s.expr.body, consts, rebound, names);
          continue;
        default:
          continue;
      }
    }
  };

  const one = (params: Param[], body: Stmt[], consts: Set<string>, names: Set<string>): void => {
    const rebound = new Set<string>(params.map((p) => p.name));
    const localConsts = new Set<string>();
    bindings(body, rebound, localConsts);
    const all = new Set<string>([...consts, ...localConsts]);
    check(body, all, rebound, names);
  };

  const accessors = (list: VarDecl[], consts: Set<string>, face: Set<string>): void => {
    for (const v of list) {
      const acc = v.accessor;
      if (acc === null || v.isStatic) continue;
      if (acc.getter !== null && acc.getter.kind === "inline") one([], acc.getter.body, consts, face);
      if (acc.setter !== null && acc.setter.kind === "inline") {
        one([{ name: acc.setter.param, type: null, default: null }], acc.setter.body, consts, face);
      }
    }
  };

  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const consts = new Set<string>([...inherited, ...c.vars.filter((v) => v.isConst).map((v) => v.name)]);
    for (const f of c.funcs) one(f.params, f.body, consts, NO_HOST_VALUE_METHODS);
    accessors(c.vars, consts, NO_HOST_VALUE_METHODS);
    for (const inner of c.innerClasses) walkClass(inner, consts);
  };

  for (const f of m.funcs) one(f.params, f.body, moduleConsts, f.isStatic ? NO_HOST_VALUE_METHODS : hostFace);
  accessors(m.vars, moduleConsts, hostFace);
  for (const c of m.innerClasses) walkClass(c, moduleConsts);
}

export function checkInitContracts(m: Module, globals: Set<string>, diags: Diagnostic[]): void {
  const inner = new Map<string, ClassDecl>();
  const index = (c: ClassDecl): void => {
    inner.set(c.name, c);
    for (const x of c.innerClasses) index(x);
  };
  for (const c of m.innerClasses) index(c);

  type Chain = { state: "unknown" } | { state: "none" } | { state: "init"; params: Param[] };
  const chainInit = (startName: string | null): Chain => {
    const seen = new Set<string>();
    let name = startName;
    while (name !== null) {
      if (seen.has(name)) return { state: "unknown" };
      seen.add(name);
      const c = inner.get(name);
      if (!c) return globals.has(name) ? { state: "unknown" } : { state: "none" };
      const f = c.funcs.find((x) => x.name === "_init" && !x.isStatic);
      if (f) return { state: "init", params: f.params };
      name = c.extends;
    }
    return { state: "none" };
  };

  const arityText = (who: "_init" | "new", params: Param[], got: number): string | null => {
    const max = params.length;
    const min = params.filter((p) => p.default === null).length;
    if (got > max) return `Too many arguments for "${who}()" call. Expected at most ${max} but received ${got}.`;
    if (got < min) return `Too few arguments for "${who}()" call. Expected at least ${min} but received ${got}.`;
    return null;
  };

  const scan = (node: unknown, visit: (e: Record<string, unknown>) => void): void => {
    if (Array.isArray(node)) {
      for (const x of node) scan(x, visit);
      return;
    }
    if (node === null || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.kind === "lambda") return;
    visit(obj);
    for (const key of Object.keys(obj)) {
      if (key === "loc") continue;
      scan(obj[key], visit);
    }
  };

  const asCalls = (body: Stmt[]): Record<string, unknown>[] => {
    const out: Record<string, unknown>[] = [];
    scan(body, (e) => {
      if (e.kind === "call") out.push(e);
    });
    return out;
  };

  /** 调用形式 `X.new(...)` / `super(...)` 的实参数与被调的名字。 */
  const callShape = (e: Record<string, unknown>): { kind: "super" | "new"; target: string; args: number } | null => {
    const callee = e.callee as Record<string, unknown> | undefined;
    if (!callee) return null;
    if (callee.kind === "ident" && callee.name === "super") return { kind: "super", target: "super", args: ((e.args as Expr[]) ?? []).length };
    if (callee.kind === "attribute" && callee.name === "new" && (callee.obj as Record<string, unknown>)?.kind === "ident") {
      return { kind: "new", target: String((callee.obj as Record<string, unknown>).name), args: ((e.args as Expr[]) ?? []).length };
    }
    return null;
  };

  const funcs: Array<{ f: FuncDecl; owner: ClassDecl | null }> = m.funcs.map((f) => ({ f, owner: null }));
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) funcs.push({ f, owner: c });
    for (const x of c.innerClasses) collect(x);
  };
  for (const c of m.innerClasses) collect(c);

  for (const { f, owner } of funcs) {
    const isInit = f.name === "_init" && !f.isStatic;
    if (isInit) {
      const returns: Record<string, unknown>[] = [];
      scan(f.body, (e) => {
        if (e.kind === "return" && e.value !== null && e.value !== undefined) returns.push(e);
      });
      for (const r of returns) {
        diags.push({ code: "init-returns-value", message: "Constructor cannot return a value.", loc: r.loc as Loc });
      }
    }
    for (const e of asCalls(f.body)) {
      const shape = callShape(e);
      if (!shape) continue;
      if (shape.kind === "super") {
        if (!isInit || owner === null) continue;
        const up = chainInit(owner.extends);
        if (up.state === "unknown") continue;
        if (up.state === "none") {
          diags.push({
            code: "super-init-missing",
            message: `Cannot call the parent class' virtual function "_init()" because it hasn't been defined.`,
            loc: e.loc as Loc,
          });
          continue;
        }
        const text = arityText("_init", up.params, shape.args);
        if (text) diags.push({ code: "super-init-arity", message: text, loc: e.loc as Loc });
        continue;
      }
      if (!inner.has(shape.target)) continue;
      const up = chainInit(shape.target);
      if (up.state !== "init") continue;
      const text = arityText("new", up.params, shape.args);
      if (text) diags.push({ code: "new-arity", message: text, loc: e.loc as Loc });
    }
  }
}

export function checkClassFuncVisibility(m: Module, diags: Diagnostic[]): void {
  const outerFuncs = new Set(m.funcs.map((f) => f.name));
  if (outerFuncs.size === 0) return;

  const scanExpr = (e: Expr, cb: (name: string, loc: Loc) => void): void => {
    switch (e.kind) {
      case "call":
        if (e.callee.kind === "ident") cb(e.callee.name, e.loc);
        scanExpr(e.callee, cb);
        for (const a of e.args) scanExpr(a, cb);
        return;
      case "index":
        scanExpr(e.obj, cb);
        scanExpr(e.index, cb);
        return;
      case "attribute":
        scanExpr(e.obj, cb);
        return;
      case "binary":
        scanExpr(e.left, cb);
        scanExpr(e.right, cb);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        scanExpr(e.operand, cb);
        return;
      case "array":
        for (const it of e.items) scanExpr(it, cb);
        return;
      case "dict":
        for (const en of e.entries) {
          scanExpr(en.key, cb);
          scanExpr(en.value, cb);
        }
        return;
      case "lambda":
        scanStmts(e.body, cb);
        return;
      default:
        return;
    }
  };
  const scanStmts = (body: Stmt[], cb: (name: string, loc: Loc) => void): void => {
    for (const s of body) {
      switch (s.kind) {
        case "expr":
          scanExpr(s.expr, cb);
          continue;
        case "var":
          if (s.init !== null) scanExpr(s.init, cb);
          continue;
        case "assign":
          scanExpr(s.target, cb);
          scanExpr(s.value, cb);
          continue;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) scanExpr(br.cond, cb);
            scanStmts(br.body, cb);
          }
          continue;
        case "for":
          scanExpr(s.iter, cb);
          scanStmts(s.body, cb);
          continue;
        case "while":
          scanExpr(s.cond, cb);
          scanStmts(s.body, cb);
          continue;
        case "match":
          scanExpr(s.subject, cb);
          for (const arm of s.arms) {
            if (arm.guard !== null) scanExpr(arm.guard, cb);
            scanStmts(arm.body, cb);
          }
          continue;
        case "return":
          if (s.value !== null) scanExpr(s.value, cb);
          continue;
        default:
          continue;
      }
    }
  };

  const walkClass = (c: ClassDecl): void => {
    const own = new Set(c.funcs.map((f) => f.name));
    const report = (local: Set<string>) => (name: string, loc: Loc): void => {
      if (outerFuncs.has(name) && !own.has(name) && !local.has(name)) {
        diags.push({
          code: "class-outer-func",
          message: `Function "${name}()" not found in base self.`,
          loc,
        });
      }
    };
    for (const f of c.funcs) {
      const local = new Set<string>();
      collectLocalNames(f.body, f.params.map((p) => p.name), local);
      scanStmts(f.body, report(local));
      for (const p of f.params) if (p.default !== null) scanExpr(p.default, report(local));
    }
    for (const v of c.vars) {
      const local = new Set<string>();
      if (v.init !== null) scanExpr(v.init, report(local));
      const a = v.accessor;
      if (a === null || a === undefined) continue;
      if (a.getter !== null && a.getter.kind === "inline") scanStmts(a.getter.body, report(local));
      if (a.setter !== null && a.setter.kind === "inline") {
        local.add(a.setter.param);
        scanStmts(a.setter.body, report(local));
      }
    }
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);
}

export function checkFieldInits(list: VarDecl[], scope: Scope, coroutines: Set<string>, diags: Diagnostic[], face: Set<string>): void {
  const selfScope = scope.child([], true);
  for (const v of list) {
    const prevFace = run.hostValueMethods;
    const prevCtx = run.hostStaticCtx;
    run.hostValueMethods = face;
    run.hostStaticCtx = v.isConst ? { kind: "const", name: v.name } : v.isStatic ? { kind: "var" } : null;
    if (v.init !== null) walkExpr(v.init, selfScope, coroutines, diags);
    const acc = v.accessor;
    if (acc !== null) {
      const accScope = v.isStatic ? selfScope.child([], false) : selfScope;
      run.hostStaticCtx = v.isStatic ? { kind: "func", name: `@${v.name}_getter` } : null;
      if (acc.getter !== null && acc.getter.kind === "inline") walkStmts(acc.getter.body, accScope, coroutines, diags, false);
      run.hostStaticCtx = v.isStatic ? { kind: "func", name: `@${v.name}_setter` } : null;
      if (acc.setter !== null && acc.setter.kind === "inline") {
        walkStmts(acc.setter.body, accScope.child([acc.setter.param]), coroutines, diags, false);
      }
    }
    run.hostValueMethods = prevFace;
    run.hostStaticCtx = prevCtx;
  }
}

export function checkPropertyDelegates(m: Module, diags: Diagnostic[]): void {
  const one = (vars: readonly VarDecl[], funcs: readonly FuncDecl[]): void => {
    const own = new Map<string, FuncDecl>();
    for (const f of funcs) if (!own.has(f.name)) own.set(f.name, f);
    for (const v of vars) {
      const a = v.accessor;
      if (a === null || a === undefined) continue;
      const judge = (word: "Getter" | "Setter", kind: "getter" | "setter", name: string): void => {
        const f = own.get(name);
        if (f === undefined) {
          diags.push({ code: "property-delegate", message: `${word} "${name}" not found.`, loc: v.loc });
          return;
        }
        const want = kind === "getter" ? 0 : 1;
        if (f.params.length !== want || f.params.some((p) => p.default !== null)) {
          diags.push({ code: "property-delegate", message: `Function "${name}" cannot be used as ${kind} because of its signature.`, loc: v.loc });
        }
      };
      if (a.getter !== null && a.getter.kind === "method") judge("Getter", "getter", a.getter.method);
      if (a.setter !== null && a.setter.kind === "method") judge("Setter", "setter", a.setter.method);
    }
  };
  one(m.vars, m.funcs);
  const walk = (c: ClassDecl): void => {
    one(c.vars, c.funcs);
    for (const inner of c.innerClasses) walk(inner);
  };
  for (const c of m.innerClasses) walk(c);
}

export function checkClass(c: ClassDecl, base: Scope, diags: Diagnostic[], classes: Map<string, ClassDecl>): void {
  const scope = base.child([c.name, ...declNames(c), ...inheritedNames(c, classes)]);
  const coroutines = new Set(c.funcs.filter((f) => f.coroutine).map((f) => f.name));
  checkStaticAccess(c.funcs, c.vars, diags);
  for (const f of c.funcs) checkFunc(f, scope, coroutines, diags);
  checkFieldInits(c.vars, scope, coroutines, diags, NO_HOST_VALUE_METHODS);
  for (const inner of c.innerClasses) checkClass(inner, scope, diags, classes);
}

export function checkReturnPaths(funcs: FuncDecl[], diags: Diagnostic[]): void {
  for (const f of funcs) {
    if (f.returnType === null) continue;
    if (f.returnType.kind === "named" && f.returnType.name === "void") continue;
    if (guaranteedReturn(f.body)) continue;
    diags.push({ code: "return-path", message: "Not all code paths return a value.", loc: f.loc });
  }
}
