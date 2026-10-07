// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  add3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, rt.V.str("-"), b, rt.V.str("-"), c]);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let cb = rt.method(rt.methodCallable(rt.V.object(this), "add3"), "bind", [rt.V.str("x")]);
    print(rt.showArgs([rt.V.str("r "), rt.method(cb, "call", [rt.V.str("y"), rt.V.str("z")])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(rt.methodCallable(rt.V.object(this), "add3"), "bind", [rt.V.str("x"), rt.V.str("y")]), "call", [rt.V.str("z")])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(rt.method(rt.method(rt.methodCallable(rt.V.object(this), "add3"), "bind", [rt.V.str("m")]), "bind", [rt.V.str("n")]), "call", [rt.V.str("p")])]));
    let full = rt.method(rt.methodCallable(rt.V.object(this), "add3"), "bind", [rt.V.str("x"), rt.V.str("y"), rt.V.str("z")]);
    print(rt.showArgs([rt.V.str("r4 "), rt.method(full, "call", []), rt.V.str(" "), rt.method(full, "get_bound_arguments", []), rt.V.str(" "), rt.method(full, "get_argument_count", []), rt.V.str(" "), rt.method(full, "get_method", [])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.str("y"), rt.V.str("z")]))])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(cb, "is_valid", []), rt.V.str(" "), rt.method(rt.method(cb, "get_bound_arguments", []), "size", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add3": return rt.wrapValue(this.add3(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "add3": [3, 3], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
