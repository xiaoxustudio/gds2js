import { Builder } from "./builder";
import { Cursor } from "./indent";
import { GdSyntaxError, type SyntaxIssue } from "./diag";
import { lex } from "./lexer";
import type { Tok } from "./tokens";

/**
 * 解析器的公共上下文：一个记号游标 + 一个 CST 构造器 + 一处语法错收集。
 *
 * extras 的挂靠时机是这里的要紧事：`peek` / `take` 会先把 `comment` 与 `line_continuation`
 * 跨进 builder 的缓冲，但**不立刻挂**；挂到哪一层由产生式在合适的点上显式 `flush()` 决定。
 * `dedented()` 故意不跨 extras —— 顶格注释要不要把块体提前收掉，得先按它自己那行的缩进算。
 */
export class Parser {
  readonly c: Cursor;
  readonly b: Builder;
  readonly issues: SyntaxIssue[] = [];

  constructor(src: string) {
    const lexed = lex(src);
    this.b = new Builder(src);
    this.c = new Cursor(lexed.tokens);
    for (const i of lexed.issues) {
      this.issues.push({ at: i.at, row: i.row, column: i.col, got: "", expected: [], context: "lex", tokens: lexed.tokens });
      void i.message;
    }
  }

  /**
   * 把游标前的 extras 挪进 builder 缓冲，但**遇到缩出去的那一行就停**。
   *
   * 不停就会出事：`054-comments` 第 37-39 行是 `quit()` / 缩进 8 的 `# 尾部注释` / 顶格的
   * `# 文件最后一行也是注释`。一把吞到底的话游标会直接落到 EOF，`dedented()` 再也看不见
   * 顶格那行的缩进，两条注释就都被挂进函数体；而 oracle 只把第一条挂进函数体、第二条挂到 source。
   */
  private stash(): void {
    for (;;) {
      const t = this.c.peek();
      if (t.kind !== "comment" && t.kind !== "cont") return;
      if (this.c.dedented()) return;
      for (const x of this.c.skipExtrasOnRow(t.row)) {
        if (x.kind === "comment") this.b.stashComment(x);
        else this.b.stashContinuation(x);
      }
    }
  }

  peek(off = 0): Tok {
    this.stash();
    return this.c.peek(off);
  }

  take(): Tok {
    this.stash();
    return this.c.take();
  }

  atPunct(text: string, off = 0): boolean {
    this.stash();
    return this.c.atText(text, off);
  }

  atKind(kind: Tok["kind"], off = 0): boolean {
    this.stash();
    return this.c.atKind(kind, off);
  }

  atWord(text: string, off = 0): boolean {
    this.stash();
    const t = this.c.peek(off);
    return t.kind === "ident" && t.text === text;
  }

  atEof(): boolean {
    this.stash();
    return this.c.atEof();
  }

  atLineHead(): boolean {
    this.stash();
    return this.c.atLineHead();
  }

  statementEnd(): boolean {
    this.stash();
    return this.c.atStatementEnd();
  }

  /** 后面还跟不跟一个操作数：`return` 可以裸着，判据是「当前记号不是 EOF、不是新一行的行头、也不是 `,` `)` `]` `}`」。
   *  别用 `statementEnd()` —— 那个问的是「当前记号是不是本语句最后一个」，语义正好差一格。 */
  atOperand(): boolean {
    this.stash();
    if (this.c.atEof()) return false;
    if (this.c.atLineHead()) return false;
    const t = this.c.peek();
    return !(t.kind === "punct" && (t.text === "," || t.text === ")" || t.text === "]" || t.text === "}"));
  }

  dedented(): boolean {
    return this.c.dedented();
  }

  /** 块体到此为止：撞上 `_body_end`（`,` `)` `]` `}`）。 */
  atBodyEnd(): boolean {
    this.stash();
    return this.c.atBodyEnd();
  }

  /** 后面那个记号还待在同一物理行上吗。 */
  sameLine(off = 0): boolean {
    this.stash();
    return this.c.followsOnSameLine(off);
  }

  /** 游标停在 `:` 上时，判这个冒号是开一个更深的块（setget）还是接一个类型标注。 */
  colonOpensBlock(): boolean {
    this.stash();
    return this.c.colonOpensBlock();
  }

  /** 把缓冲里的 extras 挂到当前最内层节点上。块体循环在每条语句之后都要调一次，
   *  否则行尾注释会一直悬在缓冲里、等外层块体来捡（`054-comments` 第 18 行的 `# 循环体尾`）。 */
  flush(): void {
    this.b.flush();
  }

  /** 只把 row 那一行上的 extras 挂到当前节点，交回最后一个被跨过的记号（没有则 null）。
   *  冒号后、块体打开前调一次：表头行尾的注释落在声明节点上，身体首行的注释仍落在 body 里；
   *  交回的那个记号还决定块体的起点 —— `054-comments` 实测 `func bump(n):  # 签名行尾注释`
   *  的 body 起点在注释末尾（6:23）而不是冒号末尾（6:13）。 */
  flushExtrasOnRow(row: number): Tok | null {
    const skipped = this.c.skipExtrasOnRow(row);
    for (const t of skipped) {
      if (t.kind === "comment") this.b.stashComment(t);
      else this.b.stashContinuation(t);
    }
    this.b.flush();
    return skipped.length === 0 ? null : skipped[skipped.length - 1]!;
  }


  expectPunct(text: string, context: string): Tok {
    if (this.atPunct(text)) return this.take();
    return this.fail([`"${text}"`], context);
  }

  expectWord(text: string, context: string): Tok {
    if (this.atWord(text)) return this.take();
    return this.fail([`"${text}"`], context);
  }

  expectKind(kind: Tok["kind"], context: string): Tok {
    if (this.atKind(kind)) return this.take();
    return this.fail([kind], context);
  }

  fail(expected: string[], context: string): never {
    const t = this.peek();
    const issue: SyntaxIssue = {
      at: t.start,
      row: t.row,
      column: t.col,
      got: t.kind === "eof" ? "<eof>" : t.text,
      expected,
      context,
      tokens: this.c.toks,
    };
    this.issues.push(issue);
    throw new GdSyntaxError(issue, `${context}: 期望 ${expected.join(" / ")}，实得 ${JSON.stringify(issue.got)}（${String(issue.row + 1)}:${String(issue.column + 1)}）`);
  }
}
