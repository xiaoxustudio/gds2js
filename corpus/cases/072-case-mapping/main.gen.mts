// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.method(rt.V.str("ß"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ß"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬀ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬀ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬁ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬁ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬓ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬓ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("İ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("İ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ı"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ı"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǳ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǳ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǅ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǅ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ŉ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ŉ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ΐ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ΐ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("և"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("և"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ᾼ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ᾼ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ᾋ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ᾋ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ẖ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ẖ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("꟎"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("꟎"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("꟏"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("꟏"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("𖺠"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("𖺠"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("𖺻"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("𖺻"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Ⅎ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Ⅎ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Ȿ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Ȿ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("中"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("中"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("😀"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("😀"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Straße"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("Straße"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬁǳ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ﬁǳ"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("İstanbul"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("İstanbul"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("中Aß"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("中Aß"), "to_lower", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǅǆǇǈ"), "to_upper", [])]));
    print(rt.showArgs([rt.method(rt.V.str("ǅǆǇǈ"), "to_lower", [])]));
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
