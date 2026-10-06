import { staticMemberFn } from "./ir";
import { isGlobalConst } from "./globals";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { GLOBAL_VALUE_NAMES } from "@gds2js/runtime/runtime/global-names";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, Stmt, TypeRef, VarDecl } from "./ir";

export interface Diagnostic {
  code: string;
  message: string;
  loc: Loc;
}

interface Decl {
  vars: Array<{ name: string }>;
  signals: Array<{ name: string }>;
  funcs: Array<{ name: string }>;
  innerClasses: Array<{ name: string }>;
}

class Scope {
  constructor(
    private vars: Set<string>,
    private parent: Scope | null,
    private selfOk?: boolean,
  ) {}

  has(name: string): boolean {
    return this.vars.has(name) || (this.parent !== null && this.parent.has(name));
  }

  allowsSelf(): boolean {
    return this.selfOk ?? (this.parent !== null && this.parent.allowsSelf());
  }

  child(names: string[], selfOk?: boolean): Scope {
    return new Scope(new Set(names), this, selfOk);
  }

  declare(name: string): void {
    this.vars.add(name);
  }
}

type StaticType =
  | "int"
  | "float"
  | "String"
  | "bool"
  | "null"
  | "Array"
  | "Dictionary"
  /** 值类型（槽矩阵按这些名字说话；`staticType` 只折构造调用那一形） */
  | "Vector2"
  | "Vector2i"
  | "Vector3"
  | "Vector3i"
  | "Color"
  /** `&"…"` 字面量在槽位文本里就叫这个名字：`staticType` 把它并进 `String`，只有槽位这一族经 `slotSource` 看得见它 */
  | "StringName"
  | null;

function declNames(d: Decl): string[] {
  return [
    ...d.vars.map((v) => v.name),
    ...d.signals.map((s) => s.name),
    ...d.funcs.map((f) => f.name),
    ...d.innerClasses.map((c) => c.name),
  ];
}

export function analyze(m: Module, globals: Set<string> = new Set<string>()): Diagnostic[] {
  const diags: Diagnostic[] = [];

  const enumNames: string[] = [];
  for (const en of m.enums) {
    if (en.name) enumNames.push(en.name);
    else for (const mm of en.members) enumNames.push(mm.name);
  }

  const globalScope = new Scope(
    new Set([...(m.className ? [m.className] : []), ...declNames(m), ...enumNames, ...globals]),
    null,
  );
  const moduleScope = globalScope.child(declNames(m));
  const coroutines = new Set(m.funcs.filter((f) => f.coroutine).map((f) => f.name));
  const classes = classTable(m);
  const classScopeBase = new Scope(
    new Set([
      ...(m.className ? [m.className] : []),
      ...m.vars.filter((v) => v.isConst).map((v) => v.name),
      ...m.innerClasses.map((c) => c.name),
      ...enumNames,
      ...globals,
    ]),
    null,
  );

  for (const f of m.funcs) checkFunc(f, moduleScope, coroutines, diags);
  for (const c of m.innerClasses) checkClass(c, classScopeBase, diags, classes);
  checkStaticAccess(m.funcs, m.vars, diags);
  checkClassFuncVisibility(m, diags);
  checkTypedCollections(m, diags);
  checkTypedIndexSlots(m, diags);
  checkVoidMethodValues(m, diags);
  checkConstAssign(m, diags);
  checkPackIsAs(m, diags);
  checkPackArgSlots(m, diags);
  checkFuncArgSlots(m, new Set(globals), diags);
  checkTypedVarAssign(m, diags);
  checkInitContracts(m, new Set(globals), diags);
  recordInitValueReads(m, moduleScope, coroutines);

  return diags;
}

/** 字段初值不在 `checkFunc` 的作用域走查里，这里只补记「全局函数取值点」，诊断一律丢进一张空表：多记无害，发射器那几支成员分支排在前面会先接住。 */
function recordInitValueReads(m: Module, scope: Scope, coroutines: Set<string>): void {
  const scratch: Diagnostic[] = [];
  const walkVars = (list: VarDecl[]): void => {
    for (const v of list) if (v.init !== null) walkExpr(v.init, scope, coroutines, scratch);
  };
  const walkClasses = (list: ClassDecl[]): void => {
    for (const c of list) {
      walkVars(c.vars);
      walkClasses(c.innerClasses);
    }
  };
  walkVars(m.vars);
  walkClasses(m.innerClasses);
}

function checkTypedCollections(m: Module, diags: Diagnostic[]): void {
  const targets: Array<{ type: TypeRef | null; init: Expr | null; loc: Loc }> = [
    ...m.vars.map((v) => ({ type: v.type, init: v.init, loc: v.loc })),
    ...m.funcs.flatMap((f) => [
      ...f.params.map((p) => ({ type: p.type, init: p.default, loc: f.loc })),
      { type: f.returnType, init: null, loc: f.loc },
    ]),
  ];
  const collect = (cls: ClassDecl): void => {
    for (const v of cls.vars) targets.push({ type: v.type, init: v.init, loc: v.loc });
    for (const f of cls.funcs) {
      for (const p of f.params) targets.push({ type: p.type, init: p.default, loc: f.loc });
      targets.push({ type: f.returnType, init: null, loc: f.loc });
    }
    for (const inner of cls.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  const walkStmts = (stmts: Stmt[]): void => {
    for (const s of stmts) {
      if (s.kind === "var") targets.push({ type: s.type, init: s.init, loc: s.loc });
      else if (s.kind === "if") for (const b of s.branches) walkStmts(b.body);
      else if (s.kind === "for" || s.kind === "while") walkStmts(s.body);
    }
  };
  for (const f of m.funcs) walkStmts(f.body);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) walkStmts(f.body);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  for (const t of targets) {
    if (t.type === null || t.type.kind !== "named") continue;
    const m2 = /^(Array|Dictionary)\[(.+)\]$/.exec(t.type.name);
    if (m2 === null) continue;
    const inner = m2[2] ?? "";
    if (inner.includes("[")) {
      diags.push({
        code: "typed-collection-nested",
        message: `Nested typed collections are not supported.（${t.type.name}）`,
        loc: t.loc,
      });
      continue;
    }
    if (t.init === null) continue;
    const slots: Array<{ exprs: Expr[]; kind: string }> = [];
    if (m2[1] === "Array") {
      if (t.init.kind === "array") slots.push({ exprs: t.init.items, kind: inner.trim() });
    } else {
      const parts = inner.split(",").map((p) => p.trim());
      const keyKind = parts[0] ?? "";
      const valKind = parts[1] ?? "";
      if (t.init.kind === "dict" && parts.length === 2) {
        slots.push({ exprs: t.init.entries.map((e) => e.key), kind: keyKind });
        slots.push({ exprs: t.init.entries.map((e) => e.value), kind: valKind });
      }
    }
    for (const slot of slots) {
      for (const it of slot.exprs) {
        const st = slotSource(it);
        if (st === null) continue;
        if (!canHold(slot.kind, st)) {
          diags.push({
            code: "typed-collection-literal",
            message: `Cannot include a value of type "${st}" as "${slot.kind}".`,
            loc: it.loc,
          });
        }
      }
    }
  }
}

/** 静态类型能不能装进某个元素/键/值的槽（与运行时 elemConvert 同一张表；float→int 允许，运行时会截断） */
function canHold(kind: string, st: NonNullable<StaticType>): boolean {
  switch (kind) {
    case "int":
    case "float":
      return st === "int" || st === "float" || st === "bool";
    case "bool":
      return st === "bool" || st === "int" || st === "float";
    case "String":
      // `Array[String] = [&"abc"]` 收：元素被折成 String。
      return st === "String" || st === "StringName";
    case "StringName":
      return valueSlotHolds(kind, st);
    case "Vector2":
    case "Vector2i":
    case "Vector3":
    case "Vector3i":
    case "Color":
      return valueSlotHolds(kind, st);
    case "Array":
      return st === "Array";
    case "Dictionary":
      return st === "Dictionary";
    default:
      return true;
  }
}

type TypedSlot = { decl: string; kind: "Array" | "Dictionary"; elem?: string; key?: string; val?: string };

/** 从标注里读出槽位。读不出来（不是容器、嵌套定型）就不管 —— 嵌套那条由 `typed-collection-nested` 报。 */
function parseTyped(name: string): TypedSlot | null {
  const m = /^(Array|Dictionary)\[(.+)\]$/.exec(name);
  if (m === null) return null;
  const inner = m[2] as string;
  if (inner.includes("[")) return null;
  if (m[1] === "Array") return { decl: name, kind: "Array", elem: inner.trim() };
  const parts = inner.split(",").map((p) => p.trim());
  if (parts.length !== 2) return null;
  return { decl: name, kind: "Dictionary", key: parts[0] as string, val: parts[1] as string };
}

function checkTypedIndexSlots(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);

  const stOf = (e: Expr, decls: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const d = decls.get(e.name);
      return d === undefined ? null : (d as NonNullable<StaticType>);
    }
    return slotSource(e);
  };

  const badKey = (slot: TypedSlot, index: Expr, decls: Map<string, string>): void => {
    if (slot.kind !== "Dictionary" || slot.key === undefined) return;
    const st = stOf(index, decls);
    if (st === null || st === "null") return;
    if (canHold(slot.key, st)) return;
    diags.push({
      code: "typed-index-key",
      message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
      loc: index.loc,
    });
  };

  const walkExpr = (e: Expr, typed: Map<string, TypedSlot>, decls: Map<string, string>): void => {
    switch (e.kind) {
      case "index": {
        if (e.obj.kind === "ident") {
          const slot = typed.get(e.obj.name);
          if (slot !== undefined) badKey(slot, e.index, decls);
        }
        walkExpr(e.obj, typed, decls);
        walkExpr(e.index, typed, decls);
        return;
      }
      case "binary":
        walkExpr(e.left, typed, decls);
        walkExpr(e.right, typed, decls);
        return;
      case "unary":
        walkExpr(e.operand, typed, decls);
        return;
      case "call":
        walkExpr(e.callee, typed, decls);
        for (const a of e.args) walkExpr(a, typed, decls);
        return;
      case "attribute":
        walkExpr(e.obj, typed, decls);
        return;
      case "array":
        for (const it of e.items) walkExpr(it, typed, decls);
        return;
      case "dict":
        for (const en of e.entries) {
          walkExpr(en.key, typed, decls);
          walkExpr(en.value, typed, decls);
        }
        return;
      case "await":
        walkExpr(e.operand, typed, decls);
        return;
      default:
        return;
    }
  };

  const valueMsg = (slotKind: string, value: Expr, index: Expr, decls: Map<string, string>): void => {
    const st = stOf(value, decls);
    if (st === null || st === "null") return;
    if (canHold(slotKind, st)) return;
    const literalIndex = index.kind === "lit";
    if (literalIndex) {
      diags.push({
        code: "typed-index-value",
        message: `Cannot assign a value of type "${st}" as "${slotKind}".`,
        loc: value.loc,
      });
    }
    diags.push({
      code: "typed-index-assign",
      message: `Value of type "${st}" cannot be assigned to a variable of type "${slotKind}".`,
      loc: value.loc,
    });
  };

  const walkStmts = (stmts: Stmt[], typed: Map<string, TypedSlot>, decls: Map<string, string>): void => {
    for (const s of stmts) {
      switch (s.kind) {
        case "var": {
          if (s.type !== null && s.type.kind === "named") {
            const slot = parseTyped(s.type.name);
            if (slot !== null) typed.set(s.name, slot);
            else {
              const scalar = scalarStaticName(s.type.name);
              if (scalar !== null) decls.set(s.name, scalar);
            }
          }
          if (s.init !== null) walkExpr(s.init, typed, decls);
          continue;
        }
        case "assign": {
          let handledTarget = false;
          if (s.target.kind === "index" && s.target.obj.kind === "ident") {
            const slot = typed.get(s.target.obj.name);
            if (slot !== undefined) {
              handledTarget = true;
              badKey(slot, s.target.index, decls);
              const kind = slot.kind === "Array" ? slot.elem : slot.val;
              if (kind !== undefined) valueMsg(kind, s.value, s.target.index, decls);
            }
          }
          if (!handledTarget) walkExpr(s.target, typed, decls);
          walkExpr(s.value, typed, decls);
          continue;
        }
        case "expr":
          walkExpr(s.expr, typed, decls);
          continue;
        case "return":
          if (s.value !== null) walkExpr(s.value, typed, decls);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) walkExpr(b.cond, typed, decls);
            walkStmts(b.body, typed, decls);
          }
          continue;
        case "for":
          walkExpr(s.iter, typed, decls);
          walkStmts(s.body, typed, decls);
          continue;
        case "while":
          walkExpr(s.cond, typed, decls);
          walkStmts(s.body, typed, decls);
          continue;
        case "match":
          walkExpr(s.subject, typed, decls);
          for (const arm of s.arms) {
            if (arm.guard !== null) walkExpr(arm.guard, typed, decls);
            walkStmts(arm.body, typed, decls);
          }
          continue;
        default:
          continue;
      }
    }
  };

  for (const body of bodies) walkStmts(body, new Map(), new Map());
}

