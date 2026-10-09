// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

export class Main extends SceneTree {
  enc(tag: rt.Variant, v: rt.Variant): void {
    print(rt.showArgs([tag, rt.V.str("|"), rt.gVarToBytes(v), rt.V.str("|"), rt.gBytesToVar(rt.gVarToBytes(v))]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let ai = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
    let af = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.float(1.5)])), "float", true);
    let ab = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.bool(true)])), "bool", true);
    let av = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
    let aa = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "Array", true);
    let ae = rt.stampArray(rt.V.array(rt.GArray.of([])), "int", true);
    let di = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "String", "int", true);
    let av2i = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int((-2))])])), "Vector2i", true);
    let acol = rt.stampArray(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])])), "Color", true);
    let asn = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.stringName("a")])), "StringName", true);
    let av3 = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), "Vector3", true);
    let adic = rt.stampArray(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])])), "Dictionary", true);
    let av3i = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), "Vector3i", true);
    let zero = 0;
    this.enc(rt.V.str("t01|"), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]));
    this.enc(rt.V.str("t02|"), rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]));
    this.enc(rt.V.str("t03|"), rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float((-2.5))]))]));
    this.enc(rt.V.str("t04|"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("abc")]))]));
    this.enc(rt.V.str("t05|"), rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]));
    this.enc(rt.V.str("t06|"), rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]));
    this.enc(rt.V.str("t07|"), rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])]))]));
    this.enc(rt.V.str("t08|"), rt.packCtor("int32", [rt.V.array(rt.GArray.of([]))]));
    this.enc(rt.V.str("t09|"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("é")]))]));
    this.enc(rt.V.str("t10|"), NAN);
    this.enc(rt.V.str("t11|"), INF);
    this.enc(rt.V.str("t12|"), rt.ops.neg(INF));
    this.enc(rt.V.str("t13|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1022))));
    this.enc(rt.V.str("t14|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1074))));
    this.enc(rt.V.str("t15|"), rt.V.float((-zero)));
    this.enc(rt.V.str("t16|"), rt.V.float(0.1));
    this.enc(rt.V.str("t17|"), PI);
    this.enc(rt.V.str("t18|"), rt.V.float(100000000000000000000));
    this.enc(rt.V.str("t19|"), rt.V.float(0.0001));
    this.enc(rt.V.str("t20|"), rt.ops.pow(rt.V.float(2), rt.V.int((-126))));
    this.enc(rt.V.str("t21|"), rt.V.float(16777216));
    this.enc(rt.V.str("t22|"), rt.V.float(16777217));
    this.enc(rt.V.str("t43|"), rt.ops.pow(rt.V.float(2), rt.V.int((-149))));
    this.enc(rt.V.str("t44|"), rt.ops.pow(rt.V.float(2), rt.V.int((-127))));
    this.enc(rt.V.str("t45|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1075))));
    this.enc(rt.V.str("t46|"), rt.toFloat(rt.V.int(0)));
    this.enc(rt.V.str("t23|"), ai);
    this.enc(rt.V.str("t24|"), af);
    this.enc(rt.V.str("t25|"), ab);
    this.enc(rt.V.str("t26|"), av);
    this.enc(rt.V.str("t27|"), aa);
    this.enc(rt.V.str("t28|"), ae);
    this.enc(rt.V.str("t29|"), di);
    this.enc(rt.V.str("t30|"), rt.nodePathCtor([rt.V.str("a/b")]));
    this.enc(rt.V.str("t31|"), rt.nodePathCtor([rt.V.str("a:1")]));
    this.enc(rt.V.str("t32|"), rt.nodePathCtor([rt.V.str("a/b:0")]));
    this.enc(rt.V.str("t33|"), rt.nodePathCtor([rt.V.str("/a")]));
    this.enc(rt.V.str("t34|"), rt.nodePathCtor([rt.V.str("/a/b")]));
    this.enc(rt.V.str("t35|"), rt.nodePathCtor([rt.V.str(":1")]));
    this.enc(rt.V.str("t36|"), rt.nodePathCtor([rt.V.str("a:1:2")]));
    this.enc(rt.V.str("t37|"), rt.nodePathCtor([rt.V.str("a/b^c/d")]));
    this.enc(rt.V.str("t38|"), rt.nodePathCtor([rt.V.str("sub:1^")]));
    this.enc(rt.V.str("t39|"), rt.nodePathCtor([rt.V.str("")]));
    this.enc(rt.V.str("t40|"), rt.nodePathCtor([rt.V.str("^")]));
    this.enc(rt.V.str("t41|"), rt.nodePathCtor([rt.V.str("/:0")]));
    this.enc(rt.V.str("t42|"), rt.nodePathCtor([rt.V.str("a/b/c:1:2")]));
    this.enc(rt.V.str("t47|"), rt.vector3iNew([rt.V.int(1), rt.V.int((-2)), rt.V.int(3)]));
    this.enc(rt.V.str("t48|"), av2i);
    this.enc(rt.V.str("t49|"), acol);
    this.enc(rt.V.str("t50|"), asn);
    this.enc(rt.V.str("t51|"), av3);
    this.enc(rt.V.str("t52|"), adic);
    this.enc(rt.V.str("t53|"), av3i);
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "enc": return rt.wrapValue(this.enc(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "enc": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
