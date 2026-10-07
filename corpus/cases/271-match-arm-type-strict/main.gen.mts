// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  num(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.int(5)));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("int-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patLit(rt.V.float(5)));
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("float-arm")]));
        break;
      }
      const __m2 = rt.matchPattern(p, rt.patLit(rt.V.str("5")));
      if (__m2 !== null) {
        print(rt.showArgs([tag, rt.V.str("str-arm")]));
        break;
      }
      const __m3 = rt.matchPattern(p, rt.patLit(rt.V.stringName("5")));
      if (__m3 !== null) {
        print(rt.showArgs([tag, rt.V.str("sn-arm")]));
        break;
      }
      const __m4 = rt.matchPattern(p, rt.patWild());
      if (__m4 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  flt(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.float(5)));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("float-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  boo(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.bool(true)));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("bool-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  nul(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.nil()));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("null-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  str_(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.str("a")));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("str-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  snm(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patLit(rt.V.stringName("a")));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("sn-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  arr(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))]));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("int-array-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  narr(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patArray([rt.patArray([rt.patLit(rt.V.int(1))])]));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("nested-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  sar(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.str("a"))]));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("str-array-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  dct(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))]]));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("dict-arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  ndp(p: rt.Variant, tag: rt.Variant): void {
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
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.num(rt.V.int(5), rt.V.str("t01|"));
    this.num(rt.V.float(5), rt.V.str("t02|"));
    this.num(rt.V.str("5"), rt.V.str("t03|"));
    this.num(rt.V.stringName("5"), rt.V.str("t04|"));
    this.num(rt.V.bool(true), rt.V.str("t05|"));
    this.num(rt.V.nil(), rt.V.str("t06|"));
    this.num(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t07|"));
    this.num(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t08|"));
    this.num(rt.V.array(rt.GArray.of([rt.V.int(5)])), rt.V.str("t09|"));
    this.num(rt.dictOf([[rt.V.str("a"), rt.V.int(5)]]), rt.V.str("t10|"));
    this.num(rt.V.int(1), rt.V.str("t11|"));
    this.flt(rt.V.float(5), rt.V.str("t12|"));
    this.flt(rt.V.int(5), rt.V.str("t13|"));
    this.boo(rt.V.bool(true), rt.V.str("t14|"));
    this.boo(rt.V.int(1), rt.V.str("t15|"));
    this.nul(rt.V.nil(), rt.V.str("t16|"));
    this.nul(rt.V.str("x"), rt.V.str("t17|"));
    this.nul(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t18|"));
    this.str_(rt.V.str("a"), rt.V.str("t19|"));
    this.str_(rt.V.stringName("a"), rt.V.str("t20|"));
    this.str_(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t21|"));
    this.snm(rt.V.str("a"), rt.V.str("t22|"));
    this.snm(rt.V.stringName("a"), rt.V.str("t23|"));
    this.snm(rt.V.int(5), rt.V.str("t24|"));
    this.arr(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("t25|"));
    this.arr(rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("t26|"));
    this.arr(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("t27|"));
    this.narr(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), rt.V.str("t28|"));
    this.narr(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.float(1)]))])), rt.V.str("t29|"));
    this.sar(rt.V.array(rt.GArray.of([rt.V.str("a")])), rt.V.str("t30|"));
    this.sar(rt.V.array(rt.GArray.of([rt.V.stringName("a")])), rt.V.str("t31|"));
    this.dct(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.str("t32|"));
    this.dct(rt.dictOf([[rt.V.str("a"), rt.V.float(1)]]), rt.V.str("t33|"));
    this.dct(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), rt.V.str("t34|"));
    this.dct(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.str("t35|"));
    this.ndp(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t36|"));
    this.ndp(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t37|"));
    this.ndp(rt.V.str("a/b"), rt.V.str("t38|"));
    this.ndp(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t39|"));
    this.ndp(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t40|"));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "num": return rt.wrapValue(this.num(args[0] as rt.Variant, args[1] as rt.Variant));
      case "flt": return rt.wrapValue(this.flt(args[0] as rt.Variant, args[1] as rt.Variant));
      case "boo": return rt.wrapValue(this.boo(args[0] as rt.Variant, args[1] as rt.Variant));
      case "nul": return rt.wrapValue(this.nul(args[0] as rt.Variant, args[1] as rt.Variant));
      case "str_": return rt.wrapValue(this.str_(args[0] as rt.Variant, args[1] as rt.Variant));
      case "snm": return rt.wrapValue(this.snm(args[0] as rt.Variant, args[1] as rt.Variant));
      case "arr": return rt.wrapValue(this.arr(args[0] as rt.Variant, args[1] as rt.Variant));
      case "narr": return rt.wrapValue(this.narr(args[0] as rt.Variant, args[1] as rt.Variant));
      case "sar": return rt.wrapValue(this.sar(args[0] as rt.Variant, args[1] as rt.Variant));
      case "dct": return rt.wrapValue(this.dct(args[0] as rt.Variant, args[1] as rt.Variant));
      case "ndp": return rt.wrapValue(this.ndp(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "num": [2, 2], "flt": [2, 2], "boo": [2, 2], "nul": [2, 2], "str_": [2, 2], "snm": [2, 2], "arr": [2, 2], "narr": [2, 2], "sar": [2, 2], "dct": [2, 2], "ndp": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
