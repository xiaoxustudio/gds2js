import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { frameEnterLines, frameExitLines, mark, stampDecl } from "./helpers";
import { computeUnboxed, declaredCast, slotTypeName } from "./abi";
import { emitParamList, emitParamSlots } from "./func";
import { emitStmt } from "./stmt";
import { emitExpr } from "./expr-boxed";

export function emitInitMethod(f: FuncDecl, base: number): string[] {
  const lines = [`${ctx.INHERITED_METHODS.has("_init") ? "override " : ""}_init(...__gd_init_args: rt.Variant[]): void {`];
  const pad = "    ";
  lines.push(...frameEnterLines("_init"));
  f.params.forEach((p, i) => {
    const got = `__gd_init_args[${i}] as rt.Variant`;
    let value = got;
    if (p.default !== null) {
      const raw = stampDecl(p.type, p.default, emitExpr);
      const cast = declaredCast(p.type);
      const dflt = cast === null ? raw : `${cast}(${raw})`;
      value = `__gd_init_args.length > ${i} ? (${got}) : (${dflt})`;
    }
    const slot = slotTypeName(p.type);
    if (slot !== null) value = `rt.paramSlot(${value}, ${JSON.stringify(slot)}, ${i + 1}, ${JSON.stringify(f.name)}, this)`;
    lines.push(`${pad}const ${p.name} = ${value};`);
  });
  mark(base, f.loc);
  const savedIn = ctx.IN_INIT;
  const savedUnboxed = ctx.UNBOXED;
  const savedFunc = ctx.CURRENT_FUNC;
  ctx.IN_INIT = true;
  ctx.CURRENT_FUNC = "_init";
  ctx.UNBOXED = computeUnboxed(f);
  try {
    for (const s of f.body) {

      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`${pad}${line}`);
    }
  } finally {
    ctx.IN_INIT = savedIn;
    ctx.UNBOXED = savedUnboxed;
    ctx.CURRENT_FUNC = savedFunc;
  }
  lines.push(...frameExitLines("return;"));
  lines.push("}");
  lines.push("");
  return lines;
}

export function emitInitAsConstructor(f: FuncDecl, base: number, hostSuper: boolean): string[] {
  const params = emitParamList(f.params);
  const lines = [`constructor(${params}) {`];
  mark(base, f.loc);
  const first = f.body[0];
  const explicitSuper =
    !!first &&
    first.kind === "expr" &&
    first.expr.kind === "call" &&
    first.expr.callee.kind === "ident" &&
    first.expr.callee.name === "super";
  if (!explicitSuper && hostSuper) lines.push("  super();");
  lines.push("  this.__gd_fields__();");
  lines.push("  if (!rt.bareConstruction()) {");
  const pad = "      ";
  lines.push(...frameEnterLines("_init").map((l) => `    ${l}`));
  const savedUnboxed = ctx.UNBOXED;
  const savedFunc = ctx.CURRENT_FUNC;
  ctx.UNBOXED = computeUnboxed(f);
  ctx.CURRENT_FUNC = "_init";
  try {
    for (const line of emitParamSlots(f)) lines.push(`${pad}${line}`);
    for (const s of f.body) {

      mark(base + lines.length, s.loc);
      for (const line of emitStmt(s, false)) lines.push(`${pad}${line}`);
    }
  } finally {
    ctx.UNBOXED = savedUnboxed;
    ctx.CURRENT_FUNC = savedFunc;
  }
  lines.push(...frameExitLines("return;").map((l) => `    ${l}`));
  lines.push("  }");
  lines.push("}");
  lines.push("");
  return lines;
}
