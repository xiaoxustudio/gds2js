// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    print(rt.show(rt.index(a, rt.V.int((-1)))));
    print(rt.show(rt.index(a, rt.V.int((-3)))));
    {
      const _nv = rt.writeIdx(a, rt.V.int((-1)), rt.V.int(9));
      if (_nv !== null) a = _nv;
    }
    print(rt.show(a));
    {
      const _nv = rt.writeIdx(a, rt.V.int((-2)), rt.V.int(8));
      if (_nv !== null) a = _nv;
    }
    print(rt.show(a));
    {
      const _nv = rt.writeIdx(a, rt.V.int(0), rt.V.int(5));
      if (_nv !== null) a = _nv;
    }
    print(rt.show(a));
    let b = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))]));
    print(rt.show(rt.index(rt.index(b, rt.V.int((-1))), rt.V.int((-1)))));
    {
    const _w0 = rt.V.int((-1));
      const _nv = rt.writeIdx(rt.index(b, _w0), rt.V.int(0), rt.V.int(7));
      if (_nv !== null) rt.setIndex(b, _w0, _nv);
    }
    print(rt.show(b));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeIdx(rt.index(b, _w0), rt.V.int(1), rt.V.int(6));
      if (_nv !== null) rt.setIndex(b, _w0, _nv);
    }
    print(rt.show(b));
    print(rt.show(rt.method(a, "size", [])));
    print(rt.show(rt.method(b, "size", [])));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
