// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  take_color(c: rt.Variant): void {
    c = rt.paramSlot(c, "Color", 1, "take_color", this);
    print(rt.showArgs([rt.V.str("s "), c]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let n = 123456789;
    this.take_color(rt.V.int(n));
    this.take_color(rt.V.int((-1)));
    this.take_color(rt.V.int(4294967296));
    this.take_color(rt.V.int(256));
    this.take_color(rt.V.int(16711680));
    this.take_color(rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75)]));
    let s = "abc";
    this.take_color(rt.V.str(s));
    print(rt.showArgs([rt.V.str("d "), rt.colorNew([rt.V.int(1)]), rt.V.str(" "), rt.colorNew([rt.V.int(255)]), rt.V.str(" "), rt.colorNew([rt.V.int(65280)]), rt.V.str(" "), rt.colorNew([rt.V.int(0)]), rt.V.str(" "), rt.colorNew([rt.V.int(4294967295)])]));
    print(rt.showArgs([rt.V.str("e "), rt.colorNew([rt.V.str("red")]), rt.V.str(" "), rt.colorNew([rt.V.str("00ff00")]), rt.V.str(" "), rt.colorNew([rt.V.str("f00")])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "take_color": return rt.wrapValue(this.take_color(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "take_color": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
