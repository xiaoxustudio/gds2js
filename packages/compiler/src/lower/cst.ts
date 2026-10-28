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

export const MATCH_PATTERN_COLON = 'Expected ":" or "when" after "match" patterns.';

export const MATCH_GUARD_EMPTY = 'Expected expression for pattern guard after "when".';

export const MATCH_SUBJECT_COLON = 'Expected ":" after "match" expression.';

export const MATCH_EMPTY_BLOCK = 'Expected an indented block after "match" statement.';

export function gluedArm(x: SyntaxNode): SyntaxNode | null {
  const kids = x.children;
  if (!kids.some((k) => k.type === "ERROR" && /^[A-Za-z_]/.test(k.text))) return null;
  return kids.find((k) => k.isNamed && k.type !== "ERROR" && k.type !== "arguments") ?? null;
}

/** `match` 那一族的畸形形整棵树只有一个落点可用：语法塌法按缩进与手臂位置分岔（顶层 ERROR / `body` 里的 ERROR / `match_body` 的直接 ERROR），
 *  所以只要树里带 ERROR 就按记号级证据扫一遍（尺 `tmp/probe710` 十三形，句与行都按引擎原文量的），取最靠前的那一处。
 *  三条判据都要求树上真有 `match` 记号，且各认各的形状：守卫把身体粘走、主题后面直接贴上下一条手臂、手臂后面没冒号。 */
export function matchMalformedScan(root: SyntaxNode): { sentence: string; at: SyntaxNode } | null {
  const hits: Array<{ sentence: string; at: SyntaxNode; row: number }> = [];
  let sawMatch = false;
  const walk = (x: SyntaxNode): void => {
    if (x.type === "match") sawMatch = true;
    {
      const head = x.children.findIndex((k) => k.type === "match");
      const colon = x.children.findIndex((k, i) => i > head && !k.isNamed && k.text === ":");
      if (head >= 0 && colon > head && x.children.slice(head + 1, colon).filter((k) => k.isNamed).length >= 2) {
        const tok = x.children[head];
        if (tok !== undefined) hits.push({ sentence: MATCH_SUBJECT_COLON, at: tok, row: tok.startPosition.row });
      }
      if (head >= 0 && colon > head && !x.children.slice(colon + 1).some((k) => k.isNamed)) {
        const tok = x.children[head];
        if (tok !== undefined) hits.push({ sentence: MATCH_EMPTY_BLOCK, at: tok, row: tok.startPosition.row });
      }
    }
    if (x.type === "pattern_guard") {
      const cond = x.children.find((k) => k.isNamed);
      if (cond !== undefined && gluedArm(cond) !== null) hits.push({ sentence: MATCH_GUARD_EMPTY, at: x, row: x.startPosition.row });
    }
    if (x.type === "call") {
      const arm = gluedArm(x);
      if (arm !== null) hits.push({ sentence: MATCH_PATTERN_COLON, at: arm, row: arm.startPosition.row });
    }
    for (const k of x.children) walk(k);
  };
  walk(root);
  if (!sawMatch) return null;
  hits.sort((a, b) => a.row - b.row);
  const first = hits[0];
  return first === undefined ? null : { sentence: first.sentence, at: first.at };
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

export function accessorTokenErr(n: SyntaxNode, needVar = true): string | null {
  const toks: SyntaxNode[] = [];
  const collect = (x: SyntaxNode): void => {
    if (x.children.length === 0) toks.push(x);
    else for (const c of x.children) collect(c);
  };
  collect(n);
  let seenVar = !needVar;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!;
    if (t.isNamed) continue;
    if (t.text === "var") seenVar = true;
    if (!seenVar || (t.text !== "get" && t.text !== "set")) continue;
    const nxt = toks[i + 1];
    if (nxt === undefined || nxt.text === ":" || nxt.text === "(") continue;
    if (nxt.text === "=") {
      const after = toks[i + 2];
      const isName = after !== undefined && (after.type === "identifier" || after.type === "getter" || after.type === "setter");
      if (isName && after!.startPosition.row === t.startPosition.row) continue;
      return `Expected ${t.text === "get" ? "getter" : "setter"} function name after "=".`;
    }
    return t.text === "get" ? 'Expected ":" or "(" after "get".' : 'Expected "(" after "set".';
  }
  return null;
}

export function named(n: SyntaxNode): SyntaxNode[] {
  return n.namedChildren;
}

export function lowerType(n: SyntaxNode): TypeRef {
  if (n.type === "inferred_type") return { kind: "variant" };
  return { kind: "named", name: n.text };
}

/** `CsNode` 这一层不暴露 `nextNamedSibling`，兄弟关系从 `indexParents` 存的父节点上找。 */
export function nextNamedSib(n: SyntaxNode): SyntaxNode | undefined {
  const parent = CST_PARENTS.get(n);
  if (parent === undefined) return undefined;
  const kids = named(parent);
  const i = kids.indexOf(n);
  return i < 0 ? undefined : kids[i + 1];
}

export type LineCarrying = { line?: number };
