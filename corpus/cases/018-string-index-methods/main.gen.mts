// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let s = rt.V.str("hello");
    print(rt.show(rt.index(s, rt.V.int(0))));
    print(rt.show(rt.method(s, "length", [])));
    print(rt.show(rt.method(s, "substr", [rt.V.int(1), rt.V.int(3)])));
    print(rt.show(rt.method(s, "to_upper", [])));
    print(rt.show(rt.formatOf(rt.V.str("%d/%s"), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.str("x")])))));
    this.quit();
  }
  
}

await new Main().run();
