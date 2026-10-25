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
      rt.frameLine(27);
      let a = rt.V.object(new Bare());
      rt.frameLine(28);
      print(rt.showArgs([rt.V.str("n4 empty="), rt.typeOf(rt.V.object(new Empty())), rt.V.str(" bare="), rt.isType(a, "Bare")]));
      rt.frameLine(29);
      let f = rt.V.object(new Forward(rt.V.int(9)));
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("n5 "), rt.wrapValue(rt.attribute(f, "n")), rt.V.str(" "), rt.wrapValue(rt.attribute(f, "k"))]));
      rt.frameLine(31);
      let r = rt.V.object(new Right(rt.V.int(4)));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("n6 "), rt.wrapValue(rt.attribute(r, "n"))]));
      rt.frameLine(33);
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
class Bare extends rt.GdScriptObject {
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

  _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      rt.frameLine(5);
      print(rt.showArgs([rt.V.str("n1 Bare._init")]));
      rt.frameLine(6);
      return;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Bare = rt.defineClass(Bare, (a) => new Bare(...a), (o) => o instanceof Bare);
rt.nameClass(__gd_d_Bare, "Bare");
rt.registerDictIdentity(__gd_d_Bare, "res://main.gd", "Bare", [], {}, (o) => { const s = o as Bare; return []; });
rt.registerNativeBase(__gd_d_Bare, "RefCounted");

class Empty extends Bare {
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
const __gd_d_Empty = rt.defineClass(Empty, (a) => new Empty(...a), (o) => o instanceof Empty);
rt.nameClass(__gd_d_Empty, "Empty");
rt.setClassBase(__gd_d_Empty, rt.lookupClass("Bare") ?? null);
rt.registerDictIdentity(__gd_d_Empty, "res://main.gd", "Empty", [], {}, (o) => { const s = o as Empty; return []; });

class NeedsArg extends rt.GdScriptObject {
  constructor(...__gd_new_args: rt.Variant[]) {
    super();
    this.__gd_fields__();
    if (!rt.bareConstruction()) this.__gdDispatch("_init", __gd_new_args);
  }

  declare n: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(12);
      this.n = rt.toInt(rt.V.int(0));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }

  _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      const p_n = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
      rt.frameLine(15);
      this.n = rt.toInt(p_n);
      rt.frameLine(16);
      print(rt.showArgs([rt.V.str("n2 NeedsArg._init "), p_n]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_NeedsArg = rt.defineClass(NeedsArg, (a) => new NeedsArg(...a), (o) => o instanceof NeedsArg);
rt.nameClass(__gd_d_NeedsArg, "NeedsArg");
rt.registerFieldTypes(__gd_d_NeedsArg, {"n": "int"});
rt.registerScriptProps(__gd_d_NeedsArg, ["n"], (o) => { const s = o as NeedsArg; return [s.n]; });
rt.registerDictIdentity(__gd_d_NeedsArg, "res://main.gd", "NeedsArg", ["n"], {}, (o) => { const s = o as NeedsArg; return [s.n]; });
rt.registerCtorArities(__gd_d_NeedsArg, [1, 1]);
rt.registerNativeBase(__gd_d_NeedsArg, "RefCounted");

class Forward extends NeedsArg {
  declare k: rt.Variant;

  override __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      super.__gd_fields__();
      rt.frameLine(19);
      this.k = rt.toInt(rt.V.int(3));
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
const __gd_d_Forward = rt.defineClass(Forward, (a) => new Forward(...a), (o) => o instanceof Forward);
rt.nameClass(__gd_d_Forward, "Forward");
rt.setClassBase(__gd_d_Forward, rt.lookupClass("NeedsArg") ?? null);
rt.registerFieldTypes(__gd_d_Forward, {"k": "int"});
rt.registerScriptProps(__gd_d_Forward, ["k"], (o) => { const s = o as Forward; return [s.k]; });
rt.registerDictIdentity(__gd_d_Forward, "res://main.gd", "Forward", ["k"], {}, (o) => { const s = o as Forward; return [s.k]; });

class Right extends NeedsArg {
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

  override _init(...__gd_init_args: rt.Variant[]): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "_init");
    try {
      const p_x = rt.paramSlot(__gd_init_args[0] as rt.Variant, "int", 1, "_init", this);
      rt.frameLine(23);
      super._init(p_x);
      rt.frameLine(24);
      print(rt.showArgs([rt.V.str("n3 Right.after-super "), p_x]));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return;
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "_init": return rt.wrapValue(this._init(...args));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Right = rt.defineClass(Right, (a) => new Right(...a), (o) => o instanceof Right);
rt.nameClass(__gd_d_Right, "Right");
rt.setClassBase(__gd_d_Right, rt.lookupClass("NeedsArg") ?? null);
rt.registerDictIdentity(__gd_d_Right, "res://main.gd", "Right", [], {}, (o) => { const s = o as Right; return []; });
rt.registerCtorArities(__gd_d_Right, [1, 1]);

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
