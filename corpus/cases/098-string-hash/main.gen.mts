// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let sn = rt.V.stringName("abc");
    print(rt.show(rt.method(rt.V.str("abc"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(""), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("a"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("Hello, World!"), "hash", [])));
    print(rt.show(rt.method(rt.V.str("你好"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("😀"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("😀😁"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("￿"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("𐀀"), "hash", [])));
    print(rt.show(rt.method(rt.V.str("abcdefghijklmnopqrstuvwxyz"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("the quick brown fox jumps over the lazy dog"), "hash", [])));
    print(rt.show(rt.method(rt.V.str("0123456789"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("A"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str(" "), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("abcabc"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("0"), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(rt.V.str("z"), "hash", [])));
    print(rt.show(rt.method(rt.V.str("\t\n\\\""), "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(sn, "hash", [])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([rt.V.str("abc")])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([sn])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([rt.V.str("")])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([rt.V.str("你好")])));
    print(rt.show(rt.variantHash([rt.V.bool(true)])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([rt.V.bool(false)])), rt.show(rt.V.str(" ")), rt.show(rt.variantHash([rt.V.nil()])));
    print(rt.show(rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abc"), "hash", []))), rt.show(rt.V.str(" ")), rt.show(rt.ops.lt(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", []))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", []))));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
