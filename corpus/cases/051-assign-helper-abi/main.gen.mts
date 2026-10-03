// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  tri(x: number): number {
    let y = rt.fast.iMulC(x, 3);
    let z = rt.fast.iAddC(y, x);
    return z;
  }
  
  shout(s: string): string {
    let t = (s + "!");
    return t;
  }
  
  mix(a: rt.Variant, b: rt.Variant): rt.Variant {
    let t = rt.ops.add(a, b);
    print(rt.showArgs([t]));
    return t;
  }
  
  choose(x: rt.Variant): rt.Variant {
    if (rt.ops.truthy(rt.ops.gt(x, rt.V.int(0)))) {
      return x;
    }
    return rt.V.int(0);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = 0;
    let i = 0;
    while ((i < 3)) {
      s = this.tri(i);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(s)]));
    print(rt.showArgs([rt.V.int(this.tri(10))]));
    print(rt.showArgs([rt.V.str(this.shout("hi"))]));
    print(rt.showArgs([this.mix(rt.V.int(2), rt.V.int(3))]));
    print(rt.showArgs([this.choose(rt.V.int(5))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "tri": return rt.wrapValue(this.tri(rt.fast.unboxNum(args[0] as rt.Variant)));
      case "shout": return rt.wrapValue(this.shout(rt.fast.unboxStr(args[0] as rt.Variant)));
      case "mix": return rt.wrapValue(this.mix(args[0] as rt.Variant, args[1] as rt.Variant));
      case "choose": return rt.wrapValue(this.choose(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "tri": [1, 1], "shout": [1, 1], "mix": [2, 2], "choose": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
