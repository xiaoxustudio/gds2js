import type { SyntaxIssue } from "./descent/diag";

export type CsPoint = {
  row: number;
  column: number;
};

export type CsNode = {
  type: string;
  text: string;
  isNamed: boolean;
  hasError: boolean;
  startIndex: number;
  endIndex: number;
  startPosition: CsPoint;
  fieldName: string;
  children: CsNode[];
  namedChildren: CsNode[];
};

export type CsTree = {
  rootNode: CsNode;
  /** 畸形输入的证据放这里，不在树上合成 `ERROR` 子树、也不置 `hasError`。
   *  必填不留可选：阶段边界门的口径就是「阶段事实不挂可选侧信道」。 */
  syntaxErrors: SyntaxIssue[];
};
