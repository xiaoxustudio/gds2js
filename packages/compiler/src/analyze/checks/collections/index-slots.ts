import type { Diagnostic } from "../../analysis-result";
import { PACK_SHAPE_NAMES } from "../../../semantics/elem-faces";
import type { ClassDecl, Expr, Module, Stmt, TypeRef, VarDecl } from "../../../lower/ir";
import { type StaticType, type TypedSlot, diKey, parseTyped, run } from "../../state";
import { walkExpr, walkStmts } from "../../walk";
import { canHold, dictSlotOf, slotSource } from "../../slots";
import { scalarStaticName } from "../../faces";

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
