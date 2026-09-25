// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.method(rt.V.str("\n"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\t"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\r"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\u0007"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\b"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\f"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\u000b"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\\"), "length", [])));
    print(rt.show(rt.method(rt.V.str("\""), "length", [])));
    print(rt.show(rt.method(rt.V.str("'"), "length", [])));
    print(rt.show(rt.method(rt.V.str("ab\ncd"), "length", [])));
    print(rt.show(rt.ops.eq(rt.V.str("A"), rt.V.str("A"))));
    print(rt.show(rt.ops.eq(rt.V.str("it's"), rt.V.str("it's"))));
    print(rt.show(rt.method(rt.V.str("it's"), "length", [])));
    print(rt.show(rt.method(rt.V.str("a\rb"), "length", [])));
    print(rt.show(rt.ops.eq(rt.V.str(("\\" + "\\")), rt.V.str("\\\\"))));
    print(rt.show(rt.method(rt.V.str("é"), "length", [])));
    print(rt.show(rt.ops.eq(rt.V.str("é"), rt.V.str("é"))));
    this.quit();
  }
  
}

await new Main().run();
