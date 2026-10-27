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

import { CLASS_FACE_RECEIVERS, Scope, capKey, declNames, gvKey, run } from "./state";
import { builtinArity, builtinArityCode, classFaceArity, utilityArity } from "./arity";
import { checkOperator } from "./checks/operators";
import { checkCall, checkMethodCall } from "./checks/calls";
import { literalTypeName } from "./faces";

export function assignTargetName(t: unknown): string | null {
  const o = t as Record<string, unknown> | null;
  if (o === null || typeof o !== "object") return null;
  if (o.kind === "ident" && typeof o.name === "string") return o.name;
  const obj = o.obj as Record<string, unknown> | undefined;
  if (o.kind === "attribute" && typeof o.name === "string" && obj?.name === "self") return o.name;
  return null;
}

export function walkExprKinds(node: unknown, out: Extract<Expr, { kind: "is" | "as" }>[]): void {
  if (Array.isArray(node)) {
    for (const x of node) walkExprKinds(x, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (obj.kind === "is" || obj.kind === "as") out.push(obj as unknown as Extract<Expr, { kind: "is" | "as" }>);
  for (const key of Object.keys(obj)) {
    if (key === "loc") continue;
    walkExprKinds(obj[key], out);
  }
}

export function flattenBody(body: Stmt[]): Record<string, unknown>[] {
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
  return nodes;
}

export function flattenBodies(m: Module): Record<string, unknown>[][] {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  return bodies.map(flattenBody);
}

export function markClassFaceReceivers(m: Module): void {
  for (const nodes of flattenBodies(m)) {
    for (const n of nodes) {
      if (n.kind !== "attribute") continue;
      const obj = n.obj as Record<string, unknown> | undefined;
      if (obj !== undefined && obj.kind === "ident" && typeof obj.name === "string" && classFaceArity(obj.name) !== undefined) {
        CLASS_FACE_RECEIVERS.add(obj);
      }
    }
  }
}

export function reassignedNames(nodes: Record<string, unknown>[]): Set<string> {
  const out = new Set<string>();
  for (const n of nodes) {
    if (n.kind !== "assign") continue;
    const target = n.target as Record<string, unknown> | undefined;
    if (target !== undefined && target.kind === "ident" && typeof target.name === "string") out.add(target.name);
  }
  return out;
}

export function moduleAssignedNames(m: Module): Set<string> {
  const out = new Set<string>();
  for (const nodes of flattenBodies(m)) for (const n of reassignedNames(nodes)) out.add(n);
  return out;
}

export function collectLocalNames(body: Stmt[], params: string[], out: Set<string>): void {
  for (const p of params) out.add(p);
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "var":
        out.add(s.name);
        return;
      case "for":
        out.add(s.var);
        s.body.forEach(stmt);
        return;
      case "if":
        for (const br of s.branches) br.body.forEach(stmt);
        return;
      case "while":
        s.body.forEach(stmt);
        return;
      case "match":
        for (const arm of s.arms) {
          if (arm.pattern.kind === "bind") out.add(arm.pattern.name);
          arm.body.forEach(stmt);
        }
        return;
      default:
        return;
    }
  };
  body.forEach(stmt);
}

export function classTable(m: Module): Map<string, ClassDecl> {
  const out = new Map<string, ClassDecl>();
  const collect = (list: ClassDecl[]): void => {
    for (const c of list) {
      if (!out.has(c.name)) out.set(c.name, c);
      collect(c.innerClasses);
    }
  };
  collect(m.innerClasses);
  return out;
}

export function inheritedNames(c: ClassDecl, classes: Map<string, ClassDecl>): string[] {
  const seen = new Set<string>([c.name]);
  const out: string[] = [];
  let next: string | null = c.extends;
  while (next !== null) {
    const parent = classes.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    out.push(...declNames(parent));
    next = parent.extends;
  }
  return out;
}

export function guaranteedReturn(stmts: Stmt[]): boolean {
  const last = stmts[stmts.length - 1];
  if (last === undefined) return false;
  switch (last.kind) {
    case "return":
      return last.value !== null;
    case "if": {
      const tail = last.branches[last.branches.length - 1];
      return tail !== undefined && tail.cond === null && last.branches.every((b) => guaranteedReturn(b.body));
    }
    case "match":
      return last.arms.some((a) => a.pattern.kind === "wildcard" && guaranteedReturn(a.body));
    default:
      return false;
  }
}

export function checkFunc(f: FuncDecl, outer: Scope, coroutines: Set<string>, diags: Diagnostic[], hostFace: Set<string> = NO_HOST_VALUE_METHODS): void {
  const scope = outer.funcChild(["self", ...f.params.map((p) => p.name)], !f.isStatic);
  const prevFace = run.hostValueMethods;
  const prevCtx = run.hostStaticCtx;
  run.hostValueMethods = hostFace;
  run.hostStaticCtx = f.isStatic ? { kind: "func", name: f.name } : null;
  for (const p of f.params) if (p.default !== null) walkExpr(p.default, scope, coroutines, diags);
  walkStmts(f.body, scope, coroutines, diags, false);
  run.hostValueMethods = prevFace;
  run.hostStaticCtx = prevCtx;
}

