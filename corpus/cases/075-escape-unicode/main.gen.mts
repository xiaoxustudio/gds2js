// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
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
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
