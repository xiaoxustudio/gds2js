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

  tri(x: number): number {
    const __gd_frame = rt.frameEnter("res://main.gd", "tri");
    try {
      rt.frameLine(4);
      let y = rt.fast.iMulC(x, 3);
      rt.frameLine(5);
      let z = rt.fast.iAddC(y, x);
      rt.frameLine(6);
      return z;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  shout(s: string): string {
    const __gd_frame = rt.frameEnter("res://main.gd", "shout");
    try {
      rt.frameLine(9);
      let t = (s + "!");
      rt.frameLine(10);
      return t;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  mix(a: rt.Variant, b: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "mix");
    try {
      rt.frameLine(13);
      let t = rt.ops.add(a, b);
      rt.frameLine(14);
      print(rt.showArgs([t]));
      rt.frameLine(15);
      return t;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  choose(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "choose");
    try {
      rt.frameLine(18);
      if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(0)))) {
        rt.frameLine(19);
        return x;
      }
      rt.frameLine(20);
      return rt.V.int(0);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(23);
      let s = 0;
      rt.frameLine(24);
      let i = 0;
      rt.frameLine(25);
      while ((i < 3)) {
        rt.frameLine(26);
        s = this.tri(i);
        rt.frameLine(27);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(28);
      print(rt.showArgs([rt.V.int(s)]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.int(this.tri(10))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str(this.shout("hi"))]));
      rt.frameLine(31);
      print(rt.showArgs([this.mix(rt.V.int(2), rt.V.int(3))]));
      rt.frameLine(32);
      print(rt.showArgs([this.choose(rt.V.int(5))]));
      rt.frameLine(33);
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
      case "tri": return rt.wrapValue(this.tri(rt.fast.unboxNum(args[0] as rt.Variant)));
      case "shout": return rt.wrapValue(this.shout(rt.fast.unboxStr(args[0] as rt.Variant)));
      case "mix": return rt.wrapValue(this.mix(args[0] as rt.Variant, args[1] as rt.Variant));
      case "choose": return rt.wrapValue(this.choose(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "tri": [1, 1], "shout": [1, 1], "mix": [2, 2], "choose": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
