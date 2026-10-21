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

  cmp(a: rt.Variant, b: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "cmp");
    try {
      a = rt.paramSlot(a, "bool", 1, "cmp", this);
      b = rt.paramSlot(b, "bool", 2, "cmp", this);
      rt.frameLine(5);
      print(rt.showArgs([a, rt.V.str(" < "), b, rt.V.str(" → "), rt.ops.lt(a, b), rt.V.str(" | "), a, rt.V.str(" > "), b, rt.V.str(" → "), rt.ops.gt(a, b)]));
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
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("A|"), rt.ops.lt(rt.V.bool(false), rt.V.bool(true)), rt.V.str("|"), rt.ops.lt(rt.V.bool(true), rt.V.bool(false)), rt.V.str("|"), rt.ops.gt(rt.V.bool(false), rt.V.bool(true)), rt.V.str("|"), rt.ops.gt(rt.V.bool(true), rt.V.bool(false))]));
      rt.frameLine(9);
      let v = rt.V.bool(false);
      rt.frameLine(10);
      let w = rt.V.bool(true);
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("B|"), rt.ops.lt(v, w), rt.V.str("|"), rt.ops.gt(w, v)]));
      rt.frameLine(12);
      let x = rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false)]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("C|"), rt.method(x, "min", []), rt.V.str("|"), rt.method(x, "max", []), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.bool(false), rt.V.bool(true)])), "bsearch", [rt.V.bool(true)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.bool(false), rt.V.bool(true)])), "bsearch", [rt.V.bool(false)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("D|"), rt.method(rt.V.array(rt.GArray.of([rt.V.bool(false), rt.V.bool(true)])), "bsearch", [rt.V.bool(true), rt.V.bool(false)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.bool(true), rt.V.bool(false)])), "bsearch", [rt.V.bool(true)]), rt.V.str("|"), rt.method(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "bsearch", [rt.V.bool(true)])]));
      rt.frameLine(15);
      rt.method(x, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const a = __a[0] as rt.Variant;
          const b = __a[1] as rt.Variant;
          rt.frameLine(15);
          return rt.ops.lt(a, b);
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("E|"), x]));
      rt.frameLine(17);
      this.cmp(rt.V.bool(false), rt.V.bool(true));
      rt.frameLine(18);
      this.cmp(rt.V.bool(true), rt.V.bool(false));
      rt.frameLine(19);
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
      case "cmp": return rt.wrapValue(this.cmp(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "cmp": [2, 2], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "cmp": ["bool", "bool"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
