// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare fired: rt.Signal;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.fired = new rt.Signal("fired");
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

  ifn(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ifn");
    try {
      rt.frameLine(13);
      return rt.V.int(7);
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
      rt.frameLine(17);
      let b = rt.V.object(new Box());
      rt.frameLine(18);
      let cb = rt.methodCallable(rt.V.object(this), "ifn");
      rt.frameLine(19);
      let sig = rt.wrapValue(this.fired);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("u1 "), rt.typeOf(cb)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("u2 "), rt.typeOf(rt.methodCallable(rt.V.object(this), "ifn"))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("u3 "), rt.typeOf(sig)]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u4 "), rt.typeOf(rt.wrapValue(this.fired))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("u5 "), rt.typeOf(rt.wrapValue(rt.attribute(b, "boxed")))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(cb, "call", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u7 "), rt.typeOf(rt.wrapValue(rt.attribute(b, "n")))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("u8 "), rt.typeOf(rt.wrapValue(rt.attribute(rt.V.object(new Box()), "boxed")))]));
      rt.frameLine(28);
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
      case "ifn": return rt.wrapValue(this.ifn());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "ifn": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Box extends rt.GdScriptObject {
  declare boxed: rt.Signal;
  declare n: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(7);
      this.boxed = new rt.Signal("boxed");
      rt.frameLine(9);
      this.n = rt.toInt(rt.V.int(1));
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

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerFieldTypes(__gd_d_Box, {"n": "int"});
rt.registerScriptProps(__gd_d_Box, ["n"], (o) => { const s = o as Box; return [s.n]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["n"], {}, (o) => { const s = o as Box; return [s.n]; });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
