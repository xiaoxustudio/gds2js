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
      rt.frameLine(4);
      let f2 = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          const b = __a[1] as rt.Variant;
          rt.frameLine(4);
          return rt.ops.add(rt.ops.mul(a, rt.V.int(100)), b);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2);
      rt.frameLine(5);
      let g = rt.method(f2, "bind", [rt.V.int(1), rt.V.int(2)]);
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("X1|"), rt.method(g, "call", []), rt.V.str(" "), rt.method(g, "get_argument_count", []), rt.V.str(" "), rt.method(g, "get_bound_arguments", [])]));
      rt.frameLine(7);
      let u1 = rt.method(g, "unbind", [rt.V.int(1)]);
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("X2|"), rt.method(u1, "call", [rt.V.int(9)]), rt.V.str(" "), rt.method(u1, "get_argument_count", []), rt.V.str(" "), rt.method(u1, "get_bound_arguments", []), rt.V.str(" "), rt.method(u1, "get_bound_arguments_count", [])]));
      rt.frameLine(9);
      let u2 = rt.method(g, "unbind", [rt.V.int(2)]);
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("X3|"), rt.method(u2, "call", [rt.V.int(7), rt.V.int(8)]), rt.V.str(" "), rt.method(u2, "get_argument_count", []), rt.V.str(" "), rt.method(u2, "get_bound_arguments", [])]));
      rt.frameLine(11);
      let u0 = rt.method(g, "unbind", [rt.V.int(0)]);
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("X4|"), rt.method(u0, "call", []), rt.V.str(" "), rt.method(u0, "get_argument_count", [])]));
      rt.frameLine(13);
      let f3 = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          const b = __a[1] as rt.Variant;
          const c = __a[2] as rt.Variant;
          rt.frameLine(13);
          return rt.ops.add(rt.ops.add(rt.ops.mul(a, rt.V.int(10000)), rt.ops.mul(b, rt.V.int(100))), c);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 3);
      rt.frameLine(14);
      let h = rt.method(f3, "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("X5|"), rt.method(rt.method(h, "unbind", [rt.V.int(2)]), "call", [rt.V.int(8), rt.V.int(9)]), rt.V.str(" "), rt.method(rt.method(h, "unbind", [rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(h, "unbind", [rt.V.int(1)]), "call", [rt.V.int(8)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("X6|"), rt.method(rt.method(rt.method(f3, "bind", [rt.V.int(1), rt.V.int(2)]), "unbind", [rt.V.int(1)]), "call", [rt.V.int(8), rt.V.int(9)]), rt.V.str(" "), rt.method(rt.method(rt.method(f3, "bind", [rt.V.int(1), rt.V.int(2)]), "unbind", [rt.V.int(1)]), "get_argument_count", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("X7|"), rt.method(rt.method(h, "unbind", [rt.V.int(9)]), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4), rt.V.int(5), rt.V.int(6), rt.V.int(7), rt.V.int(8), rt.V.int(9)])]));
      rt.frameLine(19);
      let back = rt.method(rt.method(h, "unbind", [rt.V.int(2)]), "bind", [rt.V.int(8)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("X8|"), rt.method(back, "call", [rt.V.int(7)]), rt.V.str(" "), rt.method(back, "get_bound_arguments", []), rt.V.str(" "), rt.method(back, "get_argument_count", []), rt.V.str(" "), rt.method(back, "get_bound_arguments_count", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("X9|"), rt.method(rt.method(rt.method(rt.method(h, "unbind", [rt.V.int(2)]), "bind", [rt.V.int(8)]), "bind", [rt.V.int(9)]), "call", []), rt.V.str(" "), rt.method(rt.method(rt.method(rt.method(h, "unbind", [rt.V.int(2)]), "bind", [rt.V.int(8)]), "bind", [rt.V.int(9)]), "get_argument_count", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("X10|"), rt.method(rt.method(rt.method(g, "unbind", [rt.V.int(1)]), "bind", [rt.V.int(5)]), "call", []), rt.V.str(" "), rt.method(rt.method(rt.method(g, "unbind", [rt.V.int(1)]), "bind", [rt.V.int(5)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.method(g, "unbind", [rt.V.int(2)]), "bind", [rt.V.int(7)]), "call", [rt.V.int(8)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("X11|"), rt.ops.eq(u1, u1), rt.V.str(" "), rt.ops.eq(u1, rt.method(g, "unbind", [rt.V.int(1)])), rt.V.str(" "), rt.ops.eq(u1, g), rt.V.str(" "), rt.ops.eq(u1, u2)]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("X12|"), rt.method(rt.method(u1, "unbind", [rt.V.int(1)]), "call", [rt.V.int(4), rt.V.int(5)]), rt.V.str(" "), rt.method(rt.method(u1, "unbind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(u1, "unbind", [rt.V.int(0)]), "get_argument_count", [])]));
      rt.frameLine(25);
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
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
