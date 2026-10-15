// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(4);
      print(rt.showArgs([rt.V.str("V2|1e-9||"), rt.vector2New([rt.V.float(1e-9), rt.V.int(0)])]));
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("V2|1e-8||"), rt.vector2New([rt.V.float(1e-8), rt.V.int(0)])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("V2|1e-7||"), rt.vector2New([rt.V.float(1e-7), rt.V.int(0)])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("V2|1.5e-8||"), rt.vector2New([rt.V.float(1.5e-8), rt.V.int(0)])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("V2|1e-6||"), rt.vector2New([rt.V.float(0.000001), rt.V.int(0)])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("V2|2e-5||"), rt.vector2New([rt.V.float(0.00002), rt.V.int(0)])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("V2|1e-4||"), rt.vector2New([rt.V.float(0.0001), rt.V.int(0)])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("V2|1e-3||"), rt.vector2New([rt.V.float(0.001), rt.V.int(0)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("V2|0.123456789||"), rt.vector2New([rt.V.float(0.123456789), rt.V.int(0)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("V2|3.14159e-7||"), rt.vector2New([rt.V.float(3.14159e-7), rt.V.int(0)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("V2|1e17||"), rt.vector2New([rt.V.float(100000000000000000), rt.V.int(0)])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("V2|1e18||"), rt.vector2New([rt.V.float(1000000000000000000), rt.V.int(0)])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("V2|1e19||"), rt.vector2New([rt.V.float(10000000000000000000), rt.V.int(0)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("V2|1.5e19||"), rt.vector2New([rt.V.float(15000000000000000000), rt.V.int(0)])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("V2|1e20||"), rt.vector2New([rt.V.float(100000000000000000000), rt.V.int(0)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("V2|1e21||"), rt.vector2New([rt.V.float(1e+21), rt.V.int(0)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("V2|1.5e21||"), rt.vector2New([rt.V.float(1.5e+21), rt.V.int(0)])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("V2|-3e21||"), rt.vector2New([rt.V.float((-3e+21)), rt.V.int(0)])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("V2|1e22||"), rt.vector2New([rt.V.float(1e+22), rt.V.int(0)])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("V2|1e24||"), rt.vector2New([rt.V.float(1e+24), rt.V.int(0)])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("V2|123456789012345678.0||"), rt.vector2New([rt.V.float(123456789012345680), rt.V.int(0)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("V2|9007199254740993.0||"), rt.vector2New([rt.V.float(9007199254740994), rt.V.int(0)])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("V2|8.53e20||"), rt.vector2New([rt.V.float(853000000000000000000), rt.V.int(0)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("V2|1.0000001e18||"), rt.vector2New([rt.V.float(1000000100000000000), rt.V.int(0)])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("V3|1e-9||"), rt.vector3New([rt.V.float(1e-9), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("V3|1e-8||"), rt.vector3New([rt.V.float(1e-8), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("V3|1e-7||"), rt.vector3New([rt.V.float(1e-7), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("V3|1.5e-8||"), rt.vector3New([rt.V.float(1.5e-8), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("V3|1e-6||"), rt.vector3New([rt.V.float(0.000001), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("V3|2e-5||"), rt.vector3New([rt.V.float(0.00002), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("V3|1e-4||"), rt.vector3New([rt.V.float(0.0001), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("V3|1e-3||"), rt.vector3New([rt.V.float(0.001), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("V3|0.123456789||"), rt.vector3New([rt.V.float(0.123456789), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("V3|3.14159e-7||"), rt.vector3New([rt.V.float(3.14159e-7), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("V3|1e17||"), rt.vector3New([rt.V.float(100000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("V3|1e18||"), rt.vector3New([rt.V.float(1000000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("V3|1e19||"), rt.vector3New([rt.V.float(10000000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("V3|1.5e19||"), rt.vector3New([rt.V.float(15000000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("V3|1e20||"), rt.vector3New([rt.V.float(100000000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("V3|1e21||"), rt.vector3New([rt.V.float(1e+21), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("V3|1.5e21||"), rt.vector3New([rt.V.float(1.5e+21), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("V3|-3e21||"), rt.vector3New([rt.V.float((-3e+21)), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("V3|1e22||"), rt.vector3New([rt.V.float(1e+22), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("V3|1e24||"), rt.vector3New([rt.V.float(1e+24), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("V3|123456789012345678.0||"), rt.vector3New([rt.V.float(123456789012345680), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("V3|9007199254740993.0||"), rt.vector3New([rt.V.float(9007199254740994), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("V3|8.53e20||"), rt.vector3New([rt.V.float(853000000000000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("V3|1.0000001e18||"), rt.vector3New([rt.V.float(1000000100000000000), rt.V.int(0), rt.V.int(0)])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("C|1e-9||"), rt.colorNew([rt.V.float(1e-9), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("C|1e-7||"), rt.colorNew([rt.V.float(1e-7), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(54);
      print(rt.showArgs([rt.V.str("C|1e-6||"), rt.colorNew([rt.V.float(0.000001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(55);
      print(rt.showArgs([rt.V.str("C|1e-5||"), rt.colorNew([rt.V.float(0.00001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("C|1e-4||"), rt.colorNew([rt.V.float(0.0001), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("C|0.00005||"), rt.colorNew([rt.V.float(0.00005), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("C|0.123456789||"), rt.colorNew([rt.V.float(0.123456789), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(59);
      print(rt.showArgs([rt.V.str("C|1e17||"), rt.colorNew([rt.V.float(100000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("C|1e18||"), rt.colorNew([rt.V.float(1000000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(61);
      print(rt.showArgs([rt.V.str("C|1e19||"), rt.colorNew([rt.V.float(10000000000000000000), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("C|1e21||"), rt.colorNew([rt.V.float(1e+21), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("C|-3e21||"), rt.colorNew([rt.V.float((-3e+21)), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(64);
      print(rt.showArgs([rt.V.str("C|9007199254740993.0||"), rt.colorNew([rt.V.float(9007199254740994), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(65);
      print(rt.showArgs([rt.V.str("C|0.99999999||"), rt.colorNew([rt.V.float(0.99999999), rt.V.int(0), rt.V.int(0), rt.V.int(1)])]));
      rt.frameLine(66);
      print(rt.showArgs([rt.V.str("F|1e-9||"), rt.V.float(1e-9)]));
      rt.frameLine(67);
      print(rt.showArgs([rt.V.str("F|1e-7||"), rt.V.float(1e-7)]));
      rt.frameLine(68);
      print(rt.showArgs([rt.V.str("F|0.123456789||"), rt.V.float(0.123456789)]));
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("F|1e17||"), rt.V.float(100000000000000000)]));
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("F|1e18||"), rt.V.float(1000000000000000000)]));
      rt.frameLine(71);
      print(rt.showArgs([rt.V.str("F|1e19||"), rt.V.float(10000000000000000000)]));
      rt.frameLine(72);
      print(rt.showArgs([rt.V.str("F|1.5e19||"), rt.V.float(15000000000000000000)]));
      rt.frameLine(73);
      print(rt.showArgs([rt.V.str("F|1e20||"), rt.V.float(100000000000000000000)]));
      rt.frameLine(74);
      print(rt.showArgs([rt.V.str("F|1e21||"), rt.V.float(1e+21)]));
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("F|1.5e21||"), rt.V.float(1.5e+21)]));
      rt.frameLine(76);
      print(rt.showArgs([rt.V.str("F|-3e21||"), rt.V.float((-3e+21))]));
      rt.frameLine(77);
      print(rt.showArgs([rt.V.str("F|1e22||"), rt.V.float(1e+22)]));
      rt.frameLine(78);
      print(rt.showArgs([rt.V.str("F|1e24||"), rt.V.float(1e+24)]));
      rt.frameLine(79);
      print(rt.showArgs([rt.V.str("F|1234567890123456789.0||"), rt.V.float(1234567890123456800)]));
      rt.frameLine(80);
      print(rt.showArgs([rt.V.str("F|8.53e20||"), rt.V.float(853000000000000000000)]));
      rt.frameLine(81);
      print(rt.showArgs([rt.V.str("F|3.141592653589793||"), rt.V.float(3.141592653589793)]));
      rt.frameLine(82);
      print(rt.showArgs([rt.V.str("F|1e-16||"), rt.V.float(1e-16)]));
      rt.frameLine(83);
      print(rt.showArgs([rt.V.str("F|5e-324||"), rt.V.float(0)]));
      rt.frameLine(84);
      print(rt.showArgs([rt.V.str("F|9007199254740991.0||"), rt.V.float(9007199254740990)]));
      rt.frameLine(85);
      print(rt.showArgs([rt.V.str("F|9007199254740992.0||"), rt.V.float(9007199254740992)]));
      rt.frameLine(86);
      print(rt.showArgs([rt.V.str("F|9007199254740993.0||"), rt.V.float(9007199254740994)]));
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("F|9007199254740994.0||"), rt.V.float(9007199254740994)]));
      rt.frameLine(88);
      print(rt.showArgs([rt.V.str("F|9007199254740995.0||"), rt.V.float(9007199254740996)]));
      rt.frameLine(89);
      print(rt.showArgs([rt.V.str("F|9007199254740996.0||"), rt.V.float(9007199254740996)]));
      rt.frameLine(90);
      print(rt.showArgs([rt.V.str("F|9007199254740997.0||"), rt.V.float(9007199254740996)]));
      rt.frameLine(91);
      print(rt.showArgs([rt.V.str("F|9007199254740993.5||"), rt.V.float(9007199254740994)]));
      rt.frameLine(92);
      print(rt.showArgs([rt.V.str("F|18014398509481985.0||"), rt.V.float(18014398509481984)]));
      rt.frameLine(93);
      print(rt.showArgs([rt.V.str("F|18014398509481983.0||"), rt.V.float(18014398509481984)]));
      rt.frameLine(94);
      print(rt.showArgs([rt.V.str("F|4503599627370497.0||"), rt.V.float(4503599627370497)]));
      rt.frameLine(95);
      print(rt.showArgs([rt.V.str("F|9223372036854775807.0||"), rt.V.float(9223372036854776000)]));
      rt.frameLine(96);
      print(rt.showArgs([rt.V.str("F|1e23||"), rt.V.float(1e+23)]));
      rt.frameLine(97);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
