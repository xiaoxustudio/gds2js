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
  /** 手写解析器把畸形输入的证据放这里，而不是像 tree-sitter 那样在树上合成 `ERROR` 子树。
   *  必填不留可选：阶段边界门的口径就是「阶段事实不挂可选侧信道」。旧解析路恒交空数组。 */
  syntaxErrors: SyntaxIssue[];
};
