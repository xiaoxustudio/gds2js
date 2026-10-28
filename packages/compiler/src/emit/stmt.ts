import { analysis, beginEmit, type ElemKind, type EmitContext, type Kind, type RawAbi, ctx } from "./context";
import { staticMemberFn } from "../lower/ir";
import { GLOBAL_CONSTANTS, GLOBAL_TODO_FUNCTIONS, isGlobalConst } from "../lower/globals";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, PropAccessor, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { isElemKind } from "@gds2js/runtime/runtime/values";
import { NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import { NO_ANALYSIS, type AnalysisResult } from "../analyze/analysis-result";
import { buildSourceMap, type LineMapping, type RawSourceMap } from "./sourcemap";

import { boxR, containerAnnText, isRangeCall, rangeArgList, stampDecl, unwrapSelfMember } from "./helpers";
import { frameStmtLines } from "./func";
import { containerSlot, declaredCast, emitRawIndexWrite, isGridElem, leafOf, rawElemTs } from "./abi";
import { emitAssign, emitExpr, emitExprR, emitPattern, emitValueWrite } from "./expr-boxed";
import { patternNames } from "./layout";

export function condExpr(e: Expr): string {
  const r = emitExprR(e);
  if (r.rep === "bool") return r.code;
  if (r.rep === "int" || r.rep === "float") return `${r.code} !== 0`;
  if (r.rep === "str") return `${r.code} !== ""`;
  return `rt.ops.truthy(${r.code})`;
}

/** 每条语句一行当前行：嵌套在 if / for / 里的语句也打，栈顶那帧报的才是「这一帧当前执行到哪一行」（S281 ③）。 */
export function emitStmt(s: Stmt, voidReturn: boolean): string[] {
  return [...frameStmtLines(s.loc), ...emitStmtInner(s, voidReturn)];
}

export function emitStmtInner(s: Stmt, voidReturn: boolean): string[] {
  switch (s.kind) {
    case "var": {
      const ek = ctx.RAW_ARRAYS.get(s.name);
      if (ek && s.init && s.init.kind === "array") {
        if (isGridElem(ek)) {
          const leaf = leafOf(ek);
          const rows = s.init.items.map((row) => {
            if (row.kind !== "array") {
              throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸网格行期望数组字面量，实得 ${row.kind}`);
            }
            const cells = row.items.map((it) => {
              const r = emitExprR(it);
              if (r.rep !== leaf) {
                throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸网格叶子期望 ${leaf}，实得 ${r.rep}`);
              }
              return r.code;
            });
            return `[${cells.join(", ")}]`;
          });
          return [`let ${s.name}: ${rawElemTs(ek)}[][] = [${rows.join(", ")}];`];
        }
        const parts = s.init.items.map((it) => {
          const r = emitExprR(it);
          if (r.rep !== ek) {
            throw new UnsupportedError("raw-array-init", `内部不变量破坏：裸数组元素期望 ${ek}，实得 ${r.rep}`);
          }
          return r.code;
        });
        return [`let ${s.name}: ${rawElemTs(ek)}[] = [${parts.join(", ")}];`];
      }
      const dk = ctx.RAW_DICTS.get(s.name);
      if (dk && s.init && s.init.kind === "dict") {
        const pairs = s.init.entries.map((en) => {
          const kr = emitExprR(en.key);
          const vr = emitExprR(en.value);
          if (kr.rep !== "int" && kr.rep !== "str") {
            throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
          }
          if (vr.rep !== dk) {
            throw new UnsupportedError("raw-dict-init", `内部不变量破坏：裸字典值期望 ${dk}，实得 ${vr.rep}`);
          }
          return `[${kr.code}, ${vr.code}]`;
        });
        return [`let ${s.name} = new Map<unknown, ${rawElemTs(dk)}>([${pairs.join(", ")}]);`];
      }
      if (s.init && ctx.UNBOXED.has(s.name)) {
        return [`let ${s.name} = ${emitExprR(s.init).code};`];
      }
      const init = stampDecl(s.type, s.init, emitExpr);
      const cast = declaredCast(s.type);
      return [`let ${s.name} = ${cast ? `${cast}(${init})` : init};`];
    }

    case "expr":
      return [`${emitExprR(s.expr).code};`];

    case "assign": {
      const bare = unwrapSelfMember(s.target);
      if (bare) return emitStmt({ ...s, target: bare }, voidReturn);
      if (s.target.kind === "index" && s.target.obj.kind === "ident") {
        const dk = ctx.RAW_DICTS.get(s.target.obj.name);
        if (dk) {
          const kr = emitExprR(s.target.index);
          const vr = emitExprR(s.value);
          if (kr.rep !== "int" && kr.rep !== "str") {
            throw new UnsupportedError("raw-dict-key", `内部不变量破坏：裸字典键期望 int/str，实得 ${kr.rep}`);
          }
          if (vr.rep !== dk) {
            throw new UnsupportedError("raw-dict-set", `内部不变量破坏：裸字典值期望 ${dk}，实得 ${vr.rep}`);
          }
          return [`${s.target.obj.name}.set(${kr.code}, ${vr.code});`];
        }
      }
      if (s.target.kind === "ident") {
        const kind = ctx.UNBOXED.get(s.target.name);
        if (kind) {
          const vr = emitExprR(s.value);
          const fn = kind === "int" ? "toInt" : kind === "float" ? "toFloat" : "strOf";
          const raw = vr.rep === kind ? vr.code : `rt.${fn}(${boxR(vr)}).v`;
          return [`${s.target.name} = ${raw};`];
        }
      }
      const rawWrite = emitRawIndexWrite(s.target, s.value);
      if (rawWrite) return [rawWrite];
      if (s.target.kind === "attribute" || s.target.kind === "index") {
        const vw = emitValueWrite(s.target, s.value);
        if (vw) return vw;
      }
      if (s.target.kind === "ident" && analysis.isEnginePropRead(s.target)) {
        return [`rt.writeProp(rt.V.object(this), ${JSON.stringify(s.target.name)}, ${emitExpr(s.value)});`];
      }
      return [emitAssign(s.target, emitExpr(s.value), s.value)];
    }

    case "return":
      if (!s.value) return ["return;"];
      if (ctx.CURRENT_RET) {
        const rr = emitExprR(s.value);
        if (rr.rep !== ctx.CURRENT_RET) {
          throw new UnsupportedError(
            "raw-abi-return",
            `内部不变量破坏：裸函数返回期望 ${ctx.CURRENT_RET}，实得 ${rr.rep}`,
          );
        }
        return [`return ${rr.code};`];
      }
      const code = emitExpr(s.value);
      const text = ctx.LAMBDA_DEPTH > 0 ? null : containerAnnText(ctx.CURRENT_RET_ANN);
      const wrapped = containerSlot(code, s.value, text, "returnContainer");
      return voidReturn ? [`return void (${wrapped});`] : [`return ${wrapped};`];

    case "if": {
      const lines: string[] = [];
      s.branches.forEach((br, i) => {
        const prefix = i === 0 ? "" : "} ";
        const kw = i === 0 ? "if" : br.cond ? "else if" : "else";
        const cond = br.cond ? ` (${condExpr(br.cond)})` : "";
        lines.push(`${prefix}${kw}${cond} {`);
        for (const st of br.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`  ${line}`);
        }
      });
      lines.push("}");
      return lines;
    }

    case "for": {
      const body = s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`));
      if (isRangeCall(s.iter) && ctx.UNBOXED.get(s.var) === "int") {
        return [
          `for (let ${s.var} of rt.rangeSeq(${rangeArgList(s.iter.args.map(emitExpr))})) {`,
          ...body,
          "}",
        ];
      }
      return [`for (let ${s.var} of rt.iter(${emitExpr(s.iter)})) {`, ...body, "}"];
    }

    case "while":
      return [
        `while (${condExpr(s.cond)}) {`,
        ...s.body.flatMap((st) => emitStmt(st, voidReturn).map((l) => `  ${l}`)),
        "}",
      ];

    case "break":
      return ["break;"];
    case "continue":
      return ["continue;"];
    case "pass":
      return ["/* pass */"];

    case "match": {
      const subject = emitExpr(s.subject);
      const lines: string[] = ["do {"];
      s.arms.forEach((arm, i) => {
        const m = `__m${i}`;
        const guard = arm.guard ? ` && rt.ops.truthy(${emitExpr(arm.guard)})` : "";
        lines.push(`  const ${m} = rt.matchPattern(${subject}, ${emitPattern(arm.pattern)});`);
        lines.push(`  if (${m} !== null${guard}) {`);
        patternNames(arm.pattern).forEach((name, idx) => {
          lines.push(`    const ${name} = ${m}[${idx}] as rt.Variant;`);
        });
        for (const st of arm.body) {
          for (const line of emitStmt(st, voidReturn)) lines.push(`    ${line}`);
        }
        lines.push("    break;");
        lines.push("  }");
      });
      lines.push("} while (false);");
      return lines;
    }
  }
}
