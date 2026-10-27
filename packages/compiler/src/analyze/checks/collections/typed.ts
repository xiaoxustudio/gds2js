import { NATIVE_CLASS_SLOTS } from "../../../semantics/elem-faces";
import type { Diagnostic } from "../../analysis-result";
import type { ClassDecl, Expr, Loc, Module, Stmt, TypeRef } from "../../../lower/ir";
import { type StaticType } from "../../state";
import { assignTargetName, walkStmts } from "../../walk";
import { literalFaceText } from "../../literals";
import { canHold, isCollText, scalarSourceName, slotSource } from "../../slots";

export function checkTypedCollections(m: Module, diags: Diagnostic[]): void {
  const targets: Array<{ type: TypeRef | null; init: Expr | null; loc: Loc; varName?: string; srcAnn?: TypeRef | null; fnName?: string; fnPos?: number; assignStmt?: boolean }> = [
    ...m.vars.map((v) => ({ type: v.type, init: v.init, loc: v.loc })),
    ...m.funcs.flatMap((f) => [
      ...f.params.map((p) => ({ type: p.type, init: p.default, loc: f.loc })),
      { type: f.returnType, init: null, loc: f.loc },
    ]),
  ];
  const collect = (cls: ClassDecl): void => {
    for (const v of cls.vars) targets.push({ type: v.type, init: v.init, loc: v.loc });
    for (const f of cls.funcs) {
      for (const p of f.params) targets.push({ type: p.type, init: p.default, loc: f.loc });
      targets.push({ type: f.returnType, init: null, loc: f.loc });
    }
    for (const inner of cls.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  const classNames = new Set<string>();
  const collectClassNames = (c: ClassDecl): void => {
    classNames.add(c.name);
    for (const inner of c.innerClasses) collectClassNames(inner);
  };
  for (const c of m.innerClasses) collectClassNames(c);
  const typedVars = new Map<string, TypeRef>();
  for (const v of m.vars) if (v.type !== null) typedVars.set(v.name, v.type);
  const fnParams = new Map<string, (TypeRef | null)[]>();
  for (const f of m.funcs) fnParams.set(f.name, f.params.map((p) => p.type));
  const walkStmts = (stmts: Stmt[], retType: TypeRef | null): void => {
    if (retType === null) locals.clear();
    for (const s of stmts) {
      if (s.kind === "var") {
        const srcAnn = s.init !== null && s.init.kind === "ident" ? locals.get(s.name === undefined ? "" : (s.init as Record<string, unknown>).name as string) ?? null : null;
        targets.push({ type: s.type, init: s.init, loc: s.loc, varName: s.name, srcAnn });
        if (s.name !== undefined && s.type !== null && !locals.has(s.name)) locals.set(s.name, s.type);
      }
      else if (s.kind === "if") for (const b of s.branches) walkStmts(b.body, retType);
      else if (s.kind === "for" || s.kind === "while") walkStmts(s.body, retType);
      else if (s.kind === "return" && retType !== null) targets.push({ type: retType, init: s.value, loc: s.loc });
      else if (s.kind === "assign" && assignTargetName(s.target) !== null) {
        const name = assignTargetName(s.target) as string;
        const decl = typedVars.get(name) ?? locals.get(name);
        if (decl !== undefined) targets.push({ type: decl, init: s.value, loc: s.loc, srcAnn: srcAnnOf(s.value), assignStmt: true });
      } else walkExprs(s, retType);
    }
  };
  const walkExprs = (n: unknown, retType: TypeRef | null): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkExprs(x, retType);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o.kind === "var") {
      const t = o.type as TypeRef | null;
      if (typeof o.name === "string" && t !== null && !locals.has(o.name)) locals.set(o.name, t);
    }
    if (o.kind === "return" && retType !== null) targets.push({ type: retType, init: (o.value as Expr | null) ?? null, loc: o.loc as Loc });
    if (o.kind === "assign" && retType !== null) {
      const name = assignTargetName(o.target);
      const decl = name === null ? undefined : typedVars.get(name) ?? locals.get(name);
      if (decl !== undefined) targets.push({ type: decl, init: o.value as Expr, loc: o.loc as Loc, srcAnn: srcAnnOf(o.value as Expr), assignStmt: true });
    }
    if (o.kind === "call" && Array.isArray(o.args)) {
      const callee = o.callee as Record<string, unknown>;
      if (callee.kind === "ident" && typeof callee.name === "string") {
        const pt = fnParams.get(callee.name);
        if (pt !== undefined) {
          const args = o.args as Expr[];
          for (let i = 0; i < args.length && i < pt.length; i++) {
            const t = pt[i];
            const arg0 = args[i] ?? null;
            const argAnn: TypeRef | null = arg0 !== null && arg0.kind === "ident" ? locals.get((arg0 as unknown as Record<string, unknown>).name as string) ?? null : null;
            targets.push({ type: t ?? null, init: arg0, loc: args[i]!.loc, srcAnn: argAnn, fnName: callee.name, fnPos: i + 1 });
          }
        }
      }
    }
    for (const key of Object.keys(o)) {
      if (key !== "loc") walkExprs(o[key], retType);
    }
  };
  const locals = new Map<string, TypeRef>();
  /** 源的标注：标识符查函数内那张声明表，字面量与调用没有标注可查 */
  const srcAnnOf = (e: Expr | null): TypeRef | null => (e !== null && e.kind === "ident" ? locals.get(e.name) ?? null : null);
  for (const f of m.funcs) walkStmts(f.body, f.returnType);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) walkStmts(f.body, f.returnType);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  for (const t of targets) {
    const slotAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.fnName !== undefined && t.fnPos !== undefined && slotAnn !== null && t.srcAnn !== undefined && t.srcAnn !== null &&
        t.srcAnn.kind === "named" && (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) &&
        (slotAnn.startsWith("Array[") || slotAnn.startsWith("Dictionary[")) && t.srcAnn.name !== slotAnn) {
      diags.push({
        code: "typed-collection-param",
        message: `Invalid argument for "${t.fnName}()" function: argument ${String(t.fnPos)} should be "${slotAnn}" but is "${t.srcAnn.name}".`,
        loc: t.loc,
      });
      continue;
    }
    const targetAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && isCollText(t.srcAnn.name) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null && t.srcAnn.kind === "named" &&
      (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign",
        message: `Cannot assign a value of type ${t.srcAnn.name} to variable "${t.varName}" with specified type ${targetAnn}.`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.init !== null) {
      const srcKind = t.init.kind === "array" ? "Array" : t.init.kind === "dict" ? "Dictionary" : null;
      const wantKind = targetAnn.startsWith("Array") ? "Array" : "Dictionary";
      if (srcKind !== null && srcKind !== wantKind) {
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${literalFaceText(t.init, srcKind)} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
      const st = srcKind === null ? slotSource(t.init) : null;
      if (st !== null && scalarSourceName(st, classNames)) {
        diags.push({
          code: "typed-collection-assign-as",
          message: `Cannot assign a value of type "${st}" as "${targetAnn}".`,
          loc: t.loc,
        });
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${st} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
    }
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && scalarSourceName(t.srcAnn.name, classNames)) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
    if (t.type === null || t.type.kind !== "named") continue;
    const m2 = /^(Array|Dictionary)\[(.+)\]$/.exec(t.type.name);
    if (m2 === null) continue;
    const inner = m2[2] ?? "";
    if (inner.includes("[")) {
      diags.push({
        code: "typed-collection-nested",
        message: "Nested typed collections are not supported.",
        loc: t.loc,
      });
      continue;
    }
    if (t.init === null) continue;
    const slotOf = (e: Expr): NonNullable<StaticType> | null => {
      if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.name === "new" && e.callee.obj.kind === "ident" && classNames.has(e.callee.obj.name)) return e.callee.obj.name as NonNullable<StaticType>;
      return slotSource(e);
    };
    const parentOf = new Map<string, string>();
    const collectParents = (c: ClassDecl): void => {
      if (c.extends !== null && c.extends !== "") parentOf.set(c.name, c.extends);
      for (const inner of c.innerClasses) collectParents(inner);
    };
    for (const c of m.innerClasses) collectParents(c);
    const related = (a: string, b: string): boolean => {
      for (let x: string | undefined = a; x !== undefined; x = parentOf.get(x)) if (x === b) return true;
      for (let x: string | undefined = b; x !== undefined; x = parentOf.get(x)) if (x === a) return true;
      return false;
    };
    const nativeRoot = (x: string): string => {
      let cur: string | undefined = x;
      for (let guard = 0; guard < 16 && cur !== undefined; guard++) {
        const p = parentOf.get(cur);
        if (p === undefined) return classNames.has(cur) ? "RefCounted" : cur;
        if (!classNames.has(p)) return p;
        cur = p;
      }
      return "RefCounted";
    };
    const isObjectFace = (x: string): boolean => classNames.has(x) || NATIVE_CLASS_SLOTS.has(x);
    const holds = (kind: string, st: NonNullable<StaticType>): boolean => {
      if (st === "null") return true;
      if (NATIVE_CLASS_SLOTS.has(kind)) return kind === "Object" ? isObjectFace(st) : isObjectFace(st) && nativeRoot(st) === kind;
      if (classNames.has(kind)) return classNames.has(st) && related(kind, st);
      return canHold(kind, st);
    };
    const report = (st: NonNullable<StaticType>, kind: string, second: string): void => {
      if (!isObjectFace(kind) && !isObjectFace(st)) {
        diags.push({ code: "typed-collection-literal", message: `Cannot include a value of type "${st}" as "${kind}".`, loc: t.loc });
      }
      diags.push({ code: "typed-collection-element", message: second, loc: t.loc });
    };
    if (m2[1] === "Array") {
      const kind = inner.trim();
      if (t.init.kind === "array") {
        let done = false;
        for (const it of t.init.items) {
          if (done) break;
          const st = slotOf(it);
          if (st === null || holds(kind, st)) continue;
          done = true;
          report(st, kind, `Cannot have an element of type "${st}" in an array of type "Array[${kind}]".`);
        }
      }
    } else {
      const parts = inner.split(",").map((p) => p.trim());
      const keyKind = parts[0] ?? "";
      const valKind = parts[1] ?? "";
      if (t.init.kind === "dict" && parts.length === 2) {
        const text = `Dictionary[${keyKind}, ${valKind}]`;
        let done = false;
        for (const en of t.init.entries) {
          if (done) break;
          const ks = slotOf(en.key);
          if (ks !== null && !holds(keyKind, ks)) {
            done = true;
            report(ks, keyKind, `Cannot have a key of type "${ks}" in a dictionary of type "${text}".`);
            break;
          }
          const vs = slotOf(en.value);
          if (vs !== null && !holds(valKind, vs)) {
            done = true;
            report(vs, valKind, `Cannot have a value of type "${vs}" in a dictionary of type "${text}".`);
          }
        }
      }
    }
  }
}
