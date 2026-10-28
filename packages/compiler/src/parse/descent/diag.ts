import type { Tok } from "./tokens";

/**
 * 结构化语法错。新解析器**不**合成 `type:"ERROR"` 子树、也**不**置 `hasError`；
 * 畸形输入的证据全在这里，`lower` 那几处原本寄生在 ERROR 节点落点上的记号级重扫
 * （`matchMalformedScan` / `accessorTokenErr` / `recoverLiteralCall` 一族）改从这里取证。
 * 对外的可观测契约不变：Godot 原文句子 + 行号。
 */
export type SyntaxIssue = {
  at: number;
  row: number;
  column: number;
  got: string;
  expected: string[];
  context: string;
  tokens: Tok[];
  /** Godot 4.6.3 的报错原文。空串表示这一处还没有对过引擎读数，`lower` 不会替它编句子。 */
  sentence: string;
  /** 引擎点名的是哪一行（0 基）。它常常不是失败点那一行：`match` 手臂族报的是首个 pattern 的行，
   *  表头族报的是 `match` 关键字的行 —— 十条语料用例（428/429/430/433/434/435/436/437/438/439）逐条量过。 */
  reportRow: number;
  /** 响亮拒的方括号里那一段，跟着句子族走：读写器一族是 `property-setget`，其余是 `line-continuation`。 */
  code: string;
};

export const SENTENCES = {
  matchPatternExpr: "Expected expression for match pattern.",
  matchGuardColon: 'Expected ":" after "match" pattern guard.',
  matchGuardExpr: 'Expected expression for pattern guard after "when".',
  matchPatternsColon: 'Expected ":" or "when" after "match" patterns.',
  matchSubjectExpr: 'Expected expression to test after "match".',
  matchSubjectColon: 'Expected ":" after "match" expression.',
  matchEmptyBlock: 'Expected an indented block after "match" statement.',
  parenClose: 'Expected closing ")" after grouping expression.',
  accGetColonOrParen: 'Expected ":" or "(" after "get".',
  accSetParen: 'Expected "(" after "set".',
  accGetterName: 'Expected getter function name after "=".',
  accSetterName: 'Expected setter function name after "=".',
  accBlockEnd: "Expected end of indented block for property.",
  varTypeAfterColon: 'Expected type after ":"',
} as const;
export class GdSyntaxError extends Error {
  readonly issue: SyntaxIssue;

  constructor(issue: SyntaxIssue, text: string) {
    super(text);
    this.name = "GdSyntaxError";
    this.issue = issue;
  }
}
