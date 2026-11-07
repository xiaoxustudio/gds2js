import type { Diagnostic } from "../analysis-result";
import type { Module, VarDecl } from "../../lower/ir";
import { moduleVarRefs } from "../../lower/module-refs";

export function checkModuleVarCycles(m: Module, diags: Diagnostic[]): void {
  const vars = m.vars.filter((v) => !v.isConst);
  const byName = new Map<string, VarDecl>(vars.map((v) => [v.name, v]));
  const refs = new Map<string, string[]>();
  for (const v of vars) {
    const out: string[] = [];
    moduleVarRefs(v.init, out);
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
