// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
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
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
