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

  read_nope(o: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "read_nope");
    try {
      rt.frameLine(10);
      return rt.wrapValue(rt.attribute(o, "nope"));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  disc0(s: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "disc0");
    try {
      rt.frameLine(13);
      rt.method(s, "disconnect", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  disc2(s: rt.Variant, c: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "disc2");
    try {
      rt.frameLine(16);
      rt.method(s, "disconnect", [c, rt.V.int(1)]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(19);
      let h = rt.V.object(new Holder());
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("R "), this.read_nope(h)]));
      rt.frameLine(21);
      let s = rt.wrapValue(rt.attribute(h, "pinged"));
      rt.frameLine(22);
      let c = rt.wrapValue(rt.attribute(h, "notify"));
      rt.frameLine(23);
      this.disc0(s);
      rt.frameLine(24);
      this.disc2(s, c);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("Z ")]));
      rt.frameLine(26);
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
      case "read_nope": return rt.wrapValue(this.read_nope(args[0] as rt.Variant));
      case "disc0": return rt.wrapValue(this.disc0(args[0] as rt.Variant));
      case "disc2": return rt.wrapValue(this.disc2(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "read_nope": [1, 1], "disc0": [1, 1], "disc2": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Holder extends rt.GdScriptObject {
  declare pinged: rt.Signal;
  declare tag: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(5);
      this.pinged = new rt.Signal("pinged");
      rt.frameLine(4);
      this.tag = rt.V.int(1);
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

  notify(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "notify");
    try {
      rt.frameLine(7);
      return x;
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
      case "notify": return rt.wrapValue(this.notify(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Holder = rt.defineClass(Holder, () => new Holder(), (o) => o instanceof Holder);
rt.nameClass(__gd_d_Holder, "Holder");
rt.registerScriptProps(__gd_d_Holder, ["tag"], (o) => { const s = o as Holder; return [s.tag]; });
rt.registerDictIdentity(__gd_d_Holder, "res://main.gd", "Holder", ["tag"], {}, (o) => { const s = o as Holder; return [s.tag]; });
rt.registerMethodArities(__gd_d_Holder, { "notify": [1, 1] });
rt.registerNativeBase(__gd_d_Holder, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
