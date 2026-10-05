// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  take_v3(v: rt.Variant): void {
    v = rt.paramSlot(v, "Vector3", 1, "take_v3", this);
    print(rt.showArgs([rt.V.str("v3 "), rt.typeOf(v), rt.V.str(" "), v]));
  }
  
  take_v3i(v: rt.Variant): void {
    v = rt.paramSlot(v, "Vector3i", 1, "take_v3i", this);
    print(rt.showArgs([rt.V.str("v3i "), rt.typeOf(v), rt.V.str(" "), v]));
  }
  
  take_name(n: rt.Variant): void {
    n = rt.paramSlot(n, "StringName", 1, "take_name", this);
    print(rt.showArgs([rt.V.str("name "), rt.typeOf(n), rt.V.str(" "), n]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    let b = rt.vector3New([rt.V.float(1.7), rt.V.float((-2.9)), rt.V.float(3.1)]);
    let s = "nm";
    this.take_v3(a);
    this.take_v3(b);
    this.take_v3i(b);
    this.take_v3i(a);
    this.take_name(rt.V.str(s));
    this.take_name(rt.V.stringName("lit"));
    print(rt.showArgs([rt.V.str("t "), rt.colorNew([rt.V.int(123456789)]), rt.V.str(" "), a, rt.V.str(" "), b, rt.V.str(" "), rt.typeOf(rt.V.stringName("x"))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "take_v3": return rt.wrapValue(this.take_v3(args[0] as rt.Variant));
      case "take_v3i": return rt.wrapValue(this.take_v3i(args[0] as rt.Variant));
      case "take_name": return rt.wrapValue(this.take_name(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "take_v3": [1, 1], "take_v3i": [1, 1], "take_name": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
