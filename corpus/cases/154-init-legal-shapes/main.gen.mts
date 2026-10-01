// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    let a = rt.V.object(new Bare());
    print(rt.showArgs([rt.V.str("n4 empty="), rt.typeOf(rt.V.object(new Empty())), rt.V.str(" bare="), rt.isType(a, "Bare")]));
    let f = rt.V.object(new Forward(rt.V.int(9)));
    print(rt.showArgs([rt.V.str("n5 "), rt.attribute(f, "n"), rt.V.str(" "), rt.attribute(f, "k")]));
    let r = rt.V.object(new Right(rt.V.int(4)));
    print(rt.showArgs([rt.V.str("n6 "), rt.attribute(r, "n")]));
    this.quit();
  }
  
}

rt.registerNativeBase(Main, "SceneTree");
class Bare {
  constructor(...__gd_new_args) {
    this.__gd_fields__();
    this._init?.(...__gd_new_args);
  }

  __gd_fields__() {
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("n1 Bare._init")]));
    return;
  }
  
}
rt.registerClass("Bare", Bare);
rt.registerNativeBase(Bare, "RefCounted");

class Empty extends Bare {
  __gd_fields__() {
    super.__gd_fields__();
  }

}
rt.registerClass("Empty", Empty);

class NeedsArg {
  constructor(...__gd_new_args) {
    this.__gd_fields__();
    this._init?.(...__gd_new_args);
  }

  __gd_fields__() {
    this.n = rt.toInt(rt.V.int(0));
  }

  _init(p_n): void {
    p_n = rt.paramSlot(p_n, "int", 1, "_init", this);
    this.n = rt.toInt(p_n);
    print(rt.showArgs([rt.V.str("n2 NeedsArg._init "), p_n]));
  }
  
}
rt.registerClass("NeedsArg", NeedsArg);
rt.registerFieldTypes(NeedsArg, {"n": "int"});
rt.registerNativeBase(NeedsArg, "RefCounted");

class Forward extends NeedsArg {
  __gd_fields__() {
    super.__gd_fields__();
    this.k = rt.toInt(rt.V.int(3));
  }

}
rt.registerClass("Forward", Forward);
rt.registerFieldTypes(Forward, {"k": "int"});

class Right extends NeedsArg {
  __gd_fields__() {
    super.__gd_fields__();
  }

  _init(p_x): void {
    p_x = rt.paramSlot(p_x, "int", 1, "_init", this);
    super._init(p_x);
    print(rt.showArgs([rt.V.str("n3 Right.after-super "), p_x]));
  }
  
}
rt.registerClass("Right", Right);

await new Main().run();
