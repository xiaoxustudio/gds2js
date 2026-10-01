// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fd_int = rt.toInt(rt.V.float(2.7));
  fd_float = rt.toFloat(rt.V.int(3));
  fd_color = rt.toColor(rt.V.int(255));
  fd_vec2i = rt.toVec2i(rt.vector2New([rt.V.float(1.7), rt.V.float(2.9)]));
  fd_name = rt.toStringNameSlot(rt.V.str("nm"));

  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("r "), this.fd_int, rt.V.str(" "), this.fd_float, rt.V.str(" "), this.fd_color, rt.V.str(" "), this.fd_vec2i, rt.V.str(" "), rt.typeOf(this.fd_name), rt.V.str(" "), this.fd_name]));
    let c = rt.toColor(rt.V.int(123456789));
    print(rt.showArgs([rt.V.str("c "), c, rt.V.str(" "), rt.typeOf(c)]));
    c = rt.toColor(rt.V.str("abc"));
    print(rt.showArgs([rt.V.str("c2 "), c]));
    let n = rt.toStringNameSlot(rt.V.str("zz"));
    print(rt.showArgs([rt.V.str("n "), rt.typeOf(n), rt.V.str(" "), n]));
    let a = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.str("f00")])), "Color", true);
    rt.method(a, "append", [rt.V.int(65280)]);
    {
      const _nv = rt.writeIdx(a, rt.V.int(0), rt.V.int(4294967295));
      if (_nv !== null) a = _nv;
    }
    print(rt.showArgs([rt.V.str("a "), a, rt.V.str(" "), rt.typeOf(rt.index(a, rt.V.int(1)))]));
    let d = rt.stampDict(rt.dictOf([[rt.V.str("k"), rt.V.int(5)]]), "StringName", "Color", true);
    print(rt.showArgs([rt.V.str("d "), d, rt.V.str(" "), rt.typeOf(rt.index(rt.method(d, "keys", []), rt.V.int(0))), rt.V.str(" "), rt.typeOf(rt.index(d, rt.V.str("k")))]));
    let s = rt.strOf(rt.V.stringName("abc"));
    print(rt.showArgs([rt.V.str("s "), s, rt.V.str(" "), rt.typeOf(s)]));
    let arr = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.stringName("abc")])), "String", true);
    print(rt.showArgs([rt.V.str("arr "), arr, rt.V.str(" "), rt.typeOf(rt.index(arr, rt.V.int(0)))]));
    this.quit();
  }
  
}

rt.registerFieldTypes(Main, {"fd_int": "int", "fd_float": "float"});
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
