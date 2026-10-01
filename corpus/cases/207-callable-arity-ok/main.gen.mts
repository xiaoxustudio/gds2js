// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Base());
    print(rt.showArgs([rt.V.str("r1 "), rt.method(rt.attribute(o, "three"), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(rt.attribute(o, "three"), "bind", [rt.V.int(1), rt.V.int(2)]), "call", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(rt.attribute(o, "three"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
    print(rt.showArgs([rt.V.str("r4 "), rt.method(rt.attribute(o, "three"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(rt.attribute(o, "three"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(rt.attribute(o, "twice"), "call", [rt.V.int(1), rt.V.int(2)]), rt.V.str(" "), rt.method(rt.attribute(o, "twice"), "call", [rt.V.int(5)])]));
    let d = rt.V.object(new Derived());
    print(rt.showArgs([rt.V.str("r7 "), rt.method(rt.attribute(d, "own"), "call", [rt.V.int(7)]), rt.V.str(" "), rt.method(rt.attribute(d, "three"), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    let f = rt.callable((x, y) => {
      return rt.ops.add(x, y);
    });
    print(rt.showArgs([rt.V.str("r8 "), rt.method(f, "call", [rt.V.int(1), rt.V.int(2)]), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(1)]), "call", [rt.V.int(2)])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Base {
  constructor(...__gd_new_args) {
    this.__gd_fields__();
    this._init?.(...__gd_new_args);
  }

  __gd_fields__() {
  }

  three(a, b, c): unknown {
    return rt.strBuiltin([a, b, c]);
  }
  
  twice(x, y = rt.V.str("z")): unknown {
    return rt.strBuiltin([x, y]);
  }
  
  static stwo(a, b): unknown {
    return rt.strBuiltin([a, b]);
  }
  
}
rt.registerClass("Base", Base);
rt.registerMethodArities(Base, { "three": [3, 3], "twice": [1, 2], "stwo": [2, 2] });
rt.registerStaticMethods(Base, ["stwo"]);
rt.registerNativeBase(Base, "RefCounted");

class Derived extends Base {
  __gd_fields__() {
    super.__gd_fields__();
  }

  own(a): unknown {
    return a;
  }
  
}
rt.registerClass("Derived", Derived);
rt.registerMethodArities(Derived, { "own": [1, 1] });

await new Main().run();
