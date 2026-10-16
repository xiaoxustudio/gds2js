import { staticMemberFn } from "./ir";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "./static-arg-types";
import { FACE_ARG_AS, FACE_ARG_TYPES, FACE_SLOTS } from "./face-arg-types";
import { INSTANCE_ARG_AS, INSTANCE_ARG_TYPES } from "./instance-arg-types";
import { isGlobalConst } from "./globals";
import {
  ARG_TYPE_FOLLOWS_FIRST,
  DERIVED_ARG_TYPES,
  GLOBAL_ARG_AS,
  GLOBAL_ARG_BOOL_REFUSED,
  GLOBAL_ARG_FOLLOWS_BOOL,
  GLOBAL_ARG_SENTENCE,
  GLOBAL_ARG_SUPPRESS_OTHER,
  GLOBAL_ARG_SHOULD_BE,
  GLOBAL_ARG_TYPES,
  GLOBAL_ARG_VARARG,
} from "./global-arg-types";
import { ENGINE_CLASS_NAMES } from "@gds2js/runtime/runtime/engine-classes";
import { GLOBAL_CALLABLES, GLOBAL_VALUE_NAMES } from "@gds2js/runtime/runtime/global-names";
import { PACK_ABSENT_ALL, PACK_ABSENT_BYTE_ONLY, PACK_ABSENT_NOT_BYTE } from "@gds2js/runtime/runtime/packed";
import {
  ARRAY_METHOD_ARITY,
  NODE_PATH_METHOD_ARITY,
  PACK_METHOD_ARITY,
  PACK_METHOD_ARITY_WITH_BYTES,
  STRING_METHOD_ARITY,
  VALUE_METHOD_ARITY,
  valueAttrKind,
} from "@gds2js/runtime/runtime/face-arity";
import { strFloat } from "@gds2js/runtime/runtime/values";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/color-named";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "./ir";

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
    private isLocal = false,
  ) {}

  has(name: string): boolean {
    return this.vars.has(name) || (this.parent !== null && this.parent.has(name));
  }

  /** 只在**函数那一段**作用域里认名字：类成员与模块变量活在函数外面，lambda 不捕获它们（`tmp/probe-capture/c1.gd` 的 K5）。 */
  hasLocal(name: string): boolean {
    return this.isLocal && (this.vars.has(name) || (this.parent !== null && this.parent.hasLocal(name)));
  }

  funcChild(names: string[], selfOk?: boolean): Scope {
    return new Scope(new Set(names), this, selfOk, true);
  }

  allowsSelf(): boolean {
    return this.selfOk ?? (this.parent !== null && this.parent.allowsSelf());
  }

  child(names: string[], selfOk?: boolean): Scope {
    return new Scope(new Set(names), this, selfOk, this.isLocal);
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

export function analyze(m: Module, globals: Set<string> = new Set<string>(), owner?: string): Diagnostic[] {
  // 记号表是进程内累积的：每份模块归一个自己的主，两份文件同 `行:列` 的同名字就不会互相抢记号（§6 第 61 条）
  markOwner = m.markOwner = owner !== undefined && owner !== "" ? owner : `#${++markSeq}`;
  seedOuterNames(m);
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

  // 宿主基类（`extends SceneTree`）那面的裸方法名当值用（S358 / S366 / S368）：根模块与 `extends` 链顶端挂着宿主的那一份认（S369），其余照旧
  const hostFace = m.extends === "SceneTree" || m.hostChain === true ? HOST_VALUE_METHODS : NO_HOST_VALUE_METHODS;
  for (const f of m.funcs) checkFunc(f, moduleScope, coroutines, diags, hostFace);
  checkFieldInits(m.vars, moduleScope, coroutines, diags, hostFace);
  for (const c of m.innerClasses) checkClass(c, classScopeBase, diags, classes);
  checkStaticAccess(m.funcs, m.vars, diags);
  checkClassFuncVisibility(m, diags);
  checkTypedCollections(m, diags);
  checkTypedIndexSlots(m, diags);
  checkConstAssign(m, diags, hostFace);
  checkBoolOrdering(m, diags);
  checkPackIsAs(m, diags);
  checkPackArgSlots(m, diags);
  checkPercentFormat(m, diags);
  checkPackFaceNames(m, diags);
  checkDictMethodArity(m, diags);
  checkArrayMethodArity(m, diags);
  // 元数那句排在取值 void 那句之前：`print(d.assign())` 引擎给的是 `Too few arguments for "assign()" call.`（S378 量过），
  // 而元数合法的那一格才轮到的 `Cannot get return value …`（S404 的 `tmp/probe-voidnames/compare79.txt`）。
  checkVoidMethodValues(m, diags);
  checkCtorSignatures(m, diags);
  checkStringMethodArity(m, diags);
  checkNamedFace(m, STRINGNAME_FACE, diags);
  checkNamedFace(m, NODE_PATH_FACE, diags);
  checkOperandPairs(m, diags);
  checkFuncArgSlots(m, new Set(globals), diags);
  checkTypedVarAssign(m, diags);
  checkParamDefaultAssign(m, diags);
  checkVoidAnnotation(m, diags);
  checkScriptClassSlots(m, diags);
  checkSignalDefaults(m, diags);
  checkDictDuplicateKeys(m, diags);
  checkValueMethodArity(m, diags);
  checkInitContracts(m, new Set(globals), diags);
  checkPropertyDelegates(m, diags);

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
  /** 这一份文件里的脚本类名（内部类）：做定形容器的内部型时，引擎只发第二句（`Array[Inner]` 那一形） */
  const classNames = new Set<string>();
  const collectClassNames = (c: ClassDecl): void => {
    classNames.add(c.name);
    for (const inner of c.innerClasses) collectClassNames(inner);
  };
  for (const c of m.innerClasses) collectClassNames(c);
  /** 模块级带定形标注的 var：赋给它的字面量同格判（`q = ["s"]` 那一形） */
  const typedVars = new Map<string, TypeRef>();
  for (const v of m.vars) if (v.type !== null) typedVars.set(v.name, v.type);
  /** 本工程函数的形参标注：实参位置同格判（`g(["s"])` 那一形） */
  const fnParams = new Map<string, (TypeRef | null)[]>();
  for (const f of m.funcs) fnParams.set(f.name, f.params.map((p) => p.type));
  const walkStmts = (stmts: Stmt[], retType: TypeRef | null): void => {
    for (const s of stmts) {
      if (s.kind === "var") targets.push({ type: s.type, init: s.init, loc: s.loc });
      else if (s.kind === "if") for (const b of s.branches) walkStmts(b.body, retType);
      else if (s.kind === "for" || s.kind === "while") walkStmts(s.body, retType);
      else if (s.kind === "return" && retType !== null) targets.push({ type: retType, init: s.value, loc: s.loc });
      else if (s.kind === "assign" && s.target.kind === "ident") {
        const decl = typedVars.get(s.target.name);
        if (decl !== undefined) targets.push({ type: decl, init: s.value, loc: s.loc });
      } else walkExprs(s, retType);
    }
  };
  /** 返回值（`return ["s"]`）与本工程函数的实参（`g(["s"])`）两位的定形容器字面量（S454，读数 `tmp/d6/n1.txt`） */
  const walkExprs = (n: unknown, retType: TypeRef | null): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkExprs(x, retType);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o.kind === "var") {
      const t = o.type as TypeRef | null;
      if (t !== null) targets.push({ type: t, init: (o.init as Expr | null) ?? null, loc: o.loc as Loc });
    }
    if (o.kind === "return" && retType !== null) targets.push({ type: retType, init: (o.value as Expr | null) ?? null, loc: o.loc as Loc });
    if (o.kind === "assign" && retType !== null && (o.target as Record<string, unknown> | undefined)?.kind === "ident") {
      const name = (o.target as Record<string, unknown>).name;
      const decl = typeof name === "string" ? typedVars.get(name) : undefined;
      if (decl !== undefined) targets.push({ type: decl, init: o.value as Expr, loc: o.loc as Loc });
    }
    if (o.kind === "call" && Array.isArray(o.args)) {
      const callee = o.callee as Record<string, unknown>;
      if (callee.kind === "ident" && typeof callee.name === "string") {
        const pt = fnParams.get(callee.name);
        if (pt !== undefined) {
          const args = o.args as Expr[];
          for (let i = 0; i < args.length && i < pt.length; i++) {
            const t = pt[i];
            if (t !== undefined && t !== null) targets.push({ type: t, init: args[i] ?? null, loc: args[i]!.loc });
          }
        }
      }
    }
    for (const key of Object.keys(o)) {
      if (key !== "loc") walkExprs(o[key], retType);
    }
  };
  for (const f of m.funcs) walkStmts(f.body, f.returnType);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) walkStmts(f.body, f.returnType);
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
        message: "Nested typed collections are not supported.",
        loc: t.loc,
      });
      continue;
    }
    if (t.init === null) continue;
    /** 定形容器的元素/键/值不合式：引擎只报**第一个**，而且两句都在声明那一行（读数 `tmp/d6/l5.txt` 六格）。
     *  内部型是脚本类名时只发第二句（`Array[Inner]` 那一格，读数 `tmp/d6/n1.txt`）。 */
    const holds = (kind: string, st: NonNullable<StaticType>): boolean => (classNames.has(kind) ? st === kind : canHold(kind, st));
    const report = (st: NonNullable<StaticType>, kind: string, second: string): void => {
      if (!classNames.has(kind)) {
        diags.push({ code: "typed-collection-literal", message: `Cannot include a value of type "${st}" as "${kind}".`, loc: t.loc });
      }
      diags.push({ code: "typed-collection-element", message: second, loc: t.loc });
    };
    if (m2[1] === "Array") {
      const kind = inner.trim();
      if (t.init.kind === "array") {
        let done = false;
        for (const it of t.init.items) {
          if (done) break;
          const st = slotSource(it);
          if (st === null || holds(kind, st)) continue;
          done = true;
          report(st, kind, `Cannot have an element of type "${st}" in an array of type "Array[${kind}]".`);
        }
      }
    } else {
      const parts = inner.split(",").map((p) => p.trim());
      const keyKind = parts[0] ?? "";
      const valKind = parts[1] ?? "";
      if (t.init.kind === "dict" && parts.length === 2) {
        const text = `Dictionary[${keyKind}, ${valKind}]`;
        let done = false;
        for (const en of t.init.entries) {
          if (done) break;
          const ks = slotSource(en.key);
          if (ks !== null && !holds(keyKind, ks)) {
            done = true;
            report(ks, keyKind, `Cannot have a key of type "${ks}" in a dictionary of type "${text}".`);
            break;
          }
          const vs = slotSource(en.value);
          if (vs !== null && !holds(valKind, vs)) {
            done = true;
            report(vs, valKind, `Cannot have a value of type "${vs}" in a dictionary of type "${text}".`);
          }
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

type TypedSlot = { decl: string; kind: "Array" | "Dictionary"; elem?: string; key?: string; val?: string; ann?: string };

const dictIntReads = new Set<string>();
const diKey = (line: number, col: number): string => `${markOwner}#${String(line)}:${String(col)}`;

/** 静态标注的位置型基（`Array` / `Array[k]` / `String` / 八支 pack）读的那一格：越界时引擎讲的是 `Out of bounds get index '<k>' (on base: '<声明的拼法>')`，与推断来的那一式不同（读数 `tmp/probe-typedlabel/compare{98,99}.txt`），发射器据这张表把声明拼法带到运行期。 */
const posReadLabels = new Map<string, string>();

export function posReadLabel(e: Expr): string | null {
  return e.kind === "index" ? posReadLabels.get(diKey(e.loc.line, e.loc.col)) ?? null : null;
}

/** 内建类型面的「成员名当值」记号：值就是那一面的名字，发射器据此发 `rt.boundMethod(recv, "<面>", "<名>")` 而不是 `rt.attribute`。
 *  读数 `tmp/probe-bincall/p1.gd` 的 16 面与 `compare6.txt` 的 N6 —— 引擎在那里给的是打印 `<面>::<名>` 的绑定 Callable。 */
const boundFaces = new Map<string, string>();

export function boundFace(e: Expr): { face: string; min: number; max: number } | null {
  if (e.kind !== "attribute") return null;
  const hit = boundFaces.get(diKey(e.loc.line, e.loc.col));
  if (hit === undefined) return null;
  const parts = hit.split(",");
  return { face: String(parts[0]), min: Number(parts[1]), max: Number(parts[2]) };
}

/** 静态标注的 `Dictionary` / `Dictionary[K, V]` 配静态 int 键的那一格：引擎讲的是数组那一式（`Out of bounds get index …`，S405 量过），运行期得知道谁是这一形。 */
export function isDictIntRead(e: Expr): boolean {
  return e.kind === "index" && dictIntReads.has(diKey(e.loc.line, e.loc.col));
}

/** 标注里读出字典槽：裸 `Dictionary` 与定形 `Dictionary[K, V]` 都算，其余给 null。 */
function dictSlotOf(name: string): TypedSlot | null {
  const t = parseTyped(name);
  if (t !== null && t.kind === "Dictionary") return t;
  return name === "Dictionary" ? { decl: name, kind: "Dictionary" } : null;
}

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

const ELEM_FACES = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Color", "String", "int", "float", "bool"]);

/** `Array[T]` 的内型只在认得的那几面里交出去（S460 量的那一格是**字面量 int** 下标；其余形一律不判）。 */
function elemFaceOf(decl: string): string | null {
  const slot = parseTyped(decl);
  if (slot === null || slot.kind !== "Array" || slot.elem === undefined) return null;
  return ELEM_FACES.has(slot.elem) ? slot.elem : null;
}

function checkTypedIndexSlots(m: Module, diags: Diagnostic[]): void {
  type Seed = { name: string; type: TypeRef | null };
  const moduleSeeds: Seed[] = m.vars.map((v) => ({ name: v.name, type: v.type }));
  const bodies: Array<{ stmts: Stmt[]; params: Seed[]; seeds: Seed[]; ret: TypeRef | null }> = m.funcs.map((f) => ({ stmts: f.body, params: f.params, seeds: moduleSeeds, ret: f.returnType }));
  const collect = (c: ClassDecl): void => {
    const fields: Seed[] = [...moduleSeeds, ...c.vars.map((v) => ({ name: v.name, type: v.type }))];
    for (const f of c.funcs) bodies.push({ stmts: f.body, params: f.params, seeds: fields, ret: f.returnType });
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  for (const c of m.innerClasses) collect(c);
  // 字段初始化子与模块 var 的初值也在解析期的管辖里：`var x = [1, 2]["a"]` 引擎给的是那一句下标型拒（读数 `tmp/probe-errorflow/compare91.txt` 的 r4 / r5）。
  const inits: Array<{ expr: Expr; seeds: Seed[] }> = [];
  const collectInits = (vars: VarDecl[], seeds: Seed[]): void => {
    for (const v of vars) if (v.init !== null && v.init !== undefined) inits.push({ expr: v.init, seeds });
  };
  const collectInitClasses = (c: ClassDecl): void => {
    collectInits(c.vars, [...moduleSeeds, ...c.vars.map((v) => ({ name: v.name, type: v.type }))]);
    for (const inner of c.innerClasses) collectInitClasses(inner);
  };
  collectInits(m.vars, moduleSeeds);
  for (const c of m.innerClasses) collectInitClasses(c);

  const stOf = (e: Expr, decls: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const d = decls.get(e.name);
      return d === undefined ? null : (d as NonNullable<StaticType>);
    }
    return slotSource(e) ?? (callType(e) as NonNullable<StaticType> | null);
  };

  const badKey = (slot: TypedSlot, index: Expr, decls: Map<string, string>): void => {
    const st = stOf(index, decls);
    if (st === null) return;
    if (slot.kind === "Array") {
      // 位置型基（Array / Array[k] / String / 八支 pack）的下标只收 int 与 float：其余型是解析期那一句（S404，`null` 也拒）。
      if (st === "int" || st === "float") return;
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if (slot.key === undefined) return;
    if (st === "null") return;
    if (canHold(slot.key, st)) return;
    diags.push({
      code: "typed-index-key",
      message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
      loc: index.loc,
    });
  };

  /** 位置型基的名字：标注的 `Array`（裸）/ `Array[k]` / `String` / 八支 pack，与初值推断出来的数组与串字面量。`Dictionary` 不在里头 —— 无标注字典的键型引擎不拒（量过）。 */
  const positionalSlot = (decl: string | null, init: Expr | null): TypedSlot | null => {
    if (decl !== null) {
      const t = parseTyped(decl);
      if (t !== null) return t.kind === "Array" ? t : null;
      if (decl === "Array" || decl === "String" || PACK_SHAPE_NAMES.has(decl)) return { decl, kind: "Array" };
      return null;
    }
    if (init === null) return null;
    if (init.kind === "array") return { decl: "Array", kind: "Array" };
    if (init.kind === "lit" && init.lit === "string") return { decl: "String", kind: "Array" };
    return null;
  };

  const walkExpr = (e: Expr, typed: Map<string, TypedSlot>, decls: Map<string, string>): void => {
    switch (e.kind) {
      case "index": {
        if (e.obj.kind === "ident") {
          const slot = typed.get(e.obj.name);
          if (slot !== undefined) {
            badKey(slot, e.index, decls);
            if (slot.kind === "Dictionary" && stOf(e.index, decls) === "int") dictIntReads.add(diKey(e.loc.line, e.loc.col));
            if (slot.kind === "Array" && slot.ann !== undefined) posReadLabels.set(diKey(e.loc.line, e.loc.col), slot.ann);
          }
        } else if (e.obj.kind === "array") {
          // 数组字面量直接下标：基名静态就是 `Array`，与推断的那一格同一句（读数 `tmp/probe-errorflow/compare91.txt` 的 r1 / r4 / r5）
          badKey({ decl: "Array", kind: "Array" }, e.index, decls);
        } else if (e.obj.kind === "dict") {
          // 字典字面量直接下标：基名静态就是 `Dictionary`，int 键给的是数组那一式（S406 那三格 n1 / n2 / q1）
          if (stOf(e.index, decls) === "int") dictIntReads.add(diKey(e.loc.line, e.loc.col));
        } else {
          // `self.f()` 那一形：返回型标注成字典时引擎认的是静态基名（`self.d()[0]` 给 `Out of bounds get index`，S405 量过）
          const own = e.obj.kind === "call" ? dictSlotOf(callType(e.obj) ?? "") : null;
          if (own !== null && own.kind === "Dictionary" && stOf(e.index, decls) === "int") dictIntReads.add(diKey(e.loc.line, e.loc.col));
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
      case "lambda": {
        // lambda 的体也在解析期管辖里：那三句（下标型拒、定形字典键型拒、void 取值拒）引擎在 lambda 里同样发（读数 `tmp/probe-errorflow/compare91.txt` 的 r1–r3）
        const ltyped = new Map(typed);
        const ldecls = new Map(decls);
        for (const p of e.params) {
          if (p.type === null || p.type.kind !== "named") continue;
          seedInto(ltyped, ldecls, p.name, p.type.name);
        }
        walkStmts(e.body, ltyped, ldecls);
        return;
      }
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
            if (slot !== null) typed.set(s.name, { ...slot, ann: s.type.name });
            else {
              const scalar = scalarStaticName(s.type.name);
              if (scalar !== null) decls.set(s.name, scalar);
              const pos = positionalSlot(s.type.name, null);
              if (pos !== null) typed.set(s.name, { ...pos, ann: s.type.name });
              const ds = dictSlotOf(s.type.name);
              if (ds !== null) typed.set(s.name, { ...ds, ann: s.type.name });
            }
          } else if (s.type === null) {
            const pos = positionalSlot(null, s.init);
            if (pos !== null) typed.set(s.name, pos);
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
              // 赋值那一侧引擎不挡（缺键就建键），所以这一格不登记成 int 键读
              if (slot.kind === "Dictionary" && stOf(s.target.index, decls) === "int") dictIntReads.delete(diKey(s.target.loc.line, s.target.loc.col));
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

  /** 一个表达式的静态型名：字面量与标注过的名字都认，函数调用按标注的返回型（`self.f()` 那一形，S405 量过）。 */
  const callType = (e: Expr): string | null => {
    if (e.kind !== "call" || e.callee.kind !== "attribute" || e.callee.obj.kind !== "ident") return null;
    if (e.callee.obj.name !== "self") return null;
    const called = e.callee.name;
    const d = m.funcs.find((f) => f.name === called);
    const t = d?.returnType;
    return t !== null && t !== undefined && t.kind === "named" ? t.name : null;
  };

  const seedInto = (typed: Map<string, TypedSlot>, decls: Map<string, string>, name: string, typeName: string): void => {
    const scalar = scalarStaticName(typeName);
    if (scalar !== null) decls.set(name, scalar);
    const pos = positionalSlot(typeName, null);
    if (pos !== null) typed.set(name, { ...pos, ann: typeName });
    const ds = dictSlotOf(typeName);
    if (ds !== null) typed.set(name, { ...ds, ann: typeName });
  };
  const scopeOf = (seeds: Seed[], params: Seed[], ret: TypeRef | null): [Map<string, TypedSlot>, Map<string, string>] => {
    const typed = new Map<string, TypedSlot>();
    const decls = new Map<string, string>();
    if (ret !== null && ret.kind === "named") seedInto(typed, decls, "self", ret.name);
    for (const p of seeds) {
      if (p.type === null || p.type.kind !== "named") continue;
      seedInto(typed, decls, p.name, p.type.name);
    }
    for (const p of params) {
      if (p.type === null || p.type.kind !== "named") continue;
      seedInto(typed, decls, p.name, p.type.name);
    }
    return [typed, decls];
  };
  for (const { stmts, params, seeds, ret } of bodies) {
    const [typed, decls] = scopeOf(seeds, params, ret);
    walkStmts(stmts, typed, decls);
  }
  for (const { expr, seeds } of inits) {
    const [typed, decls] = scopeOf(seeds, [], null);
    walkExpr(expr, typed, decls);
  }
}

/** Array / Dictionary 上返回 void 的方法：取它们的返回值时 Godot 在解析期报 `Cannot get return value of call to "append()" because it returns "void".`。`insert` 与 `resize` 给状态码 int、`pop_back`/`pop_front`/`pop_at` 给元素、`Dictionary.erase` 给 bool、`Dictionary.get` 给值、`Dictionary.set` 给旧值、`Dictionary.merged` 与新键的默认值都不是 void —— 别顺手加进来（24 格逐格量的，`tmp/probe-voidnames/compare79.txt`）。 */
const VOID_ARRAY_METHODS = new Set([
  "append",
  "push_front",
  "push_back",
  "remove_at",
  "clear",
  "fill",
  "erase",
  "append_array",
  "sort",
  "sort_custom",
  "reverse",
  "shuffle",
  "make_read_only",
]);
const VOID_DICT_METHODS = new Set(["clear", "sort", "merge", "assign", "make_read_only"]);
/** pack 那一侧的 void 集合，与 Array 那张**不是**同一张表：`append` 与 `push_back` 返回 bool（实测值还是 false）、`insert` / `resize` 返回 Error 状态码，都不是 void；`clear` 是（九支逐支量过，`tmp/probe-pack/nosuch.json`）。 */
const VOID_BYTES_METHODS = new Set(["append_array", "remove_at", "fill", "set", "clear"]);
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

/** `is_instance_of` 的解析期那句只在**两参都是字面量 int** 时出现，界与运行期那条同（38 照跑、39 = `TYPE_MAX` 起拒；S274 / §6 第 26 条量的）。 */
const INSTANCE_OF_TYPE_LAST = 38;

function instanceOfTypeArgMessage(e: Extract<Expr, { kind: "call" }>): string | null {
  const first = e.args[0];
  const second = e.args[1];
  if (first === undefined || second === undefined) return null;
  if (first.kind !== "lit" || first.lit !== "int") return null;
  // `-1` 在 IR 里是一元负号套字面量，引擎那侧同样是解析期那句（实测）
  const t =
    second.kind === "lit" && second.lit === "int"
      ? Number(second.value)
      : second.kind === "unary" && second.op === "-" && second.operand.kind === "lit" && second.operand.lit === "int"
        ? -Number(second.operand.value)
        : null;
  if (t === null) return null;
  if (t >= 0 && t <= INSTANCE_OF_TYPE_LAST) return null;
  return `Invalid argument for "is_instance_of()" function: Invalid type argument for is_instance_of(), use TYPE_* constants for built-in types.`;
}

/** 只收自己那一型的槽：容器、引用型与 D6 那七型（`Array = [1]`、`Dictionary = {…}`、`NodePath = ^"…"` 之外一律拒）。 */
const PARAM_OWN_SLOTS = new Set(["Array", "Dictionary", "NodePath", "Callable", "Signal",
  "Rect2", "Rect2i", "Transform2D", "Plane", "Quaternion", "Basis", "AABB"]);

/** 这一格的收/拒表（读数 `tmp/d6/pd4.py` 二百二十格分片扫）：数槽收 {int,float,bool}，String 槽连 NodePath 一起收，
 *  StringName 与 NodePath 两槽互收 String，容器 / 引用 / D6 那七型只收自己那一型，其余交回 `varSlotHolds`。 */
function holdsParamDefault(slot: string, st: string): boolean {
  if (slot === st) return true;
  if (slot === "int" || slot === "float" || slot === "bool") return st === "int" || st === "float" || st === "bool";
  if (slot === "String") return st === "String" || st === "StringName" || st === "NodePath";
  if (slot === "StringName") return st === "String" || st === "StringName";
  if (slot === "NodePath") return st === "String" || st === "NodePath";
  if (PARAM_OWN_SLOTS.has(slot)) return false;
  if (st === "Array" || st === "Dictionary" || st === "NodePath") return false;
  return varSlotHolds(slot, st as NonNullable<StaticType>) === true;
}
/** 形参默认值那一格（S448，读数 `tmp/d6/pd2-table.txt` 与 `pd4.py` 分片二百二十格）：两句的模板与变量初值同源，
 *  第二句换成 `parameter "<名>"`；容器来源只发第二句，`^"…"` 字面量在这里是证得出的源。 */
function checkParamDefaultAssign(m: Module, diags: Diagnostic[]): void {
  const slotOf = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    if (base === "int" || base === "float" || base === "bool" || base === "String" || base === "StringName") return base;
    if (PARAM_OWN_SLOTS.has(base)) return base;
    return STATIC_VALUE_TYPES.has(base) ? base : null;
  };
  const sourceOf = (e: Expr): string | null => {
    const st = slotSource(e);
    if (st !== null) return st;
    if (e.kind === "lit" && e.lit === "node_path") return "NodePath";
    return null;
  };
  const checkParams = (params: readonly Param[]): void => {
    for (const p of params) {
      const slot = slotOf(p.type);
      const def = p.default;
      if (slot === null || def === null) continue;
      const st = sourceOf(def);
      if (st === null) continue;
      if (holdsParamDefault(slot, st)) continue;
      if (st !== "Array" && st !== "Dictionary") {
        diags.push({ code: "param-default-value", message: `Cannot assign a value of type "${st}" as "${slot}".`, loc: def.loc });
      }
      diags.push({
        code: "param-default-assign",
        message: `Cannot assign a value of type ${st} to parameter "${p.name}" with specified type ${slot}.`,
        loc: def.loc,
      });
    }
  };
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) checkParams(f.params);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const f of m.funcs) checkParams(f.params);
  for (const c of m.innerClasses) walkClass(c);
  /** lambda 是另一层作用域，`flattenBody` 走到它就停，所以这里自己下钻把形参表收齐（S449）。 */
  const lambdas = (n: unknown): void => {
    if (Array.isArray(n)) {
      for (const x of n) lambdas(x);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const obj = n as Record<string, unknown>;
    if (obj.kind === "lambda") checkParams((obj.params as Param[]) ?? []);
    for (const key of Object.keys(obj)) {
      if (key !== "loc") lambdas(obj[key]);
    }
  };
  lambdas(m);
}

/** `void` 只能当函数的返回型（S450，读数 `tmp/d6/l4-void-{param,var,arr,ret}.gd` 与语料 391）：形参、变量、定形容器的内部型里出现就给那一句。
 *  一份文件里六处不合式，引擎也只出**第一句**就收口（391 的 golden 只有一行），所以这里按行序只发一条。 */
function checkVoidAnnotation(m: Module, diags: Diagnostic[]): void {
  const hasVoid = (t: TypeRef | null): boolean => {
    if (t === null || t.kind !== "named") return false;
    return t.name.split(/[\[\],]/).some((part) => part.trim() === "void");
  };
  const found: Diagnostic["loc"][] = [];
  const checkParams = (params: readonly Param[], loc: Diagnostic["loc"]): void => {
    for (const p of params) {
      if (hasVoid(p.type)) found.push(loc);
    }
  };
  const checkVar = (v: VarDecl): void => {
    if (hasVoid(v.type)) found.push(v.loc);
  };
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) checkParams(f.params, f.loc);
    for (const v of c.vars) checkVar(v);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const f of m.funcs) checkParams(f.params, f.loc);
  for (const v of m.vars) checkVar(v);
  for (const c of m.innerClasses) walkClass(c);
  const first = found.sort((a, b) => (a === null ? 1e9 : a.line) - (b === null ? 1e9 : b.line))[0];
  if (first !== undefined) {
    diags.push({ code: "void-annotation", message: `"void" is only allowed for a function return type.`, loc: first });
  }
}

/** 标注是脚本类名（这一份文件里的内部类）那一格（S452，读数 `tmp/d6/l3-class-name*.gd` 与 `l4-cls-*.gd`）：
 *  与内置型槽不同向 —— 引擎**只发第二句**，`= null` 与 `Inner.new()` 都收。 */
function checkScriptClassSlots(m: Module, diags: Diagnostic[]): void {
  const names = new Set<string>();
  const collect = (c: ClassDecl): void => {
    names.add(c.name);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  if (names.size === 0) return;
  const slotOf = (t: TypeRef | null): string | null =>
    t !== null && t.kind === "named" && names.has(t.name) ? t.name : null;
  const refuse = (name: string, kind: string, slot: string, init: Expr | null, loc: Diagnostic["loc"]): void => {
    if (init === null) return;
    const st = slotSource(init);
    if (st === null || st === "null") return;
    diags.push({
      code: "script-class-slot",
      message: `Cannot assign a value of type ${st} to ${kind} "${name}" with specified type ${slot}.`,
      loc,
    });
  };
  const walkClass = (c: ClassDecl): void => {
    for (const v of c.vars) {
      const slot = slotOf(v.type);
      if (slot !== null) refuse(v.name, "variable", slot, v.init, v.loc);
    }
    for (const f of c.funcs) {
      for (const p of f.params) {
        const slot = slotOf(p.type);
        if (slot !== null) refuse(p.name, "parameter", slot, p.default, f.loc);
      }
      walkStmtVars(f.body);
    }
    for (const inner of c.innerClasses) walkClass(inner);
  };
  const walkStmtVars = (n: unknown): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkStmtVars(x);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const obj = n as Record<string, unknown>;
    if (obj.kind === "var") {
      const slot = slotOf(obj.type as TypeRef | null);
      if (slot !== null && typeof obj.name === "string") {
        refuse(obj.name, "variable", slot, (obj.init as Expr | null) ?? null, obj.loc as Diagnostic["loc"]);
      }
    }
    for (const key of Object.keys(obj)) {
      if (key !== "loc") walkStmtVars(obj[key]);
    }
  };
  for (const v of m.vars) {
    const slot = slotOf(v.type);
    if (slot !== null) refuse(v.name, "variable", slot, v.init, v.loc);
  }
  for (const f of m.funcs) {
    for (const p of f.params) {
      const slot = slotOf(p.type);
      if (slot !== null) refuse(p.name, "parameter", slot, p.default, f.loc);
    }
    walkStmtVars(f.body);
  }
  for (const c of m.innerClasses) walkClass(c);
}

/** signal 的形参不许带默认值（S453，读数 `tmp/d6/l3-sig-*.gd` 与语料 394）：一份文件里三支不合式也只发**第一句**就收口。 */
function checkSignalDefaults(m: Module, diags: Diagnostic[]): void {
  const found: SignalDecl[] = [];
  const walkClass = (c: ClassDecl): void => {
    for (const s of c.signals) if (s.hasDefaults) found.push(s);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const s of m.signals) if (s.hasDefaults) found.push(s);
  for (const c of m.innerClasses) walkClass(c);
  const first = found.sort((a, b) => a.loc.line - b.loc.line)[0];
  if (first !== undefined) {
    diags.push({ code: "signal-default-param", message: "Signal parameters cannot have a default value.", loc: first.loc });
  }
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
        case "call": {
          if (e.callee.kind === "ident" && e.callee.name === "is_instance_of") {
            const msg = instanceOfTypeArgMessage(e);
            if (msg !== null) diags.push({ code: "instance-of-type-arg", message: msg, loc: e.loc });
          }
          expr(e.callee);
          e.args.forEach(expr);
          return;
        }
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

/** 给常量赋值是**解析期**拒，各种形状（局部 / 模块级 / 内部类 / 全局常量，含复合赋值）同一句 `Cannot assign a new value to a constant.`。两条保守边界：① 只判**简单标识符**目标；② 同一个函数体里那个名字被另绑过一次（形参、非 const 的 `var`、`for` 变量、pattern 绑定、lambda 形参）就整格放行 —— 局部可以合法遮蔽常量。
 *  同一句还盖住**能读不能写**的那三族名字（实测 `abs = 5` / `print = 5` / `Node = 5` / 宿主脚本里 `quit = 5` 与 `quit += 5` 全是它；
 *  而 `var quit: Variant = 1` 之后 `quit = 5` 合法给 5，所以 ② 那道放行正合适）。 */
function checkConstAssign(m: Module, diags: Diagnostic[], hostFace: Set<string>): void {
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

  const check = (ss: Stmt[], consts: Set<string>, rebound: Set<string>, names: Set<string>): void => {
    for (const s of ss) {
      switch (s.kind) {
        case "assign": {
          if (s.target.kind === "ident") {
            const nm = s.target.name;
            if (!rebound.has(nm) && (consts.has(nm) || isGlobalConst(nm) || GLOBAL_VALUE_NAMES.has(nm) || ENGINE_CLASS_NAMES.has(nm) || names.has(nm))) {
              diags.push({
                code: "const-assign",
                message: "Cannot assign a new value to a constant.",
                loc: s.loc,
              });
            }
          }
          check(s.value.kind === "lambda" ? s.value.body : [], consts, rebound, names);
          continue;
        }
        case "var":
          if (s.init !== null && s.init.kind === "lambda") check(s.init.body, consts, rebound, names);
          continue;
        case "if":
          for (const b of s.branches) check(b.body, consts, rebound, names);
          continue;
        case "while":
          check(s.body, consts, rebound, names);
          continue;
        case "for":
          check(s.body, consts, rebound, names);
          continue;
        case "match":
          for (const arm of s.arms) check(arm.body, consts, rebound, names);
          continue;
        case "expr":
          if (s.expr.kind === "lambda") check(s.expr.body, consts, rebound, names);
          continue;
        default:
          continue;
      }
    }
  };

  const one = (params: Param[], body: Stmt[], consts: Set<string>, names: Set<string>): void => {
    const rebound = new Set<string>(params.map((p) => p.name));
    const localConsts = new Set<string>();
    bindings(body, rebound, localConsts);
    const all = new Set<string>([...consts, ...localConsts]);
    check(body, all, rebound, names);
  };

  const accessors = (list: VarDecl[], consts: Set<string>, face: Set<string>): void => {
    for (const v of list) {
      const acc = v.accessor;
      // static var 的两支在这里不给名字表：那一形引擎发的是「静态函数」那一句，由 checkFieldInits 负责
      if (acc === null || v.isStatic) continue;
      if (acc.getter !== null && acc.getter.kind === "inline") one([], acc.getter.body, consts, face);
      if (acc.setter !== null && acc.setter.kind === "inline") {
        one([{ name: acc.setter.param, type: null, default: null }], acc.setter.body, consts, face);
      }
    }
  };

  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const consts = new Set<string>([...inherited, ...c.vars.filter((v) => v.isConst).map((v) => v.name)]);
    // 内部类看不见宿主那面（S358 实测）：不给名字表
    for (const f of c.funcs) one(f.params, f.body, consts, NO_HOST_VALUE_METHODS);
    accessors(c.vars, consts, NO_HOST_VALUE_METHODS);
    for (const inner of c.innerClasses) walkClass(inner, consts);
  };

  for (const f of m.funcs) one(f.params, f.body, moduleConsts, f.isStatic ? NO_HOST_VALUE_METHODS : hostFace);
  accessors(m.vars, moduleConsts, hostFace);
  for (const c of m.innerClasses) walkClass(c, moduleConsts);
}

/** 静态已知的两支 bool 比 `<=` / `>=`：引擎在**解析期**就拒，而且是两句话（读数 `tmp/probe-argtype/boolfamily.txt` 与 `fold36.mts`）——
 *  两支都是字面量时 `Invalid operands to operator <=, bool and bool.`，掺上一次「声明成 bool」的表达式时
 *  `Invalid operands "bool" and "bool" for "<=" operator.`。`<` / `>` 不在这儿：那两支配符对 bool **合式**（false 在前）。
 *  只认这两种形状：`var a = false` 那种**推断**来的局部引擎不当它是静态 bool（运行时才拒，走 `ops.compare` 那句标准句子）。 */
function checkBoolOrdering(m: Module, diags: Diagnostic[]): void {
  const isBoolDecl = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name === "bool";
  const moduleBools = new Set<string>(m.vars.filter((v) => isBoolDecl(v.type)).map((v) => v.name));
  // `const` 左支与字面量同式（`tmp/probe-constrecv/compare60.txt` 的 bool|bool 两格都是第一式）
  const constBools = new Set<string>(m.vars.filter((v) => v.isConst && isBoolDecl(v.type)).map((v) => v.name));

  const litBool = (e: Expr): boolean => e.kind === "lit" && typeof e.value === "boolean";
  const foldableBool = (e: Expr): boolean => litBool(e) || (e.kind === "ident" && constBools.has(e.name));

  const scan = (ss: Stmt[], bools: Set<string>): void => {
    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "binary":
          if ((e.op === "<=" || e.op === ">=") && boolSide(e.left) && boolSide(e.right)) {
            diags.push({
              code: "bool-ordering",
              message:
                foldableBool(e.left) && foldableBool(e.right)
                  ? `Invalid operands to operator ${e.op}, bool and bool.`
                  : `Invalid operands "bool" and "bool" for "${e.op}" operator.`,
              loc: e.loc,
            });
          }
          expr(e.left);
          expr(e.right);
          return;
        case "unary":
          expr(e.operand);
          return;
        case "call":
          expr(e.callee);
          e.args.forEach(expr);
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
        case "lambda":
          scan(e.body, new Set([...bools, ...e.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
          return;
        case "await":
          expr(e.operand);
          return;
        default:
          return;
      }
    };
    const boolSide = (e: Expr): boolean => litBool(e) || (e.kind === "ident" && bools.has(e.name));
    for (const s of ss) {
      switch (s.kind) {
        case "var":
          if (isBoolDecl(s.type)) bools.add(s.name);
          if (s.init !== null) expr(s.init);
          continue;
        case "assign":
          expr(s.target);
          expr(s.value);
          continue;
        case "expr":
          expr(s.expr);
          continue;
        case "return":
          if (s.value !== null && s.value !== undefined) expr(s.value as Expr);
          continue;
        case "if":
          for (const b of s.branches) {
            if (b.cond !== null) expr(b.cond);
            scan(b.body, bools);
          }
          continue;
        case "while":
          expr(s.cond);
          scan(s.body, bools);
          continue;
        case "for":
          expr(s.iter);
          scan(s.body, bools);
          continue;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) scan(arm.body, bools);
          continue;
        default:
          continue;
      }
    }
  };

  for (const f of m.funcs) scan(f.body, new Set([...moduleBools, ...f.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const bools = new Set([...inherited, ...c.vars.filter((v) => isBoolDecl(v.type)).map((v) => v.name)]);
    for (const f of c.funcs) scan(f.body, new Set([...bools, ...f.params.filter((p) => isBoolDecl(p.type)).map((p) => p.name)]));
    for (const inner of c.innerClasses) walkClass(inner, bools);
  };
  for (const c of m.innerClasses) walkClass(c, moduleBools);
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
        case "lambda":
          // 引擎那句在 lambda 体里同样发（读数 `tmp/probe-errorflow/compare91.txt` 的 r3）
          for (const p of e.params) {
            if (p.type !== null && p.type.kind === "named") {
              if (/^Array(\[|$)/.test(p.type.name)) shapes.set(p.name, "Array");
              else if (/^Dictionary(\[|$)/.test(p.type.name)) shapes.set(p.name, "Dictionary");
              else if (PACK_SHAPE_NAMES.has(p.type.name)) shapes.set(p.name, "Pack");
            }
          }
          stmts(e.body);
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
/** 每支方法逐位的声明槽：`e` 是元素型、`i` 是 int（下标 / 计数 / 容量）、`b` 是 bool（`bsearch` 的 `before`）—— 九面 2160 格两侧对过（`tmp/probe-packargs/`）。 */
const PACK_ARG_POSITIONS: Record<string, readonly string[]> = {
  append: ["e"], push_back: ["e"], fill: ["e"], has: ["e"], count: ["e"], erase: ["e"],
  get: ["i"], set: ["i", "e"], insert: ["i", "e"], find: ["e", "i"], rfind: ["e", "i"],
  bsearch: ["e", "b"], resize: ["i"], slice: ["i", "i"], remove_at: ["i"],
};
/** int 槽与 bool 槽能进的来源：int 槽收 int / float / bool，bool 槽同样收三支（实测 `bsearch(1, 2)` 照收）；文本都是同一套两句。 */
const PACK_INT_SLOT_OK = ["int", "float", "bool"];
const PACK_BOOL_SLOT_OK = ["bool", "int", "float"];

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

/** 容器方法那几道闸门共用的一趟走查：按函数体分组（模块级 + 内部类递归），每组是扁平的 IR 节点表。
 *  lambda 体不进去（它另有一套作用域，见 `checkLambdaScope`），`loc` 不下潜（它只是位置，不是节点）。 */
function flattenBody(body: Stmt[]): Record<string, unknown>[] {
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
  return nodes;
}

function flattenBodies(m: Module): Record<string, unknown>[][] {
  const bodies: Stmt[][] = [...m.funcs.map((f) => f.body)];
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) bodies.push(f.body);
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  return bodies.map(flattenBody);
}

/** 同一函数体里被赋过值的名字：静态证明一律作废（证不出就当不知道，宁可漏拦不误拦）。 */
function reassignedNames(nodes: Record<string, unknown>[]): Set<string> {
  const out = new Set<string>();
  for (const n of nodes) {
    if (n.kind !== "assign") continue;
    const target = n.target as Record<string, unknown> | undefined;
    if (target !== undefined && target.kind === "ident" && typeof target.name === "string") out.add(target.name);
  }
  return out;
}

/** 元数两句（`Too few` / `Too many`）按表发，三族容器同一族句子（S305 值类型、S376 pack、S378 字典、S379 数组）。 */
function arityDiag(
  table: Record<string, [number, number]>,
  code: string,
  method: string,
  got: number,
  loc: Diagnostic["loc"],
): Diagnostic | null {
  const sig = table[method];
  if (sig === undefined) return null;
  if (got >= sig[0] && got <= sig[1]) return null;
  return {
    code,
    message:
      got < sig[0]
        ? `Too few arguments for "${method}()" call. Expected at least ${sig[0]} but received ${got}.`
        : `Too many arguments for "${method}()" call. Expected at most ${sig[1]} but received ${got}.`,
    loc,
  };
}

/** 一面的接收者证明集合 = 该函数体的局部 `var`，加上外面那三层能静态证出这一面的名字：
 *  模块级 `var` / `const`、本函数的**形参标注**、内部类自己的**字段**（S389 量的模块那一形 + S391 量的后两形，
 *  读数 `tmp/probe-modrecv/compare{44,47,48}.txt`）。三条重赋值口径都照读数：
 *  带标注的（模块 var、形参、内部类字段）被重新赋值**仍算**，只有「初值推断」那两条 —— 模块级与内部类字段 ——
 *  在名字被赋过值时丢掉（模块那条形实测不拦：`var s = "ab"` 后 `s = v` 再 `s.length(1)` 引擎给 `S|ok`）。 */
function faceReceiverNames(
  nodes: Record<string, unknown>[],
  seeded: Map<string, "annot" | "inferred">,
  assigned: Set<string>,
  type: string,
  isInit: (init: Expr) => boolean,
  annotOnly = false,
): Set<string> {
  const named = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name.replace(/\[.*\]$/, "") === type;
  const out = new Set<string>();
  for (const [name, how] of seeded) {
    if (how === "annot") out.add(name);
    else if (!annotOnly && !assigned.has(name)) out.add(name);
  }
  const reassigned = reassignedNames(nodes);
  for (const n of nodes) {
    if (n.kind !== "var" || typeof n.name !== "string") continue;
    if (reassigned.has(n.name)) {
      out.delete(n.name);
      continue;
    }
    if (named(n.type as TypeRef | null)) {
      out.add(n.name);
      continue;
    }
    const init = n.init as Expr | null;
    if (!annotOnly && init !== null && isInit(init)) out.add(n.name);
    else if (init === null || !isInit(init) || annotOnly) {
      if (annotOnly && named(n.type as TypeRef | null)) continue;
      out.delete(n.name);
    }
  }
  return out;
}

/** 每个函数体一份「外面证得出的名字」：顶层函数拿模块级那批，内部类的方法拿自己类的字段 ——
 *  内部类能否看见模块级名字没量过，照 `checkValueMethodArity` 的同一口径不给（宁可漏拦也不误拦）。 */
function faceScopes(
  m: Module,
  type: string,
  isInit: (init: Expr) => boolean,
): Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred"> }> {
  const named = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name.replace(/\[.*\]$/, "") === type;
  const moduleNames = new Map<string, "annot" | "inferred">();
  for (const v of m.vars) {
    if (named(v.type)) moduleNames.set(v.name, "annot");
    else if (v.init !== null && isInit(v.init)) moduleNames.set(v.name, "inferred");
  }

  const out: Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred"> }> = [];
  const collect = (funcs: FuncDecl[], seededBase: Map<string, "annot" | "inferred">): void => {
    for (const f of funcs) {
      const seeded = new Map(seededBase);
      for (const p of f.params) if (named(p.type)) seeded.set(p.name, "annot");
      out.push({ nodes: flattenBody(f.body), seeded });
    }
  };
  collect(m.funcs, moduleNames);

  const collectClass = (c: ClassDecl): void => {
    const fields = new Map<string, "annot" | "inferred">();
    for (const v of c.vars) {
      if (named(v.type)) fields.set(v.name, "annot");
      else if (v.init !== null && isInit(v.init)) fields.set(v.name, "inferred");
    }
    collect(c.funcs, fields);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

/** 任何一处函数体里被赋过值的名字 —— 模块级「初值推断」那一形要按这张总表丢。 */
function moduleAssignedNames(m: Module): Set<string> {
  const out = new Set<string>();
  for (const nodes of flattenBodies(m)) for (const n of reassignedNames(nodes)) out.add(n);
  return out;
}

/** 容器方法调用的那一道形状检查：接收者只认「字面量直接当接收者」与「静态证明过的名字」两种，
 *  字面量那一维由调用方给判据（`{…}` / `[…]` / `"…"` 三族的 IR 形状不同），名字集合是调用方按标注与初值算出来的。 */
function containerCallArity(
  n: Record<string, unknown>,
  table: Record<string, [number, number]>,
  code: string,
  names: Set<string>,
  isLiteral: (obj: Record<string, unknown>) => boolean,
): Diagnostic | null {
  if (n.kind !== "call") return null;
  const callee = n.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "attribute") return null;
  const obj = callee.obj as Record<string, unknown> | undefined;
  if (obj === undefined) return null;
  const proven = isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name));
  if (!proven) return null;
  const method = callee.name;
  if (typeof method !== "string") return null;
  return arityDiag(table, code, method, ((n.args as Expr[]) ?? []).length, (n.loc as Diagnostic["loc"]) ?? null);
}

/** 632 格（158 个名字 × 四面）的裁判读数把「存在 / 表外」逐名判过一遍（尺 `tmp/probe-slice/round4.mts`，读数 `compare106.txt`）：
 *  存在名单 = 各面元数表的键 ∪ 下面这些「存在但没量元数」的名字，其余一律按表外发那两句。
 *  名单之外的成员名（我们没列进任何一面的表、也没量过的）会被误拦 —— 兜底的是那几张表本身就是**按引擎成员表逐名量出来的**
 *  （S378 / S379 / S380 三面 49+51+109 名过裁判），加上 `face-arg-allow-list` 那 1246 格与 `p2-t4` 那 1358 格都在替这张名单站岗。 */
const FACE_EXISTS_BEYOND_ARITY: Record<string, readonly string[]> = {
  String: [],
  Array: ["set"],
  Dictionary: ["set", "is_typed", "is_same_typed"],
};

/** 接收者静态已知（字面量、标注变量、形参标注）而方法名在那一面的表外：引擎发的是解析期拒。
 *  `String` / `Array` / 八支 pack 是两句，`Dictionary` 只给第二句（16 格读数 `tmp/probe-slice/compare{104,105}.txt`）。
 *  推断来的名字与 `Variant` 装箱都不算静态 —— 那两形解析期放过、运行期才给 `Invalid call. Nonexistent function …`。 */
function faceGhostDiags(
  n: Record<string, unknown>,
  table: Record<string, [number, number]>,
  type: string,
  twoSentences: boolean,
  names: Set<string>,
  isLiteral: (obj: Record<string, unknown>) => boolean,
): Diagnostic[] {
  if (n.kind !== "call") return [];
  const callee = n.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "attribute") return [];
  const obj = callee.obj as Record<string, unknown> | undefined;
  if (obj === undefined) return [];
  if (!(isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name)))) return [];
  const method = callee.name;
  if (typeof method !== "string" || method in table) return [];
  if ((FACE_EXISTS_BEYOND_ARITY[type] ?? []).includes(method)) return [];
  const loc = (n.loc as Diagnostic["loc"]) ?? null;
  const out: Diagnostic[] = [];
  if (twoSentences) {
    out.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${type}".`, loc });
  }
  out.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${type}.`, loc });
  return out;
}

/** `String % 值` 的解析期判据（S445，读数 `tmp/probe-pct/`：160 格矩阵 + 52 个转换符全扫 + 264 / 126 / 340 格三张语法面）：
 *  引擎在**解析期**按槽位逐个判，第一个不合式那一格说话；实参是 Array / Dictionary / Packed* 构造时整族放过
 *  （那是「一支参数表 / 一张映射」的写法，读数两侧都收），来源证不出（变量、`len()`、`(1 + 2)`）也放过 —— 只判得出才判。 */
const PCT_NUMERIC = "dfoxX";
const PCT_VECTORS = new Set(["Vector2", "Vector3", "Vector4", "Vector2i", "Vector3i", "Vector4i"]);
const PCT_VALUE_CTORS = new Set(["Color", "Callable"]);

const PCT_MSG = {
  unsupported: "unsupported format character in operator %.",
  incomplete: "incomplete format in operator %.",
  number: "a number is required in operator %.",
  char: "%c requires number or single-character string in operator %.",
  negative: "unsigned integer is lower than minimum in operator %.",
  vector: "%v requires a vector type (Vector2/3/4/2i/3i/4i) in operator %.",
  star: "* wants number or vector in operator %.",
  notAll: "not all arguments converted during string formatting in operator %.",
  notEnough: "not enough arguments for format string in operator %.",
};

/** 右支证得出的静态类别：只有这四条线（数 / 负数 / 串文本 / 向量）参与判据，其余一律「非数」。 */
interface PctArg {
  num: boolean;
  neg: boolean;
  vec: boolean;
  text: string | null;
}

function pctArg(e: Expr): PctArg | null {
  if (e.kind === "lit") {
    if (e.lit === "int" || e.lit === "float") {
      const v = Number(e.value);
      return { num: true, neg: v < 0, vec: false, text: null };
    }
    if (e.lit === "string") return { num: false, neg: false, vec: false, text: String(e.value) };
    if (e.lit === "string_name" || e.lit === "node_path" || e.lit === "bool" || e.lit === "null") {
      return { num: false, neg: false, vec: false, text: null };
    }
    return null;
  }
  if (e.kind === "unary" && e.op === "-") {
    const inner = pctArg(e.operand);
    return inner === null || !inner.num ? null : { ...inner, neg: !inner.neg };
  }
  if (e.kind === "call" && e.callee.kind === "ident") {
    if (PCT_VECTORS.has(e.callee.name)) return { num: false, neg: false, vec: true, text: null };
    if (PCT_VALUE_CTORS.has(e.callee.name)) return { num: false, neg: false, vec: false, text: null };
  }
  return null;
}

type PctSlot = { kind: "star" } | { kind: "conv"; ch: string } | { kind: "tail" };

function pctSlots(fmt: string): PctSlot[] {
  const slots: PctSlot[] = [];
  const starDigits = (from: number): number => {
    let i = from;
    while (i < fmt.length && ((fmt[i] ?? "") === "*" || ((fmt[i] ?? "") >= "0" && (fmt[i] ?? "") <= "9"))) {
      if ((fmt[i] ?? "") === "*") slots.push({ kind: "star" });
      i++;
    }
    return i;
  };
  let i = 0;
  while (i < fmt.length) {
    if (fmt[i] !== "%") {
      i++;
      continue;
    }
    i++;
    if (i >= fmt.length) {
      slots.push({ kind: "tail" });
      break;
    }
    while (i < fmt.length && ["-", "+", "0", "u"].includes(fmt[i] ?? "")) i++;
    if (i < fmt.length && (fmt[i] ?? "") === "%") {
      i++;
      continue;
    }
    i = starDigits(i);
    if (i < fmt.length && (fmt[i] ?? "") === ".") {
      i = starDigits(i + 1);
    }
    if (i >= fmt.length) {
      slots.push({ kind: "tail" });
      break;
    }
    slots.push({ kind: "conv", ch: fmt[i] ?? "" });
    i++;
  }
  return slots;
}

/** 一个槽对着实参的那一句；null 是这一槽合式。 */
function pctSlotMessage(slot: PctSlot, arg: PctArg): string | null {
  if (slot.kind === "tail") return PCT_MSG.incomplete;
  if (slot.kind === "star") return arg.num || arg.vec ? null : PCT_MSG.star;
  const ch = slot.ch;
  if (ch === "s") return null;
  if (ch === "c") {
    if (arg.num) return arg.neg ? PCT_MSG.negative : null;
    return arg.text !== null && arg.text.length === 1 ? null : PCT_MSG.char;
  }
  if (ch === "v") return arg.vec ? null : PCT_MSG.vector;
  if (PCT_NUMERIC.indexOf(ch) >= 0) return arg.num ? null : PCT_MSG.number;
  return PCT_MSG.unsupported;
}

function checkPercentFormat(m: Module, diags: Diagnostic[]): void {
  for (const nodes of flattenBodies(m)) {
    for (const n of nodes) {
      if (n.kind !== "binary" || n.op !== "%") continue;
      const left = n.left as Expr;
      const right = n.right as Expr;
      if (left.kind !== "lit" || left.lit !== "string") continue;
      if (right.kind === "array" || right.kind === "dict") continue;
      const arg = pctArg(right);
      if (arg === null) continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      const slots = pctSlots(String(left.value));
      let message: string | null = null;
      let used = 0;
      for (const slot of slots) {
        if (slot.kind !== "tail") {
          if (used >= 1) {
            message = PCT_MSG.notEnough;
            break;
          }
          used++;
          message = pctSlotMessage(slot, arg);
        } else {
          message = pctSlotMessage(slot, arg);
        }
        if (message !== null) break;
      }
      if (message === null && used === 0) message = PCT_MSG.notAll;
      if (message !== null) diags.push({ code: "pct-format", message, loc });
    }
  }
}

function checkPackArgSlots(m: Module, diags: Diagnostic[]): void {
  for (const nodes of flattenBodies(m)) {
    // 只认「标注」与「字面量构造」两种证明，且被重新赋值过的名字直接丢掉 —— 证不出就当不知道
    const packs = new Map<string, string>();
    /** 同函数体内 `var v: String` 这一类**带标注的局部 var**：第二种证明，只发一句 */
    const annot = new Map<string, string>();
    const reassigned = reassignedNames(nodes);
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
      if (obj === undefined) continue;
      // 两种证明：命名过的（上面那张表）与**就地构造的链式接收者** `Face([…]).append(x)` —— 引擎对这两种同判（`tmp/probe-packargs/` 九面 2160 格两侧对过）
      const objCallee = obj.kind === "call" ? (obj.callee as Record<string, unknown> | undefined) : undefined;
      const inline = objCallee !== undefined && objCallee["kind"] === "ident" && typeof objCallee["name"] === "string"
        && String(objCallee["name"]) in PACK_ARG_SLOTS ? String(objCallee["name"]) : null;
      const pack = obj.kind === "ident" && typeof obj.name === "string" ? packs.get(obj.name) : (inline ?? undefined);
      if (pack === undefined) continue;
      const method = callee.name;
      if (typeof method !== "string") continue;
      const slots = PACK_ARG_POSITIONS[method];
      if (slots === undefined) continue;
      const args = (n.args as Expr[]) ?? [];
      const face = PACK_ARG_SLOTS[pack] as { slot: string; ok: readonly string[] };
      for (let p = 0; p < Math.min(slots.length, args.length); p++) {
        const arg0 = args[p] as Expr;
        const src = packArgSource(arg0);
        // 第二种证明：带标注的局部 var 静态就知道来源类型，但**只发第二句**（少了前面那句 `Cannot pass a value of type …`）；推断出来的与跨函数的来源（形参、别的函数的返回值）解析期放过、成运行期那句，这里不猜着发。
        const annotated = src === null && arg0.kind === "ident" ? (annot.get(arg0.name) ?? null) : null;
        const proven = src ?? annotated;
        if (proven === null) continue;
        const kind = slots[p];
        const slot = kind === "i" ? "int" : kind === "b" ? "bool" : face.slot;
        const ok = kind === "i" ? PACK_INT_SLOT_OK : kind === "b" ? PACK_BOOL_SLOT_OK : face.ok;
        if (ok.includes(proven)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        if (src !== null && proven !== "Array" && proven !== "Dictionary") {
          diags.push({ code: "pack-arg-slot", message: `Cannot pass a value of type "${proven}" as "${slot}".`, loc });
        }
        diags.push({
          code: "pack-arg-slot",
          message: `Invalid argument for "${method}()" function: argument ${String(p + 1)} should be "${slot}" but is "${proven}".`,
          loc,
        });
      }
    }
  }
}

/** pack 九支的**确认不存在**名单（尺 `tmp/probe-slice/round8.mts`：180 个候选名在构造位逐名过裁判，读数 `compare110.txt`）
 *  与运行期共用一份，摆在 `@gds2js/runtime/runtime/packed` 那一侧 —— 装箱来的 pack 值走的是运行期那句。
 *  方向是「量出来的表外名才发那句」，不是「名单外的都不存在」：候选宇宙之外的名字照旧放过，宁可漏拦不误拦。
 *  `hash` / `length` / `pop_back` 这类别的面上合法的名字，引擎在 pack 九支一律开口；`sort_custom` 虽在这一列里，
 *  但它在元数表那一侧，按「表内的先看」走元数那句。 */

/** 属性的静态接收者两形：构造位字面量与带标注的名字；推断来的名字解析期不开口（同 `tmp/probe-slice/r7c.gd`）。 */
function packFaceRecv(obj: Record<string, unknown> | undefined, ann: Map<string, string>): string | null {
  if (obj === undefined) return null;
  if (obj.kind === "ident" && typeof obj.name === "string") return ann.get(obj.name) ?? null;
  if (obj.kind === "call") {
    const inner = obj.callee as Record<string, unknown> | undefined;
    const cn = inner?.kind === "ident" ? inner.name : null;
    if (typeof cn === "string" && PACK_TYPE_NAMES.has(cn)) return cn;
  }
  return null;
}

function packNameMeasuredAbsent(kind: string, name: string): boolean {
  if (PACK_ABSENT_ALL.includes(name)) return true;
  return (kind === "PackedByteArray" ? PACK_ABSENT_BYTE_ONLY : PACK_ABSENT_NOT_BYTE).includes(name);
}

/** 属性那一形的接收者：pack 认构造位字面量与标注两形（读数 `tmp/probe-attr/compare3.txt`），
 *  `Array` / `String` 只认**标注**那一形（`tmp/probe-bincall/compare2.txt` 的 H5 / H6 / H7 / H15 四格就是标注读的），
 *  `Dictionary` 两形都不认 —— 引擎在标注字典上读属性连表外名都不在解析期开口（S419 ②）。 */
function attrFaceRecv(obj: Record<string, unknown> | undefined, ann: Map<string, string>, elems: Map<string, string> = new Map(), mods: Map<string, string> = new Map()): string | null {
  if (obj === undefined) return null;
  if (obj.kind === "index") {
    const base = obj.obj as Record<string, unknown> | undefined;
    if (base === undefined || base.kind !== "ident" || typeof base.name !== "string") return null;
    if (staticType(obj.index as Expr) !== "int") return null;
    return elemFaceOf(elems.get(base.name) ?? "");
  }
  if (obj.kind === "ident" && typeof obj.name === "string") {
    const face = ann.get(obj.name) ?? mods.get(obj.name) ?? null;
    return face === "Dictionary" ? null : face;
  }
  if (obj.kind === "array") return "Array";
  if (obj.kind === "lit" && obj.lit === "string") return "String";
  if (obj.kind === "call") {
    const inner = obj.callee as Record<string, unknown> | undefined;
    const cn = inner?.kind === "ident" ? inner.name : null;
    if (typeof cn === "string" && (cn === "Array" || cn === "String" || cn === "StringName" || cn === "NodePath" || cn in VALUE_METHOD_ARITY)) return cn;
    // 链式那一形：`v.angle().zzz` 的基是方法的**返回型**那面 —— 引擎那句就写着 base "float"（S464，读数 `tmp/d6/n7.txt`）
    if (inner !== undefined && inner.kind === "attribute") {
      const owner = attrFaceRecv(inner.obj as Record<string, unknown>, ann, elems, mods);
      const mname = inner.name;
      if (owner !== null && typeof mname === "string") {
        const by = BUILTIN_METHOD_RETURNS[owner];
        const rt = by === undefined ? undefined : by[mname];
        if (typeof rt === "string" && (instanceFaceManaged(rt) || rt === "String")) return rt;
      }
    }
  }
  if (obj.kind === "lit" && (obj.lit === "string_name" || obj.lit === "node_path")) {
    return obj.lit === "string_name" ? "StringName" : "NodePath";
  }
  return packFaceRecv(obj, ann);
}

/** 属性那一形的静态接收者多一处**形参标注**（读数 `tmp/probe-bincall/compare6.txt` 的 N1 / N2 / N3 / N4 四格与 var 标注一字一样），
 *  所以要带着每个函数体的形参表；调用那一支不扩，仍按 S414 量过的 var 标注 + 构造位。 */
function attrScopes(m: Module): Array<{ nodes: Record<string, unknown>[]; params: Array<{ name: string; type: TypeRef | null }> }> {
  const out: Array<{ nodes: Record<string, unknown>[]; params: Array<{ name: string; type: TypeRef | null }> }> = [];
  for (const f of m.funcs) out.push({ nodes: flattenBody(f.body), params: f.params });
  const collect = (c: ClassDecl): void => {
    for (const f of c.funcs) out.push({ nodes: flattenBody(f.body), params: f.params });
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
  return out;
}

/** pack 九支的表外方法名只在这两种静态接收者上发那两句（`tmp/probe-slice/r7c.gd`：同一式子把接收者换成**推断来的**名字，
 *  引擎就不在解析期开口，改成运行期那句 `Invalid call. Nonexistent function …` —— 语料 224 就是这么一份读数）。
 *  属性那一形（不调用）引擎把同一句报两遍，读数 `tmp/probe-attr/compare3.txt` 九支一字一样。 */
/** 值类型那一面在**实例接收者**上认得的成员名（方法 + 属性，取自本机 4.6.3 的 `--dump-extension-api`，类常量不算：`v.INF` / `v.DOWN` 引擎两句 `Cannot find member`，`v.abs` / `v.x` 全收 —— 读数 `tmp/d6/ap.txt`）。 */
export const BUILTIN_INSTANCE_MEMBERS: Readonly<Record<string, ReadonlyArray<string>>> = {
  "Vector2": ["abs", "angle", "angle_to", "angle_to_point", "aspect", "bezier_derivative", "bezier_interpolate", "bounce", "ceil", "clamp", "clampf", "cross", "cubic_interpolate", "cubic_interpolate_in_time", "direction_to", "distance_squared_to", "distance_to", "dot", "floor", "from_angle", "is_equal_approx", "is_finite", "is_normalized", "is_zero_approx", "length", "length_squared", "lerp", "limit_length", "max", "max_axis_index", "maxf", "min", "min_axis_index", "minf", "move_toward", "normalized", "orthogonal", "posmod", "posmodv", "project", "reflect", "rotated", "round", "sign", "slerp", "slide", "snapped", "snappedf", "x", "y"],
  "Vector2i": ["abs", "aspect", "clamp", "clampi", "distance_squared_to", "distance_to", "length", "length_squared", "max", "max_axis_index", "maxi", "min", "min_axis_index", "mini", "sign", "snapped", "snappedi", "x", "y"],
  "Vector3": ["abs", "angle_to", "bezier_derivative", "bezier_interpolate", "bounce", "ceil", "clamp", "clampf", "cross", "cubic_interpolate", "cubic_interpolate_in_time", "direction_to", "distance_squared_to", "distance_to", "dot", "floor", "inverse", "is_equal_approx", "is_finite", "is_normalized", "is_zero_approx", "length", "length_squared", "lerp", "limit_length", "max", "max_axis_index", "maxf", "min", "min_axis_index", "minf", "move_toward", "normalized", "octahedron_decode", "octahedron_encode", "outer", "posmod", "posmodv", "project", "reflect", "rotated", "round", "sign", "signed_angle_to", "slerp", "slide", "snapped", "snappedf", "x", "y", "z"],
  "Vector3i": ["abs", "clamp", "clampi", "distance_squared_to", "distance_to", "length", "length_squared", "max", "max_axis_index", "maxi", "min", "min_axis_index", "mini", "sign", "snapped", "snappedi", "x", "y", "z"],
  "Color": ["a", "a8", "b", "b8", "blend", "clamp", "darkened", "from_hsv", "from_ok_hsl", "from_rgba8", "from_rgbe9995", "from_string", "g", "g8", "get_luminance", "h", "hex", "hex64", "html", "html_is_valid", "inverted", "is_equal_approx", "lerp", "lightened", "linear_to_srgb", "ok_hsl_h", "ok_hsl_l", "ok_hsl_s", "r", "r8", "s", "srgb_to_linear", "to_abgr32", "to_abgr64", "to_argb32", "to_argb64", "to_html", "to_rgba32", "to_rgba64", "v"],
  "String": ["begins_with", "bigrams", "bin_to_int", "c_escape", "c_unescape", "capitalize", "casecmp_to", "chr", "contains", "containsn", "count", "countn", "dedent", "ends_with", "erase", "filecasecmp_to", "filenocasecmp_to", "find", "findn", "format", "get_base_dir", "get_basename", "get_extension", "get_file", "get_slice", "get_slice_count", "get_slicec", "hash", "hex_decode", "hex_to_int", "humanize_size", "indent", "insert", "is_absolute_path", "is_empty", "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_ascii_identifier", "is_valid_filename", "is_valid_float", "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int", "is_valid_ip_address", "is_valid_unicode_identifier", "join", "json_escape", "left", "length", "lpad", "lstrip", "match", "matchn", "md5_buffer", "md5_text", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "num", "num_int64", "num_scientific", "num_uint64", "pad_decimals", "pad_zeros", "path_join", "remove_char", "remove_chars", "repeat", "replace", "replace_char", "replace_chars", "replacen", "reverse", "rfind", "rfindn", "right", "rpad", "rsplit", "rstrip", "sha1_buffer", "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "split", "split_floats", "strip_edges", "strip_escapes", "substr", "to_ascii_buffer", "to_camel_case", "to_float", "to_int", "to_kebab_case", "to_lower", "to_multibyte_char_buffer", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode", "uri_file_decode", "validate_filename", "validate_node_name", "xml_escape", "xml_unescape"],
  "StringName": ["begins_with", "bigrams", "bin_to_int", "c_escape", "c_unescape", "capitalize", "casecmp_to", "contains", "containsn", "count", "countn", "dedent", "ends_with", "erase", "filecasecmp_to", "filenocasecmp_to", "find", "findn", "format", "get_base_dir", "get_basename", "get_extension", "get_file", "get_slice", "get_slice_count", "get_slicec", "hash", "hex_decode", "hex_to_int", "indent", "insert", "is_absolute_path", "is_empty", "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_ascii_identifier", "is_valid_filename", "is_valid_float", "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int", "is_valid_ip_address", "is_valid_unicode_identifier", "join", "json_escape", "left", "length", "lpad", "lstrip", "match", "matchn", "md5_buffer", "md5_text", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "pad_decimals", "pad_zeros", "path_join", "remove_char", "remove_chars", "repeat", "replace", "replace_char", "replace_chars", "replacen", "reverse", "rfind", "rfindn", "right", "rpad", "rsplit", "rstrip", "sha1_buffer", "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "split", "split_floats", "strip_edges", "strip_escapes", "substr", "to_ascii_buffer", "to_camel_case", "to_float", "to_int", "to_kebab_case", "to_lower", "to_multibyte_char_buffer", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode", "uri_file_decode", "validate_filename", "validate_node_name", "xml_escape", "xml_unescape"],
  "NodePath": ["get_as_property_path", "get_concatenated_names", "get_concatenated_subnames", "get_name", "get_name_count", "get_subname", "get_subname_count", "hash", "is_absolute", "is_empty", "slice"],
  "int": [],
  "float": [],
  "bool": [],
};

/** 调用那一形同判据：只在 `BUILTIN_INSTANCE_MEMBERS` 覆盖的那几面开口，名字不在实例成员全集里才是引擎那两句。 */
/** 名单管的那几面：`Array` / `Dictionary` / pack 九支与 `StringName` / `NodePath` 由现成的两支在管（放开就重复报）。 */
function instanceFaceManaged(face: string): boolean {
  if (face === "Array" || face === "Dictionary" || face === "StringName" || face === "NodePath" || PACK_TYPE_NAMES.has(face)) return false;
  return BUILTIN_INSTANCE_MEMBERS[face] !== undefined;
}

function instanceMemberAbsent(face: string, name: string): boolean {
  if (!instanceFaceManaged(face) && face !== "String") return false;
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

/** 值型那几面的方法**返回型**：同一份 `--dump-extension-api` 里的 `return_type`，只留返回型落在认得的那批里的名字（链式那一族的读数 `tmp/d6/n7.txt` 二十七格，S462）。 */
export const BUILTIN_METHOD_RETURNS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "Vector2": {"abs": "Vector2", "angle": "float", "angle_to": "float", "angle_to_point": "float", "aspect": "float", "bezier_derivative": "Vector2", "bezier_interpolate": "Vector2", "bounce": "Vector2", "ceil": "Vector2", "clamp": "Vector2", "clampf": "Vector2", "cross": "float", "cubic_interpolate": "Vector2", "cubic_interpolate_in_time": "Vector2", "direction_to": "Vector2", "distance_squared_to": "float", "distance_to": "float", "dot": "float", "floor": "Vector2", "from_angle": "Vector2", "is_equal_approx": "bool", "is_finite": "bool", "is_normalized": "bool", "is_zero_approx": "bool", "length": "float", "length_squared": "float", "lerp": "Vector2", "limit_length": "Vector2", "max": "Vector2", "max_axis_index": "int", "maxf": "Vector2", "min": "Vector2", "min_axis_index": "int", "minf": "Vector2", "move_toward": "Vector2", "normalized": "Vector2", "orthogonal": "Vector2", "posmod": "Vector2", "posmodv": "Vector2", "project": "Vector2", "reflect": "Vector2", "rotated": "Vector2", "round": "Vector2", "sign": "Vector2", "slerp": "Vector2", "slide": "Vector2", "snapped": "Vector2", "snappedf": "Vector2",},
  "Vector2i": {"abs": "Vector2i", "aspect": "float", "clamp": "Vector2i", "clampi": "Vector2i", "distance_squared_to": "int", "distance_to": "float", "length": "float", "length_squared": "int", "max": "Vector2i", "max_axis_index": "int", "maxi": "Vector2i", "min": "Vector2i", "min_axis_index": "int", "mini": "Vector2i", "sign": "Vector2i", "snapped": "Vector2i", "snappedi": "Vector2i",},
  "Vector3": {"abs": "Vector3", "angle_to": "float", "bezier_derivative": "Vector3", "bezier_interpolate": "Vector3", "bounce": "Vector3", "ceil": "Vector3", "clamp": "Vector3", "clampf": "Vector3", "cross": "Vector3", "cubic_interpolate": "Vector3", "cubic_interpolate_in_time": "Vector3", "direction_to": "Vector3", "distance_squared_to": "float", "distance_to": "float", "dot": "float", "floor": "Vector3", "inverse": "Vector3", "is_equal_approx": "bool", "is_finite": "bool", "is_normalized": "bool", "is_zero_approx": "bool", "length": "float", "length_squared": "float", "lerp": "Vector3", "limit_length": "Vector3", "max": "Vector3", "max_axis_index": "int", "maxf": "Vector3", "min": "Vector3", "min_axis_index": "int", "minf": "Vector3", "move_toward": "Vector3", "normalized": "Vector3", "octahedron_decode": "Vector3", "octahedron_encode": "Vector2", "posmod": "Vector3", "posmodv": "Vector3", "project": "Vector3", "reflect": "Vector3", "rotated": "Vector3", "round": "Vector3", "sign": "Vector3", "signed_angle_to": "float", "slerp": "Vector3", "slide": "Vector3", "snapped": "Vector3", "snappedf": "Vector3",},
  "Vector3i": {"abs": "Vector3i", "clamp": "Vector3i", "clampi": "Vector3i", "distance_squared_to": "int", "distance_to": "float", "length": "float", "length_squared": "int", "max": "Vector3i", "max_axis_index": "int", "maxi": "Vector3i", "min": "Vector3i", "min_axis_index": "int", "mini": "Vector3i", "sign": "Vector3i", "snapped": "Vector3i", "snappedi": "Vector3i",},
  "Color": {"blend": "Color", "clamp": "Color", "darkened": "Color", "from_hsv": "Color", "from_ok_hsl": "Color", "from_rgba8": "Color", "from_rgbe9995": "Color", "from_string": "Color", "get_luminance": "float", "hex": "Color", "hex64": "Color", "html": "Color", "html_is_valid": "bool", "inverted": "Color", "is_equal_approx": "bool", "lerp": "Color", "lightened": "Color", "linear_to_srgb": "Color", "srgb_to_linear": "Color", "to_abgr32": "int", "to_abgr64": "int", "to_argb32": "int", "to_argb64": "int", "to_html": "String", "to_rgba32": "int", "to_rgba64": "int",},
  "StringName": {"begins_with": "bool", "bin_to_int": "int", "c_escape": "String", "c_unescape": "String", "capitalize": "String", "casecmp_to": "int", "contains": "bool", "containsn": "bool", "count": "int", "countn": "int", "dedent": "String", "ends_with": "bool", "erase": "String", "filecasecmp_to": "int", "filenocasecmp_to": "int", "find": "int", "findn": "int", "format": "String", "get_base_dir": "String", "get_basename": "String", "get_extension": "String", "get_file": "String", "get_slice": "String", "get_slice_count": "int", "get_slicec": "String", "hash": "int", "hex_to_int": "int", "indent": "String", "insert": "String", "is_absolute_path": "bool", "is_empty": "bool", "is_relative_path": "bool", "is_subsequence_of": "bool", "is_subsequence_ofn": "bool", "is_valid_ascii_identifier": "bool", "is_valid_filename": "bool", "is_valid_float": "bool", "is_valid_hex_number": "bool", "is_valid_html_color": "bool", "is_valid_identifier": "bool", "is_valid_int": "bool", "is_valid_ip_address": "bool", "is_valid_unicode_identifier": "bool", "join": "String", "json_escape": "String", "left": "String", "length": "int", "lpad": "String", "lstrip": "String", "match": "bool", "matchn": "bool", "md5_text": "String", "naturalcasecmp_to": "int", "naturalnocasecmp_to": "int", "nocasecmp_to": "int", "pad_decimals": "String", "pad_zeros": "String", "path_join": "String", "remove_char": "String", "remove_chars": "String", "repeat": "String", "replace": "String", "replace_char": "String", "replace_chars": "String", "replacen": "String", "reverse": "String", "rfind": "int", "rfindn": "int", "right": "String", "rpad": "String", "rstrip": "String", "sha1_text": "String", "sha256_text": "String", "similarity": "float", "simplify_path": "String", "strip_edges": "String", "strip_escapes": "String", "substr": "String", "to_camel_case": "String", "to_float": "float", "to_int": "int", "to_kebab_case": "String", "to_lower": "String", "to_pascal_case": "String", "to_snake_case": "String", "to_upper": "String", "trim_prefix": "String", "trim_suffix": "String", "unicode_at": "int", "uri_decode": "String", "uri_encode": "String", "uri_file_decode": "String", "validate_filename": "String", "validate_node_name": "String", "xml_escape": "String", "xml_unescape": "String",},
  "NodePath": {"get_as_property_path": "NodePath", "get_concatenated_names": "StringName", "get_concatenated_subnames": "StringName", "get_name": "StringName", "get_name_count": "int", "get_subname": "StringName", "get_subname_count": "int", "hash": "int", "is_absolute": "bool", "is_empty": "bool", "slice": "NodePath",},
};

/** 只在表里有的那几面开口：名字不在实例成员集里就是引擎那两句（`valueAttrKind` 的 `null` 那一格由这张实测表接管）。 */
function builtinInstanceAbsent(face: string, name: string): boolean {
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

function checkPackFaceNames(m: Module, diags: Diagnostic[]): void {
  for (const { nodes, params } of attrScopes(m)) {
    const ann = new Map<string, string>();
    const faceName = (t: TypeRef | null): string | null =>
      t !== null && t.kind === "named" && (PACK_TYPE_NAMES.has(t.name) || t.name === "Array" || t.name === "String" || t.name === "StringName" || t.name === "NodePath" || t.name === "int" || t.name === "float" || t.name === "bool" || t.name in VALUE_METHOD_ARITY) ? t.name : null;
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string") continue;
      const face = faceName(n.type as TypeRef | null);
      if (face !== null) ann.set(n.name, face);
    }
    const attr = new Map(ann);
    for (const p of params) {
      const face = faceName(p.type);
      if (face !== null) attr.set(p.name, face);
    }
    /** 定形数组的名字单独一张表：只给 `e[0].X` 那一形交内型，不动上面那两张既有判据的范围。 */
    /** 模块顶上的标注名字：链式那一形（`v.angle().zzz`）的接收者在函数体外，得单独带进来。 */
    const mods = new Map<string, string>();
    for (const v of m.vars) {
      const face = faceName(v.type);
      if (face !== null) mods.set(v.name, face);
    }
    const elems = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && elemFaceOf(t.name) !== null) elems.set(name, t.name);
    };
    for (const v of m.vars) noteElem(v.name, v.type);
    for (const n of nodes) {
      if (n.kind === "var" && typeof n.name === "string") noteElem(n.name, n.type as TypeRef | null);
    }
    for (const prm of params) noteElem(prm.name, prm.type);
    const callCallees = new Set<unknown>();
    const writeTargets = new Set<unknown>();
    for (const n of nodes) {
      if (n.kind === "call") callCallees.add(n.callee);
      if (n.kind === "assign") {
        const t = n.target as Record<string, unknown> | undefined;
        if (t !== undefined && t.kind === "attribute") writeTargets.add(t);
      }
    }
    for (const n of nodes) {
      if (n.kind === "call") {
        const callee = n.callee as Record<string, unknown> | undefined;
        if (callee === undefined || callee.kind !== "attribute") continue;
        const kind = packFaceRecv(callee.obj as Record<string, unknown>, ann);
        if (kind === null || !PACK_TYPE_NAMES.has(kind)) {
          const vface = attrFaceRecv(callee.obj as Record<string, unknown>, ann, elems, mods);
          if (vface === null || !instanceFaceManaged(vface)) continue;
          // String 那一面只补元素读这一形：标注与构造位的接收者早由另一支在管，两支都开就报成四遍
          if (vface === "String" && (callee.obj as Record<string, unknown>).kind !== "index") continue;
          const vmethod = callee.name;
          if (typeof vmethod !== "string") continue;
          // 两边都不认才开口：只在一边认得就不拦（实测 `e[0].length()` 引擎收，我们抢拦就是过拦）
          if (vmethod in (VALUE_METHOD_ARITY[vface] ?? {}) || (FACE_EXISTS_BEYOND_ARITY[vface] ?? []).includes(vmethod) || !instanceMemberAbsent(vface, vmethod)) continue;
          const vloc = (n.loc as Diagnostic["loc"]) ?? null;
          diags.push({ code: "face-member-missing", message: `Cannot find member "${vmethod}" in base "${vface}".`, loc: vloc });
          diags.push({ code: "face-member-not-found", message: `Function "${vmethod}()" not found in base ${vface}.`, loc: vloc });
          continue;
        }
        const method = callee.name;
        if (typeof method !== "string" || method in (VALUE_METHOD_ARITY[kind] ?? {})) continue;
        if (!packNameMeasuredAbsent(kind, method)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        diags.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${kind}".`, loc });
        diags.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${kind}.`, loc });
        continue;
      }
      if (n.kind !== "attribute" || callCallees.has(n)) continue;
      const face = attrFaceRecv(n.obj as Record<string, unknown>, attr, elems, mods);
      if (face === null) continue;
      const name = n.name;
      if (typeof name !== "string") continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "String" || face === "StringName" ? STRING_METHOD_ARITY : face === "NodePath" ? NODE_PATH_METHOD_ARITY : (VALUE_METHOD_ARITY[face] ?? {});
      const refused = PACK_TYPE_NAMES.has(face) || face === "Array" || face === "String";
      if (name in table || (FACE_EXISTS_BEYOND_ARITY[face] ?? []).includes(name)) {
        // 往成员名上写：pack 是 16 名 × 三型、Array / String 各一名量过，读数一句都是 `Cannot assign a new value to a constant.`
        if (writeTargets.has(n)) {
          if (refused) diags.push({ code: "face-attr-constant", message: "Cannot assign a new value to a constant.", loc });
        } else {
          const l = n.loc as { line: number; col: number } | undefined;
          const bounds = table[name];
          if (l !== undefined && bounds !== undefined) boundFaces.set(diKey(l.line, l.col), face + "," + String(bounds[0]) + "," + String(bounds[1]));
        }
        continue;
      }
      const absent = PACK_TYPE_NAMES.has(face)
        ? packNameMeasuredAbsent(face, name)
        : face === "Array" || face === "String"
          ? true
          : valueAttrKind(face, name) === "absent" || instanceMemberAbsent(face, name);
      if (!absent) continue;
      // 值类型那七面只量过**读**那一形（`tmp/probe-vattr/`），写形没读数就不开口
      if (!refused && writeTargets.has(n)) continue;
      const one = `Cannot find member "${name}" in base "${face}".`;
      diags.push({ code: "face-attr-missing", message: one, loc });
      diags.push({ code: "face-attr-missing", message: one, loc });
    }
  }
}

/** Dictionary 方法的元数（S378）：49 名过裁判，存在的 20 名两侧都量到（每名两格 —— 零实参读「至少」、三实参读「至多」，
 *  `tmp/probe-dict/compare22.txt`）。与值类型五支（S305）、pack 九支（S376）同一族两句。`sort` 在字典上是**零参**（按键排），
 *  与 Array 那支的 `sort()` 同名同元数但不同语义；`recursive_equal` 要两支（第二支是递归计数）。 */
const DICT_METHOD_ARITY: Record<string, [number, number]> = {
  assign: [1, 1], clear: [0, 0], duplicate: [0, 1], erase: [1, 1], find_key: [1, 1],
  get: [1, 2], get_or_add: [1, 2], has: [1, 1], has_all: [1, 1], hash: [0, 0],
  is_empty: [0, 0], is_read_only: [0, 0], keys: [0, 0], make_read_only: [0, 0], merge: [1, 2],
  merged: [1, 2], recursive_equal: [2, 2], size: [0, 0], sort: [0, 0], values: [0, 0],
};

/** Dictionary 方法的元数在解析期就拦。接收者只认两种静态证明 —— 标注 `Dictionary` 与 `{…}` 字面量（含直接当接收者的字面量），
 *  被重新赋值过的名字丢掉；证不出就不报（宁可漏拦不误拦，与 `checkPackArgSlots` 同一口径）。 */
function checkDictMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, "Dictionary", (init) => init.kind === "dict")) {
    const dicts = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict");
    const dictAnn = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict", true);
    for (const n of nodes) {
      const d = containerCallArity(n, DICT_METHOD_ARITY, "dict-arity", dicts, (obj) => obj.kind === "dict");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, DICT_METHOD_ARITY, "Dictionary", false, dictAnn, (obj) => obj.kind === "dict")) diags.push(g);
    }
  }
}

/** Array 方法的元数（S379）：51 名过裁判，存在的 49 名两侧都量到（每名两格 —— 零实参读「至少」、五实参读「至多」，
 *  `tmp/probe-arr/{compare23,compare24}.txt`）。`find_custom` / `rfind_custom` 那两名 4.6.3 **仍在**（旧版文档里没有，靠实测量回来的）。 */
/** Array 方法的元数在解析期就拦。接收者只认两种静态证明 —— 标注 `Array`（带元素型的截掉那一段）与
 *  `[…]` 字面量（含直接当接收者的字面量）；被重新赋值过的名字丢掉。 */
function checkArrayMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, "Array", (init) => init.kind === "array")) {
    const arrays = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array");
    const arrAnn = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array", true);
    for (const n of nodes) {
      const d = containerCallArity(n, ARRAY_METHOD_ARITY, "array-arity", arrays, (obj) => obj.kind === "array");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, ARRAY_METHOD_ARITY, "Array", true, arrAnn, (obj) => obj.kind === "array")) diags.push(g);
    }
  }
}

/** String 方法的元数（S380）：109 名过裁判，存在的 108 名两侧都量到（每名两格 —— 零实参读「至少」、五实参读「至多」，
 *  `tmp/probe-str/compare25.txt`）。三格与直觉不同、只能量回来：`split` / `rsplit` 的**下界是 0**（不填分隔符也收），
 *  `count` 的上界是 **3**（`from` 与 `to` 都在内），`is_valid_int` / `is_valid_float` 反倒不收那支默认布尔。 */
/** String 方法的元数在解析期就拦。接收者认两种静态证明 —— 标注 `String` 与字符串字面量（含直接当接收者）；
 *  `&"…"` 与 `"…"` 前加记号的那两面（StringName / NodePath）走下面那两道同形状的闸门，成员表各是各的（S389）。 */
function checkStringMethodArity(m: Module, diags: Diagnostic[]): void {
  const isStringLit = (obj: Record<string, unknown>): boolean => obj.kind === "lit" && obj.lit === "string";
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, "String", (init) => init.kind === "lit" && init.lit === "string")) {
    const strs = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string");
    const strAnn = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string", true);
    for (const n of nodes) {
      const d = containerCallArity(n, STRING_METHOD_ARITY, "string-arity", strs, isStringLit);
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, STRING_METHOD_ARITY, "String", true, strAnn, isStringLit)) diags.push(g);
    }
  }
}

/** StringName 那一面：102 名的 `[下界, 上界]` 与 String 那张表一字一样（0 处漂移），另六名引擎当场回「找不到成员」那两句 ——
 *  两面各 102 + 6 格、NodePath 13 格，尺 `tmp/probe-snfaces/{round1,round2}.mts`，读数 `tmp/probe-snfaces/compare{42,43}.txt`（S389）。 */
const STRINGNAME_NO_METHOD = new Set(["chr", "humanize_size", "num", "num_int64", "num_scientific", "num_uint64"]);

/** NodePath 那一面只认这十名（`hash` 也在内，元数 [0,0]），元数照量来的两张界。 */

const NODE_PATH_NO_METHOD = new Set(["simplify", "is_same", "length"]);

/** 那两面共用的形状：接收者认「`&"…"` / `^"…"` 字面量直接当接收者」与「标注或初值静态证得出的名字」两种，
 *  名字被重新赋值过就丢掉 —— 与 String / 字典 / 数组那三道闸门同一条口径。 */
interface NamedFace {
  type: string;
  lit: string;
  arity: Record<string, [number, number]>;
  ghosts: ReadonlySet<string>;
  arityCode: string;
  ghostCode: string;
}

function checkNamedFace(m: Module, face: NamedFace, diags: Diagnostic[]): void {
  const isLiteral = (obj: Record<string, unknown>): boolean => obj.kind === "lit" && obj.lit === face.lit;
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, face.type, (init) => init.kind === "lit" && init.lit === face.lit)) {
    const names = faceReceiverNames(nodes, seeded, assigned, face.type, (init) => init.kind === "lit" && init.lit === face.lit);
    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "attribute") continue;
      const obj = callee.obj as Record<string, unknown> | undefined;
      if (obj === undefined) continue;
      const method = callee.name;
      if (typeof method !== "string") continue;
      const proven = isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name));
      if (!proven) continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      if (face.ghosts.has(method)) {
        diags.push({ code: face.ghostCode, message: `Cannot find member "${method}" in base "${face.type}".`, loc });
        diags.push({ code: face.ghostCode, message: `Function "${method}()" not found in base ${face.type}.`, loc });
        continue;
      }
      const d = arityDiag(face.arity, face.arityCode, method, ((n.args as Expr[]) ?? []).length, loc);
      if (d !== null) diags.push(d);
    }
  }
}

const STRINGNAME_FACE: NamedFace = {
  type: "StringName",
  lit: "string_name",
  arity: STRING_METHOD_ARITY,
  ghosts: STRINGNAME_NO_METHOD,
  arityCode: "string-name-arity",
  ghostCode: "string-name-member",
};

const NODE_PATH_FACE: NamedFace = {
  type: "NodePath",
  lit: "node_path",
  arity: NODE_PATH_METHOD_ARITY,
  ghosts: NODE_PATH_NO_METHOD,
  arityCode: "node-path-arity",
  ghostCode: "node-path-member",
};

/** 类型构造式越界走的是**第三种句子**（S386）：`No constructor of "X" matches the signature "X(类型, …)".`，
 *  既不是 `Too few` 也不是 `Too many`。表里只有引擎当场回了这一句的那些签名（一名五形 × 20 名 = 100 格，
 *  `tmp/probe-ctor/compare35.txt`）；没量过的类型组合照旧放过。`Color` 五形全收，所以整名不入表；
 *  `bool` 的单支 Array / String / Dictionary 由既有那道 `checkCall` 发同一句，表里不重复登。 */
const CTOR_REFUSED: Record<string, string[][]> = {
  int: [["int", "int"], ["int", "int", "int"]],
  float: [["int", "int"], ["int", "int", "int"]],
  bool: [["int", "int"], ["int", "int", "int"]],
  String: [["int"], ["int", "int"], ["int", "int", "int"]],
  StringName: [["int"], ["int", "int"], ["int", "int", "int"]],
  NodePath: [["int"], ["int", "int"], ["int", "int", "int"]],
  Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Dictionary: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Vector2: [["int"], ["int", "int", "int"], ["String"]],
  Vector2i: [["int"], ["int", "int", "int"], ["String"]],
  Vector3: [["int"], ["int", "int"], ["String"]],
  Vector3i: [["int"], ["int", "int"], ["String"]],
  Callable: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Signal: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  RID: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedByteArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedInt32Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedFloat64Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedStringArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
};

function checkCtorSignatures(m: Module, diags: Diagnostic[]): void {
  const shadowed = new Set(m.funcs.map((f) => f.name));
  for (const nodes of flattenBodies(m)) {
    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "ident" || typeof callee.name !== "string") continue;
      const name = callee.name;
      if (shadowed.has(name)) continue;
      const bad = CTOR_REFUSED[name];
      if (bad === undefined) continue;
      const kinds = ((n.args as Expr[]) ?? []).map((a) => literalTypeName(a));
      if (kinds.some((k) => k === null)) continue;
      const sig = kinds.join(", ");
      if (!bad.some((t) => t.join(", ") === sig)) continue;
      diags.push({
        code: "ctor-signature",
        message: `No constructor of "${name}" matches the signature "${name}(${sig})".`,
        loc: (n.loc as Diagnostic["loc"]) ?? null,
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

/**
 * 字典字面量的重复键：4.6.3 在**解析期**就拦，我们此前照收照跑（后写的值静默盖掉先写的）。
 * 读数 `tmp/probe-negzero/{keys,keys2}.mts`（36 形），三条口径划定了查的范围：
 * ① 只查折得出常量的键 —— `{1 + 1: 2, 2: 3}` 拒（折成 int 2 与后面的 `2` 同键），`{1: 1, x: 2}`（x 是变量）放过；
 * ② 容器键不查 —— `{{1: 2}: 1, {1: 2}: 2}` 与 `{[1, 2]: 1, [1, 2]: 2}` 两侧都收（引擎那侧这两形不进常量表）；
 * ③ 同键就是字典的桶判据 —— `String` 与 `StringName` 同键、`0.0` 与 `-0.0` 同键、`nan` 与 `nan` 同键，
 *    而 `1` 与 `1.0`、`0` 与 `false`、`"1"` 与 `1` 各是两支键。
 * 报的行号是**首次出现**那一格（跨行字典实测：重复在 7 行、报 6 行），一个字典里有几处重复就发几行。
 */
function checkDictDuplicateKeys(m: Module, diags: Diagnostic[]): void {
  const expr = (e: Expr): void => {
    switch (e.kind) {
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
      case "call":
        expr(e.callee);
        for (const a of e.args) expr(a);
        return;
      case "dict": {
        const seen = new Map<string, Loc>();
        for (const en of e.entries) {
          expr(en.key);
          expr(en.value);
          const key = foldDictKey(en.key);
          if (key === null) continue;
          const token = dictKeyToken(key);
          const first = seen.get(token);
          if (first === undefined) seen.set(token, en.key.loc);
          else diags.push({ code: "dict-dup-key", message: `Key "${dictKeyText(key)}" was already used in this dictionary.`, loc: first });
        }
        return;
      }
      case "lambda":
        stmts(e.body);
        return;
      default:
        return;
    }
  };
  const stmts = (body: Stmt[]): void => {
    for (const s of body) {
      switch (s.kind) {
        case "expr":
          expr(s.expr);
          continue;
        case "var":
          if (s.init !== null) expr(s.init);
          continue;
        case "assign":
          expr(s.target);
          expr(s.value);
          continue;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) expr(br.cond);
            stmts(br.body);
          }
          continue;
        case "for":
          expr(s.iter);
          stmts(s.body);
          continue;
        case "while":
          expr(s.cond);
          stmts(s.body);
          continue;
        case "match":
          expr(s.subject);
          for (const arm of s.arms) {
            // 手臂里的 Pattern 字典不进这一族（引擎那侧查不查没量过），只查 guard 与体
            if (arm.guard !== null) expr(arm.guard);
            stmts(arm.body);
          }
          continue;
        case "return":
          if (s.value !== null) expr(s.value);
          continue;
        default:
          continue;
      }
    }
  };
  const vars = (list: VarDecl[]): void => {
    for (const v of list) {
      if (v.init !== null) expr(v.init);
      const acc = v.accessor;
      if (acc !== null) {
        if (acc.getter !== null && acc.getter.kind === "inline") stmts(acc.getter.body);
        if (acc.setter !== null && acc.setter.kind === "inline") stmts(acc.setter.body);
      }
    }
  };
  const classes = (list: ClassDecl[]): void => {
    for (const c of list) {
      vars(c.vars);
      for (const f of c.funcs) stmts(f.body);
      classes(c.innerClasses);
    }
  };
  vars(m.vars);
  for (const f of m.funcs) stmts(f.body);
  classes(m.innerClasses);
}

/** 能折成常量的键；折不出的一律 null（变量、下标、没量过的 `Color` / NodePath 之类）—— 误拦合法工程比漏一格贵得多。 */
type DictKey =
  | { t: "int"; v: bigint }
  | { t: "float"; v: number }
  | { t: "str"; v: string }
  | { t: "bool"; v: boolean }
  | { t: "null" }
  | { t: "vec"; name: "Vector2" | "Vector3"; xs: number[] }
  | { t: "np"; v: string };

function foldDictKey(e: Expr): DictKey | null {
  if (e.kind === "lit") {
    switch (e.lit) {
      case "int":
        return { t: "int", v: typeof e.value === "bigint" ? e.value : BigInt(Math.trunc(Number(e.value))) };
      case "float":
        return { t: "float", v: Number(e.value) };
      case "string":
      case "string_name":
        return { t: "str", v: String(e.value) };
      case "node_path":
        return { t: "np", v: String(e.value) };
      case "bool":
        return { t: "bool", v: e.value === true };
      case "null":
        return { t: "null" };
      default:
        return null;
    }
  }
  if (e.kind === "unary" && e.op === "-") {
    const k = foldDictKey(e.operand);
    if (k === null) return null;
    if (k.t === "int") return { t: "int", v: -k.v };
    if (k.t === "float") return { t: "float", v: -k.v };
    if (k.t === "vec") return { t: "vec", name: k.name, xs: k.xs.map((x) => -x) };
    return null;
  }
  if (e.kind === "binary") {
    const a = foldDictKey(e.left);
    const b = foldDictKey(e.right);
    if (a === null || b === null) return null;
    return foldDictBinary(e.op, a, b);
  }
  if (e.kind === "call" && e.callee.kind === "ident" && (e.callee.name === "Vector2" || e.callee.name === "Vector3")) {
    const n = e.callee.name === "Vector2" ? 2 : 3;
    if (e.args.length !== n) return null;
    const xs: number[] = [];
    for (const a of e.args) {
      const k = foldDictKey(a);
      if (k === null) return null;
      if (k.t === "int") xs.push(Number(k.v));
      else if (k.t === "float") xs.push(k.v);
      else return null;
    }
    return { t: "vec", name: e.callee.name, xs };
  }
  if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "NodePath" && e.args.length === 1) {
    const one = foldDictKey(e.args[0] as Expr);
    if (one !== null && one.t === "str") return { t: "np", v: one.v };
  }
  return null;
}

/** 数值常量的算法按 S203 / S61 的口径：int 之间 `/` 是向零截断、`%` 同族，int 除零没量过就不折；一旦有 float 参与，`/` 走浮点（`1.0/0.0` 给 inf、`0.0/0.0` 给 nan，两形实测都当常量键收进重复判定），而 float 的 `%` 在引擎是解析期拒，也不折。 */
function foldDictBinary(op: string, a: DictKey, b: DictKey): DictKey | null {
  const num = (k: DictKey): number | bigint | null => (k.t === "int" ? k.v : k.t === "float" ? k.v : null);
  const an = num(a);
  const bn = num(b);
  if (an === null || bn === null) return null;
  if (typeof an === "bigint" && typeof bn === "bigint") {
    switch (op) {
      case "+":
        return { t: "int", v: an + bn };
      case "-":
        return { t: "int", v: an - bn };
      case "*":
        return { t: "int", v: an * bn };
      case "/":
        return bn === 0n ? null : { t: "int", v: an / bn };
      case "%":
        return bn === 0n ? null : { t: "int", v: an % bn };
      default:
        return null;
    }
  }
  const af = typeof an === "bigint" ? Number(an) : an;
  const bf = typeof bn === "bigint" ? Number(bn) : bn;
  switch (op) {
    case "+":
      return { t: "float", v: af + bf };
    case "-":
      return { t: "float", v: af - bf };
    case "*":
      return { t: "float", v: af * bf };
    case "/":
      return { t: "float", v: af / bf };
    default:
      return null;
  }
}

/** 桶判据折成一个字符串：`-0.0` 与 `0.0` 同键（`${-0}` 出的就是 `"0"`），`nan` / `inf` / `-inf` 各成一格且**自己与自己同键**（实测 `nan` 那格引擎照拒）。 */
function dictKeyToken(k: DictKey): string {
  switch (k.t) {
    case "int":
      return `i:${k.v}`;
    case "float":
      return `f:${k.v}`;
    case "str":
      return `s:${k.v}`;
    case "bool":
      return `b:${k.v ? 1 : 0}`;
    case "null":
      return "n";
    case "vec":
      return `v:${k.name}:${k.xs.join(",")}`;
    case "np":
      return `p:${k.v}`;
  }
}

/** 文案里的键文本就是 `str(键)`：`0.0` 藏号（实测 `-0.0` 那格引擎报的是 `Key "0.0"`）、String 与 StringName 都不带引号、null 是 `<null>`。 */
function dictKeyText(k: DictKey): string {
  switch (k.t) {
    case "int":
      return String(k.v);
    case "float":
      return floatText(k.v);
    case "str":
      return k.v;
    case "bool":
      return k.v ? "true" : "false";
    case "null":
      return "<null>";
    case "vec":
      return `(${k.xs.map(floatText).join(", ")})`;
    case "np":
      return k.v;
  }
}

function floatText(v: number): string {
  return Object.is(v, -0) ? strFloat(0) : strFloat(v);
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

  // 静态语境共三种：静态函数体、静态变量初值、静态读写器体（后一支引擎用的是合成函数名 `@<字段>_getter()` / `@<字段>_setter()`）。
  // 句子里「from …」那一截按语境换，判据与走查一模一样（读数 `tmp/pos/compare12.txt`）。
  const contexts: Array<{ who: string; body: Stmt[]; init: Expr | null; params: string[] }> = [];
  for (const f of funcs) {
    if (f.isStatic) contexts.push({ who: `the static function "${f.name}()"`, body: f.body, init: null, params: f.params.map((p) => p.name) });
  }
  for (const v of vars) {
    if (!v.isStatic) continue;
    contexts.push({ who: "a static variable initializer", body: [], init: v.init, params: [] });
    const a = v.accessor;
    if (a === null || a === undefined) continue;
    if (a.getter !== null && a.getter.kind === "inline") contexts.push({ who: `the static function "@${v.name}_getter()"`, body: a.getter.body, init: null, params: [] });
    if (a.setter !== null && a.setter.kind === "inline") contexts.push({ who: `the static function "@${v.name}_setter()"`, body: a.setter.body, init: null, params: [a.setter.param] });
  }

  for (const ctx of contexts) {
    const local = new Set<string>();
    collectLocalNames(ctx.body, ctx.params, local);

    const expr = (e: Expr): void => {
      switch (e.kind) {
        case "ident":
          if (!local.has(e.name) && instanceVars.has(e.name)) {
            diags.push({
              code: "static-access-var",
              message: `Cannot access non-static variable "${e.name}" from ${ctx.who}.`,
              loc: e.loc,
            });
          }
          return;
        case "call": {
          if (e.callee.kind === "ident" && !local.has(e.callee.name) && instanceFuncs.has(e.callee.name)) {
            diags.push({
              code: "static-call-func",
              message: `Cannot call non-static function "${e.callee.name}()" from ${ctx.who}.`,
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
    if (ctx.init !== null) expr(ctx.init);
    ctx.body.forEach(stmt);
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
    const report = (local: Set<string>) => (name: string, loc: Loc): void => {
      if (outerFuncs.has(name) && !own.has(name) && !local.has(name)) {
        diags.push({
          code: "class-outer-func",
          message: `Function "${name}()" not found in base self.`,
          loc,
        });
      }
    };
    for (const f of c.funcs) {
      const local = new Set<string>();
      collectLocalNames(f.body, f.params.map((p) => p.name), local);
      scanStmts(f.body, report(local));
      // 形参默认值与函数体同一口径：引擎一样查（读数 `tmp/pos/compare13.txt` 10）
      for (const p of f.params) if (p.default !== null) scanExpr(p.default, report(local));
    }
    // 字段初值与读写器体也在内部类那一面里：调外层方法同样是这一句（读数 `tmp/pos/compare13.txt` 09）
    for (const v of c.vars) {
      const local = new Set<string>();
      if (v.init !== null) scanExpr(v.init, report(local));
      const a = v.accessor;
      if (a === null || a === undefined) continue;
      if (a.getter !== null && a.getter.kind === "inline") scanStmts(a.getter.body, report(local));
      if (a.setter !== null && a.setter.kind === "inline") {
        local.add(a.setter.param);
        scanStmts(a.setter.body, report(local));
      }
    }
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);
}

/** 字段初值与读写器体那一层：引擎照样查名字（`var f = nosuch` 是解析期拒），`self` 在其中也合法（实测 typeof 24）；`static var` / `const` 初值里读到宿主名时引擎各换一句（S367 的读数），读写器体里是同一族句子、函数名是合成的 `@<字段>_getter()` / `@<字段>_setter()`（S368 的读数）。 */
function checkFieldInits(list: VarDecl[], scope: Scope, coroutines: Set<string>, diags: Diagnostic[], face: Set<string>): void {
  const selfScope = scope.child([], true);
  for (const v of list) {
    const prevFace = hostValueMethods;
    const prevCtx = hostStaticCtx;
    hostValueMethods = face;
    hostStaticCtx = v.isConst ? { kind: "const", name: v.name } : v.isStatic ? { kind: "var" } : null;
    if (v.init !== null) walkExpr(v.init, selfScope, coroutines, diags);
    const acc = v.accessor;
    if (acc !== null) {
      // 读写器体是**函数体**：static 那一维里 `self` 引擎直接拒（初值那一形才是给 typeof 0，S367 / S371）
      const accScope = v.isStatic ? selfScope.child([], false) : selfScope;
      hostStaticCtx = v.isStatic ? { kind: "func", name: `@${v.name}_getter` } : null;
      if (acc.getter !== null && acc.getter.kind === "inline") walkStmts(acc.getter.body, accScope, coroutines, diags, false);
      hostStaticCtx = v.isStatic ? { kind: "func", name: `@${v.name}_setter` } : null;
      if (acc.setter !== null && acc.setter.kind === "inline") {
        walkStmts(acc.setter.body, accScope.child([acc.setter.param]), coroutines, diags, false);
      }
    }
    hostValueMethods = prevFace;
    hostStaticCtx = prevCtx;
  }
}

/** 具名委托（`get = 名` / `set = 名`）的准入四句：目标必须是**本类**声明的方法 —— 继承来的（内部类 `C extends B` 与 `extends "res://base.gd"` 两条链都量了）、宿主裸名、模块 `var` 一律算没找到；
 *  getter 恰好 0 参、setter 恰好 1 参，带默认值也算不合格，而**参数类型不看**（`func _s(v: int)` 给 `Variant` 属性当 setter 合法）。四句的行号都指属性声明那一行（S371 ④，读数 `tmp/pos/{compare10,compare11}.txt`）。 */
function checkPropertyDelegates(m: Module, diags: Diagnostic[]): void {
  const one = (vars: readonly VarDecl[], funcs: readonly FuncDecl[]): void => {
    const own = new Map<string, FuncDecl>();
    for (const f of funcs) if (!own.has(f.name)) own.set(f.name, f);
    for (const v of vars) {
      const a = v.accessor;
      if (a === null || a === undefined) continue;
      const judge = (word: "Getter" | "Setter", kind: "getter" | "setter", name: string): void => {
        const f = own.get(name);
        if (f === undefined) {
          diags.push({ code: "property-delegate", message: `${word} "${name}" not found.`, loc: v.loc });
          return;
        }
        const want = kind === "getter" ? 0 : 1;
        if (f.params.length !== want || f.params.some((p) => p.default !== null)) {
          diags.push({ code: "property-delegate", message: `Function "${name}" cannot be used as ${kind} because of its signature.`, loc: v.loc });
        }
      };
      if (a.getter !== null && a.getter.kind === "method") judge("Getter", "getter", a.getter.method);
      if (a.setter !== null && a.setter.kind === "method") judge("Setter", "setter", a.setter.method);
    }
  };
  one(m.vars, m.funcs);
  const walk = (c: ClassDecl): void => {
    one(c.vars, c.funcs);
    for (const inner of c.innerClasses) walk(inner);
  };
  for (const c of m.innerClasses) walk(c);
}

function checkClass(c: ClassDecl, base: Scope, diags: Diagnostic[], classes: Map<string, ClassDecl>): void {
  const scope = base.child([c.name, ...declNames(c), ...inheritedNames(c, classes)]);
  const coroutines = new Set(c.funcs.filter((f) => f.coroutine).map((f) => f.name));
  checkStaticAccess(c.funcs, c.vars, diags);
  for (const f of c.funcs) checkFunc(f, scope, coroutines, diags);
  checkFieldInits(c.vars, scope, coroutines, diags, NO_HOST_VALUE_METHODS);
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

function checkFunc(f: FuncDecl, outer: Scope, coroutines: Set<string>, diags: Diagnostic[], hostFace: Set<string> = NO_HOST_VALUE_METHODS): void {
  const scope = outer.funcChild(["self", ...f.params.map((p) => p.name)], !f.isStatic);
  const prevFace = hostValueMethods;
  const prevCtx = hostStaticCtx;
  hostValueMethods = hostFace;
  hostStaticCtx = f.isStatic ? { kind: "func", name: f.name } : null;
  for (const p of f.params) if (p.default !== null) walkExpr(p.default, scope, coroutines, diags);
  walkStmts(f.body, scope, coroutines, diags, false);
  hostValueMethods = prevFace;
  hostStaticCtx = prevCtx;
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
      // 语句位丢弃那一格的返回值不取值，引擎因此不要求 `await`；同一支协程进了取值位（实参、元素、运算数、右值）才发那一句（读数 `tmp/probe-awaitcall/compare92.txt` 十六格）
      walkExpr(s.expr, scope, coroutines, diags, true);
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
 * 记账用 `归属:行:列:名字` 而不是节点身份：scriptc 那条原生通道不让把对象塞进 WeakSet（SC1090）。
 * 归属由 `analyze` 每份模块给一个（调用方传文件标识就用它，否则换一个进程内序号），所以两份文件撞同一
 * `行:列` 也不会互相抢记号 —— 只按 `行:列:名字` 记的那版会（§6 第 61 条）。
 */
const globalValueReads = new Set<string>();

/** 同一套记号记的第二类：引擎类名当值用（`var k = Node`）—— 取值合法、等式按类，但那支打印带进程内的号，发射器据此响亮拒。 */
const nativeClassReads = new Set<string>();

/** 宿主基类（`extends SceneTree`）那面**能裸当值用**的方法名（S366，读数 `tmp/hostnames/readings.txt`，尺 `fold45.mts`）：
 *  `ClassDB.class_get_method_list("SceneTree")` 数出 113 名，逐名一格一份脚本 spawn 量过去 —— 97 名给 typeof 25 的 Callable，
 *  打印 `SceneTree(<文件>)::<名>`，与 `Callable(self, "<名>")` 等价。`_process` / `_init` / `_to_string` 那 15 支虚方法是
 *  `Compile Error: Identifier not found: _process`（与一般没声明的名字那句不是一样，先照旧拦），`_initialize` 量出来是 Callable
 *  只因探针脚本自己定义了它，不是宿主给的，所以不进名单。`root` / `paused` 是**属性读数**（25 都不给），Tier 1 不接引擎 API，照旧拒。 */
const HOST_VALUE_METHODS = new Set([
  "add_user_signal",
  "call",
  "call_deferred",
  "call_group",
  "call_group_flags",
  "callv",
  "can_translate_messages",
  "cancel_free",
  "change_scene_to_file",
  "change_scene_to_node",
  "change_scene_to_packed",
  "connect",
  "create_timer",
  "create_tween",
  "disconnect",
  "emit_signal",
  "free",
  "get",
  "get_class",
  "get_current_scene",
  "get_edited_scene_root",
  "get_first_node_in_group",
  "get_frame",
  "get_incoming_connections",
  "get_indexed",
  "get_instance_id",
  "get_meta",
  "get_meta_list",
  "get_method_argument_count",
  "get_method_list",
  "get_multiplayer",
  "get_node_count",
  "get_node_count_in_group",
  "get_nodes_in_group",
  "get_processed_tweens",
  "get_property_list",
  "get_root",
  "get_script",
  "get_signal_connection_list",
  "get_signal_list",
  "get_translation_domain",
  "has_connections",
  "has_group",
  "has_meta",
  "has_method",
  "has_signal",
  "has_user_signal",
  "is_accessibility_enabled",
  "is_accessibility_supported",
  "is_auto_accept_quit",
  "is_blocking_signals",
  "is_class",
  "is_connected",
  "is_debugging_collisions_hint",
  "is_debugging_navigation_hint",
  "is_debugging_paths_hint",
  "is_multiplayer_poll_enabled",
  "is_paused",
  "is_physics_interpolation_enabled",
  "is_queued_for_deletion",
  "is_quit_on_go_back",
  "notification",
  "notify_group",
  "notify_group_flags",
  "notify_property_list_changed",
  "property_can_revert",
  "property_get_revert",
  "queue_delete",
  "quit",
  "reload_current_scene",
  "remove_meta",
  "remove_user_signal",
  "set",
  "set_auto_accept_quit",
  "set_block_signals",
  "set_current_scene",
  "set_debug_collisions_hint",
  "set_debug_navigation_hint",
  "set_debug_paths_hint",
  "set_deferred",
  "set_edited_scene_root",
  "set_group",
  "set_group_flags",
  "set_indexed",
  "set_message_translation",
  "set_meta",
  "set_multiplayer",
  "set_multiplayer_poll_enabled",
  "set_pause",
  "set_physics_interpolation_enabled",
  "set_quit_on_go_back",
  "set_script",
  "set_translation_domain",
  "to_string",
  "tr",
  "tr_n",
  "unload_current_scene",
]);
const NO_HOST_VALUE_METHODS = new Set<string>();
/** 同一批读数里那 15 支 `_x` 虚方法名：取值合法地「不合法」，只是引擎那句换形（S366）。 */
const VIRTUAL_HOST_NAMES = new Set([
  "_finalize",
  "_get",
  "_get_property_list",
  "_init",
  "_iter_get",
  "_iter_init",
  "_iter_next",
  "_notification",
  "_physics_process",
  "_process",
  "_property_can_revert",
  "_property_get_revert",
  "_set",
  "_to_string",
  "_validate_property",
]);
/** 只在**根类**里认（实测内部类里 `quit` 照样 `not declared`）：`checkFunc` 逐函数开关，静态方法那一形认到就换引擎那句（S367）。 */
let hostValueMethods: Set<string> = NO_HOST_VALUE_METHODS;
/** 读宿主名所在的静态语境：`static func` 带函数名、`static var` 初值、`const` 初值 —— 引擎三处各一句（S367 的读数）。 */
let hostStaticCtx: { kind: "func"; name: string } | { kind: "var" } | { kind: "const"; name: string } | null = null;
const hostMethodReads = new Set<string>();

const gvKey = (name: string, line: number, col: number): string => `${markOwner}#${name}@${line}:${col}`;
/** 记号归属：`analyze` 每次调用写一次，发射器从同一份 Module 读回（`m.markOwner`）。 */
let markOwner = "";
let markSeq = 0;

/** 发射器在按名字取记号之前先把归属对准当前模块（记号表进程内累积，见 §6 第 61 条）。 */
export function useMarkOwner(owner: string): void {
  markOwner = owner;
}

export function isGlobalValueRead(e: Expr): boolean {
  return e.kind === "ident" && globalValueReads.has(gvKey(e.name, e.loc.line, e.loc.col));
}

export function isNativeClassValueRead(e: Expr): boolean {
  return e.kind === "ident" && nativeClassReads.has(gvKey(e.name, e.loc.line, e.loc.col));
}

/** 宿主基类方法名的取值点（S358）：发射器据此发 `rt.methodCallable(rt.V.object(this), "<名>")`。 */
export function isHostMethodValueRead(e: Expr): boolean {
  return e.kind === "ident" && hostMethodReads.has(gvKey(e.name, e.loc.line, e.loc.col));
}

function walkExpr(e: Expr, scope: Scope, coroutines: Set<string>, diags: Diagnostic[], awaited = false): void {
  switch (e.kind) {
    case "lit":
      return;

    case "ident":
      if (e.name === "super") return;
      if (e.name === "self") {
        // `const` 初值里引擎直接拒（`static var` 初值那一形给 typeof 0，由发射器发 null 盒子 —— 同一批读数，S367）
        if (hostStaticCtx !== null && hostStaticCtx.kind === "const")
          diags.push({
            code: "const-not-constant",
            message: `Assigned value for constant "${hostStaticCtx.name}" isn't a constant expression.`,
            loc: e.loc,
          });
        else if (!scope.allowsSelf()) {
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
        // 宿主基类的方法名当值用：合法且给 Callable（S358 / S366），记号交给发射器；静态语境与 const / static var 初值里引擎各换一句（S367）
        else if (hostValueMethods.has(e.name)) {
          if (hostStaticCtx === null) hostMethodReads.add(gvKey(e.name, e.loc.line, e.loc.col));
          else if (hostStaticCtx.kind === "func")
            diags.push({
              code: "host-read-in-static",
              message: `Cannot access non-static variable "${e.name}" from the static function "${hostStaticCtx.name}()".`,
              loc: e.loc,
            });
          else if (hostStaticCtx.kind === "var")
            diags.push({
              code: "host-read-in-static",
              message: `Cannot access non-static variable "${e.name}" from a static variable initializer.`,
              loc: e.loc,
            });
          else
            diags.push({
              code: "const-not-constant",
              message: `Assigned value for constant "${hostStaticCtx.name}" isn't a constant expression.`,
              loc: e.loc,
            });
        }
        // 宿主链上那 15 支虚方法名取值时引擎换一句（S366：`Compile Error: Identifier not found: _process`，末尾没有句号）
        else if (VIRTUAL_HOST_NAMES.has(e.name))
          diags.push({ code: "undeclared-identifier", message: `Identifier not found: ${e.name}`, loc: e.loc });
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
      if (staticMemberFn(e.obj) === null && !(e.obj.kind === "ident" && PACK_TYPE_NAMES.has(e.obj.name))) walkExpr(e.obj, scope, coroutines, diags);
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
      recordCaptures(e, scope);
      // 默认值在外层那一支里评（与普通函数那趟同口径），走查也别漏这一格：元数闸门要覆盖每个表达式位置。
      // 能看见**排在前面的**形参（`tmp/probe-lamdef/a1.gd` 的 `y = x` 收），往后看就不行（`e4.gd` 的 `a = b` 是解析期那句未声明）。
      let defScope = scope;
      for (const p of e.params) {
        if (p.default !== null) walkExpr(p.default, defScope, coroutines, diags);
        defScope = defScope.child([p.name]);
      }
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
        const arity = builtinArity(name, e.args.length) ?? utilityArity(name, e.args.length);
        if (arity !== null) {
          diags.push({ code: builtinArityCode(name), message: arity, loc: e.loc });
        }
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
      // `^"…"` 与 `NodePath("…")` 同款：静态名没量过进哪张判据表，留 null 走动态路（S275）。
      if (e.lit === "node_path") return null;
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

/** 字面量 × 字面量的运算符组合：引擎在解析期拒的那些对（S394，尺 tmp/probe-opmatrix/round1.mts，读数 compare57.txt，468 格 = 六型 × 六型 × 十三符）。
 *  两式句子各有各的表：两侧都是**字面量**且都是标量时是 _A（Invalid operands to operator X, A and B.），
 *  掺进容器那一族时是 _B（Invalid operands "A" and "B" for "X" operator.）—— 第二式也出现在「操作数不是字面量」那些格，
 *  但那一头只量了 bool 三支（compare55），所以闸门只按字面量那一半发。收的与走到运行期才拒的一个都不登。 */
export const OP_PAIRS_REFUSED_A: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  "%": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|float", "int|String", "float|bool", "float|int", "float|float", "float|String"],
  "*": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String"],
  "+": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  "-": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String"],
  "/": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String"],
  "<": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  "<=": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  "==": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  ">": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  ">=": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float"],
  "and": ["bool|String", "int|String", "float|String", "String|bool", "String|int", "String|float", "String|String"],
  "in": ["int|int", "int|float", "int|bool", "int|String", "int|Vector2", "int|Color", "float|int", "float|float", "float|bool", "float|String", "float|Vector2", "float|Color", "bool|int", "bool|float", "bool|bool", "bool|String", "bool|Vector2", "bool|Color", "String|int", "String|float", "String|bool", "String|Vector2", "String|Color", "Vector2|int", "Vector2|float", "Vector2|bool", "Vector2|String", "Vector2|Vector2", "Vector2|Color", "Color|int", "Color|float", "Color|bool", "Color|String", "Color|Vector2", "Color|Color"],
  "or": ["bool|String", "int|String", "float|String", "String|bool", "String|int", "String|float", "String|String"],
};

export const OP_PAIRS_REFUSED_B: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array"],
  "%": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "*": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "+": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "-": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "/": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "<": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "<=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "==": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array"],
  ">": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  ">=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "and": [],
  "in": ["Array|int", "Array|float", "Array|bool", "Array|String", "Array|Vector2", "Array|Color", "Dictionary|int", "Dictionary|float", "Dictionary|bool", "Dictionary|String", "Dictionary|Vector2", "Dictionary|Color"],
  "or": [],
};

/** 这一对只在**字面量操作数**那半边发：矩阵 468 格全用字面量量的；「操作数是声明过的变量」那一头只量过 bool 三格
 *  （`tmp/probe-booleq/compare55.txt`，走的是第二式），所以那形状交给既有的 bool 闸门，其余不猜。 */
function isLiteralOperand(e: Expr): boolean {
  return e.kind === "lit" || e.kind === "array" || e.kind === "dict";
}

/** 左支是**静态型已知的非字面量**（标注过的 var / 形参 / 内部类字段）、右支是字面量时的那些对（S395，
 *  尺 `tmp/probe-declrecv/round1.mts`，读数 `compare58.txt`，另三种写法的抽样 `compare59.txt`）：引擎这一路**一律第二式**，
 *  与 `OP_PAIRS_REFUSED_A`/`_B`（两侧都是字面量、或左支是 `const`）那两张不是同一集 —— `and` / `or` 掺 String 的十四格
 *  在字面量那一集里拒、在这一集里收，所以各记一张。'const' 左支属字面量那一集（抽样四格都对上）。 */
export const OP_PAIRS_REFUSED_DECL: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array"],
  "%": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|float", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|int", "float|float", "float|String", "float|Array", "float|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "*": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|String", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "+": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "-": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|String", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "/": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|String", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Array", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "<": ["bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "<=": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "==": ["bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array"],
  ">": ["bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  ">=": ["bool|bool", "bool|int", "bool|float", "bool|String", "bool|Array", "bool|Dictionary", "int|bool", "int|String", "int|Array", "int|Dictionary", "float|bool", "float|String", "float|Array", "float|Dictionary", "String|bool", "String|int", "String|float", "String|Array", "String|Dictionary", "Array|bool", "Array|int", "Array|float", "Array|String", "Array|Dictionary", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String", "Dictionary|Array", "Dictionary|Dictionary"],
  "in": ["int|Vector2", "int|String", "int|Callable", "float|Vector2", "float|String", "float|Callable", "bool|Vector2", "bool|String", "bool|Callable", "String|Vector2", "String|Callable", "Vector2|Vector2", "Vector2|String", "Vector2|Callable", "Color|Vector2", "Color|String", "Color|Callable", "Array|Vector2", "Array|String", "Array|Callable", "Dictionary|Vector2", "Dictionary|String", "Dictionary|Callable", "Vector2|int", "Vector2|float", "Vector2|bool", "Vector2|Color", "String|int", "String|float", "String|bool", "String|Color", "Callable|int", "Callable|float", "Callable|bool", "Callable|String", "Callable|Vector2", "Callable|Color", "Callable|Callable", "Array|int", "Array|float", "Array|bool", "Array|Color", "Dictionary|int", "Dictionary|float", "Dictionary|bool", "Dictionary|Color", "float|int", "int|float", "float|float", "float|bool", "bool|float"],
};

/** 左支是标值型**标注变量**、右支是字面量的那些对（S457 第一笔，尺 `tmp/d6/annot.py`，读数 `tmp/d6/av-decl.txt` / `tmp/d6/av-mirror.txt`：210 格 × 两向逐格过裁判，两向**不是镜像**） */
export const OP_PAIRS_REFUSED_DECL_VAL: Readonly<Record<string, ReadonlyArray<string>>> = {
  "%": ["Color|Color", "Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2|Color", "Vector2|String", "Vector2|Vector2", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool", "int|float"],
  "*": ["Color|String", "Color|Vector2", "Color|bool", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "int|String", "int|bool"],
  "+": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "-": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "/": ["Color|String", "Color|Vector2", "Color|bool", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "<": ["Color|Color", "Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "==": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],

};

/** 反向那一形：左支是字面量、右支是标值型**标注变量**（同批实测，集与正向不等，故各记一张） */
export const OP_PAIRS_REFUSED_DECL_VAL_REV: Readonly<Record<string, ReadonlyArray<string>>> = {
  "%": ["Color|Color", "Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2|Color", "Vector2|String", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|int", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "*": ["Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "String|Color", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|String", "int|String"],
  "+": ["Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "-": ["Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "String|Color", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "/": ["Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "String|Color", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "<": ["Color|Color", "Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "==": ["Color|String", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "String|Color", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|String", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|String", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|String", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],

};

/** 左支写成「静态型标明的名字」、右支是字面量那一形（S395）：468 格全过裁判，引擎这一路**一律第二式**，
 *  而且拒的集合与「两侧字面量」那张不一样 —— `and` / `or` 掺 String 那十四格在字面量那一集里拒、在这里收。
 *  量过的名字写法三种：模块级 `var a: T`、形参 `f(a: T)`、内部类字段（`tmp/probe-declrecv/compare59.txt` 各抽若干）；
 *  `const` 左支走的是字面量那一集（同文件四格），所以这张表**不**收 const。函数体内推断来的 `var a = true` 没量过，不发。 */
/** 左支是**模块级 `const`** 而右支是字面量那一形（S396，尺 `tmp/probe-constrecv/round1.mts`，读数 `compare60.txt`）：
 *  468 格自成第三集 —— 238 格第一式、121 格第二式，收的也比字面量那一集少 16 格；容器左支在字面量那一集走第二式、
 *  在这一集走第一式，所以两张表都得单列，不能借 `OP_PAIRS_REFUSED_A` / `_B`。 */
export const OP_PAIRS_CONST_A: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "%": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|float", "int|String", "float|bool", "float|int", "float|float", "float|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "*": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "+": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "-": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "/": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "String|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "<": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "<=": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "==": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  ">": ["bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  ">=": ["bool|bool", "bool|int", "bool|float", "bool|String", "int|bool", "int|String", "float|bool", "float|String", "String|bool", "String|int", "String|float", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "and": ["bool|String", "int|String", "float|String", "String|bool", "String|int", "String|float", "String|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
  "or": ["bool|String", "int|String", "float|String", "String|bool", "String|int", "String|float", "String|String", "Array|bool", "Array|int", "Array|float", "Array|String", "Dictionary|bool", "Dictionary|int", "Dictionary|float", "Dictionary|String"],
};

export const OP_PAIRS_CONST_B: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array"],
  "%": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "Array|Array", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "*": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Array", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "+": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "-": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Array", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "/": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Array", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "<": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "<=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  "==": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array"],
  ">": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
  ">=": ["bool|Array", "bool|Dictionary", "int|Array", "int|Dictionary", "float|Array", "float|Dictionary", "String|Array", "String|Dictionary", "Array|Dictionary", "Dictionary|Array", "Dictionary|Dictionary"],
};

/** 值型那几面的**属性名**（dump 的 `members`）：属性当值拿的是属性自己的型，不是 Callable（S465 ⑤ 那格误拦的根因）。 */
export const BUILTIN_INSTANCE_PROPS: Readonly<Record<string, ReadonlyArray<string>>> = {
  "Vector2": ["x", "y"],
  "Vector2i": ["x", "y"],
  "Vector3": ["x", "y", "z"],
  "Vector3i": ["x", "y", "z"],
  "Color": ["a", "a8", "b", "b8", "g", "g8", "h", "ok_hsl_h", "ok_hsl_l", "ok_hsl_s", "r", "r8", "s", "v"],
};

/** `Callable`（方法名当值）参加运算的那些对：全部走第二式，两向都量过（S465 ⑥ 复量：尺 `tmp/d6/callables2.py`，读数 `tmp/d6/cb.json`，153 格；先前按文本回切的分类器把构造位那几行切断，才误判成「式子按运算符分」）。 */
export const OP_PAIRS_REFUSED_CALLABLE: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool"],
  "%": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "float|float", "float|int", "int|Callable"],
  "*": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|bool", "int|Callable"],
  "+": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "int|Callable"],
  "-": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "int|Callable"],
  "/": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "int|Callable"],
  "<": ["Array|Callable", "Callable|Array", "Callable|Callable", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "int|Callable"],
  "==": ["Array|Callable", "Callable|Array", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "Dictionary|Callable", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool", "int|Callable"],
  ">": ["Callable|Callable", "Callable|String", "Callable|Vector2", "Callable|bool", "Callable|float", "Callable|int", "String|Callable", "Vector2|Callable", "bool|Callable", "float|Callable", "float|String", "float|Vector2", "float|bool"],
};

/** 值型那几面**属性名**自己的型（同一份 `--dump-extension-api` 的 `members[].type`）：属性名当值交的是这个型，不是 Callable（S466 ② 的那一分、S467 的输入）。 */
export const BUILTIN_MEMBER_TYPES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "Vector2": {"x": "float", "y": "float",},
  "Vector2i": {"x": "int", "y": "int",},
  "Vector3": {"x": "float", "y": "float", "z": "float",},
  "Vector3i": {"x": "int", "y": "int", "z": "int",},
  "Color": {"a": "float", "a8": "int", "b": "float", "b8": "int", "g": "float", "g8": "int", "h": "float", "ok_hsl_h": "float", "ok_hsl_l": "float", "ok_hsl_s": "float", "r": "float", "r8": "int", "s": "float", "v": "float",},
};

function checkOperandPairs(m: Module, diags: Diagnostic[]): void {
  const ANNOT = new Set(["bool", "int", "float", "String", "Array", "Dictionary", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]);
  const named = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    return ANNOT.has(base) ? base : null;
  };
  const moduleTypes = new Map<string, string>();
  const moduleConsts = new Map<string, string>();
  /** 定形容器要把**原文标注**才读得出内型（`named` 那一步把 `Array[Vector2]` 削成 `Array` 了）。 */
  const moduleRaws = new Map<string, string>();
  const rawOf = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" ? t.name : null);
  for (const v of m.vars) {
    const rw = rawOf(v.type);
    if (rw !== null) moduleRaws.set(v.name, rw);
    const t = named(v.type);
    if (t === null) continue;
    if (v.isConst) moduleConsts.set(v.name, t);
    else moduleTypes.set(v.name, t);
  }
  const literalKind = (e: Expr): string | null => staticType(e);

  const checkBody = (body: Stmt[], base: Map<string, string>, consts: Map<string, string>): void => {
    const types = new Map(base);
    const raws = new Map(moduleRaws);
    const nodes = flattenBody(body);
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || n.isConst === true) continue;
      const rw = rawOf(n.type as TypeRef | null);
      if (rw !== null) raws.set(n.name, rw);
      const t = named(n.type as TypeRef | null);
      if (t !== null) types.set(n.name, t);
    }
    /** 接收者那一格的静态型：标注名、定形数组的元素读、构造位字面量三形（与 S459/S461 同一批判据）。 */
    const faceOf = (e: Expr): string | null =>
      e.kind === "ident" ? (types.get(e.name) ?? null) : e.kind === "index" ? elemOf(e) : staticType(e);
    /** 「方法名当值」是个 Callable；**属性名当值不是**（`.x` 拿的是属性自己的型 —— S465 ⑤ 那格误拦的根因）。 */
    const callableOf = (e: Expr): string | null => {
      if (e.kind !== "attribute") return null;
      const face = faceOf(e.obj);
      if (face === null) return null;
      const nm = e.name;
      if (typeof nm !== "string") return null;
      const members = BUILTIN_INSTANCE_MEMBERS[face];
      if (members === undefined || !members.includes(nm)) return null;
      if ((BUILTIN_INSTANCE_PROPS[face] ?? []).includes(nm)) {
        const by = BUILTIN_MEMBER_TYPES[face];
        const t = by === undefined ? undefined : by[nm];
        return typeof t === "string" && ANNOT.has(t) ? t : null;
      }
      return "Callable";
    };
    /** `v.floor() + "x"` 那一形：调用的是认得面上的认得方法，就把**返回型**交给现成的型对表（S462，读数 `tmp/d6/n7.txt`）。 */
    const callRet = (e: Expr): string | null => {
      if (e.kind !== "call" || e.callee.kind !== "attribute") return null;
      const face = faceOf(e.callee.obj);
      if (face === null) return null;
      const by = BUILTIN_METHOD_RETURNS[face];
      if (by === undefined) return null;
      const name = e.callee.name;
      return typeof name === "string" ? (by[name] ?? null) : null;
    };
    const operandKind = (e: Expr): string | null => literalKind(e) ?? callRet(e) ?? callableOf(e);
    /** 定形容器那一读的静态型：数组交内型、字典交值型（S459 量的是字面量 int 下标，S468 补上非字面量下标与字典值读；键型不合式就不判，那一格由下标型闸门报）。 */
    const elemOf = (e: Expr): string | null => {
      if (e.kind !== "index" || e.obj.kind !== "ident") return null;
      const slot = parseTyped(raws.get(e.obj.name) ?? "");
      if (slot === null) return null;
      const kt = staticType(e.index);
      if (slot.kind === "Array") {
        if (kt !== null && kt !== "int") return null;
        return slot.elem !== undefined && ANNOT.has(slot.elem) ? slot.elem : null;
      }
      if (slot.key === undefined || slot.val === undefined || !ANNOT.has(slot.val)) return null;
      if (kt !== null && !canHold(slot.key, kt)) return null;
      return slot.val;
    };
    /** 两侧都是 Callable 那一形：引擎只报一句，两支循环各报一遍就成了两句重复（读数 `tmp/d6/cb.json`）。 */
    const reported = new Set<Expr>();
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (e.left.kind !== "ident" && e.left.kind !== "index" && e.left.kind !== "call" && e.left.kind !== "attribute") continue;
      const rt = operandKind(e.right);
      if (rt === null) continue;
      const isIdent = e.left.kind === "ident";
      const name = isIdent ? (e.left as Extract<Expr, { kind: "ident" }>).name : "";
      const isConst = isIdent && consts.has(name);
      const lt = isIdent ? (isConst ? (consts.get(name) ?? null) : (types.get(name) ?? null)) : e.left.kind === "index" ? elemOf(e.left) : e.left.kind === "call" ? callRet(e.left) : callableOf(e.left);
      if (lt === null) continue;
      const pair = `${lt}|${rt}`;
      const foldedA = isConst && OP_PAIRS_CONST_A[e.op]?.includes(pair) === true;
      const foldedB = isConst && OP_PAIRS_CONST_B[e.op]?.includes(pair) === true;
      const declaredB = !isConst && (OP_PAIRS_REFUSED_DECL[e.op]?.includes(pair) === true || OP_PAIRS_REFUSED_DECL_VAL[e.op]?.includes(pair) === true || OP_PAIRS_REFUSED_CALLABLE[e.op]?.includes(pair) === true);
      if (!foldedA && !foldedB && !declaredB) continue;
      diags.push({
        code: "op-pair",
        message: foldedA
          ? `Invalid operands to operator ${e.op}, ${lt} and ${rt}.`
          : `Invalid operands "${lt}" and "${rt}" for "${e.op}" operator.`,
        loc: e.loc,
      });
      reported.add(e);
    }
    // 反过来那一形（左支字面量、右支是标明类型的名字）与上面共用同一张表：468 格对照下来，
    // 329 对与第二式一字不差（`tmp/probe-revrecv/compare61.txt`，S397），所以只镜像判据、不再另立表。
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (reported.has(e as unknown as Extract<Expr, { kind: "binary" }>)) continue;
      if (e.right.kind !== "ident" && e.right.kind !== "index" && e.right.kind !== "call" && e.right.kind !== "attribute") continue;
      const lt2 = operandKind(e.left);
      if (lt2 === null) continue;
      const rt2 = e.right.kind === "ident" ? (types.get((e.right as Extract<Expr, { kind: "ident" }>).name) ?? null) : e.right.kind === "index" ? elemOf(e.right) : e.right.kind === "call" ? callRet(e.right) : callableOf(e.right);
      if (rt2 === null) continue;
      const pair2 = `${lt2}|${rt2}`;
      if (OP_PAIRS_REFUSED_DECL[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_DECL_VAL_REV[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_CALLABLE[e.op]?.includes(pair2) !== true) continue;
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${lt2}" and "${rt2}" for "${e.op}" operator.`,
        loc: e.loc,
      });
    }
  };

  const withParams = (f: FuncDecl): Map<string, string> => {
    const types = new Map(moduleTypes);
    for (const p of f.params) {
      const t = named(p.type);
      if (t !== null) types.set(p.name, t);
    }
    return types;
  };
  for (const f of m.funcs) checkBody(f.body, withParams(f), moduleConsts);
  const collect = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    for (const v of c.vars) {
      const t = named(v.type);
      if (t !== null && !v.isConst) fields.set(v.name, t);
    }
    for (const f of c.funcs) {
      const types = new Map(fields);
      for (const p of f.params) {
        const t = named(p.type);
        if (t !== null) types.set(p.name, t);
      }
      checkBody(f.body, types, new Map<string, string>());
    }
    for (const inner of c.innerClasses) collect(inner);
  };
  for (const c of m.innerClasses) collect(c);
}

