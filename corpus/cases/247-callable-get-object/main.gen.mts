// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  top(x: rt.Variant): rt.Variant {
    return x;
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Inner());
    let cm = rt.wrapValue(rt.attribute(o, "m"));
    print(rt.showArgs([rt.V.str("q01|"), rt.typeOf(rt.method(cm, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), o), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.method(cm, "get_object", []), "v"))]));
    let other = rt.V.object(new Inner());
    print(rt.showArgs([rt.V.str("q02|"), rt.ops.eq(rt.method(cm, "get_object", []), other), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), o)]));
    print(rt.showArgs([rt.V.str("q03|"), rt.ops.eq(rt.method(rt.method(cm, "get_object", []), "get_instance_id", []), rt.method(o, "get_instance_id", []))]));
    let ct = rt.methodCallable(rt.V.object(this), "top");
    print(rt.showArgs([rt.V.str("q04|"), rt.typeOf(rt.method(ct, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(ct, "get_object", []), rt.V.object(this))]));
    let cs = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "sstat"));
    print(rt.showArgs([rt.V.str("q05|"), rt.typeOf(rt.method(cs, "get_object", [])), rt.V.str("|"), rt.ops.eq(rt.method(cs, "get_object", []), rt.V.object(__gd_d_Inner)), rt.V.str("|"), rt.ops.eq(rt.method(cs, "get_object", []), o)]));
    let b = rt.method(cm, "bind", [rt.V.int(1)]);
    print(rt.showArgs([rt.V.str("q06|"), rt.ops.eq(rt.method(b, "get_object", []), o), rt.V.str("|"), rt.wrapValue(rt.attribute(rt.method(b, "get_object", []), "v"))]));
    print(rt.showArgs([rt.V.str("q07|"), rt.strBuiltin([rt.method(rt.method(cm, "get_object", []), "get_class", [])]), rt.V.str("|"), rt.ops.eq(rt.method(cm, "get_object", []), rt.method(cm, "get_object", []))]));
    print(rt.showArgs([rt.V.str("q08|"), rt.ops.eq(rt.method(cm, "get_object", []), rt.method(ct, "get_object", []))]));
    print(rt.showArgs([rt.V.str("q09|"), rt.method(rt.method(cm, "get_object", []), "m", [rt.V.int(1)]), rt.V.str("|"), rt.method(rt.method(cs, "get_object", []), "sstat", [rt.V.int(2)])]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "top": return rt.wrapValue(this.top(args[0] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "top": [1, 1], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  v = rt.V.int(7);

  m(x: rt.Variant): rt.Variant {
    return rt.ops.add(x, this.v);
  }
  
  static sstat(x: rt.Variant): rt.Variant {
    return x;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "m": return rt.wrapValue(this.m(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerScriptProps(__gd_d_Inner, ["v"]);
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["v"], {}, (o) => { const s = o as Inner; return [s.v]; });
rt.registerMethodArities(__gd_d_Inner, { "m": [1, 1], "sstat": [1, 1] });
rt.registerStaticMethods(__gd_d_Inner, ["sstat"], {"sstat": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.sstat(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
