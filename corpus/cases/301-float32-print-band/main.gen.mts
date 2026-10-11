// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("D6|"), rt.vector2New([rt.V.float(1.234567), rt.V.float(0.1234567)]), rt.V.str("|"), rt.vector2New([rt.V.float(0.001234567), rt.V.float(0.000123456)]), rt.V.str("|"), rt.vector2New([rt.V.float(1e-20), rt.V.float((-5e-7))])]));
    print(rt.showArgs([rt.V.str("D5|"), rt.vector2New([rt.V.float(12.34567), rt.V.float(12.0000001)]), rt.V.str("|"), rt.vector2New([rt.V.float(99.5), rt.V.float(9.9999999)]), rt.V.str("|"), rt.vector2New([rt.V.float((-12.34567)), rt.V.float((-0.5))])]));
    print(rt.showArgs([rt.V.str("D4|"), rt.vector2New([rt.V.float(123.4567), rt.V.float(999.5)]), rt.V.str("|"), rt.vector2New([rt.V.float(1234.567), rt.V.float(31622.776)]), rt.V.str("|"), rt.vector2New([rt.V.float(9999.5), rt.V.float(99999.5)])]));
    print(rt.showArgs([rt.V.str("D1|"), rt.vector2New([rt.V.float(12345.67), rt.V.float(37777.74)]), rt.V.str("|"), rt.vector2New([rt.V.float(123456.7), rt.V.float(307777.7)]), rt.V.str("|"), rt.vector2New([rt.V.float(337777.7), rt.V.float(577777.7)]), rt.V.str("|"), rt.vector2New([rt.V.float(199999.25), rt.V.float(158113.9)])]));
    print(rt.showArgs([rt.V.str("D0|"), rt.vector2New([rt.V.float(999999.9), rt.V.float(1000000.4)]), rt.V.str("|"), rt.vector2New([rt.V.float(2777777.7), rt.V.float((-1234567.891))]), rt.V.str("|"), rt.vector2New([rt.V.float(3430000.75), rt.V.float(3430001)])]));
    print(rt.showArgs([rt.V.str("IT|"), rt.vector2New([rt.V.float(1234567.0625), rt.V.float(12345678.0625)]), rt.V.str("|"), rt.vector2New([rt.V.float(123456789.5), rt.V.float(1234567890.5)]), rt.V.str("|"), rt.vector2New([rt.V.float(6377777.75), rt.V.float(97777777.5)])]));
    print(rt.showArgs([rt.V.str("FR|"), rt.vector2New([rt.V.float((1 / 3)), rt.V.float((2 / 3))]), rt.V.str("|"), rt.vector2New([rt.V.float(0.1), rt.V.float(0.2)]), rt.V.str("|"), rt.vector2New([rt.V.float((1 / 7)), rt.V.float((100 / 7))]), rt.V.str("|"), rt.vector2New([rt.V.float((10000000 / 3)), rt.V.float((1000000000 / 7))])]));
    print(rt.showArgs([rt.V.str("V3|"), rt.vector3New([rt.V.float(1234.567), rt.V.float(123456.7), rt.V.float(999999.9)]), rt.V.str("|"), rt.vector3New([rt.V.float(3430000.75), rt.V.float(12345678.0625), rt.V.float(0.1234567)])]));
    print(rt.showArgs([rt.V.str("CL|"), rt.colorNew([rt.V.float(1234.567891), rt.V.float(123456.7891), rt.V.float((-1234567.891)), rt.V.float(12345678.91)]), rt.V.str("|"), rt.colorNew([rt.V.float(0.000123456), rt.V.float(1234.567), rt.V.float(1234567.0625), rt.V.float(123456789.5)])]));
    print(rt.showArgs([rt.V.str("SC|"), rt.V.float(1234567.891), rt.V.str("|"), rt.V.float(12345678901.234568), rt.V.str("|"), rt.V.float(1.234567891e-7), rt.V.str("|"), rt.V.float(1e-9), rt.V.str("|"), rt.V.float(1234567.0625)]));
    print(rt.showArgs([rt.V.str("ST|"), rt.strBuiltin([rt.vector2New([rt.V.float(1234567.891), rt.V.float(1234.5678)])]), rt.V.str("|"), rt.strBuiltin([rt.colorNew([rt.V.float(0.5), rt.V.float(1234.567891), rt.V.float(1), rt.V.float(1)])]), rt.V.str("|"), rt.strBuiltin([rt.V.float(1234567.891)])]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
