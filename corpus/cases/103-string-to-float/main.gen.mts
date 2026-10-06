// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("g1 "), rt.toInt(rt.method(rt.V.str("9007199254740993.0"), "to_float", [])), rt.V.str(" | "), rt.toInt(rt.toFloat(rt.V.str("9007199254740993.0")))]));
    print(rt.showArgs([rt.V.str("g2 "), rt.toInt(rt.ops.mul(rt.method(rt.V.str("0.0000001234567890123456789"), "to_float", []), rt.V.float(1e+25))), rt.V.str(" | "), rt.toInt(rt.ops.mul(rt.method(rt.V.str("1.000000000000000083266726846886739642044414197265625"), "to_float", []), rt.V.float(1000000000000000000)))]));
    print(rt.showArgs([rt.V.str("g3 "), rt.method(rt.V.str("1_000_000.25"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("1_000_000.25"), "is_valid_float", [])]));
    print(rt.showArgs([rt.V.str("g4 "), rt.method(rt.V.str(" 1.5 "), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str(" 1.5 "), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1e5 "), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1e5 "), "to_float", [])]));
    print(rt.showArgs([rt.V.str("g5 "), rt.method(rt.V.str(".5"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("5."), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1e"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1e+"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1e-2"), "is_valid_float", [])]));
    print(rt.showArgs([rt.V.str("g6 "), rt.method(rt.V.str("+-1"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("0x10"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1.5abc"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str(".e5"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("inf"), "is_valid_float", [])]));
    print(rt.showArgs([rt.V.str("g7 "), rt.method(rt.V.str("1.2.3.4"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1.2.3.4"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("01.50"), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("1 E5"), "is_valid_float", [])]));
    print(rt.showArgs([rt.V.str("g8 "), rt.method(rt.V.str("  -2.5x"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("-.5"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("+5.5"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("abc"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str(""), "to_float", [])]));
    print(rt.showArgs([rt.V.str("g9 "), rt.method(rt.V.str(""), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("."), "is_valid_float", []), rt.V.str(" | "), rt.method(rt.V.str("0.999999999999999999999"), "is_valid_float", []), rt.V.str(" | "), rt.toInt(rt.method(rt.V.str("0.999999999999999999999"), "to_float", []))]));
    print(rt.showArgs([rt.V.str("g10 "), rt.method(rt.V.str("nan"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("inf"), "to_float", []), rt.V.str(" | "), rt.method(rt.V.str("1 2"), "to_float", []), rt.V.str(" | "), rt.toInt(rt.ops.mul(rt.toFloat(rt.V.str("0.0000001234567890123456789")), rt.V.float(1e+25)))]));
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
