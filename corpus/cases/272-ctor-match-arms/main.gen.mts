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

  v2(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "v2");
    try {
      rt.frameLine(4);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)])));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(8);
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
  
  v2i(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "v2i");
    try {
      rt.frameLine(11);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.vector2iNew([rt.V.int(1), rt.V.int(2)])));
        if (__m0 !== null) {
          rt.frameLine(13);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(15);
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
  
  v3(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "v3");
    try {
      rt.frameLine(18);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
        if (__m0 !== null) {
          rt.frameLine(20);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(22);
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
  
  v3i(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "v3i");
    try {
      rt.frameLine(25);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
        if (__m0 !== null) {
          rt.frameLine(27);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(29);
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
  
  col(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "col");
    try {
      rt.frameLine(32);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)])));
        if (__m0 !== null) {
          rt.frameLine(34);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(36);
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
  
  snm(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "snm");
    try {
      rt.frameLine(39);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.stringNameCtor([rt.V.str("a")])));
        if (__m0 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(43);
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
  
  cal(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "cal");
    try {
      rt.frameLine(46);
      do {
        const __m0 = rt.matchPattern(p, rt.patConst(rt.callableCtor([])));
        if (__m0 !== null) {
          rt.frameLine(48);
          print(rt.showArgs([tag, rt.V.str("arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(50);
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
      rt.frameLine(53);
      this.v2(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t01|"));
      rt.frameLine(54);
      this.v2(rt.vector2New([rt.V.int(1), rt.V.int(3)]), rt.V.str("t02|"));
      rt.frameLine(55);
      this.v2(rt.vector2New([rt.V.float(1), rt.V.float(2)]), rt.V.str("t03|"));
      rt.frameLine(56);
      this.v2(rt.V.str("s"), rt.V.str("t04|"));
      rt.frameLine(57);
      this.v2(rt.V.int(5), rt.V.str("t05|"));
      rt.frameLine(58);
      this.v2(rt.V.nil(), rt.V.str("t06|"));
      rt.frameLine(59);
      this.v2(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t07|"));
      rt.frameLine(60);
      this.v2i(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]), rt.V.str("t08|"));
      rt.frameLine(61);
      this.v2i(rt.vector2iNew([rt.V.int(1), rt.V.int(3)]), rt.V.str("t09|"));
      rt.frameLine(62);
      this.v2i(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t10|"));
      rt.frameLine(63);
      this.v2i(rt.V.int(5), rt.V.str("t11|"));
      rt.frameLine(64);
      this.v3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t12|"));
      rt.frameLine(65);
      this.v3(rt.vector3New([rt.V.int(1), rt.V.int(2), rt.V.int(4)]), rt.V.str("t13|"));
      rt.frameLine(66);
      this.v3(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t14|"));
      rt.frameLine(67);
      this.v3(rt.V.str("s"), rt.V.str("t15|"));
      rt.frameLine(68);
      this.v3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]), rt.V.str("t16|"));
      rt.frameLine(69);
      this.v3i(rt.vector3iNew([rt.V.int(1), rt.V.int(2), rt.V.int(4)]), rt.V.str("t17|"));
      rt.frameLine(70);
      this.v3i(rt.V.nil(), rt.V.str("t18|"));
      rt.frameLine(71);
      this.col(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]), rt.V.str("t19|"));
      rt.frameLine(72);
      this.col(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(5)]), rt.V.str("t20|"));
      rt.frameLine(73);
      this.col(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t21|"));
      rt.frameLine(74);
      this.col(rt.V.str("s"), rt.V.str("t22|"));
      rt.frameLine(75);
      this.snm(rt.V.str("a"), rt.V.str("t23|"));
      rt.frameLine(76);
      this.snm(rt.V.stringName("a"), rt.V.str("t24|"));
      rt.frameLine(77);
      this.snm(rt.stringNameCtor([rt.V.str("a")]), rt.V.str("t25|"));
      rt.frameLine(78);
      this.snm(rt.V.str("b"), rt.V.str("t26|"));
      rt.frameLine(79);
      this.snm(rt.V.int(5), rt.V.str("t27|"));
      rt.frameLine(80);
      this.cal(rt.callableCtor([]), rt.V.str("t28|"));
      rt.frameLine(81);
      this.cal(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t29|"));
      rt.frameLine(82);
      this.cal(rt.V.str("s"), rt.V.str("t30|"));
      rt.frameLine(83);
      this.cal(rt.V.int(5), rt.V.str("t31|"));
      rt.frameLine(84);
      this.cal(rt.V.nil(), rt.V.str("t32|"));
      rt.frameLine(85);
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
