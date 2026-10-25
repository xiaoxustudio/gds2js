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
};
