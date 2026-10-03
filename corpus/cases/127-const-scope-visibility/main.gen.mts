// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  TOP = rt.toInt(rt.V.int(42));
  static TOP = rt.toInt(rt.V.int(42));
  NAME = rt.strOf(rt.V.str("outer-name"));
  static NAME = rt.strOf(rt.V.str("outer-name"));

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    print(rt.showArgs([rt.V.str("t1 "), Main.TOP]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(i, "read_outer", [])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(i, "read_shadow", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(rt.V.object(__gd_d_Inner), "read_static_outer", [])]));
    print(rt.showArgs([rt.V.str("t5 "), rt.method(rt.V.object(__gd_d_Inner), "read_static_shadow", [])]));
    print(rt.showArgs([rt.V.str("t6 "), rt.method(i, "via_self_dot", [])]));
    print(rt.showArgs([rt.V.str("t7 "), Inner.TOP]));
    print(rt.showArgs([rt.V.str("t8 "), rt.wrapValue(rt.attribute(i, "TOP"))]));
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
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int", "NAME": "String"});
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
class Inner extends rt.GdScriptObject {
  TOP = rt.toInt(rt.V.int(7));
  static TOP = rt.toInt(rt.V.int(7));

  read_outer(): rt.Variant {
    return Main.NAME;
  }
  
  read_shadow(): rt.Variant {
    return Inner.TOP;
  }
  
  static read_static_outer(): rt.Variant {
    return Main.NAME;
  }
  
  static read_static_shadow(): rt.Variant {
    return Inner.TOP;
  }
  
  via_self_dot(): rt.Variant {
    return Inner.TOP;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "read_outer": return rt.wrapValue(this.read_outer());
      case "read_shadow": return rt.wrapValue(this.read_shadow());
      case "via_self_dot": return rt.wrapValue(this.via_self_dot());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"TOP": "int"});
rt.registerMethodArities(__gd_d_Inner, { "read_outer": [0, 0], "read_shadow": [0, 0], "read_static_outer": [0, 0], "read_static_shadow": [0, 0], "via_self_dot": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["read_static_outer","read_static_shadow"], {"read_static_outer": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.read_static_outer()), "read_static_shadow": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.read_static_shadow())});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
await __gd_entry.run();
