// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let o = rt.V.object(new Base());
    print(rt.showArgs([rt.V.str("r1 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("r2 "), rt.method(rt.method(rt.wrapValue(rt.attribute(o, "three")), "bind", [rt.V.int(1), rt.V.int(2)]), "call", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("r3 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)]))])]));
    print(rt.showArgs([rt.V.str("r4 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3), rt.V.int(4)]))])]));
    print(rt.showArgs([rt.V.str("r5 "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "callv", [rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2), rt.V.int(3)]))])]));
    print(rt.showArgs([rt.V.str("r6 "), rt.method(rt.wrapValue(rt.attribute(o, "twice")), "call", [rt.V.int(1), rt.V.int(2)]), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(o, "twice")), "call", [rt.V.int(5)])]));
    let d = rt.V.object(new Derived());
    print(rt.showArgs([rt.V.str("r7 "), rt.method(rt.wrapValue(rt.attribute(d, "own")), "call", [rt.V.int(7)]), rt.V.str(" "), rt.method(rt.wrapValue(rt.attribute(d, "three")), "call", [rt.V.int(1), rt.V.int(2), rt.V.int(3)])]));
    let f = rt.callable((__a: rt.Variant[]) => {
      const x = __a[0] as rt.Variant;
      const y = __a[1] as rt.Variant;
      return rt.ops.add(x, y);
    }, 2);
    print(rt.showArgs([rt.V.str("r8 "), rt.method(f, "call", [rt.V.int(1), rt.V.int(2)]), rt.V.str(" "), rt.method(rt.method(f, "bind", [rt.V.int(1)]), "call", [rt.V.int(2)])]));
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
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Base extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    this.__gdDispatch("_init", __gd_new_args);
  }

  __gd_fields__() {
  }

  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, b, c]);
  }
  
  twice(x: rt.Variant, y: rt.Variant = rt.V.str("z")): rt.Variant {
    return rt.strBuiltin([x, y]);
  }
  
  static stwo(a: rt.Variant, b: rt.Variant): rt.Variant {
    return rt.strBuiltin([a, b]);
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "three": return rt.wrapValue(this.three(args[0] as rt.Variant, args[1] as rt.Variant, args[2] as rt.Variant));
      case "twice": return rt.wrapValue(this.twice(args[0] as rt.Variant, args.length > 1 ? (args[1] as rt.Variant) : undefined));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Base = rt.defineClass(Base, (a) => new Base(...a), (o) => o instanceof Base);
rt.nameClass(__gd_d_Base, "Base");
rt.registerDictIdentity(__gd_d_Base, "res://main.gd", "Base", [], {}, (o) => { const s = o as Base; return []; });
rt.registerMethodArities(__gd_d_Base, { "three": [3, 3], "twice": [1, 2], "stwo": [2, 2] });
rt.registerStaticMethods(__gd_d_Base, ["stwo"], {"stwo": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Base.stwo(a[0] as rt.Variant, a[1] as rt.Variant))});
rt.registerNativeBase(__gd_d_Base, "RefCounted");

class Derived extends Base {
  override __gd_fields__() {
    super.__gd_fields__();
  }

  own(a: rt.Variant): rt.Variant {
    return a;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "own": return rt.wrapValue(this.own(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Derived = rt.defineClass(Derived, (a) => new Derived(...a), (o) => o instanceof Derived);
rt.nameClass(__gd_d_Derived, "Derived");
rt.setClassBase(__gd_d_Derived, rt.lookupClass("Base") ?? null);
rt.registerDictIdentity(__gd_d_Derived, "res://main.gd", "Derived", [], {}, (o) => { const s = o as Derived; return []; });
rt.registerMethodArities(__gd_d_Derived, { "own": [1, 1] });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
