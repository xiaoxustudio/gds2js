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

  num(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "num");
    try {
      rt.frameLine(4);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.int(5)));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([tag, rt.V.str("int-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patLit(rt.V.float(5)));
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([tag, rt.V.str("float-arm")]));
          break;
        }
        const __m2 = rt.matchPattern(p, rt.patLit(rt.V.str("5")));
        if (__m2 !== null) {
          rt.frameLine(10);
          print(rt.showArgs([tag, rt.V.str("str-arm")]));
          break;
        }
        const __m3 = rt.matchPattern(p, rt.patLit(rt.V.stringName("5")));
        if (__m3 !== null) {
          rt.frameLine(12);
          print(rt.showArgs([tag, rt.V.str("sn-arm")]));
          break;
        }
        const __m4 = rt.matchPattern(p, rt.patWild());
        if (__m4 !== null) {
          rt.frameLine(14);
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
  
  flt(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "flt");
    try {
      rt.frameLine(17);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.float(5)));
        if (__m0 !== null) {
          rt.frameLine(19);
          print(rt.showArgs([tag, rt.V.str("float-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(21);
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
  
  boo(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "boo");
    try {
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.bool(true)));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([tag, rt.V.str("bool-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(28);
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
  
  nul(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "nul");
    try {
      rt.frameLine(31);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.nil()));
        if (__m0 !== null) {
          rt.frameLine(33);
          print(rt.showArgs([tag, rt.V.str("null-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(35);
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
  
  str_(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "str_");
    try {
      rt.frameLine(38);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.str("a")));
        if (__m0 !== null) {
          rt.frameLine(40);
          print(rt.showArgs([tag, rt.V.str("str-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(42);
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
      rt.frameLine(45);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.V.stringName("a")));
        if (__m0 !== null) {
          rt.frameLine(47);
          print(rt.showArgs([tag, rt.V.str("sn-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(49);
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
  
  arr(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "arr");
    try {
      rt.frameLine(52);
      do {
        const __m0 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.int(1)), rt.patLit(rt.V.int(2))]));
        if (__m0 !== null) {
          rt.frameLine(54);
          print(rt.showArgs([tag, rt.V.str("int-array-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(56);
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
  
  narr(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "narr");
    try {
      rt.frameLine(59);
      do {
        const __m0 = rt.matchPattern(p, rt.patArray([rt.patArray([rt.patLit(rt.V.int(1))])]));
        if (__m0 !== null) {
          rt.frameLine(61);
          print(rt.showArgs([tag, rt.V.str("nested-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(63);
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
  
  sar(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "sar");
    try {
      rt.frameLine(66);
      do {
        const __m0 = rt.matchPattern(p, rt.patArray([rt.patLit(rt.V.str("a"))]));
        if (__m0 !== null) {
          rt.frameLine(68);
          print(rt.showArgs([tag, rt.V.str("str-array-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(70);
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
  
  dct(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "dct");
    try {
      rt.frameLine(73);
      do {
        const __m0 = rt.matchPattern(p, rt.patDict([[rt.V.str("a"), rt.patLit(rt.V.int(1))]]));
        if (__m0 !== null) {
          rt.frameLine(75);
          print(rt.showArgs([tag, rt.V.str("dict-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(77);
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
  
  ndp(p: rt.Variant, tag: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "ndp");
    try {
      rt.frameLine(80);
      do {
        const __m0 = rt.matchPattern(p, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
        if (__m0 !== null) {
          rt.frameLine(82);
          print(rt.showArgs([tag, rt.V.str("np-arm")]));
          break;
        }
        const __m1 = rt.matchPattern(p, rt.patWild());
        if (__m1 !== null) {
          rt.frameLine(84);
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
      rt.frameLine(87);
      this.num(rt.V.int(5), rt.V.str("t01|"));
      rt.frameLine(88);
      this.num(rt.V.float(5), rt.V.str("t02|"));
      rt.frameLine(89);
      this.num(rt.V.str("5"), rt.V.str("t03|"));
      rt.frameLine(90);
      this.num(rt.V.stringName("5"), rt.V.str("t04|"));
      rt.frameLine(91);
      this.num(rt.V.bool(true), rt.V.str("t05|"));
      rt.frameLine(92);
      this.num(rt.V.nil(), rt.V.str("t06|"));
      rt.frameLine(93);
      this.num(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t07|"));
      rt.frameLine(94);
      this.num(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t08|"));
      rt.frameLine(95);
      this.num(rt.V.array(rt.GArray.of([rt.V.int(5)])), rt.V.str("t09|"));
      rt.frameLine(96);
      this.num(rt.dictOf([[rt.V.str("a"), rt.V.int(5)]]), rt.V.str("t10|"));
      rt.frameLine(97);
      this.num(rt.V.int(1), rt.V.str("t11|"));
      rt.frameLine(98);
      this.flt(rt.V.float(5), rt.V.str("t12|"));
      rt.frameLine(99);
      this.flt(rt.V.int(5), rt.V.str("t13|"));
      rt.frameLine(100);
      this.boo(rt.V.bool(true), rt.V.str("t14|"));
      rt.frameLine(101);
      this.boo(rt.V.int(1), rt.V.str("t15|"));
      rt.frameLine(102);
      this.nul(rt.V.nil(), rt.V.str("t16|"));
      rt.frameLine(103);
      this.nul(rt.V.str("x"), rt.V.str("t17|"));
      rt.frameLine(104);
      this.nul(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t18|"));
      rt.frameLine(105);
      this.str_(rt.V.str("a"), rt.V.str("t19|"));
      rt.frameLine(106);
      this.str_(rt.V.stringName("a"), rt.V.str("t20|"));
      rt.frameLine(107);
      this.str_(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t21|"));
      rt.frameLine(108);
      this.snm(rt.V.str("a"), rt.V.str("t22|"));
      rt.frameLine(109);
      this.snm(rt.V.stringName("a"), rt.V.str("t23|"));
      rt.frameLine(110);
      this.snm(rt.V.int(5), rt.V.str("t24|"));
      rt.frameLine(111);
      this.arr(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])), rt.V.str("t25|"));
      rt.frameLine(112);
      this.arr(rt.V.array(rt.GArray.of([rt.V.float(1), rt.V.float(2)])), rt.V.str("t26|"));
      rt.frameLine(113);
      this.arr(rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)])), rt.V.str("t27|"));
      rt.frameLine(114);
      this.narr(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.int(1)]))])), rt.V.str("t28|"));
      rt.frameLine(115);
      this.narr(rt.V.array(rt.GArray.of([rt.V.array(rt.GArray.of([rt.V.float(1)]))])), rt.V.str("t29|"));
      rt.frameLine(116);
      this.sar(rt.V.array(rt.GArray.of([rt.V.str("a")])), rt.V.str("t30|"));
      rt.frameLine(117);
      this.sar(rt.V.array(rt.GArray.of([rt.V.stringName("a")])), rt.V.str("t31|"));
      rt.frameLine(118);
      this.dct(rt.dictOf([[rt.V.str("a"), rt.V.int(1)]]), rt.V.str("t32|"));
      rt.frameLine(119);
      this.dct(rt.dictOf([[rt.V.str("a"), rt.V.float(1)]]), rt.V.str("t33|"));
      rt.frameLine(120);
      this.dct(rt.dictOf([[rt.V.str("b"), rt.V.int(1)]]), rt.V.str("t34|"));
      rt.frameLine(121);
      this.dct(rt.dictOf([[rt.V.str("a"), rt.V.int(1)], [rt.V.str("b"), rt.V.int(2)]]), rt.V.str("t35|"));
      rt.frameLine(122);
      this.ndp(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t36|"));
      rt.frameLine(123);
      this.ndp(rt.nodePathCtor([rt.V.str("a/b")]), rt.V.str("t37|"));
      rt.frameLine(124);
      this.ndp(rt.V.str("a/b"), rt.V.str("t38|"));
      rt.frameLine(125);
      this.ndp(rt.vector2New([rt.V.int(1), rt.V.int(2)]), rt.V.str("t39|"));
      rt.frameLine(126);
      this.ndp(rt.gRidFromInt64(rt.V.int(5)), rt.V.str("t40|"));
      rt.frameLine(127);
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
