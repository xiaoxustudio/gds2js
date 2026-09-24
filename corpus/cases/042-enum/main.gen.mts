// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = Object.freeze({ HEARTS: rt.V.int(0), DIAMONDS: rt.V.int(5), CLUBS: rt.V.int(6) });
const ANON_A = rt.V.int(0);
const ANON_B = rt.V.int(1);

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.attribute(Suit, "HEARTS")));
    print(rt.show(rt.attribute(Suit, "DIAMONDS")));
    print(rt.show(rt.attribute(Suit, "CLUBS")));
    print(rt.show(rt.ops.add(rt.attribute(Suit, "CLUBS"), rt.V.int(1))));
    print(rt.show(ANON_A), rt.show(ANON_B));
    let c = rt.attribute(Suit, "DIAMONDS");
    print(rt.show(c));
    this.quit();
  }
  
}

await new Main().run();
