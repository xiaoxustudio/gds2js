// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Base());
    print(rt.showArgs([rt.method(b, "tag", [])]));
    print(rt.showArgs([rt.isType(b, "Base")]));
    print(rt.showArgs([rt.attribute(b, "hp")]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Base {
  hp = rt.V.int(10);

  tag(): unknown {
    return rt.formatOf(rt.V.str("base-%d"), this.hp);
  }
  
}
rt.registerClass("Base", Base);
rt.registerMethodArities(Base, { "tag": [0, 0] });
rt.registerNativeBase(Base, "RefCounted");

await new Main().run();
