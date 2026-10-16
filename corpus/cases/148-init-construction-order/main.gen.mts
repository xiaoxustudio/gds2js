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
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("t1")]));
      rt.frameLine(55);
      let a = rt.V.object(new Base());
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("t2 "), rt.wrapValue(rt.attribute(a, "bx"))]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("t3")]));
      rt.frameLine(58);
      let b = rt.V.object(new NoInit());
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("t4 "), rt.wrapValue(rt.attribute(b, "bx")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "cx")), rt.V.str(" "), rt.isType(b, "Base")]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("t5")]));
      rt.frameLine(61);
      let c = rt.V.object(new Own());
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("t6 "), rt.wrapValue(rt.attribute(c, "cx2"))]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("t7")]));
      rt.frameLine(64);
      let g = rt.V.object(new Grand());
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("t8 "), rt.wrapValue(rt.attribute(g, "gx"))]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("t9")]));
      rt.frameLine(67);
      let s = rt.V.object(new SkipParent());
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("t10 "), rt.wrapValue(rt.attribute(s, "n"))]));
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("t11")]));
      rt.frameLine(70);
      let f = rt.V.object(new Forwarded(rt.V.int(9)));
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("t12 "), rt.wrapValue(rt.attribute(f, "n")), rt.V.str(" "), rt.wrapValue(rt.attribute(f, "k"))]));
      rt.frameLine(72);
      let o = rt.V.object(new SuperOther());
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("t13 "), rt.method(o, "tag", [])]));
      rt.frameLine(74);
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
class Base extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare bx: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.bx = rt.toInt(this._mk(rt.V.str("Base.bx")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("n1 Base._init")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  _mk(who: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "_mk");
    try {
      who = rt.paramSlot(who, "String", 1, "_mk", this);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("n2 init "), who]));
      rt.frameLine(11);
      return rt.V.int(1);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tag(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tag");
    try {
      rt.frameLine(14);
      return rt.V.str("base");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      case "_mk": return rt.wrapValue(this._mk(args[0] as rt.Variant));
      case "tag": return rt.wrapValue(this.tag());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, (a) => new Base(...a), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerFieldTypes(__gd_d_Base, {"bx": "int"});
rt.registerScriptProps(__gd_d_Base, ["bx"], (o) => { const s = o as Base; return [s.bx]; });
rt.registerDictIdentity(__gd_d_Base, "res://main.gd", "Base", ["bx"], {}, (o) => { const s = o as Base; return [s.bx]; });
rt.registerMethodArities(__gd_d_Base, { "_mk": [1, 1], "tag": [0, 0] });
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class NoInit extends Base {
  declare cx: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(17);
      this.cx = rt.toInt(this._mk(rt.V.str("NoInit.cx")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
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
const __gd_d_NoInit = rt.defineClass(NoInit, (a) => new NoInit(...a), (o) => o instanceof NoInit);
rt.nameClass(__gd_d_NoInit, "NoInit");
rt.setClassBase(__gd_d_NoInit, rt.lookupClass("Base") ?? null);
rt.registerFieldTypes(__gd_d_NoInit, {"cx": "int"});
rt.registerScriptProps(__gd_d_NoInit, ["cx"], (o) => { const s = o as NoInit; return [s.cx]; });
rt.registerDictIdentity(__gd_d_NoInit, "res://main.gd", "NoInit", ["cx"], {}, (o) => { const s = o as NoInit; return [s.cx]; });

class Own extends Base {
  declare cx2: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(20);
      this.cx2 = rt.toInt(this._mk(rt.V.str("Own.cx2")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("n3 Own.before")]));
      rt.frameLine(24);
      super._init();
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("n4 Own.after")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Own = rt.defineClass(Own, (a) => new Own(...a), (o) => o instanceof Own);
rt.nameClass(__gd_d_Own, "Own");
rt.setClassBase(__gd_d_Own, rt.lookupClass("Base") ?? null);
rt.registerFieldTypes(__gd_d_Own, {"cx2": "int"});
rt.registerScriptProps(__gd_d_Own, ["cx2"], (o) => { const s = o as Own; return [s.cx2]; });
rt.registerDictIdentity(__gd_d_Own, "res://main.gd", "Own", ["cx2"], {}, (o) => { const s = o as Own; return [s.cx2]; });

class Grand extends Own {
  declare gx: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(28);
      this.gx = rt.toInt(this._mk(rt.V.str("Grand.gx")));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("n5 Grand.before")]));
      rt.frameLine(32);
      super._init();
      rt.frameLine(33);
      super._init();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Grand = rt.defineClass(Grand, (a) => new Grand(...a), (o) => o instanceof Grand);
rt.nameClass(__gd_d_Grand, "Grand");
rt.setClassBase(__gd_d_Grand, rt.lookupClass("Own") ?? null);
rt.registerFieldTypes(__gd_d_Grand, {"gx": "int"});
rt.registerScriptProps(__gd_d_Grand, ["gx"], (o) => { const s = o as Grand; return [s.gx]; });
rt.registerDictIdentity(__gd_d_Grand, "res://main.gd", "Grand", ["gx"], {}, (o) => { const s = o as Grand; return [s.gx]; });

class Needs extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare n: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(36);
      this.n = rt.toInt(rt.V.int(0));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      const p_n = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
      rt.frameLine(39);
      this.n = rt.toInt(p_n);
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("n6 Needs._init "), p_n]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Needs = rt.defineClass(Needs, (a) => new Needs(...a), (o) => o instanceof Needs);
rt.nameClass(__gd_d_Needs, "Needs");
rt.registerFieldTypes(__gd_d_Needs, {"n": "int"});
rt.registerScriptProps(__gd_d_Needs, ["n"], (o) => { const s = o as Needs; return [s.n]; });
rt.registerDictIdentity(__gd_d_Needs, "res://main.gd", "Needs", ["n"], {}, (o) => { const s = o as Needs; return [s.n]; });
rt.registerNativeBase(__gd_d_Needs, "RefCounted");

class SkipParent extends Needs {
  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("n7 SkipParent（没写 super，父体不该跑）")]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_SkipParent = rt.defineClass(SkipParent, (a) => new SkipParent(...a), (o) => o instanceof SkipParent);
rt.nameClass(__gd_d_SkipParent, "SkipParent");
rt.setClassBase(__gd_d_SkipParent, rt.lookupClass("Needs") ?? null);
rt.registerDictIdentity(__gd_d_SkipParent, "res://main.gd", "SkipParent", [], {}, (o) => { const s = o as SkipParent; return []; });

class Forwarded extends Needs {
  declare k: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(47);
      this.k = rt.toInt(rt.V.int(3));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
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
const __gd_d_Forwarded = rt.defineClass(Forwarded, (a) => new Forwarded(...a), (o) => o instanceof Forwarded);
rt.nameClass(__gd_d_Forwarded, "Forwarded");
rt.setClassBase(__gd_d_Forwarded, rt.lookupClass("Needs") ?? null);
rt.registerFieldTypes(__gd_d_Forwarded, {"k": "int"});
rt.registerScriptProps(__gd_d_Forwarded, ["k"], (o) => { const s = o as Forwarded; return [s.k]; });
rt.registerDictIdentity(__gd_d_Forwarded, "res://main.gd", "Forwarded", ["k"], {}, (o) => { const s = o as Forwarded; return [s.k]; });

class SuperOther extends Base {
  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  override tag(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tag");
    try {
      rt.frameLine(51);
      return rt.ops.add(rt.V.str("child+"), super.tag());
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "tag": return rt.wrapValue(this.tag());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_SuperOther = rt.defineClass(SuperOther, (a) => new SuperOther(...a), (o) => o instanceof SuperOther);
rt.nameClass(__gd_d_SuperOther, "SuperOther");
rt.setClassBase(__gd_d_SuperOther, rt.lookupClass("Base") ?? null);
rt.registerDictIdentity(__gd_d_SuperOther, "res://main.gd", "SuperOther", [], {}, (o) => { const s = o as SuperOther; return []; });
rt.registerMethodArities(__gd_d_SuperOther, { "tag": [0, 0] });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
