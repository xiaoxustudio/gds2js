// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  take_color(c): void {
    c = rt.paramSlot(c, "Color", 1, "take_color", this);
    print(rt.showArgs([rt.V.str("s "), c]));
  }
  
  async _initialize(): Promise<void> {
    let n = 123456789;
    this.take_color(rt.V.int(n));
    this.take_color(rt.V.int((-1)));
    this.take_color(rt.V.int(4294967296));
    this.take_color(rt.V.int(256));
    this.take_color(rt.V.int(16711680));
    this.take_color(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]));
    let s = "abc";
    this.take_color(rt.V.str(s));
    print(rt.showArgs([rt.V.str("d "), rt.colorNew([rt.V.int(1)]), rt.V.str(" "), rt.colorNew([rt.V.int(255)]), rt.V.str(" "), rt.colorNew([rt.V.int(65280)]), rt.V.str(" "), rt.colorNew([rt.V.int(0)]), rt.V.str(" "), rt.colorNew([rt.V.int(4294967295)])]));
    print(rt.showArgs([rt.V.str("e "), rt.colorNew([rt.V.str("red")]), rt.V.str(" "), rt.colorNew([rt.V.str("00ff00")]), rt.V.str(" "), rt.colorNew([rt.V.str("f00")])]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
