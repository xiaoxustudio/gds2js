// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("A")]));
    print(rt.showArgs([rt.method(rt.V.str("A"), "length", [])]));
    print(rt.showArgs([rt.V.str("A")]));
    print(rt.showArgs([rt.method(rt.V.str("A"), "length", [])]));
    print(rt.showArgs([rt.V.str("Ƕ00")]));
    print(rt.showArgs([rt.method(rt.V.str("Ƕ00"), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("Ƕ00"), rt.V.str("Ƕ00"))]));
    print(rt.showArgs([rt.V.str("𐀀")]));
    print(rt.showArgs([rt.method(rt.V.str("𐀀"), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("𐀀"), rt.V.str("𐀀"))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("𐀀"), rt.V.str("𐀀"))]));
    print(rt.showArgs([rt.method(rt.V.str("𐀀"), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("𐀀x"), rt.V.str("𐀀x"))]));
    print(rt.showArgs([rt.method(rt.V.str("𐀀x"), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("𐀀"), rt.V.str("𐀀"))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("􏿿"), rt.V.str("􏿿"))]));
    print(rt.showArgs([rt.method(rt.V.str("􏿿"), "length", [])]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("é"), rt.V.str("é"))]));
    print(rt.showArgs([rt.ops.eq(rt.V.str("ÿ"), rt.V.str("ÿ"))]));
    print(rt.showArgs([rt.V.str("AB")]));
    print(rt.showArgs([rt.method(rt.V.str("a\tb"), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a\bc"), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str("\u000b"), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str("a'b\"c"), "length", [])]));
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
