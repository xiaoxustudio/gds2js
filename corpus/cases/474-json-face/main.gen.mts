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
      let d = rt.dictOf([[rt.V.str("b"), rt.V.int(1)], [rt.V.str("a"), rt.dictOf([[rt.V.str("z"), rt.V.int(2)], [rt.V.str("y"), rt.V.array(rt.GArray.of([rt.V.int(3), rt.V.int(4)]))]])], [rt.V.str("f"), rt.V.float(1)], [rt.V.str("g"), rt.V.array(rt.GArray.of([rt.V.float(0.1), rt.V.float((1 / 3))]))]]);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("k01|"), rt.method(rt.nativeClass("JSON"), "stringify", [d])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("k02|"), rt.method(rt.nativeClass("JSON"), "stringify", [d, rt.V.str("  ")])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("k03|"), rt.method(rt.nativeClass("JSON"), "stringify", [d, rt.V.str("\t")])]));
      rt.frameLine(8);
      print(rt.showArgs([rt.V.str("k04|"), rt.method(rt.nativeClass("JSON"), "stringify", [d, rt.V.str(""), rt.V.bool(false)]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [d, rt.V.str(""), rt.V.bool(true)])]));
      rt.frameLine(9);
      let s = rt.dictOf([]);
      rt.frameLine(10);
      {
        const _nv = rt.writeIdx(s, rt.V.str("zeta"), rt.V.int(1));
        if (_nv !== null) s = _nv;
      }
      rt.frameLine(11);
      {
        const _nv = rt.writeIdx(s, rt.V.str("alpha"), rt.V.int(2));
        if (_nv !== null) s = _nv;
      }
      rt.frameLine(12);
      {
        const _nv = rt.writeIdx(s, rt.V.str("m"), rt.V.int(3));
        if (_nv !== null) s = _nv;
      }
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("k05|"), rt.method(rt.nativeClass("JSON"), "stringify", [s]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [s, rt.V.str(""), rt.V.bool(false)])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("k06|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.dictOf([[rt.V.int(1), rt.V.int(2)], [rt.V.float(2.5), rt.V.int(3)], [rt.V.bool(true), rt.V.int(4)]])])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("k07|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.V.str("a\"b"), rt.V.str("a\\b"), rt.V.str("a/b"), rt.V.str("a\nb"), rt.V.str("tab\tb"), rt.V.str("back\fb"), rt.V.str("\u0007"), rt.V.str("\u000b"), rt.V.str("é中")]))])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("k08|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.V.nil(), rt.V.bool(true), rt.V.bool(false), rt.V.int(5), rt.V.int((-5)), rt.V.int(0), rt.V.str("s")]))])]));
      rt.frameLine(17);
      let xs = rt.V.array(rt.GArray.of([rt.V.float(0), rt.V.float((-0)), rt.V.float(1), rt.V.float((1 / 3)), rt.V.float(1000000000000000), rt.V.float(100000000000000000000), rt.V.float(1e-7), rt.V.float(1e-20), rt.V.float((-1.5))]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("k09|"), rt.method(rt.nativeClass("JSON"), "stringify", [xs]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [xs, rt.V.str(""), rt.V.bool(true), rt.V.bool(true)])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("k10|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.V.float((1 / 0)), rt.V.float(((-1) / 0))]))]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.V.float((1 / 0))])), rt.V.str(""), rt.V.bool(true), rt.V.bool(true)])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("k11|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.vector2New([rt.V.int(1), rt.V.int(2)])]))]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.colorNew([rt.V.int(1), rt.V.int(0), rt.V.int(0)])]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("k12|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.packCtor("string", [rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))])]))]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([]))]))]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.V.array(rt.GArray.of([rt.dictOf([])]))])]));
      rt.frameLine(22);
      let j = rt.method(rt.nativeClass("JSON"), "new", []);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("k13|"), rt.strBuiltin([j]), rt.V.str("|"), rt.typeOf(j), rt.V.str("|"), rt.isType(j, "JSON"), rt.V.str("|"), rt.isType(j, "RefCounted"), rt.V.str("|"), rt.isType(j, "Object"), rt.V.str("|"), rt.method(j, "get_class", []), rt.V.str("|"), rt.method(j, "is_class", [rt.V.str("RefCounted")])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("iid|"), rt.method(j, "get_instance_id", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("k14|"), rt.method(j, "stringify", [rt.dictOf([[rt.V.str("a"), rt.V.int(1)]])]), rt.V.str("|"), rt.method(j, "parse_string", [rt.V.str("{\"a\": 1}")]), rt.V.str("|"), rt.method(j, "get_error_message", []), rt.V.str("|"), rt.method(j, "get_error_line", []), rt.V.str("|"), rt.method(j, "get_data", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("k15|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{\"a\": 1}")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[1, [2, 3]]")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{}")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[]")])]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("k16|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("true")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("false")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("null")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("5")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("5.0")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("\"s\"")])]));
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("k17|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{\"k\": 1e5}")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[1E-3, -0, 007]")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{\"a\": \"x\\u00e9y\"}")])]));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("k18|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("  {  \"a\" : [ 1 , 2 ]  }  ")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{\"a\": 1, \"a\": 2}")]), rt.V.str("|"), rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[\"a\\/b\", \"c\\\\d\", \"e\\nf\"]")])]));
      rt.frameLine(30);
      let v = rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("{\"a\": 1}")]);
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("k19|"), rt.typeOf(v), rt.V.str("|"), rt.isType(v, "Dictionary"), rt.V.str("|"), rt.typeOf(rt.wrapValue(rt.index(v, rt.V.str("a")))), rt.V.str("|"), rt.typeOf(rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[1]")])), rt.V.str("|"), rt.isType(rt.method(rt.nativeClass("JSON"), "parse_string", [rt.V.str("[1]")]), "Array")]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("k20|"), rt.method(j, "parse", [rt.V.str("{\"a\": 1}")]), rt.V.str("|"), rt.method(j, "get_data", []), rt.V.str("|"), rt.method(j, "get_error_line", []), rt.V.str("|"), rt.method(j, "get_error_message", [])]));
      rt.frameLine(33);
      let t = rt.method(rt.nativeClass("JSON"), "new", []);
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("k21|"), rt.ops.eq(j, t), rt.V.str("|"), rt.ops.eq(j, j), rt.V.str("|"), rt.strBuiltin([rt.nativeClass("JSON")]), rt.V.str("|"), rt.typeOf(rt.nativeClass("JSON"))]));
      rt.frameLine(35);
      let w = rt.method(rt.nativeClass("JSON"), "new", []);
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("k22|"), rt.method(w, "stringify", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str("|"), rt.method(w, "parse_string", [rt.V.str("[1]")]), rt.V.str("|"), rt.method(w, "stringify", [rt.V.array(rt.GArray.of([rt.V.float(1.5)])), rt.V.str(""), rt.V.bool(true), rt.V.bool(true)])]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("k23|"), rt.method(rt.nativeClass("JSON"), "stringify", [rt.method(rt.nativeClass("JSON"), "parse_string", [rt.method(rt.nativeClass("JSON"), "stringify", [d])])])]));
      rt.frameLine(38);
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
