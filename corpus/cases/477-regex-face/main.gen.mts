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
      let r = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("k01|"), rt.ops.neq(r, rt.V.nil()), rt.V.str("|"), rt.typeOf(r), rt.V.str("|"), rt.method(r, "get_class", []), rt.V.str("|"), rt.isType(r, "RegEx"), rt.V.str("|"), rt.isType(r, "RefCounted"), rt.V.str("|"), rt.isType(r, "Object"), rt.V.str("|"), rt.method(r, "is_class", [rt.V.str("RegEx")]), rt.V.str("|"), rt.method(r, "is_valid", []), rt.V.str("|"), rt.method(r, "get_pattern", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("k02|"), rt.method(r, "compile", [rt.V.str("(\\w+)@(\\w+)")]), rt.V.str("|"), rt.method(r, "is_valid", []), rt.V.str("|"), rt.method(r, "get_pattern", []), rt.V.str("|"), rt.method(r, "get_names", []), rt.V.str("|"), rt.method(r, "get_group_count", [])]));
      rt.frameLine(7);
      let v = rt.V.str("mail bob@site x");
      rt.frameLine(8);
      let s = rt.method(r, "search", [v]);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("k03|"), rt.ops.neq(s, rt.V.nil()), rt.V.str("|"), rt.typeOf(s), rt.V.str("|"), rt.method(s, "get_class", []), rt.V.str("|"), rt.isType(s, "RegExMatch"), rt.V.str("|"), rt.isType(s, "RefCounted"), rt.V.str("|"), rt.method(s, "is_class", [rt.V.str("RegEx")]), rt.V.str("|"), rt.method(s, "get_group_count", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("k04|"), rt.method(s, "get_start", []), rt.V.str("|"), rt.method(s, "get_end", []), rt.V.str("|"), rt.method(s, "get_string", []), rt.V.str("|"), rt.method(s, "get_strings", []), rt.V.str("|"), rt.method(s, "get_subject", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("k05|"), rt.method(s, "get_start", [rt.V.int(1)]), rt.V.str("|"), rt.method(s, "get_end", [rt.V.int(1)]), rt.V.str("|"), rt.method(s, "get_string", [rt.V.int(1)]), rt.V.str("|"), rt.method(s, "get_start", [rt.V.int(2)]), rt.V.str("|"), rt.method(s, "get_end", [rt.V.int(2)]), rt.V.str("|"), rt.method(s, "get_string", [rt.V.int(2)]), rt.V.str("|"), rt.method(s, "get_string", [rt.V.int(3)]), rt.V.str("|"), rt.method(s, "get_start", [rt.V.int(7)]), rt.V.str("|"), rt.method(s, "get_end", [rt.V.int(7)])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("k06|"), rt.method(s, "get_names", []), rt.V.str("|"), rt.method(s, "get_strings", [])]));
      rt.frameLine(13);
      let n = rt.method(r, "search", [rt.V.str("zzz")]);
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("k07|"), rt.ops.eq(n, rt.V.nil()), rt.V.str("|"), rt.typeOf(n)]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("k08|"), rt.method(r, "sub", [v, rt.V.str("#")]), rt.V.str("|"), rt.method(r, "sub", [v, rt.V.str("#"), rt.V.int(1)]), rt.V.str("|"), rt.method(r, "sub", [v, rt.V.str("[$0]"), rt.V.int(1)]), rt.V.str("|"), rt.method(r, "sub", [v, rt.V.str("<$1>"), rt.V.int(1)])]));
      rt.frameLine(16);
      let o = rt.method(r, "search", [v, rt.V.int(6)]);
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("k09|"), rt.method(o, "get_start", []), rt.V.str("|"), rt.method(o, "get_string", []), rt.V.str("|"), rt.method(rt.method(r, "search", [v, rt.V.int(2)]), "get_start", [])]));
      rt.frameLine(19);
      let nr = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(20);
      rt.method(nr, "compile", [rt.V.str("(?<head>\\w+): (?<tail>\\w+)")]);
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("k10|"), rt.method(nr, "get_names", []), rt.V.str("|"), rt.method(nr, "get_group_count", []), rt.V.str("|"), rt.method(nr, "get_pattern", [])]));
      rt.frameLine(22);
      let ns = rt.method(nr, "search", [rt.V.str("xx head: yy tail zz"), rt.V.int(3)]);
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("k11|"), rt.method(ns, "get_subject", []), rt.V.str("|"), rt.method(ns, "get_names", []), rt.V.str("|"), rt.method(ns, "get_start", []), rt.V.str("|"), rt.method(ns, "get_end", []), rt.V.str("|"), rt.method(ns, "get_string", []), rt.V.str("|"), rt.method(ns, "get_strings", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("k12|"), rt.method(ns, "get_string", [rt.V.int(1)]), rt.V.str("|"), rt.method(ns, "get_string", [rt.V.int(2)]), rt.V.str("|"), rt.method(ns, "get_start", [rt.V.int(1)]), rt.V.str("|"), rt.method(ns, "get_end", [rt.V.int(2)]), rt.V.str("|"), rt.method(ns, "get_start", [rt.V.int(3)]), rt.V.str("|"), rt.method(ns, "get_end", [rt.V.int(3)])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("k13|"), rt.method(nr, "sub", [rt.V.str("xx head: yy tail zz"), rt.V.str("[${tail}]-${head}"), rt.V.int(1)]), rt.V.str("|"), rt.method(nr, "sub", [rt.V.str("xx head: yy tail zz"), rt.V.str("$0"), rt.V.int(1)])]));
      rt.frameLine(27);
      let er = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(28);
      rt.method(er, "compile", [rt.V.str("a*")]);
      rt.frameLine(29);
      let ev = rt.V.str("baaa");
      rt.frameLine(30);
      let el = rt.V.array(rt.GArray.of([]));
      rt.frameLine(31);
      for (let e of rt.iter(rt.method(er, "search_all", [ev]))) {
        rt.frameLine(32);
        rt.method(el, "append", [rt.V.array(rt.GArray.of([rt.method(e, "get_start", []), rt.method(e, "get_end", []), rt.method(e, "get_string", [])]))]);
      }
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("k14|"), el]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("k15|"), rt.method(er, "sub", [ev, rt.V.str("#")]), rt.V.str("|"), rt.method(er, "sub", [ev, rt.V.str("#"), rt.V.int(1)]), rt.V.str("|"), rt.method(er, "sub", [ev, rt.V.str("[$0]"), rt.V.int(1)]), rt.V.str("|"), rt.method(er, "sub", [ev, rt.V.str("$$"), rt.V.int(1)])]));
      rt.frameLine(36);
      let ur = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(37);
      rt.method(ur, "compile", [rt.V.str("(a)?b")]);
      rt.frameLine(38);
      let us = rt.method(ur, "search", [rt.V.str("b")]);
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("k16|"), rt.method(us, "get_strings", []), rt.V.str("|"), rt.method(us, "get_string", [rt.V.int(1)]), rt.V.str("|"), rt.method(us, "get_start", [rt.V.int(1)]), rt.V.str("|"), rt.method(us, "get_end", [rt.V.int(1)]), rt.V.str("|"), rt.method(us, "get_start", []), rt.V.str("|"), rt.method(us, "get_end", [])]));
      rt.frameLine(41);
      let pr = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(42);
      rt.method(pr, "compile", [rt.V.str("[[:alpha:]]+")]);
      rt.frameLine(43);
      print(rt.showArgs([rt.V.str("k17|"), rt.method(pr, "sub", [rt.V.str("ab1cd2"), rt.V.str("#"), rt.V.int(1)]), rt.V.str("|"), rt.method(rt.method(pr, "search", [rt.V.str("ab1")]), "get_string", []), rt.V.str("|"), rt.method(pr, "get_group_count", []), rt.V.str("|"), rt.method(pr, "get_names", [])]));
      rt.frameLine(44);
      let ir = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(45);
      rt.method(ir, "compile", [rt.V.str("(?i)abc")]);
      rt.frameLine(46);
      print(rt.showArgs([rt.V.str("k18|"), rt.method(rt.method(ir, "search", [rt.V.str("zABCz")]), "get_string", []), rt.V.str("|"), rt.method(ir, "sub", [rt.V.str("zabcz"), rt.V.str("#"), rt.V.int(1)]), rt.V.str("|"), rt.method(ir, "get_group_count", [])]));
      rt.frameLine(47);
      let ar = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(48);
      rt.method(ar, "compile", [rt.V.str("a|ab")]);
      rt.frameLine(49);
      print(rt.showArgs([rt.V.str("k19|"), rt.method(rt.method(ar, "search", [rt.V.str("ab")]), "get_string", []), rt.V.str("|"), rt.method(ar, "sub", [rt.V.str("ab"), rt.V.str("#"), rt.V.int(1)]), rt.V.str("|"), rt.method(rt.method(ar, "search_all", [rt.V.str("aab")]), "size", [])]));
      rt.frameLine(51);
      let br = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(52);
      rt.method(br, "compile", [rt.V.str("(?<name>\\w+)-\\k<name>")]);
      rt.frameLine(53);
      print(rt.showArgs([rt.V.str("k20|"), rt.method(br, "get_names", []), rt.V.str("|"), rt.method(br, "get_group_count", []), rt.V.str("|"), rt.method(rt.method(br, "search", [rt.V.str("aa-a")]), "get_string", []), rt.V.str("|"), rt.method(rt.method(br, "search", [rt.V.str("aa-a")]), "get_strings", [])]));
      rt.frameLine(54);
      let lr = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(55);
      rt.method(lr, "compile", [rt.V.str("a(?=b)")]);
      rt.frameLine(56);
      print(rt.showArgs([rt.V.str("k21|"), rt.method(rt.method(lr, "search", [rt.V.str("ab")]), "get_string", []), rt.V.str("|"), rt.method(rt.method(lr, "search", [rt.V.str("ab")]), "get_end", []), rt.V.str("|"), rt.method(lr, "sub", [rt.V.str("ab ab"), rt.V.str("#"), rt.V.int(1)])]));
      rt.frameLine(58);
      let dr = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(59);
      rt.method(dr, "compile", [rt.V.str("^\\d+$")]);
      rt.frameLine(60);
      print(rt.showArgs([rt.V.str("k22|"), rt.method(rt.method(dr, "search", [rt.V.str("123")]), "get_string", []), rt.V.str("|"), rt.ops.eq(rt.method(dr, "search", [rt.V.str("12a")]), rt.V.nil()), rt.V.str("|"), rt.method(dr, "sub", [rt.V.str("123"), rt.V.str("#"), rt.V.int(1)])]));
      rt.frameLine(61);
      rt.method(dr, "clear", []);
      rt.frameLine(62);
      print(rt.showArgs([rt.V.str("k23|"), rt.method(dr, "is_valid", []), rt.V.str("|"), rt.method(dr, "get_pattern", [])]));
      rt.frameLine(64);
      let rr = rt.method(rt.nativeClass("RegEx"), "new", []);
      rt.frameLine(65);
      rt.method(rr, "compile", [rt.V.str("\\w+")]);
      rt.frameLine(66);
      let rv = rt.V.str("aa bb cc");
      rt.frameLine(67);
      let rl = rt.V.array(rt.GArray.of([]));
      rt.frameLine(68);
      for (let e of rt.iter(rt.method(rr, "search_all", [rv, rt.V.int(3)]))) {
        rt.frameLine(69);
        rt.method(rl, "append", [rt.V.array(rt.GArray.of([rt.method(e, "get_start", []), rt.method(e, "get_string", [])]))]);
      }
      rt.frameLine(70);
      print(rt.showArgs([rt.V.str("k24|"), rl, rt.V.str("|"), rt.method(rr, "sub", [rv, rt.V.str("#"), rt.V.int(0), rt.V.int(3)]), rt.V.str("|"), rt.method(rr, "sub", [rv, rt.V.str("#"), rt.V.int(1), rt.V.int(3)]), rt.V.str("|"), rt.method(rt.method(rr, "search", [rv, rt.V.int(6)]), "get_start", [])]));
      rt.frameLine(71);
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
