// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let b = a;
    rt.method(b, "append", [rt.V.int(3)]);
    print(rt.showArgs([a]));
    print(rt.showArgs([b]));
    print(rt.showArgs([rt.ops.eq(a, b)]));
    let c = rt.method(a, "duplicate", []);
    rt.method(c, "append", [rt.V.int(9)]);
    print(rt.showArgs([a]));
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
const __gd_entry = new Main();
await __gd_entry.run();
