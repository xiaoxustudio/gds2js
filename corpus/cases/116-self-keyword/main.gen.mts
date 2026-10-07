// 由 gds2js 从 main.gd 编译生成 —— 不要手改。

import * as rt from "../../../packages/runtime/src/runtime/index";
import { print, printJoined, printRaw, printErr, printVerbose, printRich, printDebug, SceneTree } from "../../../tools/harness/scene-tree";

export class Main extends SceneTree {
  outervar = rt.V.int(7);
  outer_self = rt.V.object(this);

  useobj(o: rt.Variant): rt.Variant {
    return rt.method(o, "getn", []);
  }
  
  hello(): void {
    print(rt.showArgs([rt.V.str("s12 hello via self call")]));
  }
  
    override _initialize(): Promise<void> { return this.__gd__initialize(); }
  async __gd__initialize(): Promise<void> {
    let b = rt.V.object(new Box());
    print(rt.showArgs([rt.V.str("s1 "), rt.method(b, "readself", []), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "n"))]));
    print(rt.showArgs([rt.V.str("s2 "), rt.method(b, "bump", []), rt.V.str(" "), rt.method(b, "readself", [])]));
    print(rt.showArgs([rt.V.str("s3 "), rt.method(b, "setn", [rt.V.int(10)]), rt.V.str(" "), rt.wrapValue(rt.attribute(b, "n"))]));
    print(rt.showArgs([rt.V.str("s4 "), this.useobj(b)]));
    print(rt.showArgs([rt.V.str("s5 "), rt.ops.eq(rt.method(b, "me", []), b), rt.V.str(" "), rt.method(b, "sameother", [b])]));
    print(rt.showArgs([rt.V.str("s6 "), rt.method(b, "ty", []), rt.V.str(" "), rt.typeOf(b)]));
    print(rt.showArgs([rt.V.str("s7 "), rt.typeOf(rt.V.object(this)), rt.V.str(" "), rt.ops.eq(rt.V.object(this), rt.V.nil())]));
    print(rt.showArgs([rt.V.str("s8 "), this.outervar]));
    this.outervar = rt.V.int(42);
    print(rt.showArgs([rt.V.str("s9 "), this.outervar, rt.V.str(" "), this.outervar]));
    this.outervar = rt.ops.add(this.outervar, rt.V.int(8));
    print(rt.showArgs([rt.V.str("s10 "), this.outervar]));
    print(rt.showArgs([rt.V.str("s11 "), rt.ops.eq(this.outer_self, rt.V.object(this))]));
    this.hello();
    this.quit();
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
  n = rt.V.int(1);

  getn(): rt.Variant {
    return this.n;
  }
  
  readself(): rt.Variant {
    return this.n;
  }
  
  bump(): rt.Variant {
    this.n = rt.ops.add(this.n, rt.V.int(1));
    return this.n;
  }
  
  setn(v: rt.Variant): rt.Variant {
    this.n = v;
    return this.n;
  }
  
  me(): rt.Variant {
    return rt.V.object(this);
  }
  
  sameother(o: rt.Variant): rt.Variant {
    return rt.ops.eq(o, rt.V.object(this));
  }
  
  ty(): rt.Variant {
    return rt.typeOf(rt.V.object(this));
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
