// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
    print(rt.show(rt.V.str("n1 ")), rt.show(rt.method(a, "insert", [rt.V.int(0), rt.V.int(9)])), rt.show(rt.V.str(" ")), rt.show(a));
    print(rt.show(rt.V.str("n2 ")), rt.show(rt.method(a, "insert", [rt.V.int(99), rt.V.int(8)])), rt.show(rt.V.str(" ")), rt.show(a));
    print(rt.show(rt.V.str("n3 ")), rt.show(rt.method(a, "insert", [rt.V.int((-99)), rt.V.int(8)])), rt.show(rt.V.str(" ")), rt.show(a));
    print(rt.show(rt.V.str("n4 ")), rt.show(rt.method(a, "insert", [rt.V.int(3), rt.V.int(7)])), rt.show(rt.V.str(" ")), rt.show(a));
    print(rt.show(rt.V.str("n5 ")), rt.show(rt.method(a, "resize", [rt.V.int(6)])), rt.show(rt.V.str(" ")), rt.show(a));
    print(rt.show(rt.V.str("n6 ")), rt.show(rt.method(a, "resize", [rt.V.int(6)])), rt.show(rt.V.str(" ")), rt.show(rt.method(a, "size", [])));
    print(rt.show(rt.V.str("n7 ")), rt.show(rt.method(a, "resize", [rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(a));
    let t = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
    print(rt.show(rt.V.str("n8 ")), rt.show(rt.method(t, "insert", [rt.V.int(0), rt.V.str("s")])), rt.show(rt.V.str(" ")), rt.show(t));
    print(rt.show(rt.V.str("n9 ")), rt.show(rt.method(t, "insert", [rt.V.int(1), rt.V.int(5)])), rt.show(rt.V.str(" ")), rt.show(t));
    let b = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.show(rt.V.str("n10 ")), rt.show(rt.method(b, "pop_back", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "pop_front", [])), rt.show(rt.V.str(" ")), rt.show(b));
    let c = rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(8), rt.V.int(9)]));
    print(rt.show(rt.V.str("n11 ")), rt.show(rt.method(c, "pop_at", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(c));
    let e = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(1)]));
    rt.method(e, "erase", [rt.V.int(1)]);
    print(rt.show(rt.V.str("n12 ")), rt.show(e));
    let d = rt.dictOf([[rt.V.int(1), rt.V.int(2)]]);
    print(rt.show(rt.V.str("n13 ")), rt.show(rt.method(d, "erase", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "erase", [rt.V.int(9)])), rt.show(rt.V.str(" ")), rt.show(d));
    this.quit();
  }
  
}

await new Main().run();
