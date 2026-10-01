// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  mt = rt.toInt(rt.V.int(2));
  mfl = rt.toFloat(rt.V.int(1));
  mb = rt.toBool(rt.V.bool(false));
  ms = rt.strOf(rt.V.str("a"));
  mv = rt.toVec2(rt.vector2New([rt.V.int(0), rt.V.int(0)]));

  async _initialize(): Promise<void> {
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
  
}

rt.registerFieldTypes(Main, {"mt": "int", "mfl": "float", "mb": "bool", "ms": "String", "mv": "Vector2"});
rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
