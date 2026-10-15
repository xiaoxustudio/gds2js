// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const TAU = rt.V.float(6.283185307179586);

export class Main extends SceneTree {
  declare PI: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.PI = rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static PI = rt.V.int(1);

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("r1 "), Main.PI, rt.V.str(" "), rt.typeOf(Main.PI)]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r2 "), Thing.PIISH, rt.V.str(" "), rt.method(rt.V.object(__gd_d_Thing), "sm", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r3 "), TAU, rt.V.str(" "), rt.typeOf(TAU)]));
      rt.frameLine(15);
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
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["PI"], (o) => { const s = o as Main; return [s.PI]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Thing extends rt.GdScriptObject {
  declare PIISH: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(6);
      this.PIISH = Main.PI;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static PIISH = Main.PI;

  constructor() {
    super();
    this.__gd_fields__();
  }

  static sm(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(9);
      return TAU;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerScriptProps(__gd_d_Thing, ["PIISH"], (o) => { const s = o as Thing; return [s.PIISH]; });
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", [], {}, (o) => { const s = o as Thing; return []; });
rt.registerMethodArities(__gd_d_Thing, { "sm": [0, 0] });
rt.registerStaticMethods(__gd_d_Thing, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sm())});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
