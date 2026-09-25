// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(1e-7)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(0.00001)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(0.0001)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(0.1)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(1.5)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.int(0)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.int(1)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(1000)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(1000000000000000)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(100000000000000000000)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(123456789012345.6)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float((1 / 0))])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float((0 / 0))])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.int(42)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.ops.neg(rt.V.float(1.5))])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(9.9999999e-7)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(1e-20)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.float(100000000000000)])));
    print(rt.show(rt.stringStatic("num_scientific", [rt.V.bool(true)])));
    print(rt.show(rt.method(rt.V.str(""), "md5_text", [])));
    print(rt.show(rt.method(rt.V.str("abc"), "md5_text", [])));
    print(rt.show(rt.method(rt.V.str("The quick brown fox"), "md5_text", [])));
    print(rt.show(rt.method(rt.V.str("中文"), "md5_text", [])));
    print(rt.show(rt.method(rt.V.str("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"), "md5_text", [])));
    this.quit();
  }
  
}

await new Main().run();
