import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { basenameOfGd, boxR, callableInScope, containerAnnText, fastSuffix, frameEnterLines, frameExitLines, hasValueReturn, isRangeCall, makeClosure, mapsEqual, rangeArgList, standaloneInlineHeader, stampDecl, typeDefault, typeName, unwrapSelfMember } from "../../../packages/compiler/src/emit/helpers";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`hp|${label}|`));
const row2 = (label: string): string | undefined => lines.find((l) => l.startsWith(`${label}|`));

const cell = (v: unknown): string => String(v);

const TYPES = [
  { kind: "named", name: "int" },
  { kind: "named", name: "float" },
  { kind: "named", name: "bool" },
  { kind: "named", name: "String" },
  { kind: "named", name: "StringName" },
  { kind: "named", name: "Array" },
  { kind: "named", name: "Dictionary" },
  { kind: "named", name: "Vector2" },
  { kind: "named", name: "Vector3" },
  { kind: "named", name: "Vector2i" },
  { kind: "named", name: "Vector3i" },
  { kind: "named", name: "Vector4" },
  { kind: "named", name: "Vector4i" },
  { kind: "named", name: "Transform2D" },
  { kind: "named", name: "Transform3D" },
  { kind: "named", name: "Quaternion" },
  { kind: "named", name: "Plane" },
  { kind: "named", name: "AABB" },
  { kind: "named", name: "Rect2" },
  { kind: "named", name: "Rect2i" },
  { kind: "named", name: "Basis" },
  { kind: "named", name: "Color" },
  { kind: "named", name: "PackedByteArray" },
  { kind: "named", name: "PackedInt32Array" },
  { kind: "named", name: "PackedInt64Array" },
  { kind: "named", name: "PackedFloat32Array" },
  { kind: "named", name: "PackedFloat64Array" },
  { kind: "named", name: "PackedStringArray" },
  { kind: "named", name: "PackedVector2Array" },
  { kind: "named", name: "PackedVector3Array" },
  { kind: "named", name: "PackedVector4Array" },
  { kind: "named", name: "PackedColorArray" },
  { kind: "named", name: "Foo" },
  { kind: "named", name: "Array[int]" },
  { kind: "named", name: "Dictionary[String, int]" },
  { kind: "array" },
  { kind: "inferred" },
] as never[];

