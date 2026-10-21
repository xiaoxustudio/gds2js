// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

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

  row(tag: rt.Variant, x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "row");
    try {
      tag = rt.paramSlot(tag, "String", 1, "row", this);
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), x, rt.V.str("|"), rt.typeOf(x)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      this.row(rt.V.str("z01"), rt.gSin(rt.V.int(0)));
      rt.frameLine(8);
      this.row(rt.V.str("z02"), rt.gSin(rt.V.int(1)));
      rt.frameLine(9);
      this.row(rt.V.str("z03"), rt.gSin(rt.V.int((-1))));
      rt.frameLine(10);
      this.row(rt.V.str("z04"), rt.gSin(rt.V.float(0.5)));
      rt.frameLine(11);
      this.row(rt.V.str("z05"), rt.gSin(rt.V.float((-0.5))));
      rt.frameLine(12);
      this.row(rt.V.str("z06"), rt.gSin(rt.V.int(10)));
      rt.frameLine(13);
      this.row(rt.V.str("z07"), rt.gSin(PI));
      rt.frameLine(14);
      this.row(rt.V.str("z08"), rt.gSin(rt.ops.div(PI, rt.V.float(2))));
      rt.frameLine(15);
      this.row(rt.V.str("z09"), rt.gSin(rt.V.float(1e-9)));
      rt.frameLine(16);
      this.row(rt.V.str("z10"), rt.gSin(rt.V.float(0.9999999999)));
      rt.frameLine(17);
      this.row(rt.V.str("z11"), rt.gSin(rt.V.float(1000000)));
      rt.frameLine(18);
      this.row(rt.V.str("z12"), rt.gSin(INF));
      rt.frameLine(19);
      this.row(rt.V.str("z13"), rt.gSin(rt.ops.neg(INF)));
      rt.frameLine(20);
      this.row(rt.V.str("z14"), rt.gSin(NAN));
      rt.frameLine(21);
      this.row(rt.V.str("z15"), rt.gCos(rt.V.int(0)));
      rt.frameLine(22);
      this.row(rt.V.str("z16"), rt.gCos(rt.V.float(100000)));
      rt.frameLine(23);
      this.row(rt.V.str("z17"), rt.gCos(rt.V.float((-0))));
      rt.frameLine(24);
      this.row(rt.V.str("z18"), rt.gTan(rt.V.int(0)));
      rt.frameLine(25);
      this.row(rt.V.str("z19"), rt.gTan(rt.V.float(1e+300)));
      rt.frameLine(26);
      this.row(rt.V.str("z20"), rt.gTan(rt.V.float(1000000000)));
      rt.frameLine(27);
      this.row(rt.V.str("z21"), rt.gAsin(rt.V.float(0.5)));
      rt.frameLine(28);
      this.row(rt.V.str("z22"), rt.gAsin(rt.V.int(2)));
      rt.frameLine(29);
      this.row(rt.V.str("z23"), rt.gAsin(rt.V.int((-2))));
      rt.frameLine(30);
      this.row(rt.V.str("z24"), rt.gAsin(rt.V.float(1.0000000001)));
      rt.frameLine(31);
      this.row(rt.V.str("z25"), rt.gAcos(rt.V.int(2)));
      rt.frameLine(32);
      this.row(rt.V.str("z26"), rt.gAcos(rt.V.int((-2))));
      rt.frameLine(33);
      this.row(rt.V.str("z27"), rt.gAcos(rt.V.float((-1.0000000001))));
      rt.frameLine(34);
      this.row(rt.V.str("z28"), rt.gAtan(rt.V.int(1)));
      rt.frameLine(35);
      this.row(rt.V.str("z29"), rt.gAtan(rt.V.float(1000000000000000000)));
      rt.frameLine(36);
      this.row(rt.V.str("z30"), rt.gAtan2(rt.V.int(1), rt.V.int(2)));
      rt.frameLine(37);
      this.row(rt.V.str("z31"), rt.gAtan2(rt.V.int(1), rt.V.int((-1))));
      rt.frameLine(38);
      this.row(rt.V.str("z32"), rt.gAtan2(rt.V.int((-1)), rt.V.int((-1))));
      rt.frameLine(39);
      this.row(rt.V.str("z33"), rt.gAtan2(rt.V.int(0), rt.V.int(0)));
      rt.frameLine(40);
      this.row(rt.V.str("z34"), rt.gAtan2(rt.V.float(0.5), rt.V.float(1000000000000000000)));
      rt.frameLine(41);
      this.row(rt.V.str("z35"), rt.gSinh(rt.V.int(0)));
      rt.frameLine(42);
      this.row(rt.V.str("z36"), rt.gSinh(rt.V.int(1)));
      rt.frameLine(43);
      this.row(rt.V.str("z37"), rt.gCosh(rt.V.int(0)));
      rt.frameLine(44);
      this.row(rt.V.str("z38"), rt.gCosh(rt.V.int(100)));
      rt.frameLine(45);
      this.row(rt.V.str("z39"), rt.gCosh(rt.V.float(1000000)));
      rt.frameLine(46);
      this.row(rt.V.str("z40"), rt.gTanh(rt.V.int(1)));
      rt.frameLine(47);
      this.row(rt.V.str("z41"), rt.gTanh(rt.V.float(1000000000000000000)));
      rt.frameLine(48);
      this.row(rt.V.str("z42"), rt.gAsinh(rt.V.float(0.5)));
      rt.frameLine(49);
      this.row(rt.V.str("z43"), rt.gAsinh(rt.V.int((-2))));
      rt.frameLine(50);
      this.row(rt.V.str("z44"), rt.gAcosh(rt.V.float(0.5)));
      rt.frameLine(51);
      this.row(rt.V.str("z45"), rt.gAcosh(rt.V.int((-2))));
      rt.frameLine(52);
      this.row(rt.V.str("z46"), rt.gAcosh(rt.V.int(2)));
      rt.frameLine(53);
      this.row(rt.V.str("z47"), rt.gAcosh(rt.V.float(1000000000000000000)));
      rt.frameLine(54);
      this.row(rt.V.str("z48"), rt.gAtanh(rt.V.float(0.5)));
      rt.frameLine(55);
      this.row(rt.V.str("z49"), rt.gAtanh(rt.V.int(2)));
      rt.frameLine(56);
      this.row(rt.V.str("z50"), rt.gAtanh(rt.V.int((-2))));
      rt.frameLine(57);
      let f = rt.globalCallable("acosh");
      rt.frameLine(58);
      print(rt.showArgs([rt.V.str("z51|"), rt.typeOf(f), rt.V.str("|"), f, rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", [])]));
      rt.frameLine(59);
      let g = rt.globalCallable("is_instance_of");
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("z52|"), rt.typeOf(g), rt.V.str("|"), g, rt.V.str("|"), rt.method(g, "get_method", []), rt.V.str("|"), rt.method(g, "get_argument_count", [])]));
      rt.frameLine(61);
      let h = rt.globalCallable("print_debug");
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("z53|"), rt.typeOf(h), rt.V.str("|"), h, rt.V.str("|"), rt.method(h, "get_method", []), rt.V.str("|"), rt.method(h, "get_argument_count", [])]));
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("z54|"), rt.variantHash([rt.globalCallable("acosh")]), rt.V.str("|"), rt.variantHash([rt.V.str("acosh")]), rt.V.str("|"), rt.ops.eq(rt.globalCallable("acosh"), rt.globalCallable("acosh")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("acosh"), rt.globalCallable("atan"))]));
      rt.frameLine(64);
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
      case "row": return rt.wrapValue(this.row(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "row": [2, 2], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "row": ["String", "Variant"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
