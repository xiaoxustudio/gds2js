// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.stringStatic("chr", [rt.V.int(65)])]));
    print(rt.showArgs([rt.method(rt.stringStatic("chr", [rt.V.int(97)]), "length", [])]));
    print(rt.showArgs([rt.stringStatic("chr", [rt.V.int(128512)])]));
    print(rt.showArgs([rt.method(rt.stringStatic("chr", [rt.V.int(1114111)]), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.stringStatic("chr", [rt.V.float(2.7)]), rt.stringStatic("chr", [rt.V.int(2)]))]));
    print(rt.showArgs([rt.ops.eq(rt.stringStatic("chr", [rt.V.bool(true)]), rt.stringStatic("chr", [rt.V.int(1)]))]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.int(42)])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float(1.5)])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float(100000000000000000000)])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float((0.1 + 0.2))])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float(1e-7)])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float(123456789012345.6)])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float((1 / 0))])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float((0 / 0))])]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float((-1.5))])]));
    print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.int(9007199254740993n)])]));
    print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.float(1.7)])]));
    print(rt.showArgs([rt.stringStatic("num_int64", [rt.V.int((-5))])]));
    print(rt.showArgs([rt.stringCtor([rt.V.str("x")])]));
    print(rt.showArgs([rt.method(rt.stringCtor([rt.V.str(("x" + "y"))]), "length", [])]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.strOf(rt.V.int(42)), rt.V.str("|")), rt.stringStatic("num", [rt.V.int(42)]))]));
    print(rt.showArgs([rt.V.float((-0))]));
    print(rt.showArgs([rt.stringStatic("num", [rt.V.float((-0))])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
