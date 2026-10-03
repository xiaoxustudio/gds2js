// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = rt.toInt(rt.V.int(0));
    let f = rt.toFloat(rt.V.float(0));
    let s = rt.strOf(rt.V.str(""));
    let b = rt.toBool(rt.V.bool(false));
    let arr = rt.V.array(rt.GArray.of([]));
    let dic = rt.dictOf([]);
    let v2 = rt.toVec2(rt.vector2(0, 0));
    let nod = rt.V.nil();
    print(rt.showArgs([i]));
    print(rt.showArgs([f]));
    print(rt.showArgs([b]));
    print(rt.showArgs([s]));
    print(rt.showArgs([arr]));
    print(rt.showArgs([dic]));
    print(rt.showArgs([v2]));
    print(rt.showArgs([nod]));
    print(rt.showArgs([rt.lengthOf(s)]));
    print(rt.showArgs([rt.ops.eq(arr, rt.V.array(rt.GArray.of([])))]));
    print(rt.showArgs([rt.typeOf(f)]));
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
