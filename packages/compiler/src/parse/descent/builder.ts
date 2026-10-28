import type { CsNode } from "../cst";
import type { Tok } from "./tokens";

export type Pos = { index: number; row: number; col: number };

type Draft = { type: string; isNamed: boolean; children: CsNode[]; start: Pos | null; end: number | null };

export const posOf = (t: Tok): Pos => ({ index: t.start, row: t.row, col: t.col });

function mk(src: string, type: string, isNamed: boolean, fieldName: string, start: Pos, end: number, children: CsNode[]): CsNode {
  return {
    type,
    text: src.slice(start.index, end),
    isNamed,
    hasError: false,
    startIndex: start.index,
    endIndex: end,
    startPosition: { row: start.row, column: start.col },
    fieldName,
    children,
    namedChildren: children.filter((c) => c.isNamed),
  };
}

/**
 * CST 构造器。产物形状照抄 `parse/wasm-cst.ts:4-23`：每节点一个普通对象、无方法、无父指针，
 * `text = src.slice(startIndex, endIndex)`、`namedChildren = children.filter(isNamed)`、`hasError` 恒假。
 *
 * 匿名节点的 `type` 就是记号原文（tree-sitter 对字符串字面量的口径），所以标点直接拿 `tok.text` 当类型。
 *
 * extras（`comment` 与 `line_continuation`）先攒在缓冲里，由 `flush()` 挂到当时最内层的具名节点上。
 * 这是为了复刻 tree-sitter 的挂靠规则：extra 落在「当时还没归约完的最内层节点」里，
 * 所以语句产生式**收尾时不 flush**，行尾注释就自然冒泡给外层块体（实测 `print(x)  # tail`
 * 的注释是 `body` 的孩子、不是 `expression_statement` 的）。
 */
export class Builder {
  private readonly stack: Draft[] = [];
  private pending: CsNode[] = [];

  constructor(readonly src: string, rootType = "source") {
    this.stack.push({ type: rootType, isNamed: true, children: [], start: null, end: null });
  }

  open(type: string, start: Pos | null = null): void {
    this.stack.push({ type, isNamed: true, children: [], start, end: null });
  }

  /** `alias($.parameters, "()")` 那类：别名是标点串，tree-sitter 把它当匿名节点，即便它有孩子。 */
  openAnon(type: string, start: Pos | null = null): void {
    this.stack.push({ type, isNamed: false, children: [], start, end: null });
  }

  close(fieldName = ""): CsNode {
    const d = this.stack.pop();
    if (d === undefined) throw new Error("builder 栈空了");
    const first = d.children[0];
    const last = d.children[d.children.length - 1];
    const start =
      d.start ??
      (first === undefined ? null : { index: first.startIndex, row: first.startPosition.row, col: first.startPosition.column });
    if (start === null) throw new Error(`节点 ${d.type} 既没有孩子也没有显式起点`);
    const node = mk(this.src, d.type, d.isNamed, fieldName, start, d.end ?? (last === undefined ? start.index : last.endIndex), d.children);
    const parent = this.stack[this.stack.length - 1];
    if (parent !== undefined) parent.children.push(node);
    return node;
  }

  private top(): Draft {
    const d = this.stack[this.stack.length - 1];
    if (d === undefined) throw new Error("builder 栈空了");
    return d;
  }

  anon(tok: Tok, fieldName = ""): void {
    this.flush();
    this.top().children.push(mk(this.src, tok.text, false, fieldName, posOf(tok), tok.end, []));
  }

  /** 匿名节点的**类型**不等于记号原文时用这个：`string` 两端的定界符被 grammar.js:127,129 别名成固定的 `"`，
   *  `string_name` 的头别名成 `&"`、`node_path` 的头别名成 `^"`，而文本仍是源码原文（`'` / `"""` / `r"` / `@"`）。 */
  anonAs(type: string, tok: Tok, fieldName = ""): void {
    this.flush();
    this.top().children.push(mk(this.src, type, false, fieldName, posOf(tok), tok.end, []));
  }