/** 两侧都是字面量时的那两张表：`checkOperator` 里发（S394）。 */
function checkOperator(e: Extract<Expr, { kind: "binary" }>, diags: Diagnostic[]): void {
  const l = staticType(e.left);
  const r = staticType(e.right);

  // 两侧都是字面量的那一半：按 468 格那张表发（S394）。既有三道闸门已经发同样句子的组合不再重复发。
  const pair = l !== null && r !== null ? `${l}|${r}` : null;
  const scalar = (t: string | null): boolean => t === "bool" || t === "int" || t === "float";
  const covered =
    (e.op === "%" && (l === "float" || r === "float") && scalar(l) && scalar(r)) ||
    ((e.op === "==" || e.op === "!=") &&
      ((l === "String" && (r === "int" || r === "float")) || (r === "String" && (l === "int" || l === "float")))) ||
    ((e.op === "<=" || e.op === ">=") && l === "bool" && r === "bool");
  if (!covered && isLiteralOperand(e.left) && isLiteralOperand(e.right) && pair !== null && l !== null && r !== null) {
    if (OP_PAIRS_REFUSED_A[e.op]?.includes(pair) === true) {
      diags.push({
        code: "op-pair",
        message: `Invalid operands to operator ${e.op}, ${l} and ${r}.`,
        loc: e.loc,
      });
    } else if (OP_PAIRS_REFUSED_B[e.op]?.includes(pair) === true) {
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${l}" and "${r}" for "${e.op}" operator.`,
        loc: e.loc,
      });
    }
  }
  const isModulo = l !== "String" && r !== "String";
  if (e.op === "%" && isModulo && l !== null && r !== null && (l === "float" || r === "float")) {
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
  const argKind = literalTypeName(e.args[0]);
  const t = staticType(e.args[0] as Expr);
  const msg = argKind !== null || t === null ? undefined : JOIN_BAD_ARG[t];
  if (msg !== undefined) diags.push({ code: "join-arg", message: msg, loc: e.loc });
  // 实参是字面量的那十二形由 `FACE_ARG_*` 那两张实测表管（引擎在那里推两句，手抄的这张表只有一句）
}
/** 全局函数的元数两句（S365 逐名量的那 208 格）：引擎这两句都在**解析期**，出货此前在**发射期**发同文（§6 第 59 条①）——
 *  搬进 analyze 之后 `gds2js check` 才看得见它们。表与句子逐字沿用原发射期那一份，一处不改编排。 */
