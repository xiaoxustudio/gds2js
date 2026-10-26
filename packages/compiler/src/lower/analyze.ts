import { staticMemberFn } from "./ir";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "./static-arg-types";
import { FACE_ARG_AS, FACE_ARG_TYPES } from "./face-arg-types";
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
import {
  ARRAY_METHOD_ARITY,
  DICT_METHOD_ARITY,
  NODE_PATH_METHOD_ARITY,
  PACK_METHOD_ARITY,
  PACK_METHOD_ARITY_WITH_BYTES,
  STRING_METHOD_ARITY,
  STRING_NAME_METHOD_ARITY,
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
  | "Vector2"
  | "Vector2i"
  | "Vector3"
  | "Vector3i"
  | "Vector4"
  | "Vector4i"
  | "Color"
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
  markOwner = m.markOwner = owner !== undefined && owner !== "" ? owner : `#${++markSeq}`;
  seedOuterNames(m);
  markClassFaceReceivers(m);
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

  const hostFace = m.extends === "SceneTree" || m.hostChain === true ? HOST_VALUE_METHODS : NO_HOST_VALUE_METHODS;
  for (const f of m.funcs) checkFunc(f, moduleScope, coroutines, diags, hostFace);
  checkReturnPaths(m.funcs, diags);
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

function assignTargetName(t: unknown): string | null {
  const o = t as Record<string, unknown> | null;
  if (o === null || typeof o !== "object") return null;
  if (o.kind === "ident" && typeof o.name === "string") return o.name;
  const obj = o.obj as Record<string, unknown> | undefined;
  if (o.kind === "attribute" && typeof o.name === "string" && obj?.name === "self") return o.name;
  return null;
}

function literalFaceText(e: Expr, kind: string): string {
  if (e.kind === "array") {
    for (const it of e.items) if (slotSource(it) !== "int") return kind;
    return "Array[int]";
  }
  if (e.kind === "dict") {
    for (const en of e.entries) if (slotSource(en.key) !== "int") return kind;
    return "Dictionary[int, Variant]";
  }
  return kind;
}

/** 只认没量的那一族之外的源名：容器、`Variant` 与脚本类名各自走自己那一支（r1..r7 量的是标量与 `null`）。 */
function scalarSourceName(st: string, classNames: Set<string>): boolean {
  return !isCollText(st) && st !== "Variant" && st !== "Array" && st !== "Dictionary" && !classNames.has(st);
}

/** 标注文本是不是定形容器（嵌套那一形引擎另有句子，不进这一支） */
function isCollText(name: string): boolean {
  return /^(Array|Dictionary)\[[^\[]+\]$/.test(name);
}

function checkTypedCollections(m: Module, diags: Diagnostic[]): void {
  const targets: Array<{ type: TypeRef | null; init: Expr | null; loc: Loc; varName?: string; srcAnn?: TypeRef | null; fnName?: string; fnPos?: number; assignStmt?: boolean }> = [
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
  const classNames = new Set<string>();
  const collectClassNames = (c: ClassDecl): void => {
    classNames.add(c.name);
    for (const inner of c.innerClasses) collectClassNames(inner);
  };
  for (const c of m.innerClasses) collectClassNames(c);
  const typedVars = new Map<string, TypeRef>();
  for (const v of m.vars) if (v.type !== null) typedVars.set(v.name, v.type);
  const fnParams = new Map<string, (TypeRef | null)[]>();
  for (const f of m.funcs) fnParams.set(f.name, f.params.map((p) => p.type));
  const walkStmts = (stmts: Stmt[], retType: TypeRef | null): void => {
    if (retType === null) locals.clear();
    for (const s of stmts) {
      if (s.kind === "var") {
        const srcAnn = s.init !== null && s.init.kind === "ident" ? locals.get(s.name === undefined ? "" : (s.init as Record<string, unknown>).name as string) ?? null : null;
        targets.push({ type: s.type, init: s.init, loc: s.loc, varName: s.name, srcAnn });
        if (s.name !== undefined && s.type !== null && !locals.has(s.name)) locals.set(s.name, s.type);
      }
      else if (s.kind === "if") for (const b of s.branches) walkStmts(b.body, retType);
      else if (s.kind === "for" || s.kind === "while") walkStmts(s.body, retType);
      else if (s.kind === "return" && retType !== null) targets.push({ type: retType, init: s.value, loc: s.loc });
      else if (s.kind === "assign" && assignTargetName(s.target) !== null) {
        const name = assignTargetName(s.target) as string;
        const decl = typedVars.get(name) ?? locals.get(name);
        if (decl !== undefined) targets.push({ type: decl, init: s.value, loc: s.loc, srcAnn: srcAnnOf(s.value), assignStmt: true });
      } else walkExprs(s, retType);
    }
  };
  const walkExprs = (n: unknown, retType: TypeRef | null): void => {
    if (Array.isArray(n)) {
      for (const x of n) walkExprs(x, retType);
      return;
    }
    if (n === null || typeof n !== "object") return;
    const o = n as Record<string, unknown>;
    if (o.kind === "var") {
      const t = o.type as TypeRef | null;
      if (typeof o.name === "string" && t !== null && !locals.has(o.name)) locals.set(o.name, t);
    }
    if (o.kind === "return" && retType !== null) targets.push({ type: retType, init: (o.value as Expr | null) ?? null, loc: o.loc as Loc });
    if (o.kind === "assign" && retType !== null) {
      const name = assignTargetName(o.target);
      const decl = name === null ? undefined : typedVars.get(name) ?? locals.get(name);
      if (decl !== undefined) targets.push({ type: decl, init: o.value as Expr, loc: o.loc as Loc, srcAnn: srcAnnOf(o.value as Expr), assignStmt: true });
    }
    if (o.kind === "call" && Array.isArray(o.args)) {
      const callee = o.callee as Record<string, unknown>;
      if (callee.kind === "ident" && typeof callee.name === "string") {
        const pt = fnParams.get(callee.name);
        if (pt !== undefined) {
          const args = o.args as Expr[];
          for (let i = 0; i < args.length && i < pt.length; i++) {
            const t = pt[i];
            const arg0 = args[i] ?? null;
            const argAnn: TypeRef | null = arg0 !== null && arg0.kind === "ident" ? locals.get((arg0 as unknown as Record<string, unknown>).name as string) ?? null : null;
            targets.push({ type: t ?? null, init: arg0, loc: args[i]!.loc, srcAnn: argAnn, fnName: callee.name, fnPos: i + 1 });
          }
        }
      }
    }
    for (const key of Object.keys(o)) {
      if (key !== "loc") walkExprs(o[key], retType);
    }
  };
  const locals = new Map<string, TypeRef>();
  /** 源的标注：标识符查函数内那张声明表，字面量与调用没有标注可查 */
  const srcAnnOf = (e: Expr | null): TypeRef | null => (e !== null && e.kind === "ident" ? locals.get(e.name) ?? null : null);
  for (const f of m.funcs) walkStmts(f.body, f.returnType);
  const walkClass = (c: ClassDecl): void => {
    for (const f of c.funcs) walkStmts(f.body, f.returnType);
    for (const inner of c.innerClasses) walkClass(inner);
  };
  for (const c of m.innerClasses) walkClass(c);

  for (const t of targets) {
    const slotAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.fnName !== undefined && t.fnPos !== undefined && slotAnn !== null && t.srcAnn !== undefined && t.srcAnn !== null &&
        t.srcAnn.kind === "named" && (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) &&
        (slotAnn.startsWith("Array[") || slotAnn.startsWith("Dictionary[")) && t.srcAnn.name !== slotAnn) {
      diags.push({
        code: "typed-collection-param",
        message: `Invalid argument for "${t.fnName}()" function: argument ${String(t.fnPos)} should be "${slotAnn}" but is "${t.srcAnn.name}".`,
        loc: t.loc,
      });
      continue;
    }
    const targetAnn = t.type !== null && t.type.kind === "named" ? t.type.name : null;
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && isCollText(t.srcAnn.name) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null && t.srcAnn.kind === "named" &&
      (t.srcAnn.name.startsWith("Array[") || t.srcAnn.name.startsWith("Dictionary[")) && t.srcAnn.name !== targetAnn) {
      diags.push({
        code: "typed-collection-assign",
        message: `Cannot assign a value of type ${t.srcAnn.name} to variable "${t.varName}" with specified type ${targetAnn}.`,
        loc: t.loc,
      });
      continue;
    }
    if (t.varName !== undefined && targetAnn !== null && isCollText(targetAnn) && t.init !== null) {
      const srcKind = t.init.kind === "array" ? "Array" : t.init.kind === "dict" ? "Dictionary" : null;
      const wantKind = targetAnn.startsWith("Array") ? "Array" : "Dictionary";
      if (srcKind !== null && srcKind !== wantKind) {
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${literalFaceText(t.init, srcKind)} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
      const st = srcKind === null ? slotSource(t.init) : null;
      if (st !== null && scalarSourceName(st, classNames)) {
        diags.push({
          code: "typed-collection-assign-as",
          message: `Cannot assign a value of type "${st}" as "${targetAnn}".`,
          loc: t.loc,
        });
        diags.push({
          code: "typed-collection-assign",
          message: `Cannot assign a value of type ${st} to variable "${t.varName}" with specified type ${targetAnn}.`,
          loc: t.loc,
        });
        continue;
      }
    }
    if (t.assignStmt === true && targetAnn !== null && isCollText(targetAnn) && t.srcAnn !== undefined && t.srcAnn !== null &&
      t.srcAnn.kind === "named" && scalarSourceName(t.srcAnn.name, classNames)) {
      diags.push({
        code: "typed-collection-assign-value",
        message: `Value of type "${t.srcAnn.name}" cannot be assigned to a variable of type "${targetAnn}".`,
        loc: t.loc,
      });
      continue;
    }
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
    const slotOf = (e: Expr): NonNullable<StaticType> | null => {
      if (e.kind === "call" && e.callee.kind === "attribute" && e.callee.name === "new" && e.callee.obj.kind === "ident" && classNames.has(e.callee.obj.name)) return e.callee.obj.name as NonNullable<StaticType>;
      return slotSource(e);
    };
    const parentOf = new Map<string, string>();
    const collectParents = (c: ClassDecl): void => {
      if (c.extends !== null && c.extends !== "") parentOf.set(c.name, c.extends);
      for (const inner of c.innerClasses) collectParents(inner);
    };
    for (const c of m.innerClasses) collectParents(c);
    const related = (a: string, b: string): boolean => {
      for (let x: string | undefined = a; x !== undefined; x = parentOf.get(x)) if (x === b) return true;
      for (let x: string | undefined = b; x !== undefined; x = parentOf.get(x)) if (x === a) return true;
      return false;
    };
    const nativeRoot = (x: string): string => {
      let cur: string | undefined = x;
      for (let guard = 0; guard < 16 && cur !== undefined; guard++) {
        const p = parentOf.get(cur);
        if (p === undefined) return classNames.has(cur) ? "RefCounted" : cur;
        if (!classNames.has(p)) return p;
        cur = p;
      }
      return "RefCounted";
    };
    const isObjectFace = (x: string): boolean => classNames.has(x) || NATIVE_CLASS_SLOTS.has(x);
    const holds = (kind: string, st: NonNullable<StaticType>): boolean => {
      if (st === "null") return true;
      if (NATIVE_CLASS_SLOTS.has(kind)) return kind === "Object" ? isObjectFace(st) : isObjectFace(st) && nativeRoot(st) === kind;
      if (classNames.has(kind)) return classNames.has(st) && related(kind, st);
      return canHold(kind, st);
    };
    const report = (st: NonNullable<StaticType>, kind: string, second: string): void => {
      if (!isObjectFace(kind) && !isObjectFace(st)) {
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
          const st = slotOf(it);
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
          const ks = slotOf(en.key);
          if (ks !== null && !holds(keyKind, ks)) {
            done = true;
            report(ks, keyKind, `Cannot have a key of type "${ks}" in a dictionary of type "${text}".`);
            break;
          }
          const vs = slotOf(en.value);
          if (vs !== null && !holds(valKind, vs)) {
            done = true;
            report(vs, valKind, `Cannot have a value of type "${vs}" in a dictionary of type "${text}".`);
          }
        }
      }
    }
  }
}

function canHold(kind: string, st: NonNullable<StaticType>): boolean {
  switch (kind) {
    case "int":
    case "float":
      return st === "int" || st === "float" || st === "bool";
    case "bool":
      return st === "bool" || st === "int" || st === "float";
    case "String":
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

const posReadLabels = new Map<string, string>();

export function posReadLabel(e: Expr): string | null {
  return e.kind === "index" ? posReadLabels.get(diKey(e.loc.line, e.loc.col)) ?? null : null;
}

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

function dictSlotOf(name: string): TypedSlot | null {
  const t = parseTyped(name);
  if (t !== null && t.kind === "Dictionary") return t;
  return name === "Dictionary" ? { decl: name, kind: "Dictionary" } : null;
}

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

export const NATIVE_CLASS_SLOTS = new Set(["Object", "RefCounted", "Node"]);

const ELEM_FACES = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color", "String", "int", "float", "bool"]);

function readFaceOf(decl: string, keyType: StaticType): string | null {
  const slot = parseTyped(decl);
  if (slot === null) return null;
  if (slot.kind === "Array") {
    if (keyType !== null && keyType !== "int") return null;
    return slot.elem !== undefined && ELEM_FACES.has(slot.elem) ? slot.elem : null;
  }
  if (slot.key === undefined || slot.val === undefined || !ELEM_FACES.has(slot.val)) return null;
  if (keyType !== null && !canHold(slot.key, keyType)) return null;
  return slot.val;
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

  const scriptNames = new Map<string, string>();
  const collectNames = (c: ClassDecl): void => {
    scriptNames.set(c.name, c.extends ?? "");
    for (const inner of c.innerClasses) collectNames(inner);
  };
  for (const c of m.innerClasses) collectNames(c);
  const subOf = (x: string, base: string): boolean => {
    let cur: string | undefined = x;
    for (let guard = 0; guard < 16 && cur !== undefined; guard++) {
      if (cur === base) return true;
      const p = scriptNames.get(cur);
      if (p === undefined || p === "") return false;
      cur = p;
    }
    return false;
  };
  const ctorClass = (e: Expr): string | null => {
    if (e.kind !== "call" || e.callee.kind !== "attribute" || e.callee.name !== "new" || e.callee.obj.kind !== "ident") return null;
    return scriptNames.has(e.callee.obj.name) ? e.callee.obj.name : null;
  };

  const stOf = (e: Expr, decls: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const d = decls.get(e.name);
      return d === undefined ? null : (d as NonNullable<StaticType>);
    }
    return (ctorClass(e) as NonNullable<StaticType> | null) ?? slotSource(e) ?? (callType(e) as NonNullable<StaticType> | null);
  };

  const badKey = (slot: TypedSlot, index: Expr, decls: Map<string, string>): void => {
    const st = stOf(index, decls);
    if (st === null) return;
    if (slot.kind === "Array") {
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
    if (scriptNames.has(slot.key)) {
      if (st === slot.key) return;
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if ((slot.key === "Vector4" && st === "Vector4i") || (slot.key === "Vector4i" && st === "Vector4")) {
      diags.push({
        code: "typed-index-key",
        message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
        loc: index.loc,
      });
      return;
    }
    if (canHold(slot.key, st)) return;
    diags.push({
      code: "typed-index-key",
      message: `Invalid index type "${st}" for a base of type "${slot.decl}".`,
      loc: index.loc,
    });
  };

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
          badKey({ decl: "Array", kind: "Array" }, e.index, decls);
        } else if (e.obj.kind === "dict") {
          if (stOf(e.index, decls) === "int") dictIntReads.add(diKey(e.loc.line, e.loc.col));
        } else {
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

  const valueMsg = (slotKind: string, value: Expr, index: Expr, decls: Map<string, string>, dictSlot = false): void => {
    const st = stOf(value, decls);
    if (st === null || st === "null") return;
    if (dictSlot && scriptNames.has(slotKind)) {
      if (st === slotKind || (scriptNames.has(st) && subOf(st, slotKind))) return;
      diags.push({
        code: "typed-index-assign",
        message: `Value of type "${st}" cannot be assigned to a variable of type "${slotKind}".`,
        loc: value.loc,
      });
      return;
    }
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
            if (s.init !== null && s.init.kind === "call" && s.init.callee.kind === "ident" && (s.init.callee.name === "Vector4" || s.init.callee.name === "Vector4i")) {
              decls.set(s.name, s.init.callee.name);
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
              if (slot.kind === "Dictionary" && stOf(s.target.index, decls) === "int") dictIntReads.delete(diKey(s.target.loc.line, s.target.loc.col));
              const kind = slot.kind === "Array" ? slot.elem : slot.val;
              if (kind !== undefined) valueMsg(kind, s.value, s.target.index, decls, slot.kind === "Dictionary");
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
  "set",
  "assign",
]);
const VOID_DICT_METHODS = new Set(["clear", "sort", "merge", "assign", "make_read_only"]);
const VOID_BYTES_METHODS = new Set(["append_array", "remove_at", "fill", "set", "clear", "sort", "reverse"]);
const VOID_OBJECT_METHODS = new Set(["set"]);
const VOID_SIGNAL_METHODS = new Set(["emit", "disconnect"]);
const VOID_CALLABLE_METHODS = new Set(["call_deferred", "rpc", "rpc_id"]);
const SIGNAL_PARSE_MISSING = new Set(["is_valid"]);
const SIGNAL_PARSE_ARITY_MAX: Record<string, number> = {
  connect: 2, disconnect: 1, is_connected: 1,
  get_connections: 0, get_name: 0, get_object: 0, get_object_id: 0, has_connections: 0, is_null: 0,
};
const CALLABLE_PARSE_ARITY: Record<string, [number, number]> = {
  bindv: [1, 1], callv: [1, 1], unbind: [1, 1], create: [2, 2], rpc_id: [1, Number.MAX_SAFE_INTEGER],
  get_argument_count: [0, 0], get_bound_arguments: [0, 0], get_bound_arguments_count: [0, 0],
  get_unbound_arguments_count: [0, 0], get_method: [0, 0], get_object: [0, 0], get_object_id: [0, 0],
  hash: [0, 0], is_custom: [0, 0], is_null: [0, 0], is_standard: [0, 0], is_valid: [0, 0],
};
const CALLABLE_PARSE_ARGS: Record<string, Array<[number, string[], string]>> = {
  create: [[2, ["int", "bool", "Vector2i"], "StringName"]],
  bindv: [[1, ["int"], "Array"]],
  callv: [[1, ["StringName"], "Array"]],
  unbind: [[1, ["StringName"], "int"]],
};
const PACK_SHAPE_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);

type ContainerShape = "Array" | "Dictionary" | "Pack" | "Object" | "Signal" | "SignalDyn" | "Callable";

function varSlotHolds(slot: string, st: NonNullable<StaticType>): boolean | null {
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

function valueSlotHolds(slot: string, st: NonNullable<StaticType>): boolean {
  const WIDEN: Record<string, string[]> = {
    Vector2: ["Vector2", "Vector2i"],
    Vector2i: ["Vector2i", "Vector2"],
    Vector3: ["Vector3", "Vector3i"],
    Vector3i: ["Vector3i", "Vector3"],
    Vector4: ["Vector4", "Vector4i"],
    Vector4i: ["Vector4i", "Vector4"],
    Color: ["Color", "int", "String"],
    StringName: ["StringName", "String"],
  };
  const ok = WIDEN[slot];
  return ok !== undefined && ok.includes(st);
}

const INSTANCE_OF_TYPE_LAST = 38;

function instanceOfTypeArgMessage(e: Extract<Expr, { kind: "call" }>): string | null {
  const first = e.args[0];
  const second = e.args[1];
  if (first === undefined || second === undefined) return null;
  if (first.kind !== "lit" || first.lit !== "int") return null;
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

const PARAM_OWN_SLOTS = new Set(["Array", "Dictionary", "NodePath", "Callable", "Signal",
  "Rect2", "Rect2i", "Transform2D", "Plane", "Quaternion", "Basis", "AABB"]);

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
  /** 引擎这一族是按**分组**发的，不是按源码行序（两形实测：`tmp/probe569/s619.gd` 两支内部类 + 语料 393）：
   *  ① 外层 var 的默认值 → ② 外层函数形参的默认值 → ③ 各内部类的成员 var（按类声明序）→ ④ 外层函数体里的 var → ⑤ 内部类的函数。 */
  const varSlot = (v: VarDecl): void => {
    const slot = slotOf(v.type);
    if (slot !== null) refuse(v.name, "variable", slot, v.init, v.loc);
  };
  const paramSlots = (f: { params: Param[]; loc: Diagnostic["loc"] }): void => {
    for (const p of f.params) {
      const slot = slotOf(p.type);
      if (slot !== null) refuse(p.name, "parameter", slot, p.default, f.loc);
    }
  };
  const classVars = (c: ClassDecl): void => {
    for (const v of c.vars) varSlot(v);
    for (const inner of c.innerClasses) classVars(inner);
  };
  const classFuncs = (c: ClassDecl): void => {
    for (const f of c.funcs) {
      paramSlots(f);
      walkStmtVars(f.body);
    }
    for (const inner of c.innerClasses) classFuncs(inner);
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
  for (const v of m.vars) varSlot(v);
  for (const f of m.funcs) paramSlots(f);
  for (const c of m.innerClasses) classVars(c);
  for (const f of m.funcs) walkStmtVars(f.body);
  for (const c of m.innerClasses) classFuncs(c);
}

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
  const scalarType = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    if (base === "int" || base === "float" || base === "bool" || base === "String") return base;
    if (base === "StringName") return base;
    return STATIC_VALUE_TYPES.has(base) ? base : null;
  };

  const staticOf = (e: Expr, d: Map<string, string>): NonNullable<StaticType> | null => {
    if (e.kind === "ident") {
      const t = d.get(e.name);
      return t === undefined ? null : (t as NonNullable<StaticType>);
    }
    return slotSource(e);
  };

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
      if (acc === null || v.isStatic) continue;
      if (acc.getter !== null && acc.getter.kind === "inline") one([], acc.getter.body, consts, face);
      if (acc.setter !== null && acc.setter.kind === "inline") {
        one([{ name: acc.setter.param, type: null, default: null }], acc.setter.body, consts, face);
      }
    }
  };

  const walkClass = (c: ClassDecl, inherited: Set<string>): void => {
    const consts = new Set<string>([...inherited, ...c.vars.filter((v) => v.isConst).map((v) => v.name)]);
    for (const f of c.funcs) one(f.params, f.body, consts, NO_HOST_VALUE_METHODS);
    accessors(c.vars, consts, NO_HOST_VALUE_METHODS);
    for (const inner of c.innerClasses) walkClass(inner, consts);
  };

  for (const f of m.funcs) one(f.params, f.body, moduleConsts, f.isStatic ? NO_HOST_VALUE_METHODS : hostFace);
  accessors(m.vars, moduleConsts, hostFace);
  for (const c of m.innerClasses) walkClass(c, moduleConsts);
}

function checkBoolOrdering(m: Module, diags: Diagnostic[]): void {
  const isBoolDecl = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name === "bool";
  const moduleBools = new Set<string>(m.vars.filter((v) => isBoolDecl(v.type)).map((v) => v.name));
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

  const packSeeds = new Map<Stmt[], Map<string, string>>();
  const packAnn = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" && PACK_TYPE_NAMES.has(t.name) ? t.name : null);
  const containerSeeds = new Map<Stmt[], Map<string, string>>();
  const shapeAnn = (t: TypeRef | null): string | null =>
    t === null || t.kind !== "named"
      ? null
      : /^Array(\[|$)/.test(t.name)
        ? "Array"
        : /^Dictionary(\[|$)/.test(t.name)
          ? "Dictionary"
          : PACK_TYPE_NAMES.has(t.name)
            ? "Pack"
            : null;
  const seedFunc = (f: FuncDecl, fields: Map<string, string>, shapeFields: Map<string, string>): void => {
    const s = new Map(fields);
    const cs = new Map(shapeFields);
    for (const p of f.params) {
      const ty = packAnn(p.type);
      if (ty !== null) s.set(p.name, ty);
      const sh = shapeAnn(p.type);
      if (sh !== null) cs.set(p.name, sh);
    }
    packSeeds.set(f.body, s);
    containerSeeds.set(f.body, cs);
  };
  for (const f of m.funcs) seedFunc(f, new Map<string, string>(), new Map<string, string>());
  const seedCls = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    const shapeFields = new Map<string, string>();
    for (const v of c.vars) {
      const ty = packAnn(v.type);
      if (ty !== null) fields.set(v.name, ty);
      const sh = shapeAnn(v.type);
      if (sh !== null) shapeFields.set(v.name, sh);
    }
    for (const f of c.funcs) seedFunc(f, fields, shapeFields);
    for (const inner of c.innerClasses) seedCls(inner);
  };
  for (const c of m.innerClasses) seedCls(c);

  const classNames = new Set<string>(m.className ? [m.className] : []);
  const addClassNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      classNames.add(c.name);
      addClassNames(c.innerClasses);
    }
  };
  addClassNames(m.innerClasses);

  const signalNames = new Set<string>(m.signals.map((s) => s.name));
  const addSignalNames = (cs: ClassDecl[]): void => {
    for (const c of cs) {
      for (const s of c.signals) signalNames.add(s.name);
      addSignalNames(c.innerClasses);
    }
  };
  addSignalNames(m.innerClasses);

  const modAnn = new Map<string, string>();
  for (const v of m.vars) {
    const f = knownFaceAnnotation(v.type);
    if (f !== null) modAnn.set(v.name, f);
  }

  const shapeOf = (e: Expr): ContainerShape | null => {
    if (e.kind === "array") return "Array";
    if (e.kind === "dict") return "Dictionary";
    if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "Callable") return "Callable";
    if (e.kind === "ident" && signalNames.has(e.name)) return "SignalDyn";
    if (e.kind === "call" && e.callee.kind === "ident" && e.callee.name === "Signal") return "SignalDyn";
    if (e.kind === "call" && e.callee.kind === "ident" && PACK_SHAPE_NAMES.has(e.callee.name)) {
      return "Pack";
    }
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

  const seed = new Map<string, ContainerShape>();
  for (const v of m.vars) {
    if (v.type === null || v.type.kind !== "named") continue;
    const sh: ContainerShape | null =
      /^Array(\[|$)/.test(v.type.name) ? "Array" : /^Dictionary(\[|$)/.test(v.type.name) ? "Dictionary" : PACK_SHAPE_NAMES.has(v.type.name) ? "Pack" : null;
    if (sh !== null) seed.set(v.name, sh);
  }

  for (const body of bodies) {
    const shapes = new Map(seed);
    const packSeed = packSeeds.get(body);
    if (packSeed !== undefined) {
      for (const [name] of packSeed) shapes.set(name, "Pack");
    }
    const containerSeed = containerSeeds.get(body);
    if (containerSeed !== undefined) {
      for (const [name, sh] of containerSeed) shapes.set(name, sh as ContainerShape);
    }
    const localAnn = new Map<string, string>();
    for (const n of flattenBody(body)) {
      if (n.kind === "var" && typeof n.name === "string") {
        const f = knownFaceAnnotation(n.type as TypeRef | null);
        if (f !== null) localAnn.set(n.name, f);
      }
    }
    const scopePacks = packSeeds.get(body) ?? new Map<string, string>();
    const ownerFace = (obj: Expr): string | null => {
      if (obj.kind === "lit") return obj.lit === "string" ? "String" : null;
      if (obj.kind === "ident" && typeof obj.name === "string") {
        return localAnn.get(obj.name) ?? modAnn.get(obj.name) ?? scopePacks.get(obj.name) ?? null;
      }
      if (obj.kind === "call" && obj.callee.kind === "ident" && PACK_TYPE_NAMES.has(obj.callee.name)) return obj.callee.name;
      return obj.kind === "call" ? chainRecvFace(obj, ownerFace) : null;
    };
    const expr = (e: Expr, discarded: boolean): void => {
      switch (e.kind) {
        case "call": {
          if (e.callee.kind === "attribute" && (e.callee.obj.kind === "ident" || e.callee.obj.kind === "call" || e.callee.obj.kind === "array" || e.callee.obj.kind === "dict")) {
            const name = e.callee.name;
            const chainPack = e.callee.obj.kind === "call" ? (PACK_TYPE_NAMES.has(ownerFace(e.callee.obj) ?? "") ? "Pack" : null) : null;
            const ctorCall =
              e.callee.obj.kind === "call" && e.callee.obj.callee.kind === "ident" && e.callee.obj.callee.name === "Callable";
            const shape =
              e.callee.obj.kind === "ident"
                ? shapes.get(e.callee.obj.name) ??
                  (PACK_TYPE_NAMES.has(e.callee.obj.name) ? "Pack" : null) ??
                  (e.callee.obj.name === "Array" || e.callee.obj.name === "Dictionary" ? e.callee.obj.name : null) ??
                  (signalNames.has(e.callee.obj.name) ? "Signal" : null)
                : e.callee.obj.kind === "array"
                  ? "Array"
                  : e.callee.obj.kind === "dict"
                    ? "Dictionary"
                    : chainPack ?? (ctorCall ? "Callable" : null);
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
            const sigMax = shape === "Signal" || shape === "SignalDyn" ? SIGNAL_PARSE_ARITY_MAX[name] : undefined;
            if (sigMax !== undefined && e.args.length > sigMax) {
              diags.push({
                code: "signal-arity",
                message: `Too many arguments for "${name}()" call. Expected at most ${String(sigMax)} but received ${String(e.args.length)}.`,
                loc: e.loc,
              });
            }
            if (shape === "Callable") {
              const d = arityDiag(CALLABLE_PARSE_ARITY, "callable-arity", name, e.args.length, e.loc);
              if (d !== null) diags.push(d);
              for (const [pos, refuse, want] of CALLABLE_PARSE_ARGS[name] ?? []) {
                const bad = literalTypeName(e.args[pos - 1]);
                if (bad === null || !refuse.includes(bad)) continue;
                diags.push({
                  code: "callable-arg-pass",
                  message: `Cannot pass a value of type "${bad}" as "${want}".`,
                  loc: e.loc,
                });
                diags.push({
                  code: "callable-arg-type",
                  message: `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`,
                  loc: e.loc,
                });
              }
            }
            if (!discarded) {
              const isVoid =
                shape === "Pack"
                  ? VOID_BYTES_METHODS.has(name)
                  : shape === "Object"
                    ? VOID_OBJECT_METHODS.has(name)
                    : shape === "Signal" || shape === "SignalDyn"
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

const PACK_IS_AS_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);
const STATIC_VALUE_TYPES = new Set(["Vector2", "Vector3", "Vector2i", "Vector3i", "Vector4", "Vector4i", "Color"]);

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

const PACK_ARG_SLOTS: Record<string, { slot: string; ok: readonly string[] }> = {
  PackedByteArray: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt32Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedInt64Array: { slot: "int", ok: ["int", "float", "bool"] },
  PackedFloat32Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedFloat64Array: { slot: "float", ok: ["int", "float", "bool"] },
  PackedStringArray: { slot: "String", ok: ["String", "StringName", "NodePath"] },
  PackedVector2Array: { slot: "Vector2", ok: ["Vector2", "Vector2i"] },
  PackedVector3Array: { slot: "Vector3", ok: ["Vector3", "Vector3i"] },
  PackedVector4Array: { slot: "Vector4", ok: ["Vector4", "Vector4i"] },
  PackedColorArray: { slot: "Color", ok: ["Color", "int", "String"] },
};
const PACK_ARG_POSITIONS: Record<string, readonly string[]> = {
  append: ["e"], push_back: ["e"], fill: ["e"], has: ["e"], count: ["e"], erase: ["e"],
  get: ["i"], set: ["i", "e"], insert: ["i", "e"], find: ["e", "i"], rfind: ["e", "i"],
  bsearch: ["e", "b"], resize: ["i"], slice: ["i", "i"], remove_at: ["i"], append_array: ["a"],
};
const PACK_INT_SLOT_OK = ["int", "float", "bool"];
const PACK_BOOL_SLOT_OK = ["bool", "int", "float"];
const PACK_APPEND_ARRAY_AS = ["bool", "float", "int", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i", "null", "Callable", "Object", "Node"];
const PACK_APPEND_NAMED = new Set([
  "bool", "float", "int", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i",
  "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
  "Callable", "Object", "Node",
]);
function namedAppendSource(name: unknown, ann: Map<string, string>): string | null {
  if (typeof name !== "string") return null;
  const t = ann.get(name);
  if (t === undefined || !PACK_APPEND_NAMED.has(argFaceBase(t))) return null;
  return t.includes("[") ? typedFaceText(t) : t;
}

/** `e` / `i` / `b` 三槽认得的**标注名**来源（S498，尺 `tmp/d6/s497c.py` 一百一十格 + `tmp/d6/s497d.py` 三百九十六格 +
 *  `tmp/d6/s498b.py` 一百三十二格：`NodePath` 与九支 pack 的名字形只回第二句，字面量的 `NodePath` 两句齐发、pack 构造式只第二句；
 *  S501 又量了定形容器标注那一形：也只回第二句，型名印标注规格化后的原文）。 */
function namedSlotSource(e: Expr, ann: Map<string, string>): string | null {
  if (e.kind !== "ident" || typeof e.name !== "string") return null;
  const t = ann.get(e.name);
  if (t === undefined || !ARG_NAME_TYPES.has(argFaceBase(t))) return null;
  return t.includes("[") ? typedFaceText(t) : t;
}

function packArgSource(e: Expr): string | null {
  if (e.kind === "binary" && e.op === "+") {
    return packArgSource(e.left) === "String" && packArgSource(e.right) === "String" ? "String" : null;
  }
  if (e.kind === "lit") {
    return ({ int: "int", float: "float", bool: "bool", string: "String", string_name: "StringName", node_path: "NodePath", null: "null" } as Record<string, string>)[e.lit] ?? null;
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
      e.callee.name === "Color" ||
      PACK_TYPE_NAMES.has(e.callee.name))
  ) {
    return e.callee.name;
  }
  return null;
}

const ANNOT_SOURCES = new Set(["int", "float", "bool", "String", "StringName", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color", "Array", "Dictionary"]);

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

function classFaceArity(t: string): Record<string, [number, number]> | undefined {
  if (t === "Array") return ARRAY_METHOD_ARITY;
  if (t === "String") return STRING_METHOD_ARITY;
  if (t === "StringName") return STRING_NAME_METHOD_ARITY;
  if (t === "NodePath") return NODE_PATH_METHOD_ARITY;
  if (t === "Dictionary") return DICT_METHOD_ARITY;
  return undefined;
}
const CLASS_FACE_RECEIVERS = new WeakSet<object>();
function markClassFaceReceivers(m: Module): void {
  for (const nodes of flattenBodies(m)) {
    for (const n of nodes) {
      if (n.kind !== "attribute") continue;
      const obj = n.obj as Record<string, unknown> | undefined;
      if (obj !== undefined && obj.kind === "ident" && typeof obj.name === "string" && classFaceArity(obj.name) !== undefined) {
        CLASS_FACE_RECEIVERS.add(obj);
      }
    }
  }
}

/** `checkPackArgSlots` 的作用域：每支函数体配一张「名字 → 标注型」的底表 —— 模块级标注打底、内部类字段盖在上面、形参再盖一层
 *  （S494 量齐：pack 的形参拒这一族此前只认模块标注名与函数体内的标注 var，形参标注与内部类字段两形 396 格全放过）。 */
function packArgScopes(m: Module): Array<{ nodes: Record<string, unknown>[]; base: Map<string, string> }> {
  const named = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" ? t.name : null);
  const moduleNames = new Map<string, string>();
  for (const v of m.vars) {
    const t = named(v.type);
    if (t !== null) moduleNames.set(v.name, t);
  }
  const out: Array<{ nodes: Record<string, unknown>[]; base: Map<string, string> }> = [];
  const collectFuncs = (funcs: FuncDecl[], seed: Map<string, string>): void => {
    for (const f of funcs) {
      const base = new Map(seed);
      for (const p of f.params) {
        const t = named(p.type);
        if (t !== null) base.set(p.name, t);
      }
      out.push({ nodes: flattenBody(f.body), base });
    }
  };
  collectFuncs(m.funcs, moduleNames);
  const collectClass = (c: ClassDecl): void => {
    const fields = new Map(moduleNames);
    for (const v of c.vars) {
      const t = named(v.type);
      if (t !== null) fields.set(v.name, t);
    }
    collectFuncs(c.funcs, fields);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

function typedFaceText(name: string): string {
  const open = name.indexOf("[");
  const closed = name.trimEnd();
  if (open < 0 || !closed.endsWith("]")) return name.trim();
  const base = name.slice(0, open).trim();
  const body = closed.slice(open + 1, closed.length - 1);
  const parts: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of body) {
    if (ch === "[") depth++;
    else if (ch === "]") depth--;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  const mapped = parts.map((p) => typedFaceText(p.trim()));
  if (mapped.length > 0 && mapped.every((p) => p === "Variant")) return base;
  return `${base}[${mapped.join(", ")}]`;
}

/** 标注型名去掉定形部分：`Array[int]` 的基是 `Array`（成员判定按基型，印出去的是标注原文）。 */
function argFaceBase(t: string): string {
  const open = t.indexOf("[");
  return open < 0 ? t : t.slice(0, open);
}

/** 表里那一列认不认这个来源名：定形容器按基型查（S501，尺 `tmp/d6/s501a.py` 一百八十格） */
function faceListHas(list: readonly string[], t: string): boolean {
  return list.includes(t) || (t.includes("[") && list.includes(argFaceBase(t)));
}

const OBJECT_ARG_NAMES = new Set(["Callable", "Object", "Node"]);
const VALUE_ARG_WANTS = new Set([
  "int", "float", "bool", "String", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color",
  "Array", "Dictionary",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
]);
function nullRefusedByValueSlot(want: string): boolean {
  return VALUE_ARG_WANTS.has(want);
}
function objectNameRefusedByValueSlot(src: string | null, want: string): boolean {
  return src !== null && OBJECT_ARG_NAMES.has(src) && VALUE_ARG_WANTS.has(want);
}

const ARG_NAME_TYPES = new Set([
  "int", "float", "bool", "String", "StringName", "NodePath", "Color", "Vector2", "Vector2i", "Vector3", "Vector3i",
  "Array", "Dictionary", "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array",
  "PackedFloat64Array", "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedVector4Array", "PackedColorArray",
  "Callable", "Object", "Node",
]);

function argNameOf(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  if (t.name.includes("[") && !t.name.includes("]")) return null;
  const text = t.name.includes("[") ? typedFaceText(t.name) : t.name;
  return ARG_NAME_TYPES.has(argFaceBase(text)) ? text : null;
}

function argNameScopes(m: Module): Map<Stmt[], Map<string, string>> {
  const plain = argNameOf;
  const out = new Map<Stmt[], Map<string, string>>();
  const collect = (funcs: FuncDecl[], fields: Map<string, string>): void => {
    for (const f of funcs) {
      const ann = new Map(fields);
      for (const p of f.params) {
        const t = plain(p.type);
        if (t !== null) ann.set(p.name, t);
      }
      for (const n of flattenBody(f.body)) {
        if (n.kind !== "var" || typeof n.name !== "string") continue;
        const t = plain(n.type as TypeRef | null);
        if (t !== null) ann.set(n.name, t);
      }
      out.set(f.body, ann);
    }
  };
  const moduleNames = new Map<string, string>();
  for (const v of m.vars) {
    const t = plain(v.type);
    if (t !== null) moduleNames.set(v.name, t);
  }
  collect(m.funcs, moduleNames);
  const collectClass = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    for (const v of c.vars) {
      const t = plain(v.type);
      if (t !== null) fields.set(v.name, t);
    }
    collect(c.funcs, fields);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

function argNameType(e: Expr | undefined, ann: Map<string, string>): string | null {
  if (e === undefined || e.kind !== "ident" || typeof e.name !== "string") return null;
  return ann.get(e.name) ?? null;
}

function reassignedNames(nodes: Record<string, unknown>[]): Set<string> {
  const out = new Set<string>();
  for (const n of nodes) {
    if (n.kind !== "assign") continue;
    const target = n.target as Record<string, unknown> | undefined;
    if (target !== undefined && target.kind === "ident" && typeof target.name === "string") out.add(target.name);
  }
  return out;
}

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

function faceReceiverNames(
  nodes: Record<string, unknown>[],
  seeded: Map<string, "annot" | "inferred">,
  assigned: Set<string>,
  type: string,
  isInit: (init: Expr) => boolean,
  annotOnly = false,
  texts?: Map<string, string>,
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
      if (texts !== undefined) {
        const t = n.type as TypeRef | null;
        if (t !== null && t.kind === "named") texts.set(n.name, t.name);
      }
      continue;
    }
    const init = n.init as Expr | null;
    if (!annotOnly && n.type === null && init !== null && isInit(init)) out.add(n.name);
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
): Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred">; body: Stmt[]; texts: Map<string, string> }> {
  const named = (t: TypeRef | null): boolean => t !== null && t.kind === "named" && t.name.replace(/\[.*\]$/, "") === type;
  const annText = (t: TypeRef | null): string | null => (t !== null && t.kind === "named" ? t.name : null);
  const moduleNames = new Map<string, "annot" | "inferred">();
  const moduleTexts = new Map<string, string>();
  for (const v of m.vars) {
    if (named(v.type)) {
      moduleNames.set(v.name, "annot");
      const txt = annText(v.type);
      if (txt !== null) moduleTexts.set(v.name, txt);
    } else if (v.type === null && v.init !== null && isInit(v.init)) moduleNames.set(v.name, "inferred");
  }

  const out: Array<{ nodes: Record<string, unknown>[]; seeded: Map<string, "annot" | "inferred">; body: Stmt[]; texts: Map<string, string> }> = [];
  const collect = (funcs: FuncDecl[], seededBase: Map<string, "annot" | "inferred">, textsBase: Map<string, string>): void => {
    for (const f of funcs) {
      const seeded = new Map(seededBase);
      const texts = new Map(textsBase);
      for (const p of f.params) {
        if (named(p.type)) {
          seeded.set(p.name, "annot");
          const txt = annText(p.type);
          if (txt !== null) texts.set(p.name, txt);
        }
      }
      out.push({ nodes: flattenBody(f.body), seeded, body: f.body, texts });
    }
  };
  collect(m.funcs, moduleNames, moduleTexts);

  const collectClass = (c: ClassDecl): void => {
    const fields = new Map<string, "annot" | "inferred">();
    const fieldTexts = new Map<string, string>();
    for (const v of c.vars) {
      if (named(v.type)) {
        fields.set(v.name, "annot");
        const txt = annText(v.type);
        if (txt !== null) fieldTexts.set(v.name, txt);
      } else if (v.type === null && v.init !== null && isInit(v.init)) fields.set(v.name, "inferred");
    }
    collect(c.funcs, fields, fieldTexts);
    for (const inner of c.innerClasses) collectClass(inner);
  };
  for (const c of m.innerClasses) collectClass(c);
  return out;
}

function moduleAssignedNames(m: Module): Set<string> {
  const out = new Set<string>();
  for (const nodes of flattenBodies(m)) for (const n of reassignedNames(nodes)) out.add(n);
  return out;
}

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

function faceGhostDiags(
  n: Record<string, unknown>,
  table: Record<string, [number, number]>,
  type: string,
  twoSentences: boolean,
  names: Set<string>,
  isLiteral: (obj: Record<string, unknown>) => boolean,
  texts?: Map<string, string>,
): Diagnostic[] {
  if (n.kind !== "call") return [];
  const callee = n.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "attribute") return [];
  const obj = callee.obj as Record<string, unknown> | undefined;
  if (obj === undefined) return [];
  if (!(isLiteral(obj) || (obj.kind === "ident" && typeof obj.name === "string" && names.has(obj.name)))) return [];
  const method = callee.name;
  if (typeof method !== "string" || method in table) return [];
  const loc = (n.loc as Diagnostic["loc"]) ?? null;
  const shown = obj.kind === "ident" && typeof obj.name === "string" ? texts?.get(obj.name) ?? type : type;
  const out: Diagnostic[] = [];
  if (twoSentences) {
    out.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${shown}".`, loc });
  }
  out.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${shown}.`, loc });
  return out;
}

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
      if (left.kind !== "lit" || (left.lit !== "string" && left.lit !== "string_name")) continue;
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
  for (const { nodes, base } of packArgScopes(m)) {
    const packs = new Map<string, string>();
    const annot = new Map<string, string>();
    for (const [name, ty] of base) {
      if (ty in PACK_ARG_SLOTS) packs.set(name, ty);
      else if (ANNOT_SOURCES.has(ty)) annot.set(name, ty);
    }
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
    const annAll = new Map<string, string>(base);
    for (const n of nodes) {
      if (n.kind !== "var" || typeof n.name !== "string" || reassigned.has(n.name)) continue;
      const type = n.type as TypeRef | null;
      if (type !== null && type.kind === "named") annAll.set(n.name, type.name);
    }
    const ownerFace = (obj: Expr): string | null => {
      if (obj.kind === "lit") return obj.lit === "string" ? "String" : null;
      if (obj.kind === "ident" && typeof obj.name === "string") return packs.get(obj.name) ?? annot.get(obj.name) ?? base.get(obj.name) ?? null;
      return obj.kind === "call" ? chainRecvFace(obj, ownerFace) : null;
    };

    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "attribute") continue;
      const obj = callee.obj as Record<string, unknown> | undefined;
      if (obj === undefined) continue;
      const objCallee = obj.kind === "call" ? (obj.callee as Record<string, unknown> | undefined) : undefined;
      const inline = objCallee !== undefined && objCallee["kind"] === "ident" && typeof objCallee["name"] === "string"
        && String(objCallee["name"]) in PACK_ARG_SLOTS ? String(objCallee["name"]) : null;
      const viaChain = obj.kind === "call" ? chainRecvFace(obj as Expr, ownerFace) : null;
      const pack = obj.kind === "ident" && typeof obj.name === "string"
        ? (packs.get(obj.name) ?? (obj.name in PACK_ARG_SLOTS ? obj.name : undefined))
        : (inline ?? (viaChain !== null && PACK_TYPE_NAMES.has(viaChain) ? viaChain : undefined));
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
        const annotated = src === null ? namedSlotSource(arg0, annAll) : null;
        const proven = src ?? annotated;
        const kind = slots[p];
        if (kind === "a") {
          const namedA = arg0.kind === "ident" ? namedAppendSource(arg0.name, annAll) : null;
          const srcA = src ?? namedA;
          if (srcA !== null && (srcA === "null" || OBJECT_ARG_NAMES.has(srcA)) && !VALUE_ARG_WANTS.has(pack)) continue;
          const baseA = srcA === null ? "" : argFaceBase(srcA);
          if (srcA === null || baseA === "Array" || baseA === pack) continue;
          const two = PACK_APPEND_ARRAY_AS.includes(baseA);
          if (!two && !(baseA === "Dictionary" || PACK_TYPE_NAMES.has(baseA))) continue;
          const aloc = (n.loc as Diagnostic["loc"]) ?? null;
          if (two && namedA === null) {
            diags.push({ code: "pack-arg-slot", message: `Cannot pass a value of type "${srcA}" as "${pack}".`, loc: aloc });
          }
          diags.push({
            code: "pack-arg-slot",
            message: `Invalid argument for "${method}()" function: argument ${String(p + 1)} should be "${pack}" but is "${srcA}".`,
            loc: aloc,
          });
          continue;
        }
        if (proven === null) continue;
        const slot = kind === "i" ? "int" : kind === "b" ? "bool" : face.slot;
        const ok = kind === "i" ? PACK_INT_SLOT_OK : kind === "b" ? PACK_BOOL_SLOT_OK : face.ok;
        if (ok.includes(proven)) continue;
        if (OBJECT_ARG_NAMES.has(proven) && !VALUE_ARG_WANTS.has(slot)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        if (src !== null && proven !== "Array" && proven !== "Dictionary" && !PACK_TYPE_NAMES.has(proven)) {
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

/** pack 那一面的表外名：不在 dump 的方法全集里就是那两句（S480，尺 `tmp/d6/ppack.py` 八十一格 + `tmp/d6/ppack2.py` 二百五十三格）。 */
function memberNameAbsent(face: string, name: string): boolean {
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

function chainFaceKnown(rt: string): boolean {
  return rt in VALUE_METHOD_ARITY || rt === "String" || rt === "StringName" || rt === "NodePath";
}

function knownFaceAnnotation(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return base === "String" || base === "StringName" || base === "NodePath" || base === "Array" || base === "Dictionary" ||
    PACK_TYPE_NAMES.has(base) || base in VALUE_METHOD_ARITY ? base : null;
}

function chainRecvFace(e: Expr, ownerOf: (x: Expr) => string | null): string | null {
  if (e.kind !== "call" || e.callee.kind !== "attribute") return null;
  const owner = ownerOf(e.callee.obj);
  if (owner === null) return null;
  const by = BUILTIN_METHOD_RETURNS[owner];
  if (by === undefined) return null;
  const name = e.callee.name;
  if (typeof name !== "string") return null;
  const rt = by[name];
  return typeof rt === "string" && chainFaceKnown(rt) ? rt : null;
}

/** 链子那一形的元数表与那句的 code：三面名字面另有三张表，其余（值型五支 + pack 九支）共用 `VALUE_METHOD_ARITY`。 */
function chainArityFace(face: string): { table: Record<string, [number, number]>; code: string } | null {
  if (face === "String" || face === "StringName") return { table: face === "String" ? STRING_METHOD_ARITY : STRING_NAME_METHOD_ARITY, code: face === "String" ? "string-arity" : "string-name-arity" };
  if (face === "NodePath") return { table: NODE_PATH_METHOD_ARITY, code: "node-path-arity" };
  return { table: VALUE_METHOD_ARITY[face] ?? {}, code: "value-arity" };
}

function attrFaceRecv(obj: Record<string, unknown> | undefined, ann: Map<string, string>, elems: Map<string, string> = new Map(), mods: Map<string, string> = new Map()): string | null {
  if (obj === undefined) return null;
  if (obj.kind === "index") {
    const base = obj.obj as Record<string, unknown> | undefined;
    if (base === undefined || base.kind !== "ident" || typeof base.name !== "string") return null;
    return readFaceOf(elems.get(base.name) ?? "", staticType(obj.index as Expr));
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
    if (inner !== undefined && inner.kind === "attribute") {
      const owner = attrFaceRecv(inner.obj as Record<string, unknown>, ann, elems, mods);
      const mname = inner.name;
      if (owner !== null && typeof mname === "string") {
        const by = BUILTIN_METHOD_RETURNS[owner];
        const rt = by === undefined ? undefined : by[mname];
        if (typeof rt === "string" && (instanceFaceManaged(rt) || chainFaceKnown(rt))) return rt;
      }
    }
  }
  if (obj.kind === "attribute") {
    const owner = attrFaceRecv(obj.obj as Record<string, unknown> | undefined, ann, elems, mods);
    const nm = obj.name;
    if (owner !== null && typeof nm === "string") {
      const by = BUILTIN_MEMBER_TYPES[owner];
      const t = by === undefined ? undefined : by[nm];
      if (typeof t === "string" && (instanceFaceManaged(t) || t === "String")) return t;
    }
    return null;
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

export const BUILTIN_INSTANCE_MEMBERS: Readonly<Record<string, ReadonlyArray<string>>> = {
  "Vector2": ["abs", "angle", "angle_to", "angle_to_point", "aspect", "bezier_derivative", "bezier_interpolate", "bounce", "ceil", "clamp", "clampf", "cross", "cubic_interpolate", "cubic_interpolate_in_time", "direction_to", "distance_squared_to", "distance_to", "dot", "floor", "from_angle", "is_equal_approx", "is_finite", "is_normalized", "is_zero_approx", "length", "length_squared", "lerp", "limit_length", "max", "max_axis_index", "maxf", "min", "min_axis_index", "minf", "move_toward", "normalized", "orthogonal", "posmod", "posmodv", "project", "reflect", "rotated", "round", "sign", "slerp", "slide", "snapped", "snappedf", "x", "y"],
  "Vector2i": ["abs", "aspect", "clamp", "clampi", "distance_squared_to", "distance_to", "length", "length_squared", "max", "max_axis_index", "maxi", "min", "min_axis_index", "mini", "sign", "snapped", "snappedi", "x", "y"],
  "Vector3": ["abs", "angle_to", "bezier_derivative", "bezier_interpolate", "bounce", "ceil", "clamp", "clampf", "cross", "cubic_interpolate", "cubic_interpolate_in_time", "direction_to", "distance_squared_to", "distance_to", "dot", "floor", "inverse", "is_equal_approx", "is_finite", "is_normalized", "is_zero_approx", "length", "length_squared", "lerp", "limit_length", "max", "max_axis_index", "maxf", "min", "min_axis_index", "minf", "move_toward", "normalized", "octahedron_decode", "octahedron_encode", "outer", "posmod", "posmodv", "project", "reflect", "rotated", "round", "sign", "signed_angle_to", "slerp", "slide", "snapped", "snappedf", "x", "y", "z"],
  "Vector3i": ["abs", "clamp", "clampi", "distance_squared_to", "distance_to", "length", "length_squared", "max", "max_axis_index", "maxi", "min", "min_axis_index", "mini", "sign", "snapped", "snappedi", "x", "y", "z"],
  "Vector4": ["abs", "ceil", "clamp", "clampf", "cubic_interpolate", "cubic_interpolate_in_time", "direction_to", "distance_squared_to", "distance_to", "dot", "floor", "inverse", "is_equal_approx", "is_finite", "is_normalized", "is_zero_approx", "length", "length_squared", "lerp", "max", "max_axis_index", "maxf", "min", "min_axis_index", "minf", "normalized", "posmod", "posmodv", "round", "sign", "snapped", "snappedf", "w", "x", "y", "z"],
  "Vector4i": ["abs", "clamp", "clampi", "distance_squared_to", "distance_to", "length", "length_squared", "max", "max_axis_index", "maxi", "min", "min_axis_index", "mini", "sign", "snapped", "snappedi", "w", "x", "y", "z"],
  "Color": ["a", "a8", "b", "b8", "blend", "clamp", "darkened", "from_hsv", "from_ok_hsl", "from_rgba8", "from_rgbe9995", "from_string", "g", "g8", "get_luminance", "h", "hex", "hex64", "html", "html_is_valid", "inverted", "is_equal_approx", "lerp", "lightened", "linear_to_srgb", "ok_hsl_h", "ok_hsl_l", "ok_hsl_s", "r", "r8", "s", "srgb_to_linear", "to_abgr32", "to_abgr64", "to_argb32", "to_argb64", "to_html", "to_rgba32", "to_rgba64", "v"],
  "String": ["begins_with", "bigrams", "bin_to_int", "c_escape", "c_unescape", "capitalize", "casecmp_to", "chr", "contains", "containsn", "count", "countn", "dedent", "ends_with", "erase", "filecasecmp_to", "filenocasecmp_to", "find", "findn", "format", "get_base_dir", "get_basename", "get_extension", "get_file", "get_slice", "get_slice_count", "get_slicec", "hash", "hex_decode", "hex_to_int", "humanize_size", "indent", "insert", "is_absolute_path", "is_empty", "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_ascii_identifier", "is_valid_filename", "is_valid_float", "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int", "is_valid_ip_address", "is_valid_unicode_identifier", "join", "json_escape", "left", "length", "lpad", "lstrip", "match", "matchn", "md5_buffer", "md5_text", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "num", "num_int64", "num_scientific", "num_uint64", "pad_decimals", "pad_zeros", "path_join", "remove_char", "remove_chars", "repeat", "replace", "replace_char", "replace_chars", "replacen", "reverse", "rfind", "rfindn", "right", "rpad", "rsplit", "rstrip", "sha1_buffer", "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "split", "split_floats", "strip_edges", "strip_escapes", "substr", "to_ascii_buffer", "to_camel_case", "to_float", "to_int", "to_kebab_case", "to_lower", "to_multibyte_char_buffer", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode", "uri_file_decode", "validate_filename", "validate_node_name", "xml_escape", "xml_unescape"],
  "StringName": ["begins_with", "bigrams", "bin_to_int", "c_escape", "c_unescape", "capitalize", "casecmp_to", "contains", "containsn", "count", "countn", "dedent", "ends_with", "erase", "filecasecmp_to", "filenocasecmp_to", "find", "findn", "format", "get_base_dir", "get_basename", "get_extension", "get_file", "get_slice", "get_slice_count", "get_slicec", "hash", "hex_decode", "hex_to_int", "indent", "insert", "is_absolute_path", "is_empty", "is_relative_path", "is_subsequence_of", "is_subsequence_ofn", "is_valid_ascii_identifier", "is_valid_filename", "is_valid_float", "is_valid_hex_number", "is_valid_html_color", "is_valid_identifier", "is_valid_int", "is_valid_ip_address", "is_valid_unicode_identifier", "join", "json_escape", "left", "length", "lpad", "lstrip", "match", "matchn", "md5_buffer", "md5_text", "naturalcasecmp_to", "naturalnocasecmp_to", "nocasecmp_to", "pad_decimals", "pad_zeros", "path_join", "remove_char", "remove_chars", "repeat", "replace", "replace_char", "replace_chars", "replacen", "reverse", "rfind", "rfindn", "right", "rpad", "rsplit", "rstrip", "sha1_buffer", "sha1_text", "sha256_buffer", "sha256_text", "similarity", "simplify_path", "split", "split_floats", "strip_edges", "strip_escapes", "substr", "to_ascii_buffer", "to_camel_case", "to_float", "to_int", "to_kebab_case", "to_lower", "to_multibyte_char_buffer", "to_pascal_case", "to_snake_case", "to_upper", "to_utf16_buffer", "to_utf32_buffer", "to_utf8_buffer", "to_wchar_buffer", "trim_prefix", "trim_suffix", "unicode_at", "uri_decode", "uri_encode", "uri_file_decode", "validate_filename", "validate_node_name", "xml_escape", "xml_unescape"],
  "NodePath": ["get_as_property_path", "get_concatenated_names", "get_concatenated_subnames", "get_name", "get_name_count", "get_subname", "get_subname_count", "hash", "is_absolute", "is_empty", "slice"],
  "int": [],
  "float": [],
  "bool": [],
  "PackedByteArray": ["append", "append_array", "bsearch", "bswap16", "bswap32", "bswap64", "clear", "compress", "count", "decode_double", "decode_float", "decode_half", "decode_s16", "decode_s32", "decode_s64", "decode_s8", "decode_u16", "decode_u32", "decode_u64", "decode_u8", "decode_var", "decode_var_size", "decompress", "decompress_dynamic", "duplicate", "encode_double", "encode_float", "encode_half", "encode_s16", "encode_s32", "encode_s64", "encode_s8", "encode_u16", "encode_u32", "encode_u64", "encode_u8", "encode_var", "erase", "fill", "find", "get", "get_string_from_ascii", "get_string_from_multibyte_char", "get_string_from_utf16", "get_string_from_utf32", "get_string_from_utf8", "get_string_from_wchar", "has", "has_encoded_var", "hex_encode", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_color_array", "to_float32_array", "to_float64_array", "to_int32_array", "to_int64_array", "to_vector2_array", "to_vector3_array", "to_vector4_array"],
  "PackedInt32Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedInt64Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedFloat32Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedFloat64Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedStringArray": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedVector2Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedVector3Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedVector4Array": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
  "PackedColorArray": ["append", "append_array", "bsearch", "clear", "count", "duplicate", "erase", "fill", "find", "get", "has", "insert", "is_empty", "push_back", "remove_at", "resize", "reverse", "rfind", "set", "size", "slice", "sort", "to_byte_array"],
};

function instanceFaceManaged(face: string): boolean {
  if (face === "Array" || face === "Dictionary" || face === "StringName" || face === "NodePath" || PACK_TYPE_NAMES.has(face)) return false;
  return BUILTIN_INSTANCE_MEMBERS[face] !== undefined;
}

function instanceMemberAbsent(face: string, name: string): boolean {
  if (!instanceFaceManaged(face) && face !== "String") return false;
  const list = BUILTIN_INSTANCE_MEMBERS[face];
  return list !== undefined && !list.includes(name);
}

export const BUILTIN_METHOD_RETURNS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "Vector2": {"abs": "Vector2", "angle": "float", "angle_to": "float", "angle_to_point": "float", "aspect": "float", "bezier_derivative": "Vector2", "bezier_interpolate": "Vector2", "bounce": "Vector2", "ceil": "Vector2", "clamp": "Vector2", "clampf": "Vector2", "cross": "float", "cubic_interpolate": "Vector2", "cubic_interpolate_in_time": "Vector2", "direction_to": "Vector2", "distance_squared_to": "float", "distance_to": "float", "dot": "float", "floor": "Vector2", "from_angle": "Vector2", "is_equal_approx": "bool", "is_finite": "bool", "is_normalized": "bool", "is_zero_approx": "bool", "length": "float", "length_squared": "float", "lerp": "Vector2", "limit_length": "Vector2", "max": "Vector2", "max_axis_index": "int", "maxf": "Vector2", "min": "Vector2", "min_axis_index": "int", "minf": "Vector2", "move_toward": "Vector2", "normalized": "Vector2", "orthogonal": "Vector2", "posmod": "Vector2", "posmodv": "Vector2", "project": "Vector2", "reflect": "Vector2", "rotated": "Vector2", "round": "Vector2", "sign": "Vector2", "slerp": "Vector2", "slide": "Vector2", "snapped": "Vector2", "snappedf": "Vector2",},
  "Vector2i": {"abs": "Vector2i", "aspect": "float", "clamp": "Vector2i", "clampi": "Vector2i", "distance_squared_to": "int", "distance_to": "float", "length": "float", "length_squared": "int", "max": "Vector2i", "max_axis_index": "int", "maxi": "Vector2i", "min": "Vector2i", "min_axis_index": "int", "mini": "Vector2i", "sign": "Vector2i", "snapped": "Vector2i", "snappedi": "Vector2i",},
  "Vector3": {"abs": "Vector3", "angle_to": "float", "bezier_derivative": "Vector3", "bezier_interpolate": "Vector3", "bounce": "Vector3", "ceil": "Vector3", "clamp": "Vector3", "clampf": "Vector3", "cross": "Vector3", "cubic_interpolate": "Vector3", "cubic_interpolate_in_time": "Vector3", "direction_to": "Vector3", "distance_squared_to": "float", "distance_to": "float", "dot": "float", "floor": "Vector3", "inverse": "Vector3", "is_equal_approx": "bool", "is_finite": "bool", "is_normalized": "bool", "is_zero_approx": "bool", "length": "float", "length_squared": "float", "lerp": "Vector3", "limit_length": "Vector3", "max": "Vector3", "max_axis_index": "int", "maxf": "Vector3", "min": "Vector3", "min_axis_index": "int", "minf": "Vector3", "move_toward": "Vector3", "normalized": "Vector3", "octahedron_decode": "Vector3", "octahedron_encode": "Vector2", "posmod": "Vector3", "posmodv": "Vector3", "project": "Vector3", "reflect": "Vector3", "rotated": "Vector3", "round": "Vector3", "sign": "Vector3", "signed_angle_to": "float", "slerp": "Vector3", "slide": "Vector3", "snapped": "Vector3", "snappedf": "Vector3",},
  "Vector3i": {"abs": "Vector3i", "clamp": "Vector3i", "clampi": "Vector3i", "distance_squared_to": "int", "distance_to": "float", "length": "float", "length_squared": "int", "max": "Vector3i", "max_axis_index": "int", "maxi": "Vector3i", "min": "Vector3i", "min_axis_index": "int", "mini": "Vector3i", "sign": "Vector3i", "snapped": "Vector3i", "snappedi": "Vector3i",},
  "Color": {"blend": "Color", "clamp": "Color", "darkened": "Color", "from_hsv": "Color", "from_ok_hsl": "Color", "from_rgba8": "Color", "from_rgbe9995": "Color", "from_string": "Color", "get_luminance": "float", "hex": "Color", "hex64": "Color", "html": "Color", "html_is_valid": "bool", "inverted": "Color", "is_equal_approx": "bool", "lerp": "Color", "lightened": "Color", "linear_to_srgb": "Color", "srgb_to_linear": "Color", "to_abgr32": "int", "to_abgr64": "int", "to_argb32": "int", "to_argb64": "int", "to_html": "String", "to_rgba32": "int", "to_rgba64": "int",},
  "StringName": {"begins_with": "bool", "bigrams": "PackedStringArray", "bin_to_int": "int", "c_escape": "String", "c_unescape": "String", "capitalize": "String", "casecmp_to": "int", "contains": "bool", "containsn": "bool", "count": "int", "countn": "int", "dedent": "String", "ends_with": "bool", "erase": "String", "filecasecmp_to": "int", "filenocasecmp_to": "int", "find": "int", "findn": "int", "format": "String", "get_base_dir": "String", "get_basename": "String", "get_extension": "String", "get_file": "String", "get_slice": "String", "get_slice_count": "int", "get_slicec": "String", "hash": "int", "hex_decode": "PackedByteArray", "hex_to_int": "int", "indent": "String", "insert": "String", "is_absolute_path": "bool", "is_empty": "bool", "is_relative_path": "bool", "is_subsequence_of": "bool", "is_subsequence_ofn": "bool", "is_valid_ascii_identifier": "bool", "is_valid_filename": "bool", "is_valid_float": "bool", "is_valid_hex_number": "bool", "is_valid_html_color": "bool", "is_valid_identifier": "bool", "is_valid_int": "bool", "is_valid_ip_address": "bool", "is_valid_unicode_identifier": "bool", "join": "String", "json_escape": "String", "left": "String", "length": "int", "lpad": "String", "lstrip": "String", "match": "bool", "matchn": "bool", "md5_buffer": "PackedByteArray", "md5_text": "String", "naturalcasecmp_to": "int", "naturalnocasecmp_to": "int", "nocasecmp_to": "int", "pad_decimals": "String", "pad_zeros": "String", "path_join": "String", "remove_char": "String", "remove_chars": "String", "repeat": "String", "replace": "String", "replace_char": "String", "replace_chars": "String", "replacen": "String", "reverse": "String", "rfind": "int", "rfindn": "int", "right": "String", "rpad": "String", "rsplit": "PackedStringArray", "rstrip": "String", "sha1_buffer": "PackedByteArray", "sha1_text": "String", "sha256_buffer": "PackedByteArray", "sha256_text": "String", "similarity": "float", "simplify_path": "String", "split": "PackedStringArray", "strip_edges": "String", "strip_escapes": "String", "substr": "String", "to_ascii_buffer": "PackedByteArray", "to_camel_case": "String", "to_float": "float", "to_int": "int", "to_kebab_case": "String", "to_lower": "String", "to_multibyte_char_buffer": "PackedByteArray", "to_pascal_case": "String", "to_snake_case": "String", "to_upper": "String", "to_utf16_buffer": "PackedByteArray", "to_utf32_buffer": "PackedByteArray", "to_utf8_buffer": "PackedByteArray", "to_wchar_buffer": "PackedByteArray", "trim_prefix": "String", "trim_suffix": "String", "unicode_at": "int", "uri_decode": "String", "uri_encode": "String", "uri_file_decode": "String", "validate_filename": "String", "validate_node_name": "String", "xml_escape": "String", "xml_unescape": "String",},
  "NodePath": {"get_as_property_path": "NodePath", "get_concatenated_names": "StringName", "get_concatenated_subnames": "StringName", "get_name": "StringName", "get_name_count": "int", "get_subname": "StringName", "get_subname_count": "int", "hash": "int", "is_absolute": "bool", "is_empty": "bool", "slice": "NodePath",},
  "String": {"bigrams": "PackedStringArray", "bin_to_int": "int", "c_escape": "String", "c_unescape": "String", "capitalize": "String", "dedent": "String", "get_base_dir": "String", "get_basename": "String", "get_extension": "String", "get_file": "String", "hash": "int", "hex_decode": "PackedByteArray", "hex_to_int": "int", "is_absolute_path": "bool", "is_empty": "bool", "is_relative_path": "bool", "is_valid_ascii_identifier": "bool", "is_valid_filename": "bool", "is_valid_float": "bool", "is_valid_hex_number": "bool", "is_valid_html_color": "bool", "is_valid_identifier": "bool", "is_valid_int": "bool", "is_valid_ip_address": "bool", "is_valid_unicode_identifier": "bool", "json_escape": "String", "length": "int", "md5_buffer": "PackedByteArray", "md5_text": "String", "reverse": "String", "rsplit": "PackedStringArray", "sha1_buffer": "PackedByteArray", "sha1_text": "String", "sha256_buffer": "PackedByteArray", "sha256_text": "String", "simplify_path": "String", "split": "PackedStringArray", "strip_edges": "String", "strip_escapes": "String", "to_ascii_buffer": "PackedByteArray", "to_camel_case": "String", "to_float": "float", "to_int": "int", "to_kebab_case": "String", "to_lower": "String", "to_multibyte_char_buffer": "PackedByteArray", "to_pascal_case": "String", "to_snake_case": "String", "to_upper": "String", "to_utf16_buffer": "PackedByteArray", "to_utf32_buffer": "PackedByteArray", "to_utf8_buffer": "PackedByteArray", "to_wchar_buffer": "PackedByteArray", "uri_decode": "String", "uri_encode": "String", "uri_file_decode": "String", "validate_filename": "String", "validate_node_name": "String", "xml_escape": "String", "xml_unescape": "String",},
};

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
    const mods = new Map<string, string>();
    for (const v of m.vars) {
      const face = faceName(v.type);
      if (face !== null) mods.set(v.name, face);
    }
    const elems = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) elems.set(name, t.name);
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
        const kind = packFaceRecv(callee.obj as Record<string, unknown>, attr);
        if (kind === null || !PACK_TYPE_NAMES.has(kind)) {
          const recvObj = callee.obj as Record<string, unknown>;
          const chainRecv = recvObj.kind === "call" && (recvObj.callee as Record<string, unknown> | undefined)?.kind === "attribute";
          const vface = attrFaceRecv(recvObj, attr, elems, mods);
          if (vface === null || (!instanceFaceManaged(vface) && !PACK_TYPE_NAMES.has(vface) && vface !== "StringName" && vface !== "NodePath")) continue;
          if (vface === "String" && recvObj.kind !== "index" && !chainRecv) continue;
          const vmethod = callee.name;
          if (typeof vmethod !== "string") continue;
          if (vmethod in (VALUE_METHOD_ARITY[vface] ?? {}) || !memberNameAbsent(vface, vmethod)) continue;
          const vloc = (n.loc as Diagnostic["loc"]) ?? null;
          diags.push({ code: "face-member-missing", message: `Cannot find member "${vmethod}" in base "${vface}".`, loc: vloc });
          diags.push({ code: "face-member-not-found", message: `Function "${vmethod}()" not found in base ${vface}.`, loc: vloc });
          continue;
        }
        const method = callee.name;
        if (typeof method !== "string" || method in (VALUE_METHOD_ARITY[kind] ?? {})) continue;
        if (!memberNameAbsent(kind, method)) continue;
        const loc = (n.loc as Diagnostic["loc"]) ?? null;
        diags.push({ code: "face-member-missing", message: `Cannot find member "${method}" in base "${kind}".`, loc });
        diags.push({ code: "face-member-not-found", message: `Function "${method}()" not found in base ${kind}.`, loc });
        continue;
      }
      if (n.kind !== "attribute" || callCallees.has(n)) continue;
      const face = attrFaceRecv(n.obj as Record<string, unknown>, attr, elems, mods);
      const name = n.name;
      if (typeof name !== "string") continue;
      const loc = (n.loc as Diagnostic["loc"]) ?? null;
      if (face === null) {
        const rec = n.obj as Record<string, unknown>;
        if (name === "new" && rec.kind === "ident" && typeof rec.name === "string") {
          const annText = elems.get(rec.name) ?? attr.get(rec.name) ?? "";
          if (/^(Array|Dictionary)\[[^\]]+\]$/.test(annText)) {
            const shown = annText.replace(/\[([^\]]*)\]/, (_m, inner: string) => `[${inner.split(",").map((s) => s.trim()).join(", ")}]`);
            const one = `Cannot find member "new" in base "${shown}".`;
            diags.push({ code: "face-attr-missing", message: one, loc });
            if (annText.startsWith("Array")) diags.push({ code: "face-attr-missing", message: one, loc });
          }
        }
        continue;
      }
      const table = face === "Array" ? ARRAY_METHOD_ARITY : face === "String" ? STRING_METHOD_ARITY : face === "StringName" ? STRING_NAME_METHOD_ARITY : face === "NodePath" ? NODE_PATH_METHOD_ARITY : (VALUE_METHOD_ARITY[face] ?? {});
      const refused = PACK_TYPE_NAMES.has(face) || face === "Array" || face === "String";
      if (name in table) {
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
        ? memberNameAbsent(face, name)
        : face === "Array" || face === "String"
          ? true
          : valueAttrKind(face, name) === "absent" || instanceMemberAbsent(face, name) ||
            ((face === "StringName" || face === "NodePath") && memberNameAbsent(face, name));
      if (!absent) continue;
      if (!refused && writeTargets.has(n)) continue;
      const one = `Cannot find member "${name}" in base "${face}".`;
      diags.push({ code: "face-attr-missing", message: one, loc });
      diags.push({ code: "face-attr-missing", message: one, loc });
    }
  }
}

function checkDictMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded, texts: scopeTexts } of faceScopes(m, "Dictionary", (init) => init.kind === "dict")) {
    const texts = new Map(scopeTexts);
    const dicts = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict");
    const dictAnn = faceReceiverNames(nodes, seeded, assigned, "Dictionary", (init) => init.kind === "dict", true, texts);
    for (const n of nodes) {
      const d = containerCallArity(n, DICT_METHOD_ARITY, "dict-arity", dicts, (obj) => obj.kind === "dict");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, DICT_METHOD_ARITY, "Dictionary", false, dictAnn, (obj) => obj.kind === "dict", texts)) diags.push(g);
    }
  }
}

function checkArrayMethodArity(m: Module, diags: Diagnostic[]): void {
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded, texts: scopeTexts } of faceScopes(m, "Array", (init) => init.kind === "array")) {
    const texts = new Map(scopeTexts);
    const arrays = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array");
    const arrAnn = faceReceiverNames(nodes, seeded, assigned, "Array", (init) => init.kind === "array", true, texts);
    for (const n of nodes) {
      const d = containerCallArity(n, ARRAY_METHOD_ARITY, "array-arity", arrays, (obj) => obj.kind === "array");
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, ARRAY_METHOD_ARITY, "Array", true, arrAnn, (obj) => obj.kind === "array", texts)) diags.push(g);
    }
  }
}

function checkStringMethodArity(m: Module, diags: Diagnostic[]): void {
  const isStringLit = (obj: Record<string, unknown>): boolean => obj.kind === "lit" && obj.lit === "string";
  const assigned = moduleAssignedNames(m);
  for (const { nodes, seeded } of faceScopes(m, "String", (init) => init.kind === "lit" && init.lit === "string")) {
    const strs = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string");
    const strAnn = faceReceiverNames(nodes, seeded, assigned, "String", (init) => init.kind === "lit" && init.lit === "string", true);
    const reads = new Map<string, string>();
    const noteRead = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) reads.set(name, t.name);
    };
    for (const v of m.vars) noteRead(v.name, v.type);
    for (const n of nodes) {
      if (n.kind === "var" && typeof n.name === "string") noteRead(n.name, n.type as TypeRef | null);
    }
    const isStringRead = (obj: Record<string, unknown>): boolean => {
      if (obj.kind !== "index") return false;
      const base = obj.obj as Record<string, unknown> | undefined;
      if (base === undefined || base.kind !== "ident" || typeof base.name !== "string") return false;
      return readFaceOf(reads.get(base.name) ?? "", staticType(obj.index as Expr)) === "String";
    };
    for (const n of nodes) {
      const d = containerCallArity(n, STRING_METHOD_ARITY, "string-arity", strs, (obj) => isStringLit(obj) || isStringRead(obj));
      if (d !== null) diags.push(d);
      for (const g of faceGhostDiags(n, STRING_METHOD_ARITY, "String", true, strAnn, isStringLit)) diags.push(g);
    }
  }
}

interface NamedFace {
  type: string;
  lit: string;
  arity: Record<string, [number, number]>;
  arityCode: string;
  ctorRecv?: boolean;
}

function ctorRecvFace(e: Record<string, unknown>, face: NamedFace): boolean {
  if (face.ctorRecv !== true || e.kind !== "call") return false;
  const callee = e.callee as Record<string, unknown> | undefined;
  if (callee === undefined || callee.kind !== "ident" || callee.name !== face.type) return false;
  const args = e.args as Record<string, unknown>[] | undefined;
  const first = args?.[0] as Record<string, unknown> | undefined;
  return args?.length === 1 && first !== undefined && first.kind === "lit" && first.lit === "string";
}

function checkNamedFace(m: Module, face: NamedFace, diags: Diagnostic[]): void {
  const isLiteral = (obj: Record<string, unknown>): boolean =>
    (obj.kind === "lit" && obj.lit === face.lit) || ctorRecvFace(obj, face);
  const isRecvInit = (init: Expr): boolean =>
    (init.kind === "lit" && init.lit === face.lit) || ctorRecvFace(init as unknown as Record<string, unknown>, face);
  const assigned = moduleAssignedNames(m);
  const argAnnAll = argNameScopes(m);
  for (const { nodes, seeded, body } of faceScopes(m, face.type, isRecvInit)) {
    const names = faceReceiverNames(nodes, seeded, assigned, face.type, isRecvInit);
    const argAnn = argAnnAll.get(body) ?? new Map<string, string>();
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
      const d = arityDiag(face.arity, face.arityCode, method, ((n.args as Expr[]) ?? []).length, loc);
      if (d !== null) diags.push(d);
      const fkey = `${face.type}.${method}`;
      const got = (n.args as Expr[]) ?? [];
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        if (bucket.some((d) => d.message === message)) return;
        bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      for (const [pos, refuse, want, also] of FACE_ARG_AS[fkey] ?? []) {
        const lit = got[pos - 1];
        const bad = literalTypeName(lit);
        if (bad !== null) {
          const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
          if (!refuse.includes(bad) && !nullSlot) continue;
          put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
          if (nullSlot || also.includes(bad)) {
            put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`);
          }
          continue;
        }
        const named = argNameType(lit, argAnn);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
        put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${named}".`);
      }
      for (const [pos, refuse, want] of FACE_ARG_TYPES[fkey] ?? []) {
        const lit = got[pos - 1];
        const bad = literalTypeName(lit);
        if (bad !== null) {
          if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
          put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${bad}".`);
          continue;
        }
        const named = argNameType(lit, argAnn);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
        put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${String(pos)} should be "${want}" but is "${named}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const g of byPos.get(pos)!) diags.push({ code: g.code, message: g.message, loc });
      }
    }
  }
}

const STRINGNAME_FACE: NamedFace = {
  type: "StringName",
  lit: "string_name",
  arity: STRING_NAME_METHOD_ARITY,
  arityCode: "string-name-arity",
};

const NODE_PATH_FACE: NamedFace = {
  type: "NodePath",
  lit: "node_path",
  arity: NODE_PATH_METHOD_ARITY,
  arityCode: "node-path-arity",
  ctorRecv: true,
};

const CTOR_REFUSED: Record<string, string[][]> = {
  int: [["int", "int"], ["int", "int", "int"]],
  float: [["int", "int"], ["int", "int", "int"]],
  bool: [["int", "int"], ["int", "int", "int"]],
  String: [["int"], ["int", "int"], ["int", "int", "int"]],
  StringName: [["int"], ["int", "int"], ["int", "int", "int"]],
  NodePath: [["int"], ["int", "int"], ["int", "int", "int"]],
  Array: [
    ["int"], ["int", "int"], ["int", "int", "int"], ["String"],
    ["Dictionary"], ["null"], ["float"], ["bool"], ["StringName"], ["Vector2"], ["Color"],
    ["Array", "int"], ["Array", "Variant.Type"], ["Dictionary", "Variant.Type"],
    ["float", "Variant.Type"], ["bool", "Variant.Type"], ["Vector2", "Variant.Type"],
    ["StringName", "Variant.Type"], ["PackedStringArray", "Variant.Type"], ["PackedByteArray", "Variant.Type"],
    ["null", "Variant.Type", "StringName", "null"], ["String", "Variant.Type", "StringName", "null"],
    ["int", "Variant.Type", "StringName", "null"], ["Array", "Variant.Type", "Variant.Type", "bool"],
    ["Array", "Variant.Type", "StringName", "null", "int"],
    ["Array", "Variant.Type", "StringName", "null", "int", "int"],
    ["int", "Variant.Type"], ["String", "Variant.Type"],
    ["int", "Variant.Type", "int"], ["Array", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "String"], ["int", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "Variant.Type", "StringName"],
    ["Array", "Variant.Type", "int", "null"], ["Array", "Variant.Type", "int", "String"],
    ["Array", "Variant.Type", "int", "bool"],
    ["int", "Variant.Type", "StringName", "bool"], ["Dictionary", "Variant.Type", "StringName", "bool"],
    ["int", "String", "String", "bool"],
    ["int", "Variant.Type", "int", "String", "int"],
    ["Array", "Variant.Type", "StringName", "bool", "bool"],
  ],
  Dictionary: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Vector2: [["int"], ["int", "int", "int"], ["String"]],
  Vector2i: [["int"], ["int", "int", "int"], ["String"]],
  Vector3: [["int"], ["int", "int"], ["String"]],
  Vector3i: [["int"], ["int", "int"], ["String"]],
  Vector4: [["int"], ["int", "int"], ["int", "int", "int"]],
  Vector4i: [["int"], ["int", "int"], ["int", "int", "int"]],
  PackedVector4Array: [["Vector4"]],
  Callable: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  Signal: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  RID: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedByteArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedInt32Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedFloat64Array: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
  PackedStringArray: [["int"], ["int", "int"], ["int", "int", "int"], ["String"]],
};

function ctorArgName(a: Expr, argTypes: Map<string, string>): string | null {
  const lit = literalTypeName(a);
  if (lit !== null) return lit;
  if (a.kind === "ident") {
    const nm = (a as unknown as Record<string, unknown>).name;
    if (typeof nm !== "string") return null;
    if (nm.startsWith("TYPE_") && isGlobalConst(nm)) return "Variant.Type";
    return argTypes.get(nm) ?? null;
  }
  return null;
}

function checkCtorSignatures(m: Module, diags: Diagnostic[]): void {
  const shadowed = new Set(m.funcs.map((f) => f.name));
  for (const nodes of flattenBodies(m)) {
    const argTypes = new Map<string, string>();
    for (const n of nodes) {
      if (n.kind !== "var") continue;
      const t = n.type as Record<string, unknown> | null | undefined;
      const nm = n.name;
      if (t !== undefined && t !== null && t.kind === "named" && typeof t.name === "string" && typeof nm === "string") argTypes.set(nm, t.name);
    }
    for (const n of nodes) {
      if (n.kind !== "call") continue;
      const callee = n.callee as Record<string, unknown> | undefined;
      if (callee === undefined || callee.kind !== "ident" || typeof callee.name !== "string") continue;
      const name = callee.name;
      if (shadowed.has(name)) continue;
      const bad = CTOR_REFUSED[name];
      if (bad === undefined) continue;
      const kinds = ((n.args as Expr[]) ?? []).map((a) => ctorArgName(a, argTypes));
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
  Vector4: ["Vector4", "Vector4i"],
  Vector4i: ["Vector4i", "Vector4"],
  Color: ["Color", "String", "int"],
  Rect2: [],
};

/** 标注名 → 形参槽名，认不出的一律 null（类名槽不在这里判：`f(null)` 合法，而引擎类名手上没有名单）。 */
function funcSlotName(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return base in FUNC_ARG_SLOTS ? base : null;
}

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
          else diags.push({ code: "dict-dup-key", message: `Key "${dictKeyText(key)}" was already used in this dictionary (at line ${String(first?.line ?? 0)}).`, loc: en.key.loc });
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
  const chainInit = (startName: string | null): Chain => {
    const seen = new Set<string>();
    let name = startName;
    while (name !== null) {
      if (seen.has(name)) return { state: "unknown" };
      seen.add(name);
      const c = inner.get(name);
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
      for (const p of f.params) if (p.default !== null) scanExpr(p.default, report(local));
    }
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

function guaranteedReturn(stmts: Stmt[]): boolean {
  const last = stmts[stmts.length - 1];
  if (last === undefined) return false;
  switch (last.kind) {
    case "return":
      return last.value !== null;
    case "if": {
      const tail = last.branches[last.branches.length - 1];
      return tail !== undefined && tail.cond === null && last.branches.every((b) => guaranteedReturn(b.body));
    }
    case "match":
      return last.arms.some((a) => a.pattern.kind === "wildcard" && guaranteedReturn(a.body));
    default:
      return false;
  }
}

function checkReturnPaths(funcs: FuncDecl[], diags: Diagnostic[]): void {
  for (const f of funcs) {
    if (f.returnType === null) continue;
    if (f.returnType.kind === "named" && f.returnType.name === "void") continue;
    if (guaranteedReturn(f.body)) continue;
    diags.push({ code: "return-path", message: "Not all code paths return a value.", loc: f.loc });
  }
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
      const patternNames = (p: Pattern): void => {
        if (p.kind === "const") walkExpr(p.expr, scope, coroutines, diags);
        else if (p.kind === "array") for (const it of p.items) patternNames(it);
        else if (p.kind === "dict") {
          for (const en of p.entries) {
            walkExpr(en.key, scope, coroutines, diags);
            patternNames(en.pattern);
          }
        }
      };
      for (const arm of s.arms) {
        patternNames(arm.pattern);
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

const globalValueReads = new Set<string>();

const nativeClassReads = new Set<string>();

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
let hostValueMethods: Set<string> = NO_HOST_VALUE_METHODS;
let hostStaticCtx: { kind: "func"; name: string } | { kind: "var" } | { kind: "const"; name: string } | null = null;
const hostMethodReads = new Set<string>();

const gvKey = (name: string, line: number, col: number): string => `${markOwner}#${name}@${line}:${col}`;
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
      if (!scope.has(e.name) && !isGlobalConst(e.name)) {
        if (CLASS_FACE_RECEIVERS.has(e)) return;
        if (GLOBAL_VALUE_NAMES.has(e.name)) globalValueReads.add(gvKey(e.name, e.loc.line, e.loc.col));
        else if (ENGINE_CLASS_NAMES.has(e.name)) nativeClassReads.add(gvKey(e.name, e.loc.line, e.loc.col));
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
        else if (VIRTUAL_HOST_NAMES.has(e.name))
          diags.push({ code: "undeclared-identifier", message: `Identifier not found: ${e.name}`, loc: e.loc });
        else if (BUILTIN_TYPE_NAMES.has(e.name)) {
          diags.push({
            code: "undeclared-identifier",
            message: "Builtin type cannot be used as a name on its own.",
            loc: e.loc,
          });
          diags.push({
            code: "undeclared-identifier",
            message: `Identifier "${e.name}" not declared in the current scope.`,
            loc: e.loc,
          });
        }
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
          for (const [pos, want] of GLOBAL_ARG_TYPES[name] ?? []) {
            if (literalTypeName((e.args as Expr[])[pos - 1]) === "Array") {
              diags.push({
                code: "global-arg-type",
                message: `Invalid argument for "${name}()" function: argument ${String(pos)} should be "${want}" but is "Array".`,
                loc: e.loc,
              });
              break;
            }
          }
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

export const OP_PAIRS_REFUSED_A: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "bool|float", "bool|int", "float|NodePath", "float|String", "float|StringName", "float|bool", "int|NodePath", "int|String", "int|StringName", "int|bool"],
  "%": ["Color|Color", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "float|float", "float|int", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool", "int|float"],
  "*": ["Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|NodePath", "float|String", "float|StringName", "float|bool", "int|NodePath", "int|String", "int|StringName", "int|bool"],
  "**": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|StringName", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  "+": ["Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool"],
  "-": ["Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool"],
  "/": ["Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool"],
  "<": ["Color|Color", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool"],
  "<=": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|StringName", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "bool|bool", "bool|float", "bool|int", "float|NodePath", "float|String", "float|StringName", "float|bool", "int|NodePath", "int|String", "int|StringName", "int|bool"],
  "==": ["Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool"],
  ">": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|StringName", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "bool|float", "bool|int", "float|NodePath", "float|String", "float|StringName", "float|bool", "int|NodePath", "int|String", "int|StringName", "int|bool"],
  ">=": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|StringName", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "bool|bool", "bool|float", "bool|int", "float|NodePath", "float|String", "float|StringName", "float|bool", "int|NodePath", "int|String", "int|StringName", "int|bool"],
  "and": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|String", "String|StringName", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "float|NodePath", "float|String", "float|StringName", "int|NodePath", "int|String", "int|StringName"],
  "in": ["Color|Color", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|NodePath", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector2i", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|Vector3i", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|bool", "bool|float", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|bool", "float|float", "float|int", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i", "int|bool", "int|float", "int|int"],
  "or": ["Color|NodePath", "Color|StringName", "NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|NodePath", "String|String", "String|StringName", "String|bool", "String|float", "String|int", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|String", "bool|StringName", "float|NodePath", "float|String", "float|StringName", "int|NodePath", "int|String", "int|StringName"],
};

export const OP_PAIRS_REFUSED_B: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "%": ["Array|Array", "Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "*": ["Array|Array", "Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "**": ["Array|NodePath", "Array|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary"],
  "+": ["Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "-": ["Array|Array", "Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "/": ["Array|Array", "Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "<": ["Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "<=": ["Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "==": ["Array|Color", "Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Color|Array", "Color|Dictionary", "Dictionary|Array", "Dictionary|Color", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "Vector2i|Array", "Vector2i|Dictionary", "Vector2|Array", "Vector2|Dictionary", "Vector3i|Array", "Vector3i|Dictionary", "Vector3|Array", "Vector3|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  ">": ["Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  ">=": ["Array|Dictionary", "Array|NodePath", "Array|String", "Array|StringName", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "NodePath|Array", "NodePath|Dictionary", "StringName|Array", "StringName|Dictionary", "String|Array", "String|Dictionary", "bool|Array", "bool|Dictionary", "float|Array", "float|Dictionary", "int|Array", "int|Dictionary"],
  "and": [],
  "in": ["Array|Color", "Array|NodePath", "Array|String", "Array|StringName", "Array|Vector2", "Array|Vector2i", "Array|Vector3", "Array|Vector3i", "Array|bool", "Array|float", "Array|int", "Dictionary|Color", "Dictionary|NodePath", "Dictionary|String", "Dictionary|StringName", "Dictionary|Vector2", "Dictionary|Vector2i", "Dictionary|Vector3", "Dictionary|Vector3i", "Dictionary|bool", "Dictionary|float", "Dictionary|int"],
  "or": [],
};

function isLiteralOperand(e: Expr): boolean {
  return e.kind === "lit" || e.kind === "array" || e.kind === "dict" || valueCtorType(e) !== null;
}

export const OP_PAIRS_REFUSED_DECL: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["Array|Dictionary", "Array|String", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|String", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "String|Array", "String|Dictionary", "String|bool", "String|float", "String|int", "bool|Array", "bool|Dictionary", "bool|String", "bool|float", "bool|int", "float|Array", "float|Dictionary", "float|String", "float|bool", "int|Array", "int|Dictionary", "int|String", "int|bool"],
  "%": ["Array|Array", "Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "float|float", "float|int", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool", "int|float"],
  "*": ["Array|Array", "Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|bool"],
  "+": ["Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool"],
  "-": ["Array|Array", "Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool"],
  "/": ["Array|Array", "Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|String", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool"],
  "<": ["Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Callable", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|Dictionary", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool"],
  "<=": ["Array|Dictionary", "Array|String", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|String", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "String|Array", "String|Dictionary", "String|bool", "String|float", "String|int", "bool|Array", "bool|Dictionary", "bool|String", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Dictionary", "float|String", "float|bool", "int|Array", "int|Dictionary", "int|String", "int|bool"],
  "==": ["Array|Callable", "Array|Dictionary", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Array", "Callable|Color", "Callable|Dictionary", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Array", "Dictionary|Callable", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|Array", "PackedByteArray|Dictionary", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|Array", "PackedStringArray|Dictionary", "PackedStringArray|PackedByteArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Array", "String|Callable", "String|Color", "String|Dictionary", "String|PackedByteArray", "String|PackedStringArray", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Array", "Vector2|Callable", "Vector2|Color", "Vector2|Dictionary", "Vector2|String", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Array", "bool|Callable", "bool|Dictionary", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|float", "bool|int", "float|Array", "float|Callable", "float|Dictionary", "float|PackedByteArray", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "int|Array", "int|Callable", "int|Dictionary", "int|PackedByteArray", "int|PackedStringArray", "int|String", "int|Vector2", "int|bool"],
  ">": ["Array|Dictionary", "Array|String", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|String", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "String|Array", "String|Dictionary", "String|bool", "String|float", "String|int", "bool|Array", "bool|Dictionary", "bool|String", "bool|float", "bool|int", "float|Array", "float|Dictionary", "float|String", "float|bool", "int|Array", "int|Dictionary", "int|String", "int|bool"],
  ">=": ["Array|Dictionary", "Array|String", "Array|bool", "Array|float", "Array|int", "Dictionary|Array", "Dictionary|Dictionary", "Dictionary|String", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "String|Array", "String|Dictionary", "String|bool", "String|float", "String|int", "bool|Array", "bool|Dictionary", "bool|String", "bool|bool", "bool|float", "bool|int", "float|Array", "float|Dictionary", "float|String", "float|bool", "int|Array", "int|Dictionary", "int|String", "int|bool"],
  "in": ["Array|Callable", "Array|Color", "Array|PackedByteArray", "Array|PackedStringArray", "Array|String", "Array|Vector2", "Array|bool", "Array|float", "Array|int", "Callable|Callable", "Callable|Color", "Callable|String", "Callable|Vector2", "Callable|Vector2i", "Callable|Vector3", "Callable|Vector3i", "Callable|bool", "Callable|float", "Callable|int", "Color|Callable", "Color|String", "Color|Vector2", "Dictionary|Callable", "Dictionary|Color", "Dictionary|PackedByteArray", "Dictionary|PackedStringArray", "Dictionary|String", "Dictionary|Vector2", "Dictionary|bool", "Dictionary|float", "Dictionary|int", "PackedByteArray|PackedByteArray", "PackedByteArray|PackedStringArray", "PackedByteArray|String", "PackedByteArray|bool", "PackedByteArray|float", "PackedByteArray|int", "PackedStringArray|PackedByteArray", "PackedStringArray|PackedStringArray", "PackedStringArray|String", "PackedStringArray|bool", "PackedStringArray|float", "PackedStringArray|int", "String|Callable", "String|Color", "String|PackedByteArray", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|bool", "String|float", "String|int", "Vector2i|Callable", "Vector2i|String", "Vector2i|Vector2", "Vector2|Callable", "Vector2|Color", "Vector2|String", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Callable", "Vector3i|String", "Vector3i|Vector2", "Vector3|Callable", "Vector3|String", "Vector3|Vector2", "bool|Callable", "bool|PackedByteArray", "bool|PackedStringArray", "bool|String", "bool|Vector2", "bool|float", "float|Callable", "float|PackedStringArray", "float|String", "float|Vector2", "float|bool", "float|float", "float|int", "int|Callable", "int|PackedStringArray", "int|String", "int|Vector2", "int|float"],
};

export const OP_PAIRS_REFUSED_DECL_VAL: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
  "%": ["Color|Color", "Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2|Color", "Vector2|String", "Vector2|Vector2", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool", "int|float"],
  "*": ["Color|String", "Color|Vector2", "Color|bool", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "int|String", "int|bool"],
  "**": ["NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
  "+": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "-": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "/": ["Color|String", "Color|Vector2", "Color|bool", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|StringName", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|String", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "<": ["Color|Color", "Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  "<=": ["NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
  "==": ["Color|String", "Color|Vector2", "Color|bool", "Color|float", "Color|int", "NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int", "String|Color", "String|Vector2", "String|bool", "String|float", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|String", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|bool", "Vector3|float", "Vector3|int", "int|Color", "int|String", "int|Vector2", "int|bool"],
  ">": ["NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
  ">=": ["NodePath|Array", "NodePath|Color", "NodePath|Dictionary", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Array", "StringName|Color", "StringName|Dictionary", "StringName|NodePath", "StringName|String", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
  "in": ["NodePath|Color", "NodePath|NodePath", "NodePath|String", "NodePath|StringName", "NodePath|Vector2", "NodePath|bool", "NodePath|float", "NodePath|int", "StringName|Color", "StringName|NodePath", "StringName|Vector2", "StringName|bool", "StringName|float", "StringName|int"],
};

export const OP_PAIRS_REFUSED_DECL_VAL_REV: Readonly<Record<string, ReadonlyArray<string>>> = {
  "!=": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|StringName", "StringName|NodePath", "String|NodePath", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  "%": ["Array|NodePath", "Array|StringName", "Color|Color", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "float|int", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "*": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "StringName|StringName", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|NodePath", "float|String", "float|StringName", "int|NodePath", "int|String", "int|StringName"],
  "**": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "StringName|StringName", "String|NodePath", "String|StringName", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  "+": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|Color", "String|NodePath", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "-": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "StringName|StringName", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "/": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "StringName|StringName", "String|Color", "String|NodePath", "String|String", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "<": ["Array|NodePath", "Array|StringName", "Color|Color", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|Color", "String|NodePath", "String|StringName", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  "<=": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|NodePath", "String|StringName", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  "==": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|String", "Color|StringName", "Color|Vector2", "Color|Vector2i", "Color|Vector3", "Color|Vector3i", "Color|bool", "Color|float", "Color|int", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|StringName", "StringName|NodePath", "String|Color", "String|NodePath", "String|Vector2", "String|Vector2i", "String|Vector3", "String|Vector3i", "String|int", "Vector2i|Color", "Vector2i|String", "Vector2i|Vector2", "Vector2i|Vector3", "Vector2i|Vector3i", "Vector2i|bool", "Vector2i|float", "Vector2i|int", "Vector2|Color", "Vector2|NodePath", "Vector2|String", "Vector2|StringName", "Vector2|Vector2i", "Vector2|Vector3", "Vector2|Vector3i", "Vector2|bool", "Vector2|float", "Vector2|int", "Vector3i|Color", "Vector3i|String", "Vector3i|Vector2", "Vector3i|Vector2i", "Vector3i|Vector3", "Vector3i|bool", "Vector3i|float", "Vector3i|int", "Vector3|Color", "Vector3|String", "Vector3|Vector2", "Vector3|Vector2i", "Vector3|Vector3i", "Vector3|bool", "Vector3|float", "Vector3|int", "bool|Color", "bool|NodePath", "bool|String", "bool|StringName", "bool|Vector2", "bool|Vector2i", "bool|Vector3", "bool|Vector3i", "bool|int", "float|Color", "float|NodePath", "float|String", "float|StringName", "float|Vector2", "float|Vector2i", "float|Vector3", "float|Vector3i", "int|Color", "int|NodePath", "int|String", "int|StringName", "int|Vector2", "int|Vector2i", "int|Vector3", "int|Vector3i"],
  ">": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|NodePath", "String|StringName", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  ">=": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|NodePath", "String|StringName", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
  "in": ["Array|NodePath", "Array|StringName", "Color|NodePath", "Color|StringName", "Dictionary|NodePath", "Dictionary|StringName", "NodePath|NodePath", "NodePath|StringName", "StringName|NodePath", "String|NodePath", "Vector2|NodePath", "Vector2|StringName", "bool|NodePath", "bool|StringName", "float|NodePath", "float|StringName", "int|NodePath", "int|StringName"],
};

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

export const BUILTIN_INSTANCE_PROPS: Readonly<Record<string, ReadonlyArray<string>>> = {
  "Vector2": ["x", "y"],
  "Vector2i": ["x", "y"],
  "Vector3": ["x", "y", "z"],
  "Vector3i": ["x", "y", "z"],
  "Color": ["a", "a8", "b", "b8", "g", "g8", "h", "ok_hsl_h", "ok_hsl_l", "ok_hsl_s", "r", "r8", "s", "v"],
};

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

export const BUILTIN_MEMBER_TYPES: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  "Vector2": {"x": "float", "y": "float",},
  "Vector2i": {"x": "int", "y": "int",},
  "Vector3": {"x": "float", "y": "float", "z": "float",},
  "Vector3i": {"x": "int", "y": "int", "z": "int",},
  "Color": {"a": "float", "a8": "int", "b": "float", "b8": "int", "g": "float", "g8": "int", "h": "float", "ok_hsl_h": "float", "ok_hsl_l": "float", "ok_hsl_s": "float", "r": "float", "r8": "int", "s": "float", "v": "float",},
};

function checkOperandPairs(m: Module, diags: Diagnostic[]): void {
  const ANNOT = new Set(["bool", "int", "float", "String", "StringName", "NodePath", "PackedByteArray", "PackedStringArray", "Array", "Dictionary", "Vector2", "Vector2i", "Vector3", "Vector3i", "Color"]);
  const named = (t: TypeRef | null): string | null => {
    if (t === null || t.kind !== "named") return null;
    const base = t.name.replace(/\[.*\]$/, "");
    return ANNOT.has(base) ? base : null;
  };
  const moduleTypes = new Map<string, string>();
  const moduleConsts = new Map<string, string>();
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
  const literalKind = (e: Expr): string | null => literalTypeName(e) ?? staticType(e);

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
    const faceOf = (e: Expr): string | null =>
      e.kind === "ident" ? (types.get(e.name) ?? null) : e.kind === "index" ? elemOf(e) : staticType(e);
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
    const callRet = (e: Expr): string | null => {
      if (e.kind !== "call" || e.callee.kind !== "attribute") return null;
      const face = faceOf(e.callee.obj);
      if (face === null) return null;
      const by = BUILTIN_METHOD_RETURNS[face];
      if (by === undefined) return null;
      const name = e.callee.name;
      return typeof name === "string" ? (by[name] ?? null) : null;
    };
    const packCtorFace = (e: Expr): string | null =>
      e.kind === "call" && e.callee.kind === "ident" && PACK_TYPE_NAMES.has(e.callee.name) ? e.callee.name : null;
    const operandKind = (e: Expr): string | null => {
      const lit = literalKind(e);
      if (lit !== null) return lit;
      if (e.kind === "ident") {
        const nm = types.get(e.name) ?? consts.get(e.name) ?? null;
        if (nm !== null) return nm;
      }
      return callRet(e) ?? packCtorFace(e) ?? callableOf(e) ?? elemOf(e);
    };
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
    const dispOf = (e: Expr, base: string): string => (e.kind === "ident" ? (raws.get(e.name) ?? base) : base);
    const reported = new Set<Expr>();
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (isLiteralOperand(e.left) && isLiteralOperand(e.right)) continue;
      if (e.left.kind !== "ident" && e.left.kind !== "index" && e.left.kind !== "call" && e.left.kind !== "attribute") continue;
      const rt = operandKind(e.right);
      if (rt === null) continue;
      const isIdent = e.left.kind === "ident";
      const name = isIdent ? (e.left as Extract<Expr, { kind: "ident" }>).name : "";
      const isConst = isIdent && consts.has(name);
      const lt = isIdent ? (isConst ? (consts.get(name) ?? null) : (types.get(name) ?? null)) : e.left.kind === "index" ? elemOf(e.left) : e.left.kind === "call" ? callRet(e.left) ?? literalKind(e.left) ?? packCtorFace(e.left) : callableOf(e.left);
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
          : `Invalid operands "${dispOf(e.left, lt)}" and "${dispOf(e.right, rt)}" for "${e.op}" operator.`,
        loc: e.loc,
      });
      reported.add(e);
    }
    for (const n of nodes) {
      if (n.kind !== "binary") continue;
      const e = n as unknown as Extract<Expr, { kind: "binary" }>;
      if (reported.has(e)) continue;
      if (isLiteralOperand(e.left) && isLiteralOperand(e.right)) continue;
      if (e.right.kind !== "ident" && e.right.kind !== "index" && e.right.kind !== "call" && e.right.kind !== "attribute") continue;
      const lt2 = operandKind(e.left);
      if (lt2 === null) continue;
      const rt2 = e.right.kind === "ident" ? (types.get((e.right as Extract<Expr, { kind: "ident" }>).name) ?? null) : e.right.kind === "index" ? elemOf(e.right) : e.right.kind === "call" ? callRet(e.right) ?? literalKind(e.right) ?? packCtorFace(e.right) : callableOf(e.right);
      if (rt2 === null) continue;
      const pair2 = `${lt2}|${rt2}`;
      if (OP_PAIRS_REFUSED_DECL[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_DECL_VAL_REV[e.op]?.includes(pair2) !== true && OP_PAIRS_REFUSED_CALLABLE[e.op]?.includes(pair2) !== true) continue;
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${dispOf(e.left, lt2)}" and "${dispOf(e.right, rt2)}" for "${e.op}" operator.`,
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

const FACE_CTOR_LITERAL: Readonly<Record<string, string>> = { NodePath: "NodePath", StringName: "StringName" };

function faceCtorLiteral(e: Expr): string | null {
  if (e.kind !== "call" || e.callee.kind !== "ident") return null;
  const face = FACE_CTOR_LITERAL[e.callee.name];
  if (face === undefined) return null;
  const args = e.args ?? [];
  if (args.length !== 1) return null;
  const a = args[0] as Expr;
  return a.kind === "lit" && a.lit === "string" ? face : null;
}

function checkOperator(e: Extract<Expr, { kind: "binary" }>, diags: Diagnostic[]): void {
  const l = literalTypeName(e.left) ?? faceCtorLiteral(e.left) ?? staticType(e.left);
  const r = literalTypeName(e.right) ?? faceCtorLiteral(e.right) ?? staticType(e.right);

  const pair = l !== null && r !== null ? `${l}|${r}` : null;
  const scalar = (t: string | null): boolean => t === "bool" || t === "int" || t === "float";
  const covered =
    (e.op === "%" && (l === "float" || r === "float") && scalar(l) && scalar(r)) ||
    ((e.op === "==" || e.op === "!=") &&
      ((l === "String" && (r === "int" || r === "float")) || (r === "String" && (l === "int" || l === "float")))) ||
    ((e.op === "<=" || e.op === ">=") && l === "bool" && r === "bool");
  let paired = false;
  if (!covered && (isLiteralOperand(e.left) || faceCtorLiteral(e.left) !== null) && (isLiteralOperand(e.right) || faceCtorLiteral(e.right) !== null) && pair !== null && l !== null && r !== null) {
    if (OP_PAIRS_REFUSED_A[e.op]?.includes(pair) === true) {
      paired = true;
      diags.push({
        code: "op-pair",
        message: `Invalid operands to operator ${e.op}, ${l} and ${r}.`,
        loc: e.loc,
      });
    } else if (OP_PAIRS_REFUSED_B[e.op]?.includes(pair) === true) {
      paired = true;
      diags.push({
        code: "op-pair",
        message: `Invalid operands "${l}" and "${r}" for "${e.op}" operator.`,
        loc: e.loc,
      });
    }
  }
  const strLike = (t: string | null): boolean => t === "String" || t === "StringName";
  const isModulo = !strLike(l) && !strLike(r);
  if (!paired && e.op === "%" && isModulo && l !== null && r !== null && (l === "float" || r === "float")) {
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
    (e.op === "/" || e.op === "%") &&
    e.left.kind === "lit" &&
    (e.left.lit === "int" || e.left.lit === "float") &&
    e.right.kind === "lit" &&
    e.right.lit === "int" &&
    Number(e.right.value) === 0
  ) {
    if (e.op === "%" && e.left.lit !== "int") return;
    diags.push({
      code: e.op === "/" ? "div-by-zero" : "mod-by-zero",
      message: e.op === "/" ? "Division by zero error in operator /." : "Modulo by zero error in operator %.",
      loc: e.loc,
    });
  }
}

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
  const recv = e.callee.kind === "attribute" ? e.callee.obj : null;
  if (recv !== null && !(recv.kind === "lit" && recv.lit === "string")) {
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
}
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

const PACK_TYPE_NAMES = new Set([
  "PackedByteArray",
  "PackedInt32Array",
  "PackedInt64Array",
  "PackedFloat32Array",
  "PackedFloat64Array",
  "PackedStringArray",
  "PackedVector2Array",
  "PackedVector3Array",
  "PackedVector4Array",
  "PackedColorArray",
]);

function valueTypeAnnotation(t: TypeRef | null): string | null {
  return t !== null && t.kind === "named" && t.name in VALUE_METHOD_ARITY ? t.name : null;
}

function valueCtorType(e: Expr | null): string | null {
  return e !== null && e.kind === "call" && e.callee.kind === "ident" && e.callee.name in VALUE_METHOD_ARITY
    ? e.callee.name
    : null;
}

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
  Vector4: {
    consts: ["ZERO", "ONE", "INF"],
    axis: [],
    statics: {},
  },
  Vector4i: {
    consts: ["ZERO", "ONE", "MIN", "MAX"],
    axis: [],
    statics: {},
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
  Callable: {
    consts: [],
    axis: [],
    statics: { create: [2, 2] },
  },
};

function staticFaceConstName(t: string, name: string): boolean {
  const face = STATIC_FACE[t];
  if (face === undefined) return false;
  return face.consts.includes(name) || face.axis.includes(name) || (t === "Color" && COLOR_NAMED[name.toLowerCase()] !== undefined);
}

/** 类名直调实例方法时的形参那几句：引擎在非静态那一句之后照说，句子与实例接收者同表（S507，尺 `tmp/d6/s507.py` 一百零五格 = 十面 × 廿一处位子 × 五种实参写法）。
 *  按 `(面.方法, 位)` 查那四张形参表；名字形只回第二句，`null` 与对象型名字按量到的那十三档值型槽判；同一位子被两行命中时同文只发一遍。 */
function classFaceArgDiags(e: Expr, face: string, method: string, argAnn: Map<string, string>): Array<{ code: string; message: string }> {
  const key = `${face}.${method}`;
  const byPos = new Map<number, Array<{ code: string; message: string }>>();
  const put = (pos: number, code: string, message: string): void => {
    const bucket = byPos.get(pos) ?? [];
    if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
    byPos.set(pos, bucket);
  };
  const named = (arg: Expr | undefined): string | null => argNameType(arg, argAnn);
  const got = e.kind === "call" ? e.args : [];
  for (const rows of [FACE_ARG_AS[key], INSTANCE_ARG_AS[key]]) {
    for (const [pos, refuse, want, also] of rows ?? []) {
      const arg = got[pos - 1];
      const bad = literalTypeName(arg);
      if (bad !== null) {
        const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
        if (!refuse.includes(bad) && !nullSlot) continue;
        put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
        if (nullSlot || also.includes(bad)) {
          put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
        }
        continue;
      }
      const nm = named(arg);
      if (nm === null) continue;
      if (!objectNameRefusedByValueSlot(nm, want) && (!faceListHas(refuse, nm) || !faceListHas(also, nm))) continue;
      put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
    }
  }
  for (const rows of [FACE_ARG_TYPES[key], INSTANCE_ARG_TYPES[key]]) {
    for (const [pos, refuse, want] of rows ?? []) {
      const arg = got[pos - 1];
      const bad = literalTypeName(arg);
      if (bad !== null) {
        if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
        put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
        continue;
      }
      const nm = named(arg);
      if (nm === null) continue;
      if (!objectNameRefusedByValueSlot(nm, want) && !faceListHas(refuse, nm)) continue;
      put(pos, "face-arg-type", `Invalid argument for "${method}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
    }
  }
  const out: Array<{ code: string; message: string }> = [];
  for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
    for (const d of byPos.get(pos)!) out.push(d);
  }
  return out;
}

/** 「类名.成员」的调用式：常量当函数调 / 静态函数元数 / 实例方法在类名上直接调 / 表外名字两句。 */
function staticCallDiags(t: string, name: string, got: number): Array<{ code: string; message: string }> {
  const face = STATIC_FACE[t];
  const extra = classFaceArity(t);
  if (face === undefined && !PACK_TYPE_NAMES.has(t) && extra === undefined) return [];
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
  if (VALUE_METHOD_ARITY[t]?.[name] !== undefined || (extra !== undefined && name in extra)) {
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

const BUILTIN_TYPE_NAMES: ReadonlySet<string> = new Set([
  "int", "float", "bool", "String", "StringName", "NodePath", "Array", "Dictionary",
  "Color", "Rect2", "Rect2i", "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i",
  "Transform2D", "Transform3D", "Basis", "Plane", "Quaternion", "AABB", "RID",
  "Callable", "Signal",
  "PackedByteArray", "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray",
]);

const BUILTIN_NEW_ABSENT_FACES: ReadonlySet<string> = new Set([
  "Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color",
  "String", "StringName", "NodePath", "Array", "Dictionary",
  "PackedInt32Array", "PackedInt64Array", "PackedFloat32Array", "PackedFloat64Array",
  "PackedStringArray", "PackedByteArray", "PackedVector2Array", "PackedVector3Array", "PackedColorArray",
]);

/** 「类名.静态函数」当值引用（不调用）不是一等成员：引擎那句报两遍。 */
function staticBareDiags(t: string, name: string): Array<{ code: string; message: string }> {
  if (name === "new" && BUILTIN_NEW_ABSENT_FACES.has(t)) {
    const one = `Cannot find member "new" in base "${t}".`;
    return [
      { code: "static-member-unknown", message: one },
      { code: "static-member-unknown", message: one },
    ];
  }
  const face = STATIC_FACE[t];
  if (face === undefined || face.statics[name] === undefined || staticFaceConstName(t, name)) return [];
  const one = `Cannot find member "${name}" in base "${t}".`;
  return [
    { code: "static-member-unknown", message: one },
    { code: "static-member-unknown", message: one },
  ];
}

const GLOBAL_TYPED_NAME_ARGS: Readonly<Record<string, ReadonlyArray<readonly [number, string, readonly string[]]>>> = {
  load: [[1, "String", ["NodePath", "String", "StringName"]]],
  str_to_var: [[1, "String", ["NodePath", "String", "StringName"]]],
  bytes_to_var: [[1, "PackedByteArray", ["Array", "PackedByteArray"]]],
  bytes_to_var_with_objects: [[1, "PackedByteArray", ["Array", "PackedByteArray"]]],
  inst_to_dict: [[1, "Object", []]],
  dict_to_inst: [[1, "Dictionary", ["Dictionary"]]],
  error_string: [[1, "int", ["bool", "float", "int"]]],
  instance_from_id: [[1, "int", ["bool", "float", "int"]]],
  is_instance_id_valid: [[1, "int", ["bool", "float", "int"]]],
  rand_from_seed: [[1, "int", ["bool", "float", "int"]]],
  rid_from_int64: [[1, "int", ["bool", "float", "int"]]],
  type_string: [[1, "int", ["bool", "float", "int"]]],
  randi_range: [[1, "int", ["bool", "float", "int"]], [2, "int", ["bool", "float", "int"]]],
  randf_range: [[1, "float", ["bool", "float", "int"]], [2, "float", ["bool", "float", "int"]]],
  randfn: [[1, "float", ["bool", "float", "int"]], [2, "float", ["bool", "float", "int"]]],
  type_convert: [[2, "int", ["bool", "float", "int"]]],
  convert: [[2, "Variant.Type", ["int"]]],
  ord: [[1, "String", ["NodePath", "String", "StringName"]]],
  type_exists: [[1, "StringName", ["String", "StringName"]]],
  seed: [[1, "int", ["bool", "float", "int"]]],
};

const CUBIC_NAME_ARG_FUNCS = new Set(["cubic_interpolate", "cubic_interpolate_in_time", "bezier_interpolate", "bezier_derivative"]);

function nameArgBad(a: Expr, argAnn: Map<string, string>, want: string): string | null {
  const nm = argNameType(a, argAnn);
  if (nm === null || nm === "int" || nm === "float" || nm === "bool" || nm === want) return null;
  return nm;
}

const GLOBAL_NUM_ARITH: ReadonlySet<string> = new Set(["sqrt", "exp", "log", "sin", "cos", "tan", "deg_to_rad", "rad_to_deg",
  "wrapf", "move_toward", "smoothstep", "is_equal_approx", "remap",
  "acos", "asin", "atan", "atanh", "sinh", "cosh", "tanh", "ceilf", "floorf", "roundf", "signf",
  "atan2", "pow", "maxf", "minf", "angle_difference",
  "absf", "acosh", "asinh", "clampf", "db_to_linear", "ease", "fmod", "fposmod", "inverse_lerp",
  "is_finite", "is_inf", "is_nan", "is_zero_approx", "lerp_angle", "lerpf", "linear_to_db", "pingpong", "rotate_toward",
  "ceili", "floori", "roundi", "snappedi", "absi", "char", "clampi", "maxi", "mini", "nearest_po2", "posmod", "signi", "wrapi", "step_decimals"]);

function checkValueMethodArity(m: Module, diags: Diagnostic[]): void {
  const moduleVars = new Map<string, string>();
  for (const v of m.vars) {
    const t = valueTypeAnnotation(v.type) ?? (v.type === null ? valueCtorType(v.init) : null);
    if (t !== null) moduleVars.set(v.name, t);
  }

  const funcs: Array<{ f: FuncDecl; base: Map<string, string>; fields: Map<string, string>; nameFields: Map<string, string> }> =
    m.funcs.map((f) => ({ f, base: moduleVars, fields: new Map<string, string>(), nameFields: new Map<string, string>() }));
  const collect = (c: ClassDecl): void => {
    const fields = new Map<string, string>();
    const nameFields = new Map<string, string>();
    for (const v of c.vars) {
      const ft = v.type !== null && v.type.kind === "named" && FACE_ANNOTATIONS.has(v.type.name) ? v.type.name : null;
      if (ft !== null) fields.set(v.name, ft);
      else {
        const vt = valueTypeAnnotation(v.type);
        if (vt !== null) fields.set(v.name, vt);
        else {
          const nf = knownFaceAnnotation(v.type);
          if (nf !== null && !(nf in PACK_ARG_SLOTS)) nameFields.set(v.name, nf);
        }
      }
    }
    for (const f of c.funcs) funcs.push({ f, base: new Map<string, string>(), fields, nameFields });
    for (const x of c.innerClasses) collect(x);
  };
  for (const c of m.innerClasses) collect(c);

  const argAnnAll = argNameScopes(m);
  for (const { f, base, fields, nameFields } of funcs) {
    const typed = new Map(base);
    const argAnn = argAnnAll.get(f.body) ?? new Map<string, string>();
    const faceTyped = new Map<string, string>();
    for (const v of m.vars) {
      if (v.type !== null && v.type.kind === "named" && FACE_ANNOTATIONS.has(v.type.name)) faceTyped.set(v.name, v.type.name);
    }
    for (const p of f.params) {
      const t = valueTypeAnnotation(p.type);
      if (t !== null) typed.set(p.name, t);
      if (p.type !== null && p.type.kind === "named" && FACE_ANNOTATIONS.has(p.type.name)) faceTyped.set(p.name, p.type.name);
    }
    for (const [name, t] of fields) {
      if (FACE_ANNOTATIONS.has(t)) faceTyped.set(name, t);
      else typed.set(name, t);
    }
    const elemFaces = new Map<string, string>();
    const noteElem = (name: string, t: TypeRef | null): void => {
      if (t !== null && t.kind === "named" && readFaceOf(t.name, null) !== null) elemFaces.set(name, t.name);
    };
    for (const v of m.vars) noteElem(v.name, v.type);
    for (const prm of f.params) noteElem(prm.name, prm.type);
    for (const n of flattenBody(f.body)) {
      if (n.kind === "var" && typeof n.name === "string") noteElem(n.name, n.type as TypeRef | null);
    }
    const recvElem = (obj: Expr): string | null => {
      if (obj.kind !== "index" || obj.obj.kind !== "ident") return null;
      return readFaceOf(elemFaces.get(obj.obj.name) ?? "", staticType(obj.index));
    };
    const nameFaces = new Map<string, string>();
    const noteNameFace = (name: string, t: TypeRef | null): void => {
      const f = knownFaceAnnotation(t);
      if (f !== null) nameFaces.set(name, f);
    };
    for (const v of m.vars) noteNameFace(v.name, v.type);
    for (const prm of f.params) noteNameFace(prm.name, prm.type);
    for (const n of flattenBody(f.body)) {
      if (n.kind === "var" && typeof n.name === "string") noteNameFace(n.name, n.type as TypeRef | null);
    }
    for (const [name, t] of nameFields) nameFaces.set(name, t);
    const recvOwner = (obj: Expr): string | null => {
      const viaLit = literalFaceType(obj, faceTyped);
      if (viaLit !== null) return viaLit;
      if (obj.kind === "ident") return typed.get(obj.name) ?? nameFaces.get(obj.name) ?? null;
      if (obj.kind === "index") return recvElem(obj);
      return obj.kind === "call" ? valueCtorType(obj) ?? chainRecvFace(obj, recvOwner) : null;
    };
    const recvChain = (obj: Expr): string | null => (obj.kind === "call" ? chainRecvFace(obj, recvOwner) : null);

    const calls: Extract<Expr, { kind: "call" }>[] = [];
    const staticCallees = new Set<Expr>();
    const varDecls: Extract<Stmt, { kind: "var" }>[] = [];
    const assigned = new Set<string>();

    const walkExpr = (e: Expr): void => {
      switch (e.kind) {
        case "attribute":
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
          if (e.callee.kind === "attribute" && e.callee.obj.kind === "ident" &&
              (e.callee.obj.name in STATIC_FACE || BUILTIN_NEW_ABSENT_FACES.has(e.callee.obj.name))) {
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
      if (d.type === null && assigned.has(d.name)) continue;
      const t = valueTypeAnnotation(d.type) ?? (d.type === null ? valueCtorType(d.init) : null);
      if (t !== null) typed.set(d.name, t);
      if (d.type !== null && d.type.kind === "named" && FACE_ANNOTATIONS.has(d.type.name)) faceTyped.set(d.name, d.type.name);
      if (d.type === null && d.init !== null) {
        const inferred = literalFaceType(d.init, new Map());
        if (inferred !== null) faceTyped.set(d.name, inferred);
      }
    }

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "attribute") continue;
      if (callee.obj.kind === "ident" && (callee.obj.name in STATIC_FACE || PACK_TYPE_NAMES.has(callee.obj.name) || classFaceArity(callee.obj.name) !== undefined)) {
        for (const d of staticCallDiags(callee.obj.name, callee.name, e.args.length)) diags.push({ code: d.code, message: d.message, loc: e.loc });
        const clsTable = classFaceArity(callee.obj.name) ?? VALUE_METHOD_ARITY[callee.obj.name];
        const clsSig = callee.name in (clsTable ?? {}) ? clsTable?.[callee.name] : undefined;
        if (STATIC_FACE[callee.obj.name]?.statics[callee.name] === undefined && clsSig !== undefined) {
          for (const d of classFaceArgDiags(e, callee.obj.name, callee.name, argAnn)) diags.push({ code: d.code, message: d.message, loc: e.loc });
          if (e.args.length < clsSig[0]) {
            diags.push({
              code: "value-arity",
              message: `Too few arguments for "${callee.name}()" call. Expected at least ${clsSig[0]} but received ${e.args.length}.`,
              loc: e.loc,
            });
          } else if (e.args.length > clsSig[1]) {
            diags.push({
              code: "value-arity",
              message: `Too many arguments for "${callee.name}()" call. Expected at most ${clsSig[1]} but received ${e.args.length}.`,
              loc: e.loc,
            });
          }
        }
        const bounds = STATIC_FACE[callee.obj.name]?.statics[callee.name];
        if (bounds !== undefined && e.args.length >= bounds[0] && e.args.length <= bounds[1]) {
          const skey = `${callee.obj.name}.${callee.name}`;
          const byPos = new Map<number, Array<{ code: string; message: string }>>();
          const put = (pos: number, code: string, message: string): void => {
            const bucket = byPos.get(pos) ?? [];
            if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
            byPos.set(pos, bucket);
          };
          const wantAt = new Map<number, string>();
          const refuseAt = new Map<number, string[]>();
          const addRefuse = (pos: number, want: string, kinds: readonly string[]): void => {
            wantAt.set(pos, want);
            refuseAt.set(pos, [...(refuseAt.get(pos) ?? []), ...kinds]);
          };
          for (const [pos, refuse, want, also] of STATIC_ARG_AS[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got !== null && refuse.includes(got)) {
              put(pos, "static-arg-pass", `Cannot pass a value of type "${got}" as "${want}".`);
              if (also.includes(got)) {
                put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
              }
            }
            addRefuse(pos, want, refuse);
          }
          for (const [pos, refuse, want] of STATIC_ARG_TYPES[skey] ?? []) {
            const got = literalTypeName(e.args[pos - 1]);
            if (got !== null && refuse.includes(got)) {
              put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${got}".`);
            }
            addRefuse(pos, want, refuse);
          }
          for (const [pos, want] of wantAt) {
            const arg = e.args[pos - 1];
            if (arg === undefined || literalTypeName(arg) !== null) continue;
            const nm = argNameType(arg, argAnn);
            if (nm === null || !(refuseAt.get(pos) ?? []).includes(nm)) continue;
            put(pos, "static-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
          }
          for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
            for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
          }
        }
        continue;
      }
      const chainArgFace = recvChain(callee.obj);
      const litFace = literalFaceType(callee.obj, faceTyped);
      const face = litFace ?? (chainArgFace === "String" || chainArgFace === "StringName" || chainArgFace === "NodePath" ? chainArgFace : null);
      if (face !== null) {
        const fkey = `${face}.${callee.name}`;
        const byPos = new Map<number, Array<{ code: string; message: string }>>();
        const put = (pos: number, code: string, message: string): void => {
          const bucket = byPos.get(pos) ?? [];
          if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
          byPos.set(pos, bucket);
        };
        const namedArg = (arg: Expr | undefined): string | null => argNameType(arg, argAnn);
        for (const [pos, refuse, want, also] of FACE_ARG_AS[fkey] ?? []) {
          const arg = e.args[pos - 1];
          const bad = literalTypeName(arg);
          if (bad !== null) {
            const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
            if (!refuse.includes(bad) && !nullSlot) continue;
            put(pos, "face-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
            if (nullSlot || also.includes(bad)) {
              put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
            }
            continue;
          }
          const named = namedArg(arg);
          if (named === null) continue;
          if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
          put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
        }
        for (const [pos, refuse, want] of FACE_ARG_TYPES[fkey] ?? []) {
          const arg = e.args[pos - 1];
          const bad = literalTypeName(arg);
          if (bad !== null) {
            if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
            put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
            continue;
          }
          const named = namedArg(arg);
          if (named === null) continue;
          if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
          put(pos, "face-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
        }
        for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
          for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
        }
        if (litFace !== null) continue;
      }
      const direct = callee.obj.kind === "ident" ? (typed.get(callee.obj.name) ?? null) : callee.obj.kind === "index" ? recvElem(callee.obj) : valueCtorType(callee.obj);
      const recv = direct ?? recvChain(callee.obj);
      if (recv === null) continue;
      const arity = direct === null ? chainArityFace(recv) : { table: VALUE_METHOD_ARITY[recv] ?? {}, code: "value-arity" };
      const sig = arity === null ? undefined : arity.table[callee.name];
      if (sig === undefined || arity === null) continue;
      const got = e.args.length;
      const ikey = `${recv}.${callee.name}`;
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        if (!bucket.some((d) => d.message === message)) bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      const namedRecvArg = callee.obj.kind === "index"
        ? (): string | null => null
        : (arg: Expr | undefined): string | null => argNameType(arg, argAnn);
      for (const [pos, refuse, want, also] of INSTANCE_ARG_AS[ikey] ?? []) {
        const lit = e.args[pos - 1];
        const bad = lit === undefined ? null : literalTypeName(lit);
        if (bad !== null) {
          const nullSlot = bad === "null" && nullRefusedByValueSlot(want);
          if (!refuse.includes(bad) && !nullSlot) continue;
          put(pos, "instance-arg-pass", `Cannot pass a value of type "${bad}" as "${want}".`);
          if (nullSlot || also.includes(bad)) {
            put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          }
          continue;
        }
        const named = namedRecvArg(lit);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && (!faceListHas(refuse, named) || !faceListHas(also, named))) continue;
        put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
      }
      for (const [pos, refuse, want] of INSTANCE_ARG_TYPES[ikey] ?? []) {
        const lit = e.args[pos - 1];
        const bad = lit === undefined ? null : literalTypeName(lit);
        if (bad !== null) {
          if (!refuse.includes(bad) && !(bad === "null" && nullRefusedByValueSlot(want))) continue;
          put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${bad}".`);
          continue;
        }
        const named = namedRecvArg(lit);
        if (named === null) continue;
        if (!objectNameRefusedByValueSlot(named, want) && !faceListHas(refuse, named)) continue;
        put(pos, "instance-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${named}".`);
      }
      for (const pos of [...byPos.keys()].sort((x, y) => x - y)) {
        for (const d of byPos.get(pos)!) diags.push({ code: d.code, message: d.message, loc: e.loc });
      }
      if (got >= sig[0] && got <= sig[1]) continue;
      diags.push({
        code: arity.code,
        message:
          got < sig[0]
            ? `Too few arguments for "${callee.name}()" call. Expected at least ${sig[0]} but received ${got}.`
            : `Too many arguments for "${callee.name}()" call. Expected at most ${sig[1]} but received ${got}.`,
        loc: e.loc,
      });
    }

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

    for (const e of calls) {
      const callee = e.callee;
      if (callee.kind !== "ident") continue;
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
      const spec = GLOBAL_ARG_TYPES[callee.name];
      const follows = ARG_TYPE_FOLLOWS_FIRST[callee.name];
      const shouldRows = GLOBAL_ARG_SHOULD_BE[callee.name];
      const sentenceRows = GLOBAL_ARG_SENTENCE[callee.name];
      const asRows = GLOBAL_ARG_AS[callee.name];
      const hasLiteralTable = spec !== undefined || follows !== undefined || shouldRows !== undefined || sentenceRows !== undefined || asRows !== undefined;
      const typedName = GLOBAL_TYPED_NAME_ARGS[callee.name];
      if (typedName !== undefined) {
        const tb = GLOBAL_CALLABLES[callee.name]?.bounds ?? null;
        if (tb === null || (e.args.length >= tb[0] && e.args.length <= tb[1])) {
          for (const [pos, want, accept] of typedName) {
            const arg = e.args[pos - 1];
            if (arg === undefined) continue;
            const lit = literalTypeName(arg);
            if (lit !== null && hasLiteralTable) continue;
            const nm = lit ?? argNameType(arg, argAnn);
            if (nm === null || accept.includes(nm)) continue;
            diags.push({ code: "global-arg-type", message: `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`, loc: e.loc });
          }
        }
      }
      const bounds = GLOBAL_CALLABLES[callee.name]?.bounds ?? null;
      if (bounds === null || e.args.length < bounds[0] || e.args.length > bounds[1]) continue;
      if (spec === undefined && follows === undefined && shouldRows === undefined && sentenceRows === undefined && asRows === undefined) {
        continue;
      }
      const shouldPos = new Set<number>();
      for (const shouldRow of shouldRows ?? []) shouldPos.add(shouldRow[0]);
      const suppress = GLOBAL_ARG_SUPPRESS_OTHER[callee.name];
      const byPos = new Map<number, Array<{ code: string; message: string }>>();
      const put = (pos: number, code: string, message: string): void => {
        const bucket = byPos.get(pos) ?? [];
        bucket.push({ code, message });
        byPos.set(pos, bucket);
      };
      const followContainer = (callee.name === "clamp" || callee.name === "lerp" || callee.name === "wrap") &&
        e.args.some((a) => { const k = literalTypeName(a); return k === "Array" || k === "Dictionary"; });
      const wants: Array<[number, "int" | "float" | "bool"]> = spec ? spec.map(([p, t]) => [p, t] as [number, "int" | "float"]) : [];
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
      const boolFixed = new Set(GLOBAL_ARG_BOOL_REFUSED[callee.name] ?? []);
      const refusesBool = (pos: number): boolean => boolFixed.has(pos) || boolFollows?.has(pos) === true;
      let firstLiteralHit: { pos: number; got: string } | null = null;
      for (const [pos, want] of wants) {
        if (followContainer) continue;
        const a = e.args[pos - 1];
        if (a === undefined || shouldPos.has(pos)) continue;
        if (suppress !== undefined && suppress[0] === pos) {
          const other = e.args.some((x, i) => i !== pos - 1 && suppress[1].includes(literalTypeName(x) ?? ""));
          if (other) continue;
        }
        const lit = literalTypeName(a);
        const got =
          want === "bool"
            ? lit === "int" || lit === "float"
              ? lit
              : null
            : nonNumericLiteral(a) ?? (refusesBool(pos) && lit === "bool" ? "bool" : null) ??
              (CUBIC_NAME_ARG_FUNCS.has(callee.name) && lit === null ? nameArgBad(a, argAnn, want) : null);
        if (got === null || got === want) continue;
        if (firstLiteralHit === null || pos < firstLiteralHit.pos) firstLiteralHit = { pos, got };
      }
      if (firstLiteralHit !== null) {
        const wantOf = wants.find(([p]) => p === firstLiteralHit.pos) as [number, "int" | "float" | "bool"];
        put(firstLiteralHit.pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${firstLiteralHit.pos} should be "${wantOf[1]}" but is "${firstLiteralHit.got}".`);
      }
      if (spec !== undefined && GLOBAL_NUM_ARITH.has(callee.name)) {
        for (const [pos, want] of spec) {
          if (want !== "float" && want !== "int") continue;
          const arg = e.args[pos - 1];
          if (arg === undefined || literalTypeName(arg) !== null) continue;
          const nm = argNameType(arg, argAnn);
          if (nm === null || nm === "bool" || nm === "int" || nm === "float") continue;
          put(pos, "global-arg-type", `Invalid argument for "${callee.name}()" function: argument ${pos} should be "${want}" but is "${nm}".`);
        }
      }
      const firstKind = literalTypeName(e.args[0]);
      const sentenceRowsList = sentenceRows;
      const snappedValueBad = callee.name === "snapped" && firstKind !== null &&
        sentenceRowsList !== undefined && sentenceRowsList.some(([p, r]) => p === 1 && r.includes(firstKind));
      const snappedContainer = callee.name === "snapped" &&
        e.args.some((a) => { const k = literalTypeName(a); return k === "Array" || k === "Dictionary"; });
      for (const [pos, refuse, sentence, unlessFirst] of sentenceRows ?? []) {
        if (snappedContainer || (snappedValueBad && pos > 1)) continue;
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
      for (const [want, pos, refuse] of DERIVED_ARG_TYPES[callee.name] ?? []) {
        if (followContainer || firstKind !== want) continue;
        const got = literalTypeName(e.args[pos - 1]);
        if (got === null || !refuse.includes(got)) continue;
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

const NUMERIC_VALUE_CTORS = new Set(["Vector2", "Vector2i", "Vector3", "Vector3i", "Vector4", "Vector4i", "Color"]);

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
  if (e.kind === "call" && e.callee.kind === "ident" && (NUMERIC_VALUE_CTORS.has(e.callee.name) || PACK_TYPE_NAMES.has(e.callee.name))) return e.callee.name;
  return null;
}

function numericLiteralKind(e: Expr): "int" | "float" | null {
  if (e.kind !== "lit") return null;
  if (e.lit === "int") return "int";
  if (e.lit === "float") return "float";
  return null;
}

let outerNames = new Set<string>();

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
