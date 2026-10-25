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

  top(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "top");
    try {
      rt.frameLine(15);
      return v;
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
      rt.frameLine(19);
      let a = rt.V.object(new A());
      rt.frameLine(20);
      let cb = rt.wrapValue(rt.attribute(a, "im"));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("u1 "), rt.typeOf(rt.methodCallable(rt.V.object(this), "top")), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.attribute(a, "im"))), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_A), "sm"))), rt.V.str(" "), rt.typeOf(rt.wrapValue(this.fired))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("u2 "), rt.method(rt.methodCallable(rt.V.object(this), "top"), "is_null", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(a, "im")), "is_null", []), rt.V.str(" "), rt.method(rt.wrapValue(this.fired), "is_null", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("u3 "), rt.method(rt.methodCallable(rt.V.object(this), "top"), "is_valid", []), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(a, "im")), "is_valid", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("u4 "), rt.method(rt.methodCallable(rt.V.object(this), "top"), "get_method", []), rt.V.str(" | "), rt.method(rt.wrapValue(rt.attribute(a, "im")), "get_method", []), rt.V.str(" | "), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_A), "sm")), "get_method", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.methodCallable(rt.V.object(this), "top"), "call", [rt.V.int(5)]), rt.V.str(" "), rt.method(rt.methodCallable(rt.V.object(this), "top"), "callv", [rt.V.array(rt.GArray.of([rt.V.int(6)]))])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(cb, "call", [rt.V.int(21)]), rt.V.str(" "), rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(5)]))])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("u7 "), rt.method(rt.wrapValue(this.fired), "get_name", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_A), "sm")), "call", [rt.V.int(9)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("u9 "), rt.method(cb, "is_null", []), rt.V.str(" "), rt.method(cb, "get_method", [])]));
      rt.frameLine(30);
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
      case "top": return rt.wrapValue(this.top(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "top": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class A extends rt.GdScriptObject {
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

  im(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "im");
    try {
      rt.frameLine(8);
      return rt.ops.mul(v, rt.V.int(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static sm(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(11);
      return v;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "im": return rt.wrapValue(this.im(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", [], {}, (o) => { const s = o as A; return []; });
rt.registerMethodArities(__gd_d_A, { "im": [1, 1], "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_A, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
