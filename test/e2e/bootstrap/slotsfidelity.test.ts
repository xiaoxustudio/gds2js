import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { canHold, classSlotNames, ctorArgName, dictSlotOf, funcSlotName, instanceOfTypeArgMessage, isCollText, literalIntArg, namedAppendSource, namedSlotSource, nameArgBad, nullRefusedByValueSlot, objectNameRefusedByValueSlot, packArgScopes, packArgSource, pctArg, pctSlotMessage, pctSlots, scalarSourceName, varSlotHolds } from "../../../packages/compiler/src/analyze/slots";
import type { PctArg, PctSlot } from "../../../packages/compiler/src/analyze/state";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`sl|${label}|`));
const cell = (v: unknown): string => String(v);
const FORMATS = ["%s", "%d", "%*d", "%.3f", "%", "%%", "%c", "%-05v", "a%sb", "%5.2f", "%-+u*x"];

function pctText(fmt: string): string {
  return pctSlots(fmt)
    .map((s) => (s.kind === "conv" ? `c:${s.ch}` : s.kind === "star" ? "*" : "tail"))
    .join(", ");
}

function argText(a: PctArg | null): string {
  if (a === null) return "null";
  return `${String(a.num)}:${String(a.neg)}:${String(a.vec)}:${a.text === null ? "null" : a.text}`;
}

