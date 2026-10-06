// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, SceneTree } from "../../../tools/harness/scene-tree";

const Suit = rt.dictOf([[rt.V.str("HEARTS"), rt.V.int(0)], [rt.V.str("SPADES"), rt.V.int(1)]]);

export class Main extends SceneTree {
  TOP = rt.toInt(rt.V.int(42));
  static TOP = rt.toInt(rt.V.int(42));

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let i = rt.V.object(new Inner());
    print(rt.showArgs([rt.V.str("t1 "), rt.method(i, "useconst", [])]));
    print(rt.showArgs([rt.V.str("t2 "), rt.method(i, "useenum", [])]));
    print(rt.showArgs([rt.V.str("t3 "), rt.method(i, "useother", [])]));
    print(rt.showArgs([rt.V.str("t4 "), rt.method(i, "ownconst", [])]));
    print(rt.showArgs([rt.V.str("t5 "), Inner.IC]));
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
rt.registerFieldTypes(__gd_d_Main, {"TOP": "int"});
rt.registerScriptProps(__gd_d_Main, ["TOP"]);
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Other extends rt.GdScriptObject {
  OC = rt.toInt(rt.V.int(5));
  static OC = rt.toInt(rt.V.int(5));

  getoc(): rt.Variant {
    return Other.OC;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "getoc": return rt.wrapValue(this.getoc());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Other = rt.defineClass(Other, () => new Other(), (o) => o instanceof Other);
rt.nameClass(__gd_d_Other, "Other");
rt.registerFieldTypes(__gd_d_Other, {"OC": "int"});
rt.registerScriptProps(__gd_d_Other, ["OC"]);
rt.registerMethodArities(__gd_d_Other, { "getoc": [0, 0] });
rt.registerNativeBase(__gd_d_Other, "RefCounted");

class Inner extends rt.GdScriptObject {
  IC = rt.toInt(rt.V.int(9));
  static IC = rt.toInt(rt.V.int(9));

  useconst(): rt.Variant {
    return Main.TOP;
  }
  
  useenum(): rt.Variant {
    return rt.wrapValue(rt.index(Suit, rt.V.str("HEARTS")));
  }
  
  useother(): rt.Variant {
    return rt.method(rt.V.object(new Other()), "getoc", []);
  }
  
  ownconst(): rt.Variant {
    return Inner.IC;
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "useconst": return rt.wrapValue(this.useconst());
      case "useenum": return rt.wrapValue(this.useenum());
      case "useother": return rt.wrapValue(this.useother());
      case "ownconst": return rt.wrapValue(this.ownconst());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerFieldTypes(__gd_d_Inner, {"IC": "int"});
rt.registerScriptProps(__gd_d_Inner, ["IC"]);
rt.registerMethodArities(__gd_d_Inner, { "useconst": [0, 0], "useenum": [0, 0], "useother": [0, 0], "ownconst": [0, 0] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
