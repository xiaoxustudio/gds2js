// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  take_v3(v): void {
    v = rt.paramSlot(v, "Vector3", 1, "take_v3", this);
    print(rt.showArgs([rt.V.str("v3 "), rt.typeOf(v), rt.V.str(" "), v]));
  }
  
  take_v3i(v): void {
    v = rt.paramSlot(v, "Vector3i", 1, "take_v3i", this);
    print(rt.showArgs([rt.V.str("v3i "), rt.typeOf(v), rt.V.str(" "), v]));
  }
  
  take_name(n): void {
    n = rt.paramSlot(n, "StringName", 1, "take_name", this);
    print(rt.showArgs([rt.V.str("name "), rt.typeOf(n), rt.V.str(" "), n]));
  }
  
  async _initialize(): Promise<void> {
    let a = rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    let b = rt.vector3New([rt.V.float(1.7), rt.V.float((-2.9)), rt.V.float(3.1)]);
    let s = "nm";
    this.take_v3(a);
    this.take_v3(b);
    this.take_v3i(b);
    this.take_v3i(a);
    this.take_name(rt.V.str(s));
    this.take_name(rt.V.stringName("lit"));
    print(rt.showArgs([rt.V.str("t "), rt.colorNew([rt.V.int(123456789)]), rt.V.str(" "), a, rt.V.str(" "), b, rt.V.str(" "), rt.typeOf(rt.V.stringName("x"))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
