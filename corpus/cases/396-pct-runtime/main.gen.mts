// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare sFmt: rt.Variant;
  declare sPlain: rt.Variant;
  declare sTwo: rt.Variant;
  declare sStar: rt.Variant;
  declare nFmt: rt.Variant;
  declare nPlain: rt.Variant;
  declare nTwo: rt.Variant;
  declare nX: rt.Variant;
  declare nC: rt.Variant;
  declare nV: rt.Variant;
  declare nF: rt.Variant;
  declare nStar: rt.Variant;
  declare aStr: rt.Variant;
  declare one: rt.Variant;
  declare no: rt.Variant;
  declare negi: rt.Variant;
  declare fl: rt.Variant;
  declare vv: rt.Variant;
  declare va1: rt.Variant;
  declare va2: rt.Variant;
  declare vs2: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.sFmt = rt.strOf(rt.V.str("%d"));
      rt.frameLine(4);
      this.sPlain = rt.strOf(rt.V.str("ab"));
      rt.frameLine(5);
      this.sTwo = rt.strOf(rt.V.str("%s%s"));
      rt.frameLine(6);
      this.sStar = rt.strOf(rt.V.str("%*d"));
      rt.frameLine(7);
      this.nFmt = rt.toStringNameSlot(rt.V.stringName("%d"));
      rt.frameLine(8);
      this.nPlain = rt.toStringNameSlot(rt.V.stringName("ab"));
      rt.frameLine(9);
      this.nTwo = rt.toStringNameSlot(rt.V.stringName("%s%s"));
      rt.frameLine(10);
      this.nX = rt.toStringNameSlot(rt.V.stringName("%x"));
      rt.frameLine(11);
      this.nC = rt.toStringNameSlot(rt.V.stringName("%c"));
      rt.frameLine(12);
      this.nV = rt.toStringNameSlot(rt.V.stringName("%v"));
      rt.frameLine(13);
      this.nF = rt.toStringNameSlot(rt.V.stringName("%5.2f"));
      rt.frameLine(14);
      this.nStar = rt.toStringNameSlot(rt.V.stringName("%*d"));
      rt.frameLine(15);
      this.aStr = rt.strOf(rt.V.str("ab"));
      rt.frameLine(16);
      this.one = rt.strOf(rt.V.str("a"));
      rt.frameLine(17);
      this.no = rt.toInt(rt.V.int(7));
      rt.frameLine(18);
      this.negi = rt.toInt(rt.V.int((-1)));
      rt.frameLine(19);
      this.fl = rt.toFloat(rt.V.float(1.5));
      rt.frameLine(20);
      this.vv = rt.toVec2(rt.vector2New([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(21);
      this.va1 = rt.V.array(rt.GArray.of([rt.V.int(1)]));
      rt.frameLine(22);
      this.va2 = rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(23);
      this.vs2 = rt.V.array(rt.GArray.of([rt.V.str("a"), rt.V.str("b")]));
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

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(26);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.no, true)]));
      rt.frameLine(27);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.fl, true)]));
      rt.frameLine(28);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.negi, true)]));
      rt.frameLine(29);
      print(rt.showArgs([rt.ops.mod(this.nX, rt.V.int(255), true)]));
      rt.frameLine(30);
      print(rt.showArgs([rt.ops.mod(this.nC, this.no, true)]));
      rt.frameLine(31);
      print(rt.showArgs([rt.ops.mod(this.nC, this.one, true)]));
      rt.frameLine(32);
      print(rt.showArgs([rt.ops.mod(this.nV, this.vv, true)]));
      rt.frameLine(33);
      print(rt.showArgs([rt.ops.mod(this.nF, rt.V.float(1.234), true)]));
      rt.frameLine(34);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.va1, true)]));
      rt.frameLine(35);
      print(rt.showArgs([rt.ops.mod(this.nPlain, this.no, true)]));
      rt.frameLine(36);
      print(rt.showArgs([rt.ops.mod(this.nPlain, this.aStr, true)]));
      rt.frameLine(37);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.aStr, true)]));
      rt.frameLine(38);
      print(rt.showArgs([rt.ops.mod(this.nTwo, this.aStr, true)]));
      rt.frameLine(39);
      print(rt.showArgs([rt.ops.mod(this.nFmt, this.va2, true)]));
      rt.frameLine(40);
      print(rt.showArgs([rt.ops.mod(this.nStar, this.aStr, true)]));
      rt.frameLine(41);
      print(rt.showArgs([rt.ops.mod(this.nStar, this.no, true)]));
      rt.frameLine(42);
      print(rt.showArgs([rt.ops.mod(this.nStar, this.va2, true)]));
      rt.frameLine(43);
      print(rt.showArgs([rt.ops.mod(this.sFmt, this.aStr, true)]));
      rt.frameLine(44);
      print(rt.showArgs([rt.ops.mod(this.sPlain, this.no, true)]));
      rt.frameLine(45);
      print(rt.showArgs([rt.ops.mod(this.sTwo, this.aStr, true)]));
      rt.frameLine(46);
      print(rt.showArgs([rt.ops.mod(this.sStar, this.aStr, true)]));
      rt.frameLine(47);
      print(rt.showArgs([rt.ops.mod(this.sFmt, this.va2, true)]));
      rt.frameLine(48);
      print(rt.showArgs([rt.formatOf(rt.V.str("%d/%s"), rt.V.array(rt.GArray.of([rt.V.int(4), rt.V.str("x")])), true)]));
      rt.frameLine(49);
      print(rt.showArgs([rt.typeOf(rt.ops.mod(this.nFmt, this.no, true))]));
      rt.frameLine(50);
      print(rt.showArgs([rt.typeOf(rt.ops.mod(this.sFmt, this.no, true))]));
      rt.frameLine(51);
      print(rt.showArgs([rt.ops.eq(rt.ops.mod(this.nFmt, this.no, true), rt.V.str("7"))]));
      rt.frameLine(52);
      print(rt.showArgs([rt.ops.eq(rt.ops.mod(this.nPlain, this.no, true), rt.V.str("ab"))]));
      rt.frameLine(53);
      print(rt.showArgs([rt.ops.mod(this.nFmt, rt.V.stringName("ab"), true)]));
      rt.frameLine(54);
      print(rt.showArgs([rt.ops.mod(this.nV, this.no, true)]));
      rt.frameLine(55);
      print(rt.showArgs([rt.ops.mod(this.nStar, this.vv, true)]));
      rt.frameLine(56);
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
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"sFmt": "String", "sPlain": "String", "sTwo": "String", "sStar": "String", "aStr": "String", "one": "String", "no": "int", "negi": "int", "fl": "float", "vv": "Vector2"});
rt.registerScriptProps(__gd_d_Main, ["sFmt","sPlain","sTwo","sStar","nFmt","nPlain","nTwo","nX","nC","nV","nF","nStar","aStr","one","no","negi","fl","vv","va1","va2","vs2"], (o) => { const s = o as Main; return [s.sFmt, s.sPlain, s.sTwo, s.sStar, s.nFmt, s.nPlain, s.nTwo, s.nX, s.nC, s.nV, s.nF, s.nStar, s.aStr, s.one, s.no, s.negi, s.fl, s.vv, s.va1, s.va2, s.vs2]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["sFmt","sPlain","sTwo","sStar","nFmt","nPlain","nTwo","nX","nC","nV","nF","nStar","aStr","one","no","negi","fl","vv","va1","va2","vs2"], {}, (o) => { const s = o as Main; return [s.sFmt, s.sPlain, s.sTwo, s.sStar, s.nFmt, s.nPlain, s.nTwo, s.nX, s.nC, s.nV, s.nF, s.nStar, s.aStr, s.one, s.no, s.negi, s.fl, s.vv, s.va1, s.va2, s.vs2]; });
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
