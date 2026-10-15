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

  w0(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "w0");
    try {
      rt.frameLine(5);
      let x = rt.V.nil();
      rt.frameLine(6);
      let y = rt.V.int(1);
      rt.frameLine(7);
      print(rt.showArgs([rt.ops.lt(x, y)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  w1(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "w1");
    try {
      rt.frameLine(10);
      let x = rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a")]))]);
      rt.frameLine(11);
      let y = rt.V.int(1);
      rt.frameLine(12);
      print(rt.showArgs([rt.ops.lt(x, y)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  w2(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "w2");
    try {
      rt.frameLine(15);
      let x = rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]);
      rt.frameLine(16);
      let y = rt.V.int(1);
      rt.frameLine(17);
      print(rt.showArgs([rt.ops.gt(x, y)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  w3(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "w3");
    try {
      rt.frameLine(20);
      let x = rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)]);
      rt.frameLine(21);
      let y = rt.colorNew([rt.V.int(0), rt.V.int(1), rt.V.int(0), rt.V.int(1)]);
      rt.frameLine(22);
      print(rt.showArgs([rt.ops.lt(x, y)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  w4(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "w4");
    try {
      rt.frameLine(25);
      let x = rt.V.int(1);
      rt.frameLine(26);
      let y = rt.V.float(1.5);
      rt.frameLine(27);
      print(rt.showArgs([rt.ops.lt(x, y)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("末格给值")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(31);
      this.w0();
      rt.frameLine(32);
      this.w1();
      rt.frameLine(33);
      this.w2();
      rt.frameLine(34);
      this.w3();
      rt.frameLine(35);
      this.w4();
      rt.frameLine(36);
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
      case "w0": return rt.wrapValue(this.w0());
      case "w1": return rt.wrapValue(this.w1());
      case "w2": return rt.wrapValue(this.w2());
      case "w3": return rt.wrapValue(this.w3());
      case "w4": return rt.wrapValue(this.w4());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "w0": [0, 0], "w1": [0, 0], "w2": [0, 0], "w3": [0, 0], "w4": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
