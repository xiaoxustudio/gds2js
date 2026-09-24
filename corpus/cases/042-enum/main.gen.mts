// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("DIAMONDS"), rt.V.int(5)], [rt.V.str("CLUBS"), rt.V.int(6)]]);
const ANON_A = rt.V.int(0);
const ANON_B = rt.V.int(1);

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.index(Suit, rt.V.str("HEARTS"))));
    print(rt.show(rt.index(Suit, rt.V.str("DIAMONDS"))));
    print(rt.show(rt.index(Suit, rt.V.str("CLUBS"))));
    print(rt.show(rt.ops.add(rt.index(Suit, rt.V.str("CLUBS")), rt.V.int(1))));
    print(rt.show(ANON_A), rt.show(ANON_B));
    let c = rt.index(Suit, rt.V.str("DIAMONDS"));
    print(rt.show(c));
    this.quit();
  }
  
}

await new Main().run();
