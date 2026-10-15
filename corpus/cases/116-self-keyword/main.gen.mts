// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  declare outervar: rt.Variant;
  declare outer_self: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(22);
      this.outervar = rt.V.int(7);
      rt.frameLine(23);
      this.outer_self = rt.V.object(this);
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

  useobj(o: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "useobj");
    try {
      rt.frameLine(26);
      return rt.method(o, "getn", []);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  hello(): void {
    const __gd_frame = rt.frameEnter("res://main.gd", "hello");
    try {
      rt.frameLine(29);
      print(rt.showArgs([rt.V.str("s12 hello via self call")]));
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
      rt.frameLine(32);
      let b = rt.V.object(new Box());
      rt.frameLine(33);
      print(rt.showArgs([rt.V.str("s1 "), rt.method(b, "readself", []), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "n"))]));
      rt.frameLine(34);
      print(rt.showArgs([rt.V.str("s2 "), rt.method(b, "bump", []), rt.V.str(" "), rt.method(b, "readself", [])]));
      rt.frameLine(35);
      print(rt.showArgs([rt.V.str("s3 "), rt.method(b, "setn", [rt.V.int(10)]), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "n"))]));
      rt.frameLine(36);
      print(rt.showArgs([rt.V.str("s4 "), this.useobj(b)]));
      rt.frameLine(37);
      print(rt.showArgs([rt.V.str("s5 "), rt.ops.eq(rt.method(b, "me", []), b), rt.V.str(" "), rt.method(b, "sameother", [b])]));
      rt.frameLine(38);
      print(rt.showArgs([rt.V.str("s6 "), rt.method(b, "ty", []), rt.V.str(" "), rt.typeOf(b)]));
      rt.frameLine(39);
      print(rt.showArgs([rt.V.str("s7 "), rt.typeOf(rt.V.object(this)), rt.V.str(" "), rt.ops.eq(rt.V.object(this), rt.V.nil())]));
      rt.frameLine(40);
      print(rt.showArgs([rt.V.str("s8 "), this.outervar]));
      rt.frameLine(41);
      rt.frameLine(41);
      this.outervar = rt.V.int(42);
      rt.frameLine(42);
      print(rt.showArgs([rt.V.str("s9 "), this.outervar, rt.V.str(" "), this.outervar]));
      rt.frameLine(43);
      rt.frameLine(43);
      this.outervar = rt.ops.add(this.outervar, rt.V.int(8));
      rt.frameLine(44);
      print(rt.showArgs([rt.V.str("s10 "), this.outervar]));
      rt.frameLine(45);
      print(rt.showArgs([rt.V.str("s11 "), rt.ops.eq(this.outer_self, rt.V.object(this))]));
      rt.frameLine(46);
      this.hello();
      rt.frameLine(47);
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
      case "useobj": return rt.wrapValue(this.useobj(args[0] as rt.Variant));
      case "hello": return rt.wrapValue(this.hello());
      case "_initialize": return rt.wrapValue(this.__gd__initialize());
      default: return super.__gdDispatch(name, args);
    }
  }

}

const __gd_d_Main = rt.defineClass(Main, () => new Main(), (o) => o instanceof Main);
rt.registerScriptProps(__gd_d_Main, ["outervar","outer_self"], (o) => { const s = o as Main; return [s.outervar, s.outer_self]; });
rt.registerDictIdentity(__gd_d_Main, "res://main.gd", "", ["outervar","outer_self"], {}, (o) => { const s = o as Main; return [s.outervar, s.outer_self]; });
rt.registerMethodArities(__gd_d_Main, { "useobj": [1, 1], "hello": [0, 0], "_initialize": [0, 0] });
rt.registerNativeBase(__gd_d_Main, "SceneTree");
rt.registerScriptLabel(__gd_d_Main, "main.gd");
rt.registerScript("res://main.gd", __gd_d_Main);
class Box extends rt.GdScriptObject {
  declare n: rt.Variant;

  __gd_fields__() {
    const __gd_frame = rt.frameEnter("res://main.gd", "@implicit_new");
    try {
      rt.frameLine(4);
      this.n = rt.V.int(1);
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

  getn(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "getn");
    try {
      rt.frameLine(6);
      return this.n;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  readself(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "readself");
    try {
      rt.frameLine(8);
      return this.n;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  bump(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "bump");
    try {
      rt.frameLine(10);
      rt.frameLine(10);
      this.n = rt.ops.add(this.n, rt.V.int(1));
      rt.frameLine(11);
      return this.n;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  setn(v: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "setn");
    try {
      rt.frameLine(13);
      rt.frameLine(13);
      this.n = v;
      rt.frameLine(14);
      return this.n;
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  me(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "me");
    try {
      rt.frameLine(16);
      return rt.V.object(this);
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  sameother(o: rt.Variant): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "sameother");
    try {
      rt.frameLine(18);
      return rt.ops.eq(o, rt.V.object(this));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  ty(): rt.Variant {
    const __gd_frame = rt.frameEnter("res://main.gd", "ty");
    try {
      rt.frameLine(20);
      return rt.typeOf(rt.V.object(this));
    } catch (__gd_err) {
      rt.gdFunctionError(__gd_err);
      return rt.V.nil();
    } finally {
      rt.frameExit(__gd_frame);
    }
  }
  
  override __gdDispatch(name: string, args: rt.Variant[]): rt.Variant | null {
    switch (name) {
      case "getn": return rt.wrapValue(this.getn());
      case "readself": return rt.wrapValue(this.readself());
      case "bump": return rt.wrapValue(this.bump());
      case "setn": return rt.wrapValue(this.setn(args[0] as rt.Variant));
      case "me": return rt.wrapValue(this.me());
      case "sameother": return rt.wrapValue(this.sameother(args[0] as rt.Variant));
      case "ty": return rt.wrapValue(this.ty());
      default: return super.__gdDispatch(name, args);
    }
  }

}
const __gd_d_Box = rt.defineClass(Box, () => new Box(), (o) => o instanceof Box);
rt.nameClass(__gd_d_Box, "Box");
rt.registerScriptProps(__gd_d_Box, ["n"], (o) => { const s = o as Box; return [s.n]; });
rt.registerDictIdentity(__gd_d_Box, "res://main.gd", "Box", ["n"], {}, (o) => { const s = o as Box; return [s.n]; });
rt.registerMethodArities(__gd_d_Box, { "getn": [0, 0], "readself": [0, 0], "bump": [0, 0], "setn": [1, 1], "me": [0, 0], "sameother": [1, 1], "ty": [0, 0] });
rt.registerNativeBase(__gd_d_Box, "RefCounted");

const __gd_entry = new Main();
try {
  await __gd_entry.run();
} catch (__gd_e) {
  rt.reportRunFailure(__gd_e);
}
