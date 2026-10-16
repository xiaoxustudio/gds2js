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
      let c0 = rt.wrapValue(rt.attribute(o, "add3"));
      rt.frameLine(13);
      let c1 = rt.method(c0, "bind", [rt.V.int(1)]);
      rt.frameLine(14);
      let c2 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(15);
      let c3 = rt.method(c0, "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
      rt.frameLine(16);
      let ce = rt.method(c0, "bind", []);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("r1 "), rt.method(c0, "get_argument_count", []), rt.V.str(" "), rt.method(c1, "get_argument_count", []), rt.V.str(" "), rt.method(c2, "get_argument_count", []), rt.V.str(" "), rt.method(c3, "get_argument_count", []), rt.V.str(" "), rt.method(ce, "get_argument_count", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(c1, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(c3, "get_bound_arguments", []), "size", []), rt.V.str(" "), rt.method(rt.method(ce, "get_bound_arguments", []), "size", [])]));
      rt.frameLine(19);
      let st = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Thing), "sadd3"));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r3 "), rt.method(st, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(st, "bind", [rt.V.int(1)]), "get_argument_count", [])]));
      rt.frameLine(21);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          const z = __a[2] as rt.Variant;
          rt.frameLine(22);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 3);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("r4 "), rt.method(f, "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(9)]), "get_argument_count", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("r5 "), rt.method(c0, "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str(" "), rt.method(c0, "get_argument_count", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("r6 "), rt.method(c2, "call", [rt.V.int(3)])]));
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
  
  static sadd3(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sadd3");
    try {
      rt.frameLine(8);
      return rt.ops.add(rt.ops.add(a, b), c);
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
rt.registerMethodArities(__gd_d_Thing, { "add3": [3, 3], "sadd3": [3, 3] });
rt.registerStaticMethods(__gd_d_Thing, ["sadd3"], {"sadd3": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Thing.sadd3(a[0] as rt.Variant, a[1] as rt.Variant, a[2] as rt.Variant))});
rt.registerNativeBase(__gd_d_Thing, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
