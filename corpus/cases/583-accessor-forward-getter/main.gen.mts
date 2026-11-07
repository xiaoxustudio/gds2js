// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare A: rt.Variant;
  declare __gd_store_thing: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      this.A = rt.V.nil();
      this.__gd_store_thing = rt.V.int(0);
      rt.frameLine(6);
      this.A = this.thing;
      rt.frameLine(7);
      this.__gd_store_thing = rt.toInt(rt.V.int(9));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  get thing() {
    return this._g();
  }
  set thing(value) {
    // 只读属性：Godot 里写它是静默无操作，不是报错
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

  _g(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_g");
    try {
      rt.frameLine(4);
      return rt.V.int(3);
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
      rt.frameLine(11);
      print(rt.showArgs([this.A]));
      rt.frameLine(12);
      print(rt.showArgs([this.thing]));
      rt.frameLine(13);
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
      case "_g": return rt.wrapValue(this._g());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"thing": "int"});
rt.registerScriptProps(__gd_d_Main, ["A","thing"], (o) => { const s = o as Main; return [s.A, s.thing]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["A","thing"], {"thing": "int"}, (o) => { const s = o as Main; return [s.A, s.__gd_store_thing]; });
rt.registerMethodArities(__gd_d_Main, { "_g": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
