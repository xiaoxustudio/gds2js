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
      rt.frameLine(22);
      let o = rt.V.object(new Thing());
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("p01|"), rt.method(rt.V.str("{alpha}"), "format", [o])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("p02|"), rt.method(rt.V.str("{alpha}{alpha}"), "format", [o]), rt.V.str("|"), rt.method(rt.V.str("{twice}"), "format", [o])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("p03|"), rt.method(rt.V.str("{note} {beta}"), "format", [o]), rt.V.str("|"), rt.method(rt.V.str("{beta} {note}"), "format", [o])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("p04|"), rt.method(rt.V.str("{Lower}|{lower}"), "format", [o])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("p05|"), rt.method(rt.V.str("{deep}"), "format", [o])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("p06|"), rt.ops.eq(rt.method(rt.V.str("{alpha}"), "format", [o]), rt.V.str("1"))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("p07|"), rt.method(rt.V.str("{f}|{s}|{alpha}"), "format", [o])]));
      rt.frameLine(30);
      let k = rt.V.object(new Kid());
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("p08|"), rt.method(rt.V.str("{holder}|{three}|{two}"), "format", [k])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("p09|"), rt.method(rt.V.str("{holder}{back}"), "format", [k]), rt.V.str("|"), rt.method(rt.V.str("{back}"), "format", [k])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("p10|"), rt.method(rt.V.str("{one}|{two}|{three}"), "format", [k])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("p11|"), rt.method(rt.V.str("{_}={_}"), "format", [k]), rt.V.str("|"), rt.method(rt.V.str("{}"), "format", [k])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("p12|"), rt.method(rt.V.str("{alpha}"), "format", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str("|"), rt.method(rt.V.str("{0}"), "format", [o])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("p13|"), rt.method(rt.V.str("{missing}|{alpha}"), "format", [o])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("p14|"), rt.method(rt.V.str("x{alpha}x"), "format", [o, rt.V.str("{0}")]), rt.V.str("|"), rt.method(rt.V.str("{alpha}"), "format", [o, rt.V.str("{}")])]));
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

  declare two: rt.Variant;
  declare holder: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.two = rt.V.int(2);
      rt.frameLine(5);
      this.holder = rt.V.str("{three}");
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
const __gd_d_Base = rt.defineClass(Base, (a) => new Base(...a), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerScriptProps(__gd_d_Base, ["two","holder"], (o) => { const s = o as Base; return [s.two, s.holder]; });
rt.registerDictIdentity(__gd_d_Base, "res://main.gd", "Base", ["two","holder"], {}, (o) => { const s = o as Base; return [s.two, s.holder]; });
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class Kid extends Base {
  declare three: rt.Variant;
  declare back: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(8);
      this.three = rt.V.int(3);
      rt.frameLine(9);
      this.back = rt.V.str("{two}");
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
const __gd_d_Kid = rt.defineClass(Kid, (a) => new Kid(...a), (o) => o instanceof Kid);
rt.nameClass(__gd_d_Kid, "Kid");
rt.setClassBase(__gd_d_Kid, rt.lookupClass("Base") ?? null);
rt.registerScriptProps(__gd_d_Kid, ["three","back"], (o) => { const s = o as Kid; return [s.three, s.back]; });
rt.registerDictIdentity(__gd_d_Kid, "res://main.gd", "Kid", ["three","back"], {}, (o) => { const s = o as Kid; return [s.three, s.back]; });

class Thing extends rt.GdScriptObject {
  declare alpha: rt.Variant;
  declare beta: rt.Variant;
  declare note: rt.Variant;
  declare twice: rt.Variant;
  declare lower: rt.Variant;
  declare deep: rt.Variant;
  declare f: rt.Variant;
  declare s: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(12);
      this.alpha = rt.V.int(1);
      rt.frameLine(13);
      this.beta = rt.V.int(9);
      rt.frameLine(14);
      this.note = rt.V.str("{beta}");
      rt.frameLine(15);
      this.twice = rt.V.str("A{alpha}B{alpha}C");
      rt.frameLine(16);
      this.lower = rt.V.int(5);
      rt.frameLine(17);
      this.deep = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("m"), rt.V.int(2)]])]))]]);
      rt.frameLine(18);
      this.f = rt.V.float(2.5);
      rt.frameLine(19);
      this.s = rt.V.str("a\nb");
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
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerScriptProps(__gd_d_Thing, ["alpha","beta","note","twice","lower","deep","f","s"], (o) => { const s = o as Thing; return [s.alpha, s.beta, s.note, s.twice, s.lower, s.deep, s.f, s.s]; });
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", ["alpha","beta","note","twice","lower","deep","f","s"], {}, (o) => { const s = o as Thing; return [s.alpha, s.beta, s.note, s.twice, s.lower, s.deep, s.f, s.s]; });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
