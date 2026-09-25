// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(0)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(3)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(30)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(300)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1023)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1024)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1025)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1026)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1075)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1076)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1126)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1280)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1536)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1792)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(2047)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(2048)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(2049)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(2560)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(3000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(5120)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(10240)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(102400)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(30000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(300000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1048575)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1048576)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1048577)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1049601)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1052672)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1234567)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(3000000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(4000000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1073741823)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1073741824)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1073741825)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1074790400)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(30000000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(400000000)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1099511627776)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1125899906842624)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(1152921504606846976n)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.int(9223372036854775807n)])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.ops.neg(rt.V.int(1024))])));
    print(rt.show(rt.stringStatic("humanize_size", [rt.V.float(1.9)])));
    this.quit();
  }
  
}

await new Main().run();
