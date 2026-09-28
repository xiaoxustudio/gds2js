// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal();

  ifn(): unknown {
    return rt.V.int(7);
  }
  
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    let cb = rt.callableOf(this.ifn.bind(this));
    let sig = this.fired;
    print(rt.show(rt.V.str("u1 ")), rt.show(rt.typeOf(cb)));
    print(rt.show(rt.V.str("u2 ")), rt.show(rt.typeOf(rt.callableOf(this.ifn.bind(this)))));
    print(rt.show(rt.V.str("u3 ")), rt.show(rt.typeOf(sig)));
    print(rt.show(rt.V.str("u4 ")), rt.show(rt.typeOf(this.fired)));
    print(rt.show(rt.V.str("u5 ")), rt.show(rt.typeOf(rt.attribute(b, "boxed"))));
    print(rt.show(rt.V.str("u6 ")), rt.show(rt.method(cb, "call", [])));
    print(rt.show(rt.V.str("u7 ")), rt.show(rt.typeOf(rt.attribute(b, "n"))));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.typeOf(rt.attribute(rt.V.object(new Box()), "boxed"))));
    this.quit();
  }
  
}

class Box {
  boxed = new rt.Signal();
  n = rt.V.int(1);

}
rt.registerClass("Box", Box);
rt.registerFieldTypes(Box, {"n": "int"});

await new Main().run();
