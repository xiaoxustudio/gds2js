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
      let e = rt.method(rt.nativeClass("Expression"), "new", []);
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("e1|"), rt.method(e, "parse", [rt.V.str("1+2*3")]), rt.V.str("|"), rt.method(e, "execute", [])]));
      rt.frameLine(6);
      print(rt.showArgs([rt.V.str("e2|"), rt.method(e, "parse", [rt.V.str("a*2+1"), rt.V.array(rt.GArray.of([rt.V.str("a")]))]), rt.V.str("|"), rt.method(e, "execute", [rt.V.array(rt.GArray.of([rt.V.int(3)]))])]));
      rt.frameLine(7);
      print(rt.showArgs([rt.V.str("e3|"), rt.method(e, "parse", [rt.V.str("a + b"), rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]))]), rt.V.str("|"), rt.method(e, "execute", [rt.V.array(rt.GArray.of([rt.V.str("x"), rt.V.str("y")]))])]));
      rt.frameLine(8);
      let g = rt.method(rt.nativeClass("Expression"), "new", []);
      rt.frameLine(9);
      print(rt.showArgs([rt.V.str("g1|"), rt.method(g, "parse", [rt.V.str("1 < 2 and not false")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(10);
      print(rt.showArgs([rt.V.str("g2|"), rt.method(g, "parse", [rt.V.str("1 if true else 2")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("g3|"), rt.method(g, "parse", [rt.V.str("[1, 2, 3][1]")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(12);
      print(rt.showArgs([rt.V.str("g4|"), rt.method(g, "parse", [rt.V.str("{\"a\": 5}[\"a\"]")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(13);
      print(rt.showArgs([rt.V.str("g5|"), rt.method(g, "parse", [rt.V.str("abs(-3)")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("g6|"), rt.method(g, "parse", [rt.V.str("str(12)")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(15);
      print(rt.showArgs([rt.V.str("g7|"), rt.method(g, "parse", [rt.V.str("2 ** 10")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("g8|"), rt.method(g, "parse", [rt.V.str("7 / 2")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(17);
      print(rt.showArgs([rt.V.str("g9|"), rt.method(g, "parse", [rt.V.str("7.0 / 2")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("g10|"), rt.method(g, "parse", [rt.V.str("PI")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("g11|"), rt.method(g, "parse", [rt.V.str("Vector2(1, 2)")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("g12|"), rt.method(g, "parse", [rt.V.str("1"), rt.V.array(rt.GArray.of([rt.V.str("a")]))]), rt.V.str("|"), rt.method(g, "execute", [rt.V.array(rt.GArray.of([rt.V.int(1)]))])]));
      rt.frameLine(21);
      print(rt.showArgs([rt.V.str("g13|"), rt.method(g, "parse", [rt.V.str("null")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("g14|"), rt.method(g, "parse", [rt.V.str("!true")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(23);
      print(rt.showArgs([rt.V.str("g15|"), rt.method(g, "parse", [rt.V.str("not true")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("g16|"), rt.method(g, "parse", [rt.V.str("1 in [1, 2]")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("g17|"), rt.method(g, "parse", [rt.V.str("min(3, 1, 2)")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("g18|"), rt.method(g, "parse", [rt.V.str("maxf(1.5, 2.5)")]), rt.V.str("|"), rt.method(g, "execute", [])]));
      rt.frameLine(27);
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
