// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new Plain());
    print(rt.showArgs([rt.V.str("p "), rt.ops.neq(p, rt.V.nil())]));
    let m = rt.V.object(new Mid());
    rt.method(m, "bare", []);
    rt.method(m, "show", []);
    rt.method(m, "bump", []);
    print(rt.showArgs([rt.V.str("after "), rt.wrapValue(rt.attribute(m, "a")), rt.V.str(" "), rt.wrapValue(rt.attribute(m, "shadow")), rt.V.str(" "), rt.typeOf(m)]));
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
class NoInit extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  declare a: rt.Variant;
  declare shadow: rt.Variant;
  declare CA: rt.Variant;

  __gd_fields__() {
    this.a = rt.V.int(7);
    this.shadow = rt.V.int(100);
    this.CA = rt.V.int(99);
  }

  static CA = rt.V.int(99);

  get_a(): rt.Variant {
    return this.a;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "get_a": return rt.wrapValue(this.get_a());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_NoInit = rt.defineClass(NoInit, (a) => new NoInit(...a), (o) => o instanceof NoInit);
rt.nameClass(__gd_d_NoInit, "NoInit");
rt.registerMethodArities(__gd_d_NoInit, { "get_a": [0, 0] });
rt.registerNativeBase(__gd_d_NoInit, "RefCounted");

class Plain extends NoInit {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    print(rt.showArgs([rt.V.str("plain "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA]));
  }
  
  show(): void {
    let a = 1;
    print(rt.showArgs([rt.V.str("shadow "), rt.V.int(a), rt.V.str(" "), this.a, rt.V.str(" "), this.shadow]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      case "show": return rt.wrapValue(this.show());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Plain = rt.defineClass(Plain, (a) => new Plain(...a), (o) => o instanceof Plain);
rt.nameClass(__gd_d_Plain, "Plain");
rt.setClassBase(__gd_d_Plain, rt.lookupClass("NoInit") ?? null);
rt.registerMethodArities(__gd_d_Plain, { "show": [0, 0] });

class Mid extends Plain {
  declare b: rt.Variant;

  override __gd_fields__() {
    super.__gd_fields__();
    this.b = rt.V.int(3);
  }

  bare(): void {
    print(rt.showArgs([rt.V.str("mid "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA, rt.V.str(" "), this.b]));
  }
  
  bump(): void {
    this.a = rt.ops.add(this.a, rt.V.int(1));
    print(rt.showArgs([rt.V.str("bump "), this.a, rt.V.str(" "), this.get_a()]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "bare": return rt.wrapValue(this.bare());
      case "bump": return rt.wrapValue(this.bump());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Mid = rt.defineClass(Mid, (a) => new Mid(...a), (o) => o instanceof Mid);
rt.nameClass(__gd_d_Mid, "Mid");
rt.setClassBase(__gd_d_Mid, rt.lookupClass("Plain") ?? null);
rt.registerMethodArities(__gd_d_Mid, { "bare": [0, 0], "bump": [0, 0] });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
