import type { Node as WasmNode } from "web-tree-sitter";
import type { CsNode, CsTree } from "./cst";

function csOf(n: WasmNode, src: string, fieldName: string): CsNode {
  const kids = n.children;
  const children: CsNode[] = [];
  for (let i = 0; i < kids.length; i++) {
    const k = kids[i] as WasmNode;
    children.push(csOf(k, src, n.fieldNameForChild(i) ?? ""));
  }
  return {
    type: n.type,
    text: src.slice(n.startIndex, n.endIndex),
    isNamed: n.isNamed,
    hasError: n.hasError,
    startIndex: n.startIndex,
    endIndex: n.endIndex,
    startPosition: { row: n.startPosition.row, column: n.startPosition.column },
    fieldName,
    children,
    namedChildren: children.filter((c) => c.isNamed),
  };
}

/** 把 web-tree-sitter 的树拍成我们自己的 CST 记录（`./cst`）：每节点一个普通对象，无方法、无父指针。 */
export function toCsTree(root: WasmNode, src: string): CsTree {
  return { rootNode: csOf(root, src, ""), syntaxErrors: [] };
}