/** Array / Dictionary 上返回 void 的方法：取它们的返回值时 Godot 在解析期报 `Cannot get return value of call to "append()" because it returns "void".`。`insert` 与 `resize` 给状态码 int、`pop_back`/`pop_front`/`pop_at` 给元素、`Dictionary.erase` 给 bool、`Dictionary.get` 给值 —— 都不是 void，别顺手加进来。 */
const VOID_ARRAY_METHODS = new Set(["append", "push_front", "push_back", "remove_at", "clear", "fill", "erase"]);
const VOID_DICT_METHODS = new Set(["clear"]);
/** pack 那一侧的 void 集合，与 Array 那张**不是**同一张表：`append` 返回 bool、`insert` / `resize` 返回 Error 状态码，都不是 void。 */
const VOID_BYTES_METHODS = new Set(["append_array", "remove_at", "fill", "set"]);
/** 只在零参时才是 void 的 pack 方法。 */
const VOID_BYTES_ZEROARG = new Set(["sort", "reverse"]);
/** 脚本对象接收者那一侧：只有 `set`，取值是解析期拒（与 pack 的 `set` 同一句）。`get` 返回 Variant、`call` / `callv` 都有返回值，`free()` 是运行期的事，都不在这张表里。 */
const VOID_OBJECT_METHODS = new Set(["set"]);
/** Signal 接收者那一侧：`emit()` 与 `disconnect()` 都是 void，取值是解析期那一句；`connect()` **不是** void —— 它返回 Error 状态码 int。 */
const VOID_SIGNAL_METHODS = new Set(["emit", "disconnect"]);
/** Callable 值位置上的 void 方法：`var v = c.call_deferred(1)` 这一格。 */
const VOID_CALLABLE_METHODS = new Set(["call_deferred"]);
/** Signal 上**没有**这个名字，而且是解析期两句：`Cannot find member "is_valid" in base "Signal".` + `Function "is_valid()" not found in base Signal.`（第二句的 `Signal` 不带引号）。`has_method` / `get_method_list` / `is_connected_to` 那几格不同形：解析期放过、运行期才给 `Invalid call. Nonexistent function …`。 */
const SIGNAL_PARSE_MISSING = new Set(["is_valid"]);
/** 九种 Packed*Array 的名字：接收者是它们之一时按 pack 那一侧的判据走，九种的表口径一致。 */
const PACK_SHAPE_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedColorArray",
]);

type ContainerShape = "Array" | "Dictionary" | "Pack" | "Object" | "Signal" | "Callable";

/** 给定型变量赋值的静态判定：不合式的组合在 Godot 是解析期错，形体与定型容器那族一模一样 —— 实参是字面量报两条（先槽位后赋值），实参是变量只报赋值那条。判不出来的组合返回 null 不报 —— 误拦合法工程比漏报更糟。 */
function varSlotHolds(slot: string, st: NonNullable<StaticType>): boolean | null {
  // StringName 字面量在标量槽上与 String 同侧：int / float / bool 三个槽两句拒（`Cannot assign a value of type "StringName" as "int".` 那一形），String 槽收并折成 String。
  switch (slot) {
    case "int":
      if (st === "int" || st === "float" || st === "bool") return true;
      if (st === "String" || st === "StringName" || st === "null") return false;
      return null;
    case "float":
      if (st === "int" || st === "float") return true;
      if (st === "null" || st === "String" || st === "StringName") return false;
      return null;
    case "bool":
      if (st === "bool" || st === "int") return true;
      if (st === "null" || st === "String" || st === "StringName") return false;
      return null;
    case "String":
      if (st === "String" || st === "StringName") return true;
      if (st === "int" || st === "float" || st === "bool" || st === "null") return false;
      return null;
    case "Vector2":
    case "Vector2i":
    case "Vector3":
    case "Vector3i":
    case "Color":
    case "StringName":
      return valueSlotHolds(slot, st);
    default:
      return null;
  }
}

/** 值类型槽的矩阵：同型必进，`WIDEN` 里是仅有的会转换组合（i 族与 float 族互升、Color 吃 int 与 String、StringName 吃 String），其余组合 Godot 在解析期就拒。容器元素槽与变量 / 字段槽是同一张表，两侧共用这一个判据。 */
function valueSlotHolds(slot: string, st: NonNullable<StaticType>): boolean {
  const WIDEN: Record<string, string[]> = {
    Vector2: ["Vector2", "Vector2i"],
    Vector2i: ["Vector2i", "Vector2"],
    Vector3: ["Vector3", "Vector3i"],
    Vector3i: ["Vector3i", "Vector3"],
    Color: ["Color", "int", "String"],
    StringName: ["StringName", "String"],
  };
  const ok = WIDEN[slot];
  return ok !== undefined && ok.includes(st);
}

