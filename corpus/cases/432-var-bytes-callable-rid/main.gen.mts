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
      rt.frameLine(9);
      let h = rt.V.object(new Holder());
      rt.frameLine(10);
      let f = rt.callable((__a: rt.Variant[]) => {
        const __gd_frame = rt.frameEnter("res://main.gd", "<anonymous lambda>");
        try {
          const x = __a[0] as rt.Variant;
          rt.frameLine(10);
          return x;
        } catch (__gd_err) {
          rt.gdFunctionError(__gd_err);
          return rt.V.nil();
        } finally {
          rt.frameExit(__gd_frame);
        }
    }, 1);
      rt.frameLine(11);
      print(rt.showArgs([rt.gVarToBytes(rt.callableCtor([rt.globalCallable("abs")]))]));
      rt.frameLine(12);
      print(rt.showArgs([rt.gVarToBytes(rt.wrapValue(rt.attribute(h, "call_me")))]));
      rt.frameLine(13);
      print(rt.showArgs([rt.gVarToBytesWithObjects(f)]));
      rt.frameLine(14);
      print(rt.showArgs([rt.gVarToBytes(rt.gRidFromInt64(rt.V.int(0)))]));
      rt.frameLine(15);
      print(rt.showArgs([rt.gVarToBytes(rt.gRidFromInt64(rt.V.int(13241)))]));
      rt.frameLine(16);
      print(rt.showArgs([rt.gVarToBytes(rt.dictOf([[rt.V.str("c"), rt.callableCtor([rt.globalCallable("abs")])]]))]));
      rt.frameLine(17);
      let d = rt.gBytesToVar(rt.gVarToBytes(rt.callableCtor([rt.globalCallable("abs")])));
      rt.frameLine(18);
      print(rt.showArgs([rt.typeOf(d), rt.V.str(" "), rt.method(d, "is_valid", [])]));
      rt.frameLine(19);
      print(rt.showArgs([rt.typeOf(rt.gBytesToVar(rt.gVarToBytes(rt.gRidFromInt64(rt.V.int(0)))))]));
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
class Holder extends rt.GdScriptObject {
  declare tag: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.tag = rt.V.int(1);
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

  call_me(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "call_me");
    try {
      rt.frameLine(6);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
      return rt.V.nil();
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "call_me": return rt.wrapValue(this.call_me(args[0] as rt.Variant));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Holder = rt.defineClass(Holder, () => new Holder(), (o) => o instanceof Holder);
rt.nameClass(__gd_d_Holder, "Holder");
rt.registerScriptProps(__gd_d_Holder, ["tag"], (o) => { const s = o as Holder; return [s.tag]; });
rt.registerDictIdentity(__gd_d_Holder, "res://main.gd", "Holder", ["tag"], {}, (o) => { const s = o as Holder; return [s.tag]; });
rt.registerMethodArities(__gd_d_Holder, { "call_me": [1, 1] });
rt.registerNativeBase(__gd_d_Holder, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
