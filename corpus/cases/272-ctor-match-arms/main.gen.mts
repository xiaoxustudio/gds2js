// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  v2(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  v2i(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.vector2iNew([rt.V.int(1), rt.V.int(2)])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  v3(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  v3i(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  col(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
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
      const __m0 = rt.matchPattern(p, rt.patConst(rt.stringNameCtor([rt.V.str("a")])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
        break;
      }
      const __m1 = rt.matchPattern(p, rt.patWild());
      if (__m1 !== null) {
        print(rt.showArgs([tag, rt.V.str("other")]));
        break;
      }
    } while (false);
  }
  
  cal(p: rt.Variant, tag: rt.Variant): void {
    do {
      const __m0 = rt.matchPattern(p, rt.patConst(rt.callableCtor([])));
      if (__m0 !== null) {
        print(rt.showArgs([tag, rt.V.str("arm")]));
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
    this.v2(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t01|"));
    this.v2(rt.vector2New([rt.V.int(1), rt.V.int(3)]), rt.V.str("t02|"));
    this.v2(rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.str("t03|"));
    this.v2(rt.V.str("s"), rt.V.str("t04|"));
    this.v2(rt.V.int(5), rt.V.str("t05|"));
    this.v2(rt.V.nil(), rt.V.str("t06|"));
    this.v2(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t07|"));
    this.v2i(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("t08|"));
    this.v2i(rt.vector2iNew([rt.V.int(1), rt.V.int(3)]), rt.V.str("t09|"));
    this.v2i(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t10|"));
    this.v2i(rt.V.int(5), rt.V.str("t11|"));
    this.v3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t12|"));
    this.v3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)]), rt.V.str("t13|"));
    this.v3(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t14|"));
    this.v3(rt.V.str("s"), rt.V.str("t15|"));
    this.v3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t16|"));
    this.v3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(4)]), rt.V.str("t17|"));
    this.v3i(rt.V.nil(), rt.V.str("t18|"));
    this.col(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.str("t19|"));
    this.col(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(5)]), rt.V.str("t20|"));
    this.col(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t21|"));
    this.col(rt.V.str("s"), rt.V.str("t22|"));
    this.snm(rt.V.str("a"), rt.V.str("t23|"));
    this.snm(rt.V.stringName("a"), rt.V.str("t24|"));
    this.snm(rt.stringNameCtor([rt.V.str("a")]), rt.V.str("t25|"));
    this.snm(rt.V.str("b"), rt.V.str("t26|"));
    this.snm(rt.V.int(5), rt.V.str("t27|"));
    this.cal(rt.callableCtor([]), rt.V.str("t28|"));
    this.cal(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t29|"));
    this.cal(rt.V.str("s"), rt.V.str("t30|"));
    this.cal(rt.V.int(5), rt.V.str("t31|"));
    this.cal(rt.V.nil(), rt.V.str("t32|"));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "v2": return rt.wrapValue(this.v2(args[0] as rt.Variant, args[1] as rt.Variant));
      case "v2i": return rt.wrapValue(this.v2i(args[0] as rt.Variant, args[1] as rt.Variant));
      case "v3": return rt.wrapValue(this.v3(args[0] as rt.Variant, args[1] as rt.Variant));
      case "v3i": return rt.wrapValue(this.v3i(args[0] as rt.Variant, args[1] as rt.Variant));
      case "col": return rt.wrapValue(this.col(args[0] as rt.Variant, args[1] as rt.Variant));
      case "snm": return rt.wrapValue(this.snm(args[0] as rt.Variant, args[1] as rt.Variant));
      case "cal": return rt.wrapValue(this.cal(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "v2": [2, 2], "v2i": [2, 2], "v3": [2, 2], "v3i": [2, 2], "col": [2, 2], "snm": [2, 2], "cal": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