const BUILTIN_ARITY: Record<string, [number, number]> = {
  abs: [1, 1],
  absf: [1, 1],
  absi: [1, 1],
  acos: [1, 1],
  acosh: [1, 1],
  angle_difference: [2, 2],
  asin: [1, 1],
  asinh: [1, 1],
  atan: [1, 1],
  atan2: [2, 2],
  atanh: [1, 1],
  bezier_derivative: [5, 5],
  bezier_interpolate: [5, 5],
  bytes_to_var: [1, 1],
  bytes_to_var_with_objects: [1, 1],
  ceil: [1, 1],
  ceilf: [1, 1],
  ceili: [1, 1],
  char: [1, 1],
  clamp: [3, 3],
  clampf: [3, 3],
  clampi: [3, 3],
  convert: [2, 2],
  cos: [1, 1],
  cosh: [1, 1],
  cubic_interpolate: [5, 5],
  cubic_interpolate_angle: [5, 5],
  cubic_interpolate_in_time: [8, 8],
  db_to_linear: [1, 1],
  deg_to_rad: [1, 1],
  dict_to_inst: [1, 1],
  ease: [2, 2],
  error_string: [1, 1],
  exp: [1, 1],
  floor: [1, 1],
  floorf: [1, 1],
  floori: [1, 1],
  fmod: [2, 2],
  fposmod: [2, 2],
  get_stack: [0, 0],
  hash: [1, 1],
  inst_to_dict: [1, 1],
  instance_from_id: [1, 1],
  inverse_lerp: [3, 3],
  is_equal_approx: [2, 2],
  is_finite: [1, 1],
  is_inf: [1, 1],
  is_instance_id_valid: [1, 1],
  is_instance_of: [2, 2],
  is_instance_valid: [1, 1],
  is_nan: [1, 1],
  is_same: [2, 2],
  is_zero_approx: [1, 1],
  len: [1, 1],
  lerp: [3, 3],
  lerp_angle: [3, 3],
  lerpf: [3, 3],
  linear_to_db: [1, 1],
  log: [1, 1],
  max: [2, Number.POSITIVE_INFINITY],
  maxf: [2, 2],
  maxi: [2, 2],
  min: [2, Number.POSITIVE_INFINITY],
  minf: [2, 2],
  mini: [2, 2],
  move_toward: [3, 3],
  nearest_po2: [1, 1],
  pingpong: [2, 2],
  posmod: [2, 2],
  pow: [2, 2],
  print_stack: [0, 0],
  rad_to_deg: [1, 1],
  rand_from_seed: [1, 1],
  randf: [0, 0],
  randf_range: [2, 2],
  randfn: [2, 2],
  randi: [0, 0],
  randi_range: [2, 2],
  randomize: [0, 0],
  remap: [5, 5],
  rid_allocate_id: [0, 0],
  rid_from_int64: [1, 1],
  rotate_toward: [3, 3],
  round: [1, 1],
  roundf: [1, 1],
  roundi: [1, 1],
  seed: [1, 1],
  sign: [1, 1],
  signf: [1, 1],
  signi: [1, 1],
  sin: [1, 1],
  sinh: [1, 1],
  smoothstep: [3, 3],
  snapped: [2, 2],
  snappedf: [2, 2],
  snappedi: [2, 2],
  sqrt: [1, 1],
  step_decimals: [1, 1],
  str_to_var: [1, 1],
  tan: [1, 1],
  tanh: [1, 1],
  type_convert: [2, 2],
  type_exists: [1, 1],
  type_string: [1, 1],
  var_to_bytes: [1, 1],
  var_to_bytes_with_objects: [1, 1],
  var_to_str: [1, 1],
  weakref: [1, 1],
  wrap: [3, 3],
  wrapf: [3, 3],
  wrapi: [3, 3],
  typeof: [1, 1],
};

