// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

const INF = rt.V.float(Number.POSITIVE_INFINITY);
const NAN = rt.V.float(Number.NaN);
const PI = rt.V.float(3.141592653589793);

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

  enc(tag: rt.Variant, v: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "enc");
    try {
      rt.frameLine(4);
      print(rt.showArgs([tag, rt.V.str("|"), rt.gVarToBytes(v), rt.V.str("|"), rt.gBytesToVar(rt.gVarToBytes(v))]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      let ai = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), "int", true);
      rt.frameLine(8);
      let af = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.float(1.5)])), "float", true);
      rt.frameLine(9);
      let ab = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.bool(true)])), "bool", true);
      rt.frameLine(10);
      let av = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])])), "Vector2", true);
      rt.frameLine(11);
      let aa = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), "Array", true);
      rt.frameLine(12);
      let ae = rt.stampArray(rt.V.array(rt.GArray.of([])), "int", true);
      rt.frameLine(13);
      let di = rt.stampDict(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), "String", "int", true);
      rt.frameLine(14);
      let av2i = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector2iNew([rt.V.int(1), rt.V.int((-2))])])), "Vector2i", true);
      rt.frameLine(15);
      let acol = rt.stampArray(rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])])), "Color", true);
      rt.frameLine(16);
      let asn = rt.stampArray(rt.V.array(rt.GArray.of([rt.V.stringName("a")])), "StringName", true);
      rt.frameLine(17);
      let av3 = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), "Vector3", true);
      rt.frameLine(18);
      let adic = rt.stampArray(rt.V.array(rt.GArray.of([rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])])), "Dictionary", true);
      rt.frameLine(19);
      let av3i = rt.stampArray(rt.V.array(rt.GArray.of([rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])])), "Vector3i", true);
      rt.frameLine(20);
      let zero = 0;
      rt.frameLine(21);
      this.enc(rt.V.str("t01|"), rt.packCtor("int32", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]));
      rt.frameLine(22);
      this.enc(rt.V.str("t02|"), rt.packCtor("int64", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int((-2))]))]));
      rt.frameLine(23);
      this.enc(rt.V.str("t03|"), rt.packCtor("float32", [rt.V.array(rt.GArray.of([rt.V.float(1.5), rt.V.float((-2.5))]))]));
      rt.frameLine(24);
      this.enc(rt.V.str("t04|"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("abc")]))]));
      rt.frameLine(25);
      this.enc(rt.V.str("t05|"), rt.packCtor("vector2", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]));
      rt.frameLine(26);
      this.enc(rt.V.str("t06|"), rt.packCtor("vector3", [rt.V.array(rt.GArray.of([rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])]))]));
      rt.frameLine(27);
      this.enc(rt.V.str("t07|"), rt.packCtor("color", [rt.V.array(rt.GArray.of([rt.colorNew([rt.V.float(0.25), rt.V.float(0.5), rt.V.float(0.75), rt.V.int(1)])]))]));
      rt.frameLine(28);
      this.enc(rt.V.str("t08|"), rt.packCtor("int32", [rt.V.array(rt.GArray.of([]))]));
      rt.frameLine(29);
      this.enc(rt.V.str("t09|"), rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("é")]))]));
      rt.frameLine(30);
      this.enc(rt.V.str("t10|"), NAN);
      rt.frameLine(31);
      this.enc(rt.V.str("t11|"), INF);
      rt.frameLine(32);
      this.enc(rt.V.str("t12|"), rt.ops.neg(INF));
      rt.frameLine(33);
      this.enc(rt.V.str("t13|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1022))));
      rt.frameLine(34);
      this.enc(rt.V.str("t14|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1074))));
      rt.frameLine(35);
      this.enc(rt.V.str("t15|"), rt.V.float((-zero)));
      rt.frameLine(36);
      this.enc(rt.V.str("t16|"), rt.V.float(0.1));
      rt.frameLine(37);
      this.enc(rt.V.str("t17|"), PI);
      rt.frameLine(38);
      this.enc(rt.V.str("t18|"), rt.V.float(100000000000000000000));
      rt.frameLine(39);
      this.enc(rt.V.str("t19|"), rt.V.float(0.0001));
      rt.frameLine(40);
      this.enc(rt.V.str("t20|"), rt.ops.pow(rt.V.float(2), rt.V.int((-126))));
      rt.frameLine(41);
      this.enc(rt.V.str("t21|"), rt.V.float(16777216));
      rt.frameLine(42);
      this.enc(rt.V.str("t22|"), rt.V.float(16777217));
      rt.frameLine(43);
      this.enc(rt.V.str("t43|"), rt.ops.pow(rt.V.float(2), rt.V.int((-149))));
      rt.frameLine(44);
      this.enc(rt.V.str("t44|"), rt.ops.pow(rt.V.float(2), rt.V.int((-127))));
      rt.frameLine(45);
      this.enc(rt.V.str("t45|"), rt.ops.pow(rt.V.float(2), rt.V.int((-1075))));
      rt.frameLine(46);
      this.enc(rt.V.str("t46|"), rt.toFloat(rt.V.int(0)));
      rt.frameLine(47);
      this.enc(rt.V.str("t23|"), ai);
      rt.frameLine(48);
      this.enc(rt.V.str("t24|"), af);
      rt.frameLine(49);
      this.enc(rt.V.str("t25|"), ab);
      rt.frameLine(50);
      this.enc(rt.V.str("t26|"), av);
      rt.frameLine(51);
      this.enc(rt.V.str("t27|"), aa);
      rt.frameLine(52);
      this.enc(rt.V.str("t28|"), ae);
      rt.frameLine(53);
      this.enc(rt.V.str("t29|"), di);
      rt.frameLine(54);
      this.enc(rt.V.str("t30|"), rt.nodePathCtor([rt.V.str("a/b")]));
      rt.frameLine(55);
      this.enc(rt.V.str("t31|"), rt.nodePathCtor([rt.V.str("a:1")]));
      rt.frameLine(56);
      this.enc(rt.V.str("t32|"), rt.nodePathCtor([rt.V.str("a/b:0")]));
      rt.frameLine(57);
      this.enc(rt.V.str("t33|"), rt.nodePathCtor([rt.V.str("/a")]));
      rt.frameLine(58);
      this.enc(rt.V.str("t34|"), rt.nodePathCtor([rt.V.str("/a/b")]));
      rt.frameLine(59);
      this.enc(rt.V.str("t35|"), rt.nodePathCtor([rt.V.str(":1")]));
      rt.frameLine(60);
      this.enc(rt.V.str("t36|"), rt.nodePathCtor([rt.V.str("a:1:2")]));
      rt.frameLine(61);
      this.enc(rt.V.str("t37|"), rt.nodePathCtor([rt.V.str("a/b^c/d")]));
      rt.frameLine(62);
      this.enc(rt.V.str("t38|"), rt.nodePathCtor([rt.V.str("sub:1^")]));
      rt.frameLine(63);
      this.enc(rt.V.str("t39|"), rt.nodePathCtor([rt.V.str("")]));
      rt.frameLine(64);
      this.enc(rt.V.str("t40|"), rt.nodePathCtor([rt.V.str("^")]));
      rt.frameLine(65);
      this.enc(rt.V.str("t41|"), rt.nodePathCtor([rt.V.str("/:0")]));
      rt.frameLine(66);
      this.enc(rt.V.str("t42|"), rt.nodePathCtor([rt.V.str("a/b/c:1:2")]));
      rt.frameLine(67);
      this.enc(rt.V.str("t47|"), rt.vector3iNew([rt.V.int(1), rt.V.int((-2)), rt.V.int(3)]));
      rt.frameLine(68);
      this.enc(rt.V.str("t48|"), av2i);
      rt.frameLine(69);
      this.enc(rt.V.str("t49|"), acol);
      rt.frameLine(70);
      this.enc(rt.V.str("t50|"), asn);
      rt.frameLine(71);
      this.enc(rt.V.str("t51|"), av3);
      rt.frameLine(72);
      this.enc(rt.V.str("t52|"), adic);
      rt.frameLine(73);
      this.enc(rt.V.str("t53|"), av3i);
      rt.frameLine(74);
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
