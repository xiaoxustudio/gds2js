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
    print(rt.show(rt.V.str("s12 hello via self call")));
  }
  
  async _initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    print(rt.show(rt.V.str("s1 ")), rt.show(rt.method(b, "readself", [])), rt.show(rt.V.str(" ")), rt.show(rt.attribute(b, "n")));
    print(rt.show(rt.V.str("s2 ")), rt.show(rt.method(b, "bump", [])), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "readself", [])));
    print(rt.show(rt.V.str("s3 ")), rt.show(rt.method(b, "setn", [rt.V.int(10)])), rt.show(rt.V.str(" ")), rt.show(rt.attribute(b, "n")));
    print(rt.show(rt.V.str("s4 ")), rt.show(this.useobj(b)));
    print(rt.show(rt.V.str("s5 ")), rt.show(rt.ops.eq(rt.method(b, "me", []), b)), rt.show(rt.V.str(" ")), rt.show(rt.method(b, "sameother", [b])));
    print(rt.show(rt.V.str("s6 ")), rt.show(rt.method(b, "ty", [])), rt.show(rt.V.str(" ")), rt.show(rt.typeOf(b)));
    print(rt.show(rt.V.str("s7 ")), rt.show(rt.typeOf(rt.V.object(this))), rt.show(rt.V.str(" ")), rt.show(rt.ops.eq(rt.V.object(this), rt.V.nil())));
    print(rt.show(rt.V.str("s8 ")), rt.show(this.outervar));
    this.outervar = rt.V.int(42);
    print(rt.show(rt.V.str("s9 ")), rt.show(this.outervar), rt.show(rt.V.str(" ")), rt.show(this.outervar));
    this.outervar = rt.ops.add(this.outervar, rt.V.int(8));
    print(rt.show(rt.V.str("s10 ")), rt.show(this.outervar));
    print(rt.show(rt.V.str("s11 ")), rt.show(rt.ops.eq(this.outer_self, rt.V.object(this))));
    this.hello();
    this.quit();
  }
  
}

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

await new Main().run();
