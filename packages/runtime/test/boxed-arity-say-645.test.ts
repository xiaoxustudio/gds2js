/** 装箱直调的元数句铺到 Callable / Signal / 脚本对象方法三面（S645）。读数 `tmp/probe644/sc645.gd` 卅一格 +
 *  `so645{,b,c,d}.gd`：前两面同一条 `Invalid call to function 'X' in base 'Face'. Expected <数> argument(s).`，
 *  数取声明的全部数；**脚本对象直调另有两判**：少给报必填数、多给报全部数，且 base 写 `<原生基类> (<动态类名>)`。
 *  两向的越界实参都按量过的那两形给（0 支与 5 支 / 4 支），不拿别的数外推。 */
import { describe, it } from "vitest";
import { eq } from "@gds2js/testkit";
import { V, type Variant } from "@gds2js/runtime/runtime/tags";
import { GArray } from "@gds2js/runtime/runtime/values";
import { method } from "@gds2js/runtime/runtime/methods";
import { Signal } from "@gds2js/runtime/runtime/class/identity/signal";
import {
  GdScriptObject, nullCallable, registerClass, registerMethodArities, registerNativeBase,
  registerScriptLabel, wrapValue,
} from "@gds2js/runtime/runtime/class/object/script-object";
import { gdDispatchByName } from "./support/gd-dispatch";
import { I } from "./support/variants";

const say = (v: Variant, name: string, args: Variant[]): string => {
  try {
    void method(v, name, args);
    return "没抛";
  } catch (e) {
    const err = e as { code?: string; message?: string };
    return `[${err.code}] ${err.message ?? ""}`;
  }
};

const FIVE = [I(1), I(2), I(3), I(4), I(5)];
const callSay = (name: string, args: Variant[]): string => say(nullCallable(), name, args);
const sigSay = (name: string, args: Variant[]): string => say(V.object(new Signal("fired")), name, args);

class Inner645 extends GdScriptObject {
  top(a: Variant, b?: Variant, c?: Variant): Variant {
    return V.array(GArray.of([a, b ?? I(1), c ?? I(2)]));
  }

  need(a: Variant): Variant {
    return a;
  }

  override __gdDispatch(name: string, args: Variant[]): Variant | null {
    return gdDispatchByName(this, name, args);
  }
}

const dInner = registerClass("Inner", Inner645, () => new Inner645(), (o) => o instanceof Inner645);
registerNativeBase(dInner, "RefCounted");
registerScriptLabel(dInner, "Inner");
registerMethodArities(dInner, { top: [1, 3], need: [1, 1] });
const inner = wrapValue(new Inner645());

describe("runtime/methods · 装箱元数句铺到 Callable / Signal / 脚本对象（S645）", () => {
  it("Callable 十一名的数取声明的全部数，两向同一句", () => {
    eq("645", "create 零支", callSay("create", []), "[callable-arity] Invalid call to function 'create' in base 'Callable'. Expected 2 argument(s).");
    eq("645", "create 五支", callSay("create", FIVE), "[callable-arity] Invalid call to function 'create' in base 'Callable'. Expected 2 argument(s).");
    eq("645", "callv 零支", callSay("callv", []), "[callable-arity] Invalid call to function 'callv' in base 'Callable'. Expected 1 argument(s).");
    eq("645", "callv 五支", callSay("callv", FIVE), "[callable-arity] Invalid call to function 'callv' in base 'Callable'. Expected 1 argument(s).");
    const bindv = "[callable-arity] Invalid call to function 'bindv' in base 'Callable'. Expected 1 argument(s).";
    eq("645", "bindv 零支", callSay("bindv", []), bindv);
    eq("645", "bindv 五支", callSay("bindv", FIVE), bindv);
    eq("645", "unbind 零支", callSay("unbind", []), "[callable-arity] Invalid call to function 'unbind' in base 'Callable'. Expected 1 argument(s).");
    eq("645", "unbind 五支", callSay("unbind", FIVE), "[callable-arity] Invalid call to function 'unbind' in base 'Callable'. Expected 1 argument(s).");
    for (const n of ["is_null", "is_custom", "is_standard", "is_valid", "get_object", "get_object_id", "get_method",
      "get_argument_count", "get_bound_arguments_count", "get_bound_arguments", "get_unbound_arguments_count", "hash"]) {
      eq("645", `${n} 五支报 0`, callSay(n, FIVE), `[callable-arity] Invalid call to function '${n}' in base 'Callable'. Expected 0 argument(s).`);
    }
    eq("645", "bind 是变参：零支与五支都收下", [callSay("bind", []), callSay("bind", FIVE)].join("|"), "没抛|没抛");
  });

  it("Signal 八名同一句式，connect 的界是 [1,2]", () => {
    for (const n of ["is_null", "get_object", "get_object_id", "get_name", "get_connections", "has_connections"]) {
      eq("645", `Signal.${n} 五支报 0`, sigSay(n, FIVE), `[signal-arity] Invalid call to function '${n}' in base 'Signal'. Expected 0 argument(s).`);
    }
    eq("645", "Signal.connect 零支报 2", sigSay("connect", []), "[signal-arity] Invalid call to function 'connect' in base 'Signal'. Expected 2 argument(s).");
    eq("645", "Signal.connect 五支报 2", sigSay("connect", FIVE), "[signal-arity] Invalid call to function 'connect' in base 'Signal'. Expected 2 argument(s).");
    const isConn = "[signal-arity] Invalid call to function 'is_connected' in base 'Signal'. Expected 1 argument(s).";
    eq("645", "Signal.is_connected 零支", sigSay("is_connected", []), isConn);
    eq("645", "Signal.is_connected 五支", sigSay("is_connected", FIVE), isConn);
    // emit / disconnect 的元数没量过：引擎在取返回值那一步先给 void 那一句，所以两名不进表、这里也不钉
    eq("645", "Signal.emit 一支照旧不发元数句", sigSay("emit", FIVE), "没抛");
  });

  it("脚本对象直调：少给报必填数、多给报全部数，base 是「原生基类 (动态类名)」", () => {
    eq("645", "top() 报必填数 1", say(inner, "top", []), "[script-method-arity] Invalid call to function 'top' in base 'RefCounted (Inner)'. Expected 1 argument(s).");
    eq("645", "top(1,2,3,4) 报全部数 3", say(inner, "top", [I(1), I(2), I(3), I(4)]), "[script-method-arity] Invalid call to function 'top' in base 'RefCounted (Inner)'. Expected 3 argument(s).");
    eq("645", "need() 报 1", say(inner, "need", []), "[script-method-arity] Invalid call to function 'need' in base 'RefCounted (Inner)'. Expected 1 argument(s).");
    eq("645", "界内原路走：top(1) 算得出值", say(inner, "top", [I(1)]), "没抛");
    eq("645", "界内原路走：top(1,2,3) 算得出值", say(inner, "top", [I(1), I(2), I(3)]), "没抛");
    eq("645", "表外的名不猜：仍给响亮拒", say(inner, "nope", [I(1)]).startsWith("[object-method]"), true);
  });
});
