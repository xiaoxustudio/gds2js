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

  nest(n: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "nest");
    try {
      n = rt.paramSlot(n, "int", 1, "nest", this);
      rt.frameLine(4);
      let c = rt.V.array(rt.GArray.of([]));
      rt.frameLine(5);
      for (let i of rt.rangeSeq([n])) {
        rt.frameLine(6);
        let x = rt.V.array(rt.GArray.of([]));
        rt.frameLine(7);
        rt.method(x, "append", [c]);
        rt.frameLine(8);
        c = x;
      }
      rt.frameLine(9);
      return c;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(12);
      let a = rt.V.array(rt.GArray.of([]));
      rt.frameLine(13);
      rt.method(a, "append", [a]);
      rt.frameLine(14);
      print(rt.showArgs([a]));
      rt.frameLine(15);
      print(rt.showArgs([rt.method(rt.strBuiltin([a]), "length", []), rt.V.str(" "), rt.method(a, "size", []), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(a, rt.V.int(0))), a), rt.V.str(" "), rt.ops.eq(rt.wrapValue(rt.index(rt.wrapValue(rt.index(a, rt.V.int(0))), rt.V.int(0))), a)]));
      rt.frameLine(16);
      let d = rt.dictOf([]);
      rt.frameLine(17);
      {
        const _nv = rt.writeIdx(d, rt.V.str("x"), d);
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(18);
      print(rt.showArgs([rt.method(rt.strBuiltin([d]), "length", [])]));
      rt.frameLine(19);
      print(rt.showArgs([d]));
      rt.frameLine(20);
      let p = rt.V.array(rt.GArray.of([]));
      rt.frameLine(21);
      let q = rt.V.array(rt.GArray.of([p]));
      rt.frameLine(22);
      rt.method(p, "append", [q]);
      rt.frameLine(23);
      print(rt.showArgs([rt.ops.eq(p, q), rt.V.str(" "), rt.method(rt.strBuiltin([p]), "length", [])]));
      rt.frameLine(24);
      let b = rt.V.array(rt.GArray.of([]));
      rt.frameLine(25);
      rt.method(b, "append", [b]);
      rt.frameLine(26);
      print(rt.showArgs([rt.ops.eq(a, b), rt.V.str(" "), rt.ops.eq(a, a)]));
      rt.frameLine(27);
      let f = rt.dictOf([]);
      rt.frameLine(28);
      {
        const _nv = rt.writeIdx(f, rt.V.str("x"), f);
        if (_nv !== null) f = _nv;
      }
      rt.frameLine(29);
      print(rt.showArgs([rt.ops.eq(d, f), rt.V.str(" "), rt.ops.eq(d, d)]));
      rt.frameLine(30);
      let ca = rt.method(a, "duplicate", [rt.V.bool(true)]);
      rt.frameLine(31);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(ca, rt.V.int(0))), ca), rt.V.str(" "), rt.method(ca, "size", []), rt.V.str(" "), rt.method(rt.strBuiltin([ca]), "length", [])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(rt.wrapValue(rt.index(ca, rt.V.int(0))), rt.V.int(0))), ca)]));
      rt.frameLine(33);
      let cd = rt.method(d, "duplicate", [rt.V.bool(true)]);
      rt.frameLine(34);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(cd, rt.V.str("x"))), cd), rt.V.str(" "), rt.method(rt.strBuiltin([cd]), "length", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.ops.eq(rt.wrapValue(rt.index(rt.method(a, "duplicate", []), rt.V.int(0))), a)]));
      rt.frameLine(36);
      print(rt.showArgs([rt.method(rt.strBuiltin([this.nest(rt.V.int(99))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(100))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(101))]), "length", []), rt.V.str(" "), rt.method(rt.strBuiltin([this.nest(rt.V.int(102))]), "length", [])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.ops.eq(this.nest(rt.V.int(101)), this.nest(rt.V.int(102)))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.method(rt.strBuiltin([rt.V.array(rt.GArray.of([a, a]))]), "length", [])]));
      rt.frameLine(39);
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
      case "nest": return rt.wrapValue(this.nest(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "nest": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "nest": ["int"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
