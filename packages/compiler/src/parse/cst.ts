/** 我们自己声明的 CST 形状：普通记录，每节点一个对象，无方法、无父指针、无环。 */
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
  /** 本节点在父亲那里的字段名；空串 = 没有（与原生名字池的池首同一个约定） */
  fieldName: string;
  children: CsNode[];
  namedChildren: CsNode[];
};

export type CsTree = {
  rootNode: CsNode;
};
