// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  static osv = rt.toInt(rt.V.int(1));

  static bumpOuter(): unknown {
    Main.osv = rt.toInt(rt.ops.add(Main.osv, rt.V.int(1)));
    return Main.osv;
  }
  
  async _initialize(): Promise<void> {
    let p = rt.V.object(new A());
    let q = rt.V.object(new A());
    print(rt.showArgs([rt.V.str("u1 "), A.x]));
    print(rt.showArgs([rt.V.str("u2 "), A.plain]));
    print(rt.showArgs([rt.V.str("u3 "), A.lit]));
    print(rt.showArgs([rt.V.str("u4 "), A.computed]));
    print(rt.showArgs([rt.V.str("u5 "), rt.method(A, "setx", [rt.V.int(9)]), rt.V.str(" "), A.x]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(A, "setx", [rt.V.float(2.7)]), rt.V.str(" "), A.x]));
    {
      const _nv = rt.writeProp(A, "x", rt.V.int(100));
      if (_nv !== null) A = _nv;
    }
    print(rt.showArgs([rt.V.str("u7 "), A.x]));
    print(rt.showArgs([rt.V.str("u8 "), rt.attribute(p, "x")]));
    {
      const _nv = rt.writeProp(p, "x", rt.V.int(200));
      if (_nv !== null) p = _nv;
    }
    print(rt.showArgs([rt.V.str("u9 "), A.x, rt.V.str(" "), rt.attribute(p, "x"), rt.V.str(" "), rt.attribute(q, "x")]));
    print(rt.showArgs([rt.V.str("u10 "), rt.method(p, "fromInstance", []), rt.V.str(" "), rt.method(q, "fromInstance", [])]));
    print(rt.showArgs([rt.V.str("u11 "), rt.method(p, "setx", [rt.V.int(5)]), rt.V.str(" "), A.x]));
    print(rt.showArgs([rt.V.str("u12 "), Main.bumpOuter(), rt.V.str(" "), Main.osv]));
    print(rt.showArgs([rt.V.str("u13 "), rt.attribute(rt.V.object(this), "osv")]));
    print(rt.showArgs([rt.V.str("u14 "), A.x, rt.V.str(" "), rt.attribute(p, "mv")]));
    this.quit();
  }
  
}

rt.registerStaticVars(Main, {"osv": "int"});
rt.registerStaticMethods(Main, ["bumpOuter"]);
rt.registerNativeBase(Main, "SceneTree");
class A {
  static x = rt.toInt(rt.V.int(1));
  static plain = rt.V.int(2);
  static lit = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
  static computed = rt.toInt(rt.V.int(rt.fast.iMulC(3, 7)));
  mv = rt.toInt(rt.V.int(9));

  static setx(v): unknown {
    A.x = rt.toInt(v);
    return A.x;
  }
  
  fromInstance(): unknown {
    return A.x;
  }
  
}
rt.registerClass("A", A);
rt.registerFieldTypes(A, {"mv": "int"});
rt.registerStaticVars(A, {"x": "int", "plain": "", "lit": "", "computed": "int"});
rt.registerStaticMethods(A, ["setx"]);
rt.registerNativeBase(A, "RefCounted");

await new Main().run();
