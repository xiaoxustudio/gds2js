// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("SPADES"), rt.V.int(1)]]);

export class Main extends SceneTree {
  TOP = rt.V.int(42);
  static TOP = rt.V.int(42);

  async _initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    print(rt.show(rt.V.str("t1 ")), rt.show(rt.method(i, "useconst", [])));
    print(rt.show(rt.V.str("t2 ")), rt.show(rt.method(i, "useenum", [])));
    print(rt.show(rt.V.str("t3 ")), rt.show(rt.method(i, "useother", [])));
    print(rt.show(rt.V.str("t4 ")), rt.show(rt.method(i, "ownconst", [])));
    print(rt.show(rt.V.str("t5 ")), rt.show(Inner.IC));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"TOP": "int"});
rt.registerNativeBase(Main, "SceneTree");
class Other {
  OC = rt.V.int(5);
  static OC = rt.V.int(5);

  getoc(): unknown {
    return Other.OC;
  }
  
}
rt.registerClass("Other", Other);
rt.registerFieldTypes(Other, {"OC": "int"});
rt.registerNativeBase(Other, "RefCounted");

class Inner {
  IC = rt.V.int(9);
  static IC = rt.V.int(9);

  useconst(): unknown {
    return Main.TOP;
  }
  
  useenum(): unknown {
    return rt.index(Suit, rt.V.str("HEARTS"));
  }
  
  useother(): unknown {
    return rt.method(rt.V.object(new Other()), "getoc", []);
  }
  
  ownconst(): unknown {
    return Inner.IC;
  }
  
}
rt.registerClass("Inner", Inner);
rt.registerFieldTypes(Inner, {"IC": "int"});
rt.registerNativeBase(Inner, "RefCounted");

await new Main().run();
