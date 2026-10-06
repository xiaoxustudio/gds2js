// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let names: string[] = ["ann", "bob", "cy"];
    let s = "";
    let i = 0;
    while ((i < names.length)) {
      s = ((s + rt.fast.rawArrGetStr(names, i)) + ",");
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.str("t1 "), rt.V.str(s), rt.V.str(" "), rt.V.int(names.length)]));
    rt.fast.rawArrSetStr(names, 0, "zoe");
    names.push("最大");
    print(rt.showArgs([rt.V.str("t2 "), rt.V.str(rt.fast.rawArrGetStr(names, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(names, 3)), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGetStr(names, (-1))), "length", []), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGetStr(names, 1)), "to_upper", [])]));
    let g: string[][] = [["a", "b"], ["c", "d"]];
    print(rt.showArgs([rt.V.str("t3 "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr2(g, 1, 0)), rt.V.str(" "), rt.V.int(g.length)]));
    rt.fast.rawArrSetStr2(g, 0, 0, "z");
    print(rt.showArgs([rt.V.str("t4 "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr2(g, 0, 1))]));
    let acc: string[] = [];
    let k = 0;
    while ((k < 3)) {
      acc.push((rt.fast.rawArrGetStr(names, k) + "!"));
      k = rt.fast.iAddC(k, 1);
    }
    print(rt.showArgs([rt.V.str("t5 "), rt.V.str(rt.fast.rawArrGetStr(acc, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(acc, 2)), rt.V.str(" "), rt.V.int(acc.length)]));
    let mix = rt.V.array(rt.GArray.of([]));
    rt.method(mix, "append", [rt.V.str("x")]);
    rt.method(mix, "append", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("t6 "), rt.wrapValue(rt.index(mix, rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(mix, rt.V.int(1))), rt.V.str(" "), rt.method(mix, "size", [])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
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
