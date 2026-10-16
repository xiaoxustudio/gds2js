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
      let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("A|"), rt.method(a, "bsearch", [rt.V.int(0)]), rt.V.str("|"), rt.method(a, "bsearch", [rt.V.int(1)]), rt.V.str("|"), rt.method(a, "bsearch", [rt.V.int(2)]), rt.V.str("|"), rt.method(a, "bsearch", [rt.V.int(3)]), rt.V.str("|"), rt.method(a, "bsearch", [rt.V.int(4)])]));
      rt.frameLine(6);
      let b = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3), rt.V.int(5), rt.V.int(7)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("B|"), rt.method(b, "bsearch", [rt.V.int(2)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(4)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(6)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(8)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("C|"), rt.method(b, "bsearch", [rt.V.int(2), rt.V.bool(false)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(4), rt.V.bool(false)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(6), rt.V.bool(false)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str("|"), rt.method(b, "bsearch", [rt.V.int(7), rt.V.bool(false)])]));
      rt.frameLine(9);
      let d = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1), rt.V.int(2), rt.V.int(2), rt.V.int(3), rt.V.int(3)]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("D|"), rt.method(d, "bsearch", [rt.V.int(1)]), rt.V.str("|"), rt.method(d, "bsearch", [rt.V.int(2)]), rt.V.str("|"), rt.method(d, "bsearch", [rt.V.int(3)]), rt.V.str("|"), rt.method(d, "bsearch", [rt.V.int(1), rt.V.bool(false)]), rt.V.str("|"), rt.method(d, "bsearch", [rt.V.int(2), rt.V.bool(false)]), rt.V.str("|"), rt.method(d, "bsearch", [rt.V.int(3), rt.V.bool(false)])]));
      rt.frameLine(11);
      let e = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("E|"), rt.method(e, "bsearch", [rt.V.str("a")]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.str("a"), rt.V.bool(false)]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.nil()]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.array(rt.GArray.of([rt.V.int(9)]))]), rt.V.str("|"), rt.method(e, "bsearch", [rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0), rt.V.int(1)])])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("F|"), rt.method(e, "bsearch", [rt.V.int(1), rt.V.int(1)]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.str("a"), rt.V.int(1)]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.int(2), rt.V.int(0)]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.int(2), rt.V.float(0)]), rt.V.str("|"), rt.method(e, "bsearch", [rt.V.int(2), rt.V.int(1)])]));
      rt.frameLine(14);
      let g = rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("G|"), rt.method(g, "bsearch", [rt.V.int(1)]), rt.V.str("|"), rt.method(g, "bsearch", [rt.V.int(2)]), rt.V.str("|"), rt.method(g, "bsearch", [rt.V.int(3)]), rt.V.str("|"), rt.method(g, "bsearch", [rt.V.int(2), rt.V.bool(false)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("H|"), rt.method(a, "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(16);
          return rt.ops.lt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]), rt.V.str("|"), rt.method(a, "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(16);
          return rt.ops.gt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("I|"), rt.method(a, "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(17);
          return rt.ops.lt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.bool(false)]), rt.V.str("|"), rt.method(a, "bsearch_custom", [rt.V.int(2), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(17);
          return rt.ops.gt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.bool(false)]), rt.V.str("|"), rt.method(a, "bsearch_custom", [rt.V.int(1), rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(17);
          return rt.ops.gt(x, y);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2), rt.V.bool(true)])]));
      rt.frameLine(18);
      let s = rt.strOf(rt.V.str("abc"));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("J|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "bsearch", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "bsearch", [rt.V.bool(true), rt.V.bool(false)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "bsearch", [rt.nodePathCtor([rt.V.str("a")])]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), "bsearch", [rt.V.stringName("a"), rt.V.bool(false)]), rt.V.str("|"), rt.method(s, "length", [])]));
      rt.frameLine(20);
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
