// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare counter: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.counter = rt.V.int(0);
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

  bump(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "bump");
    try {
      rt.frameLine(9);
      this.counter = rt.ops.add(this.counter, n);
      rt.frameLine(11);
      return this.counter;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(15);
      let i = 0;
      rt.frameLine(16);
      while ((i < 3)) {
        rt.frameLine(18);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(20);
      print(rt.showArgs([this.bump(rt.V.int(2))]));
      rt.frameLine(21);
      print(rt.showArgs([this.counter]));
      rt.frameLine(22);
      if ((i > 2)) {
        rt.frameLine(24);
        print(rt.showArgs([rt.V.int(111)]));
      } else {
        rt.frameLine(27);
        print(rt.showArgs([rt.V.int(222)]));
      }
      rt.frameLine(28);
      for (let k of rt.rangeSeq([rt.V.int(2)])) {
        rt.frameLine(30);
        print(rt.showArgs([rt.V.int(k)]));
      }
      rt.frameLine(31);
      do {
        const __m0 = rt.matchPattern(this.counter, rt.patLit(rt.V.int(4)));
        if (__m0 !== null) {
          rt.frameLine(34);
          print(rt.showArgs([rt.V.int(444)]));
          break;
        }
        const __m1 = rt.matchPattern(this.counter, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(36);
          print(rt.showArgs([rt.V.int(999)]));
          break;
        }
      } while (false);
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("保留 # 井号")]));
      rt.frameLine(38);
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
      case "bump": return rt.wrapValue(this.bump(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["counter"], (o) => { const s = o as Main; return [s.counter]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["counter"], {}, (o) => { const s = o as Main; return [s.counter]; });
rt.registerMethodArities(__gd_d_Main, { "bump": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
