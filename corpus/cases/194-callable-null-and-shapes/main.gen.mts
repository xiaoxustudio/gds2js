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
      rt.frameLine(8);
      let cb = rt.callableCtor([]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r1 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "is_null", []), rt.V.str(" "), rt.method(cb, "is_valid", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("r2 "), rt.ops.eq(rt.method(cb, "get_method", []), rt.V.str("")), rt.V.str(" "), rt.method(cb, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(cb, "get_bound_arguments", []), "size", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])), rt.V.str(" "), rt.ops.eq(rt.method(cb, "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))]), rt.V.nil())]));
      rt.frameLine(12);
      let b = rt.method(cb, "bind", [rt.V.int(1)]);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r4 "), rt.typeOf(b), rt.V.str(" "), rt.method(b, "is_null", [])]));
      rt.frameLine(14);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(15);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("r5 "), rt.method(f, "is_null", []), rt.V.str(" "), rt.method(f, "is_valid", []), rt.V.str(" "), rt.method(f, "get_method", [])]));
      rt.frameLine(17);
      let o = rt.V.object(new Thing());
      rt.frameLine(18);
      let im = rt.wrapValue(rt.attribute(o, "hi"));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("r6 "), rt.method(im, "is_null", []), rt.V.str(" "), rt.method(im, "is_valid", []), rt.V.str(" "), rt.method(im, "get_method", []), rt.V.str(" "), rt.method(im, "call", [rt.V.int(7)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r7 "), rt.typeOf(rt.callableCtor([o, rt.V.str("hi")])), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "get_method", []), rt.V.str(" "), rt.method(rt.callableCtor([o, rt.V.str("hi")]), "call", [rt.V.int(8)])]));
      rt.frameLine(21);
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

  hi(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "hi");
    try {
      rt.frameLine(5);
      return a;
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
      case "hi": return rt.wrapValue(this.hi(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Thing = rt.defineClass(Thing, () => new Thing(), (o) => o instanceof Thing);
rt.nameClass(__gd_d_Thing, "Thing");
rt.registerDictIdentity(__gd_d_Thing, "res://main.gd", "Thing", [], {}, (o) => { const s = o as Thing; return []; });
rt.registerMethodArities(__gd_d_Thing, { "hi": [1, 1] });
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
