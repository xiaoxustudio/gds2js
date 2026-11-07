import type { Expr } from "./ir";

export function moduleVarRefs(e: Expr | null, out: string[]): void {
  if (e === null) return;
  switch (e.kind) {
    case "lit":
      return;
    case "ident":
      out.push(e.name);
      return;
    case "binary":
      moduleVarRefs(e.left, out);
      moduleVarRefs(e.right, out);
      return;
    case "unary":
    case "await":
      moduleVarRefs(e.operand, out);
      return;
    case "is":
    case "as":
      moduleVarRefs(e.operand, out);
      return;
    case "call":
      moduleVarRefs(e.callee, out);
      for (const a of e.args) moduleVarRefs(a, out);
      return;
    case "attribute":
      moduleVarRefs(e.obj, out);
      return;
    case "index":
      moduleVarRefs(e.obj, out);
      moduleVarRefs(e.index, out);
      return;
    case "array":
      for (const it of e.items) moduleVarRefs(it, out);
      return;
    case "dict":
      for (const en of e.entries) {
        moduleVarRefs(en.key, out);
        moduleVarRefs(en.value, out);
      }
      return;
    case "ternary":
      moduleVarRefs(e.cond, out);
      moduleVarRefs(e.thenE, out);
      moduleVarRefs(e.elseE, out);
      return;
    case "lambda":
      return;
  }
}
