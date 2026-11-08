import { describe, expect, it } from "vitest";
import { method as methodRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const arr = (items: Variant[]): Variant => V.array(GArray.of(items));

describe("runtime/expression face", () => {
  it("successful evaluation", () => {
    const e = engineClassNew("Expression").v;
    expect(method(e, "parse", [V.str("1+2*3")]).v).toBe(0);
    expect(method(e, "execute", []).v).toBe(7);
    expect(method(e, "has_execute_failed", []).v).toBe(false);
    expect(method(e, "get_error_text", []).v).toBe("");
    expect(method(e, "parse", [V.str("a+b"), arr([V.str("a"), V.str("b")])]).v).toBe(0);
    expect(method(e, "execute", [arr([V.int(2), V.int(5)])]).v).toBe(7);
    expect(method(e, "execute", [arr([V.str("x"), V.str("y")])]).v).toBe("xy");
  });

  it("parse and execute failures", () => {
    const bad = engineClassNew("Expression").v;
    expect(method(bad, "parse", [V.str("1+")]).v).toBe(31);
    expect(String(method(bad, "get_error_text", []).v).length).toBeGreaterThan(0);
    expect(method(bad, "execute", []).t).toBe(Tag.NIL);
    expect(method(bad, "has_execute_failed", []).v).toBe(false);
    const unknown = engineClassNew("Expression").v;
    expect(method(unknown, "parse", [V.str("unknown")]).v).toBe(0);
    expect(method(unknown, "execute", []).t).toBe(Tag.NIL);
    expect(method(unknown, "has_execute_failed", []).v).toBe(true);
    expect(String(method(unknown, "get_error_text", []).v).length).toBeGreaterThan(0);
    const missing = engineClassNew("Expression").v;
    method(missing, "parse", [V.str("a+1"), arr([V.str("a")])]);
    expect(method(missing, "execute", []).t).toBe(Tag.NIL);
    expect(method(missing, "has_execute_failed", []).v).toBe(true);
    expect(method(missing, "execute", [arr([V.int(2)])]).v).toBe(3);
    expect(method(missing, "has_execute_failed", []).v).toBe(false);
  });
});
