import type { LexTok } from "./lexer";
import { CLOSERS, OPENERS } from "./tokens";

export type LineSpan = { row: number; indent: number; from: number; to: number };

/**
 * 把 raw 记号流按物理行折成逻辑行：空行与纯空白行不产逻辑行，`\` 续行把两行接成一行
 * （lexer 侧就不给续行后的首个记号打 lineStart）。每行记下数值缩进（空格 1、tab 8，照 scanner.c 的口径）。
 */
export function groupLines(toks: LexTok[]): LineSpan[] {
  const lines: LineSpan[] = [];
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i]!;
    if (t.kind === "eof") continue;
    if (t.lineStart || lines.length === 0) lines.push({ row: t.row, indent: t.indent, from: i, to: i + 1 });
    else lines[lines.length - 1]!.to = i + 1;
  }
  return lines;
}

/**
 * 缩进游标：INDENT / DEDENT / NEWLINE 不作为记号预先发射，而是解析器在语法真要它们的位置上来问。
 *
 * 这不是偷懒，是被语料逼出来的：tree-sitter 的扫描器靠 `valid_symbols[INDENT]` 按语法上下文闸门，
 * 同一个「下一行缩进更深」在不同位置结论不同。两例实证——
 *   - `325-eol-before-elif-colon`：`elif b` 换行接顶格的 `:`，再换行接 `print(2)`。oracle 只有一个块体，
 *     因为 `:` 那个位置语法不接受 `_indent`，缩进 16 的那行不产 INDENT，块体从缩进 24 那行才开。
 *   - `235-object-identity-keys` 第 64-65 行：`print("22|", l == (func(y):` 括号里套 lambda 体，
 *     oracle 照样在括号内发 INDENT —— scanner.c 的 `within_brackets`（:246-248）算出来根本没被用过，
 *     真正的判据始终是 `valid_symbols`。
 * 所以任何「先扫一遍把 indent/dedent 插进记号流」的做法都必然在这两类形状上出错，只能按需查询。
 */
export class Cursor {
  readonly toks: LexTok[];
  readonly lines: LineSpan[];
  private readonly lineOf: Int32Array;
  private readonly stack: number[] = [0];
  private bracketDepth = 0;
  i = 0;

  constructor(toks: LexTok[]) {
    this.toks = toks;
    this.lines = groupLines(toks);
    this.lineOf = new Int32Array(toks.length);
    for (let li = 0; li < this.lines.length; li++) {
      const l = this.lines[li]!;
      for (let k = l.from; k < l.to; k++) this.lineOf[k] = li;
    }
    for (let k = 0; k < toks.length; k++) if (toks[k]!.kind === "eof") this.lineOf[k] = this.lines.length - 1;
  }

  peek(off = 0): LexTok {
    return this.toks[Math.min(this.i + off, this.toks.length - 1)]!;
  }

  take(): LexTok {
    const t = this.peek();
    if (OPENERS.has(t.text)) this.bracketDepth++;
    else if (CLOSERS.has(t.text) && this.bracketDepth > 0) this.bracketDepth--;
    if (this.i < this.toks.length - 1) this.i++;
    return t;
  }

  atText(text: string, off = 0): boolean {
    const t = this.peek(off);
    return t.kind === "punct" && t.text === text;
  }

  atKind(kind: LexTok["kind"], off = 0): boolean {
    return this.peek(off).kind === kind;
  }

  atEof(): boolean {
    return this.peek().kind === "eof";
  }

  get depth(): number {
    return this.bracketDepth;
  }

  get indentDepth(): number {
    return this.stack.length - 1;
  }

  lineIndex(off = 0): number {
    return this.lineOf[Math.min(this.i + off, this.toks.length - 1)]!;
  }

  /** 当前记号是不是它那一逻辑行的头一个；括号内不算，因为括号里的换行不结语句。 */
  atLineHead(): boolean {
    const t = this.peek();
    return t.kind !== "eof" && this.bracketDepth === 0 && t.lineStart;
  }

  /** 当前记号是不是这条语句的最后一个：`_simple_statements` 收在 `_newline` 或 `_body_end`（`,` `)` `]` `}`）上，或者撞上 EOF。 */
  atStatementEnd(): boolean {
    const t = this.peek();
    if (t.kind === "eof") return true;
    if (t.kind === "punct" && (CLOSERS.has(t.text) || t.text === ",")) return true;
    return this.nextIsNewLine();
  }

  /** 下一个记号落在了更靠后的逻辑行上（括号内不算，`\` 续行接起来的两行也不算）。 */
  nextIsNewLine(): boolean {
    if (this.bracketDepth > 0) return false;
    const n = this.peek(1);
    return n.kind === "eof" ? !this.atEof() : n.lineStart;
  }

  /**
   * 本逻辑行的有效缩进。顶格整行注释若身处块内、且紧随其后的内容行缩进大于 0，
   * 按 `stack[1]`（最外层非零缩进）算，这样函数尾部的顶格注释不会把块提前 DEDENT 掉
   * （scanner.c:336-396 那段；`#region` / `#endregion` 在 lexer 侧就已经不是 comment 种类，天然豁免）。
   */
  lineIndent(li: number): number {
    const line = this.lines[li];
    if (line === undefined) return 0;
    const first = this.toks[line.from]!;
    if (first.kind !== "comment" || first.indent !== 0 || this.stack.length <= 1 || this.stack[1]! <= 0) return first.indent;
    const after = this.lines[li + 1];
    const next = after === undefined ? 0 : this.toks[after.from]!.indent;
    return next > 0 ? this.stack[1]! : first.indent;
  }

  /** 当前逻辑行的有效缩进低于栈顶 ⇒ 块体到此结束。 */
  dedented(): boolean {
    if (this.atEof()) return this.stack.length > 1;
    return this.lineIndent(this.lineIndex()) < this.stack[this.stack.length - 1]!;
  }

  /**
   * 冒号之后开块体：冒号后同一行就有内容是内联体（返回假）；否则看当前记号所在行的有效缩进，
   * 比栈顶深就压栈（返回真，游标已经在块体首个记号上，不用挪）。
   *
   * 判据取的是**栈顶**而不是表头行的缩进，所以 `325-eol-before-elif-colon` 那形——
   * `elif b` 换行接缩进 8 的 `:`、再换行接缩进 16 的身体——只压一层：缩进 8 那行从头到尾没人来问它。
   * 这正是 tree-sitter 靠 `valid_symbols[INDENT]` 得到的结论。
   * 空行不成逻辑行，所以 `func f():` 与身体之间夹空行也照常开块。
   */
  openBlock(): boolean {
    const here = this.lineIndex();
    const header = this.lineOf[Math.max(this.i - 1, 0)]!;
    if (here === header) return false;
    const want = this.lineIndent(here);
    if (want <= this.stack[this.stack.length - 1]!) return false;
    this.stack.push(want);
    return true;
  }

  closeBlock(): void {
    if (this.stack.length > 1) this.stack.pop();
  }

  /** 把游标推进到下一逻辑行的头一个记号；已经在最后一行则停住。 */
  stepLine(): void {
    const next = this.lineIndex() + 1;
    const line = this.lines[next];
    if (line !== undefined) this.i = line.from;
    else this.i = this.toks.length - 1;
  }
}
