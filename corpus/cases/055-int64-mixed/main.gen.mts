// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.div(rt.V.int(9223372036854775807n), rt.V.int(2))]));
    print(rt.showArgs([rt.ops.mod(rt.V.int(9223372036854775807n), rt.V.int(1000))]));
    print(rt.showArgs([rt.ops.mod(rt.ops.neg(rt.V.int(9223372036854775807n)), rt.V.int(1000))]));
    print(rt.showArgs([rt.ops.mul(rt.V.int(4000000000), rt.V.int(4000000000))]));
    print(rt.showArgs([rt.ops.mul(rt.V.int(3000000000), rt.V.int(3000000000))]));
    print(rt.showArgs([rt.ops.mul(rt.ops.mul(rt.V.int(100000000), rt.V.int(100000000)), rt.V.int(100000000))]));
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(5000000000, 5000000000))]));
    let z = rt.ops.mul(rt.V.int(4000000000), rt.V.int(4000000000));
    print(rt.showArgs([z]));
    print(rt.showArgs([rt.ops.add(z, rt.V.int(1))]));
    print(rt.showArgs([rt.ops.mul(z, rt.V.int(2))]));
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
    print(rt.showArgs([rt.method(d, "size", [])]));
    print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.int(9223372036854775807n)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(d, rt.V.int(1)))]));
    print(rt.showArgs([rt.wrapValue(rt.index(d, rt.ops.neg(rt.V.int(9223372036854775808n))))]));
    print(rt.showArgs([rt.ops.lt(rt.V.int(4611686018427387904n), rt.V.int(4611686018427387905n))]));
    print(rt.showArgs([rt.ops.eq(rt.V.int(4611686018427387904n), rt.V.int(4611686018427387904n))]));
    print(rt.showArgs([rt.ops.eq(rt.V.int(9223372036854775807n), rt.V.float(9223372036854776000))]));
    print(rt.showArgs([rt.ops.lt(rt.V.int(1), rt.V.int(9223372036854775807n))]));
    let a = rt.V.array(rt.GArray.of([rt.V.int(9223372036854775807n), rt.V.int(1), rt.ops.neg(rt.V.int(9223372036854775808n))]));
    rt.method(a, "sort", []);
    print(rt.showArgs([a]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
