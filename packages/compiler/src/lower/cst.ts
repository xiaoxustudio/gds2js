import { parseGdDouble } from "@gds2js/runtime/shared/double";
import { UnsupportedError } from "@gds2js/runtime/runtime/errors";
import { GLOBAL_CALLABLES } from "@gds2js/runtime/runtime/global-names";
import type { CsNode as SyntaxNode, CsTree as Tree } from "../parse/cst";
import type {
  ClassDecl,
  EnumDecl,
  EnumMember,
  Expr,
  FuncDecl,
  Loc,
  MatchArm,
  Module,
  Param,
  Pattern,
  PropAccessor,
  PropGetter,
  PropSetter,
  SignalDecl,
  Stmt,
  TypeRef,
  VarDecl,
} from "./ir";

export function loc(n: SyntaxNode): Loc {
  return { line: n.startPosition.row + 1, col: n.startPosition.column + 1 };
}

export function field(n: SyntaxNode, name: string): SyntaxNode | null {
  for (const c of n.children) {
    if (c.fieldName === name) return c;
  }
  return null;
}

export function need(n: SyntaxNode | null | undefined, what: string): SyntaxNode {
  if (!n) throw new UnsupportedError("missing-field", `缺少 ${what}`);
  return n;
}

export function operatorOf(n: SyntaxNode): string {
  const op = n.children.find((c) => !c.isNamed);
  if (!op) throw new UnsupportedError("missing-operator", `${n.type} 找不到运算符`);
  return op.text;
}

export const BRACKET_NODES = new Set(["parenthesized_expression", "array", "dictionary", "arguments", "subscript"]);

export const CST_PARENTS = new WeakMap<SyntaxNode, SyntaxNode>();

export function indexParents(n: SyntaxNode): void {
  for (const c of n.children) {
    CST_PARENTS.set(c, n);
    indexParents(c);
  }
}

export function inBrackets(n: SyntaxNode | null | undefined): boolean {
  for (let p = n ? CST_PARENTS.get(n) : undefined; p; p = CST_PARENTS.get(p)) {
    if (BRACKET_NODES.has(p.type)) return true;
  }
  return false;
}

export function tokenOf(n: SyntaxNode, text: string): SyntaxNode | null {
  return n.children.find((c) => !c.isNamed && c.text === text) ?? null;
}

export function continuationErr(sentence: string, at?: SyntaxNode): never {
  const e = new UnsupportedError("line-continuation", sentence);
  const carry = e as LineCarrying;
  if (at !== undefined) carry.line = at.startPosition.row + 1;
  throw e;
}

/** 解析器交上来的语法错已经带着引擎原文句子与它点名的那一行，直接抛，不再从树上重扫。
 *  还没对过引擎读数的那一处（`sentence` 是空串）也照拒不误，只是句子换成我们自己的，绝不静默放过。 */
export function syntaxErrOf(tree: Tree): void {
  const issue = tree.syntaxErrors[0];
  if (issue === undefined) return;
  const sentence = issue.sentence === "" ? `语法畸形未支持：${issue.context} 在 ${String(issue.row + 1)}:${String(issue.column + 1)} 撞上 ${JSON.stringify(issue.got)}` : issue.sentence;
  const e = new UnsupportedError(issue.code, sentence);
  (e as LineCarrying).line = issue.reportRow + 1;
  throw e;
}

export function checkAfterToken(n: SyntaxNode, token: SyntaxNode | null, value: SyntaxNode | null, sentence: string): void {
  if (token && value && value.startPosition.row > token.startPosition.row) continuationErr(sentence, token);
}

export function operatorToken(n: SyntaxNode): SyntaxNode | null {
  return n.children.find((c) => !c.isNamed) ?? null;
}

export function lastRow(n: SyntaxNode): number {
  let row = n.startPosition.row;
  for (let i = 0; i < n.text.length; i++) if (n.text.charCodeAt(i) === 10) row++;
  return row;
}

export function checkColonHere(n: SyntaxNode, sentence: string): void {
  const kids = n.children;
  const at = kids.findIndex((c) => !c.isNamed && c.text === ":");
  const colon = at < 1 ? undefined : kids[at];
  const prev = at < 1 ? undefined : kids[at - 1];
  if (colon && prev && colon.startPosition.row > lastRow(prev)) continuationErr(sentence, prev);
}

export function named(n: SyntaxNode): SyntaxNode[] {
  return n.namedChildren;
}

export function lowerType(n: SyntaxNode): TypeRef {
  if (n.type === "inferred_type") return { kind: "variant" };
  return { kind: "named", name: n.text };
}

export type LineCarrying = { line?: number };
