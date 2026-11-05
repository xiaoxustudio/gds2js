import { describe, it } from "vitest";
import { eq, shouldThrow } from "@gds2js/testkit";
import { callableOf, GdScriptObject, markFreed, methodCallable, nullCallable } from "@gds2js/runtime/runtime/class/object/script-object";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import { method } from "@gds2js/runtime/runtime/methods";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { show } from "@gds2js/runtime/runtime/values";
import { gdDispatchByName } from "./support/gd-dispatch";

const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 5));

class NodeSink extends GdScriptObject {
  constructor(readonly seen: string[] = []) {
    super();
  }
  on_fired(v: Variant): Variant {
    this.seen.push(String(v.v));
    return V.nil();
  }
  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    return gdDispatchByName(this, name, args);
  }
}

describe("runtime/signal deferred（491）", () => {
  it("491 · CONNECT_DEFERRED 的 lambda / Node 目标走下一轮，RefCounted 目标响亮拒", async () => {
    const sig = V.object(new Signal("fired"));
    const seen: string[] = [];
    const lam = callableOf((a) => {
      seen.push(`lam|${String((a[0] as Variant).v)}`);
      return V.nil();
    }, 1);
    eq("491", "lambda 目标连得上", `${method(sig, "connect", [lam, V.int(1)]).v}`, "0");
    method(sig, "emit", [V.int(1)]);
    eq("491", "emit 当下还没投", seen.join(","), "");
    await tick();
    eq("491", "下一轮投到", seen.join(","), "lam|1");

    const sink = new NodeSink([]);
    (sink as unknown as Record<string, unknown>).__gd_engine_class__ = "Node";
    const cb = methodCallable(V.object(sink), "on_fired");
    eq("491", "Node 目标连得上", `${method(sig, "connect", [cb, V.int(1)]).v}`, "0");
    method(sig, "emit", [V.int(2)]);
    await tick();
    eq("491", "Node 目标下一轮投到", sink.seen.join(","), "2");

    markFreed(sink);
    method(sig, "emit", [V.int(3)]);
    await tick();
    eq("491", "目标 free 后静默跳过", sink.seen.join(","), "2");

    shouldThrow("491", "RefCounted 目标的 deferred 响亮拒", () =>
      method(sig, "connect", [methodCallable(V.object(new NodeSink([])), "on_fired"), V.int(1)]),
    );
  });

  it("491 · CONNECT_DEFERRED 与 ONE_SHOT / REFERENCE_COUNTED 组合", async () => {
    const once = V.object(new Signal("once"));
    const onceSeen: string[] = [];
    const onceCb = callableOf((a) => {
      onceSeen.push(String((a[0] as Variant).v));
      return V.nil();
    }, 1);
    eq("491", "flags=5 连得上", `${method(once, "connect", [onceCb, V.int(5)]).v}`, "0");
    method(once, "emit", [V.int(1)]);
    method(once, "emit", [V.int(2)]);
    await tick();
    eq("491", "one-shot 排队前就断开，只投一次", onceSeen.join(","), "1");

    const ref = V.object(new Signal("ref"));
    const refSeen: string[] = [];
    const refCb = callableOf((a) => {
      refSeen.push(String((a[0] as Variant).v));
      return V.nil();
    }, 1);
    eq("491", "flags=9 允许重复连", `${method(ref, "connect", [refCb, V.int(9)]).v} ${method(ref, "connect", [refCb, V.int(9)]).v}`, "0 0");
    method(ref, "emit", [V.int(4)]);
    method(ref, "emit", [V.int(5)]);
    await tick();
    eq("491", "9 的两次 emit 各投一份", refSeen.join(","), "4,5");
  });

  it("491 · disconnect 不撤回已入队的 deferred", async () => {
    const sig = V.object(new Signal("drop"));
    const seen: string[] = [];
    const cb = callableOf((a) => {
      seen.push(String((a[0] as Variant).v));
      return V.nil();
    }, 1);
    method(sig, "connect", [cb, V.int(1)]);
    method(sig, "emit", [V.int(7)]);
    method(sig, "disconnect", [cb]);
    await tick();
    eq("491", "排队中的回调照投", seen.join(","), "7");
  });

  it("491 · 空 Callable 的 call_deferred 是 no-op，绑过实参的空 Callable 仍拒", () => {
    eq("491", "空 Callable call_deferred 回 void", `${show(method(nullCallable(), "call_deferred", [V.int(1)]))}`, "<null>");
    shouldThrow("491", "绑过实参的空 Callable 上 call_deferred 仍拒", () =>
      method(method(nullCallable(), "bind", [V.int(1)]), "call_deferred", []),
    );
  });
});
