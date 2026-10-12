// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = rt.strOf(rt.V.str("  abc  "));
    print(rt.showArgs([rt.V.str("A|"), rt.method(s, "strip_edges", []), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.bool(true)]), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.bool(false)]), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.bool(true), rt.V.bool(true)])]));
    print(rt.showArgs([rt.V.str("B|"), rt.method(s, "strip_edges", [rt.V.bool(true), rt.V.bool(false)]), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.bool(false), rt.V.bool(true)]), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.bool(false), rt.V.bool(false)]), rt.V.str("|"), rt.method(s, "strip_edges", [rt.V.int(1), rt.V.bool(false)])]));
    let n = rt.V.str("  x  ");
    print(rt.showArgs([rt.V.str("C|"), rt.method(n, "strip_edges", [rt.V.int(1), rt.V.int(0)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.int(0), rt.V.int(1)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.int(0), rt.V.int(0)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.int(2), rt.V.int(2)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.int((-1)), rt.V.int((-1))])]));
    print(rt.showArgs([rt.V.str("D|"), rt.method(n, "strip_edges", [rt.V.float(0.5), rt.V.float(0)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.float(1.5), rt.V.float(1.5)]), rt.V.str("|"), rt.method(n, "strip_edges", [rt.V.float(0), rt.V.float(0)])]));
    let t = rt.strOf(rt.V.str("\ta\tb\t"));
    print(rt.showArgs([rt.V.str("E|"), rt.method(t, "strip_edges", []), rt.V.str("|"), rt.method(t, "strip_edges", [rt.V.bool(false), rt.V.bool(true)]), rt.V.str("|"), rt.method(t, "strip_edges", [rt.V.bool(true), rt.V.bool(false)])]));
    let u = rt.strOf(rt.V.str("xabcx"));
    print(rt.showArgs([rt.V.str("F|"), rt.method(u, "strip_edges", [rt.V.bool(true), rt.V.int(1)]), rt.V.str("|"), rt.method(u, "strip_edges", [rt.V.bool(false), rt.V.bool(false)]), rt.V.str("|"), rt.method(u, "strip_edges", [])]));
    print(rt.showArgs([rt.V.str("G|"), rt.method(rt.method(rt.V.str(" \u0001a "), "strip_edges", []), "length", []), rt.V.str("|"), rt.method(rt.method(rt.V.str(" \u0001a "), "strip_edges", [rt.V.bool(false), rt.V.bool(true)]), "length", []), rt.V.str("|"), rt.method(rt.method(rt.V.str(" "), "strip_edges", [rt.V.bool(false), rt.V.bool(false)]), "length", [])]));
    let y = rt.strOf(rt.ops.add(rt.stringChr(rt.V.int(1)), rt.V.str("  abc  ")));
    print(rt.showArgs([rt.V.str("H|"), rt.method(rt.method(y, "strip_edges", []), "length", []), rt.V.str("|"), rt.method(rt.method(y, "strip_edges", [rt.V.bool(false), rt.V.bool(true)]), "length", []), rt.V.str("|"), rt.method(rt.method(y, "strip_edges", [rt.V.bool(true), rt.V.bool(false)]), "length", [])]));
    print(rt.showArgs([rt.V.str("I|"), rt.method(rt.method(rt.V.str(" abc"), "strip_edges", []), "length", []), rt.V.str("|"), rt.method(rt.method(rt.V.str(" abc "), "strip_edges", [rt.V.bool(false), rt.V.bool(true)]), "length", []), rt.V.str("|"), rt.method(rt.V.str("abc"), "strip_edges", [rt.V.bool(true), rt.V.bool(false)])]));
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
