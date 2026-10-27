import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { makeClosure, mark } from "./helpers";
import { ctorAritiesLiteral, dictIdentityLiteral, fieldTypesLiteral, fwdParams, innerClassBase, innerInheritedMethodNames, innerInheritedNames, methodAritiesLiteral, methodParamsLiteral, scriptPropsLiteral, scriptPropsReaderLiteral, staticNamesLiteral, staticVarTableLiteral, staticsTableLiteral } from "./layout";
import { propSlot, propSlotInit, slotInit, staticVarSlotsLiteral } from "./abi";
import { emitFunc } from "./func";
import { emitStmt } from "./stmt";

export function emitAccessors(v: VarDecl): string[] {
  const a = v.accessor;
  if (a === null || a === undefined) return [];
  const out: string[] = [];
  const st = v.isStatic ? "static " : "";
  const slot = propSlot(v);
  const selfRef = v.isStatic ? `${ctx.CURRENT_CLASS}.` : "this.";
  const lines = (body: Stmt[]): string[] => body.flatMap((s) => emitStmt(s, false)).map((l) => `    ${l}`);
  const dead = (method: string): string => `rt.reportNonStaticCall(${JSON.stringify(method)})`;
  const unreachable = (method: string): boolean => v.isStatic && !ctx.STATIC_FUNCS.has(method);
  const delegate = (method: string, arg: string): string =>
    `${ctx.STATIC_FUNCS.has(method) ? `${ctx.CURRENT_CLASS}.` : "this."}${method}(${arg})`;
  out.push(`  ${st}get ${v.name}() {`);
  if (a.getter === null) {
    out.push(slot === null ? "    return rt.V.nil();" : `    return ${selfRef}${slot};`);
  } else if (a.getter.kind === "inline") out.push(...lines(a.getter.body));
  else if (unreachable(a.getter.method)) out.push(`    return ${dead(a.getter.method)};`);
  else out.push(`    return ${delegate(a.getter.method, "")};`);
  out.push("  }");
  const pname = a.setter !== null && a.setter.kind === "inline" ? a.setter.param : "value";
  out.push(`  ${st}set ${v.name}(${pname}) {`);
  if (a.setter === null) out.push(`    // 只读属性：Godot 里写它是静默无操作，不是报错`);
  else if (a.setter.kind === "inline") out.push(...lines(a.setter.body));
  else if (unreachable(a.setter.method)) out.push(`    ${dead(a.setter.method)};`);
  else out.push(`    ${delegate(a.setter.method, "value")};`);
  out.push("  }");
  return out;
}

