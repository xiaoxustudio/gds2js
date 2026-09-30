export interface Loc {
  line: number;
  col: number;
}

export type LitKind = "int" | "float" | "string" | "string_name" | "bool" | "null";

export type Expr =
  | { kind: "lit"; lit: LitKind; value: string | number | bigint | boolean | null; loc: Loc }
  | { kind: "ident"; name: string; loc: Loc }
  | { kind: "binary"; op: string; left: Expr; right: Expr; loc: Loc }
  | { kind: "unary"; op: string; operand: Expr; loc: Loc }
  | { kind: "call"; callee: Expr; args: Expr[]; loc: Loc }
  | { kind: "attribute"; obj: Expr; name: string; loc: Loc }
  | { kind: "index"; obj: Expr; index: Expr; loc: Loc }
  | { kind: "array"; items: Expr[]; loc: Loc }
  | { kind: "dict"; entries: Array<{ key: Expr; value: Expr }>; loc: Loc }
  | { kind: "lambda"; params: Param[]; body: Stmt[]; loc: Loc }
  | { kind: "await"; operand: Expr; loc: Loc }
  | { kind: "is"; operand: Expr; type: TypeRef; loc: Loc }
  | { kind: "as"; operand: Expr; type: TypeRef; loc: Loc };

export type Stmt =
  | { kind: "expr"; expr: Expr; loc: Loc }
  | { kind: "var"; name: string; type: TypeRef | null; init: Expr | null; isConst: boolean; loc: Loc }
  | { kind: "assign"; target: Expr; value: Expr; loc: Loc }
  | { kind: "if"; branches: Array<{ cond: Expr | null; body: Stmt[] }>; loc: Loc }
  | { kind: "for"; var: string; iter: Expr; body: Stmt[]; loc: Loc }
  | { kind: "while"; cond: Expr; body: Stmt[]; loc: Loc }
  | { kind: "match"; subject: Expr; arms: MatchArm[]; loc: Loc }
  | { kind: "return"; value: Expr | null; loc: Loc }
  | { kind: "break"; loc: Loc }
  | { kind: "continue"; loc: Loc }
  | { kind: "pass"; loc: Loc };

export interface MatchArm {
  pattern: Pattern;
  guard: Expr | null;
  body: Stmt[];
}

export type Pattern =
  | { kind: "wildcard" }
  | { kind: "lit"; lit: LitKind; value: string | number | bigint | boolean | null }
  | { kind: "bind"; name: string }
  | { kind: "array"; items: Pattern[] }
  | { kind: "dict"; entries: Array<{ key: Expr; pattern: Pattern }> }
  | { kind: "const"; expr: Expr };

export interface Param {
  name: string;
  type: TypeRef | null;
  default: Expr | null;
}

export type TypeRef =
  | { kind: "named"; name: string }
  | { kind: "array"; item: TypeRef }
  | { kind: "variant" };

/**
 * 能用「类型名.静态成员」取值的内建类型 → 运行时里产出该成员的函数名。
 * 实测 `Vector2.UP` 合法（常量值），`String.chr(65)` 合法（静态方法调用），
 * 而裸 `Vector2` / `String` 当值是 `Identifier "..." not declared`。
 * 语义分析据此放行属性基与被调属性，emitter 据此发运行时调用。
 */
const STATIC_MEMBER_FNS: Record<string, string> = {
  Vector2: "vector2Const",
  Vector3: "vector3Const",
  Vector2i: "vector2iConst",
  Vector3i: "vector3iConst",
  Color: "colorStatic",
  String: "stringStatic",
};

/** 属性基是「带静态成员的内建类型名」时给出运行时函数名，否则 null。 */
export function staticMemberFn(e: Expr): string | null {
  return e.kind === "ident" ? (STATIC_MEMBER_FNS[e.name] ?? null) : null;
}

export interface FuncDecl {
  name: string;
  params: Param[];
  returnType: TypeRef | null;
  body: Stmt[];
  coroutine: boolean;
  isStatic: boolean;
  loc: Loc;
}

export interface VarDecl {
  name: string;
  type: TypeRef | null;
  init: Expr | null;
  isConst: boolean;
  isStatic: boolean;
  accessor: PropAccessor | null;
  loc: Loc;
}

export type PropGetter = { kind: "inline"; body: Stmt[] } | { kind: "method"; method: string };
export type PropSetter = { kind: "inline"; param: string; body: Stmt[] } | { kind: "method"; method: string };

export interface PropAccessor {
  getter: PropGetter;
  setter: PropSetter | null;
}

export interface SignalDecl {
  name: string;
  params: string[];
  loc: Loc;
}

export interface EnumMember {
  name: string;
  value: number;
}

export interface EnumDecl {
  name: string | null;
  members: EnumMember[];
  loc: Loc;
}

export interface ClassDecl {
  name: string;
  extends: string | null;
  vars: VarDecl[];
  signals: SignalDecl[];
  funcs: FuncDecl[];
  innerClasses: ClassDecl[];
  loc: Loc;
}

export interface Module {
  className: string | null;
  extends: string | null;
  topStmts: Stmt[];
  vars: VarDecl[];
  signals: SignalDecl[];
  enums: EnumDecl[];
  funcs: FuncDecl[];
  innerClasses: ClassDecl[];
}