export function walkStmts(
  stmts: Stmt[],
  scope: Scope,
  coroutines: Set<string>,
  diags: Diagnostic[],
  inLoop: boolean,
): void {
  for (const s of stmts) walkStmt(s, scope, coroutines, diags, inLoop);
}

export function walkStmt(
  s: Stmt,
  scope: Scope,
  coroutines: Set<string>,
  diags: Diagnostic[],
  inLoop: boolean,
): void {
  switch (s.kind) {
    case "var":
      if (s.init) walkExpr(s.init, scope, coroutines, diags);
      scope.declare(s.name);
      break;
    case "expr":
      walkExpr(s.expr, scope, coroutines, diags, true);
      break;
    case "assign":
      walkExpr(s.target, scope, coroutines, diags);
      walkExpr(s.value, scope, coroutines, diags);
      break;
    case "return":
      if (s.value) walkExpr(s.value, scope, coroutines, diags);
      break;
    case "if":
      for (const br of s.branches) {
        if (br.cond) walkExpr(br.cond, scope, coroutines, diags);
        walkStmts(br.body, scope.child([]), coroutines, diags, inLoop);
      }
      break;
    case "for": {
      walkExpr(s.iter, scope, coroutines, diags);
      const loopScope = scope.child([s.var]);
      walkStmts(s.body, loopScope, coroutines, diags, true);
      break;
    }
    case "while":
      walkExpr(s.cond, scope, coroutines, diags);
      walkStmts(s.body, scope.child([]), coroutines, diags, true);
      break;
    case "match": {
      walkExpr(s.subject, scope, coroutines, diags);
      const patternNames = (p: Pattern): void => {
        if (p.kind === "const") walkExpr(p.expr, scope, coroutines, diags);
        else if (p.kind === "array") for (const it of p.items) patternNames(it);
        else if (p.kind === "dict") {
          for (const en of p.entries) {
            walkExpr(en.key, scope, coroutines, diags);
            patternNames(en.pattern);
          }
        }
      };
      for (const arm of s.arms) {
        patternNames(arm.pattern);
        const armScope = scope.child(patternBindings(arm.pattern));
        if (arm.guard) walkExpr(arm.guard, armScope, coroutines, diags);
        walkStmts(arm.body, armScope, coroutines, diags, inLoop);
      }
      break;
    }
    case "break":
    case "continue":
      if (!inLoop) {
        diags.push({ code: "break-outside-loop", message: `${s.kind} 不在循环内`, loc: s.loc });
      }
      break;
    case "pass":
      break;
  }
}

export function patternBindings(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternBindings);
    case "dict":
      return p.entries.flatMap((e) => patternBindings(e.pattern));
    default:
      return [];
  }
}

