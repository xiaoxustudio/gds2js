// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a: number[] = [];
    for (let i of rt.rangeSeq([rt.V.int(5)])) {
      a.push(i);
    }
    rt.fast.rawArrInsertNum(a, 2, 9);
    print(rt.showArgs([rt.V.str("n1 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 5))]));
    rt.fast.rawArrPushFrontNum(a, 7);
    print(rt.showArgs([rt.V.str("n2 "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(a.length)]));
    rt.fast.rawArrRemoveAtNum(a, 0);
    a.pop();
    a.shift();
    rt.fast.rawArrRemoveAtNum(a, 1);
    print(rt.showArgs([rt.V.str("n3 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 2))]));
    rt.fast.rawArrInsertNum(a, 99, 5);
    print(rt.showArgs([rt.V.str("n4 "), rt.V.int(a.length)]));
    rt.fast.rawArrRemoveAtNum(a, (-1));
    print(rt.showArgs([rt.V.str("n5 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(a, 1))]));
    let s: string[] = [];
    s.push("x");
    s.push("y");
    rt.fast.rawArrInsertStr(s, 1, "z");
    print(rt.showArgs([rt.V.str("n6 "), rt.V.int(s.length), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 2))]));
    s.fill("w");
    print(rt.showArgs([rt.V.str("n7 "), rt.V.str(rt.fast.rawArrGetStr(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGetStr(s, 2))]));
    rt.fast.rawArrClearStr(s);
    print(rt.showArgs([rt.V.str("n8 "), rt.V.int(s.length)]));
    let b: number[] = [1, 2];
    let st = rt.fast.rawArrInsertNum(b, 0, 3);
    print(rt.showArgs([rt.V.str("n9 "), rt.V.int(st), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(b, 0)), rt.V.str(" "), rt.V.int(b.length)]));
    let bad = rt.fast.rawArrInsertNum(b, 9, 4);
    print(rt.showArgs([rt.V.str("n10 "), rt.V.int(bad)]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.V.int(1), rt.V.int(10));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.V.int(2), rt.V.int(20));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("n11 "), rt.method(d, "get", [rt.V.int(1)]), rt.V.str(" "), rt.method(d, "get", [rt.V.int(3), rt.V.int(99)]), rt.V.str(" "), rt.method(d, "get", [rt.V.int(2), rt.V.int(0)]), rt.V.str(" "), rt.method(d, "size", [])]));
    let sd = new Map<unknown, number>([]);
    sd.set("k", 5);
    print(rt.showArgs([rt.V.str("n12 "), rt.V.int(rt.fast.rawDictGetOrNum(sd, "k", 0)), rt.V.str(" "), rt.V.int(rt.fast.rawDictGetOrNum(sd, "j", 7))]));
    let mixed = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(mixed, rt.V.int(1), rt.V.int(2));
      if (_nv !== null) mixed = _nv;
    }
    print(rt.showArgs([rt.V.str("n13 "), rt.method(mixed, "get", [rt.V.str("nope")]), rt.V.str(" "), rt.method(mixed, "size", [])]));
    let q: number[] = [1, 2, 3];
    rt.fast.rawArrInsertNum(q, (-1), 4);
    print(rt.showArgs([rt.V.str("n14 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 3))]));
    rt.fast.rawArrInsertNum(q, (-4), 5);
    print(rt.showArgs([rt.V.str("n15 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1))]));
    rt.fast.rawArrRemoveAtNum(q, (-1));
    rt.fast.rawArrRemoveAtNum(q, (-2));
    print(rt.showArgs([rt.V.str("n16 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(q, 1))]));
    let only: number[] = [1];
    only.pop();
    only.shift();
    rt.fast.rawArrRemoveAtNum(only, 0);
    rt.fast.rawArrRemoveAtNum(only, 0);
    print(rt.showArgs([rt.V.str("n17 "), rt.V.int(only.length)]));
    let r: number[] = [1, 2, 3];
    r.push(4);
    r.reverse();
    print(rt.showArgs([rt.V.str("n18 "), rt.V.int(rt.fast.rawArrGetNum(r, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGetNum(r, 3))]));
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