describe("bootstrap · analyze/slots 纯判据与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("coll")).toBeDefined();
  });

  it("② isCollText 七形", () => {
    const want = ["Array[int]", "Dictionary[String, int]", "Array[Array[int]]", "int", "Array[]", "Array[int", "Color"].map((n) => cell(isCollText(n)));
    expect(row("coll")).toBe(["sl", "coll", ...want].join("|"));
  });

  it("② scalarSourceName 四形", () => {
    const want = [
      scalarSourceName("int", new Set<string>()),
      scalarSourceName("Array[int]", new Set<string>()),
      scalarSourceName("Foo", new Set(["Foo"])),
      scalarSourceName("Variant", new Set<string>()),
    ].map(cell);
    expect(row("scalar")).toBe(["sl", "scalar", ...want].join("|"));
  });

  for (const kind of ["int", "bool", "String", "StringName", "Vector2", "Array", "Node"]) {
    it(`② canHold ${kind}`, () => {
      const want = ["int", "Vector2i", "String", "null"].map((st) => cell(canHold(kind, st as never)));
      expect(row(`hold|${kind}`)).toBe(["sl", `hold|${kind}`, ...want].join("|"));
    });
  }

  it("② varSlotHolds 十二形", () => {
    const probes: Array<[string, string]> = [
      ["int", "float"], ["int", "String"], ["int", "Vector2"],
      ["float", "int"], ["float", "null"], ["bool", "int"],
      ["bool", "String"], ["String", "StringName"], ["String", "int"],
      ["Vector2", "Vector2i"], ["StringName", "String"], ["Other", "int"],
    ];
    expect(row("varhold")).toBe(["sl", "varhold", ...probes.map(([s, t]) => cell(varSlotHolds(s, t as never)))].join("|"));
  });

  it("② dictSlotOf", () => {
    const text = (d: { kind: string; decl: string } | null): string => (d === null ? "null" : `${d.kind}:${d.decl}`);
    const want = [dictSlotOf("Dictionary[String, int]"), dictSlotOf("Dictionary"), dictSlotOf("Array[int]"), dictSlotOf("int")].map(text);
    expect(row("dict")).toBe(["sl", "dict", ...want].join("|"));
  });

  it("② funcSlotName 六形", () => {
    const want = [
      funcSlotName({ kind: "named", name: "int" } as never),
      funcSlotName({ kind: "named", name: "Vector2" } as never),
      funcSlotName({ kind: "named", name: "Rect2" } as never),
      funcSlotName({ kind: "named", name: "Foo" } as never),
      funcSlotName(null),
      funcSlotName({ kind: "array" } as never),
    ].map(cell);
    expect(row("funcslot")).toBe(["sl", "funcslot", ...want].join("|"));
  });

  it("② literalIntArg 四形", () => {
    const want = [
      literalIntArg({ kind: "lit", lit: "int", value: 5 } as never),
      literalIntArg({ kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 7 } } as never),
      literalIntArg({ kind: "lit", lit: "float", value: 1.5 } as never),
      literalIntArg({ kind: "ident", name: "x" } as never),
    ].map(cell);
    expect(row("intarg")).toBe(["sl", "intarg", ...want].join("|"));
  });

  for (const f of FORMATS) {
    it(`② pctSlots ${f}`, () => {
      expect(row(`pct|${f}`)).toBe(["sl", `pct|${f}`, pctText(f)].join("|"));
    });
  }

  it("② nullRefusedByValueSlot 三形", () => {
    const want = ["int", "Callable", "Foo"].map((w) => cell(nullRefusedByValueSlot(w)));
    expect(row("nullref")).toBe(["sl", "nullref", ...want].join("|"));
  });

  it("② objectNameRefusedByValueSlot 四形", () => {
    const want = [
      objectNameRefusedByValueSlot("Callable", "int"),
      objectNameRefusedByValueSlot("Callable", "Foo"),
      objectNameRefusedByValueSlot(null, "int"),
      objectNameRefusedByValueSlot("Node", "Array"),
    ].map(cell);
    expect(row("objref")).toBe(["sl", "objref", ...want].join("|"));
  });

  it("② pctArg 十二形", () => {
    const args = [
      { kind: "lit", lit: "int", value: 5n },
      { kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 1n } },
      { kind: "lit", lit: "float", value: 1.5 },
      { kind: "lit", lit: "string", value: "a" },
      { kind: "lit", lit: "string", value: "ab" },
      { kind: "lit", lit: "bool", value: true },
      { kind: "lit", lit: "null" },
      { kind: "unary", op: "-", operand: { kind: "ident", name: "x" } },
      { kind: "call", callee: { kind: "ident", name: "Vector2" }, args: [] },
      { kind: "call", callee: { kind: "ident", name: "Color" }, args: [] },
      { kind: "call", callee: { kind: "ident", name: "f" }, args: [] },
      { kind: "ident", name: "x" },
    ];
    const want = args.map((a) => argText(pctArg(a as never)));
    expect(row("pctarg")).toBe(["sl", "pctarg", ...want].join("|"));
  });

  it("② pctSlotMessage 十三形", () => {
    const argInt = pctArg({ kind: "lit", lit: "int", value: 5n } as never)!;
    const argNeg = pctArg({ kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 5n } } as never)!;
    const argOne = pctArg({ kind: "lit", lit: "string", value: "a" } as never)!;
    const argAb = pctArg({ kind: "lit", lit: "string", value: "ab" } as never)!;
    const argVec = pctArg({ kind: "call", callee: { kind: "ident", name: "Vector2" }, args: [] } as never)!;
    const pairs: Array<[PctSlot, PctArg]> = [
      [{ kind: "tail" }, argInt],
      [{ kind: "star" }, argInt],
      [{ kind: "star" }, argAb],
      [{ kind: "conv", ch: "s" }, argInt],
      [{ kind: "conv", ch: "c" }, argInt],
      [{ kind: "conv", ch: "c" }, argNeg],
      [{ kind: "conv", ch: "c" }, argOne],
      [{ kind: "conv", ch: "c" }, argAb],
      [{ kind: "conv", ch: "v" }, argVec],
      [{ kind: "conv", ch: "v" }, argInt],
      [{ kind: "conv", ch: "d" }, argInt],
      [{ kind: "conv", ch: "d" }, argAb],
      [{ kind: "conv", ch: "q" }, argInt],
    ];
    const want = pairs.map(([slot, arg]) => cell(pctSlotMessage(slot, arg)));
    expect(row("pctmsg")).toBe(["sl", "pctmsg", ...want].join("|"));
  });

  it("② instanceOfTypeArgMessage 八形", () => {
    const lit1 = { kind: "lit", lit: "int", value: 1n };
    const lit2 = { kind: "lit", lit: "int", value: 2n };
    const neg5 = { kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 5n } };
    const lit = (v: bigint): unknown => ({ kind: "lit", lit: "int", value: v });
    const call = (args: unknown[]): unknown => ({ kind: "call", args });
    const want = [
      call([lit1, lit2]),
      call([lit1, neg5]),
      call([lit1, lit(39n)]),
      call([lit1, lit(38n)]),
      call([lit1, lit(0n)]),
      call([{ kind: "lit", lit: "float", value: 1.5 }, lit2]),
      call([lit1, { kind: "ident", name: "x" }]),
      call([lit1]),
    ].map((c) => cell(instanceOfTypeArgMessage(c as never)));
    expect(row("insty")).toBe(["sl", "insty", ...want].join("|"));
  });

  it("② namedAppendSource 四形", () => {
    const want = [
      namedAppendSource("x", new Map([["x", "Array[int]"]])),
      namedAppendSource("y", new Map([["y", "Foo"]])),
      namedAppendSource("z", new Map([["z", "String"]])),
      namedAppendSource(null, new Map()),
    ].map(cell);
    expect(row("nappend")).toBe(["sl", "nappend", ...want].join("|"));
  });

  it("② namedSlotSource 三形", () => {
    const want = [
      namedSlotSource({ kind: "ident", name: "x" } as never, new Map([["x", "Array[int]"]])),
      namedSlotSource({ kind: "ident", name: "y" } as never, new Map([["y", "Foo"]])),
      namedSlotSource({ kind: "lit" } as never, new Map([["x", "int"]])),
    ].map(cell);
    expect(row("nslot")).toBe(["sl", "nslot", ...want].join("|"));
  });

  it("② packArgSource 九形", () => {
    const lit = (l: string, v?: unknown): unknown => ({ kind: "lit", lit: l, value: v });
    const exprs = [
      lit("int", 1n), lit("float", 1.5), lit("string", "a"),
      { kind: "array", items: [] }, { kind: "dict", entries: [] },
      { kind: "call", callee: { kind: "ident", name: "Vector2" } },
      { kind: "call", callee: { kind: "ident", name: "int" } },
      { kind: "binary", op: "+", left: lit("string", "a"), right: lit("string", "b") },
      { kind: "binary", op: "+", left: lit("int", 1n), right: lit("string", "b") },
    ];
    const want = exprs.map((e) => cell(packArgSource(e as never)));
    expect(row("packsrc")).toBe(["sl", "packsrc", ...want].join("|"));
  });

  it("② packArgScopes", async () => {
    const src = "var a: Array[int] = []\nfunc f(p: Array[int]):\n\tvar q: Vector2 = Vector2()\nclass K:\n\tvar e: String\n\tfunc g():\n\t\tpass\n";
    const mod = lower(await parseSource(src));
    const parts = packArgScopes(mod).map((s) => [...s.base.keys()].sort().join(", "));
    expect(row("packscope")).toBe(`sl|packscope|${parts.join(";")}`);
  });

  it("② ctorArgName 五形", () => {
    const lit = { kind: "lit", lit: "int", value: 1n };
    const want = [
      ctorArgName(lit as never, new Map()),
      ctorArgName({ kind: "ident", name: "x" } as never, new Map([["x", "Vector2"]])),
      ctorArgName({ kind: "ident", name: "TYPE_INT" } as never, new Map()),
      ctorArgName({ kind: "ident", name: "TYPE_NOPE" } as never, new Map()),
      ctorArgName({ kind: "array", items: [] } as never, new Map()),
    ].map(cell);
    expect(row("ctorname")).toBe(["sl", "ctorname", ...want].join("|"));
  });

  it("② nameArgBad 四形", () => {
    const want = [
      nameArgBad({ kind: "ident", name: "x" } as never, new Map([["x", "Vector2"]]), "String"),
      nameArgBad({ kind: "ident", name: "x" } as never, new Map([["x", "int"]]), "String"),
      nameArgBad({ kind: "ident", name: "x" } as never, new Map([["x", "String"]]), "String"),
      nameArgBad({ kind: "ident", name: "y" } as never, new Map([["x", "Vector2"]]), "String"),
    ].map(cell);
    expect(row("namebad")).toBe(["sl", "namebad", ...want].join("|"));
  });

  it("② classSlotNames", async () => {
    const mod = lower(await parseSource("class A:\n\tclass B:\n\t\tpass\nclass C:\n\tpass\n"));
    const out = classSlotNames(mod, new Set(["g1", "a"]));
    expect(row("slotnames")).toBe(`sl|slotnames|${[...out].sort().join(", ")}`);
  });

  it("② 收尾", () => {
    expect(row("ant")).toBeUndefined();
  });
});