// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let sn = rt.toStringNameSlot(rt.V.stringName("abc"));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "hash", []), rt.V.str(" "), rt.method(rt.V.str(""), "hash", []), rt.V.str(" "), rt.method(rt.V.str("a"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("Hello, World!"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("你好"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("😀"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("😀😁"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("￿"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("𐀀"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("abcdefghijklmnopqrstuvwxyz"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("the quick brown fox jumps over the lazy dog"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("0123456789"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("A"), "hash", []), rt.V.str(" "), rt.method(rt.V.str(" "), "hash", []), rt.V.str(" "), rt.method(rt.V.str("abcabc"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("0"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("z"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("\t\n\\\""), "hash", []), rt.V.str(" "), rt.method(sn, "hash", []), rt.V.str(" "), rt.variantHash([rt.V.str("abc")]), rt.V.str(" "), rt.variantHash([sn]), rt.V.str(" "), rt.variantHash([rt.V.str("")]), rt.V.str(" "), rt.variantHash([rt.V.str("你好")])]));
    print(rt.showArgs([rt.variantHash([rt.V.bool(true)]), rt.V.str(" "), rt.variantHash([rt.V.bool(false)]), rt.V.str(" "), rt.variantHash([rt.V.nil()])]));
    print(rt.showArgs([rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abc"), "hash", [])), rt.V.str(" "), rt.ops.lt(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", [])), rt.V.str(" "), rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", []))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