  leaf(type: string, tok: Tok, fieldName = ""): void {
    this.flush();
    this.top().children.push(mk(this.src, type, true, fieldName, posOf(tok), tok.end, []));
  }

  attach(node: CsNode, fieldName: string): void {
    node.fieldName = fieldName;
    this.top().children.push(node);
  }

  setLastField(fieldName: string): void {
    const d = this.top();
    const last = d.children[d.children.length - 1];
    if (last === undefined) throw new Error("没有可改字段名的孩子");
    last.fieldName = fieldName;
  }

  /** 摘下刚挂上去的那一个孩子。优先级爬升要靠它把已建好的左操作数搬进新的 `binary_operator`。 */
  liftLast(): CsNode {
    const node = this.top().children.pop();
    if (node === undefined) throw new Error("没有可摘的孩子");
    return node;
  }

  mark(): number {
    return this.top().children.length;
  }

  /** 显式钉住节点的终点。`get_node` 要用：grammar.js:177-178,186 的路径段是隐藏的 `$._identifier`，
   *  不落孩子，但 oracle 的节点范围**含**它们（`$Child/Grand` 的 text 就是整段），只按最后一个孩子算会短一截。 */
  setEnd(tok: Tok): void {
    this.top().end = tok.end;
  }

  /** 把 mark 之后挂上去的孩子摘成一个节点交回来。`pair` 与 `assignment` 那类要先建左支、
   *  看见 `:` / `=` 才知道自己是个 pair / assignment 的形状靠它。 */
  spliceFrom(mark: number): CsNode {
    const kids = this.top().children.splice(mark);
    if (kids.length !== 1) throw new Error(`spliceFrom 期望恰好一个孩子，实得 ${String(kids.length)}`);
    return kids[0]!;
  }

  spliceAll(mark: number): CsNode[] {
    return this.top().children.splice(mark);
  }

  /**
   * 把缓冲里的 extras 挂到当前最内层节点上。只有 `anon` / `anonAs` / `leaf` 三个**终结符**入口自动冲，
   * `open` / `attach` 故意不冲 —— 否则 `wrap` 打开 `expression_statement` 时会先把行尾注释冲到块体里，
   * 注释就排到语句前面去了（oracle 是排在后面）。
   * 这条规则同时给出两个实测结论：
   *   - `var x = 1 + \` 换行接 `2`：续行记号在取右操作数时被跨过，随后 `leaf("integer")` 冲刷，
   *     于是 `line_continuation` 落在 `binary_operator` 里、位置在 `op` 与 `right` 之间（oracle 同形）；
   *   - `var x = 1  # 尾注释`：注释在探测 setget 的 `:` 时才被跨过，此后本节点不再挂任何孩子，
   *     缓冲一路悬着，最后由外层块体循环冲到自己的 body / source 上（oracle 同形）。
   * `close` 故意不冲：节点收尾时还悬着的 extras 属于父节点，不属于它。
   */
  flush(): void {
    if (this.pending.length === 0) return;
    for (const n of this.pending) this.top().children.push(n);
    this.pending = [];
  }

  stashComment(tok: Tok): void {
    this.pending.push(mk(this.src, "comment", true, "", posOf(tok), tok.end, []));
  }

  stashContinuation(tok: Tok): void {
    this.pending.push(mk(this.src, "line_continuation", true, "", posOf(tok), tok.end, []));
  }

  get pendingCount(): number {
    return this.pending.length;
  }

  /** 根节点的范围要盖到源码末尾：oracle 的 `source` 含结尾那个隐藏的 `_newline`，
   *  所以文件以换行收尾时它的 `endIndex` 就是 `src.length`，`text` 带着那个换行。 */
  root(endIndex: number): CsNode {
    if (this.stack.length !== 1) throw new Error(`builder 收尾时栈深 ${String(this.stack.length)}，应为 1`);
    this.flush();
    const node = this.close("");
    node.endIndex = endIndex;
    node.text = this.src.slice(node.startIndex, endIndex);
    return node;
  }
}
