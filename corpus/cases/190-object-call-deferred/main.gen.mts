// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r "), rt.method(o, "call_deferred", [rt.V.str("hi"), rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(o, "call_deferred", [rt.V.str("name2")])]));
    rt.method(o, "set", [rt.V.str("hi"), rt.V.int(5)]);
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(o, "get", [rt.V.str("hi")])), rt.V.str(" "), rt.wrapValue(rt.attribute(o, "s"))]));
    print(rt.showArgs([rt.V.str("r4 "), rt.method(o, "call", [rt.V.str("hi"), rt.V.int(3), rt.V.int(4)]), rt.V.str(" "), rt.typeOf(rt.method(o, "get", [rt.V.str("s")]))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Thing extends rt.GdScriptObject {
  s = rt.strOf(rt.V.str("x"));

  hi(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.ops.add(a, b);
  }
  
  name2(): rt.Variant {
    return rt.V.str("nm");
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "hi": return rt.wrapValue(this.hi(args[0] as rt.Variant, args[1] as rt.Variant));
      case "name2": return rt.wrapValue(this.name2());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerFieldTypes(__gd_d_Thing, {"s": "String"});
rt.registerScriptProps(__gd_d_Thing, ["s"]);
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", ["s"], {}, (o) => { const s = o as Thing; return [s.s]; });
rt.registerMethodArities(__gd_d_Thing, { "hi": [2, 2], "name2": [0, 0] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
