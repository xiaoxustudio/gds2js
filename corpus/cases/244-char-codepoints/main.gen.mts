// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("c01|"), rt.stringChr(rt.V.int(65)), rt.V.str("|"), rt.stringChr(rt.V.int(97)), rt.V.str("|"), rt.stringChr(rt.V.int(233)), rt.V.str("|"), rt.stringChr(rt.V.int(20013))]));
    print(rt.showArgs([rt.V.str("c02|"), rt.method(rt.stringChr(rt.V.int(65)), "length", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(233)), "length", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "length", [])]));
    print(rt.showArgs([rt.V.str("c03|"), rt.method(rt.stringChr(rt.V.int(1)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(65)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("c04|"), rt.method(rt.stringChr(rt.V.int(127)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(128)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(32)), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("c05|"), rt.method(rt.stringChr(rt.V.float(1.5)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.float(2.9)), "unicode_at", [rt.V.int(0)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(1114111)), "unicode_at", [rt.V.int(0)])]));
    print(rt.showArgs([rt.V.str("c06|"), rt.ops.eq(rt.stringChr(rt.V.int(65)), rt.V.str("A")), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(97)), rt.V.str("a")), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(233)), rt.V.str("é"))]));
    print(rt.showArgs([rt.V.str("c07|"), rt.typeOf(rt.stringChr(rt.V.int(65))), rt.V.str("|"), rt.ops.eq(rt.stringStatic("chr", [rt.V.int(65)]), rt.stringChr(rt.V.int(65))), rt.V.str("|"), rt.ops.eq(rt.stringChr(rt.V.int(65)), rt.stringChr(rt.V.int(97)))]));
    print(rt.showArgs([rt.V.str("c08|"), rt.ops.add(rt.ops.add(rt.stringChr(rt.V.int(65)), rt.V.str("/")), rt.stringChr(rt.V.int(97))), rt.V.str("|"), rt.method(rt.ops.add(rt.V.str("x"), rt.stringChr(rt.V.int(1114111))), "length", [])]));
    print(rt.showArgs([rt.V.str("c09|"), rt.method(rt.stringChr(rt.V.int(65)), "to_utf8_buffer", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(233)), "to_utf8_buffer", []), rt.V.str("|"), rt.method(rt.method(rt.stringChr(rt.V.int(1114111)), "to_utf8_buffer", []), "size", [])]));
    print(rt.showArgs([rt.V.str("c10|"), rt.method(rt.stringChr(rt.V.int(10)), "c_escape", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(65)), "c_escape", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(92)), "c_escape", [])]));
    print(rt.showArgs([rt.V.str("c11|"), rt.V.array(rt.GArray.of([rt.stringChr(rt.V.int(65)), rt.stringChr(rt.V.int(97))])), rt.V.str("|"), rt.method(rt.dictOf([[rt.stringChr(rt.V.int(65)), rt.V.int(1)]]), "has", [rt.V.str("A")]), rt.V.str("|"), rt.V.str(rt.varToStr(rt.stringChr(rt.V.int(97))))]));
    print(rt.showArgs([rt.V.str("c12|"), rt.method(rt.stringChr(rt.V.int(65)), "to_upper", []), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(97)), "repeat", [rt.V.int(2)]), rt.V.str("|"), rt.method(rt.stringChr(rt.V.int(50)), "to_int", [])]));
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
