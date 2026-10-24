// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

  add2(a: number, b: number): number {
    const __gd_frame = rt.frameEnter("res://main.gd", "add2");
    try {
      rt.frameLine(4);
      return rt.fast.iAddC(a, b);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  scale(x: number): number {
    const __gd_frame = rt.frameEnter("res://main.gd", "scale");
    try {
      rt.frameLine(7);
      return (x * 2);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  shout(s: string): string {
    const __gd_frame = rt.frameEnter("res://main.gd", "shout");
    try {
      rt.frameLine(10);
      return (s + "!");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  idn(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "idn");
    try {
      rt.frameLine(13);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(16);
      let total = 0;
      rt.frameLine(17);
      let i = 0;
      rt.frameLine(18);
      while ((i < 3)) {
        rt.frameLine(19);
        total = this.add2(total, i);
        rt.frameLine(20);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(21);
      print(rt.showArgs([rt.V.int(total)]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.int(rt.fast.iAddC(this.add2(100, 200), 5))]));
      rt.frameLine(23);
      let arr = rt.V.array(rt.GArray.of([rt.V.int(this.add2(1, 2)), rt.V.int(this.add2(3, 4))]));
      rt.frameLine(24);
      print(rt.showArgs([arr]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.float(this.scale(3))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str(this.shout("hi"))]));
      rt.frameLine(27);
      print(rt.showArgs([this.idn(rt.V.int(7))]));
      rt.frameLine(28);
      print(rt.showArgs([this.idn(rt.V.str("s"))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.int(this.add2(7, 2))]));
      rt.frameLine(30);
      print(rt.showArgs([this.idn(rt.V.int(2))]));
      rt.frameLine(31);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add2": return rt.wrapValue(this.add2(rt.fast.unboxNum(args[0] as rt.Variant), rt.fast.unboxNum(args[1] as rt.Variant)));
      case "scale": return rt.wrapValue(this.scale(rt.fast.unboxNum(args[0] as rt.Variant)));
      case "shout": return rt.wrapValue(this.shout(rt.fast.unboxStr(args[0] as rt.Variant)));
      case "idn": return rt.wrapValue(this.idn(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "add2": [2, 2], "scale": [1, 1], "shout": [1, 1], "idn": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
