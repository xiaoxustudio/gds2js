// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let e = "ab😀cd";
    print(rt.showArgs([rt.method(rt.V.str(e), "length", [])]));
    print(rt.showArgs([rt.index(rt.V.str(e), rt.V.int(2))]));
    print(rt.showArgs([rt.method(rt.V.str(e), "substr", [rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.str("😀😀"), "length", [])]));
    let j = "你好世界";
    print(rt.showArgs([rt.method(rt.V.str(j), "length", [])]));
    print(rt.showArgs([rt.index(rt.V.str(j), rt.V.int(1))]));
    print(rt.showArgs([rt.method(rt.V.str(j), "substr", [rt.V.int(1), rt.V.int(2)])]));
    print(rt.showArgs([rt.V.str((e + j))]));
    let c = "café";
    print(rt.showArgs([rt.method(rt.V.str(c), "length", [])]));
    print(rt.showArgs([rt.method(rt.V.str(c), "substr", [rt.V.int(2), rt.V.int(2)])]));
    print(rt.showArgs([rt.method(rt.V.str("É"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ß"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("À"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬁ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǳ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǅ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ı"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Σ"), "to_lower", [])]));
    print(rt.showArgs([rt.formatOf(rt.V.str("%s|%s"), rt.V.array(rt.GArray.of([rt.index(rt.V.str(e), rt.V.int(2)), rt.index(rt.V.str(j), rt.V.int(0))])))]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
