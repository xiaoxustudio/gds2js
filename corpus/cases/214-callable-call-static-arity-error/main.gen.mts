// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let c = rt.attribute(Base, "stwo");
    print(rt.showArgs([rt.V.str("r "), rt.method(c, "call", [rt.V.int(1)])]));
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
