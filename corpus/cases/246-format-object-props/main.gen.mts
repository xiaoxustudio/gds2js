// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Thing());
    print(rt.showArgs([rt.V.str("p01|"), rt.method(rt.V.str("{alpha}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p02|"), rt.method(rt.V.str("{alpha}{alpha}"), "format", [o]), rt.V.str("|"), rt.method(rt.V.str("{twice}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p03|"), rt.method(rt.V.str("{note} {beta}"), "format", [o]), rt.V.str("|"), rt.method(rt.V.str("{beta} {note}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p04|"), rt.method(rt.V.str("{Lower}|{lower}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p05|"), rt.method(rt.V.str("{deep}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p06|"), rt.ops.eq(rt.method(rt.V.str("{alpha}"), "format", [o]), rt.V.str("1"))]));
    print(rt.showArgs([rt.V.str("p07|"), rt.method(rt.V.str("{f}|{s}|{alpha}"), "format", [o])]));
    let k = rt.V.object(new Kid());
    print(rt.showArgs([rt.V.str("p08|"), rt.method(rt.V.str("{holder}|{three}|{two}"), "format", [k])]));
    print(rt.showArgs([rt.V.str("p09|"), rt.method(rt.V.str("{holder}{back}"), "format", [k]), rt.V.str("|"), rt.method(rt.V.str("{back}"), "format", [k])]));
    print(rt.showArgs([rt.V.str("p10|"), rt.method(rt.V.str("{one}|{two}|{three}"), "format", [k])]));
    print(rt.showArgs([rt.V.str("p11|"), rt.method(rt.V.str("{_}={_}"), "format", [k]), rt.V.str("|"), rt.method(rt.V.str("{}"), "format", [k])]));
    print(rt.showArgs([rt.V.str("p12|"), rt.method(rt.V.str("{alpha}"), "format", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.str("|"), rt.method(rt.V.str("{0}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p13|"), rt.method(rt.V.str("{missing}|{alpha}"), "format", [o])]));
    print(rt.showArgs([rt.V.str("p14|"), rt.method(rt.V.str("x{alpha}x"), "format", [o, rt.V.str("{0}")]), rt.V.str("|"), rt.method(rt.V.str("{alpha}"), "format", [o, rt.V.str("{}")])]));
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

  declare two: rt.Variant;
  declare holder: rt.Variant;

  __gd_fields__() {
    this.two = rt.V.int(2);
    this.holder = rt.V.str("{three}");
  }

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, (a) => new Base(...a), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerScriptProps(__gd_d_Base, ["two","holder"]);
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class Kid extends Base {
  declare three: rt.Variant;
  declare back: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.three = rt.V.int(3);
    this.back = rt.V.str("{two}");
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
rt.registerScriptProps(__gd_d_Kid, ["three","back"]);

class Thing extends rt.GdScriptObject {
  alpha = rt.V.int(1);
  beta = rt.V.int(9);
  note = rt.V.str("{beta}");
  twice = rt.V.str("A{alpha}B{alpha}C");
  lower = rt.V.int(5);
  deep = rt.dictOf([[rt.V.str("k"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("m"), rt.V.int(2)]])]))]]);
  f = rt.V.float(2.5);
  s = rt.V.str("a\nb");

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerScriptProps(__gd_d_Thing, ["alpha","beta","note","twice","lower","deep","f","s"]);
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
