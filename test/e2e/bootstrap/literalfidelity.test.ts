import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { strFloat, strNum, strSci } from "../../../packages/runtime/src/runtime/numfmt";
import { dictKeyText, dictKeyToken, isLiteralOperand, literalFaceText, isNegativeLiteral, isNum, nonNumericLiteral, numericLiteralKind, typedFaceText } from "../../../packages/compiler/src/analyze/literals";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const rows = existsSync(REF) ? readFileSync(REF, "utf8").split("\n").filter((l) => l.startsWith("lf|")).map((l) => l.split("|")) : [];

const FLOATS = [0, 1, -1, 1.5, 0.1, 1e300, 1e-300, 123456789012345680000, Math.PI, 1e15, 1e16, 2.5e-8, 12345.6789, 0.000123456789012345, Number("-0")];

const SCI_REFUSED = new Set([13]);

describe("bootstrap · 浮点印法与字面量助手与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(rows.length).toBeGreaterThanOrEqual(25);
  });

  const floatRows = rows.filter((x) => x[1] === "float");
  for (let i = 0; i < floatRows.length; i++) {
    const r = floatRows[i]!;
    it(`② float ${String(i)} ${r[2] ?? "?"}`, (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const v = FLOATS[i]!;
      expect(r[3]).toBe(strFloat(v));
      expect(r[4]).toBe(strNum(v));
      if (SCI_REFUSED.has(i)) expect(r[5]).toBe("ERR:numfmt-sci-frac");
      else expect(r[5]).toBe(strSci(v));
    });
  }

  for (const r of rows.filter((x) => x[1] === "typed")) {
    it(`② typedFaceText ${r[2] ?? "?"}`, (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      expect(r[3]).toBe(typedFaceText(r[2]!));
    });
  }

  it("② dictKeyToken 八形", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const r = rows.find((x) => x[1] === "tok")!;
    const want = [
      dictKeyToken({ t: "int", v: 3n }),
      dictKeyToken({ t: "float", v: 1.5 }),
      dictKeyToken({ t: "str", v: "s" }),
      dictKeyToken({ t: "bool", v: true }),
      dictKeyToken({ t: "bool", v: false }),
      dictKeyToken({ t: "null" }),
      dictKeyToken({ t: "vec", name: "Vector2", xs: [1, 2] }),
      dictKeyToken({ t: "np", v: "A/B" }),
    ].join("|");
    expect(r.slice(2).join("|")).toBe(want);
  });

  it("② dictKeyText 七形", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const r = rows.find((x) => x[1] === "txt")!;
    const want = [
      dictKeyText({ t: "int", v: 3n }),
      dictKeyText({ t: "float", v: 1.5 }),
      dictKeyText({ t: "str", v: "s" }),
      dictKeyText({ t: "bool", v: true }),
      dictKeyText({ t: "null" }),
      dictKeyText({ t: "vec", name: "Vector2", xs: [1, 2] }),
      dictKeyText({ t: "np", v: "A/B" }),
    ].join("|");
    expect(r.slice(2).join("|")).toBe(want);
  });

  it("② isNum 三格", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const r = rows.find((x) => x[1] === "num")!;
    expect(r.slice(2).join("|")).toBe(`${String(isNum("int"))}|${String(isNum("float"))}|${String(isNum("String"))}`);
  });

  const exprCases = {
    "1": { kind: "lit", lit: "int", value: 1 },
    "-1": { kind: "unary", op: "-", operand: { kind: "lit", lit: "int", value: 1 } },
    "-x": { kind: "unary", op: "-", operand: { kind: "ident", name: "x" } },
    "1.5": { kind: "lit", lit: "float", value: 1.5 },
    '"s"': { kind: "lit", lit: "string", value: "s" },
    true: { kind: "lit", lit: "bool", value: true },
  } as unknown as Record<string, Parameters<typeof isNegativeLiteral>[0]>;
  for (const r of rows.filter((x) => x[1] === "expr")) {
    it(`② expr ${r[2] ?? "?"}`, (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const e = exprCases[r[2]!]!;
      expect(r[3]).toBe(String(isNegativeLiteral(e)));
      expect(r[4]).toBe(String(numericLiteralKind(e)));
    });
  }

  it("② literalFaceText 五形", (ctx) => {
    if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
    const r = rows.find((x) => x[1] === "face")!;
    const lit = (lit: string, value?: unknown): unknown => (value === undefined ? { kind: "lit", lit } : { kind: "lit", lit, value });
    const probes = [
      { kind: "array", items: [lit("int", 1n), lit("int", 2n)] },
      { kind: "array", items: [lit("int", 1n), lit("string", "a")] },
      { kind: "dict", entries: [{ key: lit("int", 1n), value: lit("int", 2n) }] },
      { kind: "dict", entries: [{ key: lit("string", "k"), value: lit("int", 2n) }] },
      lit("int", 1n),
    ];
    const want = probes.map((e) => String(literalFaceText(e as never, "Variant")));
    expect(r.slice(2).join("|")).toBe(want.join("|"));
  });

  for (const r of rows.filter((x) => x[1] === "opnd")) {
    it(`② nonNumericLiteral / isLiteralOperand ${r[2] ?? "?"}`, async (ctx) => {
      if (rows.length === 0) ctx.skip(true, "缺 gdsrc.txt");
      const tree = await parseSource(`var __v = ${r[2]!}\n`);
      const ir = (lower(tree).vars[0] as unknown as { init: Parameters<typeof nonNumericLiteral>[0] }).init;
      expect(r[3]).toBe(String(nonNumericLiteral(ir)));
      expect(r[4]).toBe(String(isLiteralOperand(ir)));
    });
  }
});
