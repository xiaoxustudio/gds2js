// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  async _initialize(): Promise<void> {
    print(rt.showArgs([rt.V.str("t1")]));
    let a = rt.V.object(new Base());
    print(rt.showArgs([rt.V.str("t2 "), rt.attribute(a, "bx")]));
    print(rt.showArgs([rt.V.str("t3")]));
    let b = rt.V.object(new NoInit());
    print(rt.showArgs([rt.V.str("t4 "), rt.attribute(b, "bx"), rt.V.str(" "), rt.attribute(b, "cx"), rt.V.str(" "), rt.isType(b, "Base")]));
    print(rt.showArgs([rt.V.str("t5")]));
    let c = rt.V.object(new Own());
    print(rt.showArgs([rt.V.str("t6 "), rt.attribute(c, "cx2")]));
    print(rt.showArgs([rt.V.str("t7")]));
    let g = rt.V.object(new Grand());
    print(rt.showArgs([rt.V.str("t8 "), rt.attribute(g, "gx")]));
    print(rt.showArgs([rt.V.str("t9")]));
    let s = rt.V.object(new SkipParent());
    print(rt.showArgs([rt.V.str("t10 "), rt.attribute(s, "n")]));
    print(rt.showArgs([rt.V.str("t11")]));
    let f = rt.V.object(new Forwarded(rt.V.int(9)));
    print(rt.showArgs([rt.V.str("t12 "), rt.attribute(f, "n"), rt.V.str(" "), rt.attribute(f, "k")]));
    let o = rt.V.object(new SuperOther());
    print(rt.showArgs([rt.V.str("t13 "), rt.method(o, "tag", [])]));
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Base {
  constructor(...__gd_new_args) {
    this.__gd_fields__();
    this._init?.(...__gd_new_args);
  }

  __gd_fields__() {
    this.bx = rt.toInt(this._mk(rt.V.str("Base.bx")));
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("n1 Base._init")]));
  }
  
  _mk(who): unknown {
    who = rt.paramSlot(who, "String", 1, "_mk", this);
    print(rt.showArgs([rt.V.str("n2 init "), who]));
    return rt.V.int(1);
  }
  
  tag(): unknown {
    return rt.V.str("base");
  }
  
}
rt.registerClass("Base", Base);
rt.registerFieldTypes(Base, {"bx": "int"});
rt.registerMethodArities(Base, { "_mk": [1, 1], "tag": [0, 0] });
rt.registerNativeBase(Base, "RefCounted");

class NoInit extends Base {
  __gd_fields__() {
    super.__gd_fields__();
    this.cx = rt.toInt(this._mk(rt.V.str("NoInit.cx")));
  }

}
rt.registerClass("NoInit", NoInit);
rt.registerFieldTypes(NoInit, {"cx": "int"});

class Own extends Base {
  __gd_fields__() {
    super.__gd_fields__();
    this.cx2 = rt.toInt(this._mk(rt.V.str("Own.cx2")));
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("n3 Own.before")]));
    super._init();
    print(rt.showArgs([rt.V.str("n4 Own.after")]));
  }
  
}
rt.registerClass("Own", Own);
rt.registerFieldTypes(Own, {"cx2": "int"});

class Grand extends Own {
  __gd_fields__() {
    super.__gd_fields__();
    this.gx = rt.toInt(this._mk(rt.V.str("Grand.gx")));
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("n5 Grand.before")]));
    super._init();
    super._init();
  }
  
}
rt.registerClass("Grand", Grand);
rt.registerFieldTypes(Grand, {"gx": "int"});

class Needs {
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
    print(rt.showArgs([rt.V.str("n6 Needs._init "), p_n]));
  }
  
}
rt.registerClass("Needs", Needs);
rt.registerFieldTypes(Needs, {"n": "int"});
rt.registerNativeBase(Needs, "RefCounted");

class SkipParent extends Needs {
  __gd_fields__() {
    super.__gd_fields__();
  }

  _init(): void {
    print(rt.showArgs([rt.V.str("n7 SkipParent（没写 super，父体不该跑）")]));
  }
  
}
rt.registerClass("SkipParent", SkipParent);

class Forwarded extends Needs {
  __gd_fields__() {
    super.__gd_fields__();
    this.k = rt.toInt(rt.V.int(3));
  }

}
rt.registerClass("Forwarded", Forwarded);
rt.registerFieldTypes(Forwarded, {"k": "int"});

class SuperOther extends Base {
  __gd_fields__() {
    super.__gd_fields__();
  }

  tag(): unknown {
    return rt.ops.add(rt.V.str("child+"), super.tag());
  }
  
}
rt.registerClass("SuperOther", SuperOther);
rt.registerMethodArities(SuperOther, { "tag": [0, 0] });

await new Main().run();
