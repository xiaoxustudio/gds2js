// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let d = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.str("two")]]);
    do {
      const __m0 = rt.matchPattern(d, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))], [rt.V.str("b"), rt.patLit(rt.V.str("two"))]]));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("exact")]));
        break;
      }
      const __m1 = rt.matchPattern(d, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("other")]));
        break;
      }
    } while (false);
    let e = rt.dictOf([[rt.V.str("x"), rt.V.int(10)], [rt.V.str("y"), rt.V.int(20)]]);
    do {
      const __m0 = rt.matchPattern(e, rt.patDict([[rt.V.str("x"), rt.patLit(rt.V.int(10))], [rt.V.str("y"), rt.patLit(rt.V.int(99))]]));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("wrong-val")]));
        break;
      }
      const __m1 = rt.matchPattern(e, rt.patDict([[rt.V.str("x"), rt.patWild()], [rt.V.str("y"), rt.patLit(rt.V.int(20))]]));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("wild-x")]));
        break;
      }
      const __m2 = rt.matchPattern(e, rt.patWild());
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("e-fallback")]));
        break;
      }
    } while (false);
    let n = rt.dictOf([[rt.V.str("p"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]]);
    do {
      const __m0 = rt.matchPattern(n, rt.patDict([[rt.V.str("p"), rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))])]]));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("nested-arr")]));
        break;
      }
    } while (false);
    let big = rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)], [rt.V.str("c"), rt.V.int(3)]]);
    do {
      const __m0 = rt.matchPattern(big, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))], [rt.V.str("b"), rt.patLit(rt.V.int(2))]]));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("subset-should-not-run")]));
        break;
      }
      const __m1 = rt.matchPattern(big, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("exact-only")]));
        break;
      }
    } while (false);
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
