// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let s = "12abc";
    print(rt.showArgs([rt.V.str("t1 "), rt.method(rt.V.object(new A()), "p", [rt.V.str(s)])]));
    print(rt.showArgs([rt.V.str("t2 不该到这里")]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
class A extends rt.GdScriptObject {
  p(a: rt.Variant): rt.Variant {
    a = rt.paramSlot(a, "int", 1, "p", this);
    return rt.ops.add(rt.V.str("ok<-"), rt.strBuiltin([a]));
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "p": return rt.wrapValue(this.p(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_A = rt.defineClass(A, () => new A(), (o) => o instanceof A);
rt.nameClass(__gd_d_A, "A");
rt.registerMethodArities(__gd_d_A, { "p": [1, 1] });
rt.registerNativeBase(__gd_d_A, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
