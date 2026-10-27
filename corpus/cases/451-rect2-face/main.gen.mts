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
      let a = rt.rect2New([]);
      rt.frameLine(5);
      let b = rt.rect2New([rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.vector2New([rt.V.int(3), rt.V.int(4)])]);
      rt.frameLine(6);
      let c = rt.rect2New([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("r01|"), rt.strBuiltin([a]), rt.V.str("|"), rt.strBuiltin([b]), rt.V.str("|"), rt.strBuiltin([c])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("r02|"), rt.wrapValue(rt.attribute(a, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "size")), rt.V.str("|"), rt.wrapValue(rt.attribute(a, "end"))]));
      rt.frameLine(9);
      let d = rt.rect2New([]);
      rt.frameLine(10);
      {
        const _nv = rt.writeProp(d, "position", rt.vector2New([rt.V.int(5), rt.V.int(6)]));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(11);
      {
        const _nv = rt.writeProp(d, "size", rt.vector2New([rt.V.int(7), rt.V.int(8)]));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("r03|"), rt.strBuiltin([d]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.attribute(d, "end"))])]));
      rt.frameLine(13);
      let e = rt.rect2New([rt.V.int(0), rt.V.int(0), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(14);
      let f = rt.rect2New([rt.V.int(2), rt.V.int(2), rt.V.int(4), rt.V.int(4)]);
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("r04|"), rt.ops.eq(e, rt.rect2New([rt.V.int(0), rt.V.int(0), rt.V.int(4), rt.V.int(4)])), rt.V.str("|"), rt.ops.eq(e, f), rt.V.str("|"), rt.ops.neq(e, f), rt.V.str("|"), rt.typeOf(e)]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("r05|"), rt.strBuiltin([rt.rect2New([rt.V.float(1.5), rt.V.float(2.25), rt.V.float((-3.5)), rt.V.int(4)])])]));
      rt.frameLine(17);
      let g = rt.rect2iNew([]);
      rt.frameLine(18);
      let h = rt.rect2iNew([rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.vector2iNew([rt.V.int(3), rt.V.int(4)])]);
      rt.frameLine(19);
      let i = rt.rect2iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("r06|"), rt.strBuiltin([g]), rt.V.str("|"), rt.strBuiltin([h]), rt.V.str("|"), rt.strBuiltin([i]), rt.V.str("|"), rt.typeOf(i)]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("r07|"), rt.strBuiltin([rt.rect2New([h])]), rt.V.str("|"), rt.strBuiltin([rt.rect2iNew([b])]), rt.V.str("|"), rt.strBuiltin([rt.rect2iNew([c])]), rt.V.str("|"), rt.strBuiltin([rt.rect2iNew([rt.V.float(1.5), rt.V.int(2), rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("r08|"), rt.wrapValue(rt.attribute(h, "position")), rt.V.str("|"), rt.wrapValue(rt.attribute(h, "size")), rt.V.str("|"), rt.wrapValue(rt.attribute(h, "end")), rt.V.str("|"), rt.ops.eq(h, i), rt.V.str("|"), rt.ops.neq(h, i)]));
      rt.frameLine(23);
      let j = rt.rect2(0, 0, 0, 0);
      rt.frameLine(24);
      let k = rt.rect2i(0, 0, 0, 0);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("r09|"), rt.strBuiltin([j]), rt.V.str("|"), rt.strBuiltin([k]), rt.V.str("|"), rt.typeOf(j), rt.typeOf(k)]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("r10|"), rt.V.str(rt.varToStr(c)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(c))), c), rt.V.str("|"), rt.V.str(rt.varToStr(i)), rt.V.str("|"), rt.ops.eq(rt.strToVar(rt.V.str(rt.varToStr(i))), i)]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("r11|"), rt.gVarToBytes(c), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(c)), c)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("r12|"), rt.gVarToBytes(i), rt.V.str("|"), rt.ops.eq(rt.gBytesToVar(rt.gVarToBytes(i)), i)]));
      rt.frameLine(29);
      let arr = rt.V.array(rt.GArray.of([b, c]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("r13|"), rt.method(arr, "size", []), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.index(arr, rt.V.int(0), "Array[Rect2]")), b), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(arr, rt.V.int(1), "Array[Rect2]"))])]));
      rt.frameLine(31);
      let v = rt.dictOf([[rt.V.str("k"), c]]);
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("r14|"), rt.method(v, "size", []), rt.V.str("|"), rt.method(v, "has", [rt.V.str("k")]), rt.V.str("|"), rt.strBuiltin([rt.wrapValue(rt.index(v, rt.V.str("k")))])]));
      rt.frameLine(33);
      let kd = rt.dictOf([[c, rt.V.int(1)]]);
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("r15|"), rt.method(kd, "size", []), rt.V.str("|"), rt.method(kd, "has", [rt.rect2New([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])]), rt.V.str("|"), rt.wrapValue(rt.index(kd, c))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("r16|"), rt.ops.eq(rt.variantHash([b]), rt.variantHash([c])), rt.V.str("|"), rt.ops.eq(rt.variantHash([b]), rt.variantHash([b])), rt.V.str("|"), rt.ops.eq(rt.variantHash([h]), rt.variantHash([i]))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("r17|"), rt.isType(c, "Rect2"), rt.V.str("|"), rt.isType(i, "Rect2i")]));
      rt.frameLine(37);
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
