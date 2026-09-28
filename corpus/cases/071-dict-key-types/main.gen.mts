// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let d = rt.dictOf([[rt.V.int(1), rt.V.str("a")]]);
    {
      const _nv = rt.writeIdx(d, rt.V.float(1), rt.V.str("b"));
      if (_nv !== null) d = _nv;
    }
    print(rt.show(d));
    print(rt.show(rt.index(d, rt.V.int(1))));
    print(rt.show(rt.index(d, rt.V.float(1))));
    print(rt.show(rt.method(d, "size", [])));
    print(rt.show(rt.method(d, "has", [rt.V.float(1.5)])));
    print(rt.show(rt.method(d, "has", [rt.V.int(1)])));
    let g = rt.dictOf([[rt.V.int(1), rt.V.str("i")], [rt.V.bool(true), rt.V.str("b")], [rt.V.float(1), rt.V.str("f")]]);
    print(rt.show(g));
    print(rt.show(rt.method(g, "size", [])));
    print(rt.show(rt.method(g, "has", [rt.V.int(1)])));
    print(rt.show(rt.method(g, "has", [rt.V.bool(true)])));
    print(rt.show(rt.method(g, "has", [rt.V.float(1)])));
    let f = rt.dictOf([[rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("v")], [rt.vector2New([rt.V.int(2), rt.V.int(1)]), rt.V.str("w")]]);
    print(rt.show(f));
    print(rt.show(rt.index(f, rt.vector2New([rt.V.int(1), rt.V.int(2)]))));
    print(rt.show(rt.method(f, "size", [])));
    let k = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(k, rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("a"));
      if (_nv !== null) k = _nv;
    }
    {
      const _nv = rt.writeIdx(k, rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.str("b"));
      if (_nv !== null) k = _nv;
    }
    print(rt.show(k));
    print(rt.show(rt.method(k, "size", [])));
    let h = rt.dictOf([[rt.V.int(9007199254740993n), rt.V.str("big")], [rt.V.float(9007199254740992), rt.V.str("bigf")]]);
    print(rt.show(h));
    print(rt.show(rt.method(h, "size", [])));
    let e = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(e, rt.V.float((0 / 0)), rt.V.str("nan1"));
      if (_nv !== null) e = _nv;
    }
    print(rt.show(e));
    print(rt.show(rt.method(e, "size", [])));
    let z = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(z, rt.V.float(0), rt.V.str("zero"));
      if (_nv !== null) z = _nv;
    }
    {
      const _nv = rt.writeIdx(z, rt.V.float((-0)), rt.V.str("negzero"));
      if (_nv !== null) z = _nv;
    }
    print(rt.show(z));
    print(rt.show(rt.method(z, "size", [])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
