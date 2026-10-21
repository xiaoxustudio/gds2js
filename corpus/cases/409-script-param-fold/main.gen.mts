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
      rt.frameLine(29);
      let o = rt.V.object(new Inner());
      rt.frameLine(30);
      print(rt.showArgs([rt.V.str("A|"), rt.method(o, "ti", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(o, "ti", [rt.V.bool(true)]), rt.V.str("|"), rt.method(o, "ti", [rt.V.bool(false)]), rt.V.str("|"), rt.method(o, "tf", [rt.V.int(1)]), rt.V.str("|"), rt.method(o, "tf", [rt.V.bool(true)]), rt.V.str("|"), rt.method(o, "tf", [rt.V.float(1.5)])]));
      rt.frameLine(31);
      print(rt.showArgs([rt.V.str("B|"), rt.method(o, "tb", [rt.V.int(1)]), rt.V.str("|"), rt.method(o, "tb", [rt.V.int(0)]), rt.V.str("|"), rt.method(o, "tb", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(o, "tb", [rt.V.float(0)]), rt.V.str("|"), rt.method(o, "ts", [rt.V.stringName("a")]), rt.V.str("|"), rt.method(o, "tsn", [rt.V.str("a")])]));
      rt.frameLine(32);
      print(rt.showArgs([rt.V.str("C|"), rt.method(o, "tv", [rt.vector2New([rt.V.int(1), rt.V.int(2)])]), rt.V.str("|"), rt.method(o, "freec", [rt.V.str("anything")]), rt.V.str("|"), rt.method(o, "freec", [rt.V.array(rt.GArray.of([rt.V.int(1)]))]), rt.V.str("|"), rt.method(o, "dflt", []), rt.V.str("|"), rt.method(o, "dflt", [rt.V.int(2)]), rt.V.str("|"), rt.method(o, "ti", [rt.V.int(7)])]));
      rt.frameLine(33);
      let p = rt.V.object(new Inner());
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("D|"), rt.method(p, "ti", [rt.V.float(1.5)]), rt.V.str("|"), rt.method(p, "tf", [rt.V.int(1)]), rt.V.str("|"), rt.method(p, "tb", [rt.V.int(1)]), rt.V.str("|"), rt.method(p, "ts", [rt.V.stringName("a")]), rt.V.str("|"), rt.method(p, "tsn", [rt.V.str("a")]), rt.V.str("|"), rt.method(p, "tv", [rt.vector2New([rt.V.int(3), rt.V.int(4)])])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("E|"), rt.typeOf(rt.method(p, "ti", [rt.V.bool(true)])), rt.V.str(" "), rt.typeOf(rt.method(p, "tf", [rt.V.int(1)])), rt.V.str(" "), rt.typeOf(rt.method(p, "tb", [rt.V.int(1)])), rt.V.str(" "), rt.typeOf(rt.method(p, "ts", [rt.V.stringName("a")])), rt.V.str(" "), rt.typeOf(rt.method(p, "tsn", [rt.V.str("a")]))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("F|"), rt.strBuiltin([rt.method(p, "dflt", [])]), rt.V.str("|"), rt.strBuiltin([rt.method(o, "ti", [rt.V.float((-1.7))])]), rt.V.str("|"), rt.strBuiltin([rt.method(o, "tf", [rt.V.int((-2))])]), rt.V.str("|"), rt.strBuiltin([rt.method(o, "tb", [rt.V.int((-1))])]), rt.V.str("|"), rt.strBuiltin([rt.method(o, "tb", [rt.V.float(0.5)])])]));
      rt.frameLine(37);
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

  ti(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ti");
    try {
      a = rt.paramSlot(a, "int", 1, "ti", this);
      rt.frameLine(5);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tf(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tf");
    try {
      a = rt.paramSlot(a, "float", 1, "tf", this);
      rt.frameLine(8);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.float(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tb(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tb");
    try {
      a = rt.paramSlot(a, "bool", 1, "tb", this);
      rt.frameLine(11);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.bool(false);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  ts(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ts");
    try {
      a = rt.paramSlot(a, "String", 1, "ts", this);
      rt.frameLine(14);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.str("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tsn(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tsn");
    try {
      a = rt.paramSlot(a, "StringName", 1, "tsn", this);
      rt.frameLine(17);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.stringName("");
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  tv(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "tv");
    try {
      a = rt.paramSlot(a, "Vector2", 1, "tv", this);
      rt.frameLine(20);
      return rt.wrapValue(rt.attribute(a, "x"));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.float(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  freec(a: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "freec");
    try {
      rt.frameLine(23);
      return rt.V.int(7);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  dflt(a: rt.Variant = rt.toInt(rt.V.int(3))): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "dflt");
    try {
      a = rt.paramSlot(a, "int", 1, "dflt", this);
      rt.frameLine(26);
      return a;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.int(0);
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "ti": return rt.wrapValue(this.ti(args[0] as rt.Variant));
      case "tf": return rt.wrapValue(this.tf(args[0] as rt.Variant));
      case "tb": return rt.wrapValue(this.tb(args[0] as rt.Variant));
      case "ts": return rt.wrapValue(this.ts(args[0] as rt.Variant));
      case "tsn": return rt.wrapValue(this.tsn(args[0] as rt.Variant));
      case "tv": return rt.wrapValue(this.tv(args[0] as rt.Variant));
      case "freec": return rt.wrapValue(this.freec(args[0] as rt.Variant));
      case "dflt": return rt.wrapValue(this.dflt(args.length > 0 ? (args[0] as rt.Variant) : undefined));
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Inner = rt.defineClass(Inner, () => new Inner(), (o) => o instanceof Inner);
rt.nameClass(__gd_d_Inner, "Inner");
rt.registerDictIdentity(__gd_d_Inner, "res://main.gd", "Inner", [], {}, (o) => { const s = o as Inner; return []; });
rt.registerMethodArities(__gd_d_Inner, { "ti": [1, 1], "tf": [1, 1], "tb": [1, 1], "ts": [1, 1], "tsn": [1, 1], "tv": [1, 1], "freec": [1, 1], "dflt": [0, 1] });
rt.registerMethodParams(__gd_d_Inner, { "ti": ["int"], "tf": ["float"], "tb": ["bool"], "ts": ["String"], "tsn": ["StringName"], "tv": ["Vector2"], "dflt": ["int"] });
rt.registerNativeBase(__gd_d_Inner, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
