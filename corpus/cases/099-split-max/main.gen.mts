// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(0)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int((-1))])));
    print(rt.show(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(2)])));
    print(rt.show(rt.method(rt.V.str("a,,b"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,,c,d"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,,c,d"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(3)])));
    print(rt.show(rt.method(rt.V.str(",a,"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(",a,"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(",a,,b,"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])));
    print(rt.show(rt.method(rt.V.str(",a,,b,"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("  a  "), "split", [rt.V.str(" "), rt.V.bool(false), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(",,,"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])));
    print(rt.show(rt.method(rt.V.str("aa"), "split", [rt.V.str("a"), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("aa"), "split", [rt.V.str("a"), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("aaa"), "split", [rt.V.str("aa"), rt.V.bool(true), rt.V.int(1)])));
    print(rt.show(rt.method(rt.V.str("a,b,"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a, ,b"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(2)])));
    print(rt.show(rt.method(rt.V.str("abc"), "split", [rt.V.str(""), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("abc"), "split", [rt.V.str(""), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("abc"), "split", [rt.V.str(""), rt.V.bool(true), rt.V.int(2)])));
    print(rt.show(rt.method(rt.V.str("ab,,cd"), "split", [rt.V.str(""), rt.V.bool(false), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a::b::c"), "split", [rt.V.str("::"), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,b,c"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(5)])));
    print(rt.show(rt.method(rt.V.str(""), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(""), "split", [rt.V.str(","), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("x"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])));
    print(rt.show(rt.method(rt.V.str("a,b,c,d"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(2)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("aXXbXXc"), "split", [rt.V.str("XX"), rt.V.bool(false), rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a,,,b"), "split", [rt.V.str(","), rt.V.bool(true), rt.V.int(1)])));
    this.quit();
  }
  
}

await new Main().run();
