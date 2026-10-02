// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    rt.method(o, "set", [rt.V.str("a"), rt.V.int(5)]);
    rt.method(o, "set", [rt.V.str("s"), rt.V.int(12)]);
    print(rt.showArgs([rt.V.str("r "), rt.wrapValue(rt.attribute(o, "a")), rt.V.str(" "), rt.method(o, "get", [rt.V.str("a")]), rt.V.str(" "), rt.wrapValue(rt.attribute(o, "s")), rt.V.str(" "), rt.method(o, "get", [rt.V.str("zz")]), rt.V.str(" "), rt.typeOf(rt.method(o, "get", [rt.V.str("zz")]))]));
    print(rt.showArgs([rt.V.str("r2 "), rt.typeOf(rt.method(o, "get", [rt.V.str("hi")])), rt.V.str(" "), rt.method(o, "call", [rt.V.str("hi")])]));
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
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
class Thing extends rt.GdScriptObject {
  a = rt.V.int(7);
  s = rt.strOf(rt.V.str("x"));

  hi(): rt.Variant {
    return rt.V.int(1);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "hi": return rt.wrapValue(this.hi());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerFieldTypes(__gd_d_Thing, {"s": "String"});
rt.registerMethodArities(__gd_d_Thing, { "hi": [0, 0] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
