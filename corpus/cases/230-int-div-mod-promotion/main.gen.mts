// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  d(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(rt.strBuiltin([rt.ops.div(a, b)]), rt.V.str(":")), rt.strBuiltin([rt.typeOf(rt.ops.div(a, b))]));
  }
  
  m(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.ops.add(rt.ops.add(rt.strBuiltin([rt.ops.mod(a, b)]), rt.V.str(":")), rt.strBuiltin([rt.typeOf(rt.ops.mod(a, b))]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("div\t"), this.d(rt.V.int(7), rt.V.int(2))), rt.V.str("\t")), this.d(rt.V.int((-7)), rt.V.int(2))), rt.V.str("\t")), this.d(rt.V.int(7), rt.V.int((-2)))), rt.V.str("\t")), this.d(rt.V.int((-7)), rt.V.int((-2))))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("div-mixed\t"), this.d(rt.V.int(7), rt.V.float(2))), rt.V.str("\t")), this.d(rt.V.float(7), rt.V.int(2))), rt.V.str("\t")), this.d(rt.V.float(7.5), rt.V.float(2)))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("div-lit\t"), rt.strBuiltin([rt.V.int(rt.fast.iDivC(7, 3))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.div(rt.V.int(7), rt.V.float(2))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.div(rt.V.float(7), rt.V.int(2))]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("mod\t"), this.m(rt.V.int(7), rt.V.int(3))), rt.V.str("\t")), this.m(rt.V.int((-7)), rt.V.int(3))), rt.V.str("\t")), this.m(rt.V.int(7), rt.V.int((-3)))), rt.V.str("\t")), this.m(rt.V.int((-7)), rt.V.int((-3))))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("mod-zero-guard\t"), this.m(rt.V.int(7), rt.V.int(3))), rt.V.str("\t")), this.m(rt.V.int(0), rt.V.int(5)))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("int64\t"), rt.strBuiltin([rt.ops.shl(rt.V.int(1), rt.V.int(62))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.mul(rt.ops.shl(rt.V.int(1), rt.V.int(62)), rt.V.int(3))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.div(rt.ops.shl(rt.V.int(1), rt.V.int(62)), rt.V.int(3))]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("shift\t"), rt.strBuiltin([rt.ops.shl(rt.V.int(1), rt.V.int(40))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.shr(rt.ops.shl(rt.V.int(1), rt.V.int(40)), rt.V.int(40))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.shr(rt.V.int(8), rt.V.int(1))]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("bitops\t"), rt.strBuiltin([rt.ops.band(rt.V.int(6), rt.V.int(9))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.bor(rt.V.int(6), rt.V.int(9))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.bxor(rt.V.int(6), rt.V.int(9))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.bnot(rt.V.int(5))]))]));
    print(rt.showArgs([rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.V.str("pow\t"), rt.strBuiltin([rt.ops.pow(rt.V.int(2), rt.V.int(10))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.pow(rt.V.int(2), rt.V.int(0))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.pow(rt.V.int((-2)), rt.V.int(3))])), rt.V.str("\t")), rt.strBuiltin([rt.ops.pow(rt.V.float(2), rt.V.int(10))]))]));
    print(rt.showArgs([rt.ops.add(rt.V.str("assign-ops\t"), this._compound())]));
    this.quit();
  }
  
  _compound(): rt.Variant {
    let v = 7;
    v = rt.fast.iDivC(v, 2);
    let w = 7;
    w = rt.fast.iModC(w, 3);
    let x = rt.V.int(1);
    x = rt.ops.shl(x, rt.V.int(8));
    let y = rt.V.int(256);
    y = rt.ops.shr(y, rt.V.int(4));
    let z = rt.V.int(2);
    z = rt.ops.pow(z, rt.V.int(5));
    return rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.ops.add(rt.strBuiltin([rt.V.int(v)]), rt.V.str("/")), rt.strBuiltin([rt.typeOf(rt.V.int(v))])), rt.V.str(" ")), rt.strBuiltin([rt.V.int(w)])), rt.V.str(" ")), rt.strBuiltin([x])), rt.V.str(" ")), rt.strBuiltin([y])), rt.V.str(" ")), rt.strBuiltin([z]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "d": return rt.wrapValue(this.d(args[0] as rt.Variant, args[1] as rt.Variant));
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      case "_compound": return rt.wrapValue(this._compound());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "d": [2, 2], "m": [2, 2], "_initialize": [0, 0], "_compound": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
