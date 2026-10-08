// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  g(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("np-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patLit(rt.V.str("a/b")));
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("string-arm")]));
        break;
      }
      const __m2 = rt.matchPattern(p, rt.patLit(rt.V.stringName("a/b")));
      if (__m2 !== null) {
        print(rt.showArgs([tag, rt.V.str("stringname-arm")]));
        break;
      }
      const __m3 = rt.matchPattern(p, rt.patLit(rt.V.int(5)));
      if (__m3 !== null) {
        print(rt.showArgs([tag, rt.V.str("int-arm")]));
        break;
      }
      const __m4 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))]));
      if (__m4 !== null) {
        print(rt.showArgs([tag, rt.V.str("array-arm")]));
        break;
      }
      const __m5 = rt.matchPattern(p, rt.patWild());
      if (__m5 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  h(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.str("a/b")));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("string-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  n(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("np-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  c2(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("np-call-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.g(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t01|"));
    this.g(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t02|"));
    this.g(rt.V.str("a/b"), rt.V.str("t03|"));
    this.g(rt.V.stringName("a/b"), rt.V.str("t04|"));
    this.g(rt.V.int(5), rt.V.str("t05|"));
    this.g(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("t06|"));
    this.g(rt.nodePathCtor([rt.V.str("x")]), rt.V.str("t07|"));
    this.g(rt.V.str(""), rt.V.str("t08|"));
    this.h(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t09|"));
    this.h(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t10|"));
    this.h(rt.V.str("a/b"), rt.V.str("t11|"));
    this.h(rt.V.stringName("a/b"), rt.V.str("t12|"));
    this.n(rt.V.str("a/b"), rt.V.str("t13|"));
    this.n(rt.V.stringName("a/b"), rt.V.str("t14|"));
    this.n(rt.V.int(5), rt.V.str("t15|"));
    this.n(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t16|"));
    this.c2(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t17|"));
    this.c2(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t18|"));
    this.c2(rt.V.str("a/b"), rt.V.str("t19|"));
    this.c2(rt.V.stringName("a/b"), rt.V.str("t20|"));
    this.c2(rt.V.int(5), rt.V.str("t21|"));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "g": return rt.wrapValue(this.g(args[0] as rt.Variant, args[1] as rt.Variant));
      case "h": return rt.wrapValue(this.h(args[0] as rt.Variant, args[1] as rt.Variant));
      case "n": return rt.wrapValue(this.n(args[0] as rt.Variant, args[1] as rt.Variant));
      case "c2": return rt.wrapValue(this.c2(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "g": [2, 2], "h": [2, 2], "n": [2, 2], "c2": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
