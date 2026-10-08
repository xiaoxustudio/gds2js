// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  mt = rt.toInt(rt.V.int(2));
  mfl = rt.toFloat(rt.V.int(1));
  mb = rt.toBool(rt.V.bool(false));
  ms = rt.strOf(rt.V.str("a"));
  mv = rt.toVec2(rt.vector2New([rt.V.int(0), rt.V.int(0)]));

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    this.mt = rt.toInt(rt.V.float(2.7));
    print(rt.showArgs([rt.V.str("q1 "), this.mt]));
    let u = 3.9;
    this.mt = rt.toInt(rt.V.float(u));
    print(rt.showArgs([rt.V.str("q2 "), this.mt]));
    this.mt = rt.toInt(rt.V.bool(true));
    print(rt.showArgs([rt.V.str("q3 "), this.mt]));
    this.mv = rt.toVec2(rt.vector2iNew([rt.V.int(1), rt.V.int(2)]));
    print(rt.showArgs([rt.V.str("q4 "), this.mv]));
    this.mfl = rt.toFloat(rt.V.int(5));
    print(rt.showArgs([rt.V.str("q5 "), this.mfl]));
    this.mb = rt.toBool(rt.V.int(0));
    print(rt.showArgs([rt.V.str("q6 "), this.mb]));
    this.mb = rt.toBool(rt.V.int(3));
    print(rt.showArgs([rt.V.str("q7 "), this.mb]));
    this.ms = rt.strOf(rt.V.stringName("strname"));
    print(rt.showArgs([rt.V.str("q8 "), this.ms, rt.V.str(" "), rt.typeOf(this.ms)]));
    let li = rt.toInt(rt.V.int(0));
    li = rt.toInt(rt.V.float(7.5));
    print(rt.showArgs([rt.V.str("q9 "), li]));
    li = rt.toInt(rt.ops.add(li, rt.V.float(0.5)));
    print(rt.showArgs([rt.V.str("q10 "), li]));
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
