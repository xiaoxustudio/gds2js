// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let sn = rt.toStringNameSlot(rt.V.stringName("abc"));
    print(rt.showArgs([rt.method(rt.V.str("abc"), "hash", []), rt.V.str(" "), rt.method(rt.V.str(""), "hash", []), rt.V.str(" "), rt.method(rt.V.str("a"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("Hello, World!"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("你好"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("😀"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("😀😁"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("￿"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("𐀀"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("abcdefghijklmnopqrstuvwxyz"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("the quick brown fox jumps over the lazy dog"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("0123456789"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("A"), "hash", []), rt.V.str(" "), rt.method(rt.V.str(" "), "hash", []), rt.V.str(" "), rt.method(rt.V.str("abcabc"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("0"), "hash", []), rt.V.str(" "), rt.method(rt.V.str("z"), "hash", [])]));
    print(rt.showArgs([rt.method(rt.V.str("\t\n\\\""), "hash", []), rt.V.str(" "), rt.method(sn, "hash", []), rt.V.str(" "), rt.variantHash([rt.V.str("abc")]), rt.V.str(" "), rt.variantHash([sn]), rt.V.str(" "), rt.variantHash([rt.V.str("")]), rt.V.str(" "), rt.variantHash([rt.V.str("你好")])]));
    print(rt.showArgs([rt.variantHash([rt.V.bool(true)]), rt.V.str(" "), rt.variantHash([rt.V.bool(false)]), rt.V.str(" "), rt.variantHash([rt.V.nil()])]));
    print(rt.showArgs([rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abc"), "hash", [])), rt.V.str(" "), rt.ops.lt(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", [])), rt.V.str(" "), rt.ops.eq(rt.method(rt.V.str("abc"), "hash", []), rt.method(rt.V.str("abd"), "hash", []))]));
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
