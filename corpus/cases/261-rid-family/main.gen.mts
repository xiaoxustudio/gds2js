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
      let a = rt.gRidFromInt64(rt.V.int(5));
      rt.frameLine(5);
      let b = rt.gRidFromInt64(rt.V.int(0));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("r01|"), rt.typeOf(a)]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("r02|"), a]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("r03|"), b]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("r04|"), rt.strBuiltin([a])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("r05|"), rt.V.str(rt.varToStr(a))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("r06|"), rt.formatOf(rt.V.str("%s"), a, false)]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("r07|"), rt.gRidFromInt64(rt.V.int((-1)))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("r08|"), rt.gRidFromInt64(rt.V.int(4294967296))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("r09|"), rt.method(rt.gRidFromInt64(rt.V.int(4294967296)), "get_id", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("r10|"), rt.gRidFromInt64(rt.V.int(9223372036854775807n))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("r11|"), rt.gRidFromInt64(rt.ops.neg(rt.V.int(9223372036854775808n)))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("r12|"), rt.method(a, "get_id", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("r13|"), rt.method(b, "get_id", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("r14|"), rt.gRidFromInt64(rt.V.float(1.7))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r15|"), rt.gRidFromInt64(rt.V.bool(true))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("r16|"), rt.ops.eq(a, rt.gRidFromInt64(rt.V.int(5)))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("r17|"), rt.ops.eq(a, rt.gRidFromInt64(rt.V.int(6)))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("r18|"), rt.ops.neq(a, rt.gRidFromInt64(rt.V.int(6)))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("r19|"), rt.ops.eq(a, a)]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("r20|"), rt.ops.lt(rt.gRidFromInt64(rt.V.int(1)), rt.gRidFromInt64(rt.V.int(2)))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("r21|"), rt.ops.lte(rt.gRidFromInt64(rt.V.int(1)), rt.gRidFromInt64(rt.V.int(1)))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("r22|"), rt.ops.gt(rt.gRidFromInt64(rt.V.int(2)), rt.gRidFromInt64(rt.V.int(1)))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("r23|"), rt.ops.lt(rt.gRidFromInt64(rt.V.int((-3))), rt.gRidFromInt64(rt.V.int(0)))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("r24|"), rt.ops.eq(a, rt.V.nil())]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("r25|"), rt.ops.eq(b, rt.gRidFromInt64(rt.V.int(0)))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("r26|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(0))])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("r27|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(1))])]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("r28|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(5))])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("r29|"), rt.variantHash([rt.gRidFromInt64(rt.V.int((-1)))])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("r30|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(13241))])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("r31|"), rt.V.array(rt.GArray.of([a, b]))]));
      rt.frameLine(37);
      let d = rt.dictOf([]);
      rt.frameLine(38);
      {
        const _nv = rt.writeIdx(d, a, rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(39);
      {
        const _nv = rt.writeIdx(d, b, rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("r32|"), d]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("r33|"), rt.method(d, "has", [rt.gRidFromInt64(rt.V.int(5))])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("r34|"), rt.method(d, "has", [rt.gRidFromInt64(rt.V.int(6))])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("r35|"), rt.wrapValue(rt.index(d, a))]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("r36|"), rt.gIsInstanceValid(a)]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("r37|"), rt.gRidAllocateId()]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("r38|"), rt.gRidAllocateId()]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("r39|"), rt.typeOf(rt.gRidAllocateId())]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("r40|"), rt.ops.eq(rt.strBuiltin([b]), rt.V.str("RID(0)"))]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("r41|"), rt.ops.eq(rt.strBuiltin([rt.gRidFromInt64(rt.V.int((-1)))]), rt.V.str("RID(-1)"))]));
      rt.frameLine(50);
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
