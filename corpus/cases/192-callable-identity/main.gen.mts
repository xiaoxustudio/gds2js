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
      rt.frameLine(11);
      let o = rt.V.object(new Thing());
      rt.frameLine(12);
      let p = rt.V.object(new Thing());
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r1 "), rt.ops.eq(rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(o, "add3"))), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(p, "add3")))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(rt.wrapValue(rt.attribute(o, "add3")), "bind", [rt.V.int(1)]), rt.method(rt.wrapValue(rt.attribute(o, "add3")), "bind", [rt.V.int(2)]))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("r3 "), rt.ops.eq(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sm")))]));
      rt.frameLine(16);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(17);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(18);
      let g = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(19);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r4 "), rt.ops.eq(f, f), rt.V.str(" "), rt.ops.eq(f, g)]));
      rt.frameLine(21);
      let a = rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "add3")), rt.wrapValue(rt.attribute(o, "add3"))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("r5 "), rt.method(a, "has", [rt.wrapValue(rt.attribute(o, "add3"))]), rt.V.str(" "), rt.method(a, "size", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("r6 "), rt.ops.eq(rt.callableCtor([]), rt.callableCtor([])), rt.V.str(" "), rt.ops.neq(rt.callableCtor([]), rt.callableCtor([]))]));
      rt.frameLine(24);
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
class Thing extends rt.GdScriptObject {
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

  add3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "add3");
    try {
      rt.frameLine(5);
      return rt.ops.add(rt.ops.add(a, b), c);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static sm(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(8);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add3": return rt.wrapValue(this.add3(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", [], {}, (o) => { const s = o as Thing; return []; });
rt.registerMethodArities(__gd_d_Thing, { "add3": [3, 3], "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Thing, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
