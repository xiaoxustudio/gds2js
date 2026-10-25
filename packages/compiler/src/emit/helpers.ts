import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { BUILTIN, D6_VALUE_TYPES, HOST_PRINT_NAMES, NO_ARRAYS, NO_DICTS, type R } from "./surface";
import { fwdParams } from "./layout";
import { type RawSite, arrayElemKind, computeUnboxed, elemKindFromInit, isGridElem, keyKindOk, kindOfExpr, leafOf, slotElemKindName } from "./abi";
import { emitExpr } from "./expr-boxed";
import { emitCall } from "./call";

export function rangeArgList(a: Array<string | undefined>): string {
  const parts: string[] = [];
  for (const x of a) {
    if (x !== undefined) parts.push(x);
  }
  return `[${parts.join(", ")}]`;
}

/** 认 `range(...)` 调用（1~3 参）。emitCall 里 BUILTIN 先于本类方法命中，故 range 必是内置。 */
export function isRangeCall(e: Expr): e is Extract<Expr, { kind: "call" }> {
  return (
    e.kind === "call" &&
    e.callee.kind === "ident" &&
    e.callee.name === "range" &&
    e.args.length >= 1 &&
    e.args.length <= 3
  );
}

export function mark(genLine: number, loc: Loc | undefined): void {
  if (!ctx.MAP_ACTIVE || !loc) return;
  ctx.LINE_MAPPINGS.push({ genLine, srcLine: loc.line - 1, srcCol: loc.col - 1 });
}

export function standaloneInlineHeader(body: string): string {
  const indented = body
    .split("\n")
    .map((l) => (l.length ? `  ${l}` : l))
    .join("\n");
  return [
    `const { rt, ${HOST_PRINT_NAMES.join(", ")}, SceneTree } = (() => {`,
    "  const module = { exports: {} };",
    "  const exports = module.exports;",
    indented,
    "  return exports;",
    "})();",
  ].join("\n");
}

export function basenameOfGd(path: string | undefined): string | null {
  if (path === undefined || path === "") return null;
  return path.split(/[\/\\]/).pop() ?? null;
}

export function makeClosure(className: string, init: FuncDecl | undefined, protoShape: boolean): string {
  if (protoShape) return `(a) => new ${className}(...a)`;
  if (init === undefined || init.params.length === 0) return `() => new ${className}()`;
  const fwd = fwdParams(init.params, "a");
  return `(a) => new ${className}(${fwd})`;
}

export function frameEnterLines(name: string): string[] {
  return [
    `  const __gd_frame = rt.frameEnter(${JSON.stringify(ctx.DEBUG_FILE)}, ${JSON.stringify(name)});`,
    "  try {",
  ];
}

/** 出栈那一块：引擎的运行期错误作废的是当前这一支函数 —— 接住、按引擎那一块打印一次、按返回型给默认值返回（S406）。
 *  `catchRet` 给 null 时不发接住点：裸轨那支的签名装不下作废值（S695），它只剩「int64 越界」这一条未实现的响亮拒，
 *  让它原样上抛到最近的装箱边界，比就地咽下再给一个装不进 `number` 的盒子诚实。 */
export function frameExitLines(catchRet: string | null): string[] {
  if (catchRet === null) {
    return ["  } finally {", "    rt.frameExit(__gd_frame);", "  }"];
  }
  return [
    "  } catch (__gd_err) {",
    "    rt.gdFunctionError(__gd_err);",
    `    ${catchRet}`,
    "  } finally {",
    "    rt.frameExit(__gd_frame);",
    "  }",
  ];
}

