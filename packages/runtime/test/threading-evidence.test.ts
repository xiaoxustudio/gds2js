import { describe, expect, it } from "vitest";
import { method as methodRaw, attribute as attributeRaw } from "@gds2js/runtime/runtime/methods";
import { engineClassNew } from "@gds2js/runtime/runtime/class/object/node";
import { nativeClass } from "@gds2js/runtime/runtime/class/identity/native-class";
import { globalCallable } from "../src/runtime/method/globals";
import { Tag, V, type Variant } from "@gds2js/runtime/runtime/tags";

const method = (recv: any, name: string, args: any[]): any => methodRaw(recv, name, args) as Variant as any;
const attribute = (recv: any, name: string): any => attributeRaw(recv, name) as Variant as any;

describe("runtime/threading face", () => {
  it("mutex is recursive", () => {
    const m = engineClassNew("Mutex").v;
    expect(method(m, "lock", []).t).toBe(Tag.NIL);
    expect(method(m, "try_lock", []).v).toBe(true);
    expect(method(m, "unlock", []).t).toBe(Tag.NIL);
    expect(method(m, "try_lock", []).v).toBe(true);
    method(m, "unlock", []);
  });

  it("semaphore counts posts and waits", () => {
    const s = engineClassNew("Semaphore").v;
    expect(method(s, "try_wait", []).v).toBe(false);
    method(s, "post", []);
    expect(method(s, "try_wait", []).v).toBe(true);
    expect(method(s, "try_wait", []).v).toBe(false);
    method(s, "post", [V.int(2)]);
    expect(method(s, "try_wait", []).v).toBe(true);
    expect(method(s, "try_wait", []).v).toBe(true);
    expect(method(s, "try_wait", []).v).toBe(false);
    method(s, "wait", []);
  });

  it("thread runs a bound callable and reports lifecycle", () => {
    const t = engineClassNew("Thread").v;
    expect(method(t, "is_started", []).v).toBe(false);
    expect(method(t, "is_alive", []).v).toBe(false);
    expect(method(t, "is_main_thread", []).v).toBe(true);
    const worker = method(globalCallable("abs"), "bind", [V.int(-21)]);
    expect(method(t, "start", [worker]).v).toBe(0);
    expect(method(t, "is_started", []).v).toBe(true);
    expect(method(t, "is_alive", []).v).toBe(true);
    expect(method(t, "wait_to_finish", []).v).toBe(21);
    expect(method(t, "is_started", []).v).toBe(false);
    expect(method(t, "is_alive", []).v).toBe(false);
    expect(method(t, "get_id", []).v).toBe("0");
    expect(method(t, "set_thread_safety_checks_enabled", [V.bool(true)]).t).toBe(Tag.NIL);
    expect(attribute(nativeClass("Thread"), "PRIORITY_LOW").v).toBe(0);
    expect(attribute(nativeClass("Thread"), "PRIORITY_NORMAL").v).toBe(1);
    expect(attribute(nativeClass("Thread"), "PRIORITY_HIGH").v).toBe(2);
  });
});
