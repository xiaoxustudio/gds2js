// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let d = rt.dictOf([]);
    {
      const _nv = rt.writeIdx(d, rt.V.int(1), rt.V.str("int"));
      if (_nv !== null) d = _nv;
    }
    {
      const _nv = rt.writeIdx(d, rt.V.float(1), rt.V.str("float"));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.method(d, "size", [])]));
    print(rt.showArgs([d]));
    print(rt.showArgs([rt.index(d, rt.V.int(1))]));
    print(rt.showArgs([rt.index(d, rt.V.float(1))]));
    {
      const _nv = rt.writeIdx(d, rt.V.str("1"), rt.V.str("str"));
      if (_nv !== null) d = _nv;
    }
    print(rt.showArgs([rt.method(d, "size", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
