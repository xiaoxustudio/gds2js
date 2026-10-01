// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  TOP = rt.toInt(rt.V.int(42));
  static TOP = rt.toInt(rt.V.int(42));
  NAME = rt.strOf(rt.V.str("outer-name"));
  static NAME = rt.strOf(rt.V.str("outer-name"));

  async _initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    print(rt.showArgs([rt.V.str("t1 "), Main.TOP]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(i, "read_outer", [])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(i, "read_shadow", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(Inner, "read_static_outer", [])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(Inner, "read_static_shadow", [])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(i, "via_self_dot", [])]));
    print(rt.showArgs([rt.V.str("t7 "), Inner.TOP]));
    print(rt.showArgs([rt.V.str("t8 "), rt.attribute(i, "TOP")]));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"TOP": "int", "NAME": "String"});
rt.registerNativeBase(Main, "SceneTree");
class Inner {
  TOP = rt.toInt(rt.V.int(7));
  static TOP = rt.toInt(rt.V.int(7));

  read_outer(): unknown {
    return Main.NAME;
  }
  
  read_shadow(): unknown {
    return Inner.TOP;
  }
  
  static read_static_outer(): unknown {
    return Main.NAME;
  }
  
  static read_static_shadow(): unknown {
    return Inner.TOP;
  }
  
  via_self_dot(): unknown {
    return Inner.TOP;
  }
  
}
rt.registerClass("Inner", Inner);
rt.registerFieldTypes(Inner, {"TOP": "int"});
rt.registerStaticMethods(Inner, ["read_static_outer","read_static_shadow"]);
rt.registerNativeBase(Inner, "RefCounted");

await new Main().run();
