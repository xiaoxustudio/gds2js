// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("SPADES"), rt.V.int(1)]]);

export class Main extends SceneTree {
  declare TOP: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.TOP = rt.toInt(rt.V.int(42));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static TOP = rt.toInt(rt.V.int(42));

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(32);
      let i = rt.V.object(new Inner());
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("t1 "), rt.method(i, "useconst", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("t2 "), rt.method(i, "useenum", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t3 "), rt.method(i, "useother", [])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("t4 "), rt.method(i, "ownconst", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("t5 "), Inner.IC]));
      rt.frameLine(38);
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
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int"});
rt.registerScriptProps(__gd_d_Main, ["TOP"], (o) => { const s = o as Main; return [s.TOP]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Other extends rt.GdScriptObject {
  declare OC: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(9);
      this.OC = rt.toInt(rt.V.int(5));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static OC = rt.toInt(rt.V.int(5));

  constructor() {
    super();
    this.__gd_fields__();
  }

  getoc(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "getoc");
    try {
      rt.frameLine(12);
      return Other.OC;
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
      case "getoc": return rt.wrapValue(this.getoc());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Other = rt.defineClass(Other, () => new Other(), (o) => o instanceof Other);
rt.nameClass(__gd_d_Other, "Other");
rt.registerFieldTypes(__gd_d_Other, {"OC": "int"});
rt.registerScriptProps(__gd_d_Other, ["OC"], (o) => { const s = o as Other; return [s.OC]; });
rt.registerDictIdentity(__gd_d_Other, "res://main.gd", "Other", [], {}, (o) => { const s = o as Other; return []; });
rt.registerMethodArities(__gd_d_Other, { "getoc": [0, 0] });
rt.registerNativeBase(__gd_d_Other, "RefCounted");

class Inner extends rt.GdScriptObject {
  declare IC: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(28);
      this.IC = rt.toInt(rt.V.int(9));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static IC = rt.toInt(rt.V.int(9));

  constructor() {
    super();
    this.__gd_fields__();
  }

  useconst(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "useconst");
    try {
      rt.frameLine(17);
      return Main.TOP;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  useenum(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "useenum");
    try {
      rt.frameLine(20);
      return rt.wrapValue(rt.index(Suit, rt.V.str("HEARTS")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  useother(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "useother");
    try {
      rt.frameLine(23);
      return rt.method(rt.V.object(new Other()), "getoc", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  ownconst(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ownconst");
    try {
      rt.frameLine(26);
      return Inner.IC;
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
      case "useconst": return rt.wrapValue(this.useconst());
      case "useenum": return rt.wrapValue(this.useenum());
      case "useother": return rt.wrapValue(this.useother());
      case "ownconst": return rt.wrapValue(this.ownconst());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"IC": "int"});
rt.registerScriptProps(__gd_d_Inner, ["IC"], (o) => { const s = o as Inner; return [s.IC]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerMethodArities(__gd_d_Inner, { "useconst": [0, 0], "useenum": [0, 0], "useother": [0, 0], "ownconst": [0, 0] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