export function emitClassDecl(decl: ClassDecl, base = 0): string[] {
  if (decl.innerClasses.length > 0) {
    throw new UnsupportedError("inner-class", `内部类 ${decl.name} 里再套内部类还没实测过，不发`);
  }
  const saved = ctx.CURRENT_MEMBERS;
  const savedTypes = ctx.VAR_TYPES;
  const savedStatics = ctx.STATIC_FUNCS;
  const savedClass = ctx.CURRENT_CLASS;
  const savedConsts = ctx.CLASS_VALUE_OWNERS;
  const savedHasBase = ctx.INIT_HAS_BASE;
  const savedAsMethod = ctx.INIT_AS_METHOD;
  const savedHostSuper = ctx.NEEDS_HOST_SUPER;
  const savedClassFuncs = ctx.CLASS_FUNCS;
  const savedReturns = ctx.FUNC_RETURNS;
  const savedClassSignals = ctx.CLASS_SIGNALS;
  ctx.CURRENT_MEMBERS = new Set([
    ...decl.vars.filter((v) => !v.isStatic).map((v) => v.name),
    ...decl.signals.map((g) => g.name),
    ...innerInheritedNames(decl),
  ]);
  ctx.CLASS_SIGNALS = new Set(decl.signals.map((g) => g.name));
  ctx.VAR_TYPES = new Map(decl.vars.map((v) => [v.name, v.type]));
  const savedEngineBase = ctx.ENGINE_BASE;
  ctx.CURRENT_CLASS = decl.name;
  ctx.ENGINE_BASE = null;
  ctx.STATIC_FUNCS = new Set(decl.funcs.filter((f) => f.isStatic).map((f) => f.name));
  ctx.CLASS_FUNCS = new Set([...decl.funcs.map((f) => f.name), ...innerInheritedMethodNames(decl)]);
  ctx.FUNC_RETURNS = new Map<string, TypeRef | null>([...savedReturns, ...decl.funcs.map((f): [string, TypeRef | null] => [f.name, f.returnType])]);
  ctx.CLASS_VALUE_OWNERS = new Map(savedConsts);
  for (const v of decl.vars) if (v.isConst || v.isStatic) ctx.CLASS_VALUE_OWNERS.set(v.name, decl.name);

  const baseName = decl.extends === null ? null : innerClassBase(decl.extends);
  const proto = baseName !== null || ctx.EXTENDED_INNER.has(decl.name);
  ctx.INIT_HAS_BASE = baseName !== null;
  ctx.INIT_AS_METHOD = proto;
  ctx.NEEDS_HOST_SUPER = !proto;
  const lines = [`class ${decl.name}${baseName !== null ? ` extends ${baseName}` : " extends rt.GdScriptObject"} {`];
  mark(base, decl.loc);
  if (proto && baseName === null) lines.push(...emitRootConstructor(true));
  lines.push(...emitFieldDeclarations(decl.vars, decl.signals));
  lines.push(...emitFieldsMethod(decl.vars, decl.signals, baseName !== null, base + lines.length));
  lines.push(...emitClassLevelVars(decl.vars, base + lines.length));
  if (!proto && !decl.funcs.some((f) => f.name === "_init" && !f.isStatic)) lines.push(...emitFieldsOnlyConstructor());
  ctx.INHERITED_METHODS = new Set(innerInheritedMethodNames(decl));
  ctx.SCRIPT_INHERITED = ctx.INHERITED_METHODS;
  for (const f of decl.funcs) {
    const funcBase = base + lines.length;
    for (const line of emitFunc(f, funcBase)) lines.push(`  ${line}`);
  }
  ctx.INHERITED_METHODS = new Set();
  ctx.SCRIPT_INHERITED = new Set();
  lines.push(...emitDispatch(decl.funcs, proto));
  lines.push("}");
  lines.push(`const __gd_d_${decl.name} = rt.defineClass(${decl.name}, ${makeClosure(decl.name, decl.funcs.find((x) => x.name === "_init" && !x.isStatic), proto)}, (o) => o instanceof ${decl.name});`);
  lines.push(`rt.nameClass(__gd_d_${decl.name}, ${JSON.stringify(decl.name)});`);
  if (baseName !== null) {
    lines.push(`rt.setClassBase(__gd_d_${decl.name}, rt.lookupClass(${JSON.stringify(baseName)}) ?? null);`);
  }
  const declFields = fieldTypesLiteral(decl.vars.filter((v) => !v.isStatic));
  if (declFields !== null) lines.push(`rt.registerFieldTypes(__gd_d_${decl.name}, ${declFields});`);
  const declPropVars = decl.vars.filter((v) => !v.isStatic);
  const declProps = scriptPropsLiteral(declPropVars);
  if (declProps !== null) lines.push(`rt.registerScriptProps(__gd_d_${decl.name}, ${declProps}, ${scriptPropsReaderLiteral(decl.name, declPropVars)});`);
  lines.push(dictIdentityLiteral(`__gd_d_${decl.name}`, decl.name, decl.vars, decl.name));
  const declStaticVars = staticVarTableLiteral(decl.vars);
  const declStaticSlots = staticVarSlotsLiteral(decl.name, decl.vars);
  if (declStaticVars !== null && declStaticSlots !== null) lines.push(`rt.registerStaticVars(__gd_d_${decl.name}, ${declStaticVars}, ${declStaticSlots});`);
  const declArities = methodAritiesLiteral(decl.funcs);
  if (declArities !== null) lines.push(`rt.registerMethodArities(__gd_d_${decl.name}, ${declArities});`);
  const declCtor = ctorAritiesLiteral(decl.funcs);
  if (declCtor !== null) lines.push(`rt.registerCtorArities(__gd_d_${decl.name}, ${declCtor});`);
  const declParams = methodParamsLiteral(decl.funcs);
  if (declParams !== null) lines.push(`rt.registerMethodParams(__gd_d_${decl.name}, ${declParams});`);
  const declStatics = staticNamesLiteral(decl.funcs);
  if (declStatics.length > 0) lines.push(`rt.registerStaticMethods(__gd_d_${decl.name}, ${JSON.stringify(declStatics)}, ${staticsTableLiteral(decl.name, decl.funcs)});`);
  if (baseName === null) lines.push(`rt.registerNativeBase(__gd_d_${decl.name}, "RefCounted");`);
  lines.push("");

  ctx.CURRENT_MEMBERS = saved;
  ctx.CLASS_SIGNALS = savedClassSignals;
  ctx.VAR_TYPES = savedTypes;
  ctx.STATIC_FUNCS = savedStatics;
  ctx.CURRENT_CLASS = savedClass;
  ctx.ENGINE_BASE = savedEngineBase;
  ctx.CLASS_VALUE_OWNERS = savedConsts;
  ctx.INIT_HAS_BASE = savedHasBase;
  ctx.INIT_AS_METHOD = savedAsMethod;
  ctx.NEEDS_HOST_SUPER = savedHostSuper;
  ctx.CLASS_FUNCS = savedClassFuncs;
  ctx.FUNC_RETURNS = savedReturns;
  return lines;
}

