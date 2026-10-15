// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare KN: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.KN = rt.nodePathCtor([rt.V.str("x/y")]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  static KN = rt.nodePathCtor([rt.V.str("x/y")]);

  constructor() {
    super();
    this.__gd_fields__();
  }

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(6);
      let p = rt.nodePathCtor([rt.V.str("a/b")]);
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("t01|"), p]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("t02|"), rt.typeOf(p)]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("t03|"), rt.strBuiltin([p])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("t04|"), rt.V.str(rt.varToStr(p))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("t05|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/b")]))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("t06|"), rt.method(p, "get_name_count", []), rt.V.str("|"), rt.method(p, "get_name", [rt.V.int(1)])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("t07|"), rt.method(p, "is_absolute", []), rt.V.str("|"), rt.method(rt.nodePathCtor([rt.V.str("/a/b")]), "is_absolute", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("t08|"), rt.isType(p, "NodePath")]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("t09|"), rt.nodePathCtor([rt.V.str("")])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("t10|"), rt.nodePathCtor([rt.V.str("a:1")])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("t11|"), rt.nodePathCtor([rt.V.str("中/文")])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("t12|"), rt.nodePathCtor([rt.V.str("a b")])]));
      rt.frameLine(19);
      let d = rt.dictOf([[rt.nodePathCtor([rt.V.str("a/b")]), rt.V.int(1)]]);
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("t13|"), d]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("t14|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("t15|"), rt.method(d, "keys", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("t16|"), rt.wrapValue(rt.index(d, rt.nodePathCtor([rt.V.str("a/b")])))]));
      rt.frameLine(24);
      let t = rt.nodePathCtor([rt.V.str("n0/one")]);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("t17|"), t]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("t18|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("a/b")]))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("t19|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a")]), rt.nodePathCtor([rt.V.str("b")]))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("t20|"), Main.KN, rt.V.str("|"), rt.typeOf(Main.KN), rt.V.str("|"), rt.ops.eq(Main.KN, rt.nodePathCtor([rt.V.str("x/y")]))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("t21|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a\tb")]), rt.nodePathCtor([rt.V.str("a\tb")]))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("t22|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a\tb")]), rt.nodePathCtor([rt.V.str("a\\tb")]))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("t23|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str("a\tb")])])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("t24|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str("a\tb")])))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("t25|"), rt.method(rt.nodePathCtor([rt.V.str("a\tb")]), "get_name_count", [])]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("t26|"), rt.nodePathCtor([rt.V.str("a\nb")])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("t27|"), rt.nodePathCtor([rt.V.str("a\"b")])]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("t28|"), rt.nodePathCtor([rt.V.str("a\\b")])]));
      rt.frameLine(37);
      let q = rt.nodePathCtor([rt.V.str("a/b:0:1")]);
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("t29|"), q]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("t30|"), rt.method(q, "get_subname_count", []), rt.V.str("|"), rt.method(q, "get_subname", [rt.V.int(1)])]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("t31|"), rt.ops.eq(q, rt.nodePathCtor([rt.V.str("a/b:0:1")]))]));
      rt.frameLine(41);
      print(rt.showArgs([rt.V.str("t32|"), rt.method(rt.nodePathCtor([rt.V.str("$A/B")]), "is_absolute", [])]));
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("t33|"), rt.nodePathCtor([rt.V.str("..")])]));
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("t34|"), rt.method(p, "get_subname_count", [])]));
      rt.frameLine(44);
      let arr = rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a/b")])]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("t35|"), rt.ops.inOp(rt.nodePathCtor([rt.V.str("a/b")]), arr)]));
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("t36|"), rt.ops.inOp(rt.V.str("a/b"), arr)]));
      rt.frameLine(47);
      print(rt.showArgs([rt.V.str("t37|"), rt.method(arr, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
      rt.frameLine(48);
      print(rt.showArgs([rt.V.str("t38|"), rt.method(arr, "has", [rt.V.str("a/b")])]));
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("t39|"), rt.ops.inOp(rt.V.str("a/b"), d)]));
      rt.frameLine(50);
      print(rt.showArgs([rt.V.str("t40|"), rt.ops.inOp(rt.V.stringName("a/b"), d)]));
      rt.frameLine(51);
      print(rt.showArgs([rt.V.str("t41|"), rt.method(d, "get", [rt.V.str("a/b"), rt.V.int(0)])]));
      rt.frameLine(52);
      print(rt.showArgs([rt.V.str("t42|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
      rt.frameLine(53);
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
rt.registerScriptProps(__gd_d_Main, ["KN"], (o) => { const s = o as Main; return [s.KN]; });
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
