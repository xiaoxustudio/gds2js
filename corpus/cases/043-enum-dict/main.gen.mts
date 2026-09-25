// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("DIAMONDS"), rt.V.int(5)], [rt.V.str("CLUBS"), rt.V.int(6)]]);

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.method(Suit, "size", [])));
    print(rt.show(rt.method(Suit, "keys", [])));
    print(rt.show(rt.method(Suit, "values", [])));
    print(rt.show(rt.index(Suit, rt.V.str("DIAMONDS"))));
    print(rt.show(rt.method(Suit, "has", [rt.V.str("CLUBS")])));
    print(rt.show(rt.method(Suit, "has", [rt.V.str("NOPE")])));
    for (let k of rt.iter(Suit)) {
      print(rt.show(k));
    }
    print(rt.show(Suit));
    this.quit();
  }
  
}

await new Main().run();
