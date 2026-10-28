import type { CsNode, CsTree } from "../cst";
import { GdSyntaxError } from "./diag";
import { Parser } from "./state";
import { parseStatementLine } from "./stmt";

/**
 * 手写递归下降解析器的入口。产物吃 `CsNode` 那十个字段、一个不多一个不少，
 * 所以 `lower/` 只改了畸形诊断那一处（`syntaxErrOf`），表达式与语句两面一行没动就接上了。
 *
 * 与 vendored 语法的一处刻意偏离：`**` 的优先级抬到 `*` `/` `%` 之上、仍左结合（Godot 4.6.3 实测口径），
 * 所以下行不需要再摆一套摊平机器去补偿 `2 * 3 ** 2` 被解成 `(2*3)**2` 那一形。
 *
 * 畸形输入**不**合成 `type:"ERROR"` 子树、也**不**置 `hasError`：证据全在 `syntaxErrors` 里，
 * `lower` 那几处原本寄生在 ERROR 落点上的记号级重扫改从那里取证，对外的 Godot 原文句子与行号不变。
 */
export function parseSync(src: string): CsTree {
  const p = new Parser(src);
  try {
    for (;;) {
      if (p.atEof()) break;
      p.flush();
      if (p.atEof()) break;
      parseStatementLine(p, false);
      p.flush();
    }
    return { rootNode: p.b.root(src.length), syntaxErrors: p.issues };
  } catch (e) {
    if (!(e instanceof GdSyntaxError)) throw e;
    return { rootNode: emptyRoot(src), syntaxErrors: p.issues };
  }
}

/** 语法错时交回一个空壳根节点：`lower` 见到 `syntaxErrors` 非空就走诊断路，不读这棵树。 */
function emptyRoot(src: string): CsNode {
  return {
    type: "source",
    text: src,
    isNamed: true,
    hasError: false,
    startIndex: 0,
    endIndex: src.length,
    startPosition: { row: 0, column: 0 },
    fieldName: "",
    children: [],
    namedChildren: [],
  };
}
