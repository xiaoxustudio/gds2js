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

  static osv = rt.toInt(rt.V.int(1));

  constructor() {
    super();
    this.__gd_fields__();
  }

  static bumpOuter(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "bumpOuter");
    try {
      rt.frameLine(6);
      Main.osv = rt.toInt(rt.ops.add(Main.osv, rt.V.int(1)));
      rt.frameLine(7);
      return Main.osv;
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
      rt.frameLine(26);
      let p = rt.V.object(new A());
      rt.frameLine(27);
      let q = rt.V.object(new A());
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("u1 "), A.x]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("u2 "), A.plain]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("u3 "), A.lit]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("u4 "), A.computed]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.V.object(__gd_d_A), "setx", [rt.V.int(9)]), rt.V.str(" "), A.x]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("u6 "), rt.method(rt.V.object(__gd_d_A), "setx", [rt.V.float(2.7)]), rt.V.str(" "), A.x]));
      rt.frameLine(34);
      rt.writeProp(rt.V.object(__gd_d_A), "x", rt.V.int(100));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("u7 "), A.x]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("u8 "), rt.wrapValue(rt.attribute(p, "x"))]));
      rt.frameLine(37);
      {
        const _nv = rt.writeProp(p, "x", rt.V.int(200));
        if (_nv !== null) p = _nv;
      }
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("u9 "), A.x, rt.V.str(" "), rt.wrapValue(rt.attribute(p, "x")), rt.V.str(" "), rt.wrapValue(rt.attribute(q, "x"))]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("u10 "), rt.method(p, "fromInstance", []), rt.V.str(" "), rt.method(q, "fromInstance", [])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("u11 "), rt.method(p, "setx", [rt.V.int(5)]), rt.V.str(" "), A.x]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("u12 "), Main.bumpOuter(), rt.V.str(" "), Main.osv]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("u13 "), rt.wrapValue(rt.attribute(rt.V.object(this), "osv"))]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("u14 "), A.x, rt.V.str(" "), rt.wrapValue(rt.attribute(p, "mv"))]));
      rt.frameLine(44);
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
rt.registerStaticVars(__gd_d_Main, {"osv": "int"}, {"osv": { get: (): rt.Variant => Main.osv, set: (__v: rt.Variant): void => { Main.osv = __v; } }});
rt.registerMethodArities(__gd_d_Main, { "bumpOuter": [0, 0], "_initialize": [0, 0] });
rt.registerStaticMethods(__gd_d_Main, ["bumpOuter"], {"bumpOuter": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.bumpOuter())});
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class A extends rt.GdScriptObject {
  declare mv: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(15);
      this.mv = rt.toInt(rt.V.int(9));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static x = rt.toInt(rt.V.int(1));
  static plain = rt.V.int(2);
  static lit = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
  static computed = rt.toInt(rt.V.int(rt.fast.iMulC(3, 7)));

  constructor() {
    super();
    this.__gd_fields__();
  }

  static setx(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "setx");
    try {
      rt.frameLine(18);
      A.x = rt.toInt(v);
      rt.frameLine(19);
      return A.x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  fromInstance(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "fromInstance");
    try {
      rt.frameLine(22);
      return A.x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "fromInstance": return rt.wrapValue(this.fromInstance());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerFieldTypes(__gd_d_A, {"mv": "int"});
rt.registerScriptProps(__gd_d_A, ["mv"], (o) => { const s = o as A; return [s.mv]; });
rt.registerDictIdentity(__gd_d_A, "res://main.gd", "A", ["mv"], {}, (o) => { const s = o as A; return [s.mv]; });
rt.registerStaticVars(__gd_d_A, {"x": "int", "plain": "", "lit": "", "computed": "int"}, {"x": { get: (): rt.Variant => A.x, set: (__v: rt.Variant): void => { A.x = __v; } }, "plain": { get: (): rt.Variant => A.plain, set: (__v: rt.Variant): void => { A.plain = __v; } }, "lit": { get: (): rt.Variant => A.lit, set: (__v: rt.Variant): void => { A.lit = __v; } }, "computed": { get: (): rt.Variant => A.computed, set: (__v: rt.Variant): void => { A.computed = __v; } }});
rt.registerMethodArities(__gd_d_A, { "setx": [1, 1], "fromInstance": [0, 0] });
rt.registerStaticMethods(__gd_d_A, ["setx"], {"setx": (a: rt.Variant[]): rt.Variant => rt.wrapValue(A.setx(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
