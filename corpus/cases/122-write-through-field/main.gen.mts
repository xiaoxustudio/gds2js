// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let p = rt.V.object(new Box());
    {
      const _nv = rt.writeProp(rt.attribute(p, "m"), "x", rt.V.int(5));
      if (_nv !== null) rt.writeProp(p, "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u1 "), rt.attribute(p, "m")]));
    {
      const _nv = rt.writeIdx(rt.attribute(p, "m"), rt.V.int(1), rt.V.int(7));
      if (_nv !== null) rt.writeProp(p, "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u2 "), rt.attribute(p, "m")]));
    let arr = rt.V.array(rt.GArray.of([p]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.attribute(rt.index(arr, _w0), "m"), "x", rt.V.int(9));
      if (_nv !== null) rt.writeProp(rt.index(arr, _w0), "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u3 "), rt.attribute(p, "m"), rt.V.str(" "), rt.attribute(rt.index(arr, rt.V.int(0)), "m")]));
    let d = rt.dictOf([[rt.V.str("k"), p]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.attribute(rt.index(d, _w0), "m"), "y", rt.V.int(3));
      if (_nv !== null) rt.writeProp(rt.index(d, _w0), "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u4 "), rt.attribute(p, "m")]));
    let q = rt.attribute(p, "m");
    {
      const _nv = rt.writeProp(q, "x", rt.V.int(50));
      if (_nv !== null) q = _nv;
    }
    print(rt.showArgs([rt.V.str("u5 "), rt.attribute(p, "m"), rt.V.str(" "), q]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "getm", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.index(rt.attribute(p, "m"), rt.V.int(0)), rt.V.str(" "), rt.index(rt.attribute(p, "m"), rt.V.int(1)), rt.V.str(" "), rt.attribute(rt.attribute(p, "m"), "y")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class Box {
  m = rt.vector2New([rt.V.int(1), rt.V.int(2)]);

  getm(): unknown {
    return this.m;
  }
  
}
rt.registerClass("Box", Box);
rt.registerFieldTypes(Box, {"m": "Vector2"});
rt.registerNativeBase(Box, "RefCounted");

await new Main().run();
