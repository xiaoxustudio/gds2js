// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    let c0 = rt.attribute(o, "add3");
    let c1 = rt.method(c0, "bind", [rt.V.int(1)]);
    let c2 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2)]);
    let c3 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
    let ce = rt.method(c0, "bind", []);
    print(rt.showArgs([rt.V.str("r1 "), rt.method(c0, "get_argument_count", []), rt.V.str(" "), rt.method(c1, "get_argument_count", []), rt.V.str(" "), rt.method(c2, "get_argument_count", []), rt.V.str(" "), rt.method(c3, "get_argument_count", []), rt.V.str(" "), rt.method(ce, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(c1, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(c3, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(ce, "get_bound_arguments", []), "size", [])]));
    let st = rt.attribute(Thing, "sadd3");
    print(rt.showArgs([rt.V.str("r3 "), rt.method(st, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(st, "bind", [rt.V.int(1)]), "get_argument_count", [])]));
    let f = rt.callable((x, y, z) => {
      return x;
    });
    print(rt.showArgs([rt.V.str("r4 "), rt.method(f, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(9)]), "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(c0, "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.method(c0, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(c2, "call", [rt.V.int(3)])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Thing {
  add3(a, b, c): unknown {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
  static sadd3(a, b, c): unknown {
    return rt.ops.add(rt.ops.add(a, b), c);
  }
  
}
rt.registerClass("Thing", Thing);
rt.registerMethodArities(Thing, { "add3": [3, 3], "sadd3": [3, 3] });
rt.registerStaticMethods(Thing, ["sadd3"]);
rt.registerNativeBase(Thing, "RefCounted");

await new Main().run();
