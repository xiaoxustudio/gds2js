import type { Diagnostic } from "../analysis-result";
import type { Expr, Module, VarDecl } from "../../lower/ir";
import { moduleVarRefs } from "../../lower/module-refs";
import { isGlobalEnumName } from "../../lower/globals";

const NON_CONST_CALLS = new Set(["randi", "randf", "randf_range", "randi_range", "randfn", "range", "load", "str", "typeof"]);

function nonConstantExpr(e: Expr | null, funcs: ReadonlySet<string>): boolean {
  if (e === null) return false;
  switch (e.kind) {
    case "lit":
    case "ident":
      return false;
    case "lambda":
      return true;
    case "binary":
      return nonConstantExpr(e.left, funcs) || nonConstantExpr(e.right, funcs);
    case "unary":
    case "await":
    case "is":
    case "as":
      return nonConstantExpr(e.operand, funcs);
    case "ternary":
      return nonConstantExpr(e.cond, funcs) || nonConstantExpr(e.thenE, funcs) || nonConstantExpr(e.elseE, funcs);
    case "array":
      return e.items.some((it) => nonConstantExpr(it, funcs));
    case "dict":
      return e.entries.some((en) => nonConstantExpr(en.key, funcs) || nonConstantExpr(en.value, funcs));
    case "index":
      return nonConstantExpr(e.obj, funcs) || nonConstantExpr(e.index, funcs);
    case "attribute":
      return nonConstantExpr(e.obj, funcs);
    case "call":
      if (e.callee.kind === "ident") {
        const name = e.callee.name;
        if (funcs.has(name) || NON_CONST_CALLS.has(name)) return true;
        return e.args.some((a) => nonConstantExpr(a, funcs));
      }
      if (e.callee.kind === "attribute") {
        if (e.callee.obj.kind === "ident" && isGlobalEnumName(e.callee.obj.name)) return false;
        return true;
      }
      return nonConstantExpr(e.callee, funcs) || e.args.some((a) => nonConstantExpr(a, funcs));
  }
}

export function checkModuleVarCycles(m: Module, diags: Diagnostic[]): void {
  const vars = m.vars;
  const byName = new Map<string, VarDecl>(vars.map((v) => [v.name, v]));
  const refs = new Map<string, string[]>();
  for (const v of vars) {
    const out: string[] = [];
    moduleVarRefs(v.init, out);
    refs.set(v.name, out);
  }
  const funcs = new Set(m.funcs.map((f) => f.name));
  const readsValue = (v: VarDecl): boolean => (refs.get(v.name) ?? []).some((r) => byName.get(r)?.isConst === false);
  const notConstant = (v: VarDecl): boolean => readsValue(v) || nonConstantExpr(v.init, funcs);
  const fixed = new Set<string>();
  const constExpr = (v: VarDecl): void => {
    diags.push({ code: "module-const-expr", message: `Assigned value for constant "${v.name}" isn't a constant expression.`, loc: v.loc });
    fixed.add(v.name);
  };
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (v: VarDecl): void => {
    visiting.add(v.name);
    for (const ref of refs.get(v.name) ?? []) {
      if (!byName.has(ref)) continue;
      if (visiting.has(ref)) {
        diags.push({ code: "module-var-cycle", message: `Could not resolve member "${ref}": Cyclic reference.`, loc: v.loc });
        if (v.isConst && notConstant(v)) constExpr(v);
        if (v.init !== null && v.init.kind === "ident") {
          const noun = v.isConst ? "constant" : "variable";
          diags.push({ code: "module-var-cycle-type", message: `Could not resolve type for ${noun} "${v.name}".`, loc: v.loc });
        }
        break;
      }
      if (!done.has(ref)) {
        const target = byName.get(ref);
        if (target !== undefined) visit(target);
      }
    }
    visiting.delete(v.name);
    done.add(v.name);
  };
  for (const v of vars) if (!done.has(v.name)) visit(v);
  for (const v of vars) {
    if (v.isConst && !fixed.has(v.name) && notConstant(v)) constExpr(v);
  }
}
