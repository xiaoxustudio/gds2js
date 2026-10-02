// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new Box());
    {
      const _nv = rt.writeProp(rt.attribute(p, "m"), "x", rt.V.int(5));
      if (_nv !== null) rt.writeProp(p, "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u1 "), rt.wrapValue(rt.attribute(p, "m"))]));
    {
      const _nv = rt.writeIdx(rt.attribute(p, "m"), rt.V.int(1), rt.V.int(7));
      if (_nv !== null) rt.writeProp(p, "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u2 "), rt.wrapValue(rt.attribute(p, "m"))]));
    let arr = rt.V.array(rt.GArray.of([p]));
    {
    const _w0 = rt.V.int(0);
      const _nv = rt.writeProp(rt.attribute(rt.index(arr, _w0), "m"), "x", rt.V.int(9));
      if (_nv !== null) rt.writeProp(rt.index(arr, _w0), "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u3 "), rt.wrapValue(rt.attribute(p, "m")), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.index(arr, rt.V.int(0))), "m"))]));
    let d = rt.dictOf([[rt.V.str("k"), p]]);
    {
    const _w0 = rt.V.str("k");
      const _nv = rt.writeProp(rt.attribute(rt.index(d, _w0), "m"), "y", rt.V.int(3));
      if (_nv !== null) rt.writeProp(rt.index(d, _w0), "m", _nv);
    }
    print(rt.showArgs([rt.V.str("u4 "), rt.wrapValue(rt.attribute(p, "m"))]));
    let q = rt.wrapValue(rt.attribute(p, "m"));
    {
      const _nv = rt.writeProp(q, "x", rt.V.int(50));
      if (_nv !== null) q = _nv;
    }
    print(rt.showArgs([rt.V.str("u5 "), rt.wrapValue(rt.attribute(p, "m")), rt.V.str(" "), q]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "getm", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.wrapValue(rt.index(rt.wrapValue(rt.attribute(p, "m")), rt.V.int(0))), rt.V.str(" "), rt.wrapValue(rt.index(rt.wrapValue(rt.attribute(p, "m")), rt.V.int(1))), rt.V.str(" "), rt.wrapValue(rt.attribute(rt.wrapValue(rt.attribute(p, "m")), "y"))]));
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
class Box extends rt.GdScriptObject {
  m = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));

  getm(): rt.Variant {
    return this.m;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "getm": return rt.wrapValue(this.getm());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerFieldTypes(__gd_d_Box, {"m": "Vector2"});
rt.registerMethodArities(__gd_d_Box, { "getm": [0, 0] });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