function checkTypedVarAssign(m: Module, diags: Diagnostic[]): void {
  /** 也管值类型槽：`var c: Color = Vector3(1, 2, 3)` 这类 Godot 在解析期就两句拒 */
  const scalarType = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    if (base === "int" || base === "float" || base === "bool" || base === "String") return base;
    // StringName 不进 STATIC_VALUE_TYPES（那张表还喂 `staticType` 的构造调用折算，别顺带改那边的口径），但它的变量 / 字段槽两句拒成立
    if (base === "StringName") return base;
    return STATIC_VALUE_TYPES.has(base) ? base : null;
  };

  /** 表达式静态判得出什么类型：ident 查槽表，其余走 `slotSource`（值类型构造调用与 StringName 字面量都在里面） */
  const staticOf = (e: Expr, d: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const t = d.get(e.name);
      return t === undefined ? null : (t as NonNullable<StaticType>);
    }
    return slotSource(e);
  };

  /** 「声明带初值」那一格发**两句**：先 `Cannot assign a value of type "X" as "Y".`，再带变量名的 `… to variable "fd" with specified type Color.`；局部变量与模块 / 成员字段同一形、两句同序，判不出来就一句都不发。 */
  const declRefuse = (name: string, slot: string, init: Expr, slots: Map<string, string>): void => {
    const st = staticOf(init, slots);
    if (st === null || varSlotHolds(slot, st) !== false) return;
    diags.push({
      code: "typed-var-value",
      message: `Cannot assign a value of type "${st}" as "${slot}".`,
      loc: init.loc,
    });
    diags.push({
      code: "typed-var-assign",
      message: `Cannot assign a value of type ${st} to variable "${name}" with specified type ${slot}.`,
      loc: init.loc,
    });
  };

  const checkBody = (body: Stmt[], outer: Map<string, string>): void => {
    const decls = new Map(outer);
    const stmt = (s: Stmt): void => {
      switch (s.kind) {
        case "var": {
          const d = scalarType(s.type);
          if (d !== null) decls.set(s.name, d);
          if (d !== null && s.init) declRefuse(s.name, d, s.init, decls);
          if (s.init) expr(s.init);
          return;
        }
        case "assign": {
          if (s.target.kind === "ident") {
            const slot = decls.get(s.target.name);
            const st = staticOf(s.value, decls);
            if (slot !== undefined && st !== null) {
              const holds = varSlotHolds(slot, st);
              if (holds === false) {
                if (s.value.kind === "lit" || (staticType(s.value) !== null && STATIC_VALUE_TYPES.has(st))) {
                  diags.push({
                    code: "typed-var-value",
                    message: `Cannot assign a value of type "${st}" as "${slot}".`,
                    loc: s.value.loc,
                  });
                }
                diags.push({
                  code: "typed-var-assign",
                  message: `Value of type "${st}" cannot be assigned to a variable of type "${slot}".`,
                  loc: s.value.loc,
                });
              }
            }
          }
          expr(s.value);
          return;
        }
        case "if":
          for (const br of s.branches) {
            if (br.cond) expr(br.cond);
            br.body.forEach(stmt);
          }
          return;
        case "for":
          expr(s.iter);
          s.body.forEach(stmt);
          return;
        case "while":
          expr(s.cond);
          s.body.forEach(stmt);
          return;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard) expr(arm.guard);
            arm.body.forEach(stmt);
          }
          return;
        case "expr":
          expr(s.expr);
          return;
        case "return":
          if (s.value) expr(s.value);
          return;
        default:
          return;
      }
    };
    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "lambda":
          checkBody(e.body, decls);
          return;
        case "call":
          expr(e.callee);
          e.args.forEach(expr);
          return;
        case "binary":
          expr(e.left);
          expr(e.right);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          expr(e.operand);
          return;
        case "attribute":
          expr(e.obj);
          return;
        case "index":
          expr(e.obj);
          expr(e.index);
          return;
        case "array":
          e.items.forEach(expr);
          return;
        case "dict":
          for (const en of e.entries) {
            expr(en.key);
            expr(en.value);
          }
          return;
        default:
          return;
      }
    };
    body.forEach(stmt);
  };

  const run = (vars: VarDecl[], funcs: FuncDecl[]): void => {
    const outer = new Map<string, string>();
    for (const v of vars) {
      const d = scalarType(v.type);
      if (d !== null) outer.set(v.name, d);
    }
    // 槽表先建完再判初值 —— 字段的初值可以引用**后面**才声明的另一个字段
    for (const v of vars) {
      const d = scalarType(v.type);
      if (d !== null && v.init) declRefuse(v.name, d, v.init, outer);
    }
    for (const f of funcs) checkBody(f.body, outer);
  };

  run(m.vars, m.funcs);
  const classes = (c: ClassDecl): void => {
    run(c.vars, c.funcs);
    for (const inner of c.innerClasses) classes(inner);
  };
  for (const c of m.innerClasses) classes(c);
}

/** 给常量赋值是**解析期**拒，各种形状（局部 / 模块级 / 内部类 / 全局常量，含复合赋值）同一句 `Cannot assign a new value to a constant.`。两条保守边界：① 只判**简单标识符**目标；② 同一个函数体里那个名字被另绑过一次（形参、非 const 的 `var`、`for` 变量、pattern 绑定、lambda 形参）就整格放行 —— 局部可以合法遮蔽常量。 */
function checkConstAssign(m: Module, diags: Diagnostic[]): void {
  const moduleConsts = new Set<string>(m.vars.filter((v) => v.isConst).map((v) => v.name));

  const bindings = (ss: Stmt[], rebound: Set<string>, localConsts: Set<string>): void => {
    for (const s of ss) {
      switch (s.kind) {
        case "var":
          if (s.isConst) localConsts.add(s.name);
          else rebound.add(s.name);
          exprBindings(s.init, rebound, localConsts);
          continue;
        case "assign":
          exprBindings(s.target, rebound, localConsts);
          exprBindings(s.value, rebound, localConsts);
          continue;
        case "for":
          rebound.add(s.var);
          exprBindings(s.iter, rebound, localConsts);
          bindings(s.body, rebound, localConsts);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) exprBindings(b.cond, rebound, localConsts);
            bindings(b.body, rebound, localConsts);
          }
          continue;
        case "while":
          exprBindings(s.cond, rebound, localConsts);
          bindings(s.body, rebound, localConsts);
          continue;
        case "match":
          exprBindings(s.subject, rebound, localConsts);
          for (const arm of s.arms) {
            for (const n of patternBindings(arm.pattern)) rebound.add(n);
            if (arm.guard !== null) exprBindings(arm.guard, rebound, localConsts);
            bindings(arm.body, rebound, localConsts);
          }
          continue;
        case "expr":
          exprBindings(s.expr, rebound, localConsts);
          continue;
        case "return":
          if (s.value !== null) exprBindings(s.value, rebound, localConsts);
          continue;
        default:
          continue;
      }
    }
  };

  const exprBindings = (e: Expr | null, rebound: Set<string>, localConsts: Set<string>): void => {
    if (e === null) return;
    switch (e.kind) {
      case "lambda":
        for (const p of e.params) rebound.add(p.name);
        bindings(e.body, rebound, localConsts);
        return;
      case "binary":
        exprBindings(e.left, rebound, localConsts);
        exprBindings(e.right, rebound, localConsts);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        exprBindings(e.operand, rebound, localConsts);
        return;
      case "index":
        exprBindings(e.obj, rebound, localConsts);
        exprBindings(e.index, rebound, localConsts);
        return;
      case "attribute":
        exprBindings(e.obj, rebound, localConsts);
        return;
      case "array":
        for (const it of e.items) exprBindings(it, rebound, localConsts);
        return;
      case "dict":
        for (const en of e.entries) {
          exprBindings(en.key, rebound, localConsts);
          exprBindings(en.value, rebound, localConsts);
        }
        return;
      default:
        return;
    }
  };

  const check = (ss: Stmt[], consts: Set<string>, rebound: Set<string>): void => {
    for (const s of ss) {
      switch (s.kind) {
        case "assign": {
          if (s.target.kind === "ident") {
            const nm = s.target.name;
            if (!rebound.has(nm) && (consts.has(nm) || isGlobalConst(nm))) {
              diags.push({
                code: "const-assign",
                message: "Cannot assign a new value to a constant.",
                loc: s.loc,
              });
            }
          }
          check(s.value.kind === "lambda" ? s.value.body : [], consts, rebound);
          continue;
        }
        case "var":
          if (s.init !== null && s.init.kind === "lambda") check(s.init.body, consts, rebound);
          continue;
        case "if":
          for (const b of s.branches) check(b.body, consts, rebound);
          continue;
        case "while":
          check(s.body, consts, rebound);
          continue;
        case "for":
          check(s.body, consts, rebound);
          continue;
        case "match":
          for (const arm of s.arms) check(arm.body, consts, rebound);
          continue;
        case "expr":
          if (s.expr.kind === "lambda") check(s.expr.body, consts, rebound);
          continue;
        default:
          continue;
      }
    }
  };

  const one = (params: Param[], body: Stmt[], consts: Set<string>): void => {
    const rebound = new Set<string>(params.map((p) => p.name));
    const localConsts = new Set<string>();
    bindings(body, rebound, localConsts);
    const all = new Set<string>([...consts, ...localConsts]);
    check(body, all, rebound);
  };

  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const consts = new Set<string>([...inherited, ...c.vars.filter((v) => v.isConst).map((v) => v.name)]);
    for (const f of c.funcs) one(f.params, f.body, consts);
    for (const inner of c.innerClasses) walkClass(inner, consts);
  };

  for (const f of m.funcs) one(f.params, f.body, moduleConsts);
  for (const c of m.innerClasses) walkClass(c, moduleConsts);
}

