// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

  ifn(): unknown {
    return rt.V.int(7);
  }
  
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    let cb = rt.callableOf(this.ifn.bind(this), "ifn", rt.V.object(this));
    let sig = this.fired;
    print(rt.showArgs([rt.V.str("u1 "), rt.typeOf(cb)]));
    print(rt.showArgs([rt.V.str("u2 "), rt.typeOf(rt.callableOf(this.ifn.bind(this), "ifn", rt.V.object(this)))]));
    print(rt.showArgs([rt.V.str("u3 "), rt.typeOf(sig)]));
    print(rt.showArgs([rt.V.str("u4 "), rt.typeOf(this.fired)]));
    print(rt.showArgs([rt.V.str("u5 "), rt.typeOf(rt.attribute(b, "boxed"))]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(cb, "call", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.typeOf(rt.attribute(b, "n"))]));
    print(rt.showArgs([rt.V.str("u8 "), rt.typeOf(rt.attribute(rt.V.object(new Box()), "boxed"))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class Box {
  boxed = new rt.Signal("boxed");
  n = rt.toInt(rt.V.int(1));

}
rt.registerClass("Box", Box);
rt.registerFieldTypes(Box, {"n": "int"});
rt.registerNativeBase(Box, "RefCounted");

await new Main().run();
