// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  show(tag: rt.Variant, v: rt.Variant): void {
    print(rt.showArgs([tag, rt.V.str("|"), rt.typeOf(v), rt.V.str("|"), rt.V.str(rt.varToStr(v))]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.show(rt.V.str("p01|"), rt.ops.mul(rt.V.float(3), rt.ops.pow(rt.V.float(2), rt.V.int(2))));
    this.show(rt.V.str("p02|"), rt.ops.mul(rt.V.int(3), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p03|"), rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(3)));
    this.show(rt.V.str("p04|"), rt.ops.div(rt.V.int(6), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p05|"), rt.ops.div(rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(3)), rt.V.int(2)));
    this.show(rt.V.str("p06|"), rt.ops.mod(rt.V.int(7), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p07|"), rt.ops.mod(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(3)));
    this.show(rt.V.str("p08|"), rt.ops.add(rt.V.int(1), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p09|"), rt.ops.sub(rt.V.int(1), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p10|"), rt.ops.pow(rt.ops.pow(rt.V.int(2), rt.V.int(3)), rt.V.int(2)));
    this.show(rt.V.str("p11|"), rt.ops.pow(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(3)));
    this.show(rt.V.str("p12|"), rt.ops.pow(rt.V.int((-2)), rt.V.int(2)));
    this.show(rt.V.str("p13|"), rt.ops.pow(rt.V.float((-2)), rt.V.int(2)));
    this.show(rt.V.str("p14|"), rt.ops.mul(rt.V.int(2), rt.ops.pow(rt.V.int((-3)), rt.V.int(2))));
    this.show(rt.V.str("p15|"), rt.ops.pow(rt.V.int(rt.fast.iMulC(3, 2)), rt.V.int(2)));
    this.show(rt.V.str("p16|"), rt.ops.add(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(rt.fast.iMulC(3, 2))));
    this.show(rt.V.str("p17|"), rt.ops.shl(rt.V.int(2), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p18|"), rt.ops.mod(rt.V.int(rt.fast.iDivC(100, 5)), rt.ops.pow(rt.V.int(2), rt.V.int(3))));
    this.show(rt.V.str("p19|"), rt.ops.mul(rt.V.float(1), rt.ops.pow(rt.V.float(2), rt.V.int(63))));
    this.show(rt.V.str("p20|"), rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int(3)), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p21|"), rt.ops.div(rt.V.int(rt.fast.iDivC(10, 2)), rt.ops.pow(rt.V.int(2), rt.V.int(2))));
    this.show(rt.V.str("p22|"), rt.ops.mul(rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(3)), rt.V.int(2)));
    this.show(rt.V.str("p23|"), rt.ops.add(rt.V.int(1), rt.ops.mul(rt.V.int(2), rt.ops.pow(rt.V.int(3), rt.V.int(2)))));
    this.show(rt.V.str("p24|"), rt.ops.mul(rt.ops.pow(rt.ops.pow(rt.V.int(2), rt.V.int(3)), rt.V.int(2)), rt.V.int(2)));
    this.show(rt.V.str("p25|"), rt.ops.mul(rt.ops.pow(rt.V.float(2), rt.V.int(3)), rt.V.int(2)));
    this.show(rt.V.str("p26|"), rt.ops.mod(rt.V.int(1), rt.ops.pow(rt.V.int(2), rt.V.int(3))));
    this.show(rt.V.str("p27|"), rt.ops.div(rt.ops.mul(rt.V.int(rt.fast.iMulC(2, 2)), rt.ops.pow(rt.V.int(2), rt.V.int(3))), rt.V.int(4)));
    this.show(rt.V.str("p28|"), rt.ops.mod(rt.ops.pow(rt.V.int(rt.fast.iMulC(2, 3)), rt.V.int(2)), rt.V.int(5)));
    this.show(rt.V.str("p29|"), rt.ops.pow(rt.V.int(2), rt.V.int(rt.fast.iMulC(3, 2))));
    this.show(rt.V.str("p30|"), rt.ops.mul(rt.V.int((-2)), rt.ops.pow(rt.V.int(3), rt.V.int(2))));
    this.show(rt.V.str("p31|"), rt.ops.sub(rt.V.int(1), rt.ops.mul(rt.ops.pow(rt.V.int(2), rt.V.int(2)), rt.V.int(2))));
    this.show(rt.V.str("p32|"), rt.ops.mod(rt.V.int(100), rt.ops.pow(rt.V.int(7), rt.V.int(2))));
    this.show(rt.V.str("p33|"), rt.ops.mod(rt.ops.div(rt.V.int(rt.fast.iMulC(3, 4)), rt.ops.pow(rt.V.int(2), rt.V.int(2))), rt.V.int(2)));
    this.show(rt.V.str("p34|"), rt.ops.pow(rt.V.int(7), rt.V.int(0)));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "show": return rt.wrapValue(this.show(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "show": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
