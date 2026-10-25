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

  fmt(r: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "fmt");
    try {
      rt.frameLine(4);
      return rt.ops.add(rt.ops.add(rt.strBuiltin([r]), rt.V.str("|")), rt.strBuiltin([rt.typeOf(r)]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("B0|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("ab"), "capitalize", []), rt.V.str("z")))]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("B1|"), this.fmt(rt.ops.eq(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(3)))]));
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("B2|"), this.fmt(rt.ops.eq(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("B3|"), this.fmt(rt.ops.neq(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("B4|"), this.fmt(rt.ops.lt(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("B5|"), this.fmt(rt.ops.gt(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(1)))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("B6|"), this.fmt(rt.ops.lte(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("B7|"), this.fmt(rt.ops.gte(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(3)))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("B8|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(1)))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("B9|"), this.fmt(rt.ops.sub(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(1)))]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("B10|"), this.fmt(rt.ops.mul(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("B11|"), this.fmt(rt.ops.div(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2)))]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("B12|"), this.fmt(rt.ops.mod(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(2), true))]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("B13|"), this.fmt(rt.and(rt.method(rt.V.stringName("ab"), "length", []), () => rt.V.bool(true)))]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("B14|"), this.fmt(rt.or(rt.method(rt.V.stringName("ab"), "length", []), () => rt.V.bool(false)))]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("B15|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("ab"), "left", [rt.V.int(1)]), rt.V.str("z")))]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("B16|"), this.fmt(rt.ops.eq(rt.method(rt.V.stringName("ab"), "capitalize", []), rt.V.str("Ab")))]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("B17|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("ab"), "get_slice_count", [rt.V.str("/")]), rt.V.int(1)))]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("B18|"), this.fmt(rt.ops.sub(rt.method(rt.V.stringName("ab"), "hash", []), rt.V.int(1)))]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("B19|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("ab"), "length", []), rt.V.int(rt.fast.iMulC(1, 2))))]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("B20|"), this.fmt(rt.method(rt.nodePathCtor([rt.V.str("a/b/c")]), "slice", [rt.V.int(1)]))]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("B21|"), this.fmt(rt.ops.add(rt.method(rt.nodePathCtor([rt.V.str("a/b/c")]), "get_name_count", []), rt.V.int(1)))]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("B23|"), this.fmt(rt.ops.add(rt.method(rt.nodePathCtor([rt.V.str("a/b/c")]), "get_name", [rt.V.int(1)]), rt.V.str("x")))]));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("B24|"), this.fmt(rt.ops.inOp(rt.method(rt.V.stringName("ab"), "length", []), rt.V.array(rt.GArray.of([rt.V.int(2), rt.V.int(3)]))))]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("B25|"), this.fmt(rt.isType(rt.V.stringName("ab"), "StringName"))]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("B26|"), this.fmt(rt.method(rt.method(rt.nodePathCtor([rt.V.str("a/b/c")]), "slice", [rt.V.int(1)]), "get_name_count", []))]));
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("B27|"), this.fmt(rt.or(rt.method(rt.nodePathCtor([rt.V.str("a/b")]), "is_absolute", []), () => rt.V.bool(true)))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("B28|"), this.fmt(rt.ops.mul(rt.method(rt.V.stringName("abc"), "length", []), rt.V.int(3)))]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("B29|"), this.fmt(rt.ops.add(rt.method(rt.V.stringName("abab"), "count", [rt.V.str("a")]), rt.V.int(1)))]));
      rt.frameLine(36);
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
      case "fmt": return rt.wrapValue(this.fmt(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "fmt": [1, 1], "_initialize": [0, 0] });
rt.registerMethodParams(__gd_d_Main, { "fmt": ["Variant"] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
