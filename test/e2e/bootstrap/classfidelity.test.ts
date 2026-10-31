import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { emitDispatch, emitFieldDeclarations, emitFieldsOnlyConstructor, emitInnerMirrors, emitRootConstructor } from "../../../packages/compiler/src/emit/class";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`cl|${label}|`));
const text = (arr: string[]): string => arr.join("~");

const lit1 = { kind: "lit", lit: "int", value: 1 };
const VARS = [
  { name: "x", accessor: null, isStatic: false },
  { name: "y", accessor: { getter: null }, init: lit1, isStatic: false },
  { name: "s", isStatic: true, accessor: null },
];
const FUNCS = [
  { name: "_init", isStatic: false, params: [] },
  { name: "f", isStatic: false, params: [{ default: null }, { default: lit1 }] },
  { name: "s", isStatic: true, params: [] },
];

describe("bootstrap · emit/class 声明与派发块与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctxOrSkip) => {
    if (lines.length === 0) ctxOrSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("fd")).toBeDefined();
  });

  it("② emitFieldDeclarations", () => {
    const want = [text(emitFieldDeclarations(VARS as never[], [{ name: "sig" }] as never)), text(emitFieldDeclarations([], []))];
    expect(row("fd")).toBe(["cl", "fd", ...want].join("|"));
  });

  it("② emitInnerMirrors", () => {
    const want = [text(emitInnerMirrors([{ name: "A" }, { name: "B" }] as never)), text(emitInnerMirrors([]))];
    expect(row("im")).toBe(["cl", "im", ...want].join("|"));
  });

  it("② emitDispatch", () => {
    const want = [text(emitDispatch(FUNCS as never[], true)), text(emitDispatch(FUNCS as never[], false))];
    expect(row("dispatch")).toBe(["cl", "dispatch", ...want].join("|"));
  });

  it("② emitDispatch 裸形参", () => {
    ctx.RAW_ABIS.set("g", { params: ["int", "str"], ret: "int" });
    const want = text(emitDispatch([{ name: "g", isStatic: false, params: [{}, {}] }] as never[], true));
    expect(row("dispatch2")).toBe(["cl", "dispatch2", want].join("|"));
  });

  it("② 构造函数两支", () => {
    const want = [text(emitRootConstructor(true)), text(emitRootConstructor(false))];
    expect(row("rc")).toBe(["cl", "rc", ...want].join("|"));
    expect(row("foc")).toBe(["cl", "foc", text(emitFieldsOnlyConstructor())].join("|"));
  });
});
