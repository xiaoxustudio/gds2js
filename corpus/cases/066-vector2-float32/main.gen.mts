// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.vector2New([rt.V.int(4), rt.V.int(6)])]));
    print(rt.showArgs([rt.vector2New([rt.V.float(1.5), rt.V.float(2.25)])]));
    print(rt.showArgs([rt.vector2New([rt.V.float(1.2345678901234567), rt.V.float((0.1 + 0.2))])]));
    print(rt.showArgs([rt.vector2New([rt.V.float((-0)), rt.V.float((-3.7))])]));
    print(rt.showArgs([rt.vector2New([rt.V.float(1.0000000000000002), rt.V.float(1e-8)])]));
    print(rt.showArgs([rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(3.5), rt.V.int(4)])]))]));
    print(rt.showArgs([rt.V.array(rt.GArray.of([rt.V.float(100000000000000000000), rt.vector2New([rt.V.float(1000000000000000), rt.V.int(2)])]))]));
    print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x"))]));
    print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), "x"))]));
    print(rt.showArgs([rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1.2345678901234567), rt.V.int(0)]), "x"))]));
    print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x")), rt.V.float(1000000000000000))]));
    print(rt.showArgs([rt.ops.eq(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), rt.vector2New([rt.V.float(0.100000001), rt.V.int(0)]))]));
    print(rt.showArgs([rt.ops.add(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))]));
    print(rt.showArgs([rt.ops.sub(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))]));
    print(rt.showArgs([rt.ops.neg(rt.vector2New([rt.V.float(1.5), rt.V.int(2)]))]));
    print(rt.showArgs([rt.ops.mul(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(1)]), rt.V.int(2))]));
    print(rt.showArgs([rt.ops.div(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(4)]), rt.V.int(2))]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "length", [])]));
    print(rt.showArgs([rt.method(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(1), rt.V.int(2)]))]));
    print(rt.showArgs([rt.ops.neq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(3)]))]));
    print(rt.showArgs([rt.strBuiltin([rt.vector2New([rt.V.int(2), rt.V.int(3)])])]));
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
