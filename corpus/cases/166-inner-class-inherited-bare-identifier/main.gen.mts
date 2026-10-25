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
      rt.frameLine(30);
      let p = rt.V.object(new Plain());
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("p "), rt.ops.neq(p, rt.V.nil())]));
      rt.frameLine(32);
      let m = rt.V.object(new Mid());
      rt.frameLine(33);
      rt.method(m, "bare", []);
      rt.frameLine(34);
      rt.method(m, "show", []);
      rt.frameLine(35);
      rt.method(m, "bump", []);
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("after "), rt.wrapValue(rt.attribute(m, "a")), rt.V.str(" "), rt.wrapValue(rt.attribute(m, "shadow")), rt.V.str(" "), rt.typeOf(m)]));
      rt.frameLine(37);
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
class NoInit extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare a: rt.Variant;
  declare shadow: rt.Variant;
  declare CA: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.a = rt.V.int(7);
      rt.frameLine(5);
      this.shadow = rt.V.int(100);
      rt.frameLine(9);
      this.CA = rt.V.int(99);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static CA = rt.V.int(99);

  get_a(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "get_a");
    try {
      rt.frameLine(7);
      return this.a;
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
      case "get_a": return rt.wrapValue(this.get_a());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_NoInit = rt.defineClass(NoInit, (a) => new NoInit(...a), (o) => o instanceof NoInit);
rt.nameClass(__gd_d_NoInit, "NoInit");
rt.registerScriptProps(__gd_d_NoInit, ["a","shadow","CA"], (o) => { const s = o as NoInit; return [s.a, s.shadow, s.CA]; });
rt.registerDictIdentity(__gd_d_NoInit, "res://main.gd", "NoInit", ["a","shadow"], {}, (o) => { const s = o as NoInit; return [s.a, s.shadow]; });
rt.registerMethodArities(__gd_d_NoInit, { "get_a": [0, 0] });
rt.registerNativeBase(__gd_d_NoInit, "RefCounted");

class Plain extends NoInit {
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

  _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("plain "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  show(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "show");
    try {
      rt.frameLine(16);
      let a = 1;
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("shadow "), rt.V.int(a), rt.V.str(" "), this.a, rt.V.str(" "), this.shadow]));
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
      case "show": return rt.wrapValue(this.show());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Plain = rt.defineClass(Plain, (a) => new Plain(...a), (o) => o instanceof Plain);
rt.nameClass(__gd_d_Plain, "Plain");
rt.setClassBase(__gd_d_Plain, rt.lookupClass("NoInit") ?? null);
rt.registerDictIdentity(__gd_d_Plain, "res://main.gd", "Plain", [], {}, (o) => { const s = o as Plain; return []; });
rt.registerMethodArities(__gd_d_Plain, { "show": [0, 0] });

class Mid extends Plain {
  declare b: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(20);
      this.b = rt.V.int(3);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  bare(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "bare");
    try {
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("mid "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA, rt.V.str(" "), this.b]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  bump(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "bump");
    try {
      rt.frameLine(26);
      this.a = rt.ops.add(this.a, rt.V.int(1));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("bump "), this.a, rt.V.str(" "), this.get_a()]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
rt.registerScriptProps(__gd_d_Mid, ["b"], (o) => { const s = o as Mid; return [s.b]; });
rt.registerDictIdentity(__gd_d_Mid, "res://main.gd", "Mid", ["b"], {}, (o) => { const s = o as Mid; return [s.b]; });
rt.registerMethodArities(__gd_d_Mid, { "bare": [0, 0], "bump": [0, 0] });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
