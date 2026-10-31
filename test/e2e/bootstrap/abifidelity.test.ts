import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { abiFormOk, collectBinds, containerSlot, declaredCast, elemKindFromInit, keyKindOk, litBinaryFitsRaw, propSlot, rawElemTs, rawIntLit, sameAbis, scalarLitKind, seedParamBinds, slotElemKindName, slotTypeName, staticVarSlotsLiteral } from "../../../packages/compiler/src/emit/abi";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`ab|${label}|`));
const cell = (v: unknown): string => String(v);

const litint = (v: number): unknown => ({ kind: "lit", lit: "int", value: v });
const litfloat = (v: number): unknown => ({ kind: "lit", lit: "float", value: v });
const litstr = (v: string): unknown => ({ kind: "lit", lit: "string", value: v });
const arr = (items: unknown[]): unknown => ({ kind: "array", items });

describe("bootstrap · emit/abi 判据与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctxOrSkip) => {
    if (lines.length === 0) ctxOrSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("stvarlit")).toBeDefined();
  });

  it("② staticVarSlotsLiteral", () => {
    const vars = [{ name: "a", isStatic: true }, { name: "b", isStatic: false }] as never[];
    const want = [staticVarSlotsLiteral("Cls", vars), staticVarSlotsLiteral("Cls", [vars[1]!])].map(cell);
    expect(row("stvarlit")).toBe(["ab", "stvarlit", ...want].join("|"));
  });

  it("② propSlot", () => {
    const want = [
      propSlot({ name: "x", accessor: null } as never),
      propSlot({ name: "y", accessor: { getter: null }, init: litint(1) } as never),
      propSlot({ name: "z", accessor: { getter: { kind: "method" } }, init: null } as never),
      propSlot({ name: "w", accessor: { getter: { kind: "method" } }, init: litint(1) } as never),
    ].map(cell);
    expect(row("propslot")).toBe(["ab", "propslot", ...want].join("|"));
  });

  it("② collectBinds", () => {
    const out = seedParamBinds([{ name: "p" } as never]);
    collectBinds({ kind: "for", var: "i", params: [{ name: "q" }], body: [{ kind: "var", name: "v" }, { kind: "bind", name: "w" }] }, out);
    expect(row("binds")).toBe(`ab|binds|${[...out.keys()].sort().join(", ")}`);
  });

  it("② slotTypeName", () => {
    const types = [{ kind: "named", name: "int" }, { kind: "named", name: "Vector2" }, { kind: "named", name: "Array" }, { kind: "named", name: "Foo" }, { kind: "array" }, null];
    expect(row("slottype")).toBe(["ab", "slottype", ...types.map((t) => cell(slotTypeName(t as never)))].join("|"));
  });

  it("② rawElemTs", () => {
    const want = ["int", "int[]", "str[]", "float[]"].map((k) => cell(rawElemTs(k as never)));
    expect(row("rawts")).toBe(["ab", "rawts", ...want].join("|"));
  });

  it("② scalarLitKind", () => {
    const exprs = [litint(1), litfloat(1.5), litstr("a"), { kind: "lit", lit: "bool", value: true }, { kind: "lit", lit: "null" }, { kind: "ident", name: "x" }];
    expect(row("scalarlit")).toBe(["ab", "scalarlit", ...exprs.map((e) => cell(scalarLitKind(e as never)))].join("|"));
  });

  it("② elemKindFromInit", () => {
    const probes: Array<[unknown, boolean]> = [
      [arr([]), false],
      [arr([litint(1), litint(2)]), false],
      [arr([litint(1), litfloat(1.5)]), false],
      [arr([litstr("a")]), false],
      [arr([arr([litint(1)]), arr([litint(2)])]), true],
      [arr([arr([litint(1)]), arr([litstr("a")])]), true],
      [arr([{ kind: "ident", name: "x" }]), false],
    ];
    const want = probes.map(([a, nested]) => cell(elemKindFromInit(a as never, nested)));
    expect(row("elemkind")).toBe(["ab", "elemkind", ...want].join("|"));
  });

  it("② keyKindOk", () => {
    const want = ["int", "str", "float", "bool", null].map((k) => cell(keyKindOk(k as never)));
    expect(row("keykind")).toBe(["ab", "keykind", ...want].join("|"));
  });

  it("② slotElemKindName", () => {
    ctx.SCRIPT_BASE.set("MyScript", "Node");
    const want = ["int", "Vector2", "MyScript", "Foo"].map((n) => cell(slotElemKindName(n)));
    expect(row("slelem")).toBe(["ab", "slelem", ...want].join("|"));
  });

  it("② containerSlot", () => {
    const want = [
      containerSlot("c", litint(1) as never, null, "assignContainer"),
      containerSlot("c", arr([]) as never, "Array[int]", "assignContainer"),
      containerSlot("c", { kind: "dict" } as never, "Dictionary[String, int]", "returnContainer"),
      containerSlot("c", litint(1) as never, "int", "returnContainer"),
    ].map(cell);
    expect(row("cont")).toBe(["ab", "cont", ...want].join("|"));
  });

  it("② declaredCast", () => {
    const types = [{ kind: "named", name: "int" }, { kind: "named", name: "Vector2" }, { kind: "named", name: "Array" }, { kind: "named", name: "StringName" }, { kind: "named", name: "Foo" }, { kind: "array" }, null];
    expect(row("cast")).toBe(["ab", "cast", ...types.map((t) => cell(declaredCast(t as never)))].join("|"));
  });

  it("② rawIntLit", () => {
    const want = [rawIntLit(litint(5) as never), rawIntLit(litfloat(1.5) as never), rawIntLit({ kind: "ident", name: "x" } as never)].map(cell);
    expect(row("rawlit")).toBe(["ab", "rawlit", ...want].join("|"));
  });

  it("② litBinaryFitsRaw", () => {
    const expr = (op: string, l: unknown, r: unknown): unknown => ({ kind: "binary", op, left: l, right: r });
    const want = [
      litBinaryFitsRaw(expr("+", litint(1), litint(2)) as never),
      litBinaryFitsRaw(expr("+", litint(9007199254740991), litint(1)) as never),
      litBinaryFitsRaw(expr("-", litint(9007199254740991), litint(1)) as never),
      litBinaryFitsRaw(expr("*", litint(2), litint(3)) as never),
      litBinaryFitsRaw(expr("*", litint(3037000500), litint(3037000500)) as never),
      litBinaryFitsRaw(expr("+", litfloat(1.5), litint(2)) as never),
      litBinaryFitsRaw(expr("/", litint(9), litint(3)) as never),
    ].map(cell);
    expect(row("litfit")).toBe(["ab", "litfit", ...want].join("|"));
  });

  it("② abiFormOk", () => {
    const ret = { kind: "return", value: litint(1) };
    const f = (over: Record<string, unknown>): unknown => ({ coroutine: false, isStatic: false, returnType: null, params: [], body: [ret], ...over });
    const want = [
      abiFormOk(f({}) as never),
      abiFormOk(f({ coroutine: true }) as never),
      abiFormOk(f({ isStatic: true }) as never),
      abiFormOk(f({ body: [] }) as never),
      abiFormOk(f({ params: [{ type: { kind: "named", name: "int" } }] }) as never),
      abiFormOk(f({ body: [{ kind: "var", name: "v", type: null }, { kind: "assign", target: { kind: "ident", name: "v" } }, ret] }) as never),
      abiFormOk(f({ body: [{ kind: "assign", target: { kind: "attribute", name: "x", obj: { kind: "ident", name: "self" } } }, ret] }) as never),
      abiFormOk(f({ body: [{ kind: "var", name: "v", type: null }] }) as never),
    ].map(cell);
    expect(row("formok")).toBe(["ab", "formok", ...want].join("|"));
  });

  it("② sameAbis", () => {
    const m = (ret: string): Map<string, { ret: string }> => new Map([["f", { ret }]]);
    const want = [sameAbis(m("int") as never, m("int") as never), sameAbis(m("int") as never, m("float") as never), sameAbis(m("int") as never, new Map() as never), sameAbis(new Map() as never, new Map() as never)].map(cell);
    expect(row("sameabis")).toBe(["ab", "sameabis", ...want].join("|"));
  });
});
