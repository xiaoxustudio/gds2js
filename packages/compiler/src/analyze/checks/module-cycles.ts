import type { Diagnostic } from "../analysis-result";
import type { Expr, Module, VarDecl } from "../../lower/ir";

function refsOf(e: Expr | null, out: string[]): void {
  if (e === null) return;
  switch (e.kind) {
    case "lit":
      return;
    case "ident":
      out.push(e.name);
      return;
    case "binary":
      refsOf(e.left, out);
      refsOf(e.right, out);
      return;
    case "unary":
    case "await":
      refsOf(e.operand, out);
      return;
    case "is":
    case "as":
      refsOf(e.operand, out);
      return;
    case "call":
      refsOf(e.callee, out);
      for (const a of e.args) refsOf(a, out);
      return;
    case "attribute":
      refsOf(e.obj, out);
      return;
    case "index":
      refsOf(e.obj, out);
      refsOf(e.index, out);
      return;
    case "array":
      for (const it of e.items) refsOf(it, out);
      return;
    case "dict":
      for (const en of e.entries) {
        refsOf(en.key, out);
        refsOf(en.value, out);
      }
      return;
    case "ternary":
      refsOf(e.cond, out);
      refsOf(e.thenE, out);
      refsOf(e.elseE, out);
      return;
    case "lambda":
      return;
  }
}

export function checkModuleVarCycles(m: Module, diags: Diagnostic[]): void {
  const vars = m.vars.filter((v) => !v.isConst);
  const byName = new Map<string, VarDecl>(vars.map((v) => [v.name, v]));
  const refs = new Map<string, string[]>();
  for (const v of vars) {
    const out: string[] = [];
    refsOf(v.init, out);
    refs.set(v.name, out);
  }
  const done = new Set<string>();
  const visiting = new Set<string>();
  const visit = (v: VarDecl): void => {
    visiting.add(v.name);
    for (const ref of refs.get(v.name) ?? []) {
      if (!byName.has(ref)) continue;
      if (visiting.has(ref)) {
        diags.push({ code: "module-var-cycle", message: `Could not resolve member "${ref}": Cyclic reference.`, loc: v.loc });
        if (v.init !== null && v.init.kind === "ident") {
          diags.push({ code: "module-var-cycle-type", message: `Could not resolve type for variable "${v.name}".`, loc: v.loc });
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
}
