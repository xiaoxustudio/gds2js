// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.gRidFromInt64(rt.V.int(5));
    let b = rt.gRidFromInt64(rt.V.int(0));
    print(rt.showArgs([rt.V.str("r01|"), rt.typeOf(a)]));
    print(rt.showArgs([rt.V.str("r02|"), a]));
    print(rt.showArgs([rt.V.str("r03|"), b]));
    print(rt.showArgs([rt.V.str("r04|"), rt.strBuiltin([a])]));
    print(rt.showArgs([rt.V.str("r05|"), rt.V.str(rt.varToStr(a))]));
    print(rt.showArgs([rt.V.str("r06|"), rt.formatOf(rt.V.str("%s"), a)]));
    print(rt.showArgs([rt.V.str("r07|"), rt.gRidFromInt64(rt.V.int((-1)))]));
    print(rt.showArgs([rt.V.str("r08|"), rt.gRidFromInt64(rt.V.int(4294967296))]));
    print(rt.showArgs([rt.V.str("r09|"), rt.method(rt.gRidFromInt64(rt.V.int(4294967296)), "get_id", [])]));
    print(rt.showArgs([rt.V.str("r10|"), rt.gRidFromInt64(rt.V.int(9223372036854775807n))]));
    print(rt.showArgs([rt.V.str("r11|"), rt.gRidFromInt64(rt.ops.neg(rt.V.int(9223372036854775808n)))]));
    print(rt.showArgs([rt.V.str("r12|"), rt.method(a, "get_id", [])]));
    print(rt.showArgs([rt.V.str("r13|"), rt.method(b, "get_id", [])]));
    print(rt.showArgs([rt.V.str("r14|"), rt.gRidFromInt64(rt.V.float(1.7))]));
    print(rt.showArgs([rt.V.str("r15|"), rt.gRidFromInt64(rt.V.bool(true))]));
    print(rt.showArgs([rt.V.str("r16|"), rt.ops.eq(a, rt.gRidFromInt64(rt.V.int(5)))]));
    print(rt.showArgs([rt.V.str("r17|"), rt.ops.eq(a, rt.gRidFromInt64(rt.V.int(6)))]));
    print(rt.showArgs([rt.V.str("r18|"), rt.ops.neq(a, rt.gRidFromInt64(rt.V.int(6)))]));
    print(rt.showArgs([rt.V.str("r19|"), rt.ops.eq(a, a)]));
    print(rt.showArgs([rt.V.str("r20|"), rt.ops.lt(rt.gRidFromInt64(rt.V.int(1)), rt.gRidFromInt64(rt.V.int(2)))]));
    print(rt.showArgs([rt.V.str("r21|"), rt.ops.lte(rt.gRidFromInt64(rt.V.int(1)), rt.gRidFromInt64(rt.V.int(1)))]));
    print(rt.showArgs([rt.V.str("r22|"), rt.ops.gt(rt.gRidFromInt64(rt.V.int(2)), rt.gRidFromInt64(rt.V.int(1)))]));
    print(rt.showArgs([rt.V.str("r23|"), rt.ops.lt(rt.gRidFromInt64(rt.V.int((-3))), rt.gRidFromInt64(rt.V.int(0)))]));
    print(rt.showArgs([rt.V.str("r24|"), rt.ops.eq(a, rt.V.nil())]));
    print(rt.showArgs([rt.V.str("r25|"), rt.ops.eq(b, rt.gRidFromInt64(rt.V.int(0)))]));
    print(rt.showArgs([rt.V.str("r26|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(0))])]));
    print(rt.showArgs([rt.V.str("r27|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(1))])]));
    print(rt.showArgs([rt.V.str("r28|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(5))])]));
    print(rt.showArgs([rt.V.str("r29|"), rt.variantHash([rt.gRidFromInt64(rt.V.int((-1)))])]));
    print(rt.showArgs([rt.V.str("r30|"), rt.variantHash([rt.gRidFromInt64(rt.V.int(13241))])]));
    print(rt.showArgs([rt.V.str("r31|"), rt.V.array(rt.GArray.of([a, b]))]));
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, a, rt.V.int(1));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, b, rt.V.int(2));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.V.str("r32|"), d]));
    print(rt.showArgs([rt.V.str("r33|"), rt.method(d, "has", [rt.gRidFromInt64(rt.V.int(5))])]));
    print(rt.showArgs([rt.V.str("r34|"), rt.method(d, "has", [rt.gRidFromInt64(rt.V.int(6))])]));
    print(rt.showArgs([rt.V.str("r35|"), rt.wrapValue(rt.index(d, a))]));
    print(rt.showArgs([rt.V.str("r36|"), rt.gIsInstanceValid(a)]));
    print(rt.showArgs([rt.V.str("r37|"), rt.gRidAllocateId()]));
    print(rt.showArgs([rt.V.str("r38|"), rt.gRidAllocateId()]));
    print(rt.showArgs([rt.V.str("r39|"), rt.typeOf(rt.gRidAllocateId())]));
    print(rt.showArgs([rt.V.str("r40|"), rt.ops.eq(rt.strBuiltin([b]), rt.V.str("RID(0)"))]));
    print(rt.showArgs([rt.V.str("r41|"), rt.ops.eq(rt.strBuiltin([rt.gRidFromInt64(rt.V.int((-1)))]), rt.V.str("RID(-1)"))]));
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
