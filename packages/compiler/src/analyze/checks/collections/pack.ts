import type { Diagnostic } from "../../analysis-result";
import { ANNOT_SOURCES, OBJECT_ARG_NAMES, PACK_APPEND_ARRAY_AS, PACK_ARG_POSITIONS, PACK_ARG_SLOTS, PACK_BOOL_SLOT_OK, PACK_INT_SLOT_OK, PACK_IS_AS_NAMES, PACK_TYPE_NAMES, VALUE_ARG_WANTS } from "../../../semantics/elem-faces";
import { ARRAY_METHOD_ARITY, NODE_PATH_METHOD_ARITY, STRING_METHOD_ARITY, STRING_NAME_METHOD_ARITY, VALUE_METHOD_ARITY, valueAttrKind } from "@gds2js/runtime/runtime/face-arity";
import type { ClassDecl, Expr, Module, Stmt, TypeRef } from "../../../lower/ir";
import { diKey, run } from "../../state";
import { reassignedNames, walkExprKinds } from "../../walk";
import { namedAppendSource, namedSlotSource, packArgScopes, packArgSource } from "../../slots";
import { argFaceBase, attrFaceRecv, attrScopes, chainRecvFace, packFaceRecv, readFaceOf, staticTypeName, stringNameVars } from "../../faces";
import { instanceFaceManaged, instanceMemberAbsent, memberNameAbsent } from "../../arity";

export function checkPackIsAs(m: Module, diags: Diagnostic[]): void {
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

export function checkPackArgSlots(m: Module, diags: Diagnostic[]): void {
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

export function checkPackFaceNames(m: Module, diags: Diagnostic[]): void {
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
          if (l !== undefined && bounds !== undefined) run.boundFaces.set(diKey(run, l.line, l.col), face + "," + String(bounds[0]) + "," + String(bounds[1]));
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
