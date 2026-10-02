// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.toInt(rt.V.float(3.7))]));
    print(rt.showArgs([rt.toInt(rt.V.float((-3.7)))]));
    print(rt.showArgs([rt.toInt(rt.V.float((-0.5)))]));
    print(rt.showArgs([rt.toInt(rt.V.bool(true))]));
    print(rt.showArgs([rt.toInt(rt.V.bool(false))]));
    print(rt.showArgs([rt.toInt(rt.V.float(9007199254740992))]));
    print(rt.showArgs([rt.toInt(rt.V.float(100000000000000000000))]));
    print(rt.showArgs([rt.toInt(rt.V.float(1e+300))]));
    let z = 0;
    print(rt.showArgs([rt.toInt(rt.V.float((z / z)))]));
    print(rt.showArgs([rt.toInt(rt.V.float((1 / z)))]));
    print(rt.showArgs([rt.toInt(rt.V.float(((-1) / z)))]));
    print(rt.showArgs([rt.toInt(rt.V.str("42"))]));
    print(rt.showArgs([rt.toInt(rt.V.str("-42"))]));
    print(rt.showArgs([rt.toInt(rt.V.str("12x"))]));
    print(rt.showArgs([rt.toInt(rt.V.str("abc"))]));
    print(rt.showArgs([rt.toInt(rt.V.str(""))]));
    print(rt.showArgs([rt.toInt(rt.V.str("0x10"))]));
    print(rt.showArgs([rt.toInt(rt.V.str("1e3"))]));
    print(rt.showArgs([rt.toInt(rt.V.str("3.9"))]));
    print(rt.showArgs([rt.toInt(rt.V.str(" 42 "))]));
    print(rt.showArgs([rt.toInt(rt.V.str("+7"))]));
    print(rt.showArgs([rt.toFloat(rt.V.int(3))]));
    print(rt.showArgs([rt.toFloat(rt.V.bool(true))]));
    print(rt.showArgs([rt.toFloat(rt.V.str("1.5"))]));
    print(rt.showArgs([rt.toFloat(rt.V.str(".5"))]));
    print(rt.showArgs([rt.toFloat(rt.V.str("1e3"))]));
    print(rt.showArgs([rt.toFloat(rt.V.str(" 1.5 "))]));
    print(rt.showArgs([rt.toFloat(rt.V.str("-2.5e2"))]));
    print(rt.showArgs([rt.toFloat(rt.V.str("abc"))]));
    print(rt.showArgs([rt.toFloat(rt.V.str("0x10"))]));
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
