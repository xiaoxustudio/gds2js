// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("A|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))), rt.V.str("|"), rt.ops.lte(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1)]))), rt.V.str("|"), rt.ops.gte(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1)])))]));
    print(rt.showArgs([rt.V.str("B|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.str("a")]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.str("a")])), rt.V.array(rt.GArray.of([rt.V.int(1)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.nil()])), rt.V.array(rt.GArray.of([rt.V.bool(true)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.float(2.5)])), rt.V.array(rt.GArray.of([rt.V.int(3)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.bool(true)])), rt.V.array(rt.GArray.of([rt.V.int(1)]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.float(2.5)])))]));
    print(rt.showArgs([rt.V.str("C|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])), rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)])]))), rt.V.str("|"), rt.ops.lte(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])), rt.V.array(rt.GArray.of([rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)])]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])])), rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("b"), rt.V.int(2)]])]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a")])])), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("b")])]))), rt.V.str("|"), rt.ops.lte(rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a")])])), rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("b")])])))]));
    print(rt.showArgs([rt.V.str("D|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)]))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2)]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1)]))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([]))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([]))])), rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.nil()]))])))]));
    print(rt.showArgs([rt.V.str("E|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int(7))])), rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int(8))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int(8))])), rt.V.array(rt.GArray.of([rt.gRidFromInt64(rt.V.int(7))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.float((0 / 0))]))), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.float((0 / 0))])), rt.V.array(rt.GArray.of([rt.V.int(1)])))]));
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    let b = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)]));
    print(rt.showArgs([rt.V.str("F|"), rt.ops.lt(a, b), rt.V.str("|"), rt.ops.lt(b, a), rt.V.str("|"), rt.ops.lte(a, a), rt.V.str("|"), rt.ops.eq(a, b), rt.V.str("|"), rt.ops.neq(a, b)]));
    let n = rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.int(1)]));
    let s = rt.V.array(rt.GArray.of([rt.V.stringName("x")]));
    print(rt.showArgs([rt.V.str("G|"), rt.ops.lt(n, s), rt.V.str("|"), rt.ops.lt(s, n), rt.V.str("|"), rt.ops.lte(n, n), rt.V.str("|"), rt.ops.lt(rt.V.array(rt.GArray.of([rt.V.bool(false), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.bool(true)])))]));
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
