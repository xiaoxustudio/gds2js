import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { ABI_KINDS, ARITH_RAW, CMP_OPS, CMP_RAW, FLOAT_ARITH, FLOAT_ARITH_RAW, INT_ARITH, MEASURED_SLOTS, NO_ARRAYS, NO_DICTS, type R, RAW_INT_MAX, RAW_INT_MIN } from "./surface";
import { type ArrayCand, analyzeFuncLayout, fastSuffix, isRangeCall, sigValid, stampDecl } from "./helpers";
import { emitExpr, emitExprR } from "./expr-boxed";
import { patternNames } from "./layout";

export function staticVarSlotsLiteral(className: string, vars: readonly VarDecl[]): string | null {
  const rows: string[] = [];
  for (const v of vars) {
    if (!v.isStatic) continue;
    rows.push(
      `${JSON.stringify(v.name)}: { get: (): rt.Variant => ${className}.${v.name}, set: (__v: rt.Variant): void => { ${className}.${v.name} = __v; } }`,
    );
  }
  return rows.length === 0 ? null : `{${rows.join(", ")}}`;
}

export function propSlot(v: VarDecl): string | null {
  const a = v.accessor;
  if (a === null || a === undefined) return null;
  return v.init !== null || a.getter === null ? `__gd_store_${v.name}` : null;
}

export function propSlotInit(v: VarDecl): string {
  return `  ${v.isStatic ? "static " : ""}${propSlot(v)} = ${slotInit(v.type, v.init, v.isStatic)};`;
}

export function collectBinds(root: unknown, out: Map<string, number>): Map<string, number> {
  if (Array.isArray(root)) {
    for (const v of root) collectBinds(v, out);
    return out;
  }
  if (root === null || typeof root !== "object") return out;
  const o = root as Record<string, unknown>;
  if ((o["kind"] === "var" || o["kind"] === "bind") && typeof o["name"] === "string") addBind(out, o["name"]);
  const loopVar = o["kind"] === "for" && typeof o["var"] === "string" ? o["var"] : null;
  if (loopVar !== null) addBind(out, loopVar);
  if (Array.isArray(o["params"])) for (const p of o["params"] as Array<{ name?: string }>) if (typeof p?.name === "string") addBind(out, p.name);
  for (const v of Object.values(o)) collectBinds(v, out);
  if (loopVar !== null) dropBind(out, loopVar);
  return out;
}

/** 形参在整支函数身上活着：先把它们计进这张表，再让 `collectBinds` 往下走。 */
export function seedParamBinds(params: Param[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const p of params) addBind(out, p.name);
  return out;
}

export function addBind(out: Map<string, number>, name: string): void {
  out.set(name, (out.get(name) ?? 0) + 1);
}

export function dropBind(out: Map<string, number>, name: string): void {
  const left = (out.get(name) ?? 1) - 1;
  if (left <= 0) out.delete(name);
  else out.set(name, left);
}

export function slotTypeName(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return MEASURED_SLOTS.has(base) ? base : null;
}

export function slotInit(t: TypeRef | null, init: Expr | null | undefined, selfIsNil = false): string {
  const prev = ctx.selfInNilContext;
  ctx.selfInNilContext = selfIsNil;
  try {
    const raw = stampDecl(t, init, emitExpr);
    const cast = declaredCast(t);
    return cast === null ? raw : `${cast}(${raw})`;
  } finally {
    ctx.selfInNilContext = prev;
  }
}

/** 裸数组元素的 TS 类型：静态编译目标不接受推断出的 `any[]`，而元素种类发射期就知道，声明时写上。 */
export function rawElemTs(k: ElemKind): "number" | "string" {
  return leafOf(k) === "str" ? "string" : "number";
}

