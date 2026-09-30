// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r "), rt.strBuiltin([rt.V.str("a"), rt.V.str("-"), rt.V.str("b")]), rt.V.str(" | "), rt.strBuiltin([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str(" | "), rt.strBuiltin([rt.V.str("x"), rt.V.nil(), rt.V.float(2.5)])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.strBuiltin([rt.V.float(1.7)]), rt.V.str(" "), rt.strBuiltin([rt.V.float((-0))]), rt.V.str(" "), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str(" "), rt.strBuiltin([rt.vector2New([rt.V.float(1.5), rt.V.int(2)])])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.strBuiltin([rt.vector2New([rt.V.float(1.5), rt.V.int(2)]), rt.V.str("+"), rt.V.int(7)]), rt.V.str(" "), rt.stringCtor([rt.V.str("ok")])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
