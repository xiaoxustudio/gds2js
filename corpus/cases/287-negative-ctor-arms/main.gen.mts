// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let a = rt.vector2New([rt.V.int((-1)), rt.V.int(2)]);
    do {
      const __m0 = rt.matchPattern(a, rt.patConst(rt.vector2New([rt.V.int((-1)), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("A|v2 neg hit")]));
        break;
      }
      const __m1 = rt.matchPattern(a, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)])));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("A|other")]));
        break;
      }
      const __m2 = rt.matchPattern(a, rt.patWild());
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("A|miss")]));
        break;
      }
    } while (false);
    let b = rt.vector2New([rt.V.int(1), rt.V.int(2)]);
    do {
      const __m0 = rt.matchPattern(b, rt.patConst(rt.vector2New([rt.V.int((-1)), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("B|wrong")]));
        break;
      }
      const __m1 = rt.matchPattern(b, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("B|miss")]));
        break;
      }
    } while (false);
    let c = rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))]);
    do {
      const __m0 = rt.matchPattern(c, rt.patConst(rt.vector3New([rt.V.int((-1)), rt.V.int((-2)), rt.V.int((-3))])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("C|v3 neg hit")]));
        break;
      }
      const __m1 = rt.matchPattern(c, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("C|miss")]));
        break;
      }
    } while (false);
    let d = rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)]);
    do {
      const __m0 = rt.matchPattern(d, rt.patConst(rt.vector2iNew([rt.V.int((-1)), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("D|v2i neg hit")]));
        break;
      }
      const __m1 = rt.matchPattern(d, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("D|miss")]));
        break;
      }
    } while (false);
    let e = rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(1)]);
    do {
      const __m0 = rt.matchPattern(e, rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("E|c3 hit")]));
        break;
      }
      const __m1 = rt.matchPattern(e, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("E|miss")]));
        break;
      }
    } while (false);
    let f = rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]);
    do {
      const __m0 = rt.matchPattern(f, rt.patConst(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("F|c4 hit")]));
        break;
      }
      const __m1 = rt.matchPattern(f, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("F|miss")]));
        break;
      }
    } while (false);
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
