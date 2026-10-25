// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare TOP: rt.Variant;
  declare NAME: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.TOP = rt.toInt(rt.V.int(42));
      rt.frameLine(4);
      this.NAME = rt.strOf(rt.V.str("outer-name"));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TOP = rt.toInt(rt.V.int(42));
  static NAME = rt.strOf(rt.V.str("outer-name"));

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(27);
      let i = rt.V.object(new Inner());
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t1 "), Main.TOP]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(i, "read_outer", [])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(i, "read_shadow", [])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(rt.V.object(__gd_d_Inner), "read_static_outer", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("t5 "), rt.method(rt.V.object(__gd_d_Inner), "read_static_shadow", [])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("t6 "), rt.method(i, "via_self_dot", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("t7 "), Inner.TOP]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t8 "), rt.wrapValue(rt.attribute(i, "TOP"))]));
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
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int", "NAME": "String"});
rt.registerScriptProps(__gd_d_Main, ["TOP","NAME"], (o) => { const s = o as Main; return [s.TOP, s.NAME]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  declare TOP: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(8);
      this.TOP = rt.toInt(rt.V.int(7));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TOP = rt.toInt(rt.V.int(7));

  constructor() {
    super();
    this.__gd_fields__();
  }

  read_outer(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_outer");
    try {
      rt.frameLine(11);
      return Main.NAME;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  read_shadow(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_shadow");
    try {
      rt.frameLine(14);
      return Inner.TOP;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static read_static_outer(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_static_outer");
    try {
      rt.frameLine(17);
      return Main.NAME;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static read_static_shadow(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_static_shadow");
    try {
      rt.frameLine(20);
      return Inner.TOP;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  via_self_dot(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "via_self_dot");
    try {
      rt.frameLine(23);
      return Inner.TOP;
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
      case "read_outer": return rt.wrapValue(this.read_outer());
      case "read_shadow": return rt.wrapValue(this.read_shadow());
      case "via_self_dot": return rt.wrapValue(this.via_self_dot());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"TOP": "int"});
rt.registerScriptProps(__gd_d_Inner, ["TOP"], (o) => { const s = o as Inner; return [s.TOP]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerMethodArities(__gd_d_Inner, { "read_outer": [0, 0], "read_shadow": [0, 0], "read_static_outer": [0, 0], "read_static_shadow": [0, 0], "via_self_dot": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["read_static_outer","read_static_shadow"], {"read_static_outer": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.read_static_outer()), "read_static_shadow": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.read_static_shadow())});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
