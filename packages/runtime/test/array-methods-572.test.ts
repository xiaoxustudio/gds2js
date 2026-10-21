/** Array.get / set / front / back / pick_random / shuffle 与 Dictionary.sort（S572），读数 `tmp/d6/s572.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { method } from "@gds2js/runtime/runtime/methods";
import { GArray, GDict, show } from "@gds2js/runtime/runtime/values";
import { gSeed } from "@gds2js/runtime/runtime/builtins";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { I, S } from "./support/variants";

const arr = (xs: number[]): Variantish => V.array(GArray.of(xs.map((n) => I(n))));
type Variantish = ReturnType<typeof V.array>;
const call = (r: unknown, name: string, args: Variantish[] = []): Variantish => method(r, name, args) as Variantish;

function capture(f: () => unknown): { value: unknown; message: string; lines: string[] } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value: unknown;
  let message = "";
  try {
    value = f();
  } catch (e) {
    message = (e as { message?: string }).message ?? "?";
  } finally {
    process.stderr.write = orig;
  }
  return { value, message, lines: writes.join("").split("\n").filter((l) => l !== "") };
}

describe("Array.get / set（S572）", () => {
  it("int / float / bool 下标照折，负下标不回绕", () => {
    const a = arr([10, 20, 30]);
    eq("572", "get(1)", call(a, "get", [I(1)]).v, 20);
    eq("572", "get(1.9)", call(a, "get", [V.float(1.9)]).v, 20);
    eq("572", "get(true)", call(a, "get", [V.bool(true)]).v, 20);
    const neg = capture(() => call(a, "get", [I(-1)]));
    eq("572", "get(-1)", `${show(neg.value as Variant)}|${neg.lines[0]}|${neg.lines[1]}`, "<null>|ERROR: Index p_index = -1 is out of bounds (p_instance->size() = 3).|   at: func_Array_get (core/variant/variant_call.cpp:681)");
    const oob = capture(() => call(a, "get", [I(3)]));
    eq("572", "get(3)", `${show(oob.value as Variant)}|${oob.lines[0]}`, "<null>|ERROR: Index p_index = 3 is out of bounds (p_instance->size() = 3).");
    eq("572", "get(String)", capture(() => call(a, "get", [S("1")])).message, "Invalid type in function 'get' in base 'Array'. Cannot convert argument 1 from String to int.");
  });
  it("set 写中；越界打块且不动；String 下标报方法句", () => {
    const a = arr([10, 20, 30]);
    call(a, "set", [I(1), I(99)]);
    call(a, "set", [V.float(1.9), I(8)]);
    call(a, "set", [V.bool(true), I(9)]);
    eq("572", "三形", show(a), "[10, 9, 30]");
    const neg = capture(() => call(a, "set", [I(-1), I(7)]));
    eq("572", "set(-1)", `${show(a)}|${neg.lines[0]}`, "[10, 9, 30]|ERROR: Index p_index = -1 is out of bounds (p_instance->size() = 3).");
    const oob = capture(() => call(a, "set", [I(3), I(7)]));
    eq("572", "set(3)", `${show(a)}|${oob.lines[0]}`, "[10, 9, 30]|ERROR: Index p_index = 3 is out of bounds (p_instance->size() = 3).");
    eq("572", "set(String)", capture(() => call(a, "set", [S("1"), I(4)])).message, "Invalid type in function 'set' in base 'Array'. Cannot convert argument 1 from String to int.");
  });
});

describe("Array.front / back / pick_random / shuffle（S572）", () => {
  it("front / back 非空取值，空数组打块给 null", () => {
    const a = arr([10, 20, 30]);
    eq("572", "非空", `${call(a, "front").v}/${call(a, "back").v}`, "10/30");
    const fe = capture(() => call(arr([]), "front"));
    eq("572", "空 front", `${show(fe.value as Variant)}|${fe.lines[0]}|${fe.lines[1]}`, "<null>|ERROR: Can't take value from empty array.|   at: front (core/variant/array.cpp:355)");
    const be = capture(() => call(arr([]), "back"));
    eq("572", "空 back", `${show(be.value as Variant)}|${be.lines[1]}`, "<null>|   at: back (core/variant/array.cpp:360)");
  });
  it("pick_random 与 shuffle 吃 seed 的同一串 PCG", () => {
    gSeed(I(123));
    const a = arr([10, 20, 30, 40]);
    eq("572", "pick", `${call(a, "pick_random").v}/${call(a, "pick_random").v}`, "30/20");
    const pe = capture(() => call(arr([]), "pick_random"));
    eq("572", "空 pick", `${show(pe.value as Variant)}|${pe.lines[1]}`, "<null>|   at: pick_random (core/variant/array.cpp:365)");
    gSeed(I(123));
    const b = arr([1, 2, 3, 4, 5]);
    call(b, "shuffle");
    eq("572", "shuffle", show(b), "[1, 3, 4, 2, 5]");
  });
});

describe("Dictionary.sort（S572）", () => {
  it("按键升序重排，值跟着键走", () => {
    const d = new GDict();
    d.set(S("b"), I(2));
    d.set(S("a"), I(1));
    d.set(S("c"), I(3));
    call(V.dict(d), "sort");
    const keys = call(V.dict(d), "keys").v as GArray;
    eq("572", "键序", keys.raw().map((k) => String(k.v)).join(","), "a,b,c");
    eq("572", "值跟随", `${call(V.dict(d), "get", [S("a")]).v}/${call(V.dict(d), "get", [S("c")]).v}`, "1/3");
  });
});
