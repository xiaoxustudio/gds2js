// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);

export class Main extends SceneTree {
  row(tag: rt.Variant, x: rt.Variant): void {
    tag = rt.paramSlot(tag, "String", 1, "row", this);
    print(rt.showArgs([tag, rt.V.str("|"), x, rt.V.str("|"), rt.typeOf(x)]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.row(rt.V.str("z01"), rt.gAbsF(rt.V.int((-3))));
    this.row(rt.V.str("z02"), rt.gAbsF(rt.V.float((-3.5))));
    this.row(rt.V.str("z03"), rt.gAbsF(rt.V.int(0)));
    this.row(rt.V.str("z04"), rt.gAbsF(rt.V.float((-0))));
    this.row(rt.V.str("z05"), rt.gAbsF(rt.V.bool(true)));
    this.row(rt.V.str("z06"), rt.gAbsF(rt.ops.neg(rt.V.int(4611686018427387903n))));
    this.row(rt.V.str("z07"), rt.gAbsF(rt.ops.neg(INF)));
    this.row(rt.V.str("z08"), rt.gAbsI(rt.V.float(3.7)));
    this.row(rt.V.str("z09"), rt.gAbsI(rt.V.float((-3.7))));
    this.row(rt.V.str("z10"), rt.gAbsI(rt.V.bool(false)));
    this.row(rt.V.str("z11"), rt.gAbsI(rt.V.int((-1))));
    this.row(rt.V.str("z12"), rt.gAbsI(rt.ops.neg(rt.V.int(4611686018427387903n))));
    this.row(rt.V.str("z13"), rt.gAbsI(rt.V.int((-2147483648))));
    this.row(rt.V.str("z14"), rt.gAbsI(rt.V.int(2147483648)));
    let imin = rt.ops.sub(rt.ops.neg(rt.V.int(9223372036854775807n)), rt.V.int(1));
    this.row(rt.V.str("z15"), imin);
    this.row(rt.V.str("z16"), rt.gAbsI(imin));
    this.row(rt.V.str("z17"), rt.abs(imin));
    this.row(rt.V.str("z18"), rt.gAbsF(imin));
    this.row(rt.V.str("z19"), rt.gWrapAny(rt.V.float(3.5), rt.V.float(0), rt.V.float(2)));
    this.row(rt.V.str("z20"), rt.gWrapAny(rt.V.int(3), rt.V.int(0), rt.V.int(2)));
    this.row(rt.V.str("z21"), rt.gWrapAny(rt.V.float(3.5), rt.V.int(0), rt.V.int(2)));
    this.row(rt.V.str("z22"), rt.gWrapAny(rt.V.int((-1)), rt.V.int(0), rt.V.int(3)));
    this.row(rt.V.str("z23"), rt.gWrapAny(rt.V.float(1.5), rt.V.float(0), rt.V.float(1)));
    this.row(rt.V.str("z24"), rt.gWrapAny(rt.V.int(7), rt.V.int(0), rt.V.int((-5))));
    this.row(rt.V.str("z25"), rt.gWrapAny(rt.V.int((-1)), rt.V.int((-3)), rt.V.int(0)));
    this.row(rt.V.str("z26"), rt.gWrap(rt.V.float(1.5), rt.V.float((-3)), rt.V.float(0), false));
    print(rt.showArgs([rt.V.str("z27|"), rt.gIsSame(rt.V.int(1), rt.V.int(1)), rt.V.str("|"), rt.gIsSame(rt.V.int(1), rt.V.float(1)), rt.V.str("|"), rt.gIsSame(rt.V.int(1), rt.V.bool(true))]));
    let arr = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    let arr2 = rt.V.array(rt.GArray.of([rt.V.int(1)]));
    print(rt.showArgs([rt.V.str("z28|"), rt.gIsSame(arr, arr), rt.V.str("|"), rt.gIsSame(arr, arr2), rt.V.str("|"), rt.ops.eq(arr, arr2)]));
    print(rt.showArgs([rt.V.str("z29|"), rt.gIsSame(rt.V.str("a"), rt.V.str("a")), rt.V.str("|"), rt.gIsSame(rt.V.stringName("a"), rt.V.stringName("a")), rt.V.str("|"), rt.gIsSame(rt.V.nil(), rt.V.nil())]));
    print(rt.showArgs([rt.V.str("z30|"), rt.gIsSame(rt.V.float(0), rt.V.float((-0))), rt.V.str("|"), rt.gIsSame(INF, INF), rt.V.str("|"), rt.gIsSame(NAN, NAN)]));
    print(rt.showArgs([rt.V.str("z31|"), rt.gIsSame(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(1), rt.V.int(2)])), rt.V.str("|"), rt.gIsSame(rt.V.float(3), rt.V.int(3)), rt.V.str("|"), rt.gIsSame(rt.V.int(0), rt.V.float((-0)))]));
    let f = rt.globalCallable("abs");
    print(rt.showArgs([rt.V.str("z32|"), rt.gIsSame(f, rt.globalCallable("abs")), rt.V.str("|"), rt.gIsSame(rt.globalCallable("abs"), rt.globalCallable("abs")), rt.V.str("|"), rt.gIsSame(rt.globalCallable("str_to_var"), rt.globalCallable("str_to_var"))]));
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
