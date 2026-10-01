// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("DIAMONDS"), rt.V.int(5)], [rt.V.str("CLUBS"), rt.V.int(6)]]);

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.method(Suit, "size", [])]));
    print(rt.showArgs([rt.method(Suit, "keys", [])]));
    print(rt.showArgs([rt.method(Suit, "values", [])]));
    print(rt.showArgs([rt.index(Suit, rt.V.str("DIAMONDS"))]));
    print(rt.showArgs([rt.method(Suit, "has", [rt.V.str("CLUBS")])]));
    print(rt.showArgs([rt.method(Suit, "has", [rt.V.str("NOPE")])]));
    for (let k of rt.iter(Suit)) {
      print(rt.showArgs([k]));
    }
    print(rt.showArgs([Suit]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