function checkVoidMethodValues(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);

  /** 能被 `X.new()` 造出来的类名：脚本自己的类 + 内部类（递归） */
  const classNames = new Set<string>(m.className ? [m.className] : []);
  const addClassNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      classNames.add(c.name);
      addClassNames(c.innerClasses);
    }
  };
  addClassNames(m.innerClasses);

  /** 本模块声明过的信号名（含内部类里的）：裸写 `fired` 就是一个 Signal 值。 */
  const signalNames = new Set<string>(m.signals.map((s) => s.name));
  const addSignalNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      for (const s of c.signals) signalNames.add(s.name);
      addSignalNames(c.innerClasses);
    }
  };
  addSignalNames(m.innerClasses);

  const shapeOf = (e: Expr): ContainerShape | null => {
    if (e.kind === "array") return "Array";
    if (e.kind === "dict") return "Dictionary";
    // Callable 只认构造式与显式标注：`var c = Callable()` 静态推得出类型，从 `o.hi` 读出来的那一格推不出（那是运行期才判）。
    if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "Callable") return "Callable";
    if (e.kind === "call" && e.callee.kind === "ident" && PACK_SHAPE_NAMES.has(e.callee.name)) {
      return "Pack";
    }
    // `var o = Thing.new()`：接收者是脚本自己的类造出来的对象，`set` 在那里同样是 void
    if (
      e.kind === "call" &&
      e.callee.kind === "attribute" &&
      e.callee.name === "new" &&
      e.callee.obj.kind === "ident" &&
      classNames.has(e.callee.obj.name)
    ) {
      return "Object";
    }
    return null;
  };

  for (const body of bodies) {
    const shapes = new Map<string, ContainerShape>();
    const expr = (e: Expr, discarded: boolean): void => {
      switch (e.kind) {
        case "call": {
          if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident") {
            const name = e.callee.name;
            // 只认裸信号名（`fired.emit(1)`）：`var s = fired` 之后 `s.emit(1)` 是运行期才判，这条链不发解析期拒；局部变量遮住同名信号时也以 `shapes` 为准。
            const shape =
              shapes.get(e.callee.obj.name) ?? (signalNames.has(e.callee.obj.name) ? "Signal" : null);
            // Signal 上没有这个名字：解析期两句，**取值与丢值都一样**（它不是 void 那一族，是找不到成员）
            if (shape === "Signal" && SIGNAL_PARSE_MISSING.has(name)) {
              diags.push({
                code: "signal-member-missing",
                message: `Cannot find member "${name}" in base "Signal".`,
                loc: e.loc,
              });
              diags.push({
                code: "signal-member-not-found",
                message: `Function "${name}()" not found in base Signal.`,
                loc: e.loc,
              });
            }
            if (!discarded) {
              const isVoid =
                shape === "Pack"
                  ? VOID_BYTES_METHODS.has(name) || (e.args.length === 0 && VOID_BYTES_ZEROARG.has(name))
                  : shape === "Object"
                    ? VOID_OBJECT_METHODS.has(name)
                    : shape === "Signal"
                      ? VOID_SIGNAL_METHODS.has(name)
                      : shape === "Callable"
                        ? VOID_CALLABLE_METHODS.has(name)
                        : (shape === "Array" ? VOID_ARRAY_METHODS : shape === "Dictionary" ? VOID_DICT_METHODS : null)?.has(name) === true;
              if (isVoid) {
                diags.push({
                  code: "void-method-value",
                  message: `Cannot get return value of call to "${name}()" because it returns "void".`,
                  loc: e.loc,
                });
              }
            }
          }
          expr(e.callee, false);
          for (const a of e.args) expr(a, false);
          return;
        }
        case "index":
          expr(e.obj, false);
          expr(e.index, false);
          return;
        case "attribute":
          expr(e.obj, false);
          return;
        case "binary":
          expr(e.left, false);
          expr(e.right, false);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          expr(e.operand, false);
          return;
        case "array":
          for (const it of e.items) expr(it, false);
          return;
        case "dict":
          for (const en of e.entries) {
            expr(en.key, false);
            expr(en.value, false);
          }
          return;
        default:
          return;
      }
    };
    const stmts = (ss: Stmt[]): void => {
      for (const s of ss) {
        switch (s.kind) {
          case "var": {
            if (s.type !== null && s.type.kind === "named") {
              if (/^Array(\[|$)/.test(s.type.name)) shapes.set(s.name, "Array");
              else if (/^Dictionary(\[|$)/.test(s.type.name)) shapes.set(s.name, "Dictionary");
              else if (PACK_SHAPE_NAMES.has(s.type.name)) shapes.set(s.name, "Pack");
              else if (s.type.name === "Signal") shapes.set(s.name, "Signal");
              else if (s.type.name === "Callable") shapes.set(s.name, "Callable");
            } else if (s.init !== null) {
              const sh = shapeOf(s.init);
              if (sh !== null) shapes.set(s.name, sh);
            }
            if (s.init !== null) expr(s.init, false);
            continue;
          }
          case "assign": {
            if (s.target.kind === "ident") {
              const sh = shapeOf(s.value);
              if (sh === null) shapes.delete(s.target.name);
              else shapes.set(s.target.name, sh);
            }
            expr(s.target, false);
            expr(s.value, false);
            continue;
          }
          case "expr":
            expr(s.expr, true);
            continue;
          case "return":
            if (s.value !== null) expr(s.value, false);
            continue;
          case "if":
            for (const b of s.branches) {
              if (b.cond !== null) expr(b.cond, false);
              stmts(b.body);
            }
            continue;
          case "for":
            expr(s.iter, false);
            stmts(s.body);
            continue;
          case "while":
            expr(s.cond, false);
            stmts(s.body);
            continue;
          case "match":
            expr(s.subject, false);
            for (const arm of s.arms) {
              if (arm.guard !== null) expr(arm.guard, false);
              stmts(arm.body);
            }
            continue;
          default:
            continue;
        }
      }
    };
    stmts(body);
  }
}

/** 标量标注 → `staticType` 那一套名字；认不出来的（引擎类、Variant）一律不管，交运行时。 */
function scalarStaticName(name: string): string | null {
  if (/^Array\[/.test(name)) return "Array";
  if (/^Dictionary\[/.test(name)) return "Dictionary";
  switch (name) {
    case "int":
    case "float":
    case "bool":
    case "String":
    case "StringName":
    case "Vector2":
    case "Vector3":
    case "Vector2i":
    case "Vector3i":
    case "Color":
      return name;
    default:
      return null;
  }
}

/** 静态方法里碰实例成员是解析期拒：裸读实例变量给 `Cannot access non-static variable "mv" from the static function "reads()".`，裸调实例方法给 `Cannot call non-static function "imeth()" from the static function "calls()".`；`const`（isConst）与 `static var`（isStatic）都不算实例变量。 */
/** `is` / `as` 指向 Packed\*Array 的解析期拒：操作数的静态类型判得出来时 Godot 根本不让编，`is` 一句 `Expression is of type "T" so it can't be of type "PackedX".`、`as` 两句。判不出来就留到运行期，那时 pack `is Array` / `is Object` 都是假、只有 `is Variant` 真。只认列在这里的类型名，认不出的一律不报（宁可漏报，不可误拦合法工程）。 */
const PACK_IS_AS_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedColorArray",
]);
/** 能静态判出来的操作数类型（`null` 那格的文本没判过，故意不列）。 */
const STATIC_VALUE_TYPES = new Set(["Vector2", "Vector3", "Vector2i", "Vector3i", "Color"]);

/** 一个函数体里**标注为 `StringName`** 的局部变量名。只认 `var` 的标注，形参不算；Godot 的标注不松口（同一变量后来不可能装别的类型），所以「这个名字是 StringName」在整个函数体里都成立，不必管作用域嵌套。 */
function stringNameVars(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const x of node) stringNameVars(x, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (obj.kind === "var") {
    const type = obj.type as TypeRef | null;
    if (type !== null && type.kind === "named" && type.name === "StringName" && typeof obj.name === "string") out.add(obj.name);
  }
  for (const key of Object.keys(obj)) {
    if (key === "loc") continue;
    stringNameVars(obj[key], out);
  }
}

function staticTypeName(e: Expr): string | null {
  if (e.kind === "lit") {
    return (
      { int: "int", float: "float", bool: "bool", string: "String", string_name: "StringName" } as Record<
        string,
        string
      >
    )[e.lit] ?? null;
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "call" && e.callee.kind === "ident" && STATIC_VALUE_TYPES.has(e.callee.name)) {
    return e.callee.name;
  }
  return null;
}

