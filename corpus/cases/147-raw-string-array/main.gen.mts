// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let names = ["ann", "bob", "cy"];
    let s = "";
    let i = 0;
    while ((i < names.length)) {
      s = ((s + rt.fast.rawArrGet(names, i)) + ",");
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.str("t1 "), rt.V.str(s), rt.V.str(" "), rt.V.int(names.length)]));
    rt.fast.rawArrSet(names, 0, "zoe");
    names.push("最大");
    print(rt.showArgs([rt.V.str("t2 "), rt.V.str(rt.fast.rawArrGet(names, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(names, 3)), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGet(names, (-1))), "length", []), rt.V.str(" "), rt.method(rt.V.str(rt.fast.rawArrGet(names, 1)), "to_upper", [])]));
    let g = [["a", "b"], ["c", "d"]];
    print(rt.showArgs([rt.V.str("t3 "), rt.V.str(rt.fast.rawArrGet2(g, 0, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet2(g, 1, 0)), rt.V.str(" "), rt.V.int(g.length)]));
    rt.fast.rawArrSet2(g, 0, 0, "z");
    print(rt.showArgs([rt.V.str("t4 "), rt.V.str(rt.fast.rawArrGet2(g, 0, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet2(g, 0, 1))]));
    let acc = [];
    let k = 0;
    while ((k < 3)) {
      acc.push((rt.fast.rawArrGet(names, k) + "!"));
      k = rt.fast.iAddC(k, 1);
    }
    print(rt.showArgs([rt.V.str("t5 "), rt.V.str(rt.fast.rawArrGet(acc, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(acc, 2)), rt.V.str(" "), rt.V.int(acc.length)]));
    let mix = rt.V.array(rt.GArray.of([]));
    rt.method(mix, "append", [rt.V.str("x")]);
    rt.method(mix, "append", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("t6 "), rt.index(mix, rt.V.int(0)), rt.V.str(" "), rt.index(mix, rt.V.int(1)), rt.V.str(" "), rt.method(mix, "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
