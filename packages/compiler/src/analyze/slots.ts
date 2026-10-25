import { staticMemberFn } from "../lower/ir";
import { ELEM_FACES, NATIVE_CLASS_SLOTS } from "../semantics/elem-faces";
import type { AnalysisResult, Diagnostic } from "../analyze/analysis-result";
import { BUILTIN_ARITY, BUILTIN_INSTANCE_MEMBERS, BUILTIN_INSTANCE_PROPS, BUILTIN_MEMBER_TYPES, BUILTIN_METHOD_RETURNS, BUILTIN_NEW_ABSENT_FACES, BUILTIN_TYPE_NAMES, FACE_CTOR_LITERAL, JOIN_BAD_ARG, UTILITY_ARITY } from "../semantics/builtin-members";
import { OP_PAIRS_CONST_A, OP_PAIRS_CONST_B, OP_PAIRS_REFUSED_A, OP_PAIRS_REFUSED_B, OP_PAIRS_REFUSED_CALLABLE, OP_PAIRS_REFUSED_DECL, OP_PAIRS_REFUSED_DECL_VAL, OP_PAIRS_REFUSED_DECL_VAL_REV } from "../semantics/op-pairs";
import { ANNOT_SOURCES, ARG_NAME_TYPES, FACE_ANNOTATIONS, INSTANCE_OF_TYPE_LAST, NUMERIC_VALUE_CTORS, OBJECT_ARG_NAMES, PACK_APPEND_ARRAY_AS, PACK_APPEND_NAMED, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_SHAPE_NAMES, PACK_TYPE_NAMES, PARAM_OWN_SLOTS, PCT_MSG, PCT_NUMERIC, PCT_VALUE_CTORS, PCT_VECTORS, SIGNAL_PARSE_MISSING, STATIC_VALUE_TYPES, VALUE_ARG_WANTS } from "../semantics/elem-faces";
import { CALLABLE_PARSE_ARGS, CALLABLE_PARSE_ARITY, HOST_VALUE_METHODS, NO_HOST_VALUE_METHODS, SIGNAL_PARSE_ARITY_MAX, VIRTUAL_HOST_NAMES, VOID_ARRAY_METHODS, VOID_BYTES_METHODS, VOID_CALLABLE_METHODS, VOID_DICT_METHODS, VOID_OBJECT_METHODS, VOID_SIGNAL_METHODS } from "../semantics/void-methods";
import { CTOR_REFUSED, CUBIC_NAME_ARG_FUNCS, FUNC_ARG_SLOTS, GLOBAL_NUM_ARITH, GLOBAL_TYPED_NAME_ARGS, NODE_PATH_FACE, STATIC_FACE, STRINGNAME_FACE, type NamedFace } from "../semantics/faces";
import { STATIC_ARG_AS, STATIC_ARG_TYPES } from "../semantics/arg-types/static-arg-types";
import { FACE_ARG_AS, FACE_ARG_TYPES } from "../semantics/arg-types/face-arg-types";
import { INSTANCE_ARG_AS, INSTANCE_ARG_TYPES } from "../semantics/arg-types/instance-arg-types";
import { isGlobalConst } from "../lower/globals";
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
} from "../semantics/arg-types/global-arg-types";
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
import { strFloat } from "@gds2js/runtime/runtime/numfmt";
import { COLOR_NAMED } from "@gds2js/runtime/runtime/color-named";
import type { ClassDecl, Expr, FuncDecl, Loc, Module, Param, Pattern, SignalDecl, Stmt, TypeRef, VarDecl } from "../lower/ir";

import { type DictKey, type PctArg, type PctSlot, type StaticType, type TypedSlot, parseTyped } from "./state";
import { flattenBody } from "./walk";
import { typedFaceText } from "./literals";
import { argFaceBase, argNameType, literalTypeName, staticType } from "./faces";
import { faceListHas } from "./arity";
import { checkPackArgSlots } from "./checks-collections";

/** 只认没量的那一族之外的源名：容器、`Variant` 与脚本类名各自走自己那一支（r1..r7 量的是标量与 `null`）。 */
export function scalarSourceName(st: string, classNames: Set<string>): boolean {
  return !isCollText(st) && st !== "Variant" && st !== "Array" && st !== "Dictionary" && !classNames.has(st);
}

