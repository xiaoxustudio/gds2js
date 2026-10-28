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
};
export class GdSyntaxError extends Error {
  readonly issue: SyntaxIssue;

  constructor(issue: SyntaxIssue, text: string) {
    super(text);
    this.name = "GdSyntaxError";
    this.issue = issue;
  }
}
