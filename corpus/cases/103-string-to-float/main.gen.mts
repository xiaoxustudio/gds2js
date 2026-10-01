// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
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
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
