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

  take_v3(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "take_v3");
    try {
      v = rt.paramSlot(v, "Vector3", 1, "take_v3", this);
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("v3 "), rt.typeOf(v), rt.V.str(" "), v]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  take_v3i(v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "take_v3i");
    try {
      v = rt.paramSlot(v, "Vector3i", 1, "take_v3i", this);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("v3i "), rt.typeOf(v), rt.V.str(" "), v]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  take_name(n: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "take_name");
    try {
      n = rt.paramSlot(n, "StringName", 1, "take_name", this);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("name "), rt.typeOf(n), rt.V.str(" "), n]));
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
      rt.frameLine(13);
      let a = rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
      rt.frameLine(14);
      let b = rt.vector3New([rt.V.float(1.7), rt.V.float((-2.9)), rt.V.float(3.1)]);
      rt.frameLine(15);
      let s = "nm";
      rt.frameLine(16);
      this.take_v3(a);
      rt.frameLine(17);
      this.take_v3(b);
      rt.frameLine(18);
      this.take_v3i(b);
      rt.frameLine(19);
      this.take_v3i(a);
      rt.frameLine(20);
      this.take_name(rt.V.str(s));
      rt.frameLine(21);
      this.take_name(rt.V.stringName("lit"));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t "), rt.colorNew([rt.V.int(123456789)]), rt.V.str(" "), a, rt.V.str(" "), b, rt.V.str(" "), rt.typeOf(rt.V.stringName("x"))]));
      rt.frameLine(23);
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
      case "take_v3": return rt.wrapValue(this.take_v3(args[0] as rt.Variant));
      case "take_v3i": return rt.wrapValue(this.take_v3i(args[0] as rt.Variant));
      case "take_name": return rt.wrapValue(this.take_name(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "take_v3": [1, 1], "take_v3i": [1, 1], "take_name": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
