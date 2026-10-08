// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  KN = rt.nodePathCtor([rt.V.str("x/y")]);
  static KN = rt.nodePathCtor([rt.V.str("x/y")]);

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.nodePathCtor([rt.V.str("a/b")]);
    print(rt.showArgs([rt.V.str("t01|"), p]));
    print(rt.showArgs([rt.V.str("t02|"), rt.typeOf(p)]));
    print(rt.showArgs([rt.V.str("t03|"), rt.strBuiltin([p])]));
    print(rt.showArgs([rt.V.str("t04|"), rt.V.str(rt.varToStr(p))]));
    print(rt.showArgs([rt.V.str("t05|"), rt.ops.eq(p, rt.nodePathCtor([rt.V.str("a/b")]))]));
    print(rt.showArgs([rt.V.str("t06|"), rt.method(p, "get_name_count", []), rt.V.str("|"), rt.method(p, "get_name", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("t07|"), rt.method(p, "is_absolute", []), rt.V.str("|"), rt.method(rt.nodePathCtor([rt.V.str("/a/b")]), "is_absolute", [])]));
    print(rt.showArgs([rt.V.str("t08|"), rt.isType(p, "NodePath")]));
    print(rt.showArgs([rt.V.str("t09|"), rt.nodePathCtor([rt.V.str("")])]));
    print(rt.showArgs([rt.V.str("t10|"), rt.nodePathCtor([rt.V.str("a:1")])]));
    print(rt.showArgs([rt.V.str("t11|"), rt.nodePathCtor([rt.V.str("中/文")])]));
    print(rt.showArgs([rt.V.str("t12|"), rt.nodePathCtor([rt.V.str("a b")])]));
    let d = rt.dictOf([[rt.nodePathCtor([rt.V.str("a/b")]), rt.V.int(1)]]);
    print(rt.showArgs([rt.V.str("t13|"), d]));
    print(rt.showArgs([rt.V.str("t14|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
    print(rt.showArgs([rt.V.str("t15|"), rt.method(d, "keys", [])]));
    print(rt.showArgs([rt.V.str("t16|"), rt.wrapValue(rt.index(d, rt.nodePathCtor([rt.V.str("a/b")])))]));
    let t = rt.nodePathCtor([rt.V.str("n0/one")]);
    print(rt.showArgs([rt.V.str("t17|"), t]));
    print(rt.showArgs([rt.V.str("t18|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a/b")]), rt.nodePathCtor([rt.V.str("a/b")]))]));
    print(rt.showArgs([rt.V.str("t19|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a")]), rt.nodePathCtor([rt.V.str("b")]))]));
    print(rt.showArgs([rt.V.str("t20|"), Main.KN, rt.V.str("|"), rt.typeOf(Main.KN), rt.V.str("|"), rt.ops.eq(Main.KN, rt.nodePathCtor([rt.V.str("x/y")]))]));
    print(rt.showArgs([rt.V.str("t21|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a\tb")]), rt.nodePathCtor([rt.V.str("a\tb")]))]));
    print(rt.showArgs([rt.V.str("t22|"), rt.ops.eq(rt.nodePathCtor([rt.V.str("a\tb")]), rt.nodePathCtor([rt.V.str("a\\tb")]))]));
    print(rt.showArgs([rt.V.str("t23|"), rt.strBuiltin([rt.nodePathCtor([rt.V.str("a\tb")])])]));
    print(rt.showArgs([rt.V.str("t24|"), rt.V.str(rt.varToStr(rt.nodePathCtor([rt.V.str("a\tb")])))]));
    print(rt.showArgs([rt.V.str("t25|"), rt.method(rt.nodePathCtor([rt.V.str("a\tb")]), "get_name_count", [])]));
    print(rt.showArgs([rt.V.str("t26|"), rt.nodePathCtor([rt.V.str("a\nb")])]));
    print(rt.showArgs([rt.V.str("t27|"), rt.nodePathCtor([rt.V.str("a\"b")])]));
    print(rt.showArgs([rt.V.str("t28|"), rt.nodePathCtor([rt.V.str("a\\b")])]));
    let q = rt.nodePathCtor([rt.V.str("a/b:0:1")]);
    print(rt.showArgs([rt.V.str("t29|"), q]));
    print(rt.showArgs([rt.V.str("t30|"), rt.method(q, "get_subname_count", []), rt.V.str("|"), rt.method(q, "get_subname", [rt.V.int(1)])]));
    print(rt.showArgs([rt.V.str("t31|"), rt.ops.eq(q, rt.nodePathCtor([rt.V.str("a/b:0:1")]))]));
    print(rt.showArgs([rt.V.str("t32|"), rt.method(rt.nodePathCtor([rt.V.str("$A/B")]), "is_absolute", [])]));
    print(rt.showArgs([rt.V.str("t33|"), rt.nodePathCtor([rt.V.str("..")])]));
    print(rt.showArgs([rt.V.str("t34|"), rt.method(p, "get_subname_count", [])]));
    let arr = rt.V.array(rt.GArray.of([rt.nodePathCtor([rt.V.str("a/b")])]));
    print(rt.showArgs([rt.V.str("t35|"), rt.ops.inOp(rt.nodePathCtor([rt.V.str("a/b")]), arr)]));
    print(rt.showArgs([rt.V.str("t36|"), rt.ops.inOp(rt.V.str("a/b"), arr)]));
    print(rt.showArgs([rt.V.str("t37|"), rt.method(arr, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
    print(rt.showArgs([rt.V.str("t38|"), rt.method(arr, "has", [rt.V.str("a/b")])]));
    print(rt.showArgs([rt.V.str("t39|"), rt.ops.inOp(rt.V.str("a/b"), d)]));
    print(rt.showArgs([rt.V.str("t40|"), rt.ops.inOp(rt.V.stringName("a/b"), d)]));
    print(rt.showArgs([rt.V.str("t41|"), rt.method(d, "get", [rt.V.str("a/b"), rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("t42|"), rt.method(d, "has", [rt.nodePathCtor([rt.V.str("a/b")])])]));
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
