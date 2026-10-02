// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let b = rt.V.object(new Base());
    print(rt.showArgs([rt.method(b, "tag", [])]));
    print(rt.showArgs([rt.isType(b, "Base")]));
    print(rt.showArgs([rt.wrapValue(rt.attribute(b, "hp"))]));
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
class Base extends rt.GdScriptObject {
  hp = rt.V.int(10);

  tag(): rt.Variant {
    return rt.formatOf(rt.V.str("base-%d"), this.hp);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "tag": return rt.wrapValue(this.tag());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, () => new Base(), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerMethodArities(__gd_d_Base, { "tag": [0, 0] });
rt.registerNativeBase(__gd_d_Base, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
