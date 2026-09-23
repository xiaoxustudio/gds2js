// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Base());
    print(rt.show(rt.method(b, "tag", [])));
    print(rt.show(rt.isType(b, "Base")));
    print(rt.show(rt.attribute(b, "hp")));
    this.quit();
  }
  
}

class Base {
  hp = rt.V.int(10);

  tag(): unknown {
    return rt.formatOf(rt.V.str("base-%d"), this.hp);
  }
  
}
rt.registerClass("Base", Base);

await new Main().run();
