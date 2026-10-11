// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("V2|1e-9||"), rt.vector2New([rt.V.float(1e-9), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e-8||"), rt.vector2New([rt.V.float(1e-8), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e-7||"), rt.vector2New([rt.V.float(1e-7), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1.5e-8||"), rt.vector2New([rt.V.float(1.5e-8), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e-6||"), rt.vector2New([rt.V.float(0.000001), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|2e-5||"), rt.vector2New([rt.V.float(0.00002), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e-4||"), rt.vector2New([rt.V.float(0.0001), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e-3||"), rt.vector2New([rt.V.float(0.001), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|0.123456789||"), rt.vector2New([rt.V.float(0.123456789), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|3.14159e-7||"), rt.vector2New([rt.V.float(3.14159e-7), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e17||"), rt.vector2New([rt.V.float(100000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e18||"), rt.vector2New([rt.V.float(1000000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e19||"), rt.vector2New([rt.V.float(10000000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1.5e19||"), rt.vector2New([rt.V.float(15000000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e20||"), rt.vector2New([rt.V.float(100000000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e21||"), rt.vector2New([rt.V.float(1e+21), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1.5e21||"), rt.vector2New([rt.V.float(1.5e+21), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|-3e21||"), rt.vector2New([rt.V.float((-3e+21)), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e22||"), rt.vector2New([rt.V.float(1e+22), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1e24||"), rt.vector2New([rt.V.float(1e+24), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|123456789012345678.0||"), rt.vector2New([rt.V.float(123456789012345680), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|9007199254740993.0||"), rt.vector2New([rt.V.float(9007199254740994), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|8.53e20||"), rt.vector2New([rt.V.float(853000000000000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V2|1.0000001e18||"), rt.vector2New([rt.V.float(1000000100000000000), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-9||"), rt.vector3New([rt.V.float(1e-9), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-8||"), rt.vector3New([rt.V.float(1e-8), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-7||"), rt.vector3New([rt.V.float(1e-7), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1.5e-8||"), rt.vector3New([rt.V.float(1.5e-8), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-6||"), rt.vector3New([rt.V.float(0.000001), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|2e-5||"), rt.vector3New([rt.V.float(0.00002), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-4||"), rt.vector3New([rt.V.float(0.0001), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e-3||"), rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|0.123456789||"), rt.vector3New([rt.V.float(0.123456789), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|3.14159e-7||"), rt.vector3New([rt.V.float(3.14159e-7), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e17||"), rt.vector3New([rt.V.float(100000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e18||"), rt.vector3New([rt.V.float(1000000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e19||"), rt.vector3New([rt.V.float(10000000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1.5e19||"), rt.vector3New([rt.V.float(15000000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e20||"), rt.vector3New([rt.V.float(100000000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e21||"), rt.vector3New([rt.V.float(1e+21), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1.5e21||"), rt.vector3New([rt.V.float(1.5e+21), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|-3e21||"), rt.vector3New([rt.V.float((-3e+21)), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e22||"), rt.vector3New([rt.V.float(1e+22), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1e24||"), rt.vector3New([rt.V.float(1e+24), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|123456789012345678.0||"), rt.vector3New([rt.V.float(123456789012345680), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|9007199254740993.0||"), rt.vector3New([rt.V.float(9007199254740994), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|8.53e20||"), rt.vector3New([rt.V.float(853000000000000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("V3|1.0000001e18||"), rt.vector3New([rt.V.float(1000000100000000000), rt.V.int(0), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("C|1e-9||"), rt.colorNew([rt.V.float(1e-9), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e-7||"), rt.colorNew([rt.V.float(1e-7), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e-6||"), rt.colorNew([rt.V.float(0.000001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e-5||"), rt.colorNew([rt.V.float(0.00001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e-4||"), rt.colorNew([rt.V.float(0.0001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|0.00005||"), rt.colorNew([rt.V.float(0.00005), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|0.123456789||"), rt.colorNew([rt.V.float(0.123456789), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e17||"), rt.colorNew([rt.V.float(100000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e18||"), rt.colorNew([rt.V.float(1000000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e19||"), rt.colorNew([rt.V.float(10000000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|1e21||"), rt.colorNew([rt.V.float(1e+21), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|-3e21||"), rt.colorNew([rt.V.float((-3e+21)), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|9007199254740993.0||"), rt.colorNew([rt.V.float(9007199254740994), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("C|0.99999999||"), rt.colorNew([rt.V.float(0.99999999), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("F|1e-9||"), rt.V.float(1e-9)]));
    print(rt.showArgs([rt.V.str("F|1e-7||"), rt.V.float(1e-7)]));
    print(rt.showArgs([rt.V.str("F|0.123456789||"), rt.V.float(0.123456789)]));
    print(rt.showArgs([rt.V.str("F|1e17||"), rt.V.float(100000000000000000)]));
    print(rt.showArgs([rt.V.str("F|1e18||"), rt.V.float(1000000000000000000)]));
    print(rt.showArgs([rt.V.str("F|1e19||"), rt.V.float(10000000000000000000)]));
    print(rt.showArgs([rt.V.str("F|1.5e19||"), rt.V.float(15000000000000000000)]));
    print(rt.showArgs([rt.V.str("F|1e20||"), rt.V.float(100000000000000000000)]));
    print(rt.showArgs([rt.V.str("F|1e21||"), rt.V.float(1e+21)]));
    print(rt.showArgs([rt.V.str("F|1.5e21||"), rt.V.float(1.5e+21)]));
    print(rt.showArgs([rt.V.str("F|-3e21||"), rt.V.float((-3e+21))]));
    print(rt.showArgs([rt.V.str("F|1e22||"), rt.V.float(1e+22)]));
    print(rt.showArgs([rt.V.str("F|1e24||"), rt.V.float(1e+24)]));
    print(rt.showArgs([rt.V.str("F|1234567890123456789.0||"), rt.V.float(1234567890123456800)]));
    print(rt.showArgs([rt.V.str("F|8.53e20||"), rt.V.float(853000000000000000000)]));
    print(rt.showArgs([rt.V.str("F|3.141592653589793||"), rt.V.float(3.141592653589793)]));
    print(rt.showArgs([rt.V.str("F|1e-16||"), rt.V.float(1e-16)]));
    print(rt.showArgs([rt.V.str("F|5e-324||"), rt.V.float(0)]));
    print(rt.showArgs([rt.V.str("F|9007199254740991.0||"), rt.V.float(9007199254740990)]));
    print(rt.showArgs([rt.V.str("F|9007199254740992.0||"), rt.V.float(9007199254740992)]));
    print(rt.showArgs([rt.V.str("F|9007199254740993.0||"), rt.V.float(9007199254740994)]));
    print(rt.showArgs([rt.V.str("F|9007199254740994.0||"), rt.V.float(9007199254740994)]));
    print(rt.showArgs([rt.V.str("F|9007199254740995.0||"), rt.V.float(9007199254740996)]));
    print(rt.showArgs([rt.V.str("F|9007199254740996.0||"), rt.V.float(9007199254740996)]));
    print(rt.showArgs([rt.V.str("F|9007199254740997.0||"), rt.V.float(9007199254740996)]));
    print(rt.showArgs([rt.V.str("F|9007199254740993.5||"), rt.V.float(9007199254740994)]));
    print(rt.showArgs([rt.V.str("F|18014398509481985.0||"), rt.V.float(18014398509481984)]));
    print(rt.showArgs([rt.V.str("F|18014398509481983.0||"), rt.V.float(18014398509481984)]));
    print(rt.showArgs([rt.V.str("F|4503599627370497.0||"), rt.V.float(4503599627370497)]));
    print(rt.showArgs([rt.V.str("F|9223372036854775807.0||"), rt.V.float(9223372036854776000)]));
    print(rt.showArgs([rt.V.str("F|1e23||"), rt.V.float(1e+23)]));
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