export function globalConstLines(m: Module, reservedExtra: Set<string>): string[] {
  const reserved = new Set<string>(reservedExtra);
  const addEnum = (en: Module["enums"][number]): void => {
    if (en.name !== null && en.name !== undefined) reserved.add(en.name);
    for (const mm of en.members) reserved.add(mm.name);
  };
  for (const en of m.enums) addEnum(en);
  if (m.className !== undefined && m.className !== null) reserved.add(m.className);
  const addClass = (c: ClassDecl): void => {
    reserved.add(c.name);
    for (const v of c.vars) reserved.add(v.name);
    for (const inner of c.innerClasses) addClass(inner);
  };
  for (const c of m.innerClasses) addClass(c);

  const used = new Set<string>();
  const expr = (e: Expr | null): void => {
    if (e === null || e === undefined) return;
    switch (e.kind) {
      case "ident":
        if (isGlobalConst(e.name)) used.add(e.name);
        return;
      case "binary":
        expr(e.left);
        expr(e.right);
        return;      case "ternary":
        expr(e.cond);
        expr(e.thenE);
        expr(e.elseE);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        expr(e.operand);
        return;
      case "index":
        expr(e.obj);
        expr(e.index);
        return;
      case "attribute":
        expr(e.obj);
        return;
      case "call":
        expr(e.callee);
        for (const a of e.args) expr(a);
        return;
      case "lambda":
        for (const s of e.body) stmt(s);
        return;
      case "array":
        for (const it of e.items) expr(it);
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
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "expr":
        expr(s.expr);
        return;
      case "var":
        expr(s.init);
        return;
      case "assign":
        expr(s.target);
        expr(s.value);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond !== null) expr(b.cond);
          for (const x of b.body) stmt(x);
        }
        return;
      case "for":
        expr(s.iter);
        for (const x of s.body) stmt(x);
        return;
      case "while":
        expr(s.cond);
        for (const x of s.body) stmt(x);
        return;
      case "match":
        expr(s.subject);
        for (const arm of s.arms) {
          if (arm.guard !== null) expr(arm.guard);
          for (const x of arm.body) stmt(x);
        }
        return;
      case "return":
        if (s.value !== null) expr(s.value);
        return;
      default:
        return;
    }
  };
  const func = (f: FuncDecl): void => {
    for (const p of f.params) expr(p.default ?? null);
    for (const s of f.body) stmt(s);
  };
  for (const f of m.funcs) func(f);
  for (const v of m.vars) expr(v.init);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) func(f);
    for (const v of c.vars) expr(v.init);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  return [...used]
    .filter((n) => !reserved.has(n))
    .sort()
    .map((n) => {
      const c = GLOBAL_CONSTANTS[n]!;
      return `const ${n} = ${c.kind === "int" ? "rt.V.int" : "rt.V.float"}(${c.value});`;
    });
}

export function hasValueReturn(stmts: Stmt[]): boolean {
  for (const s of stmts) {
    if (s.kind === "return" && s.value) return true;
    if (s.kind === "if") {
      for (const br of s.branches) if (hasValueReturn(br.body)) return true;
    }
    if (s.kind === "for" || s.kind === "while") {
      if (hasValueReturn(s.body)) return true;
    }
    if (s.kind === "match") {
      for (const arm of s.arms) if (hasValueReturn(arm.body)) return true;
    }
  }
  return false;
}

export interface WPath {
  read: string;
  write: (nv: string) => string;
  pre: string[];
}

export function writeBack(p: WPath, call: string): string[] {
  const store = p.write("_nv");
  if (store === "") return [call + ";"];
  return ["{", ...p.pre, "  const _nv = " + call + ";", "  if (_nv !== null) " + store, "}"];
}

/** 一条读写路径：根是临时值（`f().x = 1`）时只求值、不写回；根是变量时一律给出 read+write。 */
export function writePathFor(t: Expr, seq: { n: number }): WPath {
  const p = lvalueOf(t, seq);
  if (p !== null) return p;
  return { read: emitExpr(t), write: () => "", pre: [] };
}

/** 能读也能写回的存储路径：变量（局部、或发成类字段的模块变量）/ 容器下标；下标实参先提到临时变量，读写不要求两次值。 */
export function lvalueOf(t: Expr, seq: { n: number }): WPath | null {
  if (t.kind === "ident") {
    const read = emitExpr(t);
    if (ctx.INNER_CLASSES.has(t.name) || t.name === ctx.CURRENT_CLASS) return { read, write: () => "", pre: [] };
    return { read, write: (nv) => `${read} = ${nv};`, pre: [] };
  }
  if (t.kind === "index") {
    const base = lvalueOf(t.obj, seq);
    if (base === null) return null;
    const key = `_w${seq.n}`;
    seq.n += 1;
    return {
      read: `rt.index(${base.read}, ${key})`,
      write: (nv) => `rt.setIndex(${base.read}, ${key}, ${nv});`,
      pre: [...base.pre, `const ${key} = ${emitExpr(t.index)};`],
    };
  }
  if (t.kind === "attribute") {
    const base = lvalueOf(t.obj, seq);
    if (base === null) return null;
    const nm = JSON.stringify(t.name);
    return {
      read: `rt.attribute(${base.read}, ${nm})`,
      write: (nv) => `rt.writeProp(${base.read}, ${nm}, ${nv});`,
      pre: base.pre,
    };
  }
  return null;
}

