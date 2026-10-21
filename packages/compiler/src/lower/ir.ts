export interface Loc {
  line: number;
  col: number;
}

export type LitKind = "int" | "float" | "string" | "string_name" | "node_path" | "bool" | "null";

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

/** 能用「类型名.静态成员」取值的内建类型 → 运行时里产出该成员的函数名；语义分析据此放行属性基与被调属性，emitter 据此发运行时调用。 */
const STATIC_MEMBER_FNS: Record<string, string> = {
  Vector2: "vector2Const",
  Vector3: "vector3Const",
  Vector2i: "vector2iConst",
  Vector3i: "vector3iConst",
  Color: "colorStatic",
  String: "stringStatic",
  Callable: "callableStatic",
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
  getter: PropGetter | null;
  setter: PropSetter | null;
}

export interface SignalDecl {
  name: string;
  params: string[];
  hasDefaults: boolean;
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
  /** 用了 PackedByteArray 的 compress()/decompress() —— `--pack scriptc` 据此铺 zstd 宿主并加 `--dynamic`。 */
  usesPackCodec?: boolean;
  /** 取值记号的归属标识：记号表是进程内累积的，跨文件同 `行:列` 会同名抢号（§6 第 61 条），所以每份模块先归一个主 —— `analyze` 写、发射器读回。 */
  markOwner?: string;
  /** 这份脚本的 `extends` 链顶端挂的是不是宿主基类（跨文件工程才判得出）：判定式子与发射器那条 `hostBaseInChain` 同一条，分析器据此给不给宿主裸方法名那张表（S370 的读数）。 */
  hostChain?: boolean;
}
