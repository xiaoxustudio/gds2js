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

  build(n: rt.Variant, mod: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "build");
    try {
      rt.frameLine(4);
      let a = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      for (let i of rt.rangeSeq([n])) {
        rt.frameLine(6);
        rt.method(a, "append", [rt.vector2iNew([rt.ops.mod(rt.V.int(i), mod), rt.V.int(i)])]);
      }
      rt.frameLine(7);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  idx(a: rt.Variant, rev: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "idx");
    try {
      rt.frameLine(10);
      if (rt.ops.truthy(rev)) {
        rt.frameLine(11);
        rt.method(a, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(11);
          return rt.ops.gt(rt.wrapValue(rt.attribute(x, "x")), rt.wrapValue(rt.attribute(y, "x")));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      } else {
        rt.frameLine(13);
        rt.method(a, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(13);
          return rt.ops.lt(rt.wrapValue(rt.attribute(x, "x")), rt.wrapValue(rt.attribute(y, "x")));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      }
      rt.frameLine(14);
      let out = rt.V.str("");
      rt.frameLine(15);
      for (let v of rt.iter(a)) {
        rt.frameLine(16);
        out = rt.ops.add(out, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.attribute(v, "y"))]), rt.V.str(" ")));
      }
      rt.frameLine(17);
      return out;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r "), this.idx(this.build(rt.V.int(16), rt.V.int(1)), rt.V.bool(false))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("r2 "), this.idx(this.build(rt.V.int(17), rt.V.int(1)), rt.V.bool(false))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("r3 "), this.idx(this.build(rt.V.int(19), rt.V.int(1)), rt.V.bool(false))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("r4 "), this.idx(this.build(rt.V.int(33), rt.V.int(1)), rt.V.bool(false))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("r5 "), this.idx(this.build(rt.V.int(24), rt.V.int(3)), rt.V.bool(false))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("r6 "), this.idx(this.build(rt.V.int(30), rt.V.int(7)), rt.V.bool(false))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("r7 "), this.idx(this.build(rt.V.int(40), rt.V.int(5)), rt.V.bool(true))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("r8 "), this.idx(this.build(rt.V.int(100), rt.V.int(1)), rt.V.bool(false))]));
      rt.frameLine(28);
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
      case "build": return rt.wrapValue(this.build(args[0] as rt.Variant, args[1] as rt.Variant));
      case "idx": return rt.wrapValue(this.idx(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "build": [2, 2], "idx": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
