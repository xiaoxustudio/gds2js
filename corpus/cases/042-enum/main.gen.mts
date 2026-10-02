// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("DIAMONDS"), rt.V.int(5)], [rt.V.str("CLUBS"), rt.V.int(6)]]);
const ANON_A = rt.V.int(0);
const ANON_B = rt.V.int(1);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.wrapValue(rt.index(Suit, rt.V.str("HEARTS")))]));
    print(rt.showArgs([rt.wrapValue(rt.index(Suit, rt.V.str("DIAMONDS")))]));
    print(rt.showArgs([rt.wrapValue(rt.index(Suit, rt.V.str("CLUBS")))]));
    print(rt.showArgs([rt.ops.add(rt.wrapValue(rt.index(Suit, rt.V.str("CLUBS"))), rt.V.int(1))]));
    print(rt.showArgs([ANON_A, ANON_B]));
    let c = rt.wrapValue(rt.index(Suit, rt.V.str("DIAMONDS")));
    print(rt.showArgs([c]));
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
const __gd_entry = new Main();
await __gd_entry.run();
