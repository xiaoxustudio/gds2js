// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  outervar = rt.V.int(7);
  outer_self = rt.V.object(this);

  useobj(o): unknown {
    return rt.method(o, "getn", []);
  }
  
  hello(): void {
    print(rt.showArgs([rt.V.str("s12 hello via self call")]));
  }
  
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    print(rt.showArgs([rt.V.str("s1 "), rt.method(b, "readself", []), rt.V.str(" "), rt.attribute(b, "n")]));
    print(rt.showArgs([rt.V.str("s2 "), rt.method(b, "bump", []), rt.V.str(" "), rt.method(b, "readself", [])]));
    print(rt.showArgs([rt.V.str("s3 "), rt.method(b, "setn", [rt.V.int(10)]), rt.V.str(" "), rt.attribute(b, "n")]));
    print(rt.showArgs([rt.V.str("s4 "), this.useobj(b)]));
    print(rt.showArgs([rt.V.str("s5 "), rt.ops.eq(rt.method(b, "me", []), b), rt.V.str(" "), rt.method(b, "sameother", [b])]));
    print(rt.showArgs([rt.V.str("s6 "), rt.method(b, "ty", []), rt.V.str(" "), rt.typeOf(b)]));
    print(rt.showArgs([rt.V.str("s7 "), rt.typeOf(rt.V.object(this)), rt.V.str(" "), rt.ops.eq(rt.V.object(this), rt.V.nil())]));
    print(rt.showArgs([rt.V.str("s8 "), this.outervar]));
    this.outervar = rt.V.int(42);
    print(rt.showArgs([rt.V.str("s9 "), this.outervar, rt.V.str(" "), this.outervar]));
    this.outervar = rt.ops.add(this.outervar, rt.V.int(8));
    print(rt.showArgs([rt.V.str("s10 "), this.outervar]));
    print(rt.showArgs([rt.V.str("s11 "), rt.ops.eq(this.outer_self, rt.V.object(this))]));
    this.hello();
    this.quit();
  }
  
}

rt.registerMethodArities(Main, { "useobj": [1, 1], "hello": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(Main, "SceneTree");
class Box {
  n = rt.V.int(1);

  getn(): unknown {
    return this.n;
  }
  
  readself(): unknown {
    return this.n;
  }
  
  bump(): unknown {
    this.n = rt.ops.add(this.n, rt.V.int(1));
    return this.n;
  }
  
  setn(v): unknown {
    this.n = v;
    return this.n;
  }
  
  me(): unknown {
    return rt.V.object(this);
  }
  
  sameother(o): unknown {
    return rt.ops.eq(o, rt.V.object(this));
  }
  
  ty(): unknown {
    return rt.typeOf(rt.V.object(this));
  }
  
}
rt.registerClass("Box", Box);
rt.registerMethodArities(Box, { "getn": [0, 0], "readself": [0, 0], "bump": [0, 0], "setn": [1, 1], "me": [0, 0], "sameother": [1, 1], "ty": [0, 0] });
rt.registerNativeBase(Box, "RefCounted");

await new Main().run();
