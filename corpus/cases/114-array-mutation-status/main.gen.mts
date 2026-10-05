// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    print(rt.showArgs([rt.V.str("n1 "), rt.method(a, "insert", [rt.V.int(0), rt.V.int(9)]), rt.V.str(" "), a]));
    print(rt.showArgs([rt.V.str("n2 "), rt.method(a, "insert", [rt.V.int(99), rt.V.int(8)]), rt.V.str(" "), a]));
    print(rt.showArgs([rt.V.str("n3 "), rt.method(a, "insert", [rt.V.int((-99)), rt.V.int(8)]), rt.V.str(" "), a]));
    print(rt.showArgs([rt.V.str("n4 "), rt.method(a, "insert", [rt.V.int(3), rt.V.int(7)]), rt.V.str(" "), a]));
    print(rt.showArgs([rt.V.str("n5 "), rt.method(a, "resize", [rt.V.int(6)]), rt.V.str(" "), a]));
    print(rt.showArgs([rt.V.str("n6 "), rt.method(a, "resize", [rt.V.int(6)]), rt.V.str(" "), rt.method(a, "size", [])]));
    print(rt.showArgs([rt.V.str("n7 "), rt.method(a, "resize", [rt.V.int(2)]), rt.V.str(" "), a]));
    let t = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
    print(rt.showArgs([rt.V.str("n8 "), rt.method(t, "insert", [rt.V.int(0), rt.V.str("s")]), rt.V.str(" "), t]));
    print(rt.showArgs([rt.V.str("n9 "), rt.method(t, "insert", [rt.V.int(1), rt.V.int(5)]), rt.V.str(" "), t]));
    let b = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.showArgs([rt.V.str("n10 "), rt.method(b, "pop_back", []), rt.V.str(" "), rt.method(b, "pop_front", []), rt.V.str(" "), b]));
    let c = rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)]));
    print(rt.showArgs([rt.V.str("n11 "), rt.method(c, "pop_at", [rt.V.int(1)]), rt.V.str(" "), c]));
    let e = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(1)]));
    rt.method(e, "erase", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("n12 "), e]));
    let d = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
    print(rt.showArgs([rt.V.str("n13 "), rt.method(d, "erase", [rt.V.int(1)]), rt.V.str(" "), rt.method(d, "erase", [rt.V.int(9)]), rt.V.str(" "), d]));
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
