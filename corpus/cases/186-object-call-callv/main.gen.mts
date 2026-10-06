// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("r "), rt.method(o, "call", [rt.V.str("hi"), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.method(o, "callv", [rt.V.str("hi"), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(5)]))])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(o, "call", [rt.V.str("twice")]), rt.V.str(" "), rt.method(o, "call", [rt.V.str("twice"), rt.V.str("q")]), rt.V.str(" "), rt.method(o, "has_method", [rt.V.str("hi")])]));
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
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Thing extends rt.GdScriptObject {
  hi(x: rt.Variant, y: rt.Variant): rt.Variant {
    return rt.ops.add(x, y);
  }
  
  twice(s: rt.Variant = rt.V.str("z")): rt.Variant {
    return rt.ops.add(s, s);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "hi": return rt.wrapValue(this.hi(args[0] as rt.Variant, args[1] as rt.Variant));
      case "twice": return rt.wrapValue(this.twice(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerMethodArities(__gd_d_Thing, { "hi": [2, 2], "twice": [0, 1] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