export function unwrapSelfMember(t: Expr): Expr | null {
  if (t.kind !== "attribute" || t.obj.kind !== "ident" || t.obj.name !== "self") return null;
  if (!ctx.CURRENT_MEMBERS.has(t.name) && !ctx.MODULE_VARS.has(t.name)) return null;
  return { kind: "ident", name: t.name, loc: t.loc };
}

export type Rep = "var" | "int" | "float" | "str" | "bool";

export function fastSuffix(k: ElemKind): "Num" | "Str" {
  return leafOf(k) === "str" ? "Str" : "Num";
}

export function boxR(r: R): string {
  if (r.rep === "int") return `rt.V.int(${r.code})`;
  if (r.rep === "float") return `rt.V.float(${r.code})`;
  if (r.rep === "str") return `rt.V.str(${r.code})`;
  if (r.rep === "bool") return `rt.V.bool(${r.code})`;
  return r.code;
}

export function intDivMayAbort(e: Expr, ik: (n: string) => Kind | null): boolean {
  switch (e.kind) {
    case "binary":
      if (
        (e.op === "/" || e.op === "%") &&
        kindOfExpr(e.left, ik) === "int" &&
        !(e.right.kind === "lit" && e.right.lit === "int" && Number(e.right.value) !== 0)
      )
        return true;
      return intDivMayAbort(e.left, ik) || intDivMayAbort(e.right, ik);
    case "unary":
      return intDivMayAbort(e.operand, ik);
    case "index":
      return intDivMayAbort(e.obj, ik) || intDivMayAbort(e.index, ik);
    case "call":
      return intDivMayAbort(e.callee, ik) || e.args.some((a) => intDivMayAbort(a, ik));
    default:
      return false;
  }
}

export function sigValid(
  f: FuncDecl,
  K: Kind,
  sites: RawSite[],
  uOf: (fn: FuncDecl) => Map<string, "int" | "float" | "str">,
): boolean {
  const env = new Map<string, Kind>();
  for (const p of f.params) env.set(p.name, K);
  const ik = (n: string): Kind | null => env.get(n) ?? null;
  let sawReturn = false;
  for (const st of f.body) {
    if (st.kind === "var") {
      if (!st.init || kindOfExpr(st.init, ik) !== K) return false;
      if (intDivMayAbort(st.init, ik)) return false;
      env.set(st.name, K);
    } else if (st.kind === "assign") {
      if (st.target.kind !== "ident" || !env.has(st.target.name)) return false;
      if (kindOfExpr(st.value, ik) !== K) return false;
      if (intDivMayAbort(st.value, ik)) return false;
    } else if (st.kind === "return") {
      if (!st.value || kindOfExpr(st.value, ik) !== K) return false;
      if (intDivMayAbort(st.value, ik)) return false;
      sawReturn = true;
    } else {
      return false;
    }
  }
  if (!sawReturn) return false;
  for (const s of sites) {
    if (s.args.length !== f.params.length) return false;
    const u = uOf(s.owner);
    for (const a of s.args) {
      if (kindOfExpr(a, (n) => u.get(n) ?? null, NO_ARRAYS, NO_DICTS) !== K) return false;
    }
  }
  return true;
}

export interface ArrayCand {
  init: Extract<Expr, { kind: "array" }>;
  writeElems: Expr[];
  readIdxs: Expr[];
  writeIdxs: Expr[];
  writeVals: Expr[];
  escaped: boolean;
}