describe("bootstrap · emit 助手纯函数与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("range")).toBeDefined();
  });

  it("② rangeArgList", () => {
    const want = [["a"], ["a", undefined, "b"], []].map((a) => cell(rangeArgList(a as string[])));
    expect(row("range")).toBe(["hp", "range", ...want].join("|"));
  });

  it("② isRangeCall", () => {
    const probe = (args: number[], name = "range"): boolean => isRangeCall({ kind: "call", callee: { kind: "ident", name }, args: args.map(() => ({ kind: "lit", lit: "int", value: 1 })) } as never);
    const want = [probe([]), probe([1]), probe([1, 2, 3]), probe([1, 2, 3, 4]), probe([1], "print"), false].map(cell);
    expect(row("rangecall")).toBe(["hp", "rangecall", ...want].join("|"));
  });

  it("② basenameOfGd", () => {
    const want = [basenameOfGd("a/b/c.gd"), basenameOfGd("a\\b\\c.gd"), basenameOfGd("c.gd"), basenameOfGd(""), basenameOfGd(undefined)].map(cell);
    expect(row("base")).toBe(["hp", "base", ...want].join("|"));
  });

  it("② typeDefault 三十八形", () => {
    const want = [...TYPES.map((t) => cell(typeDefault(t))), cell(typeDefault(null))];
    expect(row("default")).toBe(["hp", "default", ...want].join("|"));
  });

  it("② hasValueReturn 七形", () => {
    const ret = { kind: "return", value: { kind: "lit", lit: "int", value: 1 } };
    const want = [
      hasValueReturn([]),
      hasValueReturn([{ kind: "return", value: null }] as never[]),
      hasValueReturn([ret] as never[]),
      hasValueReturn([{ kind: "if", branches: [{ body: [ret] }] }] as never[]),
      hasValueReturn([{ kind: "for", body: [ret] }] as never[]),
      hasValueReturn([{ kind: "match", arms: [{ body: [ret] }] }] as never[]),
      hasValueReturn([{ kind: "while", body: [{ kind: "return", value: null }] }] as never[]),
    ].map(cell);
    expect(row("hasret")).toBe(["hp", "hasret", ...want].join("|"));
  });

  it("② typeName 三形", () => {
    const want = [typeName({ kind: "named", name: "int" } as never), typeName({ kind: "array" } as never), typeName({ kind: "inferred" } as never)].map(cell);
    expect(row("typename")).toBe(["hp", "typename", ...want].join("|"));
  });

  it("② unwrapSelfMember 四形", () => {
    ctx.CURRENT_MEMBERS.add("hp_a");
    const text = (t: unknown): string => (t === null ? "null" : String((t as { name: string }).name));
    const want = [
      unwrapSelfMember({ kind: "attribute", name: "hp_a", obj: { kind: "ident", name: "self" }, loc: { line: 1 } } as never),
      unwrapSelfMember({ kind: "attribute", name: "nope", obj: { kind: "ident", name: "self" }, loc: { line: 1 } } as never),
      unwrapSelfMember({ kind: "attribute", name: "hp_a", obj: { kind: "ident", name: "o" }, loc: { line: 1 } } as never),
      unwrapSelfMember({ kind: "ident", name: "x" } as never),
    ].map(text);
    expect(row("unwrap")).toBe(["hp", "unwrap", ...want].join("|"));
  });

  it("② containerAnnText 十形", () => {
    ctx.SCRIPT_BASE.set("MyScript", "Node");
    const anns = [null, { kind: "named", name: "Array[int]" }, { kind: "named", name: "Dictionary[String, int]" }, { kind: "named", name: "Array[Array[int]]" }, { kind: "named", name: "Array[Object]" }, { kind: "named", name: "Array[MyScript]" }, { kind: "named", name: "Array[Foo]" }, { kind: "named", name: "Array[int" }, { kind: "named", name: "int" }, { kind: "array" }];
    const want = anns.map((a) => cell(containerAnnText(a as never)));
    expect(row("ann")).toBe(["hp", "ann", ...want].join("|"));
  });

  it("② standaloneInlineHeader", () => {
    const text = standaloneInlineHeader("a\nb").split("\n").join("~");
    expect(row2("h2|sih")).toBe(["h2", "sih", text].join("|"));
  });

  it("② boxR 五形", () => {
    const reps = ["int", "float", "str", "bool", "var"] as const;
    const want = reps.map((rep) => boxR({ rep, code: "x" } as never));
    expect(row2("h2|boxr")).toBe(["h2", "boxr", ...want].join("|"));
  });

  it("② fastSuffix 三形", () => {
    const want = ["int", "str[]", "float[]"].map((k) => fastSuffix(k as never));
    expect(row2("h2|fastsuffix")).toBe(["h2", "fastsuffix", ...want].join("|"));
  });

  it("② makeClosure 三形", () => {
    const want = [
      makeClosure("Cls", undefined, true),
      makeClosure("Cls", { params: [] } as never, false),
      makeClosure("Cls", { params: [{ default: undefined }, { default: { kind: "lit", lit: "int", value: 1 } }] } as never, false),
    ];
    expect(row2("h2|closure")).toBe(["h2", "closure", ...want].join("|"));
  });

  it("② mapsEqual 四形", () => {
    const want = [
      mapsEqual(new Map([["a", 1]]), new Map([["a", 1]])),
      mapsEqual(new Map([["a", 1]]), new Map([["a", 2]])),
      mapsEqual(new Map([["a", 1]]), new Map()),
      mapsEqual(new Map(), new Map()),
    ].map(cell);
    expect(row2("h2|maps")).toBe(["h2", "maps", ...want].join("|"));
  });

  it("② 帧进出两支", () => {
    ctx.DEBUG_FILE = "a.gd";
    const want = [frameEnterLines("f").join(";"), frameExitLines(null).join(";"), frameExitLines("return rt.V.nil();").join(";")];
    expect(row2("h2|frame")).toBe(["h2", "frame", ...want].join("|"));
  });

  it("② callableInScope 三形", () => {
    ctx.MODULE_FUNCS.add("a");
    ctx.CLASS_VALUE_OWNERS.set("z", "Cls");
    const want = ["a", "b", "z"].map((n) => cell(callableInScope(n)));
    expect(row2("h2|scope")).toBe(["h2", "scope", ...want].join("|"));
  });

  it("② stampDecl 九形", () => {
    ctx.SCRIPT_BASE.set("MyScript", "Node");
    const raw = "rt.V.array(rt.GArray.of([]))";
    const arr = { kind: "array", items: [] } as never;
    const ident = { kind: "ident", name: "v" } as never;
    const emitRaw = (): string => raw;
    const want = [
      stampDecl({ kind: "named", name: "Array[int]" } as never, arr, emitRaw),
      stampDecl({ kind: "named", name: "Array[Object]" } as never, ident, emitRaw),
      stampDecl({ kind: "named", name: "Array[MyScript]" } as never, arr, emitRaw),
      stampDecl({ kind: "named", name: "Array[Foo]" } as never, arr, emitRaw),
      stampDecl({ kind: "named", name: "Dictionary[String, int]" } as never, { kind: "dict", entries: [] } as never, () => "rt.dictOf([])"),
      stampDecl({ kind: "named", name: "Dictionary[String, Foo]" } as never, { kind: "dict", entries: [] } as never, () => "rt.dictOf([])"),
      stampDecl({ kind: "named", name: "Array[Array[int]]" } as never, arr, emitRaw),
      stampDecl({ kind: "named", name: "int" } as never, ident, () => "x"),
      stampDecl(null, null, () => ""),
    ];
    expect(row2("h2|stamp")).toBe(["h2", "stamp", ...want].join("|"));
  });
});
