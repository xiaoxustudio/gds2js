// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

const State = rt.dictOf([[rt.V.str("IDLE"), rt.V.int(0)], [rt.V.str("RUN"), rt.V.int(4)], [rt.V.str("JUMP"), rt.V.int(5)]]);

export class Main extends SceneTree {
  LIMIT = rt.V.int(3);
  static LIMIT = rt.V.int(3);

  async _initialize(): Promise<void> {
    do {
      const __m0 = rt.matchPattern(rt.V.int(3), rt.patConst(Main.LIMIT));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("limit")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.V.int(3), rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("other")]));
        break;
      }
    } while (false);
    do {
      const __m0 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.index(State, rt.V.str("RUN"))));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("run")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.V.int(4), rt.patConst(rt.index(State, rt.V.str("IDLE"))));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("idle")]));
        break;
      }
      const __m2 = rt.matchPattern(rt.V.int(4), rt.patWild());
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("s-other")]));
        break;
      }
    } while (false);
    do {
      const __m0 = rt.matchPattern(rt.index(State, rt.V.str("JUMP")), rt.patConst(rt.index(State, rt.V.str("IDLE"))));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("wrong")]));
        break;
      }
      const __m1 = rt.matchPattern(rt.index(State, rt.V.str("JUMP")), rt.patConst(rt.index(State, rt.V.str("JUMP"))));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("jump")]));
        break;
      }
    } while (false);
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
