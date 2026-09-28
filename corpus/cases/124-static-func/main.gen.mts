// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  TOP = rt.V.int(42);
  static TOP = rt.V.int(42);

  static helper(): unknown {
    return rt.ops.add(Main.TOP, rt.V.int(1));
  }
  
  static usehelper(): unknown {
    return Main.helper();
  }
  
  outerbare(): unknown {
    return Main.helper();
  }
  
  async _initialize(): Promise<void> {
    let p = rt.V.object(new Inner());
    print(rt.show(rt.V.str("u1 ")), rt.show(rt.method(Inner, "make", [])));
    print(rt.show(rt.V.str("u2 ")), rt.show(rt.method(Inner, "twice", [rt.V.int(21)])));
    print(rt.show(rt.V.str("u3 ")), rt.show(rt.method(Inner, "selfcall", [])));
    print(rt.show(rt.V.str("u4 ")), rt.show(rt.method(Inner, "readconst", [])));
    print(rt.show(rt.V.str("u5 ")), rt.show(rt.method(Inner, "rec", [rt.V.int(10)])));
    print(rt.show(rt.V.str("u6 ")), rt.show(rt.method(p, "usestatic", [])));
    print(rt.show(rt.V.str("u7 ")), rt.show(rt.method(p, "make", [])));
    print(rt.show(rt.V.str("u8 ")), rt.show(rt.method(p, "twice", [rt.V.int(3)])));
    print(rt.show(rt.V.str("u9 ")), rt.show(rt.typeOf(rt.attribute(Inner, "make"))));
    print(rt.show(rt.V.str("u10 ")), rt.show(rt.method(rt.attribute(Inner, "make"), "call", [])));
    print(rt.show(rt.V.str("u11 ")), rt.show(Main.helper()));
    print(rt.show(rt.V.str("u12 ")), rt.show(Main.usehelper()));
    print(rt.show(rt.V.str("u13 ")), rt.show(this.outerbare()));
    print(rt.show(rt.V.str("u14 ")), rt.show(Main.helper()));
    let cb = rt.attribute(Inner, "make");
    print(rt.show(rt.V.str("u15 ")), rt.show(rt.typeOf(cb)), rt.show(rt.V.str(" ")), rt.show(rt.method(cb, "call", [])));
    print(rt.show(rt.V.str("u16 ")), rt.show(rt.typeOf(rt.callableOf(Main.usehelper.bind(Main)))));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"TOP": "int"});
rt.registerStaticMethods(Main, ["helper","usehelper"]);
class Inner {
  CV = rt.V.int(99);
  static CV = rt.V.int(99);
  mv = rt.V.int(7);

  static make(): unknown {
    return rt.V.str("made");
  }
  
  static twice(x): unknown {
    return rt.ops.mul(x, rt.V.int(2));
  }
  
  static selfcall(): unknown {
    return Inner.twice(rt.V.int(21));
  }
  
  static readconst(): unknown {
    return Inner.CV;
  }
  
  static rec(n): unknown {
    if (rt.ops.truthy(rt.ops.lte(n, rt.V.int(0)))) {
      return rt.V.int(0);
    }
    return rt.ops.add(n, Inner.rec(rt.ops.sub(n, rt.V.int(1))));
  }
  
  usestatic(): unknown {
    return Inner.make();
  }
  
}
rt.registerClass("Inner", Inner);
rt.registerFieldTypes(Inner, {"CV": "int", "mv": "int"});
rt.registerStaticMethods(Inner, ["make","twice","selfcall","readconst","rec"]);

await new Main().run();