function walkExprKinds(node: unknown, out: Extract<Expr, { kind: "is" | "as" }>[]): void {
  if (Array.isArray(node)) {
    for (const x of node) walkExprKinds(x, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;
  if (obj.kind === "is" || obj.kind === "as") out.push(obj as unknown as Extract<Expr, { kind: "is" | "as" }>);
  for (const key of Object.keys(obj)) {
    if (key === "loc") continue;
    walkExprKinds(obj[key], out);
  }
}

function checkPackIsAs(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  for (const body of bodies) {
    const snVars = new Set<string>();
    stringNameVars(body, snVars);
    const found: Extract<Expr, { kind: "is" | "as" }>[] = [];
    walkExprKinds(body, found);
    for (const node of found) {
      if (node.type.kind !== "named") continue;
      const target = node.type.name.replace(/\[.*\]$/, "");
      const packTarget = PACK_IS_AS_NAMES.has(target);
      // `var s: StringName` 之后 `s is String` 与字面量那一格同句
      const snVarOperand = node.operand.kind === "ident" && snVars.has(node.operand.name);
      const snAgainstString = target === "String" && node.kind === "is" && (snVarOperand || staticTypeName(node.operand) === "StringName");
      if (!packTarget && !snAgainstString) continue;
      const from = snVarOperand && !packTarget ? "StringName" : staticTypeName(node.operand);
      if (from === null) continue;
      if (node.kind === "is") {
        diags.push({
          code: "pack-is-type",
          message: `Expression is of type "${from}" so it can't be of type "${target}".`,
          loc: node.loc,
        });
      } else {
        diags.push({ code: "pack-as-type", message: `Cannot cast a value of type "${from}" as "${target}".`, loc: node.loc });
        diags.push({ code: "pack-as-type", message: `Invalid cast. Cannot convert from "${from}" to "${target}".`, loc: node.loc });
      }
    }
  }
}

/** `_init` 与 `new()` 的解析期拒：带值的 `return`（不带值的 `return` 合法）、父类没定义 `_init` 时的 `super()`、以及两侧的 arity（「at most」数全部形参、「at least」数没有默认值的那些；`super(...)` 与 `X.new(...)` 两句文本不同）。只判同模块解得出基类链的那几形：基类名在 `globals` 里时签名看不见，一律不报；lambda 里不判。 */
/** pack 的**方法实参槽位**：不合槽的来源 Godot 在解析期拒。能进槽的来源与形参槽表是同一套结论，但**不共用代码也不互推**（两侧读者不同，一份表被两处读正是分叉温床）。文本两种形状：容器来源（Array / Dictionary）只有一句 `Invalid argument …`，标量与值类型来源是两句（`Cannot pass a value of type "X" as "Y".` 在前）。 */
const PACK_ARG_SLOTS: Record<string, { slot: string; ok: readonly string[] }> = {
  PackedByteArray: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt32Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt64Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedFloat32Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedFloat64Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedStringArray: { slot: "String", ok: ["String", "StringName"] },
  PackedVector2Array: { slot: "Vector2", ok: ["Vector2", "Vector2i"] },
  PackedVector3Array: { slot: "Vector3", ok: ["Vector3", "Vector3i"] },
  PackedColorArray: { slot: "Color", ok: ["Color", "int", "String"] },
};
/** 元素槽是第几个实参（1 起），只列判得出的方法：`append` / `find` / `has` / `count` / `fill` 是第 1 参、`insert` / `set` 是第 2 参，文本都是同一套两句。 */
const PACK_ELEMENT_ARG: Record<string, number> = { append: 1, find: 1, insert: 2, set: 2, has: 1, count: 1, fill: 1 };

/** 实参的静态来源名，按 Godot 文本里的写法给（`string_name` 那一格是 StringName，不并给 String）。 */
function packArgSource(e: Expr): string | null {
  // `p.has("a" + "b")` 与字面量同形 —— 常量折叠出来的 String 在解析期就是已知的，两句都发。只折「字符串 + 字符串」，别的组合不判（宁可漏报）。
  if (e.kind === "binary" && e.op === "+") {
    return packArgSource(e.left) === "String" && packArgSource(e.right) === "String" ? "String" : null;
  }
  if (e.kind === "lit") {
    return ({ int: "int", float: "float", bool: "bool", string: "String", string_name: "StringName", null: "null" } as Record<string, string>)[e.lit] ?? null;
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (
    e.kind === "call" &&
    e.callee.kind === "ident" &&
    (e.callee.name === "Vector2" ||
      e.callee.name === "Vector3" ||
      e.callee.name === "Vector2i" ||
      e.callee.name === "Vector3i" ||
      e.callee.name === "Color")
  ) {
    return e.callee.name;
  }
  return null;
}

/** 来源名就是标注名本身的那些（Godot 的文本里就是这么写） */
const ANNOT_SOURCES = new Set(["int", "float", "bool", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color", "Array", "Dictionary"]);

function checkPackArgSlots(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);

  for (const body of bodies) {
    const nodes: Record<string, unknown>[] = [];
    const scan = (n: unknown): void => {
      if (Array.isArray(n)) {
        for (const x of n) scan(x);
        return;
      }
      if (n === null || typeof n !== "object") return;
      const obj = n as Record<string, unknown>;
      if (obj.kind === "lambda") return;
      nodes.push(obj);
      for (const key of Object.keys(obj)) {
        if (key !== "loc") scan(obj[key]);
      }
    };
    scan(body);

    // 只认「标注」与「字面量构造」两种证明，且被重新赋值过的名字直接丢掉 —— 证不出就当不知道
    const packs = new Map<string, string>();
    /** 同函数体内 `var v: String` 这一类**带标注的局部 var**：第二种证明，只发一句 */
    const annot = new Map<string, string>();
    const reassigned = new Set<string>();
    for (const n of nodes) {
      if (n.kind === "assign") {
        const target = n.target as Record<string, unknown> | undefined;
        if (target !== undefined && target.kind === "ident" && typeof target.name === "string") reassigned.add(target.name);
      }
    }
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || reassigned.has(n.name)) continue;
      const type = n.type as TypeRef | null;
      if (type !== null && type.kind === "named" && type.name in PACK_ARG_SLOTS) {
        packs.set(n.name, type.name);
        continue;
      }
      if (type !== null && type.kind === "named" && ANNOT_SOURCES.has(type.name)) annot.set(n.name, type.name);
      const init = n.init as Expr | null;
      if (init !== null && init.kind === "call" && init.callee.kind === "ident" && init.callee.name in PACK_ARG_SLOTS) {
        packs.set(n.name, init.callee.name);
      }
    }

    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "attribute") continue;
      const obj = callee.obj as Record<string, unknown> | undefined;
      if (obj === undefined || obj.kind !== "ident" || typeof obj.name !== "string") continue;
      const pack = packs.get(obj.name);
      if (pack === undefined) continue;
      const method = callee.name;
      if (typeof method !== "string") continue;
      const argAt = PACK_ELEMENT_ARG[method];
      if (argAt === undefined) continue;
      const args = (n.args as Expr[]) ?? [];
      if (args.length !== argAt) continue;
      const arg0 = args[argAt - 1] as Expr;
      const src = packArgSource(arg0);
      // 第二种证明：带标注的局部 var 静态就知道来源类型，但**只发第二句**（少了前面那句 `Cannot pass a value of type …`）；推断出来的与跨函数的来源（形参、别的函数的返回值）解析期放过、成运行期那句，这里不猜着发。
      const annotated = src === null && arg0.kind === "ident" ? (annot.get(arg0.name) ?? null) : null;
      const proven = src ?? annotated;
      if (proven === null) continue;
      const { slot, ok } = PACK_ARG_SLOTS[pack] as { slot: string; ok: readonly string[] };
      if (ok.includes(proven)) continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      if (src !== null && proven !== "Array" && proven !== "Dictionary") {
        diags.push({ code: "pack-arg-slot", message: `Cannot pass a value of type "${proven}" as "${slot}".`, loc });
      }
      diags.push({
        code: "pack-arg-slot",
        message: `Invalid argument for "${method}()" function: argument ${argAt} should be "${slot}" but is "${proven}".`,
        loc,
      });
    }
  }
}

/** 形参能收哪些来源。与运行时的 `PARAM_SLOTS` 是同一套结论但**不共用代码**（两侧读者不同，一份表被两处读正是分叉温床）。`Rect2` 那一行是**空的** —— 没有任何来源进得来。 */
const FUNC_ARG_SLOTS: Record<string, readonly string[]> = {
  int: ["int", "float", "bool"],
  float: ["int", "float", "bool"],
  bool: ["int", "float", "bool"],
  String: ["String", "StringName"],
  StringName: ["StringName", "String"],
  Vector2: ["Vector2", "Vector2i"],
  Vector2i: ["Vector2i", "Vector2"],
  Vector3: ["Vector3", "Vector3i"],
  Vector3i: ["Vector3i", "Vector3"],
  Color: ["Color", "String", "int"],
  Rect2: [],
};

/** 标注名 → 形参槽名，认不出的一律 null（类名槽不在这里判：`f(null)` 合法，而引擎类名手上没有名单）。 */
function funcSlotName(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return base in FUNC_ARG_SLOTS ? base : null;
}

/** 字面量来源进**用户函数**的定型形参：Godot 在解析期就拦，文本与 pack 那一族同形 —— 来源是 Array / Dictionary 只有 `Invalid argument …` 一句，标量与值类型来源是两句（`Cannot pass a value of type "X" as "Y".` 在前）。判不出来源（变量、表达式、函数返回）就一句不发 —— 宁可漏报，误拦合法工程贵得多。 */
/** 类名槽：形参类型是**本工程里认得的类名**（本模块的内部类，或工程层喂进来的 `class_name`）时，标量来源进不来，而且只发第二句（与容器来源同形）。`null` 在对象槽是合法的、Array / Dictionary 与值类型都不判；引擎类名（`Node` / `RefCounted` …）编译期手上没有名单，认不出来就当不知道，宁可不报。 */
function classSlotNames(m: Module, globals: Set<string>): Set<string> {
  const out = new Set<string>();
  const collect = (list: ClassDecl[]): void => {
    for (const c of list) {
      out.add(c.name);
      collect(c.innerClasses);
    }
  };
  collect(m.innerClasses);
  for (const g of globals) out.add(g);
  return out;
}

