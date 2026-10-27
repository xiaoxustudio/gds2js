import type { Diagnostic } from "../../analysis-result";
import { ARRAY_METHOD_ARITY, DICT_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import type { ClassDecl, Expr, Loc, Module, Stmt, VarDecl } from "../../../lower/ir";
import { moduleAssignedNames } from "../../walk";
import { dictKeyText, dictKeyToken } from "../../literals";
import { foldDictKey } from "../../slots";
import { faceReceiverNames, faceScopes } from "../../faces";
import { containerCallArity, faceGhostDiags } from "../../arity";

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
