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

  row(tag: rt.Variant, x: rt.Variant): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "row");
    try {
      tag = rt.paramSlot(tag, "String", 1, "row", this);
      rt.frameLine(10);
      print(rt.showArgs([tag, rt.V.str("|"), rt.isType(x, "Object"), rt.V.str("|"), rt.isType(x, "RefCounted"), rt.V.str("|"), rt.isType(x, "Resource"), rt.V.str("|"), rt.isType(x, "GDScript"), rt.V.str("|"), rt.isType(x, "Callable"), rt.V.str("|"), rt.isType(x, "Vector2"), rt.V.str("|"), rt.isType(x, "Array"), rt.V.str("|"), rt.typeOf(x)]));
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
      rt.frameLine(13);
      let o = rt.V.object(new Inner());
      rt.frameLine(14);
      this.row(rt.V.str("y01"), o);
      rt.frameLine(15);
      this.row(rt.V.str("y02"), rt.V.object(__gd_d_Inner));
      rt.frameLine(16);
      this.row(rt.V.str("y03"), rt.vector2New([rt.V.int(1), rt.V.int(2)]));
      rt.frameLine(17);
      this.row(rt.V.str("y04"), rt.V.array(rt.GArray.of([rt.V.int(1), rt.V.int(2)])));
      rt.frameLine(18);
      this.row(rt.V.str("y05"), rt.dictOf([[rt.V.int(1), rt.V.int(2)]]));
      rt.frameLine(19);
      this.row(rt.V.str("y06"), rt.bytesCtor([rt.V.array(rt.GArray.of([rt.V.int(1)]))]));
      rt.frameLine(20);
      this.row(rt.V.str("y07"), rt.V.str("x"));
      rt.frameLine(21);
      this.row(rt.V.str("y08"), rt.V.int(1));
      rt.frameLine(22);
      this.row(rt.V.str("y09"), rt.wrapValue(rt.attribute(o, "m")));
      rt.frameLine(23);
      this.row(rt.V.str("y10"), rt.callableCtor([]));
      rt.frameLine(24);
      this.row(rt.V.str("y11"), rt.V.nil());
      rt.frameLine(25);
      this.row(rt.V.str("y12"), rt.V.object(this));
      rt.frameLine(26);
      print(rt.showArgs([rt.V.str("y13|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "RefCounted"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Object"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Inner")]));
      rt.frameLine(27);
      print(rt.showArgs([rt.V.str("y14|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Resource"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "GDScript"), rt.V.str("|"), rt.isType(rt.method(rt.wrapValue(rt.attribute(o, "m")), "get_object", []), "Node")]));
      rt.frameLine(28);
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
      case "row": return rt.wrapValue(this.row(args[0] as rt.Variant, args[1] as rt.Variant));
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", [], {}, (o) => { const s = o as Main; return []; });
rt.registerMethodArities(__gd_d_Main, { "row": [2, 2], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Inner extends rt.GdScriptObject {
  declare v: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.v = rt.V.int(1);
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

  m(x: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "m");
    try {
      rt.frameLine(7);
      return x;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
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
rt.registerScriptProps(__gd_d_Inner, ["v"], (o) => { const s = o as Inner; return [s.v]; });
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", ["v"], {}, (o) => { const s = o as Inner; return [s.v]; });
rt.registerMethodArities(__gd_d_Inner, { "m": [1, 1] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
