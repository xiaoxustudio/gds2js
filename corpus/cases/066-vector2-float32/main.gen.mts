// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.vector2New([rt.V.int(4), rt.V.int(6)])));
    print(rt.show(rt.vector2New([rt.V.float(1.5), rt.V.float(2.25)])));
    print(rt.show(rt.vector2New([rt.V.float(1.2345678901234567), rt.V.float((0.1 + 0.2))])));
    print(rt.show(rt.vector2New([rt.V.float((-0)), rt.V.float((-3.7))])));
    print(rt.show(rt.vector2New([rt.V.float(1.0000000000000002), rt.V.float(1e-8)])));
    print(rt.show(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(3.5), rt.V.int(4)])]))));
    print(rt.show(rt.V.array(rt.GArray.of([rt.V.float(100000000000000000000), rt.vector2New([rt.V.float(1000000000000000), rt.V.int(2)])]))));
    print(rt.show(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x")));
    print(rt.show(rt.attribute(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), "x")));
    print(rt.show(rt.attribute(rt.vector2New([rt.V.float(1.2345678901234567), rt.V.int(0)]), "x")));
    print(rt.show(rt.ops.eq(rt.attribute(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "x"), rt.V.float(1000000000000000))));
    print(rt.show(rt.ops.eq(rt.vector2New([rt.V.float(0.1), rt.V.int(0)]), rt.vector2New([rt.V.float(0.100000001), rt.V.int(0)]))));
    print(rt.show(rt.ops.add(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))));
    print(rt.show(rt.ops.sub(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)]))));
    print(rt.show(rt.ops.neg(rt.vector2New([rt.V.float(1.5), rt.V.int(2)]))));
    print(rt.show(rt.ops.mul(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(1)]), rt.V.int(2))));
    print(rt.show(rt.ops.div(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(4)]), rt.V.int(2))));
    print(rt.show(rt.method(rt.vector2New([rt.V.int(3), rt.V.int(4)]), "length", [])));
    print(rt.show(rt.method(rt.vector2New([rt.V.float(1000000000000000), rt.V.int(0)]), "length", [])));
    print(rt.show(rt.ops.eq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.float(1), rt.V.int(2)]))));
    print(rt.show(rt.ops.neq(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(3)]))));
    print(rt.show(rt.strOf(rt.vector2New([rt.V.int(2), rt.V.int(3)]))));
    this.quit();
  }
  
}

await new Main().run();
