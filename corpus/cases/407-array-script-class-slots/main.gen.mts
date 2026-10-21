// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare mod: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(12);
      this.mod = rt.stampScriptArray(rt.V.array(rt.GArray.of([])), "Inner", "RefCounted", true);
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
      rt.frameLine(15);
      let a = rt.stampScriptArray(rt.V.array(rt.GArray.of([rt.V.object(new Inner())])), "Inner", "RefCounted", true);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("A="), rt.method(a, "is_typed", []), rt.V.str(" "), rt.method(a, "get_typed_class_name", []), rt.V.str(" "), rt.typeOf(rt.wrapValue(rt.index(a, rt.V.int(0), "Array[Inner]"))), rt.V.str(" "), rt.method(a, "size", [])]));
      rt.frameLine(17);
      let k = rt.stampScriptArray(rt.V.array(rt.GArray.of([])), "Kid", "RefCounted", true);
      rt.frameLine(18);
      let b = rt.stampScriptArray(rt.V.array(rt.GArray.of([])), "Big", "RefCounted", true);
      rt.frameLine(19);
      print(rt.showArgs([rt.V.str("B="), rt.method(k, "is_typed", []), rt.method(k, "get_typed_class_name", []), rt.method(b, "is_typed", []), rt.method(b, "get_typed_class_name", [])]));
      rt.frameLine(20);
      let alias = rt.stampScriptArray(this.mod, "Inner", "RefCounted", false);
      rt.frameLine(21);
      rt.method(this.mod, "append", [rt.V.object(new Inner())]);
      rt.frameLine(22);
      print(rt.showArgs([rt.V.str("C="), rt.method(alias, "size", []), rt.V.str(" "), rt.method(alias, "is_typed", [])]));
      rt.frameLine(23);
      let w = a;
      rt.frameLine(24);
      let through = rt.stampScriptArray(w, "Inner", "RefCounted", false);
      rt.frameLine(25);
      print(rt.showArgs([rt.V.str("D="), rt.method(through, "size", []), rt.V.str(" "), rt.method(through, "is_typed", [])]));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("E="), rt.method(a, "get_typed_builtin", [])]));
      rt.frameLine(27);
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
rt.registerScriptProps(__gd_d_Main, ["mod"], (o) => { const s = o as Main; return [s.mod]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["mod"], {}, (o) => { const s = o as Main; return [s.mod]; });
rt.registerMethodArities(__gd_d_Main, { "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
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

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

class Kid extends rt.GdScriptObject {
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

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Kid = rt.defineClass(Kid, (a) => new Kid(...a), (o) => o instanceof Kid);
rt.nameClass(__gd_d_Kid, "Kid");
rt.registerDictIdentity(__gd_d_Kid, "res://main.gd", "Kid", [], {}, (o) => { const s = o as Kid; return []; });
rt.registerNativeBase(__gd_d_Kid, "RefCounted");

class Big extends Kid {
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

  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Big = rt.defineClass(Big, (a) => new Big(...a), (o) => o instanceof Big);
rt.nameClass(__gd_d_Big, "Big");
rt.setClassBase(__gd_d_Big, rt.lookupClass("Kid") ?? null);
rt.registerDictIdentity(__gd_d_Big, "res://main.gd", "Big", [], {}, (o) => { const s = o as Big; return []; });

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
