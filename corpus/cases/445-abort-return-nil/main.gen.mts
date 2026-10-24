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

  d(z: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "d");
    try {
      rt.frameLine(4);
      let z2 = 0;
      rt.frameLine(5);
      return rt.V.int(rt.fast.iDivC(100, z2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  m(z: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "m");
    try {
      rt.frameLine(8);
      let z2 = 0;
      rt.frameLine(9);
      return rt.V.int(rt.fast.iModC(100, z2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  i(z: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "i");
    try {
      rt.frameLine(12);
      let z2 = 0;
      rt.frameLine(13);
      return rt.V.int(rt.fast.iDivC(100, z2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  s(z: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "s");
    try {
      rt.frameLine(16);
      let z2 = 0;
      rt.frameLine(17);
      return rt.V.int(rt.fast.iDivC(100, z2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  cascade(z: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "cascade");
    try {
      rt.frameLine(20);
      let v = this.d(z);
      rt.frameLine(21);
      return rt.ops.add(v, rt.V.int(1));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  keep(z: number): number {
    const __gd_frame = rt.frameEnter("res://main.gd", "keep");
    try {
      rt.frameLine(24);
      let half = rt.fast.iDivC(100, 4);
      rt.frameLine(25);
      return rt.fast.iAddC(half, z);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("A "), this.d(rt.V.int(1))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("B "), this.m(rt.V.int(1))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("C "), this.i(rt.V.int(1))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("D ["), this.s(rt.V.int(1)), rt.V.str("]")]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("E "), this.cascade(rt.V.int(1))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("F "), rt.typeOf(this.d(rt.V.int(1)))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("G "), rt.V.int(this.keep(3))]));
      rt.frameLine(35);
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
      case "d": return rt.wrapValue(this.d(args[0] as rt.Variant));
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant));
      case "i": return rt.wrapValue(this.i(args[0] as rt.Variant));
      case "s": return rt.wrapValue(this.s(args[0] as rt.Variant));
      case "cascade": return rt.wrapValue(this.cascade(args[0] as rt.Variant));
      case "keep": return rt.wrapValue(this.keep(rt.fast.unboxNum(args[0] as rt.Variant)));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "d": [1, 1], "m": [1, 1], "i": [1, 1], "s": [1, 1], "cascade": [1, 1], "keep": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
