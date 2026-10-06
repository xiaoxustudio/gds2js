// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.variantHash([rt.V.int(0)])]));
    print(rt.showArgs([rt.variantHash([rt.V.int(1)])]));
    print(rt.showArgs([rt.variantHash([rt.V.int(7)])]));
    print(rt.showArgs([rt.variantHash([rt.V.int((-1))])]));
    print(rt.showArgs([rt.variantHash([rt.V.int((-7))])]));
    print(rt.showArgs([rt.variantHash([rt.V.int(1000000007)])]));
    print(rt.showArgs([rt.variantHash([rt.V.int(4294967295)])]));
    print(rt.showArgs([rt.variantHash([rt.V.int(4294967296)])]));
    print(rt.showArgs([rt.variantHash([rt.V.bool(true)])]));
    print(rt.showArgs([rt.variantHash([rt.V.bool(false)])]));
    print(rt.showArgs([rt.variantHash([rt.V.nil()])]));
    print(rt.showArgs([rt.variantHash([rt.V.str("a")])]));
    print(rt.showArgs([rt.variantHash([rt.V.str("A")])]));
    print(rt.showArgs([rt.variantHash([rt.V.float(0)])]));
    print(rt.showArgs([rt.variantHash([rt.V.float((-0))])]));
    print(rt.showArgs([rt.variantHash([rt.V.float(1)])]));
    print(rt.showArgs([rt.variantHash([rt.V.float(2.5)])]));
    print(rt.showArgs([rt.variantHash([INF])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1)])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.float(1)])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.str("a")])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.bool(true)])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.nil()])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))])), "hash", [])]));
    print(rt.showArgs([rt.variantHash([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
    print(rt.showArgs([rt.method(rt.dictOf([]), "hash", [])]));
    print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "hash", [])]));
    print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), "hash", [])]));
    print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), "hash", [])]));
    print(rt.showArgs([rt.method(rt.dictOf([[rt.V.str("a"), rt.V.str("b")]]), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.array(rt.GArray.of([INF])), "hash", [])]));
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
