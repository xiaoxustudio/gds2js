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

  top(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "top");
    try {
      rt.frameLine(13);
      return x;
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
      rt.frameLine(16);
      let o = rt.V.object(new Inner());
      rt.frameLine(17);
      let cm = rt.wrapValue(rt.attribute(o, "m"));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("q01|"), rt.typeOf(rt.method(cm, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), o), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.method(cm, "get_object", []), "v"))]));
      rt.frameLine(19);
      let other = rt.V.object(new Inner());
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("q02|"), rt.ops.eq(rt.method(cm, "get_object", []), other), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), o)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("q03|"), rt.ops.eq(rt.method(rt.method(cm, "get_object", []), "get_instance_id", []), rt.method(o, "get_instance_id", []))]));
      rt.frameLine(22);
      let ct = rt.methodCallable(rt.V.object(this), "top");
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("q04|"), rt.typeOf(rt.method(ct, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(ct, "get_object", []), rt.V.object(this))]));
      rt.frameLine(24);
      let cs = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sstat"));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("q05|"), rt.typeOf(rt.method(cs, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(cs, "get_object", []), rt.V.object(__gd_d_Inner)), rt.V.str("|"), rt.ops.eq(rt.method(cs, "get_object", []), o)]));
      rt.frameLine(26);
      let b = rt.method(cm, "bind", [rt.V.int(1)]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("q06|"), rt.ops.eq(rt.method(b, "get_object", []), o), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.method(b, "get_object", []), "v"))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("q07|"), rt.strBuiltin([rt.method(rt.method(cm, "get_object", []), "get_class", [])]), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), rt.method(cm, "get_object", []))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("q08|"), rt.ops.eq(rt.method(cm, "get_object", []), rt.method(ct, "get_object", []))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("q09|"), rt.method(rt.method(cm, "get_object", []), "m", [rt.V.int(1)]), rt.V.str("|"), rt.method(rt.method(cs, "get_object", []), "sstat", [rt.V.int(2)])]));
      rt.frameLine(31);
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
class Inner extends rt.GdScriptObject {
  declare v: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.v = rt.V.int(7);
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

  m(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "m");
    try {
      rt.frameLine(7);
      return rt.ops.add(x, this.v);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static sstat(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sstat");
    try {
      rt.frameLine(10);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["v"], (o) => { const s = o as Inner; return [s.v]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["v"], {}, (o) => { const s = o as Inner; return [s.v]; });
rt.registerMethodArities(__gd_d_Inner, { "m": [1, 1], "sstat": [1, 1] });
rt.registerStaticMethods(__gd_d_Inner, ["sstat"], {"sstat": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.sstat(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
