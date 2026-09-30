// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let p = rt.V.object(new Plain());
    print(rt.showArgs([rt.V.str("p "), rt.ops.neq(p, rt.V.nil())]));
    let m = rt.V.object(new Mid());
    rt.method(m, "bare", []);
    rt.method(m, "show", []);
    rt.method(m, "bump", []);
    print(rt.showArgs([rt.V.str("after "), rt.attribute(m, "a"), rt.V.str(" "), rt.attribute(m, "shadow"), rt.V.str(" "), rt.typeOf(m)]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class NoInit {
  constructor(...__gd_new_args) {
    this.__gd_fields__();
    this._init?.(...__gd_new_args);
  }

  __gd_fields__() {
    this.a = rt.V.int(7);
    this.shadow = rt.V.int(100);
    this.CA = rt.V.int(99);
  }

  static CA = rt.V.int(99);

  get_a(): unknown {
    return this.a;
  }
  
}
rt.registerClass("NoInit", NoInit);
rt.registerNativeBase(NoInit, "RefCounted");

class Plain extends NoInit {
  __gd_fields__() {
    super.__gd_fields__();
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("plain "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA]));
  }
  
  show(): void {
    let a = 1;
    print(rt.showArgs([rt.V.str("shadow "), rt.V.int(a), rt.V.str(" "), this.a, rt.V.str(" "), this.shadow]));
  }
  
}
rt.registerClass("Plain", Plain);

class Mid extends Plain {
  __gd_fields__() {
    super.__gd_fields__();
    this.b = rt.V.int(3);
  }

  bare(): void {
    print(rt.showArgs([rt.V.str("mid "), this.a, rt.V.str(" "), this.get_a(), rt.V.str(" "), this.CA, rt.V.str(" "), this.b]));
  }
  
  bump(): void {
    this.a = rt.ops.add(this.a, rt.V.int(1));
    print(rt.showArgs([rt.V.str("bump "), this.a, rt.V.str(" "), this.get_a()]));
  }
  
}
rt.registerClass("Mid", Mid);

await new Main().run();
