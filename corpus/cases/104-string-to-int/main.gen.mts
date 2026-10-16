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
      let sn = rt.toStringNameSlot(rt.V.stringName("ff"));
      rt.frameLine(5);
      let sn2 = rt.toStringNameSlot(rt.V.stringName("42"));
      rt.frameLine(6);
      let sn3 = rt.toStringNameSlot(rt.V.stringName("0x10"));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("n1 "), rt.method(rt.V.str("42"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-42"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("+42"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str(" 42 "), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("42abc"), "to_int", [])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("n2 "), rt.method(rt.V.str("0x10"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1_000"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1.5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1e5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("abc"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str(""), "to_int", [])]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("n3 "), rt.method(rt.V.str("9223372036854775807"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("9223372036854775808"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-9223372036854775809"), "to_int", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("n4 "), rt.method(rt.V.str("-0x10"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("+ff"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("f f"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0b101"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("x1f"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1x2"), "to_int", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("n5 "), rt.method(rt.V.str("42"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("+42"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("007"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("9223372036854775808"), "is_valid_int", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("n6 "), rt.method(rt.V.str(" 42 "), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("0x10"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("1_000"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("1.5"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str(""), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("-"), "is_valid_int", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("n7 "), rt.method(rt.V.str("ff"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("FF"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0x10"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1f"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("abc"), "hex_to_int", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("n8 "), rt.method(rt.V.str("-ff"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1e5"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0X1f"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("ff00"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0b101"), "hex_to_int", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("n10 "), rt.method(rt.V.str("ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("0x10"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("-ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("1e5"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("zz"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str(""), "is_valid_hex_number", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("n11 "), rt.method(rt.V.str("0x10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("-ff"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("ff"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("0X1f"), "is_valid_hex_number", [rt.V.bool(true)])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("n12 "), rt.toInt(rt.V.str("1e5")), rt.V.str(" | "), rt.method(rt.V.str("1e5"), "to_int", []), rt.V.str(" | "), rt.toInt(rt.V.str("0b101")), rt.V.str(" | "), rt.method(rt.V.str("0b101"), "to_int", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("n13 "), rt.method(rt.V.str("a-5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("a--5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-a-2"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("+ -3"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("5-3"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1--2"), "to_int", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("n14 "), rt.method(rt.V.str("--5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("---5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("+-5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-+5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("- 5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-- 5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("--1.9"), "to_int", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("n15 "), rt.method(rt.V.str(".-5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("x.5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-1.5x2"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1.5.6"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1 .5"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("1.-5"), "to_int", [])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("n16 "), rt.method(rt.V.str("9500000000000000009"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("9999999999999999991"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("9223372036854775811"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("9223372036854775801"), "to_int", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("n17 "), rt.method(rt.V.str("0000000000000000000042"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("9223372036854775808"), "to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-9223372036854775808"), "to_int", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("n18 "), rt.method(rt.V.str("7fffffffffffffff"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-0x8000000000000000"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0x0"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0x1f"), "hex_to_int", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("n19 "), rt.method(rt.V.str("-0x7fffffffffffffff"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("0"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-0"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-0x10"), "hex_to_int", []), rt.V.str(" | "), rt.method(rt.V.str("-0x1f"), "hex_to_int", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("n20 "), rt.method(rt.V.str("+ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("+1"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("--ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("++ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str(" ff"), "is_valid_hex_number", []), rt.V.str(" | "), rt.method(rt.V.str("-1.5"), "is_valid_hex_number", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("n21 "), rt.method(rt.V.str("-0x10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("+0x10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("-0X10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("+-0x10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str(" 0x10"), "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(rt.V.str("0x0"), "is_valid_hex_number", [rt.V.bool(true)])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("n22 "), rt.method(rt.V.str("+-5"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("--5"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("+ 5"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("00"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("1 .5"), "is_valid_int", []), rt.V.str(" | "), rt.method(rt.V.str("x-5"), "is_valid_int", [])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("n23 "), rt.toInt(rt.V.str("a-5")), rt.V.str(" | "), rt.toInt(rt.V.str("9223372036854775808")), rt.V.str(" | "), rt.toInt(rt.V.str("1.9")), rt.V.str(" | "), rt.toInt(rt.V.str("ffffffffffffffff")), rt.V.str(" | "), rt.toInt(rt.V.str("--1.9")), rt.V.str(" | "), rt.toInt(rt.V.str("9500000000000000009"))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("n24 "), rt.method(sn, "hex_to_int", []), rt.V.str(" | "), rt.method(sn2, "to_int", []), rt.V.str(" | "), rt.method(sn2, "is_valid_int", []), rt.V.str(" | "), rt.method(sn3, "is_valid_hex_number", [rt.V.bool(true)]), rt.V.str(" | "), rt.method(sn2, "is_valid_hex_number", [])]));
      rt.frameLine(30);
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
