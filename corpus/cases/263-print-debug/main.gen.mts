// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  constructor() {
    super();
    this.__gd_fields__();
  }

  leaf(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "leaf");
    try {
      rt.frameLine(14);
      printDebug([rt.V.str("leaf")], "res://main.gd", 14, "leaf");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  mid(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "mid");
    try {
      rt.frameLine(17);
      this.leaf();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(20);
      printDebug([rt.V.str("one"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.dictOf([[rt.V.str("a"), rt.V.int(2)]])])), rt.V.float(3)], "res://main.gd", 20, "_initialize");
      rt.frameLine(21);
      printDebug([], "res://main.gd", 21, "_initialize");
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("stdout between")]));
      rt.frameLine(23);
      this.mid();
      rt.frameLine(24);
      let c = rt.V.object(new C());
      rt.frameLine(25);
      rt.method(c, "m", []);
      rt.frameLine(26);
      rt.method(rt.V.object(__gd_d_C), "sf", []);
      rt.frameLine(27);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          rt.frameLine(28);
          printDebug([rt.V.str("in lambda")], "res://main.gd", 28, "<anonymous lambda>");
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 0);
      rt.frameLine(29);
      rt.method(f, "call", []);
      rt.frameLine(30);
      printDebug([rt.V.str("last"), rt.V.nil(), rt.V.bool(true)], "res://main.gd", 30, "_initialize");
      rt.frameLine(31);
      this.quit();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
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
  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  m(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "m");
    try {
      rt.frameLine(5);
      printDebug([rt.V.str("in m"), rt.V.int(2)], "res://main.gd", 5, "m");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static sf(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "sf");
    try {
      rt.frameLine(8);
      printDebug([rt.V.str("in static")], "res://main.gd", 8, "sf");
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  constructor() {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) {
        const __gd_frame = rt.frameEnter("res://main.gd", "_init");
        try {
        rt.frameLine(11);
        printDebug([rt.V.str("in _init")], "res://main.gd", 11, "_init");
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return;
        } finally {
          rt.frameExit(__gd_frame);
        }
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
