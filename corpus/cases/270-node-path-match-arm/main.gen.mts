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

  g(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "g");
    try {
      rt.frameLine(4);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([tag, rt.V.str("np-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patLit(rt.V.str("a/b")));
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([tag, rt.V.str("string-arm")]));
          break;
        }
        const __m2 = rt.matchPattern(p, rt.patLit(rt.V.stringName("a/b")));
        if (__m2 !== null) {
          rt.frameLine(10);
          print(rt.showArgs([tag, rt.V.str("stringname-arm")]));
          break;
        }
        const __m3 = rt.matchPattern(p, rt.patLit(rt.V.int(5)));
        if (__m3 !== null) {
          rt.frameLine(12);
          print(rt.showArgs([tag, rt.V.str("int-arm")]));
          break;
        }
        const __m4 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))]));
        if (__m4 !== null) {
          rt.frameLine(14);
          print(rt.showArgs([tag, rt.V.str("array-arm")]));
          break;
        }
        const __m5 = rt.matchPattern(p, rt.patWild());
        if (__m5 !== null) {
          rt.frameLine(16);
          print(rt.showArgs([tag, rt.V.str("other")]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  h(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "h");
    try {
      rt.frameLine(19);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.str("a/b")));
        if (__m0 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([tag, rt.V.str("string-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(23);
          print(rt.showArgs([tag, rt.V.str("other")]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  n(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "n");
    try {
      rt.frameLine(26);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
        if (__m0 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([tag, rt.V.str("np-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(30);
          print(rt.showArgs([tag, rt.V.str("other")]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  c2(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "c2");
    try {
      rt.frameLine(33);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
        if (__m0 !== null) {
          rt.frameLine(35);
          print(rt.showArgs([tag, rt.V.str("np-call-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(37);
          print(rt.showArgs([tag, rt.V.str("other")]));
          break;
        }
      } while (false);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(40);
      this.g(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t01|"));
      rt.frameLine(41);
      this.g(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t02|"));
      rt.frameLine(42);
      this.g(rt.V.str("a/b"), rt.V.str("t03|"));
      rt.frameLine(43);
      this.g(rt.V.stringName("a/b"), rt.V.str("t04|"));
      rt.frameLine(44);
      this.g(rt.V.int(5), rt.V.str("t05|"));
      rt.frameLine(45);
      this.g(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("t06|"));
      rt.frameLine(46);
      this.g(rt.nodePathCtor([rt.V.str("x")]), rt.V.str("t07|"));
      rt.frameLine(47);
      this.g(rt.V.str(""), rt.V.str("t08|"));
      rt.frameLine(48);
      this.h(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t09|"));
      rt.frameLine(49);
      this.h(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t10|"));
      rt.frameLine(50);
      this.h(rt.V.str("a/b"), rt.V.str("t11|"));
      rt.frameLine(51);
      this.h(rt.V.stringName("a/b"), rt.V.str("t12|"));
      rt.frameLine(52);
      this.n(rt.V.str("a/b"), rt.V.str("t13|"));
      rt.frameLine(53);
      this.n(rt.V.stringName("a/b"), rt.V.str("t14|"));
      rt.frameLine(54);
      this.n(rt.V.int(5), rt.V.str("t15|"));
      rt.frameLine(55);
      this.n(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t16|"));
      rt.frameLine(56);
      this.c2(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t17|"));
      rt.frameLine(57);
      this.c2(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t18|"));
      rt.frameLine(58);
      this.c2(rt.V.str("a/b"), rt.V.str("t19|"));
      rt.frameLine(59);
      this.c2(rt.V.stringName("a/b"), rt.V.str("t20|"));
      rt.frameLine(60);
      this.c2(rt.V.int(5), rt.V.str("t21|"));
      rt.frameLine(61);
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