/** 少给 / 多给在引擎是解析期拒；这里同在解析期发同文，措辞照原文，`code` 沿用已出货那三支的。 */

function builtinArity(name: string, got: number): string | null {
  const ar = BUILTIN_ARITY[name];
  if (ar === undefined) return null;
  if (got >= ar[0] && got <= ar[1]) return null;
  return got < ar[0]
    ? `Too few arguments for "${name}()" call. Expected at least ${String(ar[0])} but received ${String(got)}.`
    : `Too many arguments for "${name}()" call. Expected at most ${String(ar[1])} but received ${String(got)}.`;
}

/** 类型构造式之外，`range` 与 `str` 的元数走的是**另一条句子通道**（S385 ②③）：既不是 `Too few` 也不是 `Too many`，
 *  而是 `Invalid call to [GDScript ]utility function "X()". Expected N argument(s).` —— 少了报下界那一位、多了报上界那一位，
 *  而且 `str` 的前缀比 `range` 少了 "GDScript"，两支各抄各的。上界写 `null` 是那一支没量过上界（`str` 八支实参照收）。
 *  读数 `tmp/probe-void/{compare33,compare34}.txt`。同 S387 那批，从发射期搬来，`check` 才看得见。 */
const UTILITY_ARITY: Record<string, [number, number | null, string]> = {
  range: [1, 3, "GDScript utility function"],
  str: [1, null, "utility function"],
};

