import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { argFaceBase, argNameOf, argNameScopes, argNameType, attrFaceRecv, attrScopes, faceReceiverNames, faceScopes, chainFaceKnown, chainRecvFace, holdsParamDefault, knownFaceAnnotation, literalFaceType, literalTypeName, packFaceRecv, readFaceOf, scalarStaticName, staticFaceConstName, staticType, staticTypeName, stringNameVars, valueTypeAnnotation } from "../../../packages/compiler/src/analyze/faces";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { flattenBody } from "../../../packages/compiler/src/analyze/walk";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`fc|${label}|`));
const cell = (v: unknown): string => String(v);

describe("bootstrap · analyze/faces 纯查询与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("read")).toBeDefined();
  });

  it("② readFaceOf 十一形", () => {
    const pairs: Array<[string, string | null]> = [
      ["Array[int]", null], ["Array[int]", "int"], ["Array[int]", "String"], ["Array[Foo]", null], ["Array[Foo]", "int"],
      ["Dictionary[String, int]", null], ["Dictionary[String, int]", "String"], ["Dictionary[String, int]", "int"],
      ["Dictionary[String, Foo]", null], ["int", null], ["Dictionary[String]", null],
    ];
    const want = pairs.map(([d, k]) => cell(readFaceOf(d, k as never)));
    expect(row("read")).toBe(["fc", "read", ...want].join("|"));
  });

  it("② holdsParamDefault 八形", () => {
    const pairs: Array<[string, string]> = [["int", "int"], ["int", "String"], ["String", "NodePath"], ["NodePath", "String"], ["Array", "int"], ["Vector2", "Vector2i"], ["Vector2", "String"], ["Foo", "int"]];
    expect(row("hold")).toBe(["fc", "hold", ...pairs.map(([s, t]) => cell(holdsParamDefault(s, t)))].join("|"));
  });

  it("② scalarStaticName 六形", () => {
    const want = ["Array[int]", "Dictionary[String, int]", "int", "Color", "Foo", "Vector4"].map((n) => cell(scalarStaticName(n)));
    expect(row("scalar")).toBe(["fc", "scalar", ...want].join("|"));
  });

  it("② staticTypeName 九形", () => {
    const exprs = [
      { kind: "lit", lit: "int" }, { kind: "lit", lit: "string" }, { kind: "lit", lit: "string_name" }, { kind: "lit", lit: "null" },
      { kind: "array" }, { kind: "dict" }, { kind: "call", callee: { kind: "ident", name: "Vector2" } },
      { kind: "call", callee: { kind: "ident", name: "int" } }, { kind: "ident", name: "x" },
    ];
    const want = exprs.map((e) => cell(staticTypeName(e as never)));
    expect(row("static")).toBe(["fc", "static", ...want].join("|"));
  });

  it("② argFaceBase 四形", () => {
    const want = ["Array[int]", "Dictionary[String, int]", "int", "Array"].map((n) => argFaceBase(n));
    expect(row("base")).toBe(["fc", "base", ...want].join("|"));
  });

  it("② argNameOf 七形", () => {
    const types = [
      { kind: "named", name: "int" }, { kind: "named", name: "Array[int]" }, { kind: "named", name: "Dictionary[String, int]" },
      { kind: "named", name: "Foo" }, { kind: "named", name: "Array[int" }, { kind: "array" }, null,
    ];
    const want = types.map((t) => cell(argNameOf(t as never)));
    expect(row("argname")).toBe(["fc", "argname", ...want].join("|"));
  });

  it("② staticType 十九形", () => {
    const probes = [
      { kind: "lit", lit: "int" }, { kind: "lit", lit: "float" }, { kind: "lit", lit: "string" }, { kind: "lit", lit: "string_name" },
      { kind: "lit", lit: "node_path" }, { kind: "lit", lit: "bool" }, { kind: "lit", lit: "null" }, { kind: "array" }, { kind: "dict" },
      { kind: "unary", op: "not", operand: { kind: "ident", name: "x" } },
      { kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 1 } },
      { kind: "unary", op: "-", operand: { kind: "ident", name: "x" } },
      { kind: "binary", op: "+", left: { kind: "lit", lit: "int", value: 1 }, right: { kind: "lit", lit: "int", value: 2 } },
      { kind: "binary", op: "+", left: { kind: "lit", lit: "int", value: 1 }, right: { kind: "lit", lit: "float", value: 1.5 } },
      { kind: "binary", op: "+", left: { kind: "lit", lit: "string", value: "a" }, right: { kind: "lit", lit: "int", value: 1 } },
      { kind: "binary", op: "+", left: { kind: "array", items: [] }, right: { kind: "array", items: [] } },
      { kind: "call", callee: { kind: "ident", name: "Vector2" }, args: [] },
      { kind: "call", callee: { kind: "ident", name: "int" }, args: [] },
      { kind: "ident", name: "x" },
    ];
    const want = probes.map((e) => cell(staticType(e as never)));
    expect(row("stype")).toBe(["fc", "stype", ...want].join("|"));
  });

  it("② stringNameVars 三节点", () => {
    const out = new Set<string>();
    stringNameVars({ kind: "if", branches: [{ body: [{ kind: "var", name: "c", type: { kind: "named", name: "StringName" }, loc: { line: 1 } }] }] }, out);
    stringNameVars({ kind: "var", name: "a", type: { kind: "named", name: "StringName" } }, out);
    stringNameVars({ kind: "var", name: "b", type: { kind: "named", name: "int" } }, out);
    expect(row("snv")).toBe(`fc|snv|${[...out].sort().join(", ")}`);
  });

  it("② valueTypeAnnotation 六形", () => {
    const types = [{ kind: "named", name: "int" }, { kind: "named", name: "Vector2" }, { kind: "named", name: "Array" }, { kind: "named", name: "String" }, { kind: "array" }, null];
    expect(row("vta")).toBe(["fc", "vta", ...types.map((t) => cell(valueTypeAnnotation(t as never)))].join("|"));
  });

  it("② literalFaceType 六形", () => {
    const exprs = [{ kind: "lit", lit: "string" }, { kind: "lit", lit: "int" }, { kind: "array" }, { kind: "dict" }, { kind: "ident", name: "x" }, { kind: "ident", name: "y" }];
    const face = new Map([["x", "Foo"]]);
    expect(row("lft")).toBe(["fc", "lft", ...exprs.map((e) => cell(literalFaceType(e as never, face)))].join("|"));
  });

  it("② literalTypeName 十五形", () => {
    const exprs = [
      { kind: "lit", lit: "int" }, { kind: "lit", lit: "float" }, { kind: "lit", lit: "bool" }, { kind: "lit", lit: "null" },
      { kind: "lit", lit: "string" }, { kind: "lit", lit: "string_name" }, { kind: "lit", lit: "node_path" },
      { kind: "array" }, { kind: "dict" }, { kind: "lambda" },
      { kind: "call", callee: { kind: "ident", name: "Vector2" } }, { kind: "call", callee: { kind: "ident", name: "PackedByteArray" } },
      { kind: "call", callee: { kind: "ident", name: "int" } }, { kind: "ident", name: "x" }, undefined,
    ];
    expect(row("ltn")).toBe(["fc", "ltn", ...exprs.map((e) => cell(literalTypeName(e as never)))].join("|"));
  });

  it("② chainFaceKnown 五形", () => {
    const want = ["Vector2", "String", "NodePath", "Color", "Object"].map((rt) => cell(chainFaceKnown(rt)));
    expect(row("cfk")).toBe(["fc", "cfk", ...want].join("|"));
  });

  it("② knownFaceAnnotation 七形", () => {
    const types = [{ kind: "named", name: "Vector2" }, { kind: "named", name: "Array[int]" }, { kind: "named", name: "PackedByteArray" }, { kind: "named", name: "Foo" }, { kind: "named", name: "int" }, { kind: "array" }, null];
    expect(row("kfa")).toBe(["fc", "kfa", ...types.map((t) => cell(knownFaceAnnotation(t as never)))].join("|"));
  });

  it("② packFaceRecv 五形", () => {
    const objs = [{ kind: "ident", name: "x" }, { kind: "ident", name: "y" }, { kind: "call", callee: { kind: "ident", name: "PackedByteArray" } }, { kind: "call", callee: { kind: "ident", name: "int" } }, undefined];
    const ann = new Map([["x", "Vector2"]]);
    expect(row("pfr")).toBe(["fc", "pfr", ...objs.map((o) => cell(packFaceRecv(o as never, ann)))].join("|"));
  });

  it("② attrFaceRecv 十二形", () => {
    const ann = new Map([["x", "Array"], ["v", "Vector2"]]);
    const elems = new Map([["e", "Array[int]"]]);
    const mods = new Map([["y", "Vector2"]]);
    const empty = new Map<string, string>();
    const want = [
      attrFaceRecv({ kind: "ident", name: "x" } as never, ann, empty, mods),
      attrFaceRecv({ kind: "ident", name: "x" } as never, new Map([["x", "Dictionary"]]), empty, empty),
      attrFaceRecv({ kind: "ident", name: "y" } as never, empty, empty, mods),
      attrFaceRecv({ kind: "array" } as never, empty, empty, empty),
      attrFaceRecv({ kind: "lit", lit: "string", value: "s" } as never, empty, empty, empty),
      attrFaceRecv({ kind: "call", callee: { kind: "ident", name: "Vector2" }, args: [] } as never, empty, empty, empty),
      attrFaceRecv({ kind: "call", callee: { kind: "ident", name: "int" }, args: [] } as never, empty, empty, empty),
      attrFaceRecv({ kind: "index", obj: { kind: "ident", name: "e" }, index: { kind: "lit", lit: "int", value: 1 } } as never, empty, elems, empty),
      attrFaceRecv({ kind: "attribute", obj: { kind: "ident", name: "v" }, name: "x" } as never, ann, empty, mods),
      attrFaceRecv({ kind: "lit", lit: "string_name" } as never, empty, empty, empty),
      attrFaceRecv({ kind: "lit", lit: "node_path" } as never, empty, empty, empty),
      attrFaceRecv(undefined, empty, empty, empty),
    ].map(cell);
    expect(row("attr")).toBe(["fc", "attr", ...want].join("|"));
  });

  it("② chainRecvFace 三形", () => {
    const front = { kind: "call", callee: { kind: "attribute", obj: { kind: "ident", name: "a" }, name: "front" } } as never;
    const want = [
      chainRecvFace(front, () => "Array"),
      chainRecvFace(front, () => null),
      chainRecvFace({ kind: "call", callee: { kind: "ident", name: "f" } } as never, () => "Array"),
    ].map(cell);
    expect(row("chain")).toBe(["fc", "chain", ...want].join("|"));
  });

  it("② staticFaceConstName 六形", () => {
    const want = [
      staticFaceConstName("Vector2", "ZERO"),
      staticFaceConstName("Vector2", "from_angle"),
      staticFaceConstName("Vector2", "AXIS_X"),
      staticFaceConstName("Color", "red"),
      staticFaceConstName("Color", "NOPE"),
      staticFaceConstName("Foo", "ZERO"),
    ].map(cell);
    expect(row("sfcn")).toBe(["fc", "sfcn", ...want].join("|"));
  });

  it("② argNameType 四形", () => {
    const want = [
      argNameType({ kind: "ident", name: "x" } as never, new Map([["x", "Vector2"]])),
      argNameType({ kind: "ident", name: "y" } as never, new Map([["x", "Vector2"]])),
      argNameType({ kind: "lit", lit: "int" } as never, new Map()),
      argNameType(undefined, new Map()),
    ].map(cell);
    expect(row("ant")).toBe(["fc", "ant", ...want].join("|"));
  });

  it("② argNameScopes / faceReceiverNames / faceScopes", async () => {
    const src = "var a: Array[int] = []\nvar b = [1]\nvar c = [1]\nfunc f(p: Array[int], q):\n\tvar d = [2]\n\tc = [3]\n\treturn d\nclass K:\n\tvar e: Array[int] = []\n\tfunc g():\n\t\tvar h = [4]\n";
    const m = lower(await parseSource(src));
    const parts = [...argNameScopes(m).values()].map((ann) => [...ann.keys()].sort().map((k) => k + "=" + String(ann.get(k))).join(", "));
    expect(row("anscopes")).toBe(`fc|anscopes|${parts.join(";")}`);
    const nodes = flattenBody(m.funcs[0]!.body);
    const names = faceReceiverNames(nodes, new Map([["a", "annot"], ["b", "inferred"]]), new Set(), "Array", (i) => (i as { kind: string }).kind === "array");
    expect(row("frecv")).toBe(`fc|frecv|${[...names].sort().join(", ")}`);
    const texts = new Map<string, string>();
    faceReceiverNames(nodes, new Map([["a", "annot"]]), new Set(), "Array", (i) => (i as { kind: string }).kind === "array", true, texts);
    const tparts = [...texts.keys()].sort().map((k) => k + "=" + String(texts.get(k)));
    expect(row("frecv2")).toBe(`fc|frecv2|${tparts.join(", ")}`);
    const fparts = faceScopes(m, "Array", (i) => (i as { kind: string }).kind === "array").map((s) => [...s.seeded.keys()].sort().join(", "));
    expect(row("fscope")).toBe(`fc|fscope|${fparts.join(";")}`);
  });

    it("② attrScopes 两作用域", async () => {
    const src = "var a: Vector2 = Vector2()\nfunc f(p: int, q):\n\tvar r = a\nclass K:\n\tfunc g():\n\t\tpass\n";
    const m = lower(await parseSource(src));
    const parts = attrScopes(m).map((s) => String(s.nodes.length) + ":" + s.params.map((p) => p.name).join(","));
    expect(row("attrscope")).toBe(`fc|attrscope|${parts.join(";")}`);
  });

});