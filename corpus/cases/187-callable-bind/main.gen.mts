// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  add3(a, b, c): unknown {
    return rt.strBuiltin([a, rt.V.str("-"), b, rt.V.str("-"), c]);
  }
  
  async _initialize(): Promise<void> {
    let cb = rt.method(rt.callableOf(this.add3.bind(this), "add3", rt.V.object(this)), "bind", [rt.V.str("x")]);
    print(rt.showArgs([rt.V.str("r "), rt.method(cb, "call", [rt.V.str("y"), rt.V.str("z")])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(rt.callableOf(this.add3.bind(this), "add3", rt.V.object(this)), "bind", [rt.V.str("x"), rt.V.str("y")]), "call", [rt.V.str("z")])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(rt.method(rt.method(rt.callableOf(this.add3.bind(this), "add3", rt.V.object(this)), "bind", [rt.V.str("m")]), "bind", [rt.V.str("n")]), "call", [rt.V.str("p")])]));
    let full = rt.method(rt.callableOf(this.add3.bind(this), "add3", rt.V.object(this)), "bind", [rt.V.str("x"), rt.V.str("y"), rt.V.str("z")]);
    print(rt.showArgs([rt.V.str("r4 "), rt.method(full, "call", []), rt.V.str(" "), rt.method(full, "get_bound_arguments", []), rt.V.str(" "), rt.method(full, "get_argument_count", []), rt.V.str(" "), rt.method(full, "get_method", [])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.str("y"), rt.V.str("z")]))])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(cb, "is_valid", []), rt.V.str(" "), rt.method(rt.method(cb, "get_bound_arguments", []), "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "add3": [3, 3], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