function utilityArity(name: string, got: number): string | null {
  const u = UTILITY_ARITY[name];
  if (u === undefined) return null;
  const min = u[0];
  const max = u[1];
  const kind = u[2];
  if (got >= min && (max === null || got <= max)) return null;
  return `Invalid call to ${kind} "${name}()". Expected ${String(max !== null && got > max ? max : min)} argument(s).`;
}

/** `code` 沿用已出货那几名自己的名字（发射期那道闸门就是这么分的，一行不改）。 */
function builtinArityCode(name: string): string {
  if (name === "char") return "char-arity";
  if (name === "var_to_str") return "var-to-str-arity";
  if (name === "str_to_var") return "str-to-var-arity";
  if (name === "convert" || name === "type_convert") return "convert-arity";
  if (name === "range" || name === "str") return `${name}-arity`;
  return "builtin-arity";
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

/** 值类型方法的元数表（S305）：154 名逐名过裁判（`tmp/probe-value-arity/{a,max,max6}.mts`），存 `[下界, 上界]` ——
 *  148 名是定元数，只有六支带默认实参（`limit_length` 0..1、`Color.clamp` 0..2、`from_hsv` / `from_ok_hsl` 3..4、`to_html` 0..1）。 */
/** pack 九支共用的那 21 名元数，两侧都是九支逐支量过的：「至少」六支在 `tmp/probe-pack/sweep.json`、byte / int32 / string 在 `compare18.txt`；
 *  「至多」int64 / byte / string 在 `compare16.txt` 与 `arity2.log`、其余五支在 `compare19.txt`（110 格，五支读数一字不差）。
 *  `slice` 的上限是 **2** 不是 3 —— pack 那支没有 `Array.slice(begin, end, step)` 的 step。byte 独有的 `compress` / `decompress` 那一族只量到下限，不进表。 */
/** 八支（除 byte 自己）多一支 `to_byte_array`：byte 上引擎说没这名字（`tmp/probe-pack/arity2.log` 第 10 格）。 */

/** pack 九支的类型名：它们不在 ClassDB 里（不是 `ENGINE_CLASS_NAMES` 那一族）、也没有静态成员（进不了 `STATIC_MEMBER_FNS`），
 *  但当属性基出现时是合法的类型名 —— `PackedInt64Array.size()` 引擎给的是「不是静态方法」那一句，不是「没声明」（S376 ⑤，读数 `arity2.log` 07–09）。 */
const PACK_TYPE_NAMES = new Set([
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


/** 只认「名字本身就是表里那几支之一」的标注与字面量构造式（值类型五支 + pack 九支），别的（`Variant`、自定义类、引擎类）一概不猜。 */
function valueTypeAnnotation(t: TypeRef | null): string | null {
  return t !== null && t.kind === "named" && t.name in VALUE_METHOD_ARITY ? t.name : null;
}

function valueCtorType(e: Expr | null): string | null {
  return e !== null && e.kind === "call" && e.callee.kind === "ident" && e.callee.name in VALUE_METHOD_ARITY
    ? e.callee.name
    : null;
}

/**
 * 内建类型「类名.成员」那一面（4.6.3 一格一脚本量过六型 44 形，`tmp/probe-static-face/readings.txt`）。
 * `statics` 必须是引擎真绑了的全集（名单来自 `core/variant/variant_call.cpp` 的 `bind_static_method`，见 §6 第 46 条）——
 * 少一支就会误拦合法代码；`consts` / `axis` 只决定句子，少一支仍是拒、只是换成表外名字那两句。
 */
const STATIC_FACE: Record<string, { consts: readonly string[]; axis: readonly string[]; statics: Record<string, [number, number]> }> = {
  Vector2: {
    consts: ["ZERO", "ONE", "INF", "LEFT", "RIGHT", "UP", "DOWN"],
    axis: ["AXIS_X", "AXIS_Y"],
    statics: { from_angle: [1, 1] },
  },
  Vector2i: {
    consts: ["ZERO", "ONE", "LEFT", "RIGHT", "UP", "DOWN", "MAX", "MIN"],
    axis: ["AXIS_X", "AXIS_Y"],
    statics: {},
  },
  Vector3: {
    consts: ["ZERO", "ONE", "INF", "LEFT", "RIGHT", "UP", "DOWN", "FORWARD", "BACK"],
    axis: ["AXIS_X", "AXIS_Y", "AXIS_Z"],
    statics: { octahedron_decode: [1, 1] },
  },
  Vector3i: {
    consts: ["ZERO", "ONE", "LEFT", "RIGHT", "UP", "DOWN", "FORWARD", "BACK", "MAX", "MIN"],
    axis: ["AXIS_X", "AXIS_Y", "AXIS_Z"],
    statics: {},
  },
  Color: {
    consts: [],
    axis: [],
    statics: {
      html: [1, 1],
      html_is_valid: [1, 1],
      from_string: [2, 2],
      from_hsv: [3, 4],
      from_ok_hsl: [3, 4],
      from_rgba8: [3, 4],
      from_rgbe9995: [1, 1],
      hex: [1, 1],
      hex64: [1, 1],
    },
  },
  String: {
    consts: [],
    axis: [],
    statics: {
      chr: [1, 1],
      num: [1, 2],
      num_int64: [1, 3],
      num_uint64: [1, 3],
      num_scientific: [1, 1],
      humanize_size: [1, 1],
    },
  },
};

function staticFaceConstName(t: string, name: string): boolean {
  const face = STATIC_FACE[t];
  if (face === undefined) return false;
  return face.consts.includes(name) || face.axis.includes(name) || (t === "Color" && COLOR_NAMED[name.toLowerCase()] !== undefined);
}

/** 「类名.成员」的调用式：常量当函数调 / 静态函数元数 / 实例方法在类名上直接调 / 表外名字两句。 */
function staticCallDiags(t: string, name: string, got: number): Array<{ code: string; message: string }> {
  const face = STATIC_FACE[t];
  // pack 九支没有静态面（`STATIC_FACE` 里没它们），但「类名直调实例方法」与「类名上没这成员」两句照发（S376 ⑤）
  if (face === undefined && !PACK_TYPE_NAMES.has(t)) return [];
  if (face !== undefined && staticFaceConstName(t, name)) {
    const shown = face.axis.includes(name) ? `${t}.Axis` : t;
    return [{ code: "static-const-call", message: `Name "${name}" called as a function but is a "${shown}".` }];
  }
  const sig = face?.statics[name];
  if (sig !== undefined) {
    if (got >= sig[0] && got <= sig[1]) return [];
    return [
      {
        code: "static-arity",
        message:
          got < sig[0]
            ? `Too few arguments for "${name}()" call. Expected at least ${sig[0]} but received ${got}.`
            : `Too many arguments for "${name}()" call. Expected at most ${sig[1]} but received ${got}.`,
      },
    ];
  }
  if (VALUE_METHOD_ARITY[t]?.[name] !== undefined) {
    return [
      {
        code: "static-nonstatic-call",
        message: `Cannot call non-static function "${name}()" on the class "${t}" directly. Make an instance instead.`,
      },
    ];
  }
  return [
    { code: "static-member-unknown", message: `Cannot find member "${name}" in base "${t}".` },
    { code: "static-member-unknown", message: `Function "${name}()" not found in base ${t}.` },
  ];
}

/** 「类名.静态函数」当值引用（不调用）不是一等成员：引擎那句报两遍。 */
function staticBareDiags(t: string, name: string): Array<{ code: string; message: string }> {
  const face = STATIC_FACE[t];
  if (face === undefined || face.statics[name] === undefined || staticFaceConstName(t, name)) return [];
  const one = `Cannot find member "${name}" in base "${t}".`;
  return [
    { code: "static-member-unknown", message: one },
    { code: "static-member-unknown", message: one },
  ];
}

/**
 * 值类型方法调用的实参数：引擎在**解析期**就按接收者的静态形拦（`tmp/probe-value-arity/recv.mts` 十二形）——
 * 字面构造式、`var v: Vector2` 的标注（有没有初值都算）、`var v = Vector2(1, 2)` 的推断、形参标注、模块级 `var` 与 `const`
 * 这五形全在解析期拦，连 `if false:` 那种永不执行的分支也拦；`var v: Variant` 与未定形 `Array` 的元素解析期放过、
 * 成运行期那句（`tmp/probe-value-arity/rt.mts`）。链式（`normalized().angle_to()`）与定形 `Array[Vector2]` 的元素也是解析期拦，
 * 但那要另两张表（方法返回类型 / 定形数组的元素形）—— 没量的不猜，那两形落进运行期那句，差的只是时机。
 */
function checkValueMethodArity(m: Module, diags: Diagnostic[]): void {
  const moduleVars = new Map<string, string>();
  for (const v of m.vars) {
    const t = valueTypeAnnotation(v.type) ?? (v.type === null ? valueCtorType(v.init) : null);
    if (t !== null) moduleVars.set(v.name, t);
  }

  const funcs: Array<{ f: FuncDecl; base: Map<string, string> }> = m.funcs.map((f) => ({ f, base: moduleVars }));
  const collect = (c: ClassDecl): void => {
    // 内部类的方法不给它预置模块级名字：那一侧引擎怎么判没量过，宁可漏拦也不误拦
    for (const f of c.funcs) funcs.push({ f, base: new Map<string, string>() });
    for (const x of c.innerClasses) collect(x);
  };
  for (const c of m.innerClasses) collect(c);

  for (const { f, base } of funcs) {
    const typed = new Map(base);
    // 标了 `String` / `Array` / `Dictionary` 的名字：引擎在带标注的变量接收者上说的句子，与字面量接收者那一趟一字不差
    //（`tmp/probe-argtype/packed3.mts` 的 1358 格与 `p2-t4.txt` 逐格比过），所以同一张表照用
    const faceTyped = new Map<string, string>();
    for (const p of f.params) {
      const t = valueTypeAnnotation(p.type);
      if (t !== null) typed.set(p.name, t);
      if (p.type !== null && p.type.kind === "named" && FACE_ANNOTATIONS.has(p.type.name)) faceTyped.set(p.name, p.type.name);
    }
    const elemFaces = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && elemFaceOf(t.name) !== null) elemFaces.set(name, t.name);
    };
    for (const v of m.vars) noteElem(v.name, v.type);
    for (const prm of f.params) noteElem(prm.name, prm.type);
    /** `e[0].m(...)` 这一形的接收者：只认字面量 int 下标那一格（S460 量的就是它，其余形不判）。 */
    const recvElem = (obj: Expr): string | null => {
      if (obj.kind !== "index" || obj.obj.kind !== "ident") return null;
      if (staticType(obj.index) !== "int") return null;
      return elemFaceOf(elemFaces.get(obj.obj.name) ?? "");
    };

    const calls: Extract<Expr, { kind: "call" }>[] = [];
    const staticCallees = new Set<Expr>();
    const varDecls: Extract<Stmt, { kind: "var" }>[] = [];
    const assigned = new Set<string>();

    const walkExpr = (e: Expr): void => {
      switch (e.kind) {
        case "attribute":
          // 「类名.静态函数」当值引用不是一等成员（引擎那句报两遍）；调用位置那一支在下面按元数判
          if (!staticCallees.has(e) && e.obj.kind === "ident") {
            for (const d of staticBareDiags(e.obj.name, e.name)) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
          walkExpr(e.obj);
          return;
        case "index":
          walkExpr(e.obj);
          walkExpr(e.index);
          return;
        case "binary":
          walkExpr(e.left);
          walkExpr(e.right);
          return;
        case "unary":
        case "await":
        case "is":
        case "as":
          walkExpr(e.operand);
          return;
        case "array":
          for (const it of e.items) walkExpr(it);
          return;
        case "dict":
          for (const en of e.entries) {
            walkExpr(en.key);
            walkExpr(en.value);
          }
          return;
        case "call":
          calls.push(e);
          if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" && e.callee.obj.name in STATIC_FACE) {
            staticCallees.add(e.callee);
          }
          walkExpr(e.callee);
          for (const a of e.args) walkExpr(a);
          return;
        default:
          return;
      }
    };

    const walkStmt = (s: Stmt): void => {
      switch (s.kind) {
        case "expr":
          walkExpr(s.expr);
          return;
        case "var":
          varDecls.push(s);
          if (s.init !== null) walkExpr(s.init);
          return;
        case "assign":
          if (s.target.kind === "ident") assigned.add(s.target.name);
          walkExpr(s.target);
          walkExpr(s.value);
          return;
        case "if":
          for (const br of s.branches) {
            if (br.cond !== null) walkExpr(br.cond);
            for (const x of br.body) walkStmt(x);
          }
          return;
        case "for":
          walkExpr(s.iter);
          for (const x of s.body) walkStmt(x);
          return;
        case "while":
          walkExpr(s.cond);
          for (const x of s.body) walkStmt(x);
          return;
        case "match":
          walkExpr(s.subject);
          for (const arm of s.arms) {
            if (arm.guard !== null) walkExpr(arm.guard);
            for (const x of arm.body) walkStmt(x);
          }
          return;
        case "return":
          if (s.value !== null) walkExpr(s.value);
          return;
        default:
          return;
      }
    };

    for (const s of f.body) walkStmt(s);

    for (const d of varDecls) {
      // 没标注的名字一旦被重新赋值就没了保证；标注那一侧引擎不松口，不受这条影响
      if (d.type === null && assigned.has(d.name)) continue;
      // 标了别的类型（`Variant` 是实测到的那一形）就不许再拿初值猜：引擎那侧 `var v: Variant = Vector2(1, 2)` 解析期放过
      const t = valueTypeAnnotation(d.type) ?? (d.type === null ? valueCtorType(d.init) : null);
      if (t !== null) typed.set(d.name, t);
      if (d.type !== null && d.type.kind === "named" && FACE_ANNOTATIONS.has(d.type.name)) faceTyped.set(d.name, d.type.name);
      // 没标注的初值那一侧也量过：`var rs = "abc"` 与 `var rs: String = "abc"` 说的句子逐格一样（`tmp/probe-argtype/p5-infer.txt` 1358 格 / 不同 0）
      if (d.type === null && d.init !== null) {
        const inferred = literalFaceType(d.init, new Map());
        if (inferred !== null) faceTyped.set(d.name, inferred);
      }
    }

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "attribute") continue;
      if (callee.obj.kind === "ident" && (callee.obj.name in STATIC_FACE || PACK_TYPE_NAMES.has(callee.obj.name))) {
        for (const d of staticCallDiags(callee.obj.name, callee.name, e.args.length)) diags.push({ code: d.code, message: d.message, loc: e.loc });
        // 形参那一族与全局函数同构；元数不对时先让元数那一句说（与 `GLOBAL_ARG_*` 那一段同一口径）
        const bounds = STATIC_FACE[callee.obj.name]?.statics[callee.name];
        if (bounds !== undefined && e.args.length >= bounds[0] && e.args.length <= bounds[1]) {
          const skey = `${callee.obj.name}.${callee.name}`;
          const byPos = new Map<number, Array<{ code: string; message: string }>>();
          const put = (pos: number, code: string, message: string): void => {
            const bucket = byPos.get(pos) ?? [];
            bucket.push({ code, message });
            byPos.set(pos, bucket);
          };
          for (const [pos, refuse, want, also] of STATIC_ARG_AS[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got === null || !refuse.includes(got)) continue;
            put(pos, "static-arg-pass", `Cannot pass a value of type "${got}" as "${want}".`);
            if (also.includes(got)) {
              put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
            }
          }
          for (const [pos, refuse, want] of STATIC_ARG_TYPES[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got === null || !refuse.includes(got)) continue;
            put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
          }
          for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
            for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
        }
        continue;
      }
      const face = literalFaceType(callee.obj, faceTyped);
      if (face !== null) {
        // 字面量接收者的 String / Array / Dictionary 那一面（`tmp/probe-argtype/packed2.mts`：元数由引擎自己的句子量出来，
        // 形参逐位逐 kind 量；读数都建在「实参个数正好等于量过的那个上界」这一形上，别的元数没量过就不发）
        const fkey = `${face}.${callee.name}`;
        const slot = FACE_SLOTS[fkey];
        const measured = typeof slot === "number" ? e.args.length === slot : slot !== undefined && slot.includes(e.args.length);
        if (measured) {
          const byPos = new Map<number, Array<{ code: string; message: string }>>();
          const put = (pos: number, code: string, message: string): void => {
            const bucket = byPos.get(pos) ?? [];
            bucket.push({ code, message });
            byPos.set(pos, bucket);
          };
          for (const [pos, refuse, want, also] of FACE_ARG_AS[fkey] ?? []) {
            const bad = literalTypeName(e.args[pos - 1]);
            if (bad === null || !refuse.includes(bad)) continue;
            put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
            if (also.includes(bad)) {
              put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
            }
          }
          for (const [pos, refuse, want] of FACE_ARG_TYPES[fkey] ?? []) {
            const bad = literalTypeName(e.args[pos - 1]);
            if (bad === null || !refuse.includes(bad)) continue;
            put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          }
          for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
            for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
        }
        continue;
      }
      const recv = callee.obj.kind === "ident" ? (typed.get(callee.obj.name) ?? null) : callee.obj.kind === "index" ? recvElem(callee.obj) : valueCtorType(callee.obj);
      if (recv === null) continue;
      const sig = VALUE_METHOD_ARITY[recv]?.[callee.name];
      if (sig === undefined) continue;
      const got = e.args.length;
      if (got >= sig[0] && got <= sig[1]) {
        // 形参那一族与全局 / 静态名同构，句子同样按位升序发（`tmp/probe-argtype/check-inst.mts` 逐格对过）
        // 读数全部是在**上界元数**下量的（`packed.mts` 每位都按 max 个实参建式子），别的元数没量过就不发
        const ikey = `${recv}.${callee.name}`;
        const byPos = new Map<number, Array<{ code: string; message: string }>>();
        const put = (pos: number, code: string, message: string): void => {
          const bucket = byPos.get(pos) ?? [];
          bucket.push({ code, message });
          byPos.set(pos, bucket);
        };
        for (const [pos, refuse, want, also] of got === sig[1] || got === sig[0] ? INSTANCE_ARG_AS[ikey] ?? [] : []) {
          const lit = e.args[pos - 1];
          const bad = lit === undefined ? null : literalTypeName(lit);
          if (bad === null || !refuse.includes(bad)) continue;
          put(pos, "instance-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
          if (also.includes(bad)) {
            put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          }
        }
        for (const [pos, refuse, want] of INSTANCE_ARG_TYPES[ikey] ?? []) {
          const lit = e.args[pos - 1];
          const bad = lit === undefined ? null : literalTypeName(lit);
          if (bad === null || !refuse.includes(bad)) continue;
          put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
        }
        for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
          for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
        }
        continue;
      }
      diags.push({
        code: "value-arity",
        message:
          got < sig[0]
            ? `Too few arguments for "${callee.name}()" call. Expected at least ${sig[0]} but received ${got}.`
            : `Too many arguments for "${callee.name}()" call. Expected at most ${sig[1]} but received ${got}.`,
        loc: e.loc,
      });
    }

    // `char()` 的实参是**字面量整数**时，引擎在解析期就判区间；float / bool 那一侧它是放过的
    // （`char(1.5)`、`char(true)` 实测都算得出 U+0001），所以这一支只碰 int 字面量与它的负号形。
    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "ident" || callee.name !== "char" || e.args.length !== 1) continue;
      const v = literalIntArg(e.args[0]!);
      if (v === null || (v >= 0n && v <= 4294967295n)) continue;
      diags.push({
        code: "char-range",
        message: 'Invalid argument for "char()" function: Expected an integer between 0 and 2^32 - 1.',
        loc: e.loc,
      });
    }

    // 固定形参型那一族：`sqrt("a")` → `argument 1 should be "float" but is "String".`（102 位逐位实测）；
    // `clamp` / `lerp` / `wrap` 的指定位是「跟第一参走」，第一参是 int / float 字面量时才知道期望型。
    // 另外三族（整句固定的允许集、声明类型那句 as、期望型不是 int / float 的 A 式位）按「引擎逐 kind 真拒的那张名单」拦，
    // 同一位上引擎收过的形（`abs([])`、`bytes_to_var([])`、`inst_to_dict(null)`）一个都不拦。
    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "ident") continue;
      // `max` / `min` 的扫法与按位那几张表不同：每一位都判、第一位不对就停（表注释有读数）。
      // 但这族**只要实参里出现一个容器（Array / Dictionary），整支调用就不在解析期发句** ——
      // 引擎改走运行期那句 `Invalid type in utility function …`（四形混排读数 `tmp/probe-maxrt/compare54.txt`：
      // 串在容器前面也一样推迟），那条通道由 `rt.gMax` / `rt.gMin` 发（S393）。
      const vararg = GLOBAL_ARG_VARARG[callee.name];
      if (vararg !== undefined) {
        const ar = BUILTIN_ARITY[callee.name];
        const kinds = e.args.map((a) => literalTypeName(a));
        if (ar !== undefined && e.args.length >= ar[0] && e.args.length <= ar[1] && !kinds.includes("Array") && !kinds.includes("Dictionary")) {
          const pos = kinds.findIndex((k) => k !== null && vararg.has(k));
          if (pos >= 0) {
            diags.push({
              code: "global-arg-type",
              message: `Invalid argument for "${callee.name}()" function: argument ${String(pos + 1)} should be "float" but is "${kinds[pos]}".`,
              loc: e.loc,
            });
          }
        }
        continue;
      }
      // 元数不对时引擎先说元数那一句（本轮同一次 analyze 里那道闸门已经发了），这一轮的类型判据一律不许抢在前面
      const bounds = GLOBAL_CALLABLES[callee.name]?.bounds ?? null;
      if (bounds === null || e.args.length < bounds[0] || e.args.length > bounds[1]) continue;
      const spec = GLOBAL_ARG_TYPES[callee.name];
      const follows = ARG_TYPE_FOLLOWS_FIRST[callee.name];
      const shouldRows = GLOBAL_ARG_SHOULD_BE[callee.name];
      const sentenceRows = GLOBAL_ARG_SENTENCE[callee.name];
      const asRows = GLOBAL_ARG_AS[callee.name];
      if (spec === undefined && follows === undefined && shouldRows === undefined && sentenceRows === undefined && asRows === undefined) {
        continue;
      }
      // 同位上两种期望型并存的（`convert` 的第二参：Array / Dictionary 说 Variant.Type、别的说 int）整条交给逐 kind 的名单
      const shouldPos = new Set<number>();
      for (const shouldRow of shouldRows ?? []) shouldPos.add(shouldRow[0]);
      const suppress = GLOBAL_ARG_SUPPRESS_OTHER[callee.name];
      // 引擎按**位升序**逐位推句（`randf_range([1], "a")` 实测：第 1 位 A 式在前、第 2 位 as 那一对在后），
      // 五族混在同一格时会互相错开，所以句子先按位归桶、再按位发。
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      const wants: Array<[number, "int" | "float" | "bool"]> = spec ? spec.map(([p, t]) => [p, t] as [number, "int" | "float"]) : [];
      // 「跟第一参走」那几位**连 bool 字面量也拒**（`clamp(1, false, 1)` 说该位期望 "int"、`lerp(1.5, false, 0.5)` 说 "float"、
      // `wrap(1, 2, false)` 说第三位 "int"）；`clamp` 还会跟一支 bool 第一参走 —— 那时 2 / 3 位期望的是 bool，int / float 反倒拒
      // （`clamp(true, 1, 2)` → argument 2 should be "bool" but is "int".，实测三位同形）。
      const boolFollows = follows === undefined ? null : new Set<number>(follows);
      if (follows !== undefined) {
        const first =
          e.args[0] === undefined
            ? null
            : GLOBAL_ARG_FOLLOWS_BOOL[callee.name] === true
              ? literalTypeName(e.args[0])
              : numericLiteralKind(e.args[0]);
        if (first === "int" || first === "float" || first === "bool") for (const p of follows) wants.push([p, first]);
      }
      // 数值位上拒 bool 的那几张表（S362）：`wrap` 只有第一位（变元的 `max` / `min` 在上面那支单独扫）
      const boolFixed = new Set(GLOBAL_ARG_BOOL_REFUSED[callee.name] ?? []);
      const refusesBool = (pos: number): boolean => boolFixed.has(pos) || boolFollows?.has(pos) === true;
      for (const [pos, want] of wants) {
        const a = e.args[pos - 1];
        if (a === undefined || shouldPos.has(pos)) continue;
        // `wrap(向量, [], 向量)` 那几格引擎一句都不推：其余位上是名单里那些形时，这一位的句子不发
        if (suppress !== undefined && suppress[0] === pos) {
          const other = e.args.some((x, i) => i !== pos - 1 && suppress[1].includes(literalTypeName(x) ?? ""));
          if (other) continue;
        }
        const lit = literalTypeName(a);
        // 期望是 bool 的那位（`clamp` 跟 bool 第一参走）：只按量过的 int / float 字面量拒，其余形没量过就不发
        const got =
          want === "bool"
            ? lit === "int" || lit === "float"
              ? lit
              : null
            : nonNumericLiteral(a) ?? (refusesBool(pos) && lit === "bool" ? "bool" : null);
        if (got === null || got === want) continue;
        put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
      }
      // 第一参是向量那一形时引擎改说「跟第一参走」那一句、同名类型在这形反而是收的，所以那几位整条让开。
      const firstKind = literalTypeName(e.args[0]);
      for (const [pos, refuse, sentence, unlessFirst] of sentenceRows ?? []) {
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-sentence", sentence);
      }
      for (const [pos, refuse, want, unlessFirst, also] of asRows ?? []) {
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-pass", `Cannot pass a value of type "${got}" as "${want}".`);
        // 声明类型那一位引擎连推两句，第二句是同一位的 A 式（`counts.txt` 逐格数过才这么发）
        if ((also ?? []).includes(got)) {
          put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
        }
      }
      for (const [pos, refuse, want, unlessFirst] of shouldRows ?? []) {
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        if (pos > 1 && firstKind !== null && (unlessFirst ?? []).includes(firstKind)) continue;
        put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
      }
      // 「跟第一参走」的向量与 Color 那一支：期望型就是第一参那一形，那一位拒哪些形是逐 kind 量出来的
      for (const [want, pos, refuse] of DERIVED_ARG_TYPES[callee.name] ?? []) {
        if (firstKind !== want) continue;
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
        // 同一条「其余位是容器就整句不发」的实测例外也管派生位（`clamp(Color, Color, [1])` 引擎收）
        if (suppress !== undefined && suppress[0] === pos) {
          const other = e.args.some((x, i) => i !== pos - 1 && suppress[1].includes(literalTypeName(x) ?? ""));
          if (other) continue;
        }
        put(pos, "global-arg-derived", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
      }
    }
  }
}

