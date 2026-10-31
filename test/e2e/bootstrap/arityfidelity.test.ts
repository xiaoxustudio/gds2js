import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { arityDiag, builtinArity, builtinArityCode, builtinInstanceAbsent, chainArityFace, classFaceArity, faceCtorLiteral, faceListHas, instanceFaceManaged, instanceMemberAbsent, memberNameAbsent, staticBareDiags, staticCallDiags, utilityArity, valueCtorType } from "../../../packages/compiler/src/analyze/arity";
import { ARRAY_METHOD_ARITY } from "@gds2js/runtime/runtime/face-arity";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`ar|${label}|`));
const cell = (v: unknown): string => String(v);

describe("bootstrap · analyze/arity 判据与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctxOrSkip) => {
    if (lines.length === 0) ctxOrSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("classface")).toBeDefined();
  });

  it("② classFaceArity 六形", () => {
    const want = ["Array", "String", "StringName", "NodePath", "Dictionary", "Foo"].map((t) => (classFaceArity(t) === undefined ? "null" : "table"));
    expect(row("classface")).toBe(["ar", "classface", ...want].join("|"));
  });

  it("② faceListHas 四形", () => {
    const list = ["int", "String"];
    const want = ["int", "String", "Array[int]", "Vector2"].map((t) => cell(faceListHas(list, t)));
    expect(row("listhas")).toBe(["ar", "listhas", ...want].join("|"));
  });

  it("② arityDiag 四形", () => {
    const loc = { line: 1 };
    const text = (d: { message: string } | null): string => (d === null ? "null" : d.message);
    const want = [
      text(arityDiag(ARRAY_METHOD_ARITY, "array-arity", "append", 3, loc as never)),
      text(arityDiag(ARRAY_METHOD_ARITY, "array-arity", "append", -1, loc as never)),
      text(arityDiag(ARRAY_METHOD_ARITY, "array-arity", "has", 2, loc as never)),
      text(arityDiag(ARRAY_METHOD_ARITY, "array-arity", "zzz", 1, loc as never)),
    ].map(cell);
    expect(row("diag")).toBe(["ar", "diag", ...want].join("|"));
  });

  it("② memberNameAbsent 三形", () => {
    const want = [memberNameAbsent("Array", "append"), memberNameAbsent("Array", "nope"), memberNameAbsent("Foo", "x")].map(cell);
    expect(row("memberabsent")).toBe(["ar", "memberabsent", ...want].join("|"));
  });

  it("② chainArityFace 五形", () => {
    const want = ["String", "StringName", "NodePath", "Vector2", "Foo"].map((face) => {
      const r = chainArityFace(face)!;
      return `${r.code}:${String(Object.keys(r.table).length)}`;
    });
    expect(row("chainface")).toBe(["ar", "chainface", ...want].join("|"));
  });

  it("② instanceFaceManaged 五形", () => {
    const want = ["Array", "Dictionary", "Node", "Foo", "PackedByteArray"].map((f) => cell(instanceFaceManaged(f)));
    expect(row("managed")).toBe(["ar", "managed", ...want].join("|"));
  });

  it("② instanceMemberAbsent 五形", () => {
    const want = [["Node", "get_name"], ["Node", "nope"], ["Array", "append"], ["String", "nope"], ["Foo", "x"]].map(([f, n]) => cell(instanceMemberAbsent(f!, n!)));
    expect(row("imabsent")).toBe(["ar", "imabsent", ...want].join("|"));
  });

  it("② builtinInstanceAbsent 三形", () => {
    const want = [["Node", "get_name"], ["Node", "nope"], ["Foo", "x"]].map(([f, n]) => cell(builtinInstanceAbsent(f!, n!)));
    expect(row("babsent")).toBe(["ar", "babsent", ...want].join("|"));
  });

  it("② faceCtorLiteral 四形", () => {
    const call = (name: string, args: unknown[]): unknown => ({ kind: "call", callee: { kind: "ident", name }, args });
    const want = [
      faceCtorLiteral(call("StringName", [{ kind: "lit", lit: "string", value: "x" }]) as never),
      faceCtorLiteral(call("NodePath", [{ kind: "lit", lit: "string", value: "p" }]) as never),
      faceCtorLiteral(call("StringName", [{ kind: "lit", lit: "int", value: 1 }]) as never),
      faceCtorLiteral({ kind: "ident", name: "StringName" } as never),
    ].map(cell);
    expect(row("fctor")).toBe(["ar", "fctor", ...want].join("|"));
  });

  it("② builtinArity 四形", () => {
    const want = [builtinArity("abs", 0), builtinArity("abs", 1), builtinArity("abs", 2), builtinArity("zzz", 1)].map(cell);
    expect(row("barity")).toBe(["ar", "barity", ...want].join("|"));
  });

  it("② utilityArity 六形", () => {
    const want = [utilityArity("range", 0), utilityArity("range", 1), utilityArity("range", 4), utilityArity("str", 0), utilityArity("str", 3), utilityArity("zzz", 1)].map(cell);
    expect(row("uarity")).toBe(["ar", "uarity", ...want].join("|"));
  });

  it("② builtinArityCode 八形", () => {
    const want = ["char", "var_to_str", "str_to_var", "convert", "type_convert", "range", "str", "print"].map((n) => builtinArityCode(n));
    expect(row("code")).toBe(["ar", "code", ...want].join("|"));
  });

  it("② valueCtorType 三形", () => {
    const want = [
      valueCtorType({ kind: "call", callee: { kind: "ident", name: "Vector2" } } as never),
      valueCtorType({ kind: "call", callee: { kind: "ident", name: "int" } } as never),
      valueCtorType({ kind: "ident", name: "Vector2" } as never),
    ].map(cell);
    expect(row("vctor")).toBe(["ar", "vctor", ...want].join("|"));
  });

  it("② staticCallDiags 七形", () => {
    const t = (arr: Array<{ code: string; message: string }>): string => arr.map((d) => d.code + ":" + d.message).join(";");
    const want = [
      staticCallDiags("Vector2", "ZERO", 0),
      staticCallDiags("Vector2", "AXIS_X", 0),
      staticCallDiags("Vector2", "from_angle", 1),
      staticCallDiags("Vector2", "from_angle", 2),
      staticCallDiags("Vector2", "angle", 0),
      staticCallDiags("Vector2", "zzz", 0),
      staticCallDiags("Foo", "zzz", 0),
    ].map(t);
    expect(row("scall")).toBe(["ar", "scall", ...want].join("|"));
  });

  it("② staticBareDiags 五形", () => {
    const t = (arr: Array<{ code: string; message: string }>): string => arr.map((d) => d.code + ":" + d.message).join(";");
    const want = [
      staticBareDiags("Node", "new"),
      staticBareDiags("Node", "get_name"),
      staticBareDiags("Vector2", "ZERO"),
      staticBareDiags("Vector2", "zzz"),
      staticBareDiags("Foo", "new"),
    ].map(t);
    expect(row("sbare")).toBe(["ar", "sbare", ...want].join("|"));
  });
});
