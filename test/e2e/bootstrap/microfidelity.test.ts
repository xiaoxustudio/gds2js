import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { escapeEnd, lex } from "../../../packages/compiler/src/parse/descent/lexer";
import { groupLines } from "../../../packages/compiler/src/parse/descent/indent";
import { staticMemberFn } from "../../../packages/compiler/src/lower/ir";
import { nodeSelfProps } from "../../../packages/compiler/src/semantics/node-face";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const row = (label: string): string | undefined => lines.find((l) => l.startsWith(`mf|${label}|`));

const ESCAPES = ["\\u00e9", "\\u12", "\\U01F600", "\\x41", "\\x4", "\\o101", "\\o8", "\\n", "\\", "\r\n", "\\\r\n", "\\\r", "\\uZZZZ", "\\xzz"];
const SOURCES = ["var x = 1\nfunc f(a):\n\treturn a\n", "a = 1 \\\n\t+ 2\n", "\n\n\n", "if x:\n\tpass\n"];

const cell = (v: unknown): string => String(v);

describe("bootstrap · 词法转义终点 / 逻辑行折叠 / 静态成员名与 TypeScript 逐格对账", () => {
  it("① 读数在盘面", (ctx) => {
    if (lines.length === 0) ctx.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(row("escape")).toBeDefined();
  });

  it("② escapeEnd 十四形", () => {
    const want = ESCAPES.map((s) => cell(escapeEnd(s, 0)));
    expect(row("escape")).toBe(["mf", "escape", ...want].join("|"));
  });

  for (let i = 0; i < SOURCES.length; i++) {
    it(`② groupLines ${String(i)}`, () => {
      const spans = groupLines(lex(SOURCES[i]!).tokens);
      const want = spans.map((s) => `${String(s.row)}:${String(s.indent)}:${String(s.from)}:${String(s.to)},`).join("");
      expect(row(`group|${String(i)}`)).toBe(["mf", `group|${String(i)}`, want].join("|"));
    });
  }

  it("② staticMemberFn 七形", () => {
    const want = [
      staticMemberFn({ kind: "ident", name: "Vector2" } as never),
      staticMemberFn({ kind: "ident", name: "Vector4i" } as never),
      staticMemberFn({ kind: "ident", name: "Color" } as never),
      staticMemberFn({ kind: "ident", name: "String" } as never),
      staticMemberFn({ kind: "ident", name: "Callable" } as never),
      staticMemberFn({ kind: "ident", name: "Node" } as never),
      staticMemberFn({ kind: "call" } as never),
    ].map(cell);
    expect(row("static")).toBe(["mf", "static", ...want].join("|"));
  });

  for (const base of [null, "Node", "Node2D", "Node3D", "Control", "Label"]) {
    it(`② nodeSelfProps ${String(base)}`, () => {
      const want = [...nodeSelfProps(base)].sort().join(", ");
      expect(row(`props|${String(base)}`)).toBe(["mf", `props|${String(base)}`, want].join("|"));
    });
  }
});