export function emitFieldDeclarations(vars: VarDecl[], signals: SignalDecl[]): string[] {
  const out: string[] = [];
  for (const s of signals) out.push(`  declare ${s.name}: rt.Signal;`);
  for (const v of vars) {
    if (v.isStatic) continue;
    const slot = propSlot(v);
    if (slot !== null) out.push(`  declare ${slot}: rt.Variant;`);
    if (v.accessor) continue;
    out.push(`  declare ${v.name}: rt.Variant;`);
  }
  if (out.length > 0) out.push("");
  return out;
}

export function emitFieldsMethod(vars: VarDecl[], signals: SignalDecl[], chainToBase: boolean, lineBase: number): string[] {
  const out: string[] = [chainToBase ? "  override __gd_fields__() {" : "  __gd_fields__() {"];
  out.push(`    const __gd_frame = rt.frameEnter(${JSON.stringify(ctx.DEBUG_FILE)}, "@implicit_new");`);
  out.push("    try {");
  if (chainToBase) out.push("      super.__gd_fields__();");
  for (const s of signals) {
    mark(lineBase + out.length, s.loc);
    out.push(`      rt.frameLine(${String(s.loc?.line ?? 0)});`);
    out.push(`      this.${s.name} = new rt.Signal(${JSON.stringify(s.name)});`);
  }
  for (const v of vars) {
    if (v.isStatic) continue;
    const slot = propSlot(v);
    if (slot !== null) {
      mark(lineBase + out.length, v.loc);
      out.push(`      rt.frameLine(${String(v.loc?.line ?? 0)});`);
      out.push(`      this.${slot} = ${slotInit(v.type, v.init)};`);
      continue;
    }
    if (v.accessor) continue;
    mark(lineBase + out.length, v.loc);
    out.push(`      rt.frameLine(${String(v.loc?.line ?? 0)});`);
    out.push(`      this.${v.name} = ${slotInit(v.type, v.init)};`);
  }
  out.push("    } catch (__gd_err) {");
  out.push("      rt.gdFunctionError(__gd_err);");
  out.push("      return;");
  out.push("    } finally {");
  out.push("      rt.frameExit(__gd_frame);");
  out.push("    }");
  out.push("  }");
  out.push("");
  return out;
}

export function emitClassLevelVars(vars: VarDecl[], lineBase: number): string[] {
  const out: string[] = [];
  for (const v of vars) {
    mark(lineBase + out.length, v.loc);
    if (v.accessor) {
      if (v.isStatic && propSlot(v) !== null) out.push(propSlotInit(v));
      for (const l of emitAccessors(v)) out.push(l);
      continue;
    }
    if (v.isStatic || v.isConst) out.push(`  static ${v.name} = ${slotInit(v.type, v.init, v.isStatic)};`);
  }
  if (out.length > 0) out.push("");
  return out;
}

export function emitDispatch(funcs: FuncDecl[], proto: boolean): string[] {
  const out: string[] = ["  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {"];
  out.push("    switch (name) {");
  for (const f of funcs) {
    if (f.isStatic) continue;
    if (!proto && f.name === "_init") continue;
    const wrapped = (f.name === "_initialize" || f.name === "_process") && ctx.RAW_ABIS.get(f.name) === undefined;
    const who = wrapped ? `__gd_${f.name}` : f.name;
    const abi = ctx.RAW_ABIS.get(f.name);
    const fwd =
      f.name === "_init" && proto
        ? "...args"
        : abi === undefined
          ? fwdParams(f.params, "args")
          : f.params.map((_p, i) => `rt.fast.${abi.params[i] === "str" ? "unboxStr" : "unboxNum"}(args[${i}] as rt.Variant)`).join(", ");
    out.push(`      case ${JSON.stringify(f.name)}: return rt.wrapValue(this.${who}(${fwd}));`);
  }
  out.push("      default: return super.__gdDispatch(name, args);");
  out.push("    }");
  out.push("  }");
  out.push("");
  return out;
}

export function emitRootConstructor(hostSuper: boolean): string[] {
  const out = ["  constructor(...__gd_new_args: rt.Variant[]) {"];
  if (hostSuper) out.push("    super();");
  out.push("    this.__gd_fields__();");
  out.push("    if (!rt.bareConstruction()) this.__gdDispatch(\"_init\", __gd_new_args);");
  out.push("  }");
  out.push("");
  return out;
}

export function emitFieldsOnlyConstructor(): string[] {
  const out = ["  constructor() {", "    super();", "    this.__gd_fields__();", "  }", "",];
  return out;
}
