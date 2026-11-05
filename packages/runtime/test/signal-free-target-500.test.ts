import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { engineClassNew, method, methodCallable, signalCtor } from "@gds2js/runtime";

const n = engineClassNew("Node");
const cb = methodCallable(n, "get_name");
const sig = signalCtor([]);

describe("runtime/signal free target（500）", () => {
  it("500 · Node 被 free 后连接惰性失效", () => {
    method(sig, "connect", [cb]);
    eq("500", "连接后可见", `${String(method(sig, "is_connected", [cb]).v)}|${String(method(sig, "has_connections", []).v)}`, "true|true");
    eq("500", "连接数是 1", String(method(method(sig, "get_connections", []), "size", []).v), "1");
    eq("500", "free 前 Callable 有效", String(method(cb, "is_valid", []).v), "true");

    method(n, "free", []);

    eq("500", "is_connected 看不见", String(method(sig, "is_connected", [cb]).v), "false");
    eq("500", "has_connections 看不见", String(method(sig, "has_connections", []).v), "false");
    eq("500", "连接数归零", String(method(method(sig, "get_connections", []), "size", []).v), "0");
    eq("500", "Callable 失效", String(method(cb, "is_valid", []).v), "false");
    eq("500", "发射静默跳过", String(method(sig, "emit", []).v), "null");
  });
});