function literalIntArg(e: Expr): bigint | null {
  const lit = (x: Expr): bigint | null =>
    x.kind === "lit" && x.lit === "int" ? (typeof x.value === "bigint" ? x.value : BigInt(x.value as number)) : null;
  const direct = lit(e);
  if (direct !== null) return direct;
  if (e.kind === "unary" && e.op === "-") {
    const inner = lit(e.operand);
    if (inner !== null) return -inner;
  }
  return null;
}

/** 引擎这一族点名的都是「拿不出数字」的字面量形；int / float / bool 它都收（`sqrt(1)`、`sqrt(1.5)`、`sqrt(false)` 实测全过）。 */
const NUMERIC_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]);

function nonNumericLiteral(e: Expr): string | null {
  if (e.kind === "lit") {
    if (e.lit === "string") return "String";
    if (e.lit === "string_name") return "StringName";
    if (e.lit === "node_path") return "NodePath";
    if (e.lit === "null") return "null";
    return null;
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "call" && e.callee.kind === "ident" && NUMERIC_VALUE_CTORS.has(e.callee.name)) return e.callee.name;
  return null;
}

/** 允许集那一族按「字面量自己的类型名」判，所以 int / float / bool 也要能报名（`abs(true)` 引擎是真拒的）。 */
/** 字面量本身就能定下的接收者面（值类型那五支走 `valueCtorType`，这一支只补 String / Array / Dictionary）。 */
const FACE_ANNOTATIONS = new Set(["String", "Array", "Dictionary"]);
function literalFaceType(e: Expr, faceTyped: Map<string, string>): string | null {
  if (e.kind === "lit") return e.lit === "string" ? "String" : null;
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "ident") return faceTyped.get(e.name) ?? null;
  return null;
}

