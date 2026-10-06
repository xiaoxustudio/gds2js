// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

const TYPE_COLOR = rt.V.int(20);

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("c01|"), rt.colorNew([rt.V.str("red")]), rt.V.str("|"), rt.colorNew([rt.V.str("web green")]), rt.V.str("|"), rt.colorNew([rt.V.str("ALICE_BLUE")])]));
    print(rt.showArgs([rt.V.str("c02|"), rt.colorNew([rt.V.str("00ff00")]), rt.V.str("|"), rt.colorNew([rt.V.str("#1a2b3c")]), rt.V.str("|"), rt.colorNew([rt.V.str("f00")]), rt.V.str("|"), rt.colorNew([rt.V.str("#f00f")])]));
    print(rt.showArgs([rt.V.str("c03|"), rt.colorNew([rt.V.str("8f00")]), rt.V.str("|"), rt.colorNew([rt.V.str("1234")]), rt.V.str("|"), rt.colorNew([rt.V.str("ffff")]), rt.V.str("|"), rt.colorNew([rt.V.str("ff00ff00")])]));
    print(rt.showArgs([rt.V.str("c04|"), rt.colorStatic("html", [rt.V.str("f00f")]), rt.V.str("|"), rt.colorStatic("html", [rt.V.str("#80ff0000")]), rt.V.str("|"), rt.colorStatic("html", [rt.V.str("1a2b3c")])]));
    print(rt.showArgs([rt.V.str("c05|"), rt.colorStatic("from_string", [rt.V.str("red"), rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)])]), rt.V.str("|"), rt.colorStatic("from_string", [rt.V.str("00ff00"), rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)])])]));
    print(rt.showArgs([rt.V.str("c06|"), rt.colorStatic("html_is_valid", [rt.V.str("f00")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("8f00")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("ffff")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("#fff")])]));
    print(rt.showArgs([rt.V.str("c07|"), rt.variantConvert(rt.V.str("red"), TYPE_COLOR, true), rt.V.str("|"), rt.variantConvert(rt.V.str("ff0000"), TYPE_COLOR, true), rt.V.str("|"), rt.typeOf(rt.variantConvert(rt.V.str("red"), TYPE_COLOR, true))]));
    print(rt.showArgs([rt.V.str("c08|"), rt.variantConvert(rt.V.str("red"), TYPE_COLOR, false), rt.V.str("|"), rt.variantConvert(rt.V.str("80ff0000"), TYPE_COLOR, false)]));
    print(rt.showArgs([rt.V.str("c09|"), rt.variantConvert(rt.V.stringName("red"), TYPE_COLOR, true), rt.V.str("|"), rt.variantConvert(rt.V.stringName("red"), TYPE_COLOR, false)]));
    print(rt.showArgs([rt.V.str("c10|"), rt.colorNew([rt.V.stringName("red")]), rt.V.str("|"), rt.colorStatic("html", [rt.V.stringName("f00")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.stringName("f00")])]));
    print(rt.showArgs([rt.V.str("c11|"), rt.method(rt.colorNew([rt.V.str("red")]), "to_html", [rt.V.bool(true)]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.str("1a2b3c4d")]), "to_html", [rt.V.bool(false)]), rt.V.str("|"), rt.method(rt.colorNew([rt.V.str("f00f")]), "to_html", [rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("c12|"), rt.strBuiltin([rt.colorNew([rt.V.str("WEB_GREEN")])]), rt.V.str("|"), rt.ops.eq(rt.colorNew([rt.V.str("webgreen")]), rt.colorNew([rt.V.str("WEB_GREEN")]))]));
    print(rt.showArgs([rt.V.str("c13|"), rt.typeOf(rt.colorNew([rt.V.str("red")])), rt.V.str("|"), rt.V.array(rt.GArray.of([rt.colorNew([rt.V.str("red")]), rt.colorNew([rt.V.str("blue")])]))]));
    print(rt.showArgs([rt.V.str("c14|"), rt.ops.eq(rt.colorNew([rt.V.str("RED")]), rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])), rt.V.str("|"), rt.ops.eq(rt.colorNew([rt.V.str("1234")]), rt.colorNew([rt.V.float(0.0667), rt.V.float(0.1333), rt.V.float(0.2), rt.V.float(0.2667)]))]));
    print(rt.showArgs([rt.V.str("c15|"), rt.colorStatic("html_is_valid", [rt.V.str("f0")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("12345")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("#f0")]), rt.V.str("|"), rt.colorStatic("html_is_valid", [rt.V.str("#")])]));
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
