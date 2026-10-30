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
      let big = rt.V.int(9223372036854775807n);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("a|"), big, rt.V.str("|"), rt.ops.add(big, rt.V.int(1)), rt.V.str("|"), rt.ops.mul(big, rt.V.int(2))]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("b|"), rt.ops.sub(rt.ops.neg(rt.V.int(9223372036854775807n)), rt.V.int(1)), rt.V.str("|"), rt.ops.mul(rt.ops.sub(rt.ops.neg(rt.V.int(9223372036854775807n)), rt.V.int(1)), rt.V.int((-1)))]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("c|"), rt.ops.add(rt.V.int(9223372036854775807n), rt.V.int(9223372036854775807n))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("d|"), rt.ops.div(big, rt.V.int(3)), rt.V.str("|"), rt.ops.mod(big, rt.V.int(1000000007), false), rt.V.str("|"), rt.ops.shr(big, rt.V.int(1))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("e|"), rt.toFloat(big), rt.V.str("|"), rt.toInt(rt.toFloat(big))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("f|"), rt.method(rt.V.str("9223372036854775807"), "to_int", []), rt.V.str("|"), rt.method(rt.V.str("0x7FFFFFFFFFFFFFFF"), "hex_to_int", []), rt.V.str("|"), rt.method(rt.V.str("-9223372036854775808"), "to_int", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("g|"), rt.ops.shl(rt.V.int(1), rt.V.int(62)), rt.V.str("|"), rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.str("|"), rt.ops.sub(rt.ops.shl(rt.V.int(1), rt.V.int(63)), rt.V.int(1))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("h|"), rt.ops.eq(big, rt.ops.add(rt.V.int(9223372036854775806n), rt.V.int(1))), rt.V.str("|"), rt.ops.gt(big, rt.V.int(9223372036854775806n))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("i|"), rt.V.int(rt.fast.iDivC((-7), 2)), rt.V.str("|"), rt.V.int(rt.fast.iModC((-7), 2)), rt.V.str("|"), rt.V.int(rt.fast.iModC(7, (-2)))]));
      rt.frameLine(14);
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