function literalTypeName(e: Expr | undefined): string | null {
  if (e === undefined) return null;
  if (e.kind === "lit") {
    switch (e.lit) {
      case "int":
        return "int";
      case "float":
        return "float";
      case "bool":
        return "bool";
      case "null":
        return "null";
      case "string":
        return "String";
      case "string_name":
        return "StringName";
      case "node_path":
        return "NodePath";
      default:
        return null;
    }
  }
  if (e.kind === "array") return "Array";
  if (e.kind === "dict") return "Dictionary";
  if (e.kind === "lambda") return "Callable";
  if (e.kind === "call" && e.callee.kind === "ident" && NUMERIC_VALUE_CTORS.has(e.callee.name)) return e.callee.name;
  return null;
}

function numericLiteralKind(e: Expr): "int" | "float" | null {
  if (e.kind !== "lit") return null;
  if (e.lit === "int") return "int";
  if (e.lit === "float") return "float";
  return null;
}

let outerNames = new Set<string>();

/** 模块级与类级的名字（字段、方法、信号、内部类、常量）：那些在出货里是 `this.x` 或全局，按实测**不随 lambda 冻住**（`tmp/probe-capture/c1.gd` 的 K5）。 */
function seedOuterNames(m: Module): void {
  const out = new Set<string>(declNames(m));
  const walk = (c: { vars: Array<{ name: string }>; funcs: Array<{ name: string }>; signals: Array<{ name: string }>; consts?: Array<{ name: string }>; innerClasses: unknown[] }): void => {
    for (const v of c.vars) out.add(v.name);
    for (const f of c.funcs) out.add(f.name);
    for (const sg of c.signals) out.add(sg.name);
    for (const k of c.consts ?? []) out.add(k.name);
    for (const inner of c.innerClasses) walk(inner as Parameters<typeof walk>[0]);
  };
  for (const c of m.innerClasses) walk(c as Parameters<typeof walk>[0]);
  outerNames = out;
}

