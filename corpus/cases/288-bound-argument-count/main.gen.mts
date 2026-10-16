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
      rt.frameLine(14);
      let o = rt.V.object(new A());
      rt.frameLine(15);
      let h = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          rt.frameLine(15);
          return rt.ops.mul(a, rt.V.int(100));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(16);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          const b = __a[1] as rt.Variant;
          rt.frameLine(16);
          return rt.ops.add(rt.ops.mul(a, rt.V.int(100)), b);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2);
      rt.frameLine(17);
      let c = rt.callableCtor([]);
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("n01 "), rt.method(c, "get_argument_count", []), rt.V.str(" "), rt.method(c, "get_bound_arguments", []), rt.V.str(" "), rt.method(c, "is_null", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n02 "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1)]), "is_null", []), rt.V.str(" "), rt.typeOf(rt.method(c, "bind", [rt.V.int(1)]))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("n03 "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(c, "bind", [rt.V.int(1), rt.V.int(2)]), "is_null", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("n04 "), rt.method(rt.method(rt.method(c, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.method(c, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_bound_arguments", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("n05 "), rt.method(f, "get_argument_count", []), rt.V.str(" "), rt.method(f, "get_bound_arguments", []), rt.V.str(" "), rt.method(f, "is_null", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("n06 "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "call", [rt.V.int(9)]), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(7)]), "get_bound_arguments_count", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("o01 "), rt.method(rt.wrapValue(rt.attribute(o, "two")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "two")), "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "two")), "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("o02 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("over-method "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "one")), "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "one")), "bind", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), "get_bound_arguments", [])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("over-lambda "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments", []), rt.V.str(" "), rt.method(rt.method(h, "bind", [rt.V.int(1), rt.V.int(2)]), "get_bound_arguments_count", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("over-chained "), rt.method(rt.method(rt.method(h, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_argument_count", []), rt.V.str(" "), rt.method(rt.method(rt.method(h, "bind", [rt.V.int(1)]), "bind", [rt.V.int(2)]), "get_bound_arguments", [])]));
      rt.frameLine(29);
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
class A extends rt.GdScriptObject {
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

  one(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "one");
    try {
      rt.frameLine(5);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  two(a: rt.Variant, b: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "two");
    try {
      rt.frameLine(8);
      return rt.ops.add(rt.ops.mul(a, rt.V.int(10)), b);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "three");
    try {
      rt.frameLine(11);
      return rt.ops.add(rt.ops.add(rt.ops.mul(a, rt.V.int(100)), rt.ops.mul(b, rt.V.int(10))), c);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "one": return rt.wrapValue(this.one(args[0] as rt.Variant));
      case "two": return rt.wrapValue(this.two(args[0] as rt.Variant, args[1] as rt.Variant));
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", [], {}, (o) => { const s = o as A; return []; });
rt.registerMethodArities(__gd_d_A, { "one": [1, 1], "two": [2, 2], "three": [3, 3] });
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
