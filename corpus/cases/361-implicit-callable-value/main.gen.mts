// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  zz(): rt.Variant {
    return rt.V.int(7);
  }
  
  take(f: rt.Variant): void {
    print(rt.showArgs([rt.V.str("T|"), rt.method(f, "is_valid", []), rt.V.str("|"), rt.method(f, "get_method", [])]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let c = rt.methodCallable(rt.V.object(this), "quit");
    print(rt.showArgs([rt.V.str("A|"), rt.typeOf(c), rt.V.str("|"), rt.method(c, "get_method", []), rt.V.str("|"), rt.method(c, "is_valid", [])]));
    this.take(rt.methodCallable(rt.V.object(this), "quit"));
    let z = rt.methodCallable(rt.V.object(this), "zz");
    print(rt.showArgs([rt.V.str("B|"), rt.typeOf(z), rt.V.str("|"), rt.method(z, "call", [])]));
    let g = rt.methodCallable(rt.V.object(this), "get_class");
    print(rt.showArgs([rt.V.str("C|"), rt.typeOf(g), rt.V.str("|"), rt.method(g, "call", [])]));
    let k = rt.V.array(rt.GArray.of([rt.methodCallable(rt.V.object(this), "quit"), rt.methodCallable(rt.V.object(this), "zz")]));
    print(rt.showArgs([rt.V.str("D|"), k, rt.V.str("|"), rt.method(rt.wrapValue(rt.index(k, rt.V.int(1))), "call", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "zz": return rt.wrapValue(this.zz());
      case "take": return rt.wrapValue(this.take(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "zz": [0, 0], "take": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
