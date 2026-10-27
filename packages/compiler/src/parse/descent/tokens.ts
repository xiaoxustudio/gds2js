export type TokKind =
  | "ident"
  | "int"
  | "float"
  | "str-start"
  | "str-content"
  | "escape"
  | "str-end"
  | "comment"
  | "region-start"
  | "region-label"
  | "region-end"
  | "cont"
  | "newline"
  | "indent"
  | "dedent"
  | "body-end"
  | "punct"
  | "eof";

export type Tok = {
  kind: TokKind;
  text: string;
  start: number;
  end: number;
  row: number;
  col: number;
};

export const KEYWORDS = new Set([
  "and",
  "as",
  "await",
  "break",
  "breakpoint",
  "class",
  "class_name",
  "const",
  "continue",
  "elif",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "for",
  "func",
  "get",
  "if",
  "in",
  "is",
  "master",
  "mastersync",
  "match",
  "not",
  "null",
  "onready",
  "or",
  "pass",
  "puppet",
  "puppetsync",
  "remote",
  "remotesync",
  "return",
  "set",
  "setget",
  "signal",
  "static",
  "true",
  "var",
  "when",
  "while",
]);

/** 长在前，短在后：`**=` 必须先于 `**` 与 `*` 试，否则 `2 **= 3` 会切成 `**` + `=`。 */
export const PUNCT = [
  "**=",
  "<<=",
  ">>=",
  "**",
  "<<",
  ">>",
  ":=",
  "->",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^=",
  "<=",
  ">=",
  "==",
  "!=",
  "&&",
  "||",
  "..",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ",",
  ":",
  ";",
  ".",
  "=",
  "+",
  "-",
  "*",
  "/",
  "%",
  "&",
  "|",
  "^",
  "~",
  "!",
  "<",
  ">",
  "@",
  "$",
];

export const OPENERS = new Set(["(", "[", "{"]);
export const CLOSERS = new Set([")", "]", "}"]);

export const TAB_WIDTH = 8;

export function isIdentStart(c: string): boolean {
  return c === "_" || /[\p{XID_Start}]/u.test(c);
}

export function isIdentPart(c: string): boolean {
  return c === "_" || /[\p{XID_Continue}]/u.test(c);
}

export function isDigit(c: string): boolean {
  return c >= "0" && c <= "9";
}
