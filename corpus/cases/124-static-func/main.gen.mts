// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  TOP = rt.toInt(rt.V.int(42));
  static TOP = rt.toInt(rt.V.int(42));

  static helper(): rt.Variant {
    return rt.ops.add(Main.TOP, rt.V.int(1));
  }
  
  static usehelper(): rt.Variant {
    return Main.helper();
  }
  
  outerbare(): rt.Variant {
    return Main.helper();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let p = rt.V.object(new Inner());
    print(rt.showArgs([rt.V.str("u1 "), rt.method(rt.V.object(__gd_d_Inner), "make", [])]));
    print(rt.showArgs([rt.V.str("u2 "), rt.method(rt.V.object(__gd_d_Inner), "twice", [rt.V.int(21)])]));
    print(rt.showArgs([rt.V.str("u3 "), rt.method(rt.V.object(__gd_d_Inner), "selfcall", [])]));
    print(rt.showArgs([rt.V.str("u4 "), rt.method(rt.V.object(__gd_d_Inner), "readconst", [])]));
    print(rt.showArgs([rt.V.str("u5 "), rt.method(rt.V.object(__gd_d_Inner), "rec", [rt.V.int(10)])]));
    print(rt.showArgs([rt.V.str("u6 "), rt.method(p, "usestatic", [])]));
    print(rt.showArgs([rt.V.str("u7 "), rt.method(p, "make", [])]));
    print(rt.showArgs([rt.V.str("u8 "), rt.method(p, "twice", [rt.V.int(3)])]));
    print(rt.showArgs([rt.V.str("u9 "), rt.typeOf(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make")))]));
    print(rt.showArgs([rt.V.str("u10 "), rt.method(rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make")), "call", [])]));
    print(rt.showArgs([rt.V.str("u11 "), Main.helper()]));
    print(rt.showArgs([rt.V.str("u12 "), Main.usehelper()]));
    print(rt.showArgs([rt.V.str("u13 "), this.outerbare()]));
    print(rt.showArgs([rt.V.str("u14 "), Main.helper()]));
    let cb = rt.wrapValue(rt.attribute(rt.V.object(__gd_d_Inner), "make"));
    print(rt.showArgs([rt.V.str("u15 "), rt.typeOf(cb), rt.V.str(" "), rt.method(cb, "call", [])]));
    print(rt.showArgs([rt.V.str("u16 "), rt.typeOf(rt.methodCallable(rt.V.object(__gd_d_Main), "usehelper"))]));
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "outerbare": return rt.wrapValue(this.outerbare());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int"});
rt.registerScriptProps(__gd_d_Main, ["TOP"], (o) => { const s = o as Main; return [s.TOP]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "helper": [0, 0], "usehelper": [0, 0], "outerbare": [0, 0], "_initialize": [0, 0] });
rt.registerStaticMethods(__gd_d_Main, ["helper","usehelper"], {"helper": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.helper()), "usehelper": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Main.usehelper())});
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  CV = rt.toInt(rt.V.int(99));
  static CV = rt.toInt(rt.V.int(99));
  mv = rt.toInt(rt.V.int(7));

  static make(): rt.Variant {
    return rt.V.str("made");
  }
  
  static twice(x: rt.Variant): rt.Variant {
    return rt.ops.mul(x, rt.V.int(2));
  }
  
  static selfcall(): rt.Variant {
    return Inner.twice(rt.V.int(21));
  }
  
  static readconst(): rt.Variant {
    return Inner.CV;
  }
  
  static rec(n: rt.Variant): rt.Variant {
    if (rt.ops.truthy(rt.ops.lte(n, rt.V.int(0)))) {
      return rt.V.int(0);
    }
    return rt.ops.add(n, Inner.rec(rt.ops.sub(n, rt.V.int(1))));
  }
  
  usestatic(): rt.Variant {
    return Inner.make();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "usestatic": return rt.wrapValue(this.usestatic());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"CV": "int", "mv": "int"});
rt.registerScriptProps(__gd_d_Inner, ["CV","mv"], (o) => { const s = o as Inner; return [s.CV, s.mv]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["mv"], {}, (o) => { const s = o as Inner; return [s.mv]; });
rt.registerMethodArities(__gd_d_Inner, { "make": [0, 0], "twice": [1, 1], "selfcall": [0, 0], "readconst": [0, 0], "rec": [1, 1], "usestatic": [0, 0] });
rt.registerStaticMethods(__gd_d_Inner, ["make","twice","selfcall","readconst","rec"], {"make": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.make()), "twice": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.twice(a[0] as rt.Variant)), "selfcall": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.selfcall()), "readconst": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.readconst()), "rec": (a: rt.Variant[]): rt.Variant => rt.wrapValue(Inner.rec(a[0] as rt.Variant))});
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
