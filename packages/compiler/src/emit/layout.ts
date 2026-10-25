import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { SCRIPT_HOST_BASES } from "./surface";
import { propSlot } from "./abi";

/** 自己类的脚本变量名表（声明顺序），`String.format()` 的实参是脚本实例时按它逐个替换（引擎顺序是自己类在前、基类在后）。 */
export function scriptPropsLiteral(vars: readonly { name: string }[]): string | null {
  return vars.length === 0 ? null : JSON.stringify(vars.map((v) => v.name));
}

/** `scriptProps` 那串名字的取值闭包，与名单同序：静态目标上不能拿实例当 `Record<string, Variant>` 索引（S270 ③）。
 *  常量与 `static var` 发的是 `static NAME = …`，实例上按名取本来就是 `undefined`，`s.NAME` 同一个结果；
 *  带 get/set 的属性在 JS 里是原型上的 getter，两条路也都会触发它 —— 所以逐格 `s.<名>` 与原来的按名索引一字不差。 */
export function scriptPropsReaderLiteral(className: string, vars: readonly { name: string }[]): string {
  const reads = vars.map((v) => `s.${v.name}`).join(", ");
  return `(o) => { const s = o as ${className}; return [${reads}]; }`;
}

export function dictIdentityLiteral(descVar: string, classPath: string, vars: readonly VarDecl[], className: string): string {
  const res = ctx.MODULE_RES_PATH === null ? "null" : JSON.stringify(ctx.MODULE_RES_PATH);
  const kept = vars.filter((v) => !v.isStatic && !v.isConst);
  const names = JSON.stringify(kept.map((v) => v.name));
  const accRows: string[] = [];
  for (const v of vars) {
    if (v.accessor === null || v.accessor === undefined) continue;
    const base = v.type !== null && v.type.kind === "named" ? v.type.name.replace(/\[.*\]$/, "") : null;
    accRows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(base)}`);
  }
  const acc = accRows.length === 0 ? "{}" : `{${accRows.join(", ")}}`;
  const reads = kept
    .map((v) => {
      if (v.accessor === null || v.accessor === undefined) return `s.${v.name}`;
      const slot = propSlot(v);
      return slot === null ? "rt.V.nil()" : `s.${slot}`;
    })
    .join(", ");
  return `rt.registerDictIdentity(${descVar}, ${res}, ${JSON.stringify(classPath)}, ${names}, ${acc}, (o) => { const s = o as ${className}; return [${reads}]; });`;
}

export function fieldTypesLiteral(vars: readonly { name: string; type: TypeRef | null; accessor?: PropAccessor | null }[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    const base = v.type !== null && v.type.kind === "named" ? v.type.name.replace(/\[.*\]$/, "") : "";
    if (v.accessor !== null && v.accessor !== undefined) {
      const known = base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2";
      rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(known ? base : "accessor")}`);
      continue;
    }
    if (v.type === null || v.type.kind !== "named") continue;
    if (base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2") {
      rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(base)}`);
    }
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

/** 静态方法名表，连同「名字 → 调用入口」那张闭包表一起发给 `rt.registerStaticMethods`。必须是显式表：鸭子类型去认构造器自有属性会把函数自带的 `name` / `length` 当成方法。 */
export function staticNamesLiteral(funcs: readonly { name: string; isStatic: boolean }[]): string[] {
  return funcs.filter((f) => f.isStatic).map((f) => f.name);
}

/** 按位置转发实参（派发表 / 静态方法表 / `_init` 工厂共用）：带默认值的形参在调用方没给那一格时必须是真的 `undefined`。 */
export function fwdParams(params: readonly { default: unknown }[], arr: string): string {
  return params
    .map((p, i) =>
      p.default === null || p.default === undefined
        ? `${arr}[${i}] as rt.Variant`
        : `${arr}.length > ${i} ? (${arr}[${i}] as rt.Variant) : undefined`,
    )
    .join(", ");
}

export function staticsTableLiteral(className: string, funcs: readonly FuncDecl[]): string {
  const rows = funcs
    .filter((f) => f.isStatic)
    .map((f) => {
      const fwd = fwdParams(f.params, "a");
      return `${JSON.stringify(f.name)}: (a: rt.Variant[]): rt.Variant => rt.wrapValue(${className}.${f.name}(${fwd}))`;
    });
  return `{${rows.join(", ")}}`;
}

export function staticVarTableLiteral(vars: readonly VarDecl[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    if (!v.isStatic) continue;
    const base = v.type !== null && v.type.kind === "named" ? v.type.name.replace(/\[.*\]$/, "") : "";
    rows.push(`${JSON.stringify(v.name)}: ${JSON.stringify(base === "int" || base === "float" || base === "bool" || base === "String" || base === "Vector2" ? base : "")}`);
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

export function hasDeadStaticDelegate(m: Module): boolean {
  const dead = (vars: readonly VarDecl[], statics: Set<string>): boolean =>
    vars.some((v) => {
      const a = v.accessor;
      if (!v.isStatic || a === null || a === undefined) return false;
      const g = a.getter;
      const s = a.setter;
      return (g !== null && g.kind === "method" && !statics.has(g.method)) || (s !== null && s.kind === "method" && !statics.has(s.method));
    });
  const walk = (vars: readonly VarDecl[], funcs: readonly FuncDecl[], inner: readonly ClassDecl[]): boolean =>
    dead(vars, new Set(funcs.filter((f) => f.isStatic).map((f) => f.name))) || inner.some((c) => walk(c.vars, c.funcs, c.innerClasses));
  return walk(m.vars, m.funcs, m.innerClasses);
}

export function innerClassBase(text: string): string | null {
  if (text === "RefCounted" || text === "Object") return null;
  if (ctx.INNER_CLASSES.has(text)) return text;
  throw new UnsupportedError("class-extends", `内部类 extends ${text} 还没实测过（引擎类型属 Tier 2，跨文件的内部类基类那一格没量）`);
}

export function innerInheritedMethodNames(decl: ClassDecl): string[] {
  const seen = new Set<string>([decl.name]);
  const out: string[] = [];
  let next: string | null = decl.extends;
  while (next !== null) {
    const parent = ctx.INNER_CLASSES.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    for (const f of parent.funcs) if (!f.isStatic) out.push(f.name);
    next = parent.extends;
  }
  return out;
}

export function innerInheritedNames(decl: ClassDecl): string[] {
  const seen = new Set<string>([decl.name]);
  const out: string[] = [];
  let next: string | null = decl.extends;
  while (next !== null) {
    const parent = ctx.INNER_CLASSES.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    out.push(
      ...parent.vars.filter((v) => !v.isStatic).map((v) => v.name),
      ...parent.signals.map((s) => s.name),
    );
    next = parent.extends;
  }
  return out;
}

export function orderInnerClasses(classes: ClassDecl[]): ClassDecl[] {
  const out: ClassDecl[] = [];
  const done = new Set<string>();
  const visiting = new Set<string>();
  const put = (c: ClassDecl): void => {
    if (done.has(c.name)) return;
    if (visiting.has(c.name)) throw new UnsupportedError("class-extends", `内部类 ${c.name} 的 extends 成环`);
    visiting.add(c.name);
    const b = c.extends !== null ? ctx.INNER_CLASSES.get(c.extends) : undefined;
    if (b) put(b);
    visiting.delete(c.name);
    done.add(c.name);
    out.push(c);
  };
  for (const c of classes) put(c);
  return out;
}

export function collectLocalTypes(body: Stmt[], out: Map<string, TypeRef | null>, untyped: string[]): Map<string, TypeRef | null> {
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "var":
        if (s.type !== null) out.set(s.name, s.type);
        else untyped.push(s.name);
        return;
      case "if":
        for (const br of s.branches) {
          br.cond && exprTypes(br.cond);
          br.body.forEach(stmt);
        }
        return;
      case "for":
        exprTypes(s.iter);
        s.body.forEach(stmt);
        return;
      case "while":
        exprTypes(s.cond);
        s.body.forEach(stmt);
        return;
      case "match":
        exprTypes(s.subject);
        for (const arm of s.arms) {
          arm.guard && exprTypes(arm.guard);
          arm.body.forEach(stmt);
        }
        return;
      case "assign":
        exprTypes(s.target);
        exprTypes(s.value);
        return;
      case "expr":
        exprTypes(s.expr);
        return;
      case "return":
        if (s.value) exprTypes(s.value);
        return;
      default:
        return;
    }
  };
  const exprTypes = (e: Expr): void => {
    switch (e.kind) {
      case "lambda":
        e.body.forEach(stmt);
        return;
      case "call":
        exprTypes(e.callee);
        e.args.forEach(exprTypes);
        return;
      case "binary":
        exprTypes(e.left);
        exprTypes(e.right);
        return;      case "ternary":
        exprTypes(e.cond);
        exprTypes(e.thenE);
        exprTypes(e.elseE);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        exprTypes(e.operand);
        return;
      case "attribute":
        exprTypes(e.obj);
        return;
      case "index":
        exprTypes(e.obj);
        exprTypes(e.index);
        return;
      case "array":
        e.items.forEach(exprTypes);
        return;
      case "dict":
        for (const en of e.entries) {
          exprTypes(en.key);
          exprTypes(en.value);
        }
        return;
      default:
        return;
    }
  };
  body.forEach(stmt);
  return out;
}

export function collectScriptBase(c: ClassDecl, out: Map<string, string>): void {
  const base = c.extends === null || c.extends === "" ? "RefCounted" : c.extends;
  if (base === "RefCounted" || out.get(base) !== undefined || SCRIPT_HOST_BASES.has(base)) out.set(c.name, out.get(base) ?? base);
  for (const inner of c.innerClasses) collectScriptBase(inner, out);
}

export function methodAritiesLiteral(funcs: readonly FuncDecl[]): string | null {
  const rows: string[] = [];
  for (const f of funcs) {
    if (f.name === "_init") continue;
    let required = f.params.length;
    for (let i = 0; i < f.params.length; i++) {
      if (f.params[i]?.default !== null && f.params[i]?.default !== undefined) {
        required = i;
        break;
      }
    }
    rows.push(`${JSON.stringify(f.name)}: [${required}, ${f.params.length}]`);
  }
  return rows.length === 0 ? null : `{ ${rows.join(", ")} }`;
}

export function ctorAritiesLiteral(funcs: readonly FuncDecl[]): string | null {
  const ctor = funcs.find((f) => f.name === "_init");
  if (ctor === undefined || ctor.params.length === 0) return null;
  let required = ctor.params.length;
  for (let i = 0; i < ctor.params.length; i++) {
    if (ctor.params[i]?.default !== null && ctor.params[i]?.default !== undefined) {
      required = i;
      break;
    }
  }
  return `[${required}, ${ctor.params.length}]`;
}

export function methodParamsLiteral(funcs: readonly FuncDecl[]): string | null {
  const rows: string[] = [];
  for (const f of funcs) {
    if (f.name === "_init" || f.params.length === 0) continue;
    const slots = f.params.map((pt) => (pt.type === null || pt.type.kind !== "named" ? "null" : JSON.stringify(pt.type.name)));
    if (slots.every((pt) => pt === "null")) continue;
    rows.push(`${JSON.stringify(f.name)}: [${slots.join(", ")}]`);
  }
  return rows.length === 0 ? null : `{ ${rows.join(", ")} }`;
}

export function patternNames(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternNames);
    case "dict":
      return p.entries.flatMap((en) => patternNames(en.pattern));
    default:
      return [];
  }
}

export function pctStaticSide(e: Expr): boolean {
  switch (e.kind) {
    case "ident": {
      if (ctx.UNTYPED_NAMES.has(e.name)) return false;
      const table = ctx.LOCAL_TYPES.has(e.name) ? ctx.LOCAL_TYPES : ctx.VAR_TYPES.has(e.name) ? ctx.VAR_TYPES : null;
      if (table === null) return true;
      const t = table.get(e.name);
      if (t === undefined) return true;
      if (t === null) return false;
      return !(t.kind === "named" && t.name === "Variant");
    }
    case "call": {
      if (e.callee.kind !== "ident") return true;
      const t = ctx.FUNC_RETURNS.get(e.callee.name);
      if (t === undefined) return true;
      if (t === null) return false;
      return !(t.kind === "named" && t.name === "Variant");
    }
    case "index": {
      if (e.obj.kind !== "ident") return true;
      const table = ctx.LOCAL_TYPES.has(e.obj.name) ? ctx.LOCAL_TYPES : ctx.VAR_TYPES.has(e.obj.name) ? ctx.VAR_TYPES : null;
      const t = table === null ? undefined : table.get(e.obj.name);
      return !(t !== null && t !== undefined && t.kind === "named" && (t.name === "Array" || t.name === "Dictionary"));
    }
    default:
      return true;
  }
}
