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
    print(rt.show(rt.V.str("n1 ")), rt.show(rt.V.int(a.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 2))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 5))));
    rt.fast.rawArrPushFront(a, 7);
    print(rt.show(rt.V.str("n2 ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(a.length)));
    rt.fast.rawArrRemoveAt(a, 0);
    a.pop();
    a.shift();
    rt.fast.rawArrRemoveAt(a, 1);
    print(rt.show(rt.V.str("n3 ")), rt.show(rt.V.int(a.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 1))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 2))));
    rt.fast.rawArrInsert(a, 99, 5);
    print(rt.show(rt.V.str("n4 ")), rt.show(rt.V.int(a.length)));
    rt.fast.rawArrRemoveAt(a, (-1));
    print(rt.show(rt.V.str("n5 ")), rt.show(rt.V.int(a.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(a, 1))));
    let s = rt.V.array(rt.GArray.of([]));
    rt.method(s, "append", [rt.V.str("x")]);
    rt.method(s, "append", [rt.V.str("y")]);
    rt.method(s, "insert", [rt.V.int(1), rt.V.str("z")]);
    print(rt.show(rt.V.str("n6 ")), rt.show(rt.method(s, "size", [])), rt.show(rt.V.str(" ")), rt.show(rt.index(s, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.index(s, rt.V.int(1))), rt.show(rt.V.str(" ")), rt.show(rt.index(s, rt.V.int(2))));
    rt.method(s, "fill", [rt.V.str("w")]);
    print(rt.show(rt.V.str("n7 ")), rt.show(rt.index(s, rt.V.int(0))), rt.show(rt.V.str(" ")), rt.show(rt.index(s, rt.V.int(2))));
    rt.method(s, "clear", []);
    print(rt.show(rt.V.str("n8 ")), rt.show(rt.method(s, "size", [])));
    let b = [1, 2];
    let st = rt.fast.rawArrInsert(b, 0, 3);
    print(rt.show(rt.V.str("n9 ")), rt.show(rt.V.int(st)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(b, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(b.length)));
    let bad = rt.fast.rawArrInsert(b, 9, 4);
    print(rt.show(rt.V.str("n10 ")), rt.show(rt.V.int(bad)));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.V.int(1), rt.V.int(10));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.V.int(2), rt.V.int(20));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(rt.V.str("n11 ")), rt.show(rt.method(d, "get", [rt.V.int(1)])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "get", [rt.V.int(3), rt.V.int(99)])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "get", [rt.V.int(2), rt.V.int(0)])), rt.show(rt.V.str(" ")), rt.show(rt.method(d, "size", [])));
    let sd = new Map([]);
    sd.set("k", 5);
    print(rt.show(rt.V.str("n12 ")), rt.show(rt.V.int(rt.fast.rawDictGetOr(sd, "k", 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawDictGetOr(sd, "j", 7))));
    let mixed = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(mixed, rt.V.int(1), rt.V.int(2));
      if (_nv !== null) mixed = _nv;
    }
    print(rt.show(rt.V.str("n13 ")), rt.show(rt.method(mixed, "get", [rt.V.str("nope")])), rt.show(rt.V.str(" ")), rt.show(rt.method(mixed, "size", [])));
    let q = [1, 2, 3];
    rt.fast.rawArrInsert(q, (-1), 4);
    print(rt.show(rt.V.str("n14 ")), rt.show(rt.V.int(q.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 1))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 2))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 3))));
    rt.fast.rawArrInsert(q, (-4), 5);
    print(rt.show(rt.V.str("n15 ")), rt.show(rt.V.int(q.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 1))));
    rt.fast.rawArrRemoveAt(q, (-1));
    rt.fast.rawArrRemoveAt(q, (-2));
    print(rt.show(rt.V.str("n16 ")), rt.show(rt.V.int(q.length)), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(q, 1))));
    let only = [1];
    only.pop();
    only.shift();
    rt.fast.rawArrRemoveAt(only, 0);
    rt.fast.rawArrRemoveAt(only, 0);
    print(rt.show(rt.V.str("n17 ")), rt.show(rt.V.int(only.length)));
    let r = [1, 2, 3];
    r.push(4);
    r.reverse();
    print(rt.show(rt.V.str("n18 ")), rt.show(rt.V.int(rt.fast.rawArrGet(r, 0))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(r, 1))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(r, 2))), rt.show(rt.V.str(" ")), rt.show(rt.V.int(rt.fast.rawArrGet(r, 3))));
    this.quit();
  }
  
}

await new Main().run();
