// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
  PI = rt.V.int(1);
  static PI = rt.V.int(1);

  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r1 "), Main.PI, rt.V.str(" "), rt.typeOf(Main.PI)]));
    print(rt.showArgs([rt.V.str("r2 "), Thing.PIISH, rt.V.str(" "), rt.method(Thing, "sm", [])]));
    print(rt.showArgs([rt.V.str("r3 "), TAU, rt.V.str(" "), rt.typeOf(TAU)]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  PIISH = Main.PI;
  static PIISH = Main.PI;

  static sm(): unknown {
    return TAU;
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerMethodArities(Thing, { "sm": [0, 0] });
rt.registerStaticMethods(Thing, ["sm"]);
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
