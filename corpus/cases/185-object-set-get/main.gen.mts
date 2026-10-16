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

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(11);
      let o = rt.V.object(new Thing());
      rt.frameLine(12);
      rt.method(o, "set", [rt.V.str("a"), rt.V.int(5)]);
      rt.frameLine(13);
      rt.method(o, "set", [rt.V.str("s"), rt.V.int(12)]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r "), rt.wrapValue(rt.attribute(o, "a")), rt.V.str(" "), rt.method(o, "get", [rt.V.str("a")]), rt.V.str(" "), rt.wrapValue(rt.attribute(o, "s")), rt.V.str(" "), rt.method(o, "get", [rt.V.str("zz")]), rt.V.str(" "), rt.typeOf(rt.method(o, "get", [rt.V.str("zz")]))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("r2 "), rt.typeOf(rt.method(o, "get", [rt.V.str("hi")])), rt.V.str(" "), rt.method(o, "call", [rt.V.str("hi")])]));
      rt.frameLine(16);
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Thing extends rt.GdScriptObject {
  declare a: rt.Variant;
  declare s: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.a = rt.V.int(7);
      rt.frameLine(5);
      this.s = rt.strOf(rt.V.str("x"));
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

  hi(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "hi");
    try {
      rt.frameLine(8);
      return rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "hi": return rt.wrapValue(this.hi());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerFieldTypes(__gd_d_Thing, {"s": "String"});
rt.registerScriptProps(__gd_d_Thing, ["a","s"], (o) => { const s = o as Thing; return [s.a, s.s]; });
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", ["a","s"], {}, (o) => { const s = o as Thing; return [s.a, s.s]; });
rt.registerMethodArities(__gd_d_Thing, { "hi": [0, 0] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