function checkFuncArgSlots(m: Module, globals: Set<string>, diags: Diagnostic[]): void {
  const classSlots = classSlotNames(m, globals);
  const moduleSigs = new Map<string, Param[]>();
  for (const f of m.funcs) moduleSigs.set(f.name, f.params);
  const classes = classTable(m);

  /** 某个内部类里能看见的裸名方法：模块函数打底，再按继承链从叶子往上被自己的方法盖。 */
  const sigsFor = (c: ClassDecl): Map<string, Param[]> => {
    const out = new Map(moduleSigs);
    const chain: ClassDecl[] = [];
    const seen = new Set<string>();
    let cur: ClassDecl | null = c;
    while (cur !== null && !seen.has(cur.name)) {
      seen.add(cur.name);
      chain.unshift(cur);
      cur = cur.extends !== null ? classes.get(cur.extends) ?? null : null;
    }
    for (const cc of chain) for (const f of cc.funcs) out.set(f.name, f.params);
    return out;
  };

  const targets: Array<{ body: Stmt[]; sigs: Map<string, Param[]> }> = [];
  for (const f of m.funcs) targets.push({ body: f.body, sigs: moduleSigs });
  const collectClass = (c: ClassDecl): void => {
    const sigs = sigsFor(c);
    for (const f of c.funcs) targets.push({ body: f.body, sigs });
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);

  for (const { body, sigs } of targets) {
    const nodes: Record<string, unknown>[] = [];
    const scan = (n: unknown): void => {
      if (Array.isArray(n)) {
        for (const x of n) scan(x);
        return;
      }
      if (n === null || typeof n !== "object") return;
      const obj = n as Record<string, unknown>;
      if (obj.kind === "lambda") return;
      nodes.push(obj);
      for (const key of Object.keys(obj)) {
        if (key !== "loc") scan(obj[key]);
      }
    };
    scan(body);

    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined) continue;
      let fname: string | null = null;
      if (callee.kind === "ident" && typeof callee.name === "string") fname = callee.name;
      else if (callee.kind === "attribute" && typeof callee.name === "string") {
        const base = callee.obj as Record<string, unknown> | undefined;
        if (base !== undefined && base.kind === "ident" && base.name === "self") fname = callee.name;
      }
      if (fname === null) continue;
      const params = sigs.get(fname);
      if (params === undefined) continue;
      const args = (n.args as Expr[]) ?? [];
      if (args.length !== params.length) continue;
      for (let i = 0; i < args.length; i++) {
        const ptype = (params[i] as Param).type;
        const slot = funcSlotName(ptype);
        const src = slotSource(args[i] as Expr);
        if (src === null) continue;
        if (slot !== null) {
          const accept = FUNC_ARG_SLOTS[slot] as readonly string[];
          if (accept.includes(src)) continue;
          const loc = (n.loc as Diagnostic["loc"]) ?? null;
          if (src !== "Array" && src !== "Dictionary") {
            diags.push({ code: "func-arg-slot", message: `Cannot pass a value of type "${src}" as "${slot}".`, loc });
          }
          diags.push({
            code: "func-arg-slot",
            message: `Invalid argument for "${fname}()" function: argument ${i + 1} should be "${slot}" but is "${src}".`,
            loc,
          });
          continue;
        }
        // 类名槽：只认本工程叫得出名字的类（内部类 + 工程层给的 class_name），只拒标量来源，**只发第二句**
        if (ptype === null || ptype.kind !== "named" || src === "null") continue;
        const cname = ptype.name.replace(/\[.*\]$/, "");
        if (!classSlots.has(cname)) continue;
        if (["Array", "Dictionary"].includes(src) || cname === src) continue;
        if (!["int", "float", "bool", "String", "StringName"].includes(src)) continue;
        diags.push({
          code: "func-arg-class-slot",
          message: `Invalid argument for "${fname}()" function: argument ${i + 1} should be "${cname}" but is "${src}".`,
          loc: (n.loc as Diagnostic["loc"]) ?? null,
        });
      }
    }
  }
}

function checkInitContracts(m: Module, globals: Set<string>, diags: Diagnostic[]): void {
  const inner = new Map<string, ClassDecl>();
  const index = (c: ClassDecl): void => {
    inner.set(c.name, c);
    for (const x of c.innerClasses) index(x);
  };
  for (const c of m.innerClasses) index(c);

  type Chain = { state: "unknown" } | { state: "none" } | { state: "init"; params: Param[] };
  /** 从某个基类名往上找 `_init`；名字解不出（跨文件的类）就给 unknown。 */
  const chainInit = (startName: string | null): Chain => {
    const seen = new Set<string>();
    let name = startName;
    while (name !== null) {
      if (seen.has(name)) return { state: "unknown" };
      seen.add(name);
      const c = inner.get(name);
      // 不是本模块的内部类：在工程的类名表里 → 签名看不见；否则是引擎类型（含隐式 RefCounted）→ 链到头
      if (!c) return globals.has(name) ? { state: "unknown" } : { state: "none" };
      const f = c.funcs.find((x) => x.name === "_init" && !x.isStatic);
      if (f) return { state: "init", params: f.params };
      name = c.extends;
    }
    return { state: "none" };
  };

  const arityText = (who: "_init" | "new", params: Param[], got: number): string | null => {
    const max = params.length;
    const min = params.filter((p) => p.default === null).length;
    if (got > max) return `Too many arguments for "${who}()" call. Expected at most ${max} but received ${got}.`;
    if (got < min) return `Too few arguments for "${who}()" call. Expected at least ${min} but received ${got}.`;
    return null;
  };

  const scan = (node: unknown, visit: (e: Record<string, unknown>) => void): void => {
    if (Array.isArray(node)) {
      for (const x of node) scan(x, visit);
      return;
    }
    if (node === null || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (obj.kind === "lambda") return;
    visit(obj);
    for (const key of Object.keys(obj)) {
      if (key === "loc") continue;
      scan(obj[key], visit);
    }
  };

  const asCalls = (body: Stmt[]): Record<string, unknown>[] => {
    const out: Record<string, unknown>[] = [];
    scan(body, (e) => {
      if (e.kind === "call") out.push(e);
    });
    return out;
  };

  /** 调用形式 `X.new(...)` / `super(...)` 的实参数与被调的名字。 */
  const callShape = (e: Record<string, unknown>): { kind: "super" | "new"; target: string; args: number } | null => {
    const callee = e.callee as Record<string, unknown> | undefined;
    if (!callee) return null;
    if (callee.kind === "ident" && callee.name === "super") return { kind: "super", target: "super", args: ((e.args as Expr[]) ?? []).length };
    if (callee.kind === "attribute" && callee.name === "new" && (callee.obj as Record<string, unknown>)?.kind === "ident") {
      return { kind: "new", target: String((callee.obj as Record<string, unknown>).name), args: ((e.args as Expr[]) ?? []).length };
    }
    return null;
  };

  const funcs: Array<{ f: FuncDecl; owner: ClassDecl | null }> = m.funcs.map((f) => ({ f, owner: null }));
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) funcs.push({ f, owner: c });
    for (const x of c.innerClasses) collect(x);
  };
  for (const c of m.innerClasses) collect(c);

  for (const { f, owner } of funcs) {
    const isInit = f.name === "_init" && !f.isStatic;
    if (isInit) {
      const returns: Record<string, unknown>[] = [];
      scan(f.body, (e) => {
        if (e.kind === "return" && e.value !== null && e.value !== undefined) returns.push(e);
      });
      for (const r of returns) {
        diags.push({ code: "init-returns-value", message: "Constructor cannot return a value.", loc: r.loc as Loc });
      }
    }
    for (const e of asCalls(f.body)) {
      const shape = callShape(e);
      if (!shape) continue;
      if (shape.kind === "super") {
        // 只有 `_init` 里的 `super(...)` 才是构造链；别的方法里的 `super()` 调的是父类同名方法
        if (!isInit || owner === null) continue;
        const up = chainInit(owner.extends);
        if (up.state === "unknown") continue;
        if (up.state === "none") {
          diags.push({
            code: "super-init-missing",
            message: `Cannot call the parent class' virtual function "_init()" because it hasn't been defined.`,
            loc: e.loc as Loc,
          });
          continue;
        }
        const text = arityText("_init", up.params, shape.args);
        if (text) diags.push({ code: "super-init-arity", message: text, loc: e.loc as Loc });
        continue;
      }
      // `X.new(...)`：X 得是本模块解得开的类，且链上有一个脚本 `_init` 才对得上 arity
      if (!inner.has(shape.target)) continue;
      const up = chainInit(shape.target);
      if (up.state !== "init") continue;
      const text = arityText("new", up.params, shape.args);
      if (text) diags.push({ code: "new-arity", message: text, loc: e.loc as Loc });
    }
  }
}

function checkStaticAccess(funcs: FuncDecl[], vars: VarDecl[], diags: Diagnostic[]): void {
  const instanceVars = new Set(vars.filter((v) => !v.isConst && !v.isStatic).map((v) => v.name));
  const instanceFuncs = new Set(funcs.filter((f) => !f.isStatic).map((f) => f.name));
  if (instanceVars.size === 0 && instanceFuncs.size === 0) return;

  for (const f of funcs) {
    if (!f.isStatic) continue;
    const local = new Set<string>();
    collectLocalNames(f.body, f.params.map((p) => p.name), local);

    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "ident":
          if (!local.has(e.name) && instanceVars.has(e.name)) {
            diags.push({
              code: "static-access-var",
              message: `Cannot access non-static variable "${e.name}" from the static function "${f.name}()".`,
              loc: e.loc,
            });
          }
          return;
        case "call": {
          if (e.callee.kind === "ident" && !local.has(e.callee.name) && instanceFuncs.has(e.callee.name)) {
            diags.push({
              code: "static-call-func",
              message: `Cannot call non-static function "${e.callee.name}()" from the static function "${f.name}()".`,
              loc: e.loc,
            });
          }
          expr(e.callee);
          for (const a of e.args) expr(a);
          return;
        }
        case "index":
          expr(e.obj);
          expr(e.index);
          return;
        case "attribute":
          expr(e.obj);
          return;
        case "binary":
          expr(e.left);
          expr(e.right);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          expr(e.operand);
          return;
        case "array":
          for (const it of e.items) expr(it);
          return;
        case "dict":
          for (const en of e.entries) {
            expr(en.key);
            expr(en.value);
          }
          return;
        case "lambda":
          for (const st of e.body) stmt(st);
          return;
        case "lit":
          return;
      }
    };
    const stmt = (s: Stmt): void => {
      switch (s.kind) {
        case "expr":
          expr(s.expr);
          return;
        case "var":
          if (s.init !== null) expr(s.init);
          return;
        case "assign":
          expr(s.target);
          expr(s.value);
          return;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) expr(br.cond);
            br.body.forEach(stmt);
          }
          return;
        case "for":
          expr(s.iter);
          s.body.forEach(stmt);
          return;
        case "while":
          expr(s.cond);
          s.body.forEach(stmt);
          return;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard !== null) expr(arm.guard);
            arm.body.forEach(stmt);
          }
          return;
        case "return":
          if (s.value !== null) expr(s.value);
          return;
        default:
          return;
      }
    };
    f.body.forEach(stmt);
  }
}