export function scanArrayCandidates(f: FuncDecl): Map<string, ArrayCand> {
  const cands = new Map<string, ArrayCand>();

  const pre = (s: Stmt): void => {
    if (s.kind === "var") {
      if (!s.type && s.init && s.init.kind === "array") {
        cands.set(s.name, {
          init: s.init,
          writeElems: [],
          readIdxs: [],
          writeIdxs: [],
          writeVals: [],
          escaped: false,
        });
      }
    } else if (s.kind === "if") for (const b of s.branches) b.body.forEach(pre);
    else if (s.kind === "for") {
      s.body.forEach(pre);
    } else if (s.kind === "while") s.body.forEach(pre);
    else if (s.kind === "match") for (const a of s.arms) a.body.forEach(pre);
  };
  f.body.forEach(pre);

  const markEscape = (n: string): void => {
    const c = cands.get(n);
    if (c) c.escaped = true;
  };
  const isCandObj = (e: Expr): string | null => e.kind === "ident" && cands.has(e.name) ? e.name : null;
  const isGridCand = (c: ArrayCand): boolean => {
    const k = elemKindFromInit(c.init, true);
    return !!k && isGridElem(k);
  };
  const matchIndexWrite = (t: Expr): { name: string; idxs: Expr[] } | null => {
    if (t.kind !== "index") return null;
    if (t.obj.kind === "ident") {
      const c = cands.get(t.obj.name);
      return c && !isGridCand(c) ? { name: t.obj.name, idxs: [t.index] } : null;
    }
    if (t.obj.kind === "index" && t.obj.obj.kind === "ident") {
      const c = cands.get(t.obj.obj.name);
      return c && isGridCand(c) ? { name: t.obj.obj.name, idxs: [t.obj.index, t.index] } : null;
    }
    return null;
  };

  const visitExpr = (e: Expr, inL: boolean, discarded = false): void => {
    switch (e.kind) {
      case "ident":
        if (cands.has(e.name)) markEscape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "attribute") {
          const objName = isCandObj(e.callee.obj);
          const N = e.callee.name;
          if (objName) {
            const c = cands.get(objName)!;
            if (inL) {
              c.escaped = true;
            } else if ((N === "append" || N === "push_back") && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if ((N === "size" || N === "length") && e.args.length === 0) {
            } else if (N === "insert" && e.args.length === 2) {
              c.writeIdxs.push(e.args[0]!);
              c.writeElems.push(e.args[1]!);
            } else if (N === "remove_at" && e.args.length === 1) {
              c.writeIdxs.push(e.args[0]!);
            } else if (N === "push_front" && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if (N === "fill" && e.args.length === 1) {
              c.writeElems.push(e.args[0]!);
            } else if (N === "clear" && e.args.length === 0) {
            } else if (N === "reverse" && e.args.length === 0) {
            } else if (discarded && N === "pop_back" && e.args.length === 0) {
            } else if (discarded && N === "pop_front" && e.args.length === 0) {
            } else if (discarded && N === "pop_at" && e.args.length === 1) {
              c.readIdxs.push(e.args[0]!);
            } else {
              c.escaped = true;
            }
            e.args.forEach((a) => visitExpr(a, inL));
            return;
          }
          visitExpr(e.callee, inL);
          e.args.forEach((a) => visitExpr(a, inL));
          return;
        }
        visitExpr(e.callee, inL);
        e.args.forEach((a) => visitExpr(a, inL));
        return;
      }
      case "index": {
        const mid = e.obj;
        if (mid.kind === "index" && mid.obj.kind === "ident" && cands.has(mid.obj.name)) {
          const c = cands.get(mid.obj.name)!;
          if (inL || !isGridCand(c)) c.escaped = true;
          else {
            c.readIdxs.push(mid.index);
            c.readIdxs.push(e.index);
          }
          visitExpr(mid.index, inL);
          visitExpr(e.index, inL);
          return;
        }
        const objName = isCandObj(e.obj);
        if (objName) {
          const c = cands.get(objName)!;
          if (inL || isGridCand(c)) c.escaped = true;
          else c.readIdxs.push(e.index);
          visitExpr(e.index, inL);
          return;
        }
        visitExpr(e.obj, inL);
        visitExpr(e.index, inL);
        return;
      }
      case "attribute":
        visitExpr(e.obj, inL);
        return;
      case "binary":
        visitExpr(e.left, inL);
        visitExpr(e.right, inL);
        return;      case "ternary":
        for (const br of [e.thenE, e.elseE]) {
          const cn = isCandObj(br);
          if (cn !== null) markEscape(cn);
          visitExpr(br, inL);
        }
        visitExpr(e.cond, inL);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        visitExpr(e.operand, inL);
        return;
      case "array":
        e.items.forEach((it) => visitExpr(it, inL));
        return;
      case "dict":
        for (const en of e.entries) {
          visitExpr(en.key, inL);
          visitExpr(en.value, inL);
        }
        return;
      case "lambda":
        e.body.forEach((s) => visitStmt(s, true));
        return;
    }
  };
  const visitStmt = (s: Stmt, inL: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) visitExpr(s.init, inL);
        return;
      case "assign": {
        const w = matchIndexWrite(s.target);
        if (w && !inL) {
          const c = cands.get(w.name)!;
          c.writeIdxs.push(...w.idxs);
          c.writeVals.push(s.value);
          w.idxs.forEach((ix) => visitExpr(ix, inL));
          visitExpr(s.value, inL);
          return;
        }
        const wt =
          s.target.kind === "index"
            ? isCandObj(s.target.obj)
            : s.target.kind === "ident" && cands.has(s.target.name)
              ? s.target.name
              : null;
        if (wt) markEscape(wt);
        if (w) markEscape(w.name);
        visitExpr(s.target, inL);
        visitExpr(s.value, inL);
        return;
      }
      case "expr":
        visitExpr(s.expr, inL, true);
        return;
      case "return":
        if (s.value) visitExpr(s.value, inL);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) visitExpr(b.cond, inL);
          b.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "for":
        visitExpr(s.iter, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "while":
        visitExpr(s.cond, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "match":
        visitExpr(s.subject, inL);
        for (const a of s.arms) {
          if (a.guard) visitExpr(a.guard, inL);
          a.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };
  f.body.forEach((s) => visitStmt(s, false));
  return cands;
}

export function mapsEqual<T>(a: Map<string, T>, b: Map<string, T>): boolean {
  if (a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}

/** 数组元素 Kind 与标量解箱的联合不动点：从乐观种子出发单调剔除不符或逃逸的候选，直到数组集与解箱集同时稳定。 */
export function analyzeFuncLayout(f: FuncDecl): {
  unboxed: Map<string, "int" | "float" | "str">;
  arrays: Map<string, ElemKind>;
  dicts: Map<string, "int" | "float">;
} {
  const aC = scanArrayCandidates(f);
  const dC = scanDictCandidates(f);
  const arrays = new Map<string, ElemKind>();
  for (const [name, c] of aC) {
    if (c.escaped) continue;
    const k = arrayElemKind(c);
    if (k) arrays.set(name, k);
  }
  const dicts = new Map<string, "int" | "float">();
  for (const [name, c] of dC) {
    if (c.escaped) continue;
    const k = elemKindFromInit({ kind: "array", items: c.init.entries.map((en) => en.value), loc: c.init.loc });
    if (k === "int" || k === "float") dicts.set(name, k);
  }
  let unboxed = computeUnboxed(f, arrays, dicts);
  const seeded = new Set<string>();
  const cap = aC.size * 2 + dC.size + 8;
  for (let it = 0; it < cap; it++) {
    let changed = false;
    for (const [name, c] of aC) {
      if (c.escaped || arrays.has(name) || seeded.has(name) || c.init.items.length !== 0) continue;
      const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
      const kinds = [...c.writeElems, ...c.writeVals].map((e) => kindOfExpr(e, identKind, arrays, dicts));
      const first = kinds[0];
      if (first === undefined || first === null || first === "bool") continue;
      if (!kinds.every((k) => k === first)) continue;
      arrays.set(name, first);
      seeded.add(name);
      changed = true;
    }
    for (const [name, K] of [...arrays]) {
      const c = aC.get(name);
      if (!c || c.escaped || !verifyArray(c, K, unboxed, arrays, dicts)) {
        arrays.delete(name);
        changed = true;
      }
    }
    for (const [name, K] of [...dicts]) {
      const c = dC.get(name);
      if (!c || c.escaped || !verifyDict(c, K, unboxed, arrays, dicts)) {
        dicts.delete(name);
        changed = true;
      }
    }
    const un2 = computeUnboxed(f, arrays, dicts);
    const unChanged = !mapsEqual(un2, unboxed);
    unboxed = un2;
    if (!changed && !unChanged) break;
  }
  return { unboxed, arrays, dicts };
}

export function verifyArray(
  c: ArrayCand,
  K: ElemKind,
  unboxed: Map<string, "int" | "float" | "str">,
  arrays: Map<string, ElemKind>,
  dicts: Map<string, "int" | "float">,
): boolean {
  const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
  if (c.init.items.length !== 0 && elemKindFromInit(c.init, true) !== K) return false;
  if (!isGridElem(K)) {
    for (const it of c.init.items) {
      if (it.kind === "lit") continue;
      if (kindOfExpr(it, identKind, arrays, dicts) !== K) return false;
    }
  }
  for (const w of c.writeElems) if (kindOfExpr(w, identKind, arrays, dicts) !== K) return false;
  for (const r of c.readIdxs) if (kindOfExpr(r, identKind, arrays, dicts) !== "int") return false;
  const leaf: Kind = isGridElem(K) ? leafOf(K) : K;
  for (const v of c.writeVals) if (kindOfExpr(v, identKind, arrays, dicts) !== leaf) return false;
  for (const ix of c.writeIdxs) if (kindOfExpr(ix, identKind, arrays, dicts) !== "int") return false;
  return true;
}

export interface DictCand {
  init: Extract<Expr, { kind: "dict" }>;
  writeKeys: Expr[];
  writeVals: Expr[];
  readKeys: Expr[];
  escaped: boolean;
}

export function scanDictCandidates(f: FuncDecl): Map<string, DictCand> {
  const cands = new Map<string, DictCand>();
  const pre = (s: Stmt): void => {
    if (s.kind === "var") {
      if (!s.type && s.init && s.init.kind === "dict") {
        cands.set(s.name, { init: s.init, writeKeys: [], writeVals: [], readKeys: [], escaped: false });
      }
    } else if (s.kind === "if") for (const b of s.branches) b.body.forEach(pre);
    else if (s.kind === "for") s.body.forEach(pre);
    else if (s.kind === "while") s.body.forEach(pre);
    else if (s.kind === "match") for (const a of s.arms) a.body.forEach(pre);
  };
  f.body.forEach(pre);

  const markEscape = (n: string): void => {
    const c = cands.get(n);
    if (c) c.escaped = true;
  };
  const candObj = (e: Expr): string | null => (e.kind === "ident" && cands.has(e.name) ? e.name : null);

  const visitExpr = (e: Expr, inL: boolean): void => {
    switch (e.kind) {
      case "ident":
        if (cands.has(e.name)) markEscape(e.name);
        return;
      case "call": {
        if (e.callee.kind === "attribute") {
          const obj = candObj(e.callee.obj);
          if (obj) {
            const c = cands.get(obj)!;
            const N = e.callee.name;
            if (inL) c.escaped = true;
            else if ((N === "size" || N === "length") && e.args.length === 0) {
            } else if (N === "get" && e.args.length === 2) {
              c.readKeys.push(e.args[0]!);
              c.writeVals.push(e.args[1]!);
            } else c.escaped = true;
            e.args.forEach((a) => visitExpr(a, inL));
            return;
          }
          visitExpr(e.callee, inL);
          e.args.forEach((a) => visitExpr(a, inL));
          return;
        }
        visitExpr(e.callee, inL);
        e.args.forEach((a) => visitExpr(a, inL));
        return;
      }
      case "index": {
        const obj = candObj(e.obj);
        if (obj) {
          const c = cands.get(obj)!;
          if (inL) c.escaped = true;
          else c.readKeys.push(e.index);
          visitExpr(e.index, inL);
          return;
        }
        visitExpr(e.obj, inL);
        visitExpr(e.index, inL);
        return;
      }
      case "attribute":
        visitExpr(e.obj, inL);
        return;
      case "binary":
        visitExpr(e.left, inL);
        visitExpr(e.right, inL);
        return;
      case "ternary":
        for (const br of [e.thenE, e.elseE]) {
          const cn = candObj(br);
          if (cn !== null) markEscape(cn);
          visitExpr(br, inL);
        }
        visitExpr(e.cond, inL);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        visitExpr(e.operand, inL);
        return;
      case "array":
        e.items.forEach((it) => visitExpr(it, inL));
        return;
      case "dict":
        for (const en of e.entries) {
          visitExpr(en.key, inL);
          visitExpr(en.value, inL);
        }
        return;
      case "lambda":
        e.body.forEach((s) => visitStmt(s, true));
        return;
    }
  };
  const visitStmt = (s: Stmt, inL: boolean): void => {
    switch (s.kind) {
      case "var":
        if (s.init) visitExpr(s.init, inL);
        return;
      case "assign": {
        if (s.target.kind === "index") {
          const obj = candObj(s.target.obj);
          if (obj) {
            const c = cands.get(obj)!;
            if (inL) c.escaped = true;
            else {
              c.writeKeys.push(s.target.index);
              c.writeVals.push(s.value);
            }
            visitExpr(s.target, inL);
            visitExpr(s.value, inL);
            return;
          }
        }
        if (s.target.kind === "ident" && cands.has(s.target.name)) markEscape(s.target.name);
        visitExpr(s.target, inL);
        visitExpr(s.value, inL);
        return;
      }
      case "expr":
        visitExpr(s.expr, inL);
        return;
      case "return":
        if (s.value) visitExpr(s.value, inL);
        return;
      case "if":
        for (const b of s.branches) {
          if (b.cond) visitExpr(b.cond, inL);
          b.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "for":
        visitExpr(s.iter, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "while":
        visitExpr(s.cond, inL);
        s.body.forEach((x) => visitStmt(x, inL));
        return;
      case "match":
        visitExpr(s.subject, inL);
        for (const a of s.arms) {
          if (a.guard) visitExpr(a.guard, inL);
          a.body.forEach((x) => visitStmt(x, inL));
        }
        return;
      case "break":
      case "continue":
      case "pass":
        return;
    }
  };
  f.body.forEach((s) => visitStmt(s, false));
  return cands;
}

export function verifyDict(
  c: DictCand,
  K: ElemKind,
  unboxed: Map<string, "int" | "float" | "str">,
  arrays: Map<string, ElemKind>,
  dicts: Map<string, "int" | "float">,
): boolean {
  const identKind = (n: string): Kind | null => unboxed.get(n) ?? null;
  for (const en of c.init.entries) {
    if (!keyKindOk(kindOfExpr(en.key, identKind, arrays, dicts))) return false;
    if (kindOfExpr(en.value, identKind, arrays, dicts) !== K) return false;
  }
  for (const k of c.writeKeys) if (!keyKindOk(kindOfExpr(k, identKind, arrays, dicts))) return false;
  for (const v of c.writeVals) if (kindOfExpr(v, identKind, arrays, dicts) !== K) return false;
  for (const k of c.readKeys) if (!keyKindOk(kindOfExpr(k, identKind, arrays, dicts))) return false;
  return true;
}

export function stampDecl(t: TypeRef | null, init: Expr | null | undefined, emit: (e: Expr) => string): string {
  const raw = init ? emit(init) : typeDefault(t);
  if (t === null || t.kind !== "named") return raw;
  const m = /^(Array|Dictionary)\[(.+)\]$/.exec(t.name);
  if (m === null) return raw;
  const inner = m[2] ?? "";
  if (inner.includes("[")) return raw;
  const fromLiteral = init === null || init === undefined || init.kind === "array" || init.kind === "dict";
  if (m[1] === "Array") {
    const kind = inner.trim();
    if (NATIVE_CLASS_SLOTS.has(kind)) return `rt.stampClassArray(${raw}, ${JSON.stringify(kind)}, ${String(fromLiteral)})`;
    const scriptBase = ctx.SCRIPT_BASE.get(kind);
    if (scriptBase !== undefined) return `rt.stampScriptArray(${raw}, ${JSON.stringify(kind)}, ${JSON.stringify(scriptBase)}, ${String(fromLiteral)})`;
    if (!isElemKind(kind)) return raw;
    return `rt.stampArray(${raw}, ${JSON.stringify(kind)}, ${String(fromLiteral)})`;
  }
  const parts = inner.split(",").map((p) => p.trim());
  const keyKind = slotElemKindName(parts[0] ?? "");
  const valKind = slotElemKindName(parts[1] ?? "");
  if (parts.length !== 2 || keyKind === null || valKind === null) return raw;
  return `rt.stampDict(${raw}, ${JSON.stringify(keyKind)}, ${JSON.stringify(valKind)}, ${String(fromLiteral)})`;
}

export function containerAnnText(ann: TypeRef | null): string | null {
  if (ann === null || ann.kind !== "named") return null;
  const m = /^(Array|Dictionary)\[(.+)\]$/.exec(ann.name);
  if (m === null) return null;
  const inner = m[2] ?? "";
  if (inner.includes("[")) return null;
  const parts = inner.split(",").map((x) => x.trim());
  if (m[1] === "Array") {
    const one = parts[0] ?? "";
    return parts.length === 1 && (isElemKind(one) || NATIVE_CLASS_SLOTS.has(one) || ctx.SCRIPT_BASE.has(one)) ? `Array[${one}]` : null;
  }
  return parts.length === 2 && isElemKind(parts[0] ?? "") && isElemKind(parts[1] ?? "")
    ? `Dictionary[${parts[0]}, ${parts[1]}]` : null;
}

export function packTypedArgs(fnName: string, argExprs: Expr[], emitted: string[], recv: string): string[] {
  const ps = ctx.PARAM_TYPES.get(fnName);
  if (ps === undefined) return emitted;
  return emitted.map((a, i) => {
    const p = ps[i];
    const e = argExprs[i];
    if (p === undefined || e === undefined) return a;
    const text = containerAnnText(p.type);
    if (text === null) return a;
    if (e.kind === "array" || e.kind === "dict") {
      const parts = text.replace(/^(Array|Dictionary)\[|\]$/g, "").split(",").map((x) => x.trim());
      const one = parts[0] ?? "";
      if (text.startsWith("Array[")) {
        const scriptBase = ctx.SCRIPT_BASE.get(one);
        if (scriptBase !== undefined) return `rt.stampScriptArray(${a}, ${JSON.stringify(one)}, ${JSON.stringify(scriptBase)}, true)`;
        return NATIVE_CLASS_SLOTS.has(one)
          ? `rt.stampClassArray(${a}, ${JSON.stringify(one)}, true)`
          : `rt.stampArray(${a}, ${JSON.stringify(one)}, true)`;
      }
      return `rt.stampDict(${a}, ${JSON.stringify(one)}, ${JSON.stringify(parts[1] ?? "")}, true)`;
    }
    return `rt.paramContainer(${a}, ${JSON.stringify(text)}, ${String(i + 1)}, ${JSON.stringify(fnName)}, ${recv})`;
  });
}

export function typeDefault(t: TypeRef | null): string {
  if (t === null) return "rt.V.nil()";
  if (t.kind === "array") return "rt.V.array(rt.GArray.of([]))";
  if (t.kind !== "named") return "rt.V.nil()";
  const base = t.name.replace(/\[.*\]$/, "");
  if (base === "int") return "rt.V.int(0)";
  if (base === "float") return "rt.V.float(0)";
  if (base === "bool") return "rt.V.bool(false)";
  if (base === "String") return `rt.V.str("")`;
  if (base === "StringName") return `rt.V.stringName("")`;
  if (base === "Array") return "rt.V.array(rt.GArray.of([]))";
  if (base === "Dictionary") return "rt.dictOf([])";
  if (base === "Vector2") return "rt.vector2(0, 0)";
  if (base === "Vector3") return "rt.vector3(0, 0, 0)";
  if (base === "Vector2i") return "rt.vector2i(0, 0)";
  if (base === "Vector3i") return "rt.vector3i(0, 0, 0)";
  if (base === "Vector4") return "rt.vector4(0, 0, 0, 0)";
  if (base === "Vector4i") return "rt.vector4i(0, 0, 0, 0)";
  if (base === "Color") return "rt.color(0, 0, 0, 1)";
  if (base === "PackedByteArray") return "rt.bytesCtor([])";
  if (base === "PackedInt32Array") return 'rt.packCtor("int32", [])';
  if (base === "PackedInt64Array") return 'rt.packCtor("int64", [])';
  if (base === "PackedFloat32Array") return 'rt.packCtor("float32", [])';
  if (base === "PackedFloat64Array") return 'rt.packCtor("float64", [])';
  if (base === "PackedStringArray") return 'rt.packCtor("string", [])';
  if (base === "PackedVector2Array") return 'rt.packCtor("vector2", [])';
  if (base === "PackedVector3Array") return 'rt.packCtor("vector3", [])';
  if (base === "PackedVector4Array") return 'rt.packCtor("vector4", [])';
  if (base === "PackedColorArray") return 'rt.packCtor("color", [])';
  if (D6_VALUE_TYPES.has(base)) return `rt.unsupportedValueDefault(${JSON.stringify(base)})`;
  return "rt.V.nil()";
}

export function typeName(t: TypeRef): string {
  if (t.kind === "named") return t.name;
  if (t.kind === "array") return "Array";
  return "Variant";
}

/** 裸调用的 callee 名在成员表里认不认得（内置与 print/load/preload 在前面各自就返回了）：本模块与当前类的方法、字段与信号、类级的值，加上继承链上的 —— 含宿主基类的 `quit()`，但只在链上真挂着宿主时。
 *  实测 callee 名既不按局部声明解（`var cb = getv` 之后 `cb()` → `Function "cb()" not found in base self.`），也不按类名解（`Inner()` → `Member "Inner" is not a function.`），所以这两类名字不在表里。
 *  一张都不认的才拒 —— 之前兜底直接发 `this.x(...)`，运行期炸成裸 JS `TypeError`，既没有 `[code]` 也不是 `UnsupportedError`。 */
export function callableInScope(name: string): boolean {
  return (
    ctx.MODULE_FUNCS.has(name) ||
    ctx.CLASS_FUNCS.has(name) ||
    ctx.STATIC_FUNCS.has(name) ||
    ctx.CURRENT_MEMBERS.has(name) ||
    ctx.MODULE_VARS.has(name) ||
    ctx.INHERITED_METHODS.has(name) ||
    ctx.CLASS_VALUE_OWNERS.has(name)
  );
}
