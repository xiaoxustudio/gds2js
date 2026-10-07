// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  leaf(): void {
    printDebug([rt.V.str("leaf")], "res://main.gd", 14, "leaf");
  }
  
  mid(): void {
    this.leaf();
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    printDebug([rt.V.str("one"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("a"), rt.V.int(2)]])])), rt.V.float(3)], "res://main.gd", 20, "_initialize");
    printDebug([], "res://main.gd", 21, "_initialize");
    print(rt.showArgs([rt.V.str("stdout between")]));
    this.mid();
    let c = rt.V.object(new C());
    rt.method(c, "m", []);
    rt.method(rt.V.object(__gd_d_C), "sf", []);
    let f = rt.callable((__a: rt.Variant[]) => {
      printDebug([rt.V.str("in lambda")], "res://main.gd", 28, "<anonymous lambda>");
    }, 0);
    rt.method(f, "call", []);
    printDebug([rt.V.str("last"), rt.V.nil(), rt.V.bool(true)], "res://main.gd", 30, "_initialize");
    this.quit();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "leaf": return rt.wrapValue(this.leaf());
      case "mid": return rt.wrapValue(this.mid());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "leaf": [0, 0], "mid": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class C extends rt.GdScriptObject {
  m(): void {
    printDebug([rt.V.str("in m"), rt.V.int(2)], "res://main.gd", 5, "m");
  }
  
  static sf(): void {
    printDebug([rt.V.str("in static")], "res://main.gd", 8, "sf");
  }
  
  constructor() {
    super();
    if (!rt.bareConstruction()) {
      printDebug([rt.V.str("in _init")], "res://main.gd", 11, "_init");
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "m": return rt.wrapValue(this.m());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_C = rt.defineClass(C, () => new C(), (o) => o instanceof C);
rt.nameClass(__gd_d_C, "C");
rt.registerDictIdentity(__gd_d_C, "res://main.gd", "C", [], {}, (o) => { const s = o as C; return []; });
rt.registerMethodArities(__gd_d_C, { "m": [0, 0], "sf": [0, 0] });
rt.registerStaticMethods(__gd_d_C, ["sf"], {"sf": (a: rt.Variant[]): rt.Variant => rt.wrapValue(C.sf())});
rt.registerNativeBase(__gd_d_C, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
