import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseSource } from "@gds2js/compiler/parse/parser";
import { lower } from "@gds2js/compiler/lower/lower";
import { innerClassBase, pctStaticSide } from "../../../packages/compiler/src/emit/layout";
import { ctx } from "../../../packages/compiler/src/emit/context";
import type { TypeRef } from "../../../packages/compiler/src/lower/ir";
import { ROOT } from "../../support/lib-bridge";

const REF = join(ROOT, "test", "fixtures", "bootstrap", "gdsrc", "gdsrc.txt");
const lines = existsSync(REF) ? readFileSync(REF, "utf8").split("\n") : [];
const ibRows = lines.filter((x) => x.startsWith("ib|"));
const psRows = lines.filter((x) => x.startsWith("ps|"));

const NAMES = ["K", "RefCounted", "Object", "Node", "Other"];
const EXPRS = ["u", "a", "b", "c", "d", "v", "zz", "f()", "g()", "h()", "d[0]", "a[0]", "obj.x"];
const named = (name: string): TypeRef => ({ kind: "named", name }) as never;

describe("bootstrap · 基类与 % 静态侧判据与 TypeScript 逐条对账", () => {
  it("① 读数在盘面", (ctxSkip) => {
    if (lines.length === 0) ctxSkip.skip(true, "缺 gdsrc.txt：先跑 node tools/bootstrap.mjs --tree（要 GODOT_BIN）");
    expect(ibRows.length).toBe(NAMES.length);
    expect(psRows.length).toBe(EXPRS.length);
  });

  it("② innerClassBase 五格", () => {
    (ctx.INNER_CLASSES as unknown as Map<string, unknown>).clear();
    ctx.INNER_CLASSES.set("K", {} as never);
    const rows = NAMES.map((n) => {
      try {
        const r = innerClassBase(n);
        return `ib|${n}|${r === null ? "null" : r}`;
      } catch (e) {
        return `ib|${n}|__error|${(e as { code?: string }).code ?? ""}`;
      }
    });
    expect(ibRows).toEqual(rows);
  });

  for (let i = 0; i < EXPRS.length; i++) {
    it(`③ pctStaticSide ${String(i)}`, async () => {
      ctx.UNTYPED_NAMES.clear();
      ctx.UNTYPED_NAMES.add("u");
      ctx.LOCAL_TYPES.clear();
      ctx.LOCAL_TYPES.set("a", named("int"));
      ctx.LOCAL_TYPES.set("b", null);
      ctx.LOCAL_TYPES.set("c", named("Variant"));
      ctx.LOCAL_TYPES.set("d", named("Array"));
      ctx.VAR_TYPES.clear();
      ctx.VAR_TYPES.set("v", named("float"));
      ctx.FUNC_RETURNS.clear();
      ctx.FUNC_RETURNS.set("f", named("int"));
      ctx.FUNC_RETURNS.set("g", null);
      ctx.FUNC_RETURNS.set("h", named("Variant"));
      const mod = lower(await parseSource(`var __v = ${EXPRS[i]!}\n`));
      const init = (mod.vars[0] as unknown as { init: never }).init;
      expect(psRows[i]).toBe(`ps|${String(i)}|${String(pctStaticSide(init))}`);
    });
  }
});
