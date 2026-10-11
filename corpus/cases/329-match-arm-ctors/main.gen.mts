// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  cls(s: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2-eq")]));
        break;
      }
      const __m1 = rt.matchPattern(s, rt.patConst(rt.vector2New([])));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2-zero")]));
        break;
      }
      const __m2 = rt.matchPattern(s, rt.patWild());
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2-none")]));
        break;
      }
    } while (false);
  }
  
  nums(s: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(s, rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("C|color-123")]));
        break;
      }
      const __m1 = rt.matchPattern(s, rt.patConst(rt.colorNew([rt.V.str("ff0000")])));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("C|color-hex")]));
        break;
      }
      const __m2 = rt.matchPattern(s, rt.patConst(rt.colorNew([])));
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("C|color-zero")]));
        break;
      }
      const __m3 = rt.matchPattern(s, rt.patWild());
      if (__m3 !== null) {
        print(rt.showArgs([rt.V.str("C|color-none")]));
        break;
      }
    } while (false);
  }
  
  texts(s: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(s, rt.patConst(rt.stringNameCtor([rt.V.str("a")])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("C|sn-a")]));
        break;
      }
      const __m1 = rt.matchPattern(s, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("C|np-ab")]));
        break;
      }
      const __m2 = rt.matchPattern(s, rt.patConst(rt.stringCtor([rt.V.str("a")])));
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("C|str-a")]));
        break;
      }
      const __m3 = rt.matchPattern(s, rt.patWild());
      if (__m3 !== null) {
        print(rt.showArgs([rt.V.str("C|text-none")]));
        break;
      }
    } while (false);
  }
  
  mixed(s: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.float(2.5)])));
      if (__m0 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2-mix")]));
        break;
      }
      const __m1 = rt.matchPattern(s, rt.patConst(rt.vector2iNew([rt.V.int(3), rt.V.int(4)])));
      if (__m1 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2i-34")]));
        break;
      }
      const __m2 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.vector2New([rt.V.int(5), rt.V.int(6)])])));
      if (__m2 !== null) {
        print(rt.showArgs([rt.V.str("C|vec2-copy")]));
        break;
      }
      const __m3 = rt.matchPattern(s, rt.patConst(rt.callableCtor([])));
      if (__m3 !== null) {
        print(rt.showArgs([rt.V.str("C|callable")]));
        break;
      }
      const __m4 = rt.matchPattern(s, rt.patWild());
      if (__m4 !== null) {
        print(rt.showArgs([rt.V.str("C|mixed-none")]));
        break;
      }
    } while (false);
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.cls(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
    this.cls(rt.vector2New([rt.V.int(0), rt.V.int(0)]));
    this.cls(rt.vector2New([rt.V.int(1), rt.V.int(3)]));
    this.nums(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(0), rt.V.int(1)]));
    this.nums(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
    this.nums(rt.colorNew([rt.V.str("ff0000")]));
    this.nums(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]));
    this.texts(rt.V.stringName("a"));
    this.texts(rt.nodePathCtor([rt.V.str("a/b")]));
    this.texts(rt.V.str("a"));
    this.texts(rt.V.int(1));
    this.mixed(rt.vector2New([rt.V.int(1), rt.V.float(2.5)]));
    this.mixed(rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
    this.mixed(rt.vector2New([rt.V.int(5), rt.V.int(6)]));
    this.mixed(rt.callableCtor([]));
    this.mixed(rt.V.int(1));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "cls": return rt.wrapValue(this.cls(args[0] as rt.Variant));
      case "nums": return rt.wrapValue(this.nums(args[0] as rt.Variant));
      case "texts": return rt.wrapValue(this.texts(args[0] as rt.Variant));
      case "mixed": return rt.wrapValue(this.mixed(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "cls": [1, 1], "nums": [1, 1], "texts": [1, 1], "mixed": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