/** 函数体里所有**局部声明**的名字：形参、`var`、`for` 的循环变量、`match` 的绑定、lambda 的形参。用来避免「局部遮蔽了外层名字却被当成外层名字报错」这一类误报。 */
function collectLocalNames(body: Stmt[], params: string[], out: Set<string>): void {
  for (const p of params) out.add(p);
  const stmt = (s: Stmt): void => {
    switch (s.kind) {
      case "var":
        out.add(s.name);
        return;
      case "for":
        out.add(s.var);
        s.body.forEach(stmt);
        return;
      case "if":
        for (const br of s.branches) br.body.forEach(stmt);
        return;
      case "while":
        s.body.forEach(stmt);
        return;
      case "match":
        for (const arm of s.arms) {
          if (arm.pattern.kind === "bind") out.add(arm.pattern.name);
          arm.body.forEach(stmt);
        }
        return;
      default:
        return;
    }
  };
  body.forEach(stmt);
}

function checkClassFuncVisibility(m: Module, diags: Diagnostic[]): void {
  const outerFuncs = new Set(m.funcs.map((f) => f.name));
  if (outerFuncs.size === 0) return;

  const scanExpr = (e: Expr, cb: (name: string, loc: Loc) => void): void => {
    switch (e.kind) {
      case "call":
        if (e.callee.kind === "ident") cb(e.callee.name, e.loc);
        scanExpr(e.callee, cb);
        for (const a of e.args) scanExpr(a, cb);
        return;
      case "index":
        scanExpr(e.obj, cb);
        scanExpr(e.index, cb);
        return;
      case "attribute":
        scanExpr(e.obj, cb);
        return;
      case "binary":
        scanExpr(e.left, cb);
        scanExpr(e.right, cb);
        return;
      case "unary":
      case "await":
      case "is":
      case "as":
        scanExpr(e.operand, cb);
        return;
      case "array":
        for (const it of e.items) scanExpr(it, cb);
        return;
      case "dict":
        for (const en of e.entries) {
          scanExpr(en.key, cb);
          scanExpr(en.value, cb);
        }
        return;
      case "lambda":
        scanStmts(e.body, cb);
        return;
      default:
        return;
    }
  };
  const scanStmts = (body: Stmt[], cb: (name: string, loc: Loc) => void): void => {
    for (const s of body) {
      switch (s.kind) {
        case "expr":
          scanExpr(s.expr, cb);
          continue;
        case "var":
          if (s.init !== null) scanExpr(s.init, cb);
          continue;
        case "assign":
          scanExpr(s.target, cb);
          scanExpr(s.value, cb);
          continue;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) scanExpr(br.cond, cb);
            scanStmts(br.body, cb);
          }
          continue;
        case "for":
          scanExpr(s.iter, cb);
          scanStmts(s.body, cb);
          continue;
        case "while":
          scanExpr(s.cond, cb);
          scanStmts(s.body, cb);
          continue;
        case "match":
          scanExpr(s.subject, cb);
          for (const arm of s.arms) {
            if (arm.guard !== null) scanExpr(arm.guard, cb);
            scanStmts(arm.body, cb);
          }
          continue;
        case "return":
          if (s.value !== null) scanExpr(s.value, cb);
          continue;
        default:
          continue;
      }
    }
  };

  const walkClass = (c: ClassDecl): void => {
    const own = new Set(c.funcs.map((f) => f.name));
    for (const f of c.funcs) {
      const local = new Set<string>();
      collectLocalNames(f.body, f.params.map((p) => p.name), local);
      scanStmts(f.body, (name, loc) => {
        if (outerFuncs.has(name) && !own.has(name) && !local.has(name)) {
          diags.push({
            code: "class-outer-func",
            message: `Function "${name}()" not found in base self.`,
            loc,
          });
        }
      });
    }
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);
}

function checkClass(c: ClassDecl, base: Scope, diags: Diagnostic[], classes: Map<string, ClassDecl>): void {
  const scope = base.child([c.name, ...declNames(c), ...inheritedNames(c, classes)]);
  const coroutines = new Set(c.funcs.filter((f) => f.coroutine).map((f) => f.name));
  checkStaticAccess(c.funcs, c.vars, diags);
  for (const f of c.funcs) checkFunc(f, scope, coroutines, diags);
  for (const inner of c.innerClasses) checkClass(inner, scope, diags, classes);
}

/** 脚本里所有内部类的名字表（含嵌套的）；跨文件那种基类（在 `globals` 里）查不到，一个名字也不并。 */
function classTable(m: Module): Map<string, ClassDecl> {
  const out = new Map<string, ClassDecl>();
  const collect = (list: ClassDecl[]): void => {
    for (const c of list) {
      if (!out.has(c.name)) out.set(c.name, c);
      collect(c.innerClasses);
    }
  };
  collect(m.innerClasses);
  return out;
}

/** 沿 `extends` 链把祖先的声明名并进来：内部类里**裸引**继承来的 `var` 与 `const` 是合法的，隔一层也照样能引，所以链要一路走上去而不是只看直接父类。`seen` 是给畸形继承（A extends B extends A）挡死循环的。 */
function inheritedNames(c: ClassDecl, classes: Map<string, ClassDecl>): string[] {
  const seen = new Set<string>([c.name]);
  const out: string[] = [];
  let next: string | null = c.extends;
  while (next !== null) {
    const parent = classes.get(next);
    if (!parent || seen.has(parent.name)) break;
    seen.add(parent.name);
    out.push(...declNames(parent));
    next = parent.extends;
  }
  return out;
}

function checkFunc(f: FuncDecl, outer: Scope, coroutines: Set<string>, diags: Diagnostic[]): void {
  const scope = outer.child(["self", ...f.params.map((p) => p.name)], !f.isStatic);
  walkStmts(f.body, scope, coroutines, diags, false);
}

function walkStmts(
  stmts: Stmt[],
  scope: Scope,
  coroutines: Set<string>,
  diags: Diagnostic[],
  inLoop: boolean,
): void {
  for (const s of stmts) walkStmt(s, scope, coroutines, diags, inLoop);
}

function walkStmt(
  s: Stmt,
  scope: Scope,
  coroutines: Set<string>,
  diags: Diagnostic[],
  inLoop: boolean,
): void {
  switch (s.kind) {
    case "var":
      if (s.init) walkExpr(s.init, scope, coroutines, diags);
      scope.declare(s.name);
      break;
    case "expr":
      walkExpr(s.expr, scope, coroutines, diags);
      break;
    case "assign":
      walkExpr(s.target, scope, coroutines, diags);
      walkExpr(s.value, scope, coroutines, diags);
      break;
    case "return":
      if (s.value) walkExpr(s.value, scope, coroutines, diags);
      break;
    case "if":
      for (const br of s.branches) {
        if (br.cond) walkExpr(br.cond, scope, coroutines, diags);
        walkStmts(br.body, scope.child([]), coroutines, diags, inLoop);
      }
      break;
    case "for": {
      walkExpr(s.iter, scope, coroutines, diags);
      const loopScope = scope.child([s.var]);
      walkStmts(s.body, loopScope, coroutines, diags, true);
      break;
    }
    case "while":
      walkExpr(s.cond, scope, coroutines, diags);
      walkStmts(s.body, scope.child([]), coroutines, diags, true);
      break;
    case "match": {
      walkExpr(s.subject, scope, coroutines, diags);
      for (const arm of s.arms) {
        const armScope = scope.child(patternBindings(arm.pattern));
        if (arm.guard) walkExpr(arm.guard, armScope, coroutines, diags);
        walkStmts(arm.body, armScope, coroutines, diags, inLoop);
      }
      break;
    }
    case "break":
    case "continue":
      if (!inLoop) {
        diags.push({ code: "break-outside-loop", message: `${s.kind} 不在循环内`, loc: s.loc });
      }
      break;
    case "pass":
      break;
  }
}

function patternBindings(p: Pattern): string[] {
  switch (p.kind) {
    case "bind":
      return [p.name];
    case "array":
      return p.items.flatMap(patternBindings);
    case "dict":
      return p.entries.flatMap((e) => patternBindings(e.pattern));
    default:
      return [];
  }
}

/**
 * 分析器按真实作用域认过的「全局函数取值点」（`var f = abs` 那一格）：作用域归作用域管，
 * 发射器只认这个记号，不再自己猜局部名 —— 实测 `var len = 5` 之后同函数里的 `abs` 仍取全局、
 * lambda 形参 `abs` 只在形参体内盖住全局，两种都按这个记号发得对。
 * 记账用 `行:列:名字` 而不是节点身份：scriptc 那条原生通道不让把对象塞进 WeakSet（SC1090），
 * 而同一个模块重 lower 一遍的 loc 一模一样，所以这条式子两头都走得通。
 */
const globalValueReads = new Set<string>();

/** 同一套记号记的第二类：引擎类名当值用（`var k = Node`）—— 取值合法、等式按类，但那支打印带进程内的号，发射器据此响亮拒。 */
const nativeClassReads = new Set<string>();

const gvKey = (name: string, line: number, col: number): string => `${name}@${line}:${col}`;

export function isGlobalValueRead(e: Expr): boolean {
  return e.kind === "ident" && globalValueReads.has(gvKey(e.name, e.loc.line, e.loc.col));
}

export function isNativeClassValueRead(e: Expr): boolean {
  return e.kind === "ident" && nativeClassReads.has(gvKey(e.name, e.loc.line, e.loc.col));
}

