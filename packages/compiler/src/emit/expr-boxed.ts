import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { emitStmt } from "./stmt";
import { boxR, containerAnnText, fastSuffix, typeName, writeBack, writePathFor } from "./helpers";
import { type R } from "./surface";
import { containerSlot, declaredCast, isGridElem, leafOf, tryRawBinary } from "./abi";
import { emitBinary, emitCall } from "./call";

export function emitValueWrite(target: Expr, value: Expr): string[] | null {
  const seq = { n: 0 };
  if (target.kind === "attribute") {
    const p = writePathFor(target.obj, seq);
    return writeBack(p, `rt.writeProp(${p.read}, ${JSON.stringify(target.name)}, ${emitExpr(value)})`);
  }
  if (target.kind === "index") {
    const p = writePathFor(target.obj, seq);
    return writeBack(p, `rt.writeIdx(${p.read}, ${emitExpr(target.index)}, ${emitExpr(value)})`);
  }
  return null;
}

export function emitAssign(target: Expr, value: string, valueExpr?: Expr): string {
  if (target.kind === "ident") {
    const ann = ctx.LOCAL_TYPES.get(target.name) ?? null;
    const cast = declaredCast(ann);
    const v = valueExpr === undefined ? value : containerSlot(value, valueExpr, containerAnnText(ann), "assignContainer");
    return `${emitExpr(target)} = ${cast ? `${cast}(${v})` : v};`;
  }
  if (target.kind === "index") {
    if (target.obj.kind === "ident" && ctx.RAW_ARRAYS.has(target.obj.name)) {
      throw new UnsupportedError("raw-array", "内部不变量破坏：裸数组不应出现下标赋值");
    }
    return `rt.setIndex(${emitExpr(target.obj)}, ${emitExpr(target.index)}, ${value});`;
  }
  if (target.kind === "attribute") {
    return `rt.writeProp(${emitExpr(target.obj)}, ${JSON.stringify(target.name)}, ${value});`;
  }
  throw new UnsupportedError("emit-assign", `赋值目标 ${target.kind} 还没实现`);
}

export function emitExpr(e: Expr): string {
  return boxR(emitExprR(e));
}

