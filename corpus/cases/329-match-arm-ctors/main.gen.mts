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

  cls(s: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "cls");
    try {
      rt.frameLine(4);
      do {
        const __m0 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.int(2)])));
        if (__m0 !== null) {
          rt.frameLine(6);
          print(rt.showArgs([rt.V.str("C|vec2-eq")]));
          break;
        }
        const __m1 = rt.matchPattern(s, rt.patConst(rt.vector2New([])));
        if (__m1 !== null) {
          rt.frameLine(8);
          print(rt.showArgs([rt.V.str("C|vec2-zero")]));
          break;
        }
        const __m2 = rt.matchPattern(s, rt.patWild());
        if (__m2 !== null) {
          rt.frameLine(10);
          print(rt.showArgs([rt.V.str("C|vec2-none")]));
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
  
  nums(s: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "nums");
    try {
      rt.frameLine(13);
      do {
        const __m0 = rt.matchPattern(s, rt.patConst(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)])));
        if (__m0 !== null) {
          rt.frameLine(15);
          print(rt.showArgs([rt.V.str("C|color-123")]));
          break;
        }
        const __m1 = rt.matchPattern(s, rt.patConst(rt.colorNew([rt.V.str("ff0000")])));
        if (__m1 !== null) {
          rt.frameLine(17);
          print(rt.showArgs([rt.V.str("C|color-hex")]));
          break;
        }
        const __m2 = rt.matchPattern(s, rt.patConst(rt.colorNew([])));
        if (__m2 !== null) {
          rt.frameLine(19);
          print(rt.showArgs([rt.V.str("C|color-zero")]));
          break;
        }
        const __m3 = rt.matchPattern(s, rt.patWild());
        if (__m3 !== null) {
          rt.frameLine(21);
          print(rt.showArgs([rt.V.str("C|color-none")]));
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
  
  texts(s: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "texts");
    try {
      rt.frameLine(24);
      do {
        const __m0 = rt.matchPattern(s, rt.patConst(rt.stringNameCtor([rt.V.str("a")])));
        if (__m0 !== null) {
          rt.frameLine(26);
          print(rt.showArgs([rt.V.str("C|sn-a")]));
          break;
        }
        const __m1 = rt.matchPattern(s, rt.patLit(rt.nodePathCtor([rt.V.str("a/b")])));
        if (__m1 !== null) {
          rt.frameLine(28);
          print(rt.showArgs([rt.V.str("C|np-ab")]));
          break;
        }
        const __m2 = rt.matchPattern(s, rt.patConst(rt.stringCtor([rt.V.str("a")])));
        if (__m2 !== null) {
          rt.frameLine(30);
          print(rt.showArgs([rt.V.str("C|str-a")]));
          break;
        }
        const __m3 = rt.matchPattern(s, rt.patWild());
        if (__m3 !== null) {
          rt.frameLine(32);
          print(rt.showArgs([rt.V.str("C|text-none")]));
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
  
  mixed(s: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "mixed");
    try {
      rt.frameLine(35);
      do {
        const __m0 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.V.int(1), rt.V.float(2.5)])));
        if (__m0 !== null) {
          rt.frameLine(37);
          print(rt.showArgs([rt.V.str("C|vec2-mix")]));
          break;
        }
        const __m1 = rt.matchPattern(s, rt.patConst(rt.vector2iNew([rt.V.int(3), rt.V.int(4)])));
        if (__m1 !== null) {
          rt.frameLine(39);
          print(rt.showArgs([rt.V.str("C|vec2i-34")]));
          break;
        }
        const __m2 = rt.matchPattern(s, rt.patConst(rt.vector2New([rt.vector2New([rt.V.int(5), rt.V.int(6)])])));
        if (__m2 !== null) {
          rt.frameLine(41);
          print(rt.showArgs([rt.V.str("C|vec2-copy")]));
          break;
        }
        const __m3 = rt.matchPattern(s, rt.patConst(rt.callableCtor([])));
        if (__m3 !== null) {
          rt.frameLine(43);
          print(rt.showArgs([rt.V.str("C|callable")]));
          break;
        }
        const __m4 = rt.matchPattern(s, rt.patWild());
        if (__m4 !== null) {
          rt.frameLine(45);
          print(rt.showArgs([rt.V.str("C|mixed-none")]));
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
      rt.frameLine(48);
      this.cls(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(49);
      this.cls(rt.vector2New([rt.V.int(0), rt.V.int(0)]));
      rt.frameLine(50);
      this.cls(rt.vector2New([rt.V.int(1), rt.V.int(3)]));
      rt.frameLine(51);
      this.nums(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(0), rt.V.int(1)]));
      rt.frameLine(52);
      this.nums(rt.colorNew([rt.V.int(1), rt.V.int(2), rt.V.int(3)]));
      rt.frameLine(53);
      this.nums(rt.colorNew([rt.V.str("ff0000")]));
      rt.frameLine(54);
      this.nums(rt.colorNew([rt.V.int(0), rt.V.int(0), rt.V.int(0), rt.V.int(0)]));
      rt.frameLine(55);
      this.texts(rt.V.stringName("a"));
      rt.frameLine(56);
      this.texts(rt.nodePathCtor([rt.V.str("a/b")]));
      rt.frameLine(57);
      this.texts(rt.V.str("a"));
      rt.frameLine(58);
      this.texts(rt.V.int(1));
      rt.frameLine(59);
      this.mixed(rt.vector2New([rt.V.int(1), rt.V.float(2.5)]));
      rt.frameLine(60);
      this.mixed(rt.vector2iNew([rt.V.int(3), rt.V.int(4)]));
      rt.frameLine(61);
      this.mixed(rt.vector2New([rt.V.int(5), rt.V.int(6)]));
      rt.frameLine(62);
      this.mixed(rt.callableCtor([]));
      rt.frameLine(63);
      this.mixed(rt.V.int(1));
      rt.frameLine(64);
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
