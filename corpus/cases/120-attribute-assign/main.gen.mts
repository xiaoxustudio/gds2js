// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let p = rt.V.object(new Inner());
    {
      const _nv = rt.writeProp(p, "m", rt.V.int(5));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a1 "), rt.attribute(p, "m")]));
    {
      const _nv = rt.writeProp(p, "m", rt.ops.add(rt.attribute(p, "m"), rt.V.int(3)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a2 "), rt.attribute(p, "m")]));
    {
      const _nv = rt.writeProp(p, "t", rt.V.float(5.5));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a3 "), rt.attribute(p, "t")]));
    {
      const _nv = rt.writeProp(p, "t", rt.V.str("12abc"));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a4 "), rt.attribute(p, "t")]));
    {
      const _nv = rt.writeProp(p, "s", rt.V.stringName("nm"));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a5 "), rt.attribute(p, "s"), rt.V.str(" "), rt.typeOf(rt.attribute(p, "s"))]));
    {
      const _nv = rt.writeProp(p, "v", rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a6 "), rt.attribute(p, "v")]));
    let arr = rt.V.array(rt.GArray.of([p, p]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.index(arr, _w0), "m", rt.V.int(11));
      if (_nv !== null) rt.setIndex(arr, _w0, _nv);
    }
    print(rt.showArgs([rt.V.str("a7 "), rt.attribute(rt.index(arr, rt.V.int(1)), "m"), rt.V.str(" "), rt.attribute(p, "m")]));
    let d = rt.dictOf([[rt.V.str("k"), p]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.index(d, _w0), "m", rt.V.int(12));
      if (_nv !== null) rt.setIndex(d, _w0, _nv);
    }
    print(rt.showArgs([rt.V.str("a8 "), rt.attribute(p, "m")]));
    let q = p;
    {
      const _nv = rt.writeProp(q, "m", rt.V.int(13));
      if (_nv !== null) q = _nv;
    }
    print(rt.showArgs([rt.V.str("a9 "), rt.attribute(p, "m"), rt.V.str(" "), rt.attribute(q, "m")]));
    {
      const _nv = rt.writeProp(p, "m", rt.ops.mul(rt.attribute(p, "m"), rt.V.int(2)));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("a10 "), rt.attribute(p, "m")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class Inner {
  m = rt.V.int(1);
  t = rt.toInt(rt.V.int(2));
  s = rt.strOf(rt.V.str("a"));
  v = rt.toVec2(rt.vector2New([rt.V.int(0), rt.V.int(0)]));

}
rt.registerClass("Inner", Inner);
rt.registerFieldTypes(Inner, {"t": "int", "s": "String", "v": "Vector2"});
rt.registerNativeBase(Inner, "RefCounted");

await new Main().run();
