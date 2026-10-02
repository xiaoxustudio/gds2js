/**
 * 我们自己声明的 CST 形状（#14）。
 *
 * 两道来由，都量过、不是推的：
 * - `lower` 直接吃 web-tree-sitter 的 `Tree`，那个包名就顺着签名流进整条链，
 *   `scriptc coverage` 里 `uses of 'lower' inherit the blocker`（SC2004）就是这么来的（S227）。
 * - 「接口 + 类实现」的边界在静态目标上**不成立**：把类实例交给记录类型的形参会被
 *   `SC2002 record shapes must match exactly or width-coerce … 请建一个字面量` 拒掉（S231）。
 *   所以这里的 CST 是**普通记录**：每节点一个对象，无方法、无父指针、无环。
 *
 * 成员集合照 `lower` 真正用到的来（S228 数出来的）：`type / text / children / namedChildren /
 * isNamed / hasError / startPosition`；再加 `fieldName` —— 「这个孩子在父亲那里的字段名」，
 * 让 `field()` 在 `children` 里找它，代替 wasm 的 `childForFieldName` 方法（S231）。
 * `startIndex / endIndex` 是 JS 码元下标（`.text` 靠它切源码），`parent` 刻意不要：`lower` 没用过它。
 */
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
