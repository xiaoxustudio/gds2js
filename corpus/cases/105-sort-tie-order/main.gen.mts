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
      let vall012 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
      rt.frameLine(5);
      rt.method(vall012, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(5);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(6);
      let oall012 = rt.V.str("");
      rt.frameLine(7);
      for (let q of rt.iter(vall012)) {
        rt.frameLine(8);
        oall012 = rt.ops.add(oall012, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("all012 "), oall012]));
      rt.frameLine(10);
      let vall016 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
      rt.frameLine(11);
      rt.method(vall016, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(11);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(12);
      let oall016 = rt.V.str("");
      rt.frameLine(13);
      for (let q of rt.iter(vall016)) {
        rt.frameLine(14);
        oall016 = rt.ops.add(oall016, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("all016 "), oall016]));
      rt.frameLine(16);
      let valt212 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
      rt.frameLine(17);
      rt.method(valt212, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(17);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(18);
      let oalt212 = rt.V.str("");
      rt.frameLine(19);
      for (let q of rt.iter(valt212)) {
        rt.frameLine(20);
        oalt212 = rt.ops.add(oalt212, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("alt212 "), oalt212]));
      rt.frameLine(22);
      let valt216 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
      rt.frameLine(23);
      rt.method(valt216, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(23);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(24);
      let oalt216 = rt.V.str("");
      rt.frameLine(25);
      for (let q of rt.iter(valt216)) {
        rt.frameLine(26);
        oalt216 = rt.ops.add(oalt216, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("alt216 "), oalt216]));
      rt.frameLine(28);
      let vcyc312 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(11)]))]));
      rt.frameLine(29);
      rt.method(vcyc312, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(29);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(30);
      let ocyc312 = rt.V.str("");
      rt.frameLine(31);
      for (let q of rt.iter(vcyc312)) {
        rt.frameLine(32);
        ocyc312 = rt.ops.add(ocyc312, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("cyc312 "), ocyc312]));
      rt.frameLine(34);
      let vcyc316 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
      rt.frameLine(35);
      rt.method(vcyc316, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(35);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(36);
      let ocyc316 = rt.V.str("");
      rt.frameLine(37);
      for (let q of rt.iter(vcyc316)) {
        rt.frameLine(38);
        ocyc316 = rt.ops.add(ocyc316, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("cyc316 "), ocyc316]));
      rt.frameLine(40);
      let vlead212 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
      rt.frameLine(41);
      rt.method(vlead212, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(41);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(42);
      let olead212 = rt.V.str("");
      rt.frameLine(43);
      for (let q of rt.iter(vlead212)) {
        rt.frameLine(44);
        olead212 = rt.ops.add(olead212, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("lead212 "), olead212]));
      rt.frameLine(46);
      let vlead216 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
      rt.frameLine(47);
      rt.method(vlead216, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(47);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(48);
      let olead216 = rt.V.str("");
      rt.frameLine(49);
      for (let q of rt.iter(vlead216)) {
        rt.frameLine(50);
        olead216 = rt.ops.add(olead216, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("lead216 "), olead216]));
      rt.frameLine(52);
      let vmul5r312 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
      rt.frameLine(53);
      rt.method(vmul5r312, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(53);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(54);
      let omul5r312 = rt.V.str("");
      rt.frameLine(55);
      for (let q of rt.iter(vmul5r312)) {
        rt.frameLine(56);
        omul5r312 = rt.ops.add(omul5r312, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(57);
      print(rt.showArgs([rt.V.str("mul5r312 "), omul5r312]));
      rt.frameLine(58);
      let vmul5r316 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
      rt.frameLine(59);
      rt.method(vmul5r316, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(59);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(60);
      let omul5r316 = rt.V.str("");
      rt.frameLine(61);
      for (let q of rt.iter(vmul5r316)) {
        rt.frameLine(62);
        omul5r316 = rt.ops.add(omul5r316, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(63);
      print(rt.showArgs([rt.V.str("mul5r316 "), omul5r316]));
      rt.frameLine(64);
      let vdesc12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
      rt.frameLine(65);
      rt.method(vdesc12, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(65);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(66);
      let odesc12 = rt.V.str("");
      rt.frameLine(67);
      for (let q of rt.iter(vdesc12)) {
        rt.frameLine(68);
        odesc12 = rt.ops.add(odesc12, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(69);
      print(rt.showArgs([rt.V.str("desc12 "), odesc12]));
      rt.frameLine(70);
      let vdesc16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(16), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(15), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(14), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(13), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
      rt.frameLine(71);
      rt.method(vdesc16, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(71);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(72);
      let odesc16 = rt.V.str("");
      rt.frameLine(73);
      for (let q of rt.iter(vdesc16)) {
        rt.frameLine(74);
        odesc16 = rt.ops.add(odesc16, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(75);
      print(rt.showArgs([rt.V.str("desc16 "), odesc16]));
      rt.frameLine(76);
      let vtwoHalf12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)]))]));
      rt.frameLine(77);
      rt.method(vtwoHalf12, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(77);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(78);
      let otwoHalf12 = rt.V.str("");
      rt.frameLine(79);
      for (let q of rt.iter(vtwoHalf12)) {
        rt.frameLine(80);
        otwoHalf12 = rt.ops.add(otwoHalf12, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(81);
      print(rt.showArgs([rt.V.str("twoHalf12 "), otwoHalf12]));
      rt.frameLine(82);
      let vtwoHalf16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(15)]))]));
      rt.frameLine(83);
      rt.method(vtwoHalf16, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(83);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(84);
      let otwoHalf16 = rt.V.str("");
      rt.frameLine(85);
      for (let q of rt.iter(vtwoHalf16)) {
        rt.frameLine(86);
        otwoHalf16 = rt.ops.add(otwoHalf16, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(87);
      print(rt.showArgs([rt.V.str("twoHalf16 "), otwoHalf16]));
      rt.frameLine(88);
      let vhalfDup12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)]))]));
      rt.frameLine(89);
      rt.method(vhalfDup12, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(89);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(90);
      let ohalfDup12 = rt.V.str("");
      rt.frameLine(91);
      for (let q of rt.iter(vhalfDup12)) {
        rt.frameLine(92);
        ohalfDup12 = rt.ops.add(ohalfDup12, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(93);
      print(rt.showArgs([rt.V.str("halfDup12 "), ohalfDup12]));
      rt.frameLine(94);
      let vhalfDup16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(15)]))]));
      rt.frameLine(95);
      rt.method(vhalfDup16, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(95);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(96);
      let ohalfDup16 = rt.V.str("");
      rt.frameLine(97);
      for (let q of rt.iter(vhalfDup16)) {
        rt.frameLine(98);
        ohalfDup16 = rt.ops.add(ohalfDup16, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(99);
      print(rt.showArgs([rt.V.str("halfDup16 "), ohalfDup16]));
      rt.frameLine(100);
      let vzigzag12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)]))]));
      rt.frameLine(101);
      rt.method(vzigzag12, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(101);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(102);
      let ozigzag12 = rt.V.str("");
      rt.frameLine(103);
      for (let q of rt.iter(vzigzag12)) {
        rt.frameLine(104);
        ozigzag12 = rt.ops.add(ozigzag12, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(105);
      print(rt.showArgs([rt.V.str("zigzag12 "), ozigzag12]));
      rt.frameLine(106);
      let vzigzag16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(15)]))]));
      rt.frameLine(107);
      rt.method(vzigzag16, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(107);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(108);
      let ozigzag16 = rt.V.str("");
      rt.frameLine(109);
      for (let q of rt.iter(vzigzag16)) {
        rt.frameLine(110);
        ozigzag16 = rt.ops.add(ozigzag16, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(111);
      print(rt.showArgs([rt.V.str("zigzag16 "), ozigzag16]));
      rt.frameLine(112);
      let vdistinct12 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(11)]))]));
      rt.frameLine(113);
      rt.method(vdistinct12, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(113);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(114);
      let odistinct12 = rt.V.str("");
      rt.frameLine(115);
      for (let q of rt.iter(vdistinct12)) {
        rt.frameLine(116);
        odistinct12 = rt.ops.add(odistinct12, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(117);
      print(rt.showArgs([rt.V.str("distinct12 "), odistinct12]));
      rt.frameLine(118);
      let vdistinct16 = rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(0), rt.V.int(0)])), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(1)])), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(2)])), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(3)])), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.int(4)])), rt.V.array(rt.GArray.of([rt.V.int(5), rt.V.int(5)])), rt.V.array(rt.GArray.of([rt.V.int(6), rt.V.int(6)])), rt.V.array(rt.GArray.of([rt.V.int(7), rt.V.int(7)])), rt.V.array(rt.GArray.of([rt.V.int(8), rt.V.int(8)])), rt.V.array(rt.GArray.of([rt.V.int(9), rt.V.int(9)])), rt.V.array(rt.GArray.of([rt.V.int(10), rt.V.int(10)])), rt.V.array(rt.GArray.of([rt.V.int(11), rt.V.int(11)])), rt.V.array(rt.GArray.of([rt.V.int(12), rt.V.int(12)])), rt.V.array(rt.GArray.of([rt.V.int(13), rt.V.int(13)])), rt.V.array(rt.GArray.of([rt.V.int(14), rt.V.int(14)])), rt.V.array(rt.GArray.of([rt.V.int(15), rt.V.int(15)]))]));
      rt.frameLine(119);
      rt.method(vdistinct16, "sort_custom", [rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          const y = __a[1] as rt.Variant;
          rt.frameLine(119);
          return rt.ops.lt(rt.wrapValue(rt.index(x, rt.V.int(0))), rt.wrapValue(rt.index(y, rt.V.int(0))));
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 2)]);
      rt.frameLine(120);
      let odistinct16 = rt.V.str("");
      rt.frameLine(121);
      for (let q of rt.iter(vdistinct16)) {
        rt.frameLine(122);
        odistinct16 = rt.ops.add(odistinct16, rt.ops.add(rt.strBuiltin([rt.wrapValue(rt.index(q, rt.V.int(1)))]), rt.V.str(",")));
      }
      rt.frameLine(123);
      print(rt.showArgs([rt.V.str("distinct16 "), odistinct16]));
      rt.frameLine(124);
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
