// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.ops.div(rt.V.int(9223372036854775807n), rt.V.int(2))));
    print(rt.show(rt.ops.mod(rt.V.int(9223372036854775807n), rt.V.int(1000))));
    print(rt.show(rt.ops.mod(rt.ops.neg(rt.V.int(9223372036854775807n)), rt.V.int(1000))));
    print(rt.show(rt.ops.mul(rt.V.int(4000000000), rt.V.int(4000000000))));
    print(rt.show(rt.ops.mul(rt.V.int(3000000000), rt.V.int(3000000000))));
    print(rt.show(rt.ops.mul(rt.ops.mul(rt.V.int(100000000), rt.V.int(100000000)), rt.V.int(100000000))));
    print(rt.show(rt.V.int(rt.fast.iAddC(5000000000, 5000000000))));
    let z = rt.ops.mul(rt.V.int(4000000000), rt.V.int(4000000000));
    print(rt.show(z));
    print(rt.show(rt.ops.add(z, rt.V.int(1))));
    print(rt.show(rt.ops.mul(z, rt.V.int(2))));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.V.int(9223372036854775807n), rt.V.str("big"));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.V.int(1), rt.V.str("one"));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.ops.neg(rt.V.int(9223372036854775808n)), rt.V.str("min"));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(rt.method(d, "size", [])));
    print(rt.show(rt.index(d, rt.V.int(9223372036854775807n))));
    print(rt.show(rt.index(d, rt.V.int(1))));
    print(rt.show(rt.index(d, rt.ops.neg(rt.V.int(9223372036854775808n)))));
    print(rt.show(rt.ops.lt(rt.V.int(4611686018427387904n), rt.V.int(4611686018427387905n))));
    print(rt.show(rt.ops.eq(rt.V.int(4611686018427387904n), rt.V.int(4611686018427387904n))));
    print(rt.show(rt.ops.eq(rt.V.int(9223372036854775807n), rt.V.float(9223372036854776000))));
    print(rt.show(rt.ops.lt(rt.V.int(1), rt.V.int(9223372036854775807n))));
    let a = rt.V.array(rt.GArray.of([rt.V.int(9223372036854775807n), rt.V.int(1), rt.ops.neg(rt.V.int(9223372036854775808n))]));
    rt.method(a, "sort", []);
    print(rt.show(a));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
