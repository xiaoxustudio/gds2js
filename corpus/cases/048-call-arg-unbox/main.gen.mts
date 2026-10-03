// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  add2(a: number, b: number): number {
    return rt.fast.iAddC(a, b);
  }
  
  scale(x: number): number {
    return (x * 2);
  }
  
  shout(s: string): string {
    return (s + "!");
  }
  
  idn(x: rt.Variant): rt.Variant {
    return x;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let total = 0;
    let i = 0;
    while ((i < 3)) {
      total = this.add2(total, i);
      i = rt.fast.iAddC(i, 1);
    }
    print(rt.showArgs([rt.V.int(total)]));
    print(rt.showArgs([rt.V.int(rt.fast.iAddC(this.add2(100, 200), 5))]));
    let arr = rt.V.array(rt.GArray.of([rt.V.int(this.add2(1, 2)), rt.V.int(this.add2(3, 4))]));
    print(rt.showArgs([arr]));
    print(rt.showArgs([rt.V.float(this.scale(3))]));
    print(rt.showArgs([rt.V.str(this.shout("hi"))]));
    print(rt.showArgs([this.idn(rt.V.int(7))]));
    print(rt.showArgs([this.idn(rt.V.str("s"))]));
    print(rt.showArgs([rt.V.int(this.add2(7, 2))]));
    print(rt.showArgs([this.idn(rt.V.int(2))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "add2": return rt.wrapValue(this.add2(rt.fast.unboxNum(args[0] as rt.Variant), rt.fast.unboxNum(args[1] as rt.Variant)));
      case "scale": return rt.wrapValue(this.scale(rt.fast.unboxNum(args[0] as rt.Variant)));
      case "shout": return rt.wrapValue(this.shout(rt.fast.unboxStr(args[0] as rt.Variant)));
      case "idn": return rt.wrapValue(this.idn(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "add2": [2, 2], "scale": [1, 1], "shout": [1, 1], "idn": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
