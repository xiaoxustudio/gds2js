import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { analyzeFuncLayout, frameEnterLines, frameExitLines, hasValueReturn, mark, stampDecl, typeDefault } from "./helpers";
import { collectLocalTypes } from "./layout";
import { collectBinds, declaredCast, seedParamBinds, slotTypeName } from "./abi";
import { emitInitAsConstructor, emitInitMethod } from "./init";
import { emitStmt } from "./stmt";
import { emitExpr } from "./expr-boxed";

export function emitFunc(f: FuncDecl, base = 0): string[] {
  const saved = ctx.LOCAL_TYPES;
  const savedBinds = ctx.FUNC_BINDS;
  const savedUntyped = ctx.UNTYPED_NAMES;
  const untyped: string[] = [];
  ctx.LOCAL_TYPES = collectLocalTypes(f.body, new Map(ctx.VAR_TYPES), untyped);
  ctx.FUNC_BINDS = collectBinds(f.body, seedParamBinds(f.params));
  for (const p of f.params) if (p.type === null || (p.type.kind === "named" && p.type.name === "Variant")) untyped.push(p.name);
  ctx.UNTYPED_NAMES = new Set(untyped);
  try {
    return emitFuncInner(f, base);
  } finally {
    ctx.LOCAL_TYPES = saved;
    ctx.FUNC_BINDS = savedBinds;
    ctx.UNTYPED_NAMES = savedUntyped;
  }
}

export function emitParamSlots(f: FuncDecl): string[] {
  const out: string[] = [];
  let n = 0;
  for (const p of f.params) {
    n++;
    const slot = slotTypeName(p.type);
    if (slot === null) continue;
    out.push(`${p.name} = rt.paramSlot(${p.name}, ${JSON.stringify(slot)}, ${n}, ${JSON.stringify(f.name)}, this);`);
  }
  return out;
}

export function emitParamList(params: Param[], abiParams?: Kind[]): string {
  return params
    .map((p) => {
      if (p.default === null && abiParams !== undefined) {
        const k = abiParams[params.indexOf(p)];
        if (k !== undefined) return `${p.name}: ${k === "str" ? "string" : "number"}`;
      }
      if (p.default === null) return `${p.name}: rt.Variant`;
      const raw = stampDecl(p.type, p.default, emitExpr);
      const cast = declaredCast(p.type);
      return `${p.name}: rt.Variant = ${cast === null ? raw : `${cast}(${raw})`}`;
    })
    .join(", ");
}

export function frameStmtLines(loc: { line: number } | undefined): string[] {
  if (loc === undefined) return [];
  return [`rt.frameLine(${String(loc.line)});`];
}

export function emitFuncInner(f: FuncDecl, base = 0): string[] {
  if (f.isStatic && (f.name === "_init" || f.name === "_initialize" || f.name === "_process")) {
    throw new UnsupportedError("static-entry", `静态的 ${f.name}() 还没实测过行为，不猜着发`);
  }
  if (f.name === "_init") return ctx.INIT_AS_METHOD ? emitInitMethod(f, base) : emitInitAsConstructor(f, base, ctx.NEEDS_HOST_SUPER);

  const isEntry = f.name === "_initialize" || f.name === "_process";
  const abi = ctx.RAW_ABIS.get(f.name);
  const wrap = isEntry && abi === undefined;
  const bodyName = wrap ? `__gd_${f.name}` : f.name;
  const async = f.coroutine || isEntry ? "async " : "";
  const params = emitParamList(f.params, abi?.params);
  const hasValue = hasValueReturn(f.body);

  let ret: string;
  if (abi) ret = abi.ret === "str" ? "string" : "number";
  else if (f.name === "_initialize") ret = "Promise<void>";
  else if (isEntry || f.coroutine) ret = "Promise<unknown>";
  else ret = hasValue ? "rt.Variant" : "void";

  const lines: string[] = [];
  if (wrap) {
    const fwd = f.params.map((p) => p.name).join(", ");
    const dname = f.params[0]?.name ?? "delta";
    const wrapParams = f.name === "_process" ? `${dname}: number` : params;
    const wrapFwd = f.name === "_process" ? `rt.V.float(${dname})` : fwd;
    lines.push(`  ${ctx.INHERITED_METHODS.has(f.name) ? "override " : ""}${f.name}(${wrapParams}): ${ret} { return this.${bodyName}(${wrapFwd}); }`);
  }
  const overriding = !f.isStatic && (wrap ? ctx.SCRIPT_INHERITED.has(f.name) : ctx.INHERITED_METHODS.has(f.name));
  lines.push(`${f.isStatic ? "static " : ""}${overriding ? "override " : ""}${async}${bodyName}(${params}): ${ret} {`);
  mark(base, f.loc);
  const savedUnboxed = ctx.UNBOXED;
  const savedRet = ctx.CURRENT_RET;
  const savedArrays = ctx.RAW_ARRAYS;
  const savedDicts = ctx.RAW_DICTS;
  const savedFunc = ctx.CURRENT_FUNC;
  ctx.CURRENT_FUNC = f.name;
  const catchRet = abi !== undefined ? null : ret === "void" || ret === "Promise<void>" ? "return;" : `return ${typeDefault(f.returnType)};`;
  ctx.CURRENT_RET = abi ? abi.ret : null;
  const savedRetAnn = ctx.CURRENT_RET_ANN;
  ctx.CURRENT_RET_ANN = f.returnType;
  const layout = analyzeFuncLayout(f);
  ctx.UNBOXED = layout.unboxed;
  ctx.RAW_ARRAYS = layout.arrays;
  ctx.RAW_DICTS = layout.dicts;
  const pad = "    ";
  lines.push(...frameEnterLines(f.name));
  try {
    if (!f.isStatic) for (const line of emitParamSlots(f)) lines.push(`${pad}${line}`);
    for (const s of f.body) {
      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, f.name === "_initialize")) lines.push(`${pad}${line}`);
    }
  } finally {
    ctx.UNBOXED = savedUnboxed;
    ctx.CURRENT_RET = savedRet;
    ctx.CURRENT_RET_ANN = savedRetAnn;
    ctx.RAW_ARRAYS = savedArrays;
    ctx.RAW_DICTS = savedDicts;
    ctx.CURRENT_FUNC = savedFunc;
  }
  lines.push(...frameExitLines(catchRet));
  if (ret === "rt.Variant") lines.push(`${pad}return rt.V.nil();`);
  lines.push("}");
  lines.push("");
  return lines;
}