function walkExpr(e: Expr, scope: Scope, coroutines: Set<string>, diags: Diagnostic[], awaited = false): void {
  switch (e.kind) {
    case "lit":
      return;

    case "ident":
      if (e.name === "super") return;
      if (e.name === "self") {
        if (!scope.allowsSelf()) {
          diags.push({
            code: "self-in-static",
            message: 'Cannot use "self" inside a static function.',
            loc: e.loc,
          });
        }
        return;
      }
      // 实测「能当值用的全局函数名」（那 78 个）取值合法：一律 typeof 25、打印 `@GlobalScope::<名字>`，所以记下节点、不报「没声明」
      if (!scope.has(e.name) && !isGlobalConst(e.name)) {
        if (GLOBAL_VALUE_NAMES.has(e.name)) globalValueReads.add(gvKey(e.name, e.loc.line, e.loc.col));
        // 引擎类名当值用同样合法（typeof 24、等式按类），只是那支打印带进程内的号 —— 记下来交给发射器拒
        else if (ENGINE_CLASS_NAMES.has(e.name)) nativeClassReads.add(gvKey(e.name, e.loc.line, e.loc.col));
        else
          diags.push({
            code: "undeclared-identifier",
            message: `Identifier "${e.name}" not declared in the current scope.`,
            loc: e.loc,
          });
      }
      return;

    case "unary":
      walkExpr(e.operand, scope, coroutines, diags);
      return;

    case "await":
      walkExpr(e.operand, scope, coroutines, diags, true);
      return;

    case "binary": {
      checkOperator(e, diags);
      walkExpr(e.left, scope, coroutines, diags);
      walkExpr(e.right, scope, coroutines, diags);
      return;
    }

    case "is":
    case "as":
      walkExpr(e.operand, scope, coroutines, diags);
      return;

    case "index":
      walkExpr(e.obj, scope, coroutines, diags);
      walkExpr(e.index, scope, coroutines, diags);
      return;

    case "attribute":
      if (staticMemberFn(e.obj) === null) walkExpr(e.obj, scope, coroutines, diags);
      return;

    case "array":
      for (const it of e.items) walkExpr(it, scope, coroutines, diags);
      return;

    case "dict":
      for (const en of e.entries) {
        walkExpr(en.key, scope, coroutines, diags);
        walkExpr(en.value, scope, coroutines, diags);
      }
      return;

    case "lambda": {
      const fnScope = scope.child(e.params.map((p) => p.name));
      walkStmts(e.body, fnScope, coroutines, diags, false);
      return;
    }

    case "call": {
      if (e.callee.kind === "ident") {
        const name = e.callee.name;
        if (coroutines.has(name) && !awaited) {
          diags.push({
            code: "coroutine-not-awaited",
            message: `Function "${name}()" is a coroutine, so it must be called with "await".`,
            loc: e.loc,
          });
        }
        checkCall(name, e, diags);
      } else {
        walkExpr(e.callee, scope, coroutines, diags);
        if (e.callee.kind === "attribute") checkMethodCall(e.callee.name, e, diags);
      }
      for (const a of e.args) walkExpr(a, scope, coroutines, diags);
      return;
    }
  }
}

/** 槽位判据专用的来源名：`&"…"` 字面量给 `StringName`，其余照 `staticType`。不能并进 `staticType`：那张表还喂着打印、运算与 pack 实参等判据，口径已按「StringName 视作 String」定过，一处改动会把别的族一起翻掉。 */
function slotSource(e: Expr): NonNullable<StaticType> | null {
  if (e.kind === "lit" && e.lit === "string_name") return "StringName";
  return staticType(e);
}

function staticType(e: Expr): StaticType {
  switch (e.kind) {
    case "lit":
      if (e.lit === "int") return "int";
      if (e.lit === "float") return "float";
      if (e.lit === "string" || e.lit === "string_name") return "String";
      if (e.lit === "bool") return "bool";
      return "null";
    case "array":
      return "Array";
    case "dict":
      return "Dictionary";
    case "unary": {
      const t = staticType(e.operand);
      if (e.op === "not") return "bool";
      if (e.op === "-" && (t === "int" || t === "float")) return t;
      return null;
    }
    case "binary": {
      const l = staticType(e.left);
      const r = staticType(e.right);
      if (e.op === "+" && (l === "String" || r === "String")) return "String";
      if (e.op === "+" && (l === "Array" || r === "Array")) return "Array";
      if (l === "int" && r === "int") return "int";
      if (isNum(l) && isNum(r)) return "float";
      return null;
    }
    case "call": {
      // 值类型的构造调用折成类型名 —— 槽矩阵与 `Array[Vector2]` 那种元素槽都要认得出 `Vector3(1, 2, 3)` 这一形。只认 STATIC_VALUE_TYPES 里的五个名字，别的调用（普通函数、`Color.named(...)`、`PackedX(...)`）一律 null：判不出来就不报。
      if (e.callee.kind === "ident" && STATIC_VALUE_TYPES.has(e.callee.name)) return e.callee.name as StaticType;
      return null;
    }
    default:
      return null;
  }
}

function isNum(t: StaticType): boolean {
  return t === "int" || t === "float";
}

function isNegativeLiteral(e: Expr): boolean {
  if (e.kind === "lit" && (e.lit === "int" || e.lit === "float")) return Number(e.value) < 0;
  if (e.kind === "unary" && e.op === "-") return true;
  return false;
}

function checkOperator(e: Extract<Expr, { kind: "binary" }>, diags: Diagnostic[]): void {
  const l = staticType(e.left);
  const r = staticType(e.right);

  const isModulo = l !== "String" && r !== "String";
  if (e.op === "%" && isModulo && (l === "float" || r === "float")) {
    diags.push({
      code: "op-mod-float",
      message: `Invalid operands to operator %, ${l} and ${r}.`,
      loc: e.loc,
    });
  }

  if (e.op === "==" || e.op === "!=") {
    const sVsN = (l === "String" && (r === "int" || r === "float")) || (r === "String" && (l === "int" || l === "float"));
    if (sVsN) {
      diags.push({
        code: "op-eq-cross-type",
        message: `Invalid operands to operator ${e.op}, ${l} and ${r}.`,
        loc: e.loc,
      });
    }
  }

  if (e.op === ">>" || e.op === "<<") {
    if (isNegativeLiteral(e.left) || isNegativeLiteral(e.right)) {
      diags.push({
        code: "op-shift-negative",
        message: `Invalid operands for bit shifting. Only positive operands are supported. in operator ${e.op}.`,
        loc: e.loc,
      });
    }
  }

  if (
    e.op === "/" &&
    e.left.kind === "lit" &&
    (e.left.lit === "int" || e.left.lit === "float") &&
    e.right.kind === "lit" &&
    e.right.lit === "int" &&
    Number(e.right.value) === 0
  ) {
    diags.push({ code: "div-by-zero", message: "Division by zero error in operator /.", loc: e.loc });
  }
}

/** `join()` 的实参形状：字典走 `Invalid argument …` 那条，标量走 `Cannot pass a value of type … as "PackedStringArray"` 那条 —— 两条文本不同，别合成一条。Array（含未定型字面量、Array[String]）是**合法**实参，不在此表。 */
const JOIN_BAD_ARG: Record<string, string> = {
  Dictionary: `Invalid argument for "join()" function: argument 1 should be "PackedStringArray" but is "Dictionary".`,
  String: `Cannot pass a value of type "String" as "PackedStringArray".`,
  int: `Cannot pass a value of type "int" as "PackedStringArray".`,
  float: `Cannot pass a value of type "float" as "PackedStringArray".`,
  bool: `Cannot pass a value of type "bool" as "PackedStringArray".`,
  null: `Cannot pass a value of type "null" as "PackedStringArray".`,
};


/** 接收者能不能**静态证成** Array / Dictionary / 某种 pack：只认字面量与 `PackedXArray(...)` 构造式。变量名不在这里解析 —— 推断来源不证（宁可漏报，也不把运行期那句提前）。 */
function joinReceiverBase(e: Expr): string | null {
  // 第二句文本里的类型名不带引号
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "call" && e.callee.kind === "ident" && PACK_SHAPE_NAMES.has(e.callee.name)) {
    return e.callee.name;
  }
  return null;
}

function checkMethodCall(name: string, e: Extract<Expr, { kind: "call" }>, diags: Diagnostic[]): void {
  if (name !== "join") return;
  // `join` 是 **String** 的方法，接收者分三段：① 字符串字面量才走下面那套「实参形状」判据；② 能静态证出来的 Array / Dictionary / pack 给解析期两句「找不到成员」；③ 其余（推断出来的接收者）解析期放过、运行期才给 `Invalid call. Nonexistent function 'join' in base 'Array'.`，这里什么都不报。
  const recv = e.callee.kind === "attribute" ? e.callee.obj : null;
  if (recv !== null && !(recv.kind === "lit" && recv.lit === "string")) {
    const base = joinReceiverBase(recv);
    if (base !== null) {
      diags.push({ code: "join-not-member", message: `Cannot find member "join" in base "${base}".`, loc: e.loc });
      diags.push({ code: "join-not-found", message: `Function "join()" not found in base ${base}.`, loc: e.loc });
    }
    return;
  }
  if (e.args.length === 0) {
    diags.push({
      code: "join-arity",
      message: `Too few arguments for "join()" call. Expected at least 1 but received 0.`,
      loc: e.loc,
    });
    return;
  }
  if (e.args.length > 1) {
    diags.push({
      code: "join-arity",
      message: `Too many arguments for "join()" call. Expected at most 1 but received ${e.args.length}.`,
      loc: e.loc,
    });
    return;
  }
  const t = staticType(e.args[0] as Expr);
  const msg = t === null ? undefined : JOIN_BAD_ARG[t];
  if (msg !== undefined) diags.push({ code: "join-arg", message: msg, loc: e.loc });
}

function checkCall(name: string, e: Extract<Expr, { kind: "call" }>, diags: Diagnostic[]): void {
  if (name !== "bool" || e.args.length === 0) return;
  const t = staticType(e.args[0] as Expr);
  if (t === "Array" || t === "String" || t === "Dictionary") {
    diags.push({
      code: "bool-ctor-signature",
      message: `No constructor of "bool" matches the signature "bool(${t})".`,
      loc: e.loc,
    });
  }
}
