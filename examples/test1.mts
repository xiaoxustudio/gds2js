// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "gds2js/runtime";
import { print, SceneTree } from "gds2js/host";

export class Main extends SceneTree {
  _ready(): void {
    for (const i of rt.iter(rt.V.array(rt.range(rt.num(rt.V.int(100)))))) {
      print(rt.show(i));
    }
  }
  
}

await new Main().run();
