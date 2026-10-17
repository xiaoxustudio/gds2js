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
      let one = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.int(5);
          rt.frameLine(4);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("L1|"), rt.method(one, "call", []), rt.V.str(" "), rt.method(one, "call", [rt.V.int(9)])]));
      rt.frameLine(6);
      let head = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          const b = __a[1] as rt.Variant ?? rt.V.int(2);
          rt.frameLine(6);
          return rt.ops.add(a, b);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2, 1);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("L2|"), rt.method(head, "call", [rt.V.int(7)]), rt.V.str(" "), rt.method(head, "call", [rt.V.int(7), rt.V.int(5)])]));
      rt.frameLine(8);
      let host = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.methodCallable(rt.V.object(this), "quit");
          rt.frameLine(8);
          return rt.typeOf(x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("L3|"), rt.method(host, "call", [])]));
      rt.frameLine(10);
      let selfd = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.object(this);
          rt.frameLine(10);
          return rt.typeOf(x);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("L4|"), rt.method(selfd, "call", [])]));
      rt.frameLine(12);
      let arr = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
          rt.frameLine(12);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1);
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("L5|"), rt.method(arr, "call", []), rt.V.str(" "), rt.method(arr, "call", [rt.V.array(rt.GArray.of([rt.V.int(3)]))])]));
      rt.frameLine(14);
      let chain = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.int(1);
          const y = __a[1] as rt.Variant ?? x;
          rt.frameLine(14);
          return rt.V.array(rt.GArray.of([x, y]));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2, 2);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("L6|"), rt.method(chain, "call", []), rt.V.str(" "), rt.method(chain, "call", [rt.V.int(2), rt.V.int(3)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("L7|"), rt.method(one, "get_argument_count", []), rt.V.str(" "), rt.method(head, "get_argument_count", []), rt.V.str(" "), rt.method(chain, "get_argument_count", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("L8|"), rt.method(one, "callv", [rt.V.array(rt.GArray.of([]))]), rt.V.str(" "), rt.method(one, "callv", [rt.V.array(rt.GArray.of([rt.V.int(2)]))])]));
      rt.frameLine(18);
      let calc = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant ?? rt.V.int(rt.fast.iMulC(3, 4));
          rt.frameLine(18);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1, 1);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("L9|"), rt.method(calc, "call", [])]));
      rt.frameLine(20);
      let strd = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const s = __a[0] as rt.Variant ?? rt.V.str(("a" + "b"));
          const n = __a[1] as rt.Variant ?? rt.V.int(2);
          rt.frameLine(20);
          return rt.method(s, "repeat", [n]);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2, 2);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("L10|"), rt.method(strd, "call", []), rt.V.str(" "), rt.method(strd, "call", [rt.V.str("c")]), rt.V.str(" "), rt.method(strd, "call", [rt.V.str("c"), rt.V.int(3)])]));
      rt.frameLine(22);
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
