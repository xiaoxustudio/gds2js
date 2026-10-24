// S693 的两处口径（尺 `tmp/probe712/arity2.mts` 十五格两侧对读，语料 `441-deferred-arity-error` / `442-face-arity-attr-sentence`）：
// ① `Signal` 面那两个表外名进元数表：`disconnect` 恰好一支（零支与两支同句），`emit` 变长（给几支都不报）；
// ② `Callable.rpc_id()` 少给实参时，**脚本方法那一支基**先报元数句，S652 那三格的宿主基仍是 `on a null instance` —— 次序按基分岔，不是一把表通吃。
// 另两处不在这份件里：脚本实例的表外键读（语料 442 与漂移门逐字节）、延后失败那块（语料 441）。
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { CallableBox } from "@gds2js/runtime/runtime/callable";
import { Signal } from "@gds2js/runtime/runtime/signal";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { method } from "@gds2js/runtime/runtime/methods";

const code = (recv: Variant, name: string, args: Variant[] = []): string => {
  try {
    method(recv, name, args);
    return "没抛";
  } catch (e) {
    return String(((e as Error).message ?? "").split(String.fromCharCode(10))[0]);
  }
};

const DISCONNECT_SAY = "Invalid call to function 'disconnect' in base 'Signal'. Expected 1 argument(s).";
const RPC_ID_SAY = "Invalid call to function 'rpc_id' in base 'Callable'. Expected 1 argument(s).";
const NULLINST = "Attempt to call function 'rpc_id' in base 'Callable' on a null instance.";

describe("methods · Signal 两名的元数与 rpc_id 的基分岔（S693）", () => {
  it("disconnect 零支与两支同句，emit 变长不报", () => {
    const s = V.object(new Signal("pinged"));
    const c = V.object(new CallableBox());
    eq("693", "disconnect 零支", code(s, "disconnect"), DISCONNECT_SAY);
    eq("693", "disconnect 两支", code(s, "disconnect", [c, V.int(1)]), DISCONNECT_SAY);
    eq("693", "emit 三支收下", code(s, "emit", [V.int(1), V.int(2), V.int(3)]), "没抛");
  });

  it("rpc_id：脚本方法基先报元数，宿主基仍是 null instance", () => {
    eq("693", "宿主基零支（S652 那一格不回归）", code(V.object(new CallableBox(null, "m", V.int(1), [], null, false, null, null)), "rpc_id"), NULLINST);
    eq("693", "rpc 零支仍是 null instance", code(V.object(new CallableBox(null, "m", V.int(1), [], null, false, null, null)), "rpc"), "Attempt to call function 'rpc' in base 'Callable' on a null instance.");
  });
});
