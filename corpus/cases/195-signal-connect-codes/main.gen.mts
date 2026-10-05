// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const CONNECT_ONE_SHOT = rt.V.int(4);
const CONNECT_REFERENCE_COUNTED = rt.V.int(8);

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

  on_fired(v: rt.Variant): void {
    print(rt.showArgs([rt.V.str("got "), v]));
  }
  
  on_other(v: rt.Variant): void {
    print(rt.showArgs([rt.V.str("other "), v]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = rt.wrapValue(this.fired);
    print(rt.showArgs([rt.V.str("r1 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired")])]));
    rt.method(s, "emit", [rt.V.int(1)]);
    rt.method(s, "disconnect", [rt.methodCallable(rt.V.object(this), "on_fired")]);
    print(rt.showArgs([rt.V.str("r2 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired")])]));
    rt.method(s, "disconnect", [rt.methodCallable(rt.V.object(this), "on_fired")]);
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_fired"), CONNECT_ONE_SHOT]))]));
    rt.method(s, "emit", [rt.V.int(2)]);
    rt.method(s, "emit", [rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("r4 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_other"), CONNECT_REFERENCE_COUNTED])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(s, "connect", [rt.methodCallable(rt.V.object(this), "on_other"), CONNECT_REFERENCE_COUNTED])]));
    rt.method(s, "emit", [rt.V.int(4)]);
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "on_fired": return rt.wrapValue(this.on_fired(args[0] as rt.Variant));
      case "on_other": return rt.wrapValue(this.on_other(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "on_fired": [1, 1], "on_other": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
