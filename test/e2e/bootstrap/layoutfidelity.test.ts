import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fieldTypesLiteral, fwdParams, hasDeadStaticDelegate, innerInheritedMethodNames, innerInheritedNames, orderInnerClasses, patternNames, scriptPropsLiteral, scriptPropsReaderLiteral, staticNamesLiteral, staticVarTableLiteral } from "../../../packages/compiler/src/emit/layout";
import { ctx } from "../../../packages/compiler/src/emit/context";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`ly|${label}|`));
const cell = (v: unknown): string => String(v);

const litint = (v: number): unknown => ({ kind: "lit", lit: "int", value: v });

const BASE = { name: "Base", extends: null, vars: [{ name: "bv", isStatic: false }, { name: "sv", isStatic: true }], signals: [{ name: "sig" }], funcs: [{ name: "m", isStatic: false }, { name: "s", isStatic: true }], innerClasses: [] };
const CHILD = { name: "Child", extends: "Base", vars: [], signals: [], funcs: [], innerClasses: [] };

describe("bootstrap · emit/layout 字面量助手与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctxOrSkip) => {
    if (lines.length === 0) ctxOrSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("sprops")).toBeDefined();
  });

  it("② scriptPropsLiteral", () => {
    const want = [scriptPropsLiteral([]), scriptPropsLiteral([{ name: "a" }, { name: "b" }])].map(cell);
    expect(row("sprops")).toBe(["ly", "sprops", ...want].join("|"));
  });

  it("② scriptPropsReaderLiteral", () => {
    expect(row("sreader")).toBe(["ly", "sreader", scriptPropsReaderLiteral("Cls", [{ name: "a" }, { name: "b" }])].join("|"));
  });

  it("② fieldTypesLiteral", () => {
    const want = [
      fieldTypesLiteral([{ name: "x", type: { kind: "named", name: "int" }, accessor: null }] as never[]),
      fieldTypesLiteral([{ name: "q", type: { kind: "named", name: "Foo" }, accessor: { getter: null } }] as never[]),
      fieldTypesLiteral([{ name: "z", type: null, accessor: null }] as never[]),
      fieldTypesLiteral([{ name: "x", type: { kind: "named", name: "Vector2i" }, accessor: null }, { name: "w", type: { kind: "named", name: "int" }, accessor: { getter: null } }, { name: "e", type: { kind: "array" } }] as never[]),
    ].map(cell);
    expect(row("ftypes")).toBe(["ly", "ftypes", ...want].join("|"));
  });

  it("② staticNamesLiteral", () => {
    const want = staticNamesLiteral([{ name: "f", isStatic: true }, { name: "g", isStatic: false }]);
    expect(row("snames")).toBe(`ly|snames|${want.join(", ")}`);
  });

  it("② fwdParams", () => {
    expect(row("fwd")).toBe(["ly", "fwd", fwdParams([{ default: null }, { default: litint(1) }], "a")].join("|"));
  });

  it("② staticVarTableLiteral", () => {
    const want = [
      staticVarTableLiteral([{ name: "a", isStatic: true, type: { kind: "named", name: "int" } }, { name: "b", isStatic: false, type: null }, { name: "c", isStatic: true, type: null }] as never[]),
      staticVarTableLiteral([{ name: "b", isStatic: false, type: null }] as never[]),
    ].map(cell);
    expect(row("svars")).toBe(["ly", "svars", ...want].join("|"));
  });

  it("② hasDeadStaticDelegate", () => {
    const deadAcc = { getter: { kind: "method", method: "h" }, setter: null };
    const okAcc = { getter: { kind: "method", method: "g" }, setter: null };
    const want = [
      hasDeadStaticDelegate({ vars: [{ isStatic: true, accessor: okAcc }], funcs: [{ name: "g", isStatic: true }], innerClasses: [] } as never),
      hasDeadStaticDelegate({ vars: [{ isStatic: true, accessor: deadAcc }], funcs: [{ name: "g", isStatic: true }], innerClasses: [] } as never),
      hasDeadStaticDelegate({ vars: [], funcs: [], innerClasses: [{ vars: [{ isStatic: true, accessor: deadAcc }], funcs: [], innerClasses: [] }] } as never),
    ].map(cell);
    expect(row("dead")).toBe(["ly", "dead", ...want].join("|"));
  });

  it("② innerInheritedMethodNames / innerInheritedNames", () => {
    ctx.INNER_CLASSES.set("Base", BASE as never);
    ctx.INNER_CLASSES.set("Child", CHILD as never);
    expect(row("inhm")).toBe(`ly|inhm|${innerInheritedMethodNames(CHILD as never).join(", ")}`);
    expect(row("inhn")).toBe(`ly|inhn|${innerInheritedNames(CHILD as never).join(", ")}`);
  });

  it("② orderInnerClasses", () => {
    ctx.INNER_CLASSES.set("Base", BASE as never);
    ctx.INNER_CLASSES.set("Child", CHILD as never);
    const names = orderInnerClasses([CHILD, BASE] as never[]).map((c) => (c as { name: string }).name);
    expect(row("order")).toBe(`ly|order|${names.join(", ")}`);
  });

  it("② patternNames", () => {
    const want = [
      patternNames({ kind: "bind", name: "a" } as never).join(", "),
      patternNames({ kind: "array", items: [{ kind: "bind", name: "a" }, { kind: "wildcard" }] } as never).join(", "),
      patternNames({ kind: "dict", entries: [{ pattern: { kind: "bind", name: "q" } }, { pattern: { kind: "bind", name: "r" } }] } as never).join(", "),
      patternNames({ kind: "wildcard" } as never).join(", "),
    ].map(cell);
    expect(row("pnames")).toBe(["ly", "pnames", ...want].join("|"));
  });
});
