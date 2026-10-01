// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  fired = new rt.Signal("fired");

  on_fired(v): void {
    print(rt.showArgs([rt.V.str("got "), v]));
  }
  
  async _initialize(): Promise<void> {
    let s = this.fired;
    print(rt.showArgs([rt.V.str("r1 "), rt.method(s, "connect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this))])]));
    rt.method(s, "emit", [rt.V.int(1)]);
    rt.method(s, "disconnect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this))]);
    print(rt.showArgs([rt.V.str("r2 "), rt.method(s, "connect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this))])]));
    rt.method(s, "disconnect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this))]);
    print(rt.showArgs([rt.V.str("r3 "), rt.typeOf(rt.method(s, "connect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this)), rt.V.int(4)]))]));
    rt.method(s, "emit", [rt.V.int(2)]);
    rt.method(s, "emit", [rt.V.int(3)]);
    print(rt.showArgs([rt.V.str("r4 "), rt.method(s, "connect", [rt.callableOf(this.on_fired.bind(this), "on_fired", rt.V.object(this)), rt.V.int(1)])]));
    rt.method(s, "emit", [rt.V.int(4)]);
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "on_fired": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
await new Main().run();
