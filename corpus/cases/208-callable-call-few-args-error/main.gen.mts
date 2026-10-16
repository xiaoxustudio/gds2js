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

    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    const __gd_frame = rt.frameEnter("res://main.gd", "_initialize");
    try {
      rt.frameLine(18);
      let o = rt.V.object(new Base());
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("r "), rt.method(rt.wrapValue(rt.attribute(o, "three")), "call", [rt.V.int(1), rt.V.int(2)])]));
      rt.frameLine(20);
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
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

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

  three(a: rt.Variant, b: rt.Variant, c: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "three");
    try {
      rt.frameLine(5);
      return rt.strBuiltin([a, b, c]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  twice(x: rt.Variant, y: rt.Variant = rt.V.str("z")): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "twice");
    try {
      rt.frameLine(8);
      return rt.strBuiltin([x, y]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  static stwo(a: rt.Variant, b: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "stwo");
    try {
      rt.frameLine(11);
      return rt.strBuiltin([a, b]);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
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
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  own(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "own");
    try {
      rt.frameLine(15);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
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
