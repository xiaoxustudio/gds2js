// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let s = "12abc";
    print(rt.showArgs([rt.V.str("t1 "), rt.method(rt.V.object(new A()), "p", [rt.V.str(s)])]));
    print(rt.showArgs([rt.V.str("t2 不该到这里")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class A {
  p(a): unknown {
    a = rt.paramSlot(a, "int", 1, "p", this);
    return rt.ops.add(rt.V.str("ok<-"), rt.strOf(a));
  }
  
}
rt.registerClass("A", A);
rt.registerNativeBase(A, "RefCounted");

await new Main().run();
