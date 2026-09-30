// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = [];
    for (let i of rt.rangeSeq([rt.V.int(5)])) {
      a.push(i);
    }
    rt.fast.rawArrInsert(a, 2, 9);
    print(rt.showArgs([rt.V.str("n1 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 5))]));
    rt.fast.rawArrPushFront(a, 7);
    print(rt.showArgs([rt.V.str("n2 "), rt.V.int(rt.fast.rawArrGet(a, 0)), rt.V.str(" "), rt.V.int(a.length)]));
    rt.fast.rawArrRemoveAt(a, 0);
    a.pop();
    a.shift();
    rt.fast.rawArrRemoveAt(a, 1);
    print(rt.showArgs([rt.V.str("n3 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 2))]));
    rt.fast.rawArrInsert(a, 99, 5);
    print(rt.showArgs([rt.V.str("n4 "), rt.V.int(a.length)]));
    rt.fast.rawArrRemoveAt(a, (-1));
    print(rt.showArgs([rt.V.str("n5 "), rt.V.int(a.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(a, 1))]));
    let s = [];
    s.push("x");
    s.push("y");
    rt.fast.rawArrInsert(s, 1, "z");
    print(rt.showArgs([rt.V.str("n6 "), rt.V.int(s.length), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(s, 1)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(s, 2))]));
    s.fill("w");
    print(rt.showArgs([rt.V.str("n7 "), rt.V.str(rt.fast.rawArrGet(s, 0)), rt.V.str(" "), rt.V.str(rt.fast.rawArrGet(s, 2))]));
    rt.fast.rawArrClear(s);
    print(rt.showArgs([rt.V.str("n8 "), rt.V.int(s.length)]));
    let b = [1, 2];
    let st = rt.fast.rawArrInsert(b, 0, 3);
    print(rt.showArgs([rt.V.str("n9 "), rt.V.int(st), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(b, 0)), rt.V.str(" "), rt.V.int(b.length)]));
    let bad = rt.fast.rawArrInsert(b, 9, 4);
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
    let sd = new Map([]);
    sd.set("k", 5);
    print(rt.showArgs([rt.V.str("n12 "), rt.V.int(rt.fast.rawDictGetOr(sd, "k", 0)), rt.V.str(" "), rt.V.int(rt.fast.rawDictGetOr(sd, "j", 7))]));
    let mixed = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(mixed, rt.V.int(1), rt.V.int(2));
      if (_nv !== null) mixed = _nv;
    }
    print(rt.showArgs([rt.V.str("n13 "), rt.method(mixed, "get", [rt.V.str("nope")]), rt.V.str(" "), rt.method(mixed, "size", [])]));
    let q = [1, 2, 3];
    rt.fast.rawArrInsert(q, (-1), 4);
    print(rt.showArgs([rt.V.str("n14 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 3))]));
    rt.fast.rawArrInsert(q, (-4), 5);
    print(rt.showArgs([rt.V.str("n15 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 1))]));
    rt.fast.rawArrRemoveAt(q, (-1));
    rt.fast.rawArrRemoveAt(q, (-2));
    print(rt.showArgs([rt.V.str("n16 "), rt.V.int(q.length), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(q, 1))]));
    let only = [1];
    only.pop();
    only.shift();
    rt.fast.rawArrRemoveAt(only, 0);
    rt.fast.rawArrRemoveAt(only, 0);
    print(rt.showArgs([rt.V.str("n17 "), rt.V.int(only.length)]));
    let r = [1, 2, 3];
    r.push(4);
    r.reverse();
    print(rt.showArgs([rt.V.str("n18 "), rt.V.int(rt.fast.rawArrGet(r, 0)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(r, 1)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(r, 2)), rt.V.str(" "), rt.V.int(rt.fast.rawArrGet(r, 3))]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
