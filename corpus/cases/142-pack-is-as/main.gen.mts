// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let b = rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]);
    let i = rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(7)]))]);
    print(rt.showArgs([rt.V.str("r1 "), rt.isType(b, "PackedByteArray"), rt.V.str(" "), rt.isType(b, "PackedInt32Array"), rt.V.str(" "), rt.isType(b, "Array"), rt.V.str(" "), rt.isType(b, "Object"), rt.V.str(" "), rt.isType(b, "Variant")]));
    print(rt.showArgs([rt.V.str("r2 "), rt.isType(i, "PackedInt32Array"), rt.V.str(" "), rt.isType(i, "PackedStringArray"), rt.V.str(" "), rt.isType(i, "PackedByteArray")]));
    let c = rt.asType(b, "PackedByteArray");
    print(rt.showArgs([rt.V.str("r3 "), c, rt.V.str(" "), rt.ops.eq(c, b), rt.V.str(" "), rt.method(c, "size", [])]));
    let v = 1;
    print(rt.showArgs([rt.V.str("r4 "), rt.isType(rt.V.int(v), "PackedByteArray"), rt.V.str(" "), rt.isType(rt.V.int(v), "int")]));
    print(rt.showArgs([rt.V.str("r5 "), rt.typeOf(b), rt.V.str(" "), rt.index(rt.asType(i, "PackedInt32Array"), rt.V.int(0)), rt.V.str(" "), rt.method(rt.asType(i, "PackedInt32Array"), "size", [])]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
