// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

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

  static helper(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "helper");
    try {
      rt.frameLine(6);
      return rt.ops.add(Main.TOP, rt.V.int(1));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static usehelper(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "usehelper");
    try {
      rt.frameLine(9);
      return Main.helper();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  outerbare(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "outerbare");
    try {
      rt.frameLine(38);
      return Main.helper();
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
      rt.frameLine(42);
      let p = rt.V.object(new Inner());
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("u1 "), rt.method(rt.V.object(__gd_d_Inner), "make", [])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("u2 "), rt.method(rt.V.object(__gd_d_Inner), "twice", [rt.V.int(21)])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("u3 "), rt.method(rt.V.object(__gd_d_Inner), "selfcall", [])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("u4 "), rt.method(rt.V.object(__gd_d_Inner), "readconst", [])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.V.object(__gd_d_Inner), "rec", [rt.V.int(10)])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "usestatic", [])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("u7 "), rt.method(p, "make", [])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("u8 "), rt.method(p, "twice", [rt.V.int(3)])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("u9 "), rt.typeOf(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make")))]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("u10 "), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make")), "call", [])]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("u11 "), Main.helper()]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("u12 "), Main.usehelper()]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("u13 "), this.outerbare()]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("u14 "), Main.helper()]));
      rt.frameLine(57);
      let cb = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make"));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("u15 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "call", [])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("u16 "), rt.typeOf(rt.methodCallable(rt.V.object(__gd_d_Main), "usehelper"))]));
      rt.frameLine(60);
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
      case "outerbare": return rt.wrapValue(this.outerbare());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int"});
rt.registerScriptProps(__gd_d_Main, ["TOP"], (o) => { const s = o as Main; return [s.TOP]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "helper": [0, 0], "usehelper": [0, 0], "outerbare": [0, 0], "_initialize": [0, 0] });
rt.registerStaticMethods(__gd_d_Main, ["helper","usehelper"], {"helper": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.helper()), "usehelper": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.usehelper())});
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  declare CV: rt.Variant;
  declare mv: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(13);
      this.CV = rt.toInt(rt.V.int(99));
      rt.frameLine(14);
      this.mv = rt.toInt(rt.V.int(7));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static CV = rt.toInt(rt.V.int(99));

  constructor() {
    super();
    this.__gd_fields__();
  }

  static make(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "make");
    try {
      rt.frameLine(17);
      return rt.V.str("made");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static twice(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "twice");
    try {
      rt.frameLine(20);
      return rt.ops.mul(x, rt.V.int(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static selfcall(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "selfcall");
    try {
      rt.frameLine(23);
      return Inner.twice(rt.V.int(21));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static readconst(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "readconst");
    try {
      rt.frameLine(26);
      return Inner.CV;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  static rec(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "rec");
    try {
      rt.frameLine(29);
      if (rt.ops.truthy(rt.ops.lte(n, rt.V.int(0)))) {
        rt.frameLine(30);
        return rt.V.int(0);
      }
      rt.frameLine(31);
      return rt.ops.add(n, Inner.rec(rt.ops.sub(n, rt.V.int(1))));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  usestatic(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "usestatic");
    try {
      rt.frameLine(34);
      return Inner.make();
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
      case "usestatic": return rt.wrapValue(this.usestatic());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"CV": "int", "mv": "int"});
rt.registerScriptProps(__gd_d_Inner, ["CV","mv"], (o) => { const s = o as Inner; return [s.CV, s.mv]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["mv"], {}, (o) => { const s = o as Inner; return [s.mv]; });
rt.registerMethodArities(__gd_d_Inner, { "make": [0, 0], "twice": [1, 1], "selfcall": [0, 0], "readconst": [0, 0], "rec": [1, 1], "usestatic": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["make","twice","selfcall","readconst","rec"], {"make": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.make()), "twice": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.twice(a[0] as rt.Variant)), "selfcall": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.selfcall()), "readconst": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.readconst()), "rec": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.rec(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
