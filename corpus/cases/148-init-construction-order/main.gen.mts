// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("t1")]));
    let a = rt.V.object(new Base());
    print(rt.showArgs([rt.V.str("t2 "), rt.wrapValue(rt.attribute(a, "bx"))]));
    print(rt.showArgs([rt.V.str("t3")]));
    let b = rt.V.object(new NoInit());
    print(rt.showArgs([rt.V.str("t4 "), rt.wrapValue(rt.attribute(b, "bx")), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "cx")), rt.V.str(" "), rt.isType(b, "Base")]));
    print(rt.showArgs([rt.V.str("t5")]));
    let c = rt.V.object(new Own());
    print(rt.showArgs([rt.V.str("t6 "), rt.wrapValue(rt.attribute(c, "cx2"))]));
    print(rt.showArgs([rt.V.str("t7")]));
    let g = rt.V.object(new Grand());
    print(rt.showArgs([rt.V.str("t8 "), rt.wrapValue(rt.attribute(g, "gx"))]));
    print(rt.showArgs([rt.V.str("t9")]));
    let s = rt.V.object(new SkipParent());
    print(rt.showArgs([rt.V.str("t10 "), rt.wrapValue(rt.attribute(s, "n"))]));
    print(rt.showArgs([rt.V.str("t11")]));
    let f = rt.V.object(new Forwarded(rt.V.int(9)));
    print(rt.showArgs([rt.V.str("t12 "), rt.wrapValue(rt.attribute(f, "n")), rt.V.str(" "), rt.wrapValue(rt.attribute(f, "k"))]));
    let o = rt.V.object(new SuperOther());
    print(rt.showArgs([rt.V.str("t13 "), rt.method(o, "tag", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Base extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  declare bx: rt.Variant;

  __gd_fields__() {
    this.bx = rt.toInt(this._mk(rt.V.str("Base.bx")));
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("n1 Base._init")]));
  }
  
  _mk(who: rt.Variant): rt.Variant {
    who = rt.paramSlot(who, "String", 1, "_mk", this);
    print(rt.showArgs([rt.V.str("n2 init "), who]));
    return rt.V.int(1);
  }
  
  tag(): rt.Variant {
    return rt.V.str("base");
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
rt.registerScriptProps(__gd_d_Base, ["bx"]);
rt.registerMethodArities(__gd_d_Base, { "_mk": [1, 1], "tag": [0, 0] });
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class NoInit extends Base {
  declare cx: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.cx = rt.toInt(this._mk(rt.V.str("NoInit.cx")));
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
rt.registerScriptProps(__gd_d_NoInit, ["cx"]);

class Own extends Base {
  declare cx2: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.cx2 = rt.toInt(this._mk(rt.V.str("Own.cx2")));
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("n3 Own.before")]));
    super._init();
    print(rt.showArgs([rt.V.str("n4 Own.after")]));
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
rt.registerScriptProps(__gd_d_Own, ["cx2"]);

class Grand extends Own {
  declare gx: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.gx = rt.toInt(this._mk(rt.V.str("Grand.gx")));
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("n5 Grand.before")]));
    super._init();
    super._init();
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
rt.registerScriptProps(__gd_d_Grand, ["gx"]);

class Needs extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  declare n: rt.Variant;

  __gd_fields__() {
    this.n = rt.toInt(rt.V.int(0));
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    const p_n = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
    this.n = rt.toInt(p_n);
    print(rt.showArgs([rt.V.str("n6 Needs._init "), p_n]));
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
rt.registerScriptProps(__gd_d_Needs, ["n"]);
rt.registerNativeBase(__gd_d_Needs, "RefCounted");

class SkipParent extends Needs {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  override _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("n7 SkipParent（没写 super，父体不该跑）")]));
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

class Forwarded extends Needs {
  declare k: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.k = rt.toInt(rt.V.int(3));
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
rt.registerScriptProps(__gd_d_Forwarded, ["k"]);

class SuperOther extends Base {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  override tag(): rt.Variant {
    return rt.ops.add(rt.V.str("child+"), super.tag());
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
rt.registerMethodArities(__gd_d_SuperOther, { "tag": [0, 0] });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
