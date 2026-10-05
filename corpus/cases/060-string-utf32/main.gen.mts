// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let e = "ab😀cd";
    print(rt.showArgs([rt.method(rt.V.str(e), "length", [])]));
    print(rt.showArgs([rt.wrapValue(rt.index(rt.V.str(e), rt.V.int(2)))]));
    print(rt.showArgs([rt.method(rt.V.str(e), "substr", [rt.V.int(1), rt.V.int(3)])]));
    print(rt.showArgs([rt.method(rt.V.str("😀😀"), "length", [])]));
    let j = "你好世界";
    print(rt.showArgs([rt.method(rt.V.str(j), "length", [])]));
    print(rt.showArgs([rt.wrapValue(rt.index(rt.V.str(j), rt.V.int(1)))]));
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
    print(rt.showArgs([rt.formatOf(rt.V.str("%s|%s"), rt.V.array(rt.GArray.of([rt.wrapValue(rt.index(rt.V.str(e), rt.V.int(2))), rt.wrapValue(rt.index(rt.V.str(j), rt.V.int(0)))])))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
