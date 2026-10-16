// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare mt: rt.Variant;
  declare mfl: rt.Variant;
  declare mb: rt.Variant;
  declare ms: rt.Variant;
  declare mv: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(3);
      this.mt = rt.toInt(rt.V.int(2));
      rt.frameLine(4);
      this.mfl = rt.toFloat(rt.V.int(1));
      rt.frameLine(5);
      this.mb = rt.toBool(rt.V.bool(false));
      rt.frameLine(6);
      this.ms = rt.strOf(rt.V.str("a"));
      rt.frameLine(7);
      this.mv = rt.toVec2(rt.vector2New([rt.V.int(0), rt.V.int(0)]));
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
      rt.frameLine(10);
      this.mt = rt.toInt(rt.V.float(2.7));
      rt.frameLine(11);
      print(rt.showArgs([rt.V.str("q1 "), this.mt]));
      rt.frameLine(12);
      let u = 3.9;
      rt.frameLine(13);
      this.mt = rt.toInt(rt.V.float(u));
      rt.frameLine(14);
      print(rt.showArgs([rt.V.str("q2 "), this.mt]));
      rt.frameLine(15);
      this.mt = rt.toInt(rt.V.bool(true));
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("q3 "), this.mt]));
      rt.frameLine(17);
      this.mv = rt.toVec2(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(18);
      print(rt.showArgs([rt.V.str("q4 "), this.mv]));
      rt.frameLine(19);
      this.mfl = rt.toFloat(rt.V.int(5));
      rt.frameLine(20);
      print(rt.showArgs([rt.V.str("q5 "), this.mfl]));
      rt.frameLine(21);
      this.mb = rt.toBool(rt.V.int(0));
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("q6 "), this.mb]));
      rt.frameLine(23);
      this.mb = rt.toBool(rt.V.int(3));
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("q7 "), this.mb]));
      rt.frameLine(25);
      this.ms = rt.strOf(rt.V.stringName("strname"));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("q8 "), this.ms, rt.V.str(" "), rt.typeOf(this.ms)]));
      rt.frameLine(27);
      let li = rt.toInt(rt.V.int(0));
      rt.frameLine(28);
      li = rt.toInt(rt.V.float(7.5));
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("q9 "), li]));
      rt.frameLine(30);
      li = rt.toInt(rt.ops.add(li, rt.V.float(0.5)));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("q10 "), li]));
      rt.frameLine(32);
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
rt.registerFieldTypes(__gd_d_Main, {"mt": "int", "mfl": "float", "mb": "bool", "ms": "String", "mv": "Vector2"});
rt.registerScriptProps(__gd_d_Main, ["mt","mfl","mb","ms","mv"], (o) => { const s = o as Main; return [s.mt, s.mfl, s.mb, s.ms, s.mv]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["mt","mfl","mb","ms","mv"], {}, (o) => { const s = o as Main; return [s.mt, s.mfl, s.mb, s.ms, s.mv]; });
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
