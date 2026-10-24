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
      rt.frameLine(13);
      let a = rt.V.object(new A());
      rt.frameLine(14);
      rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(5)]);
      rt.frameLine(15);
      rt.method(a, "set_meta", [rt.V.stringName("sn"), rt.V.int(6)]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("t1 "), rt.method(a, "has_meta", [rt.V.str("sn")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("sn")])]));
      rt.frameLine(17);
      rt.method(a, "remove_meta", [rt.V.str("k")]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(a, "has_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("k"), rt.V.int(99)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(rt.V.object(this), "get_class", []), rt.V.str(" | "), rt.method(a, "get_class", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(a, "has_method", [rt.V.str("sm")]), rt.V.str(" "), rt.method(a, "has_method", [rt.V.str("get_class")])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(rt.V.object(this), "has_method", [rt.V.str("_initialize")]), rt.V.str(" "), rt.method(rt.V.object(this), "has_method", [rt.V.str("print")])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t6 "), rt.method(a, "has_method", [rt.V.str("")])]));
      rt.frameLine(23);
      rt.method(a, "set_meta", [rt.V.str("k"), rt.V.int(8)]);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("t7 "), rt.method(a, "get_meta", [rt.V.str("k")]), rt.V.str(" "), rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.str("dflt")])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("t8 "), rt.typeOf(rt.method(a, "get_meta", [rt.V.str("nope"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]))]));
      rt.frameLine(26);
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

  im(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "im");
    try {
      rt.frameLine(6);
      return rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static sm(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(9);
      return rt.V.int(2);
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
      case "im": return rt.wrapValue(this.im());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", [], {}, (o) => { const s = o as A; return []; });
rt.registerMethodArities(__gd_d_A, { "im": [0, 0], "sm": [0, 0] });
rt.registerStaticMethods(__gd_d_A, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.sm())});
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
