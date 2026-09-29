import { staticMemberFn } from "./ir";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Pattern, Stmt, TypeRef, VarDecl } from "./ir";

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

type StaticType = "int" | "float" | "String" | "bool" | "null" | "Array" | "Dictionary" | null;

function declNames(d: Decl): string[] {
  return [
    ...d.vars.map((v) => v.name),
    ...d.signals.map((s) => s.name),
    ...d.funcs.map((f) => f.name),
    ...d.innerClasses.map((c) => c.name),
  ];
}

export function analyze(m: Module, globals: Iterable<string> = []): Diagnostic[] {
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
  for (const c of m.innerClasses) checkClass(c, classScopeBase, diags);
  checkStaticAccess(m.funcs, m.vars, diags);
  checkClassFuncVisibility(m, diags);
  checkTypedCollections(m, diags);
  checkTypedIndexSlots(m, diags);
  checkVoidMethodValues(m, diags);
  checkPackIsAs(m, diags);
  checkTypedVarAssign(m, diags);

  return diags;
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
        const st = staticType(it);
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
    case "StringName":
      return st === "String";
    case "Vector2":
    case "Vector3":
    case "Vector2i":
    case "Color":
      return false;
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
    return staticType(e);
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

/**
 * Godot 对「取 void 方法的返回值」是**解析期**报错，文本是
 * `Cannot get return value of call to "append()" because it returns "void".`（实测）。
 * 我们原先照直编，产物会给出一个值（装箱轨是 `<null>`、裸轨甚至是数组长度）—— 静默错。
 *
 * 只在**能证明接收者是容器**时才报：变量的初值是数组/字典字面量，或标注是 `Array`/`Dictionary`
 * （含定型标注）。一旦该变量被赋成别的形状就把它从表里删掉 —— 宁可漏报，不可误拦合法工程
 * （自定义类上同名的 `append`/`clear` 不该被这条撞上）。
 *
 * 实测的 void 集合：Array 的 `append`/`push_front`/`push_back`/`remove_at`/`clear`/`fill`/`erase`，
 * Dictionary 的 `clear`。**不是** void 的（别顺手加进来）：`insert` 与 `resize` 给状态码 int（0/31）、
 * `pop_back`/`pop_front`/`pop_at` 给元素、`Dictionary.erase` 给 bool、`Dictionary.get` 给值。
 */
const VOID_ARRAY_METHODS = new Set(["append", "push_front", "push_back", "remove_at", "clear", "fill", "erase"]);
const VOID_DICT_METHODS = new Set(["clear"]);
/**
 * `PackedByteArray` 那一侧的 void 集合（`tmp/void-probe` 三个批次量完的，与 Array 那套**不是**同一张表）：
 * - `append` 返回的是 **bool**（实测印出 `false`，元素照样追加）—— 别照 Array 那条当 void 拦；
 * - `insert` / `resize` 返回 **Error 状态码**（成功 0，负数与越界 31 且原样不动），与 Array 同形；
 * - `append_array` / `remove_at` / `fill` 取值是解析期错（void 那句）；
 * - 零参的 `sort` / `reverse` 也在 void 那一族（`var s = b.sort()` 实测就是 void 那句，用例 137）。
 *   同一件事**塞进 `print(...)` 的实参位**时 Godot 换了一句（`Function "sort()" not found in base self.`，
 *   见 S168 的探针 `tmp/void-probe/sort.gd`）—— 两句都是拒，我们统一发 void 那句，位置别猜。
 */
const VOID_BYTES_METHODS = new Set(["append_array", "remove_at", "fill"]);
const VOID_BYTES_ZEROARG = new Set(["sort", "reverse"]);
/**
 * 这九种形状的 void 表**逐个量过、口径一致**（byte：`tmp/void-probe`，int32 / int64：
 * `tmp/pack-probe` 的 k-* 与 h-*ret 系列，float32 / float64：`tmp/fp/probe2`，String：
 * `tmp/fp/probe5`，向量与颜色三种：`tmp/fp/probe8` 的 sortval / fillval / rmval / revval）。
 * 只有 `append_array` 在向量与颜色那三种上没单独量（探针那句写错了括号），照六边一致的表推过去 ——
 * 推错的方向是「Godot 跑、我们拒」，可接受。
 */
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

type ContainerShape = "Array" | "Dictionary" | "Pack";

/**
 * 给定型变量赋值的静态判定（f4/f8/f9 实测）：不合式的组合在 Godot 是**解析期**错，
 * 形体与定型容器那族一模一样 —— 实参是字面量报两条（先槽位后赋值），实参是变量只报赋值那条。
 * 只列实测过的组合：`null` 对 int/float/bool/String 四个槽都报（f8 四条），
 * String 槽只收 String（int/float/bool 都报，f4/f9），int 槽收 int/float/bool（截断与 1，f5/f6 实测值）。
 * 没测过的组合一律返回 null 不报 —— 误拦合法工程比漏报更糟（sema 那 0 误报是硬指标）。
 */
function varSlotHolds(slot: string, st: NonNullable<StaticType>): boolean | null {
  switch (slot) {
    case "int":
      if (st === "int" || st === "float" || st === "bool") return true;
      if (st === "String" || st === "null") return false;
      return null;
    case "float":
      if (st === "int" || st === "float") return true;
      if (st === "null" || st === "String") return false;
      return null;
    case "bool":
      if (st === "bool" || st === "int") return true;
      if (st === "null" || st === "String") return false;
      return null;
    case "String":
      if (st === "String") return true;
      if (st === "int" || st === "float" || st === "bool" || st === "null") return false;
      return null;
    default:
      return null;
  }
}

function checkTypedVarAssign(m: Module, diags: Diagnostic[]): void {
  const scalarType = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    return base === "int" || base === "float" || base === "bool" || base === "String" ? base : null;
  };

  const checkBody = (body: Stmt[], outer: Map<string, string>): void => {
    const decls = new Map(outer);
    const stmt = (s: Stmt): void => {
      switch (s.kind) {
        case "var": {
          const d = scalarType(s.type);
          if (d !== null) decls.set(s.name, d);
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
                if (s.value.kind === "lit") {
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
    const staticOf = (e: Expr, d: Map<string, string>): NonNullable<StaticType> | null => {
      if (e.kind === "ident") {
        const t = d.get(e.name);
        return t === undefined ? null : (t as NonNullable<StaticType>);
      }
      return staticType(e);
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
    for (const f of funcs) checkBody(f.body, outer);
  };

  run(m.vars, m.funcs);
  const classes = (c: ClassDecl): void => {
    run(c.vars, c.funcs);
    for (const inner of c.innerClasses) classes(inner);
  };
  for (const c of m.innerClasses) classes(c);
}

function checkVoidMethodValues(m: Module, diags: Diagnostic[]): void {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);

  const shapeOf = (e: Expr): ContainerShape | null => {
    if (e.kind === "array") return "Array";
    if (e.kind === "dict") return "Dictionary";
    if (e.kind === "call" && e.callee.kind === "ident" && PACK_SHAPE_NAMES.has(e.callee.name)) {
      return "Pack";
    }
    return null;
  };

  for (const body of bodies) {
    const shapes = new Map<string, ContainerShape>();
    const expr = (e: Expr, discarded: boolean): void => {
      switch (e.kind) {
        case "call": {
          if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" && !discarded) {
            const shape = shapes.get(e.callee.obj.name);
            const name = e.callee.name;
            const isVoid =
              shape === "Pack"
                ? VOID_BYTES_METHODS.has(name) || (e.args.length === 0 && VOID_BYTES_ZEROARG.has(name))
                : (shape === "Array" ? VOID_ARRAY_METHODS : shape === "Dictionary" ? VOID_DICT_METHODS : null)?.has(name) === true;
            if (isVoid) {
              diags.push({
                code: "void-method-value",
                message: `Cannot get return value of call to "${name}()" because it returns "void".`,
                loc: e.loc,
              });
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
    case "Color":
      return name;
    default:
      return null;
  }
}

/**
 * 静态方法里碰实例成员 —— Godot 在**解析期**就拒（S160 实测的 f21 / f22 两条原文）：
 * - 裸读实例变量：`Cannot access non-static variable "mv" from the static function "reads()".`
 * - 裸调实例方法：`Cannot call non-static function "imeth()" from the static function "calls()".`
 * 不拦的话这条会编成产物，而 JS 静态方法里的 `this` 是**类本身**，`this.mv` 静默给 undefined ——
 * 正是最难查的那一形。`const`（isConst）与 `static var`（isStatic）都不算实例变量：
 * 静态里读常量实测成立（f15 t4/t5），静态里读写本类静态变量也实测成立（f17 t6、f23 t3/t4 —— S161）。
 */
/**
 * `is` / `as` 指向 Packed\*Array 的**解析期**拒（S172 实测，step 72）。操作数的静态类型判得出来时
 * Godot 根本不让编：`is` 一句 `Expression is of type "T" so it can't be of type "PackedX".`，
 * `as` **两句**（`Cannot cast a value of type "int" as "PackedByteArray".` +
 * `Invalid cast. Cannot convert from "int" to "PackedByteArray".`）。
 * 判不出来（变量、函数返回）就留到运行期 —— 那时各认各的形状，而且 pack `is Array` / `is Object`
 * 都是**假**、只有 `is Variant` 真（rt.isType 那侧实现）。
 * 只认实测过的类型名拼写，认不出的一律不报（宁可漏报，不可误拦合法工程）。
 */
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
/** 能静态判出来的操作数类型（S172 一条条量过的拼写；`null` 那格的文本没量，故意不列）。 */
const STATIC_VALUE_TYPES = new Set(["Vector2", "Vector3", "Vector2i", "Color"]);

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
    const found: Extract<Expr, { kind: "is" | "as" }>[] = [];
    walkExprKinds(body, found);
    for (const node of found) {
      if (node.type.kind !== "named") continue;
      const target = node.type.name.replace(/\[.*\]$/, "");
      const packTarget = PACK_IS_AS_NAMES.has(target);
      const snAgainstString = target === "String" && node.kind === "is" && staticTypeName(node.operand) === "StringName";
      if (!packTarget && !snAgainstString) continue;
      const from = staticTypeName(node.operand);
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

/**
 * 函数体里所有**局部声明**的名字：形参、`var`、`for` 的循环变量、`match` 的绑定、lambda 的形参。
 * 用来避免「局部遮蔽了外层名字却被当成外层名字报错」这一类误报 —— 误报在这套判据里是硬伤。
 */
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

function checkClass(c: ClassDecl, base: Scope, diags: Diagnostic[]): void {
  const scope = base.child([c.name, ...declNames(c)]);
  const coroutines = new Set(c.funcs.filter((f) => f.coroutine).map((f) => f.name));
  checkStaticAccess(c.funcs, c.vars, diags);
  for (const f of c.funcs) checkFunc(f, scope, coroutines, diags);
  for (const inner of c.innerClasses) checkClass(inner, scope, diags);
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
      if (!scope.has(e.name)) {
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

/**
 * `join()` 的实参形状（全部实测自 Godot 4.6.3 的解析期诊断）。
 * 字典走 `Invalid argument …` 那条，标量走 `Cannot pass a value of type … as "PackedStringArray"` 那条 ——
 * 两条文本不同，别合成一条。Array（含未定型字面量、Array[String]）是**合法**实参，不在此表。
 */
const JOIN_BAD_ARG: Record<string, string> = {
  Dictionary: `Invalid argument for "join()" function: argument 1 should be "PackedStringArray" but is "Dictionary".`,
  String: `Cannot pass a value of type "String" as "PackedStringArray".`,
  int: `Cannot pass a value of type "int" as "PackedStringArray".`,
  float: `Cannot pass a value of type "float" as "PackedStringArray".`,
  bool: `Cannot pass a value of type "bool" as "PackedStringArray".`,
  null: `Cannot pass a value of type "null" as "PackedStringArray".`,
};

function checkMethodCall(name: string, e: Extract<Expr, { kind: "call" }>, diags: Diagnostic[]): void {
  if (name !== "join") return;
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
