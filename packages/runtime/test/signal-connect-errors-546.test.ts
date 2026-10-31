/** Signal.connect 的两块非致命 ERROR（S546）：重复连与空 Callable，读数 `tmp/d6/s546.gd`。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { callable, nullCallable } from "@gds2js/runtime/runtime/class/object/script-object";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { method } from "@gds2js/runtime/runtime/methods";
import { V } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { I } from "./support/variants";

function capture(f: () => unknown): { value: unknown; text: string } {
  const writes: string[] = [];
  const orig = process.stderr.write;
  process.stderr.write = ((chunk: string) => {
    writes.push(String(chunk));
    return true;
  }) as typeof process.stderr.write;
  let value: unknown;
  try {
    value = f();
  } finally {
    process.stderr.write = orig;
  }
  return { value, text: writes.join("") };
}

describe("Signal.connect 的 ERROR 块（S546）", () => {
  it("重复连 lambda：标签 <anonymous lambda>(lambda)、返回 31", () => {
    const sg = new Signal("lam");
    const cb = callable(() => V.nil(), 1);
    method(V.object(sg), "connect", [cb]);
    const r = capture(() => method(V.object(sg), "connect", [cb]));
    eq("546", "返回 31", String((r.value as ReturnType<typeof V.int>).v), "31");
    eq("546", "ERROR 两行", r.text.split("\n").slice(0, 2).join("|"), "ERROR: Signal 'lam' is already connected to given callable '<anonymous lambda>(lambda)' in that object.|   at: connect (core/object/object.cpp:1682)");
    eq("546", "仍只有一行连接", String((method(V.object(sg), "get_connections", []).v as GArray).raw().length), "1");
  });
  it("空 Callable：首次就连不上，ERROR 句 + 返回 31", () => {
    const sg = new Signal("nul");
    const r = capture(() => method(V.object(sg), "connect", [nullCallable()]));
    eq("546", "返回 31", String((r.value as ReturnType<typeof V.int>).v), "31");
    eq("546", "ERROR 两行", r.text.split("\n").slice(0, 2).join("|"), "ERROR: Cannot connect to 'nul': the provided callable is null.|   at: connect (core/object/object.cpp:1639)");
    eq("546", "一条也没连上", String(method(V.object(sg), "has_connections", []).v), "false");
  });
});