/** 标注文本是不是定形容器（嵌套那一形引擎另有句子，不进这一支） */
export function isCollText(name: string): boolean {
  return /^(Array|Dictionary)\[[^\[]+\]$/.test(name);
}

export function canHold(kind: string, st: NonNullable<StaticType>): boolean {
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

export function dictSlotOf(name: string): TypedSlot | null {
  const t = parseTyped(name);
  if (t !== null && t.kind === "Dictionary") return t;
  return name === "Dictionary" ? { decl: name, kind: "Dictionary" } : null;
}

export function varSlotHolds(slot: string, st: NonNullable<StaticType>): boolean | null {
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

export function valueSlotHolds(slot: string, st: NonNullable<StaticType>): boolean {
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

export function instanceOfTypeArgMessage(e: Extract<Expr, { kind: "call" }>): string | null {
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

export function namedAppendSource(name: unknown, ann: Map<string, string>): string | null {
  if (typeof name !== "string") return null;
  const t = ann.get(name);
  if (t === undefined || !PACK_APPEND_NAMED.has(argFaceBase(t))) return null;
  return t.includes("[") ? typedFaceText(t) : t;
}

/** `e` / `i` / `b` 三槽认得的**标注名**来源（S498，尺 `tmp/d6/s497c.py` 一百一十格 + `tmp/d6/s497d.py` 三百九十六格 +
 *  `tmp/d6/s498b.py` 一百三十二格：`NodePath` 与九支 pack 的名字形只回第二句，字面量的 `NodePath` 两句齐发、pack 构造式只第二句；
 *  S501 又量了定形容器标注那一形：也只回第二句，型名印标注规格化后的原文）。 */
export function namedSlotSource(e: Expr, ann: Map<string, string>): string | null {
  if (e.kind !== "ident" || typeof e.name !== "string") return null;
  const t = ann.get(e.name);
  if (t === undefined || !ARG_NAME_TYPES.has(argFaceBase(t))) return null;
  return t.includes("[") ? typedFaceText(t) : t;
}

export function packArgSource(e: Expr): string | null {
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

/** `checkPackArgSlots` 的作用域：每支函数体配一张「名字 → 标注型」的底表 —— 模块级标注打底、内部类字段盖在上面、形参再盖一层
 *  （S494 量齐：pack 的形参拒这一族此前只认模块标注名与函数体内的标注 var，形参标注与内部类字段两形 396 格全放过）。 */
export function packArgScopes(m: Module): Array<{ nodes: Record<string, unknown>[]; base: Map<string, string> }> {
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

export function nullRefusedByValueSlot(want: string): boolean {
  return VALUE_ARG_WANTS.has(want);
}

export function objectNameRefusedByValueSlot(src: string | null, want: string): boolean {
  return src !== null && OBJECT_ARG_NAMES.has(src) && VALUE_ARG_WANTS.has(want);
}

export function pctArg(e: Expr): PctArg | null {
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

export function pctSlots(fmt: string): PctSlot[] {
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

export function pctSlotMessage(slot: PctSlot, arg: PctArg): string | null {
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

export function ctorArgName(a: Expr, argTypes: Map<string, string>): string | null {
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

/** 标注名 → 形参槽名，认不出的一律 null（类名槽不在这里判：`f(null)` 合法，而引擎类名手上没有名单）。 */
export function funcSlotName(t: TypeRef | null): string | null {
  if (t === null || t.kind !== "named") return null;
  const base = t.name.replace(/\[.*\]$/, "");
  return base in FUNC_ARG_SLOTS ? base : null;
}

export function classSlotNames(m: Module, globals: Set<string>): Set<string> {
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

export function foldDictKey(e: Expr): DictKey | null {
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

export function foldDictBinary(op: string, a: DictKey, b: DictKey): DictKey | null {
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

export function slotSource(e: Expr): NonNullable<StaticType> | null {
  if (e.kind === "lit" && e.lit === "string_name") return "StringName";
  return staticType(e);
}

/** 类名直调实例方法时的形参那几句：引擎在非静态那一句之后照说，句子与实例接收者同表（S507，尺 `tmp/d6/s507.py` 一百零五格 = 十面 × 廿一处位子 × 五种实参写法）。
 *  按 `(面.方法, 位)` 查那四张形参表；名字形只回第二句，`null` 与对象型名字按量到的那十三档值型槽判；同一位子被两行命中时同文只发一遍。 */
export function classFaceArgDiags(e: Expr, face: string, method: string, argAnn: Map<string, string>): Array<{ code: string; message: string }> {
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

export function nameArgBad(a: Expr, argAnn: Map<string, string>, want: string): string | null {
  const nm = argNameType(a, argAnn);
  if (nm === null || nm === "int" || nm === "float" || nm === "bool" || nm === want) return null;
  return nm;
}

export function literalIntArg(e: Expr): bigint | null {
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
