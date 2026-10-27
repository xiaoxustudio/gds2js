import type { Diagnostic } from "../../analysis-result";
import { STATIC_VALUE_TYPES } from "../../../semantics/elem-faces";
import type { ClassDecl, Expr, FuncDecl, Module, Stmt, TypeRef, VarDecl } from "../../../lower/ir";
import { type StaticType, run } from "../../state";
import { instanceOfTypeArgMessage, slotSource, varSlotHolds } from "../../slots";
import { staticType } from "../../faces";

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
