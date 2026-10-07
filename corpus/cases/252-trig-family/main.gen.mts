// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

export class Main extends SceneTree {
  row(tag: rt.Variant, x: rt.Variant): void {
    tag = rt.paramSlot(tag, "String", 1, "row", this);
    print(rt.showArgs([tag, rt.V.str("|"), x, rt.V.str("|"), rt.typeOf(x)]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.row(rt.V.str("z01"), rt.gSin(rt.V.int(0)));
    this.row(rt.V.str("z02"), rt.gSin(rt.V.int(1)));
    this.row(rt.V.str("z03"), rt.gSin(rt.V.int((-1))));
    this.row(rt.V.str("z04"), rt.gSin(rt.V.float(0.5)));
    this.row(rt.V.str("z05"), rt.gSin(rt.V.float((-0.5))));
    this.row(rt.V.str("z06"), rt.gSin(rt.V.int(10)));
    this.row(rt.V.str("z07"), rt.gSin(PI));
    this.row(rt.V.str("z08"), rt.gSin(rt.ops.div(PI, rt.V.float(2))));
    this.row(rt.V.str("z09"), rt.gSin(rt.V.float(1e-9)));
    this.row(rt.V.str("z10"), rt.gSin(rt.V.float(0.9999999999)));
    this.row(rt.V.str("z11"), rt.gSin(rt.V.float(1000000)));
    this.row(rt.V.str("z12"), rt.gSin(INF));
    this.row(rt.V.str("z13"), rt.gSin(rt.ops.neg(INF)));
    this.row(rt.V.str("z14"), rt.gSin(NAN));
    this.row(rt.V.str("z15"), rt.gCos(rt.V.int(0)));
    this.row(rt.V.str("z16"), rt.gCos(rt.V.float(100000)));
    this.row(rt.V.str("z17"), rt.gCos(rt.V.float((-0))));
    this.row(rt.V.str("z18"), rt.gTan(rt.V.int(0)));
    this.row(rt.V.str("z19"), rt.gTan(rt.V.float(1e+300)));
    this.row(rt.V.str("z20"), rt.gTan(rt.V.float(1000000000)));
    this.row(rt.V.str("z21"), rt.gAsin(rt.V.float(0.5)));
    this.row(rt.V.str("z22"), rt.gAsin(rt.V.int(2)));
    this.row(rt.V.str("z23"), rt.gAsin(rt.V.int((-2))));
    this.row(rt.V.str("z24"), rt.gAsin(rt.V.float(1.0000000001)));
    this.row(rt.V.str("z25"), rt.gAcos(rt.V.int(2)));
    this.row(rt.V.str("z26"), rt.gAcos(rt.V.int((-2))));
    this.row(rt.V.str("z27"), rt.gAcos(rt.V.float((-1.0000000001))));
    this.row(rt.V.str("z28"), rt.gAtan(rt.V.int(1)));
    this.row(rt.V.str("z29"), rt.gAtan(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z30"), rt.gAtan2(rt.V.int(1), rt.V.int(2)));
    this.row(rt.V.str("z31"), rt.gAtan2(rt.V.int(1), rt.V.int((-1))));
    this.row(rt.V.str("z32"), rt.gAtan2(rt.V.int((-1)), rt.V.int((-1))));
    this.row(rt.V.str("z33"), rt.gAtan2(rt.V.int(0), rt.V.int(0)));
    this.row(rt.V.str("z34"), rt.gAtan2(rt.V.float(0.5), rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z35"), rt.gSinh(rt.V.int(0)));
    this.row(rt.V.str("z36"), rt.gSinh(rt.V.int(1)));
    this.row(rt.V.str("z37"), rt.gCosh(rt.V.int(0)));
    this.row(rt.V.str("z38"), rt.gCosh(rt.V.int(100)));
    this.row(rt.V.str("z39"), rt.gCosh(rt.V.float(1000000)));
    this.row(rt.V.str("z40"), rt.gTanh(rt.V.int(1)));
    this.row(rt.V.str("z41"), rt.gTanh(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z42"), rt.gAsinh(rt.V.float(0.5)));
    this.row(rt.V.str("z43"), rt.gAsinh(rt.V.int((-2))));
    this.row(rt.V.str("z44"), rt.gAcosh(rt.V.float(0.5)));
    this.row(rt.V.str("z45"), rt.gAcosh(rt.V.int((-2))));
    this.row(rt.V.str("z46"), rt.gAcosh(rt.V.int(2)));
    this.row(rt.V.str("z47"), rt.gAcosh(rt.V.float(1000000000000000000)));
    this.row(rt.V.str("z48"), rt.gAtanh(rt.V.float(0.5)));
    this.row(rt.V.str("z49"), rt.gAtanh(rt.V.int(2)));
    this.row(rt.V.str("z50"), rt.gAtanh(rt.V.int((-2))));
    let f = rt.globalCallable("acosh");
    print(rt.showArgs([rt.V.str("z51|"), rt.typeOf(f), rt.V.str("|"), f, rt.V.str("|"), rt.method(f, "get_method", []), rt.V.str("|"), rt.method(f, "get_argument_count", [])]));
    let g = rt.globalCallable("is_instance_of");
    print(rt.showArgs([rt.V.str("z52|"), rt.typeOf(g), rt.V.str("|"), g, rt.V.str("|"), rt.method(g, "get_method", []), rt.V.str("|"), rt.method(g, "get_argument_count", [])]));
    let h = rt.globalCallable("print_debug");
    print(rt.showArgs([rt.V.str("z53|"), rt.typeOf(h), rt.V.str("|"), h, rt.V.str("|"), rt.method(h, "get_method", []), rt.V.str("|"), rt.method(h, "get_argument_count", [])]));
    print(rt.showArgs([rt.V.str("z54|"), rt.variantHash([rt.globalCallable("acosh")]), rt.V.str("|"), rt.variantHash([rt.V.str("acosh")]), rt.V.str("|"), rt.ops.eq(rt.globalCallable("acosh"), rt.globalCallable("acosh")), rt.V.str("|"), rt.ops.eq(rt.globalCallable("acosh"), rt.globalCallable("atan"))]));
    this.quit();
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
rt.registerMethodArities(__gd_d_Main, { "row": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
