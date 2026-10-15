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
      let names: string[] = ["ann", "bob", "cy"];
      rt.frameLine(5);
      let s = "";
      rt.frameLine(6);
      let i = 0;
      rt.frameLine(7);
      while ((i < names.length)) {
        rt.frameLine(8);
        s = ((s + rt.fast.rawArrGetStr(names, i)) + ",");
        rt.frameLine(9);
        i = rt.fast.iAddC(i, 1);
      }
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t1 "), rt.V.str(s), rt.V.str(" "), rt.V.int(names.length)]));
      rt.frameLine(11);
      rt.fast.rawArrSetStr(names, 0, "zoe");
      rt.frameLine(12);
      names.push("最大");
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("t2 "), rt.V.str(rt.fast.rawArrGetStr(names, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(names, 3)), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGetStr(names, (-1))), "length", []), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGetStr(names, 1)), "to_upper", [])]));
      rt.frameLine(14);
      let g: string[][] = [["a", "b"], ["c", "d"]];
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t3 "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr2(g, 1, 0)), rt.V.str(" "), rt.V.int(g.length)]));
      rt.frameLine(16);
      rt.fast.rawArrSetStr2(g, 0, 0, "z");
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t4 "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 1))]));
      rt.frameLine(18);
      let acc: string[] = [];
      rt.frameLine(19);
      let k = 0;
      rt.frameLine(20);
      while ((k < 3)) {
        rt.frameLine(21);
        acc.push((rt.fast.rawArrGetStr(names, k) + "!"));
        rt.frameLine(22);
        k = rt.fast.iAddC(k, 1);
      }
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("t5 "), rt.V.str(rt.fast.rawArrGetStr(acc, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(acc, 2)), rt.V.str(" "), rt.V.int(acc.length)]));
      rt.frameLine(24);
      let mix = rt.V.array(rt.GArray.of([]));
      rt.frameLine(25);
      rt.method(mix, "append", [rt.V.str("x")]);
      rt.frameLine(26);
      rt.method(mix, "append", [rt.V.int(1)]);
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t6 "), rt.wrapValue(rt.index(mix, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(mix, rt.V.int(1))), rt.V.str(" "), rt.method(mix, "size", [])]));
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