const lambdaCaptures = new Map<string, string[]>();
const capKey = (line: number, col: number): string => `${markOwner}@${String(line)}:${String(col)}`;

/** 递归收 lambda 子树里的**读名**：`kind: "ident"` 都算，子树自己绑过的那些（形参、`var`、循环变量、`bind` 臂名）除外。 */
function collectReads(node: unknown, bound: Set<string>, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const v of node) collectReads(v, bound, out);
    return;
  }
  if (node === null || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  if (o["kind"] === "ident" && typeof o["name"] === "string" && !bound.has(o["name"])) out.add(o["name"]);
  for (const v of Object.values(o)) collectReads(v, bound, out);
}

/** 记下这一支 lambda 要影子化的名字：读得到、自己没绑、而且是**函数级局部**（引擎按值捕获，`tmp/probe-capture/c1.gd` K3 / K4 / K7）。 */
function recordCaptures(e: Expr, scope: Scope): void {
  if (e.kind !== "lambda" || e.loc === null) return;
  const bound = new Set<string>();
  collectLocalNames(e.body, e.params.map((p) => p.name), bound);
  for (const p of e.params) bound.add(p.name);
  const reads = new Set<string>();
  collectReads(e, bound, reads);
  const caps = [...reads].filter((n) => n !== "self" && !outerNames.has(n) && scope.hasLocal(n)).sort();
  if (caps.length > 0) lambdaCaptures.set(capKey(e.loc.line, e.loc.col), caps);
}

/** 发射器读的那张表：这一支 lambda 创建时要按值影子化的局部名。 */
export function lambdaCaptureNames(e: Expr): string[] {
  if (e.kind !== "lambda" || e.loc === null) return [];
  return lambdaCaptures.get(capKey(e.loc.line, e.loc.col)) ?? [];
}
