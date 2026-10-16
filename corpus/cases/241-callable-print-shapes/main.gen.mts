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

  top(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "top");
    try {
      rt.frameLine(15);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(18);
      let o = rt.V.object(new Inner());
      rt.frameLine(19);
      let lam = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(19);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(20);
      let t = rt.methodCallable(rt.V.object(this), "top");
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("q01|"), rt.wrapValue(rt.attribute(o, "three"))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("q02|"), rt.typeOf(rt.wrapValue(rt.attribute(o, "three"))), rt.V.str("|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "three"))]))])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("q03|"), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("q04|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))]))])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("q05|"), lam]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("q06|"), rt.strBuiltin([rt.V.array(rt.GArray.of([lam]))])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("q07|"), rt.callableCtor([])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("q08|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.callableCtor([])]))])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("q09|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1)])]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("q10|"), t]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("q11|"), rt.strBuiltin([rt.V.array(rt.GArray.of([t, lam, rt.callableCtor([])]))])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("q12|"), rt.formatOf(rt.V.str("%s"), rt.wrapValue(rt.attribute(o, "three")))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("q14|"), rt.globalCallable("abs")]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("q15|"), rt.V.str(rt.varToStr(rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(o, "three")), lam, rt.callableCtor([]), rt.globalCallable("abs"), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), t]))))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("q16|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), "call", [rt.V.int(4)])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("q17|"), rt.strBuiltin([rt.wrapValue(rt.attribute(o, "three"))]), rt.V.str("|"), rt.typeOf(rt.wrapValue(rt.attribute(o, "three")))]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("q18|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(o, "three"))), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm"))), rt.V.str("|"), rt.ops.eq(t, rt.methodCallable(rt.V.object(this), "top"))]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("q19|"), rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", []), rt.V.str("|"), rt.typeOf(rt.method(rt.wrapValue(rt.attribute(o, "three")), "get_method", [])), rt.V.str("|"), rt.method(t, "get_method", [])]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("q20|"), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "three")), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(o, "three")), rt.wrapValue(rt.attribute(rt.V.object(new Inner()), "three")))]));
      rt.frameLine(40);
      let d = rt.dictOf([]);
      rt.frameLine(41);
      {
        const _nv = rt.writeIdx(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.V.int(1));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(42);
      {
        const _nv = rt.writeIdx(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), rt.V.int(2));
        if (_nv !== null) d = _nv;
      }
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("r01|"), rt.method(d, "size", []), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")))), rt.V.str("|"), rt.wrapValue(rt.index(d, rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))))]));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("r02|"), rt.strBuiltin([d])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("r03|"), rt.method(d, "has", [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]), rt.V.str("|"), rt.method(d, "erase", [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]), rt.V.str("|"), rt.method(d, "size", [])]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("r04|"), rt.strBuiltin([rt.V.array(rt.GArray.of([rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm"))]))]), rt.V.str("|"), rt.ops.eq(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")))]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("r05|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), "call", [rt.V.int(3)]), rt.V.str("|"), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), "call", [rt.V.int(3)])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("r06|"), rt.strBuiltin([rt.dictOf([[rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sm")), rt.V.int(1)], [rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Cub), "sm")), rt.V.int(2)]])])]));
      rt.frameLine(49);
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
      case "top": return rt.wrapValue(this.top(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "top": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
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

  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "three");
    try {
      rt.frameLine(5);
      return rt.strBuiltin([a, b, c]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static sm(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(8);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerMethodArities(__gd_d_Inner, { "three": [3, 3], "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Inner, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

class Cub extends rt.GdScriptObject {
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

  static sm(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sm");
    try {
      rt.frameLine(12);
      return rt.ops.mul(a, rt.V.int(2));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Cub = rt.defineClass(Cub, () => new Cub(), (o) => o instanceof Cub);
rt.nameClass(__gd_d_Cub, "Cub");
rt.registerDictIdentity(__gd_d_Cub, "res://main.gd", "Cub", [], {}, (o) => { const s = o as Cub; return []; });
rt.registerMethodArities(__gd_d_Cub, { "sm": [1, 1] });
rt.registerStaticMethods(__gd_d_Cub, ["sm"], {"sm": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Cub.sm(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Cub, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