export function walkExpr(e: Expr, scope: Scope, coroutines: Set<string>, diags: Diagnostic[], awaited = false): void {
  switch (e.kind) {
    case "lit":
      return;

    case "ident":
      if (e.name === "super") return;
      const staticCtx = run.hostStaticCtx;
      if (e.name === "self") {
        if (staticCtx !== null && staticCtx.kind === "const")
          diags.push({
            code: "const-not-constant",
            message: `Assigned value for constant "${staticCtx.name}" isn't a constant expression.`,
            loc: e.loc,
          });
        else if (!scope.allowsSelf()) {
          diags.push({
            code: "self-in-static",
            message: 'Cannot use "self" inside a static function.',
            loc: e.loc,
          });
        }
        return;
      }
      if (!scope.has(e.name) && !isGlobalConst(e.name)) {
        if (CLASS_FACE_RECEIVERS.has(e)) return;
        if (GLOBAL_VALUE_NAMES.has(e.name)) run.globalValueReads.add(gvKey(run, e.name, e.loc.line, e.loc.col));
        else if (ENGINE_CLASS_NAMES.has(e.name)) run.nativeClassReads.add(gvKey(run, e.name, e.loc.line, e.loc.col));
        else if (run.hostValueMethods.has(e.name)) {
          if (staticCtx === null) run.hostMethodReads.add(gvKey(run, e.name, e.loc.line, e.loc.col));
          else if (staticCtx.kind === "func")
            diags.push({
              code: "host-read-in-static",
              message: `Cannot access non-static variable "${e.name}" from the static function "${staticCtx.name}()".`,
              loc: e.loc,
            });
          else if (staticCtx.kind === "var")
            diags.push({
              code: "host-read-in-static",
              message: `Cannot access non-static variable "${e.name}" from a static variable initializer.`,
              loc: e.loc,
            });
          else
            diags.push({
              code: "const-not-constant",
              message: `Assigned value for constant "${staticCtx.name}" isn't a constant expression.`,
              loc: e.loc,
            });
        }
        else if (VIRTUAL_HOST_NAMES.has(e.name))
          diags.push({ code: "undeclared-identifier", message: `Identifier not found: ${e.name}`, loc: e.loc });
        else if (BUILTIN_TYPE_NAMES.has(e.name)) {
          diags.push({
            code: "undeclared-identifier",
            message: "Builtin type cannot be used as a name on its own.",
            loc: e.loc,
          });
          diags.push({
            code: "undeclared-identifier",
            message: `Identifier "${e.name}" not declared in the current scope.`,
            loc: e.loc,
          });
        }
        else
          diags.push({
            code: "undeclared-identifier",
            message: `Identifier "${e.name}" not declared in the current scope.`,
            loc: e.loc,
          });
      }
      return;

    case "unary":
      walkExpr(e.operand, scope, coroutines, diags);
      return;

    case "await":
      walkExpr(e.operand, scope, coroutines, diags, true);
      return;

    case "binary": {
      checkOperator(e, diags);
      walkExpr(e.left, scope, coroutines, diags);
      walkExpr(e.right, scope, coroutines, diags);
      return;
    }

    case "is":
    case "as":
      walkExpr(e.operand, scope, coroutines, diags);
      return;

    case "index":
      walkExpr(e.obj, scope, coroutines, diags);
      walkExpr(e.index, scope, coroutines, diags);
      return;

    case "attribute":
      if (staticMemberFn(e.obj) === null && !(e.obj.kind === "ident" && PACK_TYPE_NAMES.has(e.obj.name))) walkExpr(e.obj, scope, coroutines, diags);
      return;

    case "array":
      for (const it of e.items) walkExpr(it, scope, coroutines, diags);
      return;

    case "dict":
      for (const en of e.entries) {
        walkExpr(en.key, scope, coroutines, diags);
        walkExpr(en.value, scope, coroutines, diags);
      }
      return;

    case "lambda": {
      const fnScope = scope.child(e.params.map((p) => p.name));
      recordCaptures(e, scope);
      let defScope = scope;
      for (const p of e.params) {
        if (p.default !== null) walkExpr(p.default, defScope, coroutines, diags);
        defScope = defScope.child([p.name]);
      }
      walkStmts(e.body, fnScope, coroutines, diags, false);
      return;
    }

    case "call": {
      if (e.callee.kind === "ident") {
        const name = e.callee.name;
        if (coroutines.has(name) && !awaited) {
          diags.push({
            code: "coroutine-not-awaited",
            message: `Function "${name}()" is a coroutine, so it must be called with "await".`,
            loc: e.loc,
          });
        }
        checkCall(name, e, diags);
        const arity = builtinArity(name, e.args.length) ?? utilityArity(name, e.args.length);
        if (arity !== null) {
          diags.push({ code: builtinArityCode(name), message: arity, loc: e.loc });
          for (const [pos, want] of GLOBAL_ARG_TYPES[name] ?? []) {
            if (literalTypeName((e.args as Expr[])[pos - 1]) === "Array") {
              diags.push({
                code: "global-arg-type",
                message: `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "Array".`,
                loc: e.loc,
              });
              break;
            }
          }
        }
      } else {
        walkExpr(e.callee, scope, coroutines, diags);
        if (e.callee.kind === "attribute") checkMethodCall(e.callee.name, e, diags);
      }
      for (const a of e.args) walkExpr(a, scope, coroutines, diags);
      return;
    }
  }
}

export function seedOuterNames(m: Module): void {
  const out = new Set<string>(declNames(m));
  const walk = (c: { vars: Array<{ name: string }>; funcs: Array<{ name: string }>; signals: Array<{ name: string }>; consts?: Array<{ name: string }>; innerClasses: unknown[] }): void => {
    for (const v of c.vars) out.add(v.name);
    for (const f of c.funcs) out.add(f.name);
    for (const sg of c.signals) out.add(sg.name);
    for (const k of c.consts ?? []) out.add(k.name);
    for (const inner of c.innerClasses) walk(inner as Parameters<typeof walk>[0]);
  };
  for (const c of m.innerClasses) walk(c as Parameters<typeof walk>[0]);
  run.outerNames = out;
}

export function collectReads(node: unknown, bound: Set<string>, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const v of node) collectReads(v, bound, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  if (o["kind"] === "ident" && typeof o["name"] === "string" && !bound.has(o["name"])) out.add(o["name"]);
  for (const v of Object.values(o)) collectReads(v, bound, out);
}

export function recordCaptures(e: Expr, scope: Scope): void {
  if (e.kind !== "lambda" || e.loc === null) return;
  const bound = new Set<string>();
  collectLocalNames(e.body, e.params.map((p) => p.name), bound);
  for (const p of e.params) bound.add(p.name);
  const reads = new Set<string>();
  collectReads(e, bound, reads);
  const caps = [...reads].filter((n) => n !== "self" && !run.outerNames.has(n) && scope.hasLocal(n)).sort();
  if (caps.length > 0) run.lambdaCaptures.set(capKey(run, e.loc.line, e.loc.col), caps);
}