export function emitRawIndexWrite(target: Expr, value: Expr): string | null {
  if (target.kind !== "index") return null;
  const raw = (e: Expr, want: Kind): string => {
    const r = emitExprR(e);
    if (r.rep !== want) {
      throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组写入值 rep=${r.rep}，应为 ${want}`);
    }
    return r.code;
  };
  if (target.obj.kind === "ident") {
    const K = ctx.RAW_ARRAYS.get(target.obj.name);
    if (!K || isGridElem(K)) return null;
    const i = raw(target.index, "int");
    const v = raw(value, K);
    return `rt.fast.rawArrSet${fastSuffix(K)}(${target.obj.name}, ${i}, ${v});`;
  }
  if (target.obj.kind === "index" && target.obj.obj.kind === "ident") {
    const K = ctx.RAW_ARRAYS.get(target.obj.obj.name);
    if (!K || !isGridElem(K)) return null;
    const i = raw(target.obj.index, "int");
    const j = raw(target.index, "int");
    const v = raw(value, leafOf(K));
    return `rt.fast.rawArrSet${fastSuffix(K)}2(${target.obj.obj.name}, ${i}, ${j}, ${v});`;
  }
  return null;
}

export const isGridElem = (k: ElemKind): k is "int[]" | "float[]" | "str[]" => k === "int[]" || k === "float[]" || k === "str[]";

export const leafOf = (k: ElemKind): Kind => (k === "int[]" ? "int" : k === "float[]" ? "float" : k === "str[]" ? "str" : k);

export function tryRawBinary(e: Extract<Expr, { kind: "binary" }>): R | null {
  const L = emitExprR(e.left);
  const Rr = emitExprR(e.right);
  if (CMP_RAW[e.op] && L.rep === Rr.rep && (L.rep === "int" || L.rep === "float")) {
    return { code: `(${L.code} ${CMP_RAW[e.op]!} ${Rr.code})`, rep: "bool" };
  }
  if (L.rep === "int" && Rr.rep === "int" && ARITH_RAW[e.op]) {
    if (!litBinaryFitsRaw(e)) return null;
    return { code: `rt.fast.${ARITH_RAW[e.op]!}(${L.code}, ${Rr.code})`, rep: "int" };
  }
  if (L.rep === "float" && Rr.rep === "float" && FLOAT_ARITH_RAW[e.op]) {
    return { code: `(${L.code} ${FLOAT_ARITH_RAW[e.op]!} ${Rr.code})`, rep: "float" };
  }
  if (L.rep === "str" && Rr.rep === "str" && e.op === "+") {
    return { code: `(${L.code} + ${Rr.code})`, rep: "str" };
  }
  return null;
}

export function computeUnboxed(
  f: FuncDecl,
  arrays: Map<string, ElemKind> = NO_ARRAYS,
  dict: Map<string, "int" | "float"> = NO_DICTS,
): Map<string, "int" | "float" | "str"> {
  const abi = ctx.RAW_ABIS.get(f.name);
  const paramKind = new Map<string, Kind>();
  if (abi) f.params.forEach((p, i) => paramKind.set(p.name, abi.params[i]!));
  const excluded = new Set<string>(f.params.map((p) => p.name));
  const decls: Array<{ name: string; init: Expr | null }> = [];
  const assigns: Array<{ name: string; value: Expr }> = [];

  const walkExpr = (e: Expr, inLambda: boolean): void => {
    switch (e.kind) {
      case "ident":
        if (analysis.isGlobalValueRead(e)) excluded.add(e.name);
        break;
      case "lambda":
        e.body.forEach((s) => walkStmt(s, true));
        break;
      case "binary":
        walkExpr(e.left, inLambda);
        walkExpr(e.right, inLambda);
        break;      case "ternary":
        walkExpr(e.cond, inLambda);
        walkExpr(e.thenE, inLambda);
        walkExpr(e.elseE, inLambda);
        break;
      case "unary":
      case "await":
        walkExpr(e.operand, inLambda);
        break;
      case "call":
        walkExpr(e.callee, inLambda);
        e.args.forEach((a) => walkExpr(a, inLambda));
        break;
      case "attribute":
        walkExpr(e.obj, inLambda);
        break;
      case "index":
        walkExpr(e.obj, inLambda);
        walkExpr(e.index, inLambda);
        break;
      case "array":
        e.items.forEach((a) => walkExpr(a, inLambda));
        break;
      case "dict":
        e.entries.forEach((en) => {
          walkExpr(en.key, inLambda);
          walkExpr(en.value, inLambda);
        });
        break;
      case "is":
      case "as":
        walkExpr(e.operand, inLambda);
        break;
    }
  };
  const walkStmt = (s: Stmt, inLambda: boolean): void => {
    switch (s.kind) {
      case "var":
        if (inLambda) excluded.add(s.name);
        else if (!s.type) decls.push({ name: s.name, init: s.init });
        else excluded.add(s.name);
        if (s.init) walkExpr(s.init, inLambda);
        break;
      case "assign":
        if (s.target.kind === "ident") {
          if (inLambda) excluded.add(s.target.name);
          else assigns.push({ name: s.target.name, value: s.value });
        }
        walkExpr(s.target, inLambda);
        walkExpr(s.value, inLambda);
        break;
      case "expr":
        walkExpr(s.expr, inLambda);
        break;
      case "return":
        if (s.value) walkExpr(s.value, inLambda);
        break;
      case "if":
        for (const b of s.branches) {
          if (b.cond) walkExpr(b.cond, inLambda);
          b.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
      case "for":
        if (inLambda || !isRangeCall(s.iter)) excluded.add(s.var);
        else decls.push({ name: s.var, init: { kind: "lit", lit: "int", value: 0, loc: s.iter.loc } });
        walkExpr(s.iter, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "while":
        walkExpr(s.cond, inLambda);
        s.body.forEach((x) => walkStmt(x, inLambda));
        break;
      case "match":
        walkExpr(s.subject, inLambda);
        for (const a of s.arms) {
          if (a.guard) walkExpr(a.guard, inLambda);
          patternNames(a.pattern).forEach((n) => excluded.add(n));
          a.body.forEach((x) => walkStmt(x, inLambda));
        }
        break;
    }
  };
  f.body.forEach((s) => walkStmt(s, false));

  const result = new Map<string, "int" | "float" | "str">();
  if (abi) f.params.forEach((p, i) => result.set(p.name, abi.params[i]!));
  for (const kind of ABI_KINDS) {
    const isLit = (e: Expr): boolean =>
      e.kind === "lit" &&
      (kind === "int"
        ? e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)
        : kind === "float"
          ? e.lit === "float"
          : e.lit === "string");
    const U = new Set<string>();
    const identKind = (self: string) => (n: string): Kind | null =>
      paramKind.get(n) ?? result.get(n) ?? (n === self || U.has(n) ? kind : null);
    const isNum = (e: Expr, self: string): boolean => {
      if (e.kind === "call") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "binary") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "index") return kindOfExpr(e, identKind(self), arrays, dict) === kind;
      if (e.kind === "lit") return isLit(e);
      if (e.kind === "ident") return e.name === self || U.has(e.name) || paramKind.get(e.name) === kind;
      return false;
    };
    for (const d of decls) if (!excluded.has(d.name) && !result.has(d.name)) U.add(d.name);
    let pruned = true;
    while (pruned) {
      pruned = false;
      for (const name of [...U]) {
        const okInit = decls.every((d) => d.name !== name || (!!d.init && isNum(d.init, name)));
        if (okInit && assigns.every((a) => a.name !== name || isNum(a.value, name))) continue;
        U.delete(name);
        pruned = true;
      }
    }
    for (const name of U) result.set(name, kind);
  }
  return result;
}

export function rawIntLit(e: Expr): bigint | null {
  if (e.kind !== "lit" || e.lit !== "int") return null;
  return typeof e.value === "number" ? BigInt(e.value) : null;
}

/** 双 int 字面量的裸算术结果还塞得进 2^53 吗？塞不进就整式退回装箱轨——只有操作数皆为字面量才可静态判定。 */
export function litBinaryFitsRaw(e: Extract<Expr, { kind: "binary" }>): boolean {
  const a = rawIntLit(e.left);
  const b = rawIntLit(e.right);
  if (a === null || b === null) return true;
  let r: bigint;
  switch (e.op) {
    case "+":
      r = a + b;
      break;
    case "-":
      r = a - b;
      break;
    case "*":
      r = a * b;
      break;
    default:
      return true;
  }
  return r >= RAW_INT_MIN && r <= RAW_INT_MAX;
}

export function kindOfExpr(
  e: Expr,
  identKind: (n: string) => Kind | null,
  arrays: Map<string, ElemKind> = NO_ARRAYS,
  dict: Map<string, "int" | "float"> = NO_DICTS,
): Kind | "bool" | null {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) return "int";
      if (e.lit === "float" && typeof e.value === "number") return "float";
      if (e.lit === "string") return "str";
      return null;
    case "ident":
      return identKind(e.name);
    case "binary": {
      const lk = kindOfExpr(e.left, identKind, arrays, dict);
      const rk = kindOfExpr(e.right, identKind, arrays, dict);
      if (lk === null || rk === null || lk === "bool" || rk === "bool" || lk !== rk) return null;
      if (lk === "int" && INT_ARITH.has(e.op)) return litBinaryFitsRaw(e) ? "int" : null;
      if (lk === "float" && FLOAT_ARITH.has(e.op)) return "float";
      if (lk === "str" && e.op === "+") return "str";
      if ((lk === "int" || lk === "float") && CMP_OPS.has(e.op)) return "bool";
      return null;
    }
    case "unary": {
      if (e.op !== "-") return null;
      const ok = kindOfExpr(e.operand, identKind, arrays, dict);
      return ok === "int" || ok === "float" ? ok : null;
    }
    case "index": {
      const mid = e.obj;
      if (mid.kind === "index" && mid.obj.kind === "ident") {
        const ek = arrays.get(mid.obj.name);
        if (
          ek &&
          isGridElem(ek) &&
          kindOfExpr(mid.index, identKind, arrays, dict) === "int" &&
          kindOfExpr(e.index, identKind, arrays, dict) === "int"
        )
          return leafOf(ek);
      }
      if (e.obj.kind === "ident") {
        const ek = arrays.get(e.obj.name);
        if (ek && !isGridElem(ek) && kindOfExpr(e.index, identKind, arrays, dict) === "int") return ek;
        const dk = dict.get(e.obj.name);
        if (dk) {
          const kk = kindOfExpr(e.index, identKind, arrays, dict);
          if (kk === "int" || kk === "str") return dk;
        }
      }
      return null;
    }
    case "call": {
      if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
        const recv = e.callee.obj.name;
        if (
          (arrays.has(recv) || dict.has(recv)) &&
          (e.callee.name === "size" || e.callee.name === "length") &&
          e.args.length === 0
        )
          return "int";
        if (arrays.has(recv) && e.callee.name === "insert" && e.args.length === 2) {
          return kindOfExpr(e.args[0]!, identKind, arrays, dict) === "int" ? "int" : null;
        }
        const gk = dict.get(recv);
        if (gk && e.callee.name === "get" && e.args.length === 2) {
          const kk = kindOfExpr(e.args[0]!, identKind, arrays, dict);
          const dk2 = kindOfExpr(e.args[1]!, identKind, arrays, dict);
          if ((kk === "int" || kk === "str") && dk2 === gk) return gk;
        }
        return null;
      }
      if (e.callee.kind !== "ident") return null;
      const abi = ctx.RAW_ABIS.get(e.callee.name);
      if (!abi || e.args.length !== abi.params.length) return null;
      for (let i = 0; i < e.args.length; i++) {
        if (kindOfExpr(e.args[i]!, identKind, arrays, dict) !== abi.params[i]!) return null;
      }
      return abi.ret;
    }
    default:
      return null;
  }
}

export interface RawSite {
  args: Expr[];
  owner: FuncDecl;
}

export function abiFormOk(f: FuncDecl): boolean {
  if (f.coroutine || f.isStatic) return false;
  if (f.returnType) return false;
  if (f.body.length === 0) return false;
  for (const p of f.params) if (p.type || p.default) return false;
  let sawReturn = false;
  for (const st of f.body) {
    if (st.kind === "return") {
      if (!st.value) return false;
      sawReturn = true;
    } else if (st.kind === "var") {
      if (st.type) return false;
    } else if (st.kind === "assign") {
      if (st.target.kind !== "ident") return false;
    } else {
      return false;
    }
  }
  return sawReturn;
}

export function scanRawUsage(m: Module, candNames: Set<string>): { escapes: Set<string>; sitesByF: Map<string, RawSite[]> } {
  const escapes = new Set<string>();
  const sitesByF = new Map<string, RawSite[]>();
  const escape = (n: string): void => {
    if (n !== "super") escapes.add(n);
  };

  const expr = (e: Expr, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (e.kind) {
      case "lit":
        if (e.lit === "string") escape(String(e.value));
        return;
      case "ident":
        escape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "ident") {
          const nm = e.callee.name;
          if (allowSite && owner && candNames.has(nm)) {
            if (!sitesByF.has(nm)) sitesByF.set(nm, []);
            sitesByF.get(nm)!.push({ args: e.args, owner });
          } else {
            escape(nm);
          }
        } else {
          expr(e.callee, owner, false);
        }
        for (const a of e.args) expr(a, owner, allowSite);
        return;
      }
      case "attribute":
        escape(e.name);
        expr(e.obj, owner, allowSite);
        return;
      case "index":
        expr(e.obj, owner, allowSite);
        expr(e.index, owner, allowSite);
        return;
      case "binary":
        expr(e.left, owner, allowSite);
        expr(e.right, owner, allowSite);
        return;      case "ternary":
        expr(e.cond, owner, allowSite);
        expr(e.thenE, owner, allowSite);
        expr(e.elseE, owner, allowSite);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand, owner, allowSite);
        return;
      case "array":
        for (const it of e.items) expr(it, owner, allowSite);
        return;
      case "dict":
        for (const en of e.entries) {
          expr(en.key, owner, allowSite);
          expr(en.value, owner, allowSite);
        }
        return;
      case "lambda":
        for (const s of e.body) stmt(s, owner, false);
        return;
    }
  };
  const stmt = (s: Stmt, owner: FuncDecl | null, allowSite: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) expr(s.init, owner, allowSite);
        return;
      case "assign":
        expr(s.target, owner, allowSite);
        expr(s.value, owner, allowSite);
        return;
      case "expr":
        expr(s.expr, owner, allowSite);
        return;
      case "return":
        if (s.value) expr(s.value, owner, allowSite);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) expr(b.cond, owner, allowSite);
          for (const x of b.body) stmt(x, owner, allowSite);
        }
        return;
      case "for":
        expr(s.iter, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "while":
        expr(s.cond, owner, allowSite);
        for (const x of s.body) stmt(x, owner, allowSite);
        return;
      case "match":
        expr(s.subject, owner, allowSite);
        for (const a of s.arms) {
          if (a.guard) expr(a.guard, owner, allowSite);
          for (const x of a.body) stmt(x, owner, false);
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };

  for (const f of m.funcs) {
    for (const p of f.params) if (p.default) expr(p.default, f, false);
    for (const s of f.body) stmt(s, f, true);
  }
  for (const v of m.vars) if (v.init) expr(v.init, null, false);
  const walkClass = (c: ClassDecl): void => {
    for (const v of c.vars) if (v.init) expr(v.init, null, false);
    for (const f of c.funcs) {
      for (const s of f.body) stmt(s, f, false);
    }
    c.innerClasses.forEach(walkClass);
  };
  m.innerClasses.forEach(walkClass);

  return { escapes, sitesByF };
}

export function sameAbis(a: Map<string, RawAbi>, b: Map<string, RawAbi>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) {
    const w = b.get(k);
    if (!w || w.ret !== v.ret) return false;
  }
  return true;
}

export function computeRawAbis(
  m: Module,
  abiScope: { hasBase: boolean; inherited: Set<string>; external: Set<string> },
): Map<string, RawAbi> {
  const empty = new Map<string, RawAbi>();
  if (m.innerClasses.length > 0 || abiScope.hasBase) return empty;

  const byName = new Map<string, FuncDecl>();
  for (const f of m.funcs) byName.set(f.name, f);

  const candNames = new Set<string>();
  for (const f of m.funcs) {
    if (!abiFormOk(f)) continue;
    if (f.name.startsWith("_")) continue;
    if (ctx.ENUM_NAMES.has(f.name) || ctx.MODULE_VARS.has(f.name) || ctx.MODULE_CLASSES.has(f.name)) continue;
    if (abiScope.inherited.has(f.name) || abiScope.external.has(f.name)) continue;
    candNames.add(f.name);
  }
  if (candNames.size === 0) return empty;

  const { escapes, sitesByF } = scanRawUsage(m, candNames);
  for (const n of escapes) candNames.delete(n);

  for (const n of [...candNames]) {
    if ((sitesByF.get(n) ?? []).length === 0) candNames.delete(n);
  }
  if (candNames.size === 0) return empty;

  const saved = ctx.RAW_ABIS;
  const dummyU: (fn: FuncDecl) => Map<string, "int" | "float" | "str"> = () => new Map<string, "int" | "float" | "str">();
  const seed = new Map<string, RawAbi>();
  for (const name of candNames) {
    const f = byName.get(name)!;
    for (const K of ABI_KINDS) {
      if (sigValid(f, K, [], dummyU)) {
        seed.set(name, { params: f.params.map(() => K), ret: K });
        break;
      }
    }
  }
  let cur = seed;
  let stable = false;
  const cap = (candNames.size + 2) * 4;
  for (let it = 0; it < cap; it++) {
    ctx.RAW_ABIS = cur;
    const uCache = new Map<string, Map<string, "int" | "float" | "str">>();
    const uOf = (fn: FuncDecl): Map<string, "int" | "float" | "str"> => {
      let v = uCache.get(fn.name);
      if (!v) {
        v = computeUnboxed(fn);
        uCache.set(fn.name, v);
      }
      return v;
    };
    const next = new Map<string, RawAbi>();
    for (const name of candNames) {
      const f = byName.get(name)!;
      const sites = sitesByF.get(name) ?? [];
      for (const K of ABI_KINDS) {
        if (sigValid(f, K, sites, uOf)) {
          next.set(name, { params: f.params.map(() => K), ret: K });
          break;
        }
      }
    }
    if (sameAbis(cur, next)) {
      cur = next;
      stable = true;
      break;
    }
    cur = next;
  }
  ctx.RAW_ABIS = saved;
  return stable ? cur : empty;
}

/** 数组候选的元素类型：空初值在这里不给类型，改由 analyzeFuncLayout 的不动点按写入证据定。只在 candidates 扫完之后调用。 */
export function arrayElemKind(c: ArrayCand): ElemKind | null {
  if (c.init.items.length === 0) return null;
  return elemKindFromInit(c.init, true);
}

export function scalarLitKind(e: Expr): Kind | null {
  if (e.kind !== "lit") return null;
  if (e.lit === "float" && typeof e.value === "number") return "float";
  if (e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) return "int";
  if (e.lit === "string") return "str";
  return null;
}

/** 数组/字典初值的元素类型；nested=true 时额外认「数组的数组」并返回 `"int[]"` / `"float[]"` / `"str[]"`；空数组给 `"int"`。 */
export function elemKindFromInit(init: Extract<Expr, { kind: "array" }>, nested = false): ElemKind | null {
  if (init.items.length === 0) return "int";
  let scalar: Kind | null = null;
  let scalarOk = true;
  for (const it of init.items) {
    const k = scalarLitKind(it);
    if (!k) { scalarOk = false; break; }
    if (scalar && scalar !== k) { scalarOk = false; break; }
    scalar = k;
  }
  if (scalarOk && scalar) return scalar;
  if (nested) {
    let leaf: Kind | null = null;
    for (const row of init.items) {
      if (row.kind !== "array") return null;
      for (const it of row.items) {
        const k = scalarLitKind(it);
        if (!k) return null;
        if (leaf && leaf !== k) return null;
        leaf = k;
      }
    }
    if (leaf) return leaf === "float" ? "float[]" : leaf === "str" ? "str[]" : "int[]";
  }
  return null;
}

export function keyKindOk(k: Kind | "bool" | null): boolean {
  return k === "int" || k === "str";
}

/** 字典的键值位可以盖章的那些名字：八档元素型照原样，脚本类名按 `Object` 收（v11 量的是这一形；宿主类名作键值没量，仍不盖章）。 */
export function slotElemKindName(name: string): string | null {
  if (isElemKind(name)) return name;
  return ctx.SCRIPT_BASE.has(name) ? "Object" : null;
}

export function containerSlot(code: string, value: Expr, text: string | null, say: "assignContainer" | "returnContainer"): string {
  if (text === null || value.kind === "array" || value.kind === "dict") return code;
  return `rt.${say}(${code}, ${JSON.stringify(text)})`;
}

export function declaredCast(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.toInt";
  if (base === "float") return "rt.toFloat";
  if (base === "bool") return "rt.toBool";
  if (base === "String") return "rt.strOf";
  if (base === "Vector2") return "rt.toVec2";
  if (base === "Vector3") return "rt.toVec3";
  if (base === "Vector3i") return "rt.toVec3i";
  if (base === "Vector4") return "rt.toVec4";
  if (base === "Vector4i") return "rt.toVec4i";
  if (base === "Vector2i") return "rt.toVec2i";
  if (base === "Color") return "rt.toColor";
  if (base === "StringName") return "rt.toStringNameSlot";
  return null;
}
