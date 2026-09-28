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
    print(rt.showArgs([rt.V.str("u1 "), rt.method(Inner, "make", [])]));
    print(rt.showArgs([rt.V.str("u2 "), rt.method(Inner, "twice", [rt.V.int(21)])]));
    print(rt.showArgs([rt.V.str("u3 "), rt.method(Inner, "selfcall", [])]));
    print(rt.showArgs([rt.V.str("u4 "), rt.method(Inner, "readconst", [])]));
    print(rt.showArgs([rt.V.str("u5 "), rt.method(Inner, "rec", [rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "usestatic", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.method(p, "make", [])]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(p, "twice", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("u9 "), rt.typeOf(rt.attribute(Inner, "make"))]));
    print(rt.showArgs([rt.V.str("u10 "), rt.method(rt.attribute(Inner, "make"), "call", [])]));
    print(rt.showArgs([rt.V.str("u11 "), Main.helper()]));
    print(rt.showArgs([rt.V.str("u12 "), Main.usehelper()]));
    print(rt.showArgs([rt.V.str("u13 "), this.outerbare()]));
    print(rt.showArgs([rt.V.str("u14 "), Main.helper()]));
    let cb = rt.attribute(Inner, "make");
    print(rt.showArgs([rt.V.str("u15 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "call", [])]));
    print(rt.showArgs([rt.V.str("u16 "), rt.typeOf(rt.callableOf(Main.usehelper.bind(Main), "usehelper"))]));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"TOP": "int"});
rt.registerStaticMethods(Main, ["helper","usehelper"]);
rt.registerNativeBase(Main, "SceneTree");
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
rt.registerNativeBase(Inner, "RefCounted");

await new Main().run();
