// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let i = rt.toInt(rt.V.int(0));
    let f = rt.toFloat(rt.V.float(0));
    let s = rt.strOf(rt.V.str(""));
    let b = rt.toBool(rt.V.bool(false));
    let arr = rt.V.array(rt.GArray.of([]));
    let dic = rt.dictOf([]);
    let v2 = rt.vector2(0, 0);
    let nod = rt.V.nil();
    print(rt.show(i));
    print(rt.show(f));
    print(rt.show(b));
    print(rt.show(s));
    print(rt.show(arr));
    print(rt.show(dic));
    print(rt.show(v2));
    print(rt.show(nod));
    print(rt.show(rt.lengthOf(s)));
    print(rt.show(rt.ops.eq(arr, rt.V.array(rt.GArray.of([])))));
    print(rt.show(rt.typeOf(f)));
    this.quit();
  }
  
}

await new Main().run();
