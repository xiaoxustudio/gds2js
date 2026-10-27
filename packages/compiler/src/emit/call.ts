import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NODE_SELF_METHODS } from "../semantics/node-face";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { BINOP, BUILTIN, BUILTIN_TODO, BUILTIN_TODO_WHY } from "./surface";
import { emitExpr } from "./expr-boxed";
import { callableInScope, packTypedArgs } from "./helpers";
import { pctStaticSide } from "./layout";

export function emitBinary(e: Extract<Expr, { kind: "binary" }>): string {
  const l = emitExpr(e.left);
  const r = emitExpr(e.right);

  if (e.op === "%") {
    const soft = pctStaticSide(e.left) && pctStaticSide(e.right) ? "true" : "false";
    if (e.left.kind === "lit" && e.left.lit === "string") return `rt.formatOf(${l}, ${r}, ${soft})`;
    return `rt.ops.mod(${l}, ${r}, ${soft})`;
  }
  if (e.op === "in") return `rt.ops.inOp(${l}, ${r})`;
  if (e.op === "and") return `rt.and(${l}, () => ${r})`;
  if (e.op === "or") return `rt.or(${l}, () => ${r})`;

  const fn = BINOP[e.op];
  if (!fn) throw new UnsupportedError("emit-binary", `二元运算符 ${e.op} 还没实现`);
  return `rt.ops.${fn}(${l}, ${r})`;
}

export function emitCall(e: Extract<Expr, { kind: "call" }>): string {
  const args = e.args.map(emitExpr);

  if (e.callee.kind === "ident") {
    const name = e.callee.name;
    if (name === "print") return `print(rt.showArgs([${args.join(", ")}]))`;
    if (name === "prints") return `printJoined(" ", [${args.join(", ")}])`;
    if (name === "printt") return `printJoined("\\t", [${args.join(", ")}])`;
    if (name === "printraw") return `printRaw([${args.join(", ")}])`;
    if (name === "printerr") return `printErr([${args.join(", ")}])`;
    if (name === "print_verbose") return `printVerbose([${args.join(", ")}])`;
    if (name === "print_rich") return `printRich([${args.join(", ")}])`;
    if (name === "print_debug") {
      const fnLabel = ctx.LAMBDA_DEPTH > 0 ? "<anonymous lambda>" : ctx.CURRENT_FUNC;
      return `printDebug([${args.join(", ")}], ${JSON.stringify(ctx.DEBUG_FILE)}, ${String(e.loc.line)}, ${JSON.stringify(fnLabel)})`;
    }

    if (name === "preload") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const bound = lit !== null ? ctx.PRELOADS.get(lit) : undefined;
      if (bound && lit !== null) return `rt.loadScript(${JSON.stringify(lit)})`;
      throw new UnsupportedError(
        "emit-preload",
        `preload(${lit ?? "非字面量"}) 未解析到工程内的 .gd（跨文件编译需能定位该脚本）`,
      );
    }
    if (name === "load") {
      const a = e.args[0];
      const lit = a && a.kind === "lit" && a.lit === "string" ? String(a.value) : null;
      const canonical = lit !== null ? ctx.LOADS.get(lit) : undefined;
      if (canonical) return `rt.loadScript(${JSON.stringify(canonical)})`;
      return `rt.loadScript(${args[0]})`;
    }

    const builtin = BUILTIN[name];
    if (builtin) {
      return builtin(args);
    }
    if (name === "super") {
      if (!ctx.INIT_HAS_BASE) {
        throw new UnsupportedError("emit-super-ctor", `${ctx.CURRENT_CLASS} 没有脚本基类，super() 这一格还没实测过，不发`);
      }
      if (ctx.IN_INIT) return `super._init(${args.join(", ")})`;
      if (ctx.CURRENT_FUNC === "" || ctx.STATIC_FUNCS.has(ctx.CURRENT_FUNC)) {
        throw new UnsupportedError("emit-super-ctor", "静态方法里的 super() 没实测过，不发");
      }
      return `super.${ctx.CURRENT_FUNC}(${args.join(", ")})`;
    }
    if (BUILTIN_TODO.has(name)) {
      const why = BUILTIN_TODO_WHY[name];
      throw new UnsupportedError(
        "emit-builtin",
        why ? `内置函数 ${name}() 不发：${why}` : `内置函数 ${name}() 还没实现`,
      );
    }
    if (ctx.STATIC_FUNCS.has(name)) return `${ctx.CURRENT_CLASS}.${name}(${args.join(", ")})`;
    if (!callableInScope(name)) {
      if (ctx.ENGINE_BASE !== null && NODE_SELF_METHODS.has(name)) {
        return `rt.method(this, ${JSON.stringify(name)}, [${args.join(", ")}])`;
      }
      throw new UnsupportedError("call-unknown", `Function "${name}()" not found in base self.`);
    }
    return `this.${name}(${packTypedArgs(name, e.args, args, "this").join(", ")})`;
  }

  if (e.callee.kind === "attribute") {
    if (e.callee.obj.kind === "ident" && e.callee.obj.name === "super") {
      return `super.${e.callee.name}(${args.join(", ")})`;
    }
    if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" && e.callee.obj.name === "self") {
      const own = e.callee.name;
      if (ctx.STATIC_FUNCS.has(own)) return `${ctx.CURRENT_CLASS}.${own}(${args.join(", ")})`;
      if (ctx.MODULE_FUNCS.has(own) || ctx.CURRENT_MEMBERS.has(own) || ctx.MODULE_VARS.has(own)) {
        return `this.${own}(${packTypedArgs(own, e.args, args, "this").join(", ")})`;
      }
      return `rt.method(rt.V.object(this), ${JSON.stringify(own)}, [${args.join(", ")}])`;
    }
    if (
      e.callee.name === "new" &&
      e.callee.obj.kind === "ident" &&
      ctx.MODULE_CLASSES.has(e.callee.obj.name)
    ) {
      return `rt.V.object(new ${e.callee.obj.name}(${args.join(", ")}))`;
    }
    const staticFn = staticMemberFn(e.callee.obj);
    if (staticFn) {
      return `rt.${staticFn}(${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
    }
    const obj = emitExpr(e.callee.obj);
    return `rt.method(${obj}, ${JSON.stringify(e.callee.name)}, [${args.join(", ")}])`;
  }
  throw new UnsupportedError("emit-call", "不支持的调用形式");
}