export function emitExprR(e: Expr): R {
  if (e.kind === "ternary") {
    const cr = emitExprR(e.cond);
    const tr = emitExprR(e.thenE);
    const fr = emitExprR(e.elseE);
    return { code: `rt.tern(${boxR(cr)}, () => ${boxR(tr)}, () => ${boxR(fr)})`, rep: "var" };
  }
  if (e.kind === "lit" && e.lit === "int" && typeof e.value === "number" && Number.isSafeInteger(e.value)) {
    return { code: String(e.value), rep: "int" };
  }
  if (e.kind === "lit" && e.lit === "float" && typeof e.value === "number") {
    return { code: String(e.value), rep: "float" };
  }
  if (e.kind === "lit" && e.lit === "string") {
    return { code: JSON.stringify(String(e.value)), rep: "str" };
  }
  if (e.kind === "ident") {
    const k = ctx.UNBOXED.get(e.name);
    if (k) return { code: e.name, rep: k };
  }
  if (e.kind === "index" && e.obj.kind === "index" && e.obj.obj.kind === "ident") {
    const ek = ctx.RAW_ARRAYS.get(e.obj.obj.name);
    if (ek && isGridElem(ek)) {
      const ri = emitExprR(e.obj.index);
      const rj = emitExprR(e.index);
      if (ri.rep !== "int" || rj.rep !== "int") {
        throw new UnsupportedError("raw-array", `内部不变量破坏：裸网格下标期望 int，实得 ${ri.rep}/${rj.rep}`);
      }
      return { code: `rt.fast.rawArrGet${fastSuffix(ek)}2(${e.obj.obj.name}, ${ri.code}, ${rj.code})`, rep: leafOf(ek) };
    }
  }
  if (e.kind === "index" && e.obj.kind === "ident") {
    const ek = ctx.RAW_ARRAYS.get(e.obj.name);
    if (ek && !isGridElem(ek)) {
      const ir = emitExprR(e.index);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组下标期望 int，实得 ${ir.rep}`);
      const lbl = analysis.posReadLabel(e);
      return {
        code: `rt.fast.rawArrGet${fastSuffix(ek)}${lbl === null ? "" : "Base"}(${e.obj.name}, ${ir.code}${lbl === null ? "" : `, ${JSON.stringify(lbl)}`})`,
        rep: ek,
      };
    }
    const dk = ctx.RAW_DICTS.get(e.obj.name);
    if (dk !== undefined && !analysis.isDictIntRead(e)) {
      const kr = emitExprR(e.index);
      if (kr.rep !== "int" && kr.rep !== "str") {
        throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
      }
      return { code: `rt.fast.rawDictGet(${e.obj.name}, ${kr.code})`, rep: dk };
    }
  }
  if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
    const nm = e.callee.obj.name;
    const ek = ctx.RAW_ARRAYS.get(nm);
    const dk = ctx.RAW_DICTS.get(nm);
    if ((ek || dk) && (e.callee.name === "size" || e.callee.name === "length") && e.args.length === 0) {
      return { code: `${nm}.${ek ? "length" : "size"}`, rep: "int" };
    }
    if (ek && (e.callee.name === "append" || e.callee.name === "push_back") && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 ${e.callee.name} 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `${nm}.push(${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "reverse" && e.args.length === 0) {
      return { code: `${nm}.reverse()`, rep: "var" };
    }
    if (ek && e.callee.name === "push_front" && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 push_front 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `rt.fast.rawArrPushFront${fastSuffix(ek)}(${nm}, ${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "fill" && e.args.length === 1) {
      const er = emitExprR(e.args[0]!);
      if (er.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 fill 元素期望 ${ek}，实得 ${er.rep}`);
      return { code: `${nm}.fill(${er.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "insert" && e.args.length === 2) {
      const ir = emitExprR(e.args[0]!);
      const vr = emitExprR(e.args[1]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 insert 下标期望 int，实得 ${ir.rep}`);
      if (vr.rep !== ek) throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 insert 元素期望 ${ek}，实得 ${vr.rep}`);
      return { code: `rt.fast.rawArrInsert${fastSuffix(ek)}(${nm}, ${ir.code}, ${vr.code})`, rep: "int" };
    }
    if (ek && e.callee.name === "remove_at" && e.args.length === 1) {
      const ir = emitExprR(e.args[0]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 remove_at 下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrRemoveAt${fastSuffix(ek)}(${nm}, ${ir.code})`, rep: "var" };
    }
    if (ek && e.callee.name === "clear" && e.args.length === 0) {
      return { code: `rt.fast.rawArrClear${fastSuffix(ek)}(${nm})`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_back" && e.args.length === 0) {
      return { code: `${nm}.pop()`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_front" && e.args.length === 0) {
      return { code: `${nm}.shift()`, rep: "var" };
    }
    if (ek && e.callee.name === "pop_at" && e.args.length === 1) {
      const ir = emitExprR(e.args[0]!);
      if (ir.rep !== "int") throw new UnsupportedError("raw-array", `内部不变量破坏：裸数组 pop_at 下标期望 int，实得 ${ir.rep}`);
      return { code: `rt.fast.rawArrRemoveAt${fastSuffix(ek)}(${nm}, ${ir.code})`, rep: "var" };
    }
    if (dk && e.callee.name === "get" && e.args.length === 2) {
      const kr = emitExprR(e.args[0]!);
      const dr = emitExprR(e.args[1]!);
      if (kr.rep !== "int" && kr.rep !== "str") {
        throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典 get 键期望 int/str，实得 ${kr.rep}`);
      }
      if (dr.rep !== dk) throw new UnsupportedError("raw-dict-get", `内部不变量破坏：裸字典 get 默认值期望 ${dk}，实得 ${dr.rep}`);
      return { code: `rt.fast.rawDictGetOr${fastSuffix(dk)}(${nm}, ${kr.code}, ${dr.code})`, rep: dk };
    }
  }
  if (e.kind === "call" && e.callee.kind === "ident") {
    const abi = ctx.RAW_ABIS.get(e.callee.name);
    if (abi) {
      if (e.args.length !== abi.params.length) {
        throw new UnsupportedError("raw-abi-arity", `内部不变量破坏：${e.callee.name} 期望 ${abi.params.length} 个实参`);
      }
      const raws = e.args.map(emitExprR);
      for (let i = 0; i < raws.length; i++) {
        const want = abi.params[i]!;
        const got = raws[i]!;
        if (got.rep !== want) {
          throw new UnsupportedError(
            "raw-abi-arg",
            `内部不变量破坏：${e.callee.name} 第 ${i + 1} 参数期望 ${want}，实得 ${got.rep}`,
          );
        }
      }
      return { code: `this.${e.callee.name}(${raws.map((r) => r.code).join(", ")})`, rep: abi.ret };
    }
  }
  if (e.kind === "unary" && e.op === "-") {
    const or = emitExprR(e.operand);
    if (or.rep === "int" || or.rep === "float") return { code: `(-${or.code})`, rep: or.rep };
  }
  if (e.kind === "binary") {
    const raw = tryRawBinary(e);
    if (raw) return raw;
  }
  return { code: emitExprVar(e), rep: "var" };
}

export function emitExprVar(e: Expr): string {
  switch (e.kind) {
    case "lit":
      return emitLit(e.lit, e.value);

    case "ident":
      if (e.name === "self") return ctx.selfInNilContext ? "rt.V.nil()" : `rt.V.object(this)`;
      const owner = ctx.CLASS_VALUE_OWNERS.get(e.name);
      if (owner !== undefined) return `${owner}.${e.name}`;
      if (ctx.INNER_CLASSES.has(e.name) || e.name === ctx.CURRENT_CLASS) return `rt.V.object(__gd_d_${e.name})`;
      if (ctx.STATIC_FUNCS.has(e.name)) return `rt.methodCallable(rt.V.object(__gd_d_${ctx.CURRENT_CLASS}), ${JSON.stringify(e.name)})`;
      if (ctx.MODULE_FUNCS.has(e.name)) return `rt.methodCallable(rt.V.object(this), ${JSON.stringify(e.name)})`;
      if (ctx.CURRENT_MEMBERS.has(e.name)) return ctx.CLASS_SIGNALS.has(e.name) ? `rt.wrapValue(this.${e.name})` : `this.${e.name}`;
      if (ctx.MODULE_VARS.has(e.name)) return ctx.MODULE_SIGNALS.has(e.name) ? `rt.wrapValue(this.${e.name})` : `this.${e.name}`;
      if (analysis.isGlobalValueRead(e)) return `rt.globalCallable(${JSON.stringify(e.name)})`;
      if (analysis.isNativeClassValueRead(e)) return `rt.nativeClass(${JSON.stringify(e.name)})`;
      if (analysis.isHostMethodValueRead(e) && !ctx.FUNC_BINDS.has(e.name)) return `rt.methodCallable(rt.V.object(this), ${JSON.stringify(e.name)})`;
      return e.name;

    case "unary":
      if (e.op === "not") return `rt.V.bool(!rt.ops.truthy(${emitExpr(e.operand)}))`;
      if (e.op === "-") return `rt.ops.neg(${emitExpr(e.operand)})`;
      if (e.op === "+") return `rt.ops.pos(${emitExpr(e.operand)})`;
      if (e.op === "~") return `rt.ops.bnot(${emitExpr(e.operand)})`;
      throw new UnsupportedError("emit-unary", `一元运算符 ${e.op} 还没实现`);

    case "await":
      return `(await rt.awaitValue(${emitExpr(e.operand)}))`;

    case "ternary":
      return `rt.tern(${emitExpr(e.cond)}, () => ${emitExpr(e.thenE)}, () => ${emitExpr(e.elseE)})`;

    case "binary":
      return emitBinary(e);

    case "array":
      return `rt.V.array(rt.GArray.of([${e.items.map(emitExpr).join(", ")}]))`;

    case "dict": {
      const pairs = e.entries.map((en) => `[${emitExpr(en.key)}, ${emitExpr(en.value)}]`);
      return `rt.dictOf([${pairs.join(", ")}])`;
    }

    case "index":
      if (analysis.isDictIntRead(e)) return `rt.wrapValue(rt.dictIndexInt(${emitExpr(e.obj)}, ${emitExpr(e.index)}))`;
      const pos = analysis.posReadLabel(e);
      return pos === null
        ? `rt.wrapValue(rt.index(${emitExpr(e.obj)}, ${emitExpr(e.index)}))`
        : `rt.wrapValue(rt.index(${emitExpr(e.obj)}, ${emitExpr(e.index)}, ${JSON.stringify(pos)}))`;

    case "attribute":
      if (e.obj.kind === "ident" && e.obj.name === "super") {
        throw new UnsupportedError("emit-super-prop", "super.属性 访问还没实现（只支持 super.method()）");
      }
      if (e.obj.kind === "ident" && e.obj.name === "self") {
        if (ctx.CURRENT_MEMBERS.has(e.name) || ctx.MODULE_VARS.has(e.name) || ctx.MODULE_FUNCS.has(e.name)) {
          return emitExprVar({ kind: "ident", name: e.name, loc: e.loc });
        }
        return `rt.wrapValue(rt.attribute(rt.V.object(this), ${JSON.stringify(e.name)}))`;
      }
      const staticFn = staticMemberFn(e.obj);
      if (staticFn) {
        return `rt.${staticFn}(${JSON.stringify(e.name)})`;
      }
      if (e.obj.kind === "ident" && ctx.ENUM_NAMES.has(e.obj.name)) {
        return `rt.wrapValue(rt.index(${e.obj.name}, rt.V.str(${JSON.stringify(e.name)})))`;
      }
      if (e.obj.kind === "ident" && ctx.CLASS_VALUES.get(e.obj.name)?.has(e.name) === true) {
        return `${e.obj.name}.${e.name}`;
      }
      const bound = analysis.boundFace(e);
      if (bound !== null) {
        return "rt.wrapValue(rt.boundMethod(" + emitExpr(e.obj) + ", " + JSON.stringify(bound.face) + ", " + JSON.stringify(e.name) + ", " + String(bound.min) + ", " + String(bound.max) + "))";
      }
      return `rt.wrapValue(rt.attribute(${emitExpr(e.obj)}, ${JSON.stringify(e.name)}))`;

    case "lambda": {
      const firstDef = e.params.findIndex((p) => p.default !== null);
      if (firstDef >= 0 && e.params.slice(firstDef).some((p) => p.default === null)) {
        throw new UnsupportedError("lambda-param-default", "lambda 的默认值形参排在必填形参之前那一形没实测过，不发");
      }
      const defs = e.params.flatMap((p) => (p.default === null ? [] : [p.default]));
      if (defs.some((d) => d.kind === "lambda")) {
        throw new UnsupportedError("lambda-param-default", "默认值那一位直接放 lambda 的形况没实测过，不发");
      }
      const lpad = "        ";
      const body = e.body.flatMap((st) => {
        ctx.LAMBDA_DEPTH += 1;
        try {
          return emitStmt(st, false).map((l) => `${lpad}${l}`);
        } finally {
          ctx.LAMBDA_DEPTH -= 1;
        }
      });
      const bind = e.params.map((p, i) => `${lpad}const ${p.name} = __a[${i}] as rt.Variant` + (p.default === null ? "" : " ?? " + emitExpr(p.default)) + ";");
      const lines: string[] = [
        `rt.callable((__a: rt.Variant[]) => {`,
        `        const __gd_frame = rt.frameEnter(${JSON.stringify(ctx.DEBUG_FILE)}, "<anonymous lambda>");`,
        "        try {",
        ...bind.map((l) => `  ${l}`),
        ...body.map((l) => `  ${l}`),
        "        } catch (__gd_err) {",
        "          rt.gdFunctionError(__gd_err);",
        "          return rt.V.nil();",
        "        } finally {",
        "          rt.frameExit(__gd_frame);",
        "        }",
        `    }, ${e.params.length}${defs.length === 0 ? "" : ", " + String(defs.length)})`,
      ];
      const inner = lines.join(String.fromCharCode(10));
      const caps = analysis.lambdaCaptureNames(e);
      if (caps.length > 0) return "(((" + caps.join(", ") + ") => " + inner + "))(" + caps.join(", ") + ")";
      return inner;
    }

    case "call":
      return emitCall(e);

    case "is":
      return `rt.isType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;

    case "as":
      return `rt.asType(${emitExpr(e.operand)}, ${JSON.stringify(typeName(e.type))})`;
  }
}

export function emitLit(lit: string, value: string | number | bigint | boolean | null): string {
  if (lit === "int") return `rt.V.int(${typeof value === "bigint" ? `${value.toString()}n` : String(value)})`;
  if (lit === "float") return `rt.V.float(${String(value)})`;
  if (lit === "string") return `rt.V.str(${JSON.stringify(String(value))})`;
  if (lit === "string_name") return `rt.V.stringName(${JSON.stringify(String(value))})`;
  if (lit === "node_path") return `rt.nodePathCtor([rt.V.str(${JSON.stringify(String(value))})])`;
  if (lit === "bool") return `rt.V.bool(${String(value)})`;
  return "rt.V.nil()";
}

export function emitPattern(p: Pattern): string {
  switch (p.kind) {
    case "wildcard":
      return "rt.patWild()";
    case "bind":
      return "rt.patBind()";
    case "lit":
      return `rt.patLit(${emitLit(p.lit, p.value)})`;
    case "const":
      return `rt.patConst(${emitExpr(p.expr)})`;
    case "array":
      return `rt.patArray([${p.items.map(emitPattern).join(", ")}])`;
    case "dict":
      return `rt.patDict([${p.entries.map((en) => `[${emitExpr(en.key)}, ${emitPattern(en.pattern)}]`).join(", ")}])`;
  }
}
